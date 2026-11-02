import { AnswerKey, Certificate, Cover, Head, ImagePage, SvgPage, rngFor } from './kit'
import { coloringSrc } from '../data/coloringSubjects'
import { bookletBySlug } from './registry'
import { Cells, FONT, INK, Problems } from './mathKit'

// "חוברת חשבון ראשונה לגיל 4–5" — counting to 10, number and quantity, what comes next, adding and taking away
// with pictures inside 10, completing to 5 and 10, more or fewer, and a page of the very first written
// exercises. Every answer is computed from the data below, so the key cannot drift from the pages.
const PAGES = bookletBySlug('first-math-age-4').pages

// [emoji, how many] — circle the right number.
export const COUNT5 = [['🍎', 3], ['⭐', 5], ['🐟', 2], ['🎈', 4], ['🌸', 1], ['🚗', 4]]
// [emoji, how many] — write the number (6–10).
export const COUNT10 = [['🍪', 6], ['🐞', 8], ['🍓', 7], ['🐥', 9], ['🦋', 10], ['🎈', 6], ['🌟', 8], ['🍊', 7]]
// Number ↔ quantity, 1–5: [number, emoji]. The groups are shuffled on the page.
export const MATCH = [[3, '🍎'], [5, '⭐'], [1, '🎈'], [4, '🐟'], [2, '🌸']]
// Number trains of six: [first number, positions (0–5) left blank].
export const TRAINS = [[1, [3]], [2, [1, 4]], [4, [2]], [3, [0, 3]], [5, [4]], [6, [1, 3]]]
// Adding with pictures inside 5 and inside 10: [emoji, a, b].
export const PICS5 = [['🍎', 1, 1], ['⭐', 2, 1], ['🐟', 2, 2], ['🎈', 3, 1], ['🌸', 1, 4], ['🚗', 3, 2]]
export const PICS10 = [['🍪', 4, 3], ['🐞', 5, 2], ['🦋', 3, 5], ['🍓', 6, 2], ['🐥', 5, 4]]
// Completing: [cells in the frame (5 or 10), filled].
export const COMPLETE = [[5, 3], [5, 1], [5, 4], [5, 2], [10, 7], [10, 8]]
// Taking away with pictures: [emoji, total, crossed out].
export const TAKE = [['🍎', 5, 2], ['🎈', 4, 1], ['🐟', 6, 3], ['🍪', 7, 2], ['⭐', 5, 4]]
// More or fewer: [emoji, right box, left box, 'more' | 'less'].
export const MORE_LESS = [['🍎', 7, 4, 'more'], ['⭐', 3, 6, 'more'], ['🐟', 9, 5, 'less'], ['🎈', 2, 8, 'less'], ['🌸', 6, 10, 'more']]
const op = (a, b, sign) => ({ text: `${a} ${sign} ${b} = ____`, ans: sign === '+' ? a + b : a - b })
export const FIRST = [[1, 1, '+'], [2, 1, '+'], [2, 2, '+'], [3, 1, '+'], [1, 4, '+'], [3, 2, '+'], [4, 1, '−'], [5, 2, '−'], [3, 1, '−'], [5, 3, '−'], [4, 2, '−'], [5, 1, '−']].map(p => op(...p))
const options = (r, k, max) => {
  const pool = [k - 1, k + 1, k - 2, k + 2].filter(v => v >= 1 && v <= max)
  return r.shuffle([k, ...r.shuffle(pool).slice(0, 2)])
}
const side = (a, b, ask) => (a > b) === (ask === 'more') ? 'הריבוע הימני' : 'הריבוע השמאלי'

function CountPage({ n, seed }) {
  const r = rngFor(seed, n)
  return <SvgPage label="סופרים עד 5">
    <Head n={n} title="סופרים עד 5" instruction="כמה יש בכל ריבוע? מקיפים את המספר הנכון" />
    {COUNT5.map(([e, k], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 40 : 310, y = 135 + row * 225
      return <g key={i} fontFamily={FONT}>
        <rect x={x} y={y} width="250" height="205" rx="16" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 195 - (j % 3) * 70} y={y + 62 + Math.floor(j / 3) * 62} fontSize="48" textAnchor="middle">{e}</text>)}
        {options(r, k, 5).map((o, j) => <text key={j} x={x + 200 - j * 75} y={y + 190} fontSize="38" fontWeight="800" textAnchor="middle">{o}</text>)}
      </g>
    })}
  </SvgPage>
}

