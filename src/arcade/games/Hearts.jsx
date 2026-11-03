import { useEffect, useRef, useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { dealRound, passDirection, completePassing, legalMoves, playCard, chooseAiCard, nextRound, validState } from '../logic/hearts'
import { useProgress } from '../hooks'
import { EndCard, Hud, ToolButton } from '../ui'
import { sfx } from '../sfx'
import './hearts.css'
import './card-polish.css'

const storageKey = 'buga-hearts-session-v1'
const NAMES = { he: ['אתם', 'נועה', 'יואב', 'מאיה'], en: ['You', 'Noa', 'Yoav', 'Maya'] }
const PASS_NAMES = {
  he: { left: 'שמאלה', right: 'ימינה', across: 'ממול', hold: 'בלי העברה' },
  en: { left: 'to the left', right: 'to the right', across: 'across', hold: 'with no passing' },
}
const LEVELS = { he: [['easy', 'רגוע'], ['normal', 'חכם'], ['hard', 'מומחה']], en: [['easy', 'Calm'], ['normal', 'Smart'], ['hard', 'Expert']] }

function PlayingCard({ card, hidden = false, selected = false, playable = false, disabled = false, onClick }) {
  if (hidden) return <span className="ht-card is-back">♥</span>
  return <button type="button" className={`ht-card${isRed(card) ? ' is-red' : ''}${selected ? ' is-selected' : ''}${playable ? ' is-playable' : ''}`} disabled={disabled} onClick={onClick} aria-pressed={selected} aria-label={`${rankLabel(card.rank)}${SUITS[card.suit]}`}><b>{rankLabel(card.rank)}</b><span>{SUITS[card.suit]}</span></button>
}

export default function Hearts({ daily, onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const names = NAMES[lang] || NAMES.he, passNames = PASS_NAMES[lang] || PASS_NAMES.he
  const [progress, saveProgress] = useProgress('hearts', { wins: 0, rounds: 0, difficulty: 'normal' })
  const [restored] = useState(() => { try { const value = JSON.parse(localStorage.getItem(storageKey)); return !daily && validState(value?.game) ? value : null } catch { return null } })
  const [difficulty, setDifficulty] = useState(daily ? 'hard' : restored?.difficulty || progress.difficulty)
  const [game, setGame] = useState(() => restored?.game || dealRound({ seed: daily?.seed }))
  const [passing, setPassing] = useState([])
  const [message, setMessage] = useState(game.phase === 'pass' ? (en ? 'Pick three cards to pass' : 'בחרו שלושה קלפים להעברה') : (en ? 'Whoever holds the 2♣ opens the round' : 'מי שמחזיק 2♣ פותח את הסיבוב'))
  const [rules, setRules] = useState(false)
  const reported = useRef('')
  const moves = game.phase === 'play' && game.turn === 0 ? legalMoves(game, 0) : []

  useEffect(() => { if (daily) return; try { localStorage.setItem(storageKey, JSON.stringify({ game, difficulty })) } catch { /* private mode */ } }, [daily, game, difficulty])
  useEffect(() => {
    if (game.phase !== 'play' || game.turn === 0) return undefined
    const timer = setTimeout(() => {
      const player = game.turn, index = chooseAiCard(game, player, difficulty), next = playCard(game, player, index)
      const label = `${rankLabel(game.hands[player][index].rank)}${SUITS[game.hands[player][index].suit]}`
      setGame(next)
      setMessage(next.trick.length ? (en ? `${names[player]} played ${label}` : `${names[player]} שיחק ${label}`) : (en ? `${next.lastTrickWinner === 0 ? 'You' : names[next.lastTrickWinner]} took the trick` : `${names[next.lastTrickWinner]} לקח את הלקיחה`))
      sfx('slide')
    }, difficulty === 'easy' ? 780 : 520)
    return () => clearTimeout(timer)
  }, [game, difficulty, en, names])
  useEffect(() => {
    if (!['round-over', 'match-over'].includes(game.phase)) return
    const id = `${game.round}:${game.phase}`; if (reported.current === id) return; reported.current = id
    const low = game.roundScore.indexOf(Math.min(...game.roundScore)), humanWon = low === 0
    saveProgress(previous => ({ ...previous, rounds: previous.rounds + 1, wins: previous.wins + (game.matchWinner === 0 ? 1 : 0) }))
    if (humanWon) { onReport?.({ text: en ? `♥ I finished a round of Hearts with only ${game.roundScore[0]} points` : `♥ סיימתי סיבוב לבבות עם ${game.roundScore[0]} נקודות בלבד` }); sfx('win') }
    daily?.finish({ won: humanWon, score: game.roundScore[0], text: `♥ לבבות: סיימתי עם ${game.roundScore[0]} נקודות` })
  }, [game, saveProgress, onReport, daily, en])

  const togglePass = index => setPassing(selected => selected.includes(index) ? selected.filter(value => value !== index) : selected.length < 3 ? [...selected, index] : selected)
  const pass = () => {
    const next = completePassing(game, passing, difficulty)
    if (!next) { setMessage(en ? 'You need to pick exactly three cards' : 'צריך לבחור בדיוק שלושה קלפים'); sfx('bump'); return }
    setGame(next); setPassing([]); setMessage(en ? `Cards passed ${passNames[game.pass]}. The 2♣ opens.` : `הקלפים הועברו ${passNames[game.pass]}. 2♣ פותח.`); sfx('slide')
  }
  const play = index => {
    const card = game.hands[0][index], next = playCard(game, 0, index)
    if (!next) { setMessage(en ? 'You must follow the leading suit when you can' : 'חובה לשחק לפי הסדרה המובילה כשאפשר'); sfx('bump'); return }
    setGame(next); setMessage(en ? `You played ${rankLabel(card.rank)}${SUITS[card.suit]}` : `שיחקתם ${rankLabel(card.rank)}${SUITS[card.suit]}`); sfx('slide')
  }
  const restart = () => { setGame(dealRound({ seed: daily?.seed })); setPassing([]); setMessage(en ? 'A new game has started' : 'משחק חדש התחיל'); reported.current = '' }
  const setLevel = value => { setDifficulty(value); saveProgress({ difficulty: value }); restart() }
  const advance = () => { setGame(nextRound(game)); setPassing([]); setMessage(en ? 'A new round has started' : 'סיבוב חדש התחיל'); reported.current = '' }
  const moon = game.roundScore?.indexOf(0) >= 0 && game.roundScore.filter(score => score === 26).length === 3

  return <div className="arc-game ht-game">
    <Hud stats={[[en ? 'Round' : 'סיבוב', game.round], [en ? 'Your score' : 'הניקוד שלכם', game.scores[0]], [en ? 'Hearts broken' : 'לבבות נשברו', game.heartsBroken ? (en ? 'Yes' : 'כן') : (en ? 'No' : 'לא')]]}>
      <ToolButton onClick={() => setRules(value => !value)} label={en ? 'Instructions' : 'הוראות'}>?</ToolButton><ToolButton onClick={restart} label={en ? 'New game' : 'משחק חדש'}>🔄</ToolButton>
    </Hud>
    {!daily && <div className="ht-levels" role="group" aria-label={en ? 'Opponent level' : 'רמת יריבים'}>{(LEVELS[lang] || LEVELS.he).map(([value, label]) => <button type="button" key={value} className={difficulty === value ? 'is-on' : ''} onClick={() => setLevel(value)}>{label}</button>)}</div>}
    {rules && <aside className="ht-rules">{en
      ? 'You must follow the suit that was led. You cannot lead a heart until hearts are broken, and on the first trick you cannot play a heart or the queen of spades if you have a safe card. Every heart is worth one point and the queen of spades 13. Whoever takes all 26 points "shoots the moon" and gives 26 to every opponent.'
      : 'חובה ללכת לפי הסדרה. אסור לפתוח בלב לפני שנשבר, ובלקיחה הראשונה לא משליכים לב או מלכת עלה אם יש קלף בטוח. כל לב שווה נקודה ומלכת עלה 13. מי שלוקח את כל 26 הנקודות “יורה בירח” ומעניק 26 לכל יריב.'}</aside>}
    <p className="card-guide">{game.phase === 'pass' ? (en ? 'Pick three cards from your hand, then tap the pass button.' : 'בחרו שלושה קלפים מהיד ואז לחצו על כפתור ההעברה.') : game.turn === 0 ? (en ? 'Your turn: pick a highlighted card. Try to avoid hearts and the queen of spades.' : 'תורכם: בחרו קלף מסומן. השתדלו להימנע מלבבות וממלכת עלה.') : (en ? "Opponent's turn. Wait for yours." : 'תור היריב — המתינו לתורכם.')}</p>
    <main className="ht-table">
      <div className="ht-opponents">{game.hands.slice(1).map((hand, index) => <section key={index} className={game.turn === index + 1 ? 'is-turn' : ''}><b>{names[index + 1]}</b><div>{hand.slice(0, 7).map(card => <PlayingCard key={card.id} card={card} hidden />)}</div><small>{hand.length} {en ? 'cards' : 'קלפים'} · {game.scores[index + 1]} {en ? 'pts' : 'נק׳'} · {game.taken[index + 1].reduce((sum, card) => sum + (card.suit === 1 ? 1 : card.suit === 0 && card.rank === 12 ? 13 : 0), 0)} {en ? 'this round' : 'בסיבוב'}</small></section>)}</div>
      <div className="ht-trick" aria-label={en ? 'Current trick' : 'הלקיחה הנוכחית'}>{[0, 1, 2, 3].map(player => { const item = game.trick.find(play => play.player === player); return <div key={player} className={`seat-${player}`}>{item ? <PlayingCard card={item.card} disabled /> : <span>{names[player]}</span>}</div> })}</div>
      <p className="ht-message" role="status">{message}</p>
      <section className={`ht-human${game.turn === 0 ? ' is-turn' : ''}`}><h3>{game.phase === 'pass' ? (en ? `Pick 3 cards to pass ${passNames[passDirection(game.round)]} (${passing.length}/3)` : `בחרו 3 קלפים להעברה ${passNames[passDirection(game.round)]} (${passing.length}/3)`) : (en ? `Your hand · ${game.scores[0]} points` : `היד שלכם · ${game.scores[0]} נקודות`)}</h3><div className="ht-hand">{game.hands[0].map((card, index) => <PlayingCard key={card.id} card={card} selected={passing.includes(index)} playable={moves.includes(index)} disabled={game.phase === 'pass' ? false : game.turn !== 0 || game.phase !== 'play'} onClick={() => game.phase === 'pass' ? togglePass(index) : play(index)} />)}</div>{game.phase === 'pass' && <button type="button" className="ht-pass" disabled={passing.length !== 3} onClick={pass}>{en ? 'Pass the cards' : 'העבירו את הקלפים'}</button>}</section>
    </main>
    {['round-over', 'match-over'].includes(game.phase) && !daily && <EndCard lang={lang}
      title={game.phase === 'match-over' ? (game.matchWinner === 0 ? (en ? '🏆 You won the game!' : '🏆 ניצחתם במשחק!') : (en ? `🏆 ${names[game.matchWinner]} won the game` : `🏆 ${names[game.matchWinner]} ניצח במשחק`)) : moon ? (en ? '🌙 Shot the moon!' : '🌙 ירייה בירח!') : (en ? 'The round is over' : 'הסיבוב הסתיים')}
      text={en ? `Round score: ${game.roundScore.map((score, index) => `${names[index]} ${score}`).join(' · ')}. Total: ${game.scores.join(' · ')}` : `ניקוד הסיבוב: ${game.roundScore.map((score, index) => `${names[index]} ${score}`).join(' · ')}. מצטבר: ${game.scores.join(' · ')}`}
      primary={game.phase === 'match-over' ? (en ? '♥ New game' : '♥ משחק חדש') : (en ? '▶ Next round' : '▶ הסיבוב הבא')} onPrimary={advance}
      secondary={game.roundScore[0] === Math.min(...game.roundScore) ? (en ? '📱 Share' : '📱 שתפו') : undefined}
      onSecondary={() => onShare?.(en ? `♥ I finished a round of Hearts with ${game.roundScore[0]} points!` : `♥ סיימתי סיבוב לבבות עם ${game.roundScore[0]} נקודות!`)} />}
  </div>
}
