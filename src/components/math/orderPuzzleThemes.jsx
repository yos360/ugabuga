// Picture themes for the "solve, then put in order" sheets (OrderPuzzleSheet): simple black line-art
// in a 200 × 270 box. Each theme draws its picture and returns the slots where the results go.

const INK = '#111'
const range = n => Array.from({ length: n }, (_, i) => i)

// A small drawn kid (used on the stairs and next to the tower).
function kid({ x, y, wave = 1 }) {
  return <g stroke={INK} strokeWidth={0.7} fill="none" strokeLinecap="round">
    <circle cx={x} cy={y - 16} r={3.2} fill="#fff" />
    <path d={`M${x - 1.3} ${y - 15.2} q1.3 1.2 2.6 0`} />
    <circle cx={x - 1.1} cy={y - 17} r={0.35} fill={INK} /><circle cx={x + 1.1} cy={y - 17} r={0.35} fill={INK} />
    <path d={`M${x} ${y - 12.8} V${y - 6}`} />
    <path d={`M${x} ${y - 11} L${x - 4 * wave} ${y - 14.5} M${x} ${y - 11} L${x + 3.5 * wave} ${y - 8.5}`} />
    <path d={`M${x} ${y - 6} L${x - 2.6} ${y} M${x} ${y - 6} L${x + 2.6} ${y}`} />
  </g>
}

