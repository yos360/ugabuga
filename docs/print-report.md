# Daily print analyst — "למה היום הדפיסו יותר/פחות?"

> All site measurements, their tables and example SQL: see [analytics.md](analytics.md).

A scheduled task reads the site's own activity numbers every evening and sends the owner a short Hebrew
explanation: how today compares with yesterday and with the same weekday last week, *why* (one heavy printer,
a traffic source that spiked or dropped, a page that took off), and one or two concrete things to try.

## Rules
- Read-only. Numbers and page paths only — never visitor ids, request texts, emails or anything personal.
- The check runs as a temporary workflow on a `live-check-print-report-<stamp>` branch that deletes itself;
  results are read from its annotations (`gh api repos/yos360/ugabuga/commits/<sha>/check-runs`, then
  `.../check-runs/<id>/annotations`).
- Compare like with like: today is partial until midnight, so compare "until this hour" across days.
- One person printing 20 times is not a trend — call out any single visitor with ≥10 prints in a day.
- Don't change the site from this task. Suggestions go to the owner.

## The workflow (copy into `.github/workflows/<branch>.yml` on the temporary branch, replace BRANCH twice)
```yaml
name: BRANCH
on:
  push:
    branches: [BRANCH]
permissions:
  contents: write
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Read-only counts (numbers and page paths only)
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        shell: bash
        run: |
          q() {
            out=$(curl -s -X POST "https://api.supabase.com/v1/projects/efhgyispuwxcplvzipcy/database/query" \
              -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json" \
              --data "$(jq -n --arg q "$2" '{query: $q}')" | jq -r 'if type=="array" then .[] | [.[]|tostring] | join(" | ") else tostring end')
            echo "::notice title=$1::$(printf '%s' "$out" | sed ':a;N;$!ba;s/\n/%0A/g')"
          }
          TZ="(created_at at time zone 'Asia/Jerusalem')"
          q now "select (now() at time zone 'Asia/Jerusalem')::text"
          q daily "select $TZ::date as day, count(*) filter (where action='print') prints, count(*) filter (where action='download') pdf, coalesce(sum(pages) filter (where action in ('print','download')),0) sheets, count(distinct visitor) filter (where action in ('print','download')) printers, count(distinct visitor) visitors from public.owner_site_activity where created_at > now() - interval '15 days' group by 1 order by 1"
          q same_hours "with n as (select extract(hour from now() at time zone 'Asia/Jerusalem') + extract(minute from now() at time zone 'Asia/Jerusalem')/60.0 h) select $TZ::date as day, count(*) filter (where action in ('print','download')) prints, count(distinct visitor) filter (where action in ('print','download')) printers, count(distinct visitor) visitors from public.owner_site_activity, n where created_at > now() - interval '9 days' and extract(hour from $TZ) + extract(minute from $TZ)/60.0 <= n.h group by 1 order by 1"
          q heavy_printers "select $TZ::date as day, count(*) prints_by_one_visitor, min(path) a_page from public.owner_site_activity where action in ('print','download') and created_at > now() - interval '3 days' group by 1, visitor having count(*) >= 10 order by 1"
          q top_paths "select path, count(*) filter (where $TZ::date = (now() at time zone 'Asia/Jerusalem')::date - 1) yday, count(*) filter (where $TZ::date = (now() at time zone 'Asia/Jerusalem')::date) today, count(*) filter (where $TZ::date = (now() at time zone 'Asia/Jerusalem')::date - 7) last_week from public.owner_site_activity where action in ('print','download') and created_at > now() - interval '9 days' group by path order by 3 desc, 2 desc limit 20"
          q sources "select $TZ::date as day, coalesce(source,'-') src, count(distinct visitor) visitors from public.owner_site_activity where created_at > now() - interval '8 days' group by 1,2 order by 1,3 desc"
          q preview_to_print "select $TZ::date as day, count(*) filter (where action='preview') previews, count(*) filter (where action in ('print','download')) prints from public.owner_site_activity where created_at > now() - interval '8 days' group by 1 order by 1"
      - name: Delete this temporary branch
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.git.deleteRef({ owner: context.repo.owner, repo: context.repo.repo, ref: 'heads/BRANCH' })
```

## The message (Hebrew, short, for a phone notification)
1. One line: today vs yesterday vs the same weekday last week, in printers (people) and prints, until this hour.
2. Why, in one or two lines: heavy printer, source spike/drop (Facebook, Google…), a page that rose or fell.
3. One or two things to try tomorrow, specific to what the numbers show (e.g. "the Sigd coloring page jumped —
   post it in the WhatsApp channel"; "Facebook brought 31 people yesterday — another post this week").
