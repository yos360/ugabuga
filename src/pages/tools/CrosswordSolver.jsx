import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { solve, toSlots } from '../../data/crosswordSolver'

// Crossword solver: length + known letters (+ optional clue words) -> matching words from the site's own
// crossword dictionaries. The word lists (~2,600 entries with clues) load only when the page opens.
const FILES = [() => import('../../adults/words/w2-3'), () => import('../../adults/words/w4'), () => import('../../adults/words/w5'), () => import('../../adults/words/w6-8')]
const loadAll = async () => {
  const [mods, topics, packs] = await Promise.all([
    Promise.all(FILES.map(f => f())),
    import('../../arcade/logic/words'),
    import('../../data/puzzlePacks'),
  ])
  const entries = mods.flatMap(m => m.WORDS)
  for (const list of Object.values(topics.CATEGORIES)) for (const w of list) entries.push([w, ''])
  for (const p of Object.values(packs.PACKS)) for (const e of p.words) entries.push(e)
  return entries
}
const MIN = 2, MAX = 12, LIMIT = 200

const FAQ = [
  { q: 'איך משתמשים בפותר התשבצים?', a: 'בוחרים כמה אותיות יש במילה, ואז כותבים בכל משבצת את האות שכבר ידועה לכם מהמילים החוצות. משבצת ריקה פירושה "לא יודעים". הרשימה מתעדכנת מיד. אפשר גם לכתוב מילה או שתיים מההגדרה, כדי שהמילים שמתאימות להגדרה יופיעו ראשונות.' },
  { q: 'איך מטפלים באותיות סופיות?', a: 'ך ם ן ף ץ נחשבות אותה אות כמו כ מ נ פ צ. אפשר לכתוב כל אחת מהן, והחיפוש ימצא את המילה בכל מקרה.' },
  { q: 'למה לא נמצאה המילה שחיפשתי?', a: 'המילון כאן מבוסס על המילים שמופיעות בתשבצים של האתר (כ־2,600 מילים), ולכן הוא לא מכסה את כל השפה העברית. נסו לפנות משבצת אחת, לוודא את מספר האותיות, או לכתוב כתיב מלא ללא ניקוד.' },
  { q: 'איך סופרים אותיות במילה כמו "בית ספר"?', a: 'בתשבץ מתעלמים מרווחים, מקפים וגרשיים ומונים רק את האותיות. לכן "בית ספר" היא מילה בת שבע אותיות.' },
]

