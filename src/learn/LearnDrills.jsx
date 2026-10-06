import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import { speak } from '../utils/speak'
import { DECKS } from './learnData'
import { LEARN_CRUMB } from './LearnPages'
import './learn.css'

const rnd = n => Math.floor(Math.random() * n)
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = rnd(i + 1);[x[i], x[j]] = [x[j], x[i]] } return x }
const store = { get(k) { try { return Number(localStorage.getItem(k)) || 0 } catch { return 0 } }, set(k, v) { try { localStorage.setItem(k, String(v)) } catch { /* private mode */ } } }
const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>
function Head({ emoji, h1, sub, crumb }) {
  return <>
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: crumb }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{emoji} </span>{h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{sub}</p>
  </>
}
const A4 = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
const L = props => <T {...props} direction="ltr" /> // numbers and English

// ── times-table printables ───────────────────────────────
function ChartSheet({ blank }) {
  const s = 17, x0 = 6.5, y0 = 30
  const cells = []
  for (let r = 0; r <= 10; r++) for (let c = 0; c <= 10; c++) {
    const head = r === 0 || c === 0
    const x = x0 + c * s, y = y0 + r * s
    cells.push(<g key={`${r}-${c}`}><rect x={x} y={y} width={s} height={s} fill={r === 0 && c === 0 ? '#1d2233' : head ? '#ffe9a8' : r === c ? '#f3f0ff' : '#fff'} stroke="#555" strokeWidth=".35" />
      {!(r === 0 && c === 0) && (head || !blank) && <L x={x + s / 2} y={y + s / 2 + 2.3} size={head ? 7 : 6.2} weight={head ? 800 : 500}>{head ? (r || c) : r * c}</L>}
      {r === 0 && c === 0 && <L x={x + s / 2} y={y + s / 2 + 2.5} size={8} weight={800} fill="#fff">×</L>}</g>)
  }
  return <Sheet label={blank ? 'לוח כפל ריק למילוי' : 'לוח הכפל'}>
    <T x={100} y={16} size={10} weight={900}>{blank ? 'לוח הכפל — ממלאים לבד' : 'לוח הכפל'}</T>
    {blank && <T x={100} y={24} size={4.5}>שם: ______________   הזמן שלי: ______ דקות</T>}
    {cells}
    <T x={100} y={y0 + 11 * s + 10} size={4.5} fill="#555">{blank ? 'טיפ: מתחילים מהשורות הקלות — 1, 2, 5 ו-10' : 'האלכסון הסגול: מספר כפול עצמו (ריבועים)'}</T>
  </Sheet>
}
export function drillItems(tables, n = 45) {
  const out = []
  let last = ''
  while (out.length < n) {
    const a = tables[rnd(tables.length)], b = 1 + rnd(10)
    const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]
    if (`${x}x${y}` === last) continue
    last = `${x}x${y}`; out.push([x, y])
  }
  return out
}
function DrillSheet({ items, answers }) {
  return <Sheet label="תרגילי כפל">
    <T x={100} y={14} size={9} weight={900}>{answers ? 'תשובות' : 'תרגילי כפל'}</T>
    {!answers && <T x={100} y={22} size={4.5}>שם: ______________   תאריך: __________   הצלחתי: ___ מתוך {items.length}</T>}
    {items.map(([a, b], i) => {
      const col = Math.floor(i / 15), row = i % 15
      const x = 166 - col * 64, y = 38 + row * 15.2
      return <g key={i}><L x={x - 22} y={y} size={4} fill="#888" textAnchor="end">{i + 1}.</L><L x={x} y={y} size={7.2}>{`${a} × ${b} = ${answers ? a * b : '____'}`}</L></g>
    })}
  </Sheet>
}

