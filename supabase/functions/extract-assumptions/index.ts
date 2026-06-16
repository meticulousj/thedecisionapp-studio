import { corsHeaders, gateAiRun } from "../_shared/ai-gate.ts";

const CONFIDENCE = ["low", "medium", "high"];
const RISK = ["low", "medium", "high"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const gate = await gateAiRun(req);
    if (!gate.ok) return gate.response;

    const { source } = await req.json();
    if (!source || typeof source !== "string" || source.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Paste at least 20 characters of content." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (source.length > 30000) {
      return new Response(JSON.stringify({ error: "Content too long (max ~30k chars)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert critical thinker analyzing a document, message thread, memo, or transcript.
Your job: extract the HIDDEN ASSUMPTIONS — beliefs the author is treating as true without justifying them.
Focus on load-bearing assumptions whose falsehood would unravel the argument or plan.
Avoid trivial observations. Be specific, quote-grounded, and uncomfortable.
For each assumption: state it crisply (1 sentence), quote or paraphrase the evidence in the source, explain why it's risky if wrong, rate the author's apparent confidence (low/medium/high) and the risk if wrong (low/medium/high), and suggest one test or question to validate it.
Return 5-10 assumptions. Also include a short overall "summary" (1-2 sentences) characterizing the thinking pattern.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Source:\n"""\n${source.trim()}\n"""\n\nExtract the hidden assumptions now.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_assumptions",
            description: "Return structured hidden assumptions.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                assumptions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      assumption: { type: "string", description: "The hidden assumption, 1 sentence" },
                      evidence: { type: "string", description: "Quote/paraphrase from the source that reveals it" },
                      risk_if_wrong: { type: "string", description: "What breaks if this is false" },
                      confidence: { type: "string", enum: CONFIDENCE, description: "How confident the author seems" },
                      risk: { type: "string", enum: RISK, description: "Severity if assumption is wrong" },
                      test: { type: "string", description: "One concrete way to test or validate it" },
                    },
                    required: ["assumption", "evidence", "risk_if_wrong", "confidence", "risk", "test"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["summary", "assumptions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_assumptions" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured assumptions" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    const assumptions = (parsed.assumptions || []).map((a: any) => ({
      assumption: String(a.assumption || "").trim(),
      evidence: String(a.evidence || "").trim(),
      risk_if_wrong: String(a.risk_if_wrong || "").trim(),
      confidence: CONFIDENCE.includes(a.confidence) ? a.confidence : "medium",
      risk: RISK.includes(a.risk) ? a.risk : "medium",
      test: String(a.test || "").trim(),
    })).filter((a: any) => a.assumption.length > 0);

    return new Response(JSON.stringify({ summary: String(parsed.summary || "").trim(), assumptions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-assumptions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
