import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintableShell from '../../components/printables/PrintableShell'
import BackLink from '../../components/ui/BackLink'
import NotFound from '../NotFound'
import { COLORING_SUBJECTS } from '../../data/coloringSubjects'
import { HOW_TO_DRAW, findHowToDraw, howToDrawPath, howToDrawSrc, howToDrawTitle, howToDrawDescription } from '../../data/howToDraw'

const card = 'rounded-2xl border-2 border-slate-200 bg-white p-3 text-center hover:border-pink-300'

const FAQ = [
  { q: 'איך משתמשים בדף "איך מציירים"?', a: 'בכל דף יש שישה ריבועים ממוספרים. בכל ריבוע הקו החדש שחור, והשלבים שכבר ציירנו אפורים — כך רואים בדיוק מה מוסיפים עכשיו. מעתיקים שלב אחרי שלב על דף ריק, עד הציור הגמור בריבוע 6.' },
  { q: 'לאיזה גיל מתאימים הדפים?', a: 'הציורים בנויים מצורות פשוטות — עיגולים, משולשים וקשתות — ומתאימים בעיקר לגילאי 4–9. ילדים קטנים יכולים לצייר יחד עם מבוגר, וגדולים יותר יוסיפו רקע ופרטים משלהם.' },
  { q: 'מה צריך כדי להתחיל?', a: 'עיפרון רך, מחק ודף ריק. כדאי לצייר קודם בקו חלש, ורק בסוף לעבור על הקווים בטוש שחור ולצבוע.' },
  { q: 'הדפים בחינם?', a: 'כן. כל דפי "איך מציירים" חינמיים לשימוש בבית, בגן ובכיתה, בלי הרשמה. הציורים מקוריים ונוצרו במיוחד לאתר.' },
]

export function HowToDrawHub() {
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="איך מציירים — ציור שלב אחר שלב לילדים, דפים להדפסה" description={`איך מציירים חתול, דג, בית ועוד: ${HOW_TO_DRAW.length} דפי הדרכה מקוריים לציור שלב אחר שלב לילדים, שישה שלבים פשוטים בכל דף, חינם להדפסה.`} path="/how-to-draw" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'איך מציירים' }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 font-bold">{HOW_TO_DRAW.length} ציורים שלב אחר שלב</span>
      <h1 className="mt-3 text-4xl sm:text-5xl">✏️ איך מציירים — ציור שלב אחר שלב לילדים</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">בוחרים מה לצייר, פותחים את הדף ומעתיקים שישה שלבים קטנים. בכל שלב הקו החדש שחור והקודמים אפורים — אי אפשר להתבלבל.</p>
    </header>
    <section className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{HOW_TO_DRAW.map(d =>
      <Link key={d.slug} to={howToDrawPath(d.slug)} className={card}>
        <img src={howToDrawSrc(d.slug, true)} alt={`איך מציירים ${d.name} שלב אחר שלב`} loading="lazy" width="400" height="267" className="aspect-[3/2] w-full object-contain" />
        <span className="mt-2 block text-lg font-bold">{d.emoji} איך מציירים {d.name}</span><small className="text-slate-500">גילאי {d.ages}</small>
      </Link>)}</section>
    <section className="mx-auto mt-10 max-w-3xl leading-relaxed">
      <h2 className="mb-2 text-2xl font-bold">למה ללמוד לצייר שלב אחר שלב?</h2>
      <p>ציור לפי שלבים מפרק ציור "קשה" לצורות שכל ילד מכיר: עיגול, משולש, קשת וקו. הילד רואה שהוא מצליח כבר מהשלב הראשון, וזה נותן לו ביטחון לנסות לבד. בדרך מתרגלים שליטה בעיפרון, התבוננות ותכנון של הדף — כישורים שעוזרים גם בכתיבה.</p>
      <p className="mt-2">אחרי שהציור מוכן אפשר לצבוע אותו, או להמשיך ל<Link to="/printables/coloring" className="font-bold underline">דפי צביעה מוכנים</Link> באותו נושא.</p>
      <SeoBody faq={FAQ} related={[{ label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'ציור סימטרי', href: '/printables/symmetry' }, { label: 'רעיון לציור', href: '/drawing-prompt' }, { label: 'כל הדפים להדפסה', href: '/printables' }]} />
    </section>
  </div>
}

