import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import { KERESH_JOKES, KERESH_CATEGORIES, categoryOf, jokesIn, randomJoke, jokeShareText } from '../../data/content/kereshJokes'
import '../../learn/learn.css'
import './keresh.css'

const PATH = '/jokes/keresh'
const SITE = 'https://ugabuga.co.il'
const TOTAL = KERESH_JOKES.length

const FAQ = [
  { q: 'מה זה בדיחת קרש?', a: 'בדיחת קרש היא בדיחה קצרה, בדרך כלל שאלה ותשובה, שהפאנץ׳ שלה נשען על משחק מילים: מילה עם שתי משמעויות, או שתי מילים שנשמעות כמעט אותו דבר. היא כל כך צפויה ו"שטוחה", שהשומעים נאנחים — ובסוף בכל זאת מחייכים.' },
  { q: 'לאיזה גיל מתאימות בדיחות הקרש בדף?', a: 'רובן מתאימות לגילאי 6–12. בדיחות כמו "איזו אות גרה בגן החיות?" ילדים בגן כבר מבינים, ובדיחות על "שָׂבֵעַ" או "ברקיע השביעי" מצחיקות יותר מכיתה ג׳ בערך. ליד בדיחות שקשה יותר להבין יש כפתור "למה זה מצחיק?" עם הסבר קצר.' },
  { q: 'איך מספרים בדיחת קרש נכון?', a: 'שואלים את השאלה, מחכים כמה שניות שכולם ינסו לנחש, ורק אז אומרים את התשובה — בפנים רציניות לגמרי. אם כולם נאנחו "אוףףף", הבדיחה הצליחה.' },
  { q: 'אפשר להדפיס את הבדיחות?', a: `כן. כפתור ההדפסה מכין דף מסודר עם כל ${TOTAL} הבדיחות והתשובות, לפי נושאים — מתאים לפינת בדיחה בכיתה, למסיבת יום הולדת או לתיבת הפתעות בקייטנה. אפשר גם לשמור כ־PDF.` },
  { q: 'הבדיחות מתאימות לכיתה ולגן?', a: 'כן. כל הבדיחות נקיות: בלי העלבות, בלי לעג לאנשים ובלי דברים מגעילים. אפשר לספר אותן מול כל הכיתה, ואפילו מול סבתא.' },
]

const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>

function share(j) {
  shareOnWhatsApp(jokeShareText(j, shareLink(PATH, 'keresh_joke')))
}

function JokeCard({ j, open, onToggle }) {
  const [why, setWhy] = useState(false)
  return <li className="kr-card">
    <span className="kr-num" aria-hidden="true">{j.n}</span>
    <div className="kr-body">
      <p className="kr-setup">{j.setup}</p>
      {open
        ? <p className="kr-punch">😂 {j.punchline}</p>
        : <button type="button" className="kr-reveal" onClick={onToggle} aria-label={`גלו את התשובה לבדיחה ${j.n}`}>👀 גלו את התשובה</button>}
      {open && <div className="kr-actions">
        {j.hint && <button type="button" className="kr-mini" aria-expanded={why} onClick={() => setWhy(!why)}>💡 למה זה מצחיק?</button>}
        <button type="button" className="kr-mini" onClick={() => share(j)} aria-label={`שליחת בדיחה ${j.n} בוואטסאפ`}>💬 שליחה בוואטסאפ</button>
      </div>}
      {open && why && j.hint && <p className="kr-hint">{j.hint}</p>}
    </div>
  </li>
}

