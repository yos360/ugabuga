// Public, uncached supplier HTML for the edge middleware. Withdrawing a card
// must take effect on the next request, without waiting for another deployment.
import { supplierPageTitle } from '../src/data/supplierCategoryPages.js'

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export function supplierContent(s, path) {
  const title = supplierPageTitle(s)
  const description = (s.about || s.tagline || s.name).slice(0, 155)
  const canonical = 'https://ugabuga.co.il' + path
  return {
    title,
    head: `<meta name="description" content="${escape(description)}"><meta name="robots" content="index, follow"><link rel="canonical" href="${escape(canonical)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(canonical)}">`,
    body: `<main><nav aria-label="פירורי לחם"><a href="/suppliers">ספקים לימי הולדת</a></nav><h1>${escape(s.name)}</h1>${s.tagline ? `<p>${escape(s.tagline)}</p>` : ''}${s.area ? `<p>${escape(s.area)}</p>` : ''}${s.about ? `<h2>קצת עליי</h2><p style="white-space:pre-line">${escape(s.about)}</p>` : ''}</main>`,
  }
}

export async function supplierShell(response, url, env, fetcher = fetch) {
  const slug = url.pathname.split('/').at(-1)
  const endpoint = new URL('/rest/v1/rpc/supplier_public_get', env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co')
  endpoint.searchParams.set('p_slug', slug)
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'no-store')
  headers.delete('ETag')
  headers.delete('Last-Modified')
  headers.delete('Content-Length')
  let content, status = 200
  try {
    // This stable SQL function is read-only. No visitor credentials or tracking
    // calls are forwarded, and the public function exposes approved cards only.
    const result = await fetcher(endpoint, { method: 'GET', headers: { apikey: env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7' }, signal: AbortSignal.timeout(4000), cache: 'no-store' })
    if (!result.ok) throw new Error('Supplier unavailable')
    const supplier = await result.json()
    if (supplier === null) {
      status = 404
      content = { title: 'הספק לא נמצא | עוגה בוגה', head: '<meta name="robots" content="noindex">', body: '<main><h1>הספק לא נמצא</h1><p>הדף לא קיים או אינו מפורסם.</p><a href="/suppliers">לכל הספקים</a></main>' }
    } else {
      if (supplier.slug !== slug || typeof supplier.name !== 'string' || !supplier.name.trim()) throw new Error('Invalid supplier')
      content = supplierContent(supplier, url.pathname)
    }
  } catch {
    status = 503
    headers.set('Retry-After', '60')
    content = { title: 'טעינת ספק | עוגה בוגה', head: '<meta name="robots" content="noindex">', body: '<main><h1>לא הצלחנו לטעון את הספק כרגע</h1><p>נסו לרענן בעוד רגע.</p><a href="/suppliers">לכל הספקים</a></main>' }
  }
  if (status !== 200) headers.set('X-Robots-Tag', 'noindex')
  const remove = { element(el) { el.remove() } }
  return new HTMLRewriter()
    .on('meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], link[rel="alternate"], script[type="application/ld+json"]', remove)
    .on('title', { element(el) { el.setInnerContent(content.title) } })
    .on('head', { element(el) { el.append(content.head, { html: true }) } })
    .on('#root', { element(el) { el.setInnerContent(content.body, { html: true }) } })
    .transform(new Response(response.body, { status, headers }))
}
