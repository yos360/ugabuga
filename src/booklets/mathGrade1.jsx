import { AnswerKey, Certificate, Cover, Head, SvgPage } from './kit'
import { bookletBySlug } from './registry'
import { FONT, INK, Problems, StoryPage, symbol } from './mathKit'

// "חוברת חשבון לכיתה א׳ — השוואה, חיבור וחיסור עד 20" — comparing numbers (<, >, =), adding and subtracting
// inside 20 with and without crossing ten, number families, comparing expressions and word problems.
// Every answer is computed from the data below, so the key cannot drift from the pages.
const PAGES = bookletBySlug('math-grade-1-compare').pages

const add = (a, b) => ({ text: `${a} + ${b} = ____`, ans: a + b })
const sub = (a, b) => ({ text: `${a} − ${b} = ____`, ans: a - b })
const missAdd = (a, t) => ({ text: `${a} + ____ = ${t}`, ans: t - a })
const missSub = (t, b) => ({ text: `${t} − ____ = ${b}`, ans: t - b })

// Compare two numbers: [a, b] → write <, > or =.
export const COMPARE = [[7, 12], [15, 9], [11, 11], [4, 14], [18, 8], [13, 16], [10, 10], [19, 17], [6, 16], [12, 20]]
// Circle the bigger / the smaller number: [a, b, 'big' | 'small'].
export const PICK = [[8, 13, 'big'], [17, 11, 'small'], [9, 19, 'big'], [14, 6, 'small'], [12, 15, 'big'], [20, 18, 'small'], [5, 10, 'big'], [16, 13, 'small']]
// Compare groups of pictures: [emoji, a, b] — a on the right, b on the left.
export const GROUPS = [['🍎', 9, 12], ['⭐', 14, 8], ['🐟', 11, 11], ['🎈', 7, 15]]
// Compare a sum with a number: [a, b, c] → a + b ◯ c.
export const SUM_VS_NUMBER = [[8, 5, 12], [6, 7, 13], [9, 9, 17], [7, 4, 10], [8, 8, 16], [5, 9, 15]]
export const ADD20 = [[9, 4], [8, 6], [7, 5], [12, 5], [13, 6], [6, 8], [9, 9], [14, 3], [7, 7], [8, 5], [11, 8], [9, 6]].map(p => add(...p))
export const SUB10 = [[9, 4], [10, 3], [8, 5], [7, 2], [6, 6], [10, 7], [9, 1], [8, 3], [10, 5], [7, 4]].map(p => sub(...p))
export const SUB_NO_CROSS = [[17, 5], [15, 3], [19, 6], [14, 4], [18, 7], [16, 2], [13, 3], [18, 8], [19, 9], [15, 4], [12, 1], [17, 6]].map(p => sub(...p))
export const SUB_CROSS = [[13, 5], [15, 8], [12, 4], [14, 6], [11, 3], [16, 9], [13, 7], [17, 8], [12, 7], [15, 6], [14, 9], [11, 5]].map(p => sub(...p))
// Number families: [a, b] → total a + b; four exercises each.
export const FAMILIES = [[6, 9], [7, 8], [5, 12], [4, 9], [8, 9], [6, 11]]
export const MISSING = [missAdd(7, 15), missAdd(9, 13), missAdd(8, 17), missSub(15, 7), missSub(18, 9), missSub(13, 6), missAdd(6, 14), missSub(12, 5), missAdd(5, 11), missSub(20, 12)]
// Compare two expressions: [op1, a, b, op2, c, d] → a ± b ◯ c ± d.
export const EXPRS = [['+', 9, 6, '−', 18, 4], ['−', 14, 5, '+', 4, 4], ['+', 7, 8, '−', 19, 3], ['−', 16, 7, '−', 15, 6], ['+', 6, 6, '+', 5, 8], ['−', 20, 9, '+', 5, 5]]
const val = (o, a, b) => o === '+' ? a + b : a - b
export const STORIES = [
  { q: 'לנועה יש 9 מדבקות של חתולים ו־6 מדבקות של כלבים. כמה מדבקות יש לה בסך הכול?', ex: add(9, 6) },
  { q: 'בכיתה א׳ 8 בנות ו־9 בנים. כמה ילדים יש בכיתה?', ex: add(8, 9) },
  { q: 'בקערה היו 15 תפוחים. הילדים אכלו 6 תפוחים. כמה תפוחים נשארו בקערה?', ex: sub(15, 6) },
  { q: 'בחצר 13 ציפורים. 5 ציפורים עפו. כמה ציפורים נשארו בחצר?', ex: sub(13, 5) },
  { q: 'יונתן קרא ביום ראשון 7 עמודים וביום שני עוד 8 עמודים. כמה עמודים קרא בשני הימים?', ex: add(7, 8) },
  { q: 'לתמר היו 17 שקלים. היא קנתה מחברת ב־9 שקלים. כמה שקלים נשארו לה?', ex: sub(17, 9) },
].map(s => ({ q: s.q, ans: `${s.ex.text.replace('____', s.ex.ans)}` }))
// Who has more? [story, name a, count a, name b, count b]; the child writes who and by how many.
export const COMPARE_STORIES = [
  { q: 'לדניאל יש 14 קלפים ולרון יש 9 קלפים. למי יש יותר קלפים? בכמה יותר?', who: 'דניאל', diff: 5 },
  { q: 'מיכל אספה 8 צדפים ויעל אספה 12 צדפים. מי אספה פחות צדפים? בכמה פחות?', who: 'מיכל', diff: 4 },
  { q: 'באוטובוס הראשון 16 נוסעים ובאוטובוס השני 11 נוסעים. באיזה אוטובוס יש יותר נוסעים? בכמה יותר?', who: 'באוטובוס הראשון', diff: 5 },
  { q: 'לאלון יש 13 גולות ולשירה יש 13 גולות. למי יש יותר? בכמה?', who: 'לאף אחד, יש להם אותו מספר', diff: 0 },
  { q: 'בגינה 18 פרחים אדומים ו־10 פרחים צהובים. איזה צבע יש בו פחות פרחים? בכמה פחות?', who: 'הצהובים', diff: 8 },
]

