import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { pairs, cellIndex, cellRefs, emptyState, nextStep, stepText, solveSteps, solutionGrid } from '../../logicgrid/engine'
import { levelLine } from '../../logicgrid/themes'
import './logic-puzzles.css'

const SYMBOL = { 1: '✓', '-1': '✗', 0: '' }
const shortOf = item => item.short || item.label

// SVG rotation survives PDF capture, unlike CSS writing-mode. Measure with the
// actual inherited font so long labels keep their original space in the table.
export function ColumnLabel({ children }) {
  const text = useRef(null)
  const [size, setSize] = useState({ height: 80, font: 'sans-serif', px: 13 })
  useLayoutEffect(() => {
    let active = true
    const measure = () => {
      if (!active || !text.current) return
      const style = getComputedStyle(text.current.closest('th'))
      const px = parseFloat(style.fontSize)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx.font = `700 ${px}px ${style.fontFamily}`
      setSize({ height: Math.ceil(ctx.measureText(children).width) + 8, font: style.fontFamily, px })
    }
    measure()
    document.fonts.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => { active = false; window.removeEventListener('resize', measure) }
  }, [children])
  const width = size.px * 1.1
  return <svg className="lp-col-label" width={width} height={size.height} style={{ width, height: size.height, display: 'inline-block' }} viewBox={`0 0 ${width} ${size.height}`} role="img" aria-label={children} fontFamily={size.font} fontSize={size.px} fontWeight="700" fill="#222">
    <text ref={text} transform={`translate(${width / 2} ${size.height / 2}) rotate(-90)`} textAnchor="middle" dominantBaseline="central" direction="rtl">{children}</text>
  </svg>
}

