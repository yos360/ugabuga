import { Sheet, T } from '../printables/PrintableShell'
import { THEMES } from './orderPuzzleThemes'

// "Solve, then put in order" sheets: numbered exercises at the top, a picture with empty slots below.
// Every theme is simple black line-art (prints well in black and white and can be coloured in).
// Coordinates are in a 200 × 270 box (≈ mm on A4). Maths is written left to right, also on this RTL page.

const ANS = '#c1121f'
const INK = '#111'
const SYMBOL = { '+': '+', '-': '−', x: '×', '÷': '÷' }
const ART_TOP = 116

function Slot({ s, value, answers }) {
  const common = { fill: '#fff', stroke: INK, strokeWidth: 0.7 }
  const size = s.kind === 'rect' ? Math.min(6.4, s.h * 0.78) : Math.min(6.4, (s.r || s.ry) * 0.95)
  return <g>
    {s.kind === 'rect' && <rect x={s.x - s.w / 2} y={s.y - s.h / 2} width={s.w} height={s.h} rx={1.4} {...common} />}
    {s.kind === 'circle' && <circle cx={s.x} cy={s.y} r={s.r} {...common} />}
    {s.kind === 'ellipse' && <ellipse cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} {...common} />}
    {answers && <text x={s.x} y={s.y + size * 0.36} fontSize={size} fontWeight={800} textAnchor="middle" direction="ltr" fill={ANS}>{value}</text>}
  </g>
}

function LetterBox({ x, y, letter }) {
  return <g>
    <rect x={x - 3} y={y - 3} width={6} height={6} rx={0.8} fill="#fff" stroke="#777" strokeWidth={0.4} strokeDasharray="1 0.7" />
    {letter && <T x={x} y={y + 1.6} size={4.3} weight={800} fill={ANS}>{letter}</T>}
  </g>
}

function Clue({ x, y, text }) {
  return <g>
    <rect x={x - 8.5} y={y - 2.9} width={17} height={5.8} rx={2.9} fill="#fff" stroke={INK} strokeWidth={0.45} />
    <T x={x} y={y + 1.25} size={3.3} weight={700}>{text}</T>
  </g>
}

// One exercise: "(1)  12 − 5 = [  ]" — the number badge on the right, maths left to right.
function Exercise({ e, i, xr, y, letter, answers }) {
  return <g>
    <circle cx={xr - 4} cy={y - 2.2} r={3.4} fill="#fff" stroke="#888" strokeWidth={0.4} />
    <text x={xr - 4} y={y - 0.9} fontSize={3.6} fontWeight={700} textAnchor="middle" fill="#555">{i + 1}</text>
    <rect x={xr - 25} y={y - 7} width={14} height={9} rx={1.2} fill="#fff" stroke={INK} strokeWidth={0.6} />
    {answers && <text x={xr - 18} y={y + 0.2} fontSize={6} fontWeight={800} textAnchor="middle" direction="ltr" fill={ANS}>{e.c}</text>}
    <text x={xr - 27.5} y={y} fontSize={6.4} fontWeight={600} textAnchor="end" direction="ltr" fill={INK}>{`${e.a} ${SYMBOL[e.o]} ${e.b} =`}</text>
    {letter && <g>
      <T x={xr - 72} y={y - 0.5} size={3.2} fill="#666">אות</T>
      <rect x={xr - 85.5} y={y - 6.3} width={7.5} height={7.5} rx={1.2} fill="#fff" stroke="#777" strokeWidth={0.4} />
      <T x={xr - 81.75} y={y - 0.4} size={4.8} weight={800}>{letter}</T>
    </g>}
  </g>
}

