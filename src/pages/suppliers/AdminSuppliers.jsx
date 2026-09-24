import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import SEO from '../../components/ui/SEO'
import SupplierEditor from '../../components/suppliers/SupplierEditor'
import { Logo } from '../../components/suppliers/SupplierBits'
import { suppliersDb } from '../../utils/suppliersDb'
import { categoryLabel } from '../../data/supplierOptions'

const FILTERS = [['all', 'הכול'], ['pending', '⏳ ממתינים'], ['request', '⭐ ביקשו דף'], ['approved', '✅ מפורסמים'], ['hidden', '🙈 מוסתרים']]
const BADGE = { pending: 'bg-amber-100 text-amber-900', approved: 'bg-emerald-100 text-emerald-900', hidden: 'bg-slate-200 text-slate-700' }
const LABEL = { pending: '⏳ ממתין', approved: '✅ מפורסם', hidden: '🙈 מוסתר' }

export default function AdminSuppliers() {
  const [list, setList] = useState(null), [err, setErr] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null) // supplier object, or {} for new
  const [confirmDel, setConfirmDel] = useState(null)
  const load = useCallback(() => suppliersDb.adminList().then(setList).catch(e => setErr(e.message)), [])
  useEffect(() => { load() }, [load])

  const counts = useMemo(() => ({ pending: (list || []).filter(s => s.status === 'pending').length, request: (list || []).filter(s => s.page_request).length }), [list])
  const shown = (list || []).filter(s => filter === 'all' || (filter === 'request' ? s.page_request : s.status === filter))
  const quick = async (s, patch) => { try { await suppliersDb.adminSave({ ...s, ...patch }); load() } catch (e) { setErr(e.message) } }

  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="ניהול ספקים" path="/admin/suppliers" noindex />
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><p className="font-bold text-violet-600">אזור בעלים · פרטי</p><h1 className="text-3xl font-black sm:text-4xl">ניהול ספקים</h1>
        <p className="mt-1 text-slate-600">{list ? `${list.length} ספקים` : '…'}{counts.pending ? ` · ${counts.pending} ממתינים לאישור` : ''}{counts.request ? ` · ${counts.request} ביקשו דף נחיתה` : ''}</p></div>
      <div className="flex gap-2"><a href="/admin/activity" className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 font-bold">📊 דוח פעילות</a>
        <button onClick={() => setEditing({})} className="rounded-xl bg-[var(--ink)] px-4 py-2 font-bold text-white">＋ ספק חדש</button></div>
    </div>
    {err && <p className="mb-4 rounded-2xl bg-rose-50 p-4 font-bold text-rose-800">{err}</p>}
    <div className="mb-4 flex flex-wrap gap-2">{FILTERS.map(([id, l]) => <button key={id} onClick={() => setFilter(id)} className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${filter === id ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white'}`}>{l}</button>)}</div>

    {!list ? <p>טוענים…</p> : shown.length === 0 ? <p className="rounded-2xl bg-slate-50 p-6 text-center">אין ספקים כאן עדיין.</p>
      : <ul className="space-y-3">{shown.map(s => { const k = s.stats?.by_kind || {}; return <li key={s.id} className="rounded-3xl border-2 border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Logo s={s} size="h-14 w-14" className="border-slate-100" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><b className="text-lg">{s.name}</b>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${BADGE[s.status]}`}>{LABEL[s.status]}</span>
              {s.plan === 'page' && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-900">⭐ דף נחיתה · תבנית {s.template}</span>}
              {s.page_request && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-900">🔔 ביקש/ה דף נחיתה</span>}
            </div>
            <p className="truncate text-sm text-slate-600">{[categoryLabel(s.category), s.area, s.has_user ? 'נרשם/ה בעצמו/ה' : 'נוצר על ידך'].filter(Boolean).join(' · ')}</p>
            <p className="text-sm text-slate-600">30 יום: 👀 {k.view || 0} צפיות · 💬 {k.whatsapp || 0} וואטסאפ · 📞 {k.phone || 0} חיוגים · 🌐 {(k.social || 0) + (k.website || 0)} רשתות</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {s.status !== 'approved' && <button onClick={() => quick(s, { status: 'approved' })} className="rounded-xl bg-emerald-600 px-3 py-2 font-bold text-white">✅ אישור ופרסום</button>}
          {s.status === 'approved' && <button onClick={() => quick(s, { status: 'hidden' })} className="rounded-xl border-2 border-slate-300 px-3 py-2 font-bold">🙈 הסתרה</button>}
          {s.plan !== 'page' ? <button onClick={() => quick(s, { plan: 'page' })} className="rounded-xl border-2 border-violet-300 px-3 py-2 font-bold text-violet-800">⭐ הפעלת דף נחיתה</button>
            : <button onClick={() => quick(s, { plan: 'card' })} className="rounded-xl border-2 border-slate-300 px-3 py-2 font-bold">חזרה לכרטיס</button>}
          <button onClick={() => setEditing(s)} className="rounded-xl border-2 border-slate-800 px-3 py-2 font-bold">✏️ עריכה</button>
          {s.status === 'approved' && <a href={`/suppliers/${s.slug}`} target="_blank" rel="noopener" className="rounded-xl border-2 border-slate-200 px-3 py-2 font-bold">👀 צפייה</a>}
          <button onClick={() => setConfirmDel(s)} className="rounded-xl px-3 py-2 text-rose-700 underline">מחיקה</button>
        </div>
      </li> })}</ul>}

    {editing && createPortal(<div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--background)]" role="dialog" aria-modal="true" aria-label="עריכת ספק">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur"><b>{editing.id ? `עריכה: ${editing.name}` : 'ספק חדש'}</b><button onClick={() => { setEditing(null); load() }} className="rounded-xl bg-[var(--ink)] px-4 py-2 font-bold text-white">סגירה</button></div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <SupplierEditor key={editing.id || 'new'} mode="owner" initial={editing.id ? editing : { status: 'approved', plan: 'card' }} saveLabel={editing.id ? 'שמירת שינויים' : 'יצירת ספק'}
          onSave={async p => { const saved = await suppliersDb.adminSave(editing.id ? { ...p, id: editing.id } : p); if (!editing.id) setEditing(saved); return saved }} />
      </div>
    </div>, document.body)}

    {confirmDel && createPortal(<div className="fixed inset-0 z-50 grid items-end bg-black/40 sm:items-center" onClick={() => setConfirmDel(null)}>
      <div onClick={e => e.stopPropagation()} className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl" role="alertdialog" aria-modal="true" aria-labelledby="del-q">
        <h2 id="del-q" className="text-xl font-bold">למחוק את {confirmDel.name}?</h2>
        <p className="mt-1 text-slate-600">הכרטיס והסטטיסטיקות שלו יימחקו. אי אפשר לשחזר. (אפשר גם רק להסתיר.)</p>
        <div className="mt-4 flex gap-2">
          <button onClick={async () => { try { await suppliersDb.adminDelete(confirmDel.id); setConfirmDel(null); load() } catch (e) { setErr(e.message); setConfirmDel(null) } }} className="min-h-[52px] flex-1 rounded-2xl bg-rose-600 text-lg font-bold text-white">כן, למחוק</button>
          <button onClick={() => setConfirmDel(null)} className="min-h-[52px] rounded-2xl border-2 border-slate-300 px-4 font-bold">ביטול</button>
        </div>
      </div>
    </div>, document.body)}
  </div>
}
