import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { LEVELS, makeBoard, cellOf } from './snakesLaddersMath'

// /board-games/snakes-and-ladders/multiplication — a printable snakes-and-ladders board for grades 3–4:
// every ladder foot is a multiplication fact (right answer → climb), every snake head a division fact
// (right answer → the snake misses you). A second page is the answer card for the referee.

const PATH = '/board-games/snakes-and-ladders/multiplication'
const INK = '#1f2937'
const BX = 10, BY = 30, CELL = 18 // board: 180×180 mm
const ROW_FILL = ['#fef9c3', '#e0f2fe', '#dcfce7', '#fce7f3', '#ffedd5']

// Numbers and exercises are written left to right, as in Israeli textbooks.
function N({ x, y, size = 4, weight = 700, fill = INK, anchor = 'middle', children }) {
  return <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} direction="ltr" style={{ unicodeBidi: 'isolate' }}>{children}</text>
}

const cellXY = n => { const [c, r] = cellOf(n); return [BX + c * CELL, BY + (9 - r) * CELL] }
// the anchor of a ladder or snake sits a bit above the square's centre, so the exercise badge stays clear
const anchor = n => { const [x, y] = cellXY(n); return [x + CELL / 2, y + CELL / 2 - 2.5] }

function Ladder({ from, to, color }) {
  const [x1, y1] = anchor(from), [x2, y2] = anchor(to)
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy)
  const ox = (-dy / len) * 2.3, oy = (dx / len) * 2.3
  const rungs = Math.max(2, Math.floor(len / 4.2))
  const stroke = color ? '#92400e' : '#374151'
  return <g opacity={0.92}>
    {Array.from({ length: rungs - 1 }, (_, i) => {
      const t = (i + 1) / rungs, cx = x1 + dx * t, cy = y1 + dy * t
      return <line key={i} x1={cx - ox} y1={cy - oy} x2={cx + ox} y2={cy + oy} stroke={stroke} strokeWidth={0.7} />
    })}
    <line x1={x1 - ox} y1={y1 - oy} x2={x2 - ox} y2={y2 - oy} stroke={stroke} strokeWidth={1} strokeLinecap="round" />
    <line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} stroke={stroke} strokeWidth={1} strokeLinecap="round" />
  </g>
}

function Snake({ from, to, color, flip }) {
  const [x1, y1] = anchor(from), [x2, y2] = anchor(to)
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy)
  const s = flip ? -1 : 1, w = Math.min(14, len * 0.28)
  const nx = (-dy / len) * w * s, ny = (dx / len) * w * s
  const d = `M ${x1} ${y1} C ${x1 + dx * 0.3 + nx} ${y1 + dy * 0.3 + ny}, ${x1 + dx * 0.7 - nx} ${y1 + dy * 0.7 - ny}, ${x2} ${y2}`
  const body = color ? '#16a34a' : '#ffffff', edge = color ? '#14532d' : '#111827'
  const ang = Math.atan2(dy, dx)
  const ex = Math.cos(ang + Math.PI / 2) * 1.1, ey = Math.sin(ang + Math.PI / 2) * 1.1
  return <g>
    <path d={d} fill="none" stroke={edge} strokeWidth={3.4} strokeLinecap="round" />
    <path d={d} fill="none" stroke={body} strokeWidth={2.4} strokeLinecap="round" />
    {color && <path d={d} fill="none" stroke="#bbf7d0" strokeWidth={0.6} strokeDasharray="1.2 2.2" strokeLinecap="round" />}
    <ellipse cx={x1} cy={y1} rx={3} ry={2.5} fill={body} stroke={edge} strokeWidth={0.5} transform={`rotate(${(ang * 180) / Math.PI} ${x1} ${y1})`} />
    <circle cx={x1 + ex - Math.cos(ang) * 0.6} cy={y1 + ey - Math.sin(ang) * 0.6} r={0.55} fill="#111" />
    <circle cx={x1 - ex - Math.cos(ang) * 0.6} cy={y1 - ey - Math.sin(ang) * 0.6} r={0.55} fill="#111" />
  </g>
}

