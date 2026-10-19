# Brain games audit

Baseline: `0093833cc3f6a140d4e2a7c94a6763cebcd9d477` (main, checked before implementation).

- `src/arcade/registry.js` supplies the hub, lazy game loading and canonical `/online-games/:slug` landing pages. Extend it without duplicating playable routes.
- `ArcadeStage.jsx` owns the fullscreen dialog, music, exit and reports. Reuse it; do not change shared card-game files.
- `hooks.js/useProgress` persists under `buga-arcade-*`, catches storage failures, and supports functional updates. Use a versioned brain session with validated restoration and best stars.
- `daily.js` and `utils/israelDate.js` establish the Israeli calendar convention. IQ gets its own deterministic daily selection, leaving the existing daily rotation and poker exclusions intact.
- Node's test runner handles pure logic in `tests/*.mjs`; existing Playwright scripts live under `scripts/audit`. Add full-catalog invariants and a dedicated mobile/desktop smoke script.
- `SEO`, `Breadcrumbs`, and `faqSchema` already exist. Curated `public/sitemap-static.xml` drives sitemap and prerender; `generate-routes.mjs` reads explicit App routes. Add editorial brain pages with links to canonical arcade games, not copies of their game screens.
- No server, database, paid service or new runtime dependency is needed.

Review sequence: pure engines and catalogs → gameplay/session UI and registry → editorial SEO and browser smoke. Later PRs are stacked on preceding branches, not merged into main. The user's review-only instruction overrides CLAUDE.md's older direct-to-main instruction.
