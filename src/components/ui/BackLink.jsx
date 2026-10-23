import { Link, useNavigate } from 'react-router-dom'
import { useBackNavigation } from '../layout/NavigationHistory'

export default function BackLink({ to = '/', children, lang = 'he', onClick, ...props }) {
  const entry = useBackNavigation()
  const navigate = useNavigate()
  const canGoBack = entry?.index > 0
  const source = entry?.from
  const label = lang === 'en' ? 'Back to previous page' : 'חזרה לעמוד הקודם'
  return <Link {...props} to={source?.pathname || to} onClick={event => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === '_blank' || !canGoBack) return
    event.preventDefault()
    navigate(-(source ? entry.index - source.index : 1))
  }}>{canGoBack && source?.pathname !== to ? label : (children || label)}</Link>
}
