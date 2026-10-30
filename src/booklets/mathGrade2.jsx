import { A4, Certificate, Cover, FillPage, Head, SvgPage } from './kit'
import { bookletBySlug } from './registry'

// "חוברת חשבון לכיתה ב׳" — add and subtract to 100, place value, comparing, number patterns, a first look
// at multiplication (2, 5, 10), the clock, coins and word problems. Every answer is computed from the data
// below, so the answer key cannot drift from the exercises.
const PAGES = bookletBySlug('math-grade-2').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

const sum = (a, b) => ({ text: `${a} + ${b} = ____`, ans: a + b })
const sub = (a, b) => ({ text: `${a} − ${b} = ____`, ans: a - b })
const times = (a, b) => ({ text: `${a} × ${b} = ____`, ans: a * b })
const toTen = (a, t) => ({ text: `${a} + ____ = ${t}`, ans: t - a })

export const ADD = [[23, 14], [31, 45], [52, 27], [40, 36], [64, 25], [15, 73], [38, 11], [56, 43], [27, 60], [82, 17], [45, 34], [71, 18]].map(p => sum(...p))
export const ADD_CARRY = [[28, 15], [37, 26], [49, 34], [56, 28], [45, 37], [19, 25], [67, 18], [38, 46], [24, 39], [55, 25]].map(p => sum(...p))
export const SUB = [[78, 35], [96, 44], [59, 23], [87, 62], [68, 41], [99, 55], [52, 27], [71, 38], [64, 29], [83, 46], [45, 18], [90, 54]].map(p => sub(...p))
export const TO_TEN = [[60, 100], [30, 100], [80, 100], [45, 50], [27, 30], [68, 70], [90, 100], [75, 100], [20, 100], [85, 90]].map(p => toTen(...p))
export const TIMES = [[2, 3], [2, 7], [2, 9], [5, 4], [5, 6], [5, 8], [10, 3], [10, 7], [10, 10], [2, 5], [5, 5], [10, 6]].map(p => times(...p))
// Tens and ones: [tens, ones].
export const PLACE = [[2, 5], [4, 3], [6, 0], [1, 8], [5, 7], [3, 9]]
// Compare two numbers: the circle gets > < or =.
export const COMPARE = [[47, 74], [58, 58], [63, 36], [90, 19], [85, 89], [100, 99], [31, 13], [70, 70], [42, 24], [66, 68]]
const symbol = (a, b) => a > b ? '>' : a < b ? '<' : '='
// Number patterns: [start, step, length, blank positions].
export const SEQUENCES = [[2, 2, 7, [3, 5]], [5, 5, 6, [2, 4]], [10, 10, 7, [3, 6]], [31, 2, 6, [2, 4]], [100, -10, 6, [2, 5]], [48, -2, 6, [1, 4]]]
const seqValues = ([start, step, len]) => Array.from({ length: len }, (_, i) => start + i * step)
// Repeated addition: [groups, size].
export const GROUPS = [[3, 5], [4, 2], [2, 10], [5, 3], [3, 4], [6, 2]]
// Clocks: [hour, minute] with minutes 0, 15, 30 or 45.
export const CLOCKS = [[3, 0], [7, 30], [12, 15], [5, 45], [9, 0], [2, 30]]
export const COINS = [[5, 2, 1], [10, 5, 5], [2, 2, 2, 1], [10, 10, 2], [5, 5, 5, 1], [10, 5, 2, 1]]
export const WORD_PROBLEMS = [
  { q: 'לדנה יש 45 מדבקות. אמא קנתה לה עוד 30 מדבקות. כמה מדבקות יש לדנה עכשיו?', ans: '45 + 30 = 75' },
  { q: 'בכיתה של יוסי יש 28 תלמידים. היום נעדרו 9 תלמידים. כמה תלמידים הגיעו?', ans: '28 − 9 = 19' },
  { q: 'נועם אסף 50 קלפים, ומאיה אספה 27 קלפים. כמה קלפים יותר אסף נועם?', ans: '50 − 27 = 23' },
  { q: 'בכל שקית יש 5 תפוחים. כמה תפוחים יש ב־4 שקיות?', ans: '4 × 5 = 20' },
  { q: 'לאיתי יש 20 שקלים. הוא קנה מחברת ב־12 שקלים. כמה שקלים נשארו לו?', ans: '20 − 12 = 8' },
  { q: 'שיעור הספורט של שירה התחיל בשעה 9:00 ונמשך שעה אחת. באיזו שעה הוא נגמר?', ans: '10:00' },
]

