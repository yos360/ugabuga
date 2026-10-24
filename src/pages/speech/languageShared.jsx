import { Link } from 'react-router-dom'
import { ICONS } from '../../data/speech/categories'
import { LANGUAGE_HUB, LANGUAGE_PAGES } from '../../data/speech/language'

// Small pieces shared by the /speech/language/* pages: pictures (emoji or line icon) on screen
// and in printable SVG, SVG text and cut lines, the section nav and guide boxes.

export const FONT = 'Heebo, Arial, sans-serif'
export const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'

// On-screen picture: an emoji, or a line icon for words without a fitting emoji.
export function Pic({ item, className = 'text-6xl', size = 64 }) {
  if (item.e) return <span aria-hidden="true" className={`leading-none ${className}`}>{item.e}</span>
  if (item.i && ICONS[item.i]) return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} className="text-slate-700">
    <path d={ICONS[item.i]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  return null
}

// The same picture inside a printable SVG, centred on (cx, cy).
export function SvgPic({ item, cx, cy, size }) {
  if (item.e) return <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size.toFixed(2)} fontFamily={EMOJI}>{item.e}</text>
  if (item.i && ICONS[item.i]) {
    const s = size * 0.95
    return <g transform={`translate(${(cx - s / 2).toFixed(2)} ${(cy - s / 2).toFixed(2)}) scale(${(s / 24).toFixed(4)})`}>
      <path d={ICONS[item.i]} fill="none" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  }
  return null
}

export function Txt({ x, y, size, weight = 400, fill = '#111', anchor = 'middle', children }) {
  return <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} direction="rtl" fontFamily={FONT}>{children}</text>
}

export function SheetHeader({ title, note }) {
  return <>
    <Txt x={100} y={10.5} size={6.4} weight={900}>{title}</Txt>
    {note && <Txt x={100} y={16} size={3.2} fill="#4b5563">{note}</Txt>}
  </>
}

// Dashed cut lines around cells, each shared edge drawn once.
export function CutLines({ cells }) {
  const seen = new Set(), lines = []
  const add = (...l) => { const k = l.map(v => v.toFixed(2)).join(); if (!seen.has(k)) { seen.add(k); lines.push(l) } }
  for (const c of cells) { add(c.x, c.y, c.x + c.w, c.y); add(c.x, c.y + c.h, c.x + c.w, c.y + c.h); add(c.x, c.y, c.x, c.y + c.h); add(c.x + c.w, c.y, c.x + c.w, c.y + c.h) }
  return <g stroke="#9ca3af" strokeWidth=".35" strokeDasharray="2 1.4">{lines.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}</g>
}

// Seeded random numbers, so a printed set stays the same until "new set" is pressed.
export function rng(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

// Pills linking the pages of the language section (current page highlighted).
export function LanguageNav({ current }) {
  return <nav aria-label="עמודי השפה" className="mb-6 flex flex-wrap justify-center gap-2">
    <Link to={LANGUAGE_HUB} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-4 py-1.5 font-bold hover:bg-[var(--muted)]/30">💬 כל עמודי השפה</Link>
    {LANGUAGE_PAGES.map(p => p.id === current
      ? <span key={p.id} aria-current="page" className="rounded-full border-2 border-[var(--border)] bg-[var(--yellow)] px-4 py-1.5 font-bold">{p.emoji} {p.title}</span>
      : <Link key={p.id} to={p.path} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-4 py-1.5 font-bold hover:bg-[var(--muted)]/30">{p.emoji} {p.title}</Link>)}
  </nav>
}

export const Guide = ({ title, children, id }) => <section id={id} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
  <h2 className="mb-3 text-2xl font-bold">{title}</h2>
  <div className="space-y-2 leading-relaxed text-[var(--foreground)]/85">{children}</div>
</section>
export const Li = ({ children }) => <li className="mr-5 list-disc">{children}</li>

// A row of toggle buttons (one choice).
export function Pills({ value, onChange, options, label, tone = 'violet' }) {
  const on = tone === 'violet' ? 'border-violet-500 bg-violet-600 text-white' : 'border-violet-400 bg-violet-50 text-violet-900'
  return <div role="group" aria-label={label} className="flex flex-wrap justify-center gap-2">
    {options.map(([v, l]) => <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
      className={`min-h-[44px] rounded-xl border-2 px-4 font-bold ${value === v ? on : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
  </div>
}
