import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthContext } from "@/contexts/auth-context";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: async () => ({ data: { session: null } }),
    },
  },
}));
vi.mock("@/integrations/lovable", () => ({ lovable: {} }));
vi.mock("@/lib/syncedStorage", () => ({
  setSyncContext: vi.fn(), pullFromCloud: vi.fn(), pushAllToCloud: vi.fn(),
}));

function Consumer() {
  const auth = useAuth();
  return <output>{auth.loading ? "Loading" : auth.user ? "Signed in" : "Signed out"}</output>;
}

describe("auth context stability", () => {
  it("keeps the same context object when the provider module is re-evaluated", async () => {
    vi.resetModules();
    const reloaded = await import("@/contexts/AuthContext");
    const stable = await import("@/contexts/auth-context");
    expect(stable.AuthContext).not.toBe(AuthContext);
    // A provider-only refresh must reuse its dependency's context.
    const again = await import("@/contexts/auth-context");
    expect(again.AuthContext).toBe(stable.AuthContext);
    expect(reloaded.useAuth).toBe(stable.useAuth);
  });

  it("provides auth state to consumers without a missing-provider crash", async () => {
    render(<AuthProvider><Consumer /></AuthProvider>);
    expect(await screen.findByText("Signed out")).toBeInTheDocument();
  });
});