function star({ x, y, r = 3, fill = '#fff' }) {
  const pts = range(10).map(i => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${(x + Math.cos(a) * rr).toFixed(2)},${(y + Math.sin(a) * rr).toFixed(2)}` }).join(' ')
  return <polygon points={pts} fill={fill} stroke={INK} strokeWidth={0.5} strokeLinejoin="round" />
}

// ── Themes ─────────────────────────────────────────────────────────
// Each theme returns { art, slots }. A slot: { x, y, kind: 'rect'|'circle'|'ellipse', w, h, r, rx, ry,
// letter: [x, y] (box for the secret-word letter), clue: [x, y] (where "הכי קטן/גדול" goes) }.

function train(n) {
  const k1 = Math.ceil(n / 2), k2 = n - k1, P = { 6: 32, 8: 28 }[n] || 24, W = P - 3, H = 17
  const y1 = 178, y2 = 226, E = 161
  const lefts1 = range(k1).map(i => E - 3 - i * P - W)
  const L = lefts1[k1 - 1], turnX = L - 3
  const lefts2 = range(k2).map(j => L + j * P)
  const wagon = (x, ty, key) => <g key={key}>
    <rect x={x} y={ty - 4 - H} width={W} height={H} rx={1.5} fill="#fff" stroke={INK} strokeWidth={0.7} />
    <path d={`M${x + 1.5} ${ty - 4 - H + 2.5} H${x + W - 1.5}`} stroke={INK} strokeWidth={0.35} />
    {[x + 4.5, x + W - 4.5].map(cx => <circle key={cx} cx={cx} cy={ty - 2.6} r={2.6} fill="#fff" stroke={INK} strokeWidth={0.7} />)}
  </g>
  const track = `M${turnX} ${y1} H194 M${turnX} ${y1} A${(y2 - y1) / 2} ${(y2 - y1) / 2} 0 0 0 ${turnX} ${y2} H${(lefts2[k2 - 1] ?? L) + W + 8}`
  const art = <g>
    <path d={track} fill="none" stroke={INK} strokeWidth={2.2} />
    <path d={track} fill="none" stroke="#fff" strokeWidth={0.9} />
    {lefts1.map((x, i) => <path key={'c' + i} d={`M${x + W} ${y1 - 7} H${i === 0 ? E : x + W + 3}`} stroke={INK} strokeWidth={0.8} />)}
    {lefts2.slice(1).map((x, j) => <path key={'d' + j} d={`M${x - 3} ${y2 - 7} H${x}`} stroke={INK} strokeWidth={0.8} />)}
    {lefts1.map((x, i) => wagon(x, y1, 'a' + i))}
    {lefts2.map((x, j) => wagon(x, y2, 'b' + j))}
    {/* the engine, heading right */}
    <g stroke={INK} strokeWidth={0.7} fill="#fff">
      <rect x={E} y={y1 - 26} width={11} height={22} rx={1} />
      <rect x={E + 2.5} y={y1 - 23} width={6} height={6} rx={0.8} />
      <rect x={E - 1} y={y1 - 28} width={13} height={2.5} rx={0.6} />
      <rect x={E + 11} y={y1 - 17} width={17} height={13} rx={4} />
      <rect x={E + 21} y={y1 - 24} width={4} height={7} />
      <path d={`M${E + 28} ${y1 - 8} L${E + 32} ${y1 - 1} H${E + 27}`} />
      <circle cx={E + 6} cy={y1 - 4} r={4} /><circle cx={E + 6} cy={y1 - 4} r={1} fill={INK} />
      <circle cx={E + 17} cy={y1 - 2.8} r={2.8} /><circle cx={E + 24} cy={y1 - 2.8} r={2.8} />
      <circle cx={E + 19} cy={y1 - 30} r={2.6} /><circle cx={E + 14} cy={y1 - 35} r={3.2} /><circle cx={E + 7} cy={y1 - 38} r={3.6} />
    </g>
  </g>
  const slot = (x, ty, row2, last) => ({ x: x + W / 2, y: ty - 4 - H / 2 + 1, kind: 'rect', w: Math.min(16, W - 5), h: 9.5, letter: [x + W / 2, ty + 7], clue: row2 || last ? [x + W / 2, ty + 15] : [x + W / 2, ty - H - 9] })
  return { art, slots: [...lefts1.map(x => slot(x, y1, false, k2 === 0)), ...lefts2.map(x => slot(x, y2, true))] }
}

function stairs(n, dir) {
  const R = 172, B = 246, sw = Math.min(24, 160 / n), rh = Math.min(13, 108 / n), down = dir === 'desc'
  const top = i => (down ? B - (n - i) * rh : B - (i + 1) * rh)
  const cx = i => R - (i + 0.5) * sw
  const last = n - 1, px = R - n * sw + 2.5, ft = top(last)
  const art = <g>
    <path d={`M8 ${B} H194`} stroke={INK} strokeWidth={0.8} />
    {range(n).map(i => <rect key={i} x={R - (i + 1) * sw} y={top(i)} width={sw} height={B - top(i)} fill="#fff" stroke={INK} strokeWidth={0.7} />)}
    {down && <rect x={R} y={top(0)} width={20} height={B - top(0)} fill="#fff" stroke={INK} strokeWidth={0.7} />}
    {kid({ x: down ? 182 : 183, y: down ? top(0) : B })}
    <path d={`M${px} ${ft} V${ft - 13}`} stroke={INK} strokeWidth={0.7} />
    <path d={`M${px} ${ft - 13} L${px + 7} ${ft - 10.5} L${px} ${ft - 8} Z`} fill="#fff" stroke={INK} strokeWidth={0.6} />
  </g>
  const slots = range(n).map(i => ({
    x: cx(i), y: top(i) + rh / 2 + 0.3, kind: 'rect', w: Math.min(15, sw - 3), h: Math.min(8.5, rh - 2.5), letter: [cx(i), top(i) - 4.5],
    clue: i === 0 ? (down ? [cx(i), top(i) - 11.5] : [cx(i), B + 4.5]) : (down ? [cx(i), B + 4.5] : [cx(i), top(i) - 18]),
  }))
  return { art, slots }
}

function caterpillar(n) {
  const p = Math.min(23, 156 / n), r = p * 0.57, rH = r * 1.25, hx = 186 - rH
  const xs = range(n).map(i => hx - rH - 0.6 * r - i * p), ys = range(n).map(i => 194 + 10 * Math.sin(i * 0.85 + 0.5))
  const hy = ys[0] - 6
  const art = <g stroke={INK} strokeWidth={0.7} fill="none" strokeLinecap="round">
    {xs.map((x, i) => <path key={i} d={`M${x - 3} ${ys[i] + r - 1} l-1.2 4.5 M${x + 3} ${ys[i] + r - 1} l1.2 4.5`} />)}
    <path d={`M${hx - 3} ${hy - rH + 1} q-2 -5 -4 -7 M${hx + 3} ${hy - rH + 1} q2 -5 5 -6`} />
    <circle cx={hx - 7} cy={hy - rH - 6.2} r={1.2} fill="#fff" /><circle cx={hx + 8} cy={hy - rH - 5.2} r={1.2} fill="#fff" />
    <circle cx={hx} cy={hy} r={rH} fill="#fff" />
    <circle cx={hx + 1.5} cy={hy - 2.5} r={0.9} fill={INK} /><circle cx={hx + 5.5} cy={hy - 2.5} r={0.9} fill={INK} />
    <path d={`M${hx + 1} ${hy + 3} q3.5 3.2 7 0`} />
    {/* grass and a little flower */}
    <path d="M8 242 H192" />
    {[18, 44, 70, 96, 122, 148, 174].map(x => <path key={x} d={`M${x} 242 l-1.5 -4 M${x} 242 l0 -4.5 M${x} 242 l1.5 -4`} />)}
    <path d="M186 242 V230" /><circle cx={186} cy={227} r={2.2} fill="#fff" />
    {range(6).map(i => { const a = i * Math.PI / 3; return <circle key={i} cx={186 + Math.cos(a) * 4} cy={227 + Math.sin(a) * 4} r={1.9} fill="#fff" /> })}
  </g>
  const slots = range(n).map(i => ({ x: xs[i], y: ys[i], kind: 'circle', r, letter: [xs[i], ys[i] + r + 9], clue: [xs[i], ys[i] - r - 4.5] }))
  return { art, slots }
}

function bubbles(n, dir) {
  const S = [150, 232], E = [26, 148], len = Math.hypot(E[0] - S[0], E[1] - S[1]), step = len / (n - 1)
  const d = [(E[0] - S[0]) / len, (E[1] - S[1]) / len], u = [-d[1], d[0]] // u points up-right
  const rMax = Math.min(10.5, step * 0.48), rMin = rMax * 0.7
  const slots = range(n).map(i => {
    const t = i / (n - 1), w = 2.5 * Math.sin(i * 1.7)
    const x = S[0] + (E[0] - S[0]) * t + u[0] * w, y = S[1] + (E[1] - S[1]) * t + u[1] * w
    const r = dir === 'desc' ? rMax - (rMax - rMin) * t : rMin + (rMax - rMin) * t
    return { x, y, kind: 'circle', r, letter: [x - u[0] * (r + 5), y - u[1] * (r + 5)], clue: [x + u[0] * (r + 9), y + u[1] * (r + 9)] }
  })
  const art = <g stroke={INK} strokeWidth={0.7} fill="#fff" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 249 H192" fill="none" />
    {[[30, 251], [60, 250.5], [118, 251], [140, 250.6]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx={2.5} ry={1.2} />)}
    <path d="M14 249 q-4 -9 1 -16 q4 -7 -1 -15 M22 249 q4 -8 0 -14 q-3 -6 2 -12" fill="none" />
    {/* the fish, facing the bubbles */}
    <path d={`M184 240 L194 232 V248 Z`} />
    <ellipse cx={172} cy={240} rx={14} ry={8.5} />
    <path d="M170 232 q4 -6 9 -1" />
    <path d="M176 236 q-3 4 0 8" fill="none" />
    <circle cx={164} cy={237.5} r={1.4} fill={INK} />
    <path d="M158.5 241 q1.5 1.2 3 0" fill="none" />
  </g>
  return { art, slots }
}

function rocket(n) {
  const p = Math.min(12, 94 / n), bb = 236, bt = bb - 4 - n * p
  const art = <g stroke={INK} strokeWidth={0.7} fill="#fff" strokeLinejoin="round">
    <circle cx={28} cy={182} r={8} />
    <ellipse cx={28} cy={182} rx={14} ry={3.6} fill="none" transform="rotate(-20 28 182)" />
    {[[160, 128, 2.8], [178, 160, 2.2], [154, 192, 2.6], [30, 140, 2.4], [24, 236, 2.6], [176, 214, 2.2], [40, 214, 2]].map(([x, y, r]) => <g key={x}>{star({ x, y, r })}</g>)}
    <path d={`M86 ${bb - 22} L72 ${bb + 6} L86 ${bb} Z M114 ${bb - 22} L128 ${bb + 6} L114 ${bb} Z`} />
    <path d={`M92 ${bb + 4} L95 ${bb + 12} L98 ${bb + 7} L100 ${bb + 14} L102 ${bb + 7} L105 ${bb + 12} L108 ${bb + 4} Z`} />
    <rect x={91} y={bb} width={18} height={4} rx={0.8} />
    <rect x={86} y={bt} width={28} height={bb - bt} rx={3} />
    <path d={`M86 ${bt} C86 ${bt - 11} 97 ${bt - 18} 100 ${bt - 20} C103 ${bt - 18} 114 ${bt - 11} 114 ${bt} Z`} />
    <circle cx={100} cy={bt - 8} r={3} />
  </g>
  const slots = range(n).map(k => { const y = bb - 2 - p * (k + 0.5); return { x: 100, y, kind: 'rect', w: 20, h: p - 2.2, letter: [134, y], clue: [58, y] } })
  return { art, slots }
}

function stones(n) {
  // One wavy line of stones from the near bank (right, the duck) to the far bank (left, the tree),
  // with dashed hops between them — a single path, so the order can't be misread.
  const x0 = 164, x1 = 36, step = (x0 - x1) / (n - 1), rx = Math.min(10, step * 0.5), ry = Math.min(7.5, rx * 0.82)
  const slots = range(n).map(i => {
    const x = x0 - i * step, y = 188 + 17 * Math.sin(i * 1.05 - 0.3)
    return { x, y, kind: 'ellipse', rx, ry, letter: [x, y + ry + 5], clue: [x, y - ry - 11] }
  })
  const wave = (x, y) => `M${x} ${y} q2.5 -2 5 0 t5 0`
  const hops = slots.slice(1).map((s, i) => { const a = slots[i]; return `M${a.x - rx * 0.4} ${a.y - ry * 0.85} Q${(a.x + s.x) / 2} ${Math.min(a.y, s.y) - ry - 6} ${s.x + rx * 0.4} ${s.y - ry * 0.85}` }).join(' ')
  const art = <g stroke={INK} strokeWidth={0.7} fill="none" strokeLinecap="round">
    <path d="M24 122 q-4 16 0 32 t0 32 t0 32 t0 30" />
    <path d="M176 122 q4 16 0 32 t0 32 t0 32 t0 30" />
    {[[48, 240], [80, 236], [118, 240], [146, 236], [96, 134], [140, 136], [56, 140]].map(([x, y]) => <path key={x + '-' + y} d={wave(x, y)} />)}
    <path d={hops} strokeWidth={0.5} strokeDasharray="1.2 1.2" />
    {/* the tree on the far bank */}
    <rect x={11} y={182} width={4} height={30} fill="#fff" />
    <path d="M13 160 q-9 2 -8 11 q-2 8 6 10 q5 4 9 -2 q4 -3 1 -10 q1 -9 -8 -9 Z" fill="#fff" />
    {[[186, 236], [192, 228], [186, 150]].map(([x, y]) => <path key={x + '-' + y} d={`M${x} ${y} l-1.5 -4 M${x} ${y} l0 -4.5 M${x} ${y} l1.5 -4`} />)}
    {/* the duck that crosses */}
    <g fill="#fff">
      <ellipse cx={188.5} cy={197} rx={5.8} ry={4} />
      <circle cx={184} cy={190.5} r={2.8} />
      <path d="M181.4 190 L178 191 L181.4 192 Z" />
    </g>
    <circle cx={183.2} cy={189.8} r={0.45} fill={INK} />
  </g>
  return { art, slots }
}

function flower(n) {
  const C = [100, 186], Rp = 38, rx = 14, ry = Math.min(14, (Math.PI * Rp / n) * 0.92)
  const ang = k => (-90 + (k * 360) / n) * Math.PI / 180
  const at = (k, d) => [C[0] + Math.cos(ang(k)) * d, C[1] + Math.sin(ang(k)) * d]
  const art = <g stroke={INK} strokeWidth={0.7} fill="#fff">
    {range(n).map(k => { const [x, y] = at(k, Rp); return <ellipse key={k} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${-90 + (k * 360) / n} ${x} ${y})`} /> })}
    <circle cx={C[0]} cy={C[1]} r={17} />
    {star({ x: C[0] + 9, y: C[1] - Rp - rx - 5.5, r: 3.4 })}
  </g>
  const slots = range(n).map(k => { const [x, y] = at(k, Rp), [lx, ly] = at(k, Rp + rx + 5.5), [cx, cy] = at(k, Rp + rx + 13); return { x, y, kind: 'circle', r: Math.min(6.8, ry - 2.5), letter: [lx, ly], clue: k === 0 ? [C[0] + 24, C[1] - Rp - rx - 5.5] : [cx, cy] } })
  return { art, slots, center: C }
}

