import { speak } from '../../utils/speak'

// A small 🔊 button that reads `text` aloud: the recorded voice when there is a clip for this exact
// text (public/audio/<lang>/), otherwise the device voice. `text` is the clip key, so keep it
// exactly what scripts/audio/siteItems.mjs lists for that page.
export default function SpeakButton({ text, lang = 'he-IL', label, className = '', rate }) {
  if (!text) return null
  return <button type="button" onClick={e => { e.stopPropagation(); speak(text, lang, rate ? { rate } : undefined) }}
    className={`no-print inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border-2 border-[var(--border)] bg-white px-2 text-lg leading-none hover:bg-[var(--postit)] ${className}`}
    aria-label={label || `השמעה: ${text}`} title="השמעה">🔊</button>
}
