// Messages that rotate on printed pages (next to the QR) and on the "ask us for a page" banner.
// QR variants: `g` = leads back to the printed page, `r` = leads to the page-request form (/request).
// Each print shows one variant; the owner report compares how often each was printed vs scanned.
// Ids are permanent — change the wording of a variant by adding a new id, so old prints still count.
export const QR_VARIANTS = [
  { id: 'g1', to: 'page', title: '🎂 עוגה בוגה — עוד מאות דפים כאלה, בחינם', line: 'סרקו לעוד דפים · או חפשו בגוגל „עוגה בוגה”' },
  { id: 'g2', to: 'page', title: '📱 סיימתם? סרקו ותקבלו עוד דף', line: 'דפי עבודה, צביעה ומשחקים בחינם · ugabuga.co.il' },
  { id: 'g3', to: 'page', title: 'הורים: הדף הזה הגיע מעוגה בוגה', line: 'סרקו לעוד דפים כאלה — בחינם ובלי הרשמה' },
  { id: 'g4', to: 'page', title: '🎁 בקשו מאבא או מאמא לסרוק', line: 'מחכים לכם עוד דפים ומשחקים · ugabuga.co.il' },
  { id: 'r1', to: 'request', title: '✨ חסר לכם דף? סרקו וספרו לנו', line: 'מכינים דפים לפי בקשה — בחינם · ugabuga.co.il' },
  { id: 'r2', to: 'request', title: 'גננות, מורות והורים: איזה דף להכין לכם?', line: 'סרקו ובקשו — אנחנו מכינים, בחינם' },
  { id: 'r3', to: 'request', title: '🎯 רוצים את הדף הזה בנושא אחר?', line: 'סרקו ובקשו — נכין לכם גרסה חדשה, בחינם' },
]
export const qrVariant = id => QR_VARIANTS.find(v => v.id === id)
export const pickQrVariant = (rand = Math.random()) => QR_VARIANTS[Math.floor(rand * QR_VARIANTS.length) % QR_VARIANTS.length]

// The link inside the QR. Request variants open the form with the printed page attached.
export function qrUrl(origin, pathname, variant) {
  const tag = `utm_source=qr&utm_medium=print&utm_content=${variant.id}`
  return variant.to === 'request' ? `${origin}/request?from=${encodeURIComponent(pathname)}&${tag}` : `${origin}${pathname}?${tag}`
}

// The on-site banner: one of these per page view.
export const REQUEST_BANNERS = [
  { title: 'חדש בעוגה בוגה: מבקשים — ואנחנו מכינים ✨', line: 'חסר לכם דף עבודה, חוברת או משחק? ספרו לנו, בחינם.' },
  { title: 'לא מצאתם בדיוק את הדף שחיפשתם?', line: 'ספרו לנו מה צריך — ואולי הוא יחכה לכם כאן בשבוע הבא.' },
  { title: 'גננות, מורות והורים: איזה דף חסר לכם?', line: 'כל שבוע אנחנו מכינים את מה שהכי מבקשים. בחינם.' },
]
export const pickBanner = (rand = Math.random()) => REQUEST_BANNERS[Math.floor(rand * REQUEST_BANNERS.length) % REQUEST_BANNERS.length]
