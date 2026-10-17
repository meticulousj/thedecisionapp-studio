import { Link } from "react-router-dom";
import { PublicLayout, usePageMeta } from "@/components/PublicLayout";
import { TEMPLATES } from "@/lib/templates/data";

const TOOLS = [
  { icon: "🧭", name: "Decision Clarity", desc: "Structure any decision into options, criteria, and a defensible call." },
  { icon: "🕳️", name: "Assumption Audit", desc: "Surface the hidden assumptions your plan quietly depends on." },
  { icon: "💀", name: "Pre-Mortem Studio", desc: "Imagine the failure first, then engineer it out of the plan." },
  { icon: "📜", name: "Commitment Ledger", desc: "Track promises with stakes — social, financial, reputation." },
  { icon: "📄", name: "One-Page OS", desc: "Your goals, principles, and priorities on a single page." },
  { icon: "😈", name: "AI Devil's Advocate", desc: "AI-generated counter-arguments and blind spots for any decision." },
];

export default function Landing() {
  usePageMeta(
    "Decision Suite — Think Better, Decide Faster",
    "Free interactive decision tools: RICE, SWOT, Eisenhower, pre-mortems, assumption audits, and commitment tracking. No signup to start.",
    "/landing"
  );

  return (
    <PublicLayout>
      <section style={{ textAlign: "center", padding: "40px 0 56px" }}>
        <div className="tpl-ey">Decision Suite Studio</div>
        <h1 className="tpl-title" style={{ maxWidth: 640, margin: "0 auto 12px" }}>
          Think better.<span> Decide faster.</span>
        </h1>
        <p className="tpl-sub" style={{ margin: "0 auto 28px" }}>
          A suite of interactive tools for people who make hard calls: prioritization frameworks, pre-mortems, assumption audits, and commitment tracking — free to start, no signup required.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/frameworks" style={{ background: "var(--gold)", color: "#0d0d0d", padding: "12px 26px", borderRadius: 10, fontFamily: "'Azeret Mono',monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
            Try a free framework
          </Link>
          <Link to="/" style={{ border: "1px solid var(--border2)", color: "var(--text)", padding: "12px 26px", borderRadius: 10, fontFamily: "'Azeret Mono',monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", textDecoration: "none" }}>
            Open the app
          </Link>
        </div>
      </section>

      <section className="tpl-a-section">
        <h2 className="tpl-a-slbl">The toolkit</h2>
        <div className="tpl-grid">
          {TOOLS.map(t => (
            <div key={t.name} className="tpl-card" style={{ cursor: "default" }}>
              <div className="tpl-card-icon">{t.icon}</div>
              <div className="tpl-card-name">{t.name}</div>
              <div className="tpl-card-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="tpl-a-section">
        <h2 className="tpl-a-slbl">Free decision frameworks</h2>
        <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.8, marginBottom: 20 }}>
          Six battle-tested frameworks — each with a guide, worked example, and a working calculator in your browser.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {TEMPLATES.map(t => (
            <Link key={t.id} to={`/frameworks/${t.slug}`} className="tpl-dim" style={{ textDecoration: "none", padding: "8px 14px", fontSize: 11 }}>
              {t.icon} {t.name}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 32, padding: 28, background: "var(--bg3)", border: "1px solid var(--gold)", borderRadius: 12, textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
          Go Pro for unlimited everything
        </h2>
        <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
          Unlimited entries, AI tools, cloud sync across devices, and one-click export.
        </p>
        <Link to="/pricing" style={{ display: "inline-block", background: "var(--gold)", color: "#0d0d0d", padding: "10px 22px", borderRadius: 8, fontFamily: "'Azeret Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
          See pricing
        </Link>
      </section>
    </PublicLayout>
  );
}
