import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

// Two themed memory games on one small engine: cards match by `key`, so a pair can be two different
// faces (a letter and a picture that starts with it). No timer, no score pressure.

// Letter → a word that starts with it, each with an emoji anyone recognizes.
const LETTERS = [['א', 'אריה', '🦁'], ['ב', 'בננה', '🍌'], ['ג', 'גזר', '🥕'], ['ד', 'דג', '🐟'], ['ה', 'היפופוטם', '🦛'], ['ו', 'ורד', '🌹'], ['ז', 'זברה', '🦓'], ['ח', 'חתול', '🐱'], ['ט', 'טלפון', '📞'], ['י', 'ירח', '🌙'], ['כ', 'כדור', '⚽'], ['ל', 'לימון', '🍋'], ['מ', 'מטוס', '✈️'], ['נ', 'נמר', '🐯'], ['ס', 'סוס', '🐴'], ['ע', 'עוגה', '🎂'], ['פ', 'פיל', '🐘'], ['צ', 'צב', '🐢'], ['ק', 'קוף', '🐵'], ['ר', 'רכבת', '🚂'], ['ש', 'שמש', '☀️'], ['ת', 'תפוח', '🍎']]
const SENIOR_THEMES = {
  flowers: { label: 'פרחים וטבע', items: ['🌹', '🌻', '🌷', '🌼', '🌵', '🍀', '🌳', '🍁', '🌺', '🌸', '🌲', '🍄'] },
  fruits: { label: 'פירות וירקות', items: ['🍎', '🍊', '🍇', '🍉', '🍓', '🍒', '🍋', '🍌', '🥕', '🍅', '🥒', '🌽'] },
  home: { label: 'בבית', items: ['☕', '🫖', '🕯️', '📻', '📚', '🧶', '🪑', '🛏️', '🔑', '⏰', '📷', '✉️'] },
  animals: { label: 'בעלי חיים', items: ['🐶', '🐱', '🐦', '🐟', '🐴', '🐮', '🐑', '🐓', '🦋', '🐢', '🐘', '🦒'] },
}
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const letterDeck = n => shuffle(shuffle(LETTERS).slice(0, n).flatMap(([l, w, e]) => [{ key: l, kind: 'letter', face: l }, { key: l, kind: 'pic', face: e, label: w }]))
const emojiDeck = (items, n) => shuffle(shuffle(items).slice(0, n).flatMap(e => [{ key: e, face: e }, { key: e, face: e }]))

