// Builds full, newspaper-style Hebrew crosswords (every white cell belongs to words, symmetric black
// squares) from the word bank in src/adults/words/*.js, and writes src/adults/crosswordsData.js.
//   node scripts/generate-crosswords.mjs [count-per-size]
// Deterministic (seeded), so re-running gives the same puzzles unless the word bank changes.
import { readdir, writeFile } from 'node:fs/promises'

const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const norm = w => [...w].map(c => FINAL[c] || c).join('')
// Usage: node scripts/generate-crosswords.mjs [count-per-size] [only-size] [seed-offset] [part-file]
// With a part-file the puzzles are only saved there as JSON (to run several sizes/seeds in parallel);
// `node scripts/generate-crosswords.mjs merge <part files…>` then writes the data file and sitemap.
const MERGE = process.argv[2] === 'merge'
const COUNT = Number(process.argv[2] || 24)
const OFFSET = Number(process.argv[4] || 0), PART = process.argv[5]
const SIZES = [{ n: 9, black: [0.14, 0.2], label: 'רגיל' }, { n: 11, black: [0.14, 0.19], label: 'גדול' }].filter(s => MERGE || !process.argv[3] || s.n === Number(process.argv[3]))

function rng(seed) { let a = seed >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
const shuffle = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

// ---- word bank ----
const dir = new URL('../src/adults/words/', import.meta.url)
const bank = new Map() // normalized → { answer, clue }
for (const f of (await readdir(dir)).filter(f => f.endsWith('.js')).sort()) {
  const { WORDS } = await import(new URL(f, dir))
  for (const [a, c] of WORDS) { const k = norm(a); if (/^[א-ת]{2,11}$/.test(a) && c && !bank.has(k)) bank.set(k, { answer: a, clue: c.trim() }) }
}
const byLen = new Map()
for (const k of bank.keys()) { if (!byLen.has(k.length)) byLen.set(k.length, []); byLen.get(k.length).push(k) }
// index[len][pos][letter] = Set of words
const index = new Map()
for (const [len, list] of byLen) {
  const pos = Array.from({ length: len }, () => new Map())
  for (const w of list) for (let i = 0; i < len; i++) { const m = pos[i]; if (!m.has(w[i])) m.set(w[i], []); m.get(w[i]).push(w) }
  index.set(len, pos)
}
console.log(`word bank: ${bank.size} words`, Object.fromEntries([...byLen].map(([l, a]) => [l, a.length]).sort((a, b) => a[0] - b[0])))

// ---- grid pattern ----
// Rows top→bottom, columns right→left (col 0 is the rightmost, as Hebrew is read).
function pattern(n, r, [lo, hi]) {
  const g = Array.from({ length: n }, () => Array(n).fill(false)) // true = black
  const target = Math.round(n * n * (lo + r() * (hi - lo)))
  let blacks = 0, guard = 0
  while (blacks < target && guard++ < 4000) {
    const y = Math.floor(r() * n), x = Math.floor(r() * n)
    if (g[y][x]) continue
    const y2 = n - 1 - y, x2 = n - 1 - x
    g[y][x] = g[y2][x2] = true
    if (!valid(g, n, true)) { g[y][x] = g[y2][x2] = false; continue }
    blacks += (y === y2 && x === x2) ? 1 : 2
  }
  return valid(g, n) && blacks >= target * 0.8 ? g : null
}
// No word longer than the bank allows, every white cell crossed by at least one word of length ≥ 2,
// at most a few cells that belong to only one word, and all white cells connected.
function valid(g, n, partial = false) {
  const maxLen = partial ? Infinity : Math.max(...byLen.keys())
  let single = 0
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (g[y][x]) continue
    const a = run(g, n, y, x, 0, 1), d = run(g, n, y, x, 1, 0)
    if (a > maxLen || d > maxLen) return false
    if (a < 2 && d < 2) return false
    if (a < 2 || d < 2) single++
  }
  if (!partial && single > n * 0.9) return false
  // connectivity
  const start = (() => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!g[y][x]) return [y, x] })()
  if (!start) return false
  const seen = new Set([start.join()]), q = [start]
  while (q.length) { const [y, x] = q.pop(); for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < n && xx >= 0 && xx < n && !g[yy][xx] && !seen.has(`${yy},${xx}`)) { seen.add(`${yy},${xx}`); q.push([yy, xx]) } } }
  let whites = 0; for (const row of g) for (const b of row) if (!b) whites++
  return seen.size === whites
}
function run(g, n, y, x, dy, dx) {
  let a = 0, yy = y, xx = x
  while (yy >= 0 && xx >= 0 && !g[yy][xx]) { yy -= dy; xx -= dx }
  yy += dy; xx += dx
  while (yy < n && xx < n && !g[yy][xx]) { a++; yy += dy; xx += dx }
  return a
}
function slots(g, n) {
  const out = []
  for (const [dy, dx, dir] of [[0, 1, 'across'], [1, 0, 'down']]) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (g[y][x]) continue
    const py = y - dy, px = x - dx
    if (py >= 0 && px >= 0 && !g[py][px]) continue
    const cells = []; let yy = y, xx = x
    while (yy < n && xx < n && !g[yy][xx]) { cells.push([yy, xx]); yy += dy; xx += dx }
    if (cells.length >= 2) out.push({ dir, cells })
  }
  return out
}

