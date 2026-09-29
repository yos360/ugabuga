import { COLORS, colorAt, apply } from '../../utils/cube'

// Isometric drawing of a cube state: top (U), front (F) and right (R) faces.
// `back` shows the other side (the cube turned around), so all six faces can be seen.
const C = Math.cos(Math.PI / 6), SN = Math.sin(Math.PI / 6)
const proj = ([x, y, z], s) => [(x - z) * C * s, (x + z) * SN * s - y * s]

function quad(corners, s) {
  return corners.map(p => proj(p, s).map(v => v.toFixed(1)).join(',')).join(' ')
}

export default function Cube3D({ state: raw, size = 34, back = false, label }) {
  const s = size
  // From behind = the same cube turned half-way round; drawn with the usual three faces.
  const state = back ? apply(raw, 'y2') : raw
  const faces = ['U', 'F', 'R']
  const polys = []
  const g = 0.46 // half a sticker, leaving a thin black gap
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
    // U face at y = 1.5
    {
      const pos = [a, 1, b]
      const cx = a, cz = b
      polys.push({ face: 'U', pos, pts: [[cx - g, 1.5, cz - g], [cx + g, 1.5, cz - g], [cx + g, 1.5, cz + g], [cx - g, 1.5, cz + g]] })
    }
    // front face at z = 1.5 (F, or B when looking from behind)
    {
      const x = a, y = b
      const pos = [x, y, 1]
      polys.push({ face: faces[1], pos, pts: [[x - g, y - g, 1.5], [x + g, y - g, 1.5], [x + g, y + g, 1.5], [x - g, y + g, 1.5]] })
    }
    // right face at x = 1.5 (R, or L from behind)
    {
      const z = a, y = b
      const pos = [1, y, z]
      polys.push({ face: faces[2], pos, pts: [[1.5, y - g, z - g], [1.5, y + g, z - g], [1.5, y + g, z + g], [1.5, y - g, z + g]] })
    }
  }
  const W = 3 * 2 * C * s + 8, top = -1.5 * s * 2.05
  return <svg viewBox={`${-W / 2} ${top} ${W} ${W * 1.05}`} role="img" aria-label={label || 'קובייה הונגרית'} className="block h-auto w-full">
    <polygon points={quad([[-1.5, 1.5, -1.5], [1.5, 1.5, -1.5], [1.5, 1.5, 1.5], [-1.5, 1.5, 1.5]], s)} fill="#111" />
    <polygon points={quad([[-1.5, -1.5, 1.5], [1.5, -1.5, 1.5], [1.5, 1.5, 1.5], [-1.5, 1.5, 1.5]], s)} fill="#111" />
    <polygon points={quad([[1.5, -1.5, -1.5], [1.5, 1.5, -1.5], [1.5, 1.5, 1.5], [1.5, -1.5, 1.5]], s)} fill="#111" />
    {polys.map((p, i) => <polygon key={i} points={quad(p.pts, s)} fill={COLORS[colorAt(state, p.face, p.pos)] || '#999'} stroke="#111" strokeWidth="1" strokeLinejoin="round" />)}
  </svg>
}
