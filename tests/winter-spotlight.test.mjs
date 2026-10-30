import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The JSX pages can't be imported in node; read their link lists from the source.
const src = f => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8')
const sitemap = ['../public/sitemap-static.xml', '../public/sitemap.xml'].map(f => readFileSync(new URL(f, import.meta.url), 'utf8')).join('\n')
const listed = path => sitemap.includes(`https://ugabuga.co.il${path}</loc>`)

test('the winter area "בוגה שוקו חם" links only to pages that exist, and is itself listed and routed', () => {
  const page = src('pages/WinterGames.jsx')
  const links = [...page.matchAll(/\['(\/[a-z0-9/_-]+)', '/g)].map(m => m[1])
  assert.ok(links.length >= 50, `only ${links.length} links`)
  for (const l of ['/live', '/tools/eretz-ir']) assert.ok(links.includes(l), l)
  assert.deepEqual(links.filter(l => !listed(l)), [])
  assert.ok(listed('/winter'))
  assert.match(src('App.jsx'), /path="\/winter" element=\{<WinterGames \/>\}/)
  assert.ok(src('data/searchStatic.js').includes("to: '/winter'"))
})

test('the home-page sign shows real pages, Buga Live and Eretz Ir among them', () => {
  const sign = src('components/home/HomeSpotlight.jsx')
  const links = [...sign.matchAll(/\{ to: '(\/[a-z0-9/_-]+)'/g)].map(m => m[1])
  assert.ok(links.length >= 6)
  for (const l of ['/live', '/tools/eretz-ir', '/winter']) assert.ok(links.includes(l), l)
  assert.deepEqual(links.filter(l => !listed(l)), [])
  assert.match(src('pages/Home.jsx'), /<HomeSpotlight \/>/)
})
