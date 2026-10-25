export async function englishOfflineState() {
  if (!('caches' in window)) return null
  try { const r = await (await caches.open('buga-en-travel-state')).match('/en/travel-cache-state'); return r ? await r.json() : null } catch { return null }
}
export async function changeEnglishOffline(type, extra = {}) {
  if (location.pathname !== '/en/travel/offline' || location.hash) throw Error('Saving is available only in the English flight bag.')
  if (!('serviceWorker' in navigator)) throw Error('This browser does not support offline saving. Try an updated browser.')
  // Registration is called only by the explicit save action on /travel/offline.
  const reg = type === 'SAVE' ? await navigator.serviceWorker.register('/en/sw.js', {scope:'/en/', updateViaCache:'none'}) : await navigator.serviceWorker.getRegistration('/en/sw.js')
  if (!reg) return {ok:true}
  await navigator.serviceWorker.ready
  if(type==='SAVE')await reg.update()
  const worker = reg.installing || reg.waiting || reg.active
  if(worker.state!=='activated')await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{worker.removeEventListener('statechange',changed);reject(Error('The flight bag update did not finish. Try again.'))},30000);const changed=()=>{if(worker.state==='activated'){clearTimeout(timeout);worker.removeEventListener('statechange',changed);resolve()}else if(worker.state==='redundant'){clearTimeout(timeout);worker.removeEventListener('statechange',changed);reject(Error('The update was replaced. Try saving again.'))}};worker.addEventListener('statechange',changed);changed()})
  return new Promise((resolve,reject) => {
    const channel = new MessageChannel()
    const timeout = setTimeout(()=>{channel.port1.close();reject(Error('Saving took too long. Try again.'))},300000)
    channel.port1.onmessage = e => {clearTimeout(timeout);channel.port1.close(); e.data.error ? reject(Error(e.data.error)) : resolve(e.data)}
    worker.postMessage({type,...extra},[channel.port2])
  })
}
