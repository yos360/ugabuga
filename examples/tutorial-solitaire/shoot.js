// Real captures of ugabuga.co.il/online-games/solitaire (src/arcade/games/Solitaire.jsx, src/arcade/registry.js).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 960;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const p = await c.newPage();
  const boxes = {};
  const still = () => p.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
    // no style injection: freezing transitions crashed the tab
  });
  const vbox = async (loc) => (await loc.count()) === 0 ? null : loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }).catch(() => null);
  const shot = async (k) => { await still(); await p.mouse.move(1, 1); await p.waitForTimeout(700); return p.screenshot({ path: `shots/${k}.png` }); };

  await p.goto('https://ugabuga.co.il/online-games/solitaire', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await p.evaluate(() => document.fonts.ready);
  // landing: the hero card with the play button
  const play = p.getByRole('button', { name: /שחקו עכשיו/ });
  await play.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 520)); await p.waitForTimeout(500);
  boxes.landing = { play: await vbox(play), hero: await vbox(p.locator('h1').first()) };
  await shot('landing');
  await play.click(); await p.waitForTimeout(2000);

  const g = p.locator('.sol-game');
  const btn = (name) => g.locator('button', { hasText: name });
  const B = async () => ({
    game: await vbox(g), newGame: await vbox(btn('משחק חדש')), undo: await vbox(g.locator('button[aria-label="ביטול מהלך"]')),
    hint: await vbox(g.locator('button[aria-label="רמז"]')), theme: await vbox(g.locator('button[aria-label="בחירת רקע"]')),
    help: await vbox(g.locator('button[aria-label="איך משחקים"]')), stats: await vbox(g.locator('.sol-stats')),
    guide: await vbox(g.locator('.sol-guide')), table: await vbox(g.locator('.cd-table')),
    stock: await vbox(g.locator('.cd-table > .sol-card').first()),
    labels: await Promise.all([0, 1].map((i) => vbox(g.locator('.sol-pile-label').nth(i)))),
    found: await Promise.all([0, 1, 2, 3].map((i) => vbox(g.locator('.cd-slot').nth(i + 1 - 1)))),
    hintCard: await vbox(g.locator('.sol-card.is-hint')),
    panel: await vbox(g.locator('.sol-panel')),
    themes: await Promise.all([0, 1, 2].map((i) => vbox(g.locator('.sol-theme').nth(i)))),
  });

  // find a deal whose hint is a card move (not "draw from the deck")
  let tries = 0, hinted = null;
  for (; tries < 25; tries++) {
    await btn('רמז').click(); await p.waitForTimeout(250);
    const hc = g.locator('.sol-card.is-hint');
    if (await hc.count()) { hinted = await hc.first().getAttribute('aria-label'); break; }
    await p.waitForTimeout(2300);
    await btn('משחק חדש').click(); await p.waitForTimeout(500);
  }
  console.log('tries', tries, 'hinted', hinted);
  // wait for the hint glow to go, shoot the clean board, then hint again
  await p.waitForTimeout(2400);
  boxes.board0 = await B();
  await shot('board0');
  await btn('רמז').click(); await p.waitForTimeout(250);
  boxes.hint = await B();
  await shot('hint');
  // the card's place before the move (from the hint)
  const before = boxes.hint.hintCard;
  await p.locator(`.sol-card[aria-label="${hinted}"]`).first().click(); await p.waitForTimeout(700);
  boxes.moved = await B();
  boxes.moved.card = await vbox(p.locator(`.sol-card[aria-label="${hinted}"]`));
  boxes.moved.cardBefore = before;
  console.log('moved', hinted, before, '->', boxes.moved.card);
  await shot('moved');
  console.log('stats after move:', (await g.locator('.sol-stats').innerText()).replace(/\n/g, ' | '));

  // draw from the deck
  await g.locator('.cd-table > .sol-card').first().click({ force: true, position: { x: 40, y: 30 } }); await p.waitForTimeout(600);
  boxes.drawn = await B();
  const waste = await g.locator('.cd-table > .sol-card').evaluateAll((els) => els.slice(0, 6).map((e) => [e.getAttribute('aria-label'), ...Object.values(e.getBoundingClientRect().toJSON()).slice(0, 4).map(Math.round)]));
  console.log('first cards after draw:', JSON.stringify(waste));
  boxes.drawn.waste = waste;
  await shot('drawn');

  // themes
  await btn('רקע').click(); await p.waitForTimeout(500);
  boxes.themes = await B();
  console.log('panel:', (await g.locator('.sol-panel').innerText()).replace(/\n/g, ' | '));
  await shot('themes');
  await g.locator('.sol-theme').nth(1).click(); await p.waitForTimeout(500);
  await g.locator('.sol-panel-close').click(); await p.waitForTimeout(400);
  await shot('garden');
  await btn('רקע').click(); await p.waitForTimeout(400);
  await g.locator('.sol-theme').nth(2).click(); await p.waitForTimeout(500);
  await g.locator('.sol-panel-close').click(); await p.waitForTimeout(400);
  await shot('midnight');
  await btn('רקע').click(); await p.waitForTimeout(400);
  await g.locator('.sol-theme').nth(0).click(); await p.waitForTimeout(300);
  await g.locator('.sol-panel-close').click(); await p.waitForTimeout(400);

  // help panel
  await g.locator('button[aria-label="איך משחקים"]').click(); await p.waitForTimeout(500);
  boxes.help = await B();
  console.log('help:', (await g.locator('.sol-panel').innerText()).replace(/\n/g, ' | '));
  await shot('help');

  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
