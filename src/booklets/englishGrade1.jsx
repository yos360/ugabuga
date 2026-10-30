import { AnswerKey, rngFor } from './kit'
import { COLOR_HEX, EarlyCertificate, EarlyCover, FONT, INK, Hi, MatchCards, Mini, PicSearch, Sheet, Star, TONES, TONE_LIST, Trace, img } from './englishEarlyKit'
import { bookletBySlug } from './registry'

// "חוברת אנגלית לכיתה א׳" — playful pre-reading English before school English starts (grade 3 in Israel):
// greetings, a picture ABC to trace, finding letters, dot-to-dot A–Z, colours, numbers 1–10, animals
// (a parent reads, the child circles), family, fruit and a picture word search. Every English word comes
// with a picture, so the child can work from listening and looking, without reading the instructions.
const PAGES = bookletBySlug('english-grade-1').pages
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const GREET = [['👋', 'Hello!', 'שלום'], ['🌅', 'Good morning!', 'בוקר טוב'], ['🙏', 'Thank you!', 'תודה'], ['🌙', 'Good night!', 'לילה טוב']]
const ALPHABET = [
  ['apple', '🍎'], ['ball', '⚽'], ['cat', '🐱'], ['dog', '🐶'], ['egg', '🥚'], ['fish', '🐟'], ['grapes', '🍇'], ['hat', '🎩'], ['ice cream', '🍦'],
  ['juice', '🧃'], ['key', '🔑'], ['lion', '🦁'], ['monkey', '🐵'], ['nose', '👃'], ['orange', '🍊'], ['pig', '🐷'], ['queen', '👑'], ['rabbit', '🐰'],
  ['sun', '☀️'], ['tree', '🌳'], ['umbrella', '☂️'], ['vase', { mini: 'vase' }], ['watermelon', '🍉'], ['fox', '🦊'], ['yo-yo', { mini: 'yoyo' }], ['zebra', '🦓'],
].map(([word, pic], i) => ({ L: ABC[i], word, pic: typeof pic === 'string' ? { art: pic } : pic }))
const FIND = ['A', 'B', 'M', 'S', 'T', 'D']
const RAINBOW = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
const BALLOONS = ['pink', 'blue', 'orange', 'green', 'purple', 'red']
const WHAT_COLOR = [['🍎', 'red', 'אדום'], ['🍌', 'yellow', 'צהוב'], ['🐸', 'green', 'ירוק'], ['🍊', 'orange', 'כתום'], ['🍇', 'purple', 'סגול'], ['🐻', 'brown', 'חום'], ['💧', 'blue', 'כחול']]
const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const HOW_MANY = [['🍎', 3], ['⭐', 5], ['🐟', 2], ['🎈', 4], ['🌻', 6], ['🐤', 7]]
const ANIMALS = [['cat', '🐱', 'חתול'], ['dog', '🐶', 'כלב'], ['duck', '🦆', 'ברווז'], ['pig', '🐷', 'חזיר'], ['lion', '🦁', 'אריה'], ['fish', '🐟', 'דג'], ['bear', '🐻', 'דוב'],
  ['cow', '🐄', 'פרה'], ['frog', '🐸', 'צפרדע'], ['horse', '🐴', 'סוס'], ['sheep', '🐑', 'כבשה'], ['monkey', '🐵', 'קוף'], ['rabbit', '🐰', 'ארנב'], ['elephant', '🐘', 'פיל']]
const LISTEN = ['cat', 'duck', 'pig', 'lion', 'fish', 'bear']
const FAMILY = [['mom', '👩'], ['dad', '👨'], ['baby', '👶'], ['sister', '👧'], ['brother', '👦'], ['grandma', '👵'], ['grandpa', '👴'], ['family', '👪']]
const FRUITS = [['apple', '🍎', 'תפוח'], ['banana', '🍌', 'בננה'], ['grapes', '🍇', 'ענבים'], ['strawberry', '🍓', 'תות'], ['watermelon', '🍉', 'אבטיח'], ['cherry', '🍒', 'דובדבן'], ['lemon', '🍋', 'לימון']]
const SEARCH = [['CAT', '🐱'], ['DOG', '🐶'], ['PIG', '🐷'], ['COW', '🐄'], ['SUN', '☀️'], ['BUS', '🚌'], ['EGG', '🥚'], ['FOX', '🦊']]
const numWord = k => NUMBERS[k - 1]

