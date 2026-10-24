import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Choice, Field } from '../../components/printables/PrintableShell'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { SIGNS, SIGN_GROUPS, CUSTOM_ICONS, DEFAULT_SIGNS, SHEET_W, SHEET_H, cardBoxes, chunk, fitTitle, textLen } from '../../data/classroomSigns'

// Classroom and schedule-board signs: a wide card per subject (2 or 3 per A4), three looks,
// with or without niqqud, a custom sign and blank signs to write on. Every picture is drawn here
// as simple flat shapes with dark outlines, so the signs print well in colour and in black-and-white.

// ---------- colours ----------
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')
const LIGHTS = ['#e5484d', '#f5c518', '#3fb36b']
const DOTS = ['#e2604c', '#f2b31b', '#3b8bd0', '#46a865', '#7a5cd6']

const THEMES = {
  botanical: { label: '🌿 בוטני רך' },
  bright: { label: '🎈 צבעוני לילדים' },
  minimal: { label: '◻️ נקי ומינימלי' },
}

function palette(theme, color, ink) {
  if (ink) return { fill: '#fff', soft: '#fff', accent: '#fff', line: '#222', title: '#fff', frame: '#222', bg: '#fff', halo: 'none', leaf: '#fff', lights: ['#fff', '#fff', '#fff'], dots: DOTS.map(() => '#fff') }
  if (theme === 'minimal') return { fill: '#d4d4d4', soft: '#efefef', accent: '#b8b8b8', line: '#1d1d1d', title: '#111', frame: '#222', bg: '#fff', halo: 'none', leaf: '#999', lights: ['#5b5b5b', '#a3a3a3', '#e2e2e2'], dots: DOTS.map(() => '#bbb') }
  if (theme === 'botanical') {
    const base = mix(color, '#b5ae98', 0.45)
    return { fill: mix(base, '#ffffff', 0.2), soft: mix(base, '#ffffff', 0.62), accent: '#e3b65a', line: '#46473b', title: '#3a4733', frame: '#8ea784', bg: '#fbf8ef', halo: mix(base, '#fbf8ef', 0.8), leaf: '#97b08a', lights: LIGHTS.map(c => mix(c, '#b5ae98', 0.35)), dots: DOTS.map(c => mix(c, '#b5ae98', 0.5)) }
  }
  return { fill: color, soft: mix(color, '#ffffff', 0.6), accent: '#f7b733', line: '#2a2a2a', title: mix(color, '#000000', 0.38), frame: color, bg: mix(color, '#ffffff', 0.92), halo: mix(color, '#ffffff', 0.78), leaf: color, lights: LIGHTS, dots: DOTS }
}

// ---------- icons (drawn in a −30…30 box) ----------
const S = c => ({ stroke: c.line, strokeWidth: 2.4, strokeLinejoin: 'round', strokeLinecap: 'round' })
const label = (x, y, size, c, txt, dir = 'rtl', family) => <text x={x} y={y} fontSize={size} fontWeight={900} textAnchor="middle" dominantBaseline="central" direction={dir} fill={c.line} stroke="none" fontFamily={family}>{txt}</text>
function starPath(r1, r2, n = 5) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? r2 : r1, a = Math.PI * i / n - Math.PI / 2
    return `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`
  }).join(' ') + ' Z'
}
function gearPath() {
  let d = ''
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4
    for (const [da, r] of [[-0.3, 19], [-0.17, 26], [0.17, 26], [0.3, 19]]) d += `${d ? 'L' : 'M'}${(r * Math.cos(a + da)).toFixed(2)} ${(r * Math.sin(a + da)).toFixed(2)} `
  }
  return d + 'Z'
}
const GEAR = gearPath()
const bubble = 'M-22 -24 H22 Q28 -24 28 -18 V8 Q28 14 22 14 H-4 L-16 26 L-14 14 H-22 Q-28 14 -28 8 V-18 Q-28 -24 -22 -24 Z'
const bubbleR = 'M-22 -24 H22 Q28 -24 28 -18 V8 Q28 14 22 14 H14 L16 26 L4 14 H-22 Q-28 14 -28 8 V-18 Q-28 -24 -22 -24 Z'

