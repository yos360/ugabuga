import { useEffect } from 'react'
import { GOOGLE_FONTS, loadGoogleFont } from './googleFonts'

const GROUPS = [['sans', 'נקי ומודרני'], ['serif', 'קלאסי (עם סריפים)'], ['display', 'כותרות'], ['hand', 'כתב יד']]

// A plain <select> of the popular Google fonts, grouped; Latin-only fonts are marked. `empty` is the
// label of the "no override" option (e.g. the template's own font).
export default function FontSelect({ value, onChange, empty = 'ברירת מחדל', label = 'גופן', className = '' }) {
  useEffect(() => { if (value) loadGoogleFont(value) }, [value])
  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <b>{label}:</b>
      <select value={value || ''} onChange={e => { loadGoogleFont(e.target.value); onChange(e.target.value) }} className="min-h-[40px] rounded-xl border-2 border-slate-200 bg-white px-2 font-semibold">
        <option value="">{empty}</option>
        {GROUPS.map(([kind, name]) => (
          <optgroup key={kind} label={name}>
            {GOOGLE_FONTS.filter(f => f.kind === kind).map(f => <option key={f.id} value={f.id}>{f.label}{f.he ? '' : ' — אנגלית בלבד'}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  )
}
