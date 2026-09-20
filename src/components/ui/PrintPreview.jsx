import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './print-preview.css'
import { recordPrintPreview } from '../layout/RecentActivity'

export default function PrintPreview({title,children,onClose}){
  const dialog=useRef(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
  useEffect(()=>{const previous=document.activeElement;dialog.current?.showModal();return()=>previous?.focus?.()},[])
  async function print(){setBusy(true);setError('');try{
    await document.fonts.ready
    const imgs=[...document.querySelectorAll('#buga-print-output img')]
    await Promise.all(imgs.map(img=>img.decode()))
    window.print()
    recordPrintPreview()
  }catch{setError('האיור עדיין לא נטען. נסו שוב בעוד רגע.')}finally{setBusy(false)}}
  return createPortal(<><dialog className="buga-print-dialog" ref={dialog} onCancel={onClose} aria-label={`תצוגה לפני הדפסה: ${title}`}><div className="buga-print-toolbar"><h2>{title}</h2><button onClick={onClose} aria-label="סגירת תצוגת ההדפסה">✕ חזרה</button><button onClick={print} disabled={busy}>{busy?'מכינים את הדף…':'🖨️ הדפסה / PDF'}</button></div><p className="buga-print-tip">A4 לאורך · דף נפרד לכל פריט. בחלון ההדפסה מומלץ לבטל כותרות עליונות ותחתונות.</p>{error&&<p role="alert">{error}</p>}<div className="buga-preview-pages">{children}</div></dialog><div id="buga-print-output" aria-hidden="true">{children}</div></>,document.body)
}
