import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { WINTER_ART, WINTER_SHEETS } from '../../components/seasons/WinterPrint'

// /printables/winter — winter & rain colouring pages and worksheets for kindergarten and grade 1.
const FAQ = [
  { q: 'אילו דפים לחורף יש כאן?', a: '6 דפי צביעה (מטרייה בגשם, ענן גשום, מגפיים בשלולית, קשת בענן, איש שלג ו"משיב הרוח ומוריד הגשם") ו־4 דפי עבודה: ספירת טיפות, "מה לובשים בחורף?", התאמה ומילים של חורף.' },
  { q: 'לאיזה גיל?', a: 'לגן ולכיתה א׳. דפי הצביעה בקווים עבים מתאימים גם לגיל 3.' },
]
function Gallery({ title, list, onPrint }) {
  return <section className="mb-10">
    <h2 className="mb-3 text-2xl font-bold">{title}</h2>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{list.map(item => <button key={item.id} type="button" onClick={() => onPrint([item])} aria-label={`הדפיסו: ${item.name}`}
      className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
      <div className="aspect-[600/820]"><item.C /></div>
      <p className="mt-1 font-bold">{item.name}{item.age ? <span className="text-sm font-normal"> · {item.age}</span> : null}</p>
    </button>)}</div>
  </section>
}
export default function WinterPrintables() {
  const [print, setPrint] = useState(null)
  const all = [...WINTER_ART, ...WINTER_SHEETS]
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="דפי עבודה לחורף לגן — צביעה, ספירת טיפות וגשם, להדפסה" description="דפי עבודה ודפי צביעה לחורף לגן ולכיתה א׳: מטרייה בגשם, ענן גשום, קשת בענן, איש שלג, ספירת טיפות, מה לובשים בחורף ו'משיב הרוח ומוריד הגשם' — להדפסה בחינם." path="/printables/winter" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'חורף וגשם' }]} />
    <h1 className="mb-2 text-center text-4xl font-black sm:text-5xl">🌧️ דפי חורף וגשם לגן</h1>
    <p className="mb-5 text-center text-lg text-[var(--muted-foreground)]">6 דפי צביעה ו־4 דפי עבודה — ספירה, התאמה, כתיבה ו"מה לובשים בחורף"</p>
    <div className="mb-8 text-center"><button data-print-main type="button" onClick={() => setPrint(all)} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🖨️ הדפיסו את כל {all.length} הדפים</button></div>
    <Gallery title="🖍️ דפי צביעה לחורף" list={WINTER_ART} onPrint={setPrint} />
    <Gallery title="✏️ דפי עבודה לחורף" list={WINTER_SHEETS} onPrint={setPrint} />
    <SeoBody paragraphs={['החורף מגיע לגן עם גשם, מטריות ומגפיים. דפי החורף כאן משלבים את מה שהילדים רואים בחוץ עם ספירה, קריאה וכתיבה: סופרים טיפות, מתאימים תמונה למילה ומקיפים את בגדי החורף. דף "משיב הרוח ומוריד הגשם" מתאים לפתיחת עונת הגשמים בגן.']} faq={FAQ} related={[{ label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'מה עושים ביום גשום', href: '/ideas/what-to-do-rainy-day' }, { label: 'חנוכה — יצירה לגזירה', href: '/holidays/hanukkah/crafts' }]} />
    {print && <PrintPreview title="דפי חורף" onClose={() => setPrint(null)}>{print.map(item => <article className="buga-a4" key={item.id}><div className="print-art"><item.C /></div></article>)}</PrintPreview>}
  </div>
}
