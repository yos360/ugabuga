import { Link, useLocation } from 'react-router-dom'
import Breadcrumbs from '../ui/Breadcrumbs'

// The frame every holiday page shares: breadcrumbs to the holiday's hub and one tab
// row with all of that holiday's pages — so each holiday is one tidy section.
// `h` is a holiday config from src/holidays/*.
export default function HolidayShell({ h, crumb, children }) {
  const { pathname } = useLocation()
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, ...(crumb ? [{ label: h.name, href: h.base }, { label: crumb }] : [{ label: h.name }])]} />
      <nav aria-label={`אזור ${h.name}`} className="mb-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
        {h.pages.map(p => <Link key={p.to} to={p.to} aria-current={pathname === p.to ? 'page' : undefined}
          className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${pathname === p.to ? `border-slate-800 ${h.tab}` : 'border-[var(--border)] bg-white'}`}>{p.emoji} {p.label}</Link>)}
      </nav>
      {children}
    </div>
  )
}
