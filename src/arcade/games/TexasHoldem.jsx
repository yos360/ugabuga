import { useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { act, DIFFICULTIES, legalActions, newHoldem, runBots, STREETS } from '../logic/holdem'
import { useProgress } from '../hooks'
import { Hud, Segmented, ToolButton } from '../ui'
import { sfx } from '../sfx'
import './texas-holdem.css'
import './card-polish.css'

function Card({ card, hidden, empty }) { return <span className={`th-card${hidden ? ' is-back' : ''}${empty ? ' is-empty' : ''}${card && isRed(card) ? ' is-red' : ''}`}>{empty ? '' : hidden ? 'UB' : <><b>{rankLabel(card.rank)}</b><i>{SUITS[card.suit]}</i></>}</span> }
const prepare = options => runBots(newHoldem(options))

export default function TexasHoldem({ daily, onReport, onShare }) {
  const [progress, save] = useProgress('texas-holdem', { wins: 0, hands: 0, best: 1000, game: null })
  const [difficulty, setDifficulty] = useState(progress.game?.difficulty || 'medium'), [opponents, setOpponents] = useState(Math.max(1, (progress.game?.players?.length || 4) - 1))
  const [game, setGame] = useState(() => progress.game && progress.game.stage !== 'ended' ? progress.game : prepare({ opponents, difficulty }))
  const commit = next => {
    setGame(next); sfx(next.stage === 'ended' ? (next.result?.winners.includes(0) ? 'win' : 'bump') : 'slide')
    if (next.stage !== 'ended') { save({ game: next }); return }
    const won = next.result.winners.includes(0), chips = next.players[0].stack
    save({ game: null, hands: progress.hands + 1, wins: progress.wins + (won ? 1 : 0), best: Math.max(progress.best, chips) })
    if (won) onReport?.({ text: `♠️ זכיתי ביד טקסס הולדם עם ${chips} אסימונים` })
    daily?.finish({ won, score: won ? chips : null, text: won ? '♠️ זכיתי ביד ההולדם היומית' : '♠️ יד ההולדם היומית הסתיימה' })
  }
  const perform = (type, amount) => commit(runBots(act(game, type, amount)))
  const start = (nextOpponents = opponents, nextDifficulty = difficulty) => { const next = prepare({ opponents: nextOpponents, difficulty: nextDifficulty }); setGame(next); save({ game: next }) }
  const nextHand = () => {
    const stacks = game.players.map(player => player.stack), tournamentOver = !stacks[0] || stacks.filter(Boolean).length === 1
    const next = prepare({ opponents, difficulty, stacks: tournamentOver ? undefined : stacks, handNumber: tournamentOver ? 0 : game.handNumber + 1 }); setGame(next); save({ game: next })
  }
  const legal = game.current === 0 ? legalActions(game) : [], toCall = Math.max(0, ...game.players.map(player => player.bet)) - game.players[0].bet, reveal = game.stage === 'ended'
  const labels = { fold: 'פרישה', check: 'בדיקה', call: `השוואה ${toCall}`, bet: 'הימור', raise: 'העלאה', 'all-in': 'הכול בפנים' }
  return <div className="arc-game th-game">
    <Hud stats={[['אסימונים', game.players[0].stack], ['קופה', game.pot], ['בליינד', game.bigBlind], ['יד', game.handNumber + 1]]}><ToolButton onClick={() => start()} label="טורניר חדש">🔄</ToolButton></Hud>
    <p className="card-guide">{game.stage === 'ended' ? 'היד הסתיימה. לחצו על היד הבאה כדי להמשיך.' : 'צרו את היד הטובה ביותר משני הקלפים שלכם ומהקלפים המשותפים. בחרו פעולה בכפתורים בתחתית השולחן.'}</p>
    <div className="th-table">
      <div className="th-opponents">{game.players.slice(1).map(player => <div key={player.id} className={`th-seat${game.current === player.id ? ' is-turn' : ''}${player.folded ? ' is-folded' : ''}`}><b>🤖 {player.name}</b><small>{player.stack} אסימונים {player.allIn && '• הכול בפנים'}</small><div><Card card={player.hole[0]} hidden={!reveal} /><Card card={player.hole[1]} hidden={!reveal} /></div><em>{player.bet ? `${player.bet} בקופה` : player.folded ? 'פרש' : ''}</em></div>)}</div>
      <div className="th-center"><span className="th-stage">{STREETS[game.stage]}</span><div className="th-board">{Array.from({ length: 5 }, (_, index) => <Card key={index} card={game.board[index]} empty={!game.board[index]} />)}</div><strong>🏆 {game.pot}</strong><p role="status">{game.message}</p></div>
      <div className={`th-seat th-player${game.current === 0 ? ' is-turn' : ''}${game.players[0].folded ? ' is-folded' : ''}`}><b>אתם</b><small>{game.players[0].stack} אסימונים</small><div><Card card={game.players[0].hole[0]} /><Card card={game.players[0].hole[1]} /></div><em>{game.players[0].bet ? `${game.players[0].bet} בקופה` : ''}</em></div>
      <div className="th-actions">{legal.map(type => <button type="button" key={type} className={type === 'all-in' || type === 'raise' || type === 'bet' ? 'primary' : ''} onClick={() => perform(type, Math.max(game.bigBlind, Math.floor(game.pot / 2)))}>{labels[type]}</button>)}{game.stage === 'ended' && <button type="button" className="primary" onClick={nextHand}>היד הבאה</button>}</div>
      {game.stage === 'ended' && <div className="th-awards">{game.result.awards.map((amount, index) => amount ? <span key={index}>{game.players[index].name}: <b>+{amount}</b></span> : null)}</div>}
    </div>
    {!daily && <div className="th-settings"><Segmented label="מספר יריבים" value={opponents} onChange={value => { const count = Number(value); setOpponents(count); start(count, difficulty) }} options={[[1,'יריב 1'],[2,'2 יריבים'],[3,'3 יריבים'],[4,'4 יריבים'],[5,'5 יריבים']]} /><Segmented label="רמת היריבים" value={difficulty} onChange={value => { setDifficulty(value); start(opponents, value) }} options={Object.entries(DIFFICULTIES)} /></div>}
    <button className="th-share" type="button" onClick={() => onShare?.(`♠️ שיחקתי טקסס הולדם בעוגה בוגה — ${progress.wins} זכיות בידיים!`)}>📱 שתפו תוצאה</button>
  </div>
}
