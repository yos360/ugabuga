import { chooseMove } from './engine'

// Thinks off the main thread so the board never freezes while the computer searches.
self.onmessage = e => {
  const { id, fen, level } = e.data
  let move = null
  try { move = chooseMove(fen, level) } catch { move = null }
  self.postMessage({ id, move })
}
