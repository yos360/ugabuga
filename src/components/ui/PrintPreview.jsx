import { Fragment, useEffect, useRef, useState } from 'react'
import { pickQrVariant, qrShortUrl } from '../../data/printMessages'
import { recordQrVariant } from '../../utils/qrVariants'
import { recordExperiment } from '../../utils/experiments'
import PrintAsk from './PrintAsk'
import OpenInBrowserHelp from './OpenInBrowserHelp'
import { createPortal } from 'react-dom'
import './print-preview.css'
import { recordSheetAction, recordPreviewOpen } from '../layout/RecentActivity'
import { sharePage, shareAudience, shareOnFacebook } from '../../utils/share'
import { recordCreation, sheetText, creatorTool } from '../../utils/creations'
import { announcePrint } from '../../utils/printEvents'
import { loadClassSize, saveClassSize, clampClassSize, countOptions, CLASS_MIN, CLASS_MAX } from '../../utils/classSize'

// A QR code is stamped onto every printed page with a short invitation next to it, linking back to
// the exact page it came from (tagged so the owner's report can see scans separately from
// other traffic). Generated once per open and injected into the real DOM nodes —
// the pages themselves are arbitrary children, so this avoids touching every
// individual worksheet component.
// The QR badge: Hebrew prints carry one of the rotating messages in printMessages.js (the same one on
// every page of this print); `utm_content` tells the owner report which message brought the scan.
function stampQrCodes(root, en = false, variant = null){
  if(!root)return
  const url=variant?qrShortUrl(location.origin,location.pathname,variant):`${location.origin}${location.pathname}?utm_source=qr&utm_medium=print`
  import('qrcode').then(({default:QRCode})=>QRCode.toString(url,{type:'svg',margin:0,color:{dark:'#181828',light:'#ffffff00'}}))
    .then(svg=>{
      root.querySelectorAll('.buga-a4, .buga-flow').forEach(page=>{
        if(page.querySelector('.buga-qr'))return
        const badge=document.createElement('div')
        badge.className='buga-qr'
        badge.innerHTML=en ? `${svg}<span class="buga-qr-text" dir="ltr"><b>Ugabuga — free learning activities</b><span>Scan for more · ugabuga.co.il/en</span></span>` : `${svg}<span class="buga-qr-text" dir="rtl"><b>${variant.title}</b><span>${variant.line}</span></span>`
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

// "How many pages": every print can be repeated. Pages that generate their sheets pass `variant(i)`,
// which returns a fresh, different set for copy i (new exercises); everywhere else the same sheets are
// repeated (a copy per child). Pages with their own page-count control pass copies={false}.
const COPY_COUNTS=[1,2,3,4,5,6,8,10,15,20,25,30,35]

export default function PrintPreview({title,children,onClose,onRefresh,variant,copies:allowCopies=true,lang='he',downloadPath}){
  const en=lang==='en'
  const dialog=useRef(null),root=useRef(null),pages=useRef(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[pdf,setPdf]=useState(''),[done,setDone]=useState(false)
  const [count,setCount]=useState(1),[extras,setExtras]=useState([])
  const [preparedPdf,setPreparedPdf]=useState(null),[needsBrowser,setNeedsBrowser]=useState(false)
  // "Print for the whole class": one tap sets the count to the class size (remembered on this device).
  // On generated pages every child gets a different set, so nobody can copy from the next desk.
  const [classOpen,setClassOpen]=useState(false),[classSize,setClassSize]=useState(loadClassSize)
  function forClass(){const n=clampClassSize(classSize);setClassSize(n);saveClassSize(n);changeCount(n);setClassOpen(false)}
  useEffect(()=>()=>{if(preparedPdf)URL.revokeObjectURL(preparedPdf.url)},[preparedPdf])
  const currentPdf=preparedPdf?.children===children && preparedPdf?.count===count && preparedPdf?.extras===extras ? preparedPdf : null
  // extra sets are made once, when the count goes up, so they don't change on every re-render
  function changeCount(n){setCount(n);if(variant)setExtras(list=>{const next=list.slice(0,n-1);for(let i=next.length+1;i<n;i++)next.push(variant(i));return next})}
  const sets=[children,...Array.from({length:count-1},(_,i)=>variant?extras[i]:children)]
  const body=sets.map((set,i)=><Fragment key={i}>{set}</Fragment>)
  useEffect(()=>{const previous=document.activeElement;dialog.current?.showModal();recordPreviewOpen();return()=>previous?.focus?.()},[])
  const [qr]=useState(()=>en?null:pickQrVariant())
  useEffect(()=>{stampQrCodes(dialog.current,en,qr);stampQrCodes(root.current,en,qr)},[children,count,extras,en,qr])
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
    // Sheets, not clicks: 30 selected coloring pages (or 3 copies of 10) are counted as 30.
    recordSheetAction('print',location.pathname,root.current?.querySelectorAll('.buga-a4, .buga-flow').length||null)
    if(qr)recordQrVariant(qr.id,'printed',location.pathname)
    recordExperiment('print')
    if(creatorTool(location.pathname)&&location.pathname!=='/invitation')recordCreation('print',sheetText(dialog.current||root.current))
    window.print()
    setDone(true)
    announcePrint('print',{title})
  }catch{setError(en?'The artwork is still loading. Please try again.':'האיור עדיין לא נטען. נסו שוב בעוד רגע.')}finally{setBusy(false)}}
  // A real PDF file made in the browser — works even where the phone's print dialog can't save.
  async function savePdf(){if(pdf)return;const sourcePath=downloadPath||location.pathname;setError('');setPdf(en?'Preparing PDF…':'מכינים PDF…');try{
    await document.fonts.ready
    const sheets=[...(pages.current?.children||[])].filter(el=>el.matches('.buga-a4, .buga-flow'))
    const {savePagesAsPdf}=await import('../../utils/pagesToPdf')
    const result=await savePagesAsPdf(sheets.length?sheets:[...(pages.current?.children||[])],title,(i,n)=>setPdf(en ? (n>1?`Preparing PDF… ${i}/${n}`:'Preparing PDF…') : (n>1?`מכינים PDF… ${i}/${n}`:'מכינים PDF…')))
    if(result==='cancelled')return
    if(result?.status==='needs-browser'){setNeedsBrowser(true);return}
    setNeedsBrowser(false)
    if(result?.status==='prepared')setPreparedPdf({...result,children,count,extras})
    recordSheetAction('download',sourcePath,sheets.length||null);if(qr)recordQrVariant(qr.id,'printed',sourcePath);recordExperiment('print');if(creatorTool(location.pathname)&&location.pathname!=='/invitation')recordCreation('pdf',sheetText(dialog.current||root.current))
    setDone(true)
    announcePrint('pdf',{title})
  }catch{setError(en?'We could not create the PDF. Try again, or use Print.':'לא הצלחנו ליצור PDF. נסו שוב, או השתמשו בכפתור ההדפסה.')}finally{setPdf('')}}
  // NOTE: both nodes must be direct children of <body> — print-preview.css hides
  // every body child except #buga-print-output, so no wrapper element here.
  return createPortal(<><dialog dir={en?'ltr':undefined} lang={en?'en':undefined} className="buga-print-dialog" ref={dialog} onCancel={onClose} aria-label={en?`Print preview: ${title}`:`תצוגה לפני הדפסה: ${title}`}><div className="buga-print-toolbar"><h2>{title}</h2><button onClick={onClose} aria-label={en?'Close print preview':'סגירת תצוגת ההדפסה'}>{en?'✕ Back':'✕ חזרה'}</button>{onRefresh&&<button onClick={()=>{recordSheetAction('refresh');onRefresh();if(variant&&count>1)setExtras(Array.from({length:count-1},(_,i)=>variant(i+1)))}} data-refresh-sheet>{en?'🎲 New activities':'🎲 תרגילים אחרים'}</button>}{allowCopies&&<label className="buga-print-count">📄 {en?(variant?'How many sets':'How many copies'):(variant?'כמה דפים':'כמה עותקים')}<select value={count} onChange={e=>changeCount(Number(e.target.value))} data-print-count>{countOptions(COPY_COUNTS,count).map(n=><option key={n} value={n}>{en?(n===1?(variant?'One set':'One copy'):variant?`${n} different sets`:`${n} copies`):(n===1?(variant?'סט אחד':'עותק אחד'):variant?`${n} סטים שונים`:`${n} עותקים`)}</option>)}</select></label>}{allowCopies&&!en&&<button onClick={()=>setClassOpen(o=>!o)} aria-expanded={classOpen} className="buga-class-btn" data-class-print>🏫 לכל הכיתה</button>}<button onClick={savePdf} disabled={!!pdf} data-save-pdf>{pdf||(en?'⬇️ Download PDF':'⬇️ הורדה כ-PDF')}</button><button onClick={print} disabled={busy}>{en?(busy?'Preparing…':'🖨️ Print'):(busy?'מכינים את הדף…':'🖨️ הדפסה')}</button></div>{done&&!en&&<div className="buga-print-share" dir="rtl"><span>{shareAudience(location.pathname).invite}</span><button onClick={()=>sharePage(location.pathname,'after_print')}>💬 {shareAudience(location.pathname).button}</button><button onClick={()=>shareOnFacebook(location.pathname,'after_print')}>📘 פייסבוק</button></div>}{done&&!en&&<PrintAsk path={location.pathname}/>}{classOpen&&<div className="buga-class-panel" dir="rtl"><label>כמה ילדים בכיתה? <input type="number" inputMode="numeric" min={CLASS_MIN} max={CLASS_MAX} value={classSize} onChange={e=>setClassSize(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')forClass()}}/></label><button onClick={forClass}>✓ הכינו {clampClassSize(classSize)} דפים</button><span>{variant?'🎲 כל ילד יקבל דף שונה — אי אפשר להעתיק מהשכן.':'📄 כל הדפים יודפסו פעם אחת לכל ילד.'} המספר נשמר במכשיר הזה.</span></div>}<p className="buga-print-tip">{en?'A4 portrait · One sheet per activity. Turn off browser headers and footers when printing.':'A4 לאורך · דף נפרד לכל פריט. בחלון ההדפסה מומלץ לבטל כותרות עליונות ותחתונות.'}</p>{error&&<p role="alert">{error}</p>}{needsBrowser&&<OpenInBrowserHelp en={en}/>}{currentPdf&&<p className="buga-print-tip" role="status">{en?'PDF ready. If the download did not start: ':'הקובץ מוכן. אם ההורדה לא התחילה: '}<button type="button" onClick={()=>{const a=document.createElement('a');a.href=currentPdf.url;a.download=currentPdf.name;document.body.appendChild(a);a.click();a.remove()}}>{en?'Download the prepared PDF':'הורדת הקובץ המוכן'}</button></p>}{count>1&&<p className="buga-print-tip">{en?(variant?`${count} different sets will print in order. Scroll to preview them all.`:`All sheets will print ${count} times.`):variant?`יודפסו ${count} סטים שונים, אחד אחרי השני — אפשר לגלול ולראות את כולם.`:`כל הדפים יודפסו ${count} פעמים.`}</p>}<div className="buga-preview-pages" ref={pages}>{body}</div></dialog><div dir={en?'ltr':undefined} lang={en?'en':undefined} id="buga-print-output" aria-hidden="true" ref={root}>{body}</div></>,document.body)
}
