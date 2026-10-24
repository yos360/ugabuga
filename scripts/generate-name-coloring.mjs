// Lists every ready name page of the name colouring sheet (/printables/name-coloring/:name) in
// public/sitemap-static.xml, between the "name-coloring" markers. Names come from the site's
// baby-names list (src/data/babyNames.js); any other word still renders client-side, but only
// these listed names are submitted to search engines and prerendered.
//   node scripts/generate-name-coloring.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { nameColoringPaths } from '../src/pages/printables/nameColoringData.js'

const START = '  <!-- name-coloring:start (scripts/generate-name-coloring.mjs) -->'
const END = '  <!-- name-coloring:end -->'
const ANCHOR = '  <!-- search-gaps:start'
const today = new Date().toISOString().slice(0, 10)

const file = new URL('../public/sitemap-static.xml', import.meta.url)
let xml = await readFile(file, 'utf8')
const urls = nameColoringPaths().map(p => `  <url><loc>https://ugabuga.co.il${p}</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>`)
const block = `${START}\n${urls.join('\n')}\n${END}\n`
if (xml.includes(START)) xml = xml.slice(0, xml.indexOf(START)) + block + xml.slice(xml.indexOf(END) + END.length + 1)
else {
  const i = xml.indexOf(ANCHOR)
  if (i < 0) throw new Error('sitemap-static.xml: anchor not found')
  xml = xml.slice(0, i) + block + xml.slice(i)
}
await writeFile(file, xml)
console.log(`name-coloring: ${urls.length} name pages in sitemap-static.xml`)
