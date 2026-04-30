import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const css = `
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c0c0c;color:#f0f0f0;font-family:'DM Sans',sans-serif;padding:24px;}
.auth-card{width:100%;max-width:420px;background:#141414;border:1px solid #2a2a2a;border-radius:14px;padding:32px;}
.auth-eyebrow{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;}
.auth-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;letter-spacing:-.02em;margin-bottom:6px;}
.auth-title em{font-family:'Newsreader',serif;font-style:italic;font-weight:500;color:#c9a84c;}
.auth-sub{color:#888;font-size:14px;margin-bottom:22px;}
.auth-label{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#888;margin:14px 0 6px;}
.auth-input{width:100%;background:#1c1c1c;border:1px solid #333;border-radius:8px;padding:11px 12px;color:#f0f0f0;font-family:'DM Sans',sans-serif;font-size:14px;}
.auth-input:focus{outline:none;border-color:#c9a84c;}
.auth-btn{width:100%;background:#c9a84c;color:#1a1408;border:none;border-radius:8px;padding:12px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;margin-top:18px;}
.auth-btn:disabled{opacity:.5;cursor:not-allowed;}
.auth-google{width:100%;background:#1c1c1c;color:#f0f0f0;border:1px solid #333;border-radius:8px;padding:11px;font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;margin-top:10px;}
.auth-divider{display:flex;align-items:center;gap:10px;color:#444;font-size:11px;font-family:'Azeret Mono',monospace;margin:18px 0;letter-spacing:.14em;}
.auth-divider::before,.auth-divider::after{content:"";flex:1;height:1px;background:#2a2a2a;}
.auth-toggle{text-align:center;margin-top:16px;font-size:13px;color:#888;}
.auth-toggle button{background:none;border:none;color:#c9a84c;cursor:pointer;font-family:inherit;font-size:13px;padding:0;}
.auth-err{margin-top:12px;color:#e63946;font-size:12px;font-family:'Azeret Mono',monospace;letter-spacing:.05em;}
.auth-back{display:inline-block;margin-bottom:14px;color:#888;font-size:12px;text-decoration:none;font-family:'Azeret Mono',monospace;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;background:none;border:none;padding:0;}
`;

export default function Auth() {
  const nav = useNavigate();
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setInfo(null); setBusy(true);
    try {
      const r = mode === "signin" ? await signInEmail(email, pw) : await signUpEmail(email, pw);
      if (r.error) setErr(r.error);
      else if (mode === "signup") setInfo("Check your email to confirm your account, then sign in.");
      else nav("/");
    } finally { setBusy(false); }
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <div className="auth-card">
          <button className="auth-back" onClick={() => nav("/")}>← Back</button>
          <div className="auth-eyebrow">Decision Suite · {mode === "signin" ? "Sign in" : "Create account"}</div>
          <h1 className="auth-title">{mode === "signin" ? <>Welcome <em>back</em></> : <>Create your <em>account</em></>}</h1>
          <p className="auth-sub">Sign in to sync your Commitment Ledger and One-Page OS across devices with Pro.</p>

          <button className="auth-google" onClick={signInGoogle} disabled={busy}>Continue with Google</button>
          <div className="auth-divider">OR EMAIL</div>

          <form onSubmit={submit}>
            <div className="auth-label">Email</div>
            <input className="auth-input" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
            <div className="auth-label">Password</div>
            <input className="auth-input" type="password" required minLength={6} value={pw} onChange={(e)=>setPw(e.target.value)} />
            {err && <div className="auth-err">{err}</div>}
            {info && <div className="auth-err" style={{ color: "#52b788" }}>{info}</div>}
            <button className="auth-btn" type="submit" disabled={busy}>
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="auth-toggle">
            {mode === "signin" ? (
              <>No account? <button onClick={()=>{setMode("signup");setErr(null);}}>Create one</button></>
            ) : (
              <>Already have one? <button onClick={()=>{setMode("signin");setErr(null);}}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
