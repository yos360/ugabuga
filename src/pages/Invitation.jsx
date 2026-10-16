import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import InvitationStudio from '../components/invitations/InvitationStudio'

// What to put in an invitation, theme pages and FAQ — static copy under the generator.
const WHAT_TO_WRITE = [
  ['שם וגיל', 'שם החוגג או החוגגת, והגיל שחוגגים. ילדים אוהבים לראות את המספר גדול ובולט.'],
  ['תאריך עם יום בשבוע', '"שישי, 14.11" ולא רק "14.11". כשיש גם יום בשבוע, פחות הורים מתבלבלים.'],
  ['שעת התחלה וגם שעת סיום', 'כך ההורים יודעים מתי לחזור לאסוף, ואתם יודעים כמה זמן יש לתכנן.'],
  ['כתובת מדויקת', 'רחוב, מספר, קומה, או שם הגן או הפארק, ועוד פרט שעוזר למצוא את המקום, כמו "ליד המגלשה הגדולה".'],
  ['אישור הגעה', 'טלפון או קישור לאישור הגעה אונליין, עם תאריך אחרון לאישור — כדי לדעת כמה אורחים להכין ומה להזמין.'],
  ['הערות חשובות', 'מה להביא (בגד ים, בגדים שמותר ללכלך), בקשה לעדכן על אלרגיות, או "בלי מתנות, רק אתם".'],
]
const THEME_LINKS = [
  ['🚀', 'מסיבת חלל', '/ideas/themes/space-birthday'],
  ['🦖', 'מסיבת דינוזאורים', '/ideas/dinosaur-birthday'],
  ['👑', 'מסיבת נסיכות', '/ideas/themes/princess-birthday'],
  ['⚽', 'מסיבת כדורגל', '/ideas/themes/football-birthday'],
  ['🎮', 'מסיבת גיימינג', '/ideas/themes/gaming-birthday'],
]
const FAQ = [
  { q: 'כמה זמן מראש שולחים הזמנה ליום הולדת?', a: 'בדרך כלל שבוע עד שבועיים לפני המסיבה. למסיבה של כל הכיתה או בתקופת חגים כדאי לשלוח קצת יותר מוקדם, ויום או יומיים לפני לשלוח תזכורת קצרה באותה קבוצה.' },
  { q: 'מה נשלח כשלוחצים "שתפו בוואטסאפ"?', a: 'אפשר לשמור את ההזמנה כתמונת PNG ולצרף לוואטסאפ. בטלפון שתומך בשיתוף קבצים, כפתור שיתוף ההזמנה פותח תפריט שבו בוחרים וואטסאפ. יש גם כפתור נפרד לשליחת הפרטים וקישור אישור ההגעה כטקסט.' },
  { q: 'הפרטים שאני ממלא נשמרים באתר?', a: 'התמונה האישית מעובדת רק בדפדפן ואינה נשלחת לשרת. הפרטים אינם נשמרים כטיוטה אחרי רענון. בעת שיתוף, הורדה או הדפסה, טקסט היצירה עשוי להישמר ביומן פרטי של בעל האתר בהתאם למדיניות הפרטיות, ללא התמונה וללא שדות הטלפון והכתובת.' },
  { q: 'אפשר לצרף להזמנה קישור לאישור הגעה?', a: 'כן. לוחצים „יצירת קישור לאישור הגעה”, ממלאים את פרטי האירוע בחלון חדש וחוזרים לכאן עם קישור האורחים. הוא יופיע בהודעת הוואטסאפ ובהזמנה המודפסת, וכל אורח יאשר בלחיצה — מגיעים, לא מגיעים או אולי.' },
  { q: 'אפשר להדפיס את ההזמנה?', a: 'כן. "הדפסה / שמירה כ־PDF" מכין דף A4 בעיצוב שבחרתם, עם כל הפרטים שמילאתם. אפשר להדפיס עותק לכל ילד או לתלות אחד על לוח המודעות בגן.' },
]
function InvitationGuide() {
  return (
    <section className="mx-auto mt-12 max-w-3xl">
      <h2 className="mb-2 text-3xl font-bold">מה כדאי לכתוב בהזמנה ליום הולדת?</h2>
      <p className="mb-5 text-lg leading-relaxed">הזמנה טובה עונה מראש על כל השאלות שההורים ישאלו בקבוצה. אלה הפרטים שכדאי שיהיו בה:</p>
      <div className="grid gap-3 sm:grid-cols-2">{WHAT_TO_WRITE.map(([t, d]) => <div key={t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><h3 className="text-lg font-bold mb-1">{t}</h3><p className="text-[var(--foreground)]/80">{d}</p></div>)}</div>
      <h2 className="mb-2 mt-10 text-3xl font-bold">בחרתם עיצוב? יש גם רעיונות למסיבה</h2>
      <p className="mb-4 text-lg leading-relaxed">לכל עיצוב הזמנה יש מסיבה שמתאימה לו: משחקים, קישוטים ועוגה באותו נושא. כך ההזמנה פותחת את החגיגה עוד לפני שהאורחים מגיעים.</p>
      <div className="mb-10 flex flex-wrap gap-2">{THEME_LINKS.map(([e, t, to]) => <Link key={to} to={to} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{e} {t}</Link>)}</div>
      <SeoBody faq={FAQ} related={[{ label: 'אישור הגעה אונליין', href: '/rsvp' }, { label: 'מדריך הזמנות ליום הולדת', href: '/guides/birthday-invitation-guide' }, { label: 'מחשבון מסיבה', href: '/calculator' }, { label: 'ברכות ליום הולדת', href: '/greeting' }, { label: 'שלטים ליום הולדת להדפסה', href: '/printables/birthday-signs' }, { label: 'איך מתכננים יום הולדת', href: '/guides/how-to-plan-birthday' }]} />
    </section>
  )
}


export default function Invitation() {
 return <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8" dir="rtl">
  <SEO title="הזמנה ליום הולדת עם תמונה — עיצובים לוואטסאפ בחינם" description="שישה עיצובים שונים להזמנת יום הולדת: בלונים, חלל, דינוזאורים, נשף, כדורגל וגיימינג. מוסיפים תמונה, ממלאים פרטים ושומרים כתמונה לוואטסאפ או לסטטוס." path="/invitation" structuredData={faqSchema(FAQ)} />
  <Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'יום הולדת',href:'/birthday'},{label:'הזמנה ליום הולדת'}]} />
  <h1 className="text-center text-3xl sm:text-5xl mb-3">המסיבה מתחילה בהזמנה</h1>
  <p className="text-center text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">עיצוב שאוהבים, תמונה שלכם וכל הפרטים — הזמנה אישית שמוכנה לשליחה בוואטסאפ.</p>
  <InvitationStudio />
  <InvitationGuide />
 </div>
}
