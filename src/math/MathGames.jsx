import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import NotFound from '../pages/NotFound'
import { gradeInfo } from './registry'
import { GAME_GRADES, gamesPath, parseGamesGrade, gameTopics, makeGameQuestion } from './games'
import '../learn/learn.css'
import './math.css'

// /math/games and /math/games/grade-N: online math games by grade (Keyword Planner, 27.11.2026:
// "משחקי חשבון לכיתה א/ב" 1K–10K a month each). Questions come from the same generators as the
// practice pages, so every game follows the grade's curriculum.
const HOME = { label: 'ראשי', href: '/' }
const HUB = { label: 'מתמטיקה', href: '/math' }
const GAMES = { label: 'משחקי חשבון', href: '/math/games' }
const label = n => gradeInfo(n).label
const newSeed = () => Math.floor(Math.random() * 2 ** 31) + 1

const MODES = [
  { id: 'race', emoji: '⏱️', name: 'מרוץ דקה', text: 'כמה תרגילים תפתרו בדקה אחת?' },
  { id: 'climb', emoji: '🧗', name: 'בוגה מטפס להר', text: '10 תרגילים, 3 לבבות. כל תשובה נכונה מעלה את בוגה שלב.' },
  { id: 'balloons', emoji: '🎈', name: 'בלוני תשובות', text: 'פוצצו את הבלון עם התשובה הנכונה לפני שהוא עף.' },
]
const LEVELS = [[1, 'קל'], [2, 'בינוני'], [3, 'מאתגר']]

function readBest(key) { try { return Number(localStorage.getItem(key)) || 0 } catch { return 0 } }
function saveBest(key, v) { try { if (v > readBest(key)) localStorage.setItem(key, String(v)) } catch { /* ignore */ } }

function Question({ q, picked, onPick, balloons }) {
  return <div className="ln-box mt-4 text-center">
    <p className="text-xl font-bold">{q.q}</p>
    {q.expr && <p className="mt-2 text-3xl font-black" dir="ltr">{q.expr}</p>}
    {q.svg && <div className="mx-auto mt-3 flex max-w-xs justify-center [&>svg]:h-auto [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: q.svg }} />}
    <div className={`mt-4 grid grid-cols-2 gap-3 ${balloons ? 'mg-balloons' : ''}`}>
      {q.options.map((o, i) => {
        const state = picked == null ? '' : o === q.answer ? 'bg-emerald-200' : o === picked ? 'bg-rose-200' : 'opacity-60'
        return <button key={o} type="button" disabled={picked != null} onClick={() => onPick(o)}
          style={balloons ? { animationDelay: `${i * 0.35}s` } : undefined}
          className={`ln-btn alt text-2xl ${balloons ? 'mg-balloon' : ''} ${state}`} dir="ltr">{balloons && <span aria-hidden="true">🎈 </span>}{o}</button>
      })}
    </div>
    {picked != null && picked !== q.answer && q.explain && <p className="mt-3 text-lg" role="status">💡 {q.explain}</p>}
  </div>
}

function Game({ n, mode, level, slugs, onExit }) {
  const [seed, setSeed] = useState(newSeed)
  const q = useMemo(() => makeGameQuestion(n, { level, seed, slugs }), [n, level, seed, slugs])
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [left, setLeft] = useState(60)
  const [over, setOver] = useState(false)
  const timer = useRef(null)
  const bestKey = `ugabuga.mathgames.${n}.${mode}.${level}`

  useEffect(() => {
    if (mode !== 'race' || over) return
    const id = setInterval(() => setLeft(s => { if (s <= 1) { clearInterval(id); setOver(true); return 0 } return s - 1 }), 1000)
    return () => clearInterval(id)
  }, [mode, over])

  // Balloons fly away after 9 seconds: a miss.
  useEffect(() => {
    if (mode !== 'balloons' || picked != null || over) return
    timer.current = setTimeout(() => pick('__timeout__'), 9000)
    return () => clearTimeout(timer.current)
  }, [mode, seed, picked, over]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (over) saveBest(bestKey, score) }, [over]) // eslint-disable-line react-hooks/exhaustive-deps

  function pick(o) {
    if (picked != null || over || !q) return
    clearTimeout(timer.current)
    const right = o === q.answer
    setPicked(o)
    const nextScore = score + (right ? 1 : 0), nextDone = done + 1, nextHearts = hearts - (right ? 0 : 1)
    setScore(nextScore); setDone(nextDone); setHearts(nextHearts)
    const end = (mode === 'climb' && (nextDone >= 10 || nextHearts <= 0)) || (mode === 'balloons' && nextDone >= 10)
    setTimeout(() => {
      if (end) { setOver(true); return }
      setPicked(null); setSeed(newSeed())
    }, right ? 600 : mode === 'race' ? 1200 : 1800)
  }

  function again() { setScore(0); setDone(0); setHearts(3); setLeft(60); setPicked(null); setOver(false); setSeed(newSeed()) }

  if (!q) return <p className="ln-box mt-4 text-center">אין כרגע תרגילים לבחירה הזאת. נסו נושא אחר.</p>
  const m = MODES.find(x => x.id === mode)
  if (over) {
    const best = Math.max(readBest(bestKey), score)
    const stars = mode === 'race' ? (score >= 15 ? 3 : score >= 8 ? 2 : 1) : (score >= 9 ? 3 : score >= 6 ? 2 : 1)
    return <div className="ln-box mt-4 text-center" role="status">
      <p className="text-5xl" aria-hidden="true">{'⭐'.repeat(stars)}</p>
      <p className="mt-2 text-2xl font-black">{mode === 'race' ? `פתרתם ${score} תרגילים בדקה!` : `${score} מתוך ${done} נכונות`}</p>
      <p className="mt-1 text-lg">השיא שלכם ב{m.name}: {best}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" onClick={again}>🔁 עוד סיבוב</button><button type="button" className="ln-btn alt" onClick={onExit}>🎮 משחק אחר</button></div>
    </div>
  }
  return <div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-lg font-bold" aria-live="polite">
      <span>{m.emoji} {m.name}</span>
      {mode === 'race' && <span>⏱️ {left} שניות · ✅ {score}</span>}
      {mode === 'climb' && <span>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))} · שלב {score}/10</span>}
      {mode === 'balloons' && <span>🎈 {done + 1}/10 · ✅ {score}</span>}
    </div>
    {mode === 'climb' && <div className="mt-2 flex h-4 overflow-hidden rounded-full border-2 border-[var(--border)] bg-white" aria-hidden="true"><div className="bg-emerald-400 transition-all" style={{ width: `${score * 10}%` }} /></div>}
    {mode === 'balloons' && picked == null && <div key={seed} className="mg-fuse mt-3" aria-hidden="true" />}
    <Question q={q} picked={picked === '__timeout__' ? '' : picked} onPick={pick} balloons={mode === 'balloons'} />
    <button type="button" className="mt-3 text-sm underline" onClick={onExit}>יציאה מהמשחק</button>
  </div>
}

