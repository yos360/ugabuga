// Generated thinking practice: /learn/gifted-test/practice (endless, by grade and area),
// /learn/gifted-test/simulation (a timed three-part practice test) and /learn/psychometric-kids
// (what the three thinking areas are, by age — the bridge to the psychometric exam).
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { explain, LEVELS } from './giftedData'
import { GEN_GRADES, DOMAINS, SIM_PARTS, gradeById, genRound, genSimulation, genQuestion, rng } from './giftedGen'
import { Quiz, Stem, OptionBody, MixedPrint, prompt, LETTERS, HUB, HUB_CRUMB } from './GiftedPages'
import '../learn.css'
import './gifted.css'

const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>
const crumbs = label => [{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, HUB_CRUMB, { label }]
const NOTE = <p className="gt-note">השאלות נוצרות באתר במיוחד לתרגול. זה <b>אינו</b> המבחן הרשמי, האתר אינו קשור למשרד החינוך או למרכז הארצי לבחינות, ואין כאן ציון IQ.</p>

// ── /learn/gifted-test/practice ─────────────────────────────
const PRACTICE_FAQ = [
  { q: 'השאלות חוזרות על עצמן?', a: 'כמעט אף פעם. רוב השאלות נוצרות מחדש בכל סבב לפי חוקים — סדרות, מטריצות, בעיות כמותיות ואנלוגיות מתוך מאגר של מאות זוגות מילים — כך שאפשר לתרגל שוב ושוב.' },
  { q: 'איך יודעים שהתשובה נכונה?', a: 'כל שאלה נבנית מחוק, והתשובה מחושבת ממנו. בדיקות אוטומטיות באתר מייצרות אלפי שאלות ובודקות שלכל אחת יש תשובה נכונה אחת בדיוק.' },
  { q: 'איזו כיתה לבחור?', a: 'בוחרים את הכיתה של הילד. אם קל מדי — עולים כיתה, ואם קשה מדי — יורדים. ההתאמה לגיל היא רק נקודת התחלה.' },
  { q: 'מה ההבדל בין "מילולי", "כמותי" ו"צורני"?', a: 'מילולי — קשרים בין מילים (אנלוגיות, מה לא שייך). כמותי — מספרים וחוקיות (סדרות ובעיות חשבון חכמות). צורני — חוקיות בצורות (מטריצות). אלה שלושת סוגי החשיבה שנבדקים במבחני מחוננים, וגם בפסיכומטרי בהמשך.' },
]
export function GiftedPractice() {
  const [params, setParams] = useSearchParams()
  const grade = gradeById(params.get('grade') || 2)
  const domain = DOMAINS.some(d => d.key === params.get('domain')) ? params.get('domain') : 'all'
  const [printSet, setPrintSet] = useState(null)
  const set = (k, v) => { const p = new URLSearchParams(params); p.set(k, v); setParams(p, { replace: true }) }
  const domainLabel = domain === 'all' ? 'כל התחומים' : DOMAINS.find(d => d.key === domain).label
  return <Page>
    <SEO title="תרגול למבחן מחוננים אונליין — שאלות חדשות בכל סבב" description="תרגול חשיבה לילדים בלי סוף: אנלוגיות, סדרות מספרים, מטריצות צורות ובעיות כמותיות שנוצרות מחדש בכל סבב — לפי כיתה, מא׳ עד ט׳, עם הסבר לכל תשובה ודפים להדפסה." path={`${HUB}/practice`} structuredData={faqSchema(PRACTICE_FAQ)} />
    <Breadcrumbs items={crumbs('תרגול בלי סוף')} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">♾️ </span>תרגול למבחן מחוננים — שאלות חדשות בכל סבב</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">בוחרים כיתה ותחום, ומקבלים 10 שאלות שלא ראיתם — עם הסבר אחרי כל תשובה</p>
    {NOTE}
    <div className="ln-box mt-4 space-y-3">
      <div><b>כיתה:</b> <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="כיתה">{GEN_GRADES.map(g => <Chip key={g.id} on={g.id === grade.id} onClick={() => set('grade', g.id)}>{g.label}</Chip>)}</div></div>
      <div><b>תחום:</b> <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="תחום">
        <Chip on={domain === 'all'} onClick={() => set('domain', 'all')}>🧠 הכל מעורבב</Chip>
        {DOMAINS.map(d => <Chip key={d.key} on={domain === d.key} onClick={() => set('domain', d.key)}>{d.emoji} {d.label}</Chip>)}
      </div></div>
      <p className="m-0 text-sm text-[var(--muted-foreground)]">רמה: {grade.levels.map(l => LEVELS[Math.min(l, 4)]).filter((x, i, a) => a.indexOf(x) === i).join(' ו')}{grade.id === 7 ? ' — כולל שאלות בסגנון החשיבה הכמותית והמילולית של הפסיכומטרי' : ''}</p>
    </div>
    <div className="mt-4"><Quiz key={`${grade.id}-${domain}`} make={() => genRound(grade.id, domain, 10)} count={10} label={`כיתה ${grade.label} · ${domainLabel}. כל סבב — 10 שאלות חדשות.`} /></div>
    <div className="ln-box mt-6 text-center">
      <h2 className="text-2xl font-black mb-2">🖨️ דף תרגול להדפסה</h2>
      <p className="mb-3">10 שאלות חדשות לכיתה {grade.label} ({domainLabel}), ודף תשובות עם הסבר לכל שאלה. כל לחיצה — דף אחר.</p>
      <button type="button" className="ln-btn alt" onClick={() => setPrintSet(genRound(grade.id, domain, 10))}>🖨️ דף חדש להדפסה</button>
    </div>
    {printSet && <PrintPreview title={`תרגול חשיבה — כיתה ${grade.label}`} onClose={() => setPrintSet(null)} onRefresh={() => setPrintSet(genRound(grade.id, domain, 10))}><MixedPrint title={`תרגול חשיבה לכיתה ${grade.label}`} items={printSet} from={0} /></PrintPreview>}
    <h2 className="mt-10 mb-3 text-2xl font-black">עוד דרכים לתרגל</h2>
    <div className="grid gap-3 sm:grid-cols-3">
      <Link to={`${HUB}/simulation`} className="ln-box card-lift text-right"><b>⏱️ מבחן לדוגמה עם שעון</b><br /><small>שלושה פרקים, ציון לכל פרק</small></Link>
      <Link to="/learn/psychometric-kids" className="ln-box card-lift text-right"><b>🎓 פסיכומטרי לילדים</b><br /><small>שלושת סוגי החשיבה לפי גיל</small></Link>
      <Link to={HUB} className="ln-box card-lift text-right"><b>🧠 120 שאלות עם הסבר</b><br /><small>המאגר המלא, לפי סוג שאלה</small></Link>
    </div>
    <div className="mt-12"><SeoBody paragraphs={['בתרגול הזה השאלות לא נגמרות. רוב השאלות נבנות מחדש בכל סבב: סדרות מספרים לפי חוקים, מטריצות צורות של 3×3, בעיות כמותיות עם מספרים אחרים בכל פעם ואנלוגיות מתוך מאות זוגות של הפכים ומילים נרדפות. לכן אפשר לחזור לכאן שוב ושוב ולקבל שאלות שלא ראיתם.', 'הרמה נקבעת לפי הכיתה: בכיתה א׳ השאלות קצרות ופשוטות, בכיתות ב׳–ג׳ — ברמה של מבחני האיתור למחוננים, ובכיתות ה׳–ו׳ הן מאתגרות יותר. בכיתות ז׳–ט׳ השאלות כבר דומות בסגנון לחשיבה הכמותית והמילולית שנבדקת בפסיכומטרי — הכנה מוקדמת ונינוחה, בלי לחץ של מבחן.', 'כדאי לתרגל 10–15 דקות, כמה פעמים בשבוע, ולדבר על ההסבר אחרי כל טעות: "איך היית יכול לגלות את החוק?" זה מה שבונה חשיבה, יותר מכל מספר של שאלות.']} faq={PRACTICE_FAQ} related={[{ label: 'מבחני מחוננים כיתה ב׳', href: `${HUB}/grade-2` }, { label: 'חידות היגיון', href: '/riddles/logic' }, { label: 'תרגילי חשבון לפי כיתה', href: '/math' }]} /></div>
  </Page>
}

// ── /learn/gifted-test/simulation ─────────────────────────────
const SIM_FAQ = [
  { q: 'האם זה המבחן האמיתי?', a: 'לא. זו סימולציה שנבנתה באתר: שלושה פרקים — מילולי, כמותי וצורני — עם שעון לכל פרק, כדי להתרגל לתחושה של מבחן עם זמן. התוכן והזמנים במבחן האמיתי שונים ומשתנים בין שנים.' },
  { q: 'מה עושים כשנגמר הזמן?', a: 'הפרק נסגר ועוברים לפרק הבא. שאלות שלא נענו נספרות כלא נכונות — כמו במבחן אמיתי. אחרי שלושת הפרקים רואים ציון לכל פרק והסבר לכל שאלה.' },
  { q: 'זה מתאים לגיל שש?', a: 'אפשר, אבל לילדים צעירים עדיף קודם לתרגל בלי שעון בעמוד התרגול. הסימולציה מתאימה בעיקר לכיתות ב׳ ומעלה, ולמי שכבר מכיר את סוגי השאלות.' },
]
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
export function GiftedSimulation() {
  const [gradeId, setGradeId] = useState(2)
  const [sim, setSim] = useState(null) // { parts, p, i, picks: [[]], left, phase: 'run' | 'break' | 'done' }
  const timer = useRef(0)
  const start = () => { const parts = genSimulation(gradeId); setSim({ parts, p: 0, i: 0, picks: parts.map(() => []), left: parts[0].minutes * 60, phase: 'run' }); window.scrollTo(0, 0) }
  useEffect(() => {
    if (sim?.phase !== 'run') return undefined
    timer.current = setInterval(() => setSim(s => {
      if (!s || s.phase !== 'run') return s
      if (s.left > 1) return { ...s, left: s.left - 1 }
      return s.p + 1 < s.parts.length ? { ...s, phase: 'break' } : { ...s, phase: 'done' }
    }), 1000)
    return () => clearInterval(timer.current)
  }, [sim?.phase, sim?.p])
  const answer = j => setSim(s => {
    const picks = s.picks.map((x, k) => k === s.p ? Object.assign([...x], { [s.i]: j }) : x)
    const part = s.parts[s.p]
    if (s.i + 1 < part.qs.length) return { ...s, picks, i: s.i + 1 }
    return s.p + 1 < s.parts.length ? { ...s, picks, phase: 'break' } : { ...s, picks, phase: 'done' }
  })
  const nextPart = () => setSim(s => ({ ...s, p: s.p + 1, i: 0, left: s.parts[s.p + 1].minutes * 60, phase: 'run' }))
  const g = gradeById(gradeId)
  return <Page>
    <SEO title="מבחן מחוננים לדוגמה — סימולציה עם שעון, 3 פרקים" description="סימולציה של מבחן מחוננים: שלושה פרקים עם זמן — מילולי, כמותי וצורני — ושאלות חדשות בכל פעם. בסוף מקבלים ציון לכל פרק והסבר לכל שאלה. לכיתות א׳–ו׳, חינם." path={`${HUB}/simulation`} structuredData={faqSchema(SIM_FAQ)} />
    <Breadcrumbs items={crumbs('מבחן לדוגמה')} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">⏱️ </span>מבחן מחוננים לדוגמה — סימולציה עם שעון</h1>
    {!sim && <>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">שלושה פרקים, שעון לכל פרק, ושאלות חדשות בכל פעם — כמו מבחן, אבל בבית</p>
      {NOTE}
      <div className="ln-box mt-4 space-y-3 text-center">
        <b>לאיזו כיתה?</b>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="כיתה">{GEN_GRADES.filter(x => x.id <= 6).map(x => <Chip key={x.id} on={x.id === gradeId} onClick={() => setGradeId(x.id)}>{x.label}</Chip>)}</div>
        <ul className="mx-auto max-w-md text-right">{SIM_PARTS.map(p => <li key={p.domain}>{DOMAINS.find(d => d.key === p.domain).emoji} <b>{p.title}</b> — {p.n} שאלות, {p.minutes} דקות</li>)}</ul>
        <p className="text-sm">במהלך הפרק אין הסברים ואי אפשר לחזור אחורה. בסוף — ציון לכל פרק והסבר לכל שאלה.</p>
        <button type="button" className="ln-btn go" onClick={start}>▶ מתחילים את המבחן (כיתה {g.label})</button>
      </div>
    </>}
    {sim?.phase === 'run' && (() => {
      const part = sim.parts[sim.p], { type, item } = part.qs[sim.i]
      return <div className="ln-box">
        <div className="flex justify-between font-bold"><span>{part.title} · שאלה {sim.i + 1} מתוך {part.qs.length}</span><span className={sim.left <= 60 ? 'text-red-600' : ''} aria-live="off">⏱️ {mmss(sim.left)}</span></div>
        <div className="ln-bar my-3"><i style={{ width: `${(sim.i / part.qs.length) * 100}%` }} /></div>
        {type !== 'logic' && <p className="font-bold text-center mb-2">{prompt(type)}</p>}
        <Stem type={type} item={item} />
        <div className={`gt-opts ${type === 'matrices' ? 'is-fig' : ''}`} role="group" aria-label="תשובות">
          {item.options.map((o, j) => <button key={j} type="button" onClick={() => answer(j)} className="ln-opt gt-opt"><b className="gt-letter">{LETTERS[j]}</b><OptionBody type={type} opt={o} /></button>)}
        </div>
      </div>
    })()}
    {sim?.phase === 'break' && <div className="ln-box text-center space-y-3">
      <h2 className="text-3xl font-black">✅ סיימתם את {sim.parts[sim.p].title}</h2>
      <p>אפשר לנשום, לשתות מים — ולהמשיך כשמוכנים. השעון של הפרק הבא מתחיל רק אחרי הלחיצה.</p>
      <button type="button" className="ln-btn go" onClick={nextPart}>▶ ל{sim.parts[sim.p + 1].title}</button>
    </div>}
    {sim?.phase === 'done' && <SimResults sim={sim} onAgain={start} onExit={() => setSim(null)} />}
    {!sim && <div className="mt-12"><SeoBody paragraphs={['מבחן לדוגמה עם שעון עוזר לילד להכיר את התחושה של מבחן אמיתי: יש זמן מוגבל, לא מקבלים משוב באמצע, וצריך להחליט מתי לעבור שאלה. מי שכבר חווה את זה בבית — מגיע למבחן רגוע יותר.', 'הסימולציה בנויה משלושה פרקים, לפי שלושת סוגי החשיבה שנבדקים במבחני מחוננים: מילולי (אנלוגיות ו"מה לא שייך"), כמותי (סדרות ובעיות חשבון חכמות) וצורני (מטריצות). השאלות נוצרות מחדש בכל פעם, כך שאפשר לעשות את המבחן כמה פעמים.', 'אחרי המבחן עוברים יחד על הטעויות: ההסבר מראה את החוק או את הקשר שהיה צריך לגלות. זה החלק החשוב ביותר בתרגול.']} faq={SIM_FAQ} related={[{ label: 'תרגול בלי שעון', href: `${HUB}/practice` }, { label: 'מבחני מחוננים כיתה ב׳', href: `${HUB}/grade-2` }, { label: 'מבחן מחוננים שלב ב׳', href: `${HUB}/stage-b` }]} /></div>}
  </Page>
}
function SimResults({ sim, onAgain, onExit }) {
  const scores = sim.parts.map((p, k) => p.qs.filter((q, i) => sim.picks[k][i] === q.item.answer).length)
  const total = scores.reduce((a, b) => a + b, 0), max = sim.parts.reduce((a, p) => a + p.qs.length, 0)
  return <div className="space-y-4">
    <div className="ln-box text-center">
      <h2 className="text-3xl font-black">{total} מתוך {max}</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">{sim.parts.map((p, k) => <div key={p.domain} className="ln-q"><b>{p.title}</b><br />{scores[k]} מתוך {p.qs.length}</div>)}</div>
      <p className="mt-3">זה תרגול, לא ציון רשמי. הכי חשוב: לעבור יחד על השאלות שפספסתם ולהבין את החוק.</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" onClick={onAgain}>🔁 מבחן חדש</button><button type="button" className="ln-btn alt" onClick={onExit}>סיום</button></div>
    </div>
    {sim.parts.map((p, k) => <section key={p.domain} className="ln-box">
      <h3 className="text-2xl font-black mb-2">{p.title}</h3>
      <ol className="space-y-3">{p.qs.map(({ type, item }, i) => { const pick = sim.picks[k][i], ok = pick === item.answer
        return <li key={item.id} className="ln-q">
          <p className="font-bold">{ok ? '✅' : pick === undefined ? '⏱️ לא נענתה' : '❌'} שאלה {i + 1}</p>
          {type !== 'logic' && prompt(type) && <p className="mb-1">{prompt(type)}</p>}
          <Stem type={type} item={item} />
          <ul className={`gt-sample-opts ${type === 'matrices' ? 'is-fig' : ''}`}>{item.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> <OptionBody type={type} opt={o} /></li>)}</ul>
          <p className="mt-2"><b>התשובה: {LETTERS[item.answer]}</b>{pick !== undefined && !ok && <> (סימנתם {LETTERS[pick]})</>}. {explain(type, item)}</p>
        </li> })}</ol>
    </section>)}
  </div>
}

