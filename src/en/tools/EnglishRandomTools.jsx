// English random tools: dice (and the dice presets), random number, coin flip, spin the bottle,
// the spinning wheel and the team generator. Wheel math and shuffling come from the shared utils.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ToolFrame from './ToolFrame'
import { Field, Panel, Select, bigButtonClass, buttonClass, inputClass, randomInt, copyText } from './ui'
import { planSpin } from '../../utils/wheel'
import { shuffle } from '../../utils/shuffle'

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// ── dice ──
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }
function D6({ value, rolling }) {
  return <span role="img" aria-label={`Die showing ${value}`} className={`inline-grid h-20 w-20 grid-cols-3 grid-rows-3 gap-1 rounded-2xl border-2 border-[var(--border)] bg-white p-2 shadow ${rolling ? 'animate-bounce' : ''}`}>
    {Array.from({ length: 9 }, (_, i) => <span key={i} className={`m-auto h-3.5 w-3.5 rounded-full ${PIPS[value]?.includes(i) ? 'bg-[#182139]' : ''}`} />)}
  </span>
}
function Face({ value, sides, rolling }) {
  if (sides === 6 && PIPS[value]) return <D6 value={value} rolling={rolling} />
  return <span className={`inline-flex min-h-20 min-w-20 items-center justify-center rounded-2xl border-2 border-[var(--border)] bg-white px-3 text-center text-2xl font-black text-[#182139] shadow ${rolling ? 'animate-bounce' : ''}`}>{value}</span>
}

const STORY_FACES = ['👑 King', '🐉 Dragon', '🚀 Spaceship', '🏝️ Desert island', '🔑 Key', '🌧️ Storm', '🐶 Dog', '🏰 Castle', '🎁 Present', '🧙 Wizard', '🍕 Pizza', '🌙 Night', '🗺️ Map', '🤖 Robot', '🦁 Lion', '🚂 Train', '👻 Friendly ghost', '🌋 Volcano', '🧁 Cupcake', '🕵️ Detective', '🐙 Octopus', '🎈 Balloon', '🧭 Compass', '🦄 Unicorn']
const EMOTIONS = ['😀 Happy', '😢 Sad', '😠 Angry', '😨 Scared', '😮 Surprised', '😌 Calm', '🤩 Excited', '😳 Embarrassed', '😕 Confused', '🥰 Loved', '😤 Frustrated', '😴 Tired']
const DICE_PRESETS = {
  standard: { counts: [1, 2, 3, 4, 5, 6], count: 1, sides: 6 },
  backgammon: { counts: [2], count: 2, sides: 6, mode: 'backgammon' },
  monopoly: { counts: [2], count: 2, sides: 6, mode: 'monopoly' },
  polyhedral: { counts: [1, 2, 3], count: 1, sideOptions: [4, 6, 8, 10, 12, 20], sides: 20 },
  dnd: { counts: [1, 2, 3, 4], count: 1, sideOptions: [4, 6, 8, 10, 12, 20, 100], sides: 20, modifier: true },
  story: { counts: [3, 4, 5], count: 3, faces: STORY_FACES },
  emotions: { counts: [1], count: 1, faces: EMOTIONS },
}

