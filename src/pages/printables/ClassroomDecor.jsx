import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody from '../../components/ui/SeoBody'
import NotFound from '../NotFound'
import { DECOR_SETS, decorSet, HEBREW_MONTHS, GREG_MONTHS, SEASONS, NUMBER_WORDS, NUMBER_ITEMS, COLORS, SHAPES, WEATHER, DEFAULT_RULES, DEFAULT_DUTIES } from '../../data/classroomDecor'

// Classroom & kindergarten wall decoration: weather wheel, birthday months, seasons, numbers,
// shapes, colours, class rules, duty chart and a letter bunting. Sheets are 200×270 (see PrintableShell).
const W = 200, H = 270
const fit = (text, w, max) => Math.min(max, w / Math.max(1, [...text].length * 0.58))

// ---------- shapes ----------
function ShapeArt({ kind, cx, cy, r, fill, stroke = '#222' }) {
  const p = { fill, stroke, strokeWidth: r * 0.06, strokeLinejoin: 'round' }
  const poly = (n, rot = -Math.PI / 2, rr = r) => Array.from({ length: n }, (_, i) => { const a = rot + i * 2 * Math.PI / n; return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}` }).join(' ')
  if (kind === 'circle') return <circle cx={cx} cy={cy} r={r} {...p} />
  if (kind === 'square') return <rect x={cx - r * 0.85} y={cy - r * 0.85} width={r * 1.7} height={r * 1.7} {...p} />
  if (kind === 'rect') return <rect x={cx - r * 1.1} y={cy - r * 0.65} width={r * 2.2} height={r * 1.3} {...p} />
  if (kind === 'triangle') return <polygon points={poly(3, -Math.PI / 2, r * 1.05)} {...p} />
  if (kind === 'oval') return <ellipse cx={cx} cy={cy} rx={r * 1.15} ry={r * 0.72} {...p} />
  if (kind === 'diamond') return <polygon points={`${cx},${cy - r} ${cx + r * 0.7},${cy} ${cx},${cy + r} ${cx - r * 0.7},${cy}`} {...p} />
  if (kind === 'hexagon') return <polygon points={poly(6, 0)} {...p} />
  if (kind === 'star') return <polygon points={Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}` }).join(' ')} {...p} />
  return <path d={`M${cx} ${cy + r * 0.85} C${cx - r * 1.4} ${cy - r * 0.1} ${cx - r * 0.7} ${cy - r * 1.05} ${cx} ${cy - r * 0.45} C${cx + r * 0.7} ${cy - r * 1.05} ${cx + r * 1.4} ${cy - r * 0.1} ${cx} ${cy + r * 0.85} Z`} {...p} />
}

