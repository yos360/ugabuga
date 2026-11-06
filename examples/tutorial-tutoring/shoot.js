// Real captures of ugabuga.co.il/tutoring and a plan, element boxes measured in the DOM (image pixels).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL', permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await c.newPage();
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { if (e.closest('dialog')) continue; const c = getComputedStyle(e); if (c.position === 'fixed' || c.position === 'sticky') e.style.display = 'none'; } });
  const boxes = {};
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await hideFixed(); await p.waitForTimeout(350); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); };

  await p.goto(BASE + '/tutoring', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800);
  await shot('h0');
  const sec = (id) => p.locator(`section[aria-labelledby="${id}"]`);
  boxes.secGrade = await abs(sec('t-grade'));
  const g5 = sec('t-grade').getByRole('button', { name: 'ה׳', exact: true });
  boxes.g5 = await abs(g5);
  await g5.click(); await shot('h1');

  const skills = sec('t-skills');
  boxes.secSkills = await abs(skills);
  const mathBtn = skills.getByRole('button', { name: /חשבון/ });
  boxes.areaMath = await abs(mathBtn);
  await mathBtn.click(); await shot('h2');
  boxes.secSkills2 = await abs(skills);
  const frac = skills.getByRole('button', { name: /שברים/ });
  boxes.frac = await abs(frac);
  await frac.click(); await shot('h3');
  boxes.picked = await abs(skills.locator('p', { hasText: 'נבחרו' }));
  boxes.pickedText = await skills.locator('p', { hasText: 'נבחרו' }).innerText();

  const readBtn = skills.getByRole('button', { name: /קריאה/ }).first();
  boxes.areaRead = await abs(readBtn);
  await readBtn.click(); await shot('h4');
  const compr = skills.getByRole('button', { name: /הבנת הנקרא/ });
  boxes.compr = await abs(compr);
  await compr.click(); await shot('h5');
  boxes.picked2 = await abs(skills.locator('p', { hasText: 'נבחרו' }));
  boxes.pickedText2 = await skills.locator('p', { hasText: 'נבחרו' }).innerText();
  boxes.skillsList = await skills.locator('ul li').allInnerTexts();

  const time = sec('t-time');
  boxes.secTime = await abs(time);
  const month = time.getByRole('button', { name: 'חודש', exact: true });
  boxes.month = await abs(month);
  await month.click(); await shot('h6');
  boxes.d4 = await abs(time.getByRole('button', { name: '4 ימים' }));
  boxes.m15 = await abs(time.getByRole('button', { name: '15 דקות' }));
  boxes.base = await abs(time.getByRole('button', { name: /מהבסיס/ }));
  const go = p.getByRole('button', { name: /בונים את התוכנית/ });
  boxes.go = await abs(go);
  await go.click(); await p.waitForURL(/tutoring\/plan/); await p.waitForTimeout(2000);
  boxes.url = p.url();
  await shot('p0');
  boxes.h1 = await p.locator('h1').innerText();
  boxes.session = await abs(p.locator('#session'));
  boxes.sessionText = await p.locator('#session').innerText();
  boxes.progress = await abs(p.locator('[aria-label="ההתקדמות"]'));
  boxes.printPlan = await abs(p.getByRole('button', { name: /הדפסת התוכנית/ }));
  boxes.allSheets = await abs(p.getByRole('button', { name: /כל דפי העבודה/ }));
  boxes.send = await abs(p.getByRole('button', { name: /שליחת התוכנית/ }));
  boxes.hardBtn = await abs(p.getByRole('button', { name: /היה קשה/ }));
  boxes.howH = await abs(p.locator('#session p', { hasText: 'איך היה?' }));
  boxes.worksheet = await abs(p.locator('#session').getByRole('button', { name: /דף עבודה/ }));
  boxes.listTexts = await p.locator('main li button, li button[aria-current], ul li button').allInnerTexts();

  await p.getByRole('button', { name: /היה קשה/ }).click(); await p.waitForTimeout(900);
  await p.evaluate(() => scrollTo(0, 0)); await shot('p1');
  boxes.session1 = await abs(p.locator('#session'));
  boxes.session1Text = await p.locator('#session').innerText();
  boxes.prog1 = await p.locator('[aria-label="ההתקדמות"]').innerText();
  boxes.listAfter = await p.locator('ul li button').allInnerTexts();
  // the third session: the same fractions step comes back
  const third = p.locator('ul li button').filter({ hasText: 'שברים' }).nth(1);
  boxes.third = await abs(third); boxes.thirdText = await third.innerText();

  await p.getByRole('button', { name: /הדפסת התוכנית/ }).click(); await p.waitForTimeout(2200);
  await p.screenshot({ path: 'shots/d0.png' });
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes).slice(0, 6000));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
