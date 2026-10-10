import { readFile, writeFile, readdir } from 'node:fs/promises'

// Builds public/sitemap.xml (submitted to Google via robots.txt) from two sources:
//   1. public/sitemap-static.xml — the hand-curated hub/category/idea/tool pages.
//      This file is also what scripts/prerender.mjs snapshots at build time, so its
//      scope stays fixed and safe regardless of how many games exist in the database.
//   2. public/data/games.json — every active game gets its own
//      /games/{slug} entry, with `lastmod` from the row's `updated_at`.
//
// Individual game pages are intentionally left OUT of sitemap-static.xml (and so
// never prerendered) because there are 100+ of them and the list changes as games
// are added/edited in Supabase; a static file would drift immediately. They still
// need to be in the *sitemap* though, or Google has no way to discover them at all
// (a plain crawl from category pages is slow and unreliable for 100+ pages).
//
// Any /games/{slug} that has its own redirect in public/_redirects (legacy games
// that were consolidated into a dedicated /tools/* page, e.g. buga-bingo →
// /tools/bingo-maker) is skipped, so we never submit a URL to Google that just
// 301s somewhere else.
//
// INTERIM FIX (2026-09-24): a live-site audit found that /games/buga-bingo,
// /games/eretz-ir-buga, /games/emet-o-buga, /games/buga-trivia and /games/buga-town
// were expected to be indexable but were missing from the sitemap — they're
// exactly the "legacy games with a /tools/ redirect" case the skip-logic above is
// designed to exclude. Removing that skip-logic globally risks reintroducing dead
// URLs for the *other* legacy aliases in _redirects that never had real game rows
// (e.g. /games/wheel, /games/timer, /games/riddles), so instead we add just these
// specific, confirmed-real slugs back in below (plus buga-terutzim, see Fix 1 for
// the games.js slug-typo bug that produced a broken buga-tirutzim link). This is a
// pragmatic stopgap, not a full fix: whoever revisits this should decide whether
// these five /games/ URLs should keep redirecting at all (submitting a URL that
// 301s is unusual SEO practice) or whether the redirects should be removed instead.
// (2026-09-24, later) The five legacy slugs now 301 to their /tools/* pages, which are
// already in sitemap-static.xml, so only buga-terutzim stays here.
const INTERIM_EXTRA_GAME_SLUGS = ['buga-terutzim']

async function getRedirectedGameSlugs() {
  const redirects = await readFile(new URL('../public/_redirects', import.meta.url), 'utf8')
  const slugs = new Set()
  for (const line of redirects.split('\n')) {
    const m = line.match(/^\/games\/([a-z0-9-]+)\s/)
    if (m) slugs.add(m[1])
  }
  return slugs
}

async function getActiveGameSlugs() {
  // Games live in the site itself (public/data/games.json) — no external database.
  const rows = JSON.parse(await readFile(new URL('../public/data/games.json', import.meta.url), 'utf8'))
  return rows.filter(g => g.status === 'active').map(g => ({ slug: g.slug, updated_at: g.updated_at }))
}

// Public supplier cards live in the site's own Supabase project.
const SITE_DB_URL = 'https://efhgyispuwxcplvzipcy.supabase.co'
const SITE_DB_KEY = 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
async function getSupplierSlugs() {
  const res = await fetch(`${SITE_DB_URL}/rest/v1/rpc/suppliers_public_list`, { method: 'POST', headers: { apikey: SITE_DB_KEY, 'Content-Type': 'application/json' }, body: '{}' })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  const rows = await res.json()
  return Array.isArray(rows) ? rows.map(r => r.slug).filter(s => /^[a-z0-9-]{3,40}$/.test(s || '')) : []
}

