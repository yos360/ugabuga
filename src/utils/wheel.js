// Spin-the-wheel math for the "גלגל מזל" tool (/tools/random-picker).
// The wheel is drawn with slice 0 starting at the top (12 o'clock) and slices going clockwise;
// the pointer is fixed at the top. Rotating the wheel clockwise by R degrees puts the slice
// that was at angle (360 - R mod 360) under the pointer.

const norm = a => ((a % 360) + 360) % 360

// Which slice is under the top pointer after the wheel turned `rotation` degrees clockwise.
export function sliceAtPointer(rotation, count) {
  if (count <= 0) return -1
  const size = 360 / count
  return Math.floor(norm(360 - norm(rotation)) / size) % count
}

// Plan a spin that lands on slice `index`: always forward from `fromRotation`, at least `turns`
// full turns, stopping at `offset` (0..1) inside the slice — kept away from the edges so the
// pointer never sits on a border line.
export function spinTo(index, count, fromRotation = 0, { turns = 5, offset = 0.5 } = {}) {
  const size = 360 / count
  const inside = 0.15 + Math.min(Math.max(offset, 0), 1) * 0.7
  const target = norm(360 - (index + inside) * size) // final rotation mod 360
  const base = fromRotation + turns * 360
  return base + norm(target - norm(base))
}

// Pick a random slice and plan the spin to it. `rand` is injectable for tests.
export function planSpin(count, fromRotation = 0, rand = Math.random) {
  const index = Math.floor(rand() * count) % count
  const rotation = spinTo(index, count, fromRotation, { turns: 5 + Math.floor(rand() * 3), offset: rand() })
  return { index, rotation }
}
