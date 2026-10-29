import { createActivity } from '../motor/generators'
import { readyMaze } from '../pages/printables/mazeData'
import { coloringSrc } from '../data/coloringSubjects'
import { AnswerKey, Certificate, Cover, Head, ImagePage, MatchPage, MotorPage, Shape, SvgPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת עבודה לגיל 4" — easier than the kindergarten booklet: big shapes and colours, counting to 5,
// more or less, big and small, one different picture, big tracing lines and a first easy maze.
const PAGES = bookletBySlug('age-4').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

const COLORS = [['#e53935', '🍎'], ['#fdd835', '🍌'], ['#43a047', '🥒'], ['#1e88e5', '🫐'], ['#fb8c00', '🍊'], ['#8e24aa', '🍇']]
const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart']
const SHAPE_NAMES = ['עיגול', 'ריבוע', 'משולש', 'כוכב', 'לב']
const COUNT = [['🍎', 2], ['⭐', 4], ['🐟', 1], ['🎈', 5], ['🌸', 3], ['🚗', 4]]
// More / less: [emoji, right box, left box, which side has more]. The page asks for the box with more.
export const MORE = [['🍎', 4, 2, 'right'], ['⭐', 1, 3, 'left'], ['🐟', 5, 2, 'right'], ['🎈', 2, 4, 'left'], ['🌸', 3, 1, 'right']]
// Big and small: three sizes of the same picture, the biggest sits at this place counted from the right.
export const BIG = [['🐘', [0.5, 1, 0.75], 2], ['🌳', [1, 0.5, 0.75], 1], ['🏠', [0.75, 0.5, 1], 3], ['🐻', [0.5, 0.75, 1], 3], ['🚗', [1, 0.75, 0.5], 1]]
const PLACE = { 1: 'הראשון מימין', 2: 'האמצעי', 3: 'הראשון משמאל' }
// One picture is different: [same, different, position from the right 1–4].
export const ODD = [['🐶', '🐱', 3], ['🍎', '🍌', 1], ['⭐', '🌙', 4], ['🚗', '🚌', 2], ['🌸', '🌳', 3]]
const SHAPE_HE = { circle: 'עיגול', square: 'ריבוע', triangle: 'משולש', star: 'כוכב', heart: 'לב', diamond: 'מעוין' }
const PLACE4 = { 1: 'הראשון מימין', 2: 'השני מימין', 3: 'השלישי מימין', 4: 'הרביעי מימין' }

function CountPage({ n, seed }) {
  const r = rngFor(seed, n)
  return <SvgPage label="סופרים עד 5">
    <Head n={n} title="סופרים עד 5" instruction="כמה יש בכל ריבוע? מקיפים את המספר הנכון" />
    {COUNT.map(([e, k], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 40 : 310, y = 135 + row * 225
      const opts = r.shuffle([k, k % 5 + 1, (k + 1) % 5 + 1 === k ? (k + 2) % 5 + 1 : (k + 1) % 5 + 1])
      return <g key={i} fontFamily={FONT}>
        <rect x={x} y={y} width="250" height="205" rx="16" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 195 - (j % 3) * 70} y={y + 62 + Math.floor(j / 3) * 62} fontSize="48" textAnchor="middle">{e}</text>)}
        {opts.map((o, j) => <text key={j} x={x + 200 - j * 75} y={y + 190} fontSize="38" fontWeight="800" textAnchor="middle">{o}</text>)}
      </g>
    })}
  </SvgPage>
}

