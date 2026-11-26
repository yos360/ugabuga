import '../../learn/learn.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import {
  PATH, FEELINGS, STRATEGIES, SETUP_ITEMS, RULES, CHILD_STEPS, THERMO, DAYS,
  PARENT_TIPS, TEACHER_TIPS, CONSULT, FAQ,
} from '../../data/feelingsCorner'

// /classroom/feelings-corner: how to set up a feelings + quiet corner, an on-screen check-in
// with 4-4 breathing, and printables (wall meter, daily check-in, weekly diary, strategy cards).
// Nothing typed or tapped here is stored or sent anywhere.

const ROUNDS = 5 // breathing rounds before the exercise ends by itself

function Breathing() {
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0) // seconds since start
  const round = Math.floor(tick / 8)
  const inPhase = tick % 8 < 4
  const sec = (tick % 4) + 1
  const finished = round >= ROUNDS

  useEffect(() => {
    if (!running || finished) return undefined
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [running, finished])

  const big = running && !finished && inPhase
  const label = finished ? 'כל הכבוד! איך הגוף מרגיש עכשיו?' : !running ? 'מוכנים?' : inPhase ? 'שואפים אוויר דרך האף' : 'נושפים לאט דרך הפה'
  return <div className="mt-4 rounded-3xl bg-sky-50 p-5 text-center" aria-labelledby="breathe-h">
    <h3 id="breathe-h" className="text-2xl font-black">🫧 נושמים ביחד: 4 שאיפה, 4 נשיפה</h3>
    <div className="mx-auto my-4 flex h-56 w-56 items-center justify-center" aria-hidden="true">
      <div className="flex h-40 w-40 items-center justify-center rounded-full bg-sky-300 text-5xl font-black text-sky-900 shadow-lg motion-reduce:transition-none"
        style={{ transform: big ? 'scale(1.35)' : 'scale(0.8)', transition: 'transform 4s ease-in-out' }}>
        {running && !finished ? sec : '🙂'}
      </div>
    </div>
    <p className="text-xl font-bold" role="status" aria-live="polite">{label}</p>
    {running && !finished && <p className="mt-1 text-[var(--muted-foreground)]">סבב {round + 1} מתוך {ROUNDS}</p>}
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {!running || finished
        ? <button type="button" className="ln-btn go" onClick={() => { setTick(0); setRunning(true) }}>{finished ? 'עוד פעם' : 'מתחילים'}</button>
        : <button type="button" className="ln-btn alt" onClick={() => { setRunning(false); setTick(0) }}>עוצרים</button>}
    </div>
  </div>
}

function CheckIn() {
  const [id, setId] = useState(null)
  const f = FEELINGS.find(x => x.id === id)
  return <div>
    <p className="mb-3 text-lg">לוחצים על הפרצוף שהכי דומה למה שאתם מרגישים עכשיו.</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="בחירת רגש">
      {FEELINGS.map(x => <button key={x.id} type="button" aria-pressed={x.id === id} onClick={() => setId(x.id)}
        className={`min-h-[96px] rounded-2xl border-2 p-3 text-center ${x.id === id ? 'border-slate-800 ring-2 ring-slate-800' : 'border-[var(--border)]'}`}
        style={{ background: x.color }}>
        <span className="block text-5xl" aria-hidden="true">{x.emoji}</span>
        <span className="mt-1 block text-lg font-black">{x.label}</span>
      </button>)}
    </div>
    {f && <div className="mt-4 rounded-3xl border-2 border-[var(--border)] bg-white p-5" role="status" aria-live="polite">
      <p className="text-2xl font-black"><span aria-hidden="true">{f.emoji}</span> {f.label}</p>
      <p className="mt-2 text-lg leading-relaxed">{f.say}</p>
      <p className="mt-2 text-lg leading-relaxed">💡 {f.tip}</p>
      {f.tool === 'breathe' && <Breathing key={f.id} />}
      {(f.tool === 'talk' || f.tool === 'breathe') && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-lg font-bold">🙋 אם קשה, אפשר לדבר עם מבוגר שסומכים עליו: גננת, מורה, הורה או יועצת.</p>}
      {f.tool === 'rest' && <p className="mt-3 rounded-2xl bg-violet-50 p-3 text-lg">🧸 קחו כרית, שבו בנוחות ונשמו לאט. אפשר גם לנסות את <button type="button" className="font-bold underline" onClick={() => setId('frustrated')}>נשימת 4־4</button>.</p>}
      <button type="button" className="ln-btn alt mt-4" onClick={() => setId(null)}>בוחרים רגש אחר</button>
    </div>}
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח. הבחירה נשארת רק על המסך שלכם.</p>
  </div>
}

// ---- printable sheets (A4 pages inside PrintPreview) ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const line = { borderBottom: '1px solid #999', height: 20, width: '100%' }
const smallh = { width: '100%', margin: '2mm 0 1mm', fontSize: 15 }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>

function MeterSheet() {
  return <article className="buga-a4" style={page}>
    <h2>🌡️ מד הרגשות שלי</h2>
    <p style={{ fontSize: 13, margin: '0 0 6px', textAlign: 'center' }}>מצמידים אטב עם השם על המספר שמתאים לי עכשיו</p>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '2mm', minHeight: 0 }}>
      {THERMO.map(t => <div key={t.n} style={{ flex: 1, minHeight: 0, background: t.color, border: '2px solid #333', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px' }}>
        <span style={{ fontSize: 34, fontWeight: 900, width: 40, textAlign: 'center' }}>{t.n}</span>
        <span style={{ fontSize: 38 }}>{t.emoji}</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 22, fontWeight: 900 }}>{t.label}</span>
          <span style={{ display: 'block', fontSize: 15 }}>{t.note}</span>
        </span>
      </div>)}
    </div>
    <p style={{ fontSize: 13, margin: '4px 0 0', textAlign: 'center' }}>כל הרגשות בסדר. כשהמספר גבוה אפשר לבקש עזרה.</p>
    {foot('מד רגשות לקיר')}
  </article>
}

