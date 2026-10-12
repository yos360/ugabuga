// Scenes for "השבלול והדרורית": one per recorded clip (title, 11 paragraphs, goodnight).
// World is 1600×1000, ground line around y=640. Positions are [from, to] over the segment
// (or a number), `at` is the part of the segment the move happens in, `show` when it appears.
const snail = (o = {}) => ({ e: '🐌', s: 150, a: 'walk', ...o })
const bird = (o = {}) => ({ e: '🐦', s: 130, a: 'hop', ...o })
const lemon = { svg: 'lemonTree', x: 1180, y: 660, s: 1 }
const pumpkin = { svg: 'pumpkin', x: 420, y: 700, s: 1 }
const tap = { svg: 'tap', x: 230, y: 650, s: 0.8 }

export default [
  // 0 · title
  { sky: 'day', props: [lemon, pumpkin, { svg: 'flowers' }], fx: ['clouds', 'butterflies'],
    cast: [snail({ x: [900, 760], y: 760 }), bird({ a: 'fly', x: [1500, 640], y: [300, 560], at: [0, 0.8] })],
    cam: [1.08, 1] },
  // 1 · snail under the pumpkin leaf, slow, falls asleep in his shell
  { sky: 'morning', props: [pumpkin, { svg: 'flowers' }], fx: ['clouds'],
    cast: [snail({ s: 200, x: [820, 600], y: 800, at: [0, 0.75] }), { e: '💤', s: 90, x: 520, y: 650, a: 'zzz', show: [0.8, 1] }],
    cam: [1, 1.14, [0, 0], [120, 60]] },
  // 2 · sparrow on the lemon tree, hops, flies round the garden
  { sky: 'morning', props: [lemon, pumpkin], fx: ['clouds'],
    cast: [bird({ x: 1100, y: 430, a: 'hop', show: [0, 0.35] }),
      bird({ a: 'circle', x: 900, y: 360, r: 380, show: [0.35, 1] }), snail({ x: 520, y: 760, a: 'bob' })],
    cam: [1.12, 1, [-120, 40], [0, 0]] },
  // 3 · sparrow lands by the snail; the tap far away
  { sky: 'day', props: [pumpkin, tap, { svg: 'flowers' }], fx: ['clouds'],
    cast: [snail({ x: [760, 700], y: 780 }), bird({ a: 'land', x: [1400, 900], y: [200, 780], at: [0, 0.2] }),
      { e: '💬', s: 80, x: 960, y: 640, a: 'pop', show: [0.15, 0.5] }, { e: '💬', s: 80, x: 700, y: 650, a: 'pop', show: [0.5, 0.85] }],
    cam: [1, 1.1, [0, 0], [-80, 40]] },
  // 4 · sparrow flies to the tap, drinks, flies back
  { sky: 'day', props: [pumpkin, tap], fx: ['clouds'],
    cast: [snail({ x: 760, y: 780, a: 'bob' }), bird({ a: 'trip', x: [900, 300], y: [780, 600], at: [0, 0.6] }),
      { e: '💧', s: 60, x: 250, y: 690, a: 'drip', show: [0.2, 0.45] }],
    cam: [1.05, 1.05, [0, 0], [60, 0]] },
  // 5 · learning to go slowly: hop ahead, wait, hop again
  { sky: 'day', props: [{ svg: 'flowers' }], fx: ['clouds'],
    cast: [snail({ x: [1050, 900], y: 800 }), bird({ a: 'hopAhead', x: [960, 420], y: 800 })],
    cam: [1, 1.08, [0, 0], [100, 0]] },
  // 6 · what you see down low: ladybug, a train of ants, a dew drop
  { sky: 'day', props: [{ svg: 'bigLeaf', x: 1050, y: 720 }, { svg: 'grass' }], fx: ['sparkles'],
    cast: [{ e: '🐞', s: 110, x: [1120, 1040], y: 640, a: 'walk', show: [0.05, 1] },
      { e: '🐜', s: 60, x: [1500, 200], y: 900, a: 'ants', n: 6, show: [0.35, 1], at: [0.35, 1] },
      { e: '💧', s: 70, x: 880, y: 600, a: 'glint', show: [0.7, 1] },
      snail({ s: 170, x: 1290, y: 840, a: 'bob' }), bird({ s: 140, x: 1140, y: 840, a: 'peek' })],
    cam: [1.25, 1.1, [-150, -80], [-60, -40]] },
  // 7 · "I never saw all this" — they talk, close together
  { sky: 'day', props: [lemon, pumpkin, { svg: 'flowers' }], fx: ['clouds', 'butterflies'],
    cast: [snail({ x: 760, y: 790, a: 'bob' }), bird({ x: 600, y: 790, a: 'hop' }),
      { e: '✨', s: 70, x: 680, y: 620, a: 'twinkle' }],
    cam: [1, 1.12, [0, 0], [60, 40]] },
  // 8 · sparrow flies high around the tree; the garden from above, like a quilt
  { sky: 'day', props: [lemon, pumpkin, tap, { svg: 'quilt' }], fx: ['clouds'],
    cast: [bird({ a: 'circle', x: 1180, y: 330, r: 300, at: [0, 0.6] }), snail({ x: 700, y: 790, a: 'bob' })],
    cam: [1.15, 0.9, [0, 120], [0, -40]] },
  // 9 · together all the way: the sparrow rides on the shell
  { sky: 'afternoon', props: [{ svg: 'flowers' }], fx: ['clouds', 'butterflies'],
    cast: [snail({ s: 190, x: [1300, 500], y: 800, rider: { e: '🐦', s: 100 } })],
    cam: [1.05, 1.05, [60, 0], [-60, 0]] },
  // 10 · at the tap at sunset, drinking cool drops
  { sky: 'sunset', props: [{ ...tap, x: 760, s: 1.1 }], fx: ['hearts'],
    cast: [snail({ x: [1050, 920], y: 800, at: [0, 0.3] }), bird({ x: 620, y: 800, a: 'hop' }),
      { e: '💧', s: 60, x: 790, y: 700, a: 'drip' }],
    cam: [1, 1.1, [0, 0], [0, 30]] },
  // 11 · night: curled up on a stone, the stars come on one by one
  { sky: 'night', props: [{ svg: 'stone', x: 680, y: 820 }], fx: ['starsOneByOne', 'fireflies'],
    cast: [snail({ x: 900, y: 820, a: 'sleep' }), bird({ s: 110, x: 690, y: 760, a: 'sleep' }),
      { e: '💤', s: 80, x: 820, y: 640, a: 'zzz', show: [0.6, 1] }],
    cam: [1, 1.15, [0, -60], [0, 20]] },
  // 12 · goodnight
  { sky: 'night', props: [], fx: ['stars', 'fireflies'], cast: [], cam: [1, 1.05], end: true },
]