const ICONS = {
  math: c => <g {...S(c)}>
    {[[-27, -27, c.fill], [3, -27, c.soft], [-27, 3, c.soft], [3, 3, c.fill]].map(([x, y, f], i) => <rect key={i} x={x} y={y} width={24} height={24} rx={5} fill={f} />)}
    <path d="M-15 -21v12M-21 -15h12M9 -15h12M-19 11l8 8M-11 11l-8 8M9 12h12M9 18h12" fill="none" strokeWidth={3} />
  </g>,
  letters: c => <g {...S(c)}>
    <rect x={-29} y={2} width={27} height={27} rx={4} fill={c.soft} /><rect x={2} y={2} width={27} height={27} rx={4} fill={c.fill} />
    <rect x={-13.5} y={-27} width={27} height={27} rx={4} fill={c.fill} transform="rotate(-6)" />
    {label(15.5, 15.5, 17, c, 'א')}{label(-15.5, 15.5, 17, c, 'ב')}{label(0, -13.5, 17, c, 'ג')}
  </g>,
  pencil: c => <g {...S(c)}>
    <g transform="translate(0 -4) rotate(-32)">
      <rect x={-26} y={-6} width={40} height={12} fill={c.fill} /><rect x={-31} y={-6} width={6} height={12} rx={2} fill={c.soft} />
      <path d="M14 -6 L28 0 L14 6 Z" fill="#fff" /><path d="M23.5 -2 L28 0 L23.5 2 Z" fill={c.line} />
      <path d="M-25 0 H13" fill="none" strokeWidth={1.2} />
    </g>
    <path d="M-26 26 q6 -6 12 0 t12 0 t12 0 t12 0" fill="none" />
  </g>,
  abc: c => <g {...S(c)}><path d={bubble} fill={c.soft} />{label(0, -5, 17, c, 'ABC', 'ltr')}</g>,
  bubbleAr: c => <g {...S(c)}><path d={bubbleR} fill={c.soft} />{label(0, -6, 15, c, 'مرحبا', 'rtl', 'Arial, sans-serif')}</g>,
  flask: c => <g {...S(c)}>
    <path d="M-15.2 7 H15.2 L24 20 Q27 27 19 27 H-19 Q-27 27 -24 20 Z" fill={c.fill} stroke="none" />
    <path d="M-5 -28 V-8 L-24 20 Q-27 27 -19 27 H19 Q27 27 24 20 L5 -8 V-28" fill="none" /><path d="M-9 -28 H9" fill="none" />
    <path d="M-15.2 7 H15.2" fill="none" strokeWidth={1.4} />
    <circle cx={-5} cy={17} r={2.6} fill="#fff" strokeWidth={1.4} /><circle cx={6} cy={12} r={1.8} fill="#fff" strokeWidth={1.2} /><circle cx={1} cy={-2} r={2} fill={c.soft} strokeWidth={1.2} /><circle cx={-2} cy={-13} r={1.5} fill={c.soft} strokeWidth={1.2} />
  </g>,
  tablets: c => <g {...S(c)}>
    <path d="M-28 26 V-13 A13 13 0 0 1 -2 -13 V26 Z" fill={c.soft} /><path d="M2 26 V-13 A13 13 0 0 1 28 -13 V26 Z" fill={c.fill} />
    <path d="M-23 -5H-7M-23 3H-7M-23 11H-7M-23 19H-11M7 -5H23M7 3H23M7 11H23M7 19H19" fill="none" strokeWidth={1.8} />
  </g>,
  scroll: c => <g {...S(c)}>
    <rect x={-19} y={-20} width={38} height={40} fill="#fff" />
    <path d="M-13 -11H13M-13 -4H13M-13 3H13M-13 10H6" fill="none" strokeWidth={1.8} />
    {[-23, 23].map(x => <g key={x}><rect x={x - 1.6} y={-30} width={3.2} height={60} rx={1.6} fill={c.line} /><rect x={x - 5} y={-24} width={10} height={48} rx={4} fill={c.fill} /></g>)}
  </g>,
  hourglass: c => <g {...S(c)}>
    <path d="M-15 -25 C-15 -6 -3 -4 -3 0 C-3 4 -15 6 -15 25 H15 C15 6 3 4 3 0 C3 -4 15 -6 15 -25 Z" fill="#fff" />
    <path d="M-10.5 -14 H10.5 C8 -7 3 -4 1 -1 H-1 C-3 -4 -8 -7 -10.5 -14 Z" fill={c.fill} strokeWidth={1.4} />
    <path d="M-14 24 Q0 9 14 24 Z" fill={c.fill} strokeWidth={1.4} /><path d="M0 0 V16" fill="none" strokeWidth={1.2} />
    <rect x={-20} y={-30} width={40} height={6} rx={2} fill={c.soft} /><rect x={-20} y={24} width={40} height={6} rx={2} fill={c.soft} />
  </g>,
  globe: c => <g {...S(c)}>
    <circle r={25} fill={c.soft} />
    <path d="M-15 -15 q6 -7 13 -3 q3 6 -4 9 q-2 7 -9 2 q-4 -3 0 -8 z M5 3 q9 -3 12 4 q-1 9 -9 9 q-5 -6 -3 -13 z M-18 8 q5 0 6 5 q-3 4 -7 1 z" fill={c.fill} strokeWidth={1.4} />
    <ellipse rx={10} ry={25} fill="none" strokeWidth={1.6} /><path d="M-25 0 H25 M-21 -13 Q0 -8 21 -13 M-21 13 Q0 8 21 13" fill="none" strokeWidth={1.6} />
    <circle r={25} fill="none" />
  </g>,
  pin: c => <g {...S(c)}>
    <path d="M-30 27 Q-18 4 -4 18 Q10 0 30 20 V27 Z" fill={c.soft} />
    <path d="M0 14 C-4 5 -14 -3 -14 -14 A14 14 0 0 1 14 -14 C14 -3 4 5 0 14 Z" fill={c.fill} /><circle cy={-14} r={5} fill="#fff" />
  </g>,
  menorah: c => <g {...S(c)}>
    {[24, 16, 8].map(r => <path key={r} d={`M${-r} -12 A${r} ${r} 0 0 0 ${r} -12`} fill="none" />)}
    <path d="M0 -12 V21" fill="none" /><path d="M-13 27 H13 L7 21 H-7 Z" fill={c.fill} />
    {[-24, -16, -8, 0, 8, 16, 24].map(x => <g key={x}><rect x={x - 2.8} y={-15.5} width={5.6} height={3.5} rx={1} fill={c.fill} strokeWidth={1.4} /><path d={`M${x} -17 q-3.4 -4.5 0 -9 q3.4 4.5 0 9z`} fill={c.accent} strokeWidth={1.2} /></g>)}
  </g>,
  frame: c => <g {...S(c)}>
    <path d="M-10 -23 L0 -31 L10 -23" fill="none" strokeWidth={1.6} />
    <rect x={-28} y={-23} width={56} height={46} rx={2} fill={c.fill} /><rect x={-21} y={-16} width={42} height={32} fill="#fff" />
    <path d="M-21 16 L-8 -2 L0 8 L8 0 L21 16 Z" fill={c.soft} strokeWidth={1.6} /><circle cx={11} cy={-7} r={4} fill={c.accent} strokeWidth={1.4} />
  </g>,
  palette: c => <g {...S(c)}>
    <path d="M2 -26 C-18 -26 -30 -12 -28 4 C-26 20 -8 28 6 26 C14 25 14 18 10 14 C6 10 10 5 16 6 C24 7 30 2 28 -8 C25 -20 16 -26 2 -26 Z" fill={c.soft} />
    {[[-16, -8], [-5, -17], [9, -17], [-17, 9], [-5, 16]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4.6} fill={c.dots[i]} strokeWidth={1.6} />)}
    <circle cx={19} cy={-5} r={3.6} fill="#fff" strokeWidth={1.6} />
  </g>,
  notes: c => <g {...S(c)}>
    <path d="M-8 18 V-14 L22 -21 V11" fill="none" /><path d="M-8 -14 L22 -21 L22 -13 L-8 -6 Z" fill={c.line} />
    <ellipse cx={-14} cy={19} rx={7.5} ry={5.5} transform="rotate(-20 -14 19)" fill={c.fill} /><ellipse cx={16} cy={12} rx={7.5} ry={5.5} transform="rotate(-20 16 12)" fill={c.fill} />
  </g>,
  dance: c => <g {...S(c)}>
    <path d="M16 -20 C26 -30 31 -12 21 -7 C11 -2 17 11 28 6" fill="none" stroke={c.fill === '#fff' ? c.line : c.fill} strokeWidth={2.8} />
    <path d="M1 -12 L-14 -25 M1 -12 L16 -20 M2 -16 L1 -3 M-2 10 L-9 27 M5 10 L20 19" fill="none" />
    <path d="M1 -5 L-12 10 H14 Z" fill={c.soft} /><circle cx={2} cy={-22} r={5.5} fill={c.fill} />
  </g>,
  ball: c => <g {...S(c)}><circle r={25} fill={c.fill} /><path d="M0 -25 V25 M-25 0 H25 M-17.5 -17.5 Q-6 0 -17.5 17.5 M17.5 -17.5 Q6 0 17.5 17.5" fill="none" strokeWidth={1.8} /><circle r={25} fill="none" /></g>,
  traffic: c => <g {...S(c)}>
    <rect x={-14} y={-31} width={28} height={58} rx={7} fill={c.line === '#222' && c.fill === '#fff' ? '#fff' : '#4a4a4a'} />
    {[-17, 0, 17].map((y, i) => <circle key={y} cy={y - 2} r={7} fill={c.lights[i]} strokeWidth={1.6} />)}
    <path d="M0 27 V31" fill="none" />
  </g>,
  heart: c => <g {...S(c)}>
    <path d="M-2 25 C-31 5 -29 -21 -13 -21 C-6 -21 -2 -16 -2 -11 C-2 -16 2 -21 9 -21 C25 -21 27 5 -2 25 Z" fill={c.fill} />
    <path d={'M22 -31 L24 -25 L30 -23 L24 -21 L22 -15 L20 -21 L14 -23 L20 -25 Z'} fill={c.accent} strokeWidth={1.4} />
  </g>,
  people: c => <g {...S(c)}>
    {[-16, 16].map(x => <g key={x}><path d={`M${x - 12} 22 Q${x - 12} 0 ${x} 0 Q${x + 12} 0 ${x + 12} 22 Z`} fill={c.soft} /><circle cx={x} cy={-9} r={7} fill={c.soft} /></g>)}
    <path d="M-14 27 Q-14 2 0 2 Q14 2 14 27 Z" fill={c.fill} /><circle cy={-12} r={8.5} fill={c.fill} />
  </g>,
  plant: c => <g {...S(c)}>
    <path d="M0 5 V-12" fill="none" />
    <path d="M0 -5 C-4 -21 -22 -21 -24 -15 C-20 -5 -6 -3 0 -5 Z" fill={c.soft} /><path d="M0 -13 C4 -27 22 -29 24 -23 C20 -13 6 -11 0 -13 Z" fill={c.fill} />
    <path d="M-13 10 H13 L9 28 H-9 Z" fill={c.fill} /><rect x={-16} y={4} width={32} height={7} rx={2} fill={c.soft} />
  </g>,
  books: c => <g {...S(c)}>
    <rect x={-25} y={14} width={46} height={12} rx={2} fill={c.fill} /><rect x={-20} y={2} width={44} height={12} rx={2} fill={c.soft} />
    <rect x={-23} y={-10} width={40} height={12} rx={2} fill={c.fill} /><rect x={-16} y={-22} width={32} height={12} rx={2} fill={c.soft} />
    <path d="M-18 14V26M15 14V26M-14 2V14M18 2V14M-17 -10V2M11 -10V2M-10 -22V-10M10 -22V-10" fill="none" strokeWidth={1.4} />
  </g>,
  openbook: c => <g {...S(c)}>
    <path d="M0 -14 C-10 -22 -22 -22 -28 -18 V20 C-22 16 -10 16 0 24 C10 16 22 16 28 20 V-18 C22 -22 10 -22 0 -14 Z" fill={c.soft} />
    <path d="M0 -14 V24 M-22 -9 C-16 -11 -10 -10 -5 -7 M-22 -1 C-16 -3 -10 -2 -5 1 M-22 7 C-16 5 -10 6 -5 9 M22 -9 C16 -11 10 -10 5 -7 M22 -1 C16 -3 10 -2 5 1 M22 7 C16 5 10 6 5 9" fill="none" strokeWidth={1.6} />
  </g>,
  computer: c => <g {...S(c)}>
    <rect x={-28} y={-26} width={56} height={38} rx={3} fill={c.fill} /><rect x={-23} y={-21} width={46} height={28} rx={1} fill="#fff" />
    <path d="M-15 -13 H5 M-15 -6 H11 M-15 1 H0" fill="none" strokeWidth={1.8} />
    <path d="M-6 12 L-8 21 H8 L6 12" fill={c.soft} /><rect x={-16} y={21} width={32} height={5} rx={2} fill={c.soft} />
  </g>,
  gear: c => <g {...S(c)}><path d={GEAR} fill={c.fill} /><circle r={8} fill="#fff" /><circle r={13} fill="none" strokeWidth={1.4} /></g>,
  quill: c => <g {...S(c)}>
    <rect x={-26} y={-26} width={36} height={52} rx={2} fill="#fff" />
    <path d="M-20 -16 H4 M-20 -8 H4 M-20 0 H4 M-20 8 H-2 M-20 16 H-6" fill="none" strokeWidth={1.6} />
    <path d="M2 20 C6 2 16 -18 30 -30 C29 -14 20 2 7 16 Z" fill={c.soft} /><path d="M3 19 L25 -24" fill="none" strokeWidth={1.4} /><path d="M2 20 L-1 26" fill="none" />
  </g>,
  kite: c => <g {...S(c)}>
    <path d="M0 14 Q-9 19 -3 23 T-7 31" fill="none" strokeWidth={1.6} />
    <path d="M-6 21 l-4 -3 l1 5 z M-4 28 l-4 -3 l1 5 z" fill={c.accent} strokeWidth={1.2} />
    <path d="M0 -30 L20 -8 L0 14 L-20 -8 Z" fill={c.fill} /><path d="M0 -30 L20 -8 H0 Z M0 14 L-20 -8 H0 Z" fill={c.soft} />
    <path d="M0 -30 V14 M-20 -8 H20" fill="none" strokeWidth={1.6} />
  </g>,
  sandwich: c => <g {...S(c)}>
    <path d="M-28 24 V-4 C-36 -8 -32 -24 -18 -22 C-14 -28 -4 -28 0 -22 C12 -24 16 -8 8 -4 V24 Z" fill={c.soft} />
    <path d="M-23 19 V-7 C-29 -10 -26 -19 -17 -17 C-13 -22 -5 -22 -2 -17 C7 -19 9 -10 3 -7 V19 Z" fill="none" strokeWidth={1.2} />
    <path d="M18 2 C10 -4 4 4 6 12 C8 22 14 28 18 26 C22 28 28 22 30 12 C32 4 26 -4 18 2 Z" fill={c.fill} />
    <path d="M18 2 L19 -5" fill="none" /><path d="M19.5 -4 q6 -6 10 -2 q-6 4 -10 2z" fill={c.soft} strokeWidth={1.4} />
  </g>,
  candles: c => <g {...S(c)}>
    {[-12, 12].map(x => <g key={x}>
      <rect x={x - 4} y={-13} width={8} height={27} rx={1} fill="#fff" />
      <path d={`M${x} -16 C${x - 5} -21 ${x - 2} -27 ${x} -31 C${x + 2} -27 ${x + 5} -21 ${x} -16 Z`} fill={c.accent} strokeWidth={1.4} />
      <path d={`M${x - 9} 14 H${x + 9} L${x + 4} 20 V24 H${x + 9} V28 H${x - 9} V24 H${x - 4} V20 Z`} fill={c.fill} />
    </g>)}
  </g>,
  day: c => <g {...S(c)}>
    <rect x={-26} y={-23} width={52} height={50} rx={4} fill="#fff" /><path d="M-26 -10 V-19 Q-26 -23 -22 -23 H22 Q26 -23 26 -19 V-10 Z" fill={c.fill} />
    <rect x={-16} y={-30} width={4.5} height={13} rx={2.2} fill={c.line} /><rect x={11.5} y={-30} width={4.5} height={13} rx={2.2} fill={c.line} />
    {label(0, 9, 24, c, c.letter)}
  </g>,
  star: c => <g {...S(c)}><path d={starPath(28, 12)} fill={c.fill} /></g>,
}

