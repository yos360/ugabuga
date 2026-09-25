import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

const TYPE_LABEL = { prompt:'פתיח משפט', question:'שאלה', category:'קטגוריה', scenario:'תרחיש', situation:'סיטואציה', statement:'משפט', topic:'נושא', challenge:'אתגר' }
const TYPE_COUNTER = { prompt:'פתיח', question:'שאלה', category:'קטגוריה', scenario:'תרחיש', situation:'סיטואציה', statement:'משפט', topic:'נושא', challenge:'אתגר' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] }
  return a
}

function detectTruth(answer = '') {
  const normalized = String(answer).toLowerCase()
  if (normalized.includes('buga') || normalized.includes('בוגה') || normalized.includes('שקר') || normalized.includes('לא נכון')) return false
  if (normalized.includes('אמת') || normalized.includes('נכון')) return true
  return null
}

export default function GamePlayer({ content, onClose, title = 'אמת או בוגה' }) {
  const packs = useMemo(() => {
    const seen = []
    content.forEach(c => { if (!seen.includes(c.pack_name)) seen.push(c.pack_name) })
    return seen
  }, [content])

  const [pack, setPack] = useState(packs[0] || '')
  const inPack = useMemo(() => content.filter(c => c.pack_name === pack), [content, pack])
  const [items, setItems] = useState(inPack)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [guess, setGuess] = useState(null)
  const [activeTeam, setActiveTeam] = useState(0)
  const [teams, setTeams] = useState([
    { name: 'קבוצה א׳', score: 0 },
    { name: 'קבוצה ב׳', score: 0 },
  ])

  useEffect(() => { setItems(shuffle(inPack)); setIndex(0); setRevealed(false); setGuess(null) }, [inPack])

  const current = items[index]
  if (!current) return null
  const typeWord = TYPE_COUNTER[current.content_type] || 'פריט'
  const truthValue = detectTruth(current.answer)
  const isTruthBuga = truthValue !== null

  const go = (delta) => {
    setRevealed(false)
    setGuess(null)
    setIndex(i => (i + delta + items.length) % items.length)
    setActiveTeam(t => (t + 1) % teams.length)
  }
  const reshuffle = () => { setItems(shuffle(inPack)); setIndex(0); setRevealed(false); setGuess(null) }
  const resetScore = () => setTeams(t => t.map(team => ({ ...team, score: 0 })))

  const answerTruthBuga = (choice) => {
    if (!isTruthBuga || guess !== null) return
    const correct = choice === truthValue
    setGuess({ choice, correct })
    setRevealed(true)
    if (correct) {
      setTeams(list => list.map((team, i) => i === activeTeam ? { ...team, score: team.score + 1 } : team))
    }
  }

  // Portal to <body>: an ancestor with a transform (e.g. the page's fade-in while it runs)
  // would otherwise turn this fixed overlay into a box inside the page column.
  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/75 p-2 sm:p-4" onClick={onClose}>
      <div className="mx-auto flex h-full max-w-7xl flex-col rounded-[2rem] border-[4px] border-[var(--border)] bg-[var(--paper)] p-3 sketch-shadow-rich sm:p-5" onClick={e => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
          <div>
            <p className="hidden font-hand text-sm text-[var(--muted-foreground)] sm:block">מצב תחרותי</p>
            <h2 className="text-xl sm:text-4xl">{title}</h2>
          </div>
          <button onClick={onClose} aria-label="סגירה" className="wobbly-sm shrink-0 border-2 border-[var(--border)] bg-white px-3 py-1 text-xl cursor-pointer sm:px-4 sm:py-2 sm:text-2xl">✕</button>
        </div>

        <div className="mb-2 grid grid-cols-[minmax(0,1fr)] gap-2 sm:mb-3 sm:gap-3 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
          <div className="wobbly border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm sm:p-3">
            <h3 className="mb-2 hidden text-xl sm:block">ניקוד</h3>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {teams.map((team, i) => (
                <div key={i} className={`rounded-2xl border-2 border-[var(--border)] px-2 py-1 sm:px-3 sm:py-2 ${i === activeTeam ? 'bg-[var(--postit)] sketch-shadow-sm' : 'bg-[var(--card)]'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <input value={team.name} onChange={(event) => setTeams(list => list.map((item, idx) => idx === i ? { ...item, name: event.target.value } : item))} className="min-w-0 flex-1 bg-transparent font-bold outline-none" />
                    <strong>{team.score}</strong>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={resetScore} className="mt-3 hidden wobbly-sm sm:inline-block border-2 border-[var(--border)] bg-white px-3 py-1 text-sm font-bold">אפסו ניקוד</button>
          </div>

          <div className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-2 text-center sketch-shadow-sm sm:p-3">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
              {packs.map(name => (
                <button key={name} onClick={() => setPack(name)} className={`wobbly-sm shrink-0 border-2 border-[var(--border)] px-3 py-1 text-sm font-bold cursor-pointer ${name===pack ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>{name}</button>
              ))}
              <button onClick={reshuffle} className="wobbly-sm shrink-0 border-2 border-dashed border-[var(--border)] bg-white px-3 py-1 font-hand cursor-pointer">🔀 ערבבו</button>
            </div>
            <p className="mt-1 font-hand text-base text-[var(--muted-foreground)] sm:mt-2 sm:text-lg">{typeWord} {index+1} מתוך {items.length}</p>
          </div>

          <div className="hidden wobbly border-2 border-[var(--border)] bg-white p-3 text-center sketch-shadow-sm sm:block">
            <h3 className="text-xl">תור עכשיו</h3>
            <p className="mt-2 text-2xl font-bold">{teams[activeTeam]?.name}</p>
          </div>
        </div>

        <main className="relative flex min-h-0 flex-1 overflow-y-auto rounded-[1.5rem] border-[3px] border-[var(--border)] bg-white p-3 sketch-shadow-rich sm:rounded-[2rem] sm:border-[4px] sm:p-4">
          {/* m-auto (not items-center) keeps long text reachable by scrolling instead of clipped at the top */}
          <div className="m-auto max-w-5xl text-center">
            <p className="mb-2 text-sm font-bold text-[var(--muted-foreground)] sm:hidden">תור: {teams[activeTeam]?.name}</p>
            <span className="inline-block wobbly-sm border border-[var(--border)] bg-[var(--postit)] px-3 py-1 text-sm font-bold">{TYPE_LABEL[current.content_type] || 'תוכן'}</span>
            <p key={current.id} className="buga-fade-in mt-3 text-2xl leading-snug min-[400px]:text-3xl sm:mt-6 sm:text-6xl sm:leading-relaxed">{current.content_text}</p>

            {isTruthBuga ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
                <button onClick={() => answerTruthBuga(true)} disabled={guess !== null} className="wobbly-md sketch-press min-h-[64px] border-[4px] border-[var(--border)] bg-[#4caf50] px-4 py-3 font-display text-2xl sm:min-h-[88px] sm:px-8 sm:py-4 sm:text-4xl font-bold text-white disabled:opacity-70">אמת ✅</button>
                <button onClick={() => answerTruthBuga(false)} disabled={guess !== null} className="wobbly-md sketch-press min-h-[64px] border-[4px] border-[var(--border)] bg-[var(--accent)] px-4 py-3 font-display text-2xl sm:min-h-[88px] sm:px-8 sm:py-4 sm:text-4xl font-bold text-white disabled:opacity-70">בוגה ❌</button>
              </div>
            ) : current.answer && (
              <button onClick={() => setRevealed(v=>!v)} className={`wobbly-md sketch-press mt-8 border-[3px] border-[var(--border)] px-6 py-3 font-display text-2xl font-bold cursor-pointer ${revealed?'bg-white':'bg-[var(--accent)] text-white'}`}>{revealed ? 'הסתירו תשובה' : '🎂 גלו תשובה'}</button>
            )}

            {revealed && current.answer && (
              <div className={`buga-fade-in mx-auto mt-6 max-w-3xl wobbly-md border-2 border-[var(--border)] p-5 ${guess?.correct ? 'bg-[#4caf50] text-white' : guess && !guess.correct ? 'bg-[var(--postit)]' : 'bg-[var(--postit)]'}`}>
                {guess && <p className="text-2xl font-bold">{guess.correct ? 'נכון! נקודה לקבוצה 🎉' : 'לא הפעם — אין נקודה'}</p>}
                <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">{current.answer}</p>
                {current.answer_explanation && <p className="mt-2 text-xl">{current.answer_explanation}</p>}
              </div>
            )}
          </div>
        </main>

        <div className="mt-3 flex justify-center gap-3 sm:mt-4">
          <button onClick={() => go(1)} className="wobbly-md sketch-press flex-1 whitespace-nowrap border-[3px] border-[var(--border)] bg-[var(--pen)] text-white px-4 py-2 sm:flex-none sm:px-8 sm:py-3 font-display text-xl font-bold cursor-pointer">הבא ←</button>
          <button onClick={() => go(-1)} className="wobbly-md sketch-press flex-1 whitespace-nowrap border-[3px] border-[var(--border)] bg-white px-4 py-2 sm:flex-none sm:px-8 sm:py-3 font-display text-xl font-bold cursor-pointer">→ הקודם</button>
        </div>
      </div>
    </div>
  , document.body)
}
