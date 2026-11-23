// THE FILM (9:16) — "איזו אות זו בכתב יד?": Hebrew cursive letters (/letters/cursive) in the site own look. Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, BAR, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', lilacShadow: '#dcd0f7', line: '#dde2ed', card: '#ffffff', box: '#d9a76a', boxDark: '#b9824a' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = { c: {} };
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


  // one line if it fits, else the most balanced two-line split
  function wrap2(ctx, str, size, w, weight = 800) {
    if (measure(ctx, str, size, weight) <= w) return [str];
    const ws = str.split(' '); let best = [str], bw = 1e9;
    for (let k = 1; k < ws.length; k++) { const a = ws.slice(0, k).join(' '), b = ws.slice(k).join(' '), m = Math.max(measure(ctx, a, size, weight), measure(ctx, b, size, weight)); if (m < bw) { bw = m; best = [a, b]; } }
    return best;
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



  // a white drawing tile (the real webp thumbnail of the site) with an optional caption
  function art(c, key, cx, cy, size, { seed = 1, on = false, r = 26, shadow = 9 } = {}) {
    card(c, cx - size / 2, cy - size / 2, size, size, { fill: '#fff', r, seed, shadow, lw: on ? 6 : 4.5, stroke: on ? C.red : C.ink });
    const im = IMG.c[key];
    if (im) { c.save(); c.beginPath(); c.roundRect(cx - size / 2 + 8, cy - size / 2 + 8, size - 16, size - 16, r - 6); c.clip(); c.drawImage(im, cx - size / 2 + 12, cy - size / 2 + 12, size - 24, size - 24); c.restore(); }
  }
  const key = (p) => p.split('/').pop().replace(/\.webp$/, '');
  // one numbered option of the hook / end card: drawing + number badge + name
  function hookTile(c, i, cx, cy, size) {
    const o = S.HOOK[i];
    art(c, key(o.img), cx, cy, size, { seed: 20 + i });
    c.fillStyle = C.red; c.beginPath(); c.arc(cx + size / 2 - 22, cy - size / 2 + 22, 36, 0, Math.PI * 2); c.fill();
    c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
    he(c, String(i + 1), cx + size / 2 - 22, cy - size / 2 + 36, { size: 46, w: 900, color: '#fff', dir: 'ltr' });
    wrap2(c, o.name, 34, size + 20, 800).forEach((ln, k) => he(c, ln, cx, cy + size / 2 + 48 + k * 40, { size: 34, w: 800, maxW: size - 10 }));
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 330, (c) => pill(c, 0, 0, '🎨 דפי צביעה להדפסה', { size: 40, w: 800, bg: C.purple, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 470, (c) => he(c, 'איזה דף צביעה', 0, 0, { size: 90, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + 0.1, W / 2, 590, (c) => he(c, 'הילד שלכם יבחר? 🤔', 0, 0, { size: 90, w: 900, maxW: SAFE.w }), { rot: 0.02 });
    S.hookOpts.forEach((o) => {
      const cy = 960 + (o.i === 1 ? 0 : 0);
      const cx = W / 2 + (1 - o.i) * 330 + 0; // RTL: 1 on the right
      popAt(ctx, t, o.t, cx, o.i === 1 ? 880 : 920, (c) => hookTile(c, o.i, 0, 0, 300), { rot: [0.02, -0.015, 0.02][o.i], dur: 0.28, over: 1.7 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1290); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, '⁦1, 2⁩ או ⁦3⁩? כתבו בתגובות 👇', { size: 52, w: 900, bg: C.yellow, padX: 34, maxW: 700 });
      ctx.restore();
    }
    mascot(ctx, 240, 1525 - (t > ev.q2 + 0.45 ? hop(t, 8) : 0), 300, t, ev.q2);
    popAt(ctx, t, ev.free + 0.2, 680, 1525, (c) => {
      he(c, 'עוגה בוגה', 0, -10, { size: 76, w: 900, color: C.ink });
      he(c, `⁦${S.TOTAL.toLocaleString('en-US')}⁩ דפי צביעה · חינם`, 0, 55, { size: 40, w: 800, color: C.ink, maxW: 520 });
    }, { rot: 0.01 });
  }

  // ================= 1. PICK A SUBJECT =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const tapped = t >= ev.pick;
    popAt(ctx, t, S.AUD[0].t, W / 2, 945, (c) => {
      S.SUBJ.forEach(([e, name, n], i) => {
        const col = i % 3, row = Math.floor(i / 3), cx = (1 - col) * 300, cy = (row - 1.5) * 235, on = tapped && i === S.SUBJ_PICK;
        const pr = on ? 1 + 0.05 * pulse(t, ev.pick, 10) : 1;
        c.save(); c.translate(cx, cy); c.scale(pr, pr);
        card(c, -140, -102, 280, 204, { fill: on ? C.yellow : '#fff', r: 26, seed: 40 + i, shadow: 8, lw: on ? 6 : 4, stroke: on ? C.red : C.ink });
        he(c, e, 0, -22, { size: 62, w: 700 });
        he(c, name, 0, 40, { size: 34, w: 900, maxW: 252 });
        he(c, `⁦${n}⁩ דפים`, 0, 84, { size: 28, w: 600, color: C.muted });
        c.restore();
      });
    }, { dur: 0.3, over: 1.2 });
    UI.tap(ctx, W / 2 - 300 + 40, 945 + 0.5 * 235 + 40, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 }); // card 9 = row 2, col 2
    popAt(ctx, t, S.pills[0], W / 2, 1555, (c) => pill(c, 0, 0, `⁦${S.NSUBJ}⁩ נושאים · ⁦${S.TOTAL.toLocaleString('en-US')}⁩ ציורים מקוריים`, { size: 42, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1660, (c) => pill(c, 0, 0, 'חד קרן, חתולים, דינוזאורים, חנוכייה ועוד', { size: 40, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. PICK A DRAWING =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    popAt(ctx, t, S.TOPICS[0].t, W / 2, 575, (c) => {
      pill(c, 0, 0, '🦕 ⁦12⁩ דפי צביעה · חינם', { size: 44, w: 900, bg: C.blush, seed: 50, padX: 40 });
    }, { dur: 0.25, over: 1.5, rot: -0.01 });
    S.DRAW.forEach((d, i) => {
      const col = i % 2, row = Math.floor(i / 2), cx = W / 2 + (col ? -250 : 250), cy = 830 + row * 490, on = t >= ev.topic && i === S.DRAW_PICK;
      popAt(ctx, t, S.TOPICS[0].t + 0.3 + i * 0.28, cx, cy, (c) => {
        const pr = on ? 1 + 0.04 * pulse(t, ev.topic, 10) : 1; c.scale(pr, pr);
        art(c, key(d.img), 0, -20, 340, { seed: 60 + i, on });
        he(c, d.name, 0, 190, { size: 32, w: 800, maxW: 340 });
        pill(c, 0, 240, '🖨️ הדפסה', { size: 28, w: 900, bg: C.red, fg: '#fff', padX: 22, seed: 70 + i, shadow: 5 });
      }, { dur: 0.25, over: 1.5, rot: [0.01, -0.01, -0.008, 0.008][i] });
    });
    UI.tap(ctx, W / 2 + 250, 830 + 235, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, S.pills[2], W / 2, 1645, (c) => pill(c, 0, 0, 'כל ציור עם שם משלו ועמוד משלו', { size: 40, w: 900, bg: C.yellow, seed: 61, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. PRINT ON A4 =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const tapped = t >= ev.mode;
    popAt(ctx, t, S.MODES[0].t, W / 2, 575, (c) => {
      const pr = tapped ? 1 + 0.05 * pulse(t, ev.mode, 10) : 1; c.scale(pr, pr);
      pill(c, 0, 0, '🖨️ הדפסת כל ⁦12⁩ הדפים', { size: 50, w: 900, bg: C.red, fg: '#fff', padX: 46, seed: 71, shadow: 9, maxW: SAFE.w });
    }, { dur: 0.25, over: 1.5, rot: -0.01 });
    UI.tap(ctx, W / 2 - 60, 600, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    // A4 sheets: fan out after the tap
    const p = ease.outCubic(clamp((t - ev.mode) / 0.5));
    const shown = Math.max(1, Math.round(1 + p * 2));
    [2, 1, 0].forEach((k) => {
      if (k >= shown && t < ev.mode) return;
      const vis = k === 0 ? S.MODES[1].t : ev.mode + k * 0.08;
      popAt(ctx, t, vis, W / 2 - k * 36 * p + 0, 1090 + k * 14 * p, (c) => {
        card(c, -250, -380, 500, 706, { fill: '#fff', r: 10, seed: 80 + k, shadow: 10, lw: 4 });
        const d = S.DRAW[k];
        c.save(); c.drawImage(IMG.c[key(d.img)], -222, -352, 444, 444); c.restore();
        he(c, 'דף A4 · ציור על דף שלם', 0, 200, { size: 28, w: 700, color: C.muted });
        for (let q = 0; q < 2; q++) { c.strokeStyle = C.line; c.lineWidth = 3; c.beginPath(); c.moveTo(-200, 250 + q * 40); c.lineTo(200, 250 + q * 40); c.stroke(); }
      }, { dur: 0.3, over: 1.3, rot: [-0.015, 0.02, -0.03][k] });
    });
    popAt(ctx, t, S.pills[4], W / 2, 1560, (c) => pill(c, 0, 0, 'אפשר גם להוריד כ-PDF · בלי הרשמה', { size: 40, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 4. HANUKKAH =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    S.HOLIDAY.forEach(([e, name, n, img], i) => {
      const col = i % 2, row = Math.floor(i / 2), cx = W / 2 + (col ? -250 : 250), cy = 730 + row * 480, it = S.ROWS[i];
      popAt(ctx, t, it.t, cx, cy, (c) => {
        art(c, key(img), 0, -20, 320, { seed: 90 + i });
        he(c, `${e} ${name}`, 0, 198, { size: 42, w: 900, maxW: 460 });
        he(c, `⁦${n}⁩ דפים`, 0, 245, { size: 32, w: 700, color: C.muted });
      }, { dur: 0.25, over: 1.5, rot: [0.01, -0.01, -0.008, 0.008][i] });
    });
    popAt(ctx, t, S.pills[5], W / 2, 1550, (c) => pill(c, 0, 0, '⁦265⁩ ציורים לחנוכה: נרות, סביבונים, סופגניות', { size: 36, w: 900, bg: C.yellow, seed: 88, padX: 44, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.pills[6], W / 2, 1650, (c) => pill(c, 0, 0, 'כל דפי הצביעה לחנוכה בעמוד אחד', { size: 40, w: 900, bg: C.lilac, seed: 89, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 5. AGE + TIP + ACTIVITY =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems, d = S.DRAW[S.DRAW_PICK], G2 = S.GUIDE;
    popAt(ctx, t, I[0].t, W / 2, 700, (c) => {
      card(c, -440, -160, 880, 320, { fill: '#fff', r: 30, seed: 100, shadow: 10, lw: 4.5 });
      c.save(); c.beginPath(); c.roundRect(-420, -140, 280, 280, 18); c.clip(); c.drawImage(IMG.c[key(d.img)], -420, -140, 280, 280); c.restore();
      he(c, d.name, 410, -60, { size: 48, w: 900, align: 'right', maxW: 520 });
      pill(c, 150, 20, `מומלץ לגילאי ${G2.ages}`, { size: 36, w: 900, bg: C.yellow, seed: 101, padX: 28, shadow: 5 });
      he(c, 'מופיע בעמוד של כל ציור', 410, 100, { size: 30, w: 600, color: C.muted, align: 'right', maxW: 520 });
    }, { dur: 0.3, over: 1.3, rot: -0.006 });
    const rows = [['🎨', 'טיפ לצביעה', G2.tip, C.blush], ['✏️', 'אחרי הצביעה', G2.activity, '#d6f6ff']];
    rows.forEach(([e, ttl, txt, fill], i) => {
      popAt(ctx, t, I[1 + i].t, W / 2, 1060 + i * 265, (c) => {
        const hh = i ? 180 : 250, top = -hh / 2;
        card(c, -440, top, 880, hh, { fill, r: 30, seed: 110 + i, shadow: 9, lw: 4.5 });
        he(c, `${e} ${ttl}`, 410, top + 73, { size: 40, w: 900, align: 'right', color: C.ink });
        wrap(c, txt, 42, 800, 600, 2).forEach((ln, k) => he(c, ln, 410, top + 139 + k * 62, { size: 42, w: 600, align: 'right', maxW: 820 }));
      }, { dur: 0.25, over: 1.4, rot: [0.008, -0.008][i] });
    });
    popAt(ctx, t, S.extras[0].t, W / 2, 1560, (c) => pill(c, 0, 0, 'ולכל ציור: שאלה לשיחה בזמן הצביעה 💬', { size: 38, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // the hook question again: the same three drawings, numbered
  function endOpts(ctx, t, t0) {
    [0, 1, 2].forEach((i) => {
      popAt(ctx, t, t0 + i * 0.1, W / 2 + (1 - i) * 330, 1130, (c) => hookTile(c, i, 0, 0, 290), { rot: [0.02, -0.015, 0.02][i], dur: 0.25, over: 1.5 });
    });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 310); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 310, 200, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 480 + (1 - wp) * 24, { size: 92, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'דפי צביעה להדפסה · חינם, בלי הרשמה', W / 2, 545, { size: 44, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[2].t, W / 2, 635, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 56, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'חפשו באתר: דפי צביעה 🔎', W / 2, 735, { size: 42, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 840, (c) => pill(c, 0, 0, '🎨 איזה דף צביעה הילד שלכם יבחר?', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 40, seed: 192, maxW: SAFE.w }), { rot: 0.02, dur: 0.35 });
    endOpts(ctx, t, L[4].t + 0.25);
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1500, (c) => pill(c, 0, 0, '⁦1, 2⁩ או ⁦3⁩? כתבו בתגובות 👇', { size: 50, w: 900, bg: C.yellow, padX: 40, seed: 193, maxW: SAFE.w }), { rot: -0.02, dur: 0.35 });
    confetti(ctx, t, ev.logo, W / 2, 310, { n: 20, seed: 9, spread: 1000 });
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
      for (const n of ['dinosaur-1','dinosaur-2','dinosaur-3','dinosaur-4','unicorn-1','soccer-1','hanukkiah-1','dreidel-1','sufganiyah-1','maccabees-1']) IMG.c[n] = await L(`img/c/${n}.webp`);
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
