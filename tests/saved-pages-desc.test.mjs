import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cleanDesc } from '../src/utils/savedPages.js'

test('favorites: the full page title is kept without the site name, the home title is dropped', () => {
  assert.equal(cleanDesc('מבחן מחוננים לדוגמה — סימולציה עם שעון, 3 פרקים | עוגה בוגה'), 'מבחן מחוננים לדוגמה — סימולציה עם שעון, 3 פרקים')
  // a page that is not prerendered falls back to the home page's title, which says nothing about it
  assert.equal(cleanDesc('עוגה בוגה — משחקים, דפי פעילות ולמידה לילדים בחינם | UGABUGA'), '')
  assert.equal(cleanDesc(undefined), '')
})
