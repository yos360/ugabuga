import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './print-preview.css'
import { recordPrintPreview, recordPreviewOpen } from '../layout/RecentActivity'

// A small QR code is stamped onto every printed page, linking back to the exact
// page it came from (tagged so the owner's report can see scans separately from
// other traffic). Generated once per open and injected into the real DOM nodes —
// the pages themselves are arbitrary children, so this avoids touching every
// individual worksheet component.
function stampQrCodes(root){
  if(!root)return
  root.querySelectorAll('.buga-a4, .buga-flow').forEach(page=>{
    if(page.querySelector('.buga-credit'))return
    const credit=document.createElement('div')
    credit.className='buga-credit'
    credit.textContent='נוצר באתר עוגה בוגה ללא עלות ובקלות · ugabuga.co.il'
    page.appendChild(credit)
  })
  const url=`${location.origin}${location.pathname}?utm_source=qr&utm_medium=print`
  import('qrcode').then(({default:QRCode})=>QRCode.toString(url,{type:'svg',margin:0,color:{dark:'#181828',light:'#ffffff00'}}))
    .then(svg=>{
      root.querySelectorAll('.buga-a4, .buga-flow').forEach(page=>{
        if(page.querySelector('.buga-qr'))return
        const badge=document.createElement('div')
        badge.className='buga-qr'
        badge.innerHTML=`${svg}<span class="buga-qr-label">סרקו לעוד<br/>ugabuga.co.il</span>`
        page.appendChild(badge)
      })
    }).catch(()=>{})
}

export default function PrintPreview({title,children,onClose}){
  const dialog=useRef(null),root=useRef(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
  useEffect(()=>{const previous=document.activeElement;dialog.current?.showModal();recordPreviewOpen();return()=>previous?.focus?.()},[])
  useEffect(()=>{stampQrCodes(dialog.current);stampQrCodes(root.current)},[children])
  async function print(){setBusy(true);setError('');try{
    await document.fonts.ready
    const imgs=[...document.querySelectorAll('#buga-print-output img')]
    await Promise.allSettled(imgs.map(img=>img.decode()))
    recordPrintPreview()
    window.print()
  }catch{setError('האיור עדיין לא נטען. נסו שוב בעוד רגע.')}finally{setBusy(false)}}
  // NOTE: both nodes must be direct children of <body> — print-preview.css hides
  // every body child except #buga-print-output, so no wrapper element here.
  return createPortal(<><dialog className="buga-print-dialog" ref={dialog} onCancel={onClose} aria-label={`תצוגה לפני הדפסה: ${title}`}><div className="buga-print-toolbar"><h2>{title}</h2><button onClick={onClose} aria-label="סגירת תצוגת ההדפסה">✕ חזרה</button><button onClick={print} disabled={busy}>{busy?'מכינים את הדף…':'🖨️ הדפסה / PDF'}</button></div><p className="buga-print-tip">A4 לאורך · דף נפרד לכל פריט. בחלון ההדפסה מומלץ לבטל כותרות עליונות ותחתונות.</p>{error&&<p role="alert">{error}</p>}<div className="buga-preview-pages">{children}</div></dialog><div id="buga-print-output" aria-hidden="true" ref={root}>{children}</div></>,document.body)
}
