import { TraceText } from '../components/classroom/FirstGradeSheets'
import ActivitySvg from '../motor/render/ActivitySvg'
import { makeRng } from '../motor/rng'
import { emojiFile } from '../data/englishWords'
import '../pages/printables/fine-motor.css'

// Building blocks for the downloadable booklets (/booklets/:slug). Every page is a pure function of its
// props — PrintPreview renders the booklet twice (dialog + print copy), so no SVG ids and no Math.random.
// Pages are A4 (`buga-a4`), so the preview's "save as PDF" works for every booklet without extra code.

export const W = 600, H = 820
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'
export const rngFor = (seed, salt) => makeRng(seed * 31 + salt)
export const art = emoji => `/print-art/words/${emojiFile(emoji)}.svg`

export const A4 = ({ children, style }) => <article className="buga-a4" style={style}>{children}</article>
export const SvgPage = ({ label, children }) => <A4><div className="print-art"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ width: '100%', height: '100%', background: 'white' }}>{children}</svg></div></A4>

export function Head({ n, title, instruction, sub }) {
  return <g fontFamily={FONT} textAnchor="middle" fill={INK} direction="rtl">
    <text x={W / 2} y="40" fontSize="25" fontWeight="800">{title}</text>
    <text x={W / 2} y="68" fontSize="14">שם: ____________    עמוד {n} בחוברת</text>
    <text x={W / 2} y="98" fontSize="17" fontWeight="700">{instruction}</text>
    {sub && <text x={W / 2} y="120" fontSize="15" direction="ltr">{sub}</text>}
  </g>
}

// A picture slot: print-art image (English word bank), a colour swatch, a big emoji or plain text.
export function Pic({ item, x, y, size }) {
  if (item.art) return <image href={art(item.art)} x={x - size / 2} y={y - size / 2} width={size} height={size} />
  if (item.color) return <circle cx={x} cy={y} r={size * 0.38} fill={item.color} stroke={INK} strokeWidth="2" />
  if (item.shape) return <Shape kind={item.shape} x={x} y={y} s={size * 0.8} />
  if (item.emoji) return <text x={x} y={y + size * 0.33} fontSize={size * 0.85} textAnchor="middle">{item.emoji}</text>
  return <text x={x} y={y + size * 0.18} fontSize={Math.min(size * 0.55, 34)} fontWeight="800" textAnchor="middle" fontFamily={FONT} direction={item.ltr ? 'ltr' : 'rtl'}>{item.text}</text>
}

