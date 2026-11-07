import { Link, useParams } from 'react-router-dom'
import PrintableShell, { Sheet, T } from '../../components/printables/PrintableShell'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody from '../../components/ui/SeoBody'
import { LetterSheet } from '../../components/ui/HebrewTracing'
import NotFound from '../NotFound'
import { HEBREW, hebrewBySlug } from '../../data/letterLearning'

// "Letter of the week" kit for kindergarten teachers: a 5-day plan on screen and four sheets
// (wall poster, tracing, picture hunt, note to parents) for every Hebrew letter.
const COLORS = ['#e5484d', '#f28c28', '#3fb36b', '#3b7dd8', '#8e5cd6', '#f07ab8']

function Poster({ item, idx }) {
  const c = COLORS[idx % COLORS.length], words = item.words.slice(0, 4)
  return <Sheet label={`פוסטר האות ${item.l}: ${words.map(w => w[0]).join(', ')}`}>
    <rect x="6" y="6" width="188" height="258" rx="12" fill={c + '18'} stroke={c} strokeWidth="3" />
    <T x={100} y={30} size={11} weight={800} fill="#333">אות השבוע שלנו</T>
    <T x={100} y={118} size={92} weight={900} fill="#fff" stroke={c} strokeWidth="3" paintOrder="stroke">{item.l}</T>
    <T x={100} y={140} size={12} weight={700}>{item.name}</T>
    {words.map(([w, e], i) => {
      const x = 52 + (i % 2) * 96, y = 168 + Math.floor(i / 2) * 46
      return <g key={w}><rect x={x - 44} y={y - 16} width="88" height="42" rx="8" fill="#fff" stroke="#ccc" strokeWidth="0.6" />
        <text x={x} y={y} fontSize="18" textAnchor="middle" dominantBaseline="central">{e}</text>
        <T x={x} y={y + 21} size={8} weight={800}><tspan fill={c}>{w[0]}</tspan>{w.slice(1)}</T></g>
    })}
  </Sheet>
}

function Hunt({ item, idx }) {
  const own = item.words.slice(0, 5).map(w => ({ e: w[1], w: w[0], yes: true }))
  const others = HEBREW.filter(h => h.l !== item.l && !(item.similar || []).includes(h.l)).flatMap(h => h.words.slice(0, 1).map(w => ({ e: w[1], w: w[0], yes: false }))).filter(o => o.w[0] !== item.l)
  const pick = Array.from({ length: 4 }, (_, k) => others[(idx * 5 + k * 7) % others.length])
  const cells = [...own, ...pick].sort((a, b) => ((a.w.charCodeAt(1) * 31 + idx) % 17) - ((b.w.charCodeAt(1) * 31 + idx) % 17))
  return <Sheet label={`מה מתחיל באות ${item.l}? דף חיפוש`}>
    <T x={100} y={20} size={12} weight={900}>מה מתחיל באות {item.l}?</T>
    <T x={100} y={31} size={6.5} fill="#444">אומרים בקול את שם הציור. אם הוא מתחיל ב־{item.l} — צובעים את המסגרת</T>
    <T x={100} y={41} size={6} fill="#444">שם: ______________</T>
    {cells.map((c, i) => {
      const x = 12 + (i % 3) * 61, y = 50 + Math.floor(i / 3) * 70
      return <g key={i}><rect x={x} y={y} width="56" height="64" rx="8" fill="#fff" stroke="#222" strokeWidth="1.4" />
        <text x={x + 28} y={y + 28} fontSize="28" textAnchor="middle" dominantBaseline="central">{c.e}</text>
        <T x={x + 28} y={y + 56} size={7} fill="#666">{c.w}</T></g>
    })}
    <T x={100} y={264} size={5} fill="#999">לגננת: {own.length} ציורים מתחילים ב־{item.l}: {own.map(o => o.w).join(', ')}</T>
  </Sheet>
}

