import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const encode = value => btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const decode = value => { try { const raw = String(value || '').replace(/-/g, '+').replace(/_/g, '/'); const padded = raw + '='.repeat((4 - raw.length % 4) % 4); return JSON.parse(decodeURIComponent(escape(atob(padded)))) } catch { return null } }
const clean = value => String(value || '').replace(/\s+/g, ' ').trim()
const newStop = (clue = '') => ({ id: Math.random().toString(36).slice(2), clue })

function Player() {
  const [params] = useSearchParams()
  const hunt = decode(params.get('hunt')), step = Math.max(0, Number(params.get('step')) || 0)
  if (!hunt || !Array.isArray(hunt.stops) || !hunt.stops[step]) return <main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-4xl font-black">הקישור לא תקין</h1><p className="mt-3">בקשו ממארגן המשחק לסרוק או לשלוח שוב את הקוד.</p><Link className="mt-5 inline-block font-bold underline" to="/treasure-hunt/qr">יצירת ציד אוצרות חדש</Link></main>
  const last = step === hunt.stops.length - 1
  return <main className="min-h-[75vh] bg-gradient-to-b from-amber-50 to-emerald-50 px-4 py-10 text-center" dir="rtl"><SEO title={`${hunt.title} - ציד אוצרות QR`} noindex/><div className="mx-auto max-w-xl rounded-[2rem] border-[3px] border-slate-900 bg-white p-7 shadow-[8px_8px_0_#1d2233]"><div className="text-7xl">{last ? '🏆' : '🗺️'}</div><p className="mt-3 font-black text-emerald-700">{last ? 'הגעתם לאוצר!' : `תחנה ${step + 1} מתוך ${hunt.stops.length}`}</p><h1 className="mt-2 text-3xl font-black">{hunt.title}</h1><div className="mt-7 rounded-2xl bg-amber-100 p-6 text-2xl font-bold leading-10">{hunt.stops[step].clue}</div>{last ? <p className="mt-6 text-xl font-bold">כל הכבוד! השלמתם את כל המסלול 🎉</p> : <p className="mt-6 text-lg">פתרו את הרמז, מצאו את התחנה הבאה וסרקו את קוד ה־QR שמחכה שם.</p>}</div></main>
}

function QrCard({ url, index, clue }) {
  const [svg, setSvg] = useState('')
  useEffect(() => { let active = true; import('qrcode').then(({ default: QRCode }) => QRCode.toString(url, { type: 'svg', width: 260, margin: 1, errorCorrectionLevel: 'M' })).then(value => active && setSvg(value)).catch(() => {}); return () => { active = false } }, [url])
  return <article className="break-inside-avoid rounded-3xl border-[3px] border-slate-900 bg-white p-5 text-center shadow-[5px_5px_0_#1d2233]"><p className="text-sm font-black text-emerald-700">תחנה {index + 1}</p><h3 className="text-2xl font-black">סרקו כדי לקבל את הרמז</h3>{svg && <div className="mx-auto mt-3 w-52" dangerouslySetInnerHTML={{ __html: svg }} />}<p className="no-print mt-3 rounded-xl bg-slate-50 p-2 text-sm text-slate-500">למארגן בלבד: {clue}</p></article>
}

export default function QrTreasureHunt() {
  const [params] = useSearchParams()
  if (params.has('hunt')) return <Player />
  const [title, setTitle] = useState('ציד האוצר הגדול'), [stops, setStops] = useState([newStop('חפשו במקום שבו שומרים דברים קרים.'), newStop('מצאו את המקום שבו נחים בלילה.'), newStop('כל הכבוד! האוצר מחכה ממש לידכם.')]), [generated, setGenerated] = useState(false)
  const valid = stops.map(stop => clean(stop.clue)).filter(Boolean)
  const payload = useMemo(() => valid.length ? encode({ v: 1, title: clean(title).slice(0, 80) || 'ציד אוצרות', stops: valid.map(clue => ({ clue: clue.slice(0, 160) })) }) : '', [title, stops])
  const links = valid.map((clue, index) => ({ clue, url: `${location.origin}/treasure-hunt/qr/play?hunt=${payload}&step=${index}` }))
  const change = (index, value) => setStops(all => all.map((item, i) => i === index ? { ...item, clue: value } : item))
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl"><SEO title="ציד אוצרות QR - יוצרים, מדפיסים ומשחקים" description="יוצרים ציד אוצרות עם תחנות QR, מדפיסים את הקודים ומחביאים אותם. המשתתפים סורקים בטלפון ומקבלים בכל תחנה רמז חדש." path="/treasure-hunt/qr"/><Breadcrumbs items={[{ label:'ראשי',href:'/'},{label:'משחקים',href:'/games'},{label:'ציד אוצרות QR'}]}/>
    <header className="mx-auto max-w-3xl text-center"><div className="text-7xl">🗺️</div><h1 className="mt-2 text-4xl font-black sm:text-5xl">ציד אוצרות עם QR</h1><p className="mt-3 text-lg leading-8 text-slate-600">כותבים רמזים, מדפיסים את התחנות ומחביאים כל קוד במקום המתאים. הסריקה פותחת רק את הרמז — בלי אפליקציה ובלי הרשמה.</p></header>
    <section className="no-print mt-8 rounded-3xl border-[3px] border-slate-900 bg-amber-50 p-5 shadow-[6px_6px_0_#1d2233]"><label className="block font-black">שם המשחק<input value={title} onChange={e=>{setTitle(e.target.value);setGenerated(false)}} maxLength={80} className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg"/></label><h2 className="mt-6 text-2xl font-black">הרמזים לפי הסדר</h2><p className="text-sm text-slate-600">הרמז הראשון נפתח בסריקה הראשונה. הקוד הבא צריך לחכות במקום שאליו הרמז מוביל.</p><div className="mt-4 space-y-3">{stops.map((stop,index)=><div key={stop.id} className="flex items-start gap-2"><span className="mt-3 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 font-black text-white">{index+1}</span><textarea value={stop.clue} onChange={e=>{change(index,e.target.value);setGenerated(false)}} maxLength={160} rows={2} className="min-w-0 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-2" placeholder="כתבו את הרמז שיופיע לאחר הסריקה"/>{stops.length>2&&<button type="button" onClick={()=>{setStops(all=>all.filter((_,i)=>i!==index));setGenerated(false)}} className="mt-2 p-2 font-black text-red-700" aria-label={`מחיקת תחנה ${index+1}`}>✕</button>}</div>)}</div><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={stops.length>=8} onClick={()=>{setStops(all=>[...all,newStop()]);setGenerated(false)}} className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-bold disabled:opacity-50">+ הוספת תחנה</button><button type="button" disabled={valid.length<2} onClick={()=>setGenerated(true)} className="rounded-xl border-[3px] border-slate-900 bg-emerald-500 px-6 py-2 font-black text-white disabled:opacity-50">יצירת קודי QR</button></div><p className="mt-3 text-xs text-slate-500">אפשר ליצור עד 8 תחנות. כל המידע מוצפן בתוך הקישורים ואינו נשמר באתר.</p></section>
    {generated&&<section className="mt-9"><div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-3xl font-black">התחנות מוכנות</h2><p>הדפיסו, גזרו והחביאו לפי סדר הרמזים.</p></div><button onClick={()=>window.print()} className="rounded-xl border-[3px] border-slate-900 bg-violet-600 px-6 py-3 font-black text-white">🖨️ הדפסת התחנות</button></div><div className="grid gap-6 sm:grid-cols-2">{links.map((item,index)=><QrCard key={index} {...item} index={index}/>)}</div></section>}
  </div>
}
