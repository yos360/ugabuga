import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import {
  DEVELOPS, TODDLER_AGES, TODDLER_BIRTHDAYS, TODDLER_SAFETY, SCREEN_NOTE, HUB_FAQ,
  activitiesForAge, toddlerAge, toddlerBirthday, filterActivities, developsLabel, ageFaq,
} from '../../data/toddlers'
import '../../learn/learn.css'
import '../../family/family.css'
import './toddlers.css'

const HUB = { label: 'פעילויות לפעוטות', href: '/toddlers' }
const HOME = { label: 'ראשי', href: '/' }

function SafetyBox({ compact = false }) {
  const items = compact ? TODDLER_SAFETY.slice(0, 4) : TODDLER_SAFETY
  return <section className="mt-10" aria-labelledby="tod-safety">
    <h2 id="tod-safety" className="mb-4 text-center text-2xl font-black">🛟 בטיחות קודם לכול</h2>
    <div className="grid gap-3 sm:grid-cols-2">{items.map(s => <div key={s.title} className="fam-card tod-safe">
      <h3 className="text-lg font-bold"><span aria-hidden="true">{s.emoji} </span>{s.title}</h3>
      <p className="m-0 leading-relaxed">{s.text}</p>
    </div>)}</div>
  </section>
}

function ScreenNote() {
  return <section className="ln-box mt-8" aria-labelledby="tod-screens">
    <h2 id="tod-screens" className="text-xl font-black">📱 {SCREEN_NOTE.title}</h2>
    {SCREEN_NOTE.text.map((p, i) => <p key={i} className="leading-relaxed">{p}</p>)}
  </section>
}

function ActivityCard({ a }) {
  return <article className="fam-card tod-card" id={a.slug}>
    <div className="flex items-start gap-3">
      <span className="text-4xl" aria-hidden="true">{a.emoji}</span>
      <div className="min-w-0">
        <h3 className="text-xl font-bold">{a.title}</h3>
        <div className="tod-tags"><span className="tod-tag time">⏱️ {a.time}</span>{a.develops.map(d => <span key={d} className="tod-tag">{DEVELOPS[d].emoji} {DEVELOPS[d].label}</span>)}</div>
      </div>
    </div>
    <p className="mt-2 text-sm"><b>מה צריך:</b> {a.materials.join(' · ')}</p>
    <p className="mt-1 leading-relaxed">{a.how}</p>
    {a.safety && <p className="tod-warn"><span aria-hidden="true">⚠️ </span>{a.safety}</p>}
  </article>
}

