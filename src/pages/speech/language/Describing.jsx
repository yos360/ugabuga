import { useMemo, useState } from 'react'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import { Sheet } from '../../../components/printables/PrintableShell'
import { speak, speakAndWait, stopSpeaking } from '../../../utils/speak'
import SpeechNote from '../SpeechNote'
import { SheetsPreview, TextBox, cardSheets } from '../speechSheets'
import { CutLines, EMOJI, FONT, Guide, LanguageNav, Li, Pic, Pills, SheetHeader, SvgPic, Txt, rng } from '../languageShared'
import {
  CATS, DIMS, ITEMS, PAIRS, YES_NO, builderOptions, describe, dimById, emptyNote, itemByT, riddleRound, sameFacts, sentence, shuffleWith, value,
} from '../../../data/speech/describing'

// /speech/language/describing — describing objects and vocabulary depth: our own seven-point
// "describing star" (group, look, material, parts, place, use, something more), "who am I?" riddles
// read clue by clue, building a description point by point, "what's the same / what's different",
// and printables (star mat, riddle cards, word map, guess-who board). No scoring anywhere.

const PATH = '/speech/language/describing'
const UPDATED = '2026-10-24'
const say = (text, user = true) => speak(text.replace(/[„”]/g, ''), 'he-IL', { rate: 0.85, user })

// ── The describing star (on screen) ────────────────────────────────────────

const N = DIMS.length
const polar = (cx, cy, r, i) => {
  const a = (-90 + (i * 360) / N) * Math.PI / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}
const starPath = (cx, cy, R, r) => Array.from({ length: N * 2 }, (_, k) => {
  const a = (-90 + (k * 180) / N) * Math.PI / 180, rad = k % 2 ? r : R
  return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`
}).join(' ')

// Star point labels in two short lines, so they fit inside the circles.
const LINES = { group: ['קבוצה'], look: ['צבע, צורה', 'וגודל'], mat: ['ממה', 'עשוי'], parts: ['חלקים'], place: ['איפה', 'מוצאים'], use: ['מה עושים', 'איתו'], more: ['עוד', 'משהו'] }

function StarSvg({ item, active, filled = [], onDim, onCenter }) {
  return <svg viewBox="0 0 260 260" className="mx-auto block w-full max-w-[380px]" role="group" aria-label="כוכב התיאור">
    <polygon points={starPath(130, 130, 118, 60)} fill="#fef3c7" stroke="#334155" strokeWidth="1.6" strokeLinejoin="round" />
    {DIMS.map((d, i) => {
      const [x, y] = polar(130, 130, 98, i)
      const on = active === d.id, done = filled.includes(d.id)
      return <g key={d.id} role="button" tabIndex={0} aria-label={`${d.name}: ${d.q}`} style={{ cursor: 'pointer' }}
        onClick={() => onDim?.(d.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDim?.(d.id) } }}>
        <circle cx={x} cy={y} r={25} fill={done ? '#d1fae5' : on ? '#ede9fe' : '#fff'} stroke={on ? '#7c3aed' : done ? '#059669' : '#334155'} strokeWidth={on || done ? 2.4 : 1.4} />
        <text x={x} y={y - 9} textAnchor="middle" dominantBaseline="central" fontSize="14" fontFamily={EMOJI}>{d.e}</text>
        <text textAnchor="middle" fontSize="7.2" fontWeight="800" fill="#111" direction="rtl" fontFamily={FONT}>
          {LINES[d.id].map((l, k) => <tspan key={k} x={x} y={y + 6 + k * 8 - (LINES[d.id].length - 1) * 2}>{l}</tspan>)}
        </text>
      </g>
    })}
    <g role="button" tabIndex={0} aria-label={item ? `תיאור מלא: ${item.t}` : 'כוכב התיאור'} style={{ cursor: 'pointer' }}
      onClick={() => onCenter?.()} onKeyDown={e => { if (e.key === 'Enter') onCenter?.() }}>
      <circle cx={130} cy={130} r={34} fill="#fff" stroke="#334155" strokeWidth="1.6" />
      {item
        ? <><text x={130} y={122} textAnchor="middle" dominantBaseline="central" fontSize="30" fontFamily={EMOJI}>{item.e}</text>
          <text x={130} y={152} textAnchor="middle" fontSize="10" fontWeight="900" direction="rtl" fontFamily={FONT}>{item.t}</text></>
        : <><text x={130} y={124} textAnchor="middle" dominantBaseline="central" fontSize="24" fontFamily={EMOJI}>⭐</text>
          <text x={130} y={150} textAnchor="middle" fontSize="8.5" fontWeight="900" direction="rtl" fontFamily={FONT}>מה זה?</text></>}
    </g>
  </svg>
}

// Small picture buttons to choose an item.
function ItemPicker({ value: cur, onPick, label = 'בחירת חפץ' }) {
  return <div role="group" aria-label={label} className="grid grid-cols-7 gap-1.5 sm:grid-cols-[repeat(18,minmax(0,1fr))]">
    {ITEMS.map(it => <button key={it.t} type="button" onClick={() => onPick(it)} aria-pressed={cur?.t === it.t} aria-label={it.t} title={it.t}
      className={`flex aspect-square min-h-[40px] items-center justify-center rounded-xl border-2 text-2xl ${cur?.t === it.t ? 'border-violet-500 bg-violet-50' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'}`}>
      <span aria-hidden="true">{it.e}</span></button>)}
  </div>
}

async function readAll(texts) {
  stopSpeaking()
  for (const t of texts) if (!(await speakAndWait(t.replace(/[„”]/g, ''), 'he-IL', { rate: 0.85 }))) break
}

