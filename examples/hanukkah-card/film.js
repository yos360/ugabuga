// THE FILM (9:16) — "כמה ברכות מברכים בערב השני של חנוכה?": the Hanukkah candle-lighting card in the site own look. Pure function of t.
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

  // a hanukkiah: 8 candles + the shamash in the middle (taller); candles are numbered from the right, `lit` of them burn
  function hanukkiah(ctx, cx, baseY, w, lit, t, color = C.blue) {
    const gap = w / 9, ch = w * 0.17;
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2.5, w * 0.011);
    ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.roundRect(cx - w / 2, baseY, w, w * 0.06, w * 0.03); ctx.fill(); ctx.stroke();
    for (let k = 0; k < 9; k++) {
      const x = cx + (k - 4) * gap, sh = k === 4, h = sh ? ch * 1.4 : ch;
      const c = sh ? 0 : (k > 4 ? 9 - k : 8 - k), on = sh ? lit > 0 : c <= lit;
      ctx.fillStyle = sh ? C.orange : color;
      ctx.beginPath(); ctx.roundRect(x - gap * 0.19, baseY - h, gap * 0.38, h, 4); ctx.fill(); ctx.stroke();
      if (on) {
        const fl = 1 + 0.12 * Math.sin(t * 9 + k * 1.7), fh = gap * 0.62 * fl, fy = baseY - h - 4;
        ctx.fillStyle = '#ffb21a'; ctx.beginPath(); ctx.moveTo(x, fy - fh); ctx.quadraticCurveTo(x + gap * 0.3, fy - fh * 0.3, x, fy); ctx.quadraticCurveTo(x - gap * 0.3, fy - fh * 0.3, x, fy - fh); ctx.fill();
        ctx.fillStyle = '#fff4bb'; ctx.beginPath(); ctx.ellipse(x, fy - fh * 0.28, gap * 0.1, fh * 0.2, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
  // a photo of the kids: the two site characters in a frame
  function photo(ctx, x, y, w, h, t, p = 1) {
    G.rrect(ctx, x, y, w, h, 22, { fill: '#cfe6ff', lw: 4, seed: 77, stroke: C.ink });
    ctx.save(); ctx.beginPath(); ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 18); ctx.clip();
    ctx.fillStyle = '#ffe9a8'; ctx.fillRect(x, y + h * 0.72, w, h);
    ctx.globalAlpha *= clamp(p);
    img(ctx, IMG.girl, x + w * 0.32, y + h + 10, h * 0.9);
    img(ctx, IMG.boy, x + w * 0.7, y + h + 10, h * 0.88, { flip: true });
    ctx.restore();
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 290, (c) => pill(c, 0, 0, '🕎 חנוכה מתקרבת', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 500, (c) => he(c, 'כמה ברכות', 0, 0, { size: 160, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 655, (c) => he(c, 'מברכים בערב', 0, 0, { size: 140, w: 900, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, ev.q2, W / 2, 810, (c) => he(c, 'השני של חנוכה?', 0, 0, { size: 140, w: 900, color: C.red, maxW: SAFE.w }), { rot: -0.025 });
    S.hookOpts.forEach((o) => {
      const x = 790 - o.i * 250;
      popAt(ctx, t, o.t, x, 1040, (c) => {
        card(c, -105, -110, 210, 220, { seed: 20 + o.i, shadow: 10, r: 34 });
        he(c, o.s, 0, 52, { size: 160, w: 900, dir: 'ltr' });
      }, { rot: [-0.02, 0.02, -0.015][o.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(760, 1330); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'ענו בראש… 🤔', { size: 56, w: 900, bg: C.yellow, padX: 34 });
      ctx.restore();
    }
    mascot(ctx, 295, 1490 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 500, t, ev.q2);
  }

  // ================= 1. THE CARD =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    popAt(ctx, t, T(2, 0.1), W / 2, 830, (c) => {
      card(c, -330, -360, 660, 720, { seed: 31, shadow: 14, r: 30 });
      he(c, 'סדר הדלקת נרות חנוכה', 0, -280, { size: 50, w: 900, color: '#1e3a8a', maxW: 600 });
      hanukkiah(c, 0, -110, 420, 8, t, '#3b5bdb');
    }, { dur: 0.35, over: 1.5, rot: 0.01 });
    S.AUD.forEach((a) => popAt(ctx, t, a.t, W / 2, 925 + a.i * 105, (c) => {
      G.rrect(c, -265, -42, 530, 84, 42, { fill: [C.lilac, C.yellow, C.blush][a.i], lw: 3.5, seed: 40 + a.i, stroke: C.ink });
      he(c, `${a.emoji} ${a.label}`, 0, 16, { size: 44, w: 800, maxW: 480 });
    }, { dur: 0.25, over: 1.7 }));
    popAt(ctx, t, T(3, 0.2), W / 2, 1295, (c) => pill(c, 0, 0, 'בניקוד מלא, גם לאורחים', { size: 50, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(3, 3), W / 2, 1430, (c) => pill(c, 0, 0, 'אפשר גם רק ברכות, באותיות גדולות', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. THE WORDING =================
  const BL = ['בָּרוּךְ אַתָּה ה׳ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם,', 'אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ', ['לְהַדְלִיק נֵר חֲנֻכָּה.', 'לְהַדְלִיק נֵר שֶׁל חֲנֻכָּה.']];
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const picked = t >= ev.topic ? 1 : 0;
    ctx.save(); ctx.fillStyle = C.muted; he(ctx, 'נוסח הברכה הראשונה', RIGHT, 520, { size: 40, w: 900, align: 'right', color: C.ink, alpha: UI.fadeIn(t, T(4, 0.1), 0.2) }); ctx.restore();
    S.TOPICS.forEach((o) => {
      const x = 740 - o.i * 400, on = picked === o.i;
      popAt(ctx, t, o.t, x, 700, (c) => {
        card(c, -185, -120, 370, 240, { fill: on ? C.blue : '#fff', seed: 50 + o.i, shadow: 10, r: 32 });
        he(c, o.label, 0, 5, { size: 56, w: 900, color: on ? '#fff' : C.ink, maxW: 330 });
        he(c, o.hint, 0, 70, { size: 38, w: 600, color: on ? '#dbe7ff' : C.muted, maxW: 330 });
      }, { rot: [0.01, -0.012][o.i], dur: 0.3, over: 1.7 });
    });
    UI.tap(ctx, 340 + 20, 740, t, ev.topic, { color: 'rgba(34,107,215,0.8)', size: 130 });
    popAt(ctx, t, T(4, 2.2), W / 2, 1050, (c) => {
      card(c, -SAFE.w / 2, -190, SAFE.w, 380, { fill: C.yellow, r: 30, seed: 150, shadow: 10 });
      he(c, BL[0], 0, -95, { size: 50, w: 600, maxW: SAFE.w - 70 });
      he(c, BL[1], 0, -20, { size: 50, w: 600, maxW: SAFE.w - 70 });
      he(c, BL[2][picked], 0, 70, { size: 54, w: 900, color: C.red, maxW: SAFE.w - 70 });
    }, { rot: -0.008, dur: 0.35, over: 1.5 });
    popAt(ctx, t, T(5, 1.8), W / 2, 1350, (c) => pill(c, 0, 0, 'הברכה מתעדכנת מיד', { size: 52, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(5, 2.6), W / 2, 1480, (c) => pill(c, 0, 0, 'קל גם לילדים שרק התחילו לקרוא', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. PHOTO + NAME =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES;
    popAt(ctx, t, M0[0].t, W / 2, 870, (c) => card(c, -330, -380, 660, 760, { seed: 32, shadow: 14, r: 30 }), { dur: 0.35, over: 1.4, rot: -0.008 });
    if (t >= M0[0].t + 0.1) {
      const ph = UI.pop(t, ev.mode, 0.35, 1.8);
      G.rrect(ctx, 250, 530, 580, 340, 22, { fill: '#f4f7ff', lw: 3.5, seed: 78, stroke: C.line });
      he(ctx, '📷 תמונה של הילדים', W / 2, 730, { size: 40, w: 800, color: C.muted, alpha: 1 - clamp(ph * 3) });
      if (ph > 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(0.8 + 0.2 * ph, 0.8 + 0.2 * ph); ctx.translate(-540, -700); photo(ctx, 250, 530, 580, 340, t, 1); ctx.restore(); }
      UI.tap(ctx, 540, 740, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 130 });
    }
    popAt(ctx, t, M0[1].t, W / 2, 985, (c) => {
      he(c, 'שם המשפחה, הגן או הכיתה', 290, -45, { size: 34, w: 900, align: 'right' });
      G.rrect(c, -290, -20, 580, 90, 20, { fill: '#fff', lw: 4, seed: 79, stroke: C.ink });
    }, { dur: 0.25, over: 1.6 });
    const n = Math.floor(clamp((t - M0[2].t) / 1.2) * S.Q.caption.length);
    if (t >= M0[1].t) he(ctx, S.Q.caption.slice(0, n), 810 - 40, 1010 + 33, { size: 48, w: 800, align: 'right', color: C.ink });
    popAt(ctx, t, T(7, 0.2), W / 2, 1340, (c) => pill(c, 0, 0, '🔒 התמונה לא נשלחת לאתר', { size: 50, w: 900, bg: '#dff3e5', seed: 190, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(7, 3), W / 2, 1470, (c) => pill(c, 0, 0, 'אפשר גם בלי: הכול לא חובה', { size: 46, w: 900, bg: C.lilac, seed: 191, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. TWO CARDS PER SHEET =================
  function smallCard(ctx, t, y) {
    card(ctx, 190, y, 700, 240, { seed: 33, shadow: 10, r: 24 });
    photo(ctx, 215, y + 30, 210, 180, t);
    he(ctx, 'סדר הדלקת נרות חנוכה', 860, y + 80, { size: 40, w: 900, align: 'right', color: '#1e3a8a', maxW: 400 });
    for (let k = 0; k < 3; k++) { ctx.fillStyle = '#c9cfdf'; ctx.beginPath(); ctx.roundRect(860 - 380 + (k === 2 ? 120 : 0), y + 112 + k * 22, 380 - (k === 2 ? 120 : 0), 10, 5); ctx.fill(); }
    he(ctx, 'משפחת לוי', 860, y + 215, { size: 30, w: 800, align: 'right', color: C.muted });
  }
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const two = t >= ev.go;
    chip(ctx, 700, 520, 360, 80, 'דף A4 מלא', { on: !two, color: C.blue, size: 36, seed: 71 });
    chip(ctx, 330, 520, 360, 80, 'שני כרטיסים בדף', { on: two, color: C.blue, size: 36, seed: 72 });
    UI.tap(ctx, 330, 540, t, ev.go, { color: 'rgba(224,138,0,0.8)', size: 130 });
    popAt(ctx, t, ev.go + 0.1, W / 2, 740, (c) => { c.translate(-W / 2, -740); smallCard(c, t, 620); }, { dur: 0.3, over: 1.4, rot: -0.006 });
    const lp = clamp((t - ev.go - 0.5) / 0.6);
    if (lp > 0) {
      ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 4; ctx.setLineDash([16, 12]);
      ctx.beginPath(); ctx.moveTo(900, 905); ctx.lineTo(900 - 720 * ease.outCubic(lp), 905); ctx.stroke(); ctx.restore();
      he(ctx, '✂️', 900 - 720 * ease.outCubic(lp), 925, { size: 54, dir: 'ltr' });
    }
    popAt(ctx, t, ev.ans, W / 2, 1100, (c) => { c.translate(-W / 2, -1100); smallCard(c, t, 950); }, { dur: 0.3, over: 1.4, rot: 0.006 });
    popAt(ctx, t, T(9, 0.7), W / 2, 1380, (c) => pill(c, 0, 0, 'מתנה קטנה לחג מהגננת, מהמורה ומהוועד', { size: 40, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(9, 2), W / 2, 1500, (c) => pill(c, 0, 0, 'מדפיסים וגוזרים לאורך הקו המקווקו', { size: 42, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 5. EIGHT NIGHTS =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    S.NIGHTS.forEach(([date, day], n) => {
      const col = n % 2, row = Math.floor(n / 2), it = S.sheetItems[row];
      const cx = 740 - col * 400 + (col ? -10 : 0), cy = 580 + row * 190;
      popAt(ctx, t, it.t + col * 0.12, cx, cy, (c) => {
        card(c, -190, -80, 380, 160, { seed: 90 + n, shadow: 8, r: 24 });
        he(c, `ערב ${n + 1}`, 160, -22, { size: 44, w: 900, align: 'right', maxW: 170 });
        he(c, date, 160, 28, { size: 40, w: 800, align: 'right', color: C.red, dir: 'ltr' });
        he(c, day, 160, 66, { size: 28, w: 600, align: 'right', color: C.muted, maxW: 150 });
        hanukkiah(c, -80, 40, 170, n + 1, t, C.blue);
        c.fillStyle = '#fff'; c.strokeStyle = C.ink; c.lineWidth = 3.5; c.beginPath(); c.roundRect(-176, -66, 36, 36, 7); c.fill(); c.stroke();
        if (n < 2) { const p = (t - ev.printBtn - n * 0.25); if (p > 0) checkMark(c, -158, -48, 17, p / 0.35); }
      }, { dur: 0.28, over: 1.6, rot: [0.008, -0.01][col] });
    });
    popAt(ctx, t, T(10, 3), W / 2, 1370, (c) => pill(c, 0, 0, 'הערב הראשון והשמיני חלים בשישי', { size: 44, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1490, (c) => pill(c, 0, 0, 'עם תאריך ומספר הנרות לכל ערב', { size: 44, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1610, (c) => pill(c, 0, 0, '🖨️ הדפסה או PDF, בחינם', { size: 48, w: 900, bg: C.red, fg: '#fff', seed: 68, maxW: SAFE.w }), { rot: -0.025 });
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
    he(ctx, 'סדר הדלקת נרות חנוכה להדפסה', W / 2, 1000, { size: 54, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בדף חנוכה באתר: סדר הדלקת נרות', W / 2, 1350, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1465, (c) => pill(c, 0, 0, '✍️ כתבו את התשובה בתגובות', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 48, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
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
