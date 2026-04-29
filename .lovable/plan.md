
# One-Click Export — PDF / Markdown / Notion

Add an **Export** button to each major tool that turns the current entry into a polished, branded document in three formats.

## Scope

Tools that get an Export button:
- Decision Clarity (decision matrix + ranked result)
- Pre-Mortem Studio (failure modes + mitigations)
- One-Page OS (priority, weeklies, dailies, rules, cadence)
- Assumption Audit (strategy + rated assumptions + insight)
- Commitment Ledger (filtered list of commitments + integrity stats)

## Formats

1. **PDF** — Polished, print-ready. Title block, eyebrow, sections, gold accent rule, monospaced metadata. Generated client-side with `jsPDF` + `jspdf-autotable` so it works offline and needs no backend.
2. **Markdown (.md)** — Clean GitHub-flavored markdown with headings, tables, and checkboxes. Downloads as `.md` file.
3. **Notion-ready** — Same markdown, but copied to clipboard with a toast confirming "Paste into Notion". Notion auto-converts pasted markdown into native blocks (headings, tables, to-dos), so no API integration needed.

## User flow

```text
Tool view
┌──────────────────────────────────────┐
│  Decision Clarity                    │
│  ...result panel...      [Export ▾] │
└──────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────┐
                │  📄 Download PDF     │
                │  📝 Download Markdown│
                │  📋 Copy for Notion  │
                └──────────────────────┘
```

The button only appears when there's something meaningful to export (e.g. Decision Clarity needs ≥1 option scored; Pre-Mortem needs ≥1 failure; OnePageOS needs a priority).

## Technical implementation

**New file: `src/lib/export.ts`**
- `toMarkdown(payload: ExportPayload): string` — central formatter.
- `toPDF(payload: ExportPayload): jsPDF` — uses jsPDF with brand styling (Syne-like serif fallback for title, sans for body, gold `#D4A554` accent rule, mono for metadata line).
- `downloadBlob(filename, blob)` and `copyToClipboard(text)` helpers.
- `ExportPayload` is a discriminated union: `{ kind: "decision" | "premortem" | "opos" | "assumption" | "ledger", title, subtitle, sections: Section[] }` where `Section` is `{ heading, type: "text" | "list" | "table" | "kv", body }`. Each tool builds its own payload from local state.

**New component: `src/components/ExportMenu.tsx`**
- Dropdown trigger styled to match the existing card buttons.
- Three menu items: PDF, Markdown, Notion (clipboard).
- Calls handlers from `export.ts`. Shows toasts for success/failure ("Copied to clipboard — paste into Notion").
- Accepts a `payload` prop (or a `getPayload: () => ExportPayload` callback so it captures state at click time).

**Tool wiring** (in `src/components/DecisionSuite.tsx`)
- Decision Clarity: insert `<ExportMenu>` next to the "Result" header on step 4. Build payload from `decision`, `criteria`, `options`, computed `results`.
- Pre-Mortem Studio: add to the final stage header. Payload includes `mission`, `timeframe`, `obituary`, `failures` (with category, prob, impact), and `shields` per failure.
- One-Page OS: add to view-mode header. Payload includes name, timeframe, priority, weekly/daily lists, yes/no rules, cadence, energy, notes.
- Assumption Audit: add to audit phase header. Payload includes `strategy`, all assumptions with evidence/weight ratings + flag (blind-spot/caution/solid/untested), and the generated insight.
- Commitment Ledger: add to the ledger tab header. Payload includes integrity stats and the currently filtered entries as a table (text, category, deadline, stakes, status).

**Brand styling for PDF**
- Top eyebrow line in mono, uppercase, letter-spaced (e.g. `DECISION SUITE · DECISION CLARITY`).
- Title in large serif-ish weight (jsPDF "times" bold) with the second word italicized via separate text run, matching the on-screen `em` styling.
- 1pt gold horizontal rule under the title.
- Section headings in bold sans, body in regular sans.
- Footer: `Generated <date> · decisionsuite.app · Page X of Y`.

**Dependencies to add**
- `jspdf` and `jspdf-autotable` (small, client-side, no Node).

## Files to add / change

- `src/lib/export.ts` (new) — payload builders + PDF/Markdown generators.
- `src/components/ExportMenu.tsx` (new) — dropdown UI + handlers.
- `src/components/DecisionSuite.tsx` — wire `<ExportMenu>` into the 5 tools and add tiny payload-builder functions per tool.
- `package.json` — add `jspdf`, `jspdf-autotable`.

## Out of scope (ask separately if needed)

- Direct Notion API push (requires user OAuth + Notion integration token).
- DOCX export.
- Sharing via link / hosted export (would need backend + auth).
- Editable templates / theme picker for exports.
- Bulk export (e.g. export entire ledger history as ZIP).
