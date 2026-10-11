import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { geom, conflicts } from './engine.js'
import { LEVEL_META } from './puzzles.js'

// Interactive board used on every /sudoku page. Mount it with key={level+seed} so a new
// puzzle starts fresh. Features: pencil notes, same-number highlight, optional mistake check,
// timer, undo, keyboard + touch number pad, completion celebration, best time per level.

const BEST_KEY = 'ugabuga-sudoku-best'
const PREF_KEY = 'ugabuga-sudoku-check'
function readJson(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback } catch { return fallback }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable — fine */ }
}
export function fmtTime(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
}
export function bestTimes() { return readJson(BEST_KEY, {}) }

export default function SudokuGame({ puzzle, onNew, onPrint, bestKey, newLabel = 'סודוקו חדש' }) {
  const { n, solution } = puzzle
  const G = geom(n)
  const givens = puzzle.puzzle
  const [grid, setGrid] = useState(() => givens.slice())
  const [notes, setNotes] = useState(() => givens.map(() => 0))
  const [history, setHistory] = useState([])
  const [sel, setSel] = useState(() => givens.findIndex(v => !v))
  const [notesMode, setNotesMode] = useState(false)
  const [check, setCheck] = useState(() => readJson(PREF_KEY, true))
  const [time, setTime] = useState(0)
  const [paused, setPaused] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [hints, setHints] = useState(0)
  const [best, setBest] = useState(() => bestTimes()[bestKey || puzzle.level] || 0)
  const [newBest, setNewBest] = useState(false)
  const boardRef = useRef(null)
  const won = grid.every((v, i) => v === solution[i])
  const key = bestKey || puzzle.level

  // timer: runs while playing, stops when solved, paused, or the tab is hidden
  useEffect(() => {
    if (won || paused) return undefined
    const t = setInterval(() => { if (document.visibilityState !== 'hidden') setTime(x => x + 1) }, 1000)
    return () => clearInterval(t)
  }, [won, paused])

  // record best time once, when solved without hints
  const recorded = useRef(false)
  useEffect(() => {
    if (!won || recorded.current) return
    recorded.current = true
    if (hints) return
    const all = bestTimes()
    if (!all[key] || time < all[key]) {
      all[key] = time
      writeJson(BEST_KEY, all)
      setBest(time)
      setNewBest(true)
    }
  }, [won, hints, key, time])

  const toggleCheck = () => setCheck(c => { writeJson(PREF_KEY, !c); return !c })

  const snapshot = useCallback(() => setHistory(h => [...h.slice(-199), { grid, notes }]), [grid, notes])

  const put = useCallback(v => {
    if (sel === null || sel < 0 || givens[sel] || won || paused) return
    if (notesMode && v) {
      if (grid[sel]) return
      snapshot()
      setNotes(ns => { const out = ns.slice(); out[sel] ^= 1 << (v - 1); return out })
      return
    }
    if (grid[sel] === v) return
    snapshot()
    setGrid(g => { const out = g.slice(); out[sel] = v; return out })
    if (v) {
      if (v !== solution[sel]) setMistakes(m => m + 1)
      // placing a digit clears it from the notes of the row, column and box
      setNotes(ns => {
        const out = ns.slice(); out[sel] = 0
        for (const p of G.peers[sel]) out[p] &= ~(1 << (v - 1))
        return out
      })
    }
  }, [sel, givens, won, paused, notesMode, grid, solution, G, snapshot])

  const undo = useCallback(() => {
    if (won || !history.length) return
    const last = history[history.length - 1]
    setGrid(last.grid); setNotes(last.notes)
    setHistory(history.slice(0, -1))
  }, [won, history])

  const hint = () => {
    if (won || paused) return
    const target = sel !== null && sel >= 0 && !givens[sel] && grid[sel] !== solution[sel] ? sel : grid.findIndex((v, i) => v !== solution[i])
    if (target < 0) return
    snapshot()
    setSel(target)
    setGrid(g => { const out = g.slice(); out[target] = solution[target]; return out })
    setNotes(ns => { const out = ns.slice(); out[target] = 0; for (const p of G.peers[target]) out[p] &= ~(1 << (solution[target] - 1)); return out })
    setHints(h => h + 1)
  }

  const restart = () => {
    setGrid(givens.slice()); setNotes(givens.map(() => 0)); setHistory([]); setTime(0); setMistakes(0); setHints(0); setPaused(false)
    recorded.current = false; setNewBest(false)
  }

  // keyboard: digits, arrows, Backspace/Delete, N = notes, Ctrl+Z = undo
  useEffect(() => {
    const onKey = e => {
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      if (document.querySelector('dialog[open]')) return
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); return }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const code = e.code || ''
      const digit = /^Digit[1-9]$|^Numpad[1-9]$/.test(code) ? Number(code.slice(-1)) : Number(e.key)
      if (digit >= 1 && digit <= n) { e.preventDefault(); put(digit); return }
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { e.preventDefault(); put(0); return }
      if (code === 'KeyN' || e.key === 'n' || e.key === 'N') { setNotesMode(m => !m); return }
      if (e.key && e.key.startsWith('Arrow')) {
        e.preventDefault()
        setSel(s => {
          const cur = s === null || s < 0 ? 0 : s
          const r = Math.floor(cur / n), c = cur % n
          const [dr, dc] = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key] || [0, 0]
          return ((r + dr + n) % n) * n + ((c + dc + n) % n)
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n, put, undo])

  const clash = useMemo(() => conflicts(grid, n), [grid, n])
  const selV = sel !== null && sel >= 0 ? grid[sel] : 0
  const sr = sel >= 0 ? Math.floor(sel / n) : -1, sc = sel >= 0 ? sel % n : -1
  const remaining = useMemo(() => {
    const out = Array(n + 1).fill(n)
    grid.forEach((v, i) => { if (v && v === solution[i]) out[v]-- })
    return out
  }, [grid, solution, n])
  const filled = grid.filter(Boolean).length
  const meta = LEVEL_META[puzzle.level]

  return (
    <div className="sdk-game" dir="rtl">
      <div className="sdk-bar">
        <span className="sdk-stat" aria-label="זמן">⏱️ <b>{fmtTime(time)}</b></span>
        {check && <span className="sdk-stat">טעויות: <b>{mistakes}</b></span>}
        {best > 0 && <span className="sdk-stat">שיא: <b>{fmtTime(best)}</b></span>}
        <button type="button" className="sdk-mini" onClick={() => setPaused(p => !p)} disabled={won} aria-pressed={paused}>{paused ? '▶ המשך' : '⏸ השהיה'}</button>
      </div>

      <div className="sdk-board-wrap">
        <div ref={boardRef} className={`sdk-board${paused ? ' is-paused' : ''}`} style={{ '--n': n, '--bc': G.bc, '--br': G.br }} role="grid" aria-label={`לוח סודוקו ${n} על ${n}`}>
          {grid.map((v, i) => {
            const r = Math.floor(i / n), c = i % n
            const given = !!givens[i]
            const wrong = !given && v && ((check && v !== solution[i]) || clash.has(i))
            const related = sel >= 0 && (r === sr || c === sc || G.boxOf[i] === G.boxOf[sel])
            const same = selV && v === selV && sel !== i
            const noteSame = selV && !v && (notes[i] & (1 << (selV - 1)))
            const cls = ['sdk-cell',
              given && 'is-given', wrong && 'is-wrong',
              sel === i ? 'is-sel' : same ? 'is-same' : related ? 'is-rel' : '',
              (c + 1) % G.bc === 0 && c < n - 1 && 'b-e', (r + 1) % G.br === 0 && r < n - 1 && 'b-s',
              c === n - 1 && 'lc', r === n - 1 && 'lr',
            ].filter(Boolean).join(' ')
            return (
              <button key={i} type="button" className={cls} onClick={() => setSel(i)} tabIndex={sel === i ? 0 : -1}
                aria-label={`שורה ${r + 1} עמודה ${c + 1}: ${v || 'ריק'}${given ? ' (נתון)' : ''}`}>
                {paused ? '' : v ? v : notes[i] ? (
                  <span className="sdk-notes">{Array.from({ length: n }, (_, k) => <i key={k} className={noteSame && k + 1 === selV ? 'is-hl' : ''}>{notes[i] & (1 << k) ? k + 1 : ''}</i>)}</span>
                ) : ''}
              </button>
            )
          })}
          {paused && !won && <button type="button" className="sdk-paused" onClick={() => setPaused(false)}>⏸ המשחק מושהה — לחצו להמשך</button>}
        </div>
        {won && (
          <div className="sdk-win" role="status">
            <div className="sdk-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, k) => <span key={k} style={{ '--k': k }}>{['🎉', '⭐', '✨', '🎊'][k % 4]}</span>)}</div>
            <p className="sdk-win-title">🎉 כל הכבוד, פתרתם!</p>
            <p>{meta ? meta.long : 'סודוקו'} תוך <b>{fmtTime(time)}</b>{mistakes ? (mistakes === 1 ? ', עם טעות אחת' : `, עם ${mistakes} טעויות`) : ', בלי אף טעות'}{hints ? ` ו־${hints} רמזים` : ''}.</p>
            {newBest && <p className="sdk-win-best">🏆 שיא אישי חדש ברמה הזו!</p>}
            {hints > 0 && <p className="sdk-win-note">שיא אישי נשמר רק בפתרון בלי רמזים.</p>}
            <div className="sdk-win-actions">
              {onNew && <button type="button" className="sdk-btn sdk-btn-primary" onClick={onNew}>▶ {newLabel}</button>}
              {onPrint && <button type="button" className="sdk-btn" onClick={() => onPrint(puzzle)}>🖨️ הדפסה</button>}
            </div>
          </div>
        )}
      </div>

      <div className="sdk-tools">
        <button type="button" className="sdk-tool" onClick={undo} disabled={!history.length || won}><span aria-hidden="true">↩️</span>ביטול</button>
        <button type="button" className="sdk-tool" onClick={() => put(0)} disabled={won}><span aria-hidden="true">⌫</span>מחיקה</button>
        <button type="button" className={`sdk-tool${notesMode ? ' is-on' : ''}`} onClick={() => setNotesMode(m => !m)} aria-pressed={notesMode}><span aria-hidden="true">✏️</span>טיוטה {notesMode ? 'פועלת' : ''}</button>
        <button type="button" className="sdk-tool" onClick={hint} disabled={won}><span aria-hidden="true">💡</span>רמז</button>
      </div>

      <div className="sdk-pad" style={{ '--n': n }}>
        {Array.from({ length: n }, (_, k) => k + 1).map(v => (
          <button key={v} type="button" className="sdk-key" onClick={() => put(v)} disabled={won || remaining[v] <= 0} aria-label={`המספר ${v}`}>
            {v}<small aria-hidden="true">{remaining[v] > 0 ? remaining[v] : '✓'}</small>
          </button>
        ))}
      </div>

      <div className="sdk-foot">
        <label className="sdk-switch"><input type="checkbox" checked={check} onChange={toggleCheck} /> בדיקת טעויות</label>
        <span className="sdk-progress">{filled}/{n * n} משבצות</span>
        <button type="button" className="sdk-link" onClick={restart}>התחלה מחדש</button>
        {onNew && <button type="button" className="sdk-link" onClick={onNew}>{newLabel}</button>}
        {onPrint && <button type="button" className="sdk-link" onClick={() => onPrint(puzzle)}>🖨️ הדפסת הלוח</button>}
      </div>
    </div>
  )
}
