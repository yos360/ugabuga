// Real captures of ugabuga.co.il/printables/class-photo/hanukkah (src/pages/printables/ClassPhoto.jsx).
// Full-page shots; element boxes are measured in the DOM (image pixels, page coordinates).
// Demo photos are the site's own characters (public/images/home-*.webp), names are typed into the real form.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const DSF = 1.25, BASE = 'https://ugabuga.co.il', PATH = '/printables/class-photo/hanukkah';
const IMGDIR = 'C:/Users/pc/Documents/ugabuga/public/images/';
const PHOTOS = ['home-birthday-girl-720', 'home-boy', 'home-detective-boy-720', 'home-girl-idea', 'home-schoolgirl-720', 'home-mascot-play', 'home-mascot-birthday', 'home-mascot-family'].map((n) => IMGDIR + n + '.webp');
const NAMES = ['נועה', 'איתי', 'תמר', 'יואב', 'מאיה', 'אורי', 'שירה', 'דניאל', 'הילה', 'עומר', 'ליה', 'אריאל', 'רוני', 'אלון', 'יעל', 'נדב'];
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 960, height: 754 }, deviceScaleFactor: DSF, locale: 'he-IL' });
  const p = await c.newPage();
  const hideFixed = () => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); if (c.position === 'fixed') e.style.display = 'none'; } });
  const boxes = {};
  const abs = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  const shot = async (n) => { await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.waitForTimeout(350); await hideFixed(); await p.screenshot({ path: `shots/${n}.png`, fullPage: true }); boxes['sheet_' + n] = await abs(p.locator('svg').filter({ has: p.locator('clipPath') }).first()); boxes['print_' + n] = await abs(p.locator('[data-print-main]').first()); };
  const sec = (txt) => p.locator('section', { hasText: txt }).first();
  const btn = (scope, name) => scope.getByRole('button', { name, exact: false }).first();

  await p.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  boxes.printRaw = await abs(p.locator('[data-print-main]').first()).catch(() => null);
  await hideFixed();
  await shot('a0');
  boxes.h1 = await abs(p.locator('h1'));
  boxes.design = await abs(sec('🎨 עיצוב'));
  boxes.themeDreidel = await abs(btn(sec('🎨 עיצוב'), 'סביבונים'));
  boxes.shapeHeart = await abs(btn(sec('🎨 עיצוב'), '🤍 לב'));
  boxes.sheet = await abs(p.locator('svg').filter({ has: p.locator('clipPath') }).first());
  const sib = p.getByRole('link', { name: 'סיום גן' }).first();
  boxes.sibGan = await abs(sib);
  boxes.sibRow = await abs(sib.locator('xpath=..'));

  // ---- 1. design: dreidels + heart
  await btn(sec('🎨 עיצוב'), 'סביבונים').click();
  await shot('a1');
  await btn(sec('🎨 עיצוב'), '🤍 לב').click();
  await shot('a2');

  // ---- 2. captions
  const cap = sec('✍️ כיתובים');
  boxes.cap = await abs(cap);
  const fSchool = cap.locator('input').nth(0);
  boxes.fSchool = await abs(fSchool); boxes.fTitle = await abs(cap.locator('input').nth(1));
  await fSchool.fill('גן השקד');
  await shot('b1');

  // ---- 3. staff
  const st = sec('👩‍🏫 צוות');
  boxes.staff = await abs(st);
  const names = st.locator('input[placeholder="שם"]');
  await names.nth(0).fill('רינה'); await names.nth(1).fill('שושי');
  await shot('c0');
  boxes.staffName0 = await abs(names.nth(0)); boxes.staffName1 = await abs(names.nth(1));
  boxes.addStaff = await abs(btn(st, 'הוספת קובייה'));
  await btn(st, 'הוספת קובייה').click();
  await st.locator('input[aria-label="תפקיד"]').nth(2).fill('המורה למוזיקה');
  await st.locator('input[placeholder="שם"]').nth(2).fill('אבי');
  await shot('c1');
  boxes.staff1 = await abs(st);
  boxes.staffRow2 = await abs(st.locator('input[aria-label="תפקיד"]').nth(2).locator('xpath=..'));

  // ---- 4. kids: count, names list, many photos at once
  const kd = sec('📸 ילדי הגן');
  boxes.kids = await abs(kd);
  boxes.bulk = await abs(btn(kd, 'הוספת הרבה תמונות'));
  boxes.count = await abs(kd.locator('input[type=number]'));
  await kd.locator('input[type=number]').fill('16');
  await kd.locator('summary').click();
  await kd.locator('textarea').fill(NAMES.join('\n'));
  await shot('d0');
  boxes.kids0 = await abs(kd);
  boxes.details = await abs(kd.locator('details'));
  boxes.applyNames = await abs(btn(kd, 'הכנסת השמות'));
  await btn(kd, 'הכנסת השמות').click();
  await shot('d0b');
  await kd.locator('input[type=file][multiple]').setInputFiles(PHOTOS);
  await p.waitForTimeout(2500);
  await shot('d1');
  boxes.kids1 = await abs(kd);
  boxes.bulk1 = await abs(btn(kd, 'הוספת הרבה תמונות'));
  boxes.sheet1 = await abs(p.locator('svg').filter({ has: p.locator('clipPath') }).first());
  boxes.note = await abs(kd.locator('p', { hasText: 'רק במכשיר שלכם' }));

  // ---- 5. print
  const pr = p.locator('[data-print-main]').first();
  boxes.print = await abs(pr).catch(() => null);
  boxes.printText = await pr.innerText().catch(() => null);
  await pr.click({ force: true }).catch((e) => console.error('print click', String(e)));
  await p.waitForTimeout(1800);
  await p.screenshot({ path: 'shots/p0.png' });
  const vb = async (loc) => { const a = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }); return a.map((v) => Math.round(v * DSF)); };
  boxes.pPrint = await vb(p.locator('button:visible', { hasText: /הדפסה\s*$/ }).last()).catch(() => null);
  boxes.pPdf = await vb(p.getByRole('button', { name: /הורדה כ-PDF/ }).first()).catch(() => null);
  boxes.pClass = await vb(p.getByRole('button', { name: /לכל הכיתה/ }).first()).catch(() => null);
  boxes.pButtons = await p.locator('button:visible').allInnerTexts();
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
