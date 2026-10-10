import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import { hebrewParts, gematria } from '../../utils/hebrewCalendar'
import {
  METHODS, EMBRYO_DAYS, TRIMESTERS, CYCLE_MIN, CYCLE_MAX, CYCLE_DEFAULT, PREGNANCY_DAYS,
  analyze, clampCycle, localISO, toDayNumber, formatDateHe, formatGA, formatDays,
} from '../../utils/dueDate'
import '../../learn/learn.css'

const PATH = '/tools/due-date'

const FAQ = [
  { q: 'איך מחשבים תאריך לידה משוער?', a: 'השיטה המקובלת (כלל נגלה) מוסיפה 280 יום — 40 שבועות — ליום הראשון של הווסת האחרונה, בהנחה של מחזור באורך 28 יום. כשהמחזור ארוך או קצר יותר, מזיזים את התאריך בהתאם להפרש: במחזור של 32 יום, למשל, התאריך המשוער מאוחר ב־4 ימים.' },
  { q: 'מה פירוש "שבוע 12 + 3 ימים"?', a: 'זה גיל ההריון: 12 שבועות מלאים ועוד 3 ימים, כלומר באמצע השבוע ה־13. הספירה מתחילה מהיום הראשון של הווסת האחרונה ולא מיום ההתעברות, ולכן בשבועיים הראשונים של "ההריון" עוד לא התרחשה התעברות.' },
  { q: 'כמה מדויק התאריך המשוער?', a: 'זו הערכה בלבד. רק מיעוט קטן מהתינוקות נולדים בדיוק בתאריך המשוער, ולידה בשבועות 37–42 נחשבת לידה במועד. בדיקת אולטרסאונד בשליש הראשון נחשבת לדרך המדויקת ביותר לקבוע את גיל ההריון, ולכן התאריך הקובע הוא זה שקבעו הרופא או הרופאה המטפלים.' },
  { q: 'איך מחשבים תאריך לידה אחרי הפריה חוץ־גופית (IVF)?', a: 'בהריון שהושג בהפריה חוץ־גופית מחשבים לפי תאריך החזרת העובר: מוסיפים 263 יום אם הוחזר עובר בן 3 ימים, ו־261 יום אם הוחזר בלסטוציסט בן 5 ימים. החישוב מבוסס על כך שמההפריה ועד הלידה עוברים בממוצע 266 יום.' },
  { q: 'איך מתחלק ההריון לשלישים?', a: 'במחשבון אנחנו משתמשים בחלוקה הנפוצה: שליש ראשון עד סוף שבוע 13, שליש שני משבוע 14 עד סוף שבוע 27, ושליש שלישי משבוע 28 ועד הלידה. יש מקורות שמחלקים מעט אחרת (למשל שליש שני כבר משבוע 13), ולכן הגבולות הם קירוב.' },
]

const RELATED = [
  { label: 'שמות לתינוקות', href: '/baby-names' },
  { label: 'סיפורים לפני השינה', href: '/stories' },
  { label: 'רעיונות ליום הולדת', href: '/birthday' },
]

const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'מחשבון הריון — תאריך לידה משוער',
  'url': 'https://ugabuga.co.il' + PATH,
  'applicationCategory': 'HealthApplication',
  'operatingSystem': 'Any',
  'inLanguage': 'he',
  'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'ILS' },
}

function hebrewDateOf(iso) {
  const n = toDayNumber(iso)
  if (n === null) return ''
  const d = new Date(n * 86400000)
  const h = hebrewParts(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12))
  return h ? `${gematria(h.day)} ב${h.month} ${gematria(h.year)}` : ''
}

const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>

function Timeline({ weeks }) {
  const pos = weeks == null ? null : Math.min(40, Math.max(0, weeks))
  const colors = ['bg-pink-200', 'bg-amber-200', 'bg-sky-200']
  return <div>
    <div className="relative flex h-10 overflow-hidden rounded-full border-2 border-[var(--border)]">
      {TRIMESTERS.map((t, i) => {
        const span = (i === 2 ? 40 : TRIMESTERS[i + 1].from) - t.from
        return <div key={t.n} className={`${colors[i]} flex items-center justify-center border-[var(--border)] text-xs font-bold sm:text-sm ${i < 2 ? 'border-l-2' : ''}`} style={{ width: `${span / 40 * 100}%` }}>{t.label}</div>
      })}
      {pos !== null && <div className="absolute inset-y-0 w-1 bg-[var(--border)]" style={{ right: `calc(${pos / 40 * 100}% - 2px)` }} aria-hidden="true" />}
    </div>
    <div className="relative mt-1 h-4 text-xs text-[var(--muted-foreground)]" aria-hidden="true">
      {[0, 14, 28, 40].map(w => <span key={w} className="absolute" style={w === 40 ? { left: 0 } : { right: `calc(${w / 40 * 100}% - ${w ? 6 : 0}px)` }}>{w}</span>)}
    </div>
    <p className="m-0 text-xs text-[var(--muted-foreground)]">שבועות הריון{pos !== null ? ' · הקו מסמן איפה אתם היום' : ''}</p>
  </div>
}

