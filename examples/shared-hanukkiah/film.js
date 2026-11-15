// THE FILM (9:16) — "כמה נרות דולקים?": the shared hanukkiah in the site own look. Pure function of t.
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


  // ---------- the SVG hanukkiah of the page (viewBox 400x300), drawn on the canvas ----------
  const CUPS_RTL = [362, 326, 290, 254, 146, 110, 74, 38];
  const CAND = ['#7cc4ff', '#ff9ab8', '#ffe27a', '#9be3a4', '#c9a7ff', '#ffb36b', '#8fe0e0', '#ff8f8f'];
  function flame(ctx, t, x, top, i, big, p) {
    if (p <= 0) return;
    const h = (big ? 24 : 20) * p, w = (big ? 8 : 7) * p, fl = 1 + 0.05 * Math.sin(t * 9 + i * 1.7);
    const gl = ctx.createRadialGradient(x, top - h / 2, 0, x, top - h / 2, big ? 20 : 17);
    gl.addColorStop(0, 'rgba(255,213,107,.75)'); gl.addColorStop(1, 'rgba(255,213,107,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, top - h / 2, (big ? 20 : 17) * p, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(x, top); ctx.scale(1, fl); ctx.translate(-x, -top);
    const fg = ctx.createLinearGradient(0, top - h, 0, top); fg.addColorStop(0, '#ffe066'); fg.addColorStop(0.6, '#ffa31a'); fg.addColorStop(1, '#ff6a00');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(x, top - h);
    ctx.bezierCurveTo(x + w, top - h * 0.55, x + w * 0.85, top - 2, x, top); ctx.bezierCurveTo(x - w * 0.85, top - 2, x - w, top - h * 0.55, x, top - h); ctx.fill();
    ctx.fillStyle = '#fff7d6'; ctx.beginPath(); ctx.moveTo(x, top - h * 0.5);
    ctx.bezierCurveTo(x + 3 * p, top - h * 0.3, x + 2.5 * p, top - 2, x, top - 1); ctx.bezierCurveTo(x - 2.5 * p, top - 2, x - 3 * p, top - h * 0.3, x, top - h * 0.5); ctx.fill();
    ctx.restore();
  }
  // night = number of slots; litT = time each candle (left to right) was lit (Infinity = not yet)
  function hanukkiah(ctx, t, cx, cy, sc, night, litT) {
    ctx.save(); ctx.translate(cx - 200 * sc, cy - 150 * sc); ctx.scale(sc, sc);
    const gold = ctx.createLinearGradient(0, 90, 0, 280); gold.addColorStop(0, '#ffe08a'); gold.addColorStop(1, '#d99a1e');
    const CUP_Y = 128;
    ctx.strokeStyle = gold; ctx.lineWidth = 7; ctx.lineCap = 'round';
    [54, 90, 126, 162].forEach((d) => { ctx.beginPath(); ctx.moveTo(200 - d, CUP_Y + 8); ctx.quadraticCurveTo(200, CUP_Y + 8 + d * 0.95, 200 + d, CUP_Y + 8); ctx.stroke(); });
    ctx.fillStyle = gold;
    ctx.beginPath(); ctx.roundRect(195, 96, 10, 160, 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(150, 268); ctx.quadraticCurveTo(200, 238, 250, 268); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.roundRect(140, 266, 120, 12, 6); ctx.fill();
    CUPS_RTL.forEach((x) => { ctx.beginPath(); ctx.roundRect(x - 13, CUP_Y, 26, 11, 4); ctx.fill(); });
    ctx.beginPath(); ctx.roundRect(187, 92, 26, 11, 4); ctx.fill();
    ctx.fillStyle = '#fff3d1'; ctx.beginPath(); ctx.roundRect(193, 46, 14, 47, 3); ctx.fill();
    flame(ctx, t, 200, 44, 0, true, 1);
    const active = CUPS_RTL.slice(0, night).sort((a, b) => a - b);
    active.forEach((x, i) => {
      const lt = litT[i] === undefined ? Infinity : litT[i], p = lt === Infinity ? 0 : ease.outBack(clamp((t - lt) / 0.4), 2);
      ctx.globalAlpha = p > 0 ? 1 : 0.35; ctx.fillStyle = CAND[i % 8]; ctx.beginPath(); ctx.roundRect(x - 6, 82, 12, 46, 3); ctx.fill(); ctx.globalAlpha = 1;
      if (p > 0) flame(ctx, t, x, 80, i + 1, false, Math.max(0.01, p)); else { ctx.strokeStyle = 'rgba(255,248,230,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, 82); ctx.lineTo(x, 76); ctx.stroke(); }
    });
    ctx.restore();
  }
  // the night-sky card of the page
  function sky(ctx, x, y, w, h, seed = 7) {
    ctx.save(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(x + 9, y + 12, w, h, 40); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 40); ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0f1b45'); g.addColorStop(0.55, '#1b2a66'); g.addColorStop(1, '#24357a'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const gl = ctx.createRadialGradient(x + w / 2, y + h * 1.1, 0, x + w / 2, y + h * 1.1, w * 0.6); gl.addColorStop(0, 'rgba(246,185,74,.28)'); gl.addColorStop(1, 'rgba(246,185,74,0)'); ctx.fillStyle = gl; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc(x + U.hash(seed + i) * w, y + U.hash(seed + 50 + i) * h * 0.6, 1.5 + U.hash(seed + 90 + i) * 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.roundRect(x, y, w, h, 40); ctx.stroke();
  }
  const numDot = (c, x, y, n, r = 30) => {
    c.fillStyle = C.ink; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    he(c, String(n), x, y + r * 0.36, { size: r * 1.05, w: 900, color: '#fff', dir: 'ltr' });
  };
  const WA = '#25D366';

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 290, (c) => pill(c, 0, 0, '🕎 חנוכה מתקרב', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 500, (c) => he(c, 'בערב השישי של חנוכה', 0, 0, { size: 118, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 655, (c) => he(c, 'כמה נרות דולקים?', 0, 0, { size: 150, w: 900, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, ev.q2, W / 2, 815, (c) => he(c, 'ביחד עם השמש 🕯️', 0, 0, { size: 124, w: 900, color: C.red, maxW: SAFE.w }), { rot: -0.025 });
    S.hookOpts.forEach((o) => {
      const x = 800 - o.i * 260;
      popAt(ctx, t, o.t, x, 1040, (c) => {
        card(c, -115, -100, 230, 200, { seed: 20 + o.i, shadow: 10, r: 34 });
        he(c, o.s, 0, 42, { size: 130, w: 900, dir: 'ltr', maxW: 200 });
      }, { rot: [-0.02, 0.02, -0.015][o.i] });
    });
    he(ctx, 'חידה מתוך החנוכייה המשותפת', W / 2, 1185, { size: 46, w: 800, color: C.ink, alpha: UI.fadeIn(t, S.hookOpts[2].t, 0.3), maxW: SAFE.w });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(710, 1300); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'מה אתם אומרים? 👆', { size: 46, w: 900, bg: C.yellow, padX: 34 });
      ctx.restore();
    }
    mascot(ctx, 295, 1490 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 500, t, ev.q2);
  }

  // ================= 1. KIND + NAME =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const A = S.AUD, picked = t >= ev.pick ? 1 : 0;
    // "של מי החנוכייה?" + 4 kind buttons (right to left)
    popAt(ctx, t, A[0].t, W / 2, 620, (c) => {
      he(c, 'של מי החנוכייה?', SAFE.w / 2, -86, { size: 40, w: 800, align: 'right' });
      S.KINDS.forEach((k, i) => {
        const x = SAFE.w / 2 - 105 - i * 224, on = i === picked, w = 206;
        G.rrect(c, x - w / 2, -50, w, 112, 28, { fill: on ? C.ink : '#fff', lw: 4, seed: 11 + i, stroke: on ? C.ink : C.line });
        he(c, `${k[0]} ${k[1]}`, x, 22, { size: 40, w: 800, color: on ? '#fff' : C.ink, maxW: w - 24 });
      });
    }, { dur: 0.28, over: 1.5, rot: 0.004 });
    UI.tap(ctx, 640, 645, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    // title field with the placeholder example of the chosen kind
    popAt(ctx, t, A[1].t, W / 2, 850, (c) => {
      card(c, -SAFE.w / 2, -108, SAFE.w, 216, { fill: '#fff', r: 30, seed: 30, shadow: 7, lw: 3.5 });
      he(c, 'שם החנוכייה', SAFE.w / 2 - 36, -48, { size: 36, w: 800, align: 'right' });
      G.rrect(c, -SAFE.w / 2 + 28, -18, SAFE.w - 56, 100, 22, { fill: '#f6f7fb', lw: 3, seed: 31, stroke: C.line });
      he(c, `למשל: ${S.KINDS[picked][2]}`, SAFE.w / 2 - 60, 46, { size: 42, w: 500, align: 'right', color: '#9aa0b8', maxW: SAFE.w - 120 });
    }, { dur: 0.25, over: 1.6, rot: -0.006 });
    popAt(ctx, t, A[2].t, W / 2, 1090, (c) => pill(c, 0, 0, '🕎 פתיחת חנוכייה משותפת', { size: 54, w: 900, bg: C.ink, fg: '#fff', padX: 70, seed: 32, maxW: SAFE.w }), { rot: 0.01, dur: 0.3 });
    popAt(ctx, t, A[3].t, W / 2, 1290, (c) => pill(c, 0, 0, 'בחינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, A[4].t, W / 2, 1420, (c) => pill(c, 0, 0, 'מקבלים קישור לשליחה לקבוצה', { size: 46, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. SEND TO WHATSAPP =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const T0 = S.TOPICS, press = t >= ev.topic ? 1 - 0.07 * pulse(t, ev.topic, 10) : 1;
    popAt(ctx, t, T0[0].t, W / 2, 600, (c) => {
      card(c, -SAFE.w / 2, -100, SAFE.w, 200, { fill: '#ecfdf3', r: 36, seed: 40, shadow: 8, lw: 4, stroke: '#34d399' });
      he(c, '🎉 החנוכייה מוכנה!', 0, -14, { size: 62, w: 900, maxW: SAFE.w - 60 });
      he(c, 'עכשיו שולחים את הקישור לקבוצה', 0, 58, { size: 40, w: 600, color: C.muted, maxW: SAFE.w - 60 });
    }, { dur: 0.3, over: 1.5, rot: -0.008 });
    popAt(ctx, t, T0[1].t, W / 2, 800, (c) => { c.scale(press, press); pill(c, 0, 0, '📱 שליחה לקבוצה בוואטסאפ', { size: 54, w: 900, bg: WA, fg: '#fff', padX: 60, seed: 41, maxW: SAFE.w }); }, { dur: 0.3, over: 1.6, rot: 0.01 });
    popAt(ctx, t, T0[2].t, W / 2, 935, (c) => pill(c, 0, 0, '🔗 העתקת קישור', { size: 46, w: 900, bg: '#fff', padX: 80, seed: 42 }), { rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 815, t, ev.topic, { color: 'rgba(37,211,102,0.85)', size: 120 });
    // the WhatsApp message (the real share text, first lines)
    popAt(ctx, t, T0[3].t, W / 2, 1245, (c) => {
      card(c, -SAFE.w / 2, -195, SAFE.w, 390, { fill: '#dcf8c6', r: 36, seed: 43, shadow: 8, lw: 4 });
      he(c, '🕎 החנוכייה של כיתה ג׳2', SAFE.w / 2 - 40, -108, { size: 48, w: 900, align: 'right', maxW: SAFE.w - 80 });
      wrap(c, 'בחנוכה הזה מדליקים יחד! כל ערב כל אחד מוסיף נר עם השם שלו (ואם בא לו — גם משאלה קטנה).', 40, SAFE.w - 90, 600, 4).forEach((ln, k) => he(c, ln, SAFE.w / 2 - 40, -34 + k * 56, { size: 40, w: 600, align: 'right', maxW: SAFE.w - 80 }));
    }, { dur: 0.35, over: 1.4, rot: 0.006 });
    popAt(ctx, t, T0[4].t, W / 2, 1530, (c) => pill(c, 0, 0, 'קישור אחד לכל הקבוצה', { size: 46, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T0[5].t, W / 2, 1650, (c) => pill(c, 0, 0, 'וקישור ניהול שנשאר אצלכם', { size: 46, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. LIGHT A CANDLE (the form) =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES, press = t >= ev.mode ? 1 - 0.08 * pulse(t, ev.mode, 10) : 1;
    popAt(ctx, t, M0[0].t, W / 2, 590, (c) => {
      card(c, -SAFE.w / 2, -90, SAFE.w, 180, { fill: '#fff', r: 28, seed: 70, shadow: 7, lw: 3.5 });
      he(c, 'השם שלכם  (שם פרטי או כינוי)', SAFE.w / 2 - 34, -34, { size: 34, w: 800, align: 'right', maxW: SAFE.w - 70 });
      G.rrect(c, -SAFE.w / 2 + 26, -8, SAFE.w - 52, 78, 20, { fill: C.yellow, lw: 3, seed: 71, stroke: C.line });
      he(c, 'נועה', SAFE.w / 2 - 56, 48, { size: 48, w: 800, align: 'right' });
    }, { dur: 0.25, over: 1.5, rot: 0.005 });
    popAt(ctx, t, M0[1].t, W / 2, 810, (c) => {
      card(c, -SAFE.w / 2, -100, SAFE.w, 200, { fill: '#fff', r: 28, seed: 72, shadow: 7, lw: 3.5 });
      he(c, 'משאלה קטנה  (לא חובה)', SAFE.w / 2 - 34, -44, { size: 34, w: 800, align: 'right', maxW: SAFE.w - 70 });
      G.rrect(c, -SAFE.w / 2 + 26, -18, SAFE.w - 52, 78, 20, { fill: C.yellow, lw: 3, seed: 73, stroke: C.line });
      he(c, S.WISH, SAFE.w / 2 - 56, 38, { size: 44, w: 700, align: 'right', maxW: SAFE.w - 130 });
      he(c, '💡 רעיון למשאלה', SAFE.w / 2 - 34, 92, { size: 30, w: 800, align: 'right', color: C.muted });
    }, { dur: 0.25, over: 1.5, rot: -0.005 });
    popAt(ctx, t, M0[2].t, W / 2, 1030, (c) => { c.scale(press, press); pill(c, 0, 0, '🕯️ הדלקת נר הערב', { size: 58, w: 900, bg: C.ink, fg: '#fff', padX: 90, seed: 74 }); }, { dur: 0.3, over: 1.6, rot: 0.01 });
    UI.tap(ctx, W / 2 + 40, 1045, t, ev.mode, { color: 'rgba(138,79,216,0.85)', size: 120 });
    popAt(ctx, t, M0[3].t, W / 2, 1230, (c) => pill(c, 0, 0, '✓ הנר שלך דולק! חג שמח 🕎', { size: 48, w: 900, bg: '#ecfdf3', seed: 75, maxW: SAFE.w }), { rot: -0.015, dur: 0.3 });
    popAt(ctx, t, M0[4].t, W / 2, 1400, (c) => pill(c, 0, 0, 'נר אחד לכל טלפון בכל ערב', { size: 46, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, M0[5].t, W / 2, 1520, (c) => pill(c, 0, 0, 'שם פרטי בלבד, בלי פרטים אישיים', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 4. THE HANUKKIAH LIGHTS UP =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    popAt(ctx, t, T(8, 0.05), W / 2, 845, (c) => {
      sky(c, -SAFE.w / 2, -360, SAFE.w, 720);
      he(c, 'כיתה 🏫 · חנוכה תשפ״ז', 0, -300, { size: 36, w: 800, color: '#fff8e6', maxW: SAFE.w - 60 });
      he(c, 'החנוכייה של כיתה ג׳2', 0, -230, { size: 56, w: 900, color: '#fff8e6', maxW: SAFE.w - 60 });
    }, { dur: 0.32, over: 1.3, rot: -0.005 });
    const litT = S.ROWS.map((r) => r.t);
    if (t >= T(8, 0.1)) hanukkiah(ctx, t, W / 2, 900, 2.0, 3, litT);
    popAt(ctx, t, ev.ans, W / 2, 1300, (c) => pill(c, 0, 0, '🕯️ 3 נרות הודלקו בקבוצה', { size: 56, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84, maxW: SAFE.w }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.ans, W / 2, 1290, { n: 60, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[0], W / 2, 1430, (c) => pill(c, 0, 0, 'השמש דולק תמיד ומדליק את כולם', { size: 44, w: 900, bg: C.lilac, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1550, (c) => pill(c, 0, 0, 'החנוכייה מתעדכנת לבד אצל כולם', { size: 44, w: 900, bg: C.yellow, seed: 86, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. WHO LIT + NIGHT CHIPS =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems;
    popAt(ctx, t, I[0].t, W / 2, 555, (c) => he(c, 'מי הדליק הערב (⁦3⁩)', SAFE.w / 2, 0, { size: 52, w: 900, align: 'right' }), { dur: 0.25, over: 1.4 });
    S.DEMO.forEach((d, k) => {
      const y = 680 + k * 170;
      popAt(ctx, t, I[k].t, W / 2, y, (c) => {
        G.rrect(c, -SAFE.w / 2, -70, SAFE.w, 140, 30, { fill: '#fffaf0', lw: 4, seed: 120 + k, stroke: '#f6c35a' });
        c.fillStyle = CAND[k]; c.beginPath(); c.roundRect(SAFE.w / 2 - 50, -34, 14, 58, 5); c.fill();
        he(c, d.name, SAFE.w / 2 - 76, -8, { size: 48, w: 900, align: 'right', maxW: SAFE.w - 140 });
        he(c, d.wish, SAFE.w / 2 - 76, 44, { size: 38, w: 500, align: 'right', color: '#44485f', maxW: SAFE.w - 140 });
      }, { dur: 0.25, over: 1.5, rot: [0.005, -0.005, 0.004][k] });
    });
    // night chips 1..8 on the sky strip
    popAt(ctx, t, I[3].t, W / 2, 1290, (c) => {
      sky(c, -SAFE.w / 2, -100, SAFE.w, 200, 21);
      he(c, 'בחירת ערב', SAFE.w / 2 - 30, -50, { size: 34, w: 800, align: 'right', color: '#fff8e6' });
      for (let n = 1; n <= 8; n++) {
        const x = SAFE.w / 2 - 66 - (n - 1) * 106, on = n === 3;
        c.fillStyle = on ? '#f6c35a' : 'rgba(255,255,255,.1)'; c.beginPath(); c.arc(x, 28, 42, 0, Math.PI * 2); c.fill();
        c.strokeStyle = on ? '#f6c35a' : 'rgba(255,248,230,.35)'; c.lineWidth = 3; c.stroke();
        he(c, String(n), x, 44, { size: 44, w: 900, color: on ? '#1b2a66' : '#fff8e6', dir: 'ltr' });
      }
    }, { dur: 0.3, over: 1.4, rot: -0.006 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1480, (c) => pill(c, 0, 0, 'הנר הראשון: יום שישי ⁦4.12⁩ בערב', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1600, (c) => pill(c, 0, 0, 'ואפשר לחזור לכל ערב של החג', { size: 44, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
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
    he(ctx, 'החנוכייה המשותפת', W / 2, 1000, { size: 56, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'באתר: חנוכה ← החנוכייה המשותפת', W / 2, 1350, { size: 40, w: 600, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1465, (c) => pill(c, 0, 0, '✍️ כמה נרות בערב השישי? כתבו בתגובות', { size: 48, w: 900, bg: C.red, fg: '#fff', padX: 44, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
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
