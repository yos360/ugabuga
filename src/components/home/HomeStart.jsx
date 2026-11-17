import { Link } from 'react-router-dom'
import { logInviteCta } from '../../utils/liveActivity'
import { recordHomeKind } from '../../utils/experiments'
import { KINDS, KIND_DEFAULT } from '../../data/homeKinds'

// "מה מחפשים היום?" — the first thing under the home headline: four big doors by what the visitor came
// to do, and a row of grades. Built after a focus-group round (17.11.2026: CEO, investor, designer,
// advertiser, parent, teacher, kindergarten teacher, 10-year-old — ChatGPT, Grok and Gemini all
// said the home page asks the visitor to choose among ~60 things). The visitor's home kind
// (src/data/homeKinds.js) decides which door comes first. Clicks are logged as invite-cta:home-start-*
// so /admin/activity can show which door works, and counted for the home-kind experiment.
const DOORS = {
  print: ['🖨️', 'דפים להדפסה', 'צביעה, דפי עבודה וחוברות — בחינם', '/printables'],
  class: ['🏫', 'חומר לכיתה', 'חימום, חידון חי, דפים לפי כיתה', '/classroom'],
  gan: ['🧸', 'לגן', 'נושאי החודש, יצירה ומשחקים לגן', '/gan'],
  play: ['🎮', 'לשחק', 'משחקים וחידות לילדים', '/kids'],
}
const GRADES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']

export default function HomeStart({ kind = KIND_DEFAULT }) {
  const order = (KINDS[kind] || KINDS[KIND_DEFAULT]).doors
  const hit = (key, to) => () => { recordHomeKind('click'); logInviteCta('home-start-' + key, to) }
  return <section className="hp-start" aria-labelledby="hp-start-h">
    <h2 id="hp-start-h" className="hp-start-h">מה מחפשים היום?</h2>
    <div className="hp-start-doors">{order.map((key, i) => { const [e, t, d, to] = DOORS[key]
      return <Link key={key} to={to} onClick={hit(key, to)} className={`hp-start-door${i === 0 ? ' is-first' : ''}`}><span aria-hidden="true" className="hp-start-ic">{e}</span><b>{t}</b><small>{d}</small></Link> })}
    </div>
    <nav className="hp-start-grades" aria-label="לפי כיתה"><span>לפי כיתה:</span>
      {GRADES.map((g, i) => <Link key={g} to={`/classroom/by-grade#grade-${i + 1}`} onClick={hit('grade', '/classroom/by-grade')}>{g}</Link>)}
    </nav>
  </section>
}