// ---- fill (backtracking, most-constrained slot first) ----
function fill(g, n, r, budget = n > 9 ? 40000 : 20000) {
  const S = slots(g, n), letters = Array.from({ length: n }, () => Array(n).fill(null))
  const used = new Set(), assign = new Array(S.length).fill(null)
  let nodes = 0
  const candidates = s => {
    const pos = index.get(s.cells.length)
    if (!pos) return []
    let best = null
    s.cells.forEach(([y, x], i) => { const c = letters[y][x]; if (c) { const l = pos[i].get(c) || []; if (!best || l.length < best.length) best = l } })
    const base = best || byLen.get(s.cells.length) || []
    return base.filter(w => !used.has(w) && s.cells.every(([y, x], i) => !letters[y][x] || letters[y][x] === w[i]))
  }
  const solve = () => {
    if (++nodes > budget) return false
    let pick = -1, pickC = null
    for (let i = 0; i < S.length; i++) {
      if (assign[i]) continue
      const c = candidates(S[i])
      if (!c.length) return false
      if (!pickC || c.length < pickC.length) { pick = i; pickC = c; if (c.length === 1) break }
    }
    if (pick < 0) return true
    for (const w of shuffle(pickC.slice(0, 400), r)) {
      const s = S[pick], prev = s.cells.map(([y, x]) => letters[y][x])
      s.cells.forEach(([y, x], i) => { letters[y][x] = w[i] })
      used.add(w); assign[pick] = w
      if (solve()) return true
      used.delete(w); assign[pick] = null
      s.cells.forEach(([y, x], i) => { letters[y][x] = prev[i] })
    }
    return false
  }
  return solve() ? { S, assign, letters } : null
}

// ---- build ----
const puzzles = []
for (const size of MERGE ? [] : SIZES) {
  let made = 0, seed = size.n * 100000 + OFFSET
  while (made < COUNT && seed < size.n * 100000 + OFFSET + 20000) {
    const r = rng(++seed), g = pattern(size.n, r, size.black)
    if (!g) continue
    const res = fill(g, size.n, r)
    if (!res) continue
    // Numbering: top→bottom, right→left (col 0 is rightmost).
    const num = Array.from({ length: size.n }, () => Array(size.n).fill(0)); let k = 0
    const starts = new Set(res.S.map(s => s.cells[0].join()))
    for (let y = 0; y < size.n; y++) for (let x = 0; x < size.n; x++) if (starts.has(`${y},${x}`)) num[y][x] = ++k
    const clue = (s, i) => ({ n: num[s.cells[0][0]][s.cells[0][1]], clue: bank.get(res.assign[i]).clue, answer: bank.get(res.assign[i]).answer, len: s.cells.length })
    const across = [], down = []
    res.S.forEach((s, i) => (s.dir === 'across' ? across : down).push(clue(s, i)))
    across.sort((a, b) => a.n - b.n); down.sort((a, b) => a.n - b.n)
    // Grid rows as strings: '#' black, otherwise the normalized letter.
    const grid = g.map((row, y) => row.map((b, x) => b ? '#' : res.letters[y][x]).join(''))
    made++
    puzzles.push({ id: `${size.n}-${made}`, size: size.n, label: size.label, grid, across, down })
    process.stdout.write(`${size.n}x${size.n} #${made} `)
  }
}
console.log(`\n${puzzles.length} puzzles`)
if (PART) { await writeFile(PART, JSON.stringify(puzzles)); process.exit(0) }
if (MERGE) {
  const { readFile: rf } = await import('node:fs/promises')
  const seen = new Set()
  for (const f of process.argv.slice(3)) for (const p of JSON.parse(await rf(f, 'utf8'))) { const key = p.grid.join(''); if (!seen.has(key)) { seen.add(key); puzzles.push(p) } }
  // Number per size in a stable order (9×9 first).
  puzzles.sort((a, b) => a.size - b.size)
  const count = {}
  for (const p of puzzles) { count[p.size] = (count[p.size] || 0) + 1; p.id = `${p.size}-${count[p.size]}` }
  console.log(`merged ${puzzles.length} puzzles`, count)
}
const body = `// Generated by scripts/generate-crosswords.mjs — do not edit by hand.\n// grid: rows top→bottom, each string right→left ('#' = black square, letters without final forms).\nexport const CROSSWORDS = ${JSON.stringify(puzzles)}\n`
await writeFile(new URL('../src/adults/crosswordsData.js', import.meta.url), body)

