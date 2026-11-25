import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import {
  PATH, MOVES, FOCUS_MINUTES, BREAK_MINUTES, SIGNS, DIAGNOSIS, HOME_TIPS, CLASS_TIPS,
  HOMEWORK, CONSULT, FAQ, CHECKLIST, DAYS,
} from '../../data/adhdKids'

// /guides/adhd-kids: a plain-language guide about attention and focus, an on-screen focus timer,
// a task breaker for parents and printables. Nothing typed or chosen here is stored or sent anywhere.

const pad = n => String(n).padStart(2, '0')
const fmt = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`

function FocusTimer() {
  const [work, setWork] = useState(10)
  const [brk, setBrk] = useState(2)
  const [phase, setPhase] = useState('idle') // idle | work | break | done
  const [left, setLeft] = useState(0)
  const [move, setMove] = useState(null)
  const [total, setTotal] = useState(1)

  // One-second timeout per tick; when a block ends, move to the next phase.
  useEffect(() => {
    if (phase !== 'work' && phase !== 'break') return undefined
    const id = setTimeout(() => {
      if (left > 1) { setLeft(left - 1); return }
      if (phase === 'work') {
        setMove(MOVES[Math.floor(Math.random() * MOVES.length)])
        setTotal(brk * 60)
        setLeft(brk * 60)
        setPhase('break')
      } else {
        setLeft(0)
        setPhase('done')
      }
    }, 1000)
    return () => clearTimeout(id)
  }, [phase, left, brk])

  const start = () => { setTotal(work * 60); setLeft(work * 60); setPhase('work') }
  const stop = () => { setPhase('idle'); setLeft(0) }
  const running = phase === 'work' || phase === 'break'
  const pct = running ? Math.max(0, Math.min(1, left / total)) : 1
  const R = 90
  const C = 2 * Math.PI * R
  const color = phase === 'break' ? '#10b981' : '#3b82f6'
  const label = phase === 'idle' ? 'מוכנים? בוחרים זמן ולוחצים התחלה.'
    : phase === 'work' ? 'עובדים! רק על משימה אחת.'
      : phase === 'break' ? 'הפסקת תנועה! קמים ועושים:'
        : 'כל הכבוד! סיימתם סבב ריכוז.'

  return <div className="rounded-3xl bg-sky-50 p-5 text-center">
    <div className="grid gap-4 sm:grid-cols-2">
      <div role="group" aria-label="זמן עבודה בדקות">
        <p className="mb-2 text-lg font-bold">⏱️ כמה זמן עובדים?</p>
        <div className="flex justify-center gap-2">{FOCUS_MINUTES.map(m => <button key={m} type="button" disabled={running} aria-pressed={work === m}
          onClick={() => setWork(m)} className={`min-h-[48px] min-w-[72px] rounded-2xl border-2 px-3 text-xl font-black ${work === m ? 'border-slate-800 bg-white ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>{m} דק׳</button>)}</div>
      </div>
      <div role="group" aria-label="זמן הפסקה בדקות">
        <p className="mb-2 text-lg font-bold">🤸 כמה זמן הפסקה?</p>
        <div className="flex justify-center gap-2">{BREAK_MINUTES.map(m => <button key={m} type="button" disabled={running} aria-pressed={brk === m}
          onClick={() => setBrk(m)} className={`min-h-[48px] min-w-[72px] rounded-2xl border-2 px-3 text-xl font-black ${brk === m ? 'border-slate-800 bg-white ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>{m} דק׳</button>)}</div>
      </div>
    </div>
    <div className="relative mx-auto my-4 h-60 w-60" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={R} fill="none" stroke="#dbeafe" strokeWidth="14" />
        <circle cx="100" cy="100" r={R} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)} className="motion-reduce:transition-none" style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black tabular-nums" dir="ltr">{running ? fmt(Math.max(0, left)) : phase === 'done' ? '🎉' : fmt(work * 60)}</span>
        <span className="text-lg font-bold">{phase === 'break' ? 'הפסקה' : phase === 'work' ? 'עבודה' : ''}</span>
      </div>
    </div>
    <p className="text-xl font-bold" role="status" aria-live="polite">{label}</p>
    {phase === 'break' && move && <p className="mx-auto mt-2 max-w-md rounded-2xl bg-white p-4 text-2xl font-black"><span aria-hidden="true">{move[0]}</span> {move[1]}</p>}
    <p className="sr-only" aria-live="polite">{running ? `נשארו ${Math.floor(left / 60)} דקות` : ''}</p>
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {running
        ? <button type="button" className="ln-btn alt" onClick={stop}>עוצרים</button>
        : <button type="button" className="ln-btn go" onClick={start}>{phase === 'done' ? 'עוד סבב' : 'התחלה'}</button>}
    </div>
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח.</p>
  </div>
}

// Split a typed task into at most six small steps (one per line, comma or semicolon).
const splitSteps = text => text.split(/[\n;,]+/).map(s => s.trim()).filter(Boolean).slice(0, 6)

const SAMPLE = 'מכינים מחברת ועיפרון\nקוראים את ההוראה בקול\nעושים תרגיל אחד\nבודקים את התרגיל\nממשיכים לתרגיל הבא\nמחזירים הכול לתיק'

function TaskBreaker() {
  const [task, setTask] = useState('')
  const [text, setText] = useState('')
  const [steps, setSteps] = useState([])
  const [done, setDone] = useState([])
  const count = splitSteps(text).length
  const all = steps.length > 0 && done.length === steps.length

  const build = () => { setSteps(splitSteps(text)); setDone([]) }
  const toggle = i => setDone(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i])

  return <div className="rounded-3xl bg-amber-50 p-5">
    {steps.length === 0 ? <div>
      <label htmlFor="tb-task" className="block text-lg font-bold">📌 המשימה הגדולה</label>
      <input id="tb-task" type="text" value={task} onChange={e => setTask(e.target.value)} maxLength={80} placeholder="למשל: שיעורי חשבון"
        className="mt-1 w-full rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-lg" />
      <label htmlFor="tb-steps" className="mt-3 block text-lg font-bold">🪜 מפרקים לצעדים קטנים (עד 6, כל שורה צעד)</label>
      <textarea id="tb-steps" rows={6} value={text} onChange={e => setText(e.target.value)} placeholder={'צעד ראשון\nצעד שני\n...'}
        className="mt-1 w-full rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-lg" />
      <p className="mt-1 text-sm text-[var(--muted-foreground)]" aria-live="polite">{count > 0 ? `${count} צעדים${text.split(/[\n;,]+/).filter(s => s.trim()).length > 6 ? ' (נשארו 6 הראשונים)' : ''}` : 'אפשר גם להפריד בפסיקים.'}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="ln-btn go" disabled={count === 0} onClick={build}>יוצרים רשימה לילד</button>
        <button type="button" className="ln-btn alt" onClick={() => setText(SAMPLE)}>דוגמה לצעדים</button>
      </div>
    </div> : <div>
      <h3 className="text-2xl font-black">{task.trim() || 'המשימה שלי'}</h3>
      <p className="mt-1 text-lg">מסמנים V אחרי כל צעד קטן.</p>
      <ul className="mt-3 space-y-2">{steps.map((s, i) => <li key={`${i}-${s}`}>
        <button type="button" aria-pressed={done.includes(i)} onClick={() => toggle(i)}
          className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl border-2 p-3 text-right text-xl font-bold ${done.includes(i) ? 'border-emerald-500 bg-emerald-100 line-through' : 'border-[var(--border)] bg-white'}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-2xl" aria-hidden="true">{done.includes(i) ? '✅' : i + 1}</span>
          <span>{s}</span>
        </button>
      </li>)}</ul>
      <div className="mt-3 h-4 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done.length} aria-label="התקדמות">
        <div className="h-full bg-emerald-500 motion-reduce:transition-none" style={{ width: `${(done.length / steps.length) * 100}%`, transition: 'width .3s' }} />
      </div>
      <p className="mt-2 text-xl font-bold" role="status" aria-live="polite">{all ? '🎉 כל הכבוד! סיימת את כל הצעדים.' : `${done.length} מתוך ${steps.length} צעדים`}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="ln-btn alt" onClick={() => setDone([])}>מתחילים מחדש</button>
        <button type="button" className="ln-btn alt" onClick={() => { setSteps([]); setDone([]) }}>עורכים את הצעדים</button>
      </div>
    </div>}
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 מה שנכתב כאן נשאר רק על המסך שלכם ולא נשמר ולא נשלח.</p>
  </div>
}

// ---- printable sheets (A4 pages inside PrintPreview) ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const smallh = { width: '100%', margin: '2mm 0 1mm', fontSize: 15 }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>
const box = { width: 20, height: 20, border: '2px solid #333', borderRadius: 5, display: 'inline-block' }

function ChecklistSheet() {
  return <article className="buga-a4" style={page}>
    <h2>✅ המשימות שלי להיום</h2>
    <p style={{ fontSize: 14, margin: '0 0 4px', width: '100%' }}>שם: ______________ · תאריך: ____________</p>
    <p style={{ fontSize: 13, margin: '0 0 6px', width: '100%' }}>עושים משימה אחת בכל פעם, ומסמנים V כשמסיימים.</p>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '2mm', minHeight: 0 }}>
      {CHECKLIST.map(([e, t]) => <div key={t} style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', gap: 12, border: '2px solid #555', borderRadius: 14, padding: '0 14px', background: '#fffbeb' }}>
        <span style={{ ...box, width: 30, height: 30 }} />
        <span style={{ fontSize: 32 }}>{e}</span>
        <span style={{ fontSize: 22, fontWeight: 800 }}>{t}</span>
      </div>)}
    </div>
    <p style={{ fontSize: 13, margin: '4px 0 0', textAlign: 'center' }}>כל הכבוד על כל צעד קטן! ⭐</p>
    {foot('רשימת משימות יומית')}
  </article>
}

function FocusPlanSheet() {
  const row = { display: 'flex', alignItems: 'center', gap: 8, margin: '3px 0', fontSize: 16 }
  const card = { border: '3px dashed #555', borderRadius: 18, padding: 14, width: '100%', background: '#eff6ff' }
  return <article className="buga-a4" style={page}>
    <h2>🎯 תוכנית הריכוז שלי</h2>
    <p style={{ fontSize: 13, margin: '0 0 6px' }}>גוזרים לאורך הקו המקווקו ומניחים על השולחן</p>
    <div style={card}>
      <p style={{ fontSize: 15, margin: 0 }}>שם: ______________________</p>
      <h3 style={{ ...smallh, fontSize: 20 }}>⏱️ כמה זמן אני עובד/ת? מקיפים</h3>
      <div style={{ display: 'flex', gap: 10 }}>{FOCUS_MINUTES.map(m => <span key={m} style={{ flex: 1, textAlign: 'center', border: '2px solid #333', borderRadius: 12, padding: '6px 0', fontSize: 22, fontWeight: 900, background: '#fff' }}>{m} דקות</span>)}</div>
      <h3 style={{ ...smallh, fontSize: 20 }}>🤸 בהפסקה אני...</h3>
      {MOVES.slice(0, 5).map(([e, t]) => <div key={t} style={row}><span style={box} /><span style={{ fontSize: 22 }}>{e}</span><span>{t}</span></div>)}
      <h3 style={{ ...smallh, fontSize: 20 }}>🧠 כשאני מתקשה להתרכז, אני...</h3>
      {['נושם/ת עמוק שלוש פעמים', 'מסתכל/ת על המשימה הקטנה הבאה בלבד', 'מבקש/ת עזרה בלי להתבייש', 'שותה/ת מים'].map(t => <div key={t} style={row}><span style={box} /><span>{t}</span></div>)}
      <h3 style={{ ...smallh, fontSize: 20 }}>⭐ המשימה שלי עכשיו:</h3>
      <div style={{ borderBottom: '1px solid #666', height: 26 }} />
      <p style={{ fontSize: 14, margin: '10px 0 0', textAlign: 'center', fontWeight: 800 }}>צעד אחד קטן בכל פעם. אני יכול/ה!</p>
    </div>
    <div style={{ ...card, marginTop: 10, background: '#f0fdf4' }}>
      <h3 style={{ ...smallh, fontSize: 18, margin: 0 }}>💬 משפטים שעוזרים לי (למבוגר ולילד)</h3>
      <p style={{ fontSize: 14, margin: '4px 0' }}>״בוא נעשה צעד אחד.״ · ״מה המשימה הקטנה עכשיו?״ · ״אפשר לקחת הפסקה.״ · ״ראיתי שניסית, כל הכבוד.״</p>
    </div>
    {foot('כרטיס שולחן: תוכנית ריכוז')}
  </article>
}

function PlannerSheet() {
  const th = { border: '1.5px solid #555', background: '#fef3c7', fontSize: 14, padding: 3 }
  const td = { border: '1.5px solid #555', height: '15mm', verticalAlign: 'top', fontSize: 10, padding: 2 }
  return <article className="buga-a4" style={page}>
    <h2>📅 מתכנן שיעורי בית שבועי</h2>
    <p style={{ fontSize: 14, margin: '0 0 4px', width: '100%' }}>שם: ______________ · השבוע של: ____________</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead><tr><th style={{ ...th, width: '16%' }}>מקצוע</th>{DAYS.map(d => <th key={d} style={th}>{d}</th>)}</tr></thead>
      <tbody>{[0, 1, 2, 3, 4, 5].map(r => <tr key={r}>
        <td style={{ ...td, background: '#f8fafc' }}>__________</td>{DAYS.map(d => <td key={d} style={td}><span style={{ ...box, width: 14, height: 14 }} /></td>)}
      </tr>)}</tbody>
    </table>
    <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8 }}>
      <div style={{ flex: 1, border: '2px solid #555', borderRadius: 12, padding: 8, fontSize: 14 }}><b>📌 מה חשוב לזכור השבוע?</b><div style={{ borderBottom: '1px solid #999', height: 24 }} /><div style={{ borderBottom: '1px solid #999', height: 24 }} /><div style={{ borderBottom: '1px solid #999', height: 24 }} /></div>
      <div style={{ flex: 1, border: '2px solid #555', borderRadius: 12, padding: 8, fontSize: 14 }}><b>⭐ מה הצלחתי השבוע?</b><div style={{ borderBottom: '1px solid #999', height: 24 }} /><div style={{ borderBottom: '1px solid #999', height: 24 }} /><div style={{ borderBottom: '1px solid #999', height: 24 }} /></div>
    </div>
    <p style={{ fontSize: 13, margin: '6px 0 0' }}>כל יום: טיימר, משימה קטנה, V וגם הפסקה. 🕒</p>
    {foot('מתכנן שיעורי בית')}
  </article>
}

const SHEETS = [
  { id: 'checklist', emoji: '✅', label: 'רשימת משימות יומית עם איורים', C: ChecklistSheet },
  { id: 'plan', emoji: '🎯', label: 'תוכנית הריכוז שלי: כרטיס לשולחן', C: FocusPlanSheet },
  { id: 'planner', emoji: '📅', label: 'מתכנן שיעורי בית שבועי', C: PlannerSheet },
]

export default function AdhdKids() {
  const [print, setPrint] = useState(null)
  const sheet = SHEETS.find(s => s.id === print)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="קשב וריכוז אצל ילדים: מדריך להורים ולמורים"
      description="קשב וריכוז אצל ילדים: מה זה, סימנים לפי גיל, איך מתנהל אבחון בישראל, טיפים לבית ולכיתה, טיימר ריכוז, מפרק משימות ודפי הדפסה בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מדריכים', href: '/guides' }, { label: 'קשב וריכוז אצל ילדים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🎯 קשב וריכוז אצל ילדים: מדריך להורים ולמורים</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מה זה קשב וריכוז במילים פשוטות, סימנים לפי גיל, איך נראה אבחון בישראל ומה אפשר לעשות כבר היום בבית ובכיתה. עם טיימר ריכוז, מפרק משימות לילד ודפים להדפסה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['what', 'מה זה'], ['signs', 'סימנים לפי גיל'], ['diagnosis', 'אבחון בישראל'], ['timer', 'טיימר ריכוז'], ['breaker', 'מפרק משימות'], ['tips', 'טיפים'], ['homework', 'שיעורי בית'], ['print', 'דפים להדפסה']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="what" className="mb-8 scroll-mt-24" aria-labelledby="what-h">
      <h2 id="what-h" className="mb-3 text-3xl font-black">🧠 מה זה קשב וריכוז? במילים פשוטות</h2>
      <p className="mb-3 text-lg leading-relaxed">הפרעת קשב, שמכונה גם ADHD, היא דרך שונה שבה המוח מנהל קשב, פעילות ודחפים. זה לא עניין של אינטליגנציה, של חינוך או של ״לא רוצה״. ילד עם קשיי קשב יכול להיות סקרן, יצירתי ומצחיק, ובו בזמן להתקשות להתחיל משימה, להישאר בה עד הסוף, לחכות לתורו או לזכור איפה שם את הדברים.</p>
      <p className="mb-3 text-lg leading-relaxed">יש ילדים שנראים ״בתנועה כל הזמן״, ויש ילדים שדווקא שקטים ונראים כמו ״חולמים״. שני המצבים יכולים להיות קשורים לקשב, ולכן לא תמיד קל לזהות אותם מבחוץ.</p>
      <p className="rounded-2xl bg-amber-50 p-4 text-lg leading-relaxed">⚠️ <b>מדריך כללי, לא אבחון.</b> לא ניתן לדעת מדף באינטרנט אם לילד יש הפרעת קשב. הרבה סימנים הם גם חלק מההתפתחות הרגילה, או נובעים מעייפות, חרדה, קשיי למידה או שעמום. רק איש מקצוע מוסמך יכול להעריך זאת.</p>
    </section>

    <section id="signs" className="mb-8 scroll-mt-24" aria-labelledby="signs-h">
      <h2 id="signs-h" className="mb-3 text-3xl font-black">👀 סימנים שאפשר לשים לב אליהם לפי גיל</h2>
      <p className="mb-4 text-lg leading-relaxed">אלה דוגמאות לדברים שהורים ומורים מתארים. אם כמה מהם חוזרים לאורך זמן, בכמה מקומות, ופוגעים בלמידה או בחיי הילד, כדאי להתייעץ.</p>
      <div className="grid gap-4 md:grid-cols-3">{SIGNS.map(s => <div key={s.age} className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black"><span aria-hidden="true">{s.emoji}</span> {s.age}</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{s.items.map(t => <li key={t}>{t}</li>)}</ul>
      </div>)}</div>
    </section>

    <section id="diagnosis" className="mb-8 scroll-mt-24" aria-labelledby="diagnosis-h">
      <h2 id="diagnosis-h" className="mb-3 text-3xl font-black">🩺 איך מתנהל אבחון בישראל: תמונה כללית</h2>
      <p className="mb-4 text-lg leading-relaxed">המסלול משתנה לפי קופת החולים, האזור והמסגרת החינוכית, אבל בדרך כלל כולל כמה גורמים שמשלימים זה את זה:</p>
      <ol className="grid gap-3 sm:grid-cols-2">{DIAGNOSIS.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ol>
      <p className="mt-4 text-lg leading-relaxed">כדאי לברר מראש מה מכוסה בקופת החולים ובשירות הפסיכולוגי החינוכי של הרשות. ליווי של היועצת בבית הספר יכול לעזור מאוד בניווט בתהליך.</p>
      <div className="mt-4 rounded-3xl border-2 border-[var(--border)] bg-rose-50 p-5">
        <h3 className="text-2xl font-black">🤝 מתי כדאי לפנות לעזרה מקצועית</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 text-lg leading-relaxed">{CONSULT.map(c => <li key={c}>{c}</li>)}</ul>
        <p className="mt-3 leading-relaxed">אם יש חשש לסכנה מיידית, פנו מיד לגורם מוסמך, למשל מד״א 101.</p>
      </div>
    </section>

    <section id="timer" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="timer-h">
      <h2 id="timer-h" className="mb-3 text-3xl font-black">⏱️ טיימר ריכוז לילדים</h2>
      <p className="mb-3 text-lg leading-relaxed">בוחרים כמה דקות עובדים וכמה דקות הפסקה. בסוף העבודה הטיימר מציע תנועה קצרה, אחר כך חוזרים לעבוד. כדאי להתחיל בזמן קצר שמצליחים בו.</p>
      <FocusTimer />
    </section>

    <section id="breaker" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-white p-5" aria-labelledby="breaker-h">
      <h2 id="breaker-h" className="mb-3 text-3xl font-black">🪜 מפרק משימות: מהר גדול לצעדים קטנים</h2>
      <p className="mb-3 text-lg leading-relaxed">משימה גדולה יכולה להרגיש בלתי אפשרית. הורה כותב את המשימה ומפרק אותה לעד שישה צעדים, והילד מסמן V על המסך אחרי כל צעד.</p>
      <TaskBreaker />
    </section>

    <section id="tips" className="mb-8 grid scroll-mt-24 gap-4 md:grid-cols-2" aria-labelledby="tips-h">
      <h2 id="tips-h" className="sr-only">טיפים לבית ולכיתה</h2>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">🏠 טיפים להורים: בבית</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{HOME_TIPS.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">🍎 טיפים למורים: בכיתה</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{CLASS_TIPS.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>

    <section id="homework" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5" aria-labelledby="homework-h">
      <h2 id="homework-h" className="mb-3 text-3xl font-black">📚 שגרת שיעורי בית שעובדת</h2>
      <ol className="space-y-3">{HOMEWORK.map(([n, t, d]) => <li key={n} className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-300 text-lg font-black">{n}</span>
        <span className="text-lg leading-relaxed"><b>{t}</b><br />{d}</span></li>)}
      </ol>
      <p className="mt-4 text-lg leading-relaxed">אם שיעורי הבית הם מאבק יומי, כדאי לדבר עם המורה על הקטנת הכמות או על התאמת המטלות. לגבי מבחנים והתאמות, ראו את <Link to="/learn/adapted-tests" className="font-bold underline">מבחנים מותאמים לילדים</Link>.</p>
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <p className="mb-4 text-lg leading-relaxed">שלושה דפי A4: רשימת משימות עם איורים, כרטיס תוכנית ריכוז לשולחן ומתכנן שיעורי בית שבועי. אפשר לצפות בלמינציה ולסמן במחק.</p>
      <div className="grid gap-3 sm:grid-cols-2">{SHEETS.map(s => <button key={s.id} type="button" onClick={() => setPrint(s.id)}
        className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{s.emoji}</span> {s.label} · הדפסה ←</button>)}
      </div>
    </section>

    {sheet && <PrintPreview title={`קשב וריכוז — ${sheet.label}`} onClose={() => setPrint(null)}><sheet.C /></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד באתר: <Link className="font-bold underline" to="/guides/dyslexia-kids">דיסלקציה אצל ילדים</Link> · <Link className="font-bold underline" to="/learn/adapted-tests">מבחנים מותאמים</Link> · <Link className="font-bold underline" to="/printables/routine-chart">לוח שגרה</Link> · <Link className="font-bold underline" to="/classroom/feelings-corner">פינת רגשות</Link> · <Link className="font-bold underline" to="/guides">כל המדריכים</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'קשב וריכוז הוא אחד הנושאים שהורים ומורים שואלים עליו הכי הרבה. המדריך הזה מסביר במילים פשוטות מה זו הפרעת קשב, אילו סימנים מתוארים בגילים שונים, ואיך נראה בגדול מסלול של הערכה בישראל, בלי להבטיח אבחון ובלי להחליף איש מקצוע.',
      'הדף כולל כלים פרקטיים: טיימר ריכוז עם הפסקות תנועה מתחלפות, מפרק משימות שהופך משימה גדולה לצעדים שהילד מסמן בעצמו, ושלושה דפי הדפסה: רשימת משימות יומית עם איורים, כרטיס תוכנית ריכוז לשולחן ומתכנן שיעורי בית שבועי. שום דבר שמוקלד כאן לא נשמר ולא נשלח.',
    ]} faq={FAQ} related={[{ label: 'דיסלקציה אצל ילדים', href: '/guides/dyslexia-kids' }, { label: 'מבחנים מותאמים', href: '/learn/adapted-tests' }, { label: 'לוח שגרה להדפסה', href: '/printables/routine-chart' }, { label: 'פינת רגשות', href: '/classroom/feelings-corner' }]} /></div>
  </div>
}
