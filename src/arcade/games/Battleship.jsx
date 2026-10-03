import { useEffect, useRef, useState } from 'react'
import { N, FLEET, randomFleet, newSea, fire, aiShot, allSunk, isSunk, shipAt } from '../logic/battleship'
import { rng } from '../logic/rng'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const LETTERS = 'אבגדהוזחטי'

function setup(daily) {
  const enemyRand = daily ? rng(daily.seed) : Math.random
  return {
    phase: 'setup',
    mine: newSea(randomFleet()),
    enemy: newSea(randomFleet(enemyRand)),
    turn: 'me',
    myShots: 0,
    aiRand: daily ? rng(daily.seed + 17) : Math.random,
    msg: 'זה הצי שלכם. אפשר לערבב, ואז ▶ מתחילים!',
  }
}

export default function Battleship({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('battleship', { smart: true, wins: 0, best: 0 })
  const [g, setG] = useState(() => setup(daily))
  const [smart, setSmart] = useState(progress.smart)
  const [boxRef, box] = useBox()
  const [flash, setFlash] = useState(null)
  const doneRef = useRef(false)
  const won = g.phase === 'over' && allSunk(g.enemy)
  const lost = g.phase === 'over' && !won

  const say = (msg, extra = {}) => setG(x => ({ ...x, ...extra, msg }))

  const shoot = i => {
    if (g.phase !== 'play' || g.turn !== 'me' || g.enemy.shots[i]) return
    const r = fire(g.enemy, i)
    const myShots = g.myShots + 1
    setFlash({ i, k: Date.now() })
    if (allSunk(r.sea)) { setG({ ...g, enemy: r.sea, myShots, phase: 'over', msg: '🏆 הטבעתם את כל הצי!' }); return }
    if (r.result === 'miss') setG({ ...g, enemy: r.sea, myShots, turn: 'ai', msg: '🌊 פספוס… עכשיו המחשב יורה' })
    else if (r.result === 'sunk') setG({ ...g, enemy: r.sea, myShots, msg: `💥 הטבעתם ${FLEET[r.ship].name}! יש לכם עוד יריה` })
    else setG({ ...g, enemy: r.sea, myShots, msg: '🔥 פגיעה! יש לכם עוד יריה' })
  }

  // computer's turn
  useEffect(() => {
    if (g.phase !== 'play' || g.turn !== 'ai') return undefined
    const t = setTimeout(() => {
      const r = fire(g.mine, aiShot(g.mine, smart, g.aiRand))
      if (allSunk(r.sea)) setG({ ...g, mine: r.sea, phase: 'over', msg: 'המחשב הטביע את כל הצי שלכם' })
      else if (r.result === 'miss') setG({ ...g, mine: r.sea, turn: 'me', msg: '🎯 תורכם! לחצו על משבצת בים של המחשב' })
      else setG({ ...g, mine: r.sea, msg: r.result === 'sunk' ? `😱 המחשב הטביע לכם ${FLEET[r.ship].name}` : '😬 המחשב פגע בכם… והוא יורה שוב' })
    }, 700)
    return () => clearTimeout(t)
  }, [g, smart])

  useEffect(() => {
    if (g.phase !== 'over' || doneRef.current) return
    doneRef.current = true
    if (won) {
      saveProgress(p => ({ wins: p.wins + 1, best: p.best ? Math.min(p.best, g.myShots) : g.myShots }))
      const text = `⚓ הטבעתי את כל הצי של המחשב בצוללות ב־${g.myShots} יריות!`
      onReport?.({ text })
      daily?.finish({ text: `⚓ צוללות: ניצחתי ב־${g.myShots} יריות`, score: g.myShots, won: true })
    } else daily?.finish({ text: `⚓ צוללות: המחשב ניצח הפעם (${g.myShots} יריות)`, score: null })
  }, [g.phase, g.myShots, won, saveProgress, onReport, daily])

  const restart = () => { doneRef.current = false; setG(setup(daily)) }
  const toggleSmart = () => { const v = !smart; setSmart(v); saveProgress({ smart: v }) }

  // layout: portrait → enemy sea big on top, my fleet small below; landscape → side by side
  const portrait = box.h > box.w * 1.05
  // each sea also has 1px lines + borders (≈ 16px); portrait adds two titles and the fleet list (≈ 100px)
  const big = portrait ? Math.min(box.w - 32, (box.h - 136) / 1.52) : Math.min((box.w - 92) / 2, box.h - 96)
  const small = portrait ? big * 0.52 : big
  const cellBig = Math.max(16, big / (N + 1)), cellSmall = Math.max(10, small / (N + 1))
  const sunkEnemy = g.enemy.ships.map((_, k) => isSunk(g.enemy, k))

  const grid = (sea, cell, own) => (
    <div className={`bs2-grid${own ? ' is-own' : ''}`} style={{ gridTemplateColumns: `repeat(${N + 1}, ${cell}px)`, gridAutoRows: `${cell}px`, fontSize: cell * 0.5 }}
      role="grid" aria-label={own ? 'הצי שלי' : 'הים של המחשב'}>
      <span />
      {Array.from({ length: N }, (_, x) => <span key={`h${x}`} className="bs2-head">{x + 1}</span>)}
      {Array.from({ length: N }, (_, y) => [
        <span key={`r${y}`} className="bs2-head">{LETTERS[y]}</span>,
        ...Array.from({ length: N }, (_, x) => {
          const i = y * N + x
          const shot = sea.shots[i]
          const k = shipAt(sea, i)
          const sunk = k >= 0 && isSunk(sea, k)
          const showShip = own ? k >= 0 : (sunk || (g.phase === 'over' && k >= 0))
          const cls = `bs2-cell${showShip ? ' is-ship' : ''}${shot === 'hit' ? ' is-hit' : ''}${shot === 'miss' ? ' is-miss' : ''}${sunk ? ' is-sunk' : ''}${!own && !shot && g.phase === 'play' && g.turn === 'me' ? ' is-target' : ''}${!own && flash?.i === i ? ' is-flash' : ''}`
          return own
            ? <span key={i} className={cls}>{shot === 'hit' ? '💥' : shot === 'miss' ? '•' : ''}</span>
            : <button key={flash?.i === i ? `${i}-${flash.k}` : i} type="button" className={cls} onClick={() => shoot(i)} disabled={!!shot || g.phase !== 'play'}
              aria-label={`${LETTERS[y]}${x + 1}${shot === 'hit' ? ' פגיעה' : shot === 'miss' ? ' פספוס' : ''}`}>{shot === 'hit' ? (sunk ? '🔥' : '💥') : shot === 'miss' ? '•' : ''}</button>
        }),
      ])}
    </div>
  )

  return (
    <div className="arc-game">
      <Hud stats={[['יריות', g.myShots], ['הוטבעו', `${sunkEnemy.filter(Boolean).length}/${FLEET.length}`], ['ניצחונות', progress.wins]]}>
        {!daily && <ToolButton onClick={toggleSmart} label={smart ? 'מחשב חכם — לחצו למחשב קל' : 'מחשב קל — לחצו למחשב חכם'}>{smart ? '🧠' : '🐣'}</ToolButton>}
        <ToolButton onClick={restart} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <p className="bs2-msg" role="status">{g.msg}</p>
      <div className="arc-field bs2-field" ref={boxRef} style={{ flexDirection: portrait ? 'column' : 'row', gap: portrait ? 8 : 28 }}>
        {g.phase === 'setup' ? (
          <div className="bs2-setup">
            <h3>⚓ הצי שלכם</h3>
            {grid(g.mine, Math.max(22, Math.min(box.w - 16, box.h - 120) / (N + 1)), true)}
            <div className="bs2-setup-actions">
              <button type="button" className="arc-btn" onClick={() => setG(x => ({ ...x, mine: newSea(randomFleet()) }))}>🔀 סידור אחר</button>
              <button type="button" className="arc-btn arc-btn-main" onClick={() => say('🎯 תורכם! לחצו על משבצת בים של המחשב', { phase: 'play' })}>▶ מתחילים!</button>
            </div>
          </div>
        ) : <>
          <section className="bs2-side">
            <h3>🎯 הים של המחשב</h3>
            {grid(g.enemy, cellBig, false)}
            <ul className="bs2-fleet" aria-label="הצי של המחשב">
              {FLEET.map((s, k) => <li key={k} className={sunkEnemy[k] ? 'is-sunk' : ''}>{'■'.repeat(s.len)} {s.name}</li>)}
            </ul>
          </section>
          <section className="bs2-side">
            <h3>⚓ הצי שלי</h3>
            {grid(g.mine, cellSmall, true)}
          </section>
        </>}
      </div>
      {won && !daily && <EndCard title="🏆 ניצחתם!" text={`הטבעתם את כל הצי של המחשב ב־${g.myShots} יריות.${progress.best === g.myShots ? ' שיא אישי! 🎉' : ''}`}
        primary="⚓ משחק חדש" onPrimary={restart}
        secondary="📱 שתפו את הניצחון" onSecondary={() => onShare?.(`⚓ הטבעתי את כל הצי בצוללות של עוגה בוגה ב־${g.myShots} יריות! מי מנצח אותי?`)} />}
      {lost && !daily && <EndCard title="😵 המחשב ניצח" text="הוא מצא את כל הספינות שלכם. טיפ: אחרי פגיעה — נסו את המשבצות שמסביב!"
        primary="🔄 נקמה!" onPrimary={restart} />}
    </div>
  )
}
