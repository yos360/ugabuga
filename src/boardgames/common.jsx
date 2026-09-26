import { useEffect, useState } from 'react'

// Shared pieces for the simpler classic games: controls (mode + level), a computer-turn hook,
// and a step-by-step "learn" walkthrough.

export const LEVELS3 = [{ id: 1, label: 'קל' }, { id: 2, label: 'בינוני' }, { id: 3, label: 'קשה' }]

export function Controls({ mode, setMode, level, setLevel, extra }) {
  return (
    <div className="bg-controls">
      <label>מצב: <select value={mode} onChange={e => setMode(e.target.value)}><option value="computer">נגד המחשב</option><option value="friend">נגד חבר (על אותו מסך)</option></select></label>
      {mode === 'computer' && <label>רמה: <select value={level} onChange={e => setLevel(+e.target.value)}>{LEVELS3.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>}
      {extra}
    </div>
  )
}

// Runs `move()` for the computer after a short pause whenever `active` is true.
export function useComputerTurn(active, deps, move, delay = 550) {
  useEffect(() => {
    if (!active) return
    const t = setTimeout(move, delay)
    return () => clearTimeout(t)
  }, [active, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
}

export function StepsLearn({ steps, onPlay }) {
  const [i, setI] = useState(0)
  const s = steps[i]
  return (
    <div className="bg-learn">
      <ol className="bg-lesson-steps" aria-label="שלבים">
        {steps.map((x, k) => <li key={x.title}><button type="button" className={k === i ? 'is-on' : ''} onClick={() => setI(k)}>{k + 1}</button></li>)}
      </ol>
      <h3>{i + 1}. {s.title}</h3>
      {s.pic && <p className="bg-step-pic" aria-hidden="true">{s.pic}</p>}
      <p className="bg-lesson-text">{s.text}</p>
      <div className="bg-actions">
        {i > 0 && <button type="button" onClick={() => setI(i - 1)}>→ הקודם</button>}
        {i + 1 < steps.length
          ? <button type="button" className="bg-primary" onClick={() => setI(i + 1)}>הבא ←</button>
          : <button type="button" className="bg-primary" onClick={onPlay}>🎮 לשחק!</button>}
      </div>
    </div>
  )
}

// Negamax with alpha-beta over a generic game interface.
export function negamax(state, depth, alpha, beta, g) {
  const end = g.terminal(state)
  if (end !== null) return end * (1000 + depth) // end: +1 win / -1 loss for the side to move, 0 draw
  if (depth === 0) return g.evaluate(state)
  let best = -Infinity
  for (const m of g.moves(state)) {
    const v = -negamax(g.play(state, m), depth - 1, -beta, -alpha, g)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

export function pickMove(state, depth, g, noise = 0) {
  let best = null, bestV = -Infinity
  for (const m of g.moves(state)) {
    const v = -negamax(g.play(state, m), depth - 1, -Infinity, Infinity, g) + Math.random() * noise
    if (v > bestV) { bestV = v; best = m }
  }
  return best
}
