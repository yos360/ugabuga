import FirstGradeSheet, { TraceText } from './FirstGradeSheets'
import ActivitySvg from '../../motor/render/ActivitySvg'
import { createActivity } from '../../motor/generators'
import { readyMaze } from '../../pages/printables/mazeData'
import { coloringSrc } from '../../data/coloringSubjects'
import { BOOKLET_PAGES, FIND_ROWS, COUNT_BOXES } from './firstGradeBookletData'
import '../../pages/printables/fine-motor.css'

// "חוברת הכנה לכיתה א׳" — a 15-page printable booklet built from the site's existing generators
// (writing lines, maths, clock, mazes, line tracing, patterns, coloring) plus a few pages made here.
// Pure function of its props: PrintPreview renders it twice (dialog + print copy), so no SVG ids.

const W = 600, H = 820
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'
const A4 = ({ children, style }) => <article className="buga-a4" style={style}>{children}</article>
const SvgPage = ({ label, children }) => <A4><div className="print-art"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ width: '100%', height: '100%', background: 'white' }}>{children}</svg></div></A4>
function Head({ n, title, instruction }) {
  return <g fontFamily={FONT} textAnchor="middle" fill={INK} direction="rtl">
    <text x={W / 2} y="40" fontSize="25" fontWeight="800">{title}</text>
    <text x={W / 2} y="70" fontSize="15">שם: ____________    עמוד {n} בחוברת</text>
    <text x={W / 2} y="100" fontSize="17" fontWeight="700">{instruction}</text>
  </g>
}

function Cover() {
  return <A4 style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <div style={{ fontSize: 64, lineHeight: 1.1 }} aria-hidden="true">🎒✏️📚</div>
    <h2 style={{ fontSize: '30pt', margin: '10px 0 4px' }}>חוברת הכנה לכיתה א׳</h2>
    <p style={{ fontSize: '15pt', margin: '0 0 22px' }}>15 עמודים של כתיבה, קריאה, חשבון, מבוכים וצביעה</p>
    <div style={{ border: '2px dashed #111', borderRadius: 18, padding: '16px 28px', fontSize: '18pt', marginBottom: 26 }}>החוברת של: ______________________</div>
    <ol style={{ textAlign: 'right', fontSize: '12.5pt', lineHeight: 1.7, columns: 2, columnGap: 36, margin: '0 auto 24px', maxWidth: '150mm' }}>
      {BOOKLET_PAGES.slice(1).map(t => <li key={t}>{t}</li>)}
    </ol>
    <p style={{ fontSize: '11.5pt', maxWidth: '150mm', margin: '0 auto', lineHeight: 1.6 }}><b>להורים:</b> עמוד או שניים ביום מספיקים. עוצרים כשהילד מתעייף, מחמיאים על המאמץ ולא רק על התוצאה — והכי חשוב: שיהיה כיף.</p>
  </A4>
}

function FindLetter({ n }) {
  return <SvgPage label="מוצאים את האות">
    <Head n={n} title="מוצאים את האות" instruction="בכל שורה — הקיפו כל אות שזהה לאות שבריבוע" />
    <g fontFamily={FONT} fill={INK}>
      {FIND_ROWS.map(([t, row], i) => { const y = 170 + i * 100; return <g key={t}>
        <rect x="500" y={y - 42} width="70" height="70" rx="12" fill="#fff6d1" stroke={INK} strokeWidth="2.5" />
        <text x="535" y={y + 10} fontSize="46" fontWeight="800" textAnchor="middle">{t}</text>
        {[...row].map((ch, j) => <text key={j} x={455 - j * 54} y={y + 10} fontSize="40" textAnchor="middle">{ch}</text>)}
        {i < FIND_ROWS.length - 1 && <path d={`M30 ${y + 48} H570`} stroke="#ddd" strokeDasharray="5 6" />}
      </g> })}
      <text x={W / 2} y="790" fontSize="16" textAnchor="middle" direction="rtl">כמה פעמים מצאתם את האות בכל שורה? ספרו!</text>
    </g>
  </SvgPage>
}

function Numbers({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✏️ כותבים מספרים 1–10</h2>
    <p style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 15 }}>שם: ______________ &nbsp;·&nbsp; עמוד {n} בחוברת</p>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>עוברים בעיפרון על הקו המקווקו, מימין לשמאל</p>
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: 'repeat(10, 1fr)', gap: 2 }}>
      {Array.from({ length: 10 }, (_, i) => <div key={i} style={{ minHeight: 0, height: '100%' }}><TraceText value={String(i + 1)} repeats={6} stroke="#9aa5b5" height={80} /></div>)}
    </div>
  </A4>
}

