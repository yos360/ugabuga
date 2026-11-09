// Real captures of ugabuga.co.il/letters/first-reading-stories (src/pages/letters/VowelStories.jsx).
// Full-page shots; element boxes are measured in the DOM (image pixels, page coordinates).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il', PATH = '/letters/first-reading-stories';
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  const p = await c.newPage();
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); if (c.position === 'fixed' || c.position === 'sticky') e.style.display = 'none'; } });
  const boxes = {};
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await p.waitForTimeout(300); await hideFixed(); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); };
  const nav = () => p.locator('nav[aria-label="בחירת שלב"] button');

  await p.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await hideFixed();
  // ---- stage 1 (default)
  await shot('a0');
  boxes.h1 = await abs(p.locator('h1'));
  boxes.nav = await abs(p.locator('nav[aria-label="בחירת שלב"]'));
  boxes.stages = [];
  for (let i = 0; i < await nav().count(); i++) boxes.stages.push(await abs(nav().nth(i)));
  boxes.stageLabels = await nav().allInnerTexts();
  boxes.tipBar = await abs(p.locator('div.bg-violet-50').first());
  boxes.print = await abs(p.getByRole('button', { name: /הדפסת השלב/ }));

  // ---- stage 3 (chirik): find the right answers first (clicking marks them), then reload for clean shots
  await p.goto(BASE + PATH + '?stage=c', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  let art = p.locator('article').first(), g = art.locator('[role=group]');
  const n = await g.count(), rights = [];
  for (let i = 0; i < n; i++) {
    const bs = g.nth(i).locator('button');
    for (let j = 0; j < await bs.count(); j++) {
      await bs.nth(j).click(); await p.waitForTimeout(60);
      if ((await bs.nth(j).getAttribute('class')).includes('border-green-600')) { rights.push(j); break; }
    }
  }
  boxes.c_right = rights;
  await p.goto(BASE + PATH + '?stage=c', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await shot('c0');
  art = p.locator('article').first(); g = art.locator('[role=group]');
  boxes.c_tipBar = await abs(p.locator('div.bg-violet-50').first());
  boxes.c_story = await abs(art);
  boxes.c_title = await abs(art.locator('h3'));
  boxes.c_text = await abs(art.locator('p').first());
  boxes.c_storyText = await art.locator('p').first().innerText();
  boxes.c_listen = await abs(art.getByRole('button', { name: /הקראה/ }));
  boxes.c_q = []; boxes.c_opts = [];
  for (let i = 0; i < n; i++) {
    boxes.c_q.push(await abs(art.locator('ol > li').nth(i)));
    const bs = g.nth(i).locator('button'); const row = [];
    for (let j = 0; j < await bs.count(); j++) row.push(await abs(bs.nth(j)));
    boxes.c_opts.push(row);
  }
  boxes.c_qText = await art.locator('ol').innerText();
  const wrong0 = rights[0] === 0 ? 1 : 0;
  boxes.c_wrong = wrong0;
  await g.nth(0).locator('button').nth(wrong0).click(); await p.waitForTimeout(200);
  await shot('c1');
  boxes.c_almost = await abs(art.locator('ol > li').nth(0).locator('p').nth(1));
  await g.nth(0).locator('button').nth(rights[0]).click(); await p.waitForTimeout(200);
  await shot('c2');
  for (let i = 1; i < n; i++) { await g.nth(i).locator('button').nth(rights[i]).click(); await p.waitForTimeout(150); }
  await p.waitForTimeout(300);
  await shot('c3');
  boxes.c_story2 = await abs(art);
  boxes.c_done = await abs(art.locator('p', { hasText: 'כל הכבוד' }));

  // ---- grade 2: open question
  await p.goto(BASE + PATH + '?stage=g2', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await shot('g0');
  const ag = p.locator('article').first();
  boxes.g_story = await abs(ag);
  boxes.g_open = await abs(ag.locator('p', { hasText: 'שְׁאֵלָה פְּתוּחָה' }));
  boxes.g_openText = await ag.locator('p', { hasText: 'שְׁאֵלָה פְּתוּחָה' }).innerText();
  boxes.g_tip = await abs(p.locator('div.bg-violet-50').first());

  // ---- print stage 1
  await p.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  await p.getByRole('button', { name: /הדפסת השלב/ }).click();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shots/p0.png' });
  // viewport coordinates (p0 is not a full-page shot)
  const vb = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  boxes.pPrint = await vb(p.locator('button:visible', { hasText: /הדפסה\s*$/ }).last());
  boxes.pPdf = await vb(p.getByRole('button', { name: /PDF/ }).first());
  boxes.pClass = await vb(p.getByRole('button', { name: /לכל הכיתה/ }).first());
  boxes.sheets = await p.locator('.buga-a4').count();
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
