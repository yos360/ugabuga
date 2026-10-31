import { coloringSrc } from '../data/coloringSubjects'
import { AnswerKey, Certificate, Cover, Head, ImagePage, Pic, SvgPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "שאלות מילוליות בעשרת הראשונה — כיתה א׳ חינוך מיוחד" — short story problems within 10, one idea per row:
// a how-to page, signal words, adding and subtracting stories with a picture group for every problem,
// choosing + or −, choosing the matching equation, completing to ten, comparing two children, drawing
// and solving, a colouring page, answers and a certificate. Numbers appear as digits inside the sentence,
// and every answer is computed from the data below so the key cannot drift.
const PAGES = bookletBySlug('word-problems-special-ed').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

// [story line, question line, emoji, a, b] — a + b, all within 10.
export const ADD_A = [
  ['לנועה יש 3 תפוחים. אמא נתנה לה עוד 2.', 'כמה תפוחים יש לה בסך הכול?', '🍎', 3, 2],
  ['לדני יש 4 כדורים. הוא מצא עוד 1.', 'כמה כדורים יש לו עכשיו?', '⚽', 4, 1],
  ['יעל אפתה 5 עוגיות ואחותה אפתה 3.', 'כמה עוגיות יש ביחד?', '🍪', 5, 3],
  ['על העץ יש 2 ציפורים. הגיעו עוד 4.', 'כמה ציפורים יש על העץ?', '🐦', 2, 4],
]
export const ADD_B = [
  ['לעומר יש 6 בלונים. אבא קנה לו עוד 3.', 'כמה בלונים יש לעומר?', '🎈', 6, 3],
  ['בחניה יש 4 אופניים. הגיעו עוד 4.', 'כמה אופניים יש בחניה?', '🚲', 4, 4],
  ['מיכל קנתה 7 בננות ועוד 2 בננות.', 'כמה בננות קנתה בסך הכול?', '🍌', 7, 2],
  ['בגינה יש 5 פרחים אדומים ו־5 צהובים.', 'כמה פרחים יש בגינה?', '🌷', 5, 5],
]
// [story line, question line, emoji, a, b] — a − b.
export const SUB_A = [
  ['לאלון היו 5 סופגניות. הוא אכל 2.', 'כמה סופגניות נשארו לו?', '🍩', 5, 2],
  ['לתמר היו 6 בלונים. 1 עף לשמיים.', 'כמה בלונים נשארו לה?', '🎈', 6, 1],
  ['באקווריום שחו 7 דגים. 3 התחבאו.', 'כמה דגים עדיין רואים?', '🐟', 7, 3],
  ['בסל היו 8 תפוחים. הילדים לקחו 5.', 'כמה תפוחים נשארו בסל?', '🍎', 8, 5],
]
export const SUB_B = [
  ['בחניה עמדו 9 מכוניות. 4 נסעו.', 'כמה מכוניות נשארו?', '🚗', 9, 4],
  ['לרוני היו 10 סוכריות. היא נתנה 6.', 'כמה סוכריות נשארו לה?', '🍬', 10, 6],
  ['בלול היו 4 אפרוחים. 1 יצא החוצה.', 'כמה אפרוחים נשארו בלול?', '🐥', 4, 1],
  ['על השולחן יש 7 בננות. אורי אכל 2.', 'כמה בננות נשארו?', '🍌', 7, 2],
]
// Mixed page: [story, question, emoji, a, b, op].
export const MIXED = [
  ['בקערה יש 6 תותים. הוספנו עוד 4.', 'כמה תותים יש עכשיו?', '🍓', 6, 4, '+'],
  ['בבריכה היו 9 צפרדעים. 3 קפצו החוצה.', 'כמה צפרדעים נשארו?', '🐸', 9, 3, '−'],
  ['לגיא יש 3 קוביות ולאחיו יש 6.', 'כמה קוביות יש להם ביחד?', '🧱', 3, 6, '+'],
  ['לארנב היו 8 גזרים. הוא אכל 4.', 'כמה גזרים נשארו לו?', '🥕', 8, 4, '−'],
]
// Which operation? [sentence, op]
export const CHOOSE_OP = [
  ['הגיעו עוד 3 ילדים לגן', '+'], ['אכלנו 2 מתוך 5 עוגיות', '−'], ['קנינו עוד 4 בלונים', '+'],
  ['3 ציפורים עפו מהעץ', '−'], ['אבא נתן לי עוד 2 שקלים', '+'], ['מ־6 צבעים נאבדו 2', '−'],
]
// Which equation? [story, a, b, op]
export const EQUATION = [
  ['ליעל יש 4 מדבקות. היא קיבלה עוד 3.', 4, 3, '+'],
  ['ברכב היו 8 נוסעים. 2 ירדו.', 8, 2, '−'],
  ['יש 5 לימונים ו־4 תפוזים.', 5, 4, '+'],
  ['על הענף ישבו 9 ציפורים. 5 עפו.', 9, 5, '−'],
  ['לאורי יש 6 קוביות. הוא קיבל עוד 2.', 6, 2, '+'],
]
// Complete to ten: [story, question, emoji, how many are already there].
export const TO_TEN = [
  ['ירדן אספה 7 צדפים. היא רוצה לאסוף 10.', 'כמה צדפים חסרים?', '🐚', 7],
  ['בקופסה יש 6 עפרונות. צריך 10.', 'כמה עפרונות להוסיף?', '✏️', 6],
  ['על הצלחת יש 8 עוגיות. צריך 10.', 'כמה עוגיות להוסיף?', '🍪', 8],
  ['בגן יש 5 פרחים. רוצים לשתול 10.', 'כמה פרחים צריך עוד?', '🌷', 5],
]
// Who has more / fewer? [story, question, [name, count] × 2, emoji, 'more' | 'less']
export const COMPARE = [
  ['לדני יש 3 כדורים ולנועה יש 5.', 'למי יש יותר כדורים?', ['דני', 3], ['נועה', 5], '⚽', 'more'],
  ['לעמית יש 7 מדבקות ולרוני יש 4.', 'למי יש פחות מדבקות?', ['עמית', 7], ['רוני', 4], '⭐', 'less'],
  ['מיכל קנתה 6 בלונים ואחמד קנה 8.', 'מי קנה יותר בלונים?', ['מיכל', 6], ['אחמד', 8], '🎈', 'more'],
  ['לתמר יש 9 עפרונות ולאיתי יש 5.', 'למי יש פחות עפרונות?', ['תמר', 9], ['איתי', 5], '✏️', 'less'],
  ['לשירה יש 2 חתולים ולמוחמד יש 3.', 'למי יש יותר חתולים?', ['שירה', 2], ['מוחמד', 3], '🐱', 'more'],
]
// Draw and solve: [story, question, a, b, op]
export const DRAW = [
  ['בגינה יש 4 פרחים. פרחו עוד 3.', 'ציירו ופתרו: כמה פרחים יש?', 4, 3, '+'],
  ['בצלחת יש 8 תותים. אכלנו 3.', 'ציירו ופתרו: כמה תותים נשארו?', 8, 3, '−'],
  ['אורי צייר 5 כוכבים ועוד 5 כוכבים.', 'ציירו ופתרו: כמה כוכבים יש?', 5, 5, '+'],
  ['על הגג ישבו 6 יונים. 4 עפו.', 'ציירו ופתרו: כמה יונים נשארו?', 6, 4, '−'],
]

export const result = (a, b, op) => op === '+' ? a + b : a - b
const eq = (a, b, op) => `${a} ${op} ${b}`

// n small pictures, rows of up to `perRow`, from the right edge x going left.
function Group({ emoji, n, x, y, size, perRow = 10, crossed = 0 }) {
  const step = size + 4
  return <g>{Array.from({ length: n }, (_, i) => {
    const cx = x - (i % perRow) * step, cy = y + Math.floor(i / perRow) * step
    return <g key={i}>
      <Pic item={{ emoji }} x={cx} y={cy} size={size} />
      {i >= n - crossed && <path d={`M${cx - size / 2} ${cy - size / 2} L${cx + size / 2} ${cy + size / 2} M${cx + size / 2} ${cy - size / 2} L${cx - size / 2} ${cy + size / 2}`} stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />}
    </g>
  })}</g>
}

const Story = ({ x = 575, y, s, q }) => <g fontFamily={FONT} direction="rtl">
  <text x={x} y={y} fontSize="19" textAnchor="start">{s}</text>
  <text x={x} y={y + 27} fontSize="19" fontWeight="800" textAnchor="start">{q}</text>
</g>

// Four story problems per page: sentence, question, a picture group (crossed-out for subtraction), blank equation.
function StoryPage({ n, title, instruction, items, op }) {
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map(([s, q, e, a, b, o], i) => {
      const y = 130 + i * 168, sign = o || op
      return <g key={i}>
        <Story y={y + 22} s={s} q={q} />
        {sign === '+'
          ? <><Group emoji={e} n={a} x={555} y={y + 90} size={32} /><text x={555 - a * 36 - 8} y={y + 102} fontSize="30" fontWeight="800" fontFamily={FONT} textAnchor="middle">+</text><Group emoji={e} n={b} x={555 - a * 36 - 38} y={y + 90} size={32} /></>
          : <Group emoji={e} n={a} x={555} y={y + 90} size={32} crossed={b} />}
        <text x="300" y={y + 148} fontSize="27" fontWeight="800" fontFamily={FONT} textAnchor="middle" direction="ltr" style={{ whiteSpace: 'pre' }}>{`___ ${sign} ___ = ___`}</text>
        {i < items.length - 1 && <path d={`M30 ${y + 160} H570`} stroke="#ddd" strokeDasharray="5 6" />}
      </g>
    })}
  </SvgPage>
}

