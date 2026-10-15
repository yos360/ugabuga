// Cloudflare handler + fake DB/provider. Never sends email.
import test from 'node:test'
import assert from 'node:assert/strict'
import {onRequest} from '../../functions/api/mail.js'
const env={MAIL_ENABLED:'true',SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'test-secret',RESEND_API_KEY:'test',MAIL_FROM:'test@example.com',MAIL_SIGNING_SECRET:'test-only-signing-key',MAIL_CRON_SECRET:'test-only-cron-key',MAIL_SENDER_DETAILS:'Test sender'}
const make=(data,token)=>new Request('https://ugabuga.co.il/api/mail',{method:'POST',headers:{Origin:'https://ugabuga.co.il','Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(data)})
test('unauthenticated owner endpoints never read list or counts',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('unexpected network')}
 try{for(const action of ['counts','list'])assert.equal((await onRequest({env,request:make({action})})).status,403);assert.equal(calls,0)}finally{globalThis.fetch=original}
})
test('non-owner validated auth cannot read subscriber emails',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async url=>{assert.equal(url,'https://db.example/auth/v1/user');return Response.json({email:'other@example.com',email_confirmed_at:new Date().toISOString()})}
 try{assert.equal((await onRequest({env,request:make({action:'list'},'valid-test-jwt')})).status,403)}finally{globalThis.fetch=original}
})
test('registration stores pending preferences and sends only confirmation',async()=>{
 const original=globalThis.fetch,calls=[]
 globalThis.fetch=async(url,init)=>{const body=JSON.parse(init.body);calls.push({url,body});if(url.includes('/rpc/'))return Response.json(body.p_action==='request'?{send:true}:true);return Response.json({id:'fixture'})}
 try{
  const response=await onRequest({env,request:make({action:'subscribe',preferences:{email:'test@example.com',city:'jerusalem',minutes:120,shabbat:true,weekly:false,marketing:false}})})
  assert.equal(response.status,200)
  const request=calls.find(x=>x.body.p_action==='request').body.p
  assert.equal(request.preferences.marketing,false);assert.match(request.confirm_hash,/^[0-9a-f]{64}$/)
  const email=calls.find(x=>x.url==='https://api.resend.com/emails').body
  assert.ok(email.text.includes('#confirm='));assert.ok(email.html.includes('<a href='));assert.ok(!email.text.includes('הצעות ופרסומות: כן'))
  assert.equal(calls.filter(x=>x.url.includes('resend')).length,1)
 }finally{globalThis.fetch=original}
})
test('cross-origin and unauthenticated scheduled requests fail closed',async()=>{
 const req=make({action:'subscribe'});req.headers.set('Origin','https://evil.example')
 assert.equal((await onRequest({env,request:req})).status,403)
 assert.equal((await onRequest({env,request:make({action:'dispatch'})})).status,403)
})
