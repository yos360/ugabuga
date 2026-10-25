import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')
test('travel landing is registered across routes, navigation, search and sitemap', () => {
  for (const file of ['src/App.jsx', 'src/data/siteMenu.js', 'src/data/searchStatic.js', 'public/sitemap-static.xml']) assert.ok(read(file).includes('/travel'), file)
  assert.ok(read('src/pages/Home.jsx').includes('to="/travel"'))
  assert.ok(read('src/family/FamilyTools.jsx').includes('to="/travel"'))
})
import vm from 'node:vm'
import { cacheAllowed, OFFLINE_ROUTES } from '../src/travel/offlinePolicy.js'
import { sponsorForPath } from '../src/data/sponsors.js'
test('SW rejects private, API, analytics and external requests in the actual worker',()=>{
 const handlers={};const context={self:{location:{origin:'https://ugabuga.co.il'},addEventListener:(k,v)=>{handlers[k]=v}},URL}
 vm.createContext(context);vm.runInContext(read('public/sw.js'),context)
 for(const path of ['/admin','/admin/a','/r/abc','/t/x','/api/a','https://x.supabase.co/rest/v1/a','/analytics','/travel/offline#k=private','/assets/a.js?analytics=1','https://elsewhere.com/assets/a.js']){
  assert.equal(cacheAllowed(path,'https://ugabuga.co.il'),false,path)
  assert.equal(vm.runInContext(`allowed(${JSON.stringify(path)})`,context),false,path)
 }
 for(const path of [...OFFLINE_ROUTES,'/index.html','/assets/a-hash.js']) assert.equal(vm.runInContext(`allowed(${JSON.stringify(path)})`,context),true,path)
 assert.match(read('public/sw.js'),/NETWORK-FIRST/)
 assert.ok(read('public/sw.js').indexOf('const fresh = await fetch(req)')<read('public/sw.js').indexOf("cache.match(u.pathname)"))
 const client=read('src/travel/offlineClient.js');assert.match(client,/location.pathname !== '\/travel\/offline'/)
 assert.match(read('src/travel/TravelOffline.jsx'),/onClick=\{\(\)=>change\('SAVE'\)\}/)
 assert.ok(!read('src/App.jsx').includes('serviceWorker.register'))
})
test('travel pages have route, sitemap, search and menu entries',()=>{
 const paths=[...read('src/App.jsx').matchAll(/path="(\/travel[^"*:]*)"/g)].map(m=>m[1])
 for(const path of paths)for(const file of ['src/data/siteMenu.js','src/data/searchStatic.js','public/sitemap-static.xml'])assert.ok(read(file).includes(path),`${path} missing from ${file}`)
})
test('flight screens never show sponsors, even when a travel placement is configured',()=>{
 const list=[{active:true,placements:['/travel']}]
 for(const path of ['/travel/play','/travel/offline','/travel/play/','/travel/offline?foo=bar'])assert.equal(sponsorForPath(path,list),null)
 assert.ok(sponsorForPath('/travel',list))
})
import { AGES, DURATIONS, KIT_COUNTS, kitPlan, BINGO, bingoBoards } from '../src/travel/printData.js'
test('all bingo cells and all six board subsets are distinct in each setting',()=>{
 for(const kind of Object.keys(BINGO))for(const size of [3,4]){
  const boards=bingoBoards(kind,size);assert.equal(boards.length,6)
  const signatures=boards.map(board=>{const labels=board.map(x=>x[1]);assert.equal(labels.length,size*size);assert.equal(new Set(labels).size,labels.length);return labels.sort().join('|')})
  assert.equal(new Set(signatures).size,6,kind+size)
 }
})
test('kit includes exactly the promised number of pages for every age and duration',()=>{
 assert.deepEqual(KIT_COUNTS,[5,9,15])
 for(let age=0;age<AGES.length;age++)for(let duration=0;duration<DURATIONS.length;duration++){
  const plan=kitPlan(age,duration);assert.equal(plan.length,KIT_COUNTS[duration]);assert.equal(plan[0],'cover')
  if(age===0)assert.ok(plan.every(k=>!['wordsearch','sudoku','dots'].includes(k)))
 }
 assert.throws(()=>kitPlan(4,0));assert.throws(()=>kitPlan(0,-1))
})
import { STORY_STARTS, TALK_GAMES, FACTS } from '../src/travel/gameData.js'
test('travel conversation cards have 30 original openings and sourced facts',()=>{
 assert.equal(STORY_STARTS.length,30);assert.equal(new Set(STORY_STARTS).size,30)
 assert.equal(TALK_GAMES.length,7)
 for(const fact of FACTS){assert.ok(fact.source.startsWith('https://'));assert.equal(typeof fact.answer,'boolean')}
 assert.ok(!read('src/travel/storyCatalog.js').includes('stories-365'))
 assert.match(read('src/travel/storyCatalog.js'),/BEDTIME_STORIES/)
})
import { WAITING_GAMES, packingItems } from '../src/travel/waitingData.js'
test('waiting games offer 28 unique seated activities and each packing setting has unique keys',()=>{
 assert.equal(WAITING_GAMES.length,28);assert.equal(new Set(WAITING_GAMES.map(g=>g.title)).size,28)
 for(const age of ['baby','toddler','child'])for(const type of ['car','plane','train']){const items=packingItems(age,type);assert.equal(new Set(items.map(x=>x[0])).size,items.length)}
})
import { creatorTool } from '../src/utils/creations.js'
test('travel personalization never opts into visitor creation capture',()=>{
 for(const path of ['/travel/kit','/travel/passport','/travel/journal'])assert.equal(creatorTool(path),null)
 assert.ok(!read('src/travel/TravelPrint.jsx').includes('recordCreation'))
})

