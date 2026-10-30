import { createContext, useContext } from 'react'
import { buildCrossword } from './englishCrossword'
import { A4, art } from './kit'

// Shared page parts for the English booklets of grades 4–6 (englishGrade4/5/6.jsx). Every page is HTML
// inside A4 (print area about 182 × 232 mm), so sizes are in mm/pt. English always sits in a dir="ltr"
// block; instructions are in Hebrew with a short English line next to them, as in Israeli textbooks.
// Exercise strings use a tiny markup: ___ is a blank (longer run = longer line), [a|b] are options to
// circle and **x** is bold.

const THEMES = {
  4: { main: '#16768a', soft: '#e8f5f7', mid: '#a9d9e2', warm: '#f4a261', ink: '#0d4a57' },
  5: { main: '#6b3fa0', soft: '#f3eefa', mid: '#cdb8ea', warm: '#2a9d8f', ink: '#432667' },
  6: { main: '#b8432a', soft: '#fcefea', mid: '#efbdae', warm: '#2a6f97', ink: '#7a2a19' },
}
const Theme = createContext(THEMES[4])
const useT = () => useContext(Theme)
export function EnglishTheme({ grade, children }) {
  return <Theme.Provider value={THEMES[grade]}>{children}</Theme.Provider>
}

const PRINT = { printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }
const FONT_EN = 'Heebo, Arial, sans-serif'

// Print-art picture. Site CSS stretches every <img> in a page, so the size is always set inline.
export const Art = ({ e, mm = 14, style }) => <img src={art(e)} alt="" aria-hidden="true" style={{ width: `${mm}mm`, height: `${mm}mm`, objectFit: 'contain', flex: 'none', display: 'inline-block', verticalAlign: 'middle', ...style }} />

export const En = ({ children, style }) => <span dir="ltr" style={{ unicodeBidi: 'isolate', ...style }}>{children}</span>
export const EnBlock = ({ children, style }) => <div dir="ltr" style={{ textAlign: 'left', fontFamily: FONT_EN, ...style }}>{children}</div>

export function Blank({ n = 3, mm }) {
  return <span style={{ display: 'inline-block', width: `${mm || Math.max(7, n * 5.5)}mm`, borderBottom: '1.4px solid #111', margin: '0 1mm', height: '1em', verticalAlign: 'baseline' }} />
}

// Renders the exercise markup: ___ blanks, [a|b] options, **bold**.
export function T({ s }) {
  return <>{String(s).split(/(\[[^\]]+\]|_{1,}|\*\*[^*]+\*\*)/).map((part, i) => {
    if (!part) return null
    if (part[0] === '_') return <Blank key={i} n={part.length} />
    if (part[0] === '[') return <span key={i} style={{ whiteSpace: 'nowrap' }}>( {part.slice(1, -1).split('|').map((o, j) => <span key={j}>{j > 0 && <span style={{ color: '#888' }}> / </span>}<b style={{ padding: '0 1.2mm' }}>{o}</b></span>)} )</span>
    if (part.startsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>
    return <span key={i}>{part}</span>
  })}</>
}

function PageNum({ n }) {
  const t = useT()
  return <div style={{ width: '11mm', height: '11mm', borderRadius: '50%', background: t.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13pt', flex: 'none' }}>{n}</div>
}

// A page: coloured banner (pictures, Hebrew title, English subtitle, page number), a name line, content.
export function Sheet({ n, arts = [], title, en, children, spread = true }) {
  const t = useT()
  return <A4 style={{ alignItems: 'stretch', textAlign: 'right', ...PRINT }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: '3mm', borderRadius: '4mm', padding: '1.8mm 3.5mm', marginBottom: '1.2mm', background: `linear-gradient(90deg, ${t.soft}, white)`, border: `0.6mm solid ${t.main}` }}>
      <div style={{ display: 'flex', gap: '1mm' }}>{arts.map(e => <Art key={e} e={e} mm={12} />)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '18pt', textAlign: 'right', lineHeight: 1.15, color: t.ink }}>{title}</h2>
        {en && <div dir="ltr" style={{ fontSize: '11pt', color: t.main, fontWeight: 700, textAlign: 'right', fontFamily: FONT_EN }}>{en}</div>}
      </div>
      {n && <PageNum n={n} />}
    </header>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', color: '#444', margin: '0 1mm 0.5mm' }}><span>שם: ____________________</span><span>תאריך: ____________</span></div>
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: spread ? 'space-evenly' : 'flex-start' }}>{children}</div>
  </A4>
}

