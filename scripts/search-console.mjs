// Google Search Console report — positions, clicks and impressions, read through the official API with a
// read-only service account (no browser, no owner's computer). Runs in .github/workflows/search-console.yml;
// the key lives only in the GSC_SERVICE_ACCOUNT repository secret. Setup: docs/search-console-setup.md.
//   GSC_SERVICE_ACCOUNT='{...json...}' node scripts/search-console.mjs
// Output: GitHub annotations (::notice) and a step summary. Aggregates only — Search Console has no
// visitor-level data.
import { createSign } from 'node:crypto'
import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const API = 'https://searchconsole.googleapis.com/webmasters/v3'
const b64url = s => Buffer.from(s).toString('base64url')

export function serviceJwt(account, now = Math.floor(Date.now() / 1000)) {
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = b64url(JSON.stringify({ iss: account.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }))
  const sig = createSign('RSA-SHA256').update(`${head}.${claim}`).sign(account.private_key, 'base64url')
  return `${head}.${claim}.${sig}`
}

// Date ranges: Search Console data lags ~2–3 days, so windows end 3 days ago.
export function windows(today = new Date(), days = 28) {
  const d = n => { const x = new Date(today); x.setUTCDate(x.getUTCDate() - n); return x.toISOString().slice(0, 10) }
  return { cur: [d(days + 2), d(3)], prev: [d(2 * days + 2), d(days + 3)] }
}

// Queries already on page 1–2 with real demand: the cheapest ones to push to the top.
export function opportunities(rows, { min = 20, from = 4.5, to = 15 } = {}) {
  return rows.filter(r => r.impressions >= min && r.position >= from && r.position <= to).sort((a, b) => b.impressions - a.impressions)
}

// Joins this period with the previous one by key: position change (negative = moved up) and click change.
export function compare(cur, prev) {
  const old = new Map(prev.map(r => [r.keys[0], r]))
  return cur.map(r => { const p = old.get(r.keys[0]); return { ...r, prevPosition: p?.position ?? null, prevClicks: p?.clicks ?? 0, move: p ? +(r.position - p.position).toFixed(1) : null } })
}

const pos = n => (n == null ? '—' : n.toFixed(1))
const line = r => `${r.keys[0]} | clicks ${r.clicks} | impr ${r.impressions} | pos ${pos(r.position)}${r.move == null ? ' | new' : ` (${r.move > 0 ? '+' : ''}${r.move})`}`

async function main() {
  const account = JSON.parse(process.env.GSC_SERVICE_ACCOUNT || 'null')
  if (!account?.client_email || !account?.private_key) { console.log('::warning title=setup::GSC_SERVICE_ACCOUNT secret is not set yet — see docs/search-console-setup.md'); return }
  const tok = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: serviceJwt(account) }) }).then(r => r.json())
  if (!tok.access_token) { console.log(`::error title=auth::${tok.error || 'no token'} ${tok.error_description || ''}`); process.exit(1) }
  const get = (path, body) => fetch(`${API}${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${tok.access_token}`, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) }).then(r => r.json())
  const sites = (await get('/sites')).siteEntry || []
  const site = (sites.find(s => s.siteUrl === 'sc-domain:ugabuga.co.il') || sites.find(s => s.siteUrl.includes('ugabuga.co.il')))?.siteUrl
  if (!site) { console.log(`::error title=access::The service account (${account.client_email}) is not a user on the ugabuga.co.il property yet — add it in Search Console › Settings › Users and permissions`); process.exit(1) }
  const q = (range, dims, rowLimit = 250) => get(`/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { startDate: range[0], endDate: range[1], dimensions: dims, rowLimit, dataState: 'final' }).then(r => r.rows || [])
  const w = windows()
  const [totCur, totPrev, qCur, qPrev, pCur, pPrev, daily] = await Promise.all([q(w.cur, []), q(w.prev, []), q(w.cur, ['query'], 1000), q(w.prev, ['query'], 1000), q(w.cur, ['page'], 500), q(w.prev, ['page'], 500), q([windows(new Date(), 90).cur[0], w.cur[1]], ['date'], 120)])
  const t = r => r[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  const queries = compare(qCur, qPrev), pages = compare(pCur, pPrev).map(r => ({ ...r, keys: [r.keys[0].replace(/^https:\/\/ugabuga\.co\.il/, '') || '/'] }))
  const weeks = new Map()
  for (const r of daily) { const d = new Date(r.keys[0]); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); const k = d.toISOString().slice(0, 10), x = weeks.get(k) || { clicks: 0, impressions: 0, posSum: 0 }; x.clicks += r.clicks; x.impressions += r.impressions; x.posSum += r.position * r.impressions; weeks.set(k, x) }
  const out = {
    site: `${site} | ${w.cur.join('..')} vs ${w.prev.join('..')}`,
    totals: [`now: clicks ${t(totCur).clicks} | impr ${t(totCur).impressions} | ctr ${(t(totCur).ctr * 100).toFixed(1)}% | avg pos ${pos(t(totCur).position)}`, `prev: clicks ${t(totPrev).clicks} | impr ${t(totPrev).impressions} | ctr ${(t(totPrev).ctr * 100).toFixed(1)}% | avg pos ${pos(t(totPrev).position)}`].join('\n'),
    weekly: [...weeks].map(([k, x]) => `${k} | clicks ${x.clicks} | impr ${x.impressions} | avg pos ${x.impressions ? (x.posSum / x.impressions).toFixed(1) : '—'}`).join('\n'),
    top_queries: queries.slice().sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 30).map(line).join('\n'),
    top_pages: pages.slice().sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 30).map(line).join('\n'),
    opportunities: opportunities(queries).slice(0, 30).map(line).join('\n'),
    climbers: queries.filter(r => r.move != null && r.move <= -3 && r.impressions >= 10).sort((a, b) => a.move - b.move).slice(0, 20).map(line).join('\n'),
    fallers: queries.filter(r => r.move != null && r.move >= 3 && r.prevClicks >= 2).sort((a, b) => b.move - a.move).slice(0, 15).map(line).join('\n'),
    counts: `queries ${qCur.length} (prev ${qPrev.length}) | pages with impressions ${pCur.length} (prev ${pPrev.length}) | top-3 queries ${qCur.filter(r => r.position <= 3).length} | top-10 queries ${qCur.filter(r => r.position <= 10).length}`,
  }
  for (const [k, v] of Object.entries(out)) console.log(`::notice title=${k}::${String(v || '(none)').replace(/%/g, '%25').replace(/\n/g, '%0A')}`)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, Object.entries(out).map(([k, v]) => `### ${k}\n\`\`\`\n${v || '(none)'}\n\`\`\`\n`).join('\n'))
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) await main()
