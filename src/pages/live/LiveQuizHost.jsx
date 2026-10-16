import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { MathText } from '../../components/quiz/QuizEditor'
import { liveErrorText, liveHostLink, liveMemory, livePlayLink, liveQuizDb } from '../../utils/liveQuizDb'
import useLiveCountdown from './useLiveCountdown'
import './live-quiz.css'

const COLORS=['red','blue','gold','green'],MARKS=['','?','?','�']
function useQr(text){const[svg,setSvg]=useState('');useEffect(()=>{import('qrcode').then(({default:Q})=>Q.toString(text,{type:'svg',margin:1,width:240,color:{dark:'#111633',light:'#ffffff'}})).then(setSvg).catch(()=>{})},[text]);return svg}
function Leaderboard({rows=[],limit=10}){return <ol className="live-leaders">{rows.slice(0,limit).map((p,i)=><li key={`${p.name}-${i}`}><b>{p.rank||i+1}</b><span>{p.name}</span><strong>{p.score.toLocaleString('he-IL')}</strong></li>)}</ol>}

export default function LiveQuizHost(){
 const {code}=useParams(),[token]=useState(()=>{const hash=/#k=([\w-]+)/.exec(location.hash)?.[1];if(hash){liveMemory.rememberHost(code,hash,'���� ����');history.replaceState(null,'',location.pathname)}return hash||liveMemory.hostToken(code)})
 const[data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[copied,setCopied]=useState(''),auto=useRef('')
 const playLink=livePlayLink(code),qr=useQr(playLink),left=useLiveCountdown(data?.ends_at)
 const load=useCallback(()=>token&&liveQuizDb.host(code,token).then(d=>{setData(d);setError('');liveMemory.rememberHost(code,token,d.title)}).catch(e=>setError(liveErrorText(e.code))),[code,token])
 useEffect(()=>{load();const id=setInterval(()=>{if(document.visibilityState==='visible')load()},1200);return()=>clearInterval(id)},[load])
 useEffect(()=>{if(data?.phase==='question'&&left===0&&data.ends_at&&auto.current!==`${data.question_index}`){auto.current=`${data.question_index}`;liveQuizDb.action(code,token,'timeout').then(load).catch(()=>{auto.current='';load()})}},[data?.phase,data?.question_index,data?.ends_at,left,code,token,load])
 const act=async action=>{setBusy(true);setError('');try{await liveQuizDb.action(code,token,action);await load()}catch(e){setError(liveErrorText(e.code))}finally{setBusy(false)}}
 const copy=(text,key)=>navigator.clipboard?.writeText(text).then(()=>{setCopied(key);setTimeout(()=>setCopied(''),1600)})
 const fullscreen=()=>document.documentElement.requestFullscreen?.().catch(()=>{})
 if(!token)return <div className="live-missing"><SEO title="����� ���� ����" path={`/live/${code}/host`} noindex/><h1>����� ������ ���</h1><p>���� �� ����� ������� ��� ����� ���� �� ������ ������ ������.</p><Link to="/live">���� ����� ����</Link></div>
 if(error&&!data)return <div className="live-missing"><SEO title="����� ���� ����" path={`/live/${code}/host`} noindex/><h1>�� ������ ����� �� �����</h1><p>{error}</p><Link to="/live">����� ���� ���</Link></div>
 if(!data)return <div className="live-stage live-loading">������ �� ����.</div>
 const idx=data.question_index,q=data.questions[idx],isLast=idx===data.questions.length-1,total=data.players.length
 return <main className={`live-stage phase-${data.phase}`}><SEO title={`�����: ${data.title}`} path={`/live/${code}/host`} noindex/>
  <header className="live-stage-head"><Link to="/live" className="live-stage-brand"><i>B!</i><span>���� ����</span></Link><div><b>{data.title}</b><span>��� ���� <strong dir="ltr">{code}</strong></span></div><button onClick={fullscreen}>? ��� ���</button></header>
  {error&&<p className="live-error stage-error" role="alert">{error}</p>}
  {data.phase==='lobby'&&<section className="live-lobby">
    <div className="live-lobby-main"><p>�������� ������ ��������</p><h1 dir="ltr">{code}</h1><span className="live-url" dir="ltr">ugabuga.co.il/play/{code}</span>
      <div className="live-share-buttons"><button onClick={()=>copy(playLink,'play')}>{copied==='play'?'� �����':'����� ����� �������'}</button><a href={`https://wa.me/?text=${encodeURIComponent(`?? ������� ����� ����: ${data.title}\n���: ${code}\n${playLink}`)}`} target="_blank" rel="noopener">����� ��������</a><button onClick={()=>copy(liveHostLink(code,token),'host')}>{copied==='host'?'� ����':'����� ����� �����'}</button></div>
    </div>{qr&&<div className="live-qr" dangerouslySetInnerHTML={{__html:qr}} role="img" aria-label="QR �������� �����"/>}
    <div className="live-player-lobby"><h2><span>{total}</span> ������� �����</h2>{total?<div>{data.players.map((p,i)=><span style={{'--delay':`${Math.min(i,15)*35}ms`}} key={p.id}>{p.name}</span>)}</div>:<p>��� ������ ����� ��� ��� ���� ��������.</p>}</div>
    <button className="live-start-button" disabled={!total||busy} onClick={()=>act('start')}>{!total?'����� ������ ������.':'������� �� �����'} <span></span></button>
  </section>}
  {data.phase==='question'&&q&&<section className="live-question-stage"><div className="live-stage-meta"><span>���� {idx+1} ���� {data.questions.length}</span><strong className={left!==null&&left<=5?'urgent':''}>{left??'.'}</strong><span>{data.answer_count}/{total} ���</span></div>
    <h1><MathText>{q.q}</MathText></h1><div className="live-host-options">{q.options.map((option,i)=><div className={`live-answer ${COLORS[i]}`} key={i}><b>{MARKS[i]}</b><span><MathText>{option}</MathText></span></div>)}</div>
    <div className="live-timer-track"><span style={{width:`${left===null?100:Math.max(0,left)/(data.settings.seconds||20)*100}%`}}/></div><button className="live-reveal-now" disabled={busy} onClick={()=>act('reveal')}>���� ����� ������ ������</button>
  </section>}
  {data.phase==='reveal'&&q&&<section className="live-reveal-stage"><div className="live-stage-meta"><span>���� {idx+1} ���� {data.questions.length}</span><strong>������ �����</strong><span>{data.answer_count}/{total} ���</span></div>
    <h1><MathText>{q.q}</MathText></h1><div className="live-result-grid"><div className="live-results-options">{q.options.map((option,i)=><div className={`live-answer ${COLORS[i]} ${q.correct===i?'correct':'dim'}`} key={i}><b>{q.correct===i?'�':MARKS[i]}</b><span><MathText>{option}</MathText></span><em>{data.counts[i]||0}</em></div>)}</div>
      <aside><h2>��� ��������</h2><Leaderboard rows={data.leaderboard} limit={5}/></aside></div>
    <button className="live-start-button" disabled={busy} onClick={()=>act(isLast?'finish':'next')}>{isLast?'������� �������':'����� ����'} <span></span></button>
  </section>}
  {data.phase==='finished'&&<section className="live-finish-stage"><p>?? ������� �������</p><h1>{data.title}</h1>{data.leaderboard.length?<Leaderboard rows={data.leaderboard}/>:<p>����� ��� ������.</p>}
    <div className="live-finish-actions"><button onClick={()=>act('reset')} disabled={busy}>���� ���� �� ���� ������</button><Link to="/live">����� ���� ���</Link></div></section>}
 </main>
}

