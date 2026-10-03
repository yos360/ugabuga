import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { shareOnWhatsApp } from '../utils/share'
import { exitFullscreen, enterFullscreen, shareGameText } from './stage'
import { createMusic, musicPref, saveMusicPref } from './music'
import { saveResult, streak, dailyShareText } from './daily'
import { WhatsAppIcon } from '../components/layout/WhatsAppShare'
import './arcade.css'

// Full-screen game stage: covers the whole window (and goes into real browser
// full-screen where the device allows it). Games render into the flexible body.
// Soft background music plays while the stage is open (one tap mutes it).
// With `daily` (from /online-games/today) the game plays today's fixed puzzle and the
// stage shows the daily result card when it ends.
export default function ArcadeStage({ game, onClose, daily }) {
  const [report, setReport] = useState(null)
  const [isFs, setIsFs] = useState(() => !!document.fullscreenElement)
  const [musicOn, setMusicOn] = useState(musicPref)
  const music = useRef(null)
  const canFs = typeof document !== 'undefined' && document.fullscreenEnabled
  const Game = game.component
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(null) // { text, won, streak }
  const dailyProp = useMemo(() => daily && {
    ...daily,
    // first report of a round wins; saving is idempotent, so a repeated call is harmless
    finish: result => setDone(prev => {
      if (prev) return prev
      const all = saveResult(daily.day, { slug: game.slug, ...result })
      return { ...result, streak: streak(all, daily.day) }
    }),
  }, [daily, game.slug])

  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const onFs = () => setIsFs(!!document.fullscreenElement)
    const onKey = e => { if (e.key === 'Escape' && !document.fullscreenElement) onClose() }
    document.addEventListener('fullscreenchange', onFs)
    window.addEventListener('keydown', onKey)
    import('../utils/liveActivity').then(m => { m.recordActivity('play', m.activityForPath(location.pathname)); m.logEvent('play') }).catch(() => {})
    return () => {
      html.style.overflow = prev
      document.removeEventListener('fullscreenchange', onFs)
      window.removeEventListener('keydown', onKey)
      exitFullscreen()
    }
  }, [onClose])

  // Music: starts with the stage, follows the mute button, pauses in a hidden tab.
  useEffect(() => {
    const m = createMusic(game.mood)
    music.current = m
    const onVis = () => { if (document.hidden) m.stop(); else if (musicPref()) m.start() }
    document.addEventListener('visibilitychange', onVis)
    return () => { document.removeEventListener('visibilitychange', onVis); m.stop(true); music.current = null }
  }, [game.mood])
  useEffect(() => {
    if (musicOn) music.current?.start()
    else music.current?.stop()
  }, [musicOn])
  const toggleMusic = () => setMusicOn(on => { saveMusicPref(!on); return !on })

  return createPortal(
    <div className="arc-stage" role="dialog" aria-modal="true" aria-label={game.name} dir="rtl" style={{ '--game-color': game.color }}
      onPointerDownCapture={() => { if (musicOn) music.current?.resume() }}>
      <header className="arc-top">
        <button type="button" className="arc-icon-btn" onClick={onClose} aria-label="יציאה מהמשחק">✕</button>
        <h2 className="arc-title"><span aria-hidden="true">{game.emoji}</span> {game.name}</h2>
        <div className="arc-top-actions">
          <button type="button" className="arc-icon-btn" onClick={toggleMusic} aria-pressed={musicOn}
            aria-label={musicOn ? 'השתקת המוזיקה' : 'הפעלת מוזיקה'} title={musicOn ? 'השתקת המוזיקה' : 'הפעלת מוזיקה'}>{musicOn ? '🎵' : '🔇'}</button>
          <button type="button" className="arc-share" onClick={() => shareOnWhatsApp(shareGameText(game, report))}>
            <WhatsAppIcon size={20} /><span className="arc-share-text">שתפו</span>
          </button>
          {canFs && <button type="button" className="arc-icon-btn" onClick={() => (isFs ? exitFullscreen() : enterFullscreen())} aria-label={isFs ? 'יציאה ממסך מלא' : 'מסך מלא'} title={isFs ? 'יציאה ממסך מלא' : 'מסך מלא'}>{isFs ? '🗗' : '⛶'}</button>}
        </div>
      </header>
      <div className="arc-body">
        <Suspense fallback={<p className="arc-loading">טוענים את המשחק… 🎈</p>}>
          <Game key={run} daily={dailyProp || undefined} onReport={setReport} onShare={text => shareOnWhatsApp(shareGameText(game, { text }))} />
        </Suspense>
        {done && <DailyDone daily={daily} done={done} onAgain={() => { setDone(null); setRun(r => r + 1) }} onClose={onClose} />}
      </div>
    </div>,
    document.body,
  )
}

function DailyDone({ daily, done, onAgain, onClose }) {
  return (
    <div className="arc-end" role="alertdialog" aria-label="סיום אתגר היום">
      <div className="arc-end-card dl-done">
        <h3>{done.won ? '🌟 סיימתם את אתגר היום!' : '😅 כמעט!'}</h3>
        <p className="dl-result">{done.text}</p>
        {done.streak > 0 && <p className="dl-streak">🔥 {done.streak} {done.streak === 1 ? 'יום' : 'ימים'} ברצף</p>}
        <p>מחר מחכה אתגר חדש — אותו אתגר לכל מי שמשחק.</p>
        <div className="arc-end-actions">
          <button type="button" className="arc-btn arc-btn-main dl-share" onClick={() => shareOnWhatsApp(dailyShareText(daily, done))}>📱 שתפו בוואטסאפ</button>
          <button type="button" className="arc-btn" onClick={onAgain}>🔄 לשחק שוב</button>
          <button type="button" className="arc-btn" onClick={onClose}>✓ סיום</button>
        </div>
      </div>
    </div>
  )
}
