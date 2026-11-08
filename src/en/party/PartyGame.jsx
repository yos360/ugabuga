import { EnglishNotFound } from '../EnglishLayout'
import { faqSchema } from '../../components/ui/SeoBody'
import { PARTY_GAMES, partyGame } from './games'
import { PARTY_ROOT_PATH, HUB_KEYS, GRADE_KEYS, partyGamePath, partyHubPath, ageText, range } from './paths'
import { Frame, Box, Steps, Meta, CardGrid, Chips, PrintButton, PrintCards } from './ui'

// English /games/<slug>: the rules of one party game, printable rules and (when the game needs them) printable cards.
// `data` is the content part that holds this game (content/partyN.js), passed by gameN.jsx.
function howToSchema(g, t, path) {
  return {
    '@context': 'https://schema.org', '@type': 'HowTo', name: `How to play ${g.name}`, description: t.description, inLanguage: 'en',
    url: 'https://ugabuga.co.il' + path, totalTime: `PT${g.minutes[1] || g.minutes[0]}M`,
    step: t.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
  }
}

function Rules({ g, t, print = false }) {
  const H = print ? 'h3' : 'h2'
  const sec = (title, body) => print ? <section style={{ marginBottom: 10 }}><H style={{ fontSize: 17, margin: '8px 0 4px' }}>{title}</H>{body}</section> : <Box title={title}>{body}</Box>
  return <>
    {sec('What you need', <p><b>Equipment:</b> {t.equipment}. {t.setup}</p>)}
    {sec(`How to play ${g.name}`, <Steps items={t.steps} />)}
    {(t.scoring || t.ending) && sec('Scoring and wrapping up', <>{t.scoring && <p className="mb-2"><b>Scoring:</b> {t.scoring}</p>}{t.ending && <p><b>To finish:</b> {t.ending}</p>}</>)}
    {t.byAge?.length > 0 && sec('By age', <Steps items={t.byAge} ordered={false} />)}
    {t.variations?.length > 0 && sec('Variations', <Steps items={t.variations} ordered={false} />)}
    {t.tips?.length > 0 && sec('Tips for the adult in charge', <Steps items={t.tips} ordered={false} />)}
    {t.safety && sec('Safety', <p>{t.safety}</p>)}
  </>
}

export default function PartyGame({ slug, data }) {
  const g = partyGame(slug), t = data?.[slug]
  if (!g || !t) return <EnglishNotFound />
  const path = partyGamePath(slug)
  const hubLinks = g.hubs.map(k => ({ href: partyHubPath(k), label: (HUB_KEYS[k] || GRADE_KEYS[k])?.[1] })).filter(l => l.label)
  const related = PARTY_GAMES.filter(x => x.slug !== slug)
    .map(x => ({ x, s: x.hubs.filter(h => g.hubs.includes(h)).length }))
    .sort((a, b) => b.s - a.s).slice(0, 6).map(({ x }) => ({ href: partyGamePath(x.slug), emoji: x.emoji, name: x.name, sub: ageText(x.ages) }))
  return <Frame path={path} title={t.title} description={t.description} counterpart={`/games/${g.he}`} h1={g.name} emoji={g.emoji}
    crumbs={[{ label: 'Party games', href: PARTY_ROOT_PATH }, { label: g.name }]} intro={t.intro} faq={t.faq}
    structuredData={[howToSchema(g, t, path), ...(t.faq?.length ? [faqSchema(t.faq)] : [])]}>
    <Meta items={[['🎂', ageText(g.ages)], ['👥', `${range(g.players)} players`], ['⏱️', range(g.minutes, ' minutes')], ['🧰', t.equipment]]} />
    <div className="flex flex-wrap justify-center gap-2 no-print">
      <PrintButton label="🖨️ Print the rules" title={`${g.name} rules`}>
        <h2 style={{ fontSize: 24, margin: '0 0 4px' }}>{g.emoji} {g.name}</h2>
        <p style={{ margin: '0 0 8px' }}>{ageText(g.ages)} · {range(g.players)} players · {range(g.minutes, ' minutes')}</p>
        <Rules g={g} t={t} print />
      </PrintButton>
      {t.cards && <a href="#cards" className="rounded-xl border-2 border-slate-900 px-4 py-2 font-bold">🃏 Printable cards</a>}
    </div>
    <Rules g={g} t={t} />
    {t.cards?.items?.length > 0 && <PrintCards cards={t.cards} name={g.name} />}
    {hubLinks.length > 0 && <Chips label="Also great for" links={hubLinks} />}
    <h2 className="text-2xl my-4">More games like this</h2>
    <CardGrid items={related} />
  </Frame>
}
