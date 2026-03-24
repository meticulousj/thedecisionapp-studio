import { useState, useEffect } from "react";

// Storage helpers using localStorage instead of window.storage
const storage = {
  get: (key: string) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

// ─────────────────────────────────────────
// SHELL CSS
// ─────────────────────────────────────────
const SHELL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0c0c0c; --bg2:#141414; --bg3:#1c1c1c;
  --border:#2a2a2a; --border2:#333;
  --text:#f0f0f0; --text2:#888; --text3:#444;
  --gold:#c9a84c; --gold-d:rgba(201,168,76,0.15);
  --red:#e63946; --red-d:rgba(230,57,70,0.12);
  --green:#52b788; --green-d:rgba(82,183,136,0.12);
  --blue:#60a5fa; --blue-d:rgba(96,165,250,0.10);
  --amber:#f4a261;
}
.suite-shell body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;}
.suite-shell{display:flex;height:100vh;overflow:hidden;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;}
.suite-shell *{font-size-adjust:from-font;}


/* SIDEBAR */
.sidebar{
  width:220px;flex-shrink:0;background:var(--bg2);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  overflow-y:auto;
}
.sidebar-logo{
  padding:28px 24px 20px;
  border-bottom:1px solid var(--border);
}
.logo-mark{
  font-family:'Syne',sans-serif;font-size:15px;font-weight:800;
  letter-spacing:-0.5px;color:var(--text);line-height:1.1;
}
.logo-mark span{color:var(--gold);}
.logo-sub{
  font-family:'Azeret Mono',monospace;font-size:8px;
  letter-spacing:3px;text-transform:uppercase;color:var(--text3);
  margin-top:4px;
}
.sidebar-nav{flex:1;padding:12px 0;}
.nav-section-label{
  font-family:'Azeret Mono',monospace;font-size:8px;
  letter-spacing:3px;text-transform:uppercase;
  color:var(--text3);padding:16px 24px 8px;
}
.nav-item{
  display:flex;align-items:center;gap:12px;
  padding:10px 24px;cursor:pointer;
  font-size:13px;font-weight:500;color:var(--text2);
  transition:all .15s;border-left:2px solid transparent;
  position:relative;
}
.nav-item:hover{background:var(--bg3);color:var(--text);}
.nav-item.active{
  background:var(--bg3);color:var(--text);
  border-left-color:var(--gold);
}
.nav-icon{
  width:28px;height:28px;border-radius:4px;
  display:flex;align-items:center;justify-content:center;
  font-size:14px;flex-shrink:0;
  background:var(--bg3);border:1px solid var(--border2);
  transition:all .15s;
}
.nav-item.active .nav-icon{border-color:var(--gold);background:var(--gold-d);}
.nav-label{flex:1;line-height:1.2;}
.nav-sublabel{
  font-family:'Azeret Mono',monospace;font-size:8px;
  color:var(--text3);letter-spacing:1px;
  display:block;margin-top:1px;
}
.sidebar-footer{
  padding:16px 24px;border-top:1px solid var(--border);
}
.suite-tag{
  font-family:'Azeret Mono',monospace;font-size:8px;
  letter-spacing:2px;text-transform:uppercase;color:var(--text3);
}

/* MAIN */
.main{flex:1;overflow-y:auto;background:var(--bg);}
.tool-frame{min-height:100%;width:100%;}

/* TOPBAR */
.topbar{
  height:48px;background:var(--bg2);border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 32px;position:sticky;top:0;z-index:50;
}
.topbar-path{
  font-family:'Azeret Mono',monospace;font-size:10px;
  letter-spacing:2px;text-transform:uppercase;color:var(--text3);
  display:flex;align-items:center;gap:8px;
}
.path-sep{color:var(--border2);}
.path-active{color:var(--text2);}
.topbar-right{
  font-family:'Azeret Mono',monospace;font-size:9px;
  color:var(--text3);letter-spacing:1px;
}

/* ── HOME DASHBOARD ── */
.home{padding:48px 40px 80px;max-width:1000px;margin:0 auto;}
.home-header{margin-bottom:48px;}
.home-eyebrow{
  font-family:'Azeret Mono',monospace;font-size:9px;
  letter-spacing:4px;text-transform:uppercase;color:var(--gold);
  margin-bottom:12px;
}
.home-title{
  font-family:'Syne',sans-serif;font-size:clamp(36px,5vw,56px);
  font-weight:800;letter-spacing:-1.5px;color:var(--text);
  line-height:.95;margin-bottom:12px;
}
.home-title em{
  font-family:'Newsreader',serif;font-style:italic;
  font-weight:400;color:var(--gold);
}
.home-sub{
  font-size:14px;color:var(--text2);max-width:480px;
  line-height:1.7;font-weight:300;
}

/* Stats row */
.stats-row{
  display:grid;grid-template-columns:repeat(4,1fr);
  gap:8px;margin-bottom:40px;
}
.stat-card{
  background:var(--bg2);border:1px solid var(--border);
  padding:20px;position:relative;overflow:hidden;
}
.stat-card::after{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
}
.stat-card.gold::after{background:var(--gold);}
.stat-card.green::after{background:var(--green);}
.stat-card.red::after{background:var(--red);}
.stat-card.blue::after{background:var(--blue);}
.stat-num{
  font-family:'Syne',sans-serif;font-size:36px;font-weight:800;
  line-height:1;margin-bottom:4px;color:var(--text);
}
.stat-label{
  font-family:'Azeret Mono',monospace;font-size:8px;
  letter-spacing:2px;text-transform:uppercase;color:var(--text3);
}

/* Tool cards */
.tools-grid{
  display:grid;grid-template-columns:repeat(2,1fr);
  gap:12px;margin-bottom:32px;
}
.tool-card{
  background:var(--bg2);border:1px solid var(--border);
  padding:28px;cursor:pointer;
  transition:all .2s;position:relative;overflow:hidden;
}
.tool-card::before{
  content:'';position:absolute;top:0;left:0;bottom:0;width:3px;
  background:var(--border);transition:background .2s;
}
.tool-card:hover{border-color:var(--border2);background:var(--bg3);}
.tool-card:hover::before{background:var(--gold);}
.tool-card.active-card::before{background:var(--gold);}

.tc-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
.tc-icon{
  width:40px;height:40px;border-radius:6px;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;border:1px solid var(--border2);background:var(--bg3);
}
.tc-seq{
  font-family:'Azeret Mono',monospace;font-size:9px;
  letter-spacing:2px;color:var(--text3);
}
.tc-title{
  font-family:'Syne',sans-serif;font-size:17px;
  font-weight:700;color:var(--text);margin-bottom:4px;
  letter-spacing:-.3px;
}
.tc-role{
  font-family:'Azeret Mono',monospace;font-size:9px;
  letter-spacing:2px;text-transform:uppercase;color:var(--gold);
  margin-bottom:10px;
}
.tc-desc{font-size:12px;color:var(--text2);line-height:1.65;font-weight:300;}
.tc-footer{
  display:flex;align-items:center;justify-content:space-between;
  margin-top:20px;padding-top:14px;border-top:1px solid var(--border);
}
.tc-open{
  font-family:'Azeret Mono',monospace;font-size:9px;
  letter-spacing:2px;text-transform:uppercase;
  color:var(--text3);transition:color .15s;
}
.tool-card:hover .tc-open{color:var(--gold);}
.tc-badge{
  font-family:'Azeret Mono',monospace;font-size:8px;
  letter-spacing:1px;padding:3px 8px;border-radius:1px;
}
.badge-before{background:var(--blue-d);color:var(--blue);border:1px solid rgba(96,165,250,.2);}
.badge-during{background:var(--gold-d);color:var(--gold);border:1px solid rgba(201,168,76,.25);}
.badge-after{background:var(--red-d);color:var(--red);border:1px solid rgba(230,57,70,.2);}
.badge-exec{background:var(--green-d);color:var(--green);border:1px solid rgba(82,183,136,.2);}
.badge-always{background:var(--bg3);color:var(--text3);border:1px solid var(--border2);}

/* Flow diagram */
.flow-wrap{
  background:var(--bg2);border:1px solid var(--border);
  padding:28px 32px;
}
.flow-title{
  font-family:'Azeret Mono',monospace;font-size:9px;
  letter-spacing:3px;text-transform:uppercase;color:var(--text3);
  margin-bottom:20px;
}
.flow-row{display:flex;align-items:center;gap:0;}
.flow-node{
  flex:1;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:8px;
  cursor:pointer;padding:12px 8px;transition:all .15s;
  border-radius:4px;
}
.flow-node:hover{background:var(--bg3);}
.flow-node-icon{
  width:44px;height:44px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;border:1px solid var(--border2);background:var(--bg3);
  transition:all .15s;
}
.flow-node:hover .flow-node-icon{border-color:var(--gold);background:var(--gold-d);}
.flow-node-name{font-size:11px;font-weight:600;color:var(--text2);}
.flow-node-phase{
  font-family:'Azeret Mono',monospace;font-size:8px;
  letter-spacing:1px;color:var(--text3);
}
.flow-arrow{
  font-size:12px;color:var(--text3);padding:0 4px;
  flex-shrink:0;margin-bottom:20px;
}