function tower(n) {
  const p = Math.min(11.5, 100 / n), base = 244
  const blocks = range(n).map(k => ({ x: 80 + (k % 2 ? 2.5 : -2.5), y: base - (k + 1) * p }))
  const topY = blocks[n - 1].y, tx = blocks[n - 1].x
  const art = <g stroke={INK} strokeWidth={0.7} fill="#fff" strokeLinecap="round">
    <path d={`M8 ${base} H192`} />
    {[20, 34, 160, 176].map(x => <path key={x} d={`M${x} ${base} l-1.5 -3.5 M${x} ${base} l0 -4 M${x} ${base} l1.5 -3.5`} />)}
    <circle cx={166} cy={138} r={7} />
    {range(8).map(i => { const a = i * Math.PI / 4; return <path key={i} d={`M${166 + Math.cos(a) * 9.5} ${138 + Math.sin(a) * 9.5} L${166 + Math.cos(a) * 13} ${138 + Math.sin(a) * 13}`} /> })}
    <path d="M26 152 q-1 -7 7 -7 q3 -6 10 -3 q7 -1 7 6 q5 1 4 6 Z" />
    {blocks.map((b, k) => <rect key={k} x={b.x} y={b.y} width={40} height={p} rx={0.8} />)}
    {[0, 1, 2, 3].map(i => <rect key={i} x={tx + 1 + i * 10.6} y={topY - 4} width={6} height={4} />)}
    <path d={`M${tx + 20} ${topY - 4} V${topY - 16}`} />
    <path d={`M${tx + 20} ${topY - 16} L${tx + 28} ${topY - 13.5} L${tx + 20} ${topY - 11} Z`} />
    {kid({ x: 156, y: base })}
  </g>
  const slots = blocks.map(b => ({ x: b.x + 20, y: b.y + p / 2, kind: 'rect', w: 18, h: p - 2.5, letter: [133, b.y + p / 2], clue: [64, b.y + p / 2] }))
  return { art, slots }
}

