#!/usr/bin/env node
// PDF by mail for page requests (docs/page-requests-automation.md):
//
//   node scripts/request-pdf.mjs <spec.json> [base-url]
//
// Run by the instant build (.github/workflows/page-request-flag.yml) after the new pages are built and served
// locally. For each request done in this run whose visitor left an email, opens the new page, opens its print
// preview and prints exactly the sheets a visitor would print to an A4 PDF, then stores it in Supabase
// (page_request_pdfs). The mail scheduler (functions/api/mail.js) mails it right away and deletes it.
// Needs SUPABASE_ACCESS_TOKEN. Prints request ids only — never emails or request texts (public logs).
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PROJECT = 'efhgyispuwxcplvzipcy'
const MAX_BYTES = 12_000_000
const sqlText = s => `'${String(s).replace(/'/g, "''")}'`

async function sql(query) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/database/query`, {
    method: 'POST', body: JSON.stringify({ query }), signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(`supabase ${response.status}`)
  return response.json()
}

// The attachment's name: the page's public title, without characters mail clients or file systems reject.
export const fileName = title => `${String(title || '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'עוגה בוגה'}.pdf`

// The print sheets of a page: pages that open with the preview already have #buga-print-output; otherwise the
// first print/PDF button opens it (booklets: "לחוברת המלאה — הדפסה או PDF"). null when the page has none.
export async function printablePdf(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  const sheets = page.locator('#buga-print-output .buga-a4, #buga-print-output .buga-flow')
  if (!await sheets.count()) {
    const open = page.locator('button:visible').filter({ hasText: /הדפס|PDF/ }).first()
    if (!await open.count()) return null
    await open.click()
    await sheets.first().waitFor({ timeout: 20000 }).catch(() => {})
    if (!await sheets.count()) return null
  }
  await page.evaluate(async () => {
    await document.fonts.ready
    const images = [...document.querySelectorAll('#buga-print-output img')]
    const art = [...document.querySelectorAll('#buga-print-output image')].map(el => { const i = new Image(); i.src = el.getAttribute('href'); return i })
    await Promise.allSettled([...images, ...art].map(i => i.decode()))
  })
  await page.waitForLoadState('networkidle')
  await page.emulateMedia({ media: 'print' })
  return page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
}

async function main(specPath, base) {
  const done = (JSON.parse(readFileSync(specPath, 'utf8')).done || []).filter(d => Number.isInteger(d.id) && d.id > 0 && /^\/[a-z0-9/_-]*$/.test(d.path || ''))
  if (!done.length) return console.log('no new pages')
  const rows = await sql(`select id from public.page_requests where id in (${done.map(d => d.id).join(', ')}) and email is not null and mailed_at is null`)
  const wanted = new Set(rows.map(r => Number(r.id)))
  if (!wanted.size) return console.log('nobody to mail')
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  try {
    for (const d of done.filter(d => wanted.has(d.id))) {
      const page = await browser.newPage({ locale: 'he-IL' })
      try {
        const pdf = await printablePdf(page, new URL(d.path, base).href)
        if (!pdf) { console.log(`request ${d.id}: no print sheets, the link mail follows once the page is live`); continue }
        if (pdf.length > MAX_BYTES) { console.log(`request ${d.id}: PDF too large (${pdf.length} bytes), the link mail follows`); continue }
        await sql(`insert into public.page_request_pdfs (request_id, file_name, pdf) values (${d.id}, ${sqlText(fileName(d.title))}, decode('${pdf.toString('base64')}', 'base64'))
          on conflict (request_id) do update set file_name = excluded.file_name, pdf = excluded.pdf, created_at = now()`)
        console.log(`request ${d.id}: PDF stored (${Math.round(pdf.length / 1024)} KB)`)
      } catch (e) {
        console.log(`request ${d.id}: no PDF (${e.message.split('\n')[0]}), the link mail follows`)
      } finally { await page.close() }
    }
  } finally { await browser.close() }
}

if (process.argv[1]?.endsWith('request-pdf.mjs')) {
  const [spec, base = 'http://localhost:4173'] = process.argv.slice(2)
  if (!spec) { console.error('usage: request-pdf.mjs <spec.json> [base-url]'); process.exit(1) }
  await main(resolve(spec), base)
}
