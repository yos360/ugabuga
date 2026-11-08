import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import { LEARN_CRUMB } from './LearnPages'
import { MT_PAGES, QUIZ_META, mixedQuiz } from './multiplicationTable'
import './learn.css'
import './multiplication-table.css'

// A mixed test on the tables 1..max (default 1–6, grades 3–4). Online with instant checking, or printed
// as a test sheet plus an answer key. The first render uses a fixed seed (prerender-safe); new tests are random.
const MAXES = [3, 4, 5, 6, 8, 10]
const rnd = () => Math.floor(Math.random() * 1e9)
const L = props => <T {...props} direction="ltr" />
const A4 = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>

export function QuizSheet({ items, max, answers }) {
  const half = Math.ceil(items.length / 2)
  return <Sheet label={`בוחן לוח הכפל 1–${max}`}>
    <T x={100} y={14} size={9} weight={900}>{answers ? `תשובות — בוחן לוח הכפל 1–${max}` : `בוחן לוח הכפל 1–${max}`}</T>
    {!answers && <T x={100} y={23} size={4.5}>שם: ______________   תאריך: __________   ציון: ___ מתוך {items.length}</T>}
    {items.map((e, i) => {
      const col = i < half ? 0 : 1, row = col ? i - half : i, x = col ? 52 : 148, y = 44 + row * 19
      return <g key={i}><L x={x - 38} y={y} size={4} fill="#888">{`${i + 1}.`}</L><L x={x} y={y} size={7.4}>{`${e.a} × ${e.b} = ${answers ? e.v : '_____'}`}</L></g>
    })}
    {!answers && <T x={100} y={252} size={4.5} fill="#555">טיפ: תרגיל שלא זוכרים — מחליפים סדר. 6 × 4 זה בדיוק כמו 4 × 6</T>}
  </Sheet>
}

const FAQ = [
  { q: 'אילו לוחות כלולים בבוחן?', a: 'כברירת מחדל כל הלוחות מ-1 עד 6, בסדר מעורבב, ובכל פעם 20 תרגילים אחרים. כשהטווח מגיע ל-5 ומעלה התרגילים הקלים של כפול 1 לא נכללים, כדי שהבוחן יבדוק משהו. אפשר לבחור טווח קטן יותר (עד 3, 4 או 5) או גדול יותר (עד 8 או עד 10).' },
  { q: 'איך מדפיסים את הבוחן עם תשובות?', a: 'לוחצים על "הדפסת הבוחן". מתקבלים שני דפי A4: דף בוחן עם מקום לשם, לתאריך ולציון, ודף תשובות למורה או להורה. "בוחן חדש" יוצר בכל לחיצה בוחן אחר, כך שאפשר לתת לתלמידים בוחנים שונים.' },
  { q: 'לאיזו כיתה הבוחן מתאים?', a: 'לכיתות ג׳–ד׳, שבהן מתחזקים את השליטה בלוח הכפל. אפשר להשתמש בו גם בסוף כיתה ב׳ לטווח קטן, או לתגבור בכיתות גבוהות יותר.' },
  { q: 'אפשר לתת את הבוחן בזמן מוגבל?', a: 'כן. מקובל לתת בערך 5 דקות ל-20 תרגילים. תלמיד ששולט בלוח עונה על רובם בפחות מדקה וחצי; מי שעוד סופר על האצבעות ימשיך להתאמן בלוחות הבודדים ובאתגר הדקה.' },
]

