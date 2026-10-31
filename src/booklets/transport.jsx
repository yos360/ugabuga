import { coloringSrc } from '../data/coloringSubjects'
import { Certificate, ChoicePage, Cover, FillPage, Head, ImagePage, MatchPage, Pic, SvgPage, TracePage, WritePage, AnswerKey, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת כלי תחבורה לגן חובה" — vehicles sorted by air / sea / land, the letter מ (מכונית, משאית, מטוס),
// counting and recognising the numbers 1–10, missing numbers, addition within 10, two coloring pages,
// answers and a certificate. Answers are computed from the data below so the key cannot drift.
const PAGES = bookletBySlug('transport-kindergarten').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

// where: air | sea | land
export const VEHICLES = [
  { name: 'מטוס', emoji: '✈️', where: 'air' }, { name: 'מסוק', emoji: '🚁', where: 'air' }, { name: 'רקטה', emoji: '🚀', where: 'air' },
  { name: 'ספינה', emoji: '🚢', where: 'sea' }, { name: 'סירת מפרשים', emoji: '⛵', where: 'sea' }, { name: 'סירת מנוע', emoji: '🚤', where: 'sea' },
  { name: 'מכונית', emoji: '🚗', where: 'land' }, { name: 'משאית', emoji: '🚚', where: 'land' }, { name: 'אוטובוס', emoji: '🚌', where: 'land' },
  { name: 'רכבת', emoji: '🚆', where: 'land' }, { name: 'אופניים', emoji: '🚲', where: 'land' }, { name: 'טרקטור', emoji: '🚜', where: 'land' },
]
export const WHERE = { air: 'אוויר', sea: 'ים', land: 'יבשה' }
const vehicle = name => VEHICLES.find(v => v.name === name)

export const SORT = ['מטוס', 'אוטובוס', 'ספינה', 'מסוק', 'משאית', 'סירת מנוע', 'רכבת', 'רקטה']
// Words that start with מ, with their picture.
export const M_WORDS = [['מכונית', '🚗'], ['משאית', '🚚'], ['מטוס', '✈️'], ['מסוק', '🚁'], ['מונית', '🚕'], ['מעבורת', '⛴️']]
// First letter: [vehicle name, letter, two other letters].
export const FIRST = [['מכונית', 'מ', 'ס', 'ר'], ['אוטובוס', 'א', 'מ', 'ט'], ['מטוס', 'מ', 'ת', 'ל'], ['ספינה', 'ס', 'מ', 'ש'], ['משאית', 'מ', 'פ', 'נ'], ['רכבת', 'ר', 'מ', 'ד'], ['אופניים', 'א', 'מ', 'ב'], ['טרקטור', 'ט', 'מ', 'כ']]
// Counting: [emoji, how many].
export const COUNT = [['🚗', 4], ['✈️', 2], ['🚌', 6], ['⛵', 3], ['🚲', 5], ['🚚', 7]]
// Number to quantity: how many of each picture, 1–6.
export const QUANTITY = [['🚗', 1], ['✈️', 2], ['🚌', 3], ['🚲', 4], ['🚢', 5], ['🚚', 6]]
// Missing numbers: [first number in the row, which place (0-based) is hidden]; each row has five numbers.
export const SEQ = [[1, 2], [3, 3], [5, 0], [2, 1], [6, 2], [4, 4], [6, 1]]
// Addition within 10: [emoji, a, b].
export const ADD = [['🚗', 2, 1], ['🚌', 3, 2], ['✈️', 4, 2], ['🚲', 3, 3], ['🚚', 4, 4]]

const FRAME = (x, y, w, h) => <rect x={x} y={y} width={w} height={h} rx="16" fill="white" stroke={INK} strokeWidth="2" />

function MeetPage({ n }) {
  const rows = [['air', 'באוויר', 138], ['sea', 'בים', 308], ['land', 'ביבשה', 478]]
  return <SvgPage label="כלי תחבורה סביבנו">
    <Head n={n} title="כלי תחבורה סביבנו" instruction="מסתכלים בתמונות וקוראים את השמות. איפה כל כלי נוסע?" />
    {rows.map(([k, label, y]) => {
      const list = VEHICLES.filter(v => v.where === k), h = k === 'land' ? 300 : 150
      return <g key={k} fontFamily={FONT} direction="rtl" textAnchor="middle">
        {FRAME(30, y, 540, h)}
        <text x={555} y={y + 30} fontSize="22" fontWeight="800" textAnchor="start">{label}</text>
        {list.map((v, i) => {
          const per = k === 'land' ? 3 : 3, col = i % per, row = Math.floor(i / per), cx = 470 - col * 170, cy = y + 85 + row * 130
          return <g key={v.name}><Pic item={{ emoji: v.emoji }} x={cx} y={cy - 5} size={64} /><text x={cx} y={cy + 52} fontSize="19" fontWeight="700">{v.name}</text></g>
        })}
      </g>
    })}
  </SvgPage>
}

function CountPage({ n, seed }) {
  const r = rngFor(seed, n)
  return <SvgPage label="סופרים כלי תחבורה">
    <Head n={n} title="סופרים כלי תחבורה" instruction="כמה יש בכל ריבוע? מקיפים את המספר הנכון" />
    {COUNT.map(([e, k], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 40 : 310, y = 135 + row * 220
      const opts = r.shuffle([k, k + 1, k - 1])
      return <g key={e} fontFamily={FONT}>
        {FRAME(x, y, 250, 200)}
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 215 - (j % 4) * 55} y={y + 60 + Math.floor(j / 4) * 58} fontSize="40" textAnchor="middle">{e}</text>)}
        {opts.map((o, j) => <text key={j} x={x + 200 - j * 75} y={y + 180} fontSize="34" fontWeight="800" textAnchor="middle">{o}</text>)}
      </g>
    })}
  </SvgPage>
}

