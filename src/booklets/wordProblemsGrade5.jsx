import { AnswerKey, Certificate, Cover, Head, SvgPage } from './kit'
import { bookletBySlug } from './registry'
import { ADDSUB, ASKS, ENOUGH, EXTRA, LETTERS, MEASURE, MIXED, MONEY, MULDIV, OPS, OP_NAME, TABLE, TABLE_QS, TRUE_FALSE, enoughAnswer, equation } from './wordProblemsGrade5Data'

// "חוברת חשבון קלה — שאלות מילוליות בכיתה ה׳ (חינוך מיוחד)": short, focused word problems built on reading
// strategies — finding the details (what is given, what is asked, which number is not needed, reading a table)
// and drawing conclusions (is it enough, what must be true, which operation). Then one-step practice with
// + − × ÷, money, time and measures. Answers are computed from wordProblemsGrade5Data.js.
const PAGES = bookletBySlug('word-problems-grade5-special-ed').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'
const R = 575

const Lines = ({ lines, y, bold, x = R }) => <g fontFamily={FONT} direction="rtl">
  {lines.map((l, i) => <text key={i} x={x} y={y + i * 26} fontSize="19" fontWeight={bold === i || (bold === 'last' && i === lines.length - 1) ? 800 : 400} textAnchor="start">{l}</text>)}
</g>
const Rule = ({ y }) => <path d={`M30 ${y} H570`} stroke="#ddd" strokeDasharray="5 6" />

function HowPage({ n }) {
  const steps = [['📖', 'קוראים את הסיפור פעמיים'], ['🔍', 'מסמנים קו מתחת לשאלה'], ['⭕', 'מקיפים את המספרים החשובים'], ['➕', 'בוחרים פעולה: + − × ÷'], ['✅', 'פותרים ובודקים: האם התשובה הגיונית?']]
  return <SvgPage label="איך פותרים שאלה מילולית">
    <Head n={n} title="איך פותרים שאלה מילולית?" instruction="חמישה צעדים. עושים אותם בכל שאלה, בכל פעם" />
    {steps.map(([e, t], i) => { const y = 135 + i * 108; return <g key={i} fontFamily={FONT}>
      <rect x="40" y={y} width="520" height="88" rx="16" fill="white" stroke={INK} strokeWidth="2" />
      <circle cx="526" cy={y + 44} r="24" fill="white" stroke={INK} strokeWidth="2.5" /><text x="526" y={y + 56} fontSize="30" fontWeight="800" textAnchor="middle">{i + 1}</text>
      <text x="485" y={y + 53} fontSize="23" fontWeight="700" textAnchor="start" direction="rtl">{t}</text>
      <text x="85" y={y + 57} fontSize="34" textAnchor="middle">{e}</text>
    </g> })}
    <text x="300" y="705" fontSize="18" fontFamily={FONT} textAnchor="middle" direction="rtl">איתור פרטים: מה נתון? מה שואלים?</text>
    <text x="300" y="733" fontSize="18" fontFamily={FONT} textAnchor="middle" direction="rtl">הסקת מסקנות: מה אפשר להבין מהסיפור, גם אם לא כתוב במפורש?</text>
  </SvgPage>
}

