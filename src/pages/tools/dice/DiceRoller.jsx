import { useState, useCallback, useRef } from 'react'
import { Die3D } from './Die3D'

// Generic roller used by the dice-family pages.
// sides: 6 renders 3D dice; other sides render numbered tiles.
// faces: optional array of labels (emoji/words) instead of numbers.
// mode: 'sum' | 'backgammon' | 'monopoly' | 'faces'
export default function DiceRoller({ sides = 6, counts = [1, 2, 3], defaultCount = counts[0], faces = null, mode = 'sum', sideOptions = null, renderMessage = null }) {
  const [count, setCount] = useState(defaultCount)
  const [s, setS] = useState(sides)
  const [values, setValues] = useState(Array(defaultCount).fill(faces ? 0 : sides))
  const [rolling, setRolling] = useState(false)
  const [history, setHistory] = useState([])
  const [doublesInRow, setDoublesInRow] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  const roll = useCallback(() => {
    setRolling(true)
    setTimeout(() => {
      const n = faces ? faces.length : s
      const vals = Array.from({ length: count }, () => Math.floor(Math.random() * n) + (faces ? 0 : 1))
      setValues(vals)
      const isDouble = vals.length === 2 && vals[0] === vals[1]
      setDoublesInRow(d => (isDouble ? (d >= 3 ? 1 : d + 1) : 0)) // after going to jail the count starts over
      setHistory(h => [{ vals, total: vals.reduce((a, b) => a + b, 0), isDouble }, ...h].slice(0, 10))
      setRolling(false)
    }, 650)
  }, [count, s, faces])

  const total = values.reduce((a, b) => a + b, 0)
  const isDouble = !rolling && values.length === 2 && values[0] === values[1] && history.length > 0
  const label = v => (faces ? faces[v] : v)

  let message = null
  if (history.length && !rolling) {
    if (mode === 'backgammon') message = isDouble ? `דאבל ${values[0]}! משחקים ארבעה מהלכים של ${values[0]} (סה״כ ${values[0] * 4})` : `מזיזים ${values[0]} ו-${values[1]} (סה״כ ${total})`
    if (mode === 'monopoly') message = doublesInRow >= 3 ? 'שלושה דאבלים ברצף — לפי החוקים הולכים לכלא! 🚔' : isDouble ? `דאבל! מתקדמים ${total} משבצות ומטילים שוב (דאבל מספר ${doublesInRow} ברצף)` : `מתקדמים ${total} משבצות`
  }

  if (renderMessage && history.length && !rolling) message = renderMessage(values)

  return (
    <div>
      {sideOptions && (
        <div className="flex flex-wrap justify-center gap-2 mb-4" role="group" aria-label="מספר פאות">
          {sideOptions.map(n => (
            <button key={n} onClick={() => { setS(n); setValues(Array(count).fill(n)); setHistory([]) }} aria-pressed={s === n}
              className={`wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${s === n ? 'bg-[var(--postit)]' : 'bg-[var(--card)]'}`}>D{n}</button>
          ))}
        </div>
      )}
      {counts.length > 1 && (
        <div className="flex justify-center gap-2 mb-6">
          {counts.map(n => (
            <button key={n} onClick={() => { setCount(n); setValues(Array(n).fill(faces ? 0 : s)); setHistory([]); setDoublesInRow(0) }} aria-pressed={count === n}
              className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold ${count === n ? 'bg-[var(--postit)]' : 'bg-[var(--card)]'}`}>
              {n} {n === 1 ? 'קובייה' : 'קוביות'}
            </button>
          ))}
        </div>
      )}

      <div ref={ref} onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setMouse({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 }) }}
        className="flex flex-wrap justify-center gap-6 mb-6 py-6" aria-live="polite">
        {values.map((v, i) => (s === 6 && !faces
          ? <Die3D key={i} value={v} rolling={rolling} mouseX={mouse.x} mouseY={mouse.y} />
          : <div key={i} className={`flex h-24 min-w-24 items-center justify-center wobbly border-[3px] border-[var(--border)] bg-[var(--card)] px-3 text-center font-display font-bold sketch-shadow-sm transition-transform ${rolling ? 'animate-spin' : ''} ${faces ? 'text-2xl' : 'text-4xl'}`}>{rolling ? '?' : label(v)}</div>))}
      </div>

      {!faces && count > 1 && mode === 'sum' && <p className="text-center font-display text-3xl font-bold mb-4">סה״כ: {total}</p>}
      {message && <p className="text-center font-display text-2xl font-bold mb-4" role="status">{message}</p>}

      <div className="text-center mb-6">
        <button onClick={roll} disabled={rolling}
          className="wobbly-md sketch-press min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-10 py-3 font-display text-xl font-bold text-[var(--accent-foreground)] disabled:opacity-50">
          {rolling ? '🎲 מגלגל...' : '🎲 הטילו!'}
        </button>
      </div>

      {history.length > 0 && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="font-display text-lg font-bold mb-2">הטלות אחרונות</h2>
          {history.map((h, i) => <p key={i} className="font-hand text-base">{faces ? h.vals.map(label).join(' · ') : `${h.vals.join(' + ')}${h.vals.length > 1 ? ' = ' + h.total : ''}${h.isDouble ? ' (דאבל)' : ''}`}</p>)}
        </div>
      )}
    </div>
  )
}
