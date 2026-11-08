import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { nearby } from '../../utils/nearby'
import EscapeFrame, { BTN_ALT, BTN_MAIN, Card, Pill } from './EscapeFrame'
import EscapePrintKitEn from './EscapePrintKitEn'
import { EN_ESCAPE_ROOMS, EN_ROOM_BY_ID } from './rooms'
import { buildEnglishAdventure, EN_ESCAPE_LEVELS, isCorrect } from './adventure'
import { ESCAPE_BASE, ESCAPE_PAGES, ESCAPE_TOPIC_META } from './catalog'
import { EN_ESCAPE_COLLECTIONS } from './collections'

const roomPath = id => `${ESCAPE_BASE}/${id}`
const describe = id => ESCAPE_PAGES.find(p => p.path === roomPath(id))?.description
const SETTING_LABELS = { birthday: 'birthdays', classroom: 'the classroom', family: 'families', team: 'team building', holiday: 'the holidays' }
const grownUp = room => (room.tags?.ages || []).some(a => a === '13+' || a === 'adults')

const HUB_FAQ = [
  { q: 'Which escape room suits an 8-year-old’s birthday party?', a: 'Several rooms were written for ages 6–9 and 7–9; the audience is on every room’s card. For younger children, The Case of the Missing Cake is a light 10–15 minute room.' },
  { q: 'Do I need anything besides a printer?', a: 'Usually not: a printer, scissors and sometimes an envelope or a small box to hide the prize, as listed in each room’s instructions.' },
  { q: 'Are the escape rooms really free?', a: 'Yes. Every room can be played online or printed as a full kit, with no sign-up and no payment.' },
]
const HUB_BODY = [
  'A printed escape room gives a party or a team day the feel of a real event without going anywhere. There are dozens of ready rooms here: for preschool, kids, teens, adults, the classroom and the Jewish holidays. Every room comes with clues, puzzles and a full answer sheet.',
  'Choose a room by the age of the players, not only by difficulty: little ones get counting, colours and shapes; school-age kids get ciphers and sums; teens and adults get mysteries with suspects and real logic puzzles.',
  'A practical tip: allow 15 to 45 minutes per room, as shown on its card, plus a few minutes to explain at the start. Groups bigger than six tend to create spectators, so it’s better to split into two teams that play side by side.',
]
const HOW_TO = [
  'Choose a room by age and occasion: the audience, length and difficulty are on every room’s card.',
  'Play straight on the screen, or open the kit and print it: a facilitator sheet with the story and every answer, plus an A4 card for each stage.',
  'Hide the stage cards around the room so each answer leads to the next card, and read the opening story aloud.',
  'Start a timer. When a team gets stuck, give one hint at a time; the hints are graded and the first never gives the answer away.',
  'The last code opens a box or envelope with the prize: party bags, the cake, a certificate or whatever suits the occasion.',
]

function groupSizeFor(room) {
  const ages = room.tags?.ages || []
  if (ages.includes('4-6')) return 'Up to 6 children with a grown-up who reads the stations aloud. With more children, use two grown-ups and two teams playing side by side.'
  if (grownUp(room)) return 'Best with teams of 4–6 players. With more people, split into two teams racing the clock, each with its own kit.'
  return 'Best with teams of 3–5 children. In a class or a big party, print a kit per team and run the room in parallel.'
}

function relatedRooms(base) {
  const ages = base.tags?.ages || []
  const ageScore = r => (r.tags?.ages || []).filter(a => ages.includes(a)).length + ((r.tags?.ages || [])[0] === ages[0] ? 2 : 0)
  const kids = !grownUp(base)
  const sameGroup = EN_ESCAPE_ROOMS.filter(r => r.id !== base.id && ageScore(r) > 0 && (!kids || !grownUp(r)))
  const shared = r => (r.tags?.settings || []).filter(s => (base.tags?.settings || []).includes(s))
  const pool = EN_ESCAPE_ROOMS.filter(r => r.id === base.id || (sameGroup.includes(r) && shared(r).length > 0))
  let related = nearby(pool, r => r.id === base.id, 6)
  if (related.length < 4) related = [...related, ...[...sameGroup].sort((a, b) => ageScore(b) - ageScore(a)).filter(r => !related.includes(r))].slice(0, 6)
  const at = EN_ESCAPE_ROOMS.indexOf(base)
  const dist = r => (EN_ESCAPE_ROOMS.indexOf(r) - at + EN_ESCAPE_ROOMS.length) % EN_ESCAPE_ROOMS.length
  const next = sameGroup.length ? [...sameGroup].sort((a, b) => ageScore(b) - ageScore(a) || dist(a) - dist(b))[0] : EN_ESCAPE_ROOMS[(at + 1) % EN_ESCAPE_ROOMS.length]
  return { related, next, shared }
}

