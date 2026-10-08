import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import { faqSchema } from '../../components/ui/SeoBody'
import { COMPARISONS } from '../../data/compare'

export default function ComparisonPage({ path }) {
  const c = COMPARISONS[path]
  if (!c) return null
  const [a, b] = c.labels
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title={c.title} description={c.description} path={path} structuredData={faqSchema(c.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מדריכים', href: '/guides' }, { label: c.title }]} />
      <div className="text-center text-6xl mb-2">{c.emoji}</div>
      <h1 className="text-4xl md:text-5xl text-center mb-3">{c.title}</h1>
      <p className="text-center text-xl text-[var(--ink)]/70 mb-8">{c.description}</p>
      <div className="max-w-3xl mx-auto space-y-4 text-lg leading-relaxed mb-8">{c.intro.map(t => <p key={t}>{t}</p>)}</div>
      <WobblyCard hover={false} padding="p-3 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-right">
            <thead><tr className="border-b-2 border-[var(--border)]"><th className="p-3 text-lg">נושא</th><th className="p-3 text-lg">{a}</th><th className="p-3 text-lg">{b}</th></tr></thead>
            <tbody>{c.rows.map(([topic, x, y]) => <tr key={topic} className="border-b border-dashed border-[var(--border)]"><th className="p-3 font-bold">{topic}</th><td className="p-3">{x}</td><td className="p-3">{y}</td></tr>)}</tbody>
          </table>
        </div>
      </WobblyCard>
      <div className="grid md:grid-cols-2 gap-5 mt-8">
        {c.choose.map(g => (
          <WobblyCard key={g.title} hover={false} padding="p-5" className="bg-[var(--postit)]">
            <h2 className="text-2xl font-bold mb-3">{g.title}</h2>
            <ul className="list-disc pr-5 space-y-1 text-lg">{g.items.map(t => <li key={t}>{t}</li>)}</ul>
          </WobblyCard>
        ))}
      </div>
      <section className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-3">{c.checklist.title}</h2>
        <ol className="list-decimal pr-5 space-y-1 text-lg">{c.checklist.items.map(t => <li key={t}>{t}</li>)}</ol>
      </section>
      <section className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-3">שאלות נפוצות</h2>
        <div className="space-y-4">{c.faq.map(f => <div key={f.q}><h3 className="font-bold text-lg">{f.q}</h3><p className="leading-relaxed text-[var(--foreground)]/80">{f.a}</p></div>)}</div>
      </section>
      <section className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-3">ממשיכים לתכנן</h2>
        <div className="flex flex-wrap gap-2">{c.related.map(r => <Link key={r.href} to={r.href} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{r.label}</Link>)}<Link to="/ideas" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-bold">לעוד רעיונות ←</Link></div>
      </section>
    </div>
  )
}
