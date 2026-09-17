export const TOWN_STARTING_COINS = 200
export const TOWN_LAP_BONUS = 60
export const TOWN_PROPERTY_GOAL = 5
export const TOWN_ROUND_LIMIT = 12
export const TOWN_AVATARS = ['🦊', '🐼', '🐸', '🐱', '🤖', '🦄']
export const TOWN_PLAYER_COLORS = ['#ef6481', '#5586ef', '#20ae91', '#c48819']

export const BUGA_TOWN_NEIGHBORHOODS = [
  { id: 'cakes', name: 'שכונת העוגות', emoji: '🧁', color: '#ee83aa', background: '#fff0f6' },
  { id: 'icecream', name: 'שכונת הגלידות', emoji: '🍦', color: '#41bdaa', background: '#e9faf5' },
  { id: 'candy', name: 'שכונת הממתקים', emoji: '🍭', color: '#b592eb', background: '#f4edff' },
  { id: 'space', name: 'שכונת החלל', emoji: '🚀', color: '#62a9ec', background: '#edf6ff' },
]

export const BUGA_TOWN_PROPERTIES = [
  { id: 'cupcake', neighborhoodId: 'cakes', name: 'בית הקאפקייק', emoji: '🧁', price: 40, rent: 10 },
  { id: 'birthday-cake', neighborhoodId: 'cakes', name: 'ארמון העוגות', emoji: '🎂', price: 45, rent: 12 },
  { id: 'cookie', neighborhoodId: 'cakes', name: 'גן העוגיות', emoji: '🍪', price: 50, rent: 14 },
  { id: 'donut', neighborhoodId: 'cakes', name: 'כיכר הדונאט', emoji: '🍩', price: 55, rent: 16 },
  { id: 'scoop', neighborhoodId: 'icecream', name: 'גבעת הגלידה', emoji: '🍦', price: 45, rent: 12 },
  { id: 'icepop', neighborhoodId: 'icecream', name: 'פארק הארטיקים', emoji: '🍧', price: 50, rent: 14 },
  { id: 'sundae', neighborhoodId: 'icecream', name: 'אגם הסאנדיי', emoji: '🍨', price: 55, rent: 16 },
  { id: 'snow', neighborhoodId: 'icecream', name: 'טירת השלג', emoji: '❄️', price: 60, rent: 18 },
  { id: 'lollipop', neighborhoodId: 'candy', name: 'יער הסוכריות', emoji: '🍭', price: 50, rent: 14 },
  { id: 'chocolate', neighborhoodId: 'candy', name: 'מפעל השוקולד', emoji: '🍫', price: 55, rent: 16 },
  { id: 'candy-cloud', neighborhoodId: 'candy', name: 'ענן המרשמלו', emoji: '☁️', price: 60, rent: 18 },
  { id: 'candy-castle', neighborhoodId: 'candy', name: 'ממלכת הממתקים', emoji: '🍬', price: 65, rent: 20 },
  { id: 'rocket', neighborhoodId: 'space', name: 'תחנת הטילים', emoji: '🚀', price: 55, rent: 16 },
  { id: 'moon', neighborhoodId: 'space', name: 'מלון הירח', emoji: '🌙', price: 60, rent: 18 },
  { id: 'planet', neighborhoodId: 'space', name: 'פארק הכוכבים', emoji: '🪐', price: 65, rent: 20 },
  { id: 'observatory', neighborhoodId: 'space', name: 'מצפה הגלקסיה', emoji: '🔭', price: 70, rent: 22 },
]

const propertyTiles = (neighborhoodId) => BUGA_TOWN_PROPERTIES.filter((p) => p.neighborhoodId === neighborhoodId).map((p) => ({ type: 'property', propertyId: p.id }))

export const BUGA_TOWN_BOARD = [
  { type: 'start', label: 'יוצאים לדרך', emoji: '🏁', text: 'בכל הקפה מקבלים 60 מטבעות — גם כשנוחתים בדיוק כאן.' },
  ...propertyTiles('cakes'),
  { type: 'chance', label: 'הפתעה!', emoji: '🎁' },
  { type: 'bonus', label: 'פיקניק בפארק', emoji: '🌳', amount: 30 },
  ...propertyTiles('icecream'),
  { type: 'pay', label: 'מתקנים בעיר', emoji: '🛠️', amount: 20 },
  { type: 'bonus', label: 'חגיגת בוגה', emoji: '🎈', amount: 40 },
  ...propertyTiles('candy'),
  { type: 'chance', label: 'קלף מזל', emoji: '✨' },
  { type: 'rest', label: 'רגע לנוח', emoji: '🌴' },
  ...propertyTiles('space'),
  { type: 'bonus', label: 'מצאנו אוצר', emoji: '💎', amount: 25 },
]

