import { AnswerKey, Certificate, Cover, Head, SvgPage } from './kit'
import { bookletBySlug } from './registry'
import { AVERAGE, CHALLENGE, DECIMALS, FIELD, FRACTIONS, LEAGUE, LEAGUE_QS, STADIUM, TIME, fmt, games, points } from './footballMathGrade5Data'

// "חשבון כדורגל לכיתה ה׳": grade 5 word problems told through football — a league table (points for wins and
// draws), area and perimeter of a pitch, multi-digit × and ÷, fractions of a quantity, decimals, time, average,
// and multi-step challenges. Answers are computed in footballMathGrade5Data.js.
const PAGES = bookletBySlug('football-math-grade-5').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'
const R = 575

const Rule = ({ y }) => <path d={`M30 ${y} H570`} stroke="#ddd" strokeDasharray="5 6" />

function LeaguePage({ n }) {
  const cols = [['קבוצה', 510], ['משחקים', 425], ['ניצחון', 360], ['תיקו', 300], ['הפסד', 240], ['שערים', 170], ['נקודות', 80]]
  return <SvgPage label="טבלת הליגה">
    <Head n={n} title="טבלת הליגה" instruction="ניצחון = 3 נקודות, תיקו = 1, הפסד = 0. משלימים את העמודות הריקות" />
    <g fontFamily={FONT} direction="rtl" textAnchor="middle">
      <rect x="30" y="125" width="540" height="40" fill="#eee" stroke={INK} strokeWidth="2" />
      {cols.map(([h, x]) => <text key={h} x={x} y="151" fontSize="17" fontWeight="800">{h}</text>)}
      {LEAGUE.map((r, i) => { const y = 165 + i * 44; return <g key={r[0]}>
        <rect x="30" y={y} width="540" height="44" fill="white" stroke={INK} strokeWidth="2" />
        <text x="510" y={y + 29} fontSize="19" fontWeight="700">{r[0]}</text>
        <text x="425" y={y + 29} fontSize="19" fill="#9ca3af">____</text>
        {[r[1], r[2], r[3]].map((v, j) => <text key={j} x={360 - j * 60} y={y + 29} fontSize="19">{v}</text>)}
        <text x="170" y={y + 29} fontSize="19" direction="ltr">{`${r[5]} : ${r[4]}`}</text>
        <text x="80" y={y + 29} fontSize="19" fill="#9ca3af">____</text>
      </g> })}
      <text x="300" y="370" fontSize="14" fill="#6b7280">בעמודת השערים: שערים שהקבוצה כבשה : שערים שספגה</text>
    </g>
    {LEAGUE_QS.map((it, i) => { const y = 420 + i * 72; return <g key={i} fontFamily={FONT} direction="rtl">
      <text x={R} y={y} fontSize="19" fontWeight="700" textAnchor="start">{i + 1}. {it.q}</text>
      <text x={R} y={y + 36} fontSize="19" textAnchor="start">תשובה: ____________ {it.u || ''}</text>
    </g> })}
  </SvgPage>
}

function ProblemsPage({ n, title, instruction, items }) {
  const step = 168
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map((it, i) => { const y = 130 + i * step; return <g key={i} fontFamily={FONT} direction="rtl">
      {[...it.t, it.q].map((l, j) => <text key={j} x={R} y={y + j * 26} fontSize="19" fontWeight={j === it.t.length ? 800 : 400} textAnchor="start">{l}</text>)}
      <text x={R} y={y + (it.t.length + 1) * 26 + 14} fontSize="17" fill="#6b7280" textAnchor="start">פתרון:</text>
      <text x={R} y={y + step - 40} fontSize="19" textAnchor="start">תשובה: ____________ {it.u || ''}</text>
      {i < items.length - 1 && <Rule y={y + step - 24} />}
    </g> })}
  </SvgPage>
}

export default function FootballMathGrade5() {
  const key = items => items.map(fmt)
  const table = LEAGUE.map(r => `${r[0]}: ${games(r)} משחקים, ${points(r)} נקודות`)
  return <>
    <Cover emoji="⚽🧮🏆" title="חשבון כדורגל" subtitle="כיתה ה׳ · שאלות מילוליות מהמגרש" pages={PAGES}
      note="כל העמודים בנויים סביב עולם הכדורגל: טבלת ליגה, מידות המגרש, כרטיסים לאצטדיון, דקות משחק וממוצע שערים. התרגול עצמו הוא חומר כיתה ה׳: כפל וחילוק במספרים גדולים, שבר מכמות, מספרים עשרוניים, שטח והיקף, זמן וממוצע. כדאי לכתוב בכל שאלה תרגיל, ולא רק תשובה." />
    <LeaguePage n={2} />
    <ProblemsPage n={3} title="המגרש: שטח והיקף" instruction="היקף = סכום כל הצלעות. שטח מלבן = אורך × רוחב" items={FIELD} />
    <ProblemsPage n={4} title="באצטדיון: כפל וחילוק" instruction="כותבים תרגיל ופותרים במאונך" items={STADIUM} />
    <ProblemsPage n={5} title="שברים במגרש" instruction="כדי למצוא שבר מכמות: מחלקים במכנה וכופלים במונה" items={FRACTIONS} />
    <ProblemsPage n={6} title="מספרים עשרוניים" instruction="מסדרים את הנקודה העשרונית מתחת לנקודה, ופותרים" items={DECIMALS} />
    <ProblemsPage n={7} title="שעון המשחק" instruction="סופרים דקות. 60 דקות הן שעה אחת" items={TIME} />
    <ProblemsPage n={8} title="ממוצע" instruction="ממוצע = סכום כל המספרים ÷ כמה מספרים יש" items={AVERAGE} />
    <ProblemsPage n={9} title="אתגר: שאלות בכמה שלבים" instruction="מתכננים: מה מחשבים קודם ומה אחר כך?" items={CHALLENGE} />
    <AnswerKey n={10} sections={[
      { title: 'עמוד 2 — טבלת הליגה', answers: [...table, ...LEAGUE_QS.map(fmt)] },
      { title: 'עמוד 3 — המגרש', answers: key(FIELD) },
      { title: 'עמוד 4 — באצטדיון', answers: key(STADIUM) },
      { title: 'עמוד 5 — שברים', answers: key(FRACTIONS) },
      { title: 'עמוד 6 — מספרים עשרוניים', answers: key(DECIMALS) },
      { title: 'עמוד 7 — שעון המשחק', answers: key(TIME) },
      { title: 'עמוד 8 — ממוצע', answers: key(AVERAGE) },
      { title: 'עמוד 9 — אתגר', answers: key(CHALLENGE) },
    ]} />
    <Certificate booklet="חוברת חשבון כדורגל" done="פתרתי שאלות מילוליות בטבלת ליגה, שטח והיקף, שברים, מספרים עשרוניים, זמן וממוצע." cheer="מלך/מלכת השערים בחשבון! ⚽" />
  </>
}
