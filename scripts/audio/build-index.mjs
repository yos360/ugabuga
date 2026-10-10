// Writes public/audio/<lang>/index.json — the list of recorded clip keys speak() may play.
// Run after adding or removing clips: node scripts/audio/build-index.mjs
import { readdir, writeFile } from 'node:fs/promises'
const root = new URL('../../public/audio/', import.meta.url)
for (const lang of await readdir(root, { withFileTypes: true })) {
  if (!lang.isDirectory()) continue
  const keys = (await readdir(new URL(lang.name + '/', root))).filter(f => /^[0-9a-f]{8}\.mp3$/.test(f)).map(f => f.slice(0, 8)).sort()
  await writeFile(new URL(lang.name + '/index.json', root), JSON.stringify(keys))
  console.log(`audio/${lang.name}: ${keys.length} clips`)
}
