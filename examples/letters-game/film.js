// THE FILM (9:16) — "איזו מהן האות ד׳?": the Hebrew letters game (/letters/game) in the site own look. Pure function of t.
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



  // ---- the certificate the way the site draws it: colored rays, a cream card, a star, title, name line, wording, date + signer ----
  const RAY_COLORS = ['#ff8fb1', '#ffd66b', '#8fd3ff', '#b9a2ff', '#9be7b4', '#ffb38a'];
  function star5(c, cx, cy, R, fill, edge) {
    const path = (dx, dy) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.46 : R; c.lineTo(cx + dx + Math.cos(a) * r, cy + dy + Math.sin(a) * r); } c.closePath(); };
    path(0, R * 0.07); c.fillStyle = edge; c.fill(); path(0, 0); c.fillStyle = fill; c.fill();
  }
  // o: {title, name, reason, date, signer, pn, pr, ps} (pn/pr/ps = 0..1 reveal of name / wording / date+signer)
  function cert(c, w, h, o) {
    const mn = Math.min(w, h) / 100;
    card(c, -w / 2, -h / 2, w, h, { fill: '#fff', r: 18, seed: o.seed || 5, shadow: 10, lw: 4.5 });
    c.save(); c.beginPath(); c.roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 16); c.clip();
    for (let i = 0; i < 24; i++) {
      const a1 = (i * 15 - 90) * Math.PI / 180, a2 = ((i + 1) * 15 - 90) * Math.PI / 180, r = Math.max(w, h);
      c.fillStyle = RAY_COLORS[i % 6]; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a1) * r, Math.sin(a1) * r); c.lineTo(Math.cos(a2) * r, Math.sin(a2) * r); c.closePath(); c.fill();
    }
    c.restore();
    const cw = w * 0.78, ch = h * 0.84, top = -ch / 2;
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-cw / 2 - 6, top - 6, cw + 12, ch + 12, w * 0.045); c.fill();
    c.fillStyle = '#fffdf7'; c.beginPath(); c.roundRect(-cw / 2, top, cw, ch, w * 0.04); c.fill();
    c.save(); c.translate(cw / 2 - 4, top + 8); c.rotate(-0.21); star5(c, 0, 0, mn * 10.5, '#ffc531', '#e59a00'); c.restore();
    he(c, o.title, 4, top + ch * 0.2, { size: mn * 12, w: 900, color: '#ffd66b', maxW: cw - mn * 22 });
    he(c, o.title, 0, top + ch * 0.2 - 3, { size: mn * 12, w: 900, color: '#e8457a', maxW: cw - mn * 22 });
    he(c, 'התעודה מוענקת ל:', 0, top + ch * 0.34, { size: mn * 5.2, w: 700, color: '#2b2350' });
    const ny = top + ch * 0.52;
    c.fillStyle = '#2b2350'; c.fillRect(-cw * 0.3, ny + mn * 1.6, cw * 0.6, 3);
    if (o.pn > 0) he(c, o.name, 0, ny, { size: mn * 9.6, w: 900, color: '#2b2350', alpha: o.pn, maxW: cw * 0.58 });
    if (o.pr > 0) wrap(c, o.reason, mn * 5.3, cw * 0.84, 600, 2).forEach((ln, i, arr) => he(c, ln, 0, top + ch * 0.68 + i * mn * 6.6, { size: mn * 5.3, w: 600, color: '#2b2350', alpha: o.pr, maxW: cw * 0.86 }));
    const sy = top + ch - mn * 6.2;
    [[cw * 0.9 / 2 - cw * 0.16, 'תאריך', o.date, o.ps], [-cw * 0.9 / 2 + cw * 0.16, o.signer, '', 1]].forEach(([x, lab, val, p]) => {
      c.fillStyle = '#5b5678'; c.fillRect(x - cw * 0.15, sy - mn * 4.2, cw * 0.3, 2.5);
      he(c, lab, x, sy, { size: mn * 3.8, w: 600, color: '#5b5678', maxW: cw * 0.3 });
      if (val && p > 0) he(c, val, x, sy - mn * 5.2, { size: mn * 4.6, w: 800, color: '#2b2350', alpha: p, maxW: cw * 0.3 });
    });
  }

  // a big letter card (the game's answer button): ink outline, white, optional state
  function letterCard(c, x, y, w, h, ch, { state = '', size = 150, seed = 1, num = 0 } = {}) {
    const fill = state === 'right' ? '#bbf7d0' : state === 'wrong' ? '#fee2e2' : '#fff';
    c.save(); if (state === 'wrong') c.globalAlpha *= 0.55;
    card(c, x - w / 2, y - h / 2, w, h, { fill, r: 30, seed, shadow: 9, lw: state === 'right' ? 6 : 4.5, stroke: state === 'right' ? C.green : C.ink });
    he(c, ch, x, y + size * 0.36, { size, w: 900, color: C.ink });
    if (num) { c.fillStyle = C.red; c.beginPath(); c.arc(x + w / 2 - 38, y - h / 2 + 38, 30, 0, Math.PI * 2); c.fill(); he(c, String(num), x + w / 2 - 38, y - h / 2 + 52, { size: 40, w: 900, color: '#fff', dir: 'ltr' }); }
    c.restore();
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 285, (c) => pill(c, 0, 0, '🎮 משחק אותיות לגן', { size: 40, w: 800, bg: C.purple, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 450, (c) => he(c, 'איזו מהן האות', 0, 0, { size: 104, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 685, (c) => he(c, 'ד׳ ? 🤔', 0, 0, { size: 190, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    S.hookOpts.forEach((o) => {
      const col = o.i % 3, row = Math.floor(o.i / 3), x = 815 - col * 275, y = 1010 + row * 295;
      popAt(ctx, t, o.t, x, y, (c) => letterCard(c, 0, 0, 240, 262, S.HOOK_LETTERS[o.i], { size: 170, seed: 20 + o.i, num: o.i + 1 }), { rot: [-0.02, 0.015, -0.01, 0.012, -0.015, 0.02][o.i], dur: 0.25, over: 1.8 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(655, 1585); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'כתבו מספר בתגובות 👇', { size: 54, w: 900, bg: C.yellow, padX: 36 });
      ctx.restore();
    }
    mascot(ctx, 185, 1620 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 290, t, ev.q2);
  }

  // ================= 1. CHOOSE THE GAME =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const A = S.AUD;
    S.REASONS.forEach((lb, i) => {
      const on = i === S.AUD_PICK && t >= ev.pick;
      popAt(ctx, t, A[i].t, W / 2, 590 + i * 130, (c) => { const pr = on ? 1 + 0.04 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr); chip(c, 0, 0, 800, 108, lb, { on, color: C.blue, size: 46, seed: 30 + i }); }, { dur: 0.25, over: 1.6, rot: [0.008, -0.008, 0.006][i] });
    });
    UI.tap(ctx, W / 2 + 120, 730, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, A[3].t, W / 2, 1090, (c) => {
      card(c, -400, -140, 800, 280, { fill: '#fff', r: 26, seed: 33, shadow: 9, lw: 4.5 });
      he(c, 'שאלה ⁦1⁩ מתוך ⁦10⁩', 370, -78, { size: 34, w: 800, align: 'right', color: C.muted });
      he(c, 'באיזו אות מתחיל…', 370, 8, { size: 62, w: 900, align: 'right' });
      he(c, '🖼️ רואים תמונה, בוחרים אות', 370, 90, { size: 40, w: 700, align: 'right', color: C.ink, maxW: 760 });
    }, { dur: 0.25, over: 1.4, rot: 0.006 });
    popAt(ctx, t, S.pills[0], W / 2, 1400, (c) => pill(c, 0, 0, '10 שאלות בכל סבב, כוכבים בסוף ⭐', { size: 44, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1520, (c) => pill(c, 0, 0, 'עובד בטלפון ובמחשב 📱', { size: 44, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. CHOOSE THE LETTERS =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const xs = [790, 540, 290];
    S.SETS.forEach((lb, i) => {
      const on = i === S.TOPIC_PICK && t >= ev.topic;
      popAt(ctx, t, S.TOPICS[i].t, xs[i], 580, (c) => { const pr = on ? 1 + 0.06 * pulse(t, ev.topic, 10) : 1; c.scale(pr, pr); chip(c, 0, 0, 236, 100, lb, { on, color: C.red, size: 40, seed: 40 + i }); }, { dur: 0.22, over: 1.5, rot: [0.01, -0.01, 0.01][i] });
    });
    UI.tap(ctx, 540, 592, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, ev.reasonCard, W / 2, 1010, (c) => {
      card(c, -420, -250, 840, 500, { fill: '#fffdf7', r: 28, seed: 50, shadow: 9, lw: 4.5 });
      he(c, 'האותיות במשחק', 390, -190, { size: 34, w: 700, color: C.muted, align: 'right' });
      S.HALF.forEach((ch, i) => {
        const col = i % 4, row = Math.floor(i / 4), p = clamp((t - (ev.reasonCard + 0.12 + i * 0.05)) / 0.2);
        if (p <= 0) return;
        c.save(); c.translate(300 - col * 200, -80 + row * 135); c.scale(ease.outBack(p, 1.6), ease.outBack(p, 1.6));
        G.rrect(c, -72, -52, 144, 104, 24, { fill: '#fff', lw: 3.5, seed: 60 + i, stroke: C.ink });
        he(c, ch, 0, 34, { size: 86, w: 900, color: C.ink });
        c.restore();
      });
    }, { dur: 0.3, over: 1.4, rot: -0.008 });
    popAt(ctx, t, S.pills[2], W / 2, 1400, (c) => pill(c, 0, 0, 'זוכרים? איזו מהן ד׳? כתבו מספר 👇', { size: 44, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1520, (c) => pill(c, 0, 0, 'להורים, לגננות ולמורים 💛', { size: 40, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // the game board: question + picture + four letters (st: 'idle' | 'wrong' | 'right')
  function board(c, { q, emoji, word, letters, wrongIdx, rightIdx, t, tW, tR, count, msg, msgAlpha }) {
    card(c, -440, -400, 880, 870, { fill: '#fff9d9', r: 36, seed: 70, shadow: 11, lw: 4.5 });
    he(c, 'שאלה ⁦' + count + '⁩ מתוך ⁦10⁩', 410, -350, { size: 30, w: 800, align: 'right', color: C.ink });
    G.rrect(c, -410, -318, 820, 18, 9, { fill: '#fff', lw: 2.5, seed: 71, stroke: C.ink });
    c.fillStyle = '#ec4899'; c.beginPath(); c.roundRect(410 - 820 * (count - 1) / 10 - 0.01, -318, 820 * (count - 1) / 10 + 0.01, 18, 9); c.fill();
    he(c, q, 0, -230, { size: 62, w: 900, maxW: 800 });
    he(c, emoji, 0, -50, { size: 170, w: 400 });
    he(c, word, 0, 30, { size: 56, w: 900, color: C.green, alpha: tR });
    letters.forEach((ch, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 205 - col * 410, y = 130 + row * 130;
      const state = i === rightIdx && tR > 0 ? 'right' : i === wrongIdx && tW > 0 ? 'wrong' : '';
      const sc = state === 'right' ? 1 + 0.08 * Math.sin(Math.PI * clamp(tR)) : 1;
      c.save(); c.translate(x, y); c.scale(sc, sc); letterCard(c, 0, 0, 390, 108, ch, { state, size: 82, seed: 72 + i }); c.restore();
    });
    he(c, msg, 0, 405, { size: 46, w: 800, alpha: msgAlpha, maxW: 800 });
  }

  // ================= 3. HEAR THE WORD =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES;
    popAt(ctx, t, M0[0].t, W / 2, 830, (c) => {
      card(c, -420, -290, 840, 580, { fill: '#fff', r: 32, seed: 80, shadow: 10, lw: 4.5 });
      he(c, 'באיזו אות מתחיל…', 0, -190, { size: 70, w: 900 });
      he(c, '🍌', 0, 40, { size: 220, w: 400 });
    }, { dur: 0.3, over: 1.4, rot: -0.01 });
    const sp = t >= ev.mode ? 1 + 0.06 * pulse(t, ev.mode, 10) : 1;
    popAt(ctx, t, M0[1].t, W / 2, 1230, (c) => { c.scale(sp, sp); pill(c, 0, 0, '🔊 שמעו את המילה', { size: 58, w: 900, bg: C.purple, fg: '#fff', padX: 70, seed: 82 }); }, { dur: 0.3, over: 1.6, rot: 0.012 });
    UI.tap(ctx, W / 2 + 60, 1245, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    // sound waves after the tap
    const a = t - ev.mode;
    if (a > 0 && a < 1.6) for (let k = 0; k < 3; k++) { const p = clamp((a - k * 0.3) / 0.9); if (p > 0 && p < 1) { ctx.save(); ctx.globalAlpha = 0.55 * (1 - p); ctx.strokeStyle = C.purple; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(W / 2, 1230, 200 + p * 260, -0.5, 0.5); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2, 1230, 200 + p * 260, Math.PI - 0.5, Math.PI + 0.5); ctx.stroke(); ctx.restore(); } }
    popAt(ctx, t, M0[2].t, W / 2, 1420, (c) => pill(c, 0, 0, 'אין צורך לדעת לקרוא', { size: 46, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, M0[3].t, W / 2, 1535, (c) => pill(c, 0, 0, 'גם האות נאמרת בקול 🗣️', { size: 42, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. ANSWER =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const wrongP = clamp((t - ev.go) / 0.2), rightP = clamp((t - ev.ans) / 0.4);
    popAt(ctx, t, S.ROWS[0].t, W / 2, 900, (c) => board(c, {
      q: 'באיזו אות מתחיל…', emoji: '🐱', word: 'חתול', letters: ['ה', 'ח', 'ת', 'כ'], wrongIdx: 0, rightIdx: 1,
      tW: wrongP, tR: rightP, count: 3, msg: rightP > 0 ? 'נכון! 👏' : wrongP > 0 ? 'נסו שוב 🙂' : '', msgAlpha: clamp(Math.max(wrongP, rightP) * 2),
    }), { dur: 0.3, over: 1.35, rot: -0.008 });
    UI.tap(ctx, W / 2 + 205, 1075, t, ev.go, { color: 'rgba(224,138,0,0.8)', size: 110 });
    UI.tap(ctx, W / 2 - 205, 1075, t, ev.ans - 0.0, { color: 'rgba(35,135,77,0.8)', size: 110 });
    confetti(ctx, t, ev.ans, W / 2, 1000, { n: 55, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[4], W / 2, 1470, (c) => pill(c, 0, 0, 'התשובה הנכונה נצבעת בירוק ✅', { size: 40, w: 900, bg: C.lilac, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1585, (c) => pill(c, 0, 0, 'צליל קטן לכל תשובה 🔔', { size: 40, w: 900, bg: C.yellow, seed: 88, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. STARS =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems;
    popAt(ctx, t, I[0].t, W / 2, 940, (c) => {
      card(c, -440, -300, 880, 600, { fill: '#fff9d9', r: 36, seed: 100, shadow: 11, lw: 4.5 });
      he(c, 'כל הכבוד! אלופים!', 0, 70, { size: 84, w: 900, maxW: 800 });
      he(c, 'צדקתם בפעם הראשונה ב־⁦9⁩ מתוך ⁦10⁩', 0, 170, { size: 48, w: 700, maxW: 800 });
    }, { dur: 0.32, over: 1.3, rot: -0.01 });
    [[-1, 0], [0, 1], [1, 2]].forEach(([dx, j]) => {
      popAt(ctx, t, I[1 + j].t, W / 2 + dx * 220, 800 - (dx === 0 ? 40 : 0), (c) => star5(c, 0, 0, 100, '#ffc531', '#e59a00'), { dur: 0.3, over: 2, rot: [-0.2, 0, 0.2][j] });
    });
    popAt(ctx, t, ev.printBtn, W / 2, 1345, (c) => pill(c, 0, 0, '🔄 משחק חדש', { size: 74, w: 900, bg: C.green, fg: '#fff', padX: 80, seed: 112 }), { rot: -0.04, dur: 0.35 });
    confetti(ctx, t, ev.printBtn, W / 2, 1335, { n: 70, seed: 8, spread: 900 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1470, (c) => pill(c, 0, 0, 'לגן חובה, להכנה לכיתה א׳ ולכיתה א׳', { size: 40, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1580, (c) => pill(c, 0, 0, 'יש גם משחק ABC באנגלית 🔤', { size: 40, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // the six numbered letters again, small, under the question
  function endOpts(ctx, t, t0) {
    S.HOOK_LETTERS.forEach((ch, i) => {
      const x = 775 - (i % 3) * 235, y = 1330 + Math.floor(i / 3) * 160;
      popAt(ctx, t, t0 + i * 0.06, x, y, (c) => {
        G.rrect(c, -95, -75, 190, 150, 30, { fill: '#fff', lw: 4, seed: 150 + i, stroke: C.ink });
        he(c, ch, 0, 40, { size: 110, w: 900, color: C.ink });
        c.fillStyle = C.red; c.beginPath(); c.arc(68, -50, 27, 0, Math.PI * 2); c.fill();
        he(c, String(i + 1), 68, -36, { size: 36, w: 900, color: '#fff', dir: 'ltr' });
      }, { dur: 0.22, over: 1.5 });
    });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 440); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 440, 340, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 720 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'משחק אותיות לגן', W / 2, 800, { size: 56, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 885, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 990, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'חפשו באתר: משחק אותיות 🔎', W / 2, 1090, { size: 40, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1185, (c) => pill(c, 0, 0, '✍️ איזו מהן האות ד׳?', { size: 54, w: 900, bg: C.red, fg: '#fff', padX: 44, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
    endOpts(ctx, t, L[4].t + 0.25);
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1630, (c) => pill(c, 0, 0, 'כתבו מספר בתגובות 👇', { size: 46, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
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