// The exercise sits on a badge at the bottom of the square.
function Badge({ sq, text, kind, color }) {
  const [x, y] = cellXY(sq)
  const stroke = kind === 'mul' ? (color ? '#b45309' : INK) : (color ? '#15803d' : INK)
  return <g>
    <rect x={x + 1} y={y + CELL - 7.2} width={CELL - 2} height={6.4} rx={1.6} fill="#fff" stroke={stroke} strokeWidth={0.6} strokeDasharray={kind === 'div' && !color ? '1.4 0.8' : undefined} />
    {text
      ? <N x={x + CELL / 2} y={y + CELL - 2.6} size={3.7} weight={800}>{text}</N>
      : <line x1={x + 3} x2={x + CELL - 3} y1={y + CELL - 2.4} y2={y + CELL - 2.4} stroke="#9ca3af" strokeWidth={0.3} />}
  </g>
}

const mulText = l => `${l.a} × ${l.b}`
const divText = s => `${s.dividend} ÷ ${s.divisor}`

function BoardSheet({ board, level, mode, color }) {
  const blank = mode === 'blank'
  return <Sheet w={200} h={270} label="סולמות ונחשים של כפל וחילוק">
    <T x={190} y={14} size={6.2} weight={900} anchor="start">סולמות ונחשים של כפל וחילוק</T>
    <T x={10} y={14} size={3.2} fill="#4b5563" anchor="end">{blank ? 'כותבים תרגילים בעצמכם' : LEVELS[level].label}</T>
    <T x={190} y={23} size={3.3} fill="#374151" anchor="start">נחתתם על סולם? פותרים את תרגיל הכפל. נחתתם על ראש נחש? פותרים את תרגיל החילוק.</T>
    {Array.from({ length: 100 }, (_, i) => {
      const n = i + 1, [x, y] = cellXY(n), [c, r] = cellOf(n)
      return <g key={n}>
        <rect x={x} y={y} width={CELL} height={CELL} fill={color ? ROW_FILL[(r + c) % ROW_FILL.length] : '#fff'} stroke={INK} strokeWidth={0.3} />
        <N x={x + 1.2} y={y + 3.8} size={3.1} weight={700} fill="#374151" anchor="start">{n}</N>
      </g>
    })}
    <rect x={BX} y={BY} width={CELL * 10} height={CELL * 10} fill="none" stroke={INK} strokeWidth={0.8} />
    {(() => { const [x, y] = cellXY(1); return <T x={x + CELL / 2} y={y + CELL / 2 + 2} size={3.2} weight={800}>התחלה</T> })()}
    {(() => { const [x, y] = cellXY(100); return <T x={x + CELL / 2} y={y + CELL / 2 + 4} size={3.2} weight={800}>סיום!</T> })()}
    {board.ladders.map(l => <Ladder key={l.sq} from={l.sq} to={l.to} color={color} />)}
    {board.snakes.map((s, i) => <Snake key={s.sq} from={s.sq} to={s.to} color={color} flip={i % 2 === 1} />)}
    {board.ladders.map(l => <Badge key={l.sq} sq={l.sq} kind="mul" color={color} text={blank ? '' : mulText(l)} />)}
    {board.snakes.map(s => <Badge key={s.sq} sq={s.sq} kind="div" color={color} text={blank ? '' : divText(s)} />)}
    {/* rules box */}
    <rect x={10} y={215} width={180} height={52} rx={3} fill={color ? '#fffbeb' : '#fff'} stroke={INK} strokeWidth={0.4} />
    <T x={186} y={223} size={3.8} weight={800} anchor="start">איך משחקים</T>
    <T x={186} y={230} size={3.2} anchor="start">1. מטילים קובייה ומתקדמים. מתחילים ב־1, והראשון שמגיע בדיוק ל־100 מנצח.</T>
    <T x={186} y={236} size={3.2} anchor="start">2. סולם (כפל): פתרתם נכון — מטפסים למעלה. טעיתם — נשארים במקום.</T>
    <T x={186} y={242} size={3.2} anchor="start">3. נחש (חילוק): פתרתם נכון — הנחש מפספס ונשארים. טעיתם — מחליקים עד הזנב.</T>
    <T x={186} y={248} size={3.2} anchor="start">4. מי שלא בתור הוא השופט: בודק בכרטיס התשובות, בלי לגלות לפני שעונים.</T>
    <T x={186} y={256} size={3} fill="#4b5563" anchor="start">צריך: קובייה, כלי לכל שחקן (מטבע, כפתור, מחק) וכרטיס התשובות. 2–4 שחקנים, 15–20 דקות.</T>
    <T x={186} y={262} size={3} fill="#4b5563" anchor="start">{blank ? 'גרסה ריקה: כותבים תרגיל בכל מסגרת לפני המשחק — ומחליפים כשרוצים.' : 'רוצים לוח עם תרגילים אחרים? לוחצים "תרגילים חדשים" בדף ומדפיסים שוב.'}</T>
  </Sheet>
}

