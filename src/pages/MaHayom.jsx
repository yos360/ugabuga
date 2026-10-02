import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import TodayGame, { dateLabel, loadDay } from '../components/home/TodayGame'
import '../pages/Home.css'

const pad = n => String(n).padStart(2, '0')
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const MONTH_LEN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
// Every date of the year (with 29.2): each one has its own indexable page /time-tunnel/MM-DD.
export const ALL_DATES = MONTH_LEN.flatMap((len, m) => Array.from({ length: len }, (_, d) => `${pad(m + 1)}-${pad(d + 1)}`))
const DAY_FILES = import.meta.glob('../data/today/*.json')

async function loadSpecialDays(key) { // verified special days only (yo-yoo / Wikipedia)
  const loader = DAY_FILES[`../data/today/${key.slice(0, 2)}.json`]
  if (!loader) return []
  const mod = await loader()
  return ((mod.default || mod)[key]?.days || []).filter(d => d.src === 'yo-yoo' || d.src === 'wikipedia')
}

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
        <p className="mh-about">כל העובדות נבדקו מול מקורות (ויקיפדיה בעברית ובאנגלית, ואתרי ימים מיוחדים), וליד כל עובדה יש קישור למקור. מצאתם טעות? יש כפתור "מצאתי טעות" בכל שאלה.</p>
      </section>
    </div>
  )
}

function DatePage({ dateKey }) {
  const today = useToday()
  const [data, setData] = useState(null) // {qs, days}
  useEffect(() => {
    let alive = true
    Promise.all([loadDay(dateKey), loadSpecialDays(dateKey)])
      .then(([qs, days]) => { if (alive) setData({ qs: qs || [], days }) })
      .catch(() => { if (alive) setData({ qs: [], days: [] }) })
    return () => { alive = false }
  }, [dateKey])

  const label = dateLabel(dateKey)
  const playable = dateKey <= today
  const facts = data ? data.qs.filter(q => q.type !== 'day').sort((a, b) => a.year - b.year) : []
  const dayNames = data ? [...new Set([...data.qs.filter(q => q.type === 'day').map(q => q.options[q.answer]), ...data.days.map(d => d.name)])] : []
  const i = ALL_DATES.indexOf(dateKey)
  const prev = ALL_DATES[(i + ALL_DATES.length - 1) % ALL_DATES.length], next = ALL_DATES[(i + 1) % ALL_DATES.length]
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SEO title={`מה קרה ב-${label}? מנהרת הזמן`} description={description} path={`/time-tunnel/${dateKey}`} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מנהרת הזמן של בוגה', href: '/time-tunnel' }, { label }]} />
      <h1 className="mh-page-title">⏳ מה קרה ב-{label}?</h1>
      <p className="mh-note tt-lead">ב-{label} קרו לא מעט דברים מעניינים. כאן תמצאו ימים מיוחדים, אירועים היסטוריים ואנשים מפורסמים שנולדו בתאריך הזה – כל עובדה עם קישור למקור.</p>

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

      <nav className="tt-prevnext" aria-label="תאריכים סמוכים">
        <Link to={`/time-tunnel/${prev}`}>→ {dateLabel(prev)}</Link>
        <Link to="/time-tunnel">היום במנהרת הזמן</Link>
        <Link to={`/time-tunnel/${next}`}>{dateLabel(next)} ←</Link>
      </nav>

      <section className="mh-archive">
        <h2>📅 תאריכים נוספים ב{MONTHS[+dateKey.slice(0, 2) - 1]}</h2>
        <Calendar current={dateKey} today={today} month={+dateKey.slice(0, 2)} />
        <p className="mh-note"><Link to="/time-tunnel#archive">לכל התאריכים בשנה — לוח הארכיון המלא ←</Link></p>
      </section>
    </div>
  )
}
