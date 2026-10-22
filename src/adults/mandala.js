// A seeded mandala drawn from rings of repeated motifs (petals, leaves, arches, dots, zigzags,
// scallops, bands) around a centre. Same seed + level → same mandala, so a number identifies it.
// Plain module: returns shape descriptors; MandalaSvg renders them.
export const MANDALA_LEVELS = [
  { id: 1, label: 'קלה — שטחים גדולים', rings: [4, 5], sym: [8, 10], stroke: 5, detail: 0 },
  { id: 2, label: 'בינונית', rings: [6, 7], sym: [10, 12, 14], stroke: 3.4, detail: 0.3 },
  { id: 3, label: 'מפורטת', rings: [8, 10], sym: [12, 16, 18], stroke: 2.4, detail: 0.6 },
  { id: 4, label: 'מפורטת מאוד — למבוגרים', rings: [11, 13], sym: [16, 20, 24], stroke: 1.6, detail: 0.9 },
]
export const levelById = id => MANDALA_LEVELS.find(l => l.id === Number(id)) || MANDALA_LEVELS[2]

function rng(seed) {
  let a = (Number(seed) >>> 0) || 1
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}
const f = n => Math.round(n * 10) / 10
const MOTIFS = ['petals', 'leaves', 'arches', 'dots', 'zigzag', 'scallop', 'band', 'teardrops']

// Motif shapes are drawn once pointing "up" (negative y) and then rotated around the centre.
function motif(type, r0, r1, count, detail, rand) {
  const h = r1 - r0, rm = (r0 + r1) / 2
  const half = rm * Math.sin(Math.PI / count) // half the arc width at mid radius
  const out = []
  const P = d => out.push({ t: 'path', d })
  const C = (cy, r) => out.push({ t: 'circle', cx: 0, cy: f(cy), r: f(r) })
  if (type === 'petals' || type === 'teardrops') {
    const w = half * (type === 'petals' ? 0.95 : 0.7)
    const tip = type === 'petals' ? 0.25 : 0.05
    P(`M0 ${f(-r0)} C${f(w)} ${f(-r0 - h * tip)} ${f(w * 0.9)} ${f(-r1 + h * 0.3)} 0 ${f(-r1)} C${f(-w * 0.9)} ${f(-r1 + h * 0.3)} ${f(-w)} ${f(-r0 - h * tip)} 0 ${f(-r0)}Z`)
    if (detail > 0.2 && h > 30) { const i = 0.55; P(`M0 ${f(-r0 - h * 0.18)} C${f(w * i)} ${f(-r0 - h * 0.3)} ${f(w * i * 0.9)} ${f(-r1 + h * 0.38)} 0 ${f(-r1 + h * 0.15)} C${f(-w * i * 0.9)} ${f(-r1 + h * 0.38)} ${f(-w * i)} ${f(-r0 - h * 0.3)} 0 ${f(-r0 - h * 0.18)}Z`) }
    if (detail > 0.5 && h > 40) C(-r0 - h * 0.62, Math.min(w * 0.18, h * 0.08))
  } else if (type === 'leaves') {
    const w = half * 0.85
    P(`M0 ${f(-r0)} Q${f(w * 1.3)} ${f(-rm)} 0 ${f(-r1)} Q${f(-w * 1.3)} ${f(-rm)} 0 ${f(-r0)}Z`)
    if (detail > 0.2) P(`M0 ${f(-r0)} L0 ${f(-r1)}`)
    if (detail > 0.6 && h > 30) for (const k of [0.35, 0.6]) { const y = -r0 - h * k; P(`M0 ${f(y)} L${f(w * 0.45)} ${f(y - h * 0.12)} M0 ${f(y)} L${f(-w * 0.45)} ${f(y - h * 0.12)}`) }
  } else if (type === 'arches') {
    const w = Math.min(half * 0.98, h * 0.9)
    P(`M${f(-w)} ${f(-r0)} L${f(-w)} ${f(-r1 + w)} A${f(w)} ${f(w)} 0 0 1 ${f(w)} ${f(-r1 + w)} L${f(w)} ${f(-r0)}`)
    if (detail > 0.3) { const w2 = w * 0.55; P(`M${f(-w2)} ${f(-r0)} L${f(-w2)} ${f(-r1 + w)} A${f(w2)} ${f(w2)} 0 0 1 ${f(w2)} ${f(-r1 + w)} L${f(w2)} ${f(-r0)}`) }
  } else if (type === 'dots') {
    const r = Math.min(half * 0.8, h * 0.42)
    C(-rm, r)
    if (detail > 0.3 && r > 8) C(-rm, r * 0.45)
  } else if (type === 'zigzag') {
    P(`M${f(-half)} ${f(-r0)} L0 ${f(-r1)} L${f(half)} ${f(-r0)}`)
    if (detail > 0.4) P(`M${f(-half * 0.5)} ${f(-r0)} L0 ${f(-r0 - h * 0.5)} L${f(half * 0.5)} ${f(-r0)}`)
  } else if (type === 'scallop') {
    const w = half
    P(`M${f(-w)} ${f(-r0)} Q0 ${f(-r1 - h * 0.15)} ${f(w)} ${f(-r0)}`)
    if (detail > 0.4) C(-r0 - h * 0.4, Math.min(w * 0.18, h * 0.16))
  } else if (type === 'band') {
    P(`M0 ${f(-r0)} L0 ${f(-r1)}`)
    if (detail > 0.5) C(-rm, Math.min(half * 0.3, h * 0.25))
  }
  void rand
  return out
}

export function makeMandala(seed, levelId = 3) {
  const L = levelById(levelId), rand = rng(seed * 7919 + L.id)
  const pick = a => a[Math.floor(rand() * a.length)]
  const sym = pick(L.sym)
  const rings = L.rings[0] + Math.floor(rand() * (L.rings[1] - L.rings[0] + 1))
  const R = 480, core = R * (0.08 + rand() * 0.05)
  // Ring edges: random widths that sum to the radius; outer rings a bit wider.
  const weights = Array.from({ length: rings }, (_, i) => 0.7 + rand() * 0.8 + i * 0.05)
  const total = weights.reduce((a, b) => a + b, 0)
  const edges = [core]
  for (const w of weights) edges.push(edges.at(-1) + (R - core) * w / total)
  const shapes = []
  // The centre: a small rosette inside a circle.
  shapes.push({ rot: [0], items: [{ t: 'circle', cx: 0, cy: 0, r: f(core) }] })
  shapes.push({ rot: Array.from({ length: Math.max(6, sym / 2) }, (_, i) => i * 360 / Math.max(6, sym / 2)), items: motif('petals', core * 0.15, core * 0.92, Math.max(6, sym / 2), 0, rand) })
  let last = ''
  for (let i = 0; i < rings; i++) {
    const r0 = edges[i], r1 = edges[i + 1]
    let type = pick(MOTIFS)
    if (type === last) type = pick(MOTIFS)
    last = type
    const mult = r1 > R * 0.6 && rand() < 0.5 ? 2 : 1 // outer rings sometimes repeat twice as often
    const count = sym * mult
    const offset = rand() < 0.5 ? 0 : 180 / count
    shapes.push({ rot: Array.from({ length: count }, (_, k) => f(offset + k * 360 / count)), items: motif(type, r0 + 2, r1 - 2, count, L.detail, rand) })
    shapes.push({ rot: [0], items: [{ t: 'circle', cx: 0, cy: 0, r: f(r1) }] })
  }
  return { sym, rings, stroke: L.stroke, shapes }
}
