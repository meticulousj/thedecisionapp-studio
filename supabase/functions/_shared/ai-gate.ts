// Shared Pro-gating + free-trial enforcement for AI endpoints.
// Free users get FREE_LIMIT runs per UTC calendar month, total across all AI tools.
// Pro subscribers (subscribers.subscribed = true) are unlimited.
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const FREE_LIMIT = 3;

export type GateOk = {
  ok: true;
  userId: string;
  isPro: boolean;
  newCount: number;
  monthlyLimit: number;
};
export type GateFail = { ok: false; response: Response };

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Authenticates the caller, checks Pro status, and (for non-Pro) consumes
 * one free run from the monthly quota. On failure returns a ready Response.
 */
export async function gateAiRun(req: Request): Promise<GateOk | GateFail> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, response: json({ error: "Sign in to use AI features." }, 401) };
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) {
    return { ok: false, response: json({ error: "Invalid session. Please sign in again." }, 401) };
  }
  const userId = userData.user.id;

  // Pro status (best-effort; default false on error)
  let isPro = false;
  const { data: sub } = await admin
    .from("subscribers")
    .select("subscribed")
    .eq("user_id", userId)
    .maybeSingle();
  if (sub?.subscribed) isPro = true;

  const { data: rpc, error: rpcErr } = await admin.rpc("consume_ai_run", {
    _user_id: userId,
    _is_pro: isPro,
    _limit: FREE_LIMIT,
  });

  if (rpcErr) {
    const msg = rpcErr.message || "";
    if (msg.includes("ai_limit_reached")) {
      return {
        ok: false,
        response: json(
          {
            error: "free_limit_reached",
            message: `You've used your ${FREE_LIMIT} free AI runs this month. Upgrade to Pro for unlimited.`,
            limit: FREE_LIMIT,
            isPro: false,
          },
          402,
        ),
      };
    }
    console.error("consume_ai_run error:", rpcErr);
    return { ok: false, response: json({ error: "Usage check failed." }, 500) };
  }

  const row = Array.isArray(rpc) ? rpc[0] : rpc;
  return {
    ok: true,
    userId,
    isPro,
    newCount: Number(row?.new_count ?? 0),
    monthlyLimit: Number(row?.monthly_limit ?? FREE_LIMIT),
  };
}