function AnswerSheet({ board, level }) {
  const row = (y, sq, text, tail) => <g key={sq}>
    <line x1={14} x2={186} y1={y + 2.6} y2={y + 2.6} stroke="#e5e7eb" strokeWidth={0.3} />
    <T x={184} y={y} size={3.6} weight={700} anchor="start">משבצת {sq}</T>
    <N x={120} y={y} size={4.4} weight={800}>{text}</N>
    <T x={16} y={y} size={3.2} fill="#4b5563" anchor="end">{tail}</T>
  </g>
  const ls = [...board.ladders].sort((a, b) => a.sq - b.sq)
  const ss = [...board.snakes].sort((a, b) => a.sq - b.sq)
  return <Sheet w={200} h={270} label="כרטיס תשובות">
    <T x={190} y={16} size={6} weight={900} anchor="start">כרטיס תשובות לשופט</T>
    <T x={10} y={16} size={3.2} fill="#4b5563" anchor="end">{LEVELS[level].label}</T>
    <T x={190} y={24} size={3.3} fill="#374151" anchor="start">מקפלים את הדף כך שהשחקנים לא רואים, וקוראים את התשובה רק אחרי שענו.</T>
    <rect x={10} y={30} width={180} height={9} rx={2} fill="#fef3c7" />
    <T x={186} y={36.4} size={4.2} weight={800} anchor="start">סולמות — כפל (נכון = מטפסים)</T>
    {ls.map((l, i) => row(47 + i * 9, l.sq, `${mulText(l)} = ${l.answer}`, `עולים ל־${l.to}`))}
    <rect x={10} y={124} width={180} height={9} rx={2} fill="#dcfce7" />
    <T x={186} y={130.4} size={4.2} weight={800} anchor="start">נחשים — חילוק (טעות = מחליקים)</T>
    {ss.map((s, i) => row(141 + i * 9, s.sq, `${divText(s)} = ${s.answer}`, `טעות: יורדים ל־${s.to}`))}
    <T x={100} y={242} size={3.1} fill="#4b5563">טיפ: מי שטעה רואה את התשובה הנכונה ואומר את התרגיל בקול — ככה זוכרים אותו בפעם הבאה.</T>
  </Sheet>
}

