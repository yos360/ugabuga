import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet, T, Field } from '../../components/printables/PrintableShell'

// /classroom/kindergarten-farewell — a farewell-from-gan kit for גננות and parents (May–June, and the first day of grade 1):
// a party plan with timing, five original rhymes, a printable memory book (cover + 5 pages), a certificate,
// gift ideas for the גננת and staff, and how to prepare a child emotionally for grade 1.
const PATH = '/classroom/kindergarten-farewell'

const PROGRAM = [
  ['0:00', '10 דקות', 'קבלת פנים', 'מוזיקה שקטה ברקע, הילדים והמשפחות מתיישבים. בקיר או בשולחן תלויות עבודות של הילדים ותמונות מהשנה.'],
  ['0:10', '5 דקות', 'פתיחה וברכה', 'הגננת מקבלת את הפנים, מספרת במשפט או שניים מה היה מיוחד בשנה הזאת ומודה להורים.'],
  ['0:15', '15 דקות', 'המופע של הילדים', 'שני שירים מוכרים וחרוז אחד או שניים מהדף הזה, בקריאה משותפת או בקריאה ותשובה. עדיף קצר ושמח.'],
  ['0:30', '10 דקות', 'מצגת או סרטון', 'תמונות מהשנה עם מוזיקה. כדאי לוודא מראש שיש תמונה של כל ילד, ולא יותר מארבע דקות סרטון.'],
  ['0:40', '10 דקות', 'חלוקת תעודות וספרי זיכרונות', 'כל ילד נקרא בשמו, עולה, מקבל תעודה וחיבוק, ומצטלם עם הגננת.'],
  ['0:50', '5 דקות', 'תודה לגננת ולצוות', 'נציג הוועד או הילדים מעניקים את המתנה (אפשר להקריא את הכרטיס שהילדים חתמו עליו).'],
  ['0:55', '15 דקות', 'כיבוד, צילומים וריקודים', 'שולחן פשוט ופירות במקום ממתקים, צילום קבוצתי של כל הילדים ושל כל משפחה עם הגננת.'],
  ['1:10', '5 דקות', 'שיר סיום ומעגל פרידה', 'כולם עומדים במעגל, שרים שיר אחרון ואומרים ביחד: ״להתראות גן, שלום כיתה א׳!״'],
]

const PARTY_TIPS = [
  'תכננו קצר: הילדים בני חמש–שש, והקשב נגמר אחרי שעה ורבע בערך.',
  'ילד שמתבייש לעלות לבמה לא חייב. הוא יכול לעמוד בשורה ולהקשיב, או לעלות עם חבר.',
  'התאימו את המסיבה לכל המשפחות: כיבוד ללא אגוזים, מקום לסבים וסבתות, וכיסאות לכולם.',
  'אל תשכחו את הצוות: הסייעת והסייעת השנייה צריכות להיות חלק מהרגע, גם בתמונה וגם בדברי התודה.',
]

const RHYMES = [
  { title: 'תודה לגן', note: 'לקריאה משותפת של כל הילדים', lines: ['בגן שיחקנו, ציירנו, שרנו,', 'כל יום משהו חדש למדנו.', 'תודה לגננת, לסייעת האהובה,', 'שהיו לנו כמו משפחה טובה.'] },
  { title: 'גדלנו בגן', note: 'מתאים לשני ילדים שמקריאים בתורות', lines: ['היינו קטנים וקצת מתביישים,', 'והיום אנחנו חברים ושרים.', 'למדנו לספור עד עשר ועוד,', 'ולא לוותר כשקשה מאוד.'] },
  { title: 'שלום, כיתה א׳', note: 'אפשר להוסיף תנועות: תיק על הגב וחיוך', lines: ['כיתה א׳, כיתה א׳, הנה אנחנו באים,', 'עם תיק על הגב וחיוך על הפנים.', 'ספרים ומחברות כבר מחכים שם,', 'ואנחנו מוכנים: שלום כיתה א׳, שלום!'] },
  { title: 'קצת עצוב וקצת שמח', note: 'לילדים שמרגישים את הפרידה. אפשר לקרוא בשקט', lines: ['בלב שלי קצת עצב וקצת צחוק,', 'הגן יישאר איתי גם כשאלך רחוק.', 'אזכור את הציורים והמשחקים,', 'ואת כל החברים, גם הקרובים וגם הרחוקים.'] },
  { title: 'מי היה בגן?', note: 'קריאה ותשובה: הגננת שואלת, הילדים עונים בקול', lines: ['מי שיחק וצחק? אנחנו!', 'מי שר ורקד? אנחנו!', 'מי למד לשתף ולחכות בתור? אנחנו!', 'מי גדל בשנה הזאת קצת יותר? אנחנו!', 'ומי מוכן לכיתה א׳? אנחנו, אנחנו, אנחנו!'] },
]

