import { useRef, useState } from 'react'
import { W, H } from '../generators/maze'

// Renderer: turns ActivityData into one SVG (180×190 mm drawing area). The same SVG is used on
// screen (optionally interactive: draw with a finger/mouse, fill in the pattern) and in print.

const INK = '#1d2233', FAINT = '#9aa1b3', PEN = '#1f8fd6'

export function Icon({ id, x, y, size = 10 }) {
  const s = size / 2
  const common = { fill: 'none', stroke: INK, strokeWidth: size * 0.08, strokeLinejoin: 'round' }
  switch (id) {
    case 'circle': return <circle cx={x} cy={y} r={s * 0.85} {...common} />
    case 'square': return <rect x={x - s * 0.8} y={y - s * 0.8} width={s * 1.6} height={s * 1.6} {...common} />
    case 'triangle': return <path d={`M${x} ${y - s * 0.9}L${x + s * 0.9} ${y + s * 0.75}L${x - s * 0.9} ${y + s * 0.75}Z`} {...common} />
    case 'diamond': return <path d={`M${x} ${y - s * 0.95}L${x + s * 0.7} ${y}L${x} ${y + s * 0.95}L${x - s * 0.7} ${y}Z`} {...common} />
    case 'star': {
      let d = ''
      for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.4 : s * 0.95, a = -Math.PI / 2 + i * Math.PI / 5; d += (i ? 'L' : 'M') + (x + r * Math.cos(a)).toFixed(2) + ' ' + (y + r * Math.sin(a)).toFixed(2) }
      return <path d={d + 'Z'} {...common} />
    }
    case 'heart': return <path d={`M${x} ${y + s * 0.8}C${x - s * 1.3} ${y - s * 0.2} ${x - s * 0.6} ${y - s * 1.1} ${x} ${y - s * 0.4}C${x + s * 0.6} ${y - s * 1.1} ${x + s * 1.3} ${y - s * 0.2} ${x} ${y + s * 0.8}Z`} {...common} />
    default: return <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{id}</text>
  }
}

function Maze({ a, showSolution }) {
  const { cols, rows, cell, ox, oy, walls, start, goal, solution, stroke } = a
  const lines = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + c * cell, y = oy + r * cell, w = walls[r][c]
    if (w.n) lines.push(`M${x} ${y}h${cell}`)
    if (w.w) lines.push(`M${x} ${y}v${cell}`)
    if (r === rows - 1 && w.s) lines.push(`M${x} ${y + cell}h${cell}`)
    if (c === cols - 1 && w.e) lines.push(`M${x + cell} ${y}v${cell}`)
  }
  const cx = c => ox + (c + 0.5) * cell, cy = r => oy + (r + 0.5) * cell
  const iconSize = Math.min(12, Math.max(8, cell * 0.9))
  // A point just outside the opening of a door cell (for the icon and the solution line's ends).
  const outside = (p, gap) => p.open === 'n' ? [cx(p.c), oy - gap] : p.open === 's' ? [cx(p.c), oy + rows * cell + gap] : p.open === 'e' ? [ox + cols * cell + gap, cy(p.r)] : [ox - gap, cy(p.r)]
  const [sx, sy] = outside(start, iconSize / 2 + 2), [gx, gy] = outside(goal, iconSize / 2 + 2)
  return <g>
    <path d={lines.join('')} stroke={INK} strokeWidth={stroke} strokeLinecap="round" fill="none" />
    {showSolution && <polyline points={[outside(start, 2), ...solution.map(p => [cx(p.c), cy(p.r)]), outside(goal, 2)].map(p => p.join(',')).join(' ')} fill="none" stroke="#e5484d" strokeWidth={Math.max(0.8, cell * 0.18)} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 1.4" />}
    <Icon id={a.startIcon} x={sx} y={sy} size={iconSize} />
    <Icon id={a.goalIcon} x={gx} y={gy} size={iconSize} />
  </g>
}