// ── /learn/psychometric-kids ─────────────────────────────
const AGES = [
  { range: 'גן–כיתה א׳', grade: 1, what: 'מיון וקבוצות ("מה לא שייך"), הפכים, סדרות קצרות של +2 ו־+5, ומטריצות עם חוק אחד.', tip: 'הכול בעל פה ובמשחק. אפשר לקרוא את השאלה בקול.' },
  { range: 'כיתות ב׳–ג׳', grade: 2, what: 'הגיל של מבחני האיתור למחוננים: אנלוגיות, סדרות עם שתי פעולות, בעיות מילוליות קצרות ומטריצות עם שני חוקים.', tip: 'להכיר את סוגי השאלות ואת התחושה של מבחן עם זמן.' },
  { range: 'כיתות ד׳–ו׳', grade: 5, what: 'מילים נרדפות ויחסים מורכבים, סדרות עם הפרשים משתנים, בעיות של גילים ושברים, מטריצות עם שלושה חוקים.', tip: 'לבנות הרגל: לנמק כל תשובה ולבדוק את כל האפשרויות.' },
  { range: 'כיתות ז׳–ט׳', grade: 7, what: 'הגשר לפסיכומטרי: חשיבה כמותית (בעיות תנועה, אחוזים, מספרים עוקבים), חשיבה מילולית (אנלוגיות קשות, מילים נרדפות גבוהות) וחשיבה צורנית.', tip: 'תרגול קבוע וקצר. הפסיכומטרי עצמו נבחן רק אחרי התיכון — אין סיבה ללחץ.' },
]
const PSY_FAQ = [
  { q: 'יש פסיכומטרי לילדים?', a: 'לא במובן הרשמי. הבחינה הפסיכומטרית מיועדת לקבלה לאוניברסיטה. אבל שלושת סוגי החשיבה שהיא בודקת — מילולית, כמותית וצורנית — נבדקים גם במבחני מחוננים ובמבחנים פסיכוטכניים לילדים, ואפשר לפתח אותם מגיל צעיר.' },
  { q: 'זה מבחן IQ?', a: 'לא. התרגול כאן לא נותן ציון IQ ולא מאבחן. הוא נותן היכרות עם סוגי השאלות ותרגול של דרכי חשיבה — בצורה של משחק.' },
  { q: 'מאיזה גיל אפשר להתחיל?', a: 'כבר בגן אפשר לשחק ב"מה לא שייך" ובהפכים. בכיתות ב׳–ג׳ זה הגיל של מבחני המחוננים, ובחטיבת הביניים אפשר להתחיל להכיר את סגנון הפסיכומטרי.' },
  { q: 'כמה זמן כדאי לתרגל?', a: '10–15 דקות, כמה פעמים בשבוע. עדיף מעט ובכיף מאשר הרבה בלחץ.' },
]
export function PsychometricKids() {
  // fixed seed: the same sample questions in the prerendered page and in the browser
  const samples = useMemo(() => { const r = rng(2026); return DOMAINS.map(d => ({ d, q: genQuestion(d.key, 2, r) })) }, [])
  return <Page>
    <SEO title="פסיכומטרי לילדים — חשיבה מילולית, כמותית וצורנית לפי גיל" description="פסיכומטרי לילדים: מה זה חשיבה מילולית, כמותית וצורנית, מה מתאים לכל גיל מהגן ועד כיתה ט׳, ותרגול חינם עם שאלות חדשות בכל סבב — הכנה למבחני מחוננים ובהמשך לפסיכומטרי." path="/learn/psychometric-kids" structuredData={faqSchema(PSY_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'פסיכומטרי לילדים' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎓 </span>פסיכומטרי לילדים — חשיבה לפי גיל</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">שלושת סוגי החשיבה של הפסיכומטרי — מילולית, כמותית וצורנית — בגרסה לילדים, מהגן ועד כיתה ט׳</p>
    <p className="text-lg leading-relaxed">הבחינה הפסיכומטרית בודקת שלושה תחומים: <b>חשיבה מילולית</b>, <b>חשיבה כמותית</b> ואנגלית. מבחני המחוננים לילדים בודקים כמעט את אותן יכולות — רק בשפה ובמספרים שמתאימים לגיל, ובמקום אנגלית יש <b>חשיבה צורנית</b>. כאן אפשר לראות מה מתאים לכל גיל ולתרגל עם שאלות שנוצרות מחדש בכל פעם.</p>
    {NOTE}
    <h2 className="mt-8 mb-3 text-3xl font-black">שלושת סוגי החשיבה</h2>
    <div className="grid gap-3 sm:grid-cols-3">{DOMAINS.map(d => <Link key={d.key} to={`${HUB}/practice?domain=${d.key}`} className="ln-box card-lift text-right"><div className="text-4xl" aria-hidden="true">{d.emoji}</div><b className="text-xl">חשיבה {d.label === 'מילולי' ? 'מילולית' : d.label === 'כמותי' ? 'כמותית' : 'צורנית'}</b><br /><small>{d.desc}</small></Link>)}</div>
    <h2 className="mt-10 mb-3 text-3xl font-black">מה מתאים לכל גיל</h2>
    <div className="space-y-3">{AGES.map(a => <section key={a.range} className="ln-q">
      <h3 className="text-xl font-black">{a.range}</h3>
      <p className="m-0">{a.what}</p>
      <p className="m-0 text-sm text-[var(--muted-foreground)]">💡 {a.tip}</p>
      <Link className="mt-2 inline-block font-bold underline" to={`${HUB}/practice?grade=${a.grade}`}>לתרגול ל{a.range} ←</Link>
    </section>)}</div>
    <h2 className="mt-10 mb-3 text-3xl font-black">שאלות לדוגמה</h2>
    <div className="space-y-4">{samples.map(({ d, q: { type, item } }) => <div key={d.key} className="ln-q gt-sample">
      <p className="font-bold">{d.emoji} חשיבה {d.label === 'מילולי' ? 'מילולית' : d.label === 'כמותי' ? 'כמותית' : 'צורנית'}</p>
      {type === 'logic' ? null : prompt(type) && <p className="mb-1">{prompt(type)}</p>}
      <Stem type={type} item={item} />
      <ul className={`gt-sample-opts ${type === 'matrices' ? 'is-fig' : ''}`}>{item.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> <OptionBody type={type} opt={o} /></li>)}</ul>
      <details><summary>תשובה והסבר</summary><p><b>התשובה: {LETTERS[item.answer]}.</b> {explain(type, item)}</p></details>
    </div>)}</div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <Link to={`${HUB}/practice`} className="ln-box card-lift text-center"><b className="text-xl">♾️ תרגול בלי סוף</b><br /><small>לפי כיתה ותחום, עם הסבר לכל תשובה</small></Link>
      <Link to={`${HUB}/simulation`} className="ln-box card-lift text-center"><b className="text-xl">⏱️ מבחן לדוגמה עם שעון</b><br /><small>שלושה פרקים וציון לכל פרק</small></Link>
    </div>
    <div className="mt-12"><SeoBody paragraphs={['"פסיכומטרי לילדים" הוא שם שהורים נותנים לתרגול של חשיבה: לא חומר לימודי שמשננים, אלא היכולת לגלות חוקיות, להבין קשרים בין מילים ולפתור בעיות בדרך חכמה. אלה בדיוק היכולות שנבדקות במבחני האיתור למחוננים בכיתות הנמוכות, ובהמשך — בבחינה הפסיכומטרית לקראת האוניברסיטה.', 'בחשיבה המילולית מתרגלים אנלוגיות ("ציפור לקן כמו דבורה ל…"), הפכים, מילים נרדפות ומציאת המילה שלא שייכת. בחשיבה הכמותית — סדרות מספרים ובעיות מילוליות שדורשות לחשוב ולא רק לחשב. בחשיבה הצורנית — מטריצות של צורות שמשתנות לפי חוקים.', 'התרגול באתר מותאם לגיל: לכל כיתה רמת קושי משלה, והשאלות נוצרות מחדש בכל סבב. כך אפשר לתרגל קצת בכל פעם — וליהנות מזה.']} faq={PSY_FAQ} related={[{ label: 'הכנה למבחן מחוננים', href: HUB }, { label: 'חידות היגיון', href: '/riddles/logic' }, { label: 'מילים נרדפות', href: '/words/synonyms' }, { label: 'הפכים', href: '/words/opposites' }]} /></div>
  </Page>
}
