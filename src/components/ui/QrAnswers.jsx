import { useEffect, useRef } from 'react'

// What a printed sheet's QR promised, at the top of the page it opens, so nobody has to look for it.
export default function QrAnswers({ title, note, children }) {
  const box = useRef(null)
  // After the route's own jump to the top.
  useEffect(() => { const t = setTimeout(() => box.current?.scrollIntoView({ block: 'start', behavior: 'instant' }), 250); return () => clearTimeout(t) }, [])
  return <section ref={box} className="no-print mb-6 scroll-mt-20 rounded-2xl border-2 border-green-500 bg-green-50 p-4 text-right" aria-label={title} data-qr-answers>
    <h2 className="text-2xl font-black">{title}</h2>
    {note && <p className="mt-1">{note}</p>}
    <div className="mt-3">{children}</div>
  </section>
}