function Tracing({ a }) {
  return <g>{a.items.map((it, i) => {
    const m = it.d.match(/^M([\d.-]+) ([\d.-]+)/)
    const sx = +m[1], sy = +m[2]
    return <g key={i}>
      <path d={it.d} fill="none" stroke={FAINT} strokeWidth={a.stroke} strokeDasharray={`${a.dash} ${a.dash * 0.9}`} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={sx} cy={sy} r={a.stroke * 0.9} fill="#2e9c3a" />
      <Icon id={it.start} x={it.startX} y={it.y} size={Math.min(12, a.rowH * 0.42)} />
      <Icon id={it.goal} x={it.endX} y={it.y} size={Math.min(12, a.rowH * 0.42)} />
    </g>
  })}</g>
}

function Pattern({ a, answers, onPick, interactive }) {
  const rowsN = a.rows.length, size = Math.min((W - 4) / a.len, (H - 4) / rowsN) * 0.86
  const gapX = (W - size * a.len) / (a.len + 1), gapY = (H - size * rowsN) / (rowsN + 1)
  return <g>{a.rows.map((row, r) => row.cells.map((cell, k) => {
    const x = W - gapX - k * (size + gapX) - size, y = gapY + r * (size + gapY) // RTL: first cell on the right
    const key = `${r}-${k}`, picked = answers?.[key]
    const good = picked != null && picked === cell.item
    return <g key={key} onClick={interactive && cell.blank ? () => onPick?.(r, k, row) : undefined} style={interactive && cell.blank ? { cursor: 'pointer' } : undefined}>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.14} fill={picked != null ? (good ? '#e3f6e1' : '#ffe3e3') : '#fff'} stroke={cell.blank ? INK : '#d5d9e3'} strokeWidth={cell.blank ? 0.6 : 0.4} strokeDasharray={cell.blank ? '2 1.4' : undefined} />
      {(!cell.blank || picked != null) && <Icon id={cell.blank ? picked : cell.item} x={x + size / 2} y={y + size / 2} size={size * 0.62} />}
      {cell.blank && picked == null && interactive && <text x={x + size / 2} y={y + size / 2} fontSize={size * 0.4} textAnchor="middle" dominantBaseline="central" fill={FAINT}>?</text>}
    </g>
  }))}</g>
}

// Free drawing on top of the sheet (finger or mouse), in drawing-area coordinates.
function useDraw(svgRef, enabled) {
  const [strokes, setStrokes] = useState([])
  const drawing = useRef(false)
  const toPoint = e => {
    const svg = svgRef.current, pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    return [+p.x.toFixed(1), +p.y.toFixed(1)]
  }
  const handlers = enabled ? {
    onPointerDown: e => { e.currentTarget.setPointerCapture?.(e.pointerId); drawing.current = true; setStrokes(s => [...s, [toPoint(e)]]) },
    onPointerMove: e => { if (drawing.current) { const p = toPoint(e); setStrokes(s => { const c = s.slice(); c[c.length - 1] = [...c[c.length - 1], p]; return c }) } },
    onPointerUp: () => { drawing.current = false },
    onPointerCancel: () => { drawing.current = false },
  } : {}
  return { strokes, clear: () => setStrokes([]), undo: () => setStrokes(s => s.slice(0, -1)), handlers }
}

export default function ActivitySvg({ activity, interactive = false, showSolution = false, answers, onPick, draw }) {
  const svgRef = useRef(null)
  const canDraw = interactive && activity.kind !== 'pattern'
  const pen = useDraw(svgRef, canDraw)
  if (draw) draw.current = pen
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={activity.title} className="motor-svg"
      style={canDraw ? { touchAction: 'none', cursor: 'crosshair' } : undefined} {...pen.handlers}>
      <rect width={W} height={H} fill="#fff" />
      {activity.kind === 'maze' && <Maze a={activity} showSolution={showSolution} />}
      {activity.kind === 'tracing' && <Tracing a={activity} />}
      {activity.kind === 'pattern' && <Pattern a={activity} answers={answers} onPick={onPick} interactive={interactive} />}
      {canDraw && pen.strokes.map((s, i) => <polyline key={i} points={s.map(p => p.join(',')).join(' ')} fill="none" stroke={PEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />)}
    </svg>
  )
}