export function Shape({ kind, x, y, s }) {
  const h = s / 2, p = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' }
  if (kind === 'circle') return <circle cx={x} cy={y} r={h} {...p} />
  if (kind === 'square') return <rect x={x - h} y={y - h} width={s} height={s} {...p} />
  if (kind === 'rectangle') return <rect x={x - h * 1.3} y={y - h * 0.7} width={s * 1.3} height={s * 0.7} {...p} />
  if (kind === 'triangle') return <path d={`M${x} ${y - h}L${x + h} ${y + h}H${x - h}Z`} {...p} />
  if (kind === 'heart') return <path d={`M${x} ${y + h}C${x - h * 1.6} ${y - h * 0.2} ${x - h * 0.6} ${y - h * 1.3} ${x} ${y - h * 0.4}C${x + h * 0.6} ${y - h * 1.3} ${x + h * 1.6} ${y - h * 0.2} ${x} ${y + h}Z`} {...p} />
  const pts = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? h * 0.45 : h, a = -Math.PI / 2 + i * Math.PI / 5; return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}` })
  return <polygon points={pts.join(' ')} {...p} />
}

export function Cover({ emoji, title, subtitle, pages, note }) {
  return <A4 style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <div style={{ fontSize: 64, lineHeight: 1.1 }} aria-hidden="true">{emoji}</div>
    <h2 style={{ fontSize: '30pt', margin: '10px 0 4px' }}>{title}</h2>
    <p style={{ fontSize: '15pt', margin: '0 0 22px' }}>{subtitle}</p>
    <div style={{ border: '2px dashed #111', borderRadius: 18, padding: '16px 28px', fontSize: '18pt', marginBottom: 26 }}>החוברת של: ______________________</div>
    <ol style={{ textAlign: 'right', fontSize: '12.5pt', lineHeight: 1.7, columns: 2, columnGap: 36, margin: '0 auto 24px', maxWidth: '150mm' }}>
      {pages.slice(1).map(t => <li key={t}>{t}</li>)}
    </ol>
    {note && <p style={{ fontSize: '11.5pt', maxWidth: '150mm', margin: '0 auto', lineHeight: 1.6 }}><b>להורים:</b> {note}</p>}
  </A4>
}

export function Certificate({ booklet, done, cheer }) {
  return <A4 style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <div style={{ border: '6px double #111', borderRadius: 24, padding: '40px 30px', width: '100%' }}>
      <div style={{ fontSize: 60 }} aria-hidden="true">🏅</div>
      <h2 style={{ fontSize: '32pt', margin: '8px 0' }}>תעודת סיום</h2>
      <p style={{ fontSize: '18pt', margin: '18px 0' }}>כל הכבוד ל־ ______________________</p>
      <p style={{ fontSize: '16pt', lineHeight: 1.7 }}>שסיים/ה את <b>{booklet}</b>:<br />{done}</p>
      <p style={{ fontSize: '22pt', margin: '22px 0 6px' }} aria-hidden="true">⭐ ⭐ ⭐ ⭐ ⭐</p>
      <p style={{ fontSize: '18pt', fontWeight: 800 }}>{cheer}</p>
      <p style={{ fontSize: '13pt', marginTop: 26 }}>תאריך: ____________ &nbsp;&nbsp; חתימה: ____________</p>
    </div>
  </A4>
}

// Rows of dotted text to trace (letters, numbers, words) — reuses the first-grade writing lines.
export function TracePage({ n, title, instruction, rows, repeats = 6 }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✏️ {title}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 15 }}>שם: ______________ &nbsp;·&nbsp; עמוד {n} בחוברת</p>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>{instruction}</p>
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: `repeat(${rows.length}, 1fr)`, gap: 2 }}>
      {rows.map(r => <div key={r} style={{ minHeight: 0, height: '100%' }}><TraceText value={r} repeats={repeats} stroke="#9aa5b5" height={80} /></div>)}
    </div>
  </A4>
}

// Draw a line between matching items. `pairs` = [[right, left]] (right column is read first in Hebrew).
export function MatchPage({ n, title, instruction, sub, pairs, seed }) {
  const left = rngFor(seed, n).shuffle(pairs.map(p => p[1]))
  const top = 150, step = Math.min(82, 640 / pairs.length)
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} sub={sub} />
    {pairs.map(([r], i) => { const y = top + i * step + step / 2; return <g key={`r${i}`}>
      <Pic item={r} x={470} y={y} size={step * 0.8} /><circle cx={385} cy={y} r="6" fill={INK} />
    </g> })}
    {left.map((l, i) => { const y = top + i * step + step / 2; return <g key={`l${i}`}>
      <circle cx={215} cy={y} r="6" fill={INK} /><Pic item={l} x={130} y={y} size={step * 0.8} />
    </g> })}
  </SvgPage>
}

// Picture (or prompt) + options to circle. items: [{ pic, options, answer, prompt? }]
export function ChoicePage({ n, title, instruction, sub, items, ltr }) {
  const rowH = Math.min(84, 660 / items.length), top = 140
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} sub={sub} />
    {items.map((it, i) => { const y = top + i * rowH + rowH / 2; return <g key={i} fontFamily={FONT}>
      {it.pic && <Pic item={it.pic} x={530} y={y} size={rowH * 0.78} />}
      {it.prompt && <text x={it.pic ? 470 : 560} y={y + 7} fontSize="20" textAnchor="end" direction={ltr ? 'ltr' : 'rtl'}>{it.prompt}</text>}
      {it.options.map((o, j) => { const x = (it.prompt ? 250 : 400) - j * (it.prompt ? 85 : 120); return <text key={j} x={x} y={y + 9} fontSize={o.length > 6 ? 20 : 26} fontWeight="700" textAnchor="middle" direction={ltr ? 'ltr' : 'rtl'}>{o}</text> })}
      {i < items.length - 1 && <path d={`M30 ${y + rowH / 2} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

// Picture + word in outline to trace + a line to copy it.
export function WritePage({ n, title, instruction, sub, items }) {
  const rowH = 660 / items.length, top = 140
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} sub={sub} />
    {items.map((it, i) => { const y = top + i * rowH + rowH / 2; return <g key={i} fontFamily={FONT}>
      <Pic item={it.pic} x={540} y={y} size={rowH * 0.7} />
      <text x={330} y={y + 12} fontSize="38" fontWeight="700" textAnchor="middle" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeDasharray="4 3" direction="ltr">{it.word}</text>
      <path d={`M40 ${y + 16} H190`} stroke={INK} strokeWidth="1.5" />
      <path d={`M30 ${y + rowH / 2} H570`} stroke="#eee" />
    </g> })}
  </SvgPage>
}

