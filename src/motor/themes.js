// Themes only change the story and icons; the exercise itself comes from the generator.
export const THEMES = [
  { id: 'space', label: 'חלל', emoji: '🚀', start: '🚀', goal: '⭐', mazeTitle: 'עזרו לחללית להגיע לכוכב', traceTitle: 'עזרו לחלליות לנחות', icons: ['🚀', '⭐', '🪐', '🌙', '☄️', '👽'] },
  { id: 'animals', label: 'חיות', emoji: '🐶', start: '🐶', goal: '🦴', mazeTitle: 'עזרו לכלבלב למצוא את העצם', traceTitle: 'עזרו לחיות להגיע הביתה', icons: ['🐶', '🐱', '🐰', '🐻', '🐸', '🐤'] },
  { id: 'sea', label: 'ים', emoji: '🐠', start: '🐠', goal: '🐚', mazeTitle: 'עזרו לדג להגיע לצדף', traceTitle: 'עזרו לדגים לשחות', icons: ['🐠', '🐙', '🐳', '🦀', '🐚', '⭐'] },
  { id: 'dinos', label: 'דינוזאורים', emoji: '🦖', start: '🦖', goal: '🥚', mazeTitle: 'עזרו לדינוזאור למצוא את הביצה', traceTitle: 'עזרו לדינוזאורים לצעוד', icons: ['🦖', '🦕', '🥚', '🌋', '🌴', '🦴'] },
  { id: 'cars', label: 'מכוניות', emoji: '🚗', start: '🚗', goal: '🏁', mazeTitle: 'עזרו למכונית להגיע לקו הסיום', traceTitle: 'נסעו בכביש עד הסוף', icons: ['🚗', '🚌', '🚒', '🚜', '🏁', '🚦'] },
  { id: 'nature', label: 'טבע', emoji: '🐝', start: '🐝', goal: '🌻', mazeTitle: 'עזרו לדבורה להגיע לפרח', traceTitle: 'עזרו לפרפרים לעוף', icons: ['🐝', '🌻', '🦋', '🍄', '🌳', '🐞'] },
  { id: 'shapes', label: 'צורות', emoji: '🔷', start: '🔵', goal: '⭐', mazeTitle: 'מצאו את הדרך לכוכב', traceTitle: 'עקבו אחרי הקווים', icons: ['circle', 'triangle', 'square', 'star', 'heart', 'diamond'] },
]
export const themeOf = id => THEMES.find(t => t.id === id) || THEMES[0]