function HowPage({ n }) {
  const steps = [['📖', 'קוראים את הסיפור לאט'], ['🖼️', 'מסתכלים בתמונה'], ['🔍', 'מקיפים את המספרים בסיפור'], ['➕➖', 'בוחרים: חיבור או חיסור'], ['✏️', 'כותבים את התרגיל']]
  return <SvgPage label="איך פותרים שאלה מילולית">
    <Head n={n} title="איך פותרים שאלה מילולית?" instruction="חמישה צעדים קטנים. עושים אותם בכל שאלה" />
    {steps.map(([e, t], i) => { const y = 150 + i * 98; return <g key={i} fontFamily={FONT}>
      <rect x="40" y={y} width="520" height="80" rx="16" fill="white" stroke={INK} strokeWidth="2" />
      <circle cx="528" cy={y + 40} r="24" fill="white" stroke={INK} strokeWidth="2.5" /><text x="528" y={y + 52} fontSize="32" fontWeight="800" textAnchor="middle">{i + 1}</text>
      <text x="485" y={y + 49} fontSize="24" fontWeight="700" textAnchor="start">{t}</text>
      <text x="110" y={y + 53} fontSize="38" textAnchor="middle">{e}</text>
    </g> })}
    <text x="300" y="672" fontSize="19" fontFamily={FONT} textAnchor="middle" direction="rtl">למשל: "ל־3 ילדים הצטרפו עוד 2" — מקיפים 3 ו־2, ומחברים.</text>
    <Group emoji="🧒" n={3} x={430} y={730} size={42} /><text x="300" y="740" fontSize="34" fontWeight="800" fontFamily={FONT} textAnchor="middle">+</text><Group emoji="🧒" n={2} x={215} y={730} size={42} />
  </SvgPage>
}