// Lines of text with blanks (missing letters, sentences).
export function FillPage({ n, title, instruction, sub, lines, ltr, size = 30 }) {
  const rowH = 660 / lines.length, top = 140
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} sub={sub} />
    {lines.map((l, i) => <text key={i} x={W / 2} y={top + i * rowH + rowH / 2 + 10} fontSize={size} fontWeight="700" textAnchor="middle" fontFamily={FONT} direction={ltr ? 'ltr' : 'rtl'} style={{ whiteSpace: 'pre' }}>{l}</text>)}
  </SvgPage>
}

// Word search, in reading direction and top to bottom only (young readers). Deterministic for a seed.
// `he`: Hebrew letters, words run right to left (the page draws column 0 on the right).
const HE_FILL = 'אבגדהוזחטיכלמנסעפצקרשת'
export function buildWordSearch(words, size, seed, he = false) {
  const rng = rngFor(seed, 97), grid = Array.from({ length: size }, () => Array(size).fill(''))
  const placed = []
  for (const word of words) {
    const w = he ? word : word.toUpperCase()
    for (let tries = 0; tries < 200; tries++) {
      const down = rng.chance(0.4), r = rng.int(0, down ? size - w.length : size - 1), c = rng.int(0, down ? size - 1 : size - w.length)
      if ([...w].every((ch, k) => { const v = grid[down ? r + k : r][down ? c : c + k]; return !v || v === ch })) {
        [...w].forEach((ch, k) => { grid[down ? r + k : r][down ? c : c + k] = ch }); placed.push(word); break
      }
    }
  }
  const abc = he ? HE_FILL : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return { grid: grid.map(row => row.map(v => v || abc[rng.int(0, abc.length - 1)])), placed }
}
export function WordSearchPage({ n, title, instruction, words, seed, size = 10, he = false }) {
  const { grid, placed } = buildWordSearch(words.map(w => w.word), size, seed, he)
  const cell = 44, x0 = (W - cell * size) / 2, y0 = 140
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    <g fontFamily={FONT} fontSize="24" fontWeight="700" textAnchor="middle">
      <rect x={x0} y={y0} width={cell * size} height={cell * size} fill="none" stroke={INK} strokeWidth="2" rx="8" />
      {grid.map((row, r) => row.map((ch, c) => <text key={`${r}-${c}`} x={x0 + (he ? size - 1 - c : c) * cell + cell / 2} y={y0 + r * cell + cell / 2 + 8}>{ch}</text>))}
    </g>
    <g fontFamily={FONT} fontSize="18" textAnchor="middle">
      {words.filter(w => placed.includes(w.word)).map((w, i) => { const col = i % 4, row = Math.floor(i / 4), x = 525 - col * 150, y = y0 + cell * size + 50 + row * 70; return <g key={w.word}>
        {w.pic && <Pic item={w.pic} x={x} y={y - 8} size={36} />}
        <text x={x} y={y + 30} direction={he ? 'rtl' : 'ltr'}>{w.word}</text>
      </g> })}
    </g>
  </SvgPage>
}

export function MotorPage({ n, activity }) {
  return <article className="buga-a4 motor-sheet">
    <h2>{activity.title}</h2>
    <p className="art-caption motor-caption"><span>{activity.instruction}</span><span className="motor-name">עמוד {n} · שם: ______________</span></p>
    <div className="print-art"><ActivitySvg activity={activity} /></div>
  </article>
}

export function ImagePage({ n, title, instruction, src, alt }) {
  return <A4>
    <h2>{title}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>{instruction} · עמוד {n} בחוברת</p>
    <div className="print-art"><img src={src} alt={alt} /></div>
  </A4>
}

// Answers for the pages that have one right answer. sections: [{ title, answers: [string] }]
export function AnswerKey({ n, sections }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות להורים</h2>
    <p style={{ textAlign: 'center', margin: '0 0 10px', fontSize: 14 }}>עמוד {n} בחוברת</p>
    <div style={{ columns: 2, columnGap: 28, fontSize: '11.5pt', lineHeight: 1.55 }}>
      {sections.map(s => <section key={s.title} style={{ breakInside: 'avoid', marginBottom: 12 }}>
        <b>{s.title}</b>
        <ol style={{ margin: '4px 0 0', paddingInlineStart: 22 }}>{s.answers.map((a, i) => <li key={i}><bdi>{a}</bdi></li>)}</ol>
      </section>)}
    </div>
  </A4>
}
