// THE FILM (9:16) — "בוגה שוקו חם": the site winter area in the site own look (paper + dot grid,
// ink-outlined cards with an offset shadow, Heebo), real characters only (no caveman). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, BAR, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', lilacShadow: '#dcd0f7', line: '#dde2ed', card: '#ffffff', box: '#d9a76a', boxDark: '#b9824a' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // ---------- Hebrew text (Chrome RTL shaping, the site's font) ----------
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", sans-serif`;
  function measure(ctx, s, size, w = 800, fam) { ctx.save(); ctx.font = fontOf(size, w, fam); ctx.direction = 'rtl'; const m = ctx.measureText(s).width; ctx.restore(); return m; }
  function he(ctx, s, x, y, { size = 60, w = 800, color = C.ink, align = 'center', alpha = 1, maxW, dir = 'rtl', fam } = {}) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha *= clamp(alpha);
    let sz = size;
    if (maxW) { const mw = measure(ctx, s, sz, w, fam); if (mw > maxW) sz *= maxW / mw; }
    ctx.font = fontOf(sz, w, fam); ctx.direction = dir; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color; ctx.fillText(s, x, y);
    ctx.restore();
  }
  function card(ctx, x, y, w, h, { fill = C.card, r = 34, seed = 1, shadow = 12, lw = 4.5, stroke = C.ink, shadowColor = C.ink } = {}) {
    if (shadow) { ctx.fillStyle = shadowColor; ctx.beginPath(); ctx.roundRect(x + shadow * 0.8, y + shadow, w, h, r); ctx.fill(); }
    G.rrect(ctx, x, y, w, h, r, { fill, lw, seed, stroke, amp: 1 });
  }
  function pill(ctx, cx, cy, s, { size = 44, w = 800, bg = C.yellow, fg = C.ink, padX = 34, h, seed = 3, shadow = 7, dir = 'rtl', fam } = {}) {
    const ww = measure(ctx, s, size, w, fam) + padX * 2, hh = h || size * 1.75;
    card(ctx, cx - ww / 2, cy - hh / 2, ww, hh, { fill: bg, r: hh / 2, seed, shadow, lw: 4 });
    he(ctx, s, cx, cy + size * 0.36, { size, w, color: fg, dir, fam });
    return ww;
  }
  function popAt(ctx, t, t0, cx, cy, fn, { dur = 0.3, over = 2.2, rot = 0 } = {}) {
    const p = UI.pop(t, t0, dur, over);
    if (p <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(p, p); fn(ctx); ctx.restore();
  }
  function img(ctx, im, cx, bottom, h, { flip = false, rot = 0, alpha = 1 } = {}) {
    if (!im) return;
    const w = im.width * h / im.height;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, bottom); ctx.rotate(rot); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
  }
  function checkMark(ctx, x, y, r, p, color = C.green) {
    if (p <= 0) return;
    ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r * (0.7 + 0.3 * ease.outBack(clamp(p * 2), 2)), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.26; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const q = clamp(p * 1.6);
    ctx.beginPath(); ctx.moveTo(x - r * 0.45, y + r * 0.02);
    if (q < 0.4) ctx.lineTo(x - r * 0.45 + r * 0.3 * q / 0.4, y + r * 0.02 + r * 0.32 * q / 0.4);
    else { ctx.lineTo(x - r * 0.15, y + r * 0.34); ctx.lineTo(x - r * 0.15 + r * 0.6 * (q - 0.4) / 0.6, y + r * 0.34 - r * 0.7 * (q - 0.4) / 0.6); }
    ctx.stroke(); ctx.restore();
  }
  function confetti(ctx, t, t0, cx, cy, { n = 60, spread = 900, seed = 1 } = {}) {
    const a = t - t0;
    if (a < 0 || a > 2.2) return;
    const cols = [C.red, C.blue, C.green, '#f2b705', C.purple, C.cyan, C.orange];
    for (let i = 0; i < n; i++) {
      const r = (k) => U.hash(seed * 1000 + i * 7 + k);
      const ang = -Math.PI / 2 + (r(1) - 0.5) * 2.6, sp = spread * (0.45 + r(2) * 0.6);
      const x = cx + Math.cos(ang) * sp * a, y = cy + Math.sin(ang) * sp * a + 900 * a * a;
      ctx.save(); ctx.globalAlpha = clamp(1.6 - a); ctx.translate(x, y); ctx.rotate(a * (4 + r(3) * 8)); ctx.scale(1, Math.abs(Math.cos(a * 7 + i)));
      ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-11, -6, 22, 12); ctx.restore();
    }
  }

  // ---------- backgrounds ----------
  function bg(ctx) {
    ctx.drawImage(Studio.cache('bg', (x) => {
      x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.09)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }
  // the elections page hero: lilac → pink → yellow
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the step header: number badge + title + subtitle (RTL) ----------
  function header(ctx, t, f) {
    popAt(ctx, t, f.t, RIGHT - 52, 318, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 52, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 52, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, 22, { size: 64, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, RIGHT - 126 + dx, 345, { size: 72, w: 900, align: 'right', alpha: a, maxW: SAFE.w - 130 });
    he(ctx, f.sub, RIGHT, 428, { size: 40, w: 500, color: C.muted, align: 'right', alpha: UI.fadeIn(t, f.t + 0.2, 0.25), maxW: SAFE.w });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = RIGHT - 126, len = Math.min(measure(ctx, f.title, 72, 900), SAFE.w - 130) * u;
      G.line(ctx, [[x1, 366], [x1 - len, 370]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
  }

  // wrap a Hebrew line into at most `max` lines that fit width w
  function wrap(ctx, str, size, w, weight = 500, max = 2) {
    const words = str.split(' '), lines = []; let cur = '';
    for (const wd of words) { const tryS = cur ? cur + ' ' + wd : wd; if (measure(ctx, tryS, size, weight) > w && cur) { lines.push(cur); cur = wd; } else cur = tryS; }
    if (cur) lines.push(cur); return lines.slice(0, max);
  }


  // ---------- small helpers for this film ----------
  const isHe = (s) => (/[א-ת]/.test(s) ? 'rtl' : 'ltr');
  // an item card: emoji badge on the right, title + one line (RTL)
  function itemCard(ctx, x, y, w, h, [e, title, line], { color = C.blue, seed = 1, big = false } = {}) {
    card(ctx, x, y, w, h, { seed, r: 30, shadow: 9, lw: 4 });
    const bs = big ? 120 : 84, bx = x + w - 26 - bs / 2, by = y + 26 + bs / 2;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx + 4, by + 5, bs / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color + '33'; ctx.beginPath(); ctx.arc(bx, by, bs / 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.stroke();
    he(ctx, e, bx, by + bs * 0.18, { size: bs * 0.5, w: 400 });
    const tx = bx - bs / 2 - 14;
    he(ctx, title, tx, by + 14, { size: big ? 46 : 40, w: 900, align: 'right', maxW: tx - x - 16 });
    wrap(ctx, line, 31, w - 52, 500, 3).forEach((ln, i) => he(ctx, ln, x + w - 26, y + 26 + bs + 46 + i * 40, { size: 31, w: 500, color: C.muted, align: 'right' }));
  }
  const GX = SAFE.x, GW = SAFE.w, GAP = 24, CW = (GW - GAP) / 2;
  // 2-column grid slot k (RTL: the first card is on the right)
  const slot = (k, y0, h, gap = 20) => [GX + (k % 2 === 0 ? CW + GAP : 0), y0 + Math.floor(k / 2) * (h + gap)];
  function gridShot(ctx, t, step, cards, items, { y0 = 470, h = 292, tilt = 0.012 } = {}) {
    bg(ctx); header(ctx, t, step);
    items.forEach((it, k) => {
      const [x, y] = slot(k, y0, h);
      popAt(ctx, t, cards[k].t, x + CW / 2, y + h / 2, (c) => itemCard(c, -CW / 2, -h / 2, CW, h, it, { color: step.color, seed: 300 + step.n * 10 + k }), { rot: (k % 2 ? 1 : -1) * tilt, dur: 0.26, over: 2 });
    });
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    he(ctx, 'כולם בבית, והשעמום כבר כאן?', W / 2, 330, { size: 52, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: SAFE.w });
    popAt(ctx, t, ev.q1, W / 2, 570, (c) => he(c, 'גשם בחוץ', 0, 0, { size: 190, w: 900 }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 790, (c) => he(c, 'מה עושים?', 0, 0, { size: 190, w: 900, color: C.red }), { rot: 0.025 });
    popAt(ctx, t, ev.title, W / 2, 960, (c) => pill(c, 0, 0, 'בוגה שוקו חם ☕', { size: 72, w: 900, bg: C.blue, fg: '#fff', padX: 48, seed: 12 }), { rot: -0.03, dur: 0.35 });
    const ws = S.hookPills.map((p) => measure(ctx, `${p.e} ${p.s}`, 38, 800) + 52 + 14);
    let cx = W / 2 + ws.reduce((a, b) => a + b, 0) / 2;
    S.hookPills.forEach((p, k) => {
      const x = cx - ws[k] / 2; cx -= ws[k];
      popAt(ctx, t, p.t, x, 1085, (c) => pill(c, 0, 0, `${p.e} ${p.s}`, { size: 38, w: 800, bg: '#fff', seed: 20 + p.i, shadow: 6, padX: 26 }), { rot: [-0.03, 0.02, -0.02][p.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1210); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחינם, בלי הרשמה', { size: 60, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    const gp = ease.outBack(clamp((t - ev.q2) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.boy, 780, 1640 + (1 - gp) * 520 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 340, { rot: 0.03 });
    popAt(ctx, t, ev.q2 + 0.3, 330, 1430, (c) => he(c, '☔', 0, 0, { size: 150, w: 400 }), { rot: -0.05 });
  }

  // ================= 1. GAMES TOGETHER ON THE SCREEN =================
  function tvAndPhones(ctx, t, x, y, w, h) {
    // a TV on the left of the featured card, three phones answering
    const tx = x + 40, ty = y + 40, tw = 330, th = 190;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(tx + 6, ty + 7, tw, th, 18); ctx.fill();
    ctx.fillStyle = '#1d2250'; ctx.beginPath(); ctx.roundRect(tx, ty, tw, th, 18); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    he(ctx, '🔴 בוגה לייב', tx + tw / 2, ty + 86, { size: 44, w: 900, color: '#fff' });
    he(ctx, 'הקוד על המסך', tx + tw / 2, ty + 142, { size: 32, w: 600, color: '#ffe48a' });
    for (let i = 0; i < 3; i++) {
      const px = tx + 30 + i * 100, py = y + h - 150, p = UI.pop(t, S.screenCards[0].t + 0.25 + i * 0.12, 0.25, 2);
      if (p <= 0) continue;
      ctx.save(); ctx.translate(px + 36, py + 60); ctx.scale(p, p);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-36 + 4, -60 + 5, 72, 120, 14); ctx.fill();
      ctx.fillStyle = ['#ffe3ea', '#e0eeff', '#e3f6ea'][i]; ctx.beginPath(); ctx.roundRect(-36, -60, 72, 120, 14); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.stroke();
      he(ctx, ['A', 'B', 'C'][i], 0, 12, { size: 40, w: 900, dir: 'ltr', color: [C.red, C.blue, C.green][i] });
      ctx.restore();
    }
  }
  function shotScreen(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const C0 = S.screenCards[0], LH = 330, LY = 480;
    popAt(ctx, t, C0.t, W / 2, LY + LH / 2, (c) => {
      card(c, -GW / 2, -LH / 2, GW, LH, { seed: 311, r: 34, fill: '#fff8f9' });
      tvAndPhones(c, t, -GW / 2, -LH / 2, GW, LH);
      const [e, title, line] = S.DATA.screen.live;
      he(c, title, GW / 2 - 36, -40, { size: 66, w: 900, align: 'right' });
      he(c, line, GW / 2 - 36, 30, { size: 34, w: 600, color: C.muted, align: 'right', maxW: GW - 440 });
      he(c, 'מעולה לערב משפחתי', GW / 2 - 36, 96, { size: 36, w: 800, color: C.red, align: 'right' });
    }, { rot: -0.01, dur: 0.3 });
    S.DATA.screen.cards.forEach((it, k) => {
      const [x, y] = slot(k, LY + LH + 24, 262, 20);
      popAt(ctx, t, S.screenCards[k + 1].t, x + CW / 2, y + 131, (c) => itemCard(c, -CW / 2, -131, CW, 262, it, { color: C.red, seed: 320 + k }), { rot: (k % 2 ? 1 : -1) * 0.012, dur: 0.26, over: 2 });
    });
    popAt(ctx, t, S.endPills.screen.t, W / 2, 1478, (c) => pill(c, 0, 0, '📱 כל אחד מהטלפון, בלי הרשמה', { size: 42, w: 900, bg: C.yellow, seed: 330, padX: 36 }), { rot: -0.02 });
  }

  // ================= 2. PRINT =================
  function shotPrint(ctx, t) {
    gridShot(ctx, t, S.steps[1], S.printCards, S.DATA.print.cards);
    popAt(ctx, t, S.endPills.print.t, W / 2, 1478, (c) => pill(c, 0, 0, S.DATA.print.treasure, { size: 46, w: 900, bg: C.yellow, seed: 340, padX: 40 }), { rot: -0.02 });
  }

  // ================= 3. SOFA =================
  function shotSofa(ctx, t) {
    gridShot(ctx, t, S.steps[2], S.sofaCards, S.DATA.sofa.cards);
    // the five-second ring on the "קטגוריה בחמש שניות" card (slot 4, bottom right)
    const [x, y] = slot(4, 470, 292), k = (t - S.tick5) / (5 * BEAT / 2);
    if (t >= S.tick5 && k < 1.1) {
      const cx = x + 56, cy = y + 56, p = clamp(k);
      ctx.save(); ctx.lineWidth = 9; ctx.strokeStyle = '#e3e6ee'; ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = C.purple; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, 36, -Math.PI / 2, -Math.PI / 2 + (1 - p) * Math.PI * 2); ctx.stroke(); ctx.restore();
      he(ctx, String(Math.max(1, 5 - Math.floor(p * 5))), cx, cy + 15, { size: 44, w: 900, dir: 'ltr', color: C.purple });
    }
    popAt(ctx, t, S.endPills.sofa.t, W / 2, 1478, (c) => pill(c, 0, 0, '🛋️ בלי מדפסת ובלי ציוד', { size: 46, w: 900, bg: C.yellow, seed: 350, padX: 40 }), { rot: 0.02 });
  }

  // ================= 4. KITCHEN =================
  function shotKitchen(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const RH = 148, RG = 16, y0 = 470;
    S.DATA.kitchen.rows.forEach((it, k) => {
      const y = y0 + k * (RH + RG);
      popAt(ctx, t, S.kitchenRows[k].t, W / 2, y + RH / 2, (c) => {
        card(c, -GW / 2, -RH / 2, GW, RH, { seed: 360 + k, r: 28, shadow: 8, lw: 4, fill: k % 2 ? '#fffdf2' : '#fff' });
        const [e, title, line] = it;
        c.fillStyle = C.ink; c.beginPath(); c.arc(GW / 2 - 76 + 4, 5, 52, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffe9b8'; c.beginPath(); c.arc(GW / 2 - 76, 0, 52, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 3.5; c.stroke();
        he(c, e, GW / 2 - 76, 20, { size: 54, w: 400 });
        he(c, title, GW / 2 - 150, -12, { size: 44, w: 900, align: 'right', maxW: GW - 190 });
        he(c, line, GW / 2 - 150, 38, { size: 30, w: 500, color: C.muted, align: 'right', maxW: GW - 190 });
      }, { rot: (k % 2 ? 1 : -1) * 0.008, dur: 0.26, over: 2 });
    });
    popAt(ctx, t, S.endPills.kitchen.t, W / 2, 1490, (c) => pill(c, 0, 0, '🍲 הילדים מכינים איתכם', { size: 44, w: 900, bg: C.yellow, seed: 370, padX: 38 }), { rot: -0.02 });
  }

  // ================= 5. WINTER HOLIDAYS =================
  function shotHolidays(ctx, t) {
    gridShot(ctx, t, S.steps[4], S.holidayCards, S.DATA.holidays.cards);
    popAt(ctx, t, S.endPills.holidays.t, W / 2, 1478, (c) => pill(c, 0, 0, '🕎 חנוכה ו-🌳 ט״ו בשבט', { size: 46, w: 900, bg: C.yellow, seed: 380, padX: 40 }), { rot: 0.02 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, W / 2, 580, (c) => {
      const s = 320;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 80); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 905 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'כל החורף במקום אחד', W / 2, 1000, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'בחינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190, padX: 44 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1240, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בתפריט המשחקים: בוגה שוקו חם ☕', W / 2, 1375, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotScreen },
    { t0: T(4), fn: shotPrint },
    { t0: T(6), fn: shotSofa },
    { t0: T(8), fn: shotKitchen },
    { t0: T(10), fn: shotHolidays },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.logo = await L('img/logo.svg');
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        const e = 1 - Math.pow(1 - u, 4);
        ctx.save(); ctx.translate(e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((e - 1) * W, 0); sec.fn(ctx, t); ctx.restore();
        const f = S.steps[i - 1] || { color: C.blue };
        ctx.fillStyle = f.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
