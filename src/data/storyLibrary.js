import { STORY_INDEX } from './storyIndex.js'

// The full text of a bedtime story, loaded only when its page opens: the original 30 live in
// bedtimeStories.js, the rest in src/data/stories/batch-*.js (one small chunk per batch).
const batches = import.meta.glob('./stories/batch-*.js')

export { STORY_INDEX }
export const storyMeta = slug => STORY_INDEX.find(s => s.slug === slug)

export async function loadStory(slug) {
  const meta = storyMeta(slug)
  if (!meta) return null
  const list = meta.src === 'core'
    ? (await import('./bedtimeStories.js')).BEDTIME_STORIES
    : (await batches[`./stories/${meta.src}.js`]()).STORIES
  return list.find(s => s.slug === slug) || null
}
