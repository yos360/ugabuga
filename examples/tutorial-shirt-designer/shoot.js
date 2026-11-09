// Real captures of ugabuga.co.il/tools/shirt-designer (src/pages/tools/ShirtDesigner.jsx + shirtArt.jsx).
// Viewport shots (the shirt mockup is sticky, so it stays beside every section); boxes are viewport pixels.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il', PATH = '/tools/shirt-designer';
const NAMES = ['נועה כהן', 'איתי לוי', 'יעל מזרחי', 'עומר פרץ', 'מאיה ביטון', 'דניאל אברהם', 'שירה פרידמן', 'אורי שפירא', 'תמר גולן', 'יואב רז', 'הילה דהן', 'אלון בר', 'רוני אשכנזי', 'נדב חן', 'ליה כץ', 'אריאל עמר'];
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  const p = await c.newPage();
  const hideChrome = () => p.evaluate(() => {
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || (s.position === 'sticky' && e.closest('header'))) e.style.display = 'none'; }
    for (const h of document.querySelectorAll('header')) h.style.display = 'none';
  });
  const boxes = {};
  const vb = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.mouse.move(2, 2); await p.waitForTimeout(450); await hideChrome(); await p.screenshot({ path: `shots/${n}.png` }); const y = await p.evaluate(() => scrollY); await p.locator('div.relative.mx-auto').first().screenshot({ path: `shots/${n}_s.png` }); await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(150); };
  const sec = (txt) => p.locator('section', { hasText: txt }).first();
  const btn = (scope, name) => scope.getByRole('button', { name, exact: false }).first();
  const top = async (loc, y = 20) => { await loc.evaluate((e, y) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - y), y); await p.waitForTimeout(300); };

  await p.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await hideChrome();
  await top(p.locator('h1'), 30);
  // ---- 1. occasion
  await shot('a0');
  const nav = p.locator('nav[aria-label="סוג האירוע"]');
  boxes.nav = await vb(nav);
  boxes.pMaslul = await vb(btn(nav, 'סוף מסלול'));
  await btn(nav, 'סוף מסלול').click();
  await shot('a1');
  boxes.pYb = await vb(btn(nav, 'סיום י״ב'));
  boxes.pGan = await vb(btn(nav, 'סיום גן'));

  // ---- 2. drawing + layout
  const art = sec('🖼️ ציור');
  await top(art, 20);
  await shot('b0');
  boxes.art = await vb(art);
  boxes.catAnimals = await vb(btn(art, '🦁 חיות'));
  await btn(art, '🦁 חיות').click();
  await shot('b1');
  boxes.lion = await vb(btn(art, 'אריה'));
  await btn(art, 'אריה').click();
  await shot('b2');
  const lay = sec('📐 פריסה');
  boxes.layout = await vb(lay);
  boxes.lShield = await vb(btn(lay, 'מגן עם סרט'));
  await btn(lay, 'מגן עם סרט').click();
  await shot('b3');

  // ---- 3. text + font
  const tx = sec('✍️ כיתוב');
  await top(tx, 20);
  const title = tx.locator('input').nth(0);
  boxes.fTitle = await vb(title);
  await title.fill('פלוגה ג׳');
  await shot('c0');
  boxes.text = await vb(tx);
  boxes.slogan = await vb(tx.getByRole('button', { name: 'פעם אחים, תמיד אחים' }));
  await tx.getByRole('button', { name: 'פעם אחים, תמיד אחים' }).click();
  await shot('c1');
  boxes.fontHand = await vb(btn(tx, 'כתב יד'));
  boxes.fontStam = await vb(btn(tx, 'סת״ם'));
  await btn(tx, 'כתב יד').click();
  await shot('c2');

  // ---- 4. colours
  const col = sec('🎨 צבעים');
  const hideBody = await p.addStyleTag({ content: 'div.mt-12{visibility:hidden !important}' });
  await top(col, 20);
  await shot('d0');
  boxes.colors = await vb(col);
  boxes.shirtBlack = await vb(col.getByRole('button', { name: 'חולצה שחור' }));
  await col.getByRole('button', { name: 'חולצה שחור' }).click();
  await shot('d1');
  const one = col.locator('label', { hasText: 'צבע אחד בלבד' });
  boxes.oneColor0 = await vb(one);
  await one.locator('input').check();
  await shot('d2');
  boxes.oneColor = await vb(one);
  await hideBody.evaluate((e) => e.remove());

  // ---- 5. names on the back + download
  await top(lay, 20);
  await btn(lay, 'גב עם שמות').click();
  await top(tx, 20);
  const ta = tx.locator('textarea');
  await ta.fill(NAMES.join('\n'));
  await top(ta, 160);
  await ta.evaluate((e) => { e.scrollTop = 0; });
  boxes.names = await vb(ta);
  boxes.namesLabel = await vb(tx.locator('label', { hasText: 'שמות לגב החולצה' }));
  await shot('e0');
  await top(p.locator('h1'), 30);
  await shot('e1');
  boxes.png = await vb(p.getByRole('button', { name: /הורדת PNG שקוף/ }));
  boxes.svg = await vb(p.getByRole('button', { name: /קובץ SVG/ }));
  boxes.note = await vb(p.locator('p', { hasText: 'PNG בגודל 3000' }));
  // big shirt for the hook / thumbnail: the badge lion shield in its default colours
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