const GIFTS = [
  ['אלבום או ספר של הילדים', 'דף מכל ילד עם ציור ומשפט תודה, מחוברים לספר. כזה שהגננת תשמור שנים.'],
  ['כרטיס ברכה אישי', 'כל הילדים חותמים או מטביעים כף יד על כרטיס אחד גדול, ואפשר להוסיף שורה מכל הורה.'],
  ['מתנה לשימוש בגן', 'סט צבעים, ספרים לספרייה, צמח לגינה או משחק קבוצתי. דבר שימושי שנשאר בגן.'],
  ['חוויה', 'שובר לארוחת בוקר, ספא או קפה. מתנה אישית שמראה שחשבתם על הגננת עצמה.'],
  ['לצוות כולו', 'אל תשכחו את הסייעות ואת עובדי הניקיון והאחזקה. גם מתנה קטנה ומילה טובה חשובות מאוד.'],
  ['איסוף משותף', 'ועד ההורים אוסף סכום קבוע לכל משפחה, כך שאף הורה לא נלחץ ואין משפחה שנשארת בחוץ.'],
]

const STEPS = [
  ['מדברים על זה מוקדם', 'כבר באפריל או במאי מזכירים בשיחה רגועה: ״עוד מעט תסיימו את הגן ותעברו לכיתה א׳״. כך הילד לא מופתע ויש לו זמן להתרגל.'],
  ['נותנים מקום לכל הרגשות', 'ילדים מרגישים התרגשות, גאווה וגם פחד. אפשר לומר: ״גם לי יש קצת געגוע ויש גם שמחה״. אל תמהרו לתקן או להרגיע.'],
  ['מבקרים בבית הספר', 'ימי היכרות, ביקור בחצר וסיור במבנה עוזרים להפוך מקום זר למקום מוכר. אם אין יום היכרות, אפשר לעבור ליד בית הספר ולהסתכל.'],
  ['מתרגלים שגרה', 'שעת שינה, ארוחת בוקר בזמן, ותיק שהילד אורז לבד. השגרה מרגיעה, וילד שיודע מה צפוי נכנס לכיתה בראש שקט.'],
  ['מחזקים עצמאות', 'לפתוח קופסת אוכל, להתלבש לבד, ללכת לשירותים ולבקש עזרה בקול. אלה מיומנויות קטנות עם משמעות גדולה ביום הראשון.'],
  ['משחקים ״בית ספר״', 'משחק תפקידים עם בובות: מי המורה, מי התלמיד, מה עושים כשצריך ללכת לשירותים או כשלא מוצאים חבר. כך מתרגלים מצבים בלי לחץ.'],
  ['שומרים על קשר עם חברים', 'אם הילד יעבור בנפרד מחבריו, קבעו מפגש קיץ. גם חברות אחת מהגן יכולה להקל מאוד על הכניסה לכיתה חדשה.'],
  ['לא מעמיסים על הקיץ', 'לא צריך ללמוד לקרוא לפני כיתה א׳. מספיק לשחק, לשמוע סיפורים, לצייר ולהכין את הידיים לכתיבה. הלימוד יתחיל ממילא בכיתה.'],
]

const FIRST_DAY = [
  'מכינים תיק ביחד, יום לפני. הילד בוחר לבד מה לשים בו.',
  'מגיעים מוקדם כדי לא למהר, ומצלמים תמונה ליד השער.',
  'נפרדים בקצרה ובחיוך. פרידה ארוכה מגדילה את הפחד.',
  'בסוף היום מקשיבים: ״מה היה הכי כיף? משהו קשה?״ בלי חקירה מוגזמת.',
  'מכינים משהו קטן ומיוחד לצהריים ונותנים לילד לנוח. יום ראשון הוא עייף במיוחד.',
]

const LINKS_G1 = [
  ['הכנה לכיתה א׳ — קורס להורים', '/courses/first-grade'],
  ['דפי הכנה לכיתה א׳ ופתרון בעיות', '/classroom/first-grade'],
  ['דפי עבודה לגן חובה', '/printables/kindergarten-worksheets'],
  ['צליל פותח וצליל סוגר', '/letters/sounds'],
  ['חוברת עבודה לגיל 5', '/booklets/age-5'],
]

