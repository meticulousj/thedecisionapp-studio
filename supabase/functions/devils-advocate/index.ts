const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { decision, context } = await req.json();
    if (!decision || typeof decision !== "string" || decision.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Please provide a decision (at least 10 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a sharp, intellectually honest Devil's Advocate for high-stakes decisions.
Your job is NOT to be contrarian for sport — it is to expose the strongest counter-arguments,
hidden assumptions, and likely failure modes a smart operator might miss.
Be specific, concrete, and uncomfortable. No platitudes. No hedging.`;

    const userPrompt = `Decision under consideration:
"""
${decision}
"""${context ? `\n\nAdditional context:\n"""\n${context}\n"""` : ""}

Generate:
- 5 sharp counter-arguments (the strongest case AGAINST this decision)
- 5 hidden assumptions the decision-maker is likely making without realizing it
- 3 questions they should be able to answer before proceeding`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "devils_advocate_analysis",
            description: "Return structured Devil's Advocate analysis.",
            parameters: {
              type: "object",
              properties: {
                counter_arguments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Short headline of the counter-argument" },
                      reasoning: { type: "string", description: "2-3 sentences explaining why this matters" },
                      severity: { type: "string", enum: ["low", "medium", "high"] },
                    },
                    required: ["title", "reasoning", "severity"],
                    additionalProperties: false,
                  },
                },
                hidden_assumptions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      assumption: { type: "string", description: "The unspoken assumption" },
                      risk_if_wrong: { type: "string", description: "What happens if this assumption is false" },
                    },
                    required: ["assumption", "risk_if_wrong"],
                    additionalProperties: false,
                  },
                },
                questions_to_answer: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["counter_arguments", "hidden_assumptions", "questions_to_answer"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "devils_advocate_analysis" } },
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
      return new Response(JSON.stringify({ error: "AI did not return structured analysis" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const analysis = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("devils-advocate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