export function englishGrade1Data(seed) {
  const r = rngFor(seed, 1)
  // Each row: the target letter three times (capital or small) among six other letters.
  const pool = 'BCDEFGHJKMNPRSTUVWXYZA'.split('')
  const find = FIND.map(L => {
    const others = r.shuffle(pool.filter(c => c !== L)).slice(0, 6).map(c => r.chance(0.5) ? c : c.toLowerCase())
    const items = r.shuffle([L, L.toLowerCase(), r.chance(0.5) ? L : L.toLowerCase(), ...others])
    return { L, items, at: items.flatMap((c, i) => c.toUpperCase() === L ? [i + 1] : []) }
  })
  const colorOpts = WHAT_COLOR.map(([, c]) => r.shuffle([c, ...r.shuffle([...WHAT_COLOR.map(x => x[1]), 'pink'].filter(x => x !== c)).slice(0, 2)]))
  const howMany = HOW_MANY.map(([, k]) => r.shuffle([k, ...r.shuffle([k - 2, k - 1, k + 1, k + 2].filter(x => x >= 1 && x <= 10)).slice(0, 2)]))
  const listen = LISTEN.map(en => r.shuffle([en, ...r.shuffle(ANIMALS.map(a => a[0]).filter(a => a !== en)).slice(0, 2)]))
  return { find, colorOpts, howMany, listen }
}

function HelloPage({ n }) {
  const t = TONES.sky
  return <Sheet n={n} tone="sky" title={PAGES[n - 1]} en="Say it and trace it" instruction="אומרים בקול כל ברכה ועוברים עליה בעיפרון">
    {GREET.map(([e, en, he], i) => {
      const cx = i % 2 ? 170 : 430, top = 180 + Math.floor(i / 2) * 202
      return <g key={en} fontFamily={FONT} textAnchor="middle">
        <circle cx={cx} cy={top + 44} r="42" fill={t.soft} stroke={t.main} strokeWidth="2.5" />
        {img(e, cx, top + 44, 60)}
        <rect x={cx - 124} y={top + 100} width="248" height="68" rx="18" fill="white" stroke={INK} strokeWidth="2" />
        <path d={`M${cx - 13} ${top + 101} L${cx} ${top + 86} L${cx + 13} ${top + 101}`} fill="white" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d={`M${cx - 11} ${top + 101} H${cx + 11}`} stroke="white" strokeWidth="3" />
        <Trace x={cx} y={top + 147} size={en.length > 8 ? 29 : 38}>{en}</Trace>
        <text x={cx} y={top + 190} fontSize="14" fill="#555" direction="rtl">{he}</text>
      </g>
    })}
    <g fontFamily={FONT}>
      <rect x="44" y="590" width="512" height="184" rx="20" fill={t.soft} stroke={INK} strokeWidth="2" />
      <rect x="408" y="604" width="134" height="156" rx="14" fill="white" stroke={t.main} strokeWidth="2.5" strokeDasharray="8 6" />
      <text x="475" y="688" fontSize="13" textAnchor="middle" direction="rtl" fill="#777">מציירים את עצמי</text>
      <text x="62" y="640" fontSize="25" fontWeight="800" direction="ltr" fill={t.dark}>Hello! My name is</text>
      <path d="M62 690 H390" stroke={INK} strokeWidth="1.6" />
      <text x="390" y="712" fontSize="12" direction="rtl" fill="#555">כותבים את השם על הקו (אפשר בעברית) ומקיפים את הגיל</text>
      <text x="62" y="752" fontSize="22" fontWeight="800" direction="ltr" fill={t.dark}>I am</text>
      {[5, 6, 7].map((k, i) => <g key={k}><circle cx={142 + i * 44} cy={743} r="17" fill="white" stroke={INK} strokeWidth="1.5" /><text x={142 + i * 44} y={752} fontSize="22" fontWeight="800" textAnchor="middle">{k}</text></g>)}
      <text x="268" y="752" fontSize="22" fontWeight="800" direction="ltr" fill={t.dark}>years old.</text>
    </g>
  </Sheet>
}

