import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { makeTest, KIND_LABELS } from './barIlan'

const PATH = '/learn/gifted-test/bar-ilan'
const LETTERS = ['א', 'ב', 'ג', 'ד']
const newSeed = () => (Date.now() % 2147483647) || 1

function Timer({ minutes, stopped }) {
  const [left, setLeft] = useState(minutes * 60)
  useEffect(() => { if (stopped) return; const t = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t) }, [stopped])
  const m = Math.floor(left / 60), s = String(left % 60).padStart(2, '0')
  return <span role="timer" aria-live="off" className={`rounded-full px-3 py-1 font-black ${left === 0 ? 'bg-red-100 text-red-700' : left < 300 ? 'bg-amber-100' : 'bg-white'}`}>⏱️ {left === 0 ? 'נגמר הזמן' : `${m}:${s}`}</span>
}

function Question({ q, i, pick, onPick, checked }) {
  return <li className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
    <p className="mb-1 text-sm font-bold text-[var(--muted-foreground)]">שאלה {i + 1} · {KIND_LABELS[q.kind]}</p>
    <p className="text-lg font-bold">{q.q}</p>
    {q.f && <p dir="ltr" className="my-2 text-center text-2xl font-black tracking-wide">{q.f}</p>}
    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={`תשובות לשאלה ${i + 1}`}>
      {q.options.map((o, k) => {
        const right = checked && k === q.answer, wrong = checked && pick === k && k !== q.answer
        return <button key={k} type="button" role="radio" aria-checked={pick === k} disabled={checked} onClick={() => onPick(k)}
          className={`min-h-[48px] rounded-xl border-2 px-3 font-bold ${right ? 'border-green-600 bg-green-100' : wrong ? 'border-red-500 bg-red-100' : pick === k ? 'border-slate-800 bg-[var(--yellow)]' : 'border-[var(--border)] bg-[var(--card)]'}`}>
          <span className="text-[var(--muted-foreground)]">{LETTERS[k]}.</span> <span dir="ltr">{o}</span>
        </button>
      })}
    </div>
    {checked && <p className="mt-3 rounded-xl bg-[var(--muted)]/20 p-3">{pick === q.answer ? '✅ ' : pick == null ? '⬜ לא נענתה. ' : '❌ '}{q.explain}</p>}
  </li>
}

function PrintSheets({ qs }) {
  const pages = []
  for (let i = 0; i < qs.length; i += 8) pages.push(qs.slice(i, i + 8))
  return <>
    {pages.map((chunk, p) => <article key={p} className="buga-a4"><div className="print-art" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: '6mm 8mm' }}>
      {p === 0 && <><h2 style={{ textAlign: 'center', fontSize: '20pt', margin: 0 }}>תרגול לקראת מבחן בר־אילן — כיתה ה׳</h2><p style={{ textAlign: 'center', margin: '2mm 0 4mm' }}>שם: ______________ · זמן: שעה · מקיפים את התשובה הנכונה</p></>}
      <ol start={p * 8 + 1} style={{ margin: 0, paddingInlineStart: '7mm' }}>{chunk.map(q => <li key={q.id} style={{ marginBottom: '4mm', fontSize: '12pt' }}>
        <div style={{ fontWeight: 700 }}>{q.q}</div>
        {q.f && <div dir="ltr" style={{ textAlign: 'center', fontSize: '15pt', fontWeight: 800 }}>{q.f}</div>}
        <div style={{ display: 'flex', gap: '8mm', marginTop: '1mm' }}>{q.options.map((o, k) => <span key={k}>{LETTERS[k]}. <span dir="ltr">{o}</span></span>)}</div>
      </li>)}</ol>
    </div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}
    <article className="buga-a4"><div className="print-art" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: '6mm 8mm' }}>
      <h2 style={{ textAlign: 'center', fontSize: '18pt', margin: '0 0 4mm' }}>דף תשובות והסברים</h2>
      <ol style={{ margin: 0, paddingInlineStart: '7mm', fontSize: '10pt' }}>{qs.map(q => <li key={q.id} style={{ marginBottom: '1.6mm' }}><b>{LETTERS[q.answer]} ({q.options[q.answer]})</b> — {q.explain}</li>)}</ol>
    </div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
  </>
}

