import { supabase } from "@/integrations/supabase/client";

// Keys that cloud-sync for Pro users (Commitment Ledger + One-Page OS + onboarding/personalization)
export const SYNCED_KEYS = [
  "commitment-ledger-entries",
  "opos-name", "opos-timeframe", "opos-priority", "opos-weekly", "opos-daily",
  "opos-rules", "opos-cadence", "opos-review-date", "opos-version", "opos-goals", "opos-energy",
  "ds-onboarded", "ds-user-name", "ds-user-goal", "ds-last-tool",
];

const isSynced = (k: string) => SYNCED_KEYS.includes(k) || k.startsWith("opos-") || k.startsWith("ds-");

let syncEnabled = false;
let userId: string | null = null;

export function setSyncContext(opts: { enabled: boolean; userId: string | null }) {
  syncEnabled = opts.enabled;
  userId = opts.userId;
}

const pending = new Map<string, ReturnType<typeof setTimeout>>();

function queueCloudWrite(key: string, value: string) {
  if (!syncEnabled || !userId) return;
  const existing = pending.get(key);
  if (existing) clearTimeout(existing);
  pending.set(
    key,
    setTimeout(async () => {
      pending.delete(key);
      try {
        let parsed: any;
        try { parsed = JSON.parse(value); } catch { parsed = value; }
        await supabase.from("user_state").upsert(
          { user_id: userId, key, value: parsed, updated_at: new Date().toISOString() },
          { onConflict: "user_id,key" }
        );
      } catch (e) {
        console.warn("[sync] upsert failed", key, e);
      }
    }, 600)
  );
}

export const storage = {
  get: (key: string) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch { return null; }
  },
  set: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch {}
    if (isSynced(key)) queueCloudWrite(key, value);
  },
};

// Pull all synced state from cloud → localStorage. Returns true if any change.
export async function pullFromCloud(uid: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("user_state")
      .select("key,value")
      .eq("user_id", uid);
    if (error) throw error;
    let changed = false;
    for (const row of data || []) {
      const stringified = typeof row.value === "string" ? row.value : JSON.stringify(row.value);
      const current = localStorage.getItem(row.key);
      if (current !== stringified) {
        localStorage.setItem(row.key, stringified);
        changed = true;
      }
    }
    return changed;
  } catch (e) {
    console.warn("[sync] pull failed", e);
    return false;
  }
}

// Push everything currently in localStorage up to the cloud (used right after upgrade/login).
export async function pushAllToCloud(uid: string): Promise<void> {
  const rows: { user_id: string; key: string; value: any }[] = [];
  for (const k of SYNCED_KEYS) {
    const raw = localStorage.getItem(k);
    if (raw == null) continue;
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = raw; }
    rows.push({ user_id: uid, key: k, value: parsed });
  }
  if (rows.length === 0) return;
  try {
    await supabase.from("user_state").upsert(rows, { onConflict: "user_id,key" });
  } catch (e) {
    console.warn("[sync] push failed", e);
  }
}
