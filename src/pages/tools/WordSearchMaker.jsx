import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'

const PACKS = {
  animals: ['אריה','חתול','כלב','דג','ציפור','נחש','פיל','דוב'],
  food: ['פיצה','גלידה','עוגה','בננה','תפוח','שוקולד','לחם','גבינה'],
  school: ['מורה','ספר','מחברת','עט','שולחן','כיסא','לוח','תיק'],
}

const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'

function buildGrid(words, size) {
  let grid = Array.from({length: size}, () => Array(size).fill(null))
  let failed = false
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
    if(!placed) failed=true
  })
  // A complete, solvable grid is preferable to silently omitting target words.
  if(failed){grid=Array.from({length:size},()=>Array(size).fill(null));const rows=Array.from({length:size},(_,i)=>i);for(let i=rows.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]]}words.forEach((word,i)=>{const offset=Math.floor(Math.random()*(size-word.length+1));[...word].forEach((letter,c)=>{grid[rows[i]][offset+c]=letter})})}
  for (let r=0;r<size;r++) for (let c=0;c<size;c++) if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random()*LETTERS.length)]
  return grid
}

export default function WordSearchMaker() {
  const [mode, setMode] = useState('animals')
  const [customWords, setCustomWords] = useState(Array(8).fill(''))
  const [grid, setGrid] = useState(null)
  const [words, setWords] = useState([])
  const [printing, setPrinting] = useState(false)
  const [error,setError] = useState('')

  const updateCustom = (i,v) => setCustomWords(w => w.map((x,j)=>j===i?v:x))
  const addField = () => setCustomWords(w => [...w,''])
  const validCustom = [...new Set(customWords.map(w=>w.normalize('NFKD').replace(/[\u0591-\u05C7\s־-]/g,'')).filter(Boolean))]

  const generate = () => {
    const source = mode === 'custom' ? validCustom : PACKS[mode]
    if (source.length < 4) return
    if(source.length>20||source.some(word=>word.length>18||!/^[א-ת]+$/.test(word))){setError('בחרו עד 20 מילים בעברית, באורך עד 18 אותיות כל אחת.');return}
    setError('')
    const size = Math.max(8, source.length, Math.max(...source.map(w=>w.length)) + 2)
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
        {error&&<p role="alert" className="mb-3 text-red-700">{error}</p>}
        <button onClick={generate} disabled={!canGenerate} className="wobbly-md sketch-press min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer disabled:opacity-50 px-8">🔍 צרו תפזורת!</button>
      </div>

      {grid && (
        <div className="buga-fade-in">
          <div className="wobbly border-2 border-[var(--border)] bg-white p-2 sketch-shadow mb-4 max-w-full overflow-x-auto" dir="rtl">
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
            <button onClick={() => setPrinting(true)} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--card)] px-6 py-3 font-display font-bold cursor-pointer">🖨️ הדפיסו</button>
          </div>
        </div>
      )}
      {printing&&grid&&<PrintPreview title="התפזורת שלי" onClose={()=>setPrinting(false)}><article className="buga-a4"><h2>התפזורת שלי</h2><p>חפשו מימין לשמאל ומלמעלה למטה</p><div className="print-art"><svg viewBox={`0 0 ${grid.length*35} ${grid.length*35}`} role="img" aria-label="לוח תפזורת">{grid.flatMap((row,r)=>row.map((letter,c)=><g key={r+'-'+c}><rect x={(grid.length-1-c)*35} y={r*35} width="35" height="35" fill="white" stroke="#777"/><text x={(grid.length-1-c)*35+17.5} y={r*35+24} textAnchor="middle" fontSize="22" fontFamily="Heebo,Arial" fill="#111">{letter}</text></g>))}</svg></div><p style={{textAlign:'center',fontSize:16}}>{words.join(' · ')}</p><footer>עוגה בוגה · ugabuga.co.il</footer></article></PrintPreview>}
    </div>
  )
}
