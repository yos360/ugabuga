import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { COLORING_SUBJECTS, coloringSrc, coloringFmt } from '../../data/coloringSubjects'

// Subject grid for the coloring hub: one card per subject, linking to its own page.
export function ColoringSubjectsGrid({ exclude, title = 'דפי צביעה לפי נושא' }) {
  const list = COLORING_SUBJECTS.filter(s => s.slug !== exclude)
  return <section className="no-print my-8">
    <h2 className="mb-4 text-center text-3xl font-black">{title}</h2>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{list.map(s =>
      <Link key={s.slug} to={`/printables/coloring/${s.slug}`} className="group rounded-3xl border-2 border-slate-200 bg-white p-2 text-center shadow-sm transition hover:-translate-y-1 hover:border-pink-300">
        <img src={coloringSrc(s.slug, 1, 'webp')} alt={`דף צביעה ${s.name}`} loading="lazy" width="400" height="400" className="aspect-square w-full rounded-2xl object-contain" />
        <b className="mt-1 block text-lg">{s.emoji} {s.name}</b><small className="text-slate-500">{s.items.length} דפים</small>
      </Link>)}</div>
  </section>
}

export default function ColoringSubject() {
  const { subject } = useParams()
  const s = COLORING_SUBJECTS.find(x => x.slug === subject)
  const [printing, setPrinting] = useState(null) // array of 1-based numbers
  if (!s) return <NotFound />
  const all = s.items.map((_, i) => i + 1)
  const faq = [
    { q: `איך מדפיסים את דפי הצביעה של ${s.name}?`, a: 'לוחצים על ציור כדי להדפיס רק אותו, או על "הדפסת כל הדפים" כדי לקבל את כולם — כל ציור על דף A4 מלא. בטלפון אפשר ללחוץ "הורדה כ-PDF" ולהדפיס אחר כך.' },
    { q: 'הדפים בחינם?', a: 'כן, כל דפי הצביעה באתר חינמיים לשימוש אישי, בבית, בגן ובכיתה — בלי הרשמה.' },
    { q: 'הציור יוצא חד בהדפסה?', a: 'כן. הקווים שחורים ונקיים, בלי טשטוש ובלי רקע אפור, והציור ממלא דף A4 שלם.' },
  ]
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={s.h1} description={s.desc} path={`/printables/coloring/${s.slug}`} image={coloringSrc(s.slug, 1, 'webp')} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: s.name }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 font-bold">{s.items.length} דפי צביעה · חינם</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{s.emoji} </span>{s.h1}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-slate-600">{s.intro}</p>
      <button type="button" data-print-main onClick={() => setPrinting(all)} className="mt-5 min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white">🖨️ הדפסת כל {s.items.length} הדפים</button>
    </header>
    <section className="no-print mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">{s.items.map((alt, i) =>
      <figure key={alt} className="group rounded-3xl border-2 border-slate-200 bg-white p-3 shadow-sm">
        <button type="button" onClick={() => setPrinting([i + 1])} className="block w-full" aria-label={`הדפסה: ${alt}`}>
          <img src={coloringSrc(s.slug, i + 1, 'webp')} alt={`דף צביעה: ${alt}`} loading={i < 3 ? 'eager' : 'lazy'} width="400" height="400" className="aspect-square w-full object-contain" />
        </button>
        <figcaption className="mt-2 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between"><b className="text-right leading-snug">{alt}</b>
          <button type="button" onClick={() => setPrinting([i + 1])} className="shrink-0 rounded-xl bg-pink-100 px-3 py-2 text-sm font-bold">🖨️ הדפסה</button></figcaption>
      </figure>)}</section>
    {printing && <PrintPreview title={printing.length === 1 ? s.items[printing[0] - 1] : `${s.h1} — ${printing.length} דפים`} onClose={() => setPrinting(null)}>
      {printing.map(n => <article className="buga-a4" key={n}><div className="print-art"><img src={coloringSrc(s.slug, n, coloringFmt(s))} alt={s.items[n - 1]} /></div></article>)}
    </PrintPreview>}
    <ColoringSubjectsGrid exclude={s.slug} title="עוד דפי צביעה לפי נושא" />
    <div className="mt-6"><SeoBody paragraphs={[s.desc, s.fmt ? 'כל הציורים בעמוד הזה מקוריים ומצוירים במיוחד לצביעה: קווים דקים ומדויקים עם הרבה פרטים, שמתאימים לטושים דקים או לצבעי עיפרון מחודדים, ורקע לבן נקי שלא מבזבז דיו. כל ציור מודפס על דף A4 שלם.' : `כל הציורים בעמוד הזה מקוריים ומצוירים במיוחד לצביעה: קווי מתאר שחורים ועבים, שטחים גדולים שנוח למלא בטושים או בצבעי עיפרון, ורקע לבן נקי שלא מבזבז דיו. כל ציור מודפס על דף A4 שלם.`, 'אפשר להדפיס ציור אחד או את כולם יחד, להוריד כ-PDF מהטלפון, ולשלוח לחברים או לקבוצת הגן בוואטסאפ. בתחתית כל דף יש קוד QR שמחזיר בדיוק לעמוד הזה — למי שירצה עוד.']} faq={faq} related={[...(['sufganiyah', 'dreidel', 'hanukkiah'].includes(s.slug) ? [{ label: 'הכול לחנוכה', href: '/holidays/hanukkah' }] : []), ...(s.related || []), { label: 'כל דפי הצביעה', href: '/printables/coloring' }, ...(s.related ? [] : [{ label: 'מנדלות להדפסה', href: '/printables/mandalas' }]), { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}
