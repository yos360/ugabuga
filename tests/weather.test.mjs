import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The page imports JSX-free helpers only through this regex-free check: read the two functions' rules from the source.
const src = readFileSync(new URL('../src/pages/tools/Weather.jsx', import.meta.url), 'utf8')

test('umbrella thresholds and weather codes are as documented on the page', () => {
  assert.match(src, /chance >= 60 \|\| mm >= 2\) return \{ level: 'yes'/)
  assert.match(src, /chance >= 30 \|\| mm >= 0\.5\) return \{ level: 'maybe'/)
  assert.match(src, /מ־60% או 2 מ״מ — לקחת מטרייה; מ־30% או חצי מילימטר — כדאי מטרייה קטנה/)
  assert.match(src, /Open-Meteo\.com<\/a> \(CC BY 4\.0\)/, 'the data license is credited')
})

test('the weather page is routed, in the sitemap, the search and the menu', () => {
  assert.match(readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8'), /path="\/weather" element=\{<Weather \/>\}/)
  assert.ok(readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8').includes('https://ugabuga.co.il/weather</loc>'))
  assert.ok(readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8').includes("to: '/weather'"))
  assert.ok(readFileSync(new URL('../src/data/siteMenu.js', import.meta.url), 'utf8').includes("to: '/weather'"))
})
