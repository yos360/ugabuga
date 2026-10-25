import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { savePagesAsPdf } from '../utils/pagesToPdf'
import { recordActivity } from '../utils/liveActivity'
import '../components/ui/print-preview.css'
import { localKit } from './localKit'

export function Paper({title,children}) {return <article className="buga-a4 travel-paper"><h2>{title}</h2><div className="travel-paper-body">{children}</div><footer>נוסעים עם בוגה · ugabuga.co.il</footer></article>}
export default function TravelPrint({children,kit=false}) {
 const root=useRef(null),wrapper=useRef(null),[zoom,setZoom]=useState(.4),[busy,setBusy]=useState(false),[status,setStatus]=useState('')
 useEffect(()=>{const el=wrapper.current;const observer=new ResizeObserver(([e])=>setZoom(Math.min(1,e.contentRect.width/794)));observer.observe(el);return()=>observer.disconnect()},[])
 const pdf=async()=>{setBusy(true);setStatus('מכינים PDF במכשיר…');try{await savePagesAsPdf([...root.current.querySelectorAll('.travel-paper')],'נוסעים עם בוגה', (n,total)=>setStatus(`מכינים דף ${n} מתוך ${total}`), {onBlob:async blob=>{if(kit){try{await localKit('put',blob);setStatus('הערכה האחרונה נשמרה במכשיר ונמצאת גם בתיק הטיסה.')}catch(e){setStatus(e.message+' הקובץ עדיין יורד למכשיר.')}}}});recordActivity('download','worksheet');if(!kit)setStatus('ה־PDF מוכן.')}catch{setStatus('לא הצלחנו להכין PDF. אפשר להשתמש בכפתור ההדפסה ולבחור שמירה כ־PDF.')}finally{setBusy(false)}}
 return <><div className="travel-controls"><button onClick={()=>{recordActivity('print','worksheet');window.print()}}>הדפסת הדפים</button><button onClick={pdf} disabled={busy}>{busy?'מכינים…':'הורדת PDF'}</button></div><p role="status">{status}</p><div ref={wrapper} className="travel-preview"><div ref={root} style={{'--travel-zoom':zoom}}>{children}</div></div>{createPortal(<div id="buga-print-output" className="travel-print-output">{children}</div>,document.body)}</>
}
