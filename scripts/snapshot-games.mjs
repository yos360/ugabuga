import { writeFile, readFile } from 'node:fs/promises'
// (snapshot refreshed daily; also runs on changes to this file)

// Saves a copy of all active games + their content packs from the games database into
// public/data/games-snapshot.json. The site falls back to this file whenever the database
// can't be reached, so the games pages keep working during an outage.
// Run by .github/workflows/snapshot-games.yml (daily) — it never overwrites a good snapshot with a bad one.
const URL_ = 'https://judhoitufvlqxjhjgnsm.supabase.co/rest/v1'
const KEY = 'sb_publishable_4PcGG69NOxDcTf52pnptPg_XROLhWaj'
const OUT = new URL('../public/data/games-snapshot.json', import.meta.url)

async function all(table, query) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${URL_}/${table}?${query}`, { headers: { apikey: KEY, Range: `${from}-${from + 999}` } })
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`)
    const page = await res.json()
    rows.push(...page)
    if (page.length < 1000) return rows
  }
}

try {
  const games = await all('games', 'select=*&status=eq.active&order=updated_at.desc')
  const content = await all('game_content', 'select=*&order=game_slug,pack_name,sort_order')
  let prev = 0
  try { prev = JSON.parse(await readFile(OUT, 'utf8')).games.length } catch { /* first run */ }
  if (games.length < 20 || games.length < prev * 0.7) throw new Error(`suspicious game count ${games.length} (previous ${prev}) – keeping old snapshot`)
  await writeFile(OUT, JSON.stringify({ games, content }))
  console.log(`snapshot-games: saved ${games.length} games, ${content.length} content rows`)
} catch (err) {
  console.warn(`snapshot-games: skipped – ${err.message}`)
}
