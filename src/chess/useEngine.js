import { useCallback, useEffect, useRef } from 'react'

// One Web Worker per page for the computer player. `ask(fen, level)` resolves with a move
// ({from,to,promotion}) or null; a newer ask (or cancel) makes older answers resolve to null.
// Falls back to the main thread (lazily loaded) when workers are unavailable.
export function useEngine() {
  const worker = useRef(null)
  const pending = useRef(new Map())
  const seq = useRef(0)

  useEffect(() => {
    const waiting = pending.current
    try {
      const w = new Worker(new URL('./engine.worker.js', import.meta.url), { type: 'module' })
      w.onmessage = e => {
        const done = waiting.get(e.data.id)
        waiting.delete(e.data.id)
        done?.(e.data.id === seq.current ? e.data.move : null)
      }
      w.onerror = () => { worker.current = null; for (const [, done] of waiting) done(null); waiting.clear() }
      worker.current = w
    } catch { worker.current = null }
    return () => { worker.current?.terminate(); worker.current = null; for (const [, done] of waiting) done(null); waiting.clear() }
  }, [])

  const ask = useCallback((fen, level) => new Promise(resolve => {
    const id = ++seq.current
    if (worker.current) {
      pending.current.set(id, resolve)
      worker.current.postMessage({ id, fen, level })
      return
    }
    import('./engine').then(({ chooseMove }) => {
      setTimeout(() => resolve(id === seq.current ? chooseMove(fen, level) : null), 30)
    }, () => resolve(null))
  }), [])

  const cancel = useCallback(() => { seq.current++ }, [])
  return { ask, cancel }
}
