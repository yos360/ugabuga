import { Page, At, FONT } from '../holidays/printKit'
import { WINTER_PRODUCE, WINTER_FRUITS, WINTER_VEGETABLES, produceById } from '../../data/winterProduce'

// Winter fruits & vegetables — original line drawings in a 100×100 box (thick outlines, white
// fills, ready to colour), and the A4 worksheets (600 × 820) built from them.
const L = { fill: 'white', stroke: '#111', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }
const line = { fill: 'none', stroke: '#111', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
const Face = ({ x = 50, y = 58, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <circle cx="-8" cy="0" r="2.6" fill="#111" /><circle cx="8" cy="0" r="2.6" fill="#111" />
  <path d="M-6 7 Q0 13 6 7" {...line} />
</g>
const Leaf = ({ d }) => <g><path d={d} {...L} /></g>

const Orange = () => <g>
  <circle cx="50" cy="56" r="36" {...L} />
  <path d="M50 20 V12" {...line} strokeWidth={3} />
  <Leaf d="M51 15 C 60 4 76 6 80 12 C 72 20 58 20 51 15 Z" />
  {[[30, 40], [70, 44], [28, 74], [72, 76], [52, 86]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.4" fill="#111" />)}
  <Face y={60} />
</g>
const Clementine = () => <g>
  <ellipse cx="50" cy="62" rx="36" ry="28" {...L} />
  <path d="M42 36 Q50 32 58 36" {...line} />
  <path d="M50 34 V24" {...line} strokeWidth={3} />
  <Leaf d="M50 26 C 40 14 24 16 20 22 C 28 30 42 30 50 26 Z" />
  <Leaf d="M51 26 C 60 14 76 16 80 22 C 72 30 58 30 51 26 Z" />
  <Face y={64} />
</g>
const Grapefruit = () => <g>
  <circle cx="50" cy="52" r="40" {...L} />
  <circle cx="50" cy="52" r="33" {...L} strokeWidth={2.5} />
  {Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return <path key={i} d={`M${50 + Math.cos(a) * 5} ${52 + Math.sin(a) * 5} L${50 + Math.cos(a) * 32} ${52 + Math.sin(a) * 32}`} {...line} strokeWidth={2} /> })}
  <circle cx="50" cy="52" r="5" {...L} strokeWidth={2} />
</g>
const Lemon = () => <g>
  <path d="M10 54 C 8 50 12 47 16 46 C 26 22 74 22 84 46 C 88 47 92 50 90 54 C 92 58 88 61 84 62 C 74 86 26 86 16 62 C 12 61 8 58 10 54 Z" {...L} />
  <Leaf d="M58 30 C 64 18 80 16 86 20 C 80 30 66 32 58 30 Z" />
  <Face y={56} />
</g>
const Strawberry = () => <g>
  <path d="M50 94 C 24 80 10 56 18 38 C 26 26 74 26 82 38 C 90 56 76 80 50 94 Z" {...L} />
  <path d="M50 34 L36 20 L46 28 L42 14 L50 26 L58 14 L54 28 L64 20 Z" {...L} strokeWidth={2.5} />
  <path d="M50 22 V10" {...line} strokeWidth={3} />
  {[[30, 46], [70, 46], [26, 60], [74, 60], [36, 76], [64, 76], [50, 84], [40, 48], [60, 48]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="1.6" ry="2.6" fill="#111" />)}
  <Face y={60} />
</g>
const Kiwi = () => <g>
  <ellipse cx="50" cy="52" rx="42" ry="36" {...L} />
  <ellipse cx="50" cy="52" rx="35" ry="29" {...L} strokeWidth={2.5} />
  <ellipse cx="50" cy="52" rx="11" ry="8" {...L} strokeWidth={2} />
  {Array.from({ length: 14 }, (_, i) => { const a = i * Math.PI / 7; return <ellipse key={i} cx={50 + Math.cos(a) * 17} cy={52 + Math.sin(a) * 13} rx="1.4" ry="2.4" fill="#111" transform={`rotate(${a * 180 / Math.PI + 90} ${50 + Math.cos(a) * 17} ${52 + Math.sin(a) * 13})`} /> })}
  {Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6 + .2; return <path key={i} d={`M${50 + Math.cos(a) * 22} ${52 + Math.sin(a) * 17} L${50 + Math.cos(a) * 31} ${52 + Math.sin(a) * 25}`} {...line} strokeWidth={1.3} /> })}
</g>
const Cauliflower = () => <g>
  {[[34, 44, 15], [66, 44, 15], [50, 34, 17], [42, 56, 14], [58, 56, 14]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} {...L} strokeWidth={2.5} />)}
  <path d="M10 46 C 12 76 34 94 50 94 C 40 84 34 70 30 58 C 24 52 16 48 10 46 Z" {...L} />
  <path d="M90 46 C 88 76 66 94 50 94 C 60 84 66 70 70 58 C 76 52 84 48 90 46 Z" {...L} />
  <path d="M38 70 Q50 64 62 70 L56 94 H44 Z" {...L} />
  <path d="M20 54 Q30 70 40 86 M80 54 Q70 70 60 86" {...line} strokeWidth={1.6} />
  <Face y={46} s={.8} />
