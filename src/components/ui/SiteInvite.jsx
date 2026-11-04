import { useState } from 'react'
import { Link } from 'react-router-dom'
import { logInviteCta } from '../../utils/liveActivity'

// Shown on the pages people reach from a shared link (RSVP, thank-you wall, secret-friend draw,
// homework, quizzes): they came for one thing, so offer three things from the site that fit why
// they are here, and a way to make their own. Kept short and below the main task.
// Right after answering an invitation people leave within seconds; a question about themselves
// ("who was born on my day?", "think you're smart?") gets a click where a list of site sections does not.
// Every guest gets two different hooks from the pool, and each click is logged as invite-cta:hook:<path>,
// so the owner can see which ones work and keep the winners.
const HOOKS = {
  title: '🎁 רגע לפני שהולכים…',
  text: 'יש לנו משהו קטן בשבילכם. בחרו מה בא לכם לגלות!',
  links: [
    ['/tools/birthday-famous', '🎂', 'מי נולד ביום שלכם?', 'גלו אילו מפורסמים חוגגים איתכם'],
    ['/trick-questions', '🧠', 'חושבים שאתם חכמים?', '12 שאלות מכשילות — כמה תצליחו?'],
    ['/excel', '📗', 'קורס אקסל חינם', '10 שיעורים קצרים עם גיליון חי שבודק אתכם'],
    ['/courses/word', '📝', 'קורס וורד למתחילים', 'מסמך מסודר, טבלאות ועבודה להגשה'],
    ['/tools/nakdan', '🪄', 'נקדן אוטומטי', 'מדביקים טקסט ומקבלים אותו מנוקד'],
    ['/tools/hebrew-birthday', '✡️', 'מה התאריך העברי שלכם?', 'מגלים את יום ההולדת העברי בשנייה'],
    ['/tools/gematria', '🔢', 'כמה שווה השם שלכם?', 'מחשבון גימטריה לשם, למילה או למשפט'],
    ['/typing/test', '⌨️', 'כמה מהר אתם מקלידים?', 'מבחן מהירות של דקה, מילים לדקה'],
    ['/live', '📺', 'חידון לכל המשפחה', 'בוגה לייב: אתם על המסך, כולם עונים מהטלפון'],
    ['/tools/eretz-ir', '🗺️', 'ארץ עיר אונליין', 'הגרלת אות, טיימר וניקוד לכל החבר׳ה'],
    ['/riddles', '🤔', 'חידה של היום', 'חידה חדשה כל יום, עם פתרון בלחיצה'],
    ['/time-tunnel', '⏳', 'מה קרה ביום שנולדתם?', 'מנהרת הזמן של בוגה'],
    ['/brain-games', '🧩', 'אתגר חשיבה', 'גפרורים, דליים ומעבר הנהר — מה הרמה שלכם?'],
    ['/online-games/today', '🎯', 'האתגר היומי', 'משחק אחד ביום — כמה נקודות תשיגו?'],
    ['/chess/puzzles', '♟️', 'חידת שחמט', 'מט בשני מסעים — תמצאו?'],
    ['/flags/quiz', '🌍', 'כמה דגלים אתם מכירים?', 'חידון דגלים מהיר'],
    ['/tools/escape-rooms', '🔐', 'חדר בריחה בבית', 'חידות מוכנות להדפסה ולמשחק'],
    ['/tools/resume', '📄', 'קורות חיים בחינם', '26 תבניות והורדה כ־PDF, בלי סימן מים'],
    ['/tools/pdf', '📑', 'סטודיו PDF', 'מיזוג, פיצול, חתימה והמרה לוורד — חינם'],
    ['/tools/image', '🖼️', 'עורך תמונות', 'מחיקת רקע, כיווץ וקולאז׳ בלי להעלות לשרת'],
    ['/tools/keyboard-fix', '🔁', 'כתבתם בשפה הלא נכונה?', 'akuo → שלום, בלחיצה אחת'],
    ['/tools/qr-code', '🔳', 'קוד QR משלכם', 'מכל קישור, להדפסה או לשליחה'],
    ['/baby-names', '👶', 'מה פירוש השם שלכם?', 'משמעות ומקור של אלפי שמות'],
    ['/courses/ai', '🤖', 'איך משתמשים נכון בצ׳אט GPT?', 'קורס קצר לתלמידים ולהורים'],
    ['/courses/safety', '🛡️', 'הילדים שלכם בטוחים ברשת?', 'קורס קצר לעשות יחד עם הילדים'],
  ],
}
// Two different hooks, picked once per guest (the card only shows after the guest answers, in the browser).
const pickHooks = () => { const p = [...HOOKS.links]; return [0, 1].map(() => p.splice(Math.floor(Math.random() * p.length), 1)[0]) }
// A holiday that is close gets the first card: it is what families are looking for that week.
const SEASONAL = [
  { ends: '2026-12-13', link: ['/holidays/hanukkah', '🕎', 'חנוכה מתקרב!', 'סביבונים, דפי צביעה, מתכונים ומשחקים לכל המשפחה'] },
]
const seasonalHook = () => {
  const today = new Date().toISOString().slice(0, 10)
  return SEASONAL.find(s => today <= s.ends)?.link
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
  bring: {
    title: 'בזמן שאתם כאן 🧺',
    text: 'עוגה בוגה — אתר חינמי למשפחה עם כל מה שצריך למסיבה הבאה.',
    links: [['/games/birthday', '🎲', 'משחקים למסיבה'], ['/invitation', '💌', 'הזמנה מעוצבת בחינם'], ['/rsvp', '✅', 'אישורי הגעה בחינם']],
    own: ['/tools/bring-list', 'מארגנים אירוע? פותחים רשימת "מי מביא מה" בחינם'],
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

// The English site (/en/r/<code>): the same two cards and the fuller card, pointing to English pages.
const HOOKS_EN = {
  title: '🎁 Before you go…',
  text: 'We have a little something for you. Pick one and see!',
  links: [
    ['/en/games/memory', '🧠', 'How good is your memory?', 'Flip the cards and find every pair — how many turns will you need?'],
    ['/en/birthday', '🎂', 'Is your birthday next?', 'Make a free invitation and print a party kit in minutes'],
  ],
}
const CONTEXTS_EN = {
  party: {
    title: 'While you’re here 🎈',
    text: 'Ugabuga is a free family site with plenty for your next party.',
    links: [['/en/games', '🎲', 'Games to play together'], ['/en/birthday', '💌', 'Free printable invitations'], ['/en/coloring-pages', '🖍️', 'Coloring pages to print']],
    own: ['/en/rsvp', 'Hosting something too? Create a free RSVP'],
  },
  event: {
    title: 'While you’re here ✨',
    text: 'Ugabuga — free tools for hosts, plus games and activities for kids.',
    links: [['/en/birthday', '💌', 'Printable invitations'], ['/en/games', '🎲', 'Games for kids'], ['/en/printables', '🖨️', 'Printable activities']],
    own: ['/en/rsvp', 'Hosting something too? Create a free RSVP'],
  },
}

export default function SiteInvite({ context = 'party', className = '', compact = false, lang = 'he' }) {
  const [hooks] = useState(pickHooks)
  if (lang === 'en') return <SiteInviteEn context={context} className={className} compact={compact} />
  const c = CONTEXTS[context] || CONTEXTS.party
  // Right under a finished task (e.g. "see you there!" after an RSVP): guests on a phone rarely
  // scroll past the form to the full card, so the same links come as one short row here.
  // Guests who just answered are the people most likely to host the next event, so making their own
  // comes first as a real button; the cards after it are for staying a minute.
  if (compact) return <nav className={`mt-6 border-t border-slate-200 pt-5 text-center ${className}`} aria-label="עוד באתר עוגה בוגה" dir="rtl">
    {c.own && <Link to={c.own[0]} onClick={() => logInviteCta(context, c.own[0])} className="mb-6 block rounded-2xl bg-violet-600 p-4 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-violet-700">
      <b className="block text-lg">✅ {c.own[1]}</b>
      <small className="text-sm text-violet-100">כמו ההזמנה הזאת — בחינם, בלי הרשמה, שולחים בוואטסאפ</small>
    </Link>}
    <p className="text-xl font-black">{HOOKS.title}</p>
    <p className="mt-1 text-slate-600">{HOOKS.text}</p>
    <div className="mt-4 grid gap-3">{[seasonalHook(), ...hooks].filter(Boolean).map(([to, emoji, label, sub]) => <Link key={to} to={to} onClick={() => logInviteCta('hook', to)} className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-right transition hover:-translate-y-0.5 hover:bg-violet-50">
      <span className="text-4xl" aria-hidden="true">{emoji}</span>
      <span className="flex-1"><b className="block text-lg">{label}</b><small className="text-sm text-slate-600">{sub}</small></span>
      <span className="text-2xl text-slate-500" aria-hidden="true">‹</span>
    </Link>)}</div>
    <p className="mt-3 text-sm text-slate-500">בחינם לגמרי · בלי הרשמה</p>
    <p className="mt-2 text-sm"><Link to="/" className="font-bold underline">🎂 לכל האתר</Link></p>
  </nav>
  return <aside className={`rounded-3xl border-2 border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 text-center ${className}`} aria-label="עוד באתר עוגה בוגה" dir="rtl">
    <h2 className="text-xl font-black">{c.title}</h2>
    <p className="mt-1 text-sm text-slate-600">{c.text}</p>
    <div className="mt-4 grid grid-cols-3 gap-2">{c.links.map(([to, emoji, label]) => <Link key={to} to={to} className="rounded-2xl border-2 border-slate-100 bg-white p-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300">
      <span className="block text-3xl" aria-hidden="true">{emoji}</span>{label}
    </Link>)}</div>
    {c.own && <p className="mt-4 text-sm"><Link to={c.own[0]} onClick={() => logInviteCta(context, c.own[0])} className="font-bold text-violet-700 underline">{c.own[1]} ←</Link></p>}
    <p className="mt-2 text-sm"><Link to="/" className="font-bold underline">🎂 לכל האתר</Link></p>
  </aside>
}

function SiteInviteEn({ context, className, compact }) {
  const c = CONTEXTS_EN[context] || CONTEXTS_EN.party
  if (compact) return <nav className={`mt-6 border-t border-slate-200 pt-5 text-center ${className}`} aria-label="More from Ugabuga" dir="ltr" lang="en">
    <p className="text-xl font-black">{HOOKS_EN.title}</p>
    <p className="mt-1 text-slate-600">{HOOKS_EN.text}</p>
    <div className="mt-4 grid gap-3">{HOOKS_EN.links.map(([to, emoji, label, sub]) => <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 text-left transition hover:-translate-y-0.5 hover:bg-violet-50">
      <span className="text-4xl" aria-hidden="true">{emoji}</span>
      <span className="flex-1"><b className="block text-lg">{label}</b><small className="text-sm text-slate-600">{sub}</small></span>
      <span className="text-2xl text-slate-500" aria-hidden="true">›</span>
    </Link>)}</div>
    <p className="mt-3 text-sm text-slate-500">Completely free · No sign-up</p>
    <p className="mt-3 text-sm"><Link to={c.own[0]} onClick={() => logInviteCta(`${context}-en`, c.own[0])} className="font-bold text-violet-700 underline">{c.own[1]} →</Link></p>
  </nav>
  return <aside className={`rounded-3xl border-2 border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 text-center ${className}`} aria-label="More from Ugabuga" dir="ltr" lang="en">
    <h2 className="text-xl font-black">{c.title}</h2>
    <p className="mt-1 text-sm text-slate-600">{c.text}</p>
    <div className="mt-4 grid grid-cols-3 gap-2">{c.links.map(([to, emoji, label]) => <Link key={to} to={to} className="rounded-2xl border-2 border-slate-100 bg-white p-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300">
      <span className="block text-3xl" aria-hidden="true">{emoji}</span>{label}
    </Link>)}</div>
    <p className="mt-4 text-sm"><Link to={c.own[0]} onClick={() => logInviteCta(`${context}-en`, c.own[0])} className="font-bold text-violet-700 underline">{c.own[1]} →</Link></p>
    <p className="mt-2 text-sm"><Link to="/en" className="font-bold underline">🎂 Explore Ugabuga</Link></p>
  </aside>
}
