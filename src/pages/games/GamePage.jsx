import { useParams, Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { useGameBySlug, useGames } from '../../hooks/useGames'
import GamePlayer from '../../components/games/GamePlayer'
import Markdown from '../../components/ui/Markdown'
import { useState } from 'react'
import { gameHref } from '../../data/gameHref'
import PrintPreview from '../../components/ui/PrintPreview'
import { CATEGORIES, CLASS_PAGES } from '../../data/gameCategories'
import { hubOrder } from '../../data/gameHubs'

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']
const PLAY_TOOL_ROUTES = {
  'buga-bingo': { to: '/tools/bingo-maker', label: 'צרו כרטיסיות' },
  'al-ktze-halashon': { to: '/tools/emoji-studio', label: 'שחקו עכשיו באימוג׳ים' },
  'hidat-haemojim': { to: '/tools/emoji-studio', label: 'שחקו עכשיו באימוג׳ים' },
  'buga-trivia': { to: '/tools/trivia-quiz', label: 'פתחו טריוויה' },
  'hafes-umtza': { to: '/tools/scavenger-hunt-maker', label: 'צרו ציד אוצרות' },
  'galgal-hamisimot': { to: '/tools/random-picker', label: 'פתחו גלגל' },
  'etgar-hakvutzot': { to: '/tools/team-generator', label: 'חלקו לקבוצות' },
  'mi-bakvutza-sheli': { to: '/tools/team-generator', label: 'חלקו לקבוצות' },
}
const MISSING_GAME_LINKS = [
  { to: '/tools', label: '🛠️ כל הכלים' },
  { to: '/tools/trivia-quiz', label: '🎯 טריוויה' },
  { to: '/tools/buga-town', label: '🏙️ בוגה טאון' },
  { to: '/tools/bingo-maker', label: '🎟️ בינגו' },
  { to: '/tools/riddles', label: '🧩 חידות' },
  { to: '/tools/escape-rooms', label: '🔐 חדרי בריחה' },
]

// The quick-start box ("בקצרה") is usually a trimmed copy of the first steps of the full rules.
// On paper that only repeats itself and pushes the sheet onto a second page, so skip it there.
const words = t => (t || '').replace(/[#*_`>[\]()'"״׳.,:!?;—–-]/g, ' ').split(/\s+/).filter(w => w.length > 1)
function quickDuplicatesRules(quick, full) {
  const q = words(quick), f = new Set(words(full))
  if (!q.length) return true
  return q.filter(w => f.has(w)).length / q.length >= 0.5
}

// The numbered steps of "## מהלך המשחק" (or "## איך משחקים"), as plain text — used for the HowTo schema.
function howToSteps(instructions) {
  const lines = String(instructions || '').split('\n')
  const numbered = list => list.filter(l => /^\s*\d+[.)]\s/.test(l)).map(l => l.replace(/^\s*\d+[.)]\s*/, '').replace(/\*\*|__|`/g, '').trim()).filter(Boolean)
  const start = lines.findIndex(l => /^##\s*(מהלך המשחק|איך משחקים)/.test(l))
  if (start >= 0) {
    const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l))
    const steps = numbered(lines.slice(start + 1, end < 0 ? undefined : end))
    if (steps.length >= 2) return steps
  }
  return numbered(lines)
}

const range = (min, max, unit) => (max && min && max !== min ? `${min}–${max} ${unit}` : `${min || max} ${unit}`)
const CONTEXT_HUBS = { 'יום הולדת': '/games/birthday', 'כיתה': '/games/classroom', 'משפחה': '/games/family', 'צהרון': '/games/afterschool', 'ערב חברים': '/games/friends-evening', 'גן': '/games/kindergarten' }
const CONTEXT_HUB_PATHS = new Set(Object.values(CONTEXT_HUBS))
const GRADE_BY_AGE = { 6: 'kita-a', 7: 'kita-b', 8: 'kita-g', 9: 'kita-d', 10: 'kita-h' }
// Tags too common to say two games are alike.
const GENERIC_TAGS = new Set(['בלי ציוד', 'ללא ציוד', 'קלאסיקה', 'קלאסי', 'פשוט', 'מהיר', 'ציוד פשוט'])

// "משחקים דומים": games that share this game's category, tags and goals, at a similar age. Ties are broken
// per game (hubOrder), so the same few games don't show up under every page.
function similarGames(game, all, count = 4) {
  const tags = (game.tags || []).filter(t => !GENERIC_TAGS.has(t))
  const score = g => (g.category === game.category ? 3 : 0)
    + (g.tags || []).filter(t => tags.includes(t)).length * 2
    + (g.goals || []).filter(v => (game.goals || []).includes(v)).length
    + (g.contexts || []).filter(v => (game.contexts || []).includes(v)).length * 0.5
    - Math.abs(Number(g.min_age || 0) - Number(game.min_age || 0)) * 0.5
  const others = all.filter(g => g.slug && g.slug !== game.slug && gameHref(g.slug).startsWith('/games/'))
  return hubOrder(others, game.slug, score).slice(0, count)
}

// Hub pages this game appears on: its age page, its grade page (classroom games) and the most specific
// category pages whose filter it passes (smallest categories first).
function hubLinks(game, all) {
  const age = Math.min(10, Math.max(4, Number(game.min_age || 4)))
  const links = [{ href: `/games/age/${age}`, label: `משחקים לגיל ${age}` }]
  const grade = GRADE_BY_AGE[Math.min(10, Math.max(6, Number(game.min_age || 6)))]
  if ((game.contexts || []).includes('כיתה') && grade) links.push({ href: `/games/${grade}`, label: `משחקים ל${CLASS_PAGES[grade].breadcrumb}` })
  const cats = Object.entries(CATEGORIES)
    .filter(([slug, c]) => !CONTEXT_HUB_PATHS.has(`/games/${slug}`) && c.filter(game))
    .map(([slug, c]) => ({ href: `/games/${slug}`, label: c.title.split(' — ')[0], size: all.filter(c.filter).length }))
    .sort((a, b) => a.size - b.size).slice(0, 3)
  return [...links, ...cats]
}

// A few real items from the game's card deck (game-content/<slug>.json), one pack after another.
function contentSample(content, count = 6) {
  const items = content.filter(c => c.content_type !== 'complication' && c.content_text)
  const packs = [...new Set(items.map(c => c.pack_name))]
  const out = []
  for (let i = 0; out.length < count && i < items.length; i++) {
    for (const p of packs) {
      const item = items.filter(c => c.pack_name === p)[i]
      if (item && out.length < count) out.push(item.content_text)
    }
  }
  return out
}

export default function GamePage() {
  const { slug } = useParams()
  const { game, related, content, loading } = useGameBySlug(slug)
  const [playing, setPlaying] = useState(false)
  const [rating, setRating] = useState(0)
  const [printingRules, setPrintingRules] = useState(false)
  const playToolRoute = PLAY_TOOL_ROUTES[slug]
  const { games: allGames } = useGames()
  const navigate = useNavigate()
  // "תנו לי משחק אחר": jump straight to a random other game (the full list is already cached by useGames)
  const randomGame = () => {
    const others = allGames.filter(g => g.slug && g.slug !== slug && gameHref(g.slug).startsWith('/games/'))
    if (!others.length) return navigate('/games')
    navigate(gameHref(others[Math.floor(Math.random() * others.length)].slug))
  }

  const shareGame = () => {
    const text = `${game.name} — ${game.short_description || 'משחק לילדים'}\nהוראות ומשחק בחינם בעוגה בוגה: https://ugabuga.co.il/games/${slug}?utm_source=whatsapp&utm_medium=share&utm_campaign=game`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  // SEO description: short_description alone is often <100 chars. Enrich with the
  // first sentence(s) of the instructions (markdown stripped) up to 120-160 chars.
  const seoDescription = (() => {
    let d = (game?.short_description || '').trim().replace(/[.،]+$/, '')
    if (d) d += '.'
    const plain = (game?.instructions || '')
      .replace(/[#*_`>\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim()
    for (const s of plain.split(/(?<=\.)\s+/)) {
      if (d.length >= 120) break
      if (d.length + s.length + 1 > 160) break
      d += (d ? ' ' : '') + s
    }
    const suffix = ' משחק חינם לילדים בעוגה בוגה.'
    if (d.length < 120 || d.length + suffix.length <= 160) d += suffix
    if (d.length > 160) {
      const cut = d.slice(0, 159)
      d = cut.slice(0, cut.lastIndexOf(' ')) + '…'
    }
    return d
  })()

  const steps = howToSteps(game?.instructions)
  const similar = game ? (allGames.length ? similarGames(game, allGames) : related) : []
  const hubs = game ? hubLinks(game, allGames) : []
  const sample = contentSample(content)

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><span className="text-5xl buga-bounce">🎂</span></div>
  if (!game) return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center buga-fade-in">
      <SEO title="המשחק עבר מקום" description="בחרו משחק או כלי פעיל בעוגה בוגה." path="/games" noindex />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'משחק לא נמצא' }]} />
      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-8 sketch-shadow-rich">
        <div className="text-6xl mb-3">🎮</div>
        <h1 className="text-4xl mb-3">המשחק לא נמצא</h1>
        <p className="mx-auto max-w-xl text-lg text-[var(--foreground)]/75 mb-6">
          יכול להיות שזה קישור ישן או משחק שעדיין לא חובר למאגר. בינתיים אפשר להגיע מכאן לכל המשחקים והכלים הפעילים.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Link to="/games" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--accent)] px-5 py-2 font-display text-lg font-bold text-[var(--accent-foreground)]">כל המשחקים</Link>
          <Link to="/tools" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--postit)] px-5 py-2 font-display text-lg font-bold">כל הכלים</Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {MISSING_GAME_LINKS.map(item => (
            <Link key={item.to} to={item.to} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-hand text-lg underline decoration-dashed hover:bg-[var(--postit)]">{item.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in">
      <SEO title={game.name} description={seoDescription} path={'/games/' + slug} structuredData={[{
        '@context': 'https://schema.org',
        '@type': 'Game',
        'name': game.name,
        'description': game.short_description,
        'url': 'https://ugabuga.co.il/games/' + slug,
        'inLanguage': 'he',
        'isAccessibleForFree': true,
        ...(game.category ? { 'genre': game.category } : {}),
        ...(game.min_age ? { 'typicalAgeRange': game.max_age ? `${game.min_age}-${game.max_age}` : `${game.min_age}-` } : {}),
        ...(game.min_players ? { 'numberOfPlayers': { '@type': 'QuantitativeValue', 'minValue': game.min_players, ...(game.max_players ? { 'maxValue': game.max_players } : {}) } } : {}),
        'publisher': { '@type': 'Organization', 'name': 'UGABUGA', 'url': 'https://ugabuga.co.il' },
      }, steps.length >= 2 ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': `איך משחקים ${game.name}`,
        'description': game.short_description,
        'inLanguage': 'he',
        ...(Number(game.duration_max || game.duration_min) ? { 'totalTime': `PT${Number(game.duration_max || game.duration_min)}M` } : {}),
        ...(game.equipment_needed && game.equipment ? { 'supply': [{ '@type': 'HowToSupply', 'name': game.equipment }] } : {}),
        'step': steps.map((text, i) => ({ '@type': 'HowToStep', 'position': i + 1, 'text': text })),
      } : null].filter(Boolean)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: game.name }]} />

      <div className="flex flex-wrap items-center gap-2 text-sm font-hand text-[var(--muted-foreground)] mb-2">
        <span>{game.content_type === 'GAME_ENGINE' ? 'משחק אינטראקטיבי' : game.content_type === 'GAME' ? 'משחק' : 'פעילות'}</span>
        {game.category && <><span>·</span><span>{game.category}</span></>}
      </div>

      <h1 className="text-4xl sm:text-5xl mb-4">{game.name}</h1>

      {game.quick_instructions && (
        <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow tape mb-6">
          <h2 className="text-2xl mb-3">מתחילים לשחק</h2>
          <Markdown text={game.quick_instructions} className="font-hand text-lg" />
          <div className="mt-4 flex flex-wrap gap-3">
            {playToolRoute ? (
              <Link to={playToolRoute.to} className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[#4caf50] px-5 py-2 font-display text-lg font-bold text-white">▶️ {playToolRoute.label}</Link>
            ) : (
              content.length > 0
                ? <button onClick={() => setPlaying(true)} className="wobbly-md sketch-press min-h-[44px] border-[3px] border-[var(--border)] bg-[#4caf50] px-5 py-2 font-display text-lg font-bold text-white cursor-pointer">▶️ שחקו עכשיו</button>
                // No on-screen deck for this game: point to the full instructions instead of a dead, greyed-out button.
                : <a href="#game-instructions" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[#4caf50] px-5 py-2 font-display text-lg font-bold text-white">📖 איך משחקים</a>
            )}
            <button onClick={shareGame} className="wobbly-md sketch-press min-h-[44px] border-[3px] border-[var(--border)] bg-[#25D366] px-5 py-2 font-display text-lg font-bold text-white cursor-pointer">📱 שלחו בוואטסאפ</button>
            <button data-print-main type="button" onClick={() => setPrintingRules(true)} className="wobbly-md sketch-press min-h-[44px] border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display text-lg font-bold cursor-pointer">🖨️ הדפסת הוראות</button>
            <button type="button" onClick={randomGame} className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display text-lg font-bold cursor-pointer">🎲 תנו לי משחק אחר</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge>{game.max_age ? <>גילאי <bdi dir="ltr">{game.min_age}-{game.max_age}</bdi></> : `גיל ${game.min_age}+`}</Badge>
        <Badge color="yellow">{game.duration_max ? <><bdi dir="ltr">{game.duration_min}-{game.duration_max}</bdi> דק׳</> : `${game.duration_min} דק׳`}</Badge>
        <Badge>{game.max_players ? `${game.min_players}-${game.max_players} משתתפים` : `${game.min_players}+ משתתפים`}</Badge>
        <Badge color={game.equipment_needed ? 'default' : 'blue'}>{game.equipment_needed ? game.equipment : 'בלי ציוד'}</Badge>
        <Badge>{game.energy_level === 'high' ? '⚡ תנועה מלאה' : game.energy_level === 'low' ? '😌 רגוע' : '🔄 בינוני'}</Badge>
        <Badge>{game.noise_level === 'high' ? '📢 רועש' : game.noise_level === 'low' ? '🤫 שקט' : '🔉 רעש בינוני'}</Badge>
      </div>

      <p className="text-xl leading-relaxed mb-6">{game.short_description}</p>

      <section className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-5 mb-8" aria-labelledby="game-facts">
        <h2 id="game-facts" className="text-xl mb-2">לפני שמתחילים</h2>
        <ul className="space-y-1 text-lg leading-relaxed">
          <li><b>גיל:</b> {game.max_age && game.max_age < 99 ? <>גילאי <bdi dir="ltr">{game.min_age}-{game.max_age}</bdi></> : `מגיל ${game.min_age}`}{game.age_adaptations ? ' — עם התאמות לגילאים שונים בהמשך העמוד' : ''}</li>
          <li><b>משתתפים:</b> {game.max_players ? <bdi>{range(game.min_players, game.max_players, '')}</bdi> : `${game.min_players} ומעלה`}</li>
          {Number(game.duration_min || game.duration_max) > 0 && <li><b>זמן משחק:</b> <bdi>{range(game.duration_min, game.duration_max, 'דקות')}</bdi></li>}
          <li><b>ציוד:</b> {game.equipment_needed && game.equipment ? game.equipment : 'לא צריך ציוד בכלל'}</li>
          {(game.locations || []).length > 0 && <li><b>איפה משחקים:</b> {game.locations.join(', ')}</li>}
          {(game.contexts || []).length > 0 && <li><b>מתאים במיוחד ל:</b> {game.contexts.map((c, i) => <span key={c}>{i > 0 && ', '}{CONTEXT_HUBS[c] ? <Link to={CONTEXT_HUBS[c]} className="underline decoration-dashed">{c}</Link> : c}</span>)}</li>}
        </ul>
      </section>

      {printingRules && <PrintPreview title={`הוראות: ${game.name}`} onClose={() => setPrintingRules(false)}><article className="buga-flow">
        <h2 style={{ fontSize: 30, margin: '0 0 6px' }}>{game.name}</h2>
        <p style={{ margin: '0 0 12px', fontSize: 15 }}>{game.max_age ? `גילאי ${game.min_age}–${game.max_age}` : `גיל ${game.min_age}+`} · {game.duration_max ? `${game.duration_min}–${game.duration_max}` : game.duration_min} דק׳ · {game.max_players ? `${game.min_players}–${game.max_players}` : `${game.min_players}+`} משתתפים · {game.equipment_needed ? game.equipment : 'בלי ציוד'}</p>
        {game.short_description && <p style={{ fontSize: 17, margin: '0 0 12px' }}>{game.short_description}</p>}
        {game.quick_instructions && !quickDuplicatesRules(game.quick_instructions, game.instructions) && <><h3 style={{ fontSize: 20, margin: '8px 0 4px' }}>בקצרה</h3><Markdown text={game.quick_instructions} /></>}
        <h3 style={{ fontSize: 20, margin: '12px 0 4px' }}>הוראות מלאות</h3>
        <Markdown text={game.instructions} />
        {game.facilitator_tip && <><h3 style={{ fontSize: 18, margin: '12px 0 4px' }}>💡 טיפ למנחה</h3><p>{game.facilitator_tip}</p></>}
        {game.age_adaptations && <><h3 style={{ fontSize: 18, margin: '12px 0 4px' }}>🎯 התאמות גיל</h3><Markdown text={game.age_adaptations} /></>}
        {game.safety_notes && <><h3 style={{ fontSize: 18, margin: '12px 0 4px' }}>⚠️ בטיחות</h3><p>{game.safety_notes}</p></>}
        <footer>עוגה בוגה · ugabuga.co.il{gameHref(slug)}</footer>
      </article></PrintPreview>}

      <div id="game-instructions" className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow mb-6 scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">📖 הוראות מלאות ועוד</h2>{/* One print button per page: the one next to "שחקו עכשיו" when that box exists. */}{!game.quick_instructions && <button data-print-main type="button" onClick={() => setPrintingRules(true)} className="rounded-xl border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">🖨️ הדפסת ההוראות</button>}</div>
        <Markdown text={game.instructions} className="font-hebrew text-lg leading-relaxed" />
      </div>

      {sample.length > 0 && (
        <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 mb-6">
          <h2 className="text-xl mb-2">🃏 דוגמאות מתוך המשחק</h2>
          <ul className="list-disc space-y-1 pr-5 font-hand text-lg">
            {sample.map(text => <li key={text}>{text}</li>)}
          </ul>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{content.length > sample.length ? `ועוד ${content.length - sample.length} פריטים במשחק עצמו.` : ''}</p>
        </div>
      )}

      {game.facilitator_tip && (
        <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow pin mb-6">
          <h2 className="text-xl mb-2">💡 טיפ למנחה</h2>
          <p className="font-hand text-lg">{game.facilitator_tip}</p>
        </div>
      )}

      {game.age_adaptations && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-5 mb-6">
          <h2 className="text-xl mb-2">🎯 התאמות גיל</h2>
          <Markdown text={game.age_adaptations} className="font-hand text-lg" />
        </div>
      )}

      {game.large_group_variant && (
        <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 mb-6">
          <h2 className="text-xl mb-2">👥 בקבוצה גדולה</h2>
          <Markdown text={game.large_group_variant} className="font-hand text-lg" />
        </div>
      )}

      {game.buga_twist && (
        <div className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5 mb-6">
          <h2 className="text-xl mb-2">✨ הטוויסט של BUGA</h2>
          <Markdown text={game.buga_twist} className="font-hand text-lg" />
        </div>
      )}

      {game.safety_notes && (
        <div className="wobbly border-2 border-[var(--accent)] bg-[var(--card)] p-5 mb-6">
          <h2 className="text-xl mb-2">⚠️ בטיחות</h2>
          <p className="font-hand text-lg">{game.safety_notes}</p>
        </div>
      )}

      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow text-center mb-8">
        <p className="text-xl mb-3">היה לכם כיף?</p>
        <div className="flex justify-center gap-3 text-3xl" role="radiogroup" aria-label="דרגו את המשחק">{[1,2,3,4,5].map(n => <button key={n} type="button" role="radio" aria-checked={rating===n} aria-label={`${n} מתוך 5`} onClick={() => setRating(n)} className={`transition-transform hover:scale-125 cursor-pointer ${rating && n > rating ? 'opacity-30 grayscale' : ''}`}>🎂</button>)}</div>
        <p className="text-sm text-[var(--muted-foreground)] mt-2" role="status">{rating ? (rating >= 4 ? 'איזה כיף! 🎉 ספרו לחברים — כפתור הוואטסאפ למעלה' : 'תודה! יש לכם רעיון לשיפור? כתבו לנו בוואטסאפ בתחתית העמוד') : 'לחצו על העוגות כדי לדרג'}</p>
      </div>

      {similar.length > 0 && (
        <div>
          <h2 className="text-2xl mb-4">משחקים דומים</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {similar.map((g, i) => (
              <Link key={g.slug || g.id} to={gameHref(g.slug)}
                className={`wobbly-md flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow transition-all duration-150 hover:-translate-y-1 ${rotations[i % rotations.length]}`}>
                <h3 className="text-xl font-bold truncate">{g.name}</h3>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1">{g.short_description}</p>
                <span className="mt-2 font-display text-base font-bold text-[var(--pen)] underline decoration-dashed">למשחק ←</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {hubs.length > 0 && (
        <nav aria-label="עוד משחקים בנושא" className="mt-6 flex flex-wrap items-center gap-2">
          <span className="font-bold">עוד משחקים כאלה:</span>
          {hubs.map(h => <Link key={h.href} to={h.href} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold hover:bg-[var(--muted)]/30">{h.label}</Link>)}
        </nav>
      )}

      {playing && <GamePlayer content={content} title={game.name} slug={slug} instructions={game.instructions} onClose={() => setPlaying(false)} />}
    </div>
  )
}
