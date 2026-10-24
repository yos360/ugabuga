import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Choice, Sheet, T } from '../../components/printables/PrintableShell'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { LEVELS, SHEETS, sheetsOf, levelOf, shown, isCorrect, questionsOf, instructionStrings } from '../../data/singularPluralWorkbook'
import { vocalizeAll } from '../../utils/nikudText'
import './sp-workbook.css'

const PATH = '/printables/singular-plural-verbs-workbook'
const LESSON = '/learn/lashon/singular-plural'
const TITLE = 'יחיד ורבים והטיית פעלים'

// Short rules printed on the cover (and vocalized with the instructions).
const RULES = [
  ['זכר ברבים', 'בדרך כלל ־ים (ספר ← ספרים)'],
  ['נקבה ברבים', 'בדרך כלל ־ות (מחברת ← מחברות)'],
  ['זוג', '־יים (עין ← עיניים)'],
  ['יוצאי דופן', 'איש ← אנשים, אישה ← נשים, עיר ← ערים, בית ← בתים'],
  ['הווה', 'כותב, כותבת, כותבים, כותבות'],
  ['עבר', 'כתבתי, כתבת, כתב, כתבה, כתבנו, כתבו'],
  ['עתיד', 'אכתוב, תכתוב, תכתבי, יכתוב, נכתוב, יכתבו'],
]

// ---------- niqqud for the instructions (Dicta's Nakdan through /api/nakdan) ----------
function useNikud(strings, on) {
  const key = strings.join('\u0001')
  const [res, setRes] = useState({ key: '', map: null, state: 'idle' })
  useEffect(() => {
    if (!on || res.key === key) return undefined
    let alive = true
    vocalizeAll(strings).then(map => { if (alive) setRes({ key, map, state: 'ready' }) }).catch(() => { if (alive) setRes({ key, map: null, state: 'error' }) })
    return () => { alive = false }
  }, [on, key]) // eslint-disable-line react-hooks/exhaustive-deps
  const ready = on && res.key === key && res.map
  return { v: s => (ready ? res.map.get(s) || s : s), state: !on ? 'off' : res.key === key ? res.state : 'loading' }
}

// ---------- SVG helpers ----------
const plain = s => String(s || '').replace(/[֑-ׇ]/g, '')
const textW = (s, size) => plain(s).length * size * 0.5
const emojiN = e => (e ? Array.from(e.replace(/[️‍]/g, '')).length : 0)
const RED = '#c1121f'

function wrap(text, max) {
  const lines = []
  let cur = ''
  for (const w of String(text).split(' ')) {
    const next = cur ? `${cur} ${w}` : w
    if (plain(next).length > max && cur) { lines.push(cur); cur = w } else cur = next
  }
  if (cur) lines.push(cur)
  return lines
}

function Num({ x, y, n }) {
  return <g><circle cx={x} cy={y - 1.8} r={3.4} fill="#fff" stroke="#64748b" strokeWidth=".5" /><T x={x} y={y} size={4} weight={700}>{n}</T></g>
}

// A pick row: [number] [emoji] [word]  … option boxes. `solved` circles the right option.
function PickRow({ item, y, n, solved, right: R = 178 }) {
  const qx = item.e ? R - emojiN(item.e) * 9.8 - 3 : R
  const qEnd = qx - (item.q ? textW(item.q, 6.4) + 6 : 0)
  const start = Math.min(qEnd, item.q && item.q.includes('___') ? qEnd : 112)
  // Option boxes laid out right to left from `start`.
  const boxes = item.options.reduce((acc, o) => {
    const w = textW(o, 6.4) + 9
    const right = acc.length ? acc.at(-1).x - 6 : start
    return [...acc, { w, x: right - w }]
  }, [])
  return <g>
    {n != null && <Num x={186} y={y} n={n} />}
    {item.e && <T x={R} y={y + 1} size={8} anchor="start">{item.e}</T>}
    {item.q && <T x={qx} y={y} size={6.4} anchor="start" weight={700}>{item.q}</T>}
    {item.options.map((o, i) => {
      const { w, x } = boxes[i]
      const right = solved && i === item.a
      return <g key={o}>
        <rect x={x} y={y - 6.4} width={w} height={9.4} rx={4.7} fill="#fff" stroke="#94a3b8" strokeWidth=".5" />
        <T x={x + w / 2} y={y} size={6.4}>{o}</T>
        {right && <ellipse cx={x + w / 2} cy={y - 1.7} rx={w / 2 + 2.6} ry={7} fill="none" stroke={RED} strokeWidth="1" />}
      </g>
    })}
  </g>
}

// A write cell: [emoji] word ← ______
function WriteCell({ item, x0, y, solved }) {
  const wx = item.e ? x0 - 13 : x0 - 3
  return <g>
    {item.e && <T x={x0 - 2.5} y={y + 1} size={8} anchor="start">{item.e}</T>}
    <T x={wx} y={y} size={6.6} anchor="start" weight={700}>{item.q}</T>
    <T x={x0 - 45} y={y} size={6} fill="#475569">←</T>
    <line x1={x0 - 81} x2={x0 - 50} y1={y + 1.5} y2={y + 1.5} stroke="#64748b" strokeWidth=".6" />
    {solved && <T x={x0 - 65.5} y={y} size={6.6} weight={800} fill={RED}>{shown(item.a)}</T>}
  </g>
}

