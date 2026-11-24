import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import { BOX_SIZES, TAB, TUCK, netLayout, weeksToGoal, coinAmount, coinTotal, fmt, weeksLabel, COIN_COUNT } from './piggyBankMath'

// "קופת חיסכון וחיסכון למטרה": a cut-and-fold piggy-bank box (square base box net with coin slot and glue tabs),
// a 20-coin savings goal tracker, and an on-screen "how many weeks until my goal" calculator.
const PATH = '/learn/money/piggy-bank'
const PINK = '#fbcfe8', COIN = '#fde68a'

function Fold({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth=".35" strokeDasharray="2 1.6" />
}
function Cut({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111" strokeWidth=".5" />
}

// A trapezoid glue tab on an edge. (ax,ay)-(bx,by) is the edge, (nx,ny) is the outward unit normal.
function Tab({ ax, ay, bx, by, nx, ny, depth = TAB, color }) {
  const len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len, inset = Math.min(depth * 0.6, len / 4)
  const p = [[ax, ay], [ax + ux * inset + nx * depth, ay + uy * inset + ny * depth], [bx - ux * inset + nx * depth, by - uy * inset + ny * depth], [bx, by]]
  return <polygon points={p.map(q => q.join(',')).join(' ')} fill={color ? '#e5e7eb' : '#fff'} stroke="#111" strokeWidth=".5" strokeLinejoin="round" />
}

function Pig({ cx, cy, r, color }) {
  const f = color ? PINK : '#fff'
  return <g stroke="#111" strokeWidth=".45">
    <polygon points={`${cx - r * 0.75},${cy - r * 0.55} ${cx - r * 0.35},${cy - r * 1.05} ${cx - r * 0.1},${cy - r * 0.8}`} fill={f} strokeLinejoin="round" />
    <polygon points={`${cx + r * 0.75},${cy - r * 0.55} ${cx + r * 0.35},${cy - r * 1.05} ${cx + r * 0.1},${cy - r * 0.8}`} fill={f} strokeLinejoin="round" />
    <circle cx={cx} cy={cy} r={r} fill={f} />
    <ellipse cx={cx} cy={cy + r * 0.25} rx={r * 0.42} ry={r * 0.3} fill={color ? '#f9a8d4' : '#fff'} />
    <ellipse cx={cx - r * 0.14} cy={cy + r * 0.25} rx={r * 0.06} ry={r * 0.1} fill="#111" stroke="none" />
    <ellipse cx={cx + r * 0.14} cy={cy + r * 0.25} rx={r * 0.06} ry={r * 0.1} fill="#111" stroke="none" />
    <circle cx={cx - r * 0.4} cy={cy - r * 0.2} r={r * 0.09} fill="#111" stroke="none" />
    <circle cx={cx + r * 0.4} cy={cy - r * 0.2} r={r * 0.09} fill="#111" stroke="none" />
  </g>
}

function CoinMotif({ cx, cy, r, color }) {
  return <g>
    <circle cx={cx} cy={cy} r={r} fill={color ? COIN : '#fff'} stroke="#111" strokeWidth=".4" />
    <circle cx={cx} cy={cy} r={r * 0.75} fill="none" stroke="#111" strokeWidth=".2" />
    <T x={cx} y={cy + r * 0.36} size={r * 1.05} weight={800}>₪</T>
  </g>
}

function BoxNet({ size, name, color }) {
  const { S, H } = BOX_SIZES[size]
  const n = netLayout(S, H)
  const { x0, yp } = n
  const [p0, p1, p2, p3] = n.panels
  const face = (f, fill) => <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={color ? fill : '#fff'} />
  const xr = x0 + 4 * S, yb = yp + H
  const slotW = S * 0.7, slotH = 3.6
  return <g>
    <T x={100} y={10} size={8} weight={800}>🐷 קופת החיסכון שלי — גוזרים ומקפלים</T>
    <T x={100} y={16} size={3.8} fill="#555">קו רציף = גוזרים · קו מקווקו = מקפלים · האפור = לשוניות להדבקה</T>
    {/* faces */}
    {face(n.top, '#fef3c7')}
    {n.panels.map((p, i) => <g key={i}>{face(p, i === 1 ? '#fce7f3' : ['#dbeafe', '#fce7f3', '#dcfce7', '#ede9fe'][i])}</g>)}
    {face(n.bottom, '#fef3c7')}
    {/* glue tabs: lid (left, right, far), side tab, base tuck flap */}
    <Tab ax={n.top.x} ay={n.top.y + S} bx={n.top.x} by={n.top.y} nx={-1} ny={0} color={color} />
    <Tab ax={n.top.x + S} ay={n.top.y} bx={n.top.x + S} by={n.top.y + S} nx={1} ny={0} color={color} />
    <Tab ax={n.top.x} ay={n.top.y} bx={n.top.x + S} by={n.top.y} nx={0} ny={-1} color={color} />
    <Tab ax={xr} ay={yp} bx={xr} by={yb} nx={1} ny={0} color={color} />
    <Tab ax={n.bottom.x} ay={n.bottom.y + S} bx={n.bottom.x + S} by={n.bottom.y + S} nx={0} ny={1} depth={TUCK} color={color} />
    {/* decorations */}
    <rect x={n.top.x + (S - slotW) / 2} y={n.top.y + (S - slotH) / 2} width={slotW} height={slotH} rx={slotH / 2} fill="#111" />
    <T x={n.top.x + S / 2} y={n.top.y + S / 2 - 4} size={3.2} fill="#555">חריץ למטבעות — חותכים</T>
    <CoinMotif cx={n.top.x + S / 2} cy={n.top.y + S / 2 + 9} r={4.5} color={color} />
    <Pig cx={p1.x + S / 2} cy={p1.y + H / 2} r={Math.min(S, H) * 0.34} color={color} />
    <T x={p1.x + S / 2} y={p1.y + H - 4} size={3.6} weight={700}>אני חוסך/ת!</T>
    {[p0, p2].map((p, k) => <g key={k}>
      <CoinMotif cx={p.x + S * 0.3} cy={p.y + H * 0.22} r={S * 0.14} color={color} />
      <CoinMotif cx={p.x + S * 0.68} cy={p.y + H * 0.45} r={S * 0.18} color={color} />
      <CoinMotif cx={p.x + S * 0.32} cy={p.y + H * 0.74} r={S * 0.12} color={color} />
    </g>)}
    <T x={p3.x + S / 2} y={p3.y + H / 2 - 4} size={Math.min(5.6, S / 8)} weight={800}>קופת החיסכון</T>
    <T x={p3.x + S / 2} y={p3.y + H / 2 + 3} size={Math.min(5.6, S / 8)} weight={800}>{name ? `של ${name}` : 'של ____________'}</T>
    <T x={n.bottom.x + S / 2} y={n.bottom.y + S / 2 + 1} size={3.4} fill="#777">הבסיס · עוגה בוגה</T>
    <T x={n.bottom.x + S / 2} y={n.bottom.y + S + TUCK / 2 + 1.2} size={3} fill="#555">לשונית כניסה</T>
    {/* cut lines (outer boundary) */}
    <Cut x1={p0.x} y1={yp} x2={p0.x} y2={yb} />
    <Cut x1={p0.x} y1={yp} x2={p0.x + S} y2={yp} />
    <Cut x1={p0.x} y1={yb} x2={p0.x + S} y2={yb} />
    <Cut x1={p2.x} y1={yp} x2={p2.x + S} y2={yp} />
    <Cut x1={p2.x} y1={yb} x2={p2.x + S} y2={yb} />
    <Cut x1={p3.x} y1={yp} x2={p3.x + S} y2={yp} />
    <Cut x1={p3.x} y1={yb} x2={p3.x + S} y2={yb} />
    <Cut x1={n.bottom.x} y1={n.bottom.y} x2={n.bottom.x} y2={n.bottom.y + S} />
    <Cut x1={n.bottom.x + S} y1={n.bottom.y} x2={n.bottom.x + S} y2={n.bottom.y + S} />
    {/* fold lines */}
    <Fold x1={p1.x} y1={yp} x2={p1.x + S} y2={yp} />
    <Fold x1={p1.x} y1={yb} x2={p1.x + S} y2={yb} />
    {[1, 2, 3].map(i => <Fold key={i} x1={x0 + i * S} y1={yp} x2={x0 + i * S} y2={yb} />)}
    <Fold x1={xr} y1={yp} x2={xr} y2={yb} />
    <Fold x1={n.top.x} y1={n.top.y} x2={n.top.x} y2={n.top.y + S} />
    <Fold x1={n.top.x + S} y1={n.top.y} x2={n.top.x + S} y2={n.top.y + S} />
    <Fold x1={n.top.x} y1={n.top.y} x2={n.top.x + S} y2={n.top.y} />
    <Fold x1={n.bottom.x} y1={n.bottom.y + S} x2={n.bottom.x + S} y2={n.bottom.y + S} />
    {/* instructions */}
    {[
      '1. צובעים ומקשטים את הקופה לפני הגזירה — כך הרבה יותר קל.',
      '2. גוזרים לאורך הקו הרציף. את חריץ המטבעות חותכים בעזרת מבוגר.',
      '3. מקפלים לאורך כל הקווים המקווקווים, ויוצרים קופסה.',
      '4. מורחים דבק על הלשונית שבקצה הרצועה ומדביקים אותה פנימה.',
      '5. מדביקים את שלוש לשוניות המכסה העליון, כשהחריץ נשאר למעלה.',
      '6. הבסיס נסגר בלשונית הכניסה בלי דבק, וכך אפשר לפתוח אותו ולספור את החיסכון.',
    ].map((t, i) => <T key={i} x={192} y={n.yEnd + 12 + i * 7.2} size={4.6} anchor="start" weight={i === 5 ? 700 : 400}>{t}</T>)}
    <T x={100} y={264} size={3.5} fill="#888">עוגה בוגה · ugabuga.co.il/learn/money</T>
  </g>
}

function Tracker({ goal, target, color }) {
  const t = Number(target) > 0 ? Number(target) : 0
  const each = coinAmount(t)
  const cols = 5, cw = 36, ch = 34, gx0 = (200 - cols * cw) / 2, gy0 = 112
  return <g>
    <rect x={5} y={5} width={190} height={26} rx={5} fill={color ? '#fde68a' : '#fff'} stroke="#334155" strokeWidth=".6" />
    <T x={100} y={17} size={10} weight={800}>🪙 לוח החיסכון למטרה</T>
    <T x={100} y={26} size={4} fill="#555">כל פעם שחסכתי עוד מטבע — צובעים אותו</T>
    <rect x={105} y={38} width={90} height={62} rx={4} fill="#fff" stroke="#334155" strokeWidth=".45" strokeDasharray="2 1.5" />
    <T x={150} y={45} size={4.2} weight={700} fill="#555">מציירים כאן את המטרה</T>
    <T x={96} y={46} size={5.2} weight={700} anchor="start">המטרה שלי:</T>
    {goal ? <T x={96} y={56} size={goal.length > 14 ? 5.6 : 7.5} weight={800} anchor="start">{goal}</T> : <line x1={20} y1={57} x2={96} y2={57} stroke="#334155" strokeWidth=".4" />}
    <T x={96} y={72} size={5.2} weight={700} anchor="start">כמה היא עולה:</T>
    {t > 0 ? <T x={96} y={82} size={9} weight={800} anchor="start">{fmt(t)} ₪</T> : <line x1={20} y1={83} x2={96} y2={83} stroke="#334155" strokeWidth=".4" />}
    <T x={96} y={95} size={4.2} fill="#555" anchor="start">{t > 0 ? `כל מטבע שווה ${fmt(each)} ₪` : 'כל מטבע שווה: ______ ₪'}</T>
    {Array.from({ length: COIN_COUNT }, (_, i) => {
      const r = Math.floor(i / cols), c = i % cols
      const cx = 200 - gx0 - cw / 2 - c * cw, cy = gy0 + r * ch + 13
      const label = t > 0 ? fmt(each) : ''
      return <g key={i}>
        <circle cx={cx} cy={cy} r={13.5} fill="#fff" stroke="#334155" strokeWidth=".6" />
        <circle cx={cx} cy={cy} r={10.5} fill={color ? '#fffbeb' : '#fff'} stroke="#94a3b8" strokeWidth=".3" />
        <T x={cx} y={cy + (label ? -1 : 2.5)} size={label ? (label.length > 5 ? 4.6 : 6) : 5} weight={800} fill="#334155">{label || '₪'}</T>
        {label && <T x={cx} y={cy + 5} size={3.6} fill="#64748b">₪</T>}
        {t > 0 && <T x={cx} y={cy + 19.5} size={3} fill="#94a3b8">עד כאן {fmt(coinTotal(t, i + 1))}</T>}
      </g>
    })}
    <T x={100} y={256} size={4.4} weight={700}>התחלתי ב־ ____ / ____ · הגעתי למטרה ב־ ____ / ____ 🎉</T>
    <T x={100} y={263} size={3.5} fill="#888">עוגה בוגה · ugabuga.co.il/learn/money</T>
  </g>
}

const numberInput = 'mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal'

export default function PiggyBank() {
  const [what, setWhat] = useState('both')
  const [size, setSize] = useState('medium')
  const [color, setColor] = useState('yes')
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [target, setTarget] = useState('120')
  const [weekly, setWeekly] = useState('10')
  const [saved, setSaved] = useState('0')
  const isColor = color === 'yes'
  const cleanName = name.trim(), cleanGoal = goal.trim()

  const pages = []
  if (what !== 'tracker') pages.push({ key: 'box', svg: <Sheet label="תבנית לגזירה והדבקה של קופת חיסכון"><BoxNet size={size} name={cleanName} color={isColor} /></Sheet> })
  if (what !== 'box') pages.push({ key: 'tracker', svg: <Sheet label="לוח חיסכון למטרה עם 20 מטבעות לצביעה"><Tracker goal={cleanGoal} target={target} color={isColor} /></Sheet> })

  const res = weeksToGoal({ target, weekly, saved })
  const targetNum = Number(target)
  let answer
  if (!res.valid) answer = 'מלאו סכום יעד וסכום חיסכון שבועי גדולים מאפס, ונחשב.'
  else if (res.done) answer = 'כבר הגעתם למטרה! אפשר ללכת לקנות 🎉'
  else answer = `חסרים עוד ${fmt(res.remaining)} ₪. בקצב הזה תגיעו למטרה בעוד ${weeksLabel(res.weeks)}${res.weeks >= 5 ? ` (בערך ${fmt(res.months)} חודשים)` : ''}.`

  return <PrintableShell path={PATH} emoji="🐷" h1="קופת חיסכון וחיסכון למטרה לילדים"
    seoTitle="קופת חיסכון לילדים להדפסה וחיסכון למטרה — תבנית לגזירה, לוח מטבעות ומחשבון"
    description="קופת חיסכון לילדים שגוזרים ומקפלים בבית, לוח חיסכון למטרה עם 20 מטבעות לצביעה, ומחשבון שמראה בעוד כמה שבועות מגיעים למטרה. כולל טיפים להורים על דמי כיס וחיסכון. חינם."
    sub="גוזרים קופה, בוחרים מטרה וצובעים מטבע אחרי מטבע, עד שמגיעים"
    crumbs={[{ label: 'כסף וחינוך פיננסי', href: '/learn/money' }]}
    controls={<div className="space-y-4">
      <p className="m-0 text-center font-bold">מה מדפיסים?</p>
      <Choice label="מה להדפיס" value={what} onChange={setWhat} options={[['both', 'קופה + לוח חיסכון'], ['box', 'רק הקופה'], ['tracker', 'רק לוח החיסכון']]} />
      {what !== 'tracker' && <>
        <Choice label="גודל הקופה" value={size} onChange={setSize} options={[['small', 'קטנה (4×4×4 ס״מ)'], ['medium', 'בינונית (4.2×4.2×5.6)'], ['large', 'גבוהה (4.4×4.4×7)']]} />
        <Field label="שם הילד או הילדה (לא חובה)" value={name} onChange={setName} placeholder="למשל: נועם" maxLength={14} />
      </>}
      {what !== 'box' && <>
        <Field label="מה אני חוסך/ת בשבילו? (לא חובה)" value={goal} onChange={setGoal} placeholder="למשל: אופניים" maxLength={22} />
        <label className="block text-center font-bold">כמה המטרה עולה (בשקלים)
          <input type="number" inputMode="decimal" min="1" max="100000" step="1" value={target} onChange={e => setTarget(e.target.value)} className={numberInput} />
        </label>
        <p className="m-0 text-center text-sm">{targetNum > 0 ? `כל אחד מ־20 המטבעות בלוח יהיה שווה ${fmt(coinAmount(targetNum))} ₪.` : 'כתבו סכום כדי שהמטבעות ימולאו בסכומים.'}</p>
      </>}
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'צבעוני'], ['no', 'שחור-לבן, לצביעה בבית']]} />
    </div>}
    pages={pages} printTitle="קופת חיסכון וחיסכון למטרה"
    lead={<p className="mx-auto mb-6 max-w-2xl text-center text-sm">עוד על כסף לילדים: <Link to="/learn/money" className="font-bold underline">כסף וחינוך פיננסי</Link> · <Link to="/learn/money/saving" className="font-bold underline">שיעור חיסכון</Link> · <Link to="/family/pocket-money" className="font-bold underline">דמי כיס וחיסכון</Link></p>}
    related={[{ label: 'כסף וחינוך פיננסי לילדים', href: '/learn/money' }, { label: 'שיעור: חיסכון', href: '/learn/money/saving' }, { label: 'דמי כיס וחיסכון', href: '/family/pocket-money' }, { label: 'קורס חינוך פיננסי', href: '/courses/money' }]}
    paragraphs={[
      'חיסכון הוא אחד הדברים הראשונים שילד לומד על כסף, ואחד הקשים: להמתין למשהו שרוצים. קופה שרואים ושומעים, מטרה שאפשר לצייר וצעדים קטנים שאפשר לצבוע, הופכים את ההמתנה למשחק עם סוף ברור.',
      'בעמוד הזה שלושה כלים. הראשון הוא קופת חיסכון מנייר: גוזרים, מקפלים ומדביקים קופסה עם חריץ למטבעות, לשוניות להדבקה וחזיר מקושט על הצד. אפשר לצבוע אותה בעצמכם או להדפיס בצבע. הקופה מגיעה בשלושה גדלים, והבסיס שלה נסגר בלשונית כניסה כדי שאפשר יהיה לפתוח אותו ולספור.',
      'הכלי השני הוא לוח חיסכון למטרה. כותבים מה חוסכים בשבילו, כמה זה עולה, ומקבלים 20 מטבעות לצביעה. כל מטבע שווה חלק אחד מ־20 מהסכום: מחלקים את המחיר ב־20. למשל, מטרה של 100 ₪ נותנת מטבעות של 5 ₪ כל אחד, ומטרה של 150 ₪ נותנת מטבעות של 7.5 ₪. מתחת לכל מטבע כתוב כמה כבר נחסך עד אליו, כך שהילד רואה כמה נשאר.',
      'הכלי השלישי הוא המחשבון. כותבים את מחיר המטרה, כמה חוסכים כל שבוע וכמה כבר יש, ומקבלים בעוד כמה שבועות מגיעים. התשובה מעוגלת כלפי מעלה לשבוע שלם, כי חיסכון נספר בסוף כל שבוע. חישוב כזה עוזר לילד להבין למה מטרה גדולה לוקחת זמן, ולמה אפשר לקצר אותה בחיסכון של שקל או שניים נוספים בשבוע.',
      'טיפים להורים על דמי כיס וחיסכון: קבעו סכום קבוע ויום קבוע, כדי שהילד ידע על מה הוא יכול לסמוך. אל תבטלו דמי כיס כעונש ואל תשתמשו בהם כשכר על התנהגות. עזרו לילד לבחור מטרה שהוא מתלהב ממנה ושאפשר להגיע אליה בכמה שבועות, ורק אחר כך מטרות ארוכות יותר. ילדים קטנים צריכים לראות התקדמות מהר. אפשר לחלק את הכסף לשלוש קופות, לבזבוז, לחיסכון ולנתינה, כמו בדף דמי הכיס. מי שרוצה, יכול להוסיף לכל שקל שהילד חסך סכום קטן משלו, אבל זו החלטה של כל משפחה. כשהילד מגיע למטרה, תנו לו לקנות בעצמו, לשלם ולקבל את העודף: זו החוויה שמלמדת יותר מכל הסבר.',
      'לשיעורים מלאים על כסף, תקציב, חיסכון ובנק לילדים, היכנסו אל דף הכסף והחינוך הפיננסי של האתר.',
    ]}
    faq={[
      { q: 'איך מכינים קופת חיסכון מנייר?', a: 'מדפיסים את התבנית על נייר או על כרטיסי ברכה עבים, צובעים, גוזרים לאורך הקו הרציף וחותכים את חריץ המטבעות. מקפלים בקווים המקווקווים, מדביקים את הלשונית הצדדית ואת שלוש לשוניות המכסה, ובסוף סוגרים את הבסיס בלשונית הכניסה.' },
      { q: 'האם הקופה מחזיקה מטבעות כבדים?', a: 'היא מיועדת לחיסכון קטן ולהמחשה. נייר עבה (מ־160 גרם ומעלה) מחזיק טוב יותר. כשהקופה מתמלאת כדאי להעביר את הכסף לקופה עמידה או לחשבון חיסכון.' },
      { q: 'איך מחושב הסכום של כל מטבע בלוח?', a: 'מחלקים את מחיר המטרה ב־20. מטרה של 200 ₪ נותנת מטבעות של 10 ₪, ומטרה של 120 ₪ נותנת מטבעות של 6 ₪. אפשר לצבוע מטבע בכל פעם שהילד חוסך את הסכום, וגם לחסוך סכומים קטנים יותר ולצבוע מטבע כשמצטבר סכום מלא.' },
      { q: 'איך המחשבון מחשב בעוד כמה שבועות מגיעים למטרה?', a: 'מחסירים מהמחיר את מה שכבר נחסך, ומחלקים בסכום החיסכון השבועי. התוצאה מעוגלת כלפי מעלה לשבוע שלם. למשל, כשחסרים 100 ₪ וחוסכים 15 ₪ בשבוע, צריך 7 שבועות.' },
      { q: 'מאיזה גיל כדאי להתחיל לחסוך?', a: 'אפשר כבר בגיל הגן, עם מטרה קטנה וקרובה. ילדים בכיתות א׳–ב׳ כבר מבינים את ההיגיון של מטרה ושל מטבעות שמצטברים, והמחשבון מתאים בעיקר מכיתה ג׳ ומעלה.' },
      { q: 'כמה דמי כיס לתת?', a: 'אין סכום אחד נכון. כל משפחה קובעת לפי הגיל, מה הילד אמור לממן מהכסף הזה ומה אפשרויות המשפחה. החשוב הוא שהסכום קבוע, שמסבירים מראש על מה הכסף מיועד, ושהילד מקבל גם הזדמנות לטעות ולהתאמן. עוד בדף דמי הכיס וחיסכון.' },
    ]}
  >
    <section className="mx-auto mt-10 max-w-xl wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow-sm" aria-labelledby="pb-calc">
      <h2 id="pb-calc" className="mb-1 text-center text-2xl font-bold">🧮 בעוד כמה שבועות אגיע למטרה?</h2>
      <p className="mb-4 text-center text-sm text-[var(--muted-foreground)]">כתבו שלושה מספרים וקבלו תשובה מיד</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-center font-bold">המטרה עולה (₪)
          <input type="number" inputMode="decimal" min="1" step="1" value={target} onChange={e => setTarget(e.target.value)} className={numberInput} />
        </label>
        <label className="block text-center font-bold">חוסך/ת בשבוע (₪)
          <input type="number" inputMode="decimal" min="0" step="1" value={weekly} onChange={e => setWeekly(e.target.value)} className={numberInput} />
        </label>
        <label className="block text-center font-bold">כבר חסכתי (₪)
          <input type="number" inputMode="decimal" min="0" step="1" value={saved} onChange={e => setSaved(e.target.value)} className={numberInput} />
        </label>
      </div>
      <p role="status" aria-live="polite" className="mt-4 mb-0 rounded-xl border-2 border-[var(--border)] bg-white p-3 text-center text-lg font-bold">{answer}</p>
    </section>
  </PrintableShell>
}
