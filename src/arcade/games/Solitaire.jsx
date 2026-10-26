import { useEffect, useRef, useState } from 'react'
import { deal, winnableDeal, draw, apply, bestTarget, legal, isWon, canAutoFinish, autoStep, findHint } from '../logic/klondike'
import { useBox, useProgress, useCardDrag } from '../hooks'
import { EndCard } from '../ui'
import { readGame, writeGame, saveKey, HISTORY_LIMIT } from '../logic/solitaireSave'
import { RotateCcw, Lightbulb, Plus, Trophy, Clock3, Layers3, Palette, X, CircleHelp, Play, Pause } from 'lucide-react'
import './solitaire/solitaire.css'
import { Card, Slot } from './solitaire/Cards'

// Keys: 'w' = waste top, 'f2' = foundation 2, 't3:5' = tableau pile 3 from card 5.
const parse = key => {
  if (key === 'w') return { type: 'waste' }
  if (key[0] === 'f') return { type: 'found', pile: +key.slice(1) }
  const [p, i] = key.slice(1).split(':').map(Number)
  return { type: 'tab', pile: p, index: i }
}
const target = key => (key[0] === 'f' ? { type: 'found', pile: +key.slice(1) } : key[0] === 't' ? { type: 'tab', pile: +key.slice(1).split(':')[0] } : null)

