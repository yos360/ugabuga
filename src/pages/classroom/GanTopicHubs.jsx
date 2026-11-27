import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { GAN_ACTIVITIES, GAN_CRAFTS } from '../../data/ganHubs'

// /gan/activities and /gan/crafts: curated entrances for kindergarten searches. Content lives in
// src/data/ganHubs.js; links point only at existing pages (tests/gan-topic-hubs.test.mjs).
const card = 'rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5'

function Original({ a }) {
  return <article className="rounded-3xl border-2 border-violet-300 bg-violet-50 p-5 text-slate-900 print:break-inside-avoid">
    <h3 className="text-xl font-black"><span aria-hidden="true">{a.emoji}</span> {a.title}</h3>
    <p className="mt-1 text-sm text-slate-600">{a.age}</p>
    <p className="mt-2"><b>חומרים:</b> {a.materials}</p>
    <ol className="mt-2 list-decimal space-y-1 pr-6">{a.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
    <p className="mt-3 rounded-xl bg-white p-3 text-sm"><b>טיפ:</b> {a.tip}</p>
  </article>
}

function GanTopicHub({ cfg }) {
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title={cfg.title} description={cfg.description} path={cfg.path} structuredData={faqSchema(cfg.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לגננת', href: '/gan' }, { label: cfg.crumb }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">{cfg.emoji} </span>{cfg.h1}</h1>
    <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">{cfg.lead}</p>
    <nav aria-label="קפיצה לנושא" className="mt-5 flex flex-wrap justify-center gap-2">
      <a href="#originals" className="inline-flex min-h-[44px] items-center rounded-2xl border-2 border-violet-300 bg-white px-3 font-bold text-slate-900">רעיונות חדשים</a>
      {cfg.sections.map((s, i) => <a key={s.title} href={`#s-${i}`} className="inline-flex min-h-[44px] items-center rounded-2xl border-2 border-[var(--border)] bg-white px-3 font-bold text-slate-900"><span aria-hidden="true">{s.emoji}</span>&nbsp;{s.title}</a>)}
    </nav>
    <section id="originals" aria-labelledby="orig-h" className="mt-8">
      <h2 id="orig-h" className="text-2xl font-black">{cfg.originals.length === 2 ? 'שני רעיונות מוכנים להיום' : 'רעיונות להיום'}</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">{cfg.originals.map(a => <Original key={a.title} a={a} />)}</div>
    </section>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">{cfg.sections.map((s, i) => <section key={s.title} id={`s-${i}`} className={card}>
      <h2 className="text-xl font-black"><span aria-hidden="true">{s.emoji}</span> {s.title}</h2>
      <p className="mt-1 text-[var(--muted-foreground)]">{s.text}</p>
      <ul className="mt-3 grid gap-1">{s.links.map(([label, to]) => <li key={to + label}><Link to={to} className="flex min-h-[44px] items-center rounded-xl px-2 font-bold hover:bg-[var(--muted)]/40">{label} <span aria-hidden="true" className="mr-auto text-slate-400">←</span></Link></li>)}</ul>
    </section>)}</div>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Link to={cfg.other.href} className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold text-slate-900">{cfg.other.label}</Link>
      <Link to="/gan" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold text-slate-900">כל מה שצריך לגן</Link>
      <Link to="/request" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-5 font-bold text-slate-900">חסר לכם דף? בקשו ונכין</Link>
    </div>
    <div className="mt-10"><SeoBody paragraphs={cfg.paragraphs} faq={cfg.faq} related={[{ label: 'השנה בגן לפי חודשים', href: '/classroom/kindergarten-year-plan' }, { label: 'משחקים לגן', href: '/games/kindergarten' }, { label: 'דפי עבודה לגן', href: '/printables/kindergarten-worksheets' }]} /></div>
  </div>
}

export const GanActivities = () => <GanTopicHub cfg={GAN_ACTIVITIES} />
export const GanCrafts = () => <GanTopicHub cfg={GAN_CRAFTS} />
