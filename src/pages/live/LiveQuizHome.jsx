import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { cleanCode, liveErrorText, liveMemory, liveQuestionProblem, liveQuizDb, newLiveToken } from '../../utils/liveQuizDb'
import './live-quiz.css'

const COLORS = ['red','blue','gold','green'], MARKS = ['▲','◆','●','■']
const q = (text='', options=['','','',''], correct=null) => ({ id: Math.random().toString(36).slice(2,10), q:text, options, correct })
const DEMO = [
  q('איזה כוכב לכת נקרא „כוכב הלכת האדום”?',['מאדים','נוגה','שבתאי','צדק'],0),
  q('כמה דקות יש בשעה וחצי?',['60','75','90','120'],2),
  q('איזו חיה היא הגדולה בעולם?',['פיל','לווייתן כחול','כריש לבן','ג׳ירפה'],1),
]

function LiveEditor({ onCreate, busy }) {
  const [title,setTitle]=useState(''),[questions,setQuestions]=useState([q()]),[seconds,setSeconds]=useState(20),[error,setError]=useState('')
  useEffect(()=>{try{const draft=JSON.parse(localStorage.getItem('buga-live-draft'));if(draft?.questions?.length){setTitle(draft.title||'');setQuestions(draft.questions);setSeconds(draft.seconds||20)}}catch{/* ignore */}},[])
  useEffect(()=>{const t=setTimeout(()=>{try{localStorage.setItem('buga-live-draft',JSON.stringify({title,questions,seconds}))}catch{/* ignore */}},500);return()=>clearTimeout(t)},[title,questions,seconds])
  const patch=(i,data)=>setQuestions(all=>all.map((item,n)=>n===i?{...item,...data}:item))
  const option=(i,j,value)=>patch(i,{options:questions[i].options.map((x,n)=>n===j?value:x)})
  const move=(i,d)=>{const all=[...questions],n=i+d;if(n<0||n>=all.length)return;[all[i],all[n]]=[all[n],all[i]];setQuestions(all)}
  const submit=e=>{e.preventDefault();const problem=liveQuestionProblem(questions);setError(problem);if(!problem)onCreate({title:title.trim()||'החידון הגדול',questions:questions.map(item=>({...item,q:item.q.trim(),options:item.options.map(x=>x.trim())})),seconds})}
  return <form className="live-editor" onSubmit={submit}>
    <div className="live-editor-top"><label>שם המשחק<input value={title} maxLength={80} onChange={e=>setTitle(e.target.value)} placeholder="למשל: החידון של כיתה ד׳2" /></label>
      <label>זמן לכל שאלה<select value={seconds} onChange={e=>setSeconds(+e.target.value)}>{[5,10,15,20,30,45,60].map(n=><option key={n} value={n}>{n} שניות</option>)}</select></label></div>
    {questions.map((item,i)=><fieldset className="live-question-edit" key={item.id}><legend>שאלה {i+1}</legend>
      <textarea value={item.q} maxLength={240} rows={2} onChange={e=>patch(i,{q:e.target.value})} placeholder="מה תרצו לשאול?" aria-label={`נוסח שאלה ${i+1}`} />
      <div className="live-option-edit">{item.options.map((answer,j)=><div className={`live-answer edit ${COLORS[j]}`} key={j}>
        <button type="button" onClick={()=>patch(i,{correct:j})} aria-label={`סימון תשובה ${j+1} כנכונה`} aria-pressed={item.correct===j}>{item.correct===j?'✓':MARKS[j]}</button>
        <input value={answer} maxLength={120} onChange={e=>option(i,j,e.target.value)} placeholder={`תשובה ${j+1}`} />
        {item.options.length>2&&<button type="button" className="live-remove" onClick={()=>patch(i,{options:item.options.filter((_,n)=>n!==j),correct:item.correct===j?null:item.correct>j?item.correct-1:item.correct})} aria-label="מחיקת תשובה">×</button>}
      </div>)}</div>
      <div className="live-edit-actions">{item.options.length<4&&<button type="button" onClick={()=>patch(i,{options:[...item.options,'']})}>＋ תשובה</button>}<span />
        <button type="button" onClick={()=>move(i,-1)} disabled={!i}>↑</button><button type="button" onClick={()=>move(i,1)} disabled={i===questions.length-1}>↓</button>
        <button type="button" onClick={()=>setQuestions(all=>[...all.slice(0,i+1),{...item,id:Math.random().toString(36).slice(2,10),options:[...item.options]},...all.slice(i+1)])}>שכפול</button>
        {questions.length>1&&<button type="button" className="danger" onClick={()=>setQuestions(all=>all.filter((_,n)=>n!==i))}>מחיקה</button>}
      </div></fieldset>)}
    <div className="live-editor-buttons">{questions.length<50&&<button type="button" className="live-add-question" onClick={()=>setQuestions(all=>[...all,q()])}>＋ שאלה חדשה</button>}
      {questions.length===1&&!questions[0].q&&<button type="button" className="live-demo" onClick={()=>{setTitle('אלופי הידע');setQuestions(DEMO.map(item=>({...item,id:Math.random().toString(36).slice(2,10)})))}}>⚡ מילוי משחק לדוגמה</button>}</div>
    <p className="live-save-note">הטיוטה נשמרת אוטומטית במכשיר הזה · עד 50 שאלות</p>
    {error&&<p className="live-error" role="alert">{error}</p>}
    <button className="live-create" disabled={busy}>{busy?'מכינים את חדר המשחק…':'🚀 יצירת בוגה לייב'}</button>
  </form>
}

