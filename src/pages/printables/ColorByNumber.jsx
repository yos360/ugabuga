import { useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { CBN_PICTURES, CBN_LEVELS, cbnBySlug, cbnLevel, cbnSize, cbnLegend, cbnGrid, cbnAnswers, cbnMathGrid, cbnPath } from '../../data/colorByNumber'
import './color-by-number.css'

// /printables/color-by-number — 20 pixel pictures to color by number (or by exercise), each with
// its own indexable page, print sheets with a solution page, and online coloring by tapping cells.

const HUB = '/printables/color-by-number'
const CELL = 10
const key = (r, c) => `${r}-${c}`

// mode: 'numbers' | 'math' | 'solution'. fills: { 'r-c': legendNumber } for online coloring.
export function CbnSvg({ p, mode, fills, onPaint, label, className = '' }) {
  const grid = useMemo(() => cbnGrid(p), [p])
  const legend = useMemo(() => cbnLegend(p), [p])
  const math = useMemo(() => (mode === 'math' ? cbnMathGrid(p) : null), [p, mode])
  const { cols, rows } = cbnSize(p)
  const svgRef = useRef(null), drag = useRef(false)
  const cellAt = e => {
    const svg = svgRef.current, ctm = svg?.getScreenCTM()
    if (!ctm) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const c = Math.floor(pt.x / CELL), r = Math.floor(pt.y / CELL)
    return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] > 0 ? [r, c] : null
  }
  const paint = e => { const rc = cellAt(e); if (rc) onPaint(rc[0], rc[1]) }
  const handlers = onPaint ? {
    onPointerDown: e => { drag.current = e.pointerType === 'mouse'; paint(e) },
    onPointerMove: e => { if (drag.current && e.buttons) paint(e) },
    onPointerUp: () => { drag.current = false },
    onPointerLeave: () => { drag.current = false },
  } : {}
  const fs = mode === 'math' ? 3.3 : 5
  return <svg ref={svgRef} viewBox={`-0.5 -0.5 ${cols * CELL + 1} ${rows * CELL + 1}`} className={`cbn-svg ${onPaint ? 'is-paintable' : ''} ${className}`} role="img" aria-label={label} dir="ltr" {...handlers}>
    {grid.map((row, r) => row.map((n, c) => {
      if (!n) return null
      const filled = mode === 'solution' ? n : fills?.[key(r, c)]
      const fill = filled ? legend[filled - 1].hex : '#fff'
      const text = mode === 'numbers' ? String(n) : mode === 'math' ? math[r][c].text : ''
      return <g key={key(r, c)}>
        <rect x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill={fill} stroke={mode === 'solution' ? '#00000018' : '#8a8f9c'} strokeWidth={mode === 'solution' ? 0.3 : 0.45} />
        {text && !filled && <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2} fontSize={text.length > 4 ? fs * 0.86 : fs} textAnchor="middle" dominantBaseline="central" fill="#3b3f4a" direction="ltr">{text}</text>}
      </g>
    }))}
  </svg>
}

function Legend({ p, mode, active, onPick, compact }) {
  const legend = cbnLegend(p), answers = cbnAnswers(p)
  // math legend reads in answer order (6, 8, 10…), the numbers legend in color order
  const items = mode === 'math' ? [...legend].sort((a, b) => answers[a.num] - answers[b.num]) : legend
  return <ul className={`cbn-legend ${compact ? 'is-compact' : ''}`}>{items.map(l => {
    const tag = mode === 'math' ? answers[l.num] : l.num
    const inner = <><i className="cbn-swatch" style={{ background: l.hex }} /><b dir="ltr">{tag}</b><span>{l.name}</span></>
    return <li key={l.ch}>{onPick
      ? <button type="button" aria-pressed={active === l.num} onClick={() => onPick(l.num)} aria-label={`${mode === 'math' ? 'תשובה' : 'מספר'} ${tag}: ${l.name}`}>{inner}</button>
      : <span className="cbn-legend-item">{inner}</span>}</li>
  })}</ul>
}

