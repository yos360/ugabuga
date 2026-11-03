import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import { shareOnWhatsApp } from '../../../utils/share'
import SudokuGame, { bestTimes, fmtTime } from '../../../sudoku/SudokuGame'
import { SudokuSvg } from '../../../sudoku/SudokuSheets'
import { ADULT_LEVELS, ALL_LEVELS, puzzleFor, randomSeed, israelDate, dailyPuzzle } from '../../../sudoku/puzzles'
import { countSolutions, conflicts, grade, geom } from '../../../sudoku/engine'
import { HUB, LEVELS, TECHNIQUE_NAMES, SPOKES, HOW_TO, STRATEGY, LEVEL_PAGES, KIDS_PAGE, HUB_FAQ, DAILY_FAQ, SOLVER_FAQ } from './copy.js'
import '../../../sudoku/sudoku.css'

// English sudoku pages: the same board, puzzles and solver as /sudoku, with English copy.
const SITE = 'https://ugabuga.co.il'
const crumbs = (label, extra = []) => [{ label: 'Home', href: '/en' }, { label: 'Sudoku', href: HUB }, ...extra, { label }]
const appSchema = (name, description, path) => ({
  '@context': 'https://schema.org', '@type': 'WebApplication', name, description, url: SITE + path,
  inLanguage: 'en', applicationCategory: 'GameApplication', operatingSystem: 'Any', isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
})
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const niceDate = key => { const [y, m, d] = key.split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}` }

function useSeed(levels, defaultLevel) {
  const [params, setParams] = useSearchParams()
  const [level, setLevelState] = useState(() => (levels.includes(params.get('level')) ? params.get('level') : defaultLevel))
  const [seed, setSeedState] = useState(() => { const p = Number(params.get('p')); return p > 0 && p < 1e9 ? Math.floor(p) : randomSeed() })
  const sync = (lv, sd) => setParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('p', String(sd))
    if (levels.length > 1 && lv !== defaultLevel) next.set('level', lv); else next.delete('level')
    return next
  }, { replace: true, preventScrollReset: true })
  const fresh = () => { const sd = randomSeed(); setSeedState(sd); sync(level, sd) }
  const setLevel = lv => { const sd = randomSeed(); setLevelState(lv); setSeedState(sd); sync(lv, sd) }
  return { level, seed, fresh, setLevel }
}

function Player({ level, seed, onNew, newLabel, bestKey, puzzle: given, shareText }) {
  const puzzle = useMemo(() => given || puzzleFor(level, seed), [given, level, seed])
  return <>
    <SudokuGame lang="en" key={`${puzzle.level}-${puzzle.seed}`} puzzle={puzzle} onNew={onNew} newLabel={newLabel} bestKey={bestKey} />
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-600">
      <span>{LEVELS[puzzle.level].long} · Board no. {puzzle.seed}</span>
      {shareText && <button type="button" className="sdk-link" onClick={() => shareOnWhatsApp(shareText(puzzle))}>💬 Send this board to a friend</button>}
    </div>
  </>
}
const shareFor = path => p => `🔢 ${LEVELS[p.level].long} - exactly the same board, let's see who solves it faster: ${SITE}${path}?p=${p.seed}${path === HUB && p.level !== 'easy' ? `&level=${p.level}` : ''}`