// ---- sitemap + site search for the adults area (between "adults" markers) ----
const today = new Date().toISOString().slice(0, 10)
const PAGES = [
  ['/adults', '0.8', 'פנאי למבוגרים', '☕', 'tool', 'תשבצים מלאים להדפסה, מנדלות, סודוקו ופעילויות עם הנכדים — הכול בגדול', 'פנאי למבוגרים גיל הזהב ותיקים פעילות למבוגרים'],
  ['/adults/crosswords', '0.8', 'תשחצים להדפסה', '✏️', 'tool', `${puzzles.length} תשבצים מלאים כמו בעיתון, עם פתרונות`, 'תשחצים להדפסה תשבצים להדפסה למבוגרים תשבץ עיתון'],
  ['/adults/mandalas', '0.8', 'מחולל מנדלות לצביעה', '🌸', 'tool', 'מנדלה חדשה בכל לחיצה, ברמות פירוט שונות', 'מנדלות למבוגרים מנדלה לצביעה מחולל מנדלות דפי צביעה למבוגרים'],
  ['/adults/grandparents', '0.8', 'סבא וסבתא עם הנכדים', '👵', 'page', 'פעילויות, משחקים ורעיונות לסבים ולנכדים — גם מרחוק', 'פעילויות עם סבא וסבתא נכדים סבים'],
  ['/adults/grandparents/interview', '0.7', 'ראיון עם סבא וסבתא — חוברת סיפור חיים', '📖', 'page', 'שאלות לראיון, להדפסה', 'ראיון סבא וסבתא שאלות סיפור חיים שורשים'],
]
const q = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const urls = [], rows = []
for (const [to, prio, title, emoji, kind, desc, keys] of PAGES) { urls.push(`  <url><loc>https://ugabuga.co.il${to}</loc><lastmod>${today}</lastmod><priority>${prio}</priority></url>`); rows.push(`  { to: '${to}', title: '${q(title)}', emoji: '${emoji}', kind: '${kind}', desc: '${q(desc)}', keys: '${q(keys)}' },`) }
for (const p of puzzles) { const t = `תשבץ ${p.label} מס׳ ${p.id.split('-')[1]} (${p.size}×${p.size})`; urls.push(`  <url><loc>https://ugabuga.co.il/adults/crosswords/${p.id}</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>`); rows.push(`  { to: '/adults/crosswords/${p.id}', title: '${q(t)}', emoji: '✏️', kind: 'page', low: true, desc: 'תשבץ להדפסה עם פתרון', keys: 'תשבץ להדפסה תשחץ ${p.size}' },`) }
const { readFile } = await import('node:fs/promises')
async function patch(file, start, end, text, anchor) {
  const url = new URL(`../${file}`, import.meta.url)
  let s = await readFile(url, 'utf8')
  const block = `${start}\n${text}\n${end}\n`
  if (s.includes(start)) s = s.slice(0, s.indexOf(start)) + block + s.slice(s.indexOf(end) + end.length + 1)
  else { const i = s.indexOf(anchor); if (i < 0) throw new Error(`${file}: anchor not found`); s = s.slice(0, i) + block + s.slice(i) }
  await writeFile(url, s)
}
await patch('public/sitemap-static.xml', '  <!-- adults:start (scripts/generate-crosswords.mjs) -->', '  <!-- adults:end -->', urls.join('\n'), '  <!-- learn-subjects:start')
await patch('src/data/searchStatic.js', '  // adults:start (scripts/generate-crosswords.mjs)', '  // adults:end', rows.join('\n'), '  // learn-subjects:start')
console.log(`adults: ${urls.length} URLs in sitemap and search`)
