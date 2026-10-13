import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'

const run = promisify(execFile)
const script = fileURLToPath(new URL('../scripts/prerender.mjs', import.meta.url))

// Exercise the complete script without requiring a browser installation or live data.
const browserStub = `
const { writeFile } = require('node:fs/promises')
module.exports.chromium = {
  executablePath: () => __filename,
  launch: async () => ({
    close: async () => {},
    newContext: async () => ({
      addInitScript: async () => {}, route: async () => {},
      newPage: async () => {
        let path, origin
        return {
          goto: async url => {
            ({ pathname: path, origin } = new URL(url))
            if (path.includes('broken')) throw new Error('fixture navigation failure')
            await new Promise(resolve => setTimeout(resolve, path === '/first' ? 20 : 1))
          },
          locator: () => ({ waitFor: async () => {} }),
          evaluate: async () => ({ title: path === '/duplicate' ? '/first' : path,
            canonical: ['https://ugabuga.co.il' + path], descriptions: 1, h1: 1, robots: '' }),
          content: async () => '<h1>' + path + '</h1><script src="' + origin + '/assets/app.js"></script>',
          close: async () => {}, setViewportSize: async () => {}, setContent: async () => {},
          screenshot: async ({ path }) => writeFile(path, 'icon'),
        }
      },
    }),
  }),
}
`

async function fixture(t, paths, concurrency) {
  const cwd = await mkdtemp(join(tmpdir(), 'ugabuga-prerender-'))
  t.after(() => rm(cwd, { recursive: true, force: true }))
  await mkdir(join(cwd, 'dist'))
  await mkdir(join(cwd, 'public'))
  await writeFile(join(cwd, 'dist/index.html'), 'shell')
  await writeFile(join(cwd, 'public/favicon.svg'), '<svg/>')
  const sitemap = rows => '<urlset>' + rows.map(path => '<url><loc>https://ugabuga.co.il' + path + '</loc></url>').join('') + '</urlset>'
  await writeFile(join(cwd, 'public/sitemap-static.xml'), sitemap(paths))
  await writeFile(join(cwd, 'public/sitemap.xml'), sitemap(['/games/broken', '/games/valid']))
  const stub = join(cwd, 'browser.cjs')
  await writeFile(stub, browserStub)
  const result = await run(process.execPath, [script], {
    cwd, env: { ...process.env, PRERENDER_PLAYWRIGHT: stub, PRERENDER_CONCURRENCY: String(concurrency) },
  }).then(output => ({ ...output, code: 0 }), error => error)
  return { cwd, result }
}

test('serial and parallel runs preserve output paths and normalized HTML; games remain best effort', async t => {
  const paths = ['/', '/first', '/nested/last', '/time-tunnel/01-01']
  const serial = await fixture(t, paths, 1)
  const parallel = await fixture(t, paths, 6)
  for (const { cwd, result } of [serial, parallel]) {
    assert.equal(result.code, 0, result.stderr)
    assert.match(result.stdout, /4 ok, 0 failed/)
    assert.match(result.stdout, /1 ok, 1 skipped/)
    for (const path of [...paths, '/games/valid']) {
      const file = path === '/' ? 'index.html' : path.slice(1) + '.html'
      assert.equal(await readFile(join(cwd, 'dist', file), 'utf8'), '<h1>' + path + '</h1><script src="/assets/app.js"></script>')
    }
  }
})

test('static failures and duplicate titles are summarized after other paths finish', async t => {
  const { cwd, result } = await fixture(t, ['/first', '/broken', '/duplicate', '/nested/last'], 6)
  assert.equal(result.code, 1)
  assert.match(result.stdout, /2 ok, 2 failed/)
  assert.match(result.stderr, /FAILED PATH: \/broken/)
  assert.match(result.stderr, /FAILED PATH: \/duplicate: Duplicate page title/)
  assert.doesNotMatch(result.stdout, /SEO checks passed/)
  assert.match(await readFile(join(cwd, 'dist/nested/last.html'), 'utf8'), /nested\/last/)
  assert.match(await readFile(join(cwd, 'dist/first.html'), 'utf8'), /first/)
})
