import { useMemo, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { ICONS, ICON_CATS, iconById } from './shirtArt'

// Shirt graphic designer: end of basic training, beret march, course graduation, grade 12, grade 6,
// kindergarten, youth movement. Pick an occasion, a layout, one of our own drawings (tanks, animals,
// symbols…), texts and colours; see it on a shirt; download a transparent PNG (3000×4000) or an SVG
// for the print shop. Everything is drawn in the browser — nothing is uploaded.

const W = 300, H = 400
const PRESETS = [
  { id: 'maslul', label: '🪖 סוף מסלול וטירונות', icon: 'wolf', layout: 'badge', title: 'פלוגה ב׳', subtitle: 'גיוס מרץ 2026', slogan: 'יחד התחלנו, יחד סיימנו', shirt: '#3f4a2a' },
  { id: 'course', label: '🎖️ סיום קורס', icon: 'tank', layout: 'badge', title: 'צוות טנק 3', subtitle: 'קורס מפקדי טנקים', slogan: 'מחזור אפריל 2027', shirt: '#1f2937' },
  { id: 'beret', label: '🥾 מסע כומתה', icon: 'beret', layout: 'shield', title: 'מסע כומתה', subtitle: 'מחלקה 3 · 2027', slogan: 'הכומתה על הראש, הגאווה בלב', shirt: '#2b2b2b' },
  { id: 'parents', label: '❤️ הורים גאים', icon: 'heart', layout: 'big', title: 'הורים גאים', subtitle: 'של הלוחם שלנו', slogan: 'מסע כומתה 2027', shirt: '#ffffff' },
  { id: 'yb', label: '🎓 סיום י״ב', icon: 'cap', layout: 'names', title: 'מחזור כ״ט', subtitle: 'בוגרי תשפ״ז', slogan: '12 שנים, זיכרון אחד', shirt: '#1e3a8a' },
  { id: 'six', label: '🏫 סיום כיתה ו׳', icon: 'bus', layout: 'big', title: 'ביי ביי יסודי', subtitle: 'ו׳2 · תשפ״ז', slogan: 'נתראה בחטיבה!', shirt: '#0ea5e9' },
  { id: 'gan', label: '🎈 סיום גן', icon: 'balloons', layout: 'big', title: 'להתראות גן!', subtitle: 'שלום כיתה א׳', slogan: 'גן הדקל · תשפ״ז', shirt: '#fde047' },
  { id: 'youth', label: '🏕️ תנועת נוער', icon: 'fire', layout: 'badge', title: 'שבט הרימון', subtitle: 'מחנה קיץ 2027', slogan: 'ביחד סביב המדורה', shirt: '#14532d' },
  { id: 'mechina', label: '⛰️ מכינה ושנת שירות', icon: 'mountain', layout: 'shield', title: 'מכינת הגליל', subtitle: 'מחזור 12', slogan: 'שנה אחת, חברים לכל החיים', shirt: '#78350f' },
]
const LAYOUTS = [['badge', '⭕ סמל עגול'], ['shield', '🛡️ מגן עם סרט'], ['big', '🔠 כותרת גדולה'], ['names', '📜 גב עם שמות']]
const SLOGANS = ['יחד התחלנו, יחד סיימנו', 'עשינו את זה!', 'סיימנו!', 'פעם אחים, תמיד אחים', 'הכומתה על הראש, הגאווה בלב', '12 שנים, זיכרון אחד', 'יוצאים לדרך', 'נתראה בחטיבה!', 'להתראות גן, שלום כיתה א׳', 'שנה אחת, חברים לכל החיים']
const SHIRTS = [['#ffffff', 'לבן'], ['#111111', 'שחור'], ['#3f4a2a', 'זית'], ['#1e3a8a', 'כחול כהה'], ['#6b7280', 'אפור'], ['#7f1d1d', 'בורדו'], ['#5b21b6', 'סגול'], ['#78350f', 'חום'], ['#0ea5e9', 'תכלת'], ['#fde047', 'צהוב'], ['#14532d', 'ירוק'], ['#be185d', 'ורוד']]
const INKS = ['#ffffff', '#111111', '#f5c542', '#c0392b', '#1e3a8a', '#3f4a2a', '#e5e7eb', '#0ea5e9', '#be185d', '#78350f']
const FONTS = [['Heebo', 'רגיל', ['heebo-hebrew', 'heebo-latin']], ['Fredoka', 'עגול', ['fredoka-hebrew', 'fredoka-latin']], ['KtavYad', 'כתב יד', ['ktav-yad']], ['Stam', 'סת״ם', ['stam']]]

const dark = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 140 }
const fit = (t, maxW, max) => Math.min(max, maxW / Math.max(1, [...(t || '')].length * 0.56))