const COMPARE_INSTRUCTION = 'כותבים בעיגול: <  (קטן מ)  או  >  (גדול מ)  או  =  (שווה)'

function CompareNumbers({ n }) {
  return <SvgPage label="משווים מספרים">
    <Head n={n} title="גדול מ, קטן מ או שווה" instruction={COMPARE_INSTRUCTION} />
    {COMPARE.map(([a, b], i) => {
      const col = i % 2, row = Math.floor(i / 2), y = 190 + row * 118, cx = col ? 150 : 450
      return <g key={i} fontFamily={FONT} fontSize="34" fontWeight="700" textAnchor="middle" direction="ltr">
        <text x={cx - 80} y={y + 12}>{a}</text>
        <circle cx={cx} cy={y} r="26" fill="white" stroke={INK} strokeWidth="2.5" />
        <text x={cx + 80} y={y + 12}>{b}</text>
      </g>
    })}
  </SvgPage>
}

function PickPage({ n }) {
  return <SvgPage label="מקיפים את הגדול או הקטן">
    <Head n={n} title="מי הגדול ומי הקטן?" instruction="קוראים מה כתוב ליד השורה ומקיפים את המספר הנכון" />
    {PICK.map(([a, b, ask], i) => { const y = 180 + i * 85; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <text x="520" y={y + 10} fontSize="20" fontWeight="800">{ask === 'big' ? 'המספר הגדול:' : 'המספר הקטן:'}</text>
      <text x="300" y={y + 14} fontSize="40" fontWeight="800" direction="ltr">{a}</text>
      <text x="150" y={y + 14} fontSize="40" fontWeight="800" direction="ltr">{b}</text>
    </g> })}
  </SvgPage>
}

