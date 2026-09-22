import { Link, useLocation } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { GIFT_AGES } from '../../data/gifts'

export default function GiftsIndex() {
  const location = useLocation()
  const presets = {
    '/gifts/boy': { title: 'מתנות לבנים לפי גיל', desc: 'רעיונות למתנות פעילות, יצירתיות וחברתיות — בוחרים גיל ומוצאים כיוון שמתאים לילד.' },
    '/gifts/girl': { title: 'מתנות לבנות לפי גיל', desc: 'רעיונות למתנות יצירתיות, חווייתיות ומעשיות — בוחרים גיל ומוצאים כיוון שמתאים לילדה.' },
    '/gifts/under-50': { title: 'מתנות עד 50 ₪', desc: 'מתנות יום הולדת עד 50 שקל לפי גיל: רעיונות קטנים ומשמחים לילדים ולילדות — משחקים, יצירה, ספרים ומתנות חוויה בתקציב נגיש.' },
    '/gifts/under-100': { title: 'מתנות עד 100 ₪', desc: 'מתנות יום הולדת עד 100 שקל לפי גיל: רעיונות שימושיים ומהנים לילדים, לנוער ולמשפחה — משחקי קופסה, ערכות יצירה, ספורט וחוויות.' },
    '/gifts': { title: 'מתנות ליום הולדת — לפי גיל', desc: 'מדריכי מתנות ליום הולדת לפי גיל — רעיונות בכל תקציב.' },
  }
  const preset = presets[location.pathname] || presets['/gifts']
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in text-center">
      <SEO title={preset.title} description={preset.desc} path={location.pathname} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתנות' }]} />
      <h1 className="text-4xl sm:text-5xl mb-3">🎁 {preset.title}</h1>\n      <p className="mb-8 text-lg text-[var(--muted-foreground)]">{preset.desc}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {GIFT_AGES.map(a => (
          <Link key={a} to={'/gifts/age-'+a} className="wobbly border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow card-lift px-6 py-4 text-2xl font-bold">גיל {a}</Link>
        ))}
      </div>
    </div>
  )
}