function Sheet({ p, mode }) {
  const level = cbnLevel(p.level)
  const title = mode === 'solution' ? `פתרון: ${p.name}` : mode === 'math' ? `צביעה לפי תרגילים — ${level.mathLabel}` : 'צביעה לפי מספרים'
  const how = mode === 'math' ? 'פותרים את התרגיל בכל משבצת, מוצאים את התשובה במקרא וצובעים בצבע שלה.' : 'צובעים כל משבצת בצבע של המספר שלה לפי המקרא — ומגלים מה מסתתר בציור.'
  return <article className="buga-a4 cbn-sheet">
    <h2>{title}</h2>
    {mode !== 'solution' && <>
      <p className="art-caption cbn-caption"><span>{how}</span><span className="cbn-name">שם: ______________</span></p>
      <Legend p={p} mode={mode} compact />
    </>}
    <div className="print-art"><CbnSvg p={p} mode={mode} label={`${title}: ${p.name}`} /></div>
    <footer>עוגה בוגה · צביעה לפי מספרים · ugabuga.co.il</footer>
  </article>
}

const sheetsFor = (list, kinds, withSolution) => list.flatMap(p => [...kinds.map(k => <Sheet key={`${p.slug}-${k}`} p={p} mode={k} />), ...(withSolution ? [<Sheet key={`${p.slug}-sol`} p={p} mode="solution" />] : [])])

function PictureCard({ p }) {
  const level = cbnLevel(p.level), { cols, rows } = cbnSize(p)
  return <Link to={cbnPath(p)} className="wobbly group flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-3 sketch-shadow transition-all duration-150 hover:-translate-y-1">
    <div className="cbn-thumb"><CbnSvg p={p} mode="solution" label={`צביעה לפי מספרים: ${p.name}`} /></div>
    <b className="mt-2 text-lg">{p.emoji} {p.name}</b>
    <small className="text-[var(--muted-foreground)]"><span className={`rounded-full px-2 ${level.badge}`}>{level.label}</span> · {cols}×{rows} · {p.colors.length} צבעים</small>
  </Link>
}

const HUB_FAQ = [
  { q: 'מה זה דף צביעה לפי מספרים?', a: 'דף עם משבצות, ובכל משבצת מספר. בראש הדף יש מקרא שאומר איזה צבע מתאים לכל מספר. צובעים משבצת אחרי משבצת — ובסוף מתגלה ציור שלם. זה תרגול של זיהוי מספרים, ריכוז ומוטוריקה עדינה.' },
  { q: 'איזו רמה מתאימה לאיזה גיל?', a: 'גן — ציורים קטנים עם 3–4 צבעים ומשבצות גדולות. כיתות א–ב — ציורים בינוניים עם עד 8 צבעים. ילדים גדולים ומבוגרים — ציורים גדולים ומפורטים עם 6–10 צבעים, שמתאימים גם לצביעה מרגיעה של מבוגרים.' },
  { q: 'מה ההבדל בין גרסת המספרים לגרסת התרגילים?', a: 'בגרסת התרגילים יש בכל משבצת תרגיל במקום מספר: חיבור עד 10 בגן, חיבור עד 20 בכיתות א–ב ולוח הכפל לגדולים. פותרים את התרגיל ומחפשים את התשובה במקרא. כל תשובה שייכת לצבע אחד בלבד, כך שאי אפשר להתבלבל.' },
  { q: 'יש דף פתרון?', a: 'כן. לכל ציור יש דף פתרון צבעוני — מסמנים "להדפיס גם דף פתרון" לפני ההדפסה. בדף של כל ציור אפשר גם לצבוע אונליין ולראות את הפתרון על המסך.' },
  { q: 'הדפים בחינם?', a: 'כן, כל הדפים חינמיים לשימוש בבית, בגן ובכיתה, בלי הרשמה. אפשר להדפיס כמה פעמים שרוצים — התרגילים זהים בכל הדפסה, כך שכל הכיתה מקבלת את אותו הדף.' },
]

