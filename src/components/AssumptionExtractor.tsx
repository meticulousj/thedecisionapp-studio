import { useState } from "react";
import { invokeAi } from "@/lib/aiInvoke";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ExportMenu from "./ExportMenu";

type Assumption = {
  assumption: string;
  evidence: string;
  risk_if_wrong: string;
  confidence: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  test: string;
};
type Result = { summary: string; assumptions: Assumption[] };

const css = `
.ax-wrap{max-width:980px;margin:0 auto;padding:32px 24px;font-family:'DM Sans',system-ui,sans-serif;color:var(--text);}
.ax-eyebrow{font-family:'Azeret Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
.ax-title{font-family:'Syne',sans-serif;font-size:42px;font-weight:700;letter-spacing:-.02em;margin-bottom:8px;}
.ax-title em{font-family:'Newsreader',serif;font-style:italic;font-weight:500;color:var(--gold);}
.ax-sub{color:var(--text2);font-size:15px;margin-bottom:28px;max-width:720px;line-height:1.55;}
.ax-card{background:var(--bg2);border:1px solid var(--border1);border-radius:14px;padding:22px;margin-bottom:20px;}
.ax-label{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--text2);margin-bottom:8px;display:flex;justify-content:space-between;}
.ax-textarea{width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:14px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.5;resize:vertical;min-height:240px;}
.ax-textarea:focus{outline:none;border-color:var(--gold);}
.ax-row{display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap;}
.ax-btn{background:var(--gold);color:#1a1408;border:none;border-radius:10px;padding:12px 22px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:opacity .15s;}
.ax-btn:hover{opacity:.88;}
.ax-btn:disabled{opacity:.5;cursor:not-allowed;}
.ax-btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border2);border-radius:10px;padding:12px 18px;font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;}
.ax-summary{background:var(--bg2);border:1px solid var(--border1);border-left:3px solid var(--gold);border-radius:12px;padding:18px;margin-bottom:24px;font-size:14px;line-height:1.6;color:var(--text2);}
.ax-summary strong{color:var(--text);}
.ax-item{background:var(--bg2);border:1px solid var(--border1);border-radius:12px;padding:18px;margin-bottom:12px;border-left:3px solid var(--border2);}
.ax-item.risk-high{border-left-color:var(--red,#e35);}
.ax-item.risk-medium{border-left-color:var(--gold);}
.ax-item.risk-low{border-left-color:var(--text2);}
.ax-item-head{display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:10px;}
.ax-item-title{font-weight:600;font-size:15px;line-height:1.4;}
.ax-pills{display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;}
.ax-pill{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:3px 8px;border-radius:5px;background:var(--bg3);color:var(--text2);white-space:nowrap;}
.ax-pill.risk-high{background:rgba(227,53,85,.15);color:var(--red,#e35);}
.ax-pill.risk-medium{background:rgba(212,165,84,.15);color:var(--gold);}
.ax-row-kv{display:grid;grid-template-columns:90px 1fr;gap:8px 14px;font-size:13.5px;line-height:1.55;color:var(--text2);margin-top:8px;}
.ax-row-kv .k{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--text2);padding-top:3px;}
.ax-row-kv .v{color:var(--text);}
.ax-row-kv .v.evidence{font-style:italic;color:var(--text2);}
.ax-section-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:600;margin:0 0 14px;}
.ax-loading{display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:ax-spin .8s linear infinite;}
@keyframes ax-spin{to{transform:rotate(360deg);}}
.ax-count{font-family:'Azeret Mono',monospace;font-size:10px;color:var(--text2);letter-spacing:.1em;}
`;

const SAMPLE = `Team — quick update on the Q3 enterprise push.

We're going to repurpose the growth team to chase 5 logos in financial services this quarter. Pricing will move from self-serve $99/mo to a $40K/year minimum. We already have warm intros at 2 of the targets, and the product is "enterprise-ready enough" — we'll close the security gaps as deals progress. Sales cycle should be ~6 weeks given our existing brand awareness.

If we land 3 of 5 we hit plan. Worst case we land 1 and use the learnings to refine ICP for Q4. Either way, growth team isn't going to drive material SMB revenue this quarter so the opportunity cost is low.`;