function Board({ makeDeck, sizes, big, peekMs, labelOf }) {
  const [pairs, setPairs] = useState(sizes[0])
  const [cards, setCards] = useState(() => makeDeck(sizes[0]).map((c, i) => ({ ...c, id: i })))
  const [open, setOpen] = useState([])
  const [done, setDone] = useState(() => new Set())
  const [turns, setTurns] = useState(0)
  const [peek, setPeek] = useState(true)
  const timer = useRef(0)
  useEffect(() => { if (!peek) return undefined; const t = setTimeout(() => setPeek(false), peekMs + pairs * 150); return () => clearTimeout(t) }, [peek, pairs, peekMs])
  useEffect(() => () => clearTimeout(timer.current), [])
  const start = n => { clearTimeout(timer.current); setPairs(n); setCards(makeDeck(n).map((c, i) => ({ ...c, id: i }))); setOpen([]); setDone(new Set()); setTurns(0); setPeek(true) }
  const flip = i => {
    if (peek || open.length === 2 || open.includes(i) || done.has(i)) return
    const now = [...open, i]
    setOpen(now)
    if (now.length < 2) return
    setTurns(t => t + 1)
    const [a, b] = now
    if (cards[a].key === cards[b].key) { setDone(d => new Set([...d, a, b])); setOpen([]) }
    else timer.current = setTimeout(() => setOpen([]), big ? 1500 : 950)
  }
  const won = done.size === cards.length
  const cols = cards.length <= 12 ? (big ? 3 : 4) : cards.length <= 16 ? 4 : big ? 4 : 5
  return <div>
    <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
      {sizes.map(n => <button key={n} type="button" onClick={() => start(n)} className={`min-h-12 rounded-xl border-2 px-4 font-bold ${big ? 'text-xl' : ''} ${n === pairs ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white'}`}>{n} זוגות</button>)}
      <span className={`rounded-xl bg-slate-100 px-3 py-2 font-bold ${big ? 'text-xl' : ''}`}>תורות: {turns} · נמצאו {done.size / 2}/{pairs}</span>
    </div>
    {peek && <p className={`mb-2 text-center font-bold text-violet-800 ${big ? 'text-2xl' : 'text-lg'}`}>👀 הסתכלו טוב — עוד רגע הקלפים מתהפכים</p>}
    <div className="mx-auto grid max-w-3xl gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {cards.map((c, i) => {
        const shown = peek || open.includes(i) || done.has(i)
        return <button key={c.id} type="button" onClick={() => flip(i)} aria-label={shown ? labelOf(c) : `קלף סגור ${i + 1}`}
          className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-[3px] transition ${shown ? (done.has(i) ? 'border-emerald-500 bg-emerald-50' : 'border-violet-500 bg-white') : 'border-violet-700 bg-violet-600 hover:bg-violet-500'}`}>
          {shown ? <>
            <span className={c.kind === 'letter' ? 'text-5xl font-black sm:text-7xl' : big ? 'text-6xl sm:text-7xl' : 'text-5xl sm:text-6xl'}>{c.face}</span>
            {c.label && <span className="text-base font-bold sm:text-xl">{c.label}</span>}
          </> : <span className="text-4xl font-black text-white/80">?</span>}
        </button>
      })}
    </div>
    {won && <div className="mx-auto mt-4 max-w-md rounded-2xl border-[3px] border-emerald-500 bg-emerald-50 p-4 text-center">
      <div className={`font-black ${big ? 'text-3xl' : 'text-2xl'}`}>🎉 כל הכבוד! כל הזוגות נמצאו</div>
      <p className="text-lg">ב־{turns} תורות. משחק מושלם לוקח {pairs} תורות.</p>
      <button type="button" onClick={() => start(pairs)} className="mt-2 min-h-12 rounded-xl bg-violet-700 px-6 text-lg font-bold text-white">משחק חדש</button>
    </div>}
  </div>
}

export function MemoryLetters() {
  return <div className="mx-auto max-w-4xl px-3 py-8 sm:px-4" dir="rtl">
    <SEO title="משחק זיכרון אותיות — מתאימים אות לתמונה, אונליין בחינם" description="משחק זיכרון אותיות לילדים: מחפשים זוגות של אות ותמונה שמתחילה בה — א לאריה, ב לבננה. מתאים לגן ולכיתה א׳, בלי הרשמה." path="/online-games/memory-letters" structuredData={faqSchema(FAQ_LETTERS)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים אונליין', href: '/online-games' }, { label: 'משחק זיכרון אותיות' }]} />
    <h1 className="text-center text-3xl font-black sm:text-5xl">🔤 משחק זיכרון אותיות</h1>
    <p className="mx-auto mb-5 mt-2 max-w-2xl text-center text-lg text-slate-600">כל זוג הוא אות ותמונה שמתחילה בה: <b>א</b> ו־🦁 אריה. הופכים שני קלפים — מצאתם אות ואת התמונה שלה? הם נשארים פתוחים.</p>
    <Board makeDeck={letterDeck} sizes={[4, 6, 8, 10]} peekMs={1800} labelOf={c => (c.kind === 'letter' ? `האות ${c.face}` : c.label)} />
    <div className="mt-10"><SeoBody paragraphs={['משחק זיכרון האותיות מחבר בין שני דברים שילדים בגן ובכיתה א׳ לומדים בדיוק עכשיו: לזהות את צורת האות, ולשמוע באיזה צליל מתחילה מילה. במקום שתי תמונות זהות, כל זוג כאן הוא אות ותמונה של מילה שמתחילה בה — וכדי למצוא את הזוג צריך גם לזכור איפה הקלף וגם לדעת לאיזו אות הוא שייך.', 'מתחילים עם 4 זוגות, ומי שמצליח עובר ל־6, 8 ו־10. כדאי לשחק יחד עם הילד ולומר בקול את שם האות ואת המילה בכל פעם שנמצא זוג: ״בּ — בננה!״.']} faq={FAQ_LETTERS} related={[{ label: 'משחק הזיכרון הקלאסי', href: '/online-games/memory' }, { label: 'לומדים אותיות', href: '/letters' }, { label: 'משחק זיכרון להדפסה', href: '/printables/memory-game' }]} /></div>
  </div>
}

export function MemorySeniors() {
  const [theme, setTheme] = useState('flowers')
  return <div className="adults mx-auto max-w-4xl px-3 py-8 sm:px-4" dir="rtl">
    <SEO title="משחקי זיכרון לגיל השלישי — קלפים גדולים, בחינם ובלי הרשמה" description="משחק זיכרון למבוגרים ולגיל השלישי: קלפים גדולים וברורים, בלי שעון ובלי לחץ, 3 עד 8 זוגות. פרחים, פירות, בעלי חיים וחפצים מהבית. בחינם." path="/adults/memory" structuredData={faqSchema(FAQ_SENIORS)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'פנאי למבוגרים', href: '/adults' }, { label: 'משחק זיכרון' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl">🧠 משחק זיכרון בקלפים גדולים</h1>
    <p className="mx-auto mb-4 mt-2 max-w-2xl text-center text-xl text-slate-700">הופכים שני קלפים ומחפשים שתי תמונות זהות. אין שעון ואין מהירות — משחקים בקצב שלכם.</p>
    <div className="mb-4 flex flex-wrap justify-center gap-2">{Object.entries(SENIOR_THEMES).map(([k, t]) => <button key={k} type="button" onClick={() => setTheme(k)} className={`min-h-14 rounded-xl border-[3px] px-5 text-xl font-bold ${k === theme ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white'}`}>{t.items[0]} {t.label}</button>)}</div>
    <Board key={theme} makeDeck={n => emojiDeck(SENIOR_THEMES[theme].items, n)} sizes={[3, 4, 6, 8]} big peekMs={3000} labelOf={c => c.face} />
    <div className="mt-10"><SeoBody paragraphs={['משחק זיכרון הוא דרך נעימה להעסיק את הראש: צריך לשים לב, לזכור מיקומים ולהתרכז לכמה דקות. כאן הקלפים גדולים, התמונות ברורות ואין שעון — אפשר להתחיל ב־3 זוגות ולהתקדם לאט עד 8. אפשר לשחק לבד, או עם הנכדים על אותו מסך, כל אחד בתורו.', 'רוצים גם משהו על הנייר? באזור הפנאי למבוגרים יש תשבצים להדפסה באותיות גדולות ומנדלות לצביעה.']} faq={FAQ_SENIORS} related={[{ label: 'תשבצים למבוגרים', href: '/adults/crosswords' }, { label: 'מנדלות לצביעה', href: '/adults/mandalas' }, { label: 'פינת סבא וסבתא', href: '/adults/grandparents' }]} /></div>
    <p className="mt-6 text-center text-lg"><Link to="/adults" className="underline">← חזרה לפנאי למבוגרים</Link></p>
  </div>
}

const FAQ_LETTERS = [
  { q: 'לאיזה גיל מתאים משחק זיכרון האותיות?', a: 'בעיקר לגן חובה ולכיתה א׳ — לילדים שמכירים חלק מהאותיות. ילדים צעירים יותר יכולים לשחק עם הורה שאומר את שם האות בקול.' },
  { q: 'איך יודעים שמצאתי זוג?', a: 'זוג הוא אות ותמונה של מילה שמתחילה בה: ש ו־☀️ שמש, ת ו־🍎 תפוח. כשמוצאים זוג, שני הקלפים נצבעים בירוק ונשארים פתוחים.' },
  { q: 'אפשר להדפיס משחק זיכרון?', a: 'כן — באתר יש משחק זיכרון להדפסה עם 10 זוגות, שגוזרים ומשחקים על השולחן.' },
]
const FAQ_SENIORS = [
  { q: 'האם המשחק מתאים לגיל השלישי?', a: 'כן. הקלפים גדולים, אין מגבלת זמן, הקלפים נשארים פתוחים יותר זמן בתחילת המשחק ואחרי טעות, ואפשר להתחיל בשלושה זוגות בלבד.' },
  { q: 'האם משחקי זיכרון מונעים ירידה בזיכרון?', a: 'משחק זיכרון הוא פעילות נעימה שמעסיקה את הריכוז והקשב, אבל הוא לא טיפול ואין להבטיח שהוא מונע ירידה בזיכרון. כל שאלה על זיכרון כדאי לברר עם רופא המשפחה.' },
  { q: 'צריך להירשם או לשלם?', a: 'לא. המשחק חינמי לגמרי, בלי הרשמה ובלי להוריד שום דבר. עובד במחשב, בטאבלט ובטלפון.' },
]
