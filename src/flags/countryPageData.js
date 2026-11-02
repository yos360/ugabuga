import { COUNTRY_BY_CODE, CONTINENT_BY_SLUG, FLAG_NOTES, countriesOf } from './flagsData.js'
import { COUNTRY_DETAILS } from './countryDetails.js'
import { COLORING_FLAGS } from './coloringFlags.js'
import { colorNames, heList, extraFaq } from './countryInsights.js'

export const findCountry = code => Object.hasOwn(COUNTRY_BY_CODE, code) ? COUNTRY_BY_CODE[code] : null

export const countryTitle = c => `דגל ${c.name} — צבעים, משמעות, בירה וחידון`
export function countryDescription(c) {
  const capital = `${c.code === 'nr' ? 'מושב הממשלה' : 'הבירה'}: ${c.capital}`
  const full = `דגל ${c.name}: ${COUNTRY_DETAILS[c.code].description} ${capital}. חידון ודף להדפסה.`
  if (full.length <= 160) return full
  const colors = colorNames(c.code)
  return `דגל ${c.name}${colors.length ? ` בצבעי ${heList(colors)}` : ''}: צבעים וסמלים, ${capital}, יבשת ${CONTINENT_BY_SLUG[c.continent].name}. חידון ודף להדפסה.`
}
export const coloringFor = code => COLORING_FLAGS.find(f => f.code === code)
export function countryFaq(c) {
  return [...baseFaq(c), ...extraFaq(c)]
}
function baseFaq(c) {
  return [
    { q: `איך נראה דגל ${c.name}?`, a: COUNTRY_DETAILS[c.code].description },
    { q: c.code === 'nr' ? 'האם לנאורו יש בירה רשמית?' : `מהי הבירה של ${c.name}?`, a: c.code === 'nr' ? FLAG_NOTES.nr : `הבירה המוצגת כאן היא ${c.capital}.${['bo', 'za', 'nl', 'lk', 'gq'].includes(c.code) ? ` ${FLAG_NOTES[c.code]}` : ''}` },
    { q: `האם אפשר להדפיס את דגל ${c.name}?`, a: coloringFor(c.code) ? 'כן. בוחרים דף לצביעה עם מקרא צבעים או כרטיס מידע צבעוני, ואז מדפיסים או שומרים כ־PDF.' : 'כן. אפשר להדפיס כרטיס מידע צבעוני או לשמור אותו כ־PDF. לדגל הזה אין כרגע איור קווי לצביעה באתר.' },
  ]
}
export function relatedCountries(c) {
  const neighbors = COUNTRY_DETAILS[c.code].neighbors.map(code => COUNTRY_BY_CODE[code])
  return { neighbors, others: countriesOf(c.continent).filter(p => p.code !== c.code && !neighbors.includes(p)).slice(0, 6) }
}
