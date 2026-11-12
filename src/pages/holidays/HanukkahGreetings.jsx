import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import MiniHanukkiah from '../../components/hanukkah/MiniHanukkiah'
import { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import { wrapLines } from '../../data/hanukkahLighting'
import { GREETING_GROUPS, ALL_GREETINGS, findGreeting, whatsappLink } from '../../data/hanukkahGreetings'

// /holidays/hanukkah/greetings: short original Hanukkah greetings by recipient (kindergarten
// teacher, teacher, staff, kids, family, colleagues). Each one can be copied, opened in WhatsApp,
// or printed as four small cards on one A4 sheet to attach to a gift. Nothing typed leaves the browser.
const PATH = '/holidays/hanukkah/greetings'

const THEMES = {
  color: { ink: '#1e3a8a', gold: '#b7791f', bg: '#f4f7ff', text: '#172554', art: true },
  ink: { ink: '#222', gold: '#555', bg: '#fff', text: '#111', art: false },
}

// One small card, 94 × 129, drawn at (x, y) on the sheet.
function Card({ x, y, text, from, c }) {
  const lines = wrapLines(text, 27)
  const size = lines.length > 5 ? 4.6 : 5.2, gap = lines.length > 5 ? 6.6 : 7.4
  return <g transform={`translate(${x} ${y})`}>
    <rect x="0" y="0" width="94" height="129" rx="6" fill={c.bg} stroke={c.ink} strokeWidth="0.8" />
    <rect x="3" y="3" width="88" height="123" rx="4.5" fill="none" stroke={c.gold} strokeWidth="0.35" strokeDasharray="2 1.4" />
    <g transform="translate(19 31) scale(0.35)"><MiniHanukkiah x={0} y={0} w={160} lit={8} color={c.art} /></g>
    <T x="47" y="57" size="9" weight="800" fill={c.ink}>חג אורים שמח</T>
    {lines.map((l, i) => <T key={i} x="47" y={69 + i * gap} size={size} weight="500" fill={c.text}>{l}</T>)}
    <T x="86" y="113" size="4.4" anchor="start" fill={c.text}>לכבוד: ____________________</T>
    <T x="86" y="121" size="4.4" anchor="start" fill={c.text}>{`מאת: ${from || '____________________'}`}</T>
  </g>
}

function CardsSheet({ text, from, theme }) {
  const c = THEMES[theme]
  return <Sheet label="ארבעה כרטיסי ברכה לחנוכה לגזירה">
    {[[102, 4], [4, 4], [102, 137], [4, 137]].map(([x, y]) => <Card key={x + '-' + y} {...{ x, y, text, from, c }} />)}
    <path d="M100 2 V268 M2 135 H198" stroke="#888" strokeWidth="0.3" strokeDasharray="2.5 2" />
  </Sheet>
}

function GreetingItem({ g, onCard }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(g.text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ }
  }
  const btn = 'min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-3 font-bold'
  return <li className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow-sm">
    <p className="text-lg leading-relaxed">{g.text}</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={copy} className={btn} aria-label={`העתקת הברכה: ${g.text}`}>{copied ? '✓ הועתק' : '📋 העתקה'}</button>
      <a href={whatsappLink(g.text)} target="_blank" rel="noopener noreferrer" className={`${btn} inline-flex items-center`}>💬 לוואטסאפ</a>
      <button type="button" onClick={() => onCard(g.id)} className={btn}>🖨️ לכרטיס</button>
    </div>
  </li>
}

