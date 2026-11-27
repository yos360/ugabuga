// Dress-up game data: an original round, fluffy character drawn with plain SVG shapes
// (viewBox 0 0 200 290) and the clothes that go on it. Every item is a small <g> drawn in
// the same coordinates as the character, so it simply lays on top of it.
// tags: which occasion filters show the item ('all' = shown in every filter).

export const SLOTS = [
  { id: 'hat', label: 'כובעים', emoji: '🎩', view: '30 0 140 92' },
  { id: 'top', label: 'חולצות', emoji: '👕', view: '40 112 120 100' },
  { id: 'bottom', label: 'מכנסיים', emoji: '👖', view: '46 190 108 78' },
  { id: 'shoes', label: 'נעליים', emoji: '👟', view: '52 232 96 40' },
  { id: 'face', label: 'פנים', emoji: '🕶️', view: '56 66 88 56' },
  { id: 'extra', label: 'אביזרים', emoji: '🎒', view: '24 80 156 130' },
]

export const OCCASIONS = [
  { id: 'all', label: 'הכל', emoji: '🌈' },
  { id: 'winter', label: 'חורף', emoji: '❄️' },
  { id: 'summer', label: 'קיץ', emoji: '☀️' },
  { id: 'birthday', label: 'יום הולדת', emoji: '🎂' },
  { id: 'purim', label: 'פורים', emoji: '🎭' },
]

export const FURS = ['#f6c453', '#f9a8d4', '#a5b4fc', '#86efac', '#fdba74', '#d6d3d1']
export const FUR_NAMES = ['צהוב', 'ורוד', 'סגלגל', 'מנטה', 'כתום', 'אפור']

const INK = '#1d2233'

