import '../../learn/learn.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PATH, POSES, BREATHS, SCRIPTS, SESSION, WHY, SAFETY, TIPS, FAQ } from '../../data/kidsYoga'

// /classroom/kids-yoga: kids yoga and mindfulness. On-screen tools: a random-pose draw with a
// countdown, a session builder (5 poses in order) and a breathing-type picker with an animated guide.
// Nothing chosen here is stored or sent anywhere.

const SECONDS = [20, 30]

function PoseBig({ pose }) {
  return <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center">
    <p className="text-8xl" aria-hidden="true">{pose.emoji}</p>
    <h3 className="mt-2 text-3xl font-black">{pose.name}</h3>
    <p className="mx-auto mt-2 max-w-xl text-xl leading-relaxed">{pose.how}</p>
    <p className="mt-2 text-lg text-[var(--muted-foreground)]">💚 {pose.good}</p>
  </div>
}

function RandomPose() {
  const [idx, setIdx] = useState(null)
  const [secs, setSecs] = useState(30)
  const [left, setLeft] = useState(0)

  const running = idx !== null && left > 0
  useEffect(() => {
    if (!running) return undefined
    const id = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(id)
  }, [running, left])

  const draw = () => {
    let n = Math.floor(Math.random() * POSES.length)
    if (n === idx) n = (n + 1) % POSES.length
    setIdx(n); setLeft(secs)
  }
  const pose = idx === null ? null : POSES[idx]
  const done = pose && !running && left <= 0
  return <div>
    <div className="mb-3 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="משך התנוחה">
      <span className="text-lg font-bold">כמה זמן מחזיקים?</span>
      {SECONDS.map(s => <button key={s} type="button" aria-pressed={secs === s} onClick={() => setSecs(s)}
        className={`ln-btn ${secs === s ? 'go' : 'alt'}`}>{s} שניות</button>)}
    </div>
    <div className="mb-3 text-center"><button type="button" className="ln-btn go text-xl" onClick={draw}>{pose ? '🎲 תנוחה הבאה' : '🎲 מגרילים תנוחה'}</button></div>
    {pose && <div role="status" aria-live="polite">
      <PoseBig pose={pose} />
      <p className="mt-3 text-center text-4xl font-black" aria-label={done ? 'הזמן נגמר' : `נשארו ${left} שניות`}>{done ? '✅ כל הכבוד! נשימה אחת עמוקה.' : `⏱️ ${left}`}</p>
    </div>}
    {!pose && <p className="text-center text-lg text-[var(--muted-foreground)]">לוחצים, מקבלים תנוחה, ועושים אותה ביחד עם ספירה לאחור.</p>}
  </div>
}

