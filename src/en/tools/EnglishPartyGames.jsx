// English party and classroom games: drawing prompts, jokes, riddles, true or false, secret codes and
// Name-Place-Animal-Thing. Content banks live in partyContent.js.
import { useEffect, useRef, useState } from 'react'
import ToolFrame from './ToolFrame'
import { Field, Panel, Select, bigButtonClass, buttonClass, inputClass, pick, randomInt } from './ui'
import PrintPreview from '../../components/ui/PrintPreview'
import { shuffle } from '../../utils/shuffle'
import { DRAWING_PROMPTS, DRAWING_TWISTS, JOKES, RIDDLES, TRUE_FALSE, CATEGORY_SETS, LETTERS } from './partyContent'

// Draws from a shuffled deck so nothing repeats until the whole list has been shown.
function useDeck(items) {
  const deck = useRef([])
  return () => {
    if (!deck.current.length) deck.current = shuffle(items.map((_, i) => i))
    return items[deck.current.pop()]
  }
}

// ── drawing prompt ──
export function DrawingPrompt() {
  const [level, setLevel] = useState('easy'), [twist, setTwist] = useState(false), [prompt, setPrompt] = useState(null)
  const next = () => setPrompt({ text: pick(DRAWING_PROMPTS[level]), twist: twist ? pick(DRAWING_TWISTS) : null })
  return <ToolFrame path="/en/tools/drawing-prompt" h1="🎨 What should I draw? Drawing ideas" intro="Press the button for a random drawing idea, from easy ones for little kids to creative challenges, with an optional twist." width="max-w-2xl"
    faq={[
      { q: 'What should I draw when I am bored?', a: 'Press "Give me an idea" and draw whatever comes up. If you do not like it, press again. Adding a twist, like using only three colors, makes it even more fun.' },
      { q: 'Can I use it in class?', a: 'Yes. Show one prompt on the board and let everyone draw it, then compare how different the drawings are. It is a great warm-up for an art lesson.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/printables', label: 'free printables' }, { href: '/en/tools/random-picker', label: 'spin the wheel' }]}>
    <Panel label="Drawing idea" className="text-center">
      <div className="flex flex-wrap items-end justify-center gap-3">
        <Select label="Level" value={level} onChange={e => setLevel(e.target.value)} options={[['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Challenge']]} />
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={twist} onChange={e => setTwist(e.target.checked)} /> Add a twist</label>
      </div>
      <div aria-live="polite" className="min-h-32 rounded-2xl bg-[var(--postit)] p-6">
        {prompt ? <><p className="text-sm font-bold uppercase">Draw…</p><p className="text-3xl font-black">{prompt.text}</p>{prompt.twist && <p className="mt-2 text-lg">✨ {prompt.twist}</p>}</> : <p className="text-xl">Press the button for an idea.</p>}
      </div>
      <button className={bigButtonClass} onClick={next}>🎨 Give me an idea</button>
    </Panel>
  </ToolFrame>
}

// ── jokes ──
export function Joke() {
  const draw = useDeck(JOKES)
  const [joke, setJoke] = useState(null), [shown, setShown] = useState(false)
  return <ToolFrame path="/en/tools/joke" h1="😂 Jokes for kids" intro="A random clean joke for kids. Read the question, guess, then reveal the punchline." width="max-w-2xl"
    faq={[
      { q: 'Are these jokes suitable for young children?', a: 'Yes. They are short, clean puns and silly questions for children from about age five, and fun for grown-ups too.' },
      { q: 'How can I use jokes in class?', a: 'Start or end a lesson with a joke of the day. Puns are also a great way to talk about words with two meanings.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/riddles', label: 'riddles for kids' }, { href: '/en/tools/true-or-false', label: 'true or false game' }]}>
    <Panel label="Joke" className="text-center">
      <div aria-live="polite" className="min-h-40 rounded-2xl bg-[var(--postit)] p-6">
        {joke ? <><p className="text-2xl font-black">{joke[0]}</p>{shown ? <p className="mt-4 text-2xl">{joke[1]} 😄</p> : <button className={`${buttonClass} mt-4`} onClick={() => setShown(true)}>Show the punchline</button>}</> : <p className="text-xl">Ready to laugh?</p>}
      </div>
      <button className={bigButtonClass} onClick={() => { setJoke(draw()); setShown(false) }}>{joke ? 'Another joke' : 'Tell me a joke'}</button>
    </Panel>
  </ToolFrame>
}