function ParentNote({ item }) {
  return <Sheet label={`מכתב להורים: אות השבוע ${item.l}`}>
    {[0, 1].map(k => {
      const y = 8 + k * 132
      return <g key={k}>
        <rect x="8" y={y} width="184" height="124" rx="8" fill="#fff" stroke="#222" strokeWidth="0.8" strokeDasharray={k ? '0' : '0'} />
        <T x={100} y={y + 18} size={10} weight={900}>הורים יקרים,</T>
        <T x={100} y={y + 34} size={8}>השבוע אנחנו לומדים בגן את האות</T>
        <T x={100} y={y + 66} size={34} weight={900}>{item.l}</T>
        <T x={100} y={y + 84} size={7.5}>שלחו איתנו מחר חפץ קטן או תמונה של משהו שמתחיל ב־{item.l}</T>
        <T x={100} y={y + 96} size={7.5}>(למשל: {item.words.slice(0, 3).map(w => w[0]).join(', ')}) — נציג אותם במעגל הבוקר.</T>
        <T x={100} y={y + 112} size={7}>מה הבאתי: ____________________   תודה! הצוות</T>
      </g>
    })}
    <T x={100} y={268} size={5} fill="#999">✂ גוזרים לשני פתקים</T>
  </Sheet>
}

const PLAN = l => [
  ['יום א׳ — מכירים', `מציגים את הפוסטר במעגל הבוקר. אומרים את שם האות ושואלים: "איזה מילים אתם מכירים שמתחילות ב־${l}?" שרים את שיר האותיות ותולים את הפוסטר בפינת האות.`],
  ['יום ב׳ — כותבים באוויר ובחול', `מציירים את האות ${l} באוויר באצבע, בחול, בקצף גילוח או בפלסטלינה. אחר כך עוברים בעיפרון על האות הגדולה בדף התרגול.`],
  ['יום ג׳ — מחפשים', `דף "מה מתחיל ב־${l}?": אומרים כל ציור בקול וצובעים את מה שמתחיל באות. מי שמסיים — מחפש את האות ${l} בספרים ובשלטים בגן.`],
  ['יום ד׳ — קופסת האות', `הילדים מביאים חפצים מהבית (לפי המכתב להורים), ומציגים אותם במעגל. כל ילד אומר את שם החפץ ומקיש על הצליל הראשון.`],
  ['יום ה׳ — חוגגים', `משחק אותיות על המסך, כרטיסיות למשחק זיכרון, ומכינים יחד "ספר האות ${l}" מהציורים של השבוע.`],
]

function WeekKit({ item }) {
  const idx = HEBREW.indexOf(item)
  const pages = [
    { key: 'poster', svg: <Poster item={item} idx={idx} /> },
    { key: 'trace', svg: <LetterSheet letter={item.l} /> },
    { key: 'hunt', svg: <Hunt item={item} idx={idx} /> },
    { key: 'note', svg: <ParentNote item={item} /> },
  ]
  const words = item.words.map(w => w[0]).join(', ')
  return <PrintableShell path={`/letters/${item.slug}/week`} emoji="🔤" h1={`אות השבוע: ${item.l} — ערכה לגננת`}
    seoTitle={`אות השבוע ${item.l} — ערכה לגן להדפסה: פוסטר, תרגול ודף חיפוש`}
    description={`ערכת אות השבוע לאות ${item.l} (${item.name}): פוסטר לפינת האות, דף תרגול כתיבה, דף "מה מתחיל ב־${item.l}?", מכתב להורים ותוכנית לחמישה ימים. מילים: ${words}.`}
    sub={`ארבעה דפים ותוכנית לשבוע שלם עם האות ${item.l}`}
    crumbs={[{ label: 'אותיות', href: '/letters' }, { label: 'אות השבוע', href: '/letters/week' }]}
    pages={pages} printTitle={`אות השבוע ${item.l}`} previewAll
    body={<section className="mx-auto max-w-3xl space-y-4 leading-relaxed text-[var(--foreground)]/80">
      <h2 className="text-2xl font-bold text-[var(--foreground)]">תוכנית לשבוע עם האות {item.l}</h2>
      <ol className="space-y-3">{PLAN(item.l).map(([t, d]) => <li key={t}><b>{t}:</b> {d}</li>)}</ol>
      <p><b>טיפ על האות {item.l}:</b> {item.tip}</p>
      <p>עוד לאות {item.l}: <Link to={`/letters/${item.slug}`} className="font-bold underline">דף האות עם הקראה וכרטיסיות</Link> · <Link to="/letters/song" className="font-bold underline">שיר האותיות</Link> · <Link to="/letters/game" className="font-bold underline">משחק אותיות</Link></p>
    </section>}
    paragraphs={[`בערכה ארבעה דפים: פוסטר גדול של האות ${item.l} עם ארבע מילים וציורים (${item.words.slice(0, 4).map(w => w[0]).join(', ')}), דף תרגול כתיבה, דף חיפוש שבו צובעים את הציורים שמתחילים באות, ומכתב קצר להורים שמזמין להביא חפץ מהבית.`]}
    faq={[
      { q: `באיזה סדר מלמדים את האותיות?`, a: 'אין סדר אחד מחייב. גננות רבות מתחילות באותיות של שמות הילדים ובאותיות שקל לשמוע בתחילת מילה — מ׳, ב׳, ש׳, ל׳ — ומשאירות לסוף אותיות דומות או שקטות כמו א׳ וע׳.' },
      { q: `האם ילדים בגן צריכים לכתוב את האות ${item.l}?`, a: 'בגן העיקר הוא לזהות את האות ולשמוע את הצליל שלה. הכתיבה בדף התרגול היא הזדמנות לחזק את היד, לא דרישה. מי שלא מוכן — מצייר את האות באצבע או בפלסטלינה.' },
    ]}
    related={[...[HEBREW[idx - 1], HEBREW[idx + 1]].filter(Boolean).map(h => ({ label: `אות השבוע ${h.l}`, href: `/letters/${h.slug}/week` })), { label: 'כל ערכות אות השבוע', href: '/letters/week' }, { label: 'לגננת — כל מה שצריך לגן', href: '/gan' }]} />
}

