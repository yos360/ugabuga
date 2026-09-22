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

export async function onRequest({ request, env, next }) {
  const res = await next()
  try {
    if (request.method !== 'GET' || res.status !== 200) return res
    if (!(res.headers.get('content-type') || '').includes('text/html')) return res
    const url = new URL(request.url)
    if (/\.[a-z0-9]{1,8}$/i.test(url.pathname)) return res
    const routes = await loadRoutes(env, url)
    if (!routes) return res
    const path = url.pathname.replace(/\/+$/, '') || '/'
    if (routes.some(re => re.test(path))) return res
    return new Response(res.body, { status: 404, statusText: 'Not Found', headers: res.headers })
  } catch {
    return res
  }
}
