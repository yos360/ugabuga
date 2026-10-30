import { Link } from 'react-router-dom'
import { HANUKKAH_GRADE_LIST, hanukkahGradePath } from '../../data/hanukkahGradeList'

// "Hanukkah by grade" chooser: on the Hanukkah hub and on every grade page (current one marked).
export default function HanukkahGradeChooser({ current, title = 'דפי עבודה ופעילות לחנוכה לפי כיתה', className = 'mb-10' }) {
  return <nav aria-label="חנוכה לפי כיתה" className={`rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5 ${className}`}>
    <h2 className="mb-1 text-2xl font-bold">🎒 {title}</h2>
    {!current && <p className="mb-3 text-[var(--muted-foreground)]">לכל גיל סט משלו: בעיות מילוליות ברמה של הכיתה, קטע קריאה, תפזורת, יצירה ושאלות נפוצות — הכול להדפסה.</p>}
    <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {HANUKKAH_GRADE_LIST.map(g => <li key={g.slug}>
        <Link to={hanukkahGradePath(g.slug)} aria-current={current === g.slug ? 'page' : undefined}
          className={`flex min-h-[52px] items-center gap-2 rounded-2xl border-2 px-3 py-2 font-bold transition-transform hover:-translate-y-0.5 ${current === g.slug ? 'border-slate-800 bg-blue-200' : 'border-[var(--border)] bg-white'}`}>
          <span aria-hidden="true" className="text-2xl">{g.emoji}</span>
          <span className="leading-tight">{g.label}<span className="block text-xs font-normal text-[var(--muted-foreground)]">{g.ages}</span></span>
        </Link>
      </li>)}
    </ul>
  </nav>
}
