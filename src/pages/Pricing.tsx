import { Link } from "react-router-dom";
import { PublicLayout, usePageMeta } from "@/components/PublicLayout";

const FREE = [
  "All six decision frameworks",
  "Up to 5 entries per tool",
  "3 AI runs per month (Devil's Advocate, Pre-Mortem, Assumption Extractor)",
  "Local storage on this device",
];
const PRO = [
  "Unlimited entries in every tool",
  "Unlimited AI runs",
  "Cloud sync across phone and laptop",
  "One-click export to PDF, Markdown, and Notion",
  "Stakes Mode: social, financial, and reputation lock-in",
  "Priority support",
];

export default function Pricing() {
  usePageMeta(
    "Pricing — Decision Suite",
    "Decision Suite is free to start. Pro unlocks unlimited entries, unlimited AI decision tools, cloud sync, and export for $9/month.",
    "/pricing"
  );

  const card = (title: string, price: string, per: string, features: string[], cta: { to: string; label: string }, highlight: boolean) => (
    <div className="tpl-card" style={{ cursor: "default", border: highlight ? "1px solid var(--gold)" : undefined, padding: 32 }}>
      <div className="tpl-card-name" style={{ fontSize: 20 }}>{title}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text)", margin: "12px 0 4px" }}>
        {price}<span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 400 }}> {per}</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {features.map(f => (
          <li key={f} style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
            <span style={{ color: "var(--gold)", marginRight: 8 }}>✓</span>{f}
          </li>
        ))}
      </ul>
      <Link to={cta.to} style={{ display: "block", textAlign: "center", background: highlight ? "var(--gold)" : "var(--bg3)", border: highlight ? "none" : "1px solid var(--border2)", color: highlight ? "#0d0d0d" : "var(--text)", padding: "12px 0", borderRadius: 10, fontFamily: "'Azeret Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
        {cta.label}
      </Link>
    </div>
  );

  return (
    <PublicLayout>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div className="tpl-ey">Pricing</div>
        <h1 className="tpl-title">Simple, honest<span>.</span> Pricing</h1>
        <p className="tpl-sub" style={{ margin: "0 auto" }}>Start free. Upgrade when your decisions outgrow five entries.</p>
      </div>

      <div className="tpl-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", maxWidth: 720, margin: "0 auto" }}>
        {card("Free", "$0", "forever", FREE, { to: "/", label: "Start free" }, false)}
        {card("Pro", "$9", "/month", PRO, { to: "/", label: "Go Pro" }, true)}
      </div>

      <section className="tpl-a-section" style={{ maxWidth: 720, margin: "40px auto 0" }}>
        <h2 className="tpl-a-slbl">FAQ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { q: "Can I cancel anytime?", a: "Yes. Cancel, downgrade, or manage a failed payment from your account — access updates immediately." },
            { q: "What happens to my data on the free plan?", a: "Free data stays in your browser's local storage. Pro syncs it securely to the cloud so it follows you across devices." },
            { q: "Do I need an account to use the frameworks?", a: "No. All six public frameworks — RICE, Eisenhower, SWOT, Six Thinking Hats, ICE, and PDCA — work without signing up." },
          ].map(f => (
            <details key={f.q} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
              <summary style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}>{f.q}</summary>
              <p style={{ marginTop: 8, fontSize: 12, color: "var(--text2)", lineHeight: 1.7 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
