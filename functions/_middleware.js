// Cloudflare Pages Function: turn "soft 404s" into real 404s.
//
// This is a single-page app, so Pages serves index.html (HTTP 200) for ANY path
// that has no static file — including nonsense like /asdfgh. The React 404 page
// renders fine, but search engines see a 200 and treat it as a thin duplicate.
// Here we compare the path against the route list generated at build time
// (public/routes.json, from src/App.jsx) and, when nothing matches, return the
// very same HTML with status 404. Everything else passes through untouched.
//
// Safety: any failure (missing routes.json, bad regex, thrown error) falls back
// to the original response, so this can never take the site down.

let routesPromise = null
let knownPromise = null

// Param routes whose full list of valid values is in the sitemap. A slug outside
// that list with no prerendered snapshot is a made-up URL → real 404.
const CLOSED_FAMILIES = [
  /^\/games\/(?!age\/)[^/]+$/,
  /^\/time-tunnel\/[^/]+$/,
  /^\/ideas\/themes\/[^/]+$/,
  /^\/ideas\/(?!age\/|themes\/)[^/]+$/,
  /^\/letters\/[^/]+$/,
  /^\/board-games\/[^/]+$/,
  /^\/printables\/(?!activity\/)[^/]+$/,
  /^\/gifts\/[^/]+$/,
  /^\/guides\/[^/]+$/,
  /^\/blog\/[^/]+$/,
  /^\/animals\/[^/]+$/,
  /^\/riddles\/[^/]+$/,
  /^\/jokes\/[^/]+$/,
  /^\/treasure-hunt\/[^/]+$/,
  /^\/abc\/[^/]+$/,
  /^\/trivia\/[^/]+$/,
  /^\/greetings\/[^/]+$/,
  /^\/questions\/[^/]+$/,
  /^\/tools\/dice\/[^/]+$/,
  /^\/dice-games\/[^/]+$/,
  /^\/tools\/escape-rooms\/[^/]+$/,
  /^\/tools\/escape-rooms\/topic\/[^/]+$/,
  /^\/faq\/[^/]+$/,
]

function loadKnown(env, url) {
  if (!knownPromise) {
    knownPromise = env.ASSETS.fetch(new URL('/known-paths.json', url))
      .then(r => (r.ok ? r.json() : null))
      .then(list => (Array.isArray(list) && list.length > 100 ? new Set(list) : null))
      .catch(() => null)
    knownPromise.then(set => { if (!set) knownPromise = null })
  }
  return knownPromise
}

function notFound(body, headers) {
  const h = new Headers(headers)
  h.set('X-Robots-Tag', 'noindex')
  h.set('Cache-Control', 'no-store')
  return new Response(body, { status: 404, statusText: 'Not Found', headers: h })
}

function loadRoutes(env, url) {
  if (!routesPromise) {
    routesPromise = env.ASSETS.fetch(new URL('/routes.json', url))
      .then(r => (r.ok ? r.json() : null))
      // React Router matches paths case-insensitively, so the 404 check must too.
      .then(list => (Array.isArray(list) && list.length ? list.map(re => new RegExp(re, 'i')) : null))
      .catch(() => null)
    // Don't keep a failed load for the life of the isolate — try again on the next request.
    routesPromise.then(list => { if (!list) routesPromise = null })
  }
  return routesPromise
}

