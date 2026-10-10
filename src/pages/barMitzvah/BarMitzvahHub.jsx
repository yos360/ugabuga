import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { SPOKES, inputCls } from './shared'
import { checklistWithDates } from '../../utils/barMitzvah'
import { toISO } from '../../utils/hebrewBirthday'

const PATH = '/bar-mitzvah'

const FAQ = [
  { q: 'מה ההבדל בין בר מצווה לבת מצווה?', a: 'בר מצווה הוא הבן, שמגיע למצוות בגיל 13, ובת מצווה היא הבת, שמגיעה למצוות בגיל 12 — שניהם לפי התאריך העברי. "בני מצווה" הוא השם הכללי לשניהם. ההבדל המעשי תלוי בקהילה: בבית כנסת אורתודוקסי הבן עולה לתורה ומתחיל להניח תפילין, ובת המצווה מציינת את היום בדבר תורה, בסעודה או בפרויקט. בקהילות מסורתיות־רפורמיות וקונסרבטיביות גם בנות עולות לתורה. ובמשפחות חילוניות רבות חוגגים בטיול, במסיבה או בפרויקט שורשים.' },
  { q: 'כמה זמן מראש מתחילים לתכנן בר מצווה?', a: 'לאירוע גדול באולם — כשנה מראש, כי מקומות מבוקשים נסגרים מוקדם. ללימוד קריאה בתורה צריך בדרך כלל חצי שנה עד שנה. חגיגה קטנה בבית, טיול או ערב משפחתי אפשר לארגן גם בשלושה־ארבעה חודשים. בצ׳קליסט שלנו כל משימה מקבלת תאריך לפי מועד האירוע.' },
  { q: 'האם חייבים לחגוג בדיוק בתאריך העברי?', a: 'הגיל ההלכתי נקבע לפי התאריך העברי, אבל החגיגה עצמה יכולה להיות בכל מועד שנוח למשפחה — לפני או אחרי. עלייה לתורה נהוגה בשבת שאחרי התאריך או ביום שני או חמישי, כשהנער כבר הגיע למצוות.' },
  { q: 'מתי קונים תפילין לבר מצווה?', a: 'כדאי להזמין תפילין כשלושה־ארבעה חודשים לפני, כי כתיבת הפרשיות והבדיקה לוקחות זמן. רבים מתחילים להניח כחודש לפני בר המצווה כדי להתרגל, יש שמתחילים חודשיים לפני (כמו מנהג חב״ד), ויש קהילות שמתחילים ביום בר המצווה עצמו. מומלץ לשאול את הרב של הקהילה.' },
  { q: 'מה עושים אם הילד או הילדה לא רוצים מסיבה גדולה?', a: 'זה נפוץ ולגיטימי. אפשר לבחור טיול משפחתי, ארוחה עם המשפחה הקרובה, יום כיף עם כמה חברים או פרויקט התנדבות. כשבני המצווה שותפים לבחירה, החגיגה מרגישה שלהם — וזה מה שנשאר בזיכרון.' },
]

const RELATED = [
  { label: 'רעיונות לבר מצווה', href: '/ideas/bar-mitzvah-ideas' },
  { label: 'רעיונות לבת מצווה', href: '/ideas/bat-mitzvah-ideas' },
  { label: 'ברכות לבר מצווה', href: '/greetings/bar-mitzvah' },
  { label: 'ברכות לבת מצווה', href: '/greetings/bat-mitzvah' },
]

const MORE = [
  { href: '/ideas/bar-mitzvah-ideas', emoji: '🎉', title: 'רעיונות לבר מצווה' },
  { href: '/ideas/bat-mitzvah-ideas', emoji: '👑', title: 'רעיונות לבת מצווה' },
  { href: '/greetings/bar-mitzvah', emoji: '💬', title: 'ברכות לבר מצווה' },
  { href: '/greetings/bat-mitzvah', emoji: '💐', title: 'ברכות לבת מצווה' },
  { href: '/tools/hebrew-birthday', emoji: '✡️', title: 'יום הולדת עברי' },
  { href: '/invitation', emoji: '📨', title: 'מחולל הזמנות' },
  { href: '/gifts/age-12', emoji: '🎁', title: 'מתנות לגיל 12' },
  { href: '/gifts/age-13', emoji: '🎁', title: 'מתנות לגיל 13' },
  { href: '/suppliers/category/mitzvah', emoji: '🎪', title: 'ספקים לבר ובת מצווה' },
  { href: '/printables/photo-props', emoji: '📸', title: 'אביזרי צילום להדפסה' },
]

