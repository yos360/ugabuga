// Music for /tools/keyboard: instrumental Spotify playlists + parsing a pasted Spotify link
export const PLAYLISTS = [
  { id: 'piano', name: '🎹 פסנתר רגוע', uri: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO' },
  { id: 'lofi', name: '🎧 לו-פיי', uri: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn' },
  { id: 'focus', name: '🧠 ריכוז עמוק', uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ' },
  { id: 'study', name: '📚 מוזיקה ללימודים', uri: 'spotify:playlist:37i9dQZF1DX9sIqqvKsjG8' },
  { id: 'classic', name: '🎻 קלאסית', uri: 'spotify:playlist:37i9dQZF1DWWEJlAGA9gs0' },
]

const TYPES = 'playlist|album|track|episode|show|artist'

// "https://open.spotify.com/intl-he/playlist/ID?si=…" or "spotify:album:ID" → "spotify:album:ID"
export function spotifyUri(input) {
  const s = String(input || '').trim()
  const m = s.match(new RegExp(`^spotify:(${TYPES}):([A-Za-z0-9]{10,40})$`)) ||
    s.match(new RegExp(`^(?:https?://)?open\\.spotify\\.com/(?:intl-[a-z-]+/)?(?:embed/)?(${TYPES})/([A-Za-z0-9]{10,40})(?:[/?#].*)?$`))
  return m ? `spotify:${m[1]}:${m[2]}` : null
}

export const fmtTime = ms => {
  const t = Math.max(0, Math.floor((ms || 0) / 1000))
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}
