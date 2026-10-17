import { useEffect, useRef, useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { dealRound, bestMelds, drawCard, discardCard, aiTurn, nextRound, validState } from '../logic/ginRummy'
import { useProgress } from '../hooks'
import { EndCard, Hud, ToolButton } from '../ui'
import { sfx } from '../sfx'
import './gin-rummy.css'

const key = 'buga-gin-rummy-session-v1'
function Face({ card, hidden = false, selected = false, meld = false, onClick, disabled }) {
  if (hidden) return <span className="gr-card is-back">◆</span>
  return <button type="button" className={`gr-card${isRed(card) ? ' is-red' : ''}${selected ? ' is-selected' : ''}${meld ? ' is-meld' : ''}`} onClick={onClick} disabled={disabled} aria-label={`${rankLabel(card.rank)}${SUITS[card.suit]}`}><b>{rankLabel(card.rank)}</b><span>{SUITS[card.suit]}</span></button>
}

export default function GinRummy({ daily, onReport, onShare }) {
  const [progress, saveProgress] = useProgress('gin-rummy', { wins: 0, rounds: 0, difficulty: 'normal' })
  const [restored] = useState(() => { try { const value = JSON.parse(localStorage.getItem(key)); return !daily && validState(value?.game) ? value : null } catch { return null } })
  const [difficulty, setDifficulty] = useState(daily ? 'hard' : restored?.difficulty || progress.difficulty)
  const [game, setGame] = useState(() => restored?.game || dealRound({ seed: daily?.seed }))
  const [selected, setSelected] = useState(null), [message, setMessage] = useState('משכו קלף מהחפיסה או מערימת ההשלכה'), [rules, setRules] = useState(false)
  const reported = useRef(''), analysis = bestMelds(game.hands[0]), meldIds = new Set(analysis.melds.flatMap(meld => meld.cards.map(card => card.id)))

  useEffect(() => { if (daily) return; try { localStorage.setItem(key, JSON.stringify({ game, difficulty })) } catch { /* private mode */ } }, [daily, game, difficulty])
  useEffect(() => {
    if (game.turn !== 1 || game.phase !== 'draw') return undefined
    const timer = setTimeout(() => { const next = aiTurn(game, difficulty); setGame(next); setMessage(['round-over', 'match-over'].includes(next.phase) ? 'המחשב סיים את הסיבוב' : 'המחשב משך והשליך. תורכם'); sfx('slide') }, difficulty === 'easy' ? 900 : 650)
    return () => clearTimeout(timer)
  }, [game, difficulty])
  useEffect(() => {
    if (!['round-over', 'match-over'].includes(game.phase)) return
    const id = `${game.round}:${game.phase}`; if (reported.current === id) return; reported.current = id
    const won = game.result?.winner === 0
    saveProgress(previous => ({ ...previous, rounds: previous.rounds + 1, wins: previous.wins + (won ? 1 : 0) }))
    if (won) { onReport?.({ text: `🃏 ניצחתי בסיבוב ג׳ין רמי וקיבלתי ${game.result.points} נקודות` }); sfx('win') }
    daily?.finish({ won, score: won ? game.result.points : null, text: won ? `🃏 ג׳ין רמי: ניצחתי ב־${game.result.points} נקודות` : '🃏 ג׳ין רמי: המחשב ניצח הפעם' })
  }, [game, saveProgress, onReport, daily])

  const draw = source => { const next = drawCard(game, 0, source); if (!next) { setMessage('קודם צריך לסיים את הפעולה הנוכחית'); sfx('bump'); return } setGame(next); setMessage('בחרו קלף להשלכה, או דפקו אם נשארו עד 10 נקודות'); sfx('slide') }
  const discard = knock => {
    if (selected === null) { setMessage('בחרו קלף מהיד'); sfx('bump'); return }
    const next = discardCard(game, 0, selected, knock)
    if (!next) { setMessage(knock ? 'אפשר לדפוק רק עם 10 נקודות Deadwood או פחות' : 'אי אפשר להחזיר מיד את הקלף שנלקח מערימת ההשלכה'); sfx('bump'); return }
    setGame(next); setSelected(null); setMessage(knock ? 'דפקתם — מחשבים את הניקוד' : 'הקלף הושלך. תור המחשב'); sfx('slide')
  }
  const restart = () => { setGame(dealRound({ seed: daily?.seed })); setSelected(null); setMessage('משחק חדש התחיל'); reported.current = '' }
  const advance = () => { setGame(nextRound(game)); setSelected(null); setMessage('סיבוב חדש התחיל'); reported.current = '' }
  const setLevel = value => { setDifficulty(value); saveProgress({ difficulty: value }); restart() }
  const resultTitle = game.result?.gin ? (game.result.winner === 0 ? '✨ ג׳ין!' : 'המחשב עשה ג׳ין') : game.result?.undercut ? (game.result.winner === 0 ? '⚡ אנדרקאט!' : 'המחשב עשה אנדרקאט') : game.result?.winner === 0 ? '🎉 ניצחתם בסיבוב!' : 'המחשב ניצח בסיבוב'

  return <div className="arc-game gr-game"><Hud stats={[['סיבוב', game.round], ['אתם', game.scores[0]], ['המחשב', game.scores[1]], ['Deadwood', analysis.deadwood]]}><ToolButton onClick={() => setRules(value => !value)} label="הוראות">?</ToolButton><ToolButton onClick={restart} label="משחק חדש">🔄</ToolButton></Hud>
    {!daily && <div className="gr-levels">{[['easy', 'רגוע'], ['normal', 'חכם'], ['hard', 'מומחה']].map(([value, label]) => <button type="button" key={value} className={difficulty === value ? 'is-on' : ''} onClick={() => setLevel(value)}>{label}</button>)}</div>}
    {rules && <aside className="gr-rules">בכל תור מושכים קלף ואז משליכים. יוצרים שלישיות או רביעיות מאותו מספר ורצפים של לפחות שלושה מאותה סדרה. אפשר לדפוק עם עד 10 נקודות Deadwood; יד בלי Deadwood היא ג׳ין ומקבלת בונוס 25. אם ליריב נשאר פחות Deadwood לאחר Layoff הוא עושה אנדרקאט ומקבל בונוס 25.</aside>}
    <main className="gr-table"><section className="gr-opponent"><b>המחשב · {game.hands[1].length} קלפים</b><div>{game.hands[1].map(card => <Face key={card.id} card={card} hidden />)}</div></section>
      <div className="gr-center"><button type="button" className="gr-stock" onClick={() => draw('stock')} disabled={game.turn !== 0 || game.phase !== 'draw'}><span>◆</span><b>{game.stock.length}</b><small>חפיסה</small></button><div><Face card={game.discard.at(-1)} disabled={game.turn !== 0 || game.phase !== 'draw'} onClick={() => draw('discard')} /><small>השלכה</small></div></div>
      <p className="gr-message" role="status">{message}</p><section className="gr-human"><h3>היד שלכם · Deadwood {analysis.deadwood}</h3><div className="gr-hand">{game.hands[0].map((card, index) => <Face key={card.id} card={card} selected={selected === index} meld={meldIds.has(card.id)} disabled={game.turn !== 0 || game.phase !== 'discard'} onClick={() => setSelected(index)} />)}</div>{game.turn === 0 && game.phase === 'discard' && <div className="gr-actions"><button type="button" onClick={() => discard(false)}>השליכו</button><button type="button" disabled={analysis.deadwood > 10} onClick={() => discard(true)}>{analysis.deadwood === 0 ? '✨ ג׳ין' : '✊ Knock'}</button></div>}</section>
    </main>{['round-over', 'match-over'].includes(game.phase) && !daily && <EndCard title={game.result?.draw ? 'החפיסה נגמרה' : resultTitle} text={game.result?.draw ? 'הסיבוב הסתיים ללא ניקוד.' : `Deadwood: אתם ${game.result.knocker === 0 ? game.result.knockerDeadwood : game.result.opponentDeadwood}, המחשב ${game.result.knocker === 1 ? game.result.knockerDeadwood : game.result.opponentDeadwood}. ${game.result.points} נקודות למנצח.`} primary={game.phase === 'match-over' ? '🃏 משחק חדש' : '▶ הסיבוב הבא'} onPrimary={advance} secondary={game.result?.winner === 0 ? '📱 שתפו' : undefined} onSecondary={() => onShare?.(`🃏 ניצחתי בג׳ין רמי וקיבלתי ${game.result.points} נקודות!`)} />}</div>
}
