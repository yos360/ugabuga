import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { ExerciseSheet, PathSheet } from '../../components/math/MathSheet'
import { exercises, paths, newSeed } from '../../utils/mathSheets'

// Four SEO entry points, one generator:
//   /printables/math-worksheets          — דפי עבודה בחשבון לכיתה א׳ (hub)
//   /printables/math-worksheets/up-to-10 — חיבור וחיסור עד 10
//   /printables/math-worksheets/up-to-20 — חיבור וחיסור עד 20
//   /printables/math-paths               — שבילים בחשבון

// Extra indexable pages (/printables/math-worksheets/<slug>): one per operation and range, and one per
// multiplication table — all from the same generator.
const addSub = (slug, op, range, opName, grade) => ({
  path: `/printables/math-worksheets/${slug}`, range, op, mode: 'exercises',
  title: `${opName} עד ${range} — דפי עבודה ל${grade} להדפסה`,
  h1: `${op === '+' ? '➕' : op === '-' ? '➖' : '🔢'} ${opName} עד ${range}`,
  sub: `דפי עבודה ל${grade} · 20 תרגילים בדף · דף חדש בכל לחיצה · עם פתרונות`,
  desc: `${opName} עד ${range} — דפי עבודה ל${grade} להדפסה בחינם: תרגילים רגילים, מספר חסר ובמאונך, דף חדש בכל לחיצה ודף פתרונות.`,
  crumb: `${opName} עד ${range}`,
})
const ADD_SUB_PRESETS = {
  'addition-up-to-10': addSub('addition-up-to-10', '+', 10, 'חיבור', 'כיתה א׳ ולגן חובה'),
  'subtraction-up-to-10': addSub('subtraction-up-to-10', '-', 10, 'חיסור', 'כיתה א׳ ולגן חובה'),
  'addition-up-to-20': addSub('addition-up-to-20', '+', 20, 'חיבור', 'כיתה א׳'),
  'subtraction-up-to-20': addSub('subtraction-up-to-20', '-', 20, 'חיסור', 'כיתה א׳'),
  'up-to-100': addSub('up-to-100', 'mix', 100, 'חיבור וחיסור', 'כיתה ב׳'),
  'addition-up-to-100': addSub('addition-up-to-100', '+', 100, 'חיבור', 'כיתה ב׳'),
  'subtraction-up-to-100': addSub('subtraction-up-to-100', '-', 100, 'חיסור', 'כיתה ב׳'),
}
const table = (slug, op, t) => {
  const all = t === 'mix', mul = op === 'x'
  const name = mul ? (all ? 'לוח הכפל' : `לוח הכפל של ${t}`) : (all ? 'חילוק — כל הלוחות' : `חילוק ב-${t}`)
  return {
    path: `/printables/math-worksheets/${slug}`, range: 10, op, table: t, mode: 'table',
    title: `${name} — ${mul ? 'תרגילי כפל' : 'תרגילי חילוק'} להדפסה, דף חדש בכל לחיצה`,
    h1: `${mul ? '✖️' : '➗'} ${name}`,
    sub: `${all ? 'כל הלוחות מ-2 עד 10' : `${mul ? 'כפל' : 'חילוק'} ב-${t}, מ-1 עד 10`} · 20 תרגילים בדף · עם פתרונות`,
    desc: `${name} להדפסה בחינם: 20 תרגילי ${mul ? 'כפל' : 'חילוק'}${all ? ' מכל הלוחות' : ` ב-${t}`} בדף, גם עם מספר חסר. דף חדש בכל לחיצה ודף פתרונות — לכיתות ב׳–ד׳.`,
    crumb: name,
  }
}
const TABLE_PRESETS = {
  multiplication: table('multiplication', 'x', 'mix'),
  ...Object.fromEntries([2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => [`multiplication-table-${t}`, table(`multiplication-table-${t}`, 'x', t)])),
  division: table('division', '÷', 'mix'),
}
const MATH_PAGE_SLUGS = [...Object.keys(ADD_SUB_PRESETS), ...Object.keys(TABLE_PRESETS)]

