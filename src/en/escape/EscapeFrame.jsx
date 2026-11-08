import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { ESCAPE_BASE, ESCAPE_PAGES } from './catalog'
import '../tools/tools.css'

// Shared frame of the English escape-room pages: SEO from the catalog (title, description, Hebrew
// counterpart), breadcrumbs and the English base styles. "en-rsvp" keeps the English look (see ToolFrame).
export default function EscapeFrame({ path, crumb, structuredData, children }) {
  const page = ESCAPE_PAGES.find(p => p.path === path)
  const trail = path === ESCAPE_BASE
    ? [{ label: 'Home', href: '/en' }, { label: 'Tools', href: '/en/tools' }, { label: 'Escape rooms' }]
    : [{ label: 'Home', href: '/en' }, { label: 'Escape rooms', href: ESCAPE_BASE }, { label: crumb || page.title }]
  return <div className="en-rsvp en-tool mx-auto max-w-6xl px-4 py-8" dir="ltr" lang="en">
    <SEO lang="en" path={path} title={page.title} description={page.description} counterpartPath={page.counterpart} structuredData={structuredData} />
    <Breadcrumbs lang="en" items={trail} />
    {children}
  </div>
}

export const Pill = ({ children, tone = 'plain' }) => <span className={`inline-block rounded-full border px-3 py-0.5 text-sm font-semibold ${tone === 'yellow' ? 'bg-[var(--postit)] border-[var(--border)]' : tone === 'blue' ? 'bg-sky-100 border-sky-300' : 'bg-white border-[var(--border)]'}`}>{children}</span>

export const BTN_MAIN = 'min-h-[44px] rounded-xl bg-slate-900 px-4 py-2 font-bold text-white disabled:opacity-50'
export const BTN_ALT = 'min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 py-2 font-bold hover:bg-[var(--postit)]'

export const Card =({ children, className = '' }) => <div className={`rounded-2xl border-2 border-[var(--border)] bg-white p-5 ${className}`}>{children}</div>
