import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('logic column headings remain accessible SVG text for PDF capture', async () => {
  const server = await createServer({ server: { middlewareMode: true }, logLevel: 'silent' })
  try {
    const { ColumnLabel } = await server.ssrLoadModule('/src/pages/logicPuzzles/LogicBoard.jsx')
    for (const label of ['נועה', 'שעת הגעה', '10:30']) {
      const html = renderToStaticMarkup(createElement(ColumnLabel, null, label))
      assert.ok(html.includes(`aria-label="${label}"`))
      assert.ok(html.includes(`>${label}</text>`))
      assert.match(html, /rotate\(-90\)/)
      assert.doesNotMatch(html, /writing-mode/)
    }
  } finally { await server.close() }
})
