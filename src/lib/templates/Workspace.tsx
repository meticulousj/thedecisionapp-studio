// Reusable workspace renderer for a single framework.
// Used by both the in-app Templates Library and public /frameworks/:slug pages.
import { useState } from "react";
import { Template, RiceItem, TplItem } from "./data";

export function FrameworkWorkspace({ tpl }: { tpl: Template }) {
  const [quadData, setQuadData] = useState<Record<string, TplItem[]>>({});
  const [quadInputs, setQuadInputs] = useState<Record<string, string>>({});
  const [riceItems, setRiceItems] = useState<RiceItem[]>([]);
  const [riceInput, setRiceInput] = useState("");
  const [hatNotes, setHatNotes] = useState<Record<string, string[]>>({});
  const [hatInputs, setHatInputs] = useState<Record<string, string>>({});

  const getQuadItems = (tplId: string, quadId: string) => {
    const key = `${tplId}-${quadId}`;
    return (quadData[key] || []).map(i => i.items).flat();
  };
  const addQuadItem = (tplId: string, quadId: string) => {
    const key = `${tplId}-${quadId}`;
    const val = (quadInputs[key] || "").trim();
    if (!val) return;
    const existing = quadData[key] || [{ id: quadId, items: [] }];
    const updated = [{ ...existing[0], items: [...(existing[0]?.items || []), val] }];
    setQuadData({ ...quadData, [key]: updated });
    setQuadInputs({ ...quadInputs, [key]: "" });
  };
  const removeQuadItem = (tplId: string, quadId: string, idx: number) => {
    const key = `${tplId}-${quadId}`;
    const existing = quadData[key] || [{ id: quadId, items: [] }];
    const updated = [{ ...existing[0], items: existing[0].items.filter((_, i) => i !== idx) }];
    setQuadData({ ...quadData, [key]: updated });
  };
  const addRiceItem = () => {
    const val = riceInput.trim();
    if (!val) return;
    setRiceItems([...riceItems, { name: val, reach: 1000, impact: 1, confidence: 80, effort: 1 }]);
    setRiceInput("");
  };
  const updateRice = (idx: number, field: keyof RiceItem, value: number) => {
    setRiceItems(riceItems.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };
  const riceScore = (r: RiceItem) => r.effort > 0 ? (r.reach * r.impact * (r.confidence / 100)) / r.effort : 0;
  const addHatNote = (hatId: string) => {
    const val = (hatInputs[hatId] || "").trim();
    if (!val) return;
    setHatNotes({ ...hatNotes, [hatId]: [...(hatNotes[hatId] || []), val] });
    setHatInputs({ ...hatInputs, [hatId]: "" });
  };

  if (tpl.id === "swot") {
    const quads = [
      { id:"s",label:"Strengths",desc:"Internal advantages",cls:"tpl-q-s" },
      { id:"w",label:"Weaknesses",desc:"Internal limitations",cls:"tpl-q-w" },
      { id:"o",label:"Opportunities",desc:"External possibilities",cls:"tpl-q-o" },
      { id:"t",label:"Threats",desc:"External risks",cls:"tpl-q-t" },
    ];
    return (
      <div className="tpl-ws">
        <div className="tpl-ws-title">SWOT Workspace</div>
        <div className="tpl-ws-grid cols-4">
          {quads.map(q => (
            <div key={q.id} className={`tpl-ws-quad ${q.cls}`}>
              <div className="tpl-ws-qlbl">{q.label}</div>
              <div className="tpl-ws-qdesc">{q.desc}</div>
              <div className="tpl-ws-items">
                {getQuadItems("swot", q.id).map((item, i) => (
                  <div key={i} className="tpl-ws-item">{item}<button onClick={() => removeQuadItem("swot", q.id, i)}>×</button></div>
                ))}
              </div>
              <div className="tpl-ws-add">
                <input placeholder={`Add ${q.label.toLowerCase()}...`} value={quadInputs[`swot-${q.id}`] || ""} onChange={e => setQuadInputs({ ...quadInputs, [`swot-${q.id}`]: e.target.value })} onKeyDown={e => e.key === "Enter" && addQuadItem("swot", q.id)} />
                <button onClick={() => addQuadItem("swot", q.id)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tpl.id === "eisenhower") {
    const quads = [
      { id:"do",label:"Do Now",desc:"Important & Urgent",cls:"tpl-q-s" },
      { id:"schedule",label:"Schedule",desc:"Important & Not Urgent",cls:"tpl-q-o" },
      { id:"delegate",label:"Delegate",desc:"Not Important & Urgent",cls:"tpl-q-t" },
      { id:"eliminate",label:"Eliminate",desc:"Not Important & Not Urgent",cls:"tpl-q-w" },
    ];
    return (
      <div className="tpl-ws">
        <div className="tpl-ws-title">Eisenhower Matrix</div>
        <div className="tpl-ws-grid cols-4">
          {quads.map(q => (
            <div key={q.id} className={`tpl-ws-quad ${q.cls}`}>
              <div className="tpl-ws-qlbl">{q.label}</div>
              <div className="tpl-ws-qdesc">{q.desc}</div>
              <div className="tpl-ws-items">
                {getQuadItems("eisen", q.id).map((item, i) => (
                  <div key={i} className="tpl-ws-item">{item}<button onClick={() => removeQuadItem("eisen", q.id, i)}>×</button></div>
                ))}
              </div>
              <div className="tpl-ws-add">
                <input placeholder="Add task..." value={quadInputs[`eisen-${q.id}`] || ""} onChange={e => setQuadInputs({ ...quadInputs, [`eisen-${q.id}`]: e.target.value })} onKeyDown={e => e.key === "Enter" && addQuadItem("eisen", q.id)} />
                <button onClick={() => addQuadItem("eisen", q.id)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tpl.id === "rice") {
    const sorted = [...riceItems].sort((a, b) => riceScore(b) - riceScore(a));
    return (
      <div className="tpl-ws">
        <div className="tpl-ws-title">RICE Scoring Table</div>
        <div className="tpl-ws-add" style={{ marginBottom: 16 }}>
          <input placeholder="Add initiative name..." value={riceInput} onChange={e => setRiceInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addRiceItem()} />
          <button onClick={addRiceItem}>Add</button>
        </div>
        {sorted.length > 0 && <>
          <div className="tpl-rice-row tpl-rice-hdr">
            <span>Initiative</span><span>Reach</span><span>Impact</span><span>Confidence</span><span>Effort</span><span>Score</span>
          </div>
          {sorted.map((r, i) => {
            const origIdx = riceItems.indexOf(r);
            return (
              <div key={i} className="tpl-rice-row">
                <div className="tpl-rice-name">{r.name}</div>
                <input className="tpl-rice-in" type="number" value={r.reach} onChange={e => updateRice(origIdx, "reach", Number(e.target.value))} />
                <input className="tpl-rice-in" type="number" value={r.impact} step="0.25" onChange={e => updateRice(origIdx, "impact", Number(e.target.value))} />
                <input className="tpl-rice-in" type="number" value={r.confidence} onChange={e => updateRice(origIdx, "confidence", Number(e.target.value))} />
                <input className="tpl-rice-in" type="number" value={r.effort} onChange={e => updateRice(origIdx, "effort", Number(e.target.value))} />
                <div className="tpl-rice-score">{Math.round(riceScore(r))}</div>
              </div>
            );
          })}
        </>}
      </div>
    );
  }

  if (tpl.id === "sixhats") {
    const hats = [
      { id:"white",emoji:"⚪",label:"White Hat",desc:"Facts & data" },
      { id:"red",emoji:"🔴",label:"Red Hat",desc:"Emotions & gut feelings" },
      { id:"black",emoji:"⚫",label:"Black Hat",desc:"Risks & caution" },
      { id:"yellow",emoji:"🟡",label:"Yellow Hat",desc:"Benefits & optimism" },
      { id:"green",emoji:"🟢",label:"Green Hat",desc:"Creativity & ideas" },
      { id:"blue",emoji:"🔵",label:"Blue Hat",desc:"Process & summary" },
    ];
    return (
      <div className="tpl-ws">
        <div className="tpl-ws-title">Six Hats Workspace</div>
        <div className="tpl-ws-grid cols-2">
          {hats.map(h => (
            <div key={h.id} className="tpl-ws-quad">
              <div className="tpl-ws-qlbl" style={{ color: "var(--text2)" }}>{h.emoji} {h.label}</div>
              <div className="tpl-ws-qdesc">{h.desc}</div>
              <div className="tpl-ws-items">
                {(hatNotes[h.id] || []).map((note, i) => (
                  <div key={i} className="tpl-ws-item">{note}<button onClick={() => setHatNotes({ ...hatNotes, [h.id]: (hatNotes[h.id] || []).filter((_, j) => j !== i) })}>×</button></div>
                ))}
              </div>
              <div className="tpl-ws-add">
                <input placeholder={`Add ${h.label.toLowerCase()} note...`} value={hatInputs[h.id] || ""} onChange={e => setHatInputs({ ...hatInputs, [h.id]: e.target.value })} onKeyDown={e => e.key === "Enter" && addHatNote(h.id)} />
                <button onClick={() => addHatNote(h.id)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tpl.id === "iceScore") {
    const sorted = [...riceItems].sort((a, b) => ((b.reach + b.impact + b.confidence) / 3) - ((a.reach + a.impact + a.confidence) / 3));
    return (
      <div className="tpl-ws">
        <div className="tpl-ws-title">ICE Scoring Table</div>
        <div className="tpl-ws-add" style={{ marginBottom: 16 }}>
          <input placeholder="Add idea name..." value={riceInput} onChange={e => setRiceInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addRiceItem()} />
          <button onClick={addRiceItem}>Add</button>
        </div>
        {sorted.length > 0 && <>
          <div className="tpl-rice-row tpl-rice-hdr" style={{ gridTemplateColumns: "2fr repeat(3,1fr) 80px" }}>
            <span>Idea</span><span>Impact</span><span>Confidence</span><span>Ease</span><span>Score</span>
          </div>
          {sorted.map((r, i) => {
            const origIdx = riceItems.indexOf(r);
            return (
              <div key={i} className="tpl-rice-row" style={{ gridTemplateColumns: "2fr repeat(3,1fr) 80px" }}>
                <div className="tpl-rice-name">{r.name}</div>
                <input className="tpl-rice-in" type="number" min="1" max="10" value={r.reach} onChange={e => updateRice(origIdx, "reach", Number(e.target.value))} />
                <input className="tpl-rice-in" type="number" min="1" max="10" value={r.impact} onChange={e => updateRice(origIdx, "impact", Number(e.target.value))} />
                <input className="tpl-rice-in" type="number" min="1" max="10" value={r.confidence} onChange={e => updateRice(origIdx, "confidence", Number(e.target.value))} />
                <div className="tpl-rice-score">{((r.reach + r.impact + r.confidence) / 3).toFixed(1)}</div>
              </div>
            );
          })}
        </>}
      </div>
    );
  }

  if (tpl.id === "pdca") {
    const phases = [
      { id:"plan",label:"Plan",desc:"What will you change and why?",cls:"tpl-q-o" },
      { id:"do",label:"Do",desc:"Actions taken",cls:"tpl-q-s" },
      { id:"check",label:"Check",desc:"Results observed",cls:"tpl-q-t" },
      { id:"act",label:"Act",desc:"Standardize or iterate",cls:"tpl-q-w" },
    ];
    return (
      <div className="tpl-ws">
        <div className="tpl-ws-title">PDCA Cycle</div>
        <div className="tpl-ws-grid cols-4">
          {phases.map(p => (
            <div key={p.id} className={`tpl-ws-quad ${p.cls}`}>
              <div className="tpl-ws-qlbl">{p.label}</div>
              <div className="tpl-ws-qdesc">{p.desc}</div>
              <div className="tpl-ws-items">
                {getQuadItems("pdca", p.id).map((item, i) => (
                  <div key={i} className="tpl-ws-item">{item}<button onClick={() => removeQuadItem("pdca", p.id, i)}>×</button></div>
                ))}
              </div>
              <div className="tpl-ws-add">
                <input placeholder={`Add to ${p.label}...`} value={quadInputs[`pdca-${p.id}`] || ""} onChange={e => setQuadInputs({ ...quadInputs, [`pdca-${p.id}`]: e.target.value })} onKeyDown={e => e.key === "Enter" && addQuadItem("pdca", p.id)} />
                <button onClick={() => addQuadItem("pdca", p.id)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
