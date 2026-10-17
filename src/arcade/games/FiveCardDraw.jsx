import { useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { drawCards, LEVELS, newDrawGame, playFinal, playOpening } from '../logic/fiveCardDraw'
import { useProgress } from '../hooks'
import { Hud, Segmented, ToolButton } from '../ui'
import { sfx } from '../sfx'
import './five-card-draw.css'

function PokerCard({ card, hidden, selected, onClick }) {
  return <button type="button" className={`fd-card${hidden ? ' is-back' : ''}${selected ? ' is-selected' : ''}${!hidden && isRed(card) ? ' is-red' : ''}`} onClick={onClick} disabled={hidden} aria-pressed={selected}>{hidden ? <span>עוגה<br />בוגה</span> : <><b>{rankLabel(card.rank)}</b><i>{SUITS[card.suit]}</i><strong>{SUITS[card.suit]}</strong></>}</button>
}

export default function FiveCardDraw({ daily, onReport, onShare }) {
  const [progress, save] = useProgress('five-card-draw', { wins: 0, losses: 0, best: 500, game: null })
  const [difficulty, setDifficulty] = useState(progress.game?.difficulty || 'medium')
  const [game, setGame] = useState(() => progress.game && progress.game.stage !== 'ended' ? progress.game : newDrawGame(Math.random, difficulty, Math.max(100, progress.best)))
  const commit = next => {
    setGame(next); sfx(next.stage === 'ended' ? (next.result?.playerWins || next.result?.computerFolded ? 'win' : 'bump') : 'slide')
    if (next.stage !== 'ended') { save({ game: next }); return }
    const won = Boolean(next.result?.playerWins || next.result?.computerFolded), patch = { game: null, wins: progress.wins + (won ? 1 : 0), losses: progress.losses + (won ? 0 : 1), best: Math.max(progress.best, next.chips) }
    save(patch); if (won) onReport?.({ text: `🃏 ניצחתי בפוקר חמישה קלפים עם ${next.result?.playerHand?.name || 'פרישה של היריב'}` })
    daily?.finish({ won, score: won ? next.chips : null, text: won ? '🃏 ניצחתי ביד היומית בפוקר חמישה קלפים' : '🃏 היד היומית הסתיימה הפעם ללא ניצחון' })
  }
  const restart = () => { const next = newDrawGame(Math.random, difficulty, Math.max(100, game.chips)); setGame(next); save({ game: next }) }
  const toggle = index => {
    if (game.stage !== 'draw') return
    const selected = game.selected.includes(index) ? game.selected.filter(value => value !== index) : game.selected.length < 3 ? [...game.selected, index] : game.selected
    commit({ ...game, selected })
  }
  const opening = action => commit(playOpening(game, action))
  const final = action => commit(playFinal(game, action))
  const reveal = game.stage === 'ended'
  return <div className="arc-game fd-game">
    <Hud stats={[['אסימונים', game.chips], ['קופה', game.pot], ['ניצחונות', progress.wins]]}><ToolButton onClick={restart} label="משחק חדש">🔄</ToolButton></Hud>
    <div className="fd-table">
      <div className="fd-rival"><span className="fd-avatar">🤖</span><div><b>בוט בוגה</b><small>{game.computerChips} אסימונים</small></div></div>
      <div className="fd-hand" aria-label="היד של המחשב">{game.computer.map(card => <PokerCard key={card.id} card={card} hidden={!reveal} />)}</div>
      <div className="fd-pot">🏆 קופה <b>{game.pot}</b></div>
      <p className="fd-message" role="status">{game.message}</p>
      <div className="fd-hand" aria-label="היד שלכם">{game.player.map((card, index) => <PokerCard key={card.id} card={card} selected={game.selected.includes(index)} onClick={() => toggle(index)} />)}</div>
      {game.stage === 'draw' && <small className="fd-help">נוגעים בקלפים שרוצים להחליף — עד שלושה</small>}
      <div className="fd-actions">
        {game.stage === 'opening' && <><button onClick={() => opening('fold')}>פרישה</button><button onClick={() => opening('check')}>בדיקה</button><button className="primary" onClick={() => opening('bet')}>הימור 20</button></>}
        {game.stage === 'draw' && <button className="primary" onClick={() => commit(drawCards(game))}>החלפת {game.selected.length || 0} קלפים</button>}
        {game.stage === 'final' && <><button onClick={() => final('fold')}>פרישה</button><button onClick={() => final('check')}>פתיחה</button><button className="primary" onClick={() => final('bet')}>הימור 30</button></>}
        {game.stage === 'ended' && <button className="primary" onClick={restart}>יד חדשה</button>}
      </div>
      {game.result?.playerHand && <div className="fd-result"><span>היד שלכם: <b>{game.result.playerHand.name}</b></span><span>יד המחשב: <b>{game.result.computerHand.name}</b></span></div>}
    </div>
    {!daily && <Segmented label="רמת היריב" value={difficulty} onChange={value => { setDifficulty(value); const next = newDrawGame(Math.random, value, Math.max(100, game.chips)); setGame(next); save({ game: next }) }} options={Object.entries(LEVELS)} />}
    <button type="button" className="fd-share" onClick={() => onShare?.(`🃏 שיחקתי פוקר חמישה קלפים בעוגה בוגה — ${progress.wins} ניצחונות!`)}>📱 שתפו תוצאה</button>
  </div>
}
