import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Badge from '../../components/ui/Badge'
import WobblyButton from '../../components/ui/WobblyButton'
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
  return [...options].sort(() => Math.random() - 0.5)
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
  const currentPlayer = players[currentPlayerIndex]

  const ownedBy = useMemo(() => {
    const owners = {}
    players.forEach((player) => player.properties.forEach((propertyId) => { owners[propertyId] = player }))
    return owners
  }, [players])

  function addNews(text) {
    setNews((items) => [text, ...items].slice(0, 8))
  }

  function startGame() {
    const cleanNames = setupNames.filter((name) => name.trim()).slice(0, 4)
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
      updatePlayer(player.id, (p) => ({ ...p, coins: p.coins + 30 }))
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
      const question = BUGA_TOWN_QUESTIONS[Math.floor(Math.random() * BUGA_TOWN_QUESTIONS.length)]
      setPendingQuestion({ playerId: player.id, generalQuestion: question, options: shuffleOptions(question.options) })
      setMessage(`${player.name} הגיע לשאלת דרך. תשובה נכונה נותנת 20 מטבעות.`)
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
        setMessage(`🏆 ${player.name} ניצח בבוגהטאון!`)
      } else {
        nextTurn(`${player.name} הגיע למרכז, אבל צריך 200 מטבעות, 4 נכסים או 5 בונוסים כדי לנצח.`)
      }
    }
  }

  function rollDice() {
    if (pendingQuestion) return
    const roll = [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]
    const steps = roll[0] + roll[1]
    setDice(roll)

    const player = players[currentPlayerIndex]
    const nextPosition = (player.position + steps) % BUGA_TOWN_BOARD.length
    const passedStart = player.position + steps >= BUGA_TOWN_BOARD.length
    const movedPlayer = { ...player, position: nextPosition, coins: passedStart ? player.coins + 30 : player.coins }

    setPlayers((list) => list.map((p) => p.id === player.id ? movedPlayer : p))
    setTimeout(() => handleTile(movedPlayer, BUGA_TOWN_BOARD[nextPosition]), 150)
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
        addNews(`🧠 ${player.name} ענה נכון על שאלת דרך וקיבל 20 מטבעות.`)
        setMessage(`${player.name} ענה נכון וקיבל 20 מטבעות.`)
      }
    } else {
      setMessage(`לא נכון. התשובה הייתה: ${correctAnswer}. התור עובר הלאה.`)
    }

    setPendingQuestion(null)
    setCurrentPlayerIndex((index) => (index + 1) % players.length)
  }

  return (
    <div className="min-h-[calc(100vh-84px)] bg-gradient-to-b from-[var(--postit)]/40 via-[var(--paper)] to-[var(--paper)] px-3 py-4 buga-fade-in sm:px-5">
      <SEO title="בוגהטאון" description="משחק בעלות נכסים מקורי של עוגה בוגה: קוביות, שאלות, נכסים, קלפים וחדשות משחק." path="/tools/buga-town" />

      <div className="mx-auto mb-4 flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-hand text-sm text-[var(--muted-foreground)]">משחק לוח חי</p>
          <h1 className="text-3xl sm:text-5xl">🏙️ בוגהטאון</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge color="yellow">2-4 שחקנים</Badge>
          <Badge color="blue">24 משבצות</Badge>
          <Badge color="green">8 נכסים</Badge>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-4 xl:grid-cols-[270px_minmax(760px,1fr)_310px]">
        <aside className="order-2 grid gap-4 xl:order-1">
          <section className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow-rich">
            <h2 className="mb-3 text-2xl">שחקנים</h2>
            <div className="grid gap-3">
              {players.map((player, index) => (
                <div key={player.id} className={`rounded-2xl border-2 border-[var(--border)] bg-white p-3 ${index === currentPlayerIndex ? 'sketch-shadow-sm ring-4 ring-[var(--accent)]/20' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <strong>{PLAYER_DOTS[index]} {player.name}</strong>
                    {index === currentPlayerIndex && <Badge color="red">תור</Badge>}
                  </div>
                  <div className="mt-2 text-sm">💰 {player.coins} · 🏙️ {player.properties.length} · ⭐ {player.bonuses}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-rich">
            <h2 className="mb-3 text-2xl">משחק חדש</h2>
            <div className="grid gap-2">
              {setupNames.map((name, index) => (
                <input key={index} value={name} onChange={(event) => setSetupNames((names) => names.map((item, i) => i === index ? event.target.value : item))} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2" placeholder={`שם שחקן ${index + 1}`} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {setupNames.length < 4 && <button onClick={() => setSetupNames((names) => [...names, `שחקן ${names.length + 1}`])} className="font-bold text-[var(--pen)]">+ הוסף שחקן</button>}
              {setupNames.length > 2 && <button onClick={() => setSetupNames((names) => names.slice(0, -1))} className="font-bold text-[var(--accent)]">הסר שחקן</button>}
            </div>
            <div className="mt-4"><WobblyButton variant="secondary" onClick={startGame}>התחילו מחדש</WobblyButton></div>
          </section>
        </aside>

        <main className="order-1 xl:order-2">
          <section className="relative min-h-[720px] rounded-[2rem] border-[4px] border-[var(--border)] bg-[#fdf7df] p-3 sketch-shadow-rich sm:p-5">
            <div className="absolute inset-5 rounded-[1.5rem] border-2 border-dashed border-[var(--border)]/30" />
            <div className="relative grid min-h-[680px] grid-cols-7 grid-rows-7 gap-2">
              <div className="col-start-2 col-span-5 row-start-2 row-span-5 flex flex-col items-center justify-center rounded-[2rem] border-[4px] border-[var(--border)] bg-[var(--card)] p-5 text-center sketch-shadow-rich">
                <div className="text-6xl">🏙️</div>
                <h2 className="mt-2 text-4xl">מרכז בוגהטאון</h2>
                <p className="mt-2 max-w-md text-[var(--ink)]/70">קנו נכסים, צברו בונוסים או הגיעו לכאן עם מספיק מטבעות כדי לנצח.</p>
                <div className="mt-5 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] px-6 py-4 font-display text-4xl sketch-shadow-sm">🎲 {dice[0]} + {dice[1]}</div>
                <div className="mt-5 max-w-xl rounded-2xl border-2 border-[var(--border)] bg-white p-4 font-hand text-xl sketch-shadow-sm">{message}</div>
                {!pendingQuestion && <div className="mt-5"><WobblyButton onClick={rollDice}>זרקו קוביות 🎲</WobblyButton></div>}
              </div>

              {BUGA_TOWN_BOARD.map((tile, index) => {
                const property = tile.propertyId ? propertyMap[tile.propertyId] : null
                const owner = property ? ownedBy[property.id] : null
                const ownerIndex = owner ? players.findIndex((player) => player.id === owner.id) : -1
                const playersHere = players.filter((player) => player.position === index)
                return (
                  <button type="button" key={index} style={boardPosition(index)} className={`relative rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-rotate-1 hover:scale-[1.02] ${index === currentPlayer?.position ? 'ring-4 ring-[var(--accent)]' : ''}`}>
                    <div className="text-3xl">{property?.emoji || tile.emoji}</div>
                    <div className="mt-1 text-xs font-bold leading-tight sm:text-sm">{property?.name || tile.label}</div>
                    {property && <div className="text-[11px] text-[var(--muted-foreground)]">קנייה {property.price} · שכירות {property.rent}</div>}
                    {owner && <div className="mt-1 rounded-full bg-[var(--postit)] px-2 py-0.5 text-[11px] font-bold">{PLAYER_DOTS[ownerIndex]} {owner.name}</div>}
                    <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1">
                      {playersHere.map((player) => <span key={player.id} title={player.name} className={`h-5 w-5 rounded-full border-2 border-[var(--ink)] ${PLAYER_COLORS[players.findIndex((p) => p.id === player.id) % PLAYER_COLORS.length]}`} />)}
                    </div>
                  </button>
                )
              })}
            </div>

            {pendingQuestion && (
              <div className="absolute inset-x-4 bottom-4 z-10 rounded-[2rem] border-[3px] border-[var(--border)] bg-white p-5 sketch-shadow-rich sm:inset-x-12">
                <h3 className="text-2xl">שאלה לפני שממשיכים</h3>
                <p className="mt-2 text-lg">{pendingQuestion.propertyId ? propertyMap[pendingQuestion.propertyId].question : pendingQuestion.generalQuestion.question}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {pendingQuestion.options.map((option) => (
                    <button key={option} onClick={() => answerQuestion(option)} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-3 font-bold">{option}</button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>

        <aside className="order-3 grid gap-4">
          <section className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow-rich">
            <h2 className="mb-3 text-2xl">חדשות בלייב 🔴</h2>
            <div className="grid gap-2 text-sm">
              {news.map((item, index) => <div key={index} className="rounded-xl bg-[var(--postit)] px-3 py-2">{item}</div>)}
            </div>
          </section>

          <section className="wobbly border-2 border-[var(--border)] bg-white p-4 sketch-shadow-rich">
            <h2 className="mb-3 text-2xl">נכסים בעיר</h2>
            <div className="grid gap-2 text-sm">
              {BUGA_TOWN_PROPERTIES.map((property) => {
                const owner = ownedBy[property.id]
                return <div key={property.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"><span>{property.emoji} {property.name}</span><strong>{owner ? owner.name : `${property.price} מטבעות`}</strong></div>
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
