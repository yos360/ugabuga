import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import TodayGame, { dateLabel, loadDay } from '../components/home/TodayGame'
import { faqSchema } from '../components/ui/SeoBody'
import { gematria, hebrewParts, holidayMap, dayKey, HEB_DAYS } from '../utils/hebrewCalendar'
import { TT_EXTRA } from '../data/timeTunnelExtra'
import '../pages/Home.css'

const pad = n => String(n).padStart(2, '0')
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const MONTH_LEN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
// Every date of the year (with 29.2): each one has its own indexable page /time-tunnel/MM-DD.
export const ALL_DATES = MONTH_LEN.flatMap((len, m) => Array.from({ length: len }, (_, d) => `${pad(m + 1)}-${pad(d + 1)}`))
const DAY_FILES = import.meta.glob('../data/today/*.json')

async function loadSpecialDays(key) { // verified special days only (yo-yoo / Wikipedia) + Wikipedia events
  const loader = DAY_FILES[`../data/today/${key.slice(0, 2)}.json`]
  if (!loader) return { days: [], events: [] }
  const mod = await loader()
  const v = (mod.default || mod)[key] || {}
  return { days: (v.days || []).filter(d => d.src === 'yo-yoo' || d.src === 'wikipedia'), events: (v.events || []).filter(e => e.src === 'wikipedia') }
}

const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SEASONS = ['חורף', 'חורף', 'אביב', 'אביב', 'אביב', 'קיץ', 'קיץ', 'קיץ', 'סתיו', 'סתיו', 'סתיו', 'חורף']
// One short, true note per month — where its name comes from and what's special about it.
const MONTH_NOTES = [
  'ינואר נקרא על שם יאנוס, האל הרומי בעל שני הפרצופים – אחד מביט אל השנה שעברה והשני אל השנה החדשה. בישראל הוא מהחודשים הקרים והגשומים בשנה.',
  'פברואר נקרא על שם "פברואה", טקס טיהור רומי שנערך בחודש הזה. הוא החודש הקצר ביותר: 28 ימים, ובשנה מעוברת 29.',
  'מרץ נקרא על שם מרס, אל המלחמה הרומי, ובלוח הרומי הקדום הוא היה החודש הראשון בשנה. בסביבות 20 במרץ חל השוויון האביבי – היום שבו היום והלילה ארוכים בערך באותה מידה.',
  'מקור השם אפריל לא ידוע בוודאות. לפי אחת ההשערות הוא קשור למילה הלטינית aperire – "לפתוח", כמו הפרחים שנפתחים באביב.',
  'מאי נקרא על שם מאיה, אלה מהמיתולוגיה הרומית. בישראל זה סוף האביב, והימים כבר ארוכים וחמים.',
  'יוני נקרא על שם יונו, מלכת האלים במיתולוגיה הרומית. בסביבות 21 ביוני חל היום הארוך ביותר בשנה בחצי הכדור הצפוני.',
  'יולי נקרא על שם יוליוס קיסר, שנולד בחודש הזה. בישראל הוא מהחודשים החמים ביותר – זה לב החופש הגדול.',
  'אוגוסט נקרא על שם אוגוסטוס, הקיסר הראשון של רומא. גם הוא מהחודשים החמים ביותר בישראל.',
  'השם ספטמבר בא מהמילה הלטינית septem – "שבע", כי בלוח הרומי הקדום הוא היה החודש השביעי. בסביבות 22 בספטמבר חל השוויון הסתווי.',
  'השם אוקטובר בא מהמילה הלטינית octo – "שמונה" (כמו octopus, התמנון בעל שמונה הזרועות), כי בלוח הרומי הקדום הוא היה החודש השמיני.',
  'השם נובמבר בא מהמילה הלטינית novem – "תשע", כי בלוח הרומי הקדום הוא היה החודש התשיעי. בישראל הימים מתקצרים והגשמים הראשונים כבר מגיעים.',
  'השם דצמבר בא מהמילה הלטינית decem – "עשר", כי בלוח הרומי הקדום הוא היה החודש העשירי. בסביבות 21 בדצמבר חל היום הקצר ביותר בשנה בחצי הכדור הצפוני.',
]
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
const daysWord = n => n === 1 ? 'יום אחד' : n === 2 ? 'יומיים' : `${n} ימים`

