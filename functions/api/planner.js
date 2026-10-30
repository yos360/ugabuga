// /api/planner — the timetable planner in the cloud. A teacher asks for a sign-in link (sent with Resend,
// like the site's other mails); the link carries a signed token (the email + an HMAC with
// MAIL_SIGNING_SECRET), kept in the teacher's browser. With it the plan is read and saved through the
// planner_action RPC (migration 20261030180000, service role only). No passwords, no Supabase Auth mail
// limits. Daily caps per IP and per address keep the mail sending in check.
const SITE = 'https://ugabuga.co.il'
const encoder = new TextEncoder()
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('')
const hash = async text => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)))
const answer = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' } })
const configured = env => ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'MAIL_FROM', 'MAIL_SIGNING_SECRET'].every(k => Boolean(env[k]))
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date())
export const normalEmail = e => { const v = String(e || '').trim().toLowerCase(); return v.length <= 120 && /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/.test(v) ? v : null }

async function rpc(env, fn, action, p) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' }, body: JSON.stringify({ p_action: action, p }), signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error('service')
  return response.json()
}
async function sign(env, email) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.MAIL_SIGNING_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, encoder.encode(`planner:${email}`)))
}
const b64 = s => btoa(String.fromCharCode(...encoder.encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64 = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)))
export async function makeToken(env, email) { return `${b64(email)}.${await sign(env, email)}` }
export async function readToken(env, token) {
  const m = /^([A-Za-z0-9_-]{4,200})\.([a-f0-9]{64})$/.exec(String(token || ''))
  if (!m) return null
  let email; try { email = normalEmail(unb64(m[1])) } catch { return null }
  return email && (await sign(env, email)) === m[2] ? email : null
}

export function loginMail(link) {
  return { subject: 'הכניסה שלכם למערכת השעות של עוגה בוגה 🗓️', text: `שלום,\n\nזה הקישור שלכם למערכת השעות המתעדכנת:\n${link}\n\nלחצו עליו בכל מכשיר — מחשב בבית, מחשב בבית הספר או טלפון — והמערכת שלכם תופיע שם, עם כל הכיתות והשיעורים.\n\nשמרו את המייל הזה: הקישור משמש אתכם גם בפעם הבאה. אל תעבירו אותו לאחרים, כי מי שיש לו את הקישור יכול לראות ולשנות את המערכת שלכם.\n\nנעדכן אתכם במייל כשיש חידושים במערכת.\n\nעוגה בוגה · ${SITE}` }
}
async function send(env, to, { subject, text }, key) {
  const html = `<div dir="rtl" lang="he" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#243e40;line-height:1.8"><h1 style="font-size:22px">${subject}</h1><div style="white-space:pre-line">${text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/https:\/\/ugabuga\.co\.il\/planner#login=[\w.-]+/, l => `<a href="${l}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 22px;border-radius:14px;font-weight:bold;text-decoration:none">כניסה למערכת השעות שלי</a>`)}</div></div>`
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text, html }), signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error('mail')
}

export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url)
    if (request.method !== 'POST') return answer({ error: 'method_not_allowed' }, 405)
    if (!configured(env)) return answer({ error: 'השירות עדיין בהכנה.' }, 503)
    if (request.headers.get('Origin') !== url.origin) return answer({ error: 'not_allowed' }, 403)
    const raw = await request.text()
    if (raw.length > 150000) return answer({ error: 'request_too_large' }, 413)
    const data = JSON.parse(raw)
    if (data.action === 'login') {
      const email = normalEmail(data.email)
      if (!email) return answer({ error: 'בדקו את כתובת המייל.' }, 400)
      const ip = await hash(`${env.MAIL_SIGNING_SECRET}:${today()}:${request.headers.get('CF-Connecting-IP') || 'unknown'}`)
      if (!await rpc(env, 'mail_action', 'limit', { key: `planner-ip:${ip}`, max: 10 })) return answer({ error: 'יותר מדי ניסיונות היום. נסו שוב מחר.' }, 429)
      if (!await rpc(env, 'mail_action', 'limit', { key: `planner-mail:${await hash(email)}:${today()}`, max: 3 })) return answer({ error: 'כבר שלחנו לכתובת הזו קישור היום — בדקו גם בספאם.' }, 429)
      await rpc(env, 'planner_action', 'register', { email })
      const link = `${SITE}/planner#login=${await makeToken(env, email)}`
      await send(env, email, loginMail(link), `planner-login:${await hash(email)}:${today()}:${Date.now() >> 16}`)
      return answer({ ok: true })
    }
    const email = await readToken(env, data.token)
    if (!email) return answer({ error: 'הקישור אינו תקף. בקשו קישור חדש.' }, 401)
    if (data.action === 'get') return answer({ email, ...(await rpc(env, 'planner_action', 'get', { email }) || {}) })
    if (data.action === 'save') {
      const plan = data.plan
      if (!plan || typeof plan !== 'object' || !Array.isArray(plan.classes) || plan.classes.length > 40) return answer({ error: 'invalid_plan' }, 400)
      return answer(await rpc(env, 'planner_action', 'save', { email, plan }))
    }
    return answer({ error: 'invalid_action' }, 400)
  } catch {
    return answer({ error: 'השירות לא זמין כרגע. נסו שוב בעוד רגע.' }, 500)
  }
}
