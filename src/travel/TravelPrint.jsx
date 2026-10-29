import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { savePagesAsPdf } from '../utils/pagesToPdf'
import { recordActivity } from '../utils/liveActivity'
import '../components/ui/print-preview.css'
import { localKit } from './localKit'

export function Paper({title,children,lang="he"}) {return <article className="buga-a4 travel-paper" lang={lang} dir={lang==='en'?'ltr':'rtl'}><h2>{title}</h2><div className="travel-paper-body">{children}</div><footer>{lang==='en'?'Travel with Buga · ugabuga.co.il/en':'נוסעים עם בוגה · ugabuga.co.il'}</footer></article>}
export default function TravelPrint({children,kit=false,lang="he"}) {
 const en=lang==='en'
 const root=useRef(null),wrapper=useRef(null),[zoom,setZoom]=useState(.4),[busy,setBusy]=useState(false),[status,setStatus]=useState('')
 useEffect(()=>{const el=wrapper.current;const observer=new ResizeObserver(([e])=>setZoom(Math.min(1,e.contentRect.width/794)));observer.observe(el);return()=>observer.disconnect()},[])
 const pdf=async()=>{setBusy(true);setStatus(en?'Preparing your PDF on this device…':'מכינים PDF במכשיר…');try{const result=await savePagesAsPdf([...root.current.querySelectorAll('.travel-paper')],en?'Travel with Buga':'נוסעים עם בוגה', (n,total)=>setStatus(en?`Preparing page ${n} of ${total}`:`מכינים דף ${n} מתוך ${total}`), {onBlob:async blob=>{if(kit){try{await localKit('put',blob,lang);setStatus(en?'Your latest kit is saved on this device and available in your flight bag.':'הערכה האחרונה נשמרה במכשיר ונמצאת גם בתיק הטיסה.')}catch(e){setStatus(en?'Local storage was unavailable. The PDF will still download.':e.message+' הקובץ עדיין יורד למכשיר.')}}}});if(result?.status==='needs-browser'){setStatus(en?'To save a PDF, open this page in Chrome or Safari. The Print button still works here.':'כדי לשמור PDF צריך לפתוח את הדף בכרום או בספארי. כפתור ההדפסה ממשיך לעבוד.');return}recordActivity('download','worksheet');if(!kit)setStatus(en?'Your PDF is ready.':'ה־PDF מוכן.')}catch{setStatus(en?'The PDF could not be prepared. Use Print pages and choose Save as PDF instead.':'לא הצלחנו להכין PDF. אפשר להשתמש בכפתור ההדפסה ולבחור שמירה כ־PDF.')}finally{setBusy(false)}}
 return <><div className="travel-controls"><button onClick={()=>{recordActivity('print','worksheet');window.print()}}>{en?'Print pages':'הדפסת הדפים'}</button><button onClick={pdf} disabled={busy}>{busy?(en?'Preparing…':'מכינים…'):(en?'Download PDF':'הורדת PDF')}</button></div><p role="status">{status}</p><div ref={wrapper} className="travel-preview"><div ref={root} lang={lang} dir={en?'ltr':'rtl'} style={{'--travel-zoom':zoom}}>{children}</div></div>{createPortal(<div id="buga-print-output" className="travel-print-output" lang={lang} dir={en?'ltr':'rtl'}>{children}</div>,document.body)}</>
}