function Builder() {
  const [picked, setPicked] = useState([])
  const [step, setStep] = useState(-1) // -1 = choosing
  const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 5 ? [...p, id] : p)
  const byId = id => POSES.find(p => p.id === id)

  if (step >= 0) {
    const pose = byId(picked[step])
    return <div role="status" aria-live="polite">
      <p className="mb-2 text-center text-lg font-bold">תנוחה {step + 1} מתוך {picked.length}</p>
      <PoseBig pose={pose} />
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button type="button" className="ln-btn alt" disabled={step === 0} onClick={() => setStep(step - 1)}>→ הקודמת</button>
        {step < picked.length - 1
          ? <button type="button" className="ln-btn go" onClick={() => setStep(step + 1)}>הבאה ←</button>
          : <button type="button" className="ln-btn go" onClick={() => setStep(-1)}>סיימנו! 🎉</button>}
        <button type="button" className="ln-btn alt" onClick={() => setStep(-1)}>חזרה לבחירה</button>
      </div>
    </div>
  }
  return <div>
    <p className="mb-3 text-lg">בוחרים חמש תנוחות לפי הסדר שבו תרצו לעשות אותן. נבחרו <b>{picked.length}</b> מתוך 5.</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="בחירת תנוחות">
      {POSES.map(p => {
        const n = picked.indexOf(p.id)
        return <button key={p.id} type="button" aria-pressed={n >= 0} onClick={() => toggle(p.id)}
          className={`relative min-h-[84px] rounded-2xl border-2 p-2 text-center ${n >= 0 ? 'border-slate-800 bg-emerald-100 ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>
          {n >= 0 && <span className="absolute right-2 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-sm font-black text-white">{n + 1}</span>}
          <span className="block text-4xl" aria-hidden="true">{p.emoji}</span>
          <span className="block text-sm font-bold">{p.name}</span>
        </button>
      })}
    </div>
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn go" disabled={picked.length === 0} onClick={() => setStep(0)}>▶ מתחילים את המסע</button>
      <button type="button" className="ln-btn alt" disabled={picked.length === 0} onClick={() => setPicked([])}>מנקים בחירה</button>
    </div>
    {picked.length > 0 && <p className="mt-3 text-center text-lg" aria-live="polite">הסדר שלי: {picked.map(id => byId(id).emoji).join(' ← ')}</p>}
  </div>
}

function BreathGuide() {
  const [id, setId] = useState('flower')
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0)
  const b = BREATHS.find(x => x.id === id)
  const cycle = b.inSec + b.outSec
  const pos = tick % cycle
  const inhale = pos < b.inSec
  const rounds = Math.floor(tick / cycle)
  const finished = rounds >= 5

  useEffect(() => {
    if (!running || finished) return undefined
    const t = setInterval(() => setTick(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [running, finished])

  const pick = x => { setId(x); setRunning(false); setTick(0) }
  const active = running && !finished
  const label = finished ? 'כל הכבוד! איך מרגיש הגוף עכשיו?' : !running ? 'בוחרים נשימה ולוחצים על התחלה' : inhale ? b.steps[0] : b.steps[1]
  return <div>
    <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="בחירת סוג נשימה">
      {BREATHS.map(x => <button key={x.id} type="button" aria-pressed={x.id === id} onClick={() => pick(x.id)}
        className={`min-h-[56px] rounded-2xl border-2 p-2 text-lg font-bold ${x.id === id ? 'border-slate-800 bg-sky-100 ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>
        <span aria-hidden="true">{x.emoji}</span> {x.name}</button>)}
    </div>
    <div className="rounded-3xl bg-sky-50 p-5 text-center">
      <div className="mx-auto my-3 flex h-56 w-56 items-center justify-center" aria-hidden="true">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-sky-300 text-6xl shadow-lg motion-reduce:transition-none"
          style={{ transform: active && inhale ? 'scale(1.4)' : 'scale(0.8)', transition: `transform ${inhale ? b.inSec : b.outSec}s ease-in-out` }}>{b.emoji}</div>
      </div>
      <p className="text-xl font-bold" role="status" aria-live="polite">{label}</p>
      {active && <p className="mt-1 text-[var(--muted-foreground)]">סבב {rounds + 1} מתוך 5 · {inhale ? 'שאיפה' : 'נשיפה'}</p>}
      <p className="mt-2 text-[var(--muted-foreground)]">💡 {b.tip}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {!active ? <button type="button" className="ln-btn go" onClick={() => { setTick(0); setRunning(true) }}>{finished ? 'עוד פעם' : 'מתחילים'}</button>
          : <button type="button" className="ln-btn alt" onClick={() => { setRunning(false); setTick(0) }}>עוצרים</button>}
      </div>
    </div>
    <p className="mt-3 text-lg">רוצים כלי נוסף להרגעה? ב<Link to="/classroom/feelings-corner" className="font-bold underline">פינת הרגשות</Link> יש נשימת 4־4 וכרטיסי הרגעה, ובמשחקי <Link to="/games/calm" className="font-bold underline">רגיעה</Link> אפשר להמשיך לשחק בשקט.</p>
  </div>
}

// ---- printable sheets ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const smallh = { width: '100%', margin: '2mm 0 1mm', fontSize: 15 }
const line = { borderBottom: '1px solid #999', height: 20, width: '100%' }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>

function CardsPage({ list, n }) {
  return <article className="buga-a4" style={page}>
    <h2>🧘 כרטיסי תנוחות · עמוד {n}</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px' }}>גוזרים לאורך הקו המקווקו ומצפים בלמינציה</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 6 }}>
      {list.map(p => <div key={p.id} style={{ border: '2px dashed #555', borderRadius: 12, padding: 6, textAlign: 'center', background: '#ecfccb', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 38 }}>{p.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 900 }}>{p.name}</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.3, marginTop: 2 }}>{p.how}</div>
        <div style={{ fontSize: 11, marginTop: 2, fontWeight: 700 }}>💚 {p.good}</div>
      </div>)}
    </div>
    {foot('כרטיסי יוגה')}
  </article>
}

