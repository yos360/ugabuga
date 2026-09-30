import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import DiceFamilyLinks from './dice/DiceFamilyLinks'

const FAQ = [
  { q: 'איך מגרילים מספר אקראי?', a: 'בוחרים מספר מינימום ומקסימום ולוחצים "הגרילו". כל מספר בטווח, כולל הקצוות, יכול לצאת באותה הסתברות.' },
  { q: 'אפשר להגריל כמה מספרים בלי חזרות?', a: 'כן. מסמנים "בלי חזרות" ובוחרים כמה מספרים להגריל — למשל 5 מספרים שונים מתוך 1 עד 30, כמו הגרלה בכיתה.' },
  { q: 'למה זה שימושי בכיתה?', a: 'אפשר להגריל מספר תלמיד מהיומן, סדר הצגת עבודות או מספר שאלה מתוך דף עבודה — בצורה הוגנת ושקופה לכולם.' },
]

export default function RandomNumber() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [qty, setQty] = useState(1)
  const [unique, setUnique] = useState(true)
  const [result, setResult] = useState([])
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const draw = () => {
    const lo = Math.ceil(Number(min)), hi = Math.floor(Number(max)), n = Math.floor(Number(qty))
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi) return setError('המינימום צריך להיות קטן או שווה למקסימום.')
    if (!(n >= 1 && n <= 100)) return setError('אפשר להגריל בין 1 ל-100 מספרים בבת אחת.')
    const range = hi - lo + 1
    if (unique && n > range) return setError(`בטווח הזה יש רק ${range} מספרים — אי אפשר להגריל ${n} בלי חזרות.`)
    setError('')
    const out = []
    const seen = new Set()
    while (out.length < n) {
      const v = lo + Math.floor(Math.random() * range)
      if (unique && seen.has(v)) continue
      seen.add(v); out.push(v)
    }
    setResult(out)
    setHistory(h => [out.join(', '), ...h].slice(0, 8))
  }

  const field = 'w-full border-2 border-[var(--border)] bg-white px-3 py-2 text-lg wobbly-sm'
  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="מספר אקראי — מחולל מספרים רנדומליים אונליין" description="הגרלת מספר אקראי בטווח שתבחרו: מספר אחד או כמה מספרים, עם או בלי חזרות. להגרלות בכיתה, למשחקים ולבחירת תור — חינם, בלי הרשמה." path="/tools/random-number" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'מספר אקראי' }]} />
      <h1 className="text-4xl text-center mb-2">🔢 מספר אקראי</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">בוחרים טווח, לוחצים — ומקבלים מספר רנדומלי</p>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <label className="font-bold">מ-<input type="number" inputMode="numeric" value={min} onChange={e => setMin(e.target.value)} className={field} /></label>
        <label className="font-bold">עד<input type="number" inputMode="numeric" value={max} onChange={e => setMax(e.target.value)} className={field} /></label>
        <label className="font-bold">כמה<input type="number" inputMode="numeric" min="1" max="100" value={qty} onChange={e => setQty(e.target.value)} className={field} /></label>
      </div>
      <label className="flex items-center gap-2 mb-5 font-bold"><input type="checkbox" checked={unique} onChange={e => setUnique(e.target.checked)} /> בלי חזרות</label>
      <div className="text-center mb-5">
        <button onClick={draw} className="wobbly-md sketch-press min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-10 py-3 font-display text-xl font-bold text-[var(--accent-foreground)]">🎰 הגרילו</button>
      </div>
      {error && <p role="alert" className="text-center text-red-700 font-bold mb-4">{error}</p>}
      {result.length > 0 && !error && (
        <div aria-live="polite" className="wobbly border-[3px] border-[var(--border)] bg-[var(--postit)] p-6 text-center font-display font-bold mb-5">
          <span className={result.length === 1 ? 'text-7xl' : 'text-3xl leading-relaxed'}>{result.join(' · ')}</span>
        </div>
      )}
      {history.length > 1 && <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4"><h2 className="font-display text-lg font-bold mb-2">הגרלות קודמות</h2>{history.slice(1).map((h, i) => <p key={i} className="font-hand">{h}</p>)}</div>}
      <DiceFamilyLinks current="/tools/random-number" />
      <div className="mt-10">
        <SeoBody paragraphs={['מחולל מספרים אקראיים שימושי להרבה דברים: להגריל מי מתחיל במשחק, לבחור תלמיד לפי מספר ביומן, להגריל זוכה בתחרות או לבחור שאלה מתוך רשימה ממוספרת.', 'אפשר להגריל מספר אחד או כמה מספרים יחד. במצב "בלי חזרות" כל מספר יוצא לכל היותר פעם אחת — בדיוק כמו לשלוף פתקים מכובע.']} faq={FAQ} related={[{ label: 'גלגל מזל', href: '/tools/random-picker' }, { label: 'הטלת מטבע', href: '/tools/coin-flip' }, { label: 'קוביה וירטואלית', href: '/tools/dice' }]} />
      </div>
    </div>
  )
}
