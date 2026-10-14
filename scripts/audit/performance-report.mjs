import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import assert from 'node:assert/strict'
const read = p => JSON.parse(readFileSync(p, 'utf8'))
const before = read('out/audit/js-before.json'), after = read('out/audit/js-after.json')
const expected = read('docs/audit-data-2026-10-14.json').inventory.map(r => r.path).sort()
for (const rows of [before, after]) {
  assert.deepEqual(rows.map(r => r.path).sort(), expected)
  assert.ok(rows.every(r => !r.error && r.gzipBytes > 0))
}
assert.ok(after.every(r => r.gzipBytes <= 400000), 'every page must fit 400 decimal KB')
const stats = rows => ({ pages: rows.length, maximumGzipBytes: Math.max(...rows.map(r => r.gzipBytes)), over400KB: rows.filter(r => r.gzipBytes > 400000).length, over400KiB: rows.filter(r => r.gzipBytes > 409600).length })
const entry = dir => {
  const html = readFileSync(`${dir}/index.html`, 'utf8')
  const file = html.match(/<script[^>]*src="([^"]+\.js)"/)[1]
  return { file, gzipBytes: gzipSync(readFileSync(dir + file)).length }
}
const modules = name => read(`out/audit/bundle-${name}.json`).results.filter(r => /index-/.test(r.bundleName)).sort((a, b) => b.totalBytes - a.totalBytes).slice(0, 1).map(r => ({ file: r.bundleName, mapped: Object.entries(r.files).sort((a, b) => b[1].size - a[1].size).slice(0, 15) }))
const byPath = new Map(before.map(r => [r.path, r]))
const comparison = read('out/audit/prerender-comparison.json')
assert.equal(comparison.length, 20); assert.ok(comparison.every(r => r.pass))
const data = { method: 'Actual script responses after networkidle, desktop 1280x900, external requests blocked; gzip per file. Source-map build comments included in both runs. KB=1000 bytes.', before: { ...stats(before), entry: entry('out/audit/baseline-build'), modules: modules('before') }, after: { ...stats(after), entry: entry('dist'), modules: modules('after') }, prerender: comparison, pages: after.map(r => ({ path: r.path, before: byPath.get(r.path).gzipBytes, after: r.gzipBytes })) }
assert.ok(data.after.entry.gzipBytes <= 150000)
writeFileSync('docs/audit-performance-followup.json', JSON.stringify(data, null, 2))
console.log(JSON.stringify({ before: data.before, after: data.after }, null, 2))
