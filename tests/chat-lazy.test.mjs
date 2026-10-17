import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const widget = readFileSync(new URL('../src/components/chat/SiteChatWidget.jsx', import.meta.url), 'utf8')
const db = readFileSync(new URL('../src/utils/siteChatDb.js', import.meta.url), 'utf8')

test('chat widget keeps Supabase out of the page bundle', () => {
  const staticImports = [...widget.matchAll(/^import\s.*?from\s+['"]([^'"]+)['"]/gm)].map(match => match[1])
  assert.ok(!staticImports.some(path => /siteChatDb|supabase|ownerAuth/.test(path)), staticImports.join(', '))
  assert.match(widget, /import\(['"]\.\.\/\.\.\/utils\/siteChatDb['"]\)/)
})

test('missing chat functions surface as chat_unavailable', () => {
  assert.match(db, /PGRST202/)
  assert.match(db, /Could not find the function/)
  assert.match(db, /chat_unavailable: 'הצ\\'אט עוד לא הופעל/)
})
