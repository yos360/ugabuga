// Helpers for the bedtime stories (ages, themes, personalization, word counts). No story text here, so
// pages can use them without loading the stories; the text is in bedtimeStories.js and stories/batch-*.js.
// Original Hebrew bedtime stories for /stories (hub) and /stories/:slug.
// Every story was written for the site: calm, warm, with a quiet ending that suits bedtime.
//
// Personalization: characters are tokens with a default name.
//   {hero}            → the character's name
//   {hero:הלך|הלכה}   → masculine | feminine form, by that character's gender
//   {both:הם|הן}      → second form only when every gendered character is female
// The default text (what is prerendered and indexed) is the story rendered with the default cast.
// pics: one entry per body paragraph — null, or a single soft emoji shown beside that paragraph (2–3 per story, never adjacent, always on the last).
// Plain data + tiny helpers so tests can import it with node directly.

export const STORY_AGES = [
  { id: '3-5', label: 'גילאי 3–5', short: '3–5' },
  { id: '5-7', label: 'גילאי 5–7', short: '5–7' },
  { id: '7-9', label: 'גילאי 7–9', short: '7–9' },
]

export const STORY_THEMES = [
  { id: 'friendship', label: 'חברות', emoji: '🤝' },
  { id: 'animals', label: 'חיות', emoji: '🐾' },
  { id: 'nature', label: 'טבע', emoji: '🌿' },
  { id: 'family', label: 'משפחה', emoji: '🏡' },
  { id: 'courage', label: 'אומץ ופחדים', emoji: '🦁' },
  { id: 'sharing', label: 'שיתוף ונתינה', emoji: '🎁' },
  { id: 'imagination', label: 'דמיון', emoji: '✨' },
  { id: 'seasons', label: 'חגים ועונות', emoji: '🍂' },
]

export const MAX_NAME = 20
// Names are rendered as plain text; strip token braces and angle brackets anyway, collapse spaces, cap length.
export const cleanName = s => String(s ?? '').replace(/[{}<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME)

const TOKEN = /\{(\w+)(?::([^{}|]*)\|([^{}]*))?\}/g

// custom: { hero: { name, g }, friend: { name, g } } — anything missing falls back to the story defaults.
export function storyCast(story, custom = {}) {
  const cast = {}
  for (const [k, c] of Object.entries(story.chars)) {
    const u = custom?.[k] || {}
    cast[k] = { name: cleanName(u.name) || c.name, g: c.gendered && (u.g === 'm' || u.g === 'f') ? u.g : c.g }
  }
  return cast
}

export function fillText(text, story, custom) {
  const cast = storyCast(story, custom)
  const gendered = Object.keys(story.chars).filter(k => story.chars[k].gendered)
  const allF = gendered.length > 0 && gendered.every(k => cast[k].g === 'f')
  return text.replace(TOKEN, (m, key, a, b) => {
    if (key === 'both') return allF ? b : a
    const c = cast[key]
    if (!c) return m
    if (a === undefined) return c.name
    return c.g === 'f' ? b : a
  })
}

export const renderStory = (story, custom) => ({
  title: fillText(story.title, story, custom),
  summary: fillText(story.summary, story, custom),
  moral: fillText(story.moral, story, custom),
  body: story.body.map(p => fillText(p, story, custom)),
})

// Reading aloud to a child, slowly, with pauses: about 100 Hebrew words a minute.
export const WORDS_PER_MINUTE = 100
export const countWords = text => text.split(/\s+/).filter(w => /[֐-׿A-Za-z0-9]/.test(w)).length
export const storyWords = (s, custom) => countWords(renderStory(s, custom).body.join(' '))
export const readingMinutes = words => Math.max(1, Math.round(words / WORDS_PER_MINUTE))
export const storyMinutes = s => readingMinutes(storyWords(s))
export const ageLabel = id => STORY_AGES.find(a => a.id === id)?.label || ''
export const themeOf = id => STORY_THEMES.find(t => t.id === id)

// Three related stories: same theme first, then same age, then the rest — stable order.
export function relatedStories(story, list, n = 3) {
  const others = list.filter(s => s.slug !== story.slug)
  const score = s => (s.theme === story.theme ? 2 : 0) + (s.age === story.age ? 1 : 0)
  return others.map((s, i) => ({ s, i, k: score(s) })).sort((a, b) => b.k - a.k || a.i - b.i).slice(0, n).map(x => x.s)
}

