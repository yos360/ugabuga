# משימה: להכפיל את מספר הדפים באתר עוגה בוגה — בלי דפים דלים

Repository: `yos360/ugabuga` (branch `main`). Hebrew kids' site (React 19 + Vite + react-router, Tailwind, Cloudflare Pages, Supabase).
Read `CLAUDE.md` first and follow it. Answer the owner in Hebrew; code comments and commit messages may be in English.

## Rules (must follow)
- Before every push: `npx vite build` passes, `npx oxlint` has **0 errors**, and `node --test tests/*.mjs` passes. Push directly to `main`.
- Write code like the surrounding code (same helpers, naming, comment density). Reuse existing components: `SEO` (`src/components/ui/SEO.jsx`), `SeoBody` + `faqSchema`, `Breadcrumbs`, `PrintPreview` (print + PDF), `PrintableShell`.
- Every new page must be **genuinely useful on its own** (something to print, play or learn that no other page has), with a unique `<h1>`, title, description (≤165 chars) and 2–3 paragraphs + FAQ written for *that* page. Google penalises the whole site for mass, near-duplicate thin pages — if a page would only differ by one word, don't create it.
- Do **not** add thousands of links to the main menu (`src/data/siteMenu.js`) or render one huge list on a hub page: hubs show groups and link to sub-pages; long lists are paginated or split by category.
- For every new route: add it in `src/App.jsx` (static routes **before** any `/:param` route on the same prefix), add the URLs to `public/sitemap-static.xml` (or to the generator in `scripts/generate-sitemap.mjs` if the list is data-driven), and add search entries in `src/data/searchStatic.js` for hub-level pages.
- Param routes listed in `functions/_middleware.js` → `CLOSED_FAMILIES` only accept slugs that are in the sitemap; if you add a new param family, add its regex there **and** make sure every valid slug is in the sitemap (otherwise real pages return 404).
- Check pages in a browser (Playwright is available: `executablePath: '/opt/pw-browsers/chromium'` if needed; dev server `npx vite --port 5199`), on desktop and on a 390px-wide phone.

## Step 1 — make the prerender faster (do this first)
`scripts/prerender.mjs` renders every URL to static HTML **one by one** (~1 hour for ~2,200 pages; doubling the pages would double it).
- Render with a pool of N pages/tabs in parallel (e.g. 6–8, configurable via env var), keeping the same output files and the same waiting/readiness logic per page.
- Keep the existing safety behaviour (errors on one page must not stop the run; the summary at the end must still report failures).
- Done when: the output in `dist/` is identical in structure to before, and the run is several times faster.

## Step 2 — a page for every coloring drawing (~525 pages)
Today: 48 subject pages at `/printables/coloring/:subject` (`src/pages/printables/ColoringSubject.jsx`, data in `src/data/coloringSubjects.js`), ~575 drawings in `public/coloring/<subject>/<subject>-N.svg|webp`.
- New route e.g. `/printables/coloring/:subject/:n` → one drawing: big preview, print button (`PrintPreview`, A4, the drawing filling the page), PDF download, "more drawings from this subject" (6–8 thumbnails), and links to 3 related subjects.
- Each drawing needs a short, specific name and description (what is in the picture, suitable age), stored in the data file — not generated from the number. Title pattern: "דף צביעה <שם הציור> להדפסה — חינם".
- Subject pages link to every drawing page. Add all drawing URLs to the sitemap and the slug family to `CLOSED_FAMILIES`.
- Done when: every drawing has its own working page, printing gives one clean A4 sheet, and the subject pages still load fast (lazy images).

## Step 3 — a page for every country (~195 pages)
Data exists: `src/flags/flagsData.js` (`WORLD_COUNTRIES` with code, Hebrew name, capital, continent; `FLAG_NOTES`; `flagSrc(code)`), coloring flags in `src/flags/coloringFlags.js`, quiz helpers in `src/flags/flagQuiz.js`, hub in `src/flags/FlagsPages.jsx`.
- New route e.g. `/flags/:code` (or a Hebrew-friendly slug) → the flag big, capital, continent, what the flag's colours/symbols mean (from `FLAG_NOTES` where available; write short accurate notes for the rest — no invented facts), the flag to colour and print (where `COLORING_FLAGS` has it), a 5-question mini quiz around this country/continent, and links to neighbouring countries on the same continent.
- Continent pages / the flags hub link to every country page.
- Done when: every country has a correct, useful page; facts are verifiable (no guessed populations/dates — leave out what you aren't sure of).

## When finished
Write a short summary in Hebrew for the owner: what was added (number of pages), anything that needs manual action (e.g. SQL migrations in `supabase/migrations/` are run manually by the owner — say so if you added any), and anything you skipped and why.
