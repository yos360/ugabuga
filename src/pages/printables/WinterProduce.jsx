import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { PRODUCE_COLORING, PRODUCE_WORKSHEETS, PRODUCE_SHEET_COUNT, ProduceIcon } from '../../components/winterproduce/WinterProduceArt'
import { WINTER_PRODUCE, WINTER_FRUITS, WINTER_VEGETABLES, WINTER_PRODUCE_FAQ } from '../../data/winterProduce'
import { speak } from '../../utils/speak'

// /printables/winter-fruits-vegetables — winter fruits and vegetables in Israel, Hebrew + English:
// a word list with sound, an online fruit-or-vegetable sort, and printable colouring pages and worksheets.
const Card = ({ id, title, children, className = 'bg-white' }) => <section id={id} className={`mb-8 scroll-mt-20 rounded-3xl border-2 border-[var(--border)] ${className} p-5 sketch-shadow`}><h2 className="mb-3 text-3xl font-bold">{title}</h2>{children}</section>

function Sheets({ list, title }) {
  const [print, setPrint] = useState(null)
  return <>
    <div className="mb-4"><button type="button" onClick={() => setPrint(list)} className="min-h-[52px] rounded-2xl bg-pink-600 px-6 text-lg font-bold text-white">🖨️ הדפיסו את כל {list.length} הדפים</button></div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{list.map(item => <button key={item.id} type="button" onClick={() => setPrint([item])} aria-label={`הדפיסו: ${item.name}`} className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
      <div className="aspect-[600/820]"><item.C /></div>
      <p className="mt-1 font-bold">{item.name}{item.age ? <span className="text-sm font-normal"> · {item.age}</span> : null}</p>
    </button>)}</div>
    {print && <PrintPreview title={title} onClose={() => setPrint(null)}>{print.map(item => <article className="buga-a4" key={item.id}><div className="print-art"><item.C /></div></article>)}</PrintPreview>}
  </>
}

function Words({ list }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{list.map(p => <div key={p.id} className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center">
    <ProduceIcon id={p.id} size={84} />
    <b className="mt-1 text-2xl">{p.he}</b>
    <button type="button" onClick={() => speak(p.en, 'en-US')} className="mt-1 min-h-[44px] rounded-xl bg-blue-50 px-3 text-xl font-bold" aria-label={`השמיעו: ${p.en}`}><span dir="ltr">{p.en}</span> 🔊</button>
    <span className="text-sm text-[var(--muted-foreground)]">אומרים: {p.say}</span>
    <span className="mt-1 text-sm">{p.note}</span>
  </div>)}</div>
}

// Online sort: one picture at a time, "fruit" or "vegetable".
const ORDER = ['carrot', 'strawberry', 'broccoli', 'orange', 'beet', 'kiwi', 'cabbage', 'lemon', 'peas', 'clementine', 'cauliflower', 'grapefruit']
function SortGame() {
  const [i, setI] = useState(0), [score, setScore] = useState(0), [answer, setAnswer] = useState(null)
  const p = i < ORDER.length ? WINTER_PRODUCE.find(x => x.id === ORDER[i]) : null
  const restart = () => { setI(0); setScore(0); setAnswer(null) }
  if (!p) return <div className="py-4 text-center" aria-live="polite">
    <p className="text-5xl">{score === ORDER.length ? '🏆' : '⭐'}</p>
    <p className="text-3xl font-bold">{score} מתוך {ORDER.length}</p>
    <button type="button" onClick={restart} className="mt-3 min-h-[48px] rounded-xl bg-blue-600 px-6 font-bold text-white">🔄 עוד פעם</button>
  </div>
  const choose = kind => { if (answer) return; setAnswer(kind); if (kind === p.kind) setScore(s => s + 1) }
  return <div className="text-center">
    <p className="mb-1 text-sm font-bold">{i + 1} מתוך {ORDER.length} · ⭐ {score}</p>
    <div className="flex justify-center"><ProduceIcon id={p.id} size={150} /></div>
    <p className="text-3xl font-bold">{p.he} · <span dir="ltr">{p.en}</span></p>
    <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-3">
      {[['fruit', '🍊 פרי · fruit'], ['veg', '🥕 ירק · vegetable']].map(([k, label]) => <button key={k} type="button" disabled={!!answer} onClick={() => choose(k)}
        className={`min-h-[56px] rounded-2xl border-2 text-xl font-bold ${answer && k === p.kind ? 'border-green-600 bg-green-200' : answer === k ? 'border-red-500 bg-red-100' : 'border-slate-800 bg-white'}`}>{label}</button>)}
    </div>
    {answer && <div className="mt-3" aria-live="polite">
      <p className="text-lg font-bold">{answer === p.kind ? '✅ נכון!' : `❌ ${p.he} ${p.kind === 'fruit' ? 'הוא פרי' : 'הוא ירק'}`}</p>
      <button type="button" onClick={() => { setI(n => n + 1); setAnswer(null) }} className="mt-2 min-h-[48px] rounded-xl bg-blue-600 px-6 font-bold text-white">הבא ←</button>
    </div>}
  </div>
}