// 13 picture tiles: the letter pair to trace, a picture and its word with the letter in colour.
function AlphabetPage({ n, from, tone }) {
  const letters = ALPHABET.slice(from, from + 13)
  return <Sheet n={n} tone={tone} title={PAGES[n - 1]} en="Trace the big and the small letter. Say the word." instruction="עוברים בעיפרון על האות הגדולה והקטנה, ואומרים את המילה">
    {letters.map((a, i) => {
      const c = TONES[TONE_LIST[(i + from) % TONE_LIST.length]], x = 44 + (i % 3) * 174, y = 178 + Math.floor(i / 3) * 120
      const at = a.word.toUpperCase().indexOf(a.L)
      return <g key={a.L} fontFamily={FONT} textAnchor="middle">
        <rect x={x} y={y} width="164" height="112" rx="16" fill={c.soft} stroke={INK} strokeWidth="1.8" />
        <rect x={x + 8} y={y + 8} width="82" height="96" rx="12" fill="white" stroke={c.main} strokeWidth="1.5" />
        <Trace x={x + 49} y={y + 74} size={a.L === 'W' || a.L === 'M' ? 40 : 46}>{a.L + a.L.toLowerCase()}</Trace>
        <text x={x + 13} y={y + 24} fontSize="14" fontWeight="900" textAnchor="start" fill={c.dark}>{a.L}</text>
        {a.pic.mini ? <Mini kind={a.pic.mini} x={x + 127} y={y + 44} s={58} /> : img(a.pic.art, x + 127, y + 46, 54)}
        <text x={x + 127} y={y + 100} fontSize={a.word.length > 7 ? 12.5 : 16} fontWeight="700" direction="ltr"><Hi word={a.word} at={at} color={c.dark} /></text>
      </g>
    })}
    <g fontFamily={FONT} textAnchor="middle">
      <rect x="218" y="658" width="338" height="112" rx="16" fill="white" stroke={INK} strokeWidth="1.8" strokeDasharray="6 5" />
      <Star x={262} y={714} r={28} />
      <text x="400" y="704" fontSize="26" fontWeight="900" direction="ltr" fill={TONES[tone].dark}>{from ? 'N, O, P… Z!' : 'A, B, C… M!'}</text>
      <text x="400" y="740" fontSize="14" direction="rtl">אומרים את כל האותיות בעמוד בקול</text>
    </g>
  </Sheet>
}

function FindLetterPage({ n, rows }) {
  return <Sheet n={n} tone="pink" title={PAGES[n - 1]} en="Find and circle the letter" instruction="בכל שורה מקיפים את האות שבבלון — גדולה וגם קטנה">
    {rows.map((row, i) => {
      const c = TONES[TONE_LIST[i % TONE_LIST.length]], y = 182 + i * 98
      return <g key={row.L} fontFamily={FONT} textAnchor="middle">
        <rect x="44" y={y} width="512" height="84" rx="18" fill={c.soft} stroke={INK} strokeWidth="1.5" />
        <path d={`M505 ${y + 74} q-8 8 0 16`} fill="none" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="505" cy={y + 40} rx="34" ry="36" fill={c.main} stroke={INK} strokeWidth="2" />
        <path d={`M500 ${y + 78} l5 -4 l5 4 Z`} fill={c.main} stroke={INK} strokeWidth="1.5" />
        <ellipse cx="493" cy={y + 22} rx="7" ry="10" fill="white" opacity="0.6" />
        <text x="505" y={y + 51} fontSize="30" fontWeight="900" direction="ltr">{row.L + row.L.toLowerCase()}</text>
        {row.items.map((ch, k) => <text key={k} x={70 + k * 45} y={y + 54} fontSize="34" fontWeight="700" direction="ltr">{ch}</text>)}
      </g>
    })}
  </Sheet>
}

