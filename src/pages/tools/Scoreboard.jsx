import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import ToolGuide from './ToolGuide'
import { TOOL_GUIDES } from './toolGuides'

const guide = TOOL_GUIDES.scoreboard

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
  // Rows stay in the order they were added — re-sorting on every tap moved the row under the finger,
  // so a quick second "+" landed on another player. The leader gets the trophy instead.
  const top = Math.max(...players.map(p => p.score))
  const leader = player => players.length > 1 && player.score === top && players.some(p => p.score < top)
  const ranked = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="לוח ניקוד אונליין — ספירת נקודות למשחקים וטריוויה" description="לוח ניקוד חינמי למשחקים, חידונים וטורנירים: מוסיפים שחקנים או קבוצות, מעדכנים נקודות ב־+ ו־−, והטבלה ממוינת אוטומטית עם גביע למוביל. בלי הרשמה." path="/tools/scoreboard" structuredData={faqSchema(guide.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'לוח ניקוד' }]} />
      <h1 className="text-4xl text-center mb-6">📊 לוח ניקוד</h1>

      <div className="flex gap-2 mb-6">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="שם שחקן/קבוצה..."
          onKeyDown={e => e.key === 'Enter' && addPlayer()}
          className="wobbly-sm flex-1 border-2 border-[var(--border)] bg-white px-4 py-3 text-lg" />
        <button onClick={addPlayer} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--accent)] text-white px-4 py-3 font-bold cursor-pointer">+ הוסיפו</button>
      </div>

      {players.length === 0 ? (
        <p className="text-center font-hand text-lg text-[var(--muted-foreground)]">הוסיפו שחקנים כדי להתחיל</p>
      ) : (
        <div className="grid gap-3">
          {players.map((player, origIdx) => {
            const first = leader(player)
            return (
              <div key={origIdx} className={`wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow-sm flex items-center gap-3 ${first ? 'bg-[var(--postit)] border-[3px]' : ''}`}>
                {first && <span className="text-2xl" aria-label="מוביל/ה">🏆</span>}
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
          {players.length > 1 && <p className="mb-3 font-hand text-lg">דירוג: {ranked.map((p, i) => `${i + 1}. ${p.name} (${p.score})`).join(' · ')}</p>}
          <button onClick={() => setPlayers(p => p.map(pl => ({...pl, score: 0})))}
            className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 font-hand cursor-pointer">🔄 אפסו ניקוד</button>
        </div>
      )}
      <ToolGuide {...guide} />
    </div>
  )
}
