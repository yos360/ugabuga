import '../../learn/learn.css'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PATH, NUMBERS, SITUATIONS, QUIZ, CALL_STEPS, KIT, PARENT_TIPS, TEACHER_TIPS, FAQ } from '../../data/firstAidKids'

// /guides/first-aid-kids: first-aid basics for kids and parents, a scenario quiz and a "practice
// calling 101" script (nothing is dialed). General guidance only; not a replacement for a course.
// Nothing typed or chosen here is stored or sent anywhere.

function Quiz() {
  // Shuffle each question's options once per mount, keeping track of the right one.
  const items = useMemo(() => QUIZ.map(x => {
    const opts = x.o.map((t, i) => ({ t, ok: i === x.a })).sort(() => Math.random() - 0.5)
    return { ...x, opts }
  }), [])
  const [i, setI] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)

  const restart = () => { setI(0); setChosen(null); setScore(0); setOver(false) }
  if (over) {
    const msg = score === items.length ? 'מושלם! אתם יודעים מה עושים. והדבר הכי חשוב: תמיד קוראים למבוגר.' : score >= items.length / 2 ? 'יפה מאוד! כדאי לעבור שוב על הכרטיסים שלמעלה.' : 'התחלה טובה. נסו שוב אחרי שקראתם את הכרטיסים שלמעלה.'
    return <div className="rounded-3xl bg-white p-6 text-center" role="status" aria-live="polite">
      <p className="text-6xl" aria-hidden="true">🏅</p>
      <p className="mt-2 text-3xl font-black">ענית נכון על {score} מתוך {items.length}</p>
      <p className="mt-2 text-lg">{msg}</p>
      <button type="button" className="ln-btn go mt-4" onClick={restart}>מנסים שוב</button>
    </div>
  }
  const q = items[i]
  return <div>
    <p className="mb-2 text-center text-lg font-bold">שאלה {i + 1} מתוך {items.length}</p>
    <div className="rounded-3xl bg-white p-5">
      <p className="text-2xl font-black leading-snug">{q.q}</p>
      <div className="mt-4 grid gap-3" role="group" aria-label="תשובות">
        {q.opts.map(o => {
          const sel = chosen === o.t
          const state = chosen === null ? 'border-[var(--border)] bg-white' : o.ok ? 'border-emerald-600 bg-emerald-100' : sel ? 'border-rose-500 bg-rose-100' : 'border-[var(--border)] bg-white opacity-70'
          return <button key={o.t} type="button" disabled={chosen !== null} aria-pressed={sel}
            onClick={() => { setChosen(o.t); if (o.ok) setScore(s => s + 1) }}
            className={`min-h-[56px] rounded-2xl border-2 p-3 text-right text-lg font-bold ${state}`}>
            {chosen !== null && o.ok ? '✅ ' : chosen !== null && sel ? '❌ ' : ''}{o.t}</button>
        })}
      </div>
      {chosen !== null && <div className="mt-4 rounded-2xl bg-sky-50 p-4" role="status" aria-live="polite">
        <p className="text-lg leading-relaxed">💡 {q.why}</p>
        <button type="button" className="ln-btn go mt-3" onClick={() => { if (i + 1 >= items.length) setOver(true); else { setI(i + 1); setChosen(null) } }}>{i + 1 >= items.length ? 'לתוצאה' : 'השאלה הבאה ←'}</button>
      </div>}
    </div>
  </div>
}

