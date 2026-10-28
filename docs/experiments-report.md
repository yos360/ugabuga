# Weekly long-term check — "מה עובד באתר?"

A scheduled task runs this every week and sends the owner a short Hebrew summary of the changes made on
28.10.2026, measured over time (one day is noise; weeks show the truth):

1. **Home top block (experiment `home-top`)** — search / live / request / bring ("מי מביא מה?", added 28.10).
   Per variant: shown, click rate, print rate, request rate. Compare only from 2026-10-28 (when `bring`
   joined). Call a winner only with ≥300 "shown" per variant and a clear gap; otherwise say "עוד מוקדם".
2. **WhatsApp channel** — page views of `/whatsapp` per day (every site button goes through it), and the
   printed-QR channel variants `w1`/`w2`: printed vs scanned, next to the other QR variants.
3. **"לכל הכיתה" button** (print preview, 28.10) — proxy: prints/PDFs of 10+ sheets per day, before vs after.
4. **New unseen levels** (28.10) — opens of `/unseen/english/grade-5|6` and `/unseen/hebrew/grade-7|8` and
   their tests, and unseen opens overall per week.
5. **Prints per week** — sheets and printers, this week vs last weeks.

## Rules
- Read-only. Numbers and page paths only — never visitor ids, request texts, emails or anything personal.
- Same mechanism as docs/print-report.md: a temporary workflow on a `live-check-weekly-<stamp>` branch that
  deletes itself; results read from its annotations.
- Don't change the site from this task. Recommendations go to the owner, who decides.

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
          q home_top "select variant, count(*) filter (where kind='shown') shown, count(*) filter (where kind='click') click, count(*) filter (where kind='print') print, count(*) filter (where kind='request') request from public.site_experiment_events where experiment='home-top' and created_at >= '2026-10-28 22:00+00' group by 1 order by 1"
          q home_top_week "select variant, count(*) filter (where kind='shown') shown, count(*) filter (where kind='click') click, count(*) filter (where kind='print') print from public.site_experiment_events where experiment='home-top' and created_at > now() - interval '7 days' group by 1 order by 1"
          q channel_page "select $TZ::date as day, count(*) opens, count(distinct visitor) people from public.owner_site_activity where action='open' and path='/whatsapp' and created_at > now() - interval '28 days' group by 1 order by 1"
          q qr_variants "select variant, count(*) filter (where kind='printed') printed, count(*) filter (where kind='scanned') scanned from public.qr_variant_events where created_at > now() - interval '28 days' group by 1 order by 1"
          q class_prints "select date_trunc('week', $TZ)::date week, count(*) filter (where pages >= 10) big_prints, count(*) prints, coalesce(sum(pages),0) sheets from public.owner_site_activity where action in ('print','download') and created_at > now() - interval '42 days' group by 1 order by 1"
          q unseen "select date_trunc('week', $TZ)::date week, count(*) filter (where path ~ '^/unseen/(english/(grade-[56]|en-g[56]-)|hebrew/(grade-[78]|he-g[78]-))') new_levels, count(*) filter (where path like '/unseen%') all_unseen from public.owner_site_activity where action='open' and created_at > now() - interval '42 days' group by 1 order by 1"
          q weekly_prints "select date_trunc('week', $TZ)::date week, count(*) prints, coalesce(sum(pages),0) sheets, count(distinct visitor) printers from public.owner_site_activity where action in ('print','download') and created_at > now() - interval '56 days' group by 1 order by 1"
      - name: Delete this temporary branch
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.git.deleteRef({ owner: context.repo.owner, repo: context.repo.repo, ref: 'heads/BRANCH' })
```

## The message (Hebrew, short, for a phone notification)
- One line per item above: the number, the trend (↑/↓ vs last week), and what it means.
- Home top block: which opening leads so far (click and print rate), or "עוד מוקדם" with how many views
  are still needed.
- End with one or two concrete recommendations ("להשאיר את מי מביא מה", "להוריד את הפס הירוק"…), marked
  as suggestions waiting for the owner's approval.
