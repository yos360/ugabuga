// Real captures of ugabuga.co.il/bagrut and one exam, with element boxes measured in the DOM (image pixels).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const p = await b.newPage({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { if (e.closest('dialog')) continue; const c = getComputedStyle(e); if (c.position === 'fixed' || c.position === 'sticky') e.style.display = 'none'; } });
  const boxes = {};
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const vbox = async (loc) => (await loc.boundingBox().then((a) => [a.x, a.y, a.width, a.height])).map((v) => Math.round(v * DSF));

  await p.goto(BASE + '/bagrut', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hideFixed();
  await p.screenshot({ path: 'shots/hub.png', fullPage: true });
  boxes.hubH2 = {}; for (const h of await p.locator('h2').all()) { const t = (await h.innerText()).trim(); boxes.hubH2[t] = await abs(h); }
  boxes.cards = {}; for (const c of await p.locator('a.booklet-card').all()) { const t = (await c.locator('h2').innerText()).trim(); boxes.cards[t] = { box: await abs(c), meta: (await c.locator('p').first().innerText()).trim(), href: await c.getAttribute('href') }; }

  await p.goto(BASE + '/booklets/bagrut-math-5-units-a', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000); await hideFixed();
  await p.screenshot({ path: 'shots/exam.png', fullPage: true });
  const open = p.getByRole('button', { name: /לחוברת המלאה/ });
  boxes.openBtn = await abs(open);
  boxes.listH = await abs(p.getByRole('heading', { name: 'מה יש בחוברת?' }));
  boxes.list = await abs(p.locator('section[aria-label="מה יש בחוברת"] ol'));
  boxes.examTexts = await p.locator('header').last().innerText();

  await open.click(); await p.waitForTimeout(2500);
  const d = p.locator('dialog.buga-print-dialog');
  await p.screenshot({ path: 'shots/p0.png' });
  const mode = p.locator('[data-booklet-mode]');
  boxes.mode = await vbox(mode);
  boxes.pdf = await vbox(p.locator('[data-save-pdf]'));
  boxes.print = await vbox(d.getByRole('button', { name: /🖨️ הדפסה/ }));
  boxes.range = await vbox(p.locator('[data-booklet-pages]'));
  boxes.toolbar = await d.locator('.buga-print-toolbar').innerText();
  await mode.selectOption('student'); await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/p1-student.png' });
  boxes.studentOut = await d.locator('.buga-page-options output').innerText();
  // a real question page in the preview
  const sheets = d.locator('.buga-preview-pages > .buga-a4:not(.buga-skip), .buga-preview-pages > .buga-flow:not(.buga-skip)');
  boxes.sheets = await sheets.count();
  const q = d.locator('.buga-preview-pages > *').nth(1);
  await q.evaluate((e) => e.scrollIntoView({ block: 'start' })); await p.waitForTimeout(800);
  await p.screenshot({ path: 'shots/p2-page.png' });
  await mode.selectOption('teacher'); await p.waitForTimeout(600);
  await d.evaluate((e) => { e.scrollTop = 0; for (const x of e.querySelectorAll('*')) if (x.scrollTop) x.scrollTop = 0; }); await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/p3-teacher.png' });
  boxes.out = await vbox(d.locator('.buga-page-options output'));
  boxes.teacherOut = await d.locator('.buga-page-options output').innerText();
  const key = d.locator('.buga-preview-pages > *:not(.buga-skip)').first();
  await key.evaluate((e) => e.scrollIntoView({ block: 'start' })); await p.waitForTimeout(800);
  await p.screenshot({ path: 'shots/p4-key.png' });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes, null, 0).slice(0, 3500));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