function Icon({ id, x, y, size, ink, bg }) {
  return <g transform={`translate(${x} ${y}) scale(${size / 100})`}>{iconById(id).draw(ink, bg)}</g>
}
function TextLine({ y, size, fill, weight = 800, children, x = W / 2 }) {
  return <text x={x} y={y} fontSize={size} textAnchor="middle" fontWeight={weight} fill={fill} direction="rtl">{children}</text>
}
function Stars({ y, fill, xs = [44, 256], r = 7 }) {
  return xs.map(x => <polygon key={x} fill={fill} points={Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}` }).join(' ')} />)
}
function Laurels({ cx, cy, r, fill }) {
  return [0, 1].map(side => <g key={side} transform={side ? `translate(${cx * 2} 0) scale(-1 1)` : undefined}>
    {Array.from({ length: 7 }, (_, i) => { const a = Math.PI * (0.68 + i * 0.075), x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); return <ellipse key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} rx={4} ry={10} fill={fill} transform={`rotate(${((a * 180) / Math.PI + 90 - 25).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} /> })}
  </g>)
}

// The print design itself: transparent background, ink + accent only.
function Design({ d, svgRef }) {
  const { ink, accent, bg } = d
  const font = `${d.font}, Heebo, Arial, sans-serif`
  let body
  if (d.layout === 'badge') {
    const cx = 150, cy = 165
    body = <>
      <circle cx={cx} cy={cy} r={128} fill="none" stroke={ink} strokeWidth={9} />
      <circle cx={cx} cy={cy} r={114} fill="none" stroke={accent} strokeWidth={2.5} />
      {d.laurel && <Laurels cx={cx} cy={cy - 4} r={74} fill={accent} />}
      <Icon id={d.icon} x={cx - 56} y={cy - 56} size={112} ink={ink} bg={bg} />
      <TextLine y={cy - 72} size={fit(d.title, 170, 30)} fill={ink}>{d.title}</TextLine>
      <TextLine y={cy + 98} size={fit(d.subtitle, 140, 16)} fill={accent} weight={700}>{d.subtitle}</TextLine>
      <Stars y={cy} fill={accent} xs={[34, 266]} r={8} />
      <TextLine y={340} size={fit(d.slogan, 270, 24)} fill={ink}>{d.slogan}</TextLine>
    </>
  } else if (d.layout === 'shield') {
    body = <>
      <TextLine y={48} size={fit(d.title, 270, 40)} fill={ink} weight={900}>{d.title}</TextLine>
      <path d="M150 66 L242 92 V170 Q242 248 150 292 Q58 248 58 170 V92 Z" fill="none" stroke={ink} strokeWidth={8} strokeLinejoin="round" />
      <path d="M150 80 L228 102 V170 Q228 236 150 274 Q72 236 72 170 V102 Z" fill="none" stroke={accent} strokeWidth={2.5} />
      {d.laurel && <Laurels cx={150} cy={180} r={66} fill={accent} />}
      <Icon id={d.icon} x={100} y={120} size={100} ink={ink} bg={bg} />
      <path d="M30 300 H270 L256 318 L270 336 H30 L44 318 Z" fill={accent} />
      <TextLine y={325} size={fit(d.subtitle, 200, 20)} fill={bg} weight={800}>{d.subtitle}</TextLine>
      <TextLine y={378} size={fit(d.slogan, 270, 22)} fill={ink}>{d.slogan}</TextLine>
    </>
  } else if (d.layout === 'big') {
    body = <>
      <TextLine y={70} size={fit(d.title, 280, 54)} fill={ink} weight={900}>{d.title}</TextLine>
      {d.laurel && <Laurels cx={150} cy={190} r={86} fill={accent} />}
      <Icon id={d.icon} x={80} y={110} size={140} ink={ink} bg={bg} />
      <TextLine y={300} size={fit(d.subtitle, 260, 30)} fill={accent}>{d.subtitle}</TextLine>
      <TextLine y={350} size={fit(d.slogan, 270, 22)} fill={ink} weight={700}>{d.slogan}</TextLine>
    </>
  } else {
    const names = d.names.split(/\n|,/).map(s => s.trim()).filter(Boolean).slice(0, 90)
    const cols = names.length > 48 ? 4 : names.length > 20 ? 3 : 2
    const rows = Math.max(1, Math.ceil(names.length / cols))
    const lh = Math.min(26, (352 - 118) / rows), cw = 270 / cols
    const size = Math.min(lh * 0.8, 19)
    // Few names: centre the block between the two lines instead of leaving it at the top.
    const top = 118 + ((352 - 118) - lh * rows) / 2
    body = <>
      <TextLine y={46} size={fit(d.title, 200, 36)} fill={ink} weight={900}>{d.title}</TextLine>
      <Icon id={d.icon} x={128} y={58} size={44} ink={ink} bg={bg} />
      <Stars y={80} fill={accent} xs={[96, 204]} r={6} />
      <line x1={30} x2={270} y1={110} y2={110} stroke={accent} strokeWidth={2} />
      {names.map((n, i) => { const c = Math.floor(i / rows), r = i % rows; return <text key={i} x={285 - c * cw - cw / 2} y={top + lh * (r + 0.75)} fontSize={fit(n, cw * 0.92, size)} textAnchor="middle" fontWeight={700} fill={ink} direction="rtl">{n}</text> })}
      {!names.length && <TextLine y={230} size={14} fill={accent} weight={600}>כאן יופיעו השמות</TextLine>}
      <line x1={30} x2={270} y1={360} y2={360} stroke={accent} strokeWidth={2} />
      <TextLine y={384} size={fit(`${d.subtitle} · ${d.slogan}`, 270, 18)} fill={accent} weight={700}>{[d.subtitle, d.slogan].filter(Boolean).join(' · ')}</TextLine>
    </>
  }
  return <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" fontFamily={font} role="img" aria-label={`עיצוב חולצה: ${d.title}`} className="block h-full w-full">{body}</svg>
}

