import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useAuth as stableUseAuth } from "@/contexts/auth-context";

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
  it("uses the stable context hook through the existing public import", () => {
    expect(useAuth).toBe(stableUseAuth);
  });

  it("provides auth state to consumers without a missing-provider crash", async () => {
    render(<AuthProvider><Consumer /></AuthProvider>);
    expect(await screen.findByText("Signed out")).toBeInTheDocument();
  });
});