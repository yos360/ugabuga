import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { suppliersDb } from '../../utils/suppliersDb'
import { PREMIUM } from './SupplierPlans'

// The founding-supplier offer: the first 50 suppliers get a reduced price for life once paid plans open.
// Founders are marked automatically in the database (sup_auto_founder trigger).
export const FOUNDING = { limit: 50, freeMonths: 'חודשיים', month: '9.90' }

export function useFoundingPlaces() {
  const [left, setLeft] = useState(null)
  useEffect(() => {
    let live = true
    suppliersDb.founding().then(d => { if (live && d) setLeft(Math.max(0, (d.limit || FOUNDING.limit) - (d.taken || 0))) }).catch(() => {})
    return () => { live = false }
  }, [])
  return left
}

const PERKS = [
  'כרטיס ספק באתר בחינם, כבר עכשיו',
  'תג 🏅 ספק מייסד על הכרטיס ובעמוד שלכם',
  `כשהמסלול בתשלום ייפתח: עוד ${FOUNDING.freeMonths} חינם`,
  `ואחריהם רק ${FOUNDING.month} ₪ לחודש, מחיר מייסד (במקום ${PREMIUM.month} ₪)`,
]

// `isFounder`: the signed-in supplier already holds a founding place.
export default function FoundingOffer({ cta = true, isFounder = false, className = '' }) {
  const left = useFoundingPlaces()
  if (left === 0 && !isFounder) return null
  return <section className={`wobbly border-2 border-amber-400 bg-amber-50 p-5 sm:p-6 ${className}`} aria-labelledby="founding-h">
    <h2 id="founding-h" className="font-display text-2xl font-bold sm:text-3xl">🏅 {isFounder ? 'אתם ספק מייסד!' : `${FOUNDING.limit} הספקים הראשונים = ספקים מייסדים`}</h2>
    <p className="mt-1 text-lg">
      {isFounder ? 'שמרנו לכם מחיר מייסד מוזל לתמיד. הוא תקף גם כשההרשמה בתשלום תיפתח.'
        : 'מי שמצטרף עכשיו, כשהאתר עוד צומח, מקבל מחיר מוזל לתמיד כשההרשמה בתשלום תיפתח.'}
    </p>
    {left != null && !isFounder && <p className="mt-2 inline-block rounded-full bg-white px-3 py-1 font-bold text-amber-800">נשארו {left} מתוך {FOUNDING.limit} מקומות</p>}
    <ul className="mt-3 space-y-1 text-[17px]">{PERKS.map(t => <li key={t} className="flex gap-2"><span aria-hidden="true" className="font-black text-amber-600">✓</span><span>{t}</span></li>)}</ul>
    <p className="mt-2 text-sm text-slate-600">בלי התחייבות ובלי כרטיס אשראי. ההצטרפות היום בחינם, ותמיד אפשר להישאר בכרטיס החינמי.</p>
    {cta && !isFounder && <Link to="/suppliers/me" className="mt-4 inline-block rounded-2xl bg-[var(--ink)] px-5 py-3 text-lg font-bold text-white">לשריין מקום כספק מייסד ←</Link>}
  </section>
}
