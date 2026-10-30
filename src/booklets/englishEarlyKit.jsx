import { H, Pic, SvgPage, W, buildWordSearch, rngFor } from './kit'

// Shared pieces for the early English booklets (grades 1–2): a coloured frame and ribbon title on every
// page, outlined text to trace, handwriting guides, a picture match, a picture word search, an SVG cover
// and certificate. Pure functions of their props (the preview renders a booklet twice): no ids, no Math.random.
export const FONT = 'Heebo, Arial, sans-serif'
export const INK = '#111'
export const TONES = {
  sky: { main: '#38bdf8', soft: '#e0f2fe', dark: '#0369a1' },
  pink: { main: '#f472b6', soft: '#fce7f3', dark: '#be185d' },
  mint: { main: '#34d399', soft: '#d1fae5', dark: '#047857' },
  sun: { main: '#fbbf24', soft: '#fef3c7', dark: '#b45309' },
  lilac: { main: '#a78bfa', soft: '#ede9fe', dark: '#6d28d9' },
  peach: { main: '#fb923c', soft: '#ffedd5', dark: '#c2410c' },
}
export const TONE_LIST = ['sky', 'pink', 'mint', 'sun', 'lilac', 'peach']
export const COLOR_HEX = { red: '#ef4444', orange: '#fb923c', yellow: '#facc15', green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', pink: '#f9a8d4', brown: '#92400e', black: '#222', white: '#fff' }

export const img = (emoji, x, y, s) => <Pic item={{ art: emoji }} x={x} y={y} size={s} />

const starPts = (x, y, r) => Array.from({ length: 10 }, (_, i) => { const rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5; return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}` }).join(' ')
export const Star = ({ x, y, r, fill = '#facc15' }) => <polygon points={starPts(x, y, r)} fill={fill} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />

// Thick rounded border, an inner dotted line and a star in every corner.
export function Frame({ tone }) {
  const t = TONES[tone]
  return <g>
    <rect x="12" y="12" width={W - 24} height={H - 24} rx="28" fill="none" stroke={t.main} strokeWidth="8" />
    <rect x="26" y="26" width={W - 52} height={H - 52} rx="20" fill="none" stroke={t.main} strokeWidth="3" strokeDasharray="0.1 9" strokeLinecap="round" />
    {[[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]].map(([x, y]) => <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r="19" fill="white" stroke={t.main} strokeWidth="3" />
      <Star x={x} y={y + 1} r={13} fill={t.main} />
    </g>)}
  </g>
}

// Swallow-tail ribbon with the page title, the name line, the Hebrew instruction and an English line.
export function Banner({ n, title, en, instruction, tone }) {
  const t = TONES[tone]
  return <g fontFamily={FONT} textAnchor="middle" fill={INK}>
    <path d="M84 44 H516 L500 67 L516 90 H84 L100 67 Z" fill={t.soft} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <text x={W / 2} y="76" fontSize="24" fontWeight="800" direction="rtl">{title}</text>
    <text x={W / 2} y="113" fontSize="13.5" direction="rtl" fill="#444">שם: ______________   ·   עמוד {n} בחוברת</text>
    <text x={W / 2} y="140" fontSize="16.5" fontWeight="700" direction="rtl">{instruction}</text>
    {en && <text x={W / 2} y="163" fontSize="15" fontStyle="italic" fontWeight="600" fill={t.dark} direction="ltr">{en}</text>}
  </g>
}

export function Sheet({ n, tone, title, en, instruction, children }) {
  return <SvgPage label={title}>
    <Frame tone={tone} />
    <Banner n={n} title={title} en={en} instruction={instruction} tone={tone} />
    {children}
  </SvgPage>
}

// Outlined, dashed text to go over with a pencil.
export const Trace = ({ x, y, size, children, anchor = 'middle', color = '#5f6b7d' }) =>
  <text x={x} y={y} fontSize={size} fontWeight="600" textAnchor={anchor} fontFamily={FONT} fill="#e6e9ee" stroke={color} strokeWidth="1.2" strokeDasharray="3 2.5" direction="ltr">{children}</text>

// Handwriting lines: top, dashed middle, baseline. y is the baseline, h the height of a capital.
export function Guide({ x1, x2, y, h }) {
  return <g>
    <path d={`M${x1} ${y - h} H${x2}`} stroke="#9ca3af" strokeWidth="1" />
    <path d={`M${x1} ${y - h / 2} H${x2}`} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 5" />
    <path d={`M${x1} ${y} H${x2}`} stroke={INK} strokeWidth="1.6" />
  </g>
}

// A word with one letter in colour (the letter the page is about).
export const Hi = ({ word, at, color }) => [...word].map((ch, i) => <tspan key={i} fill={i === at ? color : undefined} fontWeight={i === at ? 900 : undefined}>{ch}</tspan>)

// Little drawings for words that have no print art.
export function Mini({ kind, x, y, s }) {
  if (kind === 'vase') return <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
    <path d={`M${x} ${y - s * 0.05} V${y - s * 0.32}`} fill="none" stroke="#15803d" strokeWidth="2.5" />
    <path d={`M${x} ${y - s * 0.12} q${s * 0.14} ${-s * 0.04} ${s * 0.18} ${-s * 0.14} q${-s * 0.12} ${-s * 0.02} ${-s * 0.18} ${s * 0.14}Z`} fill="#4ade80" />
    {Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return <circle key={i} cx={x + Math.cos(a) * s * 0.09} cy={y - s * 0.36 + Math.sin(a) * s * 0.09} r={s * 0.065} fill="#f9a8d4" strokeWidth="1.4" /> })}
    <circle cx={x} cy={y - s * 0.36} r={s * 0.05} fill="#facc15" strokeWidth="1.4" />
    <path d={`M${x - s * 0.13} ${y - s * 0.05} Q${x - s * 0.32} ${y + s * 0.2} ${x - s * 0.14} ${y + s * 0.42} H${x + s * 0.14} Q${x + s * 0.32} ${y + s * 0.2} ${x + s * 0.13} ${y - s * 0.05} Z`} fill="#93c5fd" />
  </g>
  // yo-yo
  return <g stroke={INK} strokeWidth="2">
    <path d={`M${x} ${y - s * 0.42} V${y}`} fill="none" strokeWidth="1.5" />
    <circle cx={x} cy={y - s * 0.45} r={s * 0.05} fill="white" />
    <circle cx={x} cy={y + s * 0.12} r={s * 0.3} fill="#f87171" />
    <circle cx={x} cy={y + s * 0.12} r={s * 0.18} fill="#fecaca" strokeWidth="1.5" />
    <circle cx={x} cy={y + s * 0.12} r={s * 0.05} fill={INK} />
  </g>
}

// An item: { art } print art, { text } a word or number, { mini } a little drawing.
export function Thing({ item, x, y, s, ltr = true }) {
  if (item.mini) return <Mini kind={item.mini} x={x} y={y} s={s} />
  if (item.text) {
    const fs = Math.min(s * 0.5, 30, 250 / Math.max(item.text.length, 1))
    return <text x={x} y={y + fs * 0.35} fontSize={fs} fontWeight="800" textAnchor="middle" fontFamily={FONT} direction={ltr ? 'ltr' : 'rtl'}>{item.text}</text>
  }
  return img(item.art, x, y, s)
}

// Two columns of cards with a dot each; the left column is shuffled with the seed.
export function MatchCards({ n, tone, title, en, instruction, pairs, seed }) {
  const t = TONES[tone], left = rngFor(seed, n).shuffle(pairs.map(p => p[1]))
  const step = Math.min(86, 600 / pairs.length), top = 182, h = step - 10
  const card = (item, x, y, key) => <g key={key}>
    <rect x={x} y={y - h / 2} width="150" height={h} rx="14" fill={t.soft} stroke={INK} strokeWidth="1.8" />
    <Thing item={item} x={x + 75} y={y} s={h * 0.82} />
  </g>
  return <Sheet n={n} tone={tone} title={title} en={en} instruction={instruction}>
    {pairs.map(([r], i) => { const y = top + i * step + step / 2; return <g key={`r${i}`}>
      {card(r, 400, y, 'c')}<circle cx={380} cy={y} r="7" fill={t.main} stroke={INK} strokeWidth="1.5" />
    </g> })}
    {left.map((l, i) => { const y = top + i * step + step / 2; return <g key={`l${i}`}>
      {card(l, 50, y, 'c')}<circle cx={220} cy={y} r="7" fill={t.main} stroke={INK} strokeWidth="1.5" />
    </g> })}
  </Sheet>
}

// Word search (left to right and top to bottom) with a picture bank under the grid.
export function PicSearch({ n, tone, title, en, instruction, words, seed, size }) {
  const t = TONES[tone], { grid, placed } = buildWordSearch(words.map(w => w.word), size, seed)
  const cell = Math.min(46, 414 / size), x0 = (W - cell * size) / 2, y0 = 184
  const bank = words.filter(w => placed.includes(w.word)), perRow = Math.ceil(bank.length / 2), bw = Math.min(100, 500 / perRow)
  const by = y0 + cell * size + 18
  return <Sheet n={n} tone={tone} title={title} en={en} instruction={instruction}>
    <rect x={x0 - 8} y={y0 - 8} width={cell * size + 16} height={cell * size + 16} rx="16" fill={t.soft} stroke={INK} strokeWidth="2.5" />
    {grid.map((row, r) => row.map((ch, c) => <g key={`${r}-${c}`}>
      <rect x={x0 + c * cell + 2} y={y0 + r * cell + 2} width={cell - 4} height={cell - 4} rx="8" fill="white" stroke={t.main} strokeWidth="1" />
      <text x={x0 + c * cell + cell / 2} y={y0 + r * cell + cell / 2 + 9} fontSize="25" fontWeight="700" textAnchor="middle" fontFamily={FONT}>{ch}</text>
    </g>))}
    {bank.map((w, i) => { const row = Math.floor(i / perRow), col = i % perRow, cnt = row ? bank.length - perRow : perRow
      const x = W / 2 + (col - (cnt - 1) / 2) * bw, y = by + row * ((H - 40 - by) / 2)
      const bh = (H - 40 - by) / 2 - 8
      return <g key={w.word} fontFamily={FONT} textAnchor="middle">
        <rect x={x - bw / 2 + 4} y={y} width={bw - 8} height={bh} rx="12" fill="white" stroke={INK} strokeWidth="1.5" />
        {img(w.art, x, y + bh * 0.4, Math.min(44, bh * 0.55))}
        <text x={x} y={y + bh - 9} fontSize="17" fontWeight="800" direction="ltr">{w.word}</text>
      </g> })}
  </Sheet>
}

// SVG cover: ABC blocks, pictures, title, name box, the page list and a note for parents.
export function EarlyCover({ title, subtitle, pages, note, blocks, pics, tone }) {
  const t = TONES[tone], list = pages.slice(1), half = Math.ceil(list.length / 2)
  return <SvgPage label={title}>
    <Frame tone={tone} />
    <g fontFamily={FONT} textAnchor="middle">
      {[...blocks].map((ch, i) => { const s = 74, x = W / 2 + (i - (blocks.length - 1) / 2) * 92 - s / 2, y = i % 2 ? 76 : 66, c = TONES[TONE_LIST[i % TONE_LIST.length]]
        return <g key={i}>
          <path d={`M${x} ${y} l14 -14 h${s} l-14 14 Z`} fill={c.soft} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d={`M${x + s} ${y} l14 -14 v${s} l-14 14 Z`} fill={c.main} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <rect x={x} y={y} width={s} height={s} rx="6" fill={c.main} stroke={INK} strokeWidth="2.2" />
          <rect x={x + 7} y={y + 7} width={s - 14} height={s - 14} rx="5" fill="white" stroke={INK} strokeWidth="1.2" />
          <text x={x + s / 2} y={y + s / 2 + 16} fontSize="44" fontWeight="900" fill={c.dark}>{ch}</text>
        </g> })}
      {pics.map(([e, x, y, s]) => <g key={e}>{img(e, x, y, s)}</g>)}
      <text x={W / 2} y="222" fontSize="36" fontWeight="900" direction="rtl">{title}</text>
      {subtitle.map((l, i) => <text key={i} x={W / 2} y={252 + i * 22} fontSize="16" direction="rtl" fill="#333">{l}</text>)}
      <rect x="110" y={268 + subtitle.length * 22} width="380" height="52" rx="18" fill={t.soft} stroke={INK} strokeWidth="2" strokeDasharray="7 5" />
      <text x={W / 2} y={302 + subtitle.length * 22} fontSize="21" fontWeight="700" direction="rtl">החוברת של: ____________________</text>
    </g>
    <g fontFamily={FONT} fontSize="13.5">
      {list.map((p, i) => { const col = i < half ? 0 : 1, row = col ? i - half : i, x = col ? 285 : 545, y = 395 + subtitle.length * 10 + row * 27
        return <g key={p}>
          <circle cx={x - 9} cy={y - 5} r="10" fill={TONES[TONE_LIST[i % TONE_LIST.length]].soft} stroke={INK} strokeWidth="1.2" />
          <text x={x - 9} y={y} fontSize="11.5" fontWeight="800" textAnchor="middle">{i + 2}</text>
          <text x={x - 26} y={y} direction="rtl" textAnchor="start">{p}</text>
        </g> })}
    </g>
    <g fontFamily={FONT} textAnchor="middle" direction="rtl">
      <rect x="54" y={H - 76 - (note.length - 1) * 21} width={W - 108} height={(note.length - 1) * 21 + 36} rx="16" fill={t.soft} stroke={t.main} strokeWidth="2" />
      {note.map((l, i) => <text key={i} x={W / 2} y={H - 52 - (note.length - 1 - i) * 21} fontSize="13.5" fontWeight={i ? 400 : 700}>{l}</text>)}
    </g>
  </SvgPage>
}

// SVG certificate with a medal and a row of stars.
export function EarlyCertificate({ booklet, done, cheer, tone }) {
  const t = TONES[tone]
  return <SvgPage label="תעודת סיום">
    <Frame tone={tone} />
    <rect x="52" y="52" width={W - 104} height={H - 104} rx="22" fill="none" stroke={INK} strokeWidth="2" />
    <rect x="60" y="60" width={W - 120} height={H - 120} rx="18" fill="none" stroke={t.main} strokeWidth="1.5" />
    <g fontFamily={FONT} textAnchor="middle">
      <path d={`M${W / 2 - 32} 250 l-22 70 l22 -12 l14 20 l8 -78 Z`} fill={TONES.sky.main} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${W / 2 + 32} 250 l22 70 l-22 -12 l-14 20 l-8 -78 Z`} fill={TONES.pink.main} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={W / 2} cy="200" r="70" fill={TONES.sun.main} stroke={INK} strokeWidth="3" />
      <circle cx={W / 2} cy="200" r="56" fill={TONES.sun.soft} stroke={INK} strokeWidth="1.5" strokeDasharray="4 4" />
      <Star x={W / 2} y={204} r={40} fill="#facc15" />
      <text x={W / 2} y="110" fontSize="20" fontWeight="800" direction="ltr" fill={t.dark} letterSpacing="3">CERTIFICATE</text>
      <text x={W / 2} y="372" fontSize="40" fontWeight="900" direction="rtl">תעודת סיום</text>
      <text x={W / 2} y="428" fontSize="22" direction="rtl">כל הכבוד ל־ ____________________</text>
      <text x={W / 2} y="476" fontSize="18" direction="rtl">שסיים/ה את <tspan fontWeight="800">{booklet}</tspan></text>
      {done.map((l, i) => <text key={i} x={W / 2} y={510 + i * 28} fontSize="17" direction="rtl">{l}</text>)}
      {[0, 1, 2, 3, 4].map(i => <Star key={i} x={W / 2 + (i - 2) * 56} y={600 - (i === 2 ? 8 : 0)} r={i === 2 ? 24 : 19} fill={[COLOR_HEX.red, COLOR_HEX.orange, '#facc15', COLOR_HEX.green, COLOR_HEX.blue][i]} />)}
      <text x={W / 2} y="668" fontSize="27" fontWeight="900" direction="ltr" fill={t.dark}>{cheer}</text>
      <text x={W / 2} y="728" fontSize="15" direction="rtl">תאריך: ____________     חתימה: ____________</text>
    </g>
  </SvgPage>
}
