import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { CIRCLE_PLANS } from '../../data/hanukkahCircleTime'

// /holidays/hanukkah/circle-time: ready 20-minute Hanukkah circle-time plans for kindergarten.
// Each plan: goal, materials, opening, central question, timed main activity, closing, a mixed-age
// adaptation and a note for a student teacher being observed. One plan prints on one A4 page.
const PATH = '/holidays/hanukkah/circle-time'

const pg = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start', direction: 'rtl', textAlign: 'right', padding: '4.5%' }
const sec = { width: '100%', margin: '0 0 2.2mm', fontSize: 12.5, lineHeight: 1.45 }
const lab = { display: 'block', fontSize: 12.5, fontWeight: 800, color: '#1e3a8a' }

function PlanSheet({ p }) {
  return <article className="buga-a4" style={pg}>
    <h2 style={{ fontSize: 22, margin: '0 0 1.5mm' }}>{p.emoji} מערך מפגש לחנוכה: {p.title}</h2>
    <p style={{ ...sec, textAlign: 'center', fontSize: 11 }}>גן · גילי 4–6 · 20 דקות · קבוצה: ____________ · תאריך: ____________</p>
    <p style={sec}><b style={lab}>מטרה</b>{p.goal}</p>
    <p style={sec}><b style={lab}>חומרים</b>{p.materials.join(' · ')}</p>
    <p style={sec}><b style={lab}>פתיחה ({p.opening.min} דקות)</b>{p.opening.text}</p>
    <p style={{ ...sec, background: '#eff6ff', borderRadius: 6, padding: '1.5mm 2mm' }}><b style={lab}>שאלה מרכזית</b>{p.question}</p>
    <div style={sec}><b style={lab}>פעילות מרכזית</b>
      <ol style={{ margin: 0, paddingInlineStart: 18 }}>{p.steps.map((s, i) => <li key={i}><b>{s.min} דק׳:</b> {s.text}</li>)}</ol>
    </div>
    <p style={sec}><b style={lab}>סיום ({p.closing.min} דקות)</b>{p.closing.text}</p>
    <p style={sec}><b style={lab}>התאמה לגן תלת־גילי</b>{p.mixed}</p>
    <p style={sec}><b style={lab}>לסטודנטית בתצפית</b>{p.student}</p>
    <div style={{ width: '100%', flex: 1, minHeight: '14mm', border: '1.5px dashed #999', borderRadius: 8, padding: '1.5mm 2mm', fontSize: 11, color: '#555' }}>הערות אחרי המפגש:</div>
    <footer>ugabuga.co.il{PATH} · מערך מפגש: {p.title}</footer>
  </article>
}

function PlanCard({ p, onPrint }) {
  const total = p.opening.min + p.steps.reduce((n, s) => n + s.min, 0) + p.closing.min
  const row = 'rounded-2xl p-4'
  return <article id={`p-${p.id}`} className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm" aria-labelledby={`h-${p.id}`}>
    <header className="mb-3 flex flex-wrap items-center gap-3">
      <h2 id={`h-${p.id}`} className="flex-1 text-2xl font-bold">{p.emoji} {p.title}</h2>
      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold">⏱️ {total} דקות</span>
    </header>
    <p className="mb-3 text-lg"><b>🎯 מטרה:</b> {p.goal}</p>
    <p className="mb-3 text-lg"><b>🧰 חומרים:</b> {p.materials.join(' · ')}</p>
    <div className="mb-3 grid gap-3 md:grid-cols-2">
      <div className={`${row} bg-amber-50`}><h3 className="mb-1 font-bold">✨ פתיחה · {p.opening.min} דקות</h3><p>{p.opening.text}</p></div>
      <div className={`${row} bg-blue-50`}><h3 className="mb-1 font-bold">❓ שאלה מרכזית</h3><p className="text-lg font-bold">{p.question}</p></div>
    </div>
    <h3 className="mb-2 font-bold">🎲 פעילות מרכזית</h3>
    <ol className="mb-3 space-y-2">{p.steps.map((s, i) => <li key={i} className="flex gap-3 rounded-xl border border-[var(--border)] p-3">
      <span className="h-fit shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-sm font-bold text-white">{s.min} דק׳</span><span>{s.text}</span></li>)}</ol>
    <div className={`${row} mb-3 bg-emerald-50`}><h3 className="mb-1 font-bold">🏁 סיום · {p.closing.min} דקות</h3><p>{p.closing.text}</p></div>
    <div className="mb-3 grid gap-3 md:grid-cols-2">
      <div className={`${row} bg-[var(--postit)]`}><h3 className="mb-1 font-bold">👧👦 התאמה לגן תלת־גילי</h3><p>{p.mixed}</p></div>
      <div className={`${row} bg-purple-50`}><h3 className="mb-1 font-bold">🎓 לסטודנטית בתצפית</h3><p>{p.student}</p></div>
    </div>
    <div className="text-center"><button type="button" onClick={() => onPrint(p.id)} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-4 font-bold">🖨️ הדפסת המערך: דף A4 אחד</button></div>
  </article>
}

