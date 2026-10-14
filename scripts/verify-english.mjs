import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, extname, join } from 'node:path'
import { tmpdir } from 'node:os'
import assert from 'node:assert/strict'
import { ENGLISH_PAGES } from '../src/en/englishRoutes.js'
const dist = resolve('dist'), output = process.env.ENGLISH_CHECK_OUTPUT || join(tmpdir(), 'ugabuga-english-checks')
await mkdir(output, { recursive: true })
const shell = await readFile(join(dist, 'index.html'))
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://local').pathname)
  if (!extname(path)) { res.setHeader('Content-Type', 'text/html'); res.end(shell); return }
  try { res.setHeader('Content-Type', ({ '.js':'application/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2', '.mp3':'audio/mpeg' })[extname(path)] || 'application/octet-stream'); res.end(await readFile(join(dist, path))) }
  catch { res.statusCode = 404; res.end() }
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) })
const errors = []
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, acceptDownloads: true })
  await context.addInitScript(() => { window.__PRERENDER__ = true })
  await context.route('**/*', r => new URL(r.request().url()).origin === origin ? r.continue() : r.abort())
  const page = await context.newPage()
  page.on('pageerror', e => errors.push(e.message))
  for (const p of ENGLISH_PAGES) {
    const html = await readFile(join(dist, p.path.slice(1), 'index.html'), 'utf8')
    assert.match(html, /<html[^>]*lang="en"/)
    assert.match(html, /<html[^>]*dir="ltr"/)
    assert.ok(html.includes(p.title), p.path)
    await page.goto(origin + p.path, { waitUntil: 'networkidle' })
    await page.locator('main h1').waitFor()
    assert.equal(await page.locator('main h1').count(), 1)
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    assert.equal(await page.locator('html').getAttribute('dir'), 'ltr')
    assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'), 'en_US')
    assert.doesNotMatch(await page.title(), /[\u0590-\u05ff]/)
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://ugabuga.co.il' + p.path)
    assert.ok((await page.locator('meta[name=description]').getAttribute('content')).length <= 165)
    const pairs = await page.locator('link[rel=alternate][hreflang]').evaluateAll(es => es.map(e => [e.hreflang, e.getAttribute('href')]))
    if (p.counterpart) {
      assert.deepEqual(pairs, [['he','https://ugabuga.co.il'+p.counterpart],['en','https://ugabuga.co.il'+p.path],['x-default','https://ugabuga.co.il'+p.counterpart]])
      assert.ok(html.includes('hreflang="he"'))
      await page.goto(origin + p.counterpart, { waitUntil: 'networkidle' })
      assert.equal(await page.locator('html').getAttribute('lang'), 'he')
      assert.equal(await page.locator('link[hreflang=en]').getAttribute('href'), 'https://ugabuga.co.il' + p.path)
    } else assert.equal(pairs.length, 0)
  }
  for (const path of ['/en', ...ENGLISH_PAGES.filter(p => /hebrew-alphabet|jewish-holidays|coloring/.test(p.path)).filter((_,i)=>i%7===0).map(p=>p.path)].slice(0,12)) {
    await page.goto(origin+path,{waitUntil:'networkidle'})
    await page.setViewportSize({width:390,height:900})
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1), path)
  }
  if (ENGLISH_PAGES.some(p=>p.path==='/en/jewish-holidays')) {
    await page.goto(origin+'/en/jewish-holidays/passover',{waitUntil:'networkidle'})
    const diaspora=await page.locator('.en-dates').innerText()
    await page.getByLabel('Calendar tradition').selectOption('israel')
    assert.notEqual(await page.locator('.en-dates').innerText(),diaspora)
    await page.screenshot({path:join(output,'passover-mobile.png'),fullPage:true})
    await page.getByRole('button',{name:'Print word match and answers',exact:true}).click()
    assert.equal(await page.locator('dialog[open] .buga-a4').count(),2)
    const match=page.waitForEvent('download')
    await page.getByRole('button',{name:'⬇️ Download PDF',exact:true}).click()
    await(await match).saveAs(join(output,'passover-word-match.pdf'))
    await page.getByRole('button',{name:'Close print preview'}).click()
    for(const [path,file] of [['/en/coloring/passover/1','seder-plate'],['/en/coloring/hanukkah/7','doughnut']]) {
      await page.goto(origin+path,{waitUntil:'networkidle'})
      await page.screenshot({path:join(output,file+'-mobile.png'),fullPage:true})
      await page.locator('[data-print-main]').click()
      assert.equal(await page.locator('dialog[open]').getAttribute('dir'),'ltr')
      const pdf=page.waitForEvent('download')
      await page.getByRole('button',{name:'⬇️ Download PDF',exact:true}).click()
      await(await pdf).saveAs(join(output,file+'.pdf'))
      await page.getByRole('button',{name:'Close print preview'}).click()
    }
  }
  if (ENGLISH_PAGES.some(p=>p.path==='/en/hebrew-alphabet')) {
    await page.goto(origin+'/en/hebrew-alphabet',{waitUntil:'networkidle'})
    const quiz=page.locator('.en-quiz')
    for(const name of ['Aleph','Kaf','Dalet','Tsadi','Tav']) {
      await quiz.getByRole('button',{name,exact:true}).click()
      await quiz.getByRole('button',{name:name==='Tav'?'See result':'Next letter',exact:true}).click()
    }
    assert.match(await quiz.innerText(),/5 of 5/)
    await page.goto(origin+'/en/hebrew-alphabet/aleph',{waitUntil:'networkidle'})
    assert.match(await page.locator('.en-script-samples .font-ktav').evaluate(e=>getComputedStyle(e).fontFamily),/KtavYad/)
    assert.match(await page.locator('.en-script-samples .font-stam').evaluate(e=>getComputedStyle(e).fontFamily),/Stam/)
    await page.screenshot({path:join(output,'aleph-mobile.png'),fullPage:true})
    await page.setViewportSize({width:1280,height:960})
    await page.screenshot({path:join(output,'aleph-desktop.png'),fullPage:true})
    await page.locator('[data-print-main]').click()
    const download=page.waitForEvent('download')
    await page.getByRole('button',{name:'⬇️ Download PDF',exact:true}).click()
    await (await download).saveAs(join(output,'aleph-tracing.pdf'))
    await page.getByRole('button',{name:'Close print preview'}).click()
    await page.goto(origin+'/en/hebrew-alphabet/song',{waitUntil:'networkidle'})
    await page.getByRole('button',{name:'Play alphabet song',exact:true}).click()
    await page.locator('.en-song .en-active').waitFor()
    await page.getByRole('button',{name:'Stop song',exact:true}).click()
    assert.equal(await page.locator('.en-song .en-active').count(),0)
    await page.setViewportSize({width:390,height:900})
  }
  await page.goto(origin+'/en',{waitUntil:'networkidle'})
  await page.screenshot({path:join(output,'home-mobile.png'),fullPage:true})
  await page.getByRole('button',{name:'Print my learning notes',exact:true}).click()
  await page.locator('dialog[open] .buga-qr').waitFor()
  assert.equal(await page.locator('dialog[open]').getAttribute('dir'),'ltr')
  assert.doesNotMatch(await page.locator('dialog[open]').innerText(),/[\u0590-\u05ff]/)
  const downloading = page.waitForEvent('download')
  await page.getByRole('button',{name:'⬇️ Download PDF',exact:true}).click()
  await (await downloading).saveAs(join(output,'learning-notes.pdf'))
  await page.getByRole('button',{name:'Close print preview'}).click()
  await page.locator('.en-footer a[lang=he]').click()
  await page.locator('.home-v2').waitFor()
  assert.equal(await page.locator('html').getAttribute('dir'),'rtl')
  await page.locator('footer a[href="/en"]').click()
  await page.locator('.en-page').waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'),'en')
  await page.goto(origin+'/en/not-a-real-page',{waitUntil:'networkidle'})
  assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/)
  assert.doesNotMatch(await page.locator('main').innerText(),/[\u0590-\u05ff]/)
  assert.deepEqual(errors, [])
  await writeFile(join(output,'result.json'),JSON.stringify({pages:ENGLISH_PAGES.length,prerendered:true,reciprocalAlternates:true,englishPdf:true,errors},null,2))
  console.log(`Verified ${ENGLISH_PAGES.length} English pages, prerendered language, reciprocal links, navigation and PDF.`)
} finally { await browser.close(); await new Promise(r=>server.close(r)) }
