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

// Fallback copy of the games database, refreshed daily by scripts/snapshot-games.mjs.
let snapshotPromise = null
const loadSnapshot = () => (snapshotPromise ||= fetch('/data/games-snapshot.json').then(r => (r.ok ? r.json() : null)).catch(() => null))
const rank = t => t === 'GAME_ENGINE' ? 0 : t === 'GAME' ? 1 : 2
const finish = rows => [...(rows || []), ...BUILT_IN_GAMES].map(withDifficulty)
  .filter((game, index, list) => list.findIndex(item => item.slug === game.slug) === index)
  .sort((a, b) => rank(a.content_type) - rank(b.content_type))

const withTimeout = (promise, ms = 4000) => Promise.race([promise, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))])

async function fetchGames() {
  try {
    const { data, error } = await withTimeout(supabase.from('games').select('*').eq('status', 'active').order('updated_at', { ascending: false }))
    if (!error && data?.length) return { rows: data }
    throw new Error(error?.message || 'no data')
  } catch (err) {
    console.warn('games database unreachable, using snapshot', err)
    const snap = await loadSnapshot()
    return snap?.games?.length ? { rows: snap.games } : { rows: [], failed: true }
  }
}

export function useGames() {
  const [games, setGames] = useState(cachedGames || [])
  const [loading, setLoading] = useState(!cachedGames)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cachedGames) return
    let alive = true
    fetchGames().then(({ rows, failed }) => {
      const list = finish(rows)
      if (!failed) cachedGames = list
      if (!alive) return
      setGames(list)
      if (failed) setError('offline')
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
    const pickRelated = (g, pool) => pool.filter(x => x.slug !== g.slug).map(x => ({
      game: x,
      score: (x.category === g.category ? 3 : 0) + (x.goals || []).filter(v => (g.goals || []).includes(v)).length + (x.contexts || []).filter(v => (g.contexts || []).includes(v)).length,
    })).sort((a, b) => b.score - a.score).slice(0, 4).map(x => x.game)
    const fromSnapshot = async () => {
      const snap = await loadSnapshot()
      const g = snap?.games?.find(x => x.slug === slug) || BUILT_IN_GAMES.find(x => x.slug === slug)
      if (!alive) return
      if (g) {
        setGame(withDifficulty(g))
        setContent((snap?.content || []).filter(c => c.game_slug === slug))
        setRelated(pickRelated(g, snap?.games || []))
      } else setError('offline')
      setLoading(false)
    }
    withTimeout(Promise.all([
      supabase.from('games').select('*').eq('slug', slug).eq('status', 'active').maybeSingle(),
      supabase.from('game_content').select('*').eq('game_slug', slug).order('pack_name').order('sort_order'),
    ])).then(([gameRes, contentRes]) => {
      if (!alive) return
      if (!gameRes.data) return fromSnapshot()
      setGame(gameRes.data)
      setContent(contentRes.data || [])
      setLoading(false)
      supabase.from('games').select('*').eq('status', 'active').neq('id', gameRes.data.id).limit(20)
        .then(({ data: rel }) => { if (alive) setRelated(pickRelated(gameRes.data, rel || [])) })
    }).catch(fromSnapshot)
    return () => { alive = false }
  }, [slug])

  return { game, related, content, loading, error }
}