function LevelChips({ levels, value, onPick }) {
  return <div className="sdk-levels no-print" role="group" aria-label="Difficulty level">
    {levels.map(id => <button key={id} type="button" className="sdk-chip" aria-pressed={id === value} onClick={() => onPick(id)}>{LEVELS[id].name}<small aria-hidden="true">{LEVELS[id].stars}</small></button>)}
  </div>
}
function LevelLinks({ current }) {
  return <nav className="sdk-levels no-print" aria-label="Sudoku levels">
    {ADULT_LEVELS.map(id => <Link key={id} to={LEVELS[id].path} className="sdk-chip" aria-pressed={id === current} aria-current={id === current ? 'page' : undefined}>{LEVELS[id].name}<small aria-hidden="true">{LEVELS[id].stars}</small></Link>)}
    <Link to="/en/sudoku/kids" className="sdk-chip" aria-pressed={current === 'kids'}>Kids<small aria-hidden="true">🧒</small></Link>
  </nav>
}
function SpokeCards({ except, heading = 'More sudoku' }) {
  return <section className="mt-10" aria-label={heading}>
    <h2 className="mb-3 text-2xl font-bold">{heading}</h2>
    <div className="sdk-cards">
      {SPOKES.filter(s => s.to !== except).map(s => <Link key={s.to} to={s.to} className="sdk-card"><b>{s.emoji} {s.label}</b><span>{s.sub}</span></Link>)}
    </div>
  </section>
}
function BestTimes() {
  const [best] = useState(() => bestTimes())
  const rows = ALL_LEVELS.filter(l => best[l])
  if (!rows.length) return null
  return <div className="sdk-box"><h2>🏆 Your best times</h2><ul>{rows.map(l => <li key={l}>{LEVELS[l].long}: <b>{fmtTime(best[l])}</b></li>)}</ul></div>
}
const Tips = ({ items, title = 'Tips' }) => <div className="sdk-box"><h2>{title}</h2><ul>{items.map(t => <li key={t}>{t}</li>)}</ul></div>
const Wrap = ({ children }) => <div className="mx-auto max-w-6xl px-4 py-8" dir="ltr">{children}</div>
const Head = ({ emoji, h1, intro }) => <header className="text-center">
  <h1 className="text-4xl sm:text-5xl">{emoji && <span aria-hidden="true">{emoji} </span>}{h1}</h1>
  <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">{intro}</p>
</header>

export function EnglishSudokuHub() {
  const { level, seed, fresh, setLevel } = useSeed(ADULT_LEVELS, 'easy')
  const [today] = useState(() => israelDate())
  const daily = useMemo(() => dailyPuzzle('medium', today), [today])
  const title = 'Free online sudoku - play from easy to very hard'
  const description = 'Free online sudoku: play right in your browser at four levels, easy, medium, hard and very hard, with notes, undo and a timer. Daily sudoku, kids sudoku and a solver.'
  return <Wrap>
    <SEO lang="en" title={title} description={description} path={HUB} counterpartPath="/sudoku" structuredData={[appSchema('Online sudoku', description, HUB), faqSchema(HUB_FAQ)]} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'Sudoku' }]} />
    <Head emoji="🔢" h1="Free online sudoku" intro="Sudoku is the number puzzle everyone knows: complete the board so that each number appears once in every row, every column and every box. Play right on this page, on a phone or a computer, free and with no sign-up. Pick a level and start." />
    <div className="mt-5"><LevelChips levels={ADULT_LEVELS} value={level} onPick={setLevel} /></div>
    <div className="sdk-play-grid mt-5">
      <div><Player level={level} seed={seed} onNew={fresh} shareText={shareFor(HUB)} /></div>
      <aside className="grid gap-4">
        <Link to="/en/sudoku/daily" className="sdk-box flex items-center gap-4 no-underline" style={{ color: 'inherit' }}>
          <div style={{ width: 96, flex: 'none' }} aria-hidden="true"><SudokuSvg puzzle={daily} title="Today's sudoku board" /></div>
          <div><b className="block text-xl">📅 The daily sudoku</b><span className="block text-slate-600">{niceDate(today)} · Medium · the same board for every player today</span><span className="mt-1 block font-bold underline">Solve today's sudoku →</span></div>
        </Link>
        <div className="sdk-box">
          <h2>Choose a level</h2>
          <ul>
            <li><Link to="/en/sudoku/easy" className="font-bold underline">Easy sudoku</Link>: for beginners, simple steps only.</li>
            <li><Link to="/en/sudoku/medium" className="font-bold underline">Medium sudoku</Link>: fewer clues, more scanning.</li>
            <li><Link to="/en/sudoku/hard" className="font-bold underline">Hard sudoku</Link>: notes, pairs and locked candidates.</li>
            <li><Link to="/en/sudoku/very-hard" className="font-bold underline">Very hard sudoku</Link>: testing hypotheses.</li>
            <li><Link to="/en/sudoku/kids" className="font-bold underline">Kids sudoku</Link>: 4×4 and 6×6 boards.</li>
          </ul>
        </div>
        <BestTimes />
      </aside>
    </div>
    <SpokeCards heading="Every kind of sudoku" />
    <div className="mt-10 grid gap-5 md:grid-cols-2">
      <section className="sdk-box"><h2>How to play sudoku</h2><ol>{HOW_TO.map(t => <li key={t}>{t}</li>)}</ol>
        <p className="mt-3 leading-relaxed">On the board: tap a cell, then a number. ✏️ Notes writes small possibilities, ↩️ undoes a move, and 💡 fills one cell when you are stuck. On a computer you can type numbers, move with the arrow keys, press N for notes and Ctrl+Z to undo.</p>
      </section>
      <section className="sdk-box"><h2>Tips and strategy</h2><ul>{STRATEGY.map(s => <li key={s.t}><b>{s.t}:</b> {s.d}</li>)}</ul></section>
    </div>
    <section className="mt-8 sdk-box">
      <h2>How is the difficulty decided?</h2>
      <p className="leading-relaxed">Every board on the site is checked twice. First a computer makes sure it has exactly one solution. Then a solver that works like a person, starting with simple steps and moving to advanced techniques only when it has to, sets the level. <b>Easy</b> and <b>medium</b> need simple steps only (easy has at least 36 clues), <b>hard</b> needs note-based techniques such as pairs, locked candidates or X-wings, and <b>very hard</b> is still stuck after those and needs testing hypotheses.</p>
    </section>
    <div className="mt-8"><SeoBody lang="en" paragraphs={[
      'Stuck on a sudoku from a newspaper or a puzzle book? In the sudoku solver you type in the board and get the solution, plus an answer if the board has no solution or has more than one.',
    ]} faq={HUB_FAQ} related={[
      { label: 'the sudoku solver', href: '/en/sudoku/solver' },
      { label: 'the daily sudoku', href: '/en/sudoku/daily' },
      { label: 'all online games', href: '/en/online-games' },
    ]} /></div>
  </Wrap>
}