function CallPractice() {
  const [name, setName] = useState('')
  const [addr, setAddr] = useState('')
  const [step, setStep] = useState(0)
  const filled = [
    `שמי ${name.trim() || '____'}.`,
    `הכתובת: ${addr.trim() || 'רחוב ____ מספר ___, עיר ____'}.`,
    CALL_STEPS[2].ex,
    CALL_STEPS[3].ex,
    CALL_STEPS[4].ex,
  ]
  return <div>
    <div className="mb-3 rounded-2xl bg-amber-50 p-4 text-lg font-bold" role="note">⚠️ זה תרגול בלבד. לא מתקשרים באמת למספר 101 ולא שולחים שום דבר. מתקשרים באמת רק כשיש מצב חירום, ורק כשמבוגר איתכם או אין מבוגר זמין.</div>
    <div className="mb-3 grid gap-3 sm:grid-cols-2">
      <label className="block text-lg font-bold">איך קוראים לי?
        <input type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="off" className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white p-2 text-lg font-normal" /></label>
      <label className="block text-lg font-bold">מה הכתובת שלי?
        <input type="text" value={addr} onChange={e => setAddr(e.target.value)} autoComplete="off" className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white p-2 text-lg font-normal" /></label>
    </div>
    <ol className="space-y-2">{CALL_STEPS.map((s, n) => <li key={s.t}>
      <button type="button" onClick={() => setStep(n)} aria-current={n === step ? 'step' : undefined}
        className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-right ${n === step ? 'border-slate-800 bg-emerald-100' : 'border-[var(--border)] bg-white'}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-lg font-black">{n + 1}</span>
        <span className="text-lg"><b>{s.t}</b>{n === step && <span className="mt-1 block" role="status" aria-live="polite">🗣️ ״{filled[n]}״</span>}</span>
      </button></li>)}
    </ol>
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn alt" disabled={step === 0} onClick={() => setStep(step - 1)}>→ הקודם</button>
      <button type="button" className="ln-btn go" disabled={step === CALL_STEPS.length - 1} onClick={() => setStep(step + 1)}>הבא ←</button>
    </div>
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 השם והכתובת שמקלידים כאן לא נשמרים ולא נשלחים. הם נשארים רק על המסך שלכם.</p>
  </div>
}

// ---- printable sheets ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>
const blank = { borderBottom: '1px solid #666', display: 'inline-block', minWidth: 140 }

function FridgeSheet() {
  return <article className="buga-a4" style={page}>
    <h2>🚑 מספרי חירום של המשפחה</h2>
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {NUMBERS.map(x => <div key={x.n} style={{ border: '3px solid #b91c1c', borderRadius: 14, padding: 8, textAlign: 'center', background: '#fef2f2' }}>
        <div style={{ fontSize: 30 }}>{x.emoji}</div>
        <div style={{ fontSize: x.n.length > 4 ? 28 : 54, fontWeight: 900, lineHeight: 1.1 }} dir="ltr">{x.n}</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{x.who}</div>
        <div style={{ fontSize: 12.5 }}>{x.note}</div>
      </div>)}
    </div>
    <h3 style={{ width: '100%', margin: '4mm 0 1mm', fontSize: 18 }}>🏠 מה אומרים בשיחה?</h3>
    <ol style={{ width: '100%', fontSize: 14.5, lineHeight: 1.6, margin: 0, paddingInlineStart: 22 }}>
      <li>שמי ______________.</li>
      <li>הכתובת שלנו: רחוב ________________ מספר ____ קומה ____ עיר ____________.</li>
      <li>קרה ______________________. (אומרים מה קרה במילים פשוטות)</li>
      <li>עונים על שאלות ולא מנתקים עד שאומרים שאפשר.</li>
    </ol>
    <h3 style={{ width: '100%', margin: '4mm 0 1mm', fontSize: 18 }}>📞 טלפונים של המשפחה</h3>
    <div style={{ width: '100%', fontSize: 16, lineHeight: 2.1 }}>
      <div>אמא: <span style={blank} /> אבא: <span style={blank} /></div>
      <div>סבתא / סבא: <span style={blank} /> שכן/ה: <span style={blank} /></div>
      <div>רופא/ת ילדים: <span style={blank} /> קופת חולים: <span style={blank} /></div>
      <div>אלרגיות או תרופות חשובות: <span style={{ ...blank, minWidth: 260 }} /></div>
    </div>
    <p style={{ fontSize: 12, margin: '4mm 0 0', textAlign: 'center' }}>תולים במקום בולט, ליד הטלפון או על המקרר. בכל מצב קוראים קודם למבוגר.</p>
    {foot('דף מקרר')}
  </article>
}

