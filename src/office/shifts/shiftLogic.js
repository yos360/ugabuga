// Shift / duty-roster planner — pure logic, no DOM.
// Dates are ISO 'YYYY-MM-DD' handled in UTC; weekday 0 = Sunday (יום א׳).
// cells: { 'YYYY-MM-DD|shiftId': [{ p: personId|null, l: locked }] } — one entry per needed person.

export const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
export const DAY_SHORT = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
export const MAX_DAYS = 92

const DAY_MS = 864e5
const pad = n => String(n).padStart(2, '0')
const toMs = iso => { const [y, m, d] = String(iso).split('-').map(Number); return Date.UTC(y, m - 1, d) }
const fromMs = ms => new Date(ms).toISOString().slice(0, 10)
export const isISO = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !Number.isNaN(toMs(s))
export const addDays = (iso, n) => fromMs(toMs(iso) + n * DAY_MS)
export const weekday = iso => new Date(toMs(iso)).getUTCDay()
export const dayDiff = (a, b) => Math.round((toMs(b) - toMs(a)) / DAY_MS)
export const fmtDate = iso => { const [, m, d] = String(iso).split('-'); return `${+d}.${+m}` }
export const todayISO = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
export const fmtHM = h => { const m = Math.round(((h % 24) + 24) % 24 * 60); return `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}` }
const parseHM = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim()); return m && +m[1] < 24 && +m[2] < 60 ? +m[1] + +m[2] / 60 : null }

export function dateRange(start, end) {
  if (!isISO(start)) return []
  const n = isISO(end) ? Math.min(Math.max(dayDiff(start, end), 0), MAX_DAYS - 1) : 0
  return Array.from({ length: n + 1 }, (_, i) => addDays(start, i))
}

let seq = 0
export const uid = (prefix = 'x') => `${prefix}${Date.now().toString(36).slice(-4)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 5)}`