function WordsPage({ n }) {
  const boxes = [['חיבור  ➕', ['עוד', 'ביחד', 'בסך הכול', 'הצטרפו', 'קיבל'], 'ביחד', 140], ['חיסור  ➖', ['נשארו', 'אכל', 'הלכו', 'עפו', 'נתן'], 'נשארו', 430]]
  return <SvgPage label="מילים שעוזרות">
    <Head n={n} title="מילים שעוזרות" instruction="כשרואים את המילים האלה בסיפור, יודעים מה לעשות" />
    {boxes.map(([label, words, , y], bi) => <g key={bi} fontFamily={FONT} direction="rtl">
      <rect x="40" y={y} width="520" height="260" rx="18" fill="white" stroke={INK} strokeWidth="2.5" />
      <text x="300" y={y + 46} fontSize="30" fontWeight="800" textAnchor="middle">{label}</text>
      {words.map((w, i) => <g key={w}><rect x={i % 2 ? 80 : 320} y={y + 70 + Math.floor(i / 2) * 58} width="200" height="46" rx="23" fill="white" stroke="#6b7280" strokeWidth="2" /><text x={i % 2 ? 180 : 420} y={y + 101 + Math.floor(i / 2) * 58} fontSize="23" fontWeight="700" textAnchor="middle">{w}</text></g>)}
    </g>)}
  </SvgPage>
}

function OpPage({ n, seed }) {
  return <SvgPage label="מחברים או מחסרים">
    <Head n={n} title="מחברים או מחסרים?" instruction="קוראים את המשפט ומקיפים: חיבור (+) או חיסור (−)" />
    {CHOOSE_OP.map(([s, , ], i) => {
      const y = 140 + i * 110, opts = rngFor(seed, 80 + i).shuffle(['חיבור', 'חיסור'])
      return <g key={i} fontFamily={FONT} direction="rtl">
        <text x="570" y={y + 36} fontSize="22" fontWeight="700" textAnchor="start">{s}</text>
        {opts.map((o, j) => <text key={o} x={400 - j * 220} y={y + 86} fontSize="28" fontWeight="800" textAnchor="middle">{o}</text>)}
        {i < CHOOSE_OP.length - 1 && <path d={`M30 ${y + 104} H570`} stroke="#ddd" strokeDasharray="5 6" />}
      </g>
    })}
  </SvgPage>
}

