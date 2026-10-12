// Order helpers for the owner report's reorderable sections (kept JSX-free so tests can import them).
// Saved order first (ids that still exist), then any new sections in their default place.
export function orderSections(sections, saved) {
  const ids = sections.map(s => s.id)
  const kept = (saved || []).filter(id => ids.includes(id))
  return [...kept, ...ids.filter(id => !kept.includes(id))].map(id => sections.find(s => s.id === id))
}
export function moveId(order, id, to) {
  const from = order.indexOf(id)
  if (from < 0 || to < 0 || to >= order.length || from === to) return order
  const next = order.filter(x => x !== id)
  next.splice(to, 0, id)
  return next
}
