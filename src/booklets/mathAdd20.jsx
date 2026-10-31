import { A4, Certificate, Cover, Head, Pic, SvgPage } from './kit'
import { bookletBySlug } from './registry'

// "חוברת חשבון — חיבור עד 20" — addition within 20 for first and second grade: warm-up to 10, ten-frames,
// number line, adding without and with crossing ten, complements to 10 and 20, doubles, pictures, the missing
// number, three addends, comparing sums and word problems. Every answer is computed from the data below,
// so the answer key cannot drift from the exercises.
const PAGES = bookletBySlug('add-to-20').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

const sum = (a, b) => ({ text: `${a} + ${b} = ____`, ans: a + b })
const gap = (a, t) => ({ text: `${a} + ____ = ${t}`, ans: t - a })
const gapFirst = (b, t) => ({ text: `____ + ${b} = ${t}`, ans: t - b })

export const WARM = [[2, 3], [4, 5], [6, 3], [7, 2], [5, 5], [8, 1], [3, 6], [4, 4], [1, 9], [6, 4], [2, 7], [5, 3]].map(p => sum(...p))
// Ten-frames: [a, b] with a + b between 11 and 20.
export const FRAMES = [[7, 5], [8, 4], [6, 6], [9, 3], [5, 8]]
// Number line hops: [start, hop].
export const LINE = [[8, 5], [6, 7], [9, 4], [7, 6], [5, 9]]
export const NO_CROSS = [[11, 4], [12, 5], [13, 3], [14, 5], [10, 7], [15, 2], [12, 6], [13, 4], [16, 3], [11, 8], [14, 4], [10, 9]].map(p => sum(...p))
export const TO_TEN = [[7, 10], [4, 10], [9, 10], [2, 10], [6, 10], [3, 10], [8, 10], [5, 10], [1, 10], [10, 10]].map(p => gap(...p))
export const TO_TWENTY = [[15, 20], [12, 20], [18, 20], [14, 20], [11, 20], [17, 20], [13, 20], [19, 20]].map(p => gap(...p))
export const CROSS = [[9, 4], [8, 5], [7, 6], [9, 7], [8, 6], [6, 5], [9, 5], [7, 8], [8, 9], [7, 5], [6, 9], [4, 8]].map(p => sum(...p))
export const DOUBLES = [[3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [6, 7], [8, 9], [7, 8], [4, 5]].map(p => sum(...p))
// Pictures: [emoji, a, b].
export const PICS = [['🍎', 6, 5], ['⭐', 7, 4], ['🐟', 8, 3], ['🎈', 9, 6], ['🍪', 7, 7]]
export const MISSING = [gap(6, 14), gap(9, 17), gap(8, 15), gapFirst(7, 16), gapFirst(5, 13), gap(4, 12), gapFirst(8, 18), gap(7, 19), gapFirst(9, 15), gap(5, 11)]
export const THREE = [[3, 4, 5], [6, 2, 7], [5, 5, 4], [8, 3, 2], [4, 6, 6], [7, 1, 9], [2, 9, 8], [3, 3, 10]]
  .map(([a, b, c]) => ({ text: `${a} + ${b} + ${c} = ____`, ans: a + b + c }))
// Comparing sums: [a, b, c, d] → a + b ◯ c + d.
export const COMPARE = [[8, 5, 7, 7], [6, 6, 5, 8], [9, 4, 7, 6], [10, 6, 9, 8], [7, 7, 6, 8], [9, 9, 10, 7]]
const symbol = (x, y) => x > y ? '>' : x < y ? '<' : '='
export const WORD_PROBLEMS = [
  { q: 'לנועה יש 8 מדבקות של חתולים ו־6 מדבקות של כלבים. כמה מדבקות יש לה בסך הכול?', a: 8, b: 6 },
  { q: 'בגינה יש 9 פרחים אדומים ו־5 פרחים צהובים. כמה פרחים יש בגינה?', a: 9, b: 5 },
  { q: 'יונתן קרא ביום ראשון 7 עמודים וביום שני עוד 8 עמודים. כמה עמודים קרא בשני הימים?', a: 7, b: 8 },
  { q: 'בקערה יש 12 תפוחים. אבא הוסיף עוד 6 תפוחים. כמה תפוחים יש עכשיו בקערה?', a: 12, b: 6 },
  { q: 'לתמר יש 9 שקלים. אמא נתנה לה עוד 9 שקלים. כמה שקלים יש לתמר?', a: 9, b: 9 },
  { q: 'בכיתה 11 בנות ו־7 בנים. כמה ילדים יש בכיתה?', a: 11, b: 7 },
].map(p => ({ ...p, ans: `${p.a} + ${p.b} = ${p.a + p.b}` }))

// Two columns of numbered exercises, the first column on the right.
function Problems({ n, title, instruction, items }) {
  const rows = Math.ceil(items.length / 2), rowH = Math.min(100, 640 / rows)
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map((it, i) => {
      const col = i % 2, y = 150 + Math.floor(i / 2) * rowH + rowH / 2, cx = col ? 150 : 440
      return <g key={i} fontFamily={FONT}>
        <text x={cx + 130} y={y + 4} fontSize="14" fill="#666" textAnchor="middle">{i + 1}.</text>
        <text x={cx} y={y + 10} fontSize="28" fontWeight="700" textAnchor="middle" direction="ltr" style={{ whiteSpace: 'pre' }}>{it.text}</text>
        <path d={`M${col ? 20 : 310} ${y + rowH / 2} H${col ? 290 : 580}`} stroke="#eee" />
      </g>
    })}
  </SvgPage>
}

