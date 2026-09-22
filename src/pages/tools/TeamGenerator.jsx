import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

export default function TeamGenerator() {
  const [names, setNames] = useState([''])
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState(null)

  const updateName = (i, v) => setNames(n => n.map((x, j) => j === i ? v : x))
  const addField = () => setNames(n => [...n, ''])
  const removeField = (i) => setNames(n => n.filter((_, j) => j !== i))

  const generate = () => {
    const valid = names.map(n => n.trim()).filter(Boolean)
    const shuffled = [...valid].sort(() => Math.random() - 0.5)
    const result = Array.from({ length: teamCount }, () => [])
    shuffled.forEach((name, i) => result[i % teamCount].push(name))
    setTeams(result)
  }

  const colors = ['#ff4d4d','#2d5da1','#4caf50','#ff9f43','#9c27b0','#00bcd4']

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title="מחלק קבוצות" description="מחלק קבוצות אקראי: מדביקים שמות, בוחרים כמה קבוצות ומקבלים חלוקה הוגנת בלחיצה. לכיתה, לחוג, לקייטנה ולמשחקי ספורט — חינם." path="/tools/team-generator" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'מחלק קבוצות' }]} />
      <h1 className="text-4xl text-center mb-6">🎲 מחלק קבוצות</h1>

      <div className="mb-4">
        <label className="font-bold block mb-2">כמה קבוצות?</label>
        <div className="flex gap-2">
          {[2,3,4,5].map(n => (
            <button key={n} onClick={() => setTeamCount(n)} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${teamCount===n?'bg-[var(--postit)]':'bg-white'}`}>{n}</button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="font-bold block mb-2">שמות ({names.filter(n=>n.trim()).length})</label>
        {names.map((n, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <span className="w-8 text-center font-bold pt-2">{i+1}.</span>
            <input value={n} onChange={e => updateName(i, e.target.value)} placeholder="שם..." className="wobbly-sm flex-1 border-2 border-[var(--border)] bg-white px-3 py-2" />
            {names.length > 1 && <button onClick={() => removeField(i)} className="text-[var(--accent)] px-2 cursor-pointer">✕</button>}
          </div>
        ))}
        <button onClick={addField} className="wobbly-sm sketch-press border-2 border-dashed border-[var(--border)] px-4 py-2 font-bold cursor-pointer mt-1">+ הוסיפו שם</button>
      </div>

      <button onClick={generate} className="wobbly-md sketch-press w-full min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer">🎲 חלקו!</button>

      {teams && (
        <div className="grid sm:grid-cols-2 gap-4 mt-6 buga-fade-in">
          {teams.map((team, i) => (
            <div key={i} className="wobbly-md border-[3px] border-[var(--border)] p-4 sketch-shadow" style={{ backgroundColor: colors[i%colors.length]+'22', borderColor: colors[i%colors.length] }}>
              <h3 className="font-display text-xl font-bold mb-2">קבוצה {i+1}</h3>
              {team.map(n => <p key={n} className="font-hand text-lg">{n}</p>)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