// Connect A→Z around a fish (and back to A).
const FISH = (() => {
  const cx = 320, cy = 440, rx = 200, ry = 135, pt = deg => [cx + rx * Math.cos(deg * Math.PI / 180), cy - ry * Math.sin(deg * Math.PI / 180)]
  return [...Array.from({ length: 12 }, (_, i) => pt(i * 15)), [62, 335], [118, 440], [62, 545], ...Array.from({ length: 11 }, (_, i) => pt(195 + i * 15))]
})()
function DotsPage({ n }) {
  const t = TONES.mint
  return <Sheet n={n} tone="mint" title={PAGES[n - 1]} en="Connect the dots: A, B, C… Z" instruction="מחברים את הנקודות לפי סדר ה־ABC, מ־A עד Z, וחוזרים ל־A. אחר כך צובעים">
    <path d="M44 640 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t72 0" fill="none" stroke={t.main} strokeWidth="3" />
    <path d="M44 668 q40 -16 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t72 0" fill="none" stroke={t.main} strokeWidth="2" opacity="0.6" />
    {[[548, 330, 10], [535, 290, 7], [552, 256, 5]].map(([x, y, r]) => <circle key={y} cx={x} cy={y} r={r} fill="none" stroke={t.dark} strokeWidth="1.8" />)}
    <circle cx="452" cy="408" r="11" fill="white" stroke={INK} strokeWidth="2" /><circle cx="455" cy="408" r="5" fill={INK} />
    <path d="M488 462 q12 10 24 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <g fontFamily={FONT} textAnchor="middle" fontWeight="800" fontSize="17" direction="ltr">
      {FISH.map(([x, y], i) => { const dx = x - 320, dy = y - 440, d = Math.hypot(dx, dy) || 1, lx = x + dx / d * 19, ly = y + dy / d * 19 + 6
        return <g key={i}><circle cx={x} cy={y} r={i ? 4.5 : 6} fill={i ? INK : t.dark} /><text x={lx} y={ly} fill={i ? INK : t.dark}>{ABC[i]}</text></g> })}
    </g>
    <g fontFamily={FONT} textAnchor="middle">
      <rect x="120" y="700" width="360" height="66" rx="18" fill={t.soft} stroke={INK} strokeWidth="1.8" />
      <text x="230" y="745" fontSize="28" fontWeight="800" direction="ltr" fill={t.dark}>It is a</text>
      <Trace x={360} y={746} size={38}>fish</Trace>
    </g>
  </Sheet>
}