function BodyOutline() {
  return <svg viewBox="0 0 100 160" style={{ width: 90, height: 140 }} aria-hidden="true">
    <circle cx="50" cy="20" r="14" fill="none" stroke="#333" strokeWidth="2" />
    <path d="M34 40 Q50 36 66 40 L72 100 L60 100 L58 150 L52 150 L50 112 L48 150 L42 150 L40 100 L28 100 Z" fill="none" stroke="#333" strokeWidth="2" />
    <path d="M34 42 L14 90 M66 42 L86 90" fill="none" stroke="#333" strokeWidth="2" />
  </svg>
}

function CheckInSheet() {
  return <article className="buga-a4" style={page}>
    <h2>😊 איך אני מרגיש/ה היום?</h2>
    <p style={{ fontSize: 14, margin: '0 0 4px', width: '100%' }}>שם: ______________ · תאריך: ____________</p>
    <h3 style={smallh}>1. מקיפים בעיגול את הפרצוף שהכי מתאים לי</h3>
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
      {FEELINGS.map(x => <div key={x.id} style={{ border: '2px solid #444', borderRadius: 14, textAlign: 'center', padding: '4px 0', background: x.color }}>
        <div style={{ fontSize: 34 }}>{x.emoji}</div><div style={{ fontSize: 14, fontWeight: 800 }}>{x.label}</div>
      </div>)}
    </div>
    <h3 style={smallh}>2. כמה חזק הרגש? מקיפים מספר</h3>
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
      {[1, 2, 3, 4, 5].map(n => <span key={n} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, background: THERMO[5 - n].color }}>{n}</span>)}
    </div>
    <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 6 }}>
      <div style={{ flex: 1 }}>
        <h3 style={smallh}>3. איפה אני מרגיש/ה את זה בגוף? מצבעים</h3>
        <div style={{ textAlign: 'center' }}><BodyOutline /></div>
      </div>
      <div style={{ flex: 1.3 }}>
        <h3 style={smallh}>4. מה קרה? מה גרם לזה?</h3>
        <div style={line} /><div style={line} /><div style={line} />
      </div>
    </div>
    <h3 style={smallh}>5. מה יעזור לי? מסמנים ✓</h3>
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px 10px', fontSize: 14 }}>
      {STRATEGIES.map(s => <span key={s.id}>☐ {s.emoji} {s.title}</span>)}
    </div>
    <h3 style={smallh}>6. מי יכול לעזור לי? ______________________</h3>
    {foot('דף צ׳ק־אין יומי')}
  </article>
}

