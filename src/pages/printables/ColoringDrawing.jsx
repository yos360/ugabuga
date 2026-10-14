import { englishCounterpart } from '../../en/englishLinks'
import { Link, useParams } from 'react-router-dom'
import PrintableShell from '../../components/printables/PrintableShell'
import NotFound from '../NotFound'
import { COLORING_SUBJECTS, coloringFmt, coloringSrc } from '../../data/coloringSubjects'
import { findColoringDrawing, coloringDrawingPath, coloringDrawingTitle, coloringDrawingDescription, moreColoringDrawings, relatedColoringSubjects } from '../../data/coloringDrawings'

export default function ColoringDrawing() {
  const { subject, n } = useParams()
  const s = COLORING_SUBJECTS.find(item => item.slug === subject)
  const drawing = findColoringDrawing(subject, n)
  if (!s || !drawing) return <NotFound />
  const path = coloringDrawingPath(s.slug, drawing.n)
  const title = coloringDrawingTitle(drawing)
  const related = relatedColoringSubjects(s.slug)
  const more = moreColoringDrawings(s.slug, drawing.n)
  const faq = [
    { q: `למי מתאים הציור של ${drawing.name}?`, a: `המלצת הגיל היא ${drawing.ages}, בהתאם לכמות הפרטים. זו הכוונה בלבד: אפשר לבחור לפי העניין והנוחות של מי שצובע. ${drawing.tip}` },
    { q: `איזו פעילות אפשר לשלב עם הציור של ${drawing.name}?`, a: drawing.activity },
    { q: `איך מדפיסים את ${drawing.name} או שומרים כ-PDF?`, a: 'פותחים את תצוגת ההדפסה ובוחרים הדפסה או הורדה כ-PDF. הציור מופיע לבדו על דף A4 לאורך. בהדפסה מומלץ לבטל כותרות עליונות ותחתונות בחלון המדפסת.' },
    ...(s.slug === 'purim-masks' ? [{ q: 'איך הופכים את הציור למסכה?', a: 'אחרי הצביעה אפשר להדביק על קרטון ולגזור בעזרת מבוגר. מבוגר יגזור את פתחי העיניים; בדקו התאמה לפנים לפני חיבור מקל או גומייה.' }] : []),
  ]
  return <>
    <PrintableShell counterpartPath={englishCounterpart(path)} key={path} path={path} seoTitle={title} h1={title} description={coloringDrawingDescription(drawing)}
      image={coloringSrc(s.slug, drawing.n, 'webp')} emoji={s.emoji}
      sub={`ציור לצביעה · מומלץ לגילאי ${drawing.ages} · חינם להדפסה ולשמירה כ-PDF`}
      crumbs={[{ label: 'דפי צביעה', href: '/printables/coloring' }, { label: s.name, href: `/printables/coloring/${s.slug}` }]}
      pages={[{ key: path, svg: <img src={coloringSrc(s.slug, drawing.n, coloringFmt(s))} alt={drawing.name} className="block h-auto w-full object-contain" /> }]}
      printTitle={drawing.name} printLabel="הדפסה או הורדה כ-PDF"
      paragraphs={[drawing.description, drawing.tip]} faq={faq}
      related={[{ label: `כל דפי הצביעה בנושא ${s.name}`, href: `/printables/coloring/${s.slug}` }, ...related.map(item => ({ label: `דפי צביעה ${item.name}`, href: `/printables/coloring/${item.slug}` }))]}
      extra={<Link to={`/printables/coloring/${s.slug}`} className="block py-2 font-bold underline">חזרה לכל ציורי {s.name}</Link>} />
    <section className="no-print mx-auto mb-12 max-w-4xl px-4" dir="rtl" aria-labelledby="more-coloring-title">
      <h2 id="more-coloring-title" className="mb-4 text-2xl font-black">עוד ציורים בנושא {s.name}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{more.map(item =>
        <Link key={item.n} to={coloringDrawingPath(s.slug, item.n)} className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center hover:border-pink-300">
          <img src={coloringSrc(s.slug, item.n, 'webp')} alt={item.name} loading="lazy" width="400" height="400" className="aspect-square w-full object-contain" />
          <span className="mt-2 block font-bold">{item.name}</span>
        </Link>)}</div>
    </section>
  </>
}
