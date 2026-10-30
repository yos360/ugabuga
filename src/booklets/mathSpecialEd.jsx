import { AnswerKey, Certificate, Cover, Head, Pic, SvgPage, TracePage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת חשבון 1–10 — צביעה, מדבקות וגזירה" — numbers one to ten with big pictures and few items per page:
// counting and circling, tracing, colouring a given amount, sticker ten-frames, cut-and-paste ordering and
// matching, adding and subtracting with pictures, comparing groups and a colour-by-number caterpillar.
// Everything stays within 10, so it suits kindergarten, first grade and special-education classes.
const PAGES = bookletBySlug('math-special-ed').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'
const SOFT = '#9aa5b5'

// [emoji, how many, wrong options] — the right answer is shuffled in with the two wrong ones.
const COUNT_A = [['🍎', 3, [2, 4]], ['⭐', 5, [4, 3]], ['🐟', 2, [3, 1]], ['🎈', 4, [5, 3]], ['🐱', 1, [2, 3]]]
const COUNT_B = [['🍪', 7, [6, 8]], ['🦋', 6, [5, 7]], ['🌼', 9, [8, 10]], ['⚽', 8, [7, 9]], ['🚗', 10, [9, 8]]]
const PAINT = [3, 6, 2, 8, 5]
const ADD = [[2, 3, '🍓'], [4, 1, '🐥'], [3, 3, '🌷'], [5, 2, '🍩'], [1, 4, '🚲'], [5, 5, '🎈']]
const SUB = [[5, 2, '🍌'], [6, 1, '🐞'], [7, 3, '🍪'], [8, 5, '🎈'], [9, 4, '🍎'], [10, 6, '⭐']]
const SUMS = [['+', 3, 4], ['+', 5, 2], ['+', 6, 1], ['+', 8, 2], ['−', 9, 4], ['−', 7, 3], ['−', 10, 6], ['+', 5, 5], ['−', 8, 5], ['+', 2, 7], ['−', 6, 2], ['−', 10, 1]]
  .map(([op, a, b]) => ({ text: `${a} ${op} ${b} = ____`, ans: op === '+' ? a + b : a - b }))
const COMPARE = [[3, 5], [7, 4], [6, 9], [8, 2], [10, 7]] // first number is the group on the right
const MATCH = [['🐶', 1], ['🐦', 2], ['🌳', 3], ['🍎', 4], ['⭐', 5]]
const CATERPILLAR = [['אדום', '#ef4444'], ['כתום', '#f97316'], ['צהוב', '#facc15'], ['ירוק', '#22c55e'], ['כחול', '#3b82f6'], ['סגול', '#a855f7'], ['ורוד', '#ec4899'], ['חום', '#92400e'], ['אפור', '#9ca3af'], ['תכלת', '#38bdf8']]

// n small pictures in rows of up to `perRow`, starting at the top-right corner (x, y) and moving left.
function Group({ emoji, n, x, y, size, perRow = 5, ltr = false }) {
  return <g>{Array.from({ length: n }, (_, i) => <Pic key={i} item={{ emoji }} x={x + (ltr ? 1 : -1) * (i % perRow) * (size + 4)} y={y + Math.floor(i / perRow) * (size + 4)} size={size} />)}</g>
}

function CountPage({ n, title, items, seed }) {
  const rowH = 128
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction="סופרים את התמונות ומקיפים את המספר הנכון" />
    {items.map(([e, k, wrong], i) => {
      const y = 150 + i * rowH, two = k > 5, size = two ? 44 : 58
      const opts = rngFor(seed, n * 10 + i).shuffle([k, ...wrong])
      return <g key={i} fontFamily={FONT} textAnchor="middle">
        <Group emoji={e} n={k} x={540} y={y + (two ? 26 : 50)} size={size} />
        {opts.map((o, j) => <text key={j} x={190 - j * 80} y={y + 72} fontSize="46" fontWeight="800">{o}</text>)}
        {i < items.length - 1 && <path d={`M30 ${y + rowH - 6} H570`} stroke="#ddd" strokeDasharray="5 6" />}
      </g>
    })}
  </SvgPage>
}

function PaintPage({ n }) {
  return <SvgPage label="צובעים לפי המספר">
    <Head n={n} title="צובעים לפי המספר" instruction="צובעים בדיוק כמה עיגולים שכתוב, ואת השאר משאירים לבנים" />
    {PAINT.map((k, i) => { const y = 190 + i * 125; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <circle cx="540" cy={y} r="30" fill="white" stroke={INK} strokeWidth="2.5" /><text x="540" y={y + 16} fontSize="44" fontWeight="800">{k}</text>
      {Array.from({ length: 10 }, (_, j) => <circle key={j} cx={455 - j * 42} cy={y} r="18" fill="white" stroke={INK} strokeWidth="2.5" />)}
    </g> })}
  </SvgPage>
}

// A ten-frame (two rows of five) left empty for stickers.
function StickerPage({ n, title, numbers }) {
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction="מדביקים (או מציירים) בכל מסגרת כמה מדבקות שכתוב במספר" />
    {numbers.map((k, i) => { const y = 160 + i * 124; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <circle cx="530" cy={y + 56} r="38" fill="white" stroke={INK} strokeWidth="3" /><text x="530" y={y + 74} fontSize="52" fontWeight="800">{k}</text>
      {Array.from({ length: 10 }, (_, j) => <rect key={j} x={450 - (j % 5) * 60 - 56} y={y + Math.floor(j / 5) * 58} width="56" height="56" fill="white" stroke={SOFT} strokeWidth="2.5" />)}
    </g> })}
  </SvgPage>
}

const Scissors = ({ x, y }) => <text x={x} y={y} fontSize="20" textAnchor="middle" aria-hidden="true">✂️</text>
const Card = ({ x, y, w, h, children }) => <g><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="8" fill="white" stroke={INK} strokeWidth="2" strokeDasharray="7 5" />{children}</g>

function CutOrderPage({ n, seed }) {
  const cards = rngFor(seed, 8).shuffle(Array.from({ length: 10 }, (_, i) => i + 1))
  return <SvgPage label="גוזרים ומדביקים לפי הסדר">
    <Head n={n} title="גוזרים ומדביקים: לפי הסדר" instruction="גוזרים את הכרטיסים שלמטה ומדביקים אותם בריבועים, מ־1 עד 10" />
    <g fontFamily={FONT} textAnchor="middle">
      {Array.from({ length: 10 }, (_, i) => <g key={i}><rect x={510 - (i % 5) * 100 - 42} y={140 + Math.floor(i / 5) * 100} width="84" height="84" fill="white" stroke={INK} strokeWidth="2.5" /><text x={510 - (i % 5) * 100 - 34} y={140 + Math.floor(i / 5) * 100 + 18} fontSize="13" fill="#777">{i + 1}</text></g>)}
      <path d="M20 372 H580" stroke={INK} strokeDasharray="8 6" /><Scissors x={560} y={364} />
      {cards.map((c, i) => <Card key={c} x={510 - (i % 5) * 100} y={450 + Math.floor(i / 5) * 110} w={86} h={86}><text x={510 - (i % 5) * 100} y={450 + Math.floor(i / 5) * 110 + 18} fontSize="52" fontWeight="800">{c}</text></Card>)}
    </g>
  </SvgPage>
}

function CutMatchPage({ n, seed }) {
  const cards = rngFor(seed, 9).shuffle(MATCH)
  return <SvgPage label="גוזרים ומדביקים כמה יש">
    <Head n={n} title="גוזרים ומדביקים: כמה יש?" instruction="גוזרים כל קבוצת תמונות ומדביקה ליד המספר שמתאים לה" />
    <g fontFamily={FONT} textAnchor="middle">
      {MATCH.map(([, k], i) => { const y = 135 + i * 74; return <g key={i}>
        <circle cx="520" cy={y + 30} r="28" fill="white" stroke={INK} strokeWidth="2.5" /><text x="520" y={y + 46} fontSize="38" fontWeight="800">{k}</text>
        <rect x="260" y={y} width="210" height="62" fill="white" stroke={INK} strokeWidth="2.5" />
      </g> })}
      <path d="M20 515 H580" stroke={INK} strokeDasharray="8 6" /><Scissors x={560} y={507} />
      {cards.map(([e, k], i) => { const cx = 480 - (i % 3) * 190, cy = 580 + Math.floor(i / 3) * 110; return <Card key={e} x={cx} y={cy} w={170} h={92}>
        <Group emoji={e} n={k} x={cx + 68} y={cy - 6} size={30} perRow={5} />
      </Card> })}
    </g>
  </SvgPage>
}

function AddPage({ n }) {
  return <SvgPage label="חיבור עם תמונות">
    <Head n={n} title="חיבור עם תמונות" instruction="סופרים את כל התמונות ביחד וכותבים את התוצאה" />
    {ADD.map(([a, b, e], i) => { const y = 190 + i * 100; return <g key={i} fontFamily={FONT} fontSize="40" fontWeight="800" textAnchor="middle">
      <Group emoji={e} n={a} x={50} y={y} size={32} ltr />
      <text x="232" y={y + 14}>+</text>
      <Group emoji={e} n={b} x={262} y={y} size={32} ltr />
      <text x="452" y={y + 14}>=</text>
      <rect x="480" y={y - 30} width="80" height="60" fill="white" stroke={INK} strokeWidth="2.5" />
    </g> })}
  </SvgPage>
}

function SubPage({ n }) {
  return <SvgPage label="חיסור עם תמונות">
    <Head n={n} title="חיסור עם תמונות" instruction="מוחקים בקו את מי שהלך, ואז כותבים כמה נשארו" />
    {SUB.map(([a, k, e], i) => { const y = 190 + i * 100; return <g key={i} fontFamily={FONT}>
      <Group emoji={e} n={a} x={40} y={y} size={26} perRow={10} ltr />
      {Array.from({ length: k }, (_, j) => <path key={j} d={`M${40 + j * 30 - 13} ${y - 13} L${40 + j * 30 + 13} ${y + 13} M${40 + j * 30 + 13} ${y - 13} L${40 + j * 30 - 13} ${y + 13}`} stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />)}
      <text x="350" y={y + 12} fontSize="30" fontWeight="800" direction="ltr" style={{ whiteSpace: 'pre' }}>{`${a} − ${k} = `}</text>
      <rect x="510" y={y - 28} width="64" height="56" fill="white" stroke={INK} strokeWidth="2.5" />
    </g> })}
  </SvgPage>
}

function Exercises({ n }) {
  return <SvgPage label="תרגילי חיבור וחיסור עד 10">
    <Head n={n} title="תרגילי חיבור וחיסור עד 10" instruction="פותרים את התרגילים. אפשר לספור על האצבעות" />
    {SUMS.map((it, i) => {
      const col = i % 2, y = 170 + Math.floor(i / 2) * 105, cx = col ? 150 : 440
      return <g key={i} fontFamily={FONT}>
        <text x={cx + 130} y={y} fontSize="14" fill="#666" textAnchor="middle">{i + 1}.</text>
        <text x={cx} y={y + 14} fontSize="32" fontWeight="700" textAnchor="middle" direction="ltr" style={{ whiteSpace: 'pre' }}>{it.text}</text>
      </g>
    })}
  </SvgPage>
}

function ComparePage({ n }) {
  const emojis = ['🐠', '🍋', '🐸', '🌟', '🍩']
  return <SvgPage label="איפה יש יותר">
    <Head n={n} title="איפה יש יותר?" instruction="סופרים כל קבוצה ומקיפים את הקבוצה שיש בה יותר תמונות" />
    {COMPARE.map(([a, b], i) => { const y = 135 + i * 130; return <g key={i}>
      {[[a, 300], [b, 20]].map(([k, x0], j) => <g key={j}>
        <rect x={x0} y={y} width="280" height="112" rx="16" fill="white" stroke={SOFT} strokeWidth="2.5" />
        <Group emoji={emojis[i]} n={k} x={x0 + 240} y={y + (k > 5 ? 32 : 56)} size={42} />
      </g>)}
    </g> })}
  </SvgPage>
}

function CaterpillarPage({ n }) {
  const pos = i => [520 - (i % 5) * 108, i < 5 ? 270 : 390]
  return <SvgPage label="זחל לפי מספרים">
    <Head n={n} title="ציור לפי מספרים: הזחל" instruction="צובעים כל עיגול בצבע שמתאים למספר שלו" />
    <g fontFamily={FONT} textAnchor="middle">
      {CATERPILLAR.map(([name, color], i) => { const x = 520 - (i % 5) * 108, y = 540 + Math.floor(i / 5) * 100; return <g key={name}>
        <circle cx={x} cy={y} r="24" fill="white" stroke={INK} strokeWidth="2.5" /><text x={x} y={y + 9} fontSize="26" fontWeight="800">{i + 1}</text>
        <rect x={x - 36} y={y + 30} width="72" height="14" rx="7" fill={color} stroke={INK} strokeWidth="1.5" />
        <text x={x} y={y + 62} fontSize="14">{name}</text>
      </g> })}
      <path d="M505 212 q-10 -34 -28 -42 M535 212 q10 -34 28 -42" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {Array.from({ length: 10 }, (_, i) => { const [x, y] = pos(i); return <g key={i}>
        <circle cx={x} cy={y} r="48" fill="white" stroke={INK} strokeWidth="3" />
        <text x={x} y={y + 16} fontSize="46" fontWeight="800">{i + 1}</text>
      </g> })}
      <circle cx="502" cy="246" r="5" fill={INK} /><circle cx="538" cy="246" r="5" fill={INK} /><path d="M506 300 q14 10 28 0" fill="none" stroke="none" />
    </g>
  </SvgPage>
}

const Key = ({ n }) => <AnswerKey n={n} sections={[
  { title: 'עמוד 2 — סופרים (1–5)', answers: COUNT_A.map(([e, k]) => `${e} ${k}`) },
  { title: 'עמוד 3 — סופרים (6–10)', answers: COUNT_B.map(([e, k]) => `${e} ${k}`) },
  { title: 'עמוד 5 — צובעים', answers: PAINT.map(k => `${k} עיגולים`) },
  { title: 'עמוד 9 — כמה יש?', answers: MATCH.map(([e, k]) => `${k} ← ${e.repeat(k)}`) },
  { title: 'עמוד 10 — חיבור', answers: ADD.map(([a, b]) => `${a} + ${b} = ${a + b}`) },
  { title: 'עמוד 11 — חיסור', answers: SUB.map(([a, k]) => `${a} − ${k} = ${a - k}`) },
  { title: 'עמוד 12 — תרגילים', answers: SUMS.map(s => `${s.text.replace('____', s.ans)}`) },
  { title: 'עמוד 13 — איפה יש יותר?', answers: COMPARE.map(([a, b]) => `${Math.max(a, b)} (${a > b ? 'הקבוצה מימין' : 'הקבוצה משמאל'})`) },
]} />

export default function MathSpecialEdBooklet({ seed }) {
  return <>
    <Cover emoji="🔢🐛" title="חוברת חשבון 1–10" subtitle="16 עמודים: סופרים, צובעים, מדביקים מדבקות, גוזרים ומדביקים, ומחברים עם תמונות"
      pages={PAGES}
      note="כל התרגילים נשארים עד 10, עם תמונות גדולות ומעט משימות בעמוד, כך שאפשר לעבוד עמוד אחד בכל פעם. צריך עיפרונות צבע, מספריים, דבק ומדבקות קטנות (אם אין, מציירים נקודות)." />
    <CountPage n={2} title="סופרים ומקיפים (1–5)" items={COUNT_A} seed={seed} />
    <CountPage n={3} title="סופרים ומקיפים (6–10)" items={COUNT_B} seed={seed} />
    <TracePage n={4} title="כותבים את המספרים 1–10" instruction="עוברים בעיפרון על המספרים המקווקווים" rows={Array.from({ length: 10 }, (_, i) => String(i + 1))} />
    <PaintPage n={5} />
    <StickerPage n={6} title="מדבקות (1–5)" numbers={[1, 2, 3, 4, 5]} />
    <StickerPage n={7} title="מדבקות (6–10)" numbers={[6, 7, 8, 9, 10]} />
    <CutOrderPage n={8} seed={seed} />
    <CutMatchPage n={9} seed={seed} />
    <AddPage n={10} />
    <SubPage n={11} />
    <Exercises n={12} />
    <ComparePage n={13} />
    <CaterpillarPage n={14} />
    <Key n={15} />
    <Certificate booklet="חוברת החשבון 1–10" done="ספרתי עד 10, כתבתי מספרים, גזרתי והדבקתי, חיברתי וחיסרתי עם תמונות." cheer="כל הכבוד, אלוף/ת המספרים!" />
  </>
}
