import { AnswerKey, Certificate, Cover, Head, SvgPage, W, WordSearchPage, art, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת פירות הדר — דפי עבודה ומשחק" for grades 1–2: meet nine citrus fruits, read a short text about the
// grove (פרדס), blossom, harvest, vitamin C, Jaffa oranges and the etrog, then match, spell, count, solve,
// sort sweet/sour, label a cut orange, order the stages from blossom to harvest, a word search and a
// printable board game ("מסע בפרדס") with cut-out tokens, a dice net and question cards. The word bank's
// print art has only an orange and a lemon, so every fruit is drawn here as simple SVG. Pure functions of
// the seed — no SVG ids, no Math.random (the preview renders the booklet twice).
const PAGES = bookletBySlug('citrus').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

// ── fruit drawings ──
const FILL = { orange: '#fdba74', clementine: '#fb923c', lemon: '#fde047', lime: '#86efac', grapefruit: '#fcd38d', pomelo: '#d9f99d', pomelit: '#bef264', etrog: '#fde68a', kumquat: '#fb923c' }

// Peel pores: a few dots spread deterministically over an ellipse.
function Pores({ x, y, rx, ry, n, r }) {
  return <g fill={INK} opacity="0.45">{Array.from({ length: n }, (_, i) => {
    const a = i * 2.4, f = Math.sqrt((i + 0.5) / n) * 0.72
    return <circle key={i} cx={x + Math.cos(a) * rx * f} cy={y + Math.sin(a) * ry * f} r={r} />
  })}</g>
}

function Leaf({ x, y, s, flip }) {
  const k = flip ? -1 : 1
  return <g>
    <path d={`M${x} ${y} q ${s * 0.16 * k} ${-s * 0.16} ${s * 0.34 * k} ${-s * 0.08} q ${-s * 0.14 * k} ${s * 0.16} ${-s * 0.34 * k} ${s * 0.08}Z`} fill="#4ade80" stroke={INK} strokeWidth="1.5" />
    <path d={`M${x} ${y} l ${s * 0.26 * k} ${-s * 0.07}`} stroke={INK} strokeWidth="1" />
  </g>
}

function Fruit({ kind, x, y, s }) {
  const st = { stroke: INK, strokeWidth: Math.max(1.6, s / 45) }, fill = FILL[kind], pr = Math.max(0.9, s / 110)
  if (kind === 'lemon') return <g>
    <path d={`M${x - s * 0.42} ${y} Q${x - s * 0.36} ${y - s * 0.27} ${x} ${y - s * 0.27} Q${x + s * 0.36} ${y - s * 0.27} ${x + s * 0.42} ${y} Q${x + s * 0.36} ${y + s * 0.27} ${x} ${y + s * 0.27} Q${x - s * 0.36} ${y + s * 0.27} ${x - s * 0.42} ${y}Z`} fill={fill} {...st} />
    <Pores x={x} y={y} rx={s * 0.34} ry={s * 0.22} n={9} r={pr} /><Leaf x={x + s * 0.05} y={y - s * 0.25} s={s} />
  </g>
  if (kind === 'lime') return <g>
    <ellipse cx={x} cy={y} rx={s * 0.27} ry={s * 0.24} fill={fill} {...st} />
    <circle cx={x + s * 0.27} cy={y} r={s * 0.025} fill={INK} />
    <Pores x={x} y={y} rx={s * 0.22} ry={s * 0.19} n={7} r={pr} />
  </g>
  if (kind === 'pomelo') return <g>
    <path d={`M${x} ${y - s * 0.44} C${x + s * 0.18} ${y - s * 0.44} ${x + s * 0.2} ${y - s * 0.25} ${x + s * 0.32} ${y - s * 0.12} C${x + s * 0.5} ${y + s * 0.08} ${x + s * 0.42} ${y + s * 0.44} ${x} ${y + s * 0.44} C${x - s * 0.42} ${y + s * 0.44} ${x - s * 0.5} ${y + s * 0.08} ${x - s * 0.32} ${y - s * 0.12} C${x - s * 0.2} ${y - s * 0.25} ${x - s * 0.18} ${y - s * 0.44} ${x} ${y - s * 0.44}Z`} fill={fill} {...st} />
    <Pores x={x} y={y + s * 0.1} rx={s * 0.36} ry={s * 0.28} n={12} r={pr} /><Leaf x={x} y={y - s * 0.43} s={s * 0.8} />
  </g>
  if (kind === 'etrog') {
    // Oblong, bumpy outline, narrower towards the top, with a pitam (the little stalk) on top.
    const pts = Array.from({ length: 48 }, (_, i) => {
      const t = (i / 48) * Math.PI * 2, bump = 1 + 0.035 * Math.sin(t * 11), narrow = 1 - 0.18 * Math.max(0, -Math.sin(t))
      return `${(x + Math.cos(t) * s * 0.26 * bump * narrow).toFixed(1)},${(y + Math.sin(t) * s * 0.4 * bump).toFixed(1)}`
    })
    return <g>
      <polygon points={pts.join(' ')} fill={fill} {...st} strokeLinejoin="round" />
      <path d={`M${x} ${y - s * 0.4} v ${-s * 0.06}`} stroke={INK} strokeWidth={st.strokeWidth} /><circle cx={x} cy={y - s * 0.47} r={s * 0.025} fill={INK} />
      <Pores x={x} y={y} rx={s * 0.2} ry={s * 0.32} n={12} r={pr} />
    </g>
  }
  if (kind === 'kumquat') return <g>
    <Leaf x={x} y={y - s * 0.16} s={s * 0.9} /><Leaf x={x} y={y - s * 0.16} s={s * 0.9} flip />
    {[-1, 1].map(k => <g key={k}>
      <ellipse cx={x + k * s * 0.15} cy={y + s * 0.06} rx={s * 0.13} ry={s * 0.19} fill={fill} {...st} />
      <Pores x={x + k * s * 0.15} y={y + s * 0.06} rx={s * 0.1} ry={s * 0.15} n={4} r={pr} />
    </g>)}
  </g>
  // Round fruits: orange, clementine (flatter), grapefruit (big), pomelit (green).
  const [rx, ry] = { orange: [0.34, 0.34], clementine: [0.3, 0.25], grapefruit: [0.43, 0.42], pomelit: [0.37, 0.36] }[kind] || [0.34, 0.34]
  return <g>
    <ellipse cx={x} cy={y} rx={s * rx} ry={s * ry} fill={fill} {...st} />
    <Pores x={x} y={y} rx={s * rx * 0.85} ry={s * ry * 0.85} n={kind === 'grapefruit' ? 13 : 9} r={pr} />
    <path d={`M${x} ${y - s * ry} v ${-s * 0.05}`} stroke={INK} strokeWidth={st.strokeWidth} />
    {kind !== 'grapefruit' && <Leaf x={x} y={y - s * ry - s * 0.03} s={s} />}
  </g>
}

// A cut orange: peel ring, segments and a few seeds.
function OrangeHalf({ x, y, r, segments = 10, seeds = [] }) {
  return <g>
    <circle cx={x} cy={y} r={r} fill={FILL.orange} stroke={INK} strokeWidth="3" />
    <circle cx={x} cy={y} r={r * 0.86} fill="#fff7ed" stroke={INK} strokeWidth="1.5" />
    {Array.from({ length: segments }, (_, i) => {
      const a0 = (i / segments) * Math.PI * 2 + 0.05, a1 = ((i + 1) / segments) * Math.PI * 2 - 0.05, ri = r * 0.8, r0 = r * 0.1
      const p = (a, rr) => `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`
      return <path key={i} d={`M${p(a0, r0)} L${p(a0, ri)} A${ri} ${ri} 0 0 1 ${p(a1, ri)} L${p(a1, r0)}Z`} fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" strokeLinejoin="round" />
    })}
    {seeds.map(i => { const a = ((i + 0.5) / segments) * Math.PI * 2, cx = x + Math.cos(a) * r * 0.42, cy = y + Math.sin(a) * r * 0.42
      return <ellipse key={i} cx={cx} cy={cy} rx={r * 0.07} ry={r * 0.035} transform={`rotate(${(a * 180 / Math.PI).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`} fill="#fefce8" stroke={INK} strokeWidth="1.5" /> })}
  </g>
}

// ── content ──
const FRUITS = [
  { kind: 'orange', name: 'תפוז', about: ['כתום, עגול ומתוק', 'סוחטים ממנו מיץ'] },
  { kind: 'lemon', name: 'לימון', about: ['צהוב וחמוץ מאוד', 'מוסיפים לשתייה ולאוכל'] },
  { kind: 'grapefruit', name: 'אשכולית', about: ['גדולה, צהובה או אדומה', 'בטעם חמצמץ ומריר'] },
  { kind: 'clementine', name: 'קלמנטינה', about: ['קטנה וכתומה', 'קל מאוד לקלף אותה'] },
  { kind: 'pomelo', name: 'פומלה', about: ['הכי גדולה במשפחה', 'עם קליפה עבה'] },
  { kind: 'pomelit', name: 'פומלית', about: ['ירוקה ועגולה', 'מתוקה ועסיסית'] },
  { kind: 'etrog', name: 'אתרוג', about: ['צהוב ומחוספס', 'אחד מארבעת המינים'] },
  { kind: 'kumquat', name: 'קומקוואט', about: ['זעיר וסגלגל', 'אוכלים אותו עם הקליפה'] },
  { kind: 'lime', name: 'ליים', about: ['קטן, ירוק וחמוץ', 'דומה ללימון'] },
]
const fruit = name => FRUITS.find(f => f.name === name)

const READING = [
  'פירות הדר הם משפחה של פירות עסיסיים:',
  'תפוז, לימון, אשכולית, קלמנטינה ועוד.',
  'פירות הדר גדלים על עצים.',
  'מטע של עצי הדר נקרא פרדס.',
  'באביב העצים מתכסים בפרחים לבנים קטנים.',
  'לפריחה יש ריח מתוק וחזק — פריחת ההדר.',
  'מהפרחים צומחים פירות קטנים וירוקים.',
  'הם גדלים לאט לאט, ובחורף הם מוכנים לקטיף.',
  'בפירות הדר יש הרבה ויטמין C, שעוזר לגוף להיות בריא.',
  'לפני יותר ממאה שנה שלחו מכאן תפוזים באניות',
  'לארצות רחוקות. קראו להם תפוזי יפו, על שם העיר יפו.',
  'בחג הסוכות מברכים על ארבעת המינים,',
  'ואחד מהם הוא האתרוג — גם הוא פרי הדר!',
]
const TRUE_FALSE = [
  ['פירות הדר גדלים על עצים.', true],
  ['מטע של עצי הדר נקרא כרם.', false],
  ['הפרחים של עצי ההדר לבנים.', true],
  ['קוטפים את פירות ההדר בקיץ.', false],
  ['האתרוג הוא פרי הדר.', true],
  ['תפוזי יפו נקראו על שם העיר חיפה.', false],
]

const MATCH = ['תפוז', 'לימון', 'פומלה', 'אתרוג', 'קומקוואט', 'ליים']

// First letter: [name, three letters to choose from]. The right one is the word's first letter.
const LETTERS = [['תפוז', 'תטד'], ['לימון', 'למנ'], ['אשכולית', 'אעה'], ['קלמנטינה', 'קכח'], ['פומלה', 'פבו'], ['אתרוג', 'אעה'], ['קומקוואט', 'קכג'], ['ליים', 'לרי']]
const letterItems = seed => LETTERS.map(([name, abc], i) => ({ name, options: rngFor(seed, 30 + i).shuffle(abc.split('')) }))

// Counting rows: [oranges, lemons].
const COUNT = [[5, 3], [7, 2], [4, 5], [8, 1], [3, 6], [6, 2]]
const countRows = seed => COUNT.map(([o, l], i) => rngFor(seed, 40 + i).shuffle([...Array(o).fill('🍊'), ...Array(l).fill('🍋')]))

const PROBLEMS = [
  { q: ['נועה קטפה 6 תפוזים, ואבא קטף 5 תפוזים.', 'כמה תפוזים קטפו יחד?'], ans: '6 + 5 = 11' },
  { q: ['בסל היו 12 קלמנטינות. אורי אכל 3 קלמנטינות.', 'כמה קלמנטינות נשארו בסל?'], ans: '12 − 3 = 9' },
  { q: ['על עץ הלימון יש 8 לימונים צהובים ו־4 לימונים ירוקים.', 'כמה לימונים יש על העץ?'], ans: '8 + 4 = 12' },
  { q: ['בארגז יש 20 אשכוליות. דוד הוציא 7 אשכוליות.', 'כמה אשכוליות נשארו בארגז?'], ans: '20 − 7 = 13' },
  { q: ['לשירה יש 3 שקיות, ובכל שקית 4 קומקוואטים.', 'כמה קומקוואטים יש לשירה?'], ans: '4 + 4 + 4 = 12' },
  { q: ['תמר סחטה 10 תפוזים. מכל 2 תפוזים יצאה כוס מיץ.', 'כמה כוסות מיץ יצאו?'], ans: '2 + 2 + 2 + 2 + 2 = 10, יצאו 5 כוסות' },
]

const TASTE = [['תפוז', 'מתוק'], ['לימון', 'חמוץ'], ['קלמנטינה', 'מתוק'], ['ליים', 'חמוץ'], ['פומלית', 'מתוק'], ['אתרוג', 'חמוץ']]

// Blossom to harvest. The page shows the stages in a seeded order; children number them 1–4.
const STAGES = ['באביב: פרחים לבנים על העץ', 'פירות קטנים וירוקים', 'הפירות גדלים ומשנים צבע', 'בחורף: קוטפים את הפירות']
const STAGE_TAGS = ['א', 'ב', 'ג', 'ד']
const stageOrder = seed => rngFor(seed, 70).shuffle([0, 1, 2, 3])

const SEARCH = ['תפוז', 'לימון', 'פרדס', 'אתרוג', 'ליים', 'פומלה', 'הדר', 'קליפה']

// Board: 30 squares; specials by index (0-based). 'q' = draw a grove card.
const BOARD = {
  0: { lines: ['התחלה'], icon: '🏠' },
  3: { lines: ['ריח פריחה!', 'קדימה 2'], icon: 'blossom' },
  6: 'q',
  8: { lines: ['טעמתם לימון', 'חמוץ! אחורה 1'], icon: '🍋' },
  11: 'q',
  13: { lines: ['ירד גשם.', 'מחכים תור אחד'], icon: '🌧️' },
  16: { lines: ['מילאתם סל!', 'קדימה 3'], icon: '🧺' },
  18: 'q',
  21: { lines: ['הסל התהפך!', 'אחורה 3'], icon: '🍊' },
  23: 'q',
  25: { lines: ['עץ מלא פירות!', 'זורקים שוב'], icon: '🌳' },
  27: 'q',
  29: { lines: ['סיום!', 'הסל מלא'], icon: '🧺' },
}
const CARDS = [
  { q: ['מה הצבע של', 'לימון בשל?'], a: 'צהוב' },
  { q: ['איך קוראים למטע', 'של עצי הדר?'], a: 'פרדס' },
  { q: ['באיזה חג', 'משתמשים באתרוג?'], a: 'סוכות' },
  { q: ['באיזו עונה', 'קוטפים תפוזים?'], a: 'בחורף' },
  { q: ['איזה ויטמין יש', 'הרבה בפירות הדר?'], a: 'ויטמין C' },
  { q: ['מה הצבע של', 'פריחת ההדר?'], a: 'לבן' },
  { q: ['איך קוראים לחלקים', 'שבתוך התפוז?'], a: 'פלחים' },
  { q: ['איזה פרי הדר זעיר', 'אוכלים עם הקליפה?'], a: 'קומקוואט' },
  { q: ['3 תפוזים ועוד', '4 תפוזים — כמה?'], a: '7' },
  { q: ['באיזו אות מתחילה', 'המילה "פרדס"?'], a: 'פ' },
  { q: ['איזה פרי הדר', 'קטן, ירוק וחמוץ?'], a: 'ליים' },
  { q: ['10 לימונים פחות', '2 לימונים — כמה?'], a: '8' },
]

// ── pages ──
function GalleryPage({ n }) {
  const cw = 176, ch = 205, top = 128
  return <SvgPage label="מכירים את פירות ההדר">
    <Head n={n} title="מכירים את פירות ההדר" instruction="קוראים על כל פרי, ואפשר לצבוע אותו בצבעים שלו" />
    {FRUITS.map((f, i) => { const col = i % 3, row = Math.floor(i / 3), x = 570 - col * (cw + 6) - cw / 2, y = top + row * (ch + 6)
      return <g key={f.name} fontFamily={FONT} textAnchor="middle" direction="rtl">
        <rect x={x - cw / 2} y={y} width={cw} height={ch} rx="14" fill="white" stroke={INK} strokeWidth="2" />
        <Fruit kind={f.kind} x={x} y={y + 70} s={110} />
        <text x={x} y={y + 150} fontSize="23" fontWeight="800">{f.name}</text>
        {f.about.map((l, j) => <text key={j} x={x} y={y + 174 + j * 19} fontSize="14">{l}</text>)}
      </g> })}
    <text x={W / 2} y={790} fontSize="15" fontFamily={FONT} textAnchor="middle" direction="rtl">לכל פירות ההדר יש קליפה עם ריח טוב, ובפנים — פלחים עסיסיים.</text>
  </SvgPage>
}

function ReadingPage({ n }) {
  return <SvgPage label="קוראים ועונים">
    <Head n={n} title="קוראים ועונים" instruction="קוראים את הקטע, ואחר כך מקיפים: נכון או לא נכון" />
    <rect x="30" y="122" width="540" height={READING.length * 27 + 24} rx="14" fill="#fff7ed" stroke={INK} strokeWidth="1.5" />
    <g fontFamily={FONT} fontSize="17" direction="rtl" textAnchor="start">
      {READING.map((l, i) => <text key={i} x={550} y={150 + i * 27}>{l}</text>)}
    </g>
    {TRUE_FALSE.map(([s], i) => { const y = 530 + i * 47; return <g key={i} fontFamily={FONT} direction="rtl">
      <text x={570} y={y} fontSize="18" fontWeight="700" textAnchor="start">{i + 1}. {s}</text>
      <text x={150} y={y} fontSize="18" textAnchor="middle">נכון</text><text x={65} y={y} fontSize="18" textAnchor="middle">לא נכון</text>
      {i < TRUE_FALSE.length - 1 && <path d={`M30 ${y + 18} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function MatchFruitPage({ n, seed }) {
  const left = rngFor(seed, n).shuffle(MATCH), step = 106, top = 140
  return <SvgPage label="מי הפרי?">
    <Head n={n} title="מי הפרי?" instruction="מותחים קו מכל פרי לשם שלו (אפשר להיעזר בעמוד 2)" />
    {MATCH.map((name, i) => { const y = top + i * step + step / 2; return <g key={name}>
      <Fruit kind={fruit(name).kind} x={480} y={y} s={92} /><circle cx={385} cy={y} r="6" fill={INK} />
    </g> })}
    {left.map((name, i) => { const y = top + i * step + step / 2; return <g key={name}>
      <circle cx={215} cy={y} r="6" fill={INK} />
      <text x={190} y={y + 9} fontSize="26" fontWeight="800" textAnchor="start" fontFamily={FONT} direction="rtl">{name}</text>
    </g> })}
  </SvgPage>
}

function LetterPage({ n, seed }) {
  const items = letterItems(seed), rowH = 82
  return <SvgPage label="באיזו אות מתחיל?">
    <Head n={n} title="באיזו אות מתחיל?" instruction="אומרים את שם הפרי ומקיפים את האות שחסרה בהתחלה" />
    {items.map((it, i) => { const y = 140 + i * rowH + rowH / 2; return <g key={it.name} fontFamily={FONT} textAnchor="middle">
      <Fruit kind={fruit(it.name).kind} x={525} y={y} s={68} />
      <text x={375} y={y + 13} fontSize="36" fontWeight="700" direction="rtl">{`_${it.name.slice(1)}`}</text>
      {it.options.map((o, j) => <g key={j}><circle cx={220 - j * 75} cy={y} r="27" fill="white" stroke="#9aa5b5" strokeWidth="2" /><text x={220 - j * 75} y={y + 12} fontSize="32" fontWeight="800">{o}</text></g>)}
      {i < items.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function CountPage({ n, seed }) {
  const rows = countRows(seed), rowH = 110
  return <SvgPage label="סופרים פירות">
    <Head n={n} title="סופרים פירות" instruction="סופרים כמה תפוזים וכמה לימונים יש בכל שורה, וכמה בסך הכול" />
    {rows.map((row, i) => { const y = 140 + i * rowH + rowH / 2; return <g key={i} fontFamily={FONT} direction="rtl">
      {row.map((e, j) => <image key={j} href={art(e)} x={545 - j * 38 - 18} y={y - 18} width="36" height="36" />)}
      <g fontSize="16" textAnchor="start">
        <text x={190} y={y - 22}>תפוזים: ____</text>
        <text x={190} y={y + 6}>לימונים: ____</text>
        <text x={190} y={y + 34} fontWeight="700">בסך הכול: ____</text>
      </g>
      {i < rows.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function ProblemsPage({ n }) {
  const rowH = 110
  return <SvgPage label="חשבון בפרדס">
    <Head n={n} title="חשבון בפרדס" instruction="קוראים את השאלה, כותבים תרגיל ותשובה" />
    {PROBLEMS.map((p, i) => { const y = 135 + i * rowH; return <g key={i} fontFamily={FONT} direction="rtl" textAnchor="start">
      <text x={570} y={y + 26} fontSize="18" fontWeight="700">{i + 1}. {p.q[0]}</text>
      <text x={550} y={y + 52} fontSize="18" fontWeight="700">{p.q[1]}</text>
      <text x={550} y={y + 88} fontSize="17">תרגיל: ______________________ &#160;&#160; תשובה: ________</text>
      {i < PROBLEMS.length - 1 && <path d={`M30 ${y + rowH - 4} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function TastePage({ n }) {
  const rowH = 84
  return <SvgPage label="מתוק או חמוץ?">
    <Head n={n} title="מתוק או חמוץ?" instruction="מקיפים את הטעם של כל פרי: מתוק או חמוץ" />
    {TASTE.map(([name], i) => { const y = 140 + i * rowH + rowH / 2; return <g key={name} fontFamily={FONT} direction="rtl">
      <Fruit kind={fruit(name).kind} x={525} y={y} s={70} />
      <text x={455} y={y + 9} fontSize="26" fontWeight="800" textAnchor="start">{name}</text>
      <text x={200} y={y + 9} fontSize="24" textAnchor="middle">מתוק 😋</text>
      <text x={80} y={y + 9} fontSize="24" textAnchor="middle">חמוץ 😖</text>
      {i < TASTE.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
    <rect x="30" y="660" width="540" height="140" rx="16" fill="#fff7ed" stroke={INK} strokeWidth="2" />
    <g fontFamily={FONT} direction="rtl" textAnchor="start" fontSize="19">
      <text x={550} y={695} fontWeight="800">טועמים יחד! (עם מבוגר)</text>
      <text x={550} y={735}>פרי ההדר שאני הכי אוהב/ת: ____________________</text>
      <text x={550} y={775}>הטעם שלו: &#160; מתוק &#160; / &#160; חמוץ &#160; / &#160; גם וגם</text>
    </g>
  </SvgPage>
}

function PartsPage({ n }) {
  const cx = 300, cy = 330, r = 165
  // Numbered pointers: [label number, from (x, y) on the drawing, to (x, y) of the box].
  const pointers = [[1, cx + r * 0.87, cy - r * 0.32, 520, 170], [2, cx - r * 0.5, cy - r * 0.42, 80, 170], [3, cx + Math.cos(Math.PI * 0.9) * r * 0.42, cy + Math.sin(Math.PI * 0.9) * r * 0.42, 80, 505]]
  return <SvgPage label="חלקי התפוז">
    <Head n={n} title="חלקי התפוז" instruction="כותבים בכל מסגרת את שם החלק: קליפה · פלחים · גרעינים" />
    <OrangeHalf x={cx} y={cy} r={r} segments={10} seeds={[0, 2, 4, 6, 8]} />
    {pointers.map(([k, fx, fy, bx, by]) => <g key={k} fontFamily={FONT}>
      <path d={`M${fx} ${fy} L${bx} ${by}`} stroke={INK} strokeWidth="2" />
      <circle cx={fx} cy={fy} r="5" fill={INK} />
      <rect x={bx - 62} y={by - 22} width="124" height="44" rx="10" fill="white" stroke={INK} strokeWidth="2" />
      <text x={bx + 50} y={by + 7} fontSize="16" fontWeight="800" textAnchor="middle">{k}</text>
    </g>)}
    <g fontFamily={FONT} direction="rtl" textAnchor="start" fontSize="19">
      <text x={570} y={580} fontWeight="700">כמה פלחים יש בתפוז שבציור? ______</text>
      <text x={570} y={625} fontWeight="700">כמה גרעינים יש בתפוז שבציור? ______</text>
      <text x={570} y={670} fontWeight="700">איזה חלק אוכלים? מקיפים:</text>
      <text x={570} y={710} fontSize="22">קליפה &#160;&#160;&#160;&#160; פלחים &#160;&#160;&#160;&#160; גרעינים</text>
      <text x={570} y={765} fontSize="16">רעיון: מקלפים תפוז אמיתי וסופרים את הפלחים. כמה יצא לכם? ______</text>
    </g>
  </SvgPage>
}

// White five-petal citrus blossom.
function Blossom({ x, y, r }) {
  return <g>{Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * 360 - 90, px = x + Math.cos(a * Math.PI / 180) * r * 0.55, py = y + Math.sin(a * Math.PI / 180) * r * 0.55
    return <ellipse key={i} cx={px.toFixed(1)} cy={py.toFixed(1)} rx={r * 0.32} ry={r * 0.55} transform={`rotate(${a + 90} ${px.toFixed(1)} ${py.toFixed(1)})`} fill="white" stroke={INK} strokeWidth="1.5" /> })}
    <circle cx={x} cy={y} r={r * 0.22} fill="#fde047" stroke={INK} strokeWidth="1.2" /></g>
}

function StageArt({ stage, x, y }) {
  const branch = <path d={`M${x - 90} ${y + 10} Q${x} ${y - 25} ${x + 90} ${y + 5}`} stroke="#92400e" strokeWidth="5" fill="none" strokeLinecap="round" />
  if (stage === 0) return <g>{branch}<Leaf x={x - 20} y={y - 10} s={90} />{[-55, 0, 55].map(dx => <Blossom key={dx} x={x + dx} y={y - 8} r={20} />)}</g>
  if (stage === 1) return <g>{branch}<Leaf x={x + 30} y={y - 8} s={90} />{[-50, 5, 55].map(dx => <path key={'s' + dx} d={`M${x + dx} ${y - 6} V${y + 8}`} stroke="#92400e" strokeWidth="2" />)}{[-50, 5, 55].map(dx => <circle key={dx} cx={x + dx} cy={y + 18} r="11" fill="#86efac" stroke={INK} strokeWidth="1.8" />)}</g>
  if (stage === 2) return <g>{branch}<Leaf x={x + 10} y={y - 12} s={90} />{[-48, 48].map((dx, j) => <g key={dx}><path d={`M${x + dx} ${y - 6} V${y + 3}`} stroke="#92400e" strokeWidth="2" /><circle cx={x + dx} cy={y + 30} r="28" fill={j ? '#fde68a' : '#bef264'} stroke={INK} strokeWidth="2" /></g>)}</g>
  return <g>
    <Fruit kind="orange" x={x - 30} y={y - 8} s={60} /><Fruit kind="orange" x={x + 25} y={y - 12} s={60} />
    <image href={art('🧺')} x={x - 60} y={y - 20} width="120" height="90" />
  </g>
}

function StagesPage({ n, seed }) {
  const order = stageOrder(seed), bw = 260, bh = 230
  return <SvgPage label="מהפריחה עד הקטיף">
    <Head n={n} title="מהפריחה עד הקטיף" instruction="מה קורה קודם? כותבים בכל עיגול מספר מ־1 עד 4" />
    {order.map((stage, i) => { const col = i % 2, row = Math.floor(i / 2), x = 435 - col * (bw + 30), y = 135 + row * (bh + 20)
      return <g key={stage} fontFamily={FONT} textAnchor="middle" direction="rtl">
        <rect x={x - bw / 2} y={y} width={bw} height={bh} rx="16" fill="white" stroke={INK} strokeWidth="2" />
        <circle cx={x + bw / 2 - 28} cy={y + 28} r="19" fill="white" stroke={INK} strokeWidth="2.5" />
        <text x={x - bw / 2 + 24} y={y + 34} fontSize="20" fontWeight="800">{STAGE_TAGS[i]}</text>
        <StageArt stage={stage} x={x} y={y + 105} />
        <text x={x} y={y + bh - 22} fontSize="17" fontWeight="700">{STAGES[stage]}</text>
      </g> })}
    <g fontFamily={FONT} direction="rtl" textAnchor="start" fontSize="19">
      <text x={570} y={655} fontWeight="800">מקיפים את העונה הנכונה:</text>
      <text x={570} y={700}>פריחת ההדר והריח המתוק — &#160; באביב &#160; / &#160; בחורף</text>
      <text x={570} y={745}>קוטפים את רוב התפוזים — &#160; באביב &#160; / &#160; בחורף</text>
      <text x={570} y={790}>מטע של עצי הדר נקרא: &#160; פרדס &#160; / &#160; כרם &#160; / &#160; חורשה</text>
    </g>
  </SvgPage>
}

function BoardPage({ n }) {
  const sw = 108, sh = 78, top = 125
  const pos = k => { const row = Math.floor(k / 5), c = row % 2 ? 4 - (k % 5) : k % 5; return [516 - c * sw, top + (5 - row) * sh + sh / 2] }
  return <SvgPage label="משחק: מסע בפרדס">
    <g fontFamily={FONT} textAnchor="middle" direction="rtl">
      <text x={W / 2} y="42" fontSize="27" fontWeight="800">🎲 משחק: מסע בפרדס</text>
      <text x={W / 2} y="72" fontSize="15">ממלאים סל בפירות הדר — מי יגיע ראשון למשבצת 30?</text>
      <text x={W / 2} y="98" fontSize="14">עמוד {n} בחוברת · מדפיסים, ואפשר להדביק על קרטון</text>
    </g>
    {Array.from({ length: 30 }, (_, k) => { const [x, y] = pos(k), sp = BOARD[k], q = sp === 'q'
      return <g key={k} fontFamily={FONT} textAnchor="middle" direction="rtl">
        <rect x={x - sw / 2 + 3} y={y - sh / 2 + 3} width={sw - 6} height={sh - 6} rx="10" fill={q ? '#fef9c3' : sp ? '#ffedd5' : 'white'} stroke={INK} strokeWidth={k === 0 || k === 29 ? 3 : 1.8} />
        <text x={x + sw / 2 - 14} y={y - sh / 2 + 19} fontSize="12" fontWeight="700">{k + 1}</text>
        {q && <g><circle cx={x} cy={y - 8} r="17" fill="white" stroke={INK} strokeWidth="2" /><text x={x} y={y + 1} fontSize="24" fontWeight="800">?</text><text x={x} y={y + 27} fontSize="12" fontWeight="700">קלף פרדס</text></g>}
        {sp && !q && <g>
          {sp.icon === 'blossom' ? <Blossom x={x} y={y - sh / 2 + 21} r={13} /> : <image href={art(sp.icon)} x={x - 15} y={y - sh / 2 + 6} width="30" height="30" />}
          {sp.lines.map((l, j) => <text key={j} x={x} y={y + 12 + j * 14} fontSize="12" fontWeight="700">{l}</text>)}
        </g>}
        {!sp && <Fruit kind={FRUITS[k % FRUITS.length].kind} x={x} y={y + 4} s={40} />}
      </g> })}
    <g fontFamily={FONT} direction="rtl" textAnchor="start" fontSize="14">
      <text x={570} y={622} fontSize="17" fontWeight="800">איך משחקים? (2–4 שחקנים)</text>
      <text x={570} y={647}>צריך: קובייה, כלי משחק וקלפי פרדס (גוזרים אותם מהעמוד הבא).</text>
      <text x={570} y={671}>1. כולם מתחילים במשבצת 1. הצעיר ביותר משחק ראשון, ואחריו ממשיכים לפי הסדר.</text>
      <text x={570} y={695}>2. בכל תור זורקים את הקובייה ומתקדמים לפי המספרים שעל המשבצות.</text>
      <text x={570} y={719}>3. נחתתם על משבצת עם הוראה? עושים מה שכתוב בה — רק הוראה אחת בכל תור.</text>
      <text x={570} y={743}>4. נחתתם על "?" — שחקן אחר מרים קלף פרדס וקורא לכם את השאלה.</text>
      <text x={570} y={765}>&#160;&#160;&#160;&#160;עניתם נכון? קדימה 1. לא ידעתם? שומעים את התשובה ונשארים.</text>
      <text x={570} y={789}>5. מי שמגיע ראשון למשבצת 30 ממלא את הסל ומנצח! (לא צריך מספר מדויק)</text>
    </g>
  </SvgPage>
}

const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }
// Cube net: a column of four faces (1, 2, 6, 5) with 3 and 4 on the sides of the second face — opposite faces add up to 7.
const NET = [[1, 0, 1], [2, 1, 1], [6, 2, 1], [5, 3, 1], [3, 1, 0], [4, 1, 2]]

function CutoutsPage({ n }) {
  const tokens = ['תפוז', 'לימון', 'ליים', 'אתרוג'], cell = 40, nx = 40, ny = 130
  const cw = 176, ch = 110, top = 345
  return <SvgPage label="כלי משחק וקלפים לגזירה">
    <Head n={n} title="✂️ כלי משחק וקלפים לגזירה" instruction="גוזרים לאורך הקווים המקווקווים" />
    {/* Stand-up tokens: fold on the middle line, the fruit faces both ways. */}
    {tokens.map((name, i) => { const x = 545 - i * 66, w = 58, h = 150, y = ny
      return <g key={name} fontFamily={FONT} textAnchor="middle">
        <rect x={x - w / 2} y={y} width={w} height={h} rx="4" fill="white" stroke={INK} strokeWidth="1.5" strokeDasharray="6 4" />
        <path d={`M${x - w / 2} ${y + h / 2} H${x + w / 2}`} stroke="#9aa5b5" strokeWidth="1.5" />
        <g transform={`rotate(180 ${x} ${y + h / 4})`}><Fruit kind={fruit(name).kind} x={x} y={y + h / 4 - 4} s={48} /><text x={x} y={y + h / 4 + 30} fontSize="12" fontWeight="700">{name}</text></g>
        <Fruit kind={fruit(name).kind} x={x} y={y + h * 0.75 - 4} s={48} /><text x={x} y={y + h * 0.75 + 30} fontSize="12" fontWeight="700">{name}</text>
      </g> })}
    <text x={448} y={300} fontSize="13" fontFamily={FONT} textAnchor="middle" direction="rtl">כלי משחק: גוזרים, מקפלים בקו האמצע ומעמידים</text>
    {/* Dice net. */}
    {NET.map(([face, r, c]) => { const x = nx + c * cell, y = ny + r * cell
      return <g key={face}>
        <rect x={x} y={y} width={cell} height={cell} fill="white" stroke={INK} strokeWidth="1.5" strokeDasharray="5 3" />
        {PIPS[face].map(([dx, dy], j) => <circle key={j} cx={x + cell / 2 + dx * 11} cy={y + cell / 2 + dy * 11} r="4" fill={INK} />)}
      </g> })}
    <g fontFamily={FONT} fontSize="13" textAnchor="middle" direction="rtl">
      <text x={nx + cell * 1.5 + 10} y={ny + cell * 4 + 17}>קובייה: גוזרים, מקפלים</text>
      <text x={nx + cell * 1.5 + 10} y={ny + cell * 4 + 34}>ומדביקים בסלוטייפ</text>
    </g>
    {/* Grove question cards — the answer is upside down at the bottom, for the player who reads it. */}
    {CARDS.map((c, i) => { const col = i % 3, row = Math.floor(i / 3), x = 570 - col * (cw + 6) - cw / 2, y = top + row * (ch + 6)
      return <g key={i} fontFamily={FONT} textAnchor="middle" direction="rtl">
        <rect x={x - cw / 2} y={y} width={cw} height={ch} rx="10" fill="white" stroke={INK} strokeWidth="1.5" strokeDasharray="6 4" />
        <text x={x} y={y + 22} fontSize="12" fontWeight="800">❓ קלף פרדס</text>
        {c.q.map((l, j) => <text key={j} x={x} y={y + 48 + j * 21} fontSize="16" fontWeight="700">{l}</text>)}
        <path d={`M${x - cw / 2 + 12} ${y + ch - 30} H${x + cw / 2 - 12}`} stroke="#ddd" />
        <text x={x} y={y + ch - 12} fontSize="12" transform={`rotate(180 ${x} ${y + ch - 16})`}>תשובה: {c.a}</text>
      </g> })}
  </SvgPage>
}

export default function CitrusBooklet({ seed }) {
  const letters = letterItems(seed), order = stageOrder(seed)
  return <>
    <Cover emoji="🍊🍋" title="חוברת פירות הדר" subtitle="15 עמודים: קוראים, כותבים, סופרים ופותרים — ובסוף משחק לוח “מסע בפרדס”" pages={PAGES}
      note="מתאימה לכיתות א׳–ב׳. כדאי להתחיל בעמוד 2, להכיר את תשעת הפירות, ולחזור אליו בכל פעם שצריך. בעמוד 8 טועמים ביחד, ובעמודים 12–13 יש משחק לוח: מדפיסים את שני העמודים, גוזרים את כלי המשחק, הקובייה והקלפים — ומשחקים." />
    <GalleryPage n={2} />
    <ReadingPage n={3} />
    <MatchFruitPage n={4} seed={seed} />
    <LetterPage n={5} seed={seed} />
    <CountPage n={6} seed={seed} />
    <ProblemsPage n={7} />
    <TastePage n={8} />
    <PartsPage n={9} />
    <StagesPage n={10} seed={seed} />
    <WordSearchPage n={11} seed={seed} he size={9} title="תפזורת פירות הדר" instruction="מוצאים את המילים: הן כתובות מימין לשמאל או מלמעלה למטה" words={SEARCH.map(word => ({ word }))} />
    <BoardPage n={12} />
    <CutoutsPage n={13} />
    <AnswerKey n={14} sections={[
      { title: 'עמוד 3 — נכון או לא נכון', answers: TRUE_FALSE.map(([s, t]) => `${t ? 'נכון' : 'לא נכון'} (${s.replace('.', '')})`) },
      { title: 'עמוד 4 — מי הפרי (מלמעלה למטה)', answers: MATCH },
      { title: 'עמוד 5 — האות הראשונה', answers: letters.map(l => `${l.name} — ${l.name[0]}`) },
      { title: 'עמוד 6 — סופרים', answers: COUNT.map(([o, l]) => `${o} תפוזים, ${l} לימונים, ${o + l} בסך הכול`) },
      { title: 'עמוד 7 — חשבון בפרדס', answers: PROBLEMS.map(p => p.ans) },
      { title: 'עמוד 8 — מתוק או חמוץ', answers: TASTE.map(([f, t]) => `${f} — ${t}`) },
      { title: 'עמוד 9 — חלקי התפוז', answers: ['1 — קליפה, 2 — פלחים, 3 — גרעינים', '10 פלחים', '5 גרעינים', 'אוכלים את הפלחים'] },
      { title: 'עמוד 10 — מהפריחה עד הקטיף', answers: [...order.map((stage, i) => `מסגרת ${STAGE_TAGS[i]} — ${stage + 1}`), 'פריחה — באביב', 'קטיף — בחורף', 'פרדס'] },
    ]} />
    <Certificate booklet="חוברת פירות הדר" done="הכרתי תשעה פירות הדר, למדתי על הפרדס, פתרתי, ספרתי ושיחקתי במסע בפרדס." cheer="מומחה/ית פירות הדר! 🍊" />
  </>
}