function Counting({ n }) {
  return <SvgPage label="סופרים וכותבים">
    <Head n={n} title="סופרים וכותבים" instruction="כמה יש בכל ריבוע? כתבו את המספר בעיגול" />
    {COUNT_BOXES.map(([e, k], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 40 : 310, y = 130 + row * 170
      return <g key={e}>
        <rect x={x} y={y} width="250" height="150" rx="16" fill="white" stroke={INK} strokeWidth="2" />
        {Array.from({ length: k }, (_, j) => <text key={j} x={x + 222 - (j % 4) * 40} y={y + 60 + Math.floor(j / 4) * 52} fontSize="38" textAnchor="middle">{e}</text>)}
        <circle cx={x + 45} cy={y + 110} r="26" fill="white" stroke={INK} strokeWidth="2" />
      </g>
    })}
  </SvgPage>
}

function MotorPage({ n, activity, title, instruction }) {
  return <article className="buga-a4 motor-sheet">
    <h2>{title}</h2>
    <p className="art-caption motor-caption"><span>{instruction}</span><span className="motor-name">עמוד {n} · שם: ______________</span></p>
    <div className="print-art"><ActivitySvg activity={activity} /></div>
  </article>
}

function Coloring({ n }) {
  return <A4>
    <h2>🖍️ דף צביעה — קשת בענן</h2>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>צובעים לאט, בתוך הקווים. עמוד {n} בחוברת</p>
    <div className="print-art"><img src={coloringSrc('rainbow-sun', 1)} alt="דף צביעה: קשת בענן, עננים ושמש" /></div>
  </A4>
}

function Certificate() {
  return <A4 style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <div style={{ border: '6px double #111', borderRadius: 24, padding: '40px 30px', width: '100%' }}>
      <div style={{ fontSize: 60 }} aria-hidden="true">🏅</div>
      <h2 style={{ fontSize: '32pt', margin: '8px 0' }}>תעודת סיום</h2>
      <p style={{ fontSize: '18pt', margin: '18px 0' }}>כל הכבוד ל־ ______________________</p>
      <p style={{ fontSize: '16pt', lineHeight: 1.7 }}>שסיים/ה את <b>חוברת ההכנה לכיתה א׳</b>:<br />כתבתי, קראתי, ספרתי, פתרתי מבוכים וצבעתי.</p>
      <p style={{ fontSize: '22pt', margin: '22px 0 6px' }} aria-hidden="true">⭐ ⭐ ⭐ ⭐ ⭐</p>
      <p style={{ fontSize: '18pt', fontWeight: 800 }}>אני מוכן/ה לכיתה א׳!</p>
      <p style={{ fontSize: '13pt', marginTop: 26 }}>תאריך: ____________ &nbsp;&nbsp; חתימה: ____________</p>
    </div>
  </A4>
}

export default function FirstGradeBooklet({ seed, words }) {
  const tracing = createActivity({ type: 'tracing', age: '5-6', difficulty: 'easy', theme: 'animals', seed: 5101 })
  const pattern = createActivity({ type: 'pattern', age: '5-6', difficulty: 'easy', theme: 'nature', seed: 5303 })
  const maze1 = readyMaze(0, 0), maze2 = readyMaze(1, 2)
  return <>
    <Cover />
    <FirstGradeSheet module="letters" word="אבא" />
    <FirstGradeSheet module="letters" word="שלום" />
    <FindLetter n={4} />
    <Numbers n={5} />
    <Counting n={6} />
    <FirstGradeSheet module="math" seed={seed} />
    <FirstGradeSheet module="reading" words={words} />
    <MotorPage n={9} activity={tracing} title={tracing.title} instruction={tracing.instruction} />
    <MotorPage n={10} activity={maze1} title={maze1.title} instruction={maze1.instruction} />
    <MotorPage n={11} activity={maze2} title={maze2.title} instruction={maze2.instruction} />
    <MotorPage n={12} activity={pattern} title={pattern.title} instruction={pattern.instruction} />
    <FirstGradeSheet module="clock" />
    <Coloring n={14} />
    <Certificate />
  </>
}
