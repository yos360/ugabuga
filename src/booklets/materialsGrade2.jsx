import { AnswerKey, Certificate, ChoicePage, Cover, Head, Pic, SvgPage, WordSearchPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חומרים וחפצים" — science worksheets for grade 2 (science & technology curriculum, grades 1–2, topic
// "materials"): object vs. material, what things are made of, sorting by material, properties (transparent /
// opaque, hard / soft, flexible / rigid, absorbent / waterproof), floats-or-sinks and magnet experiment sheets
// (prediction vs. result), choosing the right material, natural vs. man-made, Israeli recycling bins, a word
// search, answers and a certificate. Facts were checked: a magnet attracts iron and steel only (not aluminium),
// the purple bin takes glass packaging only, beverage cartons go to the orange bin.
const PAGES = bookletBySlug('materials-grade2').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

// Emoji that have a drawing in /print-art/words; everything else is drawn as a plain emoji.
const ART = new Set(['🪑', '🔑', '🥄', '🪟', '👕', '🧦', '🎈', '📚', '📄', '🥛', '🍼', '🧸', '☂', '✂', '✏', '🚪', '🧣', '💡', '👓', '🧥', '🌳', '🐑', '🏖', '🍌', '🍲', '🍬', '🧃', '📖', '🔵', '🧤'])
const pic = e => ART.has(e.replace(/️/g, '')) ? { art: e } : { emoji: e }

// Page 2: [word, 'חפץ' | 'חומר']
const THING_OR_MATERIAL = [['כיסא', 'חפץ'], ['עץ', 'חומר'], ['מספריים', 'חפץ'], ['מתכת', 'חומר'], ['זכוכית', 'חומר'], ['חלון', 'חפץ'], ['בד', 'חומר'], ['חולצה', 'חפץ']]

// Page 3: [emoji, object, material, two wrong materials that can't be right]
const MADE_OF = [
  ['🪟', 'חלון', 'זכוכית', ['נייר', 'בד']],
  ['🧦', 'גרב', 'בד', ['זכוכית', 'אבן']],
  ['📚', 'ספר', 'נייר', ['מתכת', 'גומי']],
  ['🎈', 'בלון', 'גומי', ['עץ', 'זכוכית']],
  ['✂️', 'להב המספריים', 'מתכת', ['נייר', 'בד']],
  ['🪑', 'כיסא', 'עץ', ['זכוכית', 'נייר']],
  ['🏺', 'כד', 'חרס', ['נייר', 'בד']],
  ['🍼', 'בקבוק תינוק', 'פלסטיק', ['נייר', 'בד']],
]

// Page 4: twelve objects to write into four material boxes.
const SORT_BOXES = [
  { mat: 'עץ', items: [['✏️', 'עיפרון'], ['🪑', 'כיסא'], ['🎻', 'כינור']] },
  { mat: 'מתכת', items: [['🔑', 'מפתח'], ['🔩', 'בורג'], ['🥫', 'קופסת שימורים']] },
  { mat: 'זכוכית', items: [['💡', 'נורה'], ['🫙', 'צנצנת'], ['🪞', 'מראה']] },
  { mat: 'בד', items: [['👕', 'חולצה'], ['🧣', 'צעיף'], ['🧥', 'מעיל']] },
]

// Pages 5–6: [emoji, object, answer]
const SEE_THROUGH = [['🪟', 'חלון', 'שקוף'], ['📚', 'ספר', 'אטום'], ['🫙', 'צנצנת זכוכית', 'שקוף'], ['🚪', 'דלת עץ', 'אטום'], ['👓', 'עדשות משקפיים', 'שקוף'], ['🧱', 'קיר לבנים', 'אטום'], ['💧', 'מים צלולים', 'שקוף'], ['🧸', 'דובי', 'אטום']]
const HARD_SOFT = [['🪨', 'אבן', 'קשה'], ['🧸', 'דובי', 'רך'], ['🔑', 'מפתח', 'קשה'], ['🧽', 'ספוג', 'רך']]
const FLEX_RIGID = [['🎈', 'בלון', 'גמיש'], ['🫙', 'צנצנת זכוכית', 'קשיח'], ['🧣', 'צעיף', 'גמיש'], ['✏️', 'עיפרון', 'קשיח']]

// Pages 7–9 (experiments): [emoji, object, material, expected result]
const ABSORB = [['🧻', 'נייר טואלט', 'נייר', 'סופג'], ['🧦', 'גרב', 'בד', 'סופג'], ['👢', 'מגף גשם', 'גומי', 'אטום'], ['🛍️', 'שקית ניילון', 'פלסטיק', 'אטום'], ['🥄', 'כפית', 'מתכת', 'אטום'], ['🫙', 'צנצנת', 'זכוכית', 'אטום']]
const FLOAT = [['🪵', 'מקל עץ', 'עץ', 'צף'], ['🔩', 'בורג', 'מתכת', 'שוקע'], ['🪨', 'אבן', 'אבן', 'שוקע'], ['🏓', 'כדור פינג־פונג', 'פלסטיק', 'צף'], ['🔵', 'גולה', 'זכוכית', 'שוקע'], ['🔑', 'מפתח', 'מתכת', 'שוקע'], ['🎈', 'בלון מנופח', 'גומי', 'צף']]
const MAGNET = [['🔩', 'בורג', 'ברזל', 'כן'], ['📎', 'אטב משרדי', 'פלדה', 'כן'], ['🧷', 'סיכת ביטחון', 'פלדה', 'כן'], ['🥫', 'קופסת שימורים', 'פלדה', 'כן'], ['🥤', 'פחית שתייה', 'אלומיניום', 'לא'], ['✏️', 'עיפרון', 'עץ', 'לא'], ['🧦', 'גרב', 'בד', 'לא'], ['📄', 'דף', 'נייר', 'לא']]

// Page 10: [emoji, question, options, answer, reason]
const BEST = [
  ['☂️', 'ממה כדאי להכין מטרייה?', ['נייר', 'ניילון'], 'ניילון', 'אטום למים'],
  ['🪟', 'ממה כדאי להכין חלון?', ['עץ', 'זכוכית'], 'זכוכית', 'שקוף'],
  ['🛁', 'ממה כדאי להכין מגבת?', ['בד', 'פלסטיק'], 'בד', 'סופג'],
  ['🍲', 'ממה כדאי להכין סיר לבישול?', ['מתכת', 'פלסטיק'], 'מתכת', 'לא נמס בחום'],
  ['👢', 'ממה כדאי להכין מגפי גשם?', ['בד', 'גומי'], 'גומי', 'אטום למים'],
  ['🥛', 'ממה כדאי להכין כוס לפעוט?', ['זכוכית', 'פלסטיק'], 'פלסטיק', 'לא נשבר'],
]

// Page 11
const NATURAL = [['עץ', 'טבעי'], ['פלסטיק', 'מעשה אדם'], ['אבן', 'טבעי'], ['זכוכית', 'מעשה אדם'], ['צמר', 'טבעי'], ['נייר', 'מעשה אדם'], ['כותנה', 'טבעי'], ['ניילון', 'מעשה אדם']]
const SOURCES = [[['📄', 'נייר'], ['🌳', 'עץ']], [['🫙', 'זכוכית'], ['🏖️', 'חול']], [['🧶', 'סוודר צמר'], ['🐑', 'כבשה']], [['👕', 'חולצת כותנה'], ['🌱', 'צמח הכותנה']]]

// Page 12: Israeli recycling bins. [emoji, item, bin colour]
const BINS = [['כתום', 'אריזות'], ['כחול', 'נייר'], ['סגול', 'זכוכית'], ['ירוק', 'כל השאר']]
const RECYCLE = [
  ['🥫', 'קופסת שימורים', 'כתום'], ['📰', 'עיתון', 'כחול'], ['🫙', 'צנצנת ריבה', 'סגול'], ['🍌', 'קליפת בננה', 'ירוק'],
  ['🧃', 'קרטון שתייה', 'כתום'], ['📖', 'מחברת ישנה', 'כחול'], ['🍾', 'בקבוק זכוכית', 'סגול'], ['🧻', 'מפית משומשת', 'ירוק'],
  ['🍬', 'עטיפת סוכרייה', 'כתום'], ['📄', 'דף ציור', 'כחול'], ['🍲', 'שאריות אוכל', 'ירוק'], ['🧴', 'בקבוק שמפו', 'כתום'],
]

const SEARCH = [['עץ', '🌳'], ['מתכת', '🔩'], ['פלסטיק', '🧴'], ['זכוכית', '🫙'], ['נייר', '📄'], ['גומי', '🎈'], ['אבן', '🪨'], ['מגנט', '🧲']]

const madeOfItems = seed => MADE_OF.map(([e, name, mat, wrong], i) => ({ pic: pic(e), prompt: name, options: rngFor(seed, 300 + i).shuffle([mat, ...wrong]) }))

function IntroPage({ n }) {
  const ex = [['🪑', 'הכיסא עשוי מעץ'], ['🪟', 'החלון עשוי מזכוכית'], ['👕', 'החולצה עשויה מבד']]
  return <SvgPage label="חפץ וחומר">
    <Head n={n} title="חפץ וחומר" instruction="קוראים יחד, ואז מקיפים בכל שורה: חפץ או חומר?" />
    <g fontFamily={FONT} direction="rtl" fill={INK}>
      <rect x="30" y="114" width="540" height="246" rx="16" fill="#f7f7f7" stroke={INK} strokeWidth="2" />
      <text x="550" y="146" fontSize="18" textAnchor="start"><tspan fontWeight="800">חפץ</tspan> הוא דבר שמשתמשים בו: כיסא, חלון, חולצה.</text>
      <text x="550" y="176" fontSize="18" textAnchor="start"><tspan fontWeight="800">חומר</tspan> הוא מה שהחפץ עשוי ממנו: עץ, זכוכית, בד.</text>
      {ex.map(([e, line], i) => { const x = 470 - i * 170; return <g key={line} textAnchor="middle">
        <Pic item={pic(e)} x={x} y={238} size={68} />
        <text x={x} y={298} fontSize="16" fontWeight="700">{line}</text>
      </g> })}
      <text x="550" y="340" fontSize="16" textAnchor="start">מאותו חומר מכינים חפצים שונים: מעץ מכינים כיסא, עיפרון ודלת.</text>
      <path d="M300 395 V700" stroke="#ddd" strokeWidth="2" />
      {THING_OR_MATERIAL.map(([w], i) => { const xr = i % 2 ? 285 : 565, y = 425 + Math.floor(i / 2) * 85; return <g key={w}>
        <text x={xr} y={y} fontSize="24" fontWeight="800" textAnchor="start">{w}</text>
        <text x={xr - 140} y={y} fontSize="20" textAnchor="middle">חפץ</text>
        <text x={xr - 215} y={y} fontSize="20" textAnchor="middle">חומר</text>
      </g> })}
      <text x="565" y="765" fontSize="18" textAnchor="start">בכיתה שלי יש ______________ והוא עשוי מ______________.</text>
    </g>
  </SvgPage>
}

function SortPage({ n, seed }) {
  const all = rngFor(seed, 40).shuffle(SORT_BOXES.flatMap(b => b.items))
  return <SvgPage label="מיון לפי חומר">
    <Head n={n} title="מיון לפי חומר" instruction="כותבים את שם כל חפץ בתיבה של החומר שממנו הוא עשוי" />
    <g fontFamily={FONT} direction="rtl" textAnchor="middle" fill={INK}>
      {all.map(([e, name], i) => { const x = 545 - (i % 6) * 98, y = 160 + Math.floor(i / 6) * 100; return <g key={name}>
        <Pic item={pic(e)} x={x} y={y} size={56} />
        <text x={x} y={y + 46} fontSize="14" fontWeight="700">{name}</text>
      </g> })}
      {SORT_BOXES.map((b, i) => { const x = i % 2 ? 30 : 310, y = 330 + Math.floor(i / 2) * 235; return <g key={b.mat}>
        <rect x={x} y={y} width="260" height="215" rx="14" fill="white" stroke={INK} strokeWidth="2" />
        <text x={x + 130} y={y + 36} fontSize="24" fontWeight="800">{b.mat}</text>
        {[0, 1, 2].map(k => <path key={k} d={`M${x + 20} ${y + 95 + k * 45} H${x + 240}`} stroke="#9aa5b5" strokeWidth="1.5" />)}
      </g> })}
    </g>
  </SvgPage>
}

// Definitions on top, then rows of picture + name + two words to circle. Several sections get a sub-heading.
function PropPage({ n, title, instruction, defs, sections }) {
  const rows = sections.flatMap(sec => [...(sections.length > 1 ? [{ head: sec.head }] : []), ...sec.items.map(it => ({ it, options: sec.options }))])
  const top = 135 + defs.length * 30 + 25, rowH = Math.min(80, (800 - top) / rows.length)
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    <g fontFamily={FONT} direction="rtl" fill={INK}>
      <rect x="30" y="114" width="540" height={defs.length * 30 + 22} rx="14" fill="#f7f7f7" stroke={INK} strokeWidth="1.5" />
      {defs.map(([w, d], i) => <text key={w} x="550" y={142 + i * 30} fontSize="16" textAnchor="start"><tspan fontWeight="800">{w}</tspan> — {d}</text>)}
      {rows.map((r, i) => { const y = top + i * rowH + rowH / 2
        if (r.head) return <text key={r.head} x="565" y={y + 7} fontSize="19" fontWeight="800" textAnchor="start" textDecoration="underline">{r.head}</text>
        const [e, name] = r.it
        return <g key={name + i}>
          <Pic item={pic(e)} x={535} y={y} size={Math.min(56, rowH * 0.75)} />
          <text x="490" y={y + 7} fontSize="21" fontWeight="700" textAnchor="start">{name}</text>
          {r.options.map((o, j) => <text key={o} x={240 - j * 120} y={y + 8} fontSize="22" fontWeight="700" textAnchor="middle">{o}</text>)}
          {i < rows.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
        </g> })}
    </g>
  </SvgPage>
}

// An experiment sheet: what we need and the steps, a table (object | material | prediction | result), and
// a few lines to conclude. Columns run right to left.
function ExperimentPage({ n, title, instruction, steps, options, rows, after }) {
  const top = 135 + steps.length * 26 + 30, headH = 40, rowH = Math.min(64, (690 - top - headH) / rows.length)
  const bottom = top + headH + rows.length * rowH
  const X = [570, 395, 290, 160, 30]
  const heads = ['החפץ', 'ממה הוא עשוי?', 'השערה: מה יקרה?', 'תוצאה: מה קרה?']
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    <g fontFamily={FONT} direction="rtl" fill={INK}>
      <rect x="30" y="112" width="540" height={steps.length * 26 + 18} rx="14" fill="#f7f7f7" stroke={INK} strokeWidth="1.5" />
      {steps.map((s, i) => <text key={s} x="552" y={136 + i * 26} fontSize="15" fontWeight={i ? 400 : 700} textAnchor="start">{s}</text>)}
      <rect x="30" y={top} width="540" height={bottom - top} fill="none" stroke={INK} strokeWidth="2" />
      <rect x="30" y={top} width="540" height={headH} fill="#eee" stroke={INK} strokeWidth="2" />
      {X.slice(1, 4).map(x => <path key={x} d={`M${x} ${top} V${bottom}`} stroke={INK} strokeWidth="1.5" />)}
      {heads.map((h, i) => <text key={h} x={(X[i] + X[i + 1]) / 2} y={top + 26} fontSize="15" fontWeight="800" textAnchor="middle">{h}</text>)}
      {rows.map(([e, name, mat], i) => { const y = top + headH + i * rowH + rowH / 2; return <g key={name}>
        <Pic item={pic(e)} x={548} y={y} size={Math.min(46, rowH * 0.7)} />
        <text x="518" y={y + 6} fontSize="17" fontWeight="700" textAnchor="start">{name}</text>
        <text x={(X[1] + X[2]) / 2} y={y + 6} fontSize="16" textAnchor="middle">{mat}</text>
        {[0, 1].map(col => options.map((o, j) => <text key={`${col}${o}`} x={(col ? 128 : 258) - j * 66} y={y + 6} fontSize="16" fontWeight="700" textAnchor="middle">{o}</text>))}
        {i < rows.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#bbb" />}
      </g> })}
      {after.map((l, i) => <text key={l} x="565" y={bottom + 36 + i * 32} fontSize="16" textAnchor="start">{l}</text>)}
    </g>
  </SvgPage>
}

function BestPage({ n }) {
  const rowH = 105, top = 170
  return <SvgPage label="איזה חומר הכי מתאים?">
    <Head n={n} title="איזה חומר הכי מתאים?" instruction="מקיפים את החומר המתאים וכותבים למה, בעזרת מחסן המילים" />
    <g fontFamily={FONT} direction="rtl" fill={INK}>
      <rect x="30" y="112" width="540" height="40" rx="12" fill="#f7f7f7" stroke={INK} strokeWidth="1.5" />
      <text x="300" y="138" fontSize="17" textAnchor="middle"><tspan fontWeight="800">מחסן מילים:</tspan> שקוף · אטום למים · סופג · לא נשבר · לא נמס בחום</text>
      {BEST.map(([e, q, opts], i) => { const y = top + i * rowH; return <g key={q}>
        <Pic item={pic(e)} x={535} y={y + 48} size={62} />
        <text x="490" y={y + 32} fontSize="20" fontWeight="700" textAnchor="start">{i + 1}. {q}</text>
        {opts.map((o, j) => <text key={o} x={440 - j * 100} y={y + 76} fontSize="22" fontWeight="700" textAnchor="middle">{o}</text>)}
        <text x="265" y={y + 76} fontSize="18" textAnchor="start">כי החומר: ________________</text>
        {i < BEST.length - 1 && <path d={`M30 ${y + rowH - 6} H570`} stroke="#ddd" strokeDasharray="5 6" />}
      </g> })}
    </g>
  </SvgPage>
}

function NaturalPage({ n, seed }) {
  const left = rngFor(seed, 110).shuffle(SOURCES.map(p => p[1]))
  return <SvgPage label="טבעי או מעשה אדם?">
    <Head n={n} title="טבעי או מעשה אדם?" instruction="קוראים, מקיפים ומותחים קווים" />
    <g fontFamily={FONT} direction="rtl" fill={INK}>
      <rect x="30" y="112" width="540" height="76" rx="14" fill="#f7f7f7" stroke={INK} strokeWidth="1.5" />
      <text x="550" y="140" fontSize="16" textAnchor="start"><tspan fontWeight="800">חומר טבעי</tspan> — נמצא בטבע, כמו עץ, אבן וצמר.</text>
      <text x="550" y="172" fontSize="16" textAnchor="start"><tspan fontWeight="800">חומר מעשה אדם</tspan> — אנשים מייצרים אותו, למשל זכוכית מחול ונייר מעץ.</text>
      <text x="565" y="228" fontSize="19" fontWeight="800" textAnchor="start">א. מקיפים: טבעי או מעשה אדם?</text>
      <path d="M300 245 V420" stroke="#ddd" strokeWidth="2" />
      {NATURAL.map(([w], i) => { const xr = i % 2 ? 285 : 565, y = 272 + Math.floor(i / 2) * 46; return <g key={w}>
        <text x={xr} y={y} fontSize="21" fontWeight="800" textAnchor="start">{w}</text>
        <text x={xr - 135} y={y} fontSize="18" textAnchor="middle">טבעי</text>
        <text x={xr - 220} y={y} fontSize="18" textAnchor="middle">מעשה אדם</text>
      </g> })}
      <text x="565" y="468" fontSize="19" fontWeight="800" textAnchor="start">ב. מותחים קו מהחפץ לחומר הטבעי שממנו הכינו אותו</text>
      {SOURCES.map(([[e, name]], i) => { const y = 525 + i * 75; return <g key={name}>
        <Pic item={pic(e)} x={540} y={y} size={56} />
        <text x="500" y={y + 7} fontSize="18" fontWeight="700" textAnchor="start">{name}</text>
        <circle cx="355" cy={y} r="6" fill={INK} />
      </g> })}
      {left.map(([e, name], i) => { const y = 525 + i * 75; return <g key={name}>
        <circle cx="245" cy={y} r="6" fill={INK} />
        <Pic item={pic(e)} x={200} y={y} size={56} />
        <text x="160" y={y + 7} fontSize="18" fontWeight="700" textAnchor="start">{name}</text>
      </g> })}
    </g>
  </SvgPage>
}

function RecyclePage({ n }) {
  return <SvgPage label="ממיינים למיחזור">
    <Head n={n} title="ממיינים למיחזור" instruction="צובעים את הפחים, ואת העיגול שליד כל פריט — בצבע הפח שלו" />
    <g fontFamily={FONT} direction="rtl" fill={INK} textAnchor="middle">
      {BINS.map(([color, what], i) => { const x = 510 - i * 140; return <g key={color}>
        <rect x={x - 54} y="128" width="108" height="14" rx="4" fill="white" stroke={INK} strokeWidth="2" />
        <path d={`M${x - 48} 142 L${x - 40} 252 H${x + 40} L${x + 48} 142 Z`} fill="white" stroke={INK} strokeWidth="2" />
        <text x={x} y="188" fontSize="21" fontWeight="800">{color}</text>
        <text x={x} y="216" fontSize="15">{what}</text>
      </g> })}
      {RECYCLE.map(([e, name], i) => { const x = 510 - (i % 4) * 140, yt = 280 + Math.floor(i / 4) * 170; return <g key={name}>
        <Pic item={pic(e)} x={x} y={yt + 48} size={72} />
        <text x={x} y={yt + 110} fontSize="16" fontWeight="700">{name}</text>
        <circle cx={x} cy={yt + 140} r="14" fill="white" stroke={INK} strokeWidth="2" />
      </g> })}
    </g>
  </SvgPage>
}

const names = (list, answer, a = 1, r = 2) => list.filter(x => x[r] === answer).map(x => x[a]).join(', ')

export default function MaterialsGrade2Booklet({ seed }) {
  const madeOf = madeOfItems(seed)
  return <>
    <Cover emoji="🪑🔑🫙" title="חומרים וחפצים" subtitle="דפי עבודה במדעים לכיתה ב׳ — 15 עמודים: חומרים, תכונות, ניסויים ומיחזור" pages={PAGES}
      note="החוברת בנויה לפי נושא החומרים בתוכנית מדע וטכנולוגיה לכיתות א׳–ב׳. לעמודי הניסויים (7–9) כדאי להכין קערה עם מים, מגנט וכמה חפצים מהבית. קודם משערים ורק אחר כך בודקים — גם השערה שלא התאמתה היא חלק מהמדע." />
    <IntroPage n={2} />
    <ChoicePage n={3} title="ממה זה עשוי?" instruction="מסתכלים בחפץ ומקיפים את החומר שממנו הוא עשוי" items={madeOf} />
    <SortPage n={4} seed={seed} />
    <PropPage n={5} title="שקוף או אטום?" instruction="מקיפים בכל שורה: שקוף או אטום? אפשר לבדוק עם פנס"
      defs={[['שקוף', 'אפשר לראות דרכו מה יש מאחוריו.'], ['אטום', 'אי אפשר לראות דרכו.']]}
      sections={[{ options: ['שקוף', 'אטום'], items: SEE_THROUGH }]} />
    <PropPage n={6} title="קשה או רך? גמיש או קשיח?" instruction="נוגעים, לוחצים ומנסים לכופף — ואז מקיפים"
      defs={[['קשה / רך', 'קשה לא נמעך כשלוחצים עליו, ורך נמעך.'], ['גמיש / קשיח', 'גמיש מתכופף בלי להישבר, וקשיח לא מתכופף בידיים.']]}
      sections={[{ head: 'א. קשה או רך?', options: ['קשה', 'רך'], items: HARD_SOFT }, { head: 'ב. גמיש או קשיח?', options: ['גמיש', 'קשיח'], items: FLEX_RIGID }]} />
    <ExperimentPage n={7} title="ניסוי: סופג או אטום למים?" instruction="משערים, בודקים ומקיפים" options={['סופג', 'אטום']} rows={ABSORB}
      steps={['צריך: צלחת, כוס מים, כפית והחפצים שבטבלה.', '1. מקיפים השערה: האם החפץ יספוג את המים?', '2. מטפטפים כפית מים על החפץ ומחכים דקה.', '3. המים נכנסו לתוכו — סופג. נשארו טיפות למעלה — אטום למים.']}
      after={['חומרים שסופגים מים: ______________________________', 'חומרים אטומים למים: ______________________________', 'למה מגפי גשם עשויים מגומי? __________________________']} />
    <ExperimentPage n={8} title="ניסוי: צף או שוקע?" instruction="משערים, בודקים ומקיפים" options={['צף', 'שוקע']} rows={FLOAT}
      steps={['צריך: קערה גדולה עם מים והחפצים שבטבלה.', '1. לפני כל בדיקה מקיפים השערה: צף או שוקע?', '2. מניחים את החפץ בעדינות על המים.', '3. נשאר למעלה — צף. ירד לתחתית — שוקע. מקיפים את התוצאה.']}
      after={['כמה השערות שלי התאמתו? ______ מתוך 7', 'מה צף? ________________  מה שקע? ________________', 'ידעת? אונייה עשויה מפלדה ובכל זאת צפה — בגלל הצורה החלולה שלה.']} />
    <ExperimentPage n={9} title="ניסוי: מה נמשך למגנט?" instruction="האם המגנט ימשוך את החפץ? משערים, בודקים ומקיפים" options={['כן', 'לא']} rows={MAGNET}
      steps={['צריך: מגנט והחפצים שבטבלה.', '1. מקיפים השערה: האם המגנט ימשוך את החפץ?', '2. מקרבים את המגנט לחפץ.', '3. מקיפים את התוצאה: כן — נמשך, לא — לא נמשך.']}
      after={['המגנט משך חפצים מ______________ ומ______________.', 'האם כל חפץ ממתכת נמשך למגנט? ________', 'ידעת? מגנט מושך ברזל ופלדה, אבל לא אלומיניום ולא נחושת.']} />
    <BestPage n={10} />
    <NaturalPage n={11} seed={seed} />
    <RecyclePage n={12} />
    <WordSearchPage n={13} seed={seed} he size={10} title="תפזורת חומרים" instruction="מוצאים את המילים: מימין לשמאל או מלמעלה למטה" words={SEARCH.map(([word, e]) => ({ word, pic: pic(e) }))} />
    <AnswerKey n={14} sections={[
      { title: 'עמוד 2 — חפץ או חומר', answers: [`חפץ: ${names(THING_OR_MATERIAL, 'חפץ', 0, 1)}`, `חומר: ${names(THING_OR_MATERIAL, 'חומר', 0, 1)}`] },
      { title: 'עמוד 3 — ממה זה עשוי?', answers: MADE_OF.map(([, name, mat]) => `${name} — ${mat}`) },
      { title: 'עמוד 4 — מיון לפי חומר', answers: SORT_BOXES.map(b => `${b.mat}: ${b.items.map(i => i[1]).join(', ')}`) },
      { title: 'עמוד 5 — שקוף או אטום', answers: [`שקוף: ${names(SEE_THROUGH, 'שקוף')}`, `אטום: ${names(SEE_THROUGH, 'אטום')}`] },
      { title: 'עמוד 6 — תכונות', answers: [`קשה: ${names(HARD_SOFT, 'קשה')}`, `רך: ${names(HARD_SOFT, 'רך')}`, `גמיש: ${names(FLEX_RIGID, 'גמיש')}`, `קשיח: ${names(FLEX_RIGID, 'קשיח')}`] },
      { title: 'עמוד 7 — סופג או אטום (בדרך כלל)', answers: [`סופג: ${names(ABSORB, 'סופג', 1, 3)}`, `אטום למים: ${names(ABSORB, 'אטום', 1, 3)}`, 'מגפי גשם מגומי כי גומי אטום למים.'] },
      { title: 'עמוד 8 — צף או שוקע (בדרך כלל)', answers: [`צף: ${names(FLOAT, 'צף', 1, 3)}`, `שוקע: ${names(FLOAT, 'שוקע', 1, 3)}`] },
      { title: 'עמוד 9 — מגנט (בדרך כלל)', answers: [`נמשך: ${names(MAGNET, 'כן', 1, 3)}`, `לא נמשך: ${names(MAGNET, 'לא', 1, 3)}`, 'המגנט משך חפצים מברזל ומפלדה. לא כל מתכת נמשכת: פחית אלומיניום לא נמשכת.'] },
      { title: 'עמוד 10 — איזה חומר מתאים?', answers: BEST.map(([, q, , a, why]) => `${q.replace('ממה כדאי להכין ', '').replace('?', '')} — ${a} (${why})`) },
      { title: 'עמוד 11 — טבעי או מעשה אדם', answers: [`טבעי: ${names(NATURAL, 'טבעי', 0, 1)}`, `מעשה אדם: ${names(NATURAL, 'מעשה אדם', 0, 1)}`, ...SOURCES.map(([[, a], [, b]]) => `${a} ← ${b}`)] },
      { title: 'עמוד 12 — מיחזור', answers: BINS.map(([c]) => `${c}: ${names(RECYCLE, c)}`) },
    ]} />
    <Certificate booklet="חוברת “חומרים וחפצים”" done="הכרתי חומרים ותכונות שלהם, ערכתי ניסויים בצף ושוקע ובמגנט, ומיינתי פסולת למיחזור." cheer="מדען/ית צעיר/ה! 🔬" />
  </>
}
