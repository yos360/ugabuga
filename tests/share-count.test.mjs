// What counts as a share in the owner report
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { isShareUrl } = await import('../src/utils/share.js')
test('share links to anyone count, messages to a fixed number do not', () => {
  for (const u of ['https://wa.me/?text=hi', 'wa.me/?text=x', 'https://api.whatsapp.com/send?text=x', 'whatsapp://send?text=x']) assert.ok(isShareUrl(u), u)
  for (const u of ['https://wa.me/972507772930', 'https://wa.me/972507772930?text=טעות', 'https://api.whatsapp.com/send?phone=972501234567&text=x', 'https://ugabuga.co.il/', '', null]) assert.ok(!isShareUrl(u), String(u))
})
