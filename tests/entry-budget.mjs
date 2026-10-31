import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'

test('production entry stays under 150 KB gzip without the full search/content catalogs', async () => {
  const result = await build({ logLevel: 'silent', build: { write: false, sourcemap: true } })
  const entry = result.output.find(o => o.type === 'chunk' && o.isEntry)
  assert.ok(entry)
  assert.ok(gzipSync(entry.code).length <= 150000, 'main entry must fit the decimal 150 KB budget')
  for (const source of entry.map.sources) {
    assert.doesNotMatch(source, /\/(searchStatic|coloringDrawings|holidayColoringData|alphabetData|videos|sessionRecorder|recordingCodec)\.js$/, `${source} must not be in the entry`)
    assert.doesNotMatch(source, /node_modules\/(@rrweb|rrweb)/, `${source} must not be in the entry`)
  }
})