function KidCardsSheet() {
  return <article className="buga-a4" style={page}>
    <h2>🦸 כרטיסי גיבורים: מה עושים אם…</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px' }}>גוזרים לאורך הקו המקווקו. תמיד קודם קוראים למבוגר!</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 6 }}>
      {SITUATIONS.map(s => <div key={s.id} style={{ border: '2px dashed #555', borderRadius: 12, padding: 6, textAlign: 'center', background: '#fef9c3', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 32 }}>{s.emoji}</div>
        <div style={{ fontSize: 17, fontWeight: 900 }}>{s.title}</div>
        <div style={{ fontSize: 12, lineHeight: 1.35, marginTop: 2 }}>1. {s.kid[0]}<br />2. {s.kid[1]}</div>
      </div>)}
    </div>
    {foot('כרטיסי גיבורים')}
  </article>
}

function KitSheet() {
  return <article className="buga-a4" style={page}>
    <h2>🧰 רשימת ערכת עזרה ראשונה לבית</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px', width: '100%' }}>בודקים ☑ מה יש, ומשלימים מה שחסר. תאריך בדיקה: ____________</p>
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 15 }}>
      {KIT.map(k => <div key={k} style={{ borderBottom: '1px dotted #999', padding: '3px 0' }}>☐ {k}</div>)}
    </div>
    <p style={{ fontSize: 13, margin: '4mm 0 0', width: '100%', lineHeight: 1.5 }}>✓ הערכה במקום קבוע, גבוה ויבש, מחוץ להישג ידם של ילדים קטנים.<br />✓ בודקים תאריכי תפוגה כל חצי שנה.<br />✓ ממלאים את דף מספרי החירום ושמים בתוך הערכה.<br />✓ זו רשימה כללית. התאימו אותה לילדים שלכם בהתייעצות עם רופא/ה.</p>
    {foot('רשימת ערכה')}
  </article>
}

const SHEETS = [
  { id: 'fridge', emoji: '🚑', label: 'דף מספרי חירום למקרר', C: FridgeSheet },
  { id: 'cards', emoji: '🦸', label: 'כרטיסי גיבורים לילדים', C: KidCardsSheet },
  { id: 'kit', emoji: '🧰', label: 'רשימת ערכת עזרה ראשונה', C: KitSheet },
]