export function KereshJokes() {
  const [cat, setCat] = useState('')
  const [all, setAll] = useState(false)
  const [opened, setOpened] = useState(() => new Set())
  const [rand, setRand] = useState(null)
  const [randOpen, setRandOpen] = useState(false)
  const [printing, setPrinting] = useState(false)
  const list = jokesIn(cat)
  const isOpen = j => all || opened.has(j.n)
  const toggle = n => setOpened(prev => { const s = new Set(prev); s.add(n); return s })
  const toggleAll = () => { if (all) setOpened(new Set()); setAll(!all) }
  const pickRandom = () => { setRand(randomJoke(KERESH_JOKES, rand?.n)); setRandOpen(false) }

  const schema = [faqSchema(FAQ), {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'בדיחות קרש לילדים',
    'description': `${TOTAL} בדיחות קרש נקיות לילדים בעברית, עם תשובות, לפי נושאים.`,
    'inLanguage': 'he',
    'url': SITE + PATH,
    'isPartOf': { '@type': 'CollectionPage', 'name': 'בדיחות לפי נושא', 'url': `${SITE}/jokes/topics` },
  }]

  return <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`בדיחות קרש לילדים — ${TOTAL} בדיחות קרש מצחיקות עם תשובות`} description={`${TOTAL} בדיחות קרש לילדים בעברית: משחקי מילים, "מה אמר ה…" ושאלות מצחיקות על חיות, אוכל ובית ספר. תשובה בלחיצה, בדיחה אקראית והדפסה לכיתה.`} path={PATH} structuredData={schema} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בדיחות לפי נושא', href: '/jokes/topics' }, { label: 'בדיחות קרש' }]} />

    <header className="text-center">
      <div className="text-6xl" aria-hidden="true">🪵😂</div>
      <h1 className="mt-2 text-4xl sm:text-5xl font-hand font-bold">בדיחות קרש לילדים — {TOTAL} בדיחות קרש מצחיקות</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg">בדיחות קרש הן הבדיחות שכולם נאנחים מהן — ואז צוחקים. שאלה קצרה, תשובה עם משחק מילים בעברית, ופרצוף רציני לגמרי. אספנו כאן {TOTAL} בדיחות קרש נקיות לילדים, לפי נושאים, עם התשובות.</p>
    </header>

    <section className="ln-box kr-random no-print mt-6 text-center" aria-labelledby="kr-rand-title">
      <h2 id="kr-rand-title" className="text-2xl font-black">🎲 בדיחה אקראית</h2>
      {rand ? <div className="mt-2" aria-live="polite">
        <p className="kr-setup">{rand.setup}</p>
        {randOpen ? <p className="kr-punch">😂 {rand.punchline}</p>
          : <button type="button" className="kr-reveal" onClick={() => setRandOpen(true)}>👀 גלו את התשובה</button>}
      </div> : <p className="m-0 mt-1">לחצו וקבלו בדיחת קרש מתוך כל ה־{TOTAL}.</p>}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button type="button" className="ln-btn" onClick={pickRandom}>{rand ? '🎲 עוד בדיחה' : '🎲 בדיחה אקראית'}</button>
        {rand && <button type="button" className="ln-btn alt" onClick={() => share(rand)}>💬 שליחה בוואטסאפ</button>}
      </div>
    </section>

    <section className="no-print mt-6" aria-label="סינון לפי נושא">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="נושא">
        <Chip on={!cat} onClick={() => setCat('')}>הכול ({TOTAL})</Chip>
        {KERESH_CATEGORIES.map(c => <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}><span aria-hidden="true">{c.emoji}</span> {c.label} ({jokesIn(c.id).length})</Chip>)}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" className="ln-chip" aria-pressed={all} onClick={toggleAll}>{all ? '🙈 הסתרת התשובות' : '👀 גלו את כל התשובות'}</button>
        <button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ הדפסה לכיתה ולמסיבה</button>
      </div>
    </section>

    <h2 className="mt-8 mb-3 text-center text-2xl font-black">{cat ? `${categoryOf(cat).emoji} בדיחות קרש: ${categoryOf(cat).label}` : `כל ${TOTAL} בדיחות הקרש`}</h2>
    <ol className="kr-list">{list.map(j => <JokeCard key={j.n} j={j} open={isOpen(j)} onToggle={() => toggle(j.n)} />)}</ol>

    {printing && <PrintPreview title="בדיחות קרש לילדים" onClose={() => setPrinting(false)}>
      <article className="buga-flow kr-print" dir="rtl">
        <h2>🪵 {TOTAL} בדיחות קרש לילדים</h2>
        <p className="kr-print-sub">שואלים, מחכים רגע — ורק אז מגלים את התשובה.</p>
        {KERESH_CATEGORIES.map(c => <section key={c.id}>
          <h3>{c.emoji} {c.label}</h3>
          <ol start={jokesIn(c.id)[0].n}>{jokesIn(c.id).map(j => <li key={j.n}><b>{j.setup}</b><br />{j.punchline}</li>)}</ol>
        </section>)}
      </article>
    </PrintPreview>}

    <section className="mt-10 space-y-4">
      <h2 className="text-2xl font-black">מה זה בדיחות קרש, ולמה ילדים כל כך אוהבים אותן?</h2>
      <p className="leading-relaxed">בדיחת קרש היא בדיחה שכולם רואים מגיעה מקילומטר: שאלה תמימה כמו "איזה פרי הדובים הכי אוהבים?", ותשובה שמבוססת על משחק מילים — "דובדבן!". התגובה הקלאסית היא אנחה גדולה או "אוףףף", ובדיוק בזה הכיף. ילדים מגיל 6 בערך מתחילים לגלות שלמילה אחת יכולות להיות שתי משמעויות, ובדיחות קרש הן הדרך הכי מצחיקה לשחק עם הגילוי הזה.</p>
      <p className="leading-relaxed">העברית מושלמת לבדיחות קרש: יש בה מילים שנכתבות אותו דבר ונשמעות קצת אחרת (בָּצָל ובְּצֵל, גֶּזֶר וגָּזַר), מילים שמסתתרות בתוך מילים אחרות (דוב בתוך דובדבן, חבר בתוך מחברת), ואותיות ששמן הוא מילה (כף, קוף, דלת). כל הבדיחות בדף נכתבו או נבחרו כך שהמשחק יעבוד בעברית — לא תרגום של בדיחות מאנגלית שמאבדות את הפאנץ׳ בדרך.</p>
      <h3 className="text-xl font-bold">איך מספרים בדיחת קרש</h3>
      <ul className="list-disc space-y-1 pr-6">
        <li><b>פנים רציניות.</b> בדיחת קרש עובדת הכי טוב כשמספרים אותה כאילו זה הדבר הכי חכם בעולם.</li>
        <li><b>הפסקה קטנה.</b> שואלים, נותנים לכולם כמה שניות לנחש — ורק אז עונים.</li>
        <li><b>האנחה היא המחמאה.</b> אם כולם אמרו "אוףףף", הצלחתם. אפשר להוסיף מיד עוד אחת.</li>
        <li><b>להסביר בלי להתבייש.</b> ילדים קטנים לפעמים לא מכירים אחת המשמעויות. כפתור "למה זה מצחיק?" עוזר להסביר — ולמדנו מילה חדשה.</li>
      </ul>
      <h3 className="text-xl font-bold">לאיזה גיל</h3>
      <p className="leading-relaxed">בגן ובכיתה א׳ הכי עובדות בדיחות האותיות והחיות ("איזו אות פותחים כשנכנסים הביתה?"). בכיתות ב׳–ד׳ ילדים כבר נהנים ממשחקי מילים כמו "מלון" או "בצל". מכיתה ה׳ ומעלה מגיע התור של הביטויים — "ברקיע השביעי", "להוציא שפן מהכובע" — ושל ההנאה הכי גדולה: להמציא בדיחות קרש לבד. נסו לבחור מילה עם שתי משמעויות ולבנות סביבה שאלה.</p>
    </section>

    <div className="mt-10"><SeoBody faq={FAQ} related={[
      { label: 'בדיחות לפי נושא', href: '/jokes/topics' },
      { label: 'משחקי מילים בעברית', href: '/jokes/wordplay' },
      { label: 'מחולל בדיחות אקראיות', href: '/tools/joke' },
      { label: 'חידות לפי נושא', href: '/riddles/topics' },
      { label: 'שאלות טריוויה עם תשובות', href: '/trivia/with-answers' },
    ]} /></div>

    <p className="no-print mt-6 text-center"><Link to="/jokes/topics" className="font-bold underline">לעוד בדיחות לילדים לפי נושא ←</Link></p>
  </div>
}
