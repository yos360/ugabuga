import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import { toISO, MIN_YEAR, MAX_YEAR, BIRTH_NOTES } from '../../utils/hebrewBirthday'
import { mitzvahPlan } from '../../utils/barMitzvah'
import { crumbs, SpokeNav, GenderChips, inputCls } from './shared'

const PATH = '/bar-mitzvah/date'

const FAQ = [
  { q: 'איך יודעים מתי הבר מצווה?', a: 'לוקחים את תאריך הלידה העברי ומוסיפים 13 שנים עבריות לבן, או 12 לבת. התאריך הלועזי שיוצא יכול להיות רחוק בכמה שבועות מיום ההולדת הלועזי, כי השנה העברית קצרה יותר ובחלק מהשנים יש חודש נוסף. המחשבון עושה את החישוב לפי הלוח העברי הקבוע.' },
  { q: 'למה צריך לדעת אם הלידה הייתה אחרי השקיעה?', a: 'היום העברי מתחיל בערב. מי שנולד אחרי השקיעה נולד כבר בתאריך העברי של היום הבא, וזה יכול להזיז את בר המצווה ביום — ולפעמים גם את השבת והפרשה. אם הלידה הייתה בין השקיעה לצאת הכוכבים, כדאי להתייעץ עם רב.' },
  { q: 'מה קורה למי שנולד באדר?', a: 'בשנה מעוברת יש אדר א׳ ואדר ב׳. מי שנולד באדר של שנה פשוטה, ובר המצווה שלו חלה בשנה מעוברת, חוגג לפי המנהג הרווח באדר ב׳. מי שנולד באדר א׳ או באדר ב׳ של שנה מעוברת חוגג באותו חודש אם גם שנת בר המצווה מעוברת, ובאדר אם היא פשוטה. המחשבון מציג את זה ומסביר כל מקרה.' },
  { q: 'באיזו שבת עולים לתורה?', a: 'בדרך כלל בשבת הראשונה שבה הנער כבר בר מצווה — כלומר בשבת של התאריך עצמו או בזו שאחריו. יש שבוחרים שבת מאוחרת יותר, או עלייה לתורה ביום שני או חמישי. המחשבון מציג ארבע שבתות לבחירה עם הפרשה של כל אחת, וגם את הימים שני וחמישי הקרובים.' },
  { q: 'האם הפרשה בחו״ל זהה לפרשה בארץ?', a: 'לא תמיד. כשיום טוב שני של גלויות חל בשבת, בחו״ל קוראים קריאת חג ובארץ כבר ממשיכים לפרשה הבאה. הפער נמשך כמה שבועות. המחשבון מציג את הלוח של ארץ ישראל ומציין כשבחו״ל קוראים פרשה אחרת.' },
]

const RELATED = [
  { label: 'צ׳קליסט לבר מצווה', href: '/bar-mitzvah/checklist' },
  { label: 'מחולל דרשה לבר מצווה', href: '/bar-mitzvah/speech' },
  { label: 'יום הולדת עברי', href: '/tools/hebrew-birthday' },
]

const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'מחשבון תאריך בר מצווה ובת מצווה',
  'url': 'https://ugabuga.co.il' + PATH,
  'applicationCategory': 'UtilitiesApplication',
  'operatingSystem': 'Any',
  'inLanguage': 'he',
  'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'ILS' },
}

const Card = ({ title, children }) => (
  <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4">
    <h2 className="m-0 mb-2 text-xl font-bold sm:text-2xl">{title}</h2>
    {children}
  </div>
)

