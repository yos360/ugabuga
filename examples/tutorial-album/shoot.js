// Real captures of ugabuga.co.il/tools/album (src/pages/tools/PhotoStudioPages.jsx AlbumPage → src/studio/Studio.jsx,
// Inspector.jsx). The page shows its own sample album until the visitor uploads photos; every shot uses it.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, PATH = 'https://ugabuga.co.il/tools/album';
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: DSF, locale: 'he-IL', acceptDownloads: true });
  const p = await c.newPage();
  await p.goto(PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  // hide the floating share/projection buttons and the sticky header
  const hide = () => p.evaluate(() => {
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.display = 'none'; }
  });
  await hide();
  const st = p.locator('.studio');
  const boxes = {};
  const vb = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (k) => { await p.waitForTimeout(500); await p.screenshot({ path: `shots/${k}.png` }); };
  const at = async (y) => { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(300); };
  const studioTop = await st.evaluate((e) => e.getBoundingClientRect().top + scrollY);
  // ---- hook / page top
  await at(0); await shot('h0');
  boxes.h1 = await vb(p.locator('h1'));
  // ---- 1. upload
  await at(studioTop - 20); await shot('a0');
  boxes.upload = await vb(st.getByRole('button', { name: /העלאת התמונות שלכם/ }));
  boxes.demo = await vb(st.locator('[role=status]').first());
  boxes.lock = await vb(st.locator('span', { hasText: 'התמונות נשארות במכשיר' }).first());
  boxes.steps = await vb(st.locator('ol[aria-label="שלבים"]'));
  // ---- 2. style
  const styleCard = st.locator('aside > div').first();
  boxes.styleCard = await vb(styleCard);
  boxes.canvas = await vb(st.locator('canvas').first());
  const night = styleCard.getByRole('button', { name: /לילה וזהב/ });
  boxes.night = await vb(night);
  await night.click(); await shot('b1');
  const diary = styleCard.getByRole('button', { name: /יומן מצויר/ });
  boxes.diary = await vb(diary);
  await diary.click(); await shot('b2');
  const olive = styleCard.getByRole('button', { name: /עלי זית/ });
  boxes.olive = await vb(olive);
  await olive.click(); await shot('b3');
  // ---- 3. spreads strip
  const strip = st.locator('[aria-label="כפולות"]');
  await strip.scrollIntoViewIfNeeded();
  await at(studioTop + 260); await shot('c0');
  boxes.strip = await vb(strip);
  boxes.stripHead = await vb(st.locator('p', { hasText: 'כל האלבום' }).first());
  boxes.nav = await vb(st.locator('[aria-label="מעבר בין כפולות"]'));
  const s1 = strip.getByRole('button', { name: /כפולה 1/ });
  boxes.s1 = await vb(s1);
  await s1.click(); await shot('c1');
  boxes.canvas2 = await vb(st.locator('canvas').first());
  const s2 = strip.getByRole('button', { name: /כפולה 2/ });
  boxes.s2 = await vb(s2);
  await s2.click(); await shot('c2');
  // ---- 4. tap a photo → inspector
  await s1.click(); await p.waitForTimeout(300);
  await at(studioTop + 200);
  await shot('dp');
  const cv = st.locator('canvas').first();
  const cb = await cv.boundingBox();
  // first photo on the right-hand page of spread 1
  const tryPts = [[0.75, 0.35], [0.7, 0.5], [0.25, 0.35], [0.3, 0.6], [0.85, 0.7]];
  let picked = null;
  for (const [fx, fy] of tryPts) {
    await p.mouse.click(cb.x + cb.width * fx, cb.y + cb.height * fy);
    await p.waitForTimeout(300);
    if (await st.locator('aside h3', { hasText: 'תמונה' }).count()) { picked = [fx, fy]; break; }
  }
  console.log('picked', picked);
  boxes.tap = [Math.round((cb.x + cb.width * (picked || [0.75, 0.35])[0]) * DSF), Math.round((cb.y + cb.height * (picked || [0.75, 0.35])[1]) * DSF), 1, 1];
  await shot('d0');
  boxes.canvas3 = await vb(cv);
  const insp = st.locator('aside > div').first();
  boxes.insp = await vb(insp);
  console.log('INSPECTOR:\n' + await insp.innerText());
  const bw = insp.getByRole('button', { name: 'שחור-לבן' });
  if (await bw.count()) { boxes.bw = await vb(bw.first()); await bw.first().click(); await shot('d1'); }
  const rot = insp.getByRole('button', { name: /ימינה/ });
  if (await rot.count()) { boxes.rot = await vb(rot.first()); }
  const cropB = insp.getByRole('button', { name: /חיתוך/ });
  if (await cropB.count()) { boxes.crop = await vb(cropB.first()); }
  // ---- 5. export
  await insp.getByRole('button', { name: /סגירה/ }).click();
  await p.waitForTimeout(300);
  const exp = st.locator('aside > div').nth(1);
  await exp.scrollIntoViewIfNeeded();
  await at(studioTop + 120);
  await exp.locator('summary', { hasText: 'הגדרות למעבדה' }).click();
  await shot('e0');
  boxes.exp = await vb(exp);
  boxes.pdf = await vb(exp.getByRole('button', { name: /PDF להדפסה/ }));
  boxes.zip = await vb(exp.getByRole('button', { name: /ZIP/ }));
  boxes.bleed = await vb(exp.locator('select'));
  console.log('EXPORT:\n' + await exp.innerText());
  try {
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 90000 }), exp.getByRole('button', { name: /PDF להדפסה/ }).click()]);
    console.log('download', dl.suggestedFilename());
    await p.waitForTimeout(800);
    await shot('e1');
    boxes.msg = await vb(exp.locator('p[role=status]'));
    console.log('msg', await exp.locator('p[role=status]').innerText());
  } catch (e) { console.log('no download', String(e).slice(0, 200)); }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
