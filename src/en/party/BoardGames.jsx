import { Link } from 'react-router-dom'
import { EnglishNotFound } from '../EnglishLayout'
import { BOARD_HUB, BOARD_GAMES_EN } from './content/boards'
import { Frame, Box, Meta, CardGrid, PrintButton, RuleSections } from './ui'

// English /board-games and /board-games/<slug>: rules and printable rules. Checkers and backgammon have their own
// English pages (/en/checkers, /en/backgammon), linked from the hub.
const ROOT = '/en/board-games'
const href = g => `${ROOT}/${g.slug}`
const cards = list => list.map(g => ({ href: href(g), emoji: g.emoji, name: g.name, sub: g.tagline }))
const MORE = [{ href: '/en/checkers', emoji: '⚫', name: 'Checkers', sub: 'Play online, learn and print the rules' }, { href: '/en/backgammon', emoji: '🎲', name: 'Backgammon', sub: 'Play online, learn and print the rules' }]

export function BoardGamesHub() {
  return <Frame path={ROOT} title={BOARD_HUB.title} description={BOARD_HUB.description} counterpart="/board-games" h1={BOARD_HUB.h1} emoji="♟️"
    crumbs={[{ label: 'Board games' }]} intro={BOARD_HUB.intro} faq={BOARD_HUB.faq}>
    <CardGrid items={[...cards(BOARD_GAMES_EN), ...MORE]} />
  </Frame>
}

export function BoardGamePage({ slug }) {
  const g = BOARD_GAMES_EN.find(x => x.slug === slug)
  if (!g) return <EnglishNotFound />
  return <Frame path={href(g)} title={g.title} description={g.description} counterpart={`/board-games/${g.he}`} h1={`${g.name}: rules for kids`} emoji={g.emoji}
    crumbs={[{ label: 'Board games', href: ROOT }, { label: g.name }]} intro={g.intro} faq={g.faq}>
    <Meta items={[['👥', g.players], ['🎂', `Ages ${g.ages}`], ['⏱️', g.time]]} />
    <div className="flex flex-wrap justify-center gap-2 no-print">
      <PrintButton label="🖨️ Print the rules" title={`${g.name} rules`}>
        <h2 style={{ fontSize: 24, margin: '0 0 8px' }}>{g.emoji} {g.name} rules</h2>
        <RuleSections rules={g.rules} />
      </PrintButton>
      {g.play && <Link to={g.play.href} className="rounded-xl border-2 border-slate-900 px-4 py-2 font-bold">🎮 {g.play.label}</Link>}
    </div>
    <Box title={`How to play ${g.name}`}><RuleSections rules={g.rules} /></Box>
    <h2 className="text-2xl my-4">More board games</h2>
    <CardGrid items={[...cards(BOARD_GAMES_EN.filter(x => x.slug !== slug)), ...MORE]} />
  </Frame>
}
