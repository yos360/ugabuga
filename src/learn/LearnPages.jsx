import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import QuickAnswer from '../components/ui/QuickAnswer'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import SpeakButton from '../components/ui/SpeakButton'
import NotFound from '../pages/NotFound'
import { speak, hasVoice } from '../utils/speak'
import { usePresentMode } from '../utils/presentMode'
import { DICTATION, READING, plainWord } from './learnData'
import { DICTATION_EN } from './dictationEnglish.js'
import { GRADED_READING, GRADE_WORDS, READING_GRADE_PAGES } from './readingGrades'
import { MENU_DOMAINS } from '../data/siteMenu'
import { applySay } from '../utils/sayFixes'
import { vocalizeAll } from '../utils/nikudText'
import { SUBJECTS } from './subjects/subjects'
import './learn.css'

export const LEARN_CRUMB = { label: 'לומדים', href: '/learn' }
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[x[i], x[j]] = [x[j], x[i]] } return x }
const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>
const Page = ({ children, wide }) => <div className={`mx-auto ${wide ? 'max-w-6xl' : 'max-w-4xl'} px-4 py-8 buga-fade-in`} dir="rtl">{children}</div>
function Head({ emoji, h1, sub, crumb }) {
  return <>
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, ...(crumb ? [LEARN_CRUMB, { label: crumb }] : [{ label: LEARN_CRUMB.label }])]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{emoji} </span>{h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{sub}</p>
  </>
}

