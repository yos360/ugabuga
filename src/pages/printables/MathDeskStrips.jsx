import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { PAGE_W, PAGE_H, MARGIN, CONTENT_W, CONTENT_TOP, multiples, packStrips, copiesPerPage, tenFrames, baseTen, rulerTicks, range } from './mathDeskStrips'
import './math-desk-strips.css'

// Two printable desk strips for math, sharing one full-bleed A4 frame drawn in millimetres:
//   /printables/multiplication-strips — "סרגלי כפולות": a strip per number, with answers, blanks or a fold-back answer flap
//   /printables/number-strip          — "סרגל מספרים לשולחן": 1–10 / 1–20 / 1–100 with ten-frame dots and a true-size cm ruler
// Math is written left to right, as in Israeli textbooks; the Hebrew labels stay right to left.

const MULT_PATH = '/printables/multiplication-strips'
const NUMBER_PATH = '/printables/number-strip'
const SIBLINGS = [
  { href: MULT_PATH, label: '✖️ סרגלי כפולות' },
  { href: NUMBER_PATH, label: '🔢 סרגל מספרים לשולחן' },
  { href: '/printables/letter-strip', label: '🔤 סרגל אותיות' },
]
const X0 = MARGIN
const INK = '#1f2937'
const CUT = { fill: 'none', stroke: '#9ca3af', strokeWidth: 0.35, strokeDasharray: '3 2' }

// Left-to-right text for numbers and exercises (in an RTL context "7 × 8" would come out as "8 × 7").
function N({ x, y, size = 5, weight = 600, fill = INK, anchor = 'middle', children }) {
  return <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} direction="ltr" style={{ unicodeBidi: 'isolate' }}>{children}</text>
}

function DeskSheet({ label, title, hint, children }) {
  return <Sheet w={PAGE_W} h={PAGE_H} label={label}>
    <T x={PAGE_W - MARGIN} y={15} size={5} weight={800} anchor="start">{title}</T>
    {hint && <T x={MARGIN} y={15} size={2.9} fill="#4b5563" anchor="end">{hint}</T>}
    {children}
    <T x={PAGE_W / 2} y={284.5} size={2.8} fill="#6b7280">מדפיסים בגודל אמיתי (100%) · ✂️ גוזרים לאורך הקו המקווקו · עוגה בוגה · ugabuga.co.il</T>
  </Sheet>
}

// ── סרגלי כפולות ───────────────────────────────────────────────
const PALETTE = [
  ['#fee2e2', '#b91c1c'], ['#ffedd5', '#c2410c'], ['#fef9c3', '#a16207'], ['#dcfce7', '#15803d'], ['#ccfbf1', '#0f766e'],
  ['#dbeafe', '#1d4ed8'], ['#e0e7ff', '#4338ca'], ['#f3e8ff', '#7e22ce'], ['#fce7f3', '#be185d'], ['#e7e5e4', '#44403c'],
]
// h: row with exercise + answer; hx: exercise-only row (fold version); hf: answer flap row.
const SIZES = {
  small: { rows: 1, h: 15, hx: 9.5, hf: 8.5, tab: 15, ex: 3.4, prod: 5.2, num: 7 },
  regular: { rows: 1, h: 21, hx: 13, hf: 11, tab: 16, ex: 3.7, prod: 6.8, num: 9 },
  large: { rows: 2, h: 26, hx: 16, hf: 14, tab: 22, ex: 6.4, prod: 10, num: 14 },
}
const exercise = (a, b, eq = true) => `${a} × ${b}${eq ? ' =' : ''}`

function multStripHeight(size, mode) {
  const s = SIZES[size]
  return mode === 'fold' ? s.rows * (s.hx + s.hf) : s.rows * s.h
}

