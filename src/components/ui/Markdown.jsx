// Tiny, dependency-free renderer for the light markdown used in game texts
// (Supabase `instructions` / `age_adaptations`): "## heading", "**bold**",
// "- item", "1. item" and blank-line paragraphs. Builds React elements only —
// no dangerouslySetInnerHTML — so untrusted content can't inject markup.

function inline(text, keyBase) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((part, i) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={keyBase + '-' + i}>{part.slice(2, -2)}</strong>
    : part)
}

export default function Markdown({ text, className = '' }) {
  if (!text) return null
  const lines = String(text).replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      const level = heading[1].length
      const Tag = level <= 2 ? 'h3' : 'h4'
      blocks.push(<Tag key={i} className={level <= 2 ? 'text-xl font-bold mt-5 mb-2' : 'text-lg font-bold mt-4 mb-1'}>{inline(heading[2], 'h' + i)}</Tag>)
      i++; continue
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*•]\s+/, '')); i++ }
      blocks.push(<ul key={'ul' + i} className="list-disc pr-6 my-2 space-y-1">{items.map((it, j) => <li key={j}>{inline(it, 'ul' + i + j)}</li>)}</ul>)
      continue
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+[.)]\s+/, '')); i++ }
      blocks.push(<ol key={'ol' + i} className="list-decimal pr-6 my-2 space-y-1">{items.map((it, j) => <li key={j}>{inline(it, 'ol' + i + j)}</li>)}</ol>)
      continue
    }
    if (line.trim() === '') { i++; continue }
    const para = []
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4})\s+/.test(lines[i]) && !/^\s*[-*•]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i])) { para.push(lines[i]); i++ }
    blocks.push(<p key={'p' + i} className="my-2">{para.map((l, j) => <span key={j}>{j > 0 && <br />}{inline(l, 'p' + i + j)}</span>)}</p>)
  }
  return <div className={className}>{blocks}</div>
}