function CardsSheet() {
  return <>
    <CardsPage list={POSES.slice(0, 8)} n={1} />
    <CardsPage list={POSES.slice(8, 16)} n={2} />
  </>
}

function PlanSheet() {
  return <article className="buga-a4" style={page}>
    <h2>📋 תוכנית סשן יוגה של 10 דקות</h2>
    <p style={{ fontSize: 14, margin: '0 0 4px', width: '100%' }}>קבוצה: ______________ · תאריך: ____________</p>
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
      {SESSION.map(s => <div key={s.title} style={{ display: 'flex', gap: 8, border: '1.5px solid #555', borderRadius: 10, padding: 5, alignItems: 'center' }}>
        <b style={{ width: 52, textAlign: 'center', background: '#fef3c7', borderRadius: 8, padding: '4px 0', fontSize: 13 }}>{s.min}</b>
        <span style={{ flex: 1, fontSize: 13 }}><b>{s.title}</b> · {s.what}</span>
      </div>)}
    </div>
    <h3 style={smallh}>התנוחות שבחרנו (מקיפים או כותבים)</h3>
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px 8px', fontSize: 13 }}>
      {POSES.map(p => <span key={p.id}>☐ {p.emoji} {p.name.replace('תנוחת ', '')}</span>)}
    </div>
    <h3 style={smallh}>הנשימה שבחרנו: ☐ פרח ונר ☐ דבורה ☐ נחש ☐ בלון ☐ דרקון ☐ כוכב</h3>
    <h3 style={smallh}>איך היה? מה עבד, מה לשנות בפעם הבאה:</h3>
    <div style={line} /><div style={line} /><div style={line} />
    <p style={{ fontSize: 12, margin: '4px 0 0', textAlign: 'center' }}>כל תנוחה היא הצעה. מי שלא רוצה, צופה. אין תחרות.</p>
    {foot('תוכנית סשן')}
  </article>
}

function MindfulSheet() {
  const box = { flex: 1, border: '2px solid #555', borderRadius: 14, padding: 8, display: 'flex', flexDirection: 'column', minHeight: 0 }
  return <article className="buga-a4" style={page}>
    <h2>🌿 מה אני שומע/ת, רואה ומרגיש/ה?</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px', width: '100%' }}>שם: ______________ · עוצרים רגע, נושמים, ואז מציירים או כותבים.</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '3mm' }}>
      <div style={{ ...box, background: '#e0f2fe' }}><b style={{ fontSize: 20 }}>👂 מה אני שומע/ת?</b><span style={{ fontSize: 12, color: '#555' }}>ציור או מילים</span></div>
      <div style={{ ...box, background: '#fef9c3' }}><b style={{ fontSize: 20 }}>👀 מה אני רואה?</b><span style={{ fontSize: 12, color: '#555' }}>ציור או מילים</span></div>
      <div style={{ ...box, background: '#fce7f3' }}><b style={{ fontSize: 20 }}>🫶 מה אני מרגיש/ה בגוף ובלב?</b><span style={{ fontSize: 12, color: '#555' }}>מצבעים על הגוף או כותבים מילה</span></div>
    </div>
    <p style={{ fontSize: 13, margin: '4px 0 0', textAlign: 'center' }}>הדף שלי. אין תשובות נכונות או לא נכונות.</p>
    {foot('מיינדפולנס לילדים')}
  </article>
}

const SHEETS = [
  { id: 'cards', emoji: '🧘', label: 'כרטיסי תנוחות (2 עמודים, 16 כרטיסים)', C: CardsSheet },
  { id: 'plan', emoji: '📋', label: 'תוכנית סשן של 10 דקות', C: PlanSheet },
  { id: 'mind', emoji: '🌿', label: 'מה אני שומע, רואה ומרגיש', C: MindfulSheet },
]

