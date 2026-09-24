import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { MENU_GROUPS } from '../../data/siteMenu'

const DESC = Object.fromEntries([
  { to: '/tools/trivia-quiz', emoji: '🎯', title: 'טריוויה BUGA', desc: 'טריוויה עם מצבי משחק, ניקוד ותחרות.' },
  { to: '/tools/truth-or-buga', emoji: '🎭', title: 'אמת או בוגה', desc: 'משחק אמת/שקר עם קושי, קבוצות וניקוד.' },
  { to: '/tools/buga-town', emoji: '🏙️', title: 'בוגהטאון', desc: 'משחק עיר ונכסים עם שאלות וקוביות.' },
  { to: '/tools/escape-rooms', emoji: '🔐', title: 'חדרי בריחה', desc: 'חדרים דיגיטליים וקיטים להנחיה.' },
  { to: '/tools/riddles', emoji: '🧩', title: 'חידות', desc: 'מאגר חידות לפי נושא, גיל וקושי.' },
  { to: '/tools/emoji-studio', emoji: '😀', title: 'אימוג׳י סטודיו', desc: 'מנחשים שירים וסרטים באימוג׳ים — או בונים משחק משלכם.' },
  { to: '/tools/bingo-maker', emoji: '🎟️', title: 'מחולל בינגו', desc: 'כרטיסיות בינגו מוכנות או מותאמות אישית.' },
  { to: '/tools/word-search-maker', emoji: '🔎', title: 'מחולל תפזורת', desc: 'צרו תפזורות לפי מילים ונושאים.' },
  { to: '/tools/scavenger-hunt-maker', emoji: '🗺️', title: 'חפש את המטמון', desc: 'רמזים ומשימות מוכנים להפעלה.' },
  { to: '/tools/team-generator', emoji: '🎲', title: 'מחלק קבוצות', desc: 'חלוקה מהירה לקבוצות.' },
  { to: '/tools/random-picker', emoji: '🎡', title: 'גלגל שמות', desc: 'בחירה אקראית למשימות ושמות.' },
  { to: '/tools/countdown-timer', emoji: '⏱️', title: 'טיימר', desc: 'טיימר גדול למשחקים וכיתה.' },
  { to: '/tools/scoreboard', emoji: '📊', title: 'לוח ניקוד', desc: 'ניקוד קבוצות בזמן אמת.' },
  { to: '/tools/dice', emoji: '🎲', title: 'קוביה', desc: 'קוביה וירטואלית למשחקים.' },
  { to: '/tools/coin-flip', emoji: '🪙', title: 'הטלת מטבע', desc: 'בחירה מהירה בין שתי אפשרויות.' },
  { to: '/tools/spin-the-bottle', emoji: '🍾', title: 'סובב את הבקבוק', desc: 'משחק חברתי מהיר.' },
  { to: '/tools/drawing-prompt', emoji: '🎨', title: 'מה לצייר?', desc: 'רעיונות ציור ומשימות יצירה.' },
  { to: '/tools/joke', emoji: '😂', title: 'בדיחה של BUGA', desc: 'בדיחה מהירה לפתיחת פעילות.' },
  { to: '/calculator', desc: 'כמה פיצות, שתייה וחטיפים צריך למסיבה.' },
  { to: '/invitation', desc: 'הזמנה אישית ליום הולדת — להדפסה או לוואטסאפ.' },
  { to: '/greeting', desc: 'ברכה אישית ליום הולדת בכמה קליקים.' },
  { to: '/tools/bring-list', desc: 'רשימה שיתופית: כל הורה תופס פריט בקישור אחד.' },
  { to: '/tools/birthday-famous', desc: 'אילו מפורסמים נולדו באותו תאריך.' },
  { to: '/gifts', desc: 'רעיונות למתנות לפי גיל ותקציב.' },
  { to: '/suppliers', desc: 'מפעילים, קוסמים, עוגות וצילום — פונים ישירות.' },
  { to: '/classroom/quiz', desc: 'התלמידים עונים מהטלפון, הציונים נבדקים לבד.' },
  { to: '/classroom/first-grade', desc: 'כתיבה, שעון, חשבון וקריאה בתרגול משחקי.' },
  { to: '/tools/eretz-ir', desc: 'ארץ עיר עם אותיות, טיימר וניקוד.' },
  { to: '/tools/experiment-maker', desc: 'בוחרים ניסוי, ממלאים דף חקר ומדפיסים.' },
  { to: '/printables/roots-project', desc: 'פרויקט משפחתי עם תמונות, סיפורים וציר זמן.' },
  { to: '/games/kindergarten', desc: 'משחקים קצרים ופשוטים לגן.' },
  { to: '/printables', desc: 'ספרייה של דפי פעילות לפי גיל ונושא.' },
  { to: '/printables/coloring', desc: 'דפי צביעה להדפסה בחינם.' },
  { to: '/printables/mandalas', desc: '70 מנדלות לילדים ולגדולים.' },
  { to: '/tools/crossword-maker', desc: 'מכניסים מילים ומקבלים תשבץ להדפסה.' },
].map(t => [t.to, t.desc]))

export default function ToolsIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="כלים ומשחקים אינטראקטיביים" description="כל הכלים של עוגה בוגה במקום אחד: טריוויה, אמת או בוגה, בוגהטאון, חדרי בריחה, בינגו, תפזורת, טיימר, ניקוד ועוד." path="/tools" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }]} />
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl mb-3">🛠️ כל הכלים של עוגה בוגה</h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--foreground)]/75">כל מה שאפשר להפעיל מיד: בכיתה, במסיבה, בבית או עם חברים.</p>
      </div>
      {MENU_GROUPS.map(group => (
        <section key={group.title} className="mb-10">
          <h2 className="mb-4 text-3xl font-black"><Link to={group.to} className="hover:underline">{group.title}</Link></h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((tool, index) => (
              <Link key={tool.to} to={tool.to} className={`card-lift wobbly-md border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${index % 2 ? 'rotate-1' : '-rotate-1'}`}>
                <span className="text-4xl">{tool.icon}</span>
                <h3 className="mt-3 text-2xl font-bold">{tool.label}</h3>
                {DESC[tool.to] && <p className="mt-2 text-[var(--foreground)]/75">{DESC[tool.to]}</p>}
                <span className="mt-4 inline-block font-display text-lg font-bold underline decoration-dashed">פתחו ←</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <section className="mt-10 wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow-rich">
        <h2 className="text-2xl font-bold">איך לבחור את הכלי הנכון?</h2>
        <div className="mt-4 grid gap-4 text-sm leading-relaxed sm:grid-cols-3">
          <p><strong>ללמידה וידע:</strong> בחרו טריוויה, חידות או אמת או בוגה. כל שאלה כוללת רמת קושי, קהל יעד והסבר לאחר התשובה.</p>
          <p><strong>להפעלה קבוצתית:</strong> בוגהטאון, חדרי בריחה, בינגו ולוח ניקוד מתאימים לכיתה, למסיבה או לפעילות מרחוק.</p>
          <p><strong>למנחה:</strong> אפשר לפתוח טיימר, לחלק קבוצות, להגריל שמות ולהדפיס חומרים. בכל כלי מופיעות הוראות קצרות לפני ההפעלה.</p>
        </div>
        <p className="mt-5 border-t border-[var(--border)]/40 pt-3 text-xs">התוכן העובדתי עובר בדיקה לפני פרסום. תוכן שמשתנה עם הזמן יסומן ככזה וייבדק מחדש לפני שימוש.</p>
      </section>
    </div>
  )
}

