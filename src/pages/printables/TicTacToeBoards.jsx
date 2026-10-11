import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'

// Printable tic-tac-toe boards (/printables/tic-tac-toe): 6 classic 3×3 boards per A4, 4 boards of 4×4,
// or one big "ultimate" board. The paper side of the online game (/online-games/tic-tac-toe) and of the
// how-to-play page in the games catalog (/games/iks-igul).

const PATH = '/printables/tic-tac-toe'
const INK = '#111'

// The classic "#" grid: inner lines only, no outer frame.
function Grid({ x, y, size, n, stroke = 1.1 }) {
  const step = size / n
  const lines = []
  for (let i = 1; i < n; i++) {
    lines.push(<line key={'v' + i} x1={x + i * step} y1={y + 1} x2={x + i * step} y2={y + size - 1} stroke={INK} strokeWidth={stroke} strokeLinecap="round" />)
    lines.push(<line key={'h' + i} x1={x + 1} y1={y + i * step} x2={x + size - 1} y2={y + i * step} stroke={INK} strokeWidth={stroke} strokeLinecap="round" />)
  }
  return <g>{lines}</g>
}

// "משחק 3 · ✕ ______ ◯ ______" above each board, so kids write who played.
function BoardLabel({ cx, y, n, width }) {
  return <g>
    <T x={cx + width - 6} y={y} size={4.6} weight={800} anchor="start">משחק {n}</T>
    <T x={cx + width - 24} y={y} size={4.2} anchor="start">✕ ________ ◯ ________</T>
  </g>
}

function ClassicSheet() {
  const size = 62, colW = 86, x0 = (200 - 2 * colW) / 2, y0 = 26, rowH = 78
  return <Sheet label="6 לוחות איקס עיגול 3 על 3">
    <T x={100} y={14} size={7.5} weight={800}>איקס עיגול — 6 לוחות</T>
    <T x={100} y={20.5} size={4}>מי שמסדר ראשון שלושה ברצף — בשורה, בטור או באלכסון — מנצח</T>
    {Array.from({ length: 6 }, (_, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const cx = x0 + (1 - col) * colW, y = y0 + row * rowH
      return <g key={i}>
        <BoardLabel cx={cx} y={y + 6} n={i + 1} width={colW} />
        <Grid x={cx + (colW - size) / 2} y={y + 11} size={size} n={3} stroke={1.3} />
      </g>
    })}
    <ScoreRow y={y0 + 3 * rowH + 4} />
  </Sheet>
}

function BigSheet() {
  const size = 74, colW = 92, x0 = (200 - 2 * colW) / 2, y0 = 28, rowH = 112
  return <Sheet label="4 לוחות איקס עיגול 4 על 4">
    <T x={100} y={14} size={7.5} weight={800}>איקס עיגול 4×4 — ארבעה ברצף</T>
    <T x={100} y={20.5} size={4}>כמו הרגיל, אבל צריך לסדר ארבעה סימנים ברצף. פחות תיקו, יותר מחשבה!</T>
    {Array.from({ length: 4 }, (_, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const cx = x0 + (1 - col) * colW, y = y0 + row * rowH
      return <g key={i}>
        <BoardLabel cx={cx} y={y + 8} n={i + 1} width={colW} />
        <Grid x={cx + (colW - size) / 2} y={y + 16} size={size} n={4} stroke={1.2} />
      </g>
    })}
    <ScoreRow y={y0 + 2 * rowH + 4} />
  </Sheet>
}

function UltimateSheet() {
  const size = 168, x = (200 - size) / 2, y = 34, cell = size / 3, pad = 6
  return <Sheet label="לוח איקס עיגול כפול">
    <T x={100} y={14} size={7.5} weight={800}>איקס עיגול כפול (Ultimate)</T>
    <T x={100} y={21} size={4}>9 לוחות קטנים בתוך לוח גדול אחד</T>
    <T x={100} y={27} size={4.2}>✕ ______________   ◯ ______________</T>
    <Grid x={x} y={y} size={size} n={3} stroke={2.2} />
    {Array.from({ length: 9 }, (_, i) => <Grid key={i} x={x + (i % 3) * cell + pad} y={y + Math.floor(i / 3) * cell + pad} size={cell - 2 * pad} n={3} stroke={0.7} />)}
    <g>
      <T x={186} y={y + size + 12} size={4.6} weight={800} anchor="start">החוקים</T>
      {[
        '1. איקס פותח ומסמן בכל משבצת שירצה, באחד מ-9 הלוחות הקטנים.',
        '2. המשבצת שסימנתם קובעת באיזה לוח קטן היריב משחק עכשיו',
        '    (סימנתם בפינה העליונה? הוא משחק בלוח הקטן שבפינה העליונה).',
        '3. מי שמנצח בלוח קטן — כובש אותו ומצייר עליו סימן גדול.',
        '4. נשלחתם ללוח שכבר נגמר? משחקים בכל לוח פנוי שרוצים.',
        '5. שלושה לוחות קטנים ברצף בלוח הגדול — ניצחתם במשחק!',
      ].map((line, i) => <T key={i} x={186} y={y + size + 19 + i * 6.4} size={4} anchor="start">{line}</T>)}
    </g>
  </Sheet>
}