function Count10Page({ n }) {
  return <SvgPage label="סופרים עד 10">
    <Head n={n} title="סופרים עד 10" instruction="סופרים ומקיפים כל תמונה כשסופרים אותה. כותבים כמה יש" />
    {COUNT10.map(([e, k], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 40 : 310, y = 130 + row * 172
      return <g key={i} fontFamily={FONT}>
        <rect x={x} y={y} width="250" height="155" rx="14" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 215 - (j % 5) * 44} y={y + 44 + Math.floor(j / 5) * 44} fontSize="34" textAnchor="middle">{e}</text>)}
        <text x={x + 125} y={y + 142} fontSize="26" fontWeight="700" textAnchor="middle">יש ____</text>
      </g>
    })}
  </SvgPage>
}

export const matchOrder = seed => rngFor(seed, 4).shuffle(MATCH.map((_, i) => i))
function MatchPage({ n, seed }) {
  const order = matchOrder(seed)
  return <SvgPage label="מספר וכמות">
    <Head n={n} title="מספר וכמות" instruction="מותחים קו מכל מספר לקבוצה שיש בה אותה כמות" />
    {MATCH.map(([k], i) => { const y = 190 + i * 130; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <circle cx="520" cy={y} r="42" fill="white" stroke={INK} strokeWidth="2.5" />
      <text x="520" y={y + 24} fontSize="70" fontWeight="800">{k}</text>
      <circle cx="400" cy={y} r="7" fill={INK} />
      <circle cx="200" cy={y} r="7" fill={INK} />
      {(() => { const [c, e] = MATCH[order[i]]; return <g>{Array.from({ length: c }, (_, j) => <text key={j} x={140 - (j % 3) * 46} y={y - 8 + Math.floor(j / 3) * 44} fontSize="38">{e}</text>)}</g> })()}
    </g> })}
  </SvgPage>
}

function TrainPage({ n }) {
  return <SvgPage label="מה בא אחרי">
    <Head n={n} title="מה בא אחרי?" instruction="משלימים את המספרים שחסרים בכל רכבת" />
    {TRAINS.map(([s, blanks], i) => { const y = 150 + i * 105; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {Array.from({ length: 6 }, (_, j) => <g key={j}>
        <rect x={40 + j * 90} y={y} width="80" height="80" rx="12" fill="white" stroke={INK} strokeWidth="2.5" />
        {!blanks.includes(j) && <text x={80 + j * 90} y={y + 56} fontSize="44" fontWeight="800" direction="ltr">{s + j}</text>}
      </g>)}
    </g> })}
  </SvgPage>
}