const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': 'בר מצווה ובת מצווה — מדריך וכלים',
  'url': 'https://ugabuga.co.il' + PATH,
  'inLanguage': 'he',
  'hasPart': SPOKES.map(s => ({ '@type': 'WebPage', 'name': s.title, 'url': 'https://ugabuga.co.il' + s.href })),
}

function Planner() {
  const [date, setDate] = useState('')
  const [today] = useState(() => toISO(new Date()))
  const stages = date ? checklistWithDates(date, today) : null
  return (
    <section className="ln-box mb-12" aria-labelledby="planner">
      <h2 id="planner" className="m-0 mb-1 text-2xl font-bold">🗓️ לוח זמנים לבר או לבת מצווה</h2>
      <p className="m-0 mb-3 text-[var(--muted-foreground)]">מזינים את תאריך החגיגה, ומקבלים מה צריך לעשות בכל שלב — משנה לפני ועד היום עצמו.</p>
      <label className="block max-w-xs font-bold">
        תאריך החגיגה
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
      </label>
      <p className="m-0 mt-2 text-sm">עוד לא יודעים מתי? <Link to="/bar-mitzvah/date" className="font-bold underline">מחשבון תאריך בר מצווה</Link> יראה לכם את התאריך העברי והשבת.</p>
      <ol className="m-0 mt-5 list-none space-y-3 p-0">
        {(stages || checklistWithDates('')).map(s => (
          <li key={s.id} className={`rounded-xl border-2 p-3 ${s.late ? 'border-dashed border-[var(--border)] opacity-70' : 'border-[var(--border)]'}`}>
            <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3">
              <strong className="text-lg"><span aria-hidden="true">{s.emoji} </span>{s.title}</strong>
              {s.dueText && <span className="text-sm font-bold">{s.late ? 'כבר עבר — ' : 'עד '}{s.dueText}</span>}
            </p>
            <p className="m-0 mt-1 text-[var(--foreground)]/85">{s.items.slice(0, 2).map(i => i.text).join(' · ')}</p>
          </li>
        ))}
      </ol>
      <p className="m-0 mt-4 text-center">
        <Link to={date ? `/bar-mitzvah/checklist?date=${date}` : '/bar-mitzvah/checklist'} className="ln-btn inline-block no-underline">✅ לצ׳קליסט המלא, עם סימון והדפסה</Link>
      </p>
    </section>
  )
}