// ---------- a card in a box ----------
function Card({ box, emoji, title, sub, color = '#3b7dd8', ink, lines = 0, art, digit }) {
  const { x, y, w, h } = box
  const m = Math.min(w, h)
  const top = lines ? h * 0.3 : h * 0.42
  const tSize = fit(title, w * 0.85, m * (lines ? 0.13 : 0.16))
  return <g>
    <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx={m * 0.06} fill={ink ? '#fff' : color + '22'} stroke={ink ? '#222' : color} strokeWidth={m * 0.02} />
    {digit != null && <T x={x + w / 2} y={y + h * 0.3} size={m * 0.3} weight={900} fill={ink ? '#fff' : color} stroke="#222" strokeWidth={m * 0.008}>{digit}</T>}
    {art ? art(x + w / 2, y + top, m * (lines ? 0.16 : 0.26)) : emoji && digit == null && <text x={x + w / 2} y={y + top} fontSize={m * (lines ? 0.2 : 0.32)} textAnchor="middle" dominantBaseline="central">{emoji}</text>}
    <T x={x + w / 2} y={y + (lines ? h * 0.52 : digit != null ? h * 0.5 : h * 0.76)} size={tSize} weight={900}>{title}</T>
    {sub && <T x={x + w / 2} y={y + (lines ? h * 0.61 : digit != null ? h * 0.85 : h * 0.87)} size={Math.min(m * 0.07, fit(sub, w * 0.85, 99))} fill="#444">{sub}</T>}
    {Array.from({ length: lines }, (_, i) => <line key={i} x1={x + w * 0.12} x2={x + w * 0.88} y1={y + h * (0.7 + i * (0.25 / lines))} y2={y + h * (0.7 + i * (0.25 / lines))} stroke="#999" strokeWidth="0.4" strokeDasharray="1.5 1.5" />)}
  </g>
}
const boxes = n => n === 1 ? [{ x: 5, y: 5, w: 190, h: 260 }] : n === 2 ? [0, 1].map(i => ({ x: 5, y: 5 + i * 131, w: 190, h: 128 })) : [0, 1, 2, 3].map(i => ({ x: 5 + (i % 2) * 96, y: 5 + Math.floor(i / 2) * 131, w: 94, h: 128 }))
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
function cardPages(cards, per, ink, label) {
  return chunk(cards, per).map((group, i) => ({ key: `${label}-${per}-${ink}-${i}-${group.map(c => c.title).join()}`, svg: <Sheet label={`${label}: ${group.map(c => c.title).join(', ')}`}>{group.map((c, k) => <Card key={k} box={boxes(per)[k]} ink={ink} {...c} />)}</Sheet> }))
}

