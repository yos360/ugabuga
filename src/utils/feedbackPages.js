// Where the small "האם זה עזר?" row appears: tool, printable, game and learn pages — never the home
// page, index pages, or anything with a guest/shared link (RSVP, bring list, secret friend, shared spaces).
const SECTIONS = ['tools', 'printables', 'games', 'online-games', 'learn', 'brain-games', 'logic-puzzles', 'sudoku', 'math', 'typing']
const NEVER = ['rsvp', 'bring-list', 'secret-friend', 't', 'q', 'play', 'live', 'embed', 'admin', 'account', 'auth', 'login', 'en', 'kids']
export function feedbackEligible(pathname) {
  const parts = String(pathname || '').toLowerCase().split(/[?#]/)[0].split('/').filter(Boolean)
  return parts.length >= 2 && SECTIONS.includes(parts[0]) && !parts.some(p => NEVER.includes(p))
}
