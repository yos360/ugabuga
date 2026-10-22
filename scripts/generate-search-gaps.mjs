// Sitemap + site-search entries for the pages added from Google search demand (card games, names by
// meaning, English dictation, bar/bat mitzvah invitations, new greeting pages, Shavuot greetings,
// quick dinners guide). Writes between "search-gaps" markers. Run after changing that data:
//   node scripts/generate-search-gaps.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { CARD_GAMES } from '../src/data/cardGames.js'
import { NAME_THEMES } from '../src/data/babyNameThemes.js'
import { GREETING_PAGES_MORE } from '../src/data/content/greetingPagesMore.js'
import { QUICK_DINNERS_GUIDE } from '../src/data/guideQuickDinners.js'

const today = new Date().toISOString().slice(0, 10)
const q = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const PAGES = [
  ['/card-games', '0.8', 'משחקי קלפים — החוקים', '🃏', 'page', `חוקים של ${CARD_GAMES.length} משחקי קלפים למשפחה`, 'משחקי קלפים חוקים משחק קלפים לילדים'],
  ...CARD_GAMES.map(g => [`/card-games/${g.slug}`, '0.7', `${g.name} — חוקי המשחק`, g.emoji, 'page', g.goal, `${g.name} חוקים איך משחקים ${g.name} בקלפים משחקי קלפים`]),
  ...NAME_THEMES.map(t => [`/baby-names/meaning/${t.slug}`, '0.7', t.h1, t.emoji, 'page', t.desc, `${t.h1} שמות עם משמעות שמות לתינוקות`]),
  ['/learn/dictation/english', '0.8', 'הכתבה באנגלית', '🇬🇧', 'tool', 'מילים לכיתות ג׳–ו׳ עם הקראה ובדיקה', 'הכתבה באנגלית אתר הכתבה באנגלית dictation איות באנגלית'],
  ['/invitation/bat-mitzvah', '0.8', 'הזמנה לבת מצווה', '✨', 'tool', 'עיצוב הזמנה לבת מצווה עם תמונה, בחינם', 'הזמנה לבת מצווה הזמנות לבת מצווה עיצוב הזמנה בת מצווה'],
  ['/invitation/bar-mitzvah', '0.8', 'הזמנה לבר מצווה', '✨', 'tool', 'עיצוב הזמנה לבר מצווה עם תמונה, בחינם', 'הזמנה לבר מצווה הזמנות לבר מצווה עיצוב הזמנה בר מצווה'],
  ...GREETING_PAGES_MORE.map(p => [`/greetings/${p.slug}`, '0.7', p.title, p.emoji, 'page', p.description, `${p.title} ברכה ליום הולדת ברכות`]),
  ['/holidays/shavuot/greetings', '0.7', 'ברכות לשבועות', '💌', 'idea', 'ברכות לחג שבועות שמח', 'ברכות לשבועות ברכה לשבועות חג שבועות שמח'],
  [`/guides/${QUICK_DINNERS_GUIDE.slug}`, '0.7', QUICK_DINNERS_GUIDE.title, '🍳', 'page', 'ארוחות ערב מהירות לילדים', 'ארוחת ערב ב10 דקות מתכונים ב10 דקות ארוחה מהירה לילדים ארוחת צהריים בעשר דקות'],
]
const urls = PAGES.map(([to, prio]) => `  <url><loc>https://ugabuga.co.il${to}</loc><lastmod>${today}</lastmod><priority>${prio}</priority></url>`)
const rows = PAGES.map(([to, , title, emoji, kind, desc, keys]) => `  { to: '${to}', title: '${q(title)}', emoji: '${emoji}', kind: '${kind}', desc: '${q(desc)}', keys: '${q(keys)}' },`)
async function patch(file, start, end, text, anchor) {
  const url = new URL(`../${file}`, import.meta.url)
  let s = await readFile(url, 'utf8')
  const block = `${start}\n${text}\n${end}\n`
  if (s.includes(start)) s = s.slice(0, s.indexOf(start)) + block + s.slice(s.indexOf(end) + end.length + 1)
  else { const i = s.indexOf(anchor); if (i < 0) throw new Error(`${file}: anchor not found`); s = s.slice(0, i) + block + s.slice(i) }
  await writeFile(url, s)
}
await patch('public/sitemap-static.xml', '  <!-- search-gaps:start (scripts/generate-search-gaps.mjs) -->', '  <!-- search-gaps:end -->', urls.join('\n'), '  <!-- learn-subjects:start')
await patch('src/data/searchStatic.js', '  // search-gaps:start (scripts/generate-search-gaps.mjs)', '  // search-gaps:end', rows.join('\n'), '  // learn-subjects:start')
console.log(`search-gaps: ${urls.length} URLs`)
