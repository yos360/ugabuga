import { useEffect, useRef, useState } from 'react'
import { deal, winnableDeal, draw, apply, bestTarget, legal, isWon, canAutoFinish, autoStep, findHint } from '../logic/klondike'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import { useSolitaireDrag } from './useSolitaireDrag'
import { sessionKey, readSession, writeSession } from '../logic/solitaireSession'
import './solitaire.css'
import { Card, Slot } from './solitaireCards'

// Keys: 'w' = waste top, 'f2' = foundation 2, 't3:5' = tableau pile 3 from card 5.
const parse = key => {
  if (key === 'w') return { type: 'waste' }
  if (key[0] === 'f') return { type: 'found', pile: +key.slice(1) }
  const [p, i] = key.slice(1).split(':').map(Number)
  return { type: 'tab', pile: p, index: i }
}
const target = key => (key[0] === 'f' ? { type: 'found', pile: +key.slice(1) } : key[0] === 't' ? { type: 'tab', pile: +key.slice(1).split(':')[0] } : null)

export default function Solitaire({ onReport, onShare, daily }) {
  // Daily mode stays draw-one, with separate storage per challenge.
  const newDeal = () => (daily ? winnableDeal(daily.seed) : deal())
  const [progress, saveProgress] = useProgress('solitaire', { wins: 0, best: 0 })
  const key = sessionKey(daily)
  const [restored] = useState(() => {
    try { return readSession(localStorage, key, !!daily) } catch { return null }
  })
  const [s, setS] = useState(() => restored?.s || newDeal())
  const [auto, setAuto] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [storageOk, setStorageOk] = useState(true)
  const reported = useRef(restored?.reported || false)
  const [history, setHistory] = useState(() => restored?.history || [])
  const [shake, setShake] = useState(null)
  const [hint, setHint] = useState(null)
  const [boxRef, box] = useBox()
  const hintTimer = useRef(0)
  useEffect(() => () => clearTimeout(hintTimer.current), [])
  const [time, setTime] = useState(restored?.time || 0)
  const won = isWon(s)
  const started = s.moves > 0
  const autoRef = useRef(0)
  const shakeTimer = useRef(0)
  useEffect(() => () => clearTimeout(shakeTimer.current), [])
  useEffect(() => {
    try { setStorageOk(writeSession(localStorage, key, { s, history, time, reported: reported.current })) }
    catch { setStorageOk(false) }
  }, [s, history, time, key])

  useEffect(() => {
    if (!started || won) return undefined
    const t = setInterval(() => setTime(x => document.hidden ? x : x + 1), 1000)
    return () => clearInterval(t)
  }, [started, won])

  const commit = n => { if (!n || n === s) return; setHistory(h => [...h.slice(-79), s]); setS(n); setHint(null) }
  const tap = key => {
    if (won || auto || confirm) return
    if (key === 'stock') { commit(draw(s)); return }
    const src = parse(key)
    const dst = bestTarget(s, src)
    const n = dst && apply(s, src, dst)
    if (n) commit(n)
    else { setShake(key); clearTimeout(shakeTimer.current); shakeTimer.current = setTimeout(() => setShake(null), 350) }
  }
  const drop = (key, dropKey) => {
    if (won || auto || confirm || !dropKey || key === 'stock') return
    const dst = target(dropKey)
    const src = parse(key)
    if (dst && legal(s, src, dst)) commit(apply(s, src, dst))
  }
  const [drag, handlers] = useSolitaireDrag(tap, drop, won || auto || !!confirm)

  // Auto-finish only after an explicit request; every step remains undoable.
  useEffect(() => {
    if (!auto || !canAutoFinish(s)) return undefined
    autoRef.current = setTimeout(() => { const n = autoStep(s); if (n) { setHistory(h => [...h.slice(-79), s]); setS(n) } else setAuto(false) }, 110)
    return () => clearTimeout(autoRef.current)
  }, [s, auto])

  useEffect(() => {
    if (!won || reported.current) return
    reported.current = true
    setAuto(false)
    try { writeSession(localStorage, key, { s, history, time, reported: true }) } catch { /* storage unavailable */ }
    if (daily) { daily.finish({ text: `🃏 סוליטר: ניצחתי תוך ${fmt(time)} ו־${s.moves} מהלכים`, score: time, won: true }); return }
    saveProgress(p => ({ wins: p.wins + 1, best: p.best ? Math.min(p.best, time) : time }))
    onReport?.({ text: `🃏 ניצחתי בסוליטר תוך ${fmt(time)} ו־${s.moves} מהלכים!` })
  }, [won, time, s, history, key, saveProgress, onReport, daily])

  const undo = () => { setAuto(false); if (!history.length) return; setS(history.at(-1)); setHistory(h => h.slice(0, -1)); setHint(null) }
  const restart = (count = s.drawCount) => {
    setAuto(false); reported.current = false
    setS(daily ? newDeal() : deal(Math.random, count)); setHistory([]); setTime(0); setHint(null); setConfirm(null)
  }
  const requestRestart = count => { setAuto(false); if (started && !won) setConfirm({ count }); else restart(count) }
  const showHint = () => { const h = findHint(s); setHint(h || { none: true }); clearTimeout(hintTimer.current); hintTimer.current = setTimeout(() => setHint(null), 2200) }

  // ----- layout -----
  const gap = Math.max(4, Math.min(16, box.w / 80))
  const w = Math.max(24, Math.min((box.w - gap * 8) / 7, 116))
  const h = w * 1.4
  const left = (box.w - (w * 7 + gap * 6)) / 2
  const colX = i => left + i * (w + gap)
  const tabTop = h + gap * 2
  const minUp = Math.max(23, w * 0.36)
  const needed = Math.max(...s.tab.map(p => p.filter(c => !c.up).length * h * 0.12 + Math.max(0, p.filter(c => c.up).length - 1) * minUp))
  const tableHeight = Math.max(box.h, tabTop + h + gap + needed)
  const room = Math.max(0, tableHeight - tabTop - h - gap)

  const cards = []
  const isDragged = key => drag && dragKeys(drag.key).includes(key)
  const dragKeys = k => (k && k[0] === 't' ? (() => { const [p, i] = k.slice(1).split(':').map(Number); return s.tab[p].slice(i).map((_, j) => `t${p}:${i + j}`) })() : [k])
  const hintSrc = hint?.src ? (hint.src.type === 'waste' ? 'w' : hint.src.type === 'found' ? `f${hint.src.pile}` : `t${hint.src.pile}:${hint.src.index}`) : null

  // stock
  const stockTop = s.stock.at(-1)
  // waste: show up to 3 fanned, only the top one is playable
  s.waste.slice(-(s.drawCount || 1)).forEach((c, i, arr) => {
    const isTop = i === arr.length - 1
    const key = isTop ? 'w' : `wx${i}`
    cards.push(<Card key={c.id} card={c} w={w} x={colX(1) + i * w * 0.18} y={gap} z={10 + i} dropKey={null}
      dragged={isTop && isDragged('w') ? drag : null} hint={isTop && hintSrc === 'w'} selected={shake === key}
      onPointer={isTop ? handlers('w') : {}} />)
  })
  s.found.forEach((pile, f) => {
    const c = pile.at(-1)
    if (c) cards.push(<Card key={c.id} card={c} w={w} x={colX(3 + f)} y={gap} z={10} dropKey={`f${f}`}
      hint={hintSrc === `f${f}` || (hint?.dst?.type === 'found' && hint.dst.pile === f)} dragged={isDragged(`f${f}`) ? drag : null} onPointer={handlers(`f${f}`)} />)
  })
  s.tab.forEach((pile, p) => {
    const down = pile.filter(c => !c.up).length, up = pile.length - down
    let dOff = h * 0.12, uOff = Math.max(minUp, h * 0.3)
    const need = down * dOff + Math.max(0, up - 1) * uOff
    if (need > room && need > 0) { const k = room / need; dOff *= k; uOff *= k }
    let y = tabTop
    pile.forEach((c, i) => {
      const key = `t${p}:${i}`
      cards.push(<Card key={c.id} card={c} w={w} x={colX(p)} y={y} z={20 + i} dropKey={`t${p}`}
        dragged={isDragged(key) ? drag : null} hint={hintSrc === key || (hint?.dst?.type === 'tab' && hint.dst.pile === p && i === pile.length - 1)} selected={shake === key}
        onPointer={c.up ? handlers(key) : {}} />)
      y += c.up ? uOff : dOff
    })
  })

  return (
    <div className="arc-game solitaire-game">
      <Hud stats={[['זמן', fmt(time)], ['מהלכים', s.moves], ['ניצחונות', progress.wins]]}>
        <ToolButton onClick={undo} disabled={!history.length || won || !!confirm} label="ביטול מהלך">↩</ToolButton>
        <ToolButton onClick={showHint} disabled={won || auto || !!confirm} label="רמז">💡</ToolButton>
        <ToolButton onClick={() => requestRestart(s.drawCount)} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="sol-controls">
        <label>חלוקה <select aria-label="מספר קלפים בחלוקה" value={s.drawCount || 1} disabled={!!daily || auto || !!confirm} onChange={e => requestRestart(Number(e.target.value))}>
          <option value={1}>קלף אחד</option><option value={3}>שלושה קלפים</option>
        </select></label>
        {daily && <span>אתגר קבוע · קלף אחד</span>}
        {!confirm && canAutoFinish(s) && <button type="button" onClick={() => { setHint(null); setAuto(a => !a) }}>{auto ? 'עצירת השלמה' : 'השלמה אוטומטית'}</button>}
        <span className="sol-save" role="status">{storageOk ? 'המשחק נשמר במכשיר זה' : 'השמירה אינה זמינה במכשיר זה'}</span>
      </div>
      <div className="arc-field cd-field"  ref={boxRef}>
        <div className="cd-table" style={{ width: box.w, height: tableHeight }}>
          {stockTop
            ? <Card card={stockTop} w={w} x={colX(0)} y={gap} z={5} hint={hint?.draw} onPointer={{ onClick: () => tap('stock') }} />
            : <Slot w={w} x={colX(0)} y={gap} label="↻" onClick={() => tap('stock')} active={hint?.draw} />}
          {s.stock.length > 0 && <span className="cd-count" style={{ transform: `translate(${colX(0) + 4}px, ${gap + h - 22}px)` }}>{s.stock.length}</span>}
          {s.found.map((pile, f) => <Slot key={`fs${f}`} w={w} x={colX(3 + f)} y={gap} label="A" active={hint?.dst?.type === 'found' && hint.dst.pile === f} dropKey={`f${f}`} />)}
          {s.tab.map((_, p) => <Slot key={`ts${p}`} w={w} x={colX(p)} y={tabTop} label="K" active={hint?.dst?.type === 'tab' && hint.dst.pile === p} dropKey={`t${p}`} />)}
          {s.tab.map((_, p) => <div key={`tz${p}`} className="cd-zone" data-drop={`t${p}`} style={{ width: w, height: tableHeight - tabTop, transform: `translate(${colX(p)}px, ${tabTop}px)` }} />)}
          {cards}
        </div>
        {hint?.none && <div className="arc-toast">לא נמצא רמז מועיל. אפשר לבטל מהלך או להתחיל משחק חדש.</div>}
        {hint?.draw && <div className="arc-toast">💡 {s.stock.length ? 'משכו מהחפיסה' : 'מחזרו את החפיסה'}</div>}
      </div>
      {confirm && <div className="arc-end" role="dialog" aria-modal="true" aria-label="התחלת משחק חדש">
        <div className="arc-end-card"><h3>להתחיל משחק חדש?</h3><p>המשחק השמור הנוכחי יוחלף.</p>
          <button type="button" className="arc-btn" autoFocus onClick={() => setConfirm(null)}>המשך המשחק</button>
          <button type="button" className="arc-btn arc-btn-main" onClick={() => restart(confirm.count)}>משחק חדש</button>
        </div>
      </div>}
      {won && !daily && <EndCard title="🎉 ניצחתם!" text={`כל הקלפים הגיעו הביתה תוך ${fmt(time)} ו־${s.moves} מהלכים.`}
        primary="🃏 משחק חדש" onPrimary={() => restart()}
        secondary="📱 שתפו את הניצחון" onSecondary={() => onShare?.(`🃏 ניצחתי בסוליטר תוך ${fmt(time)}! מי מהיר יותר?`)} />}
    </div>
  )
}

function fmt(sec) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` }
