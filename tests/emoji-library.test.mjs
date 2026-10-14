import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CATEGORIES, SITUATIONS, emojiPaths } from '../src/emoji/emojiCatalog.js'
import { filterEmoji, readRecent, addRecent } from '../src/emoji/emojiLogic.js'
const data=JSON.parse(readFileSync(new URL('../public/data/emoji-he-17.json',import.meta.url)))
const entries=data.entries
const sitemap=readFileSync(new URL('../public/sitemap-static.xml',import.meta.url),'utf8')
test('Unicode 17 inventory is complete, unique and has Hebrew CLDR annotations',()=>{
  assert.equal(entries.length,3953);assert.equal(entries.filter(e=>e.component).length,9)
  assert.equal(new Set(entries.map(e=>e.emoji)).size,3953)
  assert.equal(data.unicodeVersion,'17.0');assert.equal(data.license,'Unicode-3.0')
  for(const e of entries){assert.match(e.name,/[א-ת]/);assert.ok(e.tts);assert.ok(e.keywords.length);assert.ok(CATEGORIES.some(c=>c.slug===e.category))}
  assert.equal(entries.find(e=>e.emoji==='📀').tts,'dvd')
})
test('Hebrew search covers named examples and diacritics',()=>{
  for(const q of ['לב','עוגה','דגל','בוכה']) assert.ok(filterEmoji(entries,q).length,q)
  assert.deepEqual(filterEmoji(entries,'לֵב'),filterEmoji(entries,'לב'))
  assert.ok(filterEmoji(entries,'ישראל','flags').some(e=>e.emoji==='🇮🇱'))
  assert.equal(filterEmoji(entries,'איןמילהכזובמילון').length,0)
})
test('skin tone selection preserves real sequences and exposes mixed tones via all',()=>{
  assert.ok(filterEmoji(entries,'','','🏽').some(e=>e.emoji==='👍🏽'))
  assert.ok(!filterEmoji(entries,'','','🏽').some(e=>e.emoji==='👍'))
  assert.ok(filterEmoji(entries,'','','🏽').some(e=>e.emoji==='🎂'))
  assert.equal(filterEmoji(entries,'','','all').length,3953)
  assert.ok(!filterEmoji(entries).some(e=>e.emoji==='👍🏽'))
  for(const e of filterEmoji(entries,'','','🏽')) if(!e.component) assert.ok((e.emoji.match(/[\u{1F3FB}-\u{1F3FF}]/gu)||[]).every(t=>t==='🏽'))
})
test('recent history tolerates corrupt data, removes unknown values and caps at 16',()=>{
  for(const s of ['{', '{}', 'null', '42']) assert.deepEqual(readRecent(s,entries),[])
  assert.deepEqual(readRecent('["🎂","fake",5,"🎂"]',entries),['🎂'])
  const history=entries.slice(0,30).map(e=>e.emoji)
  assert.equal(readRecent(JSON.stringify(history),entries).length,16)
  assert.equal(addRecent(history,'🎂')[0],'🎂');assert.equal(addRecent(history,'🎂').length,16)
})
test('all 33 pages have unique metadata, sitemap entries and concrete related destinations',()=>{
  assert.equal(emojiPaths.length,33)
  const pages=[...CATEGORIES,...SITUATIONS]
  for(const field of ['title','description']) assert.equal(new Set(pages.map(s=>s[field])).size,pages.length)
  for(const p of pages){assert.ok(p.description.length<=165);assert.ok(p.intro && p.detail && p.faq.length)}
  for(const p of emojiPaths) assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il${p}</loc>`),p)
  for(const s of SITUATIONS){assert.equal(s.combinations.length,3);assert.equal(s.greetings.length,3);for(const p of s.relatedPaths) assert.ok(p==='/greetings'||sitemap.includes(`<loc>https://ugabuga.co.il${p}</loc>`),p)}
})
test('emoji closed families return 404 for invented categories and occasions',async t=>{
  const previous=globalThis.HTMLRewriter
  globalThis.HTMLRewriter=class{on(){return this}transform(r){return r}}
  t.after(()=>{globalThis.HTMLRewriter=previous})
  const {onRequest}=await import('../functions/_middleware.js')
  const paths=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname)
  const env={ASSETS:{fetch:async url=>Response.json(new URL(url).pathname==='/routes.json'?['^/emoji/?$','^/emoji/[^/]+/?$','^/emoji/for/[^/]+/?$']:paths)}}
  for(const [path,status] of [...emojiPaths.map(p=>[p,200]),['/emoji/invalid',404],['/emoji/for/invalid',404]]){
    const response=await onRequest({request:new Request('https://ugabuga.co.il'+path),env,next:async()=>new Response('<link rel="canonical" href="https://ugabuga.co.il/">',{headers:{'Content-Type':'text/html'}})})
    assert.equal(response.status,status,path)
  }
})