const FAQ = [
  { q: 'מה זה מערך מפגש מעגל לחנוכה?', a: 'מערך מפגש הוא תכנון קצר של מפגש עם כל ילדי הגן במעגל: מטרה, חומרים, פתיחה שתופסת את תשומת הלב, שאלה מרכזית, פעילות עם שלבים וזמנים, וסיום. כאן כל מערך נכנס ל־20 דקות ומתחיל בהפתעה קטנה, למשל פנס בחושך או סופגנייה מכוסה.' },
  { q: 'איך מתאימים את המערך לגן תלת־גילי?', a: 'בכל מערך כתוב מה עושים עם הקטנים (3–4) ומה עם הגדולים (5–6): הקטנים מזהים, מצביעים וסופרים עד 3–5, והגדולים מסבירים, מחברים ומנהלים תור. כך כל הגן עובד על אותו נושא ברמה שמתאימה לו, ואפשר לשבץ ילד גדול ליד ילד קטן.' },
  { q: 'יש טיפים לסטודנטית בתצפית?', a: 'כן. בכל מערך יש פסקה בשביל זה: על ההכנה לפני המפגש, על ניהול תורות, על הקשבה לילדים ועל נקודות בטיחות ואלרגיות. כדאי לרשום בדף המודפס את ההערות אחרי המפגש, כי המדריכה תשאל מה עבד.' },
  { q: 'אפשר לקצר או להאריך מפגש?', a: 'כן. לקצר ל־15 דקות מוותרים על הסיום היצירתי ושומרים על הפתיחה והפעילות המרכזית. להאריך ל־30 דקות מוסיפים שיר, סיפור מהעמוד של סיפורי חנוכה לגן, או עוד סבב של הפעילות.' },
  { q: 'האם מדליקים אש אמיתית במפגש?', a: 'לא צריך. כל המערכים עובדים עם פנסים, נרות לד או נרות מנייר. אם הגן מדליק חנוכייה אמיתית, עושים זאת בנפרד ובהשגחה מלאה של מבוגר, בלי קשר למפגש.' },
]

export default function HanukkahCircleTime() {
  const [print, setPrint] = useState(null)
  const plan = CIRCLE_PLANS.find(p => p.id === print)
  const chip = 'rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold'
  return <HanukkahShell crumb="מערכי מפגש לחנוכה">
    <SEO title="מערך מפגש לחנוכה בגן — 6 מערכי מעגל מוכנים ל־20 דקות להדפסה" description="מערכי מפגש מוכנים לחנוכה בגן: אור וחושך, פך השמן, סביבון וספירה, סופגנייה, חנוכייה ולביבה. לכל מערך מטרה, חומרים, פתיחה, שאלה מרכזית, שלבים עם זמנים, התאמה לגן תלת־גילי ופינה לסטודנטית בתצפית. הדפסה בדף אחד. בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">⭕ מערכי מפגש לחנוכה בגן</h1>
    <p className="mx-auto mb-5 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">{CIRCLE_PLANS.length} מערכי מעגל מוכנים, כל אחד 20 דקות. לכל מערך מטרה, חומרים, פתיחה, שאלה מרכזית, פעילות בשלבים, סיום, התאמה לגן תלת־גילי ופסקה לסטודנטית בתצפית. מדפיסים מערך בדף אחד.</p>
    <nav aria-label="קפיצה למערך" className="mb-8 flex flex-wrap justify-center gap-2">
      {CIRCLE_PLANS.map(p => <a key={p.id} href={`#p-${p.id}`} className={chip}>{p.emoji} {p.title}</a>)}
    </nav>

    {CIRCLE_PLANS.map(p => <PlanCard key={p.id} p={p} onPrint={setPrint} />)}

    <section className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="mb-3 text-2xl font-bold">⏱️ מבנה מפגש של 20 דקות</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">
        <li><b>פתיחה (3 דקות):</b> משהו שתופס את העין או האוזן: חפץ מכוסה, חושך, צליל.</li>
        <li><b>שאלה מרכזית:</b> שאלה פתוחה אחת שהמפגש כולו עונה עליה.</li>
        <li><b>פעילות מרכזית (10–12 דקות):</b> ארבעה עד שישה צעדים קצרים, עם חומר ביד.</li>
        <li><b>סיום (4–6 דקות):</b> ציור, שיר או משפט סיכום, וחזרה לשאלה המרכזית.</li>
      </ol>
    </section>

    {plan && <PrintPreview title={`מערך מפגש: ${plan.title}`} onClose={() => setPrint(null)}>
      <PlanSheet p={plan} />
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לגן: <Link className="font-bold underline" to="/holidays/hanukkah/kindergarten-stories">סיפורי חנוכה לגן</Link> · <Link className="font-bold underline" to="/guides/hanukkah-activities-kindergarten">פעילויות חנוכה בגן</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/grade/kindergarten">חנוכה בגן: כל החומרים</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/songs">שירי חנוכה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'מערך מפגש לחנוכה הוא אחד הדברים שגננות וסטודנטיות להוראה מחפשות ברגעי ההכנה לחג: משהו מוכן, קצר, שאפשר לקחת למעגל מחר בבוקר. כאן יש שישה מערכים של 20 דקות, כל אחד סביב סמל אחר של החג: אור וחושך, פך השמן, סביבון, סופגנייה, חנוכייה ולביבה.',
      'כל מערך בנוי בצורה קבועה: מטרה, חומרים, פתיחה, שאלה מרכזית, שלבים עם דקות, סיום, התאמה לגן תלת־גילי וטיפ לסטודנטית בתצפית. אפשר לבחור מערך אחד, לשלב כמה במהלך השבוע, או לצרף את הסיפורים והשירים מהעמודים האחרים.',
    ]} faq={FAQ} related={[{ label: 'סיפורי חנוכה לגן', href: '/holidays/hanukkah/kindergarten-stories' }, { label: 'פעילויות חנוכה בגן', href: '/guides/hanukkah-activities-kindergarten' }, { label: 'חנוכה בגן', href: '/holidays/hanukkah/grade/kindergarten' }, { label: 'שירי חנוכה', href: '/holidays/hanukkah/songs' }]} /></div>
  </HanukkahShell>
}
