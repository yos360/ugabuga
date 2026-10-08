// "More like this" blocks used to show the first N items of a list on every page,
// so items further down only got a link from their hub. Taking the items that
// follow the current one (wrapping around) spreads internal links evenly.
export function nearby(items, isCurrent, count) {
  const at = items.findIndex(isCurrent)
  const rest = at < 0 ? items : [...items.slice(at + 1), ...items.slice(0, at)]
  return rest.slice(0, count)
}
