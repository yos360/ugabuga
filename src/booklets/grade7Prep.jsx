import { GRADED_READING } from '../learn/readingGrades'
import { A4, Certificate, Cover, Head, SvgPage } from './kit'
import { bookletBySlug } from './registry'

// "חוברת הכנה לכיתה ז׳" — math the way grade 7 starts it (fractions, decimals, percent, order of operations)
// and two reading passages from the site's grade 6–7 set. Every answer is computed from the data below, so
// the answer key cannot drift from the exercises. Pages are SVG (math) or HTML in A4 (reading).
const PAGES = bookletBySlug('grade-7-prep').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

const gcd = (a, b) => b ? gcd(b, a % b) : a
const reduce = ([n, d]) => { const g = gcd(n, d); return [n / g, d / g] }
const addF = ([a, b], [c, d]) => reduce([a * d + c * b, b * d])
const subF = ([a, b], [c, d]) => reduce([a * d - c * b, b * d])
const mulF = ([a, b], [c, d]) => reduce([a * c, b * d])
// 3/4 → "3/4", 5/4 → "1 1/4", 6/3 → "2"
const showF = ([n, d]) => d === 1 ? String(n) : n > d ? `${Math.floor(n / d)} ${n % d}/${d}` : `${n}/${d}`
const num = x => String(+x.toFixed(4))
const cmp = (a, b) => a > b ? '>' : a < b ? '<' : '='

const F = (n, d) => ({ f: [n, d] })
const BLANK = { blank: 54 }
const BLANK_F = { f: ['\u2007\u2007\u2007', '\u2007\u2007\u2007'] } // empty fraction: only the bar shows

// Fractions
export const SIMPLIFY = [[6, 8], [10, 15], [12, 18], [14, 21], [9, 12], [20, 30], [18, 24], [16, 40]]
export const COMPARE_F = [[[3, 4], [5, 8]], [[2, 3], [3, 5]], [[4, 6], [2, 3]], [[7, 10], [3, 4]]]
const fracValue = ([n, d]) => n / d
export const ADD_SUB = [
  [[1, 2], '+', [1, 3]], [[3, 4], '−', [1, 2]], [[2, 5], '+', [1, 10]], [[5, 6], '−', [1, 3]],
  [[1, 4], '+', [2, 3]], [[7, 8], '−', [1, 4]], [[3, 10], '+', [2, 5]], [[1, 2], '+', [3, 4]],
  [[2, 3], '+', [5, 6]], [[4, 5], '−', [1, 2]], [[1, 6], '+', [1, 4]], [[9, 10], '−', [3, 5]],
]
const addSubAns = ([a, op, b]) => op === '+' ? addF(a, b) : subF(a, b)
export const TIMES_F = [[[1, 2], [3, 4]], [[2, 3], [3, 5]], [[4, 5], [5, 8]], [[3, 4], [2, 9]], [[5, 6], [3, 10]], [[2, 7], [7, 8]]]
// A fraction of a quantity: [n, d, quantity]
export const OF_QTY = [[3, 4, 24], [2, 3, 18], [1, 5, 45], [5, 8, 40], [3, 10, 60], [7, 12, 36]]
// Decimals
export const DECIMALS = [[3.4, '+', 2.75], [8.5, '−', 3.27], [12.06, '+', 4.9], [10, '−', 6.35], [15.5, '+', 8.25], [7.2, '−', 0.56],
  [0.4, '×', 6], [2.3, '×', 10], [0.25, '×', 8], [3.6, '÷', 4], [6, '÷', 0.5], [2.4, '÷', 0.6]]
