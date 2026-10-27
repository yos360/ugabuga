import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { MathText } from '../../components/quiz/QuizEditor'
import { buildLiveQuiz, detectLiveQuizMode, detectLiveQuizPack, LIVE_QUIZ_DIFFICULTIES, LIVE_QUIZ_MODES, LIVE_QUIZ_TOPICS } from '../../data/liveQuizPacks'
import { liveErrorText, liveHostLink, liveMemory, livePlayLink, liveQuizDb } from '../../utils/liveQuizDb'
import useLiveCountdown from './useLiveCountdown'
import './live-quiz.css'
import { liveSoundOnce, markHeard } from './liveSounds'
import LiveSoundToggle from './LiveSoundToggle'

const COLORS=['red','blue','gold','green'],MARKS=['▲','◆','●','■']
const KICK_STYLE={marginInlineStart:8,padding:'1px 8px',border:'1px solid currentColor',borderRadius:999,background:'transparent',color:'inherit',font:'inherit',fontSize:'.75em',opacity:.7,cursor:'pointer'}
function useQr(text){const[svg,setSvg]=useState('');useEffect(()=>{import('qrcode').then(({default:Q})=>Q.toString(text,{type:'svg',margin:1,width:240,color:{dark:'#111633',light:'#ffffff'}})).then(setSvg).catch(()=>{})},[text]);return svg}
// Host summary: every reveal is recorded on this device (counts per answer), so the end screen can show
// how the class did on each question and hand the teacher a CSV. Nothing extra is stored on the server.
const statsKey=(code,title)=>`buga-live-stats-${code}-${title}`
const readStats=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function HostSummary({stats,leaderboard,title}){
 const rows=Object.values(stats).sort((a,b)=>a.i-b.i)
 if(!rows.length)return null
 const pct=r=>r.answered?Math.round(r.right/r.answered*100):0
 const hardest=rows.filter(r=>r.answered).sort((a,b)=>pct(a)-pct(b))[0]
 const csv=()=>{const esc=v=>`"${String(v).replace(/"/g,'""')}"`;const lines=[['שאלה','התשובה הנכונה','ענו','צדקו','אחוז הצלחה'].map(esc).join(','),...rows.map(r=>[r.q,r.answer,r.answered,r.right,`${pct(r)}%`].map(esc).join(',')),'',['מקום','שם','ניקוד'].map(esc).join(','),...leaderboard.map((p,i)=>[p.rank||i+1,p.name,p.score].map(esc).join(','))];const url=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`buga-live-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 return <section className="live-summary"><h2>📊 סיכום למנחה</h2>
  {hardest&&<p className="live-summary-hard">השאלה הכי קשה: <b>{hardest.q}</b> — {pct(hardest)}% צדקו</p>}
  <ol>{rows.map(r=><li key={r.i}><span>{r.q}</span><i style={{'--pct':`${pct(r)}%`}}><em/></i><b>{pct(r)}%</b><small>{r.right}/{r.answered}</small></li>)}</ol>
  <button type="button" onClick={csv}>⬇️ הורדת התוצאות לאקסל (CSV)</button>
  <p className="live-summary-note">הסיכום נשמר רק במכשיר של המנחה.</p>
 </section>}
function Leaderboard({rows=[],limit=10}){return <ol className="live-leaders">{rows.slice(0,limit).map((p,i)=><li key={`${p.name}-${i}`}><b>{p.rank||i+1}</b><span>{p.name}</span><strong>{p.score.toLocaleString('he-IL')}</strong></li>)}</ol>}

export default function LiveQuizHost(){
 const {code}=useParams(),[token]=useState(()=>{const hash=/#k=([\w-]+)/.exec(location.hash)?.[1];if(hash){liveMemory.rememberHost(code,hash,'משחק חדש');history.replaceState(history.state,'',location.pathname)}return hash||liveMemory.hostToken(code)})
 const[data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[copied,setCopied]=useState(''),[replayTopic,setReplayTopic]=useState('mixed'),[replayDifficulty,setReplayDifficulty]=useState('medium'),[replayMode,setReplayMode]=useState('regular'),[retry,setRetry]=useState(0),auto=useRef(''),retryTimer=useRef(0),finishSeen=useRef(false)
 const[stats,setStats]=useState({}),playLink=livePlayLink(code),qr=useQr(playLink),left=useLiveCountdown(data?.ends_at)
 const load=useCallback(()=>token&&liveQuizDb.host(code,token).then(d=>{setData(d);setError('');liveMemory.rememberHost(code,token,d.title)}).catch(e=>setError(liveErrorText(e.code))),[code,token])
 useEffect(()=>{load();const id=setInterval(()=>{if(document.visibilityState==='visible')load()},1200);return()=>clearInterval(id)},[load])
 // Auto-reveal when the timer hits zero. The server may refuse (`question_open` when this clock runs
 // ahead of the database clock, or a network hiccup), so a failed attempt is retried a second later.
 useEffect(()=>{if(data?.phase==='question'&&left===0&&data.ends_at&&auto.current!==`${data.question_index}`){auto.current=`${data.question_index}`;liveQuizDb.action(code,token,'timeout').then(load).catch(()=>{load();clearTimeout(retryTimer.current);retryTimer.current=setTimeout(()=>{auto.current='';setRetry(n=>n+1)},1000)})}},[data?.phase,data?.question_index,data?.ends_at,left,code,token,load,retry])
 useEffect(()=>()=>clearTimeout(retryTimer.current),[])
 // Sounds on the shared screen: a chord when an answer is revealed, a fanfare at the end. Whatever was
 // already on screen when the page loaded stays quiet.
 const firstPhase=useRef(true)
 useEffect(()=>{if(!data)return;const key=`host-${code}-${data.phase}-${data.question_index}`;if(firstPhase.current){firstPhase.current=false;markHeard(key);return}if(data.phase==='reveal')liveSoundOnce(key,'reveal');if(data.phase==='finished')liveSoundOnce(key,'finish')},[data?.phase,data?.question_index,code]) // eslint-disable-line react-hooks/exhaustive-deps
 // Everyone answered: show the answer right away instead of waiting out the clock. Uses the same
 // once-per-question guard as the timeout, so the two never fire together. A participant who left
 // mid-game never answers — then the timer still ends the question as before.
 useEffect(()=>{const total=data?.players?.length||0;if(data?.phase==='question'&&total>0&&(data.answer_count||0)>=total&&auto.current!==`${data.question_index}`){auto.current=`${data.question_index}`;liveQuizDb.action(code,token,'reveal').then(load).catch(load)}},[data?.phase,data?.question_index,data?.answer_count,data?.players?.length,code,token,load])
 // Record each revealed question (latest counts win; late answers can still arrive during reveal).
 useEffect(()=>{
   if(!data?.title)return
   const key=statsKey(code,data.title)
   if(data.phase==='lobby'){try{localStorage.removeItem(key)}catch{/* private mode */}setStats({});return}
   const all=readStats(key)
   if(data.phase==='reveal'){const q=data.questions[data.question_index];if(q){const counts=data.counts||{},answered=Object.values(counts).reduce((t,n)=>t+(Number(n)||0),0);all[data.question_index]={i:data.question_index,q:q.q,answer:q.options[q.correct],answered,right:Number(counts[q.correct])||0};try{localStorage.setItem(key,JSON.stringify(all))}catch{/* private mode */}}}
   setStats(all)
 },[data?.phase,data?.question_index,data?.answer_count,data?.title,code]) // eslint-disable-line react-hooks/exhaustive-deps
 const detectedPack=detectLiveQuizPack(data?.questions,data?.title)
 const detectedMode=detectLiveQuizMode(data?.questions)
 useEffect(()=>{
   if(data?.phase!=='finished'){finishSeen.current=false;return}
   if(!finishSeen.current){setReplayTopic(detectedPack?.topicId||'mixed');setReplayDifficulty(detectedPack?.difficultyId||'medium');setReplayMode(detectedMode);finishSeen.current=true}
 },[data?.phase,detectedPack?.topicId,detectedPack?.difficultyId,detectedMode])
 const act=async action=>{setBusy(true);setError('');try{await liveQuizDb.action(code,token,action);await load()}catch(e){setError(liveErrorText(e.code));if(e.code==='bad_phase')await load()}finally{setBusy(false)}}
 const kick=async player=>{if(!window.confirm(`להוציא את ${player.name} מהמשחק?`))return;setBusy(true);setError('');try{await liveQuizDb.kick(code,token,player.id);await load()}catch(e){setError(e.code==='not_installed'?'כדי להוציא משתתפים צריך קודם להתקין את עדכון בוגה לייב במסד הנתונים.':liveErrorText(e.code))}finally{setBusy(false)}}
 const freshRound=async(topicId,difficultyId,modeId=replayMode)=>{
   setBusy(true);setError('')
   try{
     const key=`buga-live-generated-${topicId}-${difficultyId}`
     let previous=[];try{const raw=localStorage.getItem(key);previous=raw?(raw.startsWith('[')?JSON.parse(raw):raw):[]}catch{/* private mode */}
     const samePack=topicId===detectedPack?.topicId&&difficultyId===detectedPack?.difficultyId
     const currentIds=samePack?(detectedPack?.questionIds||[]):[]
     previous=[...new Set([...(Array.isArray(previous)?previous:[]),...currentIds])]
     const wanted=Math.max(3,Math.min(8,data?.questions?.length||6))
     const count=topicId==='mixed'||topicId==='math'?wanted:Math.max(3,Math.min(wanted,14-currentIds.length))
     let game=buildLiveQuiz(topicId,difficultyId,count,previous,Math.random,modeId)
     if(game.questions.some(item=>currentIds.includes(item.id.replace(/-tf$/,''))))game=buildLiveQuiz(topicId,difficultyId,count,currentIds,Math.random,modeId)
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
  <header className="live-stage-head"><Link to="/live" className="live-stage-brand"><i>B!</i><span>בוגה לייב</span></Link><div><b>{data.title}</b><span>קוד משחק <strong dir="ltr">{code}</strong></span></div><LiveSoundToggle label={false} /><button onClick={fullscreen}>⛶ מסך מלא</button></header>
  {error&&<p className="live-error stage-error" role="alert">{error}</p>}
  {data.phase==='lobby'&&<section className="live-lobby">
    <div className="live-lobby-main"><p>המשתתפים נכנסים מהטלפון</p><h1 dir="ltr">{code}</h1><span className="live-url" dir="ltr">ugabuga.co.il/play/{code}</span>
      <div className="live-share-buttons"><button onClick={()=>copy(playLink,'play')}>{copied==='play'?'✓ הועתק':'העתקת קישור למשתתפים'}</button><a href={`https://wa.me/?text=${encodeURIComponent(`🎮 מצטרפים לבוגה לייב: ${data.title}\nקוד: ${code}\n${playLink}`)}`} target="_blank" rel="noopener">שליחה בוואטסאפ</a><button onClick={()=>copy(liveHostLink(code,token),'host')}>{copied==='host'?'✓ הועתק':'העתקת קישור למנחה'}</button></div>
    </div>{qr&&<div className="live-qr" dangerouslySetInnerHTML={{__html:qr}} role="img" aria-label="QR להצטרפות למשחק"/>}
    <div className="live-player-lobby"><h2><span>{total}</span> משתתפים בחדר</h2>{total?<div>{data.players.map((p,i)=><span style={{'--delay':`${Math.min(i,15)*35}ms`}} key={p.id}>{p.name}<button type="button" style={KICK_STYLE} disabled={busy} onClick={()=>kick(p)} aria-label={`הוצאת ${p.name} מהמשחק`}>הוצא</button></span>)}</div>:<p>מיד כשמישהו יצטרף הוא יופיע כאן.</p>}</div>
    <p className="live-lobby-tip">{total?'כולם מופיעים ברשימה? אפשר להתחיל.':'שתפו את הקוד או ה־QR וחכו שהמשתתפים יופיעו ברשימה.'}</p>
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
    <HostSummary stats={stats} leaderboard={data.leaderboard} title={data.title}/>
    <div className="live-replay-panel"><div className="live-replay-head"><span>עוד סיבוב?</span><h2>משחק חדש עם אותם משתתפים</h2><p>{total} המשתתפים נשארים בחדר עם אותו קוד. הניקוד מתאפס ומתחילים יחד.</p></div>
      {detectedPack&&<button className="live-replay-primary" disabled={busy} onClick={()=>freshRound(detectedPack.topicId,detectedPack.difficultyId)}><b>🔄 אותו נושא, שאלות חדשות</b><span>{currentTopic?.label} · {currentDifficulty?.label} · בלי לחזור על שאלות הסבב</span></button>}
      <div className="live-replay-picker"><h3>או בוחרים נושא אחר</h3><div className="live-topic-grid">{LIVE_QUIZ_TOPICS.map(item=><button type="button" key={item.id} aria-pressed={replayTopic===item.id} style={{'--topic-color':item.color}} onClick={()=>setReplayTopic(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</div>
        <div className="live-replay-levels">{LIVE_QUIZ_DIFFICULTIES.map(item=><button type="button" key={item.id} aria-pressed={replayDifficulty===item.id} onClick={()=>setReplayDifficulty(item.id)}>{item.icon} {item.label}</button>)}</div>
        <div className="live-replay-levels live-replay-modes">{LIVE_QUIZ_MODES.map(item=><button type="button" key={item.id} aria-pressed={replayMode===item.id} onClick={()=>setReplayMode(item.id)}>{item.label}</button>)}</div>
        <button className="live-replay-start" disabled={busy} onClick={()=>freshRound(replayTopic,replayDifficulty)}>{busy?'מכינים את הסיבוב…':'פתיחת סיבוב בנושא שבחרתם'}</button>
      </div>
      <button className="live-replay-same" disabled={busy} onClick={()=>act('reset')}>לשחק שוב בדיוק עם אותן שאלות</button>
    </div><Link className="live-finish-new-room" to="/live">יצירת חדר נפרד עם משתתפים חדשים</Link></section>}
 </main>
}
