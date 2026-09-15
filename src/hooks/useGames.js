import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

let cachedGames = null

export function useGames() {
  const [games, setGames] = useState(cachedGames || [])
  const [loading, setLoading] = useState(!cachedGames)

  useEffect(() => {
    if (cachedGames) return
    supabase
      .from('games')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error(error); setLoading(false); return }
        // Sort: engines first, then games, then activities
        const rank = t => t === 'GAME_ENGINE' ? 0 : t === 'GAME' ? 1 : 2
        const sorted = (data || []).sort((a, b) => rank(a.content_type) - rank(b.content_type))
        cachedGames = sorted
        setGames(sorted)
        setLoading(false)
      })
  }, [])

  return { games, loading }
}

export function useGameBySlug(slug) {
  const [game, setGame] = useState(null)
  const [related, setRelated] = useState([])
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      supabase.from('games').select('*').eq('slug', slug).eq('status', 'active').maybeSingle(),
      supabase.from('game_content').select('*').eq('game_slug', slug).order('pack_name').order('sort_order'),
    ]).then(([gameRes, contentRes]) => {
      if (gameRes.data) {
        setGame(gameRes.data)
        // Fetch related
        supabase.from('games').select('*').eq('status', 'active').neq('id', gameRes.data.id).limit(20)
          .then(({ data: rel }) => {
            const scored = (rel || []).map(g => ({
              game: g,
              score: (g.category === gameRes.data.category ? 3 : 0) +
                g.goals.filter(x => gameRes.data.goals.includes(x)).length +
                g.contexts.filter(x => gameRes.data.contexts.includes(x)).length,
            })).sort((a, b) => b.score - a.score).slice(0, 4).map(x => x.game)
            setRelated(scored)
          })
      }
      setContent(contentRes.data || [])
      setLoading(false)
    })
  }, [slug])

  return { game, related, content, loading }
}
