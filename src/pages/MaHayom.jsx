import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import TodayGame, { availableMonths, dateLabel } from '../components/home/TodayGame'
import '../pages/Home.css'

const pad = n => String(n).padStart(2, '0')

// /time-tunnel (also /ma-hayom) — today's game plus an archive of past dates; /ma-hayom/MM-DD plays one past date.
export default function MaHayom() {
  const { day } = useParams()
  const [now] = useState(() => new Date())
  const today = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const [days, setDays] = useState([])
  const valid = day && /^\d\d-\d\d$/.test(day) && day <= today
  const key = valid ? day : null

  useEffect(() => { // past dates (this calendar year) that have a ready-made game
    let alive = true
    Promise.all(availableMonths().filter(m => m <= today.slice(0, 2)).map(m => import(`../data/today-game/${m}.json`)))
      .then(mods => { if (alive) setDays(mods.flatMap(m => Object.keys(m.default || m)).filter(k => k < today).sort().reverse()) })
      .catch(() => {})
    return () => { alive = false }
  }, [today])

  const title = key ? `מה קרה ב-${dateLabel(key)}? – מנהרת הזמן של בוגה` : 'מנהרת הזמן של בוגה – משחק גילוי יומי'
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SEO title={title} description="כל יום כמה דברים אמיתיים שקרו בדיוק בתאריך הזה – ימים מיוחדים, אירועים היסטוריים ומי נולד היום. מגלים בעזרת רמזים." path={key ? `/time-tunnel/${key}` : '/time-tunnel'} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מנהרת הזמן של בוגה', href: key ? '/time-tunnel' : undefined }, ...(key ? [{ label: dateLabel(key) }] : [])]} />
      {day && !valid && <p className="mh-note">אפשר לשחק רק בתאריכים שכבר הגיעו 🙂 הנה המשחק של היום:</p>}
      <TodayGame key={key || 'today'} dateKey={key || undefined} archive={!!key}
        fallback={<p className="mh-note">עוד אין משחק לתאריך הזה – בחרו יום מהארכיון.</p>} />
      <section id="archive" className="mh-archive">
        <h2>📚 ימים קודמים</h2>
        {days.length ? (
          <div className="mh-archive-grid">
            {days.map(k => <Link key={k} to={`/time-tunnel/${k}`} className={k === key ? 'is-current' : ''}>{dateLabel(k)}</Link>)}
          </div>
        ) : <p className="mh-note">הארכיון יתמלא ככל שיעברו הימים.</p>}
        <p className="mh-about">כל העובדות במשחק נבדקו מול מקורות (ויקיפדיה בעברית ובאנגלית, ואתרי ימים מיוחדים), וליד כל תשובה יש קישור למקור. מצאתם טעות? יש כפתור "מצאתי טעות" בכל שאלה.</p>
      </section>
    </div>
  )
}
