import { EnglishNotFound } from '../EnglishLayout'
import { DICE_HUB, DICE_GAMES_EN } from './content/dice'
import { Frame, Box, Steps, Meta, CardGrid, PrintButton } from './ui'

// English /dice-games and /dice-games/<slug>.
const ROOT = '/en/dice-games'
const href = g => `${ROOT}/${g.slug}`
const dice = n => `${n} ${n === 1 ? 'die' : 'dice'}`
const cards = list => list.map(g => ({ href: href(g), emoji: g.emoji, name: g.name, sub: `${dice(g.dice)} · ${g.players} players · ${g.ages}` }))

export function DiceGamesHub() {
  return <Frame path={ROOT} title={DICE_HUB.title} description={DICE_HUB.description} counterpart="/dice-games" h1={DICE_HUB.h1} emoji="🎲"
    crumbs={[{ label: 'Dice games' }]} intro={DICE_HUB.intro} faq={DICE_HUB.faq}>
    <CardGrid items={cards(DICE_GAMES_EN)} />
  </Frame>
}

export function DiceGamePage({ slug }) {
  const g = DICE_GAMES_EN.find(x => x.slug === slug)
  if (!g) return <EnglishNotFound />
  return <Frame path={href(g)} title={g.title} description={g.description} counterpart={`/dice-games/${g.he}`} h1={g.name} emoji={g.emoji}
    crumbs={[{ label: 'Dice games', href: ROOT }, { label: g.name }]} intro={g.intro} faq={g.faq}>
    <Meta items={[['🎲', dice(g.dice)], ['👥', `${g.players} players`], ['🎂', `Ages ${g.ages}`], ['⏱️', g.time]]} />
    <div className="flex justify-center no-print">
      <PrintButton label="🖨️ Print the rules" title={`${g.name} rules`}>
        <h2 style={{ fontSize: 24, margin: '0 0 4px' }}>{g.emoji} {g.name}</h2>
        <p style={{ margin: '0 0 8px' }}>{dice(g.dice)} · {g.players} players · Ages {g.ages}</p>
        <Steps items={g.rules} />
      </PrintButton>
    </div>
    <Box title="How to play"><Steps items={g.rules} /></Box>
    {g.tips?.length > 0 && <Box title="Tips"><Steps items={g.tips} ordered={false} /></Box>}
    <h2 className="text-2xl my-4">More dice games</h2>
    <CardGrid items={cards(DICE_GAMES_EN.filter(x => x.slug !== slug))} />
  </Frame>
}
