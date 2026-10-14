# Task for Codex: Israeli traffic signs (from issue #73)

Implement on this branch (codex/traffic-signs).

Repository `yos360/ugabuga` — read `CLAUDE.md` first and follow it (Hebrew site; `npx vite build`, `npx oxlint` with 0 errors and `node --test tests/*.mjs` must pass; CI runs them on the PR). See `docs/codex-brief-more-pages.md` for how pages, routes, sitemap and `functions/_middleware.js` → `CLOSED_FAMILIES` fit together.

## Goal
Israeli traffic signs for kids, parents and teens preparing for the driving-theory test: a hub and **one page per sign**.

## Step 0 — sources first (required, document in `docs/traffic-signs-sources.md`)
- The sign list, numbers, names and meanings must come from the **official Israeli source** (the signs table in תקנות התעבורה / Ministry of Transport "לוח התמרורים"). Do not invent or guess meanings. If a sign's official meaning can't be confirmed, leave the sign out and list it in the doc.
- Sign artwork: use only images whose licence allows reuse on this site (e.g. Wikimedia Commons files marked public domain / free licence). Record the source and licence for every file. If a licence is unclear, draw a simple SVG yourself from the official shape/colours, or leave the sign out — never hot-link.
- If the official list can't be obtained in your environment, stop and say so in the PR instead of generating content.

## Pages
- `/signs` — hub: what the sign shapes/colours mean (warning, prohibition, obligation, information…), groups by category, search box, links to every sign page (paginated/grouped — no one huge list).
- `/signs/:number` (or a slug) — one page per sign: the sign large, its official number and name, what it means in simple Hebrew, where you usually see it, "what should a driver / cyclist / pedestrian do", similar signs that are easy to confuse (with links), and one practice question with an explanation.
- `/signs/game` — "which sign is this?" quiz (by category or mixed), and printable flashcards (front: sign, back: name) using the existing `PrintPreview` (it already supports the "how many pages" option via `variant`).
- Kid-friendly copy on the hub; accurate, plain language on sign pages.
- SEO per page (`SEO`, `SeoBody` + FAQ), add all URLs to the sitemap, add the new family to `CLOSED_FAMILIES`, add hub/game to `src/data/searchStatic.js`, and link the hub from the learning section.

## Done when
Every included sign has a correct page with a sourced meaning and licensed artwork, the quiz and flashcards work and print on A4, tests cover the data (unique numbers, every sign has meaning + image + source), and the PR description lists counts, sources and anything left out.