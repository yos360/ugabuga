import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import MiniHanukkiah from '../../components/hanukkah/MiniHanukkiah'
import { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { wrapLines } from '../../data/hanukkahLighting'
import { MATH_GRADES, MATH_PROBLEMS, GAME_MODES, gameQuestion, parseAnswer } from '../../data/hanukkahMath'

// /holidays/hanukkah/math: Hanukkah word problems for grades 1–6 (solve on screen with feedback, or
// print with a separate answer sheet) and a dreidel maths game in three levels.
const PATH = '/holidays/hanukkah/math'
const INK = '#1e3a8a', GOLD = '#b7791f'

function Lines({ lines, y, size = 4.7, gap = 6.4, weight = 500, fill = '#111' }) {
  return lines.map((l, i) => <T key={i} x={190} y={y + i * gap} size={size} anchor="start" weight={weight} fill={fill}>{l}</T>)
}

// Problems stacked down the page; `key` adds the worked solution under each one.
function ProblemSheet({ grade, answers }) {
  const g = MATH_GRADES.find(x => x.id === grade)
  const blocks = MATH_PROBLEMS[grade].reduce((out, p, i) => {
    const lines = wrapLines(`${i + 1}. ${p.q}`, 66)
    const sol = answers ? wrapLines(`${p.sol} תשובה: ${p.a.toLocaleString('en-US')}${p.unit === '%' ? '%' : p.unit ? ` ${p.unit}` : ''}`, 74) : []
    const prev = out[out.length - 1]
    const top = prev ? prev.top + prev.lines.length * 6.4 + (answers ? prev.sol.length * 5.6 + 6 : 16) : 50
    return [...out, { p, lines, sol, top }]
  }, [])
  return <Sheet label={`חשבון של חנוכה — ${g.label}${answers ? ' — פתרונות' : ''}`}>
    <rect x="5" y="5" width="190" height="260" rx="7" fill="none" stroke={INK} strokeWidth="0.8" />
    <g transform="translate(14 36) scale(0.22)"><MiniHanukkiah x={0} y={0} w={160} lit={8} color /></g>
    <T x="100" y="20" size="10" weight="800" fill={INK}>{answers ? 'פתרונות — חשבון של חנוכה' : 'חשבון של חנוכה'}</T>
    <T x="100" y="29" size="5" weight="700" fill={GOLD}>{`${g.label} · ${g.topic}`}</T>
    {!answers && <T x="190" y="40" size="4.2" anchor="start">שם: ____________________</T>}
    {blocks.map(({ p, lines, sol, top }) => <g key={p.id}>
      <Lines lines={lines} y={top} />
      {answers
        ? <Lines lines={sol} y={top + lines.length * 6.4} size="4.1" gap="5.6" weight={400} fill={INK} />
        : <T x="190" y={top + lines.length * 6.4 + 3} size="4.2" anchor="start" fill="#555">{`תרגיל: ______________   תשובה: ________ ${p.unit === '%' ? '%' : p.unit}`}</T>}
    </g>)}
  </Sheet>
}

// The on-screen version: one input per problem, check, and the worked solution on request.
function ProblemCard({ p, n }) {
  const [value, setValue] = useState(''), [state, setState] = useState(null), [shown, setShown] = useState(false)
  const check = e => {
    e.preventDefault()
    const v = parseAnswer(value)
    setState(v === null ? 'empty' : v === p.a ? 'right' : 'wrong')
  }
  return <li className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow-sm">
    <p className="mb-3 text-lg leading-relaxed"><b>{n}.</b> {p.q}</p>
    <form onSubmit={check} className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 font-bold">תשובה:
        <input inputMode="decimal" value={value} onChange={e => { setValue(e.target.value); setState(null) }} className="w-28 rounded-xl border-2 border-[var(--border)] px-3 py-2 text-center text-lg" aria-label={`תשובה לשאלה ${n}`} />
        {p.unit && <span>{p.unit}</span>}
      </label>
      <button type="submit" className="min-h-[44px] rounded-xl bg-blue-700 px-4 font-bold text-white">בדיקה</button>
      <button type="button" onClick={() => setShown(s => !s)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] px-4 font-bold">{shown ? 'הסתרת הפתרון' : 'איך פותרים?'}</button>
    </form>
    <p aria-live="polite" className="mt-2 min-h-[1.5rem] font-bold">
      {state === 'right' && <span className="text-green-700">✅ נכון מאוד!</span>}
      {state === 'wrong' && <span className="text-red-700">❌ עוד לא. נסו שוב, או לחצו על "איך פותרים?"</span>}
      {state === 'empty' && <span className="text-amber-700">כתבו מספר בתיבה.</span>}
    </p>
    {shown && <p className="rounded-xl bg-blue-50 p-3">{p.sol} <b>התשובה: {p.a.toLocaleString('en-US')}{p.unit === '%' ? '%' : p.unit ? ` ${p.unit}` : ''}</b></p>}
  </li>
}

function DreidelFace({ letter, spinning }) {
  return <svg viewBox="0 0 100 120" className={`mx-auto h-28 w-24 ${spinning ? 'motion-safe:animate-spin' : ''}`} role="img" aria-label={letter ? `הסביבון נפל על ${letter}` : 'סביבון'}>
    <rect x="44" y="4" width="12" height="22" rx="4" fill="#b7791f" stroke="#111" strokeWidth="2" />
    <path d="M18 26 H82 V74 L50 114 L18 74 Z" fill="#60a5fa" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
    <text x="50" y="66" fontSize="40" fontWeight="800" textAnchor="middle" fill="#fff" stroke="#111" strokeWidth="1.2">{spinning ? '' : letter || '?'}</text>
  </svg>
}

function DreidelGame() {
  const [mode, setMode] = useState('pot'), [round, setRound] = useState(null), [spinning, setSpinning] = useState(false)
  const [value, setValue] = useState(''), [state, setState] = useState(null), [score, setScore] = useState({ right: 0, tries: 0 })
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const info = GAME_MODES.find(m => m.id === mode)
  const spin = () => {
    setSpinning(true); setState(null); setValue('')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setRound(gameQuestion(mode)); setSpinning(false) }, 700)
  }
  const changeMode = m => { setMode(m); setRound(null); setState(null); setValue(''); setScore({ right: 0, tries: 0 }) }
  const check = e => {
    e.preventDefault()
    const v = parseAnswer(value)
    if (v === null || !round || state === 'right') return
    const ok = v === round.a
    setState(ok ? 'right' : 'wrong')
    setScore(s => ({ right: s.right + (ok ? 1 : 0), tries: s.tries + 1 }))
  }
  return <section id="dreidel-game" className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5">
    <h2 className="mb-2 text-center text-3xl font-bold">🎲 משחק סביבון של חשבון</h2>
    <Choice label="רמת המשחק" value={mode} onChange={changeMode} options={GAME_MODES.map(m => [m.id, `${m.label} (${m.grades})`])} />
    <p className="mx-auto mt-3 max-w-2xl text-center">{info.rule}</p>
    <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
      {(round?.letters.length > 1 && !spinning ? round.letters : [round?.letters[0]]).map((l, i) => <DreidelFace key={i} letter={l} spinning={spinning} />)}
    </div>
    <div className="mt-2 text-center">
      <button type="button" onClick={spin} disabled={spinning} className="min-h-[52px] rounded-2xl bg-orange-500 px-8 text-xl font-bold text-white disabled:opacity-60">{round ? 'סיבוב נוסף' : 'סובבו את הסביבון'}</button>
    </div>
    {round && !spinning && <form onSubmit={check} className="mx-auto mt-4 max-w-xl text-center">
      <p className="mb-3 text-xl font-bold leading-relaxed">{round.q}</p>
      <input inputMode="numeric" value={value} onChange={e => { setValue(e.target.value); if (state === 'wrong') setState(null) }} aria-label="התשובה שלכם" className="w-32 rounded-xl border-2 border-[var(--border)] px-3 py-2 text-center text-2xl" />
      <button type="submit" className="mr-2 min-h-[48px] rounded-xl bg-blue-700 px-5 text-lg font-bold text-white">בדיקה</button>
      <p aria-live="polite" className="mt-3 min-h-[1.75rem] text-lg font-bold">
        {state === 'right' && <span className="text-green-700">✅ נכון! {round.sol}. סובבו שוב.</span>}
        {state === 'wrong' && <span className="text-red-700">❌ כמעט. בדקו שוב את החשבון.</span>}
      </p>
    </form>}
    {score.tries > 0 && <p className="mt-2 text-center font-bold">תשובות נכונות: {score.right} מתוך {score.tries} ניסיונות</p>}
  </section>
}

