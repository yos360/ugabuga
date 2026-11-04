import { useEffect, useState } from 'react'
import { LEVELS, generate } from '../logic/sudoku'
import { rng } from '../logic/rng'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import { sfx, buzz } from '../sfx'

function newGame(level, daily) {
  const { puzzle, solution } = generate(level, daily ? rng(daily.seed) : Math.random)
  return { level, puzzle, solution, grid: puzzle.slice(), notes: puzzle.map(() => []), mistakes: 0, hints: 0 }
}

const LEVEL_EN = { kids: 'Little ones 4×4', six: '6×6', easy: 'Easy 9×9', medium: 'Medium', hard: 'Hard' }

export default function Sudoku({ onReport, onShare, daily, initialLevel, lang = 'he' }) {
  const en = lang === 'en'
  const levelName = l => (en ? LEVEL_EN[l.id] || l.name : l.name)
  const [progress, saveProgress] = useProgress('sudoku', { level: 'easy', solved: 0 })
  const [g, setG] = useState(() => newGame(LEVELS.find(l => l.id === (daily?.level || initialLevel || progress.level)) || LEVELS[2], daily))
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
    if (daily) { daily.finish({ text: `🔢 סודוקו: פתרתי תוך ${fmt(time)}${g.mistakes ? ` (${g.mistakes} טעויות)` : ' בלי טעויות'}${g.hints ? `, ${g.hints} רמזים` : ''}`, score: time + g.mistakes * 30 + g.hints * 60, won: true }); return }
    saveProgress(p => ({ solved: p.solved + 1 }))
    onReport?.({ text: en ? `🔢 I solved a ${levelName(g.level)} sudoku in ${fmt(time)}!` : `🔢 פתרתי סודוקו ${g.level.name} תוך ${fmt(time)}!` })
  }, [won, g.level, g.mistakes, g.hints, time, saveProgress, onReport, daily, en])

  const start = level => { setG(newGame(level, daily)); setSel(null); setTime(0); if (!daily) saveProgress({ level: level.id }) }
  // Would putting the right number v at i complete its row, column or box? (a little cheer)
  const unitDone = (grid, i, v) => {
    const next = grid.slice(); next[i] = v
    const r = Math.floor(i / n), c = i % n
    const cells = k => [Math.floor(k / n), k % n]
    const full = test => next.every((x, k) => !test(...cells(k)) || x === g.solution[k])
    return full(rk => rk === r) || full((_, ck) => ck === c) || full((rk, ck) => Math.floor(rk / br) === Math.floor(r / br) && Math.floor(ck / bc) === Math.floor(c / bc))
  }

  const put = v => {
    if (sel === null || g.puzzle[sel] || won) return
    if (notesMode && v) {
      setG(x => { const notes = x.notes.slice(); const cur = notes[sel]; notes[sel] = cur.includes(v) ? cur.filter(k => k !== v) : [...cur, v].sort(); return { ...x, notes } })
      sfx('pick')
      return
    }
    if (!v) sfx('slide')
    else if (v !== g.solution[sel]) { sfx('wrong'); buzz(50) }
    else if (unitDone(g.grid, sel, v)) { sfx('combo'); buzz(20) }
    else sfx('place')
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
      <Hud stats={[['⏱️', fmt(time)], [en ? 'Mistakes' : 'טעויות', g.mistakes]]}>
        <ToolButton onClick={() => setNotesMode(m => !m)} label={notesMode ? (en ? 'Notes mode is on' : 'מצב טיוטה פעיל') : (en ? 'Notes mode' : 'מצב טיוטה')}><span className={notesMode ? 'ms-flag-on' : ''}>✏️</span></ToolButton>
        <ToolButton onClick={() => put(0)} label={en ? 'Erase' : 'מחיקה'}>⌫</ToolButton>
        <ToolButton onClick={hint} label={en ? 'Hint' : 'רמז'}>💡</ToolButton>
        <ToolButton onClick={() => start(g.level)} label={en ? 'New game' : 'משחק חדש'}>🔄</ToolButton>
      </Hud>
      {!daily && <div className="sp-levels" role="group" aria-label={en ? 'Difficulty' : 'רמת קושי'}>
        {LEVELS.map(l => <button key={l.id} type="button" className={`arc-chip${l.id === g.level.id ? ' is-on' : ''}`} onClick={() => start(l)}>{levelName(l)}</button>)}
      </div>}
      <div className="arc-field" ref={boxRef} style={{ flexDirection: 'column', gap: 10 }}>
        <div className="sd-board" style={{ width: size, height: size, gridTemplateColumns: `repeat(${n}, 1fr)`, fontSize: cell * 0.56 }} role="grid" aria-label={en ? `Sudoku ${n} by ${n}` : `סודוקו ${n} על ${n}`}>
          {g.grid.map((v, i) => {
            const r = Math.floor(i / n), c = i % n
            const given = !!g.puzzle[i]
            const wrong = v && v !== g.solution[i]
            const sr = sel !== null && Math.floor(sel / n), sc = sel !== null && sel % n
            const related = sel !== null && (r === sr || c === sc || (Math.floor(r / br) === Math.floor(sr / br) && Math.floor(c / bc) === Math.floor(sc / bc)))
            const cls = `sd-cell${given ? ' is-given' : ''}${wrong ? ' is-wrong' : ''}${sel === i ? ' is-sel' : related ? ' is-rel' : ''}${selV && v === selV && sel !== i ? ' is-same' : ''}${(c + 1) % bc === 0 && c < n - 1 ? ' b-e' : ''}${(r + 1) % br === 0 && r < n - 1 ? ' b-s' : ''}`
            return (
              <button key={i} type="button" className={cls} onClick={() => setSel(i)} aria-label={en ? `Row ${r + 1} column ${c + 1}: ${v || 'empty'}` : `שורה ${r + 1} עמודה ${c + 1}: ${v || 'ריק'}`}>
                {v ? v : g.notes[i].length ? <span className="sd-notes" style={{ gridTemplateColumns: `repeat(${bc}, 1fr)` }}>{Array.from({ length: n }, (_, k) => <i key={k}>{g.notes[i].includes(k + 1) ? k + 1 : ''}</i>)}</span> : ''}
              </button>
            )
          })}
        </div>
        <div className="sd-pad" style={{ width: size }}>
          {Array.from({ length: n }, (_, k) => k + 1).map(v => (
            <button key={v} type="button" className="sd-key" onClick={() => put(v)} disabled={counts[v] >= n} aria-label={en ? `Number ${v}` : `המספר ${v}`}>{v}</button>
          ))}
        </div>
      </div>
      {won && !daily && <EndCard lang={lang} title={en ? '🎉 Solved!' : '🎉 פתרתם!'} text={en ? `${levelName(g.level)} sudoku in ${fmt(time)}${g.mistakes ? ` with ${g.mistakes} mistake${g.mistakes === 1 ? '' : 's'}` : ' with no mistakes'}${g.hints ? ` and ${g.hints} hint${g.hints === 1 ? '' : 's'}` : ''}.` : `סודוקו ${g.level.name} תוך ${fmt(time)}${g.mistakes ? ` עם ${g.mistakes} טעויות` : ' בלי אף טעות'}${g.hints ? ` ו־${g.hints} רמזים` : ''}.`}
        primary={en ? '▶ New sudoku' : '▶ סודוקו חדש'} onPrimary={() => start(g.level)}
        secondary={en ? '📱 Share your score' : '📱 שתפו את ההישג'} onSecondary={() => onShare?.(en ? `🔢 I solved a ${levelName(g.level)} sudoku in ${fmt(time)}! Can you do it faster?` : `🔢 פתרתי סודוקו ${g.level.name} תוך ${fmt(time)}! תצליחו מהר יותר?`)} />}
    </div>
  )
}

function fmt(sec) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` }
