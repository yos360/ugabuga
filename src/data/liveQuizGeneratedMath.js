// Distractors sit on both sides of the answer: `seed` decides how many are
// smaller (0–3, fewer when the smaller values would not be positive), so the
// smallest option is not a give-away. Options are shown in ascending order,
// which places the correct answer at a different position from question to question.
const distractors = (answer, steps, seed) => {
  const unique = [...new Set(steps.filter(step => Number.isInteger(step) && step > 0))]
  const turn = Math.floor(seed / 4) % unique.length
  const ordered = [...unique.slice(turn), ...unique.slice(0, turn)]
  const lower = ordered.map(step => answer - step).filter(value => value > 0)
  const upper = ordered.map(step => answer + step)
  const below = Math.min(seed % 4, lower.length)
  return [...lower.slice(0, below), ...upper.slice(0, 3 - below)]
}

const make = (id, text, answer, steps, seed) => {
  const options = [answer, ...distractors(answer, steps, seed)].sort((x, y) => x - y)
  return { id, q: text, options: options.map(String), correct: options.indexOf(answer) }
}

// These questions are generated from their answers, rather than copied from an
// external trivia list. That makes every answer mechanically verifiable and lets
// the tests validate the entire large bank instead of sampling it.
const easy = Array.from({ length: 260 }, (_, i) => {
  const a = 2 + (i % 50), b = 1 + Math.floor(i / 50), answer = a + b
  return make(`mae${i + 1}`, `כמה הם ${a} + ${b}?`, answer, [1, 2, 10, 3], i)
})

const medium = Array.from({ length: 260 }, (_, i) => {
  const a = 2 + (i % 26), b = 2 + Math.floor(i / 26), answer = a * b
  return make(`mam${i + 1}`, `כמה הם ${a} × ${b}?`, answer, [a, b, 10, 1, 2 * a], i)
})

const hard = Array.from({ length: 260 }, (_, i) => {
  const x = 2 + (i % 40), multiplier = 2 + Math.floor(i / 40), total = (x * multiplier) + 3
  return make(`mah${i + 1}`, `איזה מספר צריך להציב במקום x כדי ש־${multiplier} × x + 3 = ${total}?`, x, [1, 2, 5, 10], i)
})

export const GENERATED_MATH_QUIZ_BANK = { easy, medium, hard }
