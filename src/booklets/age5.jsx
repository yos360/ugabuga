import { createActivity } from '../motor/generators'
import { readyMaze } from '../pages/printables/mazeData'
import { coloringSrc } from '../data/coloringSubjects'
import { AnswerKey, Certificate, Cover, FillPage, Head, ImagePage, MatchPage, MotorPage, SvgPage, TracePage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת עבודה לגיל 5" — a step up from the age-4 booklet: letters and numbers to trace, counting to 10,
// first letters of words, more / less, missing numbers, adding with pictures up to 6, shapes, spot the
// difference, a pattern, a maze and a coloring page. Answers are computed from the data below.
const PAGES = bookletBySlug('age-5').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

const LETTER_ROWS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י']
const NUMBER_ROWS = Array.from({ length: 10 }, (_, i) => String(i + 1))
const COUNT = [['🍎', 6], ['⭐', 9], ['🐟', 7], ['🎈', 8], ['🌸', 10], ['🚗', 5]]
// Letter and a picture whose name starts with it: אריה, בננה, גזר, חתול, ירח, לימון, סוס, שמש.
const LETTERS = [['א', '🦁', 'אריה'], ['ב', '🍌', 'בננה'], ['ג', '🥕', 'גזר'], ['ח', '🐱', 'חתול'], ['י', '🌙', 'ירח'], ['ל', '🍋', 'לימון'], ['ס', '🐴', 'סוס'], ['ש', '☀️', 'שמש']]
// More / less: [emoji, right box, left box, asked for "more" or "less"].
export const COMPARE = [['🍎', 7, 4, 'more'], ['⭐', 5, 8, 'more'], ['🐟', 9, 6, 'more'], ['🎈', 3, 6, 'less'], ['🌸', 8, 5, 'less'], ['🚗', 4, 7, 'less']]
// Number lines 1–10 with blanks: [first, length, blank positions].
export const SEQUENCES = [[1, 6, [2, 4]], [3, 6, [1, 4]], [5, 6, [2, 5]], [2, 7, [3, 5]], [4, 6, [0, 3]], [6, 5, [2, 3]]]
const seqValues = ([first, len]) => Array.from({ length: len }, (_, i) => first + i)
// Adding with pictures: [emoji, a, b]; every sum is at most 6.
export const ADD = [['🍎', 2, 1], ['⭐', 1, 3], ['🐟', 3, 2], ['🎈', 2, 2], ['🌸', 4, 1], ['🚗', 3, 3]]
const SHAPES = [['circle', 'עיגול'], ['square', 'ריבוע'], ['triangle', 'משולש'], ['rectangle', 'מלבן'], ['star', 'כוכב'], ['heart', 'לב']]
// One picture is different: [same, different, position from the right 1–4].
export const ODD = [['🐶', '🐱', 2], ['🍎', '🍌', 4], ['⭐', '🌙', 1], ['🚗', '🚌', 3], ['🌸', '🌳', 2], ['🐟', '🐢', 4]]
const PLACE = { 1: 'הראשון מימין', 2: 'השני מימין', 3: 'השלישי מימין', 4: 'הרביעי מימין' }
const SHAPE_HE = { circle: 'עיגול', square: 'ריבוע', triangle: 'משולש', star: 'כוכב', heart: 'לב', diamond: 'מעוין' }

function CountPage({ n, seed }) {
  const r = rngFor(seed, n)
  return <SvgPage label="סופרים עד 10">
    <Head n={n} title="סופרים עד 10" instruction="כמה יש בכל ריבוע? מקיפים את המספר הנכון" />
    {COUNT.map(([e, k], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 40 : 310, y = 135 + row * 225
      const wrong = [k - 1, k + 1, k - 2, k + 2].filter(v => v >= 1 && v <= 10)
      const opts = r.shuffle([k, wrong[0], wrong[1]])
      return <g key={i} fontFamily={FONT}>
        <rect x={x} y={y} width="250" height="205" rx="16" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 215 - (j % 5) * 46} y={y + 62 + Math.floor(j / 5) * 56} fontSize="36" textAnchor="middle">{e}</text>)}
        {opts.map((o, j) => <text key={j} x={x + 200 - j * 75} y={y + 190} fontSize="34" fontWeight="800" textAnchor="middle">{o}</text>)}
      </g>
    })}
  </SvgPage>
}

function ComparePage({ n }) {
  return <SvgPage label="יותר או פחות">
    <Head n={n} title="יותר או פחות?" instruction="מקיפים את הריבוע לפי מה שכתוב בצד" />
    {COMPARE.map(([e, a, b, ask], i) => { const y = 135 + i * 112; return <g key={i} fontFamily={FONT}>
      <text x={574} y={y + 56} fontSize="17" fontWeight="800" textAnchor="middle" direction="rtl">{ask === 'more' ? 'יותר' : 'פחות'}</text>
      {[[a, 335], [b, 100]].map(([k, x]) => <g key={x}>
        <rect x={x} y={y} width="215" height="96" rx="14" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 185 - (j % 5) * 40} y={y + 38 + Math.floor(j / 5) * 42} fontSize="28" textAnchor="middle">{e}</text>)}
      </g>)}
    </g> })}
  </SvgPage>
}

