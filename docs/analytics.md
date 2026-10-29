# Site analytics — what is measured, where it lives, and how to read it

Owner report: **/admin/activity** (`src/pages/OwnerActivityReport.jsx`). Client code: `src/utils/liveActivity.js`.
All of it follows one privacy model: **aggregate, no personal data, best-effort, keepalive requests**, and it
waits for the *human check* (real input; crawlers and automated browsers are never counted) and skips the
owner's own browser (`buga-owner-device`, unless `buga-track-self=1`). Never sent: names, typed text, IPs,
query strings, full URLs. Shared-space links (`/t/…`) become `/shared-space`; ids/tokens in paths become `_id`.

## 1. Page-level events — table `owner_site_activity` (RPC `record_site_event_v3`)
Anonymous daily visitor id (rotates at local midnight). Actions: `open`, `preview`, `print` (+ sheet count in
`pages`), `download` (PDF), `play` / `check` / `create` / `refresh` / `use` (button clicks classified by label,
`buttonAction`), `share` (+ `channel`: whatsapp/facebook/native/copy/email/native_done), `time` (seconds on page
while visible and active). Plus `source` (direct/internal/google/…/qr), `device`, returning-visitor day count
(`record_visit_day`), sponsor clicks (`category = sponsor:<id>`, action `use`), PDF downloads
(`record_pdf_download`), home experiment (`site_experiment_events`), QR variants (`qr_variant_events`).
Read via `owner_activity_summary`, `owner_social_report`, `owner_sponsor_clicks`, …

## 2. Site signals — table `site_signal_events` (RPC `record_site_signal`) — migration `202610290001_site_signals.sql`
Kept in a **separate table with no visitor id** so they never inflate the totals above. Columns: `kind`, `path`
(clean), `target` (nav only), `value` (fixed code), `device`, `created_at`. Rows older than 180 days are pruned.

| kind | value | path / target | what it tells us |
|---|---|---|---|
| `scroll` | `0` / `50` / `90` | the page | `0` = a person viewed a *long* page (≥1.3 screens); `50`/`90` = scrolled past that share. Reach = `50`/`0`. Shows if the FAQ/guide text under tools is read. Short pages (fit on one screen) are not counted. |
| `notfound` | – | requested path (`/_invalid` if odd characters) | broken links / old URLs to redirect |
| `jserror` | `type` `ref` `syntax` `range` `chunk` `other` | page it happened on | uncaught errors and React render crashes (`PageErrorBoundary`) by class only — **no message text**. `chunk` = a stale tab after a deploy. Network/abort noise and other sites' scripts are ignored; max 10 per tab. |
| `search` | `r0` / `r1_5` / `r6p` | `/search` | result-count bucket, once per query that stayed on screen for 2 s |
| `nav` | – | path = page of the click, `target` = internal page | next steps people take: clicks on internal `<a>`/`<Link>` inside `<main>` (not the back link, not downloads, not external) |
| `helpful` | `yes` / `no` | the page | "האם זה עזר?" 👍/👎 (`PageFeedback`, one tap, remembered per page in localStorage `buga-helpful`, hidden in print and present mode) |

"האם זה עזר?" appears only on `/tools|printables|games|online-games|learn|brain-games|logic-puzzles|sudoku|math|typing/<page>`
(`src/utils/feedbackPages.js`) — never on the home page, index pages, RSVP / bring-list / secret-friend / shared-space, or `/en`.

## 3. Searches that found nothing — table `site_search_misses` (RPC `record_search_miss`)
Columns: `term`, `created_at` only — **no visitor id, no path, no device**. Stored only when the search had zero
results **and** the text is 1–3 words of Hebrew/English letters, 2–30 chars, no digits/@/punctuation
(`safeSearchTerm`; the server repeats the regex and runs the site content filter `gt_bad_text` / `gt_has_link`).
Pruned after 90 days. The same term from one browser is sent at most once a minute.

## 4. Tables are closed
RLS on, `revoke all` from `anon`/`authenticated`; visitors can only call the insert RPCs (flood-guarded);
only `yos300@gmail.com` can call `owner_site_signals(p_from, p_to)`. The report section
**"🧭 גלילה, חיפוש, 404 ו'האם זה עזר?'"** (`src/components/owner/SiteSignals.jsx`) shows: scroll reach per top page,
top next-step links, 👍/👎 per page, search buckets, zero-result searches, top 404 paths, JS errors per page.

## 5. Example SQL (daily improver / weekly check — run as owner or service role)
```sql
-- Pages whose long content is mostly not read (reach to 50% under 30%), last 7 days
select path, count(*) filter (where value='0') views,
       round(100.0*count(*) filter (where value='50')/nullif(count(*) filter (where value='0'),0)) pct50,
       round(100.0*count(*) filter (where value='90')/nullif(count(*) filter (where value='0'),0)) pct90
from site_signal_events where kind='scroll' and created_at > now() - interval '7 days'
group by path having count(*) filter (where value='0') >= 30 order by pct50 limit 20;

-- Pages people found unhelpful
select path, count(*) filter (where value='yes') yes, count(*) filter (where value='no') no
from site_signal_events where kind='helpful' and created_at > now() - interval '30 days'
group by path having count(*) >= 5 order by no::numeric/count(*) desc limit 20;

-- Top 404s / what people look for and don't find / JS errors since the last deploy
select path, count(*) from site_signal_events where kind='notfound' and created_at > now() - interval '7 days' group by 1 order by 2 desc limit 20;
select term, count(*) from site_search_misses where created_at > now() - interval '30 days' group by 1 order by 2 desc limit 30;
select path, value, count(*) from site_signal_events where kind='jserror' and created_at > now() - interval '1 day' group by 1,2 order by 3 desc;

-- Which next step people take from a page
select path, target, count(*) from site_signal_events where kind='nav' and created_at > now() - interval '14 days'
group by 1,2 order by 3 desc limit 30;
```

## 6. Adding a new signal
Add the kind/value to the check + allow-list in a new idempotent migration (copy the `record_site_signal` pattern),
call `logSignal(kind, path, { value })` from the client, add the pure helper + a test in `tests/site-signals.test.mjs`,
extend `owner_site_signals` and `SiteSignals.jsx`, and document it here. Never add a visitor id, free text or a full URL.