const calc = ([a, op, b]) => op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b
// Fraction, decimal, percent: [n, d, decimal, percent]; `given` says which column is filled in (0, 1 or 2).
export const CONVERT = [
  [[1, 2], '0.5', '50%', 0], [[1, 4], '0.25', '25%', 1], [[3, 4], '0.75', '75%', 2], [[1, 5], '0.2', '20%', 0], [[1, 10], '0.1', '10%', 2],
  [[3, 5], '0.6', '60%', 1], [[7, 10], '0.7', '70%', 0], [[1, 8], '0.125', '12.5%', 2], [[2, 5], '0.4', '40%', 1], [[9, 20], '0.45', '45%', 0],
]
// Percent of a quantity: [percent, quantity]
export const PERCENT = [[10, 80], [25, 120], [50, 36], [20, 65], [75, 80], [5, 200], [15, 60], [30, 90], [1, 700], [40, 250], [60, 45], [12, 50]]
// Order of operations: [expression, answer] — checked by tests/booklets-grade7.test.mjs
export const ORDER = [
  ['5 + 3 × 4', 17], ['(5 + 3) × 4', 32], ['20 − 12 ÷ 3', 16], ['18 ÷ (2 + 4)', 3], ['4 + 2² × 3', 16], ['36 ÷ 4 × 3', 27],
  ['50 − (6 + 4) × 2', 30], ['3 × (10 − 4) + 8 ÷ 2', 22], ['100 − 4 × (7 + 3)', 60], ['(24 − 4) ÷ 5 + 2 × 6', 16], ['7 + 18 ÷ 3 × 2', 19], ['2 + 3 × (8 − 2²)', 14],
]
export const WORD_PROBLEMS = [
  { q: 'דנה קנתה ¾ ק״ג תפוחים ו־½ ק״ג אגסים. כמה קילוגרמים של פירות קנתה?', ans: '¾ + ½ = 1¼ ק״ג' },
  { q: 'בכיתה של יובל 28 תלמידים. 3/7 מהם משתתפים בחוג כדורסל. כמה תלמידים בחוג?', ans: '28 ÷ 7 × 3 = 12 תלמידים' },
  { q: 'נעליים עולות 240 ₪. בחנות יש עליהן הנחה של 25%. כמה שקלים משלמים?', ans: '25% מ־240 = 60, ולכן 240 − 60 = 180 ₪' },
  { q: 'אורי רץ 2.4 ק״מ בבוקר ועוד 1.75 ק״מ אחר הצהריים. כמה ק״מ רץ ביום זה?', ans: '2.4 + 1.75 = 4.15 ק״מ' },
  { q: 'בקנקן יש 2.5 ליטר מיץ. מחלקים אותו ל־10 כוסות שוות. כמה ליטר בכל כוס?', ans: '2.5 ÷ 10 = 0.25 ליטר' },
  { q: 'במבחן היו 40 שאלות. מיכל ענתה נכון על 85% מהן. על כמה שאלות ענתה נכון?', ans: '85% מ־40 = 34 שאלות' },
]
export const PASSAGES = ['blue-notebook-mystery', 'how-rainbows-form'].map(slug => GRADED_READING.find(p => p.slug === slug))
const LETTERS = ['א', 'ב', 'ג', 'ד']

// Lay out one exercise as tokens on a single line, centred at cx: text, fractions, blanks, a circle for < > =.
const widthOf = (t, fs) => {
  if (typeof t === 'string') return t.length * fs * 0.6
  if (t.f) return Math.max(...t.f.map(s => String(s).length)) * fs * 0.62 + 10
  if (t.blank) return t.blank
  return fs * 1.5
}
function Expr({ tokens, cx, y, fs }) {
  const gap = fs * 0.4, widths = tokens.map(t => widthOf(t, fs))
  let x = cx - (widths.reduce((s, w) => s + w, 0) + gap * (tokens.length - 1)) / 2
  return <g fontFamily={FONT} fontSize={fs} fontWeight="700" textAnchor="middle" direction="ltr">
    {tokens.map((t, i) => {
      const w = widths[i], mid = x + w / 2
      x += w + gap
      if (typeof t === 'string') return <text key={i} x={mid} y={y + fs * 0.35} direction={/[א-ת]/.test(t) ? 'rtl' : 'ltr'}>{t}</text>
      if (t.f) return <g key={i}>
        <text x={mid} y={y - 5}>{t.f[0]}</text><path d={`M${x - gap - w + 2} ${y} H${x - gap - 2}`} stroke={INK} strokeWidth="2.2" /><text x={mid} y={y + fs * 0.95}>{t.f[1]}</text>
      </g>
      if (t.blank) return <path key={i} d={`M${x - gap - w} ${y + fs * 0.4} H${x - gap}`} stroke={INK} strokeWidth="1.6" />
      return <circle key={i} cx={mid} cy={y} r={fs * 0.72} fill="white" stroke={INK} strokeWidth="2.4" />
    })}
  </g>
}

