import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TravelPage } from './TravelPage'
import { TRAVEL_STORIES, selectedStories, selectStory, storyQueue } from './storyCatalog'
import { offlineState } from './offlineClient'
import { speakAndWait, stopSpeaking } from '../utils/speak'

export function TravelRadio(){
 const [age,setAge]=useState('all'),[minutes,setMinutes]=useState(10),[saved,setSaved]=useState(selectedStories),[index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[night,setNight]=useState(false),[sleep,setSleep]=useState(0),[message,setMessage]=useState(''),[offline,setOffline]=useState(()=>!navigator.onLine)
 const [downloaded,setDownloaded]=useState([])
 useEffect(()=>{offlineState().then(s=>setDownloaded(s?.stories||[]))},[offline])
 const token=useRef(0),audio=useRef(null),position=useRef({story:0,part:0}),sleepTimer=useRef(null)
 const queue=storyQueue(age,minutes,offline?downloaded:null),queueRef=useRef(queue);queueRef.current=queue
 const stop=()=>{token.current++;audio.current?.pause();stopSpeaking();setPlaying(false)}
 useEffect(()=>{const update=()=>setOffline(!navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{token.current++;audio.current?.pause();stopSpeaking();clearTimeout(sleepTimer.current);window.removeEventListener('online',update);window.removeEventListener('offline',update)}},[])
 useEffect(()=>{clearTimeout(sleepTimer.current);if(sleep&&playing)sleepTimer.current=setTimeout(()=>{token.current++;audio.current?.pause();stopSpeaking();setPlaying(false);setMessage('שעון השינה עצר את ההשמעה.')},sleep*60000);return()=>clearTimeout(sleepTimer.current)},[sleep,playing])
 const playClip=src=>new Promise(resolve=>{const a=audio.current||(audio.current=new Audio());const done=value=>{a.onended=null;a.onerror=null;a.onpause=null;resolve(value)};a.src=src;a.onended=()=>done(true);a.onerror=()=>done(false);a.onpause=()=>{if(a.paused&&!a.ended)done(false)};a.play().catch(()=>done(false))})
 const play=async(start=index,resume=false)=>{
  stop();const run=++token.current;setMessage('');setPlaying(true);const list=queueRef.current
  for(let si=start;si<list.length;si++){
   const story=list[si];setIndex(si)
   for(let pi=resume&&si===start?position.current.part:0;pi<story.parts.length;pi++){
    if(run!==token.current)return
    position.current={story:si,part:pi};const part=story.parts[pi]
    const ok=part.src?await playClip(part.src):await speakAndWait(part.text,'he-IL')
    if(run!==token.current)return
    if(!ok){setPlaying(false);setMessage('ההשמעה לא התחילה. נסו שוב, בדקו את עוצמת הקול או התקינו קול עברי במכשיר.');return}
   }
   resume=false;position.current={story:si+1,part:0}
  }
  if(run===token.current){setPlaying(false);setMessage('הגענו לסוף הרשימה. לילה טוב ודרך נעימה.');position.current={story:0,part:0}}
 }
 const move=delta=>{const next=Math.max(0,Math.min(queue.length-1,index+delta));const was=playing;stop();position.current={story:next,part:0};setIndex(next);if(was)void play(next)}
 const toggle=slug=>{const ids=saved.includes(slug)?saved.filter(s=>s!==slug):[...saved,slug];try{selectStory(ids);setSaved(ids);setMessage('הבחירה עודכנה. כדי להוריד את ההקלטות, פתחו את תיק הטיסה ולחצו שמרו לטיסה.')}catch{setMessage('הדפדפן לא מאפשר לשמור את הבחירה. בדקו את הגדרות האחסון.')}}
 return <TravelPage title="רדיו בוגה — סיפורים לשמיעה בדרך" path="/travel/stories" intro="רשימת השמעה מהסיפורים שכבר נמצאים באתר. בוחרים גיל ואורך משוער, מקשיבים ברצף, ומסמנים סיפורים לשמירה בתיק הטיסה. ההקלטות הקיימות קודמות לקול המכשיר." faq={[{q:'האם הזמן מדויק?',a:'5, 10 או 20 דקות הם אורך משוער לפי קצב קריאה. הרשימה כוללת סיפורים שלמים ולכן עשויה להיות ארוכה יותר. שעון השינה עוצר בזמן שבוחרים.'},{q:'מה קורה כשמשהים?',a:'ההקראה נעצרת. בהמשך היא מתחילה מתחילת הפסקה הנוכחית, כדי לא לאבד את ההקשר.'},{q:'איך שומרים סיפור בלי אינטרנט?',a:'מסמנים אותו כאן, עוברים לתיק הטיסה ולוחצים שמרו לטיסה. כשהקלטה מוכנה זמינה היא יורדת למכשיר. בהיעדר הקלטה צריך לבדוק מראש קול עברי מקומי במכשיר.'}]}>
 <div data-keep-colors={night?true:undefined} className={`travel-radio ${night?'night':''}`}><div className="travel-controls"><label>גיל<select value={age} onChange={e=>{stop();setAge(e.target.value);setIndex(0);position.current={story:0,part:0}}}><option value="all">כל הגילים</option>{['3-5','5-7','7-9'].map(a=><option key={a} value={a}>{a.replace('-', '–')}</option>)}</select></label><label>אורך האזנה משוער<select value={minutes} onChange={e=>{stop();setMinutes(+e.target.value);setIndex(0)}}>{[5,10,20].map(v=><option key={v} value={v}>{v} דקות</option>)}</select></label><label>שעון שינה<select value={sleep} onChange={e=>setSleep(+e.target.value)}><option value={0}>ללא שעון</option>{[5,10,20,30].map(v=><option key={v} value={v}>{v} דקות</option>)}</select></label><button aria-pressed={night} onClick={()=>setNight(v=>!v)}>מסך כהה</button></div>
 {queue.length?<><h2 aria-live="polite">{queue[index]?.text.title||queue[0].text.title}</h2><div className="travel-controls travel-player"><button disabled={index===0} onClick={()=>move(-1)}>הקודם</button><button onClick={()=>playing?stop():play(index,position.current.story===index)}>{playing?'השהיה':'השמעה'}</button><button disabled={index>=queue.length-1} onClick={()=>move(1)}>הבא</button></div><p>{playing?'משמיעים סיפור…':'מוכנים להקשיב'} · {queue.length} סיפורים ברשימה</p><ol>{queue.map((s,i)=><li key={s.slug}><button onClick={()=>{stop();setIndex(i);position.current={story:i,part:0}}}>{i+1}. {s.text.title} · כ־{s.minutes} דקות</button></li>)}</ol></>:<p>אין סיפורים שמורים לגיל הזה. שמרו סיפורים עם אינטרנט לפני היציאה.</p>}<p role="status">{message}</p></div>
 <h2>בוחרים סיפורים לנסיעה</h2><p>אחרי הסימון, פתחו את <Link to="/travel/offline">תיק הטיסה</Link> לשמירה בפועל.</p><div className="travel-grid">{TRAVEL_STORIES.filter(s=>age==='all'||s.age===age).map(s=><section className="travel-card" key={s.slug}><Link to={'/stories/'+s.slug}>{s.text.title}</Link><p>גיל {s.age} · כ־{s.minutes} דקות</p><button aria-pressed={saved.includes(s.slug)} onClick={()=>toggle(s.slug)}>{saved.includes(s.slug)?'✓ נבחר לנסיעה — ביטול':'לשמור לנסיעה'}</button></section>)}</div>
 </TravelPage>
}
