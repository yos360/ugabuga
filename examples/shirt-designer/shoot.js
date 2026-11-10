// Real captures of the shirt mockup on ugabuga.co.il/tools/shirt-designer (src/pages/tools/ShirtDesigner.jsx +
// shirtArt.jsx). Each state = one PNG of the mockup (div.relative.mx-auto) in shots/.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const BASE = 'https://ugabuga.co.il', PATH = '/tools/shirt-designer';
const NAMES = ['נועה כהן', 'איתי לוי', 'יעל מזרחי', 'עומר פרץ', 'מאיה ביטון', 'דניאל אברהם', 'שירה פרידמן', 'אורי שפירא', 'תמר גולן', 'יואב רז', 'הילה דהן', 'אלון בר', 'רוני אשכנזי', 'נדב חן', 'ליה כץ', 'אריאל עמר'];
fs.rmSync('shots', { recursive: true, force: true });
fs.mkdirSync('shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  await p.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.addStyleTag({ content: 'header,[class*="fixed"]{display:none !important}' });
  const mock = p.locator('div.relative.mx-auto').first();
  const shot = async (n) => { await p.mouse.move(2, 2); await p.waitForTimeout(400); await mock.screenshot({ path: `shots/${n}.png`, omitBackground: true }); console.log('shot', n); };
  const nav = p.locator('nav[aria-label="סוג האירוע"]');
  const btn = (scope, name) => scope.getByRole('button', { name, exact: false }).first();
  const sec = (txt) => p.locator('section', { hasText: txt }).first();

  await shot('course');
  for (const [k, n] of [['maslul', 'סוף מסלול'], ['six', 'סיום כיתה ו׳'], ['gan', 'סיום גן'], ['yb', 'סיום י״ב'], ['parents', 'הורים גאים'], ['beret', 'מסע כומתה'], ['youth', 'תנועת נוער']]) {
    await btn(nav, n).click(); await shot(k);
  }
  // drawings: back to "סיום קורס", animals → lion
  await btn(nav, 'סיום קורס').click();
  const art = sec('🖼️ ציור');
  await btn(art, '🦁 חיות').click();
  await p.waitForTimeout(300); await art.locator('div.grid').first().screenshot({ path: 'shots/grid_animals.png' });
  await btn(art, 'אריה').click(); await shot('lion');
  await btn(art, 'נשר').click(); await shot('eagle');
  // layout + text + font
  const lay = sec('📐 פריסה');
  await btn(lay, 'מגן עם סרט').click(); await shot('shield');
  const tx = sec('✍️ כיתוב');
  await tx.locator('input').nth(0).fill('פלוגה ג׳'); await shot('title');
  await tx.getByRole('button', { name: 'פעם אחים, תמיד אחים' }).click(); await shot('slogan');
  await btn(tx, 'כתב יד').click(); await shot('hand');
  // colours
  const col = sec('🎨 צבעים');
  await col.getByRole('button', { name: 'חולצה בורדו' }).click(); await shot('bordeaux');
  await col.getByRole('button', { name: 'חולצה שחור' }).click(); await shot('black');
  await col.locator('label', { hasText: 'צבע אחד בלבד' }).locator('input').check(); await shot('one');
  // names on the back
  await btn(nav, 'סיום י״ב').click();
  await btn(tx, 'רגיל').click();
  await tx.locator('textarea').fill(NAMES.join('\n')); await shot('names16');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