// Three candidate equations: the right one, the other operation, and a wrong second number.
export function equationOptions([, a, b, op]) {
  const other = op === '+' ? '−' : '+'
  const b2 = op === '+' ? (a + b + 1 <= 10 ? b + 1 : b - 1) : (b + 1 <= a ? b + 1 : b - 1)
  return [eq(a, b, op), eq(a, b, other), eq(a, b2, op)]
}

function EquationPage({ n, seed }) {
  return <SvgPage label="איזה תרגיל מתאים">
    <Head n={n} title="איזה תרגיל מתאים?" instruction="קוראים את הסיפור ומקיפים את התרגיל הנכון" />
    {EQUATION.map((it, i) => {
      const y = 135 + i * 132, opts = rngFor(seed, 90 + i).shuffle(equationOptions(it))
      return <g key={i} fontFamily={FONT}>
        <text x="570" y={y + 34} fontSize="21" fontWeight="700" textAnchor="start" direction="rtl">{it[0]}</text>
        {opts.map((o, j) => <text key={o} x={470 - j * 170} y={y + 94} fontSize="32" fontWeight="800" textAnchor="middle" direction="ltr">{o}</text>)}
        {i < EQUATION.length - 1 && <path d={`M30 ${y + 118} H570`} stroke="#ddd" strokeDasharray="5 6" />}
      </g>
    })}
  </SvgPage>
}

// A ten-frame with `a` pictures; the empty squares are the missing ones.
function ToTenPage({ n }) {
  return <SvgPage label="משלימים לעשר">
    <Head n={n} title="משלימים לעשר" instruction="מסתכלים במסגרת: כמה משבצות ריקות? כותבים את המספר" />
    {TO_TEN.map(([s, q, e, a], i) => {
      const y = 130 + i * 168
      return <g key={i}>
        <Story y={y + 22} s={s} q={q} />
        {Array.from({ length: 10 }, (_, j) => { const cx = 555 - (j % 5) * 46 - 23, cy = y + 66 + Math.floor(j / 5) * 46 + 23; return <g key={j}>
          <rect x={cx - 23} y={cy - 23} width="46" height="46" fill="white" stroke="#6b7280" strokeWidth="2.5" />
          {j < a && <Pic item={{ emoji: e }} x={cx} y={cy} size={32} />}
        </g> })}
        <text x="205" y={y + 120} fontSize="25" fontWeight="800" fontFamily={FONT} textAnchor="middle" direction="rtl">חסרים:</text>
        <rect x="70" y={y + 88} width="80" height="56" fill="white" stroke={INK} strokeWidth="2.5" />
        {i < TO_TEN.length - 1 && <path d={`M30 ${y + 160} H570`} stroke="#ddd" strokeDasharray="5 6" />}
      </g>
    })}
  </SvgPage>
}

function ComparePage({ n, seed }) {
  return <SvgPage label="מי יותר ומי פחות">
    <Head n={n} title="מי יותר? מי פחות?" instruction="סופרים את התמונות ומקיפים את השם הנכון" />
    {COMPARE.map(([s, q, p1, p2, e], i) => {
      const y = 125 + i * 134, opts = rngFor(seed, 100 + i).shuffle([p1, p2])
      return <g key={i} fontFamily={FONT}>
        <Story y={y + 20} s={s} q={q} />
        {opts.map(([name, k], j) => { const cx = 430 - j * 270; return <g key={name}>
          <text x={cx} y={y + 82} fontSize="25" fontWeight="800" textAnchor="middle" direction="rtl">{name}</text>
          <Group emoji={e} n={k} x={cx + Math.min(k, 5) * 13 - 13} y={y + 98} size={22} perRow={5} />
        </g> })}
        {i < COMPARE.length - 1 && <path d={`M30 ${y + 126} H570`} stroke="#ddd" strokeDasharray="5 6" />}
      </g>
    })}
  </SvgPage>
}

