import { useEffect, useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet } from '../../components/printables/PrintableShell'
import { hasVoice, speak } from '../../utils/speak'
import SpeechNote from './SpeechNote'
import { PAIRS, PROCESSES, CONTRASTS, contrastById, processById } from '../../data/speech/minimalPairs'

// /speech/minimal-pairs — Hebrew minimal pairs by phonological process: a listening game
// ("איזו מילה שמעת?"), a "say it" mode for an adult and a child, and printables (pair cards,
// a two-column sorting sheet and a board-game path). No recording and no pronunciation scoring.

const PATH = '/speech/minimal-pairs'
const FONT = 'Heebo, Arial, sans-serif'
const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
const UPDATED = '2026-10-24'

// Frame colours per process: [stroke, fill].
const ACCENT = {
  fronting: ['#1d4ed8', '#dbeafe'], stopping: ['#b45309', '#fef3c7'], sibilants: ['#7c3aed', '#ede9fe'], liquids: ['#be185d', '#fce7f3'],
  voicing: ['#047857', '#d1fae5'], final: ['#0e7490', '#cffafe'], syllable: ['#4d7c0f', '#ecfccb'], cluster: ['#9a3412', '#ffedd5'],
}
const accentOf = pair => ACCENT[contrastById[pair.contrast].process]

