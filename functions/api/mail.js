import { normalizeMail, MAIL_CONSENT_VERSION } from '../../src/utils/mailPreferences.js'
import { shabbatCity } from '../../src/data/shabbatCities.js'
import { shabbatForDate, formatTime, SHABBAT_NOTICE } from '../../src/utils/shabbatTimes.js'
import { israelToday } from '../../src/utils/parashaCalendar.js'
import { WEEKLY_MAIL, MAIL_OFFERS } from '../../src/data/weeklyMail.js'
import { announceText } from '../../src/utils/requestAnnounce.js'

const SITE = 'https://ugabuga.co.il'
const OWNER_HASH = 'd42cc7d2d976d54fa6d766d61033e18a27177a09e690039e1439dee73b0a47d6'
const encoder = new TextEncoder()
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('')
const hash = async text => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)))
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const answer = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' } })
const configured = env => env.MAIL_ENABLED === 'true' && ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'MAIL_FROM', 'MAIL_SIGNING_SECRET', 'MAIL_CRON_SECRET', 'MAIL_SENDER_DETAILS'].every(k => Boolean(env[k]))
async function manageToken(env, email) {
 const key = await crypto.subtle.importKey('raw', encoder.encode(env.MAIL_SIGNING_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
 return hex(await crypto.subtle.sign('HMAC', key, encoder.encode(`manage:${email}`)))
}
async function rpc(env, action, p = {}, fn = 'mail_action') {
 const key = env.SUPABASE_SERVICE_ROLE_KEY
 const response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`,{ method: 'POST', headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' }, body: JSON.stringify({ p_action: action, p }), signal: AbortSignal.timeout(15000) })
 if (!response.ok) { const d = await response.json().catch(() => ({})); throw new Error(d.message === 'invalid_link' ? 'הקישור אינו תקף או שפג תוקפו. בקשו קישור חדש.' : 'השירות לא זמין כרגע. נסו שוב מאוחר יותר.') }
 return response.json()
}
async function owner(env, request) {
 const authorization = request.headers.get('Authorization') || ''
 if (!/^Bearer [\w.-]+$/.test(authorization)) return false
 const result = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: authorization }, signal: AbortSignal.timeout(10000) })
 if (!result.ok) return false
 const user = await result.json()
 return Boolean(user.email_confirmed_at && await hash(String(user.email || '').trim().toLowerCase()) === OWNER_HASH)
}
// Explicit conservative pilot cap (MAIL_DAILY_LIMIT, retries included). Confirmations are
// triggered by anonymous visitors, so they get their own counter capped at 30% of the day;
// reminders keep the rest, and a burst of subscribe requests cannot block them.
export function mailQuota(limit, kind, day) {
 const total = Math.min(10000, Math.max(1, Number(limit) || 50))
 const confirm = Math.max(1, Math.floor(total * 0.3))
 return kind === 'confirm' ? { key: `confirm:${day}`, max: confirm } : { key: `send:${day}`, max: Math.max(1, total - confirm) }
}
async function send(env, email, subject, text, key, manage, kind = 'reminder') {
 text += `\n\n${env.MAIL_SENDER_DETAILS}`
 if (!await rpc(env, 'limit', mailQuota(env.MAIL_DAILY_LIMIT, kind, israelToday()))) throw new Error('מכסת המיילים להיום הסתיימה. נסו שוב מחר.')
 const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify({ from: env.MAIL_FROM, to: [email], subject, text,
  html: `<div dir="rtl" lang="he" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#243e40;line-height:1.8"><h1 style="font-size:24px">${escape(subject)}</h1><div style="white-space:pre-line">${escape(text).replace(/https:\/\/ugabuga\.co\.il\/[^\s<]*/g, link => `<a href="${link}" style="color:#245f62">${link.includes('mail-preferences') ? 'פתיחת הקישור האישי' : link === `${SITE}/request` ? 'לבקשת דף נוסף' : link === `${SITE}/whatsapp` ? 'להצטרפות לערוץ' : 'לפתיחת התוכן באתר'}</a>`)}</div></div>`,
  ...(manage ? { headers: { 'List-Unsubscribe': `<${SITE}/api/mail?unsubscribe=${manage}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } } : {}) }), signal: AbortSignal.timeout(20000) })
 if (!response.ok) throw new Error('שליחת המייל לא הושלמה. נסו שוב מאוחר יותר.')
 return response.json()
}
export function dueShabbat(preferences, now) {
 const city = shabbatCity(preferences.city)
 if (!city) return null
 const date = israelToday(now), row = shabbatForDate(city, date)
 const due = row.candles.getTime() - preferences.minutes * 60000
 // A delayed job may catch up before candles, never during/after Shabbat.
 return date === row.friday && now.getTime() >= due && now < row.candles ? { city, row } : null
}
const israelHour = now => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', hourCycle: 'h23' }).format(now))
export function weeklyWindow(now) {
 const date = israelToday(now), hour = israelHour(now)
 return new Date(`${date}T12:00:00Z`).getUTCDay() === 4 && hour >= 10 && hour < 14
}
// "Your page is ready": a visitor who left an email on /request gets one mail once the request is done
// (by the requests task or the owner). Daytime only; the public title, never the request text.
export const readyWindow = now => israelHour(now) >= 8 && israelHour(now) < 21
// Google review link for עוגה בוגה; the review line is left out of the mail until it is set.
export const GOOGLE_REVIEW_URL = ''
export function readyMail(row) {
 const review = GOOGLE_REVIEW_URL ? `אם אהבתם, נשמח מאוד להמלצה קצרה בגוגל:\n${GOOGLE_REVIEW_URL}\n\n` : ''
 return { subject: 'הדף שביקשתם מעוגה בוגה מוכן 🎂', text: `שלום,\n\nהדף שביקשתם מאיתנו מוכן, והוא כבר באתר, בחינם:\n${row.public_title}\n${SITE}${row.result_path}\n\nנשמח מאוד אם תשתפו אותו עם חברים, הורים ומורים. כך נוכל להמשיך להכין דפים בחינם.\n\nרוצים דף חדש כל יום? הצטרפו לערוץ הווטסאפ שלנו:\n${SITE}/whatsapp\n\n${review}תודה שכתבתם לנו! אם חסר עוד משהו, אפשר לבקש כאן:\n${SITE}/request\n\nעוגה בוגה · hellohugabuga@gmail.com` }
}
// The mail goes out only once the page is on the live site. Every path answers 200 (the app shows its own 404),
// so a status check proves nothing: the page counts as live once the deployed sitemaps list it — they ship in the
// same deploy as the page itself.
export const listedIn = (sitemaps, path) => sitemaps.some(s => s.includes(`<loc>${SITE}${path}</loc>`))
const liveSitemaps = () => Promise.all(['/sitemap-static.xml', '/sitemap.xml'].map(p =>
 fetch(`${SITE}${p}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) }).then(r => r.ok ? r.text() : '', () => '')))
// Facebook post for a request whose page is live: one every 30 minutes (page_request_mail 'announce_next'),
// only when FB_PAGE_ID and FB_PAGE_TOKEN are set. Says it was made on request, never quotes the visitor.
async function announce(env) {
 if (!env.FB_PAGE_ID || !env.FB_PAGE_TOKEN) return 0
 const row = await rpc(env, 'announce_next', {}, 'page_request_mail')
 if (!row || !await rpc(env, 'announce_claim', { id: row.id }, 'page_request_mail')) return 0
 const body = new URLSearchParams({ message: announceText(row), link: `${SITE}${row.result_path}`, access_token: env.FB_PAGE_TOKEN })
 const response = await fetch(`https://graph.facebook.com/v21.0/${env.FB_PAGE_ID}/feed`, { method: 'POST', body, signal: AbortSignal.timeout(20000) }).catch(() => null)
 if (!response?.ok) { await rpc(env, 'announce_release', { id: row.id }, 'page_request_mail').catch(() => {}); throw new Error('facebook') }
 return 1
}
async function readyMails(env, now) {
 let sent = 0, failed = 0
 // First mark pages live once the deployed sitemaps list them (any hour): the public list, the mail and the
 // Facebook post all wait for that mark, so nobody is sent to a page that is still deploying.
 const pending = await rpc(env, 'unverified', {}, 'page_request_mail').catch(() => null)
 if (pending?.length) {
  const sitemaps = await liveSitemaps()
  for (const row of pending) if (listedIn(sitemaps, row.result_path)) await rpc(env, 'live', { id: row.id }, 'page_request_mail').catch(() => {})
 }
 if (!readyWindow(now)) return { sent, failed }
 await announce(env).catch(() => { failed++ })
 // A failure here must not hold back the Shabbat/weekly mails below.
 const rows = await rpc(env, 'due', {}, 'page_request_mail').catch(() => null)
 if (!rows) return { sent, failed: failed + 1 }
 for (const row of rows) {
  try {
   if (!await rpc(env, 'claim', { id: row.id }, 'page_request_mail')) continue
   const { subject, text } = readyMail(row)
   await send(env, row.email, subject, text, `page-ready:${row.id}`, null); sent++
  } catch { failed++; await rpc(env, 'release', { id: row.id }, 'page_request_mail').catch(() => {}) }
 }
 return { sent, failed }
}
async function dispatch(env, after) {
 const now = new Date(), date = israelToday(now), weekly = weeklyWindow(now)
 const friday = new Date(`${date}T12:00:00Z`).getUTCDay() === 5
 const ready = after ? { sent: 0, failed: 0 } : await readyMails(env, now)
 if (!weekly && !friday) return { ...ready, next: null }
 const rows = await rpc(env, 'recipients', { after: after || null, kind: friday ? 'shabbat' : 'weekly', campaign: `${friday ? 'shabbat' : 'weekly'}:${date}` })
 let { sent, failed } = ready
 for (const r of rows) {
  const token = await manageToken(env, r.email), manage = `${SITE}/mail-preferences#manage=${token}`
  let subject, text, campaign, kind
  const due = r.shabbat && dueShabbat(r, now)
  if (due) {
   const { city, row } = due
   kind = 'shabbat'; campaign = `shabbat:${row.friday}`
   subject = `שבת שלום! כניסת שבת ב${city.name}: ${formatTime(row.candles)}`
   text = `הדלקת נרות: ${formatTime(row.candles)}\nצאת שבת: ${formatTime(row.end)}\n${row.reading.name}\n${city.offset} דקות לפני השקיעה · שעון ישראל\n${row.candleNote}\n${row.endNote}\n${SHABBAT_NOTICE}\n\nלזמני השבת: ${SITE}/shabbat-times/${city.slug}\n\nשינוי העדפות או הסרה:\n${manage}`
  } else if (weekly && (r.weekly || r.marketing)) {
   const index = Math.floor(Date.parse(`${date}T12:00:00Z`) / (7 * 86400000)) % WEEKLY_MAIL.length
   const offers = r.marketing ? MAIL_OFFERS.slice(0, 1) : []
   const items = [...(r.weekly ? WEEKLY_MAIL[index].slice(0, 3 - offers.length) : []), ...offers]
   if (!items.length) continue
   kind = 'weekly'; campaign = `weekly:${date}`
   subject = `${offers.length ? 'פרסומת | ' : ''}רעיונות לשבוע מעוגה בוגה`
   text = `קצת השראה לשבוע שלכם:\n\n${items.map(x => `${x.title}\n${SITE}${x.path}`).join('\n\n')}\n\nעוגה בוגה · hellohugabuga@gmail.com\nשינוי העדפות או הסרה:\n${manage}`
  } else continue
  try {
   if (!await rpc(env, 'claim', { id: r.id, campaign, kind })) continue
   // Re-read after claiming: an unsubscribe/update must take effect before send.
   const current = await rpc(env, 'get', { hash: await hash(token) })
   if (JSON.stringify([r.shabbat,r.weekly,r.marketing,r.city,r.minutes]) !== JSON.stringify([current.shabbat,current.weekly,current.marketing,current.city,current.minutes])) continue
   await send(env, r.email, subject, text, `${r.id}:${campaign}`, token)
   await rpc(env, 'sent', { id: r.id, campaign }); sent++
  } catch { failed++ }
 }
 return { sent, failed, next: rows.length === 5 ? rows.at(-1).id : null }
}
export async function onRequest({ request, env }) {
 try {
  const url = new URL(request.url)
  if (request.method !== 'POST') return answer({ error: 'method_not_allowed' }, 405)
  if (!configured(env)) return answer({ ready: false, error: 'ההרשמה עדיין בהכנה. לא נשמרו פרטים.' }, 503)
  // RFC 8058 one-click POST. A GET by a mail scanner does not unsubscribe.
  if (url.searchParams.has('unsubscribe')) {
   const token = url.searchParams.get('unsubscribe')
   if (!/^[a-f0-9]{64}$/.test(token)) return answer({ error: 'invalid_link' }, 400)
   const digest = await hash(token), current = await rpc(env, 'get', { hash: digest })
   await rpc(env, 'update', { hash: digest, preferences: { ...current, shabbat: false, weekly: false, marketing: false, consent_version: MAIL_CONSENT_VERSION } })
   return answer({ ok: true })
  }
  const reader = request.body?.getReader(); let raw = '', bytes = 0
  if (!reader) return answer({ error: 'invalid_request' }, 400)
  const decoder = new TextDecoder()
  while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 4096) { await reader.cancel(); return answer({ error: 'request_too_large' }, 413) } raw += decoder.decode(value, { stream: true }) }
  const data = JSON.parse(raw + decoder.decode()), action = data.action
  if (action === 'dispatch' || action === 'cleanup') {
   if (request.headers.get('Authorization') !== `Bearer ${env.MAIL_CRON_SECRET}`) return answer({ error: 'not_allowed' }, 403)
   return answer(action === 'cleanup' ? await rpc(env, 'cleanup') : await dispatch(env, data.after))
  }
  if (request.headers.get('Origin') !== url.origin) return answer({ error: 'not_allowed' }, 403)
  if (action === 'health') { await rpc(env, 'counts'); return answer({ ready: true }) }
  if (action === 'counts' || action === 'list') {
   if (!await owner(env, request)) return answer({ error: 'not_allowed' }, 403)
   return answer(await rpc(env, action, { filter: ['all','shabbat','weekly','marketing'].includes(data.filter) ? data.filter : 'all', offset: Math.max(0, Math.min(100000, Number(data.offset) || 0)) }))
  }
  const ip = await hash(`${env.MAIL_SIGNING_SECRET}:${israelToday()}:${request.headers.get('CF-Connecting-IP') || 'unknown'}`)
  if (!await rpc(env, 'limit', { key: `request:${ip}`, max: 60 })) return answer({ error: 'יותר מדי ניסיונות. נסו שוב מאוחר יותר.' }, 429)
  if (action === 'subscribe') {
   const preferences = normalizeMail(data.preferences || {})
   if (!shabbatCity(preferences.city)) return answer({ error: 'בחרו עיר מהרשימה.' }, 400)
   const token = hex(crypto.getRandomValues(new Uint8Array(32)))
   const result = await rpc(env, 'request', { email: preferences.email, preferences, confirm_hash: await hash(token), manage_hash: await hash(await manageToken(env, preferences.email)) })
   if (result.send) await send(env, preferences.email, 'אישור ההרשמה לעוגה בוגה', `ביקשתם להירשם למיילים מעוגה בוגה.\n\n${preferences.shabbat ? `תזכורת שבת: ${shabbatCity(preferences.city).name}, ${preferences.minutes} דקות לפני כניסת שבת.\n` : ''}${preferences.weekly ? 'תוכן שבועי: כן.\n' : ''}${preferences.marketing ? 'הצעות ופרסומות: כן.\n' : ''}\nלאישור ההרשמה (בתוקף ל־24 שעות):\n${SITE}/mail-preferences#confirm=${token}\n\nאם לא ביקשתם להירשם, התעלמו מההודעה. לא נרשום אתכם ללא אישור.`, `confirm:${token}`, null, 'confirm')
   return answer({ ok: true })
  }
  if (!/^[a-f0-9]{64}$/.test(data.token || '')) return answer({ error: 'הקישור אינו תקף.' }, 400)
  if (action === 'confirm') { const r = await rpc(env, 'confirm', { hash: await hash(data.token) }); return answer({ token: await manageToken(env, r.email) }) }
  if (action === 'get' || action === 'update') {
   const digest = await hash(data.token), current = await rpc(env, 'get', { hash: digest })
   if (action === 'get') return answer(current)
   const input = { ...data.preferences, email: current.email }
   // All unchecked is an explicit unsubscribe; validate remaining fields using a temporary choice.
   const allOff = !input.shabbat && !input.weekly && !input.marketing
   const preferences = normalizeMail(allOff ? { ...input, weekly: true } : input)
   if (allOff) preferences.weekly = false
   if (!shabbatCity(preferences.city)) return answer({ error: 'בחרו עיר מהרשימה.' }, 400)
   await rpc(env, 'update', { hash: digest, preferences }); return answer({ ok: true })
  }
  return answer({ error: 'invalid_action' }, 400)
 } catch (e) { return answer({ error: e instanceof SyntaxError ? 'invalid_request' : e.message || 'השירות לא זמין כרגע.' }, 400) }
}
