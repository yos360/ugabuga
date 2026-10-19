// Merge adjacent cells into horizontal runs. The thumbnail keeps every color
// and cell position without placing thousands of rect/group nodes in each hub.
export function thumbnailPaths(grid, cell = 10) {
  const paths = new Map()
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const color = row[x], start = x
      while (x < row.length && row[x] === color) x++
      if (!color) continue
      const width = (x - start) * cell
      paths.set(color, (paths.get(color) || '') + `M${start * cell},${y * cell}h${width}v${cell}h-${width}z`)
    }
  })
  return [...paths].map(([color, d]) => ({ color, d }))
}