function StarExplorer() {
  const [item, setItem] = useState(() => itemByT['תפוח'])
  const [active, setActive] = useState(null)
  const onDim = d => {
    setActive(d)
    const s = item && sentence(item, d)
    say(s ? `${dimById[d].q} ${s}` : `${dimById[d].q} ${item ? emptyNote(item, d) : ''}`)
  }
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
    <h3 className="mb-1 text-center text-2xl font-bold">כוכב התיאור</h3>
    <p className="mb-3 text-center text-[var(--muted-foreground)]">לכל דבר אפשר לספר שבעה דברים. לוחצים על פינה בכוכב — ושומעים את השאלה ואת התשובה.</p>
    <div className="mb-4"><ItemPicker value={item} onPick={it => { setItem(it); setActive(null); say(it.t) }} /></div>
    <div className="grid items-start gap-4 md:grid-cols-2">
      <StarSvg item={item} active={active} onDim={onDim} onCenter={() => readAll(describe(item))} />
      <ul className="space-y-1.5">
        {DIMS.map(d => {
          const s = sentence(item, d.id)
          return <li key={d.id}>
            <button type="button" onClick={() => onDim(d.id)} className={`flex w-full items-start gap-2 rounded-xl border-2 p-2 text-right ${active === d.id ? 'border-violet-500 bg-violet-50' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/40'}`}>
              <span aria-hidden="true" className="text-xl">{d.e}</span>
              <span><b>{d.name}:</b> {s || <span className="text-[var(--muted-foreground)]">{emptyNote(item, d.id)}</span>}</span>
            </button>
          </li>
        })}
      </ul>
    </div>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={() => readAll(describe(item))} className="min-h-[48px] rounded-xl bg-violet-600 px-5 font-bold text-white">🔊 כל התיאור</button>
      <button type="button" onClick={() => readAll(DIMS.map(d => d.q))} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">🔊 רק השאלות</button>
    </div>
    <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--muted-foreground)]">כדאי שהילד/ה יענה/תענה קודם בעצמו/ה, ורק אחר כך לשמוע את התשובה שלנו. יש גם תשובות נכונות אחרות!</p>
  </div>
}

// ── "Who am I?" ─────────────────────────────────────────────────────────────

