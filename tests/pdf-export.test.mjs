import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { buildPdf, pdfUnicode, pdfVisualText } from '../src/utils/pdfWriter.js'

const fontDir = new URL('../public/fonts/pdf/', import.meta.url)
const textFont = { bytes: fs.readFileSync(new URL('NotoSansHebrew-Regular.ttf', fontDir)), metrics: JSON.parse(fs.readFileSync(new URL('metrics.json', fontDir))) }
test('PDF Unicode includes Hebrew and supplementary characters without truncation', () => {
  assert.equal(pdfUnicode('אב🧩'), '<FEFF05d005d1d83edde9>')
  assert.equal(pdfVisualText('בדיקת עברית', 'rtl'), 'תירבע תקידב')
  assert.ok(pdfVisualText('שלום 🧩 English 123', 'rtl').includes('🧩'))
  assert.ok(pdfVisualText('שלום ugabuga.co.il', 'rtl').includes('ugabuga.co.il'))
})
test('PDF pages retain image bytes, valid object offsets, tagged hierarchy and Unicode font', () => {
  const jpeg = Uint8Array.of(255, 216, 255, 217)
  const pdf = buildPdf([{ bytes: jpeg, width: 794, height: 1123, textBlocks: [{ text: 'שלום English', tag: 'H1', x: 10, y: 20, width: 100 }] }, { bytes: jpeg, width: 794, height: 1123 }], { textFont, title: 'בדיקה' })
  const raw = Buffer.from(pdf).toString('latin1')
  assert.match(raw, /\/Count 2/)
  assert.match(raw, /\/MarkInfo << \/Marked true >>/)
  assert.match(raw, /\/ToUnicode \d+ 0 R/)
  assert.match(raw, /\/FontFile2 \d+ 0 R/)
  assert.match(raw, /\/S \/H1/)
  assert.equal(raw.match(/\/Filter \/DCTDecode/g).length, 2)
  const xref = Number(raw.match(/startxref\n(\d+)/)[1])
  assert.equal(raw.slice(xref, xref + 4), 'xref')
  const entries = raw.slice(xref).split('\n').slice(3).filter(line => /^\d{10} 00000 n/.test(line))
  entries.forEach((line, i) => assert.ok(raw.slice(Number(line.slice(0, 10))).startsWith(`${i + 1} 0 obj\n`)))
})
test('PDF fails clearly when its text font is missing or page data is invalid', () => {
  assert.throws(() => buildPdf([{ width: 1, height: 1, bytes: Uint8Array.of(1), textBlocks: [{ text: 'שלום' }] }]), /font is required/)
  assert.throws(() => buildPdf([{ width: 0, height: 1, bytes: Uint8Array.of(1) }]), /Invalid PDF page/)
})