// Numbered exercises in `cols` columns, the first column on the right.
function ExprPage({ n, title, instruction, items, cols = 2, fs = 26 }) {
  const rows = Math.ceil(items.length / cols), rowH = Math.min(110, 650 / rows), colW = 560 / cols
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map((tokens, i) => {
      const col = i % cols, row = Math.floor(i / cols), cx = 580 - colW * col - colW / 2, y = 150 + row * rowH + rowH / 2
      return <g key={i}>
        <text x={cx + colW / 2 - 8} y={y - rowH / 2 + 22} fontSize="13" fill="#666" textAnchor="end" fontFamily={FONT}>{i + 1}.</text>
        <Expr tokens={tokens} cx={cx} y={y} fs={fs} />
        {row < rows - 1 && <path d={`M${cx - colW / 2 + 14} ${y + rowH / 2} H${cx + colW / 2 - 14}`} stroke="#eee" />}
      </g>
    })}
  </SvgPage>
}

function ConvertPage({ n }) {
  const colX = [470, 300, 130], top = 175, rowH = 54
  return <SvgPage label="שבר, עשרוני ואחוז">
    <Head n={n} title="שבר, מספר עשרוני ואחוז" instruction="בכל שורה כתוב ערך אחד. משלימים את שני האחרים" />
    <g fontFamily={FONT} fontSize="19" fontWeight="800" textAnchor="middle">
      {['שבר', 'מספר עשרוני', 'אחוז'].map((t, i) => <text key={t} x={colX[i]} y={top - 18}>{t}</text>)}
      <path d={`M40 ${top - 6} H560`} stroke={INK} strokeWidth="2" />
    </g>
    {CONVERT.map(([fr, dec, pct, given], i) => { const y = top + i * rowH + rowH / 2; return <g key={i}>
      {[0, 1, 2].map(c => c === given
        ? (c === 0 ? <Expr key={c} tokens={[F(...fr)]} cx={colX[0]} y={y} fs={22} /> : <text key={c} x={colX[c]} y={y + 8} fontSize="23" fontWeight="700" textAnchor="middle" fontFamily={FONT}>{c === 1 ? dec : pct}</text>)
        : <path key={c} d={`M${colX[c] - 45} ${y + 12} H${colX[c] + 45}`} stroke="#9aa5b5" strokeWidth="1.5" />)}
      <path d={`M40 ${y + rowH / 2} H560`} stroke="#ddd" strokeDasharray="5 6" />
    </g> })}
  </SvgPage>
}

function WordProblemsPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>📖 בעיות מילוליות</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · כותבים תרגיל ותשובה</p>
    <ol style={{ fontSize: '14pt', lineHeight: 1.65, padding: '0 10mm 0 4mm', margin: '3mm 0 0' }}>
      {WORD_PROBLEMS.map(p => <li key={p.q} style={{ marginBottom: '11mm' }}>{p.q}<br />תרגיל: ________________ &nbsp; תשובה: ______________</li>)}
    </ol>
  </A4>
}

