import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../../pages/NotFound'
import { speak, stopSpeaking } from '../../utils/speak'
import { englishGrade } from '../../data/englishCurriculum'
import { VOCAB_BANDS, VOCAB_GRADES, bandOfGrade, vocabGrade, vocabHref, vocabWordCount } from '../../data/englishVocab'
import '../learn.css'
import '../subjects/subjects.css'
import './englishVocab.css'

// /learn/english/grade-N/vocabulary — the grade's vocabulary units as big tiles;
// /learn/english/grade-N/vocabulary/:unit — one unit: word cards with sound, flip-card practice,
// a 10-question quiz (English→Hebrew and Hebrew→English) and a printable word list + quiz + answer key.
const Page = ({ children }) => <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const HOME = { label: 'ראשי', href: '/' }
const LEARN = { label: 'לומדים', href: '/learn' }
const BY_GRADE = { label: 'אנגלית לפי כיתה', href: '/learn/english' }
const TILE_COLORS = ['#ffd6e0', '#c9f0ff', '#d9f7c4', '#ffe9a8', '#e5d9ff', '#ffd9b8']
const LETTERS = ['א', 'ב', 'ג', 'ד']

const gradeFromSlug = slug => { const m = /^grade-(\d{1,2})$/.exec(slug || ''); return m ? vocabGrade(Number(m[1])) : undefined }
const gradeName = n => englishGrade(`grade-${n}`)?.name || `כיתה ${n}`
const sayWord = w => void import('../../utils/wordMeaning').then(m => m.pronounce(w, 'en')).catch(() => speak(w, 'en-US', { rate: 0.8 }))
const saySentence = s => void speak(s, 'en-US', { rate: 0.85 })

