import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import { MathText } from '../components/quiz/QuizEditor'
import { liveMemory, liveQuizDb } from '../utils/liveQuizDb'
import useLiveCountdown from '../pages/live/useLiveCountdown'
import '../pages/live/live-quiz.css'

const COLORS=['red','blue','gold','green'],MARKS=['▲','◆','●','■']
const englishError=code=>({game_not_found:'We could not find this game.',not_owner:'This host link is not valid on this device.'}[code]||'The connection was interrupted. Please try again.')
function useQr(text){const[svg,setSvg]=useState('');useEffect(()=>{import('qrcode').then(({default:Q})=>Q.toString(text,{type:'svg',margin:1,width:240,color:{dark:'#111633',light:'#ffffff'}})).then(setSvg).catch(()=>{})},[text]);return svg}
function Leaders({rows=[],limit=10}){return <ol className="live-leaders">{rows.slice(0,limit).map((p,i)=><li key={`${p.name}-${i}`}><b>{p.rank||i+1}</b><span>{p.name}</span><strong>{p.score.toLocaleString('en-US')}</strong></li>)}</ol>}
export default function EnglishLiveHost(){
 const {code}=useParams(),[token]=useState(()=>{const hash=/#k=([\w-]+)/.exec(location.hash)?.[1];if(hash){liveMemory.rememberHost(code,hash,'Live quiz');history.replaceState(null,'',location.pathname)}return hash||liveMemory.hostToken(code)})
 const[data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[copied,setCopied]=useState(''),auto=useRef('')
 const playLink=`${location.origin}/en/play/${code}`,hostLink=`${location.origin}/en/live/${code}/host#k=${token}`,qr=useQr(playLink),left=useLiveCountdown(data?.ends_at)
 const load=useCallback(()=>token&&liveQuizDb.host(code,token).then(d=>{setData(d);setError('');liveMemory.rememberHost(code,token,d.title)}).catch(e=>setError(englishError(e.code))),[code,token])
 useEffect(()=>{load();const id=setInterval(()=>{if(document.visibilityState==='visible')load()},1200);return()=>clearInterval(id)},[load])
 useEffect(()=>{if(data?.phase==='question'&&left===0&&data.ends_at&&auto.current!==`${data.question_index}`){auto.current=`${data.question_index}`;liveQuizDb.action(code,token,'timeout').then(load).catch(()=>{auto.current='';load()})}},[data?.phase,data?.question_index,data?.ends_at,left,code,token,load])
 const act=async action=>{setBusy(true);setError('');try{await liveQuizDb.action(code,token,action);await load()}catch(e){setError(englishError(e.code))}finally{setBusy(false)}}
 const copy=(text,key)=>navigator.clipboard?.writeText(text).then(()=>{setCopied(key);setTimeout(()=>setCopied(''),1600)})
 if(!token)return <div className="live-missing"><h1>Host link missing</h1><Link to="/en/live">Create a new game</Link></div>
 if(error&&!data)return <div className="live-missing"><h1>We could not open the game</h1><p>{error}</p><Link to="/en/live">Back to Buga Live</Link></div>
 if(!data)return <div className="live-stage live-loading">Loading game…</div>
 const idx=data.question_index,q=data.questions[idx],isLast=idx===data.questions.length-1,total=data.players.length
 return <main className={`live-stage phase-${data.phase}`} dir="ltr"><SEO lang="en" title={`Host: ${data.title}`} path={`/en/live/${code}/host`} noindex/>
  <header className="live-stage-head"><Link to="/en/live" className="live-stage-brand"><i>B!</i><span>Buga Live</span></Link><div><b>{data.title}</b><span>Game code <strong>{code}</strong></span></div><button onClick={()=>document.documentElement.requestFullscreen?.().catch(()=>{})}>Full screen</button></header>
  {error&&<p className="live-error stage-error">{error}</p>}
  {data.phase==='lobby'&&<section className="live-lobby"><div className="live-lobby-main"><p>Players join at</p><h1>{code}</h1><span className="live-url">ugabuga.co.il/en/play/{code}</span><div className="live-share-buttons"><button onClick={()=>copy(playLink,'play')}>{copied==='play'?'Copied!':'Copy player link'}</button><button onClick={()=>copy(hostLink,'host')}>{copied==='host'?'Copied!':'Copy private host link'}</button></div></div>{qr&&<div className="live-qr" dangerouslySetInnerHTML={{__html:qr}} role="img" aria-label="QR code to join the game"/>}<div className="live-player-lobby"><h2><span>{total}</span> players joined</h2>{total?<div>{data.players.map(p=><span key={p.id}>{p.name}</span>)}</div>:<p>Waiting for the first player to scan the QR code.</p>}</div><button className="live-start-button" disabled={!total||busy} onClick={()=>act('start')}>{total?'Start game':'Waiting for players'}</button></section>}
  {data.phase==='question'&&q&&<section className="live-question-stage"><div className="live-stage-meta"><span>Question {idx+1} of {data.questions.length}</span><strong className={left!==null&&left<=5?'urgent':''}>{left??'·'}</strong><span>{data.answer_count}/{total} answered</span></div><h1><MathText>{q.q}</MathText></h1><div className="live-host-options">{q.options.map((option,i)=><div className={`live-answer ${COLORS[i]}`} key={i}><b>{MARKS[i]}</b><span><MathText>{option}</MathText></span></div>)}</div><button className="live-reveal-now" disabled={busy} onClick={()=>act('reveal')}>Show answer now</button></section>}
  {data.phase==='reveal'&&q&&<section className="live-reveal-stage"><div className="live-stage-meta"><span>Question {idx+1}</span><strong>Answer</strong><span>{data.answer_count}/{total} answered</span></div><h1><MathText>{q.q}</MathText></h1><div className="live-result-grid"><div className="live-results-options">{q.options.map((option,i)=><div className={`live-answer ${COLORS[i]} ${q.correct===i?'correct':'dim'}`} key={i}><b>{q.correct===i?'✓':MARKS[i]}</b><span><MathText>{option}</MathText></span><em>{data.counts[i]||0}</em></div>)}</div><aside><h2>Leaderboard</h2><Leaders rows={data.leaderboard} limit={5}/></aside></div><button className="live-start-button" disabled={busy} onClick={()=>act(isLast?'finish':'next')}>{isLast?'Final results':'Next question'}</button></section>}
  {data.phase==='finished'&&<section className="live-finish-stage"><p>🏆 Final results</p><h1>{data.title}</h1><Leaders rows={data.leaderboard}/><div className="live-finish-actions"><button onClick={()=>act('reset')} disabled={busy}>Play again</button><Link to="/en/live">Create another game</Link></div></section>}
 </main>
}
