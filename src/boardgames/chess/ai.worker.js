import { bestMove } from './ai'
self.onmessage = e => { const { fen, level, id } = e.data; self.postMessage({ id, move: bestMove(fen, level) }) }
