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
export const qrVariant = id => QR_VARIANTS.find(v => v.id === id) || RETIRED_VARIANTS.find(v => v.id === id)
export const pickQrVariant = (rand = Math.random()) => QR_VARIANTS[Math.floor(rand * QR_VARIANTS.length) % QR_VARIANTS.length]

// The link inside the QR. Request variants open the form with the printed page attached.
export function qrUrl(origin, pathname, variant) {
  const tag = `utm_source=qr&utm_medium=print&utm_content=${variant.id}`
  if (variant.to === 'channel') return `${origin}/whatsapp?${tag}`
  return variant.to === 'request' ? `${origin}/request?from=${encodeURIComponent(pathname)}&${tag}` : `${origin}${pathname}?${tag}`
}

// What the QR itself holds: a short link (/p/<id>/<path>) that functions/p/[[path]].js redirects
// to qrUrl(). Half the characters of the long link, so the printed QR is about half as dense.
export function qrShortUrl(origin, pathname, variant) {
  if (variant.to === 'channel') return `${origin}/p/${variant.id}`
  return /^\/[a-z0-9/_-]{0,119}$/i.test(pathname) ? `${origin}/p/${variant.id}${pathname === '/' ? '' : pathname}` : qrUrl(origin, pathname, variant)
}

// The on-site banner: one of these per page view.
export const REQUEST_BANNERS = [
  { title: 'חדש בעוגה בוגה: מבקשים — ואנחנו מכינים ✨', line: 'חסר לכם דף עבודה, חוברת או משחק? ספרו לנו, בחינם.' },
  { title: 'לא מצאתם בדיוק את הדף שחיפשתם?', line: 'ספרו לנו מה צריך — ואולי הוא יחכה לכם כאן בשבוע הבא.' },
  { title: 'גננות, מורות והורים: איזה דף חסר לכם?', line: 'כל שבוע אנחנו מכינים את מה שהכי מבקשים. בחינם.' },
]
export const pickBanner = (rand = Math.random()) => REQUEST_BANNERS[Math.floor(rand * REQUEST_BANNERS.length) % REQUEST_BANNERS.length]
