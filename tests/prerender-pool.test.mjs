import test from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { prerenderConcurrency, renderPagePool } from '../scripts/prerender-pool.mjs'

test('concurrency defaults to six and rejects unsafe settings', () => {
  assert.equal(prerenderConcurrency(), 6)
  for (const n of ['1', '8', '32']) assert.equal(prerenderConcurrency(n), Number(n))
  for (const n of ['', '0', '-1', '1.5', 'Infinity', 'abc', '33']) {
    assert.throws(() => prerenderConcurrency(n), /PRERENDER_CONCURRENCY/)
  }
})

test('pool reuses bounded tabs and processes each path exactly once', async () => {
  let opened = 0, closed = 0, active = 0, peak = 0
  const context = { newPage: async () => ({ id: opened++, close: async () => { closed++ } }) }
  const paths = Array.from({ length: 19 }, (_, i) => `/page/${i}`)
  const seen = []
  await renderPagePool(context, paths, 6, async (page, path, index) => {
    peak = Math.max(peak, ++active)
    await delay(index % 3)
    seen.push({ path, index, tab: page.id })
    active--
  })
  assert.equal(opened, 6)
  assert.equal(closed, 6)
  assert.equal(peak, 6)
  assert.deepEqual(seen.sort((a, b) => a.index - b.index).map(row => row.path), paths)
})

test('empty and small queues do not open unnecessary tabs', async () => {
  let opened = 0
  const context = { newPage: async () => { opened++; return { close: async () => {} } } }
  await renderPagePool(context, [], 6, () => assert.fail('empty queue'))
  assert.equal(opened, 0)
  await renderPagePool(context, ['/'], 6, async () => {})
  assert.equal(opened, 1)
})

test('unexpected worker errors drain other workers and close every tab', async () => {
  let closed = 0
  const finished = []
  const context = { newPage: async () => ({ close: async () => { closed++ } }) }
  await assert.rejects(renderPagePool(context, ['/bad', '/slow', '/last'], 2, async (page, path) => {
    if (path === '/bad') throw new Error('navigation failed')
    await delay(10)
    finished.push(path)
  }), AggregateError)
  assert.deepEqual(finished, ['/slow', '/last'])
  assert.equal(closed, 2)
})
