import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { WELCOME_KEY, welcomeBackDue } from '../../utils/welcomeBack'

// A small toast at the bottom for visitors who came back on another day — once a day, gone after 7 s.
export default function WelcomeBack() {
  const [show, setShow] = useState(() => {
    try {
      if (!welcomeBackDue(JSON.parse(localStorage.getItem('buga-visit-days') || 'null'), localStorage.getItem(WELCOME_KEY))) return false
      localStorage.setItem(WELCOME_KEY, new Date().toDateString())
      return true
    } catch { return false }
  })
  useEffect(() => {
    if (!show) return undefined
    const t = setTimeout(() => setShow(false), 7000)
    return () => clearTimeout(t)
  }, [show])
  if (!show) return null
  return <div role="status" dir="rtl" className="no-print no-present fixed inset-x-0 bottom-20 z-50 mx-auto flex w-fit max-w-[92vw] items-center gap-2 rounded-2xl border-2 border-slate-800 bg-[var(--postit,#fff3a8)] px-4 py-2 text-slate-900 shadow-[0_4px_0_#1e293b] buga-fade-in">
    <span className="text-lg font-bold">👋 ברוכים השבים לעוגה בוגה!</span>
    <Link to="/new" onClick={() => setShow(false)} className="text-sm font-bold underline">מה חדש?</Link>
    <button type="button" onClick={() => setShow(false)} aria-label="סגירת הברכה" className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-black/10">×</button>
  </div>
}
