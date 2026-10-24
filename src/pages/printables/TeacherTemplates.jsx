import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import NotFound from '../NotFound'
import { cleanRosterNames, clearClassRoster, loadClassRoster, saveClassRoster } from '../../utils/classRoster'
import { gematria, hebrewParts, holidayMap, dayKey, HEB_MONTHS, HEB_DAY_LETTERS, HEB_DAYS } from '../../utils/hebrewCalendar'
import { TT_BASE, TEACHER_TEMPLATES, TEACHER_GROUPS, teacherTemplate, parseBirthdays, parseRoutine } from './teacherTemplatesData'

// Printable templates for teachers, coordinators and kindergarten teachers: lists, attendance,
// skills tracking, plans, meeting forms, trip letters, certificates, birthdays and a daily routine.
// Every sheet is an SVG drawn in a 200×270 box (see PrintableShell). The header details and the
// class roster (utils/classRoster — the same list the other classroom tools use) are kept only in
// this browser's localStorage; nothing is sent anywhere.

const INFO_KEY = 'ugabuga-teacher-templates-v1'
const BIRTHDAYS_KEY = 'ugabuga-class-birthdays-v1'
const DEFAULT_INFO = { kind: 'school', org: '', cls: '', teacher: '', year: 'תשפ״ז', show: true }

const readStore = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback } catch { return fallback } }
const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode — fine */ } }

const lines = text => String(text || '').split('\n').map(s => s.trim()).filter(Boolean)
// Names plus a few empty rows for latecomers (at least `min` rows in all).
const withBlanks = (names, min, extra = 4) => names.length ? [...names, ...Array(Math.max(extra, min - names.length)).fill('')] : []
const chunk = (list, n) => { const out = []; for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n)); return out.length ? out : [[]] }
// Left-to-right run inside RTL text (dates like 12–13.9 would otherwise flip).
const ltr = s => `‎${s}‎`
// Rough wrap for Hebrew SVG text: ~0.5 × font size per character.
function wrap(text, width, size) {
  const max = Math.max(4, Math.floor(width / (size * 0.5)))
  const out = []
  for (const para of String(text || '').split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if (!line) line = word
      else if ((line + ' ' + word).length <= max) line += ' ' + word
      else { out.push(line); line = word }
    }
    if (line) out.push(line)
  }
  return out
}
const INK = '#111', SOFT = '#eef0f4', MID = '#d9dce3'

const LABELS = {
  school: { org: 'בית הספר', cls: 'כיתה', teacher: 'מחנך/ת', child: 'התלמיד/ה', kids: 'תלמידים', place: 'בכיתה', placeName: 'הכיתה' },
  gan: { org: 'הגן', cls: 'קבוצה', teacher: 'הגננת', child: 'הילד/ה', kids: 'ילדים', place: 'בגן', placeName: 'הגן' },
}

// ── Shared sheet parts ───────────────────────────────────────────────────

// Title + optional details row (school/kindergarten, class, teacher, year). Returns the content top.
function Head({ title, sub, info }) {
  const L = LABELS[info.kind]
  const cells = [[L.org, info.org], [L.cls, info.cls], [L.teacher, info.teacher], ['שנת הלימודים', info.year]]
  return <g>
    <T x={100} y={15} size={10} weight={800}>{title}</T>
    {sub && <T x={100} y={22} size={4.4} fill="#444">{sub}</T>}
    {info.show && <g>
      {cells.map(([label, value], i) => { const right = 192 - i * 46; return <g key={label}>
        <T x={right} y={31} size={3.7} anchor="start" fill="#444">{label}:</T>
        <T x={right - label.length * 1.9 - 3} y={31} size={4} anchor="start" weight={700}>{value}</T>
        <line x1={right - 43} x2={right - label.length * 1.9 - 2.5} y1={32.3} y2={32.3} stroke="#888" strokeWidth={0.25} />
      </g> })}
    </g>}
  </g>
}
const headBottom = info => info.show ? 38 : (26)

// A ruled table, columns laid out right-to-left. cols: { w | flex, label (string or string[]), center, cell(r,i) }
function Grid({ x = 8, y, w = 184, cols, rows, rh, headH = 9, size = 4, headSize = 3.8, zebra = true, shade = [] }) {
  const fixed = cols.reduce((s, c) => s + (c.w || 0), 0), flexN = cols.filter(c => !c.w).length
  const flexW = flexN ? (w - fixed) / flexN : 0
  const pos = cols.reduce((acc, c) => { const prev = acc[acc.length - 1]; acc.push({ r: prev ? prev.r - prev.w : x + w, w: c.w || flexW }); return acc }, [])
  const H = headH + rows.length * rh
  return <g>
    <rect x={x} y={y} width={w} height={headH} fill={SOFT} />
    {rows.map((_, r) => zebra && r % 2 ? <rect key={r} x={x} y={y + headH + r * rh} width={w} height={rh} fill="#f7f8fa" /> : null)}
    {cols.map((c, i) => shade.includes(i) ? <rect key={`s${i}`} x={pos[i].r - pos[i].w} y={y} width={pos[i].w} height={H} fill={MID} opacity={0.55} /> : null)}
    {cols.map((c, i) => { const label = Array.isArray(c.label) ? c.label : [c.label]; const lh = headSize * 1.15, top = y + headH / 2 - (label.length - 1) * lh / 2 + headSize * 0.35
      return label.map((t, k) => <T key={`${i}-${k}`} x={pos[i].r - pos[i].w / 2} y={top + k * lh} size={headSize} weight={700}>{t}</T>) })}
    {rows.map((row, r) => row.map((cell, i) => {
      if (cell == null || cell === '') return null
      const cy = y + headH + r * rh + rh / 2 + size * 0.35
      if (typeof cell === 'object' && cell.box) return <rect key={`${r}-${i}`} x={pos[i].r - pos[i].w / 2 - 2} y={cy - size * 0.35 - 2} width={4} height={4} rx={0.6} fill="#fff" stroke={INK} strokeWidth={0.35} />
      const c = cols[i], s = c.size || size
      if (Array.isArray(cell)) return cell.map((t, k) => <T key={`${r}-${i}-${k}`} x={c.center ? pos[i].r - pos[i].w / 2 : pos[i].r - 1.6} y={cy + (k - (cell.length - 1) / 2) * s * 1.15} size={s} anchor={c.center ? 'middle' : 'start'} fill={c.fill || INK}>{t}</T>)
      return <T key={`${r}-${i}`} x={c.center ? pos[i].r - pos[i].w / 2 : pos[i].r - 1.6} y={cy} size={s} anchor={c.center ? 'middle' : 'start'} fill={c.fill || INK}>{cell}</T>
    }))}
    {Array.from({ length: rows.length + 1 }, (_, r) => <line key={`h${r}`} x1={x} x2={x + w} y1={y + headH + r * rh} y2={y + headH + r * rh} stroke={INK} strokeWidth={r === 0 ? 0.5 : 0.25} />)}
    {pos.slice(1).map((p, i) => <line key={`v${i}`} x1={p.r} x2={p.r} y1={y} y2={y + H} stroke={INK} strokeWidth={0.25} />)}
    <rect x={x} y={y} width={w} height={H} fill="none" stroke={INK} strokeWidth={0.6} />
  </g>
}

// A framed box with a title and writing lines; optional typed text sits on the first lines.
function LinedBox({ x = 8, y, w = 184, h, title, text = '', gap = 7, size = 4 }) {
  const n = Math.max(0, Math.floor((h - 9) / gap))
  const typed = wrap(text, w - 6, size).slice(0, n)
  return <g>
    <rect x={x} y={y} width={w} height={h} rx={2.5} fill="#fff" stroke={INK} strokeWidth={0.5} />
    <T x={x + w - 3} y={y + 6} size={4.4} anchor="start" weight={800}>{title}</T>
    {Array.from({ length: n }, (_, i) => <line key={i} x1={x + 3} x2={x + w - 3} y1={y + 9 + (i + 1) * gap - 1} y2={y + 9 + (i + 1) * gap - 1} stroke="#aaa" strokeWidth={0.25} />)}
    {typed.map((t, i) => <T key={`t${i}`} x={x + w - 3} y={y + 9 + (i + 1) * gap - 2.2} size={size} anchor="start">{t}</T>)}
  </g>
}

// "Label: value ______" on one line, from `right` leftwards over `w`.
function FieldLine({ right, y, w, label, value = '', size = 4.2 }) {
  const lw = label.length * size * 0.5 + 2
  return <g>
    <T x={right} y={y} size={size} anchor="start" weight={700}>{label}</T>
    {value && <T x={right - lw - 1} y={y - 0.3} size={size} anchor="start">{value}</T>}
    <line x1={right - w} x2={right - lw} y1={y + 1.3} y2={y + 1.3} stroke="#777" strokeWidth={0.25} />
  </g>
}

