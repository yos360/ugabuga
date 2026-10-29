# Noindex of thin templated pages — 2026-10-29

**Result: 0 URLs were set to noindex or removed from the sitemap in this round.** Nothing here needs undoing.

## Why nothing was noindexed

The rule was: noindex only near-identical variants with no unique content, never a page with Search Console clicks, never the only page for a topic. When this was checked:

- No Search Console page-level data was available to the session (the `search-console` workflow has never run: the `GSC_SERVICE_ACCOUNT` secret is not set, see `docs/search-console-setup.md`). So "has no clicks" could not be confirmed for any family.
- Every family below has per-page text (a scene description, a name meaning, country facts, a sign number) and each page is the only page for its own topic. The closest case, numbered coloring drawings, ranks for image search, which noindex would remove.

When in doubt the rule is not to noindex, so these are suggestions only.

## Template families in `public/sitemap-static.xml` (5,131 URLs)

| Family | URLs |
|---|---|
| `/printables/coloring/<subject>/N (Hebrew numbered drawings)` | 437 |
| `/printables/coloring/<subject> (subject hubs)` | 48 |
| `/en/coloring/<holiday>/N` | 99 |
| `/en/coloring-pages/*` | 49 |
| `/printables/name-coloring/<name>` | 262 |
| `/baby-names/*` | 298 |
| `/flags/<code>` | 195 |
| `/math/* (grades, topics, tests)` | 188 |
| `/signs/<number>` | 37 |
| `/family-names/*` | 155 |
| `/printables/color-by-number/*` | 58 |
| `/time-tunnel/*` | 379 |
| `/shabbat-times/* (never noindex)` | 173 |
| `/en/* total` | 250 |

## Suggestions (decision for the owner, after the first Search Console report)

1. `/printables/coloring/<subject>/N` — 437 pages that differ by image plus 3 short sentences. First candidate: after 4–8 weeks of Search Console data, noindex every drawing with 0 clicks and 0 impressions, keep the subject hub and any drawing with traffic. Add more text (age, technique, activity) only to drawings that earn impressions.
2. `/en/coloring/<holiday>/N` — 99 English pages with one unique sentence and shared holiday text. Second candidate, same test.
3. `/baby-names/*` — the earlier audit (`thin-content-audit.md`) already set a re-check in early December 2026; merge into letter pages by noindex if 0 impressions.
4. Keep as is: `/flags/<code>`, `/math/*`, `/signs/<number>`, `/printables/name-coloring/<name>` (each has a unique name/meaning/topic), `/time-tunnel/*`, `/shabbat-times/*`, hubs, `/learn`.

## How to apply later (reversible)

1. List the path patterns here, with the reason and the date.
2. In `src/components/ui/SEO.jsx` make `noindex` true for those paths (prerender skips pages that are noindex only if the check in `scripts/prerender.mjs` is relaxed for them).
3. Remove the same paths from `public/sitemap-static.xml` (and from `scripts/generate-name-coloring.mjs` / the sitemap generator, and `tests/name-coloring.test.mjs` if names are touched).
4. Undo: delete the pattern, restore the sitemap lines (`git revert` of that commit), and submit the sitemap again in Search Console.

## Noindexed patterns now

None.