function DiceRoller({ preset }) {
  const cfg = DICE_PRESETS[preset]
  const [count, setCount] = useState(cfg.count), [sides, setSides] = useState(cfg.sides || 6), [mod, setMod] = useState('0')
  const [values, setValues] = useState(() => Array.from({ length: cfg.count }, () => cfg.faces ? cfg.faces[0] : 1))
  const [rolling, setRolling] = useState(false), [history, setHistory] = useState([]), [doubles, setDoubles] = useState(0)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  function roll() {
    const next = cfg.faces ? shuffle(cfg.faces).slice(0, count) : Array.from({ length: count }, () => randomInt(1, sides))
    setRolling(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setRolling(false); setValues(next)
      const isDouble = next.length === 2 && next[0] === next[1]
      if (cfg.mode === 'monopoly') setDoubles(d => isDouble ? d + 1 : 0)
      setHistory(h => [next, ...h].slice(0, 12))
    }, reduced() ? 0 : 450)
  }
  const numeric = !cfg.faces
  const total = numeric ? values.reduce((s, v) => s + v, 0) + (cfg.modifier ? Number(mod) || 0 : 0) : null
  const isDouble = values.length === 2 && values[0] === values[1]
  return <Panel label="Dice roller" className="text-center">
    <div className="flex flex-wrap justify-center gap-3">
      {cfg.counts.length > 1 && <Select label="How many dice" value={count} onChange={e => { const n = Number(e.target.value); setCount(n); setValues(Array.from({ length: n }, () => cfg.faces ? cfg.faces[0] : 1)) }} options={cfg.counts.map(n => [n, String(n)])} />}
      {cfg.sideOptions && <Select label="Die" value={sides} onChange={e => setSides(Number(e.target.value))} options={cfg.sideOptions.map(n => [n, `d${n} (1–${n})`])} />}
      {cfg.modifier && <Field label="Modifier (+/−)" type="number" step="1" value={mod} onChange={e => setMod(e.target.value)} className="w-36" />}
    </div>
    <div className="flex min-h-28 flex-wrap items-center justify-center gap-3" aria-live="polite">
      {values.map((v, i) => <Face key={i} value={v} sides={cfg.faces ? 0 : sides} rolling={rolling} />)}
    </div>
    {numeric && !rolling && <p className="text-2xl font-black" aria-live="polite">{values.length > 1 || cfg.modifier ? `Total: ${total}` : `You rolled ${values[0]}`}</p>}
    {cfg.mode === 'backgammon' && !rolling && isDouble && history.length > 0 && <p className="text-lg font-bold">Doubles! Move {values[0]} four times.</p>}
    {cfg.mode === 'monopoly' && !rolling && history.length > 0 && <p className="text-lg font-bold">{doubles >= 3 ? 'Third doubles in a row: go to jail!' : isDouble ? `Doubles (${doubles} in a row). Roll again after your move.` : 'No doubles.'}</p>}
    {cfg.faces && !rolling && history.length > 0 && <p className="text-lg">{preset === 'story' ? 'Tell a story that uses every picture, in any order.' : 'Share a time you felt this way, or what helps when you do.'}</p>}
    <button className={bigButtonClass} onClick={roll} disabled={rolling}>🎲 Roll</button>
    {history.length > 1 && <div className="text-sm"><h2 className="font-bold">Last rolls</h2><p>{history.slice(1).map(h => h.join(numeric ? ' + ' : ', ')).join(' · ')}</p></div>}
  </Panel>
}

const DICE_FAQ = {
  standard: [
    { q: 'Is this dice roller really random?', a: 'Yes. Every roll uses your browser\'s secure random number generator, so each face has the same chance and earlier rolls never affect the next one.' },
    { q: 'Can I roll more than one die?', a: 'Choose up to six dice. The page adds them up for you and keeps the last few rolls, which helps in board games where you need to check a score.' },
    { q: 'Does it work without internet?', a: 'Once the page has loaded the dice keep working, even if the connection drops. Nothing is sent to a server.' },
  ],
  backgammon: [
    { q: 'What happens when I roll doubles in backgammon?', a: 'You play the number four times instead of twice. The page reminds you whenever both dice match.' },
    { q: 'Who starts a game of backgammon?', a: 'Each player rolls one die and the higher number starts, using both of those dice as the first move. Roll again on a tie.' },
  ],
  monopoly: [
    { q: 'What do doubles mean in Monopoly?', a: 'You move, then roll again. Three doubles in a row sends you straight to jail, and the page counts them for you.' },
    { q: 'Can I use this if we lost the dice?', a: 'Yes. Put a phone or tablet in the middle of the table and press Roll on your turn.' },
  ],
  polyhedral: [
    { q: 'What is a polyhedral die?', a: 'A die with more or fewer than six faces: d4, d8, d10, d12 and d20. They are used in role-playing games, math lessons and probability experiments.' },
    { q: 'How can I use it in a math lesson?', a: 'Roll a d20 forty times and tally the results, or roll two d10s to make a two-digit number and practise place value.' },
  ],
  dnd: [
    { q: 'Which dice does D&D use?', a: 'A d4, d6, d8, d10, d12, d20 and the percentile d100. Pick the die, the number of dice and your modifier, and the page shows the total.' },
    { q: 'How do I roll 2d6 + 3?', a: 'Choose d6, two dice and a modifier of 3. The total includes the modifier.' },
  ],
  story: [
    { q: 'How do story dice work?', a: 'Roll three to five picture dice and tell a story that uses every picture. Start with "Once upon a time" and pass the story around the table.' },
    { q: 'What ages are story dice for?', a: 'From about age four with an adult, and for older children as a writing prompt. They also work well for English speaking practice.' },
  ],
  emotions: [
    { q: 'How do I use an emotions die?', a: 'Roll it and talk about the feeling: when you felt it, what it looks like on a face, and what helps. It works in a classroom circle or at the dinner table.' },
    { q: 'Is it suitable for young children?', a: 'Yes. Each face has an emoji and a simple word, so even children who are not reading yet can join in.' },
  ],
}
const DICE_PAGES = {
  standard: { path: '/en/tools/dice', h1: '🎲 Roll the dice online', intro: 'Roll one to six dice for board games, math games and classroom activities. The total is added up for you.' },
  backgammon: { path: '/en/tools/dice/backgammon', h1: '🎲 Backgammon dice roller', intro: 'Two dice for backgammon, with a reminder whenever you roll doubles.' },
  monopoly: { path: '/en/tools/dice/monopoly', h1: '🎲 Monopoly dice roller', intro: 'Two dice for Monopoly that count your doubles, so you know when to go to jail.' },
  polyhedral: { path: '/en/tools/dice/polyhedral', h1: '🎲 Polyhedral dice: d4 to d20', intro: 'Roll a d4, d6, d8, d10, d12 or d20 for games and probability lessons.' },
  dnd: { path: '/en/tools/dice/dnd', h1: '🐉 D&D dice roller', intro: 'Every D&D die from d4 to d100, several dice at once and a modifier added to the total.' },
  story: { path: '/en/tools/dice/story-dice', h1: '📖 Story dice', intro: 'Roll picture dice and make up a story that uses every picture.' },
  emotions: { path: '/en/tools/dice/emotions', h1: '😀 Emotions dice', intro: 'Roll a feeling and talk about it. A gentle way to start a conversation about emotions.' },
}
const DICE_LINKS = Object.entries(DICE_PAGES)

