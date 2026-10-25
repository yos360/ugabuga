import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')
test('travel landing is registered across routes, navigation, search and sitemap', () => {
  for (const file of ['src/App.jsx', 'src/data/siteMenu.js', 'src/data/searchStatic.js', 'public/sitemap-static.xml']) assert.ok(read(file).includes('/travel'), file)
  assert.ok(read('src/pages/Home.jsx').includes('to="/travel"'))
  assert.ok(read('src/family/FamilyTools.jsx').includes('to="/travel"'))
})