function PicSum({ n, title, instruction, list, size, perRow }) {
  const rowH = Math.min(135, 650 / list.length)
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {list.map(([e, a, b], i) => { const y = 135 + i * rowH; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {Array.from({ length: a }, (_, k) => <text key={k} x={60 + (k % perRow) * (size + 4) + size / 2} y={y + size * 0.85 + Math.floor(k / perRow) * (size + 2)} fontSize={size}>{e}</text>)}
      <text x="300" y={y + size * 0.9} fontSize="34" fontWeight="800">+</text>
      {Array.from({ length: b }, (_, k) => <text key={k} x={340 + (k % perRow) * (size + 4) + size / 2} y={y + size * 0.85 + Math.floor(k / perRow) * (size + 2)} fontSize={size}>{e}</text>)}
      <text x="300" y={y + rowH - 22} fontSize="28" fontWeight="700" direction="ltr">{`${a} + ${b} = ____`}</text>
      {i < list.length - 1 && <path d={`M30 ${y + rowH - 6} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function CompletePage({ n }) {
  return <SvgPage label="משלימים">
    <Head n={n} title="כמה חסר?" instruction="מציירים נקודות עד שהמסגרת מלאה וכותבים כמה הוספנו" />
    {COMPLETE.map(([total, k], i) => { const y = 140 + i * 112; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <Cells x={total === 5 ? 330 : 380} y={y + (total === 5 ? 20 : 0)} total={total} filled={k} cell={total === 5 ? 44 : 32} />
      <text x="120" y={y + 48} fontSize="28" fontWeight="700" direction="ltr">{`${k} + ____ = ${total}`}</text>
      {i < COMPLETE.length - 1 && <path d={`M30 ${y + 100} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function TakePage({ n }) {
  return <SvgPage label="מוחקים ומחסרים">
    <Head n={n} title="מוחקים ומחסרים" instruction="מוחקים בקו (X) כמה שכתוב, וסופרים כמה נשארו" />
    {TAKE.map(([e, t, c], i) => { const y = 135 + i * 130; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {Array.from({ length: t }, (_, k) => <g key={k}>
        <text x={520 - k * 52} y={y + 40} fontSize="42">{e}</text>
      </g>)}
      <text x="300" y={y + 76} fontSize="16" fill="#444">{`מוחקים ${c}`}</text>
      <text x="300" y={y + 108} fontSize="28" fontWeight="700" direction="ltr">{`${t} − ${c} = ____`}</text>
      {i < TAKE.length - 1 && <path d={`M30 ${y + 120} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function MoreLessPage({ n }) {
  return <SvgPage label="יותר או פחות">
    <Head n={n} title="יותר או פחות?" instruction="קוראים מה כתוב ליד כל שורה ומקיפים את הריבוע הנכון" />
    {MORE_LESS.map(([e, a, b, ask], i) => { const y = 170 + i * 130; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <text x="300" y={y - 12} fontSize="20" fontWeight="800">{ask === 'more' ? 'איפה יש יותר?' : 'איפה יש פחות?'}</text>
      {[[a, 310], [b, 40]].map(([k, x]) => <g key={x}>
        <rect x={x} y={y} width="250" height="90" rx="12" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 232 - (j % 5) * 46 + 0} y={y + 38 + Math.floor(j / 5) * 40} fontSize="30">{e}</text>)}
      </g>)}
    </g> })}
  </SvgPage>
}

export default function FirstMathAge4Booklet({ seed = 1 }) {
  const order = matchOrder(seed)
  return <>
    <Cover emoji="🔢➕🍎" title="חוברת חשבון ראשונה לגיל 4–5" subtitle="14 עמודים: ספירה עד 10, מספר וכמות, חיבור וחיסור עם תמונות" pages={PAGES}
      note="ילדים בני 4 שאוהבים תרגילים נהנים כשהם מרגישים שהם 'פותרים' — לכן כל תרגיל כאן מלווה בתמונות לספירה. עמוד אחד או שניים בכל פעם מספיקים. סופרים יחד עם האצבע, ורק אחר כך כותבים. אם כתיבת ספרות קשה, הילד יכול להצביע, וההורה כותב." />
    <CountPage n={2} seed={seed} />
    <Count10Page n={3} />
    <MatchPage n={4} seed={seed} />
    <TrainPage n={5} />
    <PicSum n={6} title="מחברים עם תמונות" instruction="סופרים כל קבוצה ומחברים. כותבים את התוצאה" list={PICS5} size={34} perRow={4} />
    <PicSum n={7} title="מחברים עד 10" instruction="סופרים כל קבוצה, מחברים וכותבים את התוצאה" list={PICS10} size={28} perRow={3} />
    <CompletePage n={8} />
    <TakePage n={9} />
    <MoreLessPage n={10} />
    <Problems n={11} title="התרגילים הראשונים שלי" instruction="פותרים. אפשר לספור באצבעות" items={FIRST} />
    <ImagePage n={12} title="🖍️ דף צביעה — דינוזאור" instruction="צובעים לאט, בכל צבע שרוצים" src={coloringSrc('dinosaur', 1)} alt="דף צביעה: דינוזאור" />
    <AnswerKey n={13} sections={[
      { title: 'עמוד 2 — סופרים עד 5 (שורה אחר שורה)', answers: COUNT5.map(([, k]) => String(k)) },
      { title: 'עמוד 3 — סופרים עד 10', answers: COUNT10.map(([, k]) => String(k)) },
      { title: 'עמוד 4 — מספר וכמות (המספרים מלמעלה למטה)', answers: MATCH.map(([k], i) => `${k} — הקבוצה ה${['ראשונה', 'שנייה', 'שלישית', 'רביעית', 'חמישית'][order.indexOf(i)]} מלמעלה`) },
      { title: 'עמוד 5 — מה בא אחרי (המספרים החסרים בכל שורה)', answers: TRAINS.map(([s, b]) => b.map(j => s + j).join(', ')) },
      { title: 'עמוד 6 — מחברים עם תמונות', answers: PICS5.map(([, a, b]) => `${a} + ${b} = ${a + b}`) },
      { title: 'עמוד 7 — מחברים עד 10', answers: PICS10.map(([, a, b]) => `${a} + ${b} = ${a + b}`) },
      { title: 'עמוד 8 — כמה חסר', answers: COMPLETE.map(([t, k]) => `${k} + ${t - k} = ${t}`) },
      { title: 'עמוד 9 — מוחקים ומחסרים', answers: TAKE.map(([, t, c]) => `${t} − ${c} = ${t - c}`) },
      { title: 'עמוד 10 — יותר או פחות', answers: MORE_LESS.map(([, a, b, ask]) => side(a, b, ask)) },
      { title: 'עמוד 11 — התרגילים הראשונים', answers: FIRST.map(it => String(it.ans)) },
    ]} />
    <Certificate booklet="חוברת החשבון הראשונה שלי" done="ספרתי עד 10, חיברתי וחיסרתי עם תמונות ופתרתי את התרגילים הראשונים." cheer="כל הכבוד, מתמטיקאי/ת קטן/ה!" />
  </>
}