export const BUGA_TOWN_CHANCE_CARDS = [
  { title: 'מסיבה מוצלחת!', text: 'ארגנתם חגיגה וקיבלתם 35 מטבעות.', coins: 35 },
  { title: 'מתנה מחבר', text: 'חבר שלח לכם 25 מטבעות.', coins: 25 },
  { title: 'זכיתם בתחרות!', text: 'הפרס שלכם: 40 מטבעות.', coins: 40 },
  { title: 'שיפוץ קטן', text: 'משלמים עד 15 מטבעות לתיקון בעיר.', coins: -15 },
  { title: 'פיקניק לכולם', text: 'משלמים עד 10 מטבעות על כיבוד.', coins: -10 },
  { title: 'יום של מזל', text: 'מצאתם 20 מטבעות בכיכר.', coins: 20 },
]

export const townPropertyMap = Object.fromEntries(BUGA_TOWN_PROPERTIES.map((property) => [property.id, property]))

// The board itself is LTR: bottom-right, left, up, right, down is clockwise.
export function townBoardPosition(index) {
  if (index <= 6) return { gridColumn: 7 - index, gridRow: 7 }
  if (index <= 11) return { gridColumn: 1, gridRow: 13 - index }
  if (index <= 18) return { gridColumn: index - 11, gridRow: 1 }
  return { gridColumn: 7, gridRow: index - 17 }
}

export function createTownGame(setup) {
  return {
    version: 2,
    players: setup.slice(0, 4).map((player, index) => ({ id: `player-${index}`, name: player.name.trim() || `שחקן ${index + 1}`, avatar: player.avatar, coins: TOWN_STARTING_COINS, position: 0, properties: [] })),
    currentPlayerIndex: 0, dice: [1, 1], phase: 'ready', movesRemaining: 0, movesTotal: 0,
    turns: 0, pendingPropertyId: null, winners: [], chanceIndex: 0,
    message: 'בוחרים דמות, זורקים קוביות ובונים שכונה. הראשון עם 5 נכסים מנצח!',
    news: ['כל שחקן קיבל 200 מטבעות. העיר פתוחה!'],
  }
}

export function townNetWorth(player) {
  return player.coins + player.properties.reduce((total, id) => total + townPropertyMap[id].price, 0)
}

export function townRent(property, owner) {
  const neighborhood = BUGA_TOWN_PROPERTIES.filter((item) => item.neighborhoodId === property.neighborhoodId)
  return property.rent * (neighborhood.every((item) => owner.properties.includes(item.id)) ? 2 : 1)
}

function withMessage(state, message) {
  return { ...state, message, news: [message, ...state.news].slice(0, 6) }
}

