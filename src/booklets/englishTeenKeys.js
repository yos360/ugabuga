// Answer-key helpers for the teen English booklets: the key is built from the same data as the exercises.
const ABC = 'abcd'

// Ex items: [text, answer]
export const exKey = items => items.map(it => it[1])
// MC items: [question, [options], index of the right option]
export const mcKey = items => items.map(([, opts, a]) => `${ABC[a]} (${opts[a]})`)
// Questions items: { q, opts?, a } — `a` is an index when there are options
export const qKey = items => items.map(it => it.opts ? `${ABC[it.a]} (${it.opts[it.a]})` : it.a)
