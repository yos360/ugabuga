import { useState, useCallback, useRef } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

function Coin3D({ flipping, result, mouseX }) {
  const hoverRot = flipping ? 0 : mouseX * 25
  const finalRot = result === 'b' ? 180 : 0
  const spins = flipping ? 1800 : 0

  return (
    <div style={{ perspective: '500px' }} className="w-32 h-32 md:w-40 md:h-40">
      <div className="relative w-full h-full transition-transform ease-out"
        style={{ transformStyle: 'preserve-3d', transform: `rotateY(${spins + finalRot + hoverRot}deg)`, transitionDuration: flipping ? '1100ms' : '200ms', transitionTimingFunction: flipping ? 'cubic-bezier(0.34,1.4,0.64,1)' : 'ease-out' }}>
        <div className="absolute inset-0 rounded-full border-[4px] border-[var(--border)] bg-[var(--postit)] flex items-center justify-center text-3xl shadow-[3px_3px_0_var(--border)]" style={{ backfaceVisibility: 'hidden' }}>
          🌳
        </div>
        <div className="absolute inset-0 rounded-full border-[4px] border-[var(--border)] bg-[var(--accent)] flex items-center justify-center text-3xl shadow-[3px_3px_0_var(--border)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          👑
        </div>
      </div>
    </div>
  )
}

export default function CoinFlip() {
  const [result, setResult] = useState(null)
  const [flipping, setFlipping] = useState(false)
  const [history, setHistory] = useState([])
  const [customA, setCustomA] = useState('')
  const [customB, setCustomB] = useState('')
  const [mouse, setMouse] = useState(0)
  const containerRef = useRef(null)

  const a = customA || 'עץ'
  const b = customB || 'פלי'

  const flip = useCallback(() => {
    setFlipping(true)
    setTimeout(() => {
      const r = Math.random() < 0.5 ? 'a' : 'b'
      setResult(r)
      setHistory(h => [r, ...h].slice(0, 20))
      setFlipping(false)
    }, 1100)
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMouse(((e.clientX - rect.left) / rect.width - 0.5) * 2)
  }, [])

  const countA = history.filter(h => h === 'a').length
  const countB = history.filter(h => h === 'b').length

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="הטלת מטבע תלת-ממדית" description="הטילו מטבע 3D אונליין — עץ או פלי, או בחירה מותאמת אישית." path="/tools/coin-flip" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'הטלת מטבע' }]} />
      <h1 className="text-4xl text-center mb-6">🪙 הטלת מטבע 3D</h1>

      <div ref={containerRef} onMouseMove={onMouseMove} className="flex justify-center mb-6 py-6">
        <Coin3D flipping={flipping} result={result} mouseX={mouse} />
      </div>

      {result && !flipping && (
        <p className="text-center font-display text-3xl font-bold mb-6 buga-pop">{result === 'a' ? '🌳 ' + a : '👑 ' + b}!</p>
      )}

      <div className="text-center mb-2">
        <button onClick={flip} disabled={flipping}
          className="wobbly-md sketch-press min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-10 py-3 font-display text-xl font-bold text-[var(--accent-foreground)] cursor-pointer disabled:opacity-50">
          {flipping ? '🪙 מטיל...' : '🪙 הטילו!'}
        </button>
      </div>
      <p className="text-center font-hand text-sm text-[var(--muted-foreground)] mb-6">💡 הזיזו עכבר מעל המטבע — הוא מגיב!</p>

      {history.length > 0 && <p className="text-center font-hand text-lg mb-6">{a}: {countA} | {b}: {countB}</p>}

      <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mt-4">
        <h3 className="font-display text-lg font-bold mb-2">🎯 בחירה מותאמת</h3>
        <div className="grid grid-cols-2 gap-3">
          <input value={customA} onChange={e => setCustomA(e.target.value)} placeholder="צד 1 (עץ)" className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2" />
          <input value={customB} onChange={e => setCustomB(e.target.value)} placeholder="צד 2 (פלי)" className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2" />
        </div>
      </div>
    </div>
  )
}