function MultStrip({ n, y, mode, size, color }) {
  const s = SIZES[size]
  const [light, dark] = color ? PALETTE[(n - 1) % PALETTE.length] : ['#ffffff', INK]
  const perRow = 10 / s.rows, cw = (CONTENT_W - s.tab) / perRow
  const fold = mode === 'fold'
  const rowH = fold ? s.hx : s.h
  const mainH = s.rows * rowH, flapH = fold ? s.rows * s.hf : 0
  const total = mainH + flapH
  const cells = multiples(n)
  const cellX = i => X0 + s.tab + (i % perRow) * cw
  const cellY = i => y + Math.floor(i / perRow) * rowH
  return <g>
    <rect x={X0 - 1.5} y={y - 1.5} width={CONTENT_W + 3} height={total + 3} rx={2.5} {...CUT} />
    {/* label tab: "כפולות של n" */}
    <rect x={X0} y={y} width={s.tab} height={mainH} fill={color ? light : '#fff'} stroke={INK} strokeWidth={0.45} />
    <T x={X0 + s.tab / 2} y={y + 3.4} size={Math.min(2.9, s.tab / 5.4)} fill={color ? dark : '#374151'} weight={700}>כפולות של</T>
    <N x={X0 + s.tab / 2} y={y + 3.4 + (mainH - 3.4) / 2 + s.num * 0.36} size={s.num} weight={900} fill={color ? dark : INK}>{n}</N>
    {cells.map((c, i) => {
      const x = cellX(i), cy = cellY(i), mid = x + cw / 2
      const tint = color && i % 2 === 1 ? light : '#fff'
      return <g key={c.a}>
        <rect x={x} y={cy} width={cw} height={rowH} fill={tint} fillOpacity={color ? 0.55 : 1} stroke={INK} strokeWidth={0.35} />
        {mode === 'answers' && <>
          <N x={mid} y={cy + rowH * 0.4} size={s.ex} weight={500}>{exercise(c.a, c.b)}</N>
          <N x={mid} y={cy + rowH * 0.84} size={s.prod} weight={800} fill={color ? dark : INK}>{c.product}</N>
        </>}
        {mode === 'practice' && <>
          <N x={mid} y={cy + rowH * 0.4} size={s.ex} weight={500}>{exercise(c.a, c.b)}</N>
          <rect x={mid - cw * 0.3} y={cy + rowH * 0.52} width={cw * 0.6} height={rowH * 0.36} rx={1.2} fill="#fff" stroke="#9ca3af" strokeWidth={0.3} />
        </>}
        {fold && <N x={mid} y={cy + rowH / 2 + s.ex * 0.36} size={s.ex * 1.1} weight={600}>{exercise(c.a, c.b)}</N>}
      </g>
    })}
    {fold && <g>
      <rect x={X0} y={y + mainH} width={CONTENT_W} height={flapH} fill={color ? light : '#f9fafb'} fillOpacity={color ? 0.35 : 1} stroke="none" />
      <T x={X0 + s.tab / 2} y={y + mainH + flapH / 2 - 0.4} size={Math.min(2.5, s.tab / 6)} fill="#4b5563" weight={700}>מקפלים</T>
      <T x={X0 + s.tab / 2} y={y + mainH + flapH / 2 + 2.6} size={Math.min(2.5, s.tab / 6)} fill="#4b5563">לאחור</T>
      {cells.map((c, i) => {
        const x = cellX(i), fy = y + mainH + Math.floor(i / perRow) * s.hf
        return <g key={c.a}>
          <rect x={x} y={fy} width={cw} height={s.hf} fill="none" stroke="#9ca3af" strokeWidth={0.25} />
          <N x={x + cw / 2} y={fy + s.hf / 2 + s.prod * 0.36} size={s.prod * 0.95} weight={800} fill={color ? dark : INK}>{c.product}</N>
        </g>
      })}
      <rect x={X0} y={y + mainH} width={CONTENT_W} height={flapH} fill="none" stroke={INK} strokeWidth={0.35} />
      {/* fold line: dash-dot, different from the cut line */}
      <line x1={X0 - 1.5} x2={X0 + CONTENT_W + 1.5} y1={y + mainH} y2={y + mainH} stroke={INK} strokeWidth={0.5} strokeDasharray="4 1.2 0.8 1.2" />
    </g>}
  </g>
}

const MODE_HINT = {
  answers: 'כל תרגיל עם התוצאה שלו',
  practice: 'משלימים את התוצאה בתיבה',
  fold: 'מקפלים את התשובות לאחור לאורך הקו — ופותחים כדי לבדוק',
}

