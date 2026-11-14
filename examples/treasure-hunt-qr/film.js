// THE FILM (9:16) — "איפה הקוד הבא?": the QR treasure hunt maker in the site own look. Pure function of t.
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


  // ---------- QR drawing (the real module matrices of the real station URLs) ----------
  function drawQR(ctx, rows, x, y, size) {
    const n = rows.length, q = 2, cell = size / (n + q * 2);
    ctx.fillStyle = '#fff'; ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#000';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (rows[r][c] === '1') ctx.fillRect(x + (c + q) * cell, y + (r + q) * cell, cell + 0.6, cell + 0.6);
  }
  const numDot = (c, x, y, n, r = 30) => {
    c.fillStyle = C.ink; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    he(c, String(n), x, y + r * 0.36, { size: r * 1.05, w: 900, color: '#fff', dir: 'ltr' });
  };

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 290, (c) => pill(c, 0, 0, '🗺️ חידת ציד אוצרות', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 500, (c) => he(c, 'מצאו את המקום שבו', 0, 0, { size: 118, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 655, (c) => he(c, 'נחים בלילה', 0, 0, { size: 150, w: 900, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, ev.q2, W / 2, 815, (c) => he(c, 'איפה הקוד הבא? 🔍', 0, 0, { size: 124, w: 900, color: C.red, maxW: SAFE.w }), { rot: -0.025 });
    S.hookOpts.forEach((o) => {
      const x = 800 - o.i * 260;
      popAt(ctx, t, o.t, x, 1040, (c) => {
        card(c, -115, -100, 230, 200, { seed: 20 + o.i, shadow: 10, r: 34 });
        he(c, o.s, 0, 32, { size: 100, w: 400, dir: 'ltr', maxW: 200 });
      }, { rot: [-0.02, 0.02, -0.015][o.i] });
    });
    he(ctx, 'רמז מתוך ציד אוצרות עם קודי QR', W / 2, 1185, { size: 46, w: 800, color: C.ink, alpha: UI.fadeIn(t, S.hookOpts[2].t, 0.3), maxW: SAFE.w });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(710, 1300); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'מה אתם אומרים? 👆', { size: 46, w: 900, bg: C.yellow, padX: 34 });
      ctx.restore();
    }
    mascot(ctx, 295, 1490 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 500, t, ev.q2);
  }

  // ================= 1. TITLE + CLUES =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const A = S.AUD;
    // the game-name field
    popAt(ctx, t, A[0].t, W / 2, 590, (c) => {
      card(c, -SAFE.w / 2, -62, SAFE.w, 124, { fill: C.yellow, r: 30, seed: 30, shadow: 7, lw: 3.5 });
      he(c, 'שם המשחק', SAFE.w / 2 - 36, -18, { size: 32, w: 800, align: 'right', color: C.muted });
      he(c, S.TITLE, SAFE.w / 2 - 36, 38, { size: 52, w: 900, align: 'right', maxW: SAFE.w - 80 });
    }, { dur: 0.25, over: 1.6, rot: 0.006 });
    // three clue boxes (the middle one is masked: that is the hook riddle)
    [1, 2, 3].forEach((k) => {
      const o = A[k], idx = k - 1, y = 770 + idx * 175, on = t >= ev.pick && k === S.AUD_PICK;
      popAt(ctx, t, o.t, W / 2, y, (c) => {
        card(c, -SAFE.w / 2, -78, SAFE.w, 156, { fill: on ? C.yellow : '#fff', r: 28, seed: 33 + k, shadow: 7, lw: 3.5 });
        numDot(c, SAFE.w / 2 - 54, 0, idx + 1, 30);
        if (idx === 1) he(c, '❓', 0, 26, { size: 80, w: 400 });
        else wrap(c, S.CLUES[idx], 42, SAFE.w - 170, 700, 2).forEach((ln, li, arr) => he(c, ln, SAFE.w / 2 - 110, (arr.length === 1 ? 14 : -4 + li * 54), { size: 42, w: 700, align: 'right', maxW: SAFE.w - 170 }));
        if (on) checkMark(c, -SAFE.w / 2 + 62, 0, 28, clamp((t - ev.pick) / 0.4));
      }, { dur: 0.25, over: 1.6, rot: [0.006, -0.006][idx % 2] });
    });
    UI.tap(ctx, 620, 790, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, A[4].t, W / 2, 1330, (c) => pill(c, 0, 0, `עד ⁦${S.MAX_STOPS}⁩ תחנות · עד ⁦${S.MAX_CLUE}⁩ תווים לרמז`, { size: 44, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[0], W / 2, 1450, (c) => pill(c, 0, 0, 'הרמז הראשון נפתח בסריקה הראשונה', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1570, (c) => pill(c, 0, 0, 'בלי אפליקציה ובלי הרשמה', { size: 44, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 2. ADD STATIONS (up to 8) =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const T0 = S.TOPICS;
    let count = 0; T0.forEach((o) => { if (t >= o.t) count++; });
    T0.forEach((o) => {
      const y = 560 + o.i * 88;
      popAt(ctx, t, o.t, W / 2, y, (c) => {
        card(c, -SAFE.w / 2, -38, SAFE.w, 76, { fill: '#fff', r: 22, seed: 40 + o.i, shadow: 5, lw: 3 });
        numDot(c, SAFE.w / 2 - 44, 0, o.i + 1, 24);
        if (o.i < 3) { G.line(c, [[SAFE.w / 2 - 100, 0], [SAFE.w / 2 - 100 - [480, 380, 520][o.i], 0]], { color: C.line, lw: 14, seed: 50 + o.i, amp: 0.4 }); }
        else he(c, 'כתבו את הרמז שיופיע לאחר הסריקה', SAFE.w / 2 - 100, 12, { size: 32, w: 500, align: 'right', color: C.muted, maxW: SAFE.w - 220 });
        he(c, '✕', -SAFE.w / 2 + 50, 12, { size: 38, w: 900, color: C.red, dir: 'ltr' });
      }, { dur: 0.22, over: 1.5, rot: [0.004, -0.004][o.i % 2] });
    });
    const full = count >= 8, press = t >= ev.topic ? 1 - 0.07 * pulse(t, ev.topic, 10) : 1;
    popAt(ctx, t, T(4, 0.9), W / 2, 1330, (c) => { c.scale(press, press); c.globalAlpha *= full ? 0.45 : 1; pill(c, 0, 0, '+ הוספת תחנה', { size: 52, w: 900, bg: '#fff', fg: C.ink, padX: 90, seed: 61 }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 30, 1345, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, S.pills[2], W / 2, 1470, (c) => pill(c, 0, 0, 'אפשר להוסיף ולמחוק תחנות', { size: 44, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1590, (c) => pill(c, 0, 0, 'מינימום ⁦2⁩ תחנות, מקסימום ⁦8⁩', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. CREATE THE QR CODES =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES;
    const press = t >= ev.mode ? 1 - 0.08 * pulse(t, ev.mode, 10) : 1;
    popAt(ctx, t, M0[0].t, W / 2, 575, (c) => { c.scale(press, press); pill(c, 0, 0, 'יצירת קודי QR', { size: 54, w: 900, bg: C.green, fg: '#fff', padX: 90, seed: 71 }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 590, t, ev.mode, { color: 'rgba(35,135,77,0.8)', size: 120 });
    popAt(ctx, t, M0[1].t, W / 2, 960, (c) => {
      card(c, -300, -300, 600, 600, { fill: '#fff', r: 34, seed: 72, shadow: 12, lw: 4.5 });
      he(c, 'תחנה ⁦1⁩', 0, -232, { size: 36, w: 900, color: C.green });
      he(c, 'סרקו כדי לקבל את הרמז', 0, -170, { size: 46, w: 900, maxW: 540 });
      drawQR(c, S.QRS[0], -170, -130, 340);
      he(c, 'ציד האוצר הגדול', 0, 250, { size: 34, w: 700, color: C.muted, maxW: 540 });
    }, { dur: 0.35, over: 1.5, rot: -0.012 });
    popAt(ctx, t, M0[2].t, W / 2, 1325, (c) => pill(c, 0, 0, 'הקוד נסרק במצלמה של הטלפון 📱', { size: 38, w: 800, bg: '#fff', seed: 73, maxW: SAFE.w }), { rot: 0.015 });
    popAt(ctx, t, M0[3].t, W / 2, 1440, (c) => pill(c, 0, 0, 'כל קוד מכיל רק את הרמז שלו', { size: 44, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, M0[4].t, W / 2, 1560, (c) => pill(c, 0, 0, 'המידע אינו נשמר באתר', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. PRINT AND HIDE =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const press = t >= ev.go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    popAt(ctx, t, T(8, 0.05), W / 2, 580, (c) => { c.scale(press, press); pill(c, 0, 0, '🖨️ הדפסת התחנות', { size: 54, w: 900, bg: C.purple, fg: '#fff', padX: 80, seed: 83 }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 595, t, ev.go, { color: 'rgba(138,79,216,0.8)', size: 120 });
    S.ROWS.forEach((r) => {
      const x = 805 - r.i * 295, rot = [-0.03, 0.02, -0.02][r.i];
      popAt(ctx, t, r.t, x, 890, (c) => {
        card(c, -140, -200, 280, 400, { fill: '#fff', r: 24, seed: 90 + r.i, shadow: 9, lw: 4 });
        he(c, `תחנה ⁦${r.i + 1}⁩`, 0, -150, { size: 36, w: 900, color: C.green });
        he(c, 'סרקו לרמז', 0, -108, { size: 30, w: 800, maxW: 240 });
        drawQR(c, S.QRS[r.i], -105, -85, 210);
        he(c, '✂️', 0, 160, { size: 44, w: 400 });
      }, { dur: 0.3, over: 1.5, rot });
    });
    popAt(ctx, t, ev.ans, W / 2, 1210, (c) => pill(c, 0, 0, 'גוזרים ומחביאים ✂️', { size: 62, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.ans, W / 2, 1190, { n: 60, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[4], W / 2, 1360, (c) => pill(c, 0, 0, 'את הקוד הבא מחביאים במקום שהרמז מתאר', { size: 42, w: 900, bg: C.lilac, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1480, (c) => pill(c, 0, 0, 'כל סריקה חושפת רמז אחד בלבד', { size: 42, w: 900, bg: C.yellow, seed: 86, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. SCAN: THE PLAYER SCREEN =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems, last = t >= S.extras[0].t;
    ctx.save(); ctx.translate(0, -60);
    popAt(ctx, t, I[0].t, W / 2, 1010, (c) => {
      card(c, -300, -470, 600, 940, { fill: '#fffbe9', r: 56, seed: 100, shadow: 14, lw: 5 });
      G.line(c, [[-70, -435], [70, -435]], { color: C.ink, lw: 8, seed: 101, amp: 0.3 });
    }, { dur: 0.35, over: 1.3, rot: -0.006 });
    // the white station card inside the phone
    const a1 = UI.fadeIn(t, I[1].t, 0.25);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1;
      card(ctx, W / 2 - 255, 640, 510, 740, { fill: '#fff', r: 40, seed: 102, shadow: 8, lw: 4 });
      ctx.restore();
      he(ctx, last ? '🏆' : '🗺️', W / 2, 760, { size: 110, w: 400, alpha: a1 });
      he(ctx, last ? 'הגעתם לאוצר!' : 'תחנה ⁦1⁩ מתוך ⁦3⁩', W / 2, 840, { size: 44, w: 900, color: C.green, alpha: a1 });
      he(ctx, S.TITLE, W / 2, 915, { size: 54, w: 900, alpha: a1, maxW: 450 });
    }
    const a2 = UI.fadeIn(t, I[2].t, 0.25);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2;
      G.rrect(ctx, W / 2 - 225, 960, 450, 250, 26, { fill: '#fde8a3', lw: 3.5, seed: 103, stroke: C.ink });
      ctx.restore();
      const txt = last ? S.CLUES[2] : S.CLUES[0];
      wrap(ctx, txt, 44, 390, 800, 3).forEach((ln, k, arr) => he(ctx, ln, W / 2, 1085 - (arr.length - 1) * 30 + k * 62, { size: 44, w: 800, alpha: a2, maxW: 400 }));
    }
    const a3 = UI.fadeIn(t, I[3].t, 0.25);
    if (a3 > 0) {
      const txt = last ? 'השלמתם את כל המסלול 🎉' : 'פתרו, מצאו וסרקו את התחנה הבאה';
      he(ctx, txt, W / 2, 1290, { size: 32, w: 700, color: C.muted, alpha: a3, maxW: 450 });
    }
    // scan flash on the first code
    const sf = clamp(1 - (t - ev.printBtn) / 0.4);
    if (t >= ev.printBtn && sf > 0) { ctx.save(); ctx.globalAlpha = 0.5 * sf; ctx.fillStyle = '#fff'; ctx.fillRect(W / 2 - 300, 540, 600, 940); ctx.restore(); }
    if (t < S.extras[0].t) UI.tap(ctx, W / 2, 1000, t, ev.printBtn, { color: 'rgba(35,135,77,0.8)', size: 120 });
    ctx.restore();
    popAt(ctx, t, S.extras[0].t, W / 2, 1560, (c) => pill(c, 0, 0, 'בתחנה האחרונה מחכה האוצר 🏆', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1660, (c) => pill(c, 0, 0, 'ומי יגיע ראשון?', { size: 42, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
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
    he(ctx, 'ציד אוצרות עם קודי QR', W / 2, 1000, { size: 52, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'יוצרים, מדפיסים ומשחקים 🗺️', W / 2, 1350, { size: 40, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1465, (c) => pill(c, 0, 0, '✍️ איפה הקוד הבא? כתבו בתגובות', { size: 50, w: 900, bg: C.red, fg: '#fff', padX: 48, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
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