function WeekHub() {
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="אות השבוע לגן — ערכה להדפסה לכל אות, א׳ עד ת׳" description="ערכת אות השבוע לגננות: לכל אות פוסטר, דף תרגול, דף מה מתחיל באות, מכתב להורים ותוכנית לחמישה ימים. 22 אותיות, חינם להדפסה." path="/letters/week" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אותיות', href: '/letters' }, { label: 'אות השבוע' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🔤 אות השבוע לגן</h1>
    <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">בוחרים אות ומקבלים ערכה לשבוע: פוסטר, תרגול כתיבה, דף חיפוש, מכתב להורים ותוכנית יומית.</p>
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6" dir="rtl">
      {HEBREW.map((h, i) => <Link key={h.slug} to={`/letters/${h.slug}/week`} className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-3 text-center hover:bg-[var(--muted)]/30">
        <span className="block text-4xl font-black" style={{ color: COLORS[i % COLORS.length] }}>{h.l}</span><span className="text-sm">{h.words[0][1]} {h.words[0][0]}</span>
      </Link>)}
    </div>
    <section className="mx-auto mt-10 max-w-3xl space-y-3 leading-relaxed text-[var(--foreground)]/80">
      <h2 className="text-2xl font-bold text-[var(--foreground)]">איך עובדים עם אות השבוע בגן?</h2>
      <p>בכל שבוע מתמקדים באות אחת: מכירים אותה במעגל הבוקר, שומעים את הצליל שלה במילים מוכרות, כותבים אותה באוויר ובחול, מחפשים אותה בספרים ובשלטים, ובסוף השבוע מביאים מהבית חפצים שמתחילים בה. חזרה קצרה בכל יום עובדת טוב יותר משיעור ארוך אחד.</p>
      <p>בכל ערכה ארבעה דפים מוכנים ותוכנית לחמישה ימים. הכול חינם ובלי הרשמה.</p>
    </section>
    <SeoBody faq={[{ q: 'כמה זמן להקדיש לכל אות?', a: 'שבוע אחד לאות הוא הקצב המקובל בגן חובה. אפשר לקצר לשלושה ימים לאותיות שהילדים כבר מכירים, ולהאריך לאותיות שמתבלבלים בהן.' }]} related={[{ label: 'לימוד אותיות בעברית', href: '/letters' }, { label: 'שיר האותיות', href: '/letters/song' }, { label: 'קישוט כיתה וגן', href: '/printables/classroom-decor' }, { label: 'לגננת', href: '/gan' }]} />
  </div>
}

export default function LetterWeek() {
  const { slug } = useParams()
  if (!slug) return <WeekHub />
  const item = hebrewBySlug(slug)
  return item ? <WeekKit item={item} /> : <NotFound />
}
