import { shareLink } from '../utils/share'

// Real browser full-screen where supported; on iPhone the stage simply fills the window.
export function enterFullscreen() {
  try {
    const el = document.documentElement
    if (!document.fullscreenElement && el.requestFullscreen) void el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
  } catch { /* not supported (iPhone) — the stage still fills the window */ }
}
export function exitFullscreen() {
  try { if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}) } catch { /* ignore */ }
}

export function shareGameText(game, report) {
  const brag = report?.text ? `${report.text}\n` : ''
  return `${game.emoji} ${game.name} — ${game.tagline}\n${brag}משחק חינם בעוגה בוגה, בלי הורדה ובלי הרשמה:\n${shareLink(`/online-games/${game.slug}`, 'online-games')}`
}
