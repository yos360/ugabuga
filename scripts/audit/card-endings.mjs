// Run with AUDIT_BASE/CHROME_PATH: node scripts/audit/card-endings.mjs
// Bounded follow-up of three slower games; partial results remain explicit.
process.env.AUDIT_GAME_FILTER='^(battleship|solitaire|spider-solitaire)$'
process.env.AUDIT_GAME_OUTPUT='out/audit/game-endings-extra.json'
await import('./game-endings.mjs')