// A real route that has no prerendered snapshot (a supplier card added after the
// last deploy, /games/age/7, ...) is answered by Pages with the homepage snapshot.
// Crawlers and WhatsApp/Facebook previews would then read the homepage's title,
// description, h1 and a canonical pointing at "/". When we detect that fallback,
// strip the homepage-specific tags and body so the page starts neutral; React
// fills in the right title, canonical and content as soon as it runs.
const HOME_CANONICAL = 'https://ugabuga.co.il/'
async function neutralShell(res) {
  const html = await res.text()
  const headers = new Headers(res.headers)
  const isHomeFallback = new RegExp(`rel="canonical"[^>]*href="${HOME_CANONICAL}"`).test(html)
  const plain = new Response(html, { status: res.status, statusText: res.statusText, headers })
  if (!isHomeFallback || typeof HTMLRewriter === 'undefined') return plain
  plain.__homeFallback = true
  const remove = { element(el) { el.remove() } }
  const out = new HTMLRewriter()
    .on('link[rel="canonical"]', remove)
    .on('meta[name="description"]', remove)
    .on('meta[property="og:title"]', remove)
    .on('meta[property="og:description"]', remove)
    .on('meta[property="og:url"]', remove)
    .on('meta[name="twitter:title"]', remove)
    .on('meta[name="twitter:description"]', remove)
    .on('script[type="application/ld+json"]', remove)
    .on('title', { element(el) { el.setInnerContent('עוגה בוגה') } })
    .on('#root', { element(el) { el.setInnerContent('') } })
    .transform(plain)
  out.__homeFallback = true
  return out
}

// Pages answers every file with "Access-Control-Allow-Origin: *". That's fine
// for public data and assets, but HTML pages have no reason to be readable
// cross-origin, so drop it there.
export async function onRequest(context) {
  // Last line of defence: whatever goes wrong below, answer with the plain static
  // file instead of letting the exception surface as a Cloudflare "Error 1101" page.
  let res
  try {
    res = await handle(context)
  } catch {
    return fallback(context)
  }
  try {
    if (!res.headers.has('Access-Control-Allow-Origin')) return res
    if (!(res.headers.get('content-type') || '').includes('text/html')) return res
    const h = new Headers(res.headers)
    h.delete('Access-Control-Allow-Origin')
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
  } catch {
    return res
  }
}

async function fallback({ request, env }) {
  try { return await env.ASSETS.fetch(request) } catch { return new Response('השרת עמוס לרגע — נסו לרענן את הדף.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '5', 'Cache-Control': 'no-store' } }) }
}

async function handle(context) {
  const { request, env, next } = context
  const res = await next()
  // Work on a clone: if anything below throws after reading the body, the
  // untouched original is still safe to return.
  if (request.method !== 'GET' || res.status !== 200) return res
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res
  let work
  try { work = res.clone() } catch { return res }
  try {
    const url = new URL(request.url)
    // App-only pages (search UI, supplier self-service): served as shells on
    // purpose, but they must not be indexed — they're linked from every page.
    const noindexPath = url.pathname.replace(/\/+$/, '') || '/'
    if (noindexPath === '/search' || noindexPath === '/suppliers/me' || noindexPath.startsWith('/suppliers/me/') ||
        noindexPath.startsWith('/l/') || noindexPath.startsWith('/q/')) {
      const h = new Headers(res.headers)
      h.append('X-Robots-Tag', 'noindex')
      return new Response(work.body, { status: res.status, statusText: res.statusText, headers: h })
    }
    // A missing file (JS/CSS/image...) must never be answered with the HTML shell.
    // /assets/* is cached for a year as "immutable", so a single HTML reply to a JS
    // URL (e.g. while a deploy is propagating) leaves that visitor's browser running
    // HTML as code: the site looks normal but nothing is clickable, until the cache
    // clears. A real, uncached 404 lets the browser simply try again next time.
    if (/\.[a-z0-9]{1,8}$/i.test(url.pathname)) {
      if (/\.html?$/i.test(url.pathname)) return res
      return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
    }
    const routes = await loadRoutes(env, url)
    if (!routes) return res
    const path = url.pathname.replace(/\/+$/, '') || '/'
    if (!routes.some(re => re.test(path))) return notFound(work.body, res.headers)
    if (path === '/') return res
    const shaped = await neutralShell(work)
    if (shaped.__homeFallback && CLOSED_FAMILIES.some(re => re.test(path))) {
      const known = await loadKnown(env, url)
      if (known && !known.has(path)) return notFound(shaped.body, shaped.headers)
    }
    return shaped
  } catch {
    return res
  }
}
