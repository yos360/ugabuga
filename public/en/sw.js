/* Opt-in travel cache. No precache, no analytics, no private routes. */
const PREFIX = 'buga-en-travel-'
const STATE = PREFIX + 'state'
const KEY = '/en/travel-cache-state'
const ROUTES = ['/en/travel/offline', '/en/travel/play', '/en/travel/stories', '/en/travel/countdown']
function allowed(value) {
  const u = new URL(value, self.location.origin)
  if (u.origin !== self.location.origin || u.hash || u.search) return false
  if (/^\/(admin|r|t|api|functions|rest|auth)(\/|$)/i.test(u.pathname) || /supabase|analytics|telemetry|collect/i.test(u.href)) return false
  return ROUTES.includes(u.pathname) || u.pathname === '/index.html' || u.pathname === '/travel-en-assets.json' || /^\/assets\/[\w.-]+$/.test(u.pathname) || /^\/fonts\/[\w.-]+$/.test(u.pathname) || /^\/audio\/travel-en\/[a-z0-9-]+\.mp3$/.test(u.pathname)
}
async function state() { const c = await caches.open(STATE); const r = await c.match(KEY); return r ? r.json() : null }
self.addEventListener('install', e => e.waitUntil(self.skipWaiting()))
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
let saving = false
self.addEventListener('message', e => {
  if (!e.ports[0]) return
  e.waitUntil((async () => {
    const reply = value => e.ports[0].postMessage(value)
    const client = await self.clients.get(e.source?.id)
    const url = client && new URL(client.url)
    if (!url || url.pathname !== '/en/travel/offline' || url.hash) return reply({error:'Open the English flight bag to save or delete.'})
    if (e.data?.type === 'DELETE') {
      if (saving) return reply({error:'Wait for saving to finish.'})
      for (const key of await caches.keys()) if (key.startsWith(PREFIX)) await caches.delete(key)
      return reply({ok:true})
    }
    if (e.data?.type !== 'SAVE' || saving) return reply({error:'Your bag is already saving. Please wait.'})
    saving = true
    const name = PREFIX + Date.now()
    try {
      const manifestResponse = await fetch('/travel-en-assets.json', {cache:'no-store'})
      if (!manifestResponse.ok || !manifestResponse.headers.get('content-type')?.includes('json')) throw Error('The file list could not load. Try again while online.')
      const manifest = await manifestResponse.json()
      const urls = [...new Set(['/index.html', ...ROUTES, ...manifest.assets, ...(e.data.audio || [])])]
      if (urls.some(u => !allowed(u))) throw Error('A file address is not allowed for offline storage.')
      const cache = await caches.open(name)
      let bytes = 0
      for (const u of urls) {
        const r = await fetch(u, {cache:'reload'})
        if (!r.ok || r.redirected || (u.endsWith('.mp3') && !r.headers.get('content-type')?.includes('audio'))) throw Error('A file did not download. Check your connection and try again.')
        if(!ROUTES.includes(u)&&u!=='/index.html'&&r.headers.get('content-type')?.includes('text/html'))throw Error('A file is missing from this version. Refresh and try again.')
        bytes += (await r.clone().arrayBuffer()).byteLength
        await cache.put(u, r)
      }
      const saved = {cache:name,bytes,paths:urls,stories:e.data.stories || [],savedAt:Date.now()}
      await (await caches.open(STATE)).put(KEY,new Response(JSON.stringify(saved),{headers:{'Content-Type':'application/json'}}))
      for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== STATE && key !== name) await caches.delete(key)
      reply({ok:true,...saved})
    } catch (error) { await caches.delete(name); reply({error:error.message || 'Saving did not finish. Free some storage and try again.'}) }
    finally { saving = false }
  })())
})
self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET' || !allowed(req.url)) return
  e.respondWith((async () => {
    const saved = await state()
    if (!saved) return fetch(req)
    const cache = await caches.open(saved.cache)
    const u = new URL(req.url)
    // index.html and every saved navigation are NETWORK-FIRST so new deployments win.
    if (req.mode === 'navigate' || u.pathname === '/index.html') {
      try { const fresh = await fetch(req); if (fresh.ok) return fresh } catch { /* saved shell below */ }
      return (await cache.match(u.pathname)) || (await cache.match('/index.html')) || Response.error()
    }
    return (await cache.match(req, {ignoreVary:true})) || fetch(req)
  })())
})
