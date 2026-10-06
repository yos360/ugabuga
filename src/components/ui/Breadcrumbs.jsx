import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const SITE = 'https://ugabuga.co.il'

export default function Breadcrumbs({ items }) {
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
  const shown = via?.href && via?.label && items[1]?.href === '/printables' ? [items[0], via, ...items.slice(2)] : items

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <nav className="text-sm text-[var(--muted-foreground)] mb-4 no-print" aria-label="פירורי לחם">
        <ol className="flex flex-wrap gap-1 items-center">
          {shown.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span className="mx-1">{'›'}</span>}
              {item.href ? (
                <Link to={item.href} className="inline-flex items-center min-h-[32px] py-1 hover:text-[var(--ink)] hover:underline">{item.label}</Link>
              ) : (
                <span className="text-[var(--ink)] font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