export default function LiveQuizHome(){
 const nav=useNavigate(),[tab,setTab]=useState('start'),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const owned=liveMemory.owned()
 const create=async quiz=>{setBusy(true);setError('');try{const token=newLiveToken(),gameCode=await liveQuizDb.create(token,quiz.title,quiz.questions,quiz.seconds);liveMemory.rememberHost(gameCode,token,quiz.title);localStorage.removeItem('buga-live-draft');nav(`/live/${gameCode}/host`)}catch(e){setError(liveErrorText(e.code))}finally{setBusy(false)}}
 const join=e=>{e.preventDefault();const value=cleanCode(code);if(value.length===6)nav(`/play/${value}`);else setError('הקוד מורכב מ־6 אותיות וספרות.')}
 return <main className="live-home">
  <SEO title="בוגה לייב — משחק חידון חי לעד 100 משתתפים" description="יוצרים חידון חי בחינם, המשתתפים מצטרפים עם QR או קוד ועונים מהטלפון. ניקוד לפי מהירות ולוח מובילים בזמן אמת." path="/live" />
  <div className="live-home-inner"><Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'משחקים',href:'/games'},{label:'בוגה לייב'}]} />
   <header className="live-hero"><div className="live-logo-orb">B!</div><p>המשחק של כולם, בזמן אמת</p><h1>בוגה לייב</h1><h2>הופכים כל כיתה ומסיבה לאולפן משחקים</h2>
    <div className="live-hero-pills"><span>📱 עד 100 משתתפים</span><span>▦ כניסה עם QR</span><span>🏆 ניקוד חי</span><span>✨ בלי הרשמה</span></div></header>
   <div className="live-tabbar"><button aria-pressed={tab==='start'} onClick={()=>setTab('start')}>יצירת משחק</button><button aria-pressed={tab==='join'} onClick={()=>setTab('join')}>כניסה למשחק</button></div>
   {error&&<p className="live-error" role="alert">{error}</p>}
   {tab==='join'?<section className="live-join-card"><span>🎮</span><h2>יש לכם קוד?</h2><p>כתבו את הקוד שמופיע על מסך המארח</p><form onSubmit={join}><input dir="ltr" inputMode="text" autoCapitalize="characters" value={code} onChange={e=>setCode(cleanCode(e.target.value))} maxLength={12} placeholder="ABC123" aria-label="קוד משחק" autoFocus/><button>כניסה</button></form></section>
   :<><section className="live-how"><div><b>1</b><span>יוצרים שאלות</span></div><div><b>2</b><span>מציגים QR</span></div><div><b>3</b><span>כולם עונים</span></div><div><b>4</b><span>מגלים מי ניצח</span></div></section>
    {owned.length>0&&<section className="live-owned"><h2>המשחקים שלי</h2><div>{owned.slice(0,6).map(game=><Link key={game.code} to={`/live/${game.code}/host`}><b>{game.title}</b><span dir="ltr">{game.code}</span></Link>)}</div></section>}
    <section className="live-builder"><div className="live-builder-title"><p>הסטודיו של המארח</p><h2>בונים משחק חדש</h2><span>סמנו את התשובה הנכונה בכל שאלה. בזמן המשחק היא נשארת סודית עד החשיפה.</span></div><LiveEditor onCreate={create} busy={busy}/></section></>}
  </div>
 </main>
}
