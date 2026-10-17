import assert from 'node:assert/strict'
import { formatWikidataTime, parseFactQuestion, parseHolidayQuestion } from '../src/utils/bugapediaSources.js'

const fact = q => { const p = parseFactQuestion(q); return p && `${p.prop}:${p.subject}` }
assert.equal(fact('מה הבירה של צרפת?'), 'P36:צרפת')
assert.equal(fact('בירת יפן'), 'P36:יפן')
assert.equal(fact('כמה תושבים יש בירושלים?'), 'P1082:ירושלים')
assert.equal(fact('מתי נולד אלברט איינשטיין?'), 'P569:אלברט איינשטיין')
assert.equal(fact('מתי נפטרה גולדה מאיר'), 'P570:גולדה מאיר')
assert.equal(fact('מה הגובה של הר האוורסט?'), 'P2044:הר האוורסט')
assert.equal(fact('כמה ארוך נהר הנילוס?'), 'P2043:נהר הנילוס')
assert.equal(fact('מי כתב את הארי פוטר?'), 'P50:הארי פוטר')
assert.equal(fact('מי צייר את המונה ליזה?'), 'P170:המונה ליזה')
assert.equal(fact('מה המטבע של יפן?'), 'P38:יפן')
assert.equal(fact('באיזו יבשת נמצאת מצרים?'), 'P30:מצרים')
assert.equal(fact('מה הנוסחה הכימית של מים?'), 'P274:מים')
assert.equal(fact('מי היה אברהם?'), null)
assert.equal(fact('למה השמיים כחולים?'), null)

assert.ok(parseHolidayQuestion('מתי חנוכה?'))
assert.ok(parseHolidayQuestion('מתי יום העצמאות השנה'))
assert.equal(parseHolidayQuestion('מה זה חנוכה?'), null)

assert.equal(formatWikidataTime('+1879-03-14T00:00:00Z', 11), '14 במרץ 1879')
assert.equal(formatWikidataTime('+1948-05-01T00:00:00Z', 10), 'מאי 1948')
assert.equal(formatWikidataTime('-0563-01-01T00:00:00Z', 9), 'שנת 563 לפני הספירה')
console.log('bugapedia sources ok')
import { nameVariants } from '../src/utils/bugapediaSources.js'
assert.ok(nameVariants('הר האוורסט').includes('אוורסט'))
assert.ok(nameVariants('המונה ליזה').includes('מונה ליזה'))
assert.ok(nameVariants('נהר הנילוס').includes('נילוס'))
assert.deepEqual(nameVariants('צרפת'), ['צרפת'])
console.log('name variants ok')
