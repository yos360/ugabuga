// Short links printed inside the QR on every printed page: /p/<message id>/<page path>.
// A shorter link makes a sparser QR that home printers and PDFs keep scannable. The redirect adds
// the same campaign tags the long link carried (utm_source=qr, utm_content=<message id>), so
// Google Analytics and the owner report count the scan exactly as before.
import { qrUrl, qrVariant } from '../../src/data/printMessages.js'

export function shortTarget(origin, parts) {
  const [id = '', ...rest] = parts
  const path = `/${rest.join('/')}`
  const page = /^\/[a-z0-9/_-]{0,119}$/i.test(path) ? path.replace(/\/+$/, '') || '/' : '/'
  const variant = qrVariant(id.toLowerCase()) || qrVariant('g1')
  return qrUrl(origin, page, variant)
}

export function onRequest({ request, params }) {
  const url = new URL(request.url)
  const parts = [].concat(params.path || [])
  return new Response(null, { status: 302, headers: { Location: shortTarget(url.origin, parts), 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
}
