import { Link } from 'react-router-dom'
import '../../learn/learn.css'

export const HUB = { label: 'בר ובת מצווה', href: '/bar-mitzvah' }
export const crumbs = label => [{ label: 'ראשי', href: '/' }, HUB, { label }]

// The hub's tools (spokes), in the order a family needs them.
export const SPOKES = [
  { href: '/bar-mitzvah/date', emoji: '📅', title: 'מתי הבר מצווה?', short: 'מחשבון תאריך', desc: 'תאריך עברי, השבת הקרובה והפרשה — כולל אדר א׳ ואדר ב׳.' },
  { href: '/bar-mitzvah/checklist', emoji: '✅', title: 'צ׳קליסט לבר מצווה', short: 'צ׳קליסט', desc: 'מה עושים ומתי — משנה לפני ועד היום עצמו, עם תאריכים.' },
  { href: '/bar-mitzvah/speech', emoji: '🎤', title: 'דרשה ונאום', short: 'דרשה', desc: 'עונים על כמה שאלות ומקבלים טיוטה אישית לנאום.' },
  { href: '/bar-mitzvah/quiz', emoji: '❓', title: 'חידון על החוגג/ת', short: 'חידון', desc: 'חידון לאורחים: על המסך, בטלפונים או מודפס.' },
  { href: '/bar-mitzvah/souvenir', emoji: '💌', title: 'מזכרת לבת ולבר מצווה', short: 'מזכרות', desc: 'כרטיסי ברכה לאורחים, קפסולת זמן ורעיונות למזכרת.' },
]

// Small strip under each spoke page: back to the hub and the sibling tools.
export function SpokeNav({ current }) {
  return (
    <nav aria-label="כלים לבר ולבת מצווה" className="no-print mt-10 rounded-2xl border-2 border-dashed border-[var(--border)] p-4">
      <p className="m-0 mb-3 font-bold"><Link to="/bar-mitzvah" className="underline">כל המדריך לבר ולבת מצווה</Link> · עוד כלים:</p>
      <div className="flex flex-wrap gap-2">
        {SPOKES.filter(s => s.href !== current).map(s => (
          <Link key={s.href} to={s.href} className="ln-chip no-underline"><span aria-hidden="true">{s.emoji}</span>{s.short}</Link>
        ))}
      </div>
    </nav>
  )
}

export const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>

export const GenderChips = ({ gender, setGender }) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label="בר מצווה או בת מצווה">
    <Chip on={gender === 'boy'} onClick={() => setGender('boy')}>בר מצווה (בן)</Chip>
    <Chip on={gender === 'girl'} onClick={() => setGender('girl')}>בת מצווה (בת)</Chip>
  </div>
)

export const inputCls = 'mt-1 block w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-lg'

// localStorage is only a convenience (saved ticks / drafts): every access is guarded.
export const store = {
  get(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback } catch { return fallback } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ } },
}
