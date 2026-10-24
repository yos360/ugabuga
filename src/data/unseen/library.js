import { UNSEEN_INDEX } from './index.js'
import { UNSEEN_LEVELS } from './levels.js'

// The tests' full text lives in tests-*.js; a page loads only the file it needs.
const files = import.meta.glob('./tests-*.js')
export const LANG_PATH = { en: 'english', he: 'hebrew' }
export const PATH_LANG = { english: 'en', hebrew: 'he' }
export const unseenHref = t => `/unseen/${LANG_PATH[t.lang]}/${t.slug}`
export const levelHref = L => `/unseen/${LANG_PATH[L.lang]}/${L.path}`
export const testsOf = (lang, level) => UNSEEN_INDEX.filter(t => t.lang === lang && (!level || t.level === level))
export const levelsOf = lang => UNSEEN_LEVELS.filter(l => l.lang === lang)
export async function loadUnseen(slug) {
  const meta = UNSEEN_INDEX.find(t => t.slug === slug)
  if (!meta || !files[`./${meta.file}`]) return null
  const { TESTS } = await files[`./${meta.file}`]()
  return TESTS.find(t => t.slug === slug) || null
}
export { UNSEEN_INDEX, UNSEEN_LEVELS }
