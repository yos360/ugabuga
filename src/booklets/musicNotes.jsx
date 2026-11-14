import { AnswerKey, Certificate, Cover, Head, SvgPage, WordSearchPage } from './kit'
import { bookletBySlug } from './registry'

// "חוברת לימוד תווים למתחילים" — reading notes on the treble staff for beginners: the staff, the G clef,
// the seven note names, notes on lines and in spaces, drawing notes, the piano keys, note lengths and a
// first melody (Ode to Joy, Beethoven, public domain). Music runs left to right, so every staff is drawn
// LTR inside the RTL page. Notes are diatonic steps from middle C (0 = C4, 2 = E4 on the bottom line).

export const NAMES = ['דו', 'רה', 'מי', 'פה', 'סול', 'לה', 'סי']
export const nameOf = s => NAMES[((s % 7) + 7) % 7]
// Where a note sits, counting lines and spaces from the bottom of the staff.
export const placeOf = s => s === 0 ? 'קו עזר מתחת לחמשה' : s === 1 ? 'מתחת לקו 1' : s % 2 === 0 ? `קו ${s / 2}` : `רווח ${(s - 1) / 2}`
// Every place a note name can be drawn between middle C and the top line (F5).
export const placesOfName = name => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(s => nameOf(s) === name).map(placeOf)
// Note lengths in 4/4: whole, half, quarter, eighth (and a dotted quarter inside the melody).
export const BEATS = { w: 4, h: 2, q: 1, e: 0.5, qd: 1.5 }
export const DUR_NAMES = { w: 'תו שלם', h: 'חצי', q: 'רבע', e: 'שמינית' }
export const beatsText = b => b === 0.5 ? '½' : Number.isInteger(b) ? String(b) : `${Math.floor(b)}½`

export const STAFF_Q = [2, 5, 8, 3, 10, 7] // page 2: on which line or space? (line 1, space 2, line 4, space 1, line 5, space 3)
export const LINE_NOTES = [4, 2, 8, 6, 10, 4, 6, 2, 10, 8, 4, 6] // page 6: E G B D F
export const SPACE_NOTES = [5, 3, 9, 0, 7, 1, 3, 7, 0, 9, 5, 1] // page 7: F A C E, middle C and D
export const DRAW = ['סול', 'לה', 'מי', 'דו', 'סי', 'רה', 'פה', 'סול', 'לה', 'סי', 'מי', 'דו'] // page 8
export const PIANO_Q = [4, 0, 2, 7, 5, 1] // page 9: staff note -> key number (C4 is key 1)
export const SEQS = [ // page 4: complete the ladder, up or down
  [['דו', 'רה', null, 'פה'], 'מי'], [['סול', null, 'סי', 'דו'], 'לה'], [['מי', 'פה', 'סול', null], 'לה'],
  [['לה', 'סי', null, 'רה'], 'דו'], [['סי', 'לה', null, 'פה'], 'סול'], [['פה', null, 'רה', 'דו'], 'מי'],
  [['רה', null, 'פה', 'סול'], 'מי'], [['דו', 'סי', 'לה', null], 'סול'],
]
export const DUR_Q = ['h', 'e', 'w', 'q', 'h', 'e'] // page 10: how many beats?
export const SUMS = [['q', 'q'], ['h', 'q'], ['e', 'e'], ['h', 'h'], ['q', 'q', 'h'], ['e', 'e', 'q'], ['w', 'q'], ['h', 'e', 'e']] // page 11
export const BARS = [[['h', 'q'], 'רבע'], [['e', 'e', 'e', 'e'], 'חצי'], [['h', 'e', 'e'], 'רבע']] // page 11: what completes 4 beats?
// Ode to Joy in C (Beethoven, 9th symphony, 1824): [step, length]; bars of 4 beats.
const E = 2, F = 3, G = 4, D = 1, C = 0
const ODE_START = [[E, 'q'], [E, 'q'], [F, 'q'], [G, 'q'], [G, 'q'], [F, 'q'], [E, 'q'], [D, 'q'], [C, 'q'], [C, 'q'], [D, 'q'], [E, 'q']]
export const ODE = [
  [...ODE_START, [E, 'qd'], [D, 'e'], [D, 'h']],
  [...ODE_START, [D, 'qd'], [C, 'e'], [C, 'h']],
]
export const SEARCH = ['חמשה', 'מפתח', 'פסנתר', 'מנגינה', 'קצב', 'סולם', 'שיר', 'תו']

