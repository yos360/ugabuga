import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { buildLiveQuiz, LIVE_QUIZ_DIFFICULTIES, LIVE_QUIZ_TOPICS } from '../../data/liveQuizPacks'
import { cleanCode, liveErrorText, liveMemory, liveQuestionProblem, liveQuizDb, newLiveToken } from '../../utils/liveQuizDb'
import './live-quiz.css'

const COLORS = ['red','blue','gold','green'], MARKS = ['▲','◆','●','■']
const q = (text='', options=['','','',''], correct=null) => ({ id: Math.random().toString(36).slice(2,10), q:text, options, correct })
const readDraft = () => { try { return JSON.parse(localStorage.getItem('buga-live-draft')) } catch { return null } }

function LiveEditor({ onCreate, busy }) {
  const [draft]=useState(readDraft)
  const [title,setTitle]=useState(()=>draft?.title||''),[questions,setQuestions]=useState(()=>draft?.questions?.length?draft.questions:[q()]),[seconds,setSeconds]=useState(()=>draft?.seconds||20),[error,setError]=useState('')
  const [topic,setTopic]=useState('general'),[difficulty,setDifficulty]=useState('medium'),[questionCount,setQuestionCount]=useState(6),[generated,setGenerated]=useState('')
  useEffect(()=>{const t=setTimeout(()=>{try{localStorage.setItem('buga-live-draft',JSON.stringify({title,questions,seconds}))}catch{/* ignore */}},500);return()=>clearTimeout(t)},[title,questions,seconds])
  const patch=(i,data)=>setQuestions(all=>all.map((item,n)=>n===i?{...item,...data}:item))
  const option=(i,j,value)=>patch(i,{options:questions[i].options.map((x,n)=>n===j?value:x)})
  const move=(i,d)=>{const all=[...questions],n=i+d;if(n<0||n>=all.length)return;[all[i],all[n]]=[all[n],all[i]];setQuestions(all)}
  const generate=()=>{
    const key=`buga-live-generated-${topic}-${difficulty}`
    let previous=[];try{const raw=localStorage.getItem(key);previous=raw?(raw.startsWith('[')?JSON.parse(raw):raw):[]}catch{/* private mode */}
    const game=buildLiveQuiz(topic,difficulty,questionCount,previous)
    setTitle(game.title);setQuestions(game.questions.map(item=>({...item,id:Math.random().toString(36).slice(2,10)})));setError('');setGenerated(`${game.topic.icon} נוצר משחק ${game.topic.label} ברמה ${game.difficulty.label}`)
    try{localStorage.setItem(key,JSON.stringify(game.history))}catch{/* private mode */}
  }
  const submit=e=>{e.preventDefault();const problem=liveQuestionProblem(questions);setError(problem);if(!problem)onCreate({title:title.trim()||'חידון חדש',questions:questions.map(item=>({...item,q:item.q.trim(),options:item.options.map(x=>x.trim())})),seconds})}
  return <form className="live-editor" onSubmit={submit}>
    <section className="live-generator" aria-labelledby="live-generator-title">
      <div className="live-generator-head"><div><span>✨ משחקים מוכנים</span><h3 id="live-generator-title">בוחרים נושא ורמה — ומקבלים משחק אחר בכל פעם</h3></div><b>{questionCount} שאלות</b></div>
      <div className="live-topic-grid">{LIVE_QUIZ_TOPICS.map(item=><button type="button" key={item.id} aria-pressed={topic===item.id} style={{'--topic-color':item.color}} onClick={()=>setTopic(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</div>
      <div className="live-generator-settings"><fieldset><legend>רמת קושי</legend>{LIVE_QUIZ_DIFFICULTIES.map(item=><button type="button" key={item.id} aria-pressed={difficulty===item.id} onClick={()=>setDifficulty(item.id)}><span>{item.icon} {item.label}</span><small>{item.description}</small></button>)}</fieldset>
        <label>מספר שאלות<select value={questionCount} onChange={e=>setQuestionCount(+e.target.value)}>{[5,6,7,8].map(n=><option value={n} key={n}>{n} שאלות</option>)}</select></label>
        <button type="button" className="live-generate" onClick={generate}>🎲 צור לי משחק אחר</button></div>
      {generated&&<p className="live-generated-note" role="status">✓ {generated}. השאלות לא יחזרו עד למיצוי המאגר, ואפשר לשנות כל שאלה לפני שמתחילים.</p>}
    </section>
    <div className="live-custom-divider"><span>עריכת המשחק</span></div>
    <div className="live-editor-top"><label>שם המשחק<input value={title} maxLength={80} onChange={e=>setTitle(e.target.value)} placeholder="למשל: החידון של כיתה ג׳2" /></label>
      <label>זמן לכל שאלה<select value={seconds} onChange={e=>setSeconds(+e.target.value)}>{[5,10,15,20,30,45,60].map(n=><option key={n} value={n}>{n} שניות</option>)}</select></label></div>
    {questions.map((item,i)=><fieldset className="live-question-edit" key={item.id}><legend>שאלה {i+1}</legend>
      <textarea value={item.q} maxLength={240} rows={2} onChange={e=>patch(i,{q:e.target.value})} placeholder="מה תרצו לשאול?" aria-label={`נוסח שאלה ${i+1}`} />
      {item.verified&&item.source&&<a className="live-question-source" href={item.source.url} target="_blank" rel="noopener noreferrer">✓ שאלה מאומתת · {item.source.label} ↗</a>}
      <div className="live-option-edit">{item.options.map((answer,j)=><div className={`live-answer edit ${COLORS[j]}`} key={j}>
        <button type="button" onClick={()=>patch(i,{correct:j})} aria-label={`סימון תשובה ${j+1} כנכונה`} aria-pressed={item.correct===j}>{item.correct===j?'✓':MARKS[j]}</button>
        <input value={answer} maxLength={120} onChange={e=>option(i,j,e.target.value)} placeholder={`תשובה ${j+1}`} />
        {item.options.length>2&&<button type="button" className="live-remove" onClick={()=>patch(i,{options:item.options.filter((_,n)=>n!==j),correct:item.correct===j?null:item.correct>j?item.correct-1:item.correct})} aria-label="מחיקת תשובה">×</button>}
      </div>)}</div>
      <div className="live-edit-actions">{item.options.length<4&&<button type="button" onClick={()=>patch(i,{options:[...item.options,'']})}>+ תשובה</button>}<span />
        <button type="button" onClick={()=>move(i,-1)} disabled={!i}>↑</button><button type="button" onClick={()=>move(i,1)} disabled={i===questions.length-1}>↓</button>
        <button type="button" onClick={()=>setQuestions(all=>[...all.slice(0,i+1),{...item,id:Math.random().toString(36).slice(2,10),options:[...item.options]},...all.slice(i+1)])}>שכפול</button>
        {questions.length>1&&<button type="button" className="danger" onClick={()=>setQuestions(all=>all.filter((_,n)=>n!==i))}>מחיקה</button>}
      </div></fieldset>)}
    <div className="live-editor-buttons">{questions.length<50&&<button type="button" className="live-add-question" onClick={()=>setQuestions(all=>[...all,q()])}>+ שאלה חדשה</button>}</div>
    <p className="live-save-note">הטיוטה נשמרת אוטומטית בדפדפן · עד 50 שאלות</p>
    {error&&<p className="live-error" role="alert">{error}</p>}
    <button className="live-create" disabled={busy}>{busy?'מכינים את חדר המשחק…':'🚀 יצירת משחק חי'}</button>
  </form>
}

export default function LiveQuizHome(){
 const nav=useNavigate(),[tab,setTab]=useState('start'),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const owned=liveMemory.owned()
 const create=async quiz=>{setBusy(true);setError('');try{const token=newLiveToken(),gameCode=await liveQuizDb.create(token,quiz.title,quiz.questions,quiz.seconds);liveMemory.rememberHost(gameCode,token,quiz.title);localStorage.removeItem('buga-live-draft');nav(`/live/${gameCode}/host`)}catch(e){setError(liveErrorText(e.code))}finally{setBusy(false)}}
 const join=e=>{e.preventDefault();const value=cleanCode(code);if(value.length===6)nav(`/play/${value}`);else setError('הקוד צריך להכיל 6 אותיות וספרות.')}
 return <main className="live-home">
  <SEO title="בוגה לייב - משחק שאלות חי עד 100 משתתפים" description="יוצרים משחק שאלות, משתתפים מצטרפים עם QR ועד מאה שחקנים עונים יחד בזמן אמת." path="/live" />
  <div className="live-home-inner"><Breadcrumbs items={[{label:'בית',href:'/'},{label:'משחקים',href:'/games'},{label:'בוגה לייב'}]} />
   <header className="live-hero"><div className="live-logo-orb">B!</div><p>מהמסך שלכם, ישר לכולם</p><h1>בוגה לייב</h1><h2>משחקים ביחד, עונים בזמן אמת</h2>
    <div className="live-hero-pills"><span>👥 עד 100 משתתפים</span><span>📱 כניסה עם QR</span><span>🏆 ניקוד חי</span><span>✨ בלי הרשמה</span></div></header>
   <div className="live-tabbar"><button aria-pressed={tab==='start'} onClick={()=>setTab('start')}>יצירת משחק</button><button aria-pressed={tab==='join'} onClick={()=>setTab('join')}>כניסה למשחק</button></div>
   {error&&<p className="live-error" role="alert">{error}</p>}
   {tab==='join'?<section className="live-join-card"><span>🎮</span><h2>יש לכם קוד?</h2><p>הקלידו את הקוד שקיבלתם ממנחה המשחק</p><form onSubmit={join}><input dir="ltr" inputMode="text" autoCapitalize="characters" value={code} onChange={e=>setCode(cleanCode(e.target.value))} maxLength={12} placeholder="ABC123" aria-label="קוד משחק" autoFocus/><button>כניסה</button></form></section>
   :<><section className="live-how"><div><b>1</b><span>בוחרים משחק</span></div><div><b>2</b><span>משתפים QR</span></div><div><b>3</b><span>כולם עונים</span></div><div><b>4</b><span>עולים בדירוג</span></div></section>
    {owned.length>0&&<section className="live-owned"><h2>המשחקים שלי</h2><div>{owned.slice(0,6).map(game=><Link key={game.code} to={`/live/${game.code}/host`}><b>{game.title}</b><span dir="ltr">{game.code}</span></Link>)}</div></section>}
    <section className="live-builder"><div className="live-builder-title"><p>מתחילים תוך דקה</p><h2>יוצרים משחק חדש</h2><span>בחרו משחק מוכן או כתבו אחד משלכם. בלי הרשמה ובלי התקנה.</span></div><LiveEditor onCreate={create} busy={busy}/></section></>}
  </div>
 </main>
}
