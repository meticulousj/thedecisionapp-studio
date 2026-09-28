import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setSyncContext, pullFromCloud, pushAllToCloud } from "@/lib/syncedStorage";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

type Sub = { subscribed: boolean; tier: string | null; end: string | null };

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  sub: Sub;
  signInEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: (showFeedback?: boolean) => Promise<void>;
  startCheckout: () => Promise<void>;
  openPortal: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Sub>({ subscribed: false, tier: null, end: null });
  const lastUid = useRef<string | null>(null);

  // Bootstrap auth — listener FIRST, then getSession.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshSubscription = async (showFeedback = false) => {
    if (!session) {
      setSub({ subscribed: false, tier: null, end: null });
      setSyncContext({ enabled: false, userId: null });
      return;
    }
    let syncing = false;
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      const next: Sub = {
        subscribed: !!data?.subscribed,
        tier: data?.subscription_tier ?? null,
        end: data?.subscription_end ?? null,
      };
      setSub(next);
      setSyncContext({ enabled: next.subscribed, userId: user?.id ?? null });
      if (next.subscribed && user?.id) {
        syncing = true;
        // first sync on login: pull from cloud, then push any local-only data
        const changed = await pullFromCloud(user.id);
        await pushAllToCloud(user.id);
        if (changed) window.dispatchEvent(new Event("sync:reloaded"));
        if (changed || showFeedback) toast.success("Cloud sync complete", { description: "Your latest saved work is available across devices." });
      } else if (showFeedback) {
        toast("Status updated", { description: "Free accounts save on this device only." });
      }
    } catch (e) {
      console.warn("[auth] refresh sub failed", e);
      if (syncing || showFeedback) toast.error(syncing ? "Cloud sync failed" : "Could not refresh status", { description: "Your work on this device is still here. Try again shortly." });
    }
  };

  // When user changes, recompute subscription
  useEffect(() => {
    if (!session) {
      setSub({ subscribed: false, tier: null, end: null });
      setSyncContext({ enabled: false, userId: null });
      lastUid.current = null;
      return;
    }
    if (user?.id !== lastUid.current) {
      lastUid.current = user?.id ?? null;
      refreshSubscription();
    }
    const i = setInterval(refreshSubscription, 60_000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, user?.id]);

  const signInEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signUpEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message };
  };

  const signInGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      alert("Google sign-in failed: " + (result.error.message || "unknown error"));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSyncContext({ enabled: false, userId: null });
  };

  const startCheckout = async () => {
    const { data, error } = await supabase.functions.invoke("create-checkout");
    if (error || !data?.url) {
      alert("Could not start checkout: " + (error?.message || "unknown"));
      return;
    }
    window.open(data.url, "_blank");
  };

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error || !data?.url) {
      alert("Could not open portal: " + (error?.message || "unknown"));
      return;
    }
    window.open(data.url, "_blank");
  };

  return (
    <Ctx.Provider value={{ user, session, loading, sub, signInEmail, signUpEmail, signInGoogle, signOut, refreshSubscription, startCheckout, openPortal }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
