import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { Sheet } from '../../components/printables/PrintableShell'
import { speak } from '../../utils/speak'
import SpeechNote from './SpeechNote'
import { SheetsPreview, TextBox, cardSheets } from './speechSheets'
import { CutLines, Guide, LanguageNav, Li, Pic, Pills, SheetHeader, SvgPic, Txt, rng } from './languageShared'
import {
  CATEGORIES, FLUENCY, OPPOSITES, SORT_PAIRS, categoryById, nameRound, oddRound, overlaps, shuffleWith, sortRound,
} from '../../data/speech/categories'

// /speech/language/categories — semantic categories and naming for preschool and first grade:
// "what doesn't belong", sorting into two groups, naming the group, "say 3 things that…" and
// opposites — interactive, with printables (sorting mat + cards, odd-one-out sheets, category bingo,
// prompt cards, opposites memory). No scoring: feedback is a gentle sentence, never a grade.

const PATH = '/speech/language/categories'
const UPDATED = '2026-10-24'
const say = (text, user = true) => speak(text.replace(/[„”]/g, ''), 'he-IL', { rate: 0.85, user })
const list3 = words => words.length > 1 ? `${words.slice(0, -1).join(', ')} ו${words[words.length - 1]}` : words[0]

// ── Interactive activities ───────────────────────────────────────────────────