// Hebrew copy per theme: where the results go and the path they follow.
export const THEMES = {
  train: { emoji: '🚂', name: 'רכבת', title: () => 'רכבת המספרים', where: 'בקרונות', path: () => 'מהקרון שמחובר לקטר ועד הקרון האחרון', draw: train },
  stairs: { emoji: '🪜', name: 'מדרגות', title: d => (d === 'desc' ? 'יורדים במדרגות' : 'מטפסים במדרגות'), where: 'על המדרגות', path: d => (d === 'desc' ? 'מהמדרגה העליונה ועד הדגל למטה' : 'מהמדרגה התחתונה ועד הדגל למעלה'), draw: stairs },
  caterpillar: { emoji: '🐛', name: 'זחל', title: () => 'זחל המספרים', where: 'בגוף הזחל', path: () => 'מהעיגול שליד הראש ועד הזנב', draw: caterpillar },
  bubbles: { emoji: '🐟', name: 'דג ובועות', title: () => 'הדג והבועות', where: 'בבועות', path: () => 'מהבועה שליד הדג ועד הבועה העליונה', draw: bubbles },
  rocket: { emoji: '🚀', name: 'טיל', title: d => (d === 'desc' ? 'ספירה לאחור לשיגור' : 'הטיל ממריא'), where: 'בחלונות הטיל', path: () => 'מהחלון התחתון ועד החלון העליון', draw: rocket },
  stones: { emoji: '🦆', name: 'אבנים בנחל', title: () => 'קופצים על האבנים', where: 'על האבנים', path: () => 'מהאבן שליד הברווז ועד העץ בגדה השנייה', draw: stones },
  flower: { emoji: '🌼', name: 'פרח', title: () => 'פרח המספרים', where: 'בעלי הכותרת', path: () => 'מהעלה שליד הכוכב, בכיוון השעון', draw: flower },
  tower: { emoji: '🧱', name: 'מגדל', title: () => 'בונים מגדל', where: 'בקוביות', path: () => 'מהקובייה התחתונה ועד הקובייה העליונה', draw: tower },
}
export const THEME_KEYS = Object.keys(THEMES)
