// THE FILM (9:16) — supplier recruitment #1, cake bakers: the founding-supplier offer of ugabuga.co.il in the
// site's own look (paper + dot grid, ink-outlined cards with an offset shadow, Heebo), the orange mascot. Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, BAR, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940
  const CX = SAFE.x + SAFE.w / 2; // centre of the TikTok-safe column
  const LRI = '⁦', PDI = '⁩';

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', lilacShadow: '#dcd0f7', line: '#dde2ed', card: '#ffffff', amber: '#fff8de', amberLine: '#f5b301' };
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
    if (maxW) { const full = measure(ctx, s, sz, w, fam) + padX * 2; if (full > maxW) sz = size * (maxW - padX * 2) / (full - padX * 2); }
    const ww = measure(ctx, s, sz, w, fam) + padX * 2, hh = h || size * 1.75;
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
  // wrap a Hebrew line into at most `max` lines that fit width w
  function wrap(ctx, str, size, w, weight = 500, max = 2) {
    const words = str.split(' '), lines = []; let cur = '';
    for (const wd of words) { const tryS = cur ? cur + ' ' + wd : wd; if (measure(ctx, tryS, size, weight) > w && cur) { lines.push(cur); cur = wd; } else cur = tryS; }
    if (cur) lines.push(cur); return lines.slice(0, max);
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

  // ---------- backgrounds ----------
  function bg(ctx) {
    ctx.drawImage(Studio.cache('bg', (x) => {
      x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.09)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }
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

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    for (let i = 0; i < 14; i++) { const x = 90 + U.hash(i * 3 + 1) * 900, y = 120 + U.hash(i * 3 + 2) * 1500, a = 0.25 + 0.25 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(255,191,63,${a + 0.1})`; ctx.beginPath(); ctx.arc(x, y, 4 + U.hash(i) * 5, 0, Math.PI * 2); ctx.fill(); }
    popAt(ctx, t, ev.tag, W / 2, 270, (c) => pill(c, 0, 0, 'לאופות ולאופים 🎂', { size: 50, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 440, (c) => he(c, 'אופה עוגות', 0, 0, { size: 140, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 585, (c) => he(c, 'מעוצבות? 🎂', 0, 0, { size: 140, w: 900, maxW: SAFE.w }), { rot: 0.025 });
    popAt(ctx, t, ev.q2, W / 2, 725, (c) => he(c, 'ההורים כבר מחפשים אותך', 0, 0, { size: 84, w: 900, color: C.red, maxW: SAFE.w }), { rot: -0.015 });
    he(ctx, 'באזור הספקים של עוגה בוגה', W / 2, 790, { size: 40, w: 600, color: C.muted, alpha: UI.fadeIn(t, ev.q2 + 0.3, 0.3), maxW: SAFE.w });
    popAt(ctx, t, ev.title, W / 2, 855, (c) => pill(c, 0, 0, '🏅 ספקים מייסדים', { size: 56, w: 900, bg: C.blue, fg: '#fff', padX: 48, seed: 13 }), { rot: 0.02, dur: 0.35 });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 975); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'מצטרפים בחינם', { size: 56, w: 900, bg: C.yellow, padX: 50, seed: 14 });
      ctx.restore();
    }
    mascot(ctx, W / 2, 1330 - (t > ev.mascot + 0.45 ? hop(t, 10) : 0), 520, t, ev.mascot);
  }

  // ================= 1. FIND: the directory =================
  function chipAt(ctx, cx, cy, w, h, s, { on = false, color = C.blue, size = 32, seed = 1 } = {}) {
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed, stroke: on ? C.ink : C.line });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800, color: on ? '#fff' : C.ink, maxW: w - 22 });
  }
  function shotFind(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const F = S.find, X = SAFE.x, Wc = SAFE.w;
    // the search box + category chips (the site's own placeholder and chip labels)
    popAt(ctx, t, F.search, CX, 560, (c) => {
      card(c, -Wc / 2, -62, Wc, 124, { fill: '#fff', r: 30, seed: 31, shadow: 8, lw: 4 });
      he(c, '🔍 חיפוש: קוסם, עוגת בצק סוכר, צלמת…', Wc / 2 - 34, 12, { size: 36, w: 600, color: C.muted, align: 'right', maxW: Wc - 70 });
    }, { dur: 0.3, over: 1.6, rot: -0.005 });
    const chipW = [200, 200, 200, 220], gap = 14;
    let x = RIGHT - 4;
    S.CHIPS.forEach(([e, s], k) => {
      const w = chipW[k], cx = x - w / 2, on = k === 2 && t >= F.chip;
      const p = UI.pop(t, F.search + 0.15 + k * 0.07, 0.25, 1.6);
      if (p > 0) { ctx.save(); ctx.translate(cx, 700); ctx.scale(p, p); chipAt(ctx, 0, 0, w, 76, `${e} ${s}`, { on, color: C.blue, size: 32, seed: 40 + k }); ctx.restore(); }
      if (k === 2) UI.tap(ctx, cx, 700, t, F.chip, { color: 'rgba(34,107,215,0.8)', size: 110 });
      x -= w + gap;
    });
    // one supplier card, as the directory shows it
    popAt(ctx, t, F.card, CX, 940, (c) => {
      const cw = Wc, ch = 340;
      card(c, -cw / 2, -ch / 2, cw, ch, { fill: '#fff', r: 34, seed: 50, shadow: 10 });
      c.save(); c.beginPath(); c.roundRect(-cw / 2 + 4, -ch / 2 + 4, cw - 8, 116, [30, 30, 0, 0]); c.clip();
      const g = c.createLinearGradient(cw / 2, 0, -cw / 2, 0); g.addColorStop(0, '#ffd6e0'); g.addColorStop(1, '#fff0b8'); c.fillStyle = g; c.fillRect(-cw / 2, -ch / 2, cw, 130);
      he(c, '🎂 🧁 🍰', 0, -ch / 2 + 90, { size: 72, w: 400 });
      c.restore();
      c.fillStyle = C.ink; c.beginPath(); c.arc(cw / 2 - 96, -ch / 2 + 140, 64, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.yellow; c.beginPath(); c.arc(cw / 2 - 96, -ch / 2 + 140, 59, 0, Math.PI * 2); c.fill();
      he(c, '🎂', cw / 2 - 96, -ch / 2 + 168, { size: 64, w: 400 });
      he(c, 'העסק שלך כאן', cw / 2 - 190, -ch / 2 + 200, { size: 54, w: 900, align: 'right', maxW: 520 });
      pill(c, cw / 2 - 250, 84, '🎂 עוגות וקינוחים', { size: 30, w: 800, bg: C.lilac, padX: 24, shadow: 4, seed: 51, h: 56 });
      const wp = UI.pop(t, F.wa, 0.25, 1.8);
      if (wp > 0) { c.save(); c.translate(-cw / 2 + 235, 120); c.scale(wp, wp); G.rrect(c, -190, -40, 380, 80, 40, { fill: '#25D366', lw: 4, seed: 52, stroke: C.ink }); he(c, '💬 וואטסאפ', 0, 14, { size: 40, w: 900, color: '#fff' }); c.restore(); }
    }, { dur: 0.35, over: 1.6, rot: 0.006 });
    UI.tap(ctx, 295, 1052, t, F.wa, { color: 'rgba(37,211,102,0.85)', size: 120 });
    popAt(ctx, t, F.nofee, W / 2, 1230, (c) => pill(c, 0, 0, 'בלי תיווך ובלי עמלות', { size: 50, w: 900, bg: C.yellow, seed: 53, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, F.visits, W / 2, 1350, (c) => pill(c, 0, 0, `📈 ${LRI}${S.VISITS_30D}${PDI} כניסות לאתר ב־${LRI}30${PDI} ימים`, { size: 40, w: 900, bg: '#e8f4ff', seed: 54, maxW: SAFE.w, padX: 30 }), { rot: 0.02 });
  }

  // ================= 2. EASY: three steps =================
  function shotEasy(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const rows = [
      { title: 'נכנסים לקישור', sub: 'ugabuga.co.il/suppliers/join', ltrSub: true, color: C.blue },
      { title: 'מתחברים עם גוגל או במייל', sub: 'בלי סיסמה, מקבלים קישור כניסה', color: C.red },
      { title: 'ממלאים את הכרטיס', sub: 'שם, תחום, אזור, תמונה וטלפון', color: C.purple },
    ];
    rows.forEach((r, i) => {
      const t0 = S.easy[i].t, cy = 640 + i * 235;
      popAt(ctx, t, t0, CX, cy, (c) => {
        card(c, -SAFE.w / 2, -102, SAFE.w, 204, { fill: '#fff', r: 32, seed: 60 + i, shadow: 9, lw: 4.5 });
        c.fillStyle = C.ink; c.beginPath(); c.arc(SAFE.w / 2 - 80 + 4, 6, 58, 0, Math.PI * 2); c.fill();
        c.fillStyle = r.color; c.beginPath(); c.arc(SAFE.w / 2 - 80, 0, 58, 0, Math.PI * 2); c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
        he(c, ['🔗','🔑','✏️'][i], SAFE.w / 2 - 80, 26, { size: 62, w: 400 });
        he(c, r.title, SAFE.w / 2 - 165, -16, { size: 52, w: 900, align: 'right', maxW: SAFE.w - 290 });
        if (r.ltrSub) he(c, r.sub, SAFE.w / 2 - 165, 54, { size: 38, w: 600, align: 'right', color: C.blue, dir: 'ltr', fam: 'Fredoka', maxW: SAFE.w - 290 });
        else he(c, r.sub, SAFE.w / 2 - 165, 54, { size: 36, w: 500, align: 'right', color: C.muted, maxW: SAFE.w - 290 });
      }, { dur: 0.3, over: 1.6, rot: [0.008, -0.008, 0.006][i] });
      checkMark(ctx, SAFE.x + 70, cy, 34, clamp((t - t0 - 0.45) / 0.3));
    });
    popAt(ctx, t, S.easyPill, CX, 1400, (c) => pill(c, 0, 0, 'וההורים פונים אליך בוואטסאפ 💬', { size: 46, w: 900, bg: C.yellow, seed: 70, maxW: 780 }), { rot: -0.03 });
  }

  // ================= 3. THE CARD FORM =================
  function field(ctx, x, y, w, h, text, { seed = 1, ltr = false, color = C.ink, filled = true, size = 38 } = {}) {
    G.rrect(ctx, x, y, w, h, 16, { fill: '#fbfcff', lw: 3, seed, stroke: filled ? C.ink : '#b9c0d4' });
    if (text) he(ctx, text, ltr ? x + 20 : x + w - 22, y + h / 2 + size * 0.36, { size, w: 700, align: ltr ? 'left' : 'right', color, dir: ltr ? 'ltr' : 'rtl', maxW: w - 44 });
  }
  function shotCard(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const K = S.card, X = SAFE.x, Wc = SAFE.w;
    card(ctx, X, 478, Wc, 740, { fill: '#fff', r: 34, seed: 80, shadow: 10 });
    const fx = X + 28, fw = Wc - 56, half = (fw - 24) / 2;
    // name (typed)
    he(ctx, 'שם העסק *', RIGHT - 28, 540, { size: 32, w: 900, align: 'right' });
    const n = Math.floor(clamp((t - K.name) / 0.9) * S.NAME.length);
    field(ctx, fx, 556, fw, 78, S.NAME.slice(0, n), { seed: 81, filled: n > 0 });
    if (t >= K.name && t < K.name + 1.0) UI.tap(ctx, fx + fw - 160, 595, t, K.name, { color: 'rgba(138,79,216,0.8)', size: 100 });
    // category + area
    he(ctx, 'תחום', RIGHT - 28, 696, { size: 32, w: 900, align: 'right' });
    he(ctx, 'אזור', fx + half - 4, 696, { size: 32, w: 900, align: 'right' });
    field(ctx, fx + half + 24, 712, half, 78, t >= K.cat ? '🎂 עוגות וקינוחים' : 'בחרו…', { seed: 82, filled: t >= K.cat, color: t >= K.cat ? C.ink : C.muted, size: 34 });
    field(ctx, fx, 712, half, 78, t >= K.area ? 'כל הארץ' : 'בחרו…', { seed: 83, filled: t >= K.area, color: t >= K.area ? C.ink : C.muted, size: 34 });
    // logo + main image tiles
    he(ctx, 'לוגו', RIGHT - 28, 852, { size: 32, w: 900, align: 'right' });
    he(ctx, 'תמונה ראשית', RIGHT - 28 - 214, 852, { size: 32, w: 900, align: 'right' });
    const ip = UI.pop(t, K.imgs, 0.3, 1.8);
    [[RIGHT - 28 - 62, 0], [RIGHT - 28 - 214 - 150, 1]].forEach(([cx, k]) => {
      const w = k ? 300 : 124, h = 124, x0 = cx - w / 2, y0 = 870;
      if (t < K.imgs) {
        ctx.save(); ctx.strokeStyle = '#b9c0d4'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.roundRect(x0, y0, w, h, k ? 18 : 62); ctx.stroke(); ctx.restore();
        he(ctx, '＋', cx, y0 + 78, { size: 56, w: 500, color: '#b9c0d4' });
      } else {
        ctx.save(); ctx.translate(cx, y0 + h / 2); ctx.scale(ip, ip);
        G.rrect(ctx, -w / 2, -h / 2, w, h, k ? 18 : 62, { fill: k ? '#ffe3ea' : C.yellow, lw: 3.5, seed: 84 + k, stroke: C.ink });
        he(ctx, k ? '🍰 🎂 🧁' : '🎂', 0, 24, { size: k ? 54 : 62, w: 400 });
        ctx.restore();
      }
    });
    // phone
    he(ctx, 'וואטסאפ', fx + 290, 852, { size: 32, w: 900, align: 'right' });
    field(ctx, fx, 870, 290, 124, t >= K.phone ? '050-1234567' : '', { seed: 85, ltr: true, filled: t >= K.phone, size: 36 });
    // the save button (the site's own label)
    const press = t >= K.save ? 1 - 0.07 * pulse(t, K.save, 10) : 1;
    ctx.save(); ctx.translate(W / 2, 1120); ctx.scale(press, press);
    pill(ctx, 0, 0, '🎈 אני בפנים, תפרסמו אותי!', { size: 48, w: 900, bg: t >= K.save ? C.green : C.red, fg: '#fff', padX: 44, seed: 86, h: 98, maxW: Wc - 40 });
    ctx.restore();
    UI.tap(ctx, W / 2 + 120, 1125, t, K.save, { color: 'rgba(20,22,45,0.7)', size: 120 });
    // after saving: the site's own welcome note
    popAt(ctx, t, K.review, CX, 1380, (c) => {
      card(c, -SAFE.w / 2, -96, SAFE.w, 192, { fill: '#fff4d0', r: 30, seed: 87, shadow: 8, lw: 4.5, stroke: C.ink });
      he(c, '🎈 ברוכים הבאים למשפחת עוגה בוגה!', SAFE.w / 2 - 30, -22, { size: 46, w: 900, align: 'right', maxW: SAFE.w - 60 });
      he(c, 'הכרטיס עולה לאתר אחרי בדיקה קצרה,', SAFE.w / 2 - 30, 36, { size: 36, w: 600, align: 'right', color: '#3b3e5c', maxW: SAFE.w - 60 });
      he(c, 'בדרך כלל תוך יום', SAFE.w / 2 - 30, 78, { size: 36, w: 600, align: 'right', color: '#3b3e5c', maxW: SAFE.w - 60 });
    }, { dur: 0.35, over: 1.5, rot: -0.006 });
    confetti(ctx, t, K.save, W / 2, 1120, { n: 40, seed: 4, spread: 800 });
  }

  // ================= 4. THE FOUNDING OFFER =================
  function shotOffer(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const X = SAFE.x, Wc = SAFE.w;
    const hp = UI.pop(t, S.steps[3].t + 0.3, 0.35, 1.5);
    if (hp > 0) { ctx.save(); ctx.translate(W / 2, 800); ctx.scale(hp, hp); ctx.translate(-W / 2, -800); card(ctx, X, 478, Wc, 850, { fill: C.amber, r: 36, seed: 90, shadow: 11, lw: 5, stroke: C.amberLine, shadowColor: C.ink }); ctx.restore(); }
    if (hp > 0) he(ctx, '🏅 50 הספקים הראשונים', RIGHT - 34, 568, { size: 52, w: 900, align: 'right', alpha: hp, maxW: Wc - 70 });
    if (hp > 0) he(ctx, '= ספקים מייסדים', RIGHT - 34, 632, { size: 40, w: 800, align: 'right', color: '#a15c00', alpha: hp, maxW: Wc - 70 });
    const PERKS = [['כרטיס ספק באתר בחינם', 'כבר עכשיו'], ['תג 🏅 ספק מייסד', 'בכרטיס ובעמוד העסק שלך'], ['כשהמסלול בתשלום ייפתח:', 'עוד חודשיים חינם'], ['ואחריהם, מחיר מייסד:', `רק ${LRI}9.90${PDI} ₪ לחודש`]];
    S.perks.forEach((p, i) => {
      const cy = 745 + i * 142;
      popAt(ctx, t, p.t, CX, cy, (c) => {
        const hot = i >= 2;
        if (hot) card(c, -Wc / 2 + 26, -64, Wc - 52, 128, { fill: '#fff', r: 24, seed: 95 + i, shadow: 6, lw: 4, stroke: C.ink });
        checkMark(c, Wc / 2 - 74, 0, 28, 1);
        he(c, PERKS[i][0], Wc / 2 - 120, -8, { size: 40, w: 800, align: 'right', maxW: Wc - 200 });
        he(c, PERKS[i][1], Wc / 2 - 120, 40, { size: hot ? 46 : 38, w: 900, align: 'right', color: hot ? C.red : '#3b3e5c', maxW: Wc - 200 });
      }, { dur: 0.3, over: 1.6, rot: [0.004, -0.004][i % 2] });
    });
    popAt(ctx, t, S.offerPill, W / 2, 1430, (c) => pill(c, 0, 0, 'בלי התחייבות ובלי כרטיס אשראי', { size: 44, w: 900, bg: C.green, fg: '#fff', seed: 96, maxW: SAFE.w, padX: 40 }), { rot: -0.03 });
  }

  // ================= 5. PLACES LEFT =================
  function shotLeft(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const cols = 10, sp = 82, x0 = W / 2 + (cols - 1) / 2 * sp, y0 = 545;
    S.dots.forEach((d) => {
      const p = UI.pop(t, d.t, 0.25, 1.8); if (p <= 0) return;
      const taken = d.i < S.TAKEN, r = Math.floor(d.i / cols), c = d.i % cols, x = x0 - c * sp, y = y0 + r * sp;
      ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(2, 3, 29, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = taken ? '#c9cfdf' : '#bff0d1'; ctx.beginPath(); ctx.arc(0, 0, 29, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.stroke();
      if (taken) he(ctx, '🏅', 0, 12, { size: 34, w: 400 });
      ctx.restore();
    });
    { const rp = clamp((t - S.numT) / 0.45); if (rp > 0 && rp < 1) { ctx.save(); ctx.globalAlpha = (1 - rp) * 0.9; ctx.strokeStyle = C.red; ctx.lineWidth = 22 * (1 - rp) + 4; ctx.beginPath(); ctx.arc(W / 2, 1120, 80 + ease.outCubic(rp) * 520, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); } }
    popAt(ctx, t, S.numT, W / 2, 1195, (c) => {
      he(c, String(S.LEFT), 0, 0, { size: 310, w: 900, color: C.red, dir: 'ltr' });
    }, { dur: 0.4, over: 2.2, rot: -0.03 });
    popAt(ctx, t, S.numT + 0.2, W / 2, 1300, (c) => he(c, `מקומות פנויים מתוך ${LRI}${S.LIMIT}${PDI}`, 0, 0, { size: 56, w: 900, maxW: SAFE.w }), { rot: 0.01 });
    he(ctx, `נכון ל־${LRI}27.11${PDI}, מתוך האתר`, W / 2, 1362, { size: 34, w: 600, color: C.muted, alpha: UI.fadeIn(t, S.asOfT, 0.3), maxW: SAFE.w });
    popAt(ctx, t, S.linkT, W / 2, 1450, (c) => pill(c, 0, 0, 'ugabuga.co.il/suppliers/join', { size: 44, w: 600, bg: C.blue, fg: '#fff', padX: 40, dir: 'ltr', fam: 'Fredoka', seed: 97, maxW: SAFE.w }), { rot: -0.015, dur: 0.35 });
    confetti(ctx, t, S.numT, W / 2, 1120, { n: 50, seed: 7, spread: 900 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 440); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 420, 340, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 700 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'אופה עוגות? ההורים כבר מחפשים אותך', W / 2, 785, { size: 46, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 880, (c) => pill(c, 0, 0, 'ספק מייסד: חינם עכשיו 🏅', { size: 46, w: 900, bg: C.yellow, seed: 190, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1000, (c) => pill(c, 0, 0, 'ugabuga.co.il/suppliers/join', { size: 50, w: 600, bg: C.blue, fg: '#fff', padX: 44, dir: 'ltr', fam: 'Fredoka', seed: 191, maxW: SAFE.w }));
    popAt(ctx, t, L[3].t, W / 2, 1215, (c) => { card(c, -450, -115, 900, 230, { fill: C.red, r: 40, seed: 192, shadow: 8, lw: 4.5 }); he(c, 'מכירים אופה עוגות?', 0, -22, { size: 66, w: 900, color: '#fff', maxW: 840 }); he(c, 'תייגו בתגובות 👇', 0, 62, { size: 66, w: 900, color: '#fff', maxW: 840 }); }, { rot: 0.015, dur: 0.35 });
    he(ctx, `נשארו ${LRI}${S.LEFT}${PDI} מתוך ${LRI}${S.LIMIT}${PDI} מקומות (נכון ל־${LRI}27.11${PDI})`, W / 2, 1410, { size: 42, w: 800, color: '#3b3e5c', alpha: UI.fadeIn(t, L[3].t + 0.4, 0.3), maxW: SAFE.w });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 36, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotFind },
    { t0: T(4), fn: shotEasy },
    { t0: T(6), fn: shotCard },
    { t0: T(8), fn: shotOffer },
    { t0: T(10), fn: shotLeft },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
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
