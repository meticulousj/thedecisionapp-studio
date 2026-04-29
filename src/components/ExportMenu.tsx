import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  copyToClipboard,
  downloadBlob,
  slugify,
  toMarkdown,
  toPDF,
  type ExportPayload,
} from "@/lib/export";

const css = `
.exm-wrap{position:relative;display:inline-block;font-family:'DM Sans',sans-serif;}
.exm-btn{background:var(--bg3,#1a1a22);color:var(--text,#f0f0f0);border:1px solid var(--border2,#2a2a3a);border-radius:8px;padding:8px 14px;font-size:13px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:all .15s;font-family:inherit;}
.exm-btn:hover{border-color:#D4A554;color:#D4A554;}
.exm-btn .exm-caret{font-size:10px;opacity:.7;}
.exm-menu{position:absolute;top:calc(100% + 6px);right:0;min-width:200px;background:#15151c;border:1px solid #2a2a3a;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.5);z-index:1000;overflow:hidden;animation:exmIn .12s ease-out;}
.theme-light .exm-menu{background:#fff;border-color:#e2e2ea;box-shadow:0 12px 40px rgba(0,0,0,.12);}
.theme-light .exm-btn{background:#f5f5f8;color:#1a1a2e;border-color:#d0d0da;}
@keyframes exmIn{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.exm-item{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;cursor:pointer;color:#f0f0f0;font-size:13px;border:none;background:none;width:100%;text-align:left;font-family:inherit;}
.theme-light .exm-item{color:#1a1a2e;}
.exm-item:hover{background:rgba(212,165,84,.1);color:#D4A554;}
.exm-item-ic{font-size:15px;line-height:1.2;flex-shrink:0;}
.exm-item-body{display:flex;flex-direction:column;gap:2px;}
.exm-item-t{font-weight:500;}
.exm-item-d{font-size:11px;opacity:.6;font-family:'Azeret Mono',monospace;letter-spacing:.04em;}
`;

export default function ExportMenu({
  getPayload,
  disabled,
  label = "Export",
}: {
  getPayload: () => ExportPayload;
  disabled?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const safelyGetPayload = (): ExportPayload | null => {
    try {
      return getPayload();
    } catch (e: any) {
      toast({ title: "Nothing to export yet", description: e?.message || "Add some content first." });
      return null;
    }
  };

  const baseName = (p: ExportPayload) => `${p.kind}-${slugify(p.title + (p.titleEm ? "-" + p.titleEm : ""))}-${new Date().toISOString().slice(0, 10)}`;

  const handlePDF = () => {
    const p = safelyGetPayload();
    if (!p) return;
    const doc = toPDF(p);
    doc.save(`${baseName(p)}.pdf`);
    toast({ title: "PDF downloaded", description: `${p.title}${p.titleEm ? " " + p.titleEm : ""} exported.` });
    setOpen(false);
  };

  const handleMarkdown = () => {
    const p = safelyGetPayload();
    if (!p) return;
    downloadBlob(`${baseName(p)}.md`, toMarkdown(p), "text/markdown");
    toast({ title: "Markdown downloaded", description: "Open in any editor or paste into Notion." });
    setOpen(false);
  };

  const handleNotion = async () => {
    const p = safelyGetPayload();
    if (!p) return;
    const ok = await copyToClipboard(toMarkdown(p));
    if (ok) toast({ title: "Copied for Notion", description: "Paste into a Notion page — it converts automatically." });
    else toast({ title: "Copy failed", description: "Try the Markdown download instead." });
    setOpen(false);
  };

  return (
    <>
      <style>{css}</style>
      <div className="exm-wrap" ref={ref}>
        <button className="exm-btn" disabled={disabled} onClick={() => !disabled && setOpen((o) => !o)}>
          <span>📤</span>
          <span>{label}</span>
          <span className="exm-caret">▾</span>
        </button>
        {open && !disabled && (
          <div className="exm-menu" role="menu">
            <button className="exm-item" onClick={handlePDF}>
              <span className="exm-item-ic">📄</span>
              <span className="exm-item-body">
                <span className="exm-item-t">Download PDF</span>
                <span className="exm-item-d">Polished, print-ready</span>
              </span>
            </button>
            <button className="exm-item" onClick={handleMarkdown}>
              <span className="exm-item-ic">📝</span>
              <span className="exm-item-body">
                <span className="exm-item-t">Download Markdown</span>
                <span className="exm-item-d">.md file</span>
              </span>
            </button>
            <button className="exm-item" onClick={handleNotion}>
              <span className="exm-item-ic">📋</span>
              <span className="exm-item-body">
                <span className="exm-item-t">Copy for Notion</span>
                <span className="exm-item-d">Paste · auto-converts</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
