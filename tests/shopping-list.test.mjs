// /tools/shopping-list: aisle grouping, optimistic changes, splitting pasted items, and a re-runnable migration
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { aisleOf, arrangeItems, applyChange, splitItems, shareText, QUICK_ITEMS } from '../src/data/shoppingList.js'

test('items land in the right aisle', () => {
  assert.equal(aisleOf('חלב 3%').key, 'dairy')
  assert.equal(aisleOf('2 קילו עגבניות').key, 'produce')
  assert.equal(aisleOf('נייר טואלט').key, 'home')
  assert.equal(aisleOf('משהו אחר').key, 'other')
  for (const q of QUICK_ITEMS) assert.notEqual(aisleOf(q).key, 'other', q)
})

test('arrangeItems groups open items in walk order and keeps bought ones apart', () => {
  const items = [{ id: 'a', text: 'לחם' }, { id: 'b', text: 'עגבניות' }, { id: 'c', text: 'חלב', done: true }, { id: 'd', text: 'בלונים' }]
  const { groups, done, openCount } = arrangeItems(items)
  assert.deepEqual(groups.map(g => g.key), ['produce', 'bakery', 'other'])
  assert.deepEqual(done.map(i => i.id), ['c'])
  assert.equal(openCount, 3)
})

test('applyChange mirrors the server ops', () => {
  let l = { title: 'רשימה', items: [] }
  l = applyChange(l, 'add', { id: '1', text: 'חלב' })
  l = applyChange(l, 'add', { id: '2', text: 'לחם' })
  l = applyChange(l, 'done', { id: '1' })
  assert.equal(l.items[0].done, true)
  l = applyChange(l, 'undone', { id: '1' })
  assert.equal(l.items[0].done, false)
  l = applyChange(applyChange(l, 'done', { id: '2' }), 'clear_done')
  assert.deepEqual(l.items.map(i => i.id), ['1'])
  assert.equal(applyChange(l, 'remove', { id: '1' }).items.length, 0)
  assert.equal(applyChange(l, 'rename', { text: 'שבת' }).title, 'שבת')
})

test('splitItems splits on commas and lines, not on ו', () => {
  assert.deepEqual(splitItems('חלב, לחם\nביצים ,, '), ['חלב', 'לחם', 'ביצים'])
  assert.deepEqual(splitItems('מיץ ענבים ותפוזים'), ['מיץ ענבים ותפוזים'])
  assert.equal(splitItems(Array(50).fill('x').join(',')).length, 30)
})

test('share text carries the link', () => {
  assert.match(shareText('קניות', 'https://ugabuga.co.il/tools/shopping-list/abc'), /shopping-list\/abc$/)
})

test('migration is safe to run again', () => {
  const sql = readFileSync(new URL('../supabase/migrations/20261102170000_shopping_lists.sql', import.meta.url), 'utf8')
  assert.match(sql, /create table if not exists public\.shopping_lists/)
  assert.doesNotMatch(sql, /create function/i)
  assert.doesNotMatch(sql, /create index (?!if not exists)/i)
  for (const fn of ['shop_create', 'shop_get', 'shop_change']) assert.match(sql, new RegExp(`grant execute on function public\\.${fn}`))
})
