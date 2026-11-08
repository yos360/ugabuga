// Messages that rotate on printed pages (next to the QR) and on the "ask us for a page" banner.
// QR variants: `g` = leads back to the printed page, `r` = leads to the page-request form (/request),
// `w` = leads to the WhatsApp channel's landing page (/whatsapp).
// Each print shows one variant; the owner report compares how often each was printed vs scanned.
// Ids are permanent — change the wording of a variant by adding a new id, so old prints still count.
// In rotation since 2026-10-30: the earlier nine (below) got about 7 scans in 1,560 printed sheets.
// Each one gives a reason to pick up the phone, and all lead back to the printed page.
export const QR_VARIANTS = [
  { id: 'g5', to: 'page', title: '🖨️ צריכים עוד עותק? סרקו והדפיסו שוב', line: 'הדף מחכה לכם באתר — בחינם · ugabuga.co.il' },
  { id: 'g6', to: 'page', title: '📚 אהבתם את הדף? סרקו לעוד דפים באותו נושא', line: 'בחינם ובלי הרשמה · עוגה בוגה' },
  { id: 'g7', to: 'page', title: '👩‍🏫 מורות, גננות והורים: הדף הבא כבר מוכן', line: 'סרקו ובחרו — דפי עבודה, צביעה ומשחקים בחינם' },
  { id: 'g8', to: 'page', title: '⏭️ סיימתם? סרקו לדף הבא', line: 'עוד מאות דפים בחינם · ugabuga.co.il' },
]
// Retired messages: no longer printed, kept so sheets already out there still resolve and count.
const RETIRED_VARIANTS = [
  { id: 'g1', to: 'page', title: '🎂 עוגה בוגה — עוד מאות דפים כאלה, בחינם', line: 'סרקו לעוד דפים · או חפשו בגוגל „עוגה בוגה”' },
  { id: 'g2', to: 'page', title: '📱 סיימתם? סרקו ותקבלו עוד דף', line: 'דפי עבודה, צביעה ומשחקים בחינם · ugabuga.co.il' },
  { id: 'g3', to: 'page', title: 'הורים: הדף הזה הגיע מעוגה בוגה', line: 'סרקו לעוד דפים כאלה — בחינם ובלי הרשמה' },
  { id: 'g4', to: 'page', title: '🎁 בקשו מאבא או מאמא לסרוק', line: 'מחכים לכם עוד דפים ומשחקים · ugabuga.co.il' },
  { id: 'r1', to: 'request', title: '✨ חסר לכם דף? סרקו וספרו לנו', line: 'מכינים דפים לפי בקשה — בחינם · ugabuga.co.il' },
  { id: 'r2', to: 'request', title: 'גננות, מורות והורים: איזה דף להכין לכם?', line: 'סרקו ובקשו — אנחנו מכינים, בחינם' },
  { id: 'w1', to: 'channel', title: '📲 דף חדש כל יום — בוואטסאפ', line: 'סרקו והצטרפו לערוץ · בחינם · ugabuga.co.il' },
  { id: 'w2', to: 'channel', title: 'הורים וגננות: דף חדש כל בוקר', line: 'סרקו והצטרפו לערוץ הוואטסאפ — בחינם' },
  { id: 'r3', to: 'request', title: '🎯 רוצים את הדף הזה בנושא אחר?', line: 'סרקו ובקשו — נכין לכם גרסה חדשה, בחינם' },
]
// A sheet can offer something real for the scan: the answers to that very sheet, or the next page of
// its series. Half of the prints show the offer (`fresh`, a QR that carries the sheet's own address),
// the other half the plain "next page" line and the plain link back (`control`), so each pair measures
// one thing. Only sheets marked with qrOffer() below get these: never promise answers anywhere else.
const control = id => ({ id, to: 'page', title: '⏭️ סיימתם? סרקו לדף הבא', line: 'עוד מאות דפים בחינם · ugabuga.co.il' })
const fresh = (id, title, line, show = 'answers') => ({ id, to: 'page', show, carry: true, title, line })
export const QR_OFFERS = {
  reading: { label: 'הבנת הנקרא', fresh: fresh('a1', '✅ סיימתם? סרקו לתשובות של הדף הזה', 'בודקים לבד בטלפון · בחינם · ugabuga.co.il'), control: control('c1') },
  gifted: { label: 'מחוננים', fresh: fresh('a2', '💡 סרקו לתשובות והסברים של הדף הזה', 'לכל שאלה הסבר קצר · בחינם · ugabuga.co.il'), control: control('c2') },
  math: { label: 'חשבון', fresh: fresh('a3', '✅ סיימתם? סרקו לפתרון של הדף הזה', 'בודקים לבד בטלפון · בחינם · ugabuga.co.il'), control: control('c3') },
  color: { label: 'צביעה לפי מספרים', fresh: fresh('a4', '🎨 סיימתם? סרקו וראו את הציור הגמור', 'בודקים בטלפון · בחינם · ugabuga.co.il'), control: control('c4') },
  series: { label: 'דפים בסדרה', fresh: fresh('a5', '🖍️ אהבתם? סרקו לדף הבא בסדרה', 'הדף הבא מחכה לכם · בחינם · ugabuga.co.il', null), control: control('c5') },
  coloring: { label: 'דפי צביעה', fresh: fresh('a6', '🎨 סיימתם? סרקו וצבעו את הציור הזה גם בטלפון', 'צובעים באצבע · בחינם · ugabuga.co.il', 'color'), control: control('c6') },
}
const OFFER_VARIANTS = Object.values(QR_OFFERS).flatMap(o => [o.fresh, o.control])
export const qrVariant = id => QR_VARIANTS.find(v => v.id === id) || RETIRED_VARIANTS.find(v => v.id === id) || OFFER_VARIANTS.find(v => v.id === id)
export const pickQrVariant = (rand = Math.random()) => QR_VARIANTS[Math.floor(rand * QR_VARIANTS.length) % QR_VARIANTS.length]

