// Recorded audio (public/audio/**/*.mp3) is served from its own R2 bucket at audio.ugabuga.co.il:
// Cloudflare Pages allows 20,000 files per deploy, and the ~4,500 clips would push the site over it.
// The production build strips the .mp3 files from dist (scripts/strip-audio.mjs); the index.json
// lists stay on the site. In development (and in node tests) the files are served locally.
// New clips must be uploaded before pushing: node scripts/upload-audio.mjs (a test checks this).
export const AUDIO_ORIGIN = 'https://audio.ugabuga.co.il'
export const audioUrl = path => (import.meta.env?.PROD ? AUDIO_ORIGIN : '') + path
