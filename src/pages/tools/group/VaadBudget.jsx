import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import PrintPreview from '../../../components/ui/PrintPreview'

// /vaad/budget: a yearly budget for a class parents' committee. Rows follow the school year in order;
// each row is priced per child, per staff member or as a fixed sum. Saved only in this browser.
const KEY = 'buga-vaad-budget-v1'
const MODES = { kid: 'לכל ילד', staff: 'לכל איש צוות', fixed: 'סכום קבוע' }
const DEFAULT_ROWS = [
  ['ספטמבר', 'פתיחת שנה וראש השנה — כיבוד ושי קטן לילדים', 10, 'kid'],
  ['ספטמבר', 'שי לצוות לראש השנה', 50, 'staff'],
  ['דצמבר', 'חנוכה — מסיבה, סופגניות ושי קטן', 15, 'kid'],
  ['ינואר', 'ט״ו בשבט — פירות יבשים', 5, 'kid'],
  ['מרץ', 'פורים — משלוח מנות ותחפושת קטנה', 15, 'kid'],
  ['אפריל', 'שי לצוות לפסח', 100, 'staff'],
  ['כל השנה', 'ימי הולדת — מתנה קטנה לכל ילד', 20, 'kid'],
  ['יוני', 'סוף שנה — מסיבה וכיבוד', 30, 'kid'],
  ['יוני', 'מתנת סוף שנה לצוות', 200, 'staff'],
  ['כל השנה', 'הוצאות לא צפויות (רזרבה)', 300, 'fixed'],
].map(([when, name, amount, mode], i) => ({ id: i + 1, when, name, amount, mode }))
const DEFAULTS = { kids: 30, staff: 2, perKid: 150, rows: DEFAULT_ROWS }
const nis = n => `${Math.round(n).toLocaleString('he-IL')} ₪`
const FAQ = [
  { q: 'כמה גובים לוועד הורים בשנה?', a: 'אין סכום אחד. הרבה ועדים גובים בין 100 ל־250 ₪ לילד לשנה. המתכנן מראה מראש אם הסכום שבחרתם מכסה את כל ההוצאות, ומה נשאר לרזרבה.' },
  { q: 'באיזה סדר מתכננים את ההוצאות?', a: 'לפי לוח השנה: פתיחת שנה וראש השנה, חנוכה, ט״ו בשבט, פורים, פסח, ובסוף מסיבת סיום ומתנה לצוות. ימי הולדת ורזרבה פרוסים על כל השנה. כדאי לשריין קודם את סוף השנה, כי שם ההוצאה הגדולה.' },
  { q: 'איך מחשבים מתנה לצוות לפסח ולסוף שנה?', a: 'קובעים סכום לכל איש צוות (גננת, סייעת, מורה) ומכפילים במספר אנשי הצוות. במתכנן בוחרים "לכל איש צוות", והחישוב נעשה לבד.' },
  { q: 'הנתונים נשמרים?', a: 'רק בדפדפן שלכם, בלי הרשמה. כדי לשתף את שאר הוועד לוחצים על "שליחה בוואטסאפ" או מדפיסים.' },
]

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.rows)) return s } catch { /* no saved budget */ }
  return DEFAULTS
}

