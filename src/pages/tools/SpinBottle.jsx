import { useState, useCallback } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import ToolGuide from './ToolGuide'
import { TOOL_GUIDES } from './toolGuides'

const guide = TOOL_GUIDES.spinBottle

// Drawn bottle with the neck pointing straight up at 0° — the 🍾 emoji is tilted differently on every platform,
// so it couldn't show reliably who was picked.
const Bottle = () => <svg width="34" height="96" viewBox="0 0 34 96" aria-hidden="true" style={{ display: 'block' }}>
  <rect x="12" y="2" width="10" height="10" rx="2" fill="#c0843d" />
  <path d="M13 12h8v16c0 6 11 10 11 22v40a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V50c0-12 11-16 11-22z" fill="#2f8f4e" stroke="#1b4d2b" strokeWidth="2" />
  <rect x="5" y="56" width="24" height="18" rx="3" fill="#fff3c4" />
</svg>

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
    // Land exactly on the target: add only the difference from where the bottle points now.
    const newRotation = rotation + fullSpins + ((targetAngle - rotation % 360) + 360) % 360
    setRotation(newRotation)
    setTimeout(() => {
      setWinner(valid[targetIdx])
      setHistory(h => [valid[targetIdx], ...h].slice(0,10))
      setSpinning(false)
    }, 3000)
  }, [valid, rotation])

  const radius = 40 // % of the circle's size, so it fits small phones too
  const positions = valid.map((name, i) => {
    const angle = (360 / valid.length) * i - 90
    const x = Math.cos(angle * Math.PI/180) * radius
    const y = Math.sin(angle * Math.PI/180) * radius
    return { name, x, y }
  })

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="סובב את הבקבוק אונליין — הגרלת שחקן במעגל" description="סובב הבקבוק בלי בקבוק: כותבים את שמות השחקנים, הם מסודרים במעגל, והבקבוק מסתובב ועוצר על מי שתורו. כולל היסטוריית סיבובים. מושלם להגרלת תור במשחק. חינם." path="/tools/spin-the-bottle" structuredData={faqSchema(guide.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'סובב בקבוק' }]} />
      <h1 className="text-4xl text-center mb-6">🔄 סובב את הבקבוק</h1>

      <div className="relative mx-auto mb-6 aspect-square" style={{ width: 'min(340px, 100%)' }}>
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-[var(--muted)]" />
        {positions.map((p, i) => (
          <div key={i} className={`absolute wobbly-sm border-2 px-2 py-1 font-hand text-base leading-tight text-center max-w-[110px] break-words ${winner===p.name && !spinning ? 'bg-[var(--postit)] border-[var(--accent)] scale-125' : 'bg-white border-[var(--border)]'}`}
            style={{ left: `${50 + p.x}%`, top: `${50 + p.y}%`, transform: 'translate(-50%,-50%)', transition: 'all 300ms' }}>
            {i+1}. {p.name}
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%,-50%) rotate(${rotation}deg)`, transition: spinning ? 'transform 3s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}><Bottle /></div>
      </div>

      {winner && !spinning && <p className="text-center font-display text-2xl font-bold mb-4 buga-pop">🎯 נבחר/ה: {winner}!</p>}

      <button onClick={spin} disabled={spinning || valid.length < 2}
        className="wobbly-md sketch-press w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer disabled:opacity-50 mb-6">
        {spinning ? '🔄 מסתובב...' : '🔄 סובבו!'}
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
      <ToolGuide {...guide} />
    </div>
  )
}
