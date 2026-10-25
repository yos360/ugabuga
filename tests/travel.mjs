import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
