// The English site lives under /en. Visitors are counted from by_visitor (one browser per day);
// a visitor counts as English if any step of their path is an /en page.
export const isEnglishPath = path => path === '/en' || String(path || '').startsWith('/en/')
export function englishSummary(data, stats) {
  const pages = stats.filter(r => isEnglishPath(r.path)).sort((a, b) => b.opens - a.opens)
  const visitors = (data.by_visitor || []).filter(v => (v.steps || []).some(st => isEnglishPath(st.p)))
  const landed = visitors.filter(v => isEnglishPath(v.steps?.[0]?.p))
  const sources = {}
  for (const v of landed) sources[v.source || 'unknown'] = (sources[v.source || 'unknown'] || 0) + 1
  const sum = key => pages.reduce((total, r) => total + (r[key] || 0), 0)
  return { pages, visitors, landed, sources: Object.entries(sources).sort((a, b) => b[1] - a[1]), opens: sum('opens'), uses: sum('uses'), prints: sum('prints') }
}
