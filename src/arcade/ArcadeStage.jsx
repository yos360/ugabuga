import { Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { shareOnWhatsApp } from '../utils/share'
import { exitFullscreen, enterFullscreen, shareGameText } from './stage'
import { WhatsAppIcon } from '../components/layout/WhatsAppShare'
import './arcade.css'

// Full-screen game stage: covers the whole window (and goes into real browser
// full-screen where the device allows it). Games render into the flexible body.
export default function ArcadeStage({ game, onClose }) {
  const [report, setReport] = useState(null)
  const [isFs, setIsFs] = useState(() => !!document.fullscreenElement)
  const canFs = typeof document !== 'undefined' && document.fullscreenEnabled
  const Game = game.component

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

  return createPortal(
    <div className="arc-stage" role="dialog" aria-modal="true" aria-label={game.name} dir="rtl" style={{ '--game-color': game.color }}>
      <header className="arc-top">
        <button type="button" className="arc-icon-btn" onClick={onClose} aria-label="יציאה מהמשחק">✕</button>
        <h2 className="arc-title"><span aria-hidden="true">{game.emoji}</span> {game.name}</h2>
        <div className="arc-top-actions">
          <button type="button" className="arc-share" onClick={() => shareOnWhatsApp(shareGameText(game, report))}>
            <WhatsAppIcon size={20} /><span className="arc-share-text">שתפו</span>
          </button>
          {canFs && <button type="button" className="arc-icon-btn" onClick={() => (isFs ? exitFullscreen() : enterFullscreen())} aria-label={isFs ? 'יציאה ממסך מלא' : 'מסך מלא'} title={isFs ? 'יציאה ממסך מלא' : 'מסך מלא'}>{isFs ? '🗗' : '⛶'}</button>}
        </div>
      </header>
      <div className="arc-body">
        <Suspense fallback={<p className="arc-loading">טוענים את המשחק… 🎈</p>}>
          <Game onReport={setReport} onShare={text => shareOnWhatsApp(shareGameText(game, { text }))} />
        </Suspense>
      </div>
    </div>,
    document.body,
  )
}
