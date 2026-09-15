import { useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const THEMES = {
  'football-birthday': { name:'מסיבת כדורגל', emoji:'⚽', desc:'טורניר קטן, קבוצות צבעוניות והרבה אנרגיה', age:'5-12', budget:'חסכוני' },
  'gaming-birthday': { name:'מסיבת גיימינג', emoji:'🎮', desc:'תחנות משחק, אתגרים וטקס הכתרה', age:'7-13', budget:'חסכוני' },
  'treasure-hunt': { name:'חפש את המטמון', emoji:'🗺️', desc:'רמזים, חידות ואוצר בסוף', age:'5-12', budget:'חסכוני' },
  'science-birthday': { name:'מסיבת מדע', emoji:'🔬', desc:'ניסויים מתפוצצים ומתבעבעים', age:'6-12', budget:'מאוזן' },
  'princess-birthday': { name:'מסיבת נסיכות', emoji:'👑', desc:'כתרים, שמלות וטקס הכתרה', age:'3-8', budget:'מאוזן' },
}

export default function ThemePage() {
  const { slug } = useParams()
  const theme = THEMES[slug]
  if (!theme) return <div className="text-center py-20"><h1 className="text-4xl">404</h1></div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in">
      <SEO title={theme.name} description={theme.desc} path={'/ideas/themes/'+slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'השראה', href: '/ideas' }, { label: theme.name }]} />
      <div className="text-center mb-8"><span className="text-7xl">{theme.emoji}</span></div>
      <h1 className="text-4xl sm:text-5xl text-center mb-3">{theme.name}</h1>
      <p className="text-center text-xl text-[var(--muted-foreground)] mb-8">{theme.desc}</p>
      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow">
        <p className="font-hand text-lg">גיל מומלץ: {theme.age} | תקציב: {theme.budget}</p>
        <p className="mt-4">🚧 מדריך מלא בבנייה — כולל עיצוב, משחקים, אוכל, עוגה, לו"ז ורשימת קניות.</p>
      </div>
    </div>
  )
}