function PassagePage({ passage, n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>{passage.emoji} {passage.title}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>{passage.kind} · עמוד {n} בחוברת · קוראים פעם אחת בלי למהר, ואז עוברים לעמוד השאלות</p>
    <div style={{ fontSize: '11pt', lineHeight: 1.55 }}>
      {passage.text.map((t, i) => <p key={i} style={{ margin: '0 0 2.2mm' }}>{t}</p>)}
    </div>
  </A4>
}

function QuestionsPage({ passage, n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>❓ שאלות: {passage.title}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · מקיפים את התשובה הנכונה</p>
    <ol style={{ fontSize: '10.5pt', lineHeight: 1.35, padding: '0 8mm 0 0', margin: '1mm 0 0' }}>
      {passage.q.map(([q, options]) => <li key={q} style={{ marginBottom: '2.2mm' }}>
        <b>{q}</b>
        {options.map((o, j) => <div key={o} style={{ paddingRight: '5mm' }}>{LETTERS[j]}. {o}</div>)}
      </li>)}
    </ol>
    {passage.open.map(([q], i) => <div key={q} style={{ marginTop: '2mm', fontSize: '10.5pt' }}>
      <b>{passage.q.length + i + 1}. {q}</b>
      {[0, 1, 2].map(k => <div key={k} style={{ borderBottom: '1px solid #888', height: '7mm' }} />)}
    </div>)}
  </A4>
}

const KeyPage = ({ n, note, children }) => <A4 style={{ alignItems: 'stretch' }}>
  <h2>✅ דף תשובות להורים</h2>
  <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 13 }}>עמוד {n} בחוברת · {note}</p>
  <div style={{ fontSize: '11pt', lineHeight: 1.5 }}>{children}</div>
</A4>

function KeyMath({ n }) {
  const f = s => s.join('/')
  const sections = [
    ['עמוד 2 — צמצום', SIMPLIFY.map(p => showF(reduce(p)))],
    ['עמוד 2 — השוואה', COMPARE_F.map(([a, b]) => `${f(a)} ${cmp(fracValue(a), fracValue(b))} ${f(b)}`)],
    ['עמוד 3 — חיבור וחיסור שברים', ADD_SUB.map(r => showF(addSubAns(r)))],
    ['עמוד 4 — כפל שברים', TIMES_F.map(([a, b]) => showF(mulF(a, b)))],
    ['עמוד 4 — חלק מכמות', OF_QTY.map(([a, b, q]) => String(q / b * a))],
    ['עמוד 5 — מספרים עשרוניים', DECIMALS.map(r => num(calc(r)))],
    ['עמוד 6 — שבר, עשרוני, אחוז', CONVERT.map(([fr, dec, pct]) => `${f(fr)} = ${dec} = ${pct}`)],
    ['עמוד 7 — אחוזים מכמות', PERCENT.map(([p, q]) => num(p * q / 100))],
    ['עמוד 8 — סדר פעולות', ORDER.map(([, a]) => String(a))],
  ]
  return <KeyPage n={n} note="התרגילים ממוספרים מימין לשמאל, שורה אחר שורה">
    {sections.map(([t, a]) => <section key={t} style={{ marginBottom: '2.4mm' }}><b>{t}</b><div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}>{a.map((x, i) => <bdi key={i} dir="ltr">{i + 1}) {x}</bdi>)}</div></section>)}
    <section><b>עמוד 9 — בעיות מילוליות</b><ol style={{ margin: '1mm 0 0', paddingInlineStart: '6mm' }}>{WORD_PROBLEMS.map(p => <li key={p.q}>{p.ans}</li>)}</ol></section>
  </KeyPage>
}

