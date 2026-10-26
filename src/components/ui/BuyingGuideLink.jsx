import { Link } from 'react-router-dom'

// One small line from a section page (e.g. /travel) to its buying guide (/recommended/travel).
// Labels are kept here (not imported from data/buyingGuides.js) so section pages don't load the
// guides' full text; tests/buying-guides.test.mjs keeps them in sync with the guide titles.
const BUYING_LINK_LABELS = {
  travel: 'מה לקחת לטיסה עם ילדים',
  party: 'מה צריך למסיבת יום הולדת לילדים',
  crafts: 'ציוד יצירה לילדים',
  speech: 'עזרים לתרגול דיבור ושפה בבית',
  teacher: 'ציוד לגננת ולמורה',
  hanukkah: 'מה לקנות לחנוכה לילדים',
  'teacher-gift': 'מתנה לגננת ולמורה לסוף שנה',
}

export default function BuyingGuideLink({ id, className = '' }) {
  const label = BUYING_LINK_LABELS[id]
  if (!label) return null
  return (
    <p className={`no-print mx-auto my-6 max-w-3xl text-center text-base ${className}`}>
      <span aria-hidden="true">🛒 </span>מה כדאי לקנות?{' '}
      <Link to={`/recommended/${id}`} className="font-bold underline">{label}</Link>
    </p>
  )
}
