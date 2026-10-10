// Multiplication-table facts read aloud on /learn/multiplication-table*: key = the text passed to
// speak() ("3 כפול 4 שווה 12"), text = the same sentence in vocalized Hebrew words (feminine
// counting forms, as children say them), since TTS reads bare digits inconsistently.
const UNITS = ['', 'אַחַת', 'שְׁתַּיִם', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע']
const AND_UNITS = ['', 'וְאַחַת', 'וּשְׁתַּיִם', 'וְשָׁלוֹשׁ', 'וְאַרְבַּע', 'וְחָמֵשׁ', 'וְשֵׁשׁ', 'וְשֶׁבַע', 'וּשְׁמוֹנֶה', 'וְתֵשַׁע']
const TEENS = ['עֶשֶׂר', 'אַחַת עֶשְׂרֵה', 'שְׁתֵּים עֶשְׂרֵה', 'שְׁלוֹשׁ עֶשְׂרֵה', 'אַרְבַּע עֶשְׂרֵה', 'חֲמֵשׁ עֶשְׂרֵה', 'שֵׁשׁ עֶשְׂרֵה', 'שְׁבַע עֶשְׂרֵה', 'שְׁמוֹנֶה עֶשְׂרֵה', 'תְּשַׁע עֶשְׂרֵה']
const TENS = ['', '', 'עֶשְׂרִים', 'שְׁלוֹשִׁים', 'אַרְבָּעִים', 'חֲמִשִּׁים', 'שִׁשִּׁים', 'שִׁבְעִים', 'שְׁמוֹנִים', 'תִּשְׁעִים']
const AND_TENS = ['', 'וְעֶשֶׂר', 'וְעֶשְׂרִים', 'וּשְׁלוֹשִׁים', 'וְאַרְבָּעִים', 'וַחֲמִשִּׁים', 'וְשִׁשִּׁים', 'וְשִׁבְעִים', 'וּשְׁמוֹנִים', 'וְתִשְׁעִים']

// 1–999 in words. Only the last part of a number takes "ו" (מֵאָה עֶשְׂרִים וְאַחַת, מֵאָה וְעֶשְׂרִים).
export function heNumber(n) {
  if (n < 10) return UNITS[n]
  if (n < 20) return TEENS[n - 10]
  if (n < 100) return n % 10 ? `${TENS[Math.floor(n / 10)]} ${AND_UNITS[n % 10]}` : TENS[n / 10]
  const h = Math.floor(n / 100), rest = n % 100
  const head = h === 1 ? 'מֵאָה' : h === 2 ? 'מָאתַיִם' : `${UNITS[h]} מֵאוֹת`.replace('שָׁלוֹשׁ מֵאוֹת', 'שְׁלוֹשׁ מֵאוֹת').replace('חָמֵשׁ מֵאוֹת', 'חֲמֵשׁ מֵאוֹת').replace('שֶׁבַע מֵאוֹת', 'שְׁבַע מֵאוֹת').replace('תֵּשַׁע מֵאוֹת', 'תְּשַׁע מֵאוֹת')
  if (!rest) return head
  if (rest < 10) return `${head} ${AND_UNITS[rest]}`
  if (rest === 10) return `${head} וְעֶשֶׂר`
  if (rest < 20) return `${head} ${TEENS[rest - 10]}`
  if (rest % 10 === 0) return `${head} ${AND_TENS[rest / 10]}`
  return `${head} ${heNumber(rest)}`
}
export const mulKey = (a, b) => `${a} כפול ${b} שווה ${a * b}`
export const mulText = (a, b) => `${heNumber(a)} כָּפוּל ${heNumber(b)} שָׁוֶה ${heNumber(a * b)}.`

export function mulItems() {
  const out = []
  for (let a = 1; a <= 12; a++) for (let b = 1; b <= 12; b++) out.push({ key: mulKey(a, b), text: mulText(a, b) })
  return out
}
