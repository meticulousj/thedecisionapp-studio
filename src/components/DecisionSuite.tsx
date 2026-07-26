import { useState, useEffect } from "react";
import DevilsAdvocate from "./DevilsAdvocate";
import AssumptionExtractor from "./AssumptionExtractor";
import ExportMenu from "./ExportMenu";
import AccountButton from "./AccountButton";
import type { ExportPayload } from "@/lib/export";
import { storage } from "@/lib/syncedStorage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { invokeAi } from "@/lib/aiInvoke";
import { TEMPLATES, TEMPLATE_CATS, TPL_CSS } from "@/lib/templates/data";
import { FrameworkWorkspace } from "@/lib/templates/Workspace";
import logoAsset from "@/assets/logo.png.asset.json";

const FREE_LIMIT = 5;

// ─────────────────────────────────────────
// SHELL CSS
// ─────────────────────────────────────────
const SHELL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
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
.theme-light{
  --bg:#f5f2ea; --bg2:#ffffff; --bg3:#ebe6db;
  --border:#d8d1c2; --border2:#c2baa7;
  --text:#161a20; --text2:#555; --text3:#999;
  --gold:#a07c2e; --gold-d:rgba(160,124,46,0.12);
  --red:#c0392b; --red-d:rgba(192,57,43,0.08);
  --green:#27ae60; --green-d:rgba(39,174,96,0.08);
  --blue:#2980b9; --blue-d:rgba(41,128,185,0.08);
  --amber:#d4870e;
  --grid:rgba(160,124,46,0.04);
}
.suite-shell body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;}
.suite-shell{display:flex;height:100vh;overflow:hidden;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;zoom:1.15;
  background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);
  background-size:48px 48px;
}


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
.sidebar-logo img{
  width:140px;height:auto;display:block;
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

/* ── PERSONALIZED "FOR YOU" ── */
.foryou{border:1px solid var(--gold);border-radius:16px;padding:24px;margin-bottom:32px;
  background:linear-gradient(135deg,var(--gold-d),transparent);}
.foryou-eyebrow{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;
  text-transform:uppercase;color:var(--gold);margin-bottom:8px;}
.foryou-greet{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:var(--text);margin-bottom:16px;letter-spacing:-.5px;}
.foryou-greet em{font-family:'Newsreader',serif;font-style:italic;font-weight:400;color:var(--gold);}
.foryou-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;}
.foryou-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px 16px;cursor:pointer;transition:all .15s;}
.foryou-card:hover{border-color:var(--gold);transform:translateY(-2px);}
.foryou-clbl{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);margin-bottom:6px;}
.foryou-ctitle{font-family:'Syne',sans-serif;font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px;}
.foryou-cdesc{font-size:12px;color:var(--text2);line-height:1.5;}
.foryou-prompt{margin-top:16px;padding:12px 14px;border-left:2px solid var(--gold);background:var(--bg2);border-radius:4px;
  font-family:'Newsreader',serif;font-style:italic;font-size:14px;color:var(--text2);line-height:1.6;}

/* ── ONBOARDING MODAL ── */
.onb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);z-index:9999;
  display:flex;align-items:center;justify-content:center;padding:20px;}
.onb-modal{background:var(--bg2);border:1px solid var(--border2);border-radius:20px;max-width:520px;width:100%;
  padding:40px;box-shadow:0 30px 80px rgba(0,0,0,.5);}
.onb-step{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:12px;}
.onb-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-.8px;color:var(--text);margin-bottom:12px;line-height:1.1;}
.onb-title em{font-family:'Newsreader',serif;font-style:italic;font-weight:400;color:var(--gold);}
.onb-sub{font-size:14px;color:var(--text2);line-height:1.6;margin-bottom:24px;}
.onb-input{width:100%;background:var(--bg);border:1px solid var(--border2);border-radius:8px;padding:12px 14px;color:var(--text);font-size:14px;font-family:'DM Sans',sans-serif;margin-bottom:20px;}
.onb-input:focus{outline:none;border-color:var(--gold);}
.onb-goals{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
.onb-goal{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;text-align:left;transition:all .15s;color:var(--text);font-family:inherit;}
.onb-goal:hover{border-color:var(--gold);}
.onb-goal.sel{border-color:var(--gold);background:var(--gold-d);}
.onb-goal-icon{font-size:20px;margin-bottom:6px;}
.onb-goal-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:2px;}
.onb-goal-desc{font-size:11px;color:var(--text2);line-height:1.4;}
.onb-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;}
.onb-skip{background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;font-family:inherit;}
.onb-skip:hover{color:var(--text);}
.onb-next{background:var(--gold);color:#0d1116;border:none;border-radius:8px;padding:12px 24px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;letter-spacing:.5px;cursor:pointer;transition:all .15s;}
.onb-next:hover{transform:translateY(-1px);}
.onb-next:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.onb-dots{display:flex;gap:6px;justify-content:center;margin-top:20px;}
.onb-dot{width:6px;height:6px;border-radius:50%;background:var(--border2);}
.onb-dot.active{background:var(--gold);width:20px;border-radius:3px;transition:all .2s;}

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
  .sidebar-logo{padding:12px 8px;display:flex;justify-content:center;}
  .sidebar-logo img{width:44px;height:auto;}
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
      {step===4&&results.length>0&&(
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
          <ExportMenu getPayload={()=>({
            kind:"decision",
            toolLabel:"Decision Suite · Decision Clarity",
            title:"Decision",
            titleEm:"Clarity",
            subtitle:decision||undefined,
            sections:[
              {heading:"Recommendation",type:"text",body:`${results[0]?.name} — weighted score ${results[0]?.score.toFixed(1)}%`},
              {heading:"Ranked options",type:"table",columns:["Rank","Option","Score"],rows:results.map((r,i)=>[i+1,r.name,`${r.score.toFixed(1)}%`])},
              {heading:"Criteria & weights",type:"table",columns:["Criterion","Weight"],rows:criteria.map(c=>[c.name,`×${c.weight}`])},
              {heading:"Score matrix",type:"table",columns:["Option",...criteria.map(c=>c.name)],rows:options.map(o=>[o,...criteria.map(c=>getScore(o,c.name))])},
            ],
          } as ExportPayload)}/>
        </div>
      )}
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
.aa-app{min-height:100%;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;align-items:center;padding:48px 20px 100px;position:relative;}
.theme-light .aa-app{background:var(--aa-bg,#fafafa);color:var(--aa-fg,#1a1a2e);}
.theme-dark .aa-app,.aa-app{background:var(--aa-bg,#0a0a0f);color:var(--aa-fg,#f0f0f0);}
:root,.theme-dark{--aa-bg:#0a0a0f;--aa-fg:#f0f0f0;--aa-card:#111118;--aa-card2:#0d0d14;--aa-border:#1e1e2e;--aa-border2:#2a2a3a;--aa-muted:#666;--aa-muted2:#444;--aa-accent:#e63946;--aa-accent-dim:rgba(230,57,70,.1);--aa-blue:#60a5fa;--aa-orange:#f4a261;--aa-green:#52b788;--aa-blue-dim:rgba(96,165,250,.1);--aa-orange-dim:rgba(244,162,97,.1);--aa-green-dim:rgba(82,183,136,.1);}
.theme-light{--aa-bg:#fafafa;--aa-fg:#1a1a2e;--aa-card:#ffffff;--aa-card2:#f5f5f8;--aa-border:#e2e2ea;--aa-border2:#d0d0da;--aa-muted:#777;--aa-muted2:#999;--aa-accent:#d62839;--aa-accent-dim:rgba(214,40,57,.08);--aa-blue:#3b82f6;--aa-orange:#e8913a;--aa-green:#3a9d6e;--aa-blue-dim:rgba(59,130,246,.08);--aa-orange-dim:rgba(232,145,58,.08);--aa-green-dim:rgba(58,157,110,.08);}

/* Header */
.aa-hero{width:100%;max-width:720px;margin-bottom:44px;display:flex;flex-direction:column;gap:16px;}
.aa-hero-top{display:flex;align-items:center;gap:12px;}
.aa-badge{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--aa-accent);background:var(--aa-accent-dim);border:1px solid rgba(230,57,70,.2);padding:5px 12px;border-radius:2px;}
.aa-suite-tag{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--aa-muted2);}
.aa-hero-title{font-family:'Syne',sans-serif;font-size:clamp(36px,6vw,58px);font-weight:800;line-height:.92;letter-spacing:-2px;}
.aa-hero-title em{font-style:normal;color:var(--aa-accent);}
.aa-hero-desc{font-size:14px;color:var(--aa-muted);line-height:1.7;max-width:480px;border-left:2px solid var(--aa-accent);padding-left:16px;}

/* Stepper */
.aa-stepper{width:100%;max-width:720px;display:flex;align-items:center;gap:0;margin-bottom:40px;}
.aa-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;cursor:default;}
.aa-step-dot{width:36px;height:36px;border-radius:50%;border:2px solid var(--aa-border2);background:var(--aa-card);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--aa-muted2);transition:all .35s;z-index:2;}
.aa-step.active .aa-step-dot{border-color:var(--aa-accent);color:var(--aa-accent);box-shadow:0 0 20px var(--aa-accent-dim),0 0 0 4px var(--aa-accent-dim);}
.aa-step.done .aa-step-dot{border-color:var(--aa-green);background:var(--aa-green);color:#fff;}
.aa-step-label{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--aa-muted2);transition:color .3s;}
.aa-step.active .aa-step-label{color:var(--aa-accent);}
.aa-step.done .aa-step-label{color:var(--aa-green);}
.aa-step-line{position:absolute;top:18px;left:calc(50% + 22px);right:calc(-50% + 22px);height:2px;background:var(--aa-border);z-index:1;}
.aa-step.done .aa-step-line{background:var(--aa-green);}
.aa-step:last-child .aa-step-line{display:none;}

/* Panels */
.aa-panel{width:100%;max-width:720px;background:var(--aa-card);border:1px solid var(--aa-border);border-radius:12px;padding:36px;margin-bottom:16px;animation:aaFadeIn .35s ease;position:relative;overflow:hidden;}
.aa-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--aa-accent),transparent 60%);}
@keyframes aaFadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
.aa-panel-title{font-family:'Syne',sans-serif;font-size:21px;font-weight:700;letter-spacing:-.5px;margin-bottom:6px;}
.aa-panel-desc{font-size:13px;color:var(--aa-muted);line-height:1.65;margin-bottom:24px;}

/* Inputs */
.aa-label{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--aa-muted2);display:block;margin-bottom:9px;}
.aa-textarea,.aa-input{width:100%;background:var(--aa-card2);border:1px solid var(--aa-border);border-radius:8px;padding:14px 16px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--aa-fg);outline:none;transition:border-color .2s,box-shadow .2s;resize:none;}
.aa-textarea:focus,.aa-input:focus{border-color:var(--aa-accent);box-shadow:0 0 0 3px var(--aa-accent-dim);}
.aa-textarea::placeholder,.aa-input::placeholder{color:var(--aa-muted2);font-style:italic;}

/* Add Row */
.aa-add-row{display:flex;gap:10px;margin-top:16px;}
.aa-add-row .aa-input{flex:1;}
.aa-hint{font-family:'Azeret Mono',monospace;font-size:9px;color:var(--aa-muted2);margin-top:10px;line-height:1.6;}
.aa-strategy-quote{font-size:13px;color:var(--aa-muted);border-left:3px solid var(--aa-accent);padding:10px 16px;background:var(--aa-accent-dim);border-radius:0 8px 8px 0;margin-bottom:20px;line-height:1.6;font-style:italic;}

/* Assumption Items */
.aa-items{margin-top:20px;display:flex;flex-direction:column;gap:10px;}
.aa-card{background:var(--aa-card2);border:1px solid var(--aa-border);border-radius:10px;padding:20px;transition:border-color .3s,box-shadow .3s;position:relative;overflow:hidden;}
.aa-card::after{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:4px 0 0 4px;transition:background .3s;}
.aa-card.blind-spot::after{background:var(--aa-accent);}
.aa-card.caution::after{background:var(--aa-orange);}
.aa-card.solid::after{background:var(--aa-green);}
.aa-card.untested::after{background:var(--aa-blue);}
.aa-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:16px;}
.aa-card-text{font-size:14px;line-height:1.5;flex:1;}
.aa-card-del{background:none;border:none;cursor:pointer;color:var(--aa-muted2);font-size:18px;line-height:1;padding:2px 6px;border-radius:4px;transition:all .15s;}
.aa-card-del:hover{color:var(--aa-accent);background:var(--aa-accent-dim);}

/* Rating Controls */
.aa-rating-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.aa-rating-group{}
.aa-rating-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.aa-rating-label{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--aa-muted2);}
.aa-rating-value{font-family:'Azeret Mono',monospace;font-size:11px;font-weight:600;}
.aa-rating-bar{display:flex;gap:4px;}
.aa-pip{flex:1;height:8px;background:var(--aa-border);cursor:pointer;border-radius:4px;transition:background .15s,transform .1s;}
.aa-pip:hover{transform:scaleY(1.4);}
.aa-pip.ev-on{background:var(--aa-blue);}
.aa-pip.wt-on{background:var(--aa-orange);}
.aa-rating-labels{display:flex;justify-content:space-between;margin-top:4px;}
.aa-rating-labels span{font-family:'Azeret Mono',monospace;font-size:8px;color:var(--aa-muted2);}

/* Flag badge */
.aa-flag{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:20px;}
.flag-blind{background:var(--aa-accent-dim);color:var(--aa-accent);border:1px solid rgba(230,57,70,.25);}
.flag-caution{background:var(--aa-orange-dim);color:var(--aa-orange);border:1px solid rgba(244,162,97,.25);}
.flag-solid{background:var(--aa-green-dim);color:var(--aa-green);border:1px solid rgba(82,183,136,.25);}
.flag-untested{background:var(--aa-blue-dim);color:var(--aa-blue);border:1px solid rgba(96,165,250,.2);}

/* Empty state */
.aa-empty{font-size:13px;color:var(--aa-muted2);font-style:italic;text-align:center;padding:24px 0;}

