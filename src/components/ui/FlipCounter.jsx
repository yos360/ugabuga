import { useEffect, useState } from 'react'
import './flip-counter.css'

// One split-flap card (like a flip alarm clock): the top page falls down to reveal the new digit.
function FlipDigit({ digit }) {
  const [prev, setPrev] = useState(digit)
  const [cur, setCur] = useState(digit)
  const [flips, setFlips] = useState(0)
  useEffect(() => {
    if (digit === cur) return
    setPrev(cur); setCur(digit); setFlips(n => n + 1)
  }, [digit]) // eslint-disable-line react-hooks/exhaustive-deps
  return <span className="flip-card" aria-hidden="true">
    <span className="flip-half flip-top"><span>{cur}</span></span>
    <span className="flip-half flip-bottom"><span>{flips ? prev : cur}</span></span>
    {flips > 0 && <span key={'t' + flips} className="flip-half flip-top flip-fall"><span>{prev}</span></span>}
    {flips > 0 && <span key={'b' + flips} className="flip-half flip-bottom flip-rise"><span>{cur}</span></span>}
  </span>
}
export default function FlipCounter({ value, size = '' }) {
  const digits = String(value).split('')
  return <span className={`flip-counter ${size}`} dir="ltr" role="img" aria-label={String(value)}>
    {digits.map((d, i) => <FlipDigit key={digits.length + '-' + i} digit={d} />)}
  </span>
}