// A task with its exercise, kept together (the page spreads its sections over the free height).
export function Sec({ k, he, en, pts, children }) {
  return <section><Task k={k} he={he} en={en} pts={pts} />{children}</section>
}

// Task heading: letter badge, Hebrew instruction, English instruction, points (in the test).
export function Task({ k, he, en, pts, style }) {
  const t = useT()
  return <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0 2mm', margin: '2.2mm 0 1.2mm', ...style }}>
    <span style={{ flex: 'none', minWidth: '6.5mm', textAlign: 'center', background: t.main, color: 'white', borderRadius: '1.6mm', fontWeight: 800, fontSize: '11pt', padding: '0 1.5mm' }}>{k}</span>
    <span style={{ fontWeight: 800, fontSize: '12pt' }}>{he}</span>
    {en && <En style={{ fontSize: '10.5pt', color: t.main, fontWeight: 600 }}>{en}</En>}
    {pts && <span style={{ marginInlineStart: 'auto', fontSize: '10pt', border: `1px solid ${t.main}`, borderRadius: '3mm', padding: '0 2mm', color: t.ink }}>{pts} נק׳</span>}
  </div>
}

// The grammar / spelling rule box.
export function Rule({ title = 'Grammar Box', e = '💡', children, style }) {
  const t = useT()
  return <div style={{ border: `0.5mm solid ${t.mid}`, borderInlineStart: `2mm solid ${t.main}`, background: t.soft, borderRadius: '3mm', padding: '1.6mm 3.5mm', margin: '0 0 1.5mm', fontSize: '11pt', lineHeight: 1.42, ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', fontWeight: 800, color: t.ink, fontSize: '12pt', marginBottom: '0.6mm' }}><Art e={e} mm={6.5} /><En>{title}</En></div>
    {children}
  </div>
}

// English example table inside a rule box. rows: [[cell, cell, ...]]
export function RuleTable({ head, rows, size = '10.5pt' }) {
  const t = useT()
  const td = { border: `1px solid ${t.mid}`, padding: '0.6mm 2mm', background: 'white' }
  return <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: size, margin: '1mm 0', textAlign: 'left' }}>
    {head && <thead><tr>{head.map((h, i) => <th key={i} style={{ ...td, background: t.mid, color: t.ink }}>{h}</th>)}</tr></thead>}
    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={td}><T s={c} /></td>)}</tr>)}</tbody>
  </table>
}

// Numbered English exercise lines. items: strings or { q }.
export function Items({ items, cols = 1, start = 1, size = '12.5pt', gap = '2.2mm', lh = 1.5 }) {
  return <EnBlock style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: `${gap} 6mm`, fontSize: size, lineHeight: lh, padding: '0 2mm' }}>
    {items.map((it, i) => <div key={i} style={{ display: 'flex', gap: '1.5mm' }}><b style={{ minWidth: '5mm' }}>{start + i}.</b><span><T s={typeof it === 'string' ? it : it.q} /></span></div>)}
  </EnBlock>
}