// ---------- decoration ----------
function Sprig({ x, y, rot, k, c, ink }) {
  const leaves = [[7, -2, -35], [11, 4.5, 30], [16, -1, -30], [20, 5, 25], [25, 1, -20], [29.5, 0, 0]]
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
    <path d="M0 0 C8 4 18 4 30 0" fill="none" stroke={ink ? '#222' : c.leaf} strokeWidth={0.9} strokeLinecap="round" />
    {leaves.map(([lx, ly, r], i) => <ellipse key={i} cx={lx} cy={ly} rx={4.2} ry={1.9} transform={`rotate(${r} ${lx} ${ly})`} fill={ink ? '#fff' : c.leaf} stroke={ink ? '#222' : 'none'} strokeWidth={0.4} opacity={ink ? 1 : 0.9} />)}
  </g>
}

function Frame({ w, h, theme, c, ink, stacked }) {
  const r = h * 0.09, i1 = h * 0.05
  if (theme === 'minimal') return <g fill="none">
    <rect width={w} height={h} fill={c.bg} />
    <rect x={i1} y={i1} width={w - 2 * i1} height={h - 2 * i1} rx={h * 0.06} stroke={c.frame} strokeWidth={h * 0.008} />
  </g>
  if (theme === 'botanical') {
    const k = h / 110
    return <g>
      <rect width={w} height={h} fill={c.bg} />
      <rect x={i1} y={i1} width={w - 2 * i1} height={h - 2 * i1} rx={r} fill="none" stroke={c.frame} strokeWidth={h * 0.012} />
      <rect x={h * 0.075} y={h * 0.075} width={w - h * 0.15} height={h - h * 0.15} rx={r * 0.75} fill="none" stroke={c.frame} strokeWidth={h * 0.005} />
      <Sprig x={h * 0.1} y={h * 0.13} rot={18} k={k} c={c} ink={ink} />
      {stacked
        // picture on top, title along the bottom: the second sprig goes to the top-right corner
        ? <g transform={`translate(${w} 0) scale(-1 1)`}><Sprig x={h * 0.1} y={h * 0.13} rot={18} k={k} c={c} ink={ink} /></g>
        : <><Sprig x={h * 0.1} y={h * 0.87} rot={-18} k={k} c={c} ink={ink} />
          <Sprig x={w * 0.5} y={h * 0.075} rot={180} k={k * 0.55} c={c} ink={ink} /></>}
    </g>
  }
  const corner = [[0.17, 0.2, 0.03], [0.25, 0.15, 0.018], [0.31, 0.19, 0.011]]
  const dots = [...corner, ...corner.slice(0, 2).map(([dx, dy, dr]) => stacked ? [w / h - dx, dy, dr] : [dx + 0.02, 1 - dy, dr])]
  return <g>
    <rect width={w} height={h} fill={c.bg} />
    <rect x={i1} y={i1} width={w - 2 * i1} height={h - 2 * i1} rx={r} fill={ink ? '#fff' : '#fff'} stroke={ink ? '#222' : c.frame} strokeWidth={h * (ink ? 0.012 : 0.032)} />
    {dots.map(([dx, dy, dr], i) => <circle key={i} cx={dx * h} cy={dy * h} r={dr * h} fill={c.dots[i % c.dots.length]} stroke={ink ? '#222' : 'none'} strokeWidth={0.4} />)}
  </g>
}

