// Personal WhatsApp reminders for guests who haven't replied. The phone book lives only in the
// organizer's browser (localStorage), never in the event on the server.
import { formatDate } from './groupTools.js'

const norm = s => String(s || '').replace(/[‎‏"'׳״]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()

// "נועה כהן 050-1234567" / "0501234567 - יואב" → { 'נועה כהן': '972501234567', ... }
export function parsePhoneBook(text) {
  const book = {}
  for (const line of String(text || '').split('\n')) {
    const m = /(\+?\d[\d\s-]{7,16}\d)/.exec(line)
    if (!m) continue
    const phone = waNumber(m[1]), name = line.replace(m[1], '').replace(/[-–:,|]+/g, ' ').replace(/\s+/g, ' ').trim()
    if (phone && name) book[name] = phone
  }
  return book
}

// Israeli mobile (05X…) or an international number → digits for wa.me; null when it isn't one.
export function waNumber(raw) {
  let d = String(raw || '').replace(/[^\d+]/g, '')
  if (d.startsWith('+')) d = d.slice(1)
  else if (d.startsWith('00')) d = d.slice(2)
  else if (/^05\d{8}$/.test(d)) d = '972' + d.slice(1)
  else if (/^0\d{8,9}$/.test(d)) d = '972' + d.slice(1)
  return /^\d{10,15}$/.test(d) ? d : null
}

export const phoneFor = (book, name) => {
  const n = norm(name)
  const key = Object.keys(book).find(k => norm(k) === n) || Object.keys(book).find(k => norm(k).startsWith(n + ' ') || n.startsWith(norm(k) + ' '))
  return key ? book[key] : null
}

export function personalReminder(name, ev, link) {
  const first = String(name).trim().split(/\s+/)[0]
  const when = ev.date ? ` ב${formatDate(ev.date)}` : ''
  return `היי ${first}! 💌\nעוד לא קיבלנו ממך תשובה ל${ev.title || 'אירוע'}${when}.\nנשמח אם תאשרו הגעה בלחיצה כאן:\n${link}\nתודה!`
}

export const waLink = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`

const key = code => `rsvp-phones-${code}`
export const loadPhoneText = code => { try { return localStorage.getItem(key(code)) || '' } catch { return '' } }
export const savePhoneText = (code, text) => { try { localStorage.setItem(key(code), text) } catch { /* private mode: list just isn't kept */ } }
