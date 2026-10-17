import { useEffect, useRef, useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { newRound, availableMoves, playCard, selectSuit, drawCard, aiTurn, nextRound, matchWinner, validState } from '../logic/crazyEights'
import { useProgress } from '../hooks'
import { EndCard, Hud, ToolButton } from '../ui'
import { sfx } from '../sfx'
import './crazy-eights.css'
import './card-polish.css'

const key = 'buga-crazy-eights-session-v1'
const labels = ['אתם', 'נועה', 'יואב', 'מאיה']
const difficulties = [['easy', 'רגוע'], ['normal', 'חכם'], ['hard', 'מומחה']]

function Face({ card, hidden = false, disabled = false, onClick, playable = false }) {
  if (hidden) return <span className="ce-card is-back" aria-label="קלף הפוך">✦</span>
  return <button type="button" className={`ce-card${isRed(card) ? ' is-red' : ''}${playable ? ' is-playable' : ''}`} disabled={disabled} onClick={onClick} aria-label={`${rankLabel(card.rank)}${SUITS[card.suit]}`}>
    <b>{rankLabel(card.rank)}</b><span>{SUITS[card.suit]}</span>{card.rank === 8 && <em>בחירת סדרה</em>}
  </button>
}

export default function CrazyEights({ daily, onReport, onShare }) {
  const [progress, saveProgress] = useProgress('crazy-eights', { wins: 0, matches: 0, difficulty: 'normal', opponents: 1 })
  const [restored] = useState(() => { try { const value = JSON.parse(localStorage.getItem(key)); return !daily && validState(value?.game) ? value : null } catch { return null } })
  const [difficulty, setDifficulty] = useState(daily ? 'hard' : restored?.difficulty || progress.difficulty)
  const [opponents, setOpponents] = useState(daily ? 1 : restored?.opponents || progress.opponents)
  const [game, setGame] = useState(() => restored?.game || newRound({ players: (daily ? 1 : restored?.opponents || progress.opponents) + 1, seed: daily?.seed }))
  const [message, setMessage] = useState('התאימו סדרה או מספר. קלף 8 משנה את הסדרה.')
  const [showRules, setShowRules] = useState(false)
  const finished = useRef('')
  const humanMoves = availableMoves(game, 0)
  const top = game.discard.at(-1)
  const champion = matchWinner(game)

  useEffect(() => { if (daily) return; try { localStorage.setItem(key, JSON.stringify({ game, difficulty, opponents })) } catch { /* private mode */ } }, [daily, game, difficulty, opponents])
  useEffect(() => {
    if (game.phase !== 'play' || game.turn === 0) return undefined
    const timer = setTimeout(() => {
      const player = game.turn, next = aiTurn(game, difficulty)
      setMessage(next.phase === 'round-over' ? `${labels[player]} סיים את הקלפים` : `${labels[player]} שיחק. תור ${labels[next.turn]}`)
      setGame(next); sfx('slide')
    }, difficulty === 'easy' ? 850 : 600)
    return () => clearTimeout(timer)
  }, [game, difficulty])
  useEffect(() => {
    if (game.phase !== 'round-over') return
    const id = `${game.round}:${game.winner}`
    if (finished.current === id) return
    finished.current = id
    if (game.winner === 0) {
      saveProgress(previous => ({ ...previous, wins: previous.wins + 1, matches: previous.matches + (champion === 0 ? 1 : 0) }))
      onReport?.({ text: `🎱 ניצחתי בסיבוב שמיניות משוגעות וקיבלתי ${game.roundPoints} נקודות!` }); sfx('win')
    }
    daily?.finish({ won: game.winner === 0, score: game.winner === 0 ? game.roundPoints : null, text: game.winner === 0 ? `🎱 ניצחתי וקיבלתי ${game.roundPoints} נקודות` : `🎱 ${labels[game.winner]} ניצח הפעם` })
  }, [game, champion, saveProgress, onReport, daily])

  const configure = (nextOpponents = opponents, nextDifficulty = difficulty) => {
    setOpponents(nextOpponents); setDifficulty(nextDifficulty); saveProgress({ opponents: nextOpponents, difficulty: nextDifficulty })
    setGame(newRound({ players: nextOpponents + 1, seed: daily?.seed })); setMessage('משחק חדש התחיל. בהצלחה!'); finished.current = ''
  }
  const play = index => {
    const card = game.hands[0][index], next = playCard(game, 0, index)
    if (!next) { setMessage('הקלף לא מתאים לסדרה או למספר'); sfx('bump'); return }
    setGame(next); setMessage(card.rank === 8 ? 'בחרו את הסדרה שתמשיך את המשחק' : 'קלף מצוין — עכשיו תור המחשב'); sfx('slide')
  }
  const draw = () => {
    const next = drawCard(game, 0)
    if (!next) { setMessage(humanMoves.length ? 'יש לכם קלף שאפשר לשחק — הוא מסומן' : 'אי אפשר למשוך כרגע'); sfx('bump'); return }
    setGame(next); setMessage(next.turn === 0 ? 'משכתם קלף מתאים — אפשר לשחק אותו' : 'לא נמצא קלף מתאים. התור עבר'); sfx('slide')
  }
  const choose = suit => { const next = selectSuit(game, 0, suit); if (next) { setGame(next); setMessage(`בחרתם ${SUITS[suit]}`); sfx('power') } }
  const advance = () => {
    if (champion >= 0) configure(opponents, difficulty)
    else { setGame(nextRound(game)); setMessage('סיבוב חדש התחיל'); finished.current = '' }
  }

  return <div className="arc-game ce-game">
    <Hud stats={[['סיבוב', game.round], ['ניקוד', game.scores[0]], ['ניצחונות', progress.wins]]}>
      <ToolButton onClick={() => setShowRules(value => !value)} label="הוראות">?</ToolButton><ToolButton onClick={() => configure()} label="משחק חדש">🔄</ToolButton>
    </Hud>
    {!daily && <div className="ce-settings" role="group" aria-label="הגדרות משחק">
      <span>יריבים:</span>{[1, 2, 3].map(value => <button type="button" key={value} className={opponents === value ? 'is-on' : ''} onClick={() => configure(value, difficulty)}>{value}</button>)}
      <span>רמה:</span>{difficulties.map(([value, label]) => <button type="button" key={value} className={difficulty === value ? 'is-on' : ''} onClick={() => configure(opponents, value)}>{label}</button>)}
    </div>}
    {showRules && <aside className="ce-rules"><b>איך משחקים?</b> מניחים קלף מאותה סדרה או אותו מספר. אם אין — מושכים. קלף 8 מתאים תמיד ואחריו בוחרים סדרה. הראשון שנפטר מכל הקלפים מקבל את ערך הקלפים שנשארו ליריבים; הראשון ל־100 מנצח במשחק.</aside>}
    <p className="card-guide">{game.phase === 'choose-suit' ? 'בחרו את הסדרה שתרצו להמשיך בה.' : game.turn === 0 ? 'תורכם: בחרו קלף מסומן שתואם למספר או לסדרה. אין קלף מתאים? לחצו על החפיסה למשיכה.' : 'תור היריב — המתינו לתורכם.'}</p>
    <div className="ce-table">
      <div className="ce-opponents">{game.hands.slice(1).map((hand, index) => <section key={index} className={game.turn === index + 1 ? 'is-turn' : ''}><b>{labels[index + 1]}</b><span className="ce-fan">{hand.slice(0, 8).map(card => <Face key={card.id} card={card} hidden />)}</span><small>{hand.length} קלפים · {game.scores[index + 1]} נק׳</small></section>)}</div>
      <div className="ce-center"><button type="button" className="ce-stock" onClick={draw} disabled={game.turn !== 0 || game.phase !== 'play'}><span>✦</span><b>{game.stock.length || '↻'}</b><small>משיכה</small></button><div className="ce-discard"><Face card={top} disabled /><small>הסדרה הפעילה: <b className={game.activeSuit === 1 || game.activeSuit === 2 ? 'red' : ''}>{SUITS[game.activeSuit]}</b></small></div></div>
      <p className="ce-message" role="status">{message}</p>
      <section className={`ce-me${game.turn === 0 ? ' is-turn' : ''}`}><h3>הקלפים שלכם · {game.scores[0]} נק׳</h3><div className="ce-hand">{game.hands[0].map((card, index) => <Face key={card.id} card={card} playable={humanMoves.includes(index)} disabled={game.turn !== 0 || game.phase !== 'play'} onClick={() => play(index)} />)}</div></section>
    </div>
    {game.phase === 'choose-suit' && <div className="ce-suit-picker" role="dialog" aria-label="בחירת סדרה"><div><h3>איזו סדרה ממשיכה?</h3>{SUITS.map((suit, index) => <button type="button" key={suit} className={index === 1 || index === 2 ? 'red' : ''} onClick={() => choose(index)}>{suit}</button>)}</div></div>}
    {game.phase === 'round-over' && !daily && <EndCard title={champion >= 0 ? (champion === 0 ? '🏆 ניצחתם במשחק!' : `🏆 ${labels[champion]} ניצח במשחק`) : game.winner === 0 ? '🎉 ניצחתם בסיבוב!' : `${labels[game.winner]} ניצח בסיבוב`}
      text={`${labels[game.winner]} קיבל ${game.roundPoints} נקודות. התוצאה: ${game.scores.map((score, index) => `${labels[index]} ${score}`).join(' · ')}`}
      primary={champion >= 0 ? '🎱 משחק חדש' : '▶ הסיבוב הבא'} onPrimary={advance} secondary={game.winner === 0 ? '📱 שתפו' : undefined} onSecondary={() => onShare?.(`🎱 ניצחתי בשמיניות משוגעות עם ${game.scores[0]} נקודות!`)} />}
  </div>
}
