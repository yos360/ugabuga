import '../../learn/learn.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { britDate, eveOfBrit } from '../../utils/britDate'

// /brit: a calm, factual guide for parents planning a brit milah (and a note on welcoming a baby girl).
// Customs differ between communities, so the page describes the common order and says to ask the mohel and the rabbi.

const PATH = '/brit'

const FAQ = [
  { q: 'מתי עושים ברית מילה?', a: 'ביום השמיני ללידה. היום שבו נולד התינוק נחשב יום ראשון, כך שתינוק שנולד ביום ראשון בצהריים נימול בדרך כלל ביום ראשון שאחריו. מי שנולד אחרי השקיעה נספר מהיום העברי הבא. הברית נערכת גם בשבת וביום טוב כשהתינוק בריא. אם יש סיבה רפואית, הרופא והמוהל קובעים אם לדחות, והברית נערכת כשהתינוק בריא.' },
  { q: 'איך בוחרים מוהל?', a: 'מחפשים מוהל מוסמך שהוסמך על ידי הרבנות הראשית או גוף מוכר ויש לו ניסיון. שואלים בבית החולים, בקהילה ובמשפחה, ופוגשים או מדברים עם המוהל לפני הלידה אם אפשר. שואלים על הכשרה והסמכה, כמה בריתות הוא עושה, מה הוא מביא, איך הוא מטפל בתינוק אחרי הברית ומה לעשות אם משהו לא בסדר. יש מוהלים שהם גם רופאים.' },
  { q: 'מה התפקיד של הסנדק?', a: 'הסנדק הוא מי שמחזיק את התינוק על ברכיו בשעת המילה, והוא נחשב לכבוד גדול. לרוב הוא סבא, אבא של האבא, דוד או אדם קרוב שההורים רוצים לכבד. הוא יושב על כיסא אליהו או לידו. ההורים בוחרים, ואין חובה בסנדק מסוים.' },
  { q: 'צריך מניין?', a: 'נהוג לערוך ברית בנוכחות מניין (עשרה גברים), כי הברית נחשבת אירוע ציבורי, אבל גם בלעדיו אפשר לעשות את המילה. שואלים את המוהל או את הרב איך נהוג בקהילה שלהם, וגם איפה מקובל לערוך — בבית, באולם או בבית כנסת.' },
  { q: 'מה עם תינוקת?', a: 'לבת אין ברית מילה, אבל יש משפחות שמציינות את הולדתה בטקס קבלת פנים: בית הכנסת בשבת עם קריאת השם, "זבד הבת", "שמחת בת" או "בריתה" בבית עם ברכות, שירים וסעודה. אין סדר אחד, והמשפחה בוחרת לפי הקהילה והמנהג. אפשר לשלב קריאת שם, דברי תורה ושירה, ולהזמין את המשפחה.' },
  { q: 'כמה עולה ברית?', a: 'אין לנו מחירים. עלות הברית תלויה במוהל, במקום, בכמות האורחים ובמה שמגישים. שואלים כל ספק מראש מה כלול בהצעה, ומשווים בין שתיים או שלוש הצעות.' },
]

const RELATED = [
  { label: 'אישור הגעה לברית', href: '/rsvp/brit' },
  { label: 'שמות לתינוקות', href: '/baby-names' },
  { label: 'מחולל הזמנות', href: '/invitation' },
  { label: 'ספקים לאירועים', href: '/suppliers' },
]

const ORDER = [
  ['הכנסת התינוק', 'התינוק מוכנס לחדר על ידי הקוורטר והקוורטרין (בני זוג שנושאים אותו), ומקבלים אותו בשירת "ברוך הבא". מניחים אותו על כיסא אליהו או על כרית.'],
  ['הסנדק מחזיק', 'מעבירים את התינוק לסנדק, שמחזיק אותו על ברכיו בשעת המילה.'],
  ['המילה והברכות', 'המוהל מברך, האב מברך (על המילה ועל "להכניסו בבריתו של אברהם אבינו") והמוהל מבצע את המילה. הקהל עונה "כשם שנכנס לברית, כן ייכנס לתורה, לחופה ולמעשים טובים".'],
  ['ברכת היין', 'מברכים על כוס יין (או מיץ ענבים), ואחר כך אומרים בקשה לתינוק: "אלוקינו ואלוקי אבותינו, קיים את הילד הזה לאביו ולאמו".'],
  ['קריאת השם', 'התינוק מקבל את שמו. מי שמכריז על השם הוא המוהל או הרב, וההורים כבר החליטו עליו. אפשר להסביר לאורחים את משמעותו.'],
  ['סעודת מצווה', 'אחרי הברית עורכים סעודה חגיגית. בסוף הסעודה מברכים ברכת המזון, ומוסיפים בה "הרחמן" מיוחד לברית.'],
]

