import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { SupplierCard } from '../../components/suppliers/SupplierBits'
import { suppliersDb } from '../../utils/suppliersDb'
import { SUPPLIER_CATEGORIES, SUPPLIER_AREAS } from '../../data/supplierOptions'

// Static guide under the directory: how it works, what to ask a supplier, FAQ.
const ASK = [
  ['📅 זמינות ומשך', 'האם הספק פנוי בתאריך ובשעה, וכמה זמן נמשכת ההפעלה בפועל, לא כולל הקמה ופירוק.'],
  ['💸 מה כלול במחיר', 'ציוד, הגברה, פרסים או קישוטים, והאם יש תוספת נסיעה לאזור שלכם.'],
  ['🧒 גיל ומספר ילדים', 'לאיזה גיל ההפעלה מתאימה, ועד כמה ילדים היא עובדת טוב.'],
  ['🔌 מה צריך להכין', 'שטח פנוי, שקע חשמל, שולחן או צל. כדאי לדעת מראש, ולא בבוקר של המסיבה.'],
  ['🌧️ ביטול ומזג אוויר', 'מה קורה אם צריך לבטל או לדחות, ומה התוכנית אם יורד גשם באירוע בחוץ.'],
  ['🎥 דוגמאות והמלצות', 'תמונות או סרטונים מאירועים קודמים, והמלצות מהורים שכבר הזמינו.'],
]
const FAQ = [
  { q: 'עוגה בוגה גובה עמלה על הזמנת ספק?', a: 'לא. פונים לספק ישירות בוואטסאפ, בלי תיווך ובלי עמלות. המחיר והתנאים נקבעים רק ביניכם לבין הספק.' },
  { q: 'מי כותב את המידע בכרטיסי הספקים?', a: 'את רוב הכרטיסים כותבים הספקים עצמם, וכרטיס שספק פותח עובר בדיקה קצרה לפני שהוא עולה לאתר. לפני שסוגרים, כדאי לשאול את השאלות שברשימה למעלה ולבקש דוגמאות מאירועים קודמים.' },
  { q: 'כמה זמן מראש כדאי להזמין ספק ליום הולדת?', a: 'בסופי שבוע, בחופשות ובתקופות עמוסות כמו חנוכה וסוף שנת הלימודים, כדאי לפנות כמה שבועות מראש. לאירוע באמצע השבוע לפעמים מספיקים כמה ימים.' },
  { q: 'איך מצטרפים כספק?', a: 'לוחצים על "הצטרפות כספק", ממלאים לוגו, תמונה, כמה מילים עליכם ומספר וואטסאפ. כרטיס ספק בסיסי בעוגה בוגה הוא בחינם.' },
]
function SuppliersGuide() {
  return <section className="mx-auto mt-12 max-w-3xl">
    <h2 className="mb-2 text-3xl font-bold">איך עובד לוח הספקים?</h2>
    <p className="mb-3 text-lg leading-relaxed">כל כרטיס כאן שייך לספק שמציע שירות לימי הולדת ולאירועי ילדים: מפעילים, קוסמים, אופות, צלמים, מעצבי בלונים, מתנפחים ועוד. מסננים לפי סוג השירות ולפי האזור, ופונים לספק ישירות בוואטסאפ מתוך הכרטיס. ספקים שעובדים בכל הארץ מופיעים בכל אזור שתבחרו.</p>
    <p className="mb-8 text-lg leading-relaxed">עוגה בוגה לא מתווכת ולא לוקחת אחוזים, ולכן גם לא נותנת הצעות מחיר. את המחיר, השעות והתנאים סוגרים מול הספק. כדאי לפנות לשניים־שלושה ספקים באותו תחום ולהשוות.</p>
    <h2 className="mb-3 text-3xl font-bold">מה לשאול ספק לפני שסוגרים</h2>
    <div className="mb-4 grid gap-3 sm:grid-cols-2">{ASK.map(([t, d]) => <div key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"><h3 className="mb-1 text-lg font-bold">{t}</h3><p className="text-[var(--foreground)]/80">{d}</p></div>)}</div>
    <p className="mb-10 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-4">🏰 מזמינים מתנפח? ודאו שהוא מוצב על שטח ישר ומעוגן היטב, שמספר הילדים עליו מוגבל לפי הוראות הספק, ושמבוגר משגיח כל הזמן.</p>
    <SeoBody faq={FAQ} related={[{ label: 'יום הולדת בלי מפעיל', href: '/guides/birthday-without-entertainer' }, { label: 'מפעיל או לבד? השוואה', href: '/compare/entertainer-vs-diy' }, { label: 'מחשבון מסיבה', href: '/calculator' }, { label: 'איך מתכננים יום הולדת', href: '/guides/how-to-plan-birthday' }, { label: 'תקציב ליום הולדת', href: '/guides/birthday-budget' }]} />
  </section>
}

export default function SuppliersIndex() {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [cat, setCat] = useState('')
  const [area, setArea] = useState('')
  const [q, setQ] = useState('')
  useEffect(() => { suppliersDb.list().then(setList).catch(e => setError(e.message)) }, [])

  const shown = useMemo(() => (list || []).filter(s =>
    (!cat || s.category === cat) &&
    (!area || s.area === area || s.area === 'כל הארץ') &&
    (!q.trim() || `${s.name} ${s.tagline || ''} ${s.about || ''} ${(s.tags || []).join(' ')}`.includes(q.trim()))
  ), [list, cat, area, q])
  const usedCats = useMemo(() => SUPPLIER_CATEGORIES.filter(([id]) => (list || []).some(s => s.category === id)), [list])

  return <div className="mx-auto max-w-6xl px-4 py-8">
    <SEO title="ספקים לימי הולדת ואירועי ילדים" description="ספקים לימי הולדת ואירועי ילדים: מפעילים, קוסמים, עוגות, צילום, בלונים ומתנפחים — פנייה ישירה בוואטסאפ, בלי תיווך." path="/suppliers" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ספקים' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl">🎪 ספקים לימי הולדת</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">מפעילים, קוסמים, עוגות, צילום ועוד — פונים ישירות בוואטסאפ, בלי תיווך ובלי עמלות.</p>
    </header>

    <div className="mb-6 space-y-3 rounded-3xl bg-white p-4 shadow-sm">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 חיפוש: קוסם, עוגת בצק סוכר, צלמת…" aria-label="חיפוש ספק"
        className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-slate-800 focus:outline-none" />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button onClick={() => setCat('')} aria-pressed={!cat} className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-sm font-bold ${!cat ? 'border-[var(--ink)] bg-[var(--postit)]' : 'border-slate-200 bg-white'}`}>הכול</button>
        {(usedCats.length ? usedCats : SUPPLIER_CATEGORIES).map(([id, label]) => <button key={id} onClick={() => setCat(c => c === id ? '' : id)} aria-pressed={cat === id}
          className={`shrink-0 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-bold ${cat === id ? 'border-[var(--ink)] bg-[var(--postit)]' : 'border-slate-200 bg-white'}`}>{label}</button>)}
      </div>
      <select value={area} onChange={e => setArea(e.target.value)} aria-label="אזור" className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-bold">
        <option value="">📍 כל האזורים</option>
        {SUPPLIER_AREAS.filter(a => a !== 'כל הארץ').map(a => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>

    {error ? <p className="rounded-2xl bg-amber-50 p-5 text-center">{error}</p>
      : !list ? <p className="py-10 text-center text-lg">טוענים ספקים…</p>
      : shown.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map((s, i) => <SupplierCard key={s.id} s={s} index={i} />)}</div>
      : <p className="rounded-2xl bg-slate-50 p-8 text-center text-lg">{list.length ? 'לא מצאנו ספק שמתאים לחיפוש. נסו לשנות סינון.' : 'הספקים הראשונים מצטרפים ממש עכשיו 🎈'}</p>}

    <section className="wobbly mt-10 border-2 border-[var(--border)] bg-[var(--postit)] p-6 text-center sm:p-8">
      <h2 className="font-display text-3xl font-bold">נותנים שירות לימי הולדת?</h2>
      <p className="mx-auto mt-2 max-w-xl text-lg">כרטיס ספק בעוגה בוגה הוא בחינם: לוגו, תמונה, קצת עליכם ופנייה ישירה בוואטסאפ. ובקרוב ⭐ בוגה פרימיום: עמוד ספק מקצועי שאפשר לשלוח ללקוחות, לשים בביו ובוואטסאפ.</p>
      <Link to="/suppliers/me" className="mt-5 inline-block rounded-2xl bg-[var(--ink)] px-6 py-3 text-lg font-bold text-white">הצטרפות כספק ←</Link>
    </section>
    <SuppliersGuide />
  </div>
}