function PicButton({ item, onClick, state, label, small = false }) {
  const ring = state === 'right' ? 'border-emerald-500 bg-emerald-50' : state === 'tried' ? 'border-slate-300 bg-slate-50 opacity-60' : state === 'picked' ? 'border-violet-500 bg-violet-50 ring-4 ring-violet-200' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'
  return <button type="button" onClick={onClick} aria-label={label || item.t}
    className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-2 shadow-sm transition ${small ? 'min-h-[104px]' : 'min-h-[132px]'} ${ring}`}>
    <Pic item={item} className={small ? 'text-5xl' : 'text-6xl sm:text-7xl'} size={small ? 48 : 64} />
    <span className={`font-bold ${small ? 'text-lg' : 'text-xl sm:text-2xl'}`}>{item.t}</span>
  </button>
}

function OddOneOut() {
  const [level, setLevel] = useState('easy')
  const [round, setRound] = useState(() => oddRound('easy'))
  const [tried, setTried] = useState([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const next = (lv = level) => { setRound(oddRound(lv)); setTried([]); setDone(false); setMsg('') }
  const others = round.items.filter((_, i) => i !== round.oddIndex).map(x => x.t)
  const odd = round.items[round.oddIndex]
  const choose = i => {
    if (done) return
    if (i === round.oddIndex) {
      const text = `נכון! ${list3(others)} — ${round.main.name}, ו${odd.t} — ${round.odd.one}.`
      setDone(true); setMsg(text); say(text)
    } else {
      const item = round.items[i]
      setTried(t => [...t, i])
      const text = `${item.t} — ${round.main.one}, כמו ${list3(others.filter(o => o !== item.t).slice(0, 2))}. מה שונה מכולם?`
      setMsg(text); say(text)
    }
  }
  return <div className="space-y-4">
    <Pills label="רמה" value={level} onChange={v => { setLevel(v); next(v) }} tone="soft"
      options={[['easy', '🙂 קל — קבוצות רחוקות'], ['hard', '🤔 מאתגר — קבוצות קרובות']]} />
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
      <h3 className="mb-1 text-2xl font-bold">מה לא שייך?</h3>
      <p className="mb-3 text-[var(--muted-foreground)]">שלושה דברים שייכים לאותה קבוצה, ואחד לא. על מה תצביעו?</p>
      <button type="button" onClick={() => say(round.items.map(x => x.t).join(', '))} className="mb-3 min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold">🔊 שמעו את השמות</button>
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        {round.items.map((item, i) => <PicButton key={item.t + i} item={item} onClick={() => choose(i)} label={`${item.t} — לא שייך?`}
          state={done && i === round.oddIndex ? 'right' : tried.includes(i) ? 'tried' : null} />)}
      </div>
      <p className="mx-auto mt-4 min-h-[3.5rem] max-w-xl text-lg font-bold" aria-live="polite">{msg}</p>
      {done && <p className="mx-auto mb-2 max-w-xl text-sm text-[var(--muted-foreground)]">ועכשיו בקול: „{odd.t} לא שייך, כי…” — אפשר גם תשובה אחרת, אם יש לה הסבר טוב.</p>}
      <button type="button" onClick={() => next()} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? 'לשאלה הבאה ←' : 'דילוג'}</button>
    </div>
  </div>
}

function SortBin({ cat, items, placed, picked, onDrop }) {
  return <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onDrop(Number(e.dataTransfer.getData('text/plain')), cat.id) }}
    className="flex min-h-[180px] flex-col rounded-2xl border-2 border-dashed border-slate-400 bg-[var(--postit)]/60 p-3">
    <button type="button" onClick={() => onDrop(picked, cat.id)} disabled={picked === null}
      className={`mb-2 flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 px-3 text-xl font-black ${picked !== null ? 'border-violet-500 bg-white shadow' : 'border-transparent bg-white/70'}`}>
      <span aria-hidden="true">{cat.e}</span>{cat.name}{picked !== null && <span className="hidden text-sm font-bold text-violet-700 sm:inline">← לכאן</span>}
    </button>
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item, i) => placed[i] === cat.id && <span key={i} className="flex items-center gap-1 rounded-full bg-white px-2 py-1 font-bold shadow-sm"><Pic item={item} className="text-2xl" size={24} />{item.t}</span>)}
    </div>
  </div>
}

function SortGame() {
  const [pair, setPair] = useState(SORT_PAIRS[0])
  const [round, setRound] = useState(() => sortRound(...SORT_PAIRS[0]))
  const [placed, setPlaced] = useState({})
  const [picked, setPicked] = useState(null)
  const [msg, setMsg] = useState('')
  const start = p => { setPair(p); setRound(sortRound(...p)); setPlaced({}); setPicked(null); setMsg('') }
  const left = round.items.filter((_, i) => placed[i] === undefined)
  const drop = (i, cat) => {
    if (i === null || i === undefined || placed[i] !== undefined) return
    const item = round.items[i]
    if (item.cat === cat) {
      const nextPlaced = { ...placed, [i]: cat }
      setPlaced(nextPlaced); setPicked(null)
      const finished = Object.keys(nextPlaced).length === round.items.length
      const text = finished ? 'כל הכבוד! כל הדברים בקבוצה הנכונה.' : `${item.t} — ${categoryById[cat].one}.`
      setMsg(text); say(text)
    } else {
      const text = `${item.t} — ${categoryById[item.cat].one}. אולי בקבוצה השנייה?`
      setMsg(text); say(text); setPicked(null)
    }
  }
  const randomPair = () => {
    const ids = CATEGORIES.map(c => c.id)
    let a, b
    do { [a, b] = shuffleWith(ids).slice(0, 2) } while (overlaps(a, b))
    start([a, b])
  }
  return <div className="space-y-4">
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="אילו קבוצות למיין">
      {SORT_PAIRS.map(p => <button key={p.join()} type="button" aria-pressed={pair.join() === p.join()} onClick={() => start(p)}
        className={`min-h-[44px] rounded-full border-2 px-3 text-sm font-bold ${pair.join() === p.join() ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}>
        {categoryById[p[0]].name} / {categoryById[p[1]].name}</button>)}
      <button type="button" onClick={randomPair} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-3 text-sm font-bold">🔀 זוג אחר</button>
    </div>
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
      <h3 className="mb-1 text-2xl font-bold">מיינו לקבוצות</h3>
      <p className="mb-3 text-[var(--muted-foreground)]">לוחצים על תמונה ואז על הקבוצה שלה (במחשב אפשר גם לגרור).</p>
      <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {round.items.map((item, i) => placed[i] === undefined
          ? <div key={i} draggable onDragStart={e => { e.dataTransfer.setData('text/plain', String(i)); setPicked(i) }}>
            <PicButton item={item} small onClick={() => { setPicked(picked === i ? null : i); say(item.t) }} state={picked === i ? 'picked' : null} label={`לבחור: ${item.t}`} />
          </div>
          : <div key={i} className="min-h-[104px] rounded-2xl border-2 border-dashed border-slate-200" aria-hidden="true" />)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[round.a, round.b].map(c => <SortBin key={c.id} cat={c} items={round.items} placed={placed} picked={picked} onDrop={drop} />)}
      </div>
      <p className="mt-4 min-h-[2rem] text-lg font-bold" aria-live="polite">{msg}</p>
      {!left.length && <button type="button" onClick={() => start(pair)} className="min-h-[48px] rounded-xl bg-emerald-600 px-6 font-bold text-white">עוד סיבוב ←</button>}
    </div>
  </div>
}

