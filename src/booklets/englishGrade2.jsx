import { AnswerKey, Shape, rngFor } from './kit'
import { COLOR_HEX, EarlyCertificate, EarlyCover, FONT, INK, Guide, MatchCards, PicSearch, Sheet, TONES, TONE_LIST, Trace, img } from './englishEarlyKit'
import { bookletBySlug } from './registry'

// "חוברת אנגלית לכיתה ב׳" — one step after grade 1 and still before school English (grade 3): ABC order,
// capital and small letters, beginning sounds, short CVC words (cat, pig, sun), the first sight words,
// short phrases ("I like…", "This is a…"), reading colour and number words, numbers 11–20, a page a
// parent reads aloud, and a word search. Every word has a picture from the English word bank's print art.
const PAGES = bookletBySlug('english-grade-2').pages
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const SOUNDS = [['bus', '🚌'], ['sun', '☀️'], ['moon', '🌙'], ['hat', '🎩'], ['key', '🔑'], ['fox', '🦊'], ['lion', '🦁'], ['pig', '🐷'], ['tree', '🌳'], ['rabbit', '🐰'], ['duck', '🦆'], ['girl', '👧']]
const CONSONANTS = 'bdfghlmnprstw' // no c: it sounds like k in key
const CVC = [['cat', '🐱'], ['pig', '🐷'], ['dog', '🐶'], ['sun', '☀️'], ['bed', '🛏️'], ['hen', '🐔'], ['bus', '🚌'], ['fox', '🦊']]
const CVC_MATCH = [['bug', '🐛'], ['map', '🗺️'], ['bag', '🎒'], ['leg', '🦵'], ['cap', '🧢'], ['tub', '🛁'], ['hat', '🎩']]
const SIGHT = ['I', 'a', 'the', 'and', 'is', 'see', 'my', 'like', 'this', 'it']
const BRICKS = [['the', 'red'], ['I', 'blue'], ['is', 'yellow'], ['a', 'green'], ['my', 'orange']]
const I_LIKE = [['I like apples.', '🍎', ['🍌', '🍇']], ['I like cats.', '🐱', ['🐶', '🐟']], ['I like the sun.', '☀️', ['🌙', '☂️']], ['I like cake.', '🎂', ['🍕', '🍦']], ['I like my bike.', '🚲', ['🚗', '🚌']], ['I like my mom.', '👩', ['👶', '👴']]]
const THIS_IS = [['dog', '🐶'], ['ball', '⚽'], ['hat', '🎩'], ['cake', '🎂'], ['car', '🚗'], ['tree', '🌳'], ['key', '🔑'], ['fish', '🐟']]
const READ_COLOR = [[3, 'star', 'yellow'], [2, 'heart', 'red'], [4, 'circle', 'blue'], [1, 'square', 'green'], [5, 'triangle', 'orange'], [2, 'heart', 'pink']]
const NUM_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const LISTEN = [['I see a bus.', '🚌', ['🚗', '🚲']], ['This is my grandma.', '👵', ['👴', '👶']], ['I like ice cream.', '🍦', ['🍕', '🍪']], ['The sun is hot.', '☀️', ['🌙', '❄️']], ['I have two socks.', '🧦', ['👟', '🧢']], ['My dog is happy.', '🐶', ['🐱', '🐟']], ['Good night!', '🌙', ['🌅', '👋']]]
const SEARCH = [['CAT', '🐱'], ['DOG', '🐶'], ['SUN', '☀️'], ['BUS', '🚌'], ['HAT', '🎩'], ['PIG', '🐷'], ['BED', '🛏️'], ['HEN', '🐔'], ['MAP', '🗺️'], ['FOX', '🦊']]

