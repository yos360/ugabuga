const arrange = (answer, wrong, seed) => {
  const options = [answer, ...wrong].map(String)
  const correct = seed % options.length
  ;[options[0], options[correct]] = [options[correct], options[0]]
  return { options, correct }
}

const make = (id, text, answer, wrong, seed) => ({ id, q: text, ...arrange(answer, wrong, seed) })

// These questions are generated from their answers, rather than copied from an
// external trivia list. That makes every answer mechanically verifiable and lets
// the tests validate the entire large bank instead of sampling it.
const easy = Array.from({ length: 260 }, (_, i) => {
  const a = 2 + (i % 50), b = 1 + Math.floor(i / 50), answer = a + b
  return make(`mae${i + 1}`, `כמה הם ${a} + ${b}?`, answer, [answer + 1, answer + 2, answer + 3], i)
})

const medium = Array.from({ length: 260 }, (_, i) => {
  const a = 2 + (i % 26), b = 2 + Math.floor(i / 26), answer = a * b
  return make(`mam${i + 1}`, `כמה הם ${a} × ${b}?`, answer, [answer + a, answer + (2 * a), answer + (3 * a)], i)
})

const hard = Array.from({ length: 260 }, (_, i) => {
  const x = 2 + (i % 40), multiplier = 2 + Math.floor(i / 40), total = (x * multiplier) + 3
  return make(`mah${i + 1}`, `איזה מספר צריך להציב במקום x כדי ש־${multiplier} × x + 3 = ${total}?`, x, [x + 1, x + 2, x + 3], i)
})

export const GENERATED_MATH_QUIZ_BANK = { easy, medium, hard }
