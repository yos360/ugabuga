import { useState } from 'react'

// Shared lesson runner (used by the other board games too).
export default function LessonRunner({ lessons, render, apply, onPlay }) {
  const [n, setN] = useState(0)
  const [state, setState] = useState(() => lessons[0].setup())
  const [result, setResult] = useState(null) // 'ok' | 'no'
  const L = lessons[n]
  const go = k => { setN(k); setState(lessons[k].setup()); setResult(null) }
  const onMove = m => {
    const s = apply(state, m)
    setState(s)
    const r = L.goal(m, s, state)
    if (r === null) return // lesson continues (e.g. more dice to play)
    if (r) setResult('ok')
    else { setResult('no'); setTimeout(() => { setState(L.setup()); setResult(null) }, 1400) }
  }
  return (
    <div className="bg-learn">
      <ol className="bg-lesson-steps" aria-label="שיעורים">
        {lessons.map((l, k) => <li key={l.title}><button type="button" className={k === n ? 'is-on' : ''} onClick={() => go(k)}>{k + 1}</button></li>)}
      </ol>
      <h3>שיעור {n + 1}: {L.title}</h3>
      <p className="bg-lesson-text">{L.text}</p>
      {result === 'ok' && <p className="bg-lesson-ok" role="status">✔️ {L.ok}</p>}
      {result === 'no' && <p className="bg-lesson-no" role="status">כמעט! נסו שוב…</p>}
      {render(state, onMove, !!L.info || result === 'ok')}
      <div className="bg-actions">
        {(L.info || result === 'ok') && (n + 1 < lessons.length
          ? <button type="button" className="bg-primary" onClick={() => go(n + 1)}>לשיעור הבא ←</button>
          : <button type="button" className="bg-primary" onClick={onPlay}>🎮 לשחק משחק אמיתי</button>)}
        {!L.info && <button type="button" onClick={() => go(n)}>🔁 להתחיל את השיעור מחדש</button>}
      </div>
    </div>
  )
}
