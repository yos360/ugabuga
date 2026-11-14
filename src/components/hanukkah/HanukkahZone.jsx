import { Link } from 'react-router-dom'

// "אזור חנוכה" — the top of the Hanukkah hub: one row per kind of thing people come for
// (play together, games, songs, learning, for the class), each with its best pages.
const ZONES = [
  {
    emoji: '✨', title: 'עושים יחד', color: 'bg-indigo-100',
    links: [
      ['🕎', 'החנוכייה המשותפת', 'כל המשפחה או הכיתה מדליקה נר מהטלפון — חנוכייה חדשה בכל ערב', '/hanukkiah'],
      ['⚡', 'בוגה לייב — חידון חנוכה חי', 'עד 100 משתתפים עונים מהטלפונים, והמסך הגדול מראה מי מוביל', '/live?topic=hanukkah'],
      ['🎉', 'מסיבת חנוכה', 'משחקים, אוכל ותוכנית למסיבה בבית, בגן ובכיתה', '/ideas/hanukkah-party'],
    ],
  },
  {
    emoji: '🎮', title: 'משחקים', color: 'bg-pink-100',
    links: [
      ['🎲', 'סביבון וירטואלי', 'מסובבים בלחיצה, עם ניקוד לכל המשפחה', '/holidays/hanukkah/sevivon'],
      ['❓', 'חידון חנוכה', '3 רמות, הסבר אחרי כל תשובה', '/holidays/hanukkah/quiz'],
      ['🔐', 'חדר בריחה: פך השמן', 'על המקרן לכל הכיתה, או להדפסה', '/holidays/hanukkah/escape-room'],
      ['🗺️', 'ציד מטמון לחנוכה', 'רמזים להדפסה, מחביאים ויוצאים לחפש', '/treasure-hunt/hanukkah'],
      ['🧩', 'חידות לחנוכה', 'חידות עם תשובות לכל הגילים', '/riddles/hanukkah'],
      ['🏆', 'טריוויה חנוכה', 'שאלות לילדים, ולמבוגרים בנפרד', '/trivia/hanukkah'],
    ],
  },
  {
    emoji: '🎵', title: 'שירים', color: 'bg-yellow-100',
    links: [
      ['🎵', 'כל שירי חנוכה', 'סביבון, כד קטן, באנו חושך לגרש, מעוז צור ועוד — על מה כל שיר ומתי שרים אותו', '/holidays/hanukkah/songs'],
      ['📜', 'ברכות ההדלקה ומעוז צור', 'כרטיס להדפסה, לשים ליד החנוכייה', '/holidays/hanukkah/candle-lighting'],
      ['🕯️', 'זמני הדלקת נרות', 'לפי עיר, לכל שמונת הלילות', '/holidays/hanukkah/candle-times'],
    ],
  },
  {
    emoji: '📚', title: 'לומדים', color: 'bg-green-100',
    links: [
      ['📖', 'סיכומים על חנוכה', 'המכבים, ההלניזם, נס פך השמן והמקורות — לפי נושא', '/holidays/hanukkah/learn'],
      ['📒', 'חוברת חנוכה לכל כיתה', 'מגן ועד חטיבת הביניים, PDF עם דף תשובות', '/holidays/hanukkah/grade/grade-3'],
      ['🧮', 'חשבון של חנוכה', 'בעיות מילוליות לכיתות א׳–ו׳ עם פתרונות', '/holidays/hanukkah/math'],
      ['🇬🇧', 'Hanukkah באנגלית', 'קטע קריאה באנגלית על חג האורים', '/learn/english-reading/hanukkah-lights'],
    ],
  },
  {
    emoji: '🏫', title: 'לגננת ולמורה', color: 'bg-sky-100',
    links: [
      ['🏃', 'חימום חנוכה לפני השיעור', '3 דקות של סביבון, נרות ומכבים על המקרן', '/classroom/warm-up'],
      ['🧸', 'פעילות לחנוכה בגן', 'ספירה, יצירה וסיפור לגננות', '/holidays/hanukkah/grade/kindergarten'],
      ['📸', 'תמונת מחזור לחנוכה', 'כל ילדי הגן בדף אחד', '/printables/class-photo/hanukkah'],
    ],
  },
]

export default function HanukkahZone() {
  return <nav aria-label="כל מה שיש לחנוכה" className="mb-10 space-y-5">
    {ZONES.map(z => <section key={z.title} aria-labelledby={`hz-${z.title}`} className={`rounded-3xl border-2 border-[var(--border)] ${z.color} p-4 sm:p-5`}>
      <h2 id={`hz-${z.title}`} className="mb-3 text-2xl font-black"><span aria-hidden="true">{z.emoji} </span>{z.title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {z.links.map(([emoji, label, blurb, to]) => <li key={to}>
          <Link to={to} className="flex h-full min-h-[64px] items-start gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-3 transition-transform hover:-translate-y-0.5">
            <span aria-hidden="true" className="text-3xl leading-none">{emoji}</span>
            <span><b className="block text-lg leading-tight">{label}</b><span className="text-sm text-[var(--muted-foreground)]">{blurb}</span></span>
          </Link>
        </li>)}
      </ul>
    </section>)}
  </nav>
}
