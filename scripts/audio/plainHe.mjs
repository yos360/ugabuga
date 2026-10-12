// Hebrew clip list for re-recording WITHOUT niqqud (the owner compared versions: the voice reads
// vocalized text badly, plain text well). Letter names are just the name ("אלף", not "האות אלף") —
// the owner's choice; the recorded clips were trimmed to match. Listen to "בית"/"פה"-like names after
// re-recording: on their own the voice may read them as the words "house"/"mouth".
import { HEBREW } from '../../src/data/letterLearning.js'
import { heItems } from './heItems.mjs'
import { mulItems } from './mulItems.mjs'
import { siteItems } from './siteItems.mjs'
import { audioKey } from '../../src/utils/audioKey.js'

// Plain (unvocalized) number words in full spelling, feminine counting forms.
const U = ['', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע']
const AU = ['', 'ואחת', 'ושתיים', 'ושלוש', 'וארבע', 'וחמש', 'ושש', 'ושבע', 'ושמונה', 'ותשע']
const TEEN = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה']
const T = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים']
const AT = ['', 'ועשר', 'ועשרים', 'ושלושים', 'וארבעים', 'וחמישים', 'ושישים', 'ושבעים', 'ושמונים', 'ותשעים']
export function heNum(n) {
  if (n >= 1000 && n < 1000000) {
    const k = Math.floor(n / 1000), r = n % 1000
    const head = k === 1 ? 'אלף' : k === 2 ? 'אלפיים' : k <= 10 ? `${['', '', '', 'שלושת', 'ארבעת', 'חמשת', 'ששת', 'שבעת', 'שמונת', 'תשעת', 'עשרת'][k]} אלפים` : `${heNum(k)} אלף`
    if (!r) return head
    if (r < 10) return `${head} ${AU[r]}`
    if (r < 100 && r % 10 === 0) return `${head} ${AT[r / 10]}`
    if (r < 20) return `${head} ו${TEEN[r - 10]}`
    return `${head} ${heNum(r)}`
  }
  if (n < 10) return U[n]
  if (n < 20) return TEEN[n - 10]
  if (n < 100) return n % 10 ? `${T[Math.floor(n / 10)]} ${AU[n % 10]}` : T[n / 10]
  const r = n % 100, head = n < 200 ? 'מאה' : n < 300 ? 'מאתיים' : `${['', '', '', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע'][Math.floor(n / 100)]} מאות`
  if (!r) return head
  if (r < 10) return `${head} ${AU[r]}`
  if (r < 20) return r === 10 ? `${head} ועשר` : `${head} ${TEEN[r - 10]}`
  if (r % 10 === 0) return `${head} ${AT[r / 10]}`
  return `${head} ${heNum(r)}`
}
// Spoken text for a key with digits: "3 כפול 4 שווה 12" → "שלוש כפול ארבע שווה שתים עשרה."
const AGOROT = n => (n === 1 ? 'אגורה אחת' : `${heNum(n)} אגורות`)
const sayDigits = key => key
  .replace(/(\d+)\.(\d\d)\s*₪/g, (_, s, a) => `${+s === 1 ? 'שקל' : `${heNum(+s)} שקלים`}${+a ? ` ו${AGOROT(+a)}` : ''}`)
  .replace(/(\d+)\s*₪/g, (_, s) => (+s === 1 ? 'שקל אחד' : `${heNum(+s)} שקלים`))
  .replace(/\b(\d{1,2}):(\d\d)\b/g, (_, h, m) => `${heNum(+h)}${+m ? ` ו${heNum(+m)} דקות` : ''}`)
  .replace(/(\d),(\d{3})\b/g, '$1$2')
  .replace(/(\d+)\.(\d+)/g, (_, a, b) => `${heNum(+a) || 'אפס'} נקודה ${[...b].map(d => heNum(+d) || 'אפס').join(' ')}`)
  .replace(/(\d)\s*[–-]\s*(\d)/g, (m, a, b) => (/\s/.test(m) ? `${a}, ${b}` : `${a} עד ${b}`))
  .replace(/(\d+)\s*%/g, '$1 אחוז')
  .replace(/\s*=\s*/g, ' שווה ')
  .replace(/\s*−\s*/g, ' פחות ')
  .replace(/\d+/g, d => heNum(Number(d)) || 'אפס').replace(/\s*[×x*]\s*/g, ' כפול ').replace(/\s*\+\s*/g, ' ועוד ').replace(/\s+/g, ' ').trim()
const LETTER_PLAIN = { 'אָלֶף': 'אלף', 'בֵּית': 'בית', 'גִּימֶל': 'גימל', 'דָּלֶת': 'דלת', 'הֵא': 'הא', 'וָו': 'וו', 'זַיִן': 'זין', 'חֵית': 'חית', 'טֵית': 'טית', 'יוּד': 'יוד', 'כָּף': 'כף', 'לָמֶד': 'למד', 'מֵם': 'מם', 'נוּן': 'נון', 'סָמֶךְ': 'סמך', 'עַיִן': 'עין', 'פֵּא': 'פא', 'צָדִי': 'צדי', 'קוּף': 'קוף', 'רֵישׁ': 'ריש', 'שִׁין': 'שין', 'תָּו': 'תו' }
const WORD_PLAIN = Object.fromEntries(HEBREW.flatMap(h => h.words.filter(w => w[2]).map(w => [w[2], w[0]])))
const hasNiqqud = t => /[\u0591-\u05C7]/.test(t)
export const STRIPPED = []
export function spoken(key) {
  if (LETTER_PLAIN[key]) return LETTER_PLAIN[key]
  if (WORD_PLAIN[key]) return WORD_PLAIN[key]
  let t = key
  for (const [v, p] of Object.entries(LETTER_PLAIN)) t = t.replaceAll(v, p)
  // "חד־פעמי" (maqaf) would lose its maqaf with the niqqud below and become one word; "ג׳2" needs a space.
  t = t.replace(/\u05BE/g, '-').replace(/([\u05D0-\u05EA][׳'"]?)(\d)/g, '$1 $2')
  if (/\d/.test(t)) t = sayDigits(t)
  if (hasNiqqud(t)) { STRIPPED.push(key); t = plain(t) } // e.g. a shin/sin dot only: stripping keeps the full spelling
  return t
}
export const plain = t => String(t).normalize('NFC').replace(/[֑-ׇ]/g, '')
const NAMES = new Set(HEBREW.map(h => h.name))

export function plainHeItems() {
  const out = new Map()
  const add = (key, text, group) => { const h = audioKey(key); if (!out.has(h)) out.set(h, { lang: 'he', key, text, group, file: `public/audio/he/${h}.mp3` }) }
  for (const i of heItems()) add(i.key, spoken(i.key), NAMES.has(i.key) ? 'names' : 'letters')
  for (const i of mulItems()) add(i.key, spoken(i.key) + '.', 'mul')
  for (const i of siteItems()) if (i.lang === 'he' && !['animals', 'riddles'].includes(i.group)) add(i.key, spoken(i.key), i.group)
  return [...out.values()]
}