function KeyReading({ n }) {
  return <KeyPage n={n} note="תשובות לקטעי הקריאה. בשאלות הפתוחות יש תשובה לדוגמה, ותשובות אחרות יכולות להתאים">
    {PASSAGES.map((p, i) => <section key={p.slug} style={{ marginBottom: '4mm' }}>
      <b>עמוד {11 + i * 2} — {p.title}</b>
      <div>שאלות 1–{p.q.length}: {p.q.map((q, j) => `${j + 1}) ${LETTERS[q[2]]}`).join('   ')}</div>
      {p.open.map(([q, a], j) => <p key={q} style={{ margin: '1mm 0 0' }}><b>{p.q.length + j + 1}.</b> {a}</p>)}
    </section>)}
  </KeyPage>
}

export default function Grade7PrepBooklet() {
  return <>
    <Cover emoji="🧮📖" title="חוברת הכנה לכיתה ז׳" subtitle="16 עמודים: שברים, עשרוניים, אחוזים, סדר פעולות וקריאה" pages={PAGES}
      note="החוברת חוזרת על הידע מכיתה ו׳ ומכינה לכיתה ז׳. עדיף לפתור עמוד אחד בכל פעם, בלי מחשבון, ורק אחר כך לבדוק עם דף התשובות. טעות היא סימן למה שכדאי לחזור עליו, לא כישלון." />
    <ExprPage n={2} title="צמצום והשוואת שברים" instruction="מצמצמים עד הסוף. בעיגול כותבים < או > או =" fs={25}
      items={[...SIMPLIFY.map(([a, b]) => [F(a, b), '=', BLANK_F]), ...COMPARE_F.map(([a, b]) => [F(...a), { circle: true }, F(...b)])]} />
    <ExprPage n={3} title="חיבור וחיסור שברים" instruction="מביאים למכנה משותף ומצמצמים. אם יוצא יותר משלם, כותבים מספר מעורב" fs={25}
      items={ADD_SUB.map(([a, op, b]) => [F(...a), op, F(...b), '=', BLANK])} />
    <ExprPage n={4} title="כפל שברים וחלק מכמות" instruction="מצמצמים לפני או אחרי הכפל. בחלק מכמות מחלקים במכנה וכופלים במונה" fs={25}
      items={[...TIMES_F.map(([a, b]) => [F(...a), '×', F(...b), '=', BLANK_F]), ...OF_QTY.map(([a, b, q]) => [F(a, b), 'של', String(q), '=', BLANK])]} />
    <ExprPage n={5} title="מספרים עשרוניים" instruction="תרגילים 1–6: חיבור וחיסור. תרגילים 7–12: כפל וחילוק. פותרים במחברת" fs={26}
      items={DECIMALS.map(([a, op, b]) => [String(a), op, String(b), '=', BLANK])} />
    <ConvertPage n={6} />
    <ExprPage n={7} title="אחוזים מכמות" instruction="10% הם עשירית, 50% חצי, 1% הוא מאית. מחשבים כל אחוז מהכמות" fs={25}
      items={PERCENT.map(([p, q]) => [`${p}%`, 'של', String(q), '=', BLANK])} />
    <ExprPage n={8} title="סדר פעולות החשבון" instruction="קודם סוגריים, אחר כך חזקה, אחר כך כפל וחילוק משמאל לימין, ובסוף חיבור וחיסור" cols={1} fs={26}
      items={ORDER.map(([e]) => [e, '=', BLANK])} />
    <WordProblemsPage n={9} />
    <PassagePage n={10} passage={PASSAGES[0]} />
    <QuestionsPage n={11} passage={PASSAGES[0]} />
    <PassagePage n={12} passage={PASSAGES[1]} />
    <QuestionsPage n={13} passage={PASSAGES[1]} />
    <KeyMath n={14} />
    <KeyReading n={15} />
    <Certificate booklet="חוברת ההכנה לכיתה ז׳" done="חזרתי על שברים, מספרים עשרוניים, אחוזים וסדר פעולות, וקראתי קטעים ועניתי על שאלות בשני קטעים." cheer="כל הכבוד, מוכנים לכיתה ז׳!" />
  </>
}