</g>
const Broccoli = () => <g>
  <path d="M42 94 L45 60 L34 50 M58 94 L55 60 L66 50" {...line} />
  <path d="M42 94 C 44 80 45 66 44 56 H56 C 55 66 56 80 58 94 Z" {...L} />
  {[[28, 42, 16], [72, 42, 16], [50, 28, 19], [38, 54, 13], [62, 54, 13], [50, 50, 12]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} {...L} />)}
  <Face y={76} s={.75} />
</g>
const Cabbage = () => <g>
  <circle cx="50" cy="56" r="38" {...L} />
  <path d="M24 34 C 36 26 64 26 76 34" {...line} />
  <path d="M30 30 C 20 46 22 70 36 88 M70 30 C 80 46 78 70 64 88" {...line} />
  <path d="M14 58 C 16 78 30 92 46 94 M86 58 C 84 78 70 92 54 94" {...line} />
  <Face y={60} />
</g>
const Carrot = () => <g>
  <path d="M48 26 C 44 14 36 6 30 6 C 34 16 40 22 48 28 Z" {...L} strokeWidth={2.5} />
  <path d="M50 26 C 50 12 54 4 58 2 C 58 14 56 20 52 28 Z" {...L} strokeWidth={2.5} />
  <path d="M52 28 C 58 16 68 12 74 12 C 70 22 62 26 54 30 Z" {...L} strokeWidth={2.5} />
  <path d="M30 30 Q50 22 70 30 C 66 54 58 78 52 96 Q50 99 48 96 C 42 78 34 54 30 30 Z" {...L} />
  <path d="M36 58 H44 M56 70 H62 M44 80 H50" {...line} strokeWidth={2} />
  <Face y={42} s={.85} />
</g>
const Beet = () => <g>
  <path d="M44 34 C 40 22 30 10 20 8 C 18 20 30 30 44 36 Z" {...L} strokeWidth={2.5} />
  <path d="M56 34 C 60 22 70 10 80 8 C 82 20 70 30 56 36 Z" {...L} strokeWidth={2.5} />
  <path d="M50 34 V16" {...line} strokeWidth={3} />
  <path d="M50 34 C 74 34 82 50 78 66 C 74 78 62 84 54 86 Q52 96 50 98 Q48 96 46 86 C 38 84 26 78 22 66 C 18 50 26 34 50 34 Z" {...L} />
  <Face y={60} />
</g>
const Peas = () => <g>
  <path d="M8 46 C 20 30 54 26 88 34 C 92 36 92 40 88 42 C 70 66 30 72 12 58 C 6 54 4 50 8 46 Z" {...L} />
  {[[26, 50], [42, 48], [58, 46], [74, 42]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="8.5" {...L} strokeWidth={2.5} /><circle cx={x - 2.6} cy={y - 1} r="1.3" fill="#111" /><circle cx={x + 2.6} cy={y - 1} r="1.3" fill="#111" /><path d={`M${x - 2.4} ${y + 2.6} Q${x} ${y + 4.6} ${x + 2.4} ${y + 2.6}`} {...line} strokeWidth={1.3} /></g>)}
  <path d="M88 36 C 94 28 92 18 84 16" {...line} strokeWidth={3} />
  <path d="M10 60 C 30 74 66 70 86 44" {...line} strokeWidth={2} />
</g>

export const PRODUCE_ART = { orange: Orange, clementine: Clementine, grapefruit: Grapefruit, lemon: Lemon, strawberry: Strawberry, kiwi: Kiwi, cauliflower: Cauliflower, broccoli: Broccoli, cabbage: Cabbage, carrot: Carrot, beet: Beet, peas: Peas }

// A small standalone icon for the web page (word list, online sorting).
export function ProduceIcon({ id, size = 80 }) {
  const C = PRODUCE_ART[id]
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">{C && <C />}</svg>
}

