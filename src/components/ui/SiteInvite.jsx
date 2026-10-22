import { Link } from 'react-router-dom'

// Shown on the pages people reach from a shared link (RSVP, thank-you wall, secret-friend draw,
// homework, quizzes): they came for one thing, so offer three things from the site that fit why
// they are here, and a way to make their own. Kept short and below the main task.
// Right after answering an invitation people leave within seconds; a question about themselves
// ("who was born on my day?", "think you're smart?") gets a click where a list of site sections does not.
const HOOKS = {
  title: '🎁 רגע לפני שהולכים…',
  text: 'יש לנו משהו קטן בשבילכם. בחרו מה בא לכם לגלות!',
  links: [
    ['/tools/birthday-famous', '🎂', 'מי נולד ביום שלכם?', 'גלו אילו מפורסמים חוגגים איתכם'],
    ['/trick-questions', '🧠', 'חושבים שאתם חכמים?', '12 שאלות מכשילות — כמה תצליחו?'],
  ],
}

const CONTEXTS = {
  party: {
    title: 'בזמן שאתם כאן 🎈',
    text: 'עוגה בוגה — אתר חינמי למשפחה עם כל מה שצריך למסיבה הבאה.',
    links: [['/games/birthday', '🎲', 'משחקים ליום הולדת'], ['/invitation', '💌', 'הזמנה מעוצבת בחינם'], ['/printables/coloring', '🖍️', 'דפי צביעה להדפסה']],
    own: ['/rsvp', 'גם לכם יש אירוע? יוצרים אישור הגעה בחינם'],
  },
  event: {
    title: 'בזמן שאתם כאן ✨',
    text: 'עוגה בוגה — כלים חינמיים לאירועים, ומשחקים ודפי פעילות לילדים.',
    links: [['/invitation', '💌', 'הזמנה מעוצבת'], ['/tools', '🧰', 'כל הכלים למארגנים'], ['/games', '🎲', 'משחקים לילדים']],
    own: ['/rsvp', 'גם לכם יש אירוע? יוצרים אישור הגעה בחינם'],
  },
  teacher: {
    title: 'עוד מעוגה בוגה לגן ולכיתה 🍎',
    text: 'דפי עבודה, משחקים וכלים חינמיים להורים, לגננות ולמורות.',
    links: [['/classroom', '🏫', 'כלים לכיתה ולגן'], ['/printables', '🖨️', 'דפים להדפסה'], ['/holidays', '🕎', 'פעילויות לחגים']],
    own: ['/thank-you-wall', 'רוצים קיר כזה למורה או לגננת שלכם?'],
  },
  gift: {
    title: 'בזמן שאתם כאן 🎁',
    text: 'עוגה בוגה — משחקים, דפי פעילות ורעיונות לחגים, בחינם.',
    links: [['/holidays', '🕎', 'פעילויות לחגים'], ['/games', '🎲', 'משחקים לקבוצה'], ['/printables/coloring', '🖍️', 'דפי צביעה']],
    own: ['/secret-friend', 'מארגנים הגרלה משלכם? זה לוקח דקה'],
  },
  kids: {
    title: 'סיימתם? יש עוד! 🎮',
    text: 'בעוגה בוגה יש מאות משחקים ודפים לילדים — חינם ובלי הרשמה.',
    links: [['/online-games', '🕹️', 'משחקים אונליין'], ['/printables/coloring', '🖍️', 'דפי צביעה'], ['/learn/reading', '📖', 'הבנת הנקרא']],
    own: null,
  },
}

export default function SiteInvite({ context = 'party', className = '', compact = false }) {
  const c = CONTEXTS[context] || CONTEXTS.party
  // Right under a finished task (e.g. "see you there!" after an RSVP): guests on a phone rarely
  // scroll past the form to the full card, so the same links come as one short row here.
  if (compact) return <nav className={`mt-6 border-t border-slate-200 pt-5 text-center ${className}`} aria-label="עוד באתר עוגה בוגה" dir="rtl">
    <p className="text-xl font-black">{HOOKS.title}</p>
    <p className="mt-1 text-slate-600">{HOOKS.text}</p>
    <div className="mt-4 grid gap-3">{HOOKS.links.map(([to, emoji, label, sub]) => <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-right transition hover:-translate-y-0.5 hover:bg-violet-50">
      <span className="text-4xl" aria-hidden="true">{emoji}</span>
      <span className="flex-1"><b className="block text-lg">{label}</b><small className="text-sm text-slate-600">{sub}</small></span>
      <span className="text-2xl text-slate-500" aria-hidden="true">‹</span>
    </Link>)}</div>
    <p className="mt-3 text-sm text-slate-500">בחינם לגמרי · בלי הרשמה</p>
    {c.own && <p className="mt-3 text-sm"><Link to={c.own[0]} className="font-bold text-violet-700 underline">{c.own[1]} ←</Link></p>}
  </nav>
  return <aside className={`rounded-3xl border-2 border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 text-center ${className}`} aria-label="עוד באתר עוגה בוגה" dir="rtl">
    <h2 className="text-xl font-black">{c.title}</h2>
    <p className="mt-1 text-sm text-slate-600">{c.text}</p>
    <div className="mt-4 grid grid-cols-3 gap-2">{c.links.map(([to, emoji, label]) => <Link key={to} to={to} className="rounded-2xl border-2 border-slate-100 bg-white p-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300">
      <span className="block text-3xl" aria-hidden="true">{emoji}</span>{label}
    </Link>)}</div>
    {c.own && <p className="mt-4 text-sm"><Link to={c.own[0]} className="font-bold text-violet-700 underline">{c.own[1]} ←</Link></p>}
    <p className="mt-2 text-sm"><Link to="/" className="font-bold underline">🎂 לכל האתר</Link></p>
  </aside>
}
