import { useState, useCallback } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

export default function CoinFlip() {
  const [result, setResult] = useState(null)
  const [flipping, setFlipping] = useState(false)
  const [history, setHistory] = useState([])
  const [customA, setCustomA] = useState('')
  const [customB, setCustomB] = useState('')

  const a = customA || '🌳 עץ'
  const b = customB || '👑 פלי'

  const flip = useCallback(() => {
    setFlipping(true)
    setTimeout(() => {
      const r = Math.random() < 0.5 ? 'a' : 'b'
      setResult(r)
      setHistory(h => [r, ...h].slice(0, 20))
      setFlipping(false)
    }, 1100)
  }, [])

  const countA = history.filter(h => h === 'a').length
  const countB = history.filter(h => h === 'b').length

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="הטלת מטבע" description="הטילו מטבע אונליין — עץ או פלי, או הגדירו בחירה מותאמת אישית." path="/tools/coin-flip" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'הטלת מטבע' }]} />
      <h1 className="text-4xl text-center mb-6">🪙 הטלת מטבע</h1>

      <div className="flex justify-center mb-8">
        <div className={`w-32 h-32 rounded-full border-[4px] border-[var(--border)] sketch-shadow flex items-center justify-center text-4xl font-bold bg-[var(--postit)] ${flipping ? 'buga-coin-flip' : ''}`}>
          {flipping ? '🪙' : result === 'a' ? a.split(' ')[0] : result === 'b' ? b.split(' ')[0] : '🪙'}
        </div>
      </div>

      {result && !flipping && (
        <p className="text-center font-display text-3xl font-bold mb-6 buga-pop">
          {result === 'a' ? a : b}!
        </p>
      )}

      <div className="text-center mb-6">
        <button onClick={flip} disabled={flipping}
          className="wobbly-md sketch-press min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-10 py-3 font-display text-xl font-bold text-[var(--accent-foreground)] cursor-pointer disabled:opacity-50">
          {flipping ? '🪙 מטיל...' : '🪙 הטילו!'}
        </button>
      </div>

      {history.length > 0 && (
        <p className="text-center font-hand text-lg mb-6">{a}: {countA} | {b}: {countB}</p>
      )}

      <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mt-4">
        <h3 className="font-display text-lg font-bold mb-2">🎯 בחירה מותאמת</h3>
        <div className="grid grid-cols-2 gap-3">
          <input value={customA} onChange={e => setCustomA(e.target.value)} placeholder="צד 1 (עץ)" className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2" />
          <input value={customB} onChange={e => setCustomB(e.target.value)} placeholder="צד 2 (פלי)" className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2" />
        </div>
        <p className="font-hand text-sm text-[var(--muted-foreground)] mt-2">למשל: "פיצה" מול "סושי" — המטבע יחליט!</p>
      </div>
    </div>
  )
}