const PRESETS = {
  hub: {
    path: '/printables/math-worksheets', range: 10, mode: 'exercises',
    title: 'דפי עבודה בחשבון לכיתה א׳ — להדפסה חינם',
    h1: '🔢 דפי עבודה בחשבון לכיתה א׳',
    sub: 'חיבור וחיסור עד 10 ועד 20, מספר חסר, תרגילים במאונך ושבילים — דף חדש בכל לחיצה',
    desc: 'דפי עבודה בחשבון לכיתה א׳ להדפסה בחינם: חיבור וחיסור עד 10 ועד 20, מספר חסר, תרגילים במאונך, תרגילים עם ציורים ושבילים — דף חדש בכל לחיצה, עם דף פתרונות.',
    crumb: 'דפי עבודה בחשבון',
  },
  '10': {
    path: '/printables/math-worksheets/up-to-10', range: 10, mode: 'exercises',
    title: 'חיבור וחיסור עד 10 — דפי עבודה לכיתה א׳',
    h1: '➕ חיבור וחיסור עד 10',
    sub: 'דפי עבודה לכיתה א׳ ולגן חובה · 20 תרגילים בדף · עם פתרונות',
    desc: 'דפי עבודה בחשבון לכיתה א׳: חיבור וחיסור עד 10 להדפסה חינם — תרגילים רגילים, מספר חסר, במאונך ועם ציורים לספירה. דף חדש בכל לחיצה ודף פתרונות.',
    crumb: 'חיבור וחיסור עד 10',
  },
  '20': {
    path: '/printables/math-worksheets/up-to-20', range: 20, mode: 'exercises',
    title: 'חיבור וחיסור עד 20 — דפי עבודה לכיתה א׳',
    h1: '➕ חיבור וחיסור עד 20',
    sub: 'דפי עבודה לכיתה א׳ · מעבר עשרת · 20 תרגילים בדף · עם פתרונות',
    desc: 'חיבור וחיסור עד 20 — דפי עבודה לכיתה א׳ להדפסה בחינם, עם דגש על מעבר עשרת (8+5, 13−6). תרגילים רגילים, מספר חסר ובמאונך, ודף פתרונות.',
    crumb: 'חיבור וחיסור עד 20',
  },
  paths: {
    path: '/printables/math-paths', range: 10, mode: 'paths',
    title: 'שבילים בחשבון — דפי עבודה לכיתה א׳',
    h1: '🛤️ שבילים בחשבון',
    sub: 'דפי עבודה לכיתה א׳ · משלימים מספרים ופעולות לאורך השביל · עד 10 או עד 20',
    desc: 'דפי עבודה בחשבון לכיתה א׳ — שבילים להדפסה בחינם: משלימים את המספר החסר בעיגול או את הפעולה על החץ, בתחום 10 או 20. דף חדש בכל לחיצה, עם פתרונות.',
    crumb: 'שבילים בחשבון',
  },
  ...ADD_SUB_PRESETS,
  ...TABLE_PRESETS,
}

const TYPES = [['regular', 'תרגילים רגילים'], ['missing', 'מספר חסר'], ['vertical', 'במאונך'], ['pictures', 'עם ציורים (עד 10)']]
const OPS = [['+', 'חיבור'], ['-', 'חיסור'], ['mix', 'חיבור וחיסור']]
const VARIANTS = [['numbers', 'משלימים מספרים'], ['ops', 'משלימים פעולות'], ['mixed', 'משולב']]

