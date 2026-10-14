// Fresh navigation per URL; collect actual first-load scripts, including idle imports.
// AUDIT_BASE, AUDIT_DIST, AUDIT_OUTPUT, AUDIT_FILTER and CHROME_PATH are configurable.
import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5203'
const dist = process.env.AUDIT_DIST || 'dist'
const output = process.env.AUDIT_OUTPUT || 'out/audit/js-after.json'
const paths = JSON.parse(readFileSync('docs/audit-data-2026-10-14.json')).inventory.map(r => r.path).filter(p => !process.env.AUDIT_FILTER || new RegExp(process.env.AUDIT_FILTER).test(p))
const results = existsSync(output) ? JSON.parse(readFileSync(output)) : []
const done = new Set(results.map(r => r.path)), jobs = paths.filter(p => !done.has(p))
const sizes = new Map()
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
let cursor = 0
await Promise.all(Array.from({ length: Number(process.env.AUDIT_WORKERS || 3) }, async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await context.route('**/*', r => r.request().url().startsWith(base) && ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort())
  const page = await context.newPage()
  let scripts = new Set()
  page.on('response', r => { if (r.request().resourceType() === 'script' && r.url().startsWith(base)) scripts.add(new URL(r.url()).pathname) })
  while (cursor < jobs.length) {
    const path = jobs[cursor++]; scripts = new Set()
    try {
      await page.goto(base + path, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForFunction(() => document.querySelector('h1'), null, { timeout: 10000 })
      let bytes = 0
      for (const file of scripts) { if (!sizes.has(file)) sizes.set(file, gzipSync(readFileSync(dist + file)).length); bytes += sizes.get(file) }
      results.push({ path, gzipBytes: bytes, scripts: [...scripts] })
    } catch (e) { results.push({ path, error: e.message }) }
    if (results.length % 100 === 0) { writeFileSync(output, JSON.stringify(results)); console.log(`${results.length}/${paths.length}`) }
  }
  await context.close()
}))
await browser.close()
writeFileSync(output, JSON.stringify(results))
console.log({ pages: results.length, errors: results.filter(r => r.error).length, over400KB: results.filter(r => r.gzipBytes > 400000).length, max: Math.max(...results.map(r => r.gzipBytes || 0)) })
