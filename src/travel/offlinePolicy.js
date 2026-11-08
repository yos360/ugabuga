import { AUDIO_ORIGIN } from '../utils/audioUrl.js'
const AUDIO_PATH = /^\/audio\/(stories\/[a-z0-9-]+\/\d+\.mp3|he\/[a-f0-9]+\.mp3)$/
export const OFFLINE_ROUTES = ['/travel/offline', '/travel/play', '/travel/stories', '/travel/countdown']
export function cacheAllowed(value, origin) {
  const u = new URL(value, origin)
  if (u.hash || u.search) return false
  if (u.origin === AUDIO_ORIGIN) return AUDIO_PATH.test(u.pathname)
  if (u.origin !== origin) return false
  if (/^\/(admin|r|t|api|functions|rest|auth)(\/|$)/i.test(u.pathname) || /supabase|analytics|telemetry|collect/i.test(u.href)) return false
  return OFFLINE_ROUTES.includes(u.pathname) || u.pathname === '/index.html' || u.pathname === '/travel-assets.json' || /^\/assets\/[\w.-]+$/.test(u.pathname) || /^\/fonts\/[\w.-]+$/.test(u.pathname) || AUDIO_PATH.test(u.pathname)
}