const PAGES = bookletBySlug('music-notes').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'
// The site's drawn treble clef (see /music/read-notes), made for a staff with gap 10 and bottom line at y=90.
const CLEF = 'M52 112 C44 112 42 104 48 101 C54 99 57 106 52 108 M50 104 L60 26 C62 14 72 14 70 26 C68 40 40 52 40 72 C40 86 56 92 66 86 C76 79 72 64 60 64 C50 64 46 74 54 80'

const yOf = (s, bottom, gap) => bottom - (s - 2) * gap / 2

function Clef({ x, bottom, gap, trace }) {
  const k = gap / 10
  return <path d={CLEF} transform={`translate(${x - 40 * k} ${bottom - 90 * k}) scale(${k})`} fill="none"
    stroke={trace ? '#aaa' : INK} strokeWidth={(trace ? 2 : 2.4)} strokeDasharray={trace ? '3 3' : undefined} strokeLinecap="round" />
}

// One note on a staff: head (open for whole and half), stem, flag for an eighth, dot, ledger lines.
function Note({ x, s, dur = 'w', bottom, gap }) {
  const y = yOf(s, bottom, gap), rx = gap * 0.68, ry = gap * 0.5, open = dur === 'w' || dur === 'h'
  const up = s < 6, sx = up ? x + rx * 0.9 : x - rx * 0.9, sy = up ? y - gap * 3.4 : y + gap * 3.4
  const ledgers = []
  for (let k = 0; k >= s; k -= 2) ledgers.push(yOf(k, bottom, gap))
  for (let k = 12; k <= s; k += 2) ledgers.push(yOf(k, bottom, gap))
  return <g>
    {ledgers.map(ly => <line key={ly} x1={x - rx * 1.7} x2={x + rx * 1.7} y1={ly} y2={ly} stroke={INK} strokeWidth="1.4" />)}
    <ellipse cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(-20 ${x} ${y})`} fill={open ? 'white' : INK} stroke={INK} strokeWidth={open ? 2.2 : 1} />
    {dur !== 'w' && <line x1={sx} x2={sx} y1={y} y2={sy} stroke={INK} strokeWidth="1.6" />}
    {dur === 'e' && <path d={up ? `M${sx} ${sy} q${gap * 0.9} ${gap * 0.8} ${gap * 0.7} ${gap * 2.2}` : `M${sx} ${sy} q${gap * 0.9} ${-gap * 0.8} ${gap * 0.7} ${-gap * 2.2}`} fill="none" stroke={INK} strokeWidth="2" />}
    {dur === 'qd' && <circle cx={x + rx * 1.8} cy={s % 2 === 0 ? y - gap / 2 : y} r={gap * 0.17} fill={INK} />}
  </g>
}

function Staff({ x1, x2, bottom, gap, clef = true, children }) {
  return <g direction="ltr">
    {[0, 1, 2, 3, 4].map(i => <line key={i} x1={x1} x2={x2} y1={bottom - i * gap} y2={bottom - i * gap} stroke={INK} strokeWidth="1.3" />)}
    {clef && <Clef x={x1 + 4} bottom={bottom} gap={gap} />}
    {children}
  </g>
}

// A lone note symbol (no staff), stem up: for the note-length pages.
function Sym({ x, y, dur, size = 14 }) {
  const rx = size * 0.68, ry = size * 0.5, open = dur === 'w' || dur === 'h', sx = x + rx * 0.9, sy = y - size * 3.2
  return <g>
    <ellipse cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(-20 ${x} ${y})`} fill={open ? 'white' : INK} stroke={INK} strokeWidth={open ? 2.4 : 1} />
    {dur !== 'w' && <line x1={sx} x2={sx} y1={y} y2={sy} stroke={INK} strokeWidth="1.8" />}
    {dur === 'e' && <path d={`M${sx} ${sy} q${size * 0.9} ${size * 0.8} ${size * 0.7} ${size * 2.2}`} fill="none" stroke={INK} strokeWidth="2.2" />}
  </g>
}

