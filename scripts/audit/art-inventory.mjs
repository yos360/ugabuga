// Read-only asset inventory and visual contact sheets for every coloring subject.
import { COLORING_SUBJECTS, coloringSrc, coloringFmt } from '../../src/data/coloringSubjects.js'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { chromium } from 'playwright'
import { offlineSiteResponse } from './offline-site.mjs'
const dir='out/audit/oct15-art';mkdirSync(dir,{recursive:true})
const rows=COLORING_SUBJECTS.flatMap(s=>s.items.map((name,i)=>({subject:s.slug,n:i+1,name,preview:coloringSrc(s.slug,i+1,'webp'),print:coloringSrc(s.slug,i+1,coloringFmt(s))})))
for(const r of rows)for(const type of ['preview','print']){const file='public'+r[type];r[type+'Exists']=existsSync(file);if(r[type+'Exists']){const b=readFileSync(file);r[type+'Bytes']=b.length;r[type+'Hash']=createHash('sha256').update(b).digest('hex')}}
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1400,height:1620}})
await page.route('**/*',r=>new URL(r.request().url()).origin==='https://audit.local'?r.fulfill(offlineSiteResponse(r.request().url())):r.abort())
await page.goto('about:blank')
for(let i=0;i<rows.length;i+=42){const group=rows.slice(i,i+42);await page.setContent(`<html><head><style>body{margin:0;background:#ddd;font:12px Arial}.grid{display:grid;grid-template-columns:repeat(7,200px)}figure{margin:3px;background:white;text-align:center}img{width:190px;height:226px;object-fit:contain}figcaption{height:31px}</style></head><body><div class="grid">${group.map(r=>`<figure><img src="https://audit.local${r.preview}"><figcaption>${r.subject}/${r.n}<br>${r.name}</figcaption></figure>`).join('')}</div></body></html>`);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));const sizes=await page.evaluate(()=>[...document.images].map(i=>({width:i.naturalWidth,height:i.naturalHeight})));group.forEach((r,j)=>r.size=sizes[j]);await page.screenshot({path:`${dir}/contact-${String(i/42+1).padStart(2,'0')}.jpg`,fullPage:true})}
await browser.close();const duplicates=Object.values(Object.groupBy(rows,r=>r.printHash)).filter(a=>a.length>1).map(a=>a.map(r=>r.subject+'/'+r.n));const summary={subjects:COLORING_SUBJECTS.length,drawings:rows.length,missing:rows.filter(r=>!r.previewExists||!r.printExists),exactDuplicatePrintFiles:duplicates,rows};writeFileSync(dir+'/inventory.json',JSON.stringify(summary,null,2));console.log(JSON.stringify({...summary,rows:undefined}));