function ShirtMockup({ color, children }) {
  return (
    <div className="relative mx-auto aspect-[400/440] w-full max-w-[420px]">
      <svg viewBox="0 0 400 440" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M128 18 Q200 62 272 18 L384 78 L344 162 L304 142 V432 H96 V142 L56 162 L16 78 Z" fill={color} stroke="#94a3b8" strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M128 18 Q200 62 272 18" fill="none" stroke="#94a3b8" strokeWidth={5} />
      </svg>
      <div className="absolute" style={{ left: '30%', top: '17%', width: '40%', height: '52%' }}>{children}</div>
    </div>
  )
}

const toBase64 = buf => { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s) }
async function standaloneSvg(svg, fontFiles, family) {
  const faces = await Promise.all(fontFiles.map(async f => {
    const buf = await fetch(`/fonts/${f}.woff2`).then(r => r.arrayBuffer())
    return `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${toBase64(buf)}) format('woff2');font-weight:100 900;}`
  }))
  const clone = svg.cloneNode(true)
  clone.setAttribute('width', W)
  clone.setAttribute('height', H)
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = faces.join('')
  clone.insertBefore(style, clone.firstChild)
  return new XMLSerializer().serializeToString(clone)
}
function save(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}

const pill = on => `min-h-[42px] rounded-full border-2 border-[var(--border)] px-3 py-1.5 font-bold ${on ? 'bg-[var(--yellow)]' : 'bg-white hover:bg-slate-50'}`
const card = 'space-y-3 rounded-2xl border-2 border-[var(--border)] bg-white/80 p-4'