// Deterministic shuffle, so printed sheets don't change on every render.
function seeded(seed) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = (h + 0x6D2B79F5) | 0
    let t = Math.imul(h ^ (h >>> 15), h | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function shuffle(list, seed) {
  const rnd = seed ? seeded(seed) : Math.random
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const sayWord = (word, user = true) => speak(word.w, 'he-IL', { rate: 0.8, user, ...(word.say ? { say: word.say } : {}) })

// ── Printables ───────────────────────────────────────────────────────────────

const Gray = () => <defs><filter id="mp-gray"><feColorMatrix type="saturate" values="0" /></filter></defs>

function Txt({ x, y, size, weight = 400, fill = '#111', anchor = 'middle', children }) {
  return <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} direction="rtl" fontFamily={FONT}>{children}</text>
}

// One picture card: emoji (or a space to draw one) and the word under it.
function CardArt({ x, y, w, h, word, accent, color, tag }) {
  const pad = 1.6, iw = w - 2 * pad, ih = h - 2 * pad
  const wordSize = Math.min(ih * 0.17, (iw * 0.9) / (word.w.length * 0.62))
  const iconCy = y + pad + ih * (tag ? 0.44 : 0.4)
  return <g>
    <rect x={x + pad} y={y + pad} width={iw} height={ih} rx={3} fill={color ? accent[1] : '#fff'} stroke={color ? accent[0] : '#111'} strokeWidth=".6" />
    {tag && <Txt x={x + w / 2} y={y + pad + ih * 0.11} size={Math.min(3.2, ih * 0.08)} fill="#4b5563">{tag}</Txt>}
    {word.e
      ? <text x={x + w / 2} y={iconCy} textAnchor="middle" dominantBaseline="central" fontSize={ih * 0.4} fontFamily={EMOJI} filter={color ? undefined : 'url(#mp-gray)'}>{word.e}</text>
      : <g>
        <circle cx={x + w / 2} cy={iconCy} r={ih * 0.22} fill="#fff" stroke="#9ca3af" strokeWidth=".4" strokeDasharray="1.4 1" />
        <Txt x={x + w / 2} y={iconCy + 1} size={Math.max(2.2, ih * 0.065)} fill="#9ca3af">ציירו כאן</Txt>
      </g>}
    <Txt x={x + w / 2} y={y + pad + ih * 0.86} size={wordSize} weight={800}>{word.w}</Txt>
  </g>
}

// Dashed cut lines around cells, each edge once.
function CutLines({ cells }) {
  const seen = new Set(), lines = []
  const add = (...l) => { const k = l.map(v => v.toFixed(2)).join(); if (!seen.has(k)) { seen.add(k); lines.push(l) } }
  for (const c of cells) { add(c.x, c.y, c.x + c.w, c.y); add(c.x, c.y + c.h, c.x + c.w, c.y + c.h); add(c.x, c.y, c.x, c.y + c.h); add(c.x + c.w, c.y, c.x + c.w, c.y + c.h) }
  return <g stroke="#9ca3af" strokeWidth=".35" strokeDasharray="2 1.4">{lines.map((l, i) => <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />)}</g>
}

function Header({ title, note }) {
  return <>
    <Txt x={100} y={10} size={6.4} weight={900}>{title}</Txt>
    <Txt x={100} y={15.8} size={3.3} fill="#4b5563">{note}</Txt>
  </>
}

// Pair cards: 16 per page, the two cards of a pair side by side (two pairs per row).
function cardPages(pairs, color) {
  const GX = 5, GY = 20, GW = 190, GH = 244, cw = GW / 4, ch = GH / 4, per = 8
  const count = Math.ceil(pairs.length / per)
  return Array.from({ length: count }, (_, s) => {
    const cells = []
    pairs.slice(s * per, s * per + per).forEach((pair, k) => {
      const row = Math.floor(k / 2), base = (k % 2) * 2, tag = contrastById[pair.contrast].label
      ;[pair.a, pair.b].forEach((word, j) => cells.push({ word, pair, tag, x: GX + GW - (base + j + 1) * cw, y: GY + row * ch, w: cw, h: ch }))
    })
    return {
      key: `cards-${s}`,
      svg: <Sheet label={`כרטיסי זוגות מינימליים — דף ${s + 1}`}>
        <Gray />
        <Header title={count > 1 ? `כרטיסי זוגות מינימליים (${s + 1}/${count})` : 'כרטיסי זוגות מינימליים'} note="✂ גוזרים לאורך הקווים המקווקווים · כל שני כרטיסים צמודים באותו צבע הם זוג" />
        <CutLines cells={cells} />
        {cells.map(c => <CardArt key={c.pair.id + c.word.w + c.x} {...c} accent={accentOf(c.pair)} color={color} />)}
      </Sheet>,
    }
  })
}

// "Sort into two columns": paste areas for each side, and a bank of word cards to cut out.
function sortPages(pairs, color) {
  const byContrast = CONTRASTS.map(c => [c, pairs.filter(p => p.contrast === c.id)]).filter(([, list]) => list.length)
  return byContrast.flatMap(([c, list]) => {
    const sheets = Math.ceil(list.length / 6), per = Math.ceil(list.length / sheets)
    return Array.from({ length: sheets }, (_, s) => {
      const chunk = list.slice(s * per, s * per + per), n = chunk.length
      const accent = ACCENT[c.process]
      const letterSides = !!c.letters
      // Cards and paste slots grow when there are few pairs, so the sheet stays full.
      const rows = Math.ceil(n / 2), slotW = 43, slotH = Math.min(70, Math.floor((206 / rows - 2) / 2))
      const colTop = 22, headH = 17, colH = headH + rows * (slotH + 2) + 3
      const cols = [{ x: 103, side: 0 }, { x: 5, side: 1 }]
      const bankTop = colTop + colH + 12
      const words = shuffle(chunk.flatMap(p => [p.a, p.b].map(word => ({ word, pair: p }))), c.id + s)
      const perRow = 4, bw = 42, bh = slotH - 1
      const bank = words.map((it, i) => ({ ...it, x: 100 + (perRow * bw) / 2 - ((i % perRow) + 1) * bw, y: bankTop + 6 + Math.floor(i / perRow) * bh, w: bw, h: bh }))
      const title = letterSides ? `ממיינים לפי הצליל: ${c.sides[0]}׳ או ${c.sides[1]}׳?` : `ממיינים: ${c.sides[0]} או ${c.sides[1]}?`
      return {
        key: `sort-${c.id}-${s}`,
        svg: <Sheet label={`דף מיון — ${c.label}`}>
          <Gray />
          <Header title={sheets > 1 ? `${title} (${s + 1}/${sheets})` : title} note="אומרים כל מילה בקול, גוזרים את הכרטיסים שלמטה ומדביקים כל אחד בעמודה המתאימה" />
          {cols.map(({ x, side }) => <g key={side}>
            <rect x={x} y={colTop} width={92} height={colH} rx={4} fill={color ? accent[1] : '#fff'} stroke={color ? accent[0] : '#111'} strokeWidth=".7" />
            <Txt x={x + 46} y={colTop + (letterSides ? 12.5 : 11)} size={letterSides ? 11 : 5.6} weight={900} fill={color ? accent[0] : '#111'}>{c.sides[side]}</Txt>
            {Array.from({ length: n }, (_, i) => {
              const sx = x + 92 - 3 - ((i % 2) + 1) * slotW - (i % 2) * 2, sy = colTop + headH + Math.floor(i / 2) * (slotH + 2)
              return <rect key={i} x={sx} y={sy} width={slotW} height={slotH} rx={2.5} fill="#fff" stroke="#9ca3af" strokeWidth=".4" strokeDasharray="1.6 1.2" />
            })}
          </g>)}
          {c.note && <Txt x={100} y={colTop + colH + 6} size={3} fill="#4b5563">{c.note}</Txt>}
          <Txt x={100} y={bankTop + 3} size={3.6} weight={700} fill="#374151">✂ כרטיסים לגזירה</Txt>
          <CutLines cells={bank} />
          {bank.map(b => <CardArt key={b.pair.id + b.word.w} {...b} accent={accent} color={color} />)}
        </Sheet>,
      }
    })
  })
}

// Board game: a 30-square snake path from start to finish, a word on every square.
function boardPage(pairs, color) {
  const cols = 5, rows = 6, cw = 34, ch = 32, gx = 4, gy = 5, x0 = 7, y0 = 24
  const order = shuffle(pairs, 'board' + pairs.length).slice(0, 14)
  const words = order.flatMap(p => [{ word: p.a, pair: p }, { word: p.b, pair: p }])
  const fill = Array.from({ length: 28 }, (_, i) => words[i % words.length])
  const cells = Array.from({ length: cols * rows }, (_, i) => {
    const r = Math.floor(i / cols), c = i % cols, col = r % 2 ? cols - 1 - c : c // RTL snake from the bottom right
    return { i, x: x0 + (cols - 1 - col) * (cw + gx), y: y0 + (rows - 1 - r) * (ch + gy), w: cw, h: ch }
  })
  const path = cells.map((c, i) => `${i ? 'L' : 'M'}${(c.x + cw / 2).toFixed(1)} ${(c.y + ch / 2).toFixed(1)}`).join(' ')
  const star = i => i > 0 && i < 29 && i % 6 === 0
  return {
    key: 'board',
    svg: <Sheet label="משחק לוח — זוגות מינימליים">
      <Gray />
      <Header title="משחק הלוח: מגיעים לסוף המסלול" note="זורקים קובייה, מתקדמים ואומרים בקול את המילה שבמשבצת" />
      <path d={path} fill="none" stroke={color ? '#c7d2fe' : '#d1d5db'} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
      {cells.map(c => {
        if (c.i === 0 || c.i === 29) {
          const start = c.i === 0
          return <g key={c.i}>
            <rect x={c.x} y={c.y} width={cw} height={ch} rx={5} fill={color ? (start ? '#bbf7d0' : '#fde68a') : '#fff'} stroke="#111" strokeWidth=".8" />
            <text x={c.x + cw / 2} y={c.y + ch * 0.42} textAnchor="middle" dominantBaseline="central" fontSize={12} fontFamily={EMOJI} filter={color ? undefined : 'url(#mp-gray)'}>{start ? '🚩' : '🏆'}</text>
            <Txt x={c.x + cw / 2} y={c.y + ch * 0.86} size={5} weight={900}>{start ? 'התחלה' : 'סיום'}</Txt>
          </g>
        }
        const it = fill[c.i - 1]
        return <g key={c.i}>
          <rect x={c.x} y={c.y} width={cw} height={ch} rx={4} fill="#fff" />
          <CardArt x={c.x} y={c.y} w={cw} h={ch} word={it.word} accent={accentOf(it.pair)} color={color} />
          {star(c.i) && <text x={c.x + 4.5} y={c.y + 5.5} textAnchor="middle" dominantBaseline="central" fontSize={5} fontFamily={EMOJI} filter={color ? undefined : 'url(#mp-gray)'}>⭐</text>}
        </g>
      })}
      <Txt x={100} y={252} size={3.4} fill="#111">⭐ במשבצת עם כוכב אומרים את המילה שלוש פעמים. השחקן השני מצביע על התמונה ששמע.</Txt>
      <Txt x={100} y={258} size={3.4} fill="#4b5563">יצאה מילה אחרת? זה בסדר — מקשיבים יחד, המבוגר מדגים, ומנסים שוב בלי לחץ.</Txt>
    </Sheet>,
  }
}

const sheetsOf = list => list.map(p => <article className="buga-a4" key={p.key}><div className="print-art">{p.svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)

// ── Interactive parts ────────────────────────────────────────────────────────

function WordCard({ word, onClick, state, label, big = true }) {
  const ring = state === 'right' ? 'border-emerald-500 bg-emerald-50' : state === 'tried' ? 'border-slate-300 bg-slate-50 opacity-70' : state === 'heard' ? 'border-violet-500 bg-violet-50' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'
  return <button type="button" onClick={onClick} aria-label={label || word.w}
    className={`flex min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 shadow-sm transition ${ring}`}>
    {word.e ? <span aria-hidden="true" className={big ? 'text-7xl leading-none sm:text-8xl' : 'text-6xl leading-none'}>{word.e}</span> : null}
    <span className={`font-bold ${word.e ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'}`}>{word.w}</span>
    {word.hint && <span className="text-sm text-[var(--muted-foreground)]">{word.hint}</span>}
  </button>
}

function newRound(pool, prevId) {
  const options = pool.length > 1 ? pool.filter(p => p.id !== prevId) : pool
  const pair = options[Math.floor(Math.random() * options.length)]
  return { pair, target: Math.random() < 0.5 ? 'a' : 'b', order: Math.random() < 0.5 ? ['a', 'b'] : ['b', 'a'], tried: [], done: false }
}

const PRAISE = ['כן! שמעת נכון', 'יופי של הקשבה', 'בדיוק!', 'אוזניים מצוינות', 'נכון מאוד']

function ListenGame({ pool }) {
  const [voice, setVoice] = useState('device')
  const [deviceOk, setDeviceOk] = useState(true)
  const [round, setRound] = useState(() => newRound(pool))
  const [stars, setStars] = useState(0)
  const [msg, setMsg] = useState('')
  const [peek, setPeek] = useState(false)
  useEffect(() => { let on = true; hasVoice('he-IL').then(ok => { if (!on) return; setDeviceOk(ok); if (!ok) setVoice('adult') }); return () => { on = false } }, [])
  const target = round.pair[round.target]
  const play = () => { if (voice === 'device') sayWord(target) }
  const next = () => {
    const r = newRound(pool, round.pair.id)
    setRound(r); setMsg(''); setPeek(false)
    if (voice === 'device') sayWord(r.pair[r.target])
  }
  const choose = side => {
    if (round.done) return
    if (side === round.target) {
      setRound({ ...round, done: true })
      setStars(s => s + 1)
      setMsg(`⭐ ${PRAISE[stars % PRAISE.length]} — „${target.w}”`)
    } else {
      setRound({ ...round, tried: [...new Set([...round.tried, side])] })
      setMsg(voice === 'device' ? `זו „${round.pair[side].w}”. מקשיבים שוב ומנסים עוד פעם 👂` : `זו „${round.pair[side].w}”. המבוגר אומר שוב את המילה, ומנסים עוד פעם 👂`)
      if (voice === 'device') setTimeout(() => sayWord(target, false), 900)
    }
  }
  const contrast = contrastById[round.pair.contrast]
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="מי אומר את המילה">
      {[['device', '🔊 המכשיר אומר'], ['adult', '🧑 מבוגר אומר']].map(([v, l]) => <button key={v} type="button" aria-pressed={voice === v} onClick={() => { setVoice(v); setPeek(false) }}
        className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${voice === v ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
    </div>
    {!deviceOk && voice === 'device' && <p className="text-center text-sm text-[var(--muted-foreground)]">לא נמצא במכשיר הזה קול בעברית — אפשר לבחור „מבוגר אומר”.</p>}
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
      <p className="mb-1 text-sm font-bold text-[var(--muted-foreground)]">{contrast.label} · {processById[contrast.process].label}</p>
      {voice === 'device'
        ? <button type="button" onClick={play} className="mx-auto mb-4 flex min-h-[56px] items-center gap-2 rounded-full bg-violet-600 px-7 text-xl font-bold text-white shadow">🔊 הקשיבו למילה</button>
        : <div className="mb-4">
          <p className="text-lg font-bold">המבוגר אומר מילה אחת — והילד/ה מצביע/ה על מה ששמע/ה</p>
          <button type="button" onClick={() => setPeek(p => !p)} aria-expanded={peek} className="mt-2 min-h-[44px] rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 font-bold">
            {peek ? `👀 המילה להגיד: „${target.w}” (הסתרה)` : '👀 למבוגר: איזו מילה להגיד?'}
          </button>
        </div>}
      <h3 className="mb-3 text-2xl font-bold">איזו מילה שמעת?</h3>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 sm:gap-5">
        {round.order.map(side => <WordCard key={side + round.pair.id} word={round.pair[side]} onClick={() => choose(side)}
          state={round.done && side === round.target ? 'right' : round.tried.includes(side) ? 'tried' : null} label={`שמעתי: ${round.pair[side].w}`} />)}
      </div>
      <p className="mt-4 min-h-[2rem] text-lg font-bold" aria-live="polite">{msg}</p>
      {round.done && <button type="button" onClick={next} className="mt-1 min-h-[52px] rounded-xl bg-emerald-600 px-7 text-lg font-bold text-white">למילה הבאה ←</button>}
      {!round.done && <button type="button" onClick={next} className="mt-1 min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 text-sm font-bold">דילוג על הזוג</button>}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-0.5 text-xl sm:gap-1 sm:text-2xl" role="img" aria-label={`${stars} כוכבים`}>
        {Array.from({ length: Math.floor(stars / 10) }, (_, i) => <span key={'t' + i} aria-hidden="true">🏆</span>)}
        {Array.from({ length: 10 }, (_, i) => <span key={i} aria-hidden="true" className={i < stars % 10 ? '' : 'opacity-20 grayscale'}>⭐</span>)}
      </div>
      {stars > 0 && stars % 10 === 0 && round.done && <p className="mt-2 font-bold text-emerald-700">עשרה כוכבים! אפשר להמשיך — או לעשות הפסקה קטנה 🎉</p>}
    </div>
  </div>
}

function SayIt({ pool }) {
  const [order, setOrder] = useState(() => shuffle(pool))
  const [i, setI] = useState(0)
  const [heard, setHeard] = useState(null)
  const pair = order[i % order.length]
  const go = d => { setI(n => (n + d + order.length) % order.length); setHeard(null) }
  return <div className="space-y-4">
    <ol className="mx-auto max-w-2xl list-decimal space-y-1 pr-6 leading-relaxed">
      <li><b>המבוגר מדגים:</b> אומר את שתי המילים לאט וברור ומצביע על כל תמונה (אפשר גם ללחוץ על 🔊).</li>
      <li><b>הילד/ה בוחר/ת מילה</b> ואומר/ת אותה — בלי להצביע.</li>
      <li><b>המבוגר לוחץ על מה ששמע באמת</b> — לא על מה שהילד/ה התכוון/ה. כך הילד/ה מגלה בעצמו/ה שיצאה מילה אחרת, ומנסים שוב יחד.</li>
    </ol>
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
      <p className="mb-3 text-sm font-bold text-[var(--muted-foreground)]">זוג {i % order.length + 1} מתוך {order.length} · {contrastById[pair.contrast].label}</p>
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 sm:gap-5">
        {['a', 'b'].map(side => <div key={side + pair.id} className="space-y-2">
          <WordCard word={pair[side]} state={heard === side ? 'heard' : null} onClick={() => setHeard(side)} label={`המבוגר שמע: ${pair[side].w}`} />
          <button type="button" onClick={() => sayWord(pair[side])} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold" aria-label={`השמעה: ${pair[side].w}`}>🔊 {pair[side].w}</button>
        </div>)}
      </div>
      <p className="mt-4 min-h-[2rem] text-lg font-bold" aria-live="polite">{heard ? `שמעתי: „${pair[heard].w}”` : ''}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => go(-1)} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">→ הקודם</button>
        <button type="button" onClick={() => { setOrder(shuffle(pool)); setI(0); setHeard(null) }} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">🔀 ערבוב</button>
        <button type="button" onClick={() => go(1)} className="min-h-[48px] rounded-xl bg-violet-600 px-6 font-bold text-white">הבא ←</button>
      </div>
    </div>
  </div>
}

// ── Page ─────────────────────────────────────────────────────────────────────

const faq = [
  { q: 'מה הם זוגות מינימליים?', a: 'זוג מינימלי הוא שתי מילים שנבדלות זו מזו בצליל אחד בלבד, והצליל הזה משנה את המשמעות: קוף ותוף, סיר ושיר, חור וחול. הקובע הוא איך המילים נשמעות ולא איך הן נכתבות — "שה" ו"תה" הם זוג מינימלי (ס׳ מול ת׳), כי שׂ נשמעת כמו ס׳.' },
  { q: 'איך קלינאיות תקשורת משתמשות בזוגות מינימליים?', a: 'בטיפול בקשיים פונולוגיים — כשילד מחליף צליל אחד באחר באופן קבוע — הקלינאית בוחרת זוגות שמבדילים בדיוק בין שני הצלילים שהילד מערבב. בדרך כלל מתחילים בהקשבה (הילד מצביע על התמונה שהמבוגר אמר), וממשיכים להפקה: הילד אומר מילה, והמבוגר מגיב למה שנשמע בפועל. כשהילד מבקש "תוף" ומקבל תוף במקום קוף, הוא מגלה שההבדל בצליל משנה את המשמעות. זו גישה מוכרת שנחקרה הרבה, והקלינאית מתאימה אותה לכל ילד.' },
  { q: 'מה הם תהליכים פונולוגיים?', a: 'דפוסים של פישוט מילים שנפוצים אצל ילדים צעירים בזמן שהם רוכשים את מערכת הצלילים: קדמה ("תוף" במקום "קוף"), סתימה ("תוף" במקום "סוף"), השמטת עיצור סופי ("מי" במקום "מיץ"), צמצום צרור ("לידה" במקום "גלידה") ועוד. רובם נעלמים בהדרגה בשנות הגן, בקצב שונה מילד לילד. רק קלינאי/ת תקשורת יכולים להעריך אם דפוס מסוים מתאים לגיל של ילד מסוים.' },
  { q: 'מה זה תרגול הבחנה שמיעתית, ולמה מתחילים בו?', a: 'הבחנה שמיעתית היא היכולת לשמוע ששתי מילים קרובות שונות זו מזו. ילד שעדיין לא שומע את ההבדל בין "סיר" ל"שיר" יתקשה להפיק אותו, ולכן לעיתים קרובות מתחילים בהקשבה: המבוגר אומר מילה אחת מהזוג, והילד מצביע על התמונה. המשחק "איזו מילה שמעת?" כאן בנוי בדיוק כך.' },
  { q: 'הילד שלי אומר "תוף" במקום "קוף". האם זה אומר שיש בעיה?', a: 'לא בהכרח. החלפות כאלה נפוצות מאוד אצל ילדים צעירים והן חלק מההתפתחות הרגילה. אי אפשר לקבוע מתוך משחק או רשימת מילים אם דיבור של ילד תואם לגילו. אם יש לכם דאגה — למשל כשקשה להבין את הילד, כשהוא מתוסכל או כשההחלפות לא משתנות לאורך זמן — כדאי לפנות לקלינאי/ת תקשורת להערכה, וגם לבדוק שמיעה.' },
  { q: 'האם המשחק בודק את ההגייה של הילד?', a: 'לא. המשחק לא מקליט, לא שומר קול ולא נותן ציון הגייה. במשחק ההקשבה הילד רק בוחר תמונה, ובמצב "תגידו את זה" מי שמקשיב ומגיב הוא המבוגר שיושב ליד הילד. הכוכבים הם עידוד בלבד — אין ניקוד של טעויות.' },
  { q: 'איך מתרגלים בבית בלי שזה יהפוך לשיעור?', a: 'כמה דקות ביום, בזמן נינוח, כמשחק. עדיף לתרגל את הזוגות שהקלינאית בחרה. מדגימים בקול רגוע, משבחים על ההקשבה ועל הניסיון, ולא מבקשים "תגיד נכון". אם הילד מתעייף או מתוסכל — עוצרים וממשיכים בפעם אחרת.' },
  { q: 'למה ר׳ שנשמעת מהגרון לא נחשבת טעות?', a: 'כי ר׳ ענבלית, שנוצרת מאחור בפה, היא ההגייה הרגילה של ר׳ בעברית הישראלית, ור׳ מתגלגלת היא מבטא לגיטימי. זוגות כמו חור/חול או רוח/לוח מיועדים לילדים שמחליפים את ר׳ בצליל אחר (ל׳ או י׳), לא לשינוי מבטא.' },
  { q: 'אפשר להדפיס את הכרטיסים?', a: 'כן, בחינם ובלי הרשמה. בוחרים צלילים ולוחצים על "הדפסה": מקבלים כרטיסי זוגות לגזירה (8 זוגות בדף), דף מיון לשתי עמודות לכל צליל ומשחק לוח עם מסלול. אפשר להדפיס בצבע או בשחור־לבן. לכרטיסים בלי אמוג׳י יש עיגול ריק — מציירים בו יחד עם הילד, וזה כבר חלק מהתרגול.' },
]

const related = [
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
  { label: 'תרגול הצליל ס׳', href: '/speech/sounds/s' },
  { label: 'תרגול הצליל ש׳', href: '/speech/sounds/sh' },
  { label: 'תרגול הצליל ר׳', href: '/speech/sounds/r' },
  { label: 'תרגול הצליל ח׳', href: '/speech/sounds/ch' },
  { label: 'מחולל כרטיסיות היגוי', href: '/speech/card-maker' },
  { label: 'באיזה גיל רוכשים כל צליל', href: '/speech/parents/sound-acquisition' },
  { label: 'משחק צליל פותח וסוגר', href: '/letters/sounds' },
  { label: 'דפי חרוזים והברות', href: '/printables/rhymes-syllables' },
]

const Guide = ({ title, children }) => <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
  <h2 className="mb-3 text-2xl font-bold">{title}</h2>
  <div className="space-y-2 leading-relaxed text-[var(--foreground)]/85">{children}</div>
</section>
const Li = ({ children }) => <li className="mr-5 list-disc">{children}</li>

const PRINT_TYPES = [['cards', '✂️ כרטיסי זוגות'], ['sort', '↔️ דף מיון לשתי עמודות'], ['board', '🎲 משחק לוח']]

export default function MinimalPairs() {
  const [chosen, setChosen] = useState(['s-sh'])
  const [picturedOnly, setPicturedOnly] = useState(false)
  const [mode, setMode] = useState('listen')
  const [types, setTypes] = useState(['cards', 'sort', 'board'])
  const [color, setColor] = useState(true)
  const [printing, setPrinting] = useState(false)

  const pool = useMemo(() => PAIRS.filter(p => chosen.includes(p.contrast) && (!picturedOnly || p.pictured)), [chosen, picturedOnly])
  const poolKey = pool.map(p => p.id).join()
  const pages = useMemo(() => {
    if (!pool.length) return []
    const t = types.length ? types : ['cards']
    return [
      ...(t.includes('cards') ? cardPages(pool, color) : []),
      ...(t.includes('sort') ? sortPages(pool, color) : []),
      ...(t.includes('board') ? [boardPage(pool, color)] : []),
    ]
  }, [pool, types, color])

  const toggle = id => setChosen(list => list.includes(id) ? (list.length > 1 ? list.filter(x => x !== id) : list) : [...list, id])
  const toggleType = id => setTypes(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  const all = chosen.length === CONTRASTS.length
  const pictured = PAIRS.filter(p => p.pictured).length

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO path={PATH}
        title="זוגות מינימליים בעברית — משחק הבחנה שמיעתית ודפים להדפסה"
        description="זוגות מינימליים בעברית לפי תהליכים פונולוגיים: ס/ש, ק/ת, ר/ל, קוליות ועוד. משחק „איזו מילה שמעת?” לתרגול הבחנה שמיעתית, כרטיסים, דף מיון ומשחק לוח — חינם."
        structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'זוגות מינימליים' }]} />
      <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">👂 </span>זוגות מינימליים בעברית — משחק ודפים להדפסה</h1>
      <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">{PAIRS.length} זוגות לפי צליל ולפי תהליך פונולוגי · משחק הקשבה, תרגול "תגידו את זה" וכרטיסים להדפסה</p>

      <QuickAnswer q="מה הם זוגות מינימליים ואיך מתרגלים איתם?"
        a="זוגות מינימליים הם שתי מילים שנבדלות בצליל אחד בלבד — קוף/תוף, סיר/שיר, חור/חול. קלינאיות תקשורת משתמשות בהם כדי לעזור לילד לשמוע ולהפיק את ההבדל בין שני צלילים שהוא מחליף. כאן בוחרים צליל, משחקים ב„איזו מילה שמעת?”, מתרגלים אמירה עם מבוגר ומדפיסים כרטיסים, דף מיון ומשחק לוח."
        rows={[['תהליכים', 'קדמה, סתימה, ס/ש/צ, ר/ל, קוליות, השמטת עיצור סופי, השמטת הברה, צמצום צרור'], ['למי', 'קלינאיות תקשורת, הורים, גננות וצוותי חינוך מיוחד — בהנחיית קלינאית'], ['תמונות', `${pictured} זוגות עם תמונה לשתי המילים; בשאר יש מילה ומקום לציור`], ['מחיר', 'חינם, בלי הרשמה, בלי הקלטה']]}
        updated={UPDATED} />

      <SpeechNote />

      <section aria-labelledby="mp-pick" className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--postit)] p-4 shadow-sm">
        <h2 id="mp-pick" className="mb-3 text-center text-2xl font-bold">1. בוחרים צלילים</h2>
        <div className="space-y-3">
          {PROCESSES.map(pr => <div key={pr.id} className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="w-full text-center text-sm font-bold text-[var(--muted-foreground)] sm:w-40 sm:text-right">{pr.label}</span>
            {CONTRASTS.filter(c => c.process === pr.id).map(c => {
              const on = chosen.includes(c.id), n = PAIRS.filter(p => p.contrast === c.id).length
              return <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(c.id)}
                className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-violet-400 bg-white text-violet-900 shadow-sm' : 'border-transparent bg-white/60 text-slate-600'}`}>
                {c.label} <span className="text-xs font-normal">({n})</span></button>
            })}
          </div>)}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setChosen(all ? ['s-sh'] : CONTRASTS.map(c => c.id))} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold">{all ? 'חזרה לבחירה אחת' : `כל ${PAIRS.length} הזוגות`}</button>
          <button type="button" aria-pressed={picturedOnly} onClick={() => setPicturedOnly(v => !v)} className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${picturedOnly ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>🖼️ רק זוגות עם תמונה לשתי המילים</button>
        </div>
        <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">נבחרו {pool.length} זוגות. {chosen.length === 1 && processById[contrastById[chosen[0]].process].desc}</p>
      </section>

      <section aria-labelledby="mp-play" className="mb-8">
        <h2 id="mp-play" className="mb-3 text-center text-2xl font-bold">2. משחקים ומתרגלים</h2>
        <div className="mb-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="מצב תרגול">
          {[['listen', '🎧 איזו מילה שמעת?'], ['say', '🗣️ תגידו את זה']].map(([m, l]) => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={`min-h-[48px] rounded-xl border-2 px-5 font-bold ${mode === m ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
        </div>
        {!pool.length
          ? <p className="rounded-2xl border border-[var(--border)] bg-white p-6 text-center">אין בבחירה הזאת זוגות שיש בהם תמונה לשתי המילים. אפשר לבטל את הסינון „רק זוגות עם תמונה” או לבחור צליל נוסף.</p>
          : mode === 'listen' ? <ListenGame key={poolKey} pool={pool} /> : <SayIt key={poolKey} pool={pool} />}
      </section>

      <section aria-labelledby="mp-print" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <h2 id="mp-print" className="mb-2 text-center text-2xl font-bold">3. דפים להדפסה</h2>
        <p className="mb-4 text-center text-[var(--muted-foreground)]">לפי הצלילים שבחרתם למעלה ({pool.length} זוגות)</p>
        <div className="mb-3 flex flex-wrap justify-center gap-2" role="group" aria-label="מה להדפיס">
          {PRINT_TYPES.map(([id, l]) => <button key={id} type="button" aria-pressed={types.includes(id)} onClick={() => toggleType(id)}
            className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${types.includes(id) ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white text-slate-500'}`}>{l}</button>)}
        </div>
        <div className="mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="צבע">
          {[[true, '🎨 צבעוני'], [false, '⚫ שחור־לבן']].map(([v, l]) => <button key={l} type="button" aria-pressed={color === v} onClick={() => setColor(v)}
            className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${color === v ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
        </div>
        {pages.length > 0 && <>
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3" aria-label="תצוגה מקדימה">
            {pages.filter((p, i) => pages.findIndex(q => q.key.split('-')[0] === p.key.split('-')[0]) === i).map(p => <div key={p.key} className="border border-[var(--border)] bg-white p-1.5 shadow-sm">{p.svg}</div>)}
          </div>
          <div className="mt-5 text-center">
            <button type="button" data-print-main onClick={() => setPrinting(true)} className="min-h-[52px] rounded-xl bg-red-500 px-8 py-3 text-lg font-bold text-white">🖨️ הדפסה או PDF · {pages.length} {pages.length === 1 ? 'דף' : 'דפים'}</button>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">A4, עם קווי גזירה. כדאי להדביק על קרטון או לצפות בלמינציה.</p>
          </div>
        </>}
      </section>
      {printing && <PrintPreview title="זוגות מינימליים" onClose={() => setPrinting(false)}>{sheetsOf(pages)}</PrintPreview>}

      <div className="mx-auto max-w-3xl space-y-5">
        <Guide title="לקלינאיות תקשורת: איך להשתמש בעמוד בטיפול">
          <ul className="space-y-1.5">
            <Li>בוחרים את הניגוד שהילד מערבב (למשל ס/ש או ק/ת) — אפשר לבחור כמה ניגודים יחד. מספר הזוגות לכל ניגוד מופיע ליד שמו.</Li>
            <Li><b>הקשבה תחילה:</b> ב„איזו מילה שמעת?” המכשיר — או את, במצב „מבוגר אומר” — אומר מילה אחת מהזוג, והילד מצביע. במצב „מבוגר אומר” יש כפתור הצצה קטן שמראה רק לך איזו מילה להגיד.</Li>
            <Li><b>הפקה:</b> ב„תגידו את זה” הילד אומר מילה, ואת לוחצת על התמונה ששמעת בפועל. ההבדל בין מה שהילד התכוון למה ששמעת הוא הרגע הטיפולי.</Li>
            <Li>הדפים להדפסה מתאימים לשיעורי בית: כרטיסים למשחק זיכרון או „דג”, דף מיון לשתי עמודות (הבחנה ומודעות לצליל) ומשחק לוח לחזרות רבות.</Li>
            <Li>הרשימה כאן היא נקודת מוצא. כדאי לבחור זוגות לפי המילים שמוכרות לילד, ולהשמיט מילים שעלולות לבלבל אותו.</Li>
          </ul>
        </Guide>
        <Guide title="להורים: תרגול בבית, בהנחיית הקלינאית">
          <ul className="space-y-1.5">
            <Li>תרגלו את הזוגות שהקלינאית בחרה, כמה דקות ביום, כשכולם רגועים.</Li>
            <Li>במשחק ההקשבה אין „טעות”: כשהילד בוחר את התמונה השנייה, פשוט אומרים את המילה שוב ומקשיבים יחד.</Li>
            <Li>כשהילד אומר מילה בצורה אחרת, אל תבקשו „תגיד נכון”. חזרו על המילה בעצמכם, ברור ובחיוך („אה, קוף! הקוף אוכל בננה”).</Li>
            <Li>המשחק לא מקליט את הילד ולא נותן ציון. הכוכבים הם רק עידוד.</Li>
          </ul>
        </Guide>
      </div>

      <section aria-labelledby="mp-list" className="mx-auto mt-10 max-w-3xl">
        <h2 id="mp-list" className="mb-2 text-2xl font-bold">רשימת זוגות מינימליים בעברית לפי תהליך פונולוגי</h2>
        <p className="mb-4 leading-relaxed text-[var(--foreground)]/80">כל המילים נבחרו לפי ההגייה בעברית של היום: ט׳ נשמעת כמו ת׳, כּ׳ כמו ק׳, כ׳ רפה כמו ח׳, שׂ כמו ס׳, וא׳ וע׳ אינן נשמעות. לחיצה על מילה משמיעה אותה.</p>
        <div className="space-y-5">
          {PROCESSES.map(pr => <div key={pr.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <h3 className="text-xl font-bold">{pr.label}</h3>
            <p className="mb-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{pr.desc}</p>
            {CONTRASTS.filter(c => c.process === pr.id).map(c => <div key={c.id} className="mb-2">
              <p className="font-bold">{c.label}{c.note ? <span className="font-normal text-sm text-[var(--muted-foreground)]"> — {c.note}</span> : null}</p>
              <ul className="flex flex-wrap gap-2">
                {PAIRS.filter(p => p.contrast === c.id).map(p => <li key={p.id} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-slate-50 px-2 py-1">
                  {[p.a, p.b].map((x, k) => <span key={k} className="flex items-center">
                    {k === 1 && <span className="px-1 text-slate-400" aria-hidden="true">/</span>}
                    <button type="button" onClick={() => sayWord(x)} className="min-h-[36px] rounded-full px-2 font-bold hover:bg-[var(--postit)]" aria-label={`השמעה: ${x.w}`}>{x.e ? <span aria-hidden="true">{x.e} </span> : null}{x.w}</button>
                  </span>)}
                </li>)}
              </ul>
            </div>)}
          </div>)}
        </div>
      </section>

      <div className="mt-12">
        <SeoBody paragraphs={[
          'זוגות מינימליים הם אחד הכלים הוותיקים והמוכרים בקלינאות תקשורת. כשילד אומר "תוף" גם כשהוא רוצה קוף וגם כשהוא רוצה תוף, הוא מאבד הבחנה בין שתי מילים. התרגול עם זוגות מחזיר את ההבחנה הזאת: קודם הילד שומע שהמילים שונות, ואחר כך מגלה שכשהוא משנה צליל אחד — משתנה גם המשמעות.',
          'בעמוד הזה הזוגות מסודרים לפי התהליכים הפונולוגיים הנפוצים אצל ילדים דוברי עברית: קדמה והסגה (ק/ת, ג/ד), סתימה (ס/ת, ש/ת, צ/ת, ח/ק), החלפות בין ס, ש ו־צ, ר/ל, קוליות (ג/ק, ד/ת, ב/פ, ז/ס), השמטת עיצור סופי, השמטת הברה וצמצום צרור עיצורים. כל המילים הן מילים אמיתיות ושגורות, ורובן מוכרות לילדים בגיל הגן.',
          'זוגות מינימליים ס ש, כמו סיר/שיר, סער/שער וטוס/טוש, הם מהמבוקשים ביותר, כי ההחלפה בין ס׳ לש׳ נפוצה מאוד ונמשכת אצל חלק מהילדים גם אחרי הגן. גם לזוגות האלה כדאי להתחיל בהקשבה — תרגול הבחנה שמיעתית — ורק אחר כך לעבור לאמירה.',
        ]} faq={faq} related={related} />
      </div>
    </div>
  )
}
