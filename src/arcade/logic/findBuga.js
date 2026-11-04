// Find Buga: a busy scene full of emoji, with the Buga mascot hidden somewhere in it.
// Every level is built from its own seed, so "level 7" is the same picture for everyone.
// Positions are in percent of the scene (0–100 on both axes); sizes in percent of its
// shorter side.
import { rng } from './rng.js'

export const SCENES = [
  { id: 'park', he: 'בפארק', en: 'at the park', icon: '🌳', items: ['🌳', '🌲', '🌷', '🌼', '🐕', '🐈', '🧒', '👧', '👦', '🧑', '👩', '👨', '👵', '👴', '🚲', '🛴', '⚽', '🎈', '🐦', '🦋', '🌸', '🍦', '🧺', '🪁', '🐿️', '🦆'] },
  { id: 'beach', he: 'בחוף הים', en: 'at the beach', icon: '🏖️', items: ['⛱️', '🐚', '🦀', '🏄', '🏊', '🧒', '👧', '👦', '👩', '👨', '🏐', '🍉', '🍦', '🐬', '⛵', '🌴', '🩴', '🕶️', '🪣', '🐠', '🦩', '🧜'] },
  { id: 'party', he: 'במסיבת יום הולדת', en: 'at a birthday party', icon: '🎂', items: ['🎂', '🎈', '🎁', '🎉', '🧁', '🍭', '🍬', '🎊', '🥳', '🧒', '👧', '👦', '👩', '👨', '🍕', '🥤', '🎀', '🪅', '🍩', '🎶', '🤡', '🎩'] },
  { id: 'space', he: 'בחלל', en: 'in space', icon: '🚀', items: ['🚀', '🛸', '🪐', '🌙', '⭐', '🌟', '☄️', '👽', '👾', '🛰️', '🌍', '🧑‍🚀', '🔭', '✨', '🌠', '🌑', '🤖'] },
  { id: 'city', he: 'בעיר', en: 'in the city', icon: '🏙️', items: ['🚗', '🚕', '🚌', '🚓', '🚲', '🏢', '🏪', '🚦', '🧑', '👩', '👨', '🧒', '👧', '🐕', '🛵', '🌳', '🍕', '☕', '📦', '🚒', '🕊️', '🎒'] },
  { id: 'jungle', he: 'בג׳ונגל', en: 'in the jungle', icon: '🌴', items: ['🌴', '🌿', '🦜', '🐒', '🦁', '🐯', '🐘', '🦒', '🐍', '🦋', '🌺', '🍌', '🐊', '🦓', '🍃', '🐸', '🦛', '🍄'] },
]
// yellow things that look a bit like Buga from afar — more of them in later levels
export const DECOYS = ['🐥', '🐤', '🌻', '🟡', '🧽', '🌕', '🧀', '🍋']
export const LEVEL_COUNT = 12

export function levelSpec(level) {
  const L = Math.max(1, Math.min(LEVEL_COUNT, level))
  return {
    scene: SCENES[(L - 1) % SCENES.length],
    count: 80 + L * 24, // emoji in the crowd
    buga: Math.max(4.2, 9.5 - L * 0.45), // Buga's width, in % of the shorter side
    decoys: Math.floor(L * 1.5),
    covers: L < 3 ? 0 : L < 7 ? 1 : 2, // emoji placed partly over Buga
  }
}

// { scene, buga: {x, y, s}, items: [{e, x, y, s, r, z}] }
export function build(level, seed = 9000 + level) {
  const rand = rng(seed)
  const spec = levelSpec(level)
  const { scene } = spec
  const buga = { x: 8 + rand() * 84, y: 10 + rand() * 80, s: spec.buga }
  const items = []
  const near = (x, y, r) => Math.hypot(x - buga.x, y - buga.y) < r
  const add = (e, x, y, s, z) => items.push({ e, x, y, s, r: Math.round((rand() - 0.5) * 40), z })
  // the crowd: never right on top of Buga's middle, so it can always be seen and tapped
  let guard = 0
  while (items.length < spec.count && guard++ < spec.count * 20) {
    const x = rand() * 100, y = rand() * 100
    if (near(x, y, buga.s * 0.75)) continue
    add(scene.items[Math.floor(rand() * scene.items.length)], x, y, 3.2 + rand() * 3.8, rand() < 0.5 ? 1 : 3)
  }
  for (let k = 0; k < spec.decoys; k++) {
    let x, y
    do { x = rand() * 100; y = rand() * 100 } while (near(x, y, buga.s * 1.5))
    add(DECOYS[Math.floor(rand() * DECOYS.length)], x, y, 3.6 + rand() * 2.6, 2)
  }
  // covers: overlap one edge of Buga, in front of it
  for (let k = 0; k < spec.covers; k++) {
    const a = rand() * Math.PI * 2
    add(scene.items[Math.floor(rand() * scene.items.length)], buga.x + Math.cos(a) * buga.s * 0.62, buga.y + Math.sin(a) * buga.s * 0.62, buga.s * 0.6, 3)
  }
  return { scene, buga, items }
}

// Stars: fast and without help = 3
export function starsFor(sec, hint, misses) {
  if (!hint && sec <= 25 && misses <= 2) return 3
  if (sec <= 70 && misses <= 6) return 2
  return 1
}