export default function HowToDrawPage() {
  const { slug } = useParams()
  const d = findHowToDraw(slug)
  if (!d) return <NotFound />
  const path = howToDrawPath(d.slug)
  const coloring = d.coloring && COLORING_SUBJECTS.find(s => s.slug === d.coloring)
  const others = HOW_TO_DRAW.filter(x => x.slug !== d.slug).slice(0, 8)
  const faq = [
    { q: `כמה שלבים יש בציור ${d.name}?`, a: `שישה שלבים. השלב הראשון: ${d.steps[0]} השלב האחרון: ${d.steps[5]}` },
    { q: `לאיזה גיל מתאים הציור של ${d.name}?`, a: `הוא מתאים במיוחד לגילאי ${d.ages}. ${d.tip}` },
    { q: 'איך מדפיסים את הדף?', a: 'לוחצים על "הדפסה" — הדף נפתח בתצוגה מקדימה על A4 ואפשר להדפיס או לשמור כ-PDF.' },
  ]
  return <PrintableShell key={path} path={path} seoTitle={howToDrawTitle(d)} h1={`איך מציירים ${d.name} — שלב אחר שלב`} description={howToDrawDescription(d)}
    image={howToDrawSrc(d.slug)} emoji={d.emoji} sub={`שישה שלבים פשוטים · מומלץ לגילאי ${d.ages} · חינם להדפסה`}
    crumbs={[{ label: 'איך מציירים', href: '/how-to-draw' }]}
    pages={[{ key: path, svg: <img src={howToDrawSrc(d.slug)} alt={`איך מציירים ${d.name}: שישה שלבים`} width="1024" height="683" fetchPriority="high" className="block h-auto w-full object-contain" /> }]}
    printTitle={`איך מציירים ${d.name}`} printLabel="הדפסה או הורדה כ-PDF"
    after={<section className="no-print mx-auto mt-8 max-w-3xl" dir="rtl">
      <h2 className="mb-2 text-2xl font-bold">השלבים במילים</h2>
      <ol className="list-decimal space-y-1 pr-6 leading-relaxed">{d.steps.map(s => <li key={s}>{s}</li>)}</ol>
      <p className="mt-3 leading-relaxed"><b>טיפ:</b> {d.tip}</p>
      {coloring && <p className="mt-3"><Link to={`/printables/coloring/${coloring.slug}`} className="font-bold underline">{coloring.emoji} דפי צביעה מוכנים בנושא {coloring.name}</Link></p>}
      <h2 className="mb-3 mt-8 text-2xl font-bold">עוד ציורים שלב אחר שלב</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{others.map(x =>
        <Link key={x.slug} to={howToDrawPath(x.slug)} className={card}>
          <img src={howToDrawSrc(x.slug, true)} alt={`איך מציירים ${x.name}`} loading="lazy" width="400" height="267" className="aspect-[3/2] w-full object-contain" />
          <span className="mt-2 block font-bold">{x.emoji} {x.name}</span>
        </Link>)}</div>
    </section>}
    faq={faq}
    related={[{ label: 'כל דפי איך מציירים', href: '/how-to-draw' }, ...(coloring ? [{ label: `דפי צביעה ${coloring.name}`, href: `/printables/coloring/${coloring.slug}` }] : []), { label: 'דפי צביעה', href: '/printables/coloring' }]}
    extra={<BackLink to="/how-to-draw" className="block py-2 font-bold underline">חזרה לכל הציורים</BackLink>} />
}
