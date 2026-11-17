// Shared shell for public, indexable pages (landing, pricing, about, frameworks).
// Provides consistent nav + footer with internal links so crawlers can
// discover every public route.
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { TPL_CSS } from "@/lib/templates/data";

export { usePageMeta } from "./PageMeta";

const NAV_LINKS = [
  { to: "/landing", label: "Home" },
  { to: "/frameworks", label: "Frameworks" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="tpl-app theme-dark">
      <style>{TPL_CSS}</style>
      <div className="tpl-wrap">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <Link to="/landing" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", textDecoration: "none", letterSpacing: "-0.5px" }}>
            Decision<span style={{ color: "var(--gold)" }}>.</span>Suite
          </Link>
          <nav aria-label="Site" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--text2)", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
            <Link to="/" style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", background: "var(--gold)", color: "#0d0d0d", padding: "8px 16px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
              Open App
            </Link>
          </nav>
        </header>

        {children}

        <footer style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 9, letterSpacing: 2, color: "var(--text3)", textTransform: "uppercase" }}>
            Decision Suite — think better, decide faster
          </div>
          <nav aria-label="Footer" style={{ display: "flex", gap: 16 }}>
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--text3)", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}