function NameTheGroup() {
  const [round, setRound] = useState(() => nameRound())
  const [tried, setTried] = useState([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const next = () => { setRound(nameRound(Math.random, round.cat.id)); setTried([]); setDone(false); setMsg('') }
  const choose = c => {
    if (done) return
    if (c.id === round.cat.id) {
      const text = `נכון! ${list3(round.items.map(x => x.t))} — כולם ${c.name}.`
      setDone(true); setMsg(text); say(text)
    } else {
      setTried(t => [...t, c.id])
      const text = `${list3(round.items.map(x => x.t))} — הם לא ${c.name}. ננסה שם אחר?`
      setMsg(text); say(text)
    }
  }
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
    <h3 className="mb-1 text-2xl font-bold">תנו שם לקבוצה</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">מה המשותף לכל הדברים? איך קוראים לכל הקבוצה ביחד?</p>
    <div className="mx-auto mb-4 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
      {round.items.map(item => <PicButton key={item.t} item={item} small onClick={() => say(item.t)} label={`השמעה: ${item.t}`} />)}
    </div>
    <div className="flex flex-wrap justify-center gap-2">
      {round.options.map(c => <button key={c.id} type="button" onClick={() => choose(c)}
        className={`min-h-[56px] rounded-2xl border-2 px-5 text-xl font-black ${done && c.id === round.cat.id ? 'border-emerald-500 bg-emerald-50' : tried.includes(c.id) ? 'border-slate-300 bg-slate-50 opacity-60' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'}`}>
        <span aria-hidden="true">{c.e} </span>{c.name}</button>)}
    </div>
    <p className="mx-auto mt-4 min-h-[2rem] max-w-xl text-lg font-bold" aria-live="polite">{msg}</p>
    {done && <p className="mx-auto mb-2 max-w-xl text-sm text-[var(--muted-foreground)]">ועכשיו: מה עוד שייך לקבוצה „{round.cat.name}”? (בלי לחץ — גם רמז מותר.)</p>}
    <button type="button" onClick={next} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? 'לקבוצה הבאה ←' : 'דילוג'}</button>
  </div>
}

function SayThree() {
  const [order, setOrder] = useState(() => shuffleWith(FLUENCY.map((_, i) => i)))
  const [i, setI] = useState(0)
  const [count, setCount] = useState(0)
  const [ideas, setIdeas] = useState(false)
  const card = FLUENCY[order[i % order.length]]
  const go = d => { setI(n => (n + d + order.length) % order.length); setCount(0); setIdeas(false) }
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
    <h3 className="mb-3 text-2xl font-bold">אמרו 3 דברים ש…</h3>
    <div className="mx-auto max-w-md rounded-3xl border-2 border-slate-800 bg-[var(--yellow)] p-5 shadow-[0_6px_0_rgba(20,30,60,.12)]">
      <div className="text-6xl" aria-hidden="true">{card.e}</div>
      <p className="mt-2 text-2xl font-black leading-snug">{card.t}</p>
      <button type="button" onClick={() => say(card.t)} className="mt-3 min-h-[44px] rounded-full border-2 border-slate-800 bg-white px-4 font-bold">🔊 הקראה</button>
    </div>
    <p className="mt-4 font-bold">על כל דבר שנאמר — צובעים עיגול:</p>
    <div className="mt-2 flex justify-center gap-3" role="group" aria-label="כמה דברים נאמרו">
      {[1, 2, 3].map(n => <button key={n} type="button" aria-pressed={count >= n} onClick={() => setCount(count === n ? n - 1 : n)} aria-label={`${n} דברים`}
        className={`h-14 w-14 rounded-full border-4 text-2xl font-black ${count >= n ? 'border-emerald-600 bg-emerald-400 text-white' : 'border-slate-300 bg-white text-slate-300'}`}>{n}</button>)}
    </div>
    <p className="mt-2 min-h-[1.75rem] font-bold text-emerald-700" aria-live="polite">{count === 3 ? 'שלושה! אפשר גם רביעי? 🎉' : ''}</p>
    <button type="button" onClick={() => setIdeas(v => !v)} aria-expanded={ideas} className="mt-1 min-h-[44px] rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 font-bold">{ideas ? 'הסתרת הרעיונות' : '💡 רעיונות למבוגר (אם נתקעים)'}</button>
    {ideas && <p className="mx-auto mt-2 max-w-md text-[var(--muted-foreground)]">{card.ideas.join(' · ')}</p>}
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={() => go(-1)} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">→ הקודם</button>
      <button type="button" onClick={() => { setOrder(shuffleWith(FLUENCY.map((_, k) => k))); setI(0); setCount(0); setIdeas(false) }} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">🔀 ערבוב</button>
      <button type="button" onClick={() => go(1)} className="min-h-[48px] rounded-xl bg-violet-600 px-6 font-bold text-white">הבא ←</button>
    </div>
  </div>
}

function Opposites() {
  const [open, setOpen] = useState({})
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
    <h3 className="mb-1 text-2xl font-bold">ניגודים</h3>
    <p className="mb-4 text-[var(--muted-foreground)]">אומרים את המילה, הילד/ה מנחש/ת את ההפך — ואז הופכים את הכרטיס.</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {OPPOSITES.map((p, i) => {
        const shown = open[i] ? p.b : p.a
        return <button key={p.a.t} type="button" onClick={() => { setOpen(o => ({ ...o, [i]: !o[i] })); say(open[i] ? p.a.t : `${p.a.t} — ${p.b.t}`) }}
          aria-label={open[i] ? `${p.b.t}, ההפך של ${p.a.t}` : `${p.a.t} — מה ההפך?`}
          className={`flex min-h-[132px] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 shadow-sm transition ${open[i] ? 'border-sky-500 bg-sky-50' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'}`}>
          <span className="text-5xl leading-none" aria-hidden="true">{shown.e}</span>
          <span className="text-2xl font-black">{shown.t}</span>
          <span className="text-xs text-[var(--muted-foreground)]">{open[i] ? `ההפך של ${p.a.t}` : 'מה ההפך? ↻'}</span>
        </button>
      })}
    </div>
    <p className="mt-4 text-sm">עוד הפכים ומילים נרדפות, עם משחק זיכרון: <Link to="/words/opposites" className="font-bold underline">הפכים לילדים</Link></p>
  </div>
}

// ── Printables ──────────────────────────────────────────────────────────────

function PicCard({ x, y, w, h, item, frame = true }) {
  const m = Math.min(w, h)
  return <g>
    {frame && <rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} rx={3} fill="#fff" stroke="#111" strokeWidth=".5" />}
    <SvgPic item={item} cx={x + w / 2} cy={y + h * 0.4} size={m * 0.46} />
    <TextBox x={x + 3} y={y + h * 0.68} w={w - 6} h={h * 0.26} text={item.t} max={m * 0.16} maxLines={2} />
  </g>
}

