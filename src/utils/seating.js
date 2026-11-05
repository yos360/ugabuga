// Smart seating: fills the tables for the organizer without splitting a family or moving anyone
// already seated. Groups ("צד חתן", "חברים") stay together; a family is the last word of the name.
export const DEFAULT_SEATS = 12
export const MAX_SEATS = 30

export const partySize = r => Math.max(1, (Number(r.kids) || 0) + (Number(r.adults) || 0))
export const tablesNeeded = (people, seats = DEFAULT_SEATS) => Math.ceil(Math.max(0, Number(people) || 0) / Math.max(1, Number(seats) || DEFAULT_SEATS))

const familyOf = name => {
  const words = String(name || '').trim().split(/\s+/)
  return words.length > 1 ? words[words.length - 1] : ''
}

// People at each table (index 0 = table 1), for the capacity warning.
export function tableLoads(replies, marks, tables) {
  const loads = Array(Math.max(0, tables || 0)).fill(0)
  for (const r of replies) { const n = marks[r.id]?.table; if (n >= 1 && n <= loads.length) loads[n - 1] += partySize(r) }
  return loads
}

// replies: [{ id, name, kids, adults }]; marks: { [id]: { table, group } }.
// Returns { seats: { [id]: table }, left: [ids that did not fit] }. Same input, same result.
export function autoSeat(replies, marks = {}, tables = 0, seats = DEFAULT_SEATS) {
  const tabs = Array.from({ length: Math.max(0, tables || 0) }, (_, i) => ({ n: i + 1, left: seats, families: new Set(), groups: new Set() }))
  const sit = (t, r) => {
    t.left -= partySize(r)
    const family = familyOf(r.name), group = marks[r.id]?.group
    if (family) t.families.add(family)
    if (group) t.groups.add(group)
  }
  const free = []
  for (const r of replies) {
    const t = tabs[(marks[r.id]?.table || 0) - 1]
    if (t) sit(t, r); else free.push(r)
  }

  // Best table: same family, then same group, then not mixing groups, then the tightest fit.
  const bestFor = (size, family, group) => {
    const score = t => [family && t.families.has(family) ? 0 : 1, group && t.groups.has(group) ? 0 : 1, group && t.groups.size ? 1 : 0, t.left, t.n]
    const fit = tabs.filter(t => t.left >= size).map(t => [score(t), t])
    fit.sort((a, b) => { for (let i = 0; i < 5; i++) if (a[0][i] !== b[0][i]) return a[0][i] - b[0][i]; return 0 })
    return fit[0]?.[1]
  }

  const clusters = new Map()
  for (const r of free) {
    const group = marks[r.id]?.group || ''
    const key = `${group}|${familyOf(r.name) || r.id}`
    if (!clusters.has(key)) clusters.set(key, { group, family: familyOf(r.name), people: [], size: 0 })
    const c = clusters.get(key)
    c.people.push(r); c.size += partySize(r)
  }
  const groupSize = {}
  for (const c of clusters.values()) groupSize[c.group] = (groupSize[c.group] || 0) + c.size
  const order = [...clusters.values()].sort((a, b) =>
    (a.group ? 0 : 1) - (b.group ? 0 : 1) || groupSize[b.group] - groupSize[a.group] || a.group.localeCompare(b.group, 'he')
    || b.size - a.size || (a.family + a.people[0].name).localeCompare(b.family + b.people[0].name, 'he'))

  const result = {}, left = []
  const place = (r, t) => { sit(t, r); result[r.id] = t.n }
  for (const c of order) {
    const whole = bestFor(c.size, c.family, c.group)
    if (whole) { for (const r of c.people) place(r, whole); continue }
    // Too big for any one table: largest answers first, as close together as possible.
    for (const r of [...c.people].sort((a, b) => partySize(b) - partySize(a))) {
      const t = bestFor(partySize(r), c.family, c.group)
      if (t) place(r, t); else left.push(r.id)
    }
  }
  return { seats: result, left }
}
