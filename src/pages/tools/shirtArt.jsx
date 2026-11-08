// Original one-colour drawings for the shirt designer, each in a 100×100 box. `ink` is the print
// colour and `bg` the shirt colour, used to cut details (eyes, wheels) out of the silhouette so the
// whole drawing still prints with a single screen. None of these are official unit emblems, and on
// purpose there are no rifles, scopes or violent scenes.

export const ICONS = [
  // ── Military vehicles and gear
  { id: 'tank', label: 'טנק', cat: 'army', draw: (ink, bg) => <g>
    <rect x={5} y={60} width={86} height={22} rx={11} fill={ink} />
    {[16, 29, 42, 55, 68, 81].map(x => <circle key={x} cx={x} cy={71} r={5.2} fill={bg} />)}
    <path d="M9 60 L18 47 H80 L90 60 Z" fill={ink} />
    <path d="M28 47 L35 33 H64 L70 47 Z" fill={ink} />
    <rect x={64} y={36} width={33} height={4.6} rx={1.5} fill={ink} />
    <rect x={42} y={27} width={12} height={6} rx={1.5} fill={ink} />
  </g> },
  { id: 'cannon', label: 'תותח', cat: 'army', draw: (ink, bg) => <g>
    <rect x={30} y={44} width={66} height={9} rx={2} fill={ink} transform="rotate(-24 36 52)" />
    <path d="M36 66 L6 88 L11 93 L44 72 Z" fill={ink} />
    <path d="M40 66 L70 90 L65 94 L34 72 Z" fill={ink} />
    <path d="M24 44 L48 38 L52 58 L28 62 Z" fill={ink} />
    <circle cx={38} cy={70} r={15} fill={ink} /><circle cx={38} cy={70} r={9.5} fill={bg} /><circle cx={38} cy={70} r={4} fill={ink} />
    {[0, 60, 120].map(a => <rect key={a} x={37} y={60.5} width={2} height={19} fill={ink} transform={`rotate(${a} 38 70)`} />)}
  </g> },
  { id: 'apc', label: 'נגמ״ש', cat: 'army', draw: (ink, bg) => <g>
    <rect x={6} y={62} width={86} height={20} rx={10} fill={ink} />
    {[17, 31, 45, 59, 73, 85].map(x => <circle key={x} cx={x} cy={72} r={4.6} fill={bg} />)}
    <path d="M8 62 V44 L22 30 H86 L92 44 V62 Z" fill={ink} />
    <rect x={30} y={38} width={10} height={7} rx={1} fill={bg} /><rect x={46} y={38} width={10} height={7} rx={1} fill={bg} />
    <rect x={66} y={22} width={14} height={8} rx={2} fill={ink} /><rect x={72} y={24} width={20} height={3} fill={ink} />
  </g> },
  { id: 'jet', label: 'מטוס קרב', cat: 'army', draw: ink => <path fill={ink} d="M50 4 L55 30 L56 40 L94 60 L94 67 L57 58 L55 80 L68 89 L68 95 L50 90 L32 95 L32 89 L45 80 L43 58 L6 67 L6 60 L44 40 L45 30 Z" /> },
  { id: 'helicopter', label: 'מסוק', cat: 'army', draw: (ink, bg) => <g>
    <rect x={8} y={18} width={84} height={3.5} rx={1.7} fill={ink} />
    <rect x={47} y={21} width={5} height={10} fill={ink} />
    <path d="M24 46 Q26 30 50 30 H62 Q72 30 74 46 Q72 60 56 62 H34 Q24 60 24 46 Z" fill={ink} />
    <path d="M30 44 Q32 35 44 35 V48 H30 Z" fill={bg} />
    <path d="M72 42 H94 L96 34 H99 L98 50 H94 L92 48 H72 Z" fill={ink} />
    <rect x={30} y={62} width={4} height={10} fill={ink} /><rect x={56} y={62} width={4} height={10} fill={ink} />
    <rect x={20} y={72} width={50} height={4} rx={2} fill={ink} />
  </g> },
  { id: 'ship', label: 'ספינה', cat: 'army', draw: (ink, bg) => <g>
    <path d="M4 62 H96 L86 82 H14 Z" fill={ink} />
    <path d="M30 62 V46 H62 V62 Z" fill={ink} /><path d="M38 46 V36 H56 V46 Z" fill={ink} />
    <rect x={46} y={14} width={3} height={22} fill={ink} /><rect x={40} y={20} width={15} height={3} fill={ink} />
    <rect x={64} y={54} width={22} height={4} rx={1} fill={ink} />
    {[36, 46, 56].map(x => <rect key={x} x={x - 2} y={50} width={5} height={4} fill={bg} />)}
    <path d="M10 88 Q20 84 30 88 T50 88 T70 88 T90 88" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
  </g> },
  { id: 'submarine', label: 'צוללת', cat: 'army', draw: (ink, bg) => <g>
    <rect x={6} y={50} width={84} height={22} rx={11} fill={ink} />
    <path d="M90 61 L98 52 V70 Z" fill={ink} />
    <path d="M36 50 L40 34 H58 L60 50 Z" fill={ink} />
    <rect x={47} y={20} width={3} height={14} fill={ink} /><rect x={47} y={20} width={9} height={3} fill={ink} />
    {[22, 34, 66, 78].map(x => <circle key={x} cx={x} cy={61} r={2.6} fill={bg} />)}
    <path d="M8 82 Q18 78 28 82 T48 82 T68 82 T88 82" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
  </g> },
  { id: 'paratrooper', label: 'צנחן', cat: 'army', draw: ink => <g>
    <path d="M8 40 Q50 -6 92 40 Q82 34 71 40 Q61 33 50 40 Q39 33 29 40 Q18 34 8 40 Z" fill={ink} />
    {[[10, 40], [30, 40], [70, 40], [90, 40]].map(([x, y]) => <line key={x} x1={x} y1={y} x2={50} y2={70} stroke={ink} strokeWidth={1.6} />)}
    <circle cx={50} cy={64} r={5} fill={ink} />
    <path d="M44 70 H56 L58 84 H53 L50 76 L47 84 H42 Z" fill={ink} />
    <path d="M44 72 L36 64 M56 72 L64 64" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M44 84 L42 96 M56 84 L58 96" stroke={ink} strokeWidth={4} strokeLinecap="round" />
  </g> },
  { id: 'beret', label: 'כומתה', cat: 'army', draw: (ink, bg) => <g>
    <path d="M10 58 Q6 30 46 26 Q86 24 92 46 Q94 58 82 62 Q60 70 30 68 Q12 66 10 58 Z" fill={ink} />
    <rect x={14} y={62} width={64} height={9} rx={4.5} fill={ink} />
    <path d="M22 50 L28 40 L34 50 L28 46 Z" fill={bg} />
    <circle cx={28} cy={47} r={7} fill="none" stroke={bg} strokeWidth={2} />
  </g> },
  { id: 'dogtag', label: 'דסקית', cat: 'army', draw: (ink, bg) => <g>
    <path d="M50 4 Q30 10 28 28" fill="none" stroke={ink} strokeWidth={2.5} strokeDasharray="3 2" />
    <rect x={24} y={24} width={52} height={70} rx={14} fill={ink} />
    <circle cx={50} cy={34} r={3.5} fill={bg} />
    {[50, 60, 70, 80].map((y, i) => <rect key={y} x={34} y={y} width={i === 3 ? 20 : 32} height={4} rx={2} fill={bg} />)}
  </g> },
  { id: 'jerrycan', label: 'ג׳ריקן', cat: 'army', draw: (ink, bg) => <g>
    <path d="M22 20 H66 L80 34 V92 H22 Z" fill={ink} />
    <rect x={30} y={10} width={26} height={8} rx={3} fill={ink} /><rect x={36} y={12} width={14} height={4} rx={2} fill={bg} />
    <path d="M30 40 L72 84 M72 40 L30 84" stroke={bg} strokeWidth={4} strokeLinecap="round" />
    <rect x={28} y={36} width={46} height={52} rx={3} fill="none" stroke={bg} strokeWidth={2.5} />
  </g> },
  { id: 'drone', label: 'רחפן', cat: 'army', draw: (ink, bg) => <g>
    <path d="M28 28 L72 72 M72 28 L28 72" stroke={ink} strokeWidth={6} strokeLinecap="round" />
    {[[24, 24], [76, 24], [24, 76], [76, 76]].map(([x, y]) => <g key={x + '-' + y}><circle cx={x} cy={y} r={15} fill={ink} /><circle cx={x} cy={y} r={11} fill={bg} /><rect x={x - 12} y={y - 1.5} width={24} height={3} rx={1.5} fill={ink} /></g>)}
    <rect x={40} y={40} width={20} height={20} rx={5} fill={ink} /><circle cx={50} cy={50} r={3.5} fill={bg} />
  </g> },
  { id: 'boot', label: 'נעל צבא', cat: 'army', draw: (ink, bg) => <g>
    <path d="M30 8 H58 V60 Q82 62 90 74 V86 H22 Q20 60 30 50 Z" fill={ink} />
    <rect x={20} y={86} width={72} height={7} rx={2} fill={ink} />
    {[18, 28, 38, 48].map(y => <path key={y} d={`M34 ${y} L54 ${y + 4} M54 ${y} L34 ${y + 4}`} stroke={bg} strokeWidth={2} />)}
  </g> },
  { id: 'compass', label: 'מצפן', cat: 'army', draw: (ink, bg) => <g>
    <circle cx={50} cy={50} r={44} fill={ink} /><circle cx={50} cy={50} r={37} fill={bg} /><circle cx={50} cy={50} r={33} fill={ink} />
    <path d="M50 20 L58 50 L50 80 L42 50 Z" fill={bg} /><path d="M50 20 L58 50 H42 Z" fill={bg} />
    <circle cx={50} cy={50} r={3.5} fill={ink} />
  </g> },
  // ── Animals
  { id: 'lion', label: 'אריה', cat: 'animals', draw: (ink, bg) => <g>
    <polygon fill={ink} points={Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2, r = i % 2 ? 40 : 47; return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}` }).join(' ')} />
    <circle cx={50} cy={52} r={27} fill={bg} />
    <circle cx={50} cy={52} r={24} fill={ink} />
    <circle cx={40} cy={46} r={3.6} fill={bg} /><circle cx={60} cy={46} r={3.6} fill={bg} />
    <path d="M43 58 H57 L50 66 Z" fill={bg} />
    <path d="M50 66 V70 M50 70 Q44 75 40 71 M50 70 Q56 75 60 71" stroke={bg} strokeWidth={2.2} fill="none" strokeLinecap="round" />
  </g> },
  { id: 'wolf', label: 'זאב', cat: 'animals', draw: (ink, bg) => <g>
    <path d="M18 8 L36 30 H64 L82 8 L84 44 Q84 66 50 94 Q16 66 16 44 Z" fill={ink} />
    <path d="M26 22 L34 32 L28 36 Z M74 22 L66 32 L72 36 Z" fill={bg} />
    <path d="M30 46 L42 50 L32 54 Z M70 46 L58 50 L68 54 Z" fill={bg} />
    <path d="M42 70 H58 L50 78 Z" fill={bg} />
    <path d="M50 38 V66" stroke={bg} strokeWidth={2} />
  </g> },
  { id: 'fox', label: 'שועל', cat: 'animals', draw: (ink, bg) => <g>
    <path d="M14 10 L36 34 H64 L86 10 L88 40 Q80 60 50 90 Q20 60 12 40 Z" fill={ink} />
    <path d="M14 42 Q30 52 40 62 Q46 72 50 90 Q20 60 14 42 Z M86 42 Q70 52 60 62 Q54 72 50 90 Q80 60 86 42 Z" fill={bg} opacity={0.45} />
    <path d="M22 20 L32 34 L24 34 Z M78 20 L68 34 L76 34 Z" fill={bg} />
    <ellipse cx={38} cy={48} rx={4} ry={3} fill={bg} /><ellipse cx={62} cy={48} rx={4} ry={3} fill={bg} />
    <circle cx={50} cy={80} r={4} fill={bg} />
  </g> },
  { id: 'bear', label: 'דוב', cat: 'animals', draw: (ink, bg) => <g>
    <circle cx={22} cy={24} r={13} fill={ink} /><circle cx={78} cy={24} r={13} fill={ink} />
    <circle cx={22} cy={24} r={6} fill={bg} /><circle cx={78} cy={24} r={6} fill={bg} />
    <ellipse cx={50} cy={56} rx={38} ry={36} fill={ink} />
    <circle cx={36} cy={48} r={4} fill={bg} /><circle cx={64} cy={48} r={4} fill={bg} />
    <ellipse cx={50} cy={68} rx={15} ry={12} fill={bg} />
    <ellipse cx={50} cy={63} rx={6} ry={4} fill={ink} />
    <path d="M50 67 V73 M44 76 Q50 80 56 76" stroke={ink} strokeWidth={2.2} fill="none" strokeLinecap="round" />
  </g> },
  { id: 'eagle', label: 'נשר', cat: 'animals', draw: (ink, bg) => <g>
    <path d="M50 30 Q30 18 4 24 Q14 30 10 36 Q22 36 20 44 Q32 42 32 50 Q42 46 44 56 L50 74 L56 56 Q58 46 68 50 Q68 42 80 44 Q78 36 90 36 Q86 30 96 24 Q70 18 50 30 Z" fill={ink} />
    <circle cx={50} cy={26} r={9} fill={ink} />
    <path d="M56 24 L66 28 L57 31 Z" fill={ink} />
    <circle cx={52} cy={24} r={1.8} fill={bg} />
    <path d="M44 74 L50 92 L56 74 Z" fill={ink} />
    <path d="M44 92 H56" stroke={ink} strokeWidth={3} />
  </g> },
  { id: 'panther', label: 'נמר', cat: 'animals', draw: (ink, bg) => <g>
    <path d="M14 14 L32 26 Q50 20 68 26 L86 14 L86 44 Q86 76 50 92 Q14 76 14 44 Z" fill={ink} />
    <path d="M30 46 Q36 40 44 46 Q36 52 30 46 Z M70 46 Q64 40 56 46 Q64 52 70 46 Z" fill={bg} />
    <path d="M44 66 H56 L50 72 Z" fill={bg} />
    <path d="M50 72 V78 M30 70 H16 M30 74 L18 80 M70 70 H84 M70 74 L82 80" stroke={bg} strokeWidth={1.6} strokeLinecap="round" />
  </g> },
  { id: 'scorpion', label: 'עקרב', cat: 'animals', draw: ink => <g fill={ink} stroke={ink}>
    <ellipse cx={50} cy={62} rx={12} ry={16} stroke="none" />
    {[42, 50, 58].map(y => <g key={y}><path d={`M40 ${y} L26 ${y - 6} L20 ${y + 2}`} fill="none" strokeWidth={2.5} /><path d={`M60 ${y} L74 ${y - 6} L80 ${y + 2}`} fill="none" strokeWidth={2.5} /></g>)}
    <path d="M42 50 L30 32 M58 50 L70 32" fill="none" strokeWidth={4} />
    <path d="M24 24 Q22 32 30 34 Q34 26 30 22 L28 28 Z M76 24 Q78 32 70 34 Q66 26 70 22 L72 28 Z" stroke="none" />
    <path d="M50 78 Q52 92 66 90 Q80 86 76 70 Q74 62 66 64" fill="none" strokeWidth={6} strokeLinecap="round" />
    <path d="M66 58 L60 66 L70 68 Z" stroke="none" />
  </g> },
  { id: 'snake', label: 'נחש', cat: 'animals', draw: (ink, bg) => <g>
    <path d="M20 88 Q6 70 30 64 Q58 58 50 42 Q42 28 60 20" fill="none" stroke={ink} strokeWidth={11} strokeLinecap="round" />
    <ellipse cx={66} cy={16} rx={12} ry={8} fill={ink} transform="rotate(-20 66 16)" />
    <circle cx={70} cy={13} r={1.8} fill={bg} />
    <path d="M77 14 L88 12 M88 12 L92 8 M88 12 L92 16" stroke={ink} strokeWidth={1.6} strokeLinecap="round" />
  </g> },
  { id: 'shark', label: 'כריש', cat: 'animals', draw: (ink, bg) => <g>
    <path d="M4 56 Q30 36 62 40 L70 22 L76 42 Q88 46 96 54 Q88 62 70 64 L74 74 L62 64 Q34 68 4 56 Z" fill={ink} />
    <path d="M4 56 L-2 44 L10 52 Z" fill={ink} />
    <circle cx={84} cy={51} r={2.2} fill={bg} />
    <path d="M72 50 V58 M68 51 V58" stroke={bg} strokeWidth={1.5} />
    <path d="M10 86 Q20 80 30 86 T50 86 T70 86 T90 86" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
  </g> },
  { id: 'ibex', label: 'יעל', cat: 'animals', draw: (ink, bg) => <g>
    <path d="M40 40 Q20 30 22 8 Q30 26 44 34 Z M60 40 Q80 30 78 8 Q70 26 56 34 Z" fill={ink} />
    <path d="M36 38 H64 L62 64 Q58 84 50 90 Q42 84 38 64 Z" fill={ink} />
    <path d="M36 42 L22 48 L34 50 Z M64 42 L78 48 L66 50 Z" fill={ink} />
    <circle cx={43} cy={52} r={2.5} fill={bg} /><circle cx={57} cy={52} r={2.5} fill={bg} />
    <path d="M44 90 Q50 100 56 90 Z" fill={ink} />
  </g> },
  { id: 'owl', label: 'ינשוף', cat: 'animals', draw: (ink, bg) => <g>
    <path d="M22 14 L34 28 Q50 22 66 28 L78 14 L80 40 Q84 80 50 92 Q16 80 20 40 Z" fill={ink} />
    <circle cx={38} cy={44} r={11} fill={bg} /><circle cx={62} cy={44} r={11} fill={bg} />
    <circle cx={38} cy={44} r={5} fill={ink} /><circle cx={62} cy={44} r={5} fill={ink} />
    <path d="M46 54 H54 L50 62 Z" fill={bg} />
    <path d="M36 72 Q50 66 64 72 M38 80 Q50 74 62 80" stroke={bg} strokeWidth={2} fill="none" />
  </g> },
  // ── Symbols
  { id: 'star', label: 'כוכב', cat: 'symbols', draw: ink => <polygon fill={ink} points={Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, r = i % 2 ? 20 : 46; return `${(50 + r * Math.cos(a)).toFixed(1)},${(54 + r * Math.sin(a)).toFixed(1)}` }).join(' ')} /> },
  { id: 'magen', label: 'מגן דוד', cat: 'symbols', draw: ink => <g fill="none" stroke={ink} strokeWidth={6} strokeLinejoin="round"><path d="M50 8 L88 72 H12 Z" /><path d="M50 92 L12 28 H88 Z" /></g> },
  { id: 'shield', label: 'מגן', cat: 'symbols', draw: (ink, bg) => <g>
    <path d="M50 4 L90 16 V46 Q90 78 50 96 Q10 78 10 46 V16 Z" fill={ink} />
    <path d="M50 14 L80 23 V46 Q80 70 50 85 Q20 70 20 46 V23 Z" fill={bg} />
    <path d="M50 22 L72 29 V46 Q72 64 50 76 Q28 64 28 46 V29 Z" fill={ink} />
  </g> },
  { id: 'wings', label: 'כנפיים', cat: 'symbols', draw: ink => <g fill={ink}>
    {[0, 1].map(side => <g key={side} transform={side ? 'translate(100 0) scale(-1 1)' : undefined}>
      <path d="M44 46 Q24 30 2 34 Q12 40 14 44 Q4 46 0 50 Q14 52 18 54 Q10 58 8 62 Q24 62 30 60 Q22 66 24 70 Q38 64 44 56 Z" />
    </g>)}
    <circle cx={50} cy={50} r={9} />
  </g> },
  { id: 'laurel', label: 'זר דפנה', cat: 'symbols', draw: ink => <g fill={ink}>
    {[0, 1].map(side => <g key={side} transform={side ? 'translate(100 0) scale(-1 1)' : undefined}>
      <path d="M48 92 Q14 80 14 44 Q16 26 26 14" fill="none" stroke={ink} strokeWidth={3} />
      {Array.from({ length: 7 }, (_, i) => { const t = i / 6, x = 47 - 34 * Math.sin(t * 1.6), y = 90 - 74 * t; return <ellipse key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} rx={4} ry={9} transform={`rotate(${(-60 + t * 40).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`} /> })}
    </g>)}
  </g> },
  { id: 'sword', label: 'חרב', cat: 'symbols', draw: ink => <g fill={ink}>
    <path d="M47 4 L53 4 L55 64 H45 Z" /><rect x={30} y={64} width={40} height={6} rx={3} /><rect x={46} y={70} width={8} height={18} rx={2} /><circle cx={50} cy={92} r={5} />
  </g> },
  { id: 'mountain', label: 'הרים', cat: 'symbols', draw: (ink, bg) => <g>
    <path d="M2 88 L36 30 L52 54 L66 34 L98 88 Z" fill={ink} />
    <path d="M36 30 L28 44 L36 40 L44 46 Z M66 34 L60 44 L66 42 L72 46 Z" fill={bg} />
    <circle cx={80} cy={18} r={9} fill={ink} />
  </g> },
  { id: 'sun', label: 'שמש עולה', cat: 'symbols', draw: ink => <g fill={ink}>
    <path d="M18 76 A32 32 0 0 1 82 76 Z" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={48} y={20} width={4} height={14} rx={2} transform={`rotate(${-80 + i * 20} 50 76)`} />)}
    <rect x={6} y={82} width={88} height={5} rx={2.5} />
  </g> },
  { id: 'anchor', label: 'עוגן', cat: 'symbols', draw: ink => <g fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round">
    <circle cx={50} cy={14} r={7} /><path d="M50 22 V88 M32 34 H68 M16 62 Q20 88 50 88 Q80 88 84 62" /><path d="M10 66 L16 58 L22 66 M78 66 L84 58 L90 66" strokeWidth={5} />
  </g> },
  { id: 'bolt', label: 'ברק', cat: 'symbols', draw: ink => <path fill={ink} d="M58 4 L22 54 H46 L38 96 L80 40 H54 Z" /> },
  { id: 'flag', label: 'דגל ישראל', cat: 'symbols', draw: (ink, bg) => <g>
    <rect x={8} y={18} width={84} height={64} rx={3} fill={ink} />
    <rect x={14} y={24} width={72} height={52} fill={bg} />
    <rect x={14} y={30} width={72} height={6} fill={ink} /><rect x={14} y={64} width={72} height={6} fill={ink} />
    <g fill="none" stroke={ink} strokeWidth={2.4}><path d="M50 40 L59 55 H41 Z" /><path d="M50 60 L41 45 H59 Z" /></g>
  </g> },
  // ── School, kindergarten, youth movement
  { id: 'cap', label: 'כובע סיום', cat: 'school', draw: (ink, bg) => <g>
    <path d="M50 18 L96 38 L50 58 L4 38 Z" fill={ink} />
    <path d="M24 48 V68 Q50 84 76 68 V48 L50 60 Z" fill={ink} />
    <path d="M50 38 L84 46 V72" fill="none" stroke={bg} strokeWidth={2} /><rect x={81} y={72} width={6} height={12} rx={2} fill={ink} />
  </g> },
  { id: 'book', label: 'ספר', cat: 'school', draw: (ink, bg) => <g>
    <path d="M50 26 Q30 14 6 18 V80 Q30 76 50 88 Q70 76 94 80 V18 Q70 14 50 26 Z" fill={ink} />
    <path d="M50 30 V84" stroke={bg} strokeWidth={2.5} />
    {[34, 46, 58].map(y => <g key={y}><path d={`M14 ${y} Q30 ${y - 3} 42 ${y + 3}`} stroke={bg} strokeWidth={2} fill="none" /><path d={`M86 ${y} Q70 ${y - 3} 58 ${y + 3}`} stroke={bg} strokeWidth={2} fill="none" /></g>)}
  </g> },
  { id: 'pencil', label: 'עיפרון', cat: 'school', draw: (ink, bg) => <g transform="rotate(-40 50 50)">
    <rect x={12} y={40} width={58} height={20} fill={ink} /><rect x={4} y={40} width={8} height={20} rx={3} fill={ink} />
    <path d="M70 40 L94 50 L70 60 Z" fill={ink} /><path d="M86 46.6 L94 50 L86 53.4 Z" fill={bg} />
    <rect x={14} y={48} width={54} height={3} fill={bg} />
  </g> },
  { id: 'bus', label: 'אוטובוס טיול', cat: 'school', draw: (ink, bg) => <g>
    <rect x={4} y={24} width={92} height={52} rx={8} fill={ink} />
    {[12, 32, 52].map(x => <rect key={x} x={x} y={32} width={16} height={16} rx={2} fill={bg} />)}
    <rect x={74} y={32} width={14} height={30} rx={2} fill={bg} />
    <circle cx={24} cy={78} r={9} fill={ink} /><circle cx={24} cy={78} r={4} fill={bg} />
    <circle cx={74} cy={78} r={9} fill={ink} /><circle cx={74} cy={78} r={4} fill={bg} />
  </g> },
  { id: 'tent', label: 'אוהל', cat: 'school', draw: (ink, bg) => <g>
    <path d="M50 10 L94 84 H6 Z" fill={ink} /><path d="M50 40 L66 84 H34 Z" fill={bg} />
    <path d="M50 10 L44 2 M50 10 L56 2" stroke={ink} strokeWidth={3} strokeLinecap="round" />
    <rect x={2} y={84} width={96} height={5} rx={2} fill={ink} />
  </g> },
  { id: 'fire', label: 'מדורה', cat: 'school', draw: (ink, bg) => <g>
    <path d="M50 6 Q70 30 66 48 Q76 42 74 30 Q90 52 76 72 H24 Q10 52 26 30 Q24 44 34 48 Q30 28 50 6 Z" fill={ink} />
    <path d="M50 40 Q60 54 56 72 H44 Q40 56 50 40 Z" fill={bg} />
    <path d="M14 92 L86 74 M14 74 L86 92" stroke={ink} strokeWidth={8} strokeLinecap="round" />
  </g> },
  { id: 'balloons', label: 'בלונים', cat: 'school', draw: (ink, bg) => <g>
    {[[34, 34], [62, 28], [50, 50]].map(([x, y], i) => <g key={i}><path d={`M${x} ${y + 15} Q${x + 4} ${y + 40} 50 94`} fill="none" stroke={ink} strokeWidth={1.8} /><ellipse cx={x} cy={y} rx={13} ry={16} fill={ink} /><ellipse cx={x - 5} cy={y - 6} rx={3} ry={5} fill={bg} /></g>)}
  </g> },
  { id: 'heart', label: 'לב', cat: 'school', draw: ink => <path fill={ink} d="M50 90 C14 64 4 44 14 26 C24 10 44 14 50 28 C56 14 76 10 86 26 C96 44 86 64 50 90 Z" /> },
]

export const ICON_CATS = [['army', '🎖️ צבא'], ['animals', '🦁 חיות'], ['symbols', '⭐ סמלים'], ['school', '🎓 בית ספר ותנועה']]
export const iconById = id => ICONS.find(i => i.id === id) || ICONS[0]
