const required = (value, label) => {
  const s = String(value ?? '').trim()
  if (!s) throw new Error(`יש למלא ${label}.`)
  return s
}
function phone(value, international = false) {
  const s = required(value, 'מספר טלפון').replace(/[\s().-]/g, '')
  if (!(international ? /^\+?[1-9]\d{6,14}$/ : /^\+?\d{3,15}$/).test(s)) throw new Error(international ? 'הזינו מספר עם קידומת מדינה, למשל 972501234567, בלי האפס המקומי.' : 'יש להזין מספר טלפון תקין.')
  return international ? s.replace(/^\+/, '') : s
}
export const escapeWifi = value => String(value).replace(/[\\;:,"]/g, '\\$&')

export function qrPayload(type, fields) {
  switch (type) {
    case 'link': {
      const s = required(fields.link, 'קישור')
      let url
      try { url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`) } catch { throw new Error('יש להזין קישור תקין.') }
      if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password || /\s/.test(s) || (/^[a-z]+:/i.test(s) && !/^https?:/i.test(s))) throw new Error('יש להזין קישור http או https תקין.')
      return url.href
    }
    case 'text': required(fields.text, 'טקסט'); return String(fields.text)
    case 'whatsapp': return `https://wa.me/${phone(fields.phone, true)}${fields.message ? `?text=${encodeURIComponent(fields.message)}` : ''}`
    case 'wifi': {
      required(fields.ssid, 'שם רשת')
      const ssid = String(fields.ssid)
      const encryption = fields.encryption || 'WPA'
      if (!['WPA', 'WEP', 'nopass'].includes(encryption)) throw new Error('סוג הצפנה לא נתמך.')
      if (encryption !== 'nopass' && !fields.password) throw new Error('יש למלא סיסמת רשת.')
      return `WIFI:T:${encryption};S:${escapeWifi(ssid)};${encryption === 'nopass' ? '' : `P:${escapeWifi(fields.password)};`};`
    }
    case 'phone': return `tel:${phone(fields.phone)}`
    case 'email': {
      const email = required(fields.email, 'כתובת אימייל')
      if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) throw new Error('יש להזין כתובת אימייל תקינה.')
      return `mailto:${email}?subject=${encodeURIComponent(fields.subject || '')}&body=${encodeURIComponent(fields.message || '')}`
    }
    default: throw new Error('בחרו סוג קוד.')
  }
}

export function contrastOnWhite(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return 1
  const c = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
  return 1.05 / (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] + 0.05)
}