export function EnglishSudokuLevel({ level }) {
  const c = LEVEL_PAGES[level]
  const meta = LEVELS[level]
  const { seed, fresh } = useSeed([level], level)
  if (!c) return null
  return <Wrap>
    <SEO lang="en" title={c.seoTitle} description={c.description} path={meta.path} counterpartPath={`/sudoku/${level}`} structuredData={[appSchema(c.h1, c.description, meta.path), faqSchema(c.faq)]} />
    <Breadcrumbs lang="en" items={crumbs(c.h1)} />
    <Head h1={c.h1} intro={c.intro} />
    <div className="mt-5"><LevelLinks current={level} /></div>
    <div className="sdk-play-grid mt-5">
      <div><Player level={level} seed={seed} onNew={fresh} newLabel="New board" shareText={shareFor(meta.path)} /></div>
      <aside className="grid gap-4">
        <Tips items={c.tips} title={`Tips for ${c.keyword}`} />
        <BestTimes />
      </aside>
    </div>
    <SpokeCards except={meta.path} />
    <div className="mt-10"><SeoBody lang="en" faq={c.faq} related={[{ label: 'online sudoku, all levels', href: HUB }, ...c.related]} /></div>
  </Wrap>
}

export function EnglishSudokuKids() {
  const c = KIDS_PAGE
  const { level, seed, fresh, setLevel } = useSeed(['kids4', 'kids6'], 'kids4')
  return <Wrap>
    <SEO lang="en" title={c.seoTitle} description={c.description} path="/en/sudoku/kids" counterpartPath="/sudoku/kids" structuredData={[appSchema(c.h1, c.description, '/en/sudoku/kids'), faqSchema(c.faq)]} />
    <Breadcrumbs lang="en" items={crumbs(c.h1)} />
    <Head emoji="🧒" h1={c.h1} intro={c.intro} />
    <div className="mt-5"><LevelChips levels={['kids4', 'kids6']} value={level} onPick={setLevel} /></div>
    <div className="sdk-play-grid mt-5">
      <div><Player level={level} seed={seed} onNew={fresh} newLabel="New board" shareText={shareFor('/en/sudoku/kids')} /></div>
      <aside className="grid gap-4">
        <div className="sdk-box"><h2>How to play</h2><ol>
          <li>Tap an empty cell.</li>
          <li>Tap a number from the row under the board.</li>
          <li>In every row, every column and every bold box, each number appears only once.</li>
          <li>Is the whole board full? You win! 🎉</li>
        </ol></div>
        <Tips items={c.tips} title="Tips for parents" />
      </aside>
    </div>
    <SpokeCards except="/en/sudoku/kids" />
    <div className="mt-10"><SeoBody lang="en" faq={c.faq} related={[{ label: 'online sudoku, all levels', href: HUB }, ...c.related]} /></div>
  </Wrap>
}

