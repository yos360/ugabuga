import { Link } from 'react-router-dom'
import { logInviteCta } from '../../utils/liveActivity'

// "מה מחפשים היום?" — the first thing under the home headline: four big doors by what the visitor came
// to do, and a row of grades. Built after a focus-group round (17.11.2026: CEO, investor, designer,
// advertiser, parent, teacher, kindergarten teacher, 10-year-old — ChatGPT, Grok and Gemini all
// said the home page asks the visitor to choose among ~60 things). Clicks are logged as
// invite-cta:home-start so /admin/activity can show which door works.
const DOORS = [
  ['🖨️', 'דפים להדפסה', 'צביעה, דפי עבודה וחוברות — בחינם', '/printables', 'print'],
  ['🏫', 'חומר לכיתה', 'חימום, חידון חי, דפים לפי כיתה', '/classroom', 'class'],
  ['🧸', 'לגן', 'נושאי החודש, יצירה ומשחקים לגן', '/gan', 'gan'],
  ['🎮', 'לשחק', 'משחקים וחידות לילדים', '/kids', 'play'],
]
const GRADES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']

export default function HomeStart() {
  const hit = (key, to) => () => logInviteCta('home-start-' + key, to)
  return <section className="hp-start" aria-labelledby="hp-start-h">
    <h2 id="hp-start-h" className="hp-start-h">מה מחפשים היום?</h2>
    <div className="hp-start-doors">{DOORS.map(([e, t, d, to, key]) =>
      <Link key={to} to={to} onClick={hit(key, to)} className="hp-start-door"><span aria-hidden="true" className="hp-start-ic">{e}</span><b>{t}</b><small>{d}</small></Link>)}
    </div>
    <nav className="hp-start-grades" aria-label="לפי כיתה"><span>לפי כיתה:</span>
      {GRADES.map((g, i) => <Link key={g} to={`/classroom/by-grade#grade-${i + 1}`} onClick={hit('grade', '/classroom/by-grade')}>{g}</Link>)}
    </nav>
  </section>
}