function GivenPage({ n }) {
  const ex = [
    ['דוגמה 1', ['בכיתה 30 תלמידים. 12 מהם בנים.', 'כמה בנות יש בכיתה?'], '30 תלמידים, 12 בנים', 'כמה בנות', '30 − 12 = 18'],
    ['דוגמה 2', ['בכל שקית 5 סוכריות. יש 4 שקיות.', 'כמה סוכריות יש בסך הכול?'], '5 בשקית, 4 שקיות', 'כמה סוכריות בסך הכול', '4 × 5 = 20'],
  ]
  const row = (y, label, text) => <g><text x="545" y={y} fontSize="17" fontWeight="800" textAnchor="start" direction="rtl">{label}</text><text x="440" y={y} fontSize="17" textAnchor="start" direction="rtl">{text}</text></g>
  return <SvgPage label="מה נתון ומה שואלים">
    <Head n={n} title="מה נתון? מה שואלים?" instruction="לפני שפותרים, מוצאים את שני החלקים של השאלה" />
    <g fontFamily={FONT}>
      {ex.map(([h, lines, given, asked, eqn], i) => { const y = 125 + i * 190; return <g key={h}>
        <rect x="35" y={y} width="530" height="172" rx="14" fill="white" stroke={INK} strokeWidth="2" />
        <text x="545" y={y + 26} fontSize="16" fontWeight="800" textAnchor="start" direction="rtl">{h}</text>
        <Lines lines={lines} y={y + 54} bold="last" x={545} />
        {row(y + 120, 'נתון:', given)}{row(y + 146, 'שואלים:', asked)}
        <text x="95" y={y + 146} fontSize="22" fontWeight="800" textAnchor="middle" direction="ltr">{eqn}</text>
      </g> })}
      <rect x="35" y="505" width="530" height="262" rx="14" fill="white" stroke={INK} strokeWidth="2" strokeDasharray="7 5" />
      <text x="545" y="531" fontSize="16" fontWeight="800" textAnchor="start" direction="rtl">עכשיו תורכם</text>
      <Lines lines={['לדנה יש 25 שקלים. היא הוציאה 10 שקלים.', 'כמה שקלים נשארו לה?']} y={560} bold="last" x={545} />
      <text x="545" y="640" fontSize="19" textAnchor="start" direction="rtl">נתון: ______________________</text>
      <text x="545" y="684" fontSize="19" textAnchor="start" direction="rtl">שואלים: ____________________</text>
      <text x="545" y="728" fontSize="19" textAnchor="start" direction="rtl">תרגיל ותשובה: ____ ___ ____ = ____</text>
    </g>
  </SvgPage>
}

// Circle-the-answer blocks: story lines, then three lettered options.
function ChoiceBlocks({ items, y0 = 125, step = 150, prompt }) {
  return <>{items.map((it, i) => { const y = y0 + i * step; return <g key={i} fontFamily={FONT} direction="rtl">
    <Lines lines={it.t} y={y} bold="last" />
    <text x="30" y={y} fontSize="14" fill="#6b7280" textAnchor="start" direction="ltr">{prompt}</text>
    {it.o.map((o, j) => { const oy = y + it.t.length * 26 + 6 + j * 30; return <g key={j}>
      <circle cx="555" cy={oy - 6} r="12" fill="white" stroke={INK} strokeWidth="2" /><text x="555" y={oy - 1} fontSize="14" fontWeight="800" textAnchor="middle">{LETTERS[j]}</text>
      <text x="530" y={oy} fontSize="18" textAnchor="start">{o}</text>
    </g> })}
    {i < items.length - 1 && <Rule y={y + step - 22} />}
  </g> })}</>
}

function AskPage({ n }) {
  return <SvgPage label="מה השאלה שואלת">
    <Head n={n} title="איתור פרטים: מה שואלים?" instruction="קוראים ומקיפים את האות של מה שצריך למצוא" />
    <ChoiceBlocks items={ASKS} step={160} />
  </SvgPage>
}

function ExtraPage({ n }) {
  return <SvgPage label="מספר שלא צריך">
    <Head n={n} title="איתור פרטים: מספר מיותר" instruction="בכל סיפור יש מספר אחד שלא צריך. מקיפים אותו" />
    {EXTRA.map((it, i) => { const y = 130 + i * 168; return <g key={i}>
      <Lines lines={[...it.t, it.q]} y={y} bold="last" />
      {it.n.map((num, j) => <g key={j}><circle cx={440 - j * 130} cy={y + 112} r="27" fill="white" stroke="#6b7280" strokeWidth="2" /><text x={440 - j * 130} y={y + 121} fontSize="24" fontWeight="800" fontFamily={FONT} textAnchor="middle">{num}</text></g>)}
      {i < EXTRA.length - 1 && <Rule y={y + 150} />}
    </g> })}
  </SvgPage>
}