// Calendar facts computed for this date: day of year, season, the next two occurrences
// (weekday + Hebrew date) and Israeli holidays within a week of it.
function calendarInfo(dateKey) {
  const m = +dateKey.slice(0, 2), d = +dateKey.slice(3)
  const leapDay = m === 2 && d === 29
  const years = []
  for (let y = new Date().getFullYear(); years.length < 2; y++) if (!leapDay || isLeap(y)) years.push(y)
  const occ = years.map(y => {
    const dt = new Date(y, m - 1, d), h = hebrewParts(dt)
    return { y, dt, dow: HEB_DAYS[dt.getDay()], heb: h ? `${gematria(h.day)} ב${h.month} ${gematria(h.year)}` : '' }
  })
  const doy = leapDay ? 60 : Math.round((Date.UTC(2025, m - 1, d) - Date.UTC(2025, 0, 1)) / 864e5) + 1
  const base = occ[0].dt
  const map = holidayMap(new Date(base.getFullYear(), m - 1, d - 7), new Date(base.getFullYear(), m - 1, d + 7))
  const holidays = []
  for (const i of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7]) { // closest first, so a multi-day holiday shows its nearest day
    const day = new Date(base.getFullYear(), m - 1, d + i)
    let name = map.get(dayKey(day))
    if (!name) continue
    if (name === 'חול המועד') name = `חול המועד ${hebrewParts(day)?.month === 'ניסן' ? 'פסח' : 'סוכות'}`
    const group = name.startsWith('חנוכה') ? 'חנוכה' : name
    if (!holidays.some(h => h.group === group)) holidays.push({ name, group, diff: i })
  }
  holidays.sort((x, y) => x.diff - y.diff)
  return { m, d, leapDay, occ, doy, season: SEASONS[m - 1], note: MONTH_NOTES[m - 1], holidays }
}
const holidayText = h => h.diff === 0 ? `${h.name} – בדיוק בתאריך הזה` : `${h.name} – ${daysWord(Math.abs(h.diff))} ${h.diff > 0 ? 'אחרי' : 'לפני'}`

const factText = q => {
  const t = q.options[q.answer]
  if (q.type === 'day') return `מציינים את ${t}`
  if (q.person) return `נולד/ה: ${t}`
  return t
}

// /time-tunnel — today's game + a calendar of every date. /time-tunnel/MM-DD — one date's page:
// "what happened on this date" facts with sources (indexable), and the date's game once the date arrives.
export default function MaHayom() {
  const { day } = useParams()
  const isDate = !!day && ALL_DATES.includes(day)
  return isDate ? <DatePage key={day} dateKey={day} /> : <Hub badDay={!!day} />
}