function AddPage({ n }) {
  return <SvgPage label="מחברים בתמונות">
    <Head n={n} title="מחברים בתמונות" instruction="סופרים את כל התמונות וכותבים את המספר" />
    {ADD.map(([e, a, b], i) => { const y = 160 + i * 106; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {Array.from({ length: a }, (_, j) => <text key={j} x={560 - j * 42} y={y + 12} fontSize="34">{e}</text>)}
      <text x={560 - a * 42 - 6} y={y + 12} fontSize="34" fontWeight="800">+</text>
      {Array.from({ length: b }, (_, j) => <text key={j} x={560 - a * 42 - 52 - j * 42} y={y + 12} fontSize="34">{e}</text>)}
      <text x={80} y={y + 14} fontSize="32" fontWeight="800" direction="ltr">= ____</text>
      {i < ADD.length - 1 && <path d={`M30 ${y + 48} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function OddPage({ n }) {
  return <SvgPage label="מה שונה?">
    <Head n={n} title="מה שונה?" instruction="בכל שורה יש תמונה אחת שונה — מקיפים אותה" />
    {ODD.map(([same, odd, at], i) => { const y = 190 + i * 106; return <g key={i}>
      {[1, 2, 3, 4].map(j => <text key={j} x={510 - (j - 1) * 130} y={y} fontSize="58" textAnchor="middle">{j === at ? odd : same}</text>)}
      {i < ODD.length - 1 && <path d={`M30 ${y + 38} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

export default function Age5Booklet({ seed }) {
  const tracing = createActivity({ type: 'tracing', age: '4-5', difficulty: 'easy', theme: 'nature', seed: 6401 })
  const pattern = createActivity({ type: 'pattern', age: '4-5', difficulty: 'medium', theme: 'shapes', seed: 6402 })
  const maze = readyMaze(1, 2)
  const seqLines = SEQUENCES.map(s => seqValues(s).map((v, i) => s[2].includes(i) ? '___' : String(v)).join('     '))
  return <>
    <Cover emoji="✏️🔢🌟" title="חוברת עבודה לגיל 5" subtitle="16 עמודים: אותיות, מספרים עד 10, חיבור בתמונות, צורות, מבוך וצביעה" pages={PAGES}
      note="עמוד אחד ביום מספיק. כדאי לשבת ליד הילד, להקריא את ההוראה ולתת לו לנסות לבד. אם עמוד קשה מדי, מדלגים וחוזרים אליו כעבור כמה ימים. את דף התשובות פותחים רק אחרי שהילד סיים." />
    <TracePage n={2} title="אותיות א–י" instruction="עוברים בעיפרון על האותיות המקווקוות, מימין לשמאל" rows={LETTER_ROWS} />
    <TracePage n={3} title="מספרים 1–10" instruction="עוברים בעיפרון על המספרים המקווקווים" rows={NUMBER_ROWS} />
    <CountPage n={4} seed={seed} />
    <MatchPage n={5} seed={seed} title="באיזו אות מתחיל השם?" instruction="מותחים קו מכל אות לתמונה ששמה מתחיל בה" pairs={LETTERS.map(([l, e]) => [{ text: l }, { emoji: e }])} />
    <ComparePage n={6} />
    <FillPage n={7} title="המספרים החסרים" instruction="כותבים את המספרים החסרים בכל שורה" lines={seqLines} ltr size={34} />
    <AddPage n={8} />
    <MatchPage n={9} seed={seed} title="צורות" instruction="מותחים קו מכל צורה לשם שלה" pairs={SHAPES.map(([k, he]) => [{ shape: k }, { text: he }])} />
    <OddPage n={10} />
    <MotorPage n={11} activity={tracing} />
    <MotorPage n={12} activity={pattern} />
    <MotorPage n={13} activity={maze} />
    <ImagePage n={14} title="🖍️ דף צביעה — דינוזאור" instruction="צובעים לאט, בתוך הקווים" src={coloringSrc('dinosaur', 1)} alt="דף צביעה: דינוזאור" />
    <AnswerKey n={15} sections={[
      { title: 'עמוד 4 — סופרים עד 10', answers: COUNT.map(([e, k]) => `${k} ${e}`) },
      { title: 'עמוד 5 — אות ותמונה', answers: LETTERS.map(([l, e, w]) => `${l} — ${e} ${w}`) },
      { title: 'עמוד 6 — יותר או פחות', answers: COMPARE.map(([e, a, b, ask]) => `${e} — ${ask === 'more' ? 'יותר' : 'פחות'}: ${ask === 'more' ? Math.max(a, b) : Math.min(a, b)}, הריבוע ${(ask === 'more' ? a > b : a < b) ? 'הימני' : 'השמאלי'}`) },
      { title: 'עמוד 7 — המספרים החסרים', answers: SEQUENCES.map(s => s[2].map(k => seqValues(s)[k]).join(', ')) },
      { title: 'עמוד 8 — מחברים בתמונות', answers: ADD.map(([, a, b]) => `${a} + ${b} = ${a + b}`) },
      { title: 'עמוד 9 — צורות', answers: SHAPES.map(([, he]) => he) },
      { title: 'עמוד 10 — מה שונה', answers: ODD.map(([, odd, at]) => `${odd} — ${PLACE[at]}`) },
      { title: 'עמוד 12 — הדפוס (מימין לשמאל)', answers: pattern.rows.map((r, i) => `שורה ${i + 1}: ${r.cells.filter(c => c.blank).map(c => SHAPE_HE[c.item] || c.item).join(', ')}`) },
    ]} />
    <Certificate booklet="חוברת העבודה לגיל 5" done="כתבתי אותיות ומספרים, ספרתי עד 10, חיברתי בתמונות, מצאתי מה שונה ופתרתי מבוך." cheer="כל הכבוד, כמעט בגן חובה!" />
  </>
}