const ring = (cx, cy, R, r) => `M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} L${cx + r} ${cy} A${r} ${r} 0 0 0 ${cx - r} ${cy} Z`
function Cloud({ x, y }) {
  const puffs = [[-26, 4, 20], [0, -8, 26], [26, 4, 20], [0, 12, 20]]
  return <g>
    {puffs.map(([dx, dy, r]) => <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r={r} fill="white" stroke={INK} strokeWidth="2" />)}
    {puffs.map(([dx, dy, r]) => <circle key={`w${dx}${dy}`} cx={x + dx} cy={y + dy} r={r - 2} fill="white" />)}
  </g>
}
function ColorByWordPage({ n }) {
  const key = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']
  return <Sheet n={n} tone="sun" title={PAGES[n - 1]} en="Read the color word and color" instruction="צובעים כל חלק בצבע שכתוב עליו. המקרא למעלה עוזר">
    <g fontFamily={FONT} textAnchor="middle">
      <rect x="54" y="172" width="492" height="56" rx="16" fill={TONES.sun.soft} stroke={INK} strokeWidth="1.5" />
      {key.map((c, i) => <g key={c}><circle cx={90 + i * 70} cy={192} r="11" fill={COLOR_HEX[c]} stroke={INK} strokeWidth="1.5" /><text x={90 + i * 70} y={220} fontSize="14" fontWeight="700" direction="ltr">{c}</text></g>)}
      {RAINBOW.map((c, i) => { const R = 228 - i * 28; return <g key={c}>
        <path d={ring(300, 500, R, R - 28)} fill="white" stroke={INK} strokeWidth="2" />
        <text x="300" y={500 - R + 20} fontSize="15" fontWeight="800" direction="ltr">{c}</text>
      </g> })}
      <Cloud x={300 - 156} y={502} /><Cloud x={300 + 156} y={502} />
      <circle cx="505" cy="285" r="34" fill="white" stroke={INK} strokeWidth="2" />
      {Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return <path key={i} d={`M${505 + Math.cos(a) * 42} ${285 + Math.sin(a) * 42} L${505 + Math.cos(a) * 56} ${285 + Math.sin(a) * 56}`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" /> })}
      <text x="505" y="291" fontSize="15" fontWeight="800" direction="ltr">yellow</text>
      {BALLOONS.map((c, i) => { const x = 85 + i * 86, y = 588; return <g key={c}>
        <path d={`M${x} ${y + 44} Q${x + (i % 2 ? 10 : -10)} ${y + 100} ${300} ${y + 158}`} fill="none" stroke={INK} strokeWidth="1.3" />
        <ellipse cx={x} cy={y} rx="34" ry="42" fill="white" stroke={INK} strokeWidth="2" />
        <path d={`M${x - 6} ${y + 48} l6 -6 l6 6 Z`} fill="white" stroke={INK} strokeWidth="1.5" />
        <text x={x} y={y + 6} fontSize="15" fontWeight="800" direction="ltr">{c}</text>
      </g> })}
      <path d="M288 742 l12 8 l12 -8 l-4 18 h-16 Z" fill="white" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </g>
  </Sheet>
}

function WhatColorPage({ n, opts }) {
  return <Sheet n={n} tone="lilac" title={PAGES[n - 1]} en="What color is it? Circle." instruction="איזה צבע זה? מקיפים את הצבע הנכון ואומרים את שמו באנגלית">
    {WHAT_COLOR.map(([e], i) => { const y = 180 + i * 85, c = TONES[TONE_LIST[i % TONE_LIST.length]]
      return <g key={e} fontFamily={FONT} textAnchor="middle">
        <rect x="44" y={y + 4} width="512" height="77" rx="16" fill={i % 2 ? 'white' : c.soft} stroke={INK} strokeWidth="1.3" />
        <circle cx="500" cy={y + 42} r="33" fill="white" stroke={c.main} strokeWidth="2.5" />
        {img(e, 500, y + 42, 52)}
        <path d={`M445 ${y + 42} h-30 m10 -9 l-10 9 l10 9`} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {opts[i].map((col, j) => { const x = 340 - j * 112; return <g key={col}>
          <circle cx={x} cy={y + 30} r="19" fill={COLOR_HEX[col]} stroke={INK} strokeWidth="1.8" />
          <text x={x} y={y + 70} fontSize="17" fontWeight="800" direction="ltr">{col}</text>
        </g> })}
      </g> })}
  </Sheet>
}

function NumbersPage({ n }) {
  return <Sheet n={n} tone="peach" title={PAGES[n - 1]} en="Count, say and trace" instruction="סופרים את הנקודות, אומרים את המספר באנגלית ועוברים על המילה">
    {NUMBERS.map((en, i) => { const col = i < 5 ? 0 : 1, row = i % 5, x = 44 + col * 262, y = 178 + row * 120, c = TONES[TONE_LIST[i % TONE_LIST.length]]
      return <g key={en} fontFamily={FONT} textAnchor="middle">
        <rect x={x} y={y} width="250" height="110" rx="18" fill="white" stroke={INK} strokeWidth="1.8" />
        <rect x={x} y={y} width="94" height="110" rx="18" fill={c.soft} stroke={INK} strokeWidth="1.8" />
        <circle cx={x + 47} cy={y + 55} r="34" fill="white" stroke={c.main} strokeWidth="3" />
        <text x={x + 47} y={y + 70} fontSize="40" fontWeight="900" fill={c.dark}>{i + 1}</text>
        <Trace x={x + 172} y={y + 58} size={36}>{en}</Trace>
        {Array.from({ length: i + 1 }, (_, k) => <circle key={k} cx={x + 172 + (k - i / 2) * 14} cy={y + 88} r="5.5" fill={c.main} stroke={INK} strokeWidth="1" />)}
      </g> })}
  </Sheet>
}

function HowManyPage({ n, opts }) {
  return <Sheet n={n} tone="sky" title={PAGES[n - 1]} en="How many? Count and circle." instruction="סופרים את התמונות ומקיפים את המספר. מבוגר קורא את המילים בקול">
    {HOW_MANY.map(([e, k], i) => { const y = 180 + i * 100, c = TONES[TONE_LIST[(i + 2) % TONE_LIST.length]], lines = Math.ceil(k / 4)
      return <g key={e} fontFamily={FONT} textAnchor="middle">
        <rect x="44" y={y + 4} width="512" height="90" rx="18" fill={c.soft} stroke={INK} strokeWidth="1.4" />
        <rect x="310" y={y + 10} width="238" height="78" rx="12" fill="white" stroke={c.main} strokeWidth="1.5" />
        {Array.from({ length: k }, (_, j) => { const line = Math.floor(j / 4), col = j % 4, inLine = line === lines - 1 ? k - line * 4 : 4
          return <g key={j}>{img(e, 429 + (col - (inLine - 1) / 2) * 52, y + 49 + (line - (lines - 1) / 2) * 36, lines > 1 ? 34 : 46)}</g> })}
        {opts[i].map((v, j) => { const x = 258 - j * 84; return <g key={v}>
          <rect x={x - 36} y={y + 28} width="72" height="42" rx="21" fill="white" stroke={INK} strokeWidth="1.5" />
          <text x={x} y={y + 56} fontSize="20" fontWeight="800" direction="ltr">{numWord(v)}</text>
          <text x={x} y={y + 22} fontSize="12" fill="#666">{v}</text>
        </g> })}
      </g> })}
  </Sheet>
}

const animal = en => ANIMALS.find(a => a[0] === en)
function ListenPage({ n, rows }) {
  const t = TONES.mint
  return <Sheet n={n} tone="mint" title={PAGES[n - 1]} en="Listen and circle" instruction="מבוגר קורא בקול את המילה של כל שורה, והילד/ה מקיף/ה את התמונה">
    {rows.map((row, i) => { const y = 180 + i * 88
      return <g key={i} fontFamily={FONT} textAnchor="middle">
        <rect x="44" y={y + 4} width="512" height="80" rx="16" fill={i % 2 ? 'white' : t.soft} stroke={INK} strokeWidth="1.3" />
        <circle cx="526" cy={y + 44} r="20" fill={t.main} stroke={INK} strokeWidth="2" />
        <text x="526" y={y + 52} fontSize="22" fontWeight="900">{i + 1}</text>
        {row.map((en, j) => { const x = 420 - j * 135; return <g key={en}>
          <rect x={x - 50} y={y + 10} width="100" height="68" rx="14" fill="white" stroke={TONES.sun.main} strokeWidth="2" />
          {img(animal(en)[1], x, y + 44, 58)}
        </g> })}
      </g> })}
    <g fontFamily={FONT}>
      <rect x="44" y="716" width="512" height="60" rx="14" fill="white" stroke={t.dark} strokeWidth="1.8" strokeDasharray="6 4" />
      <text x="540" y="740" fontSize="13.5" fontWeight="800" direction="rtl">להורה — קוראים בקול (שורה אחרי שורה):</text>
      <text x="60" y="766" fontSize="15" fontWeight="700" direction="ltr" fill={t.dark} style={{ whiteSpace: 'pre' }}>{LISTEN.map((w, i) => `${i + 1}. ${w}`).join('   ')}</text>
    </g>
  </Sheet>
}

function FamilyPage({ n }) {
  const t = TONES.pink
  return <Sheet n={n} tone="pink" title={PAGES[n - 1]} en="Say and trace. Then draw your family." instruction="אומרים מי זה באנגלית ועוברים על המילה. למטה מציירים את המשפחה">
    {FAMILY.map(([en, e], i) => { const x = 44 + (i % 4) * 130, y = 176 + Math.floor(i / 4) * 138, c = TONES[TONE_LIST[i % TONE_LIST.length]]
      return <g key={en} fontFamily={FONT} textAnchor="middle">
        <rect x={x} y={y} width="122" height="128" rx="16" fill={c.soft} stroke={INK} strokeWidth="1.6" />
        <circle cx={x + 61} cy={y + 50} r="38" fill="white" stroke={c.main} strokeWidth="2" />
        {img(e, x + 61, y + 50, 58)}
        <Trace x={x + 61} y={y + 114} size={en.length > 5 ? 22 : 28}>{en}</Trace>
      </g> })}
    <rect x="58" y="462" width="484" height="262" rx="10" fill={t.soft} stroke={INK} strokeWidth="3" />
    <rect x="78" y="482" width="444" height="222" rx="6" fill="white" stroke={t.main} strokeWidth="2" strokeDasharray="10 6" />
    {[[68, 472], [532, 472], [68, 714], [532, 714]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="7" fill={t.main} stroke={INK} strokeWidth="1.5" />)}
    <text x="300" y="600" fontSize="14" fill="#bbb" textAnchor="middle" fontFamily={FONT} direction="rtl">כאן מציירים את המשפחה שלי</text>
    <g fontFamily={FONT} textAnchor="middle"><text x="196" y="765" fontSize="28" fontWeight="800" direction="ltr" fill={t.dark}>This is my</text><Trace x={370} y={766} size={34}>family.</Trace></g>
  </Sheet>
}

export default function EnglishGrade1Booklet({ seed }) {
  const d = englishGrade1Data(seed)
  return <>
    <EarlyCover tone="sky" title="חוברת אנגלית לכיתה א׳" subtitle={['16 עמודים של אנגלית ראשונה בכיף:', 'שלום, ABC, צבעים, מספרים, חיות ומשפחה']} pages={PAGES} blocks="ABC"
      pics={[['🐶', 88, 118, 72], ['🍎', 512, 118, 66], ['🎈', 112, 634, 46], ['⭐', 300, 634, 40], ['🦁', 488, 634, 46]]}
      note={['להורים:', 'אין צורך לדעת לקרוא באנגלית: קוראים בקול כל מילה,', 'והילד/ה מקשיב/ה, חוזר/ת ומסמן/ת. עמוד אחד ביום מספיק.', 'בעמוד האנגלית באתר אפשר לשמוע איך אומרים כל מילה.']} />
    <HelloPage n={2} />
    <AlphabetPage n={3} from={0} tone="sky" />
    <AlphabetPage n={4} from={13} tone="lilac" />
    <FindLetterPage n={5} rows={d.find} />
    <DotsPage n={6} />
    <ColorByWordPage n={7} />
    <WhatColorPage n={8} opts={d.colorOpts} />
    <NumbersPage n={9} />
    <HowManyPage n={10} opts={d.howMany} />
    <ListenPage n={11} rows={d.listen} />
    <FamilyPage n={12} />
    <MatchCards n={13} seed={seed} tone="peach" title={PAGES[12]} en="Match the picture to the word" instruction="מותחים קו מכל פרי למילה שלו באנגלית. מבוגר יכול לקרוא את המילים"
      pairs={FRUITS.map(([en, e]) => [{ art: e }, { text: en }])} />
    <PicSearch n={14} seed={seed} size={8} tone="mint" title={PAGES[13]} en="Find the words" instruction="מוצאים את המילים בטבלה — משמאל לימין או מלמעלה למטה — ומקיפים"
      words={SEARCH.map(([word, art]) => ({ word, art }))} />
    <AnswerKey n={15} sections={[
      { title: 'עמוד 5 — מוצאים את האות (המקומות נספרים משמאל)', answers: d.find.map(f => `${f.L}${f.L.toLowerCase()}: ${f.at.join(', ')}`) },
      { title: 'עמוד 6 — מחברים נקודות', answers: ['יוצא דג — fish 🐟'] },
      { title: 'עמוד 8 — איזה צבע?', answers: WHAT_COLOR.map(([e, en, he]) => `${e} ${en} — ${he}`) },
      { title: 'עמוד 10 — כמה יש?', answers: HOW_MANY.map(([e, k]) => `${e} ${k} — ${numWord(k)}`) },
      { title: 'עמוד 11 — שומעים ומקיפים', answers: LISTEN.map(en => `${en} — ${animal(en)[2]} ${animal(en)[1]}`) },
      { title: 'עמוד 13 — פירות', answers: FRUITS.map(([en, e, he]) => `${e} ${en} — ${he}`) },
      { title: 'עמוד 14 — תפזורת', answers: [SEARCH.map(s => s[0]).join(', ')] },
    ]} />
    <EarlyCertificate tone="sun" booklet="חוברת האנגלית לכיתה א׳" done={['אמרתי שלום, עברתי על ה־ABC, צבעתי,', 'ספרתי עד 10 ולמדתי מילים ראשונות באנגלית.']} cheer="Well done! Great job!" />
  </>
}