// ---------- one card ----------
function Card({ sign, box, theme, ink, nq, perPage }) {
  const { x, y, w, h } = box
  const c = { ...palette(theme, sign.color || '#8a8a8a', ink), letter: sign.letter }
  const icon = sign.icon && sign.icon !== 'none' ? ICONS[sign.icon] : null
  // 3 per page: a strip, picture at the start (right) and the title beside it.
  // 2 per page: a taller card, picture on top and the title across the full width below it.
  const stacked = perPage === 2 && !!icon
  const pad = h * 0.1
  const s = h * (stacked ? 0.4 : 0.6)
  const iconCx = stacked ? w / 2 : w - pad - s / 2 - h * 0.03, iconCy = stacked ? h * 0.33 : h / 2
  const x0 = pad + h * 0.06, x1 = icon && !stacked ? iconCx - s / 2 - h * 0.06 : w - pad - h * 0.06
  const avail = x1 - x0, cx = (x0 + x1) / 2
  const textH = stacked ? h * 0.8 : h, textCy = stacked ? h * 0.74 : h / 2
  const title = (nq && sign.nq) || sign.he || ''
  const sub = sign.sub ? (nq && sign.subNq) || sign.sub : ''
  const titleLabel = sign.he || 'שלט ריק'
  let text = null
  if (sign.blank) {
    text = <g stroke={c.line === '#1d1d1d' || ink ? '#9a9a9a' : c.frame} strokeWidth={h * 0.008} strokeDasharray={`${h * 0.03} ${h * 0.03}`}>
      <line x1={x0} x2={x1} y1={h * 0.66} y2={h * 0.66} />
    </g>
  } else if (title) {
    const { lines, fs } = fitTitle(title, avail, textH, !!sub, !stacked)
    const subFs = sub ? Math.min(fs * 0.42, avail / textLen(sub)) : 0
    const lh = fs * (nq ? 1.2 : 1.1)
    const blockH = lines.length * lh + (sub ? subFs * 1.5 : 0)
    const top = textCy - blockH / 2
    const outline = ink ? { stroke: '#222', strokeWidth: fs * 0.045, strokeLinejoin: 'round', paintOrder: 'stroke' } : {}
    text = <g fontWeight={ink ? 900 : theme === 'minimal' ? 700 : 800} textAnchor="middle" direction="rtl">
      {lines.map((ln, i) => <text key={i} x={cx} y={top + lh * i + fs * 0.9} fontSize={fs} fill={ink ? '#fff' : c.title} {...outline}>{ln}</text>)}
      {sub && <text x={cx} y={top + lines.length * lh + subFs * 1.15} fontSize={subFs} fontWeight={600} fill={ink ? '#222' : c.title}>{sub}</text>}
    </g>
  }
  return <g transform={`translate(${x} ${y})`} aria-label={titleLabel}>
    <Frame w={w} h={h} theme={theme} c={c} ink={ink} stacked={stacked} />
    {icon && <g transform={`translate(${iconCx} ${iconCy})`}>
      {theme !== 'minimal' && !ink && <circle r={s * 0.6} fill={c.halo} />}
      <g transform={`scale(${s / 64})`}>{icon(c)}</g>
    </g>}
    {text}
    <rect width={w} height={h} fill="none" stroke="#9a9a9a" strokeWidth={0.3} strokeDasharray="2 1.5" />
  </g>
}