export default function ShirtDesigner() {
  const [d, setD] = useState(() => fromPreset(PRESETS[1]))
  const [cat, setCat] = useState('army')
  const [busy, setBusy] = useState(false)
  const svgRef = useRef()
  const set = patch => setD(x => ({ ...x, ...patch }))
  const icons = useMemo(() => ICONS.filter(i => i.cat === cat), [cat])
  const shirtDark = dark(d.shirt)

  function fromPreset(p) {
    const dk = dark(p.shirt)
    return { preset: p.id, icon: p.icon, layout: p.layout, title: p.title, subtitle: p.subtitle, slogan: p.slogan, shirt: p.shirt, ink: dk ? '#ffffff' : '#111111', accent: dk ? '#f5c542' : '#c0392b', bg: p.shirt, font: 'Heebo', laurel: p.layout !== 'names', names: d0names, oneColor: false }
  }
  const setShirt = c => set({ shirt: c, bg: c, ...(dark(c) !== shirtDark ? { ink: dark(c) ? '#ffffff' : '#111111', accent: d.oneColor ? (dark(c) ? '#ffffff' : '#111111') : dark(c) ? '#f5c542' : '#c0392b' } : {}) })
  const fontFiles = FONTS.find(f => f[0] === d.font)[2]

  async function download(kind) {
    if (!svgRef.current) return
    setBusy(true)
    try {
      const text = await standaloneSvg(svgRef.current, fontFiles, d.font)
      const name = `shirt-${d.preset}-${d.layout}`
      if (kind === 'svg') return save(new Blob([text], { type: 'image/svg+xml' }), `${name}.svg`)
      const img = new Image()
      img.src = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }))
      await img.decode()
      const c = document.createElement('canvas')
      c.width = 3000; c.height = 4000
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(img.src)
      await new Promise(r => c.toBlob(b => { save(b, `${name}.png`); r() }, 'image/png'))
    } finally { setBusy(false) }
  }

  const faq = [
    { q: 'איזה קובץ לשלוח לבית הדפוס?', a: 'לחצו "הורדת PNG שקוף": מתקבל קובץ של 3000 על 4000 פיקסלים בלי רקע, שמתאים להדפסה דיגיטלית ו-DTF בגודל A3 בערך. בית דפוס שעובד בהדפסת משי ומבקש קובץ וקטורי יקבל את קובץ ה-SVG.' },
    { q: 'כמה צבעים יש בעיצוב?', a: 'שניים לכל היותר: צבע ראשי וצבע משני. בהדפסת משי כל צבע עולה בנפרד, ולכן אפשר לסמן "צבע אחד בלבד" ולקבל עיצוב שמודפס בגלופה אחת.' },
    { q: 'אלה הסמלים הרשמיים של היחידות?', a: 'לא. כל הציורים — טנק, תותח, מטוס, אריה, זאב, שועל ועוד — צוירו במיוחד לאתר. הם מתאימים לחולצות פלוגה ומחזור, אבל אינם סמלים רשמיים של צה״ל או של יחידה.' },
    { q: 'איך מכניסים את השמות של כל הפלוגה או הכיתה?', a: 'בוחרים בפריסה "גב עם שמות" ומדביקים רשימה — שם בכל שורה. עד 90 שמות מסתדרים לבד בשתיים עד ארבע עמודות. בדרך כלל מדפיסים את זה על הגב ואת הסמל מקדימה.' },
    { q: 'זה עולה כסף?', a: 'לא. העיצוב וההורדות חינמיים ובלי הרשמה, והכול נעשה בתוך הדפדפן. משלמים רק לבית הדפוס על החולצות.' },
  ]
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="עיצוב חולצות מחזור וסיום קורס — מחולל גרפיקה בחינם" description="מעצבים גרפיקה לחולצה: סיום קורס, סוף מסלול, מסע כומתה, י״ב, כיתה ו׳ וגן. טנק, תותח, מטוס, אריה, זאב ועוד ציורים מקוריים, כיתוב, צבעים ורשימת שמות לגב. הורדת PNG שקוף לבית הדפוס." path="/tools/shirt-designer" structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'עיצוב חולצות' }]} />
      <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">👕 </span>עיצוב חולצות מחזור וסיום קורס</h1>
      <p className="mb-6 text-center font-hand text-lg text-[var(--muted-foreground)]">בוחרים אירוע, ציור, כיתוב וצבעים — ומורידים קובץ מוכן לבית הדפוס</p>

      <nav aria-label="סוג האירוע" className="mb-6 flex flex-wrap justify-center gap-2">
        {PRESETS.map(p => <button key={p.id} type="button" aria-pressed={d.preset === p.id} onClick={() => setD(x => ({ ...fromPreset(p), names: x.names, font: x.font }))} className={pill(d.preset === p.id)}>{p.label}</button>)}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <section className={card}>
            <h2 className="text-xl font-black">🖼️ ציור</h2>
            <div role="group" aria-label="קטגוריית ציורים" className="flex flex-wrap gap-2">{ICON_CATS.map(([k, l]) => <button key={k} type="button" aria-pressed={cat === k} onClick={() => setCat(k)} className={pill(cat === k)}>{l}</button>)}</div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {icons.map(i => <button key={i.id} type="button" aria-pressed={d.icon === i.id} onClick={() => set({ icon: i.id })} className={`rounded-xl border-2 p-1.5 text-xs font-bold ${d.icon === i.id ? 'border-[var(--border)] bg-[var(--yellow)]' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                <svg viewBox="0 0 100 100" className="mx-auto h-12 w-12" aria-hidden="true">{i.draw('#1f2937', '#ffffff')}</svg>{i.label}
              </button>)}
            </div>
          </section>

          <section className={card}>
            <h2 className="text-xl font-black">📐 פריסה</h2>
            <div role="group" aria-label="פריסה" className="flex flex-wrap gap-2">{LAYOUTS.map(([k, l]) => <button key={k} type="button" aria-pressed={d.layout === k} onClick={() => set({ layout: k })} className={pill(d.layout === k)}>{l}</button>)}</div>
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={d.laurel} onChange={e => set({ laurel: e.target.checked })} className="h-5 w-5" /> זר דפנה סביב הציור</label>
          </section>

          <section className={card}>
            <h2 className="text-xl font-black">✍️ כיתוב</h2>
            {[['title', 'כותרת (שם הפלוגה, הצוות, המחזור)', 28], ['subtitle', 'שורה שנייה (קורס, תאריך, כיתה)', 34], ['slogan', 'משפט', 40]].map(([k, l, m]) => <label key={k} className="block font-bold">{l}
              <input value={d[k]} maxLength={m} onChange={e => set({ [k]: e.target.value })} className="mt-1 w-full rounded-lg border-2 border-slate-300 px-3 py-2 font-normal" />
            </label>)}
            <div className="flex flex-wrap gap-1.5" aria-label="משפטים מוכנים">{SLOGANS.map(s => <button key={s} type="button" onClick={() => set({ slogan: s })} className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-sm">{s}</button>)}</div>
            <div role="group" aria-label="גופן" className="flex flex-wrap gap-2">{FONTS.map(([f, l]) => <button key={f} type="button" aria-pressed={d.font === f} onClick={() => set({ font: f })} style={{ fontFamily: `${f}, Heebo` }} className={`${pill(d.font === f)} text-lg`}>{l}</button>)}</div>
            {d.layout === 'names' && <label className="block font-bold">שמות לגב החולצה — שם בכל שורה
              <textarea value={d.names} onChange={e => set({ names: e.target.value })} rows={6} className="mt-1 w-full rounded-lg border-2 border-slate-300 p-2 font-normal" />
            </label>}
          </section>

          <section className={card}>
            <h2 className="text-xl font-black">🎨 צבעים</h2>
            <p className="font-bold">צבע החולצה</p>
            <div className="flex flex-wrap gap-2">{SHIRTS.map(([c, l]) => <button key={c} type="button" aria-label={`חולצה ${l}`} aria-pressed={d.shirt === c} onClick={() => setShirt(c)} className={`h-10 w-10 rounded-full border-2 ${d.shirt === c ? 'border-[var(--border)] ring-2 ring-offset-2 ring-slate-700' : 'border-slate-300'}`} style={{ background: c }} />)}</div>
            {[['ink', 'צבע ראשי'], ...(d.oneColor ? [] : [['accent', 'צבע משני']])].map(([k, l]) => <div key={k}><p className="font-bold">{l}</p>
              <div className="flex flex-wrap items-center gap-2">{INKS.map(c => <button key={c} type="button" aria-label={`${l} ${c}`} aria-pressed={d[k] === c} onClick={() => set(d.oneColor ? { ink: c, accent: c } : { [k]: c })} className={`h-9 w-9 rounded-full border-2 ${d[k] === c ? 'border-[var(--border)] ring-2 ring-offset-2 ring-slate-700' : 'border-slate-300'}`} style={{ background: c }} />)}
                <input type="color" value={d[k]} onChange={e => set(d.oneColor ? { ink: e.target.value, accent: e.target.value } : { [k]: e.target.value })} aria-label={`${l} — צבע אחר`} className="h-9 w-12 cursor-pointer" /></div>
            </div>)}
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={d.oneColor} onChange={e => set({ oneColor: e.target.checked, accent: e.target.checked ? d.ink : (shirtDark ? '#f5c542' : '#c0392b') })} className="h-5 w-5" /> צבע אחד בלבד (זול יותר בהדפסת משי)</label>
          </section>
        </div>

        <div className="space-y-3 lg:sticky lg:top-24">
          <ShirtMockup color={d.shirt}><Design d={d} svgRef={svgRef} /></ShirtMockup>
          <button type="button" disabled={busy} onClick={() => download('png')} className="w-full min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white disabled:opacity-60">⬇️ הורדת PNG שקוף לבית הדפוס</button>
          <button type="button" disabled={busy} onClick={() => download('svg')} className="w-full min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-6 py-2 font-bold">⬇️ קובץ SVG (וקטורי, להדפסת משי)</button>
          <p className="text-center text-sm text-[var(--muted-foreground)]">PNG בגודל 3000×4000 בלי רקע — כ-A3 ב-250 DPI. {d.oneColor ? 'צבע אחד: גלופה אחת.' : 'שני צבעים: שתי גלופות בהדפסת משי.'} הציורים מקוריים ואינם סמלים רשמיים.</p>
        </div>
      </div>

      <div className="mt-12">
        <SeoBody paragraphs={[
          'חולצה לסוף מסלול, לסיום קורס או למסע כומתה היא מסורת: מקדימה סמל עם שם הפלוגה או הצוות, ומאחור השמות של כולם, התאריך ומשפט שכולם יזכרו. בכלי הזה מעצבים את שני הצדדים בלי תוכנה ובלי מעצב — בוחרים אירוע, ציור, כיתוב וצבעים, ומורידים קובץ מוכן.',
          'יש ציורים מקוריים לכל סוג של חולצה: כלים — טנק, תותח, נגמ״ש, מטוס קרב, מסוק, ספינה, צוללת, צנחן, כומתה, דסקית, ג׳ריקן ורחפן; חיות שמופיעות בסמלי פלוגות — אריה, זאב, שועל, דוב, נשר, נמר, עקרב, נחש, כריש, יעל וינשוף; וסמלים — מגן, כנפיים, זר דפנה, חרב, הרים, שמש עולה, עוגן, ברק ודגל ישראל. לבית הספר, לגן ולתנועות הנוער יש כובע סיום, ספר, אוטובוס טיול, אוהל, מדורה ובלונים.',
          'ארבע פריסות: סמל עגול בסגנון פאץ׳ עם הכותרת מעל ושורה מתחת, מגן עם סרט, כותרת גדולה עם ציור, וגב עם רשימת שמות שמסתדרת לבד בעמודות. אפשר לבחור צבע חולצה ולראות את העיצוב עליה, צבע ראשי ומשני, וגופן — רגיל, עגול, כתב יד או סת״ם.',
          'בתי דפוס להדפסה דיגיטלית ו-DTF מבקשים PNG שקוף ברזולוציה גבוהה — זה מה שמתקבל בהורדה. להדפסת משי עדיף מעט צבעים, ולכן יש מצב של צבע אחד. לא כללנו רובים, כוונות או סצנות אלימות; חולצות כאלה עוררו בעבר ביקורת ציבורית, והן גם לא מתאימות לטקס עם המשפחות.',
        ]} faq={faq} related={[{ label: 'תמונת מחזור לסיום קורס', href: '/printables/class-photo/army-course' }, { label: 'תמונת מחזור לכיתה', href: '/printables/class-photo' }, { label: 'מחולל קוד QR', href: '/tools/qr-code' }]} />
      </div>
    </div>
  )
}

const d0names = 'נועה כהן\nאיתי לוי\nיעל מזרחי\nעומר פרץ\nמאיה ביטון\nדניאל אברהם\nשירה פרידמן\nאורי שפירא'
