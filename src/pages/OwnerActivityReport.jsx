import { useEffect, useMemo, useState } from 'react'
import SEO from '../components/ui/SEO'
import { ownerSupabase as supabase } from '../utils/ownerAuth'
import { ACTIVITY_LABELS, ACTION_LABELS } from '../utils/liveActivity'

export default function OwnerActivityReport(){
  const [rows,setRows]=useState([]), [loading,setLoading]=useState(true), [error,setError]=useState('')
  useEffect(()=>{let live=true;(async()=>{
    const {data,error}=await supabase.from('owner_site_activity').select('category,action,created_at').order('created_at',{ascending:false}).limit(500)
    if(!live)return
    if(error)setError('הדוח המלא עדיין לא הופעל במסד הנתונים.')
    setRows(data||[]);setLoading(false)
  })();return()=>{live=false}},[])
  const describe=(category,action)=>`${ACTION_LABELS[action]||action} · ${ACTIVITY_LABELS[category]||category}`
  const summary=useMemo(()=>Object.entries(rows.reduce((a,row)=>{const key=`${row.category}|${row.action}`;a[key]=(a[key]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1]),[rows])
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl"><SEO title="דוח פעילות בעלים" description="דוח פרטי של פעילות באתר עוגה בוגה." noindex path="/admin/activity"/><div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-[0_7px_0_#e5e7eb] sm:p-9"><div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold text-violet-600">אזור בעלים · פרטי</p><h1 className="mt-1 text-3xl font-black sm:text-5xl">מה עשו באתר?</h1><p className="mt-2 text-slate-600">כל פעולה משמעותית שנרשמה באתר ב-90 הימים האחרונים — פתיחת דף, משחק, הדפסה, הורדה ועוד. בלי שמות, בלי כתובות IP ובלי טקסט חופשי.</p></div><span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold">לא מופיע בתפריט הציבורי</span></div>{error&&<div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><b>שימו לב:</b> {error}</div>}{loading?<p role="status">טוענים את הדוח…</p>:<><div className="mb-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-violet-50 p-4"><b className="block text-3xl">{rows.length}</b><span>פעולות שנשמרו</span></div><div className="rounded-2xl bg-pink-50 p-4"><b className="block text-3xl">{summary.length}</b><span>סוגי פעילויות</span></div><div className="rounded-2xl bg-cyan-50 p-4"><b className="block text-3xl">{rows[0]?new Date(rows[0].created_at).toLocaleDateString('he-IL'):'—'}</b><span>הפעילות האחרונה</span></div></div><h2 className="mb-3 text-2xl font-black">לפי פעילות</h2>{summary.length?<div className="mb-8 grid gap-2 sm:grid-cols-2">{summary.map(([key,count])=>{const [category,action]=key.split('|');return <div key={key} className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3"><span>{describe(category,action)}</span><b>{count}</b></div>})}</div>:<p className="rounded-xl bg-slate-50 p-4">עדיין לא נשמרו פעולות בדוח.</p>}<h2 className="mb-3 text-2xl font-black">פעולות אחרונות</h2><div className="overflow-x-auto"><table className="w-full text-right"><thead><tr className="border-b-2"><th className="p-2">פעילות</th><th className="p-2">מועד</th></tr></thead><tbody>{rows.slice(0,50).map((row,i)=><tr key={i} className="border-b"><td className="p-2">{describe(row.category,row.action)}</td><td className="p-2 text-slate-600">{new Date(row.created_at).toLocaleString('he-IL')}</td></tr>)}</tbody></table></div></>}</div></div>
}