export default function KidsYoga() {
  const [print, setPrint] = useState(null)
  const [script, setScript] = useState(SCRIPTS[0].id)
  const sheet = SHEETS.find(s => s.id === print)
  const sc = SCRIPTS.find(s => s.id === script)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="יוגה ומיינדפולנס לילדים: תנוחות, נשימות ומשחקי הרגעה"
      description="יוגה ומיינדפולנס לילדים בגן ובכיתה: 16 תנוחות חיות, נשימות, תרגילי דמיון מודרך, הגרלת תנוחה עם שעון וכרטיסים להדפסה. בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'יוגה ומיינדפולנס לילדים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🧘 יוגה ומיינדפולנס לילדים: תנוחות, נשימות ומשחקי הרגעה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מדריך מעשי להורים, לגננות ולמורים: איך מובילים סשן של עשר דקות, 16 תנוחות של חיות וטבע, נשימות משחקיות ותרגילי הקשבה. עם הגרלת תנוחות על המסך, בונה סשן ודפים להדפסה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['why', 'למה זה עוזר'], ['random', 'יוגה בהגרלה'], ['build', 'בונים סשן'], ['breath', 'נשימות'], ['poses', 'התנוחות'], ['mind', 'מיינדפולנס'], ['session', 'סשן של 10 דקות'], ['print', 'להדפסה'], ['safety', 'בטיחות']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="why" className="mb-8 scroll-mt-24" aria-labelledby="why-h">
      <h2 id="why-h" className="mb-3 text-3xl font-black">🌱 למה יוגה ומיינדפולנס טובים לילדים</h2>
      <p className="mb-4 text-lg leading-relaxed">ילדים צריכים לזוז, ולפעמים גם לעצור. יוגה משחקית ומיינדפולנס (תשומת לב נינוחה לרגע הזה) נותנים להם שניהם: תנועה שמרגיעה, נשימה שאפשר לקחת לכל מקום, ושפה לדבר על מה שהגוף מרגיש. זה לא טיפול ולא תחליף לאיש מקצוע, אבל זה כלי חינוכי נעים ופשוט.</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{WHY.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>
    </section>

    <section id="random" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-lime-50 p-5" aria-labelledby="random-h">
      <h2 id="random-h" className="mb-3 text-3xl font-black">🎲 יוגה בהגרלה</h2>
      <RandomPose />
    </section>

    <section id="build" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5" aria-labelledby="build-h">
      <h2 id="build-h" className="mb-3 text-3xl font-black">🗺️ בונים סשן משלנו</h2>
      <Builder />
    </section>

    <section id="breath" className="mb-8 scroll-mt-24" aria-labelledby="breath-h">
      <h2 id="breath-h" className="mb-3 text-3xl font-black">🫧 נשימות משחקיות</h2>
      <p className="mb-4 text-lg leading-relaxed">נשימה איטית עם נשיפה ארוכה משחררת את הגוף. כל נשימה כאן מגיעה עם דימוי שילדים אוהבים. אפשר לנסות כל אחת עם עיגול מונפש שמראה מתי שואפים ומתי נושפים.</p>
      <BreathGuide />
    </section>

    <section id="poses" className="mb-8 scroll-mt-24" aria-labelledby="poses-h">
      <h2 id="poses-h" className="mb-3 text-3xl font-black">🐾 16 תנוחות של חיות וטבע</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{POSES.map(p => <li key={p.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-4xl" aria-hidden="true">{p.emoji}</p><p className="text-lg font-black">{p.name}</p>
        <p className="mt-1 text-[15px] leading-relaxed">{p.how}</p><p className="mt-1 text-[15px] font-bold">💚 {p.good}</p></li>)}
      </ul>
    </section>

    <section id="mind" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-violet-50 p-5" aria-labelledby="mind-h">
      <h2 id="mind-h" className="mb-3 text-3xl font-black">🌙 מיינדפולנס: שלושה תרגילים להקראה</h2>
      <p className="mb-3 text-lg leading-relaxed">המבוגר מקריא לאט בקול רגוע, עם הפסקה קצרה אחרי כל משפט. מי שלא רוצה לעצום עיניים מביט לנקודה על הרצפה.</p>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="בחירת תרגיל">
        {SCRIPTS.map(s => <button key={s.id} type="button" aria-pressed={s.id === script} onClick={() => setScript(s.id)} className={`ln-btn ${s.id === script ? 'go' : 'alt'}`}><span aria-hidden="true">{s.emoji}</span> {s.title}</button>)}
      </div>
      <div className="rounded-2xl bg-white p-5" aria-live="polite">
        <h3 className="text-2xl font-black"><span aria-hidden="true">{sc.emoji}</span> {sc.title} · {sc.time}</h3>
        <p className="mt-1 text-[var(--muted-foreground)]">{sc.intro}</p>
        <ol className="mt-3 list-decimal space-y-2 pr-6 text-lg leading-relaxed">{sc.lines.map(l => <li key={l}>{l}</li>)}</ol>
      </div>
    </section>

    <section id="session" className="mb-8 scroll-mt-24" aria-labelledby="session-h">
      <h2 id="session-h" className="mb-3 text-3xl font-black">⏱️ סשן של עשר דקות בגן או בכיתה</h2>
      <ol className="space-y-3">{SESSION.map((s, i) => <li key={s.title} className="flex gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-300 text-lg font-black">{i + 1}</span>
        <span><b>{s.title}</b> <span className="text-[var(--muted-foreground)]">({s.min})</span><br />{s.what}</span></li>)}
      </ol>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
          <h3 className="text-2xl font-black">💡 טיפים להנחיה</h3>
          <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{TIPS.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
        <div id="safety" className="scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-rose-50 p-5">
          <h3 className="text-2xl font-black">🛡️ בטיחות ורגישות</h3>
          <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{SAFETY.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-lg leading-relaxed">⚠️ הדף הוא כלי חינוכי כללי ואינו מחליף ייעוץ רפואי או טיפולי. אם ילד מתקשה מאוד, סובל מכאבים או מחרדה, פנו לרופא/ת הילדים, ליועצת או לפסיכולוג/ית.</p>
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <p className="mb-4 text-lg leading-relaxed">כרטיסי תנוחות (שמונה בעמוד), תוכנית סשן ודף מיינדפולנס לציור וכתיבה. את הכרטיסים כדאי לצפות בלמינציה.</p>
      <div className="grid gap-3 sm:grid-cols-2">{SHEETS.map(s => <button key={s.id} type="button" onClick={() => setPrint(s.id)}
        className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{s.emoji}</span> {s.label} · הדפסה ←</button>)}
      </div>
    </section>

    {sheet && <PrintPreview title={`יוגה לילדים — ${sheet.label}`} onClose={() => setPrint(null)}><sheet.C /></PrintPreview>}

    <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח. הבחירות נשארות רק על המסך שלכם.</p>
    <p className="mt-6 text-center text-lg">עוד לכיתה: <Link className="font-bold underline" to="/classroom/feelings-corner">פינת רגשות</Link> · <Link className="font-bold underline" to="/games/calm">משחקי רגיעה</Link> · <Link className="font-bold underline" to="/classroom">כל הכלים למורה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'יוגה לילדים שונה מיוגה למבוגרים: היא משחק. במקום להחזיק תנוחה מושלמת, ילדים הופכים לחתול, לנחש או לעץ, ובדרך מתרגלים שיווי משקל, גמישות ורוגע. תנועה משחקית מתאימה לגן ולכיתה כי היא קצרה, חווייתית ומשתפת את כולם, בלי תחרות.',
      'בדף הזה יש עשר דקות מוכנות להנחיה: 16 תנוחות עם הסבר פשוט, שש נשימות כמו פרח ונר ודבורה, שלושה תרגילי מיינדפולנס להקראה (סריקת גוף, הקשבה לצלילים ומקום בטוח), הגרלת תנוחות עם שעון, בונה סשן ושלושה דפי הדפסה. שום מידע לא נשמר ולא נשלח.',
    ]} faq={FAQ} related={[{ label: 'פינת רגשות ופינת שקט', href: '/classroom/feelings-corner' }, { label: 'משחקי רגיעה', href: '/games/calm' }, { label: 'לכיתה: כל הכלים למורה', href: '/classroom' }]} /></div>
  </div>
}
