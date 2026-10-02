import { Link } from 'react-router-dom'

function FooterLink({ to, children }) {
  return <li><Link to={to} className="flex min-h-[44px] w-full items-center py-1.5 hover:underline underline-offset-4">{children}</Link></li>
}

const COLUMNS = [
  {
    title: 'משחקים',
    links: [
      ['/games', 'כל המשחקים'],
      ['/games/kindergarten', 'משחקים לגן'],
      ['/games/kita-a', 'משחקים לכיתה א׳'],
      ['/games/no-equipment', 'בלי ציוד'],
      ['/games/5-minutes', '5 דקות'],
      ['/games/icebreaker', 'שובר קרח'],
      ['/games/movement', 'תנועה'],
      ['/games/quiet', 'שקטים'],
      ['/game-of-the-day', 'משחק היום'],
    ],
  },
  {
    title: 'יום הולדת',
    links: [
      ['/birthday', 'כל מה שצריך ליום הולדת'],
      ['/calculator', 'מחשבון מסיבה'],
      ['/invitation', 'מחולל הזמנות'],
      ['/greeting', 'מחולל ברכות'],
      ['/games/birthday', 'משחקים ליום הולדת'],
      ['/ideas', 'רעיונות והשראה'],
      ['/ideas/at-home', 'יום הולדת בבית'],
      ['/gifts', 'רעיונות למתנות'],
      ['/suppliers', 'ספקים לימי הולדת'],
    ],
  },
  {
    title: 'לכיתה ויוצרים',
    links: [
      ['/classroom', 'כל הכלים לכיתה'],
      ['/classroom/quiz', 'מבחן אמריקאי אונליין'],
      ['/classroom/first-grade', 'הכנה לכיתה א׳'],
      ['/printables/roots-project', 'עבודת שורשים'],
      ['/create', 'יוצרים — כל המחוללים'],
      ['/printables', 'דפים להדפסה'],
      ['/printables/coloring', 'דפי צביעה'],
      ['/tools/crossword-maker', 'מחולל תשבצים'],
      ['/tools', 'כל הכלים'],
    ],
  },
  {
    title: 'עולמות תוכן',
    links: [
      ['/trivia/topics', 'טריוויה לפי נושא'],
      ['/animals', 'עולם החיות'],
      ['/riddles/topics', 'חידות לפי נושא'],
      ['/jokes/topics', 'בדיחות לילדים'],
      ['/birthday-greetings', 'ברכות ליום הולדת'],
      ['/questions', 'שאלות לילדים'],
      ['/treasure-hunt/ready', 'ציד אוצר מוכן'],
      ['/abc', 'לומדים אותיות'],
      ['/blog', 'הבלוג שלנו'],
      ['/time-tunnel', 'מנהרת הזמן'],
    ],
  },
  {
    title: 'אודות',
    links: [
      ['/about', 'אודות עוגה בוגה'],
      ['/faq', 'שאלות נפוצות'],
      ['/guides', 'כל המדריכים'],
      ['/guides/how-to-plan-birthday', 'איך מתכננים יום הולדת'],
      ['/compare/home-vs-venue', 'בית או אולם'],
      ['/ideas/what-to-do-weekend', 'פעילות לסוף שבוע'],
      ['/terms', 'תנאי שימוש'],
      ['/privacy', 'מדיניות פרטיות'],
    ],
  },
]

function ColumnLinks({ links }) {
  return <ul className="mt-2 text-lg">{links.map(([to, label]) => <FooterLink key={to} to={to}>{label}</FooterLink>)}</ul>
}

export default function Footer() {
  return (
    <footer className="site-footer mt-16 border-t border-[var(--border)] no-print">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Mobile: collapsed accordions to keep the footer short */}
        <div className="sm:hidden">
          {COLUMNS.map(col => (
            <details key={col.title} className="border-b border-[var(--border)] py-2">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between py-2 text-xl font-bold">
                {col.title}<span aria-hidden="true">▾</span>
              </summary>
              <ColumnLinks links={col.links} />
            </details>
          ))}
        </div>
        {/* Desktop: open columns, unchanged */}
        <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-5">
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h2 className="text-xl">{col.title}</h2>
              <ColumnLinks links={col.links} />
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-base">
          <a href="mailto:hellohugabuga@gmail.com" className="flex min-h-[44px] items-center underline decoration-dashed" dir="ltr">✉️ hellohugabuga@gmail.com</a>
          <p className="mt-2">💛 רעיון למשחק? תיקון? משוב? כתבו לנו בוואטסאפ: <a href="https://wa.me/972507772930" target="_blank" rel="noopener noreferrer" className="underline decoration-dashed">050-7772930</a></p>
          <p className="mt-2">🎪 נותנים שירות לימי הולדת? <Link to="/suppliers/me" className="underline decoration-dashed">הצטרפו למאגר הספקים בחינם</Link></p>
          <p className="mt-4 text-[var(--muted-foreground)]">עוגה בוגה 🎂 מאגר משחקים ופעילויות בעברית — כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  )
}