function SignSheet({ signs, theme, ink, nq, perPage }) {
  const boxes = cardBoxes(perPage)
  return <svg viewBox={`0 0 ${SHEET_W} ${SHEET_H}`} xmlns="http://www.w3.org/2000/svg" role="img" fontFamily="Heebo, Arial, sans-serif"
    aria-label={'שלטים לכיתה: ' + signs.map(s => s.he || 'שלט ריק').join(', ')}>
    <rect width={SHEET_W} height={SHEET_H} fill="#fff" />
    {signs.map((sg, i) => <Card key={i} sign={sg} box={boxes[i]} theme={theme} ink={ink} nq={nq} perPage={perPage} />)}
    {boxes.slice(1, signs.length).map((b, i) => <text key={i} x={SHEET_W - 2} y={b.y - 1.6} fontSize={4} fill="#9a9a9a" textAnchor="end" direction="ltr">✂</text>)}
  </svg>
}

// ---------- page ----------
const PATH = '/printables/classroom-signs'
const FAQ = [
  { q: 'על איזה נייר כדאי להדפיס שלטים לכיתה?', a: 'נייר רגיל 80 גרם מספיק, אבל השלטים יחזיקו את כל השנה אם מדפיסים על בריסטול דק (160–200 גרם) או מלמינציה אחרי הגזירה. לשלטים שנתלים על לוח מגנטי מדביקים מגנט קטן מאחור, ולשלטים על לוח שעם — סיכה או סקוטש.' },
  { q: 'מה ההבדל בין 2 ל־3 שלטים בדף?', a: 'בשני שלטים בדף כל שלט גדול — כ־17 על 11 ס״מ — ומתאים ללוח מערכת גדול או לדלת של חדר. בשלושה שלטים בדף השלט צר וארוך, כמו פס, ונכנס בקלות לטבלת מערכת על הלוח או למשבצות של לוח כיס.' },
  { q: 'אפשר להדפיס בשחור־לבן?', a: 'כן. בכל הציורים יש קו מתאר כהה, כך שהם נראים טוב גם בשחור־לבן. העיצוב "נקי ומינימלי" נועד בדיוק לזה, ובמצב "קווים לצביעה" גם האותיות חלולות — התלמידים צובעים את השלטים בעצמם, וזו פעילות פתיחת שנה נחמדה.' },
  { q: 'חסר לי מקצוע. מה עושים?', a: 'כותבים את שם המקצוע בשדה "שלט משלכם" ובוחרים לו ציור, והוא מצטרף להדפסה. אפשר גם להדפיס שלטים ריקים ולכתוב עליהם בטוש.' },
  { q: 'למה כדאי לבחור שלטים עם ניקוד?', a: 'בכיתות א׳–ב׳, בחינוך המיוחד ולתלמידים שעוד רוכשים את הקריאה, ניקוד עוזר לקרוא את שם המקצוע לבד. בכיתות גבוהות יותר אפשר לוותר עליו.' },
  { q: 'יש גם מערכת שעות שמתאימה לשלטים?', a: 'כן — במערכת השעות להדפסה בוחרים 5 או 6 ימים וכותבים את שעות השיעורים. אפשר לתלות אותה ליד הלוח, או לתת לכל תלמיד עותק אישי.' },
]
const PARAGRAPHS = [
  'שלטי מקצועות ללוח המערכת עוזרים לתלמידים לדעת מה מחכה להם היום, בלי לשאול שוב ושוב. בכל בוקר מסדרים את השלטים לפי סדר השיעורים, ומי שמגיע לכיתה רואה מיד אם יש היום מדעים, אנגלית או ספורט. לתלמידים צעירים ולתלמידים בחינוך המיוחד, לוח מערכת עם תמונה לכל מקצוע הוא גם עוגן של שגרה וגם דרך לצמצם חרדה ממעברים.',
  'בעמוד הזה מדפיסים שלט רחב לכל מקצוע: כותרת גדולה וברורה, ציור פשוט שמזהה את המקצוע גם לפני שיודעים לקרוא, ומסגרת עדינה. יש שלטים לחשבון ולמתמטיקה, לעברית וללשון, לאנגלית, למדעים, לתנ״ך, לתורה, להיסטוריה, לגאוגרפיה ולמולדת, לתרבות יהודית, לתולדות האמנות ולאמנות, למוזיקה ולמחול, לחינוך גופני ולספורט, לזה״ב, לכישורי חיים, לשלישי חברתי, לשעת חינוך, לספרייה ולקריאה, למחשבים ולטכנולוגיה, לערבית ולטקסטים — וגם שלטים להפסקה, לארוחת עשר, לשבת שלום ולימות השבוע.',
]

