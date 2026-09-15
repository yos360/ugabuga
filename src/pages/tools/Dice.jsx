import { useState, useCallback } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const dots = {1:[[1,1]],2:[[0,2],[2,0]],3:[[0,2],[1,1],[2,0]],4:[[0,0],[0,2],[2,0],[2,2]],5:[[0,0],[0,2],[1,1],[2,0],[2,2]],6:[[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]]}

function Die({ value, rolling }) {
  return (
    <div className={`wobbly-sm w-24 h-24 border-[3px] border-[var(--border)] bg-white sketch-shadow flex items-center justify-center ${rolling ? 'buga-dice-tumble' : ''}`}>
      <div className="grid grid-cols-3 gap-1.5 w-16 h-16">
        {[0,1,2].map(r => [0,1,2].map(c => {
          const show = (dots[value] || []).some(([dr,dc]) => dr === r && dc === c)
          return <div key={r+'-'+c} className={`w-4 h-4 rounded-full ${show ? 'bg-[var(--ink)]' : ''}`} />
        }))}
      </div>
    </div>
  )
}

export default function DiceTool() {
  const [count, setCount] = useState(1)
  const [values, setValues] = useState([6])
  const [rolling, setRolling] = useState(false)
  const [history, setHistory] = useState([])

  const roll = useCallback(() => {
    setRolling(true)
    setTimeout(() => {
      const newVals = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
      setValues(newVals)
      setHistory(h => [{ vals: newVals, total: newVals.reduce((a,b) => a+b, 0) }, ...h].slice(0, 10))
      setRolling(false)
    }, 500)
  }, [count])

  const total = values.reduce((a,b) => a+b, 0)

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="קוביה וירטואלית" description="הטילו קוביה אונליין — 1, 2 או 3 קוביות עם אנימציה." path="/tools/dice" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'קוביה' }]} />
      <h1 className="text-4xl text-center mb-6">🎲 קוביה וירטואלית</h1>

      <div className="flex justify-center gap-2 mb-6">
        {[1,2,3].map(n => (
          <button key={n} onClick={() => { setCount(n); setValues(Array(n).fill(6)) }}
            className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${count === n ? 'bg-[var(--postit)]' : 'bg-[var(--card)]'}`}>
            {n} {n === 1 ? 'קוביה' : 'קוביות'}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        {values.map((v, i) => <Die key={i} value={v} rolling={rolling} />)}
      </div>

      {count > 1 && <p className="text-center font-display text-3xl font-bold mb-4">סה"כ: {total}</p>}

      <div className="text-center mb-8">
        <button onClick={roll} disabled={rolling}
          className="wobbly-md sketch-press min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-10 py-3 font-display text-xl font-bold text-[var(--accent-foreground)] cursor-pointer disabled:opacity-50">
          {rolling ? '🎲 מגלגל...' : '🎲 הטילו!'}
        </button>
      </div>

      {history.length > 0 && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="font-display text-lg font-bold mb-2">היסטוריה</h3>
          {history.map((h, i) => (
            <p key={i} className="font-hand text-base">{h.vals.join(' + ')} = {h.total}</p>
          ))}
        </div>
      )}
    </div>
  )
}
