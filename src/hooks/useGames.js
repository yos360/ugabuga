import { useState, useEffect } from 'react'
import { games as localGames } from '../data/games'

// All games live in the site itself: public/data/games.json (the list) and
// public/data/game-content/<slug>.json (each game's content packs). No external database.

const BUILT_IN_GAMES = [...localGames, { slug: 'buga-town', name: 'בוגהטאון', content_type: 'GAME_ENGINE', category: 'משחקי לוח', min_age: 8, min_players: 2, max_players: 4, duration_min: 20, duration_max: 40, equipment: 'מסך', equipment_needed: true, short_description: 'משחק עיר, נכסים, קוביות ושאלות — בנו את בוגהטאון שלכם.', tags: ['בוגהטאון', 'קוביות', 'נכסים'], goals: ['להצחיק', 'למלא זמן'], contexts: ['משפחה', 'כיתה', 'ערב חברים'] }]

function withDifficulty(game) {
  if (game.difficulty) return game
  const duration = Number(game.duration_max || game.duration_min || 10)
  const age = Number(game.min_age || 0)
  const players = Number(game.max_players || 0)
  const difficulty = duration >= 25 || age >= 12 || players >= 30 ? 'hard' : duration >= 15 || age >= 8 ? 'medium' : 'easy'
  return { ...game, difficulty }
}

let cachedGames = null
let listPromise = null
const loadList = () => (listPromise ||= fetch('/data/games.json').then(r => (r.ok ? r.json() : [])).catch(() => { listPromise = null; return [] }))
const rank = t => t === 'GAME_ENGINE' ? 0 : t === 'GAME' ? 1 : 2
const finish = rows => [...(rows || []).filter(g => g.status === 'active'), ...BUILT_IN_GAMES].map(withDifficulty)
  .filter((game, index, list) => list.findIndex(item => item.slug === game.slug) === index)
  .sort((a, b) => rank(a.content_type) - rank(b.content_type) || String(b.updated_at || '').localeCompare(String(a.updated_at || '')))

export function useGames() {
  const [games, setGames] = useState(cachedGames || [])
  const [loading, setLoading] = useState(!cachedGames)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cachedGames) return
    let alive = true
    loadList().then(rows => {
      const list = finish(rows)
      if (rows.length) cachedGames = list
      if (!alive) return
      setGames(list)
      if (!rows.length) setError('offline')
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  return { games, loading, error }
}

export function useGameBySlug(slug) {
  const [game, setGame] = useState(null)
  const [related, setRelated] = useState([])
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    let alive = true
    setLoading(true)
    Promise.all([
      loadList(),
      fetch(`/data/game-content/${encodeURIComponent(slug)}.json`).then(r => (r.ok && (r.headers.get('content-type') || '').includes('json') ? r.json() : [])).catch(() => []),
    ]).then(([rows, packs]) => {
      if (!alive) return
      const all = finish(rows)
      const g = all.find(x => x.slug === slug)
      if (!g) { setError('not found'); setGame(null); setLoading(false); return }
      setGame(g)
      setContent([...packs].sort((a, b) => String(a.pack_name).localeCompare(String(b.pack_name)) || (a.sort_order || 0) - (b.sort_order || 0)))
      setRelated(all.filter(x => x.slug !== g.slug).map(x => ({
        game: x,
        score: (x.category === g.category ? 3 : 0) + (x.goals || []).filter(v => (g.goals || []).includes(v)).length + (x.contexts || []).filter(v => (g.contexts || []).includes(v)).length,
      })).sort((a, b) => b.score - a.score).slice(0, 4).map(x => x.game))
      setLoading(false)
    })
    return () => { alive = false }
  }, [slug])

  return { game, related, content, loading, error }
}