function useToday() {
  const [now] = useState(() => new Date())
  return `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function Calendar({ current, today, month }) {
  // month (1-12): render only that month — date pages link just their own month
  // plus prev/next, so the full-year archive lives only on the /time-tunnel hub.
  const months = month ? [[MONTHS[month - 1], month - 1]] : MONTHS.map((name, m) => [name, m])
  return (
    <div className="tt-cal">
      {months.map(([name, m]) => (
        <div key={name} className="tt-cal-month">
          <h3>{name}</h3>
          <div className="tt-cal-days">
            {ALL_DATES.filter(k => +k.slice(0, 2) === m + 1).map(k => (
              <Link key={k} to={`/time-tunnel/${k}`} title={`מה קרה ב-${dateLabel(k)}?`}
                className={k === current ? 'is-current' : k === today ? 'is-today' : ''}>{+k.slice(3)}</Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Hub({ badDay }) {
  const today = useToday()
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SEO title="מנהרת הזמן של בוגה – מה קרה היום? משחק גילוי יומי" description="כל יום כמה דברים אמיתיים שקרו בדיוק בתאריך הזה – ימים מיוחדים, אירועים היסטוריים ומי נולד היום. מגלים בעזרת רמזים, ולכל תאריך בשנה יש דף משלו." path="/time-tunnel" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מנהרת הזמן של בוגה' }]} />
      <h1 className="mh-page-title">⏳ מנהרת הזמן של בוגה</h1>
      {badDay && <p className="mh-note">לא מצאנו את התאריך הזה 🙂 הנה המשחק של היום:</p>}
      <TodayGame hideTitle fallback={<p className="mh-note">עוד אין משחק להיום – בחרו תאריך מלוח השנה.</p>} />
      <section id="archive" className="mh-archive">
        <h2>📅 מה קרה ב…? כל התאריכים בשנה</h2>
        <p className="mh-note tt-lead">בחרו תאריך – יום ההולדת שלכם, של חבר או סתם יום – וגלו מה קרה בו.</p>
        <Calendar today={today} />
        <p className="mh-about">העובדות נאספו ממקורות כמו ויקיפדיה בעברית ובאנגלית ואתרי ימים מיוחדים, ואנחנו משתדלים לבדוק כל אחת מהן — אבל גם אנחנו יכולים לטעות. מצאתם טעות? יש כפתור "מצאתי טעות" בכל שאלה.</p>
      </section>
    </div>
  )
}

function DatePage({ dateKey }) {
  const today = useToday()
  const [data, setData] = useState(null) // {qs, days, events}
  useEffect(() => {
    let alive = true
    Promise.all([loadDay(dateKey), loadSpecialDays(dateKey)])
      .then(([qs, sp]) => { if (alive) setData({ qs: qs || [], ...sp }) })
      .catch(() => { if (alive) setData({ qs: [], days: [], events: [] }) })
    return () => { alive = false }
  }, [dateKey])

  const label = dateLabel(dateKey)
  const playable = dateKey <= today
  const cal = calendarInfo(dateKey)
  const facts = data ? data.qs.filter(q => q.type !== 'day').sort((a, b) => a.year - b.year) : []
  const gameDays = data ? data.qs.filter(q => q.type === 'day').map(q => q.options[q.answer]) : []
  const dayNames = data ? [...new Set([...gameDays, ...data.days.map(d => d.name)])] : []
  // Shown openly (not part of the game, so no spoilers): hand-checked extras + Wikipedia events
  // whose year isn't already a game question.
  const extra = TT_EXTRA[dateKey]
  const wikiSrc = extra?.src || `https://en.wikipedia.org/wiki/${EN_MONTHS[cal.m - 1]}_${cal.d}`
  const gameYears = new Set(facts.map(q => q.year))
  const more = data ? [
    ...(extra?.items || []).map(x => ({ ...x, src: extra.src })),
    ...data.events.filter(e => !gameYears.has(e.year) && !(extra?.items || []).some(x => x.year === e.year)).map(e => ({ ...e, kind: 'event', src: wikiSrc })),
  ].sort((a, b) => (a.year ?? -1e4) - (b.year ?? -1e4)) : []
  const openDays = [...new Set([...more.filter(x => x.kind === 'day').map(x => x.text.split(' – ')[0]), ...(data ? data.days.map(d => d.name).filter(n => !gameDays.includes(n)) : [])])]
  const datedMore = more.filter(x => x.kind !== 'day')
  const i = ALL_DATES.indexOf(dateKey)
  const around = [-3, -2, -1, 1, 2, 3].map(n => ALL_DATES[(i + n + ALL_DATES.length) % ALL_DATES.length])
  // SEO: short title (<=60 with the auto " | UGABUGA" suffix) and a <=160-char
  // description built from the first fact only, truncated on a word boundary.
  const first = facts.length ? factText(facts[0]).replace(/[.،]+$/, '') : ''
  const tail = 'ימים מיוחדים ומי נולד – עם מקורות ומשחק לילדים.'
  let description = `מה קרה ב-${label}? ${first ? first + ' ועוד. ' : ''}${tail}`
  if (description.length > 160 && first) description = `מה קרה ב-${label}? ${first ? first + ' ועוד. ' : ''}` // drop tail
  if (description.length > 160) {
    const cut = description.slice(0, 159)
    description = cut.slice(0, cut.lastIndexOf(' ')) + '…'
  }

  const [o1, o2] = cal.occ
  const doyText = cal.leapDay
    ? `${label} מופיע רק בשנה מעוברת – פעם בארבע שנים בערך – והוא היום ה-60 בשנה.`
    : `${label} הוא היום ה-${cal.doy} בשנה${cal.m > 2 ? ` (וה-${cal.doy + 1} בשנה מעוברת)` : ''}, ואחריו נשארים עוד ${daysWord(365 - cal.doy)} עד סוף השנה.`
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const when = o => `${o.dt < todayStart ? 'חל' : 'יחול'} ביום ${o.dow}${o.heb ? ` (${o.heb})` : ''}`
  const occText = `${label} ${when(o1)} בשנת ${o1.y}, ו${when(o2)} בשנת ${o2.y}.`
  const sent = t => /[.!?]$/.test(t) ? t : t + '.'
  const nDays = new Set([...dayNames, ...openDays]).size, nFacts = facts.length + datedMore.length
  const part = cal.d <= 10 ? 'תחילת' : cal.d <= 20 ? 'אמצע' : 'סוף'
  const found = [nDays && (nDays === 1 ? 'יום מיוחד אחד' : `${nDays} ימים מיוחדים`), nFacts && (nFacts === 1 ? 'אירוע אחד' : `${nFacts} אירועים ואנשים שנולדו`)].filter(Boolean).reduce((acc, t) => acc ? `${acc} ו${/^\d/.test(t) ? '-' : ''}${t}` : t, '')
  const lead = `${label} – ${part} ${MONTHS[cal.m - 1]}, עונת ה${cal.season}. ${datedMore[0] ? `ב-${datedMore[0].year} ${sent(datedMore[0].text)} ` : ''}בדף הזה מחכים לכם ${found ? found + ' בתאריך הזה' : 'עובדות על התאריך הזה'}, התאריך העברי והיום בשבוע שבו הוא יחול.`
  const faq = [
    datedMore.length > 0 && { q: `מה קרה ב-${label}?`, a: datedMore.slice(0, 3).map(x => sent(`ב-${x.year} ${x.text}`)).join(' ') },
    openDays.length > 0 && { q: `מה מציינים ב-${label}?`, a: `ב-${label} מציינים בין השאר את ${openDays.slice(0, 3).join(', ')}.` },
    { q: `באיזה יום בשבוע יחול ${label} ${o2.y}?`, a: `ביום ${o2.dow}${o2.heb ? `, ובלוח העברי – ${o2.heb}` : ''}. בשנת ${o1.y} הוא ${when(o1)}.` },
    !cal.leapDay && { q: `איזה יום בשנה הוא ${label}?`, a: `זה היום ה-${cal.doy} בשנה רגילה${cal.m > 2 ? ` וה-${cal.doy + 1} בשנה מעוברת` : ''}.` },
    cal.holidays.length > 0 && { q: `אילו חגים חלים ליד ${label} ב-${o1.y}?`, a: `ב-${o1.y}: ${cal.holidays.map(holidayText).join('; ')}.` },
  ].filter(Boolean)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SEO title={`${label} – מה קרה ומה מציינים בתאריך הזה? מנהרת הזמן`} description={description} path={`/time-tunnel/${dateKey}`} structuredData={data ? faqSchema(faq) : null} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מנהרת הזמן של בוגה', href: '/time-tunnel' }, { label }]} />
      <h1 className="mh-page-title">⏳ מה קרה ב-{label}?</h1>
      <p className="mh-note tt-lead">{lead}</p>

      {playable
        ? <TodayGame dateKey={dateKey} archive={dateKey !== today} hideTitle fallback={null} />
        : <p className="mh-note tt-soon">🎮 המשחק של {label} ייפתח בתאריך עצמו. בינתיים – הנה מה שקרה בו:</p>}

      <section className="tt-facts" aria-label={`עובדות על ${label}`}>
        <details open={!playable}>
          <summary>{playable ? `💡 כל התשובות: מה קרה ב-${label}? (ספוילר למשחק)` : `💡 מה קרה ב-${label}?`}</summary>
          {data && (
            <div className="tt-facts-body">
              {dayNames.length > 0 && <>
                <h2>🗓️ ימים מיוחדים ב-{label}</h2>
                <ul>{dayNames.map(n => <li key={n}>{n}</li>)}</ul>
              </>}
              {facts.length > 0 && <>
                <h2>📜 אירועים ואנשים שנולדו ב-{label}</h2>
                <ul className="tt-fact-list">
                  {facts.map(q => (
                    <li key={q.clue}>
                      <span className="tt-year">{q.year < 0 ? `${-q.year} לפנה"ס` : q.year}</span>
                      <div><b>{q.emoji} {factText(q)}</b><p>{q.explain} <a href={q.source} target="_blank" rel="noopener noreferrer">מקור</a></p></div>
                    </li>
                  ))}
                </ul>
              </>}
            </div>
          )}
        </details>
      </section>

      {more.length > 0 && (
        <section className="tt-facts" aria-label={`עוד מ-${label}`}>
          <div className="rounded-2xl border-2 border-[#222] bg-white px-4 py-3">
            <h2>✨ עוד דברים שקרו ב-{label}</h2>
            <p className="text-[15px] text-[#4d556a]">אלה לא חלק מהמשחק – אפשר לקרוא בלי חשש מספוילרים.</p>
            <ul className="tt-fact-list">
              {more.map(x => (
                <li key={x.text}>
                  <span className="tt-year">{x.kind === 'day' ? 'כל שנה' : x.year}</span>
                  <div><b>{x.emoji} {x.text}</b> <a href={x.src} target="_blank" rel="noopener noreferrer">מקור</a></div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="tt-facts" aria-label={`${label} בלוח השנה`}>
        <div className="rounded-2xl border-2 border-[#222] bg-[#fff6d6] px-4 py-3">
          <h2>📆 {label} בלוח השנה</h2>
          <ul>
            <li>{doyText}</li>
            <li>{occText}</li>
            <li>עונה: {cal.season} (בחצי הכדור הצפוני, וגם בישראל).</li>
            {cal.holidays.length > 0 && <li>חגים ומועדים קרובים ב-{o1.y}: {cal.holidays.map(holidayText).join('; ')}.</li>}
          </ul>
          <p className="mt-2">{cal.note}</p>
        </div>
      </section>

      {faq.length > 0 && (
        <section className="tt-facts" aria-label="שאלות נפוצות">
          <h2>שאלות נפוצות על {label}</h2>
          {faq.map(f => <div key={f.q} className="mb-3"><p className="font-bold">{f.q}</p><p>{f.a}</p></div>)}
        </section>
      )}

      <nav className="tt-prevnext" aria-label="תאריכים סמוכים">
        {around.slice(0, 3).map(k => <Link key={k} to={`/time-tunnel/${k}`}>→ {dateLabel(k)}</Link>)}
        <Link to="/time-tunnel">היום במנהרת הזמן</Link>
        {around.slice(3).map(k => <Link key={k} to={`/time-tunnel/${k}`}>{dateLabel(k)} ←</Link>)}
      </nav>
      <p className="mh-note">נולדתם ב-{label}? <Link to="/tools/birthday-famous" className="underline font-bold">גלו אילו מפורסמים נולדו ביום ההולדת שלכם</Link> · <Link to="/printables/calendar-5787" className="underline font-bold">לוח שנה עברי להדפסה</Link> · <Link to="/printables/calendar-2027" className="underline font-bold">לוח שנה 2027</Link></p>

      <section className="mh-archive">
        <h2>📅 תאריכים נוספים ב{MONTHS[+dateKey.slice(0, 2) - 1]}</h2>
        <Calendar current={dateKey} today={today} month={+dateKey.slice(0, 2)} />
        <p className="mh-note"><Link to="/time-tunnel#archive">לכל התאריכים בשנה — לוח הארכיון המלא ←</Link></p>
      </section>
    </div>
  )
}
