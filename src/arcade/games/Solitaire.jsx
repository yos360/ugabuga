import { useEffect, useRef, useState } from 'react'
import { deal, draw, apply, bestTarget, legal, isWon, canAutoFinish, autoStep, findHint } from '../logic/klondike'
import { SUITS } from '../logic/cards'
import { useBox, useProgress, useCardDrag } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import { Card, Slot } from '../cardsUi'

// Keys: 'w' = waste top, 'f2' = foundation 2, 't3:5' = tableau pile 3 from card 5.
const parse = key => {
  if (key === 'w') return { type: 'waste' }
  if (key[0] === 'f') return { type: 'found', pile: +key.slice(1) }
  const [p, i] = key.slice(1).split(':').map(Number)
  return { type: 'tab', pile: p, index: i }
}
const target = key => (key[0] === 'f' ? { type: 'found', pile: +key.slice(1) } : key[0] === 't' ? { type: 'tab', pile: +key.slice(1).split(':')[0] } : null)

export default function Solitaire({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('solitaire', { wins: 0, best: 0 })
  const [s, setS] = useState(() => deal())
  const [history, setHistory] = useState([])
  const [shake, setShake] = useState(null)
  const [hint, setHint] = useState(null)
  const [boxRef, box] = useBox()
  const hintTimer = useRef(0)
  useEffect(() => () => clearTimeout(hintTimer.current), [])
  const [time, setTime] = useState(0)
  const won = isWon(s)
  const started = s.moves > 0
  const autoRef = useRef(0)

  useEffect(() => {
    if (!started || won) return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [started, won])

  const commit = n => { setHistory(h => [...h.slice(-200), s]); setS(n); setHint(null) }
  const tap = key => {
    if (won) return
    if (key === 'stock') { commit(draw(s)); return }
    const src = parse(key)
    const dst = bestTarget(s, src)
    const n = dst && apply(s, src, dst)
    if (n) commit(n)
    else { setShake(key); setTimeout(() => setShake(null), 350) }
  }
  const drop = (key, dropKey) => {
    if (!dropKey || key === 'stock') return
    const dst = target(dropKey)
    const src = parse(key)
    if (dst && legal(s, src, dst)) commit(apply(s, src, dst))
  }
  const [drag, handlers] = useCardDrag(tap, drop)

  // Auto-finish once every card is face up.
  useEffect(() => {
    if (!canAutoFinish(s)) return undefined
    autoRef.current = setTimeout(() => { const n = autoStep(s); if (n) setS(n) }, 110)
    return () => clearTimeout(autoRef.current)
  }, [s])

  useEffect(() => {
    if (!won) return
    saveProgress(p => ({ wins: p.wins + 1, best: p.best ? Math.min(p.best, time) : time }))
    onReport?.({ text: `🃏 ניצחתי בסוליטר תוך ${fmt(time)} ו־${s.moves} מהלכים!` })
  }, [won, time, s.moves, saveProgress, onReport])

  const undo = () => { if (!history.length) return; setS(history.at(-1)); setHistory(h => h.slice(0, -1)); setHint(null) }
  const restart = () => { setS(deal()); setHistory([]); setTime(0); setHint(null) }
  const showHint = () => { const h = findHint(s); setHint(h || { none: true }); clearTimeout(hintTimer.current); hintTimer.current = setTimeout(() => setHint(null), 2200) }

  // ----- layout -----
  const gap = Math.max(4, Math.min(10, box.w / 90))
  const w = Math.max(30, Math.min((box.w - gap * 8) / 7, (box.h - gap * 3) / (1.4 * 3.3), 110))
  const h = w * 1.4
  const left = (box.w - (w * 7 + gap * 6)) / 2
  const colX = i => left + i * (w + gap)
  const tabTop = h + gap * 2
  const room = box.h - tabTop - h - gap

  const cards = []
  const isDragged = key => drag && dragKeys(drag.key).includes(key)
  const dragKeys = k => (k && k[0] === 't' ? (() => { const [p, i] = k.slice(1).split(':').map(Number); return s.tab[p].slice(i).map((_, j) => `t${p}:${i + j}`) })() : [k])
  const hintSrc = hint?.src ? (hint.src.type === 'waste' ? 'w' : `t${hint.src.pile}:${hint.src.index}`) : null

  // stock
  const stockTop = s.stock.at(-1)
  // waste: show up to 3 fanned, only the top one is playable
  s.waste.slice(-3).forEach((c, i, arr) => {
    const isTop = i === arr.length - 1
    const key = isTop ? 'w' : `wx${i}`
    cards.push(<Card key={c.id} card={c} w={w} x={colX(1) + i * w * 0.18} y={gap} z={10 + i} dropKey={null}
      dragged={isTop && isDragged('w') ? drag : null} hint={isTop && hintSrc === 'w'} selected={shake === key}
      onPointer={isTop ? handlers('w') : {}} />)
  })
  s.found.forEach((pile, f) => {
    const c = pile.at(-1)
    if (c) cards.push(<Card key={c.id} card={c} w={w} x={colX(3 + f)} y={gap} z={10} dropKey={`f${f}`}
      dragged={isDragged(`f${f}`) ? drag : null} onPointer={handlers(`f${f}`)} />)
  })
  s.tab.forEach((pile, p) => {
    const down = pile.filter(c => !c.up).length, up = pile.length - down
    let dOff = h * 0.12, uOff = h * 0.27
    const need = down * dOff + Math.max(0, up - 1) * uOff
    if (need > room && need > 0) { const k = room / need; dOff *= k; uOff *= k }
    let y = tabTop
    pile.forEach((c, i) => {
      const key = `t${p}:${i}`
      cards.push(<Card key={c.id} card={c} w={w} x={colX(p)} y={y} z={20 + i} dropKey={`t${p}`}
        dragged={isDragged(key) ? drag : null} hint={hintSrc === key} selected={shake === key}
        onPointer={c.up ? handlers(key) : {}} />)
      y += c.up ? uOff : dOff
    })
  })

  return (
    <div className="arc-game">
      <Hud stats={[['זמן', fmt(time)], ['מהלכים', s.moves], ['ניצחונות', progress.wins]]}>
        <ToolButton onClick={undo} disabled={!history.length} label="ביטול מהלך">↩</ToolButton>
        <ToolButton onClick={showHint} label="רמז">💡</ToolButton>
        <ToolButton onClick={restart} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field cd-field" ref={boxRef}>
        <div className="cd-table" style={{ width: box.w, height: box.h }}>
          {stockTop
            ? <Card card={stockTop} w={w} x={colX(0)} y={gap} z={5} hint={hint?.draw} onPointer={{ onClick: () => tap('stock') }} />
            : <Slot w={w} x={colX(0)} y={gap} label="↻" onClick={() => tap('stock')} active={hint?.draw} />}
          {s.stock.length > 0 && <span className="cd-count" style={{ transform: `translate(${colX(0) + 4}px, ${gap + h - 22}px)` }}>{s.stock.length}</span>}
          {s.found.map((pile, f) => <Slot key={`fs${f}`} w={w} x={colX(3 + f)} y={gap} label={SUITS[f]} dropKey={`f${f}`} />)}
          {s.tab.map((_, p) => <Slot key={`ts${p}`} w={w} x={colX(p)} y={tabTop} label="K" dropKey={`t${p}`} />)}
          {s.tab.map((_, p) => <div key={`tz${p}`} className="cd-zone" data-drop={`t${p}`} style={{ width: w, height: box.h - tabTop, transform: `translate(${colX(p)}px, ${tabTop}px)` }} />)}
          {cards}
        </div>
        {hint?.none && <div className="arc-toast">אין מהלך מועיל — נסו להפוך קלפים מהחפיסה</div>}
        {hint?.draw && <div className="arc-toast">💡 הפכו קלף מהחפיסה</div>}
      </div>
      {won && <EndCard title="🎉 ניצחתם!" text={`כל הקלפים הגיעו הביתה תוך ${fmt(time)} ו־${s.moves} מהלכים.`}
        primary="🃏 משחק חדש" onPrimary={restart}
        secondary="📱 שתפו את הניצחון" onSecondary={() => onShare?.(`🃏 ניצחתי בסוליטר תוך ${fmt(time)}! מי מהיר יותר?`)} />}
    </div>
  )
}

function fmt(sec) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` }