function DrawPage({ n }) {
  return <SvgPage label="ציירו ופתרו">
    <Head n={n} title="ציירו ופתרו" instruction="מציירים בריבוע את מה שקורה בסיפור, ואז כותבים את התרגיל" />
    {DRAW.map(([s, q, , , op], i) => {
      const y = 125 + i * 170
      return <g key={i}>
        <Story y={y + 20} s={s} q={q} />
        <rect x="40" y={y + 58} width="520" height="64" rx="12" fill="white" stroke="#6b7280" strokeWidth="2" strokeDasharray="6 5" />
        <text x="300" y={y + 156} fontSize="27" fontWeight="800" fontFamily={FONT} textAnchor="middle" direction="ltr" style={{ whiteSpace: 'pre' }}>{`___ ${op} ___ = ___`}</text>
      </g>
    })}
  </SvgPage>
}

export default function WordProblemsSpecialEd({ seed }) {
  const key = (items, op) => items.map(([, , , a, b, o]) => { const sign = o || op; return `${a} ${sign} ${b} = ${result(a, b, sign)}` })
  return <>
    <Cover emoji="📖🧮🍎" title="שאלות מילוליות בעשרת הראשונה" subtitle="כיתה א׳ חינוך מיוחד: סיפורים קצרים, איורים גדולים ומספרים עד 10" pages={PAGES}
      note="עמוד אחד בכל פעם, ובקצב של הילד. כדאי לקרוא את הסיפור בקול, להצביע על התמונות ולספור אותן ביחד לפני הכתיבה. אפשר לעבוד עם קוביות או כפתורים על השולחן. בכל סיפור המספרים כתובים בספרות ולא רק במילים." />
    <HowPage n={2} />
    <WordsPage n={3} />
    <StoryPage n={4} title="סיפורי חיבור (א)" instruction="קוראים, סופרים את התמונות וכותבים את התרגיל והתוצאה" items={ADD_A} op="+" />
    <StoryPage n={5} title="סיפורי חיבור (ב)" instruction="קוראים, סופרים את התמונות וכותבים את התרגיל והתוצאה" items={ADD_B} op="+" />
    <StoryPage n={6} title="סיפורי חיסור (א)" instruction="הקו האדום מראה מי הלך. כותבים את התרגיל והתוצאה" items={SUB_A} op="−" />
    <StoryPage n={7} title="סיפורי חיסור (ב)" instruction="הקו האדום מראה מי הלך. כותבים את התרגיל והתוצאה" items={SUB_B} op="−" />
    <OpPage n={8} seed={seed} />
    <EquationPage n={9} seed={seed} />
    <ToTenPage n={10} />
    <ComparePage n={11} seed={seed} />
    <DrawPage n={12} />
    <ImagePage n={13} title="🖍️ דף צביעה — פירות" instruction="צובעים לאט, בתוך הקווים" src={coloringSrc('fruits', 1)} alt="דף צביעה: פירות" />
    <StoryPage n={14} title="שאלות מעורבות" instruction="קודם מחליטים: חיבור או חיסור? אחר כך כותבים את התרגיל" items={MIXED} />
    <AnswerKey n={15} sections={[
      { title: 'עמוד 4 — סיפורי חיבור (א)', answers: key(ADD_A, '+') },
      { title: 'עמוד 5 — סיפורי חיבור (ב)', answers: key(ADD_B, '+') },
      { title: 'עמוד 6 — סיפורי חיסור (א)', answers: key(SUB_A, '−') },
      { title: 'עמוד 7 — סיפורי חיסור (ב)', answers: key(SUB_B, '−') },
      { title: 'עמוד 8 — חיבור או חיסור', answers: CHOOSE_OP.map(([, op]) => op === '+' ? 'חיבור' : 'חיסור') },
      { title: 'עמוד 9 — התרגיל המתאים', answers: EQUATION.map(([, a, b, op]) => eq(a, b, op)) },
      { title: 'עמוד 10 — משלימים לעשר', answers: TO_TEN.map(([, , , a]) => String(10 - a)) },
      { title: 'עמוד 11 — מי יותר, מי פחות', answers: COMPARE.map(([, , p1, p2, , kind]) => (kind === 'more' ? (p1[1] > p2[1] ? p1 : p2) : (p1[1] < p2[1] ? p1 : p2))[0]) },
      { title: 'עמוד 12 — ציירו ופתרו', answers: DRAW.map(([, , a, b, op]) => `${eq(a, b, op)} = ${result(a, b, op)}`) },
      { title: 'עמוד 14 — שאלות מעורבות', answers: key(MIXED) },
    ]} />
    <Certificate booklet="חוברת שאלות מילוליות" done="קראתי סיפורים קצרים, חיברתי וחסרתי עד 10 ופתרתי שאלות מילוליות." cheer="פותר/ת בעיות מצטיין/ת! 🌟" />
  </>
}
