import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PATH, SETS, GROUP_NAMES, ROUNDS, SHEET_SIZE, TEACHER_TIPS, SETUP_STEPS, FAQ, RULER_CM, stationFor, exercisesFor } from '../../data/mathCenters'

// /classroom/math-centers: five sets of six math stations for grades 2-3 (add/subtract to 100, first
// multiplication, money, clock, measurement). Per set: station cards (2 per A4), group answer sheets with
// generated exercises, a personal tracker per student, a rotation table for six groups and a teacher key.

const font = { fontFamily: 'Heebo, Arial, sans-serif' }

// A clock face; wrapped in a fixed-size box because the print sheet scales bare svgs to 100%.
function Clock({ h, m, blank, size = '25mm' }) {
  const hourDeg = (h % 12) * 30 + m * 0.5
  const minDeg = m * 6
  const hand = (deg, len, w) => {
    const rad = (deg - 90) * Math.PI / 180
    return <line x1="50" y1="50" x2={50 + len * Math.cos(rad)} y2={50 + len * Math.sin(rad)} stroke="#111" strokeWidth={w} strokeLinecap="round" />
  }
  return <div style={{ width: size, height: size, flex: 'none' }} aria-hidden="true">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="#fff" stroke="#111" strokeWidth="2.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 1) * 30 - 90) * Math.PI / 180
        return <text key={i} x={50 + 37 * Math.cos(a)} y={50 + 37 * Math.sin(a) + 3.4} fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif" fill="#111">{i + 1}</text>
      })}
      {!blank && <>{hand(hourDeg, 22, 4)}{hand(minDeg, 33, 2.4)}</>}
      <circle cx="50" cy="50" r="2.6" fill="#111" />
    </svg>
  </div>
}

// A drawn ruler (0-15 cm) with a bar above it from `start` to `start + len`; fixed-size box for print.
function Ruler({ start, len, width = '68mm' }) {
  const x = cm => 6 + cm * 10
  return <div style={{ width, flex: 'none', marginTop: '1mm' }} aria-hidden="true">
    <svg viewBox="0 0 162 40" xmlns="http://www.w3.org/2000/svg">
      <rect x={x(start)} y="3" width={len * 10} height="7" rx="2" fill="#94a3b8" stroke="#111" strokeWidth="1" />
      <rect x="1" y="14" width="160" height="24" rx="2" fill="#fff" stroke="#111" strokeWidth="1.4" />
      {Array.from({ length: RULER_CM * 2 + 1 }, (_, i) => <line key={i} x1={x(i / 2)} y1="14" x2={x(i / 2)} y2={i % 2 ? 19 : 23} stroke="#111" strokeWidth={i % 2 ? 0.7 : 1.1} />)}
      {Array.from({ length: RULER_CM + 1 }, (_, i) => <text key={i} x={x(i)} y="33" fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="Arial, sans-serif" fill="#111">{i}</text>)}
      <line x1={x(start)} y1="10" x2={x(start)} y2="14" stroke="#111" strokeWidth="0.8" strokeDasharray="1 1" />
      <line x1={x(start + len)} y1="10" x2={x(start + len)} y2="14" stroke="#111" strokeWidth="0.8" strokeDasharray="1 1" />
    </svg>
  </div>
}

const pageStyle = { ...font, justifyContent: 'flex-start', alignItems: 'stretch' }