export function EnglishSudokuDaily() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [level, setLevel] = useState(() => (ADULT_LEVELS.includes(params.get('level')) ? params.get('level') : 'medium'))
  const [today, setToday] = useState(() => israelDate())
  useEffect(() => {
    const t = setInterval(() => setToday(israelDate()), 60000)
    return () => clearInterval(t)
  }, [])
  const puzzle = useMemo(() => dailyPuzzle(level, today), [level, today])
  const pick = lv => { setLevel(lv); setParams(lv === 'medium' ? {} : { level: lv }, { replace: true, preventScrollReset: true }) }
  const description = 'A new daily sudoku every day: the same board for everyone who plays today, at four difficulty levels. Solve it online for free and compare times with friends.'
  return <Wrap>
    <SEO lang="en" title="Daily sudoku - today's board, the same for everyone" description={description} path="/en/sudoku/daily" counterpartPath="/sudoku/daily" structuredData={[appSchema('Daily sudoku', description, '/en/sudoku/daily'), faqSchema(DAILY_FAQ)]} />
    <Breadcrumbs lang="en" items={crumbs('Daily sudoku')} />
    <Head emoji="📅" h1="Daily sudoku" intro={`The daily sudoku for ${niceDate(today)}: one board that every player gets today, and it changes at midnight (Israel time). Solve it, see how long it took, and send it to friends to find out if they are faster.`} />
    <div className="mt-5"><LevelChips levels={ADULT_LEVELS} value={level} onPick={pick} /></div>
    <div className="sdk-play-grid mt-5">
      <div><Player puzzle={puzzle} bestKey={`daily-${level}`} newLabel={`Another ${LEVELS[level].long.toLowerCase()}`} onNew={() => navigate(LEVELS[level].path)}
        shareText={() => `📅 The daily sudoku (${niceDate(today)}, ${LEVELS[level].name}) - the same board for everyone. Can you solve it? ${SITE}/en/sudoku/daily${level === 'medium' ? '' : `?level=${level}`}`} /></div>
      <aside className="grid gap-4">
        <div className="sdk-box"><h2>How does it work?</h2><ul>
          <li>The board is set by the date, so everyone gets exactly the same board.</li>
          <li>Every level has its own daily board. The default is medium.</li>
          <li>The timer stops when you pause or switch to another tab.</li>
          <li>Tomorrow at midnight, a new board.</li>
        </ul></div>
        <Tips items={STRATEGY.slice(0, 3).map(s => `${s.t}: ${s.d}`)} title="Quick tips" />
      </aside>
    </div>
    <SpokeCards except="/en/sudoku/daily" />
    <div className="mt-10"><SeoBody lang="en" faq={DAILY_FAQ} related={[{ label: 'online sudoku, all levels', href: HUB }, { label: 'hard sudoku', href: '/en/sudoku/hard' }]} /></div>
  </Wrap>
}

