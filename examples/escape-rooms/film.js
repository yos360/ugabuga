// THE FILM (9:16) — "העוגה נעלמה!": the site escape rooms (/tools/escape-rooms) in the site own look (paper + dot grid,
// ink-outlined cards with an offset shadow, Heebo), real characters only (no caveman). Pure function of t.
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

  // ---------- escape-room props ----------
  function chipRow(ctx, labels, y, sel, seedBase, { size = 34, color = C.blue } = {}) {
    let x = RIGHT;
    const xs = [];
    labels.forEach((s, k) => {
      const ww = measure(ctx, s, size, 800) + 48, on = sel === k;
      G.rrect(ctx, x - ww, y - 36, ww, 72, 36, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed: seedBase + k, stroke: on ? C.ink : C.line });
      he(ctx, s, x - ww / 2, y + 12, { size, w: 800, color: on ? '#fff' : C.ink });
      xs.push(x - ww / 2); x -= ww + 14;
    });
    return xs;
  }
  function badge(ctx, cx, cy, s, bg = C.lilac, size = 28) {
    const ww = measure(ctx, s, size, 800) + 36, hh = size * 1.7;
    G.rrect(ctx, cx - ww / 2, cy - hh / 2, ww, hh, hh / 2, { fill: bg, lw: 2.5, seed: 7 + s.length, stroke: C.ink });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800 });
    return ww;
  }
  // badges laid out right → left from x
  function badgeRow(ctx, x, cy, list, size = 28) {
    for (const [s, bg] of list) { const ww = measure(ctx, s, size, 800) + 36; badge(ctx, x - ww / 2, cy, s, bg, size); x -= ww + 12; }
  }
  // a padlock; open = 0..1 (the shackle lifts and swings)
  function padlock(ctx, x, y, s, open = 0, color = '#f2b705') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.translate(26, -40 - 26 * open); ctx.rotate(-0.5 * open); ctx.translate(-26, 0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 26; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(-26, 30); ctx.lineTo(-26, -10); ctx.arc(0, -10, 26, Math.PI, 0); ctx.lineTo(26, 30); ctx.stroke();
    ctx.strokeStyle = '#b8bfd2'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(-26, 30); ctx.lineTo(-26, -10); ctx.arc(0, -10, 26, Math.PI, 0); ctx.lineTo(26, 30); ctx.stroke();
    ctx.restore();
    G.rrect(ctx, -58, -40, 116, 96, 18, { fill: color, lw: 5, seed: 401, stroke: C.ink });
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-5, 0, 10, 26);
    ctx.restore();
  }
  function balloon(ctx, x, y, s, col, t) {
    const fill = { red: '#e8476a', blue: '#3d82e6', green: '#2fa35f' }[col];
    ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + x) * 4); ctx.scale(s, s);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 50); ctx.quadraticCurveTo(10, 80, -4, 110); ctx.stroke();
    ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(0, 0, 40, 50, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(-8, 56); ctx.lineTo(8, 56); ctx.lineTo(0, 46); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-14, -18, 9, 15, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // a mini A4 page of the print kit
  function kitPage(ctx, title, i, w = 190, h = 268) {
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 7, w, h, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    if (i === 0) { // the facilitator sheet: story + the answers table
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, 56, [10, 10, 0, 0]); ctx.fill();
      he(ctx, 'קיט למנחה', 0, -h / 2 + 38, { size: 24, w: 900, color: '#fff' });
      for (let r = 0; r < 3; r++) { ctx.fillStyle = '#c9cfdf'; ctx.fillRect(-w / 2 + 16, -h / 2 + 74 + r * 14, (r === 2 ? 0.6 : 1) * (w - 32), 6); }
      he(ctx, 'תשובות ורמזים', w / 2 - 14, -h / 2 + 140, { size: 17, w: 900, align: 'right' });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      for (let r = 0; r < 6; r++) { const y = -h / 2 + 156 + r * 17; ctx.beginPath(); ctx.moveTo(-w / 2 + 14, y); ctx.lineTo(w / 2 - 14, y); ctx.stroke(); ctx.fillStyle = C.red; ctx.fillRect(-w / 2 + 40, y + 4, 22, 8); }
      return;
    }
    he(ctx, `🎂 שלב ${i} מתוך 6`, 0, -h / 2 + 28, { size: 15, w: 700, color: C.muted });
    he(ctx, title, 0, -h / 2 + 66, { size: 22, w: 900, maxW: w - 20 });
    for (let r = 0; r < 3; r++) { ctx.fillStyle = '#d6dbe8'; ctx.fillRect(-w / 2 + 18, -h / 2 + 88 + r * 15, (r === 2 ? 0.55 : 1) * (w - 36), 6); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(-w / 2 + 14, h / 2 - 82, w - 28, 66, 10); ctx.stroke();
    he(ctx, '✍️ התשובה שלנו:', w / 2 - 22, h / 2 - 58, { size: 14, w: 800, align: 'right' });
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    he(ctx, 'המסיבה מוכנה, הבלונים תלויים…', W / 2, 300, { size: 44, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2) });
    popAt(ctx, t, ev.q1, W / 2, 470, (c) => he(c, 'אבל העוגה', 0, 0, { size: 140, w: 900 }), { rot: -0.03 });
    popAt(ctx, t, ev.q2, W / 2, 625, (c) => he(c, 'נעלמה! 😱', 0, 0, { size: 150, w: 900, color: C.red }), { rot: 0.025 });
    popAt(ctx, t, ev.title, W / 2, 790, (c) => pill(c, 0, 0, 'חדרי בריחה BUGA 🔐', { size: 72, w: 900, bg: C.blue, fg: '#fff', padX: 48, seed: 12 }), { rot: -0.03, dur: 0.35 });
    S.hookPills.forEach((p) => {
      const x = [790, 560, 300][p.i];
      popAt(ctx, t, p.t, x, 915, (c) => pill(c, 0, 0, `${p.e} ${p.s}`, { size: 40, w: 800, bg: '#fff', seed: 20 + p.i, shadow: 6, padX: 28 }), { rot: [-0.03, 0.02, -0.02][p.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1040); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, '42 חדרים בחינם!', { size: 60, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    // the empty cake plate with a big question mark
    const pp = ease.outBack(clamp((t - ev.q2) / 0.4), 1.6);
    if (pp > 0) {
      ctx.save(); ctx.translate(760, 1380); ctx.scale(pp, pp);
      ctx.fillStyle = 'rgba(20,22,45,0.12)'; ctx.beginPath(); ctx.ellipse(6, 30, 190, 30, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 10, 180, 46, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 6, 120, 26, 0, 0, Math.PI * 2); ctx.strokeStyle = '#c9cfdf'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = '#d9a76a'; for (const [cx, cy] of [[-40, 4], [22, 12], [60, -2], [-8, -6]]) { ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill(); }
      he(ctx, '?', 10 + Math.sin(t * 4) * 4, -50, { size: 170, w: 900, color: C.red, dir: 'ltr' });
      ctx.restore();
    }
    // the detective boy pops up bottom-left
    const bp = ease.outBack(clamp((t - ev.q2) / 0.45), 1.5);
    if (bp > 0) img(ctx, IMG.boy, 230, 1540 + (1 - bp) * 520 - (t > ev.q2 + 0.45 ? hop(t, 16) : 0), 440, { rot: -0.04 });
  }

  // ================= 1. ROOMS =================
  function shotRooms(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const sel = t >= S.settingTap.t ? 0 : -1;
    const xs = chipRow(ctx, S.SETTINGS, 530, sel, 30, { size: 32 });
    UI.tap(ctx, xs[0], 530, t, S.settingTap.t, { color: 'rgba(34,107,215,0.8)', size: 110 });
    const picked = t >= ev.pick;
    S.ROOMS.forEach((r) => {
      const y = 715 + r.i * 200;
      const on = picked && r.i === 0;
      const press = r.i === 0 ? 1 - 0.05 * pulse(t, ev.pick, 10) : 1;
      popAt(ctx, t, r.t, W / 2, y, (c) => {
        c.scale(press, press);
        card(c, -SAFE.w / 2, -88, SAFE.w, 176, { fill: on ? C.yellow : C.card, r: 24, seed: 50 + r.i, shadow: 8, lw: on ? 5 : 3.5 });
        he(c, r.e, SAFE.w / 2 - 66, 28, { size: 76, w: 400 });
        he(c, r.title, SAFE.w / 2 - 136, -14, { size: 46, w: 900, align: 'right', maxW: SAFE.w - 170 });
        badgeRow(c, SAFE.w / 2 - 136, 46, [[r.aud, C.lilac], [r.dur, '#e3eeff']], 26);
      }, { dur: 0.3, over: 1.8, rot: [0.012, -0.01, 0.01, -0.012][r.i] });
    });
    UI.tap(ctx, W / 2 + 120, 715, t, ev.pick, { color: 'rgba(20,22,45,0.7)', size: 130 });
    popAt(ctx, t, ev.pick, 250, 715 - 70, (c) => pill(c, 0, 0, 'נכנסים! 🔑', { size: 36, w: 900, bg: C.red, fg: '#fff', seed: 66, shadow: 5, padX: 24 }), { rot: -0.06 });
  }

  // ================= 2. LEVELS =================
  function shotLevels(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    let sel = 0; S.levelTaps.forEach((p) => { if (t >= p.t) sel = p.k; });
    S.LEVELS.forEach((l) => {
      const y = 580 + l.i * 165;
      const on = sel === l.i;
      popAt(ctx, t, l.t, W / 2, y, (c) => {
        G.rrect(c, -SAFE.w / 2, -70, SAFE.w, 140, 26, { fill: on ? '#f3e8ff' : '#fff', lw: on ? 5 : 3, seed: 70 + l.i, stroke: on ? C.purple : C.line });
        he(c, l.label, SAFE.w / 2 - 34, -8, { size: 50, w: 900, align: 'right' });
        he(c, l.detail, SAFE.w / 2 - 34, 44, { size: 31, w: 500, color: C.muted, align: 'right', maxW: SAFE.w - 70 });
      }, { dur: 0.3, over: 1.8 });
    });
    S.levelTaps.forEach((p) => UI.tap(ctx, W / 2 + 200, 580 + p.k * 165, t, p.t, { color: 'rgba(138,79,216,0.8)', size: 120 }));
    // the lock row: one lock per step of the chosen level
    if (t >= T(4, 3)) {
      const last = S.levelTaps.filter((p) => t >= p.t).slice(-1)[0] || { k: 0, t: T(4, 3) };
      const n = S.LEVELS[last.k].count;
      for (let k = 0; k < n; k++) {
        const row = Math.floor(k / 5), col = k % 5;
        const x = RIGHT - 90 - col * 175, y = 1150 + row * 150;
        popAt(ctx, t, last.t + (k >= (last.k ? S.LEVELS[last.k - 1].count : 0) ? 0.03 * k : 0), x, y, (c) => padlock(c, 0, 0, 0.85, 0, ['#f2b705', '#c8a2ff', '#ff8aa5'][last.k]), { dur: 0.25, over: 2 });
      }
      he(ctx, `${n} מנעולים בדרך החוצה`, W / 2, 1480, { size: 42, w: 900, alpha: UI.fadeIn(t, last.t, 0.15) });
    }
  }

  // ================= 3. SOLVE =================
  function roomHeader(ctx, t, solved, y = 480) {
    card(ctx, SAFE.x, y, SAFE.w, 220, { fill: C.yellow, r: 28, seed: 90, shadow: 10 });
    he(ctx, `${S.ROOM.e} ${S.ROOM.title}`, RIGHT - 34, y + 70, { size: 48, w: 900, align: 'right', maxW: SAFE.w - 60 });
    badgeRow(ctx, RIGHT - 34, y + 120, [[S.ROOM.aud, C.lilac], [S.ROOM.diff, '#fff'], [S.ROOM.dur, '#e3eeff']], 26);
    const bw = SAFE.w - 68, bx = SAFE.x + 34, by = y + 152;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(bx, by, bw, 18, 9); ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    const p = solved / S.ROOM.total;
    ctx.fillStyle = '#4caf50'; ctx.beginPath(); ctx.roundRect(bx + bw * (1 - p), by, bw * p, 18, 9); ctx.fill();
    he(ctx, `נפתרו ${Math.ceil(solved)} מתוך ${S.ROOM.total} שלבים`, RIGHT - 34, y + 205, { size: 26, w: 600, color: C.muted, align: 'right' });
  }
  function shotSolve(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const ok = t >= ev.check;
    const solved = ok ? lerp(1, 2, ease.outCubic(clamp((t - ev.check) / 0.4))) : 1;
    roomHeader(ctx, t, solved);
    const Y = 740;
    card(ctx, SAFE.x, Y, SAFE.w, 740, { r: 30, seed: 95, shadow: 12 });
    he(ctx, 'שלב 2: קוד הבלונים', RIGHT - 34, Y + 74, { size: 50, w: 900, align: 'right' });
    badge(ctx, SAFE.x + 80, Y + 58, '2/6', C.yellow, 30);
    wrap(ctx, S.BALLOON_STORY, 32, SAFE.w - 70, 500, 3).forEach((ln, k) => he(ctx, ln, RIGHT - 34, Y + 140 + k * 44, { size: 32, w: 500, align: 'right' }));
    S.balloons.forEach((b) => {
      const x = RIGHT - 90 - b.i * 112;
      popAt(ctx, t, b.t, x, Y + 320, (c) => balloon(c, 0, 0, 0.9, b.c, t), { dur: 0.25, over: 2 });
    });
    he(ctx, 'מה הקוד?', RIGHT - 34, Y + 490, { size: 40, w: 900, align: 'right' });
    // input + button (the site: input on the right, "בדקו תשובה" on the left)
    G.rrect(ctx, SAFE.x + 330, Y + 520, SAFE.w - 364, 92, 16, { fill: ok ? '#e3f6ea' : '#fff', lw: 4, seed: 97, stroke: C.ink });
    if (t >= ev.type) he(ctx, '4', RIGHT - 70, Y + 585, { size: 54, w: 900, dir: 'ltr' });
    else he(ctx, 'כתבו תשובה...', RIGHT - 60, Y + 580, { size: 34, w: 500, color: '#9aa0b5', align: 'right' });
    if (t < ev.type && Math.floor(t * 3) % 2 === 0) { ctx.fillStyle = C.ink; ctx.fillRect(RIGHT - 52, Y + 540, 4, 52); }
    const press = t >= ev.check ? 1 - 0.08 * pulse(t, ev.check, 10) : 1;
    ctx.save(); ctx.translate(SAFE.x + 160, Y + 566); ctx.scale(press, press);
    pill(ctx, 0, 0, 'בדקו תשובה', { size: 36, w: 900, bg: ok ? '#9ccfae' : C.red, fg: '#fff', padX: 30, seed: 98, h: 84, shadow: 6 });
    ctx.restore();
    UI.tap(ctx, SAFE.x + 160, Y + 566, t, ev.check, { color: 'rgba(20,22,45,0.7)', size: 120 });
    he(ctx, 'נכון! המנעול נפתח.', RIGHT - 34, Y + 690, { size: 44, w: 900, color: C.green, align: 'right', alpha: UI.fadeIn(t, ev.check, 0.12) });
    const open = ease.outBack(clamp((t - ev.check) / 0.35), 2);
    popAt(ctx, t, T(6, 0.25), SAFE.x + 140, Y + 680, (c) => padlock(c, 0, 0, 0.7, open), { dur: 0.3 });
    confetti(ctx, t, ev.check, W / 2, Y + 600, { n: 60, seed: 4, spread: 900 });
  }

  // ================= 4. HINTS =================
  function shotHints(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const Y = 490;
    card(ctx, SAFE.x, Y, SAFE.w, 1000, { r: 30, seed: 120, shadow: 12 });
    he(ctx, 'שלב 3: מסלול חימום · ספירת הכוכבים', RIGHT - 34, Y + 70, { size: 44, w: 900, align: 'right', maxW: SAFE.w - 190 });
    badge(ctx, SAFE.x + 80, Y + 56, '3/6', C.yellow, 30);
    wrap(ctx, S.STAR_STORY, 32, SAFE.w - 70, 500, 2).forEach((ln, k) => he(ctx, ln, RIGHT - 34, Y + 136 + k * 44, { size: 32, w: 500, align: 'right' }));
    // the visual box with the four stars, counted on the beat
    G.rrect(ctx, SAFE.x + 34, Y + 200, SAFE.w - 68, 170, 26, { fill: '#f6efff', lw: 0, seed: 121, stroke: '#f6efff' });
    for (let k = 0; k < 4; k++) {
      const x = W / 2 - 240 + k * 160; // the site shows the visual LTR
      const cnt = S.counts[k], on = t >= cnt.t;
      const sc = 1 + 0.25 * pulse(t, cnt.t, 9);
      ctx.save(); ctx.translate(x, Y + 312); ctx.scale(sc, sc); he(ctx, '⭐', 0, 0, { size: 96, w: 400 }); ctx.restore();
      if (on) popAt(ctx, t, cnt.t, x + 50, Y + 230, (c) => { c.fillStyle = C.orange; c.beginPath(); c.arc(0, 0, 26, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 3; c.stroke(); he(c, String(k + 1), 0, 12, { size: 34, w: 900, color: '#fff', dir: 'ltr' }); }, { dur: 0.2 });
    }
    he(ctx, 'כמה כוכבים על הדלת?', RIGHT - 34, Y + 440, { size: 40, w: 900, align: 'right' });
    const nHints = S.hintTaps.filter((h) => t >= h.t).length;
    if (nHints < 2 && t < ev.solved) {
      const label = nHints === 0 ? 'צריכים רמז? 💡' : 'עוד רמז 💡';
      const y = Y + 510 + nHints * 120;
      he(ctx, label, RIGHT - 34, y, { size: 38, w: 900, color: C.blue, align: 'right' });
    }
    S.hintTaps.forEach((h, i) => {
      const y = Y + 520 + i * 120;
      popAt(ctx, t, h.t, W / 2, y, (c) => {
        card(c, -SAFE.w / 2 + 34, -48, SAFE.w - 68, 96, { fill: C.yellow, r: 20, seed: 130 + i, shadow: 6, lw: 3.5 });
        he(c, `💡 רמז ${i + 1}: ${S.HINTS[i]}`, SAFE.w / 2 - 60, 12, { size: 30, w: 700, align: 'right', maxW: SAFE.w - 130 });
      }, { dur: 0.3, over: 1.8 });
    });
    S.hintTaps.forEach((h, i) => UI.tap(ctx, RIGHT - 160, Y + 498 + i * 120, t, h.t, { color: 'rgba(34,107,215,0.8)', size: 110 }));
    // solved
    G.rrect(ctx, SAFE.x + 330, Y + 790, SAFE.w - 364, 92, 16, { fill: t >= ev.solved ? '#e3f6ea' : '#fff', lw: 4, seed: 140, stroke: C.ink });
    if (t >= S.counts[3].t) he(ctx, '4', RIGHT - 70, Y + 855, { size: 54, w: 900, dir: 'ltr' });
    pill(ctx, SAFE.x + 160, Y + 836, 'בדקו תשובה', { size: 36, w: 900, bg: t >= ev.solved ? '#9ccfae' : C.red, fg: '#fff', padX: 30, seed: 141, h: 84, shadow: 6 });
    UI.tap(ctx, SAFE.x + 160, Y + 836, t, ev.solved, { color: 'rgba(20,22,45,0.7)', size: 120 });
    he(ctx, 'נכון! המנעול נפתח.', RIGHT - 34, Y + 950, { size: 44, w: 900, color: C.green, align: 'right', alpha: UI.fadeIn(t, ev.solved, 0.12) });
    confetti(ctx, t, ev.solved, W / 2, Y + 850, { n: 60, seed: 6, spread: 900 });
  }

  // ================= 5. THE PRINT KIT =================
  function shotKit(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    S.pages.forEach((p) => {
      const row = p.i < 4 ? 0 : 1, col = row ? p.i - 4 : p.i;
      const x = row ? RIGHT - 216 - col * 213 : RIGHT - 110 - col * 213, y = 650 + row * 310;
      popAt(ctx, t, p.t, x, y, (c) => kitPage(c, p.title, p.i), { rot: [0.03, -0.03, 0.03, -0.04, -0.03, 0.04, -0.02][p.i] });
    });
    popAt(ctx, t, S.kitPill.t, W / 2, 1250, (c) => pill(c, 0, 0, '🖨️ 7 עמודים ברמה הקלה', { size: 46, w: 900, bg: '#e3f6ea', seed: 150 }), { rot: -0.02 });
    popAt(ctx, t, T(11, 3), W / 2 + 60, 1390, (c) => pill(c, 0, 0, 'הכול בחינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 151 }), { rot: -0.03 });
    const pp = ease.outBack(clamp((t - T(10, 0.5)) / 0.45), 1.5);
    if (pp > 0) img(ctx, IMG.printer, 140, 1640 + (1 - pp) * 500 - hop(t, 8), 230, { rot: 0.03 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, W / 2, 580, (c) => {
      const s = 320;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 80); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 905 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'חדרי בריחה לגן, לכיתה ולמסיבה', W / 2, 1000, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, '42 חדרים בחינם, עם רמזים ופתרונות', { size: 42, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1240, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בתפריט: לכיתה ← חדרי בריחה 🔐', W / 2, 1375, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25) });
    const gp = ease.outBack(clamp((t - L[2].t) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.bday, 170, 1700 + (1 - gp) * 500 - hop(t, 10), 300, { rot: -0.03 });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotRooms },
    { t0: T(4), fn: shotLevels },
    { t0: T(6), fn: shotSolve },
    { t0: T(8), fn: shotHints },
    { t0: T(10), fn: shotKit },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.printer = await L('img/home-printer.png');
      IMG.bday = await L('img/birthday-girl.png');
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
        const f = S.steps[i - 1] || { color: C.blue };
        ctx.fillStyle = f.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