// ── /learn ───────────────────────────────
// The hub is built from the "לומדים" menu domain (src/data/siteMenu.js), so every page in the menu
// is a card here and the two never drift. LEARN_EXTRA adds hub-only cards whose primary menu home is
// another domain (color-by-answer lives under "להדפסה"); LEARN_DESC gives a card a one-line subtitle.
const LEARN_DOMAIN = MENU_DOMAINS.find(d => d.id === 'learn')
const SECTION_TITLES = { '/math': 'מתמטיקה לפי כיתה', '/english': 'אנגלית ושפות' }
const MATH_GRADES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב']
const LEARN_EXTRA = {
  '/math': [{ to: '/printables/color-by-answer', label: 'צביעה לפי תשובה', icon: '🎨' }],
  '/letters': [{ to: '/words/synonyms', label: 'מילים נרדפות', icon: '🟰' }],
}
const LEARN_DESC = {
  '/signs': 'מכירים תמרורים, משחקים ומתרגלים לפי גיל',
  '/math': 'תרגול, מבחנים ודפי עבודה לכל כיתה',
  '/learn/multiplication-table': 'טבלה צבעונית ולוח הכפל להדפסה',
  '/learn/times-tables': 'אתגר הדקה: כמה תרגילים תספיקו?',
  '/printables/math-worksheets': 'חיבור, חיסור וכפל — להדפסה עם תשובות',
  '/printables/color-by-answer': 'פותרים תרגיל — וצובעים לפי התשובה',
  '/learn/gifted-test': 'אנלוגיות, סדרות, מטריצות וחשיבה',
  '/learn/psychometric-kids': 'חשיבה מילולית, כמותית וצורנית לפי גיל',
  '/learn/dictation': 'הורה מקריא או הקראה קולית — עם בדיקה',
  '/learn/reading': `${READING.length + GRADED_READING.length} קטעים עם שאלות לכיתות ב׳–ו׳`,
  '/learn/flashcards': 'אנגלית, הפכים, לוח הכפל — או משלכם',
  '/typing': 'שיעורים, מבחן מהירות ומשחק הקלדה',
}
export const LEARN_SECTIONS = LEARN_DOMAIN.groups.map(g => ({
  id: g.to.replace(/^\//, ''),
  title: SECTION_TITLES[g.to] || g.title,
  icon: g.icon,
  to: g.to,
  items: [...g.items, ...(LEARN_EXTRA[g.to] || [])],
}))

export function LearnHub() {
  return <Page wide>
    <SEO title="לומדים — חשבון לפי כיתה, אותיות, קריאה ושפות לילדים" description="אזור הלמידה של עוגה בוגה: תרגילי חשבון לפי כיתה א׳–י״ב, לוח הכפל, אותיות וקריאה, הכתבה, אנגלית ושפות, הקלדה, מוזיקה ומדע — אונליין ולהדפסה, בחינם." path="/learn" />
    <Head emoji="📚" h1="לומדים: חשבון, עברית, אנגלית ומדע לילדים" sub="בוחרים נושא — ומתרגלים אונליין או מדפיסים" />
    <nav className="ln-hub-jump" aria-label="קפיצה לנושא">{LEARN_SECTIONS.map(s => <a key={s.id} href={`#${s.id}`} className="ln-chip"><span aria-hidden="true">{s.icon}</span> {s.title}</a>)}</nav>
    <section className="ln-hub-sec" aria-labelledby="subjects-h">
      <div className="ln-hub-head"><h2 id="subjects-h"><span aria-hidden="true">📚 </span>שיעורים לפי מקצוע</h2></div>
      <ul className="ln-hub-grid">{SUBJECTS.map(x => <li key={x.key}><Link to={`/learn/${x.key}`} className="ln-hub-card">
        <span className="ln-hub-ico" aria-hidden="true">{x.emoji}</span>
        <span><b>{x.title}</b><small>{x.desc}</small></span>
      </Link></li>)}</ul>
    </section>
    {LEARN_SECTIONS.map(s => <section key={s.id} id={s.id} className="ln-hub-sec" aria-labelledby={`${s.id}-h`}>
      <div className="ln-hub-head">
        <h2 id={`${s.id}-h`}><span aria-hidden="true">{s.icon} </span>{s.title}</h2>
        <Link to={s.to} className="ln-hub-all">לכל העמוד ←</Link>
      </div>
      {s.to === '/math' && <nav className="ln-hub-grades" aria-label="מתמטיקה לפי כיתה">{MATH_GRADES.map((l, i) => <Link key={l} to={`/math/grade-${i + 1}`} className="ln-chip">כיתה {l}</Link>)}</nav>}
      <ul className="ln-hub-grid">{s.items.map(it => <li key={it.to}><Link to={it.to} className="ln-hub-card">
        <span className="ln-hub-ico" aria-hidden="true">{it.icon}</span>
        <span><b>{it.label}</b>{LEARN_DESC[it.to] && <small>{LEARN_DESC[it.to]}</small>}</span>
      </Link></li>)}</ul>
    </section>)}
    <div className="mt-12"><SeoBody paragraphs={['כל מה שקשור ללמידה בעוגה בוגה מרוכז כאן: תרגילי חשבון ומתמטיקה לפי כיתה מכיתה א׳ ועד י״ב, לוח הכפל, אותיות בעברית ובאנגלית, הכתבה והבנת הנקרא, שפות, הקלדה עיוורת, מוזיקה ונושאים מעולם המדע והגאוגרפיה.', 'תרגול קצר וקבוע עובד טוב יותר מישיבה ארוכה פעם בשבוע. את רוב הכלים אפשר לפתוח בטלפון או במחשב, ורבים מהם אפשר גם להדפיס. הקטעים והרשימות נכתבו במיוחד לאתר, בכתיב מלא לפי כללי האקדמיה ללשון העברית.']} related={[{ label: 'דפי שורות לכתיבה', href: '/printables/lined-paper' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }]} /></div>
  </Page>
}

// ── /learn/dictation ───────────────────────────────
function DictationPrint({ title, words, name }) {
  return <>
    <article className="buga-flow ln-print" dir="rtl"><h2>הכתבה: {title}</h2>
      <div className="meta"><span>שם: {name || '__________________'}</span><span>תאריך: ____________</span><span>הצלחתי: ____ מתוך {words.length}</span></div>
      <ol className="lines">{words.map((w, i) => <li key={i}>&nbsp;</li>)}</ol></article>
    <article className="buga-flow ln-print" dir="rtl"><h2>למבוגר שמקריא — {title}</h2>
      <p>מקריאים כל מילה פעמיים, בקצב רגוע. בסוף בודקים יחד ומסמנים ✓ ליד כל מילה נכונה.</p>
      <ol className="key">{words.map((w, i) => <li key={i}>{w}</li>)}</ol></article>
  </>
}
const EN_FAQ = [
  { q: 'איך עושים הכתבה באנגלית בבית?', a: 'בוחרים רשימה לפי הכיתה. במצב ״הקראה קולית״ המכשיר מקריא כל מילה באנגלית, הילד מקליד ובסוף רואים מה נכון. אפשר גם שהורה יקריא, או להדפיס דף הכתבה עם דף תשובות.' },
  { q: 'אפשר להכניס את המילים מהמחברת?', a: 'כן — בוחרים ״רשימה משלי״ וכותבים את המילים באנגלית, כל מילה בשורה או עם פסיק. עד 30 מילים.' },
  { q: 'הבדיקה מבחינה בין אותיות גדולות לקטנות?', a: 'לא. בהכתבה בודקים את האיות, ולכן cat ו־Cat נחשבות אותה תשובה.' },
]
// English spelling lists (/learn/dictation/english) use the same screen, with an English voice,
// left-to-right typing and case-insensitive checking.
export function DictationEnglish() { return <Dictation lang="en" /> }
export function Dictation({ lang = 'he' }) {
  const en = lang === 'en', LISTS = en ? DICTATION_EN : DICTATION, VOICE = en ? 'en-US' : 'he-IL'
  const same = (a, b) => en ? a.trim().toLowerCase() === b.trim().toLowerCase() : plainWord(a) === plainWord(b)
  const [listId, setListId] = useState(LISTS[0].id)
  const [custom, setCustom] = useState('')
  const [mode, setMode] = useState('parent')
  const [mix, setMix] = useState(true)
  const [run, setRun] = useState(null) // { words, i, answers }
  const [typed, setTyped] = useState('')
  const [voiceOk, setVoiceOk] = useState(false)
  const [printing, setPrinting] = useState(null)
  const [name, setName] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { hasVoice(VOICE).then(setVoiceOk) }, [VOICE])
  const list = LISTS.find(d => d.id === listId)
  const customWords = custom.split(/[\n,،]+/).map(w => w.trim()).filter(Boolean).slice(0, 30)
  const words = listId === 'custom' ? customWords : list.words
  const title = listId === 'custom' ? 'הרשימה שלי' : list.title
  const start = () => { if (!words.length) return; const w = mix ? shuffle(words) : words; setRun({ words: w, i: 0, answers: [] }); setTyped(''); if (mode === 'voice') speak(w[0], VOICE) }
  const cur = run && run.words[run.i]
  const done = run && run.i >= run.words.length
  useEffect(() => { if (run && !done && mode === 'voice') inputRef.current?.focus() }, [run, done, mode])
  const next = () => {
    const answers = mode === 'voice' ? [...run.answers, typed.trim()] : run.answers
    const i = run.i + 1
    setRun({ ...run, i, answers }); setTyped('')
    if (mode === 'voice' && i < run.words.length) setTimeout(() => speak(run.words[i], VOICE, { user: false }), 250)
  }
  const right = done && mode === 'voice' ? run.words.filter((w, i) => same(w, run.answers[i] || '')).length : 0
  const faq = [
    { q: 'איך עושים הכתבה בבית?', a: 'בוחרים רשימה, ההורה מקריא כל מילה פעמיים והילד כותב בדף. בסוף פותחים את רשימת המילים ובודקים יחד. אפשר להדפיס דף הכתבה עם שורות ממוספרות ודף תשובות נפרד להורה.' },
    { q: 'הקול במכשיר מבטא מילה לא נכון — מה עושים?', a: 'הקראה קולית משתמשת בקול של המכשיר, ובעברית בלי ניקוד הוא טועה לפעמים בהגייה. לכן מצב "הורה מקריא" הוא ברירת המחדל, ובמצב הקולי תמיד אפשר לבקש מהורה לעזור.' },
    { q: 'אפשר להכניס את המילים מהמחברת?', a: 'כן — בוחרים "רשימה משלי" וכותבים את המילים, כל מילה בשורה או מופרדות בפסיק. עד 30 מילים.' },
  ]
  return <Page>
    {en ? <SEO title="הכתבה באנגלית אונליין — מילים לכיתות ג׳–ו׳ עם הקראה ובדיקה" description="הכתבה באנגלית לילדים: 14 רשימות מילים לכיתות ג׳–ו׳ או רשימה משלכם. הקראה באנגלית במכשיר, הקלדה ובדיקה אוטומטית, או דף הכתבה להדפסה עם תשובות." path="/learn/dictation/english" structuredData={faqSchema(EN_FAQ)} />
      : <SEO title="הכתבה אונליין לילדים — תרגול הכתבה עם בדיקה ודף להדפסה" description="תרגול הכתבה לכיתות א׳–ד׳: רשימות מוכנות (ט/ת, כ/ק, א/ע, ח/כ, אותיות סופיות) או רשימה משלכם. הורה מקריא או הקראה קולית עם בדיקה אוטומטית, ודף הכתבה להדפסה." path="/learn/dictation" structuredData={faqSchema(faq)} />}
    <Head emoji={en ? '🇬🇧' : '✍️'} h1={en ? 'הכתבה באנגלית' : 'הכתבה'} sub={en ? 'Dictation — שומעים מילה באנגלית, כותבים, ובסוף בודקים' : 'בוחרים רשימה — ההורה מקריא, הילד כותב, ובסוף בודקים יחד'} crumb={en ? 'הכתבה באנגלית' : 'הכתבה'} />
    <p className="mb-4 text-center">{en ? <Link to="/learn/dictation" className="underline">להכתבה בעברית ←</Link> : <Link to="/learn/dictation/english" className="underline">🇬🇧 חדש: הכתבה באנגלית ←</Link>}</p>
    {!run && <div className="ln-box space-y-4">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="רשימה">
        {LISTS.map(d => <Chip key={d.id} on={listId === d.id} onClick={() => setListId(d.id)}>{d.title} <small className="opacity-70">· {d.grade}</small></Chip>)}
        <Chip on={listId === 'custom'} onClick={() => setListId('custom')}>📝 רשימה משלי</Chip>
      </div>
      {listId === 'custom'
        ? <textarea className="ln-ta" value={custom} onChange={e => setCustom(e.target.value)} placeholder={'כותבים את המילים מהמחברת — כל מילה בשורה או עם פסיק'} aria-label="המילים שלי" />
        : <p className="text-center text-lg">{list.words.join(' · ')}</p>}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="איך מקריאים">
        <Chip on={mode === 'parent'} onClick={() => setMode('parent')}>👩 הורה מקריא</Chip>
        <Chip on={mode === 'voice'} onClick={() => setMode('voice')} disabled={!voiceOk} title={voiceOk ? '' : en ? 'אין במכשיר קול באנגלית' : 'אין במכשיר קול בעברית'}>🔊 הקראה קולית והקלדה</Chip>
        <Chip on={mix} onClick={() => setMix(!mix)}>🔀 סדר מעורבב</Chip>
      </div>
      {mode === 'voice' && <p className="text-center text-sm text-[var(--muted-foreground)]">הקול של המכשיר לפעמים מבטא לא מדויק מילים בלי ניקוד. אם משהו נשמע מוזר — עדיף שהורה יקריא.</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="ln-btn go" onClick={start} disabled={!words.length}>▶ מתחילים ({words.length} מילים)</button>
        <button type="button" className="ln-btn alt" onClick={() => setPrinting(mix ? shuffle(words) : words)} disabled={!words.length}>🖨️ דף הכתבה להדפסה</button>
      </div>
    </div>}
    {run && !done && <div className="ln-box text-center">
      <p className="font-bold">מילה {run.i + 1} מתוך {run.words.length}</p>
      <div className="ln-bar my-3"><i style={{ width: `${(run.i / run.words.length) * 100}%` }} /></div>
      {mode === 'parent'
        ? <><p className="text-[var(--muted-foreground)]">להורה: הקריאו את המילה פעמיים</p><div className="ln-big">{cur}</div>
          <div className="flex flex-wrap justify-center gap-3">{voiceOk && <button type="button" className="ln-btn alt" onClick={() => speak(cur, VOICE)}>🔊 השמעה</button>}<button type="button" className="ln-btn go" onClick={next}>הבאה ◀</button></div></>
        : <form onSubmit={e => { e.preventDefault(); next() }} className="space-y-4">
          <button type="button" className="ln-btn alt" onClick={() => speak(cur, VOICE)}>🔊 שמיעה שוב</button>
          <div><input ref={inputRef} className="ln-input" value={typed} onChange={e => setTyped(e.target.value)} dir={en ? 'ltr' : 'rtl'} lang={en ? 'en' : 'he'} autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="מה שמעתם?" placeholder="מקלידים כאן" /></div>
          <button type="submit" className="ln-btn go">הבאה ◀</button>
        </form>}
      <button type="button" className="mt-4 underline" onClick={() => setRun(null)}>יציאה</button>
    </div>}
    {done && <div className="ln-box text-center space-y-4">
      <h2 className="text-3xl font-black">{mode === 'voice' ? `${right} מתוך ${run.words.length} נכונות` : 'סיימנו! עכשיו בודקים'}</h2>
      {mode === 'voice'
        ? <ol className="text-right inline-block text-lg">{run.words.map((w, i) => { const ok = same(w, run.answers[i] || ''); return <li key={i}>{ok ? '✅' : '❌'} <b>{w}</b>{!ok && <span className="text-[var(--muted-foreground)]"> — כתבת: {run.answers[i] || '(ריק)'}</span>}</li> })}</ol>
        : <ol className="text-right inline-block text-2xl font-bold leading-relaxed">{run.words.map((w, i) => <li key={i}>{w}</li>)}</ol>}
      <div className="flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" onClick={start}>🔁 שוב</button><button type="button" className="ln-btn alt" onClick={() => setRun(null)}>רשימה אחרת</button></div>
    </div>}
    {printing && <PrintPreview title={`הכתבה — ${title}`} onClose={() => setPrinting(null)}>
      <DictationPrint title={title} words={printing} name={name} />
    </PrintPreview>}
    {!run && <div className="mx-auto mt-3 max-w-xs"><input className="ln-input !text-base" value={name} maxLength={16} onChange={e => setName(e.target.value)} placeholder="שם לדף ההדפסה (לא חובה)" aria-label="שם לדף ההדפסה" /></div>}
    <div className="mt-12"><SeoBody paragraphs={['הכתבה היא אחת הדרכים הטובות לחזק כתיב: הילד שומע מילה, חושב איך היא נכתבת וכותב אותה בעצמו. הרשימות כאן בנויות לפי הנושאים שמתרגלים בבית הספר — אותיות שנשמעות דומה (ט/ת, כ/ק, א/ע, ח/כ, ס/שׂ, ו/ב) ואותיות סופיות.', 'כל המילים כתובות בכתיב מלא לפי כללי האקדמיה ללשון העברית. אפשר גם להכניס את רשימת המילים מהמחברת ולתרגל בדיוק את מה שהמורה ביקשה.', 'במצב "הורה מקריא" המילה מופיעה בגדול על המסך, וההורה מקריא אותה. במצב הקולי המכשיר מקריא, הילד מקליד, ובסוף מקבלים תוצאה עם התיקונים.']} faq={faq} related={[{ label: 'הבנת הנקרא', href: '/learn/reading' }, { label: 'דפי שורות להדפסה', href: '/printables/lined-paper' }, { label: 'כרטיסיות לימוד', href: '/learn/flashcards' }]} /></div>
  </Page>
}

// ── /learn/reading ───────────────────────────────
// Short passages (learnData READING) + graded passages for grades 2–6 (readingGrades.js).
const ALL_READING = [...READING, ...GRADED_READING]
const GRADE_LEVELS = [2, 3, 4, 5, 6]
const GRADE_LETTER = { 2: 'ב׳', 3: 'ג׳', 4: 'ד׳', 5: 'ה׳', 6: 'ו׳' }
// Older short passages that fit a grade page as extra practice (by their grade label).
const SHORT_FOR = { 2: ['א׳–ב׳', 'ב׳–ג׳'], 3: ['ב׳–ג׳', 'ג׳–ד׳'], 4: ['ג׳–ד׳'] }
const opensOf = r => Array.isArray(r.open) ? r.open : [[r.open, null]]
// Every string of a passage (text, questions, options, model answers) — what the nikud toggle vocalizes.
const readingStrings = r => [r.title, ...r.text, ...r.q.flatMap(([q, o]) => [q, ...o]), ...opensOf(r).flatMap(([q, a]) => (a ? [q, a] : [q]))]
// Nikud toggle: vocalizes the given passages through the site's nakdan (Dicta) once switched on.
// Returns v(s) → the vocalized string when ready (the original until then) and the load state.
function useNikud(list, on) {
  const [res, setRes] = useState({ key: '', map: null, state: 'idle' })
  const key = list.map(r => r.slug).join('|')
  useEffect(() => {
    if (!on || res.key === key) return undefined
    let alive = true
    vocalizeAll(list.flatMap(readingStrings)).then(map => { if (alive) setRes({ key, map, state: 'ready' }) }).catch(() => { if (alive) setRes({ key, map: null, state: 'error' }) })
    return () => { alive = false }
  }, [on, key]) // eslint-disable-line react-hooks/exhaustive-deps
  const ready = on && res.key === key && res.map
  return { v: s => (ready ? res.map.get(s) || s : s), state: !on ? 'off' : res.key === key ? res.state : 'loading' }
}
const NIKUD_NOTE = 'הניקוד נוסף אוטומטית (באדיבות מפעל דיקטה) ויכול לטעות במילים בודדות.'
const qCount = r => r.q.length + opensOf(r).length
const gradeHref = g => `/learn/reading/grade-${g}`

function ReadingPrint({ r, v = s => s, answers = true }) {
  const opens = opensOf(r)
  return <>
    <article className="buga-flow ln-print" dir="rtl"><h2>{v(r.title)}</h2>
      <div className="meta"><span>שם: __________________</span><span>תאריך: ____________</span><span>{r.kind} · כיתה {r.grade}</span><span>ציון: ______</span></div>
      <div className="txt">{r.text.map((p, i) => <p key={i}>{v(p)}</p>)}</div>
      <h3>שאלות</h3>
      <ol className="qs">{r.q.map(([q, opts]) => <li key={q}><b>{v(q)}</b><ul>{opts.map(o => <li key={o}>☐ {v(o)}</li>)}</ul></li>)}
        {opens.map(([q]) => <li key={q}><b>{v(q)}</b><div className="write" /><div className="write" />{r.level >= 4 && <div className="write" />}</li>)}</ol></article>
    {answers && <article className="buga-flow ln-print" dir="rtl"><h2>תשובות — {r.title}</h2>
      <ol>{r.q.map(([q, opts, c]) => <li key={q}>{q} <b>{opts[c]}</b></li>)}
        {opens.map(([q, a]) => <li key={q}>{q} {a ? <><br /><i>תשובה אפשרית: {a}</i></> : <i>(תשובה פתוחה)</i>}</li>)}</ol></article>}
  </>
}
// Print options shared by a single passage and the grade booklet.
function PrintChoices({ nikud, setNikud, answers, setAnswers, state }) {
  return <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
    <Chip on={nikud} onClick={() => setNikud(!nikud)}>🔤 עם ניקוד</Chip>
    <Chip on={answers} onClick={() => setAnswers(!answers)}>✅ עם דף תשובות</Chip>
    {state === 'loading' && <span role="status">מנקדים…</span>}
    {state === 'error' && <span role="alert">הניקוד לא זמין כרגע — אפשר להדפיס בלי ניקוד.</span>}
  </div>
}

// One passage with its questions, solved on screen. Reset with `key` when the passage changes.
function ReadingExercise({ r, headingLevel = 2 }) {
  const [picks, setPicks] = useState({})
  const [checked, setChecked] = useState(false)
  const [big, setBig] = useState(false)
  const [showAns, setShowAns] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [shown, setShown] = useState({}) // projection: answers the teacher revealed, one question at a time
  const [nikud, setNikud] = useState(r.level === 1)
  const [answersOn, setAnswersOn] = useState(true)
  const { v, state: nikudState } = useNikud([r], nikud)
  const { on: teacher } = usePresentMode()
  const opens = opensOf(r)
  const score = r.q.filter((q, i) => picks[i] === q[2]).length
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return <>
    <div className="mb-3 flex flex-wrap justify-center gap-2"><Chip on={big} onClick={() => setBig(!big)}>🔍 אותיות גדולות</Chip><Chip on={nikud} onClick={() => setNikud(!nikud)}>🔤 עם ניקוד</Chip><button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ להדפסה עם דף תשובות</button></div>
    {nikudState === 'loading' && <p className="mb-2 text-center" role="status">מנקדים את הקטע…</p>}
    {nikudState === 'error' && <p className="mb-2 text-center" role="alert">הניקוד לא זמין כרגע. נסו שוב בעוד רגע.</p>}
    {nikudState === 'ready' && <p className="mb-2 text-center text-sm text-[var(--muted-foreground)]">{NIKUD_NOTE}</p>}
    <div className={`ln-box ln-text ${big ? 'is-big' : ''}`}>{r.text.map((p, i) => <p key={i}>{v(p)} <SpeakButton text={p} say={r.say && applySay(p, r.say)} label={`השמעת פסקה ${i + 1}`} className="!min-h-[30px] !min-w-[30px] !text-base align-middle" /></p>)}</div>
    <H className="mt-8 mb-3 text-2xl font-black">שאלות</H>
    <div className="space-y-3">{r.q.map(([q, opts, c], i) => <div key={q} className="ln-q"><b>{i + 1}. {v(q)}</b> <SpeakButton text={q} say={r.say && applySay(q, r.say)} label="השמעת השאלה" className="!min-h-[30px] !min-w-[30px] !text-base align-middle" />
      {opts.map((o, j) => <button key={o} type="button" aria-pressed={picks[i] === j} disabled={checked} onClick={() => setPicks(p => ({ ...p, [i]: j }))}
        className={`ln-opt ${(checked || shown[i]) && j === c ? 'is-right' : ''} ${checked && picks[i] === j && j !== c ? 'is-wrong' : ''}`}>{v(o)}</button>)}
      {teacher && !checked && <button type="button" className="ln-chip mt-2" onClick={() => setShown(s => ({ ...s, [i]: !s[i] }))}>{shown[i] ? '🙈 הסתרת התשובה' : '👁️ חשיפת התשובה'}</button>}</div>)}
      {opens.map(([q, a], k) => <div key={q} className="ln-q"><b>{r.q.length + k + 1}. {v(q)}</b><textarea className="ln-ta mt-2" aria-label={`תשובה פתוחה ${k + 1}`} placeholder="כותבים כאן או בדף" />
        {a && (showAns || teacher) && <p className="mt-2 rounded-xl bg-[#e7f8e4] p-2"><b>תשובה אפשרית:</b> <span data-answer>{a}</span></p>}</div>)}
    </div>
    <div className="mt-5 text-center">{checked
      ? <><p className="text-2xl font-black" role="status">{score} מתוך {r.q.length} בשאלות הסגורות {score === r.q.length ? '🌟' : ''}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">{opens.some(o => o[1]) && <button type="button" className="ln-btn go" onClick={() => setShowAns(!showAns)}>{showAns ? 'הסתרת התשובות הפתוחות' : '💡 הצגת תשובות לשאלות הפתוחות'}</button>}
          <button type="button" className="ln-btn alt" onClick={() => { setPicks({}); setChecked(false); setShowAns(false) }}>🔁 לנסות שוב</button></div></>
      : <button type="button" className="ln-btn go" disabled={Object.keys(picks).length < r.q.length} onClick={() => setChecked(true)}>✓ בדיקה</button>}</div>
    {printing && <PrintPreview title={r.title} onClose={() => setPrinting(false)}><div className="no-print"><PrintChoices nikud={nikud} setNikud={setNikud} answers={answersOn} setAnswers={setAnswersOn} state={nikudState} /></div><ReadingPrint r={r} v={v} answers={answersOn} /></PrintPreview>}
  </>
}

const READING_FAQ = [
  { q: 'איך יודעים איזה קטע מתאים לילד?', a: 'מתחילים בעמוד של הכיתה שבה הילד לומד. אם הקטע ארוך או קשה מדי — עוברים לכיתה אחת למטה, ואם הוא קל מדי — לכיתה אחת למעלה. העיקר שהילד יצליח לקרוא את הקטע עד הסוף בלי להתייאש.' },
  { q: 'מה ההבדל בין שאלה סגורה לשאלה פתוחה?', a: 'בשאלה סגורה (אמריקאית) בוחרים תשובה מתוך ארבע. בשאלה פתוחה כותבים תשובה במילים שלכם — לפעמים צריך להסיק משהו שלא כתוב במפורש, לנמק או להביע דעה.' },
  { q: 'אפשר להדפיס את הקטעים?', a: 'כן. בכל קטע יש כפתור "להדפסה", ובכל עמוד כיתה אפשר להדפיס את כל הקטעים יחד כחוברת — עם דף תשובות להורה או למורה, כולל תשובות אפשריות לשאלות הפתוחות.' },
  { q: 'הקטעים מתאימים לתוכנית הלימודים?', a: 'הקטעים נכתבו במיוחד לאתר, ואורכם ורמת השפה שלהם מותאמים לכל שכבת גיל. סוגי השאלות — איתור מידע, פירוש מילים, הסקת מסקנות ונימוק — הם סוגי השאלות המקובלים בתרגול הבנת הנקרא בבית הספר.' },
]
export function ReadingIndex() {
  return <Page>
    <SEO title="הבנת הנקרא — קטעים עם שאלות לכיתות ב׳–ו׳, אונליין ולהדפסה" description={`הבנת הנקרא לילדים: ${ALL_READING.length} קטעים מקוריים — סיפורים, משלים, קטעי מידע וטקסט טיעון — עם שאלות סגורות ופתוחות ודף תשובות. מחולק לפי כיתות ב׳ עד ו׳, אונליין ולהדפסה.`} path="/learn/reading" structuredData={faqSchema(READING_FAQ)} />
    <Head emoji="📖" h1="הבנת הנקרא" sub="קוראים קטע ועונים על שאלות — על המסך או על הדף" crumb="הבנת הנקרא" />
    <QuickAnswer q="איפה מוצאים קטעי הבנת הנקרא עם שאלות בחינם?" a={<>כאן: {ALL_READING.length} קטעים מקוריים לכיתות ב׳–ו׳ — סיפורים, משלים, קטעי מידע וטקסט טיעון — עם שאלות סגורות ופתוחות ודף תשובות. פותרים על המסך עם בדיקה מיידית, או מדפיסים חוברת לכל כיתה. בלי הרשמה ובלי תשלום.</>} rows={[['כיתות', 'ב׳ עד ו׳ (8 קטעים לכל כיתה) + קטעים קצרים לכיתות א׳–ד׳'], ['סוגי שאלות', 'איתור מידע, פירוש מילים, הסקת מסקנות, נימוק ודעה'], ['איך עובדים', 'אונליין עם בדיקה, או הדפסה כחוברת עם דף תשובות'], ['מחיר', 'חינם, בלי הרשמה']]} updated="2026-10-21" />
    <p className="text-lg leading-relaxed mb-6">תרגול הבנת הנקרא לפי כיתה: בכל עמוד שמונה קטעים חדשים באורך ובאוצר המילים שמתאימים לשכבה, עם שאלות סגורות, שאלות פתוחות ושאלות הסקה — ודף תשובות להדפסה.</p>
    <h2 className="mb-3 text-3xl font-black">בוחרים כיתה</h2>
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">{GRADE_LEVELS.map(g => <Link key={g} to={gradeHref(g)} className="ln-box card-lift text-center"><div className="text-3xl font-black">כיתה {GRADE_LETTER[g]}</div><small>{GRADED_READING.filter(r => r.level === g).length} קטעים עם שאלות</small></Link>)}</div>
    <h2 className="mt-10 mb-3 text-3xl font-black">כל הקטעים לפי כיתה</h2>
    {GRADE_LEVELS.map(g => <section key={g} className="mb-6"><h3 className="mb-2 text-xl font-bold"><Link to={gradeHref(g)} className="underline">כיתה {GRADE_LETTER[g]}</Link></h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{GRADED_READING.filter(r => r.level === g).map(r => <Link key={r.slug} to={`/learn/reading/${r.slug}`} className="ln-box card-lift text-right"><span aria-hidden="true">{r.emoji} </span><b>{r.title}</b><br /><small>{r.kind} · {qCount(r)} שאלות</small></Link>)}</div></section>)}
    <h2 className="mt-10 mb-3 text-3xl font-black">קטעים קצרים לכיתות א׳–ד׳</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{READING.map(r => <Link key={r.slug} to={`/learn/reading/${r.slug}`} className="ln-box card-lift text-right"><div className="text-4xl" aria-hidden="true">{r.emoji}</div><h3 className="text-xl font-bold">{r.title}</h3><small>{r.kind} · כיתה {r.grade}</small></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['הבנת הנקרא היא היכולת לא רק לקרוא את המילים, אלא להבין מה כתוב — למצוא מידע, להבין מילים חדשות מתוך ההקשר, להסיק מסקנות ולהביע דעה מנומקת. כמו כל מיומנות, היא משתפרת בתרגול קצר וקבוע.', 'בכל עמוד כיתה יש שמונה קטעים: סיפורים, משלים, קטעי מידע ובכיתות הגבוהות גם טקסט טיעון. אחרי כל קטע יש שאלות אמריקאיות ושאלות פתוחות, ואפשר לבדוק את התשובות על המסך או להדפיס את כל הקטעים כחוברת עם דף תשובות.', 'כל הקטעים נכתבו במיוחד לאתר. בקטעי המידע הקפדנו על עובדות פשוטות ומבוססות, והמשלים הם סיפורים חדשים על בסיס משלים עתיקים ומוכרים.']} faq={READING_FAQ} related={[{ label: '10 טיפים לשיפור הבנת הנקרא', href: '/guides/reading-comprehension-tips' }, { label: 'הכתבה אונליין', href: '/learn/dictation' }, { label: 'הכנה למבחן מחוננים', href: '/learn/gifted-test' }, { label: 'סיפורים לפני השינה', href: '/stories' }]} /></div>
  </Page>
}

export function ReadingGrade({ grade }) {
  const g = Number(grade)
  const info = READING_GRADE_PAGES[g]
  const list = useMemo(() => GRADED_READING.filter(r => r.level === g), [g])
  const [cur, setCur] = useState(0)
  const [printAll, setPrintAll] = useState(false)
  const [bookNikud, setBookNikud] = useState(g === 1)
  const [bookAnswers, setBookAnswers] = useState(true)
  const book = useNikud(printAll ? list : [], printAll && bookNikud)
  if (!info) return <NotFound />
  const r = list[cur]
  const short = READING.filter(x => (SHORT_FOR[g] || []).includes(x.grade))
  const [lo, hi] = GRADE_WORDS[g]
  return <Page>
    <SEO title={info.seoTitle} description={info.seoDesc} path={gradeHref(g)} structuredData={faqSchema(info.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: 'הבנת הנקרא', href: '/learn/reading' }, { label: `כיתה ${GRADE_LETTER[g]}` }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">📖 </span>הבנת הנקרא כיתה {GRADE_LETTER[g]}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">{list.length} קטעים · {lo}–{hi} מילים בקטע · {list.reduce((s, x) => s + qCount(x), 0)} שאלות</p>
    <p className="text-lg leading-relaxed mb-5">{info.intro}</p>
    <div className="mb-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="בחירת קטע">{list.map((x, i) => <button key={x.slug} type="button" role="tab" aria-selected={i === cur} className="ln-chip" aria-pressed={i === cur} onClick={() => setCur(i)}>{x.emoji} {x.title}</button>)}</div>
    <div className="ln-box mb-3 text-center"><h2 className="text-3xl font-black">{r.emoji} {r.title}</h2><small>{r.kind} · {qCount(r)} שאלות · <Link className="underline" to={`/learn/reading/${r.slug}`}>לעמוד של הקטע</Link></small></div>
    <ReadingExercise key={r.slug} r={r} headingLevel={3} />
    <div className="ln-box mt-8 text-center">
      <h2 className="text-2xl font-black mb-2">🖨️ חוברת הבנת הנקרא לכיתה {GRADE_LETTER[g]}</h2>
      <p className="mb-3">כל {list.length} הקטעים עם השאלות, ובסוף כל קטע — דף תשובות להורה או למורה.</p>
      <button type="button" className="ln-btn go" onClick={() => setPrintAll(true)}>הדפסה או הורדה כ־PDF</button>
    </div>
    {printAll && <PrintPreview title={`הבנת הנקרא כיתה ${GRADE_LETTER[g]} — ${list.length} קטעים`} onClose={() => setPrintAll(false)}><div className="no-print"><PrintChoices nikud={bookNikud} setNikud={setBookNikud} answers={bookAnswers} setAnswers={setBookAnswers} state={book.state} /></div>{list.map(x => <ReadingPrint key={x.slug} r={x} v={book.v} answers={bookAnswers} />)}</PrintPreview>}
    <h2 className="mt-10 mb-3 text-3xl font-black">מה מצופה בכיתה {GRADE_LETTER[g]}?</h2>
    <div className="space-y-3 text-lg leading-relaxed">{info.expect.map(p => <p key={p}>{p}</p>)}</div>
    <h2 className="mt-10 mb-3 text-2xl font-black">טיפים להורים</h2>
    <ul className="list-disc pr-6 space-y-1 text-lg">{info.tips.map(t => <li key={t}>{t}</li>)}</ul>
    {short.length > 0 && <><h2 className="mt-10 mb-3 text-2xl font-black">עוד קטעים קצרים לתרגול</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{short.map(o => <Link key={o.slug} to={`/learn/reading/${o.slug}`} className="ln-box card-lift text-right"><b>{o.emoji} {o.title}</b> <small>· {o.kind} · כיתה {o.grade}</small></Link>)}</div></>}
    <h2 className="mt-10 mb-3 text-2xl font-black">הבנת הנקרא לכיתות אחרות</h2>
    <div className="flex flex-wrap gap-2">{GRADE_LEVELS.filter(x => x !== g).map(x => <Link key={x} to={gradeHref(x)} className="ln-chip">כיתה {GRADE_LETTER[x]}</Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={info.body} faq={info.faq} related={[{ label: 'הבנת הנקרא — כל הכיתות', href: '/learn/reading' }, ...info.related]} /></div>
  </Page>
}

export function ReadingPage() {
  const { slug } = useParams()
  const r = ALL_READING.find(x => x.slug === slug)
  const others = useMemo(() => {
    if (!r) return []
    const same = ALL_READING.filter(x => x.slug !== slug && (r.level ? x.level === r.level : !x.level))
    return same.slice(0, 4)
  }, [slug, r])
  if (!r) return <NotFound />
  const n = qCount(r)
  return <Page>
    <SEO title={`${r.title} — הבנת הנקרא לכיתה ${r.grade} עם שאלות`} description={`קטע הבנת הנקרא "${r.title}" (${r.kind}) לכיתה ${r.grade}: ${r.text[0].slice(0, r.title.length > 18 ? 60 : 75)}… עם ${n} שאלות, דף תשובות ודף להדפסה.`} path={`/learn/reading/${r.slug}`} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: 'הבנת הנקרא', href: '/learn/reading' }, ...(r.level ? [{ label: `כיתה ${GRADE_LETTER[r.level]}`, href: gradeHref(r.level) }] : []), { label: r.title }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{r.emoji} </span>{r.title}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">{r.kind} · כיתה {r.grade} · {n} שאלות</p>
    <ReadingExercise key={r.slug} r={r} />
    <h2 className="mt-12 mb-3 text-2xl font-black">עוד קטעים</h2>
    <div className="grid gap-3 sm:grid-cols-2">{others.map(o => <Link key={o.slug} to={`/learn/reading/${o.slug}`} className="ln-box text-right"><b>{o.emoji} {o.title}</b> <small>· {o.kind} · כיתה {o.grade}</small></Link>)}</div>
    <p className="mt-6 text-center">{r.level ? <Link className="underline font-bold" to={gradeHref(r.level)}>לכל הקטעים לכיתה {GRADE_LETTER[r.level]} ←</Link> : <Link className="underline font-bold" to="/learn/reading">לכל קטעי הבנת הנקרא ←</Link>}</p>
  </Page>
}
