import { useEffect, useMemo, useState } from 'react'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import PrintPreview from '../../../components/ui/PrintPreview'
import { Sheet } from '../../../components/printables/PrintableShell'
import { speak, stopSpeaking } from '../../../utils/speak'
import SpeechNote from '../SpeechNote'
import Panel, { PanelArt, GrayFilter } from './SequencePanel'
import { SEQUENCES, seqById, connector, storyText } from '../../../data/speech/sequences'

// /speech/language/sequencing — "סיפור ברצף": 13 everyday picture sequences (3–6 steps). The child taps
// the pictures in order, then tells the story with קודם / אחר כך / בסוף; prompts for the adult; printable
// cut-out cards, a sequencing board and a "my story" sheet. No scoring — a different order is a reason to talk.

const PATH = '/speech/language/sequencing'
const FONT = 'Heebo, Arial, sans-serif'
const UPDATED = '2026-10-24'
const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']

function seeded(seed) {
  let h = 2166136261
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), h | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
// A shuffled order of 0..n-1 that is never the right order.
function shuffledOrder(n, seed) {
  const rnd = seed ? seeded(seed) : Math.random
  for (;;) {
    const a = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
    if (a.some((v, i) => v !== i)) return a
  }
}
const sayStep = t => speak(t, 'he-IL', { rate: 0.85 })

// Tailwind needs literal class names.
const COLS = { 3: 'grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4', 5: 'grid-cols-3 sm:grid-cols-5', 6: 'grid-cols-3 sm:grid-cols-6' }

// ── The order game ──────────────────────────────────────────────────────────

