import { createActivity } from '../motor/generators'
import { coloringSrc } from '../data/coloringSubjects'
import { AnswerKey, Certificate, Cover, Head, ImagePage, MatchPage, MotorPage, SvgPage } from './kit'
import { bookletBySlug } from './registry'

// "חוברת עבודה לגיל 3" — easier than the age-4 booklet: four colours, three shapes, counting to 3, more or
// fewer, big and small, one different picture, big tracing lines and two simple colouring pages. Each page has
// few, large pictures and a single task.
const PAGES = bookletBySlug('age-3').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

const COLORS = [['#e53935', '🍎', 'אדום — תפוח'], ['#fdd835', '🍌', 'צהוב — בננה'], ['#43a047', '🥒', 'ירוק — מלפפון'], ['#1e88e5', '🫐', 'כחול — אוכמניות']]
const SHAPES = [['circle', 'עיגול'], ['square', 'ריבוע'], ['triangle', 'משולש']]
const SAME = ['🐶', '🏠', '🍎', '⭐']
// How many in each box (1–3).
export const COUNT = [['🍎', 2], ['⭐', 1], ['🐟', 3], ['🎈', 2], ['🌸', 3], ['🚗', 1]]
// More: [emoji, right box, left box]. The page asks for the box with more.
export const MORE = [['🍎', 3, 1], ['⭐', 1, 2], ['🐟', 2, 1], ['🎈', 1, 3], ['🌸', 3, 2]]
// Big and small: [emoji, size of the right picture, size of the left picture].
export const BIG = [['🐘', 1, 0.5], ['🌳', 0.5, 1], ['🏠', 1, 0.5], ['🐻', 0.5, 1], ['🚗', 1, 0.5]]
// One picture is different: [same, different, place counted from the right 1–3].
export const ODD = [['🐶', '🐱', 2], ['🍎', '🍌', 3], ['⭐', '🌙', 1], ['🚗', '🚌', 2], ['🌸', '🌳', 3]]
const PLACE = { 1: 'הימני', 2: 'האמצעי', 3: 'השמאלי' }