const T = ({ x, y, size = 16, bold, anchor = 'middle', children, fill = INK }) =>
  <text x={x} y={y} fontSize={size} fontWeight={bold ? 800 : 400} textAnchor={anchor} fontFamily={FONT} direction="rtl" fill={fill}>{children}</text>
const Box = ({ x, y, w = 44, h = 30 }) => <rect x={x - w / 2} y={y} width={w} height={h} rx="6" fill="white" stroke={INK} strokeWidth="1.6" />

// Page 2 — the staff: five lines and four spaces, counted from the bottom.
function StaffIntroPage({ n }) {
  const gap = 26, bottom = 330
  return <SvgPage label="הכירו את החמשה">
    <Head n={n} title="הכירו את החמשה" instruction="את התווים כותבים על חמשה: חמישה קווים וארבעה רווחים ביניהם" />
    <Staff x1={110} x2={490} bottom={bottom} gap={gap} clef={false} />
    {[0, 1, 2, 3, 4].map(i => <T key={i} x={500} y={bottom - i * gap + 6} size={17} bold anchor="end">{`קו ${i + 1}`}</T>)}
    {[0, 1, 2, 3].map(i => <T key={i} x={100} y={bottom - i * gap - gap / 2 + 6} size={15} anchor="start">{`רווח ${i + 1}`}</T>)}
    <T x={300} y={375} size={16}>סופרים תמיד מלמטה למעלה: הקו התחתון הוא קו 1, והרווח שמעליו הוא רווח 1.</T>
    <T x={300} y={405} size={17} bold>על איזה קו או רווח יושב התו? כתבו מתחת לכל חמשה.</T>
    {STAFF_Q.map((s, i) => { const cx = 470 - (i % 3) * 170, b = 530 + Math.floor(i / 3) * 160; return <g key={i}>
      <Staff x1={cx - 70} x2={cx + 70} bottom={b} gap={14} clef={false}><Note x={cx} s={s} bottom={b} gap={14} /></Staff>
      <T x={cx} y={b + 50} size={15}>קו / רווח מספר ____</T>
    </g> })}
  </SvgPage>
}

// Page 3 — the G clef: what it says, then rows of clefs to trace.
function ClefPage({ n }) {
  const g = 18, b = 270
  return <SvgPage label="מפתח סול">
    <Head n={n} title="מפתח סול" instruction="עוברים עם העיפרון על המפתחות המנוקדים, ומציירים לבד בסוף כל שורה" />
    <Staff x1={170} x2={430} bottom={b} gap={g} clef={false}><Clef x={185} bottom={b} gap={g} /></Staff>
    <line x1={170} x2={430} y1={b - g} y2={b - g} stroke={INK} strokeWidth="4" />
    <T x={445} y={b - g + 6} size={16} bold anchor="end">← קו 2: כאן גר הסול</T>
    <T x={300} y={330} size={15}>מפתח סול מתחיל בסלסול סביב הקו השני מלמטה, ומודיע לנו: התו שעל הקו הזה הוא סול.</T>
    <T x={300} y={355} size={15}>מהסול סופרים למעלה ולמטה, וכך יודעים את השם של כל שאר התווים.</T>
    {[0, 1, 2].map(r => { const rb = 480 + r * 115; return <Staff key={r} x1={40} x2={560} bottom={rb} gap={12} clef={false}>
      {[0, 1, 2, 3].map(k => <Clef key={k} x={60 + k * 100} bottom={rb} gap={12} trace />)}
    </Staff> })}
    <T x={300} y={790} size={14}>טיפ: מתחילים מהסלסול הקטן למטה, עולים למעלה ויורדים בעיגול סביב הקו השני.</T>
  </SvgPage>
}

