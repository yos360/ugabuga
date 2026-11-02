import { A4, Certificate, Cover, FillPage, Head, SvgPage } from './kit'
import { Clock, Problems } from './mathGrade2'
import { bookletBySlug } from './registry'

// "חוברת עבודה בחשבון לכיתה ג׳" — the multiplication table, division as the inverse of multiplication,
// adding and subtracting to 1000, hundreds-tens-ones, comparing, skip counting, fractions, perimeter,
// the clock to five minutes and word problems. Every answer is computed from the data below.
const PAGES = bookletBySlug('math-grade-3').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

const op = (a, sign, b, ans, tail = '') => ({ text: `${a} ${sign} ${b} = ____${tail}`, ans })
export const TABLE_A = [[2, 6], [3, 4], [4, 5], [5, 7], [3, 9], [4, 8], [2, 9], [5, 6], [3, 7], [4, 6], [2, 8], [5, 9]].map(([a, b]) => op(a, '×', b, a * b))
export const TABLE_B = [[6, 7], [6, 8], [7, 8], [7, 9], [8, 9], [9, 9], [6, 9], [7, 7], [8, 8], [10, 9], [6, 6], [9, 8]].map(([a, b]) => op(a, '×', b, a * b))
// Missing factor: [known, product, blank on the left?].
export const MISSING = [[4, 28, false], [6, 30, false], [8, 24, true], [9, 54, false], [7, 28, true], [5, 40, false], [3, 27, true], [6, 48, false], [9, 63, true], [7, 56, false], [4, 36, true], [8, 72, false]]
  .map(([k, p, left]) => ({ text: left ? `____ × ${k} = ${p}` : `${k} × ____ = ${p}`, ans: p / k }))
export const DIVIDE = [[12, 3], [20, 4], [18, 2], [35, 5], [24, 6], [42, 7], [56, 8], [27, 3], [63, 9], [40, 10], [48, 6], [72, 8]].map(([a, b]) => op(a, '÷', b, a / b))
export const ADD = [[234, 152], [341, 225], [418, 361], [275, 143], [456, 238], [387, 265], [529, 184], [648, 279], [157, 468], [395, 426]].map(([a, b]) => op(a, '+', b, a + b))
export const SUB = [[785, 432], [648, 215], [925, 603], [864, 347], [703, 256], [912, 478], [550, 267], [831, 594], [600, 345], [742, 389]].map(([a, b]) => op(a, '−', b, a - b))
// Hundreds, tens, ones.
export const PLACE = [[3, 4, 7], [5, 0, 8], [2, 6, 0], [7, 1, 9], [4, 4, 4], [9, 0, 0], [6, 3, 5]]
export const COMPARE = [[347, 374], [500, 500], [628, 268], [905, 950], [789, 798], [1000, 999], [412, 142], [630, 630], [256, 265], [870, 807]]
const symbol = (a, b) => a > b ? '>' : a < b ? '<' : '='
// Skip counting: [start, step, length, blank positions].
export const SEQUENCES = [[100, 100, 6, [2, 4]], [250, 50, 6, [1, 4]], [25, 25, 7, [2, 5]], [4, 4, 7, [3, 5]], [6, 6, 6, [2, 4]], [1000, -100, 6, [1, 4]]]
const seqValues = ([start, step, len]) => Array.from({ length: len }, (_, i) => start + i * step)
// Fractions: [parts, shaded parts, bar or pie].
export const FRACTIONS = [[2, 1, 'bar'], [4, 3, 'pie'], [3, 2, 'bar'], [8, 5, 'pie'], [5, 2, 'bar'], [6, 4, 'pie']]
// Rectangles: [length, width] in cm.
export const RECTS = [[8, 5], [12, 7], [9, 4], [15, 6], [10, 10], [14, 3]]
const perimeter = ([a, b]) => 2 * (a + b)
export const CLOCKS = [[2, 10], [6, 25], [9, 40], [11, 55], [4, 35], [8, 5]]
export const WORD_PROBLEMS = [
  { q: 'בחנות הספרים של רונית יש 6 מדפים, ובכל מדף 8 ספרים. כמה ספרים יש בחנות?', ans: '6 × 8 = 48' },
  { q: '36 תלמידים מתחלקים שווה בשווה ל־4 קבוצות. כמה תלמידים יש בכל קבוצה?', ans: '36 ÷ 4 = 9' },
  { q: 'אורי קרא 125 עמודים בשבוע שעבר ו־148 עמודים השבוע. כמה עמודים קרא בשני השבועות?', ans: '125 + 148 = 273' },
  { q: 'בספרייה היו 350 ספרים, ו־128 מהם הושאלו. כמה ספרים נשארו בספרייה?', ans: '350 − 128 = 222' },
  { q: 'תמר קנתה 3 מחברות, כל אחת ב־12 שקלים, ועט אחד ב־9 שקלים. כמה שילמה בסך הכול?', ans: '3 × 12 + 9 = 45 ₪' },
  { q: 'בכיתה של מיכל 28 תלמידים. בכל שולחן יושבים 4 תלמידים. כמה שולחנות יש בכיתה?', ans: '28 ÷ 4 = 7' },
  { q: 'בגינה מלבנית אורכה 12 מטר ורוחבה 8 מטר. כמה מטרים של גדר צריך כדי להקיף אותה?', ans: '2 × (12 + 8) = 40 מטר' },
]

