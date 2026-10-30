import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { BOOKLETS, bookletBySlug, bookletHref } from '../../booklets/registry'
import { newSeed } from '../../motor/rng'
import { CHANNEL_GO } from '../../data/brand'
import './booklets.css'

// /booklets — every downloadable workbook; /booklets/:slug — one workbook: what's inside, a peek at the
// first pages, and the full booklet in PrintPreview (print or save as PDF).
const CRUMB = { label: 'חוברות עבודה להדפסה', href: '/booklets' }
const button = 'inline-flex min-h-[48px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-black'

function useBooklet(b) {
  const [Booklet, setBooklet] = useState(null)
  useEffect(() => { let live = true; b.load().then(m => { if (live) setBooklet(() => m.default) }); return () => { live = false } }, [b])
  return Booklet
}

function Card({ b }) {
  return <Link to={bookletHref(b)} className="booklet-card wobbly flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-sm transition-transform hover:-translate-y-1">
    <span className="text-4xl" aria-hidden="true">{b.emoji}</span>
    <h2 className="mt-1 text-2xl font-bold">{b.title}</h2>
    <p className="text-sm font-bold text-[var(--muted-foreground)]">{b.audience} · {b.pages.length} עמודים · PDF</p>
    <p className="mt-2 flex-1 text-[var(--muted-foreground)]">{b.pages.slice(1, 6).join(' · ')}…</p>
    <span className="mt-3 font-bold underline decoration-dashed">לחוברת ←</span>
  </Link>
}

export function BookletsHub() {
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="חוברות עבודה להדפסה — PDF בחינם לגן ולבית הספר" description={`חוברות עבודה להדפסה בחינם: ${BOOKLETS.map(b => b.title).join(', ')}. כל חוברת להורדה כ־PDF, עם תעודת סיום.`} path="/booklets" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: CRUMB.label }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📚 </span>חוברות עבודה להדפסה</h1>
    <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">חוברות שלמות לפי כיתה ונושא, להדפסה או לשמירה כ־PDF. בכל חוברת יש שער עם שם הילד, עמודי תרגול מגוונים ותעודת סיום.</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{BOOKLETS.map(b => <Card key={b.slug} b={b} />)}</div>
    <div className="mt-10"><SeoBody paragraphs={[
      'חוברת עבודה נותנת לילד משהו שדף בודד לא נותן: התחלה, אמצע וסוף. יש שער שכותבים עליו את השם, עמודים שמתקדמים בהדרגה, ותעודה בסוף שאפשר לתלות על המקרר.',
      'כל החוברות כאן בחינם ובלי הרשמה. פותחים את החוברת, רואים את כל העמודים בתצוגה מקדימה, ובוחרים אם להדפיס או לשמור כ־PDF ולשלוח לטלפון או למורה.',
    ]} related={[{ label: 'כל הדפים להדפסה', href: '/printables' }, { label: 'חוברת הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'דפי עבודה לגן חובה', href: '/printables/kindergarten-worksheets' }]} /></div>
  </div>
}

// Booklets made from a visitor's request (registry `onRequest`): say so, and offer ways to get the next one —
// the WhatsApp channel first, the weekly mail (the footer signup) second, and asking for a page of your own.
function RequestedBox() {
  return <section className="mt-8 rounded-3xl border-2 border-violet-200 bg-violet-50 p-5 text-center no-print" aria-label="הוכן לפי בקשה">
    <p className="text-xl font-black">💛 החוברת הזאת נולדה מבקשה ששלחו לנו באתר</p>
    <p className="mt-1">ככה זה עובד אצלנו: מבקשים — ואנחנו מכינים, בחינם, לכולם. רוצים לקבל את החוברת הבאה?</p>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <a href={CHANNEL_GO} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center rounded-2xl bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-700">📢 דף חדש כל יום בערוץ הוואטסאפ</a>
      <Link to="#mail-signup" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold">📬 הדפים של השבוע במייל</Link>
      <Link to="/request" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold">📝 גם לכם חסר משהו? בקשו</Link>
    </div>
  </section>
}

function BookletView({ b }) {
  const Booklet = useBooklet(b)
  const [seed, setSeed] = useState(null)
  const others = BOOKLETS.filter(o => o.slug !== b.slug)
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title={b.seoTitle} description={b.description} path={bookletHref(b)} structuredData={faqSchema(b.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, CRUMB, { label: b.title }]} />
    <header className="rounded-[32px] border-2 border-[var(--border)] bg-[var(--postit)] p-6 text-center sketch-shadow-sm sm:p-10">
      <div className="text-6xl" aria-hidden="true">{b.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">{b.title}</h1>
      <p className="mt-2 font-bold">{b.audience} · {b.subject} · {b.pages.length} עמודים · להדפסה או להורדה כ־PDF</p>
      <p className="mx-auto mt-3 max-w-2xl text-lg">{b.intro}</p>
      <button type="button" onClick={() => setSeed(newSeed())} className={`${button} mt-5 bg-violet-600 text-white shadow-[0_4px_0_#5b21b6]`}>📘 לחוברת המלאה — הדפסה או PDF</button>
    </header>
    <section className="mt-8" aria-label="מה יש בחוברת">
      <h2 className="text-2xl font-bold">מה יש בחוברת?</h2>
      <ol className="mt-3 grid list-decimal gap-x-8 gap-y-1 pr-6 sm:grid-cols-2">{b.pages.map(p => <li key={p}>{p}</li>)}</ol>
    </section>
    <section className="mt-8" aria-label="הצצה לעמודים הראשונים">
      <h2 className="text-2xl font-bold">הצצה לחוברת</h2>
      <div className="booklet-peek mt-3">{Booklet ? <Booklet seed={1} /> : <p>טוענים את העמודים…</p>}</div>
      <button type="button" onClick={() => setSeed(newSeed())} className={`${button} mt-4 bg-slate-900 text-white`}>🖨️ לכל {b.pages.length} העמודים</button>
    </section>
    {b.onRequest && <RequestedBox />}
    {seed && Booklet && <PrintPreview title={`${b.title} — ${b.pages.length} עמודים`} onClose={() => setSeed(null)}><Booklet seed={seed} /></PrintPreview>}
    {others.length > 0 && <section className="mt-10"><h2 className="text-2xl font-bold">חוברות נוספות</h2><div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{others.map(o => <Card key={o.slug} b={o} />)}</div></section>}
    <div className="mt-10"><SeoBody paragraphs={b.paragraphs} faq={b.faq} related={b.related} /></div>
  </div>
}

export function BookletPage() {
  const { slug } = useParams(), b = bookletBySlug(slug)
  return b ? <BookletView key={b.slug} b={b} /> : <NotFound />
}