const starPts = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}` }).join(' ')

// ── Calendar helpers (school year תשפ״ז: September 2026 – August 2027) ──────
const YEAR_MONTHS = Array.from({ length: 12 }, (_, i) => { const m = (8 + i) % 12, y = i < 4 ? 2026 : 2027; return { y, m, key: `${y}-${m}` } })
let holidayCache = null
const yearHolidays = () => holidayCache || (holidayCache = holidayMap(new Date(2026, 8, 1), new Date(2027, 7, 31)))
const monthDays = (y, m) => new Date(y, m + 1, 0).getDate()
function hebrewSpan(y, m, withYear = false) {
  const a = hebrewParts(new Date(y, m, 1)), b = hebrewParts(new Date(y, m, monthDays(y, m)))
  if (!a || !b) return ''
  const months = a.month === b.month ? a.month : `${a.month}–${b.month}`
  if (!withYear) return months
  return `${months} ${a.year === b.year ? gematria(a.year) : `${gematria(a.year)}–${gematria(b.year)}`}`
}
// ["ראש השנה 12–13.9", "יום כיפור 21.9", …] for one month.
function monthHolidays(y, m) {
  const map = yearHolidays(), out = []
  for (let d = 1; d <= monthDays(y, m); d++) {
    const name = map.get(dayKey(new Date(y, m, d)))
    if (!name) continue
    const base = name.startsWith('חנוכה') ? 'חנוכה' : name
    const last = out[out.length - 1]
    if (last && last.name === base && last.to === d - 1) last.to = d
    else out.push({ name: base, from: d, to: d })
  }
  return out.map(h => `${h.name} ${ltr(h.from === h.to ? `${h.from}.${m + 1}` : `${h.from}–${h.to}.${m + 1}`)}`)
}

// ── The sheets ───────────────────────────────────────────────────────────

function StudentListSheets({ info, names, o }) {
  const L = LABELS[info.kind]
  const heads = lines(o.columns).slice(0, 12)
  const nCols = heads.length || Number(o.blankCols)
  const top = headBottom(info) + 4, per = 34
  const all = names.length ? withBlanks(names, 20) : Array(Number(o.rows)).fill('')
  return chunk(all, per).map((page, p) => {
    const rh = Math.min(9, (262 - top - 14) / Math.max(page.length, 1))
    const colW = (184 - 52) / nCols
    const cols = [{ w: 8, label: '#', center: true }, { w: 44, label: `שם ${L.child}` },
      ...Array.from({ length: nCols }, (_, i) => ({ label: heads[i] ? wrap(heads[i], colW - 1, 3.4).slice(0, 3) : '', headSize: 3.4 }))]
    return { key: `list-${p}`, svg: <Sheet label={o.title}>
      <Head title={o.title || 'רשימת תלמידים'} sub={o.sub} info={info} />
      <Grid y={top} cols={cols} headH={heads.length ? 14 : 9} headSize={3.4} rh={rh} size={Math.min(4.2, rh * 0.55)} rows={page.map((n, i) => [String(p * per + i + 1), n, ...Array(nCols).fill('')])} />
    </Sheet> }
  })
}

function AttendanceSheets({ info, names, o }) {
  const L = LABELS[info.kind]
  const mm = YEAR_MONTHS.find(x => x.key === o.month) || YEAR_MONTHS[0]
  const map = yearHolidays()
  const days = Array.from({ length: monthDays(mm.y, mm.m) }, (_, i) => new Date(mm.y, mm.m, i + 1)).filter(d => d.getDay() !== 6 && (o.friday || d.getDay() !== 5))
  const top = headBottom(info) + 4, per = 32
  const all = names.length ? withBlanks(names, 20) : Array(Number(o.rows)).fill('')
  const hol = monthHolidays(mm.y, mm.m)
  const cols = [{ w: 6, label: '#', center: true, size: 3 }, { w: 34, label: `שם ${L.child}`, size: 3.6 },
    ...days.map(d => ({ label: [String(d.getDate()), HEB_DAY_LETTERS[d.getDay()]], center: true })), { w: 12, label: ['סה״כ', 'חיסורים'], center: true }]
  const shade = days.map((d, i) => map.has(dayKey(d)) ? i + 2 : -1).filter(i => i > 0)
  const title = `יומן נוכחות — ${HEB_MONTHS[mm.m]} ${mm.y}`
  return chunk(all, per).map((page, p) => {
    const rh = Math.min(7.5, (236 - top) / Math.max(page.length, 1))
    const bottom = top + 10 + page.length * rh
    return { key: `att-${p}`, svg: <Sheet label={title}>
      <Head title={title} sub={hebrewSpan(mm.y, mm.m, true)} info={info} />
      <Grid y={top} cols={cols} headH={10} headSize={2.9} rh={rh} size={Math.min(3.6, rh * 0.5)} rows={page.map((n, i) => [String(p * per + i + 1), n, ...days.map(() => ''), ''])} shade={shade} zebra />
      <T x={192} y={bottom + 6} size={3.6} anchor="start" weight={700}>מקרא: ✓ נוכח/ת · ✗ חסר/ה · א — איחור · מ — חיסור מוצדק · ש — יצא/ה מוקדם</T>
      {hol.length > 0 && wrap(`מועדים בחודש (העמודה מוצללת): ${hol.join(' · ')}. ימי החופשה נקבעים בלוח החופשות של משרד החינוך.`, 184, 3.3).slice(0, 3).map((t, i) => <T key={i} x={192} y={bottom + 12 + i * 4.6} size={3.3} anchor="start" fill="#333">{t}</T>)}
    </Sheet> }
  })
}

const SKILL_SCALES = {
  check: { label: '✓ / ½ / —', legend: 'מקרא: ✓ שולט/ת · ½ בתהליך · — טרם' },
  four: { label: 'סולם 1–4', legend: 'מקרא: 1 טרם התחיל/ה · 2 בתהליך · 3 שולט/ת בעזרה · 4 שולט/ת באופן עצמאי' },
  dates: { label: 'תאריך הצלחה', legend: 'רושמים בכל משבצת את התאריך שבו המיומנות הופיעה לראשונה' },
}
function SkillsSheets({ info, names, o }) {
  const L = LABELS[info.kind]
  const skills = lines(o.skills).slice(0, 10)
  const n = Math.max(skills.length, 1)
  const top = headBottom(info) + 9, per = 28
  const all = names.length ? withBlanks(names, 16, 2) : Array(Number(o.rows)).fill('')
  const colW = (184 - 46) / n
  const cols = [{ w: 6, label: '#', center: true, size: 3.4 }, { w: 40, label: `שם ${L.child}` }, ...skills.map(s => ({ label: wrap(s, colW - 1.5, 3.3).slice(0, 4) }))]
  return chunk(all, per).map((page, p) => {
    const rh = Math.min(8.5, (250 - top - 24) / Math.max(page.length, 1))
    return { key: `sk-${p}`, svg: <Sheet label="מעקב התקדמות לפי מיומנויות">
      <Head title={o.title || 'מעקב התקדמות לפי מיומנויות'} info={info} />
      <T x={192} y={top - 3} size={3.8} anchor="start" weight={700}>{o.period ? `תקופה: ${o.period}` : 'תקופה: ____________'}</T>
      <T x={8} y={top - 3} size={3.4} anchor="end" fill="#333">{SKILL_SCALES[o.scale].legend}</T>
      <Grid y={top} cols={cols} headH={18} headSize={3.3} rh={rh} size={Math.min(4, rh * 0.52)} rows={page.map((nm, i) => [String(p * per + i + 1), nm, ...skills.map(() => '')])} />
      <LinedBox y={top + 18 + page.length * rh + 4} h={Math.max(16, 255 - (top + 18 + page.length * rh + 4))} title="הערות ותצפיות" />
    </Sheet> }
  })
}

function WeeklyPlanSheet({ info, o }) {
  const days = HEB_DAYS.slice(0, o.friday ? 6 : 5)
  const top = headBottom(info) + 12
  const rh = o.friday ? 27 : 32
  const tableBottom = top + 9 + days.length * rh
  const boxH = Math.max(30, 258 - tableBottom - 4)
  return [{ key: 'week', svg: <Sheet label="תכנון שבועי">
    <Head title="תכנון שבועי" info={info} />
    <FieldLine right={192} y={top - 4} w={88} label="שבוע:" value={o.week} />
    <FieldLine right={100} y={top - 4} w={92} label="נושא השבוע:" value={o.topic} />
    <Grid y={top} cols={[{ w: 14, label: 'יום', center: true, size: 4.4 }, { w: 34, label: 'נושא / תחום' }, { label: 'פעילויות ומהלך' }, { w: 36, label: 'חומרים והכנה' }, { w: 28, label: 'הערות' }]} rh={rh} rows={days.map(d => [d, '', '', '', ''])} zebra={false} />
    <LinedBox x={102} y={tableBottom + 4} w={90} h={boxH} title="מטרות השבוע" />
    <LinedBox x={8} y={tableBottom + 4} w={90} h={boxH} title="תזכורות — להורים ולצוות" />
  </Sheet> }]
}

function YearlyPlanSheets({ info, o }) {
  const months = o.range === 'full' ? YEAR_MONTHS : YEAR_MONTHS.slice(0, 10)
  const per = o.range === 'full' ? 6 : 5
  const top = headBottom(info) + 3
  return chunk(months, per).map((page, p) => {
    const rh = (258 - top - 10) / per
    return { key: `yr-${p}`, svg: <Sheet label="תכנון שנתי תשפ״ז">
      <Head title={`תכנון שנתי — תשפ״ז${p ? ' (המשך)' : ''}`} info={info} />
      <Grid y={top} cols={[{ w: 26, label: 'חודש', center: true }, { w: 46, label: 'חגים ומועדים' }, { label: 'נושאים ויחידות לימוד' }, { label: 'אירועים ופעילויות' }, { w: 24, label: 'הערות' }]} rh={rh} rows={page.map(() => ['', '', '', '', ''])} zebra={false} />
      {page.map((mm, i) => { const y = top + 10 + i * rh; const hol = monthHolidays(mm.y, mm.m).flatMap(h => wrap(h, 43, 3.2)).slice(0, Math.floor((rh - 3) / 4.4)); return <g key={mm.key}>
        <T x={179} y={y + rh / 2 - 3} size={5} weight={800}>{HEB_MONTHS[mm.m]}</T>
        <T x={179} y={y + rh / 2 + 2.5} size={3.6} fill="#444">{mm.y}</T>
        <T x={179} y={y + rh / 2 + 7.5} size={3} fill="#444">{hebrewSpan(mm.y, mm.m)}</T>
        {hol.map((t, k) => <T key={k} x={164} y={y + 5 + k * 4.4} size={3.2} anchor="start" fill="#333">{t}</T>)}
      </g> })}
    </Sheet> }
  })
}

function ParentMeetingSheet({ info, o }) {
  const L = LABELS[info.kind]
  const top = headBottom(info) + 6
  return [{ key: 'pm', svg: <Sheet label="תיעוד שיחה עם הורים">
    <Head title="תיעוד שיחה עם הורים" info={info} />
    <FieldLine right={192} y={top} w={80} label={`שם ${L.child}:`} value={o.student} />
    <FieldLine right={108} y={top} w={48} label="תאריך:" value={o.date} />
    <FieldLine right={56} y={top} w={48} label="שעה:" />
    <FieldLine right={192} y={top + 9} w={184} label="משתתפים בשיחה:" value={o.participants} />
    <T x={192} y={top + 18} size={4} anchor="start">אופן השיחה: ☐ פגישה ☐ טלפון ☐ שיחת וידאו        יוזם/ת השיחה: ☐ הצוות ☐ ההורים ☐ גורם נוסף: ________</T>
    <LinedBox y={top + 23} h={23} title="מטרת השיחה" text={o.purpose} />
    <LinedBox x={102} y={top + 49} w={90} h={37} title="חוזקות ונקודות לשימור" />
    <LinedBox x={8} y={top + 49} w={90} h={37} title="נושאים שהועלו על ידי הצוות" />
    <LinedBox y={top + 89} h={30} title="מה שיתפו ההורים" />
    <T x={192} y={top + 126} size={4.4} anchor="start" weight={800}>סיכומים והמשך</T>
    <Grid y={top + 129} cols={[{ label: 'מה עושים' }, { w: 44, label: 'באחריות' }, { w: 30, label: 'עד מתי', center: true }]} rh={8.5} rows={Array.from({ length: 4 }, () => ['', '', ''])} zebra={false} />
    <FieldLine right={192} y={top + 177} w={90} label="מועד שיחת המשך:" />
    <FieldLine right={96} y={top + 177} w={88} label="עדכון גורם נוסף:" />
    <FieldLine right={192} y={top + 189} w={88} label="חתימת איש/ת הצוות:" />
    <FieldLine right={96} y={top + 189} w={88} label="חתימת ההורים (רשות):" />
    <T x={100} y={top + 200} size={3.3} fill="#555">המסמך כולל מידע אישי על {L.child} — שומרים אותו בתיק אישי סגור ומשתפים רק את מי שצריך.</T>
  </Sheet> }]
}

function StaffMeetingSheet({ info, o }) {
  const top = headBottom(info) + 6
  const agenda = lines(o.agenda).slice(0, 7)
  const agendaRows = Math.max(agenda.length, 5)
  const agendaH = 9 + agendaRows * 6.2
  const y2 = top + 30 + agendaH + 3
  return [{ key: 'sm', svg: <Sheet label="פרוטוקול ישיבת צוות">
    <Head title="פרוטוקול ישיבת צוות" info={info} />
    <FieldLine right={192} y={top} w={60} label="תאריך:" value={o.date} />
    <FieldLine right={128} y={top} w={56} label="שעה:" value={o.time} />
    <FieldLine right={68} y={top} w={60} label="מקום:" value={o.place} />
    <FieldLine right={192} y={top + 9} w={90} label="מנחה:" value={o.chair} />
    <FieldLine right={98} y={top + 9} w={90} label="רושם/ת:" value={o.writer} />
    <FieldLine right={192} y={top + 18} w={184} label="משתתפים:" value={o.people} />
    <FieldLine right={192} y={top + 27} w={184} label="נעדרים:" />
    <rect x={8} y={top + 30} width={184} height={agendaH} rx={2.5} fill="#fff" stroke={INK} strokeWidth={0.5} />
    <T x={189} y={top + 36} size={4.4} anchor="start" weight={800}>סדר היום</T>
    {Array.from({ length: agendaRows }, (_, i) => <g key={i}>
      <T x={189} y={top + 43 + i * 6.2} size={4} anchor="start" weight={700}>{`${i + 1}.`}</T>
      {agenda[i] && <T x={183} y={top + 43 + i * 6.2} size={4} anchor="start">{agenda[i]}</T>}
      <line x1={11} x2={183} y1={top + 44.3 + i * 6.2} y2={top + 44.3 + i * 6.2} stroke="#bbb" strokeWidth={0.25} />
    </g>)}
    <LinedBox y={y2} h={Math.max(30, 250 - y2 - 82)} title="עיקרי הדיון" />
    <T x={192} y={250 - 74} size={4.4} anchor="start" weight={800}>החלטות ומשימות</T>
    <Grid y={250 - 71} cols={[{ w: 7, label: '#', center: true }, { label: 'החלטה / משימה' }, { w: 40, label: 'אחראי/ת' }, { w: 26, label: 'תאריך יעד', center: true }, { w: 14, label: 'בוצע', center: true }]} rh={8} rows={Array.from({ length: 7 }, (_, i) => [String(i + 1), '', '', '', { box: true }])} zebra={false} />
    <FieldLine right={192} y={258} w={90} label="הישיבה הבאה:" />
    <FieldLine right={96} y={258} w={88} label="הפרוטוקול הופץ בתאריך:" />
  </Sheet> }]
}

function TasksSheet({ info, o }) {
  const tasks = lines(o.tasks).slice(0, 22)
  const top = headBottom(info) + 9
  const n = Math.max(tasks.length, 18)
  const rh = Math.min(9, (258 - top - 40) / n)
  return [{ key: 'tasks', svg: <Sheet label="רשימת משימות לרכזת">
    <Head title={o.title || 'רשימת משימות לרכזת'} info={info} />
    <FieldLine right={192} y={top - 3} w={100} label="תקופה:" value={o.period} />
    <T x={8} y={top - 3} size={3.4} anchor="end" fill="#333">עדיפות: א — דחוף · ב — השבוע · ג — כשמתפנה</T>
    <Grid y={top} cols={[{ w: 9, label: '✓', center: true }, { label: 'משימה' }, { w: 34, label: 'מול מי / אחראי' }, { w: 22, label: 'עד מתי', center: true }, { w: 14, label: 'עדיפות', center: true }, { w: 30, label: 'הערות' }]} rh={rh} size={Math.min(4, rh * 0.5)}
      rows={Array.from({ length: n }, (_, i) => [{ box: true }, tasks[i] || '', '', '', '', ''])} />
    <LinedBox y={top + 9 + n * rh + 4} h={Math.max(22, 258 - (top + 9 + n * rh + 4))} title="חשוב לזכור / לבדוק" />
  </Sheet> }]
}

function DutySheet({ info, names, o }) {
  const duties = lines(o.duties).slice(0, 12)
  const cols = o.span === 'weeks' ? ['שבוע 1', 'שבוע 2', 'שבוע 3', 'שבוע 4', 'שבוע 5'] : HEB_DAYS.slice(0, o.friday ? 6 : 5)
  const top = headBottom(info) + 9
  const rh = Math.min(20, (250 - top - 30) / Math.max(duties.length, 1))
  const fill = o.auto && names.length
  const cell = (r, c) => fill ? names[(c * duties.length + r) % names.length] : ''
  return [{ key: 'duty', svg: <Sheet label="לוח תורנויות">
    <Head title="לוח תורנויות" info={info} />
    <FieldLine right={192} y={top - 3} w={90} label={o.span === 'weeks' ? 'חודש:' : 'שבוע:'} value={o.when} />
    <Grid y={top} cols={[{ w: 44, label: 'התורנות', size: 3.9 }, ...cols.map(c => ({ label: o.span === 'weeks' ? [c, 'מ־___'] : c, center: true, size: 3.8 }))]} headH={o.span === 'weeks' ? 12 : 9} rh={rh}
      rows={duties.map((d, r) => [wrap(d, 41, 3.9).slice(0, 2), ...cols.map((_, c) => cell(r, c))])} />
    <T x={100} y={top + 15 + duties.length * rh} size={3.8} fill="#333">{fill ? 'השיבוץ נעשה לפי סדר הרשימה ומתחלף בכל עמודה. אפשר לתקן ביד.' : 'כותבים את שמות התורנים בכל משבצת. טיפ: תורנות קצרה וברורה עדיפה על הרבה משימות.'}</T>
    <rect x={8} y={top + 21 + duties.length * rh} width={184} height={20} rx={3} fill="#fff" stroke={INK} strokeWidth={0.4} strokeDasharray="2 1.4" />
    <T x={100} y={top + 29 + duties.length * rh} size={4.4} weight={700}>תורן/ית טוב/ה — עושה את התורנות עד הסוף, ומבקש/ת עזרה כשצריך</T>
    <T x={100} y={top + 36 + duties.length * rh} size={3.8} fill="#444">בסוף התורנות מסמנים ✓ בפינת המשבצת</T>
  </Sheet> }]
}

function TripSheet({ info, o }) {
  const L = LABELS[info.kind]
  const top = headBottom(info) + 4
  const bring = lines(o.bring).slice(0, 6)
  const slipTop = 172
  const consent = `אני, ____________________, הורה של ____________________ מ${info.kind === 'gan' ? 'גן' : 'כיתה'} ________, מאשר/ת את השתתפות בני/בתי בפעילות: ${o.activity || '____________________'}, שתתקיים בתאריך ${o.date || '__________'}.`
  return [{ key: 'trip', svg: <Sheet label="יציאה לטיול ואישור הורים">
    <Head title="יציאה לפעילות — מכתב להורים" info={info} />
    <T x={192} y={top + 6} size={4.4} anchor="start" weight={700}>הורים יקרים, שלום רב.</T>
    <T x={192} y={top + 12.5} size={4.2} anchor="start">{`אנו שמחים לעדכן על פעילות מחוץ ל${L.placeName === 'הגן' ? 'גן' : 'כיתה'}. הנה כל הפרטים:`}</T>
    <FieldLine right={192} y={top + 22} w={184} label="הפעילות:" value={o.activity} />
    <FieldLine right={192} y={top + 31} w={90} label="תאריך:" value={o.date} />
    <FieldLine right={98} y={top + 31} w={90} label="יעד:" value={o.place} />
    <FieldLine right={192} y={top + 40} w={60} label="יציאה בשעה:" value={o.depart} />
    <FieldLine right={128} y={top + 40} w={60} label="חזרה משוערת:" value={o.back} />
    <FieldLine right={64} y={top + 40} w={56} label="עלות:" value={o.cost} />
    <FieldLine right={192} y={top + 49} w={184} label="נקודת יציאה וחזרה:" value={o.meet} />
    <T x={192} y={top + 59} size={4.2} anchor="start" weight={700}>מה להביא:</T>
    {(bring.length ? bring : ['', '', '']).map((b, i) => <g key={i}>
      <rect x={186} y={top + 66 + i * 6 - 2.8} width={3.6} height={3.6} rx={0.5} fill="none" stroke={INK} strokeWidth={0.3} />
      <T x={183} y={top + 66 + i * 6} size={4} anchor="start">{b}</T>
      {!b && <line x1={100} x2={182} y1={top + 67 + i * 6} y2={top + 67 + i * 6} stroke="#999" strokeWidth={0.25} />}
    </g>)}
    {(() => { const y = top + 66 + Math.max(bring.length, 3) * 6 + 4; return <g>
      <FieldLine right={192} y={y} w={184} label="הערות:" value={o.notes} />
      <T x={192} y={y + 9} size={4.2} anchor="start">{`נבקש להחזיר את הספח החתום עד ${o.due || '__________'}. לשאלות: ${o.contact || '____________________'}`}</T>
      <T x={8} y={y + 18} size={4.2} anchor="end" weight={700}>{`בברכה, ${info.teacher || '____________'}`}</T>
    </g> })()}
    <line x1={4} x2={196} y1={slipTop} y2={slipTop} stroke="#333" strokeWidth={0.4} strokeDasharray="3 2" />
    <T x={194} y={slipTop + 1.5} size={5} anchor="start">✂</T>
    <T x={100} y={slipTop - 2} size={3.2} fill="#555">גוזרים כאן ומחזירים את הספח</T>
    <T x={100} y={slipTop + 11} size={6.5} weight={800}>ספח אישור הורים</T>
    {wrap(consent, 180, 4.3).map((t, i) => <T key={i} x={192} y={slipTop + 21 + i * 7} size={4.3} anchor="start">{t}</T>)}
    {(() => { const y = slipTop + 21 + wrap(consent, 180, 4.3).length * 7 + 4; return <g>
      <T x={192} y={y} size={4.2} anchor="start">מידע שחשוב שהצוות יידע (רגישויות, תרופות, צרכים מיוחדים):</T>
      <line x1={8} x2={192} y1={y + 8} y2={y + 8} stroke="#999" strokeWidth={0.25} />
      <line x1={8} x2={192} y1={y + 15} y2={y + 15} stroke="#999" strokeWidth={0.25} />
      <FieldLine right={192} y={y + 25} w={92} label="טלפון זמין ביום הפעילות:" />
      <FieldLine right={96} y={y + 25} w={88} label="שם ההורה:" />
      <FieldLine right={192} y={y + 35} w={92} label="חתימה:" />
      <FieldLine right={96} y={y + 35} w={88} label="תאריך:" />
    </g> })()}
  </Sheet> }]
}

const EQUIP_PRESETS = {
  trip: { label: '🚌 לטיול', title: 'רשימת ציוד לטיול', items: 'בקבוק מים מלא (לפחות ליטר וחצי)\nכובע\nקרם הגנה\nארוחת בוקר וחטיף\nנעליים סגורות ונוחות\nתיק גב קטן\nשקית לאשפה\nתרופות אישיות (בתיאום עם הצוות)' },
  class: { label: '🏫 לכיתה', title: 'ציוד לכיתה', items: 'טושים ללוח\nמספריים\nדבק סטיק\nצבעים\nבריסטולים\nמגבונים\nממחטות\nסלוטייפ' },
  event: { label: '🎉 לאירוע', title: 'רשימת ציוד לאירוע', items: 'מפות ושקיות אשפה\nצלחות וכוסות\nמים ושתייה\nרמקול\nכבל מאריך\nקישוטים\nמדבקות שם\nערכת עזרה ראשונה' },
}
function EquipmentSheet({ info, o }) {
  const items = lines(o.items).slice(0, 26)
  const n = Math.max(items.length + 4, 18)
  const top = headBottom(info) + 9
  const rh = Math.min(9, (258 - top - 9) / n)
  return [{ key: 'eq', svg: <Sheet label={o.title}>
    <Head title={o.title || 'רשימת ציוד'} info={info} />
    <FieldLine right={192} y={top - 3} w={90} label="לתאריך:" value={o.date} />
    <Grid y={top} cols={[{ w: 9, label: '✓', center: true }, { label: 'פריט' }, { w: 18, label: 'כמות', center: true }, { w: 40, label: 'מי מביא / אחראי' }, { w: 34, label: 'הערות' }]} rh={rh} size={Math.min(4.2, rh * 0.52)}
      rows={Array.from({ length: n }, (_, i) => [{ box: true }, items[i] || '', '', '', ''])} />
  </Sheet> }]
}

const CERT_TEXT = {
  excellence: { title: 'תעודת הצטיינות', to: 'מוענקת ל', text: 'על הישגים יפים, התמדה ורצון ללמוד ולהשתפר. אנחנו גאים בך ומאחלים לך המשך הצלחה!' },
  thanks: { title: 'מכתב הוקרה', to: 'מוקדש ל', text: 'בתודה ובהערכה על העשייה, על ההשקעה ועל הלב הגדול. בזכותך הכול נעשה טוב יותר.' },
}
function Certificate({ y, h, name, o, info, half }) {
  const c = CERT_TEXT[o.kind]
  const s = half ? 0.72 : 1
  const body = wrap(o.text || c.text, 140, 6 * s).slice(0, 4)
  return <g>
    <rect x={10} y={y + 6} width={180} height={h - 12} rx={4} fill="#fff" stroke={INK} strokeWidth={1.1} />
    <rect x={14} y={y + 10} width={172} height={h - 20} rx={3} fill="none" stroke={INK} strokeWidth={0.35} strokeDasharray="1.2 1.2" />
    {[[22, y + 18], [178, y + 18], [22, y + h - 18], [178, y + h - 18]].map(([x, yy], i) => <polygon key={i} points={starPts(x, yy, 5 * s)} fill={o.color ? '#ffd23f' : '#fff'} stroke={INK} strokeWidth={0.4} />)}
    <polygon points={starPts(100, y + h * 0.15, 9 * s)} fill={o.color ? '#ffd23f' : '#fff'} stroke={INK} strokeWidth={0.5} />
    <T x={100} y={y + h * 0.29} size={17 * s} weight={800}>{c.title}</T>
    <line x1={60} x2={140} y1={y + h * 0.33} y2={y + h * 0.33} stroke={INK} strokeWidth={0.3} />
    <T x={100} y={y + h * 0.40} size={5.6 * s} fill="#444">{c.to}:</T>
    <T x={100} y={y + h * 0.50} size={13 * s} weight={800}>{name || ' '}</T>
    {!name && <line x1={45} x2={155} y1={y + h * 0.505} y2={y + h * 0.505} stroke="#777" strokeWidth={0.35} />}
    {body.map((t, i) => <T key={i} x={100} y={y + h * 0.61 + i * 8 * s} size={6 * s}>{t}</T>)}
    <g transform={`translate(0 ${y + h - 28 * s - 4})`}>
      <line x1={120} x2={170} y1={8} y2={8} stroke="#777" strokeWidth={0.3} /><line x1={30} x2={80} y1={8} y2={8} stroke="#777" strokeWidth={0.3} />
      <T x={145} y={6} size={4.5 * s} weight={700}>{o.date || ''}</T><T x={145} y={13} size={3.8 * s} fill="#555">תאריך</T>
      <T x={55} y={6} size={4.5 * s} weight={700}>{o.signer || ''}</T><T x={55} y={13} size={3.8 * s} fill="#555">{o.signer ? (info.org || 'חתימה') : 'חתימה'}</T>
    </g>
  </g>
}
function AppreciationSheets({ info, names, o }) {
  const list = (o.useRoster ? names : lines(o.names)).slice(0, 60)
  const all = list.length ? list : ['']
  const per = o.perPage === '2' ? 2 : 1
  return chunk(all, per).map((page, p) => ({ key: `cert-${p}`, svg: <Sheet label={CERT_TEXT[o.kind].title}>
    {per === 1
      ? <Certificate y={20} h={230} name={page[0]} o={o} info={info} />
      : page.map((n, i) => <Certificate key={i} y={i * 135} h={135} name={n} o={o} info={info} half />)}
    {per === 2 && <line x1={4} x2={196} y1={135} y2={135} stroke="#999" strokeWidth={0.3} strokeDasharray="3 2" />}
  </Sheet> }))
}

function BirthdaySheet({ info, o }) {
  const L = LABELS[info.kind]
  const { list } = parseBirthdays(o.text)
  const top = headBottom(info) + 3
  const bw = 60, bh = (258 - top) / 4
  return [{ key: 'bd', svg: <Sheet label="לוח ימי הולדת">
    <Head title={`ימי ההולדת ${L.place} שלנו 🎂`} info={info} />
    {YEAR_MONTHS.map((mm, i) => {
      const col = i % 3, row = Math.floor(i / 3), x = 192 - (col + 1) * bw - col * 2, y = top + row * bh
      const kids = list.filter(k => k.month === mm.m + 1).sort((a, b) => a.day - b.day)
      const size = kids.length > 9 ? 3 : kids.length > 6 ? 3.5 : 4.2, lh = Math.min(5.6, (bh - 13) / Math.max(kids.length, 1))
      return <g key={mm.key}>
        <rect x={x} y={y} width={bw} height={bh - 2} rx={3} fill="#fff" stroke={INK} strokeWidth={0.5} />
        <rect x={x} y={y} width={bw} height={8.5} rx={3} fill={o.color ? ['#ffe1e8', '#fff0c9', '#dff3ff', '#e6f8e4'][i % 4] : SOFT} stroke={INK} strokeWidth={0.5} />
        <T x={x + bw / 2} y={y + 6} size={4.6} weight={800}>{`${HEB_MONTHS[mm.m]} ${mm.y}`}</T>
        {kids.length ? kids.slice(0, 14).map((k, j) => <T key={j} x={x + bw - 3} y={y + 14 + j * lh} size={size} anchor="start">{`${k.day} · ${k.name}`}</T>)
          : Array.from({ length: Math.floor((bh - 14) / 7) }, (_, j) => <line key={j} x1={x + 3} x2={x + bw - 3} y1={y + 16 + j * 7} y2={y + 16 + j * 7} stroke="#ccc" strokeWidth={0.25} />)}
      </g>
    })}
  </Sheet> }]
}

const ROUTINE_ICONS = [[/קבלת|בוקר טוב|הגעה/, '🌞'], [/מפגש|מעגל/, '🗣️'], [/ארוחת בוקר|ארוחת עשר|אוכל|ארוחה/, '🥪'], [/צהריים/, '🍽️'], [/חצר|חוץ|משחק בחוץ/, '🛝'], [/סיפור|ספר/, '📖'], [/יצירה|ציור/, '🎨'], [/פינות|קבוצות|משחק/, '🧩'], [/שיר|מוזיקה|ריקוד|תנועה|ספורט|התעמלות/, '🎵'], [/מנוחה|שקט|רגיעה/, '😌'], [/נטילת|ידיים|שירותים|רחצה/, '🧼'], [/סידור|לסדר|ניקיון/, '🧹'], [/פרידה|הביתה|איסוף/, '👋'], [/שבת|קבלת שבת/, '🕯️'], [/חגיגה|יום הולדת/, '🎉'], [/שיעור|למידה|לימוד/, '✏️']]
const routineIcon = text => (ROUTINE_ICONS.find(([re]) => re.test(text)) || [null, '⭐'])[1]
function RoutineSheet({ info, o }) {
  const L = LABELS[info.kind]
  const items = parseRoutine(o.text)
  const top = headBottom(info) + 2
  const rh = Math.min(26, (260 - top) / Math.max(items.length, 1))
  return [{ key: 'rt', svg: <Sheet label="סדר היום">
    <Head title={o.title || `סדר היום ${L.place}`} info={info} />
    {items.map((it, i) => { const y = top + i * rh; return <g key={i}>
      <rect x={10} y={y + 1} width={180} height={rh - 2.5} rx={rh / 4} fill={o.color && i % 2 ? '#fff6cf' : '#fff'} stroke={INK} strokeWidth={0.6} />
      <circle cx={178} cy={y + rh / 2 - 0.2} r={rh / 2 - 3} fill={o.color ? '#e3f1ff' : '#fff'} stroke={INK} strokeWidth={0.45} />
      <text x={178} y={y + rh / 2 + rh * 0.13} fontSize={rh * 0.42} textAnchor="middle">{routineIcon(it.what)}</text>
      <T x={162} y={y + rh / 2 + rh * 0.1} size={Math.min(8, rh * 0.3)} anchor="start" weight={800}>{it.what}</T>
      {o.times && it.time && <T x={16} y={y + rh / 2 + rh * 0.1} size={Math.min(6.5, rh * 0.26)} anchor="start" weight={700} fill="#333" direction="ltr">{it.time}</T>}
    </g> })}
  </Sheet> }]
}

// ── Per-template settings: defaults, controls, sheets and copy ───────────────

const TA = 'mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white p-2 text-base font-normal leading-7'
function Area({ label, value, onChange, rows = 5, placeholder, hint }) {
  return <label className="block font-bold">{label}{hint && <span className="mr-1 text-sm font-normal text-[var(--muted-foreground)]">{hint}</span>}
    <textarea rows={rows} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className={TA} />
  </label>
}
function Input({ label, value, onChange, placeholder, maxLength = 60 }) {
  return <label className="block font-bold">{label}
    <input value={value} maxLength={maxLength} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
  </label>
}
function Check({ label, checked, onChange }) {
  return <label className="flex min-h-11 items-center gap-2 font-bold"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-5 w-5" />{label}</label>
}
const ROWS = [['20', '20 שורות'], ['25', '25'], ['30', '30'], ['35', '35']]
const MONTH_OPTIONS = YEAR_MONTHS.map(x => [x.key, `${HEB_MONTHS[x.m]} ${x.y}`])
const currentMonthKey = () => { const d = new Date(); const k = `${d.getFullYear()}-${d.getMonth()}`; return YEAR_MONTHS.some(x => x.key === k) ? k : YEAR_MONTHS[0].key }

const DEFAULT_SKILLS = {
  school: 'קריאה שוטפת\nהבנת הנקרא\nכתיבה\nחשבון בעל פה\nפתרון בעיות\nעבודה בקבוצה\nהשתתפות בשיעור\nארגון ועצמאות',
  gan: 'מוטוריקה עדינה (גזירה, אחיזת עיפרון)\nמוטוריקה גסה\nשפה ושיח\nמודעות פונולוגית\nזיהוי אותיות\nספירה וכמויות\nמשחק עם חברים\nעצמאות בשגרה',
}
const DEFAULT_DUTIES = {
  school: 'ניקיון הלוח\nסידור הכיסאות בסוף היום\nחלוקת דפים וספרים\nהשקיית העציצים\nכיבוי אורות ומזגן\nאחראי/ת ספרייה כיתתית',
  gan: 'עריכת שולחן לארוחה\nהשקיית הצמחים\nסידור פינת הבובות\nעזרה בחלוקת הכוסות\nמנהל/ת מפגש הבוקר\nאחראי/ת לוח מזג האוויר',
}
const DEFAULT_ROUTINE = '07:30 | קבלת בוקר ומשחק חופשי\n08:30 | מפגש בוקר\n09:00 | נטילת ידיים וארוחת בוקר\n09:30 | משחק בפינות ובקבוצות\n10:30 | משחק בחצר\n11:30 | מפגש וסיפור\n12:15 | ארוחת צהריים\n13:00 | יצירה ומשחק שקט\n14:00 | פרידה והולכים הביתה'

const T_COPY = {
  'student-list': {
    seoTitle: 'רשימת תלמידים להדפסה עם עמודות לסימון — עם שמות הכיתה',
    description: 'רשימת תלמידים להדפסה בחינם: שמות הכיתה מודפסים אוטומטית, עם עמודות ריקות או כותרות משלכם — לאישורים, תשלומים, החזרת ספרים ובדיקת שיעורי בית.',
    sub: 'שמות הכיתה מודפסים לבד — עמודות לסימון לכל צורך',
    paragraphs: ['רשימה שמית עם עמודות ריקות היא הכלי הכי שימושי במגירה של כל מורה וגננת: בודקים מי החזיר אישור לטיול, מי שילם, מי הגיש עבודה ומי קיבל ספר. במקום לכתוב את השמות ביד בכל פעם, מקלידים אותם פעם אחת ומדפיסים כמה רשימות שצריך.', 'אפשר להשאיר את העמודות ריקות ולכתוב כותרות ביד, או להקליד כותרות — למשל "אישור טיול", "תשלום", "החזיר ספר" — ולקבל אותן מודפסות. הרשימה מתחלקת לבד לכמה דפים אם יש יותר מ־34 שמות.'],
    faq: [{ q: 'איך מכניסים את שמות התלמידים?', a: 'בתיבת "השמות של הכיתה" כותבים שם אחד בכל שורה ולוחצים "שמירה בדפדפן". השמות נשמרים רק במכשיר הזה ומשמשים גם ביומן הנוכחות, במעקב המיומנויות ובלוח התורנויות.' }, { q: 'אפשר רשימה ריקה בלי שמות?', a: 'כן. בלי שמות מתקבלת רשימה ממוספרת עם 20 עד 35 שורות ריקות.' }],
  },
  attendance: {
    seoTitle: 'יומן נוכחות להדפסה — חודשי, לשנת תשפ״ז, עם שמות התלמידים',
    description: 'יומן נוכחות חודשי להדפסה בחינם: כל ימי הלימודים בחודש עם יום בשבוע, חגים ומועדים מסומנים, עמודת סיכום ומקרא — לכיתה ולגן, ספטמבר 2026 עד אוגוסט 2027.',
    sub: 'בוחרים חודש — ומקבלים טבלה עם כל ימי הלימודים, השמות והחגים',
    paragraphs: ['יומן נוכחות מודפס עדיין שימושי מאוד: בטיול, בחוג, בצהרון, בגן או כשהמערכת הממוחשבת לא זמינה. כאן בוחרים חודש בשנת תשפ״ז ומקבלים טבלה עם כל הימים בחודש — בלי שבתות, ועם או בלי ימי שישי — ומעל כל עמודה המספר והיום בשבוע.', 'ימי חג ומועדים מוצללים ומופיעים בשמם מתחת לטבלה, כדי שיהיה קל לראות מתי אין לימודים. שימו לב שימי החופשה בפועל נקבעים בלוח החופשות של משרד החינוך ושל הרשות המקומית — כדאי לבדוק גם את עמוד חופשות בית הספר.', 'במקרא יש סימנים קבועים לנוכחות, חיסור, איחור, חיסור מוצדק ויציאה מוקדמת, ובסוף כל שורה עמודה לסיכום החיסורים בחודש.'],
    faq: [{ q: 'האם החגים מסומנים נכון לשנת תשפ״ז?', a: 'כן. התאריכים מחושבים לפי הלוח העברי לשנת תשפ״ז (ספטמבר 2026 עד אוגוסט 2027) — ראש השנה, יום כיפור, סוכות, חנוכה, פורים, פסח, ימי הזיכרון והעצמאות, שבועות ועוד.' }, { q: 'למה אין שבתות ביומן?', a: 'השבתות מושמטות כדי לחסוך מקום. אפשר לבחור אם לכלול את ימי שישי — למשל בגן או בבית ספר שלומדים בו שישה ימים.' }, { q: 'כמה תלמידים נכנסים בדף?', a: 'עד 32 שמות בדף. ברשימה ארוכה יותר היומן ממשיך לדף נוסף.' }],
  },
  'skills-tracker': {
    seoTitle: 'טבלת מעקב התקדמות לפי מיומנויות להדפסה — לגן ולכיתה',
    description: 'טבלת מעקב מיומנויות להדפסה: שמות התלמידים מול המיומנויות שבחרתם, עם סולם סימון ומקום לתצפיות. מתאים לגננות, למורות ולחינוך המיוחד.',
    sub: 'תלמיד מול מיומנות — רואים את כל הכיתה בדף אחד',
    paragraphs: ['טבלת מעקב לפי מיומנויות מראה בדף אחד איפה כל ילד עומד: מי כבר שולט, מי בתהליך ומי צריך עוד תרגול. כך קל לתכנן קבוצות עבודה, לבחור מי יקבל חיזוק ולהכין שיחות עם הורים.', 'כותבים עד 10 מיומנויות — למשל מוטוריקה עדינה, זיהוי אותיות, ספירה או עבודה בקבוצה — ובוחרים סולם: סימן פשוט, סולם 1–4, או תאריך שבו המיומנות הופיעה לראשונה. בחינוך המיוחד אפשר לכתוב מטרות אישיות מתוך התוכנית החינוכית במקום מיומנויות כלליות.', 'טיפ: עדיף מעט מיומנויות ממוקדות שבודקים שוב כל חודש-חודשיים, מאשר רשימה ארוכה שלא מספיקים למלא.'],
    faq: [{ q: 'כמה מיומנויות אפשר להכניס?', a: 'עד 10 מיומנויות בדף אחד. הכותרות נשברות לכמה שורות כדי שיהיה מקום לסמן.' }, { q: 'מתאים לחינוך המיוחד?', a: 'כן. אפשר לכתוב מטרות אישיות או מיומנויות קטנות מאוד, ולבחור בסולם "תאריך הצלחה" כדי לתעד התקדמות לאורך זמן.' }],
  },
  'duty-roster': {
    seoTitle: 'לוח תורנויות לכיתה ולגן להדפסה — עם שיבוץ אוטומטי',
    description: 'לוח תורנויות להדפסה: כותבים את התורנויות ומקבלים טבלה לכל יום בשבוע או לכל שבוע בחודש, עם אפשרות לשבץ את שמות הילדים אוטומטית.',
    sub: 'התורנויות שלכם, לכל יום או לכל שבוע — והשמות משתבצים לבד',
    paragraphs: ['לוח תורנויות ברור חוסך ויכוחים ונותן לכל ילד תפקיד ואחריות. כותבים את התורנויות של הכיתה או הגן — ניקיון הלוח, השקיית עציצים, עריכת שולחן — ובוחרים אם הלוח לשבוע (יום אחר יום) או לחודש (שבוע אחר שבוע).', 'אם רשימת השמות שמורה, אפשר לבקש שיבוץ אוטומטי: השמות מתחלקים לפי הסדר ומתחלפים בכל עמודה, כך שכולם מקבלים תור. אפשר גם להדפיס לוח ריק ולמלא ביחד עם הילדים.'],
    faq: [{ q: 'איך עובד השיבוץ האוטומטי?', a: 'השמות מהרשימה נכנסים לפי הסדר: בעמודה הראשונה הילדים הראשונים, ובכל עמודה הבאה ממשיכים מאיפה שהפסקנו. כשהרשימה נגמרת חוזרים להתחלה.' }, { q: 'מתאים לגן?', a: 'כן. בחרו "גן" למעלה וקבלו תורנויות שמתאימות לגן, כמו עריכת שולחן ולוח מזג האוויר.' }],
  },
  birthdays: {
    seoTitle: 'לוח ימי הולדת לכיתה ולגן להדפסה — 12 חודשים עם השמות',
    description: 'לוח ימי הולדת לכיתה ולגן: מקלידים שם ותאריך ומקבלים דף A4 עם 12 חודשים מספטמבר עד אוגוסט, וכל הילדים לפי הסדר. השמות נשארים בדפדפן בלבד.',
    sub: 'שם ותאריך בכל שורה — ומקבלים לוח שנתי מוכן לתלייה',
    paragraphs: ['לוח ימי הולדת עוזר לא לפספס אף ילד — במיוחד בחודשי החופש ובחגים, כשקל לשכוח. בלוח הזה החודשים מסודרים לפי שנת הלימודים, מספטמבר ועד אוגוסט, ובכל חודש הילדים מופיעים לפי התאריך.', 'כותבים בכל שורה שם ותאריך, למשל "נועה 12/3". אם רשימת הכיתה שמורה, אפשר להכניס את כל השמות בלחיצה ולהשלים רק את התאריכים. לילדים שנולדו בקיץ כדאי לקבוע מראש יום חגיגה בשנת הלימודים — למשל "חצי יום הולדת".'],
    faq: [{ q: 'באיזה פורמט כותבים את התאריך?', a: 'יום ואז חודש, עם קו נטוי או נקודה: 12/3 או 12.3. אפשר להוסיף שנה (12/3/2019), והיא לא תודפס.' }, { q: 'התאריכים נשמרים?', a: 'רק בדפדפן הזה, כדי שלא תצטרכו להקליד שוב. שום דבר לא נשלח לאתר.' }],
  },
  'weekly-plan': {
    seoTitle: 'תכנון שבועי להדפסה למורות ולגננות — דף תכנון ריק',
    description: 'דף תכנון שבועי להדפסה: יום אחר יום עם נושא, פעילויות, חומרים והערות, ומקום למטרות השבוע ולתזכורות. לגן ולכיתה, 5 או 6 ימים.',
    sub: 'נושא, פעילויות וחומרים לכל יום — ומטרות השבוע בדף אחד',
    paragraphs: ['תכנון שבועי על דף אחד עוזר לראות את השבוע כולו: מה עושים בכל יום, מה צריך להכין מראש ומה המטרה. כשהדף מונח על השולחן, קל לעדכן אותו בזמן אמת ולהעביר אותו לסייעת או לממלאת מקום.', 'אפשר לכתוב את תאריכי השבוע ואת נושא השבוע ולקבל אותם מודפסים, ולבחור 5 ימים (ראשון עד חמישי) או 6 ימים. בגן נוח לכתוב בעמודת "נושא" את הפינה או התחום, ובכיתה את המקצוע.'],
    faq: [{ q: 'יש גם תכנון שנתי?', a: 'כן — בעמוד התכנון השנתי לתשפ״ז יש את כל החודשים עם החגים והמועדים כבר בפנים.' }, { q: 'אפשר להשתמש בדף הזה לתכנון של רכזת?', a: 'כן. לרכזות יש גם רשימת משימות ייעודית עם עמודות "מול מי" ו"עד מתי".' }],
  },
  'yearly-plan': {
    seoTitle: 'תכנון שנתי תשפ״ז להדפסה — לפי חודשים וחגים, לגננות ולמורות',
    description: 'תכנון שנתי לשנת הלימודים תשפ״ז: כל חודש מספטמבר 2026 עם החגים והמועדים כבר כתובים, ומקום לנושאים, ליחידות לימוד ולאירועים. להדפסה בחינם.',
    sub: 'ספטמבר 2026 ואילך — החגים כבר בפנים, נשאר רק לתכנן',
    paragraphs: ['תכנון שנתי מתחיל מהלוח: מתי החגים, מתי החופשות ומה כדאי להספיק לפני כל אחד מהם. בדף הזה כל חודש בשנת תשפ״ז מופיע בשורה משלו, עם החודשים העבריים ועם רשימת החגים והמועדים ותאריכיהם — ראש השנה, סוכות, חנוכה, ט״ו בשבט, פורים, פסח, יום השואה, יום הזיכרון ויום העצמאות, ל״ג בעומר ושבועות.', 'בשאר העמודות כותבים את הנושאים ויחידות הלימוד, האירועים והפעילויות (טיולים, מסיבות, אספות הורים) והערות. אפשר לבחור את שנת הלימודים בבית הספר (ספטמבר–יוני) או שנה מלאה עד אוגוסט — למשל לגן שפועל גם בקיץ.', 'החגים מחושבים לפי הלוח העברי. ימי החופשה בפועל נקבעים בלוח החופשות של משרד החינוך — כדאי להשוות לפני שסוגרים תאריכים.'],
    faq: [{ q: 'מתי ראש השנה תשפ״ז?', a: 'ראש השנה תשפ״ז חל ב־12–13 בספטמבר 2026, ויום כיפור ב־21 בספטמבר 2026. כל התאריכים מופיעים בדף בשורה של החודש.' }, { q: 'כמה דפים יש בתכנון השנתי?', a: 'שני דפים: חמישה חודשים בכל דף לשנת לימודים (ספטמבר–יוני), או שישה חודשים בכל דף לשנה מלאה.' }],
  },
  'coordinator-tasks': {
    seoTitle: 'רשימת משימות לרכזת להדפסה — קבצים לרכזות',
    description: 'רשימת משימות לרכזת להדפסה: משימה, מול מי, עד מתי, עדיפות והערות — לרכזת שכבה, רכזת חברתית, פדגוגית או רכזת גן. אפשר להקליד משימות או להדפיס ריק.',
    sub: 'משימה, מול מי ועד מתי — כל מה שהרכזת צריכה לזכור, בדף אחד',
    paragraphs: ['לרכזת יש הרבה כדורים באוויר: מורים, הורים, הנהלה, ספקים ואירועים. רשימת משימות עם עמודות "מול מי" ו"עד מתי" עוזרת לראות מה דחוף, מה מחכה לתשובה ומה כבר נסגר.', 'אפשר לשנות את הכותרת — "משימות רכזת שכבה ד׳", "רכזת חברתית — חודש נובמבר" — ולהקליד את המשימות הקבועות, ולהשאיר שורות ריקות למשימות שיצוצו במהלך השבוע. בתחתית יש מקום לדברים שחשוב לבדוק.'],
    faq: [{ q: 'אילו עוד קבצים לרכזות יש באתר?', a: 'פרוטוקול ישיבת צוות, תיעוד שיחה עם הורים, תכנון שבועי ושנתי, מכתב יציאה לטיול ורשימת ציוד — כולם בעמוד הקבצים לרכזות ולגננות.' }, { q: 'אפשר לשמור את הרשימה?', a: 'פרטי הכותרת (בית הספר, השנה) נשמרים בדפדפן. את הרשימה עצמה מדפיסים או שומרים כ־PDF.' }],
  },
  'staff-meeting': {
    seoTitle: 'פרוטוקול ישיבת צוות להדפסה — תבנית מסודרת עם טבלת החלטות',
    description: 'תבנית פרוטוקול ישיבת צוות להדפסה: תאריך, משתתפים, סדר יום ממוספר, עיקרי הדיון וטבלת החלטות עם אחראי ותאריך יעד. לבית הספר ולגן.',
    sub: 'סדר יום, דיון והחלטות עם אחראי — פרוטוקול שאפשר לעבוד איתו',
    paragraphs: ['פרוטוקול טוב הוא לא תמליל של הישיבה אלא רשימה ברורה של מה הוחלט, מי אחראי ועד מתי. בתבנית הזו הדיון תופס מקום קטן, וטבלת ההחלטות — עם עמודת "בוצע" — עומדת במרכז.', 'אפשר להקליד מראש את סדר היום ואת שמות המשתתפים, להדפיס, ולמלא את השאר ביד במהלך הישיבה. בסוף מציינים מתי הישיבה הבאה ומתי הפרוטוקול הופץ.'],
    faq: [{ q: 'מה חשוב לכתוב בפרוטוקול ישיבת צוות?', a: 'תאריך, משתתפים, הנושאים שנדונו, ההחלטות — ולכל החלטה אחראי ותאריך יעד. בתחילת הישיבה הבאה כדאי לעבור על הטבלה ולסמן מה בוצע.' }],
  },
  'parent-meeting': {
    seoTitle: 'תיעוד שיחה עם הורים — טופס להדפסה למורות ולגננות',
    description: 'טופס תיעוד שיחה עם הורים להדפסה: מטרת השיחה, חוזקות, נושאים שעלו, מה שיתפו ההורים, סיכומים והמשך עם אחריות ותאריך. לבית הספר ולגן.',
    sub: 'שיחה מתועדת היטב — מתחילים מהחוזקות ומסיימים בהסכמות',
    paragraphs: ['תיעוד מסודר של שיחה עם הורים עוזר לזכור מה סוכם, לעקוב אחרי ההמשך ולהעביר מידע לגורמים נוספים כשצריך. הטופס בנוי כך שהשיחה מתחילה מהחוזקות של הילד, עוברת לנושאים שהצוות מעלה ולמה שההורים שיתפו, ומסתיימת בטבלת סיכומים עם אחריות ותאריך.', 'אפשר להקליד מראש את שם הילד, התאריך, המשתתפים ומטרת השיחה. המסמך כולל מידע אישי, ולכן מומלץ לשמור אותו בתיק סגור ולא להשאיר אותו על השולחן.'],
    faq: [{ q: 'הפרטים שאני מקלידה נשמרים?', a: 'פרטי הילד בטופס הזה לא נשמרים בכלל — רק פרטי הכותרת (בית הספר, הכיתה והשנה) נשמרים בדפדפן שלכם.' }, { q: 'צריך חתימה של ההורים?', a: 'זה לשיקולכם ולנהלי בית הספר. בטופס יש שורת חתימה להורים שאפשר להשאיר ריקה.' }],
  },
  'trip-permission': {
    seoTitle: 'אישור הורים ליציאה לטיול — מכתב וספח להדפסה',
    description: 'תבנית מכתב להורים על יציאה לטיול או לפעילות, עם ספח אישור הורים לגזירה: פרטי הפעילות, מה להביא, טלפון לחירום וחתימה. תבנית כללית למילוי.',
    sub: 'פרטי הפעילות להורים למעלה, ספח אישור לגזירה למטה',
    paragraphs: ['לפני כל יציאה מבית הספר או מהגן ההורים צריכים לדעת לאן יוצאים, מתי חוזרים ומה להביא — ולתת אישור. התבנית הזו מרכזת את כל הפרטים בחצי העליון של הדף, ובחצי התחתון ספח אישור הורים לגזירה, עם מקום למידע רפואי ולטלפון זמין.', 'ממלאים את הפרטים במסך ומדפיסים עותק לכל ילד. זו תבנית כללית בלבד ולא ייעוץ משפטי: את נוהלי היציאה, הליווי והאבטחה, וגם את נוסח האישור הנדרש, יש לבדוק מול הנהלת המוסד ולפי הנחיות משרד החינוך (חוזר המנכ״ל על טיולים ופעילות מחוץ לבית הספר).'],
    faq: [{ q: 'האם הטופס מחליף את הטפסים של בית הספר?', a: 'לא. זו תבנית כללית לנוחות. אם לבית הספר או לרשות יש טופס מחייב — משתמשים בו. את ההנחיות לטיולים קובעים משרד החינוך והנהלת המוסד.' }, { q: 'אפשר לשלוח את המכתב בוואטסאפ?', a: 'כן — בתצוגת ההדפסה בוחרים "שמירה כ־PDF" ושולחים את הקובץ. את הספח ההורים מדפיסים וחותמים, או מחזירים חתום בדרך שבית הספר קבע.' }],
  },
  'equipment-list': {
    seoTitle: 'רשימת ציוד להדפסה — לטיול, לכיתה ולאירוע',
    description: 'רשימת ציוד להדפסה עם תיבת סימון, כמות ו"מי מביא": רשימה מוכנה לטיול, לכיתה או לאירוע, שאפשר לערוך ולהשלים. חינם.',
    sub: 'רשימה מוכנה לטיול, לכיתה או לאירוע — עורכים ומדפיסים',
    paragraphs: ['רשימת ציוד מודפסת היא הדרך הפשוטה לוודא ששום דבר לא נשכח: מסמנים מה נארז, כמה צריך ומי מביא. בוחרים רשימה מוכנה — לטיול, לכיתה או לאירוע — ומוסיפים או מוחקים פריטים.', 'למסיבה או לאירוע כיתתי שההורים מביאים אליו ציוד, אפשר להשתמש גם ברשימת "מי מביא מה" השיתופית ולשלוח קישור לקבוצת ההורים.'],
    faq: [{ q: 'יש רשימת ציוד לכיתה א׳?', a: 'כן — ברשימת הציוד לבית הספר יש רשימות מוכנות לפי כיתה, מכיתה א׳ ואילך.' }],
  },
  appreciation: {
    seoTitle: 'תעודת הצטיינות ומכתב הוקרה להדפסה — לכל תלמיד בכיתה',
    description: 'תעודת הצטיינות או מכתב הוקרה להדפסה: תעודה נפרדת לכל שם ברשימת הכיתה, עם נוסח מוכן או משלכם, תאריך וחתימה. גם מכתב הוקרה להורים ולצוות.',
    sub: 'תעודה לכל שם ברשימה — או מכתב הוקרה להורה, לסייעת ולצוות',
    paragraphs: ['תעודת הצטיינות או מכתב הוקרה הם דרך פשוטה לומר תודה ולהראות שראינו. כאן מכינים בבת אחת תעודה לכל תלמיד ברשימה, או מכתב הוקרה להורים שהתנדבו, לסייעת, לצוות ולאנשי בית הספר.', 'אפשר לכתוב נוסח אישי — עדיף משפט אחד שמספר מה בדיוק היה טוב — ולבחור תעודה אחת גדולה בעמוד או שתיים בעמוד. התעודה נראית טוב גם בהדפסה בשחור-לבן.'],
    faq: [{ q: 'יש תעודות נוספות באתר?', a: 'כן — "כוכב/ת השבוע" לגן ולכיתה, ותעודות ליום הולדת ולמשחקים בעמוד התעודות.' }],
  },
  'daily-routine': {
    seoTitle: 'סדר יום בגן להדפסה — עם שעות וסמלים לתלייה',
    description: 'סדר יום בגן להדפסה: כותבים שעה ופעילות בכל שורה ומקבלים לוח גדול עם סמל לכל פעילות — קבלת בוקר, מפגש, ארוחה, חצר, סיפור ופרידה. גם לכיתה.',
    sub: 'שעה ופעילות בכל שורה — והסמלים מתווספים לבד',
    paragraphs: ['סדר יום קבוע ונראה לעין עוזר לילדים לדעת מה מחכה להם, ומרגיע במיוחד ילדים שקשה להם עם מעברים. לוח עם סמל גדול לכל פעילות מאפשר גם לילדים שעוד לא קוראים להבין מה עכשיו ומה אחר כך.', 'כותבים בכל שורה שעה ופעילות, למשל "08:30 | מפגש בוקר", והסמל נבחר לפי הפעילות. אפשר להסתיר את השעות לילדים צעירים, או לשנות את הסדר בימים מיוחדים כמו קבלת שבת.', 'בחינוך המיוחד ולילדים שזקוקים לתמיכה בתקשורת, כדאי לשלב את הלוח עם כרטיסי תקשורת חזותיים שהילד יכול להצביע עליהם.'],
    faq: [{ q: 'אפשר לשנות את הסמלים?', a: 'הסמל נבחר אוטומטית לפי מילים כמו "ארוחה", "חצר", "סיפור" או "פרידה". אם אין התאמה מופיע כוכב.' }, { q: 'מתאים גם לכיתה?', a: 'כן. בחרו "בית ספר" למעלה, והכותרת תהיה "סדר היום בכיתה". אפשר לכתוב שיעורים והפסקות.' }],
  },
}

const SENSORY = { href: '/printables/sensory-communication-cards', label: 'כרטיסי תקשורת וויסות חושי' }
const RELATED = {
  'student-list': [{ href: '/classroom/roster', label: 'רשימת הכיתה שלי' }, { href: '/tools/team-generator', label: 'חלוקה לקבוצות' }, { href: '/printables/name-labels', label: 'מדבקות שם' }],
  attendance: [{ href: '/school-holidays', label: 'חופשות בית הספר' }, { href: '/printables/calendar-5787', label: 'לוח שנה תשפ״ז' }, { href: '/classroom/roster', label: 'רשימת הכיתה שלי' }],
  'skills-tracker': [{ href: '/printables/kindergarten-worksheets', label: 'דפי עבודה לגן' }, { href: '/printables/fine-motor', label: 'דפי מוטוריקה עדינה' }, { href: '/parent-meetings', label: 'הרשמה לאספות הורים' }],
  'duty-roster': [{ href: '/tools/random-picker', label: 'גלגל שמות' }, { href: '/printables/chore-chart', label: 'טבלת מטלות לילדים' }, { href: '/classroom/roster', label: 'רשימת הכיתה שלי' }],
  birthdays: [{ href: '/guides/birthday-in-kindergarten', label: 'יום הולדת בגן' }, { href: '/printables/birthday-crown', label: 'כתר יום הולדת' }, { href: '/tools/hebrew-birthday', label: 'תאריך לידה עברי' }],
  'weekly-plan': [{ href: '/printables/class-schedule', label: 'מערכת שעות' }, { href: '/printables/calendar-5787', label: 'לוח שנה תשפ״ז' }, { href: '/games/classroom', label: 'משחקים לכיתה' }],
  'yearly-plan': [{ href: '/printables/calendar-5787', label: 'לוח שנה תשפ״ז' }, { href: '/school-holidays', label: 'חופשות בית הספר' }, { href: '/holidays', label: 'כל החגים' }],
  'coordinator-tasks': [{ href: '/parent-meetings', label: 'הרשמה לאספות הורים' }, { href: '/tools/bring-list', label: 'רשימת מי מביא מה' }, { href: '/classroom', label: 'כל הכלים לכיתה' }],
  'staff-meeting': [{ href: '/parent-meetings', label: 'הרשמה לאספות הורים' }, { href: '/tools/countdown-timer', label: 'טיימר לישיבה' }, { href: '/classroom', label: 'כל הכלים לכיתה' }],
  'parent-meeting': [{ href: '/parent-meetings', label: 'הרשמה לאספות הורים' }, { href: '/thank-you-wall', label: 'קיר ברכות לגננת ולמורה' }],
  'trip-permission': [{ href: '/tools/bring-list', label: 'רשימת מי מביא מה' }, { href: '/school-holidays', label: 'חופשות בית הספר' }],
  'equipment-list': [{ href: '/printables/school-supplies-list', label: 'רשימת ציוד לבית הספר' }, { href: '/tools/bring-list', label: 'מי מביא מה — רשימה שיתופית' }],
  appreciation: [{ href: '/printables/star-of-the-week', label: 'כוכב/ת השבוע' }, { href: '/printables/certificates', label: 'תעודות להדפסה' }, { href: '/thank-you-wall', label: 'קיר ברכות לגננת ולמורה' }],
  'daily-routine': [SENSORY, { href: '/games/kindergarten', label: 'משחקים לגן' }, { href: '/printables/kindergarten-memory-book', label: 'יומן גן אישי' }],
}

function initialOptions(slug, kind) {
  switch (slug) {
    case 'student-list': return { title: 'רשימת תלמידים', sub: '', columns: '', blankCols: '8', rows: '30' }
    case 'attendance': return { month: currentMonthKey(), friday: kind === 'gan', rows: '30' }
    case 'skills-tracker': return { title: '', period: '', skills: DEFAULT_SKILLS[kind], scale: 'four', rows: '25' }
    case 'duty-roster': return { duties: DEFAULT_DUTIES[kind], span: 'days', friday: kind === 'gan', auto: true, when: '' }
    case 'birthdays': return { text: '', color: true }
    case 'weekly-plan': return { week: '', topic: '', friday: kind === 'gan' }
    case 'yearly-plan': return { range: kind === 'gan' ? 'full' : 'school' }
    case 'coordinator-tasks': return { title: 'רשימת משימות לרכזת', period: '', tasks: '' }
    case 'staff-meeting': return { date: '', time: '', place: '', chair: '', writer: '', people: '', agenda: '' }
    case 'parent-meeting': return { student: '', date: '', participants: '', purpose: '' }
    case 'trip-permission': return { activity: '', date: '', place: '', depart: '', back: '', meet: '', cost: '', bring: EQUIP_PRESETS.trip.items.split('\n').slice(0, 5).join('\n'), notes: '', due: '', contact: '' }
    case 'equipment-list': return { preset: 'trip', title: EQUIP_PRESETS.trip.title, items: EQUIP_PRESETS.trip.items, date: '' }
    case 'appreciation': return { kind: 'excellence', text: '', names: '', useRoster: false, date: '', signer: '', perPage: '1', color: true }
    case 'daily-routine': return { title: '', text: DEFAULT_ROUTINE, times: true, color: true }
    default: return {}
  }
}

function buildPages(slug, info, names, o) {
  const p = { info, names, o }
  switch (slug) {
    case 'student-list': return StudentListSheets(p)
    case 'attendance': return AttendanceSheets(p)
    case 'skills-tracker': return SkillsSheets(p)
    case 'duty-roster': return DutySheet(p)
    case 'birthdays': return BirthdaySheet(p)
    case 'weekly-plan': return WeeklyPlanSheet(p)
    case 'yearly-plan': return YearlyPlanSheets(p)
    case 'coordinator-tasks': return TasksSheet(p)
    case 'staff-meeting': return StaffMeetingSheet(p)
    case 'parent-meeting': return ParentMeetingSheet(p)
    case 'trip-permission': return TripSheet(p)
    case 'equipment-list': return EquipmentSheet(p)
    case 'appreciation': return AppreciationSheets(p)
    case 'daily-routine': return RoutineSheet(p)
    default: return []
  }
}

const USES_NAMES = ['student-list', 'attendance', 'skills-tracker', 'duty-roster']

function TemplateControls({ slug, o, set, info, roster }) {
  const L = LABELS[info.kind]
  const S = k => v => set(k, v)
  switch (slug) {
    case 'student-list': return <>
      <div className="grid gap-3 sm:grid-cols-2"><Input label="כותרת הרשימה" value={o.title} onChange={S('title')} placeholder="למשל: החזרת אישורים לטיול" /><Input label="שורת הסבר — רשות" value={o.sub} onChange={S('sub')} placeholder="למשל: עד יום חמישי" /></div>
      <Area label="כותרות לעמודות — אחת בכל שורה" hint="(רשות; ריק = עמודות ריקות)" value={o.columns} onChange={S('columns')} rows={3} placeholder={'אישור טיול\nתשלום\nהחזיר ספר'} />
      {!lines(o.columns).length && <><p className="font-bold">כמה עמודות ריקות?</p><Choice label="עמודות" value={o.blankCols} onChange={S('blankCols')} options={[['4', '4'], ['6', '6'], ['8', '8'], ['10', '10'], ['12', '12']]} /></>}
      {!roster.length && <><p className="font-bold">בלי שמות — כמה שורות?</p><Choice label="שורות" value={o.rows} onChange={S('rows')} options={ROWS} /></>}
    </>
    case 'attendance': return <>
      <label className="block font-bold">חודש<select value={o.month} onChange={e => set('month', e.target.value)} className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white p-3">{MONTH_OPTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <Check label="לכלול את ימי שישי" checked={o.friday} onChange={S('friday')} />
      {!roster.length && <><p className="font-bold">בלי שמות — כמה שורות?</p><Choice label="שורות" value={o.rows} onChange={S('rows')} options={ROWS} /></>}
    </>
    case 'skills-tracker': return <>
      <div className="grid gap-3 sm:grid-cols-2"><Input label="כותרת — רשות" value={o.title} onChange={S('title')} placeholder="מעקב התקדמות לפי מיומנויות" /><Input label="תקופה" value={o.period} onChange={S('period')} placeholder="למשל: מחצית א׳" /></div>
      <Area label="מיומנויות — אחת בכל שורה (עד 10)" value={o.skills} onChange={S('skills')} rows={6} />
      <button type="button" onClick={() => set('skills', DEFAULT_SKILLS[info.kind])} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">החזרת הרשימה המוצעת ל{info.kind === 'gan' ? 'גן' : 'כיתה'}</button>
      <p className="font-bold">סולם סימון</p><Choice label="סולם" value={o.scale} onChange={S('scale')} options={Object.entries(SKILL_SCALES).map(([k, v]) => [k, v.label])} />
      {!roster.length && <><p className="font-bold">בלי שמות — כמה שורות?</p><Choice label="שורות" value={o.rows} onChange={S('rows')} options={ROWS.slice(0, 2)} /></>}
    </>
    case 'duty-roster': return <>
      <Area label="התורנויות — אחת בכל שורה (עד 12)" value={o.duties} onChange={S('duties')} rows={6} />
      <Choice label="טווח" value={o.span} onChange={S('span')} options={[['days', '📅 לשבוע — יום אחר יום'], ['weeks', '🗓️ לחודש — שבוע אחר שבוע']]} />
      <Input label={o.span === 'weeks' ? 'חודש' : 'שבוע'} value={o.when} onChange={S('when')} placeholder={o.span === 'weeks' ? 'למשל: נובמבר' : 'למשל: 1–5.11'} />
      {o.span === 'days' && <Check label="לכלול את יום שישי" checked={o.friday} onChange={S('friday')} />}
      <Check label={roster.length ? `לשבץ אוטומטית את ${roster.length} השמות` : 'שיבוץ אוטומטי (צריך קודם לשמור שמות)'} checked={o.auto && roster.length > 0} onChange={S('auto')} />
    </>
    case 'birthdays': {
      const parsed = parseBirthdays(o.text)
      return <>
        <Area label="שם ותאריך בכל שורה" hint="(יום/חודש)" value={o.text} onChange={S('text')} rows={8} placeholder={'נועה 12/3\nאורי 4.11\nמאיה 28/6'} />
        <div className="flex flex-wrap gap-2">
          {roster.length > 0 && <button type="button" onClick={() => { const have = new Set(parsed.list.map(k => k.name).concat(parsed.missing)); set('text', [o.text.trim(), ...roster.filter(n => !have.has(n)).map(n => `${n} `)].filter(Boolean).join('\n')) }} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">הוספת שמות הכיתה ({roster.length})</button>}
          <Check label="בצבע" checked={o.color} onChange={S('color')} />
        </div>
        <p className="text-sm">{parsed.list.length} ימי הולדת בלוח{parsed.missing.length ? ` · ${parsed.missing.length} שורות עדיין בלי תאריך: ${parsed.missing.slice(0, 5).join(', ')}${parsed.missing.length > 5 ? '…' : ''}` : ''}. התאריכים נשמרים רק בדפדפן הזה.</p>
      </>
    }
    case 'weekly-plan': return <>
      <div className="grid gap-3 sm:grid-cols-2"><Input label="שבוע" value={o.week} onChange={S('week')} placeholder="למשל: 1–5.11.2026" /><Input label="נושא השבוע" value={o.topic} onChange={S('topic')} placeholder="למשל: הסתיו מגיע" /></div>
      <Check label="6 ימים (כולל שישי)" checked={o.friday} onChange={S('friday')} />
    </>
    case 'yearly-plan': return <Choice label="טווח" value={o.range} onChange={S('range')} options={[['school', '🎒 ספטמבר–יוני (10 חודשים)'], ['full', '☀️ ספטמבר–אוגוסט (12 חודשים)']]} />
    case 'coordinator-tasks': return <>
      <div className="grid gap-3 sm:grid-cols-2"><Input label="כותרת" value={o.title} onChange={S('title')} placeholder="רשימת משימות לרכזת" /><Input label="תקופה" value={o.period} onChange={S('period')} placeholder="למשל: שבוע 8–12.11" /></div>
      <Area label="משימות — אחת בכל שורה" hint="(רשות; השאר שורות ריקות)" value={o.tasks} onChange={S('tasks')} rows={5} placeholder={'לסגור מועד לטיול השכבתי\nלאסוף ציונים מהמורים המקצועיים\nלהכין את ישיבת הצוות'} />
    </>
    case 'staff-meeting': return <>
      <div className="grid gap-3 sm:grid-cols-3"><Input label="תאריך" value={o.date} onChange={S('date')} /><Input label="שעה" value={o.time} onChange={S('time')} /><Input label="מקום" value={o.place} onChange={S('place')} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Input label="מנחה" value={o.chair} onChange={S('chair')} /><Input label="רושם/ת" value={o.writer} onChange={S('writer')} /></div>
      <Input label="משתתפים" value={o.people} onChange={S('people')} maxLength={110} />
      <Area label="סדר היום — נושא בכל שורה" value={o.agenda} onChange={S('agenda')} rows={4} placeholder={'עדכונים מההנהלה\nהיערכות לטיול השנתי\nתלמידים שזקוקים לתמיכה'} />
    </>
    case 'parent-meeting': return <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block font-bold">שם {L.child}<input list="tt-roster" value={o.student} maxLength={40} onChange={e => set('student', e.target.value)} className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" /><datalist id="tt-roster">{roster.map(n => <option key={n} value={n} />)}</datalist></label>
        <Input label="תאריך" value={o.date} onChange={S('date')} />
      </div>
      <Input label="משתתפים בשיחה" value={o.participants} onChange={S('participants')} maxLength={110} />
      <Area label="מטרת השיחה — רשות" value={o.purpose} onChange={S('purpose')} rows={2} />
      <p className="text-sm">פרטי {L.child} בטופס הזה לא נשמרים — הם נמחקים כשסוגרים את העמוד.</p>
    </>
    case 'trip-permission': return <>
      <div className="grid gap-3 sm:grid-cols-2"><Input label="הפעילות" value={o.activity} onChange={S('activity')} placeholder="למשל: טיול לשמורת עין אפק" /><Input label="יעד" value={o.place} onChange={S('place')} /></div>
      <div className="grid gap-3 sm:grid-cols-4"><Input label="תאריך" value={o.date} onChange={S('date')} /><Input label="יציאה" value={o.depart} onChange={S('depart')} placeholder="08:00" /><Input label="חזרה" value={o.back} onChange={S('back')} placeholder="13:30" /><Input label="עלות" value={o.cost} onChange={S('cost')} placeholder="ללא / 25 ₪" /></div>
      <Input label="נקודת יציאה וחזרה" value={o.meet} onChange={S('meet')} />
      <Area label="מה להביא — פריט בכל שורה (עד 6)" value={o.bring} onChange={S('bring')} rows={4} />
      <div className="grid gap-3 sm:grid-cols-3"><Input label="הערות" value={o.notes} onChange={S('notes')} /><Input label="להחזיר את הספח עד" value={o.due} onChange={S('due')} /><Input label="לשאלות (שם/טלפון)" value={o.contact} onChange={S('contact')} /></div>
      <p className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-sm"><b>תבנית כללית, לא ייעוץ משפטי.</b> את נוהלי היציאה, הליווי והאבטחה ואת נוסח האישור המחייב בודקים מול הנהלת המוסד ולפי הנחיות משרד החינוך.</p>
    </>
    case 'equipment-list': return <>
      <Choice label="סוג הרשימה" value={o.preset} onChange={v => { set('preset', v); if (EQUIP_PRESETS[v]) { set('title', EQUIP_PRESETS[v].title); set('items', EQUIP_PRESETS[v].items) } }} options={[...Object.entries(EQUIP_PRESETS).map(([k, v]) => [k, v.label]), ['custom', '✏️ ריקה']]} />
      <div className="grid gap-3 sm:grid-cols-2"><Input label="כותרת" value={o.title} onChange={S('title')} /><Input label="לתאריך" value={o.date} onChange={S('date')} /></div>
      <Area label="פריטים — אחד בכל שורה" value={o.items} onChange={S('items')} rows={6} />
    </>
    case 'appreciation': return <>
      <Choice label="סוג" value={o.kind} onChange={S('kind')} options={[['excellence', '🏅 תעודת הצטיינות'], ['thanks', '💐 מכתב הוקרה']]} />
      {roster.length > 0 && <Check label={`תעודה לכל אחד מ־${roster.length} השמות ברשימת הכיתה`} checked={o.useRoster} onChange={S('useRoster')} />}
      {!o.useRoster && <Area label="למי? שם בכל שורה" hint="(ריק = מקום לכתוב ביד)" value={o.names} onChange={S('names')} rows={3} placeholder={'נועה כהן\nצוות הגן\nמשפחת לוי'} />}
      <Area label="נוסח" hint="(ריק = הנוסח המוצע)" value={o.text} onChange={S('text')} rows={3} placeholder={CERT_TEXT[o.kind].text} />
      <div className="grid gap-3 sm:grid-cols-2"><Input label="תאריך" value={o.date} onChange={S('date')} /><Input label="חתימה" value={o.signer} onChange={S('signer')} placeholder={info.teacher || L.teacher} /></div>
      <div className="flex flex-wrap items-center gap-3"><Choice label="כמה בעמוד" value={o.perPage} onChange={S('perPage')} options={[['1', 'אחת גדולה בעמוד'], ['2', 'שתיים בעמוד']]} /><Check label="כוכבים בצבע" checked={o.color} onChange={S('color')} /></div>
    </>
    case 'daily-routine': return <>
      <Input label="כותרת — רשות" value={o.title} onChange={S('title')} placeholder={`סדר היום ${L.place}`} />
      <Area label="שעה | פעילות — בכל שורה (עד 12)" value={o.text} onChange={S('text')} rows={9} />
      <div className="flex flex-wrap gap-4"><Check label="להציג שעות" checked={o.times} onChange={S('times')} /><Check label="בצבע" checked={o.color} onChange={S('color')} /><button type="button" onClick={() => set('text', DEFAULT_ROUTINE)} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">סדר יום לדוגמה</button></div>
      <p className="text-sm">רוצים גם כרטיסים חזותיים לכל פעילות? <Link className="font-bold underline" to={SENSORY.href}>כרטיסי תקשורת וויסות חושי</Link>.</p>
    </>
    default: return null
  }
}

// ── Shared details: header fields + the class roster (this browser only) ─────

function useTeacherInfo() {
  const [info, setInfo] = useState(() => ({ ...DEFAULT_INFO, ...readStore(INFO_KEY, {}) }))
  useEffect(() => { writeStore(INFO_KEY, info) }, [info])
  return [info, (k, v) => setInfo(s => ({ ...s, [k]: v }))]
}
function useRoster() {
  const [roster, setRoster] = useState(() => loadClassRoster())
  useEffect(() => {
    const on = e => setRoster(e.detail || loadClassRoster())
    window.addEventListener('ugabuga:class-roster', on)
    return () => window.removeEventListener('ugabuga:class-roster', on)
  }, [])
  return roster
}

function DetailsPanel({ info, setInfo, roster, showRoster = true }) {
  const L = LABELS[info.kind]
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const startEdit = () => { setText(roster.names.join('\n')); setOpen(true) }
  const save = () => { saveClassRoster({ className: roster.className || info.cls, names: cleanRosterNames(text) }); setOpen(false) }
  return <div className="space-y-3">
    <Choice label="בית ספר או גן" value={info.kind} onChange={v => setInfo('kind', v)} options={[['school', '🎒 בית ספר'], ['gan', '🧸 גן']]} />
    <div className="grid gap-3 sm:grid-cols-2">
      <Input label={`שם ${L.org === 'הגן' ? 'הגן' : 'בית הספר'}`} value={info.org} onChange={v => setInfo('org', v)} maxLength={40} />
      <Input label={L.cls} value={info.cls} onChange={v => setInfo('cls', v)} maxLength={20} placeholder={info.kind === 'gan' ? 'למשל: גן חצב' : 'למשל: ג׳2'} />
      <Input label={info.kind === 'gan' ? 'גננת' : 'מחנך/ת'} value={info.teacher} onChange={v => setInfo('teacher', v)} maxLength={30} />
      <Input label="שנת הלימודים" value={info.year} onChange={v => setInfo('year', v)} maxLength={12} />
    </div>
    <Check label="להדפיס את שורת הפרטים בראש הדף" checked={info.show} onChange={v => setInfo('show', v)} />
    {showRoster && <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold">👩‍🏫 השמות של {L.placeName}: {roster.names.length ? `${roster.names.length} שמות שמורים` : 'עוד לא נשמרו שמות'}</span>
        {!open && <button type="button" onClick={startEdit} className="rounded-xl border-2 border-slate-800 bg-white px-3 py-2 font-bold">{roster.names.length ? 'עריכת השמות' : 'הקלדת השמות'}</button>}
      </div>
      {open && <div className="mt-2 space-y-2">
        <textarea rows={8} value={text} onChange={e => setText(e.target.value)} aria-label="שמות, שם אחד בכל שורה" placeholder={'נועה\nאורי\nמאיה\nיונתן'} className={TA} />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} className="rounded-xl border-2 border-slate-900 bg-[var(--accent)] px-4 py-2 font-black text-white">שמירה בדפדפן ({cleanRosterNames(text).length})</button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-xl border-2 border-slate-700 bg-white px-3 py-2 font-bold">ביטול</button>
          {roster.names.length > 0 && <button type="button" onClick={() => { clearClassRoster(); setText(''); setOpen(false) }} className="rounded-xl border-2 border-slate-700 bg-white px-3 py-2 font-bold">מחיקה מהמכשיר</button>}
        </div>
      </div>}
      <p className="mt-2 text-sm">מקלידים פעם אחת — והשמות נכנסים לרשימות, ליומן הנוכחות, למעקב ולתורנויות. הם נשמרים רק בדפדפן הזה ולא נשלחים לשום מקום. <Link to="/classroom/roster" className="font-bold underline">רשימת הכיתה שלי</Link></p>
    </div>}
  </div>
}

// ── Pages ────────────────────────────────────────────────────────────────

export function TeacherTemplatePage() {
  const { slug } = useParams()
  const meta = teacherTemplate(slug)
  if (!meta) return <NotFound />
  return <TemplateView key={slug} slug={slug} meta={meta} />
}

function TemplateView({ slug, meta }) {
  const [, emoji, title, , group] = meta
  const [info, setInfo] = useTeacherInfo()
  const rosterState = useRoster()
  const roster = rosterState.names
  const [o, setO] = useState(() => {
    const base = initialOptions(slug, info.kind)
    if (slug === 'birthdays') base.text = readStore(BIRTHDAYS_KEY, '') || ''
    return base
  })
  const set = (k, v) => setO(s => ({ ...s, [k]: v }))
  useEffect(() => { if (slug === 'birthdays') writeStore(BIRTHDAYS_KEY, o.text) }, [slug, o.text])
  const [detailsOpen] = useState(() => !info.org && !info.cls)
  const pages = useMemo(() => buildPages(slug, info, roster, o), [slug, info, roster, o])
  const copy = T_COPY[slug]
  const siblings = TEACHER_TEMPLATES.filter(t => t[4] === group).map(([s, e, l]) => ({ href: `${TT_BASE}/${s}`, label: `${e} ${l}` }))
  return <PrintableShell
    path={`${TT_BASE}/${slug}`} seoTitle={copy.seoTitle} description={copy.description} emoji={emoji} h1={title} sub={copy.sub}
    crumbs={[{ label: 'קבצים לרכזות ולגננות', href: TT_BASE }]} siblings={siblings.length > 1 ? siblings : []}
    controls={<>
      <details className="rounded-2xl bg-white/60 p-3" open={detailsOpen}>
        <summary className="cursor-pointer font-black">🏫 פרטי {LABELS[info.kind].placeName} והשמות {info.org || info.cls ? `— ${[info.org, info.cls].filter(Boolean).join(' · ')}` : ''}</summary>
        <div className="mt-3"><DetailsPanel info={info} setInfo={setInfo} roster={rosterState} showRoster={USES_NAMES.includes(slug) || ['birthdays', 'appreciation', 'parent-meeting'].includes(slug)} /></div>
      </details>
      <TemplateControls slug={slug} o={o} set={set} info={info} roster={roster} />
    </>}
    pages={pages} printTitle={title} previewAll={pages.length > 1 && pages.length <= 4}
    extra={<p className="text-sm"><Link to={TT_BASE} className="font-bold underline">← כל הקבצים לרכזות, לכיתה ולגן</Link></p>}
    paragraphs={copy.paragraphs} faq={copy.faq} related={[...RELATED[slug], { href: TT_BASE, label: 'כל הקבצים לרכזות ולגננות' }]} />
}

// Existing pages on the site that belong in the same drawer.
const ALSO = {
  class: [['/classroom/roster', '👩‍🏫', 'רשימת הכיתה שלי', 'שומרים את השמות פעם אחת — לגלגל השמות, לחלוקה לקבוצות ולתבניות כאן'], ['/printables/name-labels', '🏷️', 'מדבקות שם', 'לספרים, למחברות ולציוד']],
  plan: [['/printables/class-schedule', '🕘', 'מערכת שעות', 'מערכת שעות ריקה או עם שם, 5 או 6 ימים'], ['/printables/calendar-5787', '📅', 'לוח שנה תשפ״ז', 'דף לכל חודש בשנת הלימודים, עם כל החגים'], ['/school-holidays', '🏖️', 'חופשות בית הספר', 'מתי לא לומדים השנה']],
  staff: [['/parent-meetings', '🗓️', 'הרשמה לאספות הורים', 'ההורים בוחרים שעה בקישור אחד']],
  events: [['/printables/school-supplies-list', '✏️', 'רשימת ציוד לבית הספר', 'לפי כיתה, עם סימון'], ['/tools/bring-list', '🧺', 'מי מביא מה?', 'רשימה שיתופית לקבוצת ההורים'], ['/printables/star-of-the-week', '⭐', 'כוכב/ת השבוע', 'תעודה צבעונית לגן ולכיתה'], ['/printables/certificates', '🏆', 'תעודות להדפסה', 'ליום הולדת, למשחקים ועוד']],
  gan: [[SENSORY.href, '🧩', 'כרטיסי תקשורת וויסות חושי', 'כרטיסים חזותיים לסדר היום ולרגשות'], ['/printables/kindergarten-memory-book', '📔', 'יומן גן אישי', 'חוברת זיכרונות לסוף השנה'], ['/printables/kindergarten-worksheets', '📝', 'דפי עבודה לגן', 'צלילים, אותיות ומוטוריקה']],
}

const HUB_FAQ = [
  { q: 'מה יש בקבצים לרכזות ולגננות?', a: 'ארבע־עשרה תבניות להדפסה: רשימת תלמידים עם עמודות לסימון, יומן נוכחות חודשי, מעקב מיומנויות, לוח תורנויות, לוח ימי הולדת, תכנון שבועי ושנתי לתשפ״ז, רשימת משימות לרכזת, פרוטוקול ישיבת צוות, תיעוד שיחה עם הורים, מכתב יציאה לטיול עם ספח אישור, רשימת ציוד, תעודת הצטיינות ומכתב הוקרה, וסדר יום בגן.' },
  { q: 'אפשר למלא את הטפסים במחשב?', a: 'כן. בכל תבנית ממלאים במסך את מה שרוצים — כותרות, תאריכים, שמות ומשימות — ורואים מיד איך הדף ייראה. את השאר ממלאים ביד אחרי ההדפסה, או שומרים כ־PDF.' },
  { q: 'איפה נשמרים שמות התלמידים?', a: 'רק בדפדפן שבו הקלדתם אותם (localStorage). הם לא נשלחים לאתר ולא לשום מקום אחר, ואפשר למחוק אותם בלחיצה. במחשב משותף בבית הספר כדאי למחוק אותם בסוף העבודה.' },
  { q: 'זה בחינם?', a: 'כן, כל התבניות חינמיות ובלי הרשמה. אפשר להדפיס כמה עותקים שרוצים.' },
  { q: 'הטפסים מתאימים להדפסה בשחור-לבן?', a: 'כן. כל הדפים בנויים מקווים וטבלאות ברורים, ונראים טוב גם במדפסת שחור-לבן של חדר המורים.' },
]

export default function TeacherTemplatesHub() {
  const [info, setInfo] = useTeacherInfo()
  const roster = useRoster()
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="קבצים לרכזות, ניהול כיתה וגן — טפסים ותבניות להדפסה" description="קבצים לרכזות, למורות ולגננות להדפסה בחינם: יומן נוכחות, רשימת תלמידים, מעקב מיומנויות, תכנון שנתי תשפ״ז, פרוטוקול ישיבת צוות, אישור יציאה לטיול, לוח ימי הולדת וסדר יום בגן." path={TT_BASE} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'קבצים לרכזות ולגננות' }]} />
    <header className="mx-auto max-w-3xl text-center">
      <div className="text-5xl" aria-hidden="true">🗂️</div>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">קבצים לרכזות, ניהול כיתה וגן</h1>
      <p className="mt-3 text-lg leading-8 text-[var(--muted-foreground)]">טפסים ותבניות להדפסה למורות, לרכזות ולגננות: ממלאים במסך, רואים את הדף ומדפיסים. את שמות הילדים מקלידים פעם אחת — והם נכנסים לרשימות, ליומן הנוכחות ולמעקב.</p>
    </header>

    <div className="mx-auto mt-6 max-w-3xl">
      <QuickAnswer q="איפה מוצאים טפסים לניהול כיתה וגן להדפסה?" a="כאן: 14 תבניות A4 חינמיות — יומן נוכחות חודשי לתשפ״ז, רשימת תלמידים עם עמודות לסימון, מעקב מיומנויות, תורנויות, ימי הולדת, תכנון שבועי ושנתי, משימות לרכזת, פרוטוקול ישיבת צוות, תיעוד שיחה עם הורים, אישור הורים לטיול, רשימת ציוד, תעודות וסדר יום בגן." rows={[['למי', 'מורות, מחנכות, רכזות וגננות — גם בחינוך המיוחד'], ['איך', 'ממלאים במסך או מדפיסים ריק, A4, גם בשחור-לבן'], ['פרטיות', 'השמות נשמרים רק בדפדפן שלכם']]} updated="2026-10-24" />
    </div>

    <section className="mx-auto mt-8 max-w-3xl wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-sm" aria-labelledby="tt-details">
      <h2 id="tt-details" className="text-2xl font-black">מתחילים מהפרטים <span className="text-base font-normal text-[var(--muted-foreground)]">(רשות — נשמר רק אצלכם)</span></h2>
      <p className="mb-3 mt-1">שם {LABELS[info.kind].org === 'הגן' ? 'הגן' : 'בית הספר'}, {LABELS[info.kind].cls}, {info.kind === 'gan' ? 'גננת' : 'מחנך/ת'} ושנה — יופיעו בראש כל דף. השמות ממלאים את הרשימות לבד.</p>
      <DetailsPanel info={info} setInfo={setInfo} roster={roster} />
    </section>

    {TEACHER_GROUPS.map(([g, label]) => <section key={g} className="mt-10" aria-labelledby={`tt-${g}`}>
      <h2 id={`tt-${g}`} className="mb-4 text-2xl font-black">{label}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEACHER_TEMPLATES.filter(t => t[4] === g).map(([s, e, t, d]) => <Link key={s} to={`${TT_BASE}/${s}`} className="block rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow-sm hover:bg-[var(--muted)]/30">
          <span className="text-3xl" aria-hidden="true">{e}</span><b className="mt-1 block text-lg">{t}</b><span className="mt-1 block text-sm text-[var(--muted-foreground)]">{d}</span>
        </Link>)}
        {ALSO[g].map(([href, e, t, d]) => <Link key={href} to={href} className="block rounded-2xl border-2 border-dashed border-[var(--border)] bg-white p-4 hover:bg-[var(--muted)]/30">
          <span className="text-3xl" aria-hidden="true">{e}</span><b className="mt-1 block text-lg">{t}</b><span className="mt-1 block text-sm text-[var(--muted-foreground)]">{d}</span>
        </Link>)}
      </div>
    </section>)}

    <section className="mx-auto mt-12 max-w-3xl space-y-3">
      <h2 className="text-2xl font-black">איך משתמשים?</h2>
      <ol className="list-decimal space-y-2 pr-6 leading-7">
        <li>ממלאים למעלה את פרטי בית הספר או הגן ואת שמות הילדים — פעם אחת.</li>
        <li>בוחרים תבנית, משנים כותרות, חודש, מיומנויות או משימות, ורואים את הדף מתעדכן.</li>
        <li>לוחצים "הדפסה או PDF": מדפיסים לכיתה, או שומרים קובץ ושולחים לצוות ולהורים.</li>
      </ol>
      <h2 className="pt-4 text-2xl font-black">טיפים מהשטח</h2>
      <ul className="list-disc space-y-2 pr-6 leading-7">
        <li>מדפיסים יומן נוכחות לכל החודשים בבת אחת, ומחזיקים עותק בתיק הטיולים.</li>
        <li>טבלת המיומנויות עובדת הכי טוב עם 5–8 מיומנויות שבודקים שוב כל חודש-חודשיים.</li>
        <li>בפרוטוקול ישיבת צוות — מתחילים כל ישיבה מעבר על טבלת ההחלטות של הישיבה הקודמת.</li>
        <li>טופס שיחה עם הורים כולל מידע אישי: שומרים אותו בתיק סגור ולא משאירים על השולחן.</li>
      </ul>
    </section>

    <div className="mx-auto mt-10 max-w-3xl"><SeoBody paragraphs={[
      'הקבצים לרכזות ולגננות נבנו בשביל העבודה היומיומית שלא רואים מבחוץ: מי הגיע היום, מי החזיר אישור, איפה כל ילד עומד, מה סוכם עם ההורים ומה הוחלט בישיבת הצוות. כל תבנית היא דף A4 נקי, עם שוליים להדפסה ושורת פרטים אופציונלית בראש הדף — שם בית הספר או הגן, הכיתה או הקבוצה, המחנכת או הגננת ושנת הלימודים.',
      'מה שמיוחד כאן הוא שלא צריך להקליד את אותם שמות שוב ושוב. רשימת הכיתה נשמרת בדפדפן שלכם בלבד, ומשם היא ממלאת את רשימת התלמידים, את יומן הנוכחות, את טבלת המיומנויות, את לוח התורנויות ואת התעודות. אותה רשימה משמשת גם בגלגל השמות ובמחלק הקבוצות של האתר.',
      'התכנון השנתי ויומן הנוכחות מותאמים לשנת הלימודים תשפ״ז: החגים והמועדים מחושבים לפי הלוח העברי ומופיעים בדף, כך שקל לתכנן סביבם. את ימי החופשה המדויקים כדאי תמיד להשוות ללוח החופשות של משרד החינוך.',
    ]} faq={HUB_FAQ} related={[{ href: '/classroom', label: 'כל הכלים לכיתה ולגן' }, { href: '/teachers', label: 'שיעורי בית אינטראקטיביים' }, { href: '/printables/calendar-5787', label: 'לוח שנה תשפ״ז' }, { href: '/games/classroom', label: 'משחקים לכיתה' }]} /></div>
  </div>
}
