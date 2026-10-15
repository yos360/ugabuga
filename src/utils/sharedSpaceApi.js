import { PHOTO_MAX_BYTES } from './sharedSpaces'
const URL=import.meta.env.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY=import.meta.env.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const memory=new Map()
export const readLocal=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(`uga-space:${key}`))??memory.get(key)??fallback}catch{return memory.get(key)??fallback}}
export const writeLocal=(key,value)=>{memory.set(key,value);try{localStorage.setItem(`uga-space:${key}`,JSON.stringify(value))}catch{/* Link recovery remains available. */}}
export const secureToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('')
export function deviceToken(){let token=readLocal('device','');if(!/^[a-f0-9]{64}$/.test(token)){token=secureToken();writeLocal('device',token)}return token}
export function ownerToken(code){const token=new URLSearchParams(location.hash.slice(1)).get('manage');if(token&&/^[a-f0-9]{64}$/.test(token)){writeLocal(`owner:${code}`,token);history.replaceState(null,'',location.pathname+location.search)}return readLocal(`owner:${code}`,'')}
export async function spaceRequest(action,code='',owner='',payload={}){
  let response
  try{response=await fetch(`${URL}/functions/v1/shared-spaces`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({action,code,owner,device:deviceToken(),payload}),signal:AbortSignal.timeout(30000)})}catch{throw new Error('network')}
  if(action==='photo_read'&&response.ok)return response.blob()
  const data=await response.json().catch(()=>({error:'unavailable'}))
  if(!response.ok||data.error)throw new Error(data.error||'unavailable')
  return data
}
export async function compressedPhoto(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20000000)throw new Error('photo_invalid')
  const image=await createImageBitmap(file).catch(()=>{throw new Error('photo_invalid')})
  try{
    const scale=Math.min(1,1600/Math.max(image.width,image.height)),canvas=document.createElement('canvas')
    canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale))
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height)
    for(const quality of [.85,.72,.58,.42,.28]){
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality))
      if(blob&&blob.size<=PHOTO_MAX_BYTES){return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('photo_invalid'));reader.readAsDataURL(blob)})}
    }
    throw new Error('photo_invalid')
  }finally{image.close()}
}
export function saveFile(content,name,type){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
