import { useEffect, useState } from 'react'
import { LEVELS, generate } from '../logic/sudoku'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

function newGame(level) {
  const { puzzle, solution } = generate(level)
  return { level, puzzle, solution, grid: puzzle.slice(), notes: puzzle.map(() => []), mistakes: 0, hints: 0 }
}

export default function Sudoku({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('sudoku', { level: 'easy', solved: 0 })
  const [g, setG] = useState(() => newGame(LEVELS.find(l => l.id === progress.level) || LEVELS[2]))
  const [sel, setSel] = useState(null)
  const [notesMode, setNotesMode] = useState(false)
  const [time, setTime] = useState(0)
  const [boxRef, box] = useBox()
  const { n, br, bc } = g.level
  const won = g.grid.every((v, i) => v === g.solution[i])

  useEffect(() => {
    if (won) return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [won])
  useEffect(() => {
    if (!won) return
    saveProgress(p => ({ solved: p.solved + 1 }))
    onReport?.({ text: `🔢 פתרתי סודוקו ${g.level.name} תוך ${fmt(time)}!` })
  }, [won, g.level.name, time, saveProgress, onReport])

  const start = level => { setG(newGame(level)); setSel(null); setTime(0); saveProgress({ level: level.id }) }

  const put = v => {
    if (sel === null || g.puzzle[sel] || won) return
    if (notesMode && v) {
      setG(x => { const notes = x.notes.slice(); const cur = notes[sel]; notes[sel] = cur.includes(v) ? cur.filter(k => k !== v) : [...cur, v].sort(); return { ...x, notes } })
      return
    }
    setG(x => {
      const grid = x.grid.slice(); grid[sel] = v
      const notes = x.notes.slice(); notes[sel] = []
      // a correct number clears that note from its row, column and box
      if (v === x.solution[sel]) {
        const r = Math.floor(sel / n), c = sel % n
        notes.forEach((list, i) => {
          const ri = Math.floor(i / n), ci = i % n
          const same = ri === r || ci === c || (Math.floor(ri / br) === Math.floor(r / br) && Math.floor(ci / bc) === Math.floor(c / bc))
          if (same && list.includes(v)) notes[i] = list.filter(k => k !== v)
        })
      }
      return { ...x, grid, notes, mistakes: x.mistakes + (v && v !== x.solution[sel] ? 1 : 0) }
    })
  }
  const hint = () => {
    const i = sel !== null && !g.puzzle[sel] && g.grid[sel] !== g.solution[sel] ? sel : g.grid.findIndex((v, k) => v !== g.solution[k])
    if (i < 0) return
    setSel(i)
    setG(x => { const grid = x.grid.slice(); grid[i] = x.solution[i]; const notes = x.notes.slice(); notes[i] = []; return { ...x, grid, notes, hints: x.hints + 1 } })
  }

  useEffect(() => {
    const onKey = e => {
      if (sel === null) return
      const v = Number(e.key)
      if (v >= 1 && v <= n) put(v)
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') put(0)
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const r = Math.floor(sel / n), c = sel % n
        const [dr, dc] = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]
        setSel(((r + dr + n) % n) * n + ((c + dc + n) % n))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const size = Math.max(200, Math.min(box.w - 12, box.h - 76, 560))
  const cell = size / n
  const selV = sel !== null ? g.grid[sel] : 0
  const counts = Array.from({ length: n + 1 }, (_, v) => g.grid.filter((x, i) => x === v && x === g.solution[i]).length)

  return (
    <div className="arc-game">
      <Hud stats={[['⏱️', fmt(time)], ['טעויות', g.mistakes]]}>
        <ToolButton onClick={() => setNotesMode(m => !m)} label={notesMode ? 'מצב טיוטה פעיל' : 'מצב טיוטה'}><span className={notesMode ? 'ms-flag-on' : ''}>✏️</span></ToolButton>
        <ToolButton onClick={() => put(0)} label="מחיקה">⌫</ToolButton>
        <ToolButton onClick={hint} label="רמז">💡</ToolButton>
        <ToolButton onClick={() => start(g.level)} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="sp-levels" role="group" aria-label="רמת קושי">
        {LEVELS.map(l => <button key={l.id} type="button" className={`arc-chip${l.id === g.level.id ? ' is-on' : ''}`} onClick={() => start(l)}>{l.name}</button>)}
      </div>
      <div className="arc-field" ref={boxRef} style={{ flexDirection: 'column', gap: 10 }}>
        <div className="sd-board" style={{ width: size, height: size, gridTemplateColumns: `repeat(${n}, 1fr)`, fontSize: cell * 0.56 }} role="grid" aria-label={`סודוקו ${n} על ${n}`}>
          {g.grid.map((v, i) => {
            const r = Math.floor(i / n), c = i % n
            const given = !!g.puzzle[i]
            const wrong = v && v !== g.solution[i]
            const sr = sel !== null && Math.floor(sel / n), sc = sel !== null && sel % n
            const related = sel !== null && (r === sr || c === sc || (Math.floor(r / br) === Math.floor(sr / br) && Math.floor(c / bc) === Math.floor(sc / bc)))
            const cls = `sd-cell${given ? ' is-given' : ''}${wrong ? ' is-wrong' : ''}${sel === i ? ' is-sel' : related ? ' is-rel' : ''}${selV && v === selV && sel !== i ? ' is-same' : ''}${(c + 1) % bc === 0 && c < n - 1 ? ' b-e' : ''}${(r + 1) % br === 0 && r < n - 1 ? ' b-s' : ''}`
            return (
              <button key={i} type="button" className={cls} onClick={() => setSel(i)} aria-label={`שורה ${r + 1} עמודה ${c + 1}: ${v || 'ריק'}`}>
                {v ? v : g.notes[i].length ? <span className="sd-notes" style={{ gridTemplateColumns: `repeat(${bc}, 1fr)` }}>{Array.from({ length: n }, (_, k) => <i key={k}>{g.notes[i].includes(k + 1) ? k + 1 : ''}</i>)}</span> : ''}
              </button>
            )
          })}
        </div>
        <div className="sd-pad" style={{ width: size }}>
          {Array.from({ length: n }, (_, k) => k + 1).map(v => (
            <button key={v} type="button" className="sd-key" onClick={() => put(v)} disabled={counts[v] >= n} aria-label={`המספר ${v}`}>{v}</button>
          ))}
        </div>
      </div>
      {won && <EndCard title="🎉 פתרתם!" text={`סודוקו ${g.level.name} תוך ${fmt(time)}${g.mistakes ? ` עם ${g.mistakes} טעויות` : ' בלי אף טעות'}${g.hints ? ` ו־${g.hints} רמזים` : ''}.`}
        primary="▶ סודוקו חדש" onPrimary={() => start(g.level)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.(`🔢 פתרתי סודוקו ${g.level.name} תוך ${fmt(time)}! תצליחו מהר יותר?`)} />}
    </div>
  )
}

function fmt(sec) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` }