function Result({ r, method }) {
  if (r.status === 'invalid') return null
  if (r.status === 'future') return <p role="status" className="ln-box text-center font-bold">התאריך שבחרתם עוד לא הגיע 🙂 בחרו תאריך מהיום או מלפניו.</p>
  if (r.status === 'tooOld') return <p role="status" className="ln-box text-center font-bold">התאריך שבחרתם רחוק מדי — יותר מ־44 שבועות אחורה. כדאי לבדוק שהשנה והחודש נכונים.</p>
  const heb = hebrewDateOf(r.due)
  const dueText = formatDateHe(r.due)
  return <div className="ln-box space-y-4 bg-[var(--postit)] text-center" aria-live="polite">
    <div>
      <p className="m-0 font-bold text-[var(--muted-foreground)]">תאריך לידה משוער</p>
      <p className="m-0 font-display text-3xl font-black sm:text-4xl">{dueText}</p>
      {heb && <p className="m-0 mt-1 text-lg">{heb}</p>}
    </div>
    {r.ga && <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3">
          <p className="m-0 text-sm text-[var(--muted-foreground)]">גיל ההריון היום</p>
          <p className="m-0 text-xl font-black">{formatGA(r.ga)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3">
          <p className="m-0 text-sm text-[var(--muted-foreground)]">שליש</p>
          <p className="m-0 text-xl font-black">{TRIMESTERS[r.trimester - 1].label}</p>
        </div>
        <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3">
          <p className="m-0 text-sm text-[var(--muted-foreground)]">{r.overdue ? 'מאז התאריך המשוער' : 'עד התאריך המשוער'}</p>
          <p className="m-0 text-xl font-black">{r.overdue ? `עברו ${formatDays(r.overdue)}` : r.remaining === 0 ? 'זה היום!' : formatDays(r.remaining)}</p>
        </div>
      </div>
      <div>
        <div className="h-4 overflow-hidden rounded-full border-2 border-[var(--border)] bg-[var(--card)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.progress} aria-label="התקדמות ההריון">
          <div className="h-full bg-[#7dd87a]" style={{ width: `${r.progress}%` }} />
        </div>
        <p className="m-0 mt-1 text-sm">{r.progress}% מתוך {PREGNANCY_DAYS} ימים (40 שבועות)</p>
      </div>
      <Timeline weeks={r.ga.total / 7} />
    </>}
    <p className="m-0 text-sm text-[var(--muted-foreground)]">חושב לפי {METHODS.find(m => m.id === method)?.label}.</p>
    <button type="button" className="ln-btn alt" onClick={() => shareOnWhatsApp(`תאריך לידה משוער: ${dueText} 🍼\n${shareLink(PATH, 'due-date')}`)}>📲 שיתוף בוואטסאפ</button>
  </div>
}

export default function DueDate() {
  const [method, setMethod] = useState('lmp')
  const [date, setDate] = useState('')
  const [cycle, setCycle] = useState(CYCLE_DEFAULT)
  const [embryoDay, setEmbryoDay] = useState(5)
  // "today" is read when a date is entered (client-side), so the prerendered page never carries a stale date.
  const [today, setToday] = useState(null)
  const pickDate = v => { setDate(v); setToday(localISO(new Date())) }

  const r = date ? analyze({ method, date, cycle, embryoDay }, today) : null
  const m = METHODS.find(x => x.id === method)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="מחשבון הריון — תאריך לידה משוער ושבוע הריון" description="מחשבון הריון: מחשבים תאריך לידה משוער לפי הווסת האחרונה, תאריך ההתעברות או החזרת עובר ב־IVF, ורואים מה שבוע ההריון והשליש — חינם, בלי הרשמה." path={PATH} structuredData={[faqSchema(FAQ), APP_SCHEMA]} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מחשבון הריון' }]} />
      <h1 className="mb-2 text-center text-4xl"><span aria-hidden="true">🤰 </span>מחשבון הריון — תאריך לידה משוער</h1>
      <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">בוחרים שיטת חישוב ותאריך — ומקבלים תאריך לידה משוער, שבוע הריון ושליש.</p>

      <section className="ln-box mb-5 space-y-4" aria-label="מחשבון">
        <div>
          <p className="m-0 mb-2 font-bold">לפי מה לחשב?</p>
          <div className="flex flex-wrap gap-2">
            {METHODS.map(x => <Chip key={x.id} on={method === x.id} onClick={() => setMethod(x.id)}>{x.label}</Chip>)}
          </div>
        </div>
        <label className="block font-bold">
          {m.dateLabel}
          <input type="date" value={date} onChange={e => pickDate(e.target.value)} className="mt-1 block w-full max-w-xs rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-lg" />
        </label>
        {method === 'lmp' && <label className="block font-bold">
          אורך המחזור: {clampCycle(cycle)} ימים
          <input type="range" min={CYCLE_MIN} max={CYCLE_MAX} step="1" value={clampCycle(cycle)} onChange={e => setCycle(+e.target.value)} className="mt-2 block w-full max-w-xs" aria-valuetext={`${clampCycle(cycle)} ימים`} />
          <span className="block text-sm font-normal text-[var(--muted-foreground)]">לא בטוחים? השאירו 28 ימים — זה האורך שהחישוב המקובל מניח.</span>
        </label>}
        {method === 'ivf' && <div>
          <p className="m-0 mb-2 font-bold">גיל העובר בהחזרה</p>
          <div className="flex flex-wrap gap-2">
            {EMBRYO_DAYS.map(d => <Chip key={d} on={embryoDay === d} onClick={() => setEmbryoDay(d)}>{d === 5 ? 'יום 5 (בלסטוציסט)' : 'יום 3'}</Chip>)}
          </div>
        </div>}
      </section>

      {r && <Result r={r} method={method} />}

      <p className="mt-5 rounded-2xl border-2 border-dashed border-[var(--border)] p-3 text-sm leading-relaxed">
        <strong>חשוב לדעת:</strong> זו הערכה בלבד ולא ייעוץ רפואי. רק מיעוט קטן מהתינוקות נולדים בדיוק בתאריך המשוער, והתאריך הקובע הוא זה שקבעו הרופא או הרופאה, בדרך כלל לפי בדיקת אולטרסאונד. שום פרט שמוזן כאן לא נשמר — החישוב נעשה בדפדפן בלבד.
      </p>

      <div className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-2xl font-bold">איך מחושב תאריך הלידה המשוער?</h2>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">הריון ממוצע נמשך 40 שבועות, כלומר 280 יום, כשהספירה מתחילה ביום הראשון של הווסת האחרונה — ולא ביום ההתעברות, שבדרך כלל קשה לדעת בדיוק מתי היה. זה הבסיס של כלל נגלה, השיטה הוותיקה והנפוצה ביותר לחישוב תאריך לידה משוער.</p>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">החישוב מניח מחזור של 28 יום, שבו הביוץ מתרחש בערך ביום ה־14. כשהמחזור ארוך יותר, הביוץ מתרחש בדרך כלל מאוחר יותר, ולכן המחשבון מוסיף את ההפרש: במחזור של 30 יום התאריך המשוער מאוחר ביומיים, ובמחזור של 25 יום הוא מוקדם ב־3 ימים. אם תאריך ההתעברות ידוע, מוסיפים לו 266 יום (38 שבועות). בהפריה חוץ־גופית מחשבים לפי יום החזרת העובר: 263 יום לעובר בן 3 ימים, ו־261 יום לבלסטוציסט בן 5 ימים.</p>
        <h2 className="text-2xl font-bold">שבוע הריון ושלישים</h2>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">גיל ההריון נכתב בשבועות מלאים ועוד ימים — למשל "שבוע 20 + 4 ימים". המחשבון סופר מהתאריך המשוער אחורה, כך ש־40 שבועות בדיוק נופלים על תאריך הלידה המשוער. ההריון מחולק לשלושה שלישים: הראשון עד סוף שבוע 13, השני משבוע 14 עד סוף שבוע 27, והשלישי משבוע 28 ועד הלידה.</p>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">חשוב לזכור שמדובר בהערכה. רוב הלידות מתרחשות בטווח של כמה שבועות סביב התאריך המשוער, ולידה בין שבוע 37 לשבוע 42 נחשבת לידה במועד. בבדיקת האולטרסאונד הראשונה הרופא או הרופאה עשויים לעדכן את התאריך לפי מדידות העובר — ואז כדאי להתייחס לתאריך המעודכן.</p>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">ומה עושים עם כל הזמן הזה עד הלידה? אפשר להתחיל לחשוב על שם — ב<Link to="/baby-names" className="font-bold underline">מאגר השמות לתינוקות</Link> מחכים לכם רעיונות.</p>
      </div>

      <div className="mt-8">
        <SeoBody faq={FAQ} related={RELATED} />
      </div>
    </div>
  )
}