// Two columns of numbered exercises, the first column on the right.
function Problems({ n, title, instruction, items }) {
  const rows = Math.ceil(items.length / 2), rowH = Math.min(100, 640 / rows)
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map((it, i) => {
      const col = i % 2, y = 150 + Math.floor(i / 2) * rowH + rowH / 2, cx = col ? 150 : 440
      return <g key={i} fontFamily={FONT}>
        <text x={cx + 130} y={y + 4} fontSize="14" fill="#666" textAnchor="middle">{i + 1}.</text>
        <text x={cx} y={y + 10} fontSize="28" fontWeight="700" textAnchor="middle" direction="ltr" style={{ whiteSpace: 'pre' }}>{it.text}</text>
        <path d={`M${col ? 20 : 310} ${y + rowH / 2} H${col ? 290 : 580}`} stroke="#eee" />
      </g>
    })}
  </SvgPage>
}

function PlacePage({ n }) {
  return <SvgPage label="ערך המקום">
    <Head n={n} title="עשרות ויחידות" instruction="כל מקל הוא עשר וכל ריבוע הוא אחת. כותבים את המספר" />
    {PLACE.map(([t, o], i) => { const y = 140 + i * 110; return <g key={i} fontFamily={FONT}>
      {Array.from({ length: t }, (_, j) => <rect key={j} x={560 - j * 22} y={y + 10} width="14" height="80" fill="#cbd5e1" stroke={INK} strokeWidth="1.5" />)}
      {Array.from({ length: o }, (_, j) => <rect key={j} x={400 - (j % 3) * 24} y={y + 18 + Math.floor(j / 3) * 24} width="16" height="16" fill="#fde68a" stroke={INK} strokeWidth="1.5" />)}
      <text x={165} y={y + 60} fontSize="20" textAnchor="middle" direction="rtl">{`___ עשרות ו־___ יחידות = ______`}</text>
      {i < PLACE.length - 1 && <path d={`M30 ${y + 104} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function ComparePage({ n }) {
  return <SvgPage label="גדול או קטן">
    <Head n={n} title="גדול, קטן או שווה?" instruction="כותבים בעיגול: <  או  >  או  =" />
    {COMPARE.map(([a, b], i) => {
      const col = i % 2, y = 170 + Math.floor(i / 2) * 120, cx = col ? 150 : 440
      return <g key={i} fontFamily={FONT} fontSize="38" fontWeight="700" textAnchor="middle">
        <text x={cx - 70} y={y + 13}>{a}</text><circle cx={cx} cy={y} r="26" fill="white" stroke={INK} strokeWidth="2.5" /><text x={cx + 70} y={y + 13}>{b}</text>
      </g>
    })}
  </SvgPage>
}

function Clock({ cx, cy, h, m }) {
  const r = 72, pt = (deg, len) => [cx + len * Math.sin(deg * Math.PI / 180), cy - len * Math.cos(deg * Math.PI / 180)]
  const [hx, hy] = pt((h % 12) * 30 + m * 0.5, r * 0.5), [mx, my] = pt(m * 6, r * 0.78)
  return <g fontFamily={FONT} textAnchor="middle">
    <circle cx={cx} cy={cy} r={r} fill="white" stroke={INK} strokeWidth="3" />
    {Array.from({ length: 12 }, (_, i) => { const [x, y] = pt((i + 1) * 30, r * 0.82); return <text key={i} x={x} y={y + 5} fontSize="15" fontWeight="700">{i + 1}</text> })}
    <path d={`M${cx} ${cy} L${hx} ${hy}`} stroke={INK} strokeWidth="6" strokeLinecap="round" />
    <path d={`M${cx} ${cy} L${mx} ${my}`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <circle cx={cx} cy={cy} r="5" fill={INK} />
  </g>
}

function ClockPage({ n }) {
  return <SvgPage label="השעון">
    <Head n={n} title="מה השעה?" instruction="כותבים את השעה בכל שעון, למשל 4:30" />
    {CLOCKS.map(([h, m], i) => {
      const col = i % 2, y = 140 + Math.floor(i / 2) * 225, cx = col ? 150 : 450
      return <g key={i} fontFamily={FONT}>
        <Clock cx={cx} cy={y + 85} h={h} m={m} />
        <text x={cx} y={y + 198} fontSize="24" textAnchor="middle" direction="ltr">____ : ____</text>
      </g>
    })}
  </SvgPage>
}

function CoinsPage({ n }) {
  const R = { 1: 22, 2: 26, 5: 29, 10: 29 }
  return <SvgPage label="כסף">
    <Head n={n} title="כמה כסף יש?" instruction="מחברים את המטבעות וכותבים כמה שקלים יש" />
    {COINS.map((row, i) => { const y = 170 + i * 105; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {row.map((v, j) => <g key={j}>
        <circle cx={520 - j * 72} cy={y} r={R[v]} fill={v === 10 ? '#e5e7eb' : '#fff'} stroke={INK} strokeWidth="2.5" />
        {(v === 10 || v === 2) && <circle cx={520 - j * 72} cy={y} r={R[v] - 6} fill="none" stroke={INK} strokeWidth="1.2" />}
        <text x={520 - j * 72} y={y + 7} fontSize="19" fontWeight="800" direction="ltr">{v}</text>
      </g>)}
      <text x={90} y={y + 9} fontSize="24" direction="ltr">= ______ ₪</text>
      {i < COINS.length - 1 && <path d={`M30 ${y + 52} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function WordProblemsPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>📖 בעיות מילוליות</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · כותבים תרגיל ותשובה</p>
    <ol style={{ fontSize: '15pt', lineHeight: 1.7, padding: '0 10mm 0 4mm', margin: '4mm 0 0' }}>
      {WORD_PROBLEMS.map(p => <li key={p.q} style={{ marginBottom: '13mm' }}>{p.q}<br />תרגיל: ______________ &nbsp; תשובה: ______________</li>)}
    </ol>
  </A4>
}

function Key({ n }) {
  const list = items => items.map(it => String(it.ans))
  const sections = [
    ['עמוד 2 — חיבור', list(ADD)], ['עמוד 3 — חיבור עם המרה', list(ADD_CARRY)], ['עמוד 4 — חיסור', list(SUB)],
    ['עמוד 5 — עשרות ויחידות', PLACE.map(([t, o]) => String(t * 10 + o))],
    ['עמוד 6 — גדול, קטן או שווה', COMPARE.map(([a, b]) => `${a} ${symbol(a, b)} ${b}`)],
    ['עמוד 7 — המספרים החסרים', SEQUENCES.map(s => s[3].map(k => seqValues(s)[k]).join(', '))],
    ['עמוד 8 — משלימים', list(TO_TEN)],
    ['עמוד 9 — חיבור חוזר וכפל', GROUPS.map(([g, s]) => String(g * s))],
    ['עמוד 10 — כפל', list(TIMES)],
    ['עמוד 11 — השעון', CLOCKS.map(([h, m]) => `${h}:${String(m).padStart(2, '0')}`)],
    ['עמוד 12 — כסף', COINS.map(c => `${c.reduce((a, v) => a + v, 0)} ₪`)],
    ['עמוד 13 — בעיות מילוליות', WORD_PROBLEMS.map(p => p.ans)],
  ]
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות להורים</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>עמוד {n} בחוברת · התרגילים ממוספרים מימין לשמאל, שורה אחר שורה</p>
    <div style={{ fontSize: '11.5pt', lineHeight: 1.6 }}>
      {sections.map(([t, a]) => <section key={t} style={{ marginBottom: 8 }}><b>{t}</b><div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginTop: 2 }}>{a.map((x, i) => <span key={i}>{i + 1}) <bdi dir="ltr">{x}</bdi></span>)}</div></section>)}
    </div>
  </A4>
}

export default function MathGrade2Booklet() {
  const seqLines = SEQUENCES.map(s => seqValues(s).map((v, i) => s[3].includes(i) ? '____' : String(v)).join('    '))
  const groupLines = GROUPS.map(([g, s]) => `${Array(g).fill(s).join(' + ')} = ____    ${g} × ${s} = ____`)
  return <>
    <Cover emoji="➕➖✖️" title="חוברת חשבון לכיתה ב׳" subtitle="15 עמודים: חיבור וחיסור עד 100, כפל ראשון, שעון וכסף" pages={PAGES}
      note="עמוד אחד או שניים בכל פעם מספיקים. עדיף שהילד יחשב לבד ואחר כך יבדוק עם דף התשובות. אם תרגיל קשה, אפשר לצייר אותו או לחשב בעזרת קוביות ומטבעות." />
    <Problems n={2} title="חיבור עד 100" instruction="פותרים את התרגילים" items={ADD} />
    <Problems n={3} title="חיבור עם המרה" instruction="האחדות מצטרפות לעשרת חדשה. פותרים" items={ADD_CARRY} />
    <Problems n={4} title="חיסור עד 100" instruction="פותרים את התרגילים" items={SUB} />
    <PlacePage n={5} />
    <ComparePage n={6} />
    <FillPage n={7} title="המספרים החסרים" instruction="ממשיכים את הסדרה וכותבים את המספרים החסרים" lines={seqLines} ltr size={26} />
    <Problems n={8} title="משלימים" instruction="כותבים כמה חסר כדי להגיע למספר" items={TO_TEN} />
    <FillPage n={9} title="חיבור חוזר וכפל" instruction="3 קבוצות של 5 הן 5 + 5 + 5, וגם 3 × 5. פותרים" lines={groupLines} ltr size={24} />
    <Problems n={10} title="לוח הכפל של 2, 5 ו־10" instruction="פותרים את תרגילי הכפל" items={TIMES} />
    <ClockPage n={11} />
    <CoinsPage n={12} />
    <WordProblemsPage n={13} />
    <Key n={14} />
    <Certificate booklet="חוברת החשבון לכיתה ב׳" done="חיברתי וחסרתי עד 100, השוויתי מספרים, התחלתי לכפול, קראתי שעון וספרתי כסף." cheer="כל הכבוד, אלופ/ת חשבון!" />
  </>
}
