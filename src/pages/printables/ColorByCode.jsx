import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import {
  CBN_PICTURES, CBN_LEVELS, CBN_MATH_KINDS, CBN_LETTER_LEVELS, cbnBySlug, cbnLevel, cbnGrid, cbnPath,
  cbnMathKindBySlug, cbnFitsKind, cbnAnswers, cbnMathGrid, cbnLetterTags, cbnLetterGrid,
} from '../../data/colorByNumber'
import { CbnSvg, Legend, Sheet, cellKey } from './cbnShared'

// The color-by-number pictures with something else in the cells:
//   /printables/color-by-answer            — hub: one card per exercise kind
//   /printables/color-by-answer/:op        — every cell is an exercise; the legend maps answers to colors
//   /printables/color-by-letter            — Hebrew letters (different / similar / final forms)
//   /printables/color-by-letter/english    — English letters (capital / small / capital↔small)
// The chosen picture lives in ?p=slug (canonical stays the bare page), the letter level in ?level=.

const CBN_HUB = '/printables/color-by-number'
const ANSWER_HUB = '/printables/color-by-answer'
const LETTER_PATHS = { he: '/printables/color-by-letter', en: '/printables/color-by-letter/english' }
const BOOKLET = 6

// pictures that suit `level` first, then the other levels in their usual order
const byLevelFirst = (list, level) => [...list.filter(p => p.level === level), ...list.filter(p => p.level !== level)]