// Small seeded RNG so a seed reproduces the same roster (and tests are deterministic).
export function rng(seed) {
  let a = (seed >>> 0) || 1
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

// ── presets ───────────────────────────────
const sh = (name, start, hours, need = 1, days = ALL_DAYS) => ({ name, start, hours, need, days })
const SUN_THU = [0, 1, 2, 3, 4]
export const PRESETS = [
  { id: 'kitchen', emoji: '🍳', label: 'תורנות מטבח', weeks: 2, restHours: 0, dayGap: 2, shifts: [sh('מטבח', '05:30', 14, 2)] },
  { id: 'guard4', emoji: '💂', label: 'שמירות 4 שעות', weeks: 1, restHours: 8, dayGap: 0, shifts: [sh('02–06', '02:00', 4), sh('06–10', '06:00', 4), sh('10–14', '10:00', 4), sh('14–18', '14:00', 4), sh('18–22', '18:00', 4), sh('22–02', '22:00', 4)] },
  { id: 'guard8', emoji: '🔦', label: 'שמירות 8 שעות', weeks: 1, restHours: 8, dayGap: 0, shifts: [sh('06–14', '06:00', 8), sh('14–22', '14:00', 8), sh('22–06', '22:00', 8)] },
  { id: 'work', emoji: '🏭', label: 'משמרות בוקר/ערב/לילה', weeks: 1, restHours: 8, dayGap: 1, shifts: [sh('בוקר', '07:00', 8, 2), sh('ערב', '15:00', 8, 2), sh('לילה', '23:00', 8, 1)] },
  { id: 'class', emoji: '🧹', label: 'תורנות ניקיון בכיתה', weeks: 4, restHours: 0, dayGap: 2, shifts: [sh('ניקיון', '13:00', 1, 2, SUN_THU)] },
  { id: 'home', emoji: '🏠', label: 'תורנות בבית', weeks: 2, restHours: 0, dayGap: 1, shifts: [sh('כלים', '20:00', 1), sh('שולחן', '19:00', 1), sh('זבל', '21:00', 1)] },
  { id: 'rides', emoji: '🚐', label: 'תורנות הסעות', weeks: 4, restHours: 0, dayGap: 1, shifts: [sh('הסעה בוקר', '07:30', 1), sh('הסעה צהריים', '13:30', 1)].map(s => ({ ...s, days: SUN_THU })) },
]

// A new plan from a preset (or a blank custom one).
export function planFromPreset(id, start = todayISO()) {
  const p = PRESETS.find(x => x.id === id) || { label: 'סידור משמרות', weeks: 1, restHours: 0, dayGap: 1, shifts: [sh('משמרת', '', 0, 1)] }
  return {
    title: p.label, preset: p.id || 'custom', start, end: addDays(start, p.weeks * 7 - 1), restHours: p.restHours, dayGap: p.dayGap,
    shifts: p.shifts.map((s, i) => ({ ...s, id: `s${i + 1}`, days: [...s.days] })),
  }
}

// ── people ───────────────────────────────
const PHONE = /(?:\+?972[\s-]?|0)5\d[\s-]?\d{3}[\s-]?\d{4}/g
const WA_PREFIX = /^\[?\d{1,2}[./]\d{1,2}[./]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\]?\s*-?\s*/
const BULLET = /^\s*(?:\d{1,3}[.)]\s*|[-–—•*·~@]+\s*)/
const NOTE_SPLIT = /\t|\s[-–—]\s|:|\(/

// Pasted text → [{ name, note }]. One person per line; also "name - note", "name: note",
// Excel rows (tab), WhatsApp export lines, numbered lists and comma-separated names.
export function parsePeople(text) {
  const out = [], seen = new Set()
  const push = (name, note = '') => {
    name = name.replace(/[‎‏‪-‮]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40)
    if (!name || /^\d+$/.test(name) || seen.has(name)) return
    seen.add(name)
    out.push({ name, note: note.replace(/\)\s*$/, '').replace(/\s+/g, ' ').trim().slice(0, 120) })
  }
  for (let line of String(text || '').split(/\r?\n/)) {
    line = line.replace(WA_PREFIX, '').replace(PHONE, ' ').replace(BULLET, '').trim()
    if (!line) continue
    const m = NOTE_SPLIT.exec(line)
    if (m) push(line.slice(0, m.index), line.slice(m.index + m[0].length))
    else line.split(/[,،]/).forEach(n => push(n))
  }
  return out
}