const EXAMPLE = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79'
export function EnglishSudokuSolver() {
  const [n, setN] = useState(9)
  const [cells, setCells] = useState(() => Array(81).fill(0))
  const [result, setResult] = useState(null)
  const [paste, setPaste] = useState('')
  const refs = useRef([])
  const N = n * n
  const bad = useMemo(() => conflicts(cells, n), [cells, n])
  const { br, bc } = geom(n)
  const reset = size => { setN(size); setCells(Array(size * size).fill(0)); setResult(null) }
  const setCell = (i, v) => { setCells(cs => { const out = cs.slice(); out[i] = v; return out }); setResult(null) }
  const focus = i => refs.current[(i + N) % N]?.focus()
  const onKey = (e, i) => {
    const map = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: n, ArrowUp: -n }
    if (map[e.key] !== undefined) { e.preventDefault(); focus(i + map[e.key]) }
    else if (e.key === 'Backspace' && !cells[i]) { e.preventDefault(); setCell(i - 1 >= 0 ? i - 1 : i, 0); focus(i - 1) }
  }
  const onInput = (e, i) => {
    const d = Number(String(e.target.value).replace(/[^1-9]/g, '').slice(-1))
    if (d >= 1 && d <= n) { setCell(i, d); focus(i + 1) } else setCell(i, 0)
  }
  const run = mode => {
    const givens = cells.filter(Boolean).length
    if (bad.size) { setResult({ kind: 'conflict' }); return }
    const r = countSolutions(cells, n, 2)
    if (r.count === 0) { setResult({ kind: 'none' }); return }
    if (mode === 'hint') {
      const empty = cells.map((v, i) => (v ? -1 : i)).filter(i => i >= 0)
      if (!empty.length) { setResult({ kind: 'full' }); return }
      const i = empty[Math.floor(Math.random() * empty.length)]
      setCell(i, r.solution[i])
      setResult({ kind: r.count === 1 ? 'hint' : 'hint-multi', cell: i })
      return
    }
    const gr = n === 9 && r.count === 1 ? grade(cells, 9) : null
    setResult({ kind: r.count === 1 ? 'one' : 'many', solution: r.solution, grade: gr, givens, check: mode === 'check' })
  }
  const loadPaste = text => {
    const digits = String(text).replace(/\s/g, '').replace(/[0.\-_*]/g, '0').replace(/[^0-9]/g, '')
    if (digits.length !== N) { setResult({ kind: 'paste', len: digits.length }); return }
    setCells([...digits].map(Number).map(v => (v <= n ? v : 0))); setResult(null)
  }
  const solved = result && (result.kind === 'one' || result.kind === 'many') && !result.check ? result.solution : null
  const description = 'Free online sudoku solver: type or paste a 9×9 (or 4×4, 6×6) board and get the solution, the difficulty, and a clear answer if there is no solution or more than one.'
  const techNames = result?.grade ? Object.keys(result.grade.used).map(k => TECHNIQUE_NAMES[k]).filter(Boolean) : []
  return <Wrap>
    <SEO lang="en" title="Sudoku solver - type a board and get the solution" description={description} path="/en/sudoku/solver" counterpartPath="/sudoku/solver" structuredData={[appSchema('Sudoku solver', description, '/en/sudoku/solver'), faqSchema(SOLVER_FAQ)]} />
    <Breadcrumbs lang="en" items={crumbs('Sudoku solver')} />
    <Head emoji="🧮" h1="Sudoku solver" intro='A sudoku solver for any board you are stuck on, from a newspaper, a puzzle book or an app. Type in the numbers, press "Solve", and get the full board, an estimate of the difficulty and a clear answer if something is wrong with the board.' />
    <div className="sdk-play-grid mt-6">
      <div>
        <div className="sdk-levels mb-3" role="group" aria-label="Board size">{[9, 6, 4].map(s => <button key={s} type="button" className="sdk-chip" aria-pressed={n === s} onClick={() => reset(s)}>{s}×{s}</button>)}</div>
        <div className="sdk-input" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="grid" aria-label="Type in a sudoku board">
          {Array.from({ length: N }, (_, i) => {
            const r = Math.floor(i / n), c = i % n
            const v = cells[i] || (solved ? solved[i] : 0)
            const cls = [(c + 1) % bc === 0 && c < n - 1 && 'b-e', (r + 1) % br === 0 && r < n - 1 && 'b-s', !cells[i] && solved && 'is-solved', bad.has(i) && 'is-bad'].filter(Boolean).join(' ')
            return <input key={`${n}-${i}`} ref={el => { refs.current[i] = el }} className={cls} style={{ fontSize: `calc(100cqw / ${n} * .55)` }} value={v || ''} inputMode="numeric" autoComplete="off" maxLength={2}
              aria-label={`Row ${r + 1} column ${c + 1}`} onChange={e => onInput(e, i)} onKeyDown={e => onKey(e, i)} onFocus={e => e.target.select()} />
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" className="sdk-btn sdk-btn-primary" onClick={() => run('solve')}>✅ Solve</button>
          <button type="button" className="sdk-btn" onClick={() => run('check')}>🔍 Check without revealing</button>
          <button type="button" className="sdk-btn" onClick={() => run('hint')}>💡 One cell</button>
          <button type="button" className="sdk-btn" onClick={() => reset(n)}>🧹 Clear</button>
        </div>
        <div className="mt-4 text-center text-lg" role="status" aria-live="polite">
          {result?.kind === 'conflict' && <p className="font-bold text-red-600">A number repeats in the same row, column or box (marked in red). Fix it and try again.</p>}
          {result?.kind === 'none' && <p className="font-bold text-red-600">This board has no solution. Check that the numbers were typed correctly.</p>}
          {result?.kind === 'full' && <p className="font-bold">The board is already full.</p>}
          {result?.kind === 'paste' && <p className="font-bold text-red-600">You need exactly {N} characters, but {result.len} were pasted.</p>}
          {result?.kind === 'hint' && <p className="font-bold text-green-700">We added one correct number. Carry on by yourself!</p>}
          {result?.kind === 'hint-multi' && <p className="font-bold text-amber-700">We added a number, but note that this board has more than one solution.</p>}
          {result?.kind === 'one' && <div className="sdk-box text-start">
            <p className="font-bold text-green-700">{result.check ? '✔ This board has exactly one solution, so it is a valid sudoku.' : '✔ Solved! This board has exactly one solution.'}</p>
            {result.grade && <p className="mt-1">Estimated difficulty: <b>{LEVELS[result.grade.level].name}</b> ({result.givens} clues){techNames.length ? ` · techniques needed: ${techNames.join(', ')}` : ''}{result.grade.level === 'very-hard' ? ' · testing a hypothesis is needed' : ''}.</p>}
          </div>}
          {result?.kind === 'many' && <div className="sdk-box text-start">
            <p className="font-bold text-amber-700">⚠ This board has more than one solution. Numbers are probably missing, or something was typed wrong.</p>
            {!result.check && <p className="mt-1">One possible solution is shown on the board, but it is not the only one.</p>}
          </div>}
        </div>
      </div>
      <aside className="grid gap-4">
        <div className="sdk-box"><h2>Paste a board as text</h2>
          <p className="mb-2 text-sm text-slate-600">{N} characters in order, row after row. 0 or a dot = an empty cell.</p>
          <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={3} dir="ltr" className="w-full rounded-xl border-2 border-slate-300 p-2 font-mono text-sm" aria-label="Board as text" />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="sdk-btn" onClick={() => loadPaste(paste)}>Load into the board</button>
            {n === 9 && <button type="button" className="sdk-btn" onClick={() => { setPaste(EXAMPLE); loadPaste(EXAMPLE) }}>Example board</button>}
          </div>
        </div>
        <div className="sdk-box"><h2>What does the solver check?</h2><ul>
          <li>That no number is repeated in a row, column or box.</li>
          <li>Whether there is a solution, and whether there is only one.</li>
          <li>On a 9×9 board: the level, and which techniques it needs.</li>
        </ul></div>
      </aside>
    </div>
    <SpokeCards except="/en/sudoku/solver" />
    <div className="mt-10"><SeoBody lang="en" paragraphs={[
      'The solver works in two layers. The first solves like a person: it fills cells that have only one possibility and uses pairs, locked candidates and X-wings when it must, which is how the difficulty is set. The second is a computer search that tries every possibility, so it can say for certain whether there is one solution, how many, or none at all.',
    ]} faq={SOLVER_FAQ} related={[{ label: 'online sudoku, all levels', href: HUB }, { label: 'very hard sudoku', href: '/en/sudoku/very-hard' }]} /></div>
  </Wrap>
}
