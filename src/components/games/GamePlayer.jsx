import { useState, useEffect, useMemo } from 'react'

const TYPE_LABEL = { prompt:'פתיח משפט', question:'שאלה', category:'קטגוריה', scenario:'תרחיש', situation:'סיטואציה', statement:'משפט', topic:'נושא', challenge:'אתגר' }
const TYPE_COUNTER = { prompt:'פתיח', question:'שאלה', category:'קטגוריה', scenario:'תרחיש', situation:'סיטואציה', statement:'משפט', topic:'נושא', challenge:'אתגר' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] }
  return a
}

export default function GamePlayer({ content, onClose }) {
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

  useEffect(() => { setItems(shuffle(inPack)); setIndex(0); setRevealed(false) }, [inPack])

  const current = items[index]
  if (!current) return null
  const typeWord = TYPE_COUNTER[current.content_type] || 'פריט'

  const go = (delta) => { setRevealed(false); setIndex(i => (i + delta + items.length) % items.length) }
  const reshuffle = () => { setItems(shuffle(inPack)); setIndex(0); setRevealed(false) }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="wobbly border-[3px] border-[var(--border)] bg-[var(--card)] p-6 max-w-xl w-full sketch-shadow-rich" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          {packs.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {packs.map(name => (
                <button key={name} onClick={() => setPack(name)}
                  className={`wobbly-sm border-2 border-[var(--border)] px-3 py-1 text-sm font-bold cursor-pointer ${name===pack ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>
                  {name}
                </button>
              ))}
            </div>
          )}
          <button onClick={onClose} className="text-2xl cursor-pointer">✕</button>
        </div>

        <div className="flex justify-between items-center mb-3">
          <p className="font-hand text-lg text-[var(--muted-foreground)]">{typeWord} {index+1} מתוך {items.length}</p>
          <button onClick={reshuffle} className="wobbly-sm border-2 border-dashed border-[var(--border)] px-3 py-1 font-hand cursor-pointer">🔀 ערבבו</button>
        </div>

        <div className="wobbly-md relative border-2 border-[var(--border)] bg-[var(--postit)] p-6 min-h-40 pin">
          <span className="inline-block wobbly-sm border border-[var(--border)] bg-white px-2 py-0.5 text-xs font-bold">{TYPE_LABEL[current.content_type] || 'תוכן'}</span>
          <p key={current.id} className="buga-fade-in mt-3 text-2xl sm:text-3xl leading-relaxed">{current.content_text}</p>

          {current.answer && (
            <div className="mt-5">
              <button onClick={() => setRevealed(v=>!v)} className={`wobbly-md sketch-press border-[3px] border-[var(--border)] px-5 py-2 font-display font-bold cursor-pointer ${revealed?'bg-white':'bg-[var(--accent)] text-white'}`}>
                {revealed ? 'הסתירו תשובה' : '🎂 גלו תשובה'}
              </button>
              {revealed && (
                <div className="buga-fade-in wobbly-md mt-4 border-2 border-[var(--border)] bg-white p-4">
                  <p className="font-display text-2xl font-bold">{current.answer}</p>
                  {current.answer_explanation && <p className="mt-1 text-lg">{current.answer_explanation}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={() => go(1)} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--pen)] text-white px-5 py-2 font-display font-bold cursor-pointer">הבא ←</button>
          <button onClick={() => go(-1)} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-white px-5 py-2 font-display font-bold cursor-pointer">→ הקודם</button>
        </div>
      </div>
    </div>
  )
}