// Page 4 — the seven names as a staircase, then complete the ladders.
function NamesPage({ n }) {
  const steps = [...NAMES, 'דו']
  return <SvgPage label="שבעת שמות התווים">
    <Head n={n} title="שבעת שמות התווים" instruction="יש רק שבעה שמות, והם חוזרים שוב ושוב: דו רה מי פה סול לה סי — ושוב דו" />
    <g direction="ltr">{steps.map((name, i) => { const x = 60 + i * 62, h = 30 + i * 22; return <g key={i}>
      <rect x={x} y={360 - h} width={58} height={h} rx="4" fill="white" stroke={INK} strokeWidth="2" />
      <T x={x + 29} y={360 - h + 24} size={18} bold>{name}</T>
    </g> })}</g>
    <T x={300} y={392} size={15}>כשעולים במדרגות הצליל עולה, וכשיורדים הצליל יורד.</T>
    <T x={300} y={428} size={17} bold>השלימו את התו החסר. שימו לב: יש שורות שעולות ויש שורות שיורדות.</T>
    <g direction="ltr">{SEQS.map(([seq], i) => { const y = 480 + i * 40; return <g key={i}>
      <T x={60} y={y} size={15} anchor="start">{`${i + 1}.`}</T>
      {seq.map((v, k) => <g key={k}>{v ? <T x={150 + k * 100} y={y} size={22} bold>{v}</T> : <Box x={150 + k * 100} y={y - 24} w={64} />}
        {k < 3 && <T x={200 + k * 100} y={y} size={18}>→</T>}</g>)}
    </g> })}</g>
  </SvgPage>
}

// Page 5 — a map of every note from middle C to G above the staff, with the two rhymes to remember.
function MapPage({ n }) {
  const map = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], b = 290, gap = 16
  return <SvgPage label="מפת התווים על החמשה">
    <Head n={n} title="מפת התווים על החמשה" instruction="שומרים את העמוד הזה ליד הפסנתר או הכלי שלכם" />
    <Staff x1={40} x2={570} bottom={b} gap={gap}>{map.map((s, i) => <Note key={s} x={135 + i * 37} s={s} bottom={b} gap={gap} />)}</Staff>
    <g direction="ltr">{map.map((s, i) => <T key={s} x={135 + i * 37} y={b + 50} size={15} bold>{nameOf(s)}</T>)}</g>
    <T x={300} y={b + 80} size={14}>דו האמצעי יושב על קו עזר קטן מתחת לחמשה. רה נוגע בקו 1 מלמטה.</T>
    {[['על הקווים', [2, 4, 6, 8, 10], 470], ['ברווחים', [3, 5, 7, 9], 160]].map(([title, notes, cx]) => <g key={title}>
      <T x={cx} y={450} size={19} bold>{title}</T>
      <Staff x1={cx - 140} x2={cx + 140} bottom={560} gap={16}>{notes.map((s, i) => <Note key={s} x={cx - 60 + i * 42} s={s} bottom={560} gap={16} />)}</Staff>
      <g direction="ltr">{notes.map((s, i) => <T key={s} x={cx - 60 + i * 42} y={600} size={15} bold>{nameOf(s)}</T>)}</g>
    </g>)}
    <rect x={50} y={640} width={500} height={130} rx="16" fill="white" stroke={INK} strokeWidth="2" strokeDasharray="6 5" />
    <T x={300} y={675} size={17} bold>איך זוכרים?</T>
    <T x={300} y={708} size={16}>על הקווים, מלמטה למעלה: מי · סול · סי · רה · פה</T>
    <T x={300} y={740} size={16}>ברווחים, מלמטה למעלה: פה · לה · דו · מי</T>
  </SvgPage>
}

// Pages 6–7 — name the notes: three staffs of four notes, a box under each.
function NamePage({ n, title, instruction, notes }) {
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {[0, 1, 2].map(r => { const b = 250 + r * 200; return <g key={r}>
      <Staff x1={40} x2={560} bottom={b} gap={16}>{notes.slice(r * 4, r * 4 + 4).map((s, i) => <Note key={i} x={180 + i * 110} s={s} bottom={b} gap={16} />)}</Staff>
      <g direction="ltr">{notes.slice(r * 4, r * 4 + 4).map((_, i) => <g key={i}><Box x={180 + i * 110} y={b + 45} w={64} h={36} />
        <T x={180 + i * 110 - 37} y={b + 70} size={13} anchor="start">{r * 4 + i + 1}</T></g>)}</g>
    </g> })}
    <T x={300} y={790} size={14}>אפשר להיעזר במפת התווים בעמוד 5. מי שסיים — שירשום את התווים בפסנתר של האתר וינגן אותם.</T>
  </SvgPage>
}

