import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { isSaved, onSavedChange, retitleSaved, toggleSaved } from '../../utils/savedPages'

// The small ❤️ next to the breadcrumbs: saves this page to "המועדפים שלי" (/favorites). The title is the
// end of the breadcrumb trail ("מדעים · כיתה ד׳ · מבחן לדוגמה"), so a generic page name still says what it is.
export default function SaveButton({ title }) {
  const { pathname } = useLocation()
  const [saved, setSaved] = useState(false)
  useEffect(() => { setSaved(isSaved(pathname)); return onSavedChange(list => setSaved(list.some(x => x.path === pathname))) }, [pathname])
  const label = title || (typeof document !== 'undefined' ? document.title.replace(/\s*\|\s*עוגה בוגה\s*$/, '') : '')
  useEffect(() => { if (title) retitleSaved(pathname, title) }, [pathname, title])
  return <button type="button" onClick={() => setSaved(toggleSaved({ path: pathname, title: label }))} aria-pressed={saved}
    className="inline-flex min-h-[32px] items-center gap-1 rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 text-sm font-bold text-[var(--ink)] hover:border-rose-300"
    aria-label={saved ? 'הסרה מהמועדפים' : 'שמירה במועדפים'}>
    <span aria-hidden="true">{saved ? '❤️' : '🤍'}</span>{saved ? 'במועדפים' : 'למועדפים'}
  </button>
}