export default function ColorByNumberHub() {
  const [params, setParams] = useSearchParams()
  const level = cbnLevel(params.get('level'))
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(false)
  const list = level ? CBN_PICTURES.filter(p => p.level === level.id) : CBN_PICTURES
  const pick = id => {
    const next = new URLSearchParams(params)
    if (!id || level?.id === id) next.delete('level'); else next.set('level', id)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="צביעה לפי מספרים להדפסה — 20 דפים לילדים ולמבוגרים" description="דפי צביעה לפי מספרים להדפסה בחינם: 20 ציורים מקוריים בשלוש רמות — גן, כיתות א–ב ומבוגרים. לכל ציור גם גרסת תרגילי חשבון, דף פתרון וצביעה אונליין." path={HUB} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'צביעה לפי מספרים' }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-[var(--postit)] px-4 py-2 font-bold">20 ציורים · מספרים או תרגילים · עם פתרון · חינם</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🎨 </span>צביעה לפי מספרים להדפסה</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">בוחרים ציור, מדפיסים, וצובעים כל משבצת בצבע של המספר שלה. לכל ציור יש גם גרסה עם תרגילי חיבור או כפל, ודף פתרון צבעוני.</p>
    </header>
    <nav aria-label="סינון לפי רמה" className="no-print mt-6 flex flex-wrap justify-center gap-2">
      {[{ id: '', label: 'כל הרמות' }, ...CBN_LEVELS].map(l => {
        const on = (level?.id || '') === l.id
        return <button key={l.id || 'all'} type="button" aria-pressed={on} onClick={() => pick(l.id)} className={`min-h-[44px] rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${on ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{l.label}</button>
      })}
    </nav>
    {level && <p className="no-print mt-3 text-center text-[var(--muted-foreground)]" role="status">{list.length} ציורים {level.long} · בגרסת התרגילים: {level.mathLabel}</p>}
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrinting(list)} className="min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white">🖨️ הדפסת כל {list.length} הדפים</button>
      <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={withSolution} onChange={e => setWithSolution(e.target.checked)} className="h-5 w-5" />להדפיס גם דף פתרון</label>
    </div>
    <section className="no-print mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{list.map(p => <PictureCard key={p.slug} p={p} />)}</section>
    {printing && <PrintPreview title={level ? `צביעה לפי מספרים — ${level.label}` : 'צביעה לפי מספרים'} onClose={() => setPrinting(null)}>{sheetsFor(printing, ['numbers'], withSolution)}</PrintPreview>}
    <div className="mt-10"><SeoBody paragraphs={[
      'צביעה לפי מספרים היא פעילות שקטה שילדים חוזרים אליה שוב ושוב: יש בה משימה ברורה, התקדמות שרואים בעיניים והפתעה בסוף — הציור מתגלה רק כשהמשבצות נצבעות. בדרך מתרגלים זיהוי מספרים, התאמה למקרא, ריכוז ושליטה בעיפרון.',
      'כל 20 הציורים בעמוד מקוריים ובנויים ממשבצות, כמו פסיפס: תפוח, דג, פרת משה רבנו, חתול ופינגווין לגן; מכונית, סירת מפרש, טיל, פרפר, ינשוף וסביבון לכיתות א–ב; ולגדולים ולמבוגרים — כדור פורח, מגדלור, תוכי, חנוכייה וצב, עם יותר משבצות ויותר צבעים.',
      'לכל ציור יש גם גרסת תרגילים: במקום מספר, בכל משבצת מחכה תרגיל — חיבור עד 10 לגן, חיבור עד 20 לכיתות א–ב ולוח הכפל לגדולים. זו דרך כיפית לתרגל חשבון בלי להרגיש שזה שיעורי בית. התרגילים קבועים, כך שהדף שמודפס היום זהה לדף שיודפס מחר.',
    ]} faq={HUB_FAQ} related={[{ label: 'צבעו לפי מספר — פסיפס חדש בכל לחיצה', href: '/printables/activity/color-by-number' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'מנדלות', href: '/printables/mandalas' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'לוח הכפל', href: '/printables/math-worksheets/multiplication' }, { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}

function pictureFaq(p) {
  const level = cbnLevel(p.level), { cols, rows } = cbnSize(p)
  const mathHow = { add10: 'תרגיל חיבור קטן, עד 10', add20: 'תרגיל חיבור עד 20', mult: 'תרגיל מלוח הכפל' }[level.math]
  return [
    { q: `לאיזה גיל מתאים דף הצביעה „${p.name}”?`, a: `הדף מתאים ${level.long}: ${cols}×${rows} משבצות ו-${p.colors.length} צבעים. ${p.level === 'gan' ? 'המשבצות גדולות והמספרים מעטים, כך שגם ילדים שרק לומדים לזהות מספרים מצליחים לבד.' : p.level === 'adults' ? 'יש הרבה משבצות ופרטים קטנים — מתאים לצבעי עיפרון מחודדים ולשעה של צביעה רגועה.' : 'יש מספיק פרטים כדי שיהיה מעניין, ועדיין אפשר לסיים בישיבה אחת.'}` },
    { q: 'איך עובדת גרסת התרגילים?', a: `בכל משבצת יש ${mathHow}. פותרים, מחפשים את התשובה במקרא וצובעים בצבע שלה. לכל צבע יש תשובה אחת משלו, ואין שני צבעים עם אותה תשובה — אז אין התלבטויות.` },
    { q: 'אפשר לצבוע אונליין?', a: 'כן. בוחרים צבע במקרא ולוחצים על המשבצות (במחשב אפשר גם לגרור עם העכבר). המונה מראה כמה משבצות נצבעו נכון, וכפתור "הצגת הפתרון" מראה את הציור המלא.' },
    { q: 'יש דף פתרון?', a: 'כן. לפני ההדפסה מסמנים "להדפיס גם דף פתרון", ואחרי דף הצביעה יודפס הציור הצבוע — נוח להורים ולמורים לבדיקה.' },
  ]
}

export function ColorByNumberPicture() {
  const { slug } = useParams()
  const p = cbnBySlug(slug)
  const [mode, setMode] = useState('numbers')
  const [active, setActive] = useState(1)
  const [fills, setFills] = useState({})
  const [reveal, setReveal] = useState(false)
  const [printing, setPrinting] = useState(null)
  const [withSolution, setWithSolution] = useState(true)
  const grid = useMemo(() => (p ? cbnGrid(p) : []), [p])
  if (!p) return <NotFound />
  const level = cbnLevel(p.level), { cols, rows } = cbnSize(p)
  const total = grid.flat().filter(n => n > 0).length
  const correct = Object.entries(fills).filter(([k, n]) => { const [r, c] = k.split('-').map(Number); return grid[r][c] === n }).length
  const paint = (r, c) => setFills(f => (f[key(r, c)] === active ? f : { ...f, [key(r, c)]: active }))
  const faq = pictureFaq(p)
  const same = CBN_PICTURES.filter(x => x.level === p.level && x.slug !== p.slug)
  const others = CBN_PICTURES.filter(x => x.level !== p.level).slice(0, 4)
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`צביעה לפי מספרים: ${p.name} — דף להדפסה עם פתרון`} description={`דף צביעה לפי מספרים של ${p.name} להדפסה בחינם, ${level.long}: ${cols}×${rows} משבצות ו-${p.colors.length} צבעים. יש גם גרסת ${level.mathLabel}, דף פתרון וצביעה אונליין.`} path={cbnPath(p)} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'צביעה לפי מספרים', href: HUB }, { label: p.name }]} />
    <header className="text-center">
      <span className={`inline-flex rounded-full px-4 py-2 font-bold ${level.badge}`}>{level.label} · {cols}×{rows} משבצות · {p.colors.length} צבעים</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{p.emoji} </span>צביעה לפי מספרים: {p.name}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{p.blurb}</p>
    </header>
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrinting(['numbers'])} className="min-h-[52px] rounded-xl bg-red-500 px-5 py-3 text-lg font-bold text-white">🖨️ הדפסה — מספרים</button>
      <button type="button" onClick={() => setPrinting(['math'])} className="min-h-[52px] rounded-xl bg-violet-600 px-5 py-3 text-lg font-bold text-white">🖨️ הדפסה — {level.mathLabel}</button>
      <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={withSolution} onChange={e => setWithSolution(e.target.checked)} className="h-5 w-5" />להדפיס גם דף פתרון</label>
    </div>
    <section className="no-print cbn-play mt-6" aria-label="צביעה אונליין">
      <div className="cbn-tabs" role="group" aria-label="סוג הדף">
        <button type="button" aria-pressed={mode === 'numbers'} onClick={() => setMode('numbers')}>🔢 מספרים</button>
        <button type="button" aria-pressed={mode === 'math'} onClick={() => setMode('math')}>➕ {level.mathLabel}</button>
      </div>
      <p className="cbn-hint">בוחרים צבע במקרא ולוחצים על המשבצות כדי לצבוע אונליין.</p>
      <Legend p={p} mode={mode} active={active} onPick={setActive} />
      <div className="cbn-board wobbly-md">
        <CbnSvg p={p} mode={reveal ? 'solution' : mode} fills={fills} onPaint={reveal ? null : paint} label={`${p.name} — צביעה ${mode === 'math' ? 'לפי תרגילים' : 'לפי מספרים'}`} />
      </div>
      <div className="cbn-tools">
        <span role="status">{correct === total ? '🎉 כל הכבוד! הציור הושלם' : `נצבעו נכון ${correct} מתוך ${total} משבצות`}</span>
        <button type="button" onClick={() => setReveal(v => !v)}>{reveal ? '🙈 הסתרת הפתרון' : '👀 הצגת הפתרון'}</button>
        <button type="button" onClick={() => { setFills({}); setReveal(false) }}>🧽 ניקוי</button>
      </div>
    </section>
    {printing && <PrintPreview title={`צביעה לפי מספרים: ${p.name}`} onClose={() => setPrinting(null)}>{sheetsFor([p], printing, withSolution)}</PrintPreview>}
    {same.length > 0 && <section className="no-print mt-10">
      <h2 className="mb-4 text-center text-3xl font-black">עוד ציורים {level.long}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{same.map(x => <PictureCard key={x.slug} p={x} />)}</div>
    </section>}
    <section className="no-print mt-8">
      <h2 className="mb-4 text-center text-2xl font-black">ציורים ברמות אחרות</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{others.map(x => <PictureCard key={x.slug} p={x} />)}</div>
      <p className="mt-4 text-center"><Link to={HUB} className="font-bold underline">לכל 20 הציורים לצביעה לפי מספרים</Link></p>
    </section>
    <div className="mt-8"><SeoBody paragraphs={[
      `${p.blurb} הציור בנוי מ-${total} משבצות על רשת של ${cols}×${rows}, ובכל משבצת מספר שמתאים לאחד מ-${p.colors.length} הצבעים במקרא: ${cbnLegend(p).map(l => `${l.num} — ${l.name}`).join(', ')}.`,
      `בגרסת התרגילים כל משבצת מקבלת ${level.math === 'mult' ? 'תרגיל מלוח הכפל' : level.math === 'add20' ? 'תרגיל חיבור עד 20' : 'תרגיל חיבור עד 10'}, והמקרא מראה איזו תשובה שייכת לאיזה צבע. כך הציור מתגלה רק למי שפותר נכון — ותרגול החשבון הופך למשחק.`,
      'מדפיסים על דף A4, בצבעי עיפרון או בטושים דקים. משבצות לבנות במקרא משאירים בלי צבע. בתחתית הדף יש קוד QR שמחזיר לעמוד הזה, למי שירצה עוד ציורים.',
    ]} faq={faq} related={[{ label: 'כל דפי הצביעה לפי מספרים', href: HUB }, { label: 'דפי צביעה לפי נושא', href: '/printables/coloring' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}
