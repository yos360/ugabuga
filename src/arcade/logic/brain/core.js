// Pure deterministic utilities. A solution is a sequence of legal actions.
export const key = value => JSON.stringify(value)
export function bfs(initial, next, goal, limit = 100000) {
  const queue = [initial], seen = new Map([[key(initial), null]])
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head], id = key(state)
    if (goal(state)) {
      const path = []; let cursor = id
      while (seen.get(cursor)) { const edge = seen.get(cursor); path.push(edge.action); cursor = edge.parent }
      return path.reverse()
    }
    for (const { state: child, action } of next(state)) {
      const childKey = key(child)
      if (seen.has(childKey)) continue
      if (seen.size >= limit) throw new Error('Puzzle search limit exceeded')
      seen.set(childKey, { parent: id, action }); queue.push(child)
    }
  }
  return null
}
export function permutations(items) {
  if (!items.length) return [[]]
  return items.flatMap((item, i) => permutations(items.filter((_, j) => i !== j)).map(rest => [item, ...rest]))
}
export const same = (a, b) => key(a) === key(b)
export function range(n) { return Array.from({ length: n }, (_, i) => i) }
export function checkedIndex(index, count) {
  if (!Number.isInteger(index) || index < 0 || index >= count) throw new RangeError('Invalid puzzle index')
  return index
}