function CardsPages({ set }) {
  const pairs = []
  for (let i = 0; i < set.stations.length; i += 2) pairs.push(set.stations.slice(i, i + 2))
  return <>{pairs.map((pair, p) => <article key={p} className="buga-a4" dir="rtl" style={pageStyle}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', gap: '3mm' }}>
      {pair.map((st, k) => {
        const n = p * 2 + k + 1
        return <section key={st.id} style={{ flex: 1, border: '2.5px solid #222', borderRadius: 14, padding: '4mm 6mm', display: 'flex', flexDirection: 'column', gap: '2mm', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4mm' }}>
            <span style={{ width: '15mm', height: '15mm', borderRadius: '50%', background: '#222', color: '#fff', fontWeight: 900, fontSize: '26pt', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{n}</span>
            <div style={{ fontSize: '25pt', fontWeight: 900, lineHeight: 1.1 }}>{st.emoji} {st.name}</div>
          </div>
          <div style={{ fontSize: '13.5pt' }}><b>המטרה:</b> {st.goal}</div>
          <ol style={{ margin: 0, paddingInlineStart: '9mm', fontSize: '16.5pt', lineHeight: 1.35, fontWeight: 600 }}>
            {st.steps.map(s => <li key={s}>{s}</li>)}
          </ol>
          <div style={{ marginTop: 'auto', fontSize: '12.5pt', display: 'grid', gap: '1.5mm' }}>
            <div><b>חומרים:</b> {st.materials}</div>
            <div style={{ border: '1.5px dashed #555', borderRadius: 8, padding: '1.5mm 3mm' }}>⭐ <b>אתגר:</b> {st.challenge}</div>
          </div>
        </section>
      })}
    </div>
    <footer style={{ ...font, fontSize: '10pt', margin: '2mm 0 0' }}>{set.title} · כרטיסי תחנות · ugabuga.co.il</footer>
  </article>)}</>
}

function Exercise({ ex, n, wide }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: '3mm', fontSize: wide ? '13pt' : '17pt', lineHeight: 1.35, minWidth: 0 }}>
    <b style={{ flex: 'none', minWidth: '6mm' }}>{n}.</b>
    {ex.clock && <Clock h={ex.clock.h} m={ex.clock.m} />}
    {ex.blankClock && <Clock h={12} m={0} blank />}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div>{ex.text}{/=s*$/.test(ex.text) && <span style={{ display: 'inline-block', borderBottom: '1.5px solid #333', width: '22mm', marginInlineStart: '2mm' }}>&nbsp;</span>}</div>
      {ex.ruler && <Ruler start={ex.ruler.start} len={ex.ruler.len} />}
      {(wide || ex.clock || ex.blankClock || ex.ruler) && <div style={{ marginTop: '2mm', fontSize: '13pt', color: '#444' }}>{ex.blankClock ? '' : 'תשובה: '}<span style={{ display: 'inline-block', borderBottom: '1.5px solid #333', width: wide ? '45mm' : '28mm' }}>&nbsp;</span></div>}
    </div>
  </div>
}

function StationSheet({ st, index, seed }) {
  const list = exercisesFor(st, seed)
  const wide = list.some(e => e.text.length > 36 && !e.clock && !e.blankClock)
  const cols = wide ? '1fr' : '1fr 1fr'
  return <section style={{ flex: 1, border: '2px solid #222', borderRadius: 12, padding: '3mm 5mm', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1.5px solid #222', paddingBottom: '1.5mm', marginBottom: '2mm' }}>
      <div style={{ fontSize: '16pt', fontWeight: 900 }}>תחנה {index + 1}: {st.emoji} {st.name}</div>
      <div style={{ fontSize: '11pt' }}>קבוצה: ______</div>
    </div>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: cols, alignContent: 'space-around', gap: '2mm 8mm' }}>
      {list.map((ex, i) => <Exercise key={ex.key} ex={ex} n={i + 1} wide={wide} />)}
    </div>
    {!wide && !list.some(e => e.clock || e.blankClock || e.ruler) && <div style={{ fontSize: '10.5pt', color: '#555', marginTop: '1mm' }}>כתבו את התשובה ליד כל תרגיל, ובדקו יחד.</div>}
  </section>
}

function SheetPages({ set, seed }) {
  const pairs = []
  for (let i = 0; i < set.stations.length; i += 2) pairs.push([i, i + 1])
  return <>{pairs.map(([a, b]) => <article key={a} className="buga-a4" dir="rtl" style={pageStyle}>
    <h2 style={{ ...font, margin: '0 0 2mm', fontSize: '15pt' }}>{set.emoji} {set.title} · דף תשובות לקבוצה</h2>
    <div style={{ ...font, fontSize: '11pt', textAlign: 'center', marginBottom: '2mm' }}>שמות חברי הקבוצה: ______________________________________</div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', gap: '3mm' }}>
      <StationSheet st={set.stations[a]} index={a} seed={seed} />
      <StationSheet st={set.stations[b]} index={b} seed={seed} />
    </div>
    <footer style={{ ...font, fontSize: '10pt' }}>ugabuga.co.il · מרכזי למידה בחשבון</footer>
  </article>)}</>
}

function KeyPage({ set, seed }) {
  return <article className="buga-a4" dir="rtl" style={pageStyle}>
    <h2 style={{ ...font, margin: '0 0 3mm' }}>מפתח תשובות למורה · {set.title}</h2>
    <div style={{ ...font, fontSize: '10.5pt', textAlign: 'center', marginBottom: '3mm' }}>המפתח מתאים לדפי התשובות שהודפסו מאותה סדרה (תרגילים מספר {seed}). דף שהודפס עם &quot;תרגילים חדשים&quot; יש להדפיס שוב.</div>
    <div style={{ ...font, flex: 1, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3mm', alignContent: 'start' }}>
      {set.stations.map((st, i) => <section key={st.id} style={{ border: '1.5px solid #222', borderRadius: 10, padding: '2.5mm 4mm' }}>
        <div style={{ fontWeight: 900, fontSize: '13pt', marginBottom: '1mm' }}>תחנה {i + 1}: {st.name}</div>
        <ol style={{ margin: 0, paddingInlineStart: '7mm', fontSize: '12pt', lineHeight: 1.45 }}>
          {exercisesFor(st, seed).map(ex => <li key={ex.key}>{ex.answer}</li>)}
        </ol>
      </section>)}
    </div>
    <footer style={{ ...font, fontSize: '10pt' }}>ugabuga.co.il · מרכזי למידה בחשבון</footer>
  </article>
}

// A face to colour in (easy / ok / hard), drawn so it prints in black and white.
function Face({ mood }) {
  const mouth = mood === 'easy' ? 'M8 15 Q12 19 16 15' : mood === 'ok' ? 'M8 16 L16 16' : 'M8 17 Q12 13 16 17'
  return <svg viewBox="0 0 24 24" width="11mm" height="11mm" aria-hidden="true">
    <circle cx="12" cy="12" r="10.5" fill="#fff" stroke="#111" strokeWidth="1.3" />
    <circle cx="8.5" cy="9.5" r="1.2" fill="#111" /><circle cx="15.5" cy="9.5" r="1.2" fill="#111" />
    <path d={mouth} fill="none" stroke="#111" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
}

function TrackerPage({ set }) {
  const cell = { border: '2px solid #222', padding: '1.5mm 2mm', verticalAlign: 'middle' }
  return <article className="buga-a4" dir="rtl" style={pageStyle}>
    <h2 style={{ ...font, margin: '0 0 1mm' }}>⭐ דף המעקב שלי · {set.emoji} {set.title}</h2>
    <div style={{ ...font, display: 'flex', justifyContent: 'space-between', fontSize: '13pt', margin: '2mm 0 3mm' }}>
      <span>שם: ____________________</span><span>קבוצה: ______</span><span>תאריך: __________</span>
    </div>
    <div style={{ ...font, fontSize: '11pt', textAlign: 'center', marginBottom: '2mm' }}>אחרי כל תחנה: סמנו ✓ אם סיימתם, וצבעו את הפרצוף שמתאר איך היה לכם.</div>
    <table style={{ ...font, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead><tr>
        <th style={{ ...cell, width: '36%', fontSize: '12pt' }}>תחנה</th>
        <th style={{ ...cell, width: '14%', fontSize: '12pt' }}>סיימתי ✓</th>
        <th style={{ ...cell, width: '14%', fontSize: '12pt' }}>אתגר ⭐</th>
        <th style={{ ...cell, fontSize: '12pt' }}>קל · בסדר · קשה</th>
      </tr></thead>
      <tbody>{set.stations.map((st, i) => <tr key={st.id}>
        <td style={{ ...cell, fontSize: '14pt', fontWeight: 700, height: '22mm' }}>{i + 1}. {st.emoji} {st.name}</td>
        <td style={cell}><div style={{ width: '10mm', height: '10mm', border: '2px solid #222', borderRadius: 4, margin: '0 auto' }} /></td>
        <td style={cell}><div style={{ width: '10mm', height: '10mm', border: '2px solid #222', borderRadius: '50%', margin: '0 auto' }} /></td>
        <td style={cell}><div style={{ display: 'flex', justifyContent: 'space-around' }}><Face mood="easy" /><Face mood="ok" /><Face mood="hard" /></div></td>
      </tr>)}</tbody>
    </table>
    <div style={{ ...font, width: '100%', marginTop: '5mm', fontSize: '13pt', display: 'grid', gap: '5mm' }}>
      <div>התחנה שהכי אהבתי: ______________________________________</div>
      <div>משהו חדש שלמדתי היום: ___________________________________</div>
      <div>________________________________________________________</div>
      <div>שאלה שעדיין יש לי: ______________________________________</div>
    </div>
    <footer style={{ ...font, fontSize: '10pt', marginTop: 'auto' }}>ugabuga.co.il · מרכזי למידה בחשבון</footer>
  </article>
}

const BADGE = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fed7aa']

function RotationPage({ set }) {
  return <article className="buga-a4" dir="rtl" style={pageStyle}>
    <h2 style={{ ...font, margin: '0 0 1mm' }}>🔄 טבלת סבב · {set.title}</h2>
    <div style={{ ...font, fontSize: '11pt', textAlign: 'center', marginBottom: '3mm' }}>כל קבוצה מגיעה לכל תחנה פעם אחת. בסוף כל סבב עוברים לתחנה הבאה בשורה.</div>
    <table style={{ ...font, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead><tr>
        <th style={{ border: '2px solid #222', padding: '2mm', fontSize: '12pt', width: '18%' }}>קבוצה</th>
        {Array.from({ length: ROUNDS }, (_, r) => <th key={r} style={{ border: '2px solid #222', padding: '1.5mm', fontSize: '11pt' }}>סבב {r + 1}<div style={{ fontSize: '9pt', fontWeight: 400 }}>שעה: _____</div></th>)}
      </tr></thead>
      <tbody>{GROUP_NAMES.map((g, gi) => <tr key={g}>
        <th style={{ border: '2px solid #222', padding: '2mm', fontSize: '14pt' }}>קבוצה {g}</th>
        {Array.from({ length: ROUNDS }, (_, r) => {
          const si = stationFor(gi, r)
          const st = set.stations[si]
          return <td key={r} style={{ border: '2px solid #222', padding: '1.5mm', textAlign: 'center', background: BADGE[si], height: '23mm' }}>
            <div style={{ fontSize: '22pt', fontWeight: 900, lineHeight: 1 }}>{si + 1}</div>
            <div style={{ fontSize: '8.5pt', lineHeight: 1.15, marginTop: '1mm' }}>{st.name}</div>
          </td>
        })}
      </tr>)}</tbody>
    </table>
    <h3 style={{ ...font, width: '100%', fontSize: '12pt', margin: '4mm 0 1mm' }}>שמות חברי הקבוצות</h3>
    <div style={{ ...font, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm 6mm', fontSize: '11pt' }}>
      {GROUP_NAMES.map(g => <div key={g}>קבוצה {g}: ______________________________</div>)}
    </div>
    <div style={{ ...font, width: '100%', marginTop: '4mm', fontSize: '10.5pt', color: '#333' }}>
      <b>תחנות:</b> {set.stations.map((s, i) => `${i + 1} ${s.name}`).join(' · ')}
    </div>
    <footer style={{ ...font, fontSize: '10pt', marginTop: 'auto' }}>ugabuga.co.il · מרכזי למידה בחשבון</footer>
  </article>
}

const btn = 'min-h-[48px] rounded-2xl border-2 border-[var(--border)] bg-white px-4 font-bold hover:bg-[var(--postit)]'

function SetSection({ set, seed, onNew, onPrint }) {
  return <section id={set.id} className="mt-10 scroll-mt-20">
    <h2 className="text-3xl font-black">{set.emoji} {set.title}</h2>
    <p className="mt-1 text-lg">{set.intro} <span className="text-sm">(כיתות {set.grades})</span></p>
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={() => onPrint('cards')} className={`${btn} !bg-violet-700 !text-white`}>🖨️ כרטיסי תחנות (3 דפים)</button>
      <button type="button" onClick={() => onPrint('sheets')} className={btn}>📝 דפי תשובות לקבוצות</button>
      <button type="button" onClick={() => onPrint('tracker')} className={btn}>⭐ דף מעקב לתלמיד</button>
      <button type="button" onClick={() => onPrint('rotation')} className={btn}>🔄 טבלת סבב</button>
      <button type="button" onClick={() => onPrint('key')} className={btn}>✅ מפתח למורה</button>
      <button type="button" onClick={onNew} className={btn}>🎲 תרגילים חדשים</button>
    </div>
    <ol className="mt-5 grid gap-4 sm:grid-cols-2">
      {set.stations.map((st, i) => {
        const sample = exercisesFor(st, seed)
        return <li key={st.id} className="rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5">
          <h3 className="text-xl font-black"><span className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white">{i + 1}</span>{st.emoji} {st.name}</h3>
          <p className="mt-2"><b>מטרה:</b> {st.goal}</p>
          <p className="mt-1 text-sm"><b>חומרים:</b> {st.materials}</p>
          <details className="mt-3">
            <summary className="cursor-pointer font-bold">הוראות, אתגר ותרגילים לדוגמה</summary>
            <ol className="mt-2 list-decimal pr-5">{st.steps.map(s => <li key={s}>{s}</li>)}</ol>
            <p className="mt-2 rounded-xl bg-amber-50 p-2 text-sm">⭐ <b>אתגר:</b> {st.challenge}</p>
            <p className="mt-3 text-sm font-bold">תרגילים בדף התשובות הנוכחי (עם פתרון):</p>
            <ul className="mt-1 grid gap-1 text-sm">{sample.map(ex => <li key={ex.key}>{ex.clock ? 'קריאת שעון' : ex.ruler ? `סרגל: פס מ־${ex.ruler.start} עד ${ex.ruler.start + ex.ruler.len}` : ex.text} ← <b>{ex.answer}</b></li>)}</ul>
          </details>
        </li>
      })}
    </ol>
    <p className="mt-3"><Link to={set.link.href} className="font-bold text-violet-800 underline">{set.link.label} ←</Link></p>
  </section>
}

export default function MathCenters() {
  const [seeds, setSeeds] = useState({})
  const [print, setPrint] = useState(null) // { setId, mode }
  const seedOf = id => seeds[id] || 1
  const active = print && SETS.find(s => s.id === print.setId)
  const aSeed = active ? seedOf(active.id) : 1
  const titles = { cards: 'כרטיסי תחנות', sheets: 'דפי תשובות לקבוצות', tracker: 'דף מעקב לתלמיד', rotation: 'טבלת סבב', key: 'מפתח תשובות למורה' }
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="מרכזי למידה (תחנות) בחשבון לכיתות ב׳–ג׳ — כרטיסים, דפי תשובות, דף מעקב וטבלת סבב" description="חמש סדרות של שש תחנות בחשבון: חיבור וחיסור עד 100, כפל ראשון, כסף, שעון ומדידה. כרטיס הוראות לכל תחנה, דף תשובות לקבוצה, דף מעקב אישי לתלמיד, טבלת סבב ומדריך הפעלה, להדפסה חינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'מרכזי למידה בחשבון' }]} />
    <h1 className="text-center text-4xl sm:text-5xl">🔢 מרכזי למידה (תחנות) בחשבון — כיתות ב׳–ג׳</h1>
    <p className="mx-auto mb-4 mt-3 max-w-2xl text-center text-lg">חמש סדרות, בכל אחת שש תחנות. מדפיסים כרטיסי הוראות, דפי תשובות לקבוצות, דף מעקב לכל ילד וטבלת סבב, וכיתה שלמה עובדת בקבוצות קטנות.</p>
    <nav className="mb-2 flex flex-wrap justify-center gap-2" aria-label="סדרות התחנות">
      {SETS.map(s => <a key={s.id} href={`#${s.id}`} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold hover:bg-[var(--postit)]">{s.emoji} {s.short}</a>)}
      <a href="#setup" className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold hover:bg-[var(--postit)]">🧭 איך מפעילים</a>
      <a href="#tips" className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold hover:bg-[var(--postit)]">💡 טיפים למורה</a>
    </nav>

    <section id="setup" className="mt-8 scroll-mt-20 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="text-2xl font-black">🧭 איך מפעילים תחנות בכיתה — 7 צעדים</h2>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2">
        {SETUP_STEPS.map((s, i) => <li key={s.t} className="flex gap-3">
          <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-violet-700 font-black text-white">{i + 1}</span>
          <div><b>{s.t}.</b> {s.d}</div>
        </li>)}
      </ol>
    </section>

    {SETS.map(set => <SetSection key={set.id} set={set} seed={seedOf(set.id)}
      onNew={() => setSeeds(s => ({ ...s, [set.id]: seedOf(set.id) + 1 }))}
      onPrint={mode => setPrint({ setId: set.id, mode })} />)}

    <section id="tips" className="mt-12 scroll-mt-20">
      <h2 className="text-3xl font-black">💡 טיפים למורה</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {TEACHER_TIPS.map(g => <div key={g.title} className="rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5">
          <h3 className="text-xl font-black">{g.title}</h3>
          <ul className="mt-2 list-disc space-y-1 pr-5">{g.items.map(t => <li key={t}>{t}</li>)}</ul>
        </div>)}
      </div>
    </section>

    {active && <PrintPreview
      title={`${titles[print.mode]} · ${active.title}`}
      onClose={() => setPrint(null)}
      variant={print.mode === 'sheets' ? i => <SheetPages set={active} seed={aSeed + i * 1000} /> : undefined}>
      {print.mode === 'cards' ? <CardsPages set={active} />
        : print.mode === 'sheets' ? <SheetPages set={active} seed={aSeed} />
        : print.mode === 'tracker' ? <TrackerPage set={active} />
        : print.mode === 'rotation' ? <RotationPage set={active} />
        : <KeyPage set={active} seed={aSeed} />}
    </PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      `מרכזי למידה, או תחנות, הם דרך נוחה לעבוד בכיתה בקבוצות קטנות: כל קבוצה פותרת משימה קצרה סביב נושא אחד, ואחרי כ־8 עד 10 דקות עוברת לתחנה הבאה. בדף הזה יש ${SETS.length} סדרות מוכנות בחשבון, כל אחת עם ${SETS[0].stations.length} תחנות: חיבור וחיסור עד 100, כפל ראשון (לוח הכפל עד 5), כסף בשקלים ובאגורות, שעון בשעות ובחצאי שעות, ומדידה: קריאת סרגל, מטרים וסנטימטרים, קילוגרמים וליטרים.`,
      `לכל תחנה יש שם, מטרה, רשימת חומרים וכרטיס הוראות בכתב גדול (שני כרטיסים בדף A4), ולכל קבוצה דף תשובות עם ${SHEET_SIZE} תרגילים בכל תחנה. לכל ילד יש גם דף מעקב אישי: מסמנים איזו תחנה סיימו, צובעים פרצוף שמתאר אם היה קל או קשה, וכותבים מה למדו. התרגילים נוצרים מחדש בכל לחיצה על "תרגילים חדשים", והתשובות מחושבות מראש במפתח למורה.`,
      'טבלת הסבב מתאימה לשש קבוצות ושש תחנות, ומבטיחה שכל קבוצה מגיעה לכל תחנה ואף תחנה לא מתמלאת בשתי קבוצות. החומרים הם הצעה לעבודה בכיתה, והמורה מתאימה אותם לתוכנית ולרמה של הכיתה.',
    ]} faq={FAQ} related={[
      { label: 'חשבון לכיתה ב׳', href: '/math/grade-2' },
      { label: 'חשבון לכיתה ג׳', href: '/math/grade-3' },
      { label: 'בעיות מילוליות', href: '/math/word-problems' },
      { label: 'חוברת חשבון לכיתה ב׳', href: '/booklets/math-grade-2' },
      { label: 'איקס עיגול בחשבון', href: '/classroom/math-tic-tac-toe' },
      { label: 'דפי עבודה בשעון', href: '/printables/clock-worksheets' },
    ]} /></div>
  </div>
}
