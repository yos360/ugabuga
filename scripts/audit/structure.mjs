// Run after generating sitemap/routes and vite build: node scripts/audit/structure.mjs
// Read-only structural, middleware and bundle-size audit; output out/audit/structure.json.
import {readFileSync,readdirSync,statSync,mkdirSync,writeFileSync} from 'node:fs'
import {gzipSync} from 'node:zlib'
import {runInNewContext} from 'node:vm'
import {onRequest} from '../../functions/_middleware.js'
const read=p=>readFileSync(p,'utf8'), sitemap=read('public/sitemap.xml')
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]),paths=urls.map(u=>new URL(u).pathname)
const known=JSON.parse(read('public/known-paths.json')),routes=JSON.parse(read('public/routes.json'))
const duplicates=a=>[...new Set(a.filter((v,i)=>a.indexOf(v)!==i))]
const families=runInNewContext(read('functions/_middleware.js').match(/const CLOSED_FAMILIES = (\[[\s\S]*?\n\])/)[1])
// Minimal HTMLRewriter-compatible identity stub: the fallback-marker behavior
// is exercised here, not Cloudflare's HTML rewriting implementation.
globalThis.HTMLRewriter=class {on(){return this}transform(r){return r}}
const html=()=>new Response('<html><head><link rel="canonical" href="https://ugabuga.co.il/"></head><body>shell</body></html>',{headers:{'Content-Type':'text/html'}})
const env={ASSETS:{fetch:async input=>{const p=new URL(typeof input==='string'?input:input.url||input.href).pathname;if(p==='/routes.json')return Response.json(routes);if(p==='/known-paths.json')return Response.json(known);return html()}}}
const cases=[]
for(const re of families){const example=known.find(p=>re.test(p));const path=example?example.replace(/[^/]+$/,'__audit_missing__'):'/en/__audit_missing__';const response=await onRequest({request:new Request('https://ugabuga.co.il'+path),env,next:async()=>html()});cases.push({family:String(re),example,path,status:response.status,noindex:response.headers.get('X-Robots-Tag')})}
for(const path of ['/en/__audit_missing__/deep','/totally-unknown-audit','/assets/not-real.js','/data/not-real.json']){const r=await onRequest({request:new Request('https://ugabuga.co.il'+path),env,next:async()=>html()});cases.push({path,status:r.status,noindex:r.headers.get('X-Robots-Tag')})}
const chunks=readdirSync('dist/assets').filter(f=>f.endsWith('.js')).map(name=>{const buf=readFileSync('dist/assets/'+name);return{name,bytes:buf.length,gzip:gzipSync(buf).length}}).sort((a,b)=>b.bytes-a.bytes)
const entry=read('dist/index.html').match(/type="module"[^>]*src="([^"]+)"/)?.[1]
const robots=read('public/robots.txt'),llms=read('public/llms.txt')
const result={urlCount:urls.length,duplicateUrls:duplicates(urls),duplicateKnown:duplicates(known),missingKnown:paths.filter(p=>!known.includes(p)),withoutAppRoute:paths.filter(p=>!routes.some(re=>new RegExp(re).test(p))),middleware:cases,largestChunks:chunks.slice(0,15),entry,entrySize:chunks.find(c=>entry?.endsWith(c.name)),robots:{hasSitemap:robots.includes('Sitemap: https://ugabuga.co.il/sitemap.xml'),blocksAdmin:robots.includes('Disallow: /admin/'),contentSignalExtension:robots.includes('Content-Signal:')},llms:{hasHeading:llms.startsWith('#'),links:[...llms.matchAll(/\]\((https?:[^)]+)\)/g)].length},prerender:'not run (optional)',generatedSizes:{sitemap:statSync('public/sitemap.xml').size}}
mkdirSync('out/audit',{recursive:true});writeFileSync('out/audit/structure.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2))
