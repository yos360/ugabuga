import { defineConfig } from 'vite'
import travelAssets from './scripts/travelAssets.js'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'node:child_process'

// Last real edit of the article data files (from git), shown as "updated" on guides and posts.
// Empty when git history is unavailable — pages then show no date rather than a made-up one.
function lastEdited(...files) {
  try { return execSync(`git log -1 --format=%cs -- ${files.join(' ')}`, { encoding: 'utf8' }).trim() } catch { return '' }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), travelAssets()],
  define: {
    __GUIDES_UPDATED__: JSON.stringify(lastEdited('src/data/guides.js', 'src/data/guidesDeep.js')),
  },
  // Agents' git worktrees live under .claude/worktrees — whole copies of the site that the dev server
  // and tests must not watch (they slowed the SSR test past its 60s timeout).
  server: { watch: { ignored: ['**/.claude/**'] } },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
