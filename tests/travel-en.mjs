import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync} from 'node:fs'
import vm from 'node:vm'
import {TRAVEL_PAGES,BINGO,bingoBoards,WAITING_GAMES,packingItems} from '../src/en/travel/catalog.js'
import {STORY_STARTS,TALK_GAMES,FACTS} from '../src/en/travel/gameData.js'
import {ENGLISH_TRAVEL_STORIES} from '../src/en/travel/storyData.js'
import {BEDTIME_STORIES} from '../src/data/bedtimeStories.js'
import {ENGLISH_PAGES,ENGLISH_SECTIONS} from '../src/en/englishRoutes.js'
import {sponsorForPath} from '../src/data/sponsors.js'
import {creatorTool} from '../src/utils/creations.js'
import {wordSearch} from '../src/utils/wordSearchGrid.js'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('all nineteen English travel pages have routes, navigation, reciprocal links and sitemap entries',()=>{
 assert.equal(TRAVEL_PAGES.length,19);const app=read('src/App.jsx'),sitemap=read('public/sitemap-static.xml')
 for(const p of TRAVEL_PAGES){assert.ok(app.includes(`path="${p.path}"`),p.path);assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il${p.path}</loc>`));assert.ok(ENGLISH_PAGES.some(x=>x.path===p.path&&x.counterpart===p.counterpart))}
 assert.ok(ENGLISH_SECTIONS.some(s=>s.path==='/en/travel'));assert.match(read('src/en/EnglishHome.jsx'),/to="\/en\/travel"/)
})
test('English bingo has six distinct board subsets with no repeated cells',()=>{for(const k of Object.keys(BINGO))for(const size of [3,4]){const boards=bingoBoards(k,size);assert.equal(boards.length,6);assert.equal(new Set(boards.map(b=>b.map(x=>x[1]).sort().join('|'))).size,6);for(const b of boards)assert.equal(new Set(b.map(x=>x[1])).size,size*size)}})
test('English word search uses only Latin letters and actually places every word',()=>{const words=['PLANE','ROAD','TRAIN','CLOUD','BAG'];const {grid,placed}=wordSearch(words,9,330,'ABCDEFGHIJKLMNOPQRSTUVWXYZ');assert.match(grid.flat().join(''),/^[A-Z]+$/);for(const p of placed)assert.equal(p.cells.map(([r,c])=>grid[r][c]).join(''),p.word);assert.equal(placed.length,words.length)})
test('English data offers thirty story starts, seven speaking games and twenty-eight waiting games',()=>{assert.equal(STORY_STARTS.length,30);assert.equal(new Set(STORY_STARTS).size,30);assert.equal(TALK_GAMES.length,7);assert.equal(WAITING_GAMES.length,28);for(const f of FACTS)assert.ok(f.source.startsWith('https://'));for(const age of ['baby','toddler','child'])for(const t of ['car','plane','train']){const items=packingItems(age,t);assert.equal(new Set(items.map(x=>x[0])).size,items.length)}})
test('English stories adapt only the thirty stories on main, with real offline audio',()=>{const ids=new Set(BEDTIME_STORIES.map(s=>s.slug));assert.equal(ENGLISH_TRAVEL_STORIES.length,30);for(const s of ENGLISH_TRAVEL_STORIES){assert.ok(ids.has(s.slug));assert.ok(s.body.split(/\s+/).length>=100,s.slug);assert.ok(!/[א-ת]/.test(s.title+s.body));assert.ok(readFileSync(new URL('../public'+s.src,import.meta.url)).length>1000,s.src)}})
test('English worker is isolated and refuses private pages, APIs and analytics',()=>{const context={self:{location:{origin:'https://ugabuga.co.il'},addEventListener:()=>{}},URL};vm.createContext(context);vm.runInContext(read('public/en/sw.js'),context);for(const path of ['/admin','/r/a','/t/a','/en/admin','/en/r/a','/en/t/a','/api/a','https://a.supabase.co/rest/v1/a','/analytics','/en/travel/offline#k=secret','/travel/offline'])assert.equal(vm.runInContext(`allowed(${JSON.stringify(path)})`,context),false,path);for(const path of ['/en/travel/offline','/en/travel/play','/en/travel/stories','/en/travel/countdown','/audio/travel-en/snail-and-sparrow.mp3'])assert.equal(vm.runInContext(`allowed(${JSON.stringify(path)})`,context),true,path);assert.match(read('src/en/travel/offlineClient.js'),/scope:'\/en\/'/);assert.match(read('public/en/sw.js'),/buga-en-travel-/);assert.ok(!'buga-en-travel-'.startsWith('buga-travel-'));assert.match(read('src/en/travel/offlineClient.js'),/location.pathname !== '\/en\/travel\/offline'/)})
test('English personalization stays private and focused screens never show sponsors',()=>{for(const path of ['/en/travel/kit','/en/travel/passport'])assert.equal(creatorTool(path),null);for(const path of ['/en/travel/offline','/en/travel/play'])assert.equal(sponsorForPath(path,[{active:true,placements:['/en/travel']}]),null)})
test('English offline manifest references only actual emitted files',{skip:!existsSync(new URL('../dist/travel-en-assets.json',import.meta.url))},()=>{const m=JSON.parse(read('dist/travel-en-assets.json'));assert.ok(m.assets.length>5);for(const p of m.assets)assert.ok(existsSync(new URL('../dist'+p,import.meta.url)),p)})