// True / False statements with two circles to mark.
export function TFItems({ items, start = 1, size = '12pt', cols = 1 }) {
  const box = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '6.5mm', height: '6.5mm', border: '1.4px solid #111', borderRadius: '50%', fontWeight: 800, fontSize: '10pt' }
  return <EnBlock style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '1.6mm 6mm', fontSize: size, padding: '0 2mm' }}>
    {items.map((it, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5mm', borderBottom: '1px dashed #ddd', paddingBottom: '1mm' }}>
      <b style={{ minWidth: '5mm' }}>{start + i}.</b><span style={{ flex: 1 }}><T s={it.q} /></span>
      <span style={box}>T</span><span style={box}>F</span>
    </div>)}
  </EnBlock>
}

// Writing lines (English, left to right).
export function Lines({ k = 3, h = 8.5, lead }) {
  return <EnBlock>
    {Array.from({ length: k }, (_, i) => <div key={i} style={{ minHeight: `${h}mm`, borderBottom: '1.2px solid #555', display: 'flex', alignItems: 'flex-end', fontSize: '12pt' }}>{i === 0 && lead ? <span style={{ paddingBottom: '0.5mm' }}><T s={lead} /></span> : null}</div>)}
  </EnBlock>
}

// Picture dictionary cards. items: { e, en, he } ; blankHe → a line instead of the Hebrew word.
export function Cards({ items, cols = 6, mm = 15, blankHe, size = '12pt' }) {
  const t = useT()
  return <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '1.8mm', margin: '0.5mm 0 1mm' }}>
    {items.map(it => <div key={it.en} style={{ border: `0.45mm solid ${t.mid}`, borderRadius: '3mm', padding: '1.2mm 0.8mm 1mm', textAlign: 'center', background: 'white' }}>
      <Art e={it.e} mm={mm} />
      <div style={{ fontWeight: 800, fontSize: size, lineHeight: 1.15, color: t.ink, fontFamily: FONT_EN }}>{it.en}</div>
      <div dir="rtl" style={{ fontSize: '9.5pt', color: '#444', minHeight: '4mm' }}>{blankHe ? <span style={{ display: 'inline-block', width: '80%', borderBottom: '1px solid #777', height: '4.5mm' }} /> : it.he}</div>
    </div>)}
  </div>
}

// A picture with an English line to complete under it. items: { e, s }
export function PicFill({ items, cols = 4, mm = 15, size = '15pt', ls = '0.4mm' }) {
  const t = useT()
  return <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '1.8mm' }}>
    {items.map((it, i) => <div key={i} style={{ border: `0.45mm dashed ${t.mid}`, borderRadius: '3mm', padding: '1mm', display: 'flex', alignItems: 'center', gap: '1.5mm' }}>
      <b style={{ fontSize: '9.5pt', color: t.main, alignSelf: 'flex-start' }}>{i + 1}</b>
      {it.e ? <Art e={it.e} mm={mm} /> : <span style={{ width: `${mm}mm`, textAlign: 'center', fontSize: '20pt', fontWeight: 800 }}>{it.text}</span>}
      <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', fontSize: size, fontWeight: ls ? 700 : 400, letterSpacing: ls || 'normal', fontFamily: FONT_EN }}><T s={it.s} /></span>
    </div>)}
  </div>
}

// A dashed box with a word bank.
export function WordBank({ words, title = 'Word Bank', style }) {
  const t = useT()
  return <div dir="ltr" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.5mm 4mm', border: `0.5mm dashed ${t.main}`, borderRadius: '3mm', padding: '1.2mm 3mm', margin: '1mm 0', fontSize: '12pt', fontFamily: FONT_EN, ...style }}>
    <b style={{ color: t.main, fontSize: '10.5pt' }}>{title}:</b>
    {words.map(w => <span key={w} style={{ background: t.soft, borderRadius: '2mm', padding: '0 2mm', fontWeight: 700 }}>{w}</span>)}
  </div>
}

// A small coloured hint line with a picture.
export function Tip({ e = '💡', children, style }) {
  const t = useT()
  return <div style={{ display: 'flex', alignItems: 'center', gap: '2.5mm', border: `1px dashed ${t.main}`, borderRadius: '3mm', padding: '1.2mm 3mm', fontSize: '10.5pt', lineHeight: 1.4, margin: '1.2mm 0', ...style }}>
    <Art e={e} mm={7} /><div>{children}</div>
  </div>
}

