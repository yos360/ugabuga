import { useEffect, useState } from 'react'
import { SUITS, isRed, rankLabel } from '../logic/cards'
import { act, bettingLimits, DIFFICULTIES, legalActions, newHoldem, nextHand, stepBot, STREETS, VERSION } from '../logic/holdem'
import { bestHand } from '../logic/poker'
import { LEVELS_EN, STREETS_EN, handName, holdemMessageEn, holdemName } from '../logic/pokerText'
import { useProgress } from '../hooks'
import { sfx } from '../sfx'
import './texas-holdem.css'

function Card({ card, hidden = false, en = false }) {
  return <span aria-label={!card ? (en ? 'Community card not yet revealed' : 'קלף משותף טרם נפתח') : hidden ? (en ? 'Hidden card' : 'קלף מוסתר') : `${rankLabel(card.rank)} ${SUITS[card.suit]}`} className={`th-card${!card ? ' is-empty' : hidden ? ' is-back' : isRed(card) ? ' is-red' : ''}`}>
    {card && (hidden ? <span>{en ? 'UB' : 'עב'}</span> : <><b>{rankLabel(card.rank)}</b><i>{SUITS[card.suit]}</i></>)}
  </span>
}
function Chips({ amount }) { return <span className="th-chips"><i aria-hidden="true"><i /><i /></i><b>{amount.toLocaleString()}</b></span> }
function restore(saved, daily) {
  if (saved?.version === VERSION) return saved
  // Old snapshots lack action/reopen history. Refund commitments and redeal,
  // preserving every tournament chip, and tell the player why.
  if (saved?.players?.length >= 2 && !daily) return { ...newHoldem({ stacks: saved.players.map(p => p.stack + (saved.stage === 'ended' ? 0 : p.total || 0)), handNumber: saved.handNumber || 0, difficulty: saved.difficulty }), migration: true }
  return newHoldem({ seed: daily?.seed, opponents: 3, difficulty: 'medium' })
}
const positions = {
  2: [[50, 83], [50, 12]],
  3: [[50, 83], [19, 22], [81, 22]],
  4: [[50, 83], [16, 43], [50, 12], [84, 43]],
  5: [[50, 83], [16, 57], [25, 15], [75, 15], [84, 57]],
  6: [[50, 83], [15, 65], [17, 26], [50, 10], [83, 26], [85, 65]],
}

