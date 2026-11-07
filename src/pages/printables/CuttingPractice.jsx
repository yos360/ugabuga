import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'

// Scissors practice: dashed cutting lines from easy (straight) to hard (spiral), each ending at a picture,
// plus shapes to cut out. Thick lines for ages 3–4, thin lines for 5–6.

const THEMES = {
  animals: ['🐶', '🐱', '🐰', '🐻', '🐸', '🐵'],
  vehicles: ['🚗', '🚌', '🚒', '🚜', '🚀', '✈️'],
  food: ['🍎', '🍌', '🍓', '🍉', '🍪', '🍦'],
  sea: ['🐟', '🐙', '🐢', '🐬', '🦀', '🐳'],
}
const THEME_LABELS = [['animals', '🐶 חיות'], ['vehicles', '🚗 כלי רכב'], ['food', '🍎 אוכל'], ['sea', '🐟 ים']]
export const LEVELS = [
  ['straight', '➖ קווים ישרים', 'גוזרים לאורך הקו הישר עד הציור'],
  ['zigzag', '⚡ זיגזג', 'גוזרים בזיגזג — עוצרים בכל פינה ומסובבים את הדף'],
  ['waves', '〰️ גלים', 'גוזרים לאורך הגלים, לאט ובזהירות'],
  ['steps', '📶 מדרגות', 'גוזרים במדרגות: ישר, פנייה, ושוב ישר'],
  ['shapes', '⭐ צורות', 'גוזרים כל צורה לאורך הקו המקווקו'],
  ['spiral', '🌀 ספירלה', 'גוזרים מבחוץ פנימה עד הציור שבאמצע'],
]
const X0 = 24, X1 = 172

// One cutting line from left to right at height y.
export function linePath(kind, y, amp = 7) {
  if (kind === 'straight') return `M${X0} ${y} H${X1}`
  if (kind === 'zigzag') { let d = `M${X0} ${y}`; for (let x = X0 + 12, up = true; x <= X1; x += 12, up = !up) d += ` L${x} ${y + (up ? -amp : amp)}`; return d }
  if (kind === 'waves') { let d = `M${X0} ${y}`; for (let x = X0, up = true; x + 18 <= X1 + 0.1; x += 18, up = !up) d += ` Q${x + 9} ${y + (up ? -amp * 1.6 : amp * 1.6)} ${x + 18} ${y}`; return d }
  // steps
  let d = `M${X0} ${y + amp}`
  for (let x = X0, up = true; x + 16 <= X1 + 0.1; x += 16, up = !up) d += ` H${x + 16} V${y + (up ? -amp : amp)}`
  return d
}

function shapePath(i, cx, cy, r) {
  if (i === 0) return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`
  if (i === 1) return `M${cx - r} ${cy - r} h${2 * r} v${2 * r} h${-2 * r} Z`
  if (i === 2) return `M${cx} ${cy - r} L${cx + r} ${cy + r * 0.8} L${cx - r} ${cy + r * 0.8} Z`
  if (i === 3) { const pts = Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; return `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}` }); return 'M' + pts.join(' L') + ' Z' }
  if (i === 4) return `M${cx} ${cy + r * 0.85} C${cx - r * 1.5} ${cy - r * 0.2} ${cx - r * 0.6} ${cy - r * 1.2} ${cx} ${cy - r * 0.4} C${cx + r * 0.6} ${cy - r * 1.2} ${cx + r * 1.5} ${cy - r * 0.2} ${cx} ${cy + r * 0.85} Z`
  const pts = Array.from({ length: 6 }, (_, k) => { const a = k * Math.PI / 3; return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}` })
  return 'M' + pts.join(' L') + ' Z'
}
const SHAPE_NAMES = ['עיגול', 'ריבוע', 'משולש', 'כוכב', 'לב', 'משושה']

function spiralPath(cx, cy, turns, step) {
  let d = ''
  for (let a = 0; a <= turns * 2 * Math.PI; a += 0.15) {
    const r = turns * step - (a / (2 * Math.PI)) * step
    if (r < step * 0.6) break
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a)
    d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
  }
  return d
}

function CutSheet({ level, theme, thick, page }) {
  const [, label, how] = LEVELS.find(l => l[0] === level)
  const em = THEMES[theme]
  const sw = thick ? 1.6 : 0.8, dash = thick ? '4 2.5' : '3 2', color = '#222'
  return <Sheet label={`תרגול גזירה: ${label.replace(/^\S+ /, '')}`}>
    <T x={100} y={16} size={10} weight={900}>✂️ תרגול גזירה — {label.replace(/^\S+ /, '')}</T>
    <T x={100} y={25} size={5.4} fill="#444">{how}</T>
    <T x={100} y={33} size={5} fill="#666">שם: ______________</T>
    {level === 'shapes' && [0, 1, 2, 3, 4, 5].map(i => {
      const cx = 55 + (i % 2) * 90, cy = 75 + Math.floor(i / 2) * 68
      const k = (i + page) % 6
      return <g key={i}><path d={shapePath(k, cx, cy, 25)} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" />
        <text x={cx} y={cy + 4} fontSize="12" textAnchor="middle">{em[(i + page) % em.length]}</text>
        <T x={cx} y={cy + 36} size={4.5} fill="#666">{SHAPE_NAMES[k]}</T></g>
    })}
    {level === 'spiral' && <g>
      <path d={spiralPath(100, 150, 4, 22)} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" />
      <text x="100" y="157" fontSize="18" textAnchor="middle">{em[page % em.length]}</text>
      <text x={100 + 88 + 2} y="153" fontSize="9" textAnchor="middle">✂️</text>
    </g>}
    {!['shapes', 'spiral'].includes(level) && [0, 1, 2, 3, 4, 5].map(i => {
      const y = 56 + i * 36
      return <g key={i}>
        <text x="12" y={y + 3} fontSize="9" textAnchor="middle">✂️</text>
        <path d={linePath(level, y, thick ? 8 : 6)} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" strokeLinecap="round" />
        <text x="184" y={y + 5} fontSize="14" textAnchor="middle">{em[(i + page) % em.length]}</text>
      </g>
    })}
  </Sheet>
}

