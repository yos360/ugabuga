export function elapsedTime(accumulated, startedAt, now) {
  return accumulated + (startedAt === null ? 0 : Math.max(0, now - startedAt))
}

export function formatStopwatch(ms) {
  const ticks = Math.floor(Math.max(0, Number.isFinite(ms) ? ms : 0) / 10)
  const pad = n => String(n).padStart(2, '0')
  const hours = Math.floor(ticks / 360000)
  return `${hours ? pad(hours) + ':' : ''}${pad(Math.floor(ticks / 6000) % 60)}:${pad(Math.floor(ticks / 100) % 60)}.${pad(ticks % 100)}`
}

export function addLap(laps, total) {
  const previous = laps.at(-1)?.total ?? 0
  if (!Number.isFinite(total) || total <= previous) return laps
  return [...laps, { number: laps.length + 1, duration: total - previous, total }]
}

export function lapExtremes(laps) {
  if (laps.length < 2) return { best: null, worst: null }
  return { best: Math.min(...laps.map(l => l.duration)), worst: Math.max(...laps.map(l => l.duration)) }
}

export function lapsText(laps) {
  return ['הקפה\tזמן הקפה\tזמן כולל', ...laps.map(l => `${l.number}\t${formatStopwatch(l.duration)}\t${formatStopwatch(l.total)}`)].join('\n')
}
