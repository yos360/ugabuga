import { englishCounterpart } from '../../en/englishLinks'
import { Link, useParams } from 'react-router-dom'
import PrintableShell from '../../components/printables/PrintableShell'
import BackLink from '../../components/ui/BackLink'
import NotFound from '../NotFound'
import { COLORING_SUBJECTS, coloringFmt, coloringSrc } from '../../data/coloringSubjects'
import { findColoringDrawing, coloringDrawingPath, coloringDrawingTitle, coloringDrawingDescription, moreColoringDrawings, relatedColoringSubjects, coloringDrawingGuide } from '../../data/coloringDrawings'

const h2 = 'mb-2 mt-6 text-2xl font-bold'
const card = 'rounded-2xl border-2 border-slate-200 bg-white p-3 text-center hover:border-pink-300'

// The page-specific guide: level, tools, where the drawing sits in its subject and what to colour next.
function DrawingGuide({ g }) {
  const { drawing, subject: s } = g
  const next = [g.simpler && { d: g.simpler, why: `פשוט יותר · מגיל ${g.simpler.range.min}` }, g.harder && { d: g.harder, why: `מאתגר יותר · ${g.harder.ages}` }].filter(Boolean)
  return <section className="no-print mx-auto mt-10 max-w-3xl" dir="rtl" aria-labelledby="drawing-guide-title">
    <h2 id="drawing-guide-title" className={h2}>למי מתאים „{drawing.name}” ובמה לצבוע</h2>
    <p className="leading-relaxed">{g.tools}</p>
    <ul className="mt-3 list-disc space-y-1 pr-6">
      <li><b>מה רואים בציור:</b> {drawing.description}</li>
      <li><b>טיפ לצביעה:</b> {drawing.tip}</li>
      <li><b>אחרי הצביעה:</b> {drawing.activity}</li>
    </ul>
    {next.length > 0 && <>
      <h2 className={h2}>להמשיך באותו נושא: פשוט יותר או מאתגר יותר</h2>
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">{next.map(({ d, why }) =>
        <Link key={d.n} to={coloringDrawingPath(s.slug, d.n)} className={card}>
          <img src={coloringSrc(s.slug, d.n, 'webp')} alt={d.name} loading="lazy" width="400" height="400" className="aspect-square w-full object-contain" />
          <span className="mt-2 block font-bold">{d.name}</span><small className="text-slate-500">{why}</small>
        </Link>)}</div>
    </>}
    {g.sameAge.length > 0 && <p className="mt-4 leading-relaxed"><b>באותו טווח גיל ({drawing.ages}) בנושא {s.name}:</b> {g.sameAge.map((d, i) => <span key={d.n}>{i ? ', ' : ''}<Link to={coloringDrawingPath(s.slug, d.n)} className="underline">{d.name}</Link></span>)}.</p>}
    <h2 className={h2}>ציורים מנושאים קרובים שמתאימים לאותו גיל</h2>
    <div className="grid grid-cols-3 gap-4">{g.cross.map(({ subject, drawing: d }) =>
      <Link key={subject.slug} to={coloringDrawingPath(subject.slug, d.n)} className={card}>
        <img src={coloringSrc(subject.slug, d.n, 'webp')} alt={d.name} loading="lazy" width="400" height="400" className="aspect-square w-full object-contain" />
        <span className="mt-2 block font-bold">{d.name}</span><small className="text-slate-500">{subject.emoji} {subject.name} · {d.ages}</small>
      </Link>)}</div>
  </section>
}

export default function ColoringDrawing() {
  const { subject, n } = useParams()
  const s = COLORING_SUBJECTS.find(item => item.slug === subject)
  const drawing = findColoringDrawing(subject, n)
  if (!s || !drawing) return <NotFound />
  const path = coloringDrawingPath(s.slug, drawing.n)
  const title = coloringDrawingTitle(drawing)
  const related = relatedColoringSubjects(s.slug)
  const more = moreColoringDrawings(s.slug, drawing.n)
  const guide = coloringDrawingGuide(s.slug, drawing.n)
  const faq = [
    { q: `למי מתאים הציור של ${drawing.name}?`, a: `המלצת הגיל היא ${drawing.ages}, בהתאם לכמות הפרטים. זו הכוונה בלבד: אפשר לבחור לפי העניין והנוחות של מי שצובע. ${drawing.tip}` },
    ...guide.faq,
    { q: `איזו פעילות אפשר לשלב עם הציור של ${drawing.name}?`, a: drawing.activity },
    { q: `איך מדפיסים את ${drawing.name} או שומרים כ-PDF?`, a: 'פותחים את תצוגת ההדפסה ובוחרים הדפסה או הורדה כ-PDF. הציור מופיע לבדו על דף A4 לאורך. בהדפסה מומלץ לבטל כותרות עליונות ותחתונות בחלון המדפסת.' },
    ...(s.slug === 'purim-masks' ? [{ q: 'איך הופכים את הציור למסכה?', a: 'אחרי הצביעה אפשר להדביק על קרטון ולגזור בעזרת מבוגר. מבוגר יגזור את פתחי העיניים; בדקו התאמה לפנים לפני חיבור מקל או גומייה.' }] : []),
  ]
  return <>
    <PrintableShell counterpartPath={englishCounterpart(path)} key={path} path={path} seoTitle={title} h1={title} description={coloringDrawingDescription(drawing)}
      image={coloringSrc(s.slug, drawing.n, 'webp')} emoji={s.emoji}
      sub={`ציור לצביעה · מומלץ לגילאי ${drawing.ages} · חינם להדפסה ולשמירה כ-PDF`}
      intro={<p className="mx-auto mb-6 max-w-3xl text-center leading-relaxed">{guide.intro}</p>}
      crumbs={[{ label: 'דפי צביעה', href: '/printables/coloring' }, { label: s.name, href: `/printables/coloring/${s.slug}` }]}
      pages={[{ key: path, svg: <img src={coloringSrc(s.slug, drawing.n, coloringFmt(s))} alt={drawing.name} className="block h-auto w-full object-contain" /> }]}
      printTitle={drawing.name} printLabel="הדפסה או הורדה כ-PDF"
      after={<DrawingGuide g={guide} />}
      faq={faq}
      related={[{ label: `כל דפי הצביעה בנושא ${s.name}`, href: `/printables/coloring/${s.slug}` }, ...(s.holiday ? [s.holiday] : []), ...related.map(item => ({ label: `דפי צביעה ${item.name}`, href: `/printables/coloring/${item.slug}` }))]}
      extra={<BackLink to={`/printables/coloring/${s.slug}`} className="block py-2 font-bold underline">חזרה לכל ציורי {s.name}</BackLink>} />
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
