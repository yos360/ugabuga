import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import PrintPreview from '../../../components/ui/PrintPreview'
import { Sheet } from '../../../components/printables/PrintableShell'
import { hasVoice, speak, stopSpeaking } from '../../../utils/speak'
import SpeechNote from '../SpeechNote'
import { SceneArt, TapLayer } from './DirectionsScene'
import {
  LEVELS, levelById, COLORS, colorById, itemById, makeInstruction, sheetInstructions, checkLog,
  CONCEPTS, CARD_LEVELS, HERZL,
} from '../../../data/speech/directions'

// /speech/language/directions — "הוראות בשלבים": a listening game (the device or an adult reads an
// instruction, the child colours / circles / puts a star in a yard scene), graded instruction lists,
// basic concepts, "הרצל אמר" and printables. The instruction is NOT shown to the child — it is a
// listening task; an adult can peek. No scoring: the game only says "done" or "let's listen again".

const PATH = '/speech/language/directions'
const FONT = 'Heebo, Arial, sans-serif'
const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
const UPDATED = '2026-10-24'

const labelOf = id => { const it = itemById[id]; return it.name || it.refs[0] }
const PRAISE = ['כל הכבוד! הקשבתם ועשיתם בדיוק 🎉', 'יופי של הקשבה! 👂', 'בדיוק מה שביקשתי ⭐', 'מעולה — זכרתם הכול! 🌟', 'וואו, איזו הקשבה! 🎈']

// ── The game ────────────────────────────────────────────────────────────────

