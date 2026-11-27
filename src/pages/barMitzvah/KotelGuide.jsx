import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { crumbs, SpokeNav } from './shared'

const PATH = '/bar-mitzvah/kotel'

const FAQ = [
  { q: 'צריך לתאם מראש בר מצווה בכותל?', a: 'כן, מומלץ מאוד. הכותל הוא אתר פעיל שבו מתפללים כל היום, ובימי שני וחמישי יש בו כמה חגיגות במקביל. תיאום מראש מול קרן מורשת הכותל המערבי (האתר הרשמי: thekotel.org) עוזר לדעת איפה ומתי נכון לערוך את הטקס, ומה מותר ומה אסור. הנהלים משתנים, ולכן כדאי לבדוק מולם ישירות לפני שמזמינים אורחים.' },
  { q: 'באילו ימים אפשר לעלות לתורה בכותל?', a: 'קוראים בתורה בציבור בימי שני וחמישי, בשבת, בראש חודש, בחגים ובחול המועד, בחנוכה ובפורים ובתעניות ציבור. לכן אלה הימים הנפוצים לבר מצווה: שני וחמישי בבוקר לאחר התפילה, או שבת. בכל יום צריך לבדוק איפה אפשר לקרוא ומה מצופה מהמשפחה.' },
  { q: 'אפשר לצלם בכותל בשבת?', a: 'בשבת ובחגים לא מצלמים בכותל, לפי כללי המקום. לכן משפחות שרוצות תמונות מהטקס בוחרות בדרך כלל יום שני או חמישי, או מצלמות לפני ואחרי השבת במקום אחר. כדאי לשאול את הצלם ואת הקרן מה מותר בדיוק.' },
  { q: 'איך מתלבשים לבר מצווה בכותל?', a: 'לבוש צנוע: כתפיים וברכיים מכוסות לנשים ולגברים, וגברים עם כיסוי ראש (יש כיפות במקום). לבר המצווה כדאי חולצה מכופתרת, ואם יש — טלית ותפילין לימי חול. מזג האוויר בירושלים משתנה, ולכן כדאי להתאים לעונה.' },
  { q: 'ומה בבת מצווה בכותל?', a: 'משפחות רבות מציינות בת מצווה בכותל ברכה, בשירה ובסעודה, והמנהגים משתנים לפי קהילה. לגבי קריאה בתורה, מניין ומקום הטקס ברחבה — יש הסדרים שונים, ולכן מבררים מראש מול הקרן מה אפשרי ובאילו תנאים, ומתאימים את הטקס למנהג המשפחה.' },
  { q: 'כמה זה עולה?', a: 'אין לנו מחירון. התשובה תלויה בפייטנים, בצלם, בהסעות ובמקום הסעודה, ואצל כל ספק המחיר שונה. הדרך הנכונה: לבקש הצעה כתובה משניים־שלושה ספקים לאותו תאריך ולהשוות מה כלול בה.' },
]

const RELATED = [
  { label: 'בר מצווה: מחשבון תאריך ופרשה', href: '/bar-mitzvah/date' },
  { label: 'צ׳קליסט לבר מצווה', href: '/bar-mitzvah/checklist' },
  { label: 'ספקים לבר ובת מצווה', href: '/suppliers/category/mitzvah' },
  { label: 'אישור הגעה לבר מצווה', href: '/rsvp/bar-mitzvah' },
]

const STEPS = [
  ['📅', 'קובעים תאריך', 'מחשבים את התאריך העברי ואת הפרשה ב<מחשבון התאריך>. בוחרים יום שבו קוראים בתורה: שני, חמישי או שבת (ראו למטה). שבת יפה אבל אי אפשר לצלם, ולכן רבים בוחרים בחול.'],
  ['📞', 'מתאמים מול הכותל', 'לפני ששולחים הזמנות פונים לקרן מורשת הכותל המערבי ומתאמים איפה ומתי נערך הטקס, כמה אנשים מגיעים, ומה מותר (הגברה, צילום, הכנסת ציוד). הנהלים משתנים ויש לברר אותם ישירות.'],
  ['🎶', 'בוחרים ספקים', 'פייטנים שילוו בשירה, צלם או צלמת, ואם צריך — הסעה לאורחים וסעודה אחרי הטקס. פרטים בהמשך.'],
  ['📖', 'מתכוננים לקריאה', 'הבר מצווה לומד את הברכות על התורה, ולפעמים גם קריאה בתורה או הפטרה, כחצי שנה עד שנה מראש, עם מורה או רב. אם אין קריאה, מספיקה עלייה עם הברכות.'],
  ['🕍', 'היום עצמו', 'מגיעים מוקדם, עוברים בדיקה ביטחונית, מניחים תפילין (בחול) ועולים לתורה. אחרי העלייה יש שירה, ברכות מההורים וממתקים. אחר כך נוסעים לסעודה.'],
]

