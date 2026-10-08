// Inline-SVG drawings for the shape-matrix questions: every cell is drawn from its attributes
// (shape, count, fill, size, rotation), so matrices and answer options come straight from the rules.
import { useId } from 'react'
import { matrixCell } from './giftedData'

const INK = '#1d2233'
const R = { s: 10, m: 14, l: 19 }
const POS = {
  1: [[0, 0]],
  2: [[-23, 0], [23, 0]],
  3: [[0, -22], [-23, 21], [23, 21]],
  4: [[-23, -23], [23, -23], [-23, 23], [23, 23]],
  5: [[-26, -26], [26, -26], [0, 0], [-26, 26], [26, 26]],
}
const pts = a => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
function Shape({ shape, r, fill, rot }) {
  const p = { fill, stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' }
  switch (shape) {
    case 'circle': return <circle r={r} {...p} />
    case 'square': return <rect x={-r * 0.85} y={-r * 0.85} width={r * 1.7} height={r * 1.7} {...p} />
    case 'triangle': return <polygon points={pts([[0, -r * 1.05], [r * 1.05, r * 0.8], [-r * 1.05, r * 0.8]])} {...p} />
    case 'diamond': return <polygon points={pts([[0, -r * 1.15], [r * 0.82, 0], [0, r * 1.15], [-r * 0.82, 0]])} {...p} />
    case 'hexagon': return <polygon points={pts([0, 1, 2, 3, 4, 5].map(k => [r * Math.cos((Math.PI / 3) * k - Math.PI / 2), r * Math.sin((Math.PI / 3) * k - Math.PI / 2)]))} {...p} />
    case 'star': return <polygon points={pts([...Array(10)].map((_, k) => { const rr = k % 2 ? r * 0.47 : r * 1.12, a = (Math.PI / 5) * k - Math.PI / 2; return [rr * Math.cos(a), rr * Math.sin(a)] }))} {...p} />
    case 'heart': return <path d={`M0,${r * 0.9} C${-r * 1.4},${-r * 0.1} ${-r * 0.65},${-r * 1.15} 0,${-r * 0.42} C${r * 0.65},${-r * 1.15} ${r * 1.4},${-r * 0.1} 0,${r * 0.9}Z`} {...p} />
    case 'arrow': return <polygon transform={`rotate(${rot})`} points={pts([[0, -r * 1.15], [r * 0.85, -r * 0.1], [r * 0.32, -r * 0.1], [r * 0.32, r * 1.1], [-r * 0.32, r * 1.1], [-r * 0.32, -r * 0.1], [-r * 0.85, -r * 0.1]])} {...p} />
    default: return null
  }
}
// One 100×100 cell, drawn at (x, y). `pid` is the id of the stripe pattern in the same <svg>.
function CellArt({ c, x = 0, y = 0, pid }) {
  const fill = c.fill === 'full' ? INK : c.fill === 'striped' ? `url(#${pid})` : '#fff'
  return <g transform={`translate(${x + 50},${y + 50})`}>
    {POS[c.count].map(([dx, dy], i) => <g key={i} transform={`translate(${dx},${dy})`}><Shape shape={c.shape} r={R[c.size]} fill={fill} rot={c.rot} /></g>)}
  </g>
}
const Stripes = ({ id }) => <defs><pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff" /><line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="2.6" /></pattern></defs>

// The 3×3 matrix, laid out right-to-left (first column on the right); the bottom-left cell is missing.
export function MatrixFigure({ m, solved = false, className = 'gt-matrix' }) {
  const pid = 'st' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const cells = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const x = (2 - c) * 100, y = r * 100
    if (r === 2 && c === 2 && !solved) cells.push(<g key="q"><rect x={x + 6} y={y + 6} width="88" height="88" rx="10" fill="#fff6d1" stroke={INK} strokeDasharray="6 5" strokeWidth="2" /><text x={x + 50} y={y + 66} textAnchor="middle" fontSize="46" fontWeight="900" fill={INK}>?</text></g>)
    else cells.push(<CellArt key={`${r}${c}`} c={matrixCell(m, r, c)} x={x} y={y} pid={pid} />)
  }
  return <svg viewBox="-3 -3 306 306" className={className} role="img" aria-label="מטריצה של 3 על 3 צורות, המשבצת השמאלית התחתונה חסרה">
    <Stripes id={pid} />
    <rect x="0" y="0" width="300" height="300" rx="12" fill="#fff" stroke={INK} strokeWidth="3" />
    <path d="M100 0V300M200 0V300M0 100H300M0 200H300" stroke={INK} strokeWidth="1.6" opacity=".45" />
    {cells}
  </svg>
}
export function CellFigure({ c, className = 'gt-cell' }) {
  const pid = 'sc' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return <svg viewBox="0 0 100 100" className={className} aria-hidden="true"><Stripes id={pid} /><CellArt c={c} pid={pid} /></svg>
}