test('offline manifest contains only real emitted assets after Vite removes CSS proxy chunks', {skip:!existsSync(new URL('../dist/travel-assets.json',import.meta.url))},()=>{
 const manifest=JSON.parse(read('dist/travel-assets.json'));assert.ok(manifest.assets.length>0)
 for(const asset of manifest.assets){assert.ok(existsSync(new URL('../dist'+asset,import.meta.url)),asset);assert.ok(cacheAllowed(asset,'https://ugabuga.co.il'),asset)}
})
import { TRAVEL_GUIDES } from '../src/travel/guideData.js'
import { TRAVEL_FAQ } from '../src/travel/travelFaq.js'
test('five substantial guides link to real tools and contain sources, FAQs and no doses',()=>{
 assert.equal(Object.keys(TRAVEL_GUIDES).length,5)
 const app=read('src/App.jsx');const paths=new Set([...app.matchAll(/path="([^"]+)"/g)].map(m=>m[1]))
 for(const [slug,g] of Object.entries(TRAVEL_GUIDES)){
  assert.ok(paths.has('/travel/guides/'+slug));assert.ok(g.sections.length>=6);assert.ok(g.faq.length>=2);assert.ok(g.sources.length>0)
  const text=g.sections.map(x=>x[1]).join(' ');assert.ok(text.split(/\s+/).length>=280,slug)
  for(const m of text.matchAll(/\[\[([^|]+)\|/g))assert.ok(paths.has('/travel/'+m[1]),m[1])
  assert.ok(!/\d+\s*(מ״ג|מיליגרם|מ"ל|mg\b)/i.test(text))
 }
 for(const path of ['/travel/bingo','/travel/passport','/travel/journal','/travel/listen','/travel/packing-list','/travel/waiting-games'])assert.ok(TRAVEL_FAQ[path].length>=2)
})
test('waiting filters have an age-appropriate option in every location and sound mode',()=>{
 for(const age of [2,4,6,8])for(const place of ['queue','restaurant','airport'])for(const quiet of [false,true])assert.ok(WAITING_GAMES.some(g=>g.age<=age&&g.places.includes(place)&&g.quiet===quiet),`${age} ${place} ${quiet}`)
})
