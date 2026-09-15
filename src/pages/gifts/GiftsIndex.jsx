import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { GIFT_AGES } from '../../data/gifts'

export default function GiftsIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in text-center">
      <SEO title="מתנות ליום הולדת" description="מדריכי מתנות ליום הולדת לפי גיל — רעיונות בכל תקציב." path="/gifts" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתנות' }]} />
      <h1 className="text-4xl sm:text-5xl mb-8">🎁 מתנות ליום הולדת — לפי גיל</h1>
      <div className="flex flex-wrap justify-center gap-3">
        {GIFT_AGES.map(a => (
          <Link key={a} to={'/gifts/age-'+a} className="wobbly border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow card-lift px-6 py-4 text-2xl font-bold">גיל {a}</Link>
        ))}
      </div>
    </div>
  )
}
