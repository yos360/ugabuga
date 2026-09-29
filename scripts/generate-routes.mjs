import { readFile, writeFile } from 'node:fs/promises'

// Writes public/routes.json: every React Router path in src/App.jsx as an anchored
// regex. functions/_middleware.js reads it at the edge so a URL that matches NO
// route (a typo, a dead link, a scraper guess) is served with a real HTTP 404
// instead of the SPA shell + 200 ("soft 404" in Search Console). Routes with
// params (/games/:slug) stay 200 — the app itself decides what to show there.

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const paths = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*')
const toRegex = p => '^' + p
  .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  .replace(/\/\*$/, '(/.*)?')
  .replace(/:[A-Za-z0-9_]+/g, '[^/]+')
  .replace(/\/$/, '') + '/?$'
const routes = [...new Set(paths.map(toRegex))]
if (routes.length < 10) throw new Error(`generate-routes: only ${routes.length} routes found in App.jsx — refusing to write a list that would 404 the site`)
await writeFile(new URL('../public/routes.json', import.meta.url), JSON.stringify(routes))
console.log(`generate-routes: wrote ${routes.length} route patterns to public/routes.json`)

// public/known-paths.json: every URL in the generated sitemap. For "closed" param
// families (/games/:slug, /time-tunnel/:day, /ideas/:slug ...) the full set of valid
// values is known at build time, so the middleware can 404 a made-up slug instead of
// answering it with an empty 200 shell. Only used together with the "no snapshot"
// check in functions/_middleware.js, so a real page is never 404'd by mistake.
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const known = [...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname.replace(/\/+$/, '') || '/'))]
if (known.length < 100) throw new Error(`generate-routes: sitemap has only ${known.length} URLs — refusing to write known-paths.json`)
await writeFile(new URL('../public/known-paths.json', import.meta.url), JSON.stringify(known))
console.log(`generate-routes: wrote ${known.length} known paths to public/known-paths.json`)
