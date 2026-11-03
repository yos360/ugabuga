import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import ActivitySvg from '../../motor/render/ActivitySvg'
import { newSeed } from '../../motor/rng'
import { MAZE_LEVELS, MAZE_THEMES, readyMaze, freshMaze } from '../../pages/printables/mazeData'
import { WORKSHEETS_PAGES, WS } from './catalog'
import { Crumbs, PageHead, PrintNote } from './ui'
import '../../pages/printables/fine-motor.css'

// English version of /printables/mazes: the same 30 fixed mazes (5 levels x 6 themes) and the same
// "new maze" generator; every maze has exactly one route. Only the words on the page and the sheets are English.
const LEVELS = [
  { label: 'Very easy', age: 'Preschool (ages 4 to 5)' },
  { label: 'Easy', age: 'Grade 1' },
  { label: 'Medium', age: 'Grades 2 to 3' },
  { label: 'Hard', age: 'Grades 4 to 6' },
  { label: 'Very hard', age: 'Teens and adults' },
]
const TITLES = {
  space: 'Help the spaceship reach the star',
  animals: 'Help the puppy find the bone',
  sea: 'Help the fish reach the shell',
  dinos: 'Help the dinosaur find the egg',
  cars: 'Help the car reach the finish line',
  nature: 'Help the bee reach the flower',
}
const STARS = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']

const FAQ = [
  { q: 'Can every maze really be solved?', a: 'Yes. The mazes are built by an algorithm that makes a "perfect maze": there is exactly one route from the entrance to the exit, with no loops and no closed-off areas. Every maze also has a solution page.' },
  { q: 'Which level suits which age?', a: 'Very easy is for preschool, with wide paths and few turns. Easy suits Grade 1. Medium suits Grades 2 and 3. Hard suits Grades 4 to 6. Very hard is for older children and adults who like a challenge.' },
  { q: 'Can I get more mazes?', a: 'Yes. Every level has a "New maze" button that builds a maze that did not exist before, so you can print as many as you like for free.' },
  { q: 'How do I print the solutions?', a: 'Tick "Print solutions too" before printing and every maze is followed by its solution page, which is handy for teachers and parents.' },
]

function MazeSheet({ maze, level, solution }) {
  return <article className="buga-a4 motor-sheet en-print-sheet" dir="ltr">
    <h2>{solution ? `Solution: ${maze.title}` : maze.title}</h2>
    {!solution && <p className="art-caption motor-caption"><span>Start at the picture at the entrance and reach the goal without crossing a wall. Level: {level.label}</span><span className="motor-name">Name: ______________</span></p>}
    <div className="print-art"><ActivitySvg activity={maze} showSolution={solution} /></div>
    <footer>Ugabuga · Printable mazes · ugabuga.co.il/en</footer>
  </article>
}

export default function EnglishMazes() {
  const meta = WORKSHEETS_PAGES.find(p => p.path === `${WS}/mazes`)
  const [li, setLi] = useState(0)
  const [extra, setExtra] = useState([])
  const [printing, setPrinting] = useState(null)
  const [withSolutions, setWithSolutions] = useState(false)
  const level = LEVELS[li]
  const ready = useMemo(() => MAZE_THEMES.map((t, ti) => ({ ...readyMaze(li, ti), title: TITLES[t.id] })), [li])
  const fresh = useMemo(() => extra.map(seed => ({ ...freshMaze(li, seed), title: TITLES[MAZE_THEMES[seed % MAZE_THEMES.length].id] })), [extra, li])
  const all = [...fresh, ...ready]
  const pick = i => { setLi(i); setExtra([]) }
  return <div className="en-page ws-page">
    <SEO lang="en" path={meta.path} title={meta.title} description={meta.description} counterpartPath={meta.counterpart} structuredData={faqSchema(FAQ)} />
    <Crumbs current="Mazes" />
    <PageHead emoji="🌀" title="Printable mazes for kids" sub="A maze for every level, from preschool to adult. Choose a level, print, and start looking for the way. Each maze has exactly one route, and a solution page in case someone gets stuck." />
    <p className="ws-note"><b>30 ready mazes · a new maze at every click · free</b></p>
    <nav aria-label="Difficulty level" className="ws-level-grid">{LEVELS.map((l, i) =>
      <button key={l.label} type="button" aria-pressed={li === i} onClick={() => pick(i)}>
        {l.label}<small>{l.age}</small><small aria-hidden="true">{STARS[i]}</small>
      </button>)}</nav>
    <div className="ws-actions">
      <button type="button" data-print-main className="ws-primary" onClick={() => setPrinting(all)}>🖨️ Print all {all.length} mazes at this level</button>
      <button type="button" onClick={() => setExtra(e => [newSeed(), ...e])}>✨ New maze</button>
      <label className="ws-check"><input type="checkbox" checked={withSolutions} onChange={e => setWithSolutions(e.target.checked)} />Print solutions too</label>
    </div>
    <PrintNote />
    <section className="ws-maze-grid">{all.map((m, i) =>
      <figure key={`${li}-${i}-${m.cols}-${m.rows}-${m.title}`}>
        <button type="button" className="ws-maze-open" onClick={() => setPrinting([m])} aria-label={`Print: ${m.title}`}><ActivitySvg activity={m} /></button>
        <figcaption><b>{m.title}{i < fresh.length ? ' ✨' : ''}</b><br />
          <button type="button" onClick={() => setPrinting([m])}>🖨️ Print</button></figcaption>
      </figure>)}</section>
    {printing && <PrintPreview lang="en" title={printing.length === 1 ? printing[0].title : `Mazes: ${level.label}`} onClose={() => setPrinting(null)}>
      {printing.flatMap((m, i) => [<MazeSheet key={`m${i}`} maze={m} level={level} />, ...(withSolutions ? [<MazeSheet key={`s${i}`} maze={m} level={level} solution />] : [])])}
    </PrintPreview>}
    <SeoBody lang="en" paragraphs={[
      'Printable mazes are one of the most loved quiet activities: at home, in class, on a trip and in the waiting room. A maze practices planning, concentration and patience, and also pencil control: keep going through the paths without touching a wall.',
      'This page has 30 ready mazes, six at each level, with themes children like: a spaceship looking for a star, a puppy looking for a bone, a fish, a dinosaur, a car and a bee. At the easy levels the paths are wide and the maze is small. At the hard levels there are many dead ends and turns.',
      'All the mazes are built by code, not by AI, so every maze has exactly one route from start to finish. There is no maze that cannot be solved. The "New maze" button makes a maze that has not been used before, so you can print as many as you want.',
    ]} faq={FAQ} related={[{ label: 'connect the dots', href: `${WS}/dot-to-dot` }, { label: 'math worksheets', href: `${WS}/math` }, { label: 'coloring pages', href: '/en/coloring-pages' }, { label: 'all printable worksheets', href: WS }]} />
    <p className="ws-note"><Link to={WS}>Back to all worksheets</Link></p>
  </div>
}
