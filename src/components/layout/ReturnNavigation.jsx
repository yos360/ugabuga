import { useLocation } from 'react-router-dom'
import BackLink from '../ui/BackLink'
import { useBackNavigation } from './NavigationHistory'
import { MENU_DOMAINS, CLASSROOM_MENU, KIDS_ZONE } from '../../data/siteMenu'

const sourceLabels = new Map([
  ...[...MENU_DOMAINS, CLASSROOM_MENU].flatMap(domain => [[domain.to, domain.label], ...(domain.groups || [{ items: domain.items }]).flatMap(group => group.items.map(item => [item.to, item.label]))]),
  [KIDS_ZONE.to, 'אזור הילדים'], ['/adults', 'פנאי למבוגרים'], ['/search', 'תוצאות החיפוש'],
  ['/printables', 'דפים להדפסה'], ['/classroom', 'מתחם הכיתה'], ['/learn', 'אזור הלמידה'],
  ['/family', 'אזור המשפחה'], ['/birthday', 'אזור ימי ההולדת'],
])

export default function ReturnNavigation({ lang = 'he' }) {
  const entry = useBackNavigation()
  const { pathname } = useLocation()
  if (!entry || entry.index < 1 || pathname === '/' || pathname === '/en') return null
  const source = entry.from?.pathname
  const sourceLabel = lang === 'he' && sourceLabels.get(source)
  const label = lang === 'en' ? '← Back to previous page' : sourceLabel ? `→ חזרה ל${sourceLabel}` : '→ חזרה לעמוד הקודם'
  return <nav className="no-print no-present mx-auto max-w-7xl px-4 pt-3" aria-label={lang === 'en' ? 'Return navigation' : 'חזרה לעמוד הקודם'}>
    <BackLink to={source || '/'} lang={lang} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--ink)] hover:underline" data-back-link>
      {label}
    </BackLink>
  </nav>
}
