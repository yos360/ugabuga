import { Link, useLocation } from 'react-router-dom'
import Breadcrumbs from '../ui/Breadcrumbs'

// Every Hanukkah page shares this frame: breadcrumbs back to the hub and the same
// tab row, so the whole area reads as one section rather than scattered pages.
export const HANUKKAH_PAGES = [
  { to: '/holidays/hanukkah', label: 'הכול על חנוכה', emoji: '🕎' },
  { to: '/holidays/hanukkah/sevivon', label: 'סביבון וירטואלי', emoji: '🎲' },
  { to: '/holidays/hanukkah/quiz', label: 'חידון חנוכה', emoji: '❓' },
  { to: '/holidays/hanukkah/coloring', label: 'דפי צביעה', emoji: '🖍️' },
  { to: '/holidays/hanukkah/worksheets', label: 'דפי עבודה', emoji: '✏️' },
  { to: '/holidays/hanukkah/what-to-do', label: 'מה עושים בחנוכה', emoji: '💡' },
]

export default function HanukkahShell({ crumb, children }) {
  const { pathname } = useLocation()
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, ...(crumb ? [{ label: 'חנוכה', href: '/holidays/hanukkah' }, { label: crumb }] : [{ label: 'חנוכה' }])]} />
      <nav aria-label="אזור חנוכה" className="mb-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
        {HANUKKAH_PAGES.map(p => <Link key={p.to} to={p.to} aria-current={pathname === p.to ? 'page' : undefined}
          className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${pathname === p.to ? 'border-slate-800 bg-blue-200' : 'border-[var(--border)] bg-white'}`}>{p.emoji} {p.label}</Link>)}
      </nav>
      {children}
    </div>
  )
}
