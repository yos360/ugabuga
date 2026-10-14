import { Link } from 'react-router-dom'
import { SITUATIONS } from './emojiCatalog'
export default function EmojiRelated({pathname}) {
  const matches=SITUATIONS.filter(s=>s.relatedPaths.some(p=>pathname===p || (p.startsWith('/holidays/') && pathname.startsWith(p+'/'))) || (s.slug==='birthday' && pathname.startsWith('/greetings/')))
  if(!matches.length) return null
  return <aside className="no-print mx-auto max-w-3xl px-4 pb-8" dir="rtl" aria-label="אימוג׳י וברכות מתאימים"><h2 className="font-bold mb-3">להוסיף חיוך להודעה</h2><div className="flex flex-wrap gap-3">{matches.map(s=><Link className="underline" key={s.slug} to={`/emoji/for/${s.slug}`}>{s.emoji} אימוג׳י ל{s.label}</Link>)}</div></aside>
}
