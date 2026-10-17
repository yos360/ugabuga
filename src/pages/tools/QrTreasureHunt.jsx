import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

import { MAX_CLUE, MAX_STOPS, MAX_TITLE, QR_MAX_BYTES, clean, qrBytes, qrSizeStatus, readStation, stationUrls } from '../../utils/qrHunt'

const newStop = (clue = '') => ({ id: Math.random().toString(36).slice(2), clue })

function Player() {
  const [params] = useSearchParams()
  const station = readStation(params)
  if (!station) return <main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-4xl font-black">הקישור לא תקין</h1><p className="mt-3">בקשו ממארגן המשחק לסרוק או לשלוח שוב את הקוד.</p><Link className="mt-5 inline-block font-bold underline" to="/treasure-hunt/qr">יצירת ציד אוצרות חדש</Link></main>
  const { title, clue, index: step, total } = station
  const last = step === total - 1
  return <main className="min-h-[75vh] bg-gradient-to-b from-amber-50 to-emerald-50 px-4 py-10 text-center" dir="rtl"><SEO title={`${title} - ציד אוצרות QR`} noindex/><div className="mx-auto max-w-xl rounded-[2rem] border-[3px] border-slate-900 bg-white p-7 shadow-[8px_8px_0_#1d2233]"><div className="text-7xl">{last ? '🏆' : '🗺️'}</div><p className="mt-3 font-black text-emerald-700">{last ? 'הגעתם לאוצר!' : `תחנה ${step + 1} מתוך ${total}`}</p><h1 className="mt-2 text-3xl font-black">{title}</h1><div className="mt-7 rounded-2xl bg-amber-100 p-6 text-2xl font-bold leading-10">{clue}</div>{last ? <p className="mt-6 text-xl font-bold">כל הכבוד! השלמתם את כל המסלול 🎉</p> : <p className="mt-6 text-lg">פתרו את הרמז, מצאו את התחנה הבאה וסרקו את קוד ה־QR שמחכה שם.</p>}</div></main>
}

function QrCard({ url, index, clue }) {
  const [qr, setQr] = useState({ url: '', svg: '', failed: false })
  useEffect(() => { let active = true; import('qrcode').then(({ default: QRCode }) => QRCode.toString(url, { type: 'svg', width: 260, margin: 1, errorCorrectionLevel: 'M' })).then(svg => { if (active) setQr({ url, svg, failed: false }) }).catch(() => { if (active) setQr({ url, svg: '', failed: true }) }); return () => { active = false } }, [url])
  const current = qr.url === url
  return <article className="break-inside-avoid rounded-3xl border-[3px] border-slate-900 bg-white p-5 text-center shadow-[5px_5px_0_#1d2233]"><p className="text-sm font-black text-emerald-700">תחנה {index + 1}</p><h3 className="text-2xl font-black">סרקו כדי לקבל את הרמז</h3>{current && qr.svg && <div className="mx-auto mt-3 w-52" dangerouslySetInnerHTML={{ __html: qr.svg }} />}{current && qr.failed && <p role="alert" className="mx-auto mt-3 rounded-xl border-2 border-red-300 bg-red-50 p-3 font-bold text-red-700">לא הצלחנו ליצור קוד QR לתחנה הזו. קצרו את הרמז או את שם המשחק ונסו שוב.</p>}<p className="no-print mt-3 rounded-xl bg-slate-50 p-2 text-sm text-slate-500">למארגן בלבד: {clue}</p></article>
}