export default function BarMitzvahHub() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="בר מצווה ובת מצווה — מדריך, לוח זמנים וכלים לבני מצווה" description="כל מה שצריך לבר מצווה ולבת מצווה: מחשבון תאריך ופרשה, צ׳קליסט לפי חודשים, מחולל דרשה, חידון על החוגג, מזכרות להדפסה וטיפים לתפילין. חינם." path={PATH} structuredData={[faqSchema(FAQ), APP_SCHEMA]} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בר ובת מצווה' }]} />

      <header className="mb-8 text-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--postit)] text-5xl sketch-shadow-sm" aria-hidden="true">📜</span>
        <h1 className="mt-5 text-4xl sm:text-5xl">בר מצווה ובת מצווה</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-[var(--foreground)]/85">בר מצווה ובת מצווה הם הרגע שבו הילד או הילדה נכנסים לעולם המצוות — ובכל משפחה מציינים אותו קצת אחרת. כאן תמצאו את הכלים לתכנון בני מצווה: מתי בדיוק התאריך, מה עושים ומתי, איך כותבים נאום, ואיך הופכים את החגיגה לאישית.</p>
      </header>

      <section className="mb-12" aria-labelledby="tools">
        <h2 id="tools" className="mb-4 text-center text-3xl">הכלים שלנו לבני מצווה</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPOKES.map(s => (
            <Link key={s.href} to={s.href} className="ln-box block no-underline transition-transform hover:-translate-y-0.5">
              <span className="text-4xl" aria-hidden="true">{s.emoji}</span>
              <h3 className="m-0 mt-2 text-xl font-bold">{s.title}</h3>
              <p className="m-0 mt-1 text-[var(--foreground)]/80">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-12 max-w-3xl space-y-4" aria-labelledby="what">
        <h2 id="what" className="text-3xl">מה זה בר מצווה ובת מצווה?</h2>
        <p className="text-lg leading-relaxed text-[var(--foreground)]/85">"בר מצווה" פירושו "בן מצווה" — מי שהמצוות חלות עליו. לפי ההלכה, בן מגיע לגיל מצוות כשהוא בן 13 ובת כשהיא בת 12, לפי התאריך העברי. מהיום הזה הם נחשבים אחראים למעשיהם, ובמסורת זה הרגע שבו ההורים "מעבירים את המקל".</p>
        <p className="text-lg leading-relaxed text-[var(--foreground)]/85">בקהילות דתיות ומסורתיות הבן עולה לתורה — בשבת, או ביום שני או חמישי — ולפעמים קורא את הפרשה או את ההפטרה, מתחיל להניח תפילין ואומר דרשה. לבת המצווה יש מגוון מנהגים: דבר תורה בסעודה, פרויקט חסד או לימוד, ערב נשים, ובקהילות רפורמיות וקונסרבטיביות גם עלייה לתורה. במשפחות חילוניות רבות מציינים את היום בטיול שורשים, בפרויקט משפחתי, במסיבה או בחגיגה צנועה בבית — ובבתי ספר רבים יש "שנת בר ובת מצווה" עם מסע ותוכנית מיוחדת.</p>
        <p className="text-lg leading-relaxed text-[var(--foreground)]/85">אין דרך אחת נכונה. מה שהופך את היום למשמעותי הוא שהחוגג או החוגגת יהיו שותפים לבחירה — מה חשוב להם, איך הם רוצים לחגוג ומה הם רוצים להגיד.</p>
      </section>

      <Planner />

      <section className="mx-auto mb-12 max-w-3xl" aria-labelledby="tefillin">
        <h2 id="tefillin" className="mb-3 text-3xl">תפילין לבר מצווה — מה כדאי לדעת</h2>
        <ul className="m-0 grid list-none gap-3 p-0 text-lg leading-relaxed">
          <li className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><strong>מתי קונים?</strong> כשלושה־ארבעה חודשים לפני. כתיבת הפרשיות בידי סופר סת״ם והבדיקה לוקחות זמן, ובעונות עמוסות (לפני החגים) ההמתנה ארוכה יותר.</li>
          <li className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><strong>ממי קונים?</strong> מסופר סת״ם או מחנות מוכרת, ומבקשים תעודה שהפרשיות נבדקו (רצוי גם בבדיקת מחשב). המחיר משתנה מאוד לפי רמת ההידור — כדאי לשאול את הרב או את בית הכנסת מה מקובל אצלכם.</li>
          <li className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><strong>לפי איזה מנהג?</strong> יש הבדלים בין אשכנזים, ספרדים וחסידים — בכתב, בצורת הקשר ובאופן ההנחה. אומרים למוכר מה מנהג המשפחה, וגם אם הילד שמאלי (אז מניחים על יד ימין).</li>
          <li className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><strong>מתי מתחילים להניח?</strong> רבים מתחילים כחודש לפני בר המצווה, יש שמתחילים חודשיים לפני, ויש שמתחילים רק ביום עצמו. ב<Link to="/bar-mitzvah/date" className="font-bold underline">מחשבון התאריך</Link> מופיעים התאריכים המשוערים לפי המנהגים הנפוצים.</li>
        </ul>
      </section>

      <section className="mb-12" aria-labelledby="more">
        <h2 id="more" className="mb-4 text-center text-3xl">עוד לבר ולבת מצווה באתר</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {MORE.map(m => <Link key={m.href} to={m.href} className="ln-chip no-underline"><span aria-hidden="true">{m.emoji}</span>{m.title}</Link>)}
        </div>
      </section>

      <SeoBody
        paragraphs={[
          'איך משתמשים בעמוד? מתחילים במחשבון התאריך — הוא מראה מתי בדיוק חל יום ההולדת העברי ה־13 (או ה־12 לבת), באיזו שבת אפשר לעלות לתורה ואיזו פרשה קוראים בה. אחר כך מזינים את מועד החגיגה בלוח הזמנים, ופותחים את הצ׳קליסט המלא כדי לסמן מה כבר נעשה.',
          'כמה חודשים לפני, כשמתחילים לכתוב נאום, מחולל הדרשה עוזר לבני המצווה לסדר את המחשבות: מה מיוחד בהם, מה הם רוצים להגיד על הפרשה ולמי הם רוצים להודות. הטיוטה נשארת שלהם — עורכים, משנים ומדפיסים. לחגיגה עצמה יש חידון על החוגג או החוגגת ומזכרות להדפסה, כמו כרטיסי ברכה שהאורחים ממלאים וקפסולת זמן שנפתחת בגיל 18.',
        ]}
        faq={FAQ}
        related={RELATED}
      />
    </div>
  )
}
