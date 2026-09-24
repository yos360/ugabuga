import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { Logo, SocialLinks, ContactButtons } from '../../components/suppliers/SupplierBits'
import SupplierLanding from '../../components/suppliers/SupplierLanding'
import { suppliersDb } from '../../utils/suppliersDb'
import { categoryLabel } from '../../data/supplierOptions'

// Free card: a simple profile page.
function Profile({ s }) {
  const chips = [categoryLabel(s.category), s.area && `📍 ${s.area}`, ...(s.tags || [])].filter(Boolean)
  return <article className="mx-auto max-w-2xl overflow-hidden rounded-[32px] border-2 border-[var(--border)] bg-white shadow-[0_5px_22px_rgb(37_46_88/6%)]">
    <div className="h-44 bg-[var(--postit)] sm:h-56">{s.cover_url && <img src={s.cover_url} alt="" className="h-full w-full object-cover" />}</div>
    <div className="-mt-12 px-5 pb-6 sm:px-8">
      <Logo s={s} size="h-24 w-24" />
      <h1 className="mt-3 text-4xl font-black">{s.name}</h1>
      {s.tagline && <p className="mt-1 text-lg text-[var(--muted-foreground)]">{s.tagline}</p>}
      {chips.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{chips.map(c => <span key={c} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">{c}</span>)}</div>}
      <ContactButtons s={s} big className="mt-5" />
      {s.about && <><h2 className="mt-7 text-xl font-black">💬 קצת עליי</h2><p className="mt-2 whitespace-pre-line text-lg leading-relaxed">{s.about}</p></>}
      <SocialLinks s={s} className="mt-6" size="h-11 w-11" />
    </div>
  </article>
}

export default function SupplierPage() {
  const { slug } = useParams()
  const [s, setS] = useState(undefined)
  useEffect(() => {
    setS(undefined)
    suppliersDb.get(slug).then(row => { setS(row || null); if (row) suppliersDb.track(row.id, 'view') }).catch(() => setS(null))
  }, [slug])

  if (s === undefined) return <p className="py-20 text-center text-lg">טוענים…</p>
  if (!s) return <div className="mx-auto max-w-md px-4 py-20 text-center">
    <SEO title="הספק לא נמצא" path={`/suppliers/${slug}`} noindex />
    <p className="text-xl font-bold">הדף הזה לא קיים או עוד לא פורסם.</p>
    <Link to="/suppliers" className="mt-6 inline-block rounded-xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">לכל הספקים</Link>
  </div>

  const hasContact = s.whatsapp || s.phone
  return <div className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:pb-10">
    <SEO title={`${s.name}${s.tagline ? ` — ${s.tagline}` : ''}`} description={(s.about || s.tagline || `${s.name} — ספק לימי הולדת ואירועי ילדים`).slice(0, 155)} path={`/suppliers/${s.slug}`} image={s.cover_url || s.logo_url || undefined} />
    <Link to="/suppliers" className="mb-4 inline-block text-sm font-bold text-slate-600 underline">→ לכל הספקים</Link>
    {s.plan === 'page' ? <SupplierLanding s={s} /> : <Profile s={s} />}
    {hasContact && createPortal(<div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <ContactButtons s={s} className="flex-nowrap" />
    </div>, document.body)}
  </div>
}
