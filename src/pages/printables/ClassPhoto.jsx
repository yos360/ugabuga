import { useEffect, useRef, useState } from 'react'
import PrintableShell, { Sheet, Choice, Field } from '../../components/printables/PrintableShell'
import { DECOR } from './classPhotoArt'
import { shrinkPhoto } from '../../utils/shrinkPhoto'

// Class photo builder ("תמונת מחזור"): one sheet with the institution, a title, staff boxes
// (teacher, principal, counsellor… add as many as needed) and a framed photo + name for every child.
// Each occasion (Hanukkah in kindergarten, end of school, graduation, army course…) has its own page
// and starting design, and everything — texts, fonts, colours, frames, decorations — can be changed.
// A slot with no photo prints as an empty frame to glue a printed photo into.
// Photos are shrunk and kept in this browser tab only.

const THEMES = {
  'hanukkah-night': { label: '🕎 לילה של חנוכה', bg: ['#0b1f4d', '#1d3f8f'], title: '#ffd45c', text: '#dbe6ff', name: '#ffffff', frame: '#ffd45c', slot: '#e8eefc', deco: 'hanukkahNight' },
  'hanukkah-sufganiyot': { label: '🍩 סופגניות', bg: ['#fff7e8', '#ffe2c0'], title: '#b5451b', text: '#6b3a1f', name: '#3b2414', frame: '#e08a3c', slot: '#ffffff', deco: 'sufganiyot' },
  'hanukkah-dreidels': { label: '🎲 סביבונים', bg: ['#eef6ff', '#ffffff'], title: '#1d4ed8', text: '#1e3a8a', name: '#1e293b', frame: '#3b82f6', slot: '#ffffff', deco: 'dreidels' },
  balloons: { label: '🎈 בלונים ולבבות', bg: ['#fffbea', '#fff0f6'], title: '#e0457b', text: '#7a2e4d', name: '#3a1f2b', frame: '#ff8fab', slot: '#ffffff', deco: 'balloons' },
  school: { label: '✏️ בית ספר', bg: ['#ffffff', '#effaf3'], title: '#15803d', text: '#14532d', name: '#1f2937', frame: '#22c55e', slot: '#ffffff', deco: 'pencils' },
  graduation: { label: '🎓 בוגרים', bg: ['#111827', '#1f2a44'], title: '#f5c542', text: '#e5e7eb', name: '#ffffff', frame: '#f5c542', slot: '#e5e7eb', deco: 'caps' },
  army: { label: '🎖️ זית וזר דפנה', bg: ['#f3f1e4', '#e2dfc4'], title: '#4b5320', text: '#3f4520', name: '#2b2f16', frame: '#6b7a2a', slot: '#ffffff', deco: 'laurel' },
  classic: { label: '🤍 קלאסי ונקי', bg: ['#ffffff', '#ffffff'], title: '#1f2937', text: '#4b5563', name: '#111827', frame: '#b08d3c', slot: '#ffffff', deco: 'classic' },
}

const SHAPES = [['circle', '⚪ עיגול'], ['rounded', '▢ ריבוע מעוגל'], ['square', '⬜ ריבוע'], ['heart', '🤍 לב']]
const FONTS = [['Heebo', 'רגיל'], ['Fredoka', 'עגול ושמח'], ['KtavYad', 'כתב יד'], ['Stam', 'סת״ם']]

