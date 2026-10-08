import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import NotFound from '../pages/NotFound'
import { speak, hasVoice } from '../utils/speak'
import { DICTATION, READING, plainWord } from './learnData'
import './learn.css'

export const LEARN_CRUMB = { label: 'לומדים בבית', href: '/learn' }
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[x[i], x[j]] = [x[j], x[i]] } return x }
const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
function Head({ emoji, h1, sub, crumb }) {
  return <>
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, ...(crumb ? [LEARN_CRUMB, { label: crumb }] : [{ label: LEARN_CRUMB.label }])]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{emoji} </span>{h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{sub}</p>
  </>
}

// ── /learn ───────────────────────────────
export const LEARN_SECTIONS = [
  ['/learn/dictation', '✍️', 'הכתבה', 'הורה מקריא או הקראה קולית — עם בדיקה ודף להדפסה'],
  ['/learn/reading', '📖', 'הבנת הנקרא', `${READING.length} קטעים קצרים עם שאלות — אונליין ולהדפסה`],
  ['/learn/times-tables', '✖️', 'אתגר לוח הכפל', 'דקה אחת, כמה תרגילים תספיקו? ולוח הכפל להדפסה'],
  ['/learn/flashcards', '🃏', 'כרטיסיות לימוד', 'אנגלית, הפכים, לוח הכפל — או כרטיסיות משלכם'],
  ['/learn/gifted-test', '🧠', 'הכנה למבחן מחוננים', '120 שאלות תרגול: אנלוגיות, סדרות, מטריצות וחשיבה לוגית'],
]
export function LearnHub() {
  return <Page>
    <SEO title="לומדים בבית — הכתבה, הבנת הנקרא, לוח הכפל וכרטיסיות" description="תרגול לימודי לילדים בבית: הכתבה אונליין עם בדיקה, קטעי הבנת הנקרא עם שאלות, אתגר לוח הכפל וכרטיסיות לימוד להדפסה. חינם ובעברית." path="/learn" />
    <Head emoji="🎒" h1="לומדים בבית" sub="עשר דקות ביום של תרגול — בלי דפים שהולכים לאיבוד" />
    <div className="grid gap-5 sm:grid-cols-2">{LEARN_SECTIONS.map(([to, e, t, d]) => <Link key={to} to={to} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-5 text-right"><div className="text-4xl mb-2" aria-hidden="true">{e}</div><h2 className="text-2xl font-bold">{t}</h2><p className="text-[var(--muted-foreground)]">{d}</p></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['תרגול קצר וקבוע עובד טוב יותר מישיבה ארוכה פעם בשבוע. כאן יש ארבעה כלים שאפשר לפתוח בטלפון או במחשב: הכתבה, הבנת הנקרא, לוח הכפל וכרטיסיות — וכל אחד מהם אפשר גם להדפיס.', 'כל הקטעים והרשימות נכתבו במיוחד לאתר, בכתיב מלא לפי כללי האקדמיה ללשון העברית, ומתאימים לכיתות א׳–ד׳.']} related={[{ label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'דפי שורות לכתיבה', href: '/printables/lined-paper' }]} /></div>
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
export function Dictation() {
  const [listId, setListId] = useState(DICTATION[0].id)
  const [custom, setCustom] = useState('')
  const [mode, setMode] = useState('parent')
  const [mix, setMix] = useState(true)
  const [run, setRun] = useState(null) // { words, i, answers }
  const [typed, setTyped] = useState('')
  const [voiceOk, setVoiceOk] = useState(false)
  const [printing, setPrinting] = useState(null)
  const [name, setName] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { hasVoice('he-IL').then(setVoiceOk) }, [])
  const list = DICTATION.find(d => d.id === listId)
  const customWords = custom.split(/[\n,،]+/).map(w => w.trim()).filter(Boolean).slice(0, 30)
  const words = listId === 'custom' ? customWords : list.words
  const title = listId === 'custom' ? 'הרשימה שלי' : list.title
  const start = () => { if (!words.length) return; const w = mix ? shuffle(words) : words; setRun({ words: w, i: 0, answers: [] }); setTyped(''); if (mode === 'voice') speak(w[0]) }
  const cur = run && run.words[run.i]
  const done = run && run.i >= run.words.length
  useEffect(() => { if (run && !done && mode === 'voice') inputRef.current?.focus() }, [run, done, mode])
  const next = () => {
    const answers = mode === 'voice' ? [...run.answers, typed.trim()] : run.answers
    const i = run.i + 1
    setRun({ ...run, i, answers }); setTyped('')
    if (mode === 'voice' && i < run.words.length) setTimeout(() => speak(run.words[i]), 250)
  }
  const right = done && mode === 'voice' ? run.words.filter((w, i) => plainWord(w) === plainWord(run.answers[i] || '')).length : 0
  const faq = [
    { q: 'איך עושים הכתבה בבית?', a: 'בוחרים רשימה, ההורה מקריא כל מילה פעמיים והילד כותב בדף. בסוף פותחים את רשימת המילים ובודקים יחד. אפשר להדפיס דף הכתבה עם שורות ממוספרות ודף תשובות נפרד להורה.' },
    { q: 'הקול במכשיר מבטא מילה לא נכון — מה עושים?', a: 'הקראה קולית משתמשת בקול של המכשיר, ובעברית בלי ניקוד הוא טועה לפעמים בהגייה. לכן מצב "הורה מקריא" הוא ברירת המחדל, ובמצב הקולי תמיד אפשר לבקש מהורה לעזור.' },
    { q: 'אפשר להכניס את המילים מהמחברת?', a: 'כן — בוחרים "רשימה משלי" וכותבים את המילים, כל מילה בשורה או מופרדות בפסיק. עד 30 מילים.' },
  ]
  return <Page>
    <SEO title="הכתבה אונליין לילדים — תרגול הכתבה עם בדיקה ודף להדפסה" description="תרגול הכתבה לכיתות א׳–ד׳: רשימות מוכנות (ט/ת, כ/ק, א/ע, ח/כ, אותיות סופיות) או רשימה משלכם. הורה מקריא או הקראה קולית עם בדיקה אוטומטית, ודף הכתבה להדפסה." path="/learn/dictation" structuredData={faqSchema(faq)} />
    <Head emoji="✍️" h1="הכתבה" sub="בוחרים רשימה — ההורה מקריא, הילד כותב, ובסוף בודקים יחד" crumb="הכתבה" />
    {!run && <div className="ln-box space-y-4">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="רשימה">
        {DICTATION.map(d => <Chip key={d.id} on={listId === d.id} onClick={() => setListId(d.id)}>{d.title} <small className="opacity-70">· {d.grade}</small></Chip>)}
        <Chip on={listId === 'custom'} onClick={() => setListId('custom')}>📝 רשימה משלי</Chip>
      </div>
      {listId === 'custom'
        ? <textarea className="ln-ta" value={custom} onChange={e => setCustom(e.target.value)} placeholder={'כותבים את המילים מהמחברת — כל מילה בשורה או עם פסיק'} aria-label="המילים שלי" />
        : <p className="text-center text-lg">{list.words.join(' · ')}</p>}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="איך מקריאים">
        <Chip on={mode === 'parent'} onClick={() => setMode('parent')}>👩 הורה מקריא</Chip>
        <Chip on={mode === 'voice'} onClick={() => setMode('voice')} disabled={!voiceOk} title={voiceOk ? '' : 'אין במכשיר קול בעברית'}>🔊 הקראה קולית והקלדה</Chip>
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
          <div className="flex flex-wrap justify-center gap-3">{voiceOk && <button type="button" className="ln-btn alt" onClick={() => speak(cur)}>🔊 השמעה</button>}<button type="button" className="ln-btn go" onClick={next}>הבאה ◀</button></div></>
        : <form onSubmit={e => { e.preventDefault(); next() }} className="space-y-4">
          <button type="button" className="ln-btn alt" onClick={() => speak(cur)}>🔊 שמיעה שוב</button>
          <div><input ref={inputRef} className="ln-input" value={typed} onChange={e => setTyped(e.target.value)} dir="rtl" lang="he" autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="מה שמעתם?" placeholder="מקלידים כאן" /></div>
          <button type="submit" className="ln-btn go">הבאה ◀</button>
        </form>}
      <button type="button" className="mt-4 underline" onClick={() => setRun(null)}>יציאה</button>
    </div>}
    {done && <div className="ln-box text-center space-y-4">
      <h2 className="text-3xl font-black">{mode === 'voice' ? `${right} מתוך ${run.words.length} נכונות` : 'סיימנו! עכשיו בודקים'}</h2>
      {mode === 'voice'
        ? <ol className="text-right inline-block text-lg">{run.words.map((w, i) => { const ok = plainWord(w) === plainWord(run.answers[i] || ''); return <li key={i}>{ok ? '✅' : '❌'} <b>{w}</b>{!ok && <span className="text-[var(--muted-foreground)]"> — כתבת: {run.answers[i] || '(ריק)'}</span>}</li> })}</ol>
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
export function ReadingIndex() {
  return <Page>
    <SEO title="הבנת הנקרא לכיתות א׳–ד׳ — קטעים עם שאלות, אונליין ולהדפסה" description={`${READING.length} קטעי הבנת הנקרא קצרים לילדים: סיפורים, משלים וקטעי מידע, עם שאלות אמריקאיות ושאלה פתוחה. פותרים אונליין או מדפיסים עם דף תשובות.`} path="/learn/reading" />
    <Head emoji="📖" h1="הבנת הנקרא" sub="קוראים קטע קצר ועונים על שאלות — על המסך או על הדף" crumb="הבנת הנקרא" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{READING.map(r => <Link key={r.slug} to={`/learn/reading/${r.slug}`} className="ln-box card-lift text-right"><div className="text-4xl" aria-hidden="true">{r.emoji}</div><h2 className="text-xl font-bold">{r.title}</h2><small>{r.kind} · כיתה {r.grade}</small></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['כל קטע כאן קצר מספיק כדי לקרוא אותו בכמה דקות, ואחריו ארבע שאלות אמריקאיות ושאלה פתוחה אחת לכתיבה. יש סיפורים, משלים מוכרים (כמו הארנבת והצב) וקטעי מידע על בעלי חיים ועל מקומות בארץ.', 'הקטעים נכתבו במיוחד לאתר. בקטעי המידע הקפדנו על עובדות פשוטות ומבוססות. כל קטע אפשר להדפיס יחד עם דף תשובות להורה או למורה.']} related={[{ label: 'הכתבה', href: '/learn/dictation' }, { label: 'מבחן אמריקאי משלכם', href: '/classroom/quiz' }]} /></div>
  </Page>
}
function ReadingPrint({ r }) {
  return <>
    <article className="buga-flow ln-print" dir="rtl"><h2>{r.title}</h2>
      <div className="meta"><span>שם: __________________</span><span>תאריך: ____________</span></div>
      <div className="txt">{r.text.map((p, i) => <p key={i}>{p}</p>)}</div>
      <h3>שאלות</h3>
      <ol className="qs">{r.q.map(([q, opts]) => <li key={q}><b>{q}</b><ul>{opts.map(o => <li key={o}>☐ {o}</li>)}</ul></li>)}
        <li><b>{r.open}</b><div className="write" /><div className="write" /></li></ol></article>
    <article className="buga-flow ln-print" dir="rtl"><h2>תשובות — {r.title}</h2><ol>{r.q.map(([q, opts, c]) => <li key={q}>{q} <b>{opts[c]}</b></li>)}<li>{r.open} <i>(תשובה פתוחה)</i></li></ol></article>
  </>
}
export function ReadingPage() {
  const { slug } = useParams()
  const r = READING.find(x => x.slug === slug)
  const [picks, setPicks] = useState({})
  const [checked, setChecked] = useState(false)
  const [big, setBig] = useState(false)
  const [printing, setPrinting] = useState(false)
  const others = useMemo(() => READING.filter(x => x.slug !== slug).slice(0, 4), [slug])
  useEffect(() => { setPicks({}); setChecked(false) }, [slug])
  if (!r) return <NotFound />
  const score = r.q.filter((q, i) => picks[i] === q[2]).length
  return <Page>
    <SEO title={`${r.title} — הבנת הנקרא לכיתה ${r.grade} עם שאלות`} description={`קטע הבנת הנקרא "${r.title}" (${r.kind}) לכיתה ${r.grade}: ${r.text[0].slice(0, 80)}… עם 4 שאלות אמריקאיות, שאלה פתוחה ודף להדפסה.`} path={`/learn/reading/${r.slug}`} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: 'הבנת הנקרא', href: '/learn/reading' }, { label: r.title }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{r.emoji} </span>{r.title}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">{r.kind} · כיתה {r.grade}</p>
    <div className="mb-3 flex flex-wrap justify-center gap-2"><Chip on={big} onClick={() => setBig(!big)}>🔍 אותיות גדולות</Chip><button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ להדפסה עם דף תשובות</button></div>
    <div className={`ln-box ln-text ${big ? 'is-big' : ''}`}>{r.text.map((p, i) => <p key={i}>{p}</p>)}</div>
    <h2 className="mt-8 mb-3 text-2xl font-black">שאלות</h2>
    <div className="space-y-3">{r.q.map(([q, opts, c], i) => <div key={q} className="ln-q"><b>{i + 1}. {q}</b>
      {opts.map((o, j) => <button key={o} type="button" aria-pressed={picks[i] === j} disabled={checked} onClick={() => setPicks(p => ({ ...p, [i]: j }))}
        className={`ln-opt ${checked && j === c ? 'is-right' : ''} ${checked && picks[i] === j && j !== c ? 'is-wrong' : ''}`}>{o}</button>)}</div>)}
      <div className="ln-q"><b>{r.q.length + 1}. {r.open}</b><textarea className="ln-ta mt-2" aria-label="תשובה פתוחה" placeholder="כותבים כאן או בדף" /></div>
    </div>
    <div className="mt-5 text-center">{checked
      ? <><p className="text-2xl font-black">{score} מתוך {r.q.length} {score === r.q.length ? '🌟' : ''}</p><button type="button" className="ln-btn alt mt-3" onClick={() => { setPicks({}); setChecked(false) }}>🔁 לנסות שוב</button></>
      : <button type="button" className="ln-btn go" disabled={Object.keys(picks).length < r.q.length} onClick={() => setChecked(true)}>✓ בדיקה</button>}</div>
    {printing && <PrintPreview title={r.title} onClose={() => setPrinting(false)}><ReadingPrint r={r} /></PrintPreview>}
    <h2 className="mt-12 mb-3 text-2xl font-black">עוד קטעים</h2>
    <div className="grid gap-3 sm:grid-cols-2">{others.map(o => <Link key={o.slug} to={`/learn/reading/${o.slug}`} className="ln-box text-right"><b>{o.emoji} {o.title}</b> <small>· {o.kind} · כיתה {o.grade}</small></Link>)}</div>
  </Page>
}
