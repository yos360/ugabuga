import { useEffect, useRef, useState } from 'react'
import { N, FLEET, randomFleet, newSea, fire, aiShot, allSunk, isSunk, shipAt } from '../logic/battleship'
import { setupBattle } from '../logic/battleshipSetup'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const LETTERS_HE = 'אבגדהוזחטי'
const SHIPS_EN = ['Aircraft carrier', 'Destroyer', 'Submarine', 'Missile boat', 'Patrol boat']

export default function Battleship({ onReport, onShare, daily, lang = 'he' }) {
  const en = lang === 'en'
  const LETTERS = en ? 'ABCDEFGHIJ' : LETTERS_HE
  const shipName = k => (en ? SHIPS_EN[k] : FLEET[k].name)
  const [progress, saveProgress] = useProgress('battleship', { smart: true, wins: 0, best: 0 })
  const [g, setG] = useState(() => setupBattle(daily, lang))
  const [smart, setSmart] = useState(daily ? true : progress.smart)
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
    if (allSunk(r.sea)) { setG({ ...g, enemy: r.sea, myShots, phase: 'over', msg: en ? '🏆 You sank the whole fleet!' : '🏆 הטבעתם את כל הצי!' }); return }
    if (r.result === 'miss') setG({ ...g, enemy: r.sea, myShots, turn: 'ai', msg: en ? '🌊 A miss… now the computer fires' : '🌊 פספוס… עכשיו המחשב יורה' })
    else if (r.result === 'sunk') setG({ ...g, enemy: r.sea, myShots, msg: en ? `💥 You sank the ${shipName(r.ship).toLowerCase()}! You get another shot` : `💥 הטבעתם ${FLEET[r.ship].name}! יש לכם עוד יריה` })
    else setG({ ...g, enemy: r.sea, myShots, msg: en ? '🔥 A hit! You get another shot' : '🔥 פגיעה! יש לכם עוד יריה' })
  }

  // computer's turn
  useEffect(() => {
    if (g.phase !== 'play' || g.turn !== 'ai') return undefined
    const t = setTimeout(() => {
      const r = fire(g.mine, aiShot(g.mine, smart, g.aiRand))
      if (allSunk(r.sea)) setG({ ...g, mine: r.sea, phase: 'over', msg: en ? 'The computer sank your whole fleet' : 'המחשב הטביע את כל הצי שלכם' })
      else if (r.result === 'miss') setG({ ...g, mine: r.sea, turn: 'me', msg: en ? "🎯 Your turn! Tap a square in the computer's sea" : '🎯 תורכם! לחצו על משבצת בים של המחשב' })
      else setG({ ...g, mine: r.sea, msg: r.result === 'sunk' ? (en ? `😱 The computer sank your ${SHIPS_EN[r.ship].toLowerCase()}` : `😱 המחשב הטביע לכם ${FLEET[r.ship].name}`) : (en ? '😬 The computer hit you… and fires again' : '😬 המחשב פגע בכם… והוא יורה שוב') })
    }, 700)
    return () => clearTimeout(t)
  }, [g, smart, en])

  useEffect(() => {
    if (g.phase !== 'over' || doneRef.current) return
    doneRef.current = true
    if (won) {
      saveProgress(p => ({ wins: p.wins + 1, best: p.best ? Math.min(p.best, g.myShots) : g.myShots }))
      const text = en ? `⚓ I sank the computer's whole fleet at Battleship in ${g.myShots} shots!` : `⚓ הטבעתי את כל הצי של המחשב בצוללות ב־${g.myShots} יריות!`
      onReport?.({ text })
      daily?.finish({ text: `⚓ צוללות: ניצחתי ב־${g.myShots} יריות`, score: g.myShots, won: true })
    } else daily?.finish({ text: `⚓ צוללות: המחשב ניצח הפעם (${g.myShots} יריות)`, score: null })
  }, [g.phase, g.myShots, won, saveProgress, onReport, daily, en])

  const restart = () => { doneRef.current = false; setG(setupBattle(daily, lang)) }
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
      role="grid" aria-label={own ? (en ? 'My fleet' : 'הצי שלי') : (en ? "The computer's sea" : 'הים של המחשב')}>
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
              aria-label={`${LETTERS[y]}${x + 1}${shot === 'hit' ? (en ? ' hit' : ' פגיעה') : shot === 'miss' ? (en ? ' miss' : ' פספוס') : ''}`}>{shot === 'hit' ? (sunk ? '🔥' : '💥') : shot === 'miss' ? '•' : ''}</button>
        }),
      ])}
    </div>
  )

  return (
    <div className="arc-game">
      <Hud stats={[[en ? 'Shots' : 'יריות', g.myShots], [en ? 'Sunk' : 'הוטבעו', `${sunkEnemy.filter(Boolean).length}/${FLEET.length}`], [en ? 'Wins' : 'ניצחונות', progress.wins]]}>
        {!daily && <ToolButton onClick={toggleSmart} label={smart ? (en ? 'Smart computer - tap for an easy computer' : 'מחשב חכם — לחצו למחשב קל') : (en ? 'Easy computer - tap for a smart computer' : 'מחשב קל — לחצו למחשב חכם')}>{smart ? '🧠' : '🐣'}</ToolButton>}
        <ToolButton onClick={restart} label={en ? 'New game' : 'משחק חדש'}>🔄</ToolButton>
      </Hud>
      <p className="bs2-msg" role="status">{g.msg}</p>
      <div className="arc-field bs2-field" ref={boxRef} style={{ flexDirection: portrait ? 'column' : 'row', gap: portrait ? 8 : 28 }}>
        {g.phase === 'setup' ? (
          <div className="bs2-setup">
            <h3>{en ? '⚓ Your fleet' : '⚓ הצי שלכם'}</h3>
            {grid(g.mine, Math.max(22, Math.min(box.w - 16, box.h - 120) / (N + 1)), true)}
            <div className="bs2-setup-actions">
              {!daily && <button type="button" className="arc-btn" onClick={() => setG(x => ({ ...x, mine: newSea(randomFleet()) }))}>{en ? '🔀 Shuffle' : '🔀 סידור אחר'}</button>}
              <button type="button" className="arc-btn arc-btn-main" onClick={() => say(en ? "🎯 Your turn! Tap a square in the computer's sea" : '🎯 תורכם! לחצו על משבצת בים של המחשב', { phase: 'play' })}>{en ? '▶ Start!' : '▶ מתחילים!'}</button>
            </div>
          </div>
        ) : <>
          <section className="bs2-side">
            <h3>{en ? "🎯 The computer's sea" : '🎯 הים של המחשב'}</h3>
            {grid(g.enemy, cellBig, false)}
            <ul className="bs2-fleet" aria-label={en ? "The computer's fleet" : 'הצי של המחשב'}>
              {FLEET.map((s, k) => <li key={k} className={sunkEnemy[k] ? 'is-sunk' : ''}>{'■'.repeat(s.len)} {shipName(k)}</li>)}
            </ul>
          </section>
          <section className="bs2-side">
            <h3>{en ? '⚓ My fleet' : '⚓ הצי שלי'}</h3>
            {grid(g.mine, cellSmall, true)}
          </section>
        </>}
      </div>
      {won && !daily && <EndCard lang={lang} title={en ? '🏆 You won!' : '🏆 ניצחתם!'} text={en ? `You sank the computer's whole fleet in ${g.myShots} shots.${progress.best === g.myShots ? ' A personal best! 🎉' : ''}` : `הטבעתם את כל הצי של המחשב ב־${g.myShots} יריות.${progress.best === g.myShots ? ' שיא אישי! 🎉' : ''}`}
        primary={en ? '⚓ New game' : '⚓ משחק חדש'} onPrimary={restart}
        secondary={en ? '📱 Share your win' : '📱 שתפו את הניצחון'} onSecondary={() => onShare?.(en ? `⚓ I sank the whole fleet at Battleship on Ugabuga in ${g.myShots} shots! Can you beat me?` : `⚓ הטבעתי את כל הצי בצוללות של עוגה בוגה ב־${g.myShots} יריות! מי מנצח אותי?`)} />}
      {lost && !daily && <EndCard lang={lang} title={en ? '😵 The computer won' : '😵 המחשב ניצח'} text={en ? 'It found all your ships. Tip: after a hit, try the squares around it!' : 'הוא מצא את כל הספינות שלכם. טיפ: אחרי פגיעה — נסו את המשבצות שמסביב!'}
        primary={en ? '🔄 Revenge!' : '🔄 נקמה!'} onPrimary={restart} />}
    </div>
  )
}
