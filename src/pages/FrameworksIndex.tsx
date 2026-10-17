import { Link } from "react-router-dom";
import { useEffect } from "react";
import { TEMPLATES, TEMPLATE_CATS, TPL_CSS } from "@/lib/templates/data";

export default function FrameworksIndex() {
  useEffect(() => {
    document.title = "Decision Frameworks Library — RICE, SWOT, Eisenhower & More";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "Free interactive library of decision frameworks: RICE, ICE, SWOT, Eisenhower Matrix, Six Thinking Hats, PDCA. Score, sort, and decide in your browser.");
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
    canon.href = `${window.location.origin}/frameworks`;
  }, []);

  return (
    <div className="tpl-app theme-dark">
      <style>{TPL_CSS}</style>
      <div className="tpl-wrap">
        <header className="tpl-hdr">
          <div className="tpl-ey">Decision Suite · Open Library</div>
          <h1 className="tpl-title">Decision<span>.</span>Frameworks</h1>
          <p className="tpl-sub">Battle-tested frameworks used by product, ops, and strategy teams. Each page includes the model, a worked example, and a working calculator — no signup.</p>
        </header>

        <nav className="tpl-cats" aria-label="Framework categories">
          {TEMPLATE_CATS.filter(c => c.id !== "all").map(c => (
            <span key={c.id} className="tpl-cat">{c.label}</span>
          ))}
        </nav>

        <section className="tpl-grid">
          {TEMPLATES.map(t => (
            <Link key={t.id} to={`/frameworks/${t.slug}`} className="tpl-card" style={{ textDecoration: "none", display: "block" }}>
              <div className={`tpl-card-badge ${t.badge}`}>{t.cat}</div>
              <div className="tpl-card-icon">{t.icon}</div>
              <div className="tpl-card-name">{t.name}</div>
              <div className="tpl-card-full">{t.fullName}</div>
              <div className="tpl-card-desc">{t.desc}</div>
              <div className="tpl-card-dims">{t.dims.map(d => <span key={d} className="tpl-dim">{d}</span>)}</div>
            </Link>
          ))}
        </section>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link to="/" style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", textDecoration: "none" }}>
            Open the full Decision Suite →
          </Link>
        </div>

        <footer style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center", gap: 20 }}>
          {[["Home","/landing"],["Pricing","/pricing"],["About","/about"]].map(([label,to]) => (
            <Link key={to} to={to} style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--text3)", textDecoration: "none" }}>{label}</Link>
          ))}
        </footer>
      </div>
    </div>
  );
}