export default function Solitaire({ onReport, onShare, daily }) {
  // daily challenge: the same deal for everyone, picked so it can surely be won
  const newDeal = () => (daily ? winnableDeal(daily.seed) : deal())
  const [progress, saveProgress] = useProgress('solitaire', { wins: 0, best: 0 })
  // A game left in the middle comes back as it was (the daily one only on its own day).
  const key = saveKey(daily)
  const [saved] = useState(() => typeof window === 'undefined' ? null : readGame(localStorage, key))
  const [s, setS] = useState(() => saved?.s || newDeal())
  const [history, setHistory] = useState(() => saved?.history || [])
  const [appearance, saveAppearance] = useProgress('solitaire-appearance', { theme: 'slate' })
  const theme = ['slate', 'velvet', 'garden', 'midnight'].includes(appearance.theme) ? appearance.theme : 'slate'
  const [panel, setPanel] = useState(null)
  const [shake, setShake] = useState(null)
  const [hint, setHint] = useState(null)
  const [boxRef, box] = useBox()
  const hintTimer = useRef(0)
  useEffect(() => () => clearTimeout(hintTimer.current), [])
  const [time, setTime] = useState(() => saved?.time || 0)
  const [resumed, setResumed] = useState(Boolean(saved))
  const won = isWon(s)
  const started = s.moves > 0
  const autoRef = useRef(0)
  // Finishing by itself is the player's choice: a button starts it, and it can be paused.
  const [autoOn, setAutoOn] = useState(false)
  const canAuto = canAutoFinish(s) && !won

  useEffect(() => { writeGame(localStorage, key, { s, history, time }) }, [key, s, history, time])
  useEffect(() => { if (!resumed) return undefined; const t = setTimeout(() => setResumed(false), 2600); return () => clearTimeout(t) }, [resumed])

  useEffect(() => {
    if (!started || won) return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [started, won])

  const commit = n => { setHistory(h => [...h.slice(-(HISTORY_LIMIT - 1)), s]); setS(n); setHint(null) }
  const tap = key => {
    if (won) return
    if (key === 'stock') { const n = draw(s); if (n !== s) commit(n); return }
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
  const [drag, pointerHandlers] = useCardDrag(tap, drop)
  const handlers = key => ({ ...pointerHandlers(key), onKeyActivate: () => tap(key) })

  // Once every card is face up the player may let the cards fly home; each step can be undone.
  useEffect(() => {
    if (!autoOn || !canAutoFinish(s)) return undefined
    autoRef.current = setTimeout(() => { const n = autoStep(s); if (n) commit(n); else setAutoOn(false) }, 140)
    return () => clearTimeout(autoRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- commit reads the current s
  }, [s, autoOn])

  useEffect(() => {
    if (!won) return
    if (daily) { daily.finish({ text: `🃏 סוליטר: ניצחתי תוך ${fmt(time)} ו־${s.moves} מהלכים`, score: time, won: true }); return }
    saveProgress(p => ({ wins: p.wins + 1, best: p.best ? Math.min(p.best, time) : time }))
    onReport?.({ text: `🃏 ניצחתי בסוליטר תוך ${fmt(time)} ו־${s.moves} מהלכים!` })
  }, [won, time, s.moves, saveProgress, onReport, daily])

  const undo = () => { if (!history.length) return; setAutoOn(false); setS(history.at(-1)); setHistory(h => h.slice(0, -1)); setHint(null) }
  const restart = () => { setAutoOn(false); setResumed(false); setS(newDeal()); setHistory([]); setTime(0); setHint(null) }
  const showHint = () => { const h = findHint(s); setHint(h || { none: true }); clearTimeout(hintTimer.current); hintTimer.current = setTimeout(() => setHint(null), 2200) }

  // ----- layout -----
  const gap = Math.max(4, Math.min(16, box.w / 80))
  const w = Math.max(30, Math.min((box.w - gap * 8) / 7, (box.h - gap * 4) / (1.4 * 3.2), 128))
  const h = w * 1.4
  const left = (box.w - (w * 7 + gap * 6)) / 2
  const colX = i => left + i * (w + gap)
  const tabTop = h + gap * 2 + 24
  const room = Math.max(0, box.h - tabTop - h - gap)

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
    let dOff = h * 0.12, uOff = h * 0.3
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
    <div className="arc-game sol-game" data-theme={theme}>
      <div className="sol-dashboard">
        <div className="sol-brand"><span className="sol-emblem" aria-hidden="true">♠</span><div><span className="sol-eyebrow">עוגה בוגה · זמן לשחק</span><h3>{daily ? 'האתגר היומי שלכם' : 'רגע קטן. משחק גדול.'}</h3></div></div>
        <div className="sol-stats" aria-label="נתוני המשחק">
          <div><Clock3 aria-hidden="true" /><span>זמן<strong dir="ltr">{fmt(time)}</strong></span></div>
          <div><Layers3 aria-hidden="true" /><span>מהלכים<strong>{s.moves}</strong></span></div>
          <div><Trophy aria-hidden="true" /><span>ניצחונות<strong>{progress.wins}</strong></span></div>
        </div>
      </div>
      <div className="sol-toolbar" aria-label="כלי משחק">
        <button className="sol-action sol-primary" onClick={() => started && !won ? setPanel('restart') : restart()}><Plus />משחק חדש</button>
        <div className="sol-tool-group">
          <button className="sol-action" onClick={undo} disabled={!history.length} aria-label="ביטול מהלך"><RotateCcw /><span>ביטול</span></button>
          <button className="sol-action" onClick={showHint} aria-label="רמז"><Lightbulb /><span>רמז</span></button>
          <button className="sol-action" onClick={() => setPanel(panel === 'themes' ? null : 'themes')} aria-expanded={panel === 'themes'} aria-label="בחירת רקע"><Palette /><span>רקע</span></button>
          <button className="sol-action sol-help" onClick={() => setPanel('help')} aria-label="איך משחקים"><CircleHelp /></button>
        </div>
      </div>
      <p className="sol-guide">סדרו את הקלפים בסדר יורד ובצבעים מתחלפים. לחצו או גררו קלף; המטרה היא לבנות ארבע ערימות מאס עד מלך.</p>
      {panel && <div className="sol-panel" role="region" aria-label={panel === 'themes' ? 'בחירת רקע' : panel === 'restart' ? 'משחק חדש' : 'איך משחקים'}>
        <button className="sol-panel-close sol-action" onClick={() => setPanel(null)} aria-label="סגירת החלונית"><X /></button>
        {panel === 'themes' ? <><h4>איזה שולחן מתאים לכם?</h4><div className="sol-themes">{[['slate', 'אפור כחלחל'], ['velvet', 'קטיפה סגולה'], ['garden', 'גן ירוק'], ['midnight', 'לילה כחול']].map(([id, label]) => <button key={id} className="sol-theme" data-theme={id} aria-pressed={theme === id} onClick={() => saveAppearance({ theme: id })}><i />{label}<span>{theme === id ? '✓' : ''}</span></button>)}</div></> : panel === 'restart' ? <><h4>מתחילים משחק חדש?</h4><p>המשחק הנוכחי יוחלף בחלוקה חדשה.</p><button className="sol-action sol-primary" onClick={() => { restart(); setPanel(null) }}>כן, מתחילים</button><button className="sol-action" onClick={() => setPanel(null)}>ממשיכים לשחק</button></> : <><h4>מסדרים, מגלים, מנצחים</h4><p>בונים ארבע ערימות מאס עד מלך, לפי צורה. על השולחן מסדרים בסדר יורד ובצבעים מתחלפים. רק מלך יכול להתחיל עמודה ריקה.</p><p>לחצו על קלף להעברה אוטומטית או גררו למקום הרצוי. החפיסה נותנת קלף חדש, והרמז עוזר כשנתקעים.</p></>}
      </div>}
      <div className="arc-field cd-field" ref={boxRef}>
        <div className="sol-table-watermark" aria-hidden="true"><span>♠</span>עוגה בוגה<small>עוד קלף, עוד אפשרות</small></div>
        <div className="cd-table" style={{ width: box.w, height: box.h }}>
          <span className="sol-pile-label" style={{ left: colX(0), top: h + gap + 5, width: w * 2 + gap }}>חפיסה · לחצו לשליפה</span>
          <span className="sol-pile-label" style={{ left: colX(3), top: h + gap + 5, width: w * 4 + gap * 3 }}>ערימות הבית · מאס עד מלך</span>
          {stockTop
            ? <Card card={stockTop} w={w} x={colX(0)} y={gap} z={5} hint={hint?.draw} onPointer={{ onClick: () => tap('stock') }} />
            : <Slot w={w} x={colX(0)} y={gap} label="↻" onClick={() => tap('stock')} active={hint?.draw} />}
          {s.stock.length > 0 && <span className="cd-count" style={{ transform: `translate(${colX(0) + 4}px, ${gap + h - 22}px)` }}>{s.stock.length}</span>}
          {s.found.map((pile, f) => <Slot key={`fs${f}`} w={w} x={colX(3 + f)} y={gap} suit={f} dropKey={`f${f}`} />)}
          {s.tab.map((_, p) => <Slot key={`ts${p}`} w={w} x={colX(p)} y={tabTop} label="K" dropKey={`t${p}`} />)}
          {s.tab.map((_, p) => <div key={`tz${p}`} className="cd-zone" data-drop={`t${p}`} style={{ width: w, height: box.h - tabTop, transform: `translate(${colX(p)}px, ${tabTop}px)` }} />)}
          {cards}
        </div>
        {canAuto && <button className={`sol-action sol-auto ${autoOn ? '' : 'sol-primary'}`} onClick={() => setAutoOn(!autoOn)}>
          {autoOn ? <><Pause />עצירה</> : <><Play />כל הקלפים גלויים — לסיים אוטומטית</>}
        </button>}
        {resumed && !hint && <div className="arc-toast">♠ המשכנו מאיפה שעצרתם</div>}
        {hint?.none && <div className="arc-toast">אין מהלך מועיל — נסו להפוך קלפים מהחפיסה</div>}
        {hint?.draw && <div className="arc-toast">💡 הפכו קלף מהחפיסה</div>}
      </div>
      <div className="sol-footer"><span>קלונדייק · קלף אחד</span><span>לחיצה או גרירה — בקצב שלכם</span></div>
      {won && !daily && <EndCard title="🎉 ניצחתם!" text={`כל הקלפים הגיעו הביתה תוך ${fmt(time)} ו־${s.moves} מהלכים.`}
        primary="🃏 משחק חדש" onPrimary={restart}
        secondary="📱 שתפו את הניצחון" onSecondary={() => onShare?.(`🃏 ניצחתי בסוליטר תוך ${fmt(time)}! מי מהיר יותר?`)} />}
    </div>
  )
}

function fmt(sec) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` }
