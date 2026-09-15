import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const PACKS = {
  intro: ['מישהו שיש לו אח','מישהו שאוהב פיצה','מישהו שנולד בקיץ','מישהו שיודע לשרוק','מישהו שביקר באילת','מישהו שיודע לבשל','מישהו שאוהב מתמטיקה','מישהו שקרא ספר החודש','מישהו שיודע לרקוד','מישהו שאוהב שוקולד מריר','מישהו שיודע לגלוש','מישהו שהולך עם גרביים שונות','מישהו שיודע להגיד שלום ב-3 שפות','מישהו שאוהב לקום מוקדם','מישהו שיודע לשחק שחמט','מישהו שאוהב גשם'],
  birthday: ['מישהו שיום ההולדת שלו באותו חודש','מישהו שמעדיף עוגה על גלידה','מישהו שאוהב בלונים','מישהו שיודע לשיר יום הולדת שמח','מישהו שקיבל מתנה מפתיעה','מישהו שאוהב עוגת שוקולד','מישהו שחגג יום הולדת בקיץ','מישהו שאוהב נרות על העוגה','מישהו שחגג יום הולדת בפארק','מישהו שאוהב שקיות הפתעה','מישהו שיודע לקשט עוגה','מישהו שחגג עם המשפחה','מישהו שיש לו יותר מ-3 אחים','מישהו שאוהב ריקודים','מישהו שיש לו חיית מחמד','מישהו שאוהב לצייר'],
  classroom: ['מישהו שאוהב מתמטיקה','מישהו שהגיע ברגל','מישהו שקרא ספר השבוע','מישהו שיודע את שם המנהל','מישהו שאוהב הפסקות','מישהו שמביא אוכל מהבית','מישהו שאוהב חינוך גופני','מישהו שיושב ליד החלון','מישהו שאוהב לכתוב','מישהו שאוהב חוגים','מישהו שנולד בחודש אחר','מישהו שיש לו עפרון צבעוני','מישהו שאוהב ציור','מישהו שיודע לשחות','מישהו שיש לו תיק כחול','מישהו שאוהב הפסקת אוכל'],
}

function generateCard(items, size) {
  const need = size * size
  const pool = [...items].sort(() => Math.random() - 0.5)
  const chosen = pool.length >= need ? pool.slice(0, need) : Array.from({length: need}, (_,i) => pool[i % pool.length])
  return chosen
}

export default function BingoMaker() {
  const [mode, setMode] = useState('intro')
  const [size, setSize] = useState(4)
  const [customItems, setCustomItems] = useState(Array(16).fill(''))
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState(null)

  const updateCustom = (i, v) => setCustomItems(c => c.map((x,j) => j===i?v:x))
  const addCustomField = () => setCustomItems(c => [...c, ''])

  const validCustom = customItems.map(x => x.trim()).filter(Boolean)
  const needed = size * size
  const canGenerate = mode === 'custom' ? validCustom.length >= needed : true

  const generate = () => {
    const source = mode === 'custom' ? validCustom : PACKS[mode]
    const newCards = Array.from({length: 6}, () => generateCard(source, size))
    setCards(newCards)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in">
      <SEO title="יוצר כרטיסי בינגו" description="צרו כרטיסי בינגו — חבילות מוכנות או כתבו בעצמכם. 6 כרטיסים ייחודיים להדפסה." path="/tools/bingo-maker" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'בינגו' }]} />
      <h1 className="text-4xl text-center mb-6">🎯 יוצר כרטיסי בינגו</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {[['intro','🤝 היכרות'],['birthday','🎂 יום הולדת'],['classroom','🏫 כיתה'],['custom','✏️ מותאם אישית']].map(([k,l]) => (
          <button key={k} onClick={() => {setMode(k); setCards(null)}} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${mode===k?'bg-[var(--postit)]':'bg-white'}`}>{l}</button>
        ))}
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {[3,4].map(s => (
          <button key={s} onClick={() => setSize(s)} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${size===s?'bg-[var(--postit)]':'bg-white'}`}>{s}×{s} ({s*s} משבצות)</button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mb-6">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="שם הבינגו (אופציונלי)" className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 mb-3" />
          <p className="font-bold mb-2">פריטים ({validCustom.length}/{needed} נדרשים)</p>
          <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto mb-2">
            {customItems.map((v,i) => (
              <input key={i} value={v} onChange={e=>updateCustom(i,e.target.value)} placeholder={`פריט ${i+1}...`} className="wobbly-sm border-2 border-[var(--border)] bg-white px-2 py-1 text-sm" />
            ))}
          </div>
          <button onClick={addCustomField} className="wobbly-sm sketch-press border-2 border-dashed border-[var(--border)] px-3 py-1 text-sm cursor-pointer">+ הוסיפו פריט</button>
        </div>
      )}

      <div className="text-center mb-8">
        <button onClick={generate} disabled={!canGenerate}
          className="wobbly-md sketch-press min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer disabled:opacity-50 px-8">
          🎯 צרו כרטיסים!
        </button>
      </div>

      {cards && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 buga-fade-in">
          {cards.map((card, ci) => (
            <div key={ci} className="wobbly-md border-2 border-[var(--border)] bg-white p-3 sketch-shadow-sm">
              <h3 className="text-center font-display font-bold mb-2">{title || 'BUGA בינגו'} #{ci+1}</h3>
              <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${size}, 1fr)`}}>
                {card.map((item, i) => (
                  <div key={i} className="border border-[var(--border)] text-[10px] p-1 text-center min-h-[50px] flex items-center justify-center leading-tight">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {cards && (
        <div className="text-center mt-6">
          <button onClick={() => window.print()} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--card)] px-6 py-3 font-display font-bold cursor-pointer">🖨️ הדפיסו כרטיסים</button>
        </div>
      )}
    </div>
  )
}
