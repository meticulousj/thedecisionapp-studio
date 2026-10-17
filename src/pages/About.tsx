import { Link } from "react-router-dom";
import { PublicLayout, usePageMeta } from "@/components/PublicLayout";

export default function About() {
  usePageMeta(
    "About — Decision Suite",
    "Decision Suite is a collection of interactive tools that help individuals and teams make clearer, more defensible decisions.",
    "/about"
  );

  return (
    <PublicLayout>
      <article className="tpl-active" style={{ maxWidth: 720 }}>
        <div className="tpl-ey">About</div>
        <h1 className="tpl-a-name" style={{ fontSize: 32 }}>Why Decision Suite exists</h1>
        <p className="tpl-a-desc" style={{ marginBottom: 20 }}>
          Most bad decisions aren't made from lack of intelligence — they're made from unstructured thinking. We skip the assumptions, avoid the uncomfortable pre-mortem, and let commitments fade without consequence.
        </p>
        <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.8, marginBottom: 20 }}>
          Decision Suite packages the techniques used by the world's best operators — RICE scoring, Eisenhower matrices, SWOT analysis, Six Thinking Hats, pre-mortems, and commitment devices — into fast, interactive tools that run in your browser. No workshops, no slide decks, no signup to start.
        </p>

        <section className="tpl-a-section">
          <h2 className="tpl-a-slbl">What we believe</h2>
          <ul style={{ paddingLeft: 20, color: "var(--text2)", fontSize: 13, lineHeight: 1.9 }}>
            <li>A written assumption is a testable one.</li>
            <li>Imagining failure before it happens is cheaper than living it.</li>
            <li>Commitments with stakes — social, financial, reputational — actually get kept.</li>
            <li>Good frameworks should be free; great tooling is worth paying for.</li>
          </ul>
        </section>

        <section className="tpl-a-section">
          <h2 className="tpl-a-slbl">Explore</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/frameworks" className="tpl-dim" style={{ textDecoration: "none", padding: "8px 14px", fontSize: 11 }}>Framework library</Link>
            <Link to="/pricing" className="tpl-dim" style={{ textDecoration: "none", padding: "8px 14px", fontSize: 11 }}>Pricing</Link>
            <Link to="/" className="tpl-dim" style={{ textDecoration: "none", padding: "8px 14px", fontSize: 11 }}>Open the app</Link>
          </div>
        </section>
      </article>
    </PublicLayout>
  );
}