const FAQ = {
  exercises: [
    { q: 'מה ההבדל בין חיבור וחיסור עד 10 לעד 20?', a: 'עד 10 היא החצי הראשון של כיתה א׳ — ספירה, חיבור וחיסור פשוטים. עד 20 מגיע אחר כך, והקושי העיקרי בו הוא "מעבר עשרת" (למשל 8+5 או 13−6). לכן בדפים עד 20 רוב התרגילים עוברים את העשר.' },
    { q: 'מה זה "מספר חסר"?', a: 'תרגיל שבו חסר אחד המספרים ולא התשובה, למשל 4 + ___ = 9. זה מלמד את הקשר בין חיבור לחיסור, ומופיע הרבה בחוברות של כיתה א׳.' },
    { q: 'יש דף פתרונות?', a: 'כן. מסמנים "הוסיפו דף פתרונות" ואחרי כל דף תרגילים מודפס דף עם התשובות בצבע — נוח לבדיקה עצמית או למורה.' },
    { q: 'כמה דפים אפשר להדפיס?', a: 'כמה שרוצים — כל לחיצה על "דף חדש" יוצרת תרגילים אחרים, ואפשר להדפיס עד 5 דפים שונים בבת אחת. הכול בחינם ובלי הרשמה.' },
  ],
  table: [
    { q: 'איך הכי טוב ללמוד את לוח הכפל?', a: 'לוח אחד בכל פעם, מהקל לקשה: 2, 5 ו-10 קודם, אחר כך 3 ו-4, ובסוף 6, 7, 8 ו-9. דף אחד ביום של אותו לוח, ורק כשהוא שוטף עוברים ללוח הבא — ואז דפים של כל הלוחות יחד.' },
    { q: 'יש גם חילוק?', a: 'כן. בוחרים "חילוק" ומקבלים את אותו לוח הפוך (42 ÷ 6 = ___). חילוק עוזר לזכור את הכפל, כי כל תרגיל חילוק הוא שאלה על לוח הכפל.' },
    { q: 'מה זה "מספר חסר" בכפל?', a: 'תרגיל כמו 7 × ___ = 56. הילד צריך לחשוב איזה מספר כפול 7 נותן 56 — תרגול מצוין לפני חילוק.' },
    { q: 'יש פתרונות?', a: 'כן — מסמנים "הוסיפו דף פתרונות" ואחרי כל דף מודפסות התשובות בצבע.' },
  ],
  paths: [
    { q: 'מה זה שבילים בחשבון?', a: 'שביל הוא שרשרת של עיגולים עם חצים ביניהם. על כל חץ כתובה פעולה (+3, −2), והילד מחשב מעיגול לעיגול. יש שבילים שבהם משלימים את המספרים, ויש שבהם משלימים את הפעולה שחסרה על החץ.' },
    { q: 'לאיזו כיתה מתאימים השבילים?', a: 'שבילים עד 10 מתאימים לכיתה א׳ מתחילת השנה, ושבילים עד 20 — לאמצע ולסוף כיתה א׳ ולחזרה בכיתה ב׳.' },
    { q: 'יש פתרונות?', a: 'כן — מסמנים "הוסיפו דף פתרונות" ומקבלים אחרי כל דף את השבילים המלאים, עם התשובות בצבע.' },
  ],
}

