# Site improvements log (daily improver)

Approvals by the owner are recorded here: change status to `approved` and the daily run implements it.
Data rules: read-only, aggregate numbers and page paths only.

## Ideas backlog
| # | Idea | Page | Metric it should move | Status |
|---|------|------|-----------------------|--------|
| 1 | Home page: shorter "pick your goal" row (print / play / learn / party) above the fold; today only 29% of home visits go on and 3% act | `/` | home visit -> any action: 3% -> 8% | suggested |
| 2 | "Next step" block after printing on top dead-end print pages (hebrew-letters done 29.10; memory-english, shabbat-times, abc-letters next) | `/printables/*` | single-page visits 85% -> 65% | done (hebrew-letters), measure 5.11 |
| 3 | `/classroom` (219 visits/28d, 0 actions, 26% single page): add 3 big buttons to the most used class tools (print, quiz, live) | `/classroom` | actions per visit 0 -> 10% | suggested |
| 4 | Reading hub `/learn/reading` (130 visits, 1% action, 8% leave): link straight into one text per grade with a "start" button | `/learn/reading` | opens of `/learn/reading/grade-*` | suggested |
| 5 | Suppliers search: 192 of 200 searches (28d) returned zero results — widen supplier list or show "request this supplier" | suppliers search | searches with results | suggested (owner decision) |

## Data findings
### 2026-10-29 (7 vs previous 7 / 28 days)
- Opens 3350 vs 4118 (-19%); prints 159 vs 130 (+22%); PDF downloads 82 vs 110; shares 105 vs 39 (x2.7); plays 30 vs 129 (-77%, the online-games fall explains it).
- Daily visitors 90-200 on normal days; peaks 16-17.10 (180) and 27.10 (169). Mobile is the vast majority (about 80%); sources: direct, google (mobile 222/week), facebook 43.
- 70% of visits (7d) open a single page; 14% open 5+ pages. Hubs work: only 0-26% of visits to /games, /math, /letters, /kids, /online-games end there.
- Dead ends (visits that end on the same page, 28d): /shabbat-times 96%, /printables/hebrew-letters 85% (184 visits, 24% print), /printables/memory-english 83%, /parasha 35%, /rsvp 45%.
- Entry pages (7d): /r/3rt6xgjk 97 (a short link), /rsvp 55, /en/rsvp 48, / 43, /printables/memory-english 41, /learn/reading 35. Home entries fell: 130 vs 418 opens week-over-week (it was inflated by a spike on 17.10).
- Home next click (28d): /classroom 77, /games 51, /online-games 38, /kids 35, /printables 34, /bugapedia 32, /birthday 30.
- Returning visitors cannot be measured: the id lives one day, 99% appear on one day only.
- Page requests: 1 in the last 28 days. Experiment home-top: 2 views since 28.10 — far too early.
- Small numbers: single days are noise; weekly trends only.

## Measured results
(nothing yet)

# Site improvements log

## 2026-10-29 — Search Console review (28 days to 28.10.2026)

### Time tunnel (/time-tunnel/MM-DD)
- Added `src/data/timeTunnelIsrael.js`: Israeli / Jewish events, births and deaths, each confirmed by two independent sources on the exact day and year. Shown in a new "בישראל ובעם היהודי" section and in the date's FAQ/JSON-LD.
- Date pages now link explicitly to yesterday and tomorrow; on today's page a "מה קרה היום" line is shown.
- The hub `/time-tunnel` has a "מה קרה היום?" section linking today's and tomorrow's date pages.
- Home page: not changed (no existing slot; it already embeds the daily game with a link to the hub).
- Covered dates: 10-29 … 11-29 (22 of 33 dates have a verified entry). No verified entry yet: 11-01, 11-05, 11-06, 11-08, 11-11, 11-14, 11-17, 11-21, 11-28, 11-30.
- Left: the other ~330 dates. Dropped for uncertainty (do not re-add without a better source): Trumpeldor birth 21.11.1880 (Julian/Gregorian unclear), Hanna Maron birth (22 vs 23.11), Sharon/Kadima 21.11.2005 (day disputed), Operation Yachin 28.11.1961 (single source).
- To extend: add keys to `TT_ISRAEL` (tests/time-tunnel-israel.test.mjs enforces two distinct https sources per entry).
