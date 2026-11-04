// THE FILM (9:16) — "מה הכי מעצבן אתכם במסמכים?": the PDF studio + the document editor in the site own look
// (paper + dot grid, ink-outlined cards with an offset shadow, Heebo), the orange mascot on the hook and end card.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff' };
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
  function pill(ctx, cx, cy, s, { size = 44, w = 800, bg = C.yellow, fg = C.ink, padX = 34, h, seed = 3, shadow = 7, dir = 'rtl', fam, maxW } = {}) {
    let sz = size;
    if (maxW) { const mw = measure(ctx, s, sz, w, fam) + padX * 2; if (mw > maxW) sz *= (maxW - padX * 2) / (mw - padX * 2); }
    const ww = measure(ctx, s, sz, w, fam) + padX * 2, hh = h || sz * 1.75;
    card(ctx, cx - ww / 2, cy - hh / 2, ww, hh, { fill: bg, r: hh / 2, seed, shadow, lw: 4 });
    he(ctx, s, cx, cy + sz * 0.36, { size: sz, w, color: fg, dir, fam });
    return ww;
  }
  function popAt(ctx, t, t0, cx, cy, fn, { dur = 0.3, over = 2.2, rot = 0 } = {}) {
    const p = UI.pop(t, t0, dur, over);
    if (p <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(p, p); fn(ctx); ctx.restore();
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
  function img(ctx, im, cx, bottom, h, { rot = 0 } = {}) {
    if (!im) return;
    const w = im.width * h / im.height;
    ctx.save(); ctx.translate(cx, bottom); ctx.rotate(rot); ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
  }
  // grey "text" bars on a paper sheet
  function textBars(ctx, x, y, w, rows, gap = 34, seed = 1) {
    for (let k = 0; k < rows; k++) {
      const ww = w * (0.55 + 0.45 * U.hash(seed * 50 + k));
      ctx.fillStyle = '#d5dae6'; ctx.beginPath(); ctx.roundRect(x - ww, y + k * gap, ww, 12, 6); ctx.fill();
    }
  }

  // ---------- backgrounds ----------
  function dots(x, a) {
    x.fillStyle = `rgba(20,22,45,${a})`;
    for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
  }
  function bg(ctx) {
    ctx.drawImage(Studio.cache('bg', (x) => { x.fillStyle = C.paper; x.fillRect(0, 0, W, H); dots(x, 0.09); }, { variants: 1 }), 0, 0, W, H);
  }
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H); dots(x, 0.06);
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

  // the mascot (the owner's logo character); falls back to the old logo
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }

  // ================= HOOK: a 4-way choice =================
  const LET = ['א', 'ב', 'ג', 'ד'], LCOL = [C.blue, C.red, C.purple, C.orange];
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 285, (c) => pill(c, 0, 0, '📄 עזרי מסמכים בחינם', { size: 50, w: 900, bg: C.blue, fg: '#fff', padX: 46, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 485, (c) => he(c, 'מה הכי מעצבן', 0, 0, { size: 128, w: 900, maxW: SAFE.w + 60 }), { rot: -0.025 });
    popAt(ctx, t, ev.q2, W / 2, 635, (c) => he(c, 'אתכם במסמכים?', 0, 0, { size: 128, w: 900, color: C.red, maxW: SAFE.w + 60 }), { rot: 0.02 });
    S.hookOpts.forEach((o) => {
      const col = o.i % 2, row = Math.floor(o.i / 2);
      const x = col ? SAFE.x + 215 : RIGHT - 215, y = 790 + row * 140;
      popAt(ctx, t, o.t, x, y, (c) => {
        card(c, -215, -58, 430, 116, { seed: 20 + o.i, shadow: 8, r: 30 });
        he(c, o.s, 125, 14, { size: 42, w: 800, align: 'right', maxW: 300 });
        c.fillStyle = LCOL[o.i]; c.beginPath(); c.arc(165, 0, 32, 0, Math.PI * 2); c.fill();
        he(c, LET[o.i], 165, 15, { size: 42, w: 900, color: '#fff' });
      }, { rot: [-0.02, 0.02, 0.02, -0.02][o.i] });
    });
    mascot(ctx, 310, 1235 - (t > ev.mascot + 0.45 ? hop(t, 10) : 0), 430, t, ev.mascot);
    const sp = clamp((t - ev.pick) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.pick + 0.18, 12);
      ctx.save(); ctx.translate(720, 1160); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחרו אות 🤔', { size: 60, w: 900, bg: C.yellow, padX: 40 });
      ctx.restore();
    }
    popAt(ctx, t, ev.promise, 720, 1310, (c) => pill(c, 0, 0, 'יש פתרון לכולן 👇', { size: 42, w: 800, bg: '#fff', padX: 30, seed: 14 }), { rot: 0.03 });
  }

  // ================= 1. MERGE + SPLIT =================
  function fileTile(c, e, name, { w = 230, h = 250, seed = 1 } = {}) {
    card(c, -w / 2, -h / 2, w, h, { seed, shadow: 9, r: 26 });
    c.fillStyle = '#eef1f8'; c.beginPath(); c.roundRect(-w / 2 + 22, -h / 2 + 22, w - 44, h - 110, 16); c.fill();
    he(c, e, 0, -h / 2 + 115, { size: 86, w: 400 });
    he(c, name, 0, h / 2 - 34, { size: 34, w: 800, maxW: w - 30 });
  }
  function shotMerge(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const k = ease.inOutCubic(clamp((t - (ev.merge - 0.35)) / 0.35));
    S.FILES.forEach((f) => {
      const x0 = RIGHT - 130 - f.i * 270, y0 = 640;
      const x = lerp(x0, W / 2 - 10, k), y = lerp(y0, 780, k), s = lerp(1, 0.4, k);
      if (k >= 1) return;
      popAt(ctx, t, f.t, x, y, (c) => { c.globalAlpha *= 1 - k * 0.8; c.scale(s, s); fileTile(c, f.e, f.s, { seed: 30 + f.i }); }, { rot: [0.02, -0.02, 0.015][f.i], dur: 0.3, over: 1.8 });
    });
    popAt(ctx, t, ev.merge, W / 2 - 10, 790, (c) => {
      card(c, -320, -140, 640, 280, { fill: C.yellow, seed: 40, shadow: 12, r: 34 });
      c.fillStyle = C.red; c.beginPath(); c.roundRect(170, -85, 110, 140, 14); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
      he(c, 'PDF', 225, 0, { size: 40, w: 900, color: '#fff', dir: 'ltr' });
      he(c, 'PDF אחד', 135, -10, { size: 72, w: 900, align: 'right', maxW: 320 });
      he(c, 'חשבונית + צילום + טופס', 135, 55, { size: 32, w: 600, color: C.muted, align: 'right', maxW: 320 });
      checkMark(c, -250, 0, 42, clamp((t - ev.merge - 0.15) / 0.3));
    }, { dur: 0.18, over: 1.6 });
    popAt(ctx, t, ev.split, W / 2, 1040, (c) => pill(c, 0, 0, '✂️ פיצול לפי עמודים: ⁦1-3, 5⁩', { size: 46, w: 800, bg: '#fff', padX: 36, seed: 44, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(3, 3.2), W / 2, 1170, (c) => pill(c, 0, 0, '🔒 הקבצים לא יוצאים מהמחשב', { size: 46, w: 900, bg: C.lilac, padX: 36, seed: 45, maxW: SAFE.w }), { rot: 0.025 });
    const pp = ease.outBack(clamp((t - T(3, 1)) / 0.45), 1.5);
    if (pp > 0) img(ctx, IMG.printer, 760, 1500 + (1 - pp) * 420 - (t > T(3, 1.5) ? hop(t, 10) : 0), 250, { rot: 0.04 });
  }

  // ================= 2. COMPRESS =================
  function shotSqueeze(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const X = SAFE.x, Wc = SAFE.w, sh = ease.inOutCubic(clamp((t - ev.shrink) / 0.6));
    popAt(ctx, t, T(4, 0.2), W / 2, 590, (c) => {
      card(c, -Wc / 2, -95, Wc, 190, { seed: 50, r: 30 });
      he(c, '📕 מסמך.pdf', Wc / 2 - 36, -22, { size: 46, w: 900, align: 'right' });
      he(c, sh < 0.5 ? 'כבד מדי לשליחה 😬' : 'קטן יותר, מוכן לשליחה ✅', -Wc / 2 + 36, -22, { size: 34, w: 700, color: sh < 0.5 ? C.red : C.green, align: 'left', dir: 'rtl' });
      const bw = (Wc - 72) * lerp(1, 0.32, sh);
      c.fillStyle = '#eef1f8'; c.beginPath(); c.roundRect(-Wc / 2 + 36, 22, Wc - 72, 42, 21); c.fill();
      c.fillStyle = sh < 0.5 ? C.red : C.green; c.beginPath(); c.roundRect(Wc / 2 - 36 - bw, 22, bw, 42, 21); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.roundRect(-Wc / 2 + 36, 22, Wc - 72, 42, 21); c.stroke();
    }, { dur: 0.3, over: 1.8 });
    S.LEVELS.forEach((l) => {
      const cy = 830 + l.i * 170, on = t >= ev.level && l.i === S.LEVEL_PICK;
      popAt(ctx, t, l.t, W / 2, cy, (c) => {
        card(c, -Wc / 2, -72, Wc, 144, { fill: on ? C.yellow : C.card, r: 28, seed: 60 + l.i, shadow: 9 });
        he(c, `🗜️ ${l.s}`, Wc / 2 - 36, 20, { size: 56, w: 900, align: 'right' });
        he(c, l.hint, Wc / 2 - 290, 16, { size: 36, w: 500, color: C.muted, align: 'right', maxW: Wc - 420 });
        if (on) checkMark(c, -Wc / 2 + 64, 0, 36, clamp((t - ev.level) / 0.3));
      }, { rot: [0.01, -0.012, 0.01][l.i], dur: 0.3, over: 1.8 });
    });
    UI.tap(ctx, W / 2, 830 + S.LEVEL_PICK * 170, t, ev.level, { color: 'rgba(207,47,86,0.8)', size: 140 });
    popAt(ctx, t, T(5, 2.8), W / 2, 1360, (c) => pill(c, 0, 0, '📧 למייל, לוואטסאפ ולטפסים באתרים', { size: 42, w: 800, bg: C.lilac, padX: 32, seed: 66, maxW: SAFE.w }), { rot: -0.025 });
  }

  // ================= 3. SIGN =================
  function sigPoint(u) {
    // a loopy hand signature, left → right
    const x = -180 + u * 380 + 18 * Math.sin(u * Math.PI * 11 + 1);
    const y = -38 * Math.sin(u * Math.PI * 3) * (1 - 0.5 * u) + 20 * Math.sin(u * Math.PI * 11);
    return [x, y];
  }
  function shotSign(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const X = SAFE.x + 30, Wc = SAFE.w - 60, Y = 490, Hc = 760;
    const a = ease.outBack(clamp((t - T(6, 0.3)) / 0.4), 1.4);
    if (a > 0) {
      ctx.save(); ctx.translate(W / 2, Y + Hc / 2); ctx.rotate(-0.012); ctx.scale(a, a); ctx.translate(-W / 2, -(Y + Hc / 2));
      card(ctx, X, Y, Wc, Hc, { seed: 70, r: 22 });
      he(ctx, 'טופס אישור', X + Wc - 50, Y + 90, { size: 52, w: 900, align: 'right' });
      textBars(ctx, X + Wc - 50, Y + 140, Wc - 100, 7, 40, 7);
      // the signature line
      const sy = Y + Hc - 130;
      he(ctx, 'חתימה:', X + Wc - 50, sy, { size: 40, w: 800, align: 'right' });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(X + 60, sy + 8); ctx.lineTo(X + Wc - 230, sy + 8); ctx.stroke(); ctx.setLineDash([]);
      // ink stroke
      const u = clamp((t - ev.signGo) / (ev.signEnd - ev.signGo));
      if (u > 0) {
        const cx = X + (Wc - 230 + 60) / 2, cy = sy - 40;
        ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = '#1b3fa6'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); const n = 160;
        for (let i = 0; i <= n * u; i++) { const [px, py] = sigPoint(i / n); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
        ctx.stroke();
        if (u < 1) { const [px, py] = sigPoint(u); ctx.fillStyle = 'rgba(138,79,216,0.45)'; ctx.beginPath(); ctx.arc(px, py, 34, 0, Math.PI * 2); ctx.fill(); he(ctx, '☝️', px + 10, py + 80, { size: 70, w: 400 }); }
        ctx.restore();
      }
      // the name + date stamps
      for (const s of S.stamps) {
        popAt(ctx, t, s.t, X + 260, Y + 470, (c) => {
          G.rrect(c, -190, -50, 380, 100, 14, { fill: '#fff', lw: 3, seed: 77, stroke: C.purple });
          he(c, s.s, 0, -6, { size: 38, w: 800 });
          he(c, '04.11.2026', 0, 34, { size: 30, w: 600, color: C.muted, dir: 'ltr' });
        }, { rot: -0.03 });
      }
      ctx.restore();
    }
    popAt(ctx, t, T(7, 3.4), W / 2, 1390, (c) => pill(c, 0, 0, 'בלי להדפיס ובלי לסרוק ✨', { size: 48, w: 900, bg: C.yellow, padX: 40, seed: 78 }), { rot: 0.025 });
  }

  // ================= 4. PDF ↔ WORD =================
  function badge(c, x, label, color) {
    c.fillStyle = C.ink; c.beginPath(); c.roundRect(x - 85 + 6, -100 + 8, 170, 200, 18); c.fill();
    c.fillStyle = color; c.beginPath(); c.roundRect(x - 85, -100, 170, 200, 18); c.fill();
    c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
    he(c, label, x, 16, { size: label.length > 3 ? 46 : 54, w: 900, color: '#fff', dir: 'ltr', fam: 'Fredoka' });
  }
  function shotWord(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const Wc = SAFE.w;
    S.WORD.forEach((wd, i) => {
      const cy = 690 + i * 390, fire = i === 0 ? ev.toWord : ev.toWord + BEAT * 2;
      popAt(ctx, t, wd.t, W / 2, cy, (c) => {
        card(c, -Wc / 2, -150, Wc, 300 + 60, { seed: 80 + i, r: 32 });
        badge(c, Wc / 2 - 140, wd.from, wd.from === 'PDF' ? C.red : C.blue);
        badge(c, -Wc / 2 + 140, wd.to, wd.to === 'PDF' ? C.red : C.blue);
        // the arrow travels right → left
        const p = ease.outCubic(clamp((t - fire) / 0.4));
        const x1 = Wc / 2 - 250, x2 = -Wc / 2 + 250, xe = lerp(x1, x2, Math.max(p, 0.001));
        c.strokeStyle = p > 0 ? C.green : C.line; c.lineWidth = 12; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x1, 0); c.lineTo(p > 0 ? xe : x2, 0); c.stroke();
        const ax = p > 0 ? xe : x2; c.fillStyle = p > 0 ? C.green : C.line;
        c.beginPath(); c.moveTo(ax - 30, 0); c.lineTo(ax + 6, -26); c.lineTo(ax + 6, 26); c.closePath(); c.fill();
        he(c, wd.note, 0, 160, { size: 36, w: 700, color: C.muted, maxW: Wc - 60 });
      }, { rot: i ? 0.012 : -0.012, dur: 0.3, over: 1.8 });
    });
    popAt(ctx, t, T(9, 3), W / 2, 1400, (c) => pill(c, 0, 0, 'פסקאות, כותרות ורשימות עוברים', { size: 44, w: 900, bg: C.yellow, padX: 36, seed: 88, maxW: SAFE.w }), { rot: -0.025 });
  }

  // ================= 5. DOCUMENT EDITOR =================
  function shotDoc(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const cw = 280, ch = 150, gx = 20, gy = 22, x0 = RIGHT - cw / 2, y0 = 580;
    S.TPL.forEach((p) => {
      const col = p.i % 3, row = Math.floor(p.i / 3);
      const cx = x0 - col * (cw + gx), cy = y0 + row * (ch + gy);
      const on = t >= ev.tpl && p.i === S.TPL_PICK;
      popAt(ctx, t, p.t, cx, cy, (c) => {
        card(c, -cw / 2, -ch / 2, cw, ch, { fill: on ? '#dff3e5' : C.card, r: 24, seed: 90 + p.i, shadow: 7, lw: on ? 5 : 3.5, stroke: on ? C.green : C.ink });
        he(c, p.e, 0, -10, { size: 56, w: 400 });
        he(c, p.s, 0, 50, { size: 32, w: 800, maxW: cw - 24 });
      }, { dur: 0.22, over: 1.7, rot: [0.015, -0.01, 0.01][col] });
    });
    { const col = S.TPL_PICK % 3, row = Math.floor(S.TPL_PICK / 3); UI.tap(ctx, x0 - col * (cw + gx), y0 + row * (ch + gy), t, ev.tpl, { color: 'rgba(35,135,77,0.8)', size: 130 }); }
    popAt(ctx, t, ev.tpl + 0.3, W / 2 + 180, 1135, (c) => pill(c, 0, 0, '🖨️ הדפסה / PDF', { size: 42, w: 900, bg: C.blue, fg: '#fff', padX: 30, seed: 101 }), { rot: -0.02 });
    popAt(ctx, t, ev.tpl + 0.6, W / 2 - 200, 1135, (c) => pill(c, 0, 0, '⬇️ וורד', { size: 42, w: 900, bg: '#fff', padX: 30, seed: 102 }), { rot: 0.02 });
    popAt(ctx, t, ev.saved, W / 2, 1270, (c) => pill(c, 0, 0, '✓ נשמר במכשיר הזה', { size: 44, w: 900, bg: '#dff3e5', padX: 34, seed: 103 }), { rot: -0.015 });
    popAt(ctx, t, T(11, 3.4), W / 2, 1400, (c) => pill(c, 0, 0, 'בלי להתקין וורד', { size: 46, w: 900, bg: C.yellow, padX: 36, seed: 104 }), { rot: 0.025 });
  }

  // ================= END: answer in the comments =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    const L = S.endLines;
    popAt(ctx, t, ev.logo, W / 2, 330, (c) => {
      card(c, -SAFE.w / 2, -170, SAFE.w, 340, { fill: C.yellow, r: 40, seed: 401, shadow: 14 });
      he(c, 'אז מה הכי מעצבן אתכם?', 0, -70, { size: 60, w: 900, color: C.red, maxW: SAFE.w - 60 });
      he(c, '✍️ כתבו בתגובות', 0, 30, { size: 84, w: 900, maxW: SAFE.w - 60 });
      he(c, 'א, ב, ג או ד', 0, 125, { size: 62, w: 900, color: C.blue, maxW: SAFE.w - 60 });
    }, { rot: -0.02, dur: 0.4 });
    mascot(ctx, W / 2, 830, 400, t, ev.logo + 0.25);
    he(ctx, 'סטודיו PDF ועורך מסמכים', W / 2, 1150, { size: 56, w: 800, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1260, (c) => pill(c, 0, 0, 'בחינם · בלי הרשמה', { size: 48, w: 900, bg: '#fff', seed: 402, padX: 40, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, L[2].t, W / 2, 1400, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 66, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 403 }));
    he(ctx, 'בתפריט: כלים חינמיים ← כלי PDF', W / 2, 1535, { size: 36, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    confetti(ctx, t, ev.logo, W / 2, 830, { n: 70, seed: 9, spread: 950 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotMerge },
    { t0: T(4), fn: shotSqueeze },
    { t0: T(6), fn: shotSign },
    { t0: T(8), fn: shotWord },
    { t0: T(10), fn: shotDoc },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const Ld = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.logo = (await Ld('img/mascot.png')) || (await Ld('img/logo.svg'));
      IMG.printer = await Ld('img/home-printer.png');
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