// A sentence row with the hint in brackets and a blank (or the red answer).
function SentenceRow({ item, y, n, solved }) {
  const [before, after = ''] = item.q.split('___')
  return <g>
    {n != null && <Num x={186} y={y} n={n} />}
    <T x={179} y={y} size={6} anchor="start">
      {before}<tspan fill="#475569">({item.hint}) </tspan>
      {solved ? <tspan fill={RED} fontWeight={800} textDecoration="underline">{shown(item.a)}</tspan> : <tspan fill="#64748b">______________</tspan>}
      {after}
    </T>
  </g>
}

function Face({ cx, cy, mood }) {
  const mouth = mood === 2 ? `M${cx - 2.2} ${cy + 1} Q${cx} ${cy + 3.4} ${cx + 2.2} ${cy + 1}` : mood === 1 ? `M${cx - 2} ${cy + 1.6} L${cx + 2} ${cy + 1.6}` : `M${cx - 2.2} ${cy + 2.6} Q${cx} ${cy + 0.6} ${cx + 2.2} ${cy + 2.6}`
  return <g fill="none" stroke="#334155" strokeWidth=".5">
    <circle cx={cx} cy={cy} r={4.4} fill="#fff" />
    <circle cx={cx - 1.5} cy={cy - 1.2} r={.45} fill="#334155" /><circle cx={cx + 1.5} cy={cy - 1.2} r={.45} fill="#334155" />
    <path d={mouth} />
  </g>
}

function Rubric({ lines, y }) {
  return <g>
    <rect x={10} y={y} width={180} height={12 + lines.length * 10.5} rx={4} fill="#f8fafc" stroke="#94a3b8" strokeWidth=".5" strokeDasharray="2 1.4" />
    <T x={186} y={y + 7.5} size={5.4} anchor="start" weight={800}>בדיקה עצמית — איך הלך לי? הקיפו פרצוף.</T>
    <T x={14} y={y + 7.5} size={3.8} anchor="end" fill="#475569">מצוין · בסדר · צריך עוד תרגול</T>
    {lines.map((l, i) => {
      const yy = y + 17.5 + i * 10.5
      return <g key={l}>
        <T x={186} y={yy} size={5} anchor="start">☐ {l}</T>
        {[2, 1, 0].map((m, j) => <Face key={m} cx={60 - j * 12 - 10} cy={yy - 1.6} mood={m} />)}
      </g>
    })}
  </g>
}

