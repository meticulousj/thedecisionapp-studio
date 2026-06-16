import { useState } from "react";
import { invokeAi } from "@/lib/aiInvoke";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ExportMenu from "./ExportMenu";

type CounterArg = { title: string; reasoning: string; severity: "low" | "medium" | "high" };
type Assumption = { assumption: string; risk_if_wrong: string };
type Analysis = {
  counter_arguments: CounterArg[];
  hidden_assumptions: Assumption[];
  questions_to_answer: string[];
};

const css = `
.da-wrap{max-width:980px;margin:0 auto;padding:32px 24px;font-family:'DM Sans',system-ui,sans-serif;color:var(--text);}
.da-eyebrow{font-family:'Azeret Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
.da-title{font-family:'Syne',sans-serif;font-size:42px;font-weight:700;letter-spacing:-.02em;margin-bottom:8px;}
.da-title em{font-family:'Newsreader',serif;font-style:italic;font-weight:500;color:var(--gold);}
.da-sub{color:var(--text2);font-size:15px;margin-bottom:28px;max-width:680px;line-height:1.55;}
.da-card{background:var(--bg2);border:1px solid var(--border1);border-radius:14px;padding:22px;margin-bottom:20px;}
.da-label{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--text2);margin-bottom:8px;}
.da-textarea{width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:14px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.5;resize:vertical;min-height:110px;}
.da-textarea:focus{outline:none;border-color:var(--gold);}
.da-row{display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap;}
.da-btn{background:var(--gold);color:#1a1408;border:none;border-radius:10px;padding:12px 22px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:opacity .15s;}
.da-btn:hover{opacity:.88;}
.da-btn:disabled{opacity:.5;cursor:not-allowed;}
.da-btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border2);border-radius:10px;padding:12px 18px;font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;}
.da-section{margin-top:28px;}
.da-section-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:10px;}
.da-section-title .num{font-family:'Azeret Mono',monospace;font-size:11px;color:var(--gold);background:var(--bg3);padding:4px 8px;border-radius:6px;letter-spacing:.12em;}
.da-item{background:var(--bg2);border:1px solid var(--border1);border-radius:12px;padding:18px;margin-bottom:12px;border-left:3px solid var(--border2);}
.da-item.sev-high{border-left-color:var(--red,#e35);}
.da-item.sev-medium{border-left-color:var(--gold);}
.da-item.sev-low{border-left-color:var(--text2);}
.da-item-title{font-weight:600;font-size:15px;margin-bottom:6px;display:flex;justify-content:space-between;gap:12px;align-items:start;}
.da-pill{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:3px 8px;border-radius:5px;background:var(--bg3);color:var(--text2);white-space:nowrap;}
.da-pill.sev-high{background:rgba(227,53,85,.15);color:var(--red,#e35);}
.da-pill.sev-medium{background:rgba(212,165,84,.15);color:var(--gold);}
.da-item-body{font-size:14px;color:var(--text2);line-height:1.55;}
.da-item-body strong{color:var(--text);font-weight:500;}
.da-q{display:flex;gap:10px;padding:12px 0;border-bottom:1px dashed var(--border1);font-size:14px;line-height:1.5;}
.da-q:last-child{border-bottom:none;}
.da-q-num{font-family:'Azeret Mono',monospace;color:var(--gold);font-size:12px;flex-shrink:0;}
.da-empty{text-align:center;padding:40px 20px;color:var(--text2);font-size:14px;}
.da-loading{display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:da-spin .8s linear infinite;}
@keyframes da-spin{to{transform:rotate(360deg);}}
`;

