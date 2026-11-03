import { useEffect, useRef, useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { newRound, availableMoves, playCard, selectSuit, drawCard, aiTurn, nextRound, matchWinner, validState } from '../logic/crazyEights'
import { useProgress } from '../hooks'
import { EndCard, Hud, ToolButton } from '../ui'
import { sfx } from '../sfx'
import './crazy-eights.css'
import './card-polish.css'

const key = 'buga-crazy-eights-session-v1'
const LABELS = { he: ['אתם', 'נועה', 'יואב', 'מאיה'], en: ['You', 'Noa', 'Yoav', 'Maya'] }
const DIFFS = { he: [['easy', 'רגוע'], ['normal', 'חכם'], ['hard', 'מומחה']], en: [['easy', 'Calm'], ['normal', 'Smart'], ['hard', 'Expert']] }

function Face({ card, hidden = false, disabled = false, onClick, playable = false, en = false }) {
  if (hidden) return <span className="ce-card is-back" aria-label={en ? 'Face-down card' : 'קלף הפוך'}>✦</span>
  return <button type="button" className={`ce-card${isRed(card) ? ' is-red' : ''}${playable ? ' is-playable' : ''}`} disabled={disabled} onClick={onClick} aria-label={`${rankLabel(card.rank)}${SUITS[card.suit]}`}>
    <b>{rankLabel(card.rank)}</b><span>{SUITS[card.suit]}</span>{card.rank === 8 && <em>{en ? 'Pick a suit' : 'בחירת סדרה'}</em>}
  </button>
}

export default function CrazyEights({ daily, onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const labels = LABELS[lang] || LABELS.he, difficulties = DIFFS[lang] || DIFFS.he
  const [progress, saveProgress] = useProgress('crazy-eights', { wins: 0, matches: 0, difficulty: 'normal', opponents: 1 })
  const [restored] = useState(() => { try { const value = JSON.parse(localStorage.getItem(key)); return !daily && validState(value?.game) ? value : null } catch { return null } })
  const [difficulty, setDifficulty] = useState(daily ? 'hard' : restored?.difficulty || progress.difficulty)
  const [opponents, setOpponents] = useState(daily ? 1 : restored?.opponents || progress.opponents)
  const [game, setGame] = useState(() => restored?.game || newRound({ players: (daily ? 1 : restored?.opponents || progress.opponents) + 1, seed: daily?.seed }))
  const [message, setMessage] = useState(en ? 'Match the suit or the number. An 8 changes the suit.' : 'התאימו סדרה או מספר. קלף 8 משנה את הסדרה.')
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
      setMessage(next.phase === 'round-over'
        ? (en ? `${labels[player]} played the last card` : `${labels[player]} סיים את הקלפים`)
        : (en ? `${labels[player]} played. ${next.turn === 0 ? 'Your turn' : `${labels[next.turn]}'s turn`}` : `${labels[player]} שיחק. תור ${labels[next.turn]}`))
      setGame(next); sfx('slide')
    }, difficulty === 'easy' ? 850 : 600)
    return () => clearTimeout(timer)
  }, [game, difficulty, en, labels])
  useEffect(() => {
    if (game.phase !== 'round-over') return
    const id = `${game.round}:${game.winner}`
    if (finished.current === id) return
    finished.current = id
    if (game.winner === 0) {
      saveProgress(previous => ({ ...previous, wins: previous.wins + 1, matches: previous.matches + (champion === 0 ? 1 : 0) }))
      onReport?.({ text: en ? `🎱 I won a round of Crazy Eights and scored ${game.roundPoints} points!` : `🎱 ניצחתי בסיבוב שמיניות משוגעות וקיבלתי ${game.roundPoints} נקודות!` }); sfx('win')
    }
    daily?.finish({ won: game.winner === 0, score: game.winner === 0 ? game.roundPoints : null, text: game.winner === 0 ? `🎱 ניצחתי וקיבלתי ${game.roundPoints} נקודות` : `🎱 ${labels[game.winner]} ניצח הפעם` })
  }, [game, champion, saveProgress, onReport, daily, en, labels])

  const configure = (nextOpponents = opponents, nextDifficulty = difficulty) => {
    setOpponents(nextOpponents); setDifficulty(nextDifficulty); saveProgress({ opponents: nextOpponents, difficulty: nextDifficulty })
    setGame(newRound({ players: nextOpponents + 1, seed: daily?.seed })); setMessage(en ? 'A new game has started. Good luck!' : 'משחק חדש התחיל. בהצלחה!'); finished.current = ''
  }
  const play = index => {
    const card = game.hands[0][index], next = playCard(game, 0, index)
    if (!next) { setMessage(en ? 'That card does not match the suit or the number' : 'הקלף לא מתאים לסדרה או למספר'); sfx('bump'); return }
    setGame(next)
    setMessage(card.rank === 8 ? (en ? 'Pick the suit that continues the game' : 'בחרו את הסדרה שתמשיך את המשחק') : (en ? "Nice card. Now it is the computer's turn" : 'קלף מצוין — עכשיו תור המחשב'))
    sfx('slide')
  }
  const draw = () => {
    const next = drawCard(game, 0)
    if (!next) {
      setMessage(humanMoves.length ? (en ? 'You have a card you can play. It is highlighted' : 'יש לכם קלף שאפשר לשחק — הוא מסומן') : (en ? 'You cannot draw right now' : 'אי אפשר למשוך כרגע'))
      sfx('bump'); return
    }
    setGame(next)
    setMessage(next.turn === 0 ? (en ? 'You drew a card that fits. You can play it' : 'משכתם קלף מתאים — אפשר לשחק אותו') : (en ? 'No matching card was found. The turn passes' : 'לא נמצא קלף מתאים. התור עבר'))
    sfx('slide')
  }
  const choose = suit => { const next = selectSuit(game, 0, suit); if (next) { setGame(next); setMessage(en ? `You chose ${SUITS[suit]}` : `בחרתם ${SUITS[suit]}`); sfx('power') } }
  const advance = () => {
    if (champion >= 0) configure(opponents, difficulty)
    else { setGame(nextRound(game)); setMessage(en ? 'A new round has started' : 'סיבוב חדש התחיל'); finished.current = '' }
  }

  return <div className="arc-game ce-game">
    <Hud stats={[[en ? 'Round' : 'סיבוב', game.round], [en ? 'Score' : 'ניקוד', game.scores[0]], [en ? 'Wins' : 'ניצחונות', progress.wins]]}>
      <ToolButton onClick={() => setShowRules(value => !value)} label={en ? 'Instructions' : 'הוראות'}>?</ToolButton><ToolButton onClick={() => configure()} label={en ? 'New game' : 'משחק חדש'}>🔄</ToolButton>
    </Hud>
    {!daily && <div className="ce-settings" role="group" aria-label={en ? 'Game settings' : 'הגדרות משחק'}>
      <span>{en ? 'Opponents:' : 'יריבים:'}</span>{[1, 2, 3].map(value => <button type="button" key={value} className={opponents === value ? 'is-on' : ''} onClick={() => configure(value, difficulty)}>{value}</button>)}
      <span>{en ? 'Level:' : 'רמה:'}</span>{difficulties.map(([value, label]) => <button type="button" key={value} className={difficulty === value ? 'is-on' : ''} onClick={() => configure(opponents, value)}>{label}</button>)}
    </div>}
    {showRules && <aside className="ce-rules">{en
      ? <><b>How to play:</b> Play a card of the same suit or the same number. If you cannot, draw. An 8 always fits, and then you pick a suit. The first player to get rid of every card scores the value of the cards left in the opponents' hands; the first to 100 wins the game.</>
      : <><b>איך משחקים?</b> מניחים קלף מאותה סדרה או אותו מספר. אם אין — מושכים. קלף 8 מתאים תמיד ואחריו בוחרים סדרה. הראשון שנפטר מכל הקלפים מקבל את ערך הקלפים שנשארו ליריבים; הראשון ל־100 מנצח במשחק.</>}</aside>}
    <p className="card-guide">{game.phase === 'choose-suit' ? (en ? 'Pick the suit you want to continue with.' : 'בחרו את הסדרה שתרצו להמשיך בה.') : game.turn === 0 ? (en ? 'Your turn: pick a highlighted card that matches the number or the suit. No matching card? Tap the deck to draw.' : 'תורכם: בחרו קלף מסומן שתואם למספר או לסדרה. אין קלף מתאים? לחצו על החפיסה למשיכה.') : (en ? "Opponent's turn. Wait for yours." : 'תור היריב — המתינו לתורכם.')}</p>
    <div className="ce-table">
      <div className="ce-opponents">{game.hands.slice(1).map((hand, index) => <section key={index} className={game.turn === index + 1 ? 'is-turn' : ''}><b>{labels[index + 1]}</b><span className="ce-fan">{hand.slice(0, 8).map(card => <Face key={card.id} card={card} hidden en={en} />)}</span><small>{hand.length} {en ? 'cards' : 'קלפים'} · {game.scores[index + 1]} {en ? 'pts' : 'נק׳'}</small></section>)}</div>
      <div className="ce-center"><button type="button" className="ce-stock" onClick={draw} disabled={game.turn !== 0 || game.phase !== 'play'}><span>✦</span><b>{game.stock.length || '↻'}</b><small>{en ? 'Draw' : 'משיכה'}</small></button><div className="ce-discard"><Face card={top} disabled en={en} /><small>{en ? 'Active suit:' : 'הסדרה הפעילה:'} <b className={game.activeSuit === 1 || game.activeSuit === 2 ? 'red' : ''}>{SUITS[game.activeSuit]}</b></small></div></div>
      <p className="ce-message" role="status">{message}</p>
      <section className={`ce-me${game.turn === 0 ? ' is-turn' : ''}`}><h3>{en ? 'Your cards' : 'הקלפים שלכם'} · {game.scores[0]} {en ? 'pts' : 'נק׳'}</h3><div className="ce-hand">{game.hands[0].map((card, index) => <Face key={card.id} en={en} card={card} playable={humanMoves.includes(index)} disabled={game.turn !== 0 || game.phase !== 'play'} onClick={() => play(index)} />)}</div></section>
    </div>
    {game.phase === 'choose-suit' && <div className="ce-suit-picker" role="dialog" aria-label={en ? 'Choose a suit' : 'בחירת סדרה'}><div><h3>{en ? 'Which suit continues?' : 'איזו סדרה ממשיכה?'}</h3>{SUITS.map((suit, index) => <button type="button" key={suit} className={index === 1 || index === 2 ? 'red' : ''} onClick={() => choose(index)}>{suit}</button>)}</div></div>}
    {game.phase === 'round-over' && !daily && <EndCard lang={lang}
      title={champion >= 0
        ? (champion === 0 ? (en ? '🏆 You won the game!' : '🏆 ניצחתם במשחק!') : (en ? `🏆 ${labels[champion]} won the game` : `🏆 ${labels[champion]} ניצח במשחק`))
        : game.winner === 0 ? (en ? '🎉 You won the round!' : '🎉 ניצחתם בסיבוב!') : (en ? `${labels[game.winner]} won the round` : `${labels[game.winner]} ניצח בסיבוב`)}
      text={en ? `${labels[game.winner]} scored ${game.roundPoints} points. Score: ${game.scores.map((score, index) => `${labels[index]} ${score}`).join(' · ')}` : `${labels[game.winner]} קיבל ${game.roundPoints} נקודות. התוצאה: ${game.scores.map((score, index) => `${labels[index]} ${score}`).join(' · ')}`}
      primary={champion >= 0 ? (en ? '🎱 New game' : '🎱 משחק חדש') : (en ? '▶ Next round' : '▶ הסיבוב הבא')} onPrimary={advance}
      secondary={game.winner === 0 ? (en ? '📱 Share' : '📱 שתפו') : undefined}
      onSecondary={() => onShare?.(en ? `🎱 I won at Crazy Eights with ${game.scores[0]} points!` : `🎱 ניצחתי בשמיניות משוגעות עם ${game.scores[0]} נקודות!`)} />}
  </div>
}