// A ten-frame (2 rows of 5) with k filled dots, top-left corner (x, y).
function Frame({ x, y, k, color }) {
  return <g>{Array.from({ length: 10 }, (_, i) => {
    const cx = x + (i % 5) * 30, cy = y + Math.floor(i / 5) * 30
    return <g key={i}>
      <rect x={cx} y={cy} width="30" height="30" fill="white" stroke={INK} strokeWidth="2" />
      {i < k && <circle cx={cx + 15} cy={cy + 15} r="10" fill={color} stroke={INK} strokeWidth="1.5" />}
    </g>
  })}</g>
}

function FramesPage({ n }) {
  // The bigger addend fills the first frame; a second frame holds the rest (up to 10 each).
  return <SvgPage label="מסגרות עשר">
    <Head n={n} title="מסגרות עשר" instruction="סופרים את הנקודות בשתי המסגרות וכותבים את התרגיל" />
    {FRAMES.map(([a, b], i) => { const y = 150 + i * 130; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <Frame x={430} y={y} k={a} color="#fde68a" />
      <Frame x={250} y={y} k={b} color="#bfdbfe" />
      <text x={110} y={y + 42} fontSize="26" fontWeight="700" direction="ltr">__ + __ = __</text>
      {i < FRAMES.length - 1 && <path d={`M30 ${y + 100} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function LinePage({ n }) {
  const x0 = 40, step = 26 // 0..20
  return <SvgPage label="קו המספרים">
    <Head n={n} title="קו המספרים" instruction="מתחילים במספר הראשון וקופצים קדימה. כותבים לאן הגענו" />
    {LINE.map(([s, h], i) => { const y = 190 + i * 125; return <g key={i} fontFamily={FONT} textAnchor="middle">
      <text x={300} y={y - 48} fontSize="26" fontWeight="700" direction="ltr">{`${s} + ${h} = ____`}</text>
      <path d={`M${x0} ${y} H${x0 + 20 * step}`} stroke={INK} strokeWidth="2.5" />
      {Array.from({ length: 21 }, (_, k) => <g key={k}>
        <path d={`M${x0 + k * step} ${y - 6} V${y + 6}`} stroke={INK} strokeWidth="2" />
        <text x={x0 + k * step} y={y + 24} fontSize="13" direction="ltr" fontWeight={k === s ? 800 : 400}>{k}</text>
      </g>)}
      <circle cx={x0 + s * step} cy={y} r="9" fill="none" stroke={INK} strokeWidth="2.5" />
    </g> })}
  </SvgPage>
}

function PicturesPage({ n }) {
  return <SvgPage label="חיבור עם תמונות">
    <Head n={n} title="חיבור עם תמונות" instruction="סופרים כל קבוצה וכותבים את התרגיל והתוצאה" />
    {PICS.map(([e, a, b], i) => { const y = 160 + i * 127; return <g key={i} fontFamily={FONT} textAnchor="middle">
      {Array.from({ length: a }, (_, k) => <Pic key={k} item={{ emoji: e }} x={545 - (k % 5) * 36} y={y + 20 + Math.floor(k / 5) * 36} size={32} />)}
      <text x={355} y={y + 40} fontSize="34" fontWeight="800">+</text>
      {Array.from({ length: b }, (_, k) => <Pic key={k} item={{ emoji: e }} x={310 - (k % 5) * 36} y={y + 20 + Math.floor(k / 5) * 36} size={32} />)}
      <text x={85} y={y + 44} fontSize="24" direction="ltr">{`__ + __ = __`}</text>
      {i < PICS.length - 1 && <path d={`M30 ${y + 108} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function ComparePage({ n }) {
  return <SvgPage label="גדול, קטן או שווה">
    <Head n={n} title="גדול, קטן או שווה?" instruction="מחשבים כל צד וכותבים בעיגול: <  או  >  או  =" />
    {COMPARE.map(([a, b, c, d], i) => {
      const y = 190 + i * 100
      return <g key={i} fontFamily={FONT} fontSize="32" fontWeight="700" textAnchor="middle" direction="ltr">
        <text x={440} y={y + 11}>{`${a} + ${b}`}</text>
        <circle cx={300} cy={y} r="26" fill="white" stroke={INK} strokeWidth="2.5" />
        <text x={160} y={y + 11}>{`${c} + ${d}`}</text>
      </g>
    })}
  </SvgPage>
}

function WordProblemsPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>📖 בעיות מילוליות</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · כותבים תרגיל ותשובה</p>
    <ol style={{ fontSize: '15pt', lineHeight: 1.7, padding: '0 10mm 0 4mm', margin: '4mm 0 0' }}>
      {WORD_PROBLEMS.map(p => <li key={p.q} style={{ marginBottom: '13mm' }}>{p.q}<br />תרגיל: ______________ &nbsp; תשובה: ______________</li>)}
    </ol>
  </A4>
}

function Key({ n }) {
  const list = items => items.map(it => String(it.ans))
  const sections = [
    ['עמוד 2 — חימום', list(WARM)],
    ['עמוד 3 — מסגרות עשר', FRAMES.map(([a, b]) => `${a} + ${b} = ${a + b}`)],
    ['עמוד 4 — קו המספרים', LINE.map(([s, h]) => String(s + h))],
    ['עמוד 5 — בלי מעבר עשרת', list(NO_CROSS)],
    ['עמוד 6 — משלימים לעשר', list(TO_TEN)],
    ['עמוד 7 — משלימים ל־20', list(TO_TWENTY)],
    ['עמוד 8 — מעבר עשרת', list(CROSS)],
    ['עמוד 9 — כפולות', list(DOUBLES)],
    ['עמוד 10 — חיבור עם תמונות', PICS.map(([, a, b]) => `${a} + ${b} = ${a + b}`)],
    ['עמוד 11 — המספר החסר', list(MISSING)],
    ['עמוד 12 — שלושה מחוברים', list(THREE)],
    ['עמוד 13 — גדול, קטן או שווה', COMPARE.map(([a, b, c, d]) => `${a + b} ${symbol(a + b, c + d)} ${c + d}`)],
    ['עמוד 14 — בעיות מילוליות', WORD_PROBLEMS.map(p => p.ans)],
  ]
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות להורים</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>התרגילים ממוספרים מימין לשמאל, שורה אחר שורה</p>
    <div style={{ fontSize: '11pt', lineHeight: 1.5 }}>
      {sections.map(([t, a]) => <section key={t} style={{ marginBottom: 6 }}><b>{t}</b><div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', marginTop: 2 }}>{a.map((x, i) => <span key={i}>{i + 1}) <bdi dir="ltr">{x}</bdi></span>)}</div></section>)}
    </div>
  </A4>
}

export default function AddTo20Booklet() {
  return <>
    <Cover emoji="➕🔟" title="חוברת חשבון — חיבור עד 20" subtitle="16 עמודים: מסגרות עשר, קו מספרים, מעבר עשרת, משלימים וכפולות" pages={PAGES}
      note="עמוד אחד או שניים בכל פעם מספיקים. כדאי להתחיל בעמודים הראשונים ולעבור הלאה רק כשהחיבור עד 10 מוכר. אפשר להיעזר באצבעות, בקוביות או בקו המספרים." />
    <Problems n={2} title="חימום: חיבור עד 10" instruction="פותרים את התרגילים" items={WARM} />
    <FramesPage n={3} />
    <LinePage n={4} />
    <Problems n={5} title="חיבור עד 20 בלי מעבר עשרת" instruction="מחברים את האחדות ומוסיפים לעשר" items={NO_CROSS} />
    <Problems n={6} title="משלימים לעשר" instruction="כותבים כמה חסר כדי להגיע ל־10" items={TO_TEN} />
    <Problems n={7} title="משלימים ל־20" instruction="כותבים כמה חסר כדי להגיע ל־20" items={TO_TWENTY} />
    <Problems n={8} title="חיבור עם מעבר עשרת" instruction="משלימים קודם לעשר ואחר כך מוסיפים את השאר" items={CROSS} />
    <Problems n={9} title="כפולות" instruction="מחברים מספר לעצמו, ואחר כך מספרים שכנים" items={DOUBLES} />
    <PicturesPage n={10} />
    <Problems n={11} title="המספר החסר" instruction="כותבים את המספר שחסר בתרגיל" items={MISSING} />
    <Problems n={12} title="שלושה מחוברים" instruction="מחברים משמאל לימין, או מחפשים שני מספרים שמשלימים לעשר" items={THREE} />
    <ComparePage n={13} />
    <WordProblemsPage n={14} />
    <Key n={15} />
    <Certificate booklet="חוברת חיבור עד 20" done="חיברתי עד 20, עברתי את העשרת, השלמתי לעשר ולעשרים ופתרתי בעיות מילוליות." cheer="כל הכבוד, אלופ/ת חיבור!" />
  </>
}
