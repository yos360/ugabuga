// Answer words of the English five-letter word game (/en/online-games/word-guess), grouped by topic.
// The topic doubles as the first hint. Pure data plus small helpers; every word is exactly 5 letters.
export const EN_WORD_TOPICS = {
  Animals: 'horse zebra tiger camel sheep mouse whale shark eagle otter panda koala snake goose moose llama bison hippo rhino skunk sloth squid crane robin raven trout bunny puppy kitty lemur hyena gecko',
  Food: 'apple grape lemon mango melon peach pizza bread toast pasta salad cream candy honey juice olive onion bacon donut cocoa fries gravy jelly pecan pears berry crepe wafer bagel sushi',
  Home: 'chair table couch sofas shelf clock towel spoon knife plate glass brush house porch attic floor stair lamps radio piano broom quilt sheet bench',
  Nature: 'river ocean beach cloud storm rainy sunny grass plant trees stone rocky sandy coral field woods earth frost north south light shade',
  School: 'class pupil chalk paper ruler books study learn write spell grade lunch teach notes music sport',
  Body: 'heart brain teeth tooth mouth thumb elbow ankle wrist chest knees nails cheek spine bones blood smile',
  Colors: 'green black white brown amber ivory peach olive coral beige',
  Space: 'orbit comet stars earth venus pluto solar lunar alien space',
  Feelings: 'happy proud brave silly angry tired upset jolly eager',
  Play: 'games dance swing slide match score teams relay chess cards dolls robot paint',
}

const clean = s => s.split(' ').filter(w => /^[a-z]{5}$/.test(w))
export const EN_TOPICS = Object.keys(EN_WORD_TOPICS)
const TOPIC_OF = {}
for (const t of EN_TOPICS) for (const w of clean(EN_WORD_TOPICS[t])) if (!TOPIC_OF[w]) TOPIC_OF[w] = t
export const EN_WORDS = Object.keys(TOPIC_OF)
export const enTopicOf = w => TOPIC_OF[w] || ''
export const enWordsIn = topic => (topic && EN_WORD_TOPICS[topic] ? clean(EN_WORD_TOPICS[topic]).filter(w => TOPIC_OF[w] === topic) : EN_WORDS)

// Classic colouring: exact hits first, then each remaining answer letter marks one "near".
export function scoreEn(guess, answer) {
  const g = [...guess], a = [...answer], res = Array(5).fill('miss'), left = {}
  for (let i = 0; i < 5; i++) { if (g[i] === a[i]) res[i] = 'hit'; else left[a[i]] = (left[a[i]] || 0) + 1 }
  for (let i = 0; i < 5; i++) if (res[i] !== 'hit' && left[g[i]] > 0) { res[i] = 'near'; left[g[i]]-- }
  return res
}

function shuffled(list, seed) {
  const a = [...list]
  let s = seed >>> 0
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
const DAILY = shuffled(EN_WORDS, 20261108)
export const enDailyWord = day => DAILY[((day % DAILY.length) + DAILY.length) % DAILY.length]
