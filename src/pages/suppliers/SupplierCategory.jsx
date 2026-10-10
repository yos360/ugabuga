import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { SupplierCard } from '../../components/suppliers/SupplierBits'
import TrafficProof from '../../components/suppliers/TrafficProof'
import NotFound from '../NotFound'
import { suppliersDb } from '../../utils/suppliersDb'
import {
  SUPPLIER_AREA_SLUGS, areaBySlug, inArea, categoryPageBySlug, categoryPagePath, suppliersForPage,
} from '../../data/supplierCategoryPages'

const chip = on => `inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-bold ${on ? 'border-[var(--ink)] bg-[var(--postit)]' : 'border-slate-200 bg-white'}`

function Box({ title, children }) {
  return <section className="wobbly border-2 border-[var(--border)] bg-white p-5 sketch-shadow sm:p-6">
    <h2 className="mb-3 text-2xl font-bold">{title}</h2>
    {children}
  </section>
}
const Bullets = ({ items }) => <ul className="list-disc space-y-1.5 ps-5 text-lg leading-relaxed">{items.map(t => <li key={t}>{t}</li>)}</ul>

// Live list: fetched client-side (cards change without a deploy). Area filter is a ?area= link.
function SupplierList({ page, areaSlug }) {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { suppliersDb.list().then(setList).catch(e => setError(e.message)) }, [])
  const area = areaBySlug(areaSlug)
  const shown = useMemo(() => suppliersForPage(page, list, area), [page, list, area])
  const base = categoryPagePath(page.slug)
  // Choosing a supplier type (and area) counts as a search in the owner report.
  useEffect(() => { if (list) suppliersDb.logSearch({ type: page.slug, area, results: shown.length }) }, [list, page.slug, area]) // eslint-disable-line react-hooks/exhaustive-deps

  return <section id="list" className="scroll-mt-24">
    <h2 className="mb-3 text-3xl font-bold">{page.more}{area ? ` ${inArea(area)}` : ''}</h2>
    <nav aria-label="סינון לפי אזור" className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
      <Link to={base} className={chip(!area)} aria-current={!area ? 'page' : undefined} replace>📍 כל האזורים</Link>
      {SUPPLIER_AREA_SLUGS.map(([slug, name]) => <Link key={slug} to={`${base}?area=${slug}`} className={chip(area === name)} aria-current={area === name ? 'page' : undefined} replace>{name}</Link>)}
    </nav>
    {error ? <p className="rounded-2xl bg-amber-50 p-5 text-center">{error}</p>
      : !list ? <p className="py-8 text-center text-lg">טוענים ספקים…</p>
      : shown.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map((s, i) => <SupplierCard key={s.id} s={s} index={i} />)}</div>
      : <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-6 text-center">
          <p className="text-lg font-bold">{area ? `עוד אין כאן ספקים ${inArea(area)}.` : 'עוד אין ספקים בקטגוריה הזו.'}</p>
          <p className="mx-auto mt-1 max-w-xl">{area ? 'אפשר להסתכל בכל האזורים, או לחזור בקרוב — ספקים חדשים מצטרפים כל הזמן.' : 'ספקים חדשים מצטרפים כל הזמן. בינתיים, השאלות שלמעלה יעזרו לכם לבחור ספק טוב גם במקום אחר.'}</p>
          <p className="mt-3">נותנים שירות כזה? כרטיס ספק בעוגה בוגה הוא בחינם.</p>
          <Link to="/suppliers/me" className="mt-4 inline-block rounded-2xl bg-[var(--ink)] px-6 py-3 text-lg font-bold text-white">הצטרפות כספק ←</Link>
        </div>}
    <div className="mt-6"><TrafficProof /></div>
  </section>
}

export default function SupplierCategory() {
  const { type } = useParams()
  const [params] = useSearchParams()
  const page = categoryPageBySlug(type)
  if (!page) return <NotFound />
  const path = categoryPagePath(page.slug)
  const related = page.related.map(categoryPageBySlug).filter(Boolean)

  return <div className="mx-auto max-w-5xl px-4 py-8">
    <SEO title={page.title} description={page.description} path={path} structuredData={faqSchema(page.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ספקים לימי הולדת', href: '/suppliers' }, { label: page.h1 }]} />
    <header className="mb-8 text-center">
      <div className="text-5xl" aria-hidden="true">{page.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">{page.h1}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed">{page.intro}</p>
      <a href="#list" className="mt-4 inline-block rounded-2xl border-2 border-[var(--ink)] bg-white px-5 py-2.5 font-bold">לרשימת הספקים ↓</a>
    </header>

    <div className="grid gap-5 md:grid-cols-2">
      <Box title="מה כולל השירות"><Bullets items={page.includes} /></Box>
      <Box title="לאיזה גיל זה מתאים"><p className="text-lg leading-relaxed">{page.ages}</p></Box>
    </div>
    <div className="mt-5"><Box title="מה חשוב לבדוק"><Bullets items={page.considerations} /></Box></div>

    <section className="mt-8">
      <h2 className="mb-3 text-3xl font-bold">מה לשאול את הספק לפני שסוגרים</h2>
      <ul className="grid gap-2 sm:grid-cols-2">{page.ask.map(q => <li key={q} className="flex gap-2 rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-lg"><span aria-hidden="true">☐</span><span>{q}</span></li>)}</ul>
    </section>

    <section className="mt-8 wobbly border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5 sm:p-6">
      <h2 className="mb-2 text-2xl font-bold">רוצים לעשות את זה לבד?</h2>
      <p className="mb-3 text-lg">לא כל מסיבה צריכה ספק. אלה עמודים באתר שיעזרו לכם להכין משהו דומה בעצמכם:</p>
      <div className="flex flex-wrap gap-2">{page.diy.map(l => <Link key={l.href} to={l.href} className="rounded-full border-2 border-[var(--ink)] bg-white px-4 py-2 font-bold">{l.label} ←</Link>)}</div>
    </section>

    <div className="mt-10"><SupplierList page={page} areaSlug={params.get('area') || ''} /></div>

    <section className="mt-12">
      <h2 className="mb-3 text-2xl font-bold">עוד סוגי ספקים שמשתלבים</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{related.map(r => <Link key={r.slug} to={categoryPagePath(r.slug)} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center font-bold hover:border-[var(--ink)]"><span className="block text-3xl" aria-hidden="true">{r.emoji}</span>{r.h1}</Link>)}</div>
    </section>

    <div className="mt-10">
      <SeoBody faq={page.faq} related={[{ label: 'כל הספקים לימי הולדת', href: '/suppliers' }, { label: 'איך מתכננים יום הולדת', href: '/guides/how-to-plan-birthday' }, { label: 'תקציב ליום הולדת', href: '/guides/birthday-budget' }, { label: 'מחשבון מסיבה', href: '/calculator' }]} />
    </div>
  </div>
}
