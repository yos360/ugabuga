// "החידה היומית" — one new tricky riddle every day at 14:00 (also posted as a short video, without the answer).
// Newest first. Page: /riddles/<id>, list: /riddles/daily. Ids must not clash with the topic pages in content/riddles.js.
// kind: 'seq' (a row of boxes, dir 'ltr' | 'rtl'), 'eq' (equation lines), 'text' (a riddle told in a few lines).
export const DAILY_RIDDLES = [
  {
    id: 'shilshom', n: 2, date: '2026-11-04', type: 'לוח שנה', emoji: '📅', kind: 'text',
    title: 'חידת לוח שנה',
    lines: ['היום שלפני מחרתיים', 'הוא יום שבת.', 'איזה יום', 'היה שלשום?'],
    ask: 'קראו לאט, מילה אחרי מילה',
    answer: 'יום רביעי',
    why: 'היום שלפני מחרתיים הוא בעצם מחר. אם מחר שבת — היום יום שישי, ושלשום (לפני יומיים) היה יום רביעי.',
  },
  {
    id: 'reversed-squares', n: 1, date: '2026-11-03', type: 'סדרת מספרים', emoji: '🔢', kind: 'seq', dir: 'ltr',
    title: 'מה המספר הבא?',
    items: ['1', '4', '9', '61', '52', '63', '?'],
    ask: 'איזה מספר מחליף את סימן השאלה?',
    answer: '94',
    why: 'אלה המספרים בריבוע (1, 4, 9, 16, 25, 36, 49) — כתובים הפוך. 49 הפוך הוא 94.',
  },
]

export const dailyRiddle = id => DAILY_RIDDLES.find(r => r.id === id)
export const dailyRiddlePath = r => `/riddles/${r.id}`
// The riddle as one line of text (for descriptions and search)
export const riddleText = r => (r.kind === 'text' ? r.lines.join(' ') : `${r.title} ${(r.items || r.lines).join(r.kind === 'seq' ? ', ' : ' · ')}`)
