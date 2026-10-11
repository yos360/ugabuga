import { useEffect, useRef } from 'react'

// For a `.chip-scroll` row (one horizontally scrolling row of filter chips on phones):
// scrolls the row — never the page — so the selected chip is visible, e.g. when the page
// was opened from a filtered link. `key` changes whenever the selection changes.
export function useActiveChipInView(key) {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    for (const row of [root, ...root.querySelectorAll('.chip-scroll')]) {
      const chip = row.classList.contains('chip-scroll') && row.querySelector(':scope > [aria-pressed="true"], :scope > [aria-current="true"]')
      if (!chip || row.scrollWidth <= row.clientWidth) continue
      const r = row.getBoundingClientRect(), c = chip.getBoundingClientRect()
      if (c.left < r.left || c.right > r.right) row.scrollLeft += c.left + c.width / 2 - (r.left + r.width / 2)
    }
  }, [key])
  return ref
}
