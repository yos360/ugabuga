import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { games as localGames } from '../data/games'

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

export function useGames() {
  const [games, setGames] = useState(cachedGames || [])
  const [loading, setLoading] = useState(!cachedGames)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cachedGames) return
    supabase
      .from('games')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('Supabase error:', error); setError(error.message); const sorted = [...localGames.map(withDifficulty), { slug: 'buga-town', name: 'בוגהטאון', content_type: 'GAME_ENGINE', category: 'משחקי לוח', min_age: 8, min_players: 2, max_players: 4, duration_min: 20, duration_max: 40, equipment: 'מסך', equipment_needed: true, short_description: 'משחק עיר, נכסים, קוביות ושאלות — בנו את בוגהטאון שלכם.', tags: ['בוגהטאון', 'קוביות', 'נכסים'], goals: ['להצחיק', 'למלא זמן'], contexts: ['משפחה', 'כיתה', 'ערב חברים'] }].map(withDifficulty).sort((a, b) => (a.content_type || '').localeCompare(b.content_type || '')); cachedGames = sorted; setGames(sorted); setLoading(false); return }
        const rank = t => t === 'GAME_ENGINE' ? 0 : t === 'GAME' ? 1 : 2
        const townGame = { slug: 'buga-town', name: 'בוגהטאון', content_type: 'GAME_ENGINE', category: 'משחקי לוח', min_age: 8, min_players: 2, max_players: 4, duration_min: 20, duration_max: 40, equipment: 'מסך', equipment_needed: true, short_description: 'משחק עיר, נכסים, קוביות ושאלות — בנו את בוגהטאון שלכם.', tags: ['בוגהטאון', 'קוביות', 'נכסים'], goals: ['להצחיק', 'למלא זמן'], contexts: ['משפחה', 'כיתה', 'ערב חברים'] }
        const source = [...(data || []), ...BUILT_IN_GAMES].map(withDifficulty).filter((game, index, list) => list.findIndex((item) => item.slug === game.slug) === index)
        const sorted = [...source].sort((a, b) => rank(a.content_type) - rank(b.content_type))
        cachedGames = sorted
        setGames(sorted)
        setLoading(false)
      })
      .catch(err => { console.error('Fetch exception:', err); setError(String(err)); const fallback = BUILT_IN_GAMES.map(withDifficulty); cachedGames = fallback; setGames(fallback); setLoading(false) })
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
    Promise.all([
      supabase.from('games').select('*').eq('slug', slug).eq('status', 'active').maybeSingle(),
      supabase.from('game_content').select('*').eq('game_slug', slug).order('pack_name').order('sort_order'),
    ]).then(([gameRes, contentRes]) => {
      if (gameRes.error) setError(gameRes.error.message)
      if (gameRes.data) {
        setGame(gameRes.data)
        supabase.from('games').select('*').eq('status', 'active').neq('id', gameRes.data.id).limit(20)
          .then(({ data: rel }) => {
            const scored = (rel || []).map(g => ({
              game: g,
              score: (g.category === gameRes.data.category ? 3 : 0) +
                (g.goals||[]).filter(x => (gameRes.data.goals||[]).includes(x)).length +
                (g.contexts||[]).filter(x => (gameRes.data.contexts||[]).includes(x)).length,
            })).sort((a, b) => b.score - a.score).slice(0, 4).map(x => x.game)
            setRelated(scored)
          })
      }
      // Database unreachable or game not there: fall back to the built-in copy if we have one.
      if (!gameRes.data) { const local = BUILT_IN_GAMES.find(g => g.slug === slug); if (local) setGame(withDifficulty(local)) }
      setContent(contentRes.data || [])
      setLoading(false)
    }).catch(err => {
      const local = BUILT_IN_GAMES.find(g => g.slug === slug)
      if (local) setGame(withDifficulty(local)); else setError(String(err))
      setLoading(false)
    })
  }, [slug])

  return { game, related, content, loading, error }
}
