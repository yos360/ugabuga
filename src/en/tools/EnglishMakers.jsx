// English printable makers: word search, bingo cards, crossword, worksheet and scavenger hunt.
// Grid builders come from the shared engines (utils/wordSearchGrid, data/puzzleEngine).
import { useMemo, useState } from 'react'
import ToolFrame from './ToolFrame'
import { Field, Panel, Select, bigButtonClass, buttonClass, inputClass, randomInt } from './ui'
import PrintPreview from '../../components/ui/PrintPreview'
import { wordSearch } from '../../utils/wordSearchGrid'
import { crossword } from '../../data/puzzleEngine'
import { shuffle } from '../../utils/shuffle'

const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const lines = text => text.split(/\n|,/).map(s => s.trim()).filter(Boolean)
const cell = { border: '1px solid #333', textAlign: 'center', fontWeight: 700 }
const Sheet = ({ children }) => <article className="buga-a4" dir="ltr" style={{ color: '#182139' }}>{children}</article>
const NameLine = () => <p style={{ margin: '0 0 4mm', fontSize: '14px' }}>Name: ____________________ Date: ____________</p>

// ── word search ──
const WS_THEMES = { animals: 'LION, TIGER, ZEBRA, MONKEY, PANDA, KOALA, RABBIT, TURTLE, EAGLE, SHARK', fruit: 'APPLE, BANANA, CHERRY, GRAPE, LEMON, MANGO, ORANGE, PEAR, PLUM, MELON', school: 'BOOK, PENCIL, RULER, ERASER, TEACHER, DESK, CHAIR, PAPER, CRAYON, BAG', space: 'SUN, MOON, STAR, PLANET, ROCKET, COMET, ORBIT, MARS, EARTH, GALAXY' }
export function WordSearchMaker() {
  const [title, setTitle] = useState('Animal word search'), [text, setText] = useState(WS_THEMES.animals), [seed, setSeed] = useState(1), [answers, setAnswers] = useState(false), [printing, setPrinting] = useState(false)
  const words = [...new Set(lines(text).map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(w => w.length >= 2 && w.length <= 14))].slice(0, 20)
  const size = Math.min(16, Math.max(10, ...words.map(w => w.length + 2), Math.ceil(Math.sqrt(words.join('').length * 2.2))))
  const puzzle = useMemo(() => { try { return words.length ? wordSearch(words, size, seed, AZ) : null } catch { return null } }, [words.join(), size, seed])
  const hits = new Set(answers && puzzle ? puzzle.placed.flatMap(p => p.cells.map(([r, c]) => `${r},${c}`)) : [])
  const grid = puzzle && <table style={{ borderCollapse: 'collapse', margin: '0 auto' }}><tbody>{puzzle.grid.map((row, r) => <tr key={r}>{row.map((ch, c) => <td key={c} style={{ ...cell, border: '1px solid #bbb', width: '9mm', height: '9mm', fontSize: '18px', background: hits.has(`${r},${c}`) ? '#ffe082' : undefined }}>{ch}</td>)}</tr>)}</tbody></table>
  const list = <p style={{ fontSize: '16px', lineHeight: 1.8, marginTop: '5mm', textAlign: 'center' }}>{words.join(' · ')}</p>
  return <ToolFrame path="/en/tools/word-search-maker" h1="🔎 Word search maker" intro="Type your own words or pick a theme and get a printable word search, with an answer key." width="max-w-5xl"
    faq={[
      { q: 'How do I make my own word search?', a: 'Type a title and up to 20 words, separated by commas or new lines. The puzzle is built straight away; press "New puzzle" for a different layout and "Print" for a clean A4 page.' },
      { q: 'Which directions do the words go?', a: 'Left to right and top to bottom, which suits young readers. Words can share letters where they cross.' },
      { q: 'Can I print the answers?', a: 'Tick "Show answers" before printing and the hidden words are highlighted, so you have an answer key for checking.' },
      { q: 'Can I use spelling words?', a: 'Yes, that is one of the best uses. Paste this week\'s spelling list and print a copy for every child.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/crossword-maker', label: 'crossword maker' }, { href: '/en/tools/worksheet-maker', label: 'worksheet maker' }, { href: '/en/worksheets', label: 'printable worksheets' }]}>
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Panel label="Word search settings">
        <Field label="Title" value={title} maxLength={60} onChange={e => setTitle(e.target.value)} />
        <div className="flex flex-wrap gap-2">{Object.keys(WS_THEMES).map(k => <button key={k} className="rounded-full border-2 border-[var(--border)] px-3 py-1 text-sm font-bold capitalize" onClick={() => { setText(WS_THEMES[k]); setTitle(`${k[0].toUpperCase()}${k.slice(1)} word search`) }}>{k}</button>)}</div>
        <label className="block font-bold">Words (comma or new line)<textarea className={inputClass} rows={6} value={text} onChange={e => setText(e.target.value)} /></label>
        <p className="text-sm">{words.length} words · {size}×{size} grid. Letters only, 2 to 14 per word.</p>
        <label className="flex items-center gap-2"><input type="checkbox" checked={answers} onChange={e => setAnswers(e.target.checked)} /> Show answers</label>
        <div className="flex flex-wrap gap-2"><button className={buttonClass} onClick={() => setSeed(randomInt(1, 1e9))}>🔀 New puzzle</button><button className={buttonClass} disabled={!puzzle} onClick={() => setPrinting(true)}>🖨️ Print</button></div>
      </Panel>
      <div className="overflow-x-auto rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-[#182139]">{puzzle ? <><h2 className="mb-3 text-center text-2xl font-black">{title}</h2>{grid}{list}</> : <p>Add at least one word with 2 or more letters.</p>}</div>
    </div>
    {printing && puzzle && <PrintPreview lang="en" title={title || 'Word search'} onClose={() => setPrinting(false)}><Sheet><h1 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '3mm' }}>{title}</h1><NameLine />{grid}{list}</Sheet></PrintPreview>}
  </ToolFrame>
}