// Holiday areas: every src/holidays/*.jsx config declares `const base = '/holidays/…'`
// and its pages as `to: base` / `to: base + '/…'`. Read them straight from the source
// so a new holiday reaches the sitemap without editing any list by hand.
async function getHolidayUrls() {
  const dir = new URL('../src/holidays/', import.meta.url)
  const urls = []
  for (const f of (await readdir(dir)).filter(f => f.endsWith('.jsx'))) {
    const src = await readFile(new URL(f, dir), 'utf8')
    const base = src.match(/const base = '(\/holidays\/[a-z0-9-]+)'/)?.[1]
    if (!base) continue
    for (const m of src.matchAll(/to: base(?: \+ '(\/[a-z0-9-]+)')?[,\s}]/g)) urls.push(base + (m[1] || ''))
  }
  return [...new Set(urls)]
}

async function main() {
  const staticXml = await readFile(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')

  const seen = new Set()
  const lines = []
  try {
    const [redirectedSlugs, games] = await Promise.all([getRedirectedGameSlugs(), getActiveGameSlugs()])
    for (const { slug, updated_at } of games) {
      if (!slug || redirectedSlugs.has(slug) || seen.has(slug)) continue
      seen.add(slug)
      const lastmod = updated_at ? ` <lastmod>${updated_at.slice(0, 10)}</lastmod>` : ''
      lines.push(`  <url><loc>https://ugabuga.co.il/games/${slug}</loc>${lastmod} <priority>0.6</priority></url>`)
    }
    console.log(`generate-sitemap: added ${lines.length} game pages (${redirectedSlugs.size} legacy slugs skipped).`)
  } catch (err) {
  // Never fail the build over this — ship the static sitemap rather than break deploys.
    console.warn(`generate-sitemap: could not fetch games from Supabase, keeping static sitemap only. ${err.message}`)
  }

  // Add the interim slugs regardless of whether the Supabase fetch above worked,
  // so these known-real URLs are never dropped by a transient fetch failure.
  for (const slug of INTERIM_EXTRA_GAME_SLUGS) {
    if (seen.has(slug)) continue
    seen.add(slug)
    lines.push(`  <url><loc>https://ugabuga.co.il/games/${slug}</loc> <priority>0.6</priority></url>`)
  }

  try {
    const slugs = [...new Set(await getSupplierSlugs())]
    for (const slug of slugs) lines.push(`  <url><loc>https://ugabuga.co.il/suppliers/${slug}</loc> <priority>0.6</priority></url>`)
    console.log(`generate-sitemap: added ${slugs.length} supplier pages.`)
  } catch (err) {
    console.warn(`generate-sitemap: could not fetch suppliers, skipping them. ${err.message}`)
  }

  // Supplier category landing pages (src/data/supplierCategoryPages.js) — a safety net for
  // any page not yet listed (and so not prerendered) in sitemap-static.xml.
  try {
    const { SUPPLIER_CATEGORY_PAGES, categoryPagePath } = await import('../src/data/supplierCategoryPages.js')
    let added = 0
    for (const p of SUPPLIER_CATEGORY_PAGES) {
      const u = categoryPagePath(p.slug)
      if (staticXml.includes(`https://ugabuga.co.il${u}</loc>`)) continue
      lines.push(`  <url><loc>https://ugabuga.co.il${u}</loc> <priority>0.7</priority></url>`); added++
    }
    console.log(`generate-sitemap: added ${added} supplier category pages.`)
  } catch (err) {
    console.warn(`generate-sitemap: could not read supplier category pages. ${err.message}`)
  }

  try {
    let added = 0
    for (const u of await getHolidayUrls()) {
      if (staticXml.includes(`https://ugabuga.co.il${u}</loc>`)) continue
      lines.push(`  <url><loc>https://ugabuga.co.il${u}</loc> <priority>0.8</priority></url>`); added++
    }
    console.log(`generate-sitemap: added ${added} holiday pages.`)
  } catch (err) {
    console.warn(`generate-sitemap: could not read holiday configs. ${err.message}`)
  }

  const gameUrls = lines.join('\n')
  const merged = gameUrls
    ? staticXml.replace('</urlset>', `${gameUrls}\n</urlset>`)
    : staticXml

  await writeFile(new URL('../public/sitemap.xml', import.meta.url), merged)
  console.log('generate-sitemap: wrote public/sitemap.xml')
}

await main()
