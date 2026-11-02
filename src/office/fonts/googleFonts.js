// Popular Google Fonts for the office tools (resume, documents, text on a photo). Every font with
// `he: true` has Hebrew letters; the rest are Latin-only and fall back to Heebo for Hebrew text.
// A font's stylesheet is added to <head> only when someone picks it, so pages stay light.
export const GOOGLE_FONTS = [
  { id: 'heebo', family: 'Heebo', label: 'Heebo', he: true, kind: 'sans' },
  { id: 'assistant', family: 'Assistant', label: 'Assistant', he: true, kind: 'sans' },
  { id: 'rubik', family: 'Rubik', label: 'Rubik', he: true, kind: 'sans' },
  { id: 'open-sans', family: 'Open Sans', label: 'Open Sans', he: true, kind: 'sans' },
  { id: 'noto-sans-hebrew', family: 'Noto Sans Hebrew', label: 'Noto Sans', he: true, kind: 'sans' },
  { id: 'ibm-plex-sans-hebrew', family: 'IBM Plex Sans Hebrew', label: 'IBM Plex', he: true, kind: 'sans' },
  { id: 'arimo', family: 'Arimo', label: 'Arimo (כמו Arial)', he: true, kind: 'sans' },
  { id: 'varela-round', family: 'Varela Round', label: 'Varela Round', he: true, kind: 'sans', weights: '400' },
  { id: 'alef', family: 'Alef', label: 'Alef', he: true, kind: 'sans', weights: '400;700' },
  { id: 'fredoka', family: 'Fredoka', label: 'Fredoka', he: true, kind: 'sans' },
  { id: 'secular-one', family: 'Secular One', label: 'Secular One', he: true, kind: 'display', weights: '400' },
  { id: 'suez-one', family: 'Suez One', label: 'Suez One', he: true, kind: 'display', weights: '400' },
  { id: 'karantina', family: 'Karantina', label: 'Karantina', he: true, kind: 'display', weights: '400;700' },
  { id: 'amatic-sc', family: 'Amatic SC', label: 'Amatic (כתב יד)', he: true, kind: 'hand', weights: '400;700' },
  { id: 'playpen-sans-hebrew', family: 'Playpen Sans Hebrew', label: 'Playpen (כתב יד)', he: true, kind: 'hand' },
  { id: 'frank-ruhl-libre', family: 'Frank Ruhl Libre', label: 'Frank Ruhl', he: true, kind: 'serif' },
  { id: 'david-libre', family: 'David Libre', label: 'David', he: true, kind: 'serif', weights: '400;700' },
  { id: 'noto-serif-hebrew', family: 'Noto Serif Hebrew', label: 'Noto Serif', he: true, kind: 'serif' },
  { id: 'tinos', family: 'Tinos', label: 'Tinos (כמו Times)', he: true, kind: 'serif', weights: '400;700' },
  { id: 'bellefair', family: 'Bellefair', label: 'Bellefair', he: true, kind: 'serif', weights: '400' },
  { id: 'miriam-libre', family: 'Miriam Libre', label: 'Miriam', he: true, kind: 'sans', weights: '400;700' },
  { id: 'roboto', family: 'Roboto', label: 'Roboto', he: false, kind: 'sans' },
  { id: 'montserrat', family: 'Montserrat', label: 'Montserrat', he: false, kind: 'sans' },
  { id: 'poppins', family: 'Poppins', label: 'Poppins', he: false, kind: 'sans' },
  { id: 'lato', family: 'Lato', label: 'Lato', he: false, kind: 'sans', weights: '400;700' },
  { id: 'inter', family: 'Inter', label: 'Inter', he: false, kind: 'sans' },
  { id: 'playfair-display', family: 'Playfair Display', label: 'Playfair', he: false, kind: 'serif' },
  { id: 'merriweather', family: 'Merriweather', label: 'Merriweather', he: false, kind: 'serif', weights: '400;700' },
]

export const googleFont = id => GOOGLE_FONTS.find(f => f.id === id) || null

const FALLBACK = { sans: "'Heebo', Arial, sans-serif", display: "'Heebo', Arial, sans-serif", hand: "'Heebo', Arial, sans-serif", serif: "'Frank Ruhl Libre', 'David', 'Times New Roman', serif" }
// The CSS font-family value for a font id ('' when the id is unknown).
export const fontStack = id => { const f = googleFont(id); return f ? `'${f.family}', ${FALLBACK[f.kind]}` : '' }

export const fontHref = f => `https://fonts.googleapis.com/css2?family=${f.family.replace(/ /g, '+')}:wght@${f.weights || '400;500;700'}&display=swap`

// Adds the font's stylesheet once; resolves when the browser has the font (canvas drawing needs that).
const sheets = new Map()
export function loadGoogleFont(id) {
  const f = googleFont(id)
  if (!f || typeof document === 'undefined') return Promise.resolve()
  if (!sheets.has(f.id)) {
    sheets.set(f.id, new Promise(done => {
      const l = document.createElement('link')
      l.rel = 'stylesheet'; l.href = fontHref(f); l.dataset.gfont = f.id
      l.onload = l.onerror = () => done()
      document.head.appendChild(l)
    }).then(() => document.fonts?.load?.(`400 20px "${f.family}"`, 'אבגabc')).catch(() => {}))
  }
  return sheets.get(f.id)
}