const DAYS = [
  ['יום שני וחמישי', 'קריאה בתורה בתפילת שחרית, שלוש עליות. מניחים תפילין. היום הנפוץ ביותר לבר מצווה בכותל, כי אפשר לצלם ולהגיע בקלות.'],
  ['שבת', 'קריאה בשבת בבוקר ועם הפטרה. אין תפילין ואין צילום, ואין הסעות. מי שבוחר בשבת מתארגן עם לינה קרובה בירושלים.'],
  ['ראש חודש', 'קריאה בתורה ביום ראש חודש (גם כשהוא חל בחול). אפשר להתאים לתאריך העברי של הבר מצווה אם הוא קרוב.'],
  ['חגים וחול המועד', 'קוראים בתורה גם בחגים ובחול המועד, ובחנוכה ובפורים. בחגים הרחבה עמוסה מאוד ולכן צריך לתאם מוקדם.'],
  ['תעניות ציבור', 'בצומות קוראים בתורה. לרוב לא בוחרים בהם לחגיגה.'],
]

const BRING = [
  'תעודות זהות לכל המשתתפים. בכניסה יש בדיקה ביטחונית.',
  'תפילין וטלית של הבר מצווה (בימי חול). בשבת וחג לא מניחים תפילין.',
  'כיסוי ראש לגברים (אפשר לשאול במקום), ולבוש צנוע לכולם.',
  'דף עם הברכות על התורה, בעברית ובתעתיק, לכל מי שעולה.',
  'דף הדרשה או דבר התורה, אם מתכננים לומר אותו.',
  'ברכונים לאורחים, אם מחלקים (אפשר להכין כריכה ב<מעצב הברכון>).',
  'ממתקים לחלוקה, אם יש מנהג כזה במשפחה — לברר מראש מה מותר.',
  'מים, כובע ומשקפי שמש בקיץ, מעיל וכיסוי גשם בחורף.',
  'את פרטי איש הקשר של הפייטנים, הצלם ונהג ההסעה, במספר זמין.',
]

const ASK_SINGERS = [
  'איזה סגנון ומנהג (אשכנזי, ספרדי, תימני ועוד) וכמה פייטנים מגיעים?',
  'מה כלול: ליווי לתורה, שירה אחרי העלייה, שירה עם המשפחה?',
  'האם יש הגברה, ואם כן — מה מותר במקום?',
  'מי דואג לתיאום מול הכותל, ומתי הם מגיעים?',
]

const ASK_PHOTO = [
  'האם הצלם מכיר את הכותל ואת כללי הצילום שם?',
  'מה כלול: כמה שעות, תמונות ערוכות, וידאו, אלבום?',
  'מתי מקבלים את החומר, ובאיזה פורמט?',
  'מה קורה אם יורד גשם או שהטקס נדחה?',
]

function Section({ id, title, children }) {
  return (
    <section className="mx-auto mb-10 max-w-3xl" aria-labelledby={id}>
      <h2 id={id} className="mb-3 text-3xl">{title}</h2>
      {children}
    </section>
  )
}

const card = 'rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4'

