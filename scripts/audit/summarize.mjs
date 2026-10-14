// Run after crawl/print/interactions: node scripts/audit/summarize.mjs
// Produces a machine-readable findings index; review heuristic findings before fixing.
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs'
const readLines=p=>existsSync(p)?readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[]
const rows=[...new Map([...readLines('out/audit/pages.jsonl'),...readLines('out/audit/samples.jsonl')].map(r=>[r.path+'|'+r.viewport,r])).values()]
const phone=rows.filter(r=>r.viewport==='phone'),known=new Set(JSON.parse(readFileSync('public/known-paths.json','utf8'))),routes=JSON.parse(readFileSync('public/routes.json','utf8')).map(s=>new RegExp(s))
const problems=[],add=(r,kind,detail)=>problems.push({path:r.path,viewport:r.viewport,kind,detail})
for(const r of rows){
 r.overflow=r.overflow?.filter(e=>!String(e.class).split(' ').includes('sr-only'));for(const k of ['auditError','errors','ownFailures','jsonLd','overflow','pendingImages'])if(r[k]?.length)add(r,k,r[k])
 if(r.h1?.length!==1)add(r,'h1',r.h1)
 if(!r.title)add(r,'missingTitle',true)
 if(!r.description||r.description.length>165)add(r,'description',r.description)
 if(r.canonical!=='https://ugabuga.co.il'+r.path)add(r,'canonical',r.canonical)
 if(r.notFound||r.boundary)add(r,'notFoundOrBoundary',true)
 if(r.scroll>r.innerWidth)add(r,'horizontalScroll',r.scroll)
 const en=r.path==='/en'||r.path.startsWith('/en/');if(r.lang!==(en?'en':'he')||r.dir!==(en?'ltr':'rtl'))add(r,'language',[r.lang,r.dir])
 for(const img of r.brokenImages||[])add(r,img.src.startsWith('http://127.0.0.1:')?'brokenOwnImage':'blockedExternalImage',img)
 if(r.jsGzip>400*1024)add(r,'largeFirstLoadJS',r.jsGzip)
 if(r.accessibility)for(const[k,v]of Object.entries(r.accessibility))if(v.length)add(r,'accessibility:'+k,v)
 if(r.textSample){const matches=r.textSample.text.match(/\bTODO\b|\blorem\b|\bundefined\b|\bNaN\b|\[object Object\]/gi);if(matches)add(r,'placeholderText',matches)}
}
const duplicates={}
for(const key of ['title','description']){const groups=new Map();for(const r of phone){if(!groups.has(r[key]))groups.set(r[key],[]);groups.get(r[key]).push(r.path)}duplicates[key]=[...groups].filter(([v,p])=>v&&p.length>1).map(([value,paths])=>({value,paths}))}
const deadLinks=[]
for(const r of phone)for(const href of r.links||[]){let u;try{u=new URL(href,'https://ugabuga.co.il'+r.path)}catch{continue}if(u.origin!=='https://ugabuga.co.il')continue;const p=decodeURI(u.pathname).replace(/\/$/,'')||'/';if(!known.has(p)&&!routes.some(re=>re.test(p))&&!existsSync('public'+p)&&!existsSync('dist'+p))deadLinks.push({source:r.path,href,target:p})}
const prints=[...new Map(readdirSync('out/audit').filter(f=>/^print.*\.jsonl$/.test(f)).flatMap(f=>readLines('out/audit/'+f)).map(r=>[r.path,r])).values()]
const summary={visits:rows.length,pages:phone.length,accessibilitySample:phone.filter(r=>r.accessibility).length,textSample:phone.filter(r=>r.textSample).length,problems,duplicates,deadLinks,external:[...new Set(rows.flatMap(r=>r.external||[]))],print:{checked:prints.length,unopened:prints.filter(r=>!r.opened&&!r.nativePrint),geometry:prints.filter(r=>r.geometry?.some(g=>g.outside.length||g.overflowX||g.overflowY)),copies:prints.filter(r=>typeof r.copies==='object'&&r.copies.after!==2*r.copies.before)}}
writeFileSync('out/audit/summary.json',JSON.stringify(summary,null,2))
console.log(JSON.stringify({...summary,problems:problems.reduce((a,r)=>(a[r.kind]=(a[r.kind]||0)+1,a),{}),duplicates:Object.fromEntries(Object.entries(duplicates).map(([k,v])=>[k,v.length])),deadLinks:deadLinks.length},null,2))
