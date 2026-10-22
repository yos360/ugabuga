import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import UseClassRoster from '../../components/ui/UseClassRoster'
import { cleanName, parseNames, MAX_CERTS, MAX_NAME } from '../../data/schoolSeason'
import './star-of-the-week.css'

// "כוכב/ת השבוע" certificate for kindergarten and school: names (one per line or from the class
// roster), a reason, date and signer. One or two certificates per A4 page. Nothing leaves the browser.
const REASONS = [
  { id: 'atmosphere', label: 'אווירה טובה', text: p => `על יחס טוב לחברים ולצוות, הקשבה ועזרה, ועל האווירה הטובה שהבאת ${p}` },
  { id: 'effort', label: 'התמדה ומאמץ', text: () => 'על התמדה, מאמץ והשקעה בכל משימה — ממשיכים ככה!' },
  { id: 'helping', label: 'עזרה לחברים', text: p => `על לב טוב ועל העזרה לחברים ${p}` },
  { id: 'listening', label: 'הקשבה והתנהגות', text: () => 'על הקשבה, סבלנות והתנהגות מופתית' },
  { id: 'creative', label: 'יצירתיות', text: () => 'על רעיונות מקוריים, יצירתיות ודמיון' },
  { id: 'progress', label: 'התקדמות יפה', text: () => 'על ההתקדמות היפה שעשית השבוע — אנחנו גאים בך' },
  { id: 'custom', label: '✏️ נוסח משלי', text: () => '' },
]
// Colored rays as SVG wedges (the PDF export can't draw CSS conic gradients).
const RAY_COLORS = ['#ff8fb1', '#ffd66b', '#8fd3ff', '#b9a2ff', '#9be7b4', '#ffb38a']
const RAYS = Array.from({ length: 24 }, (_, i) => {
  const a1 = (i * 15 - 90) * Math.PI / 180, a2 = ((i + 1) * 15 - 90) * Math.PI / 180, r = 200
  return { d: `M100 100 L${(100 + r * Math.cos(a1)).toFixed(1)} ${(100 + r * Math.sin(a1)).toFixed(1)} L${(100 + r * Math.cos(a2)).toFixed(1)} ${(100 + r * Math.sin(a2)).toFixed(1)}Z`, fill: RAY_COLORS[i % RAY_COLORS.length] }
})
const today = () => { const d = new Date(); return `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}` }

function Cert({ name, title, reason, date, signer }) {
  return <div className="sw-cert">
    <svg className="sw-rays" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{RAYS.map((r, i) => <path key={i} d={r.d} fill={r.fill} />)}</svg>
    <div className="sw-card">
      <div className="sw-star" aria-hidden="true">★</div>
      <h2 className="sw-title">{title}</h2>
      <p className="sw-to">התעודה מוענקת ל:</p>
      <div className="sw-name">{name || ' '}</div>
      <p className="sw-reason">{reason || ' '}</p>
      <div className="sw-sign"><span><b>{date || ' '}</b>תאריך</span><span><b>&nbsp;</b>{signer}</span></div>
    </div>
  </div>
}

