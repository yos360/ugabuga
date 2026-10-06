import { useMemo, useState } from 'react'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'

// Clock-reading and fractions worksheets: a fresh sheet on every click, with an answers page.

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)]
const MATH_CRUMBS = [{ label: 'חשבון', href: '/printables?topic=math' }]
const MATH_SIBLINGS = [{ href: '/printables/math-worksheets', label: '➕ חיבור וחיסור' }, { href: '/printables/math-worksheets/multiplication', label: '✖️ לוח הכפל' }, { href: '/printables/clock-worksheets', label: '🕒 שעון' }, { href: '/printables/fractions-worksheets', label: '🍕 שברים' }]

function NewSheet({ onClick }) {
  return <div className="text-center"><button type="button" onClick={onClick} className="min-h-[44px] wobbly-sm border-2 border-[var(--border)] bg-white px-5 py-2 font-bold">🔄 דף חדש</button></div>
}

// ── Clocks ──────────────────────────────────────────────
function Clock({ cx, cy, r, h, m, hands = true, answer }) {
  const ha = ((h % 12) + m / 60) * 30 - 90, ma = m * 6 - 90, rad = a => a * Math.PI / 180
  return <g>
    <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#111" strokeWidth={1} />
    {Array.from({ length: 60 }, (_, i) => { const a = rad(i * 6), big = i % 5 === 0; return <line key={i} x1={cx + Math.cos(a) * r * (big ? 0.86 : 0.92)} y1={cy + Math.sin(a) * r * (big ? 0.86 : 0.92)} x2={cx + Math.cos(a) * r * 0.98} y2={cy + Math.sin(a) * r * 0.98} stroke="#111" strokeWidth={big ? 0.7 : 0.3} /> })}
    {Array.from({ length: 12 }, (_, i) => { const a = rad((i + 1) * 30 - 90); return <text key={i} x={cx + Math.cos(a) * r * 0.7} y={cy + Math.sin(a) * r * 0.7 + r * 0.08} fontSize={r * 0.22} textAnchor="middle" fontWeight={700}>{i + 1}</text> })}
    {hands && <>
      <line x1={cx} y1={cy} x2={cx + Math.cos(rad(ha)) * r * 0.48} y2={cy + Math.sin(rad(ha)) * r * 0.48} stroke={answer ? '#c1121f' : '#111'} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + Math.cos(rad(ma)) * r * 0.76} y2={cy + Math.sin(rad(ma)) * r * 0.76} stroke={answer ? '#c1121f' : '#111'} strokeWidth={1} strokeLinecap="round" />
    </>}
    <circle cx={cx} cy={cy} r={1.2} fill="#111" />
  </g>
}
const fmtTime = (h, m) => `${h}:${String(m).padStart(2, '0')}`
const WORDS = ['', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר', 'אחת-עשרה', 'שתים-עשרה']
function inWords(h, m) {
  const next = h === 12 ? 1 : h + 1
  if (m === 0) return `${WORDS[h]} בדיוק`
  if (m === 30) return `${WORDS[h]} וחצי`
  if (m === 15) return `${WORDS[h]} ורבע`
  if (m === 45) return `רבע ל${WORDS[next]}`
  return m < 30 ? `${WORDS[h]} ו-${m} דקות` : `${60 - m} דקות ל${WORDS[next]}`
}

const CLOCK_LEVELS = { hours: ['שעות עגולות', [0]], half: ['חצאי שעות', [0, 30]], quarter: ['רבעי שעה', [0, 15, 30, 45]], five: ['כל 5 דקות', Array.from({ length: 12 }, (_, i) => i * 5)] }

function ClockSheet({ items, mode, level, answers }) {
  const title = answers ? 'פתרונות' : mode === 'draw' ? 'ציירו את המחוגים' : 'מה השעה?'
  return <Sheet label={`דף עבודה שעון — ${title}`}>
    <T x={100} y={14} size={9} weight={800}>{title}</T>
    <T x={100} y={23} size={4.8} fill="#444">{CLOCK_LEVELS[level][0]} · {mode === 'draw' ? 'קראו את השעה וציירו מחוג קטן (שעות) ומחוג גדול (דקות)' : 'הסתכלו על המחוגים וכתבו את השעה'}</T>
    <T x={190} y={33} size={4.8} anchor="start">שם: ______________</T>
    {items.map(([h, m], i) => {
      const col = i % 3, row = Math.floor(i / 3), cx = 166 - col * 66, cy = 64 + row * 54
      const showHands = mode === 'read' || !!answers
      return <g key={i}>
        <T x={cx + 27} y={cy - 19} size={4.5} weight={700} fill="#888">{i + 1}</T>
        <Clock cx={cx} cy={cy} r={19} h={h} m={m} hands={showHands} answer={answers && mode === 'draw'} />
        {mode === 'read' && !answers && <T x={cx} y={cy + 28} size={6} direction="ltr">___ : ___</T>}
        {(mode === 'draw' || answers) && <T x={cx} y={cy + 27} size={6.5} weight={700} direction="ltr" fill={answers && mode === 'read' ? '#c1121f' : '#111'}>{fmtTime(h, m)}</T>}
        {(mode === 'draw' || answers) && level !== 'five' && <T x={cx} y={cy + 33} size={4} fill="#555">{inWords(h, m)}</T>}
      </g>
    })}
  </Sheet>
}

export function ClockWorksheets() {
  const [level, setLevel] = useState('half')
  const [mode, setMode] = useState('read')
  const [answers, setAnswers] = useState('yes')
  const [seed, setSeed] = useState(7)
  const items = useMemo(() => { const r = rng(seed * 31 + level.length); return Array.from({ length: 12 }, () => [1 + Math.floor(r() * 12), pick(r, CLOCK_LEVELS[level][1])]) }, [seed, level])
  const pages = [{ key: 'q', svg: <ClockSheet items={items} mode={mode} level={level} /> }]
  if (answers === 'yes') pages.push({ key: 'a', svg: <ClockSheet items={items} mode={mode} level={level} answers /> })
  return <PrintableShell path="/printables/clock-worksheets" emoji="🕒" h1="דפי עבודה בשעון להדפסה"
    seoTitle="דפי עבודה שעון להדפסה — קריאת שעון לכיתה א׳–ג׳"
    description="דפי עבודה בקריאת שעון להדפסה: שעות עגולות, חצאי שעות, רבעי שעה וכל 5 דקות. מה השעה או ציירו את המחוגים — 12 שעונים בדף, דף חדש בכל לחיצה ועם פתרונות."
    sub="12 שעונים בדף — קוראים את השעה או מציירים מחוגים, עם פתרונות"
    crumbs={MATH_CRUMBS} siblings={MATH_SIBLINGS}
    controls={<>
      <Choice label="רמה" value={level} onChange={setLevel} options={Object.entries(CLOCK_LEVELS).map(([k, [l]]) => [k, l])} />
      <Choice label="סוג תרגיל" value={mode} onChange={setMode} options={[['read', '👀 מה השעה?'], ['draw', '✏️ ציירו מחוגים']]} />
      <Choice label="פתרונות" value={answers} onChange={setAnswers} options={[['yes', 'עם דף פתרונות'], ['no', 'בלי פתרונות']]} />
      <NewSheet onClick={() => setSeed(s => s + 1)} />
    </>}
    pages={pages} printTitle="דף עבודה — שעון"
    paragraphs={['קריאת שעון מחוגים היא אחד הנושאים שילדים מתקשים בהם הכי הרבה, כי צריך לקרוא שני מחוגים בבת אחת ולתרגם אותם לשעה. הדרך הכי טובה ללמוד היא בהדרגה: קודם שעות עגולות, אחר כך חצאי שעות, רבעי שעה, ורק בסוף דקות בקפיצות של 5.', 'בכל דף יש 12 שעונים. בתרגיל "מה השעה?" הילדים מסתכלים על המחוגים וכותבים את השעה, ובתרגיל "ציירו מחוגים" הם מקבלים שעה כתובה — גם בספרות וגם במילים, כמו "שלוש ורבע" — ומציירים את המחוג הקטן והגדול בעצמם.', 'דף הפתרונות מודפס בנפרד, כך שהורים ומורות יכולים לבדוק מהר. כל לחיצה על "דף חדש" מייצרת שעות אחרות, אז אפשר לתרגל שוב ושוב.']}
    faq={[{ q: 'באיזו כיתה לומדים לקרוא שעון?', a: 'שעות עגולות וחצאי שעות כבר בכיתה א׳, רבעי שעה בכיתה ב׳, ודקות מדויקות בכיתות ב׳–ג׳.' }, { q: 'איך מסבירים את ההבדל בין המחוגים?', a: 'המחוג הקטן והעבה מראה שעות, והגדול והדק מראה דקות. טיפ: "הקטן מראה את השעה, הגדול רץ מהר על הדקות".' }, { q: 'למה במחוג השעות לא מצביע בדיוק על המספר?', a: 'כי הוא זז לאט במהלך השעה. בשלוש וחצי המחוג הקטן נמצא באמצע בין 3 ל-4 — בדיוק כמו בשעון אמיתי.' }]}
    related={[{ label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'דפי עבודה בשברים', href: '/printables/fractions-worksheets' }]} />
}

// ── Fractions ──────────────────────────────────────────────
function Frac({ x, y, n, d, size = 7, color = '#111' }) {
  return <g><text x={x} y={y - 1.2} fontSize={size} textAnchor="middle" fontWeight={700} fill={color}>{n}</text><line x1={x - size * 0.45} x2={x + size * 0.45} y1={y + 0.5} y2={y + 0.5} stroke={color} strokeWidth={0.6} /><text x={x} y={y + size * 0.95} fontSize={size} textAnchor="middle" fontWeight={700} fill={color}>{d}</text></g>
}
function Shape({ kind, cx, cy, d, n, fill = '#9ad0ff', blank }) {
  if (kind === 'pie') {
    const r = 13, pts = a => [cx + Math.sin(a) * r, cy - Math.cos(a) * r]
    return <g>{Array.from({ length: d }, (_, i) => { const a0 = i * 2 * Math.PI / d, a1 = (i + 1) * 2 * Math.PI / d, [x0, y0] = pts(a0), [x1, y1] = pts(a1)
      return <path key={i} d={d === 1 ? `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0` : `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={!blank && i < n ? fill : '#fff'} stroke="#111" strokeWidth={0.6} /> })}</g>
  }
  const w = 40, h = 12, x = cx - w / 2
  return <g>{Array.from({ length: d }, (_, i) => <rect key={i} x={x + w - (i + 1) * w / d} y={cy - h / 2} width={w / d} height={h} fill={!blank && i < n ? fill : '#fff'} stroke="#111" strokeWidth={0.6} />)}</g>
}

const FRAC_LEVELS = { easy: ['חצי, שליש ורבע', [2, 3, 4]], mid: ['עד שישיות', [2, 3, 4, 5, 6]], hard: ['עד שמיניות', [2, 3, 4, 5, 6, 8]] }
const FRAC_MODES = { name: '👀 איזה חלק צבוע?', color: '🖍️ צבעו את השבר', compare: '⚖️ גדול, קטן או שווה' }

function FracSheet({ items, mode, answers }) {
  const title = answers ? 'פתרונות' : { name: 'איזה חלק צבוע?', color: 'צבעו את השבר', compare: 'השוו בין השברים' }[mode]
  const hint = { name: 'כתבו את השבר שמתאים לחלק הצבוע', color: 'צבעו בכל צורה את החלק שכתוב לידה', compare: 'כתבו בעיגול > או < או =' }[mode]
  return <Sheet label={`דף עבודה שברים — ${title}`}>
    <T x={100} y={14} size={9} weight={800}>{title}</T>
    <T x={100} y={23} size={4.8} fill="#444">{hint}</T>
    <T x={190} y={33} size={4.8} anchor="start">שם: ______________</T>
    {items.map((it, i) => {
      if (mode === 'compare') {
        const cy = 46 + i * 18.5, [a, b] = it, sign = a.n / a.d > b.n / b.d ? '>' : a.n / a.d < b.n / b.d ? '<' : '='
        // Left-to-right like a math sentence: a ○ b
        return <g key={i}>
          <T x={188} y={cy + 1.5} size={4.4} fill="#888" weight={700}>{i + 1}</T>
          <Frac x={30} y={cy - 1} n={a.n} d={a.d} size={5} /><Shape kind="bar" cx={62} cy={cy} d={a.d} n={a.n} />
          <circle cx={100} cy={cy} r={5.5} fill="#fff" stroke="#111" strokeWidth={0.6} />
          {answers && <text x={100} y={cy + 2.4} fontSize={7} fontWeight={800} fill="#c1121f" textAnchor="middle">{sign}</text>}
          <Shape kind="bar" cx={138} cy={cy} d={b.d} n={b.n} /><Frac x={170} y={cy - 1} n={b.n} d={b.d} size={5} />
        </g>
      }
      const col = i % 2, row = Math.floor(i / 2), cx = 145 - col * 90, cy = 56 + row * 37
      const num = <T x={cx + 40} y={cy - 12} size={4.4} fill="#888" weight={700}>{i + 1}</T>
      const { n, d, kind } = it
      return <g key={i}>{num}
        <Shape kind={kind} cx={cx + 10} cy={cy} d={d} n={n} blank={mode === 'color' && !answers} />
        {mode === 'name' && !answers && <g fill="#fff" stroke="#111" strokeWidth={0.5}><rect x={cx - 29} y={cy - 9.5} width={9} height={8} rx={1} /><line x1={cx - 31} x2={cx - 18} y1={cy + 0.5} y2={cy + 0.5} strokeWidth={0.8} /><rect x={cx - 29} y={cy + 2.5} width={9} height={8} rx={1} /></g>}
        {(mode === 'color' || answers) && <Frac x={cx - 24} y={cy} n={n} d={d} color={answers && mode === 'name' ? '#c1121f' : '#111'} />}
      </g>
    })}
  </Sheet>
}

export function FractionWorksheets() {
  const [level, setLevel] = useState('easy')
  const [mode, setMode] = useState('name')
  const [answers, setAnswers] = useState('yes')
  const [seed, setSeed] = useState(3)
  const items = useMemo(() => {
    const r = rng(seed * 17 + level.length * 5 + mode.length), dens = FRAC_LEVELS[level][1]
    const one = () => { const d = pick(r, dens); return { d, n: 1 + Math.floor(r() * (d - 1 || 1)), kind: r() < 0.5 ? 'pie' : 'bar' } }
    return Array.from({ length: 12 }, () => (mode === 'compare' ? [one(), one()] : one()))
  }, [seed, level, mode])
  const pages = [{ key: 'q', svg: <FracSheet items={items} mode={mode} /> }]
  if (answers === 'yes') pages.push({ key: 'a', svg: <FracSheet items={items} mode={mode} answers /> })
  return <PrintableShell path="/printables/fractions-worksheets" emoji="🍕" h1="דפי עבודה בשברים להדפסה"
    seoTitle="דפי עבודה שברים להדפסה — לכיתות ב׳–ד׳ עם פתרונות"
    description="דפי עבודה בשברים להדפסה: איזה חלק צבוע, צבעו את השבר והשוואת שברים. עיגולים ומלבנים מחולקים, מחצי ועד שמיניות — דף חדש בכל לחיצה ועם פתרונות."
    sub="עיגולים ומלבנים מחולקים — מזהים, צובעים ומשווים שברים"
    crumbs={MATH_CRUMBS} siblings={MATH_SIBLINGS}
    controls={<>
      <Choice label="סוג תרגיל" value={mode} onChange={setMode} options={Object.entries(FRAC_MODES)} />
      <Choice label="רמה" value={level} onChange={setLevel} options={Object.entries(FRAC_LEVELS).map(([k, [l]]) => [k, l])} />
      <Choice label="פתרונות" value={answers} onChange={setAnswers} options={[['yes', 'עם דף פתרונות'], ['no', 'בלי פתרונות']]} />
      <NewSheet onClick={() => setSeed(s => s + 1)} />
    </>}
    pages={pages} printTitle="דף עבודה — שברים"
    paragraphs={['שברים הם נושא שילדים מבינים הרבה יותר טוב כשהם רואים אותם: עיגול שמחולק כמו פיצה, או מלבן שמחולק כמו חפיסת שוקולד. כל הדפים כאן בנויים על ציורים כאלה, כך שהילד לומד מה זה "שלושה רבעים" לפני שהוא לומד לחשב עם זה.', 'יש שלושה סוגי תרגילים: "איזה חלק צבוע?" — מסתכלים על הצורה וכותבים את השבר; "צבעו את השבר" — מקבלים שבר וצובעים את החלק הנכון; ו"גדול, קטן או שווה" — משווים בין שני שברים בעזרת הציור.', 'מתחילים ברמה של חצי, שליש ורבע, שמתאימה לכיתה ב׳, ועוברים לשישיות ושמיניות בכיתות ג׳–ד׳. דף הפתרונות מודפס בנפרד ומקל על הבדיקה.']}
    faq={[{ q: 'מתי לומדים שברים בבית הספר?', a: 'היכרות ראשונה עם חצי ורבע כבר בכיתה ב׳, ושברים פשוטים והשוואה ביניהם בכיתות ג׳–ד׳.' }, { q: 'איך מסבירים מה זה מכנה ומונה?', a: 'המספר למטה (המכנה) אומר לכמה חלקים שווים חילקנו, והמספר למעלה (המונה) אומר כמה חלקים לקחנו.' }]}
    related={[{ label: 'דפי עבודה בשעון', href: '/printables/clock-worksheets' }, { label: 'לוח הכפל', href: '/printables/math-worksheets/multiplication' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }]} />
}