// Sorting mat: two big areas with category headers, and eight cards to cut at the bottom.
function sortMatSheet(aId, bId, seed) {
  const { a, b, items } = sortRound(aId, bId, 4, rng(seed))
  const cols = [[a, 102], [b, 6]]
  const cw = 47, ch = 44, cy0 = 172
  const cells = items.map((item, i) => ({ item, x: 6 + 188 - ((i % 4) + 1) * cw, y: cy0 + Math.floor(i / 4) * ch, w: cw, h: ch }))
  return {
    key: `sort-${aId}-${bId}`,
    svg: <Sheet label={`דף מיון: ${a.name} ו${b.name}`}>
      <SheetHeader title={`מיון לקבוצות: ${a.name} או ${b.name}?`} note="גוזרים את הכרטיסים שלמטה ומניחים כל כרטיס בקבוצה שלו — ואומרים בקול למה" />
      {cols.map(([c, x]) => <g key={c.id}>
        <rect x={x} y={21} width={92} height={142} rx={5} fill="#fff" stroke="#111" strokeWidth=".8" />
        <rect x={x} y={21} width={92} height={22} rx={5} fill="#f3f4f6" stroke="#111" strokeWidth=".8" />
        <SvgPic item={c} cx={x + 80} cy={32} size={12} />
        <Txt x={x + 40} y={35} size={7} weight={900}>{c.name}</Txt>
      </g>)}
      <Txt x={100} y={169} size={3.4} weight={700} fill="#374151">✂ כרטיסים לגזירה</Txt>
      <CutLines cells={cells} />
      {cells.map((c, i) => <PicCard key={i} {...c} frame={false} />)}
    </Sheet>,
  }
}

