import test from 'node:test'
import assert from 'node:assert/strict'
import { maskPersonal, creatorTool } from '../src/utils/creations.js'

test('contact details are masked, the rest stays as written', () => {
  const t = maskPersonal('יום הולדת לנועה בת 6!\nטלפון: 054-1234567\nכתובת: הרצל 12, חולון\nמייל noa.mom@gmail.com\n📍 גן המשחקים ליד הבית')
  assert.ok(t.includes('יום הולדת לנועה בת 6!'))
  assert.ok(!t.includes('1234567') && !t.includes('הרצל') && !t.includes('gmail') && !t.includes('גן המשחקים'), t)
  assert.ok(t.includes('[מספר]') && t.includes('כתובת [כתובת]') && t.includes('[מייל]'))
  assert.equal(maskPersonal('+972 50 765 4321 תתקשרו'), '[מספר] תתקשרו')
  assert.ok(maskPersonal('א'.repeat(5000)).length <= 3000)
})
test('only the personal tools are recorded', () => {
  assert.equal(creatorTool('/invitation'), 'הזמנה ליום הולדת')
  assert.equal(creatorTool('/greeting/?x=1'), 'מחולל ברכות')
  assert.equal(creatorTool('/printables/mazes'), null)
})
test('dates, times and ages are not mistaken for phone numbers', () => {
  assert.equal(maskPersonal('תאריך: 2026-11-15 בשעה 17:00, גיל 6'), 'תאריך: 2026-11-15 בשעה 17:00, גיל 6')
  assert.equal(maskPersonal('0541234567'), '[מספר]')
  assert.equal(maskPersonal('03-123-4567'), '[מספר]')
})
