import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { cbnLevel, cbnSize, cbnLegend, cbnGrid, cbnAnswers, cbnMathGrid, cbnPath } from '../../data/colorByNumber'
import { thumbnailPaths } from '../../data/cbnThumbnail'
import './color-by-number.css'

// Shared pieces of the color-by-number family: /printables/color-by-number (numbers + the picture's
// own math version), /printables/color-by-answer (any exercise kind) and /printables/color-by-letter.

const CELL = 10
export const cellKey = (r, c) => `${r}-${c}`

// mode: 'numbers' | 'math' | 'code' | 'solution'. 'code' writes `cells` (2D strings) in the cells.
// fills: { 'r-c': legendNumber } for online coloring.
export function CbnSvg({ p, mode, cells, fills, onPaint, label, className = '' }) {
  const grid = useMemo(() => cbnGrid(p), [p])
  const legend = useMemo(() => cbnLegend(p), [p])
  const math = useMemo(() => (mode === 'math' ? cbnMathGrid(p).map(row => row.map(ex => ex?.text)) : null), [p, mode])
  const texts = mode === 'code' ? cells : math
  const { cols, rows } = cbnSize(p)
  const svgRef = useRef(null), drag = useRef(false)
  const cellAt = e => {
    const svg = svgRef.current, ctm = svg?.getScreenCTM()
    if (!ctm) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const c = Math.floor(pt.x / CELL), r = Math.floor(pt.y / CELL)
    return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] > 0 ? [r, c] : null
  }
  const paint = e => { const rc = cellAt(e); if (rc) onPaint(rc[0], rc[1]) }
  const handlers = onPaint ? {
    onPointerDown: e => { drag.current = e.pointerType === 'mouse'; paint(e) },
    onPointerMove: e => { if (drag.current && e.buttons) paint(e) },
    onPointerUp: () => { drag.current = false },
    onPointerLeave: () => { drag.current = false },
  } : {}
  return <svg ref={svgRef} viewBox={`-0.5 -0.5 ${cols * CELL + 1} ${rows * CELL + 1}`} className={`cbn-svg ${onPaint ? 'is-paintable' : ''} ${className}`} role="img" aria-label={label} dir="ltr" {...handlers}>
    {grid.map((row, r) => row.map((n, c) => {
      if (!n) return null
      const filled = mode === 'solution' ? n : fills?.[cellKey(r, c)]
      const fill = filled ? legend[filled - 1].hex : '#fff'
      const text = mode === 'numbers' ? String(n) : texts ? texts[r][c] || '' : ''
      // one or two characters (numbers, letters) are big; exercises shrink with their length
      const fs = text.length <= 2 ? 5 : text.length <= 4 ? 3.3 : text.length === 5 ? 2.85 : 2.4
      return <g key={cellKey(r, c)}>
        <rect x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill={fill} stroke={mode === 'solution' ? '#00000018' : '#8a8f9c'} strokeWidth={mode === 'solution' ? 0.3 : 0.45} />
        {text && !filled && <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2} fontSize={fs} textAnchor="middle" dominantBaseline="central" fill="#3b3f4a" direction="ltr">{text}</text>}
      </g>
    }))}
  </svg>
}

// tags: { [num]: label } shown next to each swatch (answers, letters). Without tags: the color
// numbers, or — in 'math' mode — the picture's own answers. tagName names the tag for screen readers.
export function Legend({ p, mode, tags, tagName, active, onPick, compact }) {
  const legend = cbnLegend(p)
  const labels = tags || (mode === 'math' ? cbnAnswers(p) : null)
  const name = tagName || (mode === 'math' ? 'תשובה' : 'מספר')
  // numeric labels read in order (6, 8, 10…), letters in alphabet order, plain numbers in color order
  const numeric = labels && Object.values(labels).every(v => typeof v === 'number' || /^\d+$/.test(v))
  const items = !labels ? legend : [...legend].sort((a, b) => numeric ? labels[a.num] - labels[b.num] : String(labels[a.num]).localeCompare(String(labels[b.num]), 'he'))
  return <ul className={`cbn-legend ${compact ? 'is-compact' : ''}`}>{items.map(l => {
    const tag = labels ? labels[l.num] : l.num
    const inner = <><i className="cbn-swatch" style={{ background: l.hex }} /><b dir="auto">{tag}</b><span>{l.name}</span></>
    return <li key={l.ch}>{onPick
      ? <button type="button" aria-pressed={active === l.num} onClick={() => onPick(l.num)} aria-label={`${name} ${tag}: ${l.name}`}>{inner}</button>
      : <span className="cbn-legend-item">{inner}</span>}</li>
  })}</ul>
}

// One printable A4 sheet. For 'code' sheets pass title, how, cells and tags.
export function Sheet({ p, mode, title, how, cells, tags, footer = 'צביעה לפי מספרים' }) {
  const level = cbnLevel(p.level)
  const t = title || (mode === 'solution' ? `פתרון: ${p.name}` : mode === 'math' ? `צביעה לפי תרגילים — ${level.mathLabel}` : 'צביעה לפי מספרים')
  const h = how || (mode === 'math' ? 'פותרים את התרגיל בכל משבצת, מוצאים את התשובה במקרא וצובעים בצבע שלה.' : 'צובעים כל משבצת בצבע של המספר שלה לפי המקרא — ומגלים מה מסתתר בציור.')
  return <article className="buga-a4 cbn-sheet">
    <h2>{t}</h2>
    {mode !== 'solution' && <>
      <p className="art-caption cbn-caption"><span>{h}</span><span className="cbn-name">שם: ______________</span></p>
      <Legend p={p} mode={mode} tags={tags} compact />
    </>}
    <div className="print-art"><CbnSvg p={p} mode={mode} cells={cells} label={`${t}: ${p.name}`} /></div>
    <footer>עוגה בוגה · {footer} · ugabuga.co.il</footer>
  </article>
}

export const sheetsFor = (list, kinds, withSolution) => list.flatMap(p => [...kinds.map(k => <Sheet key={`${p.slug}-${k}`} p={p} mode={k} />), ...(withSolution ? [<Sheet key={`${p.slug}-sol`} p={p} mode="solution" />] : [])])

export function PictureCard({ p, to, sub }) {
  const level = cbnLevel(p.level), { cols, rows } = cbnSize(p)
  const paths = useMemo(() => thumbnailPaths(cbnGrid(p)), [p])
  const legend = cbnLegend(p)
  return <Link to={to || cbnPath(p)} className="wobbly group flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-3 sketch-shadow transition-all duration-150 hover:-translate-y-1">
    <div className="cbn-thumb"><svg viewBox={`-0.5 -0.5 ${cols * CELL + 1} ${rows * CELL + 1}`} className="cbn-svg" role="img" aria-label={`צביעה לפי מספרים: ${p.name}`} dir="ltr">
      {paths.map(({ color, d }) => <path key={color} d={d} fill={legend[color - 1].hex} />)}
    </svg></div>
    <b className="mt-2 text-lg">{p.emoji} {p.name}</b>
    <small className="text-[var(--muted-foreground)]">{sub || <><span className={`rounded-full px-2 ${level.badge}`}>{level.label}</span> · {cols}×{rows} · {p.colors.length} צבעים</>}</small>
  </Link>
}