// A small win tally at the bottom of the sheet: "ניצחונות ✕ ☐☐☐☐☐☐  ◯ ☐☐☐☐☐☐  תיקו ☐☐☐".
function ScoreRow({ y }) {
  const boxes = (x, n) => Array.from({ length: n }, (_, i) => <rect key={i} x={x - i * 7} y={y - 4.5} width={5.5} height={5.5} rx={1} fill="none" stroke={INK} strokeWidth={0.4} />)
  return <g>
    <T x={186} y={y} size={4.4} weight={800} anchor="start">ניצחונות:</T>
    <T x={163} y={y} size={4.4} anchor="start">✕</T>{boxes(151, 6)}
    <T x={107} y={y} size={4.4} anchor="start">◯</T>{boxes(95, 6)}
    <T x={52} y={y} size={4.4} anchor="start">תיקו</T>{boxes(35, 4)}
  </g>
}

const KINDS = {
  classic: { label: '3×3 · שישה לוחות', Sheet: ClassicSheet },
  big: { label: '4×4 · ארבעה ברצף', Sheet: BigSheet },
  ultimate: { label: 'איקס עיגול כפול', Sheet: UltimateSheet },
}

export default function TicTacToeBoards() {
  const [kind, setKind] = useState('classic')
  const [copies, setCopies] = useState('1')
  const { Sheet: Board } = KINDS[kind]
  const pages = Array.from({ length: Number(copies) }, (_, i) => ({ key: kind + i, svg: <Board /> }))
  return <PrintableShell path={PATH} emoji="❌" h1="לוחות איקס עיגול להדפסה"
    seoTitle="לוחות איקס עיגול להדפסה — 3×3, 4×4 ואיקס עיגול כפול"
    description="דף איקס עיגול להדפסה בחינם: 6 לוחות 3×3 בדף A4, לוחות 4×4 של ארבעה ברצף ולוח איקס עיגול כפול (Ultimate) עם החוקים — לנסיעה, למסעדה ולכיתה."
    sub="6 לוחות בדף, עם מקום לשמות ולספירת ניצחונות — ומשחקים בעיפרון"
    crumbs={[{ label: 'משחקים ויצירה מנייר', href: '/printables?topic=crafts' }]}
    controls={<>
      <Choice label="סוג הלוח" value={kind} onChange={setKind} options={Object.entries(KINDS).map(([k, v]) => [k, v.label])} />
      <Choice label="כמה דפים" value={copies} onChange={setCopies} options={[['1', 'דף אחד'], ['2', '2 דפים'], ['4', '4 דפים']]} />
    </>}
    pages={pages}
    extra={<div className="space-y-2 text-sm">
      <Link to="/online-games/tic-tac-toe" className="block wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-bold hover:bg-[var(--postit)]">📱 לשחק עכשיו על המסך</Link>
      <Link to="/games/iks-igul" className="block wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-bold hover:bg-[var(--postit)]">📖 איך משחקים ומה מכינים</Link>
    </div>}
    paragraphs={[
      'איקס עיגול הוא המשחק הראשון שרוב הילדים לומדים לשחק על דף: שני שחקנים, לוח של 3×3, ומי שמסדר ראשון שלושה סימנים ברצף מנצח. בדף הזה יש שישה לוחות מוכנים, עם מקום לכתוב מי שיחק ושורת ניצחונות בתחתית — כך שדף אחד מספיק לטורניר קטן שלם.',
      'כשהילדים כבר משחקים בלי טעויות, כל משחק נגמר בתיקו — וזה בדיוק הזמן לעבור ללוח 4×4, שבו צריך ארבעה ברצף, או לאיקס עיגול כפול: לוח גדול של תשעה לוחות קטנים, שבו המהלך שלכם קובע באיזה לוח היריב ישחק. החוקים מודפסים על הדף עצמו.',
      'הדפים מעולים לנסיעה ארוכה, להמתנה במסעדה, לצהרון ולכיתה (דף לכל זוג). רוצים לשחק בלי נייר? יש גם איקס עיגול לשניים על מסך הטלפון, ונגד מחשב שאי אפשר לנצח.',
    ]}
    faq={[
      { q: 'כמה לוחות יש בדף?', a: 'בדף הרגיל 6 לוחות של 3×3, בדף 4×4 יש 4 לוחות, ובאיקס עיגול כפול לוח גדול אחד עם החוקים. אפשר להדפיס כמה דפים בבת אחת.' },
      { q: 'מה זה איקס עיגול כפול?', a: 'גרסה למתקדמים: לוח גדול שכל משבצת בו היא לוח איקס עיגול קטן. המשבצת שסימנתם קובעת באיזה לוח קטן היריב משחק, ומי שמנצח שלושה לוחות קטנים ברצף — מנצח.' },
      { q: 'מאיזה גיל משחקים איקס עיגול?', a: 'מגיל 4 בערך על לוח 3×3. לוח 4×4 מתאים מגיל 6–7, ואיקס עיגול כפול מגיל 9.' },
    ]}
    related={[
      { label: 'איקס עיגול — הוראות והכנה', href: '/games/iks-igul' },
      { label: 'איקס עיגול לשניים אונליין', href: '/online-games/tic-tac-toe' },
      { label: 'משחק זיכרון להדפסה', href: '/printables/memory-game' },
    ]} />
}
