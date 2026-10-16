import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { MathText } from '../../components/quiz/QuizEditor'
import { buildLiveQuiz, detectLiveQuizPack, LIVE_QUIZ_DIFFICULTIES, LIVE_QUIZ_TOPICS } from '../../data/liveQuizPacks'
import { liveErrorText, liveHostLink, liveMemory, livePlayLink, liveQuizDb } from '../../utils/liveQuizDb'
import useLiveCountdown from './useLiveCountdown'
import './live-quiz.css'

const COLORS=['red','blue','gold','green'],MARKS=['▲','◆','●','■']
function useQr(text){const[svg,setSvg]=useState('');useEffect(()=>{import('qrcode').then(({default:Q})=>Q.toString(text,{type:'svg',margin:1,width:240,color:{dark:'#111633',light:'#ffffff'}})).then(setSvg).catch(()=>{})},[text]);return svg}
function Leaderboard({rows=[],limit=10}){return <ol className="live-leaders">{rows.slice(0,limit).map((p,i)=><li key={`${p.name}-${i}`}><b>{p.rank||i+1}</b><span>{p.name}</span><strong>{p.score.toLocaleString('he-IL')}</strong></li>)}</ol>}

export default function LiveQuizHost(){
 const {code}=useParams(),[token]=useState(()=>{const hash=/#k=([\w-]+)/.exec(location.hash)?.[1];if(hash){liveMemory.rememberHost(code,hash,'משחק חדש');history.replaceState(null,'',location.pathname)}return hash||liveMemory.hostToken(code)})
 const[data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[copied,setCopied]=useState(''),[replayTopic,setReplayTopic]=useState('general'),[replayDifficulty,setReplayDifficulty]=useState('medium'),auto=useRef(''),finishSeen=useRef(false)
 const playLink=livePlayLink(code),qr=useQr(playLink),left=useLiveCountdown(data?.ends_at)
 const load=useCallback(()=>token&&liveQuizDb.host(code,token).then(d=>{setData(d);setError('');liveMemory.rememberHost(code,token,d.title)}).catch(e=>setError(liveErrorText(e.code))),[code,token])
 useEffect(()=>{load();const id=setInterval(()=>{if(document.visibilityState==='visible')load()},1200);return()=>clearInterval(id)},[load])
 useEffect(()=>{if(data?.phase==='question'&&left===0&&data.ends_at&&auto.current!==`${data.question_index}`){auto.current=`${data.question_index}`;liveQuizDb.action(code,token,'timeout').then(load).catch(()=>{auto.current='';load()})}},[data?.phase,data?.question_index,data?.ends_at,left,code,token,load])
 const detectedPack=detectLiveQuizPack(data?.questions,data?.title)
 useEffect(()=>{
   if(data?.phase!=='finished'){finishSeen.current=false;return}
   if(!finishSeen.current){setReplayTopic(detectedPack?.topicId||'general');setReplayDifficulty(detectedPack?.difficultyId||'medium');finishSeen.current=true}
 },[data?.phase,detectedPack?.topicId,detectedPack?.difficultyId])
 const act=async action=>{setBusy(true);setError('');try{await liveQuizDb.action(code,token,action);await load()}catch(e){setError(liveErrorText(e.code))}finally{setBusy(false)}}
 const freshRound=async(topicId,difficultyId)=>{
   setBusy(true);setError('')
   try{
     const key=`buga-live-generated-${topicId}-${difficultyId}`
     let previous=[];try{const raw=localStorage.getItem(key);previous=raw?(raw.startsWith('[')?JSON.parse(raw):raw):[]}catch{/* private mode */}
     const samePack=topicId===detectedPack?.topicId&&difficultyId===detectedPack?.difficultyId
     const currentIds=samePack?(detectedPack?.questionIds||[]):[]
     previous=[...new Set([...(Array.isArray(previous)?previous:[]),...currentIds])]
     const count=Math.max(3,Math.min(8,data?.questions?.length||6,14-currentIds.length))
     let game=buildLiveQuiz(topicId,difficultyId,count,previous)
     if(game.questions.some(item=>currentIds.includes(item.id)))game=buildLiveQuiz(topicId,difficultyId,count,currentIds)
     await liveQuizDb.replay(code,token,game.title,game.questions,data?.settings?.seconds||20)
     try{localStorage.setItem(key,JSON.stringify(game.history))}catch{/* private mode */}
     await load()
   }catch(e){setError(liveErrorText(e.code))}finally{setBusy(false)}
 }
 const copy=(text,key)=>navigator.clipboard?.writeText(text).then(()=>{setCopied(key);setTimeout(()=>setCopied(''),1600)})
 const fullscreen=()=>document.documentElement.requestFullscreen?.().catch(()=>{})
 if(!token)return <div className="live-missing"><SEO title="ניהול בוגה לייב" path={`/live/${code}/host`} noindex/><h1>הקישור למנחה חסר</h1><p>פתחו את הקישור המלא ששמרתם כדי לנהל את המשחק בבטחה.</p><Link to="/live">יצירת משחק חדש</Link></div>
 if(error&&!data)return <div className="live-missing"><SEO title="ניהול בוגה לייב" path={`/live/${code}/host`} noindex/><h1>לא הצלחנו לפתוח את המשחק</h1><p>{error}</p><Link to="/live">פתיחת משחק חדש</Link></div>
 if(!data)return <div className="live-stage live-loading">מכינים את המשחק…</div>
 const idx=data.question_index,q=data.questions[idx],isLast=idx===data.questions.length-1,total=data.players.length
 const currentTopic=LIVE_QUIZ_TOPICS.find(item=>item.id===detectedPack?.topicId),currentDifficulty=LIVE_QUIZ_DIFFICULTIES.find(item=>item.id===detectedPack?.difficultyId)
 return <main className={`live-stage phase-${data.phase}`}><SEO title={`ניהול: ${data.title}`} path={`/live/${code}/host`} noindex/>
  <header className="live-stage-head"><Link to="/live" className="live-stage-brand"><i>B!</i><span>בוגה לייב</span></Link><div><b>{data.title}</b><span>קוד משחק <strong dir="ltr">{code}</strong></span></div><button onClick={fullscreen}>⛶ מסך מלא</button></header>
  {error&&<p className="live-error stage-error" role="alert">{error}</p>}
  {data.phase==='lobby'&&<section className="live-lobby">
    <div className="live-lobby-main"><p>המשתתפים נכנסים מהטלפון</p><h1 dir="ltr">{code}</h1><span className="live-url" dir="ltr">ugabuga.co.il/play/{code}</span>
      <div className="live-share-buttons"><button onClick={()=>copy(playLink,'play')}>{copied==='play'?'✓ הועתק':'העתקת קישור למשתתפים'}</button><a href={`https://wa.me/?text=${encodeURIComponent(`🎮 מצטרפים לבוגה לייב: ${data.title}\nקוד: ${code}\n${playLink}`)}`} target="_blank" rel="noopener">שליחה בוואטסאפ</a><button onClick={()=>copy(liveHostLink(code,token),'host')}>{copied==='host'?'✓ הועתק':'העתקת קישור למנחה'}</button></div>
    </div>{qr&&<div className="live-qr" dangerouslySetInnerHTML={{__html:qr}} role="img" aria-label="QR להצטרפות למשחק"/>}
    <div className="live-player-lobby"><h2><span>{total}</span> משתתפים בחדר</h2>{total?<div>{data.players.map((p,i)=><span style={{'--delay':`${Math.min(i,15)*35}ms`}} key={p.id}>{p.name}</span>)}</div>:<p>מיד כשמישהו יצטרף הוא יופיע כאן.</p>}</div>
    <button className="live-start-button" disabled={!total||busy} onClick={()=>act('start')}>{!total?'מחכים למשתתף הראשון…':'מתחילים את המשחק'} <span>←</span></button>
  </section>}
  {data.phase==='question'&&q&&<section className="live-question-stage"><div className="live-stage-meta"><span>שאלה {idx+1} מתוך {data.questions.length}</span><strong className={left!==null&&left<=5?'urgent':''}>{left??'–'}</strong><span>{data.answer_count}/{total} ענו</span></div>
    <h1><MathText>{q.q}</MathText></h1><div className="live-host-options">{q.options.map((option,i)=><div className={`live-answer ${COLORS[i]}`} key={i}><b>{MARKS[i]}</b><span><MathText>{option}</MathText></span></div>)}</div>
    <div className="live-timer-track"><span style={{width:`${left===null?100:Math.max(0,left)/(data.settings.seconds||20)*100}%`}}/></div><button className="live-reveal-now" disabled={busy} onClick={()=>act('reveal')}>הצגת התשובה עכשיו</button>
  </section>}
  {data.phase==='reveal'&&q&&<section className="live-reveal-stage"><div className="live-stage-meta"><span>שאלה {idx+1} מתוך {data.questions.length}</span><strong>התשובה הנכונה</strong><span>{data.answer_count}/{total} ענו</span></div>
    <h1><MathText>{q.q}</MathText></h1><div className="live-result-grid"><div className="live-results-options">{q.options.map((option,i)=><div className={`live-answer ${COLORS[i]} ${q.correct===i?'correct':'dim'}`} key={i}><b>{q.correct===i?'✓':MARKS[i]}</b><span><MathText>{option}</MathText></span><em>{data.counts[i]||0}</em></div>)}</div>
      <aside><h2>לוח מובילים</h2><Leaderboard rows={data.leaderboard} limit={5}/></aside></div>
    <button className="live-start-button" disabled={busy} onClick={()=>act(isLast?'finish':'next')}>{isLast?'לתוצאות הסופיות':'לשאלה הבאה'} <span>←</span></button>
  </section>}
  {data.phase==='finished'&&<section className="live-finish-stage"><p>🏆 המשחק הסתיים</p><h1>{data.title}</h1>{data.leaderboard.length?<Leaderboard rows={data.leaderboard}/>:<p>הפעם לא היו תשובות.</p>}
    <div className="live-replay-panel"><div className="live-replay-head"><span>עוד סיבוב?</span><h2>משחק חדש עם אותם משתתפים</h2><p>{total} המשתתפים נשארים בחדר עם אותו קוד. הניקוד מתאפס ומתחילים יחד.</p></div>
      {detectedPack&&<button className="live-replay-primary" disabled={busy} onClick={()=>freshRound(detectedPack.topicId,detectedPack.difficultyId)}><b>🔄 אותו נושא, שאלות חדשות</b><span>{currentTopic?.label} · {currentDifficulty?.label} · בלי לחזור על שאלות הסבב</span></button>}
      <div className="live-replay-picker"><h3>או בוחרים נושא אחר</h3><div className="live-topic-grid">{LIVE_QUIZ_TOPICS.map(item=><button type="button" key={item.id} aria-pressed={replayTopic===item.id} style={{'--topic-color':item.color}} onClick={()=>setReplayTopic(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</div>
        <div className="live-replay-levels">{LIVE_QUIZ_DIFFICULTIES.map(item=><button type="button" key={item.id} aria-pressed={replayDifficulty===item.id} onClick={()=>setReplayDifficulty(item.id)}>{item.icon} {item.label}</button>)}</div>
        <button className="live-replay-start" disabled={busy} onClick={()=>freshRound(replayTopic,replayDifficulty)}>{busy?'מכינים את הסיבוב…':'פתיחת סיבוב בנושא שבחרתם'}</button>
      </div>
      <button className="live-replay-same" disabled={busy} onClick={()=>act('reset')}>לשחק שוב בדיוק עם אותן שאלות</button>
    </div><Link className="live-finish-new-room" to="/live">יצירת חדר נפרד עם משתתפים חדשים</Link></section>}
 </main>
}
