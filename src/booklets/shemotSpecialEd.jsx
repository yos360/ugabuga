import { AnswerKey, Certificate, Cover, Head, SvgPage, W, art, buildWordSearch, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "דפי עבודה קלים לספר שמות — חינוך מיוחד" — the story of the book of Exodus, from slavery in Egypt to the
// giving of the Torah at Mount Sinai, told in twelve picture cards with one short sentence each, then easy
// tasks: cut-and-paste sequencing, the ten plagues in order, matching, circling, "who said it?", colouring by
// instruction, a big word search and big words to trace. Few items per page, large pictures, almost no writing.
// Pictures are built from the print-art word bank plus a few simple hand-drawn shapes (fire, bricks, tablets).
const PAGES = bookletBySlug('shemot-special-ed').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'
const SOFT = '#9aa5b5'

// ---------- small drawing helpers (all centred on 0,0 inside a translated group) ----------
const Im = ({ e, x = 0, y = 0, s }) => <image href={art(e)} x={x - s / 2} y={y - s / 2} width={s} height={s} />
const Emo = ({ e, x = 0, y = 0, s }) => <text x={x} y={y + s * 0.33} fontSize={s * 0.85} textAnchor="middle">{e}</text>
const wave = (x, y, w, a) => `M${x - w / 2} ${y} q${w / 8} ${-a} ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`
const Waves = ({ y, w, s, color = '#3b82f6', rows = 2 }) => <g fill="none" stroke={color} strokeWidth={Math.max(2, s * 0.025)} strokeLinecap="round">
  {Array.from({ length: rows }, (_, i) => <path key={i} d={wave(0, y + i * s * 0.1, w, s * 0.05)} />)}
</g>
function Flame({ x, y, h }) {
  const d = k => `M${x} ${y - h * k} C${x + h * 0.7 * k} ${y - h * 0.2 * k} ${x + h * 0.55 * k} ${y + h * 0.6 * k} ${x} ${y + h * 0.6 * k} C${x - h * 0.55 * k} ${y + h * 0.6 * k} ${x - h * 0.7 * k} ${y - h * 0.2 * k} ${x} ${y - h * k} Z`
  return <g><path d={d(1)} fill="#f97316" stroke="#9a3412" strokeWidth="1.5" /><path d={d(0.5)} transform={`translate(0 ${h * 0.25})`} fill="#facc15" /></g>
}
function Drop({ x, y, h, fill = '#dc2626' }) {
  return <path d={`M${x} ${y - h} C${x + h * 0.2} ${y - h * 0.5} ${x + h * 0.6} ${y} ${x + h * 0.6} ${y + h * 0.35} A${h * 0.6} ${h * 0.6} 0 0 1 ${x - h * 0.6} ${y + h * 0.35} C${x - h * 0.6} ${y} ${x - h * 0.2} ${y - h * 0.5} ${x} ${y - h} Z`} fill={fill} stroke="#7f1d1d" strokeWidth="1.5" />
}
function Reed({ x, yb, h }) {
  return <path d={`M${x} ${yb} Q${x - h * 0.15} ${yb - h * 0.5} ${x + 2} ${yb - h} Q${x + h * 0.08} ${yb - h * 0.5} ${x + 6} ${yb} Z`} fill="#86c06c" stroke="#2f6b2f" strokeWidth="1.5" />
}
function Matza({ x, y, w }) {
  const h = w * 0.8
  return <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w * 0.08} fill="#f5deb3" stroke="#9a6b3a" strokeWidth="2" />
    {[0, 1, 2].map(r => [0, 1, 2].map(c => <circle key={`${r}${c}`} cx={x - w * 0.28 + c * w * 0.28} cy={y - h * 0.28 + r * h * 0.28} r={Math.max(1.5, w * 0.035)} fill="#9a6b3a" />))}
  </g>
}
function Tablets({ x, y, h, letters, stroke = 2.5 }) {
  const w = h * 0.5
  const one = cx => `M${cx - w / 2} ${y + h / 2} V${y - h / 2 + w / 2} A${w / 2} ${w / 2} 0 0 1 ${cx + w / 2} ${y - h / 2 + w / 2} V${y + h / 2} Z`
  const cols = [x + w / 2 + 1, x - w / 2 - 1]
  return <g>
    {cols.map(cx => <path key={cx} d={one(cx)} fill="white" stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />)}
    {letters
      ? cols.map((cx, t) => letters.slice(t * 5, t * 5 + 5).map((l, i) => <text key={l} x={cx} y={y - h / 2 + w * 0.5 + 10 + i * (h - w * 0.5) / 5.4} fontSize={h * 0.13} fontWeight="800" textAnchor="middle" fontFamily={FONT}>{l}</text>))
      : cols.map(cx => [0, 1, 2, 3].map(i => <path key={i} d={`M${cx - w * 0.28} ${y - h * 0.05 + i * h * 0.13} H${cx + w * 0.28}`} stroke={INK} strokeWidth="1.5" />))}
  </g>
}
function Bug({ x, y, h }) {
  return <g stroke="#333" strokeWidth="1.2">
    {[-1, 0, 1].map(k => <path key={k} d={`M${x - h * 0.55} ${y + k * h * 0.22} H${x + h * 0.55}`} />)}
    <ellipse cx={x} cy={y} rx={h * 0.3} ry={h * 0.4} fill="#6b7280" />
    <circle cx={x} cy={y - h * 0.45} r={h * 0.17} fill="#374151" />
  </g>
}
function Staff({ x, y1, y2, w }) {
  return <path d={`M${x} ${y2} V${y1} q0 ${-w * 3} ${-w * 3} ${-w * 3}`} fill="none" stroke="#7a4b2a" strokeWidth={w} strokeLinecap="round" />
}
function Bricks({ x, y, s }) {
  const bw = s * 0.17, bh = s * 0.1
  return <g>{[0, 1, 2, 3].map(r => Array.from({ length: 4 - r }, (_, i) => <rect key={`${r}-${i}`} x={x - (4 - r) * bw / 2 + i * bw} y={y - (r + 1) * bh} width={bw} height={bh} fill="#e8b48a" stroke="#7a4b2a" strokeWidth="1.5" />))}</g>
}