export default function StarOfTheWeek() {
  const [names, setNames] = useState('')
  const [place, setPlace] = useState('class') // 'gan' | 'class'
  const [g, setG] = useState('both')
  const [reasonId, setReasonId] = useState('atmosphere')
  const [custom, setCustom] = useState('')
  const [date, setDate] = useState(today)
  const [signer, setSigner] = useState('')
  const [perPage, setPerPage] = useState(2)
  const [printing, setPrinting] = useState(false)
  const [light, setLight] = useState(false)
  const list = parseNames(names)
  const where = place === 'gan' ? 'לגן' : 'לכיתה'
  const reason = reasonId === 'custom' ? custom.trim() : REASONS.find(r => r.id === reasonId).text(where)
  const title = g === 'm' ? 'כוכב השבוע' : g === 'f' ? 'כוכבת השבוע' : 'כוכב/ת השבוע'
  const sign = cleanName(signer) || (place === 'gan' ? 'הגננת' : 'המחנך/ת')
  const all = list.length ? list : ['']
  const pages = []
  for (let i = 0; i < all.length; i += perPage) pages.push(all.slice(i, i + perPage))
  const props = { title, reason, date: cleanName(date), signer: sign }
  const chip = (on, onClick, label) => <button type="button" aria-pressed={on} onClick={onClick} className={`min-h-11 rounded-xl border-2 px-3 font-bold ${on ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white'}`}>{label}</button>

  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="כוכב השבוע להדפסה — תעודה לגן ולכיתה עם שם הילד" description="תעודת כוכב/ת השבוע להדפסה בחינם: כותבים שם (או מדביקים את כל הכיתה), בוחרים נוסח — על אווירה טובה, התמדה, עזרה לחברים — ומדפיסים. לגן ולבית הספר." path="/printables/star-of-the-week" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'להדפסה', href: '/printables' }, { label: 'כוכב השבוע' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl">⭐ כוכב/ת השבוע</h1>
    <p className="mx-auto mb-5 mt-2 max-w-2xl text-center text-lg text-slate-600">תעודה צבעונית לגן ולכיתה. כותבים שם, בוחרים על מה — ומדפיסים.</p>

    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="גן או כיתה">{chip(place === 'gan', () => setPlace('gan'), '🧸 לגן')}{chip(place === 'class', () => setPlace('class'), '🎒 לכיתה')}</div>
        <label className="block font-bold">שם הילד/ה — או כל השמות, שם בכל שורה
          <textarea rows={3} value={names} onChange={e => setNames(e.target.value)} placeholder={'נועה כהן\nאורי לוי'} className="mt-1 w-full rounded-xl border-2 border-slate-300 p-2 text-lg font-normal" />
        </label>
        <UseClassRoster onUse={l => setNames(l.join('\n'))} />
        <div className="flex flex-wrap gap-2" role="group" aria-label="כוכב או כוכבת">{chip(g === 'm', () => setG('m'), '👦 כוכב')}{chip(g === 'f', () => setG('f'), '👧 כוכבת')}{chip(g === 'both', () => setG('both'), 'כוכב/ת (רשימה מעורבת)')}</div>
        <div><p className="mb-1 font-bold">על מה?</p><div className="flex flex-wrap gap-2">{REASONS.map(r => chip(reasonId === r.id, () => setReasonId(r.id), r.label))}</div>
          {reasonId === 'custom' && <textarea rows={2} maxLength={140} value={custom} onChange={e => setCustom(e.target.value)} placeholder="למשל: על העזרה בהכנת פינת החג" aria-label="נוסח משלי" className="mt-2 w-full rounded-xl border-2 border-slate-300 p-2 text-lg" />}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block font-bold">תאריך<input value={date} maxLength={MAX_NAME} onChange={e => setDate(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-300 p-2 text-lg font-normal" /></label>
          <label className="block font-bold">חתימה<input value={signer} maxLength={MAX_NAME} onChange={e => setSigner(e.target.value)} placeholder={place === 'gan' ? 'הגננת' : 'המחנך/ת'} className="mt-1 w-full rounded-xl border-2 border-slate-300 p-2 text-lg font-normal" /></label>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="כמה בעמוד">{chip(perPage === 2, () => setPerPage(2), '2 בעמוד (חוסך נייר)')}{chip(perPage === 1, () => setPerPage(1), '1 בעמוד (גדול)')}{chip(light, () => setLight(!light), '🖨️ חוסך דיו')}</div>
        <button type="button" onClick={() => setPrinting(true)} className="min-h-12 w-full rounded-xl bg-violet-700 px-5 text-lg font-black text-white">🖨️ {list.length > 1 ? `הדפסת ${list.length} תעודות` : 'הדפסה'}</button>
        <p className="text-sm text-slate-500">{list.length ? `${list.length} שמות${list.length >= MAX_CERTS ? ` (עד ${MAX_CERTS} בכל הדפסה)` : ''}` : 'בלי שם? מודפסת תעודה עם מקום לכתוב ביד.'} השמות לא נשלחים לשום מקום.</p>
      </div>
      <div aria-label="תצוגה מקדימה"><p className="mb-2 text-center font-bold text-slate-600">ככה זה ייראה</p><div className={`sw-preview${light ? ' ink-light' : ''}`}><Cert name={list[0] || ''} {...props} /></div></div>
    </div>

    {printing && <PrintPreview title={title} onClose={() => setPrinting(false)}>
      {pages.map((page, i) => <div key={i} className={`buga-a4 sw-page per-${perPage}${light ? ' ink-light' : ''}`} dir="rtl">{page.map((n, j) => <Cert key={j} name={n} {...props} />)}</div>)}
    </PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'כוכב/ת השבוע הוא דרך פשוטה לראות כל ילד: פעם בשבוע בוחרים ילד או ילדה ומספרים לכולם על משהו טוב שעשו — עזרו לחבר, התמידו, הקשיבו או הביאו שמחה. תעודה צבעונית שהולכת הביתה הופכת את הרגע לזיכרון, וההורים שומעים על זה מהילד עצמו.',
      'כאן מכינים את התעודה בדקה: כותבים שם, או מדביקים את כל שמות הכיתה ומקבלים תעודה נפרדת לכל אחד, בוחרים נוסח מוכן או כותבים משפט משלכם, ומדפיסים שתיים בעמוד כדי לחסוך נייר. טיפ: כדאי לדאוג שלאורך השנה כל ילד יזכה לפחות פעם אחת — וכל אחד מסיבה אחרת.',
    ]} faq={FAQ} related={[{ label: 'טבלת מדבקות ופרסים', href: '/printables/reward-chart' }, { label: 'רשימת הכיתה שלי', href: '/classroom/roster' }, { label: 'לוחות לבית ולכיתה', href: '/printables/home-charts' }]} /></div>
    <p className="mt-6 text-center"><Link to="/printables" className="underline">לכל הדפים להדפסה ←</Link></p>
  </div>
}

const FAQ = [
  { q: 'איך מכינים תעודת כוכב השבוע?', a: 'כותבים את שם הילד, בוחרים אם זה לגן או לכיתה ועל מה הוא מקבל את התעודה, ולוחצים הדפסה. אפשר להדביק רשימה של כל הכיתה ולקבל תעודה לכל ילד.' },
  { q: 'אפשר לכתוב נוסח משלי?', a: 'כן — בוחרים ״נוסח משלי״ וכותבים משפט קצר, למשל על משהו מסוים שהילד עשה השבוע. משפט אישי מרגש יותר מנוסח כללי.' },
  { q: 'כמה תעודות נכנסות בעמוד?', a: 'שתיים בעמוד A4 (כל אחת בגודל חצי דף), או אחת גדולה. אפשר גם לשמור כ־PDF ולשלוח להורים.' },
  { q: 'איך בוחרים את כוכב השבוע?', a: 'רעיון שעובד: עוקבים שכל ילד יזכה לפחות פעם בשנה, ומחפשים בכל שבוע ילד שעשה משהו טוב — לא רק הצטיינות בלימודים, גם עזרה, התמדה או התקדמות.' },
]
