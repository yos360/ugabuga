export async function offlineState() {
  if (!('caches' in window)) return null
  try { const r = await (await caches.open('buga-travel-state')).match('/travel-cache-state'); return r ? await r.json() : null } catch { return null }
}
export async function changeOffline(type, extra = {}) {
  if (location.pathname !== '/travel/offline' || location.hash) throw Error('השמירה זמינה רק בעמוד תיק הטיסה.')
  if (!('serviceWorker' in navigator)) throw Error('הדפדפן הזה לא תומך בשמירה. נסו דפדפן מעודכן.')
  // Registration is called only by the explicit save action on /travel/offline.
  const reg = type === 'SAVE' ? await navigator.serviceWorker.register('/sw.js', {scope:'/', updateViaCache:'none'}) : await navigator.serviceWorker.getRegistration('/sw.js')
  if (!reg) return {ok:true}
  await navigator.serviceWorker.ready
  if(type==='SAVE')await reg.update()
  const worker = reg.installing || reg.waiting || reg.active
  if(worker.state!=='activated')await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{worker.removeEventListener('statechange',changed);reject(Error('עדכון תיק הטיסה לא הסתיים. נסו שוב.'))},30000);const changed=()=>{if(worker.state==='activated'){clearTimeout(timeout);worker.removeEventListener('statechange',changed);resolve()}else if(worker.state==='redundant'){clearTimeout(timeout);worker.removeEventListener('statechange',changed);reject(Error('העדכון הוחלף. נסו לשמור שוב.'))}};worker.addEventListener('statechange',changed);changed()})
  return new Promise((resolve,reject) => {
    const channel = new MessageChannel()
    const timeout = setTimeout(()=>{channel.port1.close();reject(Error('השמירה ארכה יותר מדי. נסו שוב.'))},300000)
    channel.port1.onmessage = e => {clearTimeout(timeout);channel.port1.close(); e.data.error ? reject(Error(e.data.error)) : resolve(e.data)}
    worker.postMessage({type,...extra},[channel.port2])
  })
}
