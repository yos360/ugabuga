import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import WobblyCard from '../../components/ui/WobblyCard'
import { faqSchema } from '../../components/ui/SeoBody'
import { AffiliateGrid } from '../../components/ui/AffiliatePicks'
import { AFFILIATE_TOPICS, affiliateProducts } from '../../data/affiliate'
import { BUYING_HUB, BUYING_GUIDES, BUYING_BY_ID, BUYING_UPDATED, buyingPath, buyingGuideSchemas, buyingHubSchemas } from '../../data/buyingGuides'
import NotFound from '../NotFound'

// Buying guides: /recommended (hub) and /recommended/<topic>. Content lives in data/buyingGuides.js;
// the AliExpress picks (data/affiliate.js) appear under the guide only when the topic has products.

const HUB_CRUMB = { label: 'המלצות לקנייה', href: BUYING_HUB.path }
const H2 = 'mb-3 scroll-mt-24 font-hand text-2xl font-bold md:text-3xl'

function Faq({ faq }) {
  return (
    <section id="faq" className="mt-10" aria-labelledby="faq-title">
      <h2 id="faq-title" className={H2}>שאלות נפוצות</h2>
      <div className="space-y-4">
        {faq.map(f => <div key={f.q}>
          <h3 className="m-0 text-lg font-bold">{f.q}</h3>
          <p className="m-0 mt-1 leading-relaxed text-[var(--foreground)]/80">{f.a}</p>
        </div>)}
      </div>
    </section>
  )
}

