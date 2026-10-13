import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// SEO.jsx imports JSX modules, so test the two pure helpers from their source text.
const src = readFileSync(new URL('../src/components/ui/SEO.jsx', import.meta.url), 'utf8')
const block = src.slice(src.indexOf('export const TITLE_MAX'), src.indexOf('export default function SEO'))
const { seoTitle, seoDescription } = await import('data:text/javascript,' + encodeURIComponent(block))

test('titles keep the brand when they fit and drop it when they would be cut', () => {
  assert.equal(seoTitle('מבוכים להדפסה'), 'מבוכים להדפסה | עוגה בוגה')
  const long = 'א'.repeat(65)
  assert.equal(seoTitle(long), long)
  assert.ok(seoTitle('ב'.repeat(58)).length <= 70)
})
test('long descriptions are cut at a word with an ellipsis', () => {
  const d = Array.from({ length: 60 }, (_, i) => `מילה${i}`).join(' ')
  const out = seoDescription(d)
  assert.ok(out.length <= 165 && out.endsWith('…') && !out.includes('  '), out)
  assert.equal(seoDescription('קצר'), 'קצר')
})
