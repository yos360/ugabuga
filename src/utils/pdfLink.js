// Pure helpers for the "PDF link that lost its blob: prefix" problem (ugabuga.co.il/<uuid>).
const UUID_PATH = /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/i
export const EXPIRED_PDF_PATH = '/expired-pdf-link'
export const isUuidPath = path => UUID_PATH.test(String(path || '').split(/[?#]/)[0])

// In-app WebViews (WhatsApp, Facebook, Instagram…) ignore <a download> on blob URLs.
const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|Snapchat|TikTok|musical_ly|; wv\)/i
export const isInAppBrowser = ua => IN_APP.test(String(ua || ''))
export const isAndroid = ua => /Android/i.test(String(ua || ''))
export const isIos = ua => /iPhone|iPad|iPod/i.test(String(ua || ''))

// Opens the given https page in Chrome on Android; browsers without Chrome fall back to the https URL.
export function chromeIntentUrl(href) {
  try {
    const u = new URL(href)
    if (u.protocol !== 'https:') return null
    u.hash = ''
    return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.href)};end`
  } catch { return null }
}
