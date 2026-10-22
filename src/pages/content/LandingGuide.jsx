import { Link, useLocation } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../NotFound'
import { LANDING_PAGES } from '../../data/landingPages'
import RichText, { plainText } from '../../components/ui/RichText'

// Content landing pages built from Google search demand (movies by age, crafts, English by grade,
// baby development, Purim costumes). One template; the data lives in src/data/landingPages.js.
// Craft pages also get HowTo structured data, one per craft.
const howToSchema = page => page.sections.flatMap(s => s.items).filter(i => i.steps?.length).map(i => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: i.name,
  description: plainText(i.text),
  ...(i.materials?.length ? { supply: i.materials.map(name => ({ '@type': 'HowToSupply', name })) } : {}),
  step: i.steps.map((text, n) => ({ '@type': 'HowToStep', position: n + 1, text: plainText(text) })),
}))

export default function LandingGuide() {
  const { pathname } = useLocation()
  const page = LANDING_PAGES.find(p => p.path === pathname.replace(/\/+$/, ''))
  if (!page) return <NotFound />
  const schema = [faqSchema(page.faq), ...(page.howTo ? howToSchema(page) : [])]
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title={page.seoTitle} description={page.description} path={page.path} structuredData={schema} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: page.h1 }]} />
    <h1 className="text-center text-3xl font-black sm:text-5xl"><span aria-hidden="true">{page.emoji} </span>{page.h1}</h1>
    <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-slate-700">{page.intro}</p>
    <nav aria-label="בעמוד הזה" className="mt-5 flex flex-wrap justify-center gap-2">{page.sections.map((s, i) => <a key={s.title} href={`#s${i}`} className="rounded-full border-2 border-slate-200 bg-white px-3 py-1 font-bold">{s.title}</a>)}</nav>
    {page.sections.map((s, i) => <section key={s.title} id={`s${i}`} className="mt-10 scroll-mt-20">
      <h2 className="text-2xl font-black sm:text-3xl">{s.title}</h2>
      {s.intro && <p className="mt-1 text-slate-600">{s.intro}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{s.items.map(item => <article key={item.name} className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-xl font-black">{item.name}</h3>{item.tag && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-sm font-bold text-violet-800" dir="auto">{item.tag}</span>}</div>
        <p className="mt-1"><RichText text={item.text} /></p>
        {item.materials?.length > 0 && <p className="mt-2 text-sm"><b>צריך:</b> {item.materials.join(', ')}</p>}
        {item.steps?.length > 0 && <ol className="mt-2 list-decimal space-y-1 pr-5 text-[15px]">{item.steps.map(st => <li key={st}><RichText text={st} /></li>)}</ol>}
      </article>)}</div>
    </section>)}
    <div className="mt-12"><SeoBody paragraphs={[]} faq={page.faq} related={page.related} /></div>
    <p className="mt-6 text-center"><Link to="/" className="underline">← לעמוד הבית של עוגה בוגה</Link></p>
  </div>
}