function HowTo() {
  return <section className="mx-auto max-w-3xl space-y-4 text-base leading-relaxed text-[var(--foreground)]/80" aria-labelledby="howto-signs">
    <h2 id="howto-signs" className="text-2xl font-bold text-[var(--foreground)]">איך מכינים לוח מערכת עם השלטים</h2>
    <ol className="list-decimal space-y-2 pr-6">
      <li><b>בוחרים שלטים.</b> מסמנים את המקצועות שנלמדים בכיתה. כדאי להוסיף את ימות השבוע ושלט הפסקה, כדי שהלוח יספר את כל היום.</li>
      <li><b>בוחרים עיצוב וגודל.</b> בוטני רך מתאים לכיתה בגוונים טבעיים, צבעוני לילדים — לגן ולכיתות הנמוכות, ונקי ומינימלי — להדפסה בשחור־לבן ולכיתות הגבוהות. שני שלטים בדף ללוח גדול, שלושה בדף ללוח צר.</li>
      <li><b>מדפיסים וגוזרים</b> לאורך הקו המקווקו של כל שלט. מומלץ למנות (ללמינציה) או להדפיס על בריסטול, כי השלטים עוברים ידיים כל יום.</li>
      <li><b>תולים.</b> בגב כל שלט מדביקים מגנט, סקוטש או חתיכת בלו־טאק, ומסדרים את השלטים בטור לפי שעות היום — מימין לשמאל או מלמעלה למטה.</li>
    </ol>
    <h2 className="text-2xl font-bold text-[var(--foreground)]">רעיונות וטיפים למורות ולגננות</h2>
    <ul className="list-disc space-y-2 pr-6">
      <li><b>תורן מערכת:</b> בכל יום תלמיד אחר מסדר את השלטים לפי מערכת השעות — אחריות קטנה שמתחילה את הבוקר בתחושת שייכות.</li>
      <li><b>מה כבר עשינו:</b> בסוף כל שיעור הופכים את השלט או מזיזים אותו לצד, וכך רואים כמה נשאר עד סוף היום. לתלמידים עם קשיי קשב זה עוזר מאוד.</li>
      <li><b>שינויים מראש:</b> כשיש טיול, מבחן או מורה מחליפה, מוסיפים שלט משלכם ("טיול שנתי", "מסיבת חנוכה") — הפתעות פחות מבלבלות כשהן כתובות על הלוח.</li>
      <li><b>גם בבית:</b> הורים יכולים להדפיס את השלטים בגודל קטן ולתלות על המקרר — הילד מכין את התיק לפי השלטים של מחר.</li>
      <li><b>צביעה בפתיחת השנה:</b> מדפיסים במצב "קווים לצביעה" ומחלקים שלט לכל תלמיד. הלוח שנוצר שייך לכיתה כולה.</li>
    </ul>
    <p>רוצים גם טבלה? <Link to="/printables/class-schedule" className="font-bold underline">מערכת שעות להדפסה</Link> משלימה את השלטים — 5 או 6 ימים, עם שעות השיעורים ושם הכיתה.</p>
  </section>
}

