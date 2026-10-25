import { defineConfig } from 'vite'
import travelAssets from './scripts/travelAssets.js'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), travelAssets()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