export function Dice({ preset = 'standard' }) {
  const page = DICE_PAGES[preset]
  return <ToolFrame path={page.path} h1={page.h1} intro={page.intro} width="max-w-3xl" faq={DICE_FAQ[preset]} bodyTitle="Questions and answers"
    related={[{ href: '/en/tools/random-number', label: 'random number generator' }, { href: '/en/tools/coin-flip', label: 'flip a coin' }, { href: '/en/tools', label: 'all free tools' }]}>
    <DiceRoller key={preset} preset={preset} />
    <nav aria-label="More dice" className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
      {DICE_LINKS.filter(([k]) => k !== preset).map(([k, p]) => <Link key={k} to={p.path} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold">{p.h1}</Link>)}
    </nav>
  </ToolFrame>
}

// ── random number ──
export function RandomNumber() {
  const [min, setMin] = useState('1'), [max, setMax] = useState('100'), [count, setCount] = useState('1'), [unique, setUnique] = useState(true)
  const [result, setResult] = useState(null), [error, setError] = useState('')
  function draw() {
    const a = Number(min), b = Number(max), n = Number(count)
    if (![a, b, n].every(Number.isSafeInteger)) return setError('Use whole numbers only.')
    if (a > b) return setError('The lowest number must not be bigger than the highest.')
    if (n < 1 || n > 500) return setError('Draw between 1 and 500 numbers at a time.')
    if (unique && n > b - a + 1) return setError(`There are only ${b - a + 1} different numbers in that range.`)
    setError('')
    if (unique) {
      const seen = new Set()
      while (seen.size < n) seen.add(randomInt(a, b))
      setResult([...seen])
    } else setResult(Array.from({ length: n }, () => randomInt(a, b)))
  }
  return <ToolFrame path="/en/tools/random-number" h1="🔢 Random number generator" intro="Pick a random number in any range, or draw several at once with no repeats." width="max-w-3xl"
    faq={[
      { q: 'How do I pick a random number between 1 and 10?', a: 'Type 1 as the lowest number and 10 as the highest, then press Draw. Each number has the same chance.' },
      { q: 'Can I draw several numbers without repeats?', a: 'Yes. Set how many numbers you need and keep "No repeats" ticked, which is handy for raffles, lottery-style games and calling on students.' },
      { q: 'Is it fair?', a: 'The numbers come from your browser\'s secure random generator, and nothing about the previous draw affects the next one.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/dice', label: 'online dice' }, { href: '/en/tools/random-picker', label: 'spin the wheel' }]}>
    <Panel label="Random number">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Lowest" type="number" value={min} onChange={e => setMin(e.target.value)} />
        <Field label="Highest" type="number" value={max} onChange={e => setMax(e.target.value)} />
        <Field label="How many" type="number" min="1" max="500" value={count} onChange={e => setCount(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={unique} onChange={e => setUnique(e.target.checked)} /> No repeats</label>
      <button className={bigButtonClass} onClick={draw}>Draw</button>
      <div aria-live="polite">
        {error && <p role="alert">{error}</p>}
        {!error && result && <p className={`${result.length === 1 ? 'text-7xl' : 'text-2xl'} text-center font-black`}>{result.join(', ')}</p>}
      </div>
    </Panel>
  </ToolFrame>
}

// ── coin flip ──
export function CoinFlip() {
  const [side, setSide] = useState(null), [flipping, setFlipping] = useState(false), [tally, setTally] = useState({ heads: 0, tails: 0 })
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  function flip() {
    const next = randomInt(0, 1) ? 'heads' : 'tails'
    setFlipping(true)
    timer.current = setTimeout(() => { setSide(next); setFlipping(false); setTally(t => ({ ...t, [next]: t[next] + 1 })) }, reduced() ? 0 : 700)
  }
  const total = tally.heads + tally.tails
  return <ToolFrame path="/en/tools/coin-flip" h1="🪙 Flip a coin online" intro="Heads or tails? Settle it in one tap, and keep score of every flip." width="max-w-3xl"
    faq={[
      { q: 'Is an online coin flip fair?', a: 'Yes. Each flip has exactly a 50% chance of heads and of tails, picked by your browser\'s secure random generator.' },
      { q: 'Why do I get several heads in a row?', a: 'Streaks are normal with real randomness. Over many flips the counts get closer to half and half, which makes a nice probability lesson.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/dice', label: 'online dice' }, { href: '/en/tools/random-picker', label: 'spin the wheel' }]}>
    <Panel label="Coin" className="text-center">
      <div aria-live="polite" className={`mx-auto flex h-44 w-44 items-center justify-center rounded-full border-4 border-[#b8860b] bg-[#ffd54a] text-2xl font-black text-[#5b4300] shadow-lg ${flipping ? 'animate-spin' : ''}`}>
        {flipping ? '' : side === 'heads' ? '👑 Heads' : side === 'tails' ? '🦅 Tails' : '?'}
      </div>
      <button className={bigButtonClass} onClick={flip} disabled={flipping}>Flip the coin</button>
      {total > 0 && <p>Heads {tally.heads} · Tails {tally.tails} · {total} flips <button className="underline" onClick={() => setTally({ heads: 0, tails: 0 })}>Reset</button></p>}
    </Panel>
  </ToolFrame>
}

// ── spin the bottle ──
export function SpinBottle() {
  const [angle, setAngle] = useState(0), [spinning, setSpinning] = useState(false), [players, setPlayers] = useState('')
  const names = players.split(/\n|,/).map(s => s.trim()).filter(Boolean).slice(0, 16)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  function spin() {
    setSpinning(true)
    setAngle(a => a + 1440 + randomInt(0, 359))
    timer.current = setTimeout(() => setSpinning(false), reduced() ? 0 : 3200)
  }
  const pointed = names.length ? names[Math.floor((((angle % 360) + 360) % 360 + 180 / names.length) / (360 / names.length)) % names.length] : null
  return <ToolFrame path="/en/tools/spin-the-bottle" h1="🍾 Spin the bottle" intro="A virtual bottle for party games and classroom turns. Add names to see exactly who it points to." width="max-w-3xl"
    faq={[
      { q: 'How do you play spin the bottle with kids?', a: 'Sit in a circle and take turns spinning. The person the bottle points to answers a fun question, does a silly challenge or takes the next turn. Keep it friendly and let anyone pass.' },
      { q: 'Can the bottle show a name?', a: 'Yes. Type the players in the order they sit, and the page shows whose name the bottle stops on.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/true-or-false', label: 'true or false game' }, { href: '/en/tools/random-picker', label: 'spin the wheel' }]}>
    <Panel label="Bottle" className="text-center">
      <div className="relative mx-auto h-72 w-72 rounded-full border-2 border-dashed border-[var(--border)]">
        {names.map((n, i) => { const a = (i * 360) / names.length * Math.PI / 180; return <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 text-sm font-bold text-[#182139]" style={{ left: `${50 + 46 * Math.sin(a)}%`, top: `${50 - 46 * Math.cos(a)}%` }}>{n}</span> })}
        <svg aria-hidden="true" viewBox="0 0 40 120" className="absolute left-1/2 top-1/2 h-44 w-16" style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)`, transition: spinning && !reduced() ? 'transform 3.2s cubic-bezier(.17,.67,.2,1)' : 'none' }}>
          <rect x="15" y="4" width="10" height="34" rx="3" fill="#2e7d32" /><rect x="14" y="2" width="12" height="7" rx="2" fill="#c62828" />
          <path d="M15 36 Q4 46 4 62 L4 112 Q4 118 10 118 L30 118 Q36 118 36 112 L36 62 Q36 46 25 36 Z" fill="#43a047" stroke="#1b5e20" strokeWidth="2" />
          <rect x="8" y="70" width="24" height="22" rx="3" fill="#fff8e1" />
        </svg>
      </div>
      <p aria-live="polite" className="min-h-8 text-2xl font-black">{!spinning && pointed && angle > 0 ? `It's ${pointed}!` : ''}</p>
      <button className={bigButtonClass} onClick={spin} disabled={spinning}>Spin the bottle</button>
      <label className="block text-left font-bold">Players, in seating order (optional, one per line)<textarea className={inputClass} rows={3} value={players} onChange={e => setPlayers(e.target.value)} /></label>
    </Panel>
  </ToolFrame>
}

// ── wheel ──
const WHEEL_COLORS = ['#ff8a80', '#ffd180', '#ffff8d', '#ccff90', '#a7ffeb', '#80d8ff', '#b388ff', '#f8bbd0']
export function RandomPicker() {
  const [text, setText] = useState('Maya\nNoah\nLiam\nEmma\nAva\nLeo')
  const [rotation, setRotation] = useState(0), [spinning, setSpinning] = useState(false), [winner, setWinner] = useState(null), [removeWinner, setRemoveWinner] = useState(false)
  const items = text.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 60)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  function spin() {
    if (items.length < 2) return
    const plan = planSpin(items.length, rotation)
    setWinner(null); setSpinning(true); setRotation(plan.rotation)
    timer.current = setTimeout(() => {
      setSpinning(false); setWinner(items[plan.index])
      if (removeWinner) setText(items.filter((_, i) => i !== plan.index).join('\n'))
    }, reduced() ? 0 : 4200)
  }
  const n = Math.max(items.length, 1), size = 360 / n
  const slices = items.map((item, i) => {
    const a0 = (i * size - 90) * Math.PI / 180, a1 = ((i + 1) * size - 90) * Math.PI / 180, mid = ((i + .5) * size - 90) * Math.PI / 180
    const large = size > 180 ? 1 : 0
    return <g key={i}>
      <path d={`M100 100 L${100 + 98 * Math.cos(a0)} ${100 + 98 * Math.sin(a0)} A98 98 0 ${large} 1 ${100 + 98 * Math.cos(a1)} ${100 + 98 * Math.sin(a1)} Z`} fill={WHEEL_COLORS[i % WHEEL_COLORS.length]} stroke="#182139" strokeWidth=".6" />
      <text x={100 + 60 * Math.cos(mid)} y={100 + 60 * Math.sin(mid)} fontSize={n > 20 ? 5 : n > 10 ? 7 : 9} textAnchor="middle" dominantBaseline="middle" fill="#182139" transform={`rotate(${(i + .5) * size} ${100 + 60 * Math.cos(mid)} ${100 + 60 * Math.sin(mid)})`}>{item.length > 16 ? item.slice(0, 15) + '…' : item}</text>
    </g>
  })
  return <ToolFrame path="/en/tools/random-picker" h1="🎡 Spin the wheel: random name picker" intro="Type names, prizes or tasks, spin the wheel and let it choose. Perfect for classrooms, raffles and party games." width="max-w-5xl"
    faq={[
      { q: 'How do I pick a random name from a list?', a: 'Type one name per line, press Spin and wait for the wheel to stop. The arrow at the top points to the winner.' },
      { q: 'Can the wheel skip names that were already picked?', a: 'Tick "Remove the winner after each spin" and every name comes up only once. That is fair for choosing who reads next or who presents first.' },
      { q: 'Is the wheel really random?', a: 'Yes. The winner is chosen at random before the wheel starts turning, and every slice has the same chance.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/team-generator', label: 'team generator' }, { href: '/en/tools/random-number', label: 'random number generator' }]}>
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div className="text-center">
        <div className="relative mx-auto w-full max-w-[460px]">
          <span aria-hidden="true" className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-4xl">🔻</span>
          <svg viewBox="0 0 200 200" role="img" aria-label="Wheel of names" className="w-full" style={{ transform: `rotate(${rotation}deg)`, transition: spinning && !reduced() ? 'transform 4.2s cubic-bezier(.12,.67,.15,1)' : 'none' }}>{items.length ? slices : <circle cx="100" cy="100" r="98" fill="#eee" />}<circle cx="100" cy="100" r="8" fill="#182139" /></svg>
        </div>
        <p aria-live="polite" className="min-h-10 text-3xl font-black">{winner ? `🎉 ${winner}` : ''}</p>
        <button className={bigButtonClass} onClick={spin} disabled={spinning || items.length < 2}>Spin</button>
      </div>
      <Panel label="Wheel entries">
        <label className="block font-bold">Entries, one per line<textarea className={inputClass} rows={10} value={text} onChange={e => setText(e.target.value)} /></label>
        <p className="text-sm">{items.length} entries{items.length < 2 ? ' · add at least two' : ''}</p>
        <label className="flex items-center gap-2"><input type="checkbox" checked={removeWinner} onChange={e => setRemoveWinner(e.target.checked)} /> Remove the winner after each spin</label>
        <button className={buttonClass} onClick={() => setText(shuffle(items).join('\n'))}>Shuffle the order</button>
      </Panel>
    </div>
  </ToolFrame>
}

// ── teams ──
const TEAM_NAMES = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Teal', 'Silver', 'Gold']
export function TeamGenerator() {
  const [text, setText] = useState(''), [mode, setMode] = useState('teams'), [num, setNum] = useState('2'), [teams, setTeams] = useState(null), [error, setError] = useState(''), [copied, setCopied] = useState(false)
  const names = text.split(/\n|,/).map(s => s.trim()).filter(Boolean)
  function make() {
    const n = Number(num)
    if (names.length < 2) return setError('Add at least two names.')
    if (!Number.isInteger(n) || n < 1) return setError('Choose a whole number.')
    const count = mode === 'teams' ? n : Math.ceil(names.length / n)
    if (count < 1 || count > names.length) return setError('There are not enough names for that many teams.')
    setError('')
    const out = Array.from({ length: count }, () => [])
    shuffle(names).forEach((name, i) => out[i % count].push(name))
    setTeams(out); setCopied(false)
  }
  const asText = teams ? teams.map((t, i) => `${TEAM_NAMES[i] || `Team ${i + 1}`} team: ${t.join(', ')}`).join('\n') : ''
  return <ToolFrame path="/en/tools/team-generator" h1="👥 Random team generator" intro="Paste a list of names and split it into fair random teams or groups in one click." width="max-w-4xl"
    faq={[
      { q: 'How do I split a class into random groups?', a: 'Paste the names (one per line or separated by commas), choose the number of teams or the number of people per team, and press Make teams. Press it again for a new mix.' },
      { q: 'What if the names do not divide evenly?', a: 'The teams differ by one person at most. The extra people are spread across the first teams.' },
      { q: 'Are the names saved?', a: 'No. The list stays on this page in your browser and disappears when you close it.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/scoreboard', label: 'scoreboard' }, { href: '/en/tools/random-picker', label: 'spin the wheel' }]}>
    <Panel label="Names and teams">
      <label className="block font-bold">Names<textarea className={inputClass} rows={8} value={text} onChange={e => setText(e.target.value)} placeholder={'Maya\nNoah\nLiam\nEmma'} /></label>
      <p className="text-sm">{names.length} names</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Split by" value={mode} onChange={e => setMode(e.target.value)} options={[['teams', 'Number of teams'], ['size', 'People per team']]} />
        <Field label={mode === 'teams' ? 'Number of teams' : 'People per team'} type="number" min="1" value={num} onChange={e => setNum(e.target.value)} />
      </div>
      <button className={bigButtonClass} onClick={make}>Make teams</button>
      {error && <p role="alert">{error}</p>}
    </Panel>
    {teams && <div aria-live="polite" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((t, i) => <div key={i} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><h2 className="text-xl font-black">{TEAM_NAMES[i] || `Team ${i + 1}`} team</h2><ul className="mt-2 list-disc pl-5">{t.map(n => <li key={n}>{n}</li>)}</ul></div>)}
      <button className={buttonClass} onClick={async () => setCopied(await copyText(asText))}>{copied ? 'Copied ✓' : 'Copy the teams'}</button>
    </div>}
  </ToolFrame>
}
