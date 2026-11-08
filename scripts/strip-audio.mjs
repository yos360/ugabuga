// Last build step: removes the recorded clips (dist/audio/**/*.mp3) from the deploy. They are served
// from the R2 bucket at audio.ugabuga.co.il (src/utils/audioUrl.js), which keeps the site under
// Cloudflare Pages' 20,000-file limit. The index.json / README files stay.
import { readdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../dist/audio/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
if (!existsSync(root)) process.exit(0)
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])
let n = 0
for (const f of walk(root)) if (f.endsWith('.mp3')) { rmSync(f); n++ }
console.log(`strip-audio: removed ${n} clips from dist (served from audio.ugabuga.co.il)`)
