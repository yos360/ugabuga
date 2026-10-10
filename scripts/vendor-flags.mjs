// Copies the flag SVGs used by /flags from the flag-icons package (MIT) into public/flag-svg/.
// Usage: npm pack flag-icons@7.5.0 && tar xzf flag-icons-7.5.0.tgz && node scripts/vendor-flags.mjs <path-to>/package
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { WORLD_COUNTRIES } from '../src/flags/flagsData.js'

const pkg = process.argv[2]
if (!pkg) { console.error('usage: node scripts/vendor-flags.mjs <flag-icons package dir>'); process.exit(1) }
const out = new URL('../public/flag-svg/', import.meta.url).pathname
mkdirSync(out, { recursive: true })
for (const { code } of WORLD_COUNTRIES) copyFileSync(join(pkg, 'flags/4x3', `${code}.svg`), join(out, `${code}.svg`))
const { version } = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'))
writeFileSync(join(out, 'LICENSE.txt'), `Flag artwork from flag-icons ${version} (https://github.com/lipis/flag-icons)\n\n${readFileSync(join(pkg, 'LICENSE'), 'utf8')}`)
console.log(`copied ${WORLD_COUNTRIES.length} flags`)
