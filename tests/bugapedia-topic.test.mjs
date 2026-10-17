import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bugaPediaTopic, titleVariants } from '../src/utils/bugapediaTopic.js'
import { findBugaPediaSuperlative } from '../src/data/bugapediaSuperlatives.js'

test('topic is the thing the question asks about', () => {
  assert.equal(bugaPediaTopic('מה זה הר געש?').topic, 'הר געש')
  assert.equal(bugaPediaTopic('מהו שם עצם?').topic, 'שם עצם')
  assert.equal(bugaPediaTopic('מי היה בן גוריון?').topic, 'בן גוריון')
  assert.equal(bugaPediaTopic('מיהו אלברט איינשטיין').topic, 'אלברט איינשטיין')
  assert.equal(bugaPediaTopic('תסביר לי מה זה פוטוסינתזה').topic, 'פוטוסינתזה')
  assert.deepEqual(bugaPediaTopic('מה ההבדל בין וירוס לחיידק?').pair, ['וירוס', 'חיידק'])
  assert.equal(bugaPediaTopic('איך עפים מטוסים?'), null)
  assert.equal(bugaPediaTopic('כמה רגליים יש לעכביש?'), null)
  assert.equal(bugaPediaTopic('מה קרה ביציאת מצרים?'), null)
})

test('title variants drop a leading ה and the word חג', () => {
  assert.deepEqual(titleVariants('המוח'), ['המוח', 'מוח'])
  assert.ok(titleVariants('חג החנוכה').includes('חנוכה'))
})

test('superlative questions get a checked answer', () => {
  assert.match(findBugaPediaSuperlative('מהו ההר הגבוה בעולם?').title, /אוורסט/)
  assert.match(findBugaPediaSuperlative('מהי היבשת הקטנה ביותר').title, /אוסטרליה/)
  assert.match(findBugaPediaSuperlative('מהו כוכב הלכת הגדול ביותר?').title, /צדק/)
  assert.match(findBugaPediaSuperlative('מה בעל החיים הכי גדול בעולם?').title, /לווייתן/)
  assert.match(findBugaPediaSuperlative('מה בעל החיים הגדול ביותר ביבשה?').title, /פיל/)
  assert.match(findBugaPediaSuperlative('איזו מדינה הכי קטנה בעולם?').title, /ותיקן/)
  assert.equal(findBugaPediaSuperlative('מה זה הר גבוה?'), null)
  assert.equal(findBugaPediaSuperlative('מי הזמר הכי טוב בעולם?'), null)
})
