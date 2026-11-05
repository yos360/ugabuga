import { useCallback, useEffect, useRef, useState } from 'react'
import { newToken, weddingDb } from '../../utils/groupDb'
import { mergePlans, samePlan } from './weddingPlan'

const STORE = 'buga-wedding-sync'
const SAVE_DELAY_MS = 1200
const CHECK_MS = 15000
const read = () => { try { return JSON.parse(localStorage.getItem(STORE)) } catch { return null } }
const write = v => { try { if (v) localStorage.setItem(STORE, JSON.stringify(v)); else localStorage.removeItem(STORE) } catch { /* private mode: sharing lasts this visit */ } }
export const syncedCode = () => read()?.code

// Keeps the plan in step with the shared copy: saves after each change, checks for the partner's changes
// every few seconds and on returning to the tab. `base` is the last copy both sides saw, kept on the
// device so that edits made offline still merge after a reload. `ready` turns true once the plan was
// read from this browser: syncing the empty first render would wipe the shared plan.
// status: 'off' | 'saving' | 'saved' | 'offline' | 'gone'
export function useWeddingSync(plan, replace, ready) {
  const [status, setStatus] = useState('off')
  const [share, setShare] = useState(null)
  const link = useRef(null), latest = useRef(plan), busy = useRef(false), again = useRef(false)

  const remember = useCallback(next => { link.current = next; write(next); setShare(next ? { code: next.code, token: next.token } : null) }, [])
  const adopt = useCallback((version, data) => {
    const merged = mergePlans(link.current.base, latest.current, data)
    remember({ ...link.current, version, base: data })
    if (!samePlan(merged, latest.current)) { latest.current = merged; replace(merged) }
  }, [remember, replace])

  const run = useCallback(async () => {
    if (!link.current) return
    if (busy.current) { again.current = true; return }
    busy.current = true
    const code = link.current.code
    // A reply that lands after leaving the plan or joining another one is ignored.
    const moved = () => link.current?.code !== code
    try {
      for (let i = 0; i < 4 && !moved(); i++) {
        const s = link.current, mine = latest.current
        if (samePlan(mine, s.base)) {
          const r = await weddingDb.get(s.code, s.token)
          if (moved()) break
          if (r.version !== s.version) adopt(r.version, r.data)
        } else {
          setStatus('saving')
          const r = await weddingDb.save(s.code, s.token, mine, s.version)
          if (moved()) break
          if (r.ok) remember({ ...s, version: r.version, base: mine }); else adopt(r.version, r.data)
        }
        if (samePlan(latest.current, link.current.base)) break
      }
      if (!moved()) setStatus('saved')
    } catch (e) {
      if (moved()) return
      if (e.code === 'not_found') { remember(null); setStatus('gone') } else setStatus('offline')
    } finally {
      busy.current = false
      if (again.current) { again.current = false; run() }
    }
  }, [adopt, remember])

  useEffect(() => {
    latest.current = plan
    if (!link.current || samePlan(plan, link.current.base)) return
    setStatus('saving')
    const t = setTimeout(run, SAVE_DELAY_MS)
    return () => clearTimeout(t)
  }, [plan, run])
  useEffect(() => {
    if (!ready || link.current) return
    const s = read()
    if (!s) return
    remember(s)
    setStatus('saved')
    // The plan's own copy was cleared but the share survived: restore it instead of emptying the partner's.
    if (!Object.keys(latest.current).length) { latest.current = s.base; replace(s.base) }
    run()
  }, [ready, remember, replace, run])
  useEffect(() => {
    const check = () => { if (document.visibilityState === 'visible') run() }
    const t = setInterval(check, CHECK_MS)
    document.addEventListener('visibilitychange', check)
    window.addEventListener('online', check)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', check); window.removeEventListener('online', check) }
  }, [run])

  const start = useCallback(async () => {
    const token = newToken()
    const { code, version } = await weddingDb.create(token, latest.current)
    remember({ code, token, version, base: latest.current })
    setStatus('saved')
  }, [remember])
  const join = useCallback(async ({ code, token }) => {
    const r = await weddingDb.get(code, token)
    remember({ code, token, version: r.version, base: r.data })
    latest.current = r.data; replace(r.data); setStatus('saved')
  }, [remember, replace])
  const leave = useCallback(() => { remember(null); setStatus('off') }, [remember])
  const destroy = useCallback(async () => {
    const s = link.current
    if (s) await weddingDb.remove(s.code, s.token)
    leave()
  }, [leave])

  return { status, share, start, join, leave, destroy }
}
