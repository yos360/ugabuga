import { defineConfig } from 'vite'
import travelAssets from './scripts/travelAssets.js'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), travelAssets()],
  // Agents' git worktrees live under .claude/worktrees — whole copies of the site that the dev server
  // and tests must not watch (they slowed the SSR test past its 60s timeout).
  server: { watch: { ignored: ['**/.claude/**'] } },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