// One page for the hub (/en/tools/escape-rooms, roomId undefined) and for every room.
export default function EnglishEscapeRooms({ roomId }) {
  const base = EN_ROOM_BY_ID[roomId] || EN_ESCAPE_ROOMS[0]
  const isRoomPage = Boolean(roomId)
  const [difficulty, setDifficulty] = useState('easy')
  const [seed, setSeed] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState(null)
  const [hintCount, setHintCount] = useState(0)
  const [solved, setSolved] = useState(0)
  const [showKit, setShowKit] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [pickedId, setPickedId] = useState(base.id)
  const panelRef = useRef(null)
  const current = isRoomPage ? base : EN_ROOM_BY_ID[pickedId] || base
  const room = useMemo(() => buildEnglishAdventure(current, difficulty, seed), [current, difficulty, seed])
  const step = room.steps[stepIndex]
  const done = solved === room.steps.length
  const level = EN_ESCAPE_LEVELS.find(l => l.id === difficulty)

  // A new room, level or replay starts from stage 1 (reset during render, React's "adjust state on prop change").
  const roundKey = `${current.id}|${difficulty}|${seed}`
  const [round, setRound] = useState(roundKey)
  if (round !== roundKey) { setRound(roundKey); setStepIndex(0); setAnswer(''); setStatus(null); setHintCount(0); setSolved(0) }

  const check = () => {
    if (!step || status === 'correct' || !answer.trim()) return
    if (isCorrect(step, answer)) { setStatus('correct'); setSolved(stepIndex + 1); setAnswer(''); setHintCount(0) } else setStatus('wrong')
  }
  const nextStage = () => { setStepIndex(i => i + 1); setStatus(null); setAnswer(''); setHintCount(0) }
  const pick = id => { setPickedId(id); requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) }

  const { related, next, shared } = relatedRooms(current)
  const topics = ESCAPE_TOPIC_META.filter(([slug]) => EN_ESCAPE_COLLECTIONS[slug].filter(current))
  const props = (base.materials || []).filter(m => !/printed|pens|pencils|scrap paper|station sheets/i.test(m))
  const roomFaq = [
    { q: `What age is “${base.title}” for, and how long does it take?`, a: `It was written for ${base.audience.toLowerCase()}, at ${base.difficulty.toLowerCase()} difficulty, and usually takes ${base.duration}. It has ${base.steps.length} story stations, and online you can choose between three difficulty levels that add more locks.` },
    { q: `What do I need to run “${base.title}”?`, a: `A printer and these props: ${base.materials.join('; ')}. The printable kit includes a facilitator sheet with every answer and a card for each stage.` },
    { q: 'What if the players get stuck?', a: 'Every stage has graded hints. Online they open one at a time; in the printed kit they sit next to each answer on the facilitator sheet. The first hint never gives the answer away.' },
  ]
  const levelSection = <section className="mb-6 rounded-3xl border border-[var(--border)] bg-white p-5" aria-label="Choose a difficulty level">
    <h2 className="text-2xl font-bold mb-3">{isRoomPage ? `Difficulty level for “${base.title}”` : 'First, choose a difficulty level'}</h2>
    <div className="grid sm:grid-cols-3 gap-3">{EN_ESCAPE_LEVELS.map(l => <button key={l.id} type="button" aria-pressed={difficulty === l.id} className={`text-left rounded-2xl border p-4 ${difficulty === l.id ? 'bg-purple-100 border-purple-500' : 'bg-white'}`} onClick={() => { if (l.id !== difficulty && (!solved || window.confirm('Changing the level restarts the room. Continue?'))) setDifficulty(l.id) }}><strong className="block text-xl">{l.label}</strong><span className="text-sm">{l.detail}</span></button>)}</div>
    <p className="text-sm mt-3 opacity-80">The story clues stay the same on every level; harder levels add more locks in between. You can ask for a hint at every stage.</p>
  </section>

  const game = <div ref={panelRef} className="space-y-6 scroll-mt-6">
    <Card className="bg-[var(--postit)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div><h2 className="text-3xl font-bold">{room.emoji} {room.title}</h2><p className="mt-1 opacity-80">{room.intro}</p></div>
        <div className="flex flex-wrap gap-2"><Pill>{room.audience}</Pill><Pill tone="yellow">{room.difficulty}</Pill><Pill tone="blue">{room.duration}</Pill></div>
      </div>
      <div className="h-3 rounded-full bg-white border border-[var(--border)] overflow-hidden"><div className="h-full bg-[#4caf50] w-full origin-left transition-transform" style={{ transform: `scaleX(${solved / room.steps.length})` }} /></div>
      <p className="text-sm mt-2 opacity-80">{solved} of {room.steps.length} stages solved</p>
    </Card>
    {done ? (
      <Card className="text-center p-8">
        <div className="text-6xl mb-3">🎉</div>
        <h2 className="text-3xl font-bold mb-3">Room solved!</h2>
        <p className="text-xl leading-relaxed mb-6">{room.finalMessage}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className={BTN_MAIN} onClick={() => setSeed(s => s + 1)}>Play again</button>
          <Link className={`${BTN_ALT} inline-flex items-center`} to={roomPath(next.id)}>Next room: {next.emoji} {next.title} →</Link>
          <button type="button" className={BTN_ALT} onClick={() => setShowKit(true)}>See the kit</button>
        </div>
      </Card>
    ) : (
      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 className="text-3xl font-bold">Stage {stepIndex + 1}: {step.title}</h2><Pill tone="yellow">{stepIndex + 1}/{room.steps.length}</Pill></div>
        {step.story && <p className="text-lg leading-relaxed mb-5">{step.story}</p>}
        {step.visual && <div className="text-center text-2xl sm:text-3xl bg-purple-50 rounded-2xl p-5 mb-5 break-words" aria-label="Clue board">{step.visual}</div>}
        <label htmlFor="escape-answer" className="block text-xl font-bold mb-2">{step.question}</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input id="escape-answer" disabled={status === 'correct'} value={answer} autoComplete="off" onChange={e => { setAnswer(e.target.value); setStatus(null) }} onKeyDown={e => { if (e.key === 'Enter') check() }} placeholder="Type your answer…" className="flex-1 border-2 border-[var(--ink)] bg-white px-4 py-3 text-lg rounded-xl outline-none focus:bg-[var(--yellow)]/20" />
          <button type="button" className={BTN_MAIN} disabled={status === 'correct' || !answer.trim()} onClick={check}>Check answer</button>
        </div>
        {status === 'wrong' && <p className="mt-3 font-bold text-[var(--accent)]">Not yet. Try again or open a hint.</p>}
        {status === 'correct' && <div className="mt-3 font-bold text-[#2e7d32]" role="status"><p className="mb-2">Correct! The lock clicks open.</p><button type="button" className={BTN_MAIN} onClick={nextStage}>On to the next stage →</button></div>}
        <div className="mt-5" aria-live="polite">
          {hintCount > 0 && <ol className="space-y-2 mb-2">{step.hints.slice(0, hintCount).map((h, i) => <li key={i} className="inline-block w-full rounded-xl bg-[var(--yellow)] px-3 py-2 text-sm">💡 Hint {i + 1}: {h}</li>)}</ol>}
          {status !== 'correct' && hintCount < step.hints.length && <button type="button" onClick={() => setHintCount(c => c + 1)} className="min-h-[44px] font-bold text-[var(--blue)] hover:underline">{hintCount === 0 ? 'Need a hint? 💡' : 'Another hint 💡'}</button>}
        </div>
      </Card>
    )}
    {showKit && <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">🖨️ Facilitator kit</h2><button type="button" onClick={() => setPrinting(true)} className="min-h-[44px] rounded-xl bg-slate-900 px-4 py-2 font-bold text-white">🖨️ Print: kit + a card per stage</button></div>
      <p className="leading-relaxed mb-4">For a class, a birthday, a family activity or an adult party. Read the story, let the team solve, and use the hints only if they get stuck.</p>
      <div className="space-y-4">{room.steps.map((item, i) => <div key={i} className="rounded-xl border-2 border-[var(--border)] bg-white p-4">
        <h3 className="font-bold text-xl mb-1">{i + 1}. {item.title}</h3>
        {item.story && <p className="mb-2">{item.story}</p>}
        {item.visual && <p className="text-center text-xl">{item.visual}</p>}
        <p><strong>Question:</strong> {item.question}</p>
        <p><strong>Answer:</strong> {item.answer}</p>
        <p><strong>Hints:</strong> {item.hints.join(' · ')}</p>
      </div>)}</div>
    </Card>}
  </div>

  const kitBox = <Card>
    <h2 className="text-xl font-bold mb-2">Run it in real life too</h2>
    {!isRoomPage && <p className="text-sm leading-relaxed opacity-80 mb-4">Open the kit for a facilitator plan: the opening story, the stages, the answers and the hints.</p>}
    <div className="flex flex-wrap gap-2">
      <button type="button" className={BTN_ALT} onClick={() => setShowKit(v => !v)}>{showKit ? 'Hide the kit' : 'Show the kit'}</button>
      <button data-print-main type="button" onClick={() => setPrinting(true)} className="min-h-[44px] rounded-xl bg-slate-900 px-4 py-2 font-bold text-white">🖨️ Print the kit</button>
    </div>
  </Card>

  const printer = printing && <PrintPreview lang="en" copies={false} title={`Escape room kit: ${room.title}`} onClose={() => setPrinting(false)}><EscapePrintKitEn room={room} levelLabel={level?.label} /></PrintPreview>

  if (isRoomPage) return <EscapeFrame path={roomPath(base.id)} crumb={base.title} structuredData={faqSchema(roomFaq)}>
    <section className="mb-8 text-center">
      <div className="text-6xl mb-2" aria-hidden="true">{base.emoji}</div>
      <h1 className="text-4xl md:text-5xl font-bold mb-3">Escape room: {base.title}</h1>
      <p className="text-lg max-w-3xl mx-auto mb-4">{describe(base.id)}</p>
      <div className="flex flex-wrap justify-center gap-2 mb-6"><Pill>{base.audience}</Pill><Pill tone="yellow">{base.difficulty}</Pill><Pill tone="blue">{base.duration}</Pill></div>
      <div className="grid md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
        <Card><h2 className="text-2xl font-bold mb-2">The story</h2><p className="leading-relaxed">{base.intro}</p>{base.story && <p className="leading-relaxed mt-2">{base.story}</p>}<p className="mt-3 text-sm opacity-80">{base.steps.length} story stations · online you can pick a level that adds more locks.</p></Card>
        <Card><h2 className="text-2xl font-bold mb-2">Run it at home or in class</h2><h3 className="font-bold">What to prepare</h3><ul className="list-disc pl-5 mb-2">{base.materials.map(m => <li key={m}>{m}</li>)}</ul><h3 className="font-bold">Tips for the facilitator</h3><ul className="list-disc pl-5">{base.printableKit.map(m => <li key={m}>{m}</li>)}</ul></Card>
      </div>
    </section>
    {levelSection}
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">{game}<aside className="space-y-4 lg:sticky lg:top-4">{kitBox}<Card><Link to={ESCAPE_BASE} className="font-bold underline">← All {EN_ESCAPE_ROOMS.length} escape rooms</Link></Card></aside></div>
    {printer}
    <section className="mt-12 space-y-8" aria-label={`Facilitator guide: ${base.title}`}>
      <h2 className="text-3xl font-bold">Facilitator guide: {base.emoji} {base.title}</h2>
      <div className="grid md:grid-cols-2 gap-5">
        <Card><h3 className="text-xl font-bold mb-2">What the room practises</h3><p className="leading-relaxed mb-3">{base.skills}.</p>
          <details><summary className="cursor-pointer font-bold">The {base.steps.length} stations (without the answers)</summary><ol className="list-decimal pl-5 mt-2 space-y-1">{base.steps.map((s, i) => <li key={i}><strong>{s.title}</strong>: {s.question}</li>)}</ol></details></Card>
        <Card><h3 className="text-xl font-bold mb-2">Preparing and printing</h3><p className="leading-relaxed">On the {level?.label.toLowerCase()} level the printed kit has {room.steps.length + 1} pages: a facilitator sheet with the opening story, the setup list and every answer, plus an A4 card for each of the {room.steps.length} stages.{props.length >= 2 ? ` Besides printing, get ready: ${props[0].toLowerCase()} and ${props.at(-1).toLowerCase()}.` : ''}</p>{base.printableKit[0] && <p className="leading-relaxed mt-2"><strong>Most important:</strong> {base.printableKit[0]}</p>}</Card>
        <Card><h3 className="text-xl font-bold mb-2">Age and group size</h3><p className="leading-relaxed">{groupSizeFor(base)}</p></Card>
        <Card><h3 className="text-xl font-bold mb-2">Giving hints in this room</h3><p className="leading-relaxed">Online the hints open one at a time; in the printed kit they sit in the facilitator table next to each answer. Give the first hint after a couple of minutes of silence, not at the first wrong guess.</p></Card>
      </div>
      <div className="max-w-3xl"><SeoBody lang="en" faq={roomFaq} /></div>
      <div>
        <h3 className="text-2xl font-bold mb-4">Rooms like {base.title}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{related.map(r => { const common = shared(r).map(s => SETTING_LABELS[s]).filter(Boolean); return <Link key={r.id} to={roomPath(r.id)} className="block"><Card className="h-full hover:bg-[var(--postit)]"><div className="text-3xl" aria-hidden="true">{r.emoji}</div><h4 className="font-bold text-xl">{r.title}</h4><p className="text-sm">{r.hook}</p><p className="text-sm opacity-75 mt-1">{r.audience}{common.length ? ` · also for ${common.join(', ')}` : ''}</p></Card></Link> })}</div>
      </div>
      {topics.length > 0 && <nav aria-label="More escape rooms" className="flex flex-wrap gap-2">{topics.map(([slug, title, emoji]) => <Link key={slug} to={`${ESCAPE_BASE}/topic/${slug}`} className={BTN_ALT}>{emoji} {title}</Link>)}</nav>}
    </section>
  </EscapeFrame>

  return <EscapeFrame path={ESCAPE_BASE} structuredData={faqSchema(HUB_FAQ)}>
    <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">🔐 Buga escape rooms</h1>
    <p className="text-center opacity-80 mb-8 max-w-3xl mx-auto">Play right here in the browser, or print a kit for the classroom, a party at home or an adult get-together. Every room has exact clues, clear answers and step-by-step progress.</p>
    <nav aria-label="Escape rooms by topic" className="mb-8 flex flex-wrap justify-center gap-2">{ESCAPE_TOPIC_META.map(([slug, title, emoji]) => <Link key={slug} to={`${ESCAPE_BASE}/topic/${slug}`} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{emoji} {title}</Link>)}</nav>
    {levelSection}
    <div className="grid lg:grid-cols-[330px_1fr] gap-6 items-start">
      <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-4">
        <Card><h2 className="text-2xl font-bold mb-3">Choose a room</h2>
          <div className="space-y-3 lg:max-h-[80vh] lg:overflow-y-auto">{EN_ESCAPE_ROOMS.map(r => <button key={r.id} type="button" onClick={() => pick(r.id)} className={`block w-full text-left rounded-xl border-2 border-[var(--ink)] p-3 ${current.id === r.id ? 'bg-[var(--yellow)]' : 'bg-white hover:bg-[var(--muted)]/20'}`}><span className="text-2xl mr-1" aria-hidden="true">{r.emoji}</span> <span className="font-bold text-lg">{r.title}</span><span className="block text-sm opacity-75">{r.audience}</span></button>)}</div>
        </Card>
        {kitBox}
      </aside>
      <div className="order-1 lg:order-2">{game}<p className="mt-3 text-sm"><Link to={roomPath(current.id)} className="underline font-bold">Open the full page for {current.title} →</Link></p></div>
    </div>
    {printer}
    <div className="mt-12 max-w-3xl">
      <h2 className="text-2xl font-bold mb-3">How to run a printable escape room</h2>
      <ol className="list-decimal pl-5 space-y-1 leading-relaxed mb-8">{HOW_TO.map(t => <li key={t}>{t}</li>)}</ol>
      <SeoBody lang="en" paragraphs={HUB_BODY} faq={HUB_FAQ} related={[{ label: 'free online tools', href: '/en/tools' }, { label: 'printable worksheets', href: '/en/worksheets' }, { label: 'birthday ideas', href: '/en/birthday' }]} />
      <h2 className="text-2xl font-bold mb-3 mt-8">All {EN_ESCAPE_ROOMS.length} escape rooms</h2>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1">{EN_ESCAPE_ROOMS.map(r => <li key={r.id}><Link to={roomPath(r.id)} className="underline">{r.emoji} {r.title}</Link> <span className="text-sm opacity-75">· {r.audience}</span></li>)}</ul>
    </div>
  </EscapeFrame>
}
