import { corsHeaders, gateAiRun } from "../_shared/ai-gate.ts";

const CATS = ["execution", "market", "resource", "people", "timing", "external"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const gate = await gateAiRun(req);
    if (!gate.ok) return gate.response;

    const { mission, timeframe, obituary } = await req.json();
    if (!mission || typeof mission !== "string" || mission.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Please provide a mission (at least 5 characters)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert risk analyst running a Pre-Mortem (Gary Klein methodology).
The user has described a mission and (optionally) written an "obituary" imagining the project already failed.
Generate 6-10 concrete, specific failure modes that would plausibly kill this initiative.
Be specific and uncomfortable — avoid platitudes. Each failure mode is a short sentence describing what went wrong.
Categorize each failure into exactly one of: execution, market, resource, people, timing, external.
Rate probability (1=Unlikely, 2=Possible, 3=Likely, 4=Probable, 5=Near-certain) and impact (1=Negligible, 2=Minor, 3=Moderate, 4=Severe, 5=Fatal) on a 1-5 scale.`;

    const userPrompt = `Mission: """${mission}"""
Timeframe: ${timeframe || "unspecified"}
${obituary ? `\nObituary (imagined failure narrative):\n"""${obituary}"""` : ""}

Generate the failure modes now.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_failure_modes",
            description: "Return structured pre-mortem failure modes.",
            parameters: {
              type: "object",
              properties: {
                failures: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string", description: "Specific failure mode, 1 sentence" },
                      cat: { type: "string", enum: CATS },
                      prob: { type: "integer", minimum: 1, maximum: 5 },
                      impact: { type: "integer", minimum: 1, maximum: 5 },
                    },
                    required: ["text", "cat", "prob", "impact"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["failures"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_failure_modes" } },
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
      return new Response(JSON.stringify({ error: "AI did not return structured failure modes" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    const failures = (parsed.failures || []).map((f: any) => ({
      text: String(f.text || "").trim(),
      cat: CATS.includes(f.cat) ? f.cat : "execution",
      prob: Math.min(5, Math.max(1, Number(f.prob) || 3)),
      impact: Math.min(5, Math.max(1, Number(f.impact) || 3)),
    })).filter((f: any) => f.text.length > 0);

    return new Response(JSON.stringify({ failures }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("premortem-failures error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
