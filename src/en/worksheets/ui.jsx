import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import './worksheets.css'
import '../english.css'

// Small building blocks shared by the English worksheet pages.

export function Pills({ label, items, value, onChange }) {
  return <div className="ws-pills" role="radiogroup" aria-label={label}>
    <span className="ws-pills-label">{label}:</span>
    {items.map(([id, text]) => <button key={String(id)} type="button" role="radio" aria-checked={value === id} className="ws-pill" onClick={() => onChange(id)}>{text}</button>)}
  </div>
}

export const LETTER_NOTE = 'Sheets are A4. On US Letter paper, choose "Fit to page" (or "Scale to fit") in your print settings.'

export function PrintNote() {
  return <p className="ws-note">{LETTER_NOTE} Free, with no sign-up.</p>
}

export function Crumbs({ trail = [], current }) {
  return <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'Worksheets', href: '/en/worksheets' }, ...trail, { label: current }]} />
}

export function PageHead({ emoji, title, sub }) {
  return <>
    <h1 className="ws-h1"><span aria-hidden="true">{emoji} </span>{title}</h1>
    {sub && <p className="en-lead">{sub}</p>}
  </>
}

// A row of links to sibling pages.
export function LinkRow({ label, links }) {
  return <nav className="ws-links" aria-label={label}>
    <span className="ws-pills-label">{label}:</span>
    {links.map(l => <Link key={l.href} to={l.href} className="ws-link-pill">{l.label}</Link>)}
  </nav>
}

export const A4Page = ({ children, k }) => <article className="buga-a4 en-print-sheet" dir="ltr" key={k}><div className="print-art">{children}</div></article>