export default function CrosswordSolver() {
  const [entries, setEntries] = useState(null), [failed, setFailed] = useState(false)
  const [len, setLen] = useState(5)
  const [cells, setCells] = useState(() => Array(5).fill(''))
  const [clue, setClue] = useState('')
  const refs = useRef([])
  useEffect(() => { let on = true; loadAll().then(e => { if (on) setEntries(e) }).catch(() => { if (on) setFailed(true) }); return () => { on = false } }, [])

  const changeLen = n => { const v = Math.max(MIN, Math.min(MAX, n)); setLen(v); setCells(c => Array.from({ length: v }, (_, i) => c[i] || '')) }
  const setCell = (i, raw) => {
    const ch = [...raw].filter(c => /[א-ת]/.test(c)).pop() || ''
    setCells(c => c.map((x, j) => (j === i ? ch : x)))
    if (ch && i < len - 1) refs.current[i + 1]?.focus()
  }
  const key = (i, e) => {
    if (e.key === 'Backspace' && !cells[i] && i > 0) refs.current[i - 1]?.focus()
    // RTL: the first box is on the right, so ArrowLeft moves on to the next box.
    if (e.key === 'ArrowLeft' && i < len - 1) refs.current[i + 1]?.focus()
    if (e.key === 'ArrowRight' && i > 0) refs.current[i - 1]?.focus()
  }
  const known = cells.filter(Boolean).length
  const results = useMemo(() => (entries ? solve(entries, toSlots(cells), clue) : []), [entries, cells, clue])
  const shown = results.slice(0, LIMIT)

  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title="פתרון תשבצים — פותר תשבצים: מילים לפי מספר אותיות ואותיות ידועות" description="פותר תשבצים בחינם: כותבים כמה אותיות יש במילה ואילו אותיות כבר ידועות (למשל ש _ ל _ ם), ומקבלים רשימת מילים מתאימות עם הגדרות. אותיות סופיות נחשבות כרגילות." path="/tools/crossword-solver" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'פתרון תשבצים' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">🧩 </span>פתרון תשבצים</h1>
    <p className="mx-auto mt-2 max-w-xl text-center text-lg text-[var(--muted-foreground)]">תקועים על מילה בתשבץ? כותבים את האותיות שאתם כבר יודעים ומקבלים מילים שמתאימות.</p>

    <section aria-labelledby="cs-form" className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5">
      <h2 id="cs-form" className="sr-only">הזנת המילה</h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <label htmlFor="cs-len" className="text-lg font-bold">כמה אותיות במילה?</label>
        <button type="button" onClick={() => changeLen(len - 1)} disabled={len <= MIN} aria-label="פחות אותיות" className="h-11 w-11 rounded-xl border-2 border-[var(--border)] text-2xl font-black disabled:opacity-40">−</button>
        <output id="cs-len" className="min-w-8 text-center text-3xl font-black">{len}</output>
        <button type="button" onClick={() => changeLen(len + 1)} disabled={len >= MAX} aria-label="עוד אותיות" className="h-11 w-11 rounded-xl border-2 border-[var(--border)] text-2xl font-black disabled:opacity-40">+</button>
      </div>
      <p className="mt-4 text-center font-bold">האותיות הידועות (משבצת ריקה = לא יודעים):</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2" dir="rtl" role="group" aria-label="משבצות המילה">
        {cells.map((c, i) => <input key={i} ref={el => { refs.current[i] = el }} value={c} onChange={e => setCell(i, e.target.value)} onKeyDown={e => key(i, e)} onFocus={e => e.target.select()}
          inputMode="text" lang="he" maxLength={2} autoComplete="off" aria-label={`אות ${i + 1} מתוך ${len}`}
          className="h-14 w-12 rounded-xl border-2 border-violet-400 bg-white text-center text-2xl font-black text-slate-900 focus:border-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300" />)}
      </div>
      <div className="mt-4">
        <label htmlFor="cs-clue" className="block font-bold">מילה מההגדרה (לא חובה):</label>
        <input id="cs-clue" value={clue} onChange={e => setClue(e.target.value)} placeholder="למשל: עיר, פרי, הר" lang="he" autoComplete="off"
          className="mt-1 min-h-[44px] w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 text-lg text-slate-900" />
      </div>
      <div className="mt-3 text-center"><button type="button" onClick={() => { setCells(Array(len).fill('')); setClue(''); refs.current[0]?.focus() }} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] px-4 font-bold">ניקוי</button></div>
    </section>

    <section aria-labelledby="cs-res" className="mt-6" aria-live="polite">
      <h2 id="cs-res" className="text-2xl font-black">מילים שמתאימות</h2>
      {failed && <p role="alert" className="mt-2 text-red-700">לא הצלחנו לטעון את המילון. נסו לרענן את העמוד.</p>}
      {!entries && !failed && <p role="status" className="mt-2">טוענים את המילון…</p>}
      {entries && known === 0 && !clue.trim() && <p className="mt-2 text-[var(--muted-foreground)]">כתבו לפחות אות אחת, או מילה מההגדרה, כדי לצמצם: מוצגות {Math.min(results.length, LIMIT)} מתוך {results.length} מילים באורך {len}.</p>}
      {entries && results.length === 0 && <p className="mt-2 font-bold">לא נמצאה מילה מתאימה. נסו לפנות משבצת או לבדוק את מספר האותיות.</p>}
      {entries && results.length > 0 && (known > 0 || clue.trim()) && <p className="mt-2 text-[var(--muted-foreground)]">נמצאו {results.length} מילים{results.length > LIMIT ? ` (מוצגות ${LIMIT} הראשונות — הוסיפו אות כדי לצמצם)` : ''}.</p>}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{shown.map(r => <li key={r.word} className={`rounded-2xl border-2 p-3 ${r.hit ? 'border-emerald-400 bg-emerald-50 text-slate-900' : 'border-[var(--border)] bg-[var(--card)]'}`}>
        <b className="text-xl">{r.word}</b>{r.clues.length > 0 && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{r.clues.slice(0, 2).join(' · ')}</p>}
      </li>)}</ul>
    </section>

    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Link to="/adults/crosswords" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold text-slate-900">תשחצים להדפסה</Link>
      <Link to="/crossword" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold text-slate-900">יוצרים תשבץ משלכם</Link>
    </div>

    <div className="mt-10"><SeoBody paragraphs={[
      'פותר התשבצים עוזר כשנתקעים על מילה אחת: אתם יודעים כמה אותיות יש בה ואולי אות או שתיים מהמילים החוצות, ורוצים לראות מה מתאים. כותבים את האותיות במשבצות, והרשימה מתעדכנת מיד.',
      'המילון מורכב מכ־2,600 מילים שמופיעות בתשבצי האתר, עם ההגדרות שלהן, ומרשימות מילים נוספות מהמשחקים שלנו. הוא נטען רק כשפותחים את הדף. אין צורך להירשם והכול נעשה בדפדפן שלכם.',
    ]} faq={FAQ} related={[{ label: 'תשחצים להדפסה', href: '/adults/crosswords' }, { label: 'יוצר תשבצים', href: '/crossword' }, { label: 'משחקי מילים', href: '/games' }]} /></div>
  </div>
}