// ── riddles ──
export function Riddles() {
  const draw = useDeck(RIDDLES)
  const [riddle, setRiddle] = useState(null), [shown, setShown] = useState(false), [score, setScore] = useState({ right: 0, total: 0 })
  const next = () => { setRiddle(draw()); setShown(false) }
  return <ToolFrame path="/en/tools/riddles" h1="🧩 Riddles for kids, with answers" intro="Classic brain teasers and riddles with hidden answers. Think it over, then reveal the answer and keep score." width="max-w-2xl"
    faq={[
      { q: 'What age are these riddles for?', a: 'Most suit children from about seven, and some are tricky enough for teens and adults. Younger kids enjoy them when an adult reads them aloud.' },
      { q: 'How can I use riddles with a group?', a: 'Split into teams and read one riddle at a time. The first team to answer gets a point. Our scoreboard can keep track.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/joke', label: 'jokes for kids' }, { href: '/en/tools/scoreboard', label: 'scoreboard' }]}>
    <Panel label="Riddle" className="text-center">
      <div aria-live="polite" className="min-h-40 rounded-2xl bg-[var(--postit)] p-6">
        {riddle ? <><p className="text-2xl font-black">{riddle[0]}</p>{shown ? <p className="mt-4 text-2xl">💡 {riddle[1]}</p> : <button className={`${buttonClass} mt-4`} onClick={() => setShown(true)}>Show the answer</button>}</> : <p className="text-xl">Press the button for a riddle.</p>}
      </div>
      {riddle && shown && <div className="flex justify-center gap-2"><button className={buttonClass} onClick={() => { setScore(s => ({ right: s.right + 1, total: s.total + 1 })); next() }}>✅ I got it</button><button className={buttonClass} onClick={() => { setScore(s => ({ ...s, total: s.total + 1 })); next() }}>❌ Not this time</button></div>}
      {(!riddle || !shown) && <button className={bigButtonClass} onClick={next}>{riddle ? 'Skip' : 'Give me a riddle'}</button>}
      {score.total > 0 && <p>Solved {score.right} of {score.total}</p>}
    </Panel>
  </ToolFrame>
}

// ── true or false ──
export function TrueOrFalse() {
  const topics = Object.keys(TRUE_FALSE)
  const [chosen, setChosen] = useState(topics), [card, setCard] = useState(null), [answer, setAnswer] = useState(null), [players, setPlayers] = useState(1), [turn, setTurn] = useState(0), [scores, setScores] = useState([0, 0, 0, 0])
  const pool = useRef({})
  function next() {
    const list = chosen.length ? chosen : topics
    const topic = pick(list)
    if (!pool.current[topic]?.length) pool.current[topic] = shuffle(TRUE_FALSE[topic].items)
    setCard({ topic, item: pool.current[topic].pop() }); setAnswer(null)
  }
  function guess(value) {
    if (!card || answer !== null) return
    const right = value === card.item[1]
    setAnswer(right)
    if (right) setScores(s => s.map((v, i) => i === turn ? v + 1 : v))
    if (players > 1) setTurn(t => (t + 1) % players)
  }
  useEffect(() => { setTurn(0); setScores([0, 0, 0, 0]) }, [players])
  return <ToolFrame path="/en/tools/true-or-false" h1="✅ True or false? A fun fact game for kids" intro="Read a surprising statement and decide: true or false? Animals, space, the human body, food and the world, for one to four players." width="max-w-3xl"
    faq={[
      { q: 'How do you play true or false?', a: 'A statement appears and the player (or team) whose turn it is says true or false. A correct answer earns a point, and then it is the next player\'s turn.' },
      { q: 'What age is it for?', a: 'From about six, and for the whole family. The facts are short, and an adult can read them aloud to children who do not read yet.' },
      { q: 'Are the facts checked?', a: 'Yes, each one was checked before it went in. Some sound unbelievable, which is the fun part: look them up together afterwards.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/riddles', label: 'riddles' }, { href: '/en/tools/scoreboard', label: 'scoreboard' }]}>
    <Panel label="True or false game" className="text-center">
      <div className="flex flex-wrap justify-center gap-2">{topics.map(t => <label key={t} className="flex items-center gap-1 rounded-full border-2 border-[var(--border)] px-3 py-1"><input type="checkbox" checked={chosen.includes(t)} onChange={e => setChosen(e.target.checked ? [...chosen, t] : chosen.filter(x => x !== t))} />{TRUE_FALSE[t].label}</label>)}</div>
      <Select label="Players or teams" value={players} onChange={e => setPlayers(Number(e.target.value))} options={[1, 2, 3, 4].map(n => [n, String(n)])} className="mx-auto max-w-xs" />
      {players > 1 && <p className="text-lg font-bold">{answer === null && card ? `Player ${turn + 1}'s turn` : ''}</p>}
      <div aria-live="polite" className="min-h-36 rounded-2xl bg-[var(--postit)] p-6">
        {card ? <><p className="text-sm font-bold">{TRUE_FALSE[card.topic].label}</p><p className="text-2xl font-black">{card.item[0]}</p>{answer !== null && <p className="mt-3 text-2xl">{answer ? '🎉 Correct!' : '😮 Not quite!'} It is {card.item[1] ? 'TRUE' : 'FALSE'}.</p>}</> : <p className="text-xl">Press Start for the first statement.</p>}
      </div>
      {card && answer === null ? <div className="flex justify-center gap-3"><button className={bigButtonClass} onClick={() => guess(true)}>👍 True</button><button className={bigButtonClass} onClick={() => guess(false)}>👎 False</button></div>
        : <button className={bigButtonClass} onClick={next}>{card ? 'Next statement' : 'Start'}</button>}
      <p className="text-lg">{players === 1 ? `Score: ${scores[0]}` : scores.slice(0, players).map((s, i) => `Player ${i + 1}: ${s}`).join(' · ')}</p>
    </Panel>
  </ToolFrame>
}

