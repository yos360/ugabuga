import { useEffect, useMemo, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import './BugaTown.css'
import { createGameNews } from '../../data/liveNews'
import {
  BUGA_TOWN_BOARD,
  BUGA_TOWN_CHANCE_CARDS,
  BUGA_TOWN_PROPERTIES,
  BUGA_TOWN_QUESTIONS,
} from '../../data/bugaTown'

const STARTING_COINS = 200
const PLAYER_COLORS = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-300']
const PLAYER_DOTS = ['🔴', '🔵', '🟢', '🟡']

function shuffleOptions(options) {
  const shuffled = [...options]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function makePlayers(names) {
  return names.map((name, index) => ({
    id: 'player-' + index,
    name: name.trim() || `שחקן ${index + 1}`,
    position: 0,
    coins: STARTING_COINS,
    properties: [],
    bonuses: 0,
  }))
}

function boardPosition(index) {
  if (index < 7) return { gridColumn: `${index + 1} / span 1`, gridRow: '1 / span 1' }
  if (index < 12) return { gridColumn: '7 / span 1', gridRow: `${index - 5} / span 1` }
  if (index < 19) return { gridColumn: `${19 - index} / span 1`, gridRow: '7 / span 1' }
  return { gridColumn: '1 / span 1', gridRow: `${25 - index} / span 1` }
}

const propertyMap = Object.fromEntries(BUGA_TOWN_PROPERTIES.map((property) => [property.id, property]))

export default function BugaTown() {
  const [setupNames, setSetupNames] = useState(['שחקן 1', 'שחקן 2'])
  const [players, setPlayers] = useState(() => makePlayers(['שחקן 1', 'שחקן 2']))
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [dice, setDice] = useState([1, 1])
  const [message, setMessage] = useState('ברוכים הבאים לבוגהטאון! זרקו קוביות, קנו נכסים וענו נכון על שאלות כדי לבנות עיר משלכם.')
  const [pendingQuestion, setPendingQuestion] = useState(null)
  const [news, setNews] = useState([
    '🏙️ עיר חדשה נפתחה בבוגהטאון — מי יבנה את האימפריה הראשונה?',
    '🎲 הקוביות מוכנות, הבנק פתוח והנכסים מחכים לבעלים.',
  ])
  const [rolling, setRolling] = useState(false)
  const [winner, setWinner] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [selectedTile, setSelectedTile] = useState(null)
  const [showSetup, setShowSetup] = useState(false)
  const rollLock = useRef(false)
  const rollTimer = useRef(null)
  const currentPlayer = players[currentPlayerIndex]
  useEffect(() => () => clearTimeout(rollTimer.current), [])
  useEffect(() => {
    if (!expanded) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const escape = (event) => { if (event.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', escape)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', escape)
    }
  }, [expanded])

  const ownedBy = useMemo(() => {
    const owners = {}
    players.forEach((player) => player.properties.forEach((propertyId) => { owners[propertyId] = player }))
    return owners
  }, [players])

  function addNews(text) {
    setNews((items) => [text, ...items].slice(0, 8))
  }

  function startGame() {
    clearTimeout(rollTimer.current)
    rollLock.current = false
    setRolling(false)
    setWinner(null)
    setSelectedTile(null)
    setShowSetup(false)
    const cleanNames = setupNames.map((name, index) => name.trim() || `שחקן ${index + 1}`).slice(0, 4)
    setPlayers(makePlayers(cleanNames.length ? cleanNames : ['שחקן 1', 'שחקן 2']))
    setCurrentPlayerIndex(0)
    setDice([1, 1])
    setPendingQuestion(null)
    setMessage('משחק חדש התחיל. המטרה: לקנות נכסים, לצבור בונוסים או להגיע למרכז בוגהטאון עם מספיק מטבעות.')
    setNews(['🏁 משחק חדש בבוגהטאון יצא לדרך!', '🏙️ הבנק חילק 200 מטבעות לכל שחקן.'])
  }

  function updatePlayer(playerId, updater) {
    setPlayers((list) => list.map((player) => player.id === playerId ? updater(player) : player))
  }

  function nextTurn(extraMessage = '') {
    setCurrentPlayerIndex((index) => (index + 1) % players.length)
    if (extraMessage) setMessage(extraMessage)
  }

  function handleTile(player, tile) {
    if (tile.type === 'start') {
      addNews(`🏁 ${player.name} עבר בהתחלה וקיבל 30 מטבעות.`)
      nextTurn(`${player.name} הגיע להתחלה וקיבל 30 מטבעות.`)
      return
    }

    if (tile.type === 'property') {
      const property = propertyMap[tile.propertyId]
      const owner = ownedBy[property.id]

      if (!owner) {
        if (player.coins < property.price) {
          nextTurn(`${player.name} הגיע אל ${property.name}, אבל אין מספיק מטבעות לקנייה.`)
          return
        }
        setPendingQuestion({ playerId: player.id, propertyId: property.id, options: shuffleOptions(property.options) })
        setMessage(`${player.name} יכול לקנות את ${property.name}. קודם צריך לענות נכון על שאלה קצרה.`)
        return
      }

      if (owner.id === player.id) {
        updatePlayer(player.id, (p) => ({ ...p, bonuses: p.bonuses + 1 }))
        addNews(`⭐ ${player.name} חזר לנכס שלו וקיבל בונוס.`)
        nextTurn(`${player.name} הגיע לנכס שלו וקיבל בונוס.`)
        return
      }

      const rent = Math.min(property.rent, player.coins)
      updatePlayer(player.id, (p) => ({ ...p, coins: p.coins - rent }))
      updatePlayer(owner.id, (p) => ({ ...p, coins: p.coins + rent }))
      addNews(createGameNews({ type: 'bugaTown', player: player.name, action: 'rent' }))
      nextTurn(`${player.name} נחת על נכס של ${owner.name} ושילם שכירות.`)
      return
    }

    if (tile.type === 'bonus') {
      updatePlayer(player.id, (p) => ({ ...p, coins: p.coins + tile.amount, bonuses: p.bonuses + 1 }))
      addNews(`⭐ ${player.name} קיבל בונוס ו-${tile.amount} מטבעות.`)
      nextTurn(`${player.name} קיבל בונוס יפה.`)
      return
    }

    if (tile.type === 'pay') {
      updatePlayer(player.id, (p) => ({ ...p, coins: Math.max(0, p.coins - tile.amount) }))
      addNews(`🏦 ${player.name} שילם ${tile.amount} מטבעות לעיר.`)
      nextTurn(`${player.name} שילם לעירייה.`)
      return
    }

    if (tile.type === 'chance') {
      const card = BUGA_TOWN_CHANCE_CARDS[Math.floor(Math.random() * BUGA_TOWN_CHANCE_CARDS.length)]
      updatePlayer(player.id, (p) => ({
        ...p,
        position: typeof card.move === 'number' ? (p.position + card.move + BUGA_TOWN_BOARD.length) % BUGA_TOWN_BOARD.length : p.position,
        coins: Math.max(0, p.coins + (card.coins || 0)),
        bonuses: p.bonuses + (card.bonus || 0),
      }))
      addNews(`🎴 ${player.name} קיבל קלף: ${card.title}.`)
      nextTurn(`${card.title}: ${card.text}`)
      return
    }

    if (tile.type === 'question') {
      updatePlayer(player.id, (p) => ({ ...p, coins: p.coins + 20, bonuses: p.bonuses + 1 }))
      addNews('🎁 ' + player.name + ' קיבל בונוס מעבר על משבצת מיוחדת.')
      nextTurn(player.name + ' קיבל 20 מטבעות ובונוס.')
      return
    }
    if (tile.type === 'freeRoll') {
      addNews(`🎲 ${player.name} קיבל זריקה חופשית.`)
      setMessage(`${player.name} קיבל זריקה חופשית! אפשר לזרוק שוב.`)
      return
    }

    if (tile.type === 'center') {
      if (player.coins >= 200 || player.properties.length >= 4 || player.bonuses >= 5) {
        addNews(createGameNews({ type: 'bugaTown', player: player.name, action: 'win' }))
        setWinner(player)
        setMessage(`🏆 ${player.name} ניצח בבוגהטאון!`)
      } else {
        nextTurn(`${player.name} הגיע למרכז, אבל צריך 200 מטבעות, 4 נכסים או 5 בונוסים כדי לנצח.`)
      }
    }
  }

  function rollDice() {
    if (pendingQuestion || winner || rollLock.current) return
    rollLock.current = true
    setRolling(true)
    setSelectedTile(null)
    const roll = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
    const steps = roll[0] + roll[1]
    setDice(roll)

    const player = players[currentPlayerIndex]
    const nextPosition = (player.position + steps) % BUGA_TOWN_BOARD.length
    const passedStart = player.position + steps >= BUGA_TOWN_BOARD.length
    const movedPlayer = { ...player, position: nextPosition, coins: passedStart ? player.coins + 30 : player.coins }

    setPlayers((list) => list.map((p) => p.id === player.id ? movedPlayer : p))
    rollTimer.current = setTimeout(() => {
      handleTile(movedPlayer, BUGA_TOWN_BOARD[nextPosition])
      rollLock.current = false
      setRolling(false)
    }, 650)
  }

  function answerQuestion(answer) {
    if (!pendingQuestion) return
    const player = players.find((p) => p.id === pendingQuestion.playerId)
    const property = pendingQuestion.propertyId ? propertyMap[pendingQuestion.propertyId] : null
    const correctAnswer = property ? property.answer : pendingQuestion.generalQuestion.answer

    if (answer === correctAnswer) {
      if (property) {
        updatePlayer(player.id, (p) => ({ ...p, coins: p.coins - property.price, properties: [...p.properties, property.id] }))
        addNews(createGameNews({ type: 'bugaTown', player: player.name, action: 'buy', property: property.name }))
        setMessage(`${player.name} ענה נכון וקנה את ${property.name}.`)
      } else {
        updatePlayer(player.id, (p) => ({ ...p, coins: p.coins + 20 }))
        addNews(`🧠 ${player.name} קנה את הנכס והוסיף אותו לעיר.`)
        setMessage(`${player.name} ענה נכון וקיבל 20 מטבעות.`)
      }
    } else {
      setMessage(`לא נכון. התשובה הייתה: ${correctAnswer}. התור עובר הלאה.`)
    }

    setPendingQuestion(null)
    setCurrentPlayerIndex((index) => (index + 1) % players.length)
  }

  const selected = selectedTile === null ? null : BUGA_TOWN_BOARD[selectedTile]
  const selectedProperty = selected?.propertyId ? propertyMap[selected.propertyId] : null
  const question = pendingQuestion
    ? (pendingQuestion.propertyId ? propertyMap[pendingQuestion.propertyId] : pendingQuestion.generalQuestion)
    : null

  return (
    <div className={`town-game ${expanded ? 'town-game--expanded' : ''}`} dir="rtl">
      <SEO title="בוגהטאון — העיר שלכם, המשחק שלכם" description="משחק לוח של קוביות, נכסים ושאלות ל־2–4 שחקנים או קבוצות על אותו מסך." path="/tools/buga-town" />
      <header className="town-header">
        <div><span className="town-eyebrow">עוגה בוגה / משחקי לוח</span><h1>בוגה<span>טאון</span><small>העיר שלכם. המשחק שלכם.</small></h1></div>
        <div className="town-toolbar">
          <span className="town-live"><i />{players.length} שחקנים / קבוצות · מסך משותף</span>
          <button onClick={() => setShowSetup(!showSetup)} aria-expanded={showSetup}>⚙ הגדרת משחק</button>
          <button onClick={() => setExpanded(!expanded)} aria-pressed={expanded}>{expanded ? '↙ יציאה ממסך מלא' : '⛶ מסך מלא'}</button>
        </div>
      </header>

      {showSetup && <section className="town-setup" aria-label="הגדרת משחק">
        <h2>מי בונה איתנו עיר?</h2><p>בחרו 2–4 שחקנים או קבוצות. התחלה מחדש מאפסת את המשחק הנוכחי.</p>
        <div className="town-name-fields">{setupNames.map((name, index) => <label key={index}>שם שחקן או קבוצה {index + 1}<input maxLength={24} value={name} onChange={(event) => setSetupNames((names) => names.map((item, i) => i === index ? event.target.value : item))} /></label>)}</div>
        <div className="town-toolbar">
          {setupNames.length < 4 && <button onClick={() => setSetupNames([...setupNames, `שחקן ${setupNames.length + 1}`])}>+ שחקן / קבוצה</button>}
          {setupNames.length > 2 && <button onClick={() => setSetupNames(setupNames.slice(0, -1))}>הסרת שחקן אחרון</button>}
          <button className="town-primary" onClick={startGame}>התחלת משחק חדש</button>
          <button onClick={() => setShowSetup(false)}>חזרה למשחק</button>
        </div>
      </section>}

      <div className="town-score-strip" aria-label="מצב השחקנים">
        {players.map((player, index) => <article key={player.id} className={`town-player ${index === currentPlayerIndex ? 'town-player--active' : ''}`} style={{'--player-color': ['#ed7064', '#549edb', '#68b986', '#e0b843'][index]}}>
          <div className="town-player-name"><span>{PLAYER_DOTS[index]} {player.name}</span><small>{winner?.id === player.id ? '🏆 המנצח!' : index === currentPlayerIndex ? 'התור שלכם' : 'ממתינים לתור'}</small></div>
          <div className="town-player-stats"><span><b>{player.coins}</b> מטבעות</span><span><b>{player.properties.length}</b> נכסים</span><span><b>{player.bonuses}</b> בונוסים</span></div>
        </article>)}
      </div>

      <div className="town-layout">
        <section className="town-board" aria-label="לוח בוגהטאון — 24 משבצות">
          <div className="town-board-grid">
            <div className="town-center">
              <div className="town-skyline" aria-hidden="true">{[3,5,4,7,5,6,3].map((height, index) => <i key={index} style={{'--height': height, '--building': ['#e6b76b','#8caf96','#83aabe','#cd8a76'][index % 4]}} />)}</div>
              <div className="town-center-content">
                <span className="town-eyebrow">WELCOME TO BUGA TOWN</span>
                <h2>{winner ? 'יש לנו מנצח!' : 'העיר מחכה למהלך שלכם'}</h2>
                {question ? <section className="town-question" aria-label="שאלת התור" aria-live="polite">
                  <span className="town-question-label">{pendingQuestion.propertyId ? `🔑 רוכשים את ${question.name} · ${question.price} מטבעות` : '🧠 שאלת דרך · 20 מטבעות לתשובה נכונה'}</span>
                  <h3>{question.question}</h3>
                  <div className="town-answers">{pendingQuestion.options.map((option, index) => <button key={option} onClick={() => answerQuestion(option)}><span>{index + 1}</span>{option}</button>)}</div>
                </section> : <>
                  <div className="town-turn">{winner ? '🏆 ' + winner.name : PLAYER_DOTS[currentPlayerIndex] + ' התור של ' + currentPlayer.name}</div>
                  <div className={`town-dice ${rolling ? 'town-dice--rolling' : ''}`} aria-label={`תוצאת הקוביות: ${dice[0]} ועוד ${dice[1]}`}>
                    {dice.map((value, index) => <div className="town-die" key={index} aria-hidden="true">{['⚀','⚁','⚂','⚃','⚄','⚅'][value - 1]}</div>)}
                  </div>
                  <p className="town-message" role="status">{message}</p>
                  {winner ? <button className="town-primary town-roll" onClick={() => setShowSetup(true)}>משחק נוסף ↻</button> : <button className="town-primary town-roll" onClick={rollDice} disabled={rolling}>{rolling ? 'הקוביות מתגלגלות…' : 'זורקים קוביות'} <span>🎲</span></button>}
                </>}
                <p className="town-win-rule">🏆 נוחתים על שער למרכז עם 200 מטבעות, 4 נכסים או 5 בונוסים.</p>
              </div>
            </div>
            {BUGA_TOWN_BOARD.map((tile, index) => {
              const property = tile.propertyId ? propertyMap[tile.propertyId] : null
              const owner = property ? ownedBy[property.id] : null
              const ownerIndex = owner ? players.findIndex((player) => player.id === owner.id) : -1
              const playersHere = players.filter((player) => player.position === index)
              return <button type="button" key={index} onClick={() => setSelectedTile(selectedTile === index ? null : index)} style={boardPosition(index)} aria-pressed={selectedTile === index} aria-label={`משבצת ${index + 1}: ${property?.name || tile.label}`} className={`town-tile town-tile--${tile.type} ${playersHere.length ? 'town-tile--occupied' : ''} ${selectedTile === index ? 'town-tile--selected' : ''}`}>
                <span className="town-tile-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="town-tile-emoji">{property?.emoji || tile.emoji}</span>
                <strong>{property?.name || tile.label}</strong>
                <span className="town-tile-price">{owner ? PLAYER_DOTS[ownerIndex] + ' ' + owner.name : property ? property.price + ' 🪙' : tile.type === 'bonus' ? '+' + tile.amount + ' 🪙' : tile.type === 'pay' ? '−' + tile.amount + ' 🪙' : tile.type === 'center' ? 'שער לניצחון' : 'בוגה טאון'}</span>
                <span className="town-pawns">{playersHere.map((player) => <span key={player.id} title={player.name} className={`town-pawn ${PLAYER_COLORS[players.findIndex((p) => p.id === player.id)]}`}>{players.findIndex((p) => p.id === player.id) + 1}</span>)}</span>
              </button>
            })}
          </div>
        </section>

        <aside className="town-sidebar">
          <section className="town-panel town-info">
            <span className="town-eyebrow">{selected ? 'מבט מקרוב' : 'מדריך מהיר'}</span>
            <h2>{selected ? (selectedProperty?.emoji || selected.emoji) + ' ' + (selectedProperty?.name || selected.label) : 'איך בונים אימפריה?'}</h2>
            {selected ? <><p>{selectedProperty ? `קנייה: ${selectedProperty.price} מטבעות ותשובה נכונה. שכירות: ${selectedProperty.rent} מטבעות. ${ownedBy[selectedProperty.id] ? 'בבעלות ' + ownedBy[selectedProperty.id].name : 'הנכס פנוי לרכישה.'}` : selected.text || ({chance:'מגרילים קלף עם הפתעה. קלף תנועה מזיז בלבד ואינו מפעיל את המשבצת שאליה מגיעים.',bonus:`מקבלים ${selected.amount} מטבעות ובונוס אחד.`,pay:`משלמים לעיר עד ${selected.amount} מטבעות, לפי היתרה.`,question:'תשובה נכונה מזכה ב־20 מטבעות.',freeRoll:'אותו שחקן זורק שוב.',center:'נוחתים כאן עם 200 מטבעות, 4 נכסים או 5 בונוסים כדי לנצח.'})[selected.type]}</p><button onClick={() => setSelectedTile(null)}>חזרה להוראות</button></> : <ol><li><b>זורקים ומתקדמים</b><span>שתי קוביות, מסלול אחד והרבה הפתעות.</span></li><li><b>עונים וקונים</b><span>נכס פנוי? ענו נכון וקנו אותו. בנכס של יריב משלמים שכירות.</span></li><li><b>מגיעים לשער ומנצחים</b><span>200 מטבעות או 4 נכסים או 5 בונוסים. כל מעבר בהתחלה נותן 30 מטבעות.</span></li></ol>}
            <p className="town-hint">אפשר ללחוץ על כל משבצת כדי לקרוא עליה.</p>
          </section>
          <section className="town-panel"><div className="town-panel-heading"><h2>מה חדש בעיר?</h2><span className="town-live"><i />מהמשחק</span></div><div className="town-news">{news.slice(0, 4).map((item, index) => <p key={index}>{item}</p>)}</div></section>
          <details className="town-panel town-properties"><summary>🏘 כל הנכסים בעיר ({BUGA_TOWN_PROPERTIES.length})</summary>{BUGA_TOWN_PROPERTIES.map((property) => <div key={property.id}><span>{property.emoji} {property.name}</span><b>{ownedBy[property.id]?.name || property.price + ' 🪙'}</b></div>)}</details>
        </aside>
      </div>
    </div>
  )
}

