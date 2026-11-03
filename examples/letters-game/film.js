// THE FILM (9:16) — "משחק אותיות לגן": one question from the site's letters game, a 4-second countdown and a call to answer
// in the comments. Site look (paper + dot grid, ink-outlined cards with an offset shadow, Heebo). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', card: '#ffffff', road: '#3b3f4f', roadDark: '#2b2e3a' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // ---------- Hebrew text (Chrome RTL shaping, the site's font) ----------
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", sans-serif`;
  function measure(ctx, s, size, w = 800, fam) { ctx.save(); ctx.font = fontOf(size, w, fam); ctx.direction = 'rtl'; const mm = ctx.measureText(s).width; ctx.restore(); return mm; }
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
    if (maxW) { const mw = measure(ctx, s, sz, w, fam) + padX * 2; if (mw > maxW) sz *= maxW / mw; }
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
  function img(ctx, im, cx, bottom, h, { rot = 0, alpha = 1 } = {}) {
    if (!im) return;
    const w = im.width * h / im.height;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, bottom); ctx.rotate(rot);
    ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
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

  // the mascot (the owner's new logo character), round; falls back to the old logo
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      // the cut-out mascot already has its own ring; hair and thumbs break out of it, so no clip
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.q, W / 2, 330, (c) => { he(c, '🔤', 0, -120, { size: 130, w: 400 }); he(c, 'באיזו אות מתחיל…', 0, 50, { size: 112, w: 900, maxW: SAFE.w }); }, { rot: -0.03, dur: 0.35 });
    popAt(ctx, t, ev.pic, W / 2, 800, (c) => {
      card(c, -230, -230, 460, 460, { fill: '#fff', r: 60, seed: 11, shadow: 14 });
      const k = 1 + 0.04 * Math.sin((t - ev.pic) * 6);
      c.scale(k, k);
      he(c, '🚂', 0, 80, { size: 270, w: 400 });
    }, { rot: 0.03, dur: 0.4, over: 2.2 });
    const sp = clamp((t - ev.ready) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.ready + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1160); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, '⏱️ יש לכם 4 שניות', { size: 70, w: 900, bg: C.red, fg: '#fff', padX: 48 });
      ctx.restore();
    }
    he(ctx, 'ילדי גן עונים מהר. ואתם?', W / 2, 1290, { size: 52, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.ready + 0.3, 0.3), maxW: SAFE.w });
    mascot(ctx, W / 2, 1530 - hop(t, 10) * (t > ev.ready ? 1 : 0), 360, t, ev.ready);
  }

  // ================= THE QUESTION =================
  function shotQuiz(ctx, t) {
    bg(ctx);
    he(ctx, 'באיזו אות מתחילה', W / 2, 250, { size: 80, w: 900, alpha: UI.fadeIn(t, T(2), 0.2) });
    he(ctx, 'המילה של התמונה?', W / 2, 345, { size: 80, w: 900, color: C.red, alpha: UI.fadeIn(t, T(2) + 0.1, 0.2) });
    popAt(ctx, t, T(2) + 0.15, W / 2, 640, (c) => {
      card(c, -190, -190, 380, 380, { fill: '#fff', r: 56, seed: 21, shadow: 14 });
      he(c, '🚂', 0, 70, { size: 230, w: 400 });
    }, { rot: -0.02 });
    // the four options (2×2), like the game's buttons
    const TW = 340, TH = 210, gx = 40, x0 = W / 2 - TW - gx / 2, y0 = 930;
    S.opts.forEach((o) => {
      const col = o.i % 2, row = Math.floor(o.i / 2);
      const cx = W / 2 + (col ? -1 : 1) * (TW + gx) / 2, cy = y0 + row * (TH + 36) + TH / 2;
      popAt(ctx, t, o.t, cx, cy, (c) => {
        card(c, -TW / 2, -TH / 2, TW, TH, { fill: '#fff', r: 40, seed: 30 + o.i, shadow: 12 });
        he(c, o.label, 0, 62, { size: 170, w: 900 });
      }, { dur: 0.28, over: 2.4 });
    });
    const started = t >= ev.count, up = t >= ev.ring;
    if (started) {
      const cur = S.ticks.filter((k) => t >= k.t).pop();
      const cx = W / 2, cy = 1590, r = 100;
      const frac = up ? 0 : clamp(1 - (t - ev.count) / (ev.ring - ev.count));
      const urgent = !up && cur && cur.n <= 2;
      popAt(ctx, t, ev.count, cx, cy, (c) => {
        c.fillStyle = C.ink; c.beginPath(); c.arc(8, 10, r, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
        c.strokeStyle = urgent || up ? C.red : C.blue; c.lineWidth = 20; c.lineCap = 'round';
        if (frac > 0) { c.beginPath(); c.arc(0, 0, r - 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); c.stroke(); }
        c.strokeStyle = C.ink; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
        const k = cur ? 1 + 0.12 * pulse(t, cur.t, 10) : 1;
        c.scale(k, k);
        he(c, up ? '0' : String(cur ? cur.n : 4), 0, 34, { size: 100, w: 900, dir: 'ltr', color: urgent || up ? C.red : C.ink });
      }, { dur: 0.3 });
      if (urgent) { ctx.save(); ctx.globalAlpha = 0.12 * pulse(t, cur.t, 6); ctx.fillStyle = C.red; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    }
  }

  // ================= HOW THE GAME WORKS =================
  function shotModes(ctx, t) {
    bg(ctx);
    he(ctx, 'משחק אותיות לגן', W / 2, 230, { size: 92, w: 900, alpha: UI.fadeIn(t, ev.head, 0.2), maxW: SAFE.w });
    he(ctx, 'שלושה משחקים קצרים', W / 2, 320, { size: 50, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.head + 0.1, 0.25) });
    const MODES = [['🔎', 'מצאו את האות', C.blue], ['🖼️', 'באיזו אות זה מתחיל?', C.red], ['🗣️', 'איך קוראים לאות?', C.green]];
    MODES.forEach(([em, label, col], i) => {
      const cy = 520 + i * 210;
      popAt(ctx, t, ev.cards[i], W / 2, cy, (c) => {
        card(c, -SAFE.w / 2, -90, SAFE.w, 180, { fill: '#fff', r: 36, seed: 40 + i, shadow: 12 });
        c.fillStyle = col; c.beginPath(); c.arc(SAFE.w / 2 - 95, 0, 62, 0, Math.PI * 2); c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
        he(c, em, SAFE.w / 2 - 95, 28, { size: 72, w: 400 });
        he(c, label, SAFE.w / 2 - 190, 24, { size: 56, w: 900, align: 'right', maxW: SAFE.w - 260 });
      }, { rot: i % 2 ? 0.012 : -0.012, dur: 0.3 });
    });
    // letter sets
    ['כל האותיות', 'א–כ', 'ל–ת'].forEach((s, i) => {
      popAt(ctx, t, ev.chips + i * BEAT / 2, W / 2 + (1 - i) * 330, 1190, (c) => pill(c, 0, 0, s, { size: 42, w: 900, bg: i === 0 ? '#ffc8dd' : '#fff', padX: 30, seed: 50 + i }), { dur: 0.25 });
    });
    popAt(ctx, t, ev.sim, W / 2, 1330, (c) => pill(c, 0, 0, 'ד׳ ור׳ · ה׳ וח׳ · ב׳ וכ׳ — דומות בכוונה', { size: 42, w: 800, bg: C.yellow, padX: 36, seed: 55, maxW: SAFE.w }), { rot: -0.015 });
    popAt(ctx, t, ev.stars, W / 2, 1500, (c) => {
      he(c, '⭐⭐⭐', 0, 30, { size: 110, w: 400 });
    }, { dur: 0.4 });
    he(ctx, '10 שאלות · כוכבים בסוף · עם קול לכל אות', W / 2, 1620, { size: 42, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.stars + 0.15, 0.25), maxW: SAFE.w });
  }

  // ================= END: answer in the comments =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.comment, W / 2, 330, (c) => {
      card(c, -SAFE.w / 2, -170, SAFE.w, 340, { fill: C.yellow, r: 40, seed: 401, shadow: 14 });
      he(c, 'אז באיזו אות מתחילה 🚂?', 0, -70, { size: 60, w: 900, color: C.red, maxW: SAFE.w - 60 });
      he(c, '✍️ כתבו את התשובה', 0, 30, { size: 84, w: 900, maxW: SAFE.w - 60 });
      he(c, 'בתגובות', 0, 125, { size: 84, w: 900, color: C.blue });
    }, { rot: -0.02, dur: 0.4 });
    he(ctx, 'ואל תגלו לילדים 🤫', W / 2, 580, { size: 46, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.comment + 0.5, 0.3), maxW: SAFE.w });
    mascot(ctx, W / 2, 880, 400, t, ev.logo);
    const L = S.endLines;
    he(ctx, 'משחק אותיות לגן ולכיתה א׳', W / 2, 1180, { size: 54, w: 800, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1290, (c) => pill(c, 0, 0, 'בחינם · בלי הרשמה', { size: 48, w: 900, bg: '#fff', seed: 402, padX: 40, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, L[2].t, W / 2, 1430, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 66, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 403 }));
    he(ctx, 'בתפריט: בית ספר ← לימוד אותיות ← משחק אותיות לגן', W / 2, 1570, { size: 36, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    confetti(ctx, t, ev.logo, W / 2, 880, { n: 70, seed: 9, spread: 950 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook, color: C.red },
    { t0: T(2), fn: shotQuiz, color: C.blue },
    { t0: T(5), fn: shotModes, color: C.green },
    { t0: T(9), fn: shotEnd, color: C.red },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const Ld = (n) => Studio.loadImage(n).catch(() => null);
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.logo = (await Ld('img/mascot.png')) || (await Ld('img/logo.svg'));
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        const e = 1 - Math.pow(1 - u, 4);
        ctx.save(); ctx.translate(e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((e - 1) * W, 0); sec.fn(ctx, t); ctx.restore();
        ctx.fillStyle = sec.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