function OrderGame({ seq }) {
  const n = seq.steps.length
  const [pool, setPool] = useState(() => shuffledOrder(n))
  const [placed, setPlaced] = useState([])
  const [result, setResult] = useState(null) // null | 'right' | 'other' | 'shown'
  const [captions, setCaptions] = useState(false)
  useEffect(() => () => stopSpeaking(), [])

  const place = i => {
    if (result) return
    const next = [...placed, i]
    setPlaced(next)
    if (next.length === n) setResult(next.every((v, k) => v === k) ? 'right' : 'other')
  }
  const unplace = i => { if (result === 'right' || result === 'shown') return; setPlaced(p => p.filter(x => x !== i)); setResult(null) }
  const reset = () => { setPool(shuffledOrder(n)); setPlaced([]); setResult(null) }
  const showOrder = () => { setPlaced(Array.from({ length: n }, (_, i) => i)); setResult('shown') }
  const tell = () => speak(storyText(seq), 'he-IL', { rate: 0.85 })
  const solved = result === 'right' || result === 'shown'

  return <div className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm sm:p-5">
    <h3 className="mb-1 text-center text-2xl font-bold"><span aria-hidden="true">{seq.e} </span>{seq.title}</h3>
    <p className="mb-3 text-center text-[var(--muted-foreground)]">{solved ? 'עכשיו מספרים את הסיפור: קודם… אחר כך… בסוף…' : 'מה קרה קודם? לוחצים על התמונות לפי הסדר.'}</p>

    <ol className={`mb-4 grid gap-2 ${COLS[n]}`} aria-label="הסיפור לפי הסדר">
      {Array.from({ length: n }, (_, k) => {
        const i = placed[k]
        return <li key={k} className="flex flex-col">
          <span className="mb-1 text-center text-sm font-bold text-violet-800">{k + 1}. {connector(k, n)}</span>
          {i === undefined
            ? <div className="flex aspect-[5/4] items-center justify-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 text-3xl font-bold text-violet-300" aria-hidden="true">{k + 1}</div>
            : <button type="button" onClick={() => unplace(i)} aria-label={solved ? seq.steps[i].t : `החזרת התמונה: ${seq.steps[i].t}`}
              className={`overflow-hidden rounded-xl border-2 ${result === 'right' ? 'border-emerald-500' : result === 'other' ? 'border-amber-400' : 'border-violet-400'}`}>
              <Panel step={seq.steps[i]} label={seq.steps[i].t} />
            </button>}
          {solved && i !== undefined && (captions || result) && <button type="button" onClick={() => sayStep(seq.steps[i].t)} className="mt-1 min-h-[40px] rounded-lg px-1 text-sm leading-snug hover:bg-[var(--postit)]">🔊 {seq.steps[i].t}</button>}
        </li>
      })}
    </ol>

    {!solved && pool.some(i => !placed.includes(i)) && <>
      <p className="mb-2 text-center text-sm font-bold text-[var(--muted-foreground)]">התמונות (מעורבבות):</p>
      <div className={`grid gap-2 ${COLS[n]}`}>
        {pool.map(i => placed.includes(i)
          ? <div key={i} className="aspect-[5/4] rounded-xl border border-dashed border-[var(--border)]" aria-hidden="true" />
          : <button key={i} type="button" onClick={() => place(i)} aria-label={`בחירה: ${seq.steps[i].t}`}
            className="overflow-hidden rounded-xl border-2 border-[var(--border)] shadow-sm transition hover:border-violet-400">
            <Panel step={seq.steps[i]} label={seq.steps[i].t} />
            {captions && <span className="block p-1 text-xs leading-snug">{seq.steps[i].t}</span>}
          </button>)}
      </div>
    </>}

    <div className="mt-4 text-center" aria-live="polite">
      {result === 'right' && <p className="text-lg font-bold text-emerald-700">יופי! זה בדיוק הסדר 🎉 עכשיו ספרו את הסיפור במילים שלכם.</p>}
      {result === 'shown' && <p className="text-lg font-bold">זה הסדר שלנו. נספר אותו יחד?</p>}
      {result === 'other' && <div>
        <p className="text-lg font-bold">זה סדר אחר משלנו. ספרו את הסיפור לפי הסדר שבחרתם — זה יכול לקרות כך?</p>
        <p className="text-sm text-[var(--muted-foreground)]">לחיצה על תמונה בשורה העליונה מחזירה אותה. אפשר גם לנסות מחדש או לראות את הסדר שלנו.</p>
      </div>}
    </div>
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {solved && <button type="button" onClick={tell} className="min-h-[52px] rounded-xl bg-violet-600 px-6 text-lg font-bold text-white">🔊 הקראת הסיפור</button>}
      {result === 'other' && <button type="button" onClick={showOrder} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">👀 הסדר שלנו</button>}
      <button type="button" onClick={reset} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">🔀 מערבבים מחדש</button>
      {!solved && <button type="button" aria-pressed={captions} onClick={() => setCaptions(c => !c)} className={`min-h-[48px] rounded-xl border-2 px-4 font-bold ${captions ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>📝 משפט מתחת לתמונה</button>}
    </div>

    {solved && <div className="mx-auto mt-5 max-w-xl rounded-xl bg-[var(--postit)] p-4">
      <h4 className="mb-2 text-lg font-bold">💬 שאלות לשיחה</h4>
      <ul className="space-y-1">
        <li className="mr-5 list-disc">מה קרה בהתחלה? ומה קרה אחר כך?</li>
        <li className="mr-5 list-disc">איך הסיפור נגמר?</li>
        {seq.questions.map(q => <li key={q} className="mr-5 list-disc">{q}</li>)}
        <li className="mr-5 list-disc">מה היה קורה אם היינו מדלגים על תמונה אחת?</li>
      </ul>
    </div>}
  </div>
}

// ── Printables ──────────────────────────────────────────────────────────────

function Txt({ x, y, size, weight = 400, fill = '#111', anchor = 'middle', children }) {
  return <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} direction="rtl" fontFamily={FONT}>{children}</text>
}
const CW = 60, PH = 48 // card width, picture height

// Cut-out cards: each sequence is a block (title + cards in rows of three, shuffled, with a letter).
function cardPages(list, color, captions) {
  const CH = PH + (captions ? 9 : 0) + 3
  const blocks = list.map(seq => {
    const order = shuffledOrder(seq.steps.length, seq.id + 'print')
    const rows = Math.ceil(order.length / 3)
    return { seq, order, h: 9 + rows * CH + 7 }
  })
  const pages = [], TOP = 22, BOTTOM = 262
  let cur = [], y = TOP
  for (const b of blocks) {
    if (y + b.h > BOTTOM && cur.length) { pages.push(cur); cur = []; y = TOP }
    cur.push({ ...b, y }); y += b.h
  }
  if (cur.length) pages.push(cur)
  return pages.map((blocksOnPage, p) => ({
    key: `cards-${p}`,
    svg: <Sheet label={`כרטיסי רצף — דף ${p + 1}`}>
      <GrayFilter id="seq-gray-print" />
      <Txt x={100} y={11} size={6.2} weight={900}>כרטיסי רצף לגזירה{pages.length > 1 ? ` (${p + 1}/${pages.length})` : ''}</Txt>
      <Txt x={100} y={17} size={3.2} fill="#4b5563">✂ גוזרים לאורך הקווים המקווקווים, מערבבים, ומסדרים: מה קרה קודם? מה אחר כך? מה בסוף?</Txt>
      {blocksOnPage.map(({ seq, order, y: by }) => {
        const answer = Array.from({ length: seq.steps.length }, (_, k) => LETTERS[order.indexOf(k)]).join(', ')
        return <g key={seq.id}>
          <Txt x={190} y={by + 5.5} size={4.4} weight={800} anchor="start">{seq.title} · {seq.steps.length} תמונות</Txt>
          <Txt x={10} y={by + 5.5} size={2.9} fill="#6b7280" anchor="end">למבוגר — הסדר: {answer}</Txt>
          {order.map((stepIdx, k) => {
            const x = 190 - ((k % 3) + 1) * (CW + 3) + 3, y = by + 8 + Math.floor(k / 3) * CH
            const step = seq.steps[stepIdx]
            return <g key={k}>
              <rect x={x - 1.5} y={y - 1.5} width={CW + 3} height={CH} fill="#fff" stroke="#9ca3af" strokeWidth=".35" strokeDasharray="2 1.4" />
              <svg x={x} y={y} width={CW} height={PH} viewBox="0 0 100 80"><PanelArt step={step} print gray={!color} filterId="seq-gray-print" /></svg>
              <rect x={x} y={y} width={CW} height={PH} fill="none" stroke="#111" strokeWidth=".4" />
              <circle cx={x + 4.5} cy={y + 4.5} r={3.2} fill="#fff" stroke="#6b7280" strokeWidth=".35" />
              <Txt x={x + 4.5} y={y + 5.6} size={3} fill="#6b7280">{LETTERS[k]}</Txt>
              {captions && <Txt x={x + CW / 2} y={y + PH + 5.5} size={step.t.length > 34 ? 2.5 : 2.9}>{step.t}</Txt>}
            </g>
          })}
        </g>
      })}
    </Sheet>,
  }))
}

// A board with numbered frames the size of a card: paste the cards in order, and write the words.
function boardPage(n) {
  const perRow = n === 4 ? 2 : 3, rows = Math.ceil(n / perRow)
  const fw = perRow === 2 ? 80 : CW, fh = perRow === 2 ? 64 : PH
  const gapX = perRow === 2 ? 14 : 3, rowH = fh + 34
  const totalW = perRow * fw + (perRow - 1) * gapX, x0 = 100 + totalW / 2
  return {
    key: `board-${n}`,
    svg: <Sheet label={`לוח רצף — ${n} תמונות`}>
      <Txt x={100} y={11} size={6.2} weight={900}>{`לוח רצף: ${n} תמונות`}</Txt>
      <Txt x={100} y={17} size={3.2} fill="#4b5563">מדביקים את הכרטיסים לפי הסדר, ומתחת לכל תמונה כותבים (או המבוגר כותב) מה קרה</Txt>
      <Txt x={190} y={26} size={3.6} anchor="start">שם הסיפור: ________________________</Txt>
      {Array.from({ length: n }, (_, k) => {
        const x = x0 - ((k % perRow) + 1) * fw - (k % perRow) * gapX, y = 34 + Math.floor(k / perRow) * rowH
        return <g key={k}>
          <Txt x={x + fw} y={y + 4} size={4} weight={800} anchor="start" fill="#5b21b6">{k + 1}. {connector(k, n)}</Txt>
          <rect x={x} y={y + 6} width={fw} height={fh} rx={2} fill="#fff" stroke="#6b7280" strokeWidth=".5" strokeDasharray="2.4 1.4" />
          <Txt x={x + fw / 2} y={y + 6 + fh / 2 + 2} size={8} fill="#e5e7eb" weight={900}>{k + 1}</Txt>
          {[0, 1].map(l => <line key={l} x1={x} y1={y + fh + 15 + l * 8} x2={x + fw} y2={y + fh + 15 + l * 8} stroke="#9ca3af" strokeWidth=".35" />)}
        </g>
      })}
      {rows < 3 && <Txt x={100} y={258} size={3.2} fill="#4b5563">ספרו את הסיפור בקול: „קודם… אחר כך… ובסוף…”</Txt>}
    </Sheet>,
  }
}

// "My story": the child draws, the adult writes the child's words.
function myStoryPage(n) {
  const perRow = n === 3 ? 1 : 2, fw = n === 3 ? 120 : 86, fh = n === 3 ? 50 : n === 4 ? 70 : 44
  const rowH = fh + 24, rows = Math.ceil(n / perRow)
  const totalW = perRow * fw + (perRow - 1) * 8, x0 = 100 + totalW / 2
  return {
    key: `mystory-${n}`,
    svg: <Sheet label="הסיפור שלי">
      <Txt x={100} y={12} size={7} weight={900}>הסיפור שלי</Txt>
      <Txt x={190} y={22} size={3.6} anchor="start">שם: ______________</Txt>
      <Txt x={96} y={22} size={3.6} anchor="start">שם הסיפור: ____________________</Txt>
      {Array.from({ length: n }, (_, k) => {
        const x = x0 - ((k % perRow) + 1) * fw - (k % perRow) * 8, y = 28 + Math.floor(k / perRow) * rowH
        return <g key={k}>
          <rect x={x} y={y} width={fw} height={fh} rx={3} fill="#fff" stroke="#111" strokeWidth=".5" />
          <rect x={x + fw - 24} y={y + 2} width={22} height={7} rx={3.5} fill="#ede9fe" stroke="#7c3aed" strokeWidth=".35" />
          <Txt x={x + fw - 13} y={y + 7} size={3.6} weight={800} fill="#5b21b6">{connector(k, n)}</Txt>
          {[0, 1].map(l => <line key={l} x1={x} y1={y + fh + 8 + l * 7.5} x2={x + fw} y2={y + fh + 8 + l * 7.5} stroke="#9ca3af" strokeWidth=".35" />)}
        </g>
      })}
      {28 + rows * rowH < 252 && <Txt x={100} y={258} size={3.2} fill="#4b5563">מציירים בכל ריבוע מה קרה, ומספרים: „קודם… אחר כך… ובסוף…”. המבוגר כותב את המילים של הילד/ה.</Txt>}
    </Sheet>,
  }
}

const sheetsOf = list => list.map(p => <article className="buga-a4" key={p.key}><div className="print-art">{p.svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)

// ── Page ────────────────────────────────────────────────────────────────────

const faq = [
  { q: 'מה זה סיפור ברצף?', a: 'סיפור ברצף הוא סדרה של תמונות שמספרות אירוע קצר מההתחלה ועד הסוף — למשל שתילת זרע או הכנת כריך. הילד מסדר את התמונות לפי הסדר שבו הדברים קרו, ואחר כך מספר את הסיפור במילים שלו, עם מילות רצף כמו "קודם", "אחר כך" ו"בסוף".' },
  { q: 'למה קלינאיות תקשורת משתמשות בכרטיסי רצף?', a: 'כרטיסי רצף עוזרים לתרגל שפה סיפורית (נרטיב): לספר לפי הסדר, להשתמש במילות זמן ובפעלים בעבר, להסביר סיבה ותוצאה ("הוא השתמש בחול רטוב כי…"), ולענות על שאלות על הסיפור. זו מיומנות חשובה לשיחה, להבנת הנקרא ולכתיבה בהמשך.' },
  { q: 'עם כמה תמונות מתחילים?', a: 'בדרך כלל מתחילים בשלוש תמונות עם אירוע מוכר ומובן (כמו הכנת כריך), ועוברים לארבע, חמש ושש תמונות כשהילד מסדר ומספר בקלות. כאן כל סיפור מסומן לפי מספר התמונות, ואפשר לסנן לפיו.' },
  { q: 'מה עושים אם הילד סידר בסדר אחר?', a: 'שואלים אותו לספר את הסיפור לפי הסדר שבחר. לפעמים יש היגיון אחר, ולפעמים תוך כדי הסיפור הוא מגלה בעצמו שמשהו לא מסתדר ("אי אפשר לשתות לפני שמכינים"). זה החלק המעניין בתרגול. המשחק לא נותן ציון ולא סופר טעויות.' },
  { q: 'איך עוזרים לילד לספר את הסיפור?', a: 'מדגימים קודם סיפור קצר עם "קודם… אחר כך… בסוף…", ואז מבקשים מהילד לספר. אם הוא נתקע, מצביעים על התמונה הבאה ושואלים "ומה קרה אחר כך?". כשהוא אומר משפט קצר, אפשר להרחיב אותו בחזרה: "כן! הוא הפך את הדלי על החול".' },
  { q: 'אפשר להדפיס את כרטיסי הרצף?', a: 'כן, בחינם. בוחרים סיפורים ומקבלים כרטיסי רצף לגזירה (בצבע או בשחור־לבן, עם משפט או בלי), לוח רצף להדבקה עם מקום לכתוב, ודף "הסיפור שלי" שבו הילד מצייר סיפור משלו. בכל כרטיס יש אות קטנה, ובראש כל סיפור כתוב למבוגר הסדר הנכון.' },
  { q: 'האם זה מתאים גם לחינוך מיוחד?', a: 'כן. אפשר להתחיל בשלוש תמונות, להשתמש באפשרות "משפט מתחת לתמונה", לתת לילד להצביע במקום לספר, ולהשתמש בכרטיסים המודפסים כלוח ויזואלי לסדר יום. כדאי להתאים את רמת הקושי בהנחיית הקלינאית או הצוות.' },
]

const related = [
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
  { label: 'שפה: קטגוריות, שאלות, רצף והוראות', href: '/speech/language' },
  { label: 'הוראות בשלבים: תרגול הקשבה', href: '/speech/language/directions' },
  { label: 'התפתחות שפה לפי גיל', href: '/speech/parents/language-milestones' },
  { label: 'סיפורים לילדים', href: '/stories' },
  { label: 'הפכים ומילים נרדפות', href: '/words/opposites' },
]

const Guide = ({ title, children }) => <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
  <h2 className="mb-3 text-2xl font-bold">{title}</h2>
  <div className="space-y-2 leading-relaxed text-[var(--foreground)]/85">{children}</div>
</section>
const Li = ({ children }) => <li className="mr-5 list-disc">{children}</li>

export default function Sequencing() {
  const [len, setLen] = useState(0)
  const [current, setCurrent] = useState('sandwich')
  const [chosen, setChosen] = useState(['sandwich', 'teeth', 'sandcastle', 'seed'])
  const [color, setColor] = useState(true)
  const [captions, setCaptions] = useState(false)
  const [extras, setExtras] = useState(['board', 'mystory'])
  const [storyN, setStoryN] = useState(4)
  const [printing, setPrinting] = useState(false)

  const shown = SEQUENCES.filter(s => !len || s.steps.length === len)
  const seq = seqById[current]
  const chosenList = useMemo(() => SEQUENCES.filter(s => chosen.includes(s.id)), [chosen])
  const pages = useMemo(() => [
    ...(chosenList.length ? cardPages(chosenList, color, captions) : []),
    ...(extras.includes('board') ? [...new Set(chosenList.map(s => s.steps.length))].sort().map(boardPage) : []),
    ...(extras.includes('mystory') ? [myStoryPage(storyN)] : []),
  ], [chosenList, color, captions, extras, storyN])
  const toggle = (set, id) => set(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO path={PATH}
        title="סיפור ברצף — כרטיסי רצף להדפסה ומשחק סידור תמונות"
        description="13 סיפורים ברצף מחיי היום־יום (3–6 תמונות): משחק סידור, שאלות לשיחה, כרטיסי רצף לגזירה, לוח רצף ודף „הסיפור שלי” להדפסה. קודם, אחר כך, בסוף — חינם."
        structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה', href: '/speech/language' }, { label: 'סיפור ברצף' }]} />
      <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">🧩 </span>סיפור ברצף: כרטיסי רצף לסיפור ולשפה</h1>
      <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">{SEQUENCES.length} סיפורים מחיי היום־יום · מסדרים, מספרים ומדפיסים</p>

      <QuickAnswer q="איך מתרגלים סיפור ברצף עם ילדים?"
        a="מסדרים תמונות של אירוע מוכר לפי הסדר שבו קרה, ואז מספרים אותו במילים: „קודם… אחר כך… בסוף…”. מתחילים בשלוש תמונות ומתקדמים עד שש. כאן יש משחק סידור על המסך, שאלות לשיחה לכל סיפור, וכרטיסי רצף להדפסה עם לוח הדבקה ודף לציור סיפור משלכם."
        rows={[['סיפורים', `${SEQUENCES.length} סיפורים: 3, 4, 5 ו־6 תמונות`], ['מילות רצף', 'קודם, אחר כך, ואז, אחרי זה, בסוף'], ['להדפסה', 'כרטיסים לגזירה, לוח רצף, „הסיפור שלי”'], ['מחיר', 'חינם, בלי הרשמה ובלי ציון']]}
        updated={UPDATED} />

      <SpeechNote />

      <section aria-labelledby="seq-play" className="mb-10">
        <h2 id="seq-play" className="mb-3 text-center text-2xl font-bold">1. בוחרים סיפור ומסדרים</h2>
        <div className="mb-3 flex flex-wrap justify-center gap-2" role="group" aria-label="מספר תמונות">
          {[[0, 'הכול'], [3, '3 תמונות'], [4, '4 תמונות'], [5, '5 תמונות'], [6, '6 תמונות']].map(([v, l]) => <button key={v} type="button" aria-pressed={len === v} onClick={() => setLen(v)}
            className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${len === v ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
        </div>
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="סיפורים">
          {shown.map(s => <button key={s.id} type="button" aria-pressed={current === s.id} onClick={() => setCurrent(s.id)}
            className={`flex min-h-[56px] items-center gap-2 rounded-xl border-2 p-2 text-right font-bold ${current === s.id ? 'border-violet-500 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>
            <span aria-hidden="true" className="text-2xl">{s.e}</span>
            <span className="leading-tight">{s.title}<span className="block text-xs font-normal text-[var(--muted-foreground)]">{s.steps.length} תמונות</span></span>
          </button>)}
        </div>
        <OrderGame key={current} seq={seq} />
      </section>

      <section aria-labelledby="seq-tell" className="mb-10 rounded-2xl border border-[var(--border)] bg-[var(--postit)] p-5 shadow-sm">
        <h2 id="seq-tell" className="mb-2 text-2xl font-bold">2. מספרים את הסיפור</h2>
        <p className="mb-3 leading-relaxed">אחרי שהתמונות מסודרות, הילד/ה מספר/ת. מילות הרצף עוזרות לבנות סיפור:</p>
        <div className="mb-3 flex flex-wrap justify-center gap-2 text-lg font-bold" aria-label="מילות רצף">
          {['קודם', 'אחר כך', 'ואז', 'אחרי זה', 'בסוף'].map(w => <button key={w} type="button" onClick={() => speak(w, 'he-IL', { rate: 0.85 })} className="min-h-[44px] rounded-full border-2 border-violet-300 bg-white px-4">{w}</button>)}
        </div>
        <ul className="space-y-1 leading-relaxed">
          <Li><b>מדגימים קודם:</b> המבוגר מספר סיפור אחד בקול, לאט, ומצביע על כל תמונה.</Li>
          <Li><b>שואלים שאלות פתוחות:</b> „מה קרה אחר כך?”, „למה הוא עשה את זה?”, „איך הוא הרגיש?”.</Li>
          <Li><b>מרחיבים:</b> הילד/ה אומר/ת „דלי, חול”, והמבוגר מחזיר משפט שלם: „נכון, רוני מילא דלי בחול רטוב”.</Li>
          <Li><b>מספרים מהסוף להתחלה:</b> „מה קרה ממש לפני שהגל הגיע?” — תרגול טוב של מושגי זמן.</Li>
          <Li><b>מחברים לחיים:</b> „גם אתם בניתם פעם מגדל חול? מה קרה?”.</Li>
        </ul>
      </section>

      <section aria-labelledby="seq-print" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <h2 id="seq-print" className="mb-2 text-center text-2xl font-bold">3. כרטיסי רצף להדפסה</h2>
        <p className="mb-3 text-center text-[var(--muted-foreground)]">בוחרים סיפורים לכרטיסים ({chosen.length} נבחרו):</p>
        <div className="mb-3 flex flex-wrap justify-center gap-2" role="group" aria-label="סיפורים להדפסה">
          {SEQUENCES.map(s => <button key={s.id} type="button" aria-pressed={chosen.includes(s.id)} onClick={() => toggle(setChosen, s.id)}
            className={`min-h-[44px] rounded-full border-2 px-3 font-bold ${chosen.includes(s.id) ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white text-slate-500'}`}>{s.e} {s.title} <span className="text-xs font-normal">({s.steps.length})</span></button>)}
        </div>
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setChosen(chosen.length === SEQUENCES.length ? [] : SEQUENCES.map(s => s.id))} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold">{chosen.length === SEQUENCES.length ? 'ניקוי הבחירה' : `כל ${SEQUENCES.length} הסיפורים`}</button>
          <button type="button" aria-pressed={captions} onClick={() => setCaptions(c => !c)} className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${captions ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>📝 משפט מתחת לתמונה</button>
          {[[true, '🎨 צבעוני'], [false, '⚫ שחור־לבן']].map(([v, l]) => <button key={l} type="button" aria-pressed={color === v} onClick={() => setColor(v)}
            className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${color === v ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="דפים נוספים">
          <button type="button" aria-pressed={extras.includes('board')} onClick={() => toggle(setExtras, 'board')} className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${extras.includes('board') ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white text-slate-500'}`}>🧷 לוח רצף להדבקה</button>
          <button type="button" aria-pressed={extras.includes('mystory')} onClick={() => toggle(setExtras, 'mystory')} className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${extras.includes('mystory') ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white text-slate-500'}`}>✏️ הסיפור שלי</button>
          {extras.includes('mystory') && <label className="flex items-center gap-1 font-bold">ריבועים:
            <select value={storyN} onChange={e => setStoryN(Number(e.target.value))} className="min-h-[44px] rounded-lg border-2 border-[var(--border)] bg-white px-2">
              {[3, 4, 6].map(v => <option key={v} value={v}>{v}</option>)}
            </select></label>}
        </div>
        {pages.length > 0
          ? <>
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3" aria-label="תצוגה מקדימה">
              {pages.filter((p, i) => pages.findIndex(q => q.key.split('-')[0] === p.key.split('-')[0]) === i).map(p => <div key={p.key} className="border border-[var(--border)] bg-white p-1.5 shadow-sm">{p.svg}</div>)}
            </div>
            <div className="mt-5 text-center">
              <button type="button" data-print-main onClick={() => setPrinting(true)} className="min-h-[52px] rounded-xl bg-red-500 px-8 py-3 text-lg font-bold text-white">🖨️ הדפסה או PDF · {pages.length} {pages.length === 1 ? 'דף' : 'דפים'}</button>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">A4, עם קווי גזירה. הכרטיסים בגודל המסגרות שבלוח הרצף. כדאי להדביק על קרטון.</p>
            </div>
          </>
          : <p className="text-center">בחרו סיפור אחד לפחות, או דף נוסף.</p>}
      </section>
      {printing && <PrintPreview title="סיפור ברצף" onClose={() => setPrinting(false)}>{sheetsOf(pages)}</PrintPreview>}

      <div className="mx-auto max-w-3xl space-y-5">
        <Guide title="לקלינאיות תקשורת ולגננות: איך לעבוד עם הרצפים">
          <ul className="space-y-1.5">
            <Li><b>דרגו לפי אורך ולפי מוכרות:</b> שלוש תמונות של אירוע שהילד/ה מכיר/ה (כריך) קלות יותר משש תמונות של תהליך פחות מוכר (שתילה).</Li>
            <Li><b>הפרידו בין סידור לסיפור:</b> יש ילדים שמסדרים נכון אבל מתקשים לספר, ולהפך. אפשר לעבוד על כל אחד בנפרד.</Li>
            <Li><b>מטרות שפה:</b> פעלים בעבר, מילות זמן (קודם, אחר כך, בסוף), סיבה ותוצאה („כי”, „ולכן”), ושאלות „למה” ו„מה היה קורה אם”.</Li>
            <Li>המשפטים המוכנים הם דוגמה בלבד — עדיף לשמוע את הסיפור במילים של הילד/ה, ולהרחיב אותו.</Li>
            <Li>לוח הרצף המודפס מתאים לשיעורי בית: ההורה עוזר לסדר, והילד/ה מספר/ת. דף „הסיפור שלי” מתאים לסיפור אישי — מה עשינו בשבת, איך הכנו עוגה.</Li>
          </ul>
        </Guide>
        <Guide title="להורים: סיפור ברצף בבית">
          <ul className="space-y-1.5">
            <Li>ספרו יחד אירועים מהיום: „מה עשינו קודם בגן? ואחר כך?”. זה אותו תרגול, בלי כרטיסים.</Li>
            <Li>כשמבשלים, שותלים או מתלבשים — אמרו בקול את השלבים: „קודם… ואז… ובסוף…”.</Li>
            <Li>אין צורך לתקן כל מילה. חזרו על מה שהילד/ה אמר/ה במשפט מלא, ושאלו שאלה אחת שממשיכה את הסיפור.</Li>
            <Li>אם יש דאגה לגבי השפה או הדיבור של הילד/ה — פנו לקלינאי/ת תקשורת, ובדקו גם שמיעה.</Li>
          </ul>
        </Guide>
      </div>

      <div className="mt-12">
        <SeoBody paragraphs={[
          'סיפור ברצף בתמונות הוא אחד הכלים הוותיקים לפיתוח שפה בגיל הגן. כשילד מסדר כרטיסי רצף ומספר מה קרה, הוא מתרגל כמה דברים יחד: הבנה של זמן וסדר, אוצר מילים, פעלים בעבר, חיבור משפטים במילים כמו „קודם”, „אחר כך” ו„בסוף”, והבנה של סיבה ותוצאה.',
          `בעמוד יש ${SEQUENCES.length} סיפורים מקוריים מחיי היום־יום בישראל: מכינים כריך ולימונדה, מצחצחים שיניים, הולכים לגן, אמבטיה, יום גשום, מגדל חול בים, סלט ישראלי, שתילת זרע ועוגה ליום הולדת. כל סיפור מסומן לפי מספר התמונות — 3, 4, 5 או 6 — ולכל אחד יש שאלות לשיחה.`,
          'כרטיסי הרצף להדפסה מתאימים לגן, לטיפול ולבית: מדפיסים, גוזרים, מערבבים ומסדרים. לוח הרצף בנוי בדיוק בגודל הכרטיסים, כך שאפשר להדביק ולכתוב מתחת לכל תמונה. ודף „הסיפור שלי” מזמין את הילד לצייר סיפור ברצף משלו — מקום טוב להתחיל בו שיחה.',
        ]} faq={faq} related={related} />
      </div>
    </div>
  )
}
