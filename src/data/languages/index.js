import { LANGS, TOPICS, WORDS } from './vocab.js'
import { SAY } from './say.generated.js'

export { LANGS }
export const LANG_CODES = Object.keys(LANGS)

// Topics of one language, each word: { key, word, he, say, emoji | text }
export function languageTopics(code) {
  const words = WORDS[code]
  if (!words) return []
  return TOPICS.map(t => ({
    slug: t.slug, title: t.title, emoji: t.emoji,
    words: t.items.filter(([key]) => words[key]).map(([key, he, pic]) => {
      const v = words[key]
      const w = v.w || v
      return {
        key, word: Array.isArray(w) ? w[1] : w, he: v.he || he, say: SAY[code][key],
        ...(/^\d+$/.test(pic) ? { text: pic } : { emoji: pic }),
      }
    }),
  })).filter(t => t.words.length >= 3)
}

export const languageTopic = (code, slug) => languageTopics(code).find(t => t.slug === slug)
