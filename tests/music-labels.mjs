import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { STRINGS,beatDuration,beatSchedule,tapTempo,detectPitch,tuning } from '../src/music/practiceLogic.js'
import { LABEL_LAYOUTS,labelLayout,labelFontSize } from '../src/utils/nameLabels.js'
import { creatorTool } from '../src/utils/creations.js'
import { onRequest } from '../functions/_middleware.js'
test('look-ahead scheduler uses absolute beat times with accented bar starts',()=>{
 assert.equal(beatDuration(120),0.5);assert.throws(()=>beatDuration(0))
 let next=0.05,index=0,events=[]
 for(let now=0;now<4;now+=0.025){const r=beatSchedule(next,index,now,120,4);next=r.next;index=r.index;events.push(...r.events)}
 assert.equal(new Set(events.map(e=>e.time)).size,events.length)
 for(let i=0;i<events.length;i++){assert.ok(Math.abs(events[i].time-(0.05+i*0.5))<1e-9);assert.equal(events[i].accent,i%4===0)}
 assert.equal(beatSchedule(0,1,10,120,4).events[0].beat,0)
 assert.throws(()=>beatSchedule(0,0,0,100,0))
 let r=tapTempo([],1000);r=tapTempo(r.taps,1500);r=tapTempo(r.taps,2000);assert.equal(r.bpm,120)
 assert.equal(tapTempo(r.taps,5000).bpm,null)
})
test('YIN identifies all six guitar strings and detuned harmonic signals',()=>{
 for(const rate of [44100,48000])for(const s of STRINGS)for(const cents of [-20,0,20]){
  const frequency=440*2**((s.midi-69)/12)*2**(cents/1200)
  const signal=Float32Array.from({length:4096},(_,i)=>0.3*Math.sin(2*Math.PI*frequency*i/rate)+0.1*Math.sin(4*Math.PI*frequency*i/rate))
  const pitch=detectPitch(signal,rate);assert.ok(pitch)
  const result=tuning(pitch);assert.equal(result.string.note,s.note);assert.ok(Math.abs(result.cents-cents)<1,`${s.note}: ${result.cents}`)
 }
 assert.equal(detectPitch(new Float32Array(4096),48000),null)
 assert.equal(detectPitch(Float32Array.from({length:4096},()=>0.1),48000),null)
 assert.equal(detectPitch([],48000),null);assert.throws(()=>tuning(0))
 assert.equal(tuning(440*2**((40-69)/12),0).string.note,'E2')
})
test('label sheets fit A4 at their declared millimetre dimensions',()=>{
 for(const key of Object.keys(LABEL_LAYOUTS)){
  const p=labelLayout(key);assert.equal(p.labels.length,p.columns*p.rows)
  for(const r of p.labels){assert.ok(r.x>=0&&r.y>=0);assert.ok(r.x+r.width<=210&&r.y+r.height<=297)}
  for(let i=1;i<p.columns;i++)assert.ok(p.labels[i].x>=p.labels[i-1].x+p.width)
 }
 assert.equal(labelLayout('standard21').labels.length,21)
 assert.equal(labelLayout('standard14').labels.length,14)
 assert.throws(()=>labelLayout('__proto__'))
 assert.ok(labelFontSize('שם ארוך מאוד מאוד מאוד',60)<labelFontSize('דן',60))
 assert.equal(creatorTool('/printables/name-labels'),null)
})
test('only exact tuner document paths receive microphone permission, including fallback',async()=>{
 for(const path of ['/music/tuner','/music/tuner/','/music/piano','/music/tuner/other','/tools','/']){
  for(const fail of [false,true]){
   const html=()=>new Response('<html></html>',{headers:{'content-type':'text/html','Access-Control-Allow-Origin':'*','Permissions-Policy':'microphone=()'}})
   const response=await onRequest({request:new Request('https://ugabuga.co.il'+path),next:async()=>{if(fail)throw new Error('test');return html()},env:{ASSETS:{fetch:async()=>html()}}})
   assert.equal(response.headers.get('Permissions-Policy').includes('microphone=(self)'),/^\/music\/tuner\/?$/.test(path))
   assert.equal(response.headers.has('Access-Control-Allow-Origin'),false)
  }
 }
 const headers=readFileSync(new URL('../public/_headers',import.meta.url),'utf8')
 assert.match(headers,/\/music\/tuner\n\s+! Permissions-Policy\n\s+Permissions-Policy: camera=\(\), microphone=\(self\)/)
})
