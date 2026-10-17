// Shared templates data — single source of truth for both the in-app
// Templates Library and the public /frameworks/* SEO pages.

export interface TplStep { title: string; desc: string }
export interface Template {
  id: string;
  slug: string;
  icon: string;
  name: string;
  fullName: string;
  cat: "prioritize" | "decide" | "analyze" | "plan";
  badge: string;
  desc: string;
  dims: string[];
  steps: TplStep[];
  // Optional SEO copy — added per framework as we iterate
  seo?: {
    title?: string;
    metaDescription?: string;
    h1?: string;
    oneLiner?: string;
    whenToUse?: string[];
    example?: { title: string; body: string };
    pros?: string[];
    cons?: string[];
    related?: { slug: string; label: string }[];
    faq?: { q: string; a: string }[];
  };
}

export interface TplItem { id: string; items: string[] }
export interface RiceItem { name: string; reach: number; impact: number; confidence: number; effort: number }

export const TPL_CSS = `
/* Theme tokens duplicated from DecisionSuite SHELL_CSS so public pages
   (landing, pricing, about, frameworks) render correctly without the app shell. */
:root, .theme-dark{
  --bg:#0d1116; --bg2:#141a22; --bg3:#1c232d;
  --border:#242c37; --border2:#33404f;
  --text:#f2ece0; --text2:#8a9099; --text3:#4a5261;
  --gold:#d4b45a; --gold-d:rgba(212,180,90,0.15);
  --red:#e63946; --red-d:rgba(230,57,70,0.12);
  --green:#52b788; --green-d:rgba(82,183,136,0.12);
  --blue:#60a5fa; --blue-d:rgba(96,165,250,0.10);
  --amber:#f4a261;
  --grid:rgba(212,180,90,0.035);
}
.tpl-app{min-height:100vh;background:var(--bg);font-family:'DM Sans',sans-serif;color:var(--text);padding:40px 32px 80px;}
.tpl-wrap{max-width:960px;margin:0 auto;}
.tpl-hdr{margin-bottom:36px;}
.tpl-ey{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:10px;}
.tpl-title{font-family:'Syne',sans-serif;font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-1px;color:var(--text);margin-bottom:6px;}
.tpl-title span{color:var(--gold);}
.tpl-sub{font-size:13px;color:var(--text2);font-weight:300;max-width:520px;line-height:1.7;}

.tpl-cats{display:flex;gap:8px;margin-bottom:28px;flex-wrap:wrap;}
.tpl-cat{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:7px 16px;border:1px solid var(--border2);background:var(--bg2);color:var(--text2);cursor:pointer;border-radius:20px;transition:all .2s;}
.tpl-cat:hover{border-color:var(--gold);color:var(--text);}
.tpl-cat.active{background:var(--gold);border-color:var(--gold);color:#0d0d0d;font-weight:600;}

.tpl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
.tpl-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:28px;cursor:pointer;transition:all .25s;position:relative;overflow:hidden;}
.tpl-card:hover{border-color:var(--gold);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.15);}
.tpl-card-icon{font-size:28px;margin-bottom:14px;}
.tpl-card-badge{position:absolute;top:16px;right:16px;font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:10px;border:1px solid;}
.tpl-badge-prioritize{background:var(--blue-d);color:var(--blue);border-color:rgba(96,165,250,.2);}
.tpl-badge-decide{background:var(--gold-d);color:var(--gold);border-color:rgba(201,168,76,.25);}
.tpl-badge-analyze{background:var(--green-d);color:var(--green);border-color:rgba(82,183,136,.2);}
.tpl-badge-plan{background:var(--red-d);color:var(--red);border-color:rgba(230,57,70,.2);}
.tpl-card-name{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px;letter-spacing:-.3px;}
.tpl-card-full{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:1px;color:var(--text3);margin-bottom:10px;}
.tpl-card-desc{font-size:12px;color:var(--text2);line-height:1.65;font-weight:300;margin-bottom:16px;}
.tpl-card-dims{display:flex;gap:6px;flex-wrap:wrap;}
.tpl-dim{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:1px;padding:3px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text3);}

.tpl-active{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:36px;max-width:720px;margin:0 auto;}
.tpl-back{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text2);cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-bottom:24px;transition:color .15s;background:none;border:none;}
.tpl-back:hover{color:var(--gold);}
.tpl-a-icon{font-size:36px;margin-bottom:12px;}
.tpl-a-name{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--text);margin-bottom:4px;letter-spacing:-.5px;}
.tpl-a-full{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--text3);margin-bottom:8px;text-transform:uppercase;}
.tpl-a-desc{font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:28px;font-weight:300;}
.tpl-a-section{margin-bottom:24px;}
.tpl-a-slbl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:12px;}
.tpl-a-steps{display:flex;flex-direction:column;gap:8px;}
.tpl-a-step{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:16px 20px;display:flex;align-items:flex-start;gap:14px;}
.tpl-a-snum{width:28px;height:28px;border-radius:50%;background:var(--gold-d);border:1px solid rgba(201,168,76,.3);display:flex;align-items:center;justify-content:center;font-family:'Azeret Mono',monospace;font-size:11px;color:var(--gold);font-weight:700;flex-shrink:0;}
.tpl-a-stxt{flex:1;}
.tpl-a-sttl{font-size:14px;font-weight:600;color:var(--text);margin-bottom:3px;}
.tpl-a-sdsc{font-size:12px;color:var(--text2);line-height:1.6;font-weight:300;}

.tpl-ws{margin-top:28px;}
.tpl-ws-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--text);margin-bottom:16px;}
.tpl-ws-grid{display:grid;gap:12px;}
.tpl-ws-grid.cols-2{grid-template-columns:1fr 1fr;}
.tpl-ws-grid.cols-4{grid-template-columns:1fr 1fr;gap:12px;}
.tpl-ws-quad{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:20px;min-height:160px;display:flex;flex-direction:column;}
.tpl-ws-qlbl{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;font-weight:600;}
.tpl-ws-qdesc{font-size:11px;color:var(--text2);margin-bottom:12px;font-weight:300;}
.tpl-ws-items{flex:1;display:flex;flex-direction:column;gap:6px;}
.tpl-ws-item{display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:12px;color:var(--text);}
.tpl-ws-item button{background:none;border:none;cursor:pointer;color:var(--text3);font-size:14px;margin-left:auto;}.tpl-ws-item button:hover{color:var(--red);}
.tpl-ws-add{display:flex;gap:8px;margin-top:8px;}
.tpl-ws-add input{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--text);outline:none;}
.tpl-ws-add input:focus{border-color:var(--gold);}
.tpl-ws-add input::placeholder{color:var(--text3);}
.tpl-ws-add button{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:1px;padding:8px 14px;background:var(--gold);border:none;border-radius:8px;color:#0d0d0d;cursor:pointer;font-weight:600;white-space:nowrap;}
.tpl-ws-add button:hover{opacity:.85;}

.tpl-rice-row{display:grid;grid-template-columns:2fr repeat(4,1fr) 80px;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);}
.tpl-rice-hdr{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);padding-bottom:8px;border-bottom:2px solid var(--border);}
.tpl-rice-name{font-size:13px;color:var(--text);font-weight:500;}
.tpl-rice-in{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-family:'Azeret Mono',monospace;font-size:12px;color:var(--text);text-align:center;outline:none;}
.tpl-rice-in:focus{border-color:var(--gold);}
.tpl-rice-score{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:var(--gold);text-align:center;}

.tpl-q-s .tpl-ws-qlbl{color:var(--green);}
.tpl-q-w .tpl-ws-qlbl{color:var(--red);}
.tpl-q-o .tpl-ws-qlbl{color:var(--blue);}
.tpl-q-t .tpl-ws-qlbl{color:var(--amber);}

@media(max-width:600px){
  .tpl-grid{grid-template-columns:1fr;}
  .tpl-ws-grid.cols-2,.tpl-ws-grid.cols-4{grid-template-columns:1fr;}
  .tpl-rice-row{grid-template-columns:1fr;gap:4px;}
}
`;