// ---------- the picture library ----------
const ICONS = {
  bricks: s => <g><Bricks x={-s * 0.14} y={s * 0.42} s={s} /><Im e="👨" x={s * 0.26} y={s * 0.08} s={s * 0.5} /><rect x={s * 0.08} y={-s * 0.36} width={s * 0.28} height={s * 0.09} fill="#e8b48a" stroke="#7a4b2a" strokeWidth="1.5" /></g>,
  basket: s => <g><Reed x={-s * 0.4} yb={s * 0.36} h={s * 0.6} /><Reed x={-s * 0.32} yb={s * 0.36} h={s * 0.48} /><Reed x={s * 0.36} yb={s * 0.36} h={s * 0.55} /><Im e="👶" y={-s * 0.13} s={s * 0.34} /><Im e="🧺" y={s * 0.1} s={s * 0.5} /><Waves y={s * 0.36} w={s * 0.9} s={s} /></g>,
  miriam: s => <g><Reed x={s * 0.02} yb={s * 0.4} h={s * 0.62} /><Reed x={-s * 0.06} yb={s * 0.4} h={s * 0.5} /><Im e="👧" x={s * 0.25} y={-s * 0.02} s={s * 0.5} /><Im e="🧺" x={-s * 0.27} y={s * 0.2} s={s * 0.3} /><Waves y={s * 0.36} w={s * 0.9} s={s} /></g>,
  princess: s => <g><Im e="👩" x={s * 0.17} y={0} s={s * 0.55} /><Im e="👑" x={s * 0.17} y={-s * 0.33} s={s * 0.22} /><Im e="👶" x={-s * 0.25} y={s * 0.05} s={s * 0.22} /><Im e="🧺" x={-s * 0.25} y={s * 0.2} s={s * 0.32} /><Waves y={s * 0.38} w={s * 0.9} s={s} rows={1} /></g>,
  bush: s => <g><Im e="🌳" y={s * 0.1} s={s * 0.62} /><Flame x={-s * 0.14} y={-s * 0.08} h={s * 0.16} /><Flame x={s * 0.08} y={-s * 0.18} h={s * 0.2} /><Flame x={s * 0.2} y={0} h={s * 0.14} /><Im e="🐑" x={-s * 0.33} y={s * 0.3} s={s * 0.26} /></g>,
  court: s => <g><Im e="👨" x={s * 0.3} y={s * 0.12} s={s * 0.42} /><Im e="👑" x={s * 0.3} y={-s * 0.15} s={s * 0.2} /><Im e="👴" x={-s * 0.05} y={s * 0.12} s={s * 0.4} /><Staff x={s * 0.13} y1={-s * 0.18} y2={s * 0.42} w={s * 0.03} /><Im e="👨" x={-s * 0.33} y={s * 0.14} s={s * 0.36} /></g>,
  plagues: s => <g><Drop x={-s * 0.2} y={-s * 0.15} h={s * 0.18} /><Im e="🐸" x={s * 0.18} y={-s * 0.08} s={s * 0.42} /><Emo e="🦗" x={-s * 0.18} y={s * 0.25} s={s * 0.3} /><Im e="🦁" x={s * 0.22} y={s * 0.28} s={s * 0.3} /></g>,
  exodus: s => <g><Im e="👪" x={s * 0.14} y={0} s={s * 0.6} /><Matza x={-s * 0.28} y={s * 0.22} w={s * 0.28} /><Im e="🐑" x={-s * 0.3} y={-s * 0.15} s={s * 0.28} /></g>,
  sea: s => <g>
    <rect x={-s * 0.08} y={-s * 0.4} width={s * 0.16} height={s * 0.82} fill="#f5e1a4" />
    {[-1, 1].map(k => <g key={k}><rect x={k < 0 ? -s * 0.46 : s * 0.08} y={-s * 0.4} width={s * 0.38} height={s * 0.82} rx={s * 0.05} fill="#93c5fd" stroke="#1d4ed8" strokeWidth="1.5" />
      {[0, 1, 2].map(i => <path key={i} d={wave(k * s * 0.27, -s * 0.22 + i * s * 0.22, s * 0.3, s * 0.04)} fill="none" stroke="#1d4ed8" strokeWidth="1.5" />)}</g>)}
    <Im e="👪" x={0} y={s * 0.2} s={s * 0.3} /><Im e="🐟" x={-s * 0.27} y={-s * 0.08} s={s * 0.16} />
  </g>,
  song: s => <g><Im e="👩" x={s * 0.17} y={s * 0.06} s={s * 0.55} />
    <circle cx={-s * 0.22} cy={s * 0.05} r={s * 0.16} fill="#fde68a" stroke="#92400e" strokeWidth="2" />
    {[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return <circle key={i} cx={-s * 0.22 + Math.cos(a) * s * 0.16} cy={s * 0.05 + Math.sin(a) * s * 0.16} r={s * 0.03} fill="#d1d5db" stroke="#555" strokeWidth="1" /> })}
    <Im e="🎵" x={-s * 0.3} y={-s * 0.3} s={s * 0.2} /><Im e="🎵" x={s * 0.38} y={-s * 0.3} s={s * 0.16} /></g>,
  manna: s => <g><Im e="☀️" x={s * 0.3} y={-s * 0.27} s={s * 0.3} /><path d={`M${-s * 0.46} ${s * 0.32} H${s * 0.46}`} stroke="#a16207" strokeWidth="2" />
    {[[-0.3, 0.2], [-0.12, 0.25], [0.05, 0.18], [0.2, 0.27], [0.35, 0.2], [-0.2, 0.08], [0.12, 0.06], [0.3, 0.06], [-0.38, 0.28], [0, 0.29]].map(([dx, dy], i) => <circle key={i} cx={dx * s} cy={dy * s} r={s * 0.035} fill="white" stroke="#6b7280" strokeWidth="1.3" />)}
    <Im e="🧺" x={-s * 0.22} y={-s * 0.15} s={s * 0.34} /></g>,
  sinai: s => <g><Im e="☁️" x={-s * 0.25} y={-s * 0.32} s={s * 0.26} /><Im e="⛰️" y={s * 0.02} s={s * 0.78} /><Tablets x={s * 0.27} y={s * 0.22} h={s * 0.3} stroke={1.8} /></g>,
  // plagues
  blood: s => <g><Waves y={s * 0.15} w={s * 0.8} s={s} color="#dc2626" rows={3} /><Drop x={0} y={-s * 0.18} h={s * 0.22} /></g>,
  frog: s => <Im e="🐸" s={s * 0.85} />,
  lice: s => <g>{[[-0.25, -0.2], [0.2, -0.22], [0, 0.02], [-0.22, 0.25], [0.24, 0.22]].map(([dx, dy], i) => <Bug key={i} x={dx * s} y={dy * s} h={s * 0.16} />)}</g>,
  arov: s => <g><Im e="🦁" x={s * 0.18} y={-s * 0.08} s={s * 0.52} /><Im e="🐺" x={-s * 0.2} y={s * 0.14} s={s * 0.5} /></g>,
  dever: s => <g><Im e="🐄" x={s * 0.08} y={-s * 0.05} s={s * 0.62} /><Im e="🐫" x={-s * 0.26} y={s * 0.24} s={s * 0.34} /></g>,
  boils: s => <g><Im e="✋" s={s * 0.78} />{[[-0.08, 0.05], [0.1, -0.05], [0.05, 0.16], [-0.12, -0.12], [0.14, 0.1]].map(([dx, dy], i) => <circle key={i} cx={dx * s} cy={dy * s} r={s * 0.035} fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />)}</g>,
  hail: s => <g><Im e="⛈️" y={-s * 0.12} s={s * 0.62} />{[[-0.25, 0.3], [-0.08, 0.36], [0.1, 0.28], [0.28, 0.36], [0, 0.22]].map(([dx, dy], i) => <circle key={i} cx={dx * s} cy={dy * s} r={s * 0.045} fill="#e0f2fe" stroke="#0369a1" strokeWidth="1.5" />)}</g>,
  locust: s => <g><Emo e="🦗" x={s * 0.15} y={-s * 0.15} s={s * 0.42} /><Emo e="🦗" x={-s * 0.2} y={s * 0.15} s={s * 0.36} /><Emo e="🦗" x={s * 0.25} y={s * 0.25} s={s * 0.26} /></g>,
  dark: s => <g><rect x={-s * 0.4} y={-s * 0.36} width={s * 0.8} height={s * 0.72} rx={s * 0.08} fill="#1f2937" stroke={INK} strokeWidth="2" />
    {[[-0.22, -0.18], [0.2, -0.22], [0.05, 0.05], [-0.15, 0.2], [0.25, 0.15]].map(([dx, dy], i) => <circle key={i} cx={dx * s} cy={dy * s} r={s * 0.02} fill="#9ca3af" />)}</g>,
  // characters and words
  moses: s => <g><Im e="👴" x={-s * 0.06} s={s * 0.78} /><Staff x={s * 0.34} y1={-s * 0.22} y2={s * 0.44} w={s * 0.045} /></g>,
  aaron: s => <Im e="👨" s={s * 0.8} />,
  girl: s => <Im e="👧" s={s * 0.8} />,
  pharaoh: s => <g><Im e="👨" y={s * 0.1} s={s * 0.66} /><Im e="👑" y={-s * 0.3} s={s * 0.34} /></g>,
  daughter: s => <g><Im e="👩" y={s * 0.1} s={s * 0.66} /><Im e="👑" y={-s * 0.3} s={s * 0.26} /></g>,
  tevah: s => <Im e="🧺" s={s * 0.85} />,
  matza: s => <Matza x={0} y={0} w={s * 0.62} />,
  tablets: s => <Tablets x={0} y={0} h={s * 0.78} />,
}
const Icon = ({ k, x, y, s }) => <g transform={`translate(${x} ${y})`}>{ICONS[k](s)}</g>
const Img = ({ e, x, y, s }) => <g transform={`translate(${x} ${y})`}><Im e={e} s={s} /></g>
const Badge = ({ x, y, n, r = 18 }) => <g><circle cx={x} cy={y} r={r} fill="white" stroke={INK} strokeWidth="2.5" /><text x={x} y={y + r * 0.42} fontSize={r * 1.15} fontWeight="800" textAnchor="middle" fontFamily={FONT}>{n}</text></g>

