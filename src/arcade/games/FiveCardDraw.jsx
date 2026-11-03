import { useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { drawCards, LEVELS, newDrawGame, playFinal, playOpening } from '../logic/fiveCardDraw'
import { LEVELS_EN, drawMessageEn, handName } from '../logic/pokerText'
import { useProgress } from '../hooks'
import { Hud, Segmented, ToolButton } from '../ui'
import { sfx } from '../sfx'
import './five-card-draw.css'
import './card-polish.css'

function PokerCard({ card, hidden, selected, onClick, en }) {
  return <button type="button" className={`fd-card${hidden ? ' is-back' : ''}${selected ? ' is-selected' : ''}${!hidden && isRed(card) ? ' is-red' : ''}`} onClick={onClick} disabled={hidden} aria-label={hidden ? (en ? 'Face-down card' : 'קלף הפוך') : `${rankLabel(card.rank)}${SUITS[card.suit]}`} aria-pressed={selected}>{hidden ? (en ? <span>Buga</span> : <span>עוגה<br />בוגה</span>) : <><b>{rankLabel(card.rank)}</b><i>{SUITS[card.suit]}</i><strong>{SUITS[card.suit]}</strong></>}</button>
}

export default function FiveCardDraw({ daily, onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, save] = useProgress('five-card-draw', { wins: 0, losses: 0, best: 500, game: null })
  const [difficulty, setDifficulty] = useState(progress.game?.difficulty || 'medium')
  const [game, setGame] = useState(() => progress.game && progress.game.stage !== 'ended' ? progress.game : newDrawGame(Math.random, difficulty, Math.max(100, progress.best)))
  const commit = next => {
    setGame(next); sfx(next.stage === 'ended' ? (next.result?.playerWins || next.result?.computerFolded ? 'win' : 'bump') : 'slide')
    if (next.stage !== 'ended') { save({ game: next }); return }
    const won = Boolean(next.result?.playerWins || next.result?.computerFolded), patch = { game: null, wins: progress.wins + (won ? 1 : 0), losses: progress.losses + (won ? 0 : 1), best: Math.max(progress.best, next.chips) }
    save(patch)
    if (won) onReport?.({ text: en ? `🃏 I won at Five Card Draw with ${next.result?.playerHand ? handName(next.result.playerHand, true) : 'the opponent folding'}` : `🃏 ניצחתי בפוקר חמישה קלפים עם ${next.result?.playerHand?.name || 'פרישה של היריב'}` })
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
    <Hud stats={[[en ? 'Chips' : 'אסימונים', game.chips], [en ? 'Pot' : 'קופה', game.pot], [en ? 'Wins' : 'ניצחונות', progress.wins]]}><ToolButton onClick={restart} label={en ? 'New game' : 'משחק חדש'}>🔄</ToolButton></Hud>
    <p className="card-guide">{game.stage === 'draw'
      ? (en ? 'Pick up to three cards to swap, then tap the swap button. You can also swap zero cards.' : 'בחרו עד שלושה קלפים להחלפה, ואז לחצו על כפתור ההחלפה. אפשר גם להחליף אפס קלפים.')
      : game.stage === 'ended' ? (en ? 'The hand is over. Tap new hand to continue.' : 'היד הסתיימה. לחצו על יד חדשה כדי להמשיך.')
        : (en ? 'Choose check to continue, bet to add to the pot, or fold to give up the hand.' : 'בחרו בדיקה כדי להמשיך, הימור כדי להוסיף לקופה, או פרישה כדי לוותר על היד.')}</p>
    <div className="fd-table">
      <div className="fd-rival"><span className="fd-avatar">🤖</span><div><b>{en ? 'Buga Bot' : 'בוט בוגה'}</b><small>{game.computerChips} {en ? 'chips' : 'אסימונים'}</small></div></div>
      <div className="fd-hand" aria-label={en ? "The computer's hand" : 'היד של המחשב'}>{game.computer.map(card => <PokerCard key={card.id} card={card} hidden={!reveal} en={en} />)}</div>
      <div className="fd-pot">🏆 {en ? 'Pot' : 'קופה'} <b>{game.pot}</b></div>
      <p className="fd-message" role="status">{en ? drawMessageEn(game) : game.message}</p>
      <div className="fd-hand" aria-label={en ? 'Your hand' : 'היד שלכם'}>{game.player.map((card, index) => <PokerCard key={card.id} card={card} en={en} selected={game.selected.includes(index)} onClick={() => toggle(index)} />)}</div>
      {game.stage === 'draw' && <small className="fd-help">{en ? 'Tap the cards you want to swap, up to three' : 'נוגעים בקלפים שרוצים להחליף — עד שלושה'}</small>}
      <div className="fd-actions">
        {game.stage === 'opening' && <><button onClick={() => opening('fold')}>{en ? 'Fold' : 'פרישה'}</button><button onClick={() => opening('check')}>{en ? 'Check' : 'בדיקה'}</button><button className="primary" onClick={() => opening('bet')}>{en ? 'Bet 20' : 'הימור 20'}</button></>}
        {game.stage === 'draw' && <button className="primary" onClick={() => commit(drawCards(game))}>{en ? `Swap ${game.selected.length || 0} cards` : `החלפת ${game.selected.length || 0} קלפים`}</button>}
        {game.stage === 'final' && <><button onClick={() => final('fold')}>{en ? 'Fold' : 'פרישה'}</button><button onClick={() => final('check')}>{en ? 'Check' : 'פתיחה'}</button><button className="primary" onClick={() => final('bet')}>{en ? 'Bet 30' : 'הימור 30'}</button></>}
        {game.stage === 'ended' && <button className="primary" onClick={restart}>{en ? 'New hand' : 'יד חדשה'}</button>}
      </div>
      {game.result?.playerHand && <div className="fd-result"><span>{en ? 'Your hand:' : 'היד שלכם:'} <b>{handName(game.result.playerHand, en)}</b></span><span>{en ? "Computer's hand:" : 'יד המחשב:'} <b>{handName(game.result.computerHand, en)}</b></span></div>}
    </div>
    {!daily && <Segmented label={en ? 'Opponent level' : 'רמת היריב'} value={difficulty} onChange={value => { setDifficulty(value); const next = newDrawGame(Math.random, value, Math.max(100, game.chips)); setGame(next); save({ game: next }) }} options={Object.entries(en ? LEVELS_EN : LEVELS)} />}
    <button type="button" className="fd-share" onClick={() => onShare?.(en ? `🃏 I played Five Card Draw on Ugabuga: ${progress.wins} wins!` : `🃏 שיחקתי פוקר חמישה קלפים בעוגה בוגה — ${progress.wins} ניצחונות!`)}>{en ? '📱 Share your result' : '📱 שתפו תוצאה'}</button>
  </div>
}