const FAQ = [
  { q: 'מתי עושים מסיבת סיום בגן?', a: 'בדרך כלל בסוף השנה, בחודשים מאי–יוני, לפי לוח הגן והחגים. כדאי לקבוע תאריך כמה שבועות מראש כדי שההורים יוכלו להגיע, ולהזמין את כולם בהודעה אחת.' },
  { q: 'כמה זמן צריכה להימשך מסיבת סיום?', a: 'כשעה עד שעה וחצי. בגיל הגן כדאי תוכנית קצרה ועשירה: מופע של 15 דקות, חלוקת תעודות, כיבוד וצילומים. מסיבה ארוכה מעייפת את הילדים.' },
  { q: 'איזה חרוזים מתאימים לילדי גן?', a: 'קצרים, בני ארבע שורות, עם חרוז ברור ותוכן שהילדים מבינים: תודה, חברים, געגוע וציפייה לכיתה א׳. בדף יש חמישה חרוזים מקוריים, אפשר לקרוא אותם יחד או בתורות.' },
  { q: 'מה נותנים כמתנה לגננת?', a: 'מתנה אישית ופשוטה: ספר זיכרונות עם דפים של הילדים, כרטיס עם כפות ידיים, או חוויה. מתנה מכל הילדים יחד עדיפה על הרבה מתנות קטנות. ראו עוד רעיונות בעמוד המתנות למורה.' },
  { q: 'איך מכינים ילד לכיתה א׳?', a: 'מדברים על המעבר מוקדם ובשקט, מבקרים בבית הספר, מתרגלים שגרה ועצמאות, ונותנים מקום לכל הרגשות. אין צורך ללמוד לקרוא מראש: מוכנות רגשית וחברתית חשובה יותר.' },
  { q: 'ילד שלי מפחד מכיתה א׳, מה עושים?', a: 'מקשיבים בלי למהר להרגיע, מספרים על הפעם שאתם התחלתם משהו חדש, ומתרגלים את הדרך לבית הספר. אם החשש חזק וממושך, כדאי לשוחח עם הגננת ועם היועצת של בית הספר.' },
  { q: 'איך מדפיסים את התעודה?', a: 'כותבים את שם הילד, שם הגן והגננת, ולוחצים ״הדפסת התעודה״. התעודה יוצאת בדף A4 אחד, ואפשר להדפיס על נייר עבה יותר. ספר זיכרונות מלא נמצא בעמוד ספר הזיכרונות מהגן.' },
]

// One A4 page wrapper for printing (same markup as PrintableShell).
const A4 = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>

function Ln({ x1 = 22, x2 = 178, y }) {
  return <line x1={x1} x2={x2} y1={y} y2={y} stroke="#64748b" strokeWidth=".35" />
}

function Certificate({ name, gan, teacher, year }) {
  return <g>
    <rect x={7} y={7} width={186} height={256} rx={6} fill="#fffbeb" stroke="#b45309" strokeWidth="1.4" />
    <rect x={12} y={12} width={176} height={246} rx={4} fill="none" stroke="#f59e0b" strokeWidth=".6" />
    <T x={100} y={34} size={13}>🎓 ⭐ 🎒 ⭐ 🎓</T>
    <T x={100} y={58} size={8} fill="#92400e" weight={700}>תעודת סיום</T>
    <T x={100} y={84} size={20} weight={800} fill="#b45309">סיימתי את הגן!</T>
    <T x={100} y={110} size={6} fill="#475569">תעודה זו ניתנת בגאווה</T>
    <T x={100} y={136} size={14} weight={800}>{name || '________________'}</T>
    <Ln x1={45} x2={155} y={140} />
    <T x={100} y={158} size={6} fill="#475569">על סיום מוצלח של גן {gan || '______________'}</T>
    <T x={100} y={170} size={6} fill="#475569">ועל המעבר לכיתה א׳{year ? `, שנת ${year}` : ''}</T>
    <T x={100} y={196} size={9}>🌟 מי שעבר/ה את הגן — מוכנ/ה לכיתה א׳ 🌟</T>
    <Ln x1={28} x2={86} y={235} /><Ln x1={114} x2={172} y={235} />
    <T x={57} y={243} size={4.4} fill="#64748b">{teacher ? `חתימת הגננת: ${teacher}` : 'חתימת הגננת'}</T>
    <T x={143} y={243} size={4.4} fill="#64748b">תאריך</T>
  </g>
}

