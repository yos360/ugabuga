// How many stories the /stories library has. bedtimeStories.js is large (~45KB gzipped), so pages
// that only mention the number (family hub, search index, school-holiday tips) import this instead.
// tests/bedtime-stories.test.mjs fails if it ever differs from BEDTIME_STORIES.length.
export const BEDTIME_STORY_COUNT = 30
