import { Page, At, S, S3, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'

// Pesach line drawings, each in a 100×100 box (use with <At>).
const L = { ...S, strokeWidth: 3 }
const DOT = { fill: '#111' }

export const Matza = () => <g>
  <path d="M12 14 L30 11 L50 14 L70 11 L88 14 L90 34 L87 50 L90 68 L88 88 L70 90 L50 87 L30 90 L12 88 L10 68 L13 50 L10 34 Z" {...L} />
  {[28, 44, 60, 76].map(y => [20, 29, 38, 47, 56, 65, 74, 82].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" {...DOT} />))}
  <ellipse cx="34" cy="36" rx="5" ry="3" {...L} strokeWidth={2} />
  <ellipse cx="66" cy="68" rx="6" ry="3" {...L} strokeWidth={2} />
</g>

export const Cup = () => <g>
  <path d="M28 88 C 28 79 72 79 72 88 Z" {...L} />
  <rect x="45" y="58" width="10" height="24" rx="3" {...L} />
  <ellipse cx="50" cy="70" rx="8" ry="4" {...L} />
  <path d="M22 10 H78 C 78 40 68 58 50 60 C 32 58 22 40 22 10 Z" {...L} />
  <path d="M24 22 H76" {...L} strokeWidth={2} />
  <path d="M50 29 L58 43 H42 Z M50 47 L58 33 H42 Z" {...L} strokeWidth={2} />
</g>

export const Frog = () => <g>
  <ellipse cx="17" cy="72" rx="11" ry="16" {...L} />
  <ellipse cx="83" cy="72" rx="11" ry="16" {...L} />
  <ellipse cx="30" cy="90" rx="13" ry="6" {...L} />
  <ellipse cx="70" cy="90" rx="13" ry="6" {...L} />
  <ellipse cx="50" cy="62" rx="35" ry="27" {...L} />
  <ellipse cx="50" cy="74" rx="18" ry="11" {...L} strokeWidth={2} />
  <circle cx="31" cy="32" r="13" {...L} /><circle cx="69" cy="32" r="13" {...L} />
  <circle cx="33" cy="33" r="5" {...DOT} /><circle cx="67" cy="33" r="5" {...DOT} />
  <path d="M36 51 Q 50 62 64 51" fill="none" {...L} />
  <circle cx="27" cy="55" r="3" {...L} strokeWidth={2} /><circle cx="73" cy="55" r="3" {...L} strokeWidth={2} />
</g>

export const Egg = () => <g>
  <path d="M50 12 C 72 12 80 50 80 62 C 80 80 66 90 50 90 C 34 90 20 80 20 62 C 20 50 28 12 50 12 Z" {...L} />
  <path d="M34 66 C 36 76 42 80 48 81" fill="none" {...L} strokeWidth={2} />
</g>

export const Bone = () => <g>
  <path d="M28 43 H72 C 72 30 92 28 93 41 C 99 45 99 55 93 59 C 92 72 72 70 72 57 H28 C 28 70 8 72 7 59 C 1 55 1 45 7 41 C 8 28 28 30 28 43 Z" {...L} />
</g>

export const Charoset = () => <g>
  <path d="M60 46 L86 12" {...L} strokeWidth={5} />
  <circle cx="87" cy="11" r="4" {...L} />
  <path d="M14 50 H86 C 86 72 70 88 50 88 C 30 88 14 72 14 50 Z" {...L} />
  <path d="M16 50 C 22 38 78 38 84 50 Z" {...L} />
  {[[30, 46], [40, 43], [50, 45], [60, 42], [70, 46], [45, 48]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" {...DOT} />)}
</g>

export const Lettuce = () => <g>
  <path d="M50 94 C 22 84 8 54 18 30 C 22 20 30 22 32 14 C 38 6 46 12 50 8 C 56 12 62 6 68 14 C 72 22 80 20 84 30 C 92 54 78 84 50 94 Z" {...L} />
  <path d="M50 92 C 49 70 49 40 50 14" fill="none" {...L} />
  <path d="M50 70 L32 56 M50 70 L68 56 M50 50 L32 36 M50 50 L68 36" fill="none" {...L} strokeWidth={2} />
</g>

export const Parsley = () => <g>
  <path d="M50 94 L50 56 M50 70 L32 44 M50 70 L68 44" fill="none" {...L} />
  {[[50, 38], [28, 32], [72, 32]].map(([x, y], i) => <path key={i} d={`M${x} ${y + 14} C ${x - 18} ${y + 12} ${x - 18} ${y - 6} ${x - 6} ${y - 8} C ${x - 4} ${y - 18} ${x + 4} ${y - 18} ${x + 6} ${y - 8} C ${x + 18} ${y - 6} ${x + 18} ${y + 12} ${x} ${y + 14} Z`} {...L} />)}
</g>

export const Root = () => <g>
  <path d="M34 30 C 34 50 44 76 50 94 C 56 76 66 50 66 30 C 58 26 42 26 34 30 Z" {...L} />
  <path d="M44 28 C 38 16 30 12 24 10 M50 27 L50 6 M56 28 C 62 16 70 12 76 10" fill="none" {...L} />
  <path d="M40 46 H48 M52 58 H60 M44 70 H52" fill="none" {...L} strokeWidth={2} />
</g>

export const Haggadah = () => <g>
  <path d="M50 20 C 38 12 20 12 8 16 V84 C 20 80 38 80 50 88 Z" {...L} />
  <path d="M50 20 C 62 12 80 12 92 16 V84 C 80 80 62 80 50 88 Z" {...L} />
  {[32, 44, 56, 68].map(y => <path key={y} d={`M16 ${y} H42 M58 ${y} H84`} {...L} strokeWidth={2} />)}
</g>

// Seder plate, top view: six bowls around a Star of David.
const BOWLS = [
  { a: -60, C: Bone, label: 'זרוע' },
  { a: -120, C: Egg, label: 'ביצה' },
  { a: 180, C: Lettuce, label: 'מרור' },
  { a: 120, C: Parsley, label: 'כרפס' },
  { a: 60, C: Charoset, label: 'חרוסת' },
  { a: 0, C: Root, label: 'חזרת' },
].map(b => ({ ...b, x: 50 + 28 * Math.cos(b.a * Math.PI / 180), y: 50 + 28 * Math.sin(b.a * Math.PI / 180) }))

export const SederPlate = () => <g>
  <circle cx="50" cy="50" r="47" {...L} />
  <circle cx="50" cy="50" r="41" {...L} strokeWidth={2} />
  <path d="M50 41 L58 55 H42 Z M50 59 L58 45 H42 Z" {...L} strokeWidth={2} />
  {BOWLS.map(b => <g key={b.label}>
    <circle cx={b.x} cy={b.y} r="12" {...L} strokeWidth={2.5} />
    <At x={b.x} y={b.y - 3} size={13}><b.C /></At>
  </g>)}
</g>

export const Pyramids = () => <g>
  <circle cx="80" cy="16" r="8" {...L} />
  {[0, 60, 120, 180, 240, 300].map(a => { const r = Math.PI * a / 180; return <path key={a} d={`M${80 + Math.cos(r) * 11} ${16 + Math.sin(r) * 11} L${80 + Math.cos(r) * 15} ${16 + Math.sin(r) * 15}`} {...L} strokeWidth={2} /> })}
  <path d="M26 88 L52 42 L78 88 Z" {...L} />
  {[55, 72].map(y => { const d = (88 - y) * 26 / 46; return <path key={y} d={`M${26 + d} ${y} H${78 - d}`} {...L} strokeWidth={2} /> })}
  <path d="M52 55 V72 M42 72 V88 M62 72 V88" {...L} strokeWidth={2} />
  <path d="M66 88 L82 60 L98 88 Z" {...L} />
  <path d="M74 74 H90" {...L} strokeWidth={2} />
  <path d="M15 88 C 17 70 18 52 20 36 M24 88 C 25 70 25 52 25 36" fill="none" {...L} />
  {[[2, 40], [6, 20], [36, 18], [42, 42]].map(([x, y], i) => <path key={i} d={`M22 34 Q ${(22 + x) / 2} ${Math.min(y, 34) - 12} ${x} ${y} Q ${(22 + x) / 2} ${Math.min(y, 34) - 2} 22 34 Z`} {...L} strokeWidth={2.5} />)}
  <path d="M2 88 H98" {...L} />
</g>

const draw = (C) => (x, y, size) => <At x={x} y={y} size={size}><C /></At>

// ---------- colouring ----------
const PlatePage = () => <BigPage title="קערת הסדר">
  <At x={300} y={440} size={520}><SederPlate /></At>
  {BOWLS.map(b => <text key={b.label} x={300 + (b.x - 50) * 5.2} y={440 + (b.y - 50) * 5.2 + 47} textAnchor="middle" fontFamily={FONT} fontSize="21" fontWeight="800" direction="rtl">{b.label}</text>)}
</BigPage>
const MatzaPage = () => <BigPage title="מצות">
  <g transform="rotate(-6 300 420)"><At x={300} y={420} size={430}><Matza /></At></g>
  <At x={110} y={710} size={130}><Matza /></At><At x={490} y={710} size={130}><Matza /></At>
</BigPage>
const CupPage = () => <BigPage title="כוס אליהו"><At x={300} y={440} size={520}><Cup /></At></BigPage>
const FrogPage = () => <BigPage title="מכת צפרדע">
  <At x={300} y={420} size={460}><Frog /></At>
  <At x={110} y={690} size={130}><Frog /></At><At x={490} y={690} size={130}><Frog /></At>
</BigPage>
const PyramidsPage = () => <BigPage title="במצרים — פירמידות ודקל"><At x={300} y={450} size={540}><Pyramids /></At></BigPage>
const Greeting = () => <GreetingPage lines={['פסח', 'שמח!']}>
  <At x={130} y={650} size={150}><Matza /></At><At x={300} y={650} size={150}><Cup /></At><At x={470} y={650} size={150}><Frog /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountFrogs = () => <CountPage title="כמה צפרדעים?" sub="ספרו את הצפרדעים בכל קופסה וכתבו את המספר" render={draw(Frog)} size={42} />
const MatchSeder = () => <MatchPage title="מה על שולחן הסדר?" items={[Egg, Bone, Matza, Charoset, Cup].map(C => ({ render: draw(C) }))} words={['חרוסת', 'כוס', 'ביצה', 'מצה', 'זרוע']} />
const TracePesach = () => <TraceWordsPage title="מילים של פסח" words={['פסח', 'מצה', 'הגדה', 'סדר', 'אפיקומן', 'חרוסת']} />

const SIMANIM = ['קדש', 'ורחץ', 'כרפס', 'יחץ', 'מגיד', 'רחצה', 'מוציא', 'מצה', 'מרור', 'כורך', 'שולחן עורך', 'צפון', 'ברך', 'הלל', 'נרצה']
const MISSING = [3, 6, 8, 11, 13] // יחץ, מוציא, מרור, צפון, הלל
const BANK = [13, 3, 11, 6, 8]
function SimanimOrder() {
  return <Page title="סימני הסדר" sub="השלימו את הסימנים החסרים — המילים נמצאות למטה">
    {SIMANIM.map((w, i) => {
      const col = i % 3, row = Math.floor(i / 3), x = 390 - col * 185, y = 135 + row * 100, miss = MISSING.includes(i)
      return <g key={w}>
        <rect x={x} y={y} width="170" height="82" rx="16" fill="white" stroke="#111" strokeWidth="3" strokeDasharray={miss ? '8 5' : undefined} />
        <circle cx={x + 150} cy={y + 20} r="14" fill="white" stroke="#111" strokeWidth="2.5" />
        <text x={x + 150} y={y + 26} textAnchor="middle" fontFamily={FONT} fontSize="16" fontWeight="800">{i + 1}</text>
        {miss ? <path d={`M${x + 20} ${y + 62} H${x + 150}`} stroke="#888" strokeWidth="2" />
          : <text x={x + 85} y={y + 60} textAnchor="middle" fontFamily={FONT} fontSize={w.length > 5 ? 25 : 30} fontWeight="800" direction="rtl">{w}</text>}
      </g>
    })}
    <text x="300" y="668" textAnchor="middle" fontFamily={FONT} fontSize="18" fontWeight="700" direction="rtl">מחסן מילים:</text>
    {BANK.map((k, j) => <g key={k}>
      <rect x={484 - j * 106} y="690" width="94" height="50" rx="25" fill="white" stroke="#111" strokeWidth="2.5" />
      <text x={531 - j * 106} y="724" textAnchor="middle" fontFamily={FONT} fontSize="24" fontWeight="800" direction="rtl">{SIMANIM[k]}</text>
    </g>)}
  </Page>
}

export const PESACH_ART = [
  { id: 'seder-plate', name: 'קערת הסדר', C: PlatePage },
  { id: 'matza', name: 'מצות', C: MatzaPage },
  { id: 'cup', name: 'כוס אליהו', C: CupPage },
  { id: 'frog', name: 'מכת צפרדע', C: FrogPage },
  { id: 'pyramids', name: 'פירמידות ודקל', C: PyramidsPage },
  { id: 'greeting', name: 'פסח שמח', C: Greeting },
]
export const PESACH_SHEETS = [
  { id: 'count', name: 'כמה צפרדעים?', age: 'גן', C: CountFrogs },
  { id: 'match', name: 'מה על שולחן הסדר? — התאמה', age: 'גן–א׳', C: MatchSeder },
  { id: 'trace', name: 'מילים של פסח', age: 'גן–א׳', C: TracePesach },
  { id: 'simanim', name: 'סימני הסדר — מה חסר?', age: 'א׳–ג׳', C: SimanimOrder },
]
