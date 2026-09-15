import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const PACKS = {
  intro: { label: '🤝 היכרות', items: ['מישהו שיש לו אח','מישהו שאוהב פיצה','מישהו שנולד בקיץ','מישהו שיודע לשרוק','מישהו שביקר באילת','מישהו שיודע לבשל','מישהו שאוהב מתמטיקה','מישהו שקרא ספר החודש','מישהו שיודע לרקוד','מישהו שאוהב שוקולד מריר','מישהו שיודע לגלוש','מישהו שהולך עם גרביים שונות','מישהו שיודע להגיד שלום ב-3 שפות','מישהו שאוהב לקום מוקדם','מישהו שיודע לשחק שחמט','מישהו שאוהב גשם','מישהו שנסע לחו"ל','מישהו שיודע לצייר','מישהו שאוהב כלבים','מישהו שיש לו תחביב מוזר'] },
  birthday: { label: '🎂 יום הולדת', items: ['מישהו שיום ההולדת שלו באותו חודש','מישהו שמעדיף עוגה על גלידה','מישהו שאוהב בלונים','מישהו שיודע לשיר יום הולדת שמח','מישהו שקיבל מתנה מפתיעה','מישהו שאוהב עוגת שוקולד','מישהו שחגג יום הולדת בקיץ','מישהו שאוהב נרות על העוגה','מישהו שחגג יום הולדת בפארק','מישהו שאוהב שקיות הפתעה','מישהו שיודע לקשט עוגה','מישהו שחגג עם המשפחה','מישהו שיש לו יותר מ-3 אחים','מישהו שאוהב ריקודים','מישהו שיש לו חיית מחמד','מישהו שאוהב לצייר'] },
  classroom: { label: '🏫 כיתה', items: ['מישהו שאוהב מתמטיקה','מישהו שהגיע ברגל','מישהו שקרא ספר השבוע','מישהו שיודע את שם המנהל','מישהו שאוהב הפסקות','מישהו שמביא אוכל מהבית','מישהו שאוהב חינוך גופני','מישהו שיושב ליד החלון','מישהו שאוהב לכתוב','מישהו שאוהב חוגים','מישהו שנולד בחודש אחר','מישהו שיש לו עפרון צבעוני','מישהו שאוהב ציור','מישהו שיודע לשחות','מישהו שיש לו תיק כחול','מישהו שאוהב הפסקת אוכל'] },
  wedding: { label: '💍 חתונה', items: ['מישהו שבכה בטקס','מישהו שיודע לרקוד ריקוד ישראלי','מישהו שהכיר את הכלה/חתן בעבודה','מישהו שבא לבד','מישהו שיש לו שמלה/חליפה חדשה','מישהו שאוכל בשר בלבד','מישהו שהגיע ממרחק של שעה+','מישהו שירקוד עד הסוף','מישהו שמכיר את שני הצדדים','מישהו ששר את השיר בקול רם','מישהו שיודע לצלם טוב','מישהו שהביא מתנה מיוחדת'] },
  office: { label: '💼 עבודה', items: ['מישהו שהגיע מוקדם','מישהו ששותה קפה שחור','מישהו שעובד מהבית לרוב','מישהו שיש לו צמח על השולחן','מישהו שאוהב פגישות','מישהו שאוכל ארוחת צהריים ליד המחשב','מישהו שהיה בחברה מעל 5 שנים','מישהו שיודע להכין מצגת מהר','מישהו שאוהב את יום שישי','מישהו שיש לו כינוי בעבודה'] },
  holiday: { label: '🎉 חג', items: ['מישהו שהכין אוכל לחג','מישהו שנסע למשפחה','מישהו שיש לו בגד חדש לחג','מישהו שאוהב את המסורת הזו','מישהו שמדליק נרות','מישהו שיודע שיר של החג','מישהו שמכין תפילה/ברכה','מישהו שמארח השנה','מישהו שאוהב את האוכל המסורתי','מישהו שנוסע לחו"ל בחג'] },
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
  const [customItems, setCustomItems] = useState([])
  const [freeText, setFreeText] = useState('')
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState(null)

  const needed = size * size
  const suggestionsForMode = mode === 'custom' ? PACKS.intro.items.concat(PACKS.birthday.items) : []

  const toggleSuggestion = (item) => {
    setCustomItems(c => c.includes(item) ? c.filter(x=>x!==item) : [...c, item])
  }
  const addFreeText = () => {
    const lines = freeText.split('\n').map(l=>l.trim()).filter(Boolean)
    if (lines.length) { setCustomItems(c => [...new Set([...c, ...lines])]); setFreeText('') }
  }
  const removeItem = (item) => setCustomItems(c => c.filter(x=>x!==item))

  const canGenerate = mode === 'custom' ? customItems.length >= needed : true

  const generate = () => {
    const source = mode === 'custom' ? customItems : PACKS[mode].items
    setCards(Array.from({length: 6}, () => generateCard(source, size)))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in">
      <SEO title="יוצר כרטיסי בינגו" description="צרו כרטיסי בינגו לכל אירוע — יום הולדת, חתונה, כיתה, עבודה, חג. בחרו מהצעות או כתבו בעצמכם." path="/tools/bingo-maker" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'בינגו' }]} />
      <h1 className="text-4xl text-center mb-2">🎯 יוצר כרטיסי בינגו</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">לכל אירוע — או שתמלאו את שלכם</p>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {Object.entries(PACKS).map(([k,p]) => (
          <button key={k} onClick={() => {setMode(k); setCards(null)}} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${mode===k?'bg-[var(--postit)]':'bg-white'}`}>{p.label}</button>
        ))}
        <button onClick={() => {setMode('custom'); setCards(null)}} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${mode==='custom'?'bg-[var(--postit)]':'bg-white'}`}>✏️ מותאם אישית</button>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {[3,4].map(s => (
          <button key={s} onClick={() => setSize(s)} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${size===s?'bg-[var(--postit)]':'bg-white'}`}>{s}×{s} ({s*s} משבצות)</button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mb-6">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="שם הבינגו (אופציונלי)" className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 mb-4" />

          <p className="font-bold mb-2">💡 הצעות — לחצו כדי להוסיף</p>
          <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto">
            {suggestionsForMode.map(item => (
              <button key={item} onClick={() => toggleSuggestion(item)}
                className={`wobbly-sm border-2 border-[var(--border)] px-3 py-1 text-sm cursor-pointer ${customItems.includes(item) ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>
                {customItems.includes(item) ? '✓ ' : '+ '}{item}
              </button>
            ))}
          </div>

          <p className="font-bold mb-2">✍️ או כתבו בעצמכם (שורה לכל פריט)</p>
          <textarea value={freeText} onChange={e=>setFreeText(e.target.value)} rows={3} placeholder="מישהו ש...&#10;מישהו ש..." className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 mb-2" />
          <button onClick={addFreeText} className="wobbly-sm sketch-press border-2 border-dashed border-[var(--border)] px-3 py-1 text-sm cursor-pointer mb-4">+ הוסיפו לרשימה</button>

          <p className="font-bold mb-2">📋 הרשימה שלכם ({customItems.length}/{needed} נדרשים)</p>
          <div className="flex flex-wrap gap-2">
            {customItems.map(item => (
              <span key={item} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-1 text-sm flex items-center gap-1">
                {item}<button onClick={()=>removeItem(item)} className="text-[var(--accent)] cursor-pointer">✕</button>
              </span>
            ))}
          </div>
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
