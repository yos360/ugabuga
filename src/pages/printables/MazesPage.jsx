import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import ActivitySvg from '../../motor/render/ActivitySvg'
import { newSeed } from '../../motor/rng'
import { MAZE_LEVELS, MAZE_THEMES, readyMaze, freshMaze } from './mazeData'
import './fine-motor.css'

// /printables/mazes — 30 ready mazes (5 levels × 6 themes) from fixed seeds, so the same maze is
// printed every time and the page is indexable; plus "a new maze" per level. Every maze is a
// perfect maze (exactly one route), so it is always solvable.
function Sheet({ maze, level, solution }) {
  return (
    <article className="buga-a4 motor-sheet">
      <h2>{solution ? `פתרון: ${maze.title}` : maze.title}</h2>
      {!solution && <p className="art-caption motor-caption"><span>{maze.instruction} · רמה: {level.label}</span><span className="motor-name">שם: ______________</span></p>}
      <div className="print-art"><ActivitySvg activity={maze} showSolution={solution} /></div>
      <footer>עוגה בוגה · מבוכים להדפסה · ugabuga.co.il</footer>
    </article>
  )
}

const FAQ = [
  { q: 'כל מבוך באמת פתיר?', a: 'כן. המבוכים נבנים באלגוריתם שיוצר "מבוך מושלם" — יש בדיוק דרך אחת מהכניסה ליציאה, בלי מעגלים ובלי אזורים סגורים. לכל מבוך יש גם דף פתרון.' },
  { q: 'איזו רמה מתאימה לאיזה גיל?', a: 'קל מאוד — לגן, עם מעברים רחבים ומעט פניות. קל — לכיתה א׳. בינוני — לכיתות ב׳–ג׳. קשה — לכיתות ד׳–ו׳. קשה מאוד — לילדים גדולים ולמבוגרים שאוהבים אתגר.' },
  { q: 'אפשר לקבל עוד מבוכים?', a: 'כן. בכל רמה יש כפתור "מבוך חדש" שבונה מבוך שלא היה קודם — אפשר להדפיס כמה שרוצים, בחינם.' },
  { q: 'איך מדפיסים את הפתרון?', a: 'מסמנים "להדפיס גם פתרונות" לפני ההדפסה, וכל מבוך יודפס עם דף פתרון אחריו — נוח למורים ולהורים.' },
]

export default function MazesPage() {
  const [li, setLi] = useState(0)
  const [extra, setExtra] = useState([]) // seeds of new mazes for the current level
  const [printing, setPrinting] = useState(null)
  const [withSolutions, setWithSolutions] = useState(false)
  const level = MAZE_LEVELS[li]
  const ready = useMemo(() => MAZE_THEMES.map((_, ti) => readyMaze(li, ti)), [li])
  const fresh = useMemo(() => extra.map(seed => freshMaze(li, seed)), [extra, li])
  const all = [...fresh, ...ready]
  const pick = i => { setLi(i); setExtra([]) }
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מבוכים להדפסה לילדים — 30 מבוכים ב-5 רמות קושי" description="מבוכים להדפסה בחינם: 30 מבוכים מוכנים ב-5 רמות — מגן ועד מבוגרים, עם דף פתרון לכל מבוך, וכפתור למבוך חדש בכל לחיצה. כל מבוך פתיר בוודאות." path="/printables/mazes" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'מבוכים' }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-cyan-100 px-4 py-2 font-bold">30 מבוכים מוכנים · מבוך חדש בכל לחיצה · חינם</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🌀 </span>מבוכים להדפסה</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-slate-600">בוחרים רמה, מדפיסים, ומתחילים לחפש את הדרך. לכל מבוך יש דרך אחת בדיוק — ודף פתרון למקרה שמישהו נתקע.</p>
    </header>
    <nav aria-label="רמת קושי" className="no-print mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">{MAZE_LEVELS.map((l, i) =>
      <button key={l.id} type="button" aria-pressed={li === i} onClick={() => pick(i)} className={`min-h-[72px] rounded-2xl border-2 p-2 font-bold ${li === i ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white'}`}>
        {l.label}<small className="block font-normal">{l.age}</small><small className="block" aria-hidden="true">{l.stars}</small>
      </button>)}</nav>
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrinting(all)} className="min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white">🖨️ הדפסת כל {all.length} המבוכים ברמה הזו</button>
      <button type="button" onClick={() => setExtra(e => [newSeed(), ...e])} className="min-h-[52px] rounded-xl bg-cyan-600 px-6 py-3 text-lg font-bold text-white">✨ מבוך חדש</button>
      <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={withSolutions} onChange={e => setWithSolutions(e.target.checked)} className="h-5 w-5" />להדפיס גם פתרונות</label>
    </div>
    <section className="no-print mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">{all.map((m, i) =>
      <figure key={`${li}-${i}-${m.cols}-${m.rows}-${m.title}`} className="rounded-3xl border-2 border-slate-200 bg-white p-3 shadow-sm">
        <button type="button" onClick={() => setPrinting([m])} className="block w-full" aria-label={`הדפסה: ${m.title}`}><ActivitySvg activity={m} /></button>
        <figcaption className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><b className="leading-snug">{m.title}{i < fresh.length ? ' ✨' : ''}</b>
          <button type="button" onClick={() => setPrinting([m])} className="shrink-0 rounded-xl bg-cyan-100 px-3 py-2 text-sm font-bold">🖨️ הדפסה</button></figcaption>
      </figure>)}</section>
    {printing && <PrintPreview title={printing.length === 1 ? printing[0].title : `מבוכים — ${level.label}`} onClose={() => setPrinting(null)}>
      {printing.flatMap((m, i) => [<Sheet key={`m${i}`} maze={m} level={level} />, ...(withSolutions ? [<Sheet key={`s${i}`} maze={m} level={level} solution />] : [])])}
    </PrintPreview>}
    <p className="no-print mt-6 text-center">רוצים מבוכים עם שמות ותבניות נוספות? <Link to="/printables/fine-motor" className="font-bold underline">מחולל המוטוריקה העדינה</Link></p>
    <div className="mt-6"><SeoBody paragraphs={[
      'מבוכים להדפסה הם אחת הפעילויות השקטות הכי אהובות — בבית, בכיתה, בנסיעה ובהמתנה לרופא. מבוך מתרגל תכנון, ריכוז וסבלנות, וגם שליטה בעיפרון: לעבור במעבר בלי לגעת בקיר.',
      'בעמוד יש 30 מבוכים מוכנים, 6 בכל רמה, עם נושאים שילדים אוהבים: חללית שמחפשת כוכב, כלבלב שמחפש עצם, דג, דינוזאור, מכונית ודבורה. ברמות הקלות המעברים רחבים והמבוך קטן; ברמות הקשות יש הרבה מבואות סתומים ופניות.',
      'כל המבוכים נבנים בקוד ולא בבינה מלאכותית, ולכן לכל מבוך יש בדיוק דרך אחת מההתחלה לסוף — אין מבוך שאי אפשר לפתור. הכפתור "מבוך חדש" יוצר מבוך שלא היה קודם, כך שאפשר להדפיס כמה שרוצים.',
    ]} faq={FAQ} related={[{ label: 'מוטוריקה עדינה', href: '/printables/fine-motor' }, { label: 'תפזורת', href: '/tools/word-search' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}
