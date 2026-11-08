import { EnglishNotFound } from '../EnglishLayout'
import { CARD_HUB, CARD_GAMES_EN } from './content/cards'
import { Frame, Box, Steps, Meta, CardGrid, PrintButton } from './ui'

// English /card-games and /card-games/<slug>: rules of family card games, printable.
const ROOT = '/en/card-games'
const href = g => `${ROOT}/${g.slug}`
const cards = list => list.map(g => ({ href: href(g), emoji: g.emoji, name: g.name, sub: `${g.players} players · ${g.ages} · ${g.time}` }))

export function CardGamesHub() {
  return <Frame path={ROOT} title={CARD_HUB.title} description={CARD_HUB.description} counterpart="/card-games" h1={CARD_HUB.h1} emoji="🃏"
    crumbs={[{ label: 'Card games' }]} intro={CARD_HUB.intro} faq={CARD_HUB.faq}>
    <CardGrid items={cards(CARD_GAMES_EN)} />
  </Frame>
}

function Rules({ g }) {
  return <>
    <p><b>Goal:</b> {g.goal}</p>
    <h3 className="text-xl mt-3 mb-1">Setting up</h3><Steps items={g.setup} />
    <h3 className="text-xl mt-3 mb-1">How to play</h3><Steps items={g.play} />
    <h3 className="text-xl mt-3 mb-1">Who wins</h3><p>{g.win}</p>
  </>
}

export function CardGamePage({ slug }) {
  const g = CARD_GAMES_EN.find(x => x.slug === slug)
  if (!g) return <EnglishNotFound />
  return <Frame path={href(g)} title={g.title} description={g.description} counterpart={`/card-games/${g.he}`} h1={`${g.name}: card game rules`} emoji={g.emoji}
    crumbs={[{ label: 'Card games', href: ROOT }, { label: g.name }]} intro={g.intro} faq={g.faq}>
    <Meta items={[['👥', `${g.players} players`], ['🎂', `Ages ${g.ages}`], ['⏱️', g.time], ['🃏', g.deck]]} />
    <div className="flex justify-center no-print">
      <PrintButton label="🖨️ Print the rules" title={`${g.name} rules`}>
        <h2 style={{ fontSize: 24, margin: '0 0 4px' }}>{g.emoji} {g.name}</h2>
        <p style={{ margin: '0 0 8px' }}>{g.players} players · Ages {g.ages} · {g.deck}</p>
        <Rules g={g} />
      </PrintButton>
    </div>
    <Box title={`How to play ${g.name}`}><Rules g={g} /></Box>
    {g.tips?.length > 0 && <Box title="Tips"><Steps items={g.tips} ordered={false} /></Box>}
    {g.variants?.length > 0 && <Box title="Variations"><Steps items={g.variants} ordered={false} /></Box>}
    <h2 className="text-2xl my-4">More card games</h2>
    <CardGrid items={cards(CARD_GAMES_EN.filter(x => x.slug !== slug))} />
  </Frame>
}