// Page 8 — draw the note above each name.
function DrawPage({ n }) {
  return <SvgPage label="מציירים תווים">
    <Head n={n} title="מציירים תווים" instruction="מציירים עיגול מלא (תו) במקום הנכון על החמשה, מעל כל שם" />
    {[0, 1, 2].map(r => { const b = 250 + r * 190; return <g key={r}>
      <Staff x1={40} x2={560} bottom={b} gap={16} />
      <g direction="ltr">{DRAW.slice(r * 4, r * 4 + 4).map((name, i) => <g key={i}>
        <line x1={180 + i * 110} x2={180 + i * 110} y1={b + 18} y2={b + 26} stroke="#999" />
        <T x={180 + i * 110} y={b + 55} size={20} bold>{name}</T>
      </g>)}</g>
    </g> })}
    <T x={300} y={760} size={15}>לשמות דו, רה, מי ופה יש שני מקומות — אחד נמוך ואחד גבוה. אפשר לבחור אחד מהם.</T>
  </SvgPage>
}

// Page 9 — the piano: write the names on the keys, then find the key of each note.
const BLACK_AFTER = [0, 1, 3, 4, 5] // C#, D#, F#, G#, A#
function PianoPage({ n }) {
  const kx = k => 60 + k * 60, top = 140, bh = 230
  return <SvgPage label="התווים בפסנתר">
    <Head n={n} title="התווים בפסנתר" instruction="כתבו את שם התו על כל קליד לבן. הקליד הראשון כבר כתוב" />
    <g direction="ltr">
      {[0, 1, 2, 3, 4, 5, 6, 7].map(k => <g key={k}>
        <rect x={kx(k)} y={top} width={60} height={bh} fill="white" stroke={INK} strokeWidth="2" />
        {k === 0 ? <T x={kx(k) + 30} y={top + bh - 22} size={18} bold>דו</T> : <Box x={kx(k) + 30} y={top + bh - 46} w={48} h={32} />}
        <T x={kx(k) + 30} y={top + bh + 26} size={16} bold>{k + 1}</T>
      </g>)}
      {BLACK_AFTER.map(k => <rect key={k} x={kx(k) + 42} y={top} width={36} height={bh * 0.6} rx="3" fill={INK} />)}
    </g>
    <T x={300} y={top + bh + 60} size={14}>רמז: דו נמצא תמיד משמאל לזוג הקלידים השחורים.</T>
    <T x={300} y={470} size={17} bold>איזה קליד מנגן את התו? כתבו את מספר הקליד.</T>
    {PIANO_Q.map((s, i) => { const cx = 470 - (i % 3) * 170, b = 570 + Math.floor(i / 3) * 130; return <g key={i}>
      <Staff x1={cx - 75} x2={cx + 75} bottom={b} gap={12}><Note x={cx + 20} s={s} bottom={b} gap={12} /></Staff>
      <T x={cx} y={b + 45} size={15}>קליד מספר: ____</T>
    </g> })}
  </SvgPage>
}

// Page 10 — how long each note lasts, then circle the beats.
function LengthsPage({ n }) {
  return <SvgPage label="משכי התווים">
    <Head n={n} title="משכי התווים" instruction="הצורה של התו אומרת כמה זמן מחזיקים אותו. סופרים פעימות: 1, 2, 3, 4" />
    {['w', 'h', 'q', 'e'].map((d, i) => { const y = 200 + i * 78; return <g key={d}>
      <Sym x={470} y={y + 10} dur={d} size={13} />
      <T x={380} y={y} size={20} bold anchor="end">{DUR_NAMES[d]}</T>
      <T x={190} y={y} size={18}>{BEATS[d] === 0.5 ? 'חצי פעימה (½)' : `${beatsText(BEATS[d])} ${BEATS[d] === 1 ? 'פעימה' : 'פעימות'}`}</T>
      <path d={`M60 ${y + 26} H540`} stroke="#ddd" strokeDasharray="5 6" />
    </g> })}
    <T x={300} y={520} size={14}>שלם — עיגול ריק בלי מקל · חצי — עיגול ריק עם מקל · רבע — עיגול מלא עם מקל · שמינית — עם דגל</T>
    <T x={300} y={565} size={17} bold>כמה פעימות? מקיפים את המספר הנכון</T>
    {DUR_Q.map((d, i) => { const cx = 470 - (i % 3) * 170, y = 660 + Math.floor(i / 3) * 100; return <g key={i}>
      <Sym x={cx + 50} y={y} dur={d} size={11} />
      <g direction="ltr">{['½', '1', '2', '4'].map((o, k) => <T key={o} x={cx - 70 + k * 28} y={y + 4} size={19} bold>{o}</T>)}</g>
    </g> })}
  </SvgPage>
}

