import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import QuickAnswer from '../components/ui/QuickAnswer'
import { OWNER_WHATSAPP, waLink } from '../utils/suppliersDb'

const WA_TEXT = 'היי! אני מ___ ורוצה לשמוע על פרסום בעוגה בוגה'

const AUDIENCE = [
  ['👨‍👩‍👧', 'הורים', 'מחפשים משחק לערב, דף צביעה, פעילות לשבת או רעיונות ליום הולדת.'],
  ['👩‍🏫', 'מורות ומורים', 'דפי עבודה, משחקים לשיעור, כלים לכיתה והכנה לכיתה א׳.'],
  ['🧸', 'גננות וצוותי גן', 'אותיות, מספרים, דפים להדפסה, שלטים לגן ופעילויות לגיל הרך.'],
  ['🗣️', 'קלינאיות תקשורת', 'חומרי היגוי לפי צליל, תרגול שפה, כרטיסיות ותמיכה בתקשורת.'],
]

const AREAS = [
  ['🖨️', 'דפים להדפסה', '/printables'],
  ['🗣️', 'קלינאות תקשורת', '/speech'],
  ['🔤', 'אותיות וקריאה', '/letters'],
  ['🧸', 'פעוטות', '/toddlers'],
  ['🎮', 'משחקים', '/games'],
  ['🎂', 'ימי הולדת', '/birthday'],
  ['🕯️', 'חגים ושבת', '/holidays'],
  ['🏡', 'בבית עם הילדים', '/family'],
]

const OPTIONS = [
  ['🃏', 'באנר בעמודים רלוונטיים', 'כרטיס קטן ומסומן בעמודים שהנושא שלהם קשור למוצר — למשל משחק לגיל הרך בעמודי אותיות, פעוטות ודיבור. לא בכל האתר, רק איפה שזה באמת מתאים.'],
  ['⭐', 'כרטיס מוצר או ספק מומלץ', 'כרטיס עם תמונה, משפט קצר וקישור, בתוך מדור שמתאים לו — כמו מתחם יום ההולדת או רעיונות למתנות.'],
  ['🖍️', 'דף פעילות בחסות', 'דף להדפסה או פעילות שנבנים יחד סביב נושא שקשור אליכם, עם ציון ברור של החסות. הפעילות עצמה נשארת חינמית לכולם.'],
  ['💌', 'אזכור במייל השבועי', 'שורה מסומנת במייל ההשראה השבועי שנשלח למי שבחרו לקבל אותו.'],
]

const PRINCIPLES = [
  'רק מוצרים ושירותים שמתאימים לילדים ולמשפחות, ושקשורים לתוכן של העמוד.',
  'כל פרסומת מסומנת בבירור („פרסומת” / „בשיתוף”) — כך גם החוק בישראל מחייב.',
  'בלי מעקב אחרי ילדים, בלי פרסום באזור הילדים ובלי חלונות קופצים.',
  'הגולשים יכולים לסגור את הבאנר בלחיצה.',
  'כל התוכן באתר נשאר חינמי ופתוח לכולם — הפרסום עוזר לנו להמשיך להוסיף עוד.',
]

const FAQ = [
  { q: 'איפה הפרסומת מופיעה באתר?', a: 'בעמודים שהנושא שלהם קשור למה שאתם מציעים — למשל מוצרים לגיל הרך בעמודי פעוטות, אותיות ודיבור. הבאנר מופיע מתחת לתוכן המרכזי של העמוד, פעם אחת בעמוד, ולא באזור הילדים.' },
  { q: 'האם הפרסומת מסומנת?', a: 'כן. כל באנר, כרטיס או פעילות בחסות מסומנים בבירור במילה „פרסומת” או „בשיתוף”, כדי שהורים ואנשי חינוך ידעו מה מקודם.' },
  { q: 'אילו עסקים מתאימים לפרסום בעוגה בוגה?', a: 'עסקים שמוכרים או נותנים שירות להורים, לילדים, לגננות, למורים ולאנשי טיפול: משחקים, ספרים, יצירה, חוגים, הדרכות ושירותים לגיל הרך. מוצרים שלא מתאימים לילדים לא יפורסמו.' },
  { q: 'האם יש מעקב אחרי הגולשים?', a: 'לא נאסף מידע אישי על ילדים לטובת פרסום. אנחנו סופרים רק כמה פעמים לחצו על הקישור לפרסומת, כדי שתדעו אם זה עובד.' },
  { q: 'אני ספק לימי הולדת — זה המקום?', a: 'לספקי אירועים יש מאגר ספקים נפרד, עם כרטיס ספק בחינם ופנייה ישירה בוואטסאפ. אפשר להצטרף בעמוד הספקים.' },
  { q: 'איך מתחילים?', a: 'שולחים לנו הודעה בוואטסאפ עם כמה מילים על העסק ומה תרצו לקדם, ונחזור אליכם עם הצעה שמתאימה לתוכן האתר.' },
]

