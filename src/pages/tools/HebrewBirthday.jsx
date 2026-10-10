import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import { analyze, toISO, MIN_YEAR, MAX_YEAR } from '../../utils/hebrewBirthday'
import '../../learn/learn.css'

const PATH = '/tools/hebrew-birthday'

const FAQ = [
  { q: 'למה יום ההולדת העברי נופל כל שנה בתאריך לועזי אחר?', a: 'הלוח העברי הוא לוח ירחי־שמשי: החודשים נקבעים לפי הירח ואורכם 29 או 30 יום, ושנה עברית פשוטה קצרה בכ־11 יום משנה לועזית. כדי שהחגים לא "יזלגו" בין העונות מוסיפים חודש אדר נוסף בשבע שנים מתוך כל מחזור של 19 שנים. לכן יום ההולדת העברי נודד בטווח של כחודש סביב התאריך הלועזי, ומדי 19 שנה בערך שני התאריכים שוב נפגשים או מתקרבים מאוד.' },
  { q: 'למה חשוב לדעת אם הלידה הייתה אחרי השקיעה?', a: 'ביהדות היממה מתחילה בערב: "וַיְהִי עֶרֶב וַיְהִי בֹקֶר, יוֹם אֶחָד". לכן מי שנולד/ה אחרי השקיעה נולד/ה כבר בתאריך העברי של היום הבא. בשעות שבין השקיעה לצאת הכוכבים (בין השמשות) יש ספק הלכתי, ומי שנולד/ה בדיוק בזמן הזה מוזמן/ת להתייעץ עם רב.' },
  { q: 'באיזה גיל חוגגים בר מצווה ובת מצווה?', a: 'לפי המסורת, בן מגיע למצוות בגיל 13 ובת בגיל 12 — לפי התאריך העברי. המחשבון מראה את התאריך העברי של בר או בת המצווה ואת התאריך הלועזי שבו הוא חל. בפועל משפחות רבות חוגגות בתאריך אחר, קרוב ליום הזה, לפי מה שנוח להן.' },
  { q: 'האם העלייה לתורה חייבת להיות בשבת שאחרי יום ההולדת?', a: 'לא בהכרח. רבים נוהגים לעלות לתורה בשבת הראשונה שאחרי התאריך העברי, ואחרים עולים לתורה ביום שני או חמישי, בראש חודש או בשבת אחרת. המחשבון מציג את השבת הראשונה שבה הילד או הילדה כבר הגיעו למצוות ואת פרשת השבוע שנקראת בה — נקודת פתיחה טובה לשיחה עם בית הכנסת.' },
  { q: 'למה פרשת השבוע בחו״ל יכולה להיות שונה?', a: 'בחו״ל חוגגים יום טוב שני של גלויות. כשהיום הנוסף הזה חל בשבת, קוראים בחו״ל קריאה של חג ובארץ ממשיכים לפרשה הבאה, וכך נוצר פער של שבוע שנמשך לפעמים כמה שבועות עד שהלוחות מתאחדים. המחשבון מציג את הלוח הנהוג בארץ, ומציין כשבחו״ל קוראים פרשה אחרת.' },
  { q: 'מה קורה למי שנולד/ה באדר?', a: 'בשנה מעוברת יש שני חודשי אדר. מי שנולד/ה באדר של שנה פשוטה חוגג/ת בשנה מעוברת, לפי המנהג הרווח, באדר ב׳. מי שנולד/ה באדר א׳ או באדר ב׳ של שנה מעוברת חוגג/ת בשנה מעוברת באותו חודש שבו נולד/ה, ובשנה פשוטה — באדר. יש בעניין דעות שונות, ולכן לפני קביעת מועד בר או בת המצווה מומלץ להתייעץ עם רב.' },
]

const RELATED = [
  { label: 'ברכות לבר מצווה', href: '/greetings/bar-mitzvah' },
  { label: 'ברכות לבת מצווה', href: '/greetings/bat-mitzvah' },
  { label: 'רעיונות לבת מצווה', href: '/ideas/bat-mitzvah-ideas' },
  { label: 'רעיונות לבר מצווה', href: '/ideas/bar-mitzvah-ideas' },
  { label: 'לוח שנה עברי תשפ״ז להדפסה', href: '/printables/calendar-5787' },
  { label: 'מי נולד ביום ההולדת שלך', href: '/tools/birthday-famous' },
]