const OCCASIONS = {
  'hanukkah-gan': {
    path: '/printables/class-photo/hanukkah', label: '🕎 חנוכה בגן', emoji: '🕎', theme: 'hanukkah-night', shape: 'circle', font: 'Fredoka',
    school: 'גן החבצלות', title: 'חנוכה שמח!', subtitle: 'ילדי הגן · חנוכה תשפ״ז', footer: 'שיהיה לכולנו חג מלא אור', staff: ['הגננת', 'הסייעת'], count: 24, who: 'ילדי הגן',
    h1: 'תמונת מחזור לחנוכה בגן', seoTitle: 'תמונת מחזור לחנוכה לגן — עיצוב והדפסה בחינם',
    description: 'מעצבים תמונת מחזור לחנוכה לגן: מכניסים את התמונות והשמות של כל הילדים, הגננת והסייעת, בוחרים עיצוב עם חנוכייה, סביבונים או סופגניות, ומדפיסים בחינם.',
    sub: 'כל ילדי הגן בדף אחד, עם חנוכייה, סביבונים וסופגניות',
  },
  gan: {
    path: '/printables/class-photo/kindergarten', label: '🎈 סיום גן', emoji: '🎈', theme: 'balloons', shape: 'heart', font: 'Fredoka',
    school: 'גן הדקל', title: 'להתראות גן!', subtitle: 'מחזור תשפ״ז', footer: 'היה לנו כיף ביחד!', staff: ['הגננת', 'הסייעת'], count: 28, who: 'ילדי הגן',
    h1: 'תמונת מחזור לגן', seoTitle: 'תמונת מחזור לגן להדפסה — סיום שנה, עם תמונות ושמות',
    description: 'תמונת מחזור לסיום גן שמעצבים לבד: תמונה ושם לכל ילד, קוביות לגננת ולסייעת, לבבות או עיגולים, צבעים וגופנים לבחירה. חינם, בלי הרשמה.',
    sub: 'לסוף השנה: כל הילדים, הגננת והסייעת בדף מעוצב אחד',
  },
  class: {
    path: '/printables/class-photo', label: '✏️ כיתה בבית ספר', emoji: '📸', theme: 'school', shape: 'rounded', font: 'Heebo',
    school: 'בית ספר הרימון', title: 'כיתה ג׳2', subtitle: 'שנת הלימודים תשפ״ז', footer: 'ביחד אנחנו כיתה אחת', staff: ['המחנכת', 'מנהל בית הספר', 'היועצת'], count: 30, who: 'התלמידים',
    h1: 'תמונת מחזור לכיתה', seoTitle: 'תמונת מחזור להדפסה — מעצבים לבד לכיתה, לגן ולסיום',
    description: 'מחולל תמונת מחזור בחינם: שם בית הספר, המחנכת, המנהל והיועצת, ותמונה ושם לכל תלמיד. בוחרים עיצוב, צורת מסגרת, גופן וצבעים ומדפיסים.',
    sub: 'שם בית הספר, הצוות וכל התלמידים — וכל פרט ניתן לשינוי',
  },
  graduation: {
    path: '/printables/class-photo/graduation', label: '🎓 סיום תיכון', emoji: '🎓', theme: 'graduation', shape: 'circle', font: 'Heebo',
    school: 'תיכון הגליל', title: 'מחזור כ״ט', subtitle: 'בוגרי י״ב 3 · תשפ״ז', footer: 'יוצאים לדרך — ביחד', staff: ['המחנכת', 'רכזת השכבה', 'מנהלת התיכון'], count: 34, who: 'הבוגרים',
    h1: 'תמונת מחזור לסיום תיכון', seoTitle: 'תמונת מחזור לסיום י״ב — עיצוב בוגרים להדפסה',
    description: 'תמונת מחזור לבוגרי תיכון: כל הכיתה בדף אחד עם שמות, המחנכת, רכזת השכבה והמנהלת, עיצוב כהה עם זהב או קלאסי. מעצבים ומדפיסים בחינם.',
    sub: 'כל הבוגרים, המחנכת וההנהלה — לספר המחזור או למסגרת',
  },
  ulpana: {
    path: '/printables/class-photo/ulpana', label: '📖 אולפנה וישיבה', emoji: '📖', theme: 'classic', shape: 'rounded', font: 'Heebo',
    school: 'אולפנת אורות', title: 'מחזור ח׳', subtitle: 'בוגרות תשפ״ז', footer: 'ממשיכות באור', staff: ['המחנכת', 'ראש האולפנה', 'האם הבית'], count: 32, who: 'הבוגרות',
    h1: 'תמונת מחזור לאולפנה ולישיבה', seoTitle: 'תמונת מחזור לאולפנה ולישיבה — מעצבים ומדפיסים',
    description: 'תמונת מחזור מעוצבת לאולפנה, לישיבה תיכונית ולמדרשה: שם המוסד, הצוות והבוגרות או הבוגרים עם תמונה ושם. עיצוב קלאסי ונקי, להדפסה בחינם.',
    sub: 'עיצוב קלאסי לבוגרות ולבוגרים, עם הצוות ושם המוסד',
  },
  mechina: {
    path: '/printables/class-photo/mechina', label: '🏕️ מכינה ושנת שירות', emoji: '🏕️', theme: 'army', shape: 'circle', font: 'Heebo',
    school: 'מכינת הגליל', title: 'מחזור 12', subtitle: 'חניכי תשפ״ז', footer: 'שנה אחת, חברים לכל החיים', staff: ['ראש המכינה', 'רכז המחזור', 'רכזת החינוך'], count: 36, who: 'החניכים',
    h1: 'תמונת מחזור למכינה ולשנת שירות', seoTitle: 'תמונת מחזור למכינה קדם צבאית ולשנת שירות',
    description: 'מעצבים תמונת מחזור למכינה, לשנת שירות או לגרעין: כל החניכים עם תמונה ושם, הצוות בקוביות משלו, זר דפנה וכוכבים. חינם להדפסה.',
    sub: 'כל המחזור בדף אחד — חניכים, צוות ושם המכינה',
  },
  army: {
    path: '/printables/class-photo/army-course', label: '🎖️ סיום קורס בצבא', emoji: '🎖️', theme: 'army', shape: 'square', font: 'Heebo',
    school: 'גדוד 50', title: 'סיום קורס מ״כים', subtitle: 'מחזור מרץ 2027', footer: 'יחד עד הסוף', staff: ['מפקד הקורס', 'מפקדת המחלקה', 'הסמל'], count: 30, who: 'החניכים',
    h1: 'תמונת מחזור לסיום קורס בצבא', seoTitle: 'תמונת מחזור לסיום קורס וטירונות — מעצבים בחינם',
    description: 'תמונת מחזור לסיום קורס, טירונות או מסלול: שם היחידה, המפקדים בקוביות נפרדות וכל החניכים עם תמונה ושם. עיצוב זית עם זר דפנה, להדפסה ולמסגור.',
    sub: 'לסיום קורס, טירונות או מסלול — עם המפקדים וכל החניכים',
  },
}
const SIBLINGS = Object.values(OCCASIONS).map(o => ({ href: o.path, label: o.label }))

