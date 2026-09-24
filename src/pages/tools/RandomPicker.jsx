import { useState, useCallback } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

export default function RandomPicker() {
  const [names, setNames] = useState([''])
  const [picked, setPicked] = useState([])
  const [current, setCurrent] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [noRepeat, setNoRepeat] = useState(true)

  const updateName = (i, v) => setNames(n => n.map((x, j) => j === i ? v : x))
  const addField = () => setNames(n => [...n, ''])
  const removeField = (i) => setNames(n => n.filter((_, j) => j !== i))

  const valid = names.map((n,i) => ({name:n.trim(), idx:i+1})).filter(x => x.name)
  const available = noRepeat ? valid.filter(v => !picked.includes(v.name)) : valid

  const spin = useCallback(() => {
    if (available.length === 0) return
    setSpinning(true)
    let count = 0
    const interval = setInterval(() => {
      setCurrent(available[Math.floor(Math.random() * available.length)])
      count++
      if (count > 15) {
        clearInterval(interval)
        const winner = available[Math.floor(Math.random() * available.length)]
        setCurrent(winner)
        setPicked(p => [...p, winner.name])
        setSpinning(false)
      }
    }, 100)
  }, [available])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title="גלגל שמות — הגרלת שם אקראי אונליין" description="גלגל שמות להגרלה: מוסיפים שמות ומגרילים בלחיצה — עם או בלי חזרות, כולל רשימת הגרלות אחרונות. לבחירת תלמיד, לחלוקת תורות ולהגרלות במסיבה. חינם." path="/tools/random-picker" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'גלגל שמות' }]} />
      <h1 className="text-4xl text-center mb-6">🎡 גלגל שמות</h1>

      {names.map((n, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <span className="w-8 text-center font-bold pt-2">{i+1}.</span>
          <input value={n} onChange={e => updateName(i, e.target.value)} placeholder="שם..." className="wobbly-sm flex-1 border-2 border-[var(--border)] bg-white px-3 py-2" />
          {names.length > 1 && <button onClick={() => removeField(i)} className="text-[var(--accent)] px-2 cursor-pointer">✕</button>}
        </div>
      ))}
      <button onClick={addField} className="wobbly-sm sketch-press border-2 border-dashed border-[var(--border)] px-4 py-2 font-bold cursor-pointer mb-4">+ הוסיפו שם</button>

      <label className="flex items-center gap-2 mb-4 font-hand text-lg cursor-pointer">
        <input type="checkbox" checked={noRepeat} onChange={e => setNoRepeat(e.target.checked)} className="w-5 h-5" />
        🔄 ללא חזרות
      </label>

      {current && (
        <div className="wobbly border-[3px] border-[var(--border)] bg-[var(--postit)] p-8 text-center sketch-shadow-rich mb-4 buga-pop">
          <p className="font-display text-3xl font-bold">🎉 מספר {current.idx} — {current.name}!</p>
        </div>
      )}

      <button onClick={spin} disabled={spinning || available.length === 0}
        className="wobbly-md sketch-press w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer disabled:opacity-50">
        {spinning ? '🎡 מגריל...' : available.length === 0 ? 'כולם הוגרלו! 🎉' : '🎡 הגרילו!'}
      </button>

      {picked.length > 0 && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mt-6">
          <h3 className="font-display text-lg font-bold mb-2">הגרלות אחרונות</h3>
          {picked.slice().reverse().map((p,i) => <p key={i} className="font-hand text-base">🎯 {p}</p>)}
        </div>
      )}
    </div>
  )
}
