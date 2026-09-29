import { useEffect, useMemo, useState } from 'react'
import Cube3D from './Cube3D'
import { solved, apply, parse } from '../../utils/cube'

// A live demo: starts from `setup` (applied to a solved cube) and plays `alg`
// move by move on the same simulator the tests use — what you see is what the
// algorithm really does.
export default function CubeDemo({ setup = '', alg, title }) {
  const moves = useMemo(() => parse(alg), [alg])
  const start = useMemo(() => setup ? apply(solved(), setup) : solved(), [setup])
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [back, setBack] = useState(false)
  const state = useMemo(() => apply(start, moves.slice(0, i)), [start, moves, i])

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => { setI(n => n + 1); if (i + 1 >= moves.length) setPlaying(false) }, 650)
    return () => clearTimeout(t)
  }, [playing, i, moves.length])

  const play = () => { if (i >= moves.length) setI(0); setPlaying(true) }
  const done = i >= moves.length

  return <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center">
    {title && <p className="font-bold mb-1">{title}</p>}
    <div className="mx-auto max-w-[210px]"><Cube3D state={state} back={back} label={`${title || 'הדגמה'} — שלב ${i} מתוך ${moves.length}`} /></div>
    <div className="my-2 flex flex-wrap justify-center gap-1" dir="ltr" aria-label="המהלכים">
      {moves.map((m, k) => <span key={k} className={`min-w-[34px] rounded-md border px-1.5 py-0.5 font-mono text-sm font-bold ${k === i - 1 ? 'border-pink-600 bg-pink-600 text-white' : k < i ? 'border-slate-300 bg-slate-100 text-slate-400' : 'border-slate-800 bg-white'}`}>{m.text}</span>)}
    </div>
    <p className="min-h-[24px] text-sm font-bold text-green-700" aria-live="polite">{done ? '✓ הגענו — בדיוק כמו שהובטח' : ''}</p>
    <div className="flex flex-wrap justify-center gap-2">
      <button type="button" onClick={play} disabled={playing} className="min-h-[44px] rounded-xl bg-pink-600 px-4 font-bold text-white disabled:opacity-50">▶ {done ? 'שוב' : 'הפעילו'}</button>
      <button type="button" onClick={() => { setPlaying(false); setI(n => Math.min(moves.length, n + 1)) }} disabled={playing || done} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-3 font-bold disabled:opacity-40">⏭ מהלך</button>
      <button type="button" onClick={() => { setPlaying(false); setI(0) }} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-3 font-bold">↺ התחלה</button>
      <button type="button" onClick={() => setBack(b => !b)} aria-pressed={back} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-3 font-bold">🔄 {back ? 'צד קדמי' : 'הצד האחורי'}</button>
    </div>
  </div>
}