const ROLES = [
  ['👶', 'האב והאם', 'ההורים מקבלים את ההחלטות: בוחרים מוהל, שם, מקום ואורחים. לפי ההלכה האב הוא שמצווה על המילה, והמוהל פועל כשליח שלו. האם נמצאת בדרך כלל בחדר סמוך עם התינוק לפני ואחרי הטקס.'],
  ['🧑‍⚕️', 'המוהל', 'מבצע את הברית. מוהל טוב הוא מוסמך, מנוסה ורגוע, ומסביר להורים מה צפוי ואיך מטפלים בתינוק בימים אחרי הברית.'],
  ['🪑', 'הסנדק', 'מחזיק את התינוק על ברכיו בשעת המילה. כבוד גדול, שנהוג לתת לסבא או לקרוב. הסנדק יושב על כיסא אליהו או לידו.'],
  ['🤲', 'קוורטר וקוורטרין', 'זוג (נהוג שזוג נשוי, ולפעמים שני קרובים) שמביאים את התינוק מהאם אל הטקס ואחר כך מחזירים אותו. מי שנושא את התינוק צריך לדעת להחזיק אותו בבטחה.'],
  ['📜', 'מכבדים נוספים', 'אפשר לכבד בקריאה, בברכה, באמירת הברכות לפני המילה ובברכת היין. כך כל סבא, סבתא וקרוב מקבלים תפקיד. אף אחד לא חייב, וההורים מחליטים.'],
]

const LIST = [
  ['לפני הלידה', [
    'לבחור מוהל ולברר אם הוא פנוי בימים הצפויים',
    'לבחור מקום: הבית, אולם או בית כנסת, ולברר אם אפשר לערוך שם',
    'לחשוב על רשימת מוזמנים ועל תקציב',
    'להחליט מי יהיו הסנדק, הקוורטר והקוורטרין',
    'להתייעץ עם הרב או עם המוהל אם יש שאלה על מנהג המשפחה',
  ]],
  ['בימים שאחרי הלידה', [
    'לאשר עם הרופא ועם המוהל שהתינוק בריא והברית נערכת ביום השמיני',
    'לבחור שם לתינוק (ולהחליט מתי מכריזים עליו)',
    'לשלוח הזמנות ואישורי הגעה',
    'להזמין אוכל, עוגה וכיסאות לפי מספר האורחים',
    'להזמין צלם, אם רוצים',
  ]],
  ['ביום הברית', [
    'כיסא אליהו, כרית וחדר שקט לתינוק ולאם',
    'יין או מיץ ענבים, כוס וכיסוי לשולחן',
    'כיפות לאורחים שצריכים, ודפי ברכות או ברכונים',
    'מגבות וחיתולים, בגדי החלפה ובקבוק או כל מה שהתינוק צריך',
    'מים ואוכל קל לאם, ולקבלת האורחים',
  ]],
]

const card = 'rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4'