// ── secret codes ──
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' }
const FROM_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]))
const CIPHERS = [['caesar', 'Caesar shift'], ['atbash', 'Atbash (A↔Z)'], ['numbers', 'Letters to numbers (A=1)'], ['morse', 'Morse code'], ['reverse', 'Backwards writing']]
const shiftChar = (c, k) => { const i = AZ.indexOf(c.toUpperCase()); if (i < 0) return c; const out = AZ[(i + k + 26 * 4) % 26]; return c === c.toLowerCase() ? out.toLowerCase() : out }
function encodeCipher(cipher, text, key = 3) {
  if (cipher === 'caesar') return [...text].map(c => shiftChar(c, key)).join('')
  if (cipher === 'atbash') return [...text].map(c => { const i = AZ.indexOf(c.toUpperCase()); if (i < 0) return c; const out = AZ[25 - i]; return c === c.toLowerCase() ? out.toLowerCase() : out }).join('')
  if (cipher === 'numbers') return text.trim().split(/\s+/).filter(Boolean).map(w => [...w.toUpperCase()].filter(c => AZ.includes(c) || /\d/.test(c)).map(c => AZ.includes(c) ? AZ.indexOf(c) + 1 : c).join('-')).filter(Boolean).join(' / ')
  if (cipher === 'morse') return text.toUpperCase().split(/\s+/).filter(Boolean).map(w => [...w].map(c => MORSE[c] || c).join(' ')).join(' / ')
  return text.split('').reverse().join('')
}
function decodeCipher(cipher, text, key = 3) {
  if (cipher === 'caesar') return encodeCipher('caesar', text, -key)
  if (cipher === 'atbash' || cipher === 'reverse') return encodeCipher(cipher, text, key)
  if (cipher === 'numbers') return text.trim().split(/\s*\/\s*/).map(w => w.split(/[-\s,]+/).filter(Boolean).map(n => /^\d+$/.test(n) && +n >= 1 && +n <= 26 ? AZ[n - 1] : n).join('')).join(' ')
  return text.trim().split(/\s*\/\s*/).map(w => w.split(/\s+/).filter(Boolean).map(s => FROM_MORSE[s] || '?').join('')).join(' ')
}
function KeyTable({ cipher, shift }) {
  if (cipher === 'reverse') return <p>Write every letter in reverse order, from the last to the first.</p>
  const code = c => cipher === 'morse' ? MORSE[c] : cipher === 'numbers' ? AZ.indexOf(c) + 1 : encodeCipher(cipher, c, shift)
  return <div className="grid grid-cols-6 gap-1 sm:grid-cols-9">{[...AZ].map(c => <div key={c} className="rounded border border-[var(--border)] bg-white p-1 text-center text-[#182139]"><b>{c}</b><br /><span className="font-mono">{code(c)}</span></div>)}</div>
}
export function SecretCodes() {
  const [cipher, setCipher] = useState('caesar'), [shift, setShift] = useState(3), [mode, setMode] = useState('encode'), [text, setText] = useState('Meet me at the tree house'), [printing, setPrinting] = useState(false)
  const out = mode === 'encode' ? encodeCipher(cipher, text, shift) : decodeCipher(cipher, text, shift)
  const name = CIPHERS.find(c => c[0] === cipher)[1]
  return <ToolFrame path="/en/tools/secret-codes" h1="🕵️ Secret code maker for kids" intro="Encode and decode secret messages with the Caesar cipher, Atbash, number codes, Morse code and backwards writing. Print the message with its code key." width="max-w-4xl"
    faq={[
      { q: 'What is the Caesar cipher?', a: 'Every letter moves a fixed number of places along the alphabet. With a shift of 3, A becomes D, B becomes E and so on. Julius Caesar is said to have used it for his letters.' },
      { q: 'How do I decode a message?', a: 'Choose the same code (and the same shift, for Caesar), switch to "Decode" and paste the secret message.' },
      { q: 'How do I write numbers and Morse code?', a: 'For letters to numbers, separate letters with dashes and words with a slash: 8-9 / 13-15-13. For Morse, separate letters with spaces and words with a slash.' },
      { q: 'How can I use it in a treasure hunt?', a: 'Print a coded clue with the key on the page, or keep the key hidden somewhere else as an extra challenge.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/scavenger-hunt-maker', label: 'scavenger hunt maker' }, { href: '/en/tools/riddles', label: 'riddles' }]}>
    <div className="grid gap-6 md:grid-cols-2">
      <Panel label="Message">
        <Select label="Code" value={cipher} onChange={e => setCipher(e.target.value)} options={CIPHERS} />
        {cipher === 'caesar' && <Select label="Shift" value={shift} onChange={e => setShift(Number(e.target.value))} options={Array.from({ length: 25 }, (_, i) => [i + 1, `${i + 1} (A → ${AZ[i + 1]})`])} />}
        <div className="flex gap-2"><button className={buttonClass} aria-pressed={mode === 'encode'} style={mode === 'encode' ? { outline: '3px solid #182139' } : undefined} onClick={() => setMode('encode')}>🔒 Encode</button><button className={buttonClass} aria-pressed={mode === 'decode'} style={mode === 'decode' ? { outline: '3px solid #182139' } : undefined} onClick={() => setMode('decode')}>🔓 Decode</button></div>
        <label className="block font-bold">{mode === 'encode' ? 'Your message' : 'The secret message'}<textarea className={inputClass} rows={4} maxLength={500} value={text} onChange={e => setText(e.target.value)} /></label>
        <div><p className="font-bold">{mode === 'encode' ? 'Secret message' : 'Decoded message'}</p><p aria-live="polite" className="mt-1 min-h-16 break-words rounded-xl bg-[var(--postit)] p-3 font-mono text-xl">{out}</p></div>
        <button className={buttonClass} disabled={!text.trim() || mode !== 'encode'} onClick={() => setPrinting(true)}>🖨️ Print the secret message</button>
      </Panel>
      <Panel label="Code key"><h2 className="text-xl font-bold">Code key: {name}{cipher === 'caesar' ? `, shift ${shift}` : ''}</h2><KeyTable cipher={cipher} shift={shift} /></Panel>
    </div>
    {printing && <PrintPreview lang="en" title="Secret message" onClose={() => setPrinting(false)}><article className="buga-a4" dir="ltr">
      <h1 style={{ fontSize: '30px', textAlign: 'center', marginBottom: '6mm' }}>🕵️ Top secret message</h1>
      <p style={{ fontFamily: 'monospace', fontSize: '22px', lineHeight: 1.8, border: '2px dashed #888', padding: '5mm', overflowWrap: 'anywhere' }}>{out}</p>
      <h2 style={{ fontSize: '20px', margin: '8mm 0 3mm' }}>Code key: {name}{cipher === 'caesar' ? `, shift ${shift}` : ''}</h2>
      <KeyTable cipher={cipher} shift={shift} />
      <h2 style={{ fontSize: '20px', margin: '8mm 0 3mm' }}>Write the decoded message here:</h2>
      {[0, 1, 2].map(i => <div key={i} style={{ borderBottom: '1px solid #555', height: '12mm' }} />)}
    </article></PrintPreview>}
  </ToolFrame>
}

