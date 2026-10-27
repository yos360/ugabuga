import { createActivity } from '../motor/generators'
import { readyMaze } from '../pages/printables/mazeData'
import { coloringSrc } from '../data/coloringSubjects'
import { Certificate, Cover, Head, ImagePage, MatchPage, MotorPage, Shape, SvgPage, TracePage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת עבודה לגן חובה" — a year-before-first-grade booklet: letters and numbers to trace, counting,
// first sounds, shapes, spot the difference, fine motor (lines, pattern, maze) and a coloring page.
const PAGES = bookletBySlug('kindergarten').pages
const FONT = 'Heebo, Arial, sans-serif'

const COUNT = [['🍎', 3], ['⭐', 5], ['🐟', 2], ['🎈', 6], ['🌸', 4], ['🚗', 7]]
const LETTERS = [['א', '🦁'], ['ב', '🍌'], ['ג', '🥕'], ['ד', '🐟'], ['כ', '⚽'], ['מ', '✈️'], ['ס', '🐴'], ['ת', '🍎']]
const ODD = [['🐶', '🐱'], ['🍎', '🍌'], ['⭐', '🌙'], ['🚗', '🚌'], ['🌸', '🌳'], ['🐟', '🐢']]
const SHAPES = [['circle', 'עיגול'], ['square', 'ריבוע'], ['triangle', 'משולש'], ['rectangle', 'מלבן'], ['star', 'כוכב'], ['heart', 'לב']]
const COLOR_N = [2, 4, 1, 5, 3, 6]

function CountPage({ n, seed }) {
  const r = rngFor(seed, n)
  return <SvgPage label="סופרים ומקיפים">
    <Head n={n} title="סופרים ומקיפים" instruction="כמה יש בכל ריבוע? מקיפים את המספר הנכון" />
    {COUNT.map(([e, k], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 40 : 310, y = 135 + row * 220
      const opts = r.shuffle([k, k + 1, Math.max(1, k - 1) === k ? k + 2 : k - 1])
      return <g key={e} fontFamily={FONT}>
        <rect x={x} y={y} width="250" height="200" rx="16" fill="white" stroke="#111" strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 215 - (j % 4) * 55} y={y + 60 + Math.floor(j / 4) * 58} fontSize="40" textAnchor="middle">{e}</text>)}
        {opts.map((o, j) => <text key={j} x={x + 200 - j * 75} y={y + 180} fontSize="34" fontWeight="800" textAnchor="middle">{o}</text>)}
      </g>
    })}
  </SvgPage>
}

function OddPage({ n, seed }) {
  const r = rngFor(seed, n)
  return <SvgPage label="מה שונה?">
    <Head n={n} title="מה שונה?" instruction="בכל שורה יש תמונה אחת שונה — מקיפים אותה" />
    {ODD.map(([same, odd], i) => { const y = 190 + i * 105, at = r.int(0, 3); return <g key={same}>
      {[0, 1, 2, 3].map(j => <text key={j} x={480 - j * 120} y={y} fontSize="56" textAnchor="middle">{j === at ? odd : same}</text>)}
      {i < ODD.length - 1 && <path d={`M30 ${y + 35} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function ColorCountPage({ n }) {
  return <SvgPage label="צובעים לפי המספר">
    <Head n={n} title="צובעים לפי המספר" instruction="צובעים בכל שורה כמה צורות שכתוב במספר" />
    {COLOR_N.map((k, i) => { const y = 190 + i * 105; return <g key={i}>
      <text x={548} y={y + 16} fontSize="46" fontWeight="800" textAnchor="middle" fontFamily={FONT}>{k}</text>
      <path d={`M512 ${y - 30} V${y + 30}`} stroke="#999" />
      {Array.from({ length: 7 }, (_, j) => <Shape key={j} kind={i % 2 ? 'circle' : 'star'} x={470 - j * 66} y={y} s={52} />)}
    </g> })}
  </SvgPage>
}

export default function KindergartenBooklet({ seed }) {
  const tracing = createActivity({ type: 'tracing', age: '4-5', difficulty: 'easy', theme: 'animals', seed: 6101 })
  const pattern = createActivity({ type: 'pattern', age: '4-5', difficulty: 'easy', theme: 'nature', seed: 6303 })
  const maze = readyMaze(0, 1)
  return <>
    <Cover emoji="🧸✏️🌈" title="חוברת עבודה לגן חובה" subtitle="13 עמודים: אותיות, מספרים, ספירה, צורות, מבוך וצביעה" pages={PAGES}
      note="עמוד או שניים ביום, בזמן רגוע. אפשר לדלג על עמוד שקשה ולחזור אליו אחר כך. מחמיאים על המאמץ, לא רק על התוצאה." />
    <TracePage n={2} title="אותיות א–י" instruction="עוברים בעיפרון על האותיות המקווקוות, מימין לשמאל" rows={['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י']} />
    <TracePage n={3} title="מספרים 1–10" instruction="עוברים בעיפרון על המספרים המקווקווים" rows={Array.from({ length: 10 }, (_, i) => String(i + 1))} />
    <CountPage n={4} seed={seed} />
    <MatchPage n={5} seed={seed} title="אות ותמונה" instruction="מותחים קו מכל אות לתמונה שמתחילה בה" pairs={LETTERS.map(([l, e]) => [{ text: l }, { emoji: e }])} />
    <OddPage n={6} seed={seed} />
    <MatchPage n={7} seed={seed} title="צורות" instruction="מותחים קו מכל צורה לשם שלה" pairs={SHAPES.map(([k, he]) => [{ shape: k }, { text: he }])} />
    <MotorPage n={8} activity={tracing} />
    <MotorPage n={9} activity={pattern} />
    <MotorPage n={10} activity={maze} />
    <ColorCountPage n={11} />
    <ImagePage n={12} title="🖍️ דף צביעה — פיל" instruction="צובעים לאט, בתוך הקווים" src={coloringSrc('elephant', 1)} alt="דף צביעה: פיל" />
    <Certificate booklet="חוברת העבודה לגן חובה" done="כתבתי אותיות ומספרים, ספרתי, מצאתי צורות, פתרתי מבוך וצבעתי." cheer="אני מתכונן/ת לכיתה א׳!" />
  </>
}