// ── /toddlers ──
export function ToddlersHub() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="פעילויות ומשחקים לפעוטות — גיל שנה, שנתיים ו-3" description="פעילויות ומשחקים לפעוטות בגיל שנה, שנתיים ושלוש: יותר מ-20 רעיונות לכל גיל עם ציוד מהבית, טיפים לבטיחות ורעיונות ליום הולדת ראשון, שני ושלישי." path="/toddlers" structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[HOME, { label: 'פעילויות לפעוטות' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">🧸</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">פעילויות ומשחקים לפעוטות</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">רעיונות פשוטים לגיל שנה עד שלוש — עם מה שכבר יש בבית, ועם מבוגר קרוב</p>
    </header>

    <section className="mt-8" aria-labelledby="by-age">
      <h2 id="by-age" className="mb-4 text-center text-2xl font-black">משחקים לפי גיל</h2>
      <div className="grid gap-4 sm:grid-cols-3">{TODDLER_AGES.map(a => <Link key={a.slug} to={`/toddlers/${a.slug}`} className="fam-card card-lift text-center">
        <div className="text-5xl" aria-hidden="true">{a.emoji}</div>
        <h3 className="text-xl font-bold">{a.title}</h3>
        <small>{a.range} · {activitiesForAge(a.n).length} פעילויות</small>
      </Link>)}</div>
    </section>

    <section className="mt-10" aria-labelledby="bdays">
      <h2 id="bdays" className="mb-4 text-center text-2xl font-black">ימי הולדת לקטנטנים</h2>
      <div className="grid gap-4 sm:grid-cols-3">{TODDLER_BIRTHDAYS.map(b => <Link key={b.slug} to={`/toddlers/${b.slug}`} className="fam-card card-lift text-center">
        <div className="text-5xl" aria-hidden="true">{b.emoji}</div>
        <h3 className="text-xl font-bold">{b.title}</h3>
        <small>מסיבה של {b.length}, משחקים, עוגה ובטיחות</small>
      </Link>)}</div>
    </section>

    <SafetyBox />
    <ScreenNote />

    <div className="mt-12"><SeoBody paragraphs={[
      'פעוטות לומדים דרך הידיים, הפה, הרגליים והאוזניים: כשהם שופכים מים מכוס לכוס, מפילים מגדל, מטפסים על כרית או שומעים את אותו שיר בפעם העשרים. הדף הזה מרכז פעילויות קצרות לגיל שנה, שנתיים ושלוש, כמעט כולן עם ציוד שכבר נמצא בבית.',
      'ליד כל פעילות כתוב כמה זמן היא לוקחת בערך, מה צריך ומה היא מפתחת — מוטוריקה עדינה, מוטוריקה גסה, שפה, חושים או דמיון. אין כאן "מבחנים" או טבלאות של מה ילד צריך לדעת בכל גיל: כל ילד מתפתח בקצב שלו, ואם יש לכם שאלה על ההתפתחות — רופא הילדים או אחות טיפת חלב הם הכתובת.',
    ]} faq={HUB_FAQ} related={[
      { label: 'מתנות לגיל שנה', href: '/gifts/age-1' }, { label: 'עוגות יום הולדת', href: '/cakes' },
      { label: 'סיפורים לפני השינה', href: '/stories' }, { label: 'טבלת גמילה מחיתולים', href: '/printables/potty-chart' },
      { label: 'משחקים לגיל 4', href: '/games/age/4' },
    ]} /></div>
  </div>
}

// ── /toddlers/:slug ──
export function ToddlerPage() {
  const { slug } = useParams()
  const age = toddlerAge(slug)
  if (age) return <AgePage age={age} />
  const bday = toddlerBirthday(slug)
  if (bday) return <BirthdayPage b={bday} />
  return <NotFound />
}

const AGE_RELATED = {
  1: [{ label: 'יום הולדת שנה — רעיונות', href: '/toddlers/birthday-age-1' }, { label: 'מתנות לגיל שנה', href: '/gifts/age-1' }, { label: 'ברכות ליום הולדת שנה', href: '/greetings/age-1' }],
  2: [{ label: 'יום הולדת שנתיים — רעיונות', href: '/toddlers/birthday-age-2' }, { label: 'מתנות לגיל שנתיים', href: '/gifts/age-2' }, { label: 'טבלת גמילה מחיתולים', href: '/printables/potty-chart' }],
  3: [{ label: 'יום הולדת 3 — רעיונות', href: '/toddlers/birthday-age-3' }, { label: 'מתנות לגיל 3', href: '/gifts/age-3' }, { label: 'משחקים לגיל 4', href: '/games/age/4' }, { label: 'סיפורים לפני השינה', href: '/stories' }],
}

function AgePage({ age }) {
  const [dev, setDev] = useState('all')
  const [printing, setPrinting] = useState(false)
  const all = activitiesForAge(age.n)
  const list = filterActivities(all, dev)
  const faq = ageFaq(age)
  const others = TODDLER_AGES.filter(a => a.n !== age.n)
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={age.seoTitle} description={age.description} path={`/toddlers/${age.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[HOME, HUB, { label: age.title }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">{age.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">{age.title}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{all.length} רעיונות לבית ולחצר · {age.range}</p>
    </header>
    <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed">{age.intro}</p>

    <section className="ln-box mt-6" aria-labelledby="tips">
      <h2 id="tips" className="text-xl font-black">💡 כמה טיפים לפני שמתחילים</h2>
      <ul className="mt-2 space-y-1">{age.tips.map(t => <li key={t}>• {t}</li>)}</ul>
    </section>

    <div className="no-print mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="סינון לפי מה שהפעילות מפתחת">
      <button type="button" className="ln-chip" aria-pressed={dev === 'all'} onClick={() => setDev('all')}>הכול ({all.length})</button>
      {Object.entries(DEVELOPS).map(([k, d]) => {
        const n = filterActivities(all, k).length
        return n ? <button key={k} type="button" className="ln-chip" aria-pressed={dev === k} onClick={() => setDev(k)}>{d.emoji} {d.label} ({n})</button> : null
      })}
      <button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ הדפסת הרשימה</button>
    </div>
    <h2 className="mt-6 mb-4 text-center text-2xl font-black">{dev === 'all' ? `${all.length} פעילויות ל${age.label}` : `פעילויות שמפתחות ${developsLabel(dev)}`}</h2>
    <div className="grid gap-4 md:grid-cols-2">{list.map(a => <ActivityCard key={a.slug} a={a} />)}</div>

    <SafetyBox compact />
    {age.n <= 2 && <ScreenNote />}

    <nav className="mt-10 flex flex-wrap justify-center gap-3" aria-label="גילים נוספים">
      {others.map(a => <Link key={a.slug} to={`/toddlers/${a.slug}`} className="ln-btn alt">{a.emoji} {a.title}</Link>)}
    </nav>

    {printing && <PrintPreview title={age.title} onClose={() => setPrinting(false)}>
      <article className="buga-flow tod-print" dir="rtl">
        <h2>{age.title}</h2>
        <p>משחקים עם מבוגר קרוב · ugabuga.co.il</p>
        {list.map(a => <div key={a.slug} className="tod-print-item">
          <h3>{a.emoji} {a.title} <small>({a.time})</small></h3>
          <p><b>מה צריך:</b> {a.materials.join(', ')}</p>
          <p>{a.how}</p>
          {a.safety && <p><b>בטיחות:</b> {a.safety}</p>}
        </div>)}
      </article>
    </PrintPreview>}

    <div className="mt-12"><SeoBody paragraphs={[
      `ריכזנו כאן ${all.length} משחקים ופעילויות ל${age.label} (${age.range}). ליד כל פעילות כתוב כמה זמן היא לוקחת, מה צריך ומה היא מפתחת, ואפשר לסנן לפי תחום — למשל רק פעילויות לשפה ודיבור או רק משחקי תנועה.`,
      'הפעילויות מבוססות על דברים שיש כמעט בכל בית, והן מיועדות למשחק משותף עם מבוגר. אין כאן הבטחות או "תוצאות" התפתחותיות — רק רעיונות לזמן טוב יחד. כל ילד מתפתח בקצב שלו, ושאלות על התפתחות כדאי להפנות לרופא הילדים או לטיפת חלב.',
    ]} faq={faq} related={[HUB, ...AGE_RELATED[age.n]]} /></div>
  </div>
}

const BDAY_RELATED = {
  1: [{ label: 'מדריך ליום הולדת ראשון', href: '/guides/first-birthday-guide' }, { label: 'מתנות לגיל שנה', href: '/gifts/age-1' }, { label: 'ברכות ליום הולדת שנה', href: '/greetings/age-1' }],
  2: [{ label: 'מתנות לגיל שנתיים', href: '/gifts/age-2' }, { label: 'צ׳קליסט ליום הולדת', href: '/printables/birthday-checklist' }, { label: 'הזמנה ליום הולדת', href: '/invitation' }],
  3: [{ label: 'מתנות לגיל 3', href: '/gifts/age-3' }, { label: 'ברכות ליום הולדת 3', href: '/greetings/age-3' }, { label: 'כתר יום הולדת להדפסה', href: '/printables/birthday-crown' }, { label: 'ציד אוצר לגן', href: '/treasure-hunt/kindergarten' }],
}

function BirthdayPage({ b }) {
  const age = TODDLER_AGES.find(a => a.n === b.n)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={b.seoTitle} description={b.description} path={`/toddlers/${b.slug}`} type="article" structuredData={faqSchema(b.faq)} />
    <Breadcrumbs items={[HOME, HUB, { label: b.title }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">{b.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">{b.h1}</h1>
    </header>
    <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed">{b.intro}</p>

    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <section className="fam-card"><h2 className="text-xl font-black">⏱️ כמה זמן?</h2><p className="text-2xl font-black">{b.length}</p><p className="m-0">ילדים קטנים מתעייפים מהר. עדיף לסיים כשכולם עוד שמחים.</p></section>
      <section className="fam-card"><h2 className="text-xl font-black">😴 מתי?</h2><p className="m-0 leading-relaxed">{b.nap}</p></section>
    </div>

    <section className="ln-box mt-6" aria-labelledby="schedule">
      <h2 id="schedule" className="text-xl font-black">🗓️ סדר יום מוצע</h2>
      <ol className="tod-timeline">{b.schedule.map(([t, s]) => <li key={t}><b>{t}</b><span>{s}</span></li>)}</ol>
    </section>

    <section className="mt-6" aria-labelledby="games">
      <h2 id="games" className="mb-3 text-2xl font-black">🎲 משחקים ופעילויות</h2>
      <div className="grid gap-3 sm:grid-cols-2">{b.games.map(([t, s]) => <div key={t} className="fam-card"><h3 className="text-lg font-bold">{t}</h3><p className="m-0">{s}</p></div>)}</div>
      <p className="mt-3">עוד רעיונות למשחקים פשוטים: <Link to={`/toddlers/${age.slug}`} className="font-bold underline">{age.title}</Link>.</p>
    </section>

    <section className="fam-card mt-6"><h2 className="text-xl font-black">🎂 העוגה</h2><p className="leading-relaxed">{b.cake}</p><p className="m-0"><Link to="/cakes" className="font-bold underline">לרעיונות לעוגות יום הולדת ←</Link></p></section>
    <section className="fam-card mt-4"><h2 className="text-xl font-black">👨‍👩‍👧 כמה אורחים?</h2><p className="m-0 leading-relaxed">{b.guests}</p></section>
    <section className="fam-card mt-4"><h2 className="text-xl font-black">🍽️ אוכל</h2><p className="m-0 leading-relaxed">{b.food}</p></section>

    <section className="fam-card tod-safe mt-4" aria-labelledby="bsafe">
      <h2 id="bsafe" className="text-xl font-black">🛟 בטיחות במסיבה</h2>
      <ul className="mt-2 space-y-2">{b.safety.map(s => <li key={s}>• {s}</li>)}</ul>
    </section>

    <nav className="mt-10 flex flex-wrap justify-center gap-3" aria-label="ימי הולדת נוספים">
      {TODDLER_BIRTHDAYS.filter(x => x.n !== b.n).map(x => <Link key={x.slug} to={`/toddlers/${x.slug}`} className="ln-btn alt">{x.emoji} {x.title}</Link>)}
    </nav>

    <div className="mt-12"><SeoBody paragraphs={[
      `${b.title}: כאן תמצאו סדר יום מוצע למסיבה של ${b.length}, משחקים שמתאימים לפעוטות, רעיונות לעוגה ולאוכל, וטיפים לבטיחות. הכול מתאים למסיבה בבית, בגינה או בחצר.`,
      'הכלל החשוב ביותר במסיבות של קטנטנים: פחות זה יותר. פחות אורחים, פחות רעש, פחות זמן — והרבה יותר סיכוי שהחוגג ייהנה מהיום שלו.',
    ]} faq={b.faq} related={[HUB, { label: 'עוגות יום הולדת', href: '/cakes' }, ...BDAY_RELATED[b.n]]} /></div>
  </div>
}

export default ToddlersHub
