import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isPreviousPage } from '../../utils/navMemory'
import PrintCount from './PrintCount'
import { Helmet } from 'react-helmet-async'
import BackLink from './BackLink'
import { useBackNavigation } from '../layout/NavigationHistory'

const SITE = 'https://ugabuga.co.il'

// Section crumbs that were written without a link still get one, so the trail never dead-ends
// (e.g. the bingo maker's "כלים" step used to be plain text, leaving phones with no way back).
const SECTION_HREF = { 'כלים': '/tools', 'משחקים': '/games' }

export default function Breadcrumbs({ items: rawItems, back, lang = 'he' }) {
  const items = rawItems.map((item, i) => (!item.href && i < rawItems.length - 1 && SECTION_HREF[item.label] ? { ...item, href: SECTION_HREF[item.label] } : item))
  // BreadcrumbList structured data so Google can show the page's place in the
  // site (ראשי › משחקים › שם המשחק) instead of a bare URL in search results.
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.label,
      ...(item.href ? { 'item': SITE + (item.href === '/' ? '/' : item.href.replace(/\/+$/, '')) } : {}),
    })),
  }

  // Arrived from a hub (e.g. the classroom area)? Show that hub as the way back instead of the
  // general printables index. Visual only — the structured data keeps the canonical trail.
  const via = useLocation().state?.via
  // A crumb for the page we just came from steps back instead, so its filters and scroll stay.
  const navigate = useNavigate()
  const returnEntry = useBackNavigation()
  const parent = items.slice(0, -1).findLast(item => item.href)
  const fallbackBack = back || (parent && { href: parent.href, label: lang === 'en' ? `Back to ${parent.label}` : `חזרה ל${parent.label}` })
  const stepBack = href => e => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && isPreviousPage(href)) { e.preventDefault(); navigate(-1) } }
  const shown = via?.href && via?.label && items[1]?.href === '/printables' ? [items[0], via, ...items.slice(2)] : items

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <nav className="text-sm text-[var(--muted-foreground)] mb-4 no-print" aria-label={lang === 'en' ? 'Breadcrumbs' : 'פירורי לחם'}>
        <ol className="flex flex-wrap gap-1 items-center">
          {shown.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span className="mx-1">{'›'}</span>}
              {item.href ? (
                <Link to={item.href} onClick={stepBack(item.href)} className="inline-flex items-center min-h-[32px] py-1 hover:text-[var(--ink)] hover:underline">{item.label}</Link>
              ) : (
                <span className="text-[var(--ink)] font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
        {/* Popular printables show how often they were printed (from the site's own stats). */}
        {lang !== 'en' && <PrintCount className="mt-2" />}
        {fallbackBack?.href && !(returnEntry?.index > 0) && (
          <BackLink to={fallbackBack.href} lang={lang} className="wobbly-sm mt-2 inline-flex items-center gap-1 min-h-[44px] border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold text-[var(--ink)] hover:bg-[var(--postit)]" data-back-link>
            {lang === 'en' ? '←' : '→'} {fallbackBack.label || (lang === 'en' ? 'Back' : 'חזרה')}
          </BackLink>
        )}
      </nav>
    </>
  )
}