// One pair grid (category i down the side, category j across the top).
export function GridBlock({ puz, i, j, marks, onCell, hl, wrong }) {
  const A = puz.cats[i], B = puz.cats[j]
  return <div className="lp-block">
    <h3>{A.label} × {B.label}</h3>
    <table className="lp-table">
      <thead><tr><th aria-hidden="true" />{B.items.map((b, bi) => <th key={bi} className="lp-col" scope="col"><ColumnLabel>{shortOf(b)}</ColumnLabel></th>)}</tr></thead>
      <tbody>{A.items.map((a, ai) => <tr key={ai}>
        <th scope="row">{shortOf(a)}</th>
        {B.items.map((b, bi) => {
          const idx = cellIndex(puz, [i, ai], [j, bi]), v = marks ? marks[idx] : 0
          const cls = `lp-cell${hl?.has(idx) ? ' is-hl' : ''}${wrong?.has(idx) ? ' is-wrong' : ''}`
          return <td key={bi}>{onCell
            ? <button type="button" className={cls} data-v={v} onClick={() => onCell(idx)} aria-label={`${a.label} ו${b.label}: ${v === 1 ? 'כן' : v === -1 ? 'לא' : 'ריק'}`}>{SYMBOL[v]}</button>
            : <span className={cls} data-v={v}>{SYMBOL[v]}</span>}</td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

export function Grids({ puz, marks, onCell, hl, wrong }) {
  return <div className="lp-grids">{pairs(puz).map(([i, j]) => <GridBlock key={`${i}${j}`} puz={puz} i={i} j={j} marks={marks} onCell={onCell} hl={hl} wrong={wrong} />)}</div>
}

// Final answer: one row per name.
export function AnswerTable({ puz, filled = true }) {
  return <table className="lp-answer">
    <thead><tr>{puz.cats.map(c => <th key={c.label} scope="col">{c.label}</th>)}</tr></thead>
    <tbody>{puz.cats[0].items.map((name, e) => <tr key={e}>
      <th scope="row">{name.label}</th>
      {puz.cats.slice(1).map((c, k) => <td key={k}>{filled ? c.items[puz.sol[k + 1][e]].label : ''}</td>)}
    </tr>)}</tbody>
  </table>
}


// The reasoning to the full solution (minor "one ✓ per row" crossings are left out).
export function SolutionSteps({ puz }) {
  const steps = useMemo(() => solveSteps(puz).steps.filter(s => !s.reason.minor), [puz])
  return <ol className="lp-steps list-decimal ps-6">{steps.map((s, i) => <li key={i}>{stepText(puz, s)}</li>)}</ol>
}

// A4 sheet for printing (empty grids + answer table, or the filled solution).
export function PuzzleSheet({ puz, title, solution }) {
  const marks = useMemo(() => (solution ? solutionGrid(puz) : null), [puz, solution])
  const big = puz.K === 3 && puz.n === 3
  return <article className="buga-a4">
    <h2>{solution ? `פתרון: ${title}` : title}</h2>
    <div className={`lp-sheet${big ? ' is-big' : ''}`}>
      {!solution && <p className="lp-story">{puz.theme.story}{puz.theme.note ? ` ${puz.theme.note}` : ''} <b>מי מה?</b></p>}
      {!solution && <ol className={puz.clues.length > 8 ? 'is-long' : ''}>{puz.clues.map((c, i) => <li key={i}>{c.text}</li>)}</ol>}
      <Grids puz={puz} marks={marks} />
      <div><b>{solution ? 'התשובה:' : 'טבלת תשובות:'}</b><AnswerTable puz={puz} filled={!!solution} /></div>
      {!solution && <p className="lp-story">שם: ______________ · {levelLine(puz)}</p>}
    </div>
    <footer>עוגה בוגה · תשבצי היגיון · ugabuga.co.il</footer>
  </article>
}

// ---- The interactive board ---------------------------------------------------------------------
function withCrosses(puz, m, idx) {
  const [[i, a], [j, b]] = cellRefs(puz, idx)
  for (let k = 0; k < puz.n; k++) {
    if (k !== b) { const c = cellIndex(puz, [i, a], [j, k]); if (m[c] === 0) m[c] = -1 }
    if (k !== a) { const c = cellIndex(puz, [i, k], [j, b]); if (m[c] === 0) m[c] = -1 }
  }
}

export default function LogicBoard({ puz, onNew, title }) {
  const sol = useMemo(() => solutionGrid(puz), [puz])
  const [marks, setMarks] = useState(() => emptyState(puz))
  const [history, setHistory] = useState([])
  const [ticks, setTicks] = useState(() => new Set())
  const [msg, setMsg] = useState(null) // {kind, text, step?}
  const [hl, setHl] = useState(() => new Set())
  const [wrong, setWrong] = useState(() => new Set())
  const [revealed, setRevealed] = useState(false)
  const [confirmReveal, setConfirmReveal] = useState(false)

  const solved = useMemo(() => {
    for (let i = 0; i < marks.length; i++) if (marks[i] !== 0 && marks[i] !== sol[i]) return false
    for (let j = 1; j < puz.K; j++) for (let e = 0; e < puz.n; e++) { const idx = cellIndex(puz, [0, e], [j, puz.sol[j][e]]); if (marks[idx] !== 1) return false }
    return true
  }, [marks, sol, puz])

  const commit = m => { setHistory(h => [...h.slice(-199), marks]); setMarks(m); setHl(new Set()); setWrong(new Set()); setMsg(null) }
  const onCell = idx => {
    if (revealed) return
    const m = marks.slice(), next = m[idx] === 0 ? -1 : m[idx] === -1 ? 1 : 0
    m[idx] = next
    if (next === 1) withCrosses(puz, m, idx)
    commit(m)
  }
  const undo = () => { if (!history.length) return; setMarks(history.at(-1)); setHistory(h => h.slice(0, -1)); setHl(new Set()); setWrong(new Set()); setMsg(null) }
  const restart = () => { commit(emptyState(puz)); setTicks(new Set()); setRevealed(false) }
  const wrongCells = () => { const out = []; marks.forEach((v, i) => { if (v !== 0 && v !== sol[i]) out.push(i) }); return out }
  const check = () => {
    const w = wrongCells()
    setHl(new Set())
    if (w.length) { setWrong(new Set(w)); setMsg({ kind: 'bad', text: w.length === 1 ? 'יש סימון אחד שגוי — הוא מסומן באדום. מחקו אותו (או לחצו "ביטול") ונסו שוב.' : `יש ${w.length} סימונים שגויים — הם מסומנים באדום.` }) }
    else setMsg({ kind: 'ok', text: marks.some(v => v !== 0) ? 'כל הסימונים נכונים! המשיכו כך.' : 'עוד לא סימנתם כלום. התחילו מרמז שאומר משהו במפורש.' })
  }
  const hint = () => {
    const w = wrongCells()
    if (w.length) { setWrong(new Set([w[0]])); setHl(new Set()); setMsg({ kind: 'bad', text: 'לפני רמז: יש סימון שגוי בתא המסומן באדום. כדאי למחוק אותו ולחשוב עליו שוב.' }); return }
    const step = nextStep(puz, marks, { trial: true })
    if (!step || step.contra) { setMsg({ kind: 'hint', text: 'כל מה שאפשר להסיק כבר מסומן — סמנו ✓ בתאים שנשארו.' }); return }
    setWrong(new Set())
    setHl(new Set(step.cells.map(([x, y]) => cellIndex(puz, x, y))))
    setMsg({ kind: 'hint', text: stepText(puz, step), step })
  }
  const applyHint = () => {
    const m = marks.slice()
    for (const [x, y, v] of msg.step.cells) { const idx = cellIndex(puz, x, y); m[idx] = v; if (v === 1) withCrosses(puz, m, idx) }
    commit(m)
  }
  const reveal = () => {
    if (!confirmReveal) { setConfirmReveal(true); return }
    setConfirmReveal(false); commit(sol.slice()); setRevealed(true)
  }
  const tick = i => setTicks(t => { const n = new Set(t); if (n.has(i)) n.delete(i); else n.add(i); return n })

  return <section className="rounded-3xl border-2 border-violet-100 bg-violet-50/40 p-3 sm:p-5" aria-label={title || 'תשבץ היגיון'}>
    <div className="text-center">
      <p className="text-sm font-bold text-violet-700">{puz.theme.emoji} {puz.theme.title} · {levelLine(puz)}</p>
      {title && <h2 className="mt-1 text-2xl font-black">{title}</h2>}
      <p className="mx-auto mt-2 max-w-2xl leading-relaxed">{puz.theme.story} מי מה? היעזרו ברמזים ובטבלאות.</p>
      {puz.theme.note && <p className="mx-auto mt-1 max-w-2xl text-sm text-slate-600">{puz.theme.note}</p>}
    </div>
    <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div>
        <h3 className="text-lg font-black">הרמזים <small className="font-normal text-slate-500">(לחיצה על רמז מסמנת שהשתמשתם בו)</small></h3>
        <ol className="lp-clues mt-2 space-y-1">{puz.clues.map((c, i) => <li key={i}>
          <span className="lp-num" aria-hidden="true">{i + 1}</span>
          <button type="button" className="lp-clue-btn bg-white" aria-pressed={ticks.has(i)} onClick={() => tick(i)}><span className="sr-only">רמז {i + 1}: </span>{c.text}</button>
        </li>)}</ol>
        <p className="mt-3 text-sm text-slate-600">לחיצה על תא: ✗ → ✓ → ריק. כשמסמנים ✓, שאר השורה והעמודה מקבלות ✗ אוטומטית.</p>
      </div>
      <div>
        <div className="lp-tools">
          <button type="button" className="lp-main" onClick={hint} disabled={revealed || solved}>💡 רמז</button>
          <button type="button" onClick={check} disabled={revealed}>✔️ בדיקה</button>
          <button type="button" onClick={undo} disabled={!history.length}>↶ ביטול</button>
          <button type="button" onClick={restart}>🧹 מההתחלה</button>
          <button type="button" onClick={reveal} disabled={revealed}>{confirmReveal ? 'בטוחים? לחצו שוב' : '👁️ פתרון'}</button>
          {onNew && <button type="button" onClick={onNew}>✨ תשבץ חדש</button>}
        </div>
        <div aria-live="polite" className="mt-3">
          {solved && !revealed && <p className="lp-msg ok text-center text-lg font-black">🎉 כל הכבוד — פתרתם את תשבץ ההיגיון!</p>}
          {msg && <div className={`lp-msg ${msg.kind}`}><p>{msg.text}</p>
            {msg.step && <button type="button" onClick={applyHint} className="mt-2 rounded-xl bg-amber-400 px-4 py-2 font-bold">סמנו את זה בשבילי</button>}</div>}
        </div>
        <div className="mt-3"><Grids puz={puz} marks={marks} onCell={onCell} hl={hl} wrong={wrong} /></div>
      </div>
    </div>
    {(revealed || solved) && <div className="mt-6 rounded-2xl bg-white p-4">
      <h3 className="text-xl font-black">הפתרון</h3>
      <div className="mt-2 overflow-x-auto"><AnswerTable puz={puz} /></div>
      <details className="mt-4" open={revealed}>
        <summary className="cursor-pointer font-bold">איך מגיעים לפתרון — שלב אחר שלב</summary>
        <div className="mt-3"><SolutionSteps puz={puz} /></div>
      </details>
    </div>}
  </section>
}
