// THE FILM (9:16) — "עוד ישיבת צוות בלי פרוטוקול?": the teacher / coordinator / kindergarten templates
// in the site own look (paper + dot grid, ink-outlined cards with an offset shadow, Heebo). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff', mint: '#dff3e5', sky: '#e6f0ff', peach: '#ffeedd' };
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
  const hline = (ctx, x1, x2, y, color = C.line, lw = 3) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.restore(); };
  const vline = (ctx, x, y1, y2, color = C.line, lw = 3) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); ctx.restore(); };
  const box = (ctx, cx, cy, s = 34) => { ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.roundRect(cx - s / 2, cy - s / 2, s, s, 7); ctx.fill(); ctx.stroke(); ctx.restore(); };

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
  function chip(ctx, cx, cy, w, h, s, { on = false, color = C.blue, size = 34, seed = 1 } = {}) {
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed, stroke: on ? C.ink : C.line });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800, color: on ? '#fff' : C.ink, maxW: w - 24 });
  }
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }
  // a titled box with ruled lines (like LinedBox on the sheets)
  function linedBox(ctx, x, y, w, h, title, { fill = '#fff', seed = 1, size = 32 } = {}) {
    G.rrect(ctx, x, y, w, h, 16, { fill, lw: 3, seed, stroke: C.ink });
    he(ctx, title, x + w - 18, y + size + 10, { size, w: 800, align: 'right', maxW: w - 36 });
    for (let yy = y + size + 42; yy < y + h - 14; yy += 34) hline(ctx, x + 18, x + w - 18, yy, '#c9cfdf', 2.5);
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 285, (c) => pill(c, 0, 0, '👩‍🏫 למורים, לרכזות ולגננות', { size: 48, w: 900, bg: C.blue, fg: '#fff', padX: 46, seed: 12, maxW: SAFE.w }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 500, (c) => he(c, 'עוד ישיבת צוות', 0, 0, { size: 150, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q2, W / 2, 670, (c) => he(c, 'בלי פרוטוקול?', 0, 0, { size: 150, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.025 });
    S.hookOpts.forEach((o) => {
      const x = 760 - o.i * 220;
      popAt(ctx, t, o.t, x, 860, (c) => {
        card(c, -85, -85, 170, 170, { seed: 20 + o.i, shadow: 9, r: 30, fill: [C.sky, C.blush, C.lilac][o.i] });
        he(c, o.s, 0, 36, { size: 96, w: 700, dir: 'ltr' });
      }, { rot: [-0.04, 0.03, -0.02][o.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1065); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'איזה טופס הכי חסר לכם? 🤔', { size: 52, w: 900, bg: C.yellow, padX: 34, maxW: SAFE.w });
      ctx.restore();
    }
    mascot(ctx, W / 2, 1440 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 560, t, ev.q2);
  }

  // ================= 1. STAFF MEETING =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const X0 = 170, X1 = 910;
    popAt(ctx, t, T(2, 0.1), W / 2, 850, (c) => {
      c.translate(-W / 2, -850);
      card(c, 140, 485, 800, 730, { seed: 31, shadow: 14, r: 28 });
      he(c, 'פרוטוקול ישיבת צוות', W / 2, 555, { size: 46, w: 900, color: '#1e3a8a' });
      he(c, 'תאריך: ______   מנחה: ______   רושם/ת: ______', W / 2, 615, { size: 28, w: 600, color: C.muted, maxW: 740 });
      he(c, 'סדר היום', X1 - 5, 680, { size: 36, w: 900, align: 'right' });
      for (let i = 0; i < 3; i++) hline(c, X0 + 10, X1 - 10, 735 + i * 62, '#c9cfdf', 2.5);
      he(c, 'החלטות ומשימות', X1 - 5, 955, { size: 36, w: 900, align: 'right' });
      // table: החלטה / משימה | אחראי/ת | תאריך יעד | בוצע (RTL)
      G.rrect(c, X0, 980, X1 - X0, 210, 12, { fill: '#fff', lw: 3, seed: 35, stroke: C.ink });
      c.fillStyle = C.sky; c.fillRect(X0 + 3, 983, X1 - X0 - 6, 54);
      hline(c, X0, X1, 1037, C.ink, 2.5); hline(c, X0, X1, 1113);
      for (const x of [600, 440, 290]) vline(c, x, 980, 1190, C.ink, 2.5);
      he(c, 'החלטה / משימה', X1 - 14, 1020, { size: 28, w: 800, align: 'right' });
      he(c, 'אחראי/ת', 520, 1020, { size: 28, w: 800 });
      he(c, 'תאריך יעד', 365, 1020, { size: 28, w: 800 });
      he(c, 'בוצע', 230, 1020, { size: 28, w: 800 });
      box(c, 230, 1075); box(c, 230, 1151);
    }, { dur: 0.35, over: 1.5, rot: 0.006 });
    S.AUD.forEach((a) => popAt(ctx, t, a.t, W / 2, 725 + a.i * 62, (c) => {
      he(c, `${a.i + 1}. ${a.label}`, X1 - W / 2 - 10, 0, { size: 36, w: 600, align: 'right' });
    }, { dur: 0.25, over: 1.7 }));
    popAt(ctx, t, T(3, 0.2), W / 2, 1300, (c) => pill(c, 0, 0, 'לכל החלטה: מי אחראי ועד מתי', { size: 48, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    // the first decision row gets its tick
    checkMark(ctx, 230, 1075, 22, (t - ev.pick) / 0.35);
    popAt(ctx, t, T(3, 3), W / 2, 1430, (c) => pill(c, 0, 0, 'כל ישיבה נפתחת בטבלה של הקודמת', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. PARENT MEETING =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const X0 = 170, X1 = 910;
    popAt(ctx, t, T(4, 0.05), W / 2, 850, (c) => { c.translate(-W / 2, -850); card(c, 140, 475, 800, 760, { seed: 41, shadow: 14, r: 28 }); }, { dur: 0.3, over: 1.4, rot: -0.006 });
    he(ctx, 'אופן השיחה:', X1 - 5, 540, { size: 34, w: 900, align: 'right', alpha: UI.fadeIn(t, T(4, 0.2), 0.2) });
    const picked = t >= ev.topic;
    const CX = [[815, 170], [630, 170], [410, 230]];
    S.TOPICS.forEach((o) => popAt(ctx, t, o.t, CX[o.i][0], 605, (c) => chip(c, 0, 0, CX[o.i][1], 74, o.label, { on: picked && o.i === S.TOPIC_PICK, color: C.red, size: 34, seed: 50 + o.i }), { dur: 0.25, over: 1.8 }));
    UI.tap(ctx, CX[1][0], 625, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    const boxes = [
      [T(4, 1.8), X0, 665, X1 - X0, 105, 'מטרת השיחה', C.sky],
      [T(4, 2.3), 545, 790, X1 - 545, 160, 'חוזקות ונקודות לשימור', C.mint],
      [T(4, 2.3) + 0.12, X0, 790, 365, 160, 'נושאים שהועלו על ידי הצוות', '#fff'],
      [T(4, 2.8), X0, 970, X1 - X0, 105, 'מה שיתפו ההורים', C.blush],
    ];
    boxes.forEach(([t0, x, y, w, h, title, fill], k) => popAt(ctx, t, t0, x + w / 2, y + h / 2, (c) => { c.translate(-(x + w / 2), -(y + h / 2)); linedBox(c, x, y, w, h, title, { fill, seed: 60 + k, size: 30 }); }, { dur: 0.25, over: 1.6 }));
    popAt(ctx, t, T(4, 3.3), W / 2, 1150, (c) => {
      c.translate(-W / 2, -1150);
      he(c, 'סיכומים והמשך', X1 - 5, 1118, { size: 32, w: 900, align: 'right' });
      G.rrect(c, X0, 1135, X1 - X0, 75, 12, { fill: C.yellow, lw: 3, seed: 65, stroke: C.ink });
      for (const x of [470, 300]) vline(c, x, 1135, 1210, C.ink, 2.5);
      he(c, 'מה עושים', X1 - 18, 1183, { size: 28, w: 800, align: 'right' });
      he(c, 'באחריות', 385, 1183, { size: 28, w: 800 });
      he(c, 'עד מתי', 235, 1183, { size: 28, w: 800 });
    }, { dur: 0.25, over: 1.6 });
    popAt(ctx, t, T(5, 1.8), W / 2, 1335, (c) => pill(c, 0, 0, '🔒 פרטי הילד לא נשמרים באתר', { size: 48, w: 900, bg: C.mint, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(5, 2.6), W / 2, 1465, (c) => pill(c, 0, 0, 'דף אחד מסודר, עם שורת חתימה', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. STUDENT LIST =================
  const TICKS = [[1, 1, 0], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const X0 = 170, X1 = 910, COLX = [570, 410, 250]; // column centers (RTL: אישור טיול, תשלום, החזיר ספר)
    popAt(ctx, t, T(6, 0.1), W / 2, 830, (c) => {
      c.translate(-W / 2, -830);
      card(c, 140, 480, 800, 700, { seed: 32, shadow: 14, r: 28 });
      he(c, 'החזרת אישורים לטיול', W / 2, 550, { size: 44, w: 900, color: '#1e3a8a' });
      G.rrect(c, X0, 580, X1 - X0, 570, 12, { fill: '#fff', lw: 3, seed: 36, stroke: C.ink });
      c.fillStyle = C.lilac; c.fillRect(X0 + 3, 583, X1 - X0 - 6, 72);
      hline(c, X0, X1, 655, C.ink, 2.5);
      for (const x of [860, 650, 490, 330]) vline(c, x, 580, 1150, C.ink, 2.5);
      for (let i = 1; i < 4; i++) hline(c, X0, X1, 655 + i * 124);
      he(c, '#', 885, 630, { size: 30, w: 800, dir: 'ltr' });
      he(c, 'שם', 755, 630, { size: 32, w: 800 });
    }, { dur: 0.35, over: 1.4, rot: -0.006 });
    // the typed column titles
    S.Q.cols.forEach((s, c0) => he(ctx, s, COLX[c0], 630, { size: 28, w: 800, color: C.purple, alpha: UI.fadeIn(t, T(6, 0.5) + c0 * 0.15, 0.2), maxW: 150 }));
    S.MODES.forEach((r) => {
      const y = 717 + r.i * 124;
      popAt(ctx, t, r.t, W / 2, y, (c) => {
        he(c, String(r.i + 1), 885 - W / 2, 14, { size: 34, w: 700, dir: 'ltr', color: C.muted });
        he(c, r.name, 840 - W / 2, 14, { size: 42, w: 800, align: 'right' });
      }, { dur: 0.25, over: 1.7 });
      TICKS[r.i].forEach((on, c0) => { if (on) checkMark(ctx, COLX[c0], y, 26, (t - ev.mode - (r.i * 3 + c0) * 0.07) / 0.35, C.purple); });
    });
    UI.tap(ctx, COLX[0], 737, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    popAt(ctx, t, T(7, 0.2), W / 2, 1290, (c) => pill(c, 0, 0, 'מקלידים את השמות פעם אחת', { size: 48, w: 900, bg: C.lilac, seed: 190, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(7, 3), W / 2, 1420, (c) => pill(c, 0, 0, 'כותרות משלכם או עד 12 עמודות ריקות', { size: 42, w: 900, bg: C.yellow, seed: 191, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. TIMETABLE + PLANNER =================
  const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'];
  const LESSONS = [['חשבון', 'שפה', 'אנגלית', 'חשבון', 'מדעים', 'שפה'], ['שפה', 'חשבון', 'שפה', 'מדעים', 'חשבון', 'תנ״ך'], ['אנגלית', 'מדעים', 'חשבון', 'שפה', 'אנגלית', 'חשבון']];
  const LCOL = { 'חשבון': C.sky, 'שפה': C.blush, 'אנגלית': C.mint, 'מדעים': C.yellow, 'תנ״ך': C.lilac };
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const six = t >= ev.go;
    chip(ctx, 720, 515, 300, 76, '5 ימים', { on: !six, color: C.orange, size: 36, seed: 71 });
    chip(ctx, 380, 515, 300, 76, '6 ימים', { on: six, color: C.orange, size: 36, seed: 72 });
    UI.tap(ctx, 380, 535, t, ev.go, { color: 'rgba(224,138,0,0.8)', size: 120 });
    popAt(ctx, t, T(8, 0.1), W / 2, 790, (c) => {
      c.translate(-W / 2, -790);
      card(c, 140, 580, 800, 430, { seed: 33, shadow: 12, r: 26 });
      const nd = six ? 6 : 5, x1 = 905, x0 = 175, cw = (x1 - 60 - x0) / nd;
      for (let d = 0; d < nd; d++) {
        const cx = x1 - 60 - cw * (d + 0.5);
        he(c, DAYS[d], cx, 640, { size: 34, w: 900 });
        for (let p = 0; p < 3; p++) {
          const s = LESSONS[p][d];
          G.rrect(c, cx - cw / 2 + 6, 668 + p * 108, cw - 12, 94, 14, { fill: LCOL[s], lw: 2.5, seed: 80 + d * 3 + p, stroke: C.ink });
          he(c, s, cx, 728 + p * 108, { size: 28, w: 800, maxW: cw - 24 });
        }
      }
      for (let p = 0; p < 3; p++) he(c, String(p + 1), x1 - 28, 728 + p * 108, { size: 32, w: 800, dir: 'ltr', color: C.muted });
    }, { dur: 0.35, over: 1.4, rot: 0.005 });
    popAt(ctx, t, ev.ans, W / 2, 1150, (c) => {
      card(c, -400, -95, 800, 190, { fill: C.peach, seed: 150, shadow: 10, r: 28 });
      he(c, '📚 מערכת השעות שלי', 370, -22, { size: 46, w: 900, align: 'right', maxW: 740 });
      he(c, 'לכל שעה: השיעור הבא לפי תוכנית משרד החינוך', 370, 50, { size: 34, w: 600, align: 'right', maxW: 740 });
    }, { rot: -0.008, dur: 0.35, over: 1.5 });
    popAt(ctx, t, T(9, 0.7), W / 2, 1345, (c) => pill(c, 0, 0, 'מערך שיעור קצר + קישורים לתרגול', { size: 44, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(9, 2), W / 2, 1470, (c) => pill(c, 0, 0, '🖨️ הדפסה של כל השבוע', { size: 46, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 5. THE OTHER 11 =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const XS = [790, 540, 290];
    S.REST.forEach(([emo, label], k) => {
      const row = Math.floor(k / 3), col = k % 3, it = S.sheetItems[row];
      const cx = XS[col], cy = 575 + row * 165;
      popAt(ctx, t, it.t + col * 0.1, cx, cy, (c) => {
        card(c, -115, -70, 230, 140, { seed: 90 + k, shadow: 7, r: 22, fill: [C.sky, C.blush, C.mint, C.lilac][row] });
        he(c, emo, 0, -8, { size: 50, w: 700, dir: 'ltr' });
        he(c, label, 0, 48, { size: 30, w: 800, maxW: 205 });
      }, { dur: 0.28, over: 1.6, rot: [0.012, -0.01, 0.008][col] });
    });
    // the printer fills the last slot
    popAt(ctx, t, ev.printBtn, XS[2], 575 + 3 * 165, (c) => { img(c, IMG.printer, 0, 80, 170); }, { dur: 0.35, over: 1.8 });
    popAt(ctx, t, T(10, 3), W / 2, 1230, (c) => pill(c, 0, 0, 'שם בית הספר, הכיתה והשנה בכותרת', { size: 42, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1355, (c) => pill(c, 0, 0, 'לבית הספר ולגן', { size: 46, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1480, (c) => pill(c, 0, 0, '🖨️ הדפסה או PDF, בחינם', { size: 48, w: 900, bg: C.green, fg: '#fff', seed: 68, maxW: SAFE.w }), { rot: -0.025 });
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
    he(ctx, 'קבצים לרכזות, ניהול כיתה וגן', W / 2, 1000, { size: 54, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בדפים להדפסה באתר: קבצים לרכזות ולגננות', W / 2, 1350, { size: 38, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1465, (c) => pill(c, 0, 0, '✍️ איזה טופס עוד חסר? כתבו בתגובות', { size: 46, w: 900, bg: C.red, fg: '#fff', padX: 40, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
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
      IMG.printer = await L('img/home-printer.png');
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
