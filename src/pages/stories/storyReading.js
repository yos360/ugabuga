// Paragraph text → sentences. Story text and highlighting both use this, so indices line up.
export function splitSentences(text) {
  return String(text).split(/(?<=[.!?…:][״"”']?)\s+/).filter(Boolean)
}

export const VOICES = {
  cute: { label: '🐻 קול חמוד', pitch: 1.35, rate: 0.9 },
  calm: { label: '🌙 קול רגוע', pitch: 1, rate: 0.82 },
}

// ── Recorded narration ("Noa") ──────────────────────────
// Files live at /audio/stories/<slug>/<k>.mp3: k=0 is the title (+ '.'), k=1..n the body paragraphs
// (renderStory default cast), k=n+1 the line "לילה טוב." (same for every story). /audio/stories/index.json = { slug: file count } lists
// only fully recorded stories.
export const RECORDED_INDEX_URL = '/audio/stories/index.json'

// Whatever came back (object, JSON text, HTML fallback, garbage) → { slug: positive int }.
export function parseRecordedIndex(raw) {
  let v = raw
  if (typeof v === 'string') { try { v = JSON.parse(v) } catch { return {} } }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
  const out = {}
  for (const [slug, n] of Object.entries(v)) {
    if (/^[a-z0-9-]+$/.test(slug) && Number.isInteger(n) && n > 0) out[slug] = n
  }
  return out
}

// The playlist for a story with `paragraphCount` body paragraphs, or null when the recording
// doesn't match the text (missing story, wrong file count). p: paragraph index, -1 title, -2 goodnight.
export function recordedPlaylist(slug, count, paragraphCount) {
  if (!slug || !Number.isInteger(count) || count !== paragraphCount + 2) return null
  return Array.from({ length: count }, (_, k) => ({
    src: `/audio/stories/${slug}/${k}.mp3`,
    p: k === 0 ? -1 : k === count - 1 ? -2 : k - 1,
  }))
}

// "פסקה 3 מתוך 9" for the item being played.
export function playlistLabel(item, paragraphCount) {
  if (!item) return ''
  if (item.p === -1) return 'שם הסיפור'
  if (item.p === -2) return 'לילה טוב'
  return `פסקה ${item.p + 1} מתוך ${paragraphCount}`
}

let recordedIndex = null
// Fetched once per page load; no fetch during prerender; any failure → {} (nothing recorded).
export function loadRecordedIndex() {
  if (typeof window === 'undefined' || window.__PRERENDER__ || typeof fetch !== 'function') return Promise.resolve({})
  if (!recordedIndex) {
    recordedIndex = fetch(RECORDED_INDEX_URL, { cache: 'no-cache' })
      .then(r => (r.ok ? r.text() : '{}'))
      .then(parseRecordedIndex)
      .catch(() => ({}))
  }
  return recordedIndex
}