// ── /learn/times-tables ───────────────────────────────
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
export function TimesTables() {
  const [tables, setTables] = useState([2, 3, 4, 5, 6, 7, 8, 9, 10])
  const [mode, setMode] = useState('sprint')
  const [game, setGame] = useState(null) // { q:[a,b], typed, score, asked, wrong:[], end, flash }
  const [left, setLeft] = useState(60)
  const [cell, setCell] = useState(null)
  const [print, setPrint] = useState(null)
  const sorted = [...tables].sort((a, b) => a - b)
  const bestKey = `ln-tt-${mode}-${sorted.join('.')}`
  const [best, setBest] = useState(0)
  useEffect(() => { setBest(store.get(bestKey)) }, [bestKey])
  const g = useRef(null); g.current = game
  const newQ = prev => { for (;;) { const a = sorted[rnd(sorted.length)], b = 1 + rnd(10); const q = Math.random() < 0.5 ? [a, b] : [b, a]; if (!prev || q.join() !== prev.join()) return q } }
  const finish = useCallback(s => {
    const record = s.score > 0 && s.score > store.get(bestKey)
    setGame({ ...s, over: true, record })
    if (record) { store.set(bestKey, s.score); setBest(s.score) }
  }, [bestKey])
  const start = () => { setGame({ q: newQ(), typed: '', score: 0, asked: 0, wrong: [], t0: Date.now(), flash: '' }); setLeft(60) }
  useEffect(() => {
    if (!game || game.over || mode !== 'sprint') return
    const id = setInterval(() => { const s = g.current; const l = Math.max(0, 60 - (Date.now() - s.t0) / 1000); setLeft(l); if (l <= 0) { clearInterval(id); finish(s) } }, 200)
    return () => clearInterval(id)
  }, [game?.t0, game?.over, mode, finish]) // eslint-disable-line react-hooks/exhaustive-deps
  const press = useCallback(k => {
    const s = g.current
    if (!s || s.over || s.flash === 'no') return
    if (k === 'del') { setGame({ ...s, typed: s.typed.slice(0, -1) }); return }
    const typed = (s.typed + k).slice(0, 3)
    const ans = String(s.q[0] * s.q[1])
    if (typed === ans) {
      const n = { ...s, typed: '', score: s.score + 1, asked: s.asked + 1, q: newQ(s.q), flash: 'ok' }
      if (mode === 'twenty' && n.asked >= 20) finish({ ...n, secs: Math.round((Date.now() - s.t0) / 1000) }); else setGame(n)
    } else if (typed.length >= ans.length) {
      setGame({ ...s, typed, flash: 'no' })
      setTimeout(() => {
        const n = { ...g.current, typed: '', asked: s.asked + 1, wrong: [...s.wrong, s.q], q: newQ(s.q), flash: '' }
        if (mode === 'twenty' && n.asked >= 20) finish({ ...n, secs: Math.round((Date.now() - s.t0) / 1000) }); else if (!g.current.over) setGame(n)
      }, 900)
    } else setGame({ ...s, typed, flash: '' })
  }, [mode, finish]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = e => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del') }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [press])
  const toggle = n => setTables(t => (t.includes(n) ? (t.length > 1 ? t.filter(x => x !== n) : t) : [...t, n]))
  const openPrint = kind => setPrint({ kind, items: drillItems(sorted) })
  const faq = [
    { q: 'איך הכי טוב לשנן את לוח הכפל?', a: 'מעט כל יום: חמש דקות של תרגול מהיר עדיפות על שעה פעם בשבוע. מתחילים מהקלים (1, 2, 5, 10), ממשיכים ל-3, 4 ו-9, ומשאירים ל-6, 7 ו-8 זמן נוסף. כדאי לזכור ש-7×8 ו-8×7 הם אותו תרגיל — כך יש פחות מחצי מהתרגילים לזכור.' },
    { q: 'מה ההבדל בין "דקה אחת" ל-"20 תרגילים"?', a: 'בדקה אחת מנסים לפתור כמה שיותר תרגילים. ב-20 תרגילים מודדים כמה זמן לוקח לסיים ובכמה טעיתם. השיא נשמר במכשיר לכל בחירה של לוחות.' },
    { q: 'אפשר להדפיס את לוח הכפל?', a: 'כן — לוח כפל מלא, לוח ריק למילוי, ודף של 45 תרגילים מהלוחות שבחרתם עם דף תשובות. בכל לחיצה על "תרגילים אחרים" מקבלים דף חדש.' },
  ]
  const over = game?.over
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="אתגר לוח הכפל — תרגול כפל אונליין ולוח הכפל להדפסה" description="משחק תרגול לוח הכפל: כמה תרגילים תפתרו בדקה? בוחרים לוחות 1–10, מקלידים במקלדת גדולה ושוברים שיאים. וגם לוח הכפל להדפסה, לוח ריק למילוי ודפי תרגילים." path="/learn/times-tables" structuredData={faqSchema(faq)} />
    <Head emoji="✖️" h1="אתגר לוח הכפל" sub="כמה תרגילים תספיקו בדקה אחת? בוחרים לוחות — ויוצאים לדרך" crumb="לוח הכפל" />
    {!game && <div className="ln-box space-y-4">
      <p className="text-center font-bold">אילו לוחות מתרגלים?</p>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="לוחות">{ALL.map(n => <Chip key={n} on={tables.includes(n)} onClick={() => toggle(n)}>{n}</Chip>)}
        <Chip on={false} onClick={() => setTables([6, 7, 8, 9])}>הקשים: 6–9</Chip></div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="סוג אתגר"><Chip on={mode === 'sprint'} onClick={() => setMode('sprint')}>⏱️ דקה אחת</Chip><Chip on={mode === 'twenty'} onClick={() => setMode('twenty')}>🎯 20 תרגילים</Chip></div>
      <div className="text-center"><button type="button" className="ln-btn go" onClick={start}>▶ מתחילים</button>{best > 0 && <p className="mt-2 font-bold">🏆 השיא שלך כאן: {best} {mode === 'sprint' ? 'תרגילים בדקה' : 'נכונות מתוך 20'}</p>}</div>
    </div>}
    {game && !over && <div className="ln-box">
      <div className="flex items-center justify-between font-bold text-lg"><span>✅ {game.score}</span><span>{mode === 'sprint' ? `⏱️ ${Math.ceil(left)}` : `${game.asked + 1} / 20`}</span></div>
      <div className="ln-bar my-2"><i style={{ width: `${mode === 'sprint' ? (left / 60) * 100 : (game.asked / 20) * 100}%` }} /></div>
      <div className={`ln-ex ${game.flash === 'ok' ? 'flash-ok' : game.flash === 'no' ? 'flash-no' : ''}`} aria-live="polite">{game.q[0]} × {game.q[1]} = <span className="ans">{game.flash === 'no' ? game.q[0] * game.q[1] : game.typed || ' '}</span></div>
      <div className="ln-pad">{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => <button key={k} type="button" onClick={() => press(k)}>{k}</button>)}<span /><button type="button" onClick={() => press('0')}>0</button><button type="button" onClick={() => press('del')} aria-label="מחיקה">⌫</button></div>
      <p className="mt-3 text-center"><button type="button" className="underline" onClick={() => setGame(null)}>יציאה</button></p>
    </div>}
    {over && <div className="ln-box text-center space-y-3">
      <h2 className="text-3xl font-black">{mode === 'sprint' ? `${game.score} תרגילים בדקה!` : `${game.score} מתוך 20 · ${game.secs} שניות`}</h2>
      {game.record && <p className="text-xl font-bold">🏆 שיא חדש!</p>}
      {game.wrong.length > 0 && <><p className="font-bold">כדאי לחזור על:</p><div className="ln-res">{[...new Set(game.wrong.map(q => q.join('×')))].map(k => { const [a, b] = k.split('×'); return <span key={k} className="no" dir="ltr">{a} × {b} = {a * b}</span> })}</div></>}
      <div className="flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" onClick={start}>🔁 עוד פעם</button><button type="button" className="ln-btn alt" onClick={() => setGame(null)}>לוחות אחרים</button></div>
    </div>}

    <h2 className="mt-10 mb-2 text-2xl font-black text-center">לוח הכפל — לוחצים על משבצת</h2>
    <p className="text-center mb-3 min-h-[1.6em] text-xl font-bold" dir="ltr">{cell ? `${cell[0]} × ${cell[1]} = ${cell[0] * cell[1]}` : ' '}</p>
    <div className="ln-grid">{Array.from({ length: 11 }, (_, r) => Array.from({ length: 11 }, (_, c) => {
      if (!r && !c) return <span key="0" className="h">×</span>
      if (!r || !c) return <span key={`${r}-${c}`} className="h">{r || c}</span>
      const hit = cell && cell[0] === r && cell[1] === c, on = cell && r <= cell[0] && c <= cell[1]
      return <button key={`${r}-${c}`} type="button" className={hit ? 'hit' : on ? 'on' : ''} onClick={() => setCell([r, c])} aria-label={`${r} כפול ${c}`}>{r * c}</button>
    }))}</div>
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn alt" onClick={() => openPrint('chart')}>🖨️ לוח הכפל</button>
      <button type="button" className="ln-btn alt" onClick={() => openPrint('blank')}>🖨️ לוח ריק למילוי</button>
      <button type="button" className="ln-btn alt" onClick={() => openPrint('drill')}>🖨️ 45 תרגילים מהלוחות שבחרתם</button>
    </div>
    {print && <PrintPreview title={print.kind === 'drill' ? 'תרגילי כפל' : 'לוח הכפל'} onClose={() => setPrint(null)} onRefresh={print.kind === 'drill' ? () => openPrint('drill') : undefined}>
      {print.kind === 'drill' ? [<A4 key="d"><DrillSheet items={print.items} /></A4>, <A4 key="a"><DrillSheet items={print.items} answers /></A4>] : <A4><ChartSheet blank={print.kind === 'blank'} /></A4>}
    </PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['לוח הכפל הוא הבסיס לכל החשבון שבא אחריו — חילוק, שברים ואחוזים. כשהתרגילים יושבים בזיכרון, הילד פנוי לחשוב על הבעיה עצמה במקום לספור על האצבעות.', 'באתגר הדקה פותרים כמה שיותר תרגילים, ובמקלדת הגדולה נוח ללחוץ גם בטלפון. תשובה נכונה עוברת מיד לתרגיל הבא, ובטעות מופיעה התשובה הנכונה לשנייה. בסוף רואים בדיוק על אילו תרגילים כדאי לחזור.', 'ליד המשחק יש לוח כפל אינטראקטיבי: לוחצים על משבצת ורואים את התרגיל — והמלבן הצבוע מראה למה 3×4 הם 12 משבצות.']} faq={faq} related={[{ label: 'כרטיסיות לוח הכפל', href: '/learn/flashcards' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }]} /></div>
  </div>
}