const FAQ = [
  { q: 'לאילו כיתות מתאימים דפי החשבון לחנוכה?', a: 'לכיתות א׳ עד ו׳. לכל כיתה יש 6 בעיות מילוליות לפי מה שלומדים בה: חיבור וחיסור עד 20 בכיתה א׳, כפל וחילוק בכיתה ג׳, שברים וממוצע בכיתה ה׳, אחוזים ויחס בכיתה ו׳.' },
  { q: 'יש פתרונות?', a: 'כן. בהדפסה יוצאים שני דפים: דף הבעיות עם מקום לתרגיל ולתשובה, ודף פתרונות עם דרך הפתרון של כל בעיה. גם במסך אפשר לבדוק תשובה וללחוץ "איך פותרים?".' },
  { q: 'כמה נרות מדליקים בכל חנוכה?', a: '36 נרות בלי השמש: 1+2+3+4+5+6+7+8. עם שמש בכל ערב צריך 44 נרות, ולכן קופסת נרות לחנוכה מכילה בדרך כלל 44 נרות.' },
  { q: 'איך משחקים במשחק הסביבון של החשבון?', a: 'בוחרים רמה ולוחצים "סובבו את הסביבון". בכיתות א׳–ב׳ מחשבים כמה מטבעות יש אחרי ג׳, ה׳ או ש׳; בכיתות ג׳–ד׳ כופלים את ערך האות במספר הערב; ובכיתות ה׳–ו׳ מחברים שלוש אותיות בגימטריה.' },
  { q: 'מה הגימטריה של אותיות הסביבון?', a: 'נ=50, ג=3, ה=5, ש=300, ובסביבון של ארץ ישראל פ=80. נ+ג+ה+ש = 358, ונ+ג+ה+פ = 138.' },
  { q: 'צריך להירשם?', a: 'לא. הכול בחינם ובלי הרשמה, ולא שומרים שום פרט על הילדים.' },
]

