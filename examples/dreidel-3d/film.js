// THE FILM (9:16) — "על הסביבון כתוב נ ג ה ...": 3D printing for Hanukkah in the site own look. Pure function of t.
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


  // a dreidel (side view). angle rotates the cube: the visible face and its width follow the angle.
  const FACES = ['נ', 'ג', 'ה', '?'];
  function dreidel(ctx, cx, cy, size, angle, { body = C.blue } = {}) {
    const ph = angle / (Math.PI / 2) + 0.5, k = Math.floor(ph), loc = (ph - k - 0.5) * (Math.PI / 2);
    const face = FACES[((k % 4) + 4) % 4], bw = size * Math.cos(loc) * 0.95 + size * 0.05, bh = size;
    ctx.save(); ctx.translate(cx, cy);
    ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = C.ink;
    // tip
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(-bw / 2, bh / 2); ctx.lineTo(bw / 2, bh / 2); ctx.lineTo(0, bh / 2 + size * 0.42); ctx.closePath(); ctx.fill(); ctx.stroke();
    // top cap + handle
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(-bw / 2, -bh / 2); ctx.lineTo(bw / 2, -bh / 2); ctx.lineTo(bw * 0.12, -bh / 2 - size * 0.2); ctx.lineTo(-bw * 0.12, -bh / 2 - size * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.roundRect(-size * 0.05, -bh / 2 - size * 0.55, size * 0.1, size * 0.36, 8); ctx.fill(); ctx.stroke();
    // body
    ctx.fillStyle = body; ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 14); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.scale(Math.max(0.05, Math.cos(loc)), 1);
    he(ctx, face, 0, size * 0.27, { size: size * 0.8, w: 900, color: face === '?' ? C.yellow : '#fff', dir: face === '?' ? 'ltr' : 'rtl' });
    ctx.restore();
    ctx.restore();
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 290, (c) => pill(c, 0, 0, '🕎 חידת חנוכה', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 520, (c) => he(c, 'על הסביבון כתוב:', 0, 0, { size: 130, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    S.hookOpts.forEach((o) => {
      const x = 790 - o.i * 215, q = o.s === '?';
      popAt(ctx, t, o.t, x, 800, (c) => {
        card(c, -95, -105, 190, 210, { seed: 20 + o.i, shadow: 10, r: 34, fill: q ? C.red : '#fff' });
        he(c, o.s, 0, 45, { size: 140, w: 900, color: q ? '#fff' : C.ink, dir: q ? 'ltr' : 'rtl', maxW: 170 });
      }, { rot: [-0.02, 0.02, -0.015, 0.02][o.i] });
    });
    popAt(ctx, t, ev.q2, W / 2, 1080, (c) => he(c, 'מה האות האחרונה?', 0, 0, { size: 130, w: 900, color: C.red, maxW: SAFE.w }), { rot: -0.025 });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(710, 1230); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'ענו בראש 👆', { size: 46, w: 900, bg: C.yellow, padX: 34 });
      ctx.restore();
    }
    mascot(ctx, 295, 1500 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 500, t, ev.q2);
  }

  // ================= 1. THE MODELS =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.AUD.forEach((a) => {
      const y = 600 + a.i * 140, on = t >= ev.pick && a.i === S.AUD_PICK;
      popAt(ctx, t, a.t, W / 2, y, (c) => {
        card(c, -SAFE.w / 2, -58, SAFE.w, 116, { fill: on ? C.yellow : '#fff', r: 30, seed: 30 + a.i, shadow: 7, lw: 3.5 });
        he(c, a.emoji, SAFE.w / 2 - 70, 19, { size: 64, w: 400 });
        he(c, a.label, SAFE.w / 2 - 135, 17, { size: 50, w: 800, align: 'right', maxW: SAFE.w - 200 });
        if (on) checkMark(c, -SAFE.w / 2 + 70, 0, 30, clamp((t - ev.pick) / 0.4));
      }, { dur: 0.25, over: 1.6, rot: [0.006, -0.006][a.i % 2] });
    });
    UI.tap(ctx, 640, 600 + 10, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, S.pills[0], W / 2, 1330, (c) => pill(c, 0, 0, 'להורים, למורים ולגננות', { size: 46, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1450, (c) => pill(c, 0, 0, 'קבצים חינמיים להורדה', { size: 46, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. VIEWER + DOWNLOAD =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const T0 = S.TOPICS;
    popAt(ctx, t, T0[0].t, W / 2, 800, (c) => {
      card(c, -SAFE.w / 2, -330, SAFE.w, 660, { fill: '#eef6ff', r: 34, seed: 41, shadow: 10 });
      he(c, '🔄 רואים את הדגם מסתובב', 0, -270, { size: 42, w: 900, color: C.muted, maxW: SAFE.w - 80 });
    }, { dur: 0.3, over: 1.5, rot: -0.008 });
    if (t >= T0[0].t + 0.1) { ctx.save(); ctx.globalAlpha = clamp((t - T0[0].t) / 0.3); dreidel(ctx, W / 2, 820, 250, (t - T0[0].t) * 1.4 + 0.3); ctx.restore(); }
    const btns = [['⬇️ סביבון נ ג ה ❓ — בארץ', 560, C.red], ['⬇️ סביבון נ ג ה ❓ — בחו״ל', 460, C.blue]];
    btns.forEach(([s, ww, col], k) => {
      const o = T0[1 + k], on = t >= ev.topic && k === 0;
      popAt(ctx, t, o.t, W / 2, 1230 + k * 120, (c) => { if (on) c.scale(1 - 0.06 * pulse(t, ev.topic, 10), 1 - 0.06 * pulse(t, ev.topic, 10)); chip(c, 0, 0, 760, 100, s, { on: true, color: col, size: 42, seed: 45 + k }); }, { dur: 0.22, over: 1.7 });
    });
    UI.tap(ctx, 560, 1245, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, S.pills[2], W / 2, 1490, (c) => pill(c, 0, 0, 'שני קבצים: אחד לארץ ואחד לחו״ל', { size: 44, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1610, (c) => pill(c, 0, 0, 'שני חלקים: גוף וידית', { size: 46, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. PRINT SETTINGS =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES;
    he(ctx, '⚙️ הגדרות בדף הדגם', RIGHT, 575, { size: 42, w: 900, align: 'right', alpha: UI.fadeIn(t, M0[0].t, 0.2) });
    S.SETTINGS.forEach((s, k) => {
      const x = 730 - (k % 2) * 400, y = 665 + Math.floor(k / 2) * 115, on = t >= ev.mode && k === S.MODE_PICK;
      popAt(ctx, t, M0[k].t, x, y, (c) => chip(c, 0, 0, 380, 96, s, { on, color: C.purple, size: 40, seed: 55 + k }), { dur: 0.22, over: 1.7 });
    });
    he(ctx, '🧰 תוכנת חיתוך (Slicer)', RIGHT, 975, { size: 42, w: 900, align: 'right', alpha: UI.fadeIn(t, M0[4].t, 0.2) });
    S.SLICERS.forEach((s, k) => {
      const x = [850, 610, 310][k], ww = [180, 260, 300][k];
      popAt(ctx, t, M0[4 + k].t, x, 1065, (c) => chip(c, 0, 0, ww, 96, s, { on: false, size: 32, seed: 60 + k }), { dur: 0.22, over: 1.7 });
    });
    UI.tap(ctx, 730 - (S.MODE_PICK % 2) * 400, 665 + 115 + 10, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    popAt(ctx, t, S.pills[4], W / 2, 1290, (c) => pill(c, 0, 0, 'הגוף מודפס הפוך, החוד למעלה', { size: 44, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1420, (c) => pill(c, 0, 0, 'הידית מודפסת עומדת, ליד הגוף', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. SIZE, TIME, SAFETY =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const press = t >= ev.go ? 1 - 0.08 * pulse(t, ev.go, 10) : 1;
    popAt(ctx, t, T(8, 0.05), W / 2, 560, (c) => { c.scale(press, press); pill(c, 0, 0, '🖨️ מתחילים להדפיס', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 80, seed: 83 }); }, { dur: 0.3, over: 1.6, rot: -0.01 });
    UI.tap(ctx, W / 2 + 40, 575, t, ev.go, { color: 'rgba(20,22,45,0.7)', size: 120 });
    // printer bed with a block that grows layer by layer
    popAt(ctx, t, T(8, 0.3), W / 2, 790, (c) => card(c, -SAFE.w / 2, -170, SAFE.w, 340, { fill: '#eef6ff', r: 30, seed: 71, shadow: 8, lw: 4 }), { dur: 0.25, over: 1.4 });
    if (t >= T(8, 0.3) + 0.1) {
      const prog = ease.outCubic(clamp((t - ev.go) / 1.8)), bh = 190 * prog, bwid = 190, by = 930;
      for (let L = 0; L < Math.floor(bh / 10); L++) { ctx.fillStyle = L % 2 ? C.blue : '#3b82e8'; ctx.fillRect(W / 2 - bwid / 2, by - (L + 1) * 10, bwid, 10); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.strokeRect(W / 2 - bwid / 2, by - Math.floor(bh / 10) * 10, bwid, Math.floor(bh / 10) * 10);
      ctx.fillStyle = C.ink; ctx.fillRect(W / 2 - 230, by, 460, 14);
      const ny = by - bh - 14;
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(W / 2 - 22, ny - 40); ctx.lineTo(W / 2 + 22, ny - 40); ctx.lineTo(W / 2, ny); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.fillRect(W / 2 - 40, ny - 70, 80, 30);
    }
    S.ROWS.forEach((r) => {
      const [emoji, title, amount] = S.FACTS[r.i], y = 1050 + r.i * 105;
      popAt(ctx, t, r.t, W / 2, y, (c) => {
        card(c, -SAFE.w / 2, -50, SAFE.w, 100, { fill: '#fff', r: 26, seed: 72 + r.i, shadow: 6, lw: 3.5 });
        he(c, emoji, SAFE.w / 2 - 60, 18, { size: 54, w: 400 });
        he(c, title, SAFE.w / 2 - 120, -6, { size: 36, w: 900, align: 'right', maxW: 700 });
        he(c, amount, SAFE.w / 2 - 120, 34, { size: 34, w: 600, align: 'right', color: C.muted, maxW: 700 });
      }, { dur: 0.22, over: 1.5, rot: [0.005, -0.005][r.i % 2] });
    });
    popAt(ctx, t, ev.ans, W / 2, 1435, (c) => pill(c, 0, 0, '⏱️ כשעה וחצי', { size: 64, w: 900, bg: C.green, fg: '#fff', padX: 56, seed: 84 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.ans, W / 2, 1400, { n: 60, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[6], W / 2, 1540, (c) => pill(c, 0, 0, 'בלי תמיכות — גם להדפסה ראשונה', { size: 40, w: 900, bg: C.lilac, seed: 85, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[7], W / 2, 1650, (c) => pill(c, 0, 0, 'חלקים קטנים: לא לפעוטות', { size: 40, w: 900, bg: C.yellow, seed: 86, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. ASSEMBLE AND SPIN =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const t0 = S.S.print[0];
    popAt(ctx, t, T(10, 0.05), W / 2, 790, (c) => card(c, -SAFE.w / 2, -290, SAFE.w, 580, { fill: '#eef6ff', r: 34, seed: 100, shadow: 12, lw: 4 }), { dur: 0.3, over: 1.4, rot: -0.006 });
    if (t >= t0 + 0.1) {
      const spin = 1.5 * (t - t0) + (t >= ev.printBtn ? 9 * (1 - Math.exp(-2.5 * (t - ev.printBtn))) : 0);
      const wob = t >= ev.printBtn ? Math.sin((t - ev.printBtn) * 9) * 0.05 * Math.exp(-(t - ev.printBtn)) : 0;
      ctx.save(); ctx.globalAlpha = clamp((t - t0) / 0.3); ctx.translate(W / 2, 790); ctx.rotate(wob); dreidel(ctx, 0, 0, 230, spin, { body: C.green }); ctx.restore();
    }
    UI.tap(ctx, W / 2 + 120, 790, t, ev.printBtn, { color: 'rgba(35,135,77,0.8)', size: 130 });
    const P = [
      [S.sheetItems[0].t, 1170, 'שני חלקים שמתחברים בלחיצה', C.lilac],
      [S.sheetItems[1].t, 1280, 'הסביבון סימטרי — מסתובב יפה על החוד', C.yellow],
      [S.pills[8], 1390, 'ידית רפויה? טיפת דבק מגע', C.lilac],
      [S.extras[0].t, 1500, '🕎 בחנוכייה: להבות מודפסות, לא נרות אמיתיים', C.yellow],
      [S.extras[1].t, 1610, 'דגם החנוכייה מיועד לקישוט ולמשחק', C.lilac],
    ];
    P.forEach(([tt, y, s, bgc], k) => popAt(ctx, t, tt, W / 2, y, (c) => pill(c, 0, 0, s, { size: 40, w: 900, bg: bgc, seed: 130 + k, maxW: SAFE.w }), { rot: k % 2 ? 0.02 : -0.02 }));
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
    he(ctx, 'הדפסת תלת־ממד לילדים: סביבון, חנוכייה ועוד', W / 2, 1000, { size: 46, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'קבצים חינמיים להורדה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'באתר: דפים להדפסה ← הדפסת תלת־ממד 🖨️', W / 2, 1350, { size: 40, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1465, (c) => pill(c, 0, 0, '✍️ איזו אות? כתבו בתגובות', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 48, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
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
