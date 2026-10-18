# Instructions for coding agents (Codex and others)

The same rules as CLAUDE.md apply to every agent working on this site.

- Answer the site owner in Hebrew, including short progress updates. Commit messages and code comments may stay in English.
- Before pushing: `npx vite build` passes, `npx oxlint` has no errors, and the tests pass (`node --test tests/*.mjs`).
- New SQL goes in a new file in `supabase/migrations/` (never edit one that may already have run); write it so running it twice is safe (`if not exists`, `create or replace`, `drop policy if exists`). Say in the summary that it needs to run on the live database.
- The repository is public: never print or commit secrets, tokens, organizer links (`#k=`) or visitors' personal data, including in GitHub Actions logs.
- Arcade games share files (`src/arcade/logic/cards.js`, `ui.jsx`, `hooks.js`, `arcade.css`, `games/card-polish.css`); a change there affects every card game, including Solitaire and Spider.
- Poker games stay out of the daily challenge (`NOT_DAILY` in `src/arcade/daily.js`).
