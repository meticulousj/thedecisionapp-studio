import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const css = `
.acct-btn{background:var(--bg3);border:1px solid var(--border2);border-radius:6px;height:32px;padding:0 12px;display:flex;align-items:center;gap:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--text);transition:all .15s;}
.acct-btn:hover{border-color:var(--gold);}
.acct-btn .pro{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:.14em;background:var(--gold);color:#1a1408;padding:2px 6px;border-radius:4px;font-weight:700;}
.acct-btn .free{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:.14em;color:var(--text2);}
.acct-pop{position:absolute;top:42px;right:0;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;width:280px;z-index:100;box-shadow:0 12px 32px rgba(0,0,0,.4);}
.acct-pop .em{font-size:13px;color:var(--text);margin-bottom:4px;word-break:break-all;}
.acct-pop .tier{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:.14em;color:var(--text2);margin-bottom:12px;}
.acct-pop .row{display:flex;flex-direction:column;gap:6px;}
.acct-pop button{background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:8px 10px;font-size:12px;color:var(--text);cursor:pointer;font-family:'DM Sans',sans-serif;text-align:left;}
.acct-pop button.gold{background:var(--gold);color:#1a1408;border-color:var(--gold);font-weight:600;}
.acct-pop button:hover{border-color:var(--gold);}
.acct-upsell{font-size:11px;color:var(--text2);background:var(--bg3);border:1px dashed var(--border2);border-radius:8px;padding:10px;margin-bottom:10px;line-height:1.45;}
.acct-upsell strong{color:var(--gold);}
.acct-wrap{position:relative;}
`;

export default function AccountButton() {
  const nav = useNavigate();
  const { user, sub, signOut, startCheckout, openPortal, refreshSubscription } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Refresh sub when returning from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setTimeout(refreshSubscription, 1500);
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [refreshSubscription]);

  if (!user) {
    return (
      <>
        <style>{css}</style>
        <button className="acct-btn" onClick={() => nav("/auth")}>
          <span className="free">SIGN IN</span>
        </button>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="acct-wrap" ref={ref}>
        <button className="acct-btn" onClick={() => setOpen(!open)}>
          {sub.subscribed ? <span className="pro">PRO</span> : <span className="free">FREE</span>}
          <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </span>
        </button>
        {open && (
          <div className="acct-pop">
            <div className="em">{user.email}</div>
            <div className="tier">{sub.subscribed ? `PRO · CLOUD SYNC ON` : "FREE · LOCAL ONLY"}</div>
            {!sub.subscribed && (
              <div className="acct-upsell">
                Upgrade to <strong>Pro ($9/mo)</strong> for cloud sync across phone & laptop, plus priority support.
              </div>
            )}
            <div className="row">
              {!sub.subscribed ? (
                <button className="gold" onClick={startCheckout}>Upgrade to Pro</button>
              ) : (
                <button onClick={openPortal}>Manage subscription</button>
              )}
              <button onClick={() => refreshSubscription(true)}>Refresh status</button>
              <button onClick={async () => { await signOut(); setOpen(false); }}>Sign out</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