// Large dotted numerals to go over, and as many empty circles to colour as the number says.
function NumbersPage({ n }) {
  return <SvgPage label="מספרים 1–3">
    <Head n={n} title="מספרים 1–3" instruction="עוברים על המספר באצבע, ואחר כך בעיפרון. צובעים כמה עיגולים שכתוב" />
    {[1, 2, 3].map((k, i) => { const y = 150 + i * 218; return <g key={k}>
      <text x={470} y={y + 160} fontSize="210" fontWeight="800" textAnchor="middle" fontFamily={FONT} fill="none" stroke="#6b7280" strokeWidth="2.5" strokeDasharray="5 4">{k}</text>
      {Array.from({ length: k }, (_, j) => <circle key={j} cx={290 - j * 100} cy={y + 100} r="40" fill="white" stroke={INK} strokeWidth="3" />)}
      {i < 2 && <path d={`M30 ${y + 200} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function CountPage({ n }) {
  return <SvgPage label="סופרים עד 3">
    <Head n={n} title="סופרים עד 3" instruction="כמה יש בכל ריבוע? מקיפים את המספר" />
    {COUNT.map(([e, k], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 40 : 310, y = 135 + row * 225
      return <g key={i} fontFamily={FONT}>
        <rect x={x} y={y} width="250" height="205" rx="16" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 195 - j * 70} y={y + 90} fontSize="56" textAnchor="middle">{e}</text>)}
        {[1, 2, 3].map((o, j) => <text key={o} x={x + 200 - j * 75} y={y + 182} fontSize="40" fontWeight="800" textAnchor="middle">{o}</text>)}
      </g>
    })}
  </SvgPage>
}

function MorePage({ n }) {
  return <SvgPage label="יותר">
    <Head n={n} title="איפה יש יותר?" instruction="מקיפים את הריבוע שיש בו יותר" />
    {MORE.map(([e, a, b], i) => { const y = 140 + i * 135; return <g key={i} fontFamily={FONT}>
      {[[a, 310], [b, 40]].map(([k, x]) => <g key={x}>
        <rect x={x} y={y} width="250" height="115" rx="14" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 205 - j * 70} y={y + 74} fontSize="46" textAnchor="middle">{e}</text>)}
      </g>)}
    </g> })}
  </SvgPage>
}

function BigPage({ n }) {
  return <SvgPage label="גדול וקטן">
    <Head n={n} title="מי הגדול?" instruction="מקיפים את התמונה הגדולה בכל שורה" />
    {BIG.map(([e, right, left], i) => { const y = 150 + i * 130; return <g key={i}>
      <text x={430} y={y + 92 - (1 - right) * 36} fontSize={116 * right} textAnchor="middle">{e}</text>
      <text x={170} y={y + 92 - (1 - left) * 36} fontSize={116 * left} textAnchor="middle">{e}</text>
      {i < BIG.length - 1 && <path d={`M30 ${y + 116} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function OddPage({ n }) {
  return <SvgPage label="מה שונה?">
    <Head n={n} title="מה שונה?" instruction="בכל שורה יש תמונה אחת שונה — מקיפים אותה" />
    {ODD.map(([same, odd, at], i) => { const y = 200 + i * 125; return <g key={i}>
      {[1, 2, 3].map(j => <text key={j} x={470 - (j - 1) * 170} y={y} fontSize="74" textAnchor="middle">{j === at ? odd : same}</text>)}
      {i < ODD.length - 1 && <path d={`M30 ${y + 45} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

export default function Age3Booklet({ seed }) {
  const tracing1 = createActivity({ type: 'tracing', age: '3-4', difficulty: 'easy', theme: 'animals', seed: 7101 })
  const tracing2 = createActivity({ type: 'tracing', age: '3-4', difficulty: 'easy', theme: 'nature', seed: 7102 })
  return <>
    <Cover emoji="🌈🔴🔺" title="חוברת עבודה לגיל 3" subtitle="15 עמודים: צבעים, צורות, ספירה עד 3, יותר ופחות, קווים וצביעה" pages={PAGES}
      note="גיל 3 הוא גיל של משחק, ולכן עמוד אחד ביום מספיק, ויותר רק אם הילד מבקש. עובדים יחד: מצביעים עם האצבע ואומרים את השמות בקול, ורק אחר כך מחזיקים עיפרון או צבע עבה. אם הילד מעדיף לצבוע את כל העמוד, זה בסדר גמור." />
    <MatchPage n={2} seed={seed} title="צבעים" instruction="מותחים קו מכל צבע לדבר שיש לו אותו צבע" pairs={COLORS.map(([c, e]) => [{ color: c }, { emoji: e }])} />
    <MatchPage n={3} seed={seed} title="צורות" instruction="מותחים קו מכל צורה לצורה זהה" pairs={SHAPES.map(([k]) => [{ shape: k }, { shape: k }])} />
    <MotorPage n={4} activity={tracing1} />
    <MotorPage n={5} activity={tracing2} />
    <NumbersPage n={6} />
    <CountPage n={7} />
    <MorePage n={8} />
    <BigPage n={9} />
    <OddPage n={10} />
    <MatchPage n={11} seed={seed} title="מוצאים זוגות" instruction="מותחים קו בין שתי תמונות זהות" pairs={SAME.map(e => [{ emoji: e }, { emoji: e }])} />
    <ImagePage n={12} title="🖍️ דף צביעה — דובי" instruction="צובעים לאט, בכל צבע שרוצים" src={coloringSrc('teddy-bear', 1)} alt="דף צביעה: דובי" />
    <ImagePage n={13} title="🖍️ דף צביעה — קשת ושמש" instruction="צובעים לאט, בכל צבע שרוצים" src={coloringSrc('rainbow-sun', 1)} alt="דף צביעה: קשת ושמש" />
    <AnswerKey n={14} sections={[
      { title: 'עמוד 2 — צבעים', answers: COLORS.map(c => c[2]) },
      { title: 'עמוד 3 — צורות', answers: SHAPES.map(s => s[1]) },
      { title: 'עמוד 6 — מספרים 1–3', answers: ['עיגול אחד', 'שני עיגולים', 'שלושה עיגולים'] },
      { title: 'עמוד 7 — סופרים עד 3 (מימין לשמאל, שורה אחר שורה)', answers: COUNT.map(([, k]) => String(k)) },
      { title: 'עמוד 8 — איפה יש יותר', answers: MORE.map(([e, a, b]) => `${Math.max(a, b)} ${e} — הריבוע ${a > b ? 'הימני' : 'השמאלי'}`) },
      { title: 'עמוד 9 — מי הגדול', answers: BIG.map(([e, r]) => `${e} — ${r > 0.5 ? 'הימני' : 'השמאלי'}`) },
      { title: 'עמוד 10 — מה שונה', answers: ODD.map(([, odd, at]) => `${odd} — ${PLACE[at]}`) },
      { title: 'עמוד 11 — מוצאים זוגות', answers: SAME.map(e => `${e} — התמונה הזהה בצד השני`) },
    ]} />
    <Certificate booklet="חוברת העבודה לגיל 3" done="התאמתי צבעים וצורות, ספרתי עד 3, מצאתי מה שונה, עקבתי אחרי קווים וצבעתי." cheer="כל הכבוד, ילד/ה גדול/ה!" />
  </>
}