const NAV = [['#words', '🔤 המילים'], ['#sort', '🧺 פרי או ירק?'], ['#worksheets', '✏️ דפי עבודה'], ['#coloring', '🖍️ דפי צביעה']]

export default function WinterProduce() {
  return <main className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="פירות וירקות של החורף בעברית ובאנגלית — דפי עבודה להדפסה" description="דפי עבודה ודפי צביעה של פירות וירקות החורף לגן ולכיתות א׳–ג׳: התאמה עברית–אנגלית, כתיבת המילה, מיון פרי או ירק וכרטיסיות — תפוז, תות, ברוקולי וגזר. בחינם." path="/printables/winter-fruits-vegetables" structuredData={faqSchema(WINTER_PRODUCE_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'חורף וגשם', href: '/printables/winter' }, { label: 'פירות וירקות של החורף' }]} />
    <h1 className="mb-2 text-center text-4xl font-black sm:text-5xl">🍊 פירות וירקות של החורף</h1>
    <p className="mb-1 text-center text-xl font-bold" dir="ltr">Winter fruits &amp; vegetables</p>
    <p className="mb-5 text-center text-lg text-[var(--muted-foreground)]">{PRODUCE_SHEET_COUNT} דפים להדפסה בעברית ובאנגלית — צביעה, התאמה, כתיבה, מיון וכרטיסיות. לגן, לכיתות א׳–ג׳ ולמורות לאנגלית.</p>
    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="בדף הזה">{NAV.map(([h, l]) => <a key={h} href={h} className="rounded-full border-2 border-slate-800 bg-white px-4 py-2 font-bold">{l}</a>)}</nav>

    <Card id="words" title="🔤 12 מילים של עונה — לוחצים ושומעים באנגלית" className="bg-orange-50">
      <h3 className="mb-2 text-2xl font-bold">🍊 פירות · <span dir="ltr">Fruits</span></h3>
      <Words list={WINTER_FRUITS} />
      <h3 className="mb-2 mt-6 text-2xl font-bold">🥦 ירקות · <span dir="ltr">Vegetables</span></h3>
      <Words list={WINTER_VEGETABLES} />
    </Card>

    <Card id="sort" title="🧺 פרי או ירק? — משחק מיון" className="bg-green-50"><SortGame /></Card>

    <Card id="worksheets" title="✏️ דפי עבודה להדפסה"><Sheets list={PRODUCE_WORKSHEETS} title="פירות וירקות של החורף — דפי עבודה" /></Card>

    <Card id="coloring" title="🖍️ דפי צביעה" className="bg-yellow-50"><Sheets list={PRODUCE_COLORING} title="פירות וירקות של החורף — דפי צביעה" /></Card>

    <div className="mb-8 flex flex-wrap justify-center gap-3">
      <Link to="/printables/winter" className="rounded-2xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">🌧️ עוד דפי חורף וגשם</Link>
      <Link to="/english/fruits" className="rounded-2xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">🍎 כל הפירות באנגלית</Link>
      <Link to="/speech/language/categories" className="rounded-2xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">🧺 עוד דפי מיון וקטגוריות</Link>
    </div>

    <SeoBody paragraphs={[
      'החורף בישראל הוא עונת ההדרים: תפוזים, קלמנטינות, אשכוליות ולימונים ממלאים את הדוכנים, ולצידם תותים טריים וקיווי. גם הירקות משתנים — כרובית, ברוקולי, כרוב, גזר, סלק ואפונה טרייה. זו הזדמנות טובה לדבר עם הילדים על מה שקונים בשוק עכשיו, ולמה דווקא בעונה הזו.',
      'כל הדפים בעמוד דו־לשוניים: כל ציור מופיע עם השם בעברית ובאנגלית, כך שהם מתאימים גם לפעילות "פירות וירקות" בגן וגם לשיעור אנגלית ראשון. דף ההתאמה מחבר בין המילה בעברית, הציור והמילה באנגלית; דפי הכתיבה מגיעים בשתי רמות — עם מילים לעקוב עליהן ועם בנק מילים; ודף המיון "פרי או ירק?" מתרגל חשיבה בקטגוריות. הכרטיסיות מתאימות למשחק זיכרון, ללוח המילים בכיתה ולתרגול בעל־פה.',
    ]} faq={WINTER_PRODUCE_FAQ} related={[{ label: 'דפי חורף וגשם לגן', href: '/printables/winter' }, { label: 'פירות באנגלית', href: '/english/fruits' }, { label: 'אנגלית לילדים', href: '/english' }, { label: 'קטגוריות ומיון', href: '/speech/language/categories' }, { label: 'דפי צביעה', href: '/printables/coloring' }]} />
  </main>
}