export default function HanukkahMath() {
  const [grade, setGrade] = useState('g3'), [print, setPrint] = useState(false)
  const g = MATH_GRADES.find(x => x.id === grade)
  return <HanukkahShell crumb="חשבון של חנוכה">
    <SEO title="חשבון של חנוכה — בעיות מילוליות ודפי עבודה לכיתות א׳–ו׳" description="דפי עבודה בחשבון לחנוכה לכיתות א׳–ו׳: בעיות מילוליות עם נרות, סופגניות ודמי חנוכה, עם בדיקה במסך, דף פתרונות להדפסה ומשחק סביבון של חיבור, כפל וגימטריה. בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🧮 חשבון של חנוכה לכיתות א׳–ו׳</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">בעיות מילוליות עם נרות, סופגניות, דמי חנוכה וסביבונים — לפי כיתה. פותרים במסך עם בדיקה, או מדפיסים דף עבודה ודף פתרונות. ובסוף: משחק סביבון של חשבון.</p>

    <div className="mx-auto mb-6 max-w-3xl wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-sm">
      <Choice label="בחירת כיתה" value={grade} onChange={setGrade} options={MATH_GRADES.map(x => [x.id, x.label])} />
      <p className="mt-3 text-center font-bold">{g.label}: {g.topic}</p>
    </div>

    <div className="mb-6 text-center">
      <button data-print-main type="button" onClick={() => setPrint(true)} className="min-h-[52px] rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white">🖨️ הדפסת דף העבודה ודף הפתרונות</button>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">2 דפי A4 · חינם, בלי הרשמה · <a href="#dreidel-game" className="underline">למשחק הסביבון ↓</a></p>
    </div>

    <h2 className="mb-3 text-2xl font-bold">✏️ בעיות מילוליות לחנוכה — {g.label}</h2>
    <ol className="mb-10 list-none space-y-4 p-0">
      {MATH_PROBLEMS[grade].map((p, i) => <ProblemCard key={p.id} p={p} n={i + 1} />)}
    </ol>

    <DreidelGame />

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5">
      <h2 className="mb-2 text-2xl font-bold">🕯️ כמה נרות מדליקים בחנוכה?</h2>
      <p className="text-lg leading-relaxed">בערב הראשון נר אחד, ובכל ערב מוסיפים נר: 1+2+3+4+5+6+7+8. טריק החיבור: מחברים את הקטן ביותר עם הגדול ביותר — 1+8, 2+7, 3+6, 4+5 — ומקבלים ארבעה זוגות של 9, כלומר <b>36 נרות</b>. עם שמש בכל אחד משמונת הערבים מוסיפים עוד 8, ובסך הכול <b>44 נרות</b>.</p>
    </section>

    {print && <PrintPreview title={`חשבון של חנוכה — ${g.label}`} onClose={() => setPrint(false)}>
      {[false, true].map(answers => <article className="buga-a4" key={String(answers)}><div className="print-art"><ProblemSheet grade={grade} answers={answers} /></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לחנוכה: <Link className="font-bold underline" to="/holidays/hanukkah/worksheets">דפי עבודה לגן ולכיתה א׳</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/sevivon">סביבון וירטואלי</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/quiz">חידון חנוכה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'חשבון של חנוכה מחבר את מה שלומדים בכיתה עם מה שקורה בבית בחג: סופרים נרות, מחלקים סופגניות, מחשבים דמי חנוכה ומשחקים בסביבון. לכל כיתה מא׳ ועד ו׳ יש שש בעיות מילוליות לפי תוכנית הלימודים — מחיבור וחיסור עד 20 בכיתה א׳, דרך כפל וחילוק ובעיות בשני שלבים, ועד שברים, ממוצע, אחוזים ויחס בכיתות ה׳–ו׳.',
      'כל בעיה אפשר לפתור במסך ולקבל משוב מיד, ואם נתקעים — לראות את דרך הפתרון. להדפסה יוצא דף עבודה עם מקום לתרגיל ולתשובה, ודף פתרונות נפרד למורה או להורה. משחק הסביבון מוסיף תרגול קצר ומהיר בשלוש רמות: חיבור וחיסור עם הקופה, לוח הכפל עם ערבי החג, וגימטריה של אותיות הסביבון.',
    ]} faq={FAQ} related={[{ label: 'דפי עבודה לחנוכה', href: '/holidays/hanukkah/worksheets' }, { label: 'חנוכה לפי כיתה', href: '/holidays/hanukkah/grade/grade-3' }, { label: 'משחק לוח הכפל', href: '/learn/multiplication-game' }, { label: 'חנוכה לילדים', href: '/holidays/hanukkah' }]} /></div>
  </HanukkahShell>
}
