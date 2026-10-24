// Checks the built-in English→Hebrew dictionary: node scripts/check-dictionary.mjs
// Every entry: lowercase English headword → short Hebrew meaning(s). Also reports which words of the
// English unseen texts it cannot resolve (through enLemma) — the goal is full coverage.
import { readdirSync } from 'node:fs'
import { lemmaCandidates } from '../src/utils/enLemma.js'

const dir = new URL('../src/data/dictionary/', import.meta.url)
const dict = {}, problems = []
let irregular = {}
for (const f of readdirSync(dir).filter(f => /^en-he-.*\.js$/.test(f))) {
  const { default: part } = await import(new URL(f, dir))
  for (const [k, v] of Object.entries(part)) {
    if (!/^[a-z][a-z' -]*$/.test(k)) problems.push(`${f}: bad headword "${k}"`)
    if (typeof v !== 'string' || !/[א-ת]/.test(v) || v.length > 80) problems.push(`${f}: bad meaning for "${k}": ${v}`)
    if (dict[k]) problems.push(`${f}: duplicate "${k}"`)
    dict[k] = v
  }
}
try { irregular = (await import(new URL('en-irregular.js', dir))).default } catch { problems.push('missing en-irregular.js') }
const unseen = new URL('../src/data/unseen/', import.meta.url), missing = new Set()
for (const f of readdirSync(unseen).filter(f => /^tests-en-/.test(f))) {
  const { TESTS } = await import(new URL(f, unseen))
  for (const t of TESTS) for (const x of t.texts) for (const p of x.paragraphs || []) for (const w of p.match(/[A-Za-z]+(?:['’][a-z]+)?/g) || []) {
    if (/^[A-Z]/.test(w) && !dict[w.toLowerCase()] && !lemmaCandidates(w, irregular).some(c => dict[c])) continue // names
    if (!lemmaCandidates(w, irregular).some(c => dict[c])) missing.add(w.toLowerCase())
  }
}
console.log(`${Object.keys(dict).length} headwords, ${Object.keys(irregular).length} irregular forms`)
if (missing.size) console.log(`unseen words not covered (${missing.size}): ${[...missing].sort().join(' ')}`)
if (problems.length) { console.log(problems.join('\n')); process.exit(1) }
if (missing.size > 20) process.exit(1)
console.log('dictionary OK')
