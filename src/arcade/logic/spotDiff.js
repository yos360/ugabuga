// Find the differences: two copies of one emoji picture, the second with a few changes
// (an item missing, swapped, bigger, or added). Shared by the printable sheet
// (/printables/activity/find-differences/<theme>) and the online game.
// Panel coordinates: x 0–100, y 0–70 (a 10:7 picture); size `s` is the emoji height.
import { rng, shuffle } from './rng.js'

export const SPOT_THEMES = {
  animals: { he: 'חיות', icon: '🐾', items: ['🦁', '🐘', '🦒', '🐶', '🐱', '🐸', '🦋', '🐢', '🐰', '🐻', '🐧', '🦊', '🐮', '🐷', '🐔', '🐝'] },
  space: { he: 'חלל', icon: '🚀', items: ['🚀', '🌙', '🪐', '⭐', '👽', '☄️', '🛰️', '🌍', '🛸', '🌟', '🔭', '🧑‍🚀', '☀️', '🌠'] },
  birthday: { he: 'יום הולדת', icon: '🎂', items: ['🎂', '🎈', '🎁', '🎉', '🍪', '🎵', '👑', '🍬', '🧁', '🍭', '🎀', '🪅', '🍩', '🥤'] },
  vehicles: { he: 'כלי רכב', icon: '🚗', items: ['🚗', '🚌', '🚲', '🚜', '🚒', '✈️', '🚂', '🚢', '🚕', '🚓', '🚑', '🛴', '🚁', '⛵'] },
  football: { he: 'כדורגל', icon: '⚽', items: ['⚽', '🥅', '🏆', '👟', '🧤', '📣', '🥇', '🎽', '🧢', '🏟️', '⏱️', '🚩', '🥤', '🎺'] },
  unicorn: { he: 'חד־קרן', icon: '🦄', items: ['🦄', '🌈', '⭐', '🦋', '🌸', '💜', '☁️', '🪄', '👑', '💎', '🌷', '🍭', '🎀', '🌙'] },
  sea: { he: 'ים', icon: '🐠', items: ['🐠', '🐙', '🦀', '🐚', '🐬', '🐳', '🦈', '🐡', '⛵', '🪸', '🦑', '🐢', '⚓', '🌊'] },
  garden: { he: 'גינה', icon: '🌻', items: ['🌻', '🌷', '🍄', '🐞', '🐝', '🦋', '🐌', '🌳', '🪴', '🍓', '🥕', '🐛', '🌼', '🪺'] },
  food: { he: 'אוכל', icon: '🍕', items: ['🍕', '🍎', '🍌', '🥕', '🍉', '🧀', '🍔', '🥨', '🍇', '🥒', '🍞', '🥚', '🍓', '🌽'] },
  winter: { he: 'חורף', icon: '⛄', items: ['⛄', '❄️', '☂️', '🧣', '🧤', '☕', '🌧️', '🥾', '🌈', '☁️', '⚡', '🧥', '🍲', '🔥'] },
}

const KINDS = ['remove', 'replace', 'resize', 'add']
export const KIND_HE = { remove: 'חסר פריט', replace: 'פריט אחר', resize: 'פריט בגודל אחר', add: 'פריט נוסף' }

// { base, changed, diffs: [{x, y, r, kind}], W, H }
export function buildSpotDiff({ items, count = 12, diffs = 5, seed = 1 }) {
  const rand = rng(seed * 7919 + 13)
  const W = 100, H = 70
  const slots = count + Math.max(2, Math.ceil(diffs / 2))
  const cols = slots > 20 ? 6 : 5, rows = Math.ceil(slots / cols)
  const cw = W / cols, ch = H / rows
  const size = Math.min(cw, ch) * 0.62
  // one spot per cell, nudged a little so the picture doesn't look like a table
  const spots = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    spots.push({ x: cw * (c + 0.5) + (rand() - 0.5) * cw * 0.28, y: ch * (r + 0.5) + (rand() - 0.5) * ch * 0.22 })
  }
  const order = shuffle(rand, spots.map((_, i) => i))
  const filled = order.slice(0, count), empty = order.slice(count)
  const pool = shuffle(rand, items)
  const base = filled.map((i, k) => ({ id: i, e: pool[k % pool.length], x: spots[i].x, y: spots[i].y, s: size * (0.85 + rand() * 0.3), r: Math.round((rand() - 0.5) * 24) }))
  const changed = base.map(it => ({ ...it }))
  const out = []
  const pickable = shuffle(rand, changed.map((_, k) => k))
  const freeSpots = [...empty]
  for (let d = 0; d < diffs; d++) {
    let kind = KINDS[Math.floor(rand() * KINDS.length)]
    if (kind === 'add' && !freeSpots.length) kind = 'replace'
    if (kind === 'add') {
      const i = freeSpots.pop()
      const it = { id: i, e: pool[Math.floor(rand() * pool.length)], x: spots[i].x, y: spots[i].y, s: size, r: 0 }
      changed.push(it)
      out.push({ x: it.x, y: it.y, r: size * 0.85, kind })
      continue
    }
    const k = pickable.pop()
    const it = changed[k]
    if (kind === 'remove') it.gone = true
    else if (kind === 'replace') it.e = pool.find(e => e !== it.e && !base.some(b => b.id !== it.id && b.e === e && Math.hypot(b.x - it.x, b.y - it.y) < cw * 1.2)) || pool[0]
    else it.s = it.s >= size ? it.s * 0.55 : it.s * 1.55
    out.push({ x: it.x, y: it.y, r: size * 0.85, kind })
  }
  return { base, changed: changed.filter(it => !it.gone), diffs: out, W, H }
}

// Game levels: more items and more differences as the levels go up.
export const SPOT_LEVELS = 18
const LEVEL_THEMES = ['animals', 'birthday', 'space', 'sea', 'vehicles', 'garden', 'unicorn', 'food', 'football', 'winter']
export function spotLevel(level) {
  const L = Math.max(1, Math.min(SPOT_LEVELS, level))
  const theme = LEVEL_THEMES[(L - 1) % LEVEL_THEMES.length]
  const diffs = Math.min(7, 3 + Math.floor((L - 1) / 3))
  const count = Math.min(26, 9 + L)
  return { level: L, theme, diffs, count, ...buildSpotDiff({ items: SPOT_THEMES[theme].items, count, diffs, seed: 500 + L }) }
}
// tap (x, y) in panel coordinates → index of the difference it hits, or -1
export function hitDiff(diffs, found, x, y) {
  let best = -1, dist = Infinity
  diffs.forEach((d, i) => {
    if (found.includes(i)) return
    const h = Math.hypot(d.x - x, d.y - y)
    if (h <= d.r * 1.15 && h < dist) { best = i; dist = h }
  })
  return best
}
export function spotStars(sec, misses, hints) {
  if (!hints && misses <= 1 && sec <= 40) return 3
  if (hints <= 1 && misses <= 4) return 2
  return 1
}
