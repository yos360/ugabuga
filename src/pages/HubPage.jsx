import { Link, useLocation } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'

const HUBS = {
  birthday: {
    title: 'מתחם יום הולדת', subtitle: 'כל מה שצריך למסיבה אחת — משחקים, תכנון, אוכל, הדפסות וספקים.', color: '#fff0ee',
    cards: [
      ['🎮', 'משחקים ליום הולדת', '56 משחקים שמתחילים מיד לפי גיל, זמן וציוד.', '/games/birthday'],
      ['🎪', 'ספקים ליום הולדת', 'מפעילים, קוסמים, עוגות וצילום — פונים ישירות בוואטסאפ.', '/suppliers'],
      ['🧺', 'מי מביא מה?', 'רשימה שיתופית: כל הורה תופס פריט בקישור אחד.', '/tools/bring-list'],
      ['🍕', 'מחשבון אוכל ושתייה', 'כמה פיצות, כוסות, שתייה וחטיפים צריך?', '/calculator'],
      ['✅', 'צ׳ק־ליסט למסיבה', 'בית, פארק או כיתה — עם עריכה ושיתוף.', '/printables/birthday-checklist'],
      ['✉️', 'הזמנה וברכות', 'יוצרים הזמנה וברכה אישית למסיבה.', '/invitation'],
      ['🌟', 'מי נולד ביום ההולדת שלך?', 'מגלים אילו אנשים מפורסמים נולדו באותו תאריך.', '/tools/birthday-famous'],
      ['🖨️', 'דפי פעילות למסיבה', 'בינגו, דפי צביעה, שלטים ומשימות להדפסה.', '/printables'],
    ],
  },
  classroom: {
    title: 'מתחם לכיתה — כלים ומשחקים למורות', subtitle: 'כלים למורים, מדריכים וצהרונים — משחקים, למידה ויצירה במקום אחד.', color: '#eef8ff',
    body: [
      'מתחם לכיתה נבנה בדיוק בשביל מורות ומורים שרוצים כלים מוכנים בלי לבזבז זמן פנוי בחיפוש אחרי רעיונות באינטרנט. הכול נמצא כאן במקום אחד — משחקים לשיעורים ולהפסקות, כלים ליצירת פעילות מותאמת, ותכנים שקשורים ישירות ללימוד.',
      'בתחילת שנה או כשמצטרפים תלמידים חדשים, בינגו היכרות עוזר לבנות אווירה חיובית מהיום הראשון. במעברים בין שיעורים, משחקים ל-5 דקות פנויות כמו חם-קר ממלאים בדיוק את הפער.',
      'טיפ מעשי למורות עמוסות: הכינו מראש "תיק חירום" של 2-3 משחקים בלי ציוד שאפשר לשלוף בכל רגע בלי הכנה.',
    ],
    faq: [
      { q: 'כל הכלים באתר מתאימים לשימוש בכיתה, לא רק בבית?', a: 'כן, רוב הכלים נבנו מלכתחילה גם עבור מורות — מהמדפסות ועד לכלים הדיגיטליים.' },
      { q: 'איך יודעים איזה כלי מתאים לאיזה שלב בשיעור?', a: 'משחקים בלי ציוד וקצרים מתאימים למעברים והפסקות קטנות, וכלים כמו טריוויה או בינגו מתאימים לפעילות מרכזית שדורשת הכנה מראש.' },
    ],
    related: [ { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'בינגו היכרות להדפסה', href: '/tools/bingo-maker' }, { label: 'משחקי היכרות ושוברי קרח', href: '/games/icebreaker' } ],
    cards: [
      ['📝', 'מבחן אמריקאי אונליין', 'יוצרים מבחן, התלמידים עונים מהטלפון והציונים נבדקים לבד.', '/classroom/quiz'],
      ['🎒', 'הכנה לכיתה א׳', 'כתיבה, שעון, חשבון, קריאה וחודשים — בתרגול משחקי.', '/classroom/first-grade'],
      ['🎮', 'משחקים לכיתה', '76 משחקים לפי גיל, זמן, רעש וציוד.', '/games/classroom'],
      ['🌳', 'עבודת שורשים', 'בונים פרויקט משפחתי עם תמונות, סיפורים וציר זמן.', '/printables/roots-project'],
      ['📰', 'BUGA NEWS', 'עיתון כיתתי או אישי עם כתבות, ריבועים ותמונות.', '/printables/birthday-newspaper'],
      ['🧩', 'דפי פעילות', 'דפי עבודה, רצפים, התאמות, מבוכים וצביעה.', '/printables'],
      ['🎲', 'כלים להפעלה', 'בינגו, טריוויה, חלוקת קבוצות, טיימר ולוח ניקוד.', '/tools'],
      ['🔬', 'מעבדת BUGA', 'בוחרים ניסוי, ממלאים דף חקר ומדפיסים.', '/tools/experiment-maker'],
      ['🔤', 'תשבצים וחידות', 'יוצרים תשבץ, תפזורת או חידון מותאם לכיתה.', '/tools/crossword-maker'],
    ],
  },
  create: {
    title: 'מתחם יוצרים — כלים ליצירת פעילות', subtitle: 'כלי יצירה שהופכים רעיון למשחק, דף או פעילות מוכנה.', color: '#f6efff',
    body: [
      'מתחם יוצרים הוא המקום שבו רעיון הופך למוצר מוגמר תוך דקות — בלי צורך במיומנות עיצוב, בלי תוכנה חיצונית, ובלי לשלם על מעצב גרפי. כל כלי כאן לוקח משימה ספציפית ומייצר ממנה קובץ מוכן להדפסה או שימוש מיידי.',
      'הכלים האלה עובדים הכי טוב כשמשלבים כמה מהם יחד לאותו אירוע: מסיבת יום הולדת יכולה להתחיל עם הזמנה שנוצרה במחולל, להמשיך עם בינגו היכרות בכניסה, ולכלול ציד אוצרות כפעילות מרכזית.',
      'טיפ מעשי: אם זו הפעם הראשונה שמשתמשים במתחם, הכי כדאי להתחיל בכלי אחד ספציפי לפי צורך מיידי, ולא לנסות "לגלות" את כל הכלים בבת אחת.',
    ],
    faq: [
      { q: 'כל הכלים במתחם היוצרים חינמיים לשימוש?', a: 'כן, כל הכלים באתר, כולל אלה שיוצרים תוכן להדפסה, זמינים לשימוש חינמי.' },
      { q: 'צריך הרשמה כדי להשתמש בכלי היצירה?', a: 'לא, אפשר להשתמש בכל כלי ישירות מהעמוד שלו, בלי חשבון או הרשמה מוקדמת.' },
    ],
    related: [ { label: 'יוצר ציד אוצרות', href: '/tools/scavenger-hunt-maker' }, { label: 'בינגו היכרות להדפסה', href: '/tools/bingo-maker' }, { label: 'חדרי בריחה להדפסה', href: '/tools/escape-rooms' } ],
    cards: [
      ['🖨️', 'דפי פעילות להדפסה', 'ספרייה גדולה לפי גיל, נושא ורמת קושי.', '/printables'],
      ['🌈', 'מנדלות ויצירה', '70 דפים: מנדלות לילדים ולגדולים, זנטנגל, סימטריה ופיקסלים.', '/printables/mandalas'],
      ['🧩', 'יוצר תשבצים', 'מכניסים מילים ומקבלים תשבץ שאפשר למלא או להדפיס.', '/tools/crossword-maker'],
      ['🔎', 'יוצר תפזורות', 'יוצרים תפזורת אישית מנושא או מרשימת מילים.', '/tools/word-search-maker'],
      ['🎨', 'דפי עבודה וצביעה', 'פעילויות, צביעה, מבוכים והתאמות לילדים.', '/printables/coloring'],
      ['📰', 'BUGA NEWS', 'מעצבים עיתון עם טקסט, תמונות ודפים נוספים.', '/printables/birthday-newspaper'],
      ['🎯', 'בינגו אישי', 'בוחרים נושא או כותבים פריטים ויוצרים כרטיסים להדפסה.', '/tools/bingo-maker'],
      ['🗺️', 'ציד אוצרות אישי', 'מכינים רשימת משימות לבית או לחוץ.', '/tools/scavenger-hunt-maker'],
      ['✏️', 'אותיות למעבר בעיפרון', '22 אותיות בשחור־לבן, בנקודות או בקווים מקווקווים.', '/printables/hebrew-letters'],
      ['📸', 'אביזרי צילום', 'פריט גדול בכל דף A4, בצבע או בשחור־לבן.', '/printables/photo-props'],
    ],
  },
}

