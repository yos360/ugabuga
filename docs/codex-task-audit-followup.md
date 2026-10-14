# Task: fix the open items from the site audit (14.10.2026)

Repository `yos360/ugabuga` (branch `main`). Read `CLAUDE.md` first and follow it (answer the owner in Hebrew; code comments/commits may be English). Rules from `docs/codex-brief-more-pages.md` → "Rules (must follow)" apply. The audit report is `docs/audit-report-2026-10-14.md`; the audit scripts are in `scripts/audit/` — use them to prove each fix.

Three parts. Do them in this order. **Never change** Shabbat-time/parasha calculations, URLs, page content/texts, or `supabase/migrations/`.

## Part 1 — Logic puzzles PDF: vertical table headers
`/logic-puzzles/print` (`src/pages/logicPuzzles/LogicBoard.jsx`, `logic-puzzles.css`): the vertical column headers come out rotated/split wrongly in the downloaded PDF (html2canvas does not support `writing-mode` / rotated text the way the browser does). Browser print is fine.
- Draw the vertical headers in a way html2canvas captures correctly (e.g. a small inline `<svg>` with `<text transform="rotate(-90)">` per header, or another method you prove works) — same look in the browser and in print.
- Prove it: generate the PDF for all four levels (`scripts/audit/print-detail.mjs` / `print-regression.mjs`), render page 1 of each to PNG (`pdftoppm`) and check visually that headers match the browser. Commit the comparison screenshots to `docs/screenshots/audit-followup/`.

## Part 2 — Performance: first-load JavaScript
Targets: main entry chunk ≤ 150 KB gzip (today ~181 KB), and **no page** above 400 KB gzip of JS on first load (today 230 pages, max ~432 KB — list in `docs/audit-data-2026-10-14.json` → `performance`).
- Find what is in the main entry chunk and the heavy shared chunks (use `rollup-plugin-visualizer` or `vite build --sourcemap` + `source-map-explorer` as a dev-only, temporary tool — do not leave new dependencies in `package.json` unless they are dev-only and useful).
- Typical fixes, only where they keep behaviour identical: lazy-load things not needed for the first paint (e.g. data imported by layout components on every page — `src/data/searchStatic.js` should load only when search opens; large data files imported statically by hub pages; `html2canvas`/PDF code only when the user prints), split large data files per section, move rarely used libraries behind `import()`.
- Don't touch how pages look or what they show. Prerendered HTML must stay the same (spot-check 20 pages: same `<h1>`, title, text).
- Prove it: re-run the JS-size part of `scripts/audit/crawl.mjs` (or a small script) on all pages before/after; put the before/after table in the report.

## Part 3 — Unify the 33 old print pages
33 pages still use the browser's `window.print()` instead of the site's `PrintPreview` (list in `docs/audit-data-2026-10-14.json` → `print.native` / `print.nativePdf`). Move them to `PrintPreview` (or `PrintableShell`), so they get the same preview, PDF download and copies selector as the rest of the site.
- Keep each sheet's content and layout the same on A4. Where a page has its own settings (copies, sizes), keep them working.
- Prove it: `scripts/audit/print.mjs` for those 33 pages — preview opens, A4, nothing cut off, copies 1→2 doubles the sheets; `scripts/audit/pdf.mjs` for at least 10 of them.

## Checks before every push
`npx vite build`, `npx oxlint` (0 errors), `node --test tests/*.mjs` — all must pass. Add a regression test for each logic change (e.g. a test that the search data is not in the main chunk, a test that the 33 pages render a print button wired to `PrintPreview`).

## Delivering (pushing the fixes)
- Per `CLAUDE.md`, changes go to `main`. **If you can push to `main`:** after all checks pass, push each part to `main` as its own commit (one push per part, not many small pushes — every push to `main` triggers a full site build on Cloudflare that takes ~15 minutes, and pushes queue up).
- **If you cannot push to `main`:** open **one Pull Request per part** against `main` (3 PRs), each green and mergeable on its own, and say so in Hebrew in the summary.
- Do not push to other branches more than needed (no need for preview builds).

## When finished
Add a short section "מעקב — תיקונים" at the end of `docs/audit-report-2026-10-14.md`: what was fixed in each part, the before/after numbers for performance, and anything left out and why. Then a short summary in Hebrew for the owner.
