import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'

const PACKS = {
  intro: { label: '🤝 היכרות', desc: 'מסתובבים בחדר ומוצאים אנשים שמתאימים למשבצות.', items: ['מישהו שיש לו אח','מישהו שאוהב פיצה','מישהו שנולד בקיץ','מישהו שיודע לשרוק','מישהו שביקר באילת','מישהו שיודע לבשל','מישהו שאוהב מתמטיקה','מישהו שקרא ספר החודש','מישהו שיודע לרקוד','מישהו שאוהב שוקולד מריר','מישהו שיודע לגלוש','מישהו שהולך עם גרביים שונות','מישהו שיודע להגיד שלום ב-3 שפות','מישהו שאוהב לקום מוקדם','מישהו שיודע לשחק שחמט','מישהו שאוהב גשם','מישהו שנסע לחו"ל','מישהו שיודע לצייר','מישהו שאוהב כלבים','מישהו שיש לו תחביב מוזר','מישהו שאוהב ים','מישהו שיודע לעשות קסם קטן','מישהו שיש לו שם שמתחיל באות מ׳','מישהו שאוהב לקרוא'] },
  birthday: { label: '🎂 יום הולדת', desc: 'בינגו למסיבת יום הולדת, לפני עוגה או בזמן קבלת פנים.', items: ['בלון אדום','נר יום הולדת','עוגת שוקולד','שיר יום הולדת','מתנה עטופה','שקית הפתעה','כובע מסיבה','מישהו שרוקד','מישהו שמצלם','ברכה מצחיקה','ילד יום ההולדת','מישהו שאוהב גלידה','צלחת עם חטיפים','כוס מיץ','מדבקה','קונפטי','משחק קבוצתי','כיסא מקושט','מישהו עם חולצה כחולה','חיוך גדול','עוגה עם סוכריות','מישהו שמוחא כפיים','שולחן מתנות','מוזיקה ברקע'] },
  classroom: { label: '🏫 כיתה', desc: 'בינגו לשיעור, פתיחת שנה, פעילות גיבוש או הפסקה פעילה.', items: ['עיפרון','מחברת','מישהו שאוהב חשבון','מישהו שקרא ספר השבוע','מישהו שיושב ליד החלון','מישהו שאוהב ספורט','לוח מחיק','תיק כחול','מחק','סרגל','מישהו שמביא אוכל מהבית','מישהו שאוהב ציור','מישהו שיודע לשחות','מישהו שהגיע ברגל','ספר עברית','שיעור אהוב','חבר חדש','מורה מחייכת','צלצול להפסקה','שאלה טובה','עבודה בזוגות','צבע ירוק','משימה קבוצתית','מדבקת כוכב'] },
  animals: { label: '🐾 חיות', desc: 'לימוד חיות דרך משחק זיהוי או סימון.', items: ['אריה','פיל','ג׳ירפה','כלב','חתול','דולפין','כריש','צב','נחש','קוף','דבורה','פרפר','ינשוף','סוס','כבשה','עז','תרנגולת','פינגווין','דוב','שועל','צפרדע','עכבר','גמל','נשר'] },
  sports: { label: '⚽ ספורט', desc: 'מעולה להפסקה פעילה, יום ספורט או מסיבת כדורגל.', items: ['כדורגל','כדורסל','שער','סל','שופט','שריקה','נעל ספורט','מדליה','גביע','ריצה','קפיצה','שחייה','מחבט','טניס','כדורעף','אימון','קבוצה','מאמן','אוהדים','מסירה','קליעה','הגנה','ניצחון','תיקו'] },
  holidays: { label: '🎉 חגים', desc: 'מתאים למסיבות חג בכיתה או בבית.', items: ['נרות','סביבון','מסכה','רעשן','דגל','שיר חג','ארוחה משפחתית','ברכה','מתנה','תפוח בדבש','סוכה','מצה','תחפושת','משלוח מנות','לביבה','סופגניה','קישוט','שולחן חג','אורחים','כרטיס ברכה','פרח','יין תירוש','חלה','מנהג'] },
  office: { label: '💼 עבודה', desc: 'בינגו קליל לצוותים, גיבוש וימי הולדת במשרד.', items: ['מישהו ששותה קפה','מישהו שהגיע מוקדם','מישהו עם לפטופ','פגישת זום','מצגת','צמח על השולחן','מישהו שעובד מהבית','מישהו שאוהב אקסל','הפסקת צהריים','בדיחה משרדית','מישהו עם אוזניות','משימה דחופה','יום חמישי','מישהו שאוהב ישיבות','כיסא מסתובב','בקבוק מים','מייל חשוב','צוות חדש','לוח משימות','קוד לבוש','מישהו עם עט כחול','שיחת מסדרון','עוגה במטבח','סיום פרויקט'] },
}