export default function AssumptionExtractor() {
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const extract = async () => {
    if (source.trim().length < 20) {
      toast({ title: "Content too short", description: "Paste at least 20 characters." });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-assumptions", {
        body: { source: source.trim() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as Result);
    } catch (e: any) {
      toast({ title: "Could not extract assumptions", description: e?.message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setSource(""); };

  return (
    <>
      <style>{css}</style>
      <div className="ax-wrap">
        <div className="ax-eyebrow">Assumption Extractor · Surface what's unsaid</div>
        <h1 className="ax-title">Assumption <em>Extractor</em></h1>
        <p className="ax-sub">Paste a memo, doc, Slack thread, or meeting transcript. The AI surfaces the load-bearing assumptions hidden inside — and tells you what breaks if they're wrong.</p>

        {!result && (
          <div className="ax-card">
            <div className="ax-label">
              <span>Source content</span>
              <span className="ax-count">{source.length.toLocaleString()} / 30,000 chars</span>
            </div>
            <textarea
              className="ax-textarea"
              placeholder="Paste a doc, memo, Slack thread, transcript, strategy note..."
              value={source}
              onChange={(e) => setSource(e.target.value.slice(0, 30000))}
              disabled={loading}
            />
            <div className="ax-row">
              <button className="ax-btn" onClick={extract} disabled={loading}>
                {loading ? <><span className="ax-loading" /> Extracting…</> : "Extract hidden assumptions"}
              </button>
              <button className="ax-btn-ghost" onClick={() => setSource(SAMPLE)} disabled={loading}>
                Try sample
              </button>
              <span style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 11, color: "var(--text2)", letterSpacing: ".1em" }}>
                Powered by AI · ~10s
              </span>
            </div>
          </div>
        )}

        {result && (
          <>
            <div className="ax-row" style={{ marginBottom: 18, justifyContent: "space-between" }}>
              <button className="ax-btn-ghost" onClick={reset}>← New extraction</button>
              <ExportMenu getPayload={() => ({
                kind: "assumption",
                toolLabel: "Decision Suite · Assumption Extractor",
                title: "Assumption",
                titleEm: "Extractor",
                subtitle: result.summary,
                sections: [
                  { heading: "Summary", type: "text", body: result.summary },
                  { heading: "Source", type: "text", body: source },
                  {
                    heading: "Hidden assumptions",
                    type: "table",
                    columns: ["Risk", "Conf.", "Assumption", "Risk if wrong", "Test"],
                    rows: result.assumptions.map(a => [
                      a.risk.toUpperCase(),
                      a.confidence.toUpperCase(),
                      a.assumption,
                      a.risk_if_wrong,
                      a.test,
                    ]),
                  },
                ],
              })} />
            </div>

            {result.summary && (
              <div className="ax-summary"><strong>Pattern:</strong> {result.summary}</div>
            )}

            <h2 className="ax-section-title">Hidden assumptions ({result.assumptions.length})</h2>
            {result.assumptions.map((a, i) => (
              <div key={i} className={`ax-item risk-${a.risk}`}>
                <div className="ax-item-head">
                  <div className="ax-item-title">{a.assumption}</div>
                  <div className="ax-pills">
                    <span className={`ax-pill risk-${a.risk}`}>Risk: {a.risk}</span>
                    <span className="ax-pill">Conf: {a.confidence}</span>
                  </div>
                </div>
                <div className="ax-row-kv">
                  <div className="k">Evidence</div><div className="v evidence">"{a.evidence}"</div>
                  <div className="k">If wrong</div><div className="v">{a.risk_if_wrong}</div>
                  <div className="k">Test</div><div className="v">{a.test}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