export default function FirstAidKids() {
  const [print, setPrint] = useState(null)
  const sheet = SHEETS.find(s => s.id === print)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="עזרה ראשונה לילדים: מה עושים אם… (להורים ולכיתה)"
      description="עזרה ראשונה לילדים: חתך, דימום מהאף, כוויה, עקיצה, נפילה בראש וחנק. חידון, תרגול שיחה ל־101, דף מספרי חירום ורשימת ערכה להדפסה."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מדריכים', href: '/guides' }, { label: 'עזרה ראשונה לילדים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🚑 עזרה ראשונה לילדים: מה עושים אם…</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מדריך קצר להורים, לגננות ולמורים שמלמדים ילדים בגילאי גן עד כיתה ו׳ מה עושים במצבים נפוצים. הכלל הראשון לכל ילד: קוראים למבוגר. עם חידון, תרגול שיחה ל־101 ודפי הדפסה.</p>

    <p className="mb-8 rounded-3xl border-2 border-rose-300 bg-rose-50 p-4 text-lg leading-relaxed" role="note">⚠️ <b>חשוב:</b> העמוד הוא מידע כללי ללימוד ילדים, ואינו מחליף קורס עזרה ראשונה, הכשרה מעשית או ייעוץ רפואי. מומלץ בחום להירשם לקורס עזרה ראשונה להורים ולצוותי חינוך, למשל דרך מד״א או גופי הכשרה מוכרים אחרים. במצב חירום מתקשרים 101 ופועלים לפי הנחיות המוקדן.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['numbers', 'מספרי חירום'], ['situations', 'מה עושים אם'], ['quiz', 'חידון'], ['call', 'תרגול שיחה ל־101'], ['print', 'להדפסה'], ['tips', 'טיפים']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="numbers" className="mb-8 scroll-mt-24" aria-labelledby="numbers-h">
      <h2 id="numbers-h" className="mb-3 text-3xl font-black">📞 מספרי חירום שכל ילד צריך להכיר</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{NUMBERS.map(x => <li key={x.n} className="rounded-2xl border-2 border-rose-300 bg-white p-4 text-center">
        <p className="text-3xl" aria-hidden="true">{x.emoji}</p>
        <p className="text-4xl font-black" dir="ltr">{x.n}</p>
        <p className="text-lg font-bold">{x.who}</p><p className="mt-1 text-[15px] leading-relaxed">{x.note}</p></li>)}
      </ul>
      <p className="mt-3 text-lg leading-relaxed">לילדים: <b>קודם קוראים למבוגר.</b> אם אין מבוגר בסביבה והמצב חירום, מתקשרים 101 ואומרים את השם, הכתובת ומה קרה.</p>
    </section>

    <section id="situations" className="mb-8 scroll-mt-24" aria-labelledby="situations-h">
      <h2 id="situations-h" className="mb-3 text-3xl font-black">🩹 מה עושים אם… שמונה מצבים נפוצים</h2>
      <div className="space-y-4">{SITUATIONS.map(s => <article key={s.id} className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black"><span aria-hidden="true">{s.emoji}</span> {s.title}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-sky-50 p-4">
            <p className="font-black">🧒 מה ילד עושה</p>
            <ol className="mt-1 list-decimal space-y-1 pr-5 leading-relaxed">{s.kid.map(k => <li key={k}>{k}</li>)}</ol>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="font-black">🧑 מה מבוגר עושה</p>
            <ul className="mt-1 list-disc space-y-1 pr-5 leading-relaxed">{s.adult.map(k => <li key={k}>{k}</li>)}</ul>
          </div>
        </div>
        <p className="mt-3 rounded-2xl bg-rose-50 p-3 leading-relaxed">🚨 <b>מתי פונים לעזרה:</b> {s.call}</p>
      </article>)}</div>
    </section>

    <section id="quiz" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="quiz-h">
      <h2 id="quiz-h" className="mb-3 text-3xl font-black">🧠 חידון: מה עושים אם?</h2>
      <Quiz />
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח. התוצאה נשארת רק על המסך שלכם.</p>
    </section>

    <section id="call" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5" aria-labelledby="call-h">
      <h2 id="call-h" className="mb-3 text-3xl font-black">☎️ תרגול: מה אומרים כשמתקשרים ל־101</h2>
      <CallPractice />
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <p className="mb-4 text-lg leading-relaxed">דף מקרר עם מספרי חירום ומקום להשלמת הכתובת והטלפונים של ההורים, כרטיסי גיבורים לילדים ורשימת בדיקה לערכת עזרה ראשונה.</p>
      <div className="grid gap-3 sm:grid-cols-2">{SHEETS.map(s => <button key={s.id} type="button" onClick={() => setPrint(s.id)}
        className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{s.emoji}</span> {s.label} · הדפסה ←</button>)}
      </div>
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

    {sheet && <PrintPreview title={`עזרה ראשונה לילדים — ${sheet.label}`} onClose={() => setPrint(null)}><sheet.C /></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד: <Link className="font-bold underline" to="/guides">כל המדריכים</Link> · <Link className="font-bold underline" to="/classroom/feelings-corner">פינת רגשות</Link> · <Link className="font-bold underline" to="/classroom">לכיתה: כל הכלים למורה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'ילדים לא צריכים להיות מצילים, אבל הם יכולים ללמוד שלושה דברים פשוטים שמשנים הרבה: קוראים למבוגר, זוכרים שמספר מד״א הוא 101, ויודעים לומר את הכתובת. הדף הזה עוזר ללמד אותם בצורה רגועה ומשחקית, ועוזר להורים ולצוותי חינוך להיות מוכנים למצבים נפוצים כמו חתך, דימום מהאף, כוויה קלה, עקיצה ומכה.',
      'בדף יש כרטיסים לשמונה מצבים עם הנחיות נפרדות לילד ולמבוגר וסימני אזהרה שמחייבים 101, חידון שאלות, תרגול שיחה לחירום בלי להתקשר באמת, ושלושה דפי הדפסה. המידע כללי בלבד ואינו תחליף לקורס עזרה ראשונה. שום מידע לא נשמר ולא נשלח.',
    ]} faq={FAQ} related={[{ label: 'מדריכים להורים', href: '/guides' }, { label: 'פינת רגשות בגן ובכיתה', href: '/classroom/feelings-corner' }, { label: 'לכיתה: כל הכלים למורה', href: '/classroom' }]} /></div>
  </div>
}
