import { useEffect, useState } from 'react'

// What a printed QR asked this page to open: ?show=answers, ?show=color or ?next=<id>. Read after mount, so the
// server-rendered page and the first client render stay identical.
export function useQrLanding() {
  const [params, setParams] = useState(null)
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    if (['answers', 'color'].includes(q.get('show')) || q.has('next')) setParams(q) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])
  return params
}

// A whole number from the QR's address, or null when it is missing or out of range.
export function qrNumber(params, key, min, max) {
  const raw = params?.get(key)
  if (raw == null || !/^\d{1,12}$/.test(raw)) return null
  const n = Number(raw)
  return n >= min && n <= max ? n : null
}