const FAQ = [
  { q: 'מה זה מבחן בר־אילן לכיתה ה׳?', a: 'זה מבחן המיון לתוכנית לנוער מוכשר במתמטיקה של אוניברסיטת בר־אילן. לפי מכוני ההכנה, נבחנים בו בכיתה ה׳ לקראת תוכנית שמתחילה בכיתה ו׳, והוא כולל כ־24 שאלות אמריקאיות בשעה. את המועדים ותנאי ההרשמה המדויקים כדאי לבדוק באתר האוניברסיטה.' },
  { q: 'אילו נושאים יש במבחן?', a: 'לפי חומרי ההכנה הנפוצים: סדר פעולות חשבון, שברים, אומדן, פעולות מומצאות (פעולה חדשה שמוגדרת בשאלה), סדרות, ובעיות היגיון ומילוליות. התרגול כאן מכסה את כל אלה.' },
  { q: 'איך מתכוננים בלי קורס בתשלום?', a: 'פותרים מבחן מלא בזמן אמת, קוראים את ההסבר לכל טעות ומתרגלים שוב את סוג השאלה. כל לחיצה כאן יוצרת מבחן חדש, כך שאפשר לתרגל כמה שרוצים, בחינם.' },
  { q: 'זה המבחן האמיתי?', a: 'לא. אלה שאלות תרגול שכתבנו בסגנון הנושאים של המבחן. אין לנו קשר לאוניברסיטת בר־אילן, והשאלות האמיתיות שונות.' },
]