export function TimesTableStrips() {
  const [nums, setNums] = useState(range(1, 10))
  const [mode, setMode] = useState('answers')
  const [size, setSize] = useState('regular')
  const [color, setColor] = useState('yes')
  const list = nums.length ? [...nums].sort((a, b) => a - b) : [8]
  const h = multStripHeight(size, mode)
  const pages = packStrips(list.map(() => h), { gap: 6.5 }).map((page, k) => ({
    key: `mult-${k}`,
    svg: <DeskSheet label="סרגלי כפולות" title="סרגלי כפולות" hint={MODE_HINT[mode]}>
      {page.map(({ index, y }) => <MultStrip key={list[index]} n={list[index]} y={y} mode={mode} size={size} color={color === 'yes'} />)}
    </DeskSheet>,
  }))
  const toggle = n => setNums(cur => cur.includes(n) ? cur.filter(x => x !== n) : [...cur, n])
  const chip = active => `min-h-[44px] min-w-[44px] wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold ${active ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`
  return <PrintableShell path={MULT_PATH} emoji="✖️" h1="סרגל כפולות להדפסה — רצועות לוח הכפל"
    seoTitle="סרגל כפולות להדפסה — לוח כפל ברצועות 1–10 לשולחן (PDF חינם)"
    description="סרגלי כפולות להדפסה בחינם: רצועה לכל מספר מ־1 עד 10 עם התרגילים והתוצאות, גרסת תרגול עם מקום לתשובה וגרסת קיפול לבדיקה עצמית. בצבע או בשחור־לבן, בשלושה גדלים."
    sub="רצועה לכל מספר — מדביקים על השולחן, בקלמר או בראש המחברת"
    siblings={SIBLINGS} sheetClassName="desk-strip-sheet" printTitle="סרגלי כפולות"
    lead={<QuickAnswer q="מה זה סרגל כפולות?"
      a="רצועת נייר עם כל הכפולות של מספר אחד — מ־1×8=8 ועד 10×8=80. מדביקים אותה על השולחן, והילד מציץ בה כשהוא פותר תרגילים, עד שהכפולות נזכרות בעל פה. כאן בוחרים אילו מספרים להדפיס, גרסה עם תשובות, עם מקום ריק או עם תשובות מתקפלות לבדיקה."
      rows={[['מספרים', '1 עד 10, כל אחד ברצועה משלו'], ['גרסאות', 'עם תשובות · תרגול (תיבה ריקה) · קיפול לבדיקה'], ['גדלים', 'קטן (כל 10 בדף אחד), רגיל, גדול בשתי שורות'], ['הדפסה', 'A4, בצבע או בשחור־לבן']]} />}
    controls={<div className="space-y-3">
      <div role="group" aria-label="אילו מספרים להדפיס" className="flex flex-wrap justify-center gap-2" dir="ltr">
        {range(1, 10).map(n => <button key={n} type="button" aria-pressed={nums.includes(n)} onClick={() => toggle(n)} className={chip(nums.includes(n))}>{n}</button>)}
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-sm">
        <button type="button" className="underline font-bold" onClick={() => setNums(range(1, 10))}>כל המספרים</button>
        <button type="button" className="underline font-bold" onClick={() => setNums([2, 5, 10])}>2, 5, 10 (מתחילים)</button>
        <button type="button" className="underline font-bold" onClick={() => setNums([6, 7, 8, 9])}>6–9 (הקשים)</button>
      </div>
      {!nums.length && <p className="text-center text-sm font-bold">לא נבחר מספר — מוצג סרגל של 8 לדוגמה.</p>}
      <Choice label="גרסה" value={mode} onChange={setMode} options={[['answers', 'עם תשובות'], ['practice', 'תרגול — מקום לתשובה'], ['fold', 'קיפול לבדיקה']]} />
      <Choice label="גודל" value={size} onChange={setSize} options={[['small', 'קטן'], ['regular', 'רגיל'], ['large', 'גדול (שתי שורות)']]} />
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'צבע לכל מספר'], ['no', 'שחור־לבן']]} />
    </div>}
    pages={pages}
    extra={<p className="text-sm text-[var(--muted-foreground)]">{list.length} סרגלים · {copiesPerPage(h, { gap: 6.5 })} בכל דף</p>}
    paragraphs={[
      'סרגל כפולות הוא "לוח כפל ברצועות": במקום טבלה גדולה של 100 משבצות, כל מספר מקבל רצועה משלו — כפולות של 3, כפולות של 7 וכן הלאה. ילדים שמתבלבלים מול לוח הכפל המלא מתמקדים כך במספר אחד בכל פעם, וקל להם יותר למצוא את התרגיל שהם צריכים. בכיתות ב׳–ד׳ מדביקים את הרצועה של המספר שלומדים השבוע על השולחן, ומחליפים כשעוברים למספר הבא.',
      'איך משתמשים בכיתה ובבית: בוחרים את המספרים שלומדים, מדפיסים, גוזרים לאורך הקו המקווקו ומדביקים בנייר דבק שקוף. גרסת "עם תשובות" היא כרטיס עזר; גרסת "תרגול" משאירה תיבה ריקה במקום התוצאה — אפשר למלא בעיפרון, או לכסות בנייר דבק שקוף ולכתוב בטוש מחיק, וכך משתמשים בה שוב ושוב. בגרסת "קיפול לבדיקה" התשובות מודפסות מתחת לקו הקיפול: מקפלים את רצועת התשובות לאחור, פותרים, ופותחים כדי לבדוק לבד.',
      'התרגילים כתובים משמאל לימין, כמו בספרי החשבון בישראל (1 × 8 = 8), והכפולות מסודרות מ־1 עד 10 באותו כיוון — כך הרצועה נקראת כמו ישר מספרים. הגודל "קטן" מכניס את כל עשרת הסרגלים לדף אחד, "רגיל" נוח לשולחן, ו"גדול" מחלק כל סרגל לשתי שורות עם ספרות גדולות — מתאים לחינוך המיוחד, לילדים עם קשיי ראייה ולתלייה על הלוח.',
      'טיפים: התחילו מהכפולות הקלות — 2, 5 ו־10 — ורק אחר כך עברו ל־3, 4 ו־6, ובסוף ל־7, 8 ו־9. בקשו מהילד לקרוא את הרצועה בקול בקצב, כמו שיר ספירה (8, 16, 24…), ושימו לב לחוק החילוף: מי שיודע את 3×8 כבר יודע את 8×3. בגרסת שחור־לבן אפשר לתת לכל ילד לצבוע את הסרגל שלו בצבע שהוא בוחר.',
    ]}
    faq={[
      { q: 'מה ההבדל בין סרגל כפולות ללוח הכפל?', a: 'לוח הכפל הוא טבלה של 10×10 עם כל התרגילים יחד. סרגל כפולות מפרק אותה לרצועות — כל מספר בנפרד — וכך קל יותר להתמקד במספר אחד ולמצוא את התרגיל. אם רוצים את הטבלה המלאה, היא נמצאת בעמוד לוח הכפל באתר.' },
      { q: 'איך עובדת גרסת הקיפול?', a: 'מתחת לכל רצועה יש פס תשובות שמופרד בקו קיפול (קו של קווים ונקודות). מקפלים את הפס לאחור, אל מאחורי הרצועה, ורואים רק את התרגילים. פותרים בעל פה או על דף, ופותחים את הקיפול כדי לבדוק. את הקו המקווקו גוזרים, ואת קו הקיפול רק מקפלים.' },
      { q: 'אפשר להדפיס בשחור־לבן?', a: 'כן. בוחרים "שחור־לבן" והסרגלים יוצאים בלי מילוי צבע, עם קווים ברורים — חוסך דיו ונוח לצילום במכונת צילום בבית הספר.' },
      { q: 'לאיזה גיל זה מתאים?', a: 'בעיקר לכיתות ב׳–ד׳, כשלומדים את לוח הכפל, וגם לכיתות גבוהות יותר כעזר לחילוק ולשברים. הגודל הגדול מתאים לחינוך המיוחד ולמי שצריך ספרות גדולות.' },
      { q: 'איך מדביקים כך שיחזיק כל השנה?', a: 'גוזרים לאורך הקו המקווקו ומכסים את כל הרצועה בנייר דבק שקוף רחב, או מלמינציה לפני ההדבקה. על רצועת תרגול מכוסה אפשר לכתוב בטוש מחיק ולנגב.' },
    ]}
    related={[
      { label: 'לוח הכפל המלא', href: '/learn/multiplication-table' },
      { label: 'כפולות של 8', href: '/learn/multiplication-table/of/8' },
      { label: 'תרגול לוח הכפל', href: '/learn/times-tables' },
      { label: 'סרגל מספרים לשולחן', href: NUMBER_PATH },
      { label: 'צביעה לפי לוח הכפל', href: '/printables/color-by-answer/multiplication' },
      { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' },
    ]}
  />
}