// Page 11 — add up beats, then complete each bar to four beats.
function MathPage({ n }) {
  return <SvgPage label="חשבון תווים">
    <Head n={n} title="חשבון תווים" instruction="כמה פעימות יש בסך הכול? כתבו את התשובה (שמינית = חצי פעימה)" />
    <g direction="ltr">{SUMS.map((list, i) => { const y = 175 + i * 52; let x = 110; return <g key={i}>
      <T x={60} y={y + 4} size={15} anchor="start">{`${i + 1}.`}</T>
      {list.map((d, k) => { const cx = x; x += 70; return <g key={k}>
        <Sym x={cx} y={y} dur={d} size={9} />{k < list.length - 1 && <T x={cx + 38} y={y + 6} size={22} bold>+</T>}</g> })}
      <T x={x + 4} y={y + 6} size={22} bold>=</T>
      <Box x={x + 60} y={y - 18} w={60} h={32} />
    </g> })}</g>
    <T x={300} y={612} size={17} bold>בכל תיבה צריכות להיות 4 פעימות. איזה תו חסר? מקיפים</T>
    {BARS.map(([list], i) => { const y = 680 + i * 50; return <g key={i}>
      <g direction="ltr">
        <line x1={60} x2={310} y1={y} y2={y} stroke="#999" />
        <line x1={60} x2={60} y1={y - 22} y2={y + 14} stroke={INK} strokeWidth="2" /><line x1={310} x2={310} y1={y - 22} y2={y + 14} stroke={INK} strokeWidth="2" />
        {list.map((d, k) => <Sym key={k} x={90 + k * 46} y={y} dur={d} size={8} />)}
        <T x={280} y={y + 8} size={22} bold>?</T>
      </g>
      <T x={460} y={y + 6} size={18} bold>שלם · חצי · רבע</T>
    </g> })}
  </SvgPage>
}

// Page 12 — a first melody: write the names under the notes, then play it. Extra room after each bar line.
const odeX = i => 102 + i * 29 + Math.floor(i / 4) * 10
function MelodyPage({ n }) {
  return <SvgPage label="מנגינה ראשונה">
    <Head n={n} title="מנגינה ראשונה: אודה לשמחה" instruction="כתבו את שם התו מתחת לכל תו, ואז נגנו את המנגינה" />
    <T x={300} y={135} size={13}>לודוויג ואן בטהובן, מתוך הסימפוניה התשיעית (1824)</T>
    {ODE.map((phrase, r) => { const b = 280 + r * 230; return <g key={r}>
      <Staff x1={30} x2={575} bottom={b} gap={14}>
        {phrase.map(([s, d], i) => <Note key={i} x={odeX(i)} s={s} dur={d} bottom={b} gap={14} />)}
        {[4, 8, 12].map(k => <line key={k} x1={odeX(k) - 19} x2={odeX(k) - 19} y1={b} y2={b - 56} stroke={INK} strokeWidth="1.5" />)}
        <line x1={568} x2={568} y1={b} y2={b - 56} stroke={INK} strokeWidth="1.5" /><line x1={574} x2={574} y1={b} y2={b - 56} stroke={INK} strokeWidth="3.5" />
      </Staff>
      <g direction="ltr">{phrase.map((_, i) => <Box key={i} x={odeX(i)} y={b + 34} w={27} h={34} />)}</g>
    </g> })}
    <T x={300} y={640} size={15}>הנקודה ליד התו מאריכה אותו בחצי: רבע עם נקודה = פעימה וחצי.</T>
    <T x={300} y={672} size={15}>רוב התווים בשיר הם רבעים, והתו האחרון בכל שורה הוא חצי.</T>
    <T x={300} y={720} size={16} bold>אין פסנתר בבית? מנגנים בפסנתר של האתר:</T>
    <text x={300} y={748} fontSize="15" textAnchor="middle" fontFamily={FONT} direction="ltr">ugabuga.co.il/music/songs/ode-to-joy</text>
  </SvgPage>
}

