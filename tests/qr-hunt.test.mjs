import test from 'node:test'
import assert from 'node:assert/strict'
import QRCode from 'qrcode'
import { MAX_CLUE, MAX_STOPS, MAX_TITLE, QR_MAX_BYTES, decodePayload, encodePayload, qrBytes, qrSizeStatus, readStation, stationTokens, stationUrls } from '../src/utils/qrHunt.js'

const origin = 'https://www.ugabuga.co.il'
const longClue = 'ש'.repeat(400)

test('payload round-trips Hebrew and emoji', () => {
  const value = { t: 'ציד האוצר 🗺️', c: 'חפשו ליד המקרר!' }
  const token = encodePayload(value)
  assert.match(token, /^[A-Za-z0-9_-]+$/)
  assert.deepEqual(decodePayload(token), value)
  assert.equal(decodePayload('%%%'), null)
})

test('each station link holds only its own clue', () => {
  const urls = stationUrls(origin, 'ציד', ['ראשון', 'שני', 'שלישי'])
  assert.equal(urls.length, 3)
  const second = readStation(new URL(urls[1]).searchParams)
  assert.deepEqual(second, { title: 'ציד', clue: 'שני', index: 1, total: 3 })
  for (const url of urls) {
    const raw = JSON.stringify(decodePayload(new URL(url).searchParams.get('s')))
    assert.equal([...'ראשון|שני|שלישי'.split('|')].filter(clue => raw.includes(`"${clue}"`)).length, 1)
  }
})

test('old whole-hunt links still open', () => {
  const hunt = encodePayload({ v: 1, title: 'ישן', stops: [{ clue: 'א' }, { clue: 'ב' }] })
  assert.deepEqual(readStation(new URLSearchParams({ hunt, step: '1' })), { title: 'ישן', clue: 'ב', index: 1, total: 2 })
  assert.equal(readStation(new URLSearchParams({ hunt, step: '5' })), null)
  assert.equal(readStation(new URLSearchParams({ s: 'garbage' })), null)
})

test('inputs are clamped and empty clues dropped', () => {
  const clues = [...Array(12)].map((_, i) => i === 3 ? '   ' : longClue)
  const tokens = stationTokens('כ'.repeat(200), clues)
  assert.equal(tokens.length, MAX_STOPS)
  const first = decodePayload(tokens[0])
  assert.equal(first.t.length, MAX_TITLE)
  assert.equal(first.c.length, MAX_CLUE)
})

test('worst-case station link fits comfortably in a QR code', async () => {
  const [url] = stationUrls(origin, 'כ'.repeat(MAX_TITLE), [longClue, longClue])
  assert.ok(qrBytes(url) < QR_MAX_BYTES / 2)
  assert.equal(qrSizeStatus(qrBytes(url)), 'ok')
  await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M' })
})

test('size status flags dense and oversized codes', () => {
  assert.equal(qrSizeStatus(100), 'ok')
  assert.equal(qrSizeStatus(1500), 'dense')
  assert.equal(qrSizeStatus(QR_MAX_BYTES + 1), 'too-big')
})
