// QR code as an <img>-ready data URI (the qrcode library loads only when a page asks for one; results are cached).
const cache = new Map()
export function qrDataUri(url) {
  if (!cache.has(url)) {
    cache.set(url, import('qrcode')
      .then(({ default: QRCode }) => QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#181828', light: '#ffffff' } }))
      .then(svg => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`)
      .catch(() => ''))
  }
  return cache.get(url)
}
