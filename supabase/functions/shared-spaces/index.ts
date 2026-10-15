import { createClient } from 'npm:@supabase/supabase-js@2.116.0'
import { normalizeSpace, PHOTO_MAX_BYTES } from '../../../src/utils/sharedSpaces.js'

const URL = Deno.env.get('SUPABASE_URL')!
const secrets = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}')
const secret = secrets.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const publicKeys = Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}'))
const legacy = Deno.env.get('SUPABASE_ANON_KEY')
if (legacy) publicKeys.push(legacy)
const db = createClient(URL, secret!, { auth: { persistSession: false, autoRefreshToken: false } })
const bucket = db.storage.from('party-albums')
const headers = { 'Access-Control-Allow-Origin': 'https://ugabuga.co.il', 'Access-Control-Allow-Headers': 'apikey,content-type', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
const hash = async (text: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('')
const json = (data: unknown, status=200) => new Response(JSON.stringify(data), { status, headers: {...headers, 'Content-Type':'application/json'} })
const allowedErrors = /^(not_found|not_owner|not_yours|slot_full|closed|rate_limited|quota|gallery_busy|bad_input|too_many|photo_invalid)$/
async function body(req: Request) {
  if (Number(req.headers.get('content-length'))>850000) throw new Error('bad_input')
  const reader=req.body?.getReader(); if(!reader) throw new Error('bad_input')
  const chunks: Uint8Array[]=[]; let size=0
  while(true) { const {done,value}=await reader.read(); if(done) break; size+=value.length; if(size>850000){await reader.cancel();throw new Error('bad_input')} chunks.push(value) }
  const all=new Uint8Array(size); let at=0;for(const x of chunks){all.set(x,at);at+=x.length}
  return JSON.parse(new TextDecoder().decode(all))
}
async function cleanup() {
  const {error:limited}=await db.rpc('sg_limit',{p_key:'cleanup',p_max:1,p_amount:1,p_hours:1})
  if(limited)return
  const now=new Date().toISOString(), cutoff=new Date(Date.now()-3600000).toISOString()
  const {data:expired,error}=await db.from('sg_spaces').select('code').lt('expires_at',now).limit(50)
  if(error)throw error
  const codes=(expired||[]).map(s=>s.code)
  const filters=['status.eq.deleting',`and(status.eq.pending,created_at.lt.${cutoff})`,...(codes.length?[`code.in.(${codes.join(',')})`]:[])]
  const {data:photos,error:photoError}=await db.from('sg_photos').select('id,code').or(filters.join(',')).limit(200)
  if(photoError)throw photoError
  if(photos?.length){
    const {error:removeError}=await bucket.remove(photos.map(p=>`${p.code}/${p.id}.jpg`))
    if(removeError)throw removeError
    const {error:metadataError}=await db.from('sg_photos').delete().in('id',photos.map(p=>p.id))
    if(metadataError)throw metadataError
  }
  for(const code of codes){
    const {count,error:countError}=await db.from('sg_photos').select('id',{head:true,count:'exact'}).eq('code',code)
    if(!countError&&count===0)await db.from('sg_spaces').delete().eq('code',code).lt('expires_at',now)
  }
  await db.from('sg_limits').delete().lt('expires_at',new Date(Date.now()-86400000).toISOString())
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers})
  if(req.method!=='POST')return json({error:'bad_input'},405)
  // Publishable key identifies this project; per-space read, device and owner
  // capabilities below authorize each operation. JWT verification is deliberately
  // off because sb_publishable keys are not JWTs. No anonymous table access exists.
  if(!publicKeys.includes(req.headers.get('apikey')||''))return json({error:'unavailable'},401)
  try{
    const data=await body(req)
    if(data.action==='health'){
      const {error}=await db.from('sg_spaces').select('code',{head:true,count:'exact'}).limit(0)
      return json({ready:!error},error?503:200)
    }
    if(data.action==='cleanup'){await cleanup();return json({ok:true})}
    if(!/^[a-f0-9]{64}$/.test(data.device||'') || (data.owner&&!/^[a-f0-9]{64}$/.test(data.owner)))throw new Error('bad_input')
    if(data.action!=='create'&&!/^[a-f0-9-]{36}$/.test(data.code||''))throw new Error('not_found')
    let action=data.action,p=data.payload||{}
    if(!['create','get','update','delete','withdraw','remove_entry','vote','book','upload','photo_read','photo_delete'].includes(action))throw new Error('bad_input')
    if(action==='create')p={kind:p.kind,config:normalizeSpace(p.kind,p.config)}
    let bytes:Uint8Array|undefined
    if(action==='upload'){
      if(typeof p.base64!=='string'||p.base64.length>800000)throw new Error('photo_invalid')
      bytes=Uint8Array.from(atob(p.base64),c=>c.charCodeAt(0))
      if(bytes.length>PHOTO_MAX_BYTES||bytes.length<4||bytes[0]!==255||bytes[1]!==216||bytes[bytes.length-2]!==255||bytes[bytes.length-1]!==217)throw new Error('photo_invalid')
      action='photo_reserve';p={name:String(p.name||'').trim().slice(0,40),bytes:bytes.length}
      if(!p.name)throw new Error('bad_input')
    }
    const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'
    const {data:result,error}=await db.rpc('sg_action',{p_action:action,p_code:data.code||'',p_device:await hash(data.device),p_owner:data.owner?await hash(data.owner):'',p_ip:await hash(new Date().toISOString().slice(0,10)+ip),p})
    if(error)throw new Error(allowedErrors.test(error.message)?error.message:'unavailable')
    if(action==='photo_reserve'){
      const {error:uploadError}=await bucket.upload(result.path,bytes!,{contentType:'image/jpeg',upsert:false})
      if(uploadError){await db.from('sg_photos').update({status:'deleting'}).eq('id',result.id);throw new Error('network')}
      const {error:readyError}=await db.from('sg_photos').update({status:'ready'}).eq('id',result.id).eq('status','pending')
      if(readyError)throw new Error('network')
      return json({ok:true})
    }
    if(action==='photo_read'){
      const {data:file,error:downloadError}=await bucket.download(result.path)
      if(downloadError)throw new Error('network')
      return new Response(file,{headers:{...headers,'Content-Type':'image/jpeg'}})
    }
    if(action==='photo_delete'){
      const {error:removeError}=await bucket.remove([result.path]);if(removeError)throw new Error('network')
      const {error:metadataError}=await db.from('sg_photos').delete().eq('id',result.id);if(metadataError)throw new Error('network')
    }
    return json(result)
  }catch(error){
    const message=error instanceof Error?error.message:''
    return json({error:allowedErrors.test(message)||message==='network'?message:'unavailable'},400)
  }
})