// ── סרגל מספרים לשולחן ─────────────────────────────────────────
const RULER_H = 9
const RULER_LEN = 183 // mm of ticks: 0 … 18.3 cm inside the 18.6 cm strip
const RULER_X0 = X0 + 2 // the 0 sits 2 mm in from the strip's edge, like on a real ruler

function Ruler({ y }) {
  return <g>
    <rect x={X0} y={y} width={CONTENT_W} height={RULER_H} fill="#fff" stroke={INK} strokeWidth={0.35} />
    {rulerTicks(RULER_LEN).map(t => {
      const x = RULER_X0 + t.mm, len = t.kind === 'cm' ? 4 : t.kind === 'half' ? 2.8 : 1.6
      return <g key={t.mm}>
        <line x1={x} x2={x} y1={y} y2={y + len} stroke="#111" strokeWidth={t.kind === 'mm' ? 0.14 : 0.25} />
        {t.label && <N x={x} y={y + 7.3} size={2.6} weight={600} fill="#111">{t.label}</N>}
      </g>
    })}
    <T x={X0 + CONTENT_W - 1.4} y={y + 7.3} size={2.3} anchor="start" fill="#4b5563">ס״מ</T>
  </g>
}

const TEN = '#1d4ed8', ONE = '#e11d48'
const GROUP_FILL = ['#fef3c7', '#e0f2fe']