// Reading passage in a framed "story card".
export function Passage({ title, arts = [], children, size = '12.5pt' }) {
  const t = useT()
  return <div dir="ltr" style={{ position: 'relative', border: `0.7mm solid ${t.main}`, borderRadius: '4mm', padding: '2mm 4mm 1.5mm', margin: '0.5mm 0 1.5mm', background: 'white', textAlign: 'left', fontFamily: FONT_EN, boxShadow: `1.2mm 1.2mm 0 ${t.mid}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5mm', borderBottom: `0.4mm solid ${t.mid}`, paddingBottom: '1mm', marginBottom: '1.2mm' }}>
      {arts.map(e => <Art key={e} e={e} mm={10} />)}
      <b style={{ fontSize: '15pt', color: t.ink }}>{title}</b>
    </div>
    <div style={{ fontSize: size, lineHeight: 1.5 }}>{children}</div>
  </div>
}

// Multiple choice: question + options a/b/c on one line.
export function Choice({ items, start = 1, size = '12pt', cols = 1 }) {
  return <EnBlock style={{ fontSize: size, lineHeight: 1.45, padding: '0 2mm', display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '0 6mm' }}>
    {items.map((it, i) => <div key={i} style={{ marginBottom: '1.2mm' }}>
      <b>{start + i}.</b> {it.q}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 7mm', paddingLeft: '6mm' }}>{it.options.map((o, j) => <span key={j}><b>{'abc'[j]})</b> {o}</span>)}</div>
    </div>)}
  </EnBlock>
}

// Open questions with lines.
export function Open({ items, start = 1, size = '12pt', lines = 1, inline }) {
  if (inline) return <EnBlock style={{ fontSize: size, padding: '0 2mm' }}>
    {items.map((it, i) => <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5mm', height: '8.2mm' }}>
      <b>{start + i}.</b><span style={{ flex: 'none', maxWidth: '62%' }}><T s={it.q} /></span><span style={{ flex: 1, borderBottom: '1.2px solid #555', height: '1px', marginBottom: '1.2mm' }} />
    </div>)}
  </EnBlock>
  return <EnBlock style={{ fontSize: size, lineHeight: 1.4, padding: '0 2mm' }}>
    {items.map((it, i) => <div key={i} style={{ marginBottom: '1mm' }}>
      <b>{start + i}.</b> <T s={it.q} />
      {Array.from({ length: it.lines || lines }, (_, k) => <div key={k} style={{ height: '7.5mm', borderBottom: '1.2px solid #555' }} />)}
    </div>)}
  </EnBlock>
}

// Look – Say – Cover – Write – Check.
export function SpellTable({ words }) {
  const t = useT()
  const td = { border: `1px solid ${t.mid}`, height: '10mm', padding: '0 2mm', textAlign: 'left' }
  return <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13pt', fontFamily: FONT_EN }}>
    <thead><tr>{['👀 Look & say', '✍️ Cover & write', '✍️ Write again', '✓ Check'].map(h => <th key={h} style={{ ...td, height: 'auto', background: t.soft, color: t.ink, fontSize: '10.5pt' }}>{h}</th>)}</tr></thead>
    <tbody>{words.map(w => <tr key={w}><td style={{ ...td, fontWeight: 800 }}>{w}</td><td style={td} /><td style={td} /><td style={{ ...td, width: '14mm' }} /></tr>)}</tbody>
  </table>
}

// Dictation: numbered lines for the child, and a fold-back strip for the adult who reads.
export function Dictation({ words, sentences }) {
  const t = useT()
  return <>
    <EnBlock style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 8mm', fontSize: '12pt' }}>
      {words.map((_, i) => <div key={i} style={{ height: '10mm', borderBottom: '1.2px solid #555', display: 'flex', alignItems: 'flex-end' }}><b style={{ color: t.main }}>{i + 1}.</b></div>)}
    </EnBlock>
    <EnBlock style={{ marginTop: '1mm' }}>
      {sentences.map((_, i) => <div key={i} style={{ height: '10.5mm', borderBottom: '1.2px solid #555', display: 'flex', alignItems: 'flex-end' }}><b style={{ color: t.main }}>{String.fromCharCode(65 + i)}.</b></div>)}
    </EnBlock>
    <div style={{ marginTop: '3mm', borderTop: '0.5mm dashed #777', paddingTop: '1.5mm' }}>
      <div style={{ fontSize: '9.5pt', color: '#555', marginBottom: '1mm' }}>✂ ‏למבוגר שמכתיב: מקפלים את הרצועה הזאת אחורה לפני ההכתבה. אומרים כל מילה פעמיים, ואת המשפטים לאט.</div>
      <EnBlock style={{ background: t.soft, borderRadius: '3mm', padding: '1.5mm 3mm', fontSize: '11pt', lineHeight: 1.5 }}>
        <div><b>Words:</b> {words.map((w, i) => <span key={w}>{i + 1}. {w}{i < words.length - 1 ? ' · ' : ''}</span>)}</div>
        <div><b>Sentences:</b> {sentences.map((s, i) => <span key={s}>{String.fromCharCode(65 + i)}. {s}{i < sentences.length - 1 ? '  ' : ''}</span>)}</div>
      </EnBlock>
    </div>
  </>
}

// Crossword. words: [{ word, e } | { word, clue }] — picture clues or Hebrew clues.
export function Crossword({ words, maxW = 175, maxH = 112 }) {
  const t = useT()
  const cw = buildCrossword(words.map(w => w.word))
  const cell = Math.min(maxW / cw.cols, maxH / cw.rows, 12.5)
  const across = cw.entries.filter(e => e.dir === 'across'), down = cw.entries.filter(e => e.dir === 'down')
  const pics = !!words[0].e
  const clue = e => { const w = words[e.index]; return pics ? <Art e={w.e} mm={14} /> : <span dir="rtl" style={{ fontSize: '11.5pt' }}>{w.clue} <span style={{ color: '#777' }}>({w.word.length})</span></span> }
  const badge = { minWidth: '6mm', height: '6mm', borderRadius: '50%', background: t.main, color: 'white', fontSize: '10.5pt', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flex: 'none' }
  const list = (title, arr) => <div style={{ flex: 1 }}>
    <div style={{ fontWeight: 800, color: t.ink, fontSize: '12.5pt', borderBottom: `0.4mm solid ${t.mid}`, marginBottom: '1.5mm' }}>{title}</div>
    <div style={{ display: pics ? 'flex' : 'block', flexWrap: 'wrap', gap: '2mm' }}>
      {arr.map(e => <div key={e.num + e.dir} style={{ display: 'flex', alignItems: 'center', gap: '1.5mm', marginBottom: pics ? 0 : '1.2mm', ...(pics ? { border: `0.45mm solid ${t.mid}`, borderRadius: '3mm', padding: '1mm 1.5mm' } : {}) }}><span style={badge}>{e.num}</span>{clue(e)}</div>)}
    </div>
  </div>
  return <>
    <div dir="ltr" style={{ display: 'flex', justifyContent: 'center', margin: '1mm 0 2mm' }}>
      <svg viewBox={`0 0 ${cw.cols * 10 + 2} ${cw.rows * 10 + 2}`} style={{ width: `${cw.cols * cell}mm`, height: `${cw.rows * cell}mm`, display: 'block' }} role="img" aria-label="crossword">
        {cw.grid.map(g => <rect key={`${g.r}-${g.c}`} x={1 + g.c * 10} y={1 + g.r * 10} width="10" height="10" fill="white" stroke="#111" strokeWidth="0.45" />)}
        {[...cw.numberAt].map(([k, num]) => { const [r, c] = k.split(',').map(Number); return <text key={k} x={1.8 + c * 10} y={4.6 + r * 10} fontSize="3.2" fontWeight="700" fill={t.main} fontFamily={FONT_EN}>{num}</text> })}
      </svg>
    </div>
    <div dir="ltr" style={{ display: 'flex', gap: '6mm', textAlign: 'left', fontFamily: FONT_EN }}>
      {list('➡ Across', across)}{list('⬇ Down', down)}
    </div>
  </>
}

// Final-test header with the score box.
export function ScoreBox({ total = 100 }) {
  const t = useT()
  return <div style={{ display: 'flex', alignItems: 'center', gap: '4mm', border: `0.6mm solid ${t.main}`, borderRadius: '3mm', padding: '1.2mm 4mm', margin: '0 0 1mm', background: t.soft, fontSize: '11pt' }}>
    <Art e="⭐" mm={8} />
    <span style={{ flex: 1 }}>קוראים כל שאלה עד הסוף, עונים באנגלית ובודקים בסוף. בהצלחה! <En style={{ color: t.main, fontWeight: 700, whiteSpace: 'nowrap' }}>Good luck!</En></span>
    <span style={{ border: '1.4px solid #111', borderRadius: '2mm', padding: '1mm 3mm', fontWeight: 800, background: 'white', whiteSpace: 'nowrap' }}>ציון: ______ / {total}</span>
  </div>
}

// Cover with a framed title, the skills of the booklet, a name box and the list of pages.
export function EnglishCover({ grade, title, arts, skills, pages, note }) {
  const t = useT()
  return <A4 style={{ alignItems: 'stretch', justifyContent: 'space-between', textAlign: 'center', ...PRINT }}>
    <div style={{ border: `1.2mm solid ${t.main}`, borderRadius: '8mm', padding: '5mm 6mm 4mm', background: `linear-gradient(160deg, ${t.soft}, white 70%)`, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3mm' }}>{arts.map(e => <Art key={e} e={e} mm={16} />)}</div>
      <div dir="ltr" style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: '25pt', color: t.main, margin: '2mm 0 0', letterSpacing: '0.3mm' }}>My English Workbook</div>
      <h2 style={{ fontSize: '27pt', fontWeight: 800, margin: '0 0 1mm', color: t.ink }}>{title}</h2>
      <div style={{ display: 'inline-block', background: t.main, color: 'white', borderRadius: '6mm', padding: '0.8mm 6mm', fontWeight: 800, fontSize: '13pt' }}>
        <En>Grade {grade}</En> · תוכנית הלימודים באנגלית — רמת יסוד
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${skills.length}, 1fr)`, gap: '2.5mm', margin: '4mm 0' }}>
      {skills.map(([e, he, en]) => <div key={en} style={{ border: `0.5mm solid ${t.mid}`, borderRadius: '4mm', padding: '2mm 1mm', background: 'white' }}>
        <Art e={e} mm={11} />
        <div style={{ fontWeight: 800, fontSize: '11.5pt' }}>{he}</div>
        <En style={{ fontSize: '9.5pt', color: t.main, fontWeight: 700 }}>{en}</En>
      </div>)}
    </div>
    <div style={{ border: '0.6mm dashed #111', borderRadius: '4mm', padding: '3.5mm', fontSize: '15pt', marginBottom: '4mm' }}>החוברת של: ______________________ &nbsp; כיתה: ______</div>
    <div style={{ border: `0.5mm solid ${t.mid}`, borderRadius: '4mm', padding: '2.5mm 5mm', textAlign: 'right' }}>
      <b style={{ fontSize: '12pt', color: t.ink }}>מה בחוברת</b>
      <ol start={2} style={{ listStyle: 'decimal', fontSize: '10.5pt', lineHeight: 1.5, columns: 2, columnGap: '10mm', margin: '1mm 0 0', paddingInlineStart: '6mm' }}>
        {pages.slice(1).map(p => <li key={p}>{p}</li>)}
      </ol>
    </div>
    <p style={{ fontSize: '10.5pt', margin: '3mm 0 0', lineHeight: 1.5, textAlign: 'right' }}><b>להורים ולמורים:</b> {note}</p>
  </A4>
}

