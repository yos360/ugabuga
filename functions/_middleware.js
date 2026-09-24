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

function loadRoutes(env, url) {
  if (!routesPromise) {
    routesPromise = env.ASSETS.fetch(new URL('/routes.json', url))
      .then(r => (r.ok ? r.json() : null))
      .then(list => (Array.isArray(list) && list.length ? list.map(re => new RegExp(re)) : null))
      .catch(() => null)
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
  const remove = { element(el) { el.remove() } }
  return new HTMLRewriter()
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
}

export async function onRequest({ request, env, next }) {
  const res = await next()
  try {
    if (request.method !== 'GET' || res.status !== 200) return res
    if (!(res.headers.get('content-type') || '').includes('text/html')) return res
    const url = new URL(request.url)
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
    if (!routes.some(re => re.test(path))) return new Response(res.body, { status: 404, statusText: 'Not Found', headers: res.headers })
    if (path === '/') return res
    return neutralShell(res)
  } catch {
    return res
  }
}
