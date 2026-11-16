// THE FILM (9:16) — "כמה משבצות מתאימות לכם?": the bingo card maker in the site own look. Pure function of t.
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


  const BOX = (ctx, x, y, w, h, o) => card(ctx, x, y, w, h, o);
  // a chip (rounded pill) at center x,y with given fill
  function chip(ctx, cx, cy, w, h, s, { on = false, color = C.blue, size = 34, seed = 1 } = {}) {
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed, stroke: on ? C.ink : C.line });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800, color: on ? '#fff' : C.ink, maxW: w - 24 });
  }

  // the mascot (the owner's logo character); falls back to the old logo
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }



  const numDot = (c, x, y, n, r = 30) => {
    c.fillStyle = C.ink; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    he(c, String(n), x, y + r * 0.36, { size: r * 1.05, w: 900, color: '#fff', dir: 'ltr' });
  };
  // a bingo card the way the site draws it: ink-outlined card, title, an n x n grid of cells
  function bingoCard(c, cx, cy, w, items, n, title, { cellFont = 28, seed = 1, marks = [], tFont = 40 } = {}) {
    const pad = 22, titleH = 78, gap = 6, cw = (w - pad * 2 - gap * (n - 1)) / n, h = pad * 2 + titleH + cw * n + gap * (n - 1);
    card(c, cx - w / 2, cy - h / 2, w, h, { fill: '#fff', r: 30, seed, shadow: 10, lw: 4.5 });
    he(c, title, cx, cy - h / 2 + pad + 46, { size: tFont, w: 900, maxW: w - 60 });
    items.forEach((s, i) => {
      const r = Math.floor(i / n), k = i % n;
      const x = cx + w / 2 - pad - cw - k * (cw + gap), y = cy - h / 2 + pad + titleH + r * (cw + gap);
      G.rrect(c, x, y, cw, cw, 8, { fill: marks.includes(i) ? '#e6f6ec' : '#fff', lw: 2.5, seed: seed * 10 + i, stroke: C.ink, amp: 0.4 });
      const lines = wrap(c, s, cellFont, cw - 12, 700, 3);
      lines.forEach((ln, li) => he(c, ln, x + cw / 2, y + cw / 2 + cellFont * 0.34 - (lines.length - 1) * cellFont * 0.55 + li * cellFont * 1.1, { size: cellFont, w: 700, maxW: cw - 10 }));
    });
    return { h, cw, gap, pad, titleH };
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 290, (c) => pill(c, 0, 0, '🎯 בינגו היכרות', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 470, (c) => he(c, 'כמה משבצות פה', 0, 0, { size: 118, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 625, (c) => he(c, 'מתאימות לכם?', 0, 0, { size: 140, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    S.hookOpts.forEach((o) => {
      popAt(ctx, t, o.t, W / 2, 810 + o.i * 160, (c) => {
        for (let k = 0; k < 3; k++) {
          const x = 285 - k * 285, s = S.HOOK_GRID[o.i * 3 + k];
          card(c, x - 132, -68, 264, 136, { seed: 20 + o.i * 3 + k, shadow: 7, r: 24, lw: 4 });
          wrap(c, s, 36, 232, 800, 3).forEach((ln, li, arr) => he(c, ln, x, 12 - (arr.length - 1) * 22 + li * 44, { size: 36, w: 800, maxW: 236 }));
        }
      }, { rot: [-0.012, 0.012, -0.01][o.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(730, 1330); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'ספרו בראש 🙋', { size: 50, w: 900, bg: C.yellow, padX: 40 });
      ctx.restore();
    }
    mascot(ctx, 295, 1500 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 500, t, ev.q2);
  }

  // ================= 1. PICK A PACK =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.AUD.forEach((o) => {
      const col = o.i % 2, row = Math.floor(o.i / 2), x = col === 0 ? 745 : 335, y = 630 + row * 190;
      const on = t >= ev.pick && o.i === S.AUD_PICK;
      popAt(ctx, t, o.t, x, y, (c) => {
        const pr = on ? 1 + 0.05 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr);
        chip(c, 0, 0, 380, 118, S.PACKS[o.i], { on, color: [C.blue, C.red, C.green, C.purple, C.orange, C.red, C.blue, C.green][o.i], size: 38, seed: 30 + o.i });
      }, { dur: 0.25, over: 1.6, rot: [0.01, -0.01][o.i % 2] });
    });
    UI.tap(ctx, 335, 780, t, ev.pick, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, S.pills[0], W / 2, 1450, (c) => pill(c, 0, 0, 'בכל חבילה ⁦24⁩ פריטים', { size: 46, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1580, (c) => pill(c, 0, 0, 'אפשר גם לכתוב רשימה בעצמכם ✏️', { size: 44, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. PICK A SIZE =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const labels = ['⁦3×3⁩ (⁦9⁩ משבצות)', '⁦4×4⁩ (⁦16⁩ משבצות)', '⁦5×5⁩ (⁦25⁩ משבצות)'];
    S.TOPICS.slice(0, 3).forEach((o) => {
      const on = t >= ev.topic && o.i === S.TOPIC_PICK;
      popAt(ctx, t, o.t, 810 - o.i * 270, 560, (c) => {
        const pr = on ? 1 + 0.05 * pulse(t, ev.topic, 10) : 1; c.scale(pr, pr);
        chip(c, 0, 0, 255, 104, labels[o.i], { on, color: C.red, size: 27, seed: 40 + o.i });
      }, { dur: 0.22, over: 1.5, rot: [0.008, -0.008, 0.008][o.i] });
    });
    UI.tap(ctx, 540, 580, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    const rows = S.TOPICS.slice(3);
    // the 4x4 preview card pops row by row (cells appear with their row)
    const shown = rows.filter((o) => t >= o.t).length;
    if (shown > 0) {
      const n = 4;
      popAt(ctx, t, rows[0].t, W / 2, 1010, (c) => {
        const items = S.CARDS[0].slice(0, shown * 4);
        bingoCard(c, 0, 0, 760, items, n, 'יום הולדת ⁦#1⁩', { cellFont: 27, seed: 44 });
      }, { dur: 0.2, over: 1.2, rot: -0.008 });
    }
    popAt(ctx, t, S.pills[2], W / 2, 1480, (c) => pill(c, 0, 0, 'ב־⁦5×5⁩ המשבצת האמצעית חופשית ★', { size: 42, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1600, (c) => pill(c, 0, 0, 'בין ⁦9⁩ ל־⁦16⁩ משבצות עובד הכי טוב', { size: 42, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. CREATE 6 CARDS =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES;
    const press = t >= ev.mode ? 1 - 0.08 * pulse(t, ev.mode, 10) : 1;
    popAt(ctx, t, M0[0].t, W / 2, 575, (c) => { c.scale(press, press); pill(c, 0, 0, '🎯 צרו ⁦6⁩ כרטיסים!', { size: 54, w: 900, bg: C.red, fg: '#fff', padX: 80, seed: 71 }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 590, t, ev.mode, { color: 'rgba(207,47,86,0.8)', size: 120 });
    const placing = [{ k: 2, x: W / 2 + 120, y: 1120, rot: 0.09 }, { k: 1, x: W / 2 - 110, y: 1090, rot: -0.07 }, { k: 0, x: W / 2, y: 1120, rot: -0.008 }];
    placing.forEach((p, j) => {
      popAt(ctx, t, M0[1 + j].t, p.x, p.y, (c) => bingoCard(c, 0, 0, 640, S.CARDS[p.k], 4, 'BUGA בינגו ⁦#' + (p.k + 1) + '⁩', { cellFont: 28, seed: 72 + p.k }), { dur: 0.3, over: 1.4, rot: p.rot });
    });
    popAt(ctx, t, M0[4].t, W / 2, 1560, (c) => pill(c, 0, 0, 'כל לחיצה יוצרת ⁦6⁩ כרטיסים שונים', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. PRINT =================
  function sheet(c, i) {
    card(c, -150, -215, 300, 430, { fill: '#fff', r: 14, seed: 90 + i, shadow: 9, lw: 4 });
    he(c, 'בינגו · כרטיס ⁦' + (i + 1) + '⁩', 0, -168, { size: 29, w: 900, maxW: 250 });
    he(c, 'סמנו שורה, טור או אלכסון', 0, -134, { size: 21, w: 500, color: C.muted, maxW: 250 });
    const n = 4, cw = 54, x0 = -cw * n / 2, y0 = -105;
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) G.rrect(c, x0 + k * cw, y0 + r * cw, cw, cw, 3, { fill: '#fff', lw: 2, seed: i * 20 + r * 4 + k, stroke: C.ink, amp: 0.3 });
    he(c, 'עוגה בוגה · ugabuga.co.il', 0, 190, { size: 20, w: 700, color: C.muted, maxW: 250 });
  }
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const press = t >= ev.go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    popAt(ctx, t, T(8, 0.05), W / 2, 580, (c) => { c.scale(press, press); pill(c, 0, 0, '🖨️ הדפיסו כרטיסים', { size: 54, w: 900, bg: C.purple, fg: '#fff', padX: 80, seed: 83 }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 595, t, ev.go, { color: 'rgba(138,79,216,0.8)', size: 120 });
    S.ROWS.forEach((r) => {
      const x = 805 - r.i * 265, rot = [-0.03, 0.02, -0.02][r.i];
      popAt(ctx, t, r.t, x, 920, (c) => sheet(c, r.i), { dur: 0.3, over: 1.5, rot });
    });
    popAt(ctx, t, ev.ans, W / 2, 1230, (c) => pill(c, 0, 0, 'הכרטיסים מוכנים! 🖨️', { size: 60, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.ans, W / 2, 1210, { n: 60, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[4], W / 2, 1380, (c) => pill(c, 0, 0, 'מדפיסים כמה כרטיסים שונים', { size: 44, w: 900, bg: C.lilac, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1500, (c) => pill(c, 0, 0, 'סמנו שורה, טור או אלכסון', { size: 44, w: 900, bg: C.yellow, seed: 86, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. PLAY: mark a full row =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems, MARK = [3, 4, 5];
    const w = 800, cy = 980;
    ctx.save();
    popAt(ctx, t, T(10, -0.25), W / 2, cy, (c) => {
      const info = bingoCard(c, 0, 0, w, S.HOOK_GRID, 3, 'היכרות ⁦#1⁩', { cellFont: 40, seed: 100, tFont: 50 });
      const { cw, gap, pad, titleH, h } = info;
      MARK.forEach((cell, j) => {
        const p = clamp((t - I[j].t) / 0.3);
        if (p <= 0) return;
        const r = Math.floor(cell / 3), k = cell % 3;
        const x = w / 2 - pad - cw / 2 - k * (cw + gap), y = -h / 2 + pad + titleH + cw / 2 + r * (cw + gap);
        c.save(); c.translate(x, y); const s = 0.6 + 0.4 * ease.outBack(p, 2); c.scale(s, s); c.globalAlpha = clamp(p * 2);
        c.strokeStyle = C.red; c.lineWidth = 11; c.beginPath(); c.ellipse(0, 0, cw * 0.44, cw * 0.4, -0.15, 0, Math.PI * 2 * clamp(p * 1.4)); c.stroke();
        c.restore();
      });
      const sp = clamp((t - I[3].t) / 0.35);
      if (sp > 0) {
        const y = -h / 2 + pad + titleH + cw / 2 + (cw + gap);
        c.save(); c.globalAlpha = 0.28 * sp; c.fillStyle = C.green; c.fillRect(-w / 2 + 14, y - cw / 2, w - 28, cw); c.restore();
      }
    }, { dur: 0.3, over: 1.3, rot: -0.006 });
    ctx.restore();
    popAt(ctx, t, ev.printBtn, W / 2, 1450, (c) => pill(c, 0, 0, 'בינגו! 🎉', { size: 90, w: 900, bg: C.red, fg: '#fff', padX: 70, seed: 112 }), { rot: -0.04, dur: 0.35 });
    confetti(ctx, t, ev.printBtn, W / 2, 1440, { n: 70, seed: 8, spread: 900 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1600, (c) => pill(c, 0, 0, 'הראשונים שמשלימים שורה, טור או אלכסון', { size: 38, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1715, (c) => pill(c, 0, 0, 'צועקים: בינגו! 📣', { size: 42, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 570, 450, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 905 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'יוצר כרטיסי בינגו להדפסה', W / 2, 1000, { size: 52, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בקטגוריית משחקים 🎯', W / 2, 1350, { size: 40, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1465, (c) => pill(c, 0, 0, '✍️ כמה משבצות התאימו לכם? כתבו בתגובות', { size: 44, w: 900, bg: C.red, fg: '#fff', padX: 40, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }
  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotAud },
    { t0: T(4), fn: shotTopics },
    { t0: T(6), fn: shotModes },
    { t0: T(8), fn: shotPlay },
    { t0: T(10), fn: shotPrint },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.logo = (await L('img/mascot.png')) || (await L('img/logo.svg'));
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