// ---------- content ----------
// Twelve scenes of the story, in the order of the book of Exodus (chapters 1–20).
const SCENES = [
  { k: 'bricks', title: 'עבודה קשה במצרים', lines: ['בני ישראל עבדו קשה', 'בחומר ובלבנים בשביל פרעה.'] },
  { k: 'basket', title: 'משה בתיבה', lines: ['אמא של משה שמה אותו', 'בתיבה, בין הקנים ביאור.'] },
  { k: 'miriam', title: 'מרים שומרת', lines: ['מרים, אחות משה,', 'שמרה עליו מרחוק.'] },
  { k: 'princess', title: 'בת פרעה', lines: ['בת פרעה מצאה את התיבה', 'וקראה לתינוק: משה.'] },
  { k: 'bush', title: 'הסנה הבוער', lines: ['משה ראה סנה בוער באש,', 'והסנה לא נשרף.'] },
  { k: 'court', title: 'משה ואהרן אצל פרעה', lines: ['משה ואהרן אמרו לפרעה:', 'שלח את עמי!'] },
  { k: 'plagues', title: 'עשר המכות', lines: ['פרעה לא הסכים,', 'ובאו על מצרים עשר מכות.'] },
  { k: 'exodus', title: 'יציאת מצרים', lines: ['בני ישראל יצאו ממצרים,', 'ואפו מצות בדרך.'] },
  { k: 'sea', title: 'קריעת ים סוף', lines: ['הים נקרע לשניים,', 'ובני ישראל עברו ביבשה.'] },
  { k: 'song', title: 'שירת הים', lines: ['מרים לקחה תוף ביד,', 'והנשים שרו ורקדו.'] },
  { k: 'manna', title: 'המן במדבר', lines: ['במדבר ירד מן כל בוקר.', 'המן היה לבן ומתוק.'] },
  { k: 'sinai', title: 'מתן תורה', lines: ['ליד הר סיני קיבלו', 'בני ישראל את התורה.'] },
]
// Cut-and-paste pages: four scenes each, with the caption printed on the card.
const SEQ = [
  [['bricks', 'עבודה קשה במצרים'], ['basket', 'משה בתיבה ביאור'], ['princess', 'בת פרעה מוצאת את משה'], ['bush', 'הסנה הבוער']],
  [['plagues', 'עשר המכות'], ['exodus', 'יוצאים ממצרים'], ['sea', 'עוברים בים סוף'], ['sinai', 'מקבלים את התורה']],
]
// The ten plagues, in the order of Exodus 7–12. The last one is named only, without a picture.
const PLAGUES = [
  ['blood', 'דם'], ['frog', 'צפרדע'], ['lice', 'כינים'], ['arov', 'ערוב'], ['dever', 'דבר'],
  ['boils', 'שחין'], ['hail', 'ברד'], ['locust', 'ארבה'], ['dark', 'חושך'], [null, 'מכת בכורות'],
]
const PLAGUE_HINT = { blood: 'המים הפכו לדם', frog: 'צפרדעים בכל מקום', lice: 'חרקים קטנים', arov: 'חיות פרא', dever: 'הבהמות חלו', boils: 'פצעים על העור', hail: 'אבנים של קרח', locust: 'חרקים אכלו הכול', dark: 'חושך גדול' }
const MATCH_PLAGUES = ['blood', 'frog', 'arov', 'hail', 'locust', 'dark']

