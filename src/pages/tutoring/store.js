// What this browser remembers about tutoring plans: how each session went, and the plan opened last.
const KEY = 'ugabuga:tutoring'
export const readStore = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
export const writeStore = s => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage blocked */ } }
