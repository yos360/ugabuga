// Site navigation: six domains + the classroom button. Every menu and footer
// link must resolve to a real route, and each page lives in exactly one domain.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const M = await import('../src/data/siteMenu.js')
const { MENU_DOMAINS, CLASSROOM_MENU, FOOTER_COLUMNS, MENU_GROUPS, MENU_ACTIVE_PREFIXES, KIDS_ZONE, SITE_MAP_LINK, activeDomainFor } = M

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const routes = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*')
const STATIC = new Set(routes.filter(p => !p.includes(':') && !p.includes('*')))
const PARAM = routes.filter(p => p.includes(':') || p.endsWith('/*')).map(p => new RegExp(`^${p.replace(/\/\*$/, '(/.*)?').replace(/:[^/]+/g, '[^/]+')}$`))
const pathOf = href => href.split('#')[0]
const routeExists = href => STATIC.has(pathOf(href)) || PARAM.some(re => re.test(pathOf(href)))

const domainLinks = d => d.groups
  ? [d.to, ...d.groups.flatMap(g => [g.to, ...g.items.map(i => i.to)])].filter(Boolean)
  : [d.to, ...d.items.filter(i => !i.shortcut).map(i => i.to)]
const ALL_DOMAINS = [...MENU_DOMAINS, CLASSROOM_MENU]

test('six domains in the agreed order, plus the classroom button', () => {
  assert.deepEqual(MENU_DOMAINS.map(d => d.id), ['games', 'learn', 'printables', 'birthday', 'holidays', 'family'])
  assert.deepEqual(MENU_DOMAINS.map(d => d.to), ['/games', '/learn', '/printables', '/birthday', '/holidays', '/family'])
  assert.equal(CLASSROOM_MENU.to, '/classroom')
  for (const d of ALL_DOMAINS) assert.ok(d.label && d.icon && d.landingLabel, d.id)
})

test('the kids zone opens the games domain and is highlighted', () => {
  const first = MENU_DOMAINS[0].groups[0].items[0]
  assert.equal(first.to, KIDS_ZONE.to)
  assert.equal(first.highlight, true)
})

test('every menu, footer and landing link points to an existing route', () => {
  const hrefs = [
    ...ALL_DOMAINS.flatMap(d => [d.to, ...(d.groups ? d.groups.flatMap(g => [g.to, ...g.items.map(i => i.to)]) : d.items.map(i => i.to))]),
    ...FOOTER_COLUMNS.flatMap(c => c.links.map(([to]) => to)),
    KIDS_ZONE.to, SITE_MAP_LINK.to,
  ].filter(Boolean)
  const missing = [...new Set(hrefs)].filter(h => !routeExists(h))
  assert.deepEqual(missing, [])
})

test('no href is listed in two different domains (classroom shortcuts aside)', () => {
  const owner = new Map()
  for (const d of ALL_DOMAINS) for (const href of new Set(domainLinks(d))) {
    assert.ok(!owner.has(href) || owner.get(href) === d.id, `${href} is in both ${owner.get(href)} and ${d.id}`)
    owner.set(href, d.id)
  }
  // Within a domain an item appears once.
  for (const d of MENU_DOMAINS) {
    const items = d.groups.flatMap(g => g.items.map(i => i.to))
    assert.equal(items.length, new Set(items).size, d.id)
  }
  // Shortcuts really are shortcuts: their page has a primary home elsewhere.
  for (const s of CLASSROOM_MENU.items.filter(i => i.shortcut)) assert.ok(owner.has(s.to) && owner.get(s.to) !== 'classroom', s.to)
})

test('every menu page highlights its own domain', () => {
  for (const d of ALL_DOMAINS) for (const href of domainLinks(d)) {
    if (href.includes('#')) continue // anchors into another domain's page
    assert.equal(activeDomainFor(href), d.id, href)
  }
  assert.equal(activeDomainFor('/games/shabbat'), 'holidays')
  assert.equal(activeDomainFor('/tools/bring-list'), 'birthday')
  assert.equal(activeDomainFor('/tools/dice/dnd'), 'games')
  assert.equal(activeDomainFor('/online-games/snake'), 'games')
  assert.equal(activeDomainFor('/holidays/purim/quiz'), 'holidays')
  assert.equal(activeDomainFor('/school-holidays/pesach'), 'holidays')
  assert.equal(activeDomainFor('/about'), null)
  assert.deepEqual(Object.keys(MENU_ACTIVE_PREFIXES).sort(), [...ALL_DOMAINS.map(d => d.id)].sort())
})

test('footer columns follow the menu domains', () => {
  assert.deepEqual(FOOTER_COLUMNS.map(c => c.domain), [...ALL_DOMAINS.map(d => d.id), null])
  const seen = new Map()
  for (const c of FOOTER_COLUMNS) for (const [to] of c.links) {
    if (c.domain) assert.equal(activeDomainFor(pathOf(to)), c.domain, `footer ${to} under ${c.domain}`)
    assert.ok(!seen.has(to), `footer ${to} twice`)
    seen.set(to, c.domain)
  }
})

test('the flat group list keeps every menu item for search and the site map', () => {
  const flat = MENU_GROUPS.flatMap(g => g.items.map(i => i.to))
  for (const d of MENU_DOMAINS) for (const g of d.groups) for (const i of g.items) assert.ok(flat.includes(i.to), i.to)
  for (const g of MENU_GROUPS) assert.ok(g.title && g.to && g.items.length, g.title)
})

test('the kids zone footer has no outside links', () => {
  const src = readFileSync(new URL('../src/components/layout/Footer.jsx', import.meta.url), 'utf8')
  const kids = src.slice(src.indexOf('function KidsFooter'), src.indexOf('export default function Footer'))
  assert.ok(kids.length > 0)
  assert.doesNotMatch(kids, /wa\.me|mailto:|https?:|suppliers|<Link|<a /)
})
