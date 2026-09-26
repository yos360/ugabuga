import { makeRng } from '../rng'
import { W, H } from './maze'

// Tracing rows: dashed paths from right to left (the direction Hebrew is written).
const ROWS = [3, 4, 4, 5, 5, 6, 6]
const POOL = [
  ['straight', 'wave', 'zigzag', 'arches'],
  ['straight', 'wave', 'zigzag', 'arches', 'bumps'],
  ['wave', 'zigzag', 'arches', 'bumps', 'square', 'loops'],
  ['wave', 'zigzag', 'square', 'loops', 'mountains', 'combo'],
  ['wave', 'zigzag', 'square', 'loops', 'mountains', 'combo', 'curly'],
  ['zigzag', 'square', 'loops', 'mountains', 'combo', 'curly'],
  ['square', 'loops', 'combo', 'curly', 'mountains'],
]
const NAMES = { straight: 'קו ישר', wave: 'גלים', zigzag: 'זיגזג', arches: 'קשתות', bumps: 'גבעות', square: 'מדרגות', loops: 'לולאות', mountains: 'הרים', combo: 'משולב', curly: 'סלסולים' }

const fx = n => +n.toFixed(2)
function sampled(fn, x0, x1, steps) { // fn(t in 0..1) → [x,y]
  let d = ''
  for (let i = 0; i <= steps; i++) { const [x, y] = fn(i / steps); d += (i ? ' L' : 'M') + fx(x) + ' ' + fx(y) }
  return d
}

function pathFor(type, x0, x1, y, amp, n, rng) {
  const span = x0 - x1 // x0 is the right edge, drawing goes leftwards
  switch (type) {
    case 'straight': return `M${fx(x0)} ${fx(y)} L${fx(x1)} ${fx(y)}`
    case 'wave': return sampled(t => [x0 - span * t, y - amp * Math.sin(t * n * 2 * Math.PI)], x0, x1, 120)
    case 'zigzag': case 'mountains': {
      const k = type === 'mountains' ? n + 1 : n * 2
      let d = `M${fx(x0)} ${fx(y + amp)}`
      for (let i = 1; i <= k; i++) d += ` L${fx(x0 - span * i / k)} ${fx(i % 2 ? y - amp : y + amp)}`
      return d
    }
    case 'arches': case 'bumps': {
      const k = type === 'arches' ? n : n * 2, w = span / k
      let d = `M${fx(x0)} ${fx(y + amp / 2)}`
      for (let i = 1; i <= k; i++) d += ` A${fx(w / 2)} ${fx(amp)} 0 0 0 ${fx(x0 - w * i)} ${fx(y + amp / 2)}`
      return d
    }
    case 'square': {
      const k = n * 2, w = span / k
      let d = `M${fx(x0)} ${fx(y + amp)}`
      for (let i = 0; i < k; i++) { const yy = i % 2 ? y + amp : y - amp; d += ` L${fx(x0 - w * i)} ${fx(yy)} L${fx(x0 - w * (i + 1))} ${fx(yy)}` }
      return d
    }
    case 'loops': case 'curly': { // prolate cycloid: the pen overshoots backwards and makes a loop
      const turns = type === 'curly' ? n + 2 : n, a = span / (2 * Math.PI * turns), b = Math.min(amp, a * (type === 'curly' ? 2.2 : 1.7))
      return sampled(t => { const th = t * turns * 2 * Math.PI; return [x0 - a * th - b * Math.sin(th), y + b * Math.cos(th)] }, x0, x1, 60 * turns)
    }
    case 'combo': {
      const mid = x0 - span / 2
      const a = pathFor(rng.pick(['wave', 'arches']), x0, mid, y, amp, Math.max(1, Math.round(n / 2)), rng)
      const b = pathFor(rng.pick(['zigzag', 'square']), mid, x1, y, amp, Math.max(1, Math.round(n / 2)), rng)
      return a + ' ' + b.replace(/^M/, 'L')
    }
    default: return ''
  }
}

export function generateTracing({ level, seed, theme }) {
  const rng = makeRng(seed)
  const rows = ROWS[level], rowH = (H - 6) / rows
  const pool = POOL[level]
  let types = rng.shuffle(pool)
  while (types.length < rows) types = types.concat(rng.shuffle(pool))
  const starters = theme.icons.filter(ic => ic !== theme.goal)
  const x0 = W - 22, x1 = 22 // leave room for the start icon (right) and goal icon (left)
  const items = types.slice(0, rows).map((type, i) => {
    const y = 3 + rowH * (i + 0.5)
    const amp = rowH * (level < 2 ? 0.3 : 0.26)
    const n = [2, 2, 3, 3, 4, 4, 5][level] + (type === 'straight' ? 0 : rng.int(0, 1))
    return { type, name: NAMES[type], y, d: pathFor(type, x0, x1, y, amp, n, rng), startX: W - 11, endX: 11, start: starters[i % starters.length], goal: theme.goal }
  })
  return {
    kind: 'tracing', title: theme.traceTitle, instruction: 'מתחילים בנקודה שמימין וממשיכים על הקו המקווקו עד הסוף.',
    items, rowH, stroke: [2.2, 2, 1.8, 1.6, 1.4, 1.2, 1.1][level], dash: [3.2, 3, 2.6, 2.4, 2.2, 2, 1.8][level],
  }
}
