// The short link inside printed QR codes: /p/<variant>/<page path>.
// Counts the scan here, before the redirect, so a phone that never finishes loading the page still
// counts. Nothing about the visitor is stored: only the variant and the printed page's path.
import { qrUrl, qrVariant } from '../../src/data/printMessages.js'
import { rpcInit, rpcUrl } from '../../src/utils/qrVariants.js'

const cleanPage = path => (/^\/[a-z0-9/_-]{0,119}$/i.test(path) ? path.replace(/\/+$/, '') || '/' : '/')

// Sheets with an offer carry a little address of their own (?s=123&l=2); nothing else passes.
const cleanQuery = search => (/^\?[a-z0-9=&_-]{1,60}$/i.test(search || '') ? search.slice(1) : '')

export function shortTarget(origin, parts, search = '') {
  const [id = '', ...rest] = parts
  const variant = qrVariant(id.toLowerCase()) || qrVariant('g1')
  // 'qr-link' tells the page that this visit was already counted (see noteQrScan).
  return qrUrl(origin, cleanPage(`/${rest.join('/')}`), variant, 'qr-link', cleanQuery(search))
}

// Link previews, crawlers and browsers fetching ahead are not people holding a phone over a sheet.
// (?<!cu)bot: "CUBOT" is a phone brand.
const NOT_A_PERSON = /(?<!cu)bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|curl|wget|python|httpclient|headless|lighthouse|monitor/i
export function countsAsScan(request) {
  const { method, headers } = request
  const ua = headers.get('user-agent') || ''
  // The owner's own phone (marked by liveActivity) is left out, like everywhere else in the stats.
  const owner = /(?:^|;\s*)buga-owner=1(?:;|$)/.test(headers.get('cookie') || '')
  return method === 'GET' && Boolean(ua) && !owner && !NOT_A_PERSON.test(ua) && !/prefetch|prerender/i.test(`${headers.get('sec-purpose') || ''} ${headers.get('purpose') || ''}`)
}

export function scanRecord(parts) {
  const [id = '', ...rest] = parts
  const variant = id.toLowerCase()
  if (!qrVariant(variant)) return null
  const page = cleanPage(`/${rest.join('/')}`)
  return { p_variant: variant, p_kind: 'scanned', p_path: page === page.toLowerCase() ? page : null }
}

export function onRequest({ request, params, waitUntil }) {
  const url = new URL(request.url)
  const parts = [].concat(params.path || [])
  const scan = countsAsScan(request) ? scanRecord(parts) : null
  // Never let counting delay or break the redirect.
  if (scan) waitUntil(fetch(rpcUrl('record_qr_variant'), rpcInit(scan)).catch(() => {}))
  return new Response(null, {
    status: 302,
    headers: { Location: shortTarget(url.origin, parts, url.search), 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  })
}
