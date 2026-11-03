import { useEffect, useRef, useState } from 'react'
import { deal, apply, legal, bestTarget, findHint, autoFinish, isWon, validState } from '../logic/freecell'
import { SUITS } from '../logic/cards'
import { useBox, useCardDrag, useProgress } from '../hooks'
import { Card, Slot } from '../cardsUi'
import { EndCard, Hud } from '../ui'
import { RotateCcw, Lightbulb, Sparkles, RotateCw } from 'lucide-react'
import { sfx } from '../sfx'
import './freecell.css'

const storageKey = 'buga-freecell-session-v1'
const sourceFor = key => key[0] === 'c' ? { type: 'cell', pile: +key.slice(1) } : key[0] === 'f' ? { type: 'found', pile: +key.slice(1) } : (() => { const [pile, index] = key.slice(1).split(':').map(Number); return { type: 'tab', pile, index } })()
const targetFor = key => key[0] === 'c' ? { type: 'cell', pile: +key.slice(1) } : key[0] === 'f' ? { type: 'found', pile: +key.slice(1) } : { type: 'tab', pile: +key.slice(1).split(':')[0] }
const keyFor = source => source.type === 'tab' ? `t${source.pile}:${source.index}` : `${source.type === 'cell' ? 'c' : 'f'}${source.pile}`
const fmt = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export default function FreeCell({ daily, onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const [restored] = useState(() => { try { const value = JSON.parse(localStorage.getItem(storageKey)); return !daily && validState(value?.state) ? value : false } catch { return false } })
  const [initialNumber] = useState(() => daily?.seed || restored?.state?.dealNumber || Math.floor(Math.random() * 1_000_000) + 1)
  const [state, setState] = useState(() => daily ? deal(initialNumber) : restored?.state || deal(initialNumber))
  const [dealInput, setDealInput] = useState(String(initialNumber))
  const [history, setHistory] = useState([])
  const [seconds, setSeconds] = useState(() => restored?.seconds || 0)
  const [hint, setHint] = useState(null)
  const [message, setMessage] = useState('')
  const [boxRef, box] = useBox()
  const [progress, saveProgress] = useProgress('freecell', { wins: 0, best: 0 })
  const reported = useRef(false), hintTimer = useRef(0)
  const won = isWon(state)

  useEffect(() => { if (!state.moves || won) return undefined; const timer = setInterval(() => setSeconds(value => value + 1), 1000); return () => clearInterval(timer) }, [state.moves, won])
  useEffect(() => { if (daily) return; try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, state, seconds })) } catch { /* private mode */ } }, [daily, state, seconds])
  useEffect(() => () => clearTimeout(hintTimer.current), [])
  useEffect(() => {
    if (!won || reported.current) return
    reported.current = true; sfx('win')
    if (daily) daily.finish({ won: true, score: seconds, text: en ? `🃏 FreeCell: won in ${fmt(seconds)} and ${state.moves} moves` : `🃏 פריסל: ניצחתי תוך ${fmt(seconds)} ו־${state.moves} מהלכים` })
    else {
      saveProgress(previous => ({ wins: previous.wins + 1, best: previous.best ? Math.min(previous.best, seconds) : seconds }))
      onReport?.({ text: en ? `🃏 I won at FreeCell in ${fmt(seconds)} and ${state.moves} moves` : `🃏 ניצחתי בפריסל תוך ${fmt(seconds)} ו־${state.moves} מהלכים` })
    }
  }, [won, daily, seconds, state.moves, saveProgress, onReport, en])

  const commit = next => { if (!next) return false; setHistory(items => [...items.slice(-199), state]); setState(next); setHint(null); setMessage(''); sfx('slide'); return true }
  const tap = key => { if (!won) { const source = sourceFor(key), target = bestTarget(state, source); if (!commit(target && apply(state, source, target))) { setMessage(en ? 'This card has no legal move right now' : 'אין לקלף הזה מעבר חוקי כרגע'); sfx('bump') } } }
  const drop = (key, dropKey) => { if (!dropKey || won) return; const source = sourceFor(key), target = targetFor(dropKey); if (!legal(state, source, target)) { setMessage(en ? 'That move is not legal' : 'המהלך הזה אינו חוקי'); sfx('bump'); return } commit(apply(state, source, target)) }
  const [drag, handlers] = useCardDrag(tap, drop)
  const undo = () => { if (!history.length) return; setState(history.at(-1)); setHistory(items => items.slice(0, -1)); setHint(null); setMessage(''); reported.current = false }
  const start = value => { const number = Math.max(1, Math.min(999999, Number(value) || 1)); setState(deal(number)); setDealInput(String(number)); setHistory([]); setSeconds(0); setHint(null); setMessage(''); reported.current = false }
  const showHint = () => { const next = findHint(state); setHint(next); setMessage(next ? (en ? 'The suggested card and target are highlighted' : 'הקלף והיעד המומלצים מסומנים') : (en ? 'No move available' : 'לא נמצא מהלך זמין')); clearTimeout(hintTimer.current); hintTimer.current = setTimeout(() => setHint(null), 2500) }
  const finish = () => { const next = autoFinish(state); if (next === state) { setMessage(en ? 'Cannot finish automatically yet - open up more moves first' : 'עדיין אי אפשר להשלים אוטומטית — צריך לפתוח עוד מהלכים'); sfx('bump') } else commit(next) }

  const gap = Math.max(3, Math.min(13, box.w / 100)), width = Math.max(27, Math.min((box.w - gap * 9) / 8, 112)), height = width * 1.4
  const left = (box.w - (width * 8 + gap * 7)) / 2, x = index => left + index * (width + gap), top = height + gap * 2, room = box.h - top - height - gap
  const draggedKeys = drag?.key?.[0] === 't' ? (() => { const src = sourceFor(drag.key); return state.tab[src.pile].slice(src.index).map((_, offset) => `t${src.pile}:${src.index + offset}`) })() : [drag?.key]
  const cards = []
  state.cells.forEach((card, index) => { if (card) cards.push(<Card lang={lang} key={card.id} card={card} w={width} x={x(index)} y={gap} z={20} dropKey={`c${index}`} dragged={draggedKeys.includes(`c${index}`) ? drag : null} hint={hint && keyFor(hint.source) === `c${index}`} onPointer={handlers(`c${index}`)} onActivate={() => tap(`c${index}`)} />) })
  state.found.forEach((pile, index) => { const card = pile.at(-1); if (card) cards.push(<Card lang={lang} key={card.id} card={card} w={width} x={x(index + 4)} y={gap} z={20} dropKey={`f${index}`} hint={hint && keyFor(hint.source) === `f${index}`} onPointer={handlers(`f${index}`)} onActivate={() => tap(`f${index}`)} />) })
  state.tab.forEach((pile, column) => { const offset = Math.min(height * .31, pile.length > 1 ? room / (pile.length - 1) : height * .31); pile.forEach((card, index) => { const key = `t${column}:${index}`; cards.push(<Card lang={lang} key={card.id} card={card} w={width} x={x(column)} y={top + index * offset} z={30 + index} dropKey={`t${column}`} dragged={draggedKeys.includes(key) ? drag : null} hint={hint && keyFor(hint.source) === key} onPointer={handlers(key)} onActivate={() => tap(key)} />) }) })

  return <div className="arc-game fc-game">
    <Hud stats={[[en ? 'Time' : 'זמן', fmt(seconds)], [en ? 'Moves' : 'מהלכים', state.moves], [en ? 'Wins' : 'ניצחונות', progress.wins]]}>
      <button type="button" className="fc-tool" onClick={undo} disabled={!history.length} aria-label={en ? 'Undo' : 'ביטול מהלך'} title={en ? 'Undo' : 'ביטול מהלך'}><RotateCcw aria-hidden="true" /><span>{en ? 'Undo' : 'ביטול'}</span></button>
      <button type="button" className="fc-tool" onClick={showHint} disabled={won} aria-label={en ? 'Hint' : 'רמז'} title={en ? 'Hint' : 'רמז'}><Lightbulb aria-hidden="true" /><span>{en ? 'Hint' : 'רמז'}</span></button>
      <button type="button" className="fc-tool" onClick={finish} disabled={won} aria-label={en ? 'Auto-finish' : 'השלמה אוטומטית'} title={en ? 'Auto-finish' : 'השלמה אוטומטית'}><Sparkles aria-hidden="true" /><span>{en ? 'Finish' : 'השלמה'}</span></button>
      <button type="button" className="fc-tool" onClick={() => start(state.dealNumber)} aria-label={en ? 'Restart' : 'התחלה מחדש'} title={en ? 'Restart' : 'התחלה מחדש'}><RotateCw aria-hidden="true" /><span>{en ? 'Restart' : 'מחדש'}</span></button>
    </Hud>
    {!daily && <div className="fc-deal"><label htmlFor="fc-deal-number">{en ? 'Deal number' : 'חלוקה מספר'}</label><input id="fc-deal-number" type="number" min="1" max="999999" value={dealInput} onChange={event => setDealInput(event.target.value)} /><button type="button" onClick={() => start(dealInput)}>{en ? 'Open deal' : 'פתחו חלוקה'}</button><button type="button" onClick={() => start(Math.floor(Math.random() * 1_000_000) + 1)}>{en ? 'Random deal' : 'חלוקה אקראית'}</button></div>}
    <p className="fc-guide">{en ? 'Arrange cards in descending order, alternating colors. Drag a card or tap it to move it; free cells help you make room.' : 'סדרו קלפים בסדר יורד ובצבעים מתחלפים. גררו קלף או לחצו עליו להעברה; התאים הפנויים עוזרים לפנות מקום.'}</p>
    <div className="arc-field cd-field fc-field" ref={boxRef}><div className="cd-table" style={{ width: box.w, height: box.h }}>
      {state.cells.map((_, index) => <Slot key={`cs${index}`} w={width} x={x(index)} y={gap} label={en ? 'Cell' : 'תא'} dropKey={`c${index}`} active={hint?.target?.type === 'cell' && hint.target.pile === index} />)}
      {state.found.map((_, index) => <Slot key={`fs${index}`} w={width} x={x(index + 4)} y={gap} label={SUITS[index]} dropKey={`f${index}`} active={hint?.target?.type === 'found' && hint.target.pile === index} />)}
      {state.tab.map((_, index) => <div key={index} className={`cd-zone${hint?.target?.type === 'tab' && hint.target.pile === index ? ' is-active' : ''}`} data-drop={`t${index}`} style={{ width, height: box.h - top, transform: `translate(${x(index)}px, ${top}px)` }} />)}{cards}
    </div>{message && <div className="arc-toast" role="status">{message}</div>}</div>
    {won && !daily && <EndCard lang={lang} title={en ? '🎉 You won at FreeCell!' : '🎉 ניצחתם בפריסל!'} text={en ? `Deal ${state.dealNumber} solved in ${fmt(seconds)} and ${state.moves} moves.` : `חלוקה ${state.dealNumber} נפתרה תוך ${fmt(seconds)} ו־${state.moves} מהלכים.`} primary={en ? '🃏 New deal' : '🃏 חלוקה חדשה'} onPrimary={() => start(Math.floor(Math.random() * 1_000_000) + 1)} secondary={en ? '📱 Share' : '📱 שתפו'} onSecondary={() => onShare?.(en ? `🃏 I solved FreeCell deal ${state.dealNumber} in ${fmt(seconds)}!` : `🃏 פתרתי את פריסל ${state.dealNumber} תוך ${fmt(seconds)}!`)} />}
  </div>
}
