import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import { GUIDE_BY_SLUG, GUIDES } from '../../data/guides'
import { GUIDE_DEEP } from '../../data/guidesDeep'
import { nearby } from '../../utils/nearby'
import NotFound from '../NotFound'

export default function GuidePage() {
  const { slug } = useParams()
  const guide = GUIDE_BY_SLUG[slug]

  if (!guide) {
    return <NotFound />
  }

  const moreGuides = nearby(GUIDES, (item) => item.slug === guide.slug, 3)
  const deep = GUIDE_DEEP[slug] || {}
  const sections = [...(deep.before || []), ...guide.sections, ...(deep.after || [])]
  const relatedLinks = [...(guide.relatedLinks || []), ...(deep.links || [])]

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <SEO title={`${guide.title} — מדריך מעשי`} description={guide.description} path={`/guides/${guide.slug}`} structuredData={faqSchema(deep.faq)} />
      <Breadcrumbs
        items={[
          { label: 'ראשי', href: '/' },
          { label: 'מדריכים', href: '/guides' },
          { label: guide.title }
        ]}
      />

      <header className="text-center mb-8">
        <div className="text-6xl mb-4">{guide.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-4">{guide.title}</h1>
        <p className="text-lg text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto">
          {guide.description}
        </p>
        <div className="flex justify-center flex-wrap gap-2 mt-5 text-sm">
          <span className="px-3 py-1 rounded-full bg-[var(--accent)]/20 border border-[var(--border)]">
            {guide.minutes} דקות קריאה
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-[var(--border)]">
            {guide.audience}
          </span>
        </div>
      </header>

      {deep.lead && <p className="text-xl leading-relaxed mb-6">{deep.lead}</p>}

      <WobblyCard hover={false} padding="p-6 md:p-8">
        <div className="space-y-8 leading-relaxed text-lg">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl md:text-3xl font-hand font-bold mb-3">{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="mb-3 text-[var(--foreground)]">{paragraph}</p>
              ))}
              {section.list && (
                <ul className="space-y-2 list-none pr-0">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1">⭐</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </WobblyCard>

      {deep.faq?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-hand font-bold mb-4">שאלות נפוצות</h2>
          <div className="space-y-4">{deep.faq.map((f) => <div key={f.q}><h3 className="font-bold text-lg">{f.q}</h3><p className="leading-relaxed text-[var(--foreground)]/80">{f.a}</p></div>)}</div>
        </section>
      )}

      {relatedLinks.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-hand font-bold mb-4">קישורים שימושיים</h2>
          <div className="flex flex-wrap gap-3">
            {relatedLinks.map((link) => (
              <Link key={link.href} to={link.href} className="btn-secondary">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <h2 className="text-2xl font-hand font-bold mb-4">עוד מדריכים</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {moreGuides.map((item) => (
            <Link key={item.slug} to={`/guides/${item.slug}`} className="block">
              <WobblyCard hover padding="p-4" className="h-full">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <h3 className="font-hand font-bold text-xl mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{item.description}</p>
              </WobblyCard>
            </Link>
          ))}
        </div>
      </section>
    </article>
  )
}
