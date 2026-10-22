// Pure logic for the WhatsApp group tools (RSVP, secret-friend draw, thank-you wall).
// No React and no Supabase here, so tests/group-tools.test.mjs can run it in Node.

// ── text & validation ─────────────────────────────────────────
export const LIMITS = { name: 30, guestName: 40, title: 80, place: 100, note: 300, allergies: 200, pickup: 60, message: 400, teacher: 40, minPeople: 3, maxPeople: 60, maxInvitees: 80 }

// Trim, drop control characters, collapse inner spaces, cut to max.
export function cleanText(value, max, multiline = false) {
  let s = String(value ?? '')
  s = multiline
    ? s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') // eslint-disable-line no-control-regex
    : s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ') // eslint-disable-line no-control-regex
  return s.trim().slice(0, max).trim()
}
export const cleanName = (value, max = LIMITS.name) => cleanText(value, max)
// Same rule as gt_no_links() in the migration: no links on shared pages.
// Same rules as the database triggers (supabase/migrations/202610220001_content_filter.sql).
import { hasLink, hasPhone, isInappropriate, FILTER_MESSAGES } from './contentFilter.js'
export { hasLink }
export const normName = s => cleanName(s).toLowerCase().replace(/["'׳״`]/g, '')

// One name per line (or comma separated) → clean list, duplicates removed (first wins).
export function parseNames(text, max = LIMITS.maxPeople) {
  const seen = new Set(), out = []
  for (const raw of String(text || '').split(/[\n,،;]+/)) {
    const n = cleanName(raw.replace(/^\s*\d+[.)-]\s*/, ''))
    if (!n || seen.has(normName(n))) continue
    seen.add(normName(n)); out.push(n)
    if (out.length >= max + 1) break // one extra so validation can say "too many"
  }
  return out
}

// Names for a draw: returns { ok, error } with a Hebrew message.
export function validateDrawNames(names) {
  if (names.length < LIMITS.minPeople) return { ok: false, error: `צריך לפחות ${LIMITS.minPeople} משתתפים.` }
  if (names.length > LIMITS.maxPeople) return { ok: false, error: `אפשר עד ${LIMITS.maxPeople} משתתפים בהגרלה אחת.` }
  const seen = new Set()
  for (const n of names) {
    if (!n) return { ok: false, error: 'יש שם ריק ברשימה.' }
    if (hasLink(n)) return { ok: false, error: 'שם לא יכול להכיל קישור.' }
    if (isInappropriate(n)) return { ok: false, error: FILTER_MESSAGES.inappropriate }
    if (seen.has(normName(n))) return { ok: false, error: `השם "${n}" מופיע פעמיים. הוסיפו אות משם המשפחה (למשל: נועה כ.).` }
    seen.add(normName(n))
  }
  return { ok: true, error: '' }
}

export function validateRsvpAnswer(a) {
  const name = cleanName(a.name, LIMITS.guestName)
  if (!name) return { ok: false, error: 'כתבו שם (של הילד/ה או של המשפחה).' }
  if (!['yes', 'no', 'maybe'].includes(a.status)) return { ok: false, error: 'בחרו: מגיעים, לא מגיעים או אולי.' }
  for (const k of ['kids', 'adults']) {
    const v = Number(a[k] ?? 0)
    if (!Number.isInteger(v) || v < 0 || v > 20) return { ok: false, error: 'מספר המשתתפים צריך להיות בין 0 ל-20.' }
  }
  if (a.status !== 'no' && Number(a.kids || 0) + Number(a.adults || 0) === 0) return { ok: false, error: 'כמה מגיעים? סמנו לפחות משתתף אחד.' }
  if ([a.name, a.allergies, a.pickup, a.note].some(hasLink)) return { ok: false, error: 'אי אפשר לכתוב קישורים בתשובה.' }
  if ([a.name, a.allergies, a.pickup, a.note].some(isInappropriate)) return { ok: false, error: FILTER_MESSAGES.inappropriate }
  return { ok: true, error: '' }
}

export function validateWallNote({ child, message }) {
  if (!cleanName(child)) return { ok: false, error: 'כתבו את שם הילד/ה.' }
  const m = cleanText(message, LIMITS.message, true)
  if (m.length < 2) return { ok: false, error: 'כתבו ברכה קצרה.' }
  if (hasLink(child) || hasLink(message)) return { ok: false, error: FILTER_MESSAGES.no_links }
  if (isInappropriate(child) || isInappropriate(message)) return { ok: false, error: FILTER_MESSAGES.inappropriate }
  if (hasPhone(child) || hasPhone(message)) return { ok: false, error: FILTER_MESSAGES.no_contact }
  return { ok: true, error: '' }
}

// ── secret friend draw ────────────────────────────────────────
// exclusions: [[a, b], ...] (indexes), symmetric — a doesn't give to b and b doesn't give to a.
const exclusionSet = (n, exclusions = []) => {
  const s = new Set()
  for (const [a, b] of exclusions) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a === b || a < 0 || b < 0 || a >= n || b >= n) continue
    s.add(`${a}:${b}`); s.add(`${b}:${a}`)
  }
  return s
}
const shuffled = (n, rng) => {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
export const isValidDraw = (targets, exclusions = []) => {
  const n = targets.length, ex = exclusionSet(n, exclusions)
  return new Set(targets).size === n && targets.every((t, i) => Number.isInteger(t) && t >= 0 && t < n && t !== i && !ex.has(`${i}:${t}`))
}

// Exhaustive check (backtracking), used to give a clear message before drawing and as the last resort.
function backtrack(n, ex, rng) {
  const order = shuffled(n, rng), used = new Array(n).fill(false), t = new Array(n).fill(-1)
  const options = i => shuffled(n, rng).filter(j => j !== i && !used[j] && !ex.has(`${i}:${j}`))
  // Most constrained giver first.
  order.sort((a, b) => [...ex].filter(k => k.startsWith(`${b}:`)).length - [...ex].filter(k => k.startsWith(`${a}:`)).length)
  let steps = 0
  const go = k => {
    if (k === n) return true
    if (++steps > 200000) return false
    const i = order[k]
    for (const j of options(i)) { used[j] = true; t[i] = j; if (go(k + 1)) return true; used[j] = false; t[i] = -1 }
    return false
  }
  return go(0) ? t : null
}

// Same strategy as secret_assign() in the migration: prefer one big circle (no A↔B swaps),
// then any random valid permutation, then a full search. Returns targets[i] = whom i gives to, or null.
export function drawPairs(n, exclusions = [], rng = Math.random) {
  if (n < 2) return null
  const ex = exclusionSet(n, exclusions)
  const ok = t => t.every((x, i) => x !== i && !ex.has(`${i}:${x}`))
  for (let tries = 0; tries < 400; tries++) {
    const order = shuffled(n, rng), t = new Array(n)
    for (let k = 0; k < n; k++) t[order[k]] = order[(k + 1) % n]
    if (ok(t)) return t
  }
  for (let tries = 0; tries < 800; tries++) { const t = shuffled(n, rng); if (ok(t)) return t }
  return backtrack(n, ex, rng)
}
export const canDraw = (n, exclusions = []) => n >= 2 && backtrack(n, exclusionSet(n, exclusions), Math.random) !== null

export const DRAW_MODES = {
  gamad: { label: 'גמד וענק', emoji: '🧙', giver: 'הגמד/ה', verb: 'אתם הגמד/ה של', task: 'במשך השבוע מפנקים בסוד את הענק/ית שלכם: פתק נחמד, ממתק קטן, ציור — בלי לגלות מי אתם. ביום הגילוי מספרים!' },
  purim: { label: 'משלוח מנות לפורים', emoji: '🎭', giver: 'שולחי המשלוח', verb: 'אתם מכינים משלוח מנות ל', task: 'מכינים משלוח מנות קטן ושמח: שני סוגי מאכלים לפחות, ברכה בכתב יד ותחפושת של כוונה טובה.' },
  hanukkah: { label: 'מתנות לחנוכה', emoji: '🕎', giver: 'נותני המתנה', verb: 'אתם קונים מתנת חנוכה ל', task: 'בוחרים מתנה קטנה ושמחה, עוטפים יפה ומוסיפים פתק עם ברכת חנוכה. אפשר גם להכין מתנה בעצמכם!' },
}

// ── RSVP ──────────────────────────────────────────────────────
export function rsvpTotals(responses = []) {
  const t = { yes: 0, no: 0, maybe: 0, answered: 0, kids: 0, adults: 0, maybeKids: 0, maybeAdults: 0, allergies: [] }
  for (const r of responses) {
    if (!r || !['yes', 'no', 'maybe'].includes(r.status)) continue
    t.answered++; t[r.status]++
    const kids = Math.max(0, Number(r.kids) || 0), adults = Math.max(0, Number(r.adults) || 0)
    if (r.status === 'yes') { t.kids += kids; t.adults += adults }
    if (r.status === 'maybe') { t.maybeKids += kids; t.maybeAdults += adults }
    if (r.status !== 'no' && cleanText(r.allergies, LIMITS.allergies)) t.allergies.push({ name: r.name, text: cleanText(r.allergies, LIMITS.allergies) })
  }
  t.people = t.kids + t.adults
  return t
}

// Invitees whose name doesn't match any answer (loose match: same normalized name, or the answer starts with it).
export function missingInvitees(invitees = [], responses = []) {
  const answered = responses.map(r => normName(r.name)).filter(Boolean)
  return invitees.filter(name => {
    const n = normName(name)
    return n && !answered.some(a => a === n || a.startsWith(n + ' ') || a.split(/[ ,+&ו]+/).includes(n))
  })
}

const LRI = '⁦', PDI = '⁩'
const ltr = v => `${LRI}${v}${PDI}`
const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
// "2026-11-14" → "שבת 14.11"
export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return ''
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return `יום ${HE_DAYS[d.getUTCDay()]} ${+m[3]}.${+m[2]}`
}

