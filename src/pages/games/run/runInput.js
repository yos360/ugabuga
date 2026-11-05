// Reads swipes from the raw finger positions, with no drawing, so it runs the same in the browser and in tests.
const SWIPE_PX = 20
const FLICK_PX = 10 // a short flick that ends before SWIPE_PX still counts when the finger lifts
const BACK_PX = 40 // the finger recoils after a swipe: going back needs a longer, deliberate move
const OPPOSITE = { left: 'right', right: 'left', jump: 'slide', slide: 'jump' }
const commandOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'jump' : 'slide')

// One finger can chain moves without lifting (left, then up), and each finger is followed on its own.
export function createSwipes(send) {
  const fingers = new Map()
  return {
    down(id, x, y) { fingers.set(id, { x, y, last: null }) },
    move(id, x, y) {
      const f = fingers.get(id)
      if (!f) return
      const dx = x - f.x, dy = y - f.y, far = Math.max(Math.abs(dx), Math.abs(dy))
      const cmd = commandOf(dx, dy)
      if (far < (cmd === OPPOSITE[f.last] ? BACK_PX : SWIPE_PX)) return
      f.x = x
      f.y = y
      if (cmd !== f.last) { f.last = cmd; send(cmd) }
    },
    up(id, x, y) {
      const f = fingers.get(id)
      fingers.delete(id)
      if (!f || f.last) return
      const dx = x - f.x, dy = y - f.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) >= FLICK_PX) send(commandOf(dx, dy))
    },
    cancel(id) { fingers.delete(id) },
  }
}
