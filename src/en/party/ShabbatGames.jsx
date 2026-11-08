import { useState } from 'react'
import { SHABBAT_EN } from './content/shabbat'
import { PARTY_ROOT_PATH, SHABBAT_PATH } from './paths'
import { Frame, Steps, Meta, PrintButton } from './ui'

// English /games/shabbat: screen-free games for Shabbat, filterable by kind and printable.
function Game({ g }) {
  return <article className="rounded-2xl border-2 border-slate-200 bg-white p-4" id={g.slug}>
    <h3 className="text-xl mb-1">{g.emoji} {g.name}</h3>
    <small className="block mb-2 text-slate-600">Ages {g.ages} · {g.players} players</small>
    <Steps items={g.rules} />
    {g.tip && <p className="mt-2 text-sm"><b>Tip:</b> {g.tip}</p>}
  </article>
}

export default function ShabbatGames() {
  const [kind, setKind] = useState('all')
  const S = SHABBAT_EN
  const list = S.games.filter(g => kind === 'all' || g.kind === kind)
  return <Frame path={SHABBAT_PATH} title={S.title} description={S.description} counterpart="/games/shabbat" h1={S.h1} emoji="🕯️"
    crumbs={[{ label: 'Party games', href: PARTY_ROOT_PATH }, { label: 'Shabbat games' }]} intro={S.intro} faq={S.faq}>
    <Meta items={[['🎲', `${S.games.length} games`], ['📵', 'No screens'], ['🧰', 'Little or no equipment']]} />
    <div className="my-4 flex flex-wrap justify-center gap-2 no-print" role="radiogroup" aria-label="Kind of game">
      {[{ id: 'all', label: 'All', emoji: '✨' }, ...S.kinds].map(k => <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} onClick={() => setKind(k.id)}
        className={`rounded-full border-2 px-3 py-1 font-bold ${kind === k.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>{k.emoji} {k.label}</button>)}
      <PrintButton label="🖨️ Print these games" title="Shabbat games">
        <h2 style={{ fontSize: 22, margin: '0 0 8px' }}>🕯️ {S.h1}</h2>
        {list.map(g => <section key={g.slug} style={{ breakInside: 'avoid', marginBottom: 10 }}><h3 style={{ fontSize: 16, margin: '6px 0 2px' }}>{g.emoji} {g.name} (ages {g.ages})</h3><ol style={{ margin: 0 }}>{g.rules.map((r, i) => <li key={i}>{r}</li>)}</ol></section>)}
      </PrintButton>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">{list.map(g => <Game key={g.slug} g={g} />)}</div>
  </Frame>
}
