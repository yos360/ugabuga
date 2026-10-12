import { Page, At, S, S3, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'

// Rabin Memorial Day — line drawings for kindergarten and early grades, each in a 100×100 box
// (use with <At>). Values, not the event: peace, listening, kind words, remembering.
const L = { ...S, strokeWidth: 3 }

export const Dove = () => <g>
  <path d="M18 56 C 18 40 30 30 44 32 C 50 22 60 18 68 20 C 62 26 60 32 62 38 C 74 36 86 40 94 48 C 82 50 72 54 66 62 C 58 74 40 78 28 72 C 22 70 18 64 18 56 Z" {...L} />
  <path d="M44 34 C 40 44 42 54 50 60 C 56 50 58 42 56 34" fill="none" stroke="#111" strokeWidth={2.5} strokeLinecap="round" />
  <circle cx="28" cy="48" r="2.6" fill="#111" />
  <path d="M18 50 L8 54 L18 57 Z" {...L} strokeWidth={2.5} />
  <path d="M10 56 C 6 66 4 74 6 84" fill="none" stroke="#111" strokeWidth={2.5} strokeLinecap="round" />
  {[[7, 64, -30], [5, 74, 30], [6, 82, -25]].map(([x, y, r], i) => <ellipse key={i} cx={x + 6} cy={y} rx="6" ry="3" transform={`rotate(${r} ${x + 6} ${y})`} {...L} strokeWidth={2} />)}
  <path d="M30 72 L26 84 M38 74 L36 86" stroke="#111" strokeWidth={2.5} strokeLinecap="round" />
</g>

export const Candle = () => <g>
  <path d="M30 40 H70 V92 H30 Z" {...L} />
  <path d="M30 40 C 30 34 70 34 70 40" {...L} />
  <path d="M50 36 V28" stroke="#111" strokeWidth={2.5} />
  <path d="M50 4 C 60 14 62 22 56 28 C 52 31 48 31 44 28 C 38 22 40 14 50 4 Z" {...L} />
  <path d="M50 14 C 54 19 54 23 50 26 C 46 23 46 19 50 14 Z" {...L} strokeWidth={2} />
  <path d="M26 92 H74" stroke="#111" strokeWidth={3} strokeLinecap="round" />
</g>

export const Heart = () => <path d="M50 88 C 22 66 8 52 8 34 C 8 20 18 10 31 10 C 40 10 46 15 50 22 C 54 15 60 10 69 10 C 82 10 92 20 92 34 C 92 52 78 66 50 88 Z" {...L} />

const starOfDavid = (cx, cy, r) => {
  const tri = rot => Array.from({ length: 3 }, (_, i) => { const a = rot + i * 2 * Math.PI / 3; return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}` }).join(' ') + ' Z'
  return <g><path d={tri(-Math.PI / 2)} fill="none" stroke="#111" strokeWidth={2.5} /><path d={tri(Math.PI / 2)} fill="none" stroke="#111" strokeWidth={2.5} /></g>
}
export const Flag = () => <g>
  <path d="M10 6 V96" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  <rect x="12" y="10" width="80" height="56" {...L} />
  <path d="M12 20 H92 M12 56 H92" stroke="#111" strokeWidth={3} />
  {starOfDavid(52, 38, 11)}
</g>

export const Guitar = () => <g>
  <path d="M40 54 C 26 50 14 58 14 72 C 14 86 26 94 40 92 C 50 90 54 84 58 80 C 66 80 72 74 70 66 C 68 60 62 58 58 58 C 56 54 48 52 40 54 Z" {...L} />
  <circle cx="44" cy="74" r="7" {...L} strokeWidth={2.5} />
  <path d="M52 66 L88 14" stroke="#111" strokeWidth={8} strokeLinecap="round" />
  <path d="M52 66 L88 14" stroke="white" strokeWidth={4} strokeLinecap="round" />
  <path d="M84 8 L96 16 L90 24 L80 18 Z" {...L} strokeWidth={2.5} />
  <path d="M32 84 L36 80" stroke="#111" strokeWidth={3} />
</g>

// Two children holding hands.
const Kid = ({ x, skirt }) => <g>
  <circle cx={x} cy="22" r="11" {...L} />
  <circle cx={x - 4} cy="20" r="1.6" fill="#111" /><circle cx={x + 4} cy="20" r="1.6" fill="#111" />
  <path d={`M${x - 4} 26 Q ${x} 29 ${x + 4} 26`} fill="none" stroke="#111" strokeWidth={1.8} strokeLinecap="round" />
  {skirt ? <path d={`M${x - 8} 36 H${x + 8} L${x + 14} 66 H${x - 14} Z`} {...L} /> : <rect x={x - 9} y="36" width="18" height="30" rx="4" {...L} />}
  <path d={`M${x - 5} 66 L${x - 6} 92 M${x + 5} 66 L${x + 6} 92`} stroke="#111" strokeWidth={4} strokeLinecap="round" />
</g>
export const Friends = () => <g>
  <Kid x={30} /><Kid x={70} skirt />
  <path d="M21 40 L12 60 M79 40 L88 60" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  <path d="M39 42 Q 50 56 61 42" fill="none" stroke="#111" strokeWidth={4} strokeLinecap="round" />
</g>

const draw = C => (x, y, size) => <At x={x} y={y} size={size}><C /></At>

// ---------- colouring ----------
const DovePage = () => <BigPage title="יונת השלום">
  <At x={300} y={430} size={520}><Dove /></At>
  {[[90, 170], [510, 180], [520, 680], [80, 690]].map(([x, y], i) => <At key={i} x={x} y={y} size={70}><Heart /></At>)}
</BigPage>
const CandlePage = () => <BigPage title="נר זיכרון"><At x={300} y={450} size={540}><Candle /></At></BigPage>
const FlagPage = () => <BigPage title="דגל ישראל"><At x={300} y={440} size={540}><Flag /></At></BigPage>
const GuitarPage = () => <BigPage title="שיר לשלום">
  <At x={300} y={430} size={460}><Guitar /></At>
  {[[110, 220], [480, 650], [130, 640]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><ellipse cx="0" cy="40" rx="16" ry="12" {...S3} /><path d="M14 40 V0 L40 -8 V30" fill="none" stroke="#111" strokeWidth={4} /><ellipse cx="26" cy="32" rx="16" ry="12" {...S3} /></g>)}
</BigPage>
const FriendsPage = () => <BigPage title="חברים יד ביד">
  <At x={300} y={460} size={520}><Friends /></At>
  <At x={300} y={170} size={110}><Heart /></At>
</BigPage>
const Greeting = () => <GreetingPage lines={['שלום']}>
  <At x={150} y={560} size={190}><Dove /></At><At x={450} y={560} size={170}><Heart /></At>
  <At x={300} y={690} size={200}><Friends /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountDoves = () => <CountPage title="כמה יונים?" sub="ספרו את היונים בכל קופסה וכתבו את המספר" render={draw(Dove)} size={44} />
const MatchRabin = () => <MatchPage title="מה זה?" items={[Dove, Candle, Flag, Guitar, Heart].map(C => ({ render: draw(C) }))} words={['דגל', 'לב', 'יונה', 'גיטרה', 'נר']} />
const TraceRabin = () => <TraceWordsPage title="מילים של שלום" words={['שלום', 'חבר', 'הקשבה', 'כבוד', 'יחד', 'זיכרון']} />

// Kind words: four hearts with writing lines, for words (or a drawing) to give a friend.
function KindWords() {
  return <Page title="מילים טובות" sub="כתבו או ציירו בכל לב מילה טובה שאפשר להגיד לחבר">
    {[0, 1, 2, 3].map(i => {
      const x = i % 2 ? 160 : 440, y = 270 + Math.floor(i / 2) * 290
      return <g key={i}>
        <At x={x} y={y} size={250}><Heart /></At>
        <path d={`M${x - 60} ${y - 10} H${x + 60} M${x - 48} ${y + 30} H${x + 48}`} stroke="#999" strokeWidth={2} strokeDasharray="5 4" />
      </g>
    })}
  </Page>
}

// What helps us make peace after an argument? Circle what helps, X what doesn't.
function PeaceChoices() {
  const cells = [['מקשיבים', '👂'], ['צועקים', '📢'], ['מדברים בתורות', '🗣️'], ['דוחפים', '✋'], ['מבקשים סליחה', '🤝'], ['צוחקים על החבר', '😝']]
  return <Page title="איך עושים שלום?" sub="הקיפו מה שעוזר להשלים אחרי ויכוח, וסמנו X על מה שלא עוזר">
    {cells.map(([w, e], i) => {
      const col = i % 2, row = Math.floor(i / 2), bx = col ? 40 : 320, by = 140 + row * 215
      return <g key={w}>
        <rect x={bx} y={by} width="240" height="190" rx="18" fill="white" stroke="#111" strokeWidth="2.5" />
        <text x={bx + 120} y={by + 95} textAnchor="middle" fontSize="64">{e}</text>
        <text x={bx + 120} y={by + 160} textAnchor="middle" fontFamily={FONT} fontSize={w.length > 9 ? 22 : 26} fontWeight="800" direction="rtl">{w}</text>
      </g>
    })}
  </Page>
}

export const RABIN_ART = [
  { id: 'dove', name: 'יונת השלום', C: DovePage },
  { id: 'candle', name: 'נר זיכרון', C: CandlePage },
  { id: 'friends', name: 'חברים יד ביד', C: FriendsPage },
  { id: 'guitar', name: 'שיר לשלום', C: GuitarPage },
  { id: 'flag', name: 'דגל ישראל', C: FlagPage },
  { id: 'shalom', name: 'שלום — אותיות לצביעה', C: Greeting },
]
export const RABIN_SHEETS = [
  { id: 'kind-words', name: 'מילים טובות', age: 'גן–ב׳', C: KindWords },
  { id: 'peace', name: 'איך עושים שלום?', age: 'גן–ב׳', C: PeaceChoices },
  { id: 'count', name: 'כמה יונים?', age: 'גן', C: CountDoves },
  { id: 'match', name: 'מה זה? — התאמה', age: 'גן–א׳', C: MatchRabin },
  { id: 'trace', name: 'מילים של שלום', age: 'גן–א׳', C: TraceRabin },
]
