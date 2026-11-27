// /bar-mitzvah/birkon: original cover designs for a bar/bat mitzvah birkon (the cover and dedication only).
// Pure data + helpers (no JSX) so node tests can import it. The artwork itself is drawn in the page component,
// keyed by `id`. Everything is plain colour and shape: no characters, no brands, no third-party art.

export const BIRKON_DESIGNS = [
  { id: 'stars', name: 'כוכבים', bg: '#1b2a5c', ink: '#ffffff', accent: '#f2c14e', soft: '#3a4a86' },
  { id: 'waves', name: 'גלים', bg: '#e6f5f9', ink: '#0b3c5a', accent: '#1f9bc2', soft: '#9fd8e8' },
  { id: 'flowers', name: 'פרחים', bg: '#fff1f4', ink: '#5a2340', accent: '#e2578a', soft: '#5bab6e' },
  { id: 'geometric', name: 'משולשים', bg: '#fff7e6', ink: '#2d2a4a', accent: '#e8742c', soft: '#2f9e9a' },
  { id: 'jerusalem', name: 'קשתות מאבן', bg: '#f6ecd9', ink: '#4f3b26', accent: '#b98a3c', soft: '#dcc79e' },
  { id: 'rainbow', name: 'קשת', bg: '#fffdf5', ink: '#2b2b3a', accent: '#e8505b', soft: '#f6c344' },
]

export const designById = id => BIRKON_DESIGNS.find(d => d.id === id) || BIRKON_DESIGNS[0]

// Split text into lines of at most `max` characters, on word boundaries (a word longer than max is cut).
export function wrapText(text, max) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  for (let w of words) {
    while (w.length > max) {
      if (cur) { lines.push(cur); cur = '' }
      lines.push(w.slice(0, max))
      w = w.slice(max)
    }
    if (!cur) cur = w
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w
    else { lines.push(cur); cur = w }
  }
  if (cur) lines.push(cur)
  return lines
}

// Ready-made dedications to start from (original wording), by gender of the celebrant.
export function dedicationSamples(boy) {
  return boy
    ? [
        'לבננו היקר, ביום שבו אתה נכנס לעולם המצוות. אנחנו גאים בך ואוהבים אותך. אמא ואבא.',
        'תודה שבאתם לחגוג איתנו את היום המיוחד הזה. שתמיד נשמח יחד.',
        'לזכר היום שבו הפכת לבר מצווה. שתהיה לך דרך מלאת אור, שמחה ובריאות.',
      ]
    : [
        'לבתנו היקרה, ביום שבו את נכנסת לעולם המצוות. אנחנו גאים בך ואוהבים אותך. אמא ואבא.',
        'תודה שבאתם לחגוג איתנו את היום המיוחד הזה. שתמיד נשמח יחד.',
        'לזכר היום שבו הפכת לבת מצווה. שתהיה לך דרך מלאת אור, שמחה ובריאות.',
      ]
}