function TablePage({ n }) {
  return <SvgPage label="קוראים טבלה">
    <Head n={n} title="איתור פרטים: קוראים טבלה" instruction="כמה ספרים קראו ארבעה ילדים בחודש אחד? עונים לפי הטבלה" />
    <g fontFamily={FONT} direction="rtl" textAnchor="middle">
      <rect x="150" y="125" width="300" height="42" fill="#eee" stroke={INK} strokeWidth="2" />
      <text x="375" y="153" fontSize="19" fontWeight="800">שם</text><text x="225" y="153" fontSize="19" fontWeight="800">מספר ספרים</text>
      {TABLE.map(([name, k], i) => <g key={name}>
        <rect x="150" y={167 + i * 42} width="300" height="42" fill="white" stroke={INK} strokeWidth="2" />
        <path d={`M300 ${167 + i * 42} V${209 + i * 42}`} stroke={INK} strokeWidth="2" />
        <text x="375" y={195 + i * 42} fontSize="20">{name}</text><text x="225" y={195 + i * 42} fontSize="20" fontWeight="700">{k}</text>
      </g>)}
    </g>
    {TABLE_QS.map((it, i) => { const y = 400 + i * 74; return <g key={i} fontFamily={FONT} direction="rtl">
      <text x={R} y={y} fontSize="19" fontWeight="700" textAnchor="start">{i + 1}. {it.q}</text>
      <text x={R} y={y + 36} fontSize="19" textAnchor="start">תשובה: ____________</text>
    </g> })}
  </SvgPage>
}

function EnoughPage({ n }) {
  return <SvgPage label="מספיק או לא מספיק">
    <Head n={n} title="הסקת מסקנות: מספיק או לא?" instruction="משווים בין שני המספרים. מקיפים, וכותבים כמה נשאר או כמה חסר" />
    {ENOUGH.map((it, i) => { const y = 130 + i * 134; return <g key={i} fontFamily={FONT} direction="rtl">
      <Lines lines={[...it[0], 'האם זה מספיק?']} y={y} bold="last" />
      <text x="190" y={y + 26} fontSize="21" fontWeight="800" textAnchor="middle">מספיק</text>
      <text x="80" y={y + 26} fontSize="21" fontWeight="800" textAnchor="middle">לא מספיק</text>
      <text x="190" y={y + 60} fontSize="16" textAnchor="middle">נשארים/חסרים: ____</text>
      {i < ENOUGH.length - 1 && <Rule y={y + 100} />}
    </g> })}
  </SvgPage>
}

function TruePage({ n }) {
  return <SvgPage label="מה נכון">
    <Head n={n} title="הסקת מסקנות: מה נכון?" instruction="קוראים את הסיפור ומקיפים את המשפט היחיד שנכון" />
    <ChoiceBlocks items={TRUE_FALSE} step={160} />
  </SvgPage>
}

function OpsPage({ n }) {
  const names = Object.values(OP_NAME)
  return <SvgPage label="איזו פעולה">
    <Head n={n} title="איזו פעולה מתאימה?" instruction="קוראים ומקיפים: חיבור, חיסור, כפל או חילוק" />
    {OPS.map(([lines], i) => { const y = 128 + i * 108; return <g key={i} fontFamily={FONT} direction="rtl">
      <Lines lines={lines} y={y} bold="last" />
      {names.map((o, j) => <text key={o} x={500 - j * 140} y={y + 80} fontSize="22" fontWeight="800" textAnchor="middle">{o}</text>)}
      {i < OPS.length - 1 && <Rule y={y + 94} />}
    </g> })}
  </SvgPage>
}

function SolvePage({ n, title, instruction, items }) {
  const step = items.length === 4 ? 160 : 210
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map(([s, q, , , op, unit], i) => { const y = 130 + i * step; return <g key={i} fontFamily={FONT}>
      <Lines lines={[s, q]} y={y} bold="last" />
      <text x={R} y={y + 76} fontSize="17" textAnchor="start" direction="rtl">נתון: ____________________________</text>
      <text x="300" y={y + 116} fontSize="25" fontWeight="800" textAnchor="middle" direction="ltr" style={{ whiteSpace: 'pre' }}>{`___ ${op} ___ = ___`}</text>
      <text x={R} y={y + 150} fontSize="19" textAnchor="start" direction="rtl">תשובה: ________ {unit}</text>
      {i < items.length - 1 && <Rule y={y + step - 24} />}
    </g> })}
  </SvgPage>
}

