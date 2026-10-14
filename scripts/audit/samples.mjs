// Run with AUDIT_BASE/CHROME_PATH after crawl: node scripts/audit/samples.mjs
// Rechecks the deterministic 100-page accessibility sample (deduplicated across sections).
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const paths=[...readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname)
const hash=p=>createHash('sha256').update(p).digest('hex')
const sorted=[...new Set(paths)].sort((a,b)=>hash(a).localeCompare(hash(b))),sections=new Map()
for(const p of sorted){const s=p.split('/').filter(Boolean)[0]||'home';if(!sections.has(s))sections.set(s,p)}
const sample=[...new Set([...sections.values(),...sorted])].slice(0,100)
process.env.AUDIT_FILTER='^(?:'+sample.map(p=>p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')$'
process.env.AUDIT_OUTPUT='out/audit/samples.jsonl'
await import('./crawl.mjs')