// Big dotted numerals to go over, and as many empty circles to colour as the number says.
function NumbersPage({ n }) {
  return <SvgPage label="מספרים 1–5">
    <Head n={n} title="מספרים 1–5" instruction="עוברים על המספר בעיפרון וצובעים כמה עיגולים שכתוב" />
    {[1, 2, 3, 4, 5].map((k, i) => { const y = 150 + i * 132; return <g key={k}>
      <text x={500} y={y + 100} fontSize="130" fontWeight="800" textAnchor="middle" fontFamily={FONT} fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 3">{k}</text>
      {Array.from({ length: k }, (_, j) => <circle key={j} cx={375 - j * 62} cy={y + 62} r="26" fill="white" stroke={INK} strokeWidth="2.5" />)}
      {i < 4 && <path d={`M30 ${y + 118} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function MorePage({ n }) {
  return <SvgPage label="יותר">
    <Head n={n} title="איפה יש יותר?" instruction="מקיפים את הריבוע שיש בו יותר" />
    {MORE.map(([e, a, b], i) => { const y = 140 + i * 135; return <g key={i} fontFamily={FONT}>
      {[[a, 310], [b, 40]].map(([k, x]) => <g key={x}>
        <rect x={x} y={y} width="250" height="115" rx="14" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 215 - j * 46} y={y + 72} fontSize="38" textAnchor="middle">{e}</text>)}
      </g>)}
    </g> })}
  </SvgPage>
}

function BigPage({ n }) {
  return <SvgPage label="גדול וקטן">
    <Head n={n} title="מי הכי גדול?" instruction="מקיפים את התמונה הכי גדולה בכל שורה" />
    {BIG.map(([e, sizes], i) => { const y = 150 + i * 130; return <g key={i}>
      {sizes.map((s, j) => <text key={j} x={470 - j * 170} y={y + 88 - (1 - s) * 30} fontSize={110 * s} textAnchor="middle">{e}</text>)}
      {i < BIG.length - 1 && <path d={`M30 ${y + 116} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function OddPage({ n }) {
  return <SvgPage label="מה שונה?">
    <Head n={n} title="מה שונה?" instruction="בכל שורה יש תמונה אחת שונה — מקיפים אותה" />
    {ODD.map(([same, odd, at], i) => { const y = 200 + i * 125; return <g key={i}>
      {[1, 2, 3, 4].map(j => <text key={j} x={510 - (j - 1) * 130} y={y} fontSize="64" textAnchor="middle">{j === at ? odd : same}</text>)}
      {i < ODD.length - 1 && <path d={`M30 ${y + 45} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

export default function Age4Booklet({ seed }) {
  const tracing1 = createActivity({ type: 'tracing', age: '3-4', difficulty: 'easy', theme: 'animals', seed: 6201 })
  const tracing2 = createActivity({ type: 'tracing', age: '4-5', difficulty: 'easy', theme: 'nature', seed: 6202 })
  const pattern = createActivity({ type: 'pattern', age: '3-4', difficulty: 'easy', theme: 'shapes', seed: 6303 })
  const maze = readyMaze(0, 1)
  return <>
    <Cover emoji="🌈🔵⭐" title="חוברת עבודה לגיל 4" subtitle="15 עמודים: צבעים, צורות, ספירה עד 5, גדול וקטן, קווים ומבוך" pages={PAGES}
      note="עמוד אחד ביום מספיק, ויותר ממנו רק אם הילד מבקש. עדיף להדפיס בצבע (עמוד הצבעים), אבל גם בשחור־לבן אפשר: מצביעים על הצבע ואומרים את שמו. עובדים יחד, מצביעים עם האצבע ורק אחר כך עם העיפרון." />
    <MatchPage n={2} seed={seed} title="צבעים" instruction="מותחים קו מכל צבע לדבר שיש לו אותו צבע" pairs={COLORS.map(([c, e]) => [{ color: c }, { emoji: e }])} />
    <MatchPage n={3} seed={seed} title="צורות" instruction="מותחים קו מכל צורה לצורה זהה" pairs={SHAPES.map(k => [{ shape: k }, { shape: k }])} />
    <MotorPage n={4} activity={tracing1} />
    <MotorPage n={5} activity={tracing2} />
    <NumbersPage n={6} />
    <CountPage n={7} seed={seed} />
    <MorePage n={8} />
    <BigPage n={9} />
    <OddPage n={10} />
    <MotorPage n={11} activity={maze} />
    <MotorPage n={12} activity={pattern} />
    <ImagePage n={13} title="🖍️ דף צביעה — בלונים" instruction="צובעים לאט, בתוך הקווים" src={coloringSrc('balloons', 1)} alt="דף צביעה: בלונים" />
    <AnswerKey n={14} sections={[
      { title: 'עמוד 2 — צבעים', answers: ['אדום — תפוח', 'צהוב — בננה', 'ירוק — מלפפון', 'כחול — אוכמניות', 'כתום — תפוז', 'סגול — ענבים'] },
      { title: 'עמוד 3 — צורות', answers: SHAPE_NAMES },
      { title: 'עמוד 7 — סופרים עד 5 (מימין לשמאל, שורה אחר שורה)', answers: COUNT.map(([, k]) => String(k)) },
      { title: 'עמוד 8 — איפה יש יותר', answers: MORE.map(([e, a, b, side]) => `${a > b ? a : b} ${e} — הריבוע ${side === 'right' ? 'הימני' : 'השמאלי'}`) },
      { title: 'עמוד 9 — מי הכי גדול', answers: BIG.map(([e, , at]) => `${e} — ${PLACE[at]}`) },
      { title: 'עמוד 10 — מה שונה', answers: ODD.map(([, odd, at]) => `${odd} — ${PLACE4[at]}`) },
      { title: 'עמוד 12 — הדפוס (הריבועים הריקים, מימין לשמאל)', answers: pattern.rows.map((r, i) => `שורה ${i + 1}: ${r.cells.filter(c => c.blank).map(c => SHAPE_HE[c.item]).join(', ')}`) },
    ]} />
    <Certificate booklet="חוברת העבודה לגיל 4" done="התאמתי צבעים וצורות, ספרתי עד 5, מצאתי מה שונה, עקבתי אחרי קווים ופתרתי מבוך." cheer="כל הכבוד, ילד/ה גדול/ה!" />
  </>
}
