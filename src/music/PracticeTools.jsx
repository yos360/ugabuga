import { useEffect, useRef, useState } from 'react'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import { audio, scheduleClick, playString } from './audio'
import { STRINGS, beatDuration, beatSchedule, tapTempo, detectPitch, tuning } from './practiceLogic'

const input='mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--card)] p-3'
const button='min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-2 font-bold'
function Shell({slug,title,description,paragraphs,faq,children}) {
 return <div dir="rtl" className="mx-auto max-w-3xl space-y-6 px-4 py-8"><SEO title={title} description={description} path={`/music/${slug}`} structuredData={faqSchema(faq)} /><Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'מוזיקה',href:'/music'},{label:title}]} /><h1 className="text-3xl font-black sm:text-4xl">{title}</h1><p>{description}</p><section className="space-y-5 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">{children}</section><SeoBody paragraphs={paragraphs} faq={faq} related={[{href:'/music',label:'כל כלי המוזיקה'},{href:'/music/piano',label:'פסנתר אונליין'},{href:'/music/guitar-chords',label:'אקורדים לגיטרה'}]} /></div>
}
const METRO_FAQ=[{q:'מה זה BPM?',a:'מספר הפעימות בדקה. 60 BPM הם פעימה בכל שנייה; 120 BPM הם שתי פעימות בשנייה. אפשר לבחור כל קצב בין 30 ל־250.'},{q:'איך משתמשים בטאפ טמפו?',a:'מקישים כמה פעמים בקצב הרצוי. המטרונום מחשב ממוצע של עד שמונה הקשות; הפסקה של יותר משתי שניות מתחילה מדידה חדשה.'},{q:'מה קורה כשהטלפון ננעל?',a:'הנגינה נעצרת כאשר הדף מוסתר. חזרו לדף ולחצו התחלה כדי לחדש; מערכת ההפעלה עשויה לעצור אודיו ברקע.'}]
export function Metronome() {
 const [bpm,setBpm]=useState('100'),[beats,setBeats]=useState(4),[running,setRunning]=useState(false),[pulse,setPulse]=useState(-1),[error,setError]=useState(''),taps=useRef([])
 const valid=Number(bpm)>=30&&Number(bpm)<=250&&bpm!==''
 useEffect(()=>{
  if(!running||!valid)return
  const ac=audio();if(!ac)return
  let next=ac.currentTime+0.05,index=0,timer,frame,queue=[],scheduled=[]
  const schedule=()=>{
   const batch=beatSchedule(next,index,ac.currentTime,Number(bpm),beats)
   next=batch.next;index=batch.index
   scheduled=scheduled.filter(e=>e.time+0.1>ac.currentTime)
   for(const event of batch.events){scheduled.push({...event,cancel:scheduleClick(event.time,event.accent)});queue.push(event)}
   timer=setTimeout(schedule,25)
  }
  const draw=()=>{let latest;while(queue.length&&queue[0].time<=ac.currentTime)latest=queue.shift();if(latest)setPulse(latest.beat);frame=requestAnimationFrame(draw)}
  const hide=()=>{if(document.hidden)setRunning(false)}
  schedule();draw();document.addEventListener('visibilitychange',hide)
  return()=>{clearTimeout(timer);cancelAnimationFrame(frame);scheduled.forEach(e=>e.cancel());document.removeEventListener('visibilitychange',hide)}
 },[running,bpm,beats,valid])
 const start=async()=>{try{beatDuration(Number(bpm));const ac=audio();if(!ac)throw new Error('צליל אינו נתמך בדפדפן זה.');await ac.resume();setError('');setRunning(true)}catch(e){setError(e.message)}}
 const change=v=>{setBpm(v);if(v===''||Number(v)<30||Number(v)>250)setRunning(false)}
 return <Shell slug="metronome" title="מטרונום אונליין — קצב יציב לתרגול מוזיקה" description="מטרונום חינמי עם 30–250 BPM, טאפ טמפו, הדגשת הפעימה הראשונה וחיווי חזותי גדול לתרגול ולכיתה." paragraphs={['מטרונום עוזר להרגיש פעימה קבועה בזמן שמתרגלים שיר או תרגיל. התחילו בקצב נוח, בחרו כמה פעימות יש בכל תיבה והקשיבו לצליל הגבוה יותר שמסמן את תחילת התיבה.', 'הצלילים מתוזמנים מראש באמצעות שעון האודיו של הדפדפן, כדי לצמצם תנודות בתזמון. העיגולים מציגים את הפעימה הנוכחית, ואפשר להפעיל את מצב ההקרנה של האתר לתצוגה גדולה.']} faq={METRO_FAQ}><div className="grid gap-4 sm:grid-cols-2"><label className="font-bold">פעימות בדקה (BPM)<input className={input} type="number" min="30" max="250" value={bpm} onChange={e=>change(e.target.value)} /></label><label className="font-bold">פעימות בתיבה<select className={input} value={beats} onChange={e=>setBeats(Number(e.target.value))}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label></div><input aria-label="מחוון קצב" className="w-full" type="range" min="30" max="250" value={valid?bpm:100} onChange={e=>change(e.target.value)} /><p className="text-center text-6xl font-black">{bpm||'—'} <small className="text-xl">BPM</small></p><div className="flex flex-wrap justify-center gap-2" aria-label={running?`פעימה ${pulse+1}`:'המטרונום עצור'}>{Array.from({length:beats},(_,i)=><span key={i} className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl font-bold ${running&&pulse===i?'bg-[var(--accent)] text-white':'bg-[var(--card)]'}`}>{i+1}</span>)}</div><div className="flex flex-wrap justify-center gap-3"><button className={button} onClick={()=>running?setRunning(false):start()} disabled={!valid}>{running?'עצירה':'התחלה'}</button><button className={button} onClick={()=>{const r=tapTempo(taps.current,performance.now());taps.current=r.taps;if(r.bpm)setBpm(String(r.bpm))}}>הקישו קצב — טאפ טמפו</button></div>{(!valid||error)&&<p role="alert">{error||'בחרו קצב בין 30 ל־250.'}</p>}</Shell>
}
const TUNER_FAQ=[{q:'למה צריך הרשאת מיקרופון?',a:'כדי לזהות את גובה הצליל של המיתר. ההרשאה מתבקשת רק בלחיצה על הפעלת מיקרופון; האודיו מעובד במכשיר, אינו מוקלט ואינו נשלח.'},{q:'מה משמעות המחוג והסנטים?',a:'סנט הוא מאית חצי טון. ערך שלילי פירושו צליל נמוך מהיעד, וחיובי פירושו צליל גבוה. מרכז המחוג הוא צליל היעד; בטווח של חמישה סנטים התצוגה מסומנת כקרובה ליעד.'},{q:'אפשר להשתמש בטיונר בלי מיקרופון?',a:'כן. בוחרים מיתר ומשמיעים צליל ייחוס להשוואה באוזן. בכיוון הרגיל המיתרים מהנמוך לגבוה הם E2, A2, D3, G3, B3, E4. כוונו בעדינות, מיתר אחד בכל פעם.'}]
export function Tuner() {
 const [selected,setSelected]=useState('auto'),[status,setStatus]=useState('off'),[pitch,setPitch]=useState(null),[message,setMessage]=useState(''),session=useRef(0),resources=useRef(null)
 const release=()=>{session.current++;const r=resources.current;resources.current=null;if(r){clearTimeout(r.timer);r.source?.disconnect();r.analyser?.disconnect();r.stream?.getTracks().forEach(t=>t.stop())}}
 const stop=()=>{release();setStatus('off');setPitch(null)}
 useEffect(()=>{const hide=()=>{if(document.hidden)stop()};document.addEventListener('visibilitychange',hide);return()=>{release();document.removeEventListener('visibilitychange',hide)}},[])
 const start=async()=>{
  release();const token=session.current;setStatus('pending');setMessage('');setPitch(null)
  let stream
  try{
   if((document.permissionsPolicy || document.featurePolicy)?.allowsFeature('microphone') === false)throw new Error('כדי להפעיל את המיקרופון יש לפתוח מחדש את עמוד הטיונר בקישור שמתחת לכפתורים.');
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('המיקרופון אינו זמין כאן. נסו HTTPS או השמעת צליל ייחוס.')
   const ac=audio();if(!ac)throw new Error('אודיו אינו נתמך בדפדפן זה.');await ac.resume()
   stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false})
   if(token!==session.current){stream.getTracks().forEach(t=>t.stop());return}
   const source=ac.createMediaStreamSource(stream),analyser=ac.createAnalyser();analyser.fftSize=4096;source.connect(analyser)
   const buffer=new Float32Array(analyser.fftSize),r={stream,source,analyser,timer:null};resources.current=r;setStatus('on')
   const sample=()=>{if(token!==session.current)return;analyser.getFloatTimeDomainData(buffer);setPitch(detectPitch(buffer,ac.sampleRate));r.timer=setTimeout(sample,100)}
   sample()
   stream.getTracks().forEach(track=>track.addEventListener('ended',()=>{if(token===session.current){stop();setMessage('המיקרופון התנתק. אפשר להפעיל שוב או להשמיע צליל ייחוס.')}},{once:true}))
  }catch(e){stream?.getTracks().forEach(t=>t.stop());if(token!==session.current)return;release();setStatus('off');setMessage(e.name==='NotAllowedError'?'לא ניתנה הרשאת מיקרופון. אפשר לשנות הרשאות בדפדפן או להשתמש בצליל ייחוס.':e.message||'לא ניתן להפעיל מיקרופון.')}
 }
 const result=pitch?tuning(pitch,selected==='auto'?null:Number(selected)):null
 return <Shell slug="tuner" title="טיונר לגיטרה אונליין — כיוון מיתרים וצליל ייחוס" description="טיונר לגיטרה בכיוון רגיל עם זיהוי צליל במיקרופון, מחוג וסנטים, או השמעת תווי ייחוס. האודיו נשאר במכשיר." paragraphs={['הטיונר מיועד לכיוון גיטרה רגיל, מיתר אחד בכל פעם. ניגנו מיתר פתוח והמתינו לצליל יציב. בסביבה רועשת או כשהמיתר רחוק מהכיוון, כדאי לבחור את מיתר היעד במקום זיהוי אוטומטי.', 'אפשר גם להשמיע תו ייחוס ולהשוות באוזן. האזינו בעוצמה נוחה; המיקרופון נעצר לפני השמעת הייחוס כדי שלא ימדוד את הרמקול. אין שמירה או שידור של הקול, ועצירה או יציאה מהדף משחררות את המיקרופון.']} faq={TUNER_FAQ}><p>המיקרופון משמש לניתוח הצליל במכשיר בלבד. לא מקליטים ולא שולחים אודיו.</p><label className="block font-bold">מיתר יעד<select className={input} value={selected} onChange={e=>setSelected(e.target.value)}><option value="auto">זיהוי אוטומטי של המיתר הקרוב</option>{STRINGS.map((s,i)=><option key={s.note} value={i}>{s.note} — {s.label}</option>)}</select></label><div className="flex flex-wrap gap-2"><button className={button} onClick={start} disabled={status!=='off'}>{status==='pending'?'ממתינים להרשאה…':'הפעלת מיקרופון'}</button><button className={button} disabled={status==='off'} onClick={stop}>עצירת מיקרופון</button></div>{message&&<p role="alert">{message}</p>}<p><a className="underline" href="/music/tuner">פתיחת עמוד הטיונר מחדש עם תמיכה במיקרופון</a></p><div className="rounded-2xl border-2 p-4 text-center"><p role="status">{status==='on'?'המיקרופון פעיל — נגנו מיתר אחד':status==='pending'?'ממתינים להרשאתכם':'המיקרופון כבוי'}</p><p className="text-5xl font-black" dir="ltr">{result?.string.note||'—'}</p><div className="relative mx-auto my-6 h-10 max-w-sm border-b-4" dir="ltr"><span className="absolute left-0">−50</span><span className="absolute left-1/2">0</span><span className="absolute right-0">+50</span><span aria-hidden="true" className="absolute bottom-0 h-7 w-1 bg-[var(--accent)]" style={{left:`${50+(result?Math.max(-50,Math.min(50,result.cents)):0)}%`}} /></div><p>{result?`${result.cents>0?'+':''}${result.cents.toFixed(1)} סנטים · ${result.frequency.toFixed(1)} Hz`:status==='on'?'ממתינים לצליל ברור…':'הפעילו מיקרופון או האזינו לצליל ייחוס'}</p>{result&&<p className="font-bold">{Math.abs(result.cents)<=5?'קרוב ליעד ✓':result.cents<0?'הצליל נמוך מהיעד':'הצליל גבוה מהיעד'}</p>}</div><h2 className="text-xl font-bold">השמעת צליל ייחוס — ללא מיקרופון</h2><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{STRINGS.map(s=><button className={button} key={s.note} onClick={()=>{stop();try{if(!audio())throw new Error('צליל אינו נתמך בדפדפן זה.');playString(s.note);setMessage(`צליל ייחוס: ${s.note}`)}catch(e){setMessage(e.message)}}}>{s.note} · {s.label}</button>)}</div></Shell>
}

