import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'

// Purim masks and a birthday crown: cut-out templates drawn as SVG, in colour or as outlines to colour in.

const EYE_Y = 132
function Eyes({ rx = 12, ry = 8, dx = 24 }) {
  return <g>{[-1, 1].map(s => <ellipse key={s} cx={100 + s * dx} cy={EYE_Y} rx={rx} ry={ry} fill="#fff" stroke="#111" strokeWidth={0.7} strokeDasharray="2 1.2" />)}</g>
}
function Holes({ x1 = 44, x2 = 156, y = EYE_Y }) {
  return <g>{[x1, x2].map(x => <g key={x}><circle cx={x} cy={y} r={2.2} fill="#fff" stroke="#111" strokeWidth={0.6} /><circle cx={x} cy={y} r={0.6} fill="#111" /></g>)}</g>
}
const f = (on, c) => (on ? c : '#fff')
const S = { stroke: '#111', strokeWidth: 1.1, strokeLinejoin: 'round' }

const MASKS = {
  cat: ['🐱', 'חתול', c => <g>
    <path d="M42 112 L36 62 L72 92 Z M158 112 L164 62 L128 92 Z" fill={f(c, '#ffb86b')} {...S} />
    <path d="M45 104 L42 74 L64 93 Z M155 104 L158 74 L136 93 Z" fill={f(c, '#ff8fab')} {...S} strokeWidth={0.6} />
    <ellipse cx={100} cy={140} rx={70} ry={52} fill={f(c, '#ffb86b')} {...S} />
    <path d="M94 156 L106 156 L100 163 Z" fill={f(c, '#ff8fab')} {...S} />
    <path d="M100 163 Q100 172 90 172 M100 163 Q100 172 110 172" fill="none" {...S} />
    {[-1, 1].map(s => [0, 1, 2].map(i => <line key={s + '' + i} x1={100 + s * 14} y1={160 + i * 4} x2={100 + s * 58} y2={152 + i * 9} {...S} strokeWidth={0.7} />))}
    <path d="M80 98 L84 106 M100 94 L100 104 M120 98 L116 106" {...S} />
  </g>],
  lion: ['🦁', 'אריה', c => <g>
    {Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return <ellipse key={i} cx={100 + Math.cos(a) * 66} cy={135 + Math.sin(a) * 54} rx={20} ry={14} transform={`rotate(${i * 22.5} ${100 + Math.cos(a) * 66} ${135 + Math.sin(a) * 54})`} fill={f(c, '#e8892b')} {...S} /> })}
    <circle cx={60} cy={92} r={11} fill={f(c, '#ffd23f')} {...S} /><circle cx={140} cy={92} r={11} fill={f(c, '#ffd23f')} {...S} />
    <ellipse cx={100} cy={137} rx={58} ry={50} fill={f(c, '#ffd23f')} {...S} />
    <path d="M90 152 L110 152 L100 162 Z" fill={f(c, '#6b3a1a')} {...S} />
    <path d="M100 162 L100 168 M100 168 Q92 175 86 170 M100 168 Q108 175 114 170" fill="none" {...S} />
  </g>],
  bunny: ['🐰', 'ארנב', c => <g>
    {[-1, 1].map(s => <g key={s}><ellipse cx={100 + s * 30} cy={58} rx={15} ry={42} transform={`rotate(${s * 10} ${100 + s * 30} 58)`} fill={f(c, '#f2f2f2')} {...S} /><ellipse cx={100 + s * 30} cy={62} rx={7} ry={32} transform={`rotate(${s * 10} ${100 + s * 30} 62)`} fill={f(c, '#ffc2d1')} {...S} strokeWidth={0.6} /></g>)}
    <ellipse cx={100} cy={140} rx={66} ry={50} fill={f(c, '#f2f2f2')} {...S} />
    <ellipse cx={100} cy={157} rx={6} ry={4} fill={f(c, '#ff8fab')} {...S} />
    <path d="M100 161 L100 167 M100 167 Q93 173 88 168 M100 167 Q107 173 112 168" fill="none" {...S} />
    <rect x={95} y={168} width={10} height={9} rx={1.5} fill="#fff" {...S} strokeWidth={0.7} /><line x1={100} y1={168} x2={100} y2={177} {...S} strokeWidth={0.6} />
  </g>],
  bear: ['🐻', 'דוב', c => <g>
    {[-1, 1].map(s => <g key={s}><circle cx={100 + s * 52} cy={92} r={20} fill={f(c, '#a0703f')} {...S} /><circle cx={100 + s * 52} cy={92} r={10} fill={f(c, '#e3b88a')} {...S} strokeWidth={0.6} /></g>)}
    <ellipse cx={100} cy={140} rx={68} ry={54} fill={f(c, '#a0703f')} {...S} />
    <ellipse cx={100} cy={165} rx={24} ry={16} fill={f(c, '#e3b88a')} {...S} />
    <ellipse cx={100} cy={158} rx={8} ry={5} fill={f(c, '#3a2412')} {...S} />
    <path d="M100 163 L100 170 M100 170 Q93 176 88 171 M100 170 Q107 176 112 171" fill="none" {...S} />
  </g>],
  owl: ['🦉', 'ינשוף', c => <g>
    <path d="M38 96 L50 70 L72 92 Q100 82 128 92 L150 70 L162 96 Q176 140 150 176 Q100 200 50 176 Q24 140 38 96 Z" fill={f(c, '#9a7bd1')} {...S} />
    {[-1, 1].map(s => <circle key={s} cx={100 + s * 24} cy={EYE_Y} r={20} fill={f(c, '#ffd23f')} {...S} />)}
    <path d="M100 146 L92 156 L100 170 L108 156 Z" fill={f(c, '#ffb86b')} {...S} />
    {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${66 + i * 17} 178 q8 8 16 0`} fill="none" {...S} strokeWidth={0.7} />)}
  </g>],
  fox: ['🦊', 'שועל', c => <g>
    <path d="M44 112 L40 56 L80 92 Z M156 112 L160 56 L120 92 Z" fill={f(c, '#ff8a3d')} {...S} />
    <path d="M48 104 L46 70 L68 92 Z M152 104 L154 70 L132 92 Z" fill={f(c, '#3a2412')} {...S} strokeWidth={0.6} />
    <path d="M30 120 Q40 88 100 86 Q160 88 170 120 Q166 150 100 192 Q34 150 30 120 Z" fill={f(c, '#ff8a3d')} {...S} />
    <path d="M44 136 Q70 150 100 192 Q130 150 156 136 Q140 168 100 192 Q60 168 44 136 Z" fill={f(c, '#fff')} {...S} strokeWidth={0.7} />
    <ellipse cx={100} cy={184} rx={7} ry={5} fill={f(c, '#111')} {...S} />
  </g>],
  butterfly: ['🦋', 'פרפר', c => <g>
    <path d="M100 120 Q80 70 34 78 Q14 104 40 136 Q20 166 56 176 Q84 172 100 146 Z" fill={f(c, '#6cb8ff')} {...S} />
    <path d="M100 120 Q120 70 166 78 Q186 104 160 136 Q180 166 144 176 Q116 172 100 146 Z" fill={f(c, '#ff8fab')} {...S} />
    {[-1, 1].map(s => <g key={s}><circle cx={100 + s * 50} cy={100} r={6} fill={f(c, '#ffd23f')} {...S} strokeWidth={0.6} /><circle cx={100 + s * 44} cy={164} r={5} fill={f(c, '#ffd23f')} {...S} strokeWidth={0.6} /></g>)}
    <ellipse cx={100} cy={136} rx={5} ry={30} fill={f(c, '#3a2412')} {...S} />
    <path d="M98 108 Q90 86 82 80 M102 108 Q110 86 118 80" fill="none" {...S} />
  </g>],
  hero: ['🦸', 'גיבור-על', c => <g>
    <path d="M26 128 Q30 104 64 108 Q90 112 100 122 Q110 112 136 108 Q170 104 174 128 Q176 152 140 156 Q114 158 100 144 Q86 158 60 156 Q24 152 26 128 Z" fill={f(c, '#e63946')} {...S} />
    <path d="M100 98 L104 108 L114 108 L106 114 L109 124 L100 118 L91 124 L94 114 L86 108 L96 108 Z" fill={f(c, '#ffd23f')} {...S} strokeWidth={0.7} />
  </g>],
  unicorn: ['🦄', 'חד-קרן', c => <g>
    <path d="M92 92 L100 30 L108 92 Z" fill={f(c, '#ffd23f')} {...S} />
    {[0, 1, 2, 3].map(i => <line key={i} x1={93 + i * 1.5} y1={84 - i * 14} x2={107 - i * 1.5} y2={78 - i * 14} {...S} strokeWidth={0.6} />)}
    {[-1, 1].map(s => <path key={s} d={`M${100 + s * 40} 104 L${100 + s * 50} 70 L${100 + s * 60} 108 Z`} fill={f(c, '#fff')} {...S} />)}
    <ellipse cx={100} cy={140} rx={66} ry={50} fill={f(c, '#fff')} {...S} />
    {['#ff8fab', '#a98bff', '#6cb8ff', '#7dd87a'].map((col, i) => <circle key={i} cx={150 + (i % 2) * 10} cy={98 + i * 14} r={10} fill={f(c, col)} {...S} />)}
    {[-1, 1].map(s => <circle key={s} cx={100 + s * 40} cy={160} r={7} fill={f(c, '#ffc2d1')} stroke="none" />)}
    <path d="M88 168 Q100 178 112 168" fill="none" {...S} />
  </g>],
}

function MaskSheet({ id, color }) {
  const [, name, draw] = MASKS[id]
  return <Sheet label={`מסכת ${name} לגזירה`}>
    <T x={100} y={16} size={9} weight={800}>מסכת {name}</T>
    <T x={100} y={26} size={5} fill="#444">{color ? 'גוזרים לאורך הקו השחור' : 'צובעים, ואז גוזרים לאורך הקו השחור'}</T>
    <g transform="translate(0 30)">{draw(color)}<Eyes dx={id === 'owl' ? 24 : 24} /><Holes /></g>
    <rect x={14} y={236} width={172} height={24} rx={5} fill="#fff" stroke="#111" strokeWidth={0.5} strokeDasharray="2 1.5" />
    <T x={100} y={245} size={4.6}>1. גוזרים את המסכה · 2. גוזרים את העיניים לאורך הקו המקווקו (בעזרת מבוגר)</T>
    <T x={100} y={254} size={4.6}>3. מנקבים את שני העיגולים בצדדים ומשחילים גומי — או מדביקים מקל מתחת</T>
  </Sheet>
}

export function PurimMasks() {
  const [pick, setPick] = useState('all')
  const [color, setColor] = useState('color')
  const ids = pick === 'all' ? Object.keys(MASKS) : [pick]
  const pages = ids.map(id => ({ key: id, svg: <MaskSheet id={id} color={color === 'color'} /> }))
  return <PrintableShell path="/printables/purim-masks" emoji="🎭" h1="מסכות לפורים להדפסה"
    seoTitle="מסכות לפורים להדפסה — חיות לגזירה ולצביעה"
    description="מסכות לפורים להדפסה בחינם: חתול, אריה, ארנב, דוב, ינשוף, שועל, פרפר, גיבור-על וחד-קרן. בצבע או לצביעה, עם חורי עיניים וגומי — דף A4 לכל מסכה."
    sub="9 מסכות לגזירה — צבעוניות או לצביעה, דף A4 לכל מסכה"
    crumbs={[{ label: 'חגים', href: '/printables?topic=holidays' }]}
    controls={<>
      <Choice label="איזו מסכה" value={pick} onChange={setPick} options={[['all', '🎭 כל 9 המסכות'], ...Object.entries(MASKS).map(([k, [e, n]]) => [k, `${e} ${n}`])]} />
      <Choice label="צבע" value={color} onChange={setColor} options={[['color', '🌈 צבעוניות'], ['bw', '🖍️ לצביעה']]} />
    </>}
    pages={pages} printTitle="מסכות לפורים"
    paragraphs={['מסכות להדפסה הן התחפושת הכי מהירה לפורים: מדפיסים, גוזרים ומחברים גומי — ובתוך עשר דקות יש מסכה. הן מתאימות למסיבת פורים בגן, לתחפושת ברגע האחרון, או כפעילות יצירה בבית ובכיתה.', 'במצב "לצביעה" המסכות מודפסות בקו שחור בלבד, והילדים צובעים ומקשטים בעצמם — עם טושים, נצנצים, נוצות או מדבקות. מומלץ להדפיס על בריסטול או נייר עבה כדי שהמסכה תחזיק כל הערב.', 'את חורי העיניים כדאי שמבוגר יגזור, עם מספריים קטנים או סכין יצירה. אם אין גומי, אפשר להדביק מקל ארטיק או קש בצד ולהחזיק את המסכה ביד.']}
    faq={[{ q: 'על איזה נייר כדאי להדפיס מסכות?', a: 'בריסטול או נייר 160–200 גרם. על נייר רגיל המסכה נקרעת מהר — אפשר להדביק אותה על קרטון דק אחרי ההדפסה.' }, { q: 'באיזה גודל המסכות?', a: 'כל מסכה ממלאת את רוחב דף A4 ומתאימה לפנים של ילד. למבוגרים אפשר להגדיל ב-110% בחלון ההדפסה.' }, { q: 'איך מחברים את המסכה לראש?', a: 'מנקבים את שני העיגולים הקטנים בצדדים ומשחילים גומי כובע, או מדביקים מקל מתחת למסכה.' }]}
    related={[{ label: 'דפי צביעה לפורים', href: '/holidays/purim/coloring' }, { label: 'כתר להדפסה', href: '/printables/birthday-crown' }, { label: 'אביזרי צילום', href: '/printables/photo-props' }]} />
}

// ── Birthday crown ──────────────────────────────────────────────
const CROWN_COLORS = { gold: ['#ffd23f', '#ff8fab', '#6cb8ff'], pink: ['#ff8fab', '#ffd23f', '#a98bff'], blue: ['#6cb8ff', '#ffd23f', '#7dd87a'] }

function crownTop(style, x, y, w, h) {
  const n = 5, step = w / n
  if (style === 'round') return Array.from({ length: n }, (_, i) => `Q${x + w - (i + 0.5) * step} ${y - h} ${x + w - (i + 1) * step} ${y}`).join(' ')
  if (style === 'stars') return Array.from({ length: n }, (_, i) => { const a = x + w - i * step, b = a - step; return `L${a - step * 0.2} ${y - h * 0.45} L${a - step * 0.5} ${y - h} L${b + step * 0.2} ${y - h * 0.45} L${b} ${y}` }).join(' ')
  return Array.from({ length: n }, (_, i) => { const a = x + w - i * step; return `L${a - step / 2} ${y - h} L${a - step} ${y}` }).join(' ')
}

function CrownSheet({ name, age, style, colorId }) {
  const col = colorId === 'bw' ? null : CROWN_COLORS[colorId]
  const x = 8, w = 184, base = 95, h = 36
  const d = `M${x + w} ${base + 30} L${x + w} ${base} ${crownTop(style, x, base, w, h)} L${x} ${base + 30} Z`
  const gems = Array.from({ length: 5 }, (_, i) => x + w - (i + 0.5) * (w / 5))
  const line2 = age ? `חוגג/ת ${age}` : 'יום הולדת שמח'
  return <Sheet label="כתר יום הולדת לגזירה">
    <T x={100} y={16} size={9} weight={800}>כתר יום הולדת</T>
    <T x={100} y={26} size={5} fill="#444">גוזרים את שלושת החלקים ומחברים אותם בסיכות או בדבק לפי גודל הראש</T>
    <path d={d} fill={col ? col[0] : '#fff'} stroke="#111" strokeWidth={1.1} strokeLinejoin="round" />
    {gems.map((gx, i) => style === 'stars'
      ? <circle key={i} cx={gx} cy={base - h * 0.55} r={3.2} fill={col ? col[1 + (i % 2)] : '#fff'} stroke="#111" strokeWidth={0.6} />
      : <circle key={i} cx={gx} cy={base - h + 7} r={3.6} fill={col ? col[1 + (i % 2)] : '#fff'} stroke="#111" strokeWidth={0.6} />)}
    <T x={100} y={base + 13} size={name.length > 10 ? 9 : 11} weight={800}>{name || '_______________'}</T>
    <T x={100} y={base + 24} size={6.5} weight={700}>{line2}</T>
    {[0, 1].map(i => { const y = 150 + i * 46; return <g key={i}>
      <rect x={x} y={y} width={w} height={26} fill={col ? col[0] : '#fff'} stroke="#111" strokeWidth={1.1} />
      {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={x + 26 + k * 19} cy={y + 13} r={3} fill={col ? col[1 + (k % 2)] : '#fff'} stroke="#111" strokeWidth={0.5} />)}
      <rect x={i ? x + w - 12 : x} y={y} width={12} height={26} fill="#e9e9e9" stroke="#111" strokeWidth={0.5} strokeDasharray="1.5 1" />
      <T x={i ? x + w - 6 : x + 6} y={y + 15} size={3.4} fill="#555">הדבקה</T>
      <T x={100} y={y + 33} size={4} fill="#555">רצועה {i + 1} — מחברים לצד של הכתר</T>
    </g> })}
    <T x={100} y={252} size={4.6}>טיפ: מדפיסים על בריסטול. אם הכתר קטן — מוסיפים רצועת נייר באמצע הגב.</T>
  </Sheet>
}

export function BirthdayCrown() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [style, setStyle] = useState('points')
  const [colorId, setColor] = useState('gold')
  return <PrintableShell path="/printables/birthday-crown" emoji="👑" h1="כתר יום הולדת להדפסה"
    seoTitle="כתר יום הולדת להדפסה — עם שם הילד והגיל"
    description="כתר יום הולדת להדפסה בחינם: כותבים את שם החוגג/ת והגיל, בוחרים צורה וצבע ומדפיסים כתר לגזירה בשלושה חלקים. מתאים לגן, לכיתה ולמסיבה בבית."
    sub="כותבים שם וגיל — וגוזרים כתר אמיתי לחוגג/ת"
    crumbs={[{ label: 'ליום הולדת', href: '/printables?topic=birthday' }]}
    controls={<>
      <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
        <Field label="שם החוגג/ת" value={name} onChange={setName} placeholder="למשל: נועה" maxLength={14} />
        <Field label="גיל (לא חובה)" value={age} onChange={setAge} placeholder="למשל: 6" maxLength={3} />
      </div>
      <Choice label="צורה" value={style} onChange={setStyle} options={[['points', '👑 שפיצים'], ['round', '🌊 מעוגל'], ['stars', '⭐ כוכבים']]} />
      <Choice label="צבע" value={colorId} onChange={setColor} options={[['gold', '💛 זהב'], ['pink', '🩷 ורוד'], ['blue', '💙 כחול'], ['bw', '🖍️ לצביעה']]} />
    </>}
    pages={[{ key: 'crown', svg: <CrownSheet name={name} age={age} style={style} colorId={colorId} /> }]}
    paragraphs={['כתר יום הולדת הוא המסורת הכי אהובה בגן ובכיתה: החוגג או החוגגת יושבים במרכז עם כתר על הראש, וכולם שרים. כאן מכינים כתר אישי בדקה — כותבים את השם והגיל, בוחרים צורה וצבע, ומדפיסים.', 'הכתר מודפס בשלושה חלקים: חלק קדמי עם השם, ושתי רצועות שמתחברות לצדדים. כך הוא מתאים לכל גודל ראש — מחברים את הרצועות מאחור בסיכות או בדבק, ומקצרים לפי הצורך.', 'במצב "לצביעה" הכתר מודפס בקו שחור, והילדים יכולים לקשט אותו בעצמם כפעילות פתיחה למסיבה. מדפיסים על בריסטול כדי שהכתר יחזיק.']}
    faq={[{ q: 'איך מתאימים את הכתר לגודל הראש?', a: 'מחברים את הרצועות לצדדי הכתר, מודדים סביב הראש ומחברים מאחור בסיכה. אם חסר — מוסיפים רצועת נייר נוספת.' }, { q: 'אפשר להדפיס כתר לכל ילדי הגן?', a: 'כן. משנים את השם ומדפיסים שוב לכל ילד, או מדפיסים כתר בלי שם וכל ילד כותב את שמו.' }]}
    related={[{ label: 'מסכות להדפסה', href: '/printables/purim-masks' }, { label: 'שלטי יום הולדת', href: '/printables/birthday-signs' }, { label: 'אביזרי צילום', href: '/printables/photo-props' }, { label: 'משחקים ליום הולדת', href: '/games/birthday' }]} />
}
