import { useState } from 'react'
import { EnglishNotFound } from '../EnglishLayout'
import { HUNT_HUB, HUNTS_EN } from './content/hunts'
import { Frame, Box, Steps, Meta, CardGrid, PrintButton } from './ui'

// English /treasure-hunt/ready (hub, at /en/treasure-hunt) and /treasure-hunt/<slug>: ready-made hunts with
// printable rhyming clues (cut-out notes, answers on a separate key for the adult).
const ROOT = '/en/treasure-hunt'
const href = h => `${ROOT}/${h.slug}`
const cards = list => list.map(h => ({ href: href(h), emoji: h.emoji, name: h.name, sub: `Ages ${h.ages} · ${h.clues.length} clues` }))
const lines = text => text.split('\n').map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)

export function TreasureHuntsHub() {
  return <Frame path={ROOT} title={HUNT_HUB.title} description={HUNT_HUB.description} counterpart="/treasure-hunt/ready" h1={HUNT_HUB.h1} emoji="🗺️"
    crumbs={[{ label: 'Treasure hunts' }]} intro={HUNT_HUB.intro} faq={HUNT_HUB.faq}>
    <CardGrid items={cards(HUNTS_EN)} />
  </Frame>
}

export function TreasureHuntPage({ slug }) {
  const h = HUNTS_EN.find(x => x.slug === slug)
  const [show, setShow] = useState(false)
  if (!h) return <EnglishNotFound />
  return <Frame path={href(h)} title={h.title} description={h.description} counterpart={`/treasure-hunt/${h.he}`} h1={h.name} emoji={h.emoji}
    crumbs={[{ label: 'Treasure hunts', href: ROOT }, { label: h.name }]} intro={[h.intro, h.lead].filter(Boolean)} faq={h.faq} paragraphs={h.about || []}>
    <Meta items={[['🎂', `Ages ${h.ages}`], ['🧩', `${h.clues.length} rhyming clues`], ['🎁', 'Treasure at the end']]} />
    <div className="flex justify-center no-print">
      <PrintButton label="🖨️ Print the clues" title={`${h.name}: clues`}>
        <h2 style={{ fontSize: 22, margin: '0 0 8px' }}>{h.emoji} {h.name}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {h.clues.map((c, i) => <div key={i} style={{ border: '1px dashed #888', padding: 12, minHeight: 120, fontSize: 16, breakInside: 'avoid' }}><b>Clue {i + 1}</b>{lines(c.clue)}</div>)}
        </div>
        <h3 style={{ fontSize: 16, margin: '16px 0 4px' }}>Answer key (for the grown-up)</h3>
        <ol style={{ fontSize: 13 }}>{h.clues.map((c, i) => <li key={i}>{c.answer}</li>)}</ol>
      </PrintButton>
    </div>
    <Box title="Before you start"><Steps items={h.setup} ordered={false} /></Box>
    <Box title="The clues">
      <ol className="space-y-3 list-decimal ps-6">{h.clues.map((c, i) => <li key={i}>{lines(c.clue)}{show && <small className="block text-slate-600">Answer: {c.answer}</small>}</li>)}</ol>
      <button type="button" className="mt-4 rounded-xl border-2 border-slate-900 px-4 py-2 font-bold no-print" onClick={() => setShow(s => !s)}>{show ? 'Hide the answers' : 'Show the answers'}</button>
    </Box>
    {h.prize && <Box title="The treasure"><p>{h.prize}</p></Box>}
    {h.ideas?.length > 0 && <Box title="Ideas and variations"><ul className="space-y-2">{h.ideas.map(x => <li key={x.t}><b>{x.t}:</b> {x.d}</li>)}</ul></Box>}
    <h2 className="text-2xl my-4">More treasure hunts</h2>
    <CardGrid items={cards(HUNTS_EN.filter(x => x.slug !== slug))} />
  </Frame>
}
