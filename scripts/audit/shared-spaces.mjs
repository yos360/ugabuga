// Browser integration QA with an in-memory API fixture. This does NOT replace
// transactional SQL/concurrency verification against an approved test database.
import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {offlineSiteResponse} from './offline-site.mjs'
import {normalizeSpace} from '../../src/utils/sharedSpaces.js'
const browser=await chromium.launch({headless:true})
const context=await browser.newContext(),records=new Map(),calls=[],errors=[]
let conflict=false
await mkdir('out/shared-spaces',{recursive:true})
await context.route('**/*',async route=>{
 const req=route.request(),url=new URL(req.url())
 if(url.origin==='https://audit.local')return route.fulfill(offlineSiteResponse(req.url()))
 if(!url.pathname.endsWith('/functions/v1/shared-spaces'))return route.abort()
 const d=req.postDataJSON();calls.push(d)
 const reply=(v,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(v)})
 if(d.action==='health')return reply({ready:true})
 if(d.action==='create'){
  const code=crypto.randomUUID();records.set(code,{code,kind:d.payload.kind,config:normalizeSpace(d.payload.kind,d.payload.config),host:d.owner,closed:false,selected:null,entries:[],photos:[],expires_at:'2026-12-31T00:00:00Z'});return reply({code})
 }
 const s=records.get(d.code);if(!s)return reply({error:'not_found'},404)
 if(d.action==='get'){const {host,...view}=s;return reply({...view,owner:host===d.owner,entries:s.entries.map(e=>({id:e.id,name:s.kind==='parents'&&e.device!==d.device&&host!==d.owner?null:e.name,item_id:e.item_id,value:e.value,mine:e.device===d.device}))})}
 const p=d.payload
 if(d.action==='vote')s.entries=[...s.entries.filter(e=>e.device!==d.device),...Object.entries(p.votes).map(([item_id,value])=>({id:crypto.randomUUID(),device:d.device,item_id,value,name:p.name}))]
 if(d.action==='book'){
  if(conflict){conflict=false;return reply({error:'slot_full'},409)}
  s.entries=s.entries.filter(e=>!(e.device===d.device&&(s.kind==='parents'||e.item_id===p.item_id)))
  s.entries.push({id:crypto.randomUUID(),device:d.device,item_id:p.item_id,value:'booked',name:p.name})
 }
 if(d.action==='withdraw')s.entries=s.entries.filter(e=>!(e.device===d.device&&(!p.item_id||p.item_id===e.item_id)))
 if(d.action==='update'){s.closed=p.closed??(p.selected?true:s.closed);s.selected=p.selected??s.selected;if(p.title){s.config.title=p.title;s.config.note=p.note}}
 if(d.action==='upload'){assert.ok(p.base64.length<=800000);s.photos.push({id:crypto.randomUUID(),name:p.name,mine:true,bytes:p.base64.length})}
 return reply({ok:true})
})
const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message))
const checks=[]
for(const width of [1440,390,320]){
 await p.setViewportSize({width,height:1000})
 for(const path of ['/meet','/parent-meetings','/family-help','/party-album']){
  await p.goto(`https://audit.local${path}`);await p.locator('.sg-primary').waitFor();await p.waitForTimeout(100)
  assert.equal(await p.locator('h1').count(),1)
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path} ${width}`)
  await p.screenshot({path:`out/shared-spaces/${path.slice(1)}-${width}.png`,fullPage:width===1440})
 }
 checks.push(`Four landing pages fit ${width}px`)
}
await p.setViewportSize({width:390,height:900})
for(const path of ['/meet','/parent-meetings','/family-help','/party-album']){
 await p.goto(`https://audit.local${path}?demo=1`);await p.locator('.sg-demo').waitFor()
 assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'noindex, nofollow')
 await p.screenshot({path:`out/shared-spaces/demo-${path.slice(1)}.png`,fullPage:true})
}
checks.push('All four demo pages load with noindex')
await p.goto('https://audit.local/meet');await p.getByLabel('איך קוראים לזה?').fill('מפגש בדיקה');await p.getByRole('button',{name:'יצירת סקר מועדים',exact:true}).click();await p.waitForURL('**/t/*');await p.locator('.sg-share').waitFor()
const meetCode=new URL(p.url()).pathname.split('/').pop()
await p.getByLabel('איך קוראים לכם?').fill('אור');for(const field of await p.locator('.sg-vote').all())await field.getByRole('button',{name:'😊 מתאים',exact:true}).click()
await p.getByRole('button',{name:'שמירת התשובות שלי'}).click();await p.getByText('נשמר בהצלחה ✓',{exact:true}).waitFor()
assert.equal(records.get(meetCode).entries.length,2)
await p.getByRole('button',{name:'שמירת קישור הניהול שלי'}).click();const manage=await p.getByLabel('קישור ניהול פרטי').inputValue();assert.ok(manage.includes('#manage='));assert.ok(!(await p.getByLabel('קישור למשתתפים').inputValue()).includes('#'))
await p.locator('.sg-host-select button').first().click();await p.locator('.sg-final').waitFor();assert.equal(records.get(meetCode).closed,true)
checks.push('Meeting creation, votes, final selection and separate management link')
await p.goto('https://audit.local/parent-meetings');await p.getByLabel('איך קוראים לזה?').fill('אספת בדיקה');await p.getByRole('button',{name:'פתיחת הרשמה',exact:true}).click();await p.waitForURL('**/t/*');await p.locator('.sg-booking').first().waitFor();await p.getByLabel('שם פרטי של ההורה או הילד').fill('אור')
await p.getByRole('button',{name:'זו השעה שלי',exact:true}).first().click();await p.getByRole('button',{name:'ביטול שלי'}).waitFor()
const parentCode=new URL(p.url()).pathname.split('/').pop(),first=records.get(parentCode).entries[0].item_id
conflict=true;await p.getByRole('button',{name:'זו השעה שלי',exact:true}).first().click();await p.getByRole('alert').waitFor();assert.ok((await p.getByRole('alert').textContent()).includes('תפס'))
assert.equal(records.get(parentCode).entries[0].item_id,first)
await p.getByRole('button',{name:'זו השעה שלי',exact:true}).first().click();await p.getByText('נשמר בהצלחה ✓',{exact:true}).waitFor();assert.equal(records.get(parentCode).entries.length,1);assert.notEqual(records.get(parentCode).entries[0].item_id,first)
checks.push('Appointment change; conflict message preserves original reservation')
await p.getByRole('button',{name:'ביטול שלי'}).click();await p.getByText('נשמר בהצלחה ✓',{exact:true}).waitFor();assert.equal(records.get(parentCode).entries.length,0)
checks.push('Cancellation frees the appointment')
await p.goto('https://audit.local/family-help');await p.getByLabel('איך קוראים לזה?').fill('עוזרים');await p.getByRole('button',{name:'יצירת לוח עזרה',exact:true}).click();await p.waitForURL('**/t/*');await p.locator('.sg-booking').first().waitFor();await p.getByLabel('איך קוראים לכם?').fill('אור')
await p.getByRole('button',{name:'אני אעזור',exact:true}).first().click();await p.getByRole('button',{name:'ביטול שלי'}).waitFor();await p.getByRole('button',{name:'אני אעזור',exact:true}).first().click();await p.waitForTimeout(100);assert.equal(await p.getByRole('button',{name:'ביטול שלי'}).count(),2)
checks.push('Help board supports several tasks per participant')
await p.goto('https://audit.local/party-album');await p.getByLabel('איך קוראים לזה?').fill('מסיבת בדיקה');await p.getByRole('button',{name:'פתיחת אלבום',exact:true}).click();await p.waitForURL('**/t/*');await p.locator('.sg-upload').waitFor();await p.getByLabel('איך קוראים לכם?').fill('אור')
assert.equal(await p.getByLabel('בחירת תמונות לאלבום').isDisabled(),true)
await p.getByRole('checkbox').check()
const png=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=300;const x=c.getContext('2d');x.fillStyle='#99ddff';x.fillRect(0,0,400,300);return c.toDataURL().split(',')[1]})
await p.getByLabel('בחירת תמונות לאלבום').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await p.locator('.sg-gallery article').waitFor();const upload=calls.findLast(x=>x.action==='upload');assert.ok(upload.payload.base64.startsWith('/9j/'));assert.ok(upload.payload.base64.length<800000)
checks.push('Photo consent, real PNG-to-JPEG compression and upload request')
await p.screenshot({path:'out/shared-spaces/album-uploaded.png',fullPage:true})
await p.goto(manage);await p.locator('.sg-share').waitFor();assert.equal(new URL(p.url()).hash,'')
checks.push('Organizer capability is removed from the address bar after recovery')
await p.route('**/functions/v1/shared-spaces',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'unavailable'})}))
await p.goto('https://audit.local/meet');await p.getByText('הכלי עדיין בהכנה.',{exact:false}).waitFor();assert.equal(await p.getByRole('button',{name:'יצירת סקר מועדים',exact:true}).isDisabled(),true)
await p.getByRole('link',{name:'👀 התנסות בהדגמה'}).click();await p.locator('.sg-demo').waitFor()
checks.push('Missing backend is explicitly shown; real creation blocked, demo remains available')
assert.deepEqual(errors,[])
await writeFile('out/shared-spaces/verified.json',JSON.stringify({checks,consoleErrors:errors,limits:'API fixture only; production SQL and storage not activated.'},null,2))
console.log(JSON.stringify(checks,null,2));await browser.close()
