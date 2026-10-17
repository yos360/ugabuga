// Original, mirrored court illustrations; vector artwork stays crisp at every card size.
export default function CourtArt({ rank = 13 }) {
  const queen = rank === 12, jack = rank === 11
  const portrait = <g stroke="#343047" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M19 62 Q20 42 40 40 Q60 42 61 62" fill="currentColor" />
    <path d="M27 46 L40 58 L53 46 M40 58 V65" fill="none" stroke="#e9bf70" strokeWidth="3" />
    <path d="M28 24 Q25 15 40 15 Q55 15 52 34 L48 43 H32 L27 34Z" fill={queen ? '#c28b43' : '#343047'} />
    <path d="M31 25 Q40 19 49 25 V32 Q48 42 40 44 Q32 41 31 32Z" fill="#f6debb" />
    <path d="M33 29 H36 M44 29 H47 M40 30 L38 35 H41 M37 38 Q40 40 43 38" fill="none" strokeWidth="1.2" />
    {!queen && !jack && <path d="M32 35 L36 39 L40 36 L44 39 L48 35 L45 44 L40 48 L35 44Z" fill="#343047" />}
    {jack ? <><path d="M27 23 Q28 10 49 17 L54 24Z" fill="currentColor" /><path d="M44 17 Q45 3 53 7 Q52 13 44 17" fill="#e9bf70" /></> : <><path d="M28 23 L25 12 L34 16 L40 7 L46 16 L55 12 L52 23Z" fill="#e9bf70" /><path d="M30 20 H50" stroke="#fff2ce" /><path d="M38 17 L40 14 L42 17 L40 20Z" fill="currentColor" /></>}
    {queen ? <><path d="M58 63 V40" stroke="#e9bf70" /><path d="M58 34 Q48 35 53 41 Q58 47 63 41 Q68 35 58 34Z" fill="#e9bf70" /></> : <><path d="M20 62 V30 L23 24 L26 30 V62" fill="#e9bf70" /><path d="M16 46 H30" stroke="#e9bf70" strokeWidth="3" /></>}
  </g>
  return <svg className="sol-court" viewBox="0 0 80 130" aria-hidden="true"><rect x="12" y="4" width="56" height="122" rx="24" fill="#f1eadd" />{portrait}<g transform="translate(80 130) rotate(180)">{portrait}</g><path d="M15 65 H65" stroke="#e9bf70" strokeWidth="2" /></svg>
}