// ── Name, Place, Animal, Thing ──
export function NamePlaceAnimal() {
  const [set, setSet] = useState('classic'), [seconds, setSeconds] = useState('60'), [letter, setLetter] = useState(null), [left, setLeft] = useState(0), [used, setUsed] = useState([]), [printing, setPrinting] = useState(false)
  useEffect(() => {
    if (left <= 0) return undefined
    const id = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(id)
  }, [left])
  function draw() {
    const pool = LETTERS.filter(l => !used.includes(l))
    const l = pool.length ? pool[randomInt(0, pool.length - 1)] : LETTERS[randomInt(0, LETTERS.length - 1)]
    setLetter(l); setUsed(u => pool.length ? [...u, l] : [l]); setLeft(Math.max(0, Math.min(600, Number(seconds) || 0)))
  }
  const cats = CATEGORY_SETS[set]
  return <ToolFrame path="/en/tools/name-place-animal-thing" h1="🔤 Name, Place, Animal, Thing" intro="The classic word game: draw a letter, start the timer and fill in a word for every category. Includes a printable score sheet." width="max-w-4xl"
    faq={[
      { q: 'How do you play Name, Place, Animal, Thing?', a: 'Draw a letter. Everyone writes a name, a place, an animal, a food and a thing that start with that letter before the time runs out. A unique answer scores 10 points, an answer someone else also wrote scores 5, and a blank scores 0.' },
      { q: 'Is it the same as Scattergories?', a: 'It is the same idea. This version is free, the categories are simple enough for kids, and you can print as many score sheets as you need.' },
      { q: 'Why are some letters missing?', a: 'Hard letters such as Q, X, Y and Z are left out so every round is fair for children.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/countdown-timer', label: 'countdown timer' }, { href: '/en/tools/scoreboard', label: 'scoreboard' }]}>
    <Panel label="Game" className="text-center">
      <div className="flex flex-wrap items-end justify-center gap-3">
        <Select label="Categories" value={set} onChange={e => setSet(e.target.value)} options={[['classic', 'Classic'], ['kids', 'Young kids'], ['extended', 'Extended (8 columns)']]} />
        <Field label="Seconds per round" type="number" min="0" max="600" value={seconds} onChange={e => setSeconds(e.target.value)} className="w-40" />
      </div>
      <p className="text-lg">{cats.join(' · ')}</p>
      <div aria-live="polite" className="mx-auto flex h-40 w-40 items-center justify-center rounded-3xl bg-[var(--postit)] text-8xl font-black">{letter || '?'}</div>
      {left > 0 ? <p role="timer" className="text-4xl font-black tabular-nums">{left}s</p> : letter && Number(seconds) > 0 && <p className="text-2xl font-black">⏰ Pens down!</p>}
      <div className="flex flex-wrap justify-center gap-2"><button className={bigButtonClass} onClick={draw}>🎲 Draw a letter</button>{left > 0 && <button className={buttonClass} onClick={() => setLeft(0)}>Stop the timer</button>}<button className={buttonClass} onClick={() => setPrinting(true)}>🖨️ Print score sheets</button></div>
      {used.length > 1 && <p className="text-sm">Letters played: {used.join(', ')}</p>}
    </Panel>
    {printing && <PrintPreview lang="en" title="Name, Place, Animal, Thing score sheet" onClose={() => setPrinting(false)}><article className="buga-a4" dir="ltr">
      <h1 style={{ fontSize: '26px', textAlign: 'center', marginBottom: '4mm' }}>Name, Place, Animal, Thing</h1>
      <p style={{ marginBottom: '3mm' }}>Player: ______________________</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: cats.length > 6 ? '11px' : '13px' }}><thead><tr>{['Letter', ...cats, 'Points'].map(c => <th key={c} style={{ border: '1px solid #444', padding: '2mm' }}>{c}</th>)}</tr></thead>
        <tbody>{Array.from({ length: 12 }, (_, i) => <tr key={i}>{['Letter', ...cats, 'Points'].map(c => <td key={c} style={{ border: '1px solid #444', height: '15mm' }} />)}</tr>)}</tbody></table>
      <p style={{ marginTop: '3mm', fontSize: '12px' }}>Unique answer 10 · Same as someone else 5 · Blank 0</p>
    </article></PrintPreview>}
  </ToolFrame>
}