// A ten-frame: 5×2 (horizontal) or 2×5 (vertical, for the narrow 1–20 cells), filled five by five.
function Frame({ x, y, pitch, count, vertical, fill, empty = '#cbd5e1' }) {
  const cols = vertical ? 2 : 5, rows = vertical ? 5 : 2
  const slots = []
  for (let k = 0; k < 10; k++) {
    // horizontal: top row first; vertical: left column first — the first five always form one line
    const c = vertical ? Math.floor(k / 5) : k % 5, r = vertical ? k % 5 : Math.floor(k / 5)
    slots.push(<circle key={k} cx={x + (c + 0.5) * pitch} cy={y + (r + 0.5) * pitch} r={k < count ? pitch * 0.36 : pitch * 0.13} fill={k < count ? fill : empty} />)
  }
  return <g>
    <rect x={x} y={y} width={cols * pitch} height={rows * pitch} fill="none" stroke="#94a3b8" strokeWidth={0.22} />
    {vertical
      ? <line x1={x + pitch} x2={x + pitch} y1={y} y2={y + rows * pitch} stroke="#cbd5e1" strokeWidth={0.18} />
      : <line x1={x} x2={x + cols * pitch} y1={y + pitch} y2={y + pitch} stroke="#cbd5e1" strokeWidth={0.18} />}
    {slots}
  </g>
}

// Geometry per range: cell width, number band, dots band.
const NUM_LAYOUT = {
  10: { cw: CONTENT_W / 10, numH: 12, numSize: 8.5, dotsH: 11.5, pitch: 3.5 },
  20: { cw: CONTENT_W / 20, numH: 9, numSize: 5.4, dotsH: 36, pitch: 3.1 },
}
const numberStripHeight = (rangeTo, dots) => RULER_H + NUM_LAYOUT[rangeTo].numH + (dots ? NUM_LAYOUT[rangeTo].dotsH : 0)

