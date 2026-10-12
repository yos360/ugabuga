import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { gematriaOf } from '../../utils/calc'

// Gematria calculator (/tools/gematria): standard values; final letters count like regular ones.
const FAQ = [
  { q: 'מה זו גימטריה?', a: 'שיטה שבה לכל אות עברית יש ערך מספרי: א=1, ב=2 … י=10, כ=20 … ק=100 ועד ת=400. מחברים את ערכי האותיות ומקבלים את הגימטריה של המילה.' },
  { q: 'כמה שווה האותיות הסופיות?', a: 'בחישוב הרגיל (מספר הכרחי) ך ם ן ף ץ שוות לאותיות הרגילות: כ=20, מ=40, נ=50, פ=80, צ=90.' },
  { q: 'מה הגימטריה של "חי"?', a: 'ח=8 ועוד י=10 — 18. לכן נהוג לתת מתנות בכפולות של 18.' },
]
export default function Gematria() {
  const [text, setText] = useState('עוגה בוגה')
  const g = gematriaOf(text)
  return <div className="mx-auto max-w-2xl px-4 py-8" dir="rtl">
    <SEO title="מחשבון גימטריה — חישוב גימטריה של שם או מילה" description="מחשבון גימטריה: מקלידים שם, מילה או משפט ומקבלים את הערך בגימטריה, עם פירוט של כל אות. א=1 ועד ת=400, אותיות סופיות כרגילות. חינם." path="/tools/gematria" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מחשבון גימטריה' }]} />
    <h1 className="mb-2 text-center text-4xl font-black">🔢 מחשבון גימטריה</h1>
    <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">מקלידים שם או מילה — ומקבלים את הערך בגימטריה</p>
    <input value={text} onChange={e => setText(e.target.value.slice(0, 60))} aria-label="שם או מילה" className="mx-auto block w-full max-w-md rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-center text-2xl" />
    <div className="mx-auto mt-6 max-w-md rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 text-center sketch-shadow" aria-live="polite">
      <p className="text-6xl font-black">{g.total}</p>
      <p className="mt-3 flex flex-wrap justify-center gap-2">{g.letters.map(([c, v], i) => <span key={i} className="rounded-lg bg-white px-2 py-1 text-lg"><b>{c}</b>={v}</span>)}</p>
    </div>
    <p className="mt-6 text-center"><Link to="/printables/hebrew-letters" className="underline">אותיות בעברית להדפסה</Link> · <Link to="/tools/age-calculator" className="underline">בן כמה אני?</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['בגימטריה לכל אות יש ערך: האותיות א–ט הן האחדות (1–9), י–צ העשרות (10–90) ו־ק–ת המאות (100–400). מחברים את כל האותיות במילה ומקבלים מספר. ילדים אוהבים לחשב את הגימטריה של השם שלהם ולגלות למי עוד יש אותו מספר.']} faq={FAQ} /></div>
  </div>
}
