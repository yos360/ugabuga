import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Every link on /gan and /classroom/by-grade must open a real page: a route in App.jsx, a printable
// category slug (/printables/:slug) or a booklet (/booklets/:slug).
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1])
const printables = readFileSync(new URL('../src/data/printableCategories.js', import.meta.url), 'utf8')
const booklets = readFileSync(new URL('../src/booklets/registry.js', import.meta.url), 'utf8')
const mathGrades = n => n >= 1 && n <= 12
const exists = to => routes.includes(to)
  || (/^\/printables\/[a-z0-9-]+$/.test(to) && printables.includes(`slug: '${to.split('/')[2]}'`))
  || (/^\/booklets\/[a-z0-9-]+$/.test(to) && booklets.includes(`slug: '${to.split('/')[2]}'`))
  || (/^\/math\/grade-(\d+)$/.test(to) && mathGrades(Number(to.split('-')[1])))

test('every link on the gan and teacher hubs opens a real page', async () => {
  const src = readFileSync(new URL('../src/pages/classroom/AudienceHubs.jsx', import.meta.url), 'utf8')
  const links = [...src.matchAll(/'(\/[a-z0-9/_-]*)'\]/g)].map(m => m[1])
  for (const g of ['1', '2', '3', '4', '5', '6', '7', '8']) links.push(`/math/grade-${g}`, `/learn/reading/grade-${g}`)
  assert.ok(links.length > 40)
  for (const to of links) assert.ok(exists(to), `no page for ${to}`)
  assert.ok(exists('/gan') && exists('/classroom/by-grade'))
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.ok(sitemap.includes('https://ugabuga.co.il/gan</loc>') && sitemap.includes('https://ugabuga.co.il/classroom/by-grade</loc>'))
})