export function englishGrade2Data(seed) {
  const r = rngFor(seed, 2)
  // Four trains of six letters in ABC order, two missing in each: two in capitals, two in small letters.
  const trains = [0, 1, 2, 3].map(i => {
    const start = r.int(0, 20), run = ABC.slice(start, start + 6).split('').map(c => i < 2 ? c : c.toLowerCase())
    const holes = r.shuffle([1, 2, 3, 4, 5]).slice(0, 2).sort()
    return { run, holes }
  })
  const houses = r.shuffle(ABC.split('')).slice(0, 15).sort()
  const sounds = SOUNDS.map(([w]) => r.shuffle([w[0], ...r.shuffle(CONSONANTS.split('').filter(c => c !== w[0])).slice(0, 2)]))
  const bricks = Array.from({ length: 8 }, (_, row) => Array.from({ length: row % 2 ? 4 : 5 }, () => r.int(0, BRICKS.length - 1)))
  const iLike = I_LIKE.map(([, a, other]) => r.shuffle([a, ...other]))
  const bank = r.shuffle(THIS_IS.map(x => x[0]))
  const listen = LISTEN.map(([, a, other]) => r.shuffle([a, ...other]))
  return { trains, houses, sounds, bricks, iLike, bank, listen }
}

function TrainPage({ n, trains }) {
  return <Sheet n={n} tone="sky" title={PAGES[n - 1]} en="Fill in the missing letters" instruction="כותבים בקרונות הריקים את האותיות החסרות לפי סדר ה־ABC">
    {trains.map((tr, i) => { const top = 180 + i * 134, c = TONES[TONE_LIST[i % TONE_LIST.length]]
      return <g key={i} fontFamily={FONT} textAnchor="middle">
        <text x="300" y={top + 6} fontSize="13" fontWeight="700" fill={c.dark} direction="rtl">{i < 2 ? 'אותיות גדולות' : 'אותיות קטנות'}</text>
        <path d={`M44 ${top + 104} H556`} stroke={INK} strokeWidth="2" />
        {Array.from({ length: 26 }, (_, k) => <path key={k} d={`M${50 + k * 20} ${top + 104} v6`} stroke={INK} strokeWidth="2" />)}
        {tr.run.map((ch, k) => { const x = 48 + k * 72, hole = tr.holes.includes(k)
          return <g key={k}>
            {k > 0 && <path d={`M${x - 8} ${top + 72} h8`} stroke={INK} strokeWidth="3" />}
            <rect x={x} y={top + 22} width="64" height="62" rx="8" fill={c.soft} stroke={INK} strokeWidth="2" />
            <rect x={x + 9} y={top + 29} width="46" height="48" rx="6" fill="white" stroke={hole ? c.dark : c.main} strokeWidth={hole ? 2 : 1.2} strokeDasharray={hole ? '5 4' : undefined} />
            {!hole && <text x={x + 32} y={top + 66} fontSize="34" fontWeight="800">{ch}</text>}
            {[16, 48].map(dx => <circle key={dx} cx={x + dx} cy={top + 92} r="9" fill="white" stroke={INK} strokeWidth="2" />)}
          </g> })}
        <g>
          <path d={`M476 ${top + 72} h8`} stroke={INK} strokeWidth="3" />
          <rect x="484" y={top + 14} width="34" height="70" rx="6" fill={c.main} stroke={INK} strokeWidth="2" />
          <rect x="491" y={top + 22} width="20" height="20" rx="3" fill="white" stroke={INK} strokeWidth="1.5" />
          <path d={`M518 ${top + 40} H546 Q556 ${top + 40} 556 ${top + 52} V${top + 84} H518 Z`} fill={c.soft} stroke={INK} strokeWidth="2" />
          <rect x="532" y={top + 20} width="12" height="20" fill={INK} />
          {[[540, top + 10, 6], [550, top - 2, 8]].map(([x, y, rr]) => <circle key={rr} cx={x} cy={y} r={rr} fill="white" stroke="#999" strokeWidth="1.5" />)}
          {[500, 540].map(x => <circle key={x} cx={x} cy={top + 92} r="10" fill="white" stroke={INK} strokeWidth="2" />)}
        </g>
      </g> })}
    <g fontFamily={FONT} textAnchor="middle" fill="#777" direction="ltr">
      <text x="300" y="730" fontSize="12.5" direction="rtl" fill="#555">עזרה: כל ה־ABC</text>
      {ABC.split('').map((ch, k) => <g key={ch}><text x={56 + k * 19} y={752} fontSize="15" fontWeight="700">{ch}</text><text x={56 + k * 19} y={772} fontSize="15">{ch.toLowerCase()}</text></g>)}
    </g>
  </Sheet>
}