export default function QrTreasureHunt() {
  const [params] = useSearchParams()
  const [title, setTitle] = useState('ציד האוצר הגדול'), [stops, setStops] = useState([newStop('חפשו במקום שבו שומרים דברים קרים.'), newStop('מצאו את המקום שבו נחים בלילה.'), newStop('כל הכבוד! האוצר מחכה ממש לידכם.')]), [generated, setGenerated] = useState(false)
  const valid = useMemo(() => stops.map(stop => clean(stop.clue)).filter(Boolean), [stops])
  // Each QR holds only its own station's clue, so the size stays well under the QR limit
  const links = useMemo(() => stationUrls(location.origin, title, valid).map((url, index) => ({ clue: valid[index], url })), [title, valid])
  const largest = links.reduce((max, item) => Math.max(max, qrBytes(item.url)), 0)
  const sizeStatus = qrSizeStatus(largest)
  const change = (index, value) => setStops(all => all.map((item, i) => i === index ? { ...item, clue: value } : item))
  if (params.has('hunt') || params.has('s')) return <Player />
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl"><SEO title="ציד אוצרות QR - יוצרים, מדפיסים ומשחקים" description="יוצרים ציד אוצרות עם תחנות QR, מדפיסים את הקודים ומחביאים אותם. המשתתפים סורקים בטלפון ומקבלים בכל תחנה רמז חדש." path="/treasure-hunt/qr"/><Breadcrumbs items={[{ label:'ראשי',href:'/'},{label:'משחקים',href:'/games'},{label:'ציד אוצרות QR'}]}/>
    <header className="mx-auto max-w-3xl text-center"><div className="text-7xl">🗺️</div><h1 className="mt-2 text-4xl font-black sm:text-5xl">ציד אוצרות עם QR</h1><p className="mt-3 text-lg leading-8 text-slate-600">כותבים רמזים, מדפיסים את התחנות ומחביאים כל קוד במקום המתאים. הסריקה פותחת רק את הרמז — בלי אפליקציה ובלי הרשמה.</p></header>
    <section className="no-print mt-8 rounded-3xl border-[3px] border-slate-900 bg-amber-50 p-5 shadow-[6px_6px_0_#1d2233]"><label className="block font-black">שם המשחק<input value={title} onChange={e=>{setTitle(e.target.value);setGenerated(false)}} maxLength={MAX_TITLE} className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg"/></label><h2 className="mt-6 text-2xl font-black">הרמזים לפי הסדר</h2><p className="text-sm text-slate-600">הרמז הראשון נפתח בסריקה הראשונה. הקוד הבא צריך לחכות במקום שאליו הרמז מוביל.</p><div className="mt-4 space-y-3">{stops.map((stop,index)=><div key={stop.id} className="flex items-start gap-2"><span className="mt-3 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 font-black text-white">{index+1}</span><textarea value={stop.clue} onChange={e=>{change(index,e.target.value);setGenerated(false)}} maxLength={MAX_CLUE} rows={2} className="min-w-0 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-2" placeholder="כתבו את הרמז שיופיע לאחר הסריקה"/>{stops.length>2&&<button type="button" onClick={()=>{setStops(all=>all.filter((_,i)=>i!==index));setGenerated(false)}} className="mt-2 p-2 font-black text-red-700" aria-label={`מחיקת תחנה ${index+1}`}>✕</button>}</div>)}</div><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={stops.length>=MAX_STOPS} onClick={()=>{setStops(all=>[...all,newStop()]);setGenerated(false)}} className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-bold disabled:opacity-50">+ הוספת תחנה</button><button type="button" disabled={valid.length<2||sizeStatus==='too-big'} onClick={()=>setGenerated(true)} className="rounded-xl border-[3px] border-slate-900 bg-emerald-500 px-6 py-2 font-black text-white disabled:opacity-50">יצירת קודי QR</button></div>{links.length>0&&<p className={`mt-3 text-xs font-bold ${sizeStatus==='ok'?'text-slate-500':'text-red-700'}`} role={sizeStatus==='ok'?undefined:'alert'}>גודל הקוד הגדול ביותר: {largest} מתוך {QR_MAX_BYTES} תווים{sizeStatus==='dense'?' — הקוד צפוף, כדאי לקצר את הרמז כדי שיהיה קל לסרוק':sizeStatus==='too-big'?' — ארוך מדי לקוד QR, קצרו את הרמז או את שם המשחק':''}</p>}<p className="mt-3 text-xs text-slate-500">אפשר ליצור עד {MAX_STOPS} תחנות, עד {MAX_CLUE} תווים לכל רמז. כל קוד מכיל רק את הרמז של התחנה שלו, והמידע אינו נשמר באתר.</p></section>
    {generated&&<section className="mt-9"><div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-3xl font-black">התחנות מוכנות</h2><p>הדפיסו, גזרו והחביאו לפי סדר הרמזים.</p></div><button onClick={()=>window.print()} className="rounded-xl border-[3px] border-slate-900 bg-violet-600 px-6 py-3 font-black text-white">🖨️ הדפסת התחנות</button></div><div className="grid gap-6 sm:grid-cols-2">{links.map((item,index)=><QrCard key={index} {...item} index={index}/>)}</div></section>}
  </div>
}
