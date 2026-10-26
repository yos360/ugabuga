// THE FILM (9:16) — UGABUGA for Shabbat: sunset and candles, candle-lighting times, Parashat Lech Lecha,
// the printable quiz, the Shabbat pack and more. Site look, real characters, no caveman.
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



  // two candles; lit[k] = time each flame catches
  function candles(ctx, cx, base, t, lit, s = 1) {
    ctx.save(); ctx.translate(cx, base); ctx.scale(s, s);
    for (const [k, dx] of [[0, -120], [1, 120]]) {
      // candlestick
      G.poly(ctx, [[dx - 70, 0], [dx + 70, 0], [dx + 40, -26], [dx - 40, -26]], { fill: '#e7b04a', lw: 4, seed: 3 + k, stroke: C.ink });
      G.rrect(ctx, dx - 14, -110, 28, 86, 6, { fill: '#e7b04a', lw: 4, seed: 5 + k, stroke: C.ink });
      G.ellipse(ctx, dx, -112, 52, 14, { fill: '#f2c766', lw: 4, seed: 7 + k, stroke: C.ink });
      // candle
      G.rrect(ctx, dx - 26, -330, 52, 220, 8, { fill: '#fffaf0', lw: 4, seed: 9 + k, stroke: C.ink });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(dx, -330); ctx.lineTo(dx, -350); ctx.stroke();
      const p = clamp((t - lit[k]) / 0.25);
      if (p > 0) {
        const fl = 1 + 0.08 * Math.sin(t * 17 + k * 2) + 0.05 * Math.sin(t * 29 + k);
        const g = ctx.createRadialGradient(dx, -385, 4, dx, -385, 190 * p);
        g.addColorStop(0, 'rgba(255,214,120,0.75)'); g.addColorStop(1, 'rgba(255,214,120,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, -385, 190 * p, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(dx, -350); ctx.scale(p * fl, p * (2 - fl));
        ctx.fillStyle = '#ff9e2c'; ctx.beginPath(); ctx.moveTo(0, -78); ctx.bezierCurveTo(30, -40, 26, -6, 0, 0); ctx.bezierCurveTo(-26, -6, -30, -40, 0, -78); ctx.fill();
        ctx.fillStyle = '#ffe58a'; ctx.beginPath(); ctx.moveTo(0, -48); ctx.bezierCurveTo(15, -26, 13, -4, 0, 0); ctx.bezierCurveTo(-13, -4, -15, -26, 0, -48); ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }
  // a printed A4 sheet with a few lines
  function sheet(ctx, w, h, { title = '', emoji = '', seed = 1, lines = 5 } = {}) {
    card(ctx, -w / 2, -h / 2, w, h, { fill: '#fff', r: 10, seed, shadow: 7, lw: 3.5 });
    if (emoji) he(ctx, emoji, 0, -h / 2 + 0.3 * h, { size: w * 0.32, w: 400 });
    if (title) he(ctx, title, 0, -h / 2 + 0.5 * h, { size: w * 0.13, w: 900, maxW: w - 24 });
    ctx.strokeStyle = '#c3cbe0'; ctx.lineWidth = 3;
    for (let i = 0; i < lines; i++) { const y = -h / 2 + 0.6 * h + i * (0.075 * h); ctx.beginPath(); ctx.moveTo(-w / 2 + 18, y); ctx.lineTo(w / 2 - 18 - (i % 2) * 30, y); ctx.stroke(); }
  }

  // ---------- the step header: number badge + title + subtitle (RTL) ----------
  function header(ctx, t, f) {
    popAt(ctx, t, f.t, RIGHT - 52, 318, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 52, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 52, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, typeof f.n === 'number' ? 22 : 18, { size: typeof f.n === 'number' ? 64 : 50, w: 900, color: '#fff', dir: 'ltr' });
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

  // ================= HOOK: sunset + candles =================
  function shotHook(ctx, t) {
    const k = clamp(t / T(1, 2));
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    const mix = (a, b) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;
    sky.addColorStop(0, mix([255, 180, 120], [34, 38, 92])); sky.addColorStop(0.55, mix([255, 214, 150], [118, 70, 140])); sky.addColorStop(1, mix([255, 236, 190], [240, 140, 90]));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // stars come out
    for (let i = 0; i < 40; i++) { const a = clamp((k - 0.4 - U.hash(i) * 0.4) * 3); if (a <= 0) continue; ctx.fillStyle = `rgba(255,248,220,${a * (0.6 + 0.4 * Math.sin(t * 3 + i))})`; ctx.beginPath(); ctx.arc(U.hash(i * 3 + 1) * W, U.hash(i * 7 + 2) * 900 + 60, 2 + U.hash(i) * 3, 0, Math.PI * 2); ctx.fill(); }
    // the sun sinks behind the hills
    const sy = lerp(1150, 1560, ease.inOutSine ? ease.inOutSine(k) : k);
    ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.arc(780, sy, 120, 0, Math.PI * 2); ctx.fill();
    G.poly(ctx, [[-40, 1500], [180, 1420], [420, 1470], [640, 1400], [880, 1460], [W + 40, 1420], [W + 40, H + 40], [-40, H + 40]], { fill: '#3b2f5c', lw: 0, seed: 2, stroke: 'transparent' });
    const tc = k > 0.6 ? '#ffffff' : C.ink;
    popAt(ctx, t, ev.hook1, W / 2, 470, (c) => he(c, 'שבת', 0, 0, { size: 230, w: 900, color: tc }), { rot: -0.02 });
    popAt(ctx, t, ev.hook2, W / 2, 660, (c) => he(c, 'שלום!', 0, 0, { size: 180, w: 900, color: '#ffc94d' }), { rot: 0.02 });
    popAt(ctx, t, ev.parashaPill, W / 2, 800, (c) => pill(c, 0, 0, 'פרשת לך לך · י״ג בחשוון', { size: 46, w: 900, bg: C.yellow, seed: 4 }), { rot: -0.03 });
    candles(ctx, W / 2, 1420, t, [ev.candle1, ev.candle2], 1.05);
  }

  // ================= 1. TIMES =================
  function shotTimes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.cities.forEach((c) => {
      const col = c.i % 2, row = Math.floor(c.i / 2);
      const x = col ? 285 : 715, y = 640 + row * 250;
      popAt(ctx, t, c.t, x, y, (cc) => {
        card(cc, -200, -105, 400, 210, { fill: ['#fff8de', '#eef4ff', '#e6f7ec', '#fff1f4'][c.i], r: 28, seed: 20 + c.i, shadow: 9 });
        he(cc, '🕯️ ' + c.name, 0, -38, { size: 42, w: 800 });
        he(cc, c.time, 0, 62, { size: 96, w: 900, dir: 'ltr', color: C.ink });
      }, { rot: [-0.02, 0.02, 0.015, -0.015][c.i] });
    });
    popAt(ctx, t, S.havdala.t, W / 2, 1150, (c) => pill(c, 0, 0, '✨ ' + S.havdala.text, { size: 42, w: 800, bg: '#2b2f6b', fg: '#fff', seed: 30 }));
    he(ctx, 'ועוד מאות יישובים באתר, עם זמני הדלקת נרות וצאת השבת', W / 2, 1265, { size: 32, w: 600, color: C.muted, alpha: UI.fadeIn(t, S.havdala.t + 0.2, 0.3), maxW: SAFE.w });
  }

  // ================= 2. PARASHA =================
  function shotParasha(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    card(ctx, SAFE.x, 500, SAFE.w, 620, { seed: 40, fill: '#fff' });
    he(ctx, 'מה קורה בפרשה?', RIGHT - 50, 590, { size: 54, w: 900, align: 'right' });
    he(ctx, 'ספר בראשית · פרקים יב–יז', RIGHT - 50, 645, { size: 32, w: 500, color: C.muted, align: 'right' });
    S.story.forEach((s) => {
      const y = 760 + s.i * 125;
      const a = UI.fadeIn(t, s.t, 0.15), dx = (1 - ease.outCubic(clamp((t - s.t) / 0.35))) * -50;
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, 0);
      G.rrect(ctx, SAFE.x + 30, y - 52, SAFE.w - 60, 104, 22, { fill: ['#fff8de', '#eef4ff', '#f4edff'][s.i], lw: 3, seed: 41 + s.i, stroke: C.ink });
      he(ctx, s.e, RIGHT - 80, y + 20, { size: 54, w: 400 });
      he(ctx, s.text, RIGHT - 130, y + 15, { size: 42, w: 800, align: 'right', maxW: SAFE.w - 190 });
      ctx.restore();
    });
    // "look at the sky and count the stars"
    const sa = t - S.starsT;
    if (sa > 0) for (let i = 0; i < 14; i++) { const p = clamp(sa * 3 - i * 0.12); if (p <= 0) continue; const x = 140 + U.hash(i * 5) * 800, y = 1180 + U.hash(i * 9) * 230; ctx.save(); ctx.translate(x, y); ctx.rotate(t + i); ctx.scale(p, p); he(ctx, '⭐', 0, 14, { size: 40 + U.hash(i) * 30, w: 400 }); ctx.restore(); }
    img(ctx, IMG.girl, 130, 1500, 330, { alpha: UI.fadeIn(t, T(4, 0.5), 0.3) });
  }

  // ================= 3. QUIZ =================
  function shotQuiz(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    card(ctx, SAFE.x, 490, SAFE.w, 500, { seed: 60, fill: '#fff' });
    he(ctx, '🔎 בלשי הפרשה · פרשת לך לך', RIGHT - 45, 560, { size: 40, w: 900, align: 'right', color: C.red });
    S.questions.forEach((q) => {
      const y = 650 + q.i * 82;
      popAt(ctx, t, q.t, RIGHT - 45, y, (c) => {
        c.fillStyle = C.red; c.beginPath(); c.arc(-24, -12, 24, 0, Math.PI * 2); c.fill();
        he(c, String(q.i + 1), -24, 0, { size: 30, w: 900, color: '#fff', dir: 'ltr' });
        he(c, q.q, -68, 0, { size: 38, w: 700, align: 'right', maxW: SAFE.w - 140 });
        c.strokeStyle = '#c3cbe0'; c.lineWidth = 3; c.beginPath(); c.moveTo(-68, 22); c.lineTo(-SAFE.w + 90, 22); c.stroke();
      }, { dur: 0.22, over: 1.6 });
    });
    // the printer pushes the student sheet and the answer sheet
    let push = 0; for (const s of S.sheets) push = Math.max(push, pulse(t, s.t, 9));
    const px = 640, pb = 1500, ph = 360, outY = pb - ph + 60;
    S.sheets.forEach((s) => {
      const a = t - s.t; if (a < 0) return;
      const u = ease.outBack(clamp(a / 0.42), 1.4), tx = [880, 420][s.i], ty = 1170;
      const x = lerp(px, tx, u), y = lerp(outY, ty, u) - Math.sin(Math.PI * clamp(a / 0.42)) * 120;
      ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(0, s.i ? -0.07 : 0.07, clamp(u))); ctx.scale(lerp(0.6, 1, clamp(u)), lerp(0.6, 1, clamp(u)));
      sheet(ctx, 170, 230, { title: s.label, emoji: s.i ? '✅' : '🔎', seed: 61 + s.i, lines: 4 });
      ctx.restore();
    });
    img(ctx, IMG.printer, px, pb + push * 6, ph * (1 - 0.03 * push));
    const bp = ease.outBack(clamp((t - T(6, 2)) / 0.45), 1.5);
    if (bp > 0) img(ctx, IMG.boy, 150, 1520 + (1 - bp) * 460 - hop(t, 10), 400, { rot: -0.03 });
  }

  // ================= 4. PACK =================
  function shotPack(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    S.packPages.forEach((p) => {
      const ang = (p.i - 2) * -0.16, x = W / 2 + (2 - p.i) * 175, y = 820 + Math.abs(p.i - 2) * 40;
      const u = UI.pop(t, p.t, 0.32, 1.8);
      if (u <= 0) return;
      ctx.save(); ctx.translate(lerp(W / 2, x, clamp(u)), lerp(1000, y, clamp(u))); ctx.rotate(ang * clamp(u)); ctx.scale(u, u);
      sheet(ctx, 230, 320, { title: p.label, emoji: p.e, seed: 70 + p.i, lines: 4 });
      ctx.restore();
    });
    // the scissors cut along a dashed line
    const sa = t - S.scissors;
    ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = C.muted; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(SAFE.x + 40, 1130); ctx.lineTo(RIGHT - 40, 1130); ctx.stroke(); ctx.restore();
    if (sa > -0.3) { const u = clamp((sa + 0.3) / (BEAT * 1.6)); const x = lerp(RIGHT - 40, SAFE.x + 40, u); ctx.save(); ctx.translate(x, 1130); ctx.rotate(Math.PI + 0.2 * Math.sin(t * 22)); he(ctx, '✂️', 0, 20, { size: 70, w: 400, dir: 'ltr' }); ctx.restore(); }
    popAt(ctx, t, T(9, 2), W / 2, 1260, (c) => pill(c, 0, 0, 'מכינים לפני שבת, משחקים יחד בשבת', { size: 42, w: 800, bg: C.yellow, seed: 79 }), { rot: -0.02 });
  }

  // ================= 5. MORE =================
  function shotMore(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    S.more.forEach((c) => {
      popAt(ctx, t, c.t, W / 2, 570 + c.i * 165, (cc) => {
        card(cc, -SAFE.w / 2, -65, SAFE.w, 130, { fill: ['#eef4ff', '#fff8de'][c.i], r: 26, seed: 90 + c.i, shadow: 8 });
        he(cc, c.e, SAFE.w / 2 - 60, 22, { size: 60, w: 400 });
        he(cc, c.label, SAFE.w / 2 - 120, 17, { size: 46, w: 800, align: 'right', maxW: SAFE.w - 160 });
      }, { rot: [0.015, -0.015][c.i] });
    });
    popAt(ctx, t, S.question.t, W / 2, 1060, (c) => {
      card(c, -SAFE.w / 2, -170, SAFE.w, 340, { fill: C.yellow, r: 18, seed: 95, shadow: 10 });
      he(c, '💬 שאלה לשולחן השבת', SAFE.w / 2 - 40, -95, { size: 42, w: 900, align: 'right', color: C.red });
      he(c, 'איך אפשר לפתור מריבה', 0, 0, { size: 52, w: 800 });
      he(c, 'בלי להתעקש לקבל תמיד', 0, 68, { size: 52, w: 800 });
      he(c, 'את הבחירה הראשונה?', 0, 136, { size: 52, w: 800 });
    }, { rot: -0.02, dur: 0.35 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    const g0 = ctx.createLinearGradient(0, 0, 0, H); g0.addColorStop(0, '#2b2f6b'); g0.addColorStop(0.6, '#5b3f7e'); g0.addColorStop(1, '#f0a36a');
    ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,248,220,${0.5 + 0.4 * Math.sin(t * 3 + i)})`; ctx.beginPath(); ctx.arc(U.hash(i * 3 + 1) * W, U.hash(i * 7 + 2) * 1700 + 40, 2 + U.hash(i) * 3, 0, Math.PI * 2); ctx.fill(); }
    popAt(ctx, t, ev.logo, W / 2, 560, (c) => {
      const s = 300;
      c.fillStyle = '#000'; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 76); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 76); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 76); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'שבת שלום', W / 2, 880 + (1 - wp) * 24, { size: 150, w: 900, color: '#fff', alpha: wp });
    const L = S.endLines;
    he(ctx, 'מעוגה בוגה 🕯️🕯️', W / 2, 975, { size: 52, w: 700, color: '#ffe3a3', alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, W / 2, 1090, (c) => pill(c, 0, 0, 'הכול בחינם, מוכן להדפסה', { size: 48, w: 900, bg: C.yellow, seed: 120 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1230, (c) => pill(c, 0, 0, 'ugabuga.co.il/parasha', { size: 52, w: 600, bg: C.blue, fg: '#fff', padX: 44, dir: 'ltr', fam: 'Fredoka', seed: 121 }));
    he(ctx, 'זמני שבת · פרשה · חידון · משחקים', W / 2, 1365, { size: 40, w: 700, color: '#fff', alpha: UI.fadeIn(t, L[3].t, 0.25) });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotTimes }, { t0: T(4), fn: shotParasha }, { t0: T(6), fn: shotQuiz },
    { t0: T(8), fn: shotPack }, { t0: T(10), fn: shotMore }, { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.printer = await L('img/home-printer.png');
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
        const f = S.steps[i - 1] || { color: C.red };
        ctx.fillStyle = f.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