function BritDate() {
  const [date, setDate] = useState('')
  const [after, setAfter] = useState(false)
  const b = date ? britDate(date, after) : null
  const eve = date ? eveOfBrit(date, after) : null
  return (
    <section className="ln-box mb-10" aria-labelledby="calc">
      <h2 id="calc" className="m-0 mb-1 text-2xl font-bold">📅 באיזה יום הברית?</h2>
      <p className="m-0 mb-3 text-[var(--muted-foreground)]">מזינים את תאריך הלידה ורואים מתי היום השמיני. לא נשמר ולא נשלח.</p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="block font-bold">תאריך לידה
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-lg" />
        </label>
        <button type="button" className="ln-chip" aria-pressed={after} onClick={() => setAfter(v => !v)}>נולד אחרי השקיעה</button>
      </div>
      {b && (
        <div className="mt-4 rounded-2xl bg-white p-4" role="status" aria-live="polite">
          <p className="m-0 text-xl font-bold">הברית: {b.text}</p>
          {eve && <p className="m-0 mt-1">היום שלפני: {eve.text}</p>}
          {b.shabbat && <p className="m-0 mt-2">התאריך חל בשבת. כשהתינוק בריא, הברית נערכת בשבת. מתאמים מראש עם המוהל ועם הרב איך נהוג אצלכם.</p>}
          {b.friday && <p className="m-0 mt-2">התאריך חל ביום שישי. כדאי להתחיל מוקדם כדי שהסעודה תסתיים לפני כניסת שבת.</p>}
          <p className="m-0 mt-2 text-sm text-[var(--muted-foreground)]">זה חישוב כללי. אם התינוק נולד סמוך לשקיעה, או אם יש סיבה רפואית, ההחלטה נעשית עם הרב, המוהל והרופא.</p>
        </div>
      )}
    </section>
  )
}