export default function VaadBudget() {
  const [b, setB] = useState(DEFAULTS), [print, setPrint] = useState(false), [copied, setCopied] = useState(false)
  useEffect(() => { setB(load()) }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(b)) } catch { /* storage unavailable */ } }, [b])
  const set = (k, v) => setB(x => ({ ...x, [k]: v }))
  const setRow = (id, k, v) => setB(x => ({ ...x, rows: x.rows.map(r => (r.id === id ? { ...r, [k]: v } : r)) }))
  const cost = r => (Number(r.amount) || 0) * (r.mode === 'kid' ? Number(b.kids) || 0 : r.mode === 'staff' ? Number(b.staff) || 0 : 1)
  const income = (Number(b.kids) || 0) * (Number(b.perKid) || 0)
  const spent = b.rows.reduce((s, r) => s + cost(r), 0)
  const left = income - spent
  const needPerKid = b.kids > 0 ? Math.ceil(spent / b.kids) : 0
  const summary = `תקציב ועד הורים לשנה\n${b.kids} ילדים × ${b.perKid} ₪ = ${nis(income)}\n\n${b.rows.map(r => `• ${r.when}: ${r.name} — ${nis(cost(r))}`).join('\n')}\n\nסה״כ הוצאות: ${nis(spent)}\n${left >= 0 ? `נשאר: ${nis(left)}` : `חסר: ${nis(-left)}`}\n\nנבנה במתכנן התקציב של עוגה בוגה: https://ugabuga.co.il/vaad/budget`
  const copy = async () => { try { await navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) } }
  const num = 'w-full min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-2 text-lg font-bold'
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="תקציב ועד הורים — מתכנן הוצאות לשנה, בחינם" description="מתכנן תקציב לוועד הורים בגן ובכיתה: כמה לגבות, באיזה סדר להוציא, ומתנות לצוות לפסח ולסוף שנה. מחשב לבד כמה נשאר, להדפסה ולשליחה בוואטסאפ." path="/vaad/budget" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ועד הורים', href: '/vaad' }, { label: 'תקציב שנתי' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl">💰 תקציב ועד הורים לשנה</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">ממלאים כמה ילדים וכמה גובים, ומקבלים רשימת הוצאות מסודרת לפי השנה. כל סכום אפשר לשנות, והחישוב מתעדכן לבד.</p>
    </header>

    <section className="mb-6 grid grid-cols-3 gap-3 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-4 sketch-shadow">
      <label className="font-bold">👧 ילדים<input type="number" min="0" inputMode="numeric" className={num} value={b.kids} onChange={e => set('kids', e.target.value)} /></label>
      <label className="font-bold">👩‍🏫 אנשי צוות<input type="number" min="0" inputMode="numeric" className={num} value={b.staff} onChange={e => set('staff', e.target.value)} /></label>
      <label className="font-bold">💳 גבייה לילד (₪)<input type="number" min="0" inputMode="numeric" className={num} value={b.perKid} onChange={e => set('perKid', e.target.value)} /></label>
    </section>

    <div className="sticky top-2 z-10 mb-5 grid grid-cols-3 gap-2 rounded-2xl border-2 border-slate-800 bg-white p-3 text-center shadow">
      <div><small>נאסף</small><b className="block text-xl">{nis(income)}</b></div>
      <div><small>מתוכנן</small><b className="block text-xl">{nis(spent)}</b></div>
      <div className={left >= 0 ? 'text-green-700' : 'text-red-600'}><small>{left >= 0 ? 'נשאר' : 'חסר'}</small><b className="block text-xl">{nis(Math.abs(left))}</b></div>
    </div>
    {left < 0 && <p className="mb-4 rounded-xl bg-red-50 p-3 text-lg" role="status">⚠️ כדי לכסות את כל ההוצאות צריך לגבות לפחות <b>{nis(needPerKid)}</b> לילד, או להקטין כמה סעיפים.</p>}

    <h2 className="mb-3 text-2xl font-black">📅 ההוצאות לפי סדר השנה</h2>
    <div className="space-y-3">{b.rows.map(r => <div key={r.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3">
      <div className="mb-2 flex gap-2">
        <input aria-label="מתי" className="w-24 min-h-[44px] rounded-xl border-2 border-slate-300 px-2 font-bold" value={r.when} onChange={e => setRow(r.id, 'when', e.target.value)} />
        <input aria-label="סעיף" className="min-h-[44px] flex-1 rounded-xl border-2 border-slate-300 px-2" value={r.name} onChange={e => setRow(r.id, 'name', e.target.value)} />
        <button type="button" aria-label={`מחיקת ${r.name}`} onClick={() => setB(x => ({ ...x, rows: x.rows.filter(y => y.id !== r.id) }))} className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 text-xl">🗑️</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input type="number" min="0" inputMode="numeric" aria-label="סכום" className="w-24 min-h-[44px] rounded-xl border-2 border-slate-300 px-2 text-lg font-bold" value={r.amount} onChange={e => setRow(r.id, 'amount', e.target.value)} />
        <span>₪</span>
        <select aria-label="איך מחשבים" className="min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-2" value={r.mode} onChange={e => setRow(r.id, 'mode', e.target.value)}>{Object.entries(MODES).map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
        <b className="mr-auto text-xl">= {nis(cost(r))}</b>
      </div>
    </div>)}</div>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={() => setB(x => ({ ...x, rows: [...x.rows, { id: Math.max(0, ...x.rows.map(y => y.id)) + 1, when: '', name: 'סעיף חדש', amount: 0, mode: 'fixed' }] }))} className="min-h-[48px] rounded-xl border-2 border-slate-800 bg-white px-5 font-bold">➕ הוספת סעיף</button>
      <a href={`https://wa.me/?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer" className="flex min-h-[48px] items-center rounded-xl bg-green-600 px-5 font-bold text-white">💬 שליחה בוואטסאפ</a>
      <button type="button" onClick={copy} className="min-h-[48px] rounded-xl bg-slate-800 px-5 font-bold text-white">{copied ? '✓ הועתק' : '📋 העתקת הסיכום'}</button>
      <button type="button" onClick={() => setPrint(true)} className="min-h-[48px] rounded-xl bg-amber-600 px-5 font-bold text-white">🖨️ הדפסה</button>
      <button type="button" onClick={() => setB(DEFAULTS)} className="min-h-[48px] rounded-xl px-4 underline">התחלה מחדש</button>
    </div>
    <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">הסכומים הם הצעה בלבד. הנתונים נשמרים רק בדפדפן הזה.</p>

    {print && <PrintPreview title="תקציב ועד הורים" onClose={() => setPrint(false)}><article className="buga-flow" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: '10mm' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800 }}>תקציב ועד הורים לשנה</h2>
      <p style={{ fontSize: 16, margin: '6px 0 12px' }}>{b.kids} ילדים · {b.staff} אנשי צוות · גבייה {b.perKid} ₪ לילד · נאסף {nis(income)}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}><thead><tr>{['מתי', 'סעיף', 'חישוב', 'סכום'].map(h => <th key={h} style={{ borderBottom: '2px solid #333', textAlign: 'right', padding: 6 }}>{h}</th>)}</tr></thead>
        <tbody>{b.rows.map(r => <tr key={r.id}><td style={{ borderBottom: '1px solid #ccc', padding: 6 }}>{r.when}</td><td style={{ borderBottom: '1px solid #ccc', padding: 6 }}>{r.name}</td><td style={{ borderBottom: '1px solid #ccc', padding: 6 }}>{r.amount} ₪ {MODES[r.mode]}</td><td style={{ borderBottom: '1px solid #ccc', padding: 6, fontWeight: 700 }}>{nis(cost(r))}</td></tr>)}</tbody></table>
      <p style={{ fontSize: 18, fontWeight: 800, marginTop: 12 }}>סה״כ הוצאות: {nis(spent)} · {left >= 0 ? `נשאר: ${nis(left)}` : `חסר: ${nis(-left)}`}</p>
    </article></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לוועד: <Link className="font-bold underline" to="/vaad">כל הכלים לוועד הורים</Link> · <Link className="font-bold underline" to="/gifts/teacher-end-of-year">מתנה למורה לסוף השנה</Link> · <Link className="font-bold underline" to="/gifts/gananet">מתנה לגננת</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['תקציב ועד הורים מתחיל בשתי שאלות: כמה כסף ייאסף השנה, ולאן הוא ילך. המתכנן מסדר את ההוצאות לפי השנה, מפתיחת השנה ועד מסיבת הסיום, ומחשב כל סעיף לפי מספר הילדים או מספר אנשי הצוות.', 'הטיפ החשוב: לשריין מההתחלה את המתנה לצוות בסוף השנה ואת המסיבה, ולהשאיר רזרבה להוצאות לא צפויות. כשהתקציב מוכן, שולחים את הסיכום לשאר הוועד או לקבוצת ההורים, וכולם יודעים מראש על מה הולך הכסף.']} faq={FAQ} related={[{ label: 'ועד הורים — כל הכלים', href: '/vaad' }, { label: 'אישור הגעה ותשלום למסיבת כיתה', href: '/rsvp' }]} /></div>
  </div>
}
