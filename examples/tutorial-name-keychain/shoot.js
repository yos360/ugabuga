// Real captures of ugabuga.co.il/3d-print (hub) and /3d-print/name-keychain (src/pages/print3d/Print3D.jsx).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const c = await b.newContext({ viewport: { width: 820, height: 1100 }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  const hide = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const box = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height].map(Math.round); });
  const boxes = {};
  const shot = async (k, loc) => { boxes[k] = await box(loc); await loc.screenshot({ path: `shots/${k}.png` }); };

  // hub
  await p.goto('https://ugabuga.co.il/3d-print', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();
  await p.screenshot({ path: 'shots/hub-full.png', fullPage: true });
  const hubCard = p.locator('a[href="/3d-print/name-keychain"]').first();
  boxes.hubCard = await box(hubCard);
  boxes.hubH1 = await box(p.locator('h1'));
  await p.screenshot({ path: 'shots/hub.png', clip: { x: 0, y: boxes.hubH1[1] - 30, width: 820, height: 1300 }, fullPage: true });
  boxes.hubClip = [0, boxes.hubH1[1] - 30];

  // keychain maker
  await p.goto('https://ugabuga.co.il/3d-print/name-keychain', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000); await hide();
  const form = p.locator('div.space-y-4').first();
  const input = form.locator('input');
  const viewer = form.locator('[role="img"]').first();
  const vwrap = viewer.locator('..');
  boxes.input = await box(input);
  await shot('k0', form);
  boxes.btnKey = await box(form.getByRole('radio', { name: /מחזיק מפתחות/ }));
  boxes.btnSign = await box(form.getByRole('radio', { name: /שלט לדלת/ }));
  // type a new name, letter by letter
  await input.fill('');
  const NAME = 'מאיה';
  for (let i = 1; i <= NAME.length; i++) {
    await input.fill(NAME.slice(0, i)); await p.waitForTimeout(900);
    await shot('type' + i, form);
  }
  // rotate the preview by dragging
  const vb = await viewer.boundingBox();
  const drag = async (dx, dy) => {
    await p.mouse.move(vb.x + vb.width / 2, vb.y + vb.height / 2); await p.mouse.down();
    for (let s = 1; s <= 10; s++) await p.mouse.move(vb.x + vb.width / 2 + dx * s / 10, vb.y + vb.height / 2 + dy * s / 10);
    await p.mouse.up(); await p.waitForTimeout(500);
  };
  for (let i = 0; i < 4; i++) { await drag(70, 25); await shot('rot' + i, vwrap); }
  await shot('k1', form);
  const sizeP = form.locator('p').filter({ hasText: 'גודל:' });
  boxes.size1 = await box(sizeP); console.log('size keychain:', await sizeP.innerText());
  boxes.dlAll = await box(form.getByRole('button', { name: /הורדת קובץ STL/ }));
  boxes.dlBase = await box(form.getByRole('button', { name: /הבסיס/ }));
  boxes.dlText = await box(form.getByRole('button', { name: /האותיות/ }));
  // sign
  await form.getByRole('radio', { name: /שלט לדלת/ }).click(); await p.waitForTimeout(1500);
  await shot('s1', form);
  console.log('size sign:', await sizeP.innerText());
  boxes.size2 = await box(sizeP);
  // back to keychain for the downloads part
  await form.getByRole('radio', { name: /מחזיק מפתחות/ }).click(); await p.waitForTimeout(1500);
  await shot('k2', form);
  // the two-colour how-to
  const how = p.locator('h2').filter({ hasText: 'איך מדפיסים בשני צבעים' });
  const ol = how.locator('xpath=following-sibling::ol[1]');
  await shot('howH', how); await shot('how', ol);
  console.log('how:', await ol.innerText());
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