function Pills({ label, items, value, onChange }) {
  return <div className="flex flex-wrap items-center justify-center gap-2" role="radiogroup" aria-label={label}>
    <span className="font-bold ml-1">{label}:</span>
    {items.map(([id, text]) => <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)}
      className={`min-h-[44px] rounded-xl border-2 px-3 font-bold ${value === id ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{text}</button>)}
  </div>
}

export default function MathWorksheets({ preset: fixedPreset }) {
  const { slug } = useParams()
  const preset = fixedPreset || slug || 'hub'
  const p = PRESETS[preset]
  const [range, setRange] = useState(p?.range || 10)
  const [op, setOp] = useState(p?.op || 'mix')
  const [table, setTable] = useState(p?.table ?? 'mix')
  const [type, setType] = useState('regular')
  const [variant, setVariant] = useState('numbers')
  const [pages, setPages] = useState(1)
  const [withAnswers, setWithAnswers] = useState(false)
  const [seed, setSeed] = useState(newSeed)
  const [print, setPrint] = useState(false)
  const isPaths = p?.mode === 'paths', isTable = p?.mode === 'table'
  const effType = (range > 10 || isTable) && type === 'pictures' ? 'regular' : isTable && type === 'vertical' ? 'regular' : type

  const sheetTitle = isPaths ? `שבילים עד ${range}`
    : isTable ? (op === '÷' ? (table === 'mix' ? 'חילוק — כל הלוחות' : `חילוק ב-${table}`) : (table === 'mix' ? 'לוח הכפל — כל הלוחות' : `לוח הכפל של ${table}`))
    : `${op === '+' ? 'חיבור' : op === '-' ? 'חיסור' : 'חיבור וחיסור'} עד ${effType === 'pictures' ? 10 : range}`
  const make = s => isPaths
    ? paths({ range, count: 7, variant, seed: s })
    : exercises({ range, op, type: effType, count: effType === 'pictures' ? 8 : 20, seed: s, table })
  const render = (items, answers, key) => <article className="buga-a4" key={key}><div className="print-art">
    {isPaths ? <PathSheet items={items} title={sheetTitle} answers={answers} /> : <ExerciseSheet items={items} title={sheetTitle} type={effType} answers={answers} />}
  </div></article>

  const preview = useMemo(() => (p ? make(seed) : []), [seed, range, op, effType, variant, isPaths, table]) // eslint-disable-line react-hooks/exhaustive-deps
  const printPages = useMemo(() => {
    if (!print) return []
    return Array.from({ length: pages }, (_, i) => { const items = i === 0 ? preview : make(seed * 31 + i * 7919); return [render(items, false, 'q' + i), ...(withAnswers ? [render(items, true, 'a' + i)] : [])] }).flat()
  }, [print]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return <Navigate to="/printables/math-worksheets" replace />
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title={p.title} description={p.desc} path={p.path} structuredData={faqSchema(FAQ[p.mode] || FAQ.exercises)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, ...(preset === 'hub' ? [] : [{ label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }]), { label: p.crumb }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">{p.h1}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{p.sub}</p>

      <nav className="mb-6 flex flex-wrap justify-center gap-2" aria-label="סוגי דפי עבודה">
        {[['10', 'עד 10', '/printables/math-worksheets/up-to-10'], ['20', 'עד 20', '/printables/math-worksheets/up-to-20'], ['paths', 'שבילים', '/printables/math-paths']].map(([id, label, href]) =>
          <Link key={id} to={href} aria-current={preset === id ? 'page' : undefined} className={`rounded-full border-2 px-4 py-1.5 font-bold ${preset === id ? 'border-slate-800 bg-pink-200' : 'border-[var(--border)] bg-white'}`}>{label}</Link>)}
      </nav>

      <div className="grid gap-6 md:grid-cols-[1fr_1fr] items-start mb-10">
        <div className="rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow space-y-4">
          {isTable ? <>
            <Pills label="פעולה" items={[['x', 'כפל'], ['÷', 'חילוק']]} value={op} onChange={v => { setOp(v); setSeed(newSeed()) }} />
            <Pills label="לוח" items={[...[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => [n, String(n)]), ['mix', 'כל הלוחות']]} value={table} onChange={v => { setTable(v); setSeed(newSeed()) }} />
            <Pills label="סוג" items={TYPES.slice(0, 2)} value={effType} onChange={v => { setType(v); setSeed(newSeed()) }} />
          </> : <>
          <Pills label="תחום" items={[[10, 'עד 10'], [20, 'עד 20'], ...(isPaths ? [] : [[100, 'עד 100']])]} value={range} onChange={v => { setRange(v); setSeed(newSeed()) }} />
          {isPaths
            ? <Pills label="מה משלימים" items={VARIANTS} value={variant} onChange={v => { setVariant(v); setSeed(newSeed()) }} />
            : <>
              <Pills label="פעולה" items={OPS} value={op} onChange={v => { setOp(v); setSeed(newSeed()) }} />
              <Pills label="סוג" items={range > 10 ? TYPES.slice(0, 3) : TYPES} value={effType} onChange={v => { setType(v); setSeed(newSeed()) }} />
            </>}
          </>}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="flex items-center gap-2 font-bold">מספר דפים
              <select value={pages} onChange={e => setPages(+e.target.value)} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-3">{[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}</option>)}</select>
            </label>
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={withAnswers} onChange={e => setWithAnswers(e.target.checked)} className="h-5 w-5" />הוסיפו דף פתרונות</label>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setSeed(newSeed())} className="min-h-[52px] rounded-2xl border-2 border-slate-800 bg-white px-5 text-lg font-bold">🎲 דף חדש</button>
            <button data-print-main type="button" onClick={() => setPrint(true)} className="min-h-[52px] rounded-2xl bg-pink-600 px-6 text-lg font-bold text-white">🖨️ הדפיסו{pages > 1 ? ` ${pages} דפים` : ''}</button>
          </div>
        </div>
        <button type="button" onClick={() => setPrint(true)} className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm" aria-label="תצוגה מקדימה — לחצו להדפסה">
          <div className="aspect-[600/820]">{isPaths ? <PathSheet items={preview} title={sheetTitle} /> : <ExerciseSheet items={preview} title={sheetTitle} type={effType} />}</div>
        </button>
      </div>

      <nav className="mb-10 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm" aria-label="עוד דפי חשבון">
        <span className="w-full text-center font-bold">עוד דפי חשבון:</span>
        {MATH_PAGE_SLUGS.filter(k => k !== preset).map(k => <Link key={k} to={PRESETS[k].path} className="underline">{PRESETS[k].crumb}</Link>)}
      </nav>

      <SeoBody
        paragraphs={isTable ? [
          'דפי לוח הכפל נוצרים אוטומטית: בוחרים לוח (2 עד 10, או את כולם יחד), כפל או חילוק, ומקבלים 20 תרגילים חדשים בכל לחיצה. התרגילים מופיעים בשני הכיוונים (7 × 3 וגם 3 × 7), כדי שהילד יבין שזה אותו תרגיל.',
          'טיפ להורים: 5 דקות ביום על לוח אחד עדיפות על שעה לפני מבחן. מדביקים את הדף על המקרר, פותרים בעל פה בארוחת הבוקר, ובסוף השבוע מדפיסים דף חדש לבדיקה.',
        ] : isPaths ? [
          'שבילים הם אחד מסוגי התרגול האהובים בכיתה א׳: הילד מתחיל מהעיגול הצהוב, עושה את הפעולה שעל החץ וממשיך הלאה — כמו מסע. כך מתרגלים חיבור וחיסור ברצף, בלי שזה ירגיש כמו עוד דף תרגילים.',
          'אפשר לבחור שבילים שבהם משלימים את המספרים בעיגולים, שבילים שבהם המספרים ידועים וצריך לגלות מה הפעולה על החץ (למשל מ־4 ל־9 זה +5), או שילוב של השניים — שמתאים לילדים שכבר שולטים בחומר.',
        ] : [
          'דפי העבודה בחשבון נוצרים אוטומטית לפי מה שבוחרים: תחום (עד 10 או עד 20), פעולה (חיבור, חיסור או שניהם) וסוג תרגול. כל לחיצה על "דף חדש" נותנת תרגילים אחרים, כך שאפשר לתרגל כל יום בלי לחזור על אותו דף.',
          'בדפים עד 20 רוב התרגילים כוללים מעבר עשרת — כי שם ילדי כיתה א׳ צריכים הכי הרבה תרגול. בדפים עד 10 אפשר לבחור גם תרגילים עם ציורים, שמתאימים לגן חובה ולתחילת כיתה א׳: סופרים את הציורים ורק אז כותבים את התשובה.',
          'טיפ להורים: דף אחד ביום, 10 דקות, עדיף על חמישה דפים בסוף השבוע. אם הילד מתקשה, חזרו לתחום קטן יותר או לתרגילים עם ציורים.',
        ]}
        faq={FAQ[p.mode] || FAQ.exercises}
        related={[{ label: 'לימוד אותיות בעברית', href: '/letters' }, { label: 'מספרים למעבר בעיפרון', href: '/printables/numbers' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }]}
      />

      {print && <PrintPreview title={sheetTitle} onClose={() => setPrint(false)}>{printPages}</PrintPreview>}
    </div>
  )
}