let uid = 0
const nextId = () => ++uid
const makeKids = n => Array.from({ length: n }, () => ({ id: nextId(), name: '', photo: '' }))
const hasHebrew = s => /[א-ת]/.test(s)
// Width of a Hebrew string in SVG units, roughly, for fitting it into a box.
const fitSize = (text, maxW, max) => Math.min(max, maxW / Math.max(1, [...(text || '')].length * 0.55))

// Frame shapes in a 0–1 box: used both to clip the photo and to draw the frame line.
function Shape({ shape, ...rest }) {
  if (shape === 'circle') return <circle cx={0.5} cy={0.5} r={0.5} {...rest} />
  if (shape === 'heart') return <path d="M.5 .97 C.18 .76 0 .56 0 .32 C0 .14 .14 0 .3 0 C.4 0 .47 .06 .5 .15 C.53 .06 .6 0 .7 0 C.86 0 1 .14 1 .32 C1 .56 .82 .76 .5 .97Z" {...rest} />
  return <rect width={1} height={1} rx={shape === 'rounded' ? 0.16 : 0.02} {...rest} />
}

function Slot({ x, y, s, photo, shape, frame, slot, id }) {
  const sw = 1.1 / s
  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)})`}>
      <clipPath id={id} clipPathUnits="userSpaceOnUse"><Shape shape={shape} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width={1} height={1} fill={slot} />
        {photo
          ? <image href={photo} width={1} height={1} preserveAspectRatio="xMidYMid slice" />
          : <g fill="#c9d1dc"><circle cx={0.5} cy={0.4} r={0.16} /><ellipse cx={0.5} cy={0.95} rx={0.3} ry={0.28} /></g>}
      </g>
      <Shape shape={shape} fill="none" stroke={frame} strokeWidth={sw * 1.6} />
    </g>
  )
}

// Best grid for n slots in a w×h box: the column count that gives the biggest photos.
function grid(n, w, h, cap) {
  let best = { cols: 1, s: 0 }
  for (let cols = 1; cols <= Math.min(n, 10); cols++) {
    const rows = Math.ceil(n / cols), cw = w / cols, ch = h / rows
    const s = Math.min(cw * 0.84, (ch - 2) / 1.24, cap)
    if (s > best.s) best = { cols, s, rows, cw, ch }
  }
  return best
}

function ClassSheet({ page, pageIndex, pages, o }) {
  const t = THEMES[o.theme], deco = DECOR[t.deco]
  const colors = { title: o.titleColor || t.title, name: o.nameColor || t.name, frame: o.frameColor || t.frame, text: o.titleColor ? o.titleColor : t.text }
  const bgId = `cp-bg-${o.theme}`
  const staff = pageIndex === 0 ? o.staff.filter(m => m.role || m.name || m.photo) : []
  const titleSize = fitSize(o.title, 112, 15)
  let y0 = 66
  const nodes = []
  if (staff.length) {
    const s = Math.min(26, 150 / staff.length * 0.72), gap = Math.min(150 / staff.length, s * 1.9)
    staff.forEach((m, i) => {
      const cx = 100 + (i - (staff.length - 1) / 2) * gap
      nodes.push(<g key={'st' + m.id}>
        <Slot id={`cp-s-${pageIndex}-${i}`} x={cx - s / 2} y={y0} s={s} photo={m.photo} shape={o.shape} frame={colors.frame} slot={t.slot} />
        <text x={cx} y={y0 + s + 5} fontSize={fitSize(m.name, gap * 0.95, 5)} textAnchor="middle" fontWeight={800} fill={colors.name} direction="rtl">{m.name}</text>
        <text x={cx} y={y0 + s + 10} fontSize={fitSize(m.role, gap * 0.95, 3.8)} textAnchor="middle" fill={colors.text} direction="rtl">{m.role}</text>
      </g>)
    })
    y0 += s + 15
  }
  const top = y0, bottom = 246, n = page.length
  if (n) {
    const g = grid(n, 180, bottom - top, staff.length ? 30 : 36)
    page.forEach((k, i) => {
      const row = Math.floor(i / g.cols), inRow = row === g.rows - 1 ? n - row * g.cols : g.cols
      const col = i % g.cols
      // RTL: the first child sits on the right; a short last row is centred.
      const cx = 100 + ((inRow - 1) / 2 - col) * g.cw
      const cy = top + row * g.ch + (g.ch - g.s * 1.24) / 2
      const nameSize = fitSize(k.name, g.cw * 0.94, Math.max(2.8, Math.min(5.4, g.s * 0.17)))
      nodes.push(<g key={k.id}>
        <Slot id={`cp-k-${pageIndex}-${i}`} x={cx - g.s / 2} y={cy} s={g.s} photo={k.photo} shape={o.shape} frame={colors.frame} slot={t.slot} />
        {k.name && <text x={cx} y={cy + g.s + nameSize + 0.8} fontSize={nameSize} textAnchor="middle" fontWeight={700} fill={colors.name} direction="rtl">{k.name}</text>}
      </g>)
    })
  }
  return (
    <Sheet label={`${o.title} — ${o.school}`}>
      <defs><linearGradient id={bgId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={o.bgColor || t.bg[0]} /><stop offset="1" stopColor={o.bgColor || t.bg[1]} /></linearGradient></defs>
      <rect width={200} height={270} fill={`url(#${bgId})`} />
      <rect x={4} y={4} width={192} height={262} rx={5} fill="none" stroke={colors.frame} strokeWidth={0.8} />
      <g fontFamily={`${o.font}, Heebo, Arial, sans-serif`}>
        {o.buga ? <image href="/images/home-mascot-class.webp" x={5} y={8} width={44} height={48} preserveAspectRatio="xMidYMid meet" /> : deco.corner('l')}
        {deco.corner('r')}
        {o.school && <text x={100} y={17} fontSize={fitSize(o.school, 110, 7)} textAnchor="middle" fontWeight={700} fill={colors.text} direction="rtl">{o.school}</text>}
        <text x={100} y={36} fontSize={titleSize} textAnchor="middle" fontWeight={900} fill={colors.title} direction="rtl">{o.title}</text>
        {o.subtitle && <text x={100} y={47} fontSize={fitSize(o.subtitle, 110, 6)} textAnchor="middle" fontWeight={600} fill={colors.text} direction="rtl">{o.subtitle}{pages > 1 ? ` · דף ${pageIndex + 1} מתוך ${pages}` : ''}</text>}
        <line x1={64} x2={136} y1={53} y2={53} stroke={colors.frame} strokeWidth={0.6} />
        {nodes}
        {deco.footer()}
        {o.footer && <text x={100} y={259} fontSize={fitSize(o.footer, 110, 6)} textAnchor="middle" fontWeight={700} fill={colors.title} direction="rtl">{o.footer}</text>}
      </g>
    </Sheet>
  )
}

