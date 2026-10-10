import { useEffect, useState } from 'react'

// Shown when a speaker button can't play anything because the device has no voice for that
// language (common on Windows computers without a Hebrew voice). See utils/speak.js.
const LANGS = { he: 'עברית', en: 'אנגלית', fr: 'צרפתית', es: 'ספרדית', ru: 'רוסית', ar: 'ערבית', am: 'אמהרית' }

export default function NoVoiceNotice() {
  const [lang, setLang] = useState(null)
  useEffect(() => {
    let t
    const on = e => { setLang((e.detail?.lang || 'he').slice(0, 2)); clearTimeout(t); t = setTimeout(() => setLang(null), 9000) }
    window.addEventListener('buga:no-voice', on)
    return () => { window.removeEventListener('buga:no-voice', on); clearTimeout(t) }
  }, [])
  if (!lang) return null
  return <div role="status" dir="rtl" className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-md rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-[15px] leading-relaxed shadow-lg">
    <button type="button" onClick={() => setLang(null)} aria-label="סגירה" className="float-left min-h-[32px] min-w-[32px] text-lg">✕</button>
    <b>🔇 אין במכשיר הזה קול ב{LANGS[lang] || 'שפה הזאת'}</b>
    <p className="m-0 mt-1">לכן אי אפשר להשמיע. בטלפון זה בדרך כלל עובד; במחשב Windows אפשר להוסיף קול בהגדרות ← זמן ושפה ← דיבור, ובמק — בהגדרות ← נגישות ← תוכן מדובר. כל השאר עובד גם בלי קול.</p>
  </div>
}
