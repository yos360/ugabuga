import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './print-preview.css'
import { recordSheetAction, recordPreviewOpen } from '../layout/RecentActivity'
import { sharePage, shareAudience } from '../../utils/share'

// A QR code is stamped onto every printed page with a short invitation next to it, linking back to
// the exact page it came from (tagged so the owner's report can see scans separately from
// other traffic). Generated once per open and injected into the real DOM nodes —
// the pages themselves are arbitrary children, so this avoids touching every
// individual worksheet component.
function stampQrCodes(root){
  if(!root)return
  const url=`${location.origin}${location.pathname}?utm_source=qr&utm_medium=print`
  import('qrcode').then(({default:QRCode})=>QRCode.toString(url,{type:'svg',margin:0,color:{dark:'#181828',light:'#ffffff00'}}))
    .then(svg=>{
      root.querySelectorAll('.buga-a4, .buga-flow').forEach(page=>{
        if(page.querySelector('.buga-qr'))return
        const badge=document.createElement('div')
        badge.className='buga-qr'
        badge.innerHTML=`${svg}<span class="buga-qr-text" dir="rtl"><b>סרקו לעוד דפי עבודה, צביעה ומשחקים — בחינם</b><span>ugabuga.co.il</span></span>`
        page.appendChild(badge)
      })
    }).catch(()=>{})
}

// Narrow screens (phones): sheets are laid out at this width and zoomed down to fit the dialog,
// so the preview looks like the printed page instead of a squeezed, cropped version of it.
const PREVIEW_PAGE_WIDTH=720
function fitPreview(pages){
  if(!pages)return
  const cs=getComputedStyle(pages)
  const w=pages.clientWidth-parseFloat(cs.paddingLeft||0)-parseFloat(cs.paddingRight||0)
  const scaled=w>0&&w<PREVIEW_PAGE_WIDTH
  pages.classList.toggle('is-scaled',scaled)
  if(scaled){pages.style.setProperty('--buga-zoom',String(w/PREVIEW_PAGE_WIDTH));pages.style.setProperty('--buga-page-w',PREVIEW_PAGE_WIDTH+'px')}
  else{pages.style.removeProperty('--buga-zoom');pages.style.removeProperty('--buga-page-w')}
}

export default function PrintPreview({title,children,onClose,onRefresh}){
  const dialog=useRef(null),root=useRef(null),pages=useRef(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[pdf,setPdf]=useState(''),[done,setDone]=useState(false)
  useEffect(()=>{const previous=document.activeElement;dialog.current?.showModal();recordPreviewOpen();return()=>previous?.focus?.()},[])
  useEffect(()=>{stampQrCodes(dialog.current);stampQrCodes(root.current)},[children])
  useEffect(()=>{
    const el=pages.current;if(!el)return
    fitPreview(el)
    if(typeof ResizeObserver==='undefined'){const on=()=>fitPreview(el);window.addEventListener('resize',on);return()=>window.removeEventListener('resize',on)}
    const ro=new ResizeObserver(()=>fitPreview(el));ro.observe(el);return()=>ro.disconnect()
  },[])
  async function print(){setBusy(true);setError('');try{
    await document.fonts.ready
    const imgs=[...document.querySelectorAll('#buga-print-output img')]
    // SVG <image> artwork too (photo props): make sure it's loaded before the print dialog snapshots the page.
    const svgImages=[...document.querySelectorAll('#buga-print-output image')].map(el=>{const i=new Image();i.src=el.getAttribute('href');return i})
    await Promise.allSettled([...imgs,...svgImages].map(img=>img.decode()))
    recordSheetAction('print')
    window.print()
    setDone(true)
  }catch{setError('האיור עדיין לא נטען. נסו שוב בעוד רגע.')}finally{setBusy(false)}}
  // A real PDF file made in the browser — works even where the phone's print dialog can't save.
  async function savePdf(){if(pdf)return;setError('');setPdf('מכינים PDF…');try{
    await document.fonts.ready
    const sheets=[...(pages.current?.children||[])].filter(el=>el.matches('.buga-a4, .buga-flow'))
    const {savePagesAsPdf}=await import('../../utils/pagesToPdf')
    await savePagesAsPdf(sheets.length?sheets:[...(pages.current?.children||[])],title,(i,n)=>setPdf(n>1?`מכינים PDF… ${i}/${n}`:'מכינים PDF…'))
    recordSheetAction('download')
    setDone(true)
  }catch{setError('לא הצלחנו ליצור PDF. נסו שוב, או השתמשו בכפתור ההדפסה.')}finally{setPdf('')}}
  // NOTE: both nodes must be direct children of <body> — print-preview.css hides
  // every body child except #buga-print-output, so no wrapper element here.
  return createPortal(<><dialog className="buga-print-dialog" ref={dialog} onCancel={onClose} aria-label={`תצוגה לפני הדפסה: ${title}`}><div className="buga-print-toolbar"><h2>{title}</h2><button onClick={onClose} aria-label="סגירת תצוגת ההדפסה">✕ חזרה</button>{onRefresh&&<button onClick={()=>{recordSheetAction('refresh');onRefresh()}} data-refresh-sheet>🎲 תרגילים אחרים</button>}<button onClick={savePdf} disabled={!!pdf} data-save-pdf>{pdf||'⬇️ הורדה כ-PDF'}</button><button onClick={print} disabled={busy}>{busy?'מכינים את הדף…':'🖨️ הדפסה'}</button></div>{done&&<div className="buga-print-share" dir="rtl"><span>{shareAudience(location.pathname).invite}</span><button onClick={()=>sharePage(location.pathname,'after_print')}>💬 {shareAudience(location.pathname).button}</button></div>}<p className="buga-print-tip">A4 לאורך · דף נפרד לכל פריט. בחלון ההדפסה מומלץ לבטל כותרות עליונות ותחתונות.</p>{error&&<p role="alert">{error}</p>}<div className="buga-preview-pages" ref={pages}>{children}</div></dialog><div id="buga-print-output" aria-hidden="true" ref={root}>{children}</div></>,document.body)
}