function NumberStrip({ y, to, dots, color }) {
  const L = NUM_LAYOUT[to], total = numberStripHeight(to, dots), cellsY = y + RULER_H, cellsH = total - RULER_H
  return <g>
    <rect x={X0 - 1.5} y={y - 1.5} width={CONTENT_W + 3} height={total + 3} rx={2.5} {...CUT} />
    <Ruler y={y} />
    {range(1, to).map((v, i) => {
      const x = X0 + i * L.cw, mid = x + L.cw / 2
      // 1–20: always a double ten-frame, so every number has the same shape (14 = a full ten + 4)
      const frames = to === 20 && v <= 10 ? [v, 0] : tenFrames(v)
      return <g key={v}>
        <rect x={x} y={cellsY} width={L.cw} height={cellsH} fill={color ? GROUP_FILL[Math.floor(i / 5) % 2] : '#fff'} fillOpacity={0.7} stroke={INK} strokeWidth={0.3} />
        <N x={mid} y={cellsY + L.numH * 0.5 + L.numSize * 0.36} size={L.numSize} weight={800}>{v}</N>
        {dots && (to === 10
          ? <Frame x={mid - 2.5 * L.pitch} y={cellsY + L.numH - 0.5} pitch={L.pitch} count={v} fill={color ? ONE : '#111'} />
          : frames.map((c, k) => <Frame key={k} vertical x={mid - L.pitch} y={cellsY + L.numH + k * (5 * L.pitch + 2)} pitch={L.pitch} count={c}
            fill={color ? (v > 10 && k === 0 ? TEN : ONE) : '#111'} />))}
      </g>
    })}
    {/* thicker lines every five, so the fives are easy to see */}
    {range(1, to / 5 - 1).map(k => <line key={k} x1={X0 + k * 5 * L.cw} x2={X0 + k * 5 * L.cw} y1={cellsY} y2={cellsY + cellsH} stroke={INK} strokeWidth={k % 2 ? 0.7 : 1.1} />)}
    <rect x={X0} y={cellsY} width={CONTENT_W} height={cellsH} fill="none" stroke={INK} strokeWidth={0.5} />
  </g>
}

// 1–100: ten strips of ten under one ruler; with "dots", each number is drawn as tens sticks + ones ten-frame.
function HundredRows({ dots, color }) {
  const cw = CONTENT_W / 10, numH = dots ? 7 : 20, rowH = dots ? 22 : 20, top = CONTENT_TOP
  const rowsY = top + RULER_H + 4
  return <g>
    <rect x={X0 - 1.5} y={top - 1.5} width={CONTENT_W + 3} height={RULER_H + 3} rx={2} {...CUT} />
    <Ruler y={top} />
    {range(0, 9).map(r => {
      const y = rowsY + r * (rowH + 1.4)
      return <g key={r}>
        <rect x={X0 - 0.8} y={y - 0.8} width={CONTENT_W + 1.6} height={rowH + 1.6} fill="none" stroke="#9ca3af" strokeWidth={0.3} strokeDasharray="3 2" />
        {range(1, 10).map(c => {
          const v = r * 10 + c, x = X0 + (c - 1) * cw, mid = x + cw / 2, b = baseTen(v)
          return <g key={v}>
            <rect x={x} y={y} width={cw} height={rowH} fill={color ? GROUP_FILL[c > 5 ? 1 : 0] : '#fff'} fillOpacity={0.7} stroke={INK} strokeWidth={0.3} />
            <N x={mid} y={y + numH * 0.5 + (dots ? 2.2 : 3.4)} size={dots ? 6 : 9.5} weight={800}>{v}</N>
            {dots && <g>
              {b.hundreds
                ? <g>{range(0, 9).map(k => <rect key={k} x={mid - 3.5} y={y + numH + 0.3 + k * 0.7} width={7} height={0.55} fill={color ? TEN : '#111'} />)}</g>
                : range(0, b.tens - 1).map(k => <rect key={k} x={mid - (b.tens * 1.75) / 2 + k * 1.75 + 0.3} y={y + numH + 0.3} width={1.15} height={6.6} rx={0.3} fill={color ? TEN : '#111'} />)}
              <Frame x={mid - 2.5 * 3.1} y={y + numH + 8} pitch={3.1} count={b.ones} fill={color ? ONE : '#111'} />
            </g>}
          </g>
        })}
        <line x1={X0 + 5 * cw} x2={X0 + 5 * cw} y1={y} y2={y + rowH} stroke={INK} strokeWidth={0.8} />
        <rect x={X0} y={y} width={CONTENT_W} height={rowH} fill="none" stroke={INK} strokeWidth={0.45} />
      </g>
    })}
  </g>
}

// written "1 עד 20" rather than "1–20": inside right-to-left text a dash range would read backwards
const RANGE_NAME = { 10: '1 עד 10', 20: '1 עד 20', 100: '1 עד 100' }