function Result({ r }) {
  if (r.status === 'invalid') return null
  if (r.status === 'range') return <p role="status" className="ln-box text-center font-bold">אפשר לבחור תאריך בין {MIN_YEAR} ל־{MAX_YEAR}.</p>
  const m = r.mitzvah
  const boy = m.gender === 'boy'
  const label = boy ? 'בר המצווה' : 'בת המצווה'
  const first = r.shabbatot[0]
  const share = `${label}: ${m.hebrew} (${m.greg})\nשבת: ${first.greg} — ${first.parasha}\n${shareLink(PATH, 'mitzvah-date')}`
  const left = r.daysLeft
  return (
    <div className="space-y-4" aria-live="polite">
      <div className="ln-box bg-[var(--postit)] text-center">
        <p className="m-0 font-bold text-[var(--muted-foreground)]">{label} — גיל {m.age}</p>
        <p className="m-0 font-display text-3xl font-black sm:text-4xl">{m.hebrew}</p>
        <p className="m-0 mt-1 text-lg">{m.greg}</p>
        <p className="m-0 mt-1 text-sm">{boy ? 'מגיע' : 'מגיעה'} למצוות כבר בערב שלפני, עם צאת הכוכבים: {m.eve}.</p>
        {left != null && left > 0 && <p className="m-0 mt-2 font-bold">⏳ עוד {left.toLocaleString('he-IL')} ימים</p>}
        {left != null && left <= 0 && <p className="m-0 mt-2 font-bold">התאריך כבר עבר — מזל טוב!</p>}
        <p className="m-0 mt-2 text-sm text-[var(--muted-foreground)]">תאריך הלידה העברי: {r.birth.hebrew}</p>
      </div>

      {m.moved && <p className="m-0 rounded-2xl border-2 border-[var(--border)] bg-sky-100 p-3 font-bold">בשנת {label} אין ל׳ בחודש הלידה, ולכן התאריך עבר לראש החודש הבא — ראו הסבר למטה.</p>}

      <Card title="📖 שבתות לעלייה לתורה">
        <ul className="m-0 list-none space-y-2 p-0">
          {r.shabbatot.map((s, i) => (
            <li key={s.iso} className="border-b border-dashed border-[var(--border)] pb-2 last:border-b-0">
              <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3">
                <strong>{s.parasha}{i === 0 ? (m.shabbat.sameDay ? ' · ביום התאריך' : ' · הראשונה אחרי התאריך') : ''}</strong>
                <span>{s.greg} · {s.hebrew}</span>
              </p>
              {s.chag && <p className="m-0 text-sm">בשבת הזאת קוראים קריאה של חג ולא פרשה רגילה.</p>}
              {s.differs && <p className="m-0 text-sm">בחו״ל: {s.diaspora}.</p>}
              {s.keys.length > 0 && <Link to={`/bar-mitzvah/speech?parasha=${encodeURIComponent(s.keys[0])}`} className="text-sm font-bold underline">רעיון לדרשה על {s.parasha} ←</Link>}
            </li>
          ))}
        </ul>
        <p className="m-0 mt-2 text-sm text-[var(--muted-foreground)]">לפי לוח הקריאה בארץ ישראל. את השבת המדויקת קובעים יחד עם בית הכנסת.</p>
      </Card>

      <Card title="🗓️ ימי שני וחמישי (קריאה בתורה בחול)">
        <ul className="m-0 grid list-none gap-1 p-0 sm:grid-cols-2">
          {r.weekdays.map(w => <li key={w.iso}>{w.greg} <span className="text-sm text-[var(--muted-foreground)]">· {w.hebrew}{w.special ? ` · ${w.special}` : ''}</span></li>)}
        </ul>
        <p className="m-0 mt-2 text-sm text-[var(--muted-foreground)]">ביום שני וחמישי קוראים את תחילת הפרשה של השבת הקרובה. יש שמעדיפים עלייה לתורה בחול, למשל בכותל.</p>
      </Card>

      {r.tefillin && <Card title="✡️ מתי מתחילים להניח תפילין?">
        <ul className="m-0 list-none space-y-1 p-0">
          <li><strong>כחודש לפני</strong> (המנהג הנפוץ): בסביבות {r.tefillin.month.greg}</li>
          <li><strong>כחודשיים לפני</strong> (למשל מנהג חב״ד): בסביבות {r.tefillin.twoMonths.greg}</li>
          <li><strong>ביום בר המצווה</strong>: יש קהילות שנוהגות להתחיל רק ביום עצמו.</li>
        </ul>
        <p className="m-0 mt-2 text-sm text-[var(--muted-foreground)]">כדאי להזמין את התפילין כשלושה־ארבעה חודשים לפני. את המנהג המדויק שואלים את הרב של הקהילה.</p>
      </Card>}

      {r.notes.length > 0 && <div className="rounded-2xl border-2 border-[var(--border)] bg-sky-100 p-4">
        <p className="m-0 mb-1 font-bold">שימו לב</p>
        {r.notes.map(n => <p key={n} className="m-0 leading-relaxed">{BIRTH_NOTES[n]}</p>)}
      </div>}

      <div className="flex flex-wrap justify-center gap-3">
        <Link to={`/bar-mitzvah/checklist?date=${first.iso}`} className="ln-btn no-underline">✅ צ׳קליסט עם התאריכים</Link>
        <button type="button" className="ln-btn alt" onClick={() => shareOnWhatsApp(share)}>📲 שיתוף בוואטסאפ</button>
      </div>
    </div>
  )
}