const draw = (id, x, y, size) => { const C = PRODUCE_ART[id]; return <At x={x} y={y} size={size}><C /></At> }
const He = ({ x, y, size = 26, children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight="800" direction="rtl" fill="#111">{children}</text>
const En = ({ x, y, size = 22, fill = '#111', weight = 700, children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} direction="ltr" fill={fill}>{children}</text>
// RTL grid: the first card sits on the right.
const cell = (i, cols, w, h, top, gap = 20) => {
  const col = i % cols, row = Math.floor(i / cols), total = cols * w + (cols - 1) * gap, left = (600 - total) / 2
  return { x: left + (cols - 1 - col) * (w + gap), y: top + row * (h + gap) }
}

// ---------- colouring: three drawings per page, each labelled in Hebrew and English ----------
function ColorPage({ title, ids }) {
  const spots = [[300, 255, 290], [160, 615, 215], [440, 615, 215]]
  return <Page title={title} sub="צבעו, וקראו את השם בעברית ובאנגלית">
    {ids.map((id, i) => { const [x, y, s] = spots[i], p = produceById(id); return <g key={id}>
      {draw(id, x, y, s)}
      <He x={x} y={y + s / 2 + 30} size={28}>{p.he}</He>
      <En x={x} y={y + s / 2 + 58} size={24}>{p.en}</En>
    </g> })}
  </Page>
}

// ---------- matching: Hebrew word — picture — English word ----------
function MatchThree({ title, list, heOrder, enOrder }) {
  const rowY = i => 170 + i * 108
  return <Page title={title} sub="מתחו קו מהמילה בעברית לציור, ומהציור למילה באנגלית">
    {list.map((p, i) => <g key={p.id}>
      {draw(p.id, 300, rowY(i), 88)}
      <circle cx="238" cy={rowY(i)} r="6" fill="#111" /><circle cx="362" cy={rowY(i)} r="6" fill="#111" />
    </g>)}
    {heOrder.map((k, i) => <g key={k}>
      <rect x="420" y={rowY(i) - 28} width="150" height="56" rx="14" fill="white" stroke="#111" strokeWidth="3" />
      <circle cx="404" cy={rowY(i)} r="6" fill="#111" />
      <He x={495} y={rowY(i) + 10} size={list[k].he.length > 6 ? 22 : 28}>{list[k].he}</He>
    </g>)}
    {enOrder.map((k, i) => <g key={k}>
      <rect x="30" y={rowY(i) - 28} width="150" height="56" rx="14" fill="white" stroke="#111" strokeWidth="3" />
      <circle cx="196" cy={rowY(i)} r="6" fill="#111" />
      <En x={105} y={rowY(i) + 9} size={list[k].en.length > 8 ? 20 : 26} weight={800}>{list[k].en}</En>
    </g>)}
  </Page>
}

// ---------- write the word: traced (level 1) or from a word bank (level 2) ----------
function WritePage({ title, list, trace }) {
  return <Page title={title} sub={trace ? 'עברו בעיפרון על המילה באנגלית, ואז כתבו אותה לבד' : 'בחרו מילה מהבנק וכתבו אותה מתחת לציור'}>
    {!trace && <g>
      <rect x="40" y="124" width="520" height="50" rx="14" fill="white" stroke="#111" strokeWidth="2.5" strokeDasharray="7 5" />
      <En x={300} y={157} size={20}>{list.map(p => p.en).slice().sort().join('  ·  ')}</En>
    </g>}
    {list.map((p, i) => {
      const { x, y } = cell(i, 2, 250, 190, trace ? 132 : 192, trace ? 26 : 14)
      return <g key={p.id}>
        <rect x={x} y={y} width="250" height="190" rx="18" fill="white" stroke="#111" strokeWidth="2.5" />
        {draw(p.id, x + 62, y + 70, 92)}
        <He x={x + 180} y={y + 78} size={p.he.length > 6 ? 22 : 28}>{p.he}</He>
        {trace && <En x={x + 125} y={y + 142} size={p.en.length > 8 ? 26 : 32} fill="#b8b8b8" weight={500}>{p.en}</En>}
        <path d={`M${x + 18} ${y + 150} H${x + 232}`} stroke="#888" strokeWidth="1.5" />
        <path d={`M${x + 18} ${y + 176} H${x + 232}`} stroke="#555" strokeWidth="2" />
      </g>
    })}
  </Page>
}

// ---------- sort: circle "fruit" or "vegetable" under each picture ----------
const SORT_ORDER = ['carrot', 'orange', 'broccoli', 'strawberry', 'cabbage', 'lemon', 'kiwi', 'beet', 'clementine', 'cauliflower', 'peas', 'grapefruit']
function SortPage() {
  return <Page title="פרי או ירק? · Fruit or vegetable?" sub="הקיפו בכל ריבוע: פרי או ירק">
    {SORT_ORDER.map((id, i) => {
      const { x, y } = cell(i, 3, 172, 158, 128, 14), p = produceById(id)
      return <g key={id}>
        <rect x={x} y={y} width="172" height="158" rx="16" fill="white" stroke="#111" strokeWidth="2.5" />
        {draw(id, x + 86, y + 50, 78)}
        <He x={x + 86} y={y + 106} size={p.he.length + p.en.length > 14 ? 14 : 18}>{p.he} · {p.en}</He>
        <rect x={x + 92} y={y + 118} width="68" height="30" rx="15" fill="white" stroke="#111" strokeWidth="2" />
        <He x={x + 126} y={y + 139} size={16}>פרי</He>
        <rect x={x + 12} y={y + 118} width="68" height="30" rx="15" fill="white" stroke="#111" strokeWidth="2" />
        <He x={x + 46} y={y + 139} size={16}>ירק</He>
      </g>
    })}
  </Page>
}

// ---------- flashcards: six to a page, cut along the dashed lines ----------
function CardsPage({ title, list }) {
  return <Page title={title} sub="גזרו לאורך הקו המקווקו — תמונה, עברית ואנגלית">
    {list.map((p, i) => {
      const { x, y } = cell(i, 2, 260, 212, 124, 14)
      return <g key={p.id}>
        <rect x={x} y={y} width="260" height="212" rx="10" fill="white" stroke="#111" strokeWidth="2" strokeDasharray="8 6" />
        {draw(p.id, x + 130, y + 80, 120)}
        <He x={x + 130} y={y + 166} size={28}>{p.he}</He>
        <En x={x + 130} y={y + 196} size={24}>{p.en}</En>
      </g>
    })}
  </Page>
}

const ColorCitrus = () => <ColorPage title="הדרים של חורף" ids={['orange', 'clementine', 'lemon']} />
const ColorBerries = () => <ColorPage title="תות, קיווי ואשכולית" ids={['strawberry', 'kiwi', 'grapefruit']} />
const ColorGreens = () => <ColorPage title="ירקות ירוקים ולבנים" ids={['cabbage', 'broccoli', 'cauliflower']} />
const ColorRoots = () => <ColorPage title="גזר, סלק ואפונה" ids={['carrot', 'beet', 'peas']} />
const MatchFruits = () => <MatchThree title="פירות החורף · Winter fruits" list={WINTER_FRUITS} heOrder={[3, 0, 5, 1, 4, 2]} enOrder={[4, 2, 0, 5, 3, 1]} />
const MatchVeg = () => <MatchThree title="ירקות החורף · Winter vegetables" list={WINTER_VEGETABLES} heOrder={[2, 4, 0, 5, 1, 3]} enOrder={[5, 3, 1, 0, 4, 2]} />
const WriteFruits = () => <WritePage title="כתבו באנגלית — פירות" list={WINTER_FRUITS} trace />
const WriteVeg = () => <WritePage title="כתבו באנגלית — ירקות" list={WINTER_VEGETABLES} />
const CardsFruits = () => <CardsPage title="כרטיסיות: פירות · Fruits" list={WINTER_FRUITS} />
const CardsVeg = () => <CardsPage title="כרטיסיות: ירקות · Vegetables" list={WINTER_VEGETABLES} />

export const PRODUCE_COLORING = [
  { id: 'color-citrus', name: 'הדרים: תפוז, קלמנטינה ולימון', age: 'גן', C: ColorCitrus },
  { id: 'color-berries', name: 'תות, קיווי ואשכולית', age: 'גן', C: ColorBerries },
  { id: 'color-greens', name: 'כרוב, ברוקולי וכרובית', age: 'גן', C: ColorGreens },
  { id: 'color-roots', name: 'גזר, סלק ואפונה', age: 'גן', C: ColorRoots },
]
export const PRODUCE_WORKSHEETS = [
  { id: 'match-fruits', name: 'התאמה: פירות עברית–אנגלית', age: 'גן–ב׳', C: MatchFruits },
  { id: 'match-veg', name: 'התאמה: ירקות עברית–אנגלית', age: 'גן–ב׳', C: MatchVeg },
  { id: 'sort', name: 'פרי או ירק? — מיון', age: 'גן', C: SortPage },
  { id: 'write-fruits', name: 'כתבו באנגלית: פירות (עם מעקב)', age: 'א׳–ב׳', C: WriteFruits },
  { id: 'write-veg', name: 'כתבו באנגלית: ירקות (בנק מילים)', age: 'א׳–ג׳', C: WriteVeg },
  { id: 'cards-fruits', name: 'כרטיסיות פירות לגזירה', age: 'למורה', C: CardsFruits },
  { id: 'cards-veg', name: 'כרטיסיות ירקות לגזירה', age: 'למורה', C: CardsVeg },
]
export const PRODUCE_SHEET_COUNT = PRODUCE_COLORING.length + PRODUCE_WORKSHEETS.length
export { WINTER_PRODUCE }
