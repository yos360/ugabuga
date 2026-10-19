import { COUNTS, puzzle, move, won, dailyIQ, examIndices } from './catalog.js'
export const AGES = ['6-8', '9-11', '12+', 'adult']
export const MODES = ['practice', 'daily', 'exam', 'timed', 'streak']
export function newSession(kind, { index = 0, age = '9-11', mode = 'practice', seed = 1, now = Date.now() } = {}) {
  if (!AGES.includes(age)) age = '9-11'
  if (kind !== 'iq' || !MODES.includes(mode)) mode = 'practice'
  const daily = dailyIQ(now), sequence = mode === 'exam' || mode === 'timed' || mode === 'streak' ? examIndices(seed, age) : []
  if (mode === 'daily') index = daily.index
  if (sequence.length) index = sequence[0]
  return { version: 1, kind, index, age, mode, seed, sequence, cursor: 0, day: daily.day, deadline: mode === 'timed' ? now + 300000 : null, actions: [], moves: 0, hints: 0, mistakes: 0, score: 0, completed: 0, ended: false }
}
export function replay(session) {
  const p = puzzle(session.kind, session.index); let state = p.initial
  for (const action of session.actions) {
    const next = move(p, state, action)
    if (next === null) return null
    state = next
  }
  return state
}
export function restoreSession(kind, raw, now = Date.now()) {
  const fallback = () => newSession(kind, { now })
  if (!raw || raw.version !== 1 || raw.kind !== kind || !AGES.includes(raw.age) || !MODES.includes(raw.mode)) return fallback()
  if (!Number.isInteger(raw.index) || raw.index < 0 || raw.index >= COUNTS[kind]) return fallback()
  if (!Array.isArray(raw.actions) || raw.actions.length > 1000 || raw.actions.some(a => !a || typeof a !== 'object')) return fallback()
  if (!Array.isArray(raw.sequence) || raw.sequence.some(i => !Number.isInteger(i) || i < 0 || i >= 500)) return fallback()
  if (['moves', 'hints', 'mistakes', 'score', 'completed', 'cursor', 'seed'].some(k => !Number.isFinite(raw[k]) || raw[k] < 0)) return fallback()
  if (raw.mode === 'daily' && raw.day !== dailyIQ(now).day) return newSession(kind, { mode: 'daily', age: raw.age, now })
  if (raw.mode === 'timed' && !Number.isFinite(raw.deadline)) return fallback()
  try {
    if (raw.actions.length && replay(raw) === null) return fallback()
    return raw
  } catch { return fallback() }
}
export function starsForSession(session, p) {
  return session.hints === 0 && session.mistakes === 0 && session.moves <= p.solution.length ? 3 : session.hints <= 1 && session.mistakes <= 1 && session.moves <= p.solution.length * 2 ? 2 : 1
}
export function attempt(session, action, now = Date.now()) {
  const p = puzzle(session.kind, session.index), state = replay(session)
  if (session.ended || won(p, state) || (session.deadline && now >= session.deadline)) return session
  const next = move(p, state, action)
  const bad = next === null || (Object.hasOwn(action, 'answer') && !won(p, next))
  if (bad) return { ...session, mistakes: session.mistakes + 1, ended: session.mode === 'streak' }
  const result = { ...session, actions: [...session.actions, action], moves: session.moves + 1 }
  if (won(p, next)) { result.score += starsForSession(result, p) * 100; result.completed++ }
  else if (p.oneMove || (p.kind === 'matches' && next.used >= p.budget)) { result.mistakes++; result.ended = session.mode === 'streak' }
  return result
}
export function nextSession(session, now = Date.now()) {
  if (!won(puzzle(session.kind, session.index), replay(session))) return session
  if (session.mode === 'daily') return { ...session, ended: true }
  const cursor = session.cursor + 1
  if (session.mode === 'exam' && cursor >= 10) return { ...session, ended: true }
  let index = session.index + 1, sequence = session.sequence
  if (session.mode === 'timed' || session.mode === 'streak') {
    if (cursor % 10 === 0) sequence = examIndices(session.seed + cursor, session.age)
    index = sequence[cursor % 10]
  } else if (session.mode === 'exam') index = sequence[cursor]
  if (index >= COUNTS[session.kind] || (session.deadline && now >= session.deadline)) return { ...session, ended: true }
  return { ...session, index, sequence, cursor, actions: [], moves: 0, hints: 0, mistakes: 0 }
}
