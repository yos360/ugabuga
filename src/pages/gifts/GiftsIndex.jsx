import { Link, useLocation } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { GIFT_AGES, AGE_GIFTS } from '../../data/gifts'

// Highest price in a range like "30-45 ₪" or "50 ₪"
const maxPrice = price => Math.max(...(String(price).match(/\d+/g) || [Infinity]).map(Number))

// Real budget filter over the per-age gift data: every idea whose top price fits the budget
const giftsUpTo = limit => GIFT_AGES.map(age => ({
  age,
  ideas: (AGE_GIFTS[age]?.sections || []).flatMap(sec => sec.ideas).filter(([, , price]) => maxPrice(price) <= limit),
})).filter(g => g.ideas.length)

export default function GiftsIndex() {
  const location = useLocation()
  const presets = {
    '/gifts/under-50': { title: 'מתנות עד 50 ₪', desc: 'מתנות יום הולדת עד 50 שקל לפי גיל: רעיונות קטנים ומשמחים לילדים ולילדות — משחקים, יצירה, ספרים ומתנות חוויה בתקציב נגיש.' },
    '/gifts/under-100': { title: 'מתנות עד 100 ₪', desc: 'מתנות יום הולדת עד 100 שקל לפי גיל: רעיונות שימושיים ומהנים לילדים, לנוער ולמשפחה — משחקי קופסה, ערכות יצירה, ספורט וחוויות.' },
    '/gifts': { title: 'מתנות ליום הולדת — לפי גיל', desc: 'מדריכי מתנות ליום הולדת לפי גיל — רעיונות בכל תקציב.' },
  }
  const preset = presets[location.pathname] || presets['/gifts']
  const budget = location.pathname === '/gifts/under-50' ? 50 : location.pathname === '/gifts/under-100' ? 100 : null
  const budgetGifts = budget ? giftsUpTo(budget) : []
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in text-center">
      <SEO title={preset.title} description={preset.desc} path={location.pathname} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתנות' }]} />
      <h1 className="text-4xl sm:text-5xl mb-3">🎁 {preset.title}</h1>
      <p className="mb-8 text-lg text-[var(--muted-foreground)]">{preset.desc}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {GIFT_AGES.map(a => (
          <Link key={a} to={'/gifts/age-'+a} className="wobbly border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow card-lift px-6 py-4 text-2xl font-bold">גיל {a}</Link>
        ))}
      </div>
      {budget && (
        <div className="mt-10 space-y-8 text-right">
          {budgetGifts.map(({ age, ideas }) => (
            <section key={age}>
              <h2 className="mb-3 text-2xl font-bold"><Link to={'/gifts/age-' + age} className="hover:underline">גיל {age}</Link></h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {ideas.map(([name, desc, price]) => (
                  <li key={name} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] p-4">
                    <strong className="block text-lg">{name}</strong>
                    <span className="block text-[var(--muted-foreground)]">{desc}</span>
                    <span className="mt-1 block font-bold">{price}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-center text-sm text-[var(--muted-foreground)]">המחירים הם הערכה בלבד ומשתנים בין חנויות.</p>
        </div>
      )}
      <h2 className="text-2xl font-bold mt-10 mb-4">או לפי תקציב</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {[['/gifts', '🎁 כל המתנות לפי גיל'], ['/gifts/under-50', '💸 מתנות עד 50 ₪'], ['/gifts/under-100', '💰 מתנות עד 100 ₪']].filter(([to]) => to !== location.pathname).map(([to, label]) => (
          <Link key={to} to={to} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-5 py-3 font-bold">{label}</Link>
        ))}
      </div>
    </div>
  )
}
