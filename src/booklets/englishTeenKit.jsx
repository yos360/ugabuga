import { A4, art } from './kit'

// Shared layout for the teen English booklets (grades 7, 8, 9 and the Bagrut prep): HTML pages inside A4
// (print area about 182 × 232 mm), English blocks set LTR inside the RTL site, instructions in Hebrew.
// No childish pictures — a coloured accent (CSS variable --acc, set per booklet) and a few small icons.
export const LINE = '#9aa5b5', SOFT = '#f4f6f9'
const ACC = 'var(--acc)'
const ABC = 'abcd'

export const Art = ({ e, size = 12 }) => <img src={art(e)} alt="" aria-hidden="true" style={{ width: `${size}mm`, height: `${size}mm`, objectFit: 'contain', flex: 'none' }} />
export const En = ({ children, style }) => <bdi dir="ltr" style={style}>{children}</bdi>
const ltrBlock = { direction: 'ltr', textAlign: 'left' }

// Page head: icons, English title with the Hebrew title under it, name/date, page number.
export function Sheet({ n, accent, arts = [], en, he, children, noName }) {
  return <A4 style={{ alignItems: 'stretch', textAlign: 'right', '--acc': accent }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: '3mm', borderBottom: `2.5px solid ${ACC}`, paddingBottom: '1.5mm', marginBottom: '2mm' }}>
      {arts.length > 0 && <div style={{ display: 'flex', gap: '1mm' }}>{arts.map(e => <Art key={e} e={e} size={10} />)}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {en && <div style={{ fontSize: '17pt', fontWeight: 800, lineHeight: 1.15 }}><En>{en}</En></div>}
        {he && <div style={{ fontSize: '11pt', fontWeight: 700, color: '#333' }}>{he}</div>}
      </div>
      {!noName && <div style={{ fontSize: '9pt', color: '#555', lineHeight: 1.6, whiteSpace: 'nowrap' }}>שם: ______________<br />תאריך: ____________</div>}
      {n && <div style={{ width: '10mm', height: '10mm', borderRadius: '50%', background: ACC, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12pt', flex: 'none' }}>{n}</div>}
    </header>
    {children}
  </A4>
}

// A grammar / strategy box.
export const Rule = ({ title, children, style }) => <section style={{ border: `1.8px solid ${ACC}`, borderRadius: 10, padding: '1.6mm 3mm', margin: '0 0 2mm', background: SOFT, fontSize: '10.2pt', lineHeight: 1.4, ...style }}>
  {title && <div style={{ fontWeight: 800, fontSize: '11pt', color: ACC, marginBottom: '0.8mm' }}>{title}</div>}
  {children}
</section>

// English example lines inside a Rule.
export const Ltr = ({ children, style }) => <div dir="ltr" style={{ ...ltrBlock, ...style }}>{children}</div>

export const Tip = ({ e = '💡', children, style }) => <div style={{ display: 'flex', alignItems: 'center', gap: '2.5mm', border: `1.5px dashed ${LINE}`, borderRadius: 10, padding: '1.3mm 3mm', fontSize: '9.8pt', lineHeight: 1.4, margin: '0 0 2mm', ...style }}>
  <Art e={e} size={8} /><div>{children}</div>
</div>

export function Table({ head, rows, ltr = true, fs = '9.8pt', widths, style }) {
  const cell = { border: '1px solid #8a93a3', padding: '0.7mm 1.6mm', textAlign: ltr ? 'left' : 'right', verticalAlign: 'top' }
  return <table dir={ltr ? 'ltr' : 'rtl'} style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs, lineHeight: 1.35, margin: '0 0 2mm', ...style }}>
    {head && <thead><tr>{head.map((h, i) => <th key={i} style={{ ...cell, background: '#e8ecf2', fontWeight: 800, width: widths?.[i] }}>{h}</th>)}</tr></thead>}
    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={cell}>{c}</td>)}</tr>)}</tbody>
  </table>
}