export default function HubPage({ type }) {
  const { pathname } = useLocation()
  const hub = HUBS[type] || HUBS.birthday
  return <div className="mx-auto max-w-6xl px-4 py-8" style={{ '--hub-bg': hub.color }}>
    <SEO title={hub.title} description={hub.subtitle} path={pathname} structuredData={faqSchema(hub.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: hub.title }]} />
    <header className="mx-auto max-w-3xl py-8 text-center"><div className="text-5xl">{type === 'birthday' ? '🎂' : type === 'classroom' ? '🏫' : '✨'}</div><h1 className="mt-3 text-4xl font-black sm:text-6xl">{hub.title}</h1><p className="mt-3 text-xl text-[var(--muted-foreground)]">{hub.subtitle}</p></header>
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={hub.title}>{hub.cards.map(([emoji, title, desc, href]) => <Link key={href} to={href} className="group rounded-3xl border-2 border-slate-200 bg-[var(--hub-bg)] p-6 shadow-[0_6px_0_rgba(20,30,60,.12)] transition hover:-translate-y-1 hover:shadow-[0_9px_0_rgba(20,30,60,.14)]"><div className="text-5xl">{emoji}</div><h2 className="mt-4 text-2xl font-black text-[var(--ink)]">{title}</h2><p className="mt-2 text-lg leading-8 text-[var(--muted-foreground)]">{desc}</p><span className="mt-5 inline-flex rounded-full bg-white px-5 py-2 font-bold text-[var(--ink)]">נכנסים ←</span></Link>)}</section>
    {hub.body && <div className="mt-12"><SeoBody paragraphs={hub.body} faq={hub.faq} related={hub.related} /></div>}
  </div>
}