function DiarySheet() {
  return <article className="buga-a4" style={page}>
    <h2>📔 יומן הרגשות שלי · השבוע של ____________</h2>
    <p style={{ fontSize: 12, margin: '0 0 3px', width: '100%' }}>בכל יום: מקיפים פרצוף, מציירים ברבוע וכותבים משפט אחד.</p>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5mm', minHeight: 0 }}>
      {DAYS.map(d => <div key={d} style={{ flex: 1, minHeight: 0, display: 'flex', gap: 6, border: '1.5px solid #555', borderRadius: 10, padding: 4 }}>
        <div style={{ width: 52, fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef3c7', borderRadius: 8 }}>יום {d}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}>{FEELINGS.map(x => <span key={x.id}>{x.emoji}</span>)}</div>
          <div style={{ fontSize: 11 }}>היום הרגשתי כי: ______________________________</div>
          <div style={{ fontSize: 11 }}>מה עזר לי: ___________________________________</div>
        </div>
        <div style={{ width: '30%', border: '1.5px dashed #999', borderRadius: 8, fontSize: 10, color: '#999', padding: 2 }}>ציור</div>
      </div>)}
    </div>
    <p style={{ fontSize: 12, margin: '3px 0 0' }}>היומן שלי. לא חייבים להראות אותו לאף אחד.</p>
    {foot('יומן רגשות שבועי')}
  </article>
}

function CardsSheet() {
  return <article className="buga-a4" style={page}>
    <h2>🃏 כרטיסי הרגעה</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px' }}>גוזרים לאורך הקו המקווקו, מצפים בלמינציה ושמים בפינת הרגשות</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 6 }}>
      {STRATEGIES.map((s, i) => <div key={s.id} style={{ border: '2px dashed #555', borderRadius: 12, padding: 6, textAlign: 'center', background: FEELINGS[i].color, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 34 }}>{s.emoji}</div>
        <div style={{ fontSize: 19, fontWeight: 900 }}>{s.title}</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.35, marginTop: 2 }}>{s.how}</div>
      </div>)}
    </div>
    {foot('כרטיסי הרגעה')}
  </article>
}

const SHEETS = [
  { id: 'meter', emoji: '🌡️', label: 'מד רגשות לקיר', C: MeterSheet },
  { id: 'checkin', emoji: '😊', label: 'איך אני מרגיש/ה היום', C: CheckInSheet },
  { id: 'diary', emoji: '📔', label: 'יומן רגשות שבועי', C: DiarySheet },
  { id: 'cards', emoji: '🃏', label: 'כרטיסי הרגעה', C: CardsSheet },
]