// Circle the right answer. Each option: [label, picture] — picture is an icon key, an emoji (art) or null.
const QUESTIONS = [
  { q: 'במה שמו את משה התינוק?', opts: [['תיבה', 'tevah'], ['מכונית', '🚗'], ['מטוס', '✈️']] },
  { q: 'מי מצאה את משה ביאור?', opts: [['בת פרעה', 'daughter'], ['צפרדע', '🐸'], ['דג', '🐟']] },
  { q: 'מה ראה משה במדבר?', opts: [['סנה בוער', 'bush'], ['קשת', '🌈'], ['שלג', '❄️']] },
  { q: 'איך עברו בני ישראל את הים?', opts: [['ביבשה', 'sea'], ['בספינה', '🚢'], ['באופניים', '🚲']] },
  { q: 'מה אכלו בני ישראל במדבר?', opts: [['מן', 'manna'], ['פיצה', '🍕'], ['גלידה', '🍦']] },
  { q: 'כמה דיברות היו על הלוחות?', opts: [['10', null], ['4', null], ['7', null]] },
]
const questionItems = seed => QUESTIONS.map((x, i) => ({ ...x, answer: x.opts[0][0], opts: rngFor(seed, 40 + i).shuffle(x.opts) }))

// Who said it / who did it.
const WHO = [
  { who: 'משה', k: 'moses', lines: ['ראיתי סנה בוער,', 'והסנה לא נשרף.'] },
  { who: 'אהרן', k: 'aaron', lines: ['הלכתי עם אחי משה', 'לדבר עם פרעה.'] },
  { who: 'מרים', k: 'girl', lines: ['שמרתי על אחי הקטן', 'כשהיה בתיבה ביאור.'] },
  { who: 'פרעה', k: 'pharaoh', lines: ['אני מלך מצרים.', 'לא רציתי לשלח את העם.'] },
  { who: 'בת פרעה', k: 'daughter', lines: ['מצאתי תינוק בתיבה', 'וקראתי לו משה.'] },
]
const SEARCH = [['משה', 'moses'], ['אהרן', 'aaron'], ['מרים', 'girl'], ['פרעה', 'pharaoh'], ['תיבה', 'tevah'], ['סנה', 'bush'], ['מצות', 'matza'], ['תורה', 'tablets']]
const TRACE = [['משה', 'moses'], ['תיבה', 'tevah'], ['סנה', 'bush'], ['תורה', 'tablets']]
const COLOR_KEY = [['השמש', 'צהוב', '#facc15'], ['המים', 'כחול', '#3b82f6'], ['הקנים', 'ירוק', '#22c55e'], ['התיבה', 'חום', '#92400e'], ['פירמידות', 'כתום', '#f97316']]