export default function KotelGuide() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="בר מצווה בכותל — מדריך מלא: ימים, עלייה לתורה, פייטנים והסעות" description="איך עושים בר מצווה בכותל המערבי: באילו ימים קוראים בתורה, איך מתאמים, מה מביאים, איך בוחרים פייטנים וצלם, הגעה והסעות, ושאלות נפוצות. מדריך חינם להורים." path={PATH} structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={crumbs('בר מצווה בכותל')} />
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">🕍 </span>בר מצווה בכותל המערבי — מדריך להורים</h1>
        <p className="mx-auto mt-3 max-w-3xl text-lg leading-relaxed text-[var(--foreground)]/85">עלייה לתורה ליד הכותל היא אחת הדרכים הנפוצות לציין בר מצווה ובת מצווה. כאן תמצאו איך זה עובד, באילו ימים קוראים בתורה, מה מביאים, איך בוחרים פייטנים וצלם ואיך מגיעים — צעד אחר צעד.</p>
      </header>

      <Section id="how" title="איך זה עובד, צעד אחר צעד">
        <ol className="m-0 grid list-none gap-3 p-0 text-lg leading-relaxed">
          {STEPS.map(([e, t, d]) => (
            <li key={t} className={card}>
              <strong><span aria-hidden="true">{e} </span>{t}.</strong> {d.split(/<([^>]+)>/).map((part, i) => i % 2 ? <Link key={i} to={part === 'מחשבון התאריך' ? '/bar-mitzvah/date' : '/bar-mitzvah/birkon'} className="font-bold underline">{part}</Link> : part)}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">הנהלים בכותל משתנים לפי תקופה ויום. המדריך כאן כללי, ואת הפרטים המחייבים מבררים מול <a href="https://www.thekotel.org" target="_blank" rel="noopener noreferrer" className="font-bold underline">קרן מורשת הכותל המערבי</a>.</p>
      </Section>

      <Section id="days" title="באילו ימים קוראים בתורה?">
        <p className="mb-3 text-lg leading-relaxed">עלייה לתורה אפשרית ביום שבו קוראים בתורה בציבור. אלה הימים, ומה מיוחד בכל אחד:</p>
        <div className="grid gap-3">
          {DAYS.map(([t, d]) => <div key={t} className={card}><h3 className="m-0 mb-1 text-xl font-bold">{t}</h3><p className="m-0 leading-relaxed text-[var(--foreground)]/85">{d}</p></div>)}
        </div>
        <p className="mt-3">לא בטוחים מה התאריך? <Link to="/bar-mitzvah/date" className="font-bold underline">מחשבון תאריך בר מצווה</Link> מראה את התאריך העברי, את השבת הקרובה ואת הפרשה, וגם את ימי שני וחמישי הקרובים.</p>
      </Section>

      <Section id="aliyah" title="העלייה לתורה: מה קורה שם?">
        <ul className="m-0 grid list-none gap-3 p-0 text-lg leading-relaxed">
          <li className={card}><strong>הברכות.</strong> הבר מצווה נקרא לתורה, מברך לפני ואחרי הקריאה, ובדרך כלל קורא איתו מישהו שמכיר את הטעמים. בימי שני וחמישי קוראים את תחילת הפרשה של השבת הקרובה.</li>
          <li className={card}><strong>קריאה והפטרה.</strong> יש משפחות שבהן הבר מצווה קורא בעצמו קטע מהתורה, ובשבת גם את ההפטרה. הכנה לקריאה לוקחת חצי שנה עד שנה עם מורה או רב. אפשר גם לעלות רק עם הברכות.</li>
          <li className={card}><strong>אחרי העלייה.</strong> מקובל לשיר, להשמיע ברכות מההורים ומהמשפחה, ולחלק ממתקים (לברר מראש). בימי חול מניחים תפילין לפני העלייה.</li>
          <li className={card}><strong>בנות.</strong> לבת מצווה יש בכותל מנהגים שונים לפי הקהילה. מבררים מראש מול הקרן מה אפשרי, ומתאימים את הטקס למנהג המשפחה.</li>
        </ul>
      </Section>

      <Section id="bring" title="מה מביאים?">
        <ul className={`m-0 list-none space-y-2 p-4 text-lg leading-relaxed ${card}`}>
          {BRING.map(b => <li key={b} className="flex gap-2"><span aria-hidden="true">☐</span><span>{b.split(/<([^>]+)>/).map((part, i) => i % 2 ? <Link key={i} to="/bar-mitzvah/birkon" className="font-bold underline">{part}</Link> : part)}</span></li>)}
        </ul>
      </Section>

      <Section id="suppliers" title="פייטנים וצלמים: איך בוחרים?">
        <p className="mb-3 text-lg leading-relaxed">פייטנים הם זמרים שמלווים את הטקס בשירה: מקבלים את הבר מצווה, שרים סביב העלייה וחוגגים עם המשפחה. מחירים אין לנו — מבקשים הצעה מהספק, ועדיף משניים או שלושה לאותו תאריך.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={card}>
            <h3 className="m-0 mb-2 text-xl font-bold">🎶 מה שואלים את הפייטנים</h3>
            <ul className="m-0 list-disc space-y-1 ps-5 leading-relaxed">{ASK_SINGERS.map(q => <li key={q}>{q}</li>)}</ul>
          </div>
          <div className={card}>
            <h3 className="m-0 mb-2 text-xl font-bold">📸 מה שואלים את הצלם</h3>
            <ul className="m-0 list-disc space-y-1 ps-5 leading-relaxed">{ASK_PHOTO.map(q => <li key={q}>{q}</li>)}</ul>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/suppliers/category/mitzvah" className="ln-chip no-underline"><span aria-hidden="true">✡️</span>ספקים לבר ובת מצווה</Link>
          <Link to="/suppliers/category/photo" className="ln-chip no-underline"><span aria-hidden="true">📸</span>צלמים</Link>
          <Link to="/suppliers/category/video" className="ln-chip no-underline"><span aria-hidden="true">🎬</span>וידאו</Link>
          <Link to="/suppliers/category/music" className="ln-chip no-underline"><span aria-hidden="true">🎧</span>מוזיקה</Link>
          <Link to="/suppliers/category/venues" className="ln-chip no-underline"><span aria-hidden="true">🏡</span>מתחמים לסעודה</Link>
          <Link to="/suppliers" className="ln-chip no-underline"><span aria-hidden="true">🔎</span>כל הספקים</Link>
        </div>
      </Section>

      <Section id="transport" title="הגעה והסעות">
        <ul className="m-0 grid list-none gap-3 p-0 text-lg leading-relaxed">
          <li className={card}><strong>רכב.</strong> הגישה לעיר העתיקה מוגבלת. יש חניונים באזור שער האשפות ומשם הולכים לרחבה. כדאי לבדוק מראש איפה חונים ומה ההליכה לרחבה, במיוחד לקרובים מבוגרים.</li>
          <li className={card}><strong>תחבורה ציבורית.</strong> אפשר להגיע ברכבת הקלה ובאוטובוסים לאזור העיר העתיקה ומשם ללכת. בשבת ובחגים אין תחבורה ציבורית ולכן הולכים ברגל או ישנים בקרבת מקום.</li>
          <li className={card}><strong>הסעה לאורחים.</strong> אם מגיעים הרבה אורחים, אפשר להזמין מיניבוס או אוטובוס מראש. מבקשים הצעה לפי מספר אנשים ונקודת איסוף, ומוודאים איפה הוא עוצר.</li>
          <li className={card}><strong>נגישות.</strong> לסבים וסבתות או לאורחים עם קושי בהליכה כדאי לשאול את הקרן איזו דרך נגישה ואיפה אפשר לרדת.</li>
          <li className={card}><strong>זמן.</strong> לתכנן להגיע לפחות שעה לפני הטקס כדי להספיק בדיקה ביטחונית, חניה ושירותים.</li>
        </ul>
      </Section>

      <section className="ln-box mx-auto mb-10 max-w-3xl text-center" aria-labelledby="rsvp">
        <h2 id="rsvp" className="m-0 mb-2 text-2xl font-bold">💌 מזמינים אורחים? אישור הגעה בקישור אחד</h2>
        <p className="m-0 mb-4">שולחים קישור בוואטסאפ, האורחים עונים בלחיצה, ואתם רואים מי מגיע לכותל ומי רק לסעודה. בחינם ובלי הרשמה.</p>
        <Link to="/rsvp/bar-mitzvah" className="ln-btn inline-block no-underline">ליצור אישור הגעה לבר מצווה</Link>
      </section>

      <SeoBody
        paragraphs={[
          'בר מצווה בכותל משלבת את החגיגה עם מקום שיש בו משמעות לכל משפחה: מתפללים, עולים לתורה, ואחר כך ממשיכים לסעודה במקום אחר בירושלים או בדרך הביתה. המפתח להצלחה הוא תיאום מוקדם — עם הכותל, עם הפייטנים והצלם ועם המשפחה שמגיעה — ולדעת מראש מה מותר ומה אסור במקום.',
          'מחפשים עוד כלים לאירוע? יש צ׳קליסט שמסדר את המשימות לפי תאריך, מחולל דרשה לבר המצווה, כריכה מעוצבת לברכון, כרטיסי ברכה לאורחים וחידון על החוגג.',
        ]}
        faq={FAQ}
        related={RELATED}
      />
      <SpokeNav current={PATH} />
    </div>
  )
}