// The link inside the QR. Request variants open the form with the printed page attached.
export function qrUrl(origin, pathname, variant, medium = 'print', query = '') {
  const tag = `utm_source=qr&utm_medium=${medium}&utm_content=${variant.id}`
  if (variant.to === 'channel') return `${origin}/whatsapp?${tag}`
  const extra = [variant.show && `show=${variant.show}`, variant.carry && query, tag].filter(Boolean).join('&')
  return variant.to === 'request' ? `${origin}/request?from=${encodeURIComponent(pathname)}&${tag}` : `${origin}${pathname}?${extra}`
}

// What the QR itself holds: a short link (/p/<id>/<path>) that functions/p/[[path]].js redirects
// to qrUrl(). Half the characters of the long link, so the printed QR is about half as dense.
export function qrShortUrl(origin, pathname, variant, query = '') {
  if (variant.to === 'channel') return `${origin}/p/${variant.id}`
  const tail = variant.carry && query ? `?${query}` : ''
  return /^\/[a-z0-9/_-]{0,119}$/i.test(pathname) ? `${origin}/p/${variant.id}${pathname === '/' ? '' : pathname}${tail}` : qrUrl(origin, pathname, variant, 'print', query)
}

// What a sheet says about itself, on its .buga-a4/.buga-flow element: which offer, and where that very
// sheet lives (it may be one of many printed from a grade page, or generated from a seed).
export const qrOffer = (kind, path, query = '') => ({ 'data-qr-offer': kind, 'data-qr-path': path, 'data-qr-query': query || undefined })

// The message and link for one printed sheet. `arm` is drawn once per print.
export function qrForSheet(dataset, arm, fallback, origin, pathname) {
  const offer = QR_OFFERS[dataset.qrOffer]
  if (!offer) return { variant: fallback, url: qrShortUrl(origin, pathname, fallback) }
  if (arm !== 'fresh') return { variant: offer.control, url: qrShortUrl(origin, pathname, offer.control) }
  return { variant: offer.fresh, url: qrShortUrl(origin, dataset.qrPath || pathname, offer.fresh, dataset.qrQuery) }
}

// The on-site banner: one of these per page view.
export const REQUEST_BANNERS = [
  { title: 'חדש בעוגה בוגה: מבקשים — ואנחנו מכינים ✨', line: 'חסר לכם דף עבודה, חוברת או משחק? ספרו לנו, בחינם.' },
  { title: 'לא מצאתם בדיוק את הדף שחיפשתם?', line: 'ספרו לנו מה צריך — ואולי הוא יחכה לכם כאן בשבוע הבא.' },
  { title: 'גננות, מורות והורים: איזה דף חסר לכם?', line: 'כל שבוע אנחנו מכינים את מה שהכי מבקשים. בחינם.' },
]
export const pickBanner = (rand = Math.random()) => REQUEST_BANNERS[Math.floor(rand * REQUEST_BANNERS.length) % REQUEST_BANNERS.length]