export default function MultiplicationQuiz() {
  const [max, setMax] = useState(6)
  const [seed, setSeed] = useState(1)
  const [ans, setAns] = useState({})
  const [checked, setChecked] = useState(false)
  const [print, setPrint] = useState(false)
  const qs = mixedQuiz(max, seed)
  const right = qs.filter((q, i) => Number(ans[i]) === q.v).length
  const fresh = (m = max) => { setMax(m); setSeed(rnd()); setAns({}); setChecked(false) }
  const meta = QUIZ_META
  return <div className="mx-auto max-w-4xl px-4 py-6 buga-fade-in" dir="rtl">
    <SEO title={meta.title} description={meta.description} path={meta.path} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: MT_PAGES.main.crumb, href: MT_PAGES.main.path }, { label: meta.crumb }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-1"><span aria-hidden="true">📝 </span>{meta.h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">20 תרגילים מעורבבים, בדיקה מיידית ובוחן להדפסה עם דף תשובות</p>
    <div className="flex flex-wrap justify-center items-center gap-2 mb-4" role="group" aria-label="טווח הלוחות">
      <span className="font-bold">לוחות 1 עד:</span>
      {MAXES.map(m => <button key={m} type="button" className="ln-chip" aria-pressed={max === m} onClick={() => fresh(m)}>{m}</button>)}
    </div>
    <div className="ln-box">
      <div className="mt-quiz">{qs.map((q, i) => {
        const ok = checked && Number(ans[i]) === q.v
        return <label key={`${seed}-${max}-${i}`} className={`mt-q ${checked ? (ok ? 'ok' : 'no') : ''}`}>
          <span>{`${q.a} × ${q.b} =`}</span>
          <input value={ans[i] ?? ''} inputMode="numeric" maxLength={3} aria-label={`${q.a} כפול ${q.b}`} onChange={e => { setAns(s => ({ ...s, [i]: e.target.value.replace(/\D/g, '') })); setChecked(false) }} />
          {checked && !ok && <small>{q.v}</small>}
        </label>
      })}</div>
      {checked && <p className="text-center text-2xl font-black mt-3" aria-live="polite">{right === qs.length ? `🌟 ${right} מתוך ${qs.length} — מושלם!` : `${right} מתוך ${qs.length}${right >= qs.length * 0.8 ? ' — כמעט!' : ''}`}</p>}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button type="button" className="ln-btn go" onClick={() => setChecked(true)}>✓ בדיקה</button>
        <button type="button" className="ln-btn alt" onClick={() => fresh()}>🔁 בוחן חדש</button>
        <button type="button" className="ln-btn alt" onClick={() => setPrint(true)}>🖨️ הדפסת הבוחן</button>
      </div>
    </div>
    {print && <PrintPreview title={`בוחן לוח הכפל 1–${max}`} onClose={() => setPrint(false)}
      onRefresh={() => setSeed(rnd())}
      variant={i => { const v = mixedQuiz(max, rnd()); return [<A4 key={`q${i}`}><QuizSheet items={v} max={max} /></A4>, <A4 key={`a${i}`}><QuizSheet items={v} max={max} answers /></A4>] }}>
      {[<A4 key="q"><QuizSheet items={qs} max={max} /></A4>, <A4 key="a"><QuizSheet items={qs} max={max} answers /></A4>]}
    </PrintPreview>}
    <section className="mt-section">
      <h2>איך משתמשים בבוחן?</h2>
      <SeoBody paragraphs={[
        'הבוחן בנוי מתרגילים מכל הלוחות מ-1 עד 6 בערבוביה, כמו בבוחן בכיתה: לא לפי סדר הלוח, אלא 4 × 6 אחרי 3 × 3 ואחרי 6 × 5. כך רואים אם הילד באמת זוכר את התרגיל או רק מדקלם את הלוח מההתחלה.',
        'כדאי לתת את הבוחן בלי עזרים, לבדוק, ואז לרשום את התרגילים שהתבלבלו בהם. את אלה מתרגלים בלוח של המספר עצמו, עם הטריקים והבוחן הקצר שבעמוד שלו. אחרי שבוע אפשר לתת בוחן חדש ולראות שיפור.',
        'למורים: כל לחיצה על "בוחן חדש" מייצרת סדר תרגילים אחר, ואפשר להדפיס כמה בוחנים שונים לשורות שונות בכיתה, כל אחד עם דף תשובות משלו.',
      ]} faq={FAQ} related={[
        { label: MT_PAGES.main.h1, href: MT_PAGES.main.path },
        { label: 'אתגר לוח הכפל בדקה', href: '/learn/times-tables' },
        { label: 'בלש לוח הכפל', href: '/learn/multiplication-table/game' },
        { label: 'משחק לוח הכפל — מסלול השלבים', href: '/learn/multiplication-game' },
        { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' },
      ]} />
    </section>
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      <Link to={MT_PAGES.main.path} className="ln-btn alt inline-flex items-center">✖️ ללוח הכפל הצבעוני ←</Link>
    </div>
  </div>
}
