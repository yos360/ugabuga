import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { MAX_OFFERS_PER_SESSION as MAX_PER_SESSION, mayOffer as offer } from '../src/utils/printEvents.js'
const mayOffer = (path, memory) => offer(path, memory)

test('the suggestion is offered once per page, never after "no thanks", at most a few times a visit', () => {
  assert.equal(mayOffer('/a', {}), true)
  assert.equal(mayOffer('/a', { paths: ['/a'], count: 1 }), false)
  assert.equal(mayOffer('/b', { paths: ['/a'], count: 1 }), true)
  assert.equal(mayOffer('/b', { dismissed: true, count: 1 }), false)
  assert.equal(mayOffer('/z', { count: MAX_PER_SESSION }), false)
})

test('printing is announced only after the browser was asked to print or the PDF was saved', () => {
  const preview = readFileSync(new URL('../src/components/ui/PrintPreview.jsx', import.meta.url), 'utf8')
  assert.ok(preview.indexOf("announcePrint('print'") > preview.indexOf('window.print()'))
  assert.ok(preview.indexOf("announcePrint('pdf'") > preview.indexOf("recordSheetAction('download'"))
  const fallback = readFileSync(new URL('../src/components/layout/PrintQrFallback.jsx', import.meta.url), 'utf8')
  assert.match(fallback, /addEventListener\('afterprint'/)
})
