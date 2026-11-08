import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EnglishNotFound } from '../EnglishLayout'
import { PARTY_GAMES } from './games'
import { PARTY_ROOT, PARTY_HUBS, PARTY_AGES } from './content/hubs'
import { PARTY_ROOT_PATH, HUB_KEYS, GRADE_KEYS, AGES, SHABBAT_PATH, partyGamePath, partyHubPath, partyAgePath, fitsAge, ageText, range } from './paths'
import { Frame, CardGrid, Chips, Box } from './ui'

// English /games (all party games) and its hubs: /en/party-games/<category or grade> and /en/party-games/age/<n>.
const gameCard = g => ({ href: partyGamePath(g.slug), emoji: g.emoji, name: g.name, sub: `${ageText(g.ages)} · ${range(g.players)} players · ${range(g.minutes, ' min')}` })
const CATEGORY_LINKS = Object.entries(HUB_KEYS).map(([k, [, label]]) => ({ href: partyHubPath(k), label }))
const GRADE_LINKS = Object.entries(GRADE_KEYS).map(([k, [, label]]) => ({ href: partyHubPath(k), label }))
const AGE_LINKS = AGES.map(a => ({ href: partyAgePath(a), label: `Age ${a}` }))

function HubNav() {
  return <div className="no-print">
    <Chips label="By occasion" links={CATEGORY_LINKS} />
    <Chips label="By age" links={AGE_LINKS} />
    <Chips label="By grade" links={[...GRADE_LINKS, { href: SHABBAT_PATH, label: 'Shabbat games' }]} />
  </div>
}

export function PartyHome() {
  const [q, setQ] = useState('')
  const [age, setAge] = useState('')
  const list = useMemo(() => PARTY_GAMES.filter(g => (!age || fitsAge(g, Number(age))) && (!q || g.name.toLowerCase().includes(q.toLowerCase()))), [q, age])
  return <Frame path={PARTY_ROOT_PATH} title={PARTY_ROOT.title} description={PARTY_ROOT.description} counterpart="/games" h1={PARTY_ROOT.h1} emoji="🎉"
    crumbs={[{ label: 'Party games' }]} intro={PARTY_ROOT.intro} faq={PARTY_ROOT.faq}>
    <HubNav />
    <div className="my-4 flex flex-wrap gap-3 no-print">
      <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search games" aria-label="Search games" className="rounded-xl border-2 border-slate-300 px-3 py-2" />
      <select value={age} onChange={e => setAge(e.target.value)} aria-label="Child's age" className="rounded-xl border-2 border-slate-300 px-3 py-2">
        <option value="">Any age</option>
        {[3, ...AGES, 11, 12].map(a => <option key={a} value={a}>Age {a}</option>)}
      </select>
      <span className="self-center font-bold">{list.length} games</span>
    </div>
    <CardGrid items={list.map(gameCard)} />
  </Frame>
}

function Hub({ path, counterpart, text, games, crumb }) {
  const picks = (text.picks || []).map(([slug, why]) => ({ g: PARTY_GAMES.find(x => x.slug === slug), why })).filter(p => p.g)
  return <Frame path={path} title={text.title} description={text.description} counterpart={counterpart} h1={text.h1} emoji="🎉"
    crumbs={[{ label: 'Party games', href: PARTY_ROOT_PATH }, { label: crumb }]} intro={text.intro} faq={text.faq}>
    {picks.length > 0 && <Box title="Our top picks">
      <ul className="space-y-2">{picks.map(({ g, why }) => <li key={g.slug}><Link to={partyGamePath(g.slug)} className="font-bold underline">{g.emoji} {g.name}</Link>: {why}</li>)}</ul>
    </Box>}
    <h2 className="text-2xl my-4">All {games.length} games</h2>
    <CardGrid items={games.map(gameCard)} />
    <HubNav />
  </Frame>
}

// key = a category or grade key (HUB_KEYS / GRADE_KEYS)
export function PartyHub({ hub }) {
  const text = PARTY_HUBS[hub]
  const he = (HUB_KEYS[hub] || GRADE_KEYS[hub])?.[0]
  if (!text || !he) return <EnglishNotFound />
  return <Hub path={partyHubPath(hub)} counterpart={`/games/${he}`} text={text} crumb={text.crumb || (HUB_KEYS[hub] || GRADE_KEYS[hub])[1]} games={PARTY_GAMES.filter(g => g.hubs.includes(hub))} />
}

export function PartyAge({ age: ageProp, params }) {
  const age = Number(ageProp || params?.age)
  const text = PARTY_AGES[age]
  if (!text) return <EnglishNotFound />
  // games made for this age (minimum age closest to it) first, as on the Hebrew page
  const games = PARTY_GAMES.filter(g => fitsAge(g, age)).sort((a, b) => Math.abs(a.ages[0] - age) - Math.abs(b.ages[0] - age))
  return <Hub path={partyAgePath(age)} counterpart={`/games/age/${age}`} text={text} crumb={text.crumb || `Age ${age}`} games={games} />
}