// Answer key: compact sections, answers run on as "1. x · 2. y".
export function KeyPage({ n, sections, size = '9.6pt', cols = 2 }) {
  const t = useT()
  return <Sheet n={n} arts={['📖', '✏️']} title="דף תשובות" en="Answer Key — for parents and teachers" spread={false}>
    <div style={{ columns: cols, columnGap: '5mm', fontSize: size, lineHeight: 1.36 }}>
      {sections.map(s => <section key={s.title} style={{ breakInside: 'avoid', marginBottom: '1.8mm', borderInlineStart: `1mm solid ${t.mid}`, paddingInlineStart: '2mm' }}>
        <b style={{ color: t.ink }}>{s.title}</b>
        {s.note && <div style={{ color: '#555' }}>{s.note}</div>}
        <div dir="ltr" style={{ textAlign: 'left', fontFamily: FONT_EN }}>{s.answers.map((a, i) => <span key={i}>{s.letters ? '' : <b>{i + (s.start || 1)}.</b>} {a}{i < s.answers.length - 1 ? <span style={{ color: '#999' }}> · </span> : null}</span>)}</div>
      </section>)}
    </div>
  </Sheet>
}

// Certificate in the booklet colours.
export function EnglishCertificate({ grade, booklet, done }) {
  const t = useT()
  return <A4 style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...PRINT }}>
    <div style={{ border: `2.2mm double ${t.main}`, borderRadius: '8mm', padding: '9mm 8mm', width: '100%', minHeight: '215mm', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', background: `radial-gradient(circle at 50% 30%, ${t.soft}, white 70%)` }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3mm' }}>{['⭐', '👑', '⭐'].map((e, i) => <Art key={i} e={e} mm={i === 1 ? 20 : 13} />)}</div>
      <div dir="ltr" style={{ fontFamily: FONT_EN, fontSize: '27pt', fontWeight: 800, color: t.main, margin: '3mm 0 0' }}>Certificate of Achievement</div>
      <h2 style={{ fontSize: '24pt', fontWeight: 800, margin: '1mm 0 5mm', color: t.ink }}>תעודת הצטיינות באנגלית</h2>
      <p dir="ltr" style={{ fontSize: '14pt', margin: 0, fontFamily: FONT_EN }}>This certificate is proudly presented to</p>
      <p style={{ fontSize: '18pt', margin: '5mm 0' }}>______________________________</p>
      <p style={{ fontSize: '14pt', lineHeight: 1.6, margin: '0 0 3mm' }}>על סיום <b>{booklet}</b><br />{done}</p>
      <div dir="ltr" style={{ display: 'flex', justifyContent: 'center', gap: '3mm', margin: '2mm 0 5mm' }}>
        {[['📚', 'Vocabulary'], ['🧠', 'Grammar'], ['📖', 'Reading'], ['✏️', 'Writing']].map(([e, s]) => <div key={s} style={{ width: '27mm', border: `0.6mm solid ${t.mid}`, borderRadius: '50%', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
          <Art e={e} mm={9} /><b style={{ fontSize: '10pt', color: t.ink, fontFamily: FONT_EN }}>{s} ✓</b>
        </div>)}
      </div>
      <div style={{ display: 'inline-block', background: t.main, color: 'white', borderRadius: '6mm', padding: '1mm 7mm', fontWeight: 800, fontSize: '16pt', fontFamily: FONT_EN }} dir="ltr">Excellent work! · Grade {grade}</div>
      <p style={{ fontSize: '12pt', marginTop: '9mm' }}>תאריך: ____________ &nbsp;&nbsp;&nbsp; חתימה: ____________</p>
    </div>
  </A4>
}
