import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import QuickAnswer from '../components/ui/QuickAnswer'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import { TRAVEL_FAQ } from './travelFaq'
import TravelIcon from './TravelIcon'
import './travel.css'

export const TRAVEL_INTRO = 'נוסעים עם בוגה — לכל מקום, גם בלי אינטרנט. כל מה שצריך כדי שהדרך תעבור בכיף: חוברות להדפסה לפני שיוצאים, משחקים בלי מסך לכל המשפחה, סיפורים לשמיעה, ו"תיק טיסה" שנשמר בטלפון ועובד גם במצב טיסה. בחינם, בלי הרשמה.'
export function TravelPage({ title, path, intro, faq, children }) {
  faq = faq || TRAVEL_FAQ[path] || [{q:'האם צריך להירשם?',a:'לא. הפעילויות בחינם וללא הרשמה.'}]
  return <div className="travel mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title={`${title} — נוסעים עם בוגה`} description={intro} path={path} structuredData={faqSchema(faq)} />
    <nav className="travel-nav"><Link to="/">ראשי</Link> / <Link to="/travel">נוסעים עם בוגה</Link></nav>
    <h1 className="text-4xl font-bold my-4">{title}</h1>
    <QuickAnswer q={title} a={intro} updated="2026-10-25" />
    {children}
    <div className="travel-faq"><SeoBody faq={faq} related={[{ href: '/travel', label: 'כל הפעילויות לדרך' }, { href: '/family/car-games', label: 'משחקים לנסיעה לכל המשפחה' }]} /></div>
  </div>
}
const GROUPS=[
 ['מכינים לפני שיוצאים',[
 ['kit','ערכת טיסה ונסיעה','חוברת אישית לפי גיל ומשך הנסיעה.','🎫'],
 ['packing-list','מה לוקחים לדרך?','רשימת אריזה ששומרת את הסימונים במכשיר.','🎒'],
 ['surprise-bags','מעטפות הפתעה','פעילות קטנה לכל שעה, בלי לקנות מתנות.','🧳'],
 ['bingo','בינגו לדרך','דרכים, טיסה ורכבת — במסך או על נייר.','🚐']]],
 ['משחקים ומקשיבים יחד',[
 ['talk-games','משחקי דיבור','כרטיסים להורה ו־30 התחלות לסיפור משותף.','📖'],
 ['listen','משחקי שמע','חידות, חיות ואמת או שקר, בלי ניקוד.','🦅'],
 ['stories','רדיו בוגה','סיפורים ברצף, שעון שינה ושמירה לדרך.','📖'],
 ['waiting-games','רגע, מחכים בתור','28 משחקים לתור, למסעדה ולשדה התעופה.','🕰️']]],
 ['שומרים זיכרונות ורואים את הדרך',[
 ['passport','הדרכון שלי','חותמות, טעמים וציור מכל מקום חדש.','🛂'],
 ['journal','יומן טיול','דף לכל יום — מציירים או כותבים.','📖'],
 ['countdown','כמה עוד נשאר?','מסלול מצויר עם הזמן המשוער שהזנתם.','🚆']]],
 ['מדריכים להורים',[
 ['guides/toddler-flight','איך להעסיק פעוט בטיסה','פעילויות קטנות וקצב שמתאים לילד.','✈️'],
 ['guides/long-car-ride','משחקים לנסיעה ארוכה','רצף גמיש של שיחה, התבוננות ומנוחה.','🚐'],
 ['guides/carry-on-for-kids','מה לארוז בתיק יד','תיק נגיש, קל ומוכן לדרך.','🎒'],
 ['guides/flying-with-baby','טיסה עם תינוק','התארגנות, ישיבה וציוד — עם מקורות בטיחות.','🧸'],
 ['guides/car-sickness','בחילה בנסיעה אצל ילדים','מה עשוי להקל ומתי מתייעצים עם רופא.','🌳']]],
]
export default function TravelHub() {
 return <TravelPage title="נוסעים עם בוגה" path="/travel" intro={TRAVEL_INTRO} faq={[{q:'מה כדאי להכין לפני שיוצאים?',a:'בוחרים מעט פעילויות, מדפיסים דפים שמתאימים לגיל ושומרים את תיק הטיסה כשיש אינטרנט. כדאי לפתוח אותו שוב במצב טיסה לפני היציאה.'},{q:'האם צריך להעסיק את הילדים בכל רגע?',a:'לא. אפשר להסתכל מהחלון, לדבר ולנוח. הפעילויות הן אפשרות נעימה, בלי ניקוד ובלי צורך להספיק הכול.'}]}>
 <section className="travel-hero wobbly sketch-shadow"><img className="travel-mascot" src="/images/home-detective-boy-720.webp" width="220" height="220" alt="חוקר צעיר בעוגה בוגה"/><div><h2>תיק אחד, דרך שלמה</h2><p>חמשת משחקי הדרך, בינגו, טיימר, הסיפורים שבחרתם וה־PDF האחרון — שומרים מראש במכשיר.</p><div className="travel-controls"><Link className="travel-cta" to="/travel/offline">שומרים תיק טיסה</Link><Link className="underline font-bold" to="/travel/play">למסך הטיסה</Link></div></div></section>
 {GROUPS.map(([title,items])=><section key={title} className="travel-section"><h2>{title}</h2><div className="travel-grid">{items.map(([path,label,desc,icon])=><Link key={path} to={'/travel/'+path} className="travel-card wobbly sketch-shadow"><TravelIcon icon={icon}/><h3>{label}</h3><p>{desc}</p></Link>)}</div></section>)}
 <section className="travel-card"><h2>עוד משחקים בלי ציוד</h2><p><Link to="/family/car-games" className="underline font-bold">למשחקי הנסיעה הקיימים לכל המשפחה</Link> — כל הרעיונות נשארים בעמוד המקורי.</p></section>
 <p>ההורה הנוסע מפעיל את הפעילויות; הנהג מתרכז בנהיגה. עושים הפסקה ונחים כשצריך.</p>
 </TravelPage>
}
