// The public post for a page made from a visitor's request (Facebook, the WhatsApp channel): the page's public
// title and link, said to be made on request — never the request text or who asked.
const SITE = 'https://ugabuga.co.il'

export function announceText(row) {
  const who = row.audience ? ` (${row.audience.split('·')[0].trim()})` : ''
  return `🎁 ביקשתם — הכנו!\n\n${row.public_title}\n${SITE}${row.result_path}\n\nהדף הזה נולד מבקשה שקיבלנו באתר${who}. ככה זה עובד אצלנו: מבקשים — ואנחנו מכינים, בחינם, לכולם.\n\nגם לכם חסר דף? כתבו לנו כאן: ${SITE}/request 💛`
}

// WhatsApp channel (owner's wording, 2026-10-31): only "asked — got it", no timing; posted with a screenshot of the page.
export function whatsappText(row) {
  return `🙋 ביקשו מאיתנו: ${row.public_title}\n🎁 וקיבלו: ${SITE}${row.result_path}`
}