// ── notes → rules ───────────────────────────────
const DAY_WORDS = [['ראשון'], ['שני'], ['שלישי'], ['רביעי'], ['חמישי'], ['שישי'], ['שבת', 'שבתות']]
const WEEKEND = /סופ["״']?ש|סוף שבוע|סופי שבוע/
const ONLY = /(^|\s)רק(\s|$)|(^|\s)רק[בה]/
const DATE_RX = /(\d{1,2})(?:[./](\d{1,2}))?(?:[./](\d{2,4}))?\s*[-–—]\s*(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?|(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/g
const stem = w => w.length > 3 ? w.replace(/[הת]$/, '') : w

function shiftWords(shifts) {
  const words = shifts.map(s => String(s.name || '').split(/[^֐-׿A-Za-z]+/).filter(w => w.length >= 2))
  const common = new Set(words[0]?.filter(w => words.every(ws => ws.includes(w))))
  return words.map(ws => (shifts.length > 1 ? ws.filter(w => !common.has(w)) : ws).map(stem))
}

// Pick the year that puts d.m closest to the plan start.
function dateNear(d, m, y, start) {
  if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null
  if (y) { y = +y < 100 ? 2000 + +y : +y; return `${y}-${pad(m)}-${pad(d)}` }
  const sy = +String(start).slice(0, 4)
  const opts = [sy - 1, sy, sy + 1].map(yy => `${yy}-${pad(m)}-${pad(d)}`)
  return opts.reduce((a, b) => Math.abs(dayDiff(start, b) - 120) < Math.abs(dayDiff(start, a) - 120) ? b : a)
}

// Free-text note ("לא בשישי", "רק בוקר", "חופשה 12.11-15.11") → rules for this plan.
export function parseNote(note, plan) {
  const noDays = new Set(), noShifts = new Set(), offDates = new Set()
  const text = String(note || '')
  const shifts = plan?.shifts || []
  const sw = shiftWords(shifts)
  const planDates = plan ? dateRange(plan.start, plan.end) : []
  for (const clause of text.split(/[,;\n]|\s+ו?גם\s+|\.(?!\d)/)) {
    if (!clause.trim()) continue
    const only = ONLY.test(clause)
    const days = new Set()
    DAY_WORDS.forEach((ws, i) => { if (ws.some(w => clause.includes(w))) days.add(i) })
    if (WEEKEND.test(clause)) { days.add(5); days.add(6) }
    const shiftHit = new Set()
    const words = clause.split(/[^֐-׿A-Za-z]+/).filter(Boolean)
    // "בבוקר", "לילות", "בערבים" all hit their shift; short names must match whole
    sw.forEach((ws, i) => { if (ws.some(w => words.some(x => w.length >= 3 ? x.includes(w) : x === w || x === 'ב' + w))) shiftHit.add(shifts[i].id) })
    const dates = new Set()
    if (plan) {
      for (const m of clause.matchAll(DATE_RX)) {
        if (m[7]) { const d = dateNear(+m[7], +m[8], m[9], plan.start); if (d) dates.add(d); continue }
        const to = dateNear(+m[4], +m[5], m[6], plan.start)
        const from = dateNear(+m[1], +(m[2] || m[5]), m[3] || m[6], plan.start)
        if (from && to && dayDiff(from, to) >= 0 && dayDiff(from, to) < 120) for (let k = 0; k <= dayDiff(from, to); k++) dates.add(addDays(from, k))
      }
    }
    if (only) {
      if (days.size) ALL_DAYS.forEach(d => { if (!days.has(d)) noDays.add(d) })
      if (shiftHit.size) shifts.forEach(s => { if (!shiftHit.has(s.id)) noShifts.add(s.id) })
      if (dates.size) planDates.forEach(d => { if (!dates.has(d)) offDates.add(d) })
    } else {
      days.forEach(d => noDays.add(d))
      shiftHit.forEach(id => noShifts.add(id))
      dates.forEach(d => offDates.add(d))
    }
  }
  return { noDays, noShifts, offDates }
}

// Manual rules (person.rules) + whatever the note says.
export function effectiveRules(person, plan) {
  const r = parseNote(person.note, plan)
  const m = person.rules || {}
  ;(m.noDays || []).forEach(d => r.noDays.add(d))
  ;(m.noShifts || []).forEach(d => r.noShifts.add(d))
  ;(m.offDates || []).forEach(d => r.offDates.add(d))
  return r
}

// Collapse dates into "12.11–15.11" runs for display.
export function dateRuns(dates) {
  const s = [...dates].filter(isISO).sort()
  const runs = []
  for (const d of s) {
    const last = runs[runs.length - 1]
    if (last && dayDiff(last[1], d) === 1) last[1] = d
    else runs.push([d, d])
  }
  return runs.map(([a, b]) => a === b ? fmtDate(a) : `${fmtDate(a)}–${fmtDate(b)}`)
}

export function describeRules(rules, plan) {
  const out = []
  const days = [...rules.noDays].sort()
  if (days.length) out.push(`לא בימי ${days.map(d => DAY_NAMES[d]).join(', ')}`)
  const names = (plan?.shifts || []).filter(s => rules.noShifts.has(s.id)).map(s => s.name)
  if (names.length) out.push(`לא ב: ${names.join(', ')}`)
  const runs = dateRuns(rules.offDates)
  if (runs.length) out.push(`לא זמינים: ${runs.join(', ')}`)
  return out
}

// ── slots ───────────────────────────────
export function shiftTimes(shifts) {
  const n = Math.max(shifts.length, 1)
  return shifts.map((s, i) => {
    const st = parseHM(s.start)
    const hours = +s.hours > 0 ? Math.min(+s.hours, 24) : st == null ? 24 / n : 8
    return { start: st == null ? i * 24 / n : st, hours, explicit: st != null }
  })
}

export const slotKey = (date, shiftId) => `${date}|${shiftId}`

// Every (date, shift) that needs people, in time order.
export function buildSlots(plan) {
  const shifts = plan?.shifts || []
  const times = shiftTimes(shifts)
  const slots = []
  dateRange(plan?.start, plan?.end).forEach((date, di) => {
    const dow = weekday(date)
    shifts.forEach((s, si) => {
      if (!(s.days || ALL_DAYS).includes(dow)) return
      const t = times[si], startH = di * 24 + t.start
      slots.push({ key: slotKey(date, s.id), date, dow, di, shift: s, si, need: Math.max(1, Math.min(20, Math.round(+s.need) || 1)), startH, endH: startH + t.hours })
    })
  })
  return slots.sort((a, b) => a.startH - b.startH || a.si - b.si)
}

const EMPTY = () => ({ p: null, l: false })

// Fit cells to the current slots/people: right length per slot, unknown people dropped.
export function normalizeCells(slots, cells, people) {
  const ids = new Set(people.map(p => p.id))
  const out = {}
  for (const s of slots) {
    const cur = (cells && cells[s.key]) || []
    out[s.key] = Array.from({ length: s.need }, (_, i) => {
      const c = cur[i]
      return c && c.p && ids.has(c.p) ? { p: c.p, l: !!c.l } : EMPTY()
    })
  }
  return out
}

export function makeCtx(people, plan) {
  const rules = {}, names = {}
  for (const p of people) { rules[p.id] = effectiveRules(p, plan); names[p.id] = p.name }
  return { rules, names, restHours: Math.max(0, +plan.restHours || 0), dayGap: Math.max(0, +plan.dayGap || 0) }
}

// Why person `pid` should not be in `slot`, given their other slots. [{ w, t }]
export function issuesFor(pid, slot, others, ctx) {
  const out = []
  const r = ctx.rules[pid], name = ctx.names[pid] || ''
  if (r) {
    if (r.noDays.has(slot.dow)) out.push({ w: 1000, t: `${name}: אין זמינות בימי ${DAY_NAMES[slot.dow]}` })
    if (r.offDates.has(slot.date)) out.push({ w: 1000, t: `${name}: אין זמינות ב-${fmtDate(slot.date)}` })
    if (r.noShifts.has(slot.shift.id)) out.push({ w: 1000, t: `${name}: לא במשמרת „${slot.shift.name}”` })
  }
  for (const o of others) {
    if (o === slot || o.key === slot.key) continue
    if (o.startH < slot.endH && slot.startH < o.endH) { out.push({ w: 1000, t: `${name}: באותה שעה גם ב„${o.shift.name}” ${fmtDate(o.date)}` }); continue }
    const before = o.startH < slot.startH
    const rest = before ? slot.startH - o.endH : o.startH - slot.endH
    if (ctx.restHours > 0 && rest < ctx.restHours) out.push({ w: 400, t: `${name}: רק ${Math.round(rest * 10) / 10} שעות מנוחה ${before ? 'אחרי' : 'לפני'} „${o.shift.name}” ${fmtDate(o.date)}` })
    const dd = Math.abs(o.di - slot.di)
    if (ctx.dayGap >= 1 && dd === 0) out.push({ w: 300, t: `${name}: פעמיים באותו יום` })
    else if (ctx.dayGap >= 2 && dd === 1) out.push({ w: 200, t: `${name}: יומיים ברצף (${fmtDate(before ? o.date : slot.date)}–${fmtDate(before ? slot.date : o.date)})` })
  }
  return out
}
const weight = list => list.reduce((s, x) => s + x.w, 0)

function slotsByPerson(slots, cells) {
  const mine = {}
  for (const s of slots) for (const c of cells[s.key] || []) if (c.p) (mine[c.p] ||= []).push(s)
  return mine
}

// Red marks: { 'key#i': ['reason', …] } for every filled position that breaks a rule.
export function checkConflicts(people, plan, cells, slots = buildSlots(plan)) {
  const ctx = makeCtx(people, plan)
  const mine = slotsByPerson(slots, cells)
  const out = {}
  for (const s of slots) {
    const row = cells[s.key] || []
    row.forEach((c, i) => {
      if (!c.p || !ctx.names[c.p]) return
      const reasons = issuesFor(c.p, s, mine[c.p] || [], ctx).map(x => x.t)
      if (row.some((d, j) => j !== i && d.p === c.p)) reasons.unshift(`${ctx.names[c.p]} פעמיים באותה משבצת`)
      if (reasons.length) out[`${s.key}#${i}`] = [...new Set(reasons)]
    })
  }
  return out
}

// ── the scheduler ───────────────────────────────
// Fills every unlocked position: respects rules, rests and day gaps where it can, spreads duties evenly,
// then repairs leftover conflicts with swaps and evens out counts (max − min ≤ 1 where the rules allow).
export function schedule({ people, plan, cells = {}, seed = 1 }) {
  const slots = buildSlots(plan)
  const ctx = makeCtx(people, plan)
  const rnd = rng(seed)
  const base = normalizeCells(slots, cells, people)
  const out = {}
  const mine = {}, count = {}, kind = {}, wkd = {}
  for (const p of people) { mine[p.id] = []; count[p.id] = 0; kind[p.id] = {}; wkd[p.id] = 0 }
  const add = (pid, s) => { mine[pid].push(s); count[pid]++; kind[pid][s.shift.id] = (kind[pid][s.shift.id] || 0) + 1; if (s.dow >= 5) wkd[pid]++ }
  const drop = (pid, s) => { mine[pid].splice(mine[pid].indexOf(s), 1); count[pid]--; kind[pid][s.shift.id]--; if (s.dow >= 5) wkd[pid]-- }
  for (const s of slots) {
    out[s.key] = base[s.key].map(c => c.l && c.p ? { p: c.p, l: true } : EMPTY())
    out[s.key].forEach(c => { if (c.p) add(c.p, s) })
  }
  if (!people.length) return out
  const pen = (pid, s, skip) => weight(issuesFor(pid, s, skip ? mine[pid].filter(o => o !== skip) : mine[pid], ctx))
  const order = [...people].sort(() => rnd() - 0.5)

  for (const s of slots) {
    const row = out[s.key]
    row.forEach((c, i) => {
      if (c.p) return
      let best = null, bestScore = Infinity
      for (const p of order) {
        if (row.some(x => x.p === p.id)) continue
        const score = pen(p.id, s) + count[p.id] * 40 + (kind[p.id][s.shift.id] || 0) * 6 + (s.dow >= 5 ? wkd[p.id] * 8 : 0) + rnd() * 4
        if (score < bestScore) { bestScore = score; best = p.id }
      }
      if (best) { row[i] = { p: best, l: false }; add(best, s) }
    })
  }

  const positions = () => slots.flatMap(s => out[s.key].map((c, i) => ({ s, i, c }))).filter(x => x.c.p && !x.c.l)

  // 1. repair: swap a conflicting position with another one when both end up clean
  const repair = () => {
    for (let pass = 0; pass < 3; pass++) {
      let changed = false
      for (const A of positions()) {
        const a = out[A.s.key][A.i].p
        if (!a || out[A.s.key][A.i].l || pen(a, A.s, A.s) === 0) continue
        // first try handing it to someone free with no more duties than `a`
        let done = false
        for (const p of order) {
          if (p.id === a || count[p.id] > count[a] || out[A.s.key].some(x => x.p === p.id)) continue
          if (pen(p.id, A.s) === 0) { drop(a, A.s); out[A.s.key][A.i] = { p: p.id, l: false }; add(p.id, A.s); done = true; break }
        }
        if (!done) {
          for (const B of positions()) {
            const b = out[B.s.key][B.i].p
            if (B.s === A.s || b === a || out[A.s.key].some(x => x.p === b) || out[B.s.key].some(x => x.p === a)) continue
            drop(a, A.s); drop(b, B.s)
            const ok = pen(a, B.s) === 0 && pen(b, A.s) === 0
            if (ok) { out[A.s.key][A.i] = { p: b, l: false }; out[B.s.key][B.i] = { p: a, l: false }; add(b, A.s); add(a, B.s); done = true; break }
            add(a, A.s); add(b, B.s)
          }
        }
        changed ||= done
      }
      if (!changed) break
    }
  }

  // 2. balance: move a duty from someone with ≥2 more than someone else, if the move is clean
  const balance = () => {
    for (let guard = 0; guard < 2000; guard++) {
      const ids = people.map(p => p.id).sort((x, y) => count[y] - count[x])
      let moved = false
      outer: for (const hi of ids) {
        for (const lo of [...ids].reverse()) {
          if (count[hi] - count[lo] < 2) break
          for (const s of [...mine[hi]].sort(() => rnd() - 0.5)) {
            const row = out[s.key]
            const i = row.findIndex(c => c.p === hi && !c.l)
            if (i < 0 || row.some(c => c.p === lo)) continue
            if (pen(lo, s) > 0) continue
            drop(hi, s); row[i] = { p: lo, l: false }; add(lo, s); moved = true; break outer
          }
          // two-step: lo takes a slot from a middle person, who takes one from hi
          for (const mid of ids) {
            if (mid === hi || mid === lo || count[mid] <= count[lo]) continue
            for (const s1 of mine[mid]) {
              const r1 = out[s1.key], i1 = r1.findIndex(c => c.p === mid && !c.l)
              if (i1 < 0 || r1.some(c => c.p === lo) || pen(lo, s1) > 0) continue
              for (const s2 of mine[hi]) {
                const r2 = out[s2.key], i2 = r2.findIndex(c => c.p === hi && !c.l)
                if (i2 < 0 || s2 === s1 || r2.some(c => c.p === mid) || pen(mid, s2, s1) > 0) continue
                drop(mid, s1); r1[i1] = { p: lo, l: false }; add(lo, s1)
                drop(hi, s2); r2[i2] = { p: mid, l: false }; add(mid, s2)
                moved = true; break outer
              }
            }
          }
        }
      }
      if (!moved) break
    }
  }

  repair(); balance(); repair()
  return out
}

// ── free play (pure edits) ───────────────────────────────
const copyRows = (cells, ...keys) => { const next = { ...cells }; for (const k of keys) next[k] = cells[k].map(c => ({ ...c })); return next }

// Drag/drop or tap-tap: onto an empty spot moves, onto a chip swaps. from/to: { key, i }
export function moveChip(cells, from, to) {
  if (!cells[from.key] || !cells[to.key] || (from.key === to.key && from.i === to.i)) return cells
  const a = cells[from.key][from.i], b = cells[to.key][to.i]
  if (!a || !a.p || !b) return cells
  const next = copyRows(cells, from.key, to.key)
  next[to.key][to.i] = { ...a }
  next[from.key][from.i] = b.p ? { ...b } : EMPTY()
  return next
}

export function assignPerson(cells, at, pid) {
  if (!cells[at.key] || !cells[at.key][at.i]) return cells
  const next = copyRows(cells, at.key)
  next[at.key][at.i] = pid ? { p: pid, l: false } : EMPTY()
  return next
}
export const clearChip = (cells, at) => assignPerson(cells, at, null)
export function toggleLock(cells, at) {
  const c = cells[at.key]?.[at.i]
  if (!c || !c.p) return cells
  const next = copyRows(cells, at.key)
  next[at.key][at.i] = { ...c, l: !c.l }
  return next
}
export const unlockAll = cells => Object.fromEntries(Object.entries(cells).map(([k, row]) => [k, row.map(c => ({ ...c, l: false }))]))

// ── totals & outputs ───────────────────────────────
export function totals(people, slots, cells) {
  const t = Object.fromEntries(people.map(p => [p.id, { id: p.id, name: p.name, count: 0, hours: 0, weekend: 0, locked: 0 }]))
  for (const s of slots) for (const c of cells[s.key] || []) {
    const x = c.p && t[c.p]; if (!x) continue
    x.count++; x.hours += s.endH - s.startH; if (s.dow >= 5) x.weekend++; if (c.l) x.locked++
  }
  return people.map(p => t[p.id])
}
export const spread = list => list.length ? Math.max(...list.map(x => x.count)) - Math.min(...list.map(x => x.count)) : 0

export function personDuties(pid, slots, cells) {
  return slots.filter(s => (cells[s.key] || []).some(c => c.p === pid))
}

const nameOf = people => { const m = Object.fromEntries(people.map(p => [p.id, p.name])); return id => (id && m[id]) || '___' }
const shiftLabel = (s, times) => times && times.explicit ? `${s.name} (${fmtHM(times.start)})` : s.name
const timeOf = (plan, shift) => shiftTimes(plan.shifts)[plan.shifts.indexOf(shift)]
const rangeLine = plan => `${fmtDate(plan.start)}–${fmtDate(plan.end)}`

// WhatsApp-ready text (bold with *…*). One shift: a line per day; several: day header + a line per shift.
export function toWhatsApp({ title, plan, people, cells, slots = buildSlots(plan) }) {
  const name = nameOf(people)
  const lines = [`*${title || plan.title || 'סידור תורנויות'}*`, rangeLine(plan)]
  const single = plan.shifts.length === 1
  const byDate = new Map()
  for (const s of slots) { if (!byDate.has(s.date)) byDate.set(s.date, []); byDate.get(s.date).push(s) }
  for (const [date, list] of [...byDate].sort(([a], [b]) => a < b ? -1 : 1)) {
    const head = `*${DAY_SHORT[weekday(date)]} ${fmtDate(date)}*`
    const who = s => (cells[s.key] || []).map(c => name(c.p)).join(', ')
    if (single) { if (lines.length === 2) lines.push(''); lines.push(`${head} ${who(list[0])}`) }
    else {
      lines.push('', head)
      list.sort((a, b) => a.si - b.si).forEach(s => lines.push(`${shiftLabel(s.shift, timeOf(plan, s.shift))}: ${who(s)}`))
    }
  }
  return lines.join('\n')
}

export function personText({ person, plan, cells, slots = buildSlots(plan) }) {
  const list = personDuties(person.id, slots, cells)
  const lines = [`*${person.name} — ${plan.title || 'תורנויות'}*`]
  for (const s of list) lines.push(`${DAY_SHORT[s.dow]} ${fmtDate(s.date)}${plan.shifts.length > 1 || timeOf(plan, s.shift).explicit ? ` · ${shiftLabel(s.shift, timeOf(plan, s.shift))}` : ''}`)
  lines.push(`סה״כ: ${list.length}`)
  return lines.join('\n')
}

// Table rows (dates × shifts) shared by print and CSV.
export function matrix({ plan, people, cells, slots = buildSlots(plan) }) {
  const name = nameOf(people)
  const head = ['תאריך', 'יום', ...plan.shifts.map(s => shiftLabel(s, timeOf(plan, s)))]
  const keys = new Set(slots.map(s => s.key))
  const rows = dateRange(plan.start, plan.end)
    .filter(d => plan.shifts.some(s => keys.has(slotKey(d, s.id))))
    .map(d => [fmtDate(d), DAY_NAMES[weekday(d)], ...plan.shifts.map(s => keys.has(slotKey(d, s.id)) ? (cells[slotKey(d, s.id)] || []).map(c => name(c.p)).join(', ') : '—')])
  return { head, rows }
}

const csvCell = v => /[",\n\r]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v)
// UTF-8 BOM so Excel opens Hebrew correctly.
export function toCSV(args) {
  const { head, rows } = matrix(args)
  return '﻿' + [head, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n')
}