export default function BarIlanPage() {
  const [seed, setSeed] = useState(null)
  const [count, setCount] = useState(24)
  const [picks, setPicks] = useState({})
  const [checked, setChecked] = useState(false)
  const [printSeed, setPrintSeed] = useState(null)
  const qs = seed ? makeTest(seed, count) : []
  const start = n => { setCount(n); setSeed(newSeed()); setPicks({}); setChecked(false); window.scrollTo?.({ top: 0 }) }
  const score = qs.filter(q => picks[q.id] === q.answer).length
  const answered = Object.keys(picks).length

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH} title="מבחן בר־אילן לכיתה ה׳ — תרגול חינם לנוער מוכשר במתמטיקה" structuredData={faqSchema(FAQ)}
      description="תרגול חינם לקראת מבחן המיון של בר־אילן לנוער מוכשר במתמטיקה בכיתה ה׳: 24 שאלות אמריקאיות בשעה — סדר פעולות, שברים, אומדן, פעולות מומצאות והיגיון. מבחן חדש בכל לחיצה, עם הסברים ודף להדפסה." />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'הכנה למבחן מחוננים', href: '/learn/gifted-test' }, { label: 'מבחן בר־אילן לכיתה ה׳' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🧮 תרגול למבחן בר־אילן — כיתה ה׳</h1>
    <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">מבחן חדש בכל לחיצה: 24 שאלות אמריקאיות, שעון של שעה והסבר לכל תשובה. בחינם ובלי הרשמה.</p>

    {!seed && <div className="mx-auto mb-8 max-w-2xl space-y-4 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 text-center sketch-shadow-sm">
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => start(24)} className="min-h-[52px] rounded-xl bg-violet-700 px-6 text-lg font-black text-white">⏱️ מבחן מלא — 24 שאלות</button>
        <button type="button" onClick={() => start(8)} className="min-h-[52px] rounded-xl border-2 border-slate-800 bg-white px-6 text-lg font-bold">✏️ תרגול קצר — 8 שאלות</button>
        <button type="button" onClick={() => setPrintSeed(newSeed())} className="min-h-[52px] rounded-xl bg-red-500 px-6 text-lg font-bold text-white">🖨️ מבחן להדפסה + תשובות</button>
      </div>
      <p className="text-sm">הנושאים: {Object.values(KIND_LABELS).join(' · ')}</p>
    </div>}

    {seed && <>
      <div className="sticky top-2 z-10 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-2">
        <span className="font-bold">{checked ? `ציון: ${score} מתוך ${qs.length}` : `ענית על ${answered} מתוך ${qs.length}`}</span>
        {count === 24 && <Timer key={seed} minutes={60} stopped={checked} />}
      </div>
      <ol className="space-y-4">{qs.map((q, i) => <Question key={q.id} q={q} i={i} pick={picks[q.id]} checked={checked} onPick={k => setPicks(p => ({ ...p, [q.id]: k }))} />)}</ol>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!checked
          ? <button type="button" onClick={() => { setChecked(true); window.scrollTo?.({ top: 0, behavior: 'smooth' }) }} className="min-h-[52px] rounded-xl bg-green-600 px-8 text-lg font-black text-white">✔️ בדיקה</button>
          : <>
            <p className="w-full text-center text-2xl font-black">{score} מתוך {qs.length} {score === qs.length ? '🌟' : score >= qs.length * 0.75 ? '👏' : '💪'}</p>
            <button type="button" onClick={() => start(count)} className="min-h-[52px] rounded-xl bg-violet-700 px-6 text-lg font-black text-white">🔁 מבחן חדש</button>
          </>}
        <button type="button" onClick={() => setPrintSeed(seed)} className="min-h-[52px] rounded-xl border-2 border-slate-800 bg-white px-6 font-bold">🖨️ להדפיס את המבחן הזה</button>
        <button type="button" onClick={() => setSeed(null)} className="min-h-[52px] rounded-xl border-2 border-[var(--border)] bg-white px-6 font-bold">חזרה</button>
      </div>
    </>}

    {printSeed && <PrintPreview title="תרגול למבחן בר־אילן — כיתה ה׳" onClose={() => setPrintSeed(null)}><PrintSheets qs={makeTest(printSeed, seed && printSeed === seed ? count : 24)} /></PrintPreview>}

    <div className="mt-12"><SeoBody
      paragraphs={[
        'התוכנית לנוער מוכשר במתמטיקה של אוניברסיטת בר־אילן ממיינת תלמידים במבחן קבלה. לפי מכוני ההכנה, מבחן המיון לתוכנית ההעשרה נערך בכיתה ה׳, ותלמיד שלא נבחן אז יכול לנסות שוב בכיתה ו׳. הוא כולל כ־24 שאלות אמריקאיות בשעה, כלומר בערך שתי דקות וחצי לשאלה.',
        'השאלות בודקות חשיבה מתמטית ולא רק חישוב: סדר פעולות, שברים, אומדן מהיר, "פעולות מומצאות" שבהן השאלה מגדירה פעולה חדשה, סדרות ובעיות היגיון. כאן כל לחיצה יוצרת מבחן חדש עם הסבר מלא לכל תשובה, ואפשר גם להדפיס אותו עם דף תשובות.',
        'אלה שאלות תרגול שכתבנו, לא שאלות מהמבחן האמיתי, ואין לנו קשר לאוניברסיטה. את המועדים, ההרשמה והתנאים המדויקים בודקים באתר בר־אילן.',
      ]}
      faq={FAQ}
      related={[{ label: 'הכנה למבחן מחוננים', href: '/learn/gifted-test' }, { label: 'סימולציה של מבחן מחוננים', href: '/learn/gifted-test/simulation' }, { label: 'חשבון לכיתה ה׳', href: '/math/grade-5' }, { label: 'דפי עבודה בשברים', href: '/printables/fractions-worksheets' }]}
    /></div>
    <p className="mt-6 text-center"><Link to="/learn/gifted-test" className="font-bold underline">← לכל ההכנה למבחני מחוננים</Link></p>
  </div>
}