const FAQ = [
  { q: 'מה כותבים בברכה לחנוכה?', a: 'ברכה טובה לחנוכה קצרה: משפט אחד או שניים. כדאי לפתוח בשם או בתפקיד ("לגננת היקרה"), להוסיף דבר אחד שאתם מודים עליו או מאחלים, ולסיים ב"חג אורים שמח" או "חנוכה שמח". דימויים מהחג — אור, נרות, השמש שמדליק את שאר הנרות, סופגניות — הופכים ברכה רגילה לברכה של חנוכה.' },
  { q: 'מה כותבים לגננת או למורה בכרטיס של מתנת חנוכה?', a: 'תודה קצרה ואישית עובדת הכי טוב. אפשר לבחור ברכה מוכנה מהרשימה ולהוסיף בכתב יד משפט על משהו שהילד אוהב בגן או בכיתה. בכרטיסים להדפסה יש שורת "לכבוד" ושורת "מאת", כך שוועד ההורים יכול להדפיס דף אחד ולצרף כרטיס לכל מתנה.' },
  { q: 'איך שולחים את הברכה בוואטסאפ?', a: 'לוחצים על "לוואטסאפ" ליד הברכה. וואטסאפ נפתח עם הטקסט מוכן, ובוחרים למי לשלוח. אפשר גם ללחוץ "העתקה" ולהדביק בכל אפליקציה אחרת. האתר לא שולח שום הודעה בעצמו.' },
  { q: 'אפשר לכתוב ברכה משלי ולהדפיס אותה?', a: 'כן. באזור הכרטיסים יש תיבה לברכה אישית. מה שכותבים נשאר בדפדפן שלכם ומופיע רק בדף שמדפיסים או שומרים כ־PDF.' },
  { q: 'מתי חנוכה 2026?', a: 'חנוכה תשפ״ז מתחיל בערב יום שישי, 4 בדצמבר 2026, עם הדלקת הנר הראשון, והנר השמיני נדלק ב־11 בדצמבר. כדאי לשלוח ברכות ולחלק מתנות לצוות בימים שלפני החופשה.' },
]

