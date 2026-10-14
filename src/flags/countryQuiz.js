import { CONTINENTS, COUNTRY_BY_CODE, WORLD_COUNTRIES, countriesOf } from './flagsData.js'
import { shuffle } from './flagQuiz.js'

// Seeded initial content makes the prerendered question match the hydrated page.
export function buildCountryRound(code, attempt = 0) {
  const c = Object.hasOwn(COUNTRY_BY_CODE, code) ? COUNTRY_BY_CODE[code] : null
  if (!c) return []
  let seed = [...code].reduce((n, ch) => n * 31 + ch.charCodeAt(0), 17) + attempt
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  const peers = shuffle(countriesOf(c.continent).filter(p => p.code !== code), random)
  const peer = peers[0]
  const options = (answer, wrong) => shuffle([answer, ...shuffle([...new Set(wrong)].filter(v => v !== answer), random).slice(0, 3)], random)
  const capitalLabel = code === 'nr' ? 'באיזה מחוז נמצאים משרדי הממשלה של נאורו?' : code === 'za' ? 'מהי בירת הממשלה של דרום אפריקה?' : `מהי הבירה של ${c.name}?`
  return [
    { prompt: `איזו מדינה מיוצגת בדגל המוצג${code === 'af' ? ' (דגל הרפובליקה לשעבר)' : ''}?`, flag: code, answer: c.name, choices: options(c.name, peers.map(p => p.name)) },
    { prompt: capitalLabel, answer: c.capital, choices: options(c.capital, peers.map(p => p.capital)) },
    { prompt: `באיזו יבשת מסווגת ${c.name} באתר?`, answer: CONTINENTS.find(t => t.slug === c.continent).name, choices: options(CONTINENTS.find(t => t.slug === c.continent).name, CONTINENTS.map(t => t.name)) },
    { prompt: `עוד דגל מאותה יבשת: איזו מדינה זו${peer.code === 'af' ? ' (דגל הרפובליקה לשעבר)' : ''}?`, flag: peer.code, answer: peer.name, choices: options(peer.name, [c, ...peers.slice(1)].map(p => p.name)) },
    { prompt: `איזו מדינה נוספת מסווגת באתר ב${CONTINENTS.find(t => t.slug === c.continent).name}?`, answer: peers[1].name, choices: options(peers[1].name, WORLD_COUNTRIES.filter(p => p.continent !== c.continent).map(p => p.name)) },
  ]
}