export function RecommendedGuide({ id }) {
  const guide = BUYING_BY_ID[id]
  if (!guide) return <NotFound />
  const topic = AFFILIATE_TOPICS.find(t => t.id === id)
  const products = topic ? affiliateProducts(id) : []
  const others = BUYING_GUIDES.filter(g => g.id !== id)
  const toc = [
    ['choose', 'איך בוחרים לפי גיל'],
    ['checklist', 'רשימת בדיקה'],
    ['summary', 'טבלת סיכום'],
    ['avoid', 'מה לא לקנות'],
    ['budget', 'איך חוסכים'],
    ...(products.length ? [['picks', 'מוצרים שבחרנו']] : []),
    ['faq', 'שאלות נפוצות'],
  ]
  return (
    <article className="recommended-guide mx-auto max-w-4xl px-4 py-8" dir="rtl">
      <SEO title={guide.seoTitle} description={guide.description} path={buyingPath(id)} type="article" structuredData={buyingGuideSchemas(guide, products)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB_CRUMB, { label: guide.title.split(' — ')[0] }]} />

      <header className="mb-4 text-center">
        <div className="mb-3 text-5xl" aria-hidden="true">{guide.emoji}</div>
        <h1 className="mb-3 font-hand text-3xl font-bold leading-tight md:text-5xl">{guide.title}</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">{guide.description}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-full border border-[var(--border)] bg-[var(--postit)] px-3 py-1 font-bold text-[var(--ink)]">{guide.audience}</span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1">{guide.items.length} סוגי פריטים · בלי מותגים</span>
        </div>
      </header>

      <QuickAnswer q={guide.quick.q} a={guide.quick.a} rows={guide.quick.rows} updated={BUYING_UPDATED} />

      <nav aria-label="תוכן העניינים" className="no-print mx-auto mb-8 flex max-w-3xl flex-wrap justify-center gap-2">
        {toc.map(([anchor, label]) => <a key={anchor} href={`#${anchor}`} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 text-sm font-bold text-[var(--ink)] no-underline hover:border-[var(--ink)]">{label}</a>)}
      </nav>

      <section id="choose" aria-labelledby="choose-title" className="mb-10">
        <h2 id="choose-title" className={H2}>איך בוחרים לפי גיל?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {guide.choose.map(c => <div key={c.age} className="wobbly-md border-2 border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="m-0 mb-1 text-lg font-bold">{c.age}</h3>
            <p className="m-0 leading-relaxed text-[var(--foreground)]/85">{c.text}</p>
          </div>)}
        </div>
      </section>

      <section id="checklist" aria-labelledby="checklist-title" className="mb-10">
        <h2 id="checklist-title" className={H2}>מה כדאי לקנות? רשימת בדיקה של {guide.items.length} פריטים</h2>
        <p className="mb-4 text-[var(--muted-foreground)]">סוגי פריטים, לא מותגים — סמנו מה כבר יש לכם בבית לפני שקונים.</p>
        <ol className="m-0 list-none space-y-3 p-0">
          {guide.items.map((it, i) => <li key={it.name}>
            <WobblyCard hover={false} padding="p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--postit)] font-bold text-[var(--ink)]" aria-hidden="true">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 text-xl font-bold">{it.name}</h3>
                  <p className="m-0 mt-1 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5"><b>גיל:</b> {it.age}</span>
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5"><b>מתי:</b> {it.when}</span>
                  </p>
                  <p className="m-0 mt-2 leading-relaxed">{it.why}</p>
                  {it.safety && <p className="m-0 mt-2 rounded-xl border border-[var(--border)] bg-[var(--postit)] px-3 py-2 text-sm leading-relaxed text-[var(--ink)]"><b>⚠️ בטיחות:</b> {it.safety}</p>}
                </div>
              </div>
            </WobblyCard>
          </li>)}
        </ol>
      </section>

      <section id="summary" aria-labelledby="summary-title" className="mb-10">
        <h2 id="summary-title" className={H2}>טבלת סיכום</h2>
        <div className="overflow-x-auto wobbly-md border-2 border-[var(--border)] bg-[var(--card)]">
          <table className="w-full border-collapse text-sm sm:text-base">
            <caption className="sr-only">{guide.title} — סיכום</caption>
            <thead><tr className="bg-[var(--postit)] text-[var(--ink)]"><th scope="col" className="p-2 text-right">פריט</th><th scope="col" className="p-2 text-right">גיל</th><th scope="col" className="p-2 text-right">מתי שימושי</th></tr></thead>
            <tbody>{guide.items.map(it => <tr key={it.name} className="border-t border-[var(--border)]"><th scope="row" className="p-2 text-right align-top font-bold">{it.name}</th><td className="p-2 align-top whitespace-nowrap">{it.age}</td><td className="p-2 align-top">{it.when}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section id="avoid" aria-labelledby="avoid-title" className="mb-10">
        <h2 id="avoid-title" className={H2}>מה לא כדאי לקנות?</h2>
        <ul className="m-0 list-none space-y-2 p-0">{guide.avoid.map(x => <li key={x} className="flex gap-2 leading-relaxed"><span aria-hidden="true">✋</span><span>{x}</span></li>)}</ul>
      </section>

      <section id="budget" aria-labelledby="budget-title" className="mb-10">
        <h2 id="budget-title" className={H2}>איך חוסכים?</h2>
        <ul className="m-0 list-none space-y-2 p-0">{guide.budget.map(x => <li key={x} className="flex gap-2 leading-relaxed"><span aria-hidden="true">💡</span><span>{x}</span></li>)}</ul>
      </section>

      <section id="free" aria-labelledby="free-title" className="mb-10 wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4">
        <h2 id="free-title" className={H2}>בחינם באתר — לפני שקונים</h2>
        <div className="flex flex-wrap gap-2">{guide.related.map(r => <Link key={r.href} to={r.href} className="rounded-full border-2 border-[var(--border)] bg-[var(--background)] px-3 py-1 font-bold text-[var(--ink)] no-underline hover:border-[var(--ink)]">{r.label}</Link>)}</div>
      </section>

      {products.length > 0 && <AffiliateGrid id="picks" topic={topic} products={products} title={`${guide.emoji} מוצרים שבחרנו`} as="h2" />}

      <Faq faq={guide.faq} />

      <p className="mt-8 text-sm leading-relaxed text-[var(--muted-foreground)]">ההמלצות כאן הן הנחיות כלליות. לפני שימוש בדקו את הגיל המומלץ, האזהרות והוראות היצרן על האריזה; בשאלות של בריאות ובטיחות — התייעצו עם איש מקצוע. <Link to={BUYING_HUB.path} className="underline">איך אנחנו כותבים את ההמלצות</Link></p>

      <section className="no-print mt-10 border-t border-[var(--border)] pt-8" aria-labelledby="more-title">
        <h2 id="more-title" className={H2}>עוד מדריכי קנייה</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map(g => <Link key={g.id} to={buyingPath(g.id)} className="block h-full no-underline text-[var(--ink)]">
            <WobblyCard padding="p-4" className="h-full"><div className="text-3xl" aria-hidden="true">{g.emoji}</div><h3 className="m-0 mt-1 text-lg font-bold">{g.title}</h3></WobblyCard>
          </Link>)}
        </div>
      </section>
    </article>
  )
}

export default function RecommendedHub() {
  const h = BUYING_HUB
  return (
    <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
      <SEO title={h.seoTitle} description={h.description} path={h.path} structuredData={[...buyingHubSchemas(), faqSchema(h.faq)]} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: HUB_CRUMB.label }]} />
      <header className="mb-4 text-center">
        <div className="mb-3 text-5xl" aria-hidden="true">🛒</div>
        <h1 className="mb-3 font-hand text-3xl font-bold leading-tight md:text-5xl">{h.title}</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">{h.description}</p>
      </header>
      <QuickAnswer q={h.quick.q} a={h.quick.a} updated={BUYING_UPDATED} />

      <section aria-labelledby="guides-title" className="my-10">
        <h2 id="guides-title" className={`${H2} text-center`}>מדריכי הקנייה</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUYING_GUIDES.map(g => <Link key={g.id} to={buyingPath(g.id)} className="block h-full no-underline text-[var(--ink)]">
            <WobblyCard padding="p-5" className="h-full">
              <div className="text-4xl" aria-hidden="true">{g.emoji}</div>
              <h3 className="m-0 mt-2 font-hand text-xl font-bold">{g.title}</h3>
              <p className="m-0 mt-2 leading-relaxed text-[var(--muted-foreground)]">{g.short}</p>
              <span className="mt-3 inline-block rounded-full bg-[var(--postit)] px-3 py-1 text-sm font-bold text-[var(--ink)]">למדריך ←</span>
            </WobblyCard>
          </Link>)}
        </div>
      </section>

      <section aria-labelledby="method-title" className="mx-auto max-w-3xl wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow">
        <h2 id="method-title" className={H2}>איך אנחנו כותבים את ההמלצות?</h2>
        <ul className="m-0 list-disc space-y-2 pr-5 leading-relaxed">{h.method.map(x => <li key={x}>{x}</li>)}</ul>
      </section>

      <div className="mx-auto max-w-3xl"><Faq faq={h.faq} /></div>
    </div>
  )
}
