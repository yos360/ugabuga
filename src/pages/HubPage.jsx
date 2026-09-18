import { Link, useLocation } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'

const HUBS = {
  birthday: {
    title: 'מתחם יום הולדת', subtitle: 'כל מה שצריך למסיבה אחת — משחקים, תכנון, אוכל והדפסות.', color: '#fff0ee',
    cards: [
      ['🎮', 'משחקים ליום הולדת', '56 משחקים שמתחילים מיד לפי גיל, זמן וציוד.', '/games/birthday'],
      ['🧺', 'מי מביא מה?', 'רשימה שיתופית: כל הורה תופס פריט בקישור אחד.', '/tools/bring-list'],
      ['🍕', 'מחשבון אוכל ושתייה', 'כמה פיצות, כוסות, שתייה וחטיפים צריך?', '/calculator'],
      ['✅', 'צ׳ק־ליסט למסיבה', 'בית, פארק או כיתה — עם עריכה ושיתוף.', '/printables/birthday-checklist'],
      ['✉️', 'הזמנה וברכות', 'יוצרים הזמנה וברכה אישית למסיבה.', '/invitation'],
      ['🖨️', 'דפי פעילות למסיבה', 'בינגו, דפי צביעה, שלטים ומשימות להדפסה.', '/printables'],
    ],
  },
  classroom: {
    title: 'מתחם לכיתה', subtitle: 'כלים למורים, מדריכים וצהרונים — משחקים, למידה ויצירה במקום אחד.', color: '#eef8ff',
    cards: [
      ['🎮', 'משחקים לכיתה', '76 משחקים לפי גיל, זמן, רעש וציוד.', '/games/classroom'],
      ['🌳', 'עבודת שורשים', 'בונים פרויקט משפחתי עם תמונות, סיפורים וציר זמן.', '/printables/roots-project'],
      ['📰', 'BUGA NEWS', 'עיתון כיתתי או אישי עם כתבות, ריבועים ותמונות.', '/printables/birthday-newspaper'],
      ['🧩', 'דפי פעילות', 'דפי עבודה, רצפים, התאמות, מבוכים וצביעה.', '/printables'],
      ['🎲', 'כלים להפעלה', 'בינגו, טריוויה, חלוקת קבוצות, טיימר ולוח ניקוד.', '/tools'],
      ['🔤', 'תשבצים וחידות', 'יוצרים תשבץ, תפזורת או חידון מותאם לכיתה.', '/tools/crossword-maker'],
    ],
  },
  create: {
    title: 'מתחם יוצרים', subtitle: 'כלי יצירה שהופכים רעיון למשחק, דף או פעילות מוכנה.', color: '#f6efff',
    cards: [
      ['🖨️', 'דפי פעילות להדפסה', 'ספרייה גדולה לפי גיל, נושא ורמת קושי.', '/printables'],
      ['🧩', 'יוצר תשבצים', 'מכניסים מילים ומקבלים תשבץ שאפשר למלא או להדפיס.', '/tools/crossword-maker'],
      ['🔎', 'יוצר תפזורות', 'יוצרים תפזורת אישית מנושא או מרשימת מילים.', '/tools/word-search-maker'],
      ['🎨', 'דפי עבודה וצביעה', 'פעילויות, צביעה, מבוכים והתאמות לילדים.', '/printables/coloring'],
      ['📰', 'BUGA NEWS', 'מעצבים עיתון עם טקסט, תמונות ודפים נוספים.', '/printables/birthday-newspaper'],
      ['💡', 'יוצר משחקים', 'מתחילים מרעיון ומרכיבים פעילות משלכם.', '/tools'],
    ],
  },
}

export default function HubPage({ type }) {
  const { pathname } = useLocation()
  const hub = HUBS[type] || HUBS.birthday
  return <div className="mx-auto max-w-6xl px-4 py-8" style={{ '--hub-bg': hub.color }}>
    <SEO title={`${hub.title} | עוגה בוגה`} description={hub.subtitle} path={pathname} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: hub.title }]} />
    <header className="mx-auto max-w-3xl py-8 text-center"><div className="text-5xl">{type === 'birthday' ? '🎂' : type === 'classroom' ? '🏫' : '✨'}</div><h1 className="mt-3 text-4xl font-black sm:text-6xl">{hub.title}</h1><p className="mt-3 text-xl text-[var(--muted-foreground)]">{hub.subtitle}</p></header>
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={hub.title}>{hub.cards.map(([emoji, title, desc, href]) => <Link key={href} to={href} className="group rounded-3xl border-2 border-slate-200 bg-[var(--hub-bg)] p-6 shadow-[0_6px_0_rgba(20,30,60,.12)] transition hover:-translate-y-1 hover:shadow-[0_9px_0_rgba(20,30,60,.14)]"><div className="text-5xl">{emoji}</div><h2 className="mt-4 text-2xl font-black text-[var(--ink)]">{title}</h2><p className="mt-2 text-lg leading-8 text-[var(--muted-foreground)]">{desc}</p><span className="mt-5 inline-flex rounded-full bg-white px-5 py-2 font-bold text-[var(--ink)]">נכנסים ←</span></Link>)}</section>
  </div>
}
