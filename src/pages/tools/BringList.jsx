import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const starter = ['עוגה', 'שתייה', 'כוסות', 'צלחות', 'פירות', 'מפיות', 'בלונים', 'רמקול']

export default function BringList() {
  const [params, setParams] = useSearchParams()
  const decoded = useMemo(() => {
    try { return params.get('list') ? JSON.parse(atob(params.get('list'))) : null } catch { return null }
  }, [params])
  const [title, setTitle] = useState(decoded?.title || 'מסיבת סוף שנה')
  const [items, setItems] = useState(decoded?.items || starter.map(text => ({ text, takenBy: '' })))
  const [newItem, setNewItem] = useState('')
  const [copied, setCopied] = useState(false)
  const taken = items.filter(x => x.takenBy.trim()).length
  const update = (i, patch) => setItems(x => x.map((item, n) => n === i ? { ...item, ...patch } : item))
  const add = () => { if (newItem.trim()) { setItems(x => [...x, { text: newItem.trim(), takenBy: '' }]); setNewItem('') } }
  const share = async () => {
    const encoded = btoa(JSON.stringify({ title, items }))
    const url = `${window.location.origin}/tools/bring-list?list=${encodeURIComponent(encoded)}`
    setParams({ list: encoded })
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500) } catch { window.prompt('העתיקו את הקישור לשיתוף:', url) }
  }
  return <div className="mx-auto max-w-5xl px-4 py-8"><SEO title="מי מביא מה? רשימה שיתופית למסיבה" description="פותחים רשימה, משתפים בוואטסאפ וכולם בוחרים מה להביא למסיבה." path="/tools/bring-list"/><Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'כלים'},{label:'מי מביא מה?'}]}/><header className="text-center mb-7"><h1 className="text-4xl sm:text-5xl">🧺 מי מביא מה?</h1><p className="mt-2 text-lg text-[var(--muted-foreground)]">רשימה שיתופית למסיבה — כל אחד תופס פריט, בלי הרשמה ובלי בלגן.</p></header>
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start"><section className="wobbly border-2 border-[var(--border)] bg-white p-5 sketch-shadow"><div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed pb-4"><label className="flex-1 font-bold">שם הרשימה<input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-lg"/></label><span className="rounded-full bg-emerald-100 px-3 py-2 font-bold text-emerald-800">{taken}/{items.length} נתפסו</span></div><div className="mt-4 space-y-3">{items.map((item,i)=><div key={i} className={`rounded-2xl border-2 p-3 ${item.takenBy?'border-emerald-200 bg-emerald-50':'border-slate-200 bg-slate-50'}`}><div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-center"><input value={item.text} onChange={e=>update(i,{text:e.target.value})} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold" aria-label={`פריט ${i+1}`}/><input value={item.takenBy} onChange={e=>update(i,{takenBy:e.target.value})} placeholder="מי מביא? כתבו שם" className="rounded-lg border border-slate-200 bg-white px-3 py-2" aria-label={`מי מביא ${item.text}`}/><button onClick={()=>setItems(x=>x.filter((_,n)=>n!==i))} className="rounded-lg px-2 py-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`מחיקת ${item.text}`}>✕</button></div>{item.takenBy&&<div className="mt-2 text-sm font-bold text-emerald-700">✅ {item.takenBy} מביא/ה את זה</div>}</div>)}</div><div className="mt-4 flex gap-2"><input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="הוסיפו פריט חדש" className="flex-1 rounded-xl border-2 border-dashed border-slate-300 px-3 py-2"/><button onClick={add} className="rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">＋ הוספה</button></div></section><aside className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5"><h2 className="font-display text-2xl font-bold">איך זה עובד?</h2><ol className="mt-3 list-decimal space-y-2 pr-5"><li>נותנים שם לרשימה.</li><li>מוסיפים את כל מה שצריך.</li><li>לוחצים על שיתוף ושולחים בוואטסאפ.</li><li>כל אחד כותב את השם שלו ליד פריט.</li></ol><button onClick={share} className="mt-5 w-full rounded-xl bg-[#25D366] px-4 py-3 font-bold text-white">📱 {copied?'הקישור הועתק!':'העתיקו קישור לשיתוף'}</button><button onClick={()=>window.print()} className="mt-2 w-full rounded-xl border-2 border-slate-800 bg-white px-4 py-3 font-bold">🖨️ הדפיסו</button><p className="mt-4 text-sm text-slate-600">כל מי שיש לו את הקישור יכול לראות ולעדכן את הרשימה במכשיר שלו.</p></aside></div></div>
}
