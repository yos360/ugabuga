// Topics for /request/done, so visitors find a page by subject instead of scrolling one long list.
// First match wins, so the order matters: a holiday coloring page is "holidays", a citrus game with
// niqqud is "topics", and only then does anything about letters and reading fall into "reading".
export const REQUEST_TOPICS = [
  { key: 'holidays', label: 'חגים ומועדים', emoji: '🕎', test: /חנוכה|פסח|פורים|סוכות|ראש השנה|שבועות|סיגד|ט״ו|יום העצמאות|^\/holidays/ },
  { key: 'math', label: 'חשבון', emoji: '🔢', test: /חשבון|חיבור|חיסור|כפל|חילוק|שברים|מספרים|מילוליות|^\/math/ },
  { key: 'english', label: 'אנגלית', emoji: '🔤', test: /אנגלית|English|^\/en\// },
  { key: 'topics', label: 'מדעים ונושאים', emoji: '🔬', test: /מדעים|פירות|תחבורה|חומרים|בעלי חיים|חיות|גוף האדם|עונות|מזג אוויר/ },
  { key: 'coloring', label: 'צביעה ויצירה', emoji: '🎨', test: /צביעה|ציור|יצירה|coloring/ },
  { key: 'reading', label: 'קריאה, ניקוד ועברית', emoji: '📖', test: /קריא|נקרא|ניקוד|תנועות|קמץ|אותיות|אות |כתיב|צליל|פירמיד|מילים|עברית/ },
]
export const OTHER_TOPIC = { key: 'other', label: 'עוד דפים', emoji: '📄' }

export function requestTopic(r) {
  const text = `${r.title || ''} ${r.path || ''}`
  return REQUEST_TOPICS.find(t => t.test.test(text) || t.test.test(r.path || '')) || OTHER_TOPIC
}

// [{ key, label, emoji, items }] in topic order, empty topics dropped.
export function groupByTopic(rows) {
  return [...REQUEST_TOPICS, OTHER_TOPIC]
    .map(({ key, label, emoji }) => ({ key, label, emoji, items: rows.filter(r => requestTopic(r).key === key) }))
    .filter(g => g.items.length)
}