// ── quiz: a seeded shuffle, so the first quiz is the same on the server, in the browser and on paper ──
function rng(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const shuffle = (arr, r) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

function buildQuiz(words, seed = 1, count = 10) {
  const r = rng(seed * 7919 + words.length)
  return shuffle(words, r).slice(0, count).map((w, i) => {
    const toHe = i % 2 === 0 // even questions: English → Hebrew; odd: Hebrew → English
    const others = shuffle(words.filter(x => x !== w), r).slice(0, 3)
    const options = shuffle([w, ...others], r)
    return { word: w, toHe, prompt: toHe ? w[0] : w[1], options: options.map(o => (toHe ? o[1] : o[0])), answer: options.indexOf(w) }
  })
}

const gradeFaq = (g, name) => [
  { q: `אילו מילים באנגלית לומדים ב${name}?`, a: `ב${name} מתרגלים ${vocabWordCount(g)} מילים ב-${g.units.length} נושאים: ${g.units.map(u => u.title).join(', ')}. המילים מותאמות ל${VOCAB_BANDS[bandOfGrade(g.n)].label} (${VOCAB_BANDS[bandOfGrade(g.n)].en}) בתוכנית הלימודים באנגלית של משרד החינוך.` },
  { q: 'איך מתרגלים את המילים?', a: 'בכל נושא יש כרטיסי מילים עם תרגום, הגייה ומשפט לדוגמה, כרטיסיות הפוכות לשינון, וחידון של 10 שאלות — מאנגלית לעברית ומעברית לאנגלית — עם משוב מיידי.' },
  { q: 'אפשר להדפיס את רשימת המילים?', a: 'כן. בכל נושא יש כפתור הדפסה שמוציא את רשימת המילים עם התרגום והמשפטים, חידון ודף תשובות — מתאים לתרגול לפני מבחן.' },
  { q: 'זה בחינם?', a: 'כן, כל המילים, ההגייה, הכרטיסיות והחידונים בחינם ובלי הרשמה.' },
]

function GradeNav({ n }) {
  return <nav className="ev-grades" aria-label="אוצר מילים לפי כיתה">{VOCAB_GRADES.map(g => <Link key={g.n} to={vocabHref(g.n)} className="ln-chip" aria-current={g.n === n ? 'page' : undefined}>{gradeName(g.n)}</Link>)}</nav>
}

function UnitTiles({ g, active, compact }) {
  return <ul className={`ev-tiles ${compact ? 'is-compact' : ''}`}>{g.units.map((u, i) => <li key={u.slug}>
    <Link to={vocabHref(g.n, u.slug)} className="ev-tile" style={{ '--tile': TILE_COLORS[i % TILE_COLORS.length] }} aria-current={active === u.slug ? 'page' : undefined}>
      <span className="ev-tile-emoji" aria-hidden="true">{u.emoji}</span>
      <b>{u.title}</b>
      <bdi dir="ltr" className="ev-tile-en">{u.en}</bdi>
      {!compact && <small>{u.words.length} מילים · {u.words.slice(0, 3).map(w => w[0]).join(', ')}…</small>}
    </Link>
  </li>)}</ul>
}

export function VocabGrade() {
  const { grade } = useParams(), g = gradeFromSlug(grade)
  if (!g) return <NotFound />
  const name = gradeName(g.n), band = VOCAB_BANDS[bandOfGrade(g.n)], path = vocabHref(g.n), total = vocabWordCount(g)
  const faq = gradeFaq(g, name)
  const list = { '@context': 'https://schema.org', '@type': 'ItemList', name: `אוצר מילים באנגלית ל${name}`, itemListElement: g.units.map((u, i) => ({ '@type': 'ListItem', position: i + 1, name: `${u.title} — ${u.en}`, url: `https://ugabuga.co.il${vocabHref(g.n, u.slug)}` })) }
  return <Page>
    <SEO title={`אוצר מילים באנגלית ל${name} — ${total} מילים עם תרגום, הגייה וחידון`} description={`${total} מילים באנגלית ל${name} ב-${g.units.length} נושאים (${g.units.map(u => u.title).join(', ')}): תרגום לעברית, הגייה, משפט לדוגמה, כרטיסיות, חידון ודף להדפסה. לפי תוכנית משרד החינוך, בחינם.`} path={path} structuredData={[list, faqSchema(faq)]} />
    <Breadcrumbs items={[HOME, LEARN, BY_GRADE, { label: name, href: `/learn/english/grade-${g.n}` }, { label: 'אוצר מילים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">🔤 </span>אוצר מילים באנגלית ל{name}</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">{total} מילים · {g.units.length} נושאים · {band.label} · <bdi dir="ltr">{band.en}</bdi></p>
    <p className="sj-intro">{band.about} בוחרים נושא, שומעים כל מילה, הופכים כרטיסיות ובודקים את עצמכם בחידון של 10 שאלות.</p>
    <h2 className="mb-3 mt-8 text-2xl font-black">בחרו נושא</h2>
    <UnitTiles g={g} />
    <h2 className="mb-3 mt-10 text-2xl font-black">אוצר מילים לכיתות אחרות</h2>
    <GradeNav n={g.n} />
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <Link to={`/learn/english/grade-${g.n}`} className="ln-box card-lift text-right"><b className="text-lg">🇬🇧 כל האנגלית ל{name}</b><br /><small>דקדוק, אנסין, חוברת וקריאה עם מילון</small></Link>
      <Link to="/learn/english-reading" className="ln-box card-lift text-right"><b className="text-lg">📖 קריאה באנגלית עם מילון</b><br /><small>נוגעים במילה ומקבלים תרגום</small></Link>
    </div>
    <div className="mt-12"><SeoBody paragraphs={[
      `אוצר מילים הוא הבסיס להבנת הנקרא באנגלית: מי שמכיר את המילים מבין את האנסין, את השאלות ואת ההוראות. כאן מרוכזות ${total} מילים ל${name}, מסודרות לפי נושאים כמו בספרי הלימוד, וכל מילה מגיעה עם תרגום לעברית, הגייה ומשפט לדוגמה.`,
      'איך משתמשים: בוחרים נושא, עוברים על כרטיסי המילים ושומעים כל מילה, ממשיכים לכרטיסיות — רואים את המילה באנגלית ומנסים להיזכר בפירוש לפני שהופכים — ובסוף פותרים את החידון. כל לחיצה על "חידון חדש" בונה שאלות אחרות מאותן מילים.',
      'הורים ומורים יכולים להדפיס כל נושא: רשימת המילים עם התרגום והמשפטים, חידון ודף תשובות — מוכן לשיעורי בית או לחזרה לפני מבחן.',
    ]} faq={faq} related={[BY_GRADE, { label: `אנגלית ל${name}`, href: `/learn/english/grade-${g.n}` }, { label: 'קריאה באנגלית עם מילון', href: '/learn/english-reading' }, { label: 'מילים באנגלית לפי נושא', href: '/english' }]} /></div>
  </Page>
}

export function VocabUnit() {
  const { grade, unit } = useParams(), g = gradeFromSlug(grade), u = g?.units.find(x => x.slug === unit)
  return u ? <UnitPage key={`${g.n}/${u.slug}`} g={g} u={u} /> : <NotFound />
}

function UnitPage({ g, u }) {
  const name = gradeName(g.n), band = VOCAB_BANDS[bandOfGrade(g.n)], path = vocabHref(g.n, u.slug)
  const [mode, setMode] = useState('words')
  const [seed, setSeed] = useState(1)
  const [printing, setPrinting] = useState(false)
  const quiz = useMemo(() => buildQuiz(u.words, seed), [u, seed])
  useEffect(() => () => stopSpeaking(), [])
  const idx = g.units.indexOf(u), prev = g.units[idx - 1], next = g.units[idx + 1]
  const faq = [
    { q: `אילו מילים יש בנושא "${u.title}"?`, a: `${u.words.length} מילים: ${u.words.map(w => `${w[0]} (${w[1]})`).join(', ')}.` },
    { q: 'איך עובד החידון?', a: 'עשר שאלות בחירה: בחלק רואים מילה באנגלית ובוחרים את הפירוש בעברית, ובחלק להפך. אחרי כל תשובה רואים מיד אם צדקתם, ובסוף מקבלים ציון. "חידון חדש" מערבב שאלות ותשובות.' },
    { q: `לאיזו כיתה מתאימות המילים?`, a: `ל${name} — ${band.label} (${band.en}) בתוכנית הלימודים באנגלית.` },
  ]
  const resource = { '@context': 'https://schema.org', '@type': 'LearningResource', name: `${u.en} — ${u.title}`, inLanguage: ['en', 'he'], educationalLevel: name, learningResourceType: 'רשימת מילים, כרטיסיות וחידון', isAccessibleForFree: true, about: 'English vocabulary' }
  return <Page>
    <SEO title={`${u.en} — מילים באנגלית ל${name}: ${u.title} עם תרגום, הגייה וחידון`} description={`${u.words.length} מילים באנגלית בנושא ${u.title} ל${name}: ${u.words.slice(0, 6).map(w => w[0]).join(', ')} ועוד — תרגום, הגייה, משפט לדוגמה, כרטיסיות, חידון ודף להדפסה.`} path={path} type="article" structuredData={[resource, faqSchema(faq)]} />
    <Breadcrumbs items={[HOME, LEARN, BY_GRADE, { label: name, href: `/learn/english/grade-${g.n}` }, { label: 'אוצר מילים', href: vocabHref(g.n) }, { label: u.title }]} />
    <UnitTiles g={g} active={u.slug} compact />
    <p className="mt-6 text-center text-sm font-bold text-[var(--muted-foreground)]">אוצר מילים באנגלית · {name} · <bdi dir="ltr">{band.en}</bdi></p>
    <h1 className="mb-2 text-center text-3xl sm:text-4xl"><span aria-hidden="true">{u.emoji} </span>{u.title} — <bdi dir="ltr">{u.en}</bdi></h1>
    <p className="mb-4 text-center text-[var(--muted-foreground)]">{u.words.length} מילים · שומעים, הופכים כרטיסיות ובודקים את עצמכם</p>
    <div className="ev-modes" role="group" aria-label="מצב תרגול">
      {[['words', '📚 המילים'], ['cards', '🃏 כרטיסיות'], ['quiz', '✅ חידון']].map(([k, label]) => <button key={k} type="button" className="ln-chip" aria-pressed={mode === k} onClick={() => setMode(k)}>{label}</button>)}
      <button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ להדפסה</button>
    </div>
    {mode === 'words' && <WordCards u={u} />}
    {mode === 'cards' && <FlashCards u={u} />}
    {mode === 'quiz' && <Quiz key={seed} quiz={quiz} onNew={() => setSeed(s => s + 1)} />}
    {mode === 'words' && <p className="mt-6 text-center"><button type="button" className="ln-btn go" onClick={() => { setMode('quiz'); window.scrollTo?.({ top: 0, behavior: 'smooth' }) }}>✅ מוכנים? לחידון</button></p>}
    {printing && <PrintPreview title={`${u.en} — ${u.title} · ${name}`} onClose={() => setPrinting(false)}><PrintSheet g={g} u={u} quiz={quiz} name={name} path={path} /></PrintPreview>}
    <nav className="mt-8 flex flex-wrap justify-between gap-3" aria-label="הנושא הקודם והבא">
      {prev ? <Link to={vocabHref(g.n, prev.slug)} className="ln-chip">→ {prev.emoji} {prev.title}</Link> : <span />}
      {next ? <Link to={vocabHref(g.n, next.slug)} className="ln-chip">{next.emoji} {next.title} ←</Link> : <span />}
    </nav>
    <p className="mt-4 text-center"><Link to={vocabHref(g.n)} className="font-bold underline">לכל הנושאים של {name} ←</Link></p>
    <h2 className="mb-3 mt-10 text-2xl font-black">אוצר מילים לכיתות אחרות</h2>
    <GradeNav n={g.n} />
    <div className="mt-12"><SeoBody faq={faq} related={[{ label: `אוצר מילים ל${name}`, href: vocabHref(g.n) }, { label: `אנגלית ל${name}`, href: `/learn/english/grade-${g.n}` }, { label: 'קריאה באנגלית עם מילון', href: '/learn/english-reading' }]} /></div>
  </Page>
}

function WordCards({ u }) {
  return <ul className="ev-words">{u.words.map(([en, he, ex], i) => <li key={en} className="ev-word" style={{ '--tile': TILE_COLORS[i % TILE_COLORS.length] }}>
    <div className="ev-word-top">
      <b dir="ltr" lang="en" className="ev-word-en">{en}</b>
      <button type="button" className="ev-say" onClick={() => sayWord(en)} aria-label={`השמעת ${en}`}>🔊</button>
    </div>
    <p className="ev-word-he">{he}</p>
    <p className="ev-word-ex" dir="ltr" lang="en"><button type="button" className="ev-say-mini" onClick={() => saySentence(ex)} aria-label="השמעת המשפט">🔊</button> {ex}</p>
  </li>)}</ul>
}

function FlashCards({ u }) {
  const [order, setOrder] = useState(() => u.words.map((_, i) => i))
  const [at, setAt] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [front, setFront] = useState('en')
  const [known, setKnown] = useState(() => new Set())
  const [en, he, ex] = u.words[order[at]]
  const go = d => { setFlipped(false); setAt(i => (i + d + order.length) % order.length) }
  const mark = ok => { setKnown(s => { const n = new Set(s); if (ok) n.add(order[at]); else n.delete(order[at]); return n }); go(1) }
  const reshuffle = () => { setOrder(o => shuffle(o, Math.random)); setAt(0); setFlipped(false) }
  const showEn = (front === 'en') !== flipped
  return <div className="ev-flash">
    <div className="ev-flash-bar">
      <span className="font-bold">כרטיס {at + 1} מתוך {order.length} · ⭐ ידעתי {known.size}</span>
      <span className="flex flex-wrap gap-2">
        <button type="button" className="ln-chip" onClick={() => { setFront(f => (f === 'en' ? 'he' : 'en')); setFlipped(false) }}>{front === 'en' ? 'מתחילים באנגלית' : 'מתחילים בעברית'} ⇄</button>
        <button type="button" className="ln-chip" onClick={reshuffle}>🔀 ערבוב</button>
      </span>
    </div>
    <button type="button" className={`ev-card ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped(f => !f)} aria-label={flipped ? 'להפוך בחזרה' : 'להפוך את הכרטיס'} aria-live="polite">
      {showEn
        ? <span className="ev-card-face"><b dir="ltr" lang="en" className="ev-card-en">{en}</b>{flipped && <small dir="ltr" lang="en">{ex}</small>}</span>
        : <span className="ev-card-face"><b className="ev-card-he">{he}</b>{flipped && <small dir="ltr" lang="en">{ex}</small>}</span>}
      <span className="ev-card-hint">{flipped ? 'נגעו כדי להפוך בחזרה' : 'נגעו כדי להפוך 👆'}</span>
    </button>
    <div className="ev-flash-actions">
      <button type="button" className="ln-chip" onClick={() => go(-1)}>→ הקודם</button>
      <button type="button" className="ev-say" onClick={() => sayWord(en)} aria-label={`השמעת ${en}`}>🔊</button>
      <button type="button" className="ln-chip" onClick={() => go(1)}>הבא ←</button>
    </div>
    {flipped && <div className="ev-flash-actions">
      <button type="button" className="ln-btn go" onClick={() => mark(true)}>✔ ידעתי</button>
      <button type="button" className="ln-btn alt" onClick={() => mark(false)}>🔁 עוד לא</button>
    </div>}
    {known.size === order.length && <p className="ln-box mt-4 text-center text-xl font-black" role="status">🌟 ידעתם את כל {order.length} המילים! עכשיו לחידון.</p>}
  </div>
}

function Quiz({ quiz, onNew }) {
  const [picks, setPicks] = useState([])
  const answered = picks.filter(p => p !== undefined).length
  const score = quiz.filter((q, i) => picks[i] === q.answer).length
  return <div className="space-y-4">
    <p className="text-center text-[var(--muted-foreground)]">{answered} מתוך {quiz.length} · ✔ {score}</p>
    {quiz.map((q, i) => {
      const p = picks[i], done = p !== undefined, ok = p === q.answer
      return <div key={i} className="ln-q">
        <p className="font-bold">{i + 1}. {q.toHe ? <>מה הפירוש של <bdi dir="ltr" lang="en" className="ev-q-word">{q.prompt}</bdi>?</> : <>איך אומרים באנגלית <span className="ev-q-word">{q.prompt}</span>?</>}
          {q.toHe && <button type="button" className="ev-say-mini" onClick={() => sayWord(q.prompt)} aria-label={`השמעת ${q.prompt}`}>🔊</button>}</p>
        <div role="group" aria-label={`תשובות לשאלה ${i + 1}`} className="ev-opts" dir={q.toHe ? 'rtl' : 'ltr'}>{q.options.map((o, j) => <button key={j} type="button" disabled={done} aria-pressed={p === j}
          onClick={() => { setPicks(x => { const y = [...x]; y[i] = j; return y }); if (!q.toHe) sayWord(q.word[0]) }}
          className={`ln-opt ${done && j === q.answer ? 'is-right' : ''} ${done && p === j && !ok ? 'is-wrong' : ''}`}>{o}</button>)}</div>
        {done && <p className={`sj-exp ${ok ? 'ok' : 'no'}`} role="status"><b>{ok ? '✔ נכון!' : '✘ לא בדיוק.'}</b> <bdi dir="ltr" lang="en">{q.word[0]}</bdi> = {q.word[1]} · <bdi dir="ltr" lang="en">{q.word[2]}</bdi></p>}
      </div>
    })}
    {answered === quiz.length && <div className="ln-box text-center" role="status">
      <p className="text-3xl font-black">{score} מתוך {quiz.length} {score === quiz.length ? '🌟' : score >= quiz.length * 0.7 ? '👏' : '💪'}</p>
      <p className="mt-1">{score === quiz.length ? 'מושלם! אפשר לעבור לנושא הבא.' : 'כדאי לחזור על הכרטיסיות ולנסות שוב.'}</p>
      <button type="button" className="ln-btn go mt-3" onClick={onNew}>🔁 חידון חדש</button>
    </div>}
    {answered < quiz.length && <p className="text-center"><button type="button" className="ln-chip" onClick={onNew}>🔀 חידון חדש</button></p>}
  </div>
}

function PrintSheet({ g, u, quiz, name, path }) {
  return <>
    <article className="buga-flow ln-print sj-print ev-print" dir="rtl">
      <h2>{u.title} — <bdi dir="ltr">{u.en}</bdi></h2>
      <div className="meta"><span>שם: __________________</span><span>כיתה: ______</span><span>תאריך: ____________</span></div>
      <table className="ev-print-table">
        <thead><tr><th>English</th><th>עברית</th><th>Example</th></tr></thead>
        <tbody>{u.words.map(([en, he, ex]) => <tr key={en}><td dir="ltr"><b>{en}</b></td><td>{he}</td><td dir="ltr">{ex}</td></tr>)}</tbody>
      </table>
      <p className="sj-print-src">עוגה בוגה · אוצר מילים באנגלית ל{name} · ugabuga.co.il{path}</p>
    </article>
    <article className="buga-flow ln-print sj-print ev-print" dir="rtl">
      <h2>חידון — <bdi dir="ltr">{u.en}</bdi></h2>
      <div className="meta"><span>שם: __________________</span><span>ציון: ______ / {quiz.length}</span></div>
      <ol className="sj-print-qs">{quiz.map((q, i) => <li key={i}>
        <p>{q.toHe ? <>מה הפירוש של <bdi dir="ltr">{q.prompt}</bdi>?</> : <>איך אומרים באנגלית: {q.prompt}?</>}</p>
        <ul dir={q.toHe ? 'rtl' : 'ltr'}>{q.options.map((o, j) => <li key={j}><b>{q.toHe ? LETTERS[j] : 'abcd'[j]}.</b> {o}</li>)}</ul>
      </li>)}</ol>
      <p className="sj-print-src">עוגה בוגה · {gradeName(g.n)} · ugabuga.co.il{path}</p>
    </article>
    <article className="buga-flow ln-print sj-print ev-print" dir="rtl">
      <h2>תשובות — <bdi dir="ltr">{u.en}</bdi></h2>
      <ol className="sj-print-key">{quiz.map((q, i) => <li key={i}><b>{q.toHe ? LETTERS[q.answer] : 'abcd'[q.answer]}. {q.options[q.answer]}</b> — <bdi dir="ltr">{q.word[0]}</bdi> = {q.word[1]}</li>)}</ol>
    </article>
  </>
}
