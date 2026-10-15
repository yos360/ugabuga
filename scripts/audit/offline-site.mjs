import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, extname, sep } from 'node:path'

// Browser QA can serve the built site from disk when the runner cannot use loopback.
export function offlineSiteResponse(url, directory = 'dist') {
  const root = resolve(directory)
  let file = resolve(root, '.' + decodeURIComponent(new URL(url).pathname))
  if (file !== root && !file.startsWith(root + sep)) throw new Error('Path outside site')
  if (!existsSync(file) || !statSync(file).isFile()) file = resolve(root, 'index.html')
  const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.xml':'application/xml' }
  return { status: 200, contentType: types[extname(file)] || 'application/octet-stream', body: readFileSync(file) }
}
