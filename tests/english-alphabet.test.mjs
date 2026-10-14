import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync} from 'node:fs'
import {LETTERS,ALPHABET_PAGES} from '../src/en/alphabetData.js'
import {HEBREW} from '../src/data/letterLearning.js'
import {HEB_STROKES} from '../src/data/hebrewStrokes.js'
import {audioKey} from '../src/utils/audioKey.js'
test('English alphabet covers 22 existing letters, five finals and recorded names',()=>{
 const recorded=new Set(JSON.parse(readFileSync('public/audio/he/index.json','utf8')))
 assert.equal(LETTERS.length,22);assert.equal(ALPHABET_PAGES.length,27)
 assert.equal(new Set(LETTERS.map(l=>l.slug)).size,22)
 assert.equal(LETTERS.filter(l=>l.final).map(l=>l.final).join(''),'ךםןףץ')
 assert.deepEqual(LETTERS.map(l=>l.value),[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400])
 LETTERS.forEach((l,i)=>{assert.equal(l.l,HEBREW[i].l);assert.ok(l.words.length>=3);assert.ok(HEB_STROKES[l.l]);assert.ok(recorded.has(audioKey(l.heName)),l.name);assert.ok(existsSync(`public/audio/he/${audioKey(l.heName)}.mp3`));assert.ok(l.meaning.length>90);assert.ok(l.words.every(w=>w.he&&w.meaning))})
})