// ---------- one printed sheet ----------
function WorkSheet({ sheet, n, solved, v }) {
  const level = levelOf(sheet.level)
  const instr = wrap(v(sheet.instr), 66)
  let y = 38
  const parts = []
  // Header
  parts.push(<g key="head">
    <rect x={10} y={6} width={180} height={10} rx={5} fill="#f1f5f9" />
    <T x={186} y={12.6} size={4.2} anchor="start" fill="#334155" weight={700}>{`${level.icon} רמה: ${level.label} · דף ${n}`}</T>
    <T x={14} y={12.6} size={4} anchor="end" fill="#475569">{TITLE}</T>
    <T x={100} y={25} size={9} weight={900} fill={solved ? RED : '#111'}>{solved ? `תשובות: ${sheet.title}` : sheet.title}</T>
    {!solved && <><T x={190} y={33} size={4.4} anchor="start" fill="#334155">שם: ________________</T><T x={10} y={33} size={4.4} anchor="end" fill="#334155">תאריך: ___________</T></>}
  </g>)
  // Instruction
  const ih = 6 + instr.length * 6.4
  parts.push(<g key="instr">
    <rect x={10} y={y} width={180} height={ih} rx={3} fill="#fff" stroke="#334155" strokeWidth=".6" />
    {instr.map((l, i) => <T key={i} x={185} y={y + 6.4 + i * 6.4} size={5.2} anchor="start">{i === 0 && <tspan fontWeight={800}>✏️ </tspan>}{l}</T>)}
  </g>)
  y += ih + 3
  // Example
  const exH = sheet.kind === 'table' ? 11 : 16
  const ex = sheet.example
  parts.push(<g key="ex">
    <rect x={10} y={y} width={180} height={exH} rx={3} fill="#f8fafc" stroke="#cbd5e1" strokeWidth=".5" />
    <T x={186} y={y + 7} size={4.8} anchor="start" weight={800} fill="#334155">דוגמה:</T>
    {sheet.kind === 'table' && <T x={170} y={y + 7} size={4.4} anchor="start" fill="#334155">{v(sheet.exampleNote).replace(/^דוגמה:\s*/, '')}</T>}
    {sheet.kind === 'pick' && <g transform={`translate(0 ${y + 10})`}><PickRow item={ex} y={0} right={168} solved /></g>}
    {sheet.kind === 'write' && <g transform={`translate(0 ${y + 10.5})`}><WriteCell item={ex} x0={168} y={0} solved /></g>}
    {sheet.kind === 'sentence' && <g transform={`translate(-12 ${y + 10.5})`}><SentenceRow item={ex} y={0} solved /></g>}
    {sheet.kind === 'match' && <g>
      <T x={166} y={y + 10.5} size={6.4} anchor="start" weight={700}>{`${ex.pair[2]} ${ex.pair[0]}`}</T>
      <circle cx={136} cy={y + 8.6} r={1.1} fill="#334155" /><line x1={136} x2={84} y1={y + 8.6} y2={y + 8.6} stroke={RED} strokeWidth=".8" /><circle cx={84} cy={y + 8.6} r={1.1} fill="#334155" />
      <T x={78} y={y + 10.5} size={6.4} anchor="start" weight={700}>{ex.pair[1]}</T>
    </g>}
  </g>)
  y += exH + 3
  // Word bank
  if (sheet.bank) {
    const words = sheet.items.map(it => shown(it.a)).sort((a, b) => a.localeCompare(b, 'he'))
    parts.push(<g key="bank">
      <rect x={10} y={y} width={180} height={14} rx={3} fill="#fff" stroke="#94a3b8" strokeWidth=".5" strokeDasharray="1.6 1.2" />
      <T x={186} y={y + 8.6} size={4.6} anchor="start" weight={800} fill="#334155">מחסן מילים:</T>
      {words.map((w, i) => <T key={w} x={148 - i * (126 / Math.max(1, words.length - 1))} y={y + 8.8} size={5.4}>{w}</T>)}
    </g>)
    y += 17
  }
  y += 4
  const bottom = sheet.rubric ? 262 - (12 + sheet.rubric.length * 10.5) - 5 : 262
  const avail = bottom - y

  if (sheet.kind === 'pick' || sheet.kind === 'sentence') {
    const rowH = Math.min(sheet.kind === 'pick' && sheet.items.some(it => it.e) ? 25 : 22, avail / sheet.items.length)
    sheet.items.forEach((it, i) => {
      const yy = y + rowH * i + rowH * 0.62
      parts.push(<g key={`r${i}`}>
        {i > 0 && <line x1={14} x2={186} y1={y + rowH * i} y2={y + rowH * i} stroke="#e2e8f0" strokeWidth=".4" />}
        {sheet.kind === 'pick' ? <PickRow item={it} y={yy} n={i + 1} solved={solved} /> : <SentenceRow item={it} y={yy} n={i + 1} solved={solved} />}
      </g>)
    })
  }
  if (sheet.kind === 'write') {
    const rows = Math.ceil(sheet.items.length / 2)
    const rowH = Math.min(30, avail / rows)
    sheet.items.forEach((it, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const x0 = col === 0 ? 188 : 96
      const top = y + row * rowH
      parts.push(<g key={`w${i}`}>
        <rect x={x0 - 88} y={top + 2} width={86} height={rowH - 4} rx={3} fill={(row + col) % 2 ? '#fff' : '#f8fafc'} stroke="#cbd5e1" strokeWidth=".4" />
        <T x={x0 - 2.5} y={top + 7} size={3.6} anchor="start" fill="#64748b">{i + 1}</T>
        <WriteCell item={it} x0={x0 - 3} y={top + rowH / 2 + 2.6} solved={solved} />
      </g>)
    })
  }
  if (sheet.kind === 'match') {
    const k = sheet.pairs.length
    const rowH = Math.min(30, avail / k)
    const cy = i => y + rowH * i + rowH / 2
    sheet.pairs.forEach((p, i) => {
      parts.push(<g key={`m${i}`}>
        <rect x={128} y={cy(i) - 8} width={60} height={16} rx={4} fill="#fff" stroke="#94a3b8" strokeWidth=".5" />
        {p[2] && <T x={184} y={cy(i) + 2.6} size={8} anchor="start">{p[2]}</T>}
        <T x={p[2] ? 172 : 180} y={cy(i) + 2.4} size={6.8} anchor="start" weight={700}>{p[0]}</T>
        <circle cx={124} cy={cy(i)} r={1.6} fill="#334155" />
      </g>)
    })
    sheet.order.forEach((j, i) => {
      parts.push(<g key={`l${i}`}>
        <rect x={12} y={cy(i) - 8} width={60} height={16} rx={4} fill="#fff" stroke="#94a3b8" strokeWidth=".5" />
        <T x={42} y={cy(i) + 2.4} size={6.8} weight={700}>{sheet.pairs[j][1]}</T>
        <circle cx={76} cy={cy(i)} r={1.6} fill="#334155" />
      </g>)
    })
    if (solved) sheet.pairs.forEach((_, i) => parts.push(<line key={`s${i}`} x1={124} y1={cy(i)} x2={76} y2={cy(sheet.order.indexOf(i))} stroke={RED} strokeWidth=".9" />))
  }
  if (sheet.kind === 'table') {
    const cols = sheet.head.length
    const firstW = sheet.rowHead ? 26 : 180 / cols
    const restW = sheet.rowHead ? (180 - firstW) / (cols - 1) : 180 / cols
    const colX = j => (j === 0 ? 190 : 190 - firstW - (j - 1) * restW)
    const colW = j => (j === 0 ? firstW : restW)
    const body = [...(sheet.exampleRow ? [sheet.exampleRow.map(t => ({ ex: t }))] : []), ...sheet.rows]
    const headH = sheet.head.some(h => h.includes(' (')) ? 14 : 11
    const noteH = sheet.note ? 14 : 0
    const rowH = Math.min(19, (avail - headH - noteH) / body.length)
    parts.push(<g key="thead">
      {sheet.head.map((h, j) => <g key={j}>
        <rect x={colX(j) - colW(j)} y={y} width={colW(j)} height={headH} fill="#e2e8f0" stroke="#475569" strokeWidth=".5" />
        {h.includes(' (')
          ? <><T x={colX(j) - colW(j) / 2} y={y + 6} size={5.4} weight={800}>{h.split(' (')[0]}</T><T x={colX(j) - colW(j) / 2} y={y + 11.4} size={3.8} fill="#334155">({h.split(' (')[1]}</T></>
          : <T x={colX(j) - colW(j) / 2} y={y + 7.3} size={5.4} weight={800}>{h}</T>}
      </g>)}
    </g>)
    body.forEach((row, r) => {
      const top = y + headH + r * rowH
      parts.push(<g key={`t${r}`}>
        {row.map((c, j) => {
          const isHead = sheet.rowHead && j === 0
          const given = typeof c === 'string'
          const exCell = c && typeof c === 'object' && 'ex' in c
          const fill = isHead ? '#e2e8f0' : exCell || (given && sheet.rowHead) ? '#f1f5f9' : '#fff'
          const txt = given ? c : exCell ? c.ex : solved ? shown(c.a) : ''
          return <g key={j}>
            <rect x={colX(j) - colW(j)} y={top} width={colW(j)} height={rowH} fill={fill} stroke="#475569" strokeWidth=".5" />
            {txt && <T x={colX(j) - colW(j) / 2} y={top + rowH / 2 + 2.2} size={isHead ? 5.6 : 6.2} weight={isHead || (given && !sheet.rowHead) ? 800 : 600} fill={!given && !exCell ? RED : exCell || (given && sheet.rowHead) ? '#475569' : '#111'}>{txt}</T>}
          </g>
        })}
      </g>)
    })
    if (sheet.note) {
      const ny = y + headH + body.length * rowH + 4
      parts.push(<g key="note">{wrap(v(sheet.note), 74).map((l, i) => <T key={i} x={188} y={ny + 5 + i * 5.4} size={4.3} anchor="start" fill="#334155">{i === 0 ? '💡 ' : ''}{l}</T>)}</g>)
    }
  }
  if (sheet.kind === 'write') {
    // Free space under the grid: draw one of the words (easy level) or use two of them in a sentence.
    const rows = Math.ceil(sheet.items.length / 2)
    const top = y + rows * Math.min(30, avail / rows) + 6
    if (bottom - top > 40) parts.push(<g key="extra">
      <T x={188} y={top + 6} size={5.2} anchor="start" weight={800}>{sheet.level === 'easy' ? '🖍️ בונוס: בחרו מילה אחת ברבים, כתבו אותה וציירו אותה.' : '✍️ בונוס: כתבו משפט עם שתיים מהמילים שכתבתם.'}</T>
      {sheet.level === 'easy'
        ? <rect x={14} y={top + 11} width={172} height={Math.min(70, bottom - top - 14)} rx={4} fill="none" stroke="#94a3b8" strokeWidth=".5" strokeDasharray="2 1.4" />
        : [0, 1, 2].map(i => <line key={i} x1={14} x2={186} y1={top + 22 + i * 13} y2={top + 22 + i * 13} stroke="#94a3b8" strokeWidth=".5" />)}
      {solved && <T x={100} y={top + 30} size={4.6} fill={RED}>(תשובה פתוחה)</T>}
    </g>)
  }
  if (sheet.rubric) parts.push(<Rubric key="rubric" lines={sheet.rubric} y={262 - (12 + sheet.rubric.length * 10.5)} />)
  return <Sheet label={`${solved ? 'תשובות' : 'דף עבודה'} — ${sheet.title}`}>{parts}</Sheet>
}

// Cover with the level, a contents list and the short rules.
function Cover({ list, levelId, v }) {
  const lv = levelId === 'all' ? null : levelOf(levelId)
  const many = list.length > 12
  return <Sheet label={`כריכה — ${TITLE}`}>
    <rect x={10} y={8} width={180} height={254} rx={6} fill="none" stroke="#334155" strokeWidth=".8" />
    <T x={100} y={30} size={6} fill="#475569">חוברת לשון לכיתות ג׳–ד׳</T>
    <T x={100} y={44} size={11} weight={900}>{TITLE}</T>
    <T x={100} y={54} size={5.4} fill="#334155">{lv ? `${lv.icon} רמה: ${lv.label} — ${lv.desc}` : 'שלוש רמות: קל, רגיל ומאתגר'}</T>
    <T x={100} y={70} size={13}>🍎 ← 🍎🍎🍎</T>
    <T x={176} y={86} size={5} anchor="start">שם: ____________________</T>
    <T x={84} y={86} size={5} anchor="start">כיתה: ________</T>
    <T x={176} y={100} size={6} anchor="start" weight={800}>בחוברת:</T>
    {list.map((s, i) => {
      const col = many && i >= Math.ceil(list.length / 2) ? 1 : 0
      const row = many ? i % Math.ceil(list.length / 2) : i
      return <T key={s.id} x={176 - col * 84} y={108 + row * 6.2} size={4.6} anchor="start">{`${i + 1}. ${s.title}`}{levelId === 'all' ? ` (${levelOf(s.level).label})` : ''}</T>
    })}
    <rect x={20} y={182} width={160} height={72} rx={4} fill="#f8fafc" stroke="#94a3b8" strokeWidth=".5" />
    <T x={100} y={190} size={5.6} weight={800}>כללים קצרים לזכור</T>
    {RULES.map(([k, r], i) => <T key={k} x={174} y={199 + i * 7.8} size={4.6} anchor="start"><tspan fontWeight={800}>{v(k)}: </tspan>{v(r)}</T>)}
  </Sheet>
}

// ---------- on-screen practice ----------
function PickButtons({ q, value, onPick }) {
  return <div className="spw-opts">{q.options.map((o, i) => {
    const state = value === i ? (i === q.a ? 'ok' : 'bad') : ''
    return <button key={o} type="button" className={`spw-opt ${state}`} aria-pressed={value === i} onClick={() => onPick(i)}>{o}{state === 'ok' ? ' ✓' : state === 'bad' ? ' ✗' : ''}</button>
  })}</div>
}

function Answer({ q, value, onChange, label, reveal }) {
  const [touched, setTouched] = useState(false)
  const ok = isCorrect(value, q.a)
  const bad = touched && value && !ok
  return <span className="spw-answer">
    <input dir="rtl" aria-label={label} value={value || ''} onChange={e => onChange(e.target.value)} onBlur={() => setTouched(true)} onKeyDown={e => { if (e.key === 'Enter') setTouched(true) }}
      className={ok ? 'ok' : bad ? 'bad' : ''} autoComplete="off" spellCheck={false} />
    {ok && <span className="spw-mark ok" aria-label="נכון">✓</span>}
    {bad && <span className="spw-mark bad" role="status">נסו שוב</span>}
    {reveal && !ok && <span className="spw-reveal">{shown(q.a)}</span>}
  </span>
}

function Practice({ list, v }) {
  const [idx, setIdx] = useState(0)
  const [vals, setVals] = useState({})
  const [reveal, setReveal] = useState(false)
  const sheet = list[Math.min(idx, list.length - 1)]
  const qs = useMemo(() => questionsOf(sheet), [sheet])
  const byKey = Object.fromEntries(qs.map(q => [q.key, q]))
  const set = (k, x) => setVals(o => ({ ...o, [k]: x }))
  const right = qs.filter(q => (q.kind === 'pick' ? vals[q.key] === q.a : isCorrect(vals[q.key], q.a))).length
  const go = i => { setIdx(i); setReveal(false) }
  const reset = () => { setVals(o => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith(`${sheet.id}-`)))); setReveal(false) }
  const ex = sheet.example

  return <section id="practice" className="spw-practice" aria-labelledby="practice-h">
    <h2 id="practice-h">💻 תרגול על המסך — בדיקה מיידית</h2>
    <p className="spw-lead">אותם תרגילים בדיוק, עם סימון מיידי: ✓ ירוק כשהתשובה נכונה, ״נסו שוב״ כשלא. מתאים לתרגול עצמי בבית, למרכז למידה או ללוח הכיתה.</p>
    <nav className="spw-tabs" aria-label="בחירת דף לתרגול">
      {list.map((s, i) => <button key={s.id} type="button" aria-pressed={s.id === sheet.id} onClick={() => go(i)}>{levelOf(s.level).icon} {s.title}</button>)}
    </nav>
    <div className="spw-card">
      <h3>{sheet.title}</h3>
      <p className="spw-instr">✏️ {v(sheet.instr)}</p>
      <p className="spw-ex"><b>דוגמה: </b>
        {sheet.kind === 'pick' && <>{ex.e} {ex.q} ← <mark>{ex.options[ex.a]}</mark></>}
        {sheet.kind === 'write' && <>{ex.e} {ex.q} ← <mark>{shown(ex.a)}</mark></>}
        {sheet.kind === 'sentence' && <>{ex.q.replace('___', '')} ({ex.hint}) ← <mark>{shown(ex.a)}</mark></>}
        {sheet.kind === 'match' && <>{ex.pair[2]} {ex.pair[0]} ← <mark>{ex.pair[1]}</mark></>}
        {sheet.kind === 'table' && <>{v(sheet.exampleNote).replace(/^דוגמה:\s*/, '')}</>}
      </p>

      {sheet.kind === 'pick' && <ol className="spw-list">{sheet.items.map((it, i) => {
        const q = byKey[`${sheet.id}-${i}`]
        return <li key={i}><span className="spw-q">{it.e && <span className="spw-emoji" aria-hidden="true">{it.e}</span>}{it.q}</span>
          <PickButtons q={q} value={reveal && vals[q.key] !== q.a ? q.a : vals[q.key]} onPick={x => set(q.key, x)} /></li>
      })}</ol>}

      {sheet.kind === 'write' && <ol className="spw-list spw-grid">{sheet.items.map((it, i) => {
        const q = byKey[`${sheet.id}-${i}`]
        return <li key={i}><span className="spw-q">{it.e && <span className="spw-emoji" aria-hidden="true">{it.e}</span>}{it.q} ←</span>
          <Answer q={q} value={vals[q.key]} onChange={x => set(q.key, x)} label={`${it.q} — תשובה`} reveal={reveal} /></li>
      })}</ol>}
      {sheet.kind === 'write' && sheet.bank && <p className="spw-bank"><b>מחסן מילים: </b>{sheet.items.map(it => shown(it.a)).sort((a, b) => a.localeCompare(b, 'he')).join(' · ')}</p>}

      {sheet.kind === 'sentence' && <ol className="spw-list">{sheet.items.map((it, i) => {
        const q = byKey[`${sheet.id}-${i}`]
        const [before, after] = it.q.split('___')
        return <li key={i} className="spw-sentence">{before}<span className="spw-hint">({it.hint})</span>
          <Answer q={q} value={vals[q.key]} onChange={x => set(q.key, x)} label={`${it.q.replace('___', '…')} — הפועל ${it.hint}`} reveal={reveal} />{after}</li>
      })}</ol>}

      {sheet.kind === 'match' && <ol className="spw-list">{sheet.pairs.map((p, i) => {
        const q = byKey[`${sheet.id}-${i}`]
        const val = reveal && vals[q.key] !== q.a ? q.a : vals[q.key]
        const state = val == null ? '' : val === q.a ? 'ok' : 'bad'
        return <li key={i}><span className="spw-q">{p[2] && <span className="spw-emoji" aria-hidden="true">{p[2]}</span>}{p[0]} ←</span>
          <select aria-label={`הרבים של ${p[0]}`} className={state} value={val ?? ''} onChange={e => set(q.key, e.target.value === '' ? undefined : Number(e.target.value))}>
            <option value="">בחרו…</option>{q.options.map((o, j) => <option key={o} value={j}>{o}</option>)}
          </select>{state === 'ok' ? <span className="spw-mark ok">✓</span> : state === 'bad' ? <span className="spw-mark bad">נסו שוב</span> : null}</li>
      })}</ol>}

      {sheet.kind === 'table' && <div className="spw-table-wrap"><table className="spw-table">
        <thead><tr>{sheet.head.map((h, j) => <th key={j} scope="col">{h}</th>)}</tr></thead>
        <tbody>
          {sheet.exampleRow && <tr className="ex">{sheet.exampleRow.map((t, j) => <td key={j}>{t}</td>)}</tr>}
          {sheet.rows.map((row, r) => <tr key={r}>{row.map((c, j) => {
            if (typeof c === 'string') return sheet.rowHead && j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j} className={sheet.rowHead ? 'given' : 'base'}>{c}</td>
            const q = byKey[`${sheet.id}-${r}-${j}`]
            return <td key={j}><Answer q={q} value={vals[q.key]} onChange={x => set(q.key, x)} label={`${row[0]} — ${sheet.head[j]}`} reveal={reveal} /></td>
          })}</tr>)}
        </tbody>
      </table></div>}
      {sheet.note && <p className="spw-bank">💡 {v(sheet.note)}</p>}

      <div className="spw-foot">
        <p className="spw-score" role="status" aria-live="polite">{right === qs.length ? `🎉 כל הכבוד! ${right} מתוך ${qs.length} נכונות` : `נכון: ${right} מתוך ${qs.length}`}</p>
        <div className="spw-actions">
          <button type="button" onClick={() => setReveal(r => !r)}>{reveal ? '🙈 הסתרת התשובות' : '💡 הצגת התשובות'}</button>
          <button type="button" onClick={reset}>🔄 מתחילים מחדש</button>
          {idx < list.length - 1 && <button type="button" className="next" onClick={() => go(idx + 1)}>לדף הבא ←</button>}
        </div>
      </div>
    </div>
  </section>
}

