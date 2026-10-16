import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { buildLiveQuiz, LIVE_QUIZ_DIFFICULTIES, LIVE_QUIZ_TOPICS } from '../../data/liveQuizPacks'
import { cleanCode, liveErrorText, liveMemory, liveQuestionProblem, liveQuizDb, newLiveToken } from '../../utils/liveQuizDb'
import './live-quiz.css'

const COLORS = ['red','blue','gold','green'], MARKS = ['','?','?','�']
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
    let previous='';try{previous=localStorage.getItem(key)||''}catch{/* private mode */}
    const game=buildLiveQuiz(topic,difficulty,questionCount,previous)
    setTitle(game.title);setQuestions(game.questions.map(item=>({...item,id:Math.random().toString(36).slice(2,10)})));setError('');setGenerated(`${game.topic.icon} ���� ���� ${game.topic.label} ���� ${game.difficulty.label}`)
    try{localStorage.setItem(key,game.signature)}catch{/* private mode */}
  }
  const submit=e=>{e.preventDefault();const problem=liveQuestionProblem(questions);setError(problem);if(!problem)onCreate({title:title.trim()||'����� ���',questions:questions.map(item=>({...item,q:item.q.trim(),options:item.options.map(x=>x.trim())})),seconds})}
  return <form className="live-editor" onSubmit={submit}>
    <section className="live-generator" aria-labelledby="live-generator-title">
      <div className="live-generator-head"><div><span>? ������ ������</span><h3 id="live-generator-title">������ ���� ���� - ������� ���� ��� ��� ���</h3></div><b>{questionCount} �����</b></div>
      <div className="live-topic-grid">{LIVE_QUIZ_TOPICS.map(item=><button type="button" key={item.id} aria-pressed={topic===item.id} style={{'--topic-color':item.color}} onClick={()=>setTopic(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</div>
      <div className="live-generator-settings"><fieldset><legend>��� ����</legend>{LIVE_QUIZ_DIFFICULTIES.map(item=><button type="button" key={item.id} aria-pressed={difficulty===item.id} onClick={()=>setDifficulty(item.id)}><span>{item.icon} {item.label}</span><small>{item.description}</small></button>)}</fieldset>
        <label>���� �����<select value={questionCount} onChange={e=>setQuestionCount(+e.target.value)}>{[5,6,7,8].map(n=><option value={n} key={n}>{n} �����</option>)}</select></label>
        <button type="button" className="live-generate" onClick={generate}>?? ��� �� ���� ���</button></div>
      {generated&&<p className="live-generated-note" role="status">� {generated}. ���� ����� �� ���� ���� ��������.</p>}
    </section>
    <div className="live-custom-divider"><span>����� �����</span></div>
    <div className="live-editor-top"><label>�� �����<input value={title} maxLength={80} onChange={e=>setTitle(e.target.value)} placeholder="����: ������ �� ���� �?2" /></label>
      <label>��� ��� ����<select value={seconds} onChange={e=>setSeconds(+e.target.value)}>{[5,10,15,20,30,45,60].map(n=><option key={n} value={n}>{n} �����</option>)}</select></label></div>
    {questions.map((item,i)=><fieldset className="live-question-edit" key={item.id}><legend>���� {i+1}</legend>
      <textarea value={item.q} maxLength={240} rows={2} onChange={e=>patch(i,{q:e.target.value})} placeholder="�� ���� �����?" aria-label={`���� ���� ${i+1}`} />
      <div className="live-option-edit">{item.options.map((answer,j)=><div className={`live-answer edit ${COLORS[j]}`} key={j}>
        <button type="button" onClick={()=>patch(i,{correct:j})} aria-label={`����� ����� ${j+1} ������`} aria-pressed={item.correct===j}>{item.correct===j?'�':MARKS[j]}</button>
        <input value={answer} maxLength={120} onChange={e=>option(i,j,e.target.value)} placeholder={`����� ${j+1}`} />
        {item.options.length>2&&<button type="button" className="live-remove" onClick={()=>patch(i,{options:item.options.filter((_,n)=>n!==j),correct:item.correct===j?null:item.correct>j?item.correct-1:item.correct})} aria-label="����� �����">x</button>}
      </div>)}</div>
      <div className="live-edit-actions">{item.options.length<4&&<button type="button" onClick={()=>patch(i,{options:[...item.options,'']})}>+ �����</button>}<span />
        <button type="button" onClick={()=>move(i,-1)} disabled={!i}></button><button type="button" onClick={()=>move(i,1)} disabled={i===questions.length-1}></button>
        <button type="button" onClick={()=>setQuestions(all=>[...all.slice(0,i+1),{...item,id:Math.random().toString(36).slice(2,10),options:[...item.options]},...all.slice(i+1)])}>�����</button>
        {questions.length>1&&<button type="button" className="danger" onClick={()=>setQuestions(all=>all.filter((_,n)=>n!==i))}>�����</button>}
      </div></fieldset>)}
    <div className="live-editor-buttons">{questions.length<50&&<button type="button" className="live-add-question" onClick={()=>setQuestions(all=>[...all,q()])}>+ ���� ����</button>}</div>
    <p className="live-save-note">������ ����� �������� ������ � �� 50 �����</p>
    {error&&<p className="live-error" role="alert">{error}</p>}
    <button className="live-create" disabled={busy}>{busy?'������ �� ��� �����.':'?? ����� ���� ��'}</button>
  </form>
}

export default function LiveQuizHome(){
 const nav=useNavigate(),[tab,setTab]=useState('start'),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const owned=liveMemory.owned()
 const create=async quiz=>{setBusy(true);setError('');try{const token=newLiveToken(),gameCode=await liveQuizDb.create(token,quiz.title,quiz.questions,quiz.seconds);liveMemory.rememberHost(gameCode,token,quiz.title);localStorage.removeItem('buga-live-draft');nav(`/live/${gameCode}/host`)}catch(e){setError(liveErrorText(e.code))}finally{setBusy(false)}}
 const join=e=>{e.preventDefault();const value=cleanCode(code);if(value.length===6)nav(`/play/${value}`);else setError('���� ���� ����� 6 ������ ������.')}
 return <main className="live-home">
  <SEO title="���� ���� - ���� ����� �� �� 100 �������" description="������ ���� �����, ������� ������� �� QR ��� ��� ������ ����� ��� ���� ���." path="/live" />
  <div className="live-home-inner"><Breadcrumbs items={[{label:'���',href:'/'},{label:'������',href:'/games'},{label:'���� ����'}]} />
   <header className="live-hero"><div className="live-logo-orb">B!</div><p>����� ����, ��� �����</p><h1>���� ����</h1><h2>������ ����, ����� ���� ���</h2>
    <div className="live-hero-pills"><span>?? �� 100 �������</span><span>?? ����� �� QR</span><span>?? ����� ��</span><span>? ��� �����</span></div></header>
   <div className="live-tabbar"><button aria-pressed={tab==='start'} onClick={()=>setTab('start')}>����� ����</button><button aria-pressed={tab==='join'} onClick={()=>setTab('join')}>����� �����</button></div>
   {error&&<p className="live-error" role="alert">{error}</p>}
   {tab==='join'?<section className="live-join-card"><span>??</span><h2>�� ��� ���?</h2><p>������ �� ���� ������� ����� �����</p><form onSubmit={join}><input dir="ltr" inputMode="text" autoCapitalize="characters" value={code} onChange={e=>setCode(cleanCode(e.target.value))} maxLength={12} placeholder="ABC123" aria-label="��� ����" autoFocus/><button>�����</button></form></section>
   :<><section className="live-how"><div><b>1</b><span>������ ����</span></div><div><b>2</b><span>������ QR</span></div><div><b>3</b><span>���� �����</span></div><div><b>4</b><span>����� ������</span></div></section>
    {owned.length>0&&<section className="live-owned"><h2>������� ���</h2><div>{owned.slice(0,6).map(game=><Link key={game.code} to={`/live/${game.code}/host`}><b>{game.title}</b><span dir="ltr">{game.code}</span></Link>)}</div></section>}
    <section className="live-builder"><div className="live-builder-title"><p>������� ��� ���</p><h2>������ ���� ���</h2><span>���� ���� ���� �� ���� ��� �����. ��� ����� ���� �����.</span></div><LiveEditor onCreate={create} busy={busy}/></section></>}
  </div>
 </main>
}