/* MOBILE */
@media(max-width:700px){
  .sidebar{width:60px;}
  .nav-label,.logo-sub,.suite-tag,.nav-section-label,.logo-mark{display:none;}
  .sidebar-logo{padding:16px;display:flex;justify-content:center;}
  .nav-item{padding:12px;justify-content:center;}
  .stats-row{grid-template-columns:1fr 1fr;}
  .tools-grid{grid-template-columns:1fr;}
  .home{padding:24px 20px 60px;}
  .topbar{padding:0 16px;}
}
`;

// ─────────────────────────────────────────
// TOOL: DECISION CLARITY
// ─────────────────────────────────────────
const DC_CSS = `
.dc-app{min-height:100%;background:#f5f0e8;font-family:'DM Sans',sans-serif;color:#0d0d0d;display:flex;flex-direction:column;align-items:center;padding:40px 20px 80px;position:relative;}
.dc-bg{position:fixed;inset:0;background-image:linear-gradient(rgba(216,207,192,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(216,207,192,.3) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;}
.dc-hdr{text-align:center;margin-bottom:40px;position:relative;}
.dc-hdr-ey{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;margin-bottom:10px;}
.dc-hdr-t{font-family:'Syne',sans-serif;font-size:clamp(28px,5vw,48px);font-weight:800;letter-spacing:-1px;color:#0d0d0d;}
.dc-hdr-t span{color:#c9a84c;}
.dc-hdr-s{font-size:13px;color:#7a7060;margin-top:8px;font-weight:300;}
.dc-step-row{display:flex;align-items:center;gap:0;margin-bottom:36px;}
.dc-sdot{display:flex;flex-direction:column;align-items:center;gap:5px;}
.dc-dot{width:32px;height:32px;border-radius:50%;border:2px solid #d8cfc0;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-family:'Azeret Mono',monospace;font-size:10px;color:#7a7060;transition:all .3s;z-index:1;}
.dc-dot.active{border-color:#c9a84c;background:#c9a84c;color:#0d0d0d;font-weight:700;}
.dc-dot.done{border-color:#0d0d0d;background:#0d0d0d;color:#f5f0e8;}
.dc-slbl{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#7a7060;}
.dc-slbl.active{color:#c9a84c;font-weight:500;}.dc-slbl.done{color:#0d0d0d;}
.dc-sline{width:40px;height:2px;background:#d8cfc0;margin-bottom:20px;transition:background .3s;}
.dc-sline.done{background:#0d0d0d;}
.dc-card{background:#fff;border:1px solid #d8cfc0;padding:36px;width:100%;max-width:640px;position:relative;box-shadow:4px 4px 0 #d8cfc0;}
.dc-card-corner{position:absolute;width:10px;height:10px;border-color:#c9a84c;border-style:solid;}
.dc-card-corner.tl{top:-1px;left:-1px;border-width:2px 0 0 2px;}
.dc-card-corner.tr{top:-1px;right:-1px;border-width:2px 2px 0 0;}
.dc-card-corner.bl{bottom:-1px;left:-1px;border-width:0 0 2px 2px;}
.dc-card-corner.br{bottom:-1px;right:-1px;border-width:0 2px 2px 0;}
.dc-ct{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:6px;}
.dc-cd{font-size:12px;color:#7a7060;margin-bottom:24px;line-height:1.6;font-weight:300;}
.dc-fl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:block;margin-bottom:8px;}
.dc-ta,.dc-in{width:100%;background:#f5f0e8;border:1px solid #d8cfc0;padding:12px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#0d0d0d;outline:none;transition:border-color .2s;resize:none;border-radius:0;}
.dc-ta:focus,.dc-in:focus{border-color:#c9a84c;}
.dc-ta::placeholder,.dc-in::placeholder{color:#b0a090;font-style:italic;}
.dc-add-row{display:flex;gap:8px;margin-top:14px;}
.dc-add-row .dc-in{flex:1;}
.dc-tag{display:inline-flex;align-items:center;gap:7px;padding:5px 10px;background:#f5f0e8;border:1px solid #d8cfc0;font-size:12px;margin:4px 4px 0 0;animation:dcFade .2s ease;}
@keyframes dcFade{from{opacity:0;transform:translateY(3px);}to{opacity:1;transform:translateY(0);}}
.dc-trm{background:none;border:none;cursor:pointer;color:#7a7060;font-size:15px;line-height:1;}
.dc-trm:hover{color:#e63946;}
.dc-ci{border:1px solid #d8cfc0;background:#f5f0e8;padding:10px 12px;margin-bottom:7px;display:flex;align-items:center;gap:10px;}
.dc-cn{flex:1;font-size:13px;}
.dc-wc{display:flex;align-items:center;gap:6px;}
.dc-wb{width:24px;height:24px;border:1px solid #d8cfc0;background:#fff;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.dc-wb:hover{border-color:#c9a84c;background:#c9a84c;color:#0d0d0d;}
.dc-wl{font-family:'Azeret Mono',monospace;font-size:9px;color:#7a7060;width:20px;text-align:center;}
.dc-wdots{display:flex;gap:2px;}
.dc-wd{width:5px;height:5px;border-radius:50%;background:#d8cfc0;}.dc-wd.f{background:#c9a84c;}
.dc-sg{overflow-x:auto;margin:0 -6px;padding:0 6px;}
.dc-st{width:100%;border-collapse:collapse;min-width:380px;}
.dc-st th{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#7a7060;padding:8px 10px;text-align:left;border-bottom:2px solid #d8cfc0;}
.dc-st td{padding:7px 10px;border-bottom:1px solid #d8cfc0;vertical-align:middle;}
.dc-sl{display:flex;flex-direction:column;align-items:center;gap:3px;}
input[type=range]{-webkit-appearance:none;appearance:none;width:72px;height:4px;background:#d8cfc0;border-radius:2px;outline:none;border:none;padding:0;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#c9a84c;cursor:pointer;border:2px solid #0d0d0d;}
.dc-sv{font-family:'Azeret Mono',monospace;font-size:11px;color:#0d0d0d;font-weight:500;}
.dc-nav{display:flex;justify-content:space-between;align-items:center;margin-top:24px;width:100%;max-width:640px;}
.dc-btn{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:11px 22px;border:2px solid #0d0d0d;background:#0d0d0d;color:#f5f0e8;cursor:pointer;transition:all .2s;border-radius:0;}
.dc-btn:hover{background:#c9a84c;border-color:#c9a84c;color:#0d0d0d;}
.dc-btn:disabled{opacity:.4;cursor:not-allowed;}
.dc-btn:disabled:hover{background:#0d0d0d;border-color:#0d0d0d;color:#f5f0e8;}
.dc-btn-g{background:transparent;color:#7a7060;border-color:#d8cfc0;}
.dc-btn-g:hover{background:#f5f0e8;color:#0d0d0d;border-color:#0d0d0d;}
.dc-res{background:#0d0d0d;padding:36px;width:100%;max-width:640px;box-shadow:6px 6px 0 #c9a84c;color:#f0f0f0;margin-bottom:16px;}
.dc-rl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;}
.dc-rw{font-family:'Syne',sans-serif;font-size:clamp(24px,5vw,38px);font-weight:800;line-height:1.1;color:#fff;margin-bottom:12px;}
.dc-rs{font-family:'Azeret Mono',monospace;font-size:12px;color:#e8d5a3;}
.dc-bars{margin-top:24px;display:flex;flex-direction:column;gap:12px;}
.dc-bar-h{display:flex;justify-content:space-between;margin-bottom:5px;}
.dc-bn{font-size:12px;color:#ccc;}.dc-bp{font-family:'Azeret Mono',monospace;font-size:11px;color:#c9a84c;}
.dc-bt{height:5px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;}
.dc-bf{height:100%;border-radius:2px;transition:width 1s ease;}
.dc-bfW{background:#c9a84c;}.dc-bfO{background:rgba(201,168,76,.35);}
.dc-bk{background:#fff;border:1px solid #d8cfc0;padding:24px 36px;width:100%;max-width:640px;box-shadow:4px 4px 0 #d8cfc0;margin-bottom:16px;}
.dc-bkt{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:16px;}
.dc-bkr{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #d8cfc0;font-size:12px;}
.dc-bkr:last-child{border-bottom:none;}
.dc-bkc{color:#0d0d0d;flex:1;}.dc-bkw{color:#7a7060;font-family:'Azeret Mono',monospace;font-size:10px;width:48px;text-align:center;}
.dc-bks{display:flex;gap:10px;}
.dc-bkv{font-family:'Azeret Mono',monospace;font-size:11px;min-width:72px;text-align:center;padding:2px 6px;border-radius:2px;font-weight:500;}
.sh{background:#e8f5e9;color:#2d6a4f;}.sm{background:#fff8e1;color:#8b6914;}.sl{background:#fde8e8;color:#c0392b;}
.dc-ins{margin-top:16px;padding:14px 18px;background:#f5f0e8;border-left:3px solid #c9a84c;font-size:12px;color:#7a7060;line-height:1.7;}
.dc-hint{font-size:11px;color:#b0a090;margin-top:7px;font-style:italic;}
`;

function DecisionClarity() {
  const STEPS = ["Define","Options","Criteria","Score","Result"];
  const [step,setStep]=useState(0);
  const [decision,setDecision]=useState("");
  const [optInp,setOptInp]=useState("");
  const [options,setOptions]=useState<string[]>([]);
  const [critInp,setCritInp]=useState("");
  const [criteria,setCriteria]=useState<{name:string;weight:number}[]>([]);
  const [scores,setScores]=useState<Record<string,number>>({});
  const [barW,setBarW]=useState<Record<string,number>>({});

  const addOpt=()=>{const v=optInp.trim();if(v&&!options.includes(v)){setOptions([...options,v]);setOptInp("");}};
  const addCrit=()=>{const v=critInp.trim();if(v&&!criteria.find(c=>c.name===v)){setCriteria([...criteria,{name:v,weight:3}]);setCritInp("");}};
  const updW=(i:number,d:number)=>setCriteria(criteria.map((c,j)=>j===i?{...c,weight:Math.min(5,Math.max(1,c.weight+d))}:c));
  const setScore=(o:string,c:string,v:string)=>setScores(p=>({...p,[`${o}__${c}`]:Number(v)}));
  const getScore=(o:string,c:string)=>scores[`${o}__${c}`]??5;

  const computeRes=()=>{
    const tw=criteria.reduce((s,c)=>s+c.weight,0);
    return options.map(o=>{
      const w=criteria.reduce((s,c)=>s+(getScore(o,c.name)/10)*c.weight,0);
      return{name:o,score:tw>0?(w/tw)*100:0};
    }).sort((a,b)=>b.score-a.score);
  };
  const results=step===4?computeRes():[];
  const maxS=results[0]?.score||1;

  useEffect(()=>{
    if(step===4){
      setTimeout(()=>{
        const w:Record<string,number>={};results.forEach(r=>{w[r.name]=(r.score/maxS)*100;});setBarW(w);
      },100);
    }
  },[step]);

  const scoreColor=(v:number)=>v>=7?"sh":v>=4?"sm":"sl";
  const canNext=()=>{
    if(step===0)return decision.trim().length>5;
    if(step===1)return options.length>=2;
    if(step===2)return criteria.length>=1;
    return true;
  };
  const reset=()=>{setStep(0);setDecision("");setOptions([]);setOptInp("");setCriteria([]);setCritInp("");setScores({});setBarW({});};

  const gap=results.length>=2?(results[0].score-results[1].score):0;
  const insight=results.length<2?null:gap<5?`Narrow margin (${gap.toFixed(1)}%) — revisit criteria weights.`:gap>30?`"${results[0].name}" dominates. High-confidence recommendation.`:`"${results[0].name}" leads by ${gap.toFixed(1)}%. Solid signal.`;

  return(
    <div style={{position:"relative",zIndex:1}} className="dc-app">
      <style>{DC_CSS}</style>
      <div className="dc-bg" />
      <div className="dc-hdr">
        <div className="dc-hdr-ey">Decision Science · Clarity Engine</div>
        <div className="dc-hdr-t">Decision<span>.</span>Clarity</div>
        <div className="dc-hdr-s">Structured judgment under uncertainty</div>
      </div>
      <div className="dc-step-row">
        {STEPS.map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center"}}>
            <div className="dc-sdot">
              <div className={`dc-dot${step===i?" active":step>i?" done":""}`}>{step>i?"✓":i+1}</div>
              <span className={`dc-slbl${step===i?" active":step>i?" done":""}`}>{s}</span>
            </div>
            {i<STEPS.length-1&&<div className={`dc-sline${step>i?" done":""}`}/>}
          </div>
        ))}
      </div>
      {step===0&&(<div className="dc-card"><div className="dc-card-corner tl"/><div className="dc-card-corner tr"/><div className="dc-card-corner bl"/><div className="dc-card-corner br"/>
        <div className="dc-ct">What decision are you making?</div>
        <div className="dc-cd">Be specific. The quality of output depends on the precision of your framing.</div>
        <label className="dc-fl">Decision statement</label>
        <textarea className="dc-ta" rows={3} placeholder='e.g. "Which job offer should I accept?"' value={decision} onChange={e=>setDecision(e.target.value)}/>
        <div className="dc-hint">Tip: phrase it as a question with a finite set of answers.</div>
      </div>)}
      {step===1&&(<div className="dc-card"><div className="dc-card-corner tl"/><div className="dc-card-corner tr"/><div className="dc-card-corner bl"/><div className="dc-card-corner br"/>
        <div className="dc-ct">List your options</div>
        <div className="dc-cd">Add at least 2 alternatives. Include a "do nothing" option if relevant.</div>
        <label className="dc-fl">Add option</label>
        <div className="dc-add-row"><input className="dc-in" type="text" placeholder='"Stay at current job"' value={optInp} onChange={e=>setOptInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addOpt()}/><button className="dc-btn" onClick={addOpt}>Add</button></div>
        <div style={{display:"flex",flexWrap:"wrap",marginTop:10}}>{options.map(o=><div className="dc-tag" key={o}>{o}<button className="dc-trm" onClick={()=>setOptions(options.filter(x=>x!==o))}>×</button></div>)}</div>
      </div>)}
      {step===2&&(<div className="dc-card"><div className="dc-card-corner tl"/><div className="dc-card-corner tr"/><div className="dc-card-corner bl"/><div className="dc-card-corner br"/>
        <div className="dc-ct">Define your criteria</div>
        <div className="dc-cd">What factors matter? Add them and set their weight (1–5).</div>
        <label className="dc-fl">Add criterion</label>
        <div className="dc-add-row"><input className="dc-in" type="text" placeholder='"Compensation", "Growth potential"' value={critInp} onChange={e=>setCritInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCrit()}/><button className="dc-btn" onClick={addCrit}>Add</button></div>
        <div style={{marginTop:16}}>
          {criteria.map((c,i)=>(
            <div className="dc-ci" key={c.name}>
              <div className="dc-cn">{c.name}</div>
              <div className="dc-wdots">{[1,2,3,4,5].map(d=><div key={d} className={`dc-wd${c.weight>=d?" f":""}`}/>)}</div>
              <div className="dc-wc">
                <button className="dc-wb" onClick={()=>updW(i,-1)}>−</button>
                <span className="dc-wl">{c.weight}</span>
                <button className="dc-wb" onClick={()=>updW(i,1)}>+</button>
              </div>
              <button className="dc-trm" style={{fontSize:17,marginLeft:6}} onClick={()=>setCriteria(criteria.filter((_,j)=>j!==i))}>×</button>
            </div>
          ))}
        </div>
      </div>)}
      {step===3&&(<div className="dc-card"><div className="dc-card-corner tl"/><div className="dc-card-corner tr"/><div className="dc-card-corner bl"/><div className="dc-card-corner br"/>
        <div className="dc-ct">Score each option</div>
        <div className="dc-cd">Rate how well each option satisfies each criterion. 0 (poor) → 10 (excellent).</div>
        <div className="dc-sg"><table className="dc-st"><thead><tr><th style={{minWidth:120}}>Criterion</th><th style={{textAlign:"center"}}>Wt</th>{options.map(o=><th key={o} style={{textAlign:"center",minWidth:90}}>{o}</th>)}</tr></thead>
          <tbody>{criteria.map(c=><tr key={c.name}><td style={{fontSize:12,color:"#0d0d0d"}}>{c.name}</td><td style={{fontFamily:"'Azeret Mono',monospace",fontSize:10,color:"#c9a84c",textAlign:"center"}}>{c.weight}</td>{options.map(o=><td key={o}><div className="dc-sl"><input type="range" min="0" max="10" step="1" value={getScore(o,c.name)} onChange={e=>setScore(o,c.name,e.target.value)}/><span className="dc-sv">{getScore(o,c.name)}</span></div></td>)}</tr>)}</tbody>
        </table></div>
      </div>)}
      {step===4&&(<>
        <div className="dc-res">
          <div className="dc-rl">Recommended Choice</div>
          <div className="dc-rw">{results[0]?.name}</div>
          <div className="dc-rs">Weighted score: {results[0]?.score.toFixed(1)}%</div>
          <div className="dc-bars">{results.map((r,i)=><div key={r.name}><div className="dc-bar-h"><span className="dc-bn">{r.name}</span><span className="dc-bp">{r.score.toFixed(1)}%</span></div><div className="dc-bt"><div className={`dc-bf ${i===0?"dc-bfW":"dc-bfO"}`} style={{width:`${barW[r.name]??0}%`}}/></div></div>)}</div>
        </div>
        <div className="dc-bk">
          <div className="dc-bkt">Score Breakdown</div>
          {criteria.map(c=><div className="dc-bkr" key={c.name}><span className="dc-bkc">{c.name}</span><span className="dc-bkw">×{c.weight}</span><div className="dc-bks">{options.map(o=>{const v=getScore(o,c.name);return<span key={o} className={`dc-bkv ${scoreColor(v)}`}>{o.slice(0,8)}{o.length>8?"…":""}: {v}</span>;})}</div></div>)}
          {insight&&<div className="dc-ins">{insight}</div>}
        </div>
      </>)}
      <div className="dc-nav">
        <button className="dc-btn dc-btn-g" onClick={()=>setStep(s=>s-1)} disabled={step===0}>← Back</button>
        {step<4?<button className="dc-btn" onClick={()=>setStep(s=>s+1)} disabled={!canNext()}>{step===3?"See Results →":"Continue →"}</button>:<button className="dc-btn dc-btn-g" onClick={reset}>↺ New Decision</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// TOOL: ASSUMPTION AUDIT
// ─────────────────────────────────────────
const AA_CSS = `
.aa-app{min-height:100%;background:#0a0a0a;font-family:'DM Sans',sans-serif;color:#f0f0f0;display:flex;flex-direction:column;align-items:center;padding:48px 20px 100px;position:relative;}
.aa-app::before{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.012) 2px,rgba(255,255,255,.012) 4px);pointer-events:none;z-index:0;}
.aa-app>*{position:relative;z-index:1;}
.aa-hdr{width:100%;max-width:680px;margin-bottom:48px;border-bottom:1px solid #2e2e2e;padding-bottom:28px;}
.aa-hdr-meta{display:flex;align-items:center;gap:12px;margin-bottom:18px;}
.aa-tag{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#e63946;background:rgba(230,57,70,.12);border:1px solid rgba(230,57,70,.25);padding:4px 10px;}
.aa-suite{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#555;}
.aa-title{font-family:'Syne',sans-serif;font-size:clamp(32px,6vw,56px);font-weight:800;line-height:.95;letter-spacing:-2px;margin-bottom:14px;}
.aa-title em{font-style:normal;color:#e63946;}
.aa-sub{font-size:13px;color:#888;line-height:1.6;font-weight:300;max-width:460px;border-left:2px solid #e63946;padding-left:14px;}
.aa-phases{width:100%;max-width:680px;display:flex;gap:4px;margin-bottom:36px;}
.aa-ph{flex:1;height:3px;background:#222;border-radius:1px;transition:background .4s;}
.aa-ph.active{background:#e63946;}.aa-ph.done{background:#444;}
.aa-ph-lbls{width:100%;max-width:680px;display:flex;justify-content:space-between;margin-bottom:28px;}
.aa-phl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#444;transition:color .3s;}
.aa-phl.active{color:#e63946;}.aa-phl.done{color:#444;}
.aa-panel{width:100%;max-width:680px;background:#111;border:1px solid #2e2e2e;padding:36px;margin-bottom:14px;position:relative;animation:aaIn .3s ease;}
@keyframes aaIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.aa-notch{position:absolute;top:0;right:36px;width:36px;height:3px;background:#e63946;}
.aa-pt{font-family:'Syne',sans-serif;font-size:19px;font-weight:700;margin-bottom:6px;letter-spacing:-.5px;}
.aa-pd{font-size:12px;color:#888;line-height:1.65;margin-bottom:24px;font-weight:300;}
.aa-fl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#444;display:block;margin-bottom:9px;}
.aa-ta,.aa-in{width:100%;background:#0a0a0a;border:1px solid #2e2e2e;padding:13px 15px;font-family:'DM Sans',sans-serif;font-size:13px;color:#f0f0f0;outline:none;transition:border-color .2s;resize:none;}
.aa-ta:focus,.aa-in:focus{border-color:#e63946;}
.aa-ta::placeholder,.aa-in::placeholder{color:#444;font-style:italic;}
.aa-add-row{display:flex;gap:8px;margin-top:14px;}
.aa-add-row .aa-in{flex:1;}
.aa-hint{font-family:'Azeret Mono',monospace;font-size:9px;color:#444;margin-top:8px;line-height:1.6;}
.aa-item{border:1px solid #2e2e2e;background:#0a0a0a;border-left:3px solid #2e2e2e;padding:17px 18px;margin-bottom:8px;animation:aaSlide .25s ease;transition:border-left-color .3s;}
@keyframes aaSlide{from{opacity:0;transform:translateX(-5px);}to{opacity:1;transform:translateX(0);}}
.aa-item.blind-spot{border-left-color:#e63946;}.aa-item.caution{border-left-color:#f4a261;}.aa-item.solid{border-left-color:#52b788;}
.aa-ih{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:14px;}
.aa-it{font-size:13px;color:#f0f0f0;line-height:1.5;flex:1;}
.aa-ics{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.aa-cg{}
.aa-ct{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#444;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;}
.aa-cv{font-family:'Azeret Mono',monospace;font-size:10px;font-weight:600;}
.aa-rt{display:flex;gap:3px;}
.aa-rp{flex:1;height:5px;background:#2e2e2e;cursor:pointer;transition:background .15s;border-radius:1px;}
.aa-rp.ef{background:#60a5fa;}.aa-rp.wf{background:#f4a261;}
.aa-ev-lbls{display:flex;justify-content:space-between;margin-top:3px;}
.aa-el{font-family:'Azeret Mono',monospace;font-size:8px;color:#444;}
.aa-flag{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:3px 8px;border-radius:1px;}
.flag-blind{background:rgba(230,57,70,.12);color:#e63946;border:1px solid rgba(230,57,70,.3);}
.flag-caution{background:rgba(244,162,97,.12);color:#f4a261;border:1px solid rgba(244,162,97,.3);}
.flag-solid{background:rgba(82,183,136,.12);color:#52b788;border:1px solid rgba(82,183,136,.3);}
.flag-untested{background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.2);}
.aa-divider{height:1px;background:#2e2e2e;margin:18px 0;}
.aa-del{background:none;border:none;cursor:pointer;color:#444;font-size:17px;line-height:1;padding:2px 5px;transition:color .15s;}
.aa-del:hover{color:#e63946;}
.aa-nav{width:100%;max-width:680px;display:flex;justify-content:space-between;align-items:center;margin-top:10px;}
.aa-btn{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:11px 22px;border:1px solid #2e2e2e;background:#f0f0f0;color:#0a0a0a;cursor:pointer;transition:all .2s;}
.aa-btn:hover{background:#e63946;border-color:#e63946;color:#fff;}
.aa-btn:disabled{opacity:.3;cursor:not-allowed;}
.aa-btn:disabled:hover{background:#f0f0f0;color:#0a0a0a;border-color:#2e2e2e;}
.aa-btn-g{background:transparent;color:#888;border-color:#2e2e2e;}
.aa-btn-g:hover{background:#1a1a1a;color:#f0f0f0;border-color:#555;}
.aa-res-hdr{width:100%;max-width:680px;margin-bottom:20px;}
.aa-res-hl{font-family:'Syne',sans-serif;font-size:clamp(26px,5vw,44px);font-weight:800;line-height:1;letter-spacing:-1px;margin-bottom:6px;}
.aa-res-ctx{font-size:12px;color:#888;font-weight:300;}
.aa-res-strat{font-family:'Azeret Mono',monospace;font-size:10px;color:#444;border-left:2px solid #2e2e2e;padding-left:10px;margin-top:10px;line-height:1.6;}
.aa-stats{width:100%;max-width:680px;display:flex;gap:8px;margin-bottom:20px;}
.aa-stat{flex:1;background:#111;border:1px solid #2e2e2e;padding:18px;text-align:center;}
.aa-snum{font-family:'Syne',sans-serif;font-size:34px;font-weight:800;line-height:1;margin-bottom:4px;}
.aa-slbl{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#444;}
.aa-ins{width:100%;max-width:680px;border-left:3px solid #e63946;background:rgba(230,57,70,.08);padding:18px 22px;margin-bottom:20px;}
.aa-ins-lbl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#e63946;margin-bottom:7px;}
.aa-ins-txt{font-size:12px;color:#888;line-height:1.7;font-weight:300;}
.aa-mx{width:100%;max-width:680px;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;}
.aa-mc{background:#111;border:1px solid #2e2e2e;padding:18px;min-height:100px;}
.aa-mct{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.aa-mcd{width:7px;height:7px;border-radius:50%;}
.aa-blind .aa-mct{color:#e63946;}.aa-blind .aa-mcd{background:#e63946;}
.aa-caution .aa-mct{color:#f4a261;}.aa-caution .aa-mcd{background:#f4a261;}
.aa-solid .aa-mct{color:#52b788;}.aa-solid .aa-mcd{background:#52b788;}
.aa-low .aa-mct{color:#444;}.aa-low .aa-mcd{background:#2e2e2e;}
.aa-ma{font-size:11px;color:#888;line-height:1.5;padding:5px 0;border-bottom:1px solid #1a1a1a;}
.aa-ma:last-child{border-bottom:none;}
.aa-atbl{width:100%;max-width:680px;background:#111;border:1px solid #2e2e2e;margin-bottom:20px;}
.aa-atbl-hdr{padding:12px 22px;border-bottom:1px solid #2e2e2e;display:grid;grid-template-columns:1fr 70px 70px 90px;gap:10px;}
.aa-ath{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#444;text-align:center;}
.aa-ath:first-child{text-align:left;}
.aa-arow{padding:12px 22px;border-bottom:1px solid #1a1a1a;display:grid;grid-template-columns:1fr 70px 70px 90px;gap:10px;align-items:center;}
.aa-arow:last-child{border-bottom:none;}.aa-arow:hover{background:#1a1a1a;}
.aa-at{font-size:12px;color:#f0f0f0;line-height:1.4;}
.aa-av{font-family:'Azeret Mono',monospace;font-size:11px;text-align:center;}
.aa-af{display:flex;justify-content:center;}
.aa-rst-row{display:flex;justify-content:center;gap:10px;margin-top:16px;}
.aa-empty{font-size:11px;color:#444;font-style:italic;padding:8px 0;}
`;

const EVLBLS=["Gut feel","Anecdote","Proxy data","Validated","Verified"];
const WLBLS=["Trivial","Minor","Moderate","Important","Load-bearing"];
function aaFlag(ev:number,wt:number){if(wt>=4&&ev<=2)return"blind-spot";if(wt>=3&&ev<=2)return"caution";if(ev>=4)return"solid";return"untested";}
function AAFlag({flag}:{flag:string}){const m:Record<string,{c:string;l:string}>={"blind-spot":{c:"flag-blind",l:"Blind Spot"},caution:{c:"flag-caution",l:"Caution"},solid:{c:"flag-solid",l:"Solid"},untested:{c:"flag-untested",l:"Untested"}};const{c,l}=m[flag]||m.untested;return<span className={`aa-flag ${c}`}>{l}</span>;}

interface Assumption {
  text: string;
  evidence: number;
  weight: number;
}

function AssumptionAudit(){
  const [phase,setPhase]=useState(0);
  const [strategy,setStrategy]=useState("");
  const [aInp,setAInp]=useState("");
  const [assumptions,setAssumptions]=useState<Assumption[]>([]);
  const PHASES=["Strategy","Assumptions","Evidence","Audit"];

  const addA=()=>{const v=aInp.trim();if(!v)return;setAssumptions([...assumptions,{text:v,evidence:3,weight:3}]);setAInp("");};
  const remA=(i:number)=>setAssumptions(assumptions.filter((_,j)=>j!==i));
  const updA=(i:number,k:string,v:number)=>setAssumptions(assumptions.map((a,j)=>j===i?{...a,[k]:v}:a));
  const blindSpots=assumptions.filter(a=>aaFlag(a.evidence,a.weight)==="blind-spot");
  const cautions=assumptions.filter(a=>aaFlag(a.evidence,a.weight)==="caution");
  const solids=assumptions.filter(a=>aaFlag(a.evidence,a.weight)==="solid");
  const untested=assumptions.filter(a=>aaFlag(a.evidence,a.weight)==="untested");
  const genInsight=()=>{
    if(!assumptions.length)return null;
    if(blindSpots.length>=3)return`${blindSpots.length} critical blind spots — high-stakes beliefs on weak evidence. Treat each as a research blocker before committing resources.`;
    if(blindSpots.length===0&&solids.length>=assumptions.length*.6)return`Well-evidenced assumption base. Focus execution on the ${cautions.length+untested.length} remaining untested items.`;
    if(blindSpots.length===1)return`One blind spot: "${blindSpots[0]?.text}". This single assumption carries outsized risk — top research priority.`;
    return`Mixed profile: ${blindSpots.length} blind spot${blindSpots.length!==1?"s":""}, ${cautions.length} caution${cautions.length!==1?"s":""}, ${solids.length} solid. Prioritize blind spots first.`;
  };
  const canNext=()=>{if(phase===0)return strategy.trim().length>8;if(phase===1)return assumptions.length>=1;return true;};
  const reset=()=>{setPhase(0);setStrategy("");setAssumptions([]);setAInp("");};

  return(<div className="aa-app">
    <style>{AA_CSS}</style>
    <div className="aa-hdr">
      <div className="aa-hdr-meta"><span className="aa-tag">Audit Tool</span><span className="aa-suite">Decision Suite · 01 of 03</span></div>
      <div className="aa-title">Assumption<br/><em>Audit</em></div>
      <div className="aa-sub">Surface hidden beliefs. Rate each on evidence quality and load-bearing weight. Find blind spots before they find you.</div>
    </div>
    <div className="aa-phases">{PHASES.map((_,i)=><div key={i} className={`aa-ph${phase===i?" active":phase>i?" done":""}`}/>)}</div>
    <div className="aa-ph-lbls">{PHASES.map((p,i)=><span key={i} className={`aa-phl${phase===i?" active":phase>i?" done":""}`}>{p}</span>)}</div>

    {phase===0&&(<div className="aa-panel"><div className="aa-notch"/>
      <div className="aa-pt">State your strategy</div>
      <div className="aa-pd">Enter the plan or belief you want to examine.</div>
      <label className="aa-fl">Strategy / Plan / Belief</label>
      <textarea className="aa-ta" rows={4} placeholder={`e.g. "Hiring a VP of Sales will fix our pipeline problem"`} value={strategy} onChange={e=>setStrategy(e.target.value)}/>
    </div>)}

    {phase===1&&(<div className="aa-panel"><div className="aa-notch"/>
      <div className="aa-pt">Extract the assumptions</div>
      <div className="aa-pd">What must be true for this strategy to work?</div>
      <div className="aa-res-strat">"{strategy}"</div>
      <div className="aa-divider"/>
      <label className="aa-fl">Add assumption</label>
      <div className="aa-add-row"><input className="aa-in" type="text" placeholder='"Our target customers have budget now"' value={aInp} onChange={e=>setAInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addA()}/><button className="aa-btn" onClick={addA}>Add</button></div>
      <div className="aa-hint">// Press Enter to add. Aim for 5–10 assumptions.</div>
      <div style={{marginTop:18}}>{assumptions.length===0&&<div className="aa-empty">No assumptions added yet.</div>}{assumptions.map((a,i)=><div className="aa-item" key={i}><div className="aa-ih"><div className="aa-it">{a.text}</div><button className="aa-del" onClick={()=>remA(i)}>×</button></div></div>)}</div>
    </div>)}

    {phase===2&&(<div className="aa-panel"><div className="aa-notch"/>
      <div className="aa-pt">Rate each assumption</div>
      <div className="aa-pd">Set evidence quality and load-bearing weight for each.</div>
      {assumptions.map((a,i)=>{
        const flag=aaFlag(a.evidence,a.weight);
        return(<div className={`aa-item ${flag==="blind-spot"?"blind-spot":flag==="caution"?"caution":flag==="solid"?"solid":""}`} key={i}>
          <div className="aa-ih"><div className="aa-it">{a.text}</div><AAFlag flag={flag}/></div>
          <div className="aa-ics">
            <div className="aa-cg">
              <div className="aa-ct"><span>Evidence quality</span><span className="aa-cv" style={{color:"#60a5fa"}}>{EVLBLS[a.evidence-1]}</span></div>
              <div className="aa-rt">{[1,2,3,4,5].map(j=><div key={j} className={`aa-rp${a.evidence>j-1?" ef":""}`} onClick={()=>updA(i,"evidence",j)}/>)}</div>
              <div className="aa-ev-lbls"><span className="aa-el">Gut feel</span><span className="aa-el">Verified</span></div>
            </div>
            <div className="aa-cg">
              <div className="aa-ct"><span>Load-bearing</span><span className="aa-cv" style={{color:"#f4a261"}}>{WLBLS[a.weight-1]}</span></div>
              <div className="aa-rt">{[1,2,3,4,5].map(j=><div key={j} className={`aa-rp${a.weight>j-1?" wf":""}`} onClick={()=>updA(i,"weight",j)}/>)}</div>
              <div className="aa-ev-lbls"><span className="aa-el">Trivial</span><span className="aa-el">Critical</span></div>
            </div>
          </div>
        </div>);
      })}
    </div>)}

    {phase===3&&(<>
      <div className="aa-res-hdr">
        <div className="aa-res-hl">{blindSpots.length===0?"Defensible.":blindSpots.length<=2?"Manageable risk.":"High exposure."}</div>
        <div className="aa-res-ctx">Audit complete · {assumptions.length} assumptions examined</div>
        <div className="aa-res-strat">"{strategy}"</div>
      </div>
      <div className="aa-stats">
        <div className="aa-stat"><div className="aa-snum" style={{color:"#e63946"}}>{blindSpots.length}</div><div className="aa-slbl">Blind Spots</div></div>
        <div className="aa-stat"><div className="aa-snum" style={{color:"#f4a261"}}>{cautions.length}</div><div className="aa-slbl">Caution</div></div>
        <div className="aa-stat"><div className="aa-snum" style={{color:"#52b788"}}>{solids.length}</div><div className="aa-slbl">Solid</div></div>
        <div className="aa-stat"><div className="aa-snum" style={{color:"#888"}}>{untested.length}</div><div className="aa-slbl">Untested</div></div>
      </div>
      {genInsight()&&<div className="aa-ins"><div className="aa-ins-lbl">Audit Verdict</div><div className="aa-ins-txt">{genInsight()}</div></div>}
      <div className="aa-mx">
        {(["Blind Spots","Caution","Solid","Untested"] as const).map((label,idx)=>{
          const flags=["blind-spot","caution","solid","untested"];
          const classes=["aa-blind","aa-caution","aa-solid","aa-low"];
          const flag=flags[idx];
          const cls=classes[idx];
          const items=assumptions.filter(a=>aaFlag(a.evidence,a.weight)===flag);
          return(<div className={`aa-mc ${cls}`} key={flag}><div className="aa-mct"><div className="aa-mcd"/>{label}</div>{items.length===0?<div className="aa-empty">None identified.</div>:items.map((a,i)=><div className="aa-ma" key={i}>{a.text}</div>)}</div>);
        })}
      </div>
      <div className="aa-atbl">
        <div className="aa-atbl-hdr"><span className="aa-ath">Assumption</span><span className="aa-ath">Evidence</span><span className="aa-ath">Weight</span><span className="aa-ath">Status</span></div>
        {assumptions.map((a,i)=><div className="aa-arow" key={i}><div className="aa-at">{a.text}</div><div className="aa-av" style={{color:"#60a5fa"}}>{a.evidence}/5</div><div className="aa-av" style={{color:"#f4a261"}}>{a.weight}/5</div><div className="aa-af"><AAFlag flag={aaFlag(a.evidence,a.weight)}/></div></div>)}
      </div>
      <div className="aa-rst-row"><button className="aa-btn aa-btn-g" onClick={reset}>↺ New Audit</button><button className="aa-btn aa-btn-g" onClick={()=>setPhase(2)}>← Revise</button></div>
    </>)}

    {phase<3&&<div className="aa-nav"><button className="aa-btn aa-btn-g" onClick={()=>setPhase(p=>p-1)} disabled={phase===0}>← Back</button><button className="aa-btn" onClick={()=>setPhase(p=>p+1)} disabled={!canNext()}>{phase===2?"Generate Audit →":"Continue →"}</button></div>}
  </div>);
}

// ─────────────────────────────────────────
// TOOL: PRE-MORTEM STUDIO
// ─────────────────────────────────────────
const PM_CSS=`
.pm-app{min-height:100%;background:#0e1117;font-family:'DM Sans',sans-serif;color:#e8eaf0;padding:40px 20px 80px;display:flex;flex-direction:column;align-items:center;}
.pm-cmd{width:100%;max-width:760px;background:#141820;border:1px solid #2a3347;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;}
.pm-cmd-l{display:flex;align-items:center;gap:12px;}
.pm-badge{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);padding:3px 10px;}
.pm-title{font-family:'Syne',sans-serif;font-size:clamp(40px,7vw,72px);font-weight:800;line-height:.9;letter-spacing:1px;color:#e8eaf0;text-align:center;margin-bottom:20px;}
.pm-title span{color:#f59e0b;display:block;}
.pm-sub{font-size:13px;color:#8a9ab8;text-align:center;max-width:480px;line-height:1.7;font-weight:300;border-left:3px solid #f59e0b;padding-left:14px;margin-bottom:40px;}
.pm-stages{width:100%;max-width:760px;display:flex;align-items:center;gap:0;margin-bottom:36px;}
.pm-snode{display:flex;flex-direction:column;align-items:center;gap:6px;flex:0 0 auto;}
.pm-pip{width:9px;height:9px;border:2px solid #3a4a63;background:#0e1117;transition:all .3s;transform:rotate(45deg);}
.pm-pip.active{border-color:#f59e0b;background:#f59e0b;box-shadow:0 0 10px rgba(245,158,11,.3);}
.pm-pip.done{border-color:#4a5a78;background:#4a5a78;}
.pm-sname{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3a4a63;transition:color .3s;white-space:nowrap;}
.pm-sname.active{color:#f59e0b;}.pm-sname.done{color:#4a5a78;}
.pm-sline{flex:1;height:1px;background:#2a3347;margin-bottom:16px;min-width:20px;}
.pm-sline.done{background:#4a5a78;}
.pm-panel{width:100%;max-width:760px;background:#1a2030;border:1px solid #2a3347;border-top:3px solid #f59e0b;padding:32px;margin-bottom:14px;position:relative;animation:pmIn .35s ease;}
@keyframes pmIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.pm-pnum{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;color:#f59e0b;margin-bottom:5px;}
.pm-pt{font-family:'Syne',sans-serif;font-size:22px;letter-spacing:.5px;color:#e8eaf0;margin-bottom:7px;line-height:1;}
.pm-pd{font-size:12px;color:#8a9ab8;line-height:1.7;margin-bottom:24px;font-weight:300;}
.pm-fl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#3a4a63;display:block;margin-bottom:9px;}
.pm-ta,.pm-in{width:100%;background:#0e1117;border:1px solid #2a3347;padding:14px 16px;font-family:'DM Sans',sans-serif;font-size:13px;color:#e8eaf0;outline:none;transition:border-color .2s;resize:none;}
.pm-ta:focus,.pm-in:focus{border-color:#f59e0b;}
.pm-ta::placeholder,.pm-in::placeholder{color:#3a4a63;font-style:italic;}
.pm-obit-ctx{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);padding:12px 16px;margin-bottom:18px;font-family:'Courier Prime',monospace;font-size:11px;color:#f59e0b;line-height:1.6;}
.pm-cats{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;}
.pm-cat{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border:1px solid #2a3347;background:transparent;color:#3a4a63;cursor:pointer;transition:all .15s;}
.pm-cat.sel{border-color:#f59e0b;background:rgba(245,158,11,.1);color:#f59e0b;}
.pm-add-row{display:flex;gap:8px;margin-top:12px;}
.pm-add-row .pm-in{flex:1;}
.pm-hint{font-family:'Courier Prime',monospace;font-size:10px;color:#3a4a63;margin-top:8px;line-height:1.6;}
.pm-fcard{background:#0e1117;border:1px solid #2a3347;border-left:3px solid #3a4a63;padding:16px 18px;margin-bottom:8px;animation:pmSlide .2s ease;transition:border-left-color .3s;}
@keyframes pmSlide{from{opacity:0;transform:translateX(-6px);}to{opacity:1;transform:translateX(0);}}
.pm-fcard.cat-execution{border-left-color:#ef4444;}.pm-fcard.cat-market{border-left-color:#fb923c;}.pm-fcard.cat-resource{border-left-color:#f59e0b;}.pm-fcard.cat-people{border-left-color:#60a5fa;}.pm-fcard.cat-timing{border-left-color:#a78bfa;}.pm-fcard.cat-external{border-left-color:#10b981;}
.pm-fh{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}
.pm-ft{font-size:13px;color:#e8eaf0;line-height:1.5;flex:1;}
.pm-cbadge{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:2px 7px;border:1px solid;white-space:nowrap;flex-shrink:0;}
.cb-execution{color:#ef4444;border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.08);}
.cb-market{color:#fb923c;border-color:rgba(251,146,60,.3);background:rgba(251,146,60,.08);}
.cb-resource{color:#f59e0b;border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.08);}
.cb-people{color:#60a5fa;border-color:rgba(96,165,250,.3);background:rgba(96,165,250,.08);}
.cb-timing{color:#a78bfa;border-color:rgba(167,139,250,.3);background:rgba(167,139,250,.08);}
.cb-external{color:#10b981;border-color:rgba(16,185,129,.3);background:rgba(16,185,129,.08);}
.pm-rrow{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.pm-rg{}
.pm-rh{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
.pm-rn{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#3a4a63;}
.pm-rv{font-family:'Courier Prime',monospace;font-size:10px;font-weight:700;}
.pm-rt{display:flex;gap:3px;}
.pm-rp{flex:1;height:4px;background:#2a3347;cursor:pointer;transition:background .15s;}
.pm-rp.prob-f{background:#fb923c;}.pm-rp.impact-f{background:#ef4444;}
.pm-del{background:none;border:none;color:#3a4a63;cursor:pointer;font-size:17px;line-height:1;padding:2px 5px;transition:color .15s;}
.pm-del:hover{color:#ef4444;}
.pm-risk-lbl{font-family:'Courier Prime',monospace;font-size:11px;font-weight:700;}
.pm-alert{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-left:3px solid #f59e0b;padding:12px 16px;margin-bottom:16px;font-family:'Azeret Mono',monospace;font-size:10px;color:#f59e0b;line-height:1.6;}
.pm-sc{background:#0e1117;border:1px solid #2a3347;padding:18px;margin-bottom:8px;}
.pm-sct{font-size:12px;color:#8a9ab8;margin-bottom:10px;display:flex;align-items:flex-start;gap:8px;line-height:1.5;}
.pm-sarr{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;color:#ef4444;flex-shrink:0;margin-top:2px;}
.pm-sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.pm-nav{width:100%;max-width:760px;display:flex;justify-content:space-between;align-items:center;margin-top:10px;}
.pm-btn{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:11px 22px;border:1px solid #8a9ab8;background:#e8eaf0;color:#0e1117;cursor:pointer;transition:all .2s;}
.pm-btn:hover{background:#f59e0b;border-color:#f59e0b;color:#0e1117;}
.pm-btn:disabled{opacity:.3;cursor:not-allowed;}
.pm-btn:disabled:hover{background:#e8eaf0;color:#0e1117;border-color:#8a9ab8;}
.pm-btn-g{background:transparent;color:#8a9ab8;border-color:#2a3347;}
.pm-btn-g:hover{background:#1f2738;color:#e8eaf0;border-color:#8a9ab8;}
.pm-rep-hdr{width:100%;max-width:760px;background:#f59e0b;padding:28px 32px;margin-bottom:3px;position:relative;overflow:hidden;}
.pm-rep-hdr::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(-45deg,transparent,transparent 6px,rgba(245,158,11,.08) 6px,rgba(245,158,11,.08) 12px);}
.pm-rep-hdr>*{position:relative;}
.pm-rep-cls{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(0,0,0,.5);margin-bottom:6px;}
.pm-rep-t{font-family:'Syne',sans-serif;font-size:clamp(28px,5vw,44px);letter-spacing:1px;color:#0e1117;line-height:1;margin-bottom:4px;font-weight:800;}
.pm-rep-s{font-size:12px;color:rgba(0,0,0,.6);font-weight:300;font-style:italic;}
.pm-rep-meta{display:flex;gap:20px;margin-top:14px;flex-wrap:wrap;}
.pm-rmi{font-family:'Azeret Mono',monospace;font-size:9px;color:rgba(0,0,0,.5);}
.pm-rmi strong{display:block;color:rgba(0,0,0,.7);font-size:10px;margin-bottom:1px;}
.pm-stats{width:100%;max-width:760px;display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-bottom:3px;}
.pm-stile{background:#1a2030;border:1px solid #2a3347;padding:18px;text-align:center;}
.pm-snum{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;line-height:1;margin-bottom:4px;}
.pm-slbl{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3a4a63;}
.pm-verd{width:100%;max-width:760px;background:#0e1117;border:1px solid #2a3347;border-left:4px solid #f59e0b;padding:22px 26px;margin:3px 0;}
.pm-vl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#f59e0b;margin-bottom:8px;}
.pm-vt{font-size:13px;color:#8a9ab8;line-height:1.8;font-weight:300;}
.pm-ttbl{width:100%;max-width:760px;background:#1a2030;border:1px solid #2a3347;margin:3px 0;}
.pm-ttbl-hdr{padding:12px 22px;border-bottom:1px solid #2a3347;display:grid;grid-template-columns:1fr 80px 60px 60px 100px;gap:10px;}
.pm-th{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#3a4a63;text-align:center;}
.pm-th:first-child{text-align:left;}
.pm-trow{padding:12px 22px;border-bottom:1px solid #1f2738;display:grid;grid-template-columns:1fr 80px 60px 60px 100px;gap:10px;align-items:center;transition:background .15s;}
.pm-trow:last-child{border-bottom:none;}.pm-trow:hover{background:#1f2738;}
.pm-tn{font-size:12px;color:#e8eaf0;line-height:1.4;}
.pm-ts{font-family:'Courier Prime',monospace;font-size:11px;font-weight:700;text-align:center;}
.pm-sc-c{color:#ef4444;}.pm-sc-h{color:#fb923c;}.pm-sc-m{color:#f59e0b;}.pm-sc-l{color:#3a4a63;}
.pm-bw{display:flex;align-items:center;gap:5px;}
.pm-bt{flex:1;height:3px;background:#2a3347;overflow:hidden;}
.pm-bf{height:100%;transition:width .8s ease;}
.pm-srep{width:100%;max-width:760px;background:#1a2030;border:1px solid #2a3347;margin:3px 0;}
.pm-srep-h{padding:12px 22px;border-bottom:1px solid #2a3347;font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#3a4a63;}
.pm-srep-r{padding:16px 22px;border-bottom:1px solid #1f2738;transition:background .15s;}
.pm-srep-r:last-child{border-bottom:none;}.pm-srep-r:hover{background:#1f2738;}
.pm-srt{font-size:11px;color:#3a4a63;margin-bottom:6px;font-style:italic;}
.pm-srm{font-size:12px;color:#e8eaf0;line-height:1.5;margin-bottom:5px;}
.pm-srs{font-family:'Courier Prime',monospace;font-size:10px;color:#10b981;display:flex;align-items:flex-start;gap:5px;}
.pm-rst-row{display:flex;gap:10px;justify-content:center;margin-top:16px;}
`;

const PM_CATS=[{id:"execution",l:"Execution"},{id:"market",l:"Market"},{id:"resource",l:"Resource"},{id:"people",l:"People"},{id:"timing",l:"Timing"},{id:"external",l:"External"}];
const PM_PROB=["Unlikely","Possible","Likely","Probable","Near-certain"];
const PM_IMP=["Negligible","Minor","Moderate","Severe","Fatal"];
function pmRiskScore(p:number,i:number){return p*i;}
function pmRiskLabel(s:number){if(s>=20)return{l:"CRITICAL",cls:"pm-sc-c"};if(s>=12)return{l:"HIGH",cls:"pm-sc-h"};if(s>=6)return{l:"MODERATE",cls:"pm-sc-m"};return{l:"LOW",cls:"pm-sc-l"};}

interface PMFailure {
  id: string;
  text: string;
  cat: string;
  prob: number;
  impact: number;
}

function PreMortemStudio(){
  const STAGES=["Mission","Obituary","Failures","Rating","Shield","Brief"];
  const [stage,setStage]=useState(0);
  const [mission,setMission]=useState("");
  const [timeframe,setTimeframe]=useState("12 months");
  const [obituary,setObituary]=useState("");
  const [fInp,setFInp]=useState("");
  const [selCat,setSelCat]=useState("execution");
  const [failures,setFailures]=useState<PMFailure[]>([]);
  const [shields,setShields]=useState<Record<string,{mitigation:string;signal:string}>>({});
  const [barW,setBarW]=useState<Record<string,number>>({});

  const addF=()=>{const v=fInp.trim();if(!v)return;const id=Date.now().toString();setFailures([...failures,{id,text:v,cat:selCat,prob:3,impact:3}]);setFInp("");};
  const remF=(id:string)=>setFailures(failures.filter(f=>f.id!==id));
  const updF=(id:string,k:string,v:number)=>setFailures(failures.map(f=>f.id===id?{...f,[k]:v}:f));
  const getS=(id:string)=>shields[id]||{mitigation:"",signal:""};
  const updS=(id:string,k:string,v:string)=>setShields(p=>({...p,[id]:{...getS(id),[k]:v}}));

  const sorted=[...failures].sort((a,b)=>pmRiskScore(b.prob,b.impact)-pmRiskScore(a.prob,a.impact));
  const critical=failures.filter(f=>pmRiskScore(f.prob,f.impact)>=20);
  const high=failures.filter(f=>{const s=pmRiskScore(f.prob,f.impact);return s>=12&&s<20;});
  const priority=failures.filter(f=>pmRiskScore(f.prob,f.impact)>=12);
  const today=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

  useEffect(()=>{
    if(stage===5){setTimeout(()=>{const w:Record<string,number>={};const maxS=Math.max(...failures.map(f=>pmRiskScore(f.prob,f.impact)),1);failures.forEach(f=>{w[f.id]=(pmRiskScore(f.prob,f.impact)/maxS)*100;});setBarW(w);},100);}
  },[stage]);

  const verdict=()=>{
    if(critical.length===0&&high.length===0)return"Low overall risk profile. No critical failure modes identified. Standard monitoring recommended.";
    if(critical.length>=3)return`High-risk venture. ${critical.length} critical failure modes identified — each capable of killing the project independently. Do not proceed without addressing at minimum the top 2.`;
    if(critical.length>=1)return`${critical.length} critical failure mode${critical.length>1?"s":""} identified. These require immediate mitigation before full resource commitment.`;
    return`${high.length} high-risk failure mode${high.length>1?"s":""} identified. Manageable with proper mitigation, but monitor closely.`;
  };
  const canNext=()=>{if(stage===0)return mission.trim().length>5;if(stage===1)return obituary.trim().length>10;if(stage===2)return failures.length>=1;return true;};
  const reset=()=>{setStage(0);setMission("");setTimeframe("12 months");setObituary("");setFailures([]);setFInp("");setSelCat("execution");setShields({});setBarW({});};

  return(<div className="pm-app">
    <style>{PM_CSS}</style>
    <div className="pm-cmd"><div className="pm-cmd-l"><span className="pm-badge">Pre-Mortem</span></div><span style={{fontFamily:"'Azeret Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase" as const,color:"#3a4a63"}}>Decision Suite · Risk Analysis</span></div>
    <div className="pm-title">PRE<span>MORTEM</span></div>
    <div className="pm-sub">Imagine the project has already failed. Work backwards to find what killed it — before it happens.</div>

    <div className="pm-stages">
      {STAGES.map((s,i)=>(
        <div key={s} style={{display:"flex",alignItems:"center",flex:i<STAGES.length-1?1:"0 0 auto"}}>
          <div className="pm-snode">
            <div className={`pm-pip${stage===i?" active":stage>i?" done":""}`}/>
            <span className={`pm-sname${stage===i?" active":stage>i?" done":""}`}>{s}</span>
          </div>
          {i<STAGES.length-1&&<div className={`pm-sline${stage>i?" done":""}`}/>}
        </div>
      ))}
    </div>

    {stage===0&&(<div className="pm-panel">
      <div className="pm-pnum">01 / Mission</div><div className="pm-pt">Define the mission</div>
      <div className="pm-pd">What project, initiative, or decision are we stress-testing?</div>
      <label className="pm-fl">Mission statement</label>
      <textarea className="pm-ta" rows={3} placeholder='"Launch the B2B SaaS product by Q3"' value={mission} onChange={e=>setMission(e.target.value)}/>
      <div style={{marginTop:14}}><label className="pm-fl">Timeframe</label>
      <input className="pm-in" type="text" placeholder="12 months" value={timeframe} onChange={e=>setTimeframe(e.target.value)}/></div>
    </div>)}

    {stage===1&&(<div className="pm-panel">
      <div className="pm-pnum">02 / Obituary</div><div className="pm-pt">Write the obituary</div>
      <div className="pm-pd">It's {timeframe} from now. The project failed spectacularly. Write what happened.</div>
      <div className="pm-obit-ctx">Mission: "{mission}" — Timeframe: {timeframe}</div>
      <label className="pm-fl">The obituary</label>
      <textarea className="pm-ta" rows={6} placeholder="Describe the failure in detail. What went wrong? Who was affected? What was the final straw?" value={obituary} onChange={e=>setObituary(e.target.value)}/>
    </div>)}

    {stage===2&&(<div className="pm-panel">
      <div className="pm-pnum">03 / Failure Modes</div><div className="pm-pt">Extract the failure modes</div>
      <div className="pm-pd">From your obituary, list the specific things that went wrong.</div>
      <div className="pm-cats">{PM_CATS.map(c=><button key={c.id} className={`pm-cat${selCat===c.id?" sel":""}`} onClick={()=>setSelCat(c.id)}>{c.l}</button>)}</div>
      <div className="pm-add-row"><input className="pm-in" type="text" placeholder="Describe a specific failure mode…" value={fInp} onChange={e=>setFInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addF()}/><button className="pm-btn" onClick={addF}>Add</button></div>
      <div className="pm-hint">// Categorize each failure. Press Enter to add.</div>
      <div style={{marginTop:18}}>{failures.map(f=><div className={`pm-fcard cat-${f.cat}`} key={f.id}><div className="pm-fh"><div className="pm-ft">{f.text}</div><span className={`pm-cbadge cb-${f.cat}`}>{PM_CATS.find(c=>c.id===f.cat)?.l}</span><button className="pm-del" onClick={()=>remF(f.id)}>×</button></div></div>)}</div>
    </div>)}

    {stage===3&&(<div className="pm-panel">
      <div className="pm-pnum">04 / Risk Rating</div><div className="pm-pt">Rate each failure</div>
      <div className="pm-pd">Set probability and impact for each failure mode.</div>
      {failures.map(f=>{const score=pmRiskScore(f.prob,f.impact);const{l,cls}=pmRiskLabel(score);
        return(<div className={`pm-fcard cat-${f.cat}`} key={f.id}>
          <div className="pm-fh"><div className="pm-ft">{f.text}</div><span className={`pm-cbadge cb-${f.cat}`}>{PM_CATS.find(c=>c.id===f.cat)?.l}</span></div>
          <div className="pm-rrow">
            <div className="pm-rg"><div className="pm-rh"><span className="pm-rn">Probability</span><span className="pm-rv" style={{color:"#fb923c"}}>{PM_PROB[f.prob-1]}</span></div><div className="pm-rt">{[1,2,3,4,5].map(j=><div key={j} className={`pm-rp${f.prob>=j?" prob-f":""}`} onClick={()=>updF(f.id,"prob",j)}/>)}</div></div>
            <div className="pm-rg"><div className="pm-rh"><span className="pm-rn">Impact</span><span className="pm-rv" style={{color:"#ef4444"}}>{PM_IMP[f.impact-1]}</span></div><div className="pm-rt">{[1,2,3,4,5].map(j=><div key={j} className={`pm-rp${f.impact>=j?" impact-f":""}`} onClick={()=>updF(f.id,"impact",j)}/>)}</div></div>
          </div>
          <div style={{marginTop:10,display:"flex",justifyContent:"flex-end"}}><span className={`pm-risk-lbl ${cls}`}>Risk: {l} ({score})</span></div>
        </div>);
      })}
    </div>)}

    {stage===4&&(<div className="pm-panel">
      <div className="pm-pnum">05 / Shield Protocol</div><div className="pm-pt">Build your defenses</div>
      <div className="pm-pd">For each critical/high-risk failure: define a mitigation and an early warning signal.</div>
      {priority.length===0&&<div className="pm-alert">No critical or high-risk failures identified. Proceed to brief.</div>}
      {priority.map(f=>{
        const score=pmRiskScore(f.prob,f.impact);const{l}=pmRiskLabel(score);const sh=getS(f.id);
        return(<div className="pm-sc" key={f.id}>
          <div className="pm-sct"><span className="pm-sarr">▸ {l}</span>{f.text}<span className={`pm-cbadge cb-${f.cat}`}>{PM_CATS.find(c=>c.id===f.cat)?.l}</span></div>
          <div className="pm-sgrid">
            <div><label className="pm-fl">Mitigation plan</label><textarea className="pm-ta" rows={3} placeholder="What specific action reduces this risk?" value={sh.mitigation} onChange={e=>updS(f.id,"mitigation",e.target.value)}/></div>
            <div><label className="pm-fl">Early warning signal</label><textarea className="pm-ta" rows={3} placeholder="What leading indicator tells you this is about to happen?" value={sh.signal} onChange={e=>updS(f.id,"signal",e.target.value)}/></div>
          </div>
        </div>);
      })}
    </div>)}

    {stage===5&&(<>
      <div className="pm-rep-hdr"><div className="pm-rep-cls">Pre-Mortem Analysis · Confidential</div><div className="pm-rep-t">Pre-Mortem Brief</div><div className="pm-rep-s">Re: {mission}</div>
        <div className="pm-rep-meta"><div className="pm-rmi"><strong>Timeframe</strong>{timeframe}</div><div className="pm-rmi"><strong>Failures</strong>{failures.length}</div><div className="pm-rmi"><strong>Critical</strong>{critical.length}</div><div className="pm-rmi"><strong>Date</strong>{today}</div></div>
      </div>
      <div className="pm-stats">
        <div className="pm-stile"><div className="pm-snum" style={{color:"#ef4444"}}>{critical.length}</div><div className="pm-slbl">Critical</div></div>
        <div className="pm-stile"><div className="pm-snum" style={{color:"#fb923c"}}>{high.length}</div><div className="pm-slbl">High Risk</div></div>
        <div className="pm-stile"><div className="pm-snum" style={{color:"#8a9ab8"}}>{failures.length-critical.length-high.length}</div><div className="pm-slbl">Manageable</div></div>
        <div className="pm-stile"><div className="pm-snum" style={{color:"#10b981"}}>{priority.length}</div><div className="pm-slbl">Mitigated</div></div>
      </div>
      <div className="pm-verd"><div className="pm-vl">▸ Analysis Verdict</div><div className="pm-vt">{verdict()}</div></div>
      <div className="pm-ttbl">
        <div className="pm-ttbl-hdr"><span className="pm-th">Failure Mode</span><span className="pm-th">Category</span><span className="pm-th">Prob</span><span className="pm-th">Impact</span><span className="pm-th">Risk Level</span></div>
        {sorted.map(f=>{const score=pmRiskScore(f.prob,f.impact);const{l,cls}=pmRiskLabel(score);const barColor=cls==="pm-sc-c"?"#ef4444":cls==="pm-sc-h"?"#fb923c":cls==="pm-sc-m"?"#f59e0b":"#3a4a63";
          return(<div className="pm-trow" key={f.id}><div className="pm-tn">{f.text}</div><div style={{textAlign:"center"}}><span className={`pm-cbadge cb-${f.cat}`}>{PM_CATS.find(c=>c.id===f.cat)?.l}</span></div><div className="pm-ts" style={{color:"#fb923c"}}>{f.prob}/5</div><div className="pm-ts" style={{color:"#ef4444"}}>{f.impact}/5</div><div className="pm-bw"><div className="pm-bt"><div className="pm-bf" style={{width:`${barW[f.id]??0}%`,background:barColor}}/></div><span className={`pm-ts ${cls}`} style={{fontSize:9,minWidth:52}}>{l}</span></div></div>);
        })}
      </div>
      {priority.length>0&&<div className="pm-srep"><div className="pm-srep-h">Shield Protocol — Mitigation Registry</div>{priority.map(f=>{const sh=getS(f.id);if(!sh.mitigation&&!sh.signal)return null;return(<div className="pm-srep-r" key={f.id}><div className="pm-srt">▸ {f.text}</div>{sh.mitigation&&<div className="pm-srm"><strong style={{color:"#f59e0b",fontFamily:"'Azeret Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase" as const}}>Mitigation — </strong>{sh.mitigation}</div>}{sh.signal&&<div className="pm-srs"><span style={{color:"#3a4a63"}}>SIGNAL //</span>{sh.signal}</div>}</div>);})}</div>}
      <div className="pm-rst-row"><button className="pm-btn pm-btn-g" onClick={reset}>↺ New Pre-Mortem</button><button className="pm-btn pm-btn-g" onClick={()=>setStage(4)}>← Revise Shield</button></div>
    </>)}

    {stage<5&&<div className="pm-nav"><button className="pm-btn pm-btn-g" onClick={()=>setStage(s=>s-1)} disabled={stage===0}>← Back</button><button className="pm-btn" onClick={()=>setStage(s=>s+1)} disabled={!canNext()}>{stage===4?"Generate Brief →":"Continue →"}</button></div>}
  </div>);
}

// ─────────────────────────────────────────
// TOOL: COMMITMENT LEDGER
// ─────────────────────────────────────────
const CL_CSS=`
.cl-app{min-height:100%;background:#f6f1e7;font-family:'DM Sans',sans-serif;color:#1c2b1e;}
.cl-mast{background:#1a3a2a;padding:36px 40px 28px;position:relative;overflow:hidden;}
.cl-mast::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:repeating-linear-gradient(90deg,#c9a84c 0,#c9a84c 10px,transparent 10px,transparent 16px);}
.cl-mast-vol{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#6b8c72;margin-bottom:14px;display:flex;align-items:center;gap:12px;}
.cl-mast-vol::before,.cl-mast-vol::after{content:'';display:block;height:1px;width:28px;background:#3a5040;}
.cl-mast-t{font-family:'Syne',sans-serif;font-size:clamp(30px,5vw,52px);font-weight:800;letter-spacing:-1px;line-height:.95;color:#fff;margin-bottom:10px;}
.cl-mast-t em{font-family:'Newsreader',serif;font-style:italic;font-weight:400;color:#c9a84c;}
.cl-mast-s{font-size:12px;color:#6b8c72;font-style:italic;max-width:400px;line-height:1.7;margin-bottom:18px;}
.cl-mast-stats{display:flex;gap:28px;}
.cl-ms{text-align:center;}
.cl-msn{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#fff;line-height:1;margin-bottom:2px;}
.cl-msl{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#6b8c72;}
.cl-mss{width:1px;height:28px;background:#3a5040;align-self:center;}
.cl-int{width:100%;padding:20px 40px 0;}
.cl-int-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
.cl-int-n{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#6b8c72;}
.cl-int-pct{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#1a3a2a;}
.cl-int-track{height:7px;background:#e2dcd0;border:1px solid rgba(28,43,30,.1);overflow:hidden;}
.cl-int-fill{height:100%;background:linear-gradient(90deg,#2d5c3f,#4a8c60);transition:width 1s ease;}
.cl-int-v{font-family:'DM Sans',sans-serif;font-style:italic;font-size:11px;color:#6b8c72;margin-top:5px;text-align:right;}
.cl-tabs{display:flex;gap:0;border-bottom:2px solid rgba(28,43,30,.1);padding:28px 40px 0;background:transparent;}
.cl-tab{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b8c72;padding:9px 18px 11px;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;background:none;border-top:none;border-left:none;border-right:none;transition:all .2s;}
.cl-tab:hover{color:#1c2b1e;}
.cl-tab.active{color:#1a3a2a;border-bottom-color:#1a3a2a;font-weight:600;}
.cl-content{padding:28px 40px;background:transparent;}
.cl-top-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
.cl-pending-info{font-family:'Newsreader',serif;font-style:italic;font-size:12px;color:#6b8c72;}
.cl-form{background:#fff;border:1px solid #e2dcd0;border-left:4px solid #1a3a2a;padding:24px;margin-bottom:24px;box-shadow:2px 2px 0 #e2dcd0;animation:clFade .3s ease;}
@keyframes clFade{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
.cl-ft{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#1a3a2a;margin-bottom:18px;display:flex;align-items:center;gap:10px;}
.cl-ft::after{content:'';flex:1;height:1px;background:rgba(28,43,30,.1);}
.cl-fl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#6b8c72;display:block;margin-bottom:8px;}
.cl-in,.cl-ta,.cl-sel{width:100%;background:#f6f1e7;border:1px solid #e2dcd0;border-bottom:1px solid rgba(28,43,30,.15);padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:13px;color:#1c2b1e;outline:none;transition:border-color .2s;resize:none;appearance:none;}
.cl-in:focus,.cl-ta:focus,.cl-sel:focus{border-color:#1a3a2a;background:#fff;}
.cl-in::placeholder,.cl-ta::placeholder{color:#9ab89f;font-style:italic;}
.cl-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
.cl-form-row{margin-bottom:14px;}
.cl-cats{display:flex;flex-wrap:wrap;gap:5px;}
.cl-cat{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border:1px solid #e2dcd0;background:#f6f1e7;color:#6b8c72;cursor:pointer;transition:all .15s;}
.cl-cat:hover{border-color:#6b8c72;color:#1c2b1e;}
.cl-cat.active{background:#1a3a2a;border-color:#1a3a2a;color:#fff;}
.cl-stakes-row{display:flex;align-items:center;gap:10px;}
.cl-strack{flex:1;display:flex;gap:3px;}
.cl-sp{flex:1;height:7px;background:#e2dcd0;cursor:pointer;transition:background .15s;border:1px solid rgba(28,43,30,.06);}
.cl-sp.f{background:#2d5c3f;border-color:#2d5c3f;}
.cl-slbl-txt{font-family:'Azeret Mono',monospace;font-size:9px;color:#6b8c72;white-space:nowrap;min-width:70px;}
.cl-form-btns{display:flex;justify-content:flex-end;gap:7px;margin-top:8px;}
.cl-btn{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:600;padding:10px 20px;border:2px solid #1a3a2a;background:#1a3a2a;color:#fff;cursor:pointer;transition:all .2s;}
.cl-btn:hover{background:#2d5c3f;border-color:#2d5c3f;}
.cl-btn:disabled{opacity:.35;cursor:not-allowed;}
.cl-btn-g{background:transparent;color:#6b8c72;border-color:#e2dcd0;}
.cl-btn-g:hover{background:#ede8dc;color:#1c2b1e;border-color:#6b8c72;}
.cl-btn-sm{padding:5px 12px;font-size:9px;}
.cl-sec{margin-bottom:28px;}
.cl-sec-hdr{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.cl-sec-t{font-family:'Newsreader',serif;font-style:italic;font-size:13px;color:#6b8c72;white-space:nowrap;}
.cl-sec-line{flex:1;height:1px;background:rgba(28,43,30,.12);}
.cl-sec-cnt{font-family:'Azeret Mono',monospace;font-size:9px;color:#9ab89f;white-space:nowrap;}
.cl-entry{background:#fff;border:1px solid #e2dcd0;border-left:4px solid #8a9ab8;padding:14px 18px;margin-bottom:5px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start;transition:all .2s;animation:clEntry .25s ease;}
@keyframes clEntry{from{opacity:0;transform:translateX(-5px);}to{opacity:1;transform:translateX(0);}}
.cl-entry:hover{box-shadow:2px 2px 0 #e2dcd0;}
.cl-entry.kept{border-left-color:#52b788;background:#e8f5ec;}
.cl-entry.broken{border-left-color:#c0392b;background:#fae8e8;}
.cl-entry.deferred{border-left-color:#c9a84c;background:#fef3e2;}
.cl-entry.overdue{border-left-color:#c0392b;}
.cl-et{font-size:13px;color:#1c2b1e;line-height:1.5;margin-bottom:7px;}
.cl-entry.kept .cl-et{text-decoration:line-through;color:#6b8c72;}
.cl-emeta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}
.cl-ebadge{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;padding:2px 7px;border:1px solid #e2dcd0;color:#6b8c72;background:#f6f1e7;}
.cl-edate{font-family:'Azeret Mono',monospace;font-size:9px;color:#9ab89f;display:flex;align-items:center;gap:3px;}
.cl-edate.overdue{color:#c0392b;font-weight:600;}.cl-edate.due-soon{color:#7a5c10;font-weight:600;}
.cl-sdots{display:flex;gap:2px;}
.cl-sd{width:5px;height:5px;background:#e2dcd0;border:1px solid rgba(28,43,30,.1);}
.cl-sd.f{background:#2d5c3f;border-color:#2d5c3f;}
.cl-ectl{display:flex;flex-direction:column;gap:4px;align-items:flex-end;}
.cl-stamp{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:3px 9px;border:2px solid;font-weight:700;white-space:nowrap;}
.cl-stamp-pending{color:#8a9ab8;border-color:#8a9ab8;background:#edf0f5;}
.cl-stamp-kept{color:#2d6a4f;border-color:#52b788;background:#e8f5ec;}
.cl-stamp-broken{color:#8b2020;border-color:#c0392b;background:#fae8e8;}
.cl-stamp-deferred{color:#7a5c10;border-color:#c9a84c;background:#fef3e2;}
.cl-abtns{display:flex;gap:3px;}
.cl-ab{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:1px;text-transform:uppercase;padding:3px 7px;border:1px solid #e2dcd0;background:#f6f1e7;color:#6b8c72;cursor:pointer;transition:all .15s;}
.cl-ab:hover{background:#1a3a2a;border-color:#1a3a2a;color:#fff;}
.cl-ab.del:hover{background:#c0392b;border-color:#c0392b;}
.cl-empty{text-align:center;padding:48px 20px;font-family:'Newsreader',serif;font-style:italic;font-size:17px;color:#9ab89f;border:1px dashed #e2dcd0;background:#fff;}
.cl-empty span{display:block;font-family:'Azeret Mono',monospace;font-style:normal;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#9ab89f;margin-top:7px;}
.cl-pat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.cl-pc{background:#fff;border:1px solid #e2dcd0;padding:18px;box-shadow:2px 2px 0 #e2dcd0;}
.cl-pct{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#6b8c72;margin-bottom:14px;padding-bottom:9px;border-bottom:1px solid rgba(28,43,30,.06);}
.cl-pbi{margin-bottom:10px;}
.cl-pbh{display:flex;justify-content:space-between;margin-bottom:4px;}
.cl-pbn{font-family:'DM Sans',sans-serif;font-size:12px;color:#1c2b1e;}
.cl-pbp{font-family:'Azeret Mono',monospace;font-size:10px;color:#6b8c72;}
.cl-pt{height:5px;background:#e2dcd0;border:1px solid rgba(28,43,30,.05);overflow:hidden;}
.cl-pf{height:100%;background:linear-gradient(90deg,#2d5c3f,#4a8c60);transition:width .8s ease;}
.cl-pf.low{background:linear-gradient(90deg,#8b2020,#c0392b);}
.cl-pf.mid{background:linear-gradient(90deg,#7a5c10,#c9a84c);}
.cl-ins{background:#fff;border:1px solid #e2dcd0;border-left:4px solid #c9a84c;padding:16px 18px;margin-bottom:9px;box-shadow:2px 2px 0 #e2dcd0;}
.cl-ins-lbl{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#7a5c10;margin-bottom:7px;}
.cl-ins-txt{font-family:'DM Sans',sans-serif;font-style:italic;font-size:12px;color:#3a5040;line-height:1.8;}
.cl-no-data{font-family:'Newsreader',serif;font-style:italic;font-size:12px;color:#9ab89f;padding:10px 0;}
`;

const CL_CATS=["Self","Work","Health","Finance","Relationship","Learning","Other"];
const CL_STAKES=["Trivial","Minor","Moderate","Important","Critical"];
function clToday(){return new Date().toISOString().split("T")[0];}
function clDaysUntil(d:string){if(!d)return null;return Math.ceil((new Date(d).getTime()-new Date(clToday()).getTime())/(1000*60*60*24));}
function clFmtDate(d:string){if(!d)return"No deadline";return new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function clIntVerdict(p:number|null){if(p===null)return"No completed commitments yet.";if(p>=90)return"Exceptional follow-through. Your word is your bond.";if(p>=75)return"Strong integrity. Minor gaps worth investigating.";if(p>=60)return"Moderate follow-through. Patterns of over-commitment emerging.";if(p>=40)return"Significant gap between intention and execution. Review your commitment cadence.";return"Critical gap. You are over-committing or under-delivering.";}

interface CLEntry {
  id: string;
  text: string;
  cat: string;
  deadline: string;
  stakes: number;
  madeWith: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
}

function CommitmentLedger(){
  const [tab,setTab]=useState("ledger");
  const [entries,setEntries]=useState<CLEntry[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [barW,setBarW]=useState<Record<string,number>>({});
  const [text,setText]=useState("");
  const [cat,setCat]=useState("Work");
  const [deadline,setDeadline]=useState("");
  const [stakes,setStakes]=useState(3);
  const [madeWith,setMadeWith]=useState("Myself");

  useEffect(()=>{
    const r=storage.get("commitment-ledger-entries");
    if(r&&r.value)setEntries(JSON.parse(r.value));
    setLoading(false);
  },[]);
  useEffect(()=>{if(loading)return;storage.set("commitment-ledger-entries",JSON.stringify(entries));},[entries,loading]);
  useEffect(()=>{
    if(tab==="patterns"){setTimeout(()=>{const w:Record<string,number>={};CL_CATS.forEach(c=>{const ces=entries.filter(e=>e.cat===c&&e.status!=="pending");w[c]=ces.length>0?Math.round((ces.filter(e=>e.status==="kept").length/ces.length)*100):0;});setBarW(w);},100);}
  },[tab,entries]);

  const addEntry=()=>{if(!text.trim())return;setEntries([{id:Date.now().toString(),text:text.trim(),cat,deadline,stakes,madeWith:madeWith.trim()||"Myself",status:"pending",createdAt:clToday()},...entries]);setText("");setDeadline("");setStakes(3);setCat("Work");setMadeWith("Myself");setShowForm(false);};
  const updStatus=(id:string,status:string)=>setEntries(entries.map(e=>e.id===id?{...e,status,resolvedAt:clToday()}:e));
  const delEntry=(id:string)=>setEntries(entries.filter(e=>e.id!==id));

  const total=entries.length;
  const kept=entries.filter(e=>e.status==="kept");
  const broken=entries.filter(e=>e.status==="broken");
  const pending=entries.filter(e=>e.status==="pending");
  const deferred=entries.filter(e=>e.status==="deferred");
  const resolved=entries.filter(e=>e.status!=="pending");
  const intPct=resolved.length>0?Math.round((kept.length/resolved.length)*100):null;
  const overdue=pending.filter(e=>e.deadline&&(clDaysUntil(e.deadline)??0)<0);
  const dueSoon=pending.filter(e=>e.deadline&&(clDaysUntil(e.deadline)??-1)>=0&&(clDaysUntil(e.deadline)??99)<=3);
  const sortedPending=[...pending].sort((a,b)=>{const da=a.deadline?clDaysUntil(a.deadline)??9999:9999;const db=b.deadline?clDaysUntil(b.deadline)??9999:9999;return da!==db?da-db:b.stakes-a.stakes;});

  const catStats=CL_CATS.map(c=>{const ces=entries.filter(e=>e.cat===c);const res=ces.filter(e=>e.status!=="pending");const k=ces.filter(e=>e.status==="kept");return{cat:c,total:ces.length,pct:res.length>0?Math.round((k.length/res.length)*100):null};}).filter(c=>c.total>0).sort((a,b)=>(b.pct??-1)-(a.pct??-1));

  const genInsights=()=>{const ins:string[]=[];if(overdue.length>0)ins.push(`${overdue.length} overdue commitment${overdue.length>1?"s":""}. Each unresolved item erodes execution credibility — even with yourself.`);const worst=catStats.filter(c=>c.pct!==null).sort((a,b)=>(a.pct??0)-(b.pct??0))[0];if(worst&&(worst.pct??100)<60)ins.push(`Lowest follow-through: ${worst.cat} (${worst.pct}% kept). This is structural, not willpower — reduce commitment frequency in this domain.`);const best=catStats.filter(c=>c.pct!==null).sort((a,b)=>(b.pct??0)-(a.pct??0))[0];if(best&&(best.pct??0)>=80&&best!==worst)ins.push(`Strongest domain: ${best.cat} at ${best.pct}% follow-through. This is your high-integrity zone — understand what makes it work and replicate it.`);if(deferred.length>=3)ins.push(`${deferred.length} deferred commitments. Deferral is often disguised avoidance — review whether these are genuinely rescheduled.`);if(ins.length===0&&resolved.length>=3)ins.push(`Clean record so far. As your ledger grows, patterns will surface here.`);return ins;};

  const ClEntry=({entry}:{entry:CLEntry})=>{
    const days=entry.deadline?clDaysUntil(entry.deadline):null;
    const isOverdue=days!==null&&days<0&&entry.status==="pending";
    const isDueSoon=days!==null&&days>=0&&days<=3&&entry.status==="pending";
    return(<div className={`cl-entry ${entry.status} ${isOverdue?"overdue":""}`}>
      <div><div className="cl-et">{entry.text}</div>
        <div className="cl-emeta">
          <span className="cl-ebadge">{entry.cat}</span>
          <div className="cl-sdots">{[1,2,3,4,5].map(i=><div key={i} className={`cl-sd${entry.stakes>=i?" f":""}`}/>)}</div>
          {entry.deadline&&<span className={`cl-edate${isOverdue?" overdue":isDueSoon?" due-soon":""}`}>{isOverdue?`${Math.abs(days!)}d overdue`:days===0?"Due today":days!==null&&days<=3?`${days}d left`:clFmtDate(entry.deadline)}</span>}
          {entry.madeWith&&entry.madeWith!=="Myself"&&<span className="cl-edate">with {entry.madeWith}</span>}
        </div>
      </div>
      <div className="cl-ectl">
        <span className={`cl-stamp cl-stamp-${entry.status}`}>{entry.status}</span>
        <div className="cl-abtns">
          {entry.status!=="kept"&&<button className="cl-ab" onClick={()=>updStatus(entry.id,"kept")}>✓</button>}
          {entry.status!=="broken"&&<button className="cl-ab" onClick={()=>updStatus(entry.id,"broken")}>✗</button>}
          {entry.status==="pending"&&<button className="cl-ab" onClick={()=>updStatus(entry.id,"deferred")}>↷</button>}
          {entry.status!=="pending"&&<button className="cl-ab" onClick={()=>updStatus(entry.id,"pending")}>↺</button>}
          <button className="cl-ab del" onClick={()=>delEntry(entry.id)}>×</button>
        </div>
      </div>
    </div>);
  };

  if(loading)return<div className="cl-app" style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"60vh"}}><span style={{fontFamily:"'Azeret Mono',monospace",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#6b8c72"}}>Opening ledger…</span></div>;

  return(<div className="cl-app">
    <style>{CL_CSS}</style>
    <div className="cl-mast">
      <div className="cl-mast-vol">Decision Suite · Capstone</div>
      <div className="cl-mast-t">The Commitment <em>Ledger</em></div>
      <div className="cl-mast-s">A formal record of what you said you would do — and whether you did it.</div>
      <div className="cl-mast-stats">
        <div className="cl-ms"><div className="cl-msn">{total}</div><div className="cl-msl">Logged</div></div><div className="cl-mss"/>
        <div className="cl-ms"><div className="cl-msn">{kept.length}</div><div className="cl-msl">Kept</div></div><div className="cl-mss"/>
        <div className="cl-ms"><div className="cl-msn">{broken.length}</div><div className="cl-msl">Broken</div></div><div className="cl-mss"/>
        <div className="cl-ms"><div className="cl-msn" style={{color:overdue.length>0?"#f87171":"#fff"}}>{overdue.length}</div><div className="cl-msl">Overdue</div></div>
      </div>
    </div>
    {total>0&&<div className="cl-int"><div className="cl-int-row"><span className="cl-int-n">Word Integrity Score</span><span className="cl-int-pct">{intPct!==null?`${intPct}%`:"—"}</span></div><div className="cl-int-track"><div className="cl-int-fill" style={{width:`${intPct??0}%`}}/></div><div className="cl-int-v">{clIntVerdict(intPct)}</div></div>}
    <div className="cl-tabs">{["ledger","patterns"].map(t=><button key={t} className={`cl-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="ledger"?"Active Ledger":"Patterns & Insights"}</button>)}</div>
    <div className="cl-content">
      {tab==="ledger"&&(<>
        <div className="cl-top-row"><span className="cl-pending-info">{pending.length} pending · {dueSoon.length} due within 3 days</span><button className="cl-btn cl-btn-sm" onClick={()=>setShowForm(!showForm)}>{showForm?"— Cancel":"+ Enter Commitment"}</button></div>
        {showForm&&<div className="cl-form"><div className="cl-ft">New Ledger Entry</div>
          <div className="cl-form-row"><label className="cl-fl">Commitment</label><textarea className="cl-ta" rows={2} placeholder='State it precisely. "I will finish the investor memo by Friday"' value={text} onChange={e=>setText(e.target.value)}/></div>
          <div className="cl-form-grid"><div><label className="cl-fl">Deadline</label><input className="cl-in" type="date" value={deadline} min={clToday()} onChange={e=>setDeadline(e.target.value)}/></div><div><label className="cl-fl">Made with</label><input className="cl-in" type="text" placeholder="Myself, team, client…" value={madeWith} onChange={e=>setMadeWith(e.target.value)}/></div></div>
          <div className="cl-form-row"><label className="cl-fl">Category</label><div className="cl-cats">{CL_CATS.map(c=><button key={c} className={`cl-cat${cat===c?" active":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div></div>
          <div className="cl-form-row"><label className="cl-fl">Stakes — {CL_STAKES[stakes-1]}</label><div className="cl-stakes-row"><div className="cl-strack">{[1,2,3,4,5].map(i=><div key={i} className={`cl-sp${stakes>=i?" f":""}`} onClick={()=>setStakes(i)}/>)}</div><span className="cl-slbl-txt">{CL_STAKES[stakes-1]}</span></div></div>
          <div className="cl-form-btns"><button className="cl-btn cl-btn-g cl-btn-sm" onClick={()=>setShowForm(false)}>Cancel</button><button className="cl-btn cl-btn-sm" onClick={addEntry} disabled={!text.trim()}>Enter in Ledger</button></div>
        </div>}
        {total===0&&<div className="cl-empty">The ledger is empty.<span>Enter your first commitment to begin tracking</span></div>}
        {overdue.length>0&&<div className="cl-sec"><div className="cl-sec-hdr"><span className="cl-sec-t" style={{color:"#c0392b"}}>Overdue</span><div className="cl-sec-line" style={{background:"rgba(192,57,43,.2)"}}/><span className="cl-sec-cnt" style={{color:"#c0392b"}}>{overdue.length}</span></div>{overdue.map(e=><ClEntry key={e.id} entry={e}/>)}</div>}
        {dueSoon.length>0&&<div className="cl-sec"><div className="cl-sec-hdr"><span className="cl-sec-t" style={{color:"#7a5c10"}}>Due within 3 days</span><div className="cl-sec-line"/><span className="cl-sec-cnt">{dueSoon.length}</span></div>{dueSoon.map(e=><ClEntry key={e.id} entry={e}/>)}</div>}
        {sortedPending.filter(e=>!overdue.includes(e)&&!dueSoon.includes(e)).length>0&&<div className="cl-sec"><div className="cl-sec-hdr"><span className="cl-sec-t">Open Commitments</span><div className="cl-sec-line"/><span className="cl-sec-cnt">{sortedPending.filter(e=>!overdue.includes(e)&&!dueSoon.includes(e)).length}</span></div>{sortedPending.filter(e=>!overdue.includes(e)&&!dueSoon.includes(e)).map(e=><ClEntry key={e.id} entry={e}/>)}</div>}
        {deferred.length>0&&<div className="cl-sec"><div className="cl-sec-hdr"><span className="cl-sec-t">Deferred</span><div className="cl-sec-line"/><span className="cl-sec-cnt">{deferred.length}</span></div>{deferred.map(e=><ClEntry key={e.id} entry={e}/>)}</div>}
        {[...kept,...broken].length>0&&<div className="cl-sec"><div className="cl-sec-hdr"><span className="cl-sec-t">Resolved</span><div className="cl-sec-line"/><span className="cl-sec-cnt">{[...kept,...broken].length}</span></div>{[...kept,...broken].sort((a,b)=>(b.resolvedAt||"").localeCompare(a.resolvedAt||"")).map(e=><ClEntry key={e.id} entry={e}/>)}</div>}
      </>)}
      {tab==="patterns"&&(<>
        {total<3?<div className="cl-empty">Log at least 3 commitments to surface patterns.<span>Patterns require data · return after more entries</span></div>:(<>
          <div className="cl-pat-grid">
            <div className="cl-pc"><div className="cl-pct">Follow-through by Category</div>{catStats.length===0?<div className="cl-no-data">No resolved commitments yet.</div>:catStats.map(c=>{const w=barW[c.cat]??0;const cls=w>=75?"":w>=50?"mid":"low";return(<div className="cl-pbi" key={c.cat}><div className="cl-pbh"><span className="cl-pbn">{c.cat}</span><span className="cl-pbp">{c.pct!==null?`${c.pct}%`:"—"}</span></div><div className="cl-pt"><div className={`cl-pf ${cls}`} style={{width:`${w}%`}}/></div></div>);})}</div>
            <div className="cl-pc"><div className="cl-pct">Status Breakdown</div>{[{l:"Kept",v:kept.length,c:"#52b788"},{l:"Broken",v:broken.length,c:"#c0392b"},{l:"Deferred",v:deferred.length,c:"#c9a84c"},{l:"Pending",v:pending.length,c:"#8a9ab8"}].map(row=><div className="cl-pbi" key={row.l}><div className="cl-pbh"><span className="cl-pbn">{row.l}</span><span className="cl-pbp">{total>0?`${Math.round((row.v/total)*100)}%`:"—"}</span></div><div className="cl-pt"><div className="cl-pf" style={{width:`${total>0?(row.v/total)*100:0}%`,background:row.c,transition:"width .8s ease"}}/></div></div>)}</div>
          </div>
          {genInsights().map((ins,i)=><div className="cl-ins" key={i}><div className="cl-ins-lbl">Insight {String(i+1).padStart(2,"0")}</div><div className="cl-ins-txt">{ins}</div></div>)}
        </>)}
      </>)}
    </div>
  </div>);
}

// ─────────────────────────────────────────
// TOOL: ONE-PAGE OS
// ─────────────────────────────────────────
const OS_CSS=`
.os-app{min-height:100%;background:#ffffff;font-family:'DM Sans',sans-serif;color:#000;display:flex;flex-direction:column;align-items:center;padding-bottom:80px;}
.os-rail{width:100%;background:#000;height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;position:sticky;top:0;z-index:50;}
.os-rail-mark{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#fff;}
.os-rail-r{display:flex;gap:5px;}
.os-rbtn{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border:1px solid rgba(255,255,255,.25);background:transparent;color:rgba(255,255,255,.6);cursor:pointer;transition:all .2s;}
.os-rbtn:hover{background:rgba(255,255,255,.1);color:#fff;}
.os-rbtn.active{background:#fff;color:#000;border-color:#fff;}
.os-hdr{width:100%;max-width:860px;padding:44px 36px 32px;display:grid;grid-template-columns:1fr auto;gap:28px;align-items:end;border-bottom:2px solid #000;margin-bottom:0;}
.os-ey{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#666;margin-bottom:14px;display:flex;align-items:center;gap:10px;}
.os-ey-line{display:block;width:24px;height:1px;background:#666;}
.os-ht{font-family:'Syne',sans-serif;font-size:clamp(36px,6vw,64px);font-weight:700;line-height:.95;letter-spacing:-2px;}
.os-ht span{display:block;font-family:'Newsreader',serif;font-style:italic;font-weight:400;letter-spacing:-1px;}
.os-hr{text-align:right;}
.os-hv{font-family:'Azeret Mono',monospace;font-size:10px;color:#aaa;line-height:2.1;}
.os-hde{font-family:'Azeret Mono',monospace;font-size:10px;background:none;border:none;border-bottom:1px solid #ddd;outline:none;text-align:right;cursor:text;padding:2px 3px;width:160px;color:#666;}
.os-prog{width:100%;max-width:860px;padding:14px 36px 0;display:flex;align-items:center;gap:14px;}
.os-pt{flex:1;height:3px;background:#f0f0f0;overflow:hidden;}
.os-pf{height:100%;background:#000;transition:width .5s ease;}
.os-plbl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#aaa;white-space:nowrap;}
.os-edit{width:100%;max-width:860px;padding:0 36px;}
.os-sb{border-bottom:1px solid #f0f0f0;padding:36px 0;display:grid;grid-template-columns:200px 1fr;gap:36px;animation:osFU .3s ease both;}
@keyframes osFU{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);}}
.os-sb:nth-child(2){animation-delay:.04s;}.os-sb:nth-child(3){animation-delay:.08s;}.os-sb:nth-child(4){animation-delay:.12s;}.os-sb:nth-child(5){animation-delay:.16s;}
.os-snum{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;color:#aaa;margin-bottom:7px;}
.os-sname{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#000;line-height:1.2;margin-bottom:8px;}
.os-shint{font-family:'Newsreader',serif;font-style:italic;font-size:12px;color:#666;line-height:1.7;}
.os-swhy{font-family:'Azeret Mono',monospace;font-size:9px;color:#aaa;line-height:1.7;margin-top:10px;padding-top:10px;border-top:1px solid #f0f0f0;}
.os-pi{width:100%;background:transparent;border:none;border-bottom:2px solid #000;padding:10px 0;font-family:'Syne',sans-serif;font-size:20px;font-weight:600;color:#000;outline:none;transition:border-color .2s;letter-spacing:-.5px;}
.os-pi::placeholder{color:#ccc;font-weight:400;}
.os-pi:focus{border-color:#000;}
.os-cc{font-family:'Azeret Mono',monospace;font-size:9px;color:#aaa;text-align:right;margin-top:5px;}
.os-li{display:flex;align-items:center;gap:8px;margin-bottom:5px;animation:osSlide .2s ease;}
@keyframes osSlide{from{opacity:0;transform:translateX(-3px);}to{opacity:1;transform:translateX(0);}}
.os-lm{font-family:'Azeret Mono',monospace;font-size:10px;color:#aaa;flex-shrink:0;width:18px;}
.os-liin{flex:1;background:transparent;border:none;border-bottom:1px solid #f0f0f0;padding:7px 0;font-family:'DM Sans',sans-serif;font-size:13px;color:#000;outline:none;transition:border-color .2s;}
.os-liin:focus{border-color:#000;}
.os-liin::placeholder{color:#ccc;font-style:italic;}
.os-ldel{background:none;border:none;color:#ccc;cursor:pointer;font-size:15px;line-height:1;padding:2px 4px;transition:color .15s;flex-shrink:0;}
.os-ldel:hover{color:#c0392b;}
.os-add-lnk{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#aaa;background:none;border:none;cursor:pointer;padding:7px 0;transition:color .15s;display:flex;align-items:center;gap:5px;margin-top:3px;}
.os-add-lnk:hover{color:#000;}
.os-rg{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.os-ri{background:#f8f8f8;border:1px solid #f0f0f0;padding:10px 12px;position:relative;}
.os-rtype{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;margin-bottom:5px;}
.os-rtype.yes{color:#000;}.os-rtype.no{color:#666;}
.os-rin{width:100%;background:transparent;border:none;border-bottom:1px solid #f0f0f0;padding:5px 0;font-family:'DM Sans',sans-serif;font-size:12px;color:#000;outline:none;resize:none;transition:border-color .2s;}
.os-rin:focus{border-color:#000;}
.os-rin::placeholder{color:#ccc;font-style:italic;}
.os-rdel{position:absolute;top:7px;right:7px;background:none;border:none;color:#ccc;cursor:pointer;font-size:12px;line-height:1;transition:color .15s;}
.os-rdel:hover{color:#c0392b;}
.os-ra-row{display:flex;gap:8px;margin-top:7px;}
.os-cd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:14px;}
.os-cdi{border:1px solid #f0f0f0;padding:10px;background:#f8f8f8;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:7px;}
.os-cdi.active{border-color:#000;background:#fff;box-shadow:2px 2px 0 #f0f0f0;}
.os-cdchk{width:13px;height:13px;border:1.5px solid #ccc;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.os-cdi.active .os-cdchk{border-color:#000;background:#000;}
.os-cdd{width:5px;height:5px;border-radius:50%;background:#fff;}
.os-cdl{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;color:#000;}
.os-act-row{width:100%;max-width:860px;padding:0 36px;display:flex;justify-content:flex-end;gap:7px;margin-top:14px;}
.os-btn{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:500;padding:11px 22px;border:1.5px solid #000;background:#000;color:#fff;cursor:pointer;transition:all .2s;}
.os-btn:hover{background:#fff;color:#000;}
.os-btn-g{background:transparent;color:#666;border-color:#e0e0e0;}
.os-btn-g:hover{background:#f8f8f8;color:#000;border-color:#aaa;}
.os-hint{font-family:'Azeret Mono',monospace;font-size:9px;color:#aaa;margin-top:7px;line-height:1.6;}
.os-inc{background:#f8f8f8;border:1px solid #e0e0e0;border-left:3px solid #aaa;padding:12px 18px;font-family:'Azeret Mono',monospace;font-size:9px;color:#aaa;letter-spacing:1px;text-align:center;margin:0 36px 0;width:calc(100% - 72px);max-width:860px;}
.os-pg{width:100%;max-width:860px;background:#fff;border:1px solid #e0e0e0;box-shadow:0 6px 32px rgba(0,0,0,.07);margin:28px 36px;position:relative;overflow:hidden;animation:osFU .4s ease;}
.os-rm{position:absolute;width:18px;height:18px;}.os-rm::before,.os-rm::after{content:'';position:absolute;background:#aaa;}
.os-rm::before{width:1px;height:18px;}.os-rm::after{width:18px;height:1px;}
.os-rm.tl{top:10px;left:10px;}.os-rm.tr{top:10px;right:10px;}.os-rm.tr::before{right:0;}.os-rm.tr::after{right:0;}
.os-rm.bl{bottom:10px;left:10px;}.os-rm.bl::before{bottom:0;}.os-rm.bl::after{bottom:0;}
.os-rm.br{bottom:10px;right:10px;}.os-rm.br::before{right:0;bottom:0;}.os-rm.br::after{right:0;bottom:0;}
.os-phdr{border-bottom:3px solid #000;padding:28px 44px 24px;display:grid;grid-template-columns:1fr auto;align-items:end;gap:18px;}
.os-pdoc{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#666;margin-bottom:8px;}
.os-powner{font-family:'Syne',sans-serif;font-size:clamp(24px,4vw,40px);font-weight:700;line-height:.95;letter-spacing:-1px;}
.os-powner em{font-family:'Newsreader',serif;font-style:italic;font-weight:400;}
.os-phdr-r{text-align:right;}
.os-pmeta{font-family:'Azeret Mono',monospace;font-size:9px;color:#aaa;line-height:2.1;}
.os-pmeta strong{color:#666;font-weight:500;}
.os-pbody{display:grid;grid-template-columns:1fr 1fr;}
.os-pcell{padding:28px 32px;border-right:1px solid #e0e0e0;border-bottom:1px solid #e0e0e0;min-height:180px;}
.os-pcell:nth-child(2n){border-right:none;}
.os-pcell:nth-last-child(-n+2){border-bottom:none;}
.os-pcell.full{grid-column:1/-1;border-right:none;}
.os-pch{display:flex;align-items:baseline;gap:10px;margin-bottom:16px;padding-bottom:10px;border-bottom:1.5px solid #000;}
.os-pcnum{font-family:'Azeret Mono',monospace;font-size:9px;color:#aaa;letter-spacing:1px;}
.os-pctitle{font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#000;}
.os-ptxt{font-family:'Syne',sans-serif;font-size:19px;font-weight:600;color:#000;line-height:1.3;letter-spacing:-.5px;}
.os-pempty{font-family:'Newsreader',serif;font-style:italic;font-size:14px;color:#ccc;}
.os-ptf{font-family:'Azeret Mono',monospace;font-size:9px;color:#666;margin-top:10px;}
.os-plist{list-style:none;display:flex;flex-direction:column;gap:8px;}
.os-pli{display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#333;line-height:1.5;}
.os-plm{font-family:'Azeret Mono',monospace;font-size:9px;color:#aaa;flex-shrink:0;margin-top:2px;width:14px;}
.os-prg{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.os-pr{padding:8px 10px;border:1px solid #f0f0f0;}
.os-prl{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;}
.os-prl.yes{color:#000;}.os-prl.no{color:#666;}
.os-prt{font-size:12px;color:#333;line-height:1.5;}
.os-pci{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #f8f8f8;font-size:12px;color:#333;}
.os-pci:last-child{border-bottom:none;}
.os-pcf{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:1px;color:#aaa;width:48px;flex-shrink:0;}
.os-pftr{border-top:3px solid #000;padding:14px 44px;display:flex;justify-content:space-between;align-items:center;}
.os-pftr-l{font-family:'Azeret Mono',monospace;font-size:9px;color:#aaa;letter-spacing:2px;text-transform:uppercase;}
.os-pftr-r{font-family:'Newsreader',serif;font-style:italic;font-size:11px;color:#666;}
`;

const OS_CADENCE=["Daily standup","Daily shutdown","Weekly review","Weekly plan","Monthly review","Quarterly reset"];
const YES_PH=["Directly serves my 90-day priority","Generates revenue or reduces risk","Someone I deeply respect asks me personally","It's reversible and low-cost to try"];
const NO_PH=["Feels urgent but isn't important","I can't say yes wholeheartedly","It fragments my focus for more than a day","Someone else can do this 80% as well"];

function useOSState<T>(key:string,init:T):[T,React.Dispatch<React.SetStateAction<T>>,boolean]{
  const [v,setV]=useState<T>(init);const [loaded,setLoaded]=useState(false);
  useEffect(()=>{
    const r=storage.get(key);
    if(r&&r.value){try{setV(JSON.parse(r.value));}catch{}}
    setLoaded(true);
  },[]);
  useEffect(()=>{if(!loaded)return;storage.set(key,JSON.stringify(v));},[v,loaded]);
  return[v,setV,loaded];
}

function OnePageOS(){
  const [mode,setMode]=useState("edit");
  const [name,setName,l0]=useOSState("opos-name","");
  const [tf,setTf,l1]=useOSState("opos-timeframe","90 days");
  const [priority,setPriority,l2]=useOSState("opos-priority","");
  const [weekly,setWeekly,l3]=useOSState<string[]>("opos-weekly",[""]);
  const [daily,setDaily,l4]=useOSState<string[]>("opos-daily",[""]);
  const [rules,setRules,l5]=useOSState<{type:string;text:string}[]>("opos-rules",[{type:"yes",text:""},{type:"no",text:""}]);
  const [cadence,setCadence,l6]=useOSState<string[]>("opos-cadence",[]);
  const [reviewDate,setReviewDate,l7]=useOSState("opos-review-date","");
  const [version,setVersion,l8]=useOSState("opos-version","1.0");
  const allLoaded=l0&&l1&&l2&&l3&&l4&&l5&&l6&&l7&&l8;

  const togCadence=(item:string)=>setCadence(cadence.includes(item)?cadence.filter(c=>c!==item):[...cadence,item]);
  const addListItem=(list:string[],setList:React.Dispatch<React.SetStateAction<string[]>>)=>setList([...list,""]);
  const updListItem=(list:string[],setList:React.Dispatch<React.SetStateAction<string[]>>,i:number,v:string)=>setList(list.map((x,j)=>j===i?v:x));
  const remListItem=(list:string[],setList:React.Dispatch<React.SetStateAction<string[]>>,i:number)=>setList(list.filter((_,j)=>j!==i));
  const addRule=(type:string)=>setRules([...rules,{type,text:""}]);
  const updRule=(i:number,v:string)=>setRules(rules.map((r,j)=>j===i?{...r,text:v}:r));
  const remRule=(i:number)=>setRules(rules.filter((_,j)=>j!==i));

  const filled=[priority.trim().length>5,weekly.some(w=>w.trim().length>3),daily.some(d=>d.trim().length>3),rules.some(r=>r.text.trim().length>3)];
  const completePct=Math.round((filled.filter(Boolean).length/filled.length)*100);
  const today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});

  if(!allLoaded)return<div className="os-app" style={{justifyContent:"center",alignItems:"center",minHeight:"60vh",display:"flex"}}><span style={{fontFamily:"'Azeret Mono',monospace",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#aaa"}}>Loading…</span></div>;

  return(<div className="os-app">
    <style>{OS_CSS}</style>
    <div className="os-rail"><div style={{display:"flex",alignItems:"center",gap:16}}><span className="os-rail-mark">One-Page OS</span><span style={{width:1,height:14,background:"rgba(255,255,255,.2)",display:"block"}}/><span style={{fontFamily:"'Azeret Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,.35)"}}>Decision Suite · Companion</span></div><div className="os-rail-r"><button className={`os-rbtn${mode==="edit"?" active":""}`} onClick={()=>setMode("edit")}>Edit</button><button className={`os-rbtn${mode==="view"?" active":""}`} onClick={()=>setMode("view")}>View OS</button></div></div>
    <div className="os-hdr"><div><div className="os-ey"><span className="os-ey-line"/>Personal Operating System</div><div className="os-ht">One Page.<span>One System.</span></div></div>
      <div className="os-hr"><div className="os-hv"><div>Version <input style={{fontFamily:"'Azeret Mono',monospace",fontSize:9,background:"none",border:"none",borderBottom:"1px solid #ddd",outline:"none",textAlign:"right",width:36,color:"#aaa"}} value={version} onChange={e=>setVersion(e.target.value)}/></div><div>Updated {today}</div><div>Review <input className="os-hde" type="text" value={reviewDate} placeholder="Set date" onChange={e=>setReviewDate(e.target.value)}/></div></div></div>
    </div>

    {mode==="edit"&&(<>
      <div className="os-prog"><span className="os-plbl">Complete</span><div className="os-pt"><div className="os-pf" style={{width:`${completePct}%`}}/></div><span className="os-plbl">{completePct}%</span></div>
      <div className="os-edit">
        <div className="os-sb"><div><div className="os-snum">00</div><div className="os-sname">Identity</div></div><div><input className="os-pi" style={{fontSize:15}} type="text" placeholder="Your name or role" value={name} onChange={e=>setName(e.target.value)}/></div></div>
        <div className="os-sb"><div><div className="os-snum">01</div><div className="os-sname">The One Priority</div><div className="os-shint">One objective. One timeframe.</div><div className="os-swhy">If you have more than one priority, you have none.</div></div>
          <div><input className="os-pi" type="text" maxLength={120} placeholder="e.g. Close $500K ARR before Q2" value={priority} onChange={e=>setPriority(e.target.value)}/><div style={{display:"flex",justifyContent:"space-between",marginTop:7}}><input style={{fontFamily:"'Azeret Mono',monospace",fontSize:9,background:"none",border:"none",borderBottom:"1px solid #eee",outline:"none",color:"#aaa",width:130,padding:"3px 0"}} placeholder="Timeframe" value={tf} onChange={e=>setTf(e.target.value)}/><span className="os-cc">{priority.length}/120</span></div></div>
        </div>
        <div className="os-sb"><div><div className="os-snum">02</div><div className="os-sname">Weekly Non-Negotiables</div><div className="os-shint">What must happen every week?</div></div>
          <div>{weekly.map((w,i)=><div className="os-li" key={i}><span className="os-lm">—</span><input className="os-liin" type="text" value={w} placeholder={["Deep work block, Mon–Thu mornings","Weekly team sync, Tue 9am","Friday shutdown review","Strategic peer conversation"][i]||`Item ${i+1}`} onChange={e=>updListItem(weekly,setWeekly,i,e.target.value)}/>{weekly.length>1&&<button className="os-ldel" onClick={()=>remListItem(weekly,setWeekly,i)}>×</button>}</div>)}
          {weekly.length<6&&<button className="os-add-lnk" onClick={()=>addListItem(weekly,setWeekly)}>+ Add item</button>}</div>
        </div>
        <div className="os-sb"><div><div className="os-snum">03</div><div className="os-sname">Daily Defaults</div><div className="os-shint">What does a good day look like?</div></div>
          <div>{daily.map((d,i)=><div className="os-li" key={i}><span className="os-lm">·</span><input className="os-liin" type="text" value={d} placeholder={["First 90 min: no email, no Slack","Daily intention: one sentence goal","End-of-day: identify tomorrow's MIT","No meetings before 10am"][i]||`Default ${i+1}`} onChange={e=>updListItem(daily,setDaily,i,e.target.value)}/>{daily.length>1&&<button className="os-ldel" onClick={()=>remListItem(daily,setDaily,i)}>×</button>}</div>)}
          {daily.length<6&&<button className="os-add-lnk" onClick={()=>addListItem(daily,setDaily)}>+ Add item</button>}</div>
        </div>
        <div className="os-sb"><div><div className="os-snum">04</div><div className="os-sname">Decision Rules</div><div className="os-shint">Pre-committed yes/no criteria.</div><div className="os-swhy">Rules eliminate in-the-moment deliberation.</div></div>
          <div><div className="os-rg">{rules.map((r,i)=><div className="os-ri" key={i}><div className={`os-rtype ${r.type}`}>{r.type==="yes"?"✓ Say Yes when":"✗ Say No when"}</div><textarea className="os-rin" rows={2} value={r.text} placeholder={r.type==="yes"?YES_PH[rules.filter(x=>x.type==="yes").indexOf(r)%YES_PH.length]:NO_PH[rules.filter(x=>x.type==="no").indexOf(r)%NO_PH.length]} onChange={e=>updRule(i,e.target.value)}/><button className="os-rdel" onClick={()=>remRule(i)}>×</button></div>)}</div>
          <div className="os-ra-row">{rules.filter(r=>r.type==="yes").length<4&&<button className="os-add-lnk" onClick={()=>addRule("yes")}>+ Yes rule</button>}{rules.filter(r=>r.type==="no").length<4&&<button className="os-add-lnk" onClick={()=>addRule("no")}>+ No rule</button>}</div></div>
        </div>
        <div className="os-sb"><div><div className="os-snum">05</div><div className="os-sname">Operating Cadence</div><div className="os-shint">Which rhythms does your system run on?</div></div>
          <div><div className="os-cd-grid">{OS_CADENCE.map(c=><div key={c} className={`os-cdi${cadence.includes(c)?" active":""}`} onClick={()=>togCadence(c)}><div className="os-cdchk">{cadence.includes(c)&&<div className="os-cdd"/>}</div><span className="os-cdl">{c}</span></div>)}</div></div>
        </div>
      </div>
      <div className="os-act-row"><button className="os-btn" onClick={()=>setMode("view")}>View My OS →</button></div>
    </>)}

    {mode==="view"&&(<>
      {completePct<50&&<div className="os-inc">OS is {completePct}% complete — return to Edit to fill in more sections.</div>}
      <div className="os-pg">
        <div className="os-rm tl"/><div className="os-rm tr"/><div className="os-rm bl"/><div className="os-rm br"/>
        <div className="os-phdr"><div><div className="os-pdoc">Personal Operating System · Official Record</div><div className="os-powner">{name||<em style={{color:"#ccc",fontFamily:"'Newsreader',serif",fontStyle:"italic",fontWeight:400}}>Your Name</em>}<em>'s OS</em></div></div>
          <div className="os-phdr-r"><div className="os-pmeta"><strong>Version</strong> {version}</div><div className="os-pmeta"><strong>Updated</strong> {today}</div>{reviewDate&&<div className="os-pmeta"><strong>Review</strong> {reviewDate}</div>}<div className="os-pmeta"><strong>Timeframe</strong> {tf}</div></div>
        </div>
        <div className="os-pbody">
          <div className="os-pcell full" style={{borderBottom:"1px solid #e0e0e0",background:priority?"#fff":"#f8f8f8"}}><div className="os-pch"><span className="os-pcnum">01</span><span className="os-pctitle">The One Priority — {tf}</span></div>{priority?<div className="os-ptxt">{priority}</div>:<div className="os-pempty">No priority set.</div>}</div>
          <div className="os-pcell"><div className="os-pch"><span className="os-pcnum">02</span><span className="os-pctitle">Weekly Non-Negotiables</span></div>{weekly.filter(w=>w.trim()).length>0?<ul className="os-plist">{weekly.filter(w=>w.trim()).map((w,i)=><li key={i} className="os-pli"><span className="os-plm">—</span>{w}</li>)}</ul>:<div className="os-pempty">Not defined.</div>}</div>
          <div className="os-pcell"><div className="os-pch"><span className="os-pcnum">03</span><span className="os-pctitle">Daily Defaults</span></div>{daily.filter(d=>d.trim()).length>0?<ul className="os-plist">{daily.filter(d=>d.trim()).map((d,i)=><li key={i} className="os-pli"><span className="os-plm">·</span>{d}</li>)}</ul>:<div className="os-pempty">Not defined.</div>}</div>
          <div className="os-pcell full"><div className="os-pch"><span className="os-pcnum">04</span><span className="os-pctitle">Decision Rules</span></div>{rules.filter(r=>r.text.trim()).length>0?<div className="os-prg">{rules.filter(r=>r.text.trim()).map((r,i)=><div key={i} className="os-pr"><div className={`os-prl ${r.type}`}>{r.type==="yes"?"✓ Say Yes when":"✗ Say No when"}</div><div className="os-prt">{r.text}</div></div>)}</div>:<div className="os-pempty">No rules defined.</div>}</div>
          <div className="os-pcell" style={{borderBottom:"none"}}><div className="os-pch"><span className="os-pcnum">05</span><span className="os-pctitle">Operating Cadence</span></div>{cadence.length>0?cadence.map((c,i)=><div key={i} className="os-pci"><span className="os-pcf">{c.split(" ")[0].toUpperCase()}</span><span>{c}</span></div>):<div className="os-pempty">No cadence selected.</div>}</div>
          <div className="os-pcell" style={{borderBottom:"none",background:"#f8f8f8",display:"flex",flexDirection:"column",justifyContent:"space-between"}}><div className="os-pch"><span className="os-pcnum">06</span><span className="os-pctitle">Commitment</span></div><div style={{fontFamily:"'Newsreader',serif",fontStyle:"italic",fontSize:12,color:"#666",lineHeight:1.8}}>"I commit to reviewing this OS weekly and holding it as the authoritative source of my operating priorities. When in doubt, I return to §01."</div><div style={{marginTop:20,borderTop:"1px solid #e0e0e0",paddingTop:14}}><div style={{fontFamily:"'Azeret Mono',monospace",fontSize:8,color:"#aaa",letterSpacing:2,marginBottom:8}}>SIGNATURE / DATE</div><div style={{borderBottom:"1px solid #e0e0e0",height:24}}/></div></div>
        </div>
        <div className="os-pftr"><div className="os-pftr-l">Decision Suite · One-Page OS · {version}</div><div className="os-pftr-r">Review weekly. Revise quarterly. Trust the system.</div></div>
      </div>
      <div className="os-act-row"><button className="os-btn os-btn-g" onClick={()=>setMode("edit")}>← Edit OS</button><button className="os-btn" onClick={()=>window.print()}>Print / Save PDF</button></div>
    </>)}
  </div>);
}

// ─────────────────────────────────────────
// HOME DASHBOARD
// ─────────────────────────────────────────
interface LedgerStats {
  total: number;
  kept: number;
  overdue: number;
  intPct: number | null;
}

function HomeDashboard({onNavigate, ledgerStats}:{onNavigate:(id:string)=>void;ledgerStats:LedgerStats}) {
  const TOOLS = [
    { id:"assumption", icon:"🔍", title:"Assumption Audit", role:"Before you decide", seq:"01", badge:"badge-before", badgeLabel:"Before", desc:"Surface the hidden beliefs holding up your strategy. Rate each on evidence quality and load-bearing weight. Find blind spots before they find you." },
    { id:"decision",   icon:"⚖️", title:"Decision.Clarity", role:"Make the call",    seq:"02", badge:"badge-during", badgeLabel:"During", desc:"Weighted decision matrix grounded in decision science. Define options, set criteria, score each. Receive a ranked recommendation with score breakdown." },
    { id:"premortem",  icon:"💀", title:"Pre-Mortem Studio",role:"Stress-test the plan",seq:"03",badge:"badge-after", badgeLabel:"After",  desc:"Imagine the project is already dead. Extract failure modes, rate probability and impact, build mitigation plans. Based on Gary Klein's methodology." },
    { id:"ledger",     icon:"📒", title:"Commitment Ledger",role:"Track follow-through",seq:"04",badge:"badge-exec",  badgeLabel:"Execute",desc:"A formal record of what you said you would do — and whether you did it. Tracks integrity score, behavioral patterns, and overdue commitments." },
    { id:"os",         icon:"📐", title:"One-Page OS",       role:"Always-on system",  seq:"05", badge:"badge-always",badgeLabel:"Always",  desc:"Your complete operating model on one page. Priority, weekly non-negotiables, daily defaults, decision rules, cadence. Builds and persists." },
  ];

  return (
    <div className="home">
      <div className="home-header">
        <div className="home-eyebrow">Complete Decision Suite · Five Tools · One System</div>
        <div className="home-title">The Decision<br/><em>Suite</em></div>
        <div className="home-sub">From belief to decision to execution — every phase of high-stakes thinking, in one place. Built for operators who demand intellectual honesty.</div>
      </div>

      <div className="stats-row">
        <div className="stat-card gold"><div className="stat-num">{ledgerStats.total}</div><div className="stat-label">Commitments logged</div></div>
        <div className="stat-card green"><div className="stat-num">{ledgerStats.kept}</div><div className="stat-label">Commitments kept</div></div>
        <div className="stat-card red" style={{opacity: ledgerStats.overdue > 0 ? 1 : 0.5}}><div className="stat-num" style={{color: ledgerStats.overdue > 0 ? "var(--red)" : "inherit"}}>{ledgerStats.overdue}</div><div className="stat-label">Overdue</div></div>
        <div className="stat-card blue"><div className="stat-num">{ledgerStats.intPct !== null ? `${ledgerStats.intPct}%` : "—"}</div><div className="stat-label">Word integrity</div></div>
      </div>

      <div className="tools-grid">
        {TOOLS.map(t => (
          <div className="tool-card" key={t.id} onClick={() => onNavigate(t.id)}>
            <div className="tc-header"><div className="tc-icon">{t.icon}</div><span className="tc-seq">{t.seq}</span></div>
            <div className="tc-title">{t.title}</div>
            <div className="tc-role">{t.role}</div>
            <div className="tc-desc">{t.desc}</div>
            <div className="tc-footer"><span className="tc-open">Open tool →</span><span className={`tc-badge ${t.badge}`}>{t.badgeLabel}</span></div>
          </div>
        ))}
        <div className="flow-wrap" style={{gridColumn:"1/-1"}}>
          <div className="flow-title">Decision Flow — How the tools connect</div>
          <div className="flow-row">
            {[
              {id:"assumption",icon:"🔍",name:"Assumption Audit",phase:"Before"},
              {id:"decision",  icon:"⚖️",name:"Decision.Clarity", phase:"Choose"},
              {id:"premortem", icon:"💀",name:"Pre-Mortem",        phase:"After"},
              {id:"ledger",    icon:"📒",name:"Commitment Ledger", phase:"Execute"},
              {id:"os",        icon:"📐",name:"One-Page OS",        phase:"Always"},
            ].map((n,i,arr) => (
              <div key={n.id} style={{display:"flex",alignItems:"center",flex:i<arr.length-1?1:"0 0 auto"}}>
                <div className="flow-node" onClick={()=>onNavigate(n.id)}>
                  <div className="flow-node-icon">{n.icon}</div>
                  <span className="flow-node-name">{n.name}</span>
                  <span className="flow-node-phase">{n.phase}</span>
                </div>
                {i<arr.length-1&&<div className="flow-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN APP SHELL
// ─────────────────────────────────────────
const NAV_ITEMS = [
  { id:"home",       icon:"⬛", label:"Dashboard",        sub:"Overview" },
  { id:"assumption", icon:"🔍", label:"Assumption Audit",  sub:"Before" },
  { id:"decision",   icon:"⚖️", label:"Decision.Clarity",  sub:"During" },
  { id:"premortem",  icon:"💀", label:"Pre-Mortem Studio", sub:"After" },
  { id:"ledger",     icon:"📒", label:"Commitment Ledger", sub:"Execute" },
  { id:"os",         icon:"📐", label:"One-Page OS",        sub:"Always-on" },
];

export default function DecisionSuiteApp() {
  const [active, setActive] = useState("home");
  const [ledgerEntries, setLedgerEntries] = useState<CLEntry[]>([]);

  useEffect(() => {
    function loadLedger() {
      try {
        const r = storage.get("commitment-ledger-entries");
        if (r && r.value) setLedgerEntries(JSON.parse(r.value));
      } catch {}
    }
    loadLedger();
    const interval = setInterval(loadLedger, 5000);
    return () => clearInterval(interval);
  }, []);

  const kept = ledgerEntries.filter(e=>e.status==="kept");
  const resolved = ledgerEntries.filter(e=>e.status!=="pending");
  const pending = ledgerEntries.filter(e=>e.status==="pending");
  const overdue = pending.filter(e=>e.deadline && Math.ceil((new Date(e.deadline).getTime()-new Date(new Date().toISOString().split("T")[0]).getTime())/(1000*60*60*24))<0);
  const intPct = resolved.length > 0 ? Math.round((kept.length/resolved.length)*100) : null;
  const ledgerStats = { total: ledgerEntries.length, kept: kept.length, overdue: overdue.length, intPct };

  const currentLabel = NAV_ITEMS.find(n=>n.id===active)?.label || "Dashboard";

  return (
    <>
      <style>{SHELL_CSS}</style>
      <div className="suite-shell">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">Decision<span>.</span></div>
            <div className="logo-sub">Suite · All Tools</div>
          </div>
          <div className="sidebar-nav">
            <div className="nav-section-label">Navigation</div>
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`nav-item ${active===item.id?"active":""}`} onClick={()=>setActive(item.id)}>
                <div className="nav-icon">{item.icon}</div>
                <div className="nav-label">
                  {item.label}
                  <span className="nav-sublabel">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="suite-tag">Decision Suite v1.0</div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="topbar-path">
              <span>Suite</span>
              <span className="path-sep">/</span>
              <span className="path-active">{currentLabel}</span>
            </div>
            <div className="topbar-right">
              {intPct !== null ? `Integrity: ${intPct}%` : ""}
            </div>
          </div>
          <div className="tool-frame">
            {active==="home"      && <HomeDashboard onNavigate={setActive} ledgerStats={ledgerStats}/>}
            {active==="decision"  && <DecisionClarity/>}
            {active==="assumption"&& <AssumptionAudit/>}
            {active==="premortem" && <PreMortemStudio/>}
            {active==="ledger"    && <CommitmentLedger/>}
            {active==="os"        && <OnePageOS/>}
          </div>
        </div>
      </div>
    </>
  );
}
