import { useEffect, useState } from 'react'
import { dailyFor, msToNext } from './daily'

// Recheck on returning to a suspended tab as well as at Israeli midnight.
export function useDailyChallenge() {
  const [daily, setDaily] = useState(() => dailyFor())
  useEffect(() => {
    let timer
    const refresh = () => {
      clearTimeout(timer)
      const next = dailyFor()
      setDaily(current => current.day === next.day ? current : next)
      timer = setTimeout(refresh, msToNext() + 100)
    }
    refresh()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return daily
}
