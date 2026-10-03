import { useEffect, useRef, useState } from 'react'
import { rng } from '../logic/rng'
import { deal, apply, dealRow, canDeal, bestTarget, legal, isWon, findHint, canPick } from '../logic/spider'
import { SUITS } from '../logic/cards'
import { useBox, useProgress, useCardDrag } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import { Card, Slot } from '../cardsUi'

const LEVELS = [[1, 'קל · צורה אחת'], [2, 'בינוני · 2 צורות'], [4, 'קשה · 4 צורות']]

export default function Spider({ onReport, onShare, daily }) {
  // daily challenge: one suit, the same deal for everyone
  const newDeal = suits => (daily ? deal(1, rng(daily.seed)) : deal(suits))
  const [progress, saveProgress] = useProgress('spider', { suits: 1, wins: 0 })
  const [s, setS] = useState(() => newDeal(progress.suits))
  const [history, setHistory] = useState([])
  const [toast, setToast] = useState(null)
  const [hint, setHint] = useState(null)
  const [shake, setShake] = useState(null)
  const [boxRef, box] = useBox()
  const hintTimer = useRef(0)
  useEffect(() => () => clearTimeout(hintTimer.current), [])
  const won = isWon(s)

  const say = text => setToast({ k: Date.now(), text })
  const commit = n => { setHistory(h => [...h.slice(-200), s]); setS(n); setHint(null); if (n.done > s.done) say('🎉 רצף שלם עף הביתה!') }
  const parse = key => key.slice(1).split(':').map(Number)
  const tap = key => {
    if (won) return
    const [p, i] = parse(key)
    if (!canPick(s.tab[p], i)) { setShake(key); setTimeout(() => setShake(null), 350); return }
    const to = bestTarget(s, p, i)
    if (to === null) { setShake(key); setTimeout(() => setShake(null), 350); return }
    commit(apply(s, p, i, to))
  }
  const drop = (key, dropKey) => {
    if (!dropKey) return
    const [p, i] = parse(key)
    const to = +dropKey.slice(1)
    if (legal(s, p, i, to)) commit(apply(s, p, i, to))
  }
  const [drag, handlers] = useCardDrag(tap, drop)
  const doDeal = () => {
    if (!s.stock.length) return
    if (!canDeal(s)) { say('קודם ממלאים כל עמודה ריקה בקלף, ואז מחלקים'); return }
    commit(dealRow(s))
  }
  const undo = () => { if (!history.length) return; setS(history.at(-1)); setHistory(h => h.slice(0, -1)); setHint(null) }
  const restart = (suits = s.suits) => { setS(newDeal(suits)); setHistory([]); setHint(null); if (!daily) saveProgress({ suits }) }
  const showHint = () => {
    const h = findHint(s)
    if (!h) say('אין מהלך — נסו לבטל כמה מהלכים אחורה')
    setHint(h); clearTimeout(hintTimer.current); hintTimer.current = setTimeout(() => setHint(null), 2200)
  }

  useEffect(() => {
    if (!won) return
    if (daily) { daily.finish({ text: `🕷️ סוליטר עכביש: פירקתי את כל הרצפים ב־${s.moves} מהלכים`, score: s.moves, won: true }); return }
    saveProgress(p => ({ wins: p.wins + 1 }))
    onReport?.({ text: `🕷️ ניצחתי בסוליטר עכביש (${s.suits === 1 ? 'צורה אחת' : `${s.suits} צורות`}) ב־${s.moves} מהלכים!` })
  }, [won, s.suits, s.moves, saveProgress, onReport, daily])

  // ----- layout -----
  // cards as big as the screen allows (big on a computer), the felt fills the rest
  const gap = Math.max(4, Math.min(14, box.w / 95))
  const w = Math.max(26, Math.min((box.w - gap * 11) / 10, (box.h - gap * 4) / (1.4 * 3.3), 132))
  const h = w * 1.4
  const left = (box.w - (w * 10 + gap * 9)) / 2
  const colX = i => left + i * (w + gap)
  const tabTop = h + gap * 2
  const room = box.h - tabTop - h - gap
  const dragging = drag && parse(drag.key)
  const hintKey = hint && !hint.deal ? `t${hint.from}:${hint.index}` : null

  const cards = []
  s.tab.forEach((pile, p) => {
    const down = pile.filter(c => !c.up).length, up = pile.length - down
    let dOff = h * 0.11, uOff = h * 0.3
    const need = down * dOff + Math.max(0, up - 1) * uOff
    if (need > room && need > 0) { const k = room / need; dOff *= k; uOff *= k }
    let y = tabTop
    pile.forEach((c, i) => {
      const key = `t${p}:${i}`
      const isDrag = dragging && dragging[0] === p && i >= dragging[1] && canPick(pile, dragging[1])
      cards.push(<Card key={c.id} card={c} w={w} x={colX(p)} y={y} z={20 + i} dropKey={`t${p}`}
        dragged={isDrag ? drag : null} hint={hintKey === key} selected={shake === key} onPointer={c.up ? handlers(key) : {}} />)
      y += c.up ? uOff : dOff
    })
  })
  const deals = s.stock.length / 10

  return (
    <div className="arc-game">
      <Hud stats={[['רצפים', `${s.done}/8`], ['מהלכים', s.moves]]}>
        <ToolButton onClick={undo} disabled={!history.length} label="ביטול מהלך">↩</ToolButton>
        <ToolButton onClick={showHint} label="רמז">💡</ToolButton>
        <ToolButton onClick={() => restart()} label="משחק חדש">🔄</ToolButton>
      </Hud>
      {!daily && <div className="sp-levels" role="group" aria-label="רמת קושי">
        {LEVELS.map(([n, label]) => <button key={n} type="button" className={`arc-chip${s.suits === n ? ' is-on' : ''}`} onClick={() => restart(n)}>{label}</button>)}
      </div>}
      <div className="arc-field cd-field" ref={boxRef}>
        <div className="cd-table" style={{ width: box.w, height: box.h }}>
          {/* stock: one small card per remaining deal */}
          {deals > 0
            ? Array.from({ length: deals }, (_, i) => <Card key={`st${i}`} card={{ up: false }} w={w} x={colX(0) + i * w * 0.14} y={gap} z={5 + i} hint={hint?.deal && i === deals - 1} onPointer={{ onClick: doDeal }} />)
            : <Slot w={w} x={colX(0)} y={gap} label="" />}
          {deals > 0 && <span className="cd-count" style={{ transform: `translate(${colX(0) + 4}px, ${gap + h - 22}px)` }}>{deals}</span>}
          {/* finished runs */}
          {Array.from({ length: 8 }, (_, i) => {
            const x = colX(9) - i * w * 0.22
            return s.doneSuits[i] !== undefined
              ? <Card key={`d${i}`} card={{ up: true, rank: 13, suit: s.doneSuits[i] }} w={w} x={x} y={gap} z={5 + i} />
              : i === 0 ? <Slot key="dslot" w={w} x={x} y={gap} label={SUITS[0]} /> : null
          })}
          {s.tab.map((_, p) => <Slot key={`ts${p}`} w={w} x={colX(p)} y={tabTop} label="" dropKey={`t${p}`} />)}
          {s.tab.map((_, p) => <div key={`tz${p}`} className="cd-zone" data-drop={`t${p}`} style={{ width: w, height: box.h - tabTop, transform: `translate(${colX(p)}px, ${tabTop}px)` }} />)}
          {cards}
        </div>
        {toast && <div key={toast.k} className="arc-toast">{toast.text}</div>}
        {hint?.deal && <div className="arc-toast">💡 אין מהלך טוב — חלקו שורה חדשה מהחפיסה</div>}
      </div>
      {won && !daily && <EndCard title="🎉 ניצחתם!" text={`פירקתם את כל 8 הרצפים ב־${s.moves} מהלכים.${s.suits < 4 ? ' מוכנים לרמה הבאה?' : ''}`}
        primary={s.suits < 4 ? '▶ לרמה הבאה' : '🕷️ משחק חדש'} onPrimary={() => restart(s.suits === 1 ? 2 : 4)}
        secondary="📱 שתפו את הניצחון" onSecondary={() => onShare?.(`🕷️ ניצחתי בסוליטר עכביש של עוגה בוגה! תצליחו גם?`)} />}
    </div>
  )
}