// A capital letter on every roof, a window to write its small letter.
function HousesPage({ n, letters }) {
  return <Sheet n={n} tone="peach" title={PAGES[n - 1]} en="Write the small letter" instruction="על הגג יש אות גדולה. כותבים בחלון את האות הקטנה שלה">
    {letters.map((L, i) => { const cx = 96 + (i % 5) * 102, top = 182 + Math.floor(i / 5) * 196, c = TONES[TONE_LIST[i % TONE_LIST.length]]
      return <g key={L} fontFamily={FONT} textAnchor="middle">
        <path d={`M${cx - 48} ${top + 70} L${cx} ${top + 10} L${cx + 48} ${top + 70} Z`} fill={c.main} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <rect x={cx + 18} y={top + 24} width="12" height="24" fill={c.soft} stroke={INK} strokeWidth="1.5" />
        <text x={cx} y={top + 62} fontSize="32" fontWeight="900">{L}</text>
        <rect x={cx - 40} y={top + 70} width="80" height="104" fill={c.soft} stroke={INK} strokeWidth="2" />
        <rect x={cx - 26} y={top + 80} width="52" height="56" rx="6" fill="white" stroke={c.dark} strokeWidth="2" strokeDasharray="5 4" />
        <path d={`M${cx - 26} ${top + 108} H${cx + 26}`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
        <rect x={cx - 9} y={top + 146} width="18" height="28" rx="3" fill={c.main} stroke={INK} strokeWidth="1.5" />
      </g> })}
    {[0, 1, 2].map(row => <path key={row} d={`M44 ${182 + row * 196 + 174} H556`} stroke={TONES.mint.dark} strokeWidth="3" />)}
  </Sheet>
}

function SoundsPage({ n, opts }) {
  return <Sheet n={n} tone="mint" title={PAGES[n - 1]} en="What sound does it start with?" instruction="אומרים את המילה באנגלית ומקיפים את האות שבה היא מתחילה">
    {SOUNDS.map(([w, e], i) => { const x = 390 - (i % 3) * 174, y = 180 + Math.floor(i / 3) * 150, c = TONES[TONE_LIST[i % TONE_LIST.length]]
      return <g key={w} fontFamily={FONT} textAnchor="middle">
        <rect x={x} y={y} width="166" height="140" rx="18" fill={c.soft} stroke={INK} strokeWidth="1.6" />
        <circle cx={x + 83} cy={y + 50} r="40" fill="white" stroke={c.main} strokeWidth="2" />
        {img(e, x + 83, y + 50, 60)}
        {opts[i].map((ch, j) => <g key={ch}>
          <circle cx={x + 35 + j * 48} cy={y + 113} r="19" fill="white" stroke={INK} strokeWidth="1.5" />
          <text x={x + 35 + j * 48} y={y + 122} fontSize="26" fontWeight="800" direction="ltr">{ch}</text>
        </g>)}
      </g> })}
  </Sheet>
}

function CvcPage({ n }) {
  return <Sheet n={n} tone="lilac" title={PAGES[n - 1]} en="Find the middle sound: a, e, i, o, u" instruction="אומרים את המילה לאט. מקיפים את האות שחסרה באמצע וכותבים אותה בריבוע">
    {CVC.map(([w, e], i) => { const x = 306 - (i % 2) * 262, y = 180 + Math.floor(i / 2) * 150, c = TONES[TONE_LIST[(i + 1) % TONE_LIST.length]]
      return <g key={w} fontFamily={FONT} textAnchor="middle">
        <rect x={x} y={y} width="250" height="140" rx="18" fill="white" stroke={INK} strokeWidth="1.6" />
        <rect x={x} y={y} width="96" height="140" rx="18" fill={c.soft} stroke={INK} strokeWidth="1.6" />
        {img(e, x + 48, y + 70, 70)}
        {[0, 1, 2].map(k => <g key={k}>
          <rect x={x + 108 + k * 46} y={y + 18} width="40" height="50" rx="8" fill={k === 1 ? 'white' : c.soft} stroke={k === 1 ? c.dark : INK} strokeWidth={k === 1 ? 2.2 : 1.5} strokeDasharray={k === 1 ? '5 4' : undefined} />
          {k !== 1 && <text x={x + 128 + k * 46} y={y + 55} fontSize="32" fontWeight="800" direction="ltr">{w[k]}</text>}
        </g>)}
        {'aeiou'.split('').map((v, k) => <text key={v} x={x + 120 + k * 28} y={y + 112} fontSize="25" fontWeight="700" direction="ltr" fill={c.dark}>{v}</text>)}
      </g> })}
  </Sheet>
}

function SightTracePage({ n }) {
  return <Sheet n={n} tone="pink" title={PAGES[n - 1]} en="Read, trace and say" instruction="מילים קטנות שרואים בכל ספר. קוראים את המילה בצבע ועוברים עליה בעיפרון">
    {SIGHT.map((w, i) => { const y = 178 + i * 60, c = TONES[TONE_LIST[i % TONE_LIST.length]], base = y + 46
      return <g key={w} fontFamily={FONT} textAnchor="middle">
        <rect x="44" y={y + 6} width="96" height="50" rx="25" fill={c.soft} stroke={INK} strokeWidth="1.5" />
        <text x="92" y={y + 41} fontSize="27" fontWeight="900" direction="ltr" fill={c.dark}>{w}</text>
        <Guide x1={156} x2={556} y={base} h={26} />
        {[220, 350, 480].map(x => <Trace key={x} x={x} y={base} size={36}>{w}</Trace>)}
      </g> })}
  </Sheet>
}

function BricksPage({ n, bricks }) {
  return <Sheet n={n} tone="sun" title={PAGES[n - 1]} en="Color the bricks by the word" instruction="צובעים כל לבנה לפי המילה שעליה (במקרא), ואחר כך סופרים">
    <g fontFamily={FONT} textAnchor="middle">
      <rect x="54" y="172" width="492" height="50" rx="16" fill={TONES.sun.soft} stroke={INK} strokeWidth="1.5" />
      {BRICKS.map(([w, col], i) => <g key={w}>
        <rect x={86 + i * 96} y={184} width="26" height="26" rx="5" fill={COLOR_HEX[col]} stroke={INK} strokeWidth="1.5" />
        <text x={130 + i * 96} y={204} fontSize="20" fontWeight="900" direction="ltr">{w}</text>
      </g>)}
      {[0, 1, 2, 3, 4].map(k => <rect key={k} x={84 + k * 96} y="236" width="48" height="34" fill="white" stroke={INK} strokeWidth="2" />)}
      {bricks.map((row, r) => { const y = 270 + r * 52, odd = r % 2
        return <g key={r}>
          {odd ? <><rect x="60" y={y} width="48" height="52" fill="#f3f4f6" stroke={INK} strokeWidth="2" /><rect x="492" y={y} width="48" height="52" fill="#f3f4f6" stroke={INK} strokeWidth="2" /></> : null}
          {row.map((b, k) => { const x = (odd ? 108 : 60) + k * 96; return <g key={k}>
            <rect x={x} y={y} width="96" height="52" fill="white" stroke={INK} strokeWidth="2" />
            <text x={x + 48} y={y + 35} fontSize="25" fontWeight="800" direction="ltr">{BRICKS[b][0]}</text>
          </g> })}
        </g> })}
      <path d="M44 686 H556" stroke={TONES.mint.dark} strokeWidth="4" />
      <text x="540" y="716" fontSize="14" fontWeight="700" direction="rtl" textAnchor="start">כמה לבנים יש מכל מילה? כותבים על הקו</text>
      {BRICKS.map(([w], i) => <g key={w}><text x={86 + i * 100} y={756} fontSize="21" fontWeight="900" direction="ltr" textAnchor="start">{w}</text>
        <path d={`M${86 + i * 100 + (w.length > 1 ? 32 : 18)} 758 h40`} stroke={INK} strokeWidth="1.5" /></g>)}
    </g>
  </Sheet>
}

function ILikePage({ n, opts }) {
  const t = TONES.peach
  return <Sheet n={n} tone="peach" title={PAGES[n - 1]} en="Read and circle the picture" instruction="קוראים את המשפט (אפשר בעזרת מבוגר) ומקיפים את התמונה המתאימה">
    {I_LIKE.map(([s], i) => { const y = 178 + i * 88, c = TONES[TONE_LIST[i % TONE_LIST.length]]
      return <g key={s} fontFamily={FONT} textAnchor="middle">
        <rect x="44" y={y + 4} width="512" height="80" rx="16" fill={c.soft} stroke={INK} strokeWidth="1.3" />
        <text x="62" y={y + 52} fontSize="25" fontWeight="800" direction="ltr" textAnchor="start">{s}</text>
        {opts[i].map((e, j) => { const x = 330 + j * 88; return <g key={e}>
          <circle cx={x} cy={y + 44} r="34" fill="white" stroke={c.main} strokeWidth="2" />
          {img(e, x, y + 44, 50)}
        </g> })}
      </g> })}
    <g fontFamily={FONT}>
      <rect x="44" y="712" width="512" height="64" rx="16" fill="white" stroke={t.dark} strokeWidth="2" strokeDasharray="7 5" />
      <text x="62" y="752" fontSize="24" fontWeight="800" direction="ltr" fill={t.dark}>And you? I like</text>
      <path d="M250 756 H420" stroke={INK} strokeWidth="1.6" />
      <rect x="436" y="720" width="110" height="48" rx="10" fill={t.soft} stroke={t.main} strokeWidth="1.5" />
      <text x="491" y="749" fontSize="12" textAnchor="middle" direction="rtl" fill="#777">מציירים כאן</text>
    </g>
  </Sheet>
}

function ThisIsPage({ n, bank }) {
  const t = TONES.sky
  return <Sheet n={n} tone="sky" title={PAGES[n - 1]} en="This is a … Write the word." instruction="בוחרים מילה מהמחסן ומשלימים את המשפט שליד כל תמונה">
    <g fontFamily={FONT} textAnchor="middle">
      <rect x="54" y="172" width="492" height="44" rx="22" fill={t.soft} stroke={INK} strokeWidth="1.5" />
      {bank.map((w, i) => <text key={w} x={88 + i * 61} y={202} fontSize="20" fontWeight="800" direction="ltr" fill={t.dark}>{w}</text>)}
      {THIS_IS.map(([w, e], i) => { const x = 306 - (i % 2) * 262, y = 228 + Math.floor(i / 2) * 137, c = TONES[TONE_LIST[(i + 3) % TONE_LIST.length]]
        return <g key={w}>
          <rect x={x} y={y} width="250" height="127" rx="18" fill="white" stroke={INK} strokeWidth="1.6" />
          <circle cx={x + 52} cy={y + 63} r="40" fill={c.soft} stroke={c.main} strokeWidth="2" />
          {img(e, x + 52, y + 63, 60)}
          <text x={x + 104} y={y + 52} fontSize="22" fontWeight="800" direction="ltr" textAnchor="start">This is a</text>
          <path d={`M${x + 104} ${y + 98} H${x + 222}`} stroke={INK} strokeWidth="1.6" />
          <text x={x + 230} y={y + 98} fontSize="22" fontWeight="800" direction="ltr">.</text>
        </g> })}
    </g>
  </Sheet>
}

function ReadColorPage({ n }) {
  return <Sheet n={n} tone="lilac" title={PAGES[n - 1]} en="Read and color" instruction="קוראים כמה צורות לצבוע ובאיזה צבע — וצובעים בדיוק כך">
    {READ_COLOR.map(([k, shape, col], i) => { const y = 180 + i * 99, c = TONES[TONE_LIST[i % TONE_LIST.length]]
      const s = `Color ${NUM_WORDS[k - 1]} ${shape}${k > 1 ? 's' : ''} ${col}.`
      return <g key={i} fontFamily={FONT} textAnchor="middle">
        <rect x="44" y={y + 4} width="512" height="89" rx="18" fill={c.soft} stroke={INK} strokeWidth="1.4" />
        <text x="62" y={y + 32} fontSize="21" fontWeight="800" direction="ltr" textAnchor="start">{s}</text>
        <circle cx="74" cy={y + 66} r="10" fill={COLOR_HEX[col]} stroke={INK} strokeWidth="1.2" />
        <text x="92" y={y + 72} fontSize="15" fontWeight="700" direction="ltr" textAnchor="start" fill="#555">{col}</text>
        <rect x="196" y={y + 42} width="352" height="46" rx="12" fill="white" stroke={c.main} strokeWidth="1.5" />
        {[0, 1, 2, 3, 4].map(j => <Shape key={j} kind={shape} x={232 + j * 70} y={y + 66} s={shape === 'triangle' ? 34 : 30} />)}
      </g> })}
  </Sheet>
}

function ListenPage({ n, rows }) {
  const t = TONES.mint
  return <Sheet n={n} tone="mint" title={PAGES[n - 1]} en="Listen and circle" instruction="מבוגר קורא בקול את המשפט של כל שורה, והילד/ה מקיף/ה את התמונה">
    {rows.map((row, i) => { const y = 178 + i * 76
      return <g key={i} fontFamily={FONT} textAnchor="middle">
        <rect x="44" y={y + 3} width="512" height="70" rx="16" fill={i % 2 ? 'white' : t.soft} stroke={INK} strokeWidth="1.3" />
        <circle cx="526" cy={y + 38} r="19" fill={t.main} stroke={INK} strokeWidth="2" />
        <text x="526" y={y + 46} fontSize="21" fontWeight="900">{i + 1}</text>
        {row.map((e, j) => { const x = 420 - j * 135; return <g key={e}>
          <rect x={x - 48} y={y + 8} width="96" height="60" rx="12" fill="white" stroke={TONES.sun.main} strokeWidth="2" />
          {img(e, x, y + 38, 50)}
        </g> })}
      </g> })}
    <g fontFamily={FONT}>
      <rect x="44" y="714" width="512" height="66" rx="14" fill="white" stroke={t.dark} strokeWidth="1.8" strokeDasharray="6 4" />
      <text x="540" y="734" fontSize="12.5" fontWeight="800" direction="rtl">להורה — קוראים בקול:</text>
      {[[0, 2], [2, 5], [5, 7]].map(([a, b], l) => <text key={a} x="56" y={734 + l * 18} fontSize="12.5" fontWeight="700" direction="ltr" fill={t.dark} style={{ whiteSpace: 'pre' }}>{LISTEN.slice(a, b).map(([s], i) => `${a + i + 1}. ${s}`).join('   ')}</text>)}
    </g>
  </Sheet>
}

const brickCounts = bricks => BRICKS.map(([w], k) => `${w} — ${bricks.flat().filter(b => b === k).length}`)

export default function EnglishGrade2Booklet({ seed }) {
  const d = englishGrade2Data(seed)
  return <>
    <EarlyCover tone="lilac" title="חוברת אנגלית לכיתה ב׳" subtitle={['16 עמודים: צלילים, מילים קצרות,', 'מילים לזכור ומשפטים ראשונים באנגלית']} pages={PAGES} blocks="abc"
      pics={[['🐱', 88, 118, 70], ['🚌', 512, 118, 70], ['☀️', 112, 634, 46], ['🎩', 300, 634, 42], ['🦊', 488, 634, 46]]}
      note={['להורים:', 'קוראים יחד בקול. בעמודים 4 ו־5 אומרים את המילה לאט', 'ומאריכים את הצליל, ובעמוד 13 המבוגר קורא את המשפטים.', 'עמוד אחד ביום מספיק. באתר אפשר לשמוע איך אומרים כל מילה.']} />
    <TrainPage n={2} trains={d.trains} />
    <HousesPage n={3} letters={d.houses} />
    <SoundsPage n={4} opts={d.sounds} />
    <CvcPage n={5} />
    <MatchCards n={6} seed={seed} tone="peach" title={PAGES[5]} en="Read the word. Match it to the picture." instruction="קוראים כל מילה קצרה ומותחים קו לתמונה שלה"
      pairs={CVC_MATCH.map(([w, e]) => [{ art: e }, { text: w }])} />
    <SightTracePage n={7} />
    <BricksPage n={8} bricks={d.bricks} />
    <ILikePage n={9} opts={d.iLike} />
    <ThisIsPage n={10} bank={d.bank} />
    <ReadColorPage n={11} />
    <MatchCards n={12} seed={seed} tone="sky" title={PAGES[11]} en="Match the number to the word" instruction="מותחים קו מכל מספר למילה שלו. רמז: מ־13 עד 19 כולם נגמרים ב־teen"
      pairs={NUM_WORDS.slice(10).map((w, i) => [{ text: String(i + 11) }, { text: w }])} />
    <ListenPage n={13} rows={d.listen} />
    <PicSearch n={14} seed={seed} size={9} tone="pink" title={PAGES[13]} en="Find the words" instruction="מוצאים את המילים בטבלה — משמאל לימין או מלמעלה למטה — ומקיפים"
      words={SEARCH.map(([word, art]) => ({ word, art }))} />
    <AnswerKey n={15} sections={[
      { title: 'עמוד 2 — רכבת ה־ABC', answers: d.trains.map(tr => tr.holes.map(k => tr.run[k]).join(', ')) },
      { title: 'עמוד 3 — אותיות קטנות', answers: [d.houses.slice(0, 8).map(L => `${L}→${L.toLowerCase()}`).join('  '), d.houses.slice(8).map(L => `${L}→${L.toLowerCase()}`).join('  ')] },
      { title: 'עמוד 4 — צליל ראשון', answers: [0, 4, 8].map(k => SOUNDS.slice(k, k + 4).map(([w]) => `${w}: ${w[0]}`).join(' · ')) },
      { title: 'עמוד 5 — האות האמצעית', answers: [CVC.slice(0, 4).map(([w]) => `${w} (${w[1]})`).join(' · '), CVC.slice(4).map(([w]) => `${w} (${w[1]})`).join(' · ')] },
      { title: 'עמוד 6 — מילים קצרות', answers: [CVC_MATCH.map(([w, e]) => `${e} ${w}`).join(' · ')] },
      { title: 'עמוד 8 — חומה של מילים', answers: brickCounts(d.bricks) },
      { title: 'עמוד 9 — I like', answers: I_LIKE.map(([s, e]) => `${s} ${e}`) },
      { title: 'עמוד 10 — This is a', answers: [THIS_IS.map(([w, e]) => `${e} ${w}`).join(' · ')] },
      { title: 'עמוד 12 — מספרים 11 עד 20', answers: [NUM_WORDS.slice(10, 15).map((w, i) => `${i + 11} ${w}`).join(' · '), NUM_WORDS.slice(15).map((w, i) => `${i + 16} ${w}`).join(' · ')] },
      { title: 'עמוד 13 — שומעים ומקיפים', answers: LISTEN.map(([s, e]) => `${s} ${e}`) },
      { title: 'עמוד 14 — תפזורת', answers: [SEARCH.map(s => s[0]).join(', ')] },
    ]} />
    <EarlyCertificate tone="pink" booklet="חוברת האנגלית לכיתה ב׳" done={['שמעתי צלילים, קראתי מילים קצרות ומילים לזכור,', 'והשלמתי משפטים ראשונים באנגלית.']} cheer="Super star! I can read!" />
  </>
}
