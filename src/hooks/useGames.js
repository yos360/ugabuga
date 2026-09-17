import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { games as localGames } from '../data/games'

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
        if (error) { console.error('Supabase error:', error); setError(error.message); const sorted = [...localGames, { slug: 'buga-town', name: 'בוגהטאון', content_type: 'GAME_ENGINE', category: 'משחקי לוח', min_age: 8, min_players: 2, max_players: 4, duration_min: 20, duration_max: 40, equipment: 'מסך', equipment_needed: true, short_description: 'משחק עיר, נכסים, קוביות ושאלות — בנו את בוגהטאון שלכם.', tags: ['בוגהטאון', 'קוביות', 'נכסים'], goals: ['להצחיק', 'למלא זמן'], contexts: ['משפחה', 'כיתה', 'ערב חברים'] }].sort((a, b) => (a.content_type || '').localeCompare(b.content_type || '')); cachedGames = sorted; setGames(sorted); setLoading(false); return }
        const rank = t => t === 'GAME_ENGINE' ? 0 : t === 'GAME' ? 1 : 2
        const townGame = { slug: 'buga-town', name: 'בוגהטאון', content_type: 'GAME_ENGINE', category: 'משחקי לוח', min_age: 8, min_players: 2, max_players: 4, duration_min: 20, duration_max: 40, equipment: 'מסך', equipment_needed: true, short_description: 'משחק עיר, נכסים, קוביות ושאלות — בנו את בוגהטאון שלכם.', tags: ['בוגהטאון', 'קוביות', 'נכסים'], goals: ['להצחיק', 'למלא זמן'], contexts: ['משפחה', 'כיתה', 'ערב חברים'] }
        const source = data && data.length ? data : [...localGames, townGame]
        const sorted = [...source].sort((a, b) => rank(a.content_type) - rank(b.content_type))
        cachedGames = sorted
        setGames(sorted)
        setLoading(false)
      })
      .catch(err => { console.error('Fetch exception:', err); setError(String(err)); setLoading(false) })
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
      setContent(contentRes.data || [])
      setLoading(false)
    }).catch(err => { setError(String(err)); setLoading(false) })
  }, [slug])

  return { game, related, content, loading, error }
}
