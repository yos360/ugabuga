// Writes the ready-made 3D print files (binary STL) to public/3d/models/.
// Run: node scripts/print3d/build-models.mjs   (re-run after changing src/print3d/geometry.js)
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { makeFont, dreidelModel, hanukkiahModel, cookieCutterModel, starOfDavidPoints, nameModel, toSTL, sizeOf } from '../../src/print3d/geometry.js'

const font = makeFont(JSON.parse(await readFile(new URL('../../public/fonts/3d/noto-hebrew-800.typeface.json', import.meta.url), 'utf8')))
const out = new URL('../../public/3d/models/', import.meta.url)
await mkdir(out, { recursive: true })

const models = {
  'dreidel-pe': dreidelModel(font, ['נ', 'ג', 'ה', 'פ']),
  'dreidel-shin': dreidelModel(font, ['נ', 'ג', 'ה', 'ש']),
  'hanukkiah': hanukkiahModel(font),
  'star-of-david-cutter': cookieCutterModel(starOfDavidPoints(36)),
  'buga-keychain': (({ base, text }) => [base, text])(nameModel(font, 'עוגה בוגה', 'keychain')),
}

for (const [name, geo] of Object.entries(models)) {
  const dv = toSTL(geo)
  await writeFile(new URL(`${name}.stl`, out), Buffer.from(dv.buffer, dv.byteOffset, dv.byteLength))
  console.log(name, sizeOf(geo), `${(dv.byteLength / 1024).toFixed(0)} KB`)
}
