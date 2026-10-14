# Task: full site audit — find problems, fix the safe ones

Repository `yos360/ugabuga` (branch `main`). Read `CLAUDE.md` first and follow it (answer the owner in Hebrew; code comments/commits may be English). Rules from `docs/codex-brief-more-pages.md` → "Rules (must follow)" apply.

**Goal:** check every page and feature of the site (~3,250 URLs in `public/sitemap.xml` after `node scripts/generate-sitemap.mjs`), write a clear report of every problem found, and fix only the problems that are clearly bugs with small, safe fixes. Do **not** redesign, rewrite content, add features or delete pages.

## Setup
- `npm ci`, then `node scripts/generate-sitemap.mjs && node scripts/generate-routes.mjs && node scripts/generate-llms.mjs && npx vite build`.
- Serve the build: `npx vite preview --port 5199`. Playwright/Chromium: `executablePath: '/opt/pw-browsers/chromium'` if needed.
- External services (Supabase, analytics) may be unreachable from your environment — ignore network errors that come only from them, but list them once in the report.
- Put all audit scripts in `scripts/audit/` (they can stay in the repo — useful to re-run). Keep each script runnable with one command and document it at the top of the file.

## Checks (all pages unless stated)
1. **Every URL in the sitemap**, at 390×844 (phone) and 1280×900 (desktop), with up to 6 parallel tabs:
   - loads without a JavaScript error (`pageerror`) and without React error boundaries;
   - has exactly one `<h1>`, a `<title>` (unique across the site), a meta description ≤165 chars (unique), a canonical URL equal to the page URL;
   - not a "הדף לא נמצא" / "Page not found" page;
   - no horizontal scroll (`scrollWidth > innerWidth`), no text overflowing its box on the phone;
   - no broken images (`naturalWidth === 0`) and no failed requests to our own origin (404/500 for JS, CSS, images, `/data/*`, `/audio/*`, fonts);
   - `/en/...` pages: `<html lang="en" dir="ltr">`; all others `lang="he" dir="rtl"` (also after navigating from an English page back to a Hebrew one).
2. **Links:** collect every internal `<a href>` on every page; every target must be a URL in the sitemap or a known app route (`public/routes.json`). Report dead internal links with the page they are on.
3. **Print / PDF:** on every page that has a print button (`data-print-count`, `PrintPreview`, `PrintableShell`): open the print preview, check pages are A4, nothing is cut off at the edges, and the copies selector works. For a sample of 40 different printables, also generate the PDF and check it opens and has the expected page count.
4. **Interactive features — click through, report what doesn't work:**
   - games under `/online-games/*` (start, play a few moves, end screen), including "מילה בחמש" (dictionary check, hints, marathon);
   - tools under `/tools/*` and `/music/*` (calculators give correct results for 3 known inputs each; stopwatch, QR code generates and scans back with a QR decoder library in Node, metronome, word count);
   - `/shabbat-times`: search a city, a moshav ("נהלל"), a kibbutz, the location button (mock geolocation), the offset selector, a city page, the monthly print;
   - `/parasha`: this week's parasha matches the date, date picker, print with/without answers;
   - `/emoji`: Hebrew search ("לב", "סמיילים", "דגל"), copy (stub clipboard), skin tones, situation pages, `/emoji/israeli` PNG/WebP downloads;
   - `/signs`: game and practice test;
   - share button, search page (`/search`), the owner pages must NOT be indexable (`noindex`).
5. **SEO / structure:** `public/sitemap.xml` and `known-paths.json` contain no duplicates and no URL that 404s; every page in the sitemap has its prerendered HTML (if you run `npm run build` with prerender — optional, it is slow); `robots.txt` and `llms.txt` are valid; JSON-LD on each page parses as valid JSON.
6. **404 behaviour:** `functions/_middleware.js` — made-up URLs in every closed family (`CLOSED_FAMILIES`) and in `/en/...` must get a real 404 (test the middleware with a small Node harness like `tests/music-labels.mjs` does).
7. **Performance:** list the 15 largest JS chunks in `dist/assets`, the size of the main entry chunk, and any page whose JS on first load is > 400 KB gzip. Report only; do not refactor.
8. **Accessibility (quick):** buttons/links without an accessible name, images without `alt`, form inputs without labels — on a sample of 100 pages across all sections.
9. **Hebrew text quality (sample):** on 60 random pages, look for obviously broken text (placeholder text like "TODO", "lorem", "undefined", "NaN", "[object Object]", English developer notes, mixed-up RTL punctuation in headings).

## Fixing
- Fix only clear bugs with small, local changes (a wrong link, a missing alt, an overflowing element, a JS error, a wrong calculation). One Pull Request **per area** (e.g. "audit fixes: links", "audit fixes: print", "audit fixes: games"), each passing `npx vite build`, `npx oxlint` (0 errors) and `node --test tests/*.mjs`. Add a regression test for each logic bug you fix.
- Anything bigger, unclear, content-related, or touching Shabbat times / parasha calculations: **do not change — report it.**
- Never delete pages, never change URLs, never touch `supabase/migrations/`.

## Report
Write `docs/audit-report-YYYY-MM-DD.md` (in Hebrew, short and clear for a non-programmer), and include it in the first Pull Request:
1. Summary: how many pages checked, how many problems, how many fixed.
2. A table of problems: page / what's wrong / severity (חמור, בינוני, קל) / fixed in PR # or "לא תוקן — סיבה".
3. The list of things that need the owner's decision.
4. How to re-run each audit script.
