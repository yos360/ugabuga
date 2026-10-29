import test from 'node:test'
import assert from 'node:assert/strict'
import { isUuidPath, isInAppBrowser, isAndroid, isIos, chromeIntentUrl, EXPIRED_PDF_PATH } from '../src/utils/pdfLink.js'
import { signalPath } from '../src/utils/liveActivity.js'

const ID = 'e037bde2-1534-4de2-8b4d-16f6747bdde0'
test('uuid path detection', () => {
  assert.equal(isUuidPath('/' + ID), true)
  assert.equal(isUuidPath('/' + ID + '/'), true)
  assert.equal(isUuidPath('/' + ID.toUpperCase() + '?x=1'), true)
  assert.equal(isUuidPath('/tools/' + ID), false)
  assert.equal(isUuidPath('/tools/dice'), false)
  assert.equal(isUuidPath(''), false)
})
test('analytics maps every /<uuid> to one path', () => {
  assert.equal(signalPath('/' + ID), EXPIRED_PDF_PATH)
  assert.equal(signalPath('/aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb'), EXPIRED_PDF_PATH)
})
test('in-app browser detection', () => {
  assert.equal(isInAppBrowser('Mozilla/5.0 (Linux; Android 13; wv) AppleWebKit Chrome/120 Mobile Safari/537.36'), true)
  assert.equal(isInAppBrowser('Mozilla/5.0 (iPhone) AppleWebKit [FBAN/FBIOS;FBAV/400]'), true)
  assert.equal(isInAppBrowser('Mozilla/5.0 (iPhone) Instagram 300'), true)
  assert.equal(isInAppBrowser('Mozilla/5.0 (Windows NT 10.0) Chrome/120 Safari/537.36'), false)
  assert.equal(isInAppBrowser(undefined), false)
  assert.equal(isAndroid('Mozilla/5.0 (Linux; Android 13)'), true)
  assert.equal(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 17)'), true)
})
test('chrome intent url', () => {
  const u = chromeIntentUrl('https://ugabuga.co.il/printables/mazes?a=1#x')
  assert.ok(u.startsWith('intent://ugabuga.co.il/printables/mazes?a=1#Intent;scheme=https;package=com.android.chrome;'))
  assert.ok(u.includes('S.browser_fallback_url=https%3A%2F%2Fugabuga.co.il%2Fprintables%2Fmazes%3Fa%3D1;end'))
  assert.equal(chromeIntentUrl('blob:https://ugabuga.co.il/' + ID), null)
  assert.equal(chromeIntentUrl('nonsense'), null)
})
