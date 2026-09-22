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