function GroupsPage({ n }) {
  return <SvgPage label="משווים קבוצות">
    <Head n={n} title="משווים קבוצות" instruction="סופרים כל קבוצה וכותבים בעיגול: <  או  >  או  =" />
    {GROUPS.map(([e, a, b], i) => { const y = 135 + i * 170; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {[[a, 560], [b, 270]].map(([k, x0]) => <g key={x0}>{Array.from({ length: k }, (_, j) =>
        <text key={j} x={x0 - (j % 5) * 40} y={y + 34 + Math.floor(j / 5) * 38} fontSize="30">{e}</text>)}</g>)}
      <circle cx="40" cy={y + 52} r="24" fill="white" stroke={INK} strokeWidth="2.5" />
      {i < GROUPS.length - 1 && <path d={`M30 ${y + 152} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function SumVsNumberPage({ n }) {
  return <SvgPage label="תרגיל מול מספר">
    <Head n={n} title="מחשבים ומשווים" instruction="מחשבים את התרגיל וכותבים בעיגול: <  או  >  או  =" />
    {SUM_VS_NUMBER.map(([a, b, c], i) => { const y = 190 + i * 100; return <g key={i} fontFamily={FONT} fontSize="34" fontWeight="700" textAnchor="middle" direction="ltr">
      <text x="420" y={y + 12}>{`${a} + ${b}`}</text>
      <circle cx="290" cy={y} r="26" fill="white" stroke={INK} strokeWidth="2.5" />
      <text x="170" y={y + 12}>{c}</text>
    </g> })}
  </SvgPage>
}

function FamiliesPage({ n }) {
  return <SvgPage label="משפחות מספרים">
    <Head n={n} title="משפחות מספרים" instruction="שלושה מספרים, ארבעה תרגילים. משלימים את כל התרגילים של המשפחה" />
    {FAMILIES.map(([a, b], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 25 : 305, y = 135 + row * 215, t = a + b
      return <g key={i} fontFamily={FONT} textAnchor="middle">
        <rect x={x} y={y} width="270" height="195" rx="14" fill="white" stroke={INK} strokeWidth="2" />
        <path d={`M${x + 135} ${y + 10} L${x + 65} ${y + 52} H${x + 205} Z`} fill="none" stroke={INK} strokeWidth="2" />
        <text x={x + 135} y={y + 44} fontSize="22" fontWeight="800">{t}</text>
        <text x={x + 62} y={y + 80} fontSize="22" fontWeight="800">{a}</text>
        <text x={x + 208} y={y + 80} fontSize="22" fontWeight="800">{b}</text>
        {[`${a} + ${b} = ____`, `${b} + ${a} = ____`, `${t} − ${a} = ____`, `${t} − ${b} = ____`].map((s, j) =>
          <text key={j} x={x + 135} y={y + 112 + j * 27} fontSize="20" fontWeight="700" direction="ltr">{s}</text>)}
      </g>
    })}
  </SvgPage>
}

function ExprPage({ n }) {
  return <SvgPage label="משווים תרגילים">
    <Head n={n} title="משווים תרגילים" instruction="מחשבים את שני הצדדים וכותבים בעיגול: <  או  >  או  =" />
    {EXPRS.map(([o1, a, b, o2, c, d], i) => { const y = 190 + i * 100; return <g key={i} fontFamily={FONT} fontSize="32" fontWeight="700" textAnchor="middle" direction="ltr">
      <text x="440" y={y + 11}>{`${a} ${o1 === '+' ? '+' : '−'} ${b}`}</text>
      <circle cx="300" cy={y} r="26" fill="white" stroke={INK} strokeWidth="2.5" />
      <text x="160" y={y + 11}>{`${c} ${o2 === '+' ? '+' : '−'} ${d}`}</text>
    </g> })}
  </SvgPage>
}

function Key({ n }) {
  const list = items => items.map(it => String(it.ans))
  return <AnswerKey n={n} sections={[
    { title: 'עמוד 2 — גדול מ, קטן מ או שווה', answers: COMPARE.map(([a, b]) => `${a} ${symbol(a, b)} ${b}`) },
    { title: 'עמוד 3 — מי הגדול ומי הקטן', answers: PICK.map(([a, b, ask]) => String(ask === 'big' ? Math.max(a, b) : Math.min(a, b))) },
    { title: 'עמוד 4 — משווים קבוצות', answers: GROUPS.map(([, a, b]) => `${a} ${symbol(a, b)} ${b}`) },
    { title: 'עמוד 5 — מחשבים ומשווים', answers: SUM_VS_NUMBER.map(([a, b, c]) => `${a + b} ${symbol(a + b, c)} ${c}`) },
    { title: 'עמוד 6 — חיבור עד 20', answers: list(ADD20) },
    { title: 'עמוד 7 — חיסור בעשרת הראשונה', answers: list(SUB10) },
    { title: 'עמוד 8 — חיסור בלי מעבר עשרת', answers: list(SUB_NO_CROSS) },
    { title: 'עמוד 9 — חיסור עם מעבר עשרת', answers: list(SUB_CROSS) },
    { title: 'עמוד 10 — משפחות מספרים (לפי הסדר בכל משפחה)', answers: FAMILIES.map(([a, b]) => `${a} + ${b} = ${a + b}, ${b} + ${a} = ${a + b}, ${a + b} − ${a} = ${b}, ${a + b} − ${b} = ${a}`) },
    { title: 'עמוד 11 — המספר החסר', answers: list(MISSING) },
    { title: 'עמוד 12 — משווים תרגילים', answers: EXPRS.map(([o1, a, b, o2, c, d]) => `${val(o1, a, b)} ${symbol(val(o1, a, b), val(o2, c, d))} ${val(o2, c, d)}`) },
    { title: 'עמוד 13 — שאלות מילוליות', answers: STORIES.map(s => s.ans) },
    { title: 'עמוד 14 — מי יותר, מי פחות', answers: COMPARE_STORIES.map(s => s.diff ? `${s.who}, ${s.diff}` : s.who) },
  ]} />
}

export default function MathGrade1Booklet() {
  return <>
    <Cover emoji="⚖️➕➖" title="חוברת חשבון לכיתה א׳" subtitle="16 עמודים: גדול מ, קטן מ ושווה, חיבור וחיסור עד 20 ושאלות מילוליות" pages={PAGES}
      note="הסימנים < ו־> מבלבלים כמעט כל ילד בהתחלה. טריק שעוזר: 'הפה' של הסימן תמיד פתוח לצד המספר הגדול, כמו תנין שרוצה לאכול את הקבוצה הגדולה. עמוד אחד או שניים בכל פעם מספיקים, ואפשר להיעזר בקוביות, באצבעות או בקו מספרים." />
    <CompareNumbers n={2} />
    <PickPage n={3} />
    <GroupsPage n={4} />
    <SumVsNumberPage n={5} />
    <Problems n={6} title="חיבור עד 20" instruction="משלימים לעשר ואחר כך מוסיפים את השאר" items={ADD20} />
    <Problems n={7} title="חיסור בעשרת הראשונה" instruction="פותרים את התרגילים" items={SUB10} />
    <Problems n={8} title="חיסור בלי מעבר עשרת" instruction="מחסרים את האחדות ושומרים על העשרת" items={SUB_NO_CROSS} />
    <Problems n={9} title="חיסור עם מעבר עשרת" instruction="קודם יורדים ל־10 ואחר כך מחסרים את השאר" items={SUB_CROSS} />
    <FamiliesPage n={10} />
    <Problems n={11} title="המספר החסר" instruction="כותבים את המספר שחסר בתרגיל" items={MISSING} />
    <ExprPage n={12} />
    <StoryPage n={13} title="שאלות מילוליות: חיבור וחיסור" instruction="כותבים תרגיל ותשובה" items={STORIES} />
    <StoryPage n={14} title="מי יותר ומי פחות?" instruction="כותבים מי ובכמה" items={COMPARE_STORIES} />
    <Key n={15} />
    <Certificate booklet="חוברת חשבון לכיתה א׳" done="השוויתי מספרים, חיברתי וחיסרתי עד 20 ופתרתי שאלות מילוליות." cheer="כל הכבוד, אלופ/ת חשבון!" />
  </>
}
