export function createGameNews(event) {
  const player = event.player || 'שחקן'

  if (event.type === 'quiz') {
    if (event.streak >= 5) return `🔥 ${player} ברצף לוהט — ${event.streak} תשובות נכונות בטריוויה!`
    if (event.correct) return `✅ ${player} ענה נכון ב${event.topic || 'טריוויה'} וצבר נקודה חשובה.`
    return `🤔 ${player} כמעט פיצח את השאלה — התשובה הנכונה הייתה ${event.answer}.`
  }

  if (event.type === 'speedQuiz') {
    return `⚡ ${player} במירוץ מהיר — ${event.correct || 0}/${event.total || 0} תשובות נכונות!`
  }

  if (event.type === 'expertMode') {
    return `👑 ${player} ניסה מצב מומחה וסיים עם ${event.score || 0}% הצלחה.`
  }

  if (event.type === 'multiplayer') {
    const winner = event.winner || player
    const loser = event.loser || 'היריב'
    return `🎯 דרמה בריבוי שחקנים — ${winner} גבר על ${loser} ${event.score || ''}!`.trim()
  }

  if (event.type === 'bugaTown') {
    if (event.action === 'buy') return `🏙️ ${player} בנה בעיר בוגה טאון — כבש את ${event.property}!`
    if (event.action === 'rent') return `💰 ${player} שילם שכירות בבוגה טאון — העיר מתחממת.`
    if (event.action === 'win') return `🏆 ${player} הגיע למרכז בוגה טאון וניצח את העיר!`
    return `🏙️ ${player} התקדם בבוגה טאון.`
  }

  return `📰 ${player} יצר רגע חדש במשחקי הבוגה.`
}

export const DEFAULT_LIVE_NEWS = [
  '🎮 כאן יופיעו רגעים מהמשחק שלכם',
  '🏆 כל ניצחון, קנייה ותור מצחיק יקבלו כותרת משלהם',
  '🏙️ שחקו בבוגה טאון או בטריוויה — והחדשות יתחילו לזרום',
]