const FAQ = [
  { q: 'מאיזה גיל מתחילים לגזור?', a: 'בערך מגיל 3 ילדים מתחילים "לנגוס" בנייר עם המספריים, ובגיל 4–5 רובם גוזרים לאורך קו ישר. קו מעוקל וצורות מגיעים בגיל 5–6. מתחילים תמיד בקווים ישרים וקצרים ועולים ברמה רק כשזה הולך בקלות.' },
  { q: 'אילו מספריים מתאימים לילדים?', a: 'מספריים לילדים עם קצה מעוגל ולהב קצר, במידה שמתאימה ליד. לשמאליים יש מספריים מיוחדים, ושווה לבדוק אם הילד שמאלי לפני שמתסכלים.' },
  { q: 'איך מחזיקים את המספריים?', a: 'האגודל למעלה בחור הקטן, האצבעות בחור הגדול, והמרפק קרוב לגוף. היד השנייה מחזיקה את הדף ומסובבת אותו — לא את המספריים. משפט שעוזר: "האגודל מסתכל לתקרה".' },
]

export default function CuttingPractice() {
  const [level, setLevel] = useState('straight')
  const [theme, setTheme] = useState('animals')
  const [thick, setThick] = useState('thick')
  const [count, setCount] = useState('1')
  const levels = level === 'all' ? LEVELS.map(l => l[0]) : Array.from({ length: Number(count) }, () => level)
  const pages = levels.map((l, i) => ({ key: [l, theme, thick, i].join('|'), svg: <CutSheet level={l} theme={theme} thick={thick === 'thick'} page={i} /> }))
  const controls = <div className="space-y-4">
    <div><p className="mb-2 text-center font-bold">רמה</p><Choice label="רמה" value={level} onChange={setLevel} options={[...LEVELS.map(l => [l[0], l[1]]), ['all', '📚 כל הרמות (6 דפים)']]} /></div>
    <div><p className="mb-2 text-center font-bold">ציורים</p><Choice label="ציורים" value={theme} onChange={setTheme} options={THEME_LABELS} /></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div><p className="mb-2 text-center font-bold">עובי הקו</p><Choice label="עובי הקו" value={thick} onChange={setThick} options={[['thick', 'עבה (גיל 3–4)'], ['thin', 'דק (גיל 5–6)']]} /></div>
      {level !== 'all' && <div><p className="mb-2 text-center font-bold">כמה דפים</p><Choice label="כמה דפים" value={count} onChange={setCount} options={[['1', '1'], ['3', '3'], ['5', '5']]} /></div>}
    </div>
  </div>
  return <PrintableShell path="/printables/cutting-practice" emoji="✂️" h1="תרגול גזירה להדפסה"
    seoTitle="דפי תרגול גזירה לגן — קווים, זיגזג, גלים, צורות וספירלה | חינם"
    description="דפי תרגול גזירה להדפסה בחינם לגיל 3–6: קווים ישרים, זיגזג, גלים, מדרגות, צורות לגזירה וספירלה. קו עבה לקטנים או דק לגדולים, עם ציורים של חיות, כלי רכב, אוכל וים."
    sub="שש רמות — מקו ישר ועד ספירלה. כל קו מוביל לציור"
    crumbs={[{ label: 'מוטוריקה עדינה', href: '/printables/fine-motor' }]} controls={controls} pages={pages} printTitle="תרגול גזירה" previewAll
    paragraphs={[
      'גזירה היא אחת המיומנויות החשובות של מוטוריקה עדינה לפני כיתה א׳: היא מחזקת את שרירי כף היד, מלמדת את שתי הידיים לעבוד יחד, ומכינה את היד לאחיזת עיפרון.',
      'הדפים בנויים בשש רמות. מתחילים בקווים ישרים, עוברים לזיגזג ולמדרגות (שבהם עוצרים בפינה ומסובבים את הדף), אחר כך לגלים, לצורות סגורות ולבסוף לספירלה. לקטנים בוחרים קו עבה, ולגדולים קו דק שדורש יותר דיוק.',
    ]}
    faq={FAQ}
    related={[{ label: 'מוטוריקה עדינה — מחולל', href: '/printables/fine-motor' }, { label: 'גזרו וסדרו', href: '/printables/activity/cut-and-order' }, { label: 'מבוכים להדפסה', href: '/printables/mazes' }, { label: 'דפי עבודה לגן', href: '/printables/kindergarten-worksheets' }]}
    body={<p className="mx-auto max-w-3xl text-center">אחרי הגזירה אפשר לעבור ל<Link to="/printables/activity/cut-and-order" className="font-bold underline">גזרו וסדרו</Link> — גוזרים כרטיסים ומסדרים סיפור לפי הסדר.</p>} />
}
