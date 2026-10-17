// Asks the live BugaPedia answer function the evaluation questions (one shard) and records what a child sees.
import fs from 'node:fs'
import { findBugaPediaKnowledge } from '../../src/data/bugapediaKnowledge.js'
import { findBugaPediaSuperlative } from '../../src/data/bugapediaSuperlatives.js'
const [shard, shards] = process.argv.slice(2).map(Number)
const URL = 'https://efhgyispuwxcplvzipcy.supabase.co/functions/v1/bugapedia-answer'
const KEY = 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const qs = JSON.parse(fs.readFileSync(new URL('./questions.json', import.meta.url))).filter((_, i) => i % shards === shard)
const out = []
for (const [q, subject] of qs) {
  const local = findBugaPediaKnowledge(q) || findBugaPediaSuperlative(q)
  if (local) { out.push({ q, subject, source: 'checked', answer: `${local.title} — ${local.extract}` }); continue }
  const started = Date.now()
  let row
  try {
    const r = await fetch(URL, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json', Origin: 'https://ugabuga.co.il' }, body: JSON.stringify({ question: q, subject }) })
    const data = await r.json().catch(() => ({}))
    row = { q, subject, status: r.status, source: data.skip ? 'skip' : 'model', answer: data.answer || data.error || '', confident: data.confident, sources: (data.sources || []).map(s => s.title), ms: Date.now() - started }
  } catch (e) { row = { q, subject, source: 'error', answer: e.message } }
  out.push(row)
  console.log(row.status, q, '→', String(row.answer).slice(0, 90))
}
fs.mkdirSync('scripts/bpeval/live', { recursive: true })
fs.writeFileSync(`scripts/bpeval/live/shard-${shard}.json`, JSON.stringify(out, null, 1))