// ---------- pages ----------
function StoryPage({ n, from }) {
  const cw = 265, ch = 212
  return <SvgPage label={`הסיפור בתמונות ${from ? 2 : 1}`}>
    <Head n={n} title={`הסיפור של ספר שמות (${from ? 'ב' : 'א'})`} instruction="קוראים יחד, מצביעים על התמונה ומספרים מה קורה בה" />
    {SCENES.slice(from, from + 6).map((sc, i) => {
      const x = i % 2 ? 30 : 305, y = 132 + Math.floor(i / 2) * 224
      return <g key={sc.k} fontFamily={FONT} direction="rtl" textAnchor="middle">
        <rect x={x} y={y} width={cw} height={ch} rx="18" fill="white" stroke={INK} strokeWidth="2.5" />
        <rect x={x + 8} y={y + 8} width={cw - 16} height="36" rx="12" fill="#f3f4f6" />
        <text x={x + cw / 2 - 10} y={y + 33} fontSize="19" fontWeight="800">{sc.title}</text>
        <Badge x={x + cw - 26} y={y + 26} n={from + i + 1} r={15} />
        <Icon k={sc.k} x={x + cw / 2} y={y + 102} s={108} />
        {sc.lines.map((l, j) => <text key={j} x={x + cw / 2} y={y + 176 + j * 24} fontSize="17" fontWeight={j ? 400 : 700}>{l}</text>)}
      </g>
    })}
  </SvgPage>
}

function SequencePage({ n, set, seed }) {
  const cards = SEQ[set], bw = 255, bh = 140
  let order = rngFor(seed, 20 + set).shuffle(cards.map((_, i) => i))
  if (order.every((v, i) => v === i)) order = [...order.slice(1), order[0]]
  const pos = i => ({ x: i % 2 ? 30 : 315, row: Math.floor(i / 2) })
  return <SvgPage label={`מסדרים את הסיפור ${set + 1}`}>
    <Head n={n} title={`מסדרים את הסיפור (${set + 1})`} instruction="גוזרים את 4 הכרטיסים ומדביקים אותם לפי הסדר: 1, 2, 3, 4" />
    <g fontFamily={FONT} direction="rtl" textAnchor="middle">
      {cards.map((_, i) => { const { x, row } = pos(i), y = 140 + row * 158; return <g key={`b${i}`}>
        <rect x={x} y={y} width={bw} height={bh} rx="14" fill="#fafafa" stroke={INK} strokeWidth="2.5" />
        <text x={x + bw / 2} y={y + bh / 2 + 8} fontSize="20" fill="#c4c9d2">מדביקים כאן</text>
        <Badge x={x + bw - 6} y={y + 6} n={i + 1} r={20} />
      </g> })}
      <text x={300} y={218} fontSize="26" fontWeight="800">←</text>
      <text x={300} y={376} fontSize="26" fontWeight="800">←</text>
      <path d="M150 283 C150 296 450 282 450 294" fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="5 5" />
      <path d="M30 470 H570" stroke={INK} strokeWidth="1.5" strokeDasharray="9 6" />
      <rect x="180" y="452" width="240" height="34" rx="17" fill="white" stroke={INK} strokeWidth="1.5" />
      <text x={292} y={475} fontSize="16" fontWeight="700">גוזרים את הכרטיסים</text>
      <Img e="✂️" x={395} y={469} s={24} />
      {order.map((ci, i) => { const { x, row } = pos(i), y = 500 + row * 156, [k, cap] = cards[ci]; return <g key={`c${i}`}>
        <rect x={x} y={y} width={bw} height={bh} rx="14" fill="white" stroke={INK} strokeWidth="2" strokeDasharray="8 6" />
        <Icon k={k} x={x + bw / 2} y={y + 58} s={94} />
        <text x={x + bw / 2} y={y + 127} fontSize="18" fontWeight="800">{cap}</text>
      </g> })}
    </g>
  </SvgPage>
}

