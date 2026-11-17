import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type Sub = { subscribed: boolean; tier: string | null; end: string | null };

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

// Keep context identity independent of the provider's Fast Refresh lifecycle.
export const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth outside AuthProvider");
  return context;
}