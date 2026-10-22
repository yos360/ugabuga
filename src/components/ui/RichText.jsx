import { Fragment } from 'react'
import { Link } from 'react-router-dom'

// Content text (blog, guides, idea articles, landing pages) can link to a page on the site inline:
// "מדביקים בנקדן [[נקדן האוטומטי|/tools/nakdan]] ומקבלים…". Anything without the markup renders as is.
export const LINK_MARKUP = /\[\[([^|\]]+)\|(\/[^\]\s]*)\]\]/g
export const plainText = text => String(text ?? '').replace(LINK_MARKUP, '$1')

export default function RichText({ text }) {
  const s = String(text ?? '')
  if (!s.includes('[[')) return s
  const out = []
  let last = 0
  for (const m of s.matchAll(LINK_MARKUP)) {
    if (m.index > last) out.push(s.slice(last, m.index))
    out.push(<Link key={m.index} to={m[2]} className="font-bold text-violet-700 underline decoration-violet-300 decoration-2 underline-offset-4 transition-colors hover:text-violet-900 hover:decoration-violet-600">{m[1]}</Link>)
    last = m.index + m[0].length
  }
  if (last < s.length) out.push(s.slice(last))
  return <Fragment>{out}</Fragment>
}