export const TEMPLATES: Template[] = [
  { id:"rice", slug:"rice", icon:"📊", name:"RICE", fullName:"Reach · Impact · Confidence · Effort", cat:"prioritize", badge:"tpl-badge-prioritize",
    desc:"Prioritize features or initiatives by scoring each on Reach, Impact, Confidence, and Effort. Produces a single comparable score.",
    dims:["Product","Features","Backlog"],
    steps:[
      {title:"List initiatives",desc:"Add every feature, project, or idea you're considering."},
      {title:"Score Reach",desc:"How many people will this impact in a given time period? (e.g. customers/quarter)"},
      {title:"Score Impact",desc:"How much will each person be affected? Scale: 3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal."},
      {title:"Score Confidence",desc:"How confident are you in your estimates? 100%=high, 80%=medium, 50%=low."},
      {title:"Score Effort",desc:"How many person-months will this take? Higher effort = lower priority."},
      {title:"Rank by RICE score",desc:"RICE = (Reach × Impact × Confidence) / Effort. Highest score wins."},
    ],
    seo: {
      title: "RICE Scoring Framework — Prioritize Features Fast | Decision Suite",
      metaDescription: "Use the RICE framework to score and rank product initiatives by Reach, Impact, Confidence, and Effort. Free interactive calculator — no signup required.",
      h1: "RICE Scoring: Prioritize Features by Reach × Impact × Confidence ÷ Effort",
      oneLiner: "RICE is a product prioritization framework that turns gut-feel feature debates into a single comparable score: (Reach × Impact × Confidence) ÷ Effort.",
      whenToUse: [
        "You have a product backlog with more ideas than you can build this quarter.",
        "Stakeholders disagree about which feature ships next and you need a defensible answer.",
        "You're planning a roadmap and want to compare initiatives of very different sizes.",
        "You're choosing between growth experiments and need to weigh upside against cost.",
      ],
      example: {
        title: "Worked example",
        body: "Imagine three features: a new onboarding flow (Reach 5,000 users/quarter, Impact 2, Confidence 80%, Effort 3), a referral program (Reach 1,500, Impact 3, Confidence 50%, Effort 2), and a dark mode toggle (Reach 8,000, Impact 0.5, Confidence 100%, Effort 1). RICE scores: 2,667 / 1,125 / 4,000. Dark mode wins on math — even though it feels less ambitious, its low effort and high confidence carry it.",
      },
      pros: [
        "Forces honest conversations about confidence — the 'C' kills wishful thinking.",
        "Comparable across teams: a marketing experiment and an engineering rebuild produce the same unit.",
        "Easy to recompute as new evidence arrives.",
      ],
      cons: [
        "Reach and Effort estimates are guesses dressed up in numbers — bad inputs, bad output.",
        "Doesn't capture strategic fit or dependencies — a low-RICE initiative may still be table stakes.",
        "Can be gamed by anyone who wants their pet feature shipped.",
      ],
      related: [
        { slug: "ice-score", label: "ICE Score (simpler RICE)" },
        { slug: "eisenhower-matrix", label: "Eisenhower Matrix" },
      ],
      faq: [
        { q: "What does RICE stand for?", a: "Reach, Impact, Confidence, and Effort — the four variables you score for each initiative before computing a single priority number." },
        { q: "How is the RICE score calculated?", a: "RICE = (Reach × Impact × Confidence%) ÷ Effort. Reach is people affected per time period, Impact is a 0.25–3 scale, Confidence is a percentage, Effort is person-months." },
        { q: "Who invented the RICE framework?", a: "Intercom's product team published RICE in 2016 as a way to bring rigor to backlog prioritization decisions." },
        { q: "What's the difference between RICE and ICE?", a: "ICE drops the Reach variable and uses a flat 1–10 scale for the remaining three. RICE is more rigorous; ICE is faster for early-stage scoring." },
      ],
    },
  },
  { id:"eisenhower", slug:"eisenhower-matrix", icon:"🎯", name:"Eisenhower", fullName:"Urgent-Important Matrix", cat:"prioritize", badge:"tpl-badge-prioritize",
    desc:"Sort tasks into four quadrants based on urgency and importance. Focus on what matters, delegate or eliminate the rest.",
    dims:["Time Mgmt","Tasks","Focus"],
    steps:[
      {title:"Brain dump",desc:"List every task, obligation, and to-do on your plate."},
      {title:"Assess importance",desc:"Ask: does this contribute to my long-term goals and values?"},
      {title:"Assess urgency",desc:"Ask: does this require immediate attention? What's the deadline pressure?"},
      {title:"Place in quadrant",desc:"Important+Urgent → Do Now. Important+Not Urgent → Schedule. Not Important+Urgent → Delegate. Neither → Eliminate."},
    ]},
  { id:"swot", slug:"swot-analysis", icon:"🔲", name:"SWOT", fullName:"Strengths · Weaknesses · Opportunities · Threats", cat:"analyze", badge:"tpl-badge-analyze",
    desc:"Map internal strengths and weaknesses against external opportunities and threats. Classic strategic analysis framework.",
    dims:["Strategy","Analysis","Planning"],
    steps:[
      {title:"Identify Strengths",desc:"What advantages do you have? What do you do well? What resources can you draw on?"},
      {title:"Identify Weaknesses",desc:"What could you improve? Where do you have fewer resources? What are others likely to see as weaknesses?"},
      {title:"Identify Opportunities",desc:"What trends could you take advantage of? What opportunities are open to you?"},
      {title:"Identify Threats",desc:"What obstacles do you face? What is your competition doing? Are quality standards changing?"},
    ]},
  { id:"sixhats", slug:"six-thinking-hats", icon:"🎩", name:"Six Hats", fullName:"De Bono's Six Thinking Hats", cat:"decide", badge:"tpl-badge-decide",
    desc:"Explore a decision from six distinct perspectives: facts, emotions, risks, benefits, creativity, and process.",
    dims:["Perspective","Meetings","Teams"],
    steps:[
      {title:"White Hat — Facts",desc:"What data and information do we have? What's missing? Focus purely on known facts."},
      {title:"Red Hat — Emotions",desc:"What's your gut reaction? How do you feel about this? No justification needed."},
      {title:"Black Hat — Risks",desc:"What could go wrong? Play devil's advocate. Find weaknesses and dangers."},
      {title:"Yellow Hat — Benefits",desc:"What's the best case? Find the value and benefits. Be optimistic."},
      {title:"Green Hat — Creativity",desc:"What are the alternatives? New ideas? Provocative suggestions welcome."},
      {title:"Blue Hat — Process",desc:"What's the summary? What are the next steps? Manage the thinking process."},
    ]},
  { id:"iceScore", slug:"ice-score", icon:"❄️", name:"ICE Score", fullName:"Impact · Confidence · Ease", cat:"prioritize", badge:"tpl-badge-prioritize",
    desc:"A simpler alternative to RICE. Score each idea on Impact, Confidence, and Ease (1-10 each), then average.",
    dims:["Growth","Ideas","Quick"],
    steps:[
      {title:"List growth ideas",desc:"Brainstorm every experiment, feature, or campaign you could run."},
      {title:"Score Impact (1-10)",desc:"If this works, how big is the impact on your key metric?"},
      {title:"Score Confidence (1-10)",desc:"How confident are you that this will work based on data and experience?"},
      {title:"Score Ease (1-10)",desc:"How easy is this to implement? 10=trivial, 1=massive undertaking."},
      {title:"Calculate & rank",desc:"ICE = (Impact + Confidence + Ease) / 3. Rank highest to lowest."},
    ]},
  { id:"pdca", slug:"pdca-cycle", icon:"🔄", name:"PDCA", fullName:"Plan · Do · Check · Act", cat:"plan", badge:"tpl-badge-plan",
    desc:"Deming's continuous improvement cycle. Plan the change, execute it, check results, act on learnings. Repeat.",
    dims:["Process","Improvement","Ops"],
    steps:[
      {title:"Plan",desc:"Identify the problem. Analyze root causes. Develop a hypothesis and plan for change."},
      {title:"Do",desc:"Implement the plan on a small scale. Document what happens."},
      {title:"Check",desc:"Measure the results. Did the change produce the expected improvement? Analyze data."},
      {title:"Act",desc:"If it worked, standardize the change. If not, learn from it and plan the next cycle."},
    ]},
];

export const TEMPLATE_CATS = [
  {id:"all",label:"All Frameworks"},
  {id:"prioritize",label:"Prioritize"},
  {id:"decide",label:"Decide"},
  {id:"analyze",label:"Analyze"},
  {id:"plan",label:"Plan"},
];

export const getTemplateBySlug = (slug: string) => TEMPLATES.find(t => t.slug === slug);
export const getTemplateById = (id: string) => TEMPLATES.find(t => t.id === id);
