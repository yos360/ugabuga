// Words a voice reads wrongly without vowels, fixed only where a passage asks for it — "אלה" is the
// name Ella in one story but "these" everywhere else. A passage lists `say: [[word, vocalized]]`;
// the 🔊 buttons speak the fixed text, and the clip generator (scripts/audio) records it.
export function applySay(text, say) {
  let out = String(text)
  for (const [word, spoken] of say || []) {
    // the whole word, also after ו/ש/ל/ה/ב/כ/מ ("ואלה"), never inside another word ("האלה" stays)
    out = out.replace(new RegExp(`(^|[^\\u0590-\\u05FF])([ושלבכמ]?)${word}(?=[^\\u0590-\\u05FF]|$)`, 'g'), `$1$2${spoken}`)
  }
  return out
}
