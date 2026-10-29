import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { israelToday } from '../../utils/parashaCalendar'
import { ROAD_WEEK } from '../../data/roadSafetyWeek'
import './roadWeek.css'

// The animated scene: a cute car drives up, stops at the crossing, a child crosses on the green
// light, then the car drives on. Plain CSS keyframes; frozen mid-crossing for reduced motion.
export function RoadScene() {
  return <svg className="rw-scene" viewBox="0 0 640 190" aria-hidden="true">
    <rect width="640" height="190" fill="#bfe6ff" />
    <rect y="0" width="640" height="44" fill="#e9dcc2" />
    <rect y="44" width="640" height="104" fill="#4b5563" />
    <rect y="148" width="640" height="42" fill="#e9dcc2" />
    <path d="M0 96 H260 M420 96 H640" stroke="#fde68a" strokeWidth="4" strokeDasharray="22 16" />
    {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x="300" y={50 + i * 16} width="90" height="9" rx="2" fill="#fff" />)}
    <g transform="translate(410 6)">
      <rect x="6" y="20" width="5" height="22" fill="#374151" />
      <rect x="0" y="0" width="17" height="26" rx="4" fill="#1f2937" />
      <circle className="rw-red" cx="8.5" cy="7" r="4.5" fill="#ef4444" />
      <circle className="rw-green" cx="8.5" cy="19" r="4.5" fill="#22c55e" />
    </g>
    <g className="rw-kid"><g className="rw-bob">
      <rect x="337" y="168" width="6" height="14" rx="3" fill="#1e3a8a" /><rect x="347" y="168" width="6" height="14" rx="3" fill="#1e3a8a" />
      <rect x="333" y="146" width="24" height="26" rx="8" fill="#f97316" />
      <rect x="330" y="150" width="6" height="16" rx="3" fill="#f97316" />
      <circle cx="345" cy="136" r="13" fill="#fcd9b6" />
      <path d="M332 134 Q334 120 345 121 Q357 120 358 134 Q350 127 345 129 Q339 127 332 134 Z" fill="#7c3f17" />
      <circle cx="340" cy="137" r="1.8" fill="#111" /><circle cx="350" cy="137" r="1.8" fill="#111" />
      <path d="M341 142 Q345 145 349 142" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="352" y="145" width="11" height="15" rx="3" fill="#facc15" />
    </g></g>
    <g className="rw-car">
      <path d="M4 108 Q0 108 0 100 V88 Q0 80 10 79 L32 77 L52 58 Q56 54 63 54 H112 Q120 54 125 59 L146 78 L170 82 Q180 84 180 94 V100 Q180 108 172 108 Z" fill="#ef6f6c" stroke="#7f1d1d" strokeWidth="2" />
      <path d="M42 77 L58 62 Q60 60 64 60 H86 V77 Z M92 60 H110 Q115 60 118 63 L134 77 H92 Z" fill="#dbeafe" stroke="#7f1d1d" strokeWidth="1.5" />
      <circle cx="166" cy="90" r="6" fill="#fff" stroke="#7f1d1d" strokeWidth="1.5" /><circle cx="167.5" cy="90" r="2.4" fill="#111" />
      <path d="M158 100 Q166 104 174 99" stroke="#7f1d1d" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="108" r="15" fill="#1f2937" /><circle cx="40" cy="108" r="6" fill="#d1d5db" />
      <circle cx="140" cy="108" r="15" fill="#1f2937" /><circle cx="140" cy="108" r="6" fill="#d1d5db" />
      <g className="rw-bubble"><rect x="112" y="16" width="70" height="28" rx="12" fill="#fff" stroke="#111" strokeWidth="1.5" /><path d="M140 44 L134 54 L150 44" fill="#fff" stroke="#111" strokeWidth="1.5" /><text x="147" y="36" textAnchor="middle" fontSize="15" fontWeight="800" fontFamily="Heebo, Arial, sans-serif" fill="#111">עוצרים!</text></g>
    </g>
  </svg>
}

// Home-page banner, shown from mount (the home page is prerendered) until the last day of the week.
export default function RoadWeekBanner() {
  const [today, setToday] = useState('')
  useEffect(() => { setToday(israelToday()) }, [])
  if (!today || today > ROAD_WEEK.end) return null
  const label = today < ROAD_WEEK.start ? 'מתחיל ב־1.11' : 'השבוע!'
  return <Link to="/road-safety-week" className="rw-banner no-print" aria-label="שבוע זהירות בדרכים — חידון לכל כיתה, דפי עבודה, דפי צביעה והבנת הנקרא">
    <RoadScene />
    <span className="rw-copy"><b>🚦 שבוע זהירות בדרכים — {label}</b><small>חידון לכל כיתה א׳–ו׳, דפי עבודה אונליין ולהדפסה, צביעה, הבנת הנקרא ולימוד רמזור</small></span>
    <span className="rw-cta">לכל הפעילויות ←</span>
  </Link>
}
