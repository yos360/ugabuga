import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync} from 'node:fs'
import {EN_COLORING, EN_ACTIVITY_PAGES} from '../src/en/activityCatalog.js'
import {COLORING_SUBJECTS,coloringSrc} from '../src/data/coloringSubjects.js'
import {hebrewCounterpart,englishCounterpart} from '../src/en/englishLinks.js'
test('English coloring uses every existing subject and print asset, with English editorial text',()=>{
 assert.equal(EN_COLORING.length,COLORING_SUBJECTS.length)
 for(const s of EN_COLORING){
  assert.ok(s.name&&s.tip,s.slug);assert.doesNotMatch(s.name+s.tip,/[\u0590-\u05ff]/)
  assert.equal(s.count,COLORING_SUBJECTS.find(x=>x.slug===s.slug).items.length)
  for(let n=1;n<=s.count;n++)for(const ext of ['webp',s.fmt])assert.ok(existsSync('public'+coloringSrc(s.slug,n,ext)),`${s.slug}/${n}/${ext}`)
 }
})
test('new language switches preserve actual paired pages in both directions',()=>{
 for(const p of EN_ACTIVITY_PAGES.filter(x=>x.counterpart)){
  assert.equal(englishCounterpart(p.counterpart),p.path)
  assert.equal(hebrewCounterpart(p.path),p.counterpart)
 }
 assert.equal(hebrewCounterpart('/en/coloring-pages/unicorn/'),'/printables/coloring/unicorn')
 assert.equal(hebrewCounterpart('/en/missing'),undefined)
})
