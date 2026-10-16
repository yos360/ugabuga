import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PrintPreview from '../ui/PrintPreview'
import { formatDate } from '../../utils/groupTools'
import { recordCreation } from '../../utils/creations'
import { INVITATION_THEMES, INVITATION_FIELDS, invitationText, loadInviteImage, readInvitePhoto, renderInvitation } from '../../utils/invitationDesign'
import './invitation-studio.css'

const EMPTY = {name:'',age:'',date:'',time:'',place:'',phone:'',notes:''}
export default function InvitationStudio() {
 const [theme,setTheme]=useState(INVITATION_THEMES[0]),[data,setData]=useState(EMPTY),[format,setFormat]=useState('portrait')
 const [photo,setPhoto]=useState(null),[crop,setCrop]=useState({zoom:1,x:50,y:50}),[loadingPhoto,setLoadingPhoto]=useState(false)
 const [output,setOutput]=useState(null),[busy,setBusy]=useState(false),[printing,setPrinting]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
 const canvas=useRef(null),upload=useRef(0),[params]=useSearchParams()
 const [rsvp,setRsvp]=useState(()=>/^[a-z2-9]{6,12}$/.test(params.get('rsvp')||'')?params.get('rsvp'):'')
 const [attach,setAttach]=useState(true),[paste,setPaste]=useState('')
 const rsvpLink=rsvp&&attach?`https://ugabuga.co.il/r/${rsvp}`:''
 const update=(k,v)=>{setOutput(null);setData(d=>({...d,[k]:v}))}
 useEffect(()=>{if(!rsvp)return;let live=true;import('../../utils/groupDb').then(m=>m.rsvpDb.get(rsvp)).then(ev=>{if(live)setData(d=>({...d,name:d.name||(/של\s+(.+)$/.exec(ev.title||'')?.[1]||'').replace(/_+/g,'').trim().slice(0,32),date:d.date||formatDate(ev.date),time:d.time||ev.time||'',place:d.place||ev.place||''}))}).catch(()=>{});return()=>{live=false}},[rsvp])
 useEffect(()=>{
  let live=true;setOutput(null);setError('')
  const timer=setTimeout(async()=>{
   try {
    const [art]=await Promise.all([loadInviteImage(`/images/invitation-theme-${theme.id}.webp`),document.fonts.ready])
    if(!live||!canvas.current)return
    renderInvitation(canvas.current,{theme,data,format,photo,art,crop,rsvp:rsvpLink})
    canvas.current.toBlob(blob=>{if(live&&blob)setOutput({blob,url:canvas.current.toDataURL('image/png')})},'image/png')
   } catch(e){if(live)setError(e.message||'לא הצלחנו להכין את התמונה. נסו שוב.')}
  },120)
  return()=>{live=false;clearTimeout(timer)}
 },[theme,data,format,photo,crop,rsvpLink])
 useEffect(()=>()=>{upload.current++},[])
 async function addPhoto(e) {
  const file=e.target.files?.[0];e.target.value='';if(!file)return
  const id=++upload.current;setLoadingPhoto(true);setError('');setMessage('')
  try{const image=await readInvitePhoto(file);if(id===upload.current){setOutput(null);setPhoto(image);setCrop({zoom:1,x:50,y:50})}}catch(e){if(id===upload.current)setError(e.message)}finally{if(id===upload.current)setLoadingPhoto(false)}
 }
 const record=action=>data.name&&recordCreation(action,[`עיצוב: ${theme.name}`,`שם: ${data.name}`,data.age&&`גיל: ${data.age}`,data.date&&`תאריך: ${data.date}`,data.time&&`שעה: ${data.time}`,data.notes&&`הערות: ${data.notes}`].filter(Boolean).join('\n'))
 const filename=`ugabuga-invitation-${theme.id}.png`
 function download() {if(!output)return;const url=URL.createObjectURL(output.blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);record('download');setMessage('התמונה נשמרה. פתחו וואטסאפ וצרפו אותה מהתמונות או מהקבצים.')}
 async function shareImage() {
  if(!output)return
  const file=new File([output.blob],filename,{type:'image/png'})
  if(!navigator.share||!navigator.canShare?.({files:[file]})){download();return}
  setBusy(true);setMessage('');setError('')
  try{await navigator.share({files:[file],title:'הזמנה ליום הולדת',text:invitationText(data,rsvpLink)});record('share');setMessage('ההזמנה הועברה לתפריט השיתוף. בחרו וואטסאפ ואת הנמענים הרצויים.')}catch(e){if(e.name!=='AbortError')setError('השיתוף לא נפתח. אפשר לשמור את התמונה ולצרף אותה לוואטסאפ.')}finally{setBusy(false)}
 }
 const shareText=()=>{record('share');window.open(`https://wa.me/?text=${encodeURIComponent(invitationText(data,rsvpLink))}`,'_blank','noopener,noreferrer')}
 const createHref=`/rsvp?${new URLSearchParams({title:`יום ההולדת של ${data.name||'___'}`,time:data.time,place:data.place})}`
 return <section className="inv-studio" aria-label="עיצוב הזמנה ליום הולדת">
  <div className="inv-section-title"><span>01</span><div><h2>איזו מסיבה מתכננים?</h2><p>בחרו עיצוב — הפרטים והתמונה נשארים כשמחליפים סגנון.</p></div></div>
  <div className="inv-themes">{INVITATION_THEMES.map(t=><button type="button" key={t.id} aria-pressed={theme.id===t.id} onClick={()=>{if(theme.id!==t.id){setOutput(null);setTheme(t)}}} style={{'--theme':t.bg,'--ink':t.ink,'--accent':t.accent}}><div className={`inv-theme-art inv-thumb-${t.id}`}><img src={`/images/invitation-theme-${t.id}.webp`} alt="" width="100" height="100"/><span aria-hidden="true">{theme.id===t.id?'✓':t.emoji}</span></div><strong>{t.name}</strong><small>{t.tag}</small></button>)}</div>
  <div className="inv-workspace">
   <div className="inv-controls">
    <div className="inv-section-title"><span>02</span><div><h2>הפרטים שהופכים אותה לשלכם</h2><p>ממלאים כאן, והתצוגה מתעדכנת מיד.</p></div></div>
    <div className="inv-fields">{INVITATION_FIELDS.map(([k,label,type,placeholder,max])=><label key={k} className={k==='place'?'inv-wide':''}>{label}<input type={type} value={data[k]} placeholder={placeholder} maxLength={max} dir={k==='time'||k==='phone'?'ltr':'auto'} inputMode={k==='age'?'numeric':undefined} onChange={e=>update(k,e.target.value)} /></label>)}<label className="inv-wide">משהו נוסף לאורחים<textarea value={data.notes} maxLength={110} rows={2} placeholder="מה להביא, בקשה לעדכן על אלרגיות, או פשוט: מחכים לכם!" onChange={e=>update('notes',e.target.value)} /></label></div>
    <div className="inv-photo-box"><h3>תמונה אישית? בשמחה</h3><p>אפשר גם בלי — האיור של העיצוב יופיע במקומה.</p><label className="inv-upload">{loadingPhoto?'פותחים תמונה…':photo?'החלפת תמונה':'＋ הוספת תמונה'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={addPhoto} disabled={loadingPhoto} /></label><small>JPG, PNG או WebP · עד 15MB. התמונה מעובדת בדפדפן ואינה עולה לשרת.</small>
    {photo&&<><div className="inv-crop">{[['zoom','הגדלת התמונה',1,2.5,.05],['x','מיקום אופקי',0,100,1],['y','מיקום אנכי',0,100,1]].map(([key,label,min,max,step])=><label key={key}>{label}<input type="range" min={min} max={max} step={step} value={crop[key]} onChange={e=>{setOutput(null);setCrop({...crop,[key]:Number(e.target.value)})}} /></label>)}</div><div className="inv-photo-actions"><button onClick={()=>{setOutput(null);setCrop({zoom:1,x:50,y:50})}}>מרכוז מחדש</button><button onClick={()=>{upload.current++;setOutput(null);setPhoto(null)}}>הסרת התמונה</button></div></>}
    </div>
    <details className="inv-rsvp"><summary>הוספת קישור לאישור הגעה</summary><p>קישור שכבר יצרתם ממשיך לעבוד. הוספתו לעיצוב לא משנה את האירוע או את התשובות.</p>
    {rsvp?<><label><input type="checkbox" checked={attach} onChange={e=>{setOutput(null);setAttach(e.target.checked)}} />לצרף את קישור אישור ההגעה</label><a href={`https://ugabuga.co.il/r/${rsvp}`} target="_blank" rel="noreferrer">פתיחת האירוע הקיים</a></>:<><Link to={createHref} target="_blank" rel="noopener">יצירת אירוע לאישור הגעה בחלון חדש ↗</Link><p>אחרי היצירה, העתיקו לכאן את קישור האורחים. ההזמנה שלכם תישאר בחלון הזה.</p></>}
    <label>קישור האורחים לאישור הגעה<input type="url" value={paste} dir="ltr" placeholder="https://ugabuga.co.il/r/…" onChange={e=>{setPaste(e.target.value);try{const u=new URL(e.target.value),m=/^\/r\/([a-z2-9]{6,12})\/?$/.exec(u.pathname);if(['ugabuga.co.il','www.ugabuga.co.il'].includes(u.hostname)&&m){setOutput(null);setRsvp(m[1]);setAttach(true);setPaste('')}}catch{/* wait for complete URL */}}} /></label><small>קישור בתמונה אינו לחיץ. הוא מצורף גם להודעת הטקסט לשיתוף.</small></details>
   </div>
   <div className="inv-preview-column"><div className="inv-preview-top"><h2>ההזמנה שלכם</h2><span>תצוגה חיה</span></div><div className="inv-formats" role="group" aria-label="צורת ההזמנה"><button aria-pressed={format==='portrait'} onClick={()=>{if(format!=='portrait'){setOutput(null);setFormat('portrait')}}}>הודעה בוואטסאפ · 4:5</button><button aria-pressed={format==='story'} onClick={()=>{if(format!=='story'){setOutput(null);setFormat('story')}}}>סטטוס / סטורי · 9:16</button></div>
    <div className="inv-canvas-wrap"><canvas ref={canvas} aria-label={`תצוגת הזמנה בעיצוב ${theme.name}. ${invitationText(data,rsvpLink)}`} role="img" style={{aspectRatio:format==='story'?'9 / 16':'4 / 5'}} /></div>
    <p className="inv-export-size">תמונה חדה בגודל {format==='story'?'1080 × 1920':'1080 × 1350'} פיקסלים</p>
    <div className="inv-export-actions"><button className="inv-primary" onClick={shareImage} disabled={!output||busy||loadingPhoto}>{busy?'פותחים שיתוף…':'שיתוף ההזמנה כתמונה'}</button><button onClick={download} disabled={!output||loadingPhoto}>שמירת תמונה לוואטסאפ</button><button onClick={shareText}>שליחת הפרטים כטקסט בוואטסאפ</button><button data-print-main onClick={()=>{record('print');setPrinting(true)}} disabled={!output||loadingPhoto}>הדפסה / שמירה כ־PDF</button></div>
    <p className="inv-hint">בטלפון תומך ייפתח תפריט השיתוף — בחרו וואטסאפ. במכשירים אחרים התמונה תישמר לצירוף ידני. אם הקישור לא צורף לתמונה, שלחו גם את הפרטים כטקסט.</p>
    <p className="inv-status" role="status">{message}</p>{error&&<p className="inv-error" role="alert">{error}</p>}
   </div>
  </div>
  {printing&&output&&<PrintPreview title="הזמנה מעוצבת ליום הולדת" onClose={()=>setPrinting(false)} copies={false}><article className="buga-a4 inv-print-page"><img src={output.url} alt={invitationText(data,rsvpLink)} style={{display:'block',maxWidth:'100%',maxHeight:'240mm',margin:'0 auto'}} />{rsvpLink&&<p style={{textAlign:'center',fontSize:14}}>אישור הגעה: <a href={rsvpLink}>{rsvpLink}</a></p>}</article></PrintPreview>}
 </section>
}