function PicturePicker({ list, current, onPick }) {
  const i = list.indexOf(current)
  return <div className="no-print mt-4 flex flex-wrap items-center justify-center gap-2">
    <label className="flex items-center gap-2 font-bold">ציור:
      <select value={current.slug} onChange={e => onPick(e.target.value)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-3 font-bold">
        {CBN_LEVELS.map(l => {
          const items = list.filter(p => p.level === l.id)
          return items.length > 0 && <optgroup key={l.id} label={l.label}>{items.map(p => <option key={p.slug} value={p.slug}>{p.emoji} {p.name}</option>)}</optgroup>
        })}
      </select>
    </label>
    <button type="button" onClick={() => onPick(list[(i + 1) % list.length].slug)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-4 font-bold">⏭️ הציור הבא</button>
  </div>
}

// online coloring of one picture; remount with a new key to reset
function CodePlay({ p, cells, tags, tagName, label }) {
  const grid = useMemo(() => cbnGrid(p), [p])
  const [active, setActive] = useState(1)
  const [fills, setFills] = useState({})
  const [reveal, setReveal] = useState(false)
  const total = grid.flat().filter(n => n > 0).length
  const correct = Object.entries(fills).filter(([k, n]) => { const [r, c] = k.split('-').map(Number); return grid[r][c] === n }).length
  const paint = (r, c) => setFills(f => (f[cellKey(r, c)] === active ? f : { ...f, [cellKey(r, c)]: active }))
  return <section className="no-print cbn-play mt-6" aria-label="צביעה אונליין">
    <p className="cbn-hint">בוחרים צבע במקרא ולוחצים על המשבצות כדי לצבוע אונליין.</p>
    <Legend p={p} tags={tags} tagName={tagName} active={active} onPick={setActive} />
    <div className="cbn-board wobbly-md">
      <CbnSvg p={p} mode={reveal ? 'solution' : 'code'} cells={cells} fills={fills} onPaint={reveal ? null : paint} label={label} />
    </div>
    <div className="cbn-tools">
      <span role="status">{correct === total ? '🎉 כל הכבוד! הציור הושלם' : `נצבעו נכון ${correct} מתוך ${total} משבצות`}</span>
      <button type="button" onClick={() => setReveal(v => !v)}>{reveal ? '🙈 הסתרת הפתרון' : '👀 הצגת הפתרון'}</button>
      <button type="button" onClick={() => { setFills({}); setReveal(false) }}>🧽 ניקוי</button>
    </div>
  </section>
}

function PrintBar({ onOne, onBooklet, withSolution, setWithSolution }) {
  return <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
    <button type="button" data-print-main onClick={onOne} className="min-h-[52px] rounded-xl bg-red-500 px-5 py-3 text-lg font-bold text-white">🖨️ הדפסת הדף</button>
    <button type="button" onClick={onBooklet} className="min-h-[52px] rounded-xl bg-violet-600 px-5 py-3 text-lg font-bold text-white">🖨️ חוברת של {BOOKLET} ציורים</button>
    <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={withSolution} onChange={e => setWithSolution(e.target.checked)} className="h-5 w-5" />להדפיס גם דף פתרון</label>
  </div>
}

// picture selection shared by both page kinds: ?p=slug if it fits, otherwise the first of the list
function usePicture(list) {
  const [params, setParams] = useSearchParams()
  const wanted = cbnBySlug(params.get('p'))
  const current = wanted && list.includes(wanted) ? wanted : list[0]
  const pick = slug => { const next = new URLSearchParams(params); next.set('p', slug); setParams(next, { replace: true, preventScrollReset: true }) }
  return [current, pick, params]
}
// the booklet: the current picture and the next ones of the list
const bookletOf = (list, current) => { const i = list.indexOf(current); return Array.from({ length: Math.min(BOOKLET, list.length) }, (_, j) => list[(i + j) % list.length]) }

function KindTabs({ current, query }) {
  return <nav aria-label="סוג התרגילים" className="no-print mt-6 flex flex-wrap justify-center gap-2">
    {CBN_MATH_KINDS.map(k => <Link key={k.id} to={`${ANSWER_HUB}/${k.slug}${query}`} aria-current={current === k.id ? 'page' : undefined} preventScrollReset className={`min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-2 font-bold ${current === k.id ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{k.emoji} {k.label}</Link>)}
  </nav>
}

// ── color by answer ──
const ANSWER_FAQ = [
  { q: 'מה זה צביעה לפי תשובות?', a: 'דף צביעה שבו בכל משבצת יש תרגיל במקום מספר. פותרים את התרגיל, מוצאים את התשובה במקרא וצובעים בצבע שלה. כשכל התרגילים פתורים — מתגלה ציור.' },
  { q: 'אפשר להתבלבל בין צבעים?', a: 'לא. לכל צבע יש תשובה אחת משלו, ושום תשובה לא שייכת לשני צבעים. אם משבצת יצאה בצבע שלא מתאים לציור — כנראה שהתרגיל נפתר לא נכון, וזו הזדמנות לבדוק שוב.' },
  { q: 'איזו פעולה מתאימה לאיזה גיל?', a: 'חיבור וחיסור עד 10 — לגן חובה ולכיתה א׳. חיבור וחיסור עד 20 — לכיתות א׳–ב׳. לוח הכפל — לכיתות ב׳–ד׳, וחילוק — לכיתות ג׳–ה׳. אפשר לבחור כל ציור עם כל פעולה.' },
  { q: 'התרגילים משתנים בכל הדפסה?', a: 'לא — כל ציור וכל פעולה מקבלים תמיד את אותם תרגילים, כך שכל הכיתה מקבלת דף זהה, ודף הפתרון תמיד מתאים.' },
]

export function ColorByAnswerHub() {
  const [params] = useSearchParams()
  const chosen = cbnBySlug(params.get('p'))
  const query = chosen ? `?p=${chosen.slug}` : ''
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="צביעה לפי תשובות — דפי צביעה עם תרגילי חשבון להדפסה" description={`דפי צביעה לפי תשובות להדפסה בחינם: חיבור וחיסור עד 10 ועד 20, לוח הכפל וחילוק. פותרים את התרגיל וצובעים לפי התשובה — ${CBN_PICTURES.length} ציורים, דף פתרון וצביעה אונליין.`} path={ANSWER_HUB} structuredData={faqSchema(ANSWER_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'צביעה לפי מספרים', href: CBN_HUB }, { label: 'צביעה לפי תשובות' }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-[var(--postit)] px-4 py-2 font-bold">6 פעולות · {CBN_PICTURES.length} ציורים · עם פתרון · חינם</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🧮 </span>צביעה לפי תשובות</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">בכל משבצת מחכה תרגיל. פותרים, מוצאים את התשובה במקרא וצובעים — והציור מתגלה רק למי שפותר נכון.{chosen && ` בחרו פעולה לציור „${chosen.name}”.`}</p>
    </header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CBN_MATH_KINDS.map(k => {
        const p = chosen && cbnFitsKind(chosen, k.id) ? chosen : CBN_PICTURES.find(x => x.level === k.level && cbnFitsKind(x, k.id))
        return <Link key={k.id} to={`${ANSWER_HUB}/${k.slug}${query}`} className="wobbly flex gap-3 border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow transition-transform hover:-translate-y-1">
          <div className="cbn-thumb w-24 flex-none"><CbnSvg p={p} mode="solution" label={`${k.label}: ${p.name}`} /></div>
          <div><h2 className="text-2xl font-bold">{k.emoji} {k.label}</h2>
            <p className="text-[var(--muted-foreground)]">{k.grade} · למשל <b dir="ltr">{k.sample}</b></p>
            <span className="mt-1 inline-block font-bold underline decoration-dashed">לדפים ←</span></div>
        </Link>
      })}
    </section>
    <div className="mt-10"><SeoBody paragraphs={[
      'צביעה לפי תשובות הופכת תרגול חשבון למשחק: במקום עמוד של תרגילים יבשים, כל תרגיל פתור צובע עוד משבצת בציור. ילדים פותרים עשרות תרגילים בלי לשים לב, ובודקים את עצמם — ציור שיוצא „לא נכון” מראה שמשהו התפספס.',
      `כל ${CBN_PICTURES.length} הציורים של צביעה לפי מספרים זמינים בכל אחת מהפעולות: חיבור וחיסור עד 10 לגן ולכיתה א׳, חיבור וחיסור עד 20 לכיתות א׳–ב׳, לוח הכפל וחילוק לכיתות הגבוהות. לכל דף יש דף פתרון צבעוני, ואפשר להדפיס חוברת של ${BOOKLET} ציורים בבת אחת.`,
    ]} faq={ANSWER_FAQ} related={[{ label: 'צביעה לפי מספרים', href: CBN_HUB }, { label: 'צביעה לפי אותיות', href: LETTER_PATHS.he }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'לוח הכפל', href: '/learn/multiplication-table' }, { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}

function answerFaq(k) {
  return [
    { q: `איך עובד דף צביעה לפי תשובות של ${k.label}?`, a: `בכל משבצת יש תרגיל ${k.label} (למשל ${k.sample}). פותרים, מחפשים את התשובה במקרא וצובעים בצבע שלה. לכל צבע תשובה אחת משלו, כך שאין התלבטויות.` },
    { q: 'לאיזה גיל זה מתאים?', a: `בעיקר ל${k.grade}. ציורים קטנים עם מעט צבעים מתאימים למתחילים, וציורים גדולים עם הרבה משבצות — למי שרוצה אתגר ארוך.` },
    { q: 'אפשר להדפיס כמה ציורים יחד?', a: `כן. „חוברת של ${BOOKLET} ציורים” מדפיסה את הציור שנבחר ואת הציורים שאחריו, כל אחד בדף משלו — ועם דף פתרון אם מסמנים.` },
    ...ANSWER_FAQ.slice(1, 2),
  ]
}

export function ColorByAnswerKind() {
  const { op } = useParams()
  const k = cbnMathKindBySlug(op)
  const list = useMemo(() => (k ? byLevelFirst(CBN_PICTURES.filter(p => cbnFitsKind(p, k.id)), k.level) : []), [k])
  const [p, pick, params] = usePicture(list)
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(true)
  const data = useMemo(() => (k && p ? { tags: cbnAnswers(p, k.id), cells: cbnMathGrid(p, k.id).map(row => row.map(ex => ex?.text)) } : null), [k, p])
  if (!k) return <NotFound />
  const title = `צביעה לפי תשובות — ${k.label}`
  const how = 'פותרים את התרגיל בכל משבצת, מוצאים את התשובה במקרא וצובעים בצבע שלה.'
  const sheetsOf = pics => pics.flatMap(x => {
    const tags = cbnAnswers(x, k.id), cells = cbnMathGrid(x, k.id).map(row => row.map(ex => ex?.text))
    return [<Sheet key={x.slug} p={x} mode="code" title={title} how={how} tags={tags} cells={cells} footer="צביעה לפי תשובות" />, ...(withSolution ? [<Sheet key={`${x.slug}-sol`} p={x} mode="solution" footer="צביעה לפי תשובות" />] : [])]
  })
  const faq = answerFaq(k)
  const query = params.get('p') ? `?p=${p.slug}` : ''
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`צביעה לפי תשובות: ${k.label} — דפי צביעה עם תרגילים להדפסה`} description={`דפי צביעה לפי תשובות ב${k.label} להדפסה בחינם, ל${k.grade}: בכל משבצת תרגיל (למשל ${k.sample}), וכל תשובה היא צבע. ${list.length} ציורים, דף פתרון וצביעה אונליין.`} path={`${ANSWER_HUB}/${k.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'צביעה לפי תשובות', href: ANSWER_HUB }, { label: k.label }]} />
    <header className="text-center">
      <span className={`inline-flex rounded-full px-4 py-2 font-bold ${cbnLevel(k.level).badge}`}>{k.grade} · {list.length} ציורים · עם פתרון</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{k.emoji} </span>צביעה לפי תשובות: {k.label}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">בכל משבצת תרגיל {k.label}. פותרים, מוצאים את התשובה במקרא וצובעים — עד שמתגלה ה{p.name}.</p>
    </header>
    <KindTabs current={k.id} query={query} />
    <PicturePicker list={list} current={p} onPick={pick} />
    <PrintBar onOne={() => setPrinting([p])} onBooklet={() => setPrinting(bookletOf(list, p))} withSolution={withSolution} setWithSolution={setWithSolution} />
    <CodePlay key={`${k.id}-${p.slug}`} p={p} cells={data.cells} tags={data.tags} tagName="תשובה" label={`${p.name} — צביעה לפי תשובות, ${k.label}`} />
    <p className="no-print mt-4 text-center"><Link to={cbnPath(p)} className="font-bold underline">ה{p.name} בצביעה לפי מספרים</Link> · <Link to={`${LETTER_PATHS.he}?p=${p.slug}`} className="font-bold underline">צביעה לפי אותיות</Link></p>
    {printing && <PrintPreview title={title} onClose={() => setPrinting(null)}>{sheetsOf(printing)}</PrintPreview>}
    <div className="mt-10"><SeoBody paragraphs={[
      `דפי צביעה לפי תשובות ב${k.label} משלבים תרגול חשבון עם צביעה: כל משבצת היא תרגיל, וכל תשובה נכונה צובעת עוד חלק מהציור. התרגילים מתאימים ל${k.grade}, ולכל צבע במקרא יש תשובה אחת בלבד.`,
      `אפשר לבחור כל אחד מ-${list.length} הציורים — מציורים קטנים לגן ועד ציורים מפורטים לגדולים — לצבוע אונליין או להדפיס דף אחד או חוברת של ${BOOKLET} ציורים, עם דף פתרון צבעוני לבדיקה.`,
    ]} faq={faq} related={[{ label: 'כל סוגי הצביעה לפי תשובות', href: ANSWER_HUB }, { label: 'צביעה לפי מספרים', href: CBN_HUB }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, ...(k.id === 'mult' || k.id === 'div' ? [{ label: 'לוח הכפל', href: '/learn/multiplication-table' }] : []), { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}

// ── color by letter ──
const LETTER_COPY = {
  he: {
    title: 'צביעה לפי אותיות להדפסה — דפי צביעה עם אותיות בעברית',
    h1: 'צביעה לפי אותיות', crumb: 'צביעה לפי אותיות', emoji: 'א',
    desc: n => `דפי צביעה לפי אותיות בעברית להדפסה בחינם: בכל משבצת אות, ובמקרא — איזה צבע מתאים לכל אות. שלוש רמות: אותיות שונות, אותיות דומות ואותיות סופיות. ${n} ציורים, דף פתרון וצביעה אונליין.`,
    lead: 'בכל משבצת יש אות. מוצאים אותה במקרא וצובעים בצבע שלה — תרגול זיהוי אותיות שנגמר בציור.',
    how: 'מוצאים במקרא את האות שבמשבצת וצובעים בצבע שלה.',
    other: { href: LETTER_PATHS.en, label: 'צביעה לפי אותיות באנגלית' },
    faq: [
      { q: 'מה ההבדל בין הרמות?', a: 'אותיות שונות — אותיות שקל להבחין ביניהן, לגן חובה. אותיות דומות — זוגות שמתבלבלים בהם (ב/כ, ד/ר, ה/ח, ו/ז, ס/ם), לכיתה א׳. אותיות סופיות — במקרא האות הרגילה ובמשבצות לפעמים הצורה הסופית שלה (מ/ם, נ/ן, כ/ך, פ/ף, צ/ץ), וצריך לזהות ששתיהן אותה אות.' },
      { q: 'זה מתאים למי שעוד לא קורא?', a: 'כן. לא צריך לקרוא מילים — רק להשוות צורה של אות במשבצת לאות במקרא. זה בדיוק התרגול שמכין לקריאה: הבחנה בין צורות של אותיות.' },
    ],
    paras: n => [
      'צביעה לפי אותיות היא דרך שקטה ומהנה לתרגל זיהוי אותיות: הילד מחפש את האות במקרא, משווה צורות ובוחר צבע — שוב ושוב, עד שמתגלה ציור. כך האותיות נחרטות בזיכרון בלי שינון.',
      `ברמת האותיות הדומות המשימה מכוונת בדיוק לטעויות הנפוצות של כיתה א׳: ב וכ, ד ור, ה וח, ו וז. ברמת האותיות הסופיות לומדים שם וּמ הן אותה אות. כל ${n} הציורים זמינים בכל רמה, עם דף פתרון.`,
    ],
  },
  en: {
    title: 'צביעה לפי אותיות באנגלית — דפי צביעה Color by Letter להדפסה',
    h1: 'צביעה לפי אותיות באנגלית', crumb: 'אותיות באנגלית', emoji: 'A',
    desc: n => `דפי צביעה לפי אותיות באנגלית להדפסה בחינם (Color by Letter): אותיות גדולות, אותיות קטנות שקל לבלבל (b/d/p/q) והתאמה בין גדולה לקטנה. ${n} ציורים, דף פתרון וצביעה אונליין.`,
    lead: 'בכל משבצת אות באנגלית. מוצאים אותה במקרא וצובעים — תרגול ABC שנגמר בציור.',
    how: 'מוצאים במקרא את האות שבמשבצת וצובעים בצבע שלה.',
    other: { href: LETTER_PATHS.he, label: 'צביעה לפי אותיות בעברית' },
    faq: [
      { q: 'מה ההבדל בין הרמות?', a: 'אותיות גדולות — Capital letters שקל להבחין ביניהן. אותיות קטנות — אותיות שמתבלבלים בהן (b/d/p/q, m/n, h/u), וצריך לשים לב לכיוון. גדולה ↔ קטנה — במקרא האות הגדולה ובמשבצות הקטנה שלה, כך שמתרגלים את ההתאמה בין השתיים.' },
      { q: 'לאיזה גיל זה מתאים?', a: 'לכיתות ב׳–ד׳, כשמתחילים ללמוד אנגלית. גם ילדים צעירים יותר יכולים לצבוע ברמת האותיות הגדולות — צריך רק להשוות צורות.' },
    ],
    paras: n => [
      'צביעה לפי אותיות באנגלית (Color by Letter) עוזרת לילדים שמתחילים ללמוד אנגלית להכיר את האותיות: מחפשים במקרא, משווים צורות וצובעים. הבלבול בין b, d, p ו-q הוא מהנפוצים ביותר — וברמת האותיות הקטנות מתרגלים אותו בדיוק.',
      `ברמת „גדולה ↔ קטנה” המקרא מראה אות גדולה והמשבצות את הקטנה שלה, כמו A ו-a או G ו-g. כל ${n} הציורים זמינים בכל רמה, עם דף פתרון.`,
    ],
  },
}

export function ColorByLetter({ lang = 'he' }) {
  const copy = LETTER_COPY[lang], path = LETTER_PATHS[lang]
  const levels = CBN_LETTER_LEVELS.filter(l => l.lang === lang)
  const [params, setParams] = useSearchParams()
  const lv = levels.find(l => l.id === params.get('level')) || levels[0]
  const list = useMemo(() => byLevelFirst(CBN_PICTURES, lv.level), [lv])
  const [p, pick] = usePicture(list)
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(true)
  const data = useMemo(() => ({ tags: cbnLetterTags(p, lv.id), cells: cbnLetterGrid(p, lv.id) }), [p, lv])
  const setLevel = id => { const next = new URLSearchParams(params); if (id === levels[0].id) next.delete('level'); else next.set('level', id); setParams(next, { replace: true, preventScrollReset: true }) }
  const title = `${copy.h1} — ${lv.label}`
  const sheetsOf = pics => pics.flatMap(x => [
    <Sheet key={x.slug} p={x} mode="code" title={title} how={copy.how} tags={cbnLetterTags(x, lv.id)} cells={cbnLetterGrid(x, lv.id)} footer={copy.crumb} />,
    ...(withSolution ? [<Sheet key={`${x.slug}-sol`} p={x} mode="solution" footer={copy.crumb} />] : []),
  ])
  const faq = [...copy.faq, ...ANSWER_FAQ.slice(3)]
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={copy.title} description={copy.desc(CBN_PICTURES.length)} path={path} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'צביעה לפי מספרים', href: CBN_HUB }, { label: copy.crumb }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-[var(--postit)] px-4 py-2 font-bold">3 רמות · {CBN_PICTURES.length} ציורים · עם פתרון · חינם</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🎨 </span>{copy.h1}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{copy.lead}</p>
    </header>
    <nav aria-label="רמת קושי" className="no-print mt-6 flex flex-wrap justify-center gap-2">
      {levels.map(l => <button key={l.id} type="button" aria-pressed={lv.id === l.id} onClick={() => setLevel(l.id)} className={`min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${lv.id === l.id ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{l.label} <small className="font-normal">({l.grade})</small></button>)}
    </nav>
    <p className="no-print mt-2 text-center text-[var(--muted-foreground)]" role="status">{lv.hint}</p>
    <PicturePicker list={list} current={p} onPick={pick} />
    <PrintBar onOne={() => setPrinting([p])} onBooklet={() => setPrinting(bookletOf(list, p))} withSolution={withSolution} setWithSolution={setWithSolution} />
    <CodePlay key={`${lv.id}-${p.slug}`} p={p} cells={data.cells} tags={data.tags} tagName="אות" label={`${p.name} — ${title}`} />
    <p className="no-print mt-4 text-center"><Link to={cbnPath(p)} className="font-bold underline">ה{p.name} בצביעה לפי מספרים</Link> · <Link to={`${copy.other.href}?p=${p.slug}`} className="font-bold underline">{copy.other.label}</Link> · <Link to={`${ANSWER_HUB}?p=${p.slug}`} className="font-bold underline">צביעה לפי תשובות</Link></p>
    {printing && <PrintPreview title={title} onClose={() => setPrinting(null)}>{sheetsOf(printing)}</PrintPreview>}
    <div className="mt-10"><SeoBody paragraphs={copy.paras(CBN_PICTURES.length)} faq={faq} related={[{ label: copy.other.label, href: copy.other.href }, { label: 'צביעה לפי מספרים', href: CBN_HUB }, { label: 'צביעה לפי תשובות', href: ANSWER_HUB }, ...(lang === 'he' ? [{ label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' }] : []), { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}

export function ColorByLetterEnglish() {
  return <ColorByLetter lang="en" />
}
