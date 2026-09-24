import { useState, useCallback } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

export default function SpinBottle() {
  const [names, setNames] = useState(['','',''])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [history, setHistory] = useState([])

  const valid = names.map(n => n.trim()).filter(Boolean)
  const updateName = (i, v) => setNames(n => n.map((x,j) => j===i?v:x))
  const addField = () => setNames(n => [...n, ''])

  const spin = useCallback(() => {
    if (valid.length < 2) return
    setSpinning(true)
    const targetIdx = Math.floor(Math.random() * valid.length)
    const targetAngle = (360 / valid.length) * targetIdx
    const fullSpins = 360 * (4 + Math.floor(Math.random()*3))
    const newRotation = rotation + fullSpins + targetAngle
    setRotation(newRotation)
    setTimeout(() => {
      setWinner(valid[targetIdx])
      setHistory(h => [valid[targetIdx], ...h].slice(0,10))
      setSpinning(false)
    }, 3000)
  }, [valid, rotation])

  const radius = 140
  const positions = valid.map((name, i) => {
    const angle = (360 / valid.length) * i - 90
    const x = Math.cos(angle * Math.PI/180) * radius
    const y = Math.sin(angle * Math.PI/180) * radius
    return { name, x, y }
  })

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="סובב את הבקבוק אונליין — הגרלת שחקן במעגל" description="סובב הבקבוק בלי בקבוק: כותבים את שמות השחקנים, הם מסודרים במעגל, והבקבוק מסתובב ועוצר על מי שתורו. כולל היסטוריית סיבובים. מושלם לאמת או חובה. חינם." path="/tools/spin-the-bottle" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'סובב בקבוק' }]} />
      <h1 className="text-4xl text-center mb-6">🍾 סובב את הבקבוק</h1>

      <div className="relative mx-auto mb-6" style={{ width: 340, height: 340 }}>
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-[var(--muted)]" />
        {positions.map((p, i) => (
          <div key={i} className={`absolute wobbly-sm border-2 px-3 py-1 font-hand text-base whitespace-nowrap ${winner===p.name && !spinning ? 'bg-[var(--postit)] border-[var(--accent)] scale-125' : 'bg-white border-[var(--border)]'}`}
            style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`, transform: 'translate(-50%,-50%)', transition: 'all 300ms' }}>
            {i+1}. {p.name}
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 text-5xl" style={{ transform: `translate(-50%,-50%) rotate(${rotation}deg)`, transition: spinning ? 'transform 3s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}>🍾</div>
      </div>

      {winner && !spinning && <p className="text-center font-display text-2xl font-bold mb-4 buga-pop">🎯 נבחר/ה: {winner}!</p>}

      <button onClick={spin} disabled={spinning || valid.length < 2}
        className="wobbly-md sketch-press w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer disabled:opacity-50 mb-6">
        {spinning ? '🍾 מסתובב...' : '🍾 סובבו!'}
      </button>

      <div className="grid gap-2 mb-2">
        {names.map((n,i) => (
          <input key={i} value={n} onChange={e => updateName(i, e.target.value)} placeholder={`שחקן ${i+1}...`} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2" />
        ))}
      </div>
      <button onClick={addField} className="wobbly-sm sketch-press border-2 border-dashed border-[var(--border)] px-4 py-2 font-bold cursor-pointer">+ הוסיפו שחקן</button>

      {history.length > 0 && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mt-6">
          <h3 className="font-display text-lg font-bold mb-2">הגרלות אחרונות</h3>
          {history.map((h,i) => <p key={i} className="font-hand text-base">🎯 {h}</p>)}
        </div>
      )}
    </div>
  )
}
