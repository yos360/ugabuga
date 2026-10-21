import { readFile } from 'node:fs/promises'

// Submits new/changed pages to IndexNow (api.indexnow.org) so Bing — and through it
// ChatGPT's web search — learns about them within days instead of waiting for the
// next full sitemap crawl.
//
// How it decides WHAT to submit: it compares the freshly built sitemap
// (public/sitemap.xml, regenerated on every `npm run build`) against a BASELINE
// snapshot of the sitemap that was live on ugabuga.co.il *before* this deploy
// (the workflow saves it to a temp file right after the build step). A URL is
// submitted when it is new (not in the baseline) or when its <lastmod> changed.
//
// Modes / env:
//   BASELINE_SITEMAP  — path to the pre-deploy live sitemap snapshot (required
//                       unless INDEXNOW_SUBMIT_ALL=1).
//   INDEXNOW_SUBMIT_ALL=1 — ignore the baseline and submit EVERY sitemap URL
//                       (used once to seed Bing, or after a Bing reset).
//   INDEXNOW_DRY_RUN=1 — print what would be submitted, send nothing.
//
// This step must never fail the deploy: every error path warns and exits 0.

const HOST = 'ugabuga.co.il'
const KEY = '007a3714d3febad2b7221e6efef5a862'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_PER_REQUEST = 10000 // IndexNow protocol limit

function parseSitemap(xml) {
  // Map of loc -> lastmod ('' when absent). Good enough for the flat sitemap this
  // site generates; not a general XML parser.
  const map = new Map()
  for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]*)<\/lastmod>)?/g)) {
    map.set(m[1].trim(), (m[2] || '').trim())
  }
  return map
}

async function main() {
  const newXml = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
  const next = parseSitemap(newXml)
  if (next.size === 0) {
    console.warn('indexnow: built sitemap parsed to 0 URLs — skipping (nothing to submit).')
    return
  }

  let toSubmit
  if (process.env.INDEXNOW_SUBMIT_ALL === '1') {
    toSubmit = [...next.keys()]
    console.log(`indexnow: SUBMIT_ALL mode — submitting all ${toSubmit.length} sitemap URLs.`)
  } else {
    const baselinePath = process.env.BASELINE_SITEMAP
    if (!baselinePath) {
      console.warn('indexnow: no BASELINE_SITEMAP provided — skipping.')
      return
    }
    let baseline
    try {
      baseline = parseSitemap(await readFile(baselinePath, 'utf8'))
    } catch (err) {
      console.warn(`indexnow: could not read baseline sitemap (${err.message}) — skipping.`)
      return
    }
    if (baseline.size === 0) {
      // A live sitemap that parsed to nothing usually means the snapshot fetch failed;
      // submitting "everything is new" off a bad baseline would spam Bing. Skip.
      console.warn('indexnow: baseline sitemap parsed to 0 URLs — skipping to avoid a false full submit.')
      return
    }
    toSubmit = [...next.entries()]
      .filter(([loc, lastmod]) => !baseline.has(loc) || baseline.get(loc) !== lastmod)
      .map(([loc]) => loc)
    console.log(`indexnow: ${toSubmit.length} new/changed URLs out of ${next.size} (baseline had ${baseline.size}).`)
  }

  if (toSubmit.length === 0) {
    console.log('indexnow: nothing new or changed — no submission needed.')
    return
  }
  if (process.env.INDEXNOW_DRY_RUN === '1') {
    console.log('indexnow: DRY RUN — would submit:')
    for (const u of toSubmit.slice(0, 50)) console.log('  ' + u)
    if (toSubmit.length > 50) console.log(`  … and ${toSubmit.length - 50} more`)
    return
  }

  for (let i = 0; i < toSubmit.length; i += MAX_PER_REQUEST) {
    const urlList = toSubmit.slice(i, i + MAX_PER_REQUEST)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
      })
      // 200 = OK, 202 = accepted (key not yet verified) — both fine.
      console.log(`indexnow: submitted ${urlList.length} URLs → HTTP ${res.status}${res.status === 202 ? ' (accepted, key pending verification)' : ''}`)
      if (res.status >= 400) console.warn(`indexnow: response body: ${await res.text()}`)
    } catch (err) {
      console.warn(`indexnow: submission failed (${err.message}) — continuing, deploy is unaffected.`)
    }
  }
}

main().catch(err => {
  console.warn(`indexnow: unexpected error (${err.message}) — deploy is unaffected.`)
})
