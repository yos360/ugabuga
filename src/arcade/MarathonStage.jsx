import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { arcadeGame } from './registry'
import { planMarathon, MARATHON_LENGTH, SKIP_PENALTY, marathonStars, clock } from './marathon'
import { createMusic, musicPref, saveMusicPref } from './music'
import { sfx } from './sfx'
import { exitFullscreen } from './stage'
import { useProgress } from './hooks'
import { Stars } from './ui'
import { shareOnWhatsApp, shareLink } from '../utils/share'
import './arcade.css'

// Full-screen marathon: intro card → play the stage → ✅ → next game … → final result.
export default function MarathonStage({ onClose }) {
  const [progress, saveProgress] = useProgress('marathon', { best: 0, runs: 0 })
  const [plan, setPlan] = useState(() => planMarathon())
  const [idx, setIdx] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [phase, setPhase] = useState('intro') // intro | play | done | fail | finish
  const [results, setResults] = useState([]) // { slug, sec, skipped }
  const [elapsed, setElapsed] = useState(0) // seconds of play so far (whole run)
  const [musicOn, setMusicOn] = useState(musicPref)
  const stageStart = useRef(0)
  const base = useRef(0) // seconds from finished stages + penalties
  const music = useRef(null)
  const stage = plan[idx]
  const game = arcadeGame(stage.slug)
  const Game = game.component

  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const onKey = e => { if (e.key === 'Escape' && !document.fullscreenElement) onClose() }
    window.addEventListener('keydown', onKey)
    const m = createMusic('breezy'); music.current = m
    return () => { html.style.overflow = prev; window.removeEventListener('keydown', onKey); m.stop(true); exitFullscreen() }
  }, [onClose])
  useEffect(() => { if (musicOn) music.current?.start(); else music.current?.stop() }, [musicOn])

  // running clock (only while a stage is being played)
  useEffect(() => {
    if (phase !== 'play') return undefined
    const t = setInterval(() => setElapsed(base.current + (performance.now() - stageStart.current) / 1000), 250)
    return () => clearInterval(t)
  }, [phase])

  const begin = () => { stageStart.current = performance.now(); setPhase('play') }
  const stageSec = () => (performance.now() - stageStart.current) / 1000
  const endStage = (skipped = false) => {
    const sec = skipped ? SKIP_PENALTY : stageSec()
    if (!skipped) base.current += stageSec(); else base.current += stageSec() + SKIP_PENALTY
    setElapsed(base.current)
    const res = [...results, { slug: stage.slug, sec: Math.round(skipped ? stageSec() + SKIP_PENALTY : sec), skipped }]
    setResults(res)
    if (idx + 1 >= MARATHON_LENGTH) {
      const total = Math.round(base.current)
      saveProgress(p => ({ runs: p.runs + 1, best: p.best ? Math.min(p.best, total) : total }))
      sfx('win'); setPhase('finish')
    } else { sfx('power'); setPhase('done') }
  }
  const next = () => { setIdx(i => i + 1); setAttempt(0); setPhase('intro') }
  const retry = () => { base.current += stageSec(); setAttempt(a => a + 1); stageStart.current = performance.now(); setPhase('play') }
  const restart = () => { setPlan(planMarathon()); setIdx(0); setAttempt(0); setResults([]); setElapsed(0); base.current = 0; setPhase('intro') }

  // the "challenge" handed to the game for this stage + attempt
  const finishedKey = useRef('')
  const challenge = useMemo(() => {
    const key = `${idx}-${attempt}`
    return {
      ...stage, seed: (idx + 1) * 1000 + attempt * 77 + plan.length,
      finish: r => {
        if (finishedKey.current === key) return
        finishedKey.current = key
        if (r.won === false) { sfx('crash'); setPhase('fail') } else endStage()
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, attempt, plan])

  // Automated-test helper, only when localStorage 'buga-debug' is '1': finish the current stage.
  useEffect(() => {
    let debug = false
    try { debug = localStorage.getItem('buga-debug') === '1' } catch { /* ignore */ }
    if (!debug) return undefined
    window.__marathonFinish = (won = true) => challenge.finish({ won })
    return () => { delete window.__marathonFinish }
  }, [challenge])

  useEffect(() => { if (phase === 'done') { const t = setTimeout(next, 1600); return () => clearTimeout(t) } return undefined }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const total = Math.round(elapsed)
  const shareText = `🏃 סיימתי את מרתון המשחקים של עוגה בוגה ב־${clock(total)}! 8 משחקים ברצף — מי מהיר יותר? 👇\n${shareLink('/online-games/marathon', 'marathon')}`

  return createPortal(
    <div className="arc-stage" role="dialog" aria-modal="true" aria-label="מרתון משחקים" dir="rtl" style={{ '--game-color': game.color }}>
      <header className="arc-top">
        <button type="button" className="arc-icon-btn" onClick={onClose} aria-label="יציאה">✕</button>
        <h2 className="arc-title">🏃 מרתון · {game.emoji} {game.name}</h2>
        <span className="mr-clock" aria-label="זמן">⏱️ {clock(total)}</span>
        <button type="button" className="arc-icon-btn" onClick={() => setMusicOn(on => { saveMusicPref(!on); return !on })} aria-label={musicOn ? 'השתקה' : 'מוזיקה'}>{musicOn ? '🎵' : '🔇'}</button>
      </header>
      <ol className="mr-dots" aria-label={`שלב ${idx + 1} מתוך ${MARATHON_LENGTH}`}>
        {plan.map((s, i) => <li key={i} className={i < results.length ? 'is-done' : i === idx ? 'is-now' : ''}>{arcadeGame(s.slug)?.emoji}</li>)}
      </ol>
      <div className="arc-body">
        {(phase === 'play' || phase === 'fail' || phase === 'done') && (
          <Suspense fallback={<p className="arc-loading">טוענים… 🎈</p>}>
            <Game key={`${idx}-${attempt}`} daily={challenge} onReport={() => {}} onShare={() => {}} />
          </Suspense>
        )}
        {phase === 'intro' && (
          <div className="arc-end"><div className="arc-end-card mr-intro">
            <p className="mr-step">שלב {idx + 1} מתוך {MARATHON_LENGTH}</p>
            <div className="mr-emoji" aria-hidden="true">{game.emoji}</div>
            <h3>{game.name}</h3>
            <p className="mr-goal">🎯 {stage.goal}</p>
            <div className="arc-end-actions"><button type="button" className="arc-btn arc-btn-main" autoFocus onClick={begin}>▶ יאללה!</button></div>
          </div></div>
        )}
        {phase === 'done' && (
          <div className="arc-end mr-flash"><div className="arc-end-card">
            <h3>✅ שלב {idx + 1} הושלם!</h3>
            <p>{clock(results.at(-1)?.sec || 0)} · הבא: {arcadeGame(plan[idx + 1]?.slug)?.emoji} {arcadeGame(plan[idx + 1]?.slug)?.name}</p>
            <div className="arc-end-actions"><button type="button" className="arc-btn arc-btn-main" onClick={next}>▶ לשלב הבא</button></div>
          </div></div>
        )}
        {phase === 'fail' && (
          <div className="arc-end"><div className="arc-end-card">
            <h3>😅 כמעט!</h3>
            <p>{stage.goal} — עוד ניסיון? (השעון ממשיך)</p>
            <div className="arc-end-actions">
              <button type="button" className="arc-btn arc-btn-main" autoFocus onClick={retry}>🔄 לנסות שוב</button>
              <button type="button" className="arc-btn" onClick={() => endStage(true)}>⏭️ לדלג (+{SKIP_PENALTY} שניות)</button>
            </div>
          </div></div>
        )}
        {phase === 'finish' && (
          <div className="arc-end"><div className="arc-end-card mr-final">
            <h3>🏁 סיימתם את המרתון!</h3>
            <Stars n={marathonStars(total)} />
            <p className="dl-result">⏱️ {clock(total)}{progress.best === total ? ' · שיא אישי! 🎉' : progress.best ? ` · השיא: ${clock(progress.best)}` : ''}</p>
            <ol className="mr-list">
              {results.map((r, i) => <li key={i}><span>{arcadeGame(r.slug)?.emoji} {arcadeGame(r.slug)?.name}</span><b>{r.skipped ? '⏭️ ' : ''}{clock(r.sec)}</b></li>)}
            </ol>
            <div className="arc-end-actions">
              <button type="button" className="arc-btn arc-btn-main dl-share" onClick={() => shareOnWhatsApp(shareText)}>📱 שתפו בוואטסאפ</button>
              <button type="button" className="arc-btn" onClick={restart}>🔄 מרתון חדש</button>
              <button type="button" className="arc-btn" onClick={onClose}>✓ סיום</button>
            </div>
          </div></div>
        )}
      </div>
    </div>,
    document.body,
  )
}