function PhotoButton({ photo, onPick, label, size = 'h-14 w-14' }) {
  const ref = useRef()
  return (
    <button type="button" onClick={() => ref.current?.click()} aria-label={label}
      className={`${size} shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-slate-400 bg-white text-xl`}>
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : '📷'}
      <input ref={ref} className="sr-only" type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; const u = await shrinkPhoto(f); if (u) onPick(u) }} />
    </button>
  )
}

const box = 'rounded-2xl border-2 border-[var(--border)] bg-white/70 p-3 space-y-3'
const h2 = 'text-center text-xl font-black'

export default function ClassPhoto({ occasion = 'class' }) {
  const p = OCCASIONS[occasion]
  const [theme, setTheme] = useState(p.theme)
  const [shape, setShape] = useState(p.shape)
  const [font, setFont] = useState(p.font)
  const [buga, setBuga] = useState(false)
  const [school, setSchool] = useState(p.school)
  const [title, setTitle] = useState(p.title)
  const [subtitle, setSubtitle] = useState(p.subtitle)
  const [footer, setFooter] = useState(p.footer)
  const [colors, setColors] = useState({ titleColor: '', nameColor: '', frameColor: '', bgColor: '' })
  const [staff, setStaff] = useState(() => p.staff.map(role => ({ id: nextId(), role, name: '', photo: '' })))
  const [kids, setKids] = useState(() => makeKids(p.count))
  const [namesText, setNamesText] = useState('')
  const bulkRef = useRef()

  // Free the photos' memory when leaving the page.
  const all = useRef([])
  useEffect(() => { all.current = [...kids, ...staff].map(k => k.photo).filter(Boolean) }, [kids, staff])
  useEffect(() => () => all.current.forEach(u => URL.revokeObjectURL(u)), [])

  const setKid = (id, patch) => setKids(ks => ks.map(k => k.id === id ? { ...k, ...patch } : k))
  const setMember = (id, patch) => setStaff(ss => ss.map(m => m.id === id ? { ...m, ...patch } : m))
  const setCount = n => setKids(ks => n > ks.length ? [...ks, ...makeKids(n - ks.length)] : ks.slice(0, n))

  async function addPhotos(files) {
    const list = [...files].filter(f => f.type.startsWith('image/'))
    const made = []
    for (const f of list) {
      const url = await shrinkPhoto(f)
      const base = f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
      made.push({ url, name: hasHebrew(base) ? base.slice(0, 24) : '' })
    }
    setKids(ks => {
      const next = [...ks]
      for (const m of made) {
        const free = next.findIndex(k => !k.photo)
        if (free >= 0) next[free] = { ...next[free], photo: m.url, name: next[free].name || m.name }
        else next.push({ id: nextId(), photo: m.url, name: m.name })
      }
      return next
    })
  }

  function applyNames() {
    const names = namesText.split(/\n|,/).map(s => s.trim()).filter(Boolean).slice(0, 80)
    if (!names.length) return
    setKids(ks => {
      const next = names.map((name, i) => ks[i] ? { ...ks[i], name } : { id: nextId(), name, photo: '' })
      return [...next, ...ks.slice(names.length).filter(k => k.photo)]
    })
  }

  const o = { theme, shape, font, buga, school, title, subtitle, footer, staff, ...colors }
  const per = kids.length <= 42 ? 42 : 36
  const chunks = []
  for (let i = 0; i < kids.length; i += per) chunks.push(kids.slice(i, i + per))
  if (!chunks.length) chunks.push([])
  const pages = chunks.map((page, i) => ({ key: `p${i}`, svg: <ClassSheet page={page} pageIndex={i} pages={chunks.length} o={o} /> }))
  const t = THEMES[theme]

  const colorInput = (key, label, fallback) => (
    <label className="flex items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-bold">
      {label}
      <span className="flex items-center gap-2">
        <input type="color" value={colors[key] || fallback} onChange={e => setColors(c => ({ ...c, [key]: e.target.value }))} className="h-9 w-12 cursor-pointer" />
        {colors[key] && <button type="button" className="text-sm underline" onClick={() => setColors(c => ({ ...c, [key]: '' }))}>מקורי</button>}
      </span>
    </label>
  )

  return (
    <PrintableShell
      path={p.path} seoTitle={p.seoTitle} description={p.description} emoji={p.emoji} h1={p.h1} sub={p.sub}
      siblings={SIBLINGS} crumbs={[{ label: 'לגננות ולמורים', href: '/printables?topic=teachers' }]}
      pages={pages} printTitle={p.h1}
      controls={<>
        <section className={box}>
          <h2 className={h2}>🎨 עיצוב</h2>
          <Choice label="עיצוב" value={theme} onChange={setTheme} options={Object.entries(THEMES).map(([k, v]) => [k, v.label])} />
          <Choice label="צורת המסגרת" value={shape} onChange={setShape} options={SHAPES} />
          <div role="group" aria-label="גופן" className="flex flex-wrap justify-center gap-2">
            {FONTS.map(([f, l]) => <button key={f} type="button" aria-pressed={font === f} onClick={() => setFont(f)} style={{ fontFamily: `${f}, Heebo` }}
              className={`min-h-[44px] wobbly-sm border-2 border-[var(--border)] px-4 py-2 text-lg font-bold ${font === f ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{l}</button>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {colorInput('titleColor', 'צבע הכותרת', t.title)}
            {colorInput('nameColor', 'צבע השמות', t.name)}
            {colorInput('frameColor', 'צבע המסגרות', t.frame)}
            {colorInput('bgColor', 'צבע הרקע', t.bg[0])}
          </div>
          <Choice label="בוגה" value={buga ? 'yes' : 'no'} onChange={v => setBuga(v === 'yes')} options={[['no', 'בלי בוגה'], ['yes', '🐥 עם בוגה בפינה']]} />
        </section>

        <section className={box}>
          <h2 className={h2}>✍️ כיתובים</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="שם המוסד (גן, בית ספר, יחידה)" value={school} onChange={setSchool} maxLength={40} />
            <Field label="כותרת גדולה" value={title} onChange={setTitle} maxLength={30} />
            <Field label="שורה מתחת לכותרת" value={subtitle} onChange={setSubtitle} maxLength={44} />
            <Field label="משפט בתחתית הדף" value={footer} onChange={setFooter} maxLength={44} />
          </div>
        </section>

        <section className={box}>
          <h2 className={h2}>👩‍🏫 צוות — קובייה לכל אחד</h2>
          {staff.map(m => (
            <div key={m.id} className="flex items-center gap-2">
              <PhotoButton photo={m.photo} onPick={u => setMember(m.id, { photo: u })} label={`תמונה של ${m.role || 'איש צוות'}`} />
              <input value={m.role} maxLength={24} onChange={e => setMember(m.id, { role: e.target.value })} placeholder="תפקיד (למשל: יועצת)" aria-label="תפקיד" className="min-w-0 flex-1 rounded-lg border-2 border-slate-300 px-2 py-2" />
              <input value={m.name} maxLength={24} onChange={e => setMember(m.id, { name: e.target.value })} placeholder="שם" aria-label={`שם ${m.role}`} className="min-w-0 flex-1 rounded-lg border-2 border-slate-300 px-2 py-2" />
              <button type="button" aria-label={`הסרת ${m.role || 'הקובייה'}`} onClick={() => setStaff(ss => ss.filter(x => x.id !== m.id))} className="h-10 w-10 shrink-0 rounded-full border-2 border-slate-300 bg-white font-bold">✕</button>
            </div>
          ))}
          {staff.length < 8 && <button type="button" onClick={() => setStaff(ss => [...ss, { id: nextId(), role: '', name: '', photo: '' }])} className="w-full rounded-xl border-2 border-dashed border-slate-400 bg-white py-2 font-bold">＋ הוספת קובייה (יועצת, מורה, מפקד...)</button>}
        </section>

        <section className={box}>
          <h2 className={h2}>📸 {p.who} — תמונה ושם</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => bulkRef.current?.click()} className="min-h-[48px] rounded-xl bg-sky-600 px-4 py-2 font-bold text-white">📷 הוספת הרבה תמונות בבת אחת</button>
            <input ref={bulkRef} className="sr-only" type="file" accept="image/*" multiple onChange={e => { const f = e.target.files; addPhotos(f); e.target.value = '' }} />
            <label className="flex items-center gap-2 font-bold">כמה משבצות
              <input type="number" min={1} max={80} value={kids.length} onChange={e => setCount(Math.max(1, Math.min(80, Number(e.target.value) || 1)))} className="w-20 rounded-lg border-2 border-slate-300 px-2 py-2 text-center" />
            </label>
          </div>
          <p className="text-center text-sm text-slate-600">משבצת בלי תמונה מודפסת כמסגרת ריקה — אפשר להדביק בה תמונה מודפסת. אם שם הקובץ בעברית (למשל ״נועה.jpg״), הוא נכנס כשם. התמונות נשארות רק במכשיר שלכם.</p>
          <details className="rounded-xl bg-white p-2">
            <summary className="cursor-pointer font-bold">📋 להדביק רשימת שמות מוכנה</summary>
            <textarea value={namesText} onChange={e => setNamesText(e.target.value)} rows={5} placeholder={'שם בכל שורה, למשל:\nנועה כהן\nאיתי לוי'} className="mt-2 w-full rounded-lg border-2 border-slate-300 p-2" />
            <button type="button" onClick={applyNames} className="mt-1 w-full rounded-lg bg-[var(--yellow)] py-2 font-bold">הכנסת השמות לפי הסדר</button>
          </details>
          <div className="grid gap-2 sm:grid-cols-2">
            {kids.map((k, i) => (
              <div key={k.id} className="flex items-center gap-2">
                <span className="w-6 text-center text-sm font-bold text-slate-500">{i + 1}</span>
                <PhotoButton photo={k.photo} onPick={u => setKid(k.id, { photo: u })} label={`תמונה ${i + 1}${k.name ? ' של ' + k.name : ''}`} size="h-12 w-12" />
                <input value={k.name} maxLength={24} onChange={e => setKid(k.id, { name: e.target.value })} placeholder="שם" aria-label={`שם ${i + 1}`} className="min-w-0 flex-1 rounded-lg border-2 border-slate-300 px-2 py-2" />
                <button type="button" aria-label={`הסרת משבצת ${i + 1}`} onClick={() => setKids(ks => ks.filter(x => x.id !== k.id))} className="h-9 w-9 shrink-0 rounded-full border-2 border-slate-300 bg-white text-sm font-bold">✕</button>
              </div>
            ))}
          </div>
        </section>
      </>}
      paragraphs={[
        `${p.h1}: מכניסים את שם המוסד, כותרת ושורת משנה, קובייה לכל איש צוות — עם תפקיד, שם ותמונה — ותמונה ושם לכל אחד מ${p.who}. הדף מסדר את כולם לבד בטבלה מאוזנת, מהימין לשמאל, וממרכז את השורה האחרונה.`,
        'אפשר לשנות הכול: שמונה עיצובים (חנוכה עם חנוכייה, סביבונים או סופגניות, בלונים ולבבות לגן, בית ספר, בוגרים בשחור וזהב, זית וזר דפנה, וקלאסי), ארבע צורות מסגרת, ארבעה גופנים, וצבעים לכותרת, לשמות, למסגרות ולרקע. אפשר גם להוסיף את בוגה בפינה.',
        'אין חובה להעלות תמונות. משבצת ריקה מודפסת כמסגרת עם צללית — מדפיסים את הדף ומדביקים בכל מסגרת תמונה מודפסת או גזורה. כשיש יותר מ־42 משתתפים, הדף מתחלק אוטומטית לכמה עמודים.',
        'התמונות מוקטנות ונשארות בדפדפן שלכם בלבד; שום תמונה לא נשלחת לאתר. כך אפשר לבנות תמונת מחזור לגן או לכיתה בלי לשתף תמונות של ילדים עם אף אחד.',
      ]}
      faq={[
        { q: 'צריך להעלות תמונות של כל הילדים?', a: 'לא. משבצת בלי תמונה מודפסת כמסגרת ריקה, ואפשר להדביק בה תמונה מודפסת אחרי ההדפסה. אפשר גם לשלב — חלק עם תמונות וחלק ריקות.' },
        { q: 'התמונות נשמרות באתר?', a: 'לא. התמונות מוקטנות בתוך הדפדפן ונשארות במכשיר שלכם בלבד. כשסוגרים את הדף הן נמחקות.' },
        { q: 'אפשר להוסיף יועצת, מורה מקצועית או מפקד?', a: 'כן. לוחצים על "הוספת קובייה", כותבים תפקיד ושם ומוסיפים תמונה. אפשר עד שמונה קוביות צוות, וכל אחת ניתנת למחיקה.' },
        { q: 'כמה ילדים נכנסים בדף?', a: 'עד 42 בדף אחד, והגודל של כל תמונה מחושב לפי המספר. כשיש יותר, הדף מתחלק לכמה עמודים עם אותה כותרת.' },
        { q: 'איך מקבלים קובץ PDF?', a: 'לוחצים על "הדפסה או PDF" ובוחרים בחלון ההדפסה "שמירה כ-PDF". את הקובץ אפשר לשלוח לקבוצת ההורים או לבית דפוס.' },
      ]}
      related={[{ label: 'יומן גן אישי', href: '/printables/kindergarten-memory-book' }, { label: 'עיתון כיתה', href: '/printables/class-newspaper' }, { label: 'מסיבת סיום גן', href: '/ideas/kindergarten-graduation' }, { label: 'חנוכה', href: '/holidays/hanukkah' }]}
    />
  )
}