function PlagueListPage({ n }) {
  const tw = 262, th = 124
  return <SvgPage label="עשר המכות לפי הסדר">
    <Head n={n} title="עשר המכות לפי הסדר" instruction="מצביעים על כל מכה, אומרים את שמה בקול וצובעים את התמונה" />
    {PLAGUES.map(([k, name], i) => {
      const x = i % 2 ? 30 : 308, y = 132 + Math.floor(i / 2) * 132
      return <g key={name} fontFamily={FONT} direction="rtl" textAnchor="middle">
        <rect x={x} y={y} width={tw} height={th} rx="14" fill="white" stroke={INK} strokeWidth="2.2" />
        <Badge x={x + tw - 24} y={y + 24} n={i + 1} r={17} />
        {k ? <>
          <Icon k={k} x={x + tw - 90} y={y + 66} s={92} />
          <text x={x + 66} y={y + 64} fontSize="30" fontWeight="800">{name}</text>
          <text x={x + 66} y={y + 94} fontSize="13">{PLAGUE_HINT[k]}</text>
        </> : <>
          <text x={x + tw / 2 - 14} y={y + 66} fontSize="28" fontWeight="800">{name}</text>
          <text x={x + tw / 2 - 14} y={y + 96} fontSize="14">המכה העשירית והאחרונה</text>
        </>}
      </g>
    })}
  </SvgPage>
}

function MatchPlaguesPage({ n, seed }) {
  const left = rngFor(seed, n).shuffle(MATCH_PLAGUES), step = 106, top = 140
  const nameOf = k => PLAGUES.find(p => p[0] === k)[1]
  return <SvgPage label="מתאימים מכה לתמונה">
    <Head n={n} title="מתאימים מכה לתמונה" instruction="מושכים קו משם המכה אל התמונה שלה" />
    <g fontFamily={FONT} direction="rtl" textAnchor="middle">
      {MATCH_PLAGUES.map((k, i) => { const y = top + i * step; return <g key={`r${k}`}>
        <rect x={405} y={y + 14} width={165} height={70} rx="14" fill="#f3f4f6" stroke={INK} strokeWidth="2" />
        <text x={487} y={y + 61} fontSize="32" fontWeight="800">{nameOf(k)}</text>
        <circle cx={388} cy={y + 49} r="7" fill={INK} />
      </g> })}
      {left.map((k, i) => { const y = top + i * step; return <g key={`l${k}`}>
        <rect x={40} y={y + 4} width={160} height={92} rx="14" fill="white" stroke={INK} strokeWidth="2" />
        <Icon k={k} x={120} y={y + 50} s={84} />
        <circle cx={217} cy={y + 49} r="7" fill={INK} />
      </g> })}
    </g>
  </SvgPage>
}