// ---- helpers -------------------------------------------------------------------------
const sleeves = (c, len = 32) => (
  <>
    <ellipse cx="58" cy="165" rx="13" ry={len} transform="rotate(12 58 165)" fill={c} stroke={INK} strokeWidth="2" />
    <ellipse cx="142" cy="165" rx="13" ry={len} transform="rotate(-12 142 165)" fill={c} stroke={INK} strokeWidth="2" />
  </>
)
const torso = c => <rect x="66" y="126" width="68" height="78" rx="22" fill={c} stroke={INK} strokeWidth="2" />
const legs = (c, bottomY, cuff) => (
  <>
    <rect x="72" y="196" width="56" height="26" rx="8" fill={c} stroke={INK} strokeWidth="2" />
    <rect x="78" y="204" width="21" height={bottomY - 204} rx="8" fill={c} stroke={INK} strokeWidth="2" />
    <rect x="101" y="204" width="21" height={bottomY - 204} rx="8" fill={c} stroke={INK} strokeWidth="2" />
    <rect x="72" y="196" width="56" height="10" rx="5" fill={cuff} stroke={INK} strokeWidth="2" />
    {bottomY > 240 && <><rect x="77" y={bottomY - 8} width="23" height="8" rx="4" fill={cuff} /><rect x="100" y={bottomY - 8} width="23" height="8" rx="4" fill={cuff} /></>}
  </>
)
const star = (cx, cy, r, fill) => {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.45 : r; return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}` }).join(' ')
  return <polygon points={pts} fill={fill} stroke={INK} strokeWidth="1.2" />
}
const boot = (x, color, sole) => (
  <>
    <rect x={x - 12} y="236" width="26" height="24" rx="7" fill={color} stroke={INK} strokeWidth="2" />
    <ellipse cx={x} cy="260" rx="17" ry="9" fill={color} stroke={INK} strokeWidth="2" />
    <rect x={x - 17} y="262" width="34" height="5" rx="2.5" fill={sole} />
  </>
)

// ---- items ---------------------------------------------------------------------------
export const ITEMS = [
  // hats
  { id: 'hat-beanie', slot: 'hat', name: 'כובע צמר', tags: ['winter'], art: (
    <g><path d="M52 66 Q52 26 100 26 Q148 26 148 66 Z" fill="#e11d48" stroke={INK} strokeWidth="2" /><rect x="48" y="58" width="104" height="17" rx="8" fill="#be123c" stroke={INK} strokeWidth="2" /><circle cx="100" cy="22" r="11" fill="#fff" stroke={INK} strokeWidth="2" /></g>) },
  { id: 'hat-muffs', slot: 'hat', name: 'כיסויי אוזניים', tags: ['winter'], art: (
    <g><path d="M54 74 Q100 4 146 74" fill="none" stroke="#475569" strokeWidth="6" strokeLinecap="round" /><circle cx="54" cy="78" r="15" fill="#f472b6" stroke={INK} strokeWidth="2" /><circle cx="146" cy="78" r="15" fill="#f472b6" stroke={INK} strokeWidth="2" /></g>) },
  { id: 'hat-sun', slot: 'hat', name: 'כובע קש', tags: ['summer'], art: (
    <g><ellipse cx="100" cy="62" rx="76" ry="14" fill="#f5d27a" stroke={INK} strokeWidth="2" /><path d="M62 62 Q62 28 100 28 Q138 28 138 62 Z" fill="#f5d27a" stroke={INK} strokeWidth="2" /><rect x="62" y="52" width="76" height="9" fill="#ef4444" /></g>) },
  { id: 'hat-cap', slot: 'hat', name: 'כובע מצחייה', tags: ['summer', 'all'], art: (
    <g><path d="M56 64 Q56 28 100 28 Q144 28 144 64 Z" fill="#38bdf8" stroke={INK} strokeWidth="2" /><path d="M118 62 Q168 56 174 70 Q140 76 116 68 Z" fill="#0284c7" stroke={INK} strokeWidth="2" /><circle cx="100" cy="28" r="5" fill="#0284c7" /></g>) },
  { id: 'hat-party', slot: 'hat', name: 'כובע מסיבה', tags: ['birthday'], art: (
    <g><path d="M68 66 L100 6 L132 66 Z" fill="#a855f7" stroke={INK} strokeWidth="2" /><circle cx="92" cy="44" r="4" fill="#facc15" /><circle cx="110" cy="52" r="4" fill="#facc15" /><circle cx="100" cy="30" r="3.5" fill="#fde68a" /><circle cx="100" cy="6" r="8" fill="#facc15" stroke={INK} strokeWidth="2" /></g>) },
  { id: 'hat-crown', slot: 'hat', name: 'כתר', tags: ['purim', 'birthday'], art: (
    <g><path d="M62 62 L66 28 L84 46 L100 22 L116 46 L134 28 L138 62 Z" fill="#facc15" stroke="#a16207" strokeWidth="2.5" strokeLinejoin="round" /><circle cx="100" cy="52" r="5" fill="#ef4444" /><circle cx="78" cy="54" r="3.5" fill="#38bdf8" /><circle cx="122" cy="54" r="3.5" fill="#38bdf8" /></g>) },
  { id: 'hat-jester', slot: 'hat', name: 'כובע ליצן', tags: ['purim'], art: (
    <g><path d="M56 66 Q36 32 58 10 Q68 40 100 42 Z" fill="#7c3aed" stroke={INK} strokeWidth="2" /><path d="M144 66 Q164 32 142 10 Q132 40 100 42 Z" fill="#f97316" stroke={INK} strokeWidth="2" /><path d="M56 66 Q100 36 144 66 L144 58 Q100 28 56 58 Z" fill="#facc15" stroke={INK} strokeWidth="2" /><circle cx="58" cy="10" r="7" fill="#facc15" stroke={INK} strokeWidth="2" /><circle cx="142" cy="10" r="7" fill="#facc15" stroke={INK} strokeWidth="2" /></g>) },
  { id: 'hat-wizard', slot: 'hat', name: 'כובע קוסמים', tags: ['purim'], art: (
    <g><path d="M66 64 L104 2 L134 64 Z" fill="#1e3a8a" stroke={INK} strokeWidth="2" /><ellipse cx="100" cy="64" rx="58" ry="10" fill="#1e40af" stroke={INK} strokeWidth="2" />{star(98, 40, 8, '#facc15')}{star(116, 54, 5, '#fde68a')}</g>) },

  // tops
  { id: 'top-tee', slot: 'top', name: 'חולצה ירוקה', tags: ['all'], art: <g>{torso('#4ade80')}{sleeves('#4ade80', 20)}</g> },
  { id: 'top-sweater', slot: 'top', name: 'סוודר פסים', tags: ['winter'], art: (
    <g>{sleeves('#2563eb')}{torso('#2563eb')}<rect x="67" y="146" width="66" height="9" fill="#93c5fd" /><rect x="67" y="166" width="66" height="9" fill="#93c5fd" /><rect x="67" y="186" width="66" height="9" fill="#93c5fd" /><rect x="80" y="119" width="40" height="14" rx="7" fill="#1d4ed8" stroke={INK} strokeWidth="2" /></g>) },
  { id: 'top-puffer', slot: 'top', name: 'מעיל חורף', tags: ['winter'], art: (
    <g>{sleeves('#f97316', 34)}{torso('#f97316')}<path d="M67 152 H133 M67 176 H133" stroke="#c2410c" strokeWidth="3" /><path d="M100 128 V204" stroke="#c2410c" strokeWidth="3" /><rect x="78" y="118" width="44" height="16" rx="8" fill="#fb923c" stroke={INK} strokeWidth="2" /></g>) },
  { id: 'top-sun', slot: 'top', name: 'חולצת שמש', tags: ['summer'], art: (
    <g>{sleeves('#facc15', 16)}{torso('#facc15')}<circle cx="100" cy="165" r="11" fill="#f97316" />{[0, 45, 90, 135, 180, 225, 270, 315].map(a => <line key={a} x1={100 + Math.cos(a * Math.PI / 180) * 15} y1={165 + Math.sin(a * Math.PI / 180) * 15} x2={100 + Math.cos(a * Math.PI / 180) * 21} y2={165 + Math.sin(a * Math.PI / 180) * 21} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />)}</g>) },
  { id: 'top-tank', slot: 'top', name: 'גופייה', tags: ['summer'], art: (
    <g><path d="M72 128 Q72 150 70 204 H130 Q128 150 128 128 L118 126 Q100 142 82 126 Z" fill="#22d3ee" stroke={INK} strokeWidth="2" strokeLinejoin="round" /><path d="M72 188 H128" stroke="#fff" strokeWidth="5" opacity=".7" /></g>) },
  { id: 'top-party', slot: 'top', name: 'חולצת מסיבה', tags: ['birthday'], art: (
    <g>{sleeves('#ec4899', 18)}{torso('#ec4899')}{[[82, 150], [110, 146], [96, 170], [120, 176], [80, 190], [106, 196]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="4.5" fill="#fff" />)}<path d="M100 132 L86 124 V140 Z M100 132 L114 124 V140 Z" fill="#facc15" stroke={INK} strokeWidth="1.5" /></g>) },
  { id: 'top-robe', slot: 'top', name: 'גלימה מלכותית', tags: ['purim'], art: (
    <g>{sleeves('#dc2626', 34)}{torso('#dc2626')}<path d="M70 128 Q100 150 130 128 L130 140 Q100 162 70 140 Z" fill="#fff" stroke={INK} strokeWidth="2" />{[78, 92, 108, 122].map(x => <circle key={x} cx={x} cy="138" r="2.4" fill="#1d2233" />)}<circle cx="100" cy="172" r="4" fill="#facc15" /><circle cx="100" cy="190" r="4" fill="#facc15" /></g>) },
  { id: 'top-clown', slot: 'top', name: 'חולצת ליצן', tags: ['purim'], art: (
    <g>{sleeves('#facc15', 30)}{torso('#3b82f6')}<path d="M100 126 H112 Q134 126 134 148 V182 Q134 204 112 204 H100 Z" fill="#facc15" /><circle cx="100" cy="150" r="7" fill="#ef4444" stroke={INK} strokeWidth="1.5" /><circle cx="100" cy="172" r="7" fill="#ef4444" stroke={INK} strokeWidth="1.5" /><circle cx="100" cy="194" r="7" fill="#ef4444" stroke={INK} strokeWidth="1.5" /><circle cx="100" cy="120" r="14" fill="#fff" stroke={INK} strokeWidth="2" /></g>) },

  // bottoms
  { id: 'bottom-jeans', slot: 'bottom', name: 'ג׳ינס', tags: ['all'], art: <g>{legs('#2563eb', 250, '#1e40af')}</g> },
  { id: 'bottom-warm', slot: 'bottom', name: 'מכנסיים חמים', tags: ['winter'], art: <g>{legs('#78716c', 252, '#57534e')}</g> },
  { id: 'bottom-snow', slot: 'bottom', name: 'מכנסי שלג', tags: ['winter'], art: <g>{legs('#1e293b', 252, '#0f172a')}<rect x="78" y="226" width="21" height="5" fill="#fde047" /><rect x="101" y="226" width="21" height="5" fill="#fde047" /></g> },
  { id: 'bottom-shorts', slot: 'bottom', name: 'מכנסיים קצרים', tags: ['summer'], art: <g>{legs('#fb923c', 228, '#ea580c')}</g> },
  { id: 'bottom-skirt', slot: 'bottom', name: 'חצאית', tags: ['summer', 'all'], art: (
    <g><path d="M72 198 L128 198 L144 240 L56 240 Z" fill="#f472b6" stroke={INK} strokeWidth="2" strokeLinejoin="round" /><rect x="70" y="196" width="60" height="9" rx="4.5" fill="#db2777" stroke={INK} strokeWidth="2" /><path d="M70 240 H130" stroke="#fff" strokeWidth="4" strokeDasharray="6 5" /></g>) },
  { id: 'bottom-tutu', slot: 'bottom', name: 'חצאית טוטו', tags: ['birthday'], art: (
    <g><ellipse cx="100" cy="226" rx="52" ry="15" fill="#c084fc" stroke={INK} strokeWidth="2" /><ellipse cx="100" cy="216" rx="46" ry="14" fill="#f9a8d4" stroke={INK} strokeWidth="2" /><ellipse cx="100" cy="206" rx="38" ry="11" fill="#fbcfe8" stroke={INK} strokeWidth="2" /><rect x="70" y="196" width="60" height="9" rx="4.5" fill="#db2777" /></g>) },
  { id: 'bottom-clown', slot: 'bottom', name: 'מכנסי ליצן', tags: ['purim'], art: (
    <g><path d="M66 198 Q54 240 72 260 L97 260 L100 218 L103 260 L128 260 Q146 240 134 198 Z" fill="#22c55e" stroke={INK} strokeWidth="2" strokeLinejoin="round" />{[[76, 226], [88, 244], [114, 244], [124, 226], [100, 208], [86, 208], [114, 208]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="5" fill="#facc15" />)}</g>) },

  // shoes
  { id: 'shoes-sneakers', slot: 'shoes', name: 'נעלי ספורט', tags: ['all'], art: (
    <g><ellipse cx="88" cy="259" rx="18" ry="10" fill="#fff" stroke={INK} strokeWidth="2" /><ellipse cx="112" cy="259" rx="18" ry="10" fill="#fff" stroke={INK} strokeWidth="2" /><path d="M72 258 H104 M96 258 H128" stroke="#3b82f6" strokeWidth="4" /><rect x="70" y="264" width="36" height="4" rx="2" fill={INK} opacity=".25" /><rect x="94" y="264" width="36" height="4" rx="2" fill={INK} opacity=".25" /></g>) },
  { id: 'shoes-boots', slot: 'shoes', name: 'מגפיים', tags: ['winter'], art: <g>{boot(88, '#92400e', '#451a03')}{boot(112, '#92400e', '#451a03')}</g> },
  { id: 'shoes-rain', slot: 'shoes', name: 'מגפי גשם', tags: ['winter'], art: <g>{boot(88, '#facc15', '#a16207')}{boot(112, '#facc15', '#a16207')}</g> },
  { id: 'shoes-sandals', slot: 'shoes', name: 'סנדלים', tags: ['summer'], art: (
    <g><ellipse cx="88" cy="261" rx="17" ry="8" fill="#d6a45a" stroke={INK} strokeWidth="2" /><ellipse cx="112" cy="261" rx="17" ry="8" fill="#d6a45a" stroke={INK} strokeWidth="2" /><path d="M78 258 Q88 250 98 258 M102 258 Q112 250 122 258" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" /></g>) },
  { id: 'shoes-party', slot: 'shoes', name: 'נעלי חגיגה', tags: ['birthday'], art: (
    <g><ellipse cx="88" cy="259" rx="17" ry="10" fill="#a855f7" stroke={INK} strokeWidth="2" /><ellipse cx="112" cy="259" rx="17" ry="10" fill="#a855f7" stroke={INK} strokeWidth="2" /><circle cx="88" cy="256" r="4" fill="#facc15" /><circle cx="112" cy="256" r="4" fill="#facc15" /><path d="M76 255 Q86 250 96 255 M104 255 Q114 250 124 255" stroke="#e9d5ff" strokeWidth="2" fill="none" /></g>) },
  { id: 'shoes-clown', slot: 'shoes', name: 'נעלי ליצן ענקיות', tags: ['purim'], art: (
    <g><ellipse cx="82" cy="262" rx="26" ry="12" fill="#f97316" stroke={INK} strokeWidth="2" /><ellipse cx="118" cy="262" rx="26" ry="12" fill="#f97316" stroke={INK} strokeWidth="2" /><circle cx="64" cy="261" r="4" fill="#fff" /><circle cx="136" cy="261" r="4" fill="#fff" /></g>) },

  // face
  { id: 'face-sunglasses', slot: 'face', name: 'משקפי שמש', tags: ['summer'], art: (
    <g><rect x="62" y="76" width="34" height="24" rx="10" fill="#1f2937" stroke={INK} strokeWidth="2" /><rect x="104" y="76" width="34" height="24" rx="10" fill="#1f2937" stroke={INK} strokeWidth="2" /><path d="M96 84 H104" stroke={INK} strokeWidth="3" /><path d="M68 82 L76 80 M110 82 L118 80" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" /></g>) },
  { id: 'face-glasses', slot: 'face', name: 'משקפיים עגולים', tags: ['all'], art: (
    <g fill="none" stroke="#7c2d12" strokeWidth="3.5"><circle cx="80" cy="88" r="15" /><circle cx="120" cy="88" r="15" /><path d="M95 88 H105 M65 86 L54 80 M135 86 L146 80" strokeLinecap="round" /></g>) },
  { id: 'face-mask', slot: 'face', name: 'מסכת מסיבה', tags: ['purim'], art: (
    <g><path d="M54 80 Q80 68 100 78 Q120 68 146 80 Q146 104 124 104 Q108 104 100 94 Q92 104 76 104 Q54 104 54 80 Z" fill="#7c3aed" stroke={INK} strokeWidth="2" /><ellipse cx="80" cy="88" rx="9" ry="7" fill="#fff" /><ellipse cx="120" cy="88" rx="9" ry="7" fill="#fff" /><circle cx="80" cy="88" r="5" fill={INK} /><circle cx="120" cy="88" r="5" fill={INK} /><circle cx="62" cy="82" r="2.5" fill="#facc15" /><circle cx="138" cy="82" r="2.5" fill="#facc15" /><circle cx="100" cy="76" r="2.5" fill="#facc15" /></g>) },
  { id: 'face-nose', slot: 'face', name: 'אף ליצן', tags: ['purim'], art: <g><circle cx="100" cy="99" r="10" fill="#ef4444" stroke={INK} strokeWidth="2" /><circle cx="97" cy="96" r="3" fill="#fff" opacity=".7" /></g> },
  { id: 'face-stache', slot: 'face', name: 'שפם מצחיק', tags: ['purim', 'birthday'], art: (
    <g><path d="M100 104 Q88 96 74 104 Q70 112 82 110 Q92 108 100 106 Q108 108 118 110 Q130 112 126 104 Q112 96 100 104 Z" fill="#451a03" stroke={INK} strokeWidth="1.5" /></g>) },
  { id: 'face-stars', slot: 'face', name: 'כוכבים על הלחיים', tags: ['birthday', 'summer'], art: <g>{star(66, 106, 8, '#facc15')}{star(134, 106, 8, '#38bdf8')}</g> },

  // extras
  { id: 'extra-scarf', slot: 'extra', name: 'צעיף', tags: ['winter'], art: (
    <g><ellipse cx="100" cy="130" rx="40" ry="11" fill="#ef4444" stroke={INK} strokeWidth="2" /><rect x="108" y="130" width="18" height="52" rx="6" fill="#ef4444" stroke={INK} strokeWidth="2" /><rect x="108" y="150" width="18" height="7" fill="#fff" /><rect x="108" y="168" width="18" height="7" fill="#fff" /></g>) },
  { id: 'extra-umbrella', slot: 'extra', name: 'מטרייה', tags: ['winter'], art: (
    <g><path d="M148 196 V104" stroke="#475569" strokeWidth="4" strokeLinecap="round" /><path d="M148 196 Q148 206 138 204" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" /><path d="M112 104 A36 30 0 0 1 184 104 Z" fill="#38bdf8" stroke={INK} strokeWidth="2" /><path d="M148 74 V104 M130 78 Q132 94 130 104 M166 78 Q164 94 166 104" stroke={INK} strokeWidth="1.5" fill="none" /></g>) },
  { id: 'extra-icecream', slot: 'extra', name: 'גלידה', tags: ['summer'], art: (
    <g><path d="M138 196 L150 150 L162 196 Z" fill="#d6a45a" stroke={INK} strokeWidth="2" strokeLinejoin="round" /><circle cx="150" cy="142" r="14" fill="#f9a8d4" stroke={INK} strokeWidth="2" /><circle cx="150" cy="126" r="12" fill="#fde68a" stroke={INK} strokeWidth="2" /><circle cx="150" cy="115" r="4" fill="#ef4444" /></g>) },
  { id: 'extra-lei', slot: 'extra', name: 'שרשרת פרחים', tags: ['summer'], art: (
    <g>{[56, 66, 78, 90, 100, 110, 122, 134, 144].map((x, i) => { const y = 128 + 14 * Math.sin(((x - 56) / 88) * Math.PI); return <circle key={x} cx={x} cy={y} r="6.5" fill={['#f43f5e', '#fb923c', '#facc15', '#a855f7', '#38bdf8'][i % 5]} stroke={INK} strokeWidth="1.5" /> })}</g>) },
  { id: 'extra-balloon', slot: 'extra', name: 'בלון', tags: ['birthday'], art: (
    <g><path d="M146 196 Q150 160 162 108" stroke="#64748b" strokeWidth="2" fill="none" /><ellipse cx="164" cy="90" rx="19" ry="23" fill="#f43f5e" stroke={INK} strokeWidth="2" /><path d="M164 113 l-4 7 h8 z" fill="#f43f5e" stroke={INK} strokeWidth="1.5" /><ellipse cx="157" cy="80" rx="4" ry="7" fill="#fff" opacity=".6" /></g>) },
  { id: 'extra-bowtie', slot: 'extra', name: 'עניבת פרפר', tags: ['birthday', 'all'], art: (
    <g><path d="M100 134 L76 122 V146 Z M100 134 L124 122 V146 Z" fill="#2563eb" stroke={INK} strokeWidth="2" strokeLinejoin="round" /><circle cx="100" cy="134" r="6" fill="#1d4ed8" stroke={INK} strokeWidth="2" /></g>) },
  { id: 'extra-wand', slot: 'extra', name: 'שרביט קסמים', tags: ['purim'], art: (
    <g><path d="M146 194 L176 130" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />{star(178, 122, 15, '#facc15')}<circle cx="190" cy="148" r="2.5" fill="#f472b6" /><circle cx="168" cy="108" r="2.5" fill="#38bdf8" /></g>) },
  { id: 'extra-gragger', slot: 'extra', name: 'רעשן', tags: ['purim'], art: (
    <g><rect x="144" y="150" width="9" height="46" rx="4" fill="#92400e" stroke={INK} strokeWidth="2" /><circle cx="148" cy="136" r="18" fill="#f97316" stroke={INK} strokeWidth="2" />{[[140, 130], [154, 128], [148, 142], [138, 144], [158, 142]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="3" fill="#facc15" />)}</g>) },
]

export const itemById = id => ITEMS.find(i => i.id === id)
export const itemsFor = (slot, occasion) => ITEMS.filter(i => i.slot === slot && (occasion === 'all' || i.tags.includes(occasion) || i.tags.includes('all')))

export const DEFAULT_OUTFIT = { hat: null, top: 'top-tee', bottom: 'bottom-jeans', shoes: 'shoes-sneakers', face: null, extra: null }

// A random outfit: every slot picked from what the chosen occasion offers. Clothes always get
// chosen; hat, face and extra are sometimes left bare so the outfit still looks natural.
export function randomOutfit(occasion, rand = Math.random) {
  const pick = slot => { const list = itemsFor(slot, occasion); return list.length ? list[Math.floor(rand() * list.length)].id : null }
  const maybe = (slot, p) => (rand() < p ? pick(slot) : null)
  return { hat: maybe('hat', 0.8), top: pick('top'), bottom: pick('bottom'), shoes: pick('shoes'), face: maybe('face', 0.5), extra: maybe('extra', 0.65) }
}

// ---- the character and the scenery ---------------------------------------------------
export function Scene({ occasion }) {
  return (
    <g aria-hidden="true">
      {occasion === 'winter' && <>
        <rect x="0" y="0" width="200" height="290" fill="#dbeafe" />
        <ellipse cx="100" cy="282" rx="130" ry="26" fill="#fff" />
        {[[20, 30], [170, 50], [40, 120], [176, 150], [14, 210], [180, 236], [90, 14], [150, 20]].map(([x, y]) => <g key={x + y} stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d={`M${x - 6} ${y} H${x + 6} M${x} ${y - 6} V${y + 6} M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}`} /></g>)}
      </>}
      {occasion === 'summer' && <>
        <rect x="0" y="0" width="200" height="290" fill="#bae6fd" />
        <circle cx="168" cy="38" r="22" fill="#fde047" /><ellipse cx="100" cy="282" rx="130" ry="26" fill="#fde68a" />
        <path d="M0 232 Q50 220 100 232 T200 232 V290 H0 Z" fill="#7dd3fc" opacity=".55" />
      </>}
      {occasion === 'birthday' && <>
        <rect x="0" y="0" width="200" height="290" fill="#fce7f3" />
        <ellipse cx="100" cy="282" rx="130" ry="26" fill="#f9a8d4" />
        <path d="M0 14 Q50 34 100 14 T200 14" fill="none" stroke="#a855f7" strokeWidth="3" />
        {[[22, 22, '#f43f5e'], [60, 30, '#facc15'], [100, 20, '#38bdf8'], [142, 30, '#4ade80'], [178, 22, '#a855f7']].map(([x, y, c]) => <path key={x} d={`M${x - 8} ${y} L${x + 8} ${y} L${x} ${y + 16} Z`} fill={c} />)}
        {[[24, 120, '#f43f5e'], [176, 190, '#38bdf8'], [20, 230, '#facc15']].map(([x, y, c]) => <ellipse key={x + y} cx={x} cy={y} rx="9" ry="11" fill={c} opacity=".85" />)}
      </>}
      {occasion === 'purim' && <>
        <rect x="0" y="0" width="200" height="290" fill="#ede9fe" />
        <ellipse cx="100" cy="282" rx="130" ry="26" fill="#c4b5fd" />
        {star(24, 40, 10, '#facc15')}{star(176, 64, 9, '#f472b6')}{star(30, 190, 8, '#38bdf8')}{star(172, 220, 11, '#facc15')}{star(150, 22, 7, '#f97316')}
        {[[50, 20], [120, 12], [14, 110], [184, 130], [60, 250], [140, 262]].map(([x, y], i) => <circle key={x + y} cx={x} cy={y} r="4" fill={['#f43f5e', '#22c55e', '#3b82f6'][i % 3]} />)}
      </>}
      {occasion === 'all' && <>
        <rect x="0" y="0" width="200" height="290" fill="#fff7e0" />
        <ellipse cx="100" cy="282" rx="130" ry="26" fill="#fde68a" />
      </>}
    </g>
  )
}

export function Character({ fur, outfit }) {
  const worn = slot => itemById(outfit[slot])
  const bottom = worn('bottom'), shoes = worn('shoes'), top = worn('top'), extra = worn('extra'), face = worn('face'), hat = worn('hat')
  return (
    <g>
      <ellipse cx="100" cy="270" rx="46" ry="8" fill="#000" opacity=".12" />
      {/* ears, then the body underneath the clothes */}
      <circle cx="60" cy="52" r="17" fill={fur} stroke={INK} strokeWidth="2.5" /><circle cx="60" cy="52" r="8" fill="#f9a8d4" />
      <circle cx="140" cy="52" r="17" fill={fur} stroke={INK} strokeWidth="2.5" /><circle cx="140" cy="52" r="8" fill="#f9a8d4" />
      <rect x="80" y="196" width="17" height="58" rx="8" fill={fur} stroke={INK} strokeWidth="2.5" />
      <rect x="103" y="196" width="17" height="58" rx="8" fill={fur} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="88" cy="257" rx="15" ry="9" fill={fur} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="112" cy="257" rx="15" ry="9" fill={fur} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="58" cy="165" rx="12" ry="30" transform="rotate(12 58 165)" fill={fur} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="142" cy="165" rx="12" ry="30" transform="rotate(-12 142 165)" fill={fur} stroke={INK} strokeWidth="2.5" />
      <rect x="68" y="128" width="64" height="74" rx="24" fill={fur} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="100" cy="172" rx="22" ry="26" fill="#fff" opacity=".35" />
      {bottom && bottom.art}
      {shoes && shoes.art}
      {top && top.art}
      {/* the head */}
      <ellipse cx="100" cy="88" rx="52" ry="48" fill={fur} stroke={INK} strokeWidth="2.5" />
      <circle cx="80" cy="88" r="7.5" fill={INK} /><circle cx="120" cy="88" r="7.5" fill={INK} />
      <circle cx="82.5" cy="85" r="2.6" fill="#fff" /><circle cx="122.5" cy="85" r="2.6" fill="#fff" />
      <circle cx="66" cy="104" r="8" fill="#fb7185" opacity=".55" /><circle cx="134" cy="104" r="8" fill="#fb7185" opacity=".55" />
      <ellipse cx="100" cy="98" rx="5" ry="3.6" fill="#7c2d12" />
      <path d="M90 107 Q100 118 110 107" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {extra && extra.art}
      {face && face.art}
      {hat && hat.art}
    </g>
  )
}