function ComparePage({ n }) {
  return <SvgPage label="גדול, קטן או שווה">
    <Head n={n} title="גדול, קטן או שווה?" instruction="כותבים בעיגול: <  או  >  או  =" />
    {COMPARE.map(([a, b], i) => {
      const col = i % 2, y = 170 + Math.floor(i / 2) * 120, cx = col ? 150 : 440
      return <g key={i} fontFamily={FONT} fontSize="36" fontWeight="700" textAnchor="middle">
        <text x={cx - 85} y={y + 13}>{a}</text><circle cx={cx} cy={y} r="26" fill="white" stroke={INK} strokeWidth="2.5" /><text x={cx + 85} y={y + 13}>{b}</text>
      </g>
    })}
  </SvgPage>
}

function Pie({ cx, cy, r, parts, shaded }) {
  const pt = k => { const a = -Math.PI / 2 + k * 2 * Math.PI / parts; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] }
  return <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
    <circle cx={cx} cy={cy} r={r} fill="white" />
    {Array.from({ length: parts }, (_, k) => { const [x1, y1] = pt(k), [x2, y2] = pt(k + 1); return <path key={k} d={`M${cx} ${cy}L${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}Z`} fill={k < shaded ? '#93c5fd' : 'white'} /> })}
  </g>
}

function FractionsPage({ n }) {
  return <SvgPage label="שברים">
    <Head n={n} title="שברים" instruction="כותבים כמה חלקים צבועים מתוך כמה חלקים שווים" />
    {FRACTIONS.map(([parts, shaded, kind], i) => {
      const col = i % 2, y = 140 + Math.floor(i / 2) * 220, cx = col ? 150 : 450
      return <g key={i} fontFamily={FONT} textAnchor="middle">
        {kind === 'pie'
          ? <Pie cx={cx} cy={y + 78} r={70} parts={parts} shaded={shaded} />
          : <g stroke={INK} strokeWidth="2.5">{Array.from({ length: parts }, (_, k) => <rect key={k} x={cx - 120 + k * 240 / parts} y={y + 38} width={240 / parts} height="80" fill={k < shaded ? '#93c5fd' : 'white'} />)}</g>}
        <text x={cx} y={y + 188} fontSize="18" direction="rtl">{'___ חלקים צבועים מתוך ___'}</text>
      </g>
    })}
  </SvgPage>
}

function PerimeterPage({ n }) {
  return <SvgPage label="היקף">
    <Head n={n} title="היקף" instruction="היקף הוא סכום כל הצלעות. כותבים את ההיקף של כל מלבן" sub="הציורים אינם בקנה מידה" />
    {RECTS.map(([a, b], i) => {
      const col = i % 2, y = 150 + Math.floor(i / 2) * 210, cx = col ? 150 : 450
      return <g key={i} fontFamily={FONT} textAnchor="middle" fontSize="20" fontWeight="700">
        <rect x={cx - 80} y={y + 26} width="160" height="90" fill="white" stroke={INK} strokeWidth="2.5" />
        <text x={cx} y={y + 18} direction="ltr">{a} ס״מ</text>
        <text x={cx + 108} y={y + 78} direction="ltr">{b}</text>
        <text x={cx} y={y + 170} fontSize="20" direction="rtl">{'היקף = ______ ס״מ'}</text>
      </g>
    })}
  </SvgPage>
}

function ClockPage({ n }) {
  return <SvgPage label="השעון">
    <Head n={n} title="מה השעה?" instruction="כותבים את השעה בכל שעון, למשל 4:35" />
    {CLOCKS.map(([h, m], i) => {
      const col = i % 2, y = 140 + Math.floor(i / 2) * 225, cx = col ? 150 : 450
      return <g key={i} fontFamily={FONT}>
        <Clock cx={cx} cy={y + 85} h={h} m={m} />
        <text x={cx} y={y + 198} fontSize="24" textAnchor="middle" direction="ltr">____ : ____</text>
      </g>
    })}
  </SvgPage>
}

function WordProblemsPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>📖 בעיות מילוליות</h2>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · כותבים תרגיל ותשובה</p>
    <ol style={{ fontSize: '13pt', lineHeight: 1.55, padding: '0 10mm 0 4mm', margin: '2mm 0 0' }}>
      {WORD_PROBLEMS.map(p => <li key={p.q} style={{ marginBottom: '7mm' }}>{p.q}<br />תרגיל: ______________ &nbsp; תשובה: ______________</li>)}
    </ol>
  </A4>
}

