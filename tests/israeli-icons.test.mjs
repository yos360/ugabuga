import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { ISRAELI_ICONS } from '../src/emoji/israeliIconData.js'
import { SITUATIONS } from '../src/emoji/emojiCatalog.js'
test('48 original icons and 48 outline files have individual CC0 metadata',()=>{
 assert.equal(ISRAELI_ICONS.length,48)
 assert.equal(new Set(ISRAELI_ICONS.map(i=>i.slug)).size,48)
 const files=[]
 for(const i of ISRAELI_ICONS){
  assert.match(i.name,/[א-ת]/);assert.equal(i.license,'CC0-1.0');assert.ok(i.creator);assert.ok(i.licenseUrl.startsWith('https://creativecommons.org/'))
  for(const name of [i.src,i.outline]){
   const svg=readFileSync(new URL('../public'+name,import.meta.url),'utf8');files.push(name.split('/').at(-1))
   assert.match(svg,/width="512" height="512" viewBox="0 0 100 100"/);assert.match(svg,/CC0-1.0/);assert.match(svg,/<title/)
   assert.doesNotMatch(svg,/<(?:script|image|text|foreignObject)\b/)
   if(name.includes('-outline')) for(const [,fill]of svg.matchAll(/fill="([^"]+)"/g))assert.ok(['none','#ffffff'].includes(fill))
  }
  for(const slug of i.situations)assert.ok(SITUATIONS.some(s=>s.slug===slug),slug)
 }
 assert.deepEqual(readdirSync(new URL('../public/icons/israeli',import.meta.url)).filter(f=>f.endsWith('.svg')).sort(),files.sort())
})
test('every holiday occasion has relevant original artwork',()=>{
 for(const slug of ['shabbat','rosh-hashanah','sukkot','hanukkah','purim','pesach','shavuot','independence-day','tu-bishvat','lag-baomer']) assert.ok(ISRAELI_ICONS.some(i=>i.situations.includes(slug)),slug)
})
test('icon page is registered before category route and included in the sitemap',()=>{
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
 assert.ok(app.indexOf('path="/emoji/israeli"')<app.indexOf('path="/emoji/:category"'))
 assert.ok(readFileSync(new URL('../public/sitemap-static.xml',import.meta.url),'utf8').includes('<loc>https://ugabuga.co.il/emoji/israeli</loc>'))
})
