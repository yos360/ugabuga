// Run after all audits: node scripts/audit/evidence.mjs
// Writes the compact, public-only evidence appendix. Raw browser/PDF evidence stays in out/audit.
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
const json=p=>existsSync('out/audit/'+p)?JSON.parse(readFileSync('out/audit/'+p,'utf8')):null
const lines=p=>existsSync('out/audit/'+p)?readFileSync('out/audit/'+p,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[]
const pages=[...new Map([...lines('pages.jsonl'),...lines('samples.jsonl')].map(r=>[r.path+'|'+r.viewport,r])).values()]
const phone=pages.filter(r=>r.viewport==='phone'),structure=json('structure.json')
const print=[...new Map(readdirSync('out/audit').filter(f=>/^print.*\.jsonl$/.test(f)).flatMap(lines).map(r=>[r.path,r])).values()]
const notPrint=['/faq','/faq/classroom','/faq/printables','/trivia/inventions','/new']
const realPrint=print.filter(r=>!notPrint.includes(r.path))
const games=[...new Map(['games.json','games-retry.json','game-endings.json','game-endings-extra.json'].flatMap(f=>json(f)||[]).map(r=>[r.slug,r])).values()]
const known=new Set(JSON.parse(readFileSync('public/known-paths.json','utf8')))
const families=structure.middleware.filter(r=>r.family).map(r=>{const i=r.family.lastIndexOf('/');return new RegExp(r.family.slice(1,i),r.family.slice(i+1))})
const closedDead=[]
for(const row of phone)for(const href of row.links||[]){let u;try{u=new URL(href,'https://ugabuga.co.il'+row.path)}catch{continue}if(u.origin!=='https://ugabuga.co.il')continue;const p=u.pathname.replace(/\/$/,'')||'/';if(families.some(re=>re.test(p))&&!known.has(p))closedDead.push({source:row.path,target:p})}
const data={date:'2026-10-14',baseCommit:'d724373',manualFindings:[{path:'/logic-puzzles/print',kind:'vertical-text-in-exported-pdf',status:'not fixed',severity:'medium',evidence:'out/audit/logic-puzzles-fixed.pdf',note:'Visual review: vertical table headings are split/rotated incorrectly in exported PDF. Separate from the corrected sheet overflow; PDF renderer work is deferred.'}],sitemapSha256:createHash('sha256').update(readFileSync('public/sitemap.xml')).digest('hex'),coverage:{pages:phone.length,visits:pages.length,phone:{width:390,height:844},desktop:{width:1280,height:900},accessibility:phone.filter(r=>r.accessibility).map(r=>r.path),textSample:phone.filter(r=>r.textSample).map(r=>r.path)},summary:json('summary.json'),closedFamilyDeadLinks:closedDead,structure,
 performance:phone.filter(r=>r.jsGzip>400*1024).map(r=>({path:r.path,gzipBytes:r.jsGzip,js:r.js})),
 print:{candidates:print.length,falsePositives:notPrint,checked:realPrint.length,preview:realPrint.filter(r=>r.opened).length,native:realPrint.filter(r=>r.nativePrint).length,unopened:realPrint.filter(r=>!r.opened&&!r.nativePrint),copiesChecked:realPrint.filter(r=>typeof r.copies==='object').length,withoutStandardCopies:realPrint.filter(r=>r.copies==='not offered').map(r=>r.path),pages:realPrint.map(r=>({path:r.path,opened:!!r.opened,native:!!r.nativePrint,sheets:r.sheetCount,copies:r.copies,error:r.error})),pdf:json('pdf.json'),pdfQr:json('pdf-qr.json'),nativePdf:json('native-print.json'),logicBaseline:json('logic-print-geometry.json'),logicAfterFix:json('print-regression.json')},
 interactions:{basic:json('interactions.json'),extra:json('extra-interactions.json'),tools:json('tools-flows.json'),misc:json('misc.json'),games},fixVerification:json('fix-verification.json'),inventory:phone.map(r=>({path:r.path,title:r.title,canonical:r.canonical,descriptionLength:r.description?.length,lang:r.lang,dir:r.dir,errors:r.errors,ownFailures:r.ownFailures,notFound:r.notFound,boundary:r.boundary}))}
writeFileSync('docs/audit-data-2026-10-14.json',JSON.stringify(data,null,2))
console.log(JSON.stringify({coverage:data.coverage.pages,print:{checked:data.print.checked,preview:data.print.preview,native:data.print.native,unopened:data.print.unopened,copiesChecked:data.print.copiesChecked,withoutStandardCopies:data.print.withoutStandardCopies.length},performance:data.performance.length,games:games.map(r=>[r.slug,r.status]),closedDead},null,2))
