import { useEffect, useRef, useState } from 'react'
import { SIZE, fresh, move, spawn, canPlay, best as bestTile } from '../logic/merge'
import { rng } from '../logic/rng'
import { useBox, useProgress, useSwipe, useArrowKeys } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const TILE = {
  2: ['#fff6d6', '#1d2233'], 4: ['#ffe9a8', '#1d2233'], 8: ['#ffc56b', '#1d2233'], 16: ['#ff9f5a', '#1d2233'],
  32: ['#ff7a6b', '#fff'], 64: ['#ff5277', '#fff'], 128: ['#7fd8ae', '#1d2233'], 256: ['#4cc3ff', '#1d2233'],
  512: ['#5b6cff', '#fff'], 1024: ['#b26bff', '#fff'], 2048: ['#ffd23f', '#1d2233'],
}
const SLIDE_MS = 120
const UNDOS = 3

export default function DoubleIt({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('merge-2048', { best: 0 })
  // the daily challenge uses a seeded random, so everyone gets the same new tiles
  const newGame = () => { const rand = daily ? rng(daily.seed) : Math.random; return { rand, tiles: fresh(rand), score: 0, history: [], undos: UNDOS } }
  const [game, setGame] = useState(newGame)
  const [ghosts, setGhosts] = useState([])
  const [pops, setPops] = useState([]) // floating "+8" labels
  const [won, setWon] = useState(false) // 2048 card shown once per game
  const [showWin, setShowWin] = useState(false)
  const [boxRef, box] = useBox()
  const fieldRef = useRef(null)
  const gameRef = useRef(game)
  const ghostTimer = useRef(0)
  useEffect(() => { gameRef.current = game }, [game])
  useEffect(() => () => clearTimeout(ghostTimer.current), [])

  const over = !canPlay(game.tiles)

  const go = dir => {
    const g = gameRef.current
    if (showWin || !canPlay(g.tiles)) return
    const r = move(g.tiles, dir)
    if (!r.moved) return
    const next = { ...g, tiles: spawn(r.tiles, g.rand), score: g.score + r.gained, history: [...g.history.slice(-20), { tiles: g.tiles, score: g.score }] }
    gameRef.current = next
    setGame(next)
    setGhosts(r.ghosts)
    clearTimeout(ghostTimer.current)
    ghostTimer.current = setTimeout(() => setGhosts([]), SLIDE_MS + 20)
    if (r.gained) setPops(p => [...p.slice(-3), { k: Date.now() + Math.random(), v: r.gained }])
    if (!won && bestTile(next.tiles) >= 2048) { setWon(true); setShowWin(true) }
  }
  useSwipe(fieldRef, go)
  useArrowKeys(go)

  const undo = () => {
    const g = gameRef.current
    if (!g.history.length || !g.undos) return
    const prev = g.history.at(-1)
    const next = { ...g, tiles: prev.tiles.map(t => ({ ...t, isNew: false, merged: false })), score: prev.score, history: g.history.slice(0, -1), undos: g.undos - 1 }
    gameRef.current = next
    setGame(next); setGhosts([])
  }
  const restart = () => {
    const next = newGame()
    gameRef.current = next
    setGame(next); setGhosts([]); setPops([]); setWon(false); setShowWin(false)
  }

  useEffect(() => {
    if (over && daily) daily.finish({ text: `🔢 2048: צברתי ${game.score} נקודות (הגעתי ל־${bestTile(game.tiles)})`, score: -game.score, won: true })
  }, [over, daily, game.score, game.tiles])
  useEffect(() => { if (game.score > progress.best) saveProgress({ best: game.score }) }, [game.score, progress.best, saveProgress])
  useEffect(() => {
    if (game.score) onReport?.({ text: `🔢 צברתי ${game.score} נקודות במכפילים עד 2048 (הגעתי ל־${bestTile(game.tiles)})!` })
  }, [game.score, game.tiles, onReport])

  const size = Math.max(220, Math.min(box.w - 16, box.h - 44, 540))
  const gap = Math.round(size * 0.028)
  const cell = (size - gap * (SIZE + 1)) / SIZE
  const pos = (x, y) => `translate(${gap + x * (cell + gap)}px, ${gap + y * (cell + gap)}px)`
  const tileStyle = t => {
    const [bg, fg] = TILE[t.value] || ['#1d2233', '#ffd23f']
    const digits = String(t.value).length
    return { width: cell, height: cell, transform: pos(t.x, t.y), background: bg, color: fg, fontSize: cell * (digits < 3 ? 0.44 : digits < 4 ? 0.36 : 0.28) }
  }

  return (
    <div className="arc-game">
      <Hud stats={[['ניקוד', game.score], ['שיא', Math.max(progress.best, game.score)]]}>
        <ToolButton onClick={undo} disabled={!game.history.length || !game.undos} label={`ביטול מהלך (נשארו ${game.undos})`}>↩<small className="mg-undo-n">{game.undos}</small></ToolButton>
        <ToolButton onClick={restart} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field mg-field" ref={el => { boxRef.current = el; fieldRef.current = el }}>
        <div className="mg-board" style={{ width: size, height: size }} role="application" aria-label="לוח מספרים. החליקו לכל כיוון או השתמשו בחיצי המקלדת">
          {Array.from({ length: SIZE * SIZE }, (_, i) => (
            <div key={i} className="mg-cell" style={{ width: cell, height: cell, transform: pos(i % SIZE, Math.floor(i / SIZE)) }} />
          ))}
          {/* one list, so a tile that merges away keeps its element and slides into place */}
          {[...ghosts.map(t => ({ ...t, ghost: true })), ...game.tiles].map(t => (
            <div key={t.id} className={`mg-tile${t.ghost ? ' is-ghost' : ''}${t.isNew ? ' is-new' : ''}${t.merged ? ' is-merged' : ''}`} style={tileStyle(t)}>{t.value}</div>
          ))}
          {pops.map(p => <span key={p.k} className="mg-pop" onAnimationEnd={() => setPops(ps => ps.filter(x => x.k !== p.k))}>+{p.v}</span>)}
        </div>
        <p className="mg-help" aria-hidden="true">👆 מחליקים לכל כיוון — בכל מקום במסך</p>
      </div>
      {showWin && <EndCard title="🏆 2048!" text="הגעתם למשבצת 2048 — אלופים! אפשר להמשיך ולשבור שיאים."
        primary="▶ ממשיכים לשחק" onPrimary={() => setShowWin(false)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.('🏆 הגעתי ל־2048 במכפילים של עוגה בוגה! אתם מסוגלים?')} />}
      {over && !showWin && !daily && <EndCard title="😮 הלוח התמלא" text={`צברתם ${game.score} נקודות${game.score >= progress.best && game.score > 0 ? ' — שיא חדש! 🎉' : ''}${game.undos && game.history.length ? ` · נשארו לכם ${game.undos} ביטולים` : ''}`}
        primary="🔄 משחק חדש" onPrimary={restart}
        secondary={game.undos && game.history.length ? '↩ ביטול המהלך האחרון' : '📱 שתפו את הניקוד'}
        onSecondary={game.undos && game.history.length ? undo : () => onShare?.(`🔢 צברתי ${game.score} נקודות במכפילים עד 2048! מי עובר אותי?`)} />}
    </div>
  )
}
