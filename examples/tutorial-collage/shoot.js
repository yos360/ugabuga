// Real captures of ugabuga.co.il/tools/collage and /tools/collage/number
// (src/pages/tools/PhotoStudioPages.jsx + src/studio/Studio.jsx, Inspector.jsx).
// The uploaded photos are the site's own sample photos (/studio-demo/*.webp, generated for the site).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const path = require('path');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots/photos', { recursive: true });
const VW = 1280;
(async () => {
  // sample photos from the site
  const names = [];
  for (const [ev, n] of Object.entries({ birthday: 5, 'bat-mitzvah': 6, 'bar-mitzvah': 8, wedding: 8 })) for (let i = 1; i <= n; i++) names.push(`${ev}-${i}`);
  const files = [];
  for (const [i, n] of names.entries()) {
    const r = await fetch(`https://ugabuga.co.il/studio-demo/${n}.webp`);
    if (!r.ok) continue;
    const f = path.resolve(`shots/photos/${String(i + 1).padStart(2, '0')}-${n}.webp`);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); files.push(f);
  }
  console.log('photos', files.length);
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: 1000 }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  const hide = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
  const boxes = {};
  const clipShot = async (k, y, h) => { await p.screenshot({ path: `shots/${k}.png`, clip: { x: 0, y, width: VW, height: h }, fullPage: true }); };

  // 1. the hub with the shape pills
  await p.goto('https://ugabuga.co.il/tools/collage', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000); await hide();
  boxes.h1 = await box(p.locator('h1'));
  const nav = p.locator('nav[aria-label="סוגי קולאז׳"]');
  boxes.nav = await box(nav);
  for (const [k, re] of [['pHeart', 'קולאז׳ לב'], ['pNumber', 'קולאז׳ מספר'], ['pName', 'קולאז׳ שם'], ['pText', 'תמונה בתוך טקסט']]) boxes[k] = await box(nav.getByRole('link', { name: re, exact: true }));
  await p.screenshot({ path: 'shots/hub-full.png', fullPage: true });
  boxes.hubY = boxes.h1[1] - 20;
  await clipShot('hub', boxes.hubY, 900);

  // 2. the number page: demo, then our photos
  await p.goto('https://ugabuga.co.il/tools/collage/number', { waitUntil: 'networkidle' });
  await p.waitForTimeout(4000); await hide();
  const studio = p.locator('.studio');
  boxes.studio = await box(studio);
  boxes.upBtn = await box(studio.getByRole('button', { name: /העלאת התמונות שלכם/ }));
  boxes.canvas = await box(studio.locator('canvas').first());
  boxes.Y = boxes.studio[1] - 10;
  await clipShot('n0', boxes.Y, 1000);
  await studio.locator('input[type=file]').setInputFiles(files);
  await p.waitForTimeout(8000);
  boxes.count = await box(studio.getByText(/\d+ תמונות\./).first()).catch(() => null);
  boxes.lock = await box(studio.getByText(/התמונות נשארות במכשיר/).first()).catch(() => null);
  boxes.canvas = await box(studio.locator('canvas').first());
  await clipShot('n1', boxes.Y, 1000);
  console.log('after upload:', (await studio.locator('[role=status]').allInnerTexts()).join(' | '));

  // 3. click the mosaic -> inspector, type a number
  const cv = boxes.canvas;
  await p.mouse.click(cv[0] + cv[2] * 0.57, cv[1] + cv[3] * 0.2); await p.waitForTimeout(1200);
  await clipShot('m0', boxes.Y, 1000);
  const numIn = studio.locator('label').filter({ hasText: 'מספר או שם' }).locator('input');
  boxes.numIn = await box(numIn).catch(() => null);
  await numIn.fill('1'); await p.waitForTimeout(700); await clipShot('m1', boxes.Y, 1000);
  await numIn.fill('13'); await p.waitForTimeout(1200); await clipShot('m2', boxes.Y, 1000);
  await numIn.blur(); await p.waitForTimeout(800);
  // close the inspector -> styles
  await studio.getByRole('button', { name: /סגירה/ }).click(); await p.waitForTimeout(1000);
  await clipShot('s0', boxes.Y, 1000);
  const styleBtns = studio.locator('aside button').filter({ has: p.locator('span i') });
  const nStyles = await styleBtns.count();
  boxes.styles = [];
  for (let i = 0; i < Math.min(6, nStyles); i++) boxes.styles.push(await box(styleBtns.nth(i)));
  console.log('styles:', (await styleBtns.allInnerTexts()).slice(0, 6).join(' | '));
  await styleBtns.nth(2).click(); await p.waitForTimeout(1500); await clipShot('s1', boxes.Y, 1000);
  await styleBtns.nth(4).click(); await p.waitForTimeout(1500); await clipShot('s2', boxes.Y, 1000);
  // export card
  boxes.jpg = await box(studio.getByRole('button', { name: /JPG באיכות גבוהה/ }));
  boxes.png = await box(studio.getByRole('button', { name: /^⬇️ PNG/ }));
  // more options: size list
  const det = studio.locator('summary').filter({ hasText: 'עוד אפשרויות' });
  await det.click(); await p.waitForTimeout(800);
  boxes.sizeSel = await box(studio.locator('label').filter({ hasText: /^גודל/ }).locator('select')).catch(() => null);
  boxes.transp = await box(studio.locator('label').filter({ hasText: 'רקע שקוף' })).catch(() => null);
  boxes.jpg2 = await box(studio.getByRole('button', { name: /JPG באיכות גבוהה/ }));
  boxes.png2 = await box(studio.getByRole('button', { name: /^⬇️ PNG/ }));
  await clipShot('d0', boxes.Y, 1600);
  await studio.getByRole('button', { name: /לב מתמונות/ }).click(); await p.waitForTimeout(2500); boxes.canvasH = await box(studio.locator('canvas').first()); await clipShot('heart', boxes.Y, 1600);
  console.log('sizes:', await studio.locator('label').filter({ hasText: /^גודל/ }).locator('select').innerText().catch(() => ''));
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