// "What doesn't belong" worksheets: 8 rows of 4 pictures per page, optional answer pages.
function oddSheets(level, seed, answers) {
  const rand = rng(seed)
  const pages = [0, 1].map(() => Array.from({ length: 8 }, () => oddRound(level, rand)))
  const bw = 40, bh = 23, rowH = 29.5, y0 = 22
  const page = (rows, p, key) => <Sheet label={key ? 'מה לא שייך — תשובות' : 'מה לא שייך — דף עבודה'}>
    <SheetHeader title={key ? `מה לא שייך? — תשובות (דף ${p + 1})` : 'מה לא שייך?'}
      note={key ? 'בעיגול: מה שלא שייך · מתחת: שם הקבוצה של השאר' : 'בכל שורה: מקיפים בעיגול את מה שלא שייך לקבוצה, ומספרים למה'} />
    {!key && <Txt x={195} y={21} size={3.6} anchor="start">שם: _______________</Txt>}
    {rows.map((r, ri) => {
      const y = y0 + 3 + ri * rowH
      return <g key={ri}>
        <circle cx={190} cy={y + bh / 2} r={4.2} fill="#f3f4f6" stroke="#111" strokeWidth=".4" />
        <Txt x={190} y={y + bh / 2 + 1.5} size={4.2} weight={800}>{ri + 1}</Txt>
        {r.items.map((item, i) => {
          const x = 180 - (i + 1) * (bw + 2.5)
          const hit = key && i === r.oddIndex
          return <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={3} fill="#fff" stroke={hit ? '#111' : '#9ca3af'} strokeWidth={hit ? 1.2 : 0.45} />
            {hit && <ellipse cx={x + bw / 2} cy={y + bh / 2} rx={bw / 2 + 1.5} ry={bh / 2 + 2} fill="none" stroke="#dc2626" strokeWidth="1" />}
            <SvgPic item={item} cx={x + 11} cy={y + bh / 2} size={13} />
            <TextBox x={x + 19} y={y + 2} w={bw - 21} h={bh - 4} text={item.t} max={4.4} maxLines={2} />
          </g>
        })}
        {key && <Txt x={100} y={y + bh + 4} size={3} fill="#374151">{`${r.items[r.oddIndex].t} — ${r.odd.one}; השאר — ${r.main.name}`}</Txt>}
      </g>
    })}
    {!key && <Txt x={100} y={266} size={3.2} fill="#4b5563">אין תשובה אחת „נכונה” בכל מחיר: אם יש הסבר הגיוני לבחירה אחרת — זו תשובה טובה.</Txt>}
  </Sheet>
  return [
    ...pages.map((rows, p) => ({ key: `odd-${p}`, svg: page(rows, p, false) })),
    ...(answers ? pages.map((rows, p) => ({ key: `odd-key-${p}`, svg: page(rows, p, true) })) : []),
  ]
}

// Category bingo: boards of category names; the caller draws an item card and the players look
// for the category it belongs to.
function bingoSheets(seed) {
  const rand = rng(seed)
  const boards = Array.from({ length: 6 }, () => shuffleWith(CATEGORIES, rand).slice(0, 9))
  const cell = 36, bw = cell * 3, x0 = 100 - bw / 2
  const board = (cats, y, n) => <g key={n}>
    <Txt x={x0 + bw} y={y + 8} size={5.2} weight={900} anchor="start">בינגו קטגוריות · לוח {n}</Txt>
    <Txt x={x0} y={y + 8} size={3.6} anchor="end" fill="#374151">שם: ______________</Txt>
    <rect x={x0} y={y + 14} width={bw} height={bw} fill="none" stroke="#111" strokeWidth=".9" />
    {cats.map((c, i) => {
      const x = x0 + bw - ((i % 3) + 1) * cell, cy = y + 14 + Math.floor(i / 3) * cell
      return <g key={c.id}>
        <rect x={x} y={cy} width={cell} height={cell} fill="none" stroke="#111" strokeWidth=".4" />
        <SvgPic item={c} cx={x + cell / 2} cy={cy + cell * 0.36} size={cell * 0.38} />
        <TextBox x={x + 2} y={cy + cell * 0.62} w={cell - 4} h={cell * 0.32} text={c.name} max={5} maxLines={2} />
      </g>
    })}
  </g>
  const boardPages = [0, 1, 2].map(p => ({
    key: `bingo-${p}`,
    svg: <Sheet label="בינגו קטגוריות — לוחות">
      {board(boards[p * 2], 6, p * 2 + 1)}
      {board(boards[p * 2 + 1], 136, p * 2 + 2)}
      <Txt x={100} y={262} size={3.2} fill="#4b5563">שולפים כרטיס ואומרים מה בתמונה. מי שיש לו בלוח את הקבוצה — אומר את שם הקבוצה ומכסה אותה.</Txt>
    </Sheet>,
  }))
  const calls = CATEGORIES.flatMap(c => shuffleWith(c.items.filter(x => x.e), rand).slice(0, 2))
  return [...boardPages, ...cardSheets(calls, { per: 20, title: 'בינגו קטגוריות — כרטיסי הקריאה', keyBase: 'bingo-calls', note: '✂ גוזרים, מערבבים ושולפים כרטיס בכל תור' })]
}

const PRINTS = [
  ['sort', '↔️ דף מיון + כרטיסים'],
  ['odd', '🔍 מה לא שייך — דפי עבודה'],
  ['bingo', '🎲 בינגו קטגוריות'],
  ['fluency', '💬 כרטיסי „אמרו 3 דברים ש…”'],
  ['opposites', '🔄 ניגודים — משחק זיכרון'],
]

