// Decode the chosen photo once for a tool (longest side ≤ maxSide), free it when the photo changes.
import { useEffect, useState } from 'react'
import { decodeImage, freeImage } from './imageIO'

export function useWorkImage(item, maxSide = 4096) {
  const [state, setState] = useState({ img: null, id: null, error: false })
  const blob = item?.blob, id = item?.id
  useEffect(() => {
    if (!blob) { setState({ img: null, id: null, error: false }); return }
    let alive = true, got = null
    setState({ img: null, id, error: false })
    decodeImage(blob, maxSide).then(img => {
      if (alive) { got = img; setState({ img, id, error: false }) } else freeImage(img)
    }).catch(() => { if (alive) setState({ img: null, id, error: true }) })
    // freed a moment later: the current render may still draw the old image once
    return () => { alive = false; const old = got; setTimeout(() => freeImage(old), 1000) }
  }, [blob, id, maxSide])
  return state
}
