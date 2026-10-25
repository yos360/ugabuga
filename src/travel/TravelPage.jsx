import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import QuickAnswer from '../components/ui/QuickAnswer'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import './travel.css'

export const TRAVEL_INTRO = 'נוסעים עם בוגה — לכל מקום, גם בלי אינטרנט. כל מה שצריך כדי שהדרך תעבור בכיף: חוברות להדפסה לפני שיוצאים, משחקים בלי מסך לכל המשפחה, סיפורים לשמיעה, ו"תיק טיסה" שנשמר בטלפון ועובד גם במצב טיסה. בחינם, בלי הרשמה.'
export function TravelPage({ title, path, intro, faq = [{ q: 'האם צריך להירשם?', a: 'לא. הפעילויות בחינם וללא הרשמה. בחרו פעילות שמתאימה לגיל ולמצב הרוח.' }], children }) {
  return <div className="travel mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title={`${title} — נוסעים עם בוגה`} description={intro} path={path} structuredData={faqSchema(faq)} />
    <nav className="travel-nav"><Link to="/">ראשי</Link> / <Link to="/travel">נוסעים עם בוגה</Link></nav>
    <h1 className="text-4xl font-bold my-4">{title}</h1>
    <QuickAnswer q={title} a={intro} updated="2026-10-25" />
    {children}
    <div className="travel-faq"><SeoBody faq={faq} related={[{ href: '/travel', label: 'כל הפעילויות לדרך' }, { href: '/family/car-games', label: 'משחקים לנסיעה לכל המשפחה' }]} /></div>
  </div>
}
export default function TravelHub() {
  return <TravelPage title="נוסעים עם בוגה" path="/travel" intro={TRAVEL_INTRO} faq={[{ q: 'מה כדאי להכין לפני שיוצאים?', a: 'התחילו במשחק משפחתי בלי ציוד, והכינו דפים מודפסים ומים. פעילות קצרה ומתחלפת מתאימה יותר מתוכנית נוקשה.' }, { q: 'איך משתמשים בלי אינטרנט?', a: 'כשכלי תיק הטיסה זמין, שומרים בו מראש את התוכן הנבחר ופותחים אותו פעם אחת עם אינטרנט לפני היציאה.' }]}>
    <section className="travel-grid">
<Link className="travel-card wobbly sketch-shadow" to="/travel/talk-games"><h2>משחקי דיבור למשפחה</h2><p>פותחים, בוחרים ומכינים לדרך.</p></Link>
<Link className="travel-card wobbly sketch-shadow" to="/travel/listen"><h2>משחקי שמע וחידות</h2><p>פותחים, בוחרים ומכינים לדרך.</p></Link>
<Link className="travel-card wobbly sketch-shadow" to="/travel/stories"><h2>רדיו בוגה — סיפורים לדרך</h2><p>פותחים, בוחרים ומכינים לדרך.</p></Link>

<Link className="travel-card wobbly sketch-shadow" to="/travel/kit"><h2>ערכת טיסה ונסיעה</h2><p>פותחים, בוחרים ומכינים לדרך.</p></Link>
<Link className="travel-card wobbly sketch-shadow" to="/travel/bingo"><h2>בינגו דרכים ושדה תעופה</h2><p>פותחים, בוחרים ומכינים לדרך.</p></Link>
<Link className="travel-card wobbly sketch-shadow" to="/travel/passport"><h2>דרכון נסיעה לילדים</h2><p>פותחים, בוחרים ומכינים לדרך.</p></Link>
<Link className="travel-card wobbly sketch-shadow" to="/travel/journal"><h2>יומן טיול לילדים</h2><p>פותחים, בוחרים ומכינים לדרך.</p></Link>
<Link className="travel-card wobbly sketch-shadow" to="/travel/surprise-bags"><h2>מעטפות הפתעה לכל שעה</h2><p>פותחים, בוחרים ומכינים לדרך.</p></Link>

      <Link className="travel-card wobbly sketch-shadow" to="/travel/offline"><span>💼</span><h2>תיק טיסה — גם בלי אינטרנט</h2><p>שומרים מראש חבילת משחקים למכשיר ופותחים במסך הטיסה.</p></Link>
      <Link className="travel-card wobbly sketch-shadow" to="/family/car-games"><span>🚗</span><h2>משחקים לנסיעה לכל המשפחה</h2><p>משחקי דיבור בלי ציוד ובינגו קיים להדפסה — מתחילים כאן.</p></Link>
    </section>
    <section className="travel-card"><h2>דרך נעימה, בקצב שלכם</h2><p>לא חייבים להעסיק בכל רגע. אפשר להסתכל מהחלון, לדבר, לנוח ולהחליף פעילות כשמתחשק. ההורה הנוסע מפעיל את הפעילויות; הנהג מתרכז בנהיגה.</p></section>
  </TravelPage>
}