// ── bingo ──
const BINGO_THEMES = {
  numbers: { label: 'Numbers 1–75', items: Array.from({ length: 75 }, (_, i) => String(i + 1)) },
  animals: { label: 'Animals', items: '🐶 Dog,🐱 Cat,🐮 Cow,🐷 Pig,🐸 Frog,🐵 Monkey,🦁 Lion,🐯 Tiger,🐻 Bear,🐼 Panda,🐨 Koala,🐰 Rabbit,🦊 Fox,🐴 Horse,🦒 Giraffe,🐘 Elephant,🐧 Penguin,🐢 Turtle,🐟 Fish,🦋 Butterfly,🐝 Bee,🐞 Ladybug,🦉 Owl,🐬 Dolphin,🦀 Crab,🐍 Snake,🦓 Zebra,🐑 Sheep,🐔 Chicken,🦆 Duck'.split(',') },
  sight: { label: 'Sight words', items: 'the,and,a,to,said,in,he,I,of,it,was,you,they,on,she,is,for,at,his,but,that,with,all,we,can,are,up,had,my,her,what,there,out,this,have,went,be,like,some,so'.split(',') },
  colors: { label: 'Colors and shapes', items: 'red,blue,green,yellow,orange,purple,pink,brown,black,white,gray,gold,circle,square,triangle,star,heart,oval,diamond,rectangle,hexagon,arrow,moon,cross,spiral'.split(',') },
}
export function BingoMaker() {
  const [theme, setTheme] = useState('animals'), [text, setText] = useState(BINGO_THEMES.animals.items.join('\n')), [size, setSize] = useState(4), [free, setFree] = useState(true), [cards, setCards] = useState(6), [title, setTitle] = useState('BINGO'), [seed, setSeed] = useState(1), [printing, setPrinting] = useState(false), [called, setCalled] = useState([])
  const items = [...new Set(lines(text))].slice(0, 100)
  const needed = size * size - (free && size % 2 ? 1 : 0)
  const enough = items.length >= needed
  const deck = useMemo(() => enough ? Array.from({ length: cards }, () => shuffle(items).slice(0, needed)) : [], [items.join('|'), needed, cards, seed])
  const center = Math.floor(size * size / 2)
  const card = (picks, k) => {
    const cellsList = [...picks]
    if (free && size % 2) cellsList.splice(center, 0, '⭐ FREE')
    return <div key={k} style={{ breakInside: 'avoid' }}>
      <h2 style={{ textAlign: 'center', fontSize: '26px', fontWeight: 900, letterSpacing: '4px', margin: '0 0 2mm' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, border: '2px solid #222' }}>{cellsList.map((t, i) => <div key={i} style={{ ...cell, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1mm', fontSize: size > 4 ? '13px' : '16px', overflowWrap: 'anywhere', background: t === '⭐ FREE' ? '#fff3c4' : undefined }}>{t}</div>)}</div>
    </div>
  }
  const nextCall = () => { const left = items.filter(i => !called.includes(i)); if (left.length) setCalled([left[randomInt(0, left.length - 1)], ...called]) }
  return <ToolFrame path="/en/tools/bingo-maker" h1="🎟️ Bingo card generator" intro="Make printable bingo cards with numbers, pictures, sight words or your own list. Every card is different, and there is a caller to draw the items." width="max-w-5xl"
    faq={[
      { q: 'How do I make bingo cards with my own words?', a: 'Type your words, one per line, choose the grid size and how many cards you need, and press Print. Each card gets a different random selection and order.' },
      { q: 'How many words do I need?', a: 'At least as many as squares on a card: 9 for 3×3, 16 for 4×4 and 25 for 5×5 (one fewer with a free center). More words make the cards more different from each other.' },
      { q: 'How do I call the game?', a: 'Use the caller on this page: press "Draw" and read out the item. The list of called items helps you check a winning card.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/word-search-maker', label: 'word search maker' }, { href: '/en/tools/random-picker', label: 'spin the wheel' }]}>
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Panel label="Bingo settings">
        <Field label="Title on the card" value={title} maxLength={20} onChange={e => setTitle(e.target.value)} />
        <Select label="Theme" value={theme} onChange={e => { setTheme(e.target.value); setText(BINGO_THEMES[e.target.value].items.join('\n')); setCalled([]) }} options={Object.entries(BINGO_THEMES).map(([k, v]) => [k, v.label])} />
        <label className="block font-bold">Items, one per line<textarea className={inputClass} rows={6} value={text} onChange={e => { setText(e.target.value); setCalled([]) }} /></label>
        <div className="grid grid-cols-2 gap-2">
          <Select label="Grid" value={size} onChange={e => setSize(Number(e.target.value))} options={[[3, '3×3'], [4, '4×4'], [5, '5×5']]} />
          <Select label="Cards" value={cards} onChange={e => setCards(Number(e.target.value))} options={[2, 4, 6, 8, 12, 20, 30].map(n => [n, String(n)])} />
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={free} disabled={size % 2 === 0} onChange={e => setFree(e.target.checked)} /> Free square in the middle (3×3 and 5×5)</label>
        {!enough && <p role="alert">You need at least {needed} different items. You have {items.length}.</p>}
        <div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={!enough} onClick={() => setSeed(s => s + 1)}>🔀 Shuffle cards</button><button className={buttonClass} disabled={!enough} onClick={() => setPrinting(true)}>🖨️ Print {cards} cards</button></div>
      </Panel>
      <div className="space-y-4">
        {enough && <div className="mx-auto max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-[#182139]">{card(deck[0], 0)}</div>}
        <Panel label="Bingo caller" className="text-center">
          <h2 className="text-xl font-bold">Caller</h2>
          <p aria-live="polite" className="text-4xl font-black">{called[0] || '—'}</p>
          <div className="flex justify-center gap-2"><button className={bigButtonClass} disabled={called.length >= items.length} onClick={nextCall}>Draw</button><button className={buttonClass} onClick={() => setCalled([])}>Restart</button></div>
          {called.length > 1 && <p className="text-sm">Called ({called.length}): {called.slice(1).join(', ')}</p>}
        </Panel>
      </div>
    </div>
    {printing && enough && <PrintPreview lang="en" title="Bingo cards" onClose={() => setPrinting(false)} copies={false}>
      {Array.from({ length: Math.ceil(cards / 2) }, (_, p) => <Sheet key={p}><div style={{ display: 'grid', gap: '10mm', gridTemplateRows: '1fr 1fr' }}>{deck.slice(p * 2, p * 2 + 2).map((d, i) => <div key={i} style={{ width: size > 3 ? '120mm' : '100mm', margin: '0 auto' }}>{card(d, i)}</div>)}</div></Sheet>)}
    </PrintPreview>}
  </ToolFrame>
}

// ── crossword ──
const CW_SAMPLE = 'CAT - A pet that says meow\nSUN - It shines in the day\nMOON - You see it at night\nAPPLE - A red or green fruit\nTRAIN - It runs on tracks\nBOOK - You read it\nRAIN - Water falling from clouds\nTREE - It has leaves and a trunk'
export function CrosswordMaker() {
  const [title, setTitle] = useState('My crossword'), [text, setText] = useState(CW_SAMPLE), [seed, setSeed] = useState(1), [answers, setAnswers] = useState(false), [printing, setPrinting] = useState(false)
  const entries = lines(text.replace(/,/g, '\u0000')).map(l => l.replace(/\u0000/g, ',')).map(l => { const m = l.match(/^([A-Za-z ]+?)\s*[-–:=]\s*(.+)$/); return m ? [m[1].toUpperCase().replace(/[^A-Z]/g, ''), m[2].trim()] : null }).filter(e => e && e[0].length >= 2).slice(0, 20)
  const puzzle = useMemo(() => entries.length ? crossword(entries, seed) : null, [JSON.stringify(entries), seed])
  const clues = d => puzzle.placed.filter(p => p.d === d).sort((a, b) => a.number - b.number)
  const board = puzzle && puzzle.rows > 0 && <div style={{ display: 'grid', gridTemplateColumns: `repeat(${puzzle.cols}, 8mm)`, justifyContent: 'center' }}>{puzzle.cells.map(c => <div key={c.key} style={{ width: '8mm', height: '8mm', position: 'relative', border: c.letter ? '1px solid #222' : 'none', background: c.letter ? '#fff' : 'transparent', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.number && <span style={{ position: 'absolute', top: 0, left: '1px', fontSize: '8px' }}>{c.number}</span>}{answers ? c.letter : ''}</div>)}</div>
  const clueList = puzzle && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm', marginTop: '6mm', fontSize: '14px' }}>{[['across', 'Across'], ['down', 'Down']].map(([d, label]) => <div key={d}><h3 style={{ fontWeight: 900, fontSize: '17px' }}>{label}</h3><ol style={{ listStyle: 'none', padding: 0 }}>{clues(d).map(p => <li key={p.number + d}><b>{p.number}.</b> {p.clue} ({p.word.length})</li>)}</ol></div>)}</div>
  return <ToolFrame path="/en/tools/crossword-maker" h1="✏️ Crossword puzzle maker" intro="Type words with clues and get a printable crossword with numbered clues across and down, plus an answer key." width="max-w-5xl"
    faq={[
      { q: 'How do I make a crossword with my own words?', a: 'Write one word per line followed by a dash and its clue, for example: CAT - A pet that says meow. The grid is built automatically; press "New layout" if you want a different arrangement.' },
      { q: 'Why was one of my words left out?', a: 'Every word must share a letter with the rest of the puzzle. If a word has no letters in common with the others, try adding more words or changing it.' },
      { q: 'Can I print an answer key?', a: 'Yes. Tick "Show answers" and print again to get the filled-in grid for checking.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/word-search-maker', label: 'word search maker' }, { href: '/en/tools/worksheet-maker', label: 'worksheet maker' }]}>
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Panel label="Crossword settings">
        <Field label="Title" value={title} maxLength={60} onChange={e => setTitle(e.target.value)} />
        <label className="block font-bold">Word - clue, one per line<textarea className={inputClass} rows={10} value={text} onChange={e => setText(e.target.value)} /></label>
        <p className="text-sm">{entries.length} words (2 to 14 letters each, up to 20).</p>
        <label className="flex items-center gap-2"><input type="checkbox" checked={answers} onChange={e => setAnswers(e.target.checked)} /> Show answers</label>
        <div className="flex flex-wrap gap-2"><button className={buttonClass} onClick={() => setSeed(randomInt(1, 1e9))}>🔀 New layout</button><button className={buttonClass} disabled={!puzzle?.placed.length} onClick={() => setPrinting(true)}>🖨️ Print</button></div>
        {puzzle?.omitted?.length > 0 && <p role="status">Left out (no shared letters): {puzzle.omitted.join(', ')}</p>}
      </Panel>
      <div className="overflow-x-auto rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-[#182139]">{puzzle?.placed.length ? <><h2 className="mb-3 text-center text-2xl font-black">{title}</h2>{board}{clueList}</> : <p>Write at least one line like CAT - A pet that says meow.</p>}</div>
    </div>
    {printing && puzzle && <PrintPreview lang="en" title={title || 'Crossword'} onClose={() => setPrinting(false)}><Sheet><h1 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '3mm' }}>{title}</h1><NameLine />{board}{clueList}</Sheet></PrintPreview>}
  </ToolFrame>
}

// ── worksheet ──
const EMOJI = /(\p{Extended_Pictographic}[\p{Extended_Pictographic}‍️]*)/u
const TASKS = [['trace', '✏️ Trace and write'], ['copy', '📝 Copy twice'], ['missing', '❓ Missing letter'], ['scramble', '🔀 Unscramble'], ['match', '🖼️ Match word and picture']]
const seedOf = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
function scramble(w) {
  const letters = [...w.replace(/\s/g, '')]
  let s = seedOf(w), out = letters
  for (let t = 0; t < 8; t++) {
    out = [...letters]
    for (let i = out.length - 1; i > 0; i--) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const j = s % (i + 1); [out[i], out[j]] = [out[j], out[i]] }
    if (out.join('') !== letters.join('') || letters.length < 2) break
  }
  return out.join(' ')
}
const missingAt = w => { const idx = [...w].map((c, i) => c.trim() ? i : -1).filter(i => i > 0); return idx.length ? idx[seedOf(w) % idx.length] : 0 }
function TaskBlock({ kind, words }) {
  const row = { display: 'flex', alignItems: 'center', gap: '5mm', minHeight: '17mm', borderBottom: '1px dashed #ccc' }
  const writeLine = <span style={{ flex: 1, borderBottom: '1.5px solid #555', height: '9mm' }} />
  if (kind === 'trace') return words.map((x, i) => <div key={i} style={row}><span style={{ fontSize: '26px', width: '10mm' }}>{x.e}</span><span style={{ fontSize: '38px', color: 'transparent', WebkitTextStroke: '1px #777', letterSpacing: '3px', fontFamily: 'Arial, sans-serif', minWidth: '60mm' }}>{x.w}</span>{writeLine}</div>)
  if (kind === 'copy') return words.map((x, i) => <div key={i} style={row}><span style={{ fontSize: '24px', width: '10mm' }}>{x.e}</span><b style={{ fontSize: '24px', minWidth: '45mm' }}>{x.w}</b>{writeLine}{writeLine}</div>)
  if (kind === 'missing') return words.map((x, i) => { const k = missingAt(x.w); return <div key={i} style={row}><span style={{ fontSize: '24px', width: '10mm' }}>{x.e}</span><b style={{ fontSize: '28px', letterSpacing: '4px' }}>{[...x.w].map((c, j) => j === k ? '▢' : c).join('')}</b></div> })
  if (kind === 'scramble') return words.map((x, i) => <div key={i} style={row}><span style={{ fontSize: '24px', width: '10mm' }}>{x.e}</span><b style={{ fontSize: '24px', minWidth: '60mm', letterSpacing: '2px' }}>{scramble(x.w)}</b>{writeLine}</div>)
  const pics = shuffle(words.map(x => x.e || '❔'))
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4mm 40mm', marginTop: '4mm' }}>{words.map((x, i) => [<b key={`w${i}`} style={{ fontSize: '24px' }}>● {x.w}</b>, <span key={`p${i}`} style={{ fontSize: '32px' }}>● {pics[i]}</span>])}</div>
}
export function WorksheetMaker() {
  const [title, setTitle] = useState('My spelling words'), [text, setText] = useState('cat 🐱\ndog 🐶\nsun ☀️\nfish 🐟\ntree 🌳\nbook 📕'), [tasks, setTasks] = useState(['trace', 'missing', 'scramble']), [printing, setPrinting] = useState(false)
  const words = lines(text).slice(0, 10).map(l => { const m = l.match(EMOJI); return { w: l.replace(EMOJI, '').replace(/\s+/g, ' ').trim(), e: m ? m[1] : '' } }).filter(x => x.w)
  const toggle = t => setTasks(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t])
  const chosen = TASKS.filter(([k]) => tasks.includes(k) && (k !== 'match' || words.some(w => w.e)))
  const sheets = chosen.map(([k, label]) => <Sheet key={k}><h1 style={{ fontSize: '26px', textAlign: 'center' }}>{title}</h1><h2 style={{ fontSize: '19px', textAlign: 'center', margin: '1mm 0 3mm' }}>{label}</h2><NameLine /><TaskBlock kind={k} words={words} /></Sheet>)
  return <ToolFrame path="/en/tools/worksheet-maker" h1="📝 Spelling worksheet maker" intro="Type this week's words and get printable worksheets: tracing, copying, missing letters, unscrambling and matching words to pictures." width="max-w-5xl"
    faq={[
      { q: 'How do I make a spelling worksheet?', a: 'Type up to 10 words, one per line. Add an emoji after a word (cat 🐱) to show a picture next to it. Choose the activities and press Print: each activity prints on its own page.' },
      { q: 'What ages is it for?', a: 'Tracing and matching suit kindergarten and first grade; missing letters and unscrambling suit grades 1 to 3 and English learners of any age.' },
      { q: 'Can I use it for another language?', a: 'Yes. Any words work, though the tracing font is designed for the Latin alphabet.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/word-search-maker', label: 'word search maker' }, { href: '/en/worksheets', label: 'printable worksheets' }]}>
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Panel label="Worksheet settings">
        <Field label="Title" value={title} maxLength={60} onChange={e => setTitle(e.target.value)} />
        <label className="block font-bold">Words, one per line (emoji optional)<textarea className={inputClass} rows={8} value={text} onChange={e => setText(e.target.value)} /></label>
        <fieldset><legend className="font-bold">Activities</legend>{TASKS.map(([k, label]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={tasks.includes(k)} onChange={() => toggle(k)} /> {label}</label>)}</fieldset>
        {tasks.includes('match') && !words.some(w => w.e) && <p className="text-sm">Add emojis to your words for the matching page.</p>}
        <button className={buttonClass} disabled={!words.length || !chosen.length} onClick={() => setPrinting(true)}>🖨️ Print {chosen.length} {chosen.length === 1 ? 'page' : 'pages'}</button>
      </Panel>
      <div className="space-y-4 overflow-x-auto rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-[#182139]">
        {words.length && chosen.length ? chosen.map(([k, label]) => <section key={k}><h2 className="text-xl font-black">{label}</h2><TaskBlock kind={k} words={words} /></section>) : <p>Add some words and choose at least one activity.</p>}
      </div>
    </div>
    {printing && <PrintPreview lang="en" title={title || 'Worksheet'} onClose={() => setPrinting(false)}>{sheets}</PrintPreview>}
  </ToolFrame>
}

// ── scavenger hunt ──
const HUNT_PACKS = {
  home: { label: 'Indoors', items: ['Something red', 'Something soft', 'Something round', 'A book with an animal on the cover', 'A spoon', 'A sock', 'Something that starts with B', 'Something older than you', 'Something that makes a sound', 'Your favorite toy'] },
  outdoor: { label: 'Outdoors', items: ['A green leaf', 'A smooth stone', 'A flower', 'Something yellow', 'A stick longer than your hand', 'An ant', 'Something round', 'A feather', 'A pine cone or seed', 'A cloud shaped like an animal'] },
  colors: { label: 'Rainbow hunt', items: ['Something red', 'Something orange', 'Something yellow', 'Something green', 'Something blue', 'Something purple', 'Something pink', 'Something brown', 'Something black', 'Something white'] },
  senses: { label: 'Five senses', items: ['Something that smells nice', 'Something bumpy', 'Something that makes a noise', 'Something smooth', 'Something cold', 'Something shiny', 'Something you can hear but not see', 'Something sticky', 'Something tiny', 'Something fluffy'] },
}
export function ScavengerHuntMaker() {
  const [pack, setPack] = useState('home'), [title, setTitle] = useState('Scavenger hunt'), [text, setText] = useState(HUNT_PACKS.home.items.join('\n')), [printing, setPrinting] = useState(false)
  const items = lines(text).slice(0, 30)
  const sheet = <Sheet><h1 style={{ fontSize: '30px', textAlign: 'center' }}>🔎 {title}</h1><p style={{ textAlign: 'center', margin: '2mm 0 6mm' }}>Find each thing and tick the box!</p><NameLine />
    <ol style={{ listStyle: 'none', padding: 0, fontSize: items.length > 15 ? '15px' : '19px', lineHeight: 1.4 }}>{items.map((it, i) => <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '4mm', padding: '2.5mm 0', borderBottom: '1px dashed #bbb' }}><span style={{ width: '7mm', height: '7mm', border: '2px solid #333', borderRadius: '2mm', flex: 'none' }} />{it}</li>)}</ol></Sheet>
  return <ToolFrame path="/en/tools/scavenger-hunt-maker" h1="🔎 Scavenger hunt maker" intro="Build a printable scavenger hunt checklist for home, the garden, a party or the classroom. Start from a ready list or write your own." width="max-w-4xl"
    faq={[
      { q: 'How many children can do one hunt?', a: 'Small teams of two to four work best, so everyone takes part in the search and not just the fastest runner.' },
      { q: 'How long does a scavenger hunt take?', a: 'Usually 20 to 40 minutes. Before you start, walk the area yourself and make sure every item can really be found there.' },
      { q: 'Can I add coded clues?', a: 'Yes. Write a clue with our secret code maker and add it as one of the items, for an extra challenge.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/secret-codes', label: 'secret code maker' }, { href: '/en/tools/countdown-timer', label: 'countdown timer' }]}>
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Panel label="Hunt settings">
        <Field label="Title" value={title} maxLength={50} onChange={e => setTitle(e.target.value)} />
        <Select label="Ready list" value={pack} onChange={e => { setPack(e.target.value); setText(HUNT_PACKS[e.target.value].items.join('\n')) }} options={Object.entries(HUNT_PACKS).map(([k, v]) => [k, v.label])} />
        <label className="block font-bold">Things to find, one per line<textarea className={inputClass} rows={10} value={text} onChange={e => setText(e.target.value)} /></label>
        <div className="flex flex-wrap gap-2"><button className={buttonClass} onClick={() => setText(shuffle(items).join('\n'))}>🔀 Shuffle</button><button className={buttonClass} disabled={!items.length} onClick={() => setPrinting(true)}>🖨️ Print</button></div>
      </Panel>
      <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-[#182139]"><h2 className="text-center text-2xl font-black">🔎 {title}</h2><ul className="mt-3 space-y-2 text-lg">{items.map((it, i) => <li key={i}>☐ {it}</li>)}</ul></div>
    </div>
    {printing && <PrintPreview lang="en" title={title || 'Scavenger hunt'} onClose={() => setPrinting(false)}>{sheet}</PrintPreview>}
  </ToolFrame>
}