function resolveLanding(state) {
  const player = state.players[state.currentPlayerIndex]
  const tile = BUGA_TOWN_BOARD[player.position]
  let next = { ...state, phase: 'result' }
  if (tile.type === 'property') {
    const property = townPropertyMap[tile.propertyId]
    const owner = state.players.find((item) => item.properties.includes(property.id))
    if (!owner) {
      if (player.coins < property.price) return withMessage(next, `אין כרגע מספיק מטבעות לקניית ${property.name}. אפשר להמשיך לתור הבא.`)
      return { ...next, phase: 'purchase', pendingPropertyId: property.id, message: `${property.name} פנוי! קונים או שומרים את המטבעות להמשך?` }
    }
    if (owner.id === player.id) return withMessage(next, `ברוכים הבאים אל ${property.name} שלכם. אין תשלום!`)
    const rent = Math.min(townRent(property, owner), player.coins)
    next.players = state.players.map((item) => item.id === player.id ? { ...item, coins: item.coins - rent } : item.id === owner.id ? { ...item, coins: item.coins + rent } : item)
    return withMessage(next, `${player.name} ביקר אצל ${owner.name} ושילם ${rent} מטבעות שכירות על ${property.name}.`)
  }
  if (tile.type === 'bonus' || tile.type === 'pay' || tile.type === 'chance') {
    const card = BUGA_TOWN_CHANCE_CARDS[state.chanceIndex % BUGA_TOWN_CHANCE_CARDS.length]
    const amount = tile.type === 'chance' ? card.coins : tile.type === 'pay' ? -tile.amount : tile.amount
    const actual = Math.max(-player.coins, amount)
    next.players = state.players.map((item) => item.id === player.id ? { ...item, coins: item.coins + actual } : item)
    return withMessage(next, tile.type === 'chance' ? `${card.title} ${card.text}` : actual < 0 ? `${tile.label}: ${player.name} שילם ${-actual} מטבעות.` : `${tile.label}: ${player.name} קיבל ${actual} מטבעות!`)
  }
  return withMessage(next, tile.type === 'start' ? `${player.name} השלים הקפה וקיבל 60 מטבעות!` : `${player.name} נח בצל. התור עובר הלאה, בלי תשלום.`)
}

export function townReducer(state, action) {
  if (action.type === 'NEW_GAME') return createTownGame(action.setup)
  if (action.type === 'ROLL' && state.phase === 'ready') {
    if (!Array.isArray(action.dice) || action.dice.length !== 2 || action.dice.some((value) => !Number.isInteger(value) || value < 1 || value > 6)) return state
    const moves = action.dice[0] + action.dice[1]
    return { ...state, dice: action.dice, phase: 'moving', movesRemaining: moves, movesTotal: moves, chanceIndex: action.chanceIndex || 0, message: `יצא ${moves}! מתקדמים עם כיוון השעון…` }
  }
  if (action.type === 'STEP' && state.phase === 'moving') {
    const players = state.players.map((player, index) => {
      if (index !== state.currentPlayerIndex) return player
      const position = (player.position + 1) % BUGA_TOWN_BOARD.length
      return { ...player, position, coins: player.coins + (position === 0 ? TOWN_LAP_BONUS : 0) }
    })
    const next = { ...state, players, movesRemaining: state.movesRemaining - 1 }
    return next.movesRemaining === 0 ? resolveLanding(next) : next
  }
  if ((action.type === 'BUY' || action.type === 'SKIP') && state.phase === 'purchase') {
    const property = townPropertyMap[state.pendingPropertyId]
    const player = state.players[state.currentPlayerIndex]
    const next = { ...state, phase: 'result', pendingPropertyId: null }
    if (action.type === 'SKIP') return withMessage(next, `${player.name} ויתר על הקנייה ושמר את המטבעות להמשך.`)
    if (!property || player.coins < property.price || state.players.some((item) => item.properties.includes(property.id))) return state
    const buyer = { ...player, coins: player.coins - property.price, properties: [...player.properties, property.id] }
    next.players = state.players.map((item) => item.id === buyer.id ? buyer : item)
    if (buyer.properties.length >= TOWN_PROPERTY_GOAL) return withMessage({ ...next, phase: 'finished', winners: [buyer.id] }, `${buyer.name} אסף 5 נכסים וניצח בבוגה טאון!`)
    return withMessage(next, `${buyer.name} קנה את ${property.name}! עוד ${TOWN_PROPERTY_GOAL - buyer.properties.length} נכסים לניצחון.`)
  }
  if (action.type === 'NEXT' && state.phase === 'result') {
    const turns = state.turns + 1
    if (turns >= TOWN_ROUND_LIMIT * state.players.length) {
      const best = Math.max(...state.players.map(townNetWorth))
      const winners = state.players.filter((player) => townNetWorth(player) === best)
      return withMessage({ ...state, turns, phase: 'finished', winners: winners.map((player) => player.id) }, `${TOWN_ROUND_LIMIT} סיבובים הסתיימו! ${winners.map((player) => player.name).join(' ו')} ${winners.length > 1 ? 'ניצחו יחד' : 'ניצח'} עם שווי של ${best} מטבעות.`)
    }
    return { ...state, turns, phase: 'ready', currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length, message: 'התור שלכם! זורקים ומתקדמים עם כיוון השעון.' }
  }
  return state
}
