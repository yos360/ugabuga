import {useEffect,useRef,useState} from 'react'
import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import {SPACE_TYPES,SPACE_ERRORS,normalizeSpace,makeTimeSlots,itemLabel,bestMeeting,spaceCsv,calendarEvent} from '../../../utils/sharedSpaces'
import {spaceRequest,readLocal,writeLocal,secureToken,ownerToken,compressedPhoto,saveFile} from '../../../utils/sharedSpaceApi'
import './shared-spaces.css'

const dateAfter=(days=1)=>{const d=new Date();d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
const fresh=(kind)=>({title:'',note:'',place:'',items:kind==='parents'?makeTimeSlots(dateAfter(),'17:00','19:00',10):kind==='album'?[]:[{date:dateAfter(),time:'17:00',label:kind==='help'?'ארוחת ערב':'',capacity:1},{date:dateAfter(2),time:'17:00',label:kind==='help'?'קניות':'',capacity:1}]})
const errorText=e=>SPACE_ERRORS[e.message]||SPACE_ERRORS.network
const invitationUrl=code=>`${location.origin}/t/${code}`
const ownerUrl=(code,token)=>`${invitationUrl(code)}#manage=${token}`
const Field=({label,children})=><label className="sg-field"><span>{label}</span>{children}</label>

function ToolLinks(){return <nav className="sg-other" aria-label="עוד כלים משותפים">{Object.entries(SPACE_TYPES).map(([key,t])=><Link to={t.path} key={key}>{t.icon} {t.title}</Link>)}<Link to="/rsvp">✅ אישורי הגעה</Link></nav>}
function Hero({kind}){const t=SPACE_TYPES[kind];return <header className="sg-hero" style={{'--sg-tint':t.color}}><span className="sg-eyebrow">עוגה בוגה · דברים שטוב לעשות ביחד</span><span className="sg-hero-icon" aria-hidden="true">{t.icon}</span><h1>{t.title}</h1><p>{t.subtitle}</p><ol className="sg-steps"><li><b>1</b> יוצרים</li><li><b>2</b> שולחים קישור</li><li><b>3</b> משתתפים יחד</li></ol></header>}

function ShareBox({space,owner}){
 const [qr,setQr]=useState(''),[message,setMessage]=useState(''),[showManage,setShowManage]=useState(false)
 const url=invitationUrl(space.code),text=`${space.config.title}\n${SPACE_TYPES[space.kind].subtitle}\n${url}\nנוצר בעוגה בוגה 🎂`
 useEffect(()=>{let live=true;import('qrcode').then(({default:q})=>q.toDataURL(url,{width:240,margin:2})).then(v=>{if(live)setQr(v)}).catch(()=>{});return()=>{live=false}},[url])
 const copy=async value=>{try{await navigator.clipboard.writeText(value);setMessage('הקישור הועתק')}catch{setMessage('סמנו והעתיקו את הקישור מהשדה')}}
 return <section className="sg-card sg-share"><div><h2>שלחו לקבוצה, וכולם מצטרפים</h2><p>כל מי שמקבל את הקישור יכול לפתוח את הדף. שתפו רק עם המשתתפים.</p><div className="sg-actions"><a className="sg-button sg-green" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">שיתוף בוואטסאפ</a><button onClick={()=>copy(url)}>העתקת קישור</button></div><input aria-label="קישור למשתתפים" readOnly value={url} dir="ltr" onFocus={e=>e.target.select()}/><p role="status">{message}</p>{owner&&<><button className="sg-link" onClick={()=>setShowManage(!showManage)}>🔑 שמירת קישור הניהול שלי</button>{showManage&&<div className="sg-private"><p>הקישור הזה נותן שליטה בדף. שמרו לעצמכם ואל תשלחו לקבוצה.</p><input aria-label="קישור ניהול פרטי" readOnly dir="ltr" value={ownerUrl(space.code,owner)} onFocus={e=>e.target.select()}/><button onClick={()=>copy(ownerUrl(space.code,owner))}>העתקת קישור הניהול</button></div>}</>}</div>{qr&&<div className="sg-qr"><img src={qr} alt="קוד QR לפתיחת הדף המשותף" width="160" height="160"/><a download="ugabuga-invite-qr.png" href={qr}>הורדת קוד QR</a></div>}</section>
}

function CreateSpace({kind}){
 const t=SPACE_TYPES[kind],navigate=useNavigate()
 const [form,setForm]=useState(()=>readLocal(`draft:${kind}`,fresh(kind)))
 const [ready,setReady]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const [schedule,setSchedule]=useState({date:dateAfter(),start:'17:00',end:'19:00',minutes:10})
 useEffect(()=>{let live=true;spaceRequest('health').then(d=>{if(live)setReady(d.ready)}).catch(()=>{if(live)setReady(false)});return()=>{live=false}},[])
 useEffect(()=>{writeLocal(`draft:${kind}`,form)},[form,kind])
 const set=(key,value)=>setForm(f=>({...f,[key]:value}))
 const setItem=(i,key,value)=>setForm(f=>({...f,items:f.items.map((x,n)=>i===n?{...x,[key]:value}:x)}))
 const submit=async e=>{
   e.preventDefault();setError('');let config
   try{config=normalizeSpace(kind,form)}catch(e){setError(errorText(e));return}
   const token=secureToken();setBusy(true)
   try{const {code}=await spaceRequest('create','',token,{kind,config});writeLocal(`owner:${code}`,token);writeLocal(`draft:${kind}`,fresh(kind));writeLocal('owned',[{code,title:config.title,kind},...readLocal('owned',[])].slice(0,30));navigate(`/t/${code}`)}catch(e){setError(errorText(e))}finally{setBusy(false)}
 }
 const owned=readLocal('owned',[]).filter(x=>x.kind===kind)
 return <div className="sg-page"><SEO path={t.path} title={`${t.title} — קישור משותף בחינם`} description={t.subtitle}/><Hero kind={kind}/>
   <div className="sg-create-layout"><form className="sg-card" onSubmit={submit}><h2>פותחים {kind==='album'?'אלבום':'דף'} משלכם</h2>
   <Field label="איך קוראים לזה?"><input required maxLength={100} value={form.title} onChange={e=>set('title',e.target.value)} placeholder={t.example}/></Field>
   {kind!=='album'&&<Field label="איפה? (לא חובה)"><input maxLength={140} value={form.place} onChange={e=>set('place',e.target.value)} placeholder="למשל: בית הספר, חדר 3"/></Field>}
   <Field label={kind==='help'?'מה חשוב לדעת? בלי מידע רפואי או כתובת פרטית':'משהו שחשוב למשתתפים לדעת? (לא חובה)'}><textarea rows={3} maxLength={600} value={form.note} onChange={e=>set('note',e.target.value)} placeholder={kind==='album'?'למשל: העלו את הרגעים המצחיקים מהמסיבה':'הנחיה קצרה למשתתפים'}/></Field>
   {kind==='parents'&&<fieldset className="sg-slot-generator"><legend>יצירת שעות אוטומטית</legend><div className="sg-form-row"><Field label="יום"><input type="date" value={schedule.date} onChange={e=>setSchedule({...schedule,date:e.target.value})}/></Field><Field label="משעה"><input type="time" value={schedule.start} onChange={e=>setSchedule({...schedule,start:e.target.value})}/></Field><Field label="עד שעה"><input type="time" value={schedule.end} onChange={e=>setSchedule({...schedule,end:e.target.value})}/></Field><Field label="דקות לפגישה"><select value={schedule.minutes} onChange={e=>setSchedule({...schedule,minutes:Number(e.target.value)})}>{[5,10,15,20,30].map(n=><option key={n}>{n}</option>)}</select></Field></div><button type="button" onClick={()=>{const items=makeTimeSlots(schedule.date,schedule.start,schedule.end,schedule.minutes);if(items.length){set('items',items);setError('')}else setError('בחרו טווח שעות תקין.')}}>עדכון השעות ברשימה</button><p>אפשר למחוק שעה מהרשימה כדי להשאיר הפסקה.</p></fieldset>}
   {kind!=='album'&&<fieldset className="sg-items"><legend>{kind==='meet'?'אילו מועדים נציע?':kind==='parents'?'השעות הפנויות':'מה צריך ומתי?'}</legend>{form.items.map((item,i)=><div className="sg-item-editor" key={i}><span className="sg-item-index">{i+1}</span><Field label="תאריך"><input required type="date" value={item.date} onChange={e=>setItem(i,'date',e.target.value)}/></Field><Field label="שעה"><input type="time" value={item.time} onChange={e=>setItem(i,'time',e.target.value)}/></Field>{kind==='help'&&<><Field label="משימה"><input required maxLength={100} value={item.label} onChange={e=>setItem(i,'label',e.target.value)}/></Field><Field label="כמה מתנדבים?"><input type="number" min={1} max={10} value={item.capacity} onChange={e=>setItem(i,'capacity',e.target.value)}/></Field></>}<button type="button" className="sg-remove" aria-label={`הסרת ${t.item} ${i+1}`} onClick={()=>set('items',form.items.filter((_,n)=>n!==i))}>✕</button></div>)}<button type="button" disabled={form.items.length>=80} onClick={()=>set('items',[...form.items,{date:dateAfter(),time:'',label:'',capacity:1}])}>＋ הוספת {t.item}</button></fieldset>}
   {kind==='album'&&<div className="sg-note"><b>תמונות בלבד · עד 100 תמונות · זמין ל־30 יום</b><p>התמונות יכווצו לפני ההעלאה. שמרו את המקור אצלכם. העלו רק תמונות שיש לכם רשות לשתף.</p></div>}
   <p className="sg-small">ללא הרשמה. הדף זמין לכל מי שמחזיק בקישור. {kind==='parents'?'שמות הנרשמים גלויים רק למארגן ולנרשם עצמו.':kind!=='album'?'כתבו שמות פרטיים בלבד.':''} {kind!=='album'&&'הדף זמין ל־90 יום.'}</p>
   {error&&<p className="sg-error" role="alert">{error}</p>}
   {ready===false&&<p className="sg-note" role="status">הכלי עדיין בהכנה. אפשר לראות איך הוא עובד בהדגמה — הפרטים שמילאתם נשמרים במכשיר הזה.</p>}
   <button className="sg-primary" disabled={busy||ready!==true}>{busy?'יוצרים את הקישור…':ready===null?'בודקים זמינות…':t.action}</button>
   </form><aside><section className="sg-card sg-how"><h2>כך זה עובד</h2><p>{kind==='meet'?'כל משתתף מסמן מתאים, אולי או לא מתאים. אתם רואים את התוצאות ובוחרים את המועד הסופי.':kind==='parents'?'כל הורה תופס שעה אחת. אפשר להחליף שעה בלי לאבד את הישנה אם השעה החדשה כבר נתפסה.':kind==='help'?'כל חבר בוחר יום ומשימה. אפשר לעזור בכמה ימים, ולבטל אם התוכניות משתנות.':'האורחים מעלים תמונות מהטלפון. המארגן יכול להסיר תמונות ולסגור העלאות.'}</p><Link className="sg-button" to={`${t.path}?demo=1`}>👀 התנסות בהדגמה</Link><p className="sg-small">הדגמה בלבד — שום דבר לא נשלח או נשמר בשרת.</p></section>{owned.length>0&&<section className="sg-card"><h2>הדפים שפתחתם במכשיר הזה</h2>{owned.map(x=><Link className="sg-owned" key={x.code} to={`/t/${x.code}`}>{x.title} ←</Link>)}</section>}</aside></div><ToolLinks/></div>
}

function sampleSpace(kind){const config=normalizeSpace(kind,{...fresh(kind),title:SPACE_TYPES[kind].example,note:kind==='help'?'כל עזרה קטנה עושה הבדל. תודה שאתם כאן!':'דוגמה שאפשר לשחק איתה — בלי לשלוח לאף אחד.'});const first=config.items[0]?.id;return {code:'demo',kind,config,owner:true,closed:false,selected:null,expires_at:new Date(Date.now()+30*86400000).toISOString(),entries:kind==='meet'?[{id:'d1',item_id:first,value:'yes',name:'דנה',mine:false},{id:'d2',item_id:first,value:'maybe',name:'יואב',mine:false}]:kind==='album'?[]:[{id:'d1',item_id:first,value:'booked',name:kind==='parents'?null:'דנה',mine:false}],photos:[]}}

function Poll({space,run,busy,name}){
 const mine=space.entries.filter(x=>x.mine),[votes,setVotes]=useState(()=>Object.fromEntries(mine.map(x=>[x.item_id,x.value])))
 const ranked=bestMeeting(space.config.items,space.entries),best=ranked[0]
 return <section className="sg-card"><h2>מה מתאים לכם?</h2><p>סמנו תשובה לכל מועד. אפשר לשנות מאותו מכשיר.</p><div className="sg-choice-list">{space.config.items.map(item=><fieldset className="sg-vote" key={item.id}><legend>{itemLabel(item)}</legend><div className="sg-vote-options">{[['yes','😊 מתאים'],['maybe','🤔 אולי'],['no','🙅 לא מתאים']].map(([v,label])=><button key={v} disabled={busy||space.closed} aria-pressed={votes[item.id]===v} onClick={()=>setVotes({...votes,[item.id]:v})}>{label}</button>)}</div><span className="sg-small">{space.entries.filter(x=>x.item_id===item.id&&x.value==='yes').length} סימנו מתאים</span></fieldset>)}</div><button className="sg-primary" disabled={busy||space.closed||!name.trim()||space.config.items.some(x=>!votes[x.id])} onClick={()=>run('vote',{name,votes})}>שמירת התשובות שלי</button>{mine.length>0&&<button disabled={busy} className="sg-link" onClick={()=>run('withdraw')}>מחיקת התשובות שלי</button>}
   {best?.yes>0&&<div className="sg-result"><b>⭐ הכי הרבה ״מתאים״: {itemLabel(best)}</b><p>{best.yes} סימנו מתאים · {best.maybe} אולי{ranked.filter(x=>x.yes===best.yes&&x.maybe===best.maybe).length>1?' · יש מועדים עם אותו מספר תשובות':''}</p></div>}
   <details className="sg-details"><summary>כל התשובות</summary><div className="sg-table-wrap"><table><thead><tr><th>שם</th>{space.config.items.map(i=><th key={i.id}>{itemLabel(i)}</th>)}</tr></thead><tbody>{Array.from(new Set(space.entries.map(e=>e.name))).map(n=><tr key={n}><th>{n}</th>{space.config.items.map(i=><td key={i.id}>{space.entries.filter(e=>e.name===n&&e.item_id===i.id).map(e=>({yes:'✓',maybe:'אולי',no:'—'})[e.value]).join(' / ')||'—'}</td>)}</tr>)}</tbody></table></div></details>
   {space.owner&&<div className="sg-host-select"><h3>קובעים מועד סופי</h3><p>הבחירה תסגור את ההצבעה ותופיע לכולם.</p>{space.config.items.map(i=><button disabled={busy} key={i.id} onClick={()=>run('update',{selected:i.id})}>בחירה: {itemLabel(i)}</button>)}</div>}
 </section>
}

function Bookings({space,run,busy,name}){return <section className="sg-card"><h2>{space.kind==='parents'?'בחרו שעה פנויה':'איפה תוכלו לעזור?'}</h2>{space.kind==='parents'&&<p>אפשר לתפוס שעה אחת מהמכשיר הזה. בחירה חדשה מחליפה את ההרשמה הקודמת.</p>}<div className="sg-bookings">{space.config.items.map(item=>{const entries=space.entries.filter(x=>x.item_id===item.id),mine=entries.find(x=>x.mine),full=entries.length>=item.capacity;return <article className={`sg-booking ${mine?'is-mine':full?'is-full':''}`} key={item.id}><div className="sg-booking-day">{new Intl.DateTimeFormat('he-IL',{day:'numeric',month:'short'}).format(new Date(`${item.date}T12:00:00`))}</div><div><h3>{item.time||item.label}</h3><p>{item.time?item.label:''}</p><span>{mine?'✓ נרשמתם':full?'המקום תפוס':`${item.capacity-entries.length} מקומות פנויים`}</span>{space.kind==='help'&&entries.length>0&&<p className="sg-small">מתנדבים: {entries.map(x=>x.name).join(', ')}</p>}</div>{mine?<div className="sg-actions"><button disabled={busy} onClick={()=>run('withdraw',{item_id:item.id})}>ביטול שלי</button><button onClick={()=>saveFile(calendarEvent(space,item),'ugabuga-event.ics','text/calendar')}>ליומן</button></div>:<button disabled={busy||space.closed||full||!name.trim()} onClick={()=>run('book',{name,item_id:item.id})}>{space.kind==='parents'?'זו השעה שלי':'אני אעזור'}</button>}</article>})}</div></section>}

function Album({space,run,busy,name,demo}){
 const [consent,setConsent]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState(''),[images,setImages]=useState({}),[visible,setVisible]=useState(12)
 const imageRefs=useRef({}),fileInput=useRef(null),[loading,setLoading]=useState('')
 useEffect(()=>()=>{Object.values(imageRefs.current).forEach(url=>URL.revokeObjectURL(url))},[])
 const load=async photo=>{setLoading(photo.id);setError('');try{const blob=await spaceRequest('photo_read',space.code,ownerToken(space.code),{id:photo.id});const url=URL.createObjectURL(blob);imageRefs.current[photo.id]=url;setImages(x=>({...x,[photo.id]:url}))}catch(e){setError(errorText(e))}finally{setLoading('')}}
 const upload=async files=>{
   setError('');if(!files.length)return
   if(files.length>10){setError('אפשר להעלות עד 10 תמונות בכל פעם.');return}
   for(let i=0;i<files.length;i++){
     setProgress(`מכינים ומעלים תמונה ${i+1} מתוך ${files.length}…`)
     try{const base64=await compressedPhoto(files[i]);const ok=await run('upload',{name,base64});if(!ok)break}catch(e){setError(errorText(e));break}
   }
   setProgress('');if(fileInput.current)fileInput.current.value=''
 }
 return <section className="sg-card"><div className="sg-section-title"><h2>הרגעים שלנו</h2><span>{space.photos.length} / 100 תמונות</span></div><div className="sg-upload"><span aria-hidden="true">📸</span><h3>יש לכם רגע שכולם צריכים לראות?</h3><p>JPG, PNG או WebP · התמונות יכווצו · עד 10 בכל העלאה</p><label className="sg-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>יש לי רשות לשתף את התמונות עם משתתפי האלבום</label><input ref={fileInput} aria-label="בחירת תמונות לאלבום" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={demo||busy||!!progress||space.closed||!consent||!name.trim()||space.photos.length>=100} onChange={e=>upload([...e.target.files])}/>{demo&&<p>בהדגמה לא מעלים קבצים לשרת.</p>}<p role="status">{progress}</p></div>{error&&<p className="sg-error" role="alert">{error}</p>}
   {!space.photos.length&&<div className="sg-empty"><span>🖼️</span><h3>התמונה הראשונה יכולה להיות שלכם</h3><p>שתפו את קישור האלבום כדי שגם האורחים יוסיפו את הרגעים שלהם.</p></div>}
   <div className="sg-gallery">{space.photos.slice(0,visible).map(photo=><article key={photo.id}>{images[photo.id]?<img src={images[photo.id]} alt={`תמונה ששיתף/ה ${photo.name}`} loading="lazy"/>:<button className="sg-photo-load" disabled={!!loading} onClick={()=>load(photo)}>{loading===photo.id?'טוענים…':'🖼️ הצגת התמונה'}</button>}<p>מאת {photo.name}</p><div className="sg-actions">{images[photo.id]&&<a className="sg-button" download={`ugabuga-${photo.id}.jpg`} href={images[photo.id]}>הורדה</a>}{(photo.mine||space.owner)&&<button disabled={busy} onClick={()=>{if(window.confirm('להסיר את התמונה מהאלבום?'))run('photo_delete',{id:photo.id})}}>הסרה</button>}</div></article>)}</div>{visible<space.photos.length&&<button onClick={()=>setVisible(n=>n+12)}>עוד תמונות</button>}
   <p className="sg-small">האלבום זמין עד {new Date(space.expires_at).toLocaleDateString('he-IL')}. הורידו את התמונות שתרצו לשמור לפני סיום התקופה.</p>
 </section>
}

function HostPanel({space,run,busy}){
 const [title,setTitle]=useState(space.config.title),[note,setNote]=useState(space.config.note)
 return <details className="sg-card sg-host"><summary>🔑 ניהול הדף</summary><Field label="כותרת"><input maxLength={100} value={title} onChange={e=>setTitle(e.target.value)}/></Field><Field label="הודעה למשתתפים"><textarea maxLength={600} value={note} onChange={e=>setNote(e.target.value)}/></Field><div className="sg-actions"><button disabled={busy||!title.trim()} onClick={()=>run('update',{title,note})}>שמירת הפרטים</button><button disabled={busy} onClick={()=>run('update',{closed:!space.closed})}>{space.closed?'פתיחה מחדש':'סגירת הרשמה / העלאות'}</button>{space.kind!=='album'&&<button onClick={()=>saveFile(spaceCsv(space),'ugabuga-participants.csv','text/csv;charset=utf-8')}>הורדת הרשימה לאקסל</button>}</div>
   {space.kind!=='album'&&<><h3>הרשמות ותשובות ({space.entries.length})</h3><ul className="sg-host-entries">{space.entries.map(e=><li key={e.id}><span>{e.name} · {itemLabel(space.config.items.find(i=>i.id===e.item_id))} · {({yes:'מתאים',maybe:'אולי',no:'לא מתאים',booked:'רשום'})[e.value]}</span><button disabled={busy} onClick={()=>{if(window.confirm('להסיר את הרשומה הזו?'))run('remove_entry',{id:e.id})}}>הסרה</button></li>)}</ul></>}
   <button className="sg-danger" disabled={busy} onClick={()=>{if(window.confirm('לסגור ולמחוק את הדף? לא ניתן לשחזר אותו.'))run('delete')}}>מחיקת הדף</button>
 </details>
}

function SpaceView({demoKind,code}){
 const demo=!!demoKind,[space,setSpace]=useState(()=>demo?sampleSpace(demoKind):null),[owner]=useState(()=>demo?'demo':ownerToken(code)),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[deleted,setDeleted]=useState(false)
 const [name,setName]=useState(()=>readLocal('name',''))
 const busyRef=useRef(false)
 const refresh=async()=>{const d=await spaceRequest('get',code,owner);setSpace(d);setError('');return d}
 useEffect(()=>{
   if(demo)return
   let live=true
   const load=()=>spaceRequest('get',code,owner).then(d=>{if(live){setSpace(d);setError('')}}).catch(e=>{if(live)setError(errorText(e))})
   load();const timer=setInterval(()=>{if(!document.hidden&&!busyRef.current)load()},30000)
   return()=>{live=false;clearInterval(timer)}
 },[code,owner,demo])
 const run=async(action,payload={})=>{
   if(busyRef.current)return false
   busyRef.current=true;setBusy(true);setError('');setNotice('')
   try{
     if(demo){
       setSpace(s=>{
         if(action==='update')return {...s,closed:payload.closed??(payload.selected?true:s.closed),selected:payload.closed===false?null:payload.selected??s.selected,config:{...s.config,...(payload.title?{title:payload.title,note:payload.note}:{})}}
         if(action==='withdraw')return {...s,entries:s.entries.filter(e=>!(e.mine&&(!payload.item_id||e.item_id===payload.item_id)))}
         if(action==='remove_entry')return {...s,entries:s.entries.filter(e=>e.id!==payload.id)}
         if(action==='vote')return {...s,entries:[...s.entries.filter(e=>!e.mine),...Object.entries(payload.votes).map(([item_id,value])=>({id:`mine-${item_id}`,item_id,value,name:payload.name,mine:true}))]}
         if(action==='book')return {...s,entries:[...s.entries.filter(e=>!(e.mine&&(s.kind==='parents'||e.item_id===payload.item_id))),{id:`mine-${payload.item_id}`,item_id:payload.item_id,value:'booked',name:payload.name,mine:true}]}
         return s
       });setNotice('עודכן בהדגמה בלבד. שום דבר לא נשלח לשרת.')
     }else{
       await spaceRequest(action,code,owner,payload)
       if(action==='delete'){setDeleted(true);return true}
       writeLocal('name',name);await refresh();setNotice('נשמר בהצלחה ✓')
     }
     return true
   }catch(e){if(e.message==='slot_full')await refresh().catch(()=>{});setError(errorText(e));return false}finally{busyRef.current=false;setBusy(false)}
 }
 if(deleted)return <div className="sg-page sg-card"><h1>הדף נסגר</h1><p>הקישור אינו זמין יותר למשתתפים.</p><ToolLinks/></div>
 if(!space)return <div className="sg-page sg-card"><SEO title="דף משותף" noindex/><h1>{error?'לא הצלחנו לפתוח את הדף':'טוענים את הדף המשותף…'}</h1>{error&&<><p role="alert">{error}</p><button onClick={()=>refresh().catch(e=>setError(errorText(e)))}>ניסיון נוסף</button></>}<ToolLinks/></div>
 const t=SPACE_TYPES[space.kind],selected=space.config.items.find(x=>x.id===space.selected)
 return <div className="sg-page"><SEO title="דף משותף בעוגה בוגה" description="משתתפים יחד בקישור שקיבלתם מהמארגן." noindex/>
   {demo&&<div className="sg-demo"><b>👀 זו הדגמה — הפעולות כאן אינן נשמרות בשרת</b><Link to={t.path}>חזרה ליצירת דף</Link><button onClick={()=>setSpace(s=>({...s,owner:!s.owner}))}>{space.owner?'צפייה כמשתתף':'צפייה כמארגן'}</button></div>}
   <header className="sg-event" style={{'--sg-tint':t.color}}><span className="sg-eyebrow">{t.icon} {t.title} · עוגה בוגה</span><h1>{space.config.title}</h1>{space.config.place&&<p>📍 {space.config.place}</p>}<p className="sg-preserve">{space.config.note}</p><span className="sg-status">{space.closed?'🔒 ההרשמה סגורה':'🟢 פתוח להשתתפות'}</span>{selected&&<div className="sg-final"><b>🎉 נקבע! {itemLabel(selected)}</b><button onClick={()=>saveFile(calendarEvent(space,selected),'ugabuga-meeting.ics','text/calendar')}>שמירה ביומן</button></div>}</header>
   {error&&<p className="sg-error" role="alert">{error}</p>}<p className="sg-notice" role="status">{notice}</p>
   <div className="sg-card sg-name"><Field label={space.kind==='parents'?'שם פרטי של ההורה או הילד':'איך קוראים לכם?'}><input maxLength={40} value={name} onChange={e=>setName(e.target.value)} placeholder="שם פרטי" autoComplete="given-name"/></Field><p>{space.kind==='parents'?'השם גלוי רק למארגן ולכם.':'השם יוצג למשתתפי הדף.'} שמרו את הקישור וחזרו מאותו מכשיר כדי לשנות את הבחירה.</p></div>
   {space.kind==='meet'?<Poll space={space} run={run} busy={busy} name={name}/>:space.kind==='album'?<Album space={space} run={run} busy={busy} name={name} demo={demo}/>:<Bookings space={space} run={run} busy={busy} name={name}/>}
   {!demo&&<ShareBox space={space} owner={space.owner?owner:''}/>}{space.owner&&<HostPanel space={space} run={run} busy={busy}/>}
   <section className="sg-brand-footer"><b>🎂 נוצר בעוגה בוגה</b><p>גם לכם יש מפגש לתאם או קבוצה לארגן?</p><Link className="sg-button" to={t.path}>{t.action} משלכם</Link><Link to="/">משחקים, הדפסות ועוד בעוגה בוגה ←</Link></section><ToolLinks/>
 </div>
}

export default function SharedSpaces({kind}){const {code}=useParams(),[params]=useSearchParams();return code?<SpaceView key={code} code={code}/>:params.get('demo')==='1'?<SpaceView key={`demo-${kind}`} demoKind={kind}/>:<CreateSpace key={kind} kind={kind}/>}