// ── /learn/flashcards ───────────────────────────────
const TT_DECKS = [2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ id: `tt-${n}`, title: `לוח הכפל של ${n}`, emoji: '✖️', ltrFront: true, cards: ALL.map(k => [`${n} × ${k}`, String(n * k)]) }))
const parseCustom = txt => txt.split('\n').map(l => l.split(/\s*(?:=|\t|\s[-–—]\s)\s*/)).filter(p => p.length >= 2 && p[0].trim() && p[1].trim()).map(p => [p[0].trim(), p.slice(1).join(' ').trim()]).slice(0, 48)
const isLtr = s => /^[\x20-\x7e×]+$/.test(s)
function wrap(text, max) {
  const lines = []; let cur = ''
  for (const w of String(text).split(' ')) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w } else cur = (cur + ' ' + w).trim() }
  if (cur) lines.push(cur)
  return lines.slice(0, 4)
}
function CardText({ x, y, text }) {
  const ltr = isLtr(text)
  const lines = wrap(text, text.length > 20 ? 20 : 14)
  const size = lines.length > 2 ? 6 : text.length > 12 ? 7.5 : 11
  const Tx = ltr ? L : T
  return lines.map((l, i) => <Tx key={i} x={x} y={y + (i - (lines.length - 1) / 2) * size * 1.25 + size * 0.35} size={size} weight={800}>{l}</Tx>)
}
function CardsSheet({ cards, side, title }) {
  const w = 88, h = 58, gx = 4, top = 12
  return <Sheet label={side === 'front' ? 'כרטיסיות — צד קדמי' : 'כרטיסיות — צד אחורי'}>
    <T x={100} y={8} size={4} fill="#777">{title} · {side === 'front' ? 'צד קדמי' : 'צד אחורי (להדפיס על גב הדף)'}</T>
    {cards.map((c, i) => {
      let col = i % 2; const row = Math.floor(i / 2)
      if (side === 'back') col = 1 - col // mirrored for double-sided printing
      const x = col === 0 ? 100 + gx / 2 : 100 - gx / 2 - w, y = top + row * (h + 3)
      return <g key={i}><rect x={x} y={y} width={w} height={h} rx="4" fill={side === 'back' ? '#fffbea' : '#fff'} stroke="#888" strokeWidth=".4" strokeDasharray="2 1.5" />
        <CardText x={x + w / 2} y={y + h / 2} text={side === 'front' ? c[0] : c[1]} /></g>
    })}
  </Sheet>
}
export function Flashcards() {
  const [deckId, setDeckId] = useState(DECKS[0].id)
  const [custom, setCustom] = useState('')
  const [reverse, setReverse] = useState(false)
  const [queue, setQueue] = useState(null)
  const [flip, setFlip] = useState(false)
  const [known, setKnown] = useState(0)
  const [printing, setPrinting] = useState(false)
  const all = useMemo(() => [...DECKS, ...TT_DECKS], [])
  const deck = deckId === 'custom' ? { id: 'custom', title: 'הכרטיסיות שלי', emoji: '📝', cards: parseCustom(custom) } : all.find(d => d.id === deckId)
  const cards = deck.cards.map(c => (reverse ? [c[1], c[0]] : c))
  const start = () => { if (!cards.length) return; setQueue(shuffle(cards)); setFlip(false); setKnown(0) }
  const cur = queue?.[0]
  const answer = ok => { setFlip(false); setTimeout(() => { setQueue(q => (ok ? q.slice(1) : [...q.slice(1), q[0]])); if (ok) setKnown(k => k + 1) }, 160) }
  const sayable = !reverse && deck.ltrFront && !deck.id.startsWith('tt-')
  const pages = []
  for (let i = 0; i < cards.length; i += 8) { const chunk = cards.slice(i, i + 8); pages.push(<A4 key={`f${i}`}><CardsSheet cards={chunk} side="front" title={deck.title} /></A4>, <A4 key={`b${i}`}><CardsSheet cards={chunk} side="back" title={deck.title} /></A4>) }
  const faq = [
    { q: 'איך מדפיסים כרטיסיות דו-צדדיות?', a: 'מדפיסים בהדפסה דו-צדדית עם היפוך לאורך הצד הארוך. כל דף קדמי מגיע עם דף אחורי שהטורים שלו הפוכים, כך שהתשובה נופלת בדיוק על גב השאלה. אין מדפסת דו-צדדית? מדפיסים את הדפים בנפרד ומדביקים גב אל גב לפני הגזירה.' },
    { q: 'איך יוצרים כרטיסיות משלי?', a: 'בוחרים "כרטיסיות משלי" וכותבים כל כרטיס בשורה: שאלה = תשובה. למשל: apple = תפוח. עד 48 כרטיסים.' },
    { q: 'מה קורה כשלוחצים "עוד לא"?', a: 'הכרטיס חוזר לסוף החבילה ויופיע שוב, עד שתדעו את כולם. כך מתרגלים יותר דווקא את מה שקשה.' },
  ]
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="כרטיסיות לימוד — אונליין ולהדפסה דו-צדדית" description="כרטיסיות לימוד לילדים: מילים באנגלית, הפכים, צורות ולוח הכפל — או כרטיסיות משלכם. מתרגלים אונליין עם היפוך כרטיס, ומדפיסים כרטיסיות דו-צדדיות לגזירה." path="/learn/flashcards" structuredData={faqSchema(faq)} />
    <Head emoji="🃏" h1="כרטיסיות לימוד" sub="מסתכלים, מנחשים, הופכים — ומה שלא ידעתם חוזר שוב" crumb="כרטיסיות" />
    {!queue && <div className="ln-box space-y-4">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="חבילה">{DECKS.map(d => <Chip key={d.id} on={deckId === d.id} onClick={() => setDeckId(d.id)}>{d.emoji} {d.title}</Chip>)}<Chip on={deckId === 'custom'} onClick={() => setDeckId('custom')}>📝 כרטיסיות משלי</Chip></div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="לוח הכפל">{TT_DECKS.map(d => <Chip key={d.id} on={deckId === d.id} onClick={() => setDeckId(d.id)}>×{d.id.slice(3)}</Chip>)}</div>
      {deckId === 'custom' && <textarea className="ln-ta" value={custom} onChange={e => setCustom(e.target.value)} placeholder={'כל כרטיס בשורה: שאלה = תשובה\napple = תפוח\nבירת צרפת = פריז'} aria-label="הכרטיסיות שלי" />}
      <p className="text-center">{cards.length ? `${cards.length} כרטיסים` : 'אין עדיין כרטיסים'} · <Chip on={reverse} onClick={() => setReverse(!reverse)}>🔄 להתחיל מהתשובה</Chip></p>
      <div className="flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" onClick={start} disabled={!cards.length}>▶ מתרגלים</button><button type="button" className="ln-btn alt" onClick={() => setPrinting(true)} disabled={!cards.length}>🖨️ הדפסה דו-צדדית</button></div>
    </div>}
    {queue && cur && <div className="ln-box text-center space-y-4">
      <p className="font-bold">✅ {known} / {cards.length} · נשארו {queue.length}</p>
      <div className={`ln-card ${flip ? 'is-flip' : ''}`} onClick={() => setFlip(!flip)} role="button" tabIndex={0} aria-label={flip ? `תשובה: ${cur[1]}` : `שאלה: ${cur[0]}. לחצו להפוך`} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlip(!flip) } }}>
        <div className="ln-card-in"><div className="ln-face" dir={isLtr(cur[0]) ? 'ltr' : 'rtl'}><small>שאלה</small>{cur[0]}</div><div className="ln-face back" dir={isLtr(cur[1]) ? 'ltr' : 'rtl'}><small>תשובה</small>{cur[1]}</div></div>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">לוחצים על הכרטיס כדי להפוך</p>
      <div className="flex flex-wrap justify-center gap-3">
        {sayable && <button type="button" className="ln-btn alt" onClick={() => speak(cur[0], 'en-US')}>🔊</button>}
        <button type="button" className="ln-btn alt" onClick={() => answer(false)}>↺ עוד לא</button>
        <button type="button" className="ln-btn go" onClick={() => answer(true)}>✓ ידעתי</button>
      </div>
      <button type="button" className="underline" onClick={() => setQueue(null)}>יציאה</button>
    </div>}
    {queue && !cur && <div className="ln-box text-center space-y-3"><h2 className="text-3xl font-black">🌟 ידעתם את כל {cards.length} הכרטיסים!</h2><div className="flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" onClick={start}>🔁 שוב</button><button type="button" className="ln-btn alt" onClick={() => setQueue(null)}>חבילה אחרת</button></div></div>}
    {printing && <PrintPreview title={`כרטיסיות — ${deck.title}`} onClose={() => setPrinting(false)}>{pages}</PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['כרטיסיות הן אחת משיטות השינון היעילות: רואים שאלה, מנסים להיזכר — ורק אז הופכים. כשהכרטיס שלא ידעתם חוזר לסוף החבילה, מתרגלים יותר את מה שקשה ופחות את מה שכבר יודעים.', 'יש כאן חבילות מוכנות של מילים באנגלית (בעלי חיים, צבעים, מספרים, משפחה ואוכל), הפכים, צורות ולוח הכפל לכל מספר. אפשר גם לכתוב כרטיסיות משלכם — מילים למבחן, בירות, תאריכים — ולהדפיס אותן.', 'בהדפסה כל דף קדמי מגיע עם דף אחורי מותאם, כך שבהדפסה דו-צדדית התשובה נמצאת בדיוק מאחורי השאלה. גוזרים לאורך הקווים המקווקווים.']} faq={faq} related={[{ label: 'אתגר לוח הכפל', href: '/learn/times-tables' }, { label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' }, { label: 'הכתבה', href: '/learn/dictation' }]} /></div>
  </div>
}
