import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pageLink, shareLink } from '../src/utils/share.js'

test('copy link: the plain page address, without utm or hash', () => {
  assert.equal(pageLink('/learn/multiplication-game?x=1#top'), 'https://ugabuga.co.il/learn/multiplication-game')
  assert.equal(pageLink(''), 'https://ugabuga.co.il/')
  assert.match(shareLink('/learn/multiplication-game', 'floating'), /\?utm_source=whatsapp&utm_medium=share&utm_campaign=floating$/)
  const menu = readFileSync(new URL('../src/components/layout/WhatsAppShare.jsx', import.meta.url), 'utf8')
  assert.match(menu, /writeText\(pageLink\(pathname\)\)/)
})