export default function MitzvahDate() {
  const [date, setDate] = useState('')
  const [afterSunset, setAfterSunset] = useState(false)
  const [gender, setGender] = useState('boy')
  // "today" is read on input (client-side), so the prerendered page never carries a stale date.
  const [today, setToday] = useState(null)
  const r = date ? mitzvahPlan({ date, afterSunset, gender, today }) : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="מתי הבר מצווה? מחשבון תאריך בר מצווה ובת מצווה עם פרשה" description="מתי הבר מצווה? מזינים תאריך לידה לועזי ומקבלים את תאריך בר המצווה או בת המצווה, את השבת לעלייה לתורה, את הפרשה ומתי מתחילים להניח תפילין." path={PATH} structuredData={[faqSchema(FAQ), APP_SCHEMA]} />
      <Breadcrumbs items={crumbs('מתי הבר מצווה')} />
      <h1 className="mb-2 text-center text-4xl"><span aria-hidden="true">📅 </span>מתי הבר מצווה?</h1>
      <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">מתי הבר מצווה או בת המצווה? מזינים את תאריך הלידה הלועזי, ומקבלים את התאריך העברי של היום הגדול, את השבתות הקרובות עם הפרשה של כל אחת, ומתי מתחילים להניח תפילין.</p>

      <section className="ln-box mb-5 space-y-4" aria-label="מחשבון">
        <label className="block max-w-xs font-bold">
          תאריך לידה (לועזי)
          <input type="date" min={`${MIN_YEAR}-01-01`} max={`${MAX_YEAR}-12-31`} value={date} onChange={e => { setDate(e.target.value); setToday(toISO(new Date())) }} className={inputCls} />
        </label>
        <label className="flex min-h-[44px] items-center gap-3 font-bold">
          <input type="checkbox" checked={afterSunset} onChange={e => setAfterSunset(e.target.checked)} className="h-6 w-6 accent-slate-800" />
          הלידה הייתה אחרי השקיעה 🌙
        </label>
        <div>
          <p className="m-0 mb-2 font-bold">בר מצווה או בת מצווה?</p>
          <GenderChips gender={gender} setGender={setGender} />
        </div>
      </section>

      {r && <Result r={r} />}

      <div className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold">איך מחשבים את תאריך בר המצווה?</h2>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">בר המצווה חלה ביום ההולדת העברי ה־13, ובת המצווה ביום ההולדת העברי ה־12. כדי לחשב, ממירים את תאריך הלידה לתאריך עברי — בלי לשכוח שהיום העברי מתחיל בערב — ומחפשים את אותו תאריך 13 (או 12) שנים עבריות אחר כך. בגלל שהשנה העברית קצרה בכ־11 יום מהלועזית ובחלק מהשנים מוסיפים חודש, התאריך הלועזי של בר המצווה זז ולא תמיד יוצא קרוב ליום ההולדת הלועזי.</p>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">יש שלושה מקרים שבהם החישוב מסתבך: לידה באדר (בגלל אדר א׳ ואדר ב׳ בשנים מעוברות), לידה בל׳ בחשוון או בל׳ בכסלו (חודשים שלפעמים יש בהם רק 29 ימים), ולידה בשעות שאחרי השקיעה. המחשבון מטפל בכולם לפי הכללים המקובלים ומסביר כל מקרה, אבל לפני שסוגרים אולם — כדאי לאשר את התאריך עם הרב או עם בית הכנסת.</p>
        <p className="text-base leading-relaxed text-[var(--foreground)]/80">יש לכם תאריך? השלב הבא הוא <Link to="/bar-mitzvah/checklist" className="font-bold underline">הצ׳קליסט לפי חודשים</Link>, ואם בחרתם שבת — <Link to="/bar-mitzvah/speech" className="font-bold underline">מחולל הדרשה</Link> יציע רעיון מהפרשה. רק יום הולדת עברי? יש גם <Link to="/tools/hebrew-birthday" className="font-bold underline">מחשבון יום הולדת עברי</Link> לכל גיל.</p>
      </div>

      <div className="mt-8"><SeoBody faq={FAQ} related={RELATED} /></div>
      <SpokeNav current={PATH} />
    </div>
  )
}