function ToolButton({ on, onClick, label, children, className = '' }) {
  return <button type="button" aria-pressed={on} aria-label={label} title={label} onClick={onClick}
    className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-2 font-bold transition ${on ? 'border-slate-900 ring-2 ring-violet-400 ring-offset-1' : 'border-[var(--border)]'} ${className}`}>{children}</button>
}

function Game() {
  const [level, setLevel] = useState('one')
  const [voice, setVoice] = useState('device')
  const [deviceOk, setDeviceOk] = useState(true)
  const [slow, setSlow] = useState(false)
  const [ins, setIns] = useState(() => makeInstruction('one'))
  const [marks, setMarks] = useState({})
  const [log, setLog] = useState([])
  const [tool, setTool] = useState({ type: 'color', color: 'red' })
  const [status, setStatus] = useState('open')
  const [peek, setPeek] = useState(false)
  const [praise, setPraise] = useState(0)
  const [heard, setHeard] = useState(false)

  useEffect(() => { let on = true; hasVoice('he-IL').then(ok => { if (!on) return; setDeviceOk(ok); if (!ok) setVoice('adult') }); return () => { on = false; stopSpeaking() } }, [])

  const say = useCallback((text, user = true) => { if (voice === 'device') speak(text, 'he-IL', { rate: slow ? 0.68 : 0.85, user }) }, [voice, slow])
  const play = () => { setHeard(true); say(ins.text) }
  const clear = () => { setMarks({}); setLog([]); setStatus('open') }
  const fresh = lvl => {
    const next = makeInstruction(lvl)
    setIns(next); clear(); setPeek(false)
    if (voice === 'device') { setHeard(true); say(next.text) } else setHeard(false)
  }
  const retry = () => { clear(); setHeard(true); say(ins.text) }

  const tap = id => {
    if (status === 'retry' || status === 'order') return
    if (tool.type === 'erase') {
      setMarks(m => { const n = { ...m }; delete n[id]; return n })
      setLog(l => l.filter(a => a.item !== id))
      return
    }
    const action = { type: tool.type, item: id, ...(tool.type === 'color' ? { color: tool.color } : {}) }
    setMarks(m => {
      const cur = m[id] || {}
      return { ...m, [id]: tool.type === 'color' ? { ...cur, fill: colorById[tool.color].hex } : tool.type === 'circle' ? { ...cur, ring: true } : { ...cur, star: true } }
    })
    if (status === 'done') return // after success the child may keep colouring for fun
    const nextLog = [...log, action]
    setLog(nextLog)
    const result = checkLog(ins.steps, nextLog)
    if (result === 'done') { setStatus('done'); setPraise(p => p + 1) }
    else if (result === 'order') setStatus('order')
    else if (nextLog.length >= ins.steps.length + 1) setStatus('retry')
  }

  const lv = levelById[level]
  const msg = status === 'done' ? PRAISE[praise % PRAISE.length]
    : status === 'order' ? 'עשיתם את כל מה שביקשתי — רק בסדר אחר. מקשיבים שוב, הפעם לסדר?'
      : status === 'retry' ? 'רגע… בואו נקשיב שוב להוראה ונתחיל מחדש 👂' : ''

  return <div className="space-y-4">
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="רמה">
      {LEVELS.map(l => <button key={l.id} type="button" aria-pressed={level === l.id} onClick={() => { setLevel(l.id); fresh(l.id) }}
        className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${level === l.id ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}>{l.label}</button>)}
    </div>
    <p className="text-center text-sm text-[var(--muted-foreground)]">{lv.desc}</p>
    <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="מי אומר את ההוראה">
      {[['device', '🔊 המכשיר אומר'], ['adult', '🧑 מבוגר אומר']].map(([v, l]) => <button key={v} type="button" aria-pressed={voice === v} onClick={() => { setVoice(v); setPeek(false) }}
        className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${voice === v ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
      {voice === 'device' && <button type="button" aria-pressed={slow} onClick={() => setSlow(s => !s)}
        className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${slow ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}>🐢 לאט יותר</button>}
    </div>
    {!deviceOk && voice === 'device' && <p className="text-center text-sm text-[var(--muted-foreground)]">לא נמצא במכשיר הזה קול בעברית — אפשר לבחור „מבוגר אומר”.</p>}

    <div className="rounded-2xl border border-[var(--border)] bg-white p-3 text-center shadow-sm sm:p-5">
      {voice === 'device'
        ? <button type="button" onClick={play} className="mx-auto mb-2 flex min-h-[56px] items-center gap-2 rounded-full bg-violet-600 px-7 text-xl font-bold text-white shadow">🔊 {heard ? 'שומעים שוב' : 'הקשיבו להוראה'}</button>
        : <p className="mb-2 text-lg font-bold">המבוגר מקריא את ההוראה פעם אחת — והילד/ה עושה בתמונה</p>}
      <button type="button" onClick={() => setPeek(p => !p)} aria-expanded={peek}
        className="mb-3 min-h-[40px] rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 text-sm font-bold">
        {peek ? '🙈 הסתרת ההוראה' : voice === 'adult' ? '👀 למבוגר: מה להקריא?' : '👀 למבוגר: הצגת ההוראה בכתב'}
      </button>
      {peek && <p className="mx-auto mb-3 max-w-xl rounded-xl bg-violet-50 p-3 text-lg font-bold text-violet-900" aria-live="polite">„{ins.text}”</p>}

      <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label="כלים">
        {COLORS.map(c => <ToolButton key={c.id} on={tool.type === 'color' && tool.color === c.id} onClick={() => setTool({ type: 'color', color: c.id })} label={`צבע ${c.name}`}>
          <span aria-hidden="true" className="block h-7 w-7 rounded-full border border-black/20" style={{ background: c.hex }} />
        </ToolButton>)}
        <ToolButton on={tool.type === 'circle'} onClick={() => setTool({ type: 'circle' })} label="הקפה בעיגול" className="bg-white px-3">⭕ הקפה</ToolButton>
        <ToolButton on={tool.type === 'star'} onClick={() => setTool({ type: 'star' })} label="כוכב" className="bg-white px-3">⭐ כוכב</ToolButton>
        <ToolButton on={tool.type === 'erase'} onClick={() => setTool({ type: 'erase' })} label="מחק" className="bg-white px-3">🧽 מחק</ToolButton>
      </div>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-[var(--border)]">
        <svg viewBox="0 0 360 300" className="block h-auto w-full touch-manipulation select-none" role="group" aria-label="תמונה: חצר עם בית, עץ, שולחן, קופסה ובריכת ברווזים">
          <SceneArt marks={marks} />
          <TapLayer onTap={tap} labelOf={labelOf} />
        </svg>
      </div>

      <p className="mt-3 min-h-[2rem] text-lg font-bold" aria-live="polite">{msg}</p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {(status === 'retry' || status === 'order') && <button type="button" onClick={retry} className="min-h-[52px] rounded-xl bg-violet-600 px-6 text-lg font-bold text-white">🔊 שומעים שוב ומנסים</button>}
        {status === 'done'
          ? <button type="button" onClick={() => fresh(level)} className="min-h-[52px] rounded-xl bg-emerald-600 px-7 text-lg font-bold text-white">להוראה הבאה ←</button>
          : <>
            <button type="button" onClick={clear} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 text-sm font-bold">🧹 ניקוי התמונה</button>
            <button type="button" onClick={() => fresh(level)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 text-sm font-bold">הוראה אחרת</button>
          </>}
      </div>
      {status === 'done' && <p className="mt-2 text-sm text-[var(--muted-foreground)]">אפשר להמשיך לצבוע בשביל הכיף, או לעבור להוראה הבאה.</p>}
    </div>
  </div>
}

// ── Printables ──────────────────────────────────────────────────────────────

const Gray = () => <defs><filter id="dir-gray"><feColorMatrix type="saturate" values="0" /></filter></defs>

function Txt({ x, y, size, weight = 400, fill = '#111', anchor = 'middle', children }) {
  return <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} direction="rtl" fontFamily={FONT}>{children}</text>
}
function Emo({ x, y, size, color, children }) {
  return <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central" fontFamily={EMOJI} filter={color ? undefined : 'url(#dir-gray)'}>{children}</text>
}
// Split a sentence into lines of at most `max` characters, at spaces.
function wrap(text, max) {
  const lines = []
  let cur = ''
  for (const w of text.split(' ')) {
    if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w } else cur = cur ? cur + ' ' + w : w
  }
  if (cur) lines.push(cur)
  return lines
}

function Header({ title, note }) {
  return <>
    <Txt x={100} y={11} size={6.4} weight={900}>{title}</Txt>
    {note && <Txt x={100} y={17} size={3.2} fill="#4b5563">{note}</Txt>}
  </>
}

function colorSheet(level, seed) {
  const lv = levelById[level]
  const list = sheetInstructions(level, seed)
  let y = 205
  const rows = list.map((ins, i) => {
    const lines = wrap(ins.text, 88)
    const row = { i, lines, y }
    y += lines.length * 4.6 + 2.2
    return row
  })
  return {
    key: `color-${level}-${seed}`,
    svg: <Sheet label={`צובעים לפי הוראות — ${lv.label}`}>
      <Header title={`צובעים לפי הוראות · ${lv.label}`} note="צריך: צבעים (אדום, כחול, צהוב, ירוק, כתום, סגול) ועיפרון" />
      <Txt x={190} y={25} size={3.4} anchor="start">שם: ____________________</Txt>
      <rect x={10} y={28} width={180} height={150} rx={3} fill="#fff" stroke="#111" strokeWidth=".5" />
      <svg x={10} y={28} width={180} height={150} viewBox="0 0 360 300"><SceneArt print /></svg>
      <line x1={6} y1={187} x2={194} y2={187} stroke="#9ca3af" strokeWidth=".4" strokeDasharray="2 1.4" />
      <Txt x={100} y={185.4} size={2.8} fill="#6b7280">✂ אפשר לגזור או לקפל כאן — החלק שלמטה למבוגר</Txt>
      <Txt x={192} y={194} size={3.7} weight={800} anchor="start">למבוגר: מקריאים הוראה אחת בכל פעם — בלי להראות את הכתוב</Txt>
      <Txt x={192} y={199.5} size={3} fill="#4b5563" anchor="start">אומרים בקול רגיל, מחכים בסבלנות, ואפשר לחזור פעם אחת. {lv.desc}</Txt>
      {rows.map(r => <g key={r.i}>
        <Txt x={192} y={r.y + 3.4} size={3.6} weight={800} anchor="start">{r.i + 1}.</Txt>
        {r.lines.map((l, k) => <Txt key={k} x={186} y={r.y + 3.4 + k * 4.6} size={3.6} anchor="start">{l}</Txt>)}
      </g>)}
    </Sheet>,
  }
}

// Basic concepts: six rows of small pictures; the adult reads the instructions at the bottom.
function Frame({ x, y, w, h }) { return <rect x={x} y={y} width={w} height={h} rx={2.5} fill="#fff" stroke="#111" strokeWidth=".45" /> }
function MiniTable({ x, y }) { return <g stroke="#111" strokeWidth=".7" fill="none"><line x1={x - 13} y1={y} x2={x + 13} y2={y} strokeWidth="1.3" /><line x1={x - 10} y1={y} x2={x - 10} y2={y + 11} /><line x1={x + 10} y1={y} x2={x + 10} y2={y + 11} /></g> }
function MiniBox({ x, y }) { return <rect x={x - 9} y={y} width={18} height={11} fill="#fff" stroke="#111" strokeWidth=".7" /> }
function MiniTree({ x, y }) { return <g stroke="#111" strokeWidth=".6" fill="#fff"><rect x={x - 1.8} y={y + 6} width={3.6} height={14} /><circle cx={x} cy={y} r={8} /></g> }

function conceptsSheet(color) {
  const fw = 54, fh = 27, xs = [134, 76, 18], wideX = 18, wideW = 170
  const rowY = i => 25 + i * 31
  const L = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']
  const tableY = y => y + 13
  return {
    key: 'concepts',
    svg: <Sheet label="מושגים בסיסיים — דף להקשבה">
      <Gray />
      <Header title="מושגים בסיסיים: מקשיבים ומסמנים" note="המבוגר מקריא את ההוראות שבתחתית הדף · הילד/ה מקיף/ה או מסמן/ת X" />
      {L.map((l, i) => <Txt key={l} x={194} y={rowY(i) + 15} size={5} weight={900}>{l}</Txt>)}
      {/* א — sizes */}
      {[[9, 0], [19, 1], [13.5, 2]].map(([s, k]) => <g key={k}><Frame x={xs[k]} y={rowY(0)} w={fw} h={fh} /><Emo x={xs[k] + fw / 2} y={rowY(0) + fh / 2} size={s} color={color}>🎈</Emo></g>)}
      {/* ב — the dog and the box: inside / on / next to */}
      {[0, 1, 2].map(k => { const x = xs[k] + fw / 2, y = rowY(1); return <g key={k}><Frame x={xs[k]} y={y} w={fw} h={fh} />
        {k === 0 && <><Emo x={x} y={y + 12.5} size={9} color={color}>🐶</Emo><MiniBox x={x} y={y + 14} /><path d={`M${x - 9} ${y + 14} l-5 -5 M${x + 9} ${y + 14} l5 -5`} stroke="#111" strokeWidth=".7" /></>}
        {k === 1 && <><MiniBox x={x} y={y + 14} /><Emo x={x} y={y + 9} size={8} color={color}>🐶</Emo></>}
        {k === 2 && <><MiniBox x={x - 8} y={y + 13} /><Emo x={x + 12} y={y + 18} size={8} color={color}>🐶</Emo></>}
      </g> })}
      {/* ג — the cat and the table: on / under / next to */}
      {[0, 1, 2].map(k => { const x = xs[k] + fw / 2, y = rowY(2); return <g key={k}><Frame x={xs[k]} y={y} w={fw} h={fh} />
        <MiniTable x={k === 2 ? x - 8 : x} y={tableY(y)} />
        {k === 0 && <Emo x={x} y={y + 8} size={8} color={color}>🐱</Emo>}
        {k === 1 && <Emo x={x} y={y + 20} size={7} color={color}>🐱</Emo>}
        {k === 2 && <Emo x={x + 13} y={y + 19} size={8} color={color}>🐱</Emo>}
      </g> })}
      {/* ד — birds up / middle / down by a tree */}
      {[0, 1, 2].map(k => { const x = xs[k] + fw / 2, y = rowY(3); return <g key={k}><Frame x={xs[k]} y={y} w={fw} h={fh} />
        <MiniTree x={x - 6} y={y + 7} />
        <Emo x={x + 11} y={[y + 5, y + 13, y + 22][k]} size={7} color={color}>🐦</Emo>
      </g> })}
      {/* ה — the queue for ice cream (the stand is on the left, the queue comes from the right) */}
      {(() => { const y = rowY(4); return <g><Frame x={wideX} y={y} w={wideW} h={fh} />
        <Emo x={36} y={y + 12} size={13} color={color}>🍦</Emo>
        <Txt x={36} y={y + 24.5} size={3} weight={700}>גלידה</Txt>
        {['🐻', '🐰', '🐸', '🐱'].map((e, k) => <Emo key={e} x={66 + k * 30} y={y + 13} size={12} color={color}>{e}</Emo>)}
        <Txt x={166} y={y + 24.5} size={2.8} fill="#4b5563">← התור מתקדם לכיוון הגלידה</Txt>
      </g> })()}
      {/* ו — five circles, counted from the right */}
      {(() => { const y = rowY(5); return <g><Frame x={wideX} y={y} w={wideW} h={fh} />
        {[0, 1, 2, 3, 4].map(k => <circle key={k} cx={160 - k * 28} cy={y + 13} r={8.5} fill="#fff" stroke="#111" strokeWidth=".7" />)}
        <Txt x={170} y={y + 25} size={2.8} fill="#4b5563">מתחילים מכאן ←</Txt>
      </g> })()}
      <line x1={6} y1={214} x2={194} y2={214} stroke="#9ca3af" strokeWidth=".4" strokeDasharray="2 1.4" />
      <Txt x={192} y={220} size={3.6} weight={800} anchor="start">למבוגר — מקריאים שורה אחת בכל פעם:</Txt>
      {[
        'א. הקיפו את הבלון הגדול. ועכשיו — סמנו X על הבלון הקטן.',
        'ב. הקיפו את הכלב שבתוך הקופסה. איפה הכלב בשתי התמונות האחרות?',
        'ג. סמנו X על החתול שמתחת לשולחן, והקיפו את החתול שעל השולחן.',
        'ד. הקיפו את הציפור שלמעלה, וסמנו X על הציפור שלמטה.',
        'ה. הקיפו את מי שראשון בתור לגלידה, וסמנו X על מי שאחרון. מי עומד אחרי הדוב?',
        'ו. צבעו באדום את העיגול הראשון, ובכחול את העיגול האחרון. איזה עיגול באמצע?',
      ].map((t, i) => <Txt key={i} x={192} y={226.5 + i * 5.2} size={3.35} anchor="start">{t}</Txt>)}
      <Txt x={100} y={262} size={3} fill="#4b5563">רוצים עוד? הופכים את השאלות: „איפה הכלב שעל הקופסה?”, „מי שני בתור?”</Txt>
    </Sheet>,
  }
}

const CARD_TONE = { 1: ['#047857', '#d1fae5'], 2: ['#b45309', '#fef3c7'], 3: ['#be123c', '#ffe4e6'] }
function cardPages(color) {
  const all = CARD_LEVELS.flatMap(l => l.cards.map(t => ({ t, level: l })))
  const per = 18, cols = 3, cw = 62, ch = 38.5, x0 = 7, y0 = 22
  return Array.from({ length: Math.ceil(all.length / per) }, (_, p) => {
    const chunk = all.slice(p * per, p * per + per)
    const cells = chunk.map((c, i) => ({ ...c, x: x0 + (cols - 1 - (i % cols)) * cw, y: y0 + Math.floor(i / cols) * ch }))
    return {
      key: `cards-${p}`,
      svg: <Sheet label={`כרטיסי הוראות — דף ${p + 1}`}>
        <Header title={`כרטיסי הוראות לגזירה (${p + 1}/${Math.ceil(all.length / per)})`} note="✂ גוזרים, הופכים, ושולפים כרטיס · המבוגר מקריא — הילד/ה עושה · הנקודות מראות כמה שלבים" />
        {cells.map((c, i) => {
          const [ink, bg] = CARD_TONE[c.level.id]
          const lines = wrap(c.t, 24)
          return <g key={i}>
            <rect x={c.x} y={c.y} width={cw} height={ch} fill="#fff" stroke="#9ca3af" strokeWidth=".35" strokeDasharray="2 1.4" />
            <rect x={c.x + 2} y={c.y + 2} width={cw - 4} height={8} rx={2} fill={color ? bg : '#fff'} stroke={color ? ink : '#111'} strokeWidth=".4" />
            <Txt x={c.x + cw - 5} y={c.y + 7.3} size={3.4} weight={800} anchor="start" fill={color ? ink : '#111'}>{c.level.label}</Txt>
            {Array.from({ length: c.level.id }, (_, k) => <circle key={k} cx={c.x + 7 + k * 4.5} cy={c.y + 6} r={1.6} fill={color ? ink : '#111'} />)}
            {lines.map((l, k) => <Txt key={k} x={c.x + cw / 2} y={c.y + 10 + (ch - 10) / 2 - ((lines.length - 1) * 5.4) / 2 + 1.6 + k * 5.4} size={4.1} weight={700}>{l}</Txt>)}
          </g>
        })}
      </Sheet>,
    }
  })
}

function herzlSheet() {
  const colX = [192, 96]
  const groups = HERZL.map((g, i) => ({ ...g, col: i < 2 ? 0 : 1 }))
  const yAt = [70, 70]
  return {
    key: 'herzl',
    svg: <Sheet label="הרצל אמר — רשימת הוראות">
      <Header title="הרצל אמר: משחק הקשבה בתנועה" note="רשימה למבוגר · מתאים לגן, לקבוצה ולבית" />
      <rect x={8} y={22} width={184} height={40} rx={3} fill="#fff" stroke="#111" strokeWidth=".45" />
      {[
        'איך משחקים: המבוגר אומר הוראה. אם היא מתחילה ב„הרצל אמר” — עושים. אם לא — לא זזים!',
        'בגרסה שלנו אף אחד לא יוצא מהמשחק: מי שזז בטעות פשוט צוחק איתנו וממשיך.',
        'מתחילים לאט, בהוראות של שלב אחד, ורק אחר כך עוברים לשני שלבים.',
        'אפשר להחליף תפקידים: הילד/ה אומר/ת את ההוראות והמבוגר עושה — גם זה תרגול שפה.',
        'לילדים שקשה להם לעמוד במקום — לשחק בישיבה, עם תנועות ידיים.',
      ].map((t, i) => <Txt key={i} x={188} y={30 + i * 7} size={3.5} anchor="start">{t}</Txt>)}
      {groups.map(g => {
        const x = colX[g.col], y = yAt[g.col]
        yAt[g.col] = y + 10 + g.items.length * 7.2 + 6
        return <g key={g.group}>
          <Txt x={x} y={y} size={5} weight={900} anchor="start">{g.group}</Txt>
          {g.items.map((t, k) => <g key={t}>
            <rect x={x - 4} y={y + 4.2 + k * 7.2} width={3.2} height={3.2} fill="#fff" stroke="#6b7280" strokeWidth=".35" />
            <Txt x={x - 9} y={y + 7.4 + k * 7.2} size={3.6} anchor="start">הרצל אמר: {t}</Txt>
          </g>)}
        </g>
      })}
      <Txt x={100} y={258} size={3.2} fill="#4b5563">טיפ: מדי פעם אומרים הוראה בלי „הרצל אמר” — וכך מתרגלים הקשבה לפרטים.</Txt>
    </Sheet>,
  }
}

const sheetsOf = list => list.map(p => <article className="buga-a4" key={p.key}><div className="print-art">{p.svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)

// ── Page ────────────────────────────────────────────────────────────────────

const faq = [
  { q: 'מה זה הוראות בשלבים?', a: 'הוראה בשלב אחד היא בקשה לפעולה אחת ("הביאו לי כפית"). בהוראה של שני שלבים או שלושה שלבים יש כמה פעולות שצריך לזכור ולבצע לפי הסדר ("קחו את הספר, שימו אותו על המדף וחזרו לשבת"). קלינאיות תקשורת מדרגות הוראות לפי מספר השלבים, לפי המושגים שבהן (על, מתחת, לפני, אחרי, גדול, קטן) ולפי האורך שלהן.' },
  { q: 'למה ההוראה במשחק לא מופיעה בכתב?', a: 'כי זה תרגול של הבנת הנשמע: הילד/ה צריך/ה לשמוע, להבין ולזכור. אם ההוראה כתובה או שהמבוגר מצביע — כבר לא בודקים הקשבה. לכן הכתוב מוסתר, ויש כפתור קטן שמראה אותו רק למבוגר.' },
  { q: 'מה עושים כשהילד לא מבצע את ההוראה?', a: 'קודם בודקים שהוא הקשיב (קשר עין, שקט מסביב), ואז חוזרים על ההוראה פעם אחת, באותן מילים. אפשר לקצר אותה לשלב אחד, להוסיף מחווה או להדגים — ובפעם הבאה לנסות שוב בלי עזרה. חשוב לא להפוך את זה למבחן: מחמיאים על ההקשבה ועל הניסיון.' },
  { q: 'באיזה גיל ילדים מבינים הוראות של שני שלבים ושלושה שלבים?', a: 'היכולת לבצע הוראות ארוכות יותר גדלה בהדרגה בשנות הגן, ויש שונות גדולה בין ילדים. בעמוד "התפתחות שפה לפי גיל" באתר יש טווחים כלליים לפי מקורות מקצועיים. אם יש דאגה — למשל כשילד מתקשה גם בהוראות קצרות ומוכרות — כדאי לפנות לקלינאי/ת תקשורת ולבדוק גם שמיעה.' },
  { q: 'למה "לפני" ו"אחרי" קשים במיוחד?', a: 'כי בהוראה כמו "לפני שתשבו, הסתובבו" סדר המילים הפוך לסדר הפעולות: שומעים קודם "לשבת", אבל צריך להסתובב קודם. ילדים צעירים נוטים לבצע לפי סדר השמיעה, ולכן ההבנה של מושגי זמן מתפתחת מאוחר יותר ממושגים של מקום.' },
  { q: 'איך משחקים "הרצל אמר" בלי שאף אחד ייפגע?', a: 'בגרסה הרגילה מי שטועה יוצא, ודווקא הילדים שהכי צריכים את התרגול יושבים בצד. כאן ממליצים לשחק בלי הדחה: מי שזז בטעות צוחק וממשיך. אפשר גם לשחק בישיבה, ולתת לילד/ה להיות זה/זו שנותן/ת את ההוראות.' },
  { q: 'האם המשחק נותן ציון או שומר נתונים?', a: 'לא. אין ניקוד, אין ספירת טעויות ואין הקלטה. המשחק רק אומר "כל הכבוד" כשההוראה בוצעה, או מציע להקשיב שוב.' },
  { q: 'אפשר להדפיס את הדפים?', a: 'כן, בחינם. יש דפי צביעה לפי הוראות לכל רמה (התמונה לילד/ה, וההוראות בפס נפרד למבוגר), דף מושגים בסיסיים, כרטיסי הוראות לגזירה בשלוש רמות ורשימת "הרצל אמר". בכל הדפסה של דפי הצביעה אפשר לבקש כמה עותקים — וכל עותק מקבל הוראות אחרות.' },
]

const related = [
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
  { label: 'שפה: קטגוריות, שאלות, רצף והוראות', href: '/speech/language' },
  { label: 'סיפור ברצף: כרטיסי רצף', href: '/speech/language/sequencing' },
  { label: 'התפתחות שפה לפי גיל', href: '/speech/parents/language-milestones' },
  { label: 'זוגות מינימליים — משחק הקשבה', href: '/speech/minimal-pairs' },
  { label: 'הפכים ומילים נרדפות', href: '/words/opposites' },
]

const Guide = ({ title, children }) => <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
  <h2 className="mb-3 text-2xl font-bold">{title}</h2>
  <div className="space-y-2 leading-relaxed text-[var(--foreground)]/85">{children}</div>
</section>
const Li = ({ children }) => <li className="mr-5 list-disc">{children}</li>

const PRINT_TYPES = [['concepts', '🔎 דף מושגים בסיסיים'], ['cards', '✂️ כרטיסי הוראות'], ['herzl', '🙋 הרצל אמר']]

export default function Directions() {
  const [sheetLevels, setSheetLevels] = useState(['one', 'two', 'three'])
  const [types, setTypes] = useState(['concepts', 'cards', 'herzl'])
  const [color, setColor] = useState(true)
  const [printing, setPrinting] = useState(false)

  const build = useCallback(seed => [
    ...LEVELS.filter(l => sheetLevels.includes(l.id)).map(l => colorSheet(l.id, seed)),
    ...(types.includes('concepts') ? [conceptsSheet(color)] : []),
    ...(types.includes('cards') ? cardPages(color) : []),
    ...(types.includes('herzl') ? [herzlSheet()] : []),
  ], [sheetLevels, types, color])
  const pages = useMemo(() => build('a'), [build])
  const toggle = (set, id) => set(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO path={PATH}
        title="הוראות בשלבים לילדים — תרגול הקשבה והבנת הוראות"
        description="הוראות בשלב אחד, שניים ושלושה, מושגים בסיסיים (על, מתחת, לפני, אחרי, ראשון, אחרון), משחק הקשבה עם שמע, דפי צביעה לפי הוראות, כרטיסים ו„הרצל אמר” להדפסה — חינם."
        structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה', href: '/speech/language' }, { label: 'הוראות בשלבים' }]} />
      <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">👂 </span>הוראות בשלבים: תרגול הקשבה והבנת הוראות</h1>
      <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">משחק „שמעתי ועשיתי” · הוראות בשלב אחד, שניים ושלושה · מושגים בסיסיים · דפים להדפסה</p>

      <QuickAnswer q="איך מתרגלים הבנת הוראות עם ילדים?"
        a="מתחילים בהוראה של שלב אחד עם מילים מוכרות, ומוסיפים בהדרגה: מושג אחד (על, מתחת, גדול, ראשון), שני שלבים, שלושה שלבים, ובסוף הוראות עם „לפני” ו„אחרי”. אומרים את ההוראה פעם אחת, בלי להצביע, ונותנים זמן. כאן יש משחק שבו המכשיר (או מבוגר) מקריא הוראה והילד/ה צובע/ת ומסמן/ת בתמונה, וגם דפים וכרטיסים להדפסה."
        rows={[['רמות', 'שלב אחד · שלב אחד + מושג · שני שלבים · שלושה שלבים · לפני/אחרי'], ['מושגים', 'למעלה/למטה, על/מתחת, בתוך, ליד, ראשון/אחרון, גדול/קטן, צבעים'], ['להדפסה', 'צביעה לפי הוראות, דף מושגים, 36 כרטיסי הוראות, „הרצל אמר”'], ['מחיר', 'חינם, בלי הרשמה, בלי הקלטה ובלי ציון']]}
        updated={UPDATED} />

      <SpeechNote />

      <section aria-labelledby="dir-game" className="mb-10">
        <h2 id="dir-game" className="mb-1 text-center text-2xl font-bold">משחק: שמעתי ועשיתי</h2>
        <p className="mb-4 text-center text-[var(--muted-foreground)]">מקשיבים להוראה, בוחרים צבע או כלי, ולוחצים על הדבר הנכון בתמונה.</p>
        <Game />
      </section>

      <section aria-labelledby="dir-levels" className="mb-10">
        <h2 id="dir-levels" className="mb-2 text-2xl font-bold">הוראות בשלבים: מהוראה אחת לשלוש</h2>
        <p className="mb-4 leading-relaxed text-[var(--foreground)]/80">הוראות לתרגול בבית או בגן, בלי ציוד מיוחד. המבוגר אומר — הילד/ה עושה. לחיצה על 🔊 משמיעה את ההוראה. אפשר לעבור לרמה הבאה כשהילד/ה מצליח/ה בקלות, ולחזור אחורה בלי היסוס.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {CARD_LEVELS.map(l => <div key={l.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-xl font-bold">{'●'.repeat(l.id)} {l.label}</h3>
            <ul className="space-y-1">
              {l.cards.map(t => <li key={t} className="flex items-start gap-1">
                <button type="button" onClick={() => speak(t, 'he-IL', { rate: 0.85 })} aria-label={`השמעה: ${t}`} className="min-h-[36px] min-w-[36px] shrink-0 rounded-full hover:bg-[var(--postit)]">🔊</button>
                <span className="pt-1.5">{t}</span>
              </li>)}
            </ul>
          </div>)}
        </div>
      </section>

      <section aria-labelledby="dir-concepts" className="mb-10">
        <h2 id="dir-concepts" className="mb-2 text-2xl font-bold">מושגים בסיסיים בהוראות</h2>
        <p className="mb-4 leading-relaxed text-[var(--foreground)]/80">הרבה הוראות „נתקעות” לא בגלל האורך אלא בגלל מושג אחד. כדאי לתרגל כל מושג קודם לבד, בתנועה ועם חפצים אמיתיים, ורק אחר כך לשלב אותו בהוראות. מושגי מקום (על, מתחת, בתוך) מוכרים בדרך כלל לפני מושגי זמן (לפני, אחרי). ימין ושמאל נרכשים מאוחר יותר, ולא כדאי להתחיל בהם.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {CONCEPTS.map(c => <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <h3 className="mb-1 text-lg font-bold"><span aria-hidden="true">{c.e} </span>{c.label}</h3>
            <p className="leading-relaxed text-[var(--foreground)]/80">{c.idea}</p>
          </div>)}
        </div>
      </section>

      <section aria-labelledby="dir-herzl" className="mb-10 rounded-2xl border border-[var(--border)] bg-[var(--postit)] p-5 shadow-sm">
        <h2 id="dir-herzl" className="mb-2 text-2xl font-bold">🙋 „הרצל אמר” — הוראות בתנועה</h2>
        <p className="mb-3 leading-relaxed">המשחק המוכר הוא תרגול מצוין של הקשבה: עושים רק כשהמשפט מתחיל ב„הרצל אמר”. בגרסה שלנו אף אחד לא יוצא מהמשחק — מי שזז בטעות פשוט ממשיך.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {HERZL.map(g => <div key={g.group}>
            <h3 className="mb-1 text-lg font-bold">{g.group}</h3>
            <ul className="space-y-0.5">{g.items.map(t => <li key={t} className="mr-5 list-disc">הרצל אמר: {t}</li>)}</ul>
          </div>)}
        </div>
      </section>

      <section aria-labelledby="dir-print" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <h2 id="dir-print" className="mb-2 text-center text-2xl font-bold">דפים להדפסה</h2>
        <p className="mb-4 text-center text-[var(--muted-foreground)]">דפי צביעה לפי הוראות — דף לכל רמה, עם פס הוראות נפרד למבוגר:</p>
        <div className="mb-3 flex flex-wrap justify-center gap-2" role="group" aria-label="דפי צביעה לפי רמה">
          {LEVELS.map(l => <button key={l.id} type="button" aria-pressed={sheetLevels.includes(l.id)} onClick={() => toggle(setSheetLevels, l.id)}
            className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${sheetLevels.includes(l.id) ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white text-slate-500'}`}>🖍️ {l.label}</button>)}
        </div>
        <div className="mb-3 flex flex-wrap justify-center gap-2" role="group" aria-label="עוד דפים">
          {PRINT_TYPES.map(([id, l]) => <button key={id} type="button" aria-pressed={types.includes(id)} onClick={() => toggle(setTypes, id)}
            className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${types.includes(id) ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white text-slate-500'}`}>{l}</button>)}
        </div>
        <div className="mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="צבע">
          {[[true, '🎨 צבעוני'], [false, '⚫ שחור־לבן']].map(([v, l]) => <button key={l} type="button" aria-pressed={color === v} onClick={() => setColor(v)}
            className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${color === v ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
        </div>
        {pages.length > 0
          ? <>
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3" aria-label="תצוגה מקדימה">
              {pages.filter((p, i) => pages.findIndex(q => q.key.split('-')[0] === p.key.split('-')[0]) === i).map(p => <div key={p.key} className="border border-[var(--border)] bg-white p-1.5 shadow-sm">{p.svg}</div>)}
            </div>
            <div className="mt-5 text-center">
              <button type="button" data-print-main onClick={() => setPrinting(true)} className="min-h-[52px] rounded-xl bg-red-500 px-8 py-3 text-lg font-bold text-white">🖨️ הדפסה או PDF · {pages.length} {pages.length === 1 ? 'דף' : 'דפים'}</button>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">A4. בדפי הצביעה, כל עותק נוסף מקבל הוראות אחרות.</p>
            </div>
          </>
          : <p className="text-center">בחרו לפחות דף אחד להדפסה.</p>}
      </section>
      {printing && <PrintPreview title="הוראות בשלבים" onClose={() => setPrinting(false)} variant={i => sheetsOf(build(`copy${i}`))}>{sheetsOf(pages)}</PrintPreview>}

      <div className="mx-auto max-w-3xl space-y-5">
        <Guide title="לקלינאיות תקשורת ולגננות: איך לדרג הוראות">
          <ul className="space-y-1.5">
            <Li><b>מספר השלבים</b> הוא רק ציר אחד. הוראה קצרה עם מושג לא מוכר („מתחת”) יכולה להיות קשה יותר מהוראה ארוכה עם מילים מוכרות.</Li>
            <Li><b>שלבים קשורים ושלבים לא קשורים:</b> „קחו את הכדור ושימו אותו בסל” קל יותר מ„מחאו כפיים ופתחו את הדלת”, כי הפעולה הראשונה מובילה לשנייה.</Li>
            <Li><b>לפני ואחרי:</b> כשסדר המילים הפוך לסדר הפעולות, הילד/ה צריך/ה להבין את המושג ולא רק לזכור. זו הרמה האחרונה במשחק.</Li>
            <Li><b>במשחק</b> אפשר לבחור „מבוגר אומר” ולהקריא בעצמך — כך אפשר לשנות מילים, לקצר או להוסיף מחווה, ועדיין לעבוד על אותה תמונה.</Li>
            <Li>דפי הצביעה מתאימים לשיעורי בית: התמונה לילד/ה, וההוראות בפס נפרד שההורה מקריא.</Li>
          </ul>
        </Guide>
        <Guide title="להורים: תרגול הקשבה בבית, בלי לחץ">
          <ul className="space-y-1.5">
            <Li>תנו הוראות כחלק מהיום: „הביאו את הנעליים ושימו אותן ליד הדלת”. זה תרגול אמיתי, בלי דף ובלי מסך.</Li>
            <Li>לפני שאומרים — מוודאים שהילד/ה מקשיב/ה: קוראים בשם, מתקרבים, מורידים רעש רקע.</Li>
            <Li>אומרים פעם אחת ומחכים. אם צריך, חוזרים באותן מילים, ואחר כך מקצרים או מדגימים.</Li>
            <Li>אם הילד/ה מתקשה הרבה גם בהוראות קצרות ומוכרות, או שנראה שהוא/היא לא שומע/ת טוב — כדאי להתייעץ עם קלינאי/ת תקשורת ולבדוק שמיעה. פרטים נוספים ב<Link className="font-bold underline" to="/speech/parents/language-milestones">עמוד התפתחות השפה</Link>.</Li>
          </ul>
        </Guide>
      </div>

      <div className="mt-12">
        <SeoBody paragraphs={[
          'הבנת הוראות היא אחת המיומנויות השפתיות שהכי משפיעות על היום־יום של ילד בגן ובבית: להבין מה מבקשים, לזכור את הפרטים ולבצע לפי הסדר. קלינאיות תקשורת מתרגלות הוראות בשלבים כדי לחזק הבנת שפה, זיכרון שמיעתי ומושגים בסיסיים — וגם כדי לראות איפה בדיוק ההוראה „נשברת”.',
          'הדרך המקובלת היא לדרג: הוראה אחת עם מילים מוכרות, הוראה אחת עם מושג (למעלה, מתחת, בתוך, ליד, ראשון, אחרון, גדול, קטן, צבעים), שתי פעולות, שלוש פעולות, ובסוף הוראות שבהן צריך להבין „לפני” ו„אחרי”. כל שלב מוסיף עוד קצת עומס, וכך אפשר לבחור את הרמה שמאתגרת אבל לא מתסכלת.',
          'בעמוד יש משחק תרגול הקשבה עם שמע, הוראות בשלבים לילדים לתרגול בבית ובגן, רשימת „הרצל אמר” לתנועה, ודפים להדפסה: צביעה לפי הוראות בחמש רמות, דף מושגים בסיסיים וכרטיסי הוראות לגזירה. הכול בחינם, בלי הרשמה ובלי הקלטה.',
        ]} faq={faq} related={related} />
      </div>
    </div>
  )
}
