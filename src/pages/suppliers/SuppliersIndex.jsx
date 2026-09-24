import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { SupplierCard } from '../../components/suppliers/SupplierBits'
import { suppliersDb } from '../../utils/suppliersDb'
import { SUPPLIER_CATEGORIES, SUPPLIER_AREAS } from '../../data/supplierOptions'

export default function SuppliersIndex() {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [cat, setCat] = useState('')
  const [area, setArea] = useState('')
  const [q, setQ] = useState('')
  useEffect(() => { suppliersDb.list().then(setList).catch(e => setError(e.message)) }, [])

  const shown = useMemo(() => (list || []).filter(s =>
    (!cat || s.category === cat) &&
    (!area || s.area === area || s.area === 'כל הארץ') &&
    (!q.trim() || `${s.name} ${s.tagline || ''} ${s.about || ''} ${(s.tags || []).join(' ')}`.includes(q.trim()))
  ), [list, cat, area, q])
  const usedCats = useMemo(() => SUPPLIER_CATEGORIES.filter(([id]) => (list || []).some(s => s.category === id)), [list])

  return <div className="mx-auto max-w-6xl px-4 py-8">
    <SEO title="ספקים לימי הולדת ואירועי ילדים" description="ספקים לימי הולדת ואירועי ילדים: מפעילים, קוסמים, עוגות, צילום, בלונים ומתנפחים — פנייה ישירה בוואטסאפ, בלי תיווך." path="/suppliers" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ספקים' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl">🎪 ספקים לימי הולדת</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">מפעילים, קוסמים, עוגות, צילום ועוד — פונים ישירות בוואטסאפ, בלי תיווך ובלי עמלות.</p>
    </header>

    <div className="mb-6 space-y-3 rounded-3xl bg-white p-4 shadow-sm">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 חיפוש: קוסם, עוגת בצק סוכר, צלמת…" aria-label="חיפוש ספק"
        className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-slate-800 focus:outline-none" />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button onClick={() => setCat('')} aria-pressed={!cat} className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${!cat ? 'border-[var(--ink)] bg-[var(--postit)]' : 'border-slate-200 bg-white'}`}>הכול</button>
        {(usedCats.length ? usedCats : SUPPLIER_CATEGORIES).map(([id, label]) => <button key={id} onClick={() => setCat(c => c === id ? '' : id)} aria-pressed={cat === id}
          className={`shrink-0 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-bold ${cat === id ? 'border-[var(--ink)] bg-[var(--postit)]' : 'border-slate-200 bg-white'}`}>{label}</button>)}
      </div>
      <select value={area} onChange={e => setArea(e.target.value)} aria-label="אזור" className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-bold">
        <option value="">📍 כל האזורים</option>
        {SUPPLIER_AREAS.filter(a => a !== 'כל הארץ').map(a => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>

    {error ? <p className="rounded-2xl bg-amber-50 p-5 text-center">{error}</p>
      : !list ? <p className="py-10 text-center text-lg">טוענים ספקים…</p>
      : shown.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map(s => <SupplierCard key={s.id} s={s} />)}</div>
      : <p className="rounded-2xl bg-slate-50 p-8 text-center text-lg">{list.length ? 'לא מצאנו ספק שמתאים לחיפוש. נסו לשנות סינון.' : 'הספקים הראשונים מצטרפים ממש עכשיו 🎈'}</p>}

    <section className="wobbly mt-10 border-2 border-[var(--border)] bg-[var(--postit)] p-6 text-center sm:p-8">
      <h2 className="font-display text-3xl font-bold">נותנים שירות לימי הולדת?</h2>
      <p className="mx-auto mt-2 max-w-xl text-lg">כרטיס ספק בעוגה בוגה הוא בחינם: לוגו, תמונה, קצת עליכם ורשתות חברתיות — ופניות ישירות אליכם לוואטסאפ. תראו בדיוק כמה פניות הגיעו מאיתנו.</p>
      <Link to="/suppliers/me" className="mt-5 inline-block rounded-2xl bg-[var(--ink)] px-6 py-3 text-lg font-bold text-white">הצטרפות בחינם ←</Link>
    </section>
  </div>
}