const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'מחשבון יום הולדת עברי ובר/בת מצווה',
  'url': 'https://ugabuga.co.il' + PATH,
  'applicationCategory': 'UtilitiesApplication',
  'operatingSystem': 'Any',
  'inLanguage': 'he',
  'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'ILS' },
}

const ASK_RABBI = 'כשקובעים מועד לבר או לבת מצווה, מומלץ להתייעץ עם רב.'

// Edge-case explanations keyed by the codes from birthNotes().
const NOTES = {
  cheshvan30: 'התאריך הוא ל׳ בחשוון. חודש חשוון הוא לפעמים בן 29 יום בלבד, ובשנים כאלה המחשבון מציג את יום ההולדת בא׳ בכסלו — היום שאחרי כ״ט בחשוון, לפי הכלל המקובל בלוחות השנה. ' + ASK_RABBI,
  kislev30: 'התאריך הוא ל׳ בכסלו. חודש כסלו הוא לפעמים בן 29 יום בלבד, ובשנים כאלה המחשבון מציג את יום ההולדת בא׳ בטבת — היום שאחרי כ״ט בכסלו, לפי הכלל המקובל בלוחות השנה. ' + ASK_RABBI,
  adarRegular: 'הלידה הייתה באדר של שנה פשוטה. בשנה מעוברת יש שני חודשי אדר, ולפי המנהג הרווח (בעקבות פסק הרמ״א) חוגגים בה את יום ההולדת ואת בר או בת המצווה באדר ב׳ — וכך מוצג כאן. ' + ASK_RABBI,
  adar1: 'הלידה הייתה באדר א׳ של שנה מעוברת. בשנים מעוברות יום ההולדת חל באדר א׳, ובשנים פשוטות (שבהן יש אדר אחד בלבד) — באדר. ' + ASK_RABBI,
  adar1day30: 'הלידה הייתה בל׳ באדר א׳ — יום שקיים רק בשנה מעוברת. בשנים פשוטות אדר בן 29 יום, והמחשבון מציג את יום ההולדת בא׳ בניסן, לפי הכלל המקובל בלוחות השנה. זה מקרה נדיר שיש בו דעות שונות. ' + ASK_RABBI,
  adar2: 'הלידה הייתה באדר ב׳ של שנה מעוברת. בשנים מעוברות יום ההולדת חל באדר ב׳, ובשנים פשוטות — באדר. ' + ASK_RABBI,
}

const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>

const Card = ({ title, children, className = '' }) => (
  <div className={`rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 ${className}`}>
    <h2 className="m-0 mb-2 text-xl font-bold sm:text-2xl">{title}</h2>
    {children}
  </div>
)

