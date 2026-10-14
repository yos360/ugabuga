import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'

// Resolve the real lazy route imports using the build tool. On case-insensitive
// filesystems an extensionless import used to select multiplicationTable.js.
test('multiplication routes resolve to a module exporting their React components', async () => {
  const app = resolve('src/App.jsx')
  const routes = [...readFileSync(app, 'utf8').matchAll(/import\('([^']+)'\)\.then\(m => \(\{ default: m\.(Multiplication\w+) \}\)\)/g)]
  assert.equal(routes.length, 4)
  const server = await createServer({ server: { middlewareMode: true }, logLevel: 'silent' })
  try {
    for (const [, specifier, component] of routes) {
      const result = await server.environments.client.pluginContainer.resolveId(specifier, app)
      assert.ok(result, `${specifier} must resolve`)
      const module = readFileSync(result.id, 'utf8')
      assert.match(module, new RegExp(`export function ${component}\\b`), `${specifier} must export ${component}`)
    }
  } finally { await server.close() }
})