export default function HanukkahGreetings() {
  const [group, setGroup] = useState('all'), [chosen, setChosen] = useState('gan-1'), [own, setOwn] = useState('')
  const [from, setFrom] = useState(''), [theme, setTheme] = useState('color'), [print, setPrint] = useState(false)
  const builder = useRef(null)
  const list = group === 'all' ? ALL_GREETINGS : ALL_GREETINGS.filter(g => g.group === group)
  const text = own.trim() || findGreeting(chosen).text
  const toCard = id => { setChosen(id); setOwn(''); builder.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-blue-200' : 'border-[var(--border)] bg-white'}`
  const sheet = <CardsSheet text={text} from={from.trim()} theme={theme} />
  return <HanukkahShell crumb="ברכות לחנוכה">
    <SEO title="ברכות לחנוכה — 36 ברכות קצרות לגננת, למורה, לילדים ולמשפחה" description="ברכות לחנוכה קצרות ומקוריות לפי נמען: לגננת, למורה, לסייעת ולצוות, לילדים, למשפחה ולעובדים. מעתיקים, שולחים בוואטסאפ או מדפיסים 4 כרטיסי ברכה בדף לצירוף למתנה. בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🕎 ברכות לחנוכה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">{ALL_GREETINGS.length} ברכות קצרות ומקוריות, לפי למי כותבים. מעתיקים בלחיצה, שולחים בוואטסאפ, או מדפיסים כרטיס קטן לצרף למתנת החג.</p>

    <div className="mb-6 flex flex-wrap justify-center gap-2" role="group" aria-label="למי הברכה">
      <button type="button" aria-pressed={group === 'all'} onClick={() => setGroup('all')} className={chip(group === 'all')}>✨ כל הברכות</button>
      {GREETING_GROUPS.map(g => <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)} className={chip(group === g.id)}>{g.emoji} {g.label}</button>)}
    </div>

    {GREETING_GROUPS.filter(g => group === 'all' || g.id === group).map(g => <section key={g.id} className="mb-8" aria-labelledby={`h-${g.id}`}>
      <h2 id={`h-${g.id}`} className="mb-3 text-2xl font-bold">{g.emoji} ברכות לחנוכה {g.label}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">{list.filter(x => x.group === g.id).map(x => <GreetingItem key={x.id} g={x} onCard={toCard} />)}</ul>
    </section>)}

    <section ref={builder} className="mb-10 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5" aria-labelledby="cards-h">
      <h2 id="cards-h" className="mb-1 text-2xl font-bold">🖨️ כרטיסי ברכה לחנוכה להדפסה</h2>
      <p className="mb-4 text-lg">ארבעה כרטיסים קטנים בדף A4: גוזרים לאורך הקווים ומצרפים למתנה. בוחרים ברכה מהרשימה (כפתור "לכרטיס"), או כותבים ברכה משלכם.</p>
      <div className="grid items-start gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <p className="rounded-xl bg-white p-3"><b>הברכה בכרטיס:</b> {text}</p>
          <label className="block font-bold">ברכה משלכם (לא חובה)
            <textarea value={own} maxLength={130} rows={3} onChange={e => setOwn(e.target.value)} placeholder="למשל: לגננת היקרה, תודה על שנה מלאה באור..." className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
          </label>
          <Field label="מאת (לא חובה)" value={from} onChange={setFrom} maxLength={28} placeholder="למשל: הורי הגן" />
          <Choice label="עיצוב" value={theme} onChange={setTheme} options={[['color', 'צבעוני'], ['ink', 'חסכוני בדיו']]} />
          <div className="text-center"><button data-print-main type="button" onClick={() => setPrint(true)} className="min-h-[52px] rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white">🖨️ הדפסה או PDF</button></div>
        </div>
        <button type="button" onClick={() => setPrint(true)} aria-label="הדפסת כרטיסי הברכה" className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm">{sheet}</button>
      </div>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="mb-3 text-2xl font-bold">✍️ איך כותבים ברכה אישית לחנוכה</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">
        <li>פותחים במי שמקבל: "לגננת היקרה", "לסבא ולסבתא", "לצוות שלנו".</li>
        <li>מוסיפים דבר אחד מוחשי: על מה אתם מודים, או מה אתם מאחלים לחופשה.</li>
        <li>משלבים תמונה מהחג: אור, נר, השמש שמדליק את האחרים, סופגנייה או סביבון.</li>
        <li>סוגרים ב"חג אורים שמח" או "חנוכה שמח". ילדים יכולים להוסיף ציור קטן או חתימה.</li>
      </ol>
    </section>

    {print && <PrintPreview title="כרטיסי ברכה לחנוכה" onClose={() => setPrint(false)}>
      <article className="buga-a4"><div className="print-art">{sheet}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לחנוכה: <Link className="font-bold underline" to="/gifts/hanukkah-staff">מתנה לצוות לחנוכה</Link> · <Link className="font-bold underline" to="/gifts/hanukkah-kids">מתנות חנוכה לילדים</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/candle-lighting">סדר הדלקת נרות</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'ברכות לחנוכה מחפשים בעיקר בשבועיים שלפני החג: הורים וּועדים שמצרפים כרטיס למתנה לגננת ולמורה, מנהלים שכותבים לעובדים, וכל מי ששולח איחול בוואטסאפ למשפחה ולחברים. כאן כל הברכות מסודרות לפי נמען, כדי למצוא מהר את המתאימה.',
      'כל הברכות בדף נכתבו במיוחד לעוגה בוגה, והן קצרות מספיק לכרטיס קטן או להודעה. אפשר להעתיק, לפתוח ישר בוואטסאפ, או להדפיס דף עם ארבעה כרטיסים זהים — עם שורת "לכבוד" ושורת "מאת" — ולחלק לכל אנשי הצוות.',
    ]} faq={FAQ} related={[{ label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'מתנה לצוות לחנוכה', href: '/gifts/hanukkah-staff' }, { label: 'מחולל ברכות', href: '/greeting' }, { label: 'ברכות וקריאות לחנוכה', href: '/holidays/blessings/hanukkah' }]} /></div>
  </HanukkahShell>
}