// ---------- special sheets ----------
function WeatherWheel({ ink }) {
  const cx = 100, cy = 140, r = 88
  return <Sheet label="לוח מזג אוויר: גלגל עם שישה מצבים">
    <T x={100} y={26} size={13} weight={900}>☀️ מזג האוויר היום ☔</T>
    {WEATHER.map(([name, e, color], i) => {
      const a0 = -Math.PI / 2 + i * Math.PI / 3, a1 = a0 + Math.PI / 3, am = (a0 + a1) / 2
      const p = a => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`
      return <g key={name}>
        <path d={`M${cx} ${cy} L${p(a0)} A${r} ${r} 0 0 1 ${p(a1)} Z`} fill={ink ? '#fff' : color} stroke="#222" strokeWidth="1" />
        <text x={cx + r * 0.62 * Math.cos(am)} y={cy + r * 0.62 * Math.sin(am) - 4} fontSize="20" textAnchor="middle" dominantBaseline="central">{e}</text>
        <T x={cx + r * 0.62 * Math.cos(am)} y={cy + r * 0.62 * Math.sin(am) + 14} size={7} weight={800}>{name}</T>
      </g>
    })}
    <circle cx={cx} cy={cy} r="4" fill="#fff" stroke="#222" strokeWidth="1" />
    <T x={100} y={252} size={6} fill="#555">גוזרים את החץ מהדף הבא ומחברים במרכז בסיכה מתפצלת</T>
  </Sheet>
}
function WeatherArrow({ ink }) {
  return <Sheet label="חץ ללוח מזג האוויר ושורת תאריך">
    <T x={100} y={22} size={9} weight={800}>✂️ חץ ללוח מזג האוויר</T>
    <path d="M100 40 L120 70 L108 70 L108 150 L92 150 L92 70 L80 70 Z" fill={ink ? '#fff' : '#e5484d'} stroke="#222" strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="100" cy="140" r="3" fill="#fff" stroke="#222" strokeWidth="0.8" />
    <rect x="25" y="175" width="150" height="70" rx="8" fill={ink ? '#fff' : '#fff6d6'} stroke="#222" strokeWidth="1" />
    <T x={100} y={193} size={9} weight={800}>היום יום _______</T>
    <T x={100} y={213} size={8}>תאריך: ____________</T>
    <T x={100} y={233} size={8}>בחוץ: ____________</T>
  </Sheet>
}
function RulesSheet({ title, rules, ink }) {
  const list = rules.slice(0, 8), rowH = Math.min(26, 200 / Math.max(1, list.length))
  return <Sheet label={`${title}: ${list.join(', ')}`}>
    <rect x="6" y="6" width="188" height="258" rx="10" fill={ink ? '#fff' : '#fffaf0'} stroke={ink ? '#222' : '#f2b31b'} strokeWidth="3" />
    <T x={100} y={34} size={fit(title, 170, 16)} weight={900}>{title}</T>
    <line x1="40" x2="160" y1="42" y2="42" stroke={ink ? '#222' : '#f2b31b'} strokeWidth="1.2" />
    {list.map((rule, i) => {
      const m = rule.match(/^(.*?)\s*(\p{Extended_Pictographic}[\p{Extended_Pictographic}‍️]*)?$/u)
      const text = (m?.[1] || rule).trim(), e = m?.[2]
      const yy = 62 + i * rowH
      return <g key={i}>
        <circle cx="176" cy={yy} r={rowH * 0.36} fill={ink ? '#fff' : ['#ffd84d', '#9cc3f0', '#bfead2', '#f9c0dc'][i % 4]} stroke="#222" strokeWidth="0.6" />
        <T x={176} y={yy + rowH * 0.12} size={rowH * 0.34} weight={900}>{i + 1}</T>
        <T x={160} y={yy + rowH * 0.14} size={fit(text, 120, rowH * 0.42)} anchor="start" weight={700}>{text}</T>
        {e && <text x="26" y={yy} fontSize={rowH * 0.6} textAnchor="middle" dominantBaseline="central">{e}</text>}
      </g>
    })}
  </Sheet>
}
function DutySheet({ duties, ink }) {
  const list = duties.slice(0, 8)
  return <Sheet label={`לוח תורנים: ${list.map(d => d[0]).join(', ')}`}>
    <T x={100} y={22} size={14} weight={900}>🧹 התורנים שלנו</T>
    <T x={100} y={32} size={6} fill="#555">שבוע: ______________</T>
    {list.map(([name, e], i) => {
      const x = 8 + (i % 2) * 94, y = 40 + Math.floor(i / 2) * 56
      return <g key={i}>
        <rect x={x} y={y} width="90" height="52" rx="6" fill={ink ? '#fff' : ['#fff1c2', '#dcecff', '#dff6e7', '#ffe0ef'][i % 4]} stroke="#222" strokeWidth="0.8" />
        <text x={x + 76} y={y + 16} fontSize="16" textAnchor="middle" dominantBaseline="central">{e}</text>
        <T x={x + 64} y={y + 19} size={fit(name, 56, 8)} anchor="start" weight={800}>{name}</T>
        <line x1={x + 8} x2={x + 82} y1={y + 34} y2={y + 34} stroke="#999" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
        <line x1={x + 8} x2={x + 82} y1={y + 46} y2={y + 46} stroke="#999" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      </g>
    })}
  </Sheet>
}
const FLAG_COLORS = ['#e5484d', '#f28c28', '#f5c518', '#3fb36b', '#3b7dd8', '#8e5cd6', '#f07ab8']
function BuntingSheet({ chars, start, ink }) {
  return <Sheet label={`שרשרת דגלים: ${chars.join('')}`}>
    {chars.map((ch, i) => {
      const y0 = 8 + i * 132, color = FLAG_COLORS[(start + i) % FLAG_COLORS.length]
      return <g key={i}>
        <rect x="20" y={y0} width="160" height="10" fill="#fff" stroke="#999" strokeWidth="0.4" strokeDasharray="2 1.5" />
        <T x={100} y={y0 + 7} size={4} fill="#999">מקפלים כאן ומשחילים חוט</T>
        <path d={`M20 ${y0 + 10} H180 L100 ${y0 + 126} Z`} fill={ink ? '#fff' : color} stroke="#222" strokeWidth="1" strokeLinejoin="round" />
        {ch.trim() ? <T x={100} y={y0 + 70} size={62} weight={900} fill="#fff" stroke="#222" strokeWidth="1.6" paintOrder="stroke">{ch}</T>
          : <text x="100" y={y0 + 52} fontSize="34" textAnchor="middle" dominantBaseline="central">🌼</text>}
      </g>
    })}
  </Sheet>
}

// ---------- per-set pages and controls ----------
function useDecor(slug) {
  const [ink, setInk] = useState('color')
  const [per, setPer] = useState('2')
  const [months, setMonths] = useState('hebrew')
  const [range, setRange] = useState('posters')
  const [title, setTitle] = useState('הכללים של הכיתה שלנו')
  const [rules, setRules] = useState(DEFAULT_RULES.join('\n'))
  const [duties, setDuties] = useState(DEFAULT_DUTIES.map(d => d.join(' ')).join('\n'))
  const [text, setText] = useState('ברוכים הבאים')
  const isInk = ink === 'ink', n = +per
  const inkChoice = <div><p className="mb-2 text-center font-bold">צבע</p><Choice label="צבע או צביעה" value={ink} onChange={setInk} options={[['color', '🎨 בצבע'], ['ink', '✏️ לצביעה']]} /></div>
  const perChoice = <div><p className="mb-2 text-center font-bold">בדף A4</p><Choice label="כמה בדף" value={per} onChange={setPer} options={[['1', 'אחד גדול'], ['2', '2 בדף'], ['4', '4 בדף']]} /></div>
  let pages = [], controls = <div className="grid gap-4 sm:grid-cols-2">{perChoice}{inkChoice}</div>
  if (slug === 'weather') { pages = [{ key: 'w' + ink, svg: <WeatherWheel ink={isInk} /> }, { key: 'a' + ink, svg: <WeatherArrow ink={isInk} /> }]; controls = inkChoice }
  if (slug === 'birthday-months') {
    const list = months === 'hebrew' ? HEBREW_MONTHS : GREG_MONTHS
    pages = cardPages(list.map(([t, e, s], i) => ({ title: t, emoji: e, sub: s, color: FLAG_COLORS[i % 7], lines: n === 1 ? 6 : n === 2 ? 4 : 3 })), n, isInk, 'ימי הולדת')
    controls = <div className="grid gap-4 sm:grid-cols-3"><div><p className="mb-2 text-center font-bold">חודשים</p><Choice label="סוג החודשים" value={months} onChange={setMonths} options={[['hebrew', 'עבריים'], ['greg', 'לועזיים']]} /></div>{perChoice}{inkChoice}</div>
  }
  if (slug === 'seasons') pages = cardPages(SEASONS.map(([t, e, c, w]) => ({ title: t, emoji: e, color: c, sub: w.join(' · ') })), n, isInk, 'עונות השנה')
  if (slug === 'colors') pages = cardPages(COLORS.map(([t, c, e]) => ({ title: t, color: c === '#ffffff' ? '#999999' : c, sub: `${e} ${t} כמו…`, art: (x, y, r) => <circle cx={x} cy={y} r={r} fill={isInk ? '#fff' : c} stroke="#222" strokeWidth={r * 0.05} /> })), n, isInk, 'צבעים')
  if (slug === 'shapes') pages = cardPages(SHAPES.map(([t, k, c]) => ({ title: t, color: c, art: (x, y, r) => <ShapeArt kind={k} cx={x} cy={y} r={r} fill={isInk ? '#fff' : c} /> })), n, isInk, 'צורות')
  if (slug === 'numbers') {
    if (range === 'line') pages = [0, 1].map(part => ({ key: `line${part}${ink}`, svg: <Sheet label={`סרגל מספרים ${part ? '11–20' : '1–10'}`}>{Array.from({ length: 10 }, (_, i) => { const num = part * 10 + i + 1, yy = 8 + i * 25.5; return <g key={num}><rect x="30" y={yy} width="140" height="24" rx="4" fill={isInk ? '#fff' : FLAG_COLORS[num % 7] + '33'} stroke="#222" strokeWidth="0.8" /><T x={150} y={yy + 18} size={17} weight={900}>{num}</T><text x="95" y={yy + 12} fontSize={num > 10 ? 6 : 8} textAnchor="middle" dominantBaseline="central">{'●'.repeat(num)}</text></g> })}<T x={100} y={266} size={5} fill="#777">גוזרים ומחברים את שני החלקים לפס אחד ארוך</T></Sheet> }))
    else pages = cardPages(NUMBER_WORDS.map((t, i) => ({ title: t, digit: i, color: FLAG_COLORS[i % 7], sub: i ? NUMBER_ITEMS[i].repeat(i) : '—' })), n, isInk, 'מספרים')
    controls = <div className="grid gap-4 sm:grid-cols-3"><div><p className="mb-2 text-center font-bold">מה להדפיס</p><Choice label="פוסטרים או סרגל" value={range} onChange={setRange} options={[['posters', 'פוסטרים 0–10'], ['line', 'סרגל 1–20']]} /></div>{range === 'posters' && perChoice}{inkChoice}</div>
  }
  if (slug === 'class-rules') {
    pages = [{ key: 'rules' + ink + title + rules, svg: <RulesSheet title={title || 'כללי הכיתה'} rules={rules.split('\n').map(r => r.trim()).filter(Boolean)} ink={isInk} /> }]
    controls = <div className="space-y-4"><Field label="כותרת" value={title} onChange={setTitle} maxLength={40} /><label className="block text-center font-bold">הכללים — כלל בכל שורה (עד 8). אימוג׳י בסוף השורה יופיע כציור<textarea value={rules} onChange={e => setRules(e.target.value)} rows={8} maxLength={500} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" /></label>{inkChoice}</div>
  }
  if (slug === 'duty-chart') {
    const list = duties.split('\n').map(r => r.trim()).filter(Boolean).map(r => { const m = r.match(/^(.*?)\s*(\p{Extended_Pictographic}[\p{Extended_Pictographic}‍️]*)?$/u); return [(m?.[1] || r).trim(), m?.[2] || '⭐'] })
    pages = [{ key: 'duty' + ink + duties, svg: <DutySheet duties={list} ink={isInk} /> }]
    controls = <div className="space-y-4"><label className="block text-center font-bold">התפקידים — תפקיד בכל שורה (עד 8), ואימוג׳י בסוף השורה<textarea value={duties} onChange={e => setDuties(e.target.value)} rows={8} maxLength={400} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" /></label>{inkChoice}</div>
  }
  if (slug === 'welcome-banner') {
    const chars = [...(text.trim() || 'ברוכים הבאים')].slice(0, 30)
    pages = chunk(chars, 2).map((c, i) => ({ key: `b${i}${ink}${text}`, svg: <BuntingSheet chars={c} start={i * 2} ink={isInk} /> }))
    controls = <div className="space-y-4"><Field label="הטקסט על הדגלים (עד 30 תווים)" value={text} onChange={setText} maxLength={30} placeholder="ברוכים הבאים" />{inkChoice}<p className="text-center text-sm font-bold" aria-live="polite">{chars.length} דגלים · {pages.length} דפי A4</p></div>
  }
  return { pages, controls }
}

function DecorSet({ set }) {
  const { pages, controls } = useDecor(set.slug)
  return <PrintableShell path={`/printables/classroom-decor/${set.slug}`} emoji={set.emoji} h1={set.title} seoTitle={set.seoTitle} description={set.description} sub={set.sub}
    crumbs={[{ label: 'קישוט כיתה וגן', href: '/printables/classroom-decor' }]}
    controls={controls} pages={pages} printTitle={set.title} previewAll paragraphs={set.paragraphs} faq={set.faq}
    related={[...DECOR_SETS.filter(s => s.slug !== set.slug).slice(0, 5).map(s => ({ label: s.title, href: `/printables/classroom-decor/${s.slug}` })), { label: 'שלטי מקצועות לכיתה', href: '/printables/classroom-signs' }]} />
}

const HUB_FAQ = [
  { q: 'על איזה נייר כדאי להדפיס קישוטים לכיתה?', a: 'נייר רגיל מספיק לשרשרת דגלים ולפוסטרים שמתחלפים. מה שנשאר על הקיר כל השנה — לוח מזג אוויר, לוח תורנים ופינת ימי הולדת — כדאי להדפיס על בריסטול דק או לעשות למינציה.' },
  { q: 'אפשר להדפיס בשחור־לבן?', a: 'כן. בכל דף יש מצב "לצביעה" שמדפיס קווי מתאר בלבד — והילדים צובעים בעצמם. זו גם פעילות טובה לפתיחת שנה: הכיתה מקשטת את עצמה.' },
  { q: 'כמה זה עולה?', a: 'כלום. כל הדפים חינמיים, בלי הרשמה ובלי סימני מים.' },
]
function DecorHub() {
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="קישוט כיתה וגן להדפסה — לוח מזג אוויר, ימי הולדת, תורנים ועוד" description="קישוטים לכיתה ולגן להדפסה בחינם: לוח מזג אוויר עם חץ, פינת ימי הולדת לפי חודשים, עונות השנה, מספרים, צורות, צבעים, כללי הכיתה, לוח תורנים ושרשרת דגלים עם טקסט משלכם." path="/printables/classroom-decor" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'קישוט כיתה וגן' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🖼️ קישוט כיתה וגן להדפסה</h1>
    <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">כל מה שתולים על הקיר בתחילת השנה — מוכן להדפסה, בצבע או לצביעה, בחינם.</p>
    <div className="grid gap-4 sm:grid-cols-3">
      {DECOR_SETS.map(s => <Link key={s.slug} to={`/printables/classroom-decor/${s.slug}`} className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-4 text-center hover:bg-[var(--muted)]/30">
        <span className="block text-4xl" aria-hidden="true">{s.emoji}</span><b className="mt-2 block text-lg">{s.title}</b><span className="mt-1 block text-sm text-[var(--muted-foreground)]">{s.sub}</span>
      </Link>)}
    </div>
    <section className="mx-auto mt-10 max-w-3xl space-y-3 leading-relaxed text-[var(--foreground)]/80">
      <h2 className="text-2xl font-bold text-[var(--foreground)]">מה תולים בגן ובכיתה בתחילת השנה?</h2>
      <p>קיר כיתה טוב הוא לא רק יפה — הוא עוזר ללמוד. לוח מזג אוויר ולוח תורנים בונים את פינת הבוקר, פינת ימי ההולדת מזכירה לכולם את החוגגים, ופוסטרים של מספרים, צורות וצבעים נותנים לילדים מילים לדברים שהם רואים כל יום. שרשרת דגלים עם שם הגן או "ברוכים הבאים" מקבלת את הילדים כבר בדלת.</p>
      <p>כל הדפים כאן נבנים במחשב, אז אפשר לשנות אותם: לכתוב כללים משלכם, לבחור חודשים עבריים או לועזיים, להחליף תפקידים בלוח התורנים ולהדפיס כל טקסט על הדגלים.</p>
    </section>
    <SeoBody faq={HUB_FAQ} related={[{ label: 'שלטי מקצועות לכיתה', href: '/printables/classroom-signs' }, { label: 'סרגל אותיות', href: '/printables/letter-strip' }, { label: 'כרטיסיות רגשות', href: '/printables/emotion-cards' }, { label: 'לגננת — כל מה שצריך לגן', href: '/gan' }, { label: 'קבצים לרכזות, לכיתה ולגן', href: '/printables/teacher-templates' }]} />
  </div>
}

export default function ClassroomDecor() {
  const { slug } = useParams()
  if (!slug) return <DecorHub />
  const set = decorSet(slug)
  return set ? <DecorSet key={slug} set={set} /> : <NotFound />
}