// Answers in short rows ("1–4: …") so the whole key fits on one A4 page.
const groups = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, g) =>
  `${g * size + 1}–${Math.min(list.length, g * size + size)}: ${list.slice(g * size, g * size + size).join(', ')}`)

export default function MusicNotesBooklet({ seed }) {
  const odeNames = ODE.map(p => p.map(([s]) => nameOf(s)).join(' '))
  return <>
    <Cover emoji="🎼🎹🎵" title="חוברת לימוד תווים למתחילים" subtitle="15 עמודים: החמשה, מפתח סול, שמות התווים, הפסנתר, משכי התווים ומנגינה ראשונה" pages={PAGES}
      note="החוברת מלמדת לקרוא תווים במפתח סול מההתחלה, צעד אחרי צעד: קודם החמשה והמפתח, אחר כך שבעת השמות, התווים על הקווים וברווחים, הקלידים בפסנתר ומשך כל תו. כדאי לעבוד עמוד או שניים בכל פעם, ולנגן כל תו שכותבים — בפסנתר, בעוגב או בפסנתר של האתר. תווים קוראים משמאל לימין, כמו מספרים. עמוד 5 הוא מפת עזר שאפשר לגזור ולשמור. התשובות בעמוד 14." />
    <StaffIntroPage n={2} />
    <ClefPage n={3} />
    <NamesPage n={4} />
    <MapPage n={5} />
    <NamePage n={6} title="תווים על הקווים" instruction="כתבו בתיבה את שם התו. כל התווים בעמוד יושבים על קו" notes={LINE_NOTES} />
    <NamePage n={7} title="תווים ברווחים ומתחת לחמשה" instruction="כתבו בתיבה את שם התו. הפעם הם ברווחים, ויש גם דו ורה מתחת לחמשה" notes={SPACE_NOTES} />
    <DrawPage n={8} />
    <PianoPage n={9} />
    <LengthsPage n={10} />
    <MathPage n={11} />
    <MelodyPage n={12} />
    <WordSearchPage n={13} seed={seed} he size={9} title="תפזורת המוזיקה" instruction="מוצאים את המילים: מימין לשמאל או מלמעלה למטה"
      words={SEARCH.map(word => ({ word }))} />
    <AnswerKey n={14} sections={[
      { title: 'עמוד 2 — קו או רווח', answers: groups(STAFF_Q.map(placeOf), 3) },
      { title: 'עמוד 4 — התו החסר', answers: groups(SEQS.map(([, a]) => a), 4) },
      { title: 'עמוד 6 — על הקווים', answers: groups(LINE_NOTES.map(nameOf), 4) },
      { title: 'עמוד 7 — ברווחים ומתחת', answers: groups(SPACE_NOTES.map(nameOf), 4) },
      { title: 'עמוד 8 — איפה מציירים', answers: [...new Set(DRAW)].map(name => `${name}: ${placesOfName(name).join(' או ')}`) },
      { title: 'עמוד 9 — הקלידים', answers: ['קלידים 1–8: דו רה מי פה סול לה סי דו', ...groups(PIANO_Q.map(s => `קליד ${s + 1}`), 3)] },
      { title: 'עמוד 10 — פעימות', answers: groups(DUR_Q.map(d => beatsText(BEATS[d])), 3) },
      { title: 'עמוד 11 — חשבון תווים', answers: [...groups(SUMS.map(l => beatsText(l.reduce((t, d) => t + BEATS[d], 0))), 4), `תיבות: ${BARS.map(([, a]) => a).join(', ')}`] },
      { title: 'עמוד 12 — אודה לשמחה', answers: odeNames },
    ]} />
    <Certificate booklet="חוברת לימוד תווים למתחילים" done="למדתי את החמשה ואת מפתח סול, קראתי וציירתי תווים, מצאתי אותם בפסנתר וניגנתי מנגינה ראשונה." cheer="כל הכבוד, מוזיקאי/ת צעיר/ה!" />
  </>
}