// Exercise heading: letter badge, Hebrew instruction, optional English instruction.
export const Task = ({ k, children, en, pts }) => <div style={{ display: 'flex', alignItems: 'baseline', gap: '2mm', margin: '1.8mm 0 1mm', fontSize: '10.8pt', fontWeight: 700 }}>
  <span style={{ background: ACC, color: 'white', borderRadius: 5, padding: '0 1.6mm', fontWeight: 800, flex: 'none' }}>{k}</span>
  <span style={{ flex: 1 }}>{children}{en && <> <En style={{ fontWeight: 400, fontStyle: 'italic', color: '#333' }}>{en}</En></>}</span>
  {pts && <span style={{ fontSize: '9.5pt', border: `1px solid ${ACC}`, borderRadius: 5, padding: '0 1.5mm', flex: 'none' }}>{pts} נק׳</span>}
</div>

const answerLine = { borderBottom: '1px solid #999', height: '6.2mm' }

// Numbered English items. An item is a string or [text, answer]; `line` adds a writing line under each.
export function Ex({ items, start = 1, cols = 1, fs = '10.6pt', gap = '1.2mm', lh = 1.45, line }) {
  return <ol dir="ltr" start={start} style={{ ...ltrBlock, margin: '0 0 1mm', paddingInlineStart: '7mm', fontSize: fs, lineHeight: lh, columnCount: cols, columnGap: '8mm' }}>
    {items.map((it, i) => <li key={i} style={{ marginBottom: gap, breakInside: 'avoid' }}>{Array.isArray(it) ? it[0] : it}{line && <div style={answerLine} />}</li>)}
  </ol>
}

// Multiple choice. items: [question, [options], index of the right option].
export function MC({ items, start = 1, fs = '10.3pt', cols = 1 }) {
  return <ol dir="ltr" start={start} style={{ ...ltrBlock, margin: '0 0 1mm', paddingInlineStart: '7mm', fontSize: fs, lineHeight: 1.4, columnCount: cols, columnGap: '8mm' }}>
    {items.map(([q, opts], i) => <li key={i} style={{ marginBottom: '1.3mm', breakInside: 'avoid' }}>{q}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 6mm' }}>{opts.map((o, j) => <span key={j}><b>{ABC[j]}.</b> {o}</span>)}</div>
    </li>)}
  </ol>
}

// Reading questions. item: { q, opts?, a, lines? } — open questions get `lines` writing lines (default 1).
export function Questions({ items, start = 1, fs = '10.4pt' }) {
  return <ol dir="ltr" start={start} style={{ ...ltrBlock, margin: 0, paddingInlineStart: '7mm', fontSize: fs, lineHeight: 1.4 }}>
    {items.map((it, i) => <li key={i} style={{ marginBottom: '1.5mm', breakInside: 'avoid' }}>
      {it.q}
      {it.opts && <div style={{ display: 'flex', flexDirection: it.opts.some(o => o.length > 45) ? 'column' : 'row', flexWrap: 'wrap', gap: '0.3mm 6mm' }}>{it.opts.map((o, j) => <span key={j}><b>{ABC[j]}.</b> {o}</span>)}</div>}
      {!it.opts && Array.from({ length: it.lines ?? 1 }, (_, k) => <div key={k} style={answerLine} />)}
    </li>)}
  </ol>
}

// An original reading text, with numbered paragraphs (questions refer to them).
export function Passage({ title, kind, paras, fs = '10.8pt', lh = 1.48 }) {
  return <div dir="ltr" style={{ ...ltrBlock, border: `2px solid ${ACC}`, borderRadius: 12, padding: '2mm 4mm 1mm', fontSize: fs, lineHeight: lh, margin: '0 0 2mm' }}>
    {kind && <div style={{ fontSize: '8.5pt', letterSpacing: '0.6px', textTransform: 'uppercase', color: '#666', textAlign: 'center' }}>{kind}</div>}
    <div style={{ margin: '0 0 1.2mm', fontSize: '13.5pt', fontWeight: 800, textAlign: 'center' }}>{title}</div>
    {paras.map((p, i) => <div key={i} style={{ display: 'flex', gap: '2.5mm', margin: '0 0 0.9mm' }}>
      <span style={{ fontSize: '8.5pt', color: '#777', minWidth: '4mm', paddingTop: '0.6mm' }}>{i + 1}</span><span style={{ flex: 1 }}>{p}</span>
    </div>)}
  </div>
}