export function rsvpInviteText(ev, link) {
  const when = [formatDate(ev.date), ev.time && `בשעה ${ltr(ev.time)}`].filter(Boolean).join(' ')
  return [`🎉 ${ev.title}`, when && `📅 ${when}`, ev.place && `📍 ${ev.place}`,
    `✅ אשרו הגעה בלחיצה${ev.deadline ? ` עד ${formatDate(ev.deadline)}` : ''}:`, link].filter(Boolean).join('\n')
}

// "ילד אחד" / "3 ילדים", "מבוגר אחד" / "2 מבוגרים"
export const countLabel = (n, one, many) => Number(n) === 1 ? one : `${Number(n) || 0} ${many}`
export const peopleLabel = (kids, adults) => [kids && countLabel(kids, 'ילד אחד', 'ילדים'), adults && countLabel(adults, 'מבוגר אחד', 'מבוגרים')].filter(Boolean).join(' + ')

// "דני, יעל ויואב"
export const heList = items => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} ו${items[items.length - 1]}`

export function rsvpReminderText(ev, missing, link) {
  const head = missing.length
    ? `⏰ תזכורת קטנה לגבי ${ev.title}: עוד לא אישרו הגעה — ${heList(missing)}.`
    : `⏰ תזכורת קטנה לגבי ${ev.title}: מי שעוד לא אישר/ה הגעה, זה הזמן 🙂`
  return [head, ev.deadline ? `נשמח לתשובה עד ${formatDate(ev.deadline)}, בלחיצה אחת 🙏` : 'נשמח לתשובה בלחיצה אחת, כדי שנדע כמה להכין 🙏', link].join('\n')
}

// ── thank-you wall ────────────────────────────────────────────
export const OCCASIONS = {
  'end-of-year': { label: 'סוף שנה', emoji: '🌻', title: 'תודה על שנה מופלאה' },
  hanukkah: { label: 'חנוכה', emoji: '🕎', title: 'חנוכה שמח' },
  'rosh-hashana': { label: 'ראש השנה', emoji: '🍯', title: 'שנה טובה ומתוקה' },
  birthday: { label: 'יום הולדת', emoji: '🎂', title: 'יום הולדת שמח' },
  other: { label: 'סתם כי מגיע', emoji: '💖', title: 'תודה מכל הלב' },
}
export const STICKERS = ['🌸', '🌻', '🌈', '⭐', '💖', '🦋', '🎈', '🍎', '📚', '🎨', '🧸', '🌟', '🕎', '🍯', '🎂', '🙏']

// Booklet layout: cards per A4 page (6 short blessings, fewer when they're long).
export function bookletPages(notes, perPage = 6) {
  const pages = []
  let page = [], weight = 0
  for (const n of notes) {
    const w = (n.message || '').length > 220 ? 2 : 1
    if (page.length && weight + w > perPage) { pages.push(page); page = []; weight = 0 }
    page.push(n); weight += w
  }
  if (page.length) pages.push(page)
  return pages
}