function Printables() {
  const [type, setType] = useState('sort')
  const [pair, setPair] = useState(SORT_PAIRS[0])
  const [level, setLevel] = useState('easy')
  const [answers, setAnswers] = useState(true)
  const [seed, setSeed] = useState(7)
  const pages = useMemo(() => {
    if (type === 'sort') return [sortMatSheet(pair[0], pair[1], seed)]
    if (type === 'odd') return oddSheets(level, seed, answers)
    if (type === 'bingo') return bingoSheets(seed)
    if (type === 'fluency') return cardSheets(FLUENCY.map(f => ({ t: f.t, e: f.e })), { per: 12, title: 'אמרו 3 דברים ש…', keyBase: 'fluency', note: '✂ גוזרים ושולפים כרטיס · אפשר לשחק בתורות, ולתת רמז למי שנתקע' })
    return cardSheets(OPPOSITES.flatMap(p => [p.a, p.b]), { per: 12, title: 'ניגודים — משחק זיכרון', keyBase: 'opposites', note: '✂ גוזרים, הופכים ומחפשים זוג של הפכים: גדול—קטן, חם—קר…' })
  }, [type, pair, level, answers, seed])
  const title = PRINTS.find(p => p[0] === type)[1].replace(/^\S+\s/, '')
  return <section aria-labelledby="cat-print" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
    <h2 id="cat-print" className="mb-2 text-center text-2xl font-bold">🖨️ דפים להדפסה</h2>
    <p className="mb-4 text-center text-[var(--muted-foreground)]">A4, עם קווי גזירה. עובד גם בשחור־לבן.</p>
    <div className="mb-4"><Pills label="מה להדפיס" value={type} onChange={setType} options={PRINTS} tone="soft" /></div>
    {type === 'sort' && <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="קבוצות לדף המיון">
      {SORT_PAIRS.map(p => <button key={p.join()} type="button" aria-pressed={pair.join() === p.join()} onClick={() => setPair(p)}
        className={`min-h-[44px] rounded-full border-2 px-3 text-sm font-bold ${pair.join() === p.join() ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}>
        {categoryById[p[0]].name} / {categoryById[p[1]].name}</button>)}
    </div>}
    {type === 'odd' && <div className="mb-4 space-y-2">
      <Pills label="רמה" value={level} onChange={setLevel} tone="soft" options={[['easy', '🙂 קל'], ['hard', '🤔 מאתגר']]} />
      <Pills label="דף תשובות" value={answers} onChange={setAnswers} tone="soft" options={[[true, '✅ עם דף תשובות'], [false, 'בלי תשובות']]} />
    </div>}
    <SheetsPreview pages={pages} title={title} onRefresh={['sort', 'odd', 'bingo'].includes(type) ? () => setSeed(s => s + 1) : undefined} />
  </section>
}

// ── Page ─────────────────────────────────────────────────────────────────────

const ACTIVITIES = [
  ['odd', '🔍 מה לא שייך?'], ['sort', '↔️ מיינו לקבוצות'], ['name', '🏷️ תנו שם לקבוצה'], ['three', '💬 אמרו 3 דברים ש…'], ['opp', '🔄 ניגודים'],
]

const faq = [
  { q: 'למה חשוב לתרגל קטגוריות עם ילדים?', a: 'ארגון מילים בקבוצות עוזר לילדים לזכור מילים חדשות, למצוא אותן מהר כשהם מדברים ולהסביר את עצמם ("זה כמו… אבל…"). זו גם מיומנות חשיבה שנדרשת בגן ובכיתה א׳ — מיון, השוואה והכללה.' },
  { q: 'מאיזה גיל אפשר לשחק ב"מה לא שייך"?', a: 'ילדים רבים מתחילים למיין לפי קבוצות מוכרות (חיות, אוכל, בגדים) בגיל הגן, ובהדרגה מצליחים גם בקבוצות קרובות יותר ובהסבר במילים. יש שונות גדולה בין ילדים — מתחילים מהרמה הקלה ומתקדמים לפי הילד/ה, ולא לפי גיל.' },
  { q: 'מה עושים כשהילד בוחר תשובה אחרת?', a: 'שואלים "למה בחרת בזה?". לפעמים יש לילד הסבר הגיוני (למשל: "הבננה לא שייכת כי היא לא עגולה") — וזו חשיבה טובה. אפשר לומר: "נכון, היא לא עגולה! ויש עוד דרך למיין — לפי מה שהם", ולהדגים.' },
  { q: 'איך מתרגלים "אמרו 3 דברים ש…" בלי לחץ?', a: 'בלי שעון ובלי ציון. אם הילד נתקע, נותנים רמז ("משהו שאוכלים בבוקר, הוא לבן ויש לו קליפה…") או מציעים בחירה בין שתי מילים. בכל פעם שהילד אומר מילה — צובעים עיגול. המבוגר יכול גם לשחק בתורות ולהדגים.' },
  { q: 'האם הדפים מתאימים לחינוך המיוחד?', a: 'כן. אפשר להתחיל מבחירה בין שתי תמונות במקום ארבע, לעבוד עם הכרטיסים כחומר מוחשי (להניח בקופסה הנכונה), ולהשתמש בבינגו הקטגוריות כמשחק קבוצתי. אם הילד/ה משתמש/ת בתקשורת תומכת חליפית, אפשר להצביע במקום לומר.' },
  { q: 'העמוד בודק או נותן ציון לילד?', a: 'לא. אין ציון, אין שעון ואין הקלטה. המשוב הוא משפט קצר שמסביר למה הדבר שייך או לא שייך — כדי ללמוד, לא כדי למדוד. אם יש דאגה לגבי אוצר המילים או ההבנה, כדאי לפנות לקלינאי/ת תקשורת.' },
  { q: 'אפשר להדפיס בחינם?', a: 'כן, הכול חינם ובלי הרשמה: דף מיון עם כרטיסים לגזירה, דפי "מה לא שייך" עם דף תשובות, בינגו קטגוריות עם כרטיסי קריאה, כרטיסי "אמרו 3 דברים ש…" ומשחק זיכרון של ניגודים.' },
]

const related = [
  { label: 'שפה — כל העמודים', href: '/speech/language' },
  { label: 'שאלות מי, מה, איפה, מתי, למה', href: '/speech/language/wh-questions' },
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
  { label: 'התפתחות שפה לפי גיל', href: '/speech/parents/language-milestones' },
  { label: 'הפכים לילדים', href: '/words/opposites' },
  { label: 'דפי עבודה לגן חובה', href: '/printables/kindergarten-worksheets' },
  { label: 'משחקים לגן', href: '/games/kindergarten' },
]

export default function LanguageCategories() {
  const [act, setAct] = useState('odd')
  const words = CATEGORIES.reduce((n, c) => n + c.items.length, 0)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="קטגוריות לילדים: מה לא שייך, מיון ודפי עבודה לגן"
      description="תרגול שפה לגן ולכיתה א׳: קטגוריות ושיום — „מה לא שייך?”, מיון לקבוצות, תנו שם לקבוצה, „אמרו 3 דברים ש…” וניגודים. דפי עבודה להדפסה ובינגו קטגוריות, חינם."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה', href: '/speech/language' }, { label: 'קטגוריות ושיום' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">🧺 </span>קטגוריות ושיום: תרגול שפה לגן ולכיתה א׳</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">{CATEGORIES.length} קטגוריות, {words} מילים עם תמונה ושמע · משחקים לצפייה ביחד ודפים להדפסה</p>
    <QuickAnswer q="איך מתרגלים קטגוריות עם ילדים בגן?"
      a="משחקים במיון: „מה לא שייך?” (שלושה דברים מאותה קבוצה ואחד שונה), מיון כרטיסים לשתי קבוצות, מתן שם לקבוצה ו„אמרו 3 דברים ש…”. הכי חשוב לבקש מהילד להסביר למה — שם נבנית השפה. כאן יש את כל המשחקים עם תמונות ושמע, ודפי עבודה להדפסה."
      rows={[['קטגוריות', CATEGORIES.map(c => c.name).join(', ')], ['גיל', 'גן (בערך 3–6) וכיתה א׳, וגם חינוך מיוחד'], ['להדפסה', 'דף מיון, מה לא שייך + תשובות, בינגו קטגוריות, כרטיסי שיום, ניגודים'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated={UPDATED} />
    <SpeechNote />
    <LanguageNav current="categories" />

    <section aria-labelledby="cat-play" className="mb-10">
      <h2 id="cat-play" className="mb-3 text-center text-2xl font-bold">משחקים ביחד</h2>
      <div className="mb-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="פעילות">
        {ACTIVITIES.map(([id, l]) => <button key={id} type="button" role="tab" aria-selected={act === id} onClick={() => setAct(id)}
          className={`min-h-[48px] rounded-xl border-2 px-4 font-bold ${act === id ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
      </div>
      {act === 'odd' && <OddOneOut />}
      {act === 'sort' && <SortGame />}
      {act === 'name' && <NameTheGroup />}
      {act === 'three' && <SayThree />}
      {act === 'opp' && <Opposites />}
      <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">אין ציון ואין שעון. המשוב מסביר — והמבוגר שליד הילד/ה מוסיף, שואל „למה?” ומרחיב.</p>
    </section>

    <Printables />

    <div className="mx-auto max-w-3xl space-y-5">
      <Guide title="לקלינאיות ולגננות: איך לעבוד עם קטגוריות">
        <ul className="space-y-1.5">
          <Li><b>מתחילים מוחשי:</b> מיון חפצים אמיתיים או כרטיסים לשתי קופסאות, ורק אחר כך דפי עבודה ומשחק על המסך.</Li>
          <Li><b>מרחוק לקרוב:</b> קודם קבוצות רחוקות (חיות / כלי תחבורה), אחר כך קרובות (פירות / ירקות, צעצועים / חפצים בגן) — ברמה „מאתגר”.</Li>
          <Li><b>מבקשים הסבר:</b> „למה זה לא שייך?” חשוב יותר מהבחירה עצמה. מקבלים כל הסבר הגיוני, ומדגימים עוד דרך.</Li>
          <Li><b>מתכונות לשם:</b> לכל מילה אפשר לשאול: לאיזו קבוצה היא שייכת? מה עושים איתה? איפה מוצאים אותה? איך היא נראית? ממה היא עשויה? — כך הילד/ה בונה רשת של משמעות סביב המילה.</Li>
          <Li><b>שיום ושליפה:</b> „אמרו 3 דברים ש…” מתרגל מציאת מילים מהזיכרון. כשילד/ה נתקע/ת — רמז של צליל ראשון („זה מתחיל ב־ב…”) או של תכונה.</Li>
          <Li><b>בינגו קטגוריות</b> מתאים לקבוצה: הקורא אומר מה בתמונה, והילדים צריכים לחשוב לאיזו קבוצה זה שייך — גם הקשבה וגם הכללה.</Li>
        </ul>
      </Guide>
      <Guide title="להורים: משחקי קטגוריות בבית, בלי דפים">
        <ul className="space-y-1.5">
          <Li>בזמן סידור הכביסה: „בואו נשים את כל הגרביים כאן, ואת כל החולצות שם”.</Li>
          <Li>בסופר: „איזה פירות קנינו? ואיזה ירקות?” — ובבית מסדרים יחד במקרר.</Li>
          <Li>בנסיעה: בתורות, כל אחד אומר חיה (או אוכל, או משהו צהוב) — ומי שנתקע מקבל רמז.</Li>
          <Li>כשהילד/ה אומר/ת תשובה קצרה, מרחיבים בטבעיות: „כן, כלב! כלב הוא חיה. גם חתול הוא חיה”.</Li>
          <Li>חמש דקות של משחק עדיפות על חצי שעה של „תרגול”. עוצרים כשזה עוד כיף.</Li>
        </ul>
      </Guide>
    </div>

    <section aria-labelledby="cat-list" className="mx-auto mt-10 max-w-3xl">
      <h2 id="cat-list" className="mb-2 text-2xl font-bold">רשימת קטגוריות לילדים — מילים עם תמונה</h2>
      <p className="mb-4 leading-relaxed text-[var(--foreground)]/80">לחיצה על מילה משמיעה אותה. אפשר להשתמש ברשימות לתכנון פעילות, למשחק „מה בקופסה?” או לבחירת מילים לתרגול.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map(c => <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-lg font-bold"><span aria-hidden="true">{c.e} </span>{c.name}</h3>
          <ul className="flex flex-wrap gap-1.5">
            {c.items.map(item => <li key={item.t}><button type="button" onClick={() => say(item.t)} aria-label={`השמעה: ${item.t}`}
              className="flex min-h-[36px] items-center gap-1 rounded-full border border-[var(--border)] bg-slate-50 px-2 font-bold hover:bg-[var(--postit)]">
              <Pic item={item} className="text-lg" size={18} />{item.t}</button></li>)}
          </ul>
        </div>)}
      </div>
    </section>

    <div className="mt-12">
      <SeoBody paragraphs={[
        'קטגוריות הן אחת מאבני הבסיס של השפה. כשילד יודע שכלב, פרה ואריה הם „חיות”, הוא יכול להבין משפטים כמו „בואו נצייר חיות”, ללמוד מילה חדשה מהר יותר („זברה? זו חיה שנראית כמו סוס עם פסים”), ולמצוא את המילה שהוא מחפש כשהוא מספר משהו.',
        'בגן ובכיתה א׳ משחקי מיון ו„מה לא שייך” הם חלק קבוע מהיום: בסידור הפינות, בפעילות בבוקר ובדפי עבודה. קלינאיות תקשורת משתמשות בהם בעבודה על אוצר מילים, הבנה, שיום וחשיבה מילולית. כאן ריכזנו גרסה מסודרת עם תמונות ושמע, ברמות קושי שונות, ודפים להדפסה שאפשר לגזור ולשחק בהם שוב ושוב.',
        'כל המשחקים נבנו לשימוש ביחד — מבוגר וילד, או קבוצה קטנה בגן. אין בהם תחרות או ציון: המטרה היא לדבר, להסביר ולהרחיב.',
      ]} faq={faq} related={related} />
    </div>
  </div>
}
