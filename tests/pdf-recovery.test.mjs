import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pdfId } from '../src/utils/pdfRecovery.js'

const id = '6f1c2a70-3c1e-4d55-9b1a-0a1b2c3d4e5f'

test('a blob link and the dead page it turns into give the same file id', () => {
  assert.equal(pdfId(`blob:https://ugabuga.co.il/${id}`), id)
  assert.equal(pdfId(`/${id}`), id)
  assert.equal(pdfId(`/${id}/`), id)
  assert.equal(pdfId(`/${id.toUpperCase()}?x=1`), id)
})

test('every PDF is kept for the dead page, which offers it back', () => {
  assert.match(readFileSync('src/utils/pagesToPdf.js', 'utf8'), /savePdf\(url, blob, name\)/)
  assert.match(readFileSync('src/pages/NotFound.jsx', 'utf8'), /loadPdf\(pdfId\(pathname\)\)/)
})
