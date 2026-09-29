// A hand-drawn style dreidel: body, handle and point, with the letter on its face.
export default function Dreidel({ letter, spinning = false, size = 220 }) {
  return <svg viewBox="0 0 200 260" width={size} height={size * 1.3} role="img" aria-label={letter ? `הסביבון נפל על ${letter}` : 'סביבון'}
    style={{ animation: spinning ? 'buga-dreidel-spin 0.35s linear infinite' : 'none', transformOrigin: '50% 90%', overflow: 'visible' }}>
    <defs>
      <linearGradient id="dreidel-face" x1="0" x2="1">
        <stop offset="0" stopColor="#60a5fa" /><stop offset="1" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="dreidel-side" x1="0" x2="1">
        <stop offset="0" stopColor="#1e40af" /><stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="252" rx="46" ry="6" fill="#00000022" />
    {/* handle */}
    <rect x="90" y="8" width="20" height="52" rx="8" fill="#fbbf24" stroke="#111" strokeWidth="4" />
    {/* top */}
    <path d="M40 62 L100 44 L170 62 L110 82 Z" fill="#93c5fd" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
    {/* front face */}
    <path d="M40 62 L110 82 L110 186 L40 160 Z" fill="url(#dreidel-face)" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
    {/* side face */}
    <path d="M110 82 L170 62 L170 150 L110 186 Z" fill="url(#dreidel-side)" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
    {/* point */}
    <path d="M40 160 L110 186 L100 244 Z" fill="#fbbf24" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
    <path d="M110 186 L170 150 L100 244 Z" fill="#d97706" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
    <text x="76" y="140" textAnchor="middle" fontSize="70" fontWeight="800" fontFamily="Heebo, Arial, sans-serif" fill="#fff" stroke="#111" strokeWidth="2.5" paintOrder="stroke" transform="skewY(16) translate(0 -22)">{spinning ? '' : letter}</text>
  </svg>
}
