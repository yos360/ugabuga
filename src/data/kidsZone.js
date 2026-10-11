// Kids zone (/kids) and the home page's "why are you here today?" cards.
// Plain data so tests/kids-zone.test.mjs can check every link against the routes in App.jsx.

// /kids tiles: on-screen activities only (no printing, no forms, no outside links), for a child
// of about 4–9 browsing alone. `label` is short on purpose — it is also what the 🔊 button reads.
export const KIDS_TILES = [
  { to: '/online-games', emoji: '🎮', label: 'משחקים', bg: '#ffe9a8' },
  { to: '/printables/color-by-number', emoji: '🎨', label: 'צביעה', bg: '#ffd6e7' },
  { to: '/stories', emoji: '📚', label: 'סיפורים', bg: '#dcd6ff' },
  { to: '/letters/game', emoji: '✏️', label: 'אותיות', bg: '#d3f5e4' },
  { to: '/abc/game', emoji: '🔤', label: 'אנגלית', bg: '#d6ecff' },
  { to: '/math/grade-1/counting-20', emoji: '🔢', label: 'מספרים', bg: '#ffe0cc' },
  { to: '/online-games/memory', emoji: '🧠', label: 'זיכרון', bg: '#e8dcff' },
  { to: '/online-games/sliding-puzzle', emoji: '🧩', label: 'פאזלים', bg: '#d7f3f7' },
  { to: '/online-games/whack-a-mole', emoji: '🔨', label: 'חפרפרת', bg: '#f1e4d0' },
  { to: '/online-games/tic-tac-toe', emoji: '⭕', label: 'איקס עיגול', bg: '#ffdcdc' },
  { to: '/online-games/ball-sort', emoji: '🧪', label: 'כדורים', bg: '#e2f6cf' },
  { to: '/music/piano', emoji: '🎹', label: 'פסנתר', bg: '#fff3c4' },
]

// Home page, right under the hero: one card per reason people come to the site.
// [emoji, title, description, link, crop (fallback art), background, accent, illustration]
export const HOME_INTENTS = [
  ['🎮', 'בא לי לשחק!', 'משחקים, צביעה במסך, סיפורים שמקריאים לך ואותיות עם קול — הכול לבד.', '/kids', [577, 257, 191, 187], '#fff1b8', '#ff8a1f', '/images/home-detective-boy-720.webp'],
  ['🏠', 'משהו לעשות עם הילדים', 'דפי צביעה, סיפורים לפני השינה, ניסויים מהמטבח ומשחקים לכל המשפחה. מוכן תוך דקה, בלי הכנות.', '/family', [1022, 272, 187, 162], '#f3eaff', '#a775ed', '/images/home-printer-720.webp'],
  ['🏫', 'חומר מוכן לכיתה', 'דפי עבודה לפי כיתה ורמה, מבחנים שבודקים את עצמם, חדרי בריחה ומשחקים לכל הכיתה.', '/classroom', [1019, 481, 173, 170], '#dff2ff', '#28a4ef', '/images/home-schoolgirl-720.webp'],
  ['🎂', 'יום הולדת מתקרב', "רעיונות לפי גיל, משחקים למסיבה, הזמנות, רשימת 'מי מביא מה' וספקים.", '/birthday', [124, 268, 188, 176], '#ffe7e4', '#ff6f7b', '/images/home-birthday-girl-720.webp'],
]
