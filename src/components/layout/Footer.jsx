import { Link } from 'react-router-dom'

const sections = [
  { title: 'משחקים', links: [
    { to: '/games', label: 'כל המשחקים' },
    { to: '/games/no-equipment', label: 'בלי ציוד' },
    { to: '/games/classroom', label: 'לכיתה' },
    { to: '/games/birthday', label: 'יום הולדת' },
    { to: '/games/movement', label: 'תנועה' },
    { to: '/games/quiet', label: 'שקטים' },
    { to: '/game-of-the-day', label: 'משחק היום' },
  ]},
  { title: 'השראה', links: [
    { to: '/ideas', label: 'עולם ההשראה' },
    { to: '/ideas/themes', label: 'לפי נושא' },
    { to: '/ideas/at-home', label: 'יום הולדת בבית' },
    { to: '/ideas/without-entertainer', label: 'בלי מפעיל' },
    { to: '/ideas/on-budget', label: 'תקציב נמוך' },
    { to: '/gifts', label: 'מתנות' },
  ]},
  { title: 'כלים', links: [
    { to: '/calculator', label: 'מחשבון מסיבה' },
    { to: '/greeting', label: 'מחולל ברכות' },
    { to: '/invitation', label: 'מחולל הזמנות' },
    { to: '/tools/team-generator', label: 'מחלק קבוצות' },
    { to: '/tools/random-picker', label: 'גלגל שמות' },
    { to: '/tools/countdown-timer', label: 'טיימר' },
  ]},
  { title: 'עוגה בוגה', links: [
    { to: '/about', label: 'אודות' },
    { to: '/faq', label: 'שאלות נפוצות' },
    { to: '/guides/how-to-plan-birthday', label: 'מדריך למסיבה' },
    { to: '/printables', label: 'דפים להדפסה' },
    { to: '/terms', label: 'תנאי שימוש' },
    { to: '/privacy', label: 'פרטיות' },
  ]},
]

export default function Footer() {
  return (
    <footer className="bg-[var(--ink)] text-[var(--paper)] mt-16 no-print">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-hand font-bold">🎂 עוגה בוגה</h2>
          <p className="text-[var(--muted)] mt-2">מאגר משחקים ופעילויות בעברית — למנחים, למורים, להורים ולכל מי שצריך רעיון עכשיו.</p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {sections.map(section => (
            <div key={section.title}>
              <h3 className="font-bold text-lg mb-3 text-[var(--yellow)]">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[var(--muted)] hover:text-white transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-[var(--muted)]">
            📧 hellohugabuga@gmail.com
          </p>
          <p className="text-[var(--muted)] mt-4 text-sm">
            © {new Date().getFullYear()} עוגה בוגה. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  )
}