export default function WordProblemsGrade5() {
  const key = items => items.map(([, , a, b, op]) => equation(a, b, op))
  return <>
    <Cover emoji="📖🔍🧮" title="חשבון קל: שאלות מילוליות" subtitle="כיתה ה׳ · חינוך מיוחד · איתור פרטים והסקת מסקנות" pages={PAGES}
      note="הסיפורים קצרים, המספרים עגולים ובכל שאלה צעד אחד. כדאי לעבוד עמוד אחד בכל פעם, לקרוא את הסיפור בקול ולבקש מהתלמיד להסביר במילים שלו מה שואלים. בעמודים 4–9 מתרגלים את האסטרטגיות עצמן, ובעמודים 10–14 משתמשים בהן כדי לפתור. מותר להשתמש בלוח הכפל ובמחשבון." />
    <HowPage n={2} />
    <GivenPage n={3} />
    <AskPage n={4} />
    <ExtraPage n={5} />
    <TablePage n={6} />
    <EnoughPage n={7} />
    <TruePage n={8} />
    <OpsPage n={9} />
    <SolvePage n={10} title="חיבור וחיסור" instruction="מקיפים את המספרים בסיפור, כותבים נתון, תרגיל ותשובה" items={ADDSUB} />
    <SolvePage n={11} title="כפל וחילוק" instruction="מקיפים את המספרים בסיפור, כותבים נתון, תרגיל ותשובה" items={MULDIV} />
    <SolvePage n={12} title="כסף וזמן" instruction="קוראים לאט, מסמנים קו מתחת לשאלה ופותרים" items={MONEY} />
    <SolvePage n={13} title="אורך, משקל וכמות" instruction="קוראים לאט, מסמנים קו מתחת לשאלה ופותרים" items={MEASURE} />
    <SolvePage n={14} title="שאלות מעורבות" instruction="קודם מחליטים איזו פעולה מתאימה. אחר כך פותרים" items={MIXED} />
    <AnswerKey n={15} sections={[
      { title: 'עמוד 3 — עכשיו תורכם', answers: ['25 − 10 = 15'] },
      { title: 'עמוד 4 — מה שואלים', answers: ASKS.map(it => `${LETTERS[it.a]}. ${it.o[it.a]}`) },
      { title: 'עמוד 5 — המספר המיותר', answers: EXTRA.map(it => `${it.x} (התרגיל: ${it.ex})`) },
      { title: 'עמוד 6 — קוראים טבלה', answers: TABLE_QS.map(it => it.a) },
      { title: 'עמוד 7 — מספיק או לא', answers: ENOUGH.map(enoughAnswer) },
      { title: 'עמוד 8 — מה נכון', answers: TRUE_FALSE.map(it => `${LETTERS[it.a]}. ${it.o[it.a]}`) },
      { title: 'עמוד 9 — איזו פעולה', answers: OPS.map(([, op]) => OP_NAME[op]) },
      { title: 'עמוד 10 — חיבור וחיסור', answers: key(ADDSUB) },
      { title: 'עמוד 11 — כפל וחילוק', answers: key(MULDIV) },
      { title: 'עמוד 12 — כסף וזמן', answers: key(MONEY) },
      { title: 'עמוד 13 — אורך, משקל וכמות', answers: key(MEASURE) },
      { title: 'עמוד 14 — שאלות מעורבות', answers: key(MIXED) },
    ]} />
    <Certificate booklet="חוברת שאלות מילוליות בחשבון" done="איתרתי פרטים, הסקתי מסקנות ופתרתי שאלות מילוליות בחיבור, חיסור, כפל וחילוק." cheer="פותר/ת בעיות מצטיין/ת! 🌟" />
  </>
}