function generateCard(items, size) {
  const need = size * size
  const pool = [...items].sort(() => Math.random() - 0.5)
  return pool.length >= need ? pool.slice(0, need) : Array.from({ length: need }, (_, i) => pool[i % pool.length])
}

function BingoCard({ card, size, title, index }) {
  return (
    <div className="wobbly-md border-2 border-[var(--border)] bg-white p-3 sketch-shadow-sm">
      <h3 className="text-center font-display font-bold mb-2">{title} {index ? '#' + index : ''}</h3>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {card.map((item, i) => <div key={i} className="border border-[var(--border)] text-[10px] p-1 text-center min-h-[54px] flex items-center justify-center leading-tight">{item}</div>)}
      </div>
    </div>
  )
}

export default function BingoMaker() {
  const [mode, setMode] = useState('intro')
  const [size, setSize] = useState(4)
  const [customItems, setCustomItems] = useState([])
  const [freeText, setFreeText] = useState('')
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState(null)

  const currentPack = PACKS[mode] || PACKS.intro
  const needed = size * size
  const suggestionsForMode = mode === 'custom' ? Object.values(PACKS).flatMap(pack => pack.items).slice(0, 80) : []
  const previewCards = useMemo(() => Array.from({ length: 3 }, () => generateCard(currentPack.items, size)), [mode, size, currentPack.items])

  const toggleSuggestion = (item) => setCustomItems(c => c.includes(item) ? c.filter(x => x !== item) : [...c, item])
  const addFreeText = () => {
    const lines = freeText.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length) { setCustomItems(c => [...new Set([...c, ...lines])]); setFreeText('') }
  }
  const removeItem = (item) => setCustomItems(c => c.filter(x => x !== item))
  const canGenerate = mode === 'custom' ? customItems.length >= needed : true
  const generate = () => {
    const source = mode === 'custom' ? customItems : currentPack.items
    setCards(Array.from({ length: 6 }, () => generateCard(source, size)))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="יוצר כרטיסי בינגו" description="צרו כרטיסי בינגו לכל אירוע — עם דוגמאות, הסברים, חבילות נושא ואפשרות מותאמת אישית." path="/tools/bingo-maker" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'בינגו' }]} />

      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl mb-2">🎯 יוצר כרטיסי בינגו</h1>
        <p className="mx-auto max-w-2xl font-hand text-xl text-[var(--muted-foreground)]">בחרו נושא, ראו דוגמה מיד, ואז צרו כרטיסים שונים להדפסה או למשחק בכיתה/מסיבה.</p>
      </div>

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow-rich">
          <h2 className="text-2xl mb-3">איך משחקים?</h2>
          <ol className="grid gap-2 text-sm leading-relaxed">
            <li>1. בוחרים חבילת נושא או כותבים אחת משלכם.</li>
            <li>2. מדפיסים כמה כרטיסים שונים.</li>
            <li>3. המשתתפים מסמנים משבצות כשהם מוצאים/שומעים/רואים את הפריט.</li>
            <li>4. הראשון שמשלים שורה, טור או אלכסון צועק בינגו.</li>
          </ol>
        </div>
        <div className="wobbly border-2 border-[var(--border)] bg-white p-5 sketch-shadow-rich lg:col-span-2">
          <h2 className="text-2xl mb-3">מה יש בנושא הזה?</h2>
          <p className="mb-3 text-[var(--ink)]/75">{mode === 'custom' ? 'במצב מותאם אישית אתם בונים את המאגר לבד מתוך הצעות וכתיבה חופשית.' : currentPack.desc}</p>
          <div className="flex flex-wrap gap-2">
            {(mode === 'custom' ? customItems : currentPack.items).slice(0, 18).map((item) => <Badge key={item} color="yellow">{item}</Badge>)}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {Object.entries(PACKS).map(([k, p]) => <button key={k} onClick={() => { setMode(k); setCards(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${mode === k ? 'bg-[var(--postit)]' : 'bg-white'}`}>{p.label}</button>)}
        <button onClick={() => { setMode('custom'); setCards(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${mode === 'custom' ? 'bg-[var(--postit)]' : 'bg-white'}`}>✏️ מותאם אישית</button>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {[3, 4, 5].map(s => <button key={s} onClick={() => { setSize(s); setCards(null) }} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${size === s ? 'bg-[var(--postit)]' : 'bg-white'}`}>{s}×{s} ({s * s} משבצות)</button>)}
      </div>

      {mode === 'custom' && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mb-6">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="שם הבינגו (אופציונלי)" className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 mb-4" />
          <p className="font-bold mb-2">💡 הצעות — לחצו כדי להוסיף</p>
          <div className="flex flex-wrap gap-2 mb-4 max-h-44 overflow-y-auto">
            {suggestionsForMode.map(item => <button key={item} onClick={() => toggleSuggestion(item)} className={`wobbly-sm border-2 border-[var(--border)] px-3 py-1 text-sm cursor-pointer ${customItems.includes(item) ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}>{customItems.includes(item) ? '✓ ' : '+ '}{item}</button>)}
          </div>
          <p className="font-bold mb-2">✍️ או כתבו בעצמכם (שורה לכל פריט)</p>
          <textarea value={freeText} onChange={e => setFreeText(e.target.value)} rows={3} placeholder="בלון אדום&#10;מישהו שאוהב פיצה&#10;שיר יום הולדת" className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 mb-2" />
          <button onClick={addFreeText} className="wobbly-sm sketch-press border-2 border-dashed border-[var(--border)] px-3 py-1 text-sm cursor-pointer mb-4">+ הוסיפו לרשימה</button>
          <p className="font-bold mb-2">📋 הרשימה שלכם ({customItems.length}/{needed} נדרשים)</p>
          <div className="flex flex-wrap gap-2">
            {customItems.map(item => <span key={item} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-1 text-sm flex items-center gap-1">{item}<button onClick={() => removeItem(item)} className="text-[var(--accent)] cursor-pointer">✕</button></span>)}
          </div>
        </div>
      )}

      {!cards && mode !== 'custom' && (
        <section className="mb-8">
          <h2 className="text-3xl text-center mb-4">ככה הכרטיסיות ייראו</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previewCards.map((card, index) => <BingoCard key={index} card={card} size={size} title={currentPack.label.replace(/^\S+\s/, '')} index={index + 1} />)}
          </div>
        </section>
      )}

      <div className="text-center mb-8">
        <button onClick={generate} disabled={!canGenerate} className="wobbly-md sketch-press min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer disabled:opacity-50 px-8">🎯 צרו 6 כרטיסים!</button>
        {!canGenerate && <p className="mt-2 text-sm text-[var(--accent)]">צריך לפחות {needed} פריטים כדי ליצור כרטיסים מותאמים.</p>}
      </div>

      {cards && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 buga-fade-in">
          {cards.map((card, ci) => <BingoCard key={ci} card={card} size={size} title={title || 'BUGA בינגו'} index={ci + 1} />)}
        </div>
      )}

      {cards && <div className="text-center mt-6"><button onClick={() => window.print()} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--card)] px-6 py-3 font-display font-bold cursor-pointer">🖨️ הדפיסו כרטיסים</button></div>}
    </div>
  )
}