function Key({ n }) {
  const list = items => items.map(it => String(it.ans))
  const sections = [
    ['עמוד 2 — לוח הכפל של 2 עד 5', list(TABLE_A)], ['עמוד 3 — לוח הכפל של 6 עד 10', list(TABLE_B)], ['עמוד 4 — משלימים בכפל', list(MISSING)],
    ['עמוד 5 — חילוק', list(DIVIDE)], ['עמוד 6 — חיבור עד 1000', list(ADD)], ['עמוד 7 — חיסור עד 1000', list(SUB)],
    ['עמוד 8 — מאות, עשרות ויחידות', PLACE.map(([h, t, o]) => String(h * 100 + t * 10 + o))],
    ['עמוד 9 — גדול, קטן או שווה', COMPARE.map(([a, b]) => `${a} ${symbol(a, b)} ${b}`)],
    ['עמוד 10 — המספרים החסרים', SEQUENCES.map(s => s[3].map(k => seqValues(s)[k]).join(', '))],
    ['עמוד 11 — שברים (צבועים מתוך כולם)', FRACTIONS.map(([p, s]) => `${s} מתוך ${p}`)],
    ['עמוד 12 — היקף (ס״מ)', RECTS.map(r => String(perimeter(r)))],
    ['עמוד 13 — השעון', CLOCKS.map(([h, m]) => `${h}:${String(m).padStart(2, '0')}`)],
    ['עמוד 14 — בעיות מילוליות', WORD_PROBLEMS.map(p => p.ans)],
  ]
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות להורים</h2>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>עמוד {n} בחוברת · התרגילים ממוספרים מימין לשמאל, שורה אחר שורה</p>
    <div style={{ fontSize: '10.5pt', lineHeight: 1.5 }}>
      {sections.map(([t, a]) => <section key={t} style={{ marginBottom: 5 }}><b>{t}</b><div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px 12px', marginTop: 1 }}>{a.map((x, i) => <span key={i}>{i + 1}) <bdi dir="ltr">{x}</bdi></span>)}</div></section>)}
    </div>
  </A4>
}

export default function MathGrade3Booklet() {
  const seqLines = SEQUENCES.map(s => seqValues(s).map((v, i) => s[3].includes(i) ? '____' : String(v)).join('    '))
  const placeLines = PLACE.map(([h, t, o]) => `${h} מאות, ${t} עשרות ו־${o} יחידות = ______`)
  return <>
    <Cover emoji="✖️➗➕" title="חוברת חשבון לכיתה ג׳" subtitle="16 עמודים: לוח הכפל, חילוק, מספרים עד 1000, שברים והיקף" pages={PAGES}
      note="עמוד אחד או שניים בכל פעם מספיקים. בלוח הכפל כדאי לחזור על אותם עמודים כמה פעמים. אם תרגיל קשה, אפשר לצייר אותו, ובחילוק להיעזר בכפל: כדי לחלק 24 ב־6 בודקים איזה מספר כפול 6 נותן 24. את דף התשובות פותחים רק אחרי הפתרון." />
    <Problems n={2} title="לוח הכפל של 2 עד 5" instruction="פותרים את תרגילי הכפל" items={TABLE_A} />
    <Problems n={3} title="לוח הכפל של 6 עד 10" instruction="פותרים את תרגילי הכפל" items={TABLE_B} />
    <Problems n={4} title="משלימים בכפל" instruction="כותבים את המספר החסר" items={MISSING} />
    <Problems n={5} title="חילוק" instruction="חילוק הוא ההפך של כפל. פותרים" items={DIVIDE} />
    <Problems n={6} title="חיבור עד 1000" instruction="מחברים יחידות, אחר כך עשרות ואחר כך מאות" items={ADD} size={24} />
    <Problems n={7} title="חיסור עד 1000" instruction="פותרים את התרגילים" items={SUB} size={24} />
    <FillPage n={8} title="מאות, עשרות ויחידות" instruction="כותבים את המספר" lines={placeLines} size={26} />
    <ComparePage n={9} />
    <FillPage n={10} title="המספרים החסרים" instruction="ממשיכים את הספירה בקפיצות וכותבים את המספרים החסרים" lines={seqLines} ltr size={26} />
    <FractionsPage n={11} />
    <PerimeterPage n={12} />
    <ClockPage n={13} />
    <WordProblemsPage n={14} />
    <Key n={15} />
    <Certificate booklet="חוברת החשבון לכיתה ג׳" done="תרגלתי את לוח הכפל, חילקתי, חיברתי וחיסרתי עד 1000, זיהיתי שברים, חישבתי היקף וקראתי שעון." cheer="כל הכבוד, אלופ/ת חשבון!" />
  </>
}
