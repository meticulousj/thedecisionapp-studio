import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw userErr;
    const user = userData.user;
    if (!user?.email) throw new Error("Not authenticated");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let subscribed = false;
    let subscriptionEnd: string | null = null;
    let stripeCustomerId: string | null = null;

    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id;
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      });
      if (subs.data.length > 0) {
        subscribed = true;
        subscriptionEnd = new Date(subs.data[0].current_period_end * 1000).toISOString();
      }
    }

    await supabase.from("subscribers").upsert(
      {
        user_id: user.id,
        email: user.email,
        stripe_customer_id: stripeCustomerId,
        subscribed,
        subscription_tier: subscribed ? "Pro" : null,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    return new Response(
      JSON.stringify({ subscribed, subscription_tier: subscribed ? "Pro" : null, subscription_end: subscriptionEnd }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg, subscribed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