export const Glossary = ({ words }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5mm 5mm', fontSize: '9.4pt', border: `1px dashed ${LINE}`, borderRadius: 8, padding: '1mm 3mm', margin: '0 0 2mm' }}>
  <b>מילים שכדאי להכיר:</b>{words.map(([en, he]) => <span key={en}><En><b>{en}</b></En> – {he}</span>)}
</div>

// Word list: English on the left, Hebrew on the right.
export function WordBank({ words, cols = 3, fs = '9.8pt' }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1mm 2mm', margin: '0 0 2mm', fontSize: fs }}>
    {words.map(([en, he]) => <div key={en} dir="ltr" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '2mm', border: `1px solid ${LINE}`, borderRadius: 6, padding: '0.5mm 2mm' }}>
      <b>{en}</b><span dir="rtl" style={{ textAlign: 'right' }}>{he}</span>
    </div>)}
  </div>
}

export const Box = ({ words }) => <div dir="ltr" style={{ border: `1.5px dashed ${ACC}`, borderRadius: 8, padding: '1mm 3mm', textAlign: 'center', fontSize: '10.5pt', fontWeight: 700, wordSpacing: '1mm', margin: '0 0 1.5mm' }}>{words.join('  ·  ')}</div>

export const Lines = ({ n, h = '7.5mm' }) => <div>{Array.from({ length: n }, (_, i) => <div key={i} style={{ borderBottom: '1px solid #888', height: h }} />)}</div>

export const Checklist = ({ items, cols = 2 }) => <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2mm', fontSize: '9.8pt', lineHeight: 1.5, columnCount: cols, columnGap: '6mm' }}>
  {items.map(t => <li key={t} style={{ breakInside: 'avoid' }}><span style={{ display: 'inline-block', width: '3.2mm', height: '3.2mm', border: '1.3px solid #111', borderRadius: 2, marginInlineEnd: '2mm', verticalAlign: '-0.4mm' }} />{t}</li>)}
</ul>

// Answer key in two columns; each section runs its answers on inline ("1. x  2. y").
export function KeyPage({ n, accent, he, sections }) {
  return <Sheet n={n} accent={accent} arts={['🔑']} en="Answer Key" he={he} noName>
    <div style={{ columnCount: 2, columnGap: '6mm', fontSize: '9pt', lineHeight: 1.33 }}>
      {sections.map(s => <section key={s.title} style={{ breakInside: s.answers.length > 12 ? 'auto' : 'avoid', marginBottom: '1.8mm' }}>
        <div style={{ fontWeight: 800, color: ACC, borderBottom: `1px solid ${LINE}`, marginBottom: '0.5mm' }}>{s.title}</div>
        {s.note && <div style={{ fontSize: '8.3pt', color: '#555' }}>{s.note}</div>}
        <div dir="ltr" style={{ ...ltrBlock, display: 'flex', flexWrap: 'wrap', gap: '0 3mm' }}>{s.answers.map((a, i) => <span key={i}><b>{(s.start ?? 1) + i}.</b> {a}</span>)}</div>
      </section>)}
    </div>
  </Sheet>
}

export function TeenCover({ accent, arts, en, title, sub, pages, note }) {
  return <A4 style={{ alignItems: 'stretch', textAlign: 'center', '--acc': accent }}>
    <div style={{ background: ACC, color: 'white', borderRadius: 18, padding: '7mm 6mm 6mm' }}>
      <div dir="ltr" style={{ fontSize: '12pt', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.9 }}>{en}</div>
      <h2 style={{ fontSize: '25pt', margin: '2mm 0 1mm', color: 'white', lineHeight: 1.2 }}>{title}</h2>
      <p style={{ fontSize: '12.5pt', margin: 0 }}>{sub}</p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6mm', margin: '5mm 0' }}>{arts.map(e => <Art key={e} e={e} size={15} />)}</div>
    <div style={{ border: '2px dashed #111', borderRadius: 14, padding: '3.5mm', fontSize: '14pt', marginBottom: '4mm' }}>החוברת של: ______________________ &nbsp; כיתה: ______</div>
    <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 14, padding: '3mm 5mm', textAlign: 'right' }}>
      <b style={{ fontSize: '12pt' }}>מה בחוברת</b>
      <ol start={2} style={{ fontSize: '10.3pt', lineHeight: 1.5, columnCount: 2, columnGap: '8mm', margin: '1mm 0 0', paddingInlineStart: '6mm' }}>
        {pages.slice(1).map(t => <li key={t}><bdi>{t}</bdi></li>)}
      </ol>
    </div>
    {note && <p style={{ fontSize: '10pt', margin: '4mm 0 0', lineHeight: 1.55, textAlign: 'right' }}><b>לתלמיד/ה ולהורים:</b> {note}</p>}
  </A4>
}