// ---------- page ----------
export default function SingularPluralWorkbook() {
  const [level, setLevel] = useState('easy')
  const [mode, setMode] = useState('book')
  const [chosen, setChosen] = useState(() => SHEETS.map(s => s.id))
  const [answersOn, setAnswersOn] = useState(true)
  const [cover, setCover] = useState(true)
  const [nikud, setNikud] = useState(false)

  const levelSheets = sheetsOf(level)
  const picked = mode === 'book' ? levelSheets : levelSheets.filter(s => chosen.includes(s.id))
  const list = picked.length ? picked : levelSheets
  const { v, state } = useNikud(useMemo(() => [...instructionStrings(SHEETS), ...RULES.flat()], []), nikud)

  const pages = [
    ...(cover && mode === 'book' ? [{ key: 'cover', svg: <Cover list={list} levelId={level} v={v} /> }] : []),
    ...list.map((s, i) => ({ key: `q-${s.id}`, svg: <WorkSheet sheet={s} n={i + 1} v={v} /> })),
    ...(answersOn ? list.map((s, i) => ({ key: `a-${s.id}`, svg: <WorkSheet sheet={s} n={i + 1} v={v} solved /> })) : []),
  ]
  const toggle = id => setChosen(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id])

  return <PrintableShell path={PATH} emoji="📒" h1="חוברת יחיד ורבים והטיית פעלים"
    seoTitle="דפי עבודה יחיד ורבים והטיית פעלים — חוברת לשון לכיתה ג׳–ד׳"
    description="דפי עבודה יחיד ורבים והטיית פעלים להדפסה בחינם: 21 דפים בשלוש רמות, עם תמונות לרמה הקלה, דוגמה בכל דף, דפי תשובות, ניקוד להוראות ותרגול אינטראקטיבי."
    sub="21 דפי עבודה בשלוש רמות — שמות עצם, שמות תואר ופעלים בהווה, בעבר ובעתיד"
    crumbs={[{ label: 'לשון עברית', href: '/learn/lashon' }]}
    intro={<>
      <QuickAnswer q="איפה יש דפי עבודה ביחיד ורבים ובהטיית פעלים לכיתה ג׳–ד׳?"
        a={<>כאן: חוברת לשון מקורית של 21 דפים בשלוש רמות. בוחרים רמה, מדפיסים את כל החוברת או רק דפים מסוימים, עם או בלי דפי תשובות ועם ניקוד להוראות לפי הצורך. את אותם תרגילים אפשר לפתור גם <a href="#practice" className="underline font-bold">על המסך עם בדיקה מיידית</a>.</>}
        rows={[['נושאים', 'יחיד ורבים (־ים, ־ות, ־יים, יוצאי דופן), התאמת שם תואר, פועל בהווה, בעבר ובעתיד'], ['רמות', '🌱 קל (עם תמונות, מתאים גם לחינוך המיוחד) · ✏️ רגיל (כיתה ג׳) · 🚀 מאתגר (כיתה ד׳)'], ['בכל דף', 'הוראה ברורה, דוגמה פתורה ו־6–8 תרגילים'], ['מחיר', 'חינם, בלי הרשמה']]}
        updated="2026-10-24" />
      <p className="mx-auto mb-6 max-w-3xl text-center">רוצים קודם להסביר את החומר? <Link to={LESSON} className="font-bold underline">לשיעור ״יחיד ורבים״ עם הסבר וחידון ←</Link></p>
    </>}
    controls={<>
      <Choice label="רמה" value={level} onChange={setLevel} options={[...LEVELS.map(l => [l.id, `${l.icon} ${l.label}`]), ['all', '📚 כל הרמות']]} />
      <p className="text-center text-sm">{level === 'all' ? 'כל 21 הדפים, מהקל אל המאתגר.' : `${levelOf(level).grade} · ${levelOf(level).desc}`}</p>
      <Choice label="מה להדפיס" value={mode} onChange={setMode} options={[['book', '📒 כל החוברת'], ['pick', '☑️ בחירת דפים']]} />
      {mode === 'pick' && <div className="text-center"><p className="mb-2 font-bold">סמנו דפים ({picked.length || levelSheets.length} מתוך {levelSheets.length})</p>
        <div className="flex flex-wrap justify-center gap-2">{levelSheets.map(s => <button key={s.id} type="button" onClick={() => toggle(s.id)} aria-pressed={chosen.includes(s.id)}
          className={`min-h-[42px] rounded-xl border-2 px-3 py-1.5 font-bold ${chosen.includes(s.id) ? 'border-slate-800 bg-white' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>{level === 'all' ? `${levelOf(s.level).icon} ` : ''}{s.title}</button>)}</div>
      </div>}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={answersOn} onChange={e => setAnswersOn(e.target.checked)} className="h-5 w-5" />דפי תשובות בסוף</label>
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={nikud} onChange={e => setNikud(e.target.checked)} className="h-5 w-5" />ניקוד בהוראות</label>
        {mode === 'book' && <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={cover} onChange={e => setCover(e.target.checked)} className="h-5 w-5" />כריכה וכללים</label>}
      </div>
      {state === 'loading' && <p role="status" className="text-center text-sm">מנקדים את ההוראות…</p>}
      {state === 'ready' && <p className="text-center text-sm">הניקוד נוסף אוטומטית (באדיבות מפעל דיקטה) ויכול לטעות במילים בודדות.</p>}
      {state === 'error' && <p role="alert" className="text-center text-sm">הניקוד לא זמין כרגע — אפשר להדפיס בלי ניקוד.</p>}
    </>}
    pages={pages} previewAll={false} printTitle={`${TITLE} — חוברת עבודה`}
    after={<Practice key={level} list={levelSheets} v={v} />}
    paragraphs={[
      'החוברת מתרגלת את אחד הנושאים החשובים בלשון של כיתות ג׳–ד׳: איך מילה משתנה כשעוברים מיחיד לרבים, ואיך כל המשפט ״מתיישר״ איתה — שם התואר והפועל. היא בנויה במדרגות: מתחילים בתמונות ובמילים קצרות, ממשיכים ליוצאי דופן ולהתאמת שם תואר, ומסיימים בהטיית פעלים בהווה, בעבר ובעתיד.',
      'איך משתמשים בכיתה: מדפיסים דף אחד לשיעור, פותרים יחד את הדוגמה שבראש הדף, ואז הילדים ממשיכים לבד. דף הסיכום בסוף כל רמה כולל בדיקה עצמית עם פרצופים, כך שגם הילדים וגם המורה רואים מה כבר ברור ומה צריך לחזור עליו. דפי התשובות מודפסים בסוף החוברת, כדי שאפשר יהיה להוציא אותם לפני שמחלקים.',
      'במרכז למידה ובחינוך המיוחד מתאימה במיוחד הרמה הקלה: בכל תרגיל יש תמונה, המילים קצרות, ויש מחסן מילים שממנו מעתיקים. אפשר להדפיס את ההוראות עם ניקוד, ולתת לילד לתרגל את אותו דף גם על המסך — שם הוא מקבל משוב מיידי על כל תשובה.',
      'להורים: לפני דף עבודה כדאי לשחק בעל פה — ״אחד כלב, הרבה…?״, ״אני כותב, ואמא…?״. האוזן מכירה את הצורות הנכונות, והדף רק עוזר להפוך את מה שנשמע טבעי לידע מסודר. הטיית פעלים בכיתה ג׳ מתחילה בהווה; עבר ועתיד מופיעים ברמה המאתגרת, שמתאימה לחוברת לשון לכיתה ד׳.',
      'כל הצורות בחוברת נבדקו לפי הכתיב המלא המקובל. בעתיד, ״הן יכתבו״ היא הצורה הרגילה בעברית של היום, ו״הן תכתובנה״ היא הצורה הספרותית — בתרגול על המסך שתיהן מתקבלות.',
    ]}
    faq={[
      { q: 'לאיזו כיתה מתאימים דפי העבודה ביחיד ורבים?', a: 'הרמה הרגילה מתאימה לכיתה ג׳, הרמה המאתגרת — עם עבר ועתיד — לכיתה ד׳, והרמה הקלה עם התמונות מתאימה לסוף כיתה ב׳, לתחילת כיתה ג׳ ולחינוך המיוחד.' },
      { q: 'מה זה הטיית פעלים?', a: 'הטיה היא שינוי הפועל לפי מי שעושה את הפעולה ומתי. בהווה: כותב, כותבת, כותבים, כותבות. בעבר: כתבתי, כתבת, כתב, כתבה, כתבנו, כתבו. בעתיד: אכתוב, תכתוב, תכתבי, יכתוב, נכתוב, יכתבו.' },
      { q: 'יש דפי תשובות?', a: 'כן. לכל דף יש דף תשובות עם הפתרונות באדום, והם מודפסים בסוף החוברת. אפשר לבטל אותם בתיבת הסימון לפני ההדפסה.' },
      { q: 'אפשר להדפיס עם ניקוד?', a: 'כן. מסמנים ״ניקוד בהוראות״ וההוראות והכללים בכריכה מקבלים ניקוד אוטומטי. המילים בתרגילים נשארות בלי ניקוד, כדי שהילדים יתרגלו קריאה רגילה.' },
      { q: 'אפשר לתרגל בלי להדפיס?', a: 'כן. מתחת לתצוגה המקדימה יש תרגול על המסך עם אותם תרגילים בדיוק, ובדיקה מיידית של כל תשובה.' },
      { q: 'למה ״שולחנות גדולים״ ולא ״שולחנות גדולות״?', a: 'כי שם התואר הולך לפי המין של המילה ולא לפי הסיומת. שולחן הוא זכר, ולכן גם ברבים — עם הסיומת ־ות — אומרים ״שולחנות גדולים״. וכך גם ״שנים רבות״: שנה היא נקבה.' },
    ]}
    related={[
      { label: 'שיעור: יחיד ורבים', href: LESSON },
      { label: 'שיעור: זכר ונקבה', href: '/learn/lashon/gender' },
      { label: 'שיעור: שם תואר', href: '/learn/lashon/adjectives' },
      { label: 'שיעור: עבר, הווה ועתיד', href: '/learn/lashon/verb-tenses' },
      { label: 'שיעור: גופים בפועל', href: '/learn/lashon/verb-persons' },
      { label: 'לשון עברית — כל השיעורים', href: '/learn/lashon' },
      { label: 'דפי עברית לכיתות ב׳–ג׳', href: '/printables/hebrew-worksheets-grades-2-3' },
      { label: 'הכתבה', href: '/learn/dictation' },
      { label: 'נקדן אוטומטי', href: '/tools/nakdan' },
    ]}
  />
}
