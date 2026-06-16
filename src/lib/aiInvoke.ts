import { supabase } from "@/integrations/supabase/client";

export type AiUsage = { count: number; limit: number; isPro: boolean };
export type AiError = {
  status: number;
  code?: "free_limit_reached" | "unauthorized" | "credits_exhausted" | "rate_limited" | "unknown";
  message: string;
  limit?: number;
};

/** Wraps supabase.functions.invoke and parses error bodies (including 402 free-limit). */
export async function invokeAi<T = any>(
  name: string,
  body: Record<string, unknown>,
): Promise<{ data: (T & { usage?: AiUsage }) | null; error: AiError | null }> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return { data: data as any, error: null };

  // Try to parse the error response body
  let parsed: any = null;
  const ctx: any = (error as any).context;
  try {
    if (ctx?.response && typeof ctx.response.json === "function") {
      parsed = await ctx.response.clone().json();
    } else if (ctx?.body) {
      parsed = typeof ctx.body === "string" ? JSON.parse(ctx.body) : ctx.body;
    }
  } catch {
    /* swallow */
  }

  const status = ctx?.response?.status ?? (error as any)?.status ?? 500;
  let code: AiError["code"] = "unknown";
  if (status === 401) code = "unauthorized";
  else if (status === 429) code = "rate_limited";
  else if (status === 402) {
    code = parsed?.error === "free_limit_reached" ? "free_limit_reached" : "credits_exhausted";
  }

  return {
    data: null,
    error: {
      status,
      code,
      message: parsed?.message || parsed?.error || error.message || "AI request failed",
      limit: parsed?.limit,
    },
  };
}