function Result({ r, gender }) {
  if (r.status === 'invalid') return null
  if (r.status === 'range') return <p role="status" className="ln-box text-center font-bold">אפשר לבחור תאריך בין {MIN_YEAR} ל־{MAX_YEAR}.</p>
  const m = r.mitzvah
  const boy = gender === 'boy'
  const label = boy ? 'בר המצווה' : 'בת המצווה'
  const share = `התאריך העברי שלי: ${r.birth.hebrew} 🎂\n${label}: ${m.hebrew} (${m.greg})\n${shareLink(PATH, 'hebrew-birthday')}`
  return <div className="space-y-4" aria-live="polite">
    <div className="ln-box bg-[var(--postit)] text-center">
      <p className="m-0 font-bold text-[var(--muted-foreground)]">התאריך העברי של הלידה</p>
      <p className="m-0 font-display text-3xl font-black sm:text-4xl">{r.birth.hebrew}</p>
      <p className="m-0 mt-1">{r.birth.greg}{r.birth.leapYear ? ' · שנה מעוברת' : ''}</p>
    </div>

    <Card title={`🎉 ${label} — גיל ${m.age}`}>
      <p className="m-0 font-display text-2xl font-black">{m.hebrew}</p>
      <p className="m-0">{m.greg}</p>
      <p className="m-0 mt-1 text-sm text-[var(--muted-foreground)]">לפי ההלכה {boy ? 'הוא מגיע' : 'היא מגיעה'} למצוות כבר בערב שלפני, עם צאת הכוכבים: {m.eve}.</p>
      {m.moved && <p className="m-0 mt-1 text-sm font-bold">התאריך הוזז ליום הראשון של החודש הבא, כי בשנה הזאת אין ל׳ בחודש — ראו הסבר למטה.</p>}
      <div className="mt-3 rounded-xl border-2 border-dashed border-[var(--border)] p-3">
        <p className="m-0 font-bold">{m.shabbat.sameDay ? 'התאריך חל בשבת' : `השבת הראשונה אחרי התאריך: ${m.shabbat.greg}`}</p>
        <p className="m-0">{m.shabbat.hebrew} · {m.shabbat.chag ? `חג: ${m.shabbat.parasha} (בשבת הזאת אין פרשה רגילה)` : m.shabbat.parasha} <span className="text-sm text-[var(--muted-foreground)]">(לוח ארץ ישראל)</span></p>
        {m.shabbat.differs && <p className="m-0 mt-1 text-sm">בחו״ל קוראים בשבת הזאת: {m.shabbat.diaspora}.</p>}
      </div>
    </Card>

    {r.upcoming.length > 0 && <Card title="📅 ימי ההולדת העבריים הבאים">
      <ul className="m-0 list-none space-y-2 p-0">
        {r.upcoming.map(u => (
          <li key={u.hyear} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-dashed border-[var(--border)] pb-2 last:border-b-0">
            <span><strong>{u.hebrew}</strong> <span className="text-sm text-[var(--muted-foreground)]">(גיל {u.age})</span></span>
            <span>{u.greg}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-2 text-sm text-[var(--muted-foreground)]">החגיגה העברית מתחילה כבר בערב שלפני התאריך הלועזי.</p>
    </Card>}

    {r.notes.length > 0 && <div className="rounded-2xl border-2 border-[var(--border)] bg-sky-100 p-4">
      <p className="m-0 mb-1 font-bold">שימו לב</p>
      {r.notes.map(n => <p key={n} className="m-0 leading-relaxed">{NOTES[n]}</p>)}
    </div>}

    <div className="text-center">
      <button type="button" className="ln-btn alt" onClick={() => shareOnWhatsApp(share)}>📲 שיתוף בוואטסאפ</button>
    </div>
  </div>
}

export default function HebrewBirthday() {
  const [date, setDate] = useState('')
  const [afterSunset, setAfterSunset] = useState(false)
  const [gender, setGender] = useState('boy')
  // "today" is read on input (client-side), so the prerendered page never carries a stale date.
  const [today, setToday] = useState(null)
  const touch = () => setToday(toISO(new Date()))

  const r = date ? analyze({ date, afterSunset, gender, today }) : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="יום הולדת עברי — המרת תאריך לועזי לעברי ומחשבון בר/בת מצווה" description="מחשבון יום הולדת עברי: הזינו תאריך לידה לועזי וקבלו תאריך עברי, ימי הולדת עבריים בשנים הבאות, מועד בר או בת מצווה ופרשת השבוע — חינם." path={PATH} structuredData={[faqSchema(FAQ), APP_SCHEMA]} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'יום הולדת עברי' }]} />
      <h1 className="mb-2 text-center text-4xl"><span aria-hidden="true">✡️ </span>יום הולדת עברי ומחשבון בר/בת מצווה</h1>
      <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">מזינים תאריך לידה לועזי — ומקבלים את התאריך העברי, את ימי ההולדת העבריים הקרובים ואת מועד בר או בת המצווה.</p>

      <section className="ln-box mb-5 space-y-4" aria-label="מחשבון">
        <label className="block font-bold">
          תאריך לידה (לועזי)
          <input type="date" min={`${MIN_YEAR}-01-01`} max={`${MAX_YEAR}-12-31`} value={date} onChange={e => { setDate(e.target.value); touch() }} className="mt-1 block w-full max-w-xs rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-lg" />
        </label>
        <div>
          <p className="m-0 mb-2 font-bold">הלידה הייתה אחרי השקיעה?</p>
          <div className="flex flex-wrap gap-2">
            <Chip on={!afterSunset} onClick={() => { setAfterSunset(false); touch() }}>לא / לא ידוע</Chip>
            <Chip on={afterSunset} onClick={() => { setAfterSunset(true); touch() }}>כן, אחרי השקיעה 🌙</Chip>
          </div>
          <p className="m-0 mt-1 text-sm text-[var(--muted-foreground)]">היום העברי מתחיל בערב, ולכן מי שנולד/ה אחרי השקיעה נולד/ה כבר בתאריך העברי של היום הבא.</p>
        </div>
        <div>
          <p className="m-0 mb-2 font-bold">בר מצווה או בת מצווה?</p>
          <div className="flex flex-wrap gap-2">
            <Chip on={gender === 'boy'} onClick={() => setGender('boy')}>בן — בר מצווה (13)</Chip>
            <Chip on={gender === 'girl'} onClick={() => setGender('girl')}>בת — בת מצווה (12)</Chip>
          </div>
        </div>
      </section>

      {r && <Result r={r} gender={gender} />}

      <div className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-2xl font-bold">איך מחשבים תאריך עברי לפי תאריך לועזי?</h2>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">הלוח העברי משלב את הירח ואת השמש. החודשים בנויים לפי מחזור הירח, וכל חודש נמשך 29 או 30 יום, ושנה עברית רגילה ארוכה 353 עד 355 ימים — כ־11 יום פחות משנה לועזית. כדי שפסח ייפול תמיד באביב, מוסיפים בשבע שנים מתוך כל 19 שנים חודש שלם, אדר א׳, ושנה כזאת נקראת שנה מעוברת. בגלל ההפרשים האלה התאריך העברי של יום ההולדת זז מדי שנה בתאריך הלועזי, לפעמים בכמה שבועות.</p>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">הנקודה שהכי קל לפספס היא השעה: היום העברי מתחיל בערב ולא בחצות. תינוק שנולד ב־17 בינואר 2022 בבוקר נולד בט״ו בשבט תשפ״ב, אבל אם נולד ב־16 בינואר אחרי השקיעה — גם הוא נולד בט״ו בשבט. לכן כדאי לבדוק בתעודת הלידה או בסיכום האשפוז את שעת הלידה, ולסמן במחשבון אם היא הייתה אחרי השקיעה.</p>
        <h2 className="text-2xl font-bold">איך נקבע מועד בר המצווה ובת המצווה?</h2>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">לפי המסורת, בן מגיע למצוות כשהוא בן 13 ובת כשהיא בת 12 — לפי התאריך העברי ולא לפי הלועזי. היום עצמו מתחיל כבר בערב הקודם, עם צאת הכוכבים. רבים מציינים את בר המצווה בעלייה לתורה בשבת הראשונה שאחרי התאריך, ולכן המחשבון מציג גם את השבת הזאת ואת הפרשה שנקראת בה לפי הלוח הנהוג בארץ. לבת המצווה יש מגוון רחב של מנהגים: יש משפחות שמציינות אותה בבית הכנסת, יש שבוחרות בדבר תורה, בפרויקט אישי או במסיבה, ויש שמשלבות כמה מהם.</p>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">התאריך הלועזי של בר או בת המצווה יכול להיות רחוק בכמה שבועות מיום ההולדת הלועזי. כדאי לבדוק אותו מוקדם, לפני שסוגרים אולם או מזמינים ספקים. מחפשים השראה? ב<Link to="/ideas/bat-mitzvah-ideas" className="font-bold underline">רעיונות לבת מצווה</Link> וב<Link to="/ideas/bar-mitzvah-ideas" className="font-bold underline">רעיונות לבר מצווה</Link> יש רעיונות לחגיגה, לפרויקט ולנאום.</p>
      </div>

      <p className="mt-6 rounded-2xl border-2 border-dashed border-[var(--border)] p-3 text-sm leading-relaxed">
        <strong>חשוב לדעת:</strong> המחשבון מבוסס על חישוב הלוח העברי הקבוע ועל לוח פרשות השבוע הנהוג בארץ. במקרים מיוחדים — לידה בין השמשות, ל׳ בחשוון או בכסלו, או לידה באדר — יש מנהגים ודעות שונים, ולפני קביעת מועד לבר או לבת מצווה מומלץ להתייעץ עם רב או עם בית הכנסת.
      </p>

      <div className="mt-8">
        <SeoBody faq={FAQ} related={RELATED} />
      </div>
    </div>
  )
}
