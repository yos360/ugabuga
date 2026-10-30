import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'

// The prerender stops the whole deploy on a duplicate page title, and subjects are now built in
// parallel — two of them can give the same concept the same SEO title (it happened with "fossil").
test('no two lessons or concepts across all subjects share an SEO title', async () => {
  const dir = new URL('../src/learn/subjects/data/', import.meta.url)
  const seen = new Map(), dups = []
  for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const mod = await import(new URL(f, dir))
    for (const list of Object.values(mod)) {
      if (!Array.isArray(list)) continue
      for (const x of list) {
        const t = x?.seoTitle?.trim()
        if (!t) continue
        const where = `${f}:${x.slug || x.term}`
        if (seen.has(t)) dups.push(`${t} — ${seen.get(t)} / ${where}`)
        else seen.set(t, where)
      }
    }
  }
  assert.deepEqual(dups, [])
})
