import { Link } from 'react-router-dom'
import { ITEMS, STARS } from '../../data/homeCards'
import { KINDS, KIND_DEFAULT, kindCards } from '../../data/homeKinds'
import { recordHomeKind } from '../../utils/experiments'

// "גלו עוד בבוגה", fixed per home kind (src/data/homeKinds.js): the tools that used to rotate three at a
// time, now grouped by who needs them and always in the same place on the page.
const POOL = [...STARS, ...ITEMS]

export default function HomeKindCards({ kind = KIND_DEFAULT }) {
  const k = KINDS[kind] || KINDS[KIND_DEFAULT]
  return <section className="hp-sec hp-discover" aria-labelledby="hp-discover-h">
    <div className="hp-row-head"><h2 id="hp-discover-h" className="hp-h2">{k.cardsTitle}</h2>
      <Link to="/tools" className="hp-discover-next">לכל הכלים ←</Link></div>
    <div className="hp-discover-row hp-kind-row">{kindCards(kind, POOL).map(([e, t, d, to, tag]) =>
      <Link key={to} to={to} onClick={() => recordHomeKind('click')} className="hp-discover-card">
        <small className="hp-discover-tag">{tag}</small><span aria-hidden="true" className="hp-discover-ic">{e}</span><b>{t}</b><span className="hp-discover-desc">{d}</span>
      </Link>)}</div>
  </section>
}
