import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceNavigationHistory as move, createNavigationHistory as start, validReturnSource, internalNavigationHref } from '../src/utils/navigationHistory.js'

const at = (key, pathname) => ({ key, pathname })

test('return targets follow the actual entry point across site sections', () => {
  for (const [origin, destination] of [
    ['/adults', '/sudoku/print'], ['/kids', '/stories/the-little-cloud'],
    ['/search', '/tools/bingo'], ['/classroom', '/printables/name-labels'],
    ['/family', '/tools/word-search-maker'], ['/en/games', '/en/printables'],
  ]) {
    const history = move(start(at('a', origin)), at('b', destination), 'PUSH', 1)
    assert.deepEqual(history.current.from, { pathname: origin, index: 0 })
  }
})

test('query and fragment entries keep the source and the distance needed to return', () => {
  let history = start(at('a', '/adults'))
  history = move(history, at('b', '/sudoku/print'), 'PUSH', 1)
  history = move(history, at('c', '/sudoku/print'), 'PUSH', 2)
  history = move(history, at('d', '/sudoku/print'), 'REPLACE', 2)
  assert.deepEqual(history.current.from, { pathname: '/adults', index: 0 })
  assert.equal(history.current.index - history.current.from.index, 2)
})

test('back, forward and a new branch retain the correct predecessor', () => {
  let history = start(at('a', '/printables'))
  history = move(history, at('b', '/printables/coloring'), 'PUSH', 1)
  history = move(history, at('c', '/printables/coloring/cats'), 'PUSH', 2)
  history = move(history, at('b', '/printables/coloring'), 'POP', 1)
  assert.equal(history.current.from.pathname, '/printables')
  history = move(history, at('c', '/printables/coloring/cats'), 'POP', 2)
  assert.equal(history.current.from.pathname, '/printables/coloring')
  history = move(history, at('b', '/printables/coloring'), 'POP', 1)
  history = move(history, at('d', '/printables/mazes'), 'PUSH', 2)
  assert.equal(history.entries.c, undefined)
  assert.equal(history.current.from.pathname, '/printables/coloring')
})

test('a redirect replaces an entry without losing the source', () => {
  let history = move(start(at('a', '/classroom')), at('b', '/word-search'), 'PUSH', 1)
  history = move(history, at('c', '/tools/word-search-maker'), 'REPLACE', 1)
  assert.deepEqual(history.current.from, { pathname: '/classroom', index: 0 })
})

test('reload restores a source without persisting query strings or fragments', () => {
  const history = start(at('b', '/sudoku/print'), 3, { pathname: '/adults', index: 0, extra: 'discarded' })
  assert.deepEqual(history.current.from, { pathname: '/adults', index: 0 })
  for (const pathname of ['https://example.com', '//example.com', '/tools?private=value', '/tools#fragment', '/\\example.com']) {
    assert.equal(validReturnSource({ pathname, index: 0 }, 3), null)
  }
  assert.equal(validReturnSource({ pathname: '/adults', index: 3 }, 3), null)
  assert.equal(start(at('direct', '/sudoku/print')).current.from, null)
})

test('ordinary internal links use router history while downloads, outside links and in-page anchors stay native', () => {
  const current = 'https://ugabuga.co.il/printables?topic=math'
  assert.equal(internalNavigationHref('/tools/word-search-maker', current), '/tools/word-search-maker')
  assert.equal(internalNavigationHref('https://ugabuga.co.il/sudoku/print?level=easy', current), '/sudoku/print?level=easy')
  assert.equal(internalNavigationHref('/printables?topic=letters', current), '/printables?topic=letters')
  for (const href of ['#math', '/printables?topic=math#math', '/files/activity.pdf', '/api/download', '/assets/main.js', 'https://example.com/games', 'mailto:hello@example.com', 'http://[']) {
    assert.equal(internalNavigationHref(href, current), null, href)
  }
})