export function NumberStripPage() {
  const [to, setTo] = useState(20)
  const [dots, setDots] = useState('yes')
  const [color, setColor] = useState('yes')
  const withDots = dots === 'yes', inColor = color === 'yes'
  const hint = 'בדיקה: מ־0 עד 10 בסרגל — 10 ס״מ בדיוק'
  let svg, count = 1
  if (to === 100) svg = <DeskSheet label="סרגל מספרים 1 עד 100" title="מספרים 1 עד 100" hint={hint}><HundredRows dots={withDots} color={inColor} /></DeskSheet>
  else {
    const h = numberStripHeight(to, withDots)
    count = copiesPerPage(h, { gap: 6 })
    const slots = packStrips(Array(count).fill(h), { gap: 6 })[0]
    svg = <DeskSheet label={`סרגל מספרים ${RANGE_NAME[to]}`} title={`סרגל מספרים ${RANGE_NAME[to]}`} hint={hint}>
      {slots.map(({ index, y }) => <NumberStrip key={index} y={y} to={to} dots={withDots} color={inColor} />)}
    </DeskSheet>
  }
  return <PrintableShell path={NUMBER_PATH} emoji="🔢" h1="סרגל מספרים לשולחן — ישר מספרים עד 20 להדפסה"
    seoTitle="סרגל מספרים לשולחן להדפסה — ישר מספרים עד 20 עם נקודות וסרגל (PDF חינם)"
    description="סרגל מספרים לשולחן להדפסה בחינם: ישר מספרים עד 20 (או עד 10, או 1–100 בשורות של עשר) עם נקודות במסגרת עשר לספירה, וסרגל סנטימטרים מדויק לאורך הרצועה. בצבע או בשחור־לבן."
    sub="מספרים, נקודות לספירה וסרגל ס״מ אמיתי — ברצועה אחת על השולחן"
    siblings={SIBLINGS} sheetClassName="desk-strip-sheet" printTitle="סרגל מספרים לשולחן"
    lead={<QuickAnswer q="מה יש בסרגל המספרים לשולחן?"
      a="רצועה עם המספרים 1 עד 20 (או 1–10, או 1–100 בעשר שורות), ומתחת לכל מספר נקודות במסגרת עשר — קבוצות של חמש, כך שאפשר לספור ולראות כמה זה. בראש הרצועה יש סרגל סנטימטרים אמיתי, שנמדד נכון כשמדפיסים בגודל אמיתי (100%)."
      rows={[['טווחים', '1–10 · 1–20 · 1–100 בשורות של עשר'], ['נקודות', 'מסגרת עשר: חמש ועוד חמש; עשרות בכחול ויחידות באדום'], ['סרגל', '0 עד 18 ס״מ, שנתות של מילימטר'], ['הדפסה', 'A4, גודל אמיתי (100%), בצבע או בשחור־לבן']]} />}
    controls={<div className="space-y-3">
      <Choice label="טווח מספרים" value={to} onChange={setTo} options={[[10, '1 עד 10'], [20, '1 עד 20'], [100, '1 עד 100 (שורות)']]} />
      <Choice label="נקודות לספירה" value={dots} onChange={setDots} options={[['yes', 'עם נקודות'], ['no', 'מספרים בלבד']]} />
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'צבעוני'], ['no', 'שחור־לבן']]} />
      <p className="text-center text-sm"><b>חשוב להדפסה:</b> בחלון ההדפסה בוחרים <b>גודל בפועל / 100%</b> (ולא "התאמה לדף"), אחרת הסרגל יוצא קטן מעט מהאמיתי.</p>
    </div>}
    pages={[{ key: `num-${to}`, svg }]}
    extra={<p className="text-sm text-[var(--muted-foreground)]">{to === 100 ? 'עשר שורות בדף — כל שורה היא רצועה' : `${count} סרגלים זהים בדף`}</p>}
    paragraphs={[
      'סרגל מספרים לשולחן (נקרא גם "ישר מספרים לשולחן") הוא רצועה שמודבקת על שולחן התלמיד, ועליה המספרים בסדר עולה. כשהילד סופר, מחבר או מחסר, הוא מניח אצבע על מספר וקופץ קדימה או אחורה — וכך החשבון הופך למשהו שרואים ונוגעים בו. בכיתות א׳–ב׳ זה כלי יומיומי, ובגן חובה הוא עוזר לזהות את הספרות ולהכיר את סדר המספרים.',
      'מתחת לכל מספר מצוירות נקודות במסגרת עשר: שתי שורות של חמש. העין רואה מיד "חמש ועוד שתיים" בלי לספור אחת־אחת, וזה הבסיס לחשבון בעל פה. במספרים 11 עד 20 יש מסגרת מלאה אחת — עשר, בכחול — ומתחתיה היחידות באדום, כך שרואים ש־14 הוא עשר ועוד ארבע. בטווח 1–100 כל מספר מצויר כמקלות עשרות ונקודות יחידות.',
      'לאורך הקצה העליון יש סרגל סנטימטרים אמיתי, משנתה 0 ועד 18 ס״מ. כדי שיהיה מדויק צריך להדפיס בגודל אמיתי: בחלון ההדפסה בוחרים "גודל בפועל" או "100%" (Actual size), ולא "התאמה לדף" (Fit to page). אחרי ההדפסה בודקים עם סרגל אמיתי שהמרחק מ־0 עד 10 הוא בדיוק 10 ס״מ. אם הורדתם PDF — גם בהדפסת הקובץ בוחרים 100%.',
      'איך משתמשים: גוזרים לאורך הקו המקווקו ומדביקים בנייר דבק שקוף רחב לאורך השולחן. בכל דף יש כמה סרגלים זהים — אחד לכל ילד. רעיונות לתרגול: "שימו אצבע על 8 וקפצו 3 קדימה", "איזה מספר בא אחרי 12?", "כמה נקודות חסרות כדי להשלים לעשר?". הגרסה בלי נקודות מתאימה לילדים שכבר סופרים בביטחון, ושחור־לבן חוסך דיו וטוב לצילום.',
    ]}
    faq={[
      { q: 'האם הסרגל באמת מדויק?', a: 'כן, כשמדפיסים בגודל אמיתי (100%). הדף מצויר במילימטרים על כל דף ה־A4, כך שכל ס״מ בסרגל יוצא ס״מ על הנייר. אם בחלון ההדפסה מסומן "התאמה לדף" או קנה מידה אחר, הסרגל יקטן מעט — לכן בודקים אחרי ההדפסה ש־0 עד 10 הם 10 ס״מ.' },
      { q: 'למה הנקודות מסודרות בחמש ועוד חמש?', a: 'זו מסגרת עשר, שמשמשת בכיתות הנמוכות בארץ ובעולם. כשהנקודות מסודרות בקבוצות של חמש, ילדים מזהים כמות במבט — 7 הוא שורה מלאה ועוד שתיים — וזה בונה את ההבנה של השלמה לעשר ושל עשרות ויחידות.' },
      { q: 'עד 10 או עד 20?', a: 'בגן ובתחילת כיתה א׳ מתחילים בסרגל עד 10, עם ספרות ונקודות גדולות. כשלומדים חיבור וחיסור עד 20 עוברים לסרגל עד 20. הטווח 1–100 מתאים לכיתה ב׳ ולספירה בקפיצות של 10.' },
      { q: 'למה המספרים הולכים משמאל לימין?', a: 'בחשבון כותבים משמאל לימין גם בעברית, וישר המספרים בספרי הלימוד בישראל מתחיל מצד שמאל — כמו סרגל אמיתי. כך הרצועה מתאימה למה שהילדים רואים בספר ובלוח.' },
      { q: 'זה מתאים לחינוך המיוחד?', a: 'כן. הנקודות מאפשרות לספור ולגעת, הקווים העבים בכל חמישה מקלים על ההתמצאות, ואפשר לבחור טווח קצר (1–10) עם ספרות גדולות. לילדים שנעזרים במגע אפשר להדביק על הנקודות מדבקות עגולות או טיפות דבק.' },
    ]}
    related={[
      { label: 'סרגלי כפולות', href: MULT_PATH },
      { label: 'סרגל אותיות', href: '/printables/letter-strip' },
      { label: 'דפי עבודה בחשבון לכיתה א׳', href: '/printables/math-worksheets' },
      { label: 'לוח הכפל', href: '/learn/multiplication-table' },
      { label: 'מתמטיקה לפי כיתה', href: '/math' },
    ]}
  />
}
