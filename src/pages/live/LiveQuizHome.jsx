import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { buildLiveQuiz, getLiveQuizBankStats, LIVE_QUIZ_DIFFICULTIES, LIVE_QUIZ_MODES, LIVE_QUIZ_TOPICS } from '../../data/liveQuizPacks'
import { cleanCode, liveErrorText, liveMemory, liveQuestionProblem, liveQuizDb, newLiveToken } from '../../utils/liveQuizDb'
import './live-quiz.css'

const COLORS = ['red','blue','gold','green'], MARKS = ['▲','◆','●','■']
const q = (text='', options=['','','',''], correct=null) => ({ id: Math.random().toString(36).slice(2,10), q:text, options, correct })
const readDraft = () => { try { return JSON.parse(localStorage.getItem('buga-live-draft')) } catch { return null } }

// The host's screen. Default path is one decision deep: pick a topic and a level, press one button,
// and the room opens with ready questions. Question type, count and time sit under "more settings";
// previewing/editing the questions, or writing your own, opens the editor on request.
function LiveEditor({ onCreate, busy }) {
  const [draft]=useState(readDraft)
  const [title,setTitle]=useState(()=>draft?.title||''),[questions,setQuestions]=useState(()=>draft?.questions?.length?draft.questions:[q()]),[seconds,setSeconds]=useState(()=>draft?.seconds||20),[error,setError]=useState('')
  const [topic,setTopic]=useState('mixed'),[difficulty,setDifficulty]=useState('medium'),[mode,setMode]=useState('regular'),[questionCount,setQuestionCount]=useState(6)
  const hasDraft=Boolean(draft?.questions?.some(item=>item.q?.trim()))
  const [editing,setEditing]=useState(false),[allTopics,setAllTopics]=useState(false)
  useEffect(()=>{const t=setTimeout(()=>{try{localStorage.setItem('buga-live-draft',JSON.stringify({title,questions,seconds}))}catch{/* ignore */}},500);return()=>clearTimeout(t)},[title,questions,seconds])
  const patch=(i,data)=>setQuestions(all=>all.map((item,n)=>n===i?{...item,...data}:item))
  const option=(i,j,value)=>patch(i,{options:questions[i].options.map((x,n)=>n===j?value:x)})
  const move=(i,d)=>{const all=[...questions],n=i+d;if(n<0||n>=all.length)return;[all[i],all[n]]=[all[n],all[i]];setQuestions(all)}
  // Fresh questions for the chosen topic/level (never repeating ones this device already played).
  const generate=()=>{
    const key=`buga-live-generated-${topic}-${difficulty}`
    let previous=[];try{const raw=localStorage.getItem(key);previous=raw?(raw.startsWith('[')?JSON.parse(raw):raw):[]}catch{/* private mode */}
    const game=buildLiveQuiz(topic,difficulty,questionCount,previous,Math.random,mode)
    try{localStorage.setItem(key,JSON.stringify(game.history))}catch{/* private mode */}
    return game
  }
  const quickStart=()=>{const game=generate();setError('');onCreate({title:game.title,questions:game.questions,seconds})}
  const preview=()=>{const game=generate();setTitle(game.title);setQuestions(game.questions);setError('');setEditing(true)}
  const writeOwn=()=>{if(!hasDraft){setTitle('');setQuestions([q()])}setError('');setEditing(true)}
  const submit=e=>{e.preventDefault();const problem=liveQuestionProblem(questions);setError(problem);if(!problem)onCreate({title:title.trim()||'משחק חדש',questions:questions.map(item=>({...item,q:item.q.trim(),options:item.options.map(x=>x.trim())})),seconds})}
  const current=LIVE_QUIZ_TOPICS.find(item=>item.id===topic)

  if(!editing)return <section className="live-generator live-quick" aria-labelledby="live-quick-title">
    <h3 id="live-quick-title" className="live-step"><b>1</b> על מה החידון?</h3>
    <div className="live-topic-grid">{(allTopics?LIVE_QUIZ_TOPICS:LIVE_QUIZ_TOPICS.filter((item,i)=>i<4||item.id===topic)).map(item=><button type="button" key={item.id} aria-pressed={topic===item.id} style={{'--topic-color':item.color}} onClick={()=>setTopic(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</div>
    {!allTopics&&LIVE_QUIZ_TOPICS.length>4&&<button type="button" className="live-more-topics" onClick={()=>setAllTopics(true)}>עוד נושאים ({LIVE_QUIZ_TOPICS.length-4}) ▾</button>}
    <h3 className="live-step"><b>2</b> באיזו רמה?</h3>
    <div className="live-levels" role="group" aria-label="רמת קושי">{LIVE_QUIZ_DIFFICULTIES.map(item=><button type="button" key={item.id} aria-pressed={difficulty===item.id} onClick={()=>setDifficulty(item.id)}><span>{item.icon} {item.label}</span><small>{item.description}</small></button>)}</div>
    <details className="live-more"><summary>⚙️ הגדרות נוספות <small>{LIVE_QUIZ_MODES.find(m=>m.id===mode)?.label} · {questionCount} שאלות · {seconds} שניות לשאלה</small></summary>
      <fieldset className="live-mode-picker"><legend>סוג השאלות</legend>{LIVE_QUIZ_MODES.map(item=><button type="button" key={item.id} aria-pressed={mode===item.id} onClick={()=>setMode(item.id)}><span>{item.label}</span><small>{item.description}</small></button>)}</fieldset>
      <div className="live-more-row"><label>מספר שאלות<select value={questionCount} onChange={e=>setQuestionCount(+e.target.value)}>{[5,6,7,8].map(n=><option value={n} key={n}>{n} שאלות</option>)}</select></label>
        <label>זמן לכל שאלה<select value={seconds} onChange={e=>setSeconds(+e.target.value)}>{[5,10,15,20,30,45,60].map(n=><option key={n} value={n}>{n} שניות</option>)}</select></label></div>
    </details>
    <button type="button" className="live-create live-go" disabled={busy} onClick={quickStart}>{busy?'פותחים את החדר…':<>פותחים חדר ← {current?.icon} {current?.label}, {questionCount} שאלות</>}</button>
    <p className="live-alt-links"><button type="button" onClick={preview}>להציץ בשאלות לפני</button> · <button type="button" onClick={writeOwn}>{hasDraft?'להמשיך את השאלות שלי':'לכתוב שאלות משלי'}</button></p>
  </section>

  return <form className="live-editor" onSubmit={submit}>
    <button type="button" className="live-back" onClick={()=>setEditing(false)}>→ חזרה לבחירת נושא</button>
    <div className="live-editor-top"><label>שם המשחק<input value={title} maxLength={80} onChange={e=>setTitle(e.target.value)} placeholder="למשל: החידון של כיתה ג׳2" /></label>
      <label>זמן לכל שאלה<select value={seconds} onChange={e=>setSeconds(+e.target.value)}>{[5,10,15,20,30,45,60].map(n=><option key={n} value={n}>{n} שניות</option>)}</select></label></div>
    {questions.map((item,i)=><fieldset className="live-question-edit" key={item.id}><legend>שאלה {i+1}</legend>
      <textarea value={item.q} maxLength={240} rows={2} onChange={e=>patch(i,{q:e.target.value})} placeholder="מה תרצו לשאול?" aria-label={`נוסח שאלה ${i+1}`} />
      {item.verified&&item.source&&<a className="live-question-source" href={item.source.url} target="_blank" rel="noopener noreferrer">✓ מקור לבדיקה — {item.source.label} ↗</a>}
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
    <p className="live-save-note">הטיוטה נשמרת אוטומטית במכשיר • עד 50 שאלות • לסימון התשובה הנכונה לוחצים על הסימן שלידה</p>
    {error&&<p className="live-error" role="alert">{error}</p>}
    <div className="live-create-quick"><div><b>מוכנים?</b><span>{questions.length} שאלות · פותחים חדר ומקבלים קוד ו־QR</span></div><button className="live-create" disabled={busy}>{busy?'פותחים את חדר המשחק…':'🚀 פתיחת חדר המשחק'}</button></div>
  </form>
}

export default function LiveQuizHome(){
 const nav=useNavigate(),[tab,setTab]=useState('start'),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const owned=liveMemory.owned()
 const create=async quiz=>{setBusy(true);setError('');try{const token=newLiveToken(),gameCode=await liveQuizDb.create(token,quiz.title,quiz.questions,quiz.seconds);liveMemory.rememberHost(gameCode,token,quiz.title);localStorage.removeItem('buga-live-draft');nav(`/live/${gameCode}/host`)}catch(e){setError(liveErrorText(e.code))}finally{setBusy(false)}}
 const join=e=>{e.preventDefault();const value=cleanCode(code);if(value.length===6)nav(`/play/${value}`);else setError('קוד משחק מכיל 6 אותיות ומספרים.')}
 return <div className="live-home">
  <SEO title="בוגה לייב — משחק לכיתה עם עד 100 משתתפים" description="יוצרים משחק שאלות, מצטרפים מהטלפון עם QR ורואים תוצאות בזמן אמת — בלי צורך בחשבון." path="/live" />
  <div className="live-home-inner"><Breadcrumbs items={[{label:'בית',href:'/'},{label:'משחקים',href:'/games'},{label:'בוגה לייב'}]} />
   <header className="live-hero live-hero-compact"><div className="live-logo-orb">B!</div><h1>בוגה לייב</h1><h2>חידון לכל הכיתה: אתם על המסך, כולם עונים מהטלפון</h2>
    <p className="live-hero-line">עד 100 משתתפים · כניסה עם <bdi>QR</bdi> · {getLiveQuizBankStats().total.toLocaleString('he-IL')} שאלות בדוקות · בלי חשבון</p></header>
   <div className="live-tabbar"><button aria-pressed={tab==='start'} onClick={()=>setTab('start')}>🎤 אני מנחה</button><button aria-pressed={tab==='join'} onClick={()=>setTab('join')}>📱 יש לי קוד</button></div>
   {error&&<p className="live-error" role="alert">{error}</p>}
   {tab==='join'?<section className="live-join-card"><span>🎮</span><h2>יש לכם קוד?</h2><p>הקלידו את קוד המשחק שקיבלתם מהמנחה</p><form onSubmit={join}><input dir="ltr" inputMode="text" autoCapitalize="characters" value={code} onChange={e=>setCode(cleanCode(e.target.value))} maxLength={12} placeholder="ABC123" aria-label="קוד משחק" autoFocus/><button>כניסה</button></form></section>
   :<><section className="live-builder"><LiveEditor onCreate={create} busy={busy}/></section>
    {owned.length>0&&<section className="live-owned"><h2>המשחקים שלי</h2><div>{owned.slice(0,6).map(game=><Link key={game.code} to={`/live/${game.code}/host`}><b>{game.title}</b><span dir="ltr">{game.code}</span></Link>)}</div></section>}
    </>}
  </div>
 </div>
}
