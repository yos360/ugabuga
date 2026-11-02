// /excel: the live spreadsheet — RTL grid like Hebrew Excel, formula bar, click-to-insert
// refs while typing a formula, fill handle, bold/₪, sort, bar/pie chart, undo.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { evaluate, display, isErr, refName, colName, rangeName, parseRange, fill, region, sortRows, chartFrom, chartData, setFmt, hebrewInFormula } from './excelEngine'

const norm = (a, f) => ({ c0: Math.min(a.c, f.c), c1: Math.max(a.c, f.c), r0: Math.min(a.r, f.r), r1: Math.max(a.r, f.r) })
const inG = (g, c, r) => c >= g.c0 && c <= g.c1 && r >= g.r0 && r <= g.r1
const INSERT_AFTER = /[=+\-*/^&(,;:<>]$/
const cellAt = (x, y) => {
  const td = document.elementFromPoint(x, y)?.closest?.('td[data-c]')
  return td ? { c: Number(td.dataset.c), r: Number(td.dataset.r) } : null
}

export default function Sheet({ sheet, initial, onChange }) {
  const cols = sheet.cols, rows = sheet.rows
  const [state, setState] = useState(initial)
  const [sel, setSel] = useState({ a: { c: 0, r: 0 }, f: { c: 0, r: 0 } })
  const [edit, setEdit] = useState(null) // { c, r, draft, where: 'cell' | 'bar' }
  const [fillTo, setFillTo] = useState(null)
  const undo = useRef([])
  const wrapRef = useRef(null), cellInput = useRef(null), barInput = useRef(null)
  const drag = useRef(null) // 'select' | 'fill' | { insertAt, start }

  const values = useMemo(() => evaluate(state.cells), [state.cells])
  useEffect(() => { onChange?.(state) }, [state, onChange])

  const g = norm(sel.a, sel.f)
  const active = sel.a
  const activeRef = refName(active.c, active.r)

  const commitState = useCallback(next => { undo.current.push(state); if (undo.current.length > 50) undo.current.shift(); setState(next) }, [state])
  const move = (c, r, extend) => {
    const p = { c: Math.max(0, Math.min(cols - 1, c)), r: Math.max(0, Math.min(rows - 1, r)) }
    setSel(s => extend ? { a: s.a, f: p } : { a: p, f: p })
  }
  const focusGrid = () => setTimeout(() => wrapRef.current?.focus({ preventScroll: true }), 0)

  const commitEdit = (dc = 0, dr = 0) => {
    if (!edit) return
    const ref = refName(edit.c, edit.r)
    const raw = edit.draft
    if ((state.cells[ref] ?? '') !== raw) {
      const cells = { ...state.cells }
      if (raw === '') delete cells[ref]; else cells[ref] = raw
      commitState({ ...state, cells })
    }
    setEdit(null)
    move(edit.c + dc, edit.r + dr)
    focusGrid()
  }
  const startEdit = (draft, where = 'cell') => {
    setEdit({ c: active.c, r: active.r, draft, where })
    setTimeout(() => { const el = where === 'bar' ? barInput.current : cellInput.current; if (el) { el.focus(); el.setSelectionRange?.(el.value.length, el.value.length) } }, 0)
  }

  const clearSel = () => {
    const cells = { ...state.cells }
    for (let r = g.r0; r <= g.r1; r++) for (let c = g.c0; c <= g.c1; c++) delete cells[refName(c, r)]
    commitState({ ...state, cells })
  }
  const toggleFmt = key => {
    const on = !(state.fmt[activeRef]?.[key])
    commitState(setFmt(state, g, key, on))
  }
  const fillDown = () => { if (g.r1 > g.r0) commitState(fill(state, { ...g, r1: g.r0 }, g)) }
  const sortBy = dir => {
    const single = g.c0 === g.c1 && g.r0 === g.r1
    const box = single ? region(state.cells, active.c, active.r) : g
    commitState(sortRows(state, box, active.c, dir))
  }
  const makeChart = kind => {
    const single = g.c0 === g.c1 && g.r0 === g.r1
    const ch = chartFrom(state, single ? region(state.cells, active.c, active.r) : g, kind)
    if (ch) commitState({ ...state, chart: ch })
  }
  const doUndo = () => { const prev = undo.current.pop(); if (prev) setState(prev) }

  const onGridKey = e => {
    if (edit) { if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') onEditKey(e); return }
    const k = e.key, mod = e.ctrlKey || e.metaKey
    if (mod && (k === 'b' || k === 'B' || k === 'נ')) { e.preventDefault(); toggleFmt('b'); return }
    if (mod && (k === 'z' || k === 'Z' || k === 'ז')) { e.preventDefault(); doUndo(); return }
    if (mod && (k === 'd' || k === 'D' || k === 'ג')) { e.preventDefault(); fillDown(); return }
    if (mod) return
    // RTL sheet: ArrowLeft goes to the next column. Shift extends from the moving corner.
    const ARROWS = { ArrowDown: [0, 1], ArrowUp: [0, -1], ArrowLeft: [1, 0], ArrowRight: [-1, 0] }
    const from = e.shiftKey ? sel.f : active
    if (ARROWS[k]) { e.preventDefault(); move(from.c + ARROWS[k][0], from.r + ARROWS[k][1], e.shiftKey) }
    else if (k === 'Enter') { e.preventDefault(); move(active.c, active.r + (e.shiftKey ? -1 : 1)) }
    else if (k === 'Tab') { e.preventDefault(); move(active.c + (e.shiftKey ? -1 : 1), active.r) }
    else if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); clearSel() }
    else if (k === 'F2') { e.preventDefault(); startEdit(state.cells[activeRef] ?? '') }
  }
  const onEditKey = e => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(0, e.shiftKey ? -1 : 1) }
    else if (e.key === 'Tab') { e.preventDefault(); commitEdit(e.shiftKey ? -1 : 1, 0) }
    else if (e.key === 'Escape') { e.preventDefault(); setEdit(null); focusGrid() }
    else if (e.key === 'F4') { e.preventDefault(); setEdit(ed => ({ ...ed, draft: ed.draft.replace(/(\$?)([A-Z])(\$?)(\d+)$/i, (m, d1, c, d2, r) => d1 && d2 ? `${c}${r}` : `$${c}$${r}`) })) }
  }

  // Pointer: select / drag-select, fill handle, or insert a ref into the formula being typed.
  const onCellDown = (e, c, r) => {
    if (e.button && e.button !== 0) return
    if (edit && edit.draft.startsWith('=') && INSERT_AFTER.test(edit.draft)) {
      e.preventDefault()
      drag.current = { insertAt: edit.draft.length, start: { c, r } }
      setEdit(ed => ({ ...ed, draft: ed.draft + refName(c, r) }))
      return
    }
    if (edit) commitEdit()
    e.preventDefault()
    if (e.shiftKey) setSel(s => ({ a: s.a, f: { c, r } }))
    else setSel({ a: { c, r }, f: { c, r } })
    drag.current = 'select'
    wrapRef.current?.focus({ preventScroll: true })
  }
  const onCellDouble = (c, r) => { setSel({ a: { c, r }, f: { c, r } }); setEdit({ c, r, draft: state.cells[refName(c, r)] ?? '', where: 'cell' }); setTimeout(() => cellInput.current?.focus(), 0) }
  const onFillDown = e => { e.preventDefault(); e.stopPropagation(); drag.current = 'fill'; setFillTo(g) }
  const onMove = e => {
    const d = drag.current
    if (!d) return
    const p = cellAt(e.clientX, e.clientY)
    if (!p) return
    if (d === 'select') setSel(s => (s.f.c === p.c && s.f.r === p.r) ? s : { a: s.a, f: p })
    else if (d === 'fill') {
      const down = p.r - g.r1, side = p.c - g.c1
      setFillTo(down >= side ? { ...g, r1: Math.max(g.r1, p.r) } : { ...g, c1: Math.max(g.c1, p.c) })
    } else if (d.insertAt != null) {
      const txt = rangeName(norm(d.start, p))
      setEdit(ed => ed && ({ ...ed, draft: ed.draft.slice(0, d.insertAt) + txt }))
    }
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (d === 'fill' && fillTo) {
      if (fillTo.r1 > g.r1 || fillTo.c1 > g.c1) { commitState(fill(state, g, fillTo)); setSel({ a: { c: fillTo.c0, r: fillTo.r0 }, f: { c: fillTo.c1, r: fillTo.r1 } }) }
      setFillTo(null)
    } else if (d && d.insertAt != null) setTimeout(() => (edit?.where === 'bar' ? barInput : cellInput).current?.focus(), 0)
  }
  useEffect(() => {
    window.addEventListener('pointerup', onUp)
    return () => window.removeEventListener('pointerup', onUp)
  })

  const draftShown = edit ? edit.draft : (state.cells[activeRef] ?? '')
  const heb = edit && edit.draft.startsWith('=') && hebrewInFormula(edit.draft)
  const activeVal = values[activeRef]
  const widths = sheet.widths || {}
  const bold = !!state.fmt[activeRef]?.b, cur = !!state.fmt[activeRef]?.cur

  return (
    <div className="xl-sheet" dir="rtl">
      <div className="xl-tools" role="toolbar" aria-label="כלים">
        <button type="button" className="xl-tool" aria-pressed={bold} onClick={() => { toggleFmt('b'); focusGrid() }} title="הדגשה (Ctrl+B)"><b>B</b></button>
        <button type="button" className="xl-tool" aria-pressed={cur} onClick={() => { toggleFmt('cur'); focusGrid() }} title="עיצוב ש״ח">₪</button>
        <span className="xl-sep" />
        <button type="button" className="xl-tool" onClick={() => { fillDown(); focusGrid() }} title="מילוי למטה (Ctrl+D)">מילוי ⬇</button>
        <span className="xl-sep" />
        <button type="button" className="xl-tool" onClick={() => { sortBy('asc'); focusGrid() }} title="מיון מהקטן לגדול">מהקטן לגדול / א→ת</button>
        <button type="button" className="xl-tool" onClick={() => { sortBy('desc'); focusGrid() }} title="מיון מהגדול לקטן">מהגדול לקטן</button>
        <span className="xl-sep" />
        <button type="button" className="xl-tool" onClick={() => { makeChart('bar'); focusGrid() }}>📊 עמודות</button>
        <button type="button" className="xl-tool" onClick={() => { makeChart('pie'); focusGrid() }}>🥧 עוגה</button>
        <span className="xl-sep" />
        <button type="button" className="xl-tool" onClick={() => { doUndo(); focusGrid() }} title="ביטול (Ctrl+Z)">↶ ביטול</button>
      </div>
      <div className="xl-bar">
        <NameBox value={rangeName(g)} onGo={box => { setSel({ a: { c: box.c0, r: box.r0 }, f: { c: Math.min(cols - 1, box.c1), r: Math.min(rows - 1, box.r1) } }); focusGrid() }} />
        <span className="xl-fx" aria-hidden="true">fx</span>
        <input ref={barInput} className="xl-barin" dir="auto" value={draftShown} aria-label="שורת הנוסחאות"
          onFocus={() => { if (!edit) setEdit({ c: active.c, r: active.r, draft: state.cells[activeRef] ?? '', where: 'bar' }) }}
          onChange={e => setEdit(ed => ({ ...(ed || { c: active.c, r: active.r, where: 'bar' }), draft: e.target.value }))}
          onKeyDown={onEditKey} />
      </div>
      {heb && <p className="xl-warn" role="alert">⌨️ המקלדת בעברית. נוסחאות כותבים באנגלית: החליפו שפה (Alt+Shift) ואז ‎=SUM ולא ‎=דוצ.</p>}
      <div className="xl-scroll">
        {/* Keyboard capture: arrows/shortcuts via keydown, typed text via input (works with IMEs and phone keyboards). */}
        <input ref={wrapRef} className="xl-cap" aria-label={`תא ${activeRef}: הקלידו כדי לכתוב בתא`} value="" autoComplete="off" autoCorrect="off" spellCheck={false}
          onKeyDown={onGridKey} onChange={e => { const v = e.target.value; if (v && !edit) startEdit(v) }} />
        <table className="xl-grid" onPointerMove={onMove} aria-label="גיליון">
          <thead><tr><th className="xl-corner" />{Array.from({ length: cols }, (_, c) => <th key={c} className={c >= g.c0 && c <= g.c1 ? 'on' : ''} style={{ width: widths[colName(c)] || 84 }}>{colName(c)}</th>)}</tr></thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                <th className={r >= g.r0 && r <= g.r1 ? 'on' : ''}>{r + 1}</th>
                {Array.from({ length: cols }, (_, c) => {
                  const ref = refName(c, r), v = values[ref], f = state.fmt[ref]
                  const isActive = c === active.c && r === active.r
                  const editing = edit && edit.where === 'cell' && edit.c === c && edit.r === r
                  const cls = ['xl-cell', inG(g, c, r) ? 'sel' : '', isActive ? 'act' : '', fillTo && inG(fillTo, c, r) && !inG(g, c, r) ? 'fill' : '',
                    typeof v === 'number' ? 'num' : '', isErr(v) ? 'err' : '', f?.b ? 'b' : ''].filter(Boolean).join(' ')
                  return (
                    <td key={c} data-c={c} data-r={r} className={cls} onPointerDown={e => onCellDown(e, c, r)} onDoubleClick={() => onCellDouble(c, r)}>
                      {editing
                        ? <input ref={cellInput} autoFocus className="xl-in" dir="auto" value={edit.draft} onChange={e => setEdit(ed => ({ ...ed, draft: e.target.value }))} onKeyDown={onEditKey} aria-label={`עריכת ${ref}`} />
                        : <span>{display(v, f)}</span>}
                      {c === g.c1 && r === g.r1 && !edit && <span className="xl-handle" onPointerDown={onFillDown} aria-hidden="true" />}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!edit && isErr(activeVal) && <p className="xl-warn" role="status">{ERR_HELP[activeVal.code] || 'יש שגיאה בנוסחה.'}</p>}
      {state.chart && <Chart state={state} />}
    </div>
  )
}

// The name box: shows the selection, and typing a range there (A1:C1 + Enter) selects it —
// the easy way to select a range on a phone.
function NameBox({ value, onGo }) {
  const [txt, setTxt] = useState(null)
  return <input className="xl-name" dir="ltr" value={txt ?? value} aria-label="תיבת השם: הקלידו טווח, למשל A1:C1"
    onFocus={e => { setTxt(value); e.target.select() }} onBlur={() => setTxt(null)} onChange={e => setTxt(e.target.value.toUpperCase())}
    onKeyDown={e => { if (e.key === 'Enter') { const box = parseRange(txt || ''); if (box) onGo(box); setTxt(null); e.target.blur() } else if (e.key === 'Escape') e.target.blur() }} />
}

const ERR_HELP = {
  '#NAME?': '#NAME? = אקסל לא מכיר את השם. בדקו את האיות (SUM, AVERAGE…) ושהמקלדת באנגלית. טקסט צריך מירכאות.',
  '#DIV/0!': '#DIV/0! = חילוק באפס או ממוצע של תאים ריקים.',
  '#VALUE!': '#VALUE! = חישוב עם טקסט במקום מספר.',
  '#CIRC!': 'הנוסחה מפנה לעצמה (הפניה מעגלית).',
  '#ERROR!': 'משהו חסר בנוסחה: סוגריים, פסיק או תא.',
  '#REF!': '#REF! = הפניה לתא שלא קיים.',
}

const COLORS = ['#226bd7', '#cf2f56', '#23874d', '#e08a00', '#8a4fd8', '#0aa5a5', '#7a5c2e', '#d64fa0']
function Chart({ state }) {
  const data = chartData(state, state.chart)
  const max = Math.max(1, ...data.map(d => d.value))
  if (state.chart.kind === 'pie') {
    const total = data.reduce((a, d) => a + Math.max(0, d.value), 0) || 1
    const starts = data.reduce((acc, d) => [...acc, acc[acc.length - 1] + (Math.max(0, d.value) / total) * Math.PI * 2], [-Math.PI / 2])
    return (
      <figure className="xl-chart" aria-label="גרף עוגה">
        <svg viewBox="0 0 200 200" width="200" height="200" role="img">
          {data.map((d, i) => {
            const frac = Math.max(0, d.value) / total
            const a0 = starts[i], a1 = starts[i + 1]
            const large = frac > 0.5 ? 1 : 0
            const p = (a) => `${100 + 90 * Math.cos(a)} ${100 + 90 * Math.sin(a)}`
            const path = frac >= 0.9999 ? 'M10 100a90 90 0 1 0 180 0a90 90 0 1 0-180 0' : `M100 100L${p(a0)}A90 90 0 ${large} 1 ${p(a1)}Z`
            return <path key={i} d={path} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="2" />
          })}
        </svg>
        <figcaption className="xl-legend">{data.map((d, i) => <span key={i}><i style={{ background: COLORS[i % COLORS.length] }} />{d.label} · {Math.round((Math.max(0, d.value) / total) * 100)}%</span>)}</figcaption>
      </figure>
    )
  }
  return (
    <figure className="xl-chart" aria-label="גרף עמודות">
      <div className="xl-bars">{data.map((d, i) => (
        <div key={i} className="xl-barcol">
          <small>{display(d.value)}</small>
          <div style={{ height: `${Math.max(2, (Math.max(0, d.value) / max) * 160)}px`, background: COLORS[0] }} />
          <span>{d.label}</span>
        </div>
      ))}</div>
    </figure>
  )
}
