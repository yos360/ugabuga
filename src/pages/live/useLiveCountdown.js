import { useEffect, useState } from 'react'
import { liveSecondsRemaining } from '../../utils/liveQuizDb'

export default function useLiveCountdown(end) {
  const [clock, setClock] = useState({ end: null, left: null })
  useEffect(() => {
    if (!end) {
      return undefined
    }
    const tick = () => setClock({ end, left: liveSecondsRemaining(end) })
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 250)
    return () => { clearTimeout(first); clearInterval(id) }
  }, [end])
  return clock.end === end ? clock.left : null
}

