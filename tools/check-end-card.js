// Guard against the generic riddle call-to-action on a reel that is not a riddle.
// Usage: node tools/check-end-card.js examples/<slug>/film.js   (exit 1 = fix the end card first)
// The wedding-planner reel (5.11) shipped "כתבו את התשובה בתגובות" although it had no answer to write,
// because the line was copied from the riddle reel. The comment request must fit the hook question,
// e.g. "כמה באמת מגיעים? כתבו בתגובות" / "איזו חולצה הכי יפה? כתבו מספר בתגובות".
const fs = require('fs')
const file = process.argv[2]
if (!file) { console.error('usage: node tools/check-end-card.js <film.js>'); process.exit(2) }
const src = fs.readFileSync(file, 'utf8')
const GENERIC = /כתבו את התשובה בתגובות/
const riddle = file.includes('daily-riddle') // the riddle reel itself may keep the generic line
const lines = src.split(/\r?\n/)
const hits = lines.map((l, i) => GENERIC.test(l) ? i + 1 : 0).filter(Boolean)
if (hits.length && !riddle) {
  console.error(`✗ ${file}: the generic "כתבו את התשובה בתגובות" appears on line(s) ${hits.join(', ')}.`)
  console.error('  Replace it with a comment request that names the hook question, then re-render.')
  process.exit(1)
}
const asks = /בתגובות/.test(src)
if (!asks) { console.error(`✗ ${file}: no comment request ("בתגובות") on the end card.`); process.exit(1) }
console.log(`✓ ${file}: end-card comment request is not the generic riddle line`)