export default function SnakesLaddersMath() {
  const [level, setLevel] = useState('full')
  const [mode, setMode] = useState('filled')
  const [color, setColor] = useState('yes')
  const [seed, setSeed] = useState(1)
  const board = makeBoard(level, seed)
  const fresh = () => setSeed(s => s + 1)
  const pages = [{ key: `board-${level}-${seed}-${mode}`, svg: <BoardSheet board={board} level={level} mode={mode} color={color === 'yes'} /> }]
  if (mode === 'filled') pages.push({ key: `answers-${level}-${seed}`, svg: <AnswerSheet board={board} level={level} /> })
  return <PrintableShell path={PATH} emoji="🐍" h1="סולמות ונחשים של כפל וחילוק להדפסה"
    seoTitle="סולמות ונחשים כפל וחילוק להדפסה — משחק לוח הכפל לכיתות ג׳–ד׳ (PDF חינם)"
    description="לוח סולמות ונחשים להדפסה שבו כל סולם הוא תרגיל כפל וכל נחש תרגיל חילוק, עם כרטיס תשובות לשופט. שלוש רמות, תרגילים חדשים בכל לחיצה, גרסה ריקה למורה ובצבע או בשחור־לבן."
    sub="פותרים נכון — מטפסים. טועים בחילוק — מחליקים. משחק תרגול לוח הכפל לכיתה ולבית"
    crumbs={[{ label: 'סולמות ונחשים', href: '/board-games/snakes-and-ladders' }]}
    printTitle="סולמות ונחשים של כפל וחילוק" onRefresh={fresh}
    siblings={[
      { href: '/board-games/snakes-and-ladders', label: '🎲 סולמות ונחשים אונליין' },
      { href: PATH, label: '✖️ כפל וחילוק להדפסה' },
      { href: '/printables/multiplication-strips', label: '📏 סרגלי כפולות' },
    ]}
    lead={<QuickAnswer q="איך משחקים סולמות ונחשים של כפל וחילוק?"
      a="משחקים כמו בסולמות ונחשים רגיל, עם קובייה. מי שנוחת בתחתית סולם פותר תרגיל כפל: נכון — מטפס, טעה — נשאר. מי שנוחת על ראש נחש פותר תרגיל חילוק: נכון — הנחש מפספס, טעה — מחליק עד הזנב. שחקן אחר בודק בכרטיס התשובות."
      rows={[['כיתות', 'ג׳–ד׳ (רמה קלה כבר מסוף ב׳)'], ['תרגילים', '8 תרגילי כפל ו־10 תרגילי חילוק בכל לוח'], ['רמות', 'כפל עד 5 · כל לוח הכפל · מאתגר 6–9'], ['הדפסה', 'לוח A4 + כרטיס תשובות, בצבע או בשחור־לבן']]} />}
    controls={<div className="space-y-3">
      <Choice label="רמה" value={level} onChange={setLevel} options={Object.entries(LEVELS).map(([k, v]) => [k, `${v.label} (${v.grade})`])} />
      <Choice label="תרגילים" value={mode} onChange={setMode} options={[['filled', 'עם תרגילים וכרטיס תשובות'], ['blank', 'ריק — המורה כותבת תרגילים']]} />
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'בצבע'], ['no', 'שחור־לבן (חוסך דיו)']]} />
      {mode === 'filled' && <div className="text-center">
        <button type="button" onClick={fresh} className="min-h-[44px] wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 font-bold hover:bg-[var(--muted)]/30">🔀 תרגילים חדשים</button>
      </div>}
    </div>}
    pages={pages}
    extra={<p className="text-sm text-[var(--muted-foreground)]">{mode === 'filled' ? 'דף 1: הלוח · דף 2: כרטיס התשובות' : 'לוח עם מסגרות ריקות לתרגילים'}</p>}
    paragraphs={[
      'סולמות ונחשים הוא אחד המשחקים הראשונים שילדים לומדים, ולכן הוא דרך טובה לתרגל את לוח הכפל בלי שזה ירגיש כמו שיעורי בית. בלוח הזה לכל סולם יש תרגיל כפל ולכל נחש תרגיל חילוק. הקובייה עדיין מחליטה לאן מגיעים, אבל מה שקורה בסולם ובנחש תלוי בחשבון: מי שפותר נכון מטפס או בורח מהנחש. כך גם ילד שהמזל לא איתו מרגיש שיש לו השפעה, ורוצה לענות.',
      'החילוק בלוח בנוי מאותם תרגילי כפל, רק הפוך: אם 7 × 8 = 56, אז 56 ÷ 8 = 7. זה בדיוק הקשר שמלמדים בכיתות ג׳–ד׳, ומשחק שמערבב בין השניים עוזר לילדים לראות שזו אותה עובדה. ברמה הקלה התרגילים הם רק עם 2, 3, 4 ו־5, מתאים לתחילת כיתה ג׳ או לסוף ב׳. "כל לוח הכפל" מערבב את כל המספרים עד 10, וברמה המאתגרת יש רק את הכפולות של 6, 7, 8 ו־9 — אלה שהכי קשה לזכור.',
      'איך מכינים: בוחרים רמה ומדפיסים שני דפים: הלוח וכרטיס התשובות. בכל לחיצה על "תרגילים חדשים" הלוח מקבל תרגילים אחרים, אז אפשר להדפיס כמה לוחות שונים לכמה קבוצות בכיתה. בגרסה הריקה המסגרות של הסולמות והנחשים נשארות ריקות, והמורה או ההורה כותבים תרגילים שהילד צריך לתרגל. אם מכסים את הלוח בנייר דבק שקוף או במלמינציה, אפשר לכתוב בטוש מחיק ולהחליף תרגילים כל שבוע.',
      'בכיתה זה עובד טוב בקבוצות של שלושה או ארבעה ילדים עם לוח אחד. מי שלא בתור הוא השופט שמחזיק את כרטיס התשובות, כך שכולם עסוקים בחשבון גם כשלא תורם. בבית זה משחק טוב להורה וילד: ההורה יכול לבקש "תסביר לי איך פתרת" במקום רק לבדוק תשובה. מי שטעה כדאי שיגיד את התרגיל הנכון בקול — ככה הוא נשאר בזיכרון.',
    ]}
    faq={[
      { q: 'לאיזו כיתה מתאים המשחק?', a: 'בעיקר לכיתות ג׳ ו־ד׳, כשלומדים את לוח הכפל ואת החילוק. הרמה הקלה (כפל עד 5) מתאימה גם לסוף כיתה ב׳, והרמה המאתגרת טובה לחזרה בכיתות ה׳–ו׳.' },
      { q: 'מה קורה אם עונים לא נכון?', a: 'בסולם — לא מטפסים ונשארים במשבצת. בנחש — מחליקים עד הזנב, כמו בסולמות ונחשים הרגיל. מי שענה נכון בנחש נשאר במקום והנחש "מפספס" אותו.' },
      { q: 'אפשר להדפיס לוחות עם תרגילים שונים?', a: 'כן. כל לחיצה על "תרגילים חדשים" יוצרת לוח אחר באותה רמה, עם כרטיס תשובות שמתאים לו. אפשר להדפיס לוח שונה לכל קבוצה בכיתה.' },
      { q: 'יש גרסה שבה אני כותבת את התרגילים?', a: 'כן — בוחרים "ריק — המורה כותבת תרגילים". המסגרות על הסולמות והנחשים נשארות ריקות, וכותבים בהן כל תרגיל שרוצים: כפל, חילוק, חיבור או אפילו שאלה באנגלית.' },
      { q: 'יש גם סולמות ונחשים רגיל?', a: 'כן. אפשר לשחק סולמות ונחשים אונליין באתר נגד המחשב או חברים, וגם להדפיס לוח רגיל בלי תרגילים מעמוד הדפים להדפסה.' },
    ]}
    related={[
      { label: 'סולמות ונחשים אונליין', href: '/board-games/snakes-and-ladders' },
      { label: 'לוח הכפל המלא', href: '/learn/multiplication-table' },
      { label: 'משחק לוח הכפל בשלבים', href: '/learn/multiplication-game' },
      { label: 'סרגלי כפולות להדפסה', href: '/printables/multiplication-strips' },
      { label: 'צביעה לפי לוח הכפל', href: '/printables/color-by-answer/multiplication' },
      { label: 'איקס־עיגול חשבוני לכיתה', href: '/classroom/math-tic-tac-toe' },
    ]}
  />
}
