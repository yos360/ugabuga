import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { FAQ_TOPICS } from '../data/faqTopics'
import NotFound from './NotFound'

export default function FaqTopic() {
  const { topic } = useParams()
  const data = FAQ_TOPICS[topic]
  const [open, setOpen] = useState(0)
  if (!data) return <NotFound />
  const schema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: data.qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
  const others = Object.entries(FAQ_TOPICS).filter(([k]) => k !== topic)
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title={data.title} description={data.description} path={'/faq/' + topic} structuredData={schema} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שאלות נפוצות', href: '/faq' }, { label: data.title }]} />
      <h1 className="text-4xl text-center mb-3">{data.emoji} {data.title}</h1>
      <p className="text-center text-lg text-[var(--muted-foreground)] mb-8">{data.description}</p>
      <div className="space-y-3">
        {data.qa.map(([q, a], i) => (
          <div key={q} className="wobbly-md border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow-sm overflow-hidden">
            <h2 className="m-0 text-lg">
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} aria-controls={'faqtopic-panel-' + i} className="w-full text-right p-4 font-display text-lg font-bold flex justify-between items-center cursor-pointer">
                {q}<span aria-hidden="true">{open === i ? '−' : '+'}</span>
              </button>
            </h2>
            <div id={'faqtopic-panel-' + i} className={open === i ? 'px-4 pb-4 font-hand text-lg' : 'sr-only'}>{a}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        {data.links.map(([label, href]) => <Link key={href} to={href} className="btn-secondary">{label}</Link>)}
      </div>
      <div className="mt-10">
        <h2 className="text-2xl mb-3">עוד נושאים</h2>
        <div className="flex flex-wrap gap-2">
          {others.map(([k, t]) => <Link key={k} to={'/faq/' + k} className="wobbly-sm border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">{t.emoji} {t.title.replace('שאלות נפוצות על ', '').replace('שאלות נפוצות ', '')}</Link>)}
        </div>
      </div>
    </div>
  )
}