export default function Advertise() {
  const wa = waLink(OWNER_WHATSAPP, WA_TEXT)
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="פרסום באתר להורים וגננות — פרסום בעוגה בוגה" description="רוצים להגיע להורים, גננות, מורות וקלינאיות תקשורת? פרסום מסומן ומותאם נושא בעוגה בוגה: באנר בעמודים רלוונטיים, כרטיס מוצר, דף פעילות בחסות ואזכור במייל השבועי." path="/advertise" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'פרסום באתר' }]} />

    <header className="text-center">
      <h1 className="text-4xl font-black sm:text-5xl"><span aria-hidden="true">📣 </span>פרסום בעוגה בוגה</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-[var(--foreground)]/85">מקום קטן, מסומן ומותאם נושא למוצרים ולשירותים שהורים, גננות, מורות וקלינאיות באמת מחפשים.</p>
    </header>

    <QuickAnswer q="איך מפרסמים באתר להורים וגננות?"
      a="בעוגה בוגה אפשר לפרסם באנר קטן ומסומן בעמודים שהנושא שלהם קשור למוצר, כרטיס מוצר מומלץ, דף פעילות בחסות או אזכור במייל השבועי. כל הפרסומות מסומנות, מתאימות לילדים ולא מופיעות באזור הילדים. פונים אלינו בוואטסאפ ומקבלים הצעה."
      rows={[['למי', 'הורים, גננות, מורות, קלינאיות תקשורת'], ['איפה', 'בעמודים רלוונטיים לפי נושא, מתחת לתוכן'], ['סימון', '„פרסומת” / „בשיתוף” על כל מודעה'], ['יצירת קשר', 'וואטסאפ — 050-7772930']]}
      updated="2026-10-24" />

    <section className="mt-10">
      <h2 className="text-center text-3xl font-black">מי מגיע לאתר?</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{AUDIENCE.map(([e, t, d]) =>
        <div key={t} className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 text-center sketch-shadow">
          <span className="text-4xl" aria-hidden="true">{e}</span>
          <h3 className="mt-2 text-xl font-bold">{t}</h3>
          <p className="mt-1 text-[var(--foreground)]/80">{d}</p>
        </div>)}</div>
      <p className="mt-6 text-center text-[var(--foreground)]/85">התוכן מחולק לפי תחומים, כך שהפרסום יכול להופיע ליד הנושא שקשור אליו:</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">{AREAS.map(([e, t, to]) =>
        <Link key={to} to={to} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-1.5 font-bold">{e} {t}</Link>)}</div>
    </section>

    <section className="mt-12">
      <h2 className="text-center text-3xl font-black">אפשרויות פרסום</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{OPTIONS.map(([e, t, d]) =>
        <div key={t} className="wobbly flex gap-4 border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow">
          <span className="text-4xl" aria-hidden="true">{e}</span>
          <div><h3 className="text-xl font-bold">{t}</h3><p className="mt-1 leading-relaxed text-[var(--foreground)]/80">{d}</p></div>
        </div>)}</div>
    </section>

    <section className="mx-auto mt-12 max-w-3xl wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-2xl font-black">🤝 העקרונות שלנו</h2>
      <ul className="mt-3 list-disc space-y-1.5 pr-6 leading-relaxed">{PRINCIPLES.map(p => <li key={p}>{p}</li>)}</ul>
    </section>

    <section className="mt-12 text-center">
      <h2 className="text-3xl font-black">רוצים לשמוע עוד?</h2>
      <p className="mt-2 text-lg text-[var(--foreground)]/85">כתבו לנו כמה מילים על העסק ומה תרצו לקדם — נחזור אליכם עם הצעה.</p>
      <a href={wa} target="_blank" rel="noopener noreferrer"
        className="wobbly-md sketch-press mt-5 inline-flex min-h-[52px] items-center gap-2 border-2 border-[var(--ink)] bg-[#25D366] px-7 py-3 text-lg font-bold text-white">💬 כתבו לנו בוואטסאפ</a>
      <p className="mt-5 text-[var(--foreground)]/85">🎪 נותנים שירות לימי הולדת ואירועים? <Link to="/suppliers" className="font-bold underline decoration-dashed">למאגר הספקים</Link> — כרטיס ספק בסיסי בחינם.</p>
    </section>

    <div className="mx-auto mt-12 max-w-3xl">
      <SeoBody paragraphs={[
        'עוגה בוגה הוא אתר משחקים, דפים להדפסה ופעילויות בעברית — לבית, לגן, לכיתה ולקליניקה. כל התוכן חינמי ופתוח לכולם, בלי הרשמה.',
        'הפרסום באתר בנוי כך שלא יפריע: מעט מודעות, מסומנות בבירור, במקומות שבהם הן קשורות לנושא, ותמיד עם אפשרות לסגור אותן.',
      ]} faq={FAQ} related={[
        { label: 'ספקים לימי הולדת', href: '/suppliers' },
        { label: 'אודות עוגה בוגה', href: '/about' },
        { label: 'פרטיות', href: '/privacy' },
      ]} />
    </div>
  </div>
}