// Learning map: what each part covers, with columns to tick, plus tips and grammar words.
export function MapPage({ n, accent, rows, intro, tips, terms }) {
  const cell = { border: '1px solid #8a93a3', padding: '0.6mm 1.5mm' }
  return <Sheet n={n} accent={accent} arts={['🗺']} en="My Learning Map" he="מפת הלמידה שלי — איך עובדים עם החוברת" noName>
    <p style={{ fontSize: '10.2pt', lineHeight: 1.5, margin: '0 0 2mm' }}>{intro}</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.4pt', margin: '0 0 2mm' }}>
      <thead><tr>{['עמוד', 'נושא', 'מה לומדים', 'עשיתי', 'בדקתי', 'צריך חזרה?'].map(h => <th key={h} style={{ ...cell, background: '#e8ecf2' }}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(([p, t, w]) => <tr key={p}><td style={{ ...cell, textAlign: 'center' }}>{p}</td><td style={cell}><bdi>{t}</bdi></td><td style={cell}>{w}</td><td style={{ ...cell, width: '10mm' }} /><td style={{ ...cell, width: '10mm' }} /><td style={{ ...cell, width: '15mm' }} /></tr>)}</tbody>
    </table>
    <div style={{ display: 'flex', gap: '3mm' }}>
      <Rule title="טיפים ללמידה" style={{ flex: 1, background: 'white' }}>
        <ul style={{ margin: 0, paddingInlineStart: '5mm' }}>{tips.map(t => <li key={t}>{t}</li>)}</ul>
      </Rule>
      <Rule title="מילים של דקדוק" style={{ flex: 1 }}>
        <div style={{ columnCount: 2, columnGap: '4mm', fontSize: '9.4pt' }}>{terms.map(([e, h]) => <div key={e}><En><b>{e}</b></En> – {h}</div>)}</div>
      </Rule>
    </div>
  </Sheet>
}

export function TeenCertificate({ accent, booklet, done }) {
  return <A4 style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', '--acc': accent }}>
    <div style={{ border: `5px double ${ACC}`, borderRadius: 22, padding: '12mm 10mm', width: '100%' }}>
      <div dir="ltr" style={{ fontSize: '13pt', letterSpacing: '4px', textTransform: 'uppercase', color: ACC, fontWeight: 800 }}>Certificate of Achievement</div>
      <h2 style={{ fontSize: '30pt', margin: '4mm 0' }}>תעודת סיום</h2>
      <p style={{ fontSize: '16pt', margin: '6mm 0' }}>מוענקת ל־ ______________________</p>
      <p style={{ fontSize: '14pt', lineHeight: 1.7, margin: 0 }}>על השלמת <b>{booklet}</b><br />{done}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8mm', margin: '8mm 0 4mm', fontSize: '12pt' }}>
        <div style={{ border: `1.5px solid ${ACC}`, borderRadius: 10, padding: '2mm 5mm' }}>ציון במבחן המסכם: _____ / 100</div>
        <div style={{ border: `1.5px solid ${ACC}`, borderRadius: 10, padding: '2mm 5mm' }}>הנושא שהכי השתפרתי בו: ______________</div>
      </div>
      <p dir="ltr" style={{ fontSize: '16pt', fontWeight: 800, margin: '6mm 0 2mm' }}>Well done — keep going!</p>
      <p style={{ fontSize: '12pt', marginTop: '8mm' }}>תאריך: ____________ &nbsp;&nbsp; חתימה: ____________</p>
    </div>
  </A4>
}
