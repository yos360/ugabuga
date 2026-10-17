import assert from 'node:assert/strict'
import { rankBugaPediaResults } from '../src/utils/bugapediaSearch.js'

const rabbi = { id: 'he-1', title: 'אברהם אלקנה כהנא שפירא', extract: 'רב ופוסק, רבה של ירושלים.', score: 6 }
const patriarch = { id: 'he-2', title: 'אברהם', extract: 'אברהם הוא דמות מקראית, הראשון מבין האבות בספר בראשית.', score: 26, exact: true }
const painter = { id: 'he-3', title: 'אברהם אופק', extract: 'צייר ישראלי.', score: 6 }

// Exact article wins and is not treated as unclear.
let r = rankBugaPediaResults([rabbi, patriarch, painter], 'bible')
assert.equal(r[0].title, 'אברהם')
assert.equal(r.ambiguous, false)

// Without the exact article, the Bible subject still picks the biblical meaning.
r = rankBugaPediaResults([rabbi, { ...patriarch, exact: false, score: 6 }, painter], 'bible')
assert.equal(r[0].title, 'אברהם')
assert.equal(r.ambiguous, false)

// No subject and several equally good people → ask "למה התכוונתם?".
r = rankBugaPediaResults([rabbi, { ...patriarch, exact: false, score: 6 }, painter], null)
assert.equal(r.ambiguous, true)

// A Wikipedia disambiguation page is never shown as the answer, and makes the question unclear.
r = rankBugaPediaResults([{ id: 'he-9', title: 'אברהם (פירושונים)', extract: 'האם התכוונתם…', score: 30, disambiguation: true }, rabbi, painter], null)
assert.ok(r.every(item => !item.disambiguation))
assert.equal(r.ambiguous, true)
console.log('bugapedia ranking ok')
