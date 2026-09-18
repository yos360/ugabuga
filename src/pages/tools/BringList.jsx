import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const starter = ['עוגה', 'שתייה', 'כוסות', 'צלחות', 'פירות', 'מפיות', 'בלונים', 'רמקול']
const enc = value => btoa(unescape(encodeURIComponent(JSON.stringify(value))))
const dec = value => JSON.parse(decodeURIComponent(escape(atob(value))))

export default function BringList() {
  const [params, setParams] = useSearchParams()
  const viewOnly = params.has('view')
  const code = params.get('code')
  const initial = useMemo(() => { try { return params.get('list') ? dec(params.get('list')) : null } catch { return null } }, [params])
  const [title, setTitle] = useState(initial?.title || 'מסיבת סוף שנה')
  const [items, setItems] = useState(initial?.items || starter.map(text => ({ text, takenBy: '' })))
  const [newItem, setNewItem] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  useEffect(() => {
    if (!code) return
    supabase.rpc('get_party_list', { p_share_code: code }).then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data
      if (row) { setTitle(row.title); setItems(row.items || []) }
    })
  }, [code])
  const update = (index, patch) => setItems(old => old.map((item, i) => i === index ? { ...item, ...patch } : item))
  const add = () => { if (newItem.trim()) { setItems(old => [...old, { text: newItem.trim(), takenBy: '' }]); setNewItem('') } }
  const share = async () => {
    const ownerToken = crypto.randomUUID()
    localStorage.setItem('ugabuga-party-owner', ownerToken)
    const { data, error } = await supabase.rpc('create_party_list', { p_owner_token: ownerToken, p_title: title, p_items: items })
    const row = Array.isArray(data) ? data[0] : data
    if (error || !row?.share_code) { setShareUrl(`${location.origin}/tools/bring-list?list=${encodeURIComponent(enc({ title, items }))}&view=1`); return }
    const url = `${location.origin}/tools/bring-list?code=${encodeURIComponent(row.share_code)}&view=1`
    setShareUrl(url); setParams({ code: row.share_code, view: '1' })
    try { await navigator.clipboard.writeText(url) } catch { /* visible fallback */ }
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }
  const taken = items.filter(item => item.takenBy.trim()).length
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SEO title="מי מביא מה? רשימה שיתופית למסיבה" description="רשימה שיתופית למסיבה" path="/tools/bring-list" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'מי מביא מה?' }]} />
      <header className="mb-7 text-center">
        <h1 className="text-4xl sm:text-5xl">🧺 מי מביא מה?</h1>
        <p className="mt-2 text-lg text-[var(--muted-foreground)]">רשימה שיתופית למסיבה — כל אחד תופס פריט, בלי הרשמה.</p>
        {viewOnly && <div className="mx-auto mt-4 max-w-xl rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 font-bold text-blue-900">👀 מצב השתתפות — אפשר לתפוס רק פריט פנוי.</div>}
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <section className="wobbly border-2 border-[var(--border)] bg-white p-5 sketch-shadow">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed pb-4">
            <label className="flex-1 font-bold">שם הרשימה<input disabled={viewOnly} value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-lg disabled:bg-slate-100" /></label>
            <span className="rounded-full bg-emerald-100 px-3 py-2 font-bold text-emerald-800">{taken}/{items.length} נתפסו</span>
          </div>
          <div className="mt-4 space-y-3">
            {items.map((item, i) => <div key={i} className={`rounded-2xl border-2 p-3 ${item.takenBy ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input disabled={viewOnly} value={item.text} onChange={e => update(i, { text: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold disabled:bg-slate-100" aria-label={`פריט ${i + 1}`} />
                <input disabled={viewOnly && Boolean(item.takenBy.trim())} value={item.takenBy} onChange={e => update(i, { takenBy: e.target.value })} onBlur={async e => { if (viewOnly && code && e.target.value.trim() && !item.takenBy) { const { data } = await supabase.rpc('claim_party_item', { p_share_code: code, p_index: i, p_name: e.target.value }); const row = Array.isArray(data) ? data[0] : data; if (row?.items) setItems(row.items) } }} placeholder={viewOnly ? 'כתבו את שמכם כדי לתפוס' : 'מי מביא? כתבו שם'} className="rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:bg-slate-100" aria-label={`מי מביא ${item.text}`} />
                {!viewOnly && <button onClick={() => setItems(old => old.filter((_, n) => n !== i))} className="rounded-lg px-2 py-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`מחיקת ${item.text}`}>✕</button>}
              </div>
              {item.takenBy && <div className="mt-2 text-sm font-bold text-emerald-700">✅ {item.takenBy} מביא/ה את זה</div>}
            </div>)}
          </div>
          {!viewOnly && <div className="mt-4 flex gap-2"><input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="הוסיפו פריט חדש" className="flex-1 rounded-xl border-2 border-dashed border-slate-300 px-3 py-2" /><button onClick={add} className="rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">＋ הוספה</button></div>}
        </section>
        <aside className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5"><h2 className="font-display text-2xl font-bold">איך זה עובד?</h2><ol className="mt-3 list-decimal space-y-2 pr-5"><li>נותנים שם לרשימה.</li><li>מוסיפים את כל מה שצריך.</li><li>משתפים בוואטסאפ.</li><li>כל אחד תופס פריט פנוי.</li></ol>{!viewOnly && <><button onClick={share} className="mt-5 w-full rounded-xl bg-[#25D366] px-4 py-3 font-bold text-white">📱 {copied ? 'הקישור הועתק!' : 'העתיקו קישור לשיתוף'}</button>{shareUrl && <div className="mt-3"><label className="text-sm font-bold">הקישור שלכם</label><input readOnly value={shareUrl} onFocus={e => e.target.select()} className="mt-1 w-full rounded-lg border-2 border-emerald-300 bg-white px-2 py-2 text-xs" /><button onClick={() => navigator.clipboard?.writeText(shareUrl)} className="mt-2 w-full rounded-lg border border-slate-700 bg-white px-3 py-2 text-sm font-bold">📋 העתקה חוזרת</button></div>}</>}<button onClick={() => window.print()} className="mt-2 w-full rounded-xl border-2 border-slate-800 bg-white px-4 py-3 font-bold">🖨️ הדפיסו</button><p className="mt-4 text-sm text-slate-600">בקישור שנשלח אי אפשר לשנות או למחוק פריטים — רק לתפוס פריט פנוי.</p></aside>
      </div>
    </div>
  )
}