export default function TexasHoldem({ daily, onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, save] = useProgress(daily ? `texas-holdem-daily-${daily.seed}` : 'texas-holdem', { wins: 0, hands: 0, best: 1000, game: null })
  const [game, setGame] = useState(() => restore(progress.game, daily))
  const [difficulty, setDifficulty] = useState(game.difficulty), [opponents, setOpponents] = useState(game.players.length - 1)
  const [raising, setRaising] = useState(false), [raiseTo, setRaiseTo] = useState(0), [confirmNew, setConfirmNew] = useState(false)
  useEffect(() => { save({ game }) }, [game, save])
  const commit = next => {
    if (next === game) return
    setGame(next); setRaising(false)
    sfx(next.stage === 'ended' ? 'win' : 'slide')
    if (next.stage === 'ended' && game.stage !== 'ended') {
      const won = next.result.winners.includes(0), chips = next.players[0].stack
      save(previous => ({ hands: previous.hands + 1, wins: previous.wins + Number(won), best: Math.max(previous.best, chips), game: next }))
      if (won) onReport?.({ text: en ? `♠️ I won a Texas Hold'em hand with ${chips} chips` : `♠️ זכיתי ביד טקסס הולדם עם ${chips} אסימונים` })
      daily?.finish({ won, score: won ? chips : null, text: won ? '♠️ זכיתי ביד ההולדם היומית' : '♠️ יד ההולדם היומית הסתיימה' })
    }
  }
  useEffect(() => {
    if (game.stage === 'ended' || game.current === 0 || confirmNew) return undefined
    const timer = setTimeout(() => commit(stepBot(game)), 480)
    return () => clearTimeout(timer)
  })
  const legal = legalActions(game), heroTurn = game.current === 0 && game.stage !== 'ended'
  const limits = bettingLimits(game, 0), aggressive = legal.includes('raise') ? 'raise' : legal.includes('bet') ? 'bet' : null
  const shortShove = heroTurn && !aggressive && legal.includes('all-in') && limits.max > game.currentBet
  const tournamentOver = game.players[0].stack === 0 || game.players.filter(p => p.stack > 0).length <= 1
  const perform = (type, amount) => commit(act(game, type, amount))
  const start = () => { setGame(newHoldem({ opponents, difficulty, seed: daily?.seed })); setConfirmNew(false); setRaising(false) }
  const preset = fraction => setRaiseTo(Math.min(limits.max, Math.max(limits.min, game.currentBet + Math.floor((game.pot + limits.toCall) * fraction))))
  const levels = en ? LEVELS_EN : DIFFICULTIES
  const nm = p => holdemName(p.name, en)
  return <div className="arc-game th-game">
    <header className="th-header"><div><span className="th-eyebrow">{en ? 'Ugabuga • Card Club' : 'עוגה בוגה • מועדון הקלפים'}</span><h3>TEXAS HOLD’EM</h3></div><span className="th-play-money">{en ? 'Play chips only' : 'אסימונים למשחק בלבד'}</span></header>
    <div className="th-meta"><span>{en ? 'Hand' : 'יד'} <b>{game.handNumber + 1}</b></span><span>{en ? 'Blinds' : 'בליינדים'} <b>{game.bigBlind / 2} / {game.bigBlind}</b></span><span>{levels[game.difficulty]}</span><button type="button" onClick={() => setConfirmNew(true)}>{en ? 'New tournament' : 'טורניר חדש'}</button></div>
    {game.migration && <p className="th-notice">{en ? 'Your old save was upgraded: the bets were returned and the hand was dealt again. All chips were kept.' : 'השמירה הישנה שודרגה: ההימורים הוחזרו וחולקה יד מחדש. כל האסימונים נשמרו.'}</p>}
    <div className="th-table" aria-label={en ? "Texas Hold'em table" : 'שולחן טקסס הולדם'}>
      <div className="th-felt" aria-hidden="true" />
      <div className="th-center"><span className="th-stage">{(en ? STREETS_EN : STREETS)[game.stage]}</span><div className="th-pot">{en ? 'Pot' : 'קופה'} <Chips amount={game.pot} /></div><div className="th-board">{Array.from({ length: 5 }, (_, i) => <Card en={en} key={`${game.handNumber}-${i}-${game.board[i]?.id ?? 'empty'}`} card={game.board[i]} />)}</div><span className="th-brand">{en ? 'Ugabuga ♠' : 'עוגה בוגה ♠'}</span></div>
      {game.players.map((p, i) => {
        const [x, y] = positions[game.players.length][i], show = i === 0 || (game.result?.showdown && !p.folded)
        return <div key={i} data-seat={i} style={{ '--seat-x': `${x}%`, '--seat-y': `${y}%` }} className={`th-seat${i === 0 ? ' th-hero' : ''}${game.current === i ? ' is-turn' : ''}${p.folded ? ' is-folded' : ''}${p.busted ? ' is-busted' : ''}`}>
          <div className="th-seat-label"><b>{nm(p)}</b><span className="th-markers">{i === game.dealer && <i title={en ? 'Dealer' : 'דילר'}>D</i>}{i === game.smallBlindSeat && <i title={en ? 'Small blind' : 'סמול בליינד'}>SB</i>}{i === game.bigBlindSeat && <i title={en ? 'Big blind' : 'ביג בליינד'}>BB</i>}</span></div>
          <div className="th-hole">{p.hole.map(c => <Card en={en} key={`${game.handNumber}-${c.id}`} card={c} hidden={!show} />)}</div>
          <div className="th-stack"><Chips amount={p.stack} /></div>
          <div className="th-seat-state">{p.busted ? (en ? 'Out' : 'הודח') : p.folded ? (en ? 'Folded' : 'פרש') : p.allIn ? 'ALL-IN' : game.current === i ? (en ? 'To act' : 'בתור') : ' '}</div>
          {!!p.bet && <span className="th-bet"><Chips amount={p.bet} /></span>}
          {!!game.result?.awards[i] && <span className="th-win">+{game.result.awards[i]}</span>}
        </div>
      })}
    </div>
    <section className="th-controls" aria-label={en ? 'Game actions' : 'פעולות המשחק'}>
      <p className="th-message" role="status">{game.stage === 'ended' ? (en ? holdemMessageEn(game.message) : game.message) : heroTurn ? (en ? 'Your turn • choose an action' : 'תורכם • בחרו פעולה') : (en ? `${nm(game.players[game.current] || { name: '' })} is thinking…` : `${game.players[game.current]?.name} חושב…`)}</p>
      {game.stage === 'ended' && <div className="th-showdown">{game.result.showdown && game.players.filter(p => !p.folded && !p.busted).map(p => <span key={p.id}>{nm(p)}: <b>{handName(bestHand([...p.hole, ...game.board]), en)}</b></span>)}{game.result.pots.length > 1 && <span>{en ? `${game.result.pots.length} pots were awarded` : `${game.result.pots.length} קופות חולקו`}</span>}</div>}
      {raising && heroTurn && <div className="th-raise-panel">
        <div className="th-raise-value"><label htmlFor="th-raise-slider">{game.currentBet ? (en ? 'Raise to' : 'העלאה לסך') : (en ? 'Bet' : 'הימור בסך')} <output>{raiseTo}</output></label><button type="button" aria-label={en ? 'Close the raise' : 'סגירת ההעלאה'} onClick={() => setRaising(false)}>✕</button></div>
        <input id="th-raise-slider" type="range" aria-label={en ? 'Bet amount' : 'סכום ההימור'} min={limits.min} max={limits.max} step="1" value={raiseTo} onChange={e => setRaiseTo(Number(e.target.value))} />
        <div className="th-presets"><button type="button" onClick={() => preset(.5)}>1/2 POT</button><button type="button" onClick={() => preset(.75)}>3/4 POT</button><button type="button" onClick={() => preset(1)}>POT</button><button type="button" onClick={() => setRaiseTo(limits.max)}>ALL-IN</button></div>
      </div>}
      <div className="th-actions">
        {game.stage !== 'ended' ? <><button type="button" disabled={!heroTurn} onClick={() => perform('fold')}>FOLD<small>{en ? 'Give up the hand' : 'פרישה'}</small></button><button type="button" disabled={!heroTurn} onClick={() => perform(limits.toCall ? 'call' : 'check')}>{limits.toCall ? `CALL ${limits.toCall}` : 'CHECK'}<small>{limits.toCall ? (en ? 'Match the bet' : 'השוואה') : (en ? 'Pass' : 'בדיקה')}</small></button><button type="button" className="primary" disabled={!heroTurn || (!aggressive && !shortShove)} onClick={() => shortShove ? perform('all-in') : raising ? perform(aggressive, raiseTo) : (setRaiseTo(limits.min), setRaising(true))}>{shortShove ? 'ALL-IN' : raising ? `${game.currentBet ? 'RAISE' : 'BET'} ${raiseTo}` : game.currentBet ? 'RAISE' : 'BET'}<small>{raising ? (en ? 'Confirm the amount' : 'אישור הסכום') : (en ? 'Choose an amount' : 'בחירת סכום')}</small></button></> : <button type="button" className="primary" onClick={() => tournamentOver ? setConfirmNew(true) : commit(nextHand(game))}>{tournamentOver ? (en ? 'New tournament' : 'טורניר חדש') : (en ? 'Next hand' : 'היד הבאה')}</button>}
      </div>
    </section>
    {!daily && <details className="th-settings"><summary>{en ? 'Tournament settings' : 'הגדרות הטורניר'}</summary><p>{en ? 'Changes apply only when a new tournament starts.' : 'השינויים יחולו רק בפתיחת טורניר חדש.'}</p><label>{en ? 'Opponents' : 'מספר יריבים'}<select aria-label={en ? 'Number of opponents' : 'מספר יריבים'} value={opponents} onChange={e => setOpponents(Number(e.target.value))}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}</select></label><label>{en ? 'Level' : 'רמה'}<select aria-label={en ? 'Opponent level' : 'רמת היריבים'} value={difficulty} onChange={e => setDifficulty(e.target.value)}>{Object.entries(levels).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label><button type="button" onClick={() => setConfirmNew(true)}>{en ? 'Start a tournament with these settings' : 'פתיחת טורניר עם ההגדרות'}</button></details>}
    <footer className="th-footer"><span>{en ? 'No real money • blinds go up every 5 hands' : 'ללא כסף אמיתי • הבליינדים עולים כל 5 ידיים'}</span><button type="button" onClick={() => onShare?.(en ? `♠️ I played Texas Hold'em on Ugabuga: ${progress.wins} hands won!` : `♠️ שיחקתי טקסס הולדם בעוגה בוגה — ${progress.wins} זכיות בידיים!`)}>{en ? 'Share' : 'שיתוף'}</button></footer>
    {confirmNew && <div className="th-confirm" role="dialog" aria-modal="true" aria-label={en ? 'Start a new tournament' : 'פתיחת טורניר חדש'}><div><h3>{en ? 'Start a new tournament?' : 'לפתוח טורניר חדש?'}</h3><p>{en ? 'The saved tournament will be replaced. Every player starts with 1,000 chips.' : 'הטורניר השמור יוחלף. מתחילים עם 1,000 אסימונים לכל שחקן.'}</p><button type="button" autoFocus onClick={() => setConfirmNew(false)}>{en ? 'Back to the game' : 'חזרה למשחק'}</button><button type="button" className="primary" onClick={start}>{en ? 'Start tournament' : 'התחלת טורניר'}</button></div></div>}
  </div>
}