function GradeGames({ n }) {
  const g = gradeInfo(n)
  const topics = useMemo(() => gameTopics(n), [n])
  const [mode, setMode] = useState(null)
  const [level, setLevel] = useState(1)
  const [topic, setTopic] = useState('')
  const slugs = useMemo(() => (topic ? [topic] : null), [topic])
  const name = `משחקי חשבון לכיתה ${label(n)}`
  const faq = [
    { q: `אילו משחקי חשבון יש לכיתה ${label(n)}?`, a: `שלושה משחקים: מרוץ דקה, בוגה מטפס להר ובלוני תשובות. כולם משתמשים בתרגילים לפי תוכנית הלימודים של כיתה ${label(n)}: ${topics.slice(0, 6).map(t => t.title).join(', ')} ועוד.` },
    { q: 'צריך להירשם או להוריד משהו?', a: 'לא. משחקים ישר בדפדפן, בטלפון, בטאבלט או במחשב, בחינם ובלי פרסומות בתוך המשחק.' },
    { q: 'אפשר לתרגל נושא אחד בלבד?', a: 'כן. בוחרים נושא מהרשימה ורמת קושי, וכל התרגילים במשחק יהיו מהנושא הזה.' },
  ]
  return <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${name} — משחקים אונליין בחינם לפי תוכנית הלימודים`} description={`${name}: מרוץ דקה, בוגה מטפס להר ובלוני תשובות. ${topics.length} נושאים של כיתה ${label(n)}, שלוש רמות קושי, משוב מיידי ושיא אישי. בחינם ובלי הרשמה.`} path={gamesPath(n)} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[HOME, HUB, GAMES, { label: `כיתה ${label(n)}` }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">{g.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">{name}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">בוחרים משחק, נושא ורמה, ומתחילים. כל התרגילים לפי תוכנית הלימודים של כיתה {label(n)}.</p>
    </header>
    {mode ? <Game key={`${mode}-${level}-${topic}`} n={n} mode={mode} level={level} slugs={slugs} onExit={() => setMode(null)} /> : <>
      <section className="mt-6" aria-labelledby="mg-topic"><h2 id="mg-topic" className="mb-2 text-xl font-black">נושא</h2>
        <div className="flex flex-wrap gap-2"><button type="button" className="ln-chip" aria-pressed={!topic} onClick={() => setTopic('')}>🎲 הכול מעורבב</button>
          {topics.map(t => <button key={t.slug} type="button" className="ln-chip" aria-pressed={topic === t.slug} onClick={() => setTopic(t.slug)}><span aria-hidden="true">{t.emoji}</span> {t.title}</button>)}</div></section>
      <section className="mt-5" aria-labelledby="mg-level"><h2 id="mg-level" className="mb-2 text-xl font-black">רמה</h2>
        <div className="flex flex-wrap gap-2">{LEVELS.map(([v, l]) => <button key={v} type="button" className="ln-chip" aria-pressed={level === v} onClick={() => setLevel(v)}>{l}</button>)}</div></section>
      <section className="mt-6" aria-labelledby="mg-modes"><h2 id="mg-modes" className="mb-3 text-2xl font-black">בחרו משחק</h2>
        <div className="grid gap-3 sm:grid-cols-3">{MODES.map(m => <button key={m.id} type="button" onClick={() => setMode(m.id)} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-4 text-center">
          <span className="block text-5xl" aria-hidden="true">{m.emoji}</span><span className="mt-1 block text-xl font-black">{m.name}</span><span className="mt-1 block text-sm text-[var(--muted-foreground)]">{m.text}</span></button>)}</div></section>
    </>}
    <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="משחקי חשבון לכיתות אחרות">{GAME_GRADES.filter(x => x !== n).map(x => <Link key={x} to={gamesPath(x)} className="ln-chip">כיתה {label(x)}</Link>)}</nav>
    <p className="mt-4 text-center text-lg">רוצים לתרגל בשקט או להדפיס? <Link to={g.path} className="font-bold underline">כל נושאי החשבון לכיתה {label(n)}</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[`${name} באתר עוגה בוגה בנויים מאותם מחוללי תרגילים כמו דפי התרגול לכיתה ${label(n)}, כך שכל משחק מתרגל בדיוק את מה שלומדים בכיתה. בכל סיבוב התרגילים חדשים, אחרי טעות מופיע הסבר קצר, והשיא האישי נשמר במכשיר.`]} faq={faq} /></div>
  </div>
}

export function MathGamesGrade() {
  const n = parseGamesGrade(useParams().gradeSlug)
  if (n === null) return <NotFound />
  return <GradeGames key={n} n={n} />
}

export function MathGamesHub() {
  const faq = [
    { q: 'לאילו כיתות יש משחקי חשבון?', a: 'לכיתות א׳ עד ו׳. לכל כיתה שלושה משחקים עם התרגילים של תוכנית הלימודים שלה.' },
    { q: 'המשחקים בחינם?', a: 'כן, בחינם, בלי הרשמה ובלי הורדה. עובד בטלפון, בטאבלט ובמחשב.' },
  ]
  return <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="משחקי חשבון אונליין לפי כיתה — א׳ עד ו׳, בחינם" description="משחקי חשבון אונליין לכיתות א׳–ו׳ לפי תוכנית הלימודים: מרוץ דקה, בוגה מטפס להר ובלוני תשובות. שלוש רמות קושי, בחירת נושא ושיא אישי. בחינם ובלי הרשמה." path="/math/games" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[HOME, HUB, { label: 'משחקי חשבון' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">🎮</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">משחקי חשבון לפי כיתה</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">בוחרים כיתה ומשחקים: מרוץ דקה, בוגה מטפס להר ובלוני תשובות, עם תרגילים לפי תוכנית הלימודים.</p>
    </header>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{GAME_GRADES.map(n => <Link key={n} to={gamesPath(n)} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow flex items-center gap-4 p-4 text-right">
      <span className="text-4xl" aria-hidden="true">{gradeInfo(n).emoji}</span>
      <span><span className="block text-xl font-black">משחקי חשבון לכיתה {label(n)}</span><small className="block text-[var(--muted-foreground)]">{gameTopics(n).slice(0, 3).map(t => t.title).join(' · ')}</small></span>
    </Link>)}</div>
    <p className="mt-6 text-center text-lg">עוד משחקים: <Link to="/learn/multiplication-game" className="font-bold underline">מסלול לוח הכפל</Link> · <Link to="/classroom/math-tic-tac-toe" className="font-bold underline">איקס־עיגול חשבוני לכיתה</Link> · <Link to="/classroom/preschool-math-games" className="font-bold underline">משחקי חשבון לגן</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['כל משחקי החשבון בעוגה בוגה משתמשים באותם מחוללי תרגילים כמו דפי התרגול לפי כיתה, כך שהם מתאימים בדיוק לחומר של הכיתה. אפשר לבחור נושא אחד, למשל חיבור וחיסור או לוח הכפל, או לשחק בכל הנושאים מעורבבים.']} faq={faq} /></div>
  </div>
}