function PrintSheet() {
  return (
    <div className="buga-a4" style={{ alignItems: 'stretch' }}>
      <h2>👶 צ׳קליסט לברית</h2>
      {LIST.map(([t, items]) => (
        <div key={t} style={{ marginTop: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{t}</div>
          {items.map(i => <div key={i} style={{ fontSize: 13.5, marginTop: 3 }}>☐ {i}</div>)}
        </div>
      ))}
      <footer>ugabuga.co.il/brit</footer>
    </div>
  )
}

export default function BritGuide() {
  const [print, setPrint] = useState(false)
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="ברית מילה — מדריך להורים: מה מכינים, סדר הטקס ומי עושה מה" description="מדריך להורים לברית מילה: חישוב היום השמיני, צ׳קליסט הכנות, סדר הטקס בקצרה, תפקידי הסנדק, הקוורטר והמוהל, סעודת מצווה ואישור הגעה. חינם." path={PATH} structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ברית מילה — מדריך להורים' }]} />
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">👶 </span>ברית מילה — מדריך להורים</h1>
        <p className="mx-auto mt-3 max-w-3xl text-lg leading-relaxed text-[var(--foreground)]/85">ברית מילה היא אחד האירועים המרגשים בחיי משפחה, ובדרך כלל מתארגנים אליה בשבוע שבו יש תינוק חדש בבית. כאן מסודר מה מכינים, איך הטקס מתנהל בקצרה, מי עושה מה ואיך מארגנים את הסעודה. המנהגים משתנים בין קהילות, ולכן את הפרטים כדאי להשלים עם המוהל ועם הרב שלכם.</p>
      </header>

      <BritDate />

      <section className="mx-auto mb-10 max-w-3xl" aria-labelledby="prep">
        <h2 id="prep" className="mb-3 text-3xl">מה מכינים?</h2>
        <div className="grid gap-4">
          {LIST.map(([t, items]) => (
            <div key={t} className={card}>
              <h3 className="m-0 mb-2 text-xl font-bold">{t}</h3>
              <ul className="m-0 list-none space-y-1 p-0 text-lg leading-relaxed">{items.map(i => <li key={i} className="flex gap-2"><span aria-hidden="true">☐</span><span>{i}</span></li>)}</ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center"><button type="button" className="ln-btn" onClick={() => setPrint(true)}>🖨️ להדפסה</button></p>
        {print && <PrintPreview title="צ׳קליסט לברית" onClose={() => setPrint(false)}><PrintSheet /></PrintPreview>}
      </section>

      <section className="mx-auto mb-10 max-w-3xl" aria-labelledby="order">
        <h2 id="order" className="mb-3 text-3xl">סדר הטקס בקצרה</h2>
        <ol className="m-0 grid list-none gap-3 p-0 text-lg leading-relaxed">
          {ORDER.map(([t, d], i) => <li key={t} className={card}><strong>{i + 1}. {t}.</strong> {d}</li>)}
        </ol>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">זה הסדר הנפוץ. בין עדות ובין קהילות יש הבדלים בנוסח, בשירים ובסדר. המוהל מכיר את המנהג ומוביל את הטקס.</p>
      </section>

      <section className="mx-auto mb-10 max-w-3xl" aria-labelledby="roles">
        <h2 id="roles" className="mb-3 text-3xl">מי עושה מה?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map(([e, t, d]) => <div key={t} className={`flex gap-3 ${card}`}><span className="text-3xl" aria-hidden="true">{e}</span><div><h3 className="m-0 text-lg font-bold">{t}</h3><p className="m-0 leading-relaxed text-[var(--foreground)]/85">{d}</p></div></div>)}
        </div>
      </section>

      <section className="mx-auto mb-10 max-w-3xl" aria-labelledby="meal">
        <h2 id="meal" className="mb-3 text-3xl">סעודת מצווה</h2>
        <div className="space-y-3 text-lg leading-relaxed">
          <p>אחרי הברית עורכים סעודה, והיא נחשבת סעודת מצווה: חלק מהשמחה על הילד החדש. אפשר לערוך אותה בבית, באולם או בבית הכנסת, והיא יכולה להיות פשוטה (עוגה, פירות ושתייה) או סעודה מלאה. נהוג לשמור על כשרות כדי שכל האורחים יוכלו לאכול.</p>
          <p>בסוף הסעודה מברכים ברכת המזון, ומוסיפים בה בקשות מיוחדות לברית. את הנוסח אפשר להשיג בברכון מודפס, ויש משפחות שמחלקות דפים עם הנוסח לכל שולחן. כדאי לשאול את המוהל מי מכבדים בהנחיית הברכה.</p>
          <p>כדי לדעת כמה אנשים מגיעים, אפשר לשלוח <Link to="/rsvp/brit" className="font-bold underline">אישור הגעה לברית</Link>: קישור אחד בוואטסאפ, והאורחים עונים בלחיצה.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/suppliers/category/catering" className="ln-chip no-underline"><span aria-hidden="true">🍕</span>קייטרינג</Link>
          <Link to="/suppliers/category/cakes" className="ln-chip no-underline"><span aria-hidden="true">🎂</span>עוגות</Link>
          <Link to="/suppliers/category/venues" className="ln-chip no-underline"><span aria-hidden="true">🏡</span>מתחמים</Link>
          <Link to="/suppliers/category/photo" className="ln-chip no-underline"><span aria-hidden="true">📸</span>צילום</Link>
          <Link to="/baby-names" className="ln-chip no-underline"><span aria-hidden="true">🍼</span>שמות לתינוקות</Link>
        </div>
      </section>

      <section className="ln-box mx-auto mb-10 max-w-3xl text-center" aria-labelledby="rsvp">
        <h2 id="rsvp" className="m-0 mb-2 text-2xl font-bold">💌 מזמינים? אישור הגעה בלי לרדוף</h2>
        <p className="m-0 mb-4">יוצרים קישור, שולחים בוואטסאפ ורואים מי מגיע וכמה, כדי לדעת כמה כיסאות ואוכל להכין. בחינם ובלי הרשמה.</p>
        <Link to="/rsvp/brit" className="ln-btn inline-block no-underline">ליצור אישור הגעה לברית</Link>
      </section>

      <SeoBody
        paragraphs={[
          'הברית עצמה קצרה, אבל סביבה יש הרבה החלטות: מי המוהל, איפה נערכת הברית, מי הסנדק, ומה השם. הדרך הכי רגועה היא להתחיל לפני הלידה: לבחור מוהל, לברר אילו אפשרויות מקום יש, ולהתייעץ עם המשפחה. כשהתינוק נולד, נשאר רק לאשר את התאריך עם הרופא והמוהל.',
          'לתינוקת יש מנהגים שונים לקבלת פנים, וכל משפחה בוחרת מה מתאים לה. הכרזת השם בבית הכנסת בשבת, מפגש משפחתי עם ברכות ושירים או סעודה קטנה — כל אחד מהם הוא דרך יפה לציין את הולדתה.',
        ]}
        faq={FAQ}
        related={RELATED}
      />
    </div>
  )
}