export default function DevilsAdvocate() {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const generate = async () => {
    if (decision.trim().length < 10) {
      toast({ title: "Decision too short", description: "Describe the decision in at least 10 characters." });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("devils-advocate", {
        body: { decision: decision.trim(), context: context.trim() || undefined },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAnalysis(data as Analysis);
    } catch (e: any) {
      toast({ title: "Could not generate analysis", description: e?.message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setAnalysis(null); setDecision(""); setContext(""); };

  return (
    <>
      <style>{css}</style>
      <div className="da-wrap">
        <div className="da-eyebrow">AI Devil's Advocate · Stress-test your thinking</div>
        <h1 className="da-title">Devil's <em>Advocate</em></h1>
        <p className="da-sub">Paste a decision you're considering. Get the strongest counter-arguments, hidden assumptions, and the questions you should answer before proceeding.</p>

        {!analysis && (
          <div className="da-card">
            <div className="da-label">The decision</div>
            <textarea
              className="da-textarea"
              placeholder="e.g. We're going to raise prices 30% next quarter to fund our new enterprise sales team."
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              disabled={loading}
            />
            <div style={{ height: 14 }} />
            <div className="da-label">Context (optional)</div>
            <textarea
              className="da-textarea"
              placeholder="Background: market conditions, constraints, prior attempts, stakes..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={loading}
              style={{ minHeight: 80 }}
            />
            <div className="da-row">
              <button className="da-btn" onClick={generate} disabled={loading}>
                {loading ? <><span className="da-loading" /> Generating…</> : "Generate counter-arguments"}
              </button>
              <span style={{ fontFamily: "'Azeret Mono',monospace", fontSize: 11, color: "var(--text2)", letterSpacing: ".1em" }}>
                Powered by AI · Takes ~10s
              </span>
            </div>
          </div>
        )}

        {analysis && (
          <>
            <div className="da-row" style={{ marginBottom: 18, justifyContent: "space-between" }}>
              <button className="da-btn-ghost" onClick={reset}>← New analysis</button>
              <ExportMenu getPayload={() => ({
                kind: "decision",
                toolLabel: "Decision Suite · Devil's Advocate",
                title: "Devil's",
                titleEm: "Advocate",
                subtitle: decision,
                sections: [
                  { heading: "Decision under review", type: "text", body: decision },
                  ...(context.trim() ? [{ heading: "Context", type: "text" as const, body: context }] : []),
                  {
                    heading: "Counter-arguments",
                    type: "table",
                    columns: ["Severity", "Title", "Reasoning"],
                    rows: analysis.counter_arguments.map(c => [c.severity.toUpperCase(), c.title, c.reasoning]),
                  },
                  {
                    heading: "Hidden assumptions",
                    type: "kv",
                    body: analysis.hidden_assumptions.map(a => ({ k: a.assumption, v: `Risk if wrong: ${a.risk_if_wrong}` })),
                  },
                  {
                    heading: "Questions to answer first",
                    type: "list",
                    ordered: true,
                    body: analysis.questions_to_answer,
                  },
                ],
              })} />
            </div>

            <div className="da-section">
              <div className="da-section-title"><span className="num">01</span> Counter-arguments</div>
              {analysis.counter_arguments.map((c, i) => (
                <div key={i} className={`da-item sev-${c.severity}`}>
                  <div className="da-item-title">
                    <span>{c.title}</span>
                    <span className={`da-pill sev-${c.severity}`}>{c.severity}</span>
                  </div>
                  <div className="da-item-body">{c.reasoning}</div>
                </div>
              ))}
            </div>

            <div className="da-section">
              <div className="da-section-title"><span className="num">02</span> Hidden assumptions</div>
              {analysis.hidden_assumptions.map((a, i) => (
                <div key={i} className="da-item">
                  <div className="da-item-title"><span>{a.assumption}</span></div>
                  <div className="da-item-body"><strong>Risk if wrong:</strong> {a.risk_if_wrong}</div>
                </div>
              ))}
            </div>

            <div className="da-section">
              <div className="da-section-title"><span className="num">03</span> Questions to answer first</div>
              <div className="da-card" style={{ marginBottom: 0 }}>
                {analysis.questions_to_answer.map((q, i) => (
                  <div key={i} className="da-q">
                    <span className="da-q-num">Q{i + 1}</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
