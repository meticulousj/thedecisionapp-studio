import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { TEMPLATES, TPL_CSS, getTemplateBySlug } from "@/lib/templates/data";
import { FrameworkWorkspace } from "@/lib/templates/Workspace";

export default function FrameworkDetail() {
  const { slug = "" } = useParams();
  const tpl = getTemplateBySlug(slug);

  useEffect(() => {
    if (!tpl) return;
    const seo = tpl.seo || {};
    document.title = seo.title || `${tpl.name} — ${tpl.fullName} | Decision Suite`;
    const desc = seo.metaDescription || tpl.desc;
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", desc.slice(0, 160));
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
    canon.href = `${window.location.origin}/frameworks/${tpl.slug}`;

    // JSON-LD
    const ldId = "framework-jsonld";
    document.getElementById(ldId)?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = ldId;
    const blocks: object[] = [
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to use the ${tpl.name} framework`,
        description: desc,
        step: tpl.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.title,
          text: s.desc,
        })),
      },
    ];
    if (seo.faq?.length) {
      blocks.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: seo.faq.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }
    script.textContent = JSON.stringify(blocks);
    document.head.appendChild(script);
    return () => { document.getElementById(ldId)?.remove(); };
  }, [tpl]);

  if (!tpl) return <Navigate to="/frameworks" replace />;
  const seo = tpl.seo || {};

  return (
    <div className="tpl-app theme-dark">
      <style>{TPL_CSS}</style>
      <div className="tpl-wrap">
        <nav style={{ marginBottom: 16, fontFamily: "'Azeret Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>
          <Link to="/frameworks" style={{ color: "var(--text2)", textDecoration: "none" }}>← All frameworks</Link>
        </nav>

        <article className="tpl-active" style={{ maxWidth: 760 }}>
          <div className="tpl-a-icon">{tpl.icon}</div>
          <h1 className="tpl-a-name" style={{ fontSize: 32 }}>{seo.h1 || tpl.name}</h1>
          <div className="tpl-a-full">{tpl.fullName}</div>
          <p className="tpl-a-desc">{seo.oneLiner || tpl.desc}</p>

          {/* Live tool above the fold */}
          <FrameworkWorkspace tpl={tpl} />

          <section className="tpl-a-section" style={{ marginTop: 36 }}>
            <h2 className="tpl-a-slbl">How it works</h2>
            <div className="tpl-a-steps">
              {tpl.steps.map((s, i) => (
                <div key={i} className="tpl-a-step">
                  <div className="tpl-a-snum">{i + 1}</div>
                  <div className="tpl-a-stxt">
                    <div className="tpl-a-sttl">{s.title}</div>
                    <div className="tpl-a-sdsc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {seo.whenToUse?.length && (
            <section className="tpl-a-section">
              <h2 className="tpl-a-slbl">When to use it</h2>
              <ul style={{ paddingLeft: 20, color: "var(--text2)", fontSize: 13, lineHeight: 1.8 }}>
                {seo.whenToUse.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </section>
          )}

          {seo.example && (
            <section className="tpl-a-section">
              <h2 className="tpl-a-slbl">{seo.example.title}</h2>
              <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.8 }}>{seo.example.body}</p>
            </section>
          )}

          {(seo.pros?.length || seo.cons?.length) && (
            <section className="tpl-a-section">
              <h2 className="tpl-a-slbl">Pros & limitations</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 9, letterSpacing: 2, color: "var(--green)", marginBottom: 8 }}>PROS</div>
                  <ul style={{ paddingLeft: 18, color: "var(--text2)", fontSize: 12, lineHeight: 1.7 }}>
                    {seo.pros?.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <div style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 9, letterSpacing: 2, color: "var(--red)", marginBottom: 8 }}>LIMITATIONS</div>
                  <ul style={{ paddingLeft: 18, color: "var(--text2)", fontSize: 12, lineHeight: 1.7 }}>
                    {seo.cons?.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {seo.faq?.length && (
            <section className="tpl-a-section">
              <h2 className="tpl-a-slbl">FAQ</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {seo.faq.map((f, i) => (
                  <details key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
                    <summary style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}>{f.q}</summary>
                    <p style={{ marginTop: 8, fontSize: 12, color: "var(--text2)", lineHeight: 1.7 }}>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {seo.related?.length && (
            <section className="tpl-a-section">
              <h2 className="tpl-a-slbl">Related frameworks</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {seo.related.map(r => (
                  <Link key={r.slug} to={`/frameworks/${r.slug}`} className="tpl-dim" style={{ textDecoration: "none", padding: "6px 12px", fontSize: 11 }}>
                    → {r.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section style={{ marginTop: 32, padding: 24, background: "var(--bg3)", border: "1px solid var(--gold)", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              Save your {tpl.name} sessions
            </div>
            <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>
              Sign in to save, export, and revisit your work across all frameworks.
            </p>
            <Link to="/auth" style={{ display: "inline-block", background: "var(--gold)", color: "#0d0d0d", padding: "10px 22px", borderRadius: 8, fontFamily: "'Azeret Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
              Open Decision Suite
            </Link>
          </section>
        </article>

        <nav style={{ marginTop: 36, textAlign: "center" }} aria-label="Other frameworks">
          <div style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 9, letterSpacing: 2, color: "var(--text3)", marginBottom: 12, textTransform: "uppercase" }}>Other frameworks</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {TEMPLATES.filter(t => t.slug !== tpl.slug).map(t => (
              <Link key={t.id} to={`/frameworks/${t.slug}`} className="tpl-dim" style={{ textDecoration: "none", padding: "6px 12px", fontSize: 11 }}>
                {t.icon} {t.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
