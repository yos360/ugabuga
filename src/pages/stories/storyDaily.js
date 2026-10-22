import { useEffect, useState } from 'react'

// Story of the night and the library's daily order. Both depend on the visitor's date (Israel), so
// they are decided in the browser after mount — the prerendered page keeps the plain order.
const DAY = 86400000
export const israelDayNumber = (now = new Date()) => {
  const d = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  return Math.floor(Date.parse(`${d}T00:00:00Z`) / DAY)
}
// Deterministic shuffle (same seed → same order), so everyone sees the same story on the same night.
function seededOrder(list, seed) {
  const a = [...list]
  let s = seed >>> 0
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
// One full pass through the library before any story repeats: the order is fixed per "cycle".
export function storyOfDay(stories, day = israelDayNumber()) {
  const n = stories.length
  const cycle = Math.floor(day / n)
  return seededOrder(stories, 9973 + cycle)[day % n]
}
export const dailyOrder = (stories, day = israelDayNumber()) => seededOrder(stories, day)

export function useToday() {
  const [day, setDay] = useState(null)
  useEffect(() => { setDay(israelDayNumber()) }, [])
  return day
}

// Favourite stories — kept only in this browser.
const FAV_KEY = 'buga-story-favs'
const readFavs = () => { try { const v = JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : [] } catch { return [] } }
export function useFavorites() {
  const [favs, setFavs] = useState([])
  useEffect(() => {
    setFavs(readFavs())
    const sync = e => { if (e.key === FAV_KEY) setFavs(readFavs()) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  const toggle = slug => setFavs(prev => {
    const next = prev.includes(slug) ? prev.filter(x => x !== slug) : [slug, ...prev]
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)) } catch { /* storage blocked */ }
    return next
  })
  return [favs, toggle]
}