// Numbers on the right, groups of vehicles on the left (in a seeded order).
function QuantityPage({ n, seed }) {
  const order = rngFor(seed, n).shuffle(QUANTITY.map((_, i) => i)), step = 108, top = 135
  return <SvgPage label="מספר וכמות">
    <Head n={n} title="מספר וכמות" instruction="מותחים קו מכל מספר לקבוצה שיש בה כל כך הרבה כלי רכב" />
    {QUANTITY.map(([, k], i) => { const y = top + i * step + step / 2; return <g key={k} fontFamily={FONT}>
      <text x={470} y={y + 18} fontSize="52" fontWeight="800" textAnchor="middle">{k}</text><circle cx={385} cy={y} r="6" fill={INK} />
    </g> })}
    {order.map((qi, i) => { const [e, k] = QUANTITY[qi], y = top + i * step + step / 2; return <g key={qi}>
      <circle cx={215} cy={y} r="6" fill={INK} />
      {Array.from({ length: k }, (_, j) => <text key={j} x={175 - (j % 3) * 50} y={y - 6 + Math.floor(j / 3) * 44 - (k > 3 ? 18 : 0) + 14} fontSize="38" textAnchor="middle">{e}</text>)}
    </g> })}
  </SvgPage>
}

function AddPage({ n }) {
  return <SvgPage label="חיבור עם כלי רכב">
    <Head n={n} title="חיבור עם כלי רכב" instruction="סופרים כל קבוצה וכותבים את התרגיל והתוצאה" />
    {ADD.map(([e, a, b], i) => { const y = 150 + i * 128; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {Array.from({ length: a }, (_, k) => <Pic key={k} item={{ emoji: e }} x={545 - k * 40} y={y + 30} size={38} />)}
      <text x={350} y={y + 44} fontSize="36" fontWeight="800">+</text>
      {Array.from({ length: b }, (_, k) => <Pic key={k} item={{ emoji: e }} x={310 - k * 40} y={y + 30} size={38} />)}
      <text x={85} y={y + 40} fontSize="23" direction="ltr">{'__ + __ = __'}</text>
      {i < ADD.length - 1 && <path d={`M30 ${y + 90} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

const seqLine = ([start, hole]) => Array.from({ length: 5 }, (_, i) => i === hole ? '__' : String(start + i)).join('   ')

export default function TransportBooklet({ seed }) {
  const sort = SORT.map((name, i) => { const v = vehicle(name); return { pic: { emoji: v.emoji }, options: rngFor(seed, 40 + i).shuffle(Object.values(WHERE)), answer: WHERE[v.where] } })
  const first = FIRST.map(([name, l, x, y], i) => ({ pic: { emoji: vehicle(name).emoji }, options: rngFor(seed, 60 + i).shuffle([l, x, y]), answer: l }))
  return <>
    <Cover emoji="🚗✈️🚢" title="חוברת כלי תחבורה לגן חובה" subtitle="16 עמודים: אוויר, ים ויבשה, האות מ, מספרים 1–10, חיבור וצביעה" pages={PAGES}
      note="עמוד או שניים בכל פעם, בזמן רגוע. כדאי לדבר על הכלים לפני הפתרון: במה נסעתם השבוע? מה נוסע גבוה בשמיים? אפשר לדלג על עמוד שקשה ולחזור אליו אחר כך." />
    <MeetPage n={2} />
    <ChoicePage n={3} title="אוויר, ים או יבשה?" instruction="איפה הכלי נוסע? מקיפים את התשובה הנכונה" items={sort} />
    <MatchPage n={4} seed={seed} title="כל כלי בדרך שלו" instruction="מותחים קו מכל כלי לדרך שלו" pairs={[['מטוס', '☁️'], ['ספינה', '🌊'], ['מכונית', '🛣️'], ['רכבת', '🛤️']].map(([name, way]) => [{ emoji: vehicle(name).emoji }, { emoji: way }])} />
    <TracePage n={5} title="האות מ" instruction="עוברים בעיפרון על האות ועל המילים המקווקוות, מימין לשמאל" rows={['מ', 'מ', 'מכונית', 'משאית', 'מטוס']} repeats={4} />
    <WritePage n={6} title="מילים שמתחילות ב־מ" instruction="עוברים על המילה בעיפרון וכותבים אותה שוב על הקו" items={M_WORDS.map(([word, emoji]) => ({ word, pic: { emoji } }))} />
    <ChoicePage n={7} title="באיזו אות מתחיל השם?" instruction="אומרים את שם הכלי ומקיפים את האות הראשונה" items={first} />
    <CountPage n={8} seed={seed} />
    <TracePage n={9} title="מספרים 1–10" instruction="עוברים בעיפרון על המספרים המקווקווים" rows={Array.from({ length: 10 }, (_, i) => String(i + 1))} />
    <QuantityPage n={10} seed={seed} />
    <FillPage n={11} title="איזה מספר חסר?" instruction="כותבים את המספר שחסר בשורה" lines={SEQ.map(seqLine)} ltr size={36} />
    <AddPage n={12} />
    <ImagePage n={13} title="🖍️ דף צביעה — מטוס" instruction="צובעים לאט, בתוך הקווים" src={coloringSrc('airplane', 1)} alt="דף צביעה: מטוס" />
    <ImagePage n={14} title="🖍️ דף צביעה — כלי רכב" instruction="צובעים את כלי הרכב" src={coloringSrc('vehicles', 1)} alt="דף צביעה: כלי רכב" />
    <AnswerKey n={15} sections={[
      { title: 'עמוד 3 — אוויר, ים או יבשה', answers: sort.map((s, i) => `${SORT[i]}: ${s.answer}`) },
      { title: 'עמוד 7 — האות הראשונה', answers: first.map((f, i) => `${FIRST[i][0]}: ${f.answer}`) },
      { title: 'עמוד 8 — כמה יש', answers: COUNT.map(([, k]) => String(k)) },
      { title: 'עמוד 10 — מספר וכמות', answers: QUANTITY.map(([, k]) => `המספר ${k} — קבוצה של ${k}`) },
      { title: 'עמוד 11 — המספר החסר', answers: SEQ.map(([start, hole]) => String(start + hole)) },
      { title: 'עמוד 12 — חיבור', answers: ADD.map(([, a, b]) => `${a} + ${b} = ${a + b}`) },
    ]} />
    <Certificate booklet="חוברת כלי תחבורה" done="הכרתי כלי תחבורה של האוויר, הים והיבשה, כתבתי את האות מ, ספרתי וחיברתי." cheer="נהג/ת מצטיין/ת! 🚗" />
  </>
}