// The whole sheet. `sheet` comes from orderSheet() in utils/orderPuzzles.js.
export default function OrderPuzzleSheet({ sheet, theme, dir, clues, twist, name = '', answers = false }) {
  const th = THEMES[theme] || THEMES.train
  const n = sheet.items.length
  const { art, slots } = th.draw(n, dir)
  const title = th.title(dir)
  const word = twist === 'word'
  const rows = Math.ceil(n / 2)
  const exTop = word ? 52 : 47, rowGap = n <= 6 ? 17 : n <= 8 ? 14.5 : 12.5 // fewer exercises get more room
  const dirText = dir === 'desc' ? 'מהגדול לקטן' : 'מהקטן לגדול'
  const valueAt = k => sheet.items[sheet.order[k]].c
  return <Sheet label={`${answers ? 'פתרון — ' : ''}${title}: פותרים ומסדרים ${dirText}`}>
    <T x={100} y={12} size={8.5} weight={800}>{answers ? `פתרון — ${title}` : title}</T>
    <T x={190} y={21.5} size={4.6} anchor="start">שם:</T>
    <path d="M180.5 22.5 H118" stroke={INK} strokeWidth={0.35} />
    {name && !answers && <T x={149} y={21} size={5.2} weight={700}>{name}</T>}
    <T x={78} y={21.5} size={4.6} anchor="start">תאריך:</T>
    <path d="M64 22.5 H12" stroke={INK} strokeWidth={0.35} />
    <T x={190} y={31} size={4.2} anchor="start">1. פתרו את התרגילים וכתבו כל תוצאה בריבוע שלה. כל התוצאות בדף שונות זו מזו.</T>
    <T x={190} y={37.5} size={4.2} anchor="start">{`2. העתיקו את התוצאות ${th.where} לפי הסדר, `}<tspan fontWeight={800}>{dirText}</tspan>{` — ${th.path(dir)}.`}</T>
    {word && <T x={190} y={44} size={4.2} anchor="start">3. ליד כל תרגיל יש אות. כתבו אותה בריבוע הקטן שליד התוצאה בציור — ותגלו מילה סודית!</T>}

    {sheet.items.map((e, i) => <Exercise key={i} e={e} i={i} xr={i < rows ? 190 : 96} y={exTop + (i % rows) * rowGap} letter={word ? sheet.letterOf[i] : ''} answers={answers} />)}
    <path d={`M10 ${ART_TOP - 3} H190`} stroke="#999" strokeWidth={0.35} strokeDasharray="2 1.5" />

    {art}
    {slots.map((s, k) => <Slot key={k} s={s} value={valueAt(k)} answers={answers} />)}
    {word && slots.map((s, k) => <LetterBox key={'l' + k} x={s.letter[0]} y={s.letter[1]} letter={answers ? sheet.letterOf[sheet.order[k]] : ''} />)}
    {clues && <><Clue x={slots[0].clue[0]} y={slots[0].clue[1]} text={dir === 'desc' ? 'הכי גדול' : 'הכי קטן'} />
      <Clue x={slots[n - 1].clue[0]} y={slots[n - 1].clue[1]} text={dir === 'desc' ? 'הכי קטן' : 'הכי גדול'} /></>}
    {theme === 'flower' && <><T x={100} y={185} size={3.6} weight={700}>בכיוון</T><T x={100} y={190} size={3.6} weight={700}>השעון</T></>}

    {word && <g>
      <T x={150} y={262} size={4.8} weight={700} anchor="start">המילה הסודית:</T>
      <path d="M118 263 H48" stroke={INK} strokeWidth={0.4} />
      {answers && <T x={83} y={261.5} size={5.6} weight={800} fill={ANS}>{sheet.word}</T>}
    </g>}
    {twist === 'edges' && <g>
      <T x={190} y={258} size={4.2} anchor="start" weight={700}>בדיקה עצמית:</T>
      <T x={164} y={258} size={4.2} anchor="start">{`חברו את המספר הראשון בציור ואת המספר האחרון. אם יצא ${sheet.check} — סידרתם נכון!`}</T>
    </g>}
  </Sheet>
}
