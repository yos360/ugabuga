import { makeRng } from '../rng'

// "המשיכו את הדפוס" rows. The rule gets longer with the level; blanks at the end of each row
// (and, at the top levels, one in the middle too).
const RULES = [
  ['AB'], ['AB', 'AAB'], ['AB', 'AAB', 'ABB', 'ABC'], ['AAB', 'ABB', 'ABC', 'AABB'],
  ['ABC', 'AABB', 'ABB', 'ABCD'], ['AABB', 'ABCD', 'ABBC', 'AAB'], ['ABCD', 'ABBC', 'AABBC', 'ABCB'],
]
const ROWS = [3, 4, 5, 5, 6, 6, 7]

export function generatePattern({ level, seed, theme }) {
  const rng = makeRng(seed)
  const rules = RULES[level]
  const len = level < 3 ? 8 : 10
  const blanksEnd = level < 2 ? 2 : 3
  const rows = Array.from({ length: ROWS[level] }, (_, i) => {
    const rule = rules[i % rules.length]
    const letters = [...new Set(rule)]
    const items = rng.shuffle(theme.icons).slice(0, letters.length)
    const map = Object.fromEntries(letters.map((l, j) => [l, items[j]]))
    const seq = Array.from({ length: len }, (_, k) => map[rule[k % rule.length]])
    const blank = new Set(Array.from({ length: blanksEnd }, (_, k) => len - 1 - k))
    if (level >= 5) blank.add(rng.int(rule.length, len - blanksEnd - 2)) // one gap in the middle
    return { rule, cells: seq.map((item, k) => ({ item, blank: blank.has(k) })), choices: items }
  })
  return { kind: 'pattern', title: 'המשיכו את הדפוס', instruction: 'מה מגיע אחר כך? ציירו בכל ריבוע ריק את מה שחסר.', rows, len }
}