function CirclePage({ n, seed }) {
  const items = questionItems(seed), rowH = 111, top = 128
  return <SvgPage label="מקיפים את התשובה הנכונה">
    <Head n={n} title="מקיפים את התשובה הנכונה" instruction="שומעים את השאלה ומקיפים את התמונה הנכונה" />
    {items.map((it, i) => { const y = top + i * rowH; return <g key={it.q} fontFamily={FONT} direction="rtl" textAnchor="middle">
      <Badge x={552} y={y + 22} n={i + 1} r={15} />
      <text x={528} y={y + 30} fontSize="21" fontWeight="800" textAnchor="start">{it.q}</text>
      {it.opts.map(([label, pic], j) => { const cx = 465 - j * 170, by = y + 42; return <g key={label}>
        <rect x={cx - 75} y={by} width={150} height={62} rx="31" fill="white" stroke={SOFT} strokeWidth="2" />
        {pic ? <>
          {ICONS[pic] ? <Icon k={pic} x={cx + 42} y={by + 31} s={54} /> : <Img e={pic} x={cx + 42} y={by + 31} s={44} />}
          <text x={cx - 24} y={by + 39} fontSize={label.length > 6 ? 17 : 21} fontWeight="700">{label}</text>
        </> : <text x={cx} y={by + 43} fontSize="32" fontWeight="800">{label}</text>}
      </g> })}
      {i < items.length - 1 && <path d={`M30 ${y + rowH - 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function WhoPage({ n, seed }) {
  const left = rngFor(seed, n).shuffle(WHO), rowH = 128, top = 138
  return <SvgPage label="מי אמר? מי עשה?">
    <Head n={n} title="מי אמר? מי עשה?" instruction="שומעים את המשפט ומושכים קו אל מי שאמר אותו" />
    <g fontFamily={FONT} direction="rtl" textAnchor="middle">
      {WHO.map((w, i) => { const y = top + i * rowH; return <g key={`s${w.who}`}>
        <rect x={290} y={y} width={280} height={100} rx="20" fill="white" stroke={INK} strokeWidth="2" />
        <path d={`M300 ${y + 62} L282 ${y + 74} L300 ${y + 78}`} fill="white" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d={`M301 ${y + 64} V${y + 76}`} stroke="white" strokeWidth="3" />
        {w.lines.map((l, j) => <text key={j} x={430} y={y + 42 + j * 30} fontSize="19" fontWeight={j ? 400 : 700}>{l}</text>)}
        <circle cx={266} cy={y + 50} r="7" fill={INK} />
      </g> })}
      {left.map((w, i) => { const y = top + i * rowH; return <g key={`c${w.who}`}>
        <rect x={30} y={y} width={180} height={100} rx="16" fill="#f9fafb" stroke={INK} strokeWidth="2" />
        <Icon k={w.k} x={160} y={y + 50} s={86} />
        <text x={76} y={y + 58} fontSize="22" fontWeight="800">{w.who}</text>
        <circle cx={228} cy={y + 50} r="7" fill={INK} />
      </g> })}
    </g>
  </SvgPage>
}

// Outline picture of the baby Moses' basket among the reeds of the Nile, coloured by a five-item key.
function ColorPage({ n }) {
  const line = { fill: 'white', stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' }
  const reeds = [[70, 230], [92, 190], [114, 250], [138, 200], [160, 170], [182, 215]]
  return <SvgPage label="צובעים לפי ההוראות">
    <Head n={n} title="צובעים לפי ההוראות: משה ביאור" instruction="צובעים כל חלק בציור בצבע שכתוב ליד העיגול" />
    <g fontFamily={FONT} direction="rtl" textAnchor="start">
      {COLOR_KEY.map(([part, color, hex], i) => { const x = i < 3 ? 395 - i * 185 : 302 - (i - 3) * 185, y = i < 3 ? 130 : 178; return <g key={part}>
        <rect x={x} y={y} width={175} height={40} rx="20" fill="white" stroke={INK} strokeWidth="1.8" />
        <circle cx={x + 153} cy={y + 20} r="12" fill={hex} stroke={INK} strokeWidth="1.5" />
        <text x={x + 136} y={y + 26} fontSize="16" fontWeight="700">{part} — {color}</text>
      </g> })}
    </g>
    <rect x="40" y="232" width="520" height="568" rx="8" fill="white" stroke={INK} strokeWidth="3" />
    <g {...line}>
      <circle cx="475" cy="305" r="38" />
      {Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); return <path key={i} d={`M${475 + c * 48} ${305 + s * 48} L${475 + c * 66} ${305 + s * 66}`} strokeLinecap="round" /> })}
      <path d="M250 500 L320 405 L390 500 Z" />
      <path d="M90 500 L200 345 L310 500 Z" />
      <path d="M200 345 L215 500" fill="none" strokeWidth="1.5" />
      <path d="M40 500 H560" fill="none" />
      <path d={`M40 580 q32.5 -16 65 0 ${'t65 0 '.repeat(7)}V800 H40 Z`} />
      <path d={`M80 690 q30 -12 60 0 t60 0 t60 0 M330 740 q30 -12 60 0 t60 0 t60 0`} fill="none" strokeWidth="2" />
      {reeds.map(([x, h]) => <path key={x} d={`M${x} 640 Q${x - 18} ${640 - h / 2} ${x + 4} ${640 - h} Q${x + 14} ${640 - h / 2} ${x + 12} 640 Z`} />)}
      <path d="M265 600 Q360 690 455 600 Z" />
      <path d="M275 600 Q360 540 445 600" />
      {[310, 340, 370, 400].map(x => { const t = (x - 265) / 190, yb = 600 + 180 * t * (1 - t) - 4; return <path key={x} d={`M${x} 603 Q${x + 6} ${(603 + yb) / 2} ${x} ${yb}`} fill="none" strokeWidth="1.5" /> })}
      <path d="M300 585 Q360 565 420 585" fill="none" strokeWidth="1.5" />
    </g>
  </SvgPage>
}

function TabletsPage({ n }) {
  const letters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י']
  const examples = [['🕯️', 'זכור את יום השבת'], ['👪', 'כבד את אביך ואת אמך'], ['✋', 'לא תגנוב']]
  return <SvgPage label="לוחות הברית">
    <Head n={n} title="לוחות הברית בהר סיני" instruction="צובעים את ההר ואת הלוחות, וסופרים את האותיות" />
    <path d="M40 480 L160 270 L215 310 L300 165 L380 290 L430 245 L560 480 Z" fill="white" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <Img e="☁️" x={440} y={185} s={74} /><Img e="☁️" x={150} y={205} s={60} />
    <Tablets x={300} y={335} h={230} letters={letters} />
    <g fontFamily={FONT} direction="rtl" textAnchor="middle">
      <text x={W / 2} y={515} fontSize="21" fontWeight="800">כמה אותיות יש על הלוחות? מקיפים את המספר:</text>
      {['12', '10', '5'].map((v, i) => <g key={v}><circle cx={400 - i * 100} cy={562} r="30" fill="white" stroke={SOFT} strokeWidth="2.5" /><text x={400 - i * 100} y={574} fontSize="32" fontWeight="800">{v}</text></g>)}
      <rect x="40" y="610" width="520" height="190" rx="18" fill="#f9fafb" stroke={INK} strokeWidth="2" />
      <text x={W / 2} y={643} fontSize="18" fontWeight="800">על הלוחות כתובים עשרת הדיברות. למשל:</text>
      {examples.map(([e, t], i) => <g key={t}>
        <Img e={e} x={500} y={683 + i * 42} s={36} />
        <text x={470} y={691 + i * 42} fontSize="22" fontWeight="700" textAnchor="start">{t}</text>
      </g>)}
    </g>
  </SvgPage>
}

function SearchPage({ n, seed }) {
  const size = 8, { grid, placed } = buildWordSearch(SEARCH.map(w => w[0]), size, seed, true)
  const cell = 54, x0 = (W - cell * size) / 2, y0 = 138
  const words = SEARCH.filter(w => placed.includes(w[0]))
  return <SvgPage label="תפזורת ספר שמות">
    <Head n={n} title="תפזורת ספר שמות" instruction="מוצאים את המילים ומקיפים: מימין לשמאל או מלמעלה למטה" />
    <g fontFamily={FONT} textAnchor="middle">
      <rect x={x0} y={y0} width={cell * size} height={cell * size} rx="10" fill="white" stroke={INK} strokeWidth="2.5" />
      {Array.from({ length: size - 1 }, (_, i) => <g key={i} stroke="#e5e7eb" strokeWidth="1.2">
        <path d={`M${x0 + (i + 1) * cell} ${y0 + 2} V${y0 + cell * size - 2}`} /><path d={`M${x0 + 2} ${y0 + (i + 1) * cell} H${x0 + cell * size - 2}`} />
      </g>)}
      {grid.map((row, r) => row.map((ch, c) => <text key={`${r}-${c}`} x={x0 + (size - 1 - c) * cell + cell / 2} y={y0 + r * cell + cell / 2 + 11} fontSize="31" fontWeight="700">{ch}</text>))}
      {words.map(([word, k], i) => { const x = 505 - (i % 4) * 136, y = 605 + Math.floor(i / 4) * 100; return <g key={word}>
        <rect x={x - 58} y={y} width={116} height={88} rx="14" fill="white" stroke={INK} strokeWidth="1.8" />
        <Icon k={k} x={x} y={y + 32} s={52} />
        <text x={x} y={y + 78} fontSize="21" fontWeight="800" direction="rtl">{word}</text>
      </g> })}
    </g>
  </SvgPage>
}

function TraceWordsPage({ n }) {
  const outline = { fill: 'none', stroke: '#6b7280', strokeDasharray: '4 3', fontWeight: 800, textAnchor: 'middle', fontFamily: FONT, direction: 'rtl' }
  return <SvgPage label="עוקבים אחרי מילים גדולות">
    <Head n={n} title="עוקבים אחרי מילים גדולות" instruction="מעבירים עיפרון על הקווים המקווקווים, מימין לשמאל" />
    {TRACE.map(([word, k], i) => { const y = 132 + i * 168; return <g key={word}>
      <rect x="30" y={y} width="540" height="154" rx="18" fill="white" stroke={INK} strokeWidth="2.2" />
      <rect x="430" y={y + 12} width="128" height="130" rx="14" fill="#f3f4f6" />
      <Icon k={k} x={494} y={y + 77} s={112} />
      <text x={290} y={y + 108} fontSize="84" strokeWidth="2" {...outline}>{word}</text>
      <text x={100} y={y + 96} fontSize="50" strokeWidth="1.5" {...outline}>{word}</text>
    </g> })}
  </SvgPage>
}

export default function ShemotSpecialEdBooklet({ seed }) {
  const questions = questionItems(seed)
  const { placed } = buildWordSearch(SEARCH.map(w => w[0]), 8, seed, true)
  return <>
    <Cover emoji="🧺🌊⛰️" title="דפי עבודה קלים לספר שמות" subtitle="15 עמודים: מהתיבה ביאור ועד הר סיני — תמונות גדולות ומשימות קצרות" pages={PAGES}
      note="החוברת מותאמת לחינוך מיוחד ולילדים צעירים: מעט משימות בכל עמוד, תמונות גדולות וכמעט בלי כתיבה. קוראים בקול את עמודי הסיפור (2–3) לפני המשימות. בעמודים 4–5 גוזרים ומדביקים — אפשר להכין מראש מספריים ודבק." />
    <StoryPage n={2} from={0} />
    <StoryPage n={3} from={6} />
    <SequencePage n={4} set={0} seed={seed} />
    <SequencePage n={5} set={1} seed={seed} />
    <PlagueListPage n={6} />
    <MatchPlaguesPage n={7} seed={seed} />
    <CirclePage n={8} seed={seed} />
    <WhoPage n={9} seed={seed} />
    <ColorPage n={10} />
    <TabletsPage n={11} />
    <SearchPage n={12} seed={seed} />
    <TraceWordsPage n={13} />
    <AnswerKey n={14} sections={[
      { title: 'עמוד 4 — הסדר הנכון', answers: SEQ[0].map(c => c[1]) },
      { title: 'עמוד 5 — הסדר הנכון', answers: SEQ[1].map(c => c[1]) },
      { title: 'עמוד 6 — עשר המכות', answers: PLAGUES.map(p => p[1]) },
      { title: 'עמוד 7 — מכה ותמונה', answers: MATCH_PLAGUES.map(k => `${PLAGUES.find(p => p[0] === k)[1]} — ${PLAGUE_HINT[k]}`) },
      { title: 'עמוד 8 — מקיפים', answers: questions.map(q => q.answer) },
      { title: 'עמוד 9 — מי אמר?', answers: WHO.map(w => `${w.lines.join(' ')} — ${w.who}`) },
      { title: 'עמוד 11 — כמה אותיות?', answers: ['10 אותיות: א עד י, כמו עשרת הדיברות'] },
      { title: 'עמוד 12 — תפזורת', answers: SEARCH.filter(w => placed.includes(w[0])).map(w => w[0]) },
    ]} />
    <Certificate booklet="דפי העבודה לספר שמות" done="הכרתי את הסיפור של ספר שמות: מהתיבה ביאור, דרך ים סוף ועד הר סיני." cheer="כל הכבוד! עברת את כל המסע ⭐" />
  </>
}