export default function FeelingsCorner() {
  const [print, setPrint] = useState(null)
  const sheet = SHEETS.find(s => s.id === print)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="פינת רגשות ופינת שקט בגן ובכיתה + יומן רגשות להדפסה"
      description="איך מקימים פינת רגשות ופינת שקט בגן ובכיתה: מה שמים בה, כללים, מד רגשות על המסך עם נשימה מונפשת, מד רגשות לקיר, דף צ׳ק־אין יומי, יומן רגשות שבועי לגילאי 6–10 וכרטיסי הרגעה. בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'פינת רגשות' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🫶 פינת רגשות ופינת שקט בגן ובכיתה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">איך מקימים מקום שבו ילדים לומדים לזהות מה הם מרגישים ולהירגע, ומה כדאי לשים בו. עם מד רגשות על המסך, נשימה מונפשת ודפים להדפסה: מד רגשות לקיר, צ׳ק־אין יומי, יומן רגשות וכרטיסי הרגעה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['setup', 'הקמת הפינה'], ['checkin', 'מד רגשות על המסך'], ['print', 'דפים להדפסה'], ['tips', 'טיפים'], ['help', 'מתי לפנות לעזרה']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="setup" className="mb-8 scroll-mt-24" aria-labelledby="setup-h">
      <h2 id="setup-h" className="mb-3 text-3xl font-black">🛋️ איך מקימים פינת שקט ורגשות</h2>
      <p className="mb-4 text-lg leading-relaxed">מספיק פינה קטנה, שקטה ונעימה, רחוקה מהרעש. כמה דברים שכדאי לשים בה:</p>
      <ul className="grid gap-3 sm:grid-cols-2">{SETUP_ITEMS.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-5">
          <h3 className="text-2xl font-black">📜 כללי הפינה</h3>
          <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{RULES.map(r => <li key={r}>{r}</li>)}</ul>
        </div>
        <div className="rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5">
          <h3 className="text-2xl font-black">🧒 איך ילד משתמש בפינה</h3>
          <ol className="mt-2 space-y-3">{CHILD_STEPS.map(([n, t, d]) => <li key={n} className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-300 text-lg font-black">{n}</span>
            <span><b>{t}</b><br />{d}</span></li>)}
          </ol>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-lg leading-relaxed">⚠️ <b>זה לא עונש.</b> פינת שקט עובדת רק כשהילד חווה אותה כמקום בטוח שהוא בוחר בו. כשהיא הופכת למקום שבו ״שולחים כשהתנהגת לא יפה״, הילדים מפסיקים להשתמש בה.</p>
      <p className="mt-3 text-lg">אפשר להשלים עם <Link to="/printables/emotion-cards" className="font-bold underline">כרטיסיות רגשות להדפסה</Link>: 24 רגשות עם שאלה לשיחה על כל כרטיס, וגם לוח רגשות לקיר.</p>
    </section>

    <section id="checkin" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="checkin-h">
      <h2 id="checkin-h" className="mb-3 text-3xl font-black">🌈 מד רגשות: איך אני מרגיש/ה עכשיו?</h2>
      <CheckIn />
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <p className="mb-4 text-lg leading-relaxed">ארבעה דפי A4 שמוכנים להדפסה: למד הרגשות לקיר הוסיפו אטבים עם שמות הילדים, ואת הכרטיסים כדאי לצפות בלמינציה.</p>
      <div className="grid gap-3 sm:grid-cols-2">{SHEETS.map(s => <button key={s.id} type="button" onClick={() => setPrint(s.id)}
        className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{s.emoji}</span> {s.label} · הדפסה ←</button>)}
      </div>
      <h3 className="mt-6 text-2xl font-black">🃏 כרטיסי הרגעה: שמונה רעיונות</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{STRATEGIES.map(s => <li key={s.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-3xl" aria-hidden="true">{s.emoji}</p><p className="text-lg font-black">{s.title}</p><p className="mt-1 text-[15px] leading-relaxed">{s.how}</p></li>)}
      </ul>
    </section>

    <section id="tips" className="mb-8 grid scroll-mt-24 gap-4 md:grid-cols-2" aria-labelledby="tips-h">
      <h2 id="tips-h" className="sr-only">טיפים להורים ולצוות החינוכי</h2>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">👨‍👩‍👧 טיפים להורים</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{PARENT_TIPS.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">🍎 טיפים לגננות ולמורים</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{TEACHER_TIPS.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>

    <section id="help" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-rose-50 p-5" aria-labelledby="help-h">
      <h2 id="help-h" className="mb-3 text-3xl font-black">🤝 מתי כדאי לפנות ליועצת או לפסיכולוג</h2>
      <p className="mb-3 text-lg leading-relaxed">רגשות קשים הם חלק רגיל מהחיים, וברוב המקרים כלים כמו אלה שבדף עוזרים. כדאי לשוחח עם יועצת בית הספר או הגן, עם רופא הילדים או עם פסיכולוג ילדים, אם:</p>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{CONSULT.map(c => <li key={c}>{c}</li>)}</ul>
      <p className="mt-3 leading-relaxed">העמוד הזה הוא כלי חינוכי כללי. הוא לא מאבחן ולא מחליף הערכה של איש מקצוע. אם יש חשש לסכנה מיידית, פנו מיד לגורם מוסמך, למשל לשירותי החירום.</p>
    </section>

    {sheet && <PrintPreview title={`פינת רגשות — ${sheet.label}`} onClose={() => setPrint(null)}><sheet.C /></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לכיתה: <Link className="font-bold underline" to="/classroom/accepting-differences">קבלת השונה</Link> · <Link className="font-bold underline" to="/printables/emotion-cards">כרטיסיות רגשות</Link> · <Link className="font-bold underline" to="/classroom">כל הכלים למורה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'ילדים מרגישים הרבה לפני שהם יודעים להסביר מה קורה להם. פינת רגשות בגן או בכיתה נותנת להם מקום פיזי להירגע ושפה לדבר על מה שבפנים: מד רגשות שאפשר להצביע עליו, כרטיסים שמציעים מה לעשות, ודף לצייר בו. כשיש לילד כלים, קל לו יותר להרגיע את עצמו ולבקש עזרה.',
      'הדף הזה כולל הכול להקמת פינה כזו. מדריך קצר להקמה וכללים ברורים, מד רגשות אינטראקטיבי עם נשימת 4־4 מונפשת, ואחריהם ארבעה דפי הדפסה: מד רגשות לקיר עם חמש דרגות צבע, דף צ׳ק־אין יומי, יומן רגשות שבועי עם רבועי ציור לילדים בגילאי 6 עד 10, וכרטיסי הרגעה כמו נשימת בלון, ספירה לעשר וחיבוק כרית. שום מידע לא נשמר ולא נשלח.',
    ]} faq={FAQ} related={[{ label: 'כרטיסיות רגשות להדפסה', href: '/printables/emotion-cards' }, { label: 'קבלת השונה בכיתה', href: '/classroom/accepting-differences' }, { label: 'לכיתה: כל הכלים למורה', href: '/classroom' }]} /></div>
  </div>
}
