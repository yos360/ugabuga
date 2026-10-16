import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { MathText } from '../../components/quiz/QuizEditor'
import { liveErrorText, liveMemory, liveQuizDb, newLiveToken } from '../../utils/liveQuizDb'
import useLiveCountdown from './useLiveCountdown'
import './live-quiz.css'

const COLORS=['red','blue','gold','green'],MARKS=['','?','?','�']

export default function LiveQuizPlay(){
 const {code}=useParams(),saved=liveMemory.player(code),[state,setState]=useState(null),[player,setPlayer]=useState(null),[token,setToken]=useState(saved?.token||''),[name,setName]=useState(saved?.name||''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[connection,setConnection]=useState('CONNECTING')
 const left=useLiveCountdown(state?.ends_at),payload=state?.payload||{},index=state?.question_index??-1
 const refreshPlayer=useCallback((t=token)=>t&&liveQuizDb.player(code,t).then(setPlayer).catch(()=>{}),[code,token])
 useEffect(()=>{let alive=true;liveQuizDb.state(code).then(s=>alive&&setState(s)).catch(e=>alive&&setError(liveErrorText(e.code)));const stop=liveQuizDb.watch(code,s=>{if(alive){setState(s);setError('');refreshPlayer()}},setConnection);return()=>{alive=false;stop()}},[code,refreshPlayer])
 useEffect(()=>{if(token)refreshPlayer()},[token,refreshPlayer])
 const join=async e=>{e.preventDefault();if(!name.trim()){setError('���� ����� �����.');return}setBusy(true);setError('');try{const t=token||newLiveToken();await liveQuizDb.join(code,t,name.trim());liveMemory.rememberPlayer(code,t,name.trim());setToken(t);await Promise.all([liveQuizDb.state(code).then(setState),liveQuizDb.player(code,t).then(setPlayer)])}catch(err){setError(liveErrorText(err.code))}finally{setBusy(false)}}
 const answer=async option=>{if(busy||player?.answered)return;setBusy(true);setError('');try{await liveQuizDb.answer(code,token,index,option);await refreshPlayer()}catch(e){setError(liveErrorText(e.code));await refreshPlayer()}finally{setBusy(false)}}
 if(error&&!state)return <main className="live-player-screen"><SEO title="����� ����� ����" path={`/play/${code}`} noindex/><div className="live-player-card"><i className="live-mini-logo">B!</i><h1>�� ������ ������</h1><p>{error}</p><Link to="/live">���� ������ �����</Link></div></main>
 if(!state)return <main className="live-player-screen live-loading">������� �����.</main>
 if(!player)return <main className="live-player-screen lobby-bg"><SEO title={`����� ����� ${code} - ���� ����`} path={`/play/${code}`} noindex/><form className="live-player-card" onSubmit={join}><i className="live-mini-logo">B!</i><p className="live-player-code">��� <b dir="ltr">{code}</b></p><h1>{payload.title||'���� ����'}</h1><label>��� ����� ��� �����?<input value={name} onChange={e=>setName(e.target.value)} maxLength={24} autoFocus autoComplete="nickname" placeholder="�����" /></label>{error&&<p className="live-error" role="alert">{error}</p>}<button disabled={busy}>{busy?'�������.':'��� �����!'}</button><small>���� �� ���� �� �����. ��� ���� �������� ���� ��������.</small></form></main>
 const connectionNote=connection!=='SUBSCRIBED'?<span className="live-connection">������� ����.</span>:null
 if(state.phase==='lobby')return <main className="live-player-screen lobby-bg"><div className="live-player-card wait-card"><i className="live-mini-logo">B!</i><p>��� {player.name} ??</p><h1>��� �����!</h1><div className="live-wait-dots"><b/><b/><b/></div><h2>����� ������ �����</h2><span>{payload.player_count||1} ������� ��� ������</span>{connectionNote}</div></main>
 if(state.phase==='question')return <main className="live-player-screen question-bg"><div className="live-player-top"><span>{player.name}</span><b>{player.score.toLocaleString('he-IL')} ��?</b><span>���� {payload.index}/{payload.total}</span></div>
  <section className="live-player-question"><div className={`live-player-clock ${left!==null&&left<=5?'urgent':''}`}>{left??'.'}</div><h1><MathText>{payload.question?.q}</MathText></h1>
   {player.answered?<div className="live-locked"><strong>� ������ �����</strong><p>����� ���� �������� ������� ������.</p><div className={`live-answer ${COLORS[player.option]}`}><b>{MARKS[player.option]}</b><span><MathText>{payload.question?.options?.[player.option]}</MathText></span></div></div>
   :<div className="live-player-options">{payload.question?.options?.map((option,i)=><button className={`live-answer ${COLORS[i]}`} key={i} onClick={()=>answer(i)} disabled={busy||left===0}><b>{MARKS[i]}</b><span><MathText>{option}</MathText></span></button>)}</div>}{error&&<p className="live-error" role="alert">{error}</p>}{connectionNote}</section></main>
 if(state.phase==='reveal')return <main className={`live-player-screen reveal-bg ${player.correct?'player-right':'player-wrong'}`}><div className="live-player-top"><span>{player.name}</span><b>{player.score.toLocaleString('he-IL')} ��?</b><span>���� {player.rank}</span></div><section className="live-player-reveal">
   <div className="live-result-icon">{player.answered?(player.correct?'�':'x'):'?'}</div><h1>{!player.answered?'���� ����':player.correct?'����� �����!':'����.'}</h1><p>{player.correct?`+${player.points} ������`:!player.answered?'�� ����� ����� ����� ����':'������ ������ ������ �����'}</p>
   <div className="live-player-options compact">{payload.question?.options?.map((option,i)=><div className={`live-answer ${COLORS[i]} ${payload.correct===i?'correct':'dim'}`} key={i}><b>{payload.correct===i?'�':MARKS[i]}</b><span><MathText>{option}</MathText></span></div>)}</div>
   <div className="live-rank-card"><span>������ ����</span><b>{player.rank}</b><em>{player.score.toLocaleString('he-IL')} ������</em></div><small>����� ���� ����� ��� ��������</small>{connectionNote}</section></main>
 return <main className="live-player-screen finish-bg"><section className="live-player-finish"><i className="live-mini-logo">B!</i><p>����� ������</p><h1>{payload.title}</h1><div className="live-podium">{payload.leaderboard?.slice(0,3).map((p,i)=><div key={p.name} className={`place-${i+1}`}><b>{i===0?'??':i===1?'??':'??'}</b><span>{p.name}</span><strong>{p.score.toLocaleString('he-IL')}</strong></div>)}</div><div className="live-final-self"><span>{player.name}</span><b>���� {player.rank}</b><strong>{player.score.toLocaleString('he-IL')} ������</strong></div><Link to="/live">����� ����� ���� �����?</Link></section></main>
}

