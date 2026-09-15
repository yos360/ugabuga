import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

export default function Scoreboard() {
  const [players, setPlayers] = useState([])
  const [newName, setNewName] = useState('')

  const addPlayer = () => {
    if (!newName.trim()) return
    setPlayers(p => [...p, { name: newName.trim(), score: 0 }])
    setNewName('')
  }

  const update = (i, delta) => {
    setPlayers(p => p.map((pl, j) => j === i ? { ...pl, score: pl.score + delta } : pl))
  }

  const remove = (i) => setPlayers(p => p.filter((_, j) => j !== i))
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="לוח ניקוד" description="לוח ניקוד אונליין — הוסיפו שחקנים, עקבו אחרי הניקוד, מיון אוטומטי." path="/tools/scoreboard" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'לוח ניקוד' }]} />
      <h1 className="text-4xl text-center mb-6">📊 לוח ניקוד</h1>

      <div className="flex gap-2 mb-6">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="שם שחקן/קבוצה..."
          onKeyDown={e => e.key === 'Enter' && addPlayer()}
          className="wobbly-sm flex-1 border-2 border-[var(--border)] bg-white px-4 py-3 text-lg" />
        <button onClick={addPlayer} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--accent)] text-white px-4 py-3 font-bold cursor-pointer">+ הוסיפו</button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center font-hand text-lg text-[var(--muted-foreground)]">הוסיפו שחקנים כדי להתחיל</p>
      ) : (
        <div className="grid gap-3">
          {sorted.map((player, idx) => {
            const origIdx = players.indexOf(player)
            return (
              <div key={origIdx} className={`wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow-sm flex items-center gap-3 ${idx === 0 ? 'bg-[var(--postit)] border-[3px]' : ''}`}>
                {idx === 0 && <span className="text-2xl">🏆</span>}
                <span className="font-display text-xl font-bold flex-1">{player.name}</span>
                <button onClick={() => update(origIdx, -1)} className="wobbly-sm w-10 h-10 border-2 border-[var(--border)] bg-[var(--card)] font-bold text-xl cursor-pointer">-</button>
                <span className="font-display text-3xl font-bold w-16 text-center">{player.score}</span>
                <button onClick={() => update(origIdx, 1)} className="wobbly-sm w-10 h-10 border-2 border-[var(--border)] bg-[var(--accent)] text-white font-bold text-xl cursor-pointer">+</button>
                <button onClick={() => remove(origIdx)} className="text-[var(--muted-foreground)] hover:text-[var(--accent)] text-lg cursor-pointer">✕</button>
              </div>
            )
          })}
        </div>
      )}

      {players.length > 0 && (
        <div className="text-center mt-6">
          <button onClick={() => setPlayers(p => p.map(pl => ({...pl, score: 0})))}
            className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 font-hand cursor-pointer">🔄 אפסו ניקוד</button>
        </div>
      )}
    </div>
  )
}
