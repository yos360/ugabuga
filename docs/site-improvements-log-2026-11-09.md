# Daily improver 2026-11-09 (addendum - merge into site-improvements-log.md "Data findings" when Bash is available)

This run had no working shell (Bash classifier error), so: data was read via a temporary workflow (branch deleted itself), NO code change was made (build/lint/tests could not run).

## Data findings (7d vs previous 7d, Monday morning; page paths and counts only)
- Opens 5,144 vs 3,614 (+42%); people-days 1,601 vs 1,014 (+58%); prints/PDFs 519 vs 397 (+31%); uses 1,645 vs 1,094 (+50%); shares 75 vs 105 (-29%). Mobile 1,075 vs desktop 537 people.
- Top entries (7d, entries / single-page): `/holidays/sigd/coloring` 136/90 (66% leave, but 255 actions on 496 opens - prints are the action), `/online-games` 93/49 (53% leave, 0 actions on page, ideas 27/31/35 still pending), guest short links `/r/*` (expected), `/` 70/13 (healthy), `/rsvp` 60/25, `/learn/reading` 54/10, `/request` 32/20, `/letters/cursive` 25/20, `/unseen/english` 21/3.
- Open -> action: sigd coloring 496 opens, 255 actions; `/learn/reading/grade-2` 123 opens, 75 actions; `/letters/game` 109/69; `/classroom/first-grade` 76/61 (new, rising); `/rsvp` 143/47; `/invitation` 59/26; `/printables` 76 opens, 13 actions (66 prev); hubs `/online-games` 172, `/letters` 71, `/kids` 66, `/holidays/sigd` 55: 0-1 actions (launchers).
- Rising: sigd coloring 496 vs 38, `/classroom/first-grade` 76 vs 7, `/favorites` 58 vs 5, `/holidays/sigd` 55 vs 7. Falling: `/request` 58 vs 84.
- Next steps (nav): `/learn/reading` -> grade-3/2/1 (25/19/17); sigd coloring -> worksheets 15 and hub 11; `/holidays/sigd` -> coloring 14; `/kids` -> `/online-games` 14; `/` -> `/learn/reading` 13, `/holidays/hanukkah` 9; `/online-games` -> today 9, memory 9.
- Scroll to 50%: `/learn/reading` 8% (156 views), `/letters` 14%, `/online-games` 13%, sigd coloring 21%, `/` 19%; high: guest pages 80%+, `/kids` >90%.
- Search (7d): 50 searches, 10 found nothing (20%); no repeated zero-result term (>=2). 404: only `/tools/pdf/to-word` 2. Party tools (7d opens/uses): `/rsvp` 96/47, `/invitation` 33/26, `/live` 21/3, `/en/rsvp` 14/2, `/birthday` 3/0.
- JS errors (7d): `/learn/reading/grade-4` type 17 (same as idea 24), `/en/reading-comprehension/en-g9-wrong-train` other 9 (new, check), `/letters/cursive` range 5.

## Ideas (new / updated)
| # | Idea | Status |
|---|------|--------|
| 36 | Sigd coloring is 496 opens/week but ends within weeks; the Hanukkah coloring strip should take over (idea 22) and `/holidays/hanukkah/coloring` should get the same "what next" strip - check it before 20.11 | suggested |
| 37 | `/classroom/first-grade` (76 opens, 61 actions, up from 7): add it as a tile in `/classroom` and `/learn` and a "next grade-1 sheet" button; measure nav clicks | suggested |
| 38 | `/en/reading-comprehension/en-g9-wrong-train`: 9 JS errors of class "other" in 7d - inspect the page | suggested |
| 39 | `/online-games` still the main leak (93 entries, 53% leave, 0 actions) - approve a "play now" row above the banners (ideas 27/31/35) | suggested (needs approval, top priority) |
| 40 | `/printables` hub: 76 opens, only 13 actions - six big tiles of the most printed sheets (idea 23) | suggested |