export default function KindergartenFarewell() {
  const [name, setName] = useState('')
  const [gan, setGan] = useState('')
  const [teacher, setTeacher] = useState('')
  const [year, setYear] = useState('')
  const [print, setPrint] = useState(false)
  const n = name.trim()
  const cert = <Certificate name={n} gan={gan.trim()} teacher={teacher.trim()} year={year.trim()} />
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="פרידה מהגן ומעבר לכיתה א׳ — מסיבה, חרוזים, ספר זיכרונות ותעודה"
      description="כל מה שצריך לפרידה מהגן: תוכנית מסיבת סיום עם זמנים, חמישה חרוזי פרידה מקוריים, תעודת ״סיימתי את הגן״, רעיונות למתנה לגננת ולצוות, והכנה רגשית לכיתה א׳."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'פרידה מהגן' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🎓 </span>פרידה מהגן ומעבר לכיתה א׳</h1>
    <p className="mx-auto mb-6 mt-3 max-w-2xl text-center text-lg">ערכה לגננות ולהורים לסוף השנה: מסיבה, חרוזים להקראה, תעודה, קישור לספר זיכרונות ועזרה להתכונן ליום הראשון בכיתה א׳.</p>
    <nav aria-label="תוכן העמוד" className="mb-8 flex flex-wrap justify-center gap-2">
      {[['party', 'מסיבת פרידה'], ['rhymes', 'חרוזים'], ['book', 'תעודה וספר זיכרונות'], ['gifts', 'מתנות לצוות'], ['grade1', 'הכנה לכיתה א׳']].map(([id, l]) =>
        <a key={id} href={`#${id}`} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-4 py-1.5 font-bold hover:bg-[var(--muted)]/30">{l}</a>)}
    </nav>

    <section id="party" className="mb-10 scroll-mt-24">
      <h2 className="text-3xl">🎉 תוכנית מסיבת פרידה — שעה ורבע</h2>
      <p className="mt-2">תוכנית מוצעת שאפשר להתאים לגן שלכם. הזמנים משוערים.</p>
      <ol className="mt-4 space-y-3">{PROGRAM.map(([t, d, title, text]) => <li key={t} className="flex gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4">
        <div className="w-20 shrink-0 text-center"><div className="text-xl font-black text-violet-700" dir="ltr">{t}</div><div className="text-xs text-[var(--muted-foreground)]">{d}</div></div>
        <div><h3 className="m-0 text-lg font-black">{title}</h3><p className="m-0 mt-1">{text}</p></div>
      </li>)}</ol>
      <ul className="mt-4 list-disc space-y-1 pr-5">{PARTY_TIPS.map(t => <li key={t}>{t}</li>)}</ul>
      <p className="mt-3">מסיבה בהורים וצריך לדעת מי מגיע? <Link to="/rsvp/end-of-year-party" className="font-bold underline">אישור הגעה למסיבת סוף שנה</Link>. תוכנית עם צ׳קליסט לוועד: <Link to="/ideas/kindergarten-graduation" className="font-bold underline">מסיבת סיום גן</Link>.</p>
    </section>

    <section id="rhymes" className="mb-10 scroll-mt-24">
      <h2 className="text-3xl">📜 חמישה חרוזי פרידה לילדים</h2>
      <p className="mt-2">חרוזים קצרים וקלים לזכירה, שנכתבו במיוחד לעמוד הזה. אפשר לקרוא ביחד, בתורות או בקריאה ותשובה.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{RHYMES.map((r, i) => <article key={r.title} className="rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5">
        <h3 className="m-0 text-xl font-black">{i + 1}. {r.title}</h3>
        <p className="m-0 mb-2 text-sm text-[var(--muted-foreground)]">{r.note}</p>
        <p className="m-0 whitespace-pre-line text-lg leading-8">{r.lines.join('\n')}</p>
      </article>)}</div>
    </section>

    <section id="book" className="mb-10 scroll-mt-24">
      <h2 className="text-3xl">🎓 תעודת סיום וספר זיכרונות</h2>
      <p className="mt-2">תעודת ״סיימתי את הגן!״ להדפסה עם שם הילד. ספר זיכרונות מלא (אני בגן, החברים שלי, מה למדתי ועוד) יש בעמוד נפרד.</p>
      <Link to="/printables/kindergarten-memory-book" className="mt-3 block rounded-2xl border-2 border-[var(--border)] bg-[var(--yellow)] p-4 text-center text-lg font-black hover:opacity-90">📖 ספר זיכרונות מהגן להדפסה — לעמוד הספר</Link>
      <div className="mx-auto mt-4 grid max-w-xl gap-3 wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sm:grid-cols-2">
        <Field label="שם הילד או הילדה" value={name} onChange={setName} placeholder="למשל: נועה" maxLength={24} />
        <Field label="שם הגן" value={gan} onChange={setGan} placeholder="למשל: שקד" maxLength={24} />
        <Field label="שם הגננת" value={teacher} onChange={setTeacher} placeholder="אפשר להשאיר ריק" maxLength={24} />
        <Field label="שנת הלימודים" value={year} onChange={setYear} placeholder="למשל: תשפ״ז" maxLength={12} />
      </div>
      <div className="mx-auto mt-5 max-w-[320px] border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm"><Sheet label="תעודת סיום גן">{cert}</Sheet></div>
      <div className="mt-5 flex justify-center"><button type="button" onClick={() => setPrint(true)} className="min-h-[52px] rounded-xl bg-violet-700 px-6 py-3 text-lg font-bold text-white">🎓 הדפסת התעודה</button></div>
    </section>

    <section id="gifts" className="mb-10 scroll-mt-24">
      <h2 className="text-3xl">🎁 מתנה לגננת ולצוות</h2>
      <p className="mt-2">מה שהכי חשוב לגננת הוא התחושה שראו אותה. הנה כמה כיוונים שעובדים.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{GIFTS.map(([t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><h3 className="m-0 text-lg font-black">{t}</h3><p className="m-0 mt-1">{d}</p></li>)}</ul>
      <p className="mt-3">עוד רעיונות לפי תקציב, מחשבון חלוקה לוועד וכרטיס תודה: <Link to="/gifts/teacher-end-of-year" className="font-bold underline">מתנה למורה לסוף השנה</Link>.</p>
    </section>

    <section id="grade1" className="mb-10 scroll-mt-24">
      <h2 className="text-3xl">🎒 איך מכינים ילד לכיתה א׳ מבחינה רגשית</h2>
      <p className="mt-2">המעבר לכיתה א׳ הוא צעד גדול. אלה הדברים שעוזרים להורים ולגננות להפוך אותו לרגוע יותר.</p>
      <ol className="mt-4 space-y-3">{STEPS.map(([t, d], i) => <li key={t} className="flex gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--yellow)] text-lg font-black">{i + 1}</span>
        <div><h3 className="m-0 text-lg font-black">{t}</h3><p className="m-0 mt-1">{d}</p></div>
      </li>)}</ol>
      <h3 className="mt-6 text-2xl">☀️ היום הראשון בכיתה א׳</h3>
      <ul className="mt-2 list-disc space-y-1 pr-5">{FIRST_DAY.map(t => <li key={t}>{t}</li>)}</ul>
      <div className="mt-4 flex flex-wrap gap-2">{LINKS_G1.map(([l, h]) => <Link key={h} to={h} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold hover:bg-[var(--postit)]">{l}</Link>)}</div>
    </section>

    {print && <PrintPreview title="תעודת סיום גן" onClose={() => setPrint(false)}><A4><Sheet label="תעודת סיום גן">{cert}</Sheet></A4></PrintPreview>}

    <SeoBody paragraphs={[
      'סוף שנת הלימודים בגן הוא רגע מרגש: ילדים שהגיעו קטנים ומתביישים עומדים לעבור לכיתה א׳, והגננת והצוות נפרדים מקבוצה שליוו שנה שלמה. עמוד זה מרכז את כל מה שצריך לפרידה: תוכנית למסיבה, חרוזים להקראה, תעודה ורעיונות למתנה (וספר זיכרונות בעמוד נפרד).',
      'תוכנית המסיבה בנויה לשעה ורבע, עם פתיחה, מופע קצר של הילדים, מצגת, חלוקת תעודות, כיבוד ושיר סיום. החרוזים נכתבו במיוחד לעמוד, והם קצרים וקלים לזכירה, כדי שגם ילד שלא אוהב לעלות לבמה יוכל להשתתף. ספר זיכרונות להדפסה יש בעמוד נפרד באתר, והתעודה כאן.',
      'לקראת כיתה א׳ הורים רבים מתלבטים כמה ללמד מראש. התשובה הקצרה: פחות ממה שחושבים. מוכנות רגשית וחברתית, שגרה, עצמאות בסיסית ושיחה פתוחה על רגשות חשובות יותר מקריאה מוקדמת. בחלק האחרון בעמוד יש שלבים פשוטים להורים, ורעיונות ליום הראשון.',
    ]} faq={FAQ} related={[
      { label: 'מסיבת סיום גן', href: '/ideas/kindergarten-graduation' },
      { label: 'מתנה למורה לסוף השנה', href: '/gifts/teacher-end-of-year' },
      { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' },
      { label: 'ספר זיכרונות מהגן', href: '/printables/kindergarten-memory-book' },
      { label: 'תכנית שנתית לגן', href: '/classroom/kindergarten-year-plan' },
    ]} />
  </div>
}