function Riddles() {
  const [round, setRound] = useState(() => riddleRound())
  const [shown, setShown] = useState(0)
  const [tried, setTried] = useState([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const { item, choices } = round
  const next = () => { stopSpeaking(); setRound(riddleRound(Math.random, item.t)); setShown(0); setTried([]); setDone(false); setMsg('') }
  const clue = () => {
    if (shown >= item.r.length) { readAll(item.r); return }
    say(item.r[shown]); setShown(shown + 1)
  }
  const guess = it => {
    if (done) return
    if (it === item) {
      const text = `נכון! אני ${item.t}.`
      setDone(true); setShown(item.r.length); setMsg(text); say(text)
    } else {
      setTried(t => [...t, it.t])
      const text = shown < item.r.length ? `${it.t}? לא הפעם. רוצים עוד רמז?` : `${it.t}? לא הפעם. נקשיב שוב לרמזים?`
      setMsg(text); say(text)
    }
  }
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
    <h3 className="mb-1 text-2xl font-bold">מי אני?</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">שומעים רמז ועוד רמז. אפשר לנחש בכל רגע — ואפשר גם לחכות לרמז הבא.</p>
    <div className="mx-auto mb-3 max-w-xl rounded-2xl border-2 border-slate-800 bg-[var(--yellow)] p-4 text-right shadow-[0_6px_0_rgba(20,30,60,.12)]">
      {shown === 0 && !done
        ? <p className="text-center text-lg font-bold">לחצו על „רמז ראשון” ותקשיבו טוב ❓</p>
        : <ol className="space-y-1 text-lg font-bold">
          {item.r.slice(0, shown).map((c, i) => <li key={i} className="flex gap-2"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm">{i + 1}</span><span>{c}</span></li>)}
        </ol>}
    </div>
    {!done && <button type="button" onClick={clue} className="mb-4 min-h-[48px] rounded-xl bg-violet-600 px-6 font-bold text-white">
      {shown === 0 ? '🔊 רמז ראשון' : shown < item.r.length ? `🔊 רמז הבא (${shown + 1} מתוך ${item.r.length})` : '🔁 לשמוע שוב את כל הרמזים'}</button>}
    <div className="mx-auto grid max-w-xl grid-cols-3 gap-3">
      {choices.map(it => {
        const st = done && it === item ? 'border-emerald-500 bg-emerald-50' : tried.includes(it.t) ? 'border-slate-300 bg-slate-50 opacity-50' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'
        return <button key={it.t} type="button" onClick={() => guess(it)} aria-label={`האם זה ${it.t}?`}
          className={`flex min-h-[112px] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 shadow-sm ${st}`}>
          <Pic item={it} className="text-5xl sm:text-6xl" /><span className="text-lg font-bold">{it.t}</span></button>
      })}
    </div>
    <p className="mx-auto mt-4 min-h-[2rem] max-w-xl text-lg font-bold" aria-live="polite">{msg}</p>
    {done && <p className="mx-auto mb-2 max-w-xl text-sm text-[var(--muted-foreground)]">ועכשיו מחליפים תפקידים: הילד/ה בוחר/ת חפץ ונותן/ת רמזים — „אני…, יש לי…, מוצאים אותי…”.</p>}
    <button type="button" onClick={next} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? 'לחידה הבאה ←' : 'חידה אחרת'}</button>
  </div>
}

// ── Build a description ────────────────────────────────────────────────────

function Builder() {
  const [item, setItem] = useState(() => shuffleWith(ITEMS)[0])
  const [step, setStep] = useState(0)
  const [got, setGot] = useState([])
  const [tried, setTried] = useState([])
  const [msg, setMsg] = useState('')
  const [seed, setSeed] = useState(1)
  const dim = DIMS[step]
  const opts = useMemo(() => dim ? builderOptions(item, dim.id, rng(seed * 31 + step)) : null, [item, dim, seed, step])
  const start = it => { stopSpeaking(); setItem(it); setStep(0); setGot([]); setTried([]); setMsg(''); setSeed(s => s + 1) }
  const advance = () => { setStep(s => s + 1); setTried([]); setMsg('') }
  const pick = o => {
    if (o.owner === item) {
      const s = sentence(item, dim.id)
      setGot(g => [...g, dim.id]); say(s); advance()
    } else {
      setTried(t => [...t, o.label])
      const text = `„${o.label}” — זה מתאים יותר ל${o.owner.t}. מה מתאים ל${item.t}?`
      setMsg(text); say(text)
    }
  }
  const finished = step >= DIMS.length
  const sentences = describe(item, DIMS.map(d => d.id).filter(d => got.includes(d)))
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
    <h3 className="mb-1 text-center text-2xl font-bold">בונים תיאור</h3>
    <p className="mb-3 text-center text-[var(--muted-foreground)]">עוברים פינה אחרי פינה בכוכב, ובוחרים מה מתאים. בסוף — שומעים את כל התיאור.</p>
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => start(shuffleWith(ITEMS.filter(i => i !== item))[0])} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold">🔀 חפץ אחר</button>
      <details className="text-sm"><summary className="min-h-[44px] cursor-pointer rounded-full border-2 border-[var(--border)] bg-white px-4 py-2.5 font-bold">בחירה מהרשימה</summary>
        <div className="mt-2 w-[min(90vw,40rem)]"><ItemPicker value={item} onPick={start} /></div></details>
    </div>
    <div className="grid items-start gap-4 md:grid-cols-2">
      <StarSvg item={item} active={dim?.id} filled={got} onDim={d => say(dimById[d].q)} onCenter={() => say(item.t)} />
      <div>
        {!finished && <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-3 text-center">
          <p className="text-sm font-bold text-violet-800">פינה {step + 1} מתוך {DIMS.length}</p>
          <p className="mb-2 text-xl font-black"><span aria-hidden="true">{dim.e} </span>{item.t}: {dim.q}</p>
          <button type="button" onClick={() => say(dim.q)} className="mb-3 min-h-[40px] rounded-full border-2 border-[var(--border)] bg-white px-3 text-sm font-bold">🔊 השאלה</button>
          {opts
            ? <div className="grid gap-2">{opts.map(o => <button key={o.label} type="button" onClick={() => pick(o)} disabled={tried.includes(o.label)}
              className={`min-h-[52px] rounded-xl border-2 px-3 text-lg font-bold ${tried.includes(o.label) ? 'border-slate-200 bg-slate-50 opacity-50' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/60'}`}>{o.label}</button>)}</div>
            : <p className="rounded-xl bg-white p-3">{emptyNote(item, dim.id)}</p>}
          <p className="mt-2 min-h-[1.75rem] font-bold" aria-live="polite">{msg}</p>
          <button type="button" onClick={advance} className={`min-h-[44px] rounded-xl px-5 font-bold ${opts ? 'border-2 border-[var(--border)] bg-white text-sm' : 'bg-violet-600 text-white'}`}>{opts ? 'דילוג' : 'לפינה הבאה ←'}</button>
        </div>}
        <div className={`mt-3 rounded-2xl border border-dashed border-slate-400 p-3 ${finished ? 'bg-emerald-50' : 'bg-[var(--postit)]/50'}`}>
          <p className="mb-1 font-bold">התיאור שלנו:</p>
          <p className="min-h-[3rem] text-lg leading-relaxed" aria-live="polite">{sentences.length ? sentences.join(' ') : '…'}</p>
          {finished && <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => readAll(sentences.length ? sentences : [item.t])} className="min-h-[48px] rounded-xl bg-emerald-600 px-5 font-bold text-white">🔊 הקראת התיאור</button>
            <button type="button" onClick={() => start(shuffleWith(ITEMS.filter(i => i !== item))[0])} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">עוד חפץ ←</button>
          </div>}
          {finished && <p className="mt-2 text-sm text-[var(--muted-foreground)]">ועכשיו בלי לקרוא: הילד/ה מתאר/ת את ה{item.t} במילים שלו/ה — מספיקות שתיים־שלוש פינות.</p>}
        </div>
      </div>
    </div>
  </div>
}

// ── Same and different ─────────────────────────────────────────────────────

function Compare() {
  const [i, setI] = useState(0)
  const [same, setSame] = useState(0)
  const [diff, setDiff] = useState(0)
  const p = PAIRS[i], a = itemByT[p.a], b = itemByT[p.b]
  const go = n => { stopSpeaking(); setI((n + PAIRS.length) % PAIRS.length); setSame(0); setDiff(0) }
  const reveal = (list, n, set) => { if (n < list.length) { say(list[n]); set(n + 1) } else readAll(list) }
  const col = (title, list, n, set, tone) => <div className={`rounded-2xl border-2 p-3 ${tone}`}>
    <h4 className="mb-2 text-xl font-black">{title}</h4>
    <ul className="mb-2 min-h-[4rem] space-y-1 text-right text-lg">{list.slice(0, n).map(t => <li key={t} className="mr-5 list-disc">{t}</li>)}</ul>
    <button type="button" onClick={() => reveal(list, n, set)} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold">
      {n === 0 ? '💡 רעיון ראשון' : n < list.length ? '💡 עוד רעיון' : '🔊 שוב'}</button>
  </div>
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
    <h3 className="mb-1 text-2xl font-bold">מה דומה, מה שונה?</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">קודם הילד/ה מנסה לבד — ורק אחר כך פותחים רעיונות. כל השוואה הגיונית מתקבלת.</p>
    <div className="mx-auto mb-4 flex max-w-md items-center justify-center gap-3">
      {[a, b].map((it, k) => <button key={it.t} type="button" onClick={() => say(it.t)} aria-label={`השמעה: ${it.t}`}
        className={`flex min-h-[132px] flex-1 flex-col items-center justify-center rounded-2xl border-2 p-2 ${k ? 'border-sky-300 bg-sky-50' : 'border-amber-300 bg-amber-50'}`}>
        <Pic item={it} className="text-6xl sm:text-7xl" /><span className="text-2xl font-black">{it.t}</span></button>)}
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {col('🤝 מה דומה?', p.same, same, setSame, 'border-emerald-200 bg-emerald-50/50')}
      {col('↔️ מה שונה?', p.diff, diff, setDiff, 'border-violet-200 bg-violet-50/50')}
    </div>
    <details className="mx-auto mt-4 max-w-2xl text-right">
      <summary className="cursor-pointer text-center font-bold">⭐ השוואה לפי כוכב התיאור</summary>
      <div className="mt-2 overflow-x-auto"><table className="w-full border-collapse text-sm sm:text-base">
        <thead><tr className="bg-slate-50"><th className="border p-1.5" /><th className="border p-1.5">{a.e} {a.t}</th><th className="border p-1.5">{b.e} {b.t}</th></tr></thead>
        <tbody>{DIMS.map(d => <tr key={d.id}><th className="border p-1.5 text-right">{d.e} {d.name}</th><td className="border p-1.5">{value(a, d.id) || '—'}</td><td className="border p-1.5">{value(b, d.id) || '—'}</td></tr>)}</tbody>
      </table></div>
      {sameFacts(a, b).length > 0 && <p className="mt-2 text-sm">ומהטבלה: {sameFacts(a, b).join(' ')}</p>}
    </details>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={() => go(i - 1)} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">→ הקודם</button>
      <button type="button" onClick={() => go(i + 1)} className="min-h-[48px] rounded-xl bg-violet-600 px-6 font-bold text-white">הזוג הבא ←</button>
    </div>
  </div>
}

// ── Printables ─────────────────────────────────────────────────────────────

const ROWS = (x0, x1, y, n, gap) => Array.from({ length: n }, (_, k) => <line key={k} x1={x0} x2={x1} y1={y + k * gap} y2={y + k * gap} stroke="#9ca3af" strokeWidth=".35" />)

// The describing star mat: the star, each point with icon, name and question, the picture in the
// middle (or a frame to draw in), and lines to write or dictate the description.
function starMatSheet(item) {
  const cx = 100, cy = 113
  return {
    key: `star-${item?.t || 'blank'}`,
    svg: <Sheet label="כוכב התיאור — לוח עבודה">
      <SheetHeader title={item ? `כוכב התיאור: ${item.t}` : 'כוכב התיאור'} note="מצביעים על פינה, שואלים את השאלה ועונים יחד · אפשר להניח חפץ אמיתי או כרטיס באמצע" />
      <polygon points={starPath(cx, cy, 90, 46)} fill="#fffbeb" stroke="#111" strokeWidth=".7" strokeLinejoin="round" />
      {DIMS.map((d, i) => {
        const [x, y] = polar(cx, cy, 75, i)
        return <g key={d.id}>
          <circle cx={x} cy={y} r={16.5} fill="#fff" stroke="#111" strokeWidth=".6" />
          <text x={x} y={y - 7} textAnchor="middle" dominantBaseline="central" fontSize="8.5" fontFamily={EMOJI}>{d.e}</text>
          <TextBox x={x - 14} y={y - 2} w={28} h={6} text={d.name} max={3.8} maxLines={1} weight={900} />
          <TextBox x={x - 14.5} y={y + 4} w={29} h={8.5} text={d.q.split('?')[0] + '?'} max={2.9} maxLines={2} weight={500} fill="#374151" />
        </g>
      })}
      <circle cx={cx} cy={cy} r={24} fill="#fff" stroke="#111" strokeWidth=".7" />
      {item
        ? <><SvgPic item={item} cx={cx} cy={cy - 4} size={20} /><Txt x={cx} y={cy + 15} size={5} weight={900}>{item.t}</Txt></>
        : <Txt x={cx} y={cy + 1.5} size={3.6} fill="#9ca3af">ציירו או הניחו כאן</Txt>}
      <Txt x={195} y={204} size={4.4} weight={800} anchor="start">התיאור שלי:</Txt>
      {ROWS(8, 195, 214, 6, 9.5)}
      <Txt x={100} y={266} size={3} fill="#4b5563">לא חייבים לענות על כל הפינות · לחפצים שחיים וגדלים מדלגים על „ממה עשוי”</Txt>
    </Sheet>,
  }
}

// Riddle cards: 8 per page, five clues each and the answer upside down at the bottom.
function riddleSheets(withPics) {
  const cw = 95, ch = 61
  const pages = []
  for (let p = 0; p * 8 < ITEMS.length; p++) {
    const list = ITEMS.slice(p * 8, p * 8 + 8)
    const cells = list.map((it, i) => ({ it, x: 5 + 190 - ((i % 2) + 1) * cw, y: 21 + Math.floor(i / 2) * ch, w: cw, h: ch }))
    pages.push({
      key: `riddle-${p}`,
      svg: <Sheet label={`כרטיסי „מי אני?” — דף ${p + 1}`}>
        <SheetHeader title={`כרטיסי „מי אני?” (${p + 1}/${Math.ceil(ITEMS.length / 8)})`} note="✂ גוזרים · קוראים רמז אחד בכל פעם · התשובה הפוכה בתחתית הכרטיס" />
        <CutLines cells={cells} />
        {cells.map(({ it, x, y, w, h }) => <g key={it.t}>
          <Txt x={x + w - 4} y={y + 7} size={4.4} weight={900} anchor="start">❓ מי אני?</Txt>
          {it.r.map((c, k) => <g key={k}>
            <Txt x={x + w - 4} y={y + 14.5 + k * 8.2} size={3.2} weight={800} anchor="start">{k + 1}.</Txt>
            <TextBox x={x + 4} y={y + 10.5 + k * 8.2} w={w - 12} h={7.4} text={c} max={3.3} maxLines={2} weight={500} />
          </g>)}
          <g transform={`rotate(180 ${x + w / 2} ${y + h - 4.5})`}><Txt x={x + w / 2} y={y + h - 3.3} size={3.4} weight={700} fill="#6b7280">{`תשובה: ${it.t}`}</Txt></g>
        </g>)}
      </Sheet>,
    })
  }
  return withPics
    ? [...pages, ...cardSheets(ITEMS, { per: 20, title: '„מי אני?” — כרטיסי תמונות לניחוש', keyBase: 'riddle-pics', note: '✂ פורסים כמה תמונות על השולחן, וקוראים את הרמזים — על איזו תמונה מצביעים?' })]
    : pages
}

// Word map: the word in the middle, a box for each kind of knowledge around it, a sentence below.
// mode: 'full' (filled in — a model for the adult), 'pic' (picture and word, the rest blank), 'blank'.
function wordMapSheet(item, mode) {
  const fill = mode === 'full'
  const word = mode === 'blank' ? null : item
  const boxes = [
    { id: 'group', title: '🧺 לאיזו קבוצה שייך?', x: 110, y: 24, w: 85, h: 40, text: item && CATS[item.cat].one },
    { id: 'look', title: '🎨 איך זה נראה?', x: 5, y: 24, w: 85, h: 40, text: item?.look },
    { id: 'use', title: '✋ מה עושים עם זה?', x: 110, y: 160, w: 85, h: 40, text: item?.use },
    { id: 'place', title: '📍 איפה מוצאים?', x: 5, y: 160, w: 85, h: 40, text: item?.place },
  ]
  return {
    key: `map-${mode}-${item?.t}`,
    svg: <Sheet label="מפת מילה">
      <SheetHeader title={word ? `מפת מילה: ${word.t}` : 'מפת מילה'} note={fill ? 'דוגמה ממולאת — למבוגר, להדגמה ולשיחה' : 'ממלאים יחד: הילד/ה אומר/ת, המבוגר/ת כותב/ת (או מציירים)'} />
      {boxes.map(b => <g key={b.id}>
        <line x1={b.x + b.w / 2} y1={b.y < 100 ? b.y + b.h : b.y} x2={100} y2={b.y < 100 ? 80 : 146} stroke="#9ca3af" strokeWidth=".6" />
        <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={4} fill="#fff" stroke="#111" strokeWidth=".6" />
        <Txt x={b.x + b.w - 4} y={b.y + 7} size={4} weight={900} anchor="start">{b.title}</Txt>
        {fill && b.text ? <TextBox x={b.x + 4} y={b.y + 10} w={b.w - 8} h={b.h - 13} text={b.text} max={4.6} maxLines={4} weight={500} /> : ROWS(b.x + 5, b.x + b.w - 5, b.y + 19, 3, 8.5)}
      </g>)}
      <ellipse cx={100} cy={113} rx={44} ry={34} fill="#fffbeb" stroke="#111" strokeWidth=".9" />
      {word
        ? <><SvgPic item={word} cx={100} cy={106} size={26} /><Txt x={100} y={137} size={6.5} weight={900}>{word.t}</Txt></>
        : <><Txt x={100} y={108} size={3.6} fill="#9ca3af">ציירו כאן</Txt><line x1={72} x2={128} y1={134} y2={134} stroke="#111" strokeWidth=".4" /><Txt x={100} y={140} size={3} fill="#6b7280">המילה</Txt></>}
      <rect x={5} y={207} width={190} height={26} rx={4} fill="#fff" stroke="#111" strokeWidth=".6" />
      <Txt x={191} y={214} size={4} weight={900} anchor="start">🔗 מילים קשורות</Txt>
      {[0, 1, 2, 3].map(k => {
        const x = 170 - k * 46
        return <g key={k}>
          <rect x={x - 20} y={217} width={40} height={12} rx={6} fill="#fff" stroke="#6b7280" strokeWidth=".45" />
          {fill && item.rel[k] && <Txt x={x} y={224.8} size={4} weight={700}>{item.rel[k]}</Txt>}
        </g>
      })}
      <Txt x={195} y={243} size={4} weight={900} anchor="start">✏️ משפט עם המילה:</Txt>
      {fill ? <TextBox x={8} y={246} w={184} h={10} text={sentence(item, 'use') || ''} max={4.4} maxLines={1} weight={500} /> : ROWS(8, 195, 254, 2, 8.5)}
      {fill && <Txt x={100} y={267} size={3} fill="#4b5563">יש עוד תשובות נכונות — זו רק דוגמה</Txt>}
    </Sheet>,
  }
}

// "Guess who I am": a board of 24 pictures (each player gets a copy), question ideas, and the
// same 24 pictures as secret cards to cut.
function guessSheets(seed) {
  const list = shuffleWith(ITEMS, rng(seed)).slice(0, 24)
  const cw = 31.5, ch = 37, x0 = 5.5, y0 = 22
  const cells = list.map((it, i) => ({ it, x: x0 + 189 - ((i % 6) + 1) * cw, y: y0 + Math.floor(i / 6) * ch, w: cw, h: ch }))
  const qs = YES_NO.map(q => q[1])
  const board = <Sheet label="נחשו מי אני — לוח משחק">
    <SheetHeader title="נחשו מי אני? — לוח משחק" note="מדפיסים שני עותקים · כל שחקן שולף כרטיס סודי, ושואלים בתורות שאלות של כן/לא" />
    {cells.map(({ it, x, y, w, h }) => <g key={it.t}>
      <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx={3} fill="#fff" stroke="#111" strokeWidth=".5" />
      <SvgPic item={it} cx={x + w / 2} cy={y + h * 0.4} size={15} />
      <TextBox x={x + 2} y={y + h * 0.66} w={w - 4} h={h * 0.26} text={it.t} max={4.4} maxLines={1} />
    </g>)}
    <rect x={5} y={176} width={190} height={78} rx={4} fill="#f9fafb" stroke="#9ca3af" strokeWidth=".45" />
    <Txt x={191} y={184} size={4.2} weight={900} anchor="start">💬 שאלות שאפשר לשאול (לפי כוכב התיאור):</Txt>
    {qs.map((q, k) => <Txt key={q} x={191 - (k % 3) * 62} y={193 + Math.floor(k / 3) * 8} size={3.8} anchor="start">{`• ${q}`}</Txt>)}
    <TextBox x={9} y={226} w={182} h={24} weight={500} max={3.6} maxLines={3}
      text="איך משחקים: שואלים שאלה, והשני עונה „כן” או „לא”. מסמנים X על כל תמונה שכבר לא מתאימה. מי שנשארה לו תמונה אחת — מנחש: „אתה ה…?”. אפשר להמציא שאלות חדשות, ואפשר לשחק בלי מנצח." />
    <Txt x={100} y={264} size={3} fill="#4b5563">טיפ: בהתחלה המבוגר שואל, והילד/ה עונה. אחר כך מחליפים.</Txt>
  </Sheet>
  const cards = <Sheet label="נחשו מי אני — כרטיסים סודיים">
    <SheetHeader title="נחשו מי אני? — כרטיסים סודיים" note="✂ גוזרים, הופכים ומערבבים · כל שחקן שולף כרטיס ולא מראה אותו" />
    <CutLines cells={cells.map(c => ({ ...c, y: c.y + 4 }))} />
    {cells.map(({ it, x, y, w, h }) => <g key={it.t}>
      <SvgPic item={it} cx={x + w / 2} cy={y + 4 + h * 0.4} size={16} />
      <TextBox x={x + 2} y={y + 4 + h * 0.66} w={w - 4} h={h * 0.26} text={it.t} max={4.4} maxLines={1} />
    </g>)}
  </Sheet>
  return [{ key: 'guess-board', svg: board }, { key: 'guess-cards', svg: cards }]
}

const PRINTS = [
  ['star', '⭐ כוכב התיאור (לוח)'],
  ['riddles', '❓ כרטיסי „מי אני?”'],
  ['map', '🗺️ מפת מילה'],
  ['guess', '🎲 „נחשו מי אני” — משחק לוח'],
]

function Printables() {
  const [type, setType] = useState('star')
  const [itemT, setItemT] = useState('')
  const [mapMode, setMapMode] = useState('pic')
  const [pics, setPics] = useState(true)
  const [seed, setSeed] = useState(5)
  const item = itemT ? itemByT[itemT] : null
  const mapItem = item || itemByT['תפוח']
  const pages = useMemo(() => {
    if (type === 'star') return [starMatSheet(item)]
    if (type === 'riddles') return riddleSheets(pics)
    if (type === 'map') return mapMode === 'blank' ? [wordMapSheet(null, 'blank')] : [wordMapSheet(mapItem, mapMode)]
    return guessSheets(seed)
  }, [type, item, mapItem, mapMode, pics, seed])
  const title = PRINTS.find(p => p[0] === type)[1].replace(/^\S+\s/, '')
  const picker = <label className="flex items-center justify-center gap-2 font-bold">חפץ:
    <select value={itemT} onChange={e => setItemT(e.target.value)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-2 font-normal">
      <option value="">{type === 'map' ? 'תפוח (ברירת מחדל)' : '— ריק (מניחים חפץ או ציור) —'}</option>
      {ITEMS.map(it => <option key={it.t} value={it.t}>{it.e} {it.t}</option>)}
    </select></label>
  return <section aria-labelledby="desc-print" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
    <h2 id="desc-print" className="mb-2 text-center text-2xl font-bold">🖨️ דפים להדפסה</h2>
    <p className="mb-4 text-center text-[var(--muted-foreground)]">A4, עם קווי גזירה איפה שצריך. עובד גם בשחור־לבן.</p>
    <div className="mb-4"><Pills label="מה להדפיס" value={type} onChange={setType} options={PRINTS} tone="soft" /></div>
    {type === 'star' && <div className="mb-4">{picker}</div>}
    {type === 'map' && <div className="mb-4 space-y-2">
      <Pills label="סוג מפת המילה" value={mapMode} onChange={setMapMode} tone="soft" options={[['pic', '🖼️ תמונה ומילה, השאר ריק'], ['full', '✅ דוגמה ממולאת'], ['blank', '✏️ ריקה לגמרי']]} />
      {mapMode !== 'blank' && picker}
    </div>}
    {type === 'riddles' && <div className="mb-4"><Pills label="כרטיסי תמונות" value={pics} onChange={setPics} tone="soft" options={[[true, '🖼️ עם כרטיסי תמונות לניחוש'], [false, 'רק כרטיסי חידות']]} /></div>}
    <SheetsPreview pages={pages} title={title} onRefresh={type === 'guess' ? () => setSeed(s => s + 1) : undefined} />
  </section>
}

// ── Page ───────────────────────────────────────────────────────────────────

const ACTIVITIES = [['star', '⭐ כוכב התיאור'], ['riddle', '❓ מי אני?'], ['build', '🧱 בונים תיאור'], ['compare', '⚖️ מה דומה, מה שונה?']]

const faq = [
  { q: 'איך מלמדים ילד לתאר חפץ?', a: 'נותנים לו „מפה”: כמה שאלות קבועות שחוזרות על עצמן — לאיזו קבוצה זה שייך, איך זה נראה, ממה זה עשוי, אילו חלקים יש, איפה מוצאים את זה ומה עושים עם זה. בהתחלה המבוגר מתאר ומצביע על הפינות, אחר כך עונים יחד, ובהדרגה הילד/ה מתאר/ת לבד. כוכב התיאור בעמוד הזה הוא המפה הזאת.' },
  { q: 'מה זה „מפת מילה”?', a: 'דף שבמרכזו מילה אחת (עם תמונה), ומסביבה כל מה שאנחנו יודעים עליה: הקבוצה, איך היא נראית, איפה מוצאים אותה, מה עושים איתה ומילים שקשורות אליה. כך לומדים מילה לעומק — ולא רק את השם שלה — ומקשרים אותה למילים אחרות, מה שעוזר לזכור ולשלוף אותה.' },
  { q: 'מאיזה גיל מתאימות חידות „מי אני?”', a: 'ילדים רבים נהנים מחידות פשוטות כבר בגן, כשיש תמונות לבחירה ורמזים ברורים. בהדרגה אפשר להוסיף רמזים כלליים יותר, להוריד את התמונות, ולבקש מהילד/ה לחבר חידה בעצמו/ה. יש שונות גדולה בין ילדים — מתאימים את הרמה לילד/ה ולא לגיל.' },
  { q: 'האם עדיף לנחש אחרי פחות רמזים?', a: 'לא. אין ניקוד ואין מרוץ. ילד שמחכה לעוד רמז מקשיב ומשווה — וזה בדיוק התרגול. אחרי הניחוש אפשר לחזור על כל הרמזים ולשאול: „איזה רמז עזר לך הכי הרבה?”.' },
  { q: 'למה כדאי לתרגל „מה דומה ומה שונה”?', a: 'השוואה מחייבת לחשוב על כמה תכונות בבת אחת ולהסביר במילים — „שניהם…, אבל…”. זה בונה אוצר מילים, חשיבה ושפה של הסבר, שנדרשים בגן ובבית הספר.' },
  { q: 'איך זה עוזר לילד עם קושי בשליפת מילים?', a: 'מילה שיש סביבה רשת עשירה של משמעות (קבוצה, שימוש, מקום, חלקים) קל יותר למצוא בזיכרון. כשהילד/ה נתקע/ת, אפשר לעבור על פינות הכוכב כרמזים: „זה אוכל… מוצאים את זה במקרר…”. קלינאי/ת תקשורת יכול/ה להתאים את העבודה לילד/ה.' },
  { q: 'אפשר להשתמש בזה עם ילדים שמשתמשים בתקשורת תומכת חליפית?', a: 'כן. בחידות הילד/ה מצביע/ה על התמונה, בכוכב התיאור אפשר להצביע על הפינות ועל תמונות במקום לומר, ואת לוח הכוכב אפשר להניח ליד לוח התקשורת. ראו גם את לוחות התקשורת באתר.' },
  { q: 'זה בחינם?', a: 'כן — המשחקים, ההקראה ודפי ההדפסה (לוח כוכב התיאור, כרטיסי חידות, מפת מילה ומשחק „נחשו מי אני”) חינמיים ובלי הרשמה.' },
]

const related = [
  { label: 'שפה — כל העמודים', href: '/speech/language' },
  { label: 'קטגוריות ושיום', href: '/speech/language/categories' },
  { label: 'שאלות מי, מה, איפה, מתי, למה', href: '/speech/language/wh-questions' },
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
  { label: 'לוחות תקשורת תת״ח', href: '/speech/aac' },
  { label: 'התפתחות שפה לפי גיל', href: '/speech/parents/language-milestones' },
  { label: 'הפכים לילדים', href: '/words/opposites' },
  { label: 'דפי עבודה לגן חובה', href: '/printables/kindergarten-worksheets' },
]

export default function Describing() {
  const [act, setAct] = useState('star')
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="תיאור חפצים לילדים: חידות „מי אני?” ומפת מילה — הרחבת אוצר מילים לגן"
      description="תיאור חפצים לילדים עם „כוכב התיאור”: חידות מי אני לילדים עם הקראה, בונים תיאור, מה דומה ומה שונה, ו־35 חפצים עם תיאור מלא. להדפסה: לוח כוכב, כרטיסי חידות, מפת מילה ומשחק נחשו מי אני. הרחבת אוצר מילים לגן, חינם."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה', href: '/speech/language' }, { label: 'תיאור חפצים ואוצר מילים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">⭐ </span>תיאור חפצים ואוצר מילים: חידות „מי אני?” ומפת מילה</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">כוכב תיאור בשבע פינות · {ITEMS.length} חפצים מוכרים עם תיאור מלא ושמע · {PAIRS.length} זוגות להשוואה · דפים להדפסה</p>
    <QuickAnswer q="איך מתרגלים תיאור חפצים והרחבת אוצר מילים בגן?"
      a="משתמשים ב„מפה” קבועה של שאלות — לאיזו קבוצה זה שייך, איך זה נראה, ממה זה עשוי, אילו חלקים יש, איפה מוצאים את זה, מה עושים עם זה ועוד משהו מיוחד — ומתארים יחד חפצים מוכרים. חידות „מי אני?”, השוואה בין שני דברים ו„מפת מילה” הופכים את זה למשחק. כאן יש את הכול עם תמונות, הקראה ודפים להדפסה."
      rows={[['כוכב התיאור', DIMS.map(d => d.name).join(' · ')], ['גיל', 'גן (בערך 3–6) וכיתה א׳, וגם חינוך מיוחד'], ['להדפסה', 'לוח כוכב התיאור, כרטיסי „מי אני?”, מפת מילה, משחק „נחשו מי אני”'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated={UPDATED} />
    <SpeechNote />
    <LanguageNav current="describing" />

    <section aria-labelledby="desc-play" className="mb-10">
      <h2 id="desc-play" className="mb-3 text-center text-2xl font-bold">משחקים ביחד</h2>
      <div className="mb-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="פעילות">
        {ACTIVITIES.map(([id, l]) => <button key={id} type="button" role="tab" aria-selected={act === id} onClick={() => { stopSpeaking(); setAct(id) }}
          className={`min-h-[48px] rounded-xl border-2 px-4 font-bold ${act === id ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
      </div>
      {act === 'star' && <StarExplorer />}
      {act === 'riddle' && <Riddles />}
      {act === 'build' && <Builder />}
      {act === 'compare' && <Compare />}
      <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">אין ציון, אין שעון ואין הקלטה. המבוגר שליד הילד/ה מדגים, מחכה ומרחיב.</p>
    </section>

    <Printables />

    <div className="mx-auto max-w-3xl space-y-5">
      <Guide title="לקלינאיות ולגננות: עושר סמנטי, לא רק עוד מילים">
        <ul className="space-y-1.5">
          <Li><b>עומק לפני רוחב:</b> ילד שיודע על „כף” שהיא כלי אוכל, עשויה ממתכת, יש לה ידית ואוכלים בה מרק — מבין, זוכר ושולף אותה טוב יותר מילד שמכיר רק את השם. כל פינה בכוכב מוסיפה חוט לרשת.</Li>
          <Li><b>אותה מפה בכל פעם:</b> שאלות קבועות בסדר קבוע הופכות לכלי חשיבה פנימי. מתחילים משתיים־שלוש פינות (קבוצה, מה עושים, איפה מוצאים), ומוסיפים בהדרגה.</Li>
          <Li><b>מוחשי קודם:</b> חפץ אמיתי באמצע הלוח עדיף על תמונה — אפשר למשש, להריח ולגלות חלקים. אחר כך תמונה, ואז רק מילה.</Li>
          <Li><b>מדגימים, לא בוחנים:</b> „אני רואה שהכף עשויה ממתכת — היא קרה!”. אחרי הדגמה שואלים שאלה פתוחה, ומחכים כמה שניות בשקט לפני שעוזרים.</Li>
          <Li><b>מרחיבים את מה שהילד/ה אומר/ת:</b> הילד: „אוכלים”. המבוגר: „נכון, אוכלים בכף מרק חם”. מוסיפים מילה או שתיים — לא מתקנים ולא מבקשים לחזור.</Li>
          <Li><b>חידות כשליפה מכוונת:</b> „מי אני?” מתרגל הקשבה לפרטים והשוואה בין אפשרויות; כשהילד/ה מחבר/ת חידה בעצמו/ה — מתרגלים בחירת תכונה מבדילה.</Li>
          <Li><b>מפת מילה למילים חדשות:</b> לפני סיפור או נושא בגן, ממלאים מפה למילה מרכזית. חוזרים אליה כמה פעמים בשבוע — מילה נלמדת בחשיפות חוזרות, בהקשרים שונים.</Li>
          <Li><b>ילדים דו־לשוניים:</b> אפשר למלא את הכוכב גם בשפת הבית. הידע על המילה עובר בין השפות, ומחזק את שתיהן.</Li>
        </ul>
      </Guide>
      <Guide title="להורים: לתאר ביחד, בכל מקום">
        <ul className="space-y-1.5">
          <Li>במטבח: „מה זה? מלפפון. הוא ירוק וארוך, יש לו קליפה, ומוצאים אותו במקרר”. אחר כך — תורו של הילד/ה לתאר משהו אחר.</Li>
          <Li>„מה בשקית?”: שמים חפץ בשקית, הילד/ה ממשש/ת ומתאר/ת לפני שמוציאים — קשה? רך? עגול?</Li>
          <Li>חידות בדרך: „אני חושב/ת על משהו צהוב, שאוכלים ומקלפים…”. מחליפים תפקידים — ומקבלים גם רמזים „לא מושלמים” בשמחה.</Li>
          <Li>כשהילד/ה אומר/ת מילה אחת, מוסיפים לה עוד פרט: „כלב! כלב גדול וחום”.</Li>
          <Li>לא צריך לעבור על כל שבע הפינות. משחק קצר ומהנה עדיף על תרגול ארוך.</Li>
        </ul>
      </Guide>
    </div>

    <section aria-labelledby="desc-list" className="mx-auto mt-10 max-w-3xl">
      <h2 id="desc-list" className="mb-2 text-2xl font-bold">{ITEMS.length} חפצים ודברים מוכרים — תיאור מלא לפי כוכב התיאור</h2>
      <p className="mb-4 leading-relaxed text-[var(--foreground)]/80">לחיצה על שם פותחת את התיאור. כדאי לקרוא קודם בקול רק את השאלות, ולתת לילד/ה לענות — ורק אחר כך להשוות.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ITEMS.map(it => <details key={it.t} className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
          <summary className="flex cursor-pointer items-center gap-2 text-lg font-bold"><Pic item={it} className="text-3xl" size={30} />{it.t}<span className="text-sm font-normal text-[var(--muted-foreground)]">· {CATS[it.cat].one}</span></summary>
          <p className="mt-2 leading-relaxed">{describe(it).join(' ')}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">מילים קשורות: {it.rel.join(', ')}</p>
          <button type="button" onClick={() => readAll(describe(it))} className="mt-2 min-h-[40px] rounded-full border-2 border-[var(--border)] bg-white px-3 text-sm font-bold">🔊 הקראה</button>
        </details>)}
      </div>
    </section>

    <div className="mt-12">
      <SeoBody paragraphs={[
        'תיאור חפצים לילדים הוא הרבה יותר מתרגיל של „מה זה?”. כשילד מספר שהתפוח הוא פרי, שהוא עגול ואדום, שיש לו קליפה וגרעינים ושמוצאים אותו על עץ — הוא בונה סביב המילה רשת של משמעות. רשת כזאת עוזרת להבין מילים חדשות, לזכור אותן ולמצוא אותן מהר כשמדברים.',
        'כוכב התיאור שבעמוד הוא מסגרת פשוטה בשבע פינות: קבוצה; צבע, צורה וגודל; ממה עשוי; חלקים; איפה מוצאים; מה עושים איתו; ועוד משהו. המסגרת חוזרת על עצמה בכל המשחקים — בחידות „מי אני?”, בבניית תיאור, בהשוואה בין שני דברים ובמפת המילה — כך שהילד/ה לומד/ת דרך אחת לחשוב ולספר על כל דבר.',
        'הרחבת אוצר מילים לגן נעשית בעיקר בשיחה: מבוגר שמתאר, שואל ומרחיב. המשחקים והדפים כאן נותנים לשיחה מבנה ותמונות — לקלינאיות תקשורת, לגננות, לצוותי חינוך מיוחד ולהורים.',
      ]} faq={faq} related={related} />
    </div>
  </div>
}