export default function ClassroomSigns() {
  const [chosen, setChosen] = useState(DEFAULT_SIGNS)
  const [theme, setTheme] = useState('botanical')
  const [mode, setMode] = useState('color')
  const [nq, setNq] = useState('no')
  const [perPage, setPerPage] = useState('2')
  const [blanks, setBlanks] = useState('0')
  const [custom, setCustom] = useState('')
  const [customIcon, setCustomIcon] = useState('star')
  const toggle = id => setChosen(cs => (cs.includes(id) ? cs.filter(x => x !== id) : [...cs, id]))
  const setGroup = (g, on) => setChosen(cs => {
    const ids = SIGNS.filter(s => s.group === g).map(s => s.id)
    return on ? [...cs.filter(x => !ids.includes(x)), ...ids] : cs.filter(x => !ids.includes(x))
  })

  const list = SIGNS.filter(s => chosen.includes(s.id))
  const customs = custom.split(/[\n,]/).map(t => t.trim()).filter(Boolean).slice(0, 12)
    .map((t, i) => ({ id: 'custom' + i, he: t, icon: customIcon, color: ['#3b8bd0', '#46a865', '#e2604c', '#7a5cd6'][i % 4] }))
  const all = [...list, ...customs, ...Array.from({ length: +blanks }, (_, i) => ({ id: 'blank' + i, blank: true, color: '#8ea784' }))]
  const n = +perPage, ink = mode === 'ink'
  const pages = chunk(all, n).map((group, i) => ({
    key: [i, theme, mode, nq, n, group.map(s => s.id + (s.he || '')).join()].join('-'),
    svg: <SignSheet signs={group} theme={theme} ink={ink} nq={nq === 'yes'} perPage={n} />,
  }))

  const controls = <>
    <div>
      <p className="mb-2 text-center font-bold">עיצוב</p>
      <Choice label="עיצוב" value={theme} onChange={setTheme} options={Object.entries(THEMES).map(([k, v]) => [k, v.label])} />
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      <div><p className="mb-2 text-center font-bold">בדף A4</p><Choice label="כמה שלטים בדף" value={perPage} onChange={setPerPage} options={[['2', '2 שלטים'], ['3', '3 שלטים']]} /></div>
      <div><p className="mb-2 text-center font-bold">ניקוד</p><Choice label="ניקוד" value={nq} onChange={setNq} options={[['no', 'בלי'], ['yes', 'עִם נִקּוּד']]} /></div>
      <div><p className="mb-2 text-center font-bold">צבע</p><Choice label="צבע או צביעה" value={mode} onChange={setMode} options={[['color', '🎨 בצבע'], ['ink', '✏️ לצביעה']]} /></div>
    </div>
    {SIGN_GROUPS.map(([g, gl]) => {
      const items = SIGNS.filter(s => s.group === g)
      const allOn = items.every(s => chosen.includes(s.id))
      return <fieldset key={g} className="border-t-2 border-dashed border-[var(--border)] pt-3">
        <legend className="sr-only">{gl}</legend>
        <div className="mb-2 flex flex-wrap items-center justify-center gap-3">
          <p className="font-bold" aria-hidden="true">{gl}</p>
          <button type="button" onClick={() => setGroup(g, !allOn)} className="min-h-[36px] rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 text-sm font-bold">{allOn ? 'לנקות הכול' : 'לבחור הכול'}</button>
        </div>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={gl}>
          {items.map(s => <button key={s.id} type="button" aria-pressed={chosen.includes(s.id)} onClick={() => toggle(s.id)}
            className={`min-h-[44px] wobbly-sm border-2 border-[var(--border)] px-3 py-1.5 font-bold ${chosen.includes(s.id) ? 'bg-[var(--yellow)]' : 'bg-[var(--card)]'}`}>{chosen.includes(s.id) ? '✓ ' : ''}{s.he}</button>)}
        </div>
      </fieldset>
    })}
    <div className="grid gap-4 border-t-2 border-dashed border-[var(--border)] pt-3 sm:grid-cols-2">
      <div>
        <Field label="שלט משלכם (אפשר כמה, מופרדים בפסיק)" value={custom} onChange={setCustom} placeholder="למשל: שעת סיפור, מעגל בוקר" maxLength={120} />
        <label className="mt-2 block text-center font-bold">ציור לשלט שלכם
          <select value={customIcon} onChange={e => setCustomIcon(e.target.value)} className="mt-1 block w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal">
            {CUSTOM_ICONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>
      <div><p className="mb-2 text-center font-bold">שלטים ריקים לכתיבה ביד</p>
        <Choice label="כמה שלטים ריקים" value={blanks} onChange={setBlanks} options={[['0', 'בלי'], ['1', '1'], ['2', '2'], ['3', '3'], ['6', '6']]} /></div>
    </div>
    <p className="text-center text-sm font-bold" aria-live="polite">{all.length ? `נבחרו ${all.length} שלטים · ${pages.length} דפי A4` : 'בחרו לפחות שלט אחד.'}</p>
  </>

  return <PrintableShell path={PATH} emoji="🏫" h1="שלטי מקצועות לכיתה וללוח מערכת"
    seoTitle="שלטים לכיתה להדפסה — שלטי מקצועות ללוח מערכת"
    description="שלטי מקצועות להדפסה בחינם: חשבון, עברית, אנגלית, מדעים, תנ״ך, אמנות, ספורט, הפסקה, ימות השבוע ועוד — שלטים ללוח מערכת, 2 או 3 בדף, עם ניקוד או בלי, ב־3 עיצובים."
    sub="שלט רחב לכל מקצוע — לסדר כל בוקר על לוח המערכת"
    intro={<QuickAnswer q="איך מדפיסים שלטי מקצועות ללוח מערכת?"
      a="בוחרים את המקצועות, עיצוב (בוטני, צבעוני או מינימלי), 2 או 3 שלטים בדף ואם להוסיף ניקוד — ולוחצים על הדפסה. יש 38 שלטים מוכנים, שלט עם טקסט משלכם ושלטים ריקים לכתיבה ביד."
      rows={[['שלטים מוכנים', '29 מקצועות, הפסקה, ארוחת עשר, שבת שלום וימות השבוע'], ['גודל', '2 בדף (כ־17×11 ס״מ) או 3 בדף (פס של כ־17×7 ס״מ)'], ['אפשרויות', 'ניקוד, 3 עיצובים, קווים לצביעה, שלט אישי']]}
      updated="2026-10-24" />}
    controls={controls}
    pages={pages.length ? pages : [{ key: 'empty', svg: <SignSheet signs={[{ id: 'blank', blank: true }]} theme={theme} ink={ink} nq={false} perPage={n} /> }]}
    printTitle="שלטי מקצועות לכיתה"
    previewAll
    body={<HowTo />}
    paragraphs={PARAGRAPHS}
    faq={FAQ}
    related={[
      { label: 'מערכת שעות להדפסה', href: '/printables/class-schedule' },
      { label: 'לוח שנה תשפ״ז', href: '/printables/calendar-5787' },
      { label: 'כוכב/ת השבוע', href: '/printables/star-of-the-week' },
      { label: 'מדבקות שם', href: '/printables/name-labels' },
      { label: 'סרגל אותיות', href: '/printables/letter-strip' },
      { label: 'פעילויות לכיתה ולגן', href: '/classroom' },
    ]} />
}