/* Navigation */
.aa-nav{width:100%;max-width:720px;display:flex;justify-content:space-between;align-items:center;margin-top:12px;}
.aa-btn{font-family:'Azeret Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:12px 24px;border:none;border-radius:8px;cursor:pointer;transition:all .2s;font-weight:600;}
.aa-btn-primary{background:var(--aa-accent);color:#fff;box-shadow:0 4px 14px var(--aa-accent-dim);}
.aa-btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 20px var(--aa-accent-dim);}
.aa-btn-primary:disabled{opacity:.35;cursor:not-allowed;transform:none;filter:none;}
.aa-btn-ghost{background:transparent;color:var(--aa-muted);border:1px solid var(--aa-border);}
.aa-btn-ghost:hover{background:var(--aa-card);color:var(--aa-fg);border-color:var(--aa-border2);}
.aa-btn-ghost:disabled{opacity:.3;cursor:not-allowed;}

/* Results */
.aa-results-hero{width:100%;max-width:720px;text-align:center;margin-bottom:32px;}
.aa-results-headline{font-family:'Syne',sans-serif;font-size:clamp(30px,5vw,48px);font-weight:800;line-height:1;letter-spacing:-1px;margin-bottom:8px;}
.aa-results-sub{font-size:13px;color:var(--aa-muted);}
.aa-results-strategy{font-size:12px;color:var(--aa-muted2);border-left:2px solid var(--aa-border2);padding-left:12px;margin-top:12px;line-height:1.6;text-align:left;display:inline-block;}

/* Stats Grid */
.aa-stats-grid{width:100%;max-width:720px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px;}
.aa-stat-card{background:var(--aa-card);border:1px solid var(--aa-border);border-radius:10px;padding:20px;text-align:center;transition:transform .2s;}
.aa-stat-card:hover{transform:translateY(-2px);}
.aa-stat-num{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;line-height:1;margin-bottom:6px;}
.aa-stat-label{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--aa-muted2);}

/* Insight banner */
.aa-insight{width:100%;max-width:720px;border-radius:10px;border-left:4px solid var(--aa-accent);background:var(--aa-accent-dim);padding:20px 24px;margin-bottom:24px;}
.aa-insight-tag{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--aa-accent);margin-bottom:8px;}
.aa-insight-text{font-size:13px;color:var(--aa-muted);line-height:1.7;}

