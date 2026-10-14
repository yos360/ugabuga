// "What did they create?" — for the owner's report, the personal tools (invitations, greetings,
// bedtime stories, word puzzles, newspapers…) send the text a visitor printed, shared or copied.
// Phone numbers, e-mails and address lines are masked here AND again in the database function
// (supabase/migrations/202610130001_owner_creations.sql). Rows are owner-only and kept 90 days.
// Disclosed on /privacy and in a short note on each of these pages (CreationNotice).

// path → name shown in the report
export const CREATOR_TOOLS = {
  // /printables/name-labels is deliberately excluded: all label content stays local, including names.
  '/invitation': 'הזמנה ליום הולדת',
  '/greeting': 'מחולל ברכות',
  '/family/bedtime-story': 'סיפור לפני השינה',
  '/printables/birthday-newspaper': 'עיתון יום הולדת',
  '/printables/class-newspaper': 'עיתון כיתתי',
  '/tools/crossword-maker': 'מחולל תשבצים',
  '/tools/word-search-maker': 'מחולל תפזורות',
  '/tools/bingo-maker': 'מחולל בינגו',
  '/tools/scavenger-hunt-maker': 'מחולל ציד אוצרות',
  '/printables/roots-project': 'עבודת שורשים',
}
const clean = p => (String(p || '/').toLowerCase().split(/[?#]/)[0].replace(/\/+$/, '') || '/')
export const creatorTool = path => CREATOR_TOOLS[clean(path)] || null

// Masks contact details; keeps everything else as written.
export function maskPersonal(text) {
  return String(text || '')
    .replace(/[\w.%+-]+@[\w.-]+\.[a-z]{2,}/gi, '[מייל]')
    .replace(/\+?\d(?:[ ()\-–]{0,2}\d){8,}/g, '[מספר]') // 9+ digits: a phone, not a date or an age
    .replace(/(כתובת|רחוב|רח[׳']|שדרות|שד[׳']|📍)[^\n]*/g, '$1 [כתובת]')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
    .slice(0, 3000)
}

const URL = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const BOT = /bot|crawl|spider|headless|lighthouse|puppeteer|playwright|selenium/i
// the owner's own browser is never recorded (same rule as the activity log)
function ownerBrowser() {
  try { return localStorage.getItem('buga-owner-device') === '1' || !!localStorage.getItem('ugabuga-owner-auth') } catch { return false }
}
function visitorId() {
  try { const v = JSON.parse(localStorage.getItem('buga-live-browser') || 'null'); return v && v.expires > Date.now() ? v.id : null } catch { return null }
}
const recent = new Map()
export function recordCreation(action, content, path = location.pathname) {
  const tool = creatorTool(path)
  if (!tool || typeof window === 'undefined' || ownerBrowser() || navigator.webdriver || BOT.test(navigator.userAgent || '')) return
  const text = maskPersonal(content)
  if (text.length < 2) return
  const key = `${action}:${text.slice(0, 200)}`
  if (Date.now() - (recent.get(key) || 0) < 60000) return // the same thing twice in a minute counts once
  recent.set(key, Date.now())
  try {
    void fetch(`${URL}/rest/v1/rpc/record_creation`, { method: 'POST', keepalive: true, headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_tool: tool, p_action: action, p_content: text, p_path: clean(path), p_visitor: visitorId() }) }).catch(() => {})
  } catch { /* ignore */ }
}

// Text of what is about to be printed (the sheets in the print preview), without the QR badges.
export function sheetText(root) {
  if (!root) return ''
  const pages = [...root.querySelectorAll('.buga-a4, .buga-flow, article')]
  // innerText of the live page keeps the line breaks; the QR badge and footer text are taken out after
  const parts = (pages.length ? pages : [root]).map(p => {
    let t = p.innerText || p.textContent || ''
    p.querySelectorAll('.buga-qr, footer, button').forEach(x => { const s = x.innerText || x.textContent; if (s) t = t.replace(s, '') })
    return t
  })
  // a word-search or crossword grid is one letter per line — keep the words, not the grid
  const text = [...new Set(parts)].join('\n\n')
  return text.split('\n').reduce((out, line) => {
    const short = line.trim().length <= 2
    if (short && out.run >= 0) { out.run++; if (out.run === 6) out.lines.splice(out.lines.length - 5, 5, '[טבלת אותיות]'); else if (out.run < 6) out.lines.push(line) }
    else { out.run = short ? 1 : 0; out.lines.push(line) }
    return out
  }, { lines: [], run: 0 }).lines.join('\n')
}

// WhatsApp shares and "copy" buttons on these pages: catch the text on its way out, once, globally.
// /invitation records its own structured summary instead (its share text includes phone and place).
let installed = false
export function installCreationCapture() {
  if (installed || typeof window === 'undefined') return
  installed = true
  const open = window.open
  window.open = function (url, ...rest) {
    try {
      const u = String(url || '')
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(u) && creatorTool(location.pathname) && clean(location.pathname) !== '/invitation') {
        const text = new globalThis.URL(u).searchParams.get('text')
        // the site's own "share this page" buttons send a link, not something the visitor made
        if (text && !/utm_medium=share/.test(text)) recordCreation('share', text)
      }
    } catch { /* ignore */ }
    return open.call(this, url, ...rest)
  }
  const clip = navigator.clipboard
  if (clip?.writeText) {
    const write = clip.writeText.bind(clip)
    try {
      clip.writeText = text => { if (creatorTool(location.pathname) && clean(location.pathname) !== '/invitation' && !/utm_medium=share/.test(String(text))) recordCreation('copy', text); return write(text) }
    } catch { /* read-only in some browsers */ }
  }
}
