import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const PACKS = {
  animals: ['אריה','חתול','כלב','דג','ציפור','נחש','פיל','דוב'],
  food: ['פיצה','גלידה','עוגה','בננה','תפוח','שוקולד','לחם','גבינה'],
  school: ['מורה','ספר','מחברת','עט','שולחן','כיסא','לוח','תיק'],
}

const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'

function buildGrid(words, size) {
  const grid = Array.from({length: size}, () => Array(size).fill(null))
  const dirs = [[0,1],[1,0]]
  words.forEach(word => {
    let placed = false, attempts = 0
    while (!placed && attempts < 50) {
      attempts++
      const [dr,dc] = dirs[Math.floor(Math.random()*dirs.length)]
      const maxR = dr ? size - word.length : size - 1
      const maxC = dc ? size - word.length : size - 1
      const r = Math.floor(Math.random() * (maxR+1))
      const c = Math.floor(Math.random() * (maxC+1))
      let ok = true
      for (let i=0;i<word.length;i++) {
        const cell = grid[r+dr*i][c+dc*i]
        if (cell && cell !== word[i]) { ok = false; break }
      }
      if (ok) {
        for (let i=0;i<word.length;i++) grid[r+dr*i][c+dc*i] = word[i]
        placed = true
      }
    }
  })
  for (let r=0;r<size;r++) for (let c=0;c<size;c++) if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random()*LETTERS.length)]
  return grid
}

export default function WordSearchMaker() {
  const [mode, setMode] = useState('animals')
  const [customWords, setCustomWords] = useState(Array(8).fill(''))
  const [grid, setGrid] = useState(null)
  const [words, setWords] = useState([])

  const updateCustom = (i,v) => setCustomWords(w => w.map((x,j)=>j===i?v:x))
  const addField = () => setCustomWords(w => [...w,''])
  const validCustom = customWords.map(w=>w.trim()).filter(Boolean)

  const generate = () => {
    const source = mode === 'custom' ? validCustom : PACKS[mode]
    if (source.length < 4) return
    const size = Math.max(8, Math.max(...source.map(w=>w.length)) + 2)
    setGrid(buildGrid(source, size))
    setWords(source)
  }

  const canGenerate = mode === 'custom' ? validCustom.length >= 4 : true

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title="יוצר תפזורת" description="צרו תפזורת בעברית — חבילות מוכנות או כתבו מילים בעצמכם." path="/tools/word-search-maker" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'תפזורת' }]} />
      <h1 className="text-4xl text-center mb-6">🔍 יוצר תפזורת</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[['animals','🐾 חיות'],['food','🍕 אוכל'],['school','🏫 בית ספר'],['custom','✏️ מותאם אישית']].map(([k,l]) => (
          <button key={k} onClick={() => {setMode(k); setGrid(null)}} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${mode===k?'bg-[var(--postit)]':'bg-white'}`}>{l}</button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mb-6">
          <p className="font-bold mb-2">מילים ({validCustom.length}, מינימום 4)</p>
          <div className="grid sm:grid-cols-2 gap-2 mb-2">
            {customWords.map((w,i) => <input key={i} value={w} onChange={e=>updateCustom(i,e.target.value)} placeholder={`מילה ${i+1}...`} className="wobbly-sm border-2 border-[var(--border)] bg-white px-2 py-1" />)}
          </div>
          <button onClick={addField} className="wobbly-sm sketch-press border-2 border-dashed border-[var(--border)] px-3 py-1 text-sm cursor-pointer">+ הוסיפו מילה</button>
        </div>
      )}

      <div className="text-center mb-8">
        <button onClick={generate} disabled={!canGenerate} className="wobbly-md sketch-press min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer disabled:opacity-50 px-8">🔍 צרו תפזורת!</button>
      </div>

      {grid && (
        <div className="buga-fade-in">
          <div className="wobbly border-2 border-[var(--border)] bg-white p-4 sketch-shadow mb-4 inline-block mx-auto" dir="ltr">
            <div className="grid gap-0.5" style={{gridTemplateColumns: `repeat(${grid.length}, 1fr)`}}>
              {grid.map((row,r) => row.map((letter,c) => (
                <div key={r+'-'+c} className="w-8 h-8 flex items-center justify-center border border-[var(--muted)] font-bold">{letter}</div>
              )))}
            </div>
          </div>
          <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4">
            <p className="font-bold mb-1">מילים לחיפוש:</p>
            <p className="font-hand text-lg">{words.join(' · ')}</p>
          </div>
          <div className="text-center mt-4">
            <button onClick={() => window.print()} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--card)] px-6 py-3 font-display font-bold cursor-pointer">🖨️ הדפיסו</button>
          </div>
        </div>
      )}
    </div>
  )
}