/* Category Matrix */
.aa-matrix{width:100%;max-width:720px;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
.aa-matrix-card{background:var(--aa-card);border:1px solid var(--aa-border);border-radius:10px;padding:20px;min-height:90px;}
.aa-matrix-head{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.aa-matrix-dot{width:8px;height:8px;border-radius:50%;}
.aa-matrix-title{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;}
.aa-matrix-item{font-size:12px;color:var(--aa-muted);line-height:1.5;padding:6px 0;border-bottom:1px solid var(--aa-border);}
.aa-matrix-item:last-child{border-bottom:none;}
.aa-cat-blind .aa-matrix-title{color:var(--aa-accent);}.aa-cat-blind .aa-matrix-dot{background:var(--aa-accent);}
.aa-cat-caution .aa-matrix-title{color:var(--aa-orange);}.aa-cat-caution .aa-matrix-dot{background:var(--aa-orange);}
.aa-cat-solid .aa-matrix-title{color:var(--aa-green);}.aa-cat-solid .aa-matrix-dot{background:var(--aa-green);}
.aa-cat-low .aa-matrix-title{color:var(--aa-muted2);}.aa-cat-low .aa-matrix-dot{background:var(--aa-border2);}

/* Full Table */
.aa-table{width:100%;max-width:720px;background:var(--aa-card);border:1px solid var(--aa-border);border-radius:10px;overflow:hidden;margin-bottom:24px;}
.aa-table-hdr{padding:14px 24px;border-bottom:1px solid var(--aa-border);display:grid;grid-template-columns:1fr 80px 80px 100px;gap:10px;background:var(--aa-card2);}
.aa-table-th{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--aa-muted2);text-align:center;}
.aa-table-th:first-child{text-align:left;}
.aa-table-row{padding:14px 24px;border-bottom:1px solid var(--aa-border);display:grid;grid-template-columns:1fr 80px 80px 100px;gap:10px;align-items:center;transition:background .15s;}
.aa-table-row:last-child{border-bottom:none;}
.aa-table-row:hover{background:var(--aa-card2);}
.aa-table-cell{font-size:13px;line-height:1.4;}
.aa-table-val{font-family:'Azeret Mono',monospace;font-size:12px;text-align:center;}
.aa-table-flag{display:flex;justify-content:center;}

/* Reset Row */
.aa-actions{display:flex;justify-content:center;gap:12px;margin-top:12px;}
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

    {/* Hero Header */}
    <div className="aa-hero">
      <div className="aa-hero-top"><span className="aa-badge">Audit Tool</span><span className="aa-suite-tag">Decision Suite · 01</span></div>
      <div className="aa-hero-title">Assumption<br/><em>Audit</em></div>
      <div className="aa-hero-desc">Surface hidden beliefs. Rate each on evidence quality and load-bearing weight. Find blind spots before they find you.</div>
    </div>

    {/* Stepper */}
    <div className="aa-stepper">
      {PHASES.map((p,i)=>(
        <div key={i} className={`aa-step${phase===i?" active":phase>i?" done":""}`}>
          <div className="aa-step-dot">{phase>i?"✓":i+1}</div>
          <span className="aa-step-label">{p}</span>
          <div className="aa-step-line"/>
        </div>
      ))}
    </div>

    {/* Phase 0: Strategy */}
    {phase===0&&(<div className="aa-panel">
      <div className="aa-panel-title">State your strategy</div>
      <div className="aa-panel-desc">Enter the plan, strategy, or belief you want to stress-test for hidden assumptions.</div>
      <label className="aa-label">Strategy / Plan / Belief</label>
      <textarea className="aa-textarea" rows={4} placeholder={`e.g. "Hiring a VP of Sales will fix our pipeline problem"`} value={strategy} onChange={e=>setStrategy(e.target.value)}/>
    </div>)}

    {/* Phase 1: Extract assumptions */}
    {phase===1&&(<div className="aa-panel">
      <div className="aa-panel-title">Extract the assumptions</div>
      <div className="aa-panel-desc">What must be true for this strategy to work? List every belief baked into the plan.</div>
      <div className="aa-strategy-quote">"{strategy}"</div>
      <label className="aa-label">Add assumption</label>
      <div className="aa-add-row">
        <input className="aa-input" type="text" placeholder='"Our target customers have budget now"' value={aInp} onChange={e=>setAInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addA()}/>
        <button className="aa-btn aa-btn-primary" onClick={addA}>Add</button>
      </div>
      <div className="aa-hint">Press Enter to add · Aim for 5–10 assumptions</div>
      <div className="aa-items">
        {assumptions.length===0&&<div className="aa-empty">No assumptions added yet. Start typing above.</div>}
        {assumptions.map((a,i)=>(
          <div className="aa-card untested" key={i}>
            <div className="aa-card-head">
              <div className="aa-card-text">{a.text}</div>
              <button className="aa-card-del" onClick={()=>remA(i)}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>)}

    {/* Phase 2: Rate */}
    {phase===2&&(<div className="aa-panel">
      <div className="aa-panel-title">Rate each assumption</div>
      <div className="aa-panel-desc">Set evidence quality and load-bearing weight. Watch classifications update in real-time.</div>
      <div className="aa-items">
        {assumptions.map((a,i)=>{
          const flag=aaFlag(a.evidence,a.weight);
          return(<div className={`aa-card ${flag}`} key={i}>
            <div className="aa-card-head">
              <div className="aa-card-text">{a.text}</div>
              <AAFlag flag={flag}/>
            </div>
            <div className="aa-rating-grid">
              <div className="aa-rating-group">
                <div className="aa-rating-header">
                  <span className="aa-rating-label">Evidence</span>
                  <span className="aa-rating-value" style={{color:"var(--aa-blue)"}}>{EVLBLS[a.evidence-1]}</span>
                </div>
                <div className="aa-rating-bar">{[1,2,3,4,5].map(j=><div key={j} className={`aa-pip${a.evidence>=j?" ev-on":""}`} onClick={()=>updA(i,"evidence",j)}/>)}</div>
                <div className="aa-rating-labels"><span>Gut feel</span><span>Verified</span></div>
              </div>
              <div className="aa-rating-group">
                <div className="aa-rating-header">
                  <span className="aa-rating-label">Weight</span>
                  <span className="aa-rating-value" style={{color:"var(--aa-orange)"}}>{WLBLS[a.weight-1]}</span>
                </div>
                <div className="aa-rating-bar">{[1,2,3,4,5].map(j=><div key={j} className={`aa-pip${a.weight>=j?" wt-on":""}`} onClick={()=>updA(i,"weight",j)}/>)}</div>
                <div className="aa-rating-labels"><span>Trivial</span><span>Critical</span></div>
              </div>
            </div>
          </div>);
        })}
      </div>
    </div>)}

    {/* Phase 3: Results */}
    {phase===3&&(<>
      <div className="aa-results-hero">
        <div className="aa-results-headline">{blindSpots.length===0?"Defensible.":blindSpots.length<=2?"Manageable risk.":"High exposure."}</div>
        <div className="aa-results-sub">Audit complete · {assumptions.length} assumptions examined</div>
        <div className="aa-results-strategy">"{strategy}"</div>
      </div>

      <div className="aa-stats-grid">
        <div className="aa-stat-card"><div className="aa-stat-num" style={{color:"var(--aa-accent)"}}>{blindSpots.length}</div><div className="aa-stat-label">Blind Spots</div></div>
        <div className="aa-stat-card"><div className="aa-stat-num" style={{color:"var(--aa-orange)"}}>{cautions.length}</div><div className="aa-stat-label">Caution</div></div>
        <div className="aa-stat-card"><div className="aa-stat-num" style={{color:"var(--aa-green)"}}>{solids.length}</div><div className="aa-stat-label">Solid</div></div>
        <div className="aa-stat-card"><div className="aa-stat-num" style={{color:"var(--aa-muted)"}}>{untested.length}</div><div className="aa-stat-label">Untested</div></div>
      </div>

      {genInsight()&&<div className="aa-insight"><div className="aa-insight-tag">Audit Verdict</div><div className="aa-insight-text">{genInsight()}</div></div>}

      <div className="aa-matrix">
        {(["Blind Spots","Caution","Solid","Untested"] as const).map((label,idx)=>{
          const flags=["blind-spot","caution","solid","untested"];
          const classes=["aa-cat-blind","aa-cat-caution","aa-cat-solid","aa-cat-low"];
          const flag=flags[idx];const cls=classes[idx];
          const items=assumptions.filter(a=>aaFlag(a.evidence,a.weight)===flag);
          return(<div className={`aa-matrix-card ${cls}`} key={flag}><div className="aa-matrix-head"><div className="aa-matrix-dot"/><span className="aa-matrix-title">{label}</span></div>{items.length===0?<div className="aa-empty">None identified.</div>:items.map((a,i)=><div className="aa-matrix-item" key={i}>{a.text}</div>)}</div>);
        })}
      </div>

      <div className="aa-table">
        <div className="aa-table-hdr"><span className="aa-table-th">Assumption</span><span className="aa-table-th">Evidence</span><span className="aa-table-th">Weight</span><span className="aa-table-th">Status</span></div>
        {assumptions.map((a,i)=><div className="aa-table-row" key={i}><div className="aa-table-cell">{a.text}</div><div className="aa-table-val" style={{color:"var(--aa-blue)"}}>{a.evidence}/5</div><div className="aa-table-val" style={{color:"var(--aa-orange)"}}>{a.weight}/5</div><div className="aa-table-flag"><AAFlag flag={aaFlag(a.evidence,a.weight)}/></div></div>)}
      </div>

      <div className="aa-actions" style={{flexWrap:"wrap"}}>
        <button className="aa-btn aa-btn-ghost" onClick={reset}>↺ New Audit</button>
        <button className="aa-btn aa-btn-ghost" onClick={()=>setPhase(2)}>← Revise</button>
        <ExportMenu getPayload={()=>({
          kind:"assumption",
          toolLabel:"Decision Suite · Assumption Audit",
          title:"Assumption",
          titleEm:"Audit",
          subtitle:strategy||undefined,
          sections:[
            {heading:"Verdict",type:"text",body:genInsight()||"No assumptions logged."},
            {heading:"Summary",type:"kv",body:[
              {k:"Blind spots",v:String(blindSpots.length)},
              {k:"Caution",v:String(cautions.length)},
              {k:"Solid",v:String(solids.length)},
              {k:"Untested",v:String(untested.length)},
            ]},
            {heading:"Assumptions",type:"table",columns:["Assumption","Evidence","Weight","Status"],rows:assumptions.map(a=>[a.text,`${a.evidence}/5`,`${a.weight}/5`,aaFlag(a.evidence,a.weight)])},
          ],
        } as ExportPayload)}/>
      </div>
    </>)}

    {/* Navigation */}
    {phase<3&&<div className="aa-nav"><button className="aa-btn aa-btn-ghost" onClick={()=>setPhase(p=>p-1)} disabled={phase===0}>← Back</button><button className="aa-btn aa-btn-primary" onClick={()=>setPhase(p=>p+1)} disabled={!canNext()}>{phase===2?"Generate Audit →":"Continue →"}</button></div>}
  </div>);
}

// ─────────────────────────────────────────
// TOOL: PRE-MORTEM STUDIO
// ─────────────────────────────────────────
const PM_CSS=`
:root,.theme-dark{
  --pm-bg:#0f1117;--pm-card:#181c27;--pm-card2:#1e2333;--pm-border:#2a3050;--pm-border2:#353d5a;
  --pm-text:#e8eaf0;--pm-muted:#8a9ab8;--pm-muted2:#4a5a78;
  --pm-accent:#f59e0b;--pm-accent-dim:rgba(245,158,11,.1);
  --pm-red:#ef4444;--pm-red-dim:rgba(239,68,68,.1);
  --pm-orange:#fb923c;--pm-orange-dim:rgba(251,146,60,.1);
  --pm-green:#10b981;--pm-green-dim:rgba(16,185,129,.1);
  --pm-blue:#60a5fa;--pm-blue-dim:rgba(96,165,250,.1);
  --pm-purple:#a78bfa;--pm-purple-dim:rgba(167,139,250,.1);
}
.theme-light{
  --pm-bg:#f4f2ee;--pm-card:#ffffff;--pm-card2:#f8f6f2;--pm-border:#ddd8ce;--pm-border2:#c8c2b6;
  --pm-text:#1a1a2e;--pm-muted:#5a6070;--pm-muted2:#8a8e9a;
  --pm-accent:#d4870e;--pm-accent-dim:rgba(212,135,14,.08);
  --pm-red:#c0392b;--pm-red-dim:rgba(192,57,43,.08);
  --pm-orange:#d4730e;--pm-orange-dim:rgba(212,115,14,.08);
  --pm-green:#27ae60;--pm-green-dim:rgba(39,174,96,.08);
  --pm-blue:#2980b9;--pm-blue-dim:rgba(41,128,185,.08);
  --pm-purple:#7c3aed;--pm-purple-dim:rgba(124,58,237,.08);
}
.pm-app{min-height:100%;background:var(--pm-bg);font-family:'DM Sans',sans-serif;color:var(--pm-text);padding:40px 20px 80px;display:flex;flex-direction:column;align-items:center;}

/* Hero */
.pm-hero{text-align:center;margin-bottom:36px;position:relative;}
.pm-hero-top{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:16px;}
.pm-badge{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--pm-accent);background:var(--pm-accent-dim);border:1px solid rgba(245,158,11,.25);padding:4px 12px;border-radius:20px;}
.pm-suite-tag{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--pm-muted2);}
.pm-hero-title{font-family:'Syne',sans-serif;font-size:clamp(36px,6vw,60px);font-weight:800;line-height:.92;letter-spacing:-1px;color:var(--pm-text);}
.pm-hero-title em{font-family:'Newsreader',serif;font-style:italic;font-weight:400;color:var(--pm-accent);}
.pm-hero-desc{font-size:13px;color:var(--pm-muted);max-width:480px;margin:14px auto 0;line-height:1.7;font-weight:300;}

/* Stepper */
.pm-stepper{display:flex;align-items:flex-start;gap:0;margin-bottom:36px;width:100%;max-width:720px;justify-content:center;}
.pm-step{display:flex;align-items:center;gap:0;}
.pm-step-dot{width:34px;height:34px;border-radius:50%;border:2px solid var(--pm-border2);background:var(--pm-card);display:flex;align-items:center;justify-content:center;font-family:'Azeret Mono',monospace;font-size:11px;color:var(--pm-muted2);transition:all .3s;flex-shrink:0;}
.pm-step.active .pm-step-dot{border-color:var(--pm-accent);background:var(--pm-accent);color:#0e1117;font-weight:700;box-shadow:0 0 16px rgba(245,158,11,.3);}
.pm-step.done .pm-step-dot{border-color:var(--pm-muted2);background:var(--pm-muted2);color:var(--pm-bg);}
.pm-step-label{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--pm-muted2);margin-top:6px;text-align:center;display:block;width:34px;}
.pm-step.active .pm-step-label{color:var(--pm-accent);}
.pm-step.done .pm-step-label{color:var(--pm-muted);}
.pm-step-line{width:36px;height:2px;background:var(--pm-border);margin:0 4px;margin-bottom:20px;transition:background .3s;}
.pm-step.done .pm-step-line{background:var(--pm-muted2);}

/* Panel */
.pm-panel{width:100%;max-width:720px;background:var(--pm-card);border:1px solid var(--pm-border);border-radius:16px;padding:32px;margin-bottom:14px;animation:pmIn .35s ease;}
@keyframes pmIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.pm-panel-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:var(--pm-text);margin-bottom:6px;}
.pm-panel-desc{font-size:12px;color:var(--pm-muted);line-height:1.7;margin-bottom:24px;font-weight:300;}

/* Inputs */
.pm-label{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--pm-muted2);display:block;margin-bottom:9px;}
.pm-ta,.pm-in{width:100%;background:var(--pm-bg);border:1px solid var(--pm-border);border-radius:10px;padding:14px 16px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--pm-text);outline:none;transition:border-color .2s;resize:none;}
.pm-ta:focus,.pm-in:focus{border-color:var(--pm-accent);}
.pm-ta::placeholder,.pm-in::placeholder{color:var(--pm-muted2);font-style:italic;}

/* Context quote */
.pm-obit-ctx{background:var(--pm-accent-dim);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:14px 18px;margin-bottom:18px;font-family:'Azeret Mono',monospace;font-size:11px;color:var(--pm-accent);line-height:1.6;}

/* Categories */
.pm-cats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
.pm-cat{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;border:1px solid var(--pm-border);border-radius:20px;background:transparent;color:var(--pm-muted2);cursor:pointer;transition:all .15s;}
.pm-cat.sel{border-color:var(--pm-accent);background:var(--pm-accent-dim);color:var(--pm-accent);}
.pm-add-row{display:flex;gap:8px;margin-top:12px;}
.pm-add-row .pm-in{flex:1;}
.pm-hint{font-family:'Azeret Mono',monospace;font-size:10px;color:var(--pm-muted2);margin-top:8px;line-height:1.6;}

/* Failure cards */
.pm-fcard{background:var(--pm-bg);border:1px solid var(--pm-border);border-radius:12px;padding:16px 18px;margin-bottom:8px;animation:pmSlide .2s ease;transition:border-left-color .3s;border-left:3px solid var(--pm-border2);}
@keyframes pmSlide{from{opacity:0;transform:translateX(-6px);}to{opacity:1;transform:translateX(0);}}
.pm-fcard.cat-execution{border-left-color:var(--pm-red);}.pm-fcard.cat-market{border-left-color:var(--pm-orange);}.pm-fcard.cat-resource{border-left-color:var(--pm-accent);}.pm-fcard.cat-people{border-left-color:var(--pm-blue);}.pm-fcard.cat-timing{border-left-color:var(--pm-purple);}.pm-fcard.cat-external{border-left-color:var(--pm-green);}
.pm-fh{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}
.pm-ft{font-size:13px;color:var(--pm-text);line-height:1.5;flex:1;}
.pm-cbadge{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:3px 9px;border:1px solid;white-space:nowrap;flex-shrink:0;border-radius:10px;}
.cb-execution{color:var(--pm-red);border-color:rgba(239,68,68,.3);background:var(--pm-red-dim);}
.cb-market{color:var(--pm-orange);border-color:rgba(251,146,60,.3);background:var(--pm-orange-dim);}
.cb-resource{color:var(--pm-accent);border-color:rgba(245,158,11,.3);background:var(--pm-accent-dim);}
.cb-people{color:var(--pm-blue);border-color:rgba(96,165,250,.3);background:var(--pm-blue-dim);}
.cb-timing{color:var(--pm-purple);border-color:rgba(167,139,250,.3);background:var(--pm-purple-dim);}
.cb-external{color:var(--pm-green);border-color:rgba(16,185,129,.3);background:var(--pm-green-dim);}

/* Rating */
.pm-rrow{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.pm-rh{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
.pm-rn{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--pm-muted2);}
.pm-rv{font-family:'Azeret Mono',monospace;font-size:10px;font-weight:700;}
.pm-rt{display:flex;gap:3px;}
.pm-rp{flex:1;height:6px;background:var(--pm-border);border-radius:3px;cursor:pointer;transition:background .15s;}
.pm-rp.prob-f{background:var(--pm-orange);}.pm-rp.impact-f{background:var(--pm-red);}
.pm-del{background:none;border:none;color:var(--pm-muted2);cursor:pointer;font-size:17px;line-height:1;padding:2px 5px;transition:color .15s;}
.pm-del:hover{color:var(--pm-red);}
.pm-risk-lbl{font-family:'Azeret Mono',monospace;font-size:11px;font-weight:700;}

/* Alert & Shield */
.pm-alert{background:var(--pm-accent-dim);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:14px 18px;margin-bottom:16px;font-family:'Azeret Mono',monospace;font-size:10px;color:var(--pm-accent);line-height:1.6;}
.pm-sc{background:var(--pm-bg);border:1px solid var(--pm-border);border-radius:12px;padding:18px;margin-bottom:8px;}
.pm-sct{font-size:12px;color:var(--pm-muted);margin-bottom:10px;display:flex;align-items:flex-start;gap:8px;line-height:1.5;}
.pm-sarr{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--pm-red);flex-shrink:0;margin-top:2px;}
.pm-sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}

/* Navigation */
.pm-nav{width:100%;max-width:720px;display:flex;justify-content:space-between;align-items:center;margin-top:10px;}
.pm-btn{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:11px 22px;border:1px solid var(--pm-accent);background:var(--pm-accent);color:#0e1117;cursor:pointer;transition:all .2s;border-radius:10px;font-weight:600;}
.pm-btn:hover{background:var(--pm-text);border-color:var(--pm-text);color:var(--pm-bg);}
.pm-btn:disabled{opacity:.3;cursor:not-allowed;}
.pm-btn:disabled:hover{background:var(--pm-accent);color:#0e1117;border-color:var(--pm-accent);}
.pm-btn-g{background:transparent;color:var(--pm-muted);border-color:var(--pm-border);}
.pm-btn-g:hover{background:var(--pm-card);color:var(--pm-text);border-color:var(--pm-border2);}

/* ─── RESULTS ─── */
.pm-results-hero{text-align:center;margin-bottom:24px;width:100%;max-width:720px;}
.pm-results-headline{font-family:'Syne',sans-serif;font-size:clamp(28px,5vw,44px);font-weight:800;line-height:1;color:var(--pm-text);margin-bottom:8px;}
.pm-results-sub{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--pm-muted2);margin-bottom:8px;}
.pm-results-strategy{font-size:12px;color:var(--pm-muted2);border-left:2px solid var(--pm-border2);padding-left:12px;margin-top:12px;line-height:1.6;text-align:left;display:inline-block;}

/* Stats Grid */
.pm-stats-grid{width:100%;max-width:720px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px;}
.pm-stat-card{background:var(--pm-card);border:1px solid var(--pm-border);border-radius:12px;padding:20px;text-align:center;transition:transform .2s;}
.pm-stat-card:hover{transform:translateY(-2px);}
.pm-stat-num{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;line-height:1;margin-bottom:6px;}
.pm-stat-label{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--pm-muted2);}

/* Verdict */
.pm-insight{width:100%;max-width:720px;border-radius:12px;border-left:4px solid var(--pm-accent);background:var(--pm-accent-dim);padding:20px 24px;margin-bottom:24px;}
.pm-insight-tag{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--pm-accent);margin-bottom:8px;}
.pm-insight-text{font-size:13px;color:var(--pm-muted);line-height:1.7;}

/* Results Table */
.pm-table{width:100%;max-width:720px;background:var(--pm-card);border:1px solid var(--pm-border);border-radius:12px;overflow:hidden;margin-bottom:24px;}
.pm-table-hdr{padding:14px 24px;border-bottom:1px solid var(--pm-border);display:grid;grid-template-columns:1fr 80px 60px 60px 100px;gap:10px;background:var(--pm-card2);}
.pm-table-th{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--pm-muted2);text-align:center;}
.pm-table-th:first-child{text-align:left;}
.pm-table-row{padding:14px 24px;border-bottom:1px solid var(--pm-border);display:grid;grid-template-columns:1fr 80px 60px 60px 100px;gap:10px;align-items:center;transition:background .15s;}
.pm-table-row:last-child{border-bottom:none;}
.pm-table-row:hover{background:var(--pm-card2);}
.pm-table-cell{font-size:12px;color:var(--pm-text);line-height:1.4;}
.pm-table-val{font-family:'Azeret Mono',monospace;font-size:11px;font-weight:700;text-align:center;}
.pm-bw{display:flex;align-items:center;gap:5px;}
.pm-bt{flex:1;height:4px;background:var(--pm-border);border-radius:2px;overflow:hidden;}
.pm-bf{height:100%;border-radius:2px;transition:width .8s ease;}

/* Shield Protocol */
.pm-shield{width:100%;max-width:720px;background:var(--pm-card);border:1px solid var(--pm-border);border-radius:12px;overflow:hidden;margin-bottom:24px;}
.pm-shield-h{padding:14px 24px;border-bottom:1px solid var(--pm-border);font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--pm-muted2);background:var(--pm-card2);}
.pm-shield-r{padding:16px 24px;border-bottom:1px solid var(--pm-border);transition:background .15s;}
.pm-shield-r:last-child{border-bottom:none;}.pm-shield-r:hover{background:var(--pm-card2);}
.pm-srt{font-size:11px;color:var(--pm-muted2);margin-bottom:6px;font-style:italic;}
.pm-srm{font-size:12px;color:var(--pm-text);line-height:1.5;margin-bottom:5px;}
.pm-srs{font-family:'Azeret Mono',monospace;font-size:10px;color:var(--pm-green);display:flex;align-items:flex-start;gap:5px;}

/* Actions */
.pm-actions{display:flex;gap:10px;justify-content:center;margin-top:16px;}

.pm-sc-c{color:var(--pm-red);}.pm-sc-h{color:var(--pm-orange);}.pm-sc-m{color:var(--pm-accent);}.pm-sc-l{color:var(--pm-muted2);}

@media(max-width:600px){
  .pm-stats-grid{grid-template-columns:1fr 1fr;}
  .pm-table-hdr,.pm-table-row{grid-template-columns:1fr 60px 40px 40px 80px;padding:10px 14px;}
  .pm-rrow{grid-template-columns:1fr;}
  .pm-sgrid{grid-template-columns:1fr;}
}
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
  const { user, sub, startCheckout } = useAuth();
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
  const [aiLoading,setAiLoading]=useState(false);
  const [aiUsage,setAiUsage]=useState<{count:number;limit:number;isPro:boolean}|null>(null);

  const aiAutofill=async()=>{
    if(!user){toast({title:"Sign in to use AI",description:"AI auto-fill requires an account."});return;}
    if(mission.trim().length<5){toast({title:"Mission too short",description:"Add a mission first (stage 1)."});return;}
    setAiLoading(true);
    try{
      const{data,error}=await invokeAi<{failures:Array<{text:string;cat:string;prob:number;impact:number}>}>("premortem-failures",{mission:mission.trim(),timeframe,obituary:obituary.trim()||undefined});
      if(error){
        if(error.code==="free_limit_reached"){
          toast({title:"Free AI runs used up",description:`You've used your ${error.limit||3} free AI runs this month. Upgrade to Pro for unlimited.`});
          return;
        }
        throw new Error(error.message);
      }
      const generated=data?.failures||[];
      if(generated.length===0){toast({title:"No failure modes returned",description:"Try again or refine your mission."});return;}
      if(data?.usage)setAiUsage(data.usage);
      const ts=Date.now();
      const next:PMFailure[]=generated.map((g,i)=>({id:`ai-${ts}-${i}`,text:g.text,cat:g.cat,prob:g.prob,impact:g.impact}));
      setFailures(prev=>[...prev,...next]);
      const remaining=data?.usage && !data.usage.isPro ? ` (${Math.max(0,data.usage.limit-data.usage.count)} free runs left this month)` : "";
      toast({title:`Added ${next.length} AI failure modes`,description:`Review, edit, or rate them in the next step.${remaining}`});
    }catch(e:any){
      toast({title:"AI auto-fill failed",description:e?.message||"Try again."});
    }finally{setAiLoading(false);}
  };


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

    {/* Hero */}
    <div className="pm-hero">
      <div className="pm-hero-top"><span className="pm-badge">Pre-Mortem</span><span className="pm-suite-tag">Decision Suite · Risk Analysis</span></div>
      <div className="pm-hero-title">Pre-<em>Mortem</em><br/>Studio</div>
      <div className="pm-hero-desc">Imagine the project has already failed. Work backwards to find what killed it — before it happens.</div>
    </div>

    {/* Stepper */}
    <div className="pm-stepper">
      {STAGES.map((s,i)=>(
        <div key={s} className={`pm-step${stage===i?" active":stage>i?" done":""}`}>
          <div className="pm-step-dot">{stage>i?"✓":i+1}</div>
          <span className="pm-step-label">{s}</span>
          {i<STAGES.length-1&&<div className="pm-step-line"/>}
        </div>
      ))}
    </div>

    {/* Stage 0: Mission */}
    {stage===0&&(<div className="pm-panel">
      <div className="pm-panel-title">Define the mission</div>
      <div className="pm-panel-desc">What project, initiative, or decision are we stress-testing?</div>
      <label className="pm-label">Mission statement</label>
      <textarea className="pm-ta" rows={3} placeholder='"Launch the B2B SaaS product by Q3"' value={mission} onChange={e=>setMission(e.target.value)}/>
      <div style={{marginTop:14}}><label className="pm-label">Timeframe</label>
      <input className="pm-in" type="text" placeholder="12 months" value={timeframe} onChange={e=>setTimeframe(e.target.value)}/></div>
    </div>)}

    {/* Stage 1: Obituary */}
    {stage===1&&(<div className="pm-panel">
      <div className="pm-panel-title">Write the obituary</div>
      <div className="pm-panel-desc">It's {timeframe} from now. The project failed spectacularly. Write what happened.</div>
      <div className="pm-obit-ctx">Mission: "{mission}" — Timeframe: {timeframe}</div>
      <label className="pm-label">The obituary</label>
      <textarea className="pm-ta" rows={6} placeholder="Describe the failure in detail. What went wrong? Who was affected? What was the final straw?" value={obituary} onChange={e=>setObituary(e.target.value)}/>
    </div>)}

    {/* Stage 2: Failure Modes */}
    {stage===2&&(<div className="pm-panel">
      <div className="pm-panel-title">Extract the failure modes</div>
      <div className="pm-panel-desc">From your obituary, list the specific things that went wrong.</div>
      <div className="pm-cats">{PM_CATS.map(c=><button key={c.id} className={`pm-cat${selCat===c.id?" sel":""}`} onClick={()=>setSelCat(c.id)}>{c.l}</button>)}</div>
      <div className="pm-add-row"><input className="pm-in" type="text" placeholder="Describe a specific failure mode…" value={fInp} onChange={e=>setFInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addF()}/><button className="pm-btn" onClick={addF}>Add</button></div>
      <div style={{marginTop:10,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <button className="pm-btn" onClick={aiAutofill} disabled={aiLoading} style={{background:"var(--gold)",color:"#1a1408"}}>{aiLoading?"✨ Generating…":"✨ AI auto-fill failure modes"}</button>
        <span className="pm-hint" style={{margin:0}}>
          {sub.subscribed
            ? <>Pro · unlimited AI runs · ~10s</>
            : aiUsage
              ? <>{Math.max(0,aiUsage.limit-aiUsage.count)} of {aiUsage.limit} free AI runs left this month · <button onClick={startCheckout} style={{background:"none",border:"none",color:"var(--gold)",cursor:"pointer",padding:0,font:"inherit",textDecoration:"underline"}}>Upgrade to Pro</button></>
              : <>Free: 3 AI runs/month · <button onClick={startCheckout} style={{background:"none",border:"none",color:"var(--gold)",cursor:"pointer",padding:0,font:"inherit",textDecoration:"underline"}}>Upgrade to Pro</button> for unlimited</>}
        </span>
      </div>
      <div className="pm-hint">Categorize each failure · Press Enter to add</div>

      <div style={{marginTop:18}}>{failures.map(f=><div className={`pm-fcard cat-${f.cat}`} key={f.id}><div className="pm-fh"><div className="pm-ft">{f.text}</div><span className={`pm-cbadge cb-${f.cat}`}>{PM_CATS.find(c=>c.id===f.cat)?.l}</span><button className="pm-del" onClick={()=>remF(f.id)}>×</button></div></div>)}</div>
    </div>)}

    {/* Stage 3: Rating */}
    {stage===3&&(<div className="pm-panel">
      <div className="pm-panel-title">Rate each failure</div>
      <div className="pm-panel-desc">Set probability and impact for each failure mode.</div>
      {failures.map(f=>{const score=pmRiskScore(f.prob,f.impact);const{l,cls}=pmRiskLabel(score);
        return(<div className={`pm-fcard cat-${f.cat}`} key={f.id}>
          <div className="pm-fh"><div className="pm-ft">{f.text}</div><span className={`pm-cbadge cb-${f.cat}`}>{PM_CATS.find(c=>c.id===f.cat)?.l}</span></div>
          <div className="pm-rrow">
            <div><div className="pm-rh"><span className="pm-rn">Probability</span><span className="pm-rv" style={{color:"var(--pm-orange)"}}>{PM_PROB[f.prob-1]}</span></div><div className="pm-rt">{[1,2,3,4,5].map(j=><div key={j} className={`pm-rp${f.prob>=j?" prob-f":""}`} onClick={()=>updF(f.id,"prob",j)}/>)}</div></div>
            <div><div className="pm-rh"><span className="pm-rn">Impact</span><span className="pm-rv" style={{color:"var(--pm-red)"}}>{PM_IMP[f.impact-1]}</span></div><div className="pm-rt">{[1,2,3,4,5].map(j=><div key={j} className={`pm-rp${f.impact>=j?" impact-f":""}`} onClick={()=>updF(f.id,"impact",j)}/>)}</div></div>
          </div>
          <div style={{marginTop:10,display:"flex",justifyContent:"flex-end"}}><span className={`pm-risk-lbl ${cls}`}>Risk: {l} ({score})</span></div>
        </div>);
      })}
    </div>)}

    {/* Stage 4: Shield */}
    {stage===4&&(<div className="pm-panel">
      <div className="pm-panel-title">Build your defenses</div>
      <div className="pm-panel-desc">For each critical/high-risk failure: define a mitigation and an early warning signal.</div>
      {priority.length===0&&<div className="pm-alert">No critical or high-risk failures identified. Proceed to brief.</div>}
      {priority.map(f=>{
        const score=pmRiskScore(f.prob,f.impact);const{l}=pmRiskLabel(score);const sh=getS(f.id);
        return(<div className="pm-sc" key={f.id}>
          <div className="pm-sct"><span className="pm-sarr">▸ {l}</span>{f.text}<span className={`pm-cbadge cb-${f.cat}`}>{PM_CATS.find(c=>c.id===f.cat)?.l}</span></div>
          <div className="pm-sgrid">
            <div><label className="pm-label">Mitigation plan</label><textarea className="pm-ta" rows={3} placeholder="What specific action reduces this risk?" value={sh.mitigation} onChange={e=>updS(f.id,"mitigation",e.target.value)}/></div>
            <div><label className="pm-label">Early warning signal</label><textarea className="pm-ta" rows={3} placeholder="What leading indicator tells you this is about to happen?" value={sh.signal} onChange={e=>updS(f.id,"signal",e.target.value)}/></div>
          </div>
        </div>);
      })}
    </div>)}

    {/* Stage 5: Results */}
    {stage===5&&(<>
      <div className="pm-results-hero">
        <div className="pm-results-headline">{critical.length===0?"Low Risk Profile":critical.length<=2?"Manageable Risk":"High Exposure"}</div>
        <div className="pm-results-sub">Pre-Mortem complete · {failures.length} failure modes analyzed</div>
        <div className="pm-results-strategy">"{mission}"</div>
      </div>

      <div className="pm-stats-grid">
        <div className="pm-stat-card"><div className="pm-stat-num" style={{color:"var(--pm-red)"}}>{critical.length}</div><div className="pm-stat-label">Critical</div></div>
        <div className="pm-stat-card"><div className="pm-stat-num" style={{color:"var(--pm-orange)"}}>{high.length}</div><div className="pm-stat-label">High Risk</div></div>
        <div className="pm-stat-card"><div className="pm-stat-num" style={{color:"var(--pm-muted)"}}>{failures.length-critical.length-high.length}</div><div className="pm-stat-label">Manageable</div></div>
        <div className="pm-stat-card"><div className="pm-stat-num" style={{color:"var(--pm-green)"}}>{priority.length}</div><div className="pm-stat-label">Shielded</div></div>
      </div>

      <div className="pm-insight"><div className="pm-insight-tag">▸ Analysis Verdict</div><div className="pm-insight-text">{verdict()}</div></div>

      <div className="pm-table">
        <div className="pm-table-hdr"><span className="pm-table-th">Failure Mode</span><span className="pm-table-th">Category</span><span className="pm-table-th">Prob</span><span className="pm-table-th">Impact</span><span className="pm-table-th">Risk Level</span></div>
        {sorted.map(f=>{const score=pmRiskScore(f.prob,f.impact);const{l,cls}=pmRiskLabel(score);const barColor=cls==="pm-sc-c"?"var(--pm-red)":cls==="pm-sc-h"?"var(--pm-orange)":cls==="pm-sc-m"?"var(--pm-accent)":"var(--pm-muted2)";
          return(<div className="pm-table-row" key={f.id}><div className="pm-table-cell">{f.text}</div><div style={{textAlign:"center"}}><span className={`pm-cbadge cb-${f.cat}`}>{PM_CATS.find(c=>c.id===f.cat)?.l}</span></div><div className="pm-table-val" style={{color:"var(--pm-orange)"}}>{f.prob}/5</div><div className="pm-table-val" style={{color:"var(--pm-red)"}}>{f.impact}/5</div><div className="pm-bw"><div className="pm-bt"><div className="pm-bf" style={{width:`${barW[f.id]??0}%`,background:barColor}}/></div><span className={`pm-table-val ${cls}`} style={{fontSize:9,minWidth:52}}>{l}</span></div></div>);
        })}
      </div>

      {priority.length>0&&<div className="pm-shield"><div className="pm-shield-h">Shield Protocol — Mitigation Registry</div>{priority.map(f=>{const sh=getS(f.id);if(!sh.mitigation&&!sh.signal)return null;return(<div className="pm-shield-r" key={f.id}><div className="pm-srt">▸ {f.text}</div>{sh.mitigation&&<div className="pm-srm"><strong style={{color:"var(--pm-accent)",fontFamily:"'Azeret Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase" as const}}>Mitigation — </strong>{sh.mitigation}</div>}{sh.signal&&<div className="pm-srs"><span style={{color:"var(--pm-muted2)"}}>SIGNAL //</span>{sh.signal}</div>}</div>);})}</div>}

      <div className="pm-actions" style={{flexWrap:"wrap"}}>
        <button className="pm-btn pm-btn-g" onClick={reset}>↺ New Pre-Mortem</button>
        <button className="pm-btn pm-btn-g" onClick={()=>setStage(4)}>← Revise Shield</button>
        <ExportMenu getPayload={()=>({
          kind:"premortem",
          toolLabel:"Decision Suite · Pre-Mortem Studio",
          title:"Pre-Mortem",
          titleEm:"Brief",
          subtitle:mission||undefined,
          sections:[
            {heading:"Verdict",type:"text",body:verdict()||""},
            {heading:"Mission & timeframe",type:"kv",body:[{k:"Mission",v:mission||"—"},{k:"Timeframe",v:timeframe||"—"}]},
            ...(obituary?[{heading:"Obituary",type:"text" as const,body:obituary}]:[]),
            {heading:"Failure modes (by risk)",type:"table",columns:["Failure mode","Category","Prob","Impact","Risk"],rows:sorted.map(f=>{const sc=pmRiskScore(f.prob,f.impact);return [f.text,PM_CATS.find(c=>c.id===f.cat)?.l||f.cat,`${f.prob}/5`,`${f.impact}/5`,pmRiskLabel(sc).l];})},
            {heading:"Mitigations & signals",type:"kv",body:priority.flatMap(f=>{const sh=getS(f.id);const out:{k:string;v:string}[]=[];if(sh.mitigation)out.push({k:`Mitigation — ${f.text}`,v:sh.mitigation});if(sh.signal)out.push({k:`Signal — ${f.text}`,v:sh.signal});return out;})},
          ],
        } as ExportPayload)}/>
      </div>
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
/* Stakes Mode */
.cl-stakes-mode{margin-top:14px;border:1px solid #e2dcd0;background:#fff;padding:16px 18px;animation:clFade .3s ease;}
.cl-stakes-toggle{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#6b8c72;cursor:pointer;background:none;border:1px dashed #e2dcd0;padding:6px 14px;transition:all .15s;width:100%;text-align:center;margin-top:8px;}
.cl-stakes-toggle:hover{border-color:#1a3a2a;color:#1a3a2a;}
.cl-stakes-toggle.active{background:#1a3a2a;border-style:solid;border-color:#1a3a2a;color:#fff;}
.cl-sm-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#1a3a2a;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.cl-sm-title::after{content:'';flex:1;height:1px;background:rgba(28,43,30,.1);}
.cl-sm-option{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1px solid #e2dcd0;background:#f6f1e7;margin-bottom:6px;cursor:pointer;transition:all .15s;}
.cl-sm-option:hover{border-color:#6b8c72;}
.cl-sm-option.active{border-color:#1a3a2a;background:#e8f5ec;border-left:3px solid #1a3a2a;}
.cl-sm-check{width:16px;height:16px;border:1.5px solid #9ab89f;border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px;transition:all .15s;}
.cl-sm-option.active .cl-sm-check{background:#1a3a2a;border-color:#1a3a2a;color:#fff;}
.cl-sm-info{flex:1;}
.cl-sm-name{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#1c2b1e;margin-bottom:2px;}
.cl-sm-desc{font-family:'DM Sans',sans-serif;font-size:11px;color:#6b8c72;font-style:italic;line-height:1.5;}
.cl-sm-field{margin-top:6px;}
.cl-sm-field input{width:100%;background:#fff;border:1px solid #e2dcd0;padding:5px 8px;font-family:'DM Sans',sans-serif;font-size:12px;color:#1c2b1e;outline:none;}
.cl-sm-field input:focus{border-color:#1a3a2a;}
.cl-sm-field input::placeholder{color:#9ab89f;font-style:italic;}
/* Stake badges on entries */
.cl-stake-badges{display:flex;gap:4px;margin-top:4px;}
.cl-sbadge{font-family:'Azeret Mono',monospace;font-size:7px;letter-spacing:1px;text-transform:uppercase;padding:2px 6px;border-radius:2px;font-weight:600;}
.cl-sbadge.social{background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;}
.cl-sbadge.financial{background:#fef3c7;color:#92400e;border:1px solid #fde68a;}
.cl-sbadge.reputation{background:#ede9fe;color:#6d28d9;border:1px solid #ddd6fe;}
/* Streak */
.cl-streak{display:flex;align-items:center;gap:8px;padding:12px 18px;background:#fff;border:1px solid #e2dcd0;border-left:4px solid #c9a84c;margin-bottom:18px;}
.cl-streak-fire{font-size:18px;}
.cl-streak-info{flex:1;}
.cl-streak-n{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#1a3a2a;}
.cl-streak-l{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#6b8c72;}
.cl-streak-dots{display:flex;gap:3px;}
.cl-streak-dot{width:8px;height:8px;border-radius:50%;background:#e2dcd0;border:1px solid rgba(28,43,30,.1);}
.cl-streak-dot.active{background:#52b788;border-color:#52b788;}
.cl-streak-dot.broken{background:#c0392b;border-color:#c0392b;}
`;
const CL_CATS=["Self","Work","Health","Finance","Relationship","Learning","Other"];
const CL_STAKES=["Trivial","Minor","Moderate","Important","Critical"];
function clToday(){return new Date().toISOString().split("T")[0];}
function clDaysUntil(d:string){if(!d)return null;return Math.ceil((new Date(d).getTime()-new Date(clToday()).getTime())/(1000*60*60*24));}
function clFmtDate(d:string){if(!d)return"No deadline";return new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function clIntVerdict(p:number|null){if(p===null)return"No completed commitments yet.";if(p>=90)return"Exceptional follow-through. Your word is your bond.";if(p>=75)return"Strong integrity. Minor gaps worth investigating.";if(p>=60)return"Moderate follow-through. Patterns of over-commitment emerging.";if(p>=40)return"Significant gap between intention and execution. Review your commitment cadence.";return"Critical gap. You are over-committing or under-delivering.";}

interface CLStakeMode {
  social?: { enabled: boolean; friendName?: string; shared?: boolean };
  financial?: { enabled: boolean; amount?: number; penalty?: string };
  reputation?: { enabled: boolean };
}
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
  stakeMode?: CLStakeMode;
}

function CommitmentLedger(){
  const [tab,setTab]=useState("ledger");
  const [entries,setEntries]=useState<CLEntry[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const { sub, startCheckout } = useAuth();
  const isPro = sub.subscribed;
  const [barW,setBarW]=useState<Record<string,number>>({});
  const [text,setText]=useState("");
  const [cat,setCat]=useState("Work");
  const [deadline,setDeadline]=useState("");
  const [stakes,setStakes]=useState(3);
  const [madeWith,setMadeWith]=useState("Myself");
  const [stakeMode,setStakeMode]=useState<CLStakeMode>({});
  const [showStakes,setShowStakes]=useState(false);

  useEffect(()=>{
    const r=storage.get("commitment-ledger-entries");
    if(r&&r.value)setEntries(JSON.parse(r.value));
    setLoading(false);
  },[]);
  useEffect(()=>{if(loading)return;storage.set("commitment-ledger-entries",JSON.stringify(entries));},[entries,loading]);
  useEffect(()=>{
    if(tab==="patterns"){setTimeout(()=>{const w:Record<string,number>={};CL_CATS.forEach(c=>{const ces=entries.filter(e=>e.cat===c&&e.status!=="pending");w[c]=ces.length>0?Math.round((ces.filter(e=>e.status==="kept").length/ces.length)*100):0;});setBarW(w);},100);}
  },[tab,entries]);

  const atCap = !isPro && entries.length >= FREE_LIMIT;
  const addEntry=()=>{
    if(!text.trim())return;
    if(atCap){toast({title:"Free plan limit reached",description:`Upgrade to Pro for unlimited commitments (Free is capped at ${FREE_LIMIT}).`});return;}
    const hasStake=stakeMode.social?.enabled||stakeMode.financial?.enabled||stakeMode.reputation?.enabled;
    setEntries([{id:Date.now().toString(),text:text.trim(),cat,deadline,stakes,madeWith:madeWith.trim()||"Myself",status:"pending",createdAt:clToday(),stakeMode:hasStake?stakeMode:undefined},...entries]);
    setText("");setDeadline("");setStakes(3);setCat("Work");setMadeWith("Myself");setStakeMode({});setShowStakes(false);setShowForm(false);
  };
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

  // Streak calculation — consecutive kept commitments (by resolvedAt date, most recent first)
  const calcStreak=()=>{const sorted=[...entries].filter(e=>e.status==="kept"||e.status==="broken").sort((a,b)=>(b.resolvedAt||"").localeCompare(a.resolvedAt||""));let streak=0;for(const e of sorted){if(e.status==="kept")streak++;else break;}return streak;};
  const currentStreak=calcStreak();
  const recentHistory=[...entries].filter(e=>e.status==="kept"||e.status==="broken").sort((a,b)=>(b.resolvedAt||"").localeCompare(a.resolvedAt||"")).slice(0,10);

  const ClEntry=({entry}:{entry:CLEntry})=>{
    const days=entry.deadline?clDaysUntil(entry.deadline):null;
    const isOverdue=days!==null&&days<0&&entry.status==="pending";
    const isDueSoon=days!==null&&days>=0&&days<=3&&entry.status==="pending";
    const sm=entry.stakeMode;
    const hasStakes=sm&&(sm.social?.enabled||sm.financial?.enabled||sm.reputation?.enabled);
    return(<div className={`cl-entry ${entry.status} ${isOverdue?"overdue":""}`}>
      <div><div className="cl-et">{entry.text}</div>
        <div className="cl-emeta">
          <span className="cl-ebadge">{entry.cat}</span>
          <div className="cl-sdots">{[1,2,3,4,5].map(i=><div key={i} className={`cl-sd${entry.stakes>=i?" f":""}`}/>)}</div>
          {entry.deadline&&<span className={`cl-edate${isOverdue?" overdue":isDueSoon?" due-soon":""}`}>{isOverdue?`${Math.abs(days!)}d overdue`:days===0?"Due today":days!==null&&days<=3?`${days}d left`:clFmtDate(entry.deadline)}</span>}
          {entry.madeWith&&entry.madeWith!=="Myself"&&<span className="cl-edate">with {entry.madeWith}</span>}
        </div>
        {hasStakes&&<div className="cl-stake-badges">
          {sm.social?.enabled&&<span className="cl-sbadge social">👥 Social{sm.social.friendName?` · ${sm.social.friendName}`:""}</span>}
          {sm.financial?.enabled&&<span className="cl-sbadge financial">💰 Financial{sm.financial.amount?` · $${sm.financial.amount}`:""}{sm.financial.penalty?` → ${sm.financial.penalty}`:""}</span>}
          {sm.reputation?.enabled&&<span className="cl-sbadge reputation">🏆 Reputation</span>}
        </div>}
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
    {(currentStreak>0||recentHistory.length>0)&&<div className="cl-streak">
      <div className="cl-streak-fire">{currentStreak>=5?"🔥":currentStreak>=3?"✨":"🏆"}</div>
      <div className="cl-streak-info"><div className="cl-streak-n">{currentStreak} commitment{currentStreak!==1?"s":""} kept in a row</div><div className="cl-streak-l">Current streak</div></div>
      <div className="cl-streak-dots">{recentHistory.slice(0,10).map((e,i)=><div key={i} className={`cl-streak-dot ${e.status==="kept"?"active":"broken"}`} title={`${e.text} — ${e.status}`}/>)}</div>
    </div>}
    <div className="cl-tabs">{["ledger","patterns"].map(t=><button key={t} className={`cl-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="ledger"?"Active Ledger":"Patterns & Insights"}</button>)}</div>
    <div className="cl-content">
      {tab==="ledger"&&(<>
        <div className="cl-top-row" style={{flexWrap:"wrap",gap:8}}>
          <span className="cl-pending-info">{pending.length} pending · {dueSoon.length} due within 3 days</span>
          <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
            <ExportMenu disabled={total===0} getPayload={()=>({
              kind:"ledger",
              toolLabel:"Decision Suite · Commitment Ledger",
              title:"Commitment",
              titleEm:"Ledger",
              subtitle:`${total} commitments · integrity ${intPct!==null?intPct+"%":"—"}`,
              sections:[
                {heading:"Integrity stats",type:"kv",body:[
                  {k:"Total",v:String(total)},
                  {k:"Kept",v:String(kept.length)},
                  {k:"Broken",v:String(broken.length)},
                  {k:"Pending",v:String(pending.length)},
                  {k:"Overdue",v:String(overdue.length)},
                  {k:"Word integrity",v:intPct!==null?`${intPct}%`:"—"},
                ]},
                {heading:"All commitments",type:"table",columns:["Commitment","Category","Deadline","Stakes","Status"],rows:entries.map(e=>[e.text,e.cat||"—",e.deadline||"—",String(e.stakes??"—"),e.status])},
              ],
            } as ExportPayload)}/>
            <button className="cl-btn cl-btn-sm" onClick={()=>{ if(atCap){ toast({title:"Free plan limit reached",description:`Upgrade to Pro for unlimited commitments (Free is capped at ${FREE_LIMIT}).`}); return; } setShowForm(!showForm); }}>{showForm?"— Cancel":"+ Enter Commitment"}</button>
          </div>
        </div>
        {atCap&&<div style={{margin:"0 0 14px",padding:"10px 14px",background:"var(--gold-d)",border:"1px solid var(--gold)",borderRadius:8,fontSize:12,color:"var(--text)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,fontFamily:"'DM Sans',sans-serif"}}>
          <span><strong style={{color:"var(--gold)"}}>Free limit reached ({FREE_LIMIT}/{FREE_LIMIT}).</strong> Upgrade to Pro for unlimited commitments + cloud sync across devices.</span>
          <button onClick={startCheckout} style={{background:"var(--gold)",color:"#1a1408",border:"none",borderRadius:6,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'Azeret Mono',monospace"}}>Upgrade</button>
        </div>}
        {showForm&&<div className="cl-form"><div className="cl-ft">New Ledger Entry</div>
          <div className="cl-form-row"><label className="cl-fl">Commitment</label><textarea className="cl-ta" rows={2} placeholder='State it precisely. "I will finish the investor memo by Friday"' value={text} onChange={e=>setText(e.target.value)}/></div>
          <div className="cl-form-grid"><div><label className="cl-fl">Deadline</label><input className="cl-in" type="date" value={deadline} min={clToday()} onChange={e=>setDeadline(e.target.value)}/></div><div><label className="cl-fl">Made with</label><input className="cl-in" type="text" placeholder="Myself, team, client…" value={madeWith} onChange={e=>setMadeWith(e.target.value)}/></div></div>
          <div className="cl-form-row"><label className="cl-fl">Category</label><div className="cl-cats">{CL_CATS.map(c=><button key={c} className={`cl-cat${cat===c?" active":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div></div>
          <div className="cl-form-row"><label className="cl-fl">Stakes — {CL_STAKES[stakes-1]}</label><div className="cl-stakes-row"><div className="cl-strack">{[1,2,3,4,5].map(i=><div key={i} className={`cl-sp${stakes>=i?" f":""}`} onClick={()=>setStakes(i)}/>)}</div><span className="cl-slbl-txt">{CL_STAKES[stakes-1]}</span></div></div>
          <button className={`cl-stakes-toggle${showStakes?" active":""}`} onClick={()=>setShowStakes(!showStakes)}>{showStakes?"▾ Hide Stakes Mode":"▸ Add Stakes Mode — Behavioral Lock-In"}</button>
          {showStakes&&<div className="cl-stakes-mode">
            <div className="cl-sm-title">Stakes Mode</div>
            <div className={`cl-sm-option${stakeMode.social?.enabled?" active":""}`} onClick={()=>setStakeMode({...stakeMode,social:{...stakeMode.social,enabled:!stakeMode.social?.enabled}})}>
              <div className="cl-sm-check">{stakeMode.social?.enabled&&"✓"}</div>
              <div className="cl-sm-info">
                <div className="cl-sm-name">👥 Social Stake</div>
                <div className="cl-sm-desc">Share this commitment with a friend — adding external accountability</div>
                {stakeMode.social?.enabled&&<div className="cl-sm-field"><input type="text" placeholder="Friend's name (optional)" value={stakeMode.social?.friendName||""} onChange={e=>{e.stopPropagation();setStakeMode({...stakeMode,social:{...stakeMode.social,enabled:true,friendName:e.target.value}})}} onClick={e=>e.stopPropagation()}/></div>}
              </div>
            </div>
            <div className={`cl-sm-option${stakeMode.financial?.enabled?" active":""}`} onClick={()=>setStakeMode({...stakeMode,financial:{...stakeMode.financial,enabled:!stakeMode.financial?.enabled}})}>
              <div className="cl-sm-check">{stakeMode.financial?.enabled&&"✓"}</div>
              <div className="cl-sm-info">
                <div className="cl-sm-name">💰 Financial Stake</div>
                <div className="cl-sm-desc">Self-imposed penalty if broken — put money on the line</div>
                {stakeMode.financial?.enabled&&<div className="cl-sm-field" style={{display:"flex",gap:6}}>
                  <input type="number" placeholder="Amount ($)" style={{width:"40%"}} value={stakeMode.financial?.amount||""} onChange={e=>{e.stopPropagation();setStakeMode({...stakeMode,financial:{...stakeMode.financial,enabled:true,amount:Number(e.target.value)}})}} onClick={e=>e.stopPropagation()}/>
                  <input type="text" placeholder="Penalty (e.g. donate to charity)" style={{width:"60%"}} value={stakeMode.financial?.penalty||""} onChange={e=>{e.stopPropagation();setStakeMode({...stakeMode,financial:{...stakeMode.financial,enabled:true,penalty:e.target.value}})}} onClick={e=>e.stopPropagation()}/>
                </div>}
              </div>
            </div>
            <div className={`cl-sm-option${stakeMode.reputation?.enabled?" active":""}`} onClick={()=>setStakeMode({...stakeMode,reputation:{enabled:!stakeMode.reputation?.enabled}})}>
              <div className="cl-sm-check">{stakeMode.reputation?.enabled&&"✓"}</div>
              <div className="cl-sm-info">
                <div className="cl-sm-name">🏆 Reputation Stake</div>
                <div className="cl-sm-desc">Log visible streaks — your track record becomes your identity</div>
              </div>
            </div>
          </div>}
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
.os-app{min-height:100%;background:var(--bg2);font-family:'DM Sans',sans-serif;color:var(--text);display:flex;flex-direction:column;padding-bottom:80px;}

/* Top bar */
.os-topbar{width:100%;background:var(--bg);border-bottom:1px solid var(--border);padding:12px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.os-topbar-left{display:flex;align-items:center;gap:14px;}
.os-topbar-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--text);}
.os-topbar-title span{color:var(--gold);}
.os-topbar-sub{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--text3);}
.os-topbar-right{display:flex;gap:6px;align-items:center;}
.os-mode-btn{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:6px 16px;border:1px solid var(--border);background:transparent;color:var(--text2);cursor:pointer;transition:all .2s;border-radius:4px;}
.os-mode-btn:hover{background:var(--bg3);color:var(--text);}
.os-mode-btn.active{background:var(--gold);color:#000;border-color:var(--gold);}

/* Progress */
.os-progress-wrap{max-width:900px;width:100%;margin:20px auto 0;padding:0 32px;}
.os-progress-bar{display:flex;align-items:center;gap:12px;}
.os-progress-track{flex:1;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;}
.os-progress-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .5s ease;}
.os-progress-label{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);white-space:nowrap;}

/* Identity banner */
.os-identity{max-width:900px;width:100%;margin:24px auto 0;padding:0 32px;}
.os-identity-card{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:24px 28px;display:flex;align-items:center;gap:20px;}
.os-avatar{width:48px;height:48px;border-radius:50%;background:var(--gold-d);border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--gold);flex-shrink:0;}
.os-identity-info{flex:1;}
.os-identity-name{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--text);}
.os-identity-input{background:transparent;border:none;border-bottom:1px dashed var(--border2);font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--text);outline:none;width:100%;padding:2px 0;}
.os-identity-input::placeholder{color:var(--text3);}
.os-identity-meta{display:flex;gap:16px;margin-top:4px;}
.os-identity-meta span{font-family:'Azeret Mono',monospace;font-size:9px;color:var(--text3);letter-spacing:1px;}

/* Main grid */
.os-grid{max-width:900px;width:100%;margin:20px auto 0;padding:0 32px;display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.os-grid .full{grid-column:1/-1;}

/* Card */
.os-card{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:0;overflow:hidden;transition:border-color .2s;}
.os-card:hover{border-color:var(--border2);}
.os-card-header{padding:16px 20px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.os-card-num{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);margin-right:10px;}
.os-card-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px;}
.os-card-hint{font-family:'Newsreader',serif;font-style:italic;font-size:11px;color:var(--text2);}
.os-card-body{padding:16px 20px 20px;}

/* Priority */
.os-priority-input{width:100%;background:transparent;border:none;border-bottom:2px solid var(--gold);padding:10px 0;font-family:'Syne',sans-serif;font-size:18px;font-weight:600;color:var(--text);outline:none;letter-spacing:-.3px;}
.os-priority-input::placeholder{color:var(--text3);font-weight:400;}
.os-tf-row{display:flex;justify-content:space-between;align-items:center;margin-top:8px;}
.os-tf-input{font-family:'Azeret Mono',monospace;font-size:10px;background:transparent;border:none;border-bottom:1px solid var(--border);outline:none;color:var(--text2);padding:3px 0;width:120px;}
.os-char-count{font-family:'Azeret Mono',monospace;font-size:9px;color:var(--text3);}

/* List items */
.os-list-item{display:flex;align-items:center;gap:8px;margin-bottom:6px;animation:osFU .2s ease;}
.os-list-marker{font-family:'Azeret Mono',monospace;font-size:10px;color:var(--text3);flex-shrink:0;width:16px;text-align:center;}
.os-list-input{flex:1;background:transparent;border:none;border-bottom:1px solid var(--border);padding:8px 0;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);outline:none;transition:border-color .2s;}
.os-list-input:focus{border-color:var(--gold);}
.os-list-input::placeholder{color:var(--text3);font-style:italic;}
.os-list-del{background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;line-height:1;padding:2px 4px;transition:color .15s;flex-shrink:0;border-radius:3px;}
.os-list-del:hover{color:var(--red);background:var(--red-d);}
.os-add-btn{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);background:none;border:1px dashed var(--border);cursor:pointer;padding:8px 14px;transition:all .15s;border-radius:4px;margin-top:8px;width:100%;text-align:center;}
.os-add-btn:hover{color:var(--gold);border-color:var(--gold);}

/* Rules */
.os-rules-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.os-rule{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:12px;position:relative;}
.os-rule-type{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:6px;}
.os-rule-type.yes{color:var(--green);}.os-rule-type.no{color:var(--red);}
.os-rule-dot{width:6px;height:6px;border-radius:50%;}
.os-rule-type.yes .os-rule-dot{background:var(--green);}.os-rule-type.no .os-rule-dot{background:var(--red);}
.os-rule-textarea{width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);padding:6px 0;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--text);outline:none;resize:none;transition:border-color .2s;}
.os-rule-textarea:focus{border-color:var(--gold);}
.os-rule-textarea::placeholder{color:var(--text3);font-style:italic;}
.os-rule-del{position:absolute;top:8px;right:8px;background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;transition:color .15s;}
.os-rule-del:hover{color:var(--red);}
.os-rules-actions{display:flex;gap:8px;margin-top:10px;}

/* Cadence */
.os-cadence-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.os-cadence-item{border:1px solid var(--border);padding:10px 12px;background:var(--bg2);cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:8px;border-radius:6px;}
.os-cadence-item.active{border-color:var(--gold);background:var(--gold-d);}
.os-cadence-check{width:14px;height:14px;border:1.5px solid var(--border2);border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.os-cadence-item.active .os-cadence-check{border-color:var(--gold);background:var(--gold);}
.os-cadence-dot{width:6px;height:6px;border-radius:50%;background:var(--bg);}
.os-cadence-label{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;color:var(--text);}

/* Goals / Milestones */
.os-goal-item{display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:8px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;transition:all .15s;}
.os-goal-item.done{opacity:0.6;}
.os-goal-check{width:18px;height:18px;border:1.5px solid var(--border2);border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;}
.os-goal-check.checked{border-color:var(--green);background:var(--green);}
.os-goal-check-mark{color:#fff;font-size:11px;font-weight:700;}
.os-goal-input{flex:1;background:transparent;border:none;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);outline:none;}
.os-goal-input::placeholder{color:var(--text3);font-style:italic;}
.os-goal-input.done-text{text-decoration:line-through;color:var(--text3);}

/* Energy tracker */
.os-energy-row{display:flex;gap:8px;flex-wrap:wrap;}
.os-energy-item{padding:8px 16px;border:1px solid var(--border);border-radius:20px;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--text2);}
.os-energy-item.active{border-color:var(--gold);background:var(--gold-d);color:var(--text);}
.os-energy-note{width:100%;background:transparent;border:1px solid var(--border);border-radius:6px;padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--text);outline:none;resize:none;margin-top:10px;transition:border-color .2s;}
.os-energy-note:focus{border-color:var(--gold);}
.os-energy-note::placeholder{color:var(--text3);font-style:italic;}

/* Notes */
.os-notes-area{width:100%;background:transparent;border:1px solid var(--border);border-radius:6px;padding:12px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);outline:none;resize:vertical;min-height:80px;transition:border-color .2s;}
.os-notes-area:focus{border-color:var(--gold);}
.os-notes-area::placeholder{color:var(--text3);font-style:italic;}

/* Action row */
.os-action-row{max-width:900px;width:100%;margin:20px auto 0;padding:0 32px;display:flex;justify-content:flex-end;gap:8px;}
.os-action-btn{font-family:'Azeret Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:11px 22px;border:1.5px solid var(--gold);background:var(--gold);color:#000;cursor:pointer;transition:all .2s;border-radius:4px;font-weight:600;}
.os-action-btn:hover{background:transparent;color:var(--gold);}
.os-action-btn.ghost{background:transparent;color:var(--text2);border-color:var(--border);}
.os-action-btn.ghost:hover{background:var(--bg3);color:var(--text);border-color:var(--border2);}

/* View mode */
.os-view-container{max-width:900px;width:100%;margin:24px auto 0;padding:0 32px;}
.os-view-card{background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
.os-view-header{padding:28px 32px 24px;border-bottom:2px solid var(--gold);display:flex;justify-content:space-between;align-items:flex-end;}
.os-view-header-left{}
.os-view-doc-label{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--text3);margin-bottom:8px;}
.os-view-owner{font-family:'Syne',sans-serif;font-size:clamp(24px,4vw,36px);font-weight:700;line-height:.95;letter-spacing:-1px;color:var(--text);}
.os-view-owner em{font-family:'Newsreader',serif;font-style:italic;font-weight:400;}
.os-view-meta{text-align:right;}
.os-view-meta div{font-family:'Azeret Mono',monospace;font-size:9px;color:var(--text3);line-height:2.1;}
.os-view-meta strong{color:var(--text2);font-weight:500;}
.os-view-body{display:grid;grid-template-columns:1fr 1fr;}
.os-view-cell{padding:24px 28px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);min-height:160px;}
.os-view-cell:nth-child(2n){border-right:none;}
.os-view-cell.full{grid-column:1/-1;border-right:none;}
.os-view-cell-header{display:flex;align-items:baseline;gap:10px;margin-bottom:14px;padding-bottom:8px;border-bottom:1.5px solid var(--gold);}
.os-view-cell-num{font-family:'Azeret Mono',monospace;font-size:9px;color:var(--text3);letter-spacing:1px;}
.os-view-cell-title{font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text);}
.os-view-priority{font-family:'Syne',sans-serif;font-size:18px;font-weight:600;color:var(--text);line-height:1.3;letter-spacing:-.3px;}
.os-view-empty{font-family:'Newsreader',serif;font-style:italic;font-size:13px;color:var(--text3);}
.os-view-list{list-style:none;display:flex;flex-direction:column;gap:7px;}
.os-view-list-item{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--text);line-height:1.5;}
.os-view-list-marker{font-family:'Azeret Mono',monospace;font-size:10px;color:var(--text3);flex-shrink:0;margin-top:2px;}
.os-view-rules{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.os-view-rule{padding:10px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);}
.os-view-rule-label{font-family:'Azeret Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:6px;}
.os-view-rule-label.yes{color:var(--green);}.os-view-rule-label.no{color:var(--red);}
.os-view-rule-text{font-size:12px;color:var(--text);line-height:1.5;}
.os-view-cadence-item{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;color:var(--text);}
.os-view-cadence-item:last-child{border-bottom:none;}
.os-view-cadence-freq{font-family:'Azeret Mono',monospace;font-size:9px;letter-spacing:1px;color:var(--text3);width:54px;flex-shrink:0;}
.os-view-footer{border-top:2px solid var(--gold);padding:14px 32px;display:flex;justify-content:space-between;align-items:center;}
.os-view-footer-left{font-family:'Azeret Mono',monospace;font-size:9px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;}
.os-view-footer-right{font-family:'Newsreader',serif;font-style:italic;font-size:11px;color:var(--text2);}
.os-incomplete-banner{max-width:900px;width:100%;margin:16px auto 0;padding:0 32px;}
.os-incomplete-inner{background:var(--gold-d);border:1px solid var(--gold);border-radius:6px;padding:12px 18px;font-family:'Azeret Mono',monospace;font-size:9px;color:var(--gold);letter-spacing:1px;text-align:center;}

@keyframes osFU{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);}}
`;

const OS_CADENCE=["Daily standup","Daily shutdown","Weekly review","Weekly plan","Monthly review","Quarterly reset"];
const YES_PH=["Directly serves my 90-day priority","Generates revenue or reduces risk","Someone I deeply respect asks me personally","It's reversible and low-cost to try"];
const NO_PH=["Feels urgent but isn't important","I can't say yes wholeheartedly","It fragments my focus for more than a day","Someone else can do this 80% as well"];
const ENERGY_LEVELS=["🔥 Peak","⚡ High","☀️ Steady","🌤️ Moderate","🌧️ Low","🪫 Drained"];

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
  const [goals,setGoals,l9]=useOSState<{text:string;done:boolean}[]>("opos-goals",[{text:"",done:false}]);
  const [energy,setEnergy,l10]=useOSState("opos-energy","");
  const [energyNote,setEnergyNote,l11]=useOSState("opos-energy-note","");
  const [notes,setNotes,l12]=useOSState("opos-notes","");
  const allLoaded=l0&&l1&&l2&&l3&&l4&&l5&&l6&&l7&&l8&&l9&&l10&&l11&&l12;
  const { sub: osSub } = useAuth();
  const isPro = osSub.subscribed;
  const limit = (n: number) => isPro ? Infinity : Math.min(n, FREE_LIMIT);
  const showUpsell = (kind: string) => toast({title:"Free plan limit reached",description:`Upgrade to Pro for unlimited ${kind} (Free is capped at ${FREE_LIMIT}).`});

  const togCadence=(item:string)=>setCadence(cadence.includes(item)?cadence.filter(c=>c!==item):[...cadence,item]);
  const addListItem=(list:string[],setList:React.Dispatch<React.SetStateAction<string[]>>)=>setList([...list,""]);
  const updListItem=(list:string[],setList:React.Dispatch<React.SetStateAction<string[]>>,i:number,v:string)=>setList(list.map((x,j)=>j===i?v:x));
  const remListItem=(list:string[],setList:React.Dispatch<React.SetStateAction<string[]>>,i:number)=>setList(list.filter((_,j)=>j!==i));
  const addRule=(type:string)=>setRules([...rules,{type,text:""}]);
  const updRule=(i:number,v:string)=>setRules(rules.map((r,j)=>j===i?{...r,text:v}:r));
  const remRule=(i:number)=>setRules(rules.filter((_,j)=>j!==i));
  const addGoal=()=>setGoals([...goals,{text:"",done:false}]);
  const updGoal=(i:number,text:string)=>setGoals(goals.map((g,j)=>j===i?{...g,text}:g));
  const togGoal=(i:number)=>setGoals(goals.map((g,j)=>j===i?{...g,done:!g.done}:g));
  const remGoal=(i:number)=>setGoals(goals.filter((_,j)=>j!==i));

  const filled=[priority.trim().length>5,weekly.some(w=>w.trim().length>3),daily.some(d=>d.trim().length>3),rules.some(r=>r.text.trim().length>3)];
  const completePct=Math.round((filled.filter(Boolean).length/filled.length)*100);
  const today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  const initials=name.trim()?name.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2):"?";

  if(!allLoaded)return<div className="os-app" style={{justifyContent:"center",alignItems:"center",minHeight:"60vh",display:"flex"}}><span style={{fontFamily:"'Azeret Mono',monospace",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--text3)"}}>Loading…</span></div>;

  return(<div className="os-app">
    <style>{OS_CSS}</style>

    {/* Top bar */}
    <div className="os-topbar">
      <div className="os-topbar-left">
        <div className="os-topbar-title">One-Page <span>OS</span></div>
        <span className="os-topbar-sub">Personal Operating System</span>
      </div>
      <div className="os-topbar-right">
        <button className={`os-mode-btn${mode==="edit"?" active":""}`} onClick={()=>setMode("edit")}>Edit</button>
        <button className={`os-mode-btn${mode==="view"?" active":""}`} onClick={()=>setMode("view")}>View</button>
        <ExportMenu disabled={!priority.trim()} getPayload={()=>({
          kind:"opos",
          toolLabel:"Decision Suite · One-Page OS",
          title:"One-Page",
          titleEm:"OS",
          subtitle:`${name||"Operator"} · ${tf}${reviewDate?` · review ${reviewDate}`:""}${version?` · v${version}`:""}`,
          sections:[
            {heading:"90-day priority",type:"text",body:priority||"—"},
            ...(goals.some(g=>g.text.trim())?[{heading:"Goals",type:"list" as const,checklist:true,body:goals.filter(g=>g.text.trim()).map(g=>`${g.done?"[x] ":""}${g.text}`)}]:[]),
            {heading:"Weekly non-negotiables",type:"list",body:weekly.filter(w=>w.trim())},
            {heading:"Daily defaults",type:"list",body:daily.filter(d=>d.trim())},
            {heading:"Decision rules — YES",type:"list",body:rules.filter(r=>r.type==="yes"&&r.text.trim()).map(r=>r.text)},
            {heading:"Decision rules — NO",type:"list",body:rules.filter(r=>r.type==="no"&&r.text.trim()).map(r=>r.text)},
            ...(cadence.length?[{heading:"Cadence",type:"list" as const,body:cadence}]:[]),
            ...(energy?[{heading:"Energy",type:"kv" as const,body:[{k:"Level",v:energy},...(energyNote?[{k:"Note",v:energyNote}]:[])]}]:[]),
            ...(notes?.trim()?[{heading:"Notes",type:"text" as const,body:notes}]:[]),
          ],
        } as ExportPayload)}/>
      </div>
    </div>

    {mode==="edit"&&(<>
      {/* Progress */}
      <div className="os-progress-wrap">
        <div className="os-progress-bar">
          <span className="os-progress-label">Complete</span>
          <div className="os-progress-track"><div className="os-progress-fill" style={{width:`${completePct}%`}}/></div>
          <span className="os-progress-label">{completePct}%</span>
        </div>
      </div>

      {/* Identity */}
      <div className="os-identity">
        <div className="os-identity-card">
          <div className="os-avatar">{initials}</div>
          <div className="os-identity-info">
            <input className="os-identity-input" type="text" placeholder="Your name or role" value={name} onChange={e=>setName(e.target.value)}/>
            <div className="os-identity-meta">
              <span>v<input style={{fontFamily:"inherit",fontSize:"inherit",background:"none",border:"none",borderBottom:"1px dashed var(--border2)",outline:"none",width:28,color:"var(--text3)",padding:0}} value={version} onChange={e=>setVersion(e.target.value)}/></span>
              <span>{today}</span>
              <span>Review: <input style={{fontFamily:"inherit",fontSize:"inherit",background:"none",border:"none",borderBottom:"1px dashed var(--border2)",outline:"none",width:80,color:"var(--text3)",padding:0}} value={reviewDate} placeholder="Set date" onChange={e=>setReviewDate(e.target.value)}/></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="os-grid">
        {/* Priority — full width */}
        <div className="os-card full">
          <div className="os-card-header"><div className="os-card-title"><span className="os-card-num">01</span>The One Priority</div><span className="os-card-hint">One objective. One timeframe.</span></div>
          <div className="os-card-body">
            <input className="os-priority-input" type="text" maxLength={120} placeholder="e.g. Close $500K ARR before Q2" value={priority} onChange={e=>setPriority(e.target.value)}/>
            <div className="os-tf-row"><input className="os-tf-input" placeholder="Timeframe" value={tf} onChange={e=>setTf(e.target.value)}/><span className="os-char-count">{priority.length}/120</span></div>
          </div>
        </div>

        {/* Weekly */}
        <div className="os-card">
          <div className="os-card-header"><div className="os-card-title"><span className="os-card-num">02</span>Weekly Non-Negotiables</div></div>
          <div className="os-card-body">
            {weekly.map((w,i)=><div className="os-list-item" key={i}><span className="os-list-marker">—</span><input className="os-list-input" type="text" value={w} placeholder={["Deep work block","Weekly team sync","Friday shutdown review","Strategic conversation"][i]||`Item ${i+1}`} onChange={e=>updListItem(weekly,setWeekly,i,e.target.value)}/>{weekly.length>1&&<button className="os-list-del" onClick={()=>remListItem(weekly,setWeekly,i)}>×</button>}</div>)}
            {weekly.length<limit(6)?<button className="os-add-btn" onClick={()=>addListItem(weekly,setWeekly)}>+ Add item</button>:!isPro&&<button className="os-add-btn" onClick={()=>showUpsell("weekly rituals")} style={{borderColor:"var(--gold)",color:"var(--gold)"}}>+ Add item · Pro unlocks unlimited</button>}
          </div>
        </div>

        {/* Daily */}
        <div className="os-card">
          <div className="os-card-header"><div className="os-card-title"><span className="os-card-num">03</span>Daily Defaults</div></div>
          <div className="os-card-body">
            {daily.map((d,i)=><div className="os-list-item" key={i}><span className="os-list-marker">·</span><input className="os-list-input" type="text" value={d} placeholder={["First 90 min: deep work","Set daily intention","End-of-day: plan tomorrow","No meetings before 10am"][i]||`Default ${i+1}`} onChange={e=>updListItem(daily,setDaily,i,e.target.value)}/>{daily.length>1&&<button className="os-list-del" onClick={()=>remListItem(daily,setDaily,i)}>×</button>}</div>)}
            {daily.length<limit(6)?<button className="os-add-btn" onClick={()=>addListItem(daily,setDaily)}>+ Add item</button>:!isPro&&<button className="os-add-btn" onClick={()=>showUpsell("daily defaults")} style={{borderColor:"var(--gold)",color:"var(--gold)"}}>+ Add item · Pro unlocks unlimited</button>}
          </div>
        </div>

        {/* Decision Rules — full width */}
        <div className="os-card full">
          <div className="os-card-header"><div className="os-card-title"><span className="os-card-num">04</span>Decision Rules</div><span className="os-card-hint">Pre-committed yes/no criteria</span></div>
          <div className="os-card-body">
            <div className="os-rules-grid">
              {rules.map((r,i)=><div className="os-rule" key={i}><div className={`os-rule-type ${r.type}`}><span className="os-rule-dot"/>{r.type==="yes"?"Say Yes when":"Say No when"}</div><textarea className="os-rule-textarea" rows={2} value={r.text} placeholder={r.type==="yes"?YES_PH[rules.filter(x=>x.type==="yes").indexOf(r)%YES_PH.length]:NO_PH[rules.filter(x=>x.type==="no").indexOf(r)%NO_PH.length]} onChange={e=>updRule(i,e.target.value)}/><button className="os-rule-del" onClick={()=>remRule(i)}>×</button></div>)}
            </div>
            <div className="os-rules-actions">{rules.filter(r=>r.type==="yes").length<limit(5)&&<button className="os-add-btn" style={{flex:1}} onClick={()=>addRule("yes")}>+ Yes rule</button>}{rules.filter(r=>r.type==="no").length<limit(5)&&<button className="os-add-btn" style={{flex:1}} onClick={()=>addRule("no")}>+ No rule</button>}{!isPro&&(rules.filter(r=>r.type==="yes").length>=FREE_LIMIT||rules.filter(r=>r.type==="no").length>=FREE_LIMIT)&&<button className="os-add-btn" style={{flex:1,borderColor:"var(--gold)",color:"var(--gold)"}} onClick={()=>showUpsell("decision rules")}>Pro unlocks unlimited</button>}</div>
          </div>
        </div>

        {/* Cadence */}
        <div className="os-card">
          <div className="os-card-header"><div className="os-card-title"><span className="os-card-num">05</span>Operating Cadence</div></div>
          <div className="os-card-body">
            <div className="os-cadence-grid">{OS_CADENCE.map(c=><div key={c} className={`os-cadence-item${cadence.includes(c)?" active":""}`} onClick={()=>togCadence(c)}><div className="os-cadence-check">{cadence.includes(c)&&<div className="os-cadence-dot"/>}</div><span className="os-cadence-label">{c}</span></div>)}</div>
          </div>
        </div>

        {/* Goals / Milestones — NEW */}
        <div className="os-card">
          <div className="os-card-header"><div className="os-card-title"><span className="os-card-num">06</span>Goals & Milestones</div></div>
          <div className="os-card-body">
            {goals.map((g,i)=><div className={`os-goal-item${g.done?" done":""}`} key={i}>
              <div className={`os-goal-check${g.done?" checked":""}`} onClick={()=>togGoal(i)}>{g.done&&<span className="os-goal-check-mark">✓</span>}</div>
              <input className={`os-goal-input${g.done?" done-text":""}`} type="text" value={g.text} placeholder={["Launch MVP","Hire key role","Hit revenue target"][i]||`Goal ${i+1}`} onChange={e=>updGoal(i,e.target.value)}/>
              {goals.length>1&&<button className="os-list-del" onClick={()=>remGoal(i)}>×</button>}
            </div>)}
            {goals.length<limit(8)?<button className="os-add-btn" onClick={addGoal}>+ Add goal</button>:!isPro&&<button className="os-add-btn" onClick={()=>showUpsell("goals")} style={{borderColor:"var(--gold)",color:"var(--gold)"}}>+ Add goal · Pro unlocks unlimited</button>}
          </div>
        </div>

        {/* Energy Tracker — NEW */}
        <div className="os-card">
          <div className="os-card-header"><div className="os-card-title"><span className="os-card-num">07</span>Energy Check-in</div><span className="os-card-hint">Today's level</span></div>
          <div className="os-card-body">
            <div className="os-energy-row">{ENERGY_LEVELS.map(e=><div key={e} className={`os-energy-item${energy===e?" active":""}`} onClick={()=>setEnergy(energy===e?"":e)}>{e}</div>)}</div>
            <textarea className="os-energy-note" rows={2} placeholder="What's driving your energy today?" value={energyNote} onChange={e=>setEnergyNote(e.target.value)}/>
          </div>
        </div>

        {/* Quick Notes — NEW, full width */}
        <div className="os-card full">
          <div className="os-card-header"><div className="os-card-title"><span className="os-card-num">08</span>Quick Notes</div><span className="os-card-hint">Freeform space for thoughts</span></div>
          <div className="os-card-body">
            <textarea className="os-notes-area" rows={4} placeholder="Capture ideas, reflections, or context…" value={notes} onChange={e=>setNotes(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="os-action-row"><button className="os-action-btn" onClick={()=>setMode("view")}>View My OS →</button></div>
    </>)}

    {mode==="view"&&(<>
      {completePct<50&&<div className="os-incomplete-banner"><div className="os-incomplete-inner">OS is {completePct}% complete — return to Edit to fill in more sections.</div></div>}
      <div className="os-view-container">
        <div className="os-view-card">
          <div className="os-view-header">
            <div className="os-view-header-left">
              <div className="os-view-doc-label">Personal Operating System · Official Record</div>
              <div className="os-view-owner">{name||<em style={{color:"var(--text3)",fontFamily:"'Newsreader',serif",fontStyle:"italic",fontWeight:400}}>Your Name</em>}<em>'s OS</em></div>
            </div>
            <div className="os-view-meta">
              <div><strong>Version</strong> {version}</div>
              <div><strong>Updated</strong> {today}</div>
              {reviewDate&&<div><strong>Review</strong> {reviewDate}</div>}
              <div><strong>Timeframe</strong> {tf}</div>
            </div>
          </div>

          <div className="os-view-body">
            <div className="os-view-cell full" style={{borderBottom:"1px solid var(--border)"}}>
              <div className="os-view-cell-header"><span className="os-view-cell-num">01</span><span className="os-view-cell-title">The One Priority — {tf}</span></div>
              {priority?<div className="os-view-priority">{priority}</div>:<div className="os-view-empty">No priority set.</div>}
            </div>

            <div className="os-view-cell">
              <div className="os-view-cell-header"><span className="os-view-cell-num">02</span><span className="os-view-cell-title">Weekly Non-Negotiables</span></div>
              {weekly.filter(w=>w.trim()).length>0?<ul className="os-view-list">{weekly.filter(w=>w.trim()).map((w,i)=><li key={i} className="os-view-list-item"><span className="os-view-list-marker">—</span>{w}</li>)}</ul>:<div className="os-view-empty">Not defined.</div>}
            </div>

            <div className="os-view-cell">
              <div className="os-view-cell-header"><span className="os-view-cell-num">03</span><span className="os-view-cell-title">Daily Defaults</span></div>
              {daily.filter(d=>d.trim()).length>0?<ul className="os-view-list">{daily.filter(d=>d.trim()).map((d,i)=><li key={i} className="os-view-list-item"><span className="os-view-list-marker">·</span>{d}</li>)}</ul>:<div className="os-view-empty">Not defined.</div>}
            </div>

            <div className="os-view-cell full">
              <div className="os-view-cell-header"><span className="os-view-cell-num">04</span><span className="os-view-cell-title">Decision Rules</span></div>
              {rules.filter(r=>r.text.trim()).length>0?<div className="os-view-rules">{rules.filter(r=>r.text.trim()).map((r,i)=><div key={i} className="os-view-rule"><div className={`os-view-rule-label ${r.type}`}><span className="os-rule-dot"/>{r.type==="yes"?"Say Yes when":"Say No when"}</div><div className="os-view-rule-text">{r.text}</div></div>)}</div>:<div className="os-view-empty">No rules defined.</div>}
            </div>

            <div className="os-view-cell">
              <div className="os-view-cell-header"><span className="os-view-cell-num">05</span><span className="os-view-cell-title">Operating Cadence</span></div>
              {cadence.length>0?cadence.map((c,i)=><div key={i} className="os-view-cadence-item"><span className="os-view-cadence-freq">{c.split(" ")[0].toUpperCase()}</span><span>{c}</span></div>):<div className="os-view-empty">No cadence selected.</div>}
            </div>

            <div className="os-view-cell">
              <div className="os-view-cell-header"><span className="os-view-cell-num">06</span><span className="os-view-cell-title">Goals & Milestones</span></div>
              {goals.filter(g=>g.text.trim()).length>0?<ul className="os-view-list">{goals.filter(g=>g.text.trim()).map((g,i)=><li key={i} className="os-view-list-item"><span className="os-view-list-marker">{g.done?"✓":"○"}</span><span style={g.done?{textDecoration:"line-through",color:"var(--text3)"}:{}}>{g.text}</span></li>)}</ul>:<div className="os-view-empty">No goals set.</div>}
            </div>

            {(energy||energyNote.trim())&&<div className="os-view-cell full">
              <div className="os-view-cell-header"><span className="os-view-cell-num">07</span><span className="os-view-cell-title">Energy Check-in</span></div>
              {energy&&<div style={{fontSize:16,marginBottom:energyNote.trim()?8:0}}>{energy}</div>}
              {energyNote.trim()&&<div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,fontStyle:"italic"}}>{energyNote}</div>}
            </div>}

            {notes.trim()&&<div className="os-view-cell full" style={{borderBottom:"none"}}>
              <div className="os-view-cell-header"><span className="os-view-cell-num">08</span><span className="os-view-cell-title">Quick Notes</span></div>
              <div style={{fontSize:13,color:"var(--text)",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{notes}</div>
            </div>}

            <div className="os-view-cell full" style={{borderBottom:"none",background:"var(--bg2)"}}>
              <div className="os-view-cell-header"><span className="os-view-cell-num">∞</span><span className="os-view-cell-title">Commitment</span></div>
              <div style={{fontFamily:"'Newsreader',serif",fontStyle:"italic",fontSize:13,color:"var(--text2)",lineHeight:1.8}}>"I commit to reviewing this OS weekly and holding it as the authoritative source of my operating priorities."</div>
              <div style={{marginTop:20,borderTop:"1px solid var(--border)",paddingTop:14}}>
                <div style={{fontFamily:"'Azeret Mono',monospace",fontSize:8,color:"var(--text3)",letterSpacing:2,marginBottom:8}}>SIGNATURE / DATE</div>
                <div style={{borderBottom:"1px solid var(--border)",height:24}}/>
              </div>
            </div>
          </div>

          <div className="os-view-footer">
            <div className="os-view-footer-left">Decision Suite · One-Page OS · {version}</div>
            <div className="os-view-footer-right">Review weekly. Revise quarterly. Trust the system.</div>
          </div>
        </div>
      </div>
      <div className="os-action-row">
        <button className="os-action-btn ghost" onClick={()=>setMode("edit")}>← Edit OS</button>
        <button className="os-action-btn" onClick={()=>window.print()}>Print / Save PDF</button>
      </div>
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

// ─────────────────────────────────────────
// TOOL: TEMPLATES LIBRARY
// (Templates data + workspace renderer extracted to src/lib/templates/* so the
//  same source of truth powers public /frameworks/:slug SEO pages.)
// ─────────────────────────────────────────
function TemplatesLibrary() {
  const [cat, setCat] = useState("all");
  const [activeTpl, setActiveTpl] = useState<string | null>(null);

  const filtered = cat === "all" ? TEMPLATES : TEMPLATES.filter(t => t.cat === cat);
  const tpl = TEMPLATES.find(t => t.id === activeTpl);

  return (
    <div className="tpl-app">
      <style>{TPL_CSS}</style>
      <div className="tpl-wrap">
        <div className="tpl-hdr">
          <div className="tpl-ey">Decision Frameworks · Templates Library</div>
          <div className="tpl-title">Templates<span>.</span>Library</div>
          <div className="tpl-sub">Pre-built decision frameworks used by the world's best operators. Pick a template, fill in the blanks, get clarity.</div>
        </div>

        {!activeTpl ? (
          <>
            <div className="tpl-cats">
              {TEMPLATE_CATS.map(c => (
                <button key={c.id} className={`tpl-cat${cat === c.id ? " active" : ""}`} onClick={() => setCat(c.id)}>{c.label}</button>
              ))}
            </div>
            <div className="tpl-grid">
              {filtered.map(t => (
                <div key={t.id} className="tpl-card" onClick={() => setActiveTpl(t.id)}>
                  <div className={`tpl-card-badge ${t.badge}`}>{t.cat}</div>
                  <div className="tpl-card-icon">{t.icon}</div>
                  <div className="tpl-card-name">{t.name}</div>
                  <div className="tpl-card-full">{t.fullName}</div>
                  <div className="tpl-card-desc">{t.desc}</div>
                  <div className="tpl-card-dims">{t.dims.map(d => <span key={d} className="tpl-dim">{d}</span>)}</div>
                </div>
              ))}
            </div>
          </>
        ) : tpl ? (
          <div className="tpl-active">
            <button className="tpl-back" onClick={() => setActiveTpl(null)}>← Back to templates</button>
            <div className="tpl-a-icon">{tpl.icon}</div>
            <div className="tpl-a-name">{tpl.name}</div>
            <div className="tpl-a-full">{tpl.fullName}</div>
            <div className="tpl-a-desc">{tpl.desc}</div>

            <div className="tpl-a-section">
              <div className="tpl-a-slbl">How it works</div>
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
            </div>

            <FrameworkWorkspace tpl={tpl} />

            <div style={{ marginTop: 24, fontFamily: "'Azeret Mono',monospace", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>
              <a href={`/frameworks/${tpl.slug}`} style={{ color: "var(--gold)", textDecoration: "none" }}>
                View public guide → /frameworks/{tpl.slug}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const GOAL_MAP: Record<string,{label:string;icon:string;desc:string;primary:string;prompt:string}> = {
  decide_faster:  { label:"Decide faster",     icon:"⚖️", desc:"Cut through analysis paralysis", primary:"decision",   prompt:"What decision have you been circling for more than 48 hours?" },
  follow_through: { label:"Follow through",    icon:"📒", desc:"Turn intentions into evidence",  primary:"ledger",     prompt:"Name one thing you promised yourself last week. Did you do it?" },
  stress_test:    { label:"Stress-test ideas", icon:"😈", desc:"Find flaws before reality does",  primary:"devils",     prompt:"What belief would be most costly if it turned out to be wrong?" },
  build_system:   { label:"Build a system",    icon:"📐", desc:"One page. Always-on.",           primary:"os",         prompt:"If you had to run your life from a single page, what stays on it?" },
};

function Onboarding({onDone}:{onDone:(data:{name:string;goal:string})=>void}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<string>("");

  const finish = () => onDone({ name: name.trim(), goal: goal || "decide_faster" });

  return (
    <div className="onb-overlay">
      <div className="onb-modal">
        {step===0 && (<>
          <div className="onb-step">Welcome · Step 1 of 3</div>
          <div className="onb-title">Think <em>sharper.</em><br/>Decide with evidence.</div>
          <div className="onb-sub">Decision Suite is eight tools for the messy middle of thinking — before you decide, while you decide, and after. Two minutes to set up.</div>
          <div className="onb-actions">
            <button className="onb-skip" onClick={finish}>Skip</button>
            <button className="onb-next" onClick={()=>setStep(1)}>Begin →</button>
          </div>
        </>)}
        {step===1 && (<>
          <div className="onb-step">Step 2 of 3 · Your goal</div>
          <div className="onb-title">What brought you <em>here?</em></div>
          <div className="onb-sub">We'll tailor your home view around this. You can change it later.</div>
          <div className="onb-goals">
            {Object.entries(GOAL_MAP).map(([k,v]) => (
              <button key={k} className={`onb-goal ${goal===k?"sel":""}`} onClick={()=>setGoal(k)}>
                <div className="onb-goal-icon">{v.icon}</div>
                <div className="onb-goal-title">{v.label}</div>
                <div className="onb-goal-desc">{v.desc}</div>
              </button>
            ))}
          </div>
          <div className="onb-actions">
            <button className="onb-skip" onClick={()=>setStep(0)}>← Back</button>
            <button className="onb-next" disabled={!goal} onClick={()=>setStep(2)}>Continue →</button>
          </div>
        </>)}
        {step===2 && (<>
          <div className="onb-step">Step 3 of 3 · One last thing</div>
          <div className="onb-title">What should we <em>call you?</em></div>
          <div className="onb-sub">Optional. Used only to greet you on your dashboard.</div>
          <input className="onb-input" placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)} autoFocus />
          <div className="onb-actions">
            <button className="onb-skip" onClick={()=>setStep(1)}>← Back</button>
            <button className="onb-next" onClick={finish}>Enter the Suite →</button>
          </div>
        </>)}
        <div className="onb-dots">
          {[0,1,2].map(i => <div key={i} className={`onb-dot ${i===step?"active":""}`}/>)}
        </div>
      </div>
    </div>
  );
}

function PersonalizedFor({userName, goal, lastTool, onNavigate}:{userName:string;goal:string;lastTool:string|null;onNavigate:(id:string)=>void}) {
  const g = GOAL_MAP[goal] || GOAL_MAP.decide_faster;
  const hour = new Date().getHours();
  const timeGreet = hour<5?"Still up":hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const who = userName ? `, ${userName}` : "";
  const lastLabel = lastTool ? (NAV_ITEMS.find(n=>n.id===lastTool)?.label || null) : null;
  return (
    <div className="foryou">
      <div className="foryou-eyebrow">For you</div>
      <div className="foryou-greet">{timeGreet}<em>{who}</em>. Here's where to pick up.</div>
      <div className="foryou-row">
        <div className="foryou-card" onClick={()=>onNavigate(g.primary)}>
          <div className="foryou-clbl">Next best tool</div>
          <div className="foryou-ctitle">{NAV_ITEMS.find(n=>n.id===g.primary)?.label}</div>
          <div className="foryou-cdesc">Matches your goal: <strong>{g.label.toLowerCase()}</strong>.</div>
        </div>
        {lastLabel && lastLabel !== NAV_ITEMS.find(n=>n.id===g.primary)?.label && (
          <div className="foryou-card" onClick={()=>onNavigate(lastTool!)}>
            <div className="foryou-clbl">Resume</div>
            <div className="foryou-ctitle">{lastLabel}</div>
            <div className="foryou-cdesc">Continue where you left off.</div>
          </div>
        )}
        <div className="foryou-card" onClick={()=>onNavigate("templates")}>
          <div className="foryou-clbl">Explore</div>
          <div className="foryou-ctitle">Templates Library</div>
          <div className="foryou-cdesc">Six frameworks. Pick one, fill the blanks.</div>
        </div>
      </div>
      <div className="foryou-prompt">"{g.prompt}"</div>
    </div>
  );
}

function HomeDashboard({onNavigate, ledgerStats, userName, goal, lastTool}:{onNavigate:(id:string)=>void;ledgerStats:LedgerStats;userName:string;goal:string;lastTool:string|null}) {
  const TOOLS = [
    { id:"assumption", icon:"🔍", title:"Assumption Audit", role:"Before you decide", seq:"01", badge:"badge-before", badgeLabel:"Before", desc:"Surface the hidden beliefs holding up your strategy. Rate each on evidence quality and load-bearing weight. Find blind spots before they find you." },
    { id:"decision",   icon:"⚖️", title:"Decision.Clarity", role:"Make the call",    seq:"02", badge:"badge-during", badgeLabel:"During", desc:"Weighted decision matrix grounded in decision science. Define options, set criteria, score each. Receive a ranked recommendation with score breakdown." },
    { id:"premortem",  icon:"💀", title:"Pre-Mortem Studio",role:"Stress-test the plan",seq:"03",badge:"badge-after", badgeLabel:"After",  desc:"Imagine the project is already dead. Extract failure modes, rate probability and impact, build mitigation plans. Based on Gary Klein's methodology." },
    { id:"ledger",     icon:"📒", title:"Commitment Ledger",role:"Track follow-through",seq:"04",badge:"badge-exec",  badgeLabel:"Execute",desc:"A formal record of what you said you would do — and whether you did it. Tracks integrity score, behavioral patterns, and overdue commitments." },
    { id:"os",         icon:"📐", title:"One-Page OS",       role:"Always-on system",  seq:"05", badge:"badge-always",badgeLabel:"Always",  desc:"Your complete operating model on one page. Priority, weekly non-negotiables, daily defaults, decision rules, cadence. Builds and persists." },
    { id:"templates",  icon:"📋", title:"Templates Library", role:"Decision frameworks",seq:"06", badge:"badge-always",badgeLabel:"Library", desc:"Pre-built frameworks like RICE, Eisenhower, SWOT, Six Hats, and more. Pick a template, fill in the blanks, get structured clarity." },
    { id:"devils",     icon:"😈", title:"Devil's Advocate", role:"Stress-test your thinking",seq:"07", badge:"badge-during",badgeLabel:"AI", desc:"Paste a decision. AI generates the strongest counter-arguments, hidden assumptions, and questions you must answer before proceeding." },
    { id:"extractor",  icon:"🪞", title:"Assumption Extractor", role:"Surface what's unsaid",seq:"08", badge:"badge-before",badgeLabel:"AI", desc:"Paste a memo, doc, or Slack thread. AI surfaces the load-bearing assumptions hidden inside and tells you what breaks if they're wrong." },
  ];

  return (
    <div className="home">
      <PersonalizedFor userName={userName} goal={goal} lastTool={lastTool} onNavigate={onNavigate}/>
      <div className="home-header">
        <div className="home-eyebrow">Complete Decision Suite · Eight Tools · One System</div>
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
  { id:"templates",  icon:"📋", label:"Templates Library", sub:"Frameworks" },
  { id:"devils",     icon:"😈", label:"Devil's Advocate",  sub:"AI · Counter-arguments" },
  { id:"extractor",  icon:"🪞", label:"Assumption Extractor", sub:"AI · Hidden beliefs" },
];

export default function DecisionSuiteApp() {
  const [active, _setActive] = useState("home");
  const [ledgerEntries, setLedgerEntries] = useState<CLEntry[]>([]);
  const [syncTick, setSyncTick] = useState(0);
  const [theme, setTheme] = useState<"dark"|"light">(() => {
    try { return (localStorage.getItem("ds-theme") as "dark"|"light") || "dark"; } catch { return "dark"; }
  });

  // Onboarding + personalization state
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    try { return storage.get("ds-onboarded")?.value === "1"; } catch { return false; }
  });
  const [userName, setUserName] = useState<string>(() => {
    try { return storage.get("ds-user-name")?.value || ""; } catch { return ""; }
  });
  const [goal, setGoal] = useState<string>(() => {
    try { return storage.get("ds-user-goal")?.value || "decide_faster"; } catch { return "decide_faster"; }
  });
  const [lastTool, setLastTool] = useState<string | null>(() => {
    try { return storage.get("ds-last-tool")?.value || null; } catch { return null; }
  });

  const setActive = (id: string) => {
    _setActive(id);
    if (id !== "home") {
      setLastTool(id);
      try { storage.set("ds-last-tool", id); } catch {}
    }
  };

  const finishOnboarding = (data: {name: string; goal: string}) => {
    setUserName(data.name);
    setGoal(data.goal);
    setOnboarded(true);
    try {
      storage.set("ds-onboarded", "1");
      storage.set("ds-user-name", data.name);
      storage.set("ds-user-goal", data.goal);
    } catch {}
    // send them straight to the recommended tool
    const primary = GOAL_MAP[data.goal]?.primary;
    if (primary) setActive(primary);
  };


  useEffect(() => {
    const handler = () => setSyncTick(t => t + 1);
    window.addEventListener("sync:reloaded", handler);
    return () => window.removeEventListener("sync:reloaded", handler);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("ds-theme", next); } catch {}
  };

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
      <div className={`suite-shell theme-${theme}`}>
        <div className="sidebar">
          <div className="sidebar-logo">
            <img src={logoAsset.url} alt="Decision Suite Studio" />
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
            <div className="topbar-right" style={{display:"flex",alignItems:"center",gap:12}}>
              {intPct !== null ? <span>{`Integrity: ${intPct}%`}</span> : null}
              <button onClick={toggleTheme} style={{background:"var(--bg3)",border:"1px solid var(--border2)",borderRadius:6,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:"var(--text)",transition:"all .15s"}} title={`Switch to ${theme==="dark"?"light":"dark"} mode`}>
                {theme==="dark"?"☀️":"🌙"}
              </button>
              <AccountButton />
            </div>
          </div>
          <div className="tool-frame" key={syncTick}>
            {active==="home"      && <HomeDashboard onNavigate={setActive} ledgerStats={ledgerStats}/>}
            {active==="decision"  && <DecisionClarity/>}
            {active==="assumption"&& <AssumptionAudit/>}
            {active==="premortem" && <PreMortemStudio/>}
            {active==="ledger"    && <CommitmentLedger/>}
            {active==="os"        && <OnePageOS/>}
            {active==="templates" && <TemplatesLibrary/>}
            {active==="devils"    && <DevilsAdvocate/>}
            {active==="extractor" && <AssumptionExtractor/>}
          </div>
        </div>
      </div>
    </>
  );
}
