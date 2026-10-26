// THE FILM (9:16) — the UGABUGA birthday invitation maker. The invitations on screen are the site's
// real renders (its own invitationRenderer, run headless). Site look, real characters, no caveman. Every frame is a pure function of t, inside G.SAFE.
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


  // a real invitation render, with the site's ink outline and offset shadow
  function inv(ctx, key, cx, cy, w, { rot = 0, shadow = 12, alpha = 1, scale = 1 } = {}) {
    const im = IMG[key]; if (!im) return;
    const h = w * im.height / im.width;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(scale, scale);
    if (shadow) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + shadow * 0.8, -h / 2 + shadow, w, h, 22); ctx.fill(); }
    ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 22); ctx.clip(); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 22); ctx.stroke();
    ctx.restore();
  }
  const latest = (list, t) => { let cur = null; for (const x of list) if (t >= x.t) cur = x; return cur; };

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

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.hook1, W / 2, 440, (c) => he(c, 'יום הולדת', 0, 0, { size: 175, w: 900 }), { rot: -0.03 });
    popAt(ctx, t, ev.hook2, W / 2, 630, (c) => he(c, 'בקרוב?', 0, 0, { size: 200, w: 900, color: C.red }), { rot: 0.02 });
    // three real invitations fan in on 8ths
    S.fan.forEach((f) => {
      const p = UI.pop(t, f.t, 0.35, 1.8);
      if (p <= 0) return;
      const rot = [0.16, 0, -0.16][f.i] * clamp(p), x = 700 + [-150, 0, 150][f.i] * clamp(p);
      inv(ctx, 'inv-' + f.id, x, 1150 - (t > T(1, 2) ? hop(t + f.i * 0.07, 10) : 0), 270, { rot, scale: p, shadow: 9 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 805); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'הזמנה מעוצבת בדקה, בחינם!', { size: 54, w: 900, bg: C.yellow, padX: 40 });
      ctx.restore();
    }
    const gp = ease.outBack(clamp((t - ev.hook2) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.girl, 205, 1530 + (1 - gp) * 560 - (t > ev.hook2 + 0.45 ? hop(t, 14) : 0), 500, { rot: -0.03 });
  }

  // ================= 1. STYLES =================
  function shotStyles(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const tw = 200, th = 250, gap = 20, tapped = t >= ev.tapStyle;
    S.styles.forEach((s) => {
      const col = s.i % 4, row = Math.floor(s.i / 4);
      const cx = RIGHT - tw / 2 - col * (tw + gap) - 10, cy = 500 + th / 2 + row * (th + 22);
      const sel = tapped && s.i === 0;
      const press = sel ? 1 - 0.06 * pulse(t, ev.tapStyle, 10) : 1;
      const p = UI.pop(t, s.t, 0.28, 2);
      if (p <= 0) return;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(p * press, p * press);
      if (tapped && !sel) ctx.globalAlpha = 0.55;
      inv(ctx, 'inv-' + s.id, 0, 0, tw, { shadow: sel ? 9 : 6 });
      if (sel) { ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.beginPath(); ctx.roundRect(-tw / 2 - 8, -th / 2 - 8, tw + 16, th + 16, 28); ctx.stroke(); checkMark(ctx, tw / 2 - 18, -th / 2 + 18, 30, clamp((t - ev.tapStyle) / 0.3), C.red); }
      ctx.restore();
      if (s.i === 0) UI.tap(ctx, cx, cy, t, ev.tapStyle, { color: 'rgba(220,92,131,0.9)', size: 150 });
    });
    popAt(ctx, t, ev.styleLabel, W / 2, 1385, (c) => pill(c, 0, 0, '🎈 מסיבת בלונים', { size: 46, w: 900, bg: C.yellow, seed: 39 }), { rot: -0.03 });
  }

  // ================= 2. FILL =================
  const FIELDS = [['שם החוגג/ת', ['נ', 'נו', 'נוע', 'נועה']], ['גיל', ['6']], ['תאריך', ['שישי, 14.11']], ['שעה', ['17:00–19:00']], ['מקום וכתובת', ['גן השעשועים ברחוב הרצל']]];
  function shotFill(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const cur = latest(S.fills, t);
    const key = cur ? 'inv-' + cur.img : 'inv-type0';
    const bump = cur ? pulse(t, cur.t, 12) : 0;
    inv(ctx, key, W / 2, 790, 500, { scale: 1 + 0.025 * bump, shadow: 11 });
    // the form
    const Y = 1150;
    FIELDS.forEach(([label, vals], fi) => {
      const y = Y + fi * 68;
      const done = S.fills.filter((f) => f.field === fi && t >= f.t);
      const val = done.length ? vals[Math.min(done.length, vals.length) - 1] : '';
      const active = cur && cur.field === fi;
      G.rrect(ctx, SAFE.x + 20, y - 30, SAFE.w - 40, 60, 14, { fill: active ? C.blush : '#fff', lw: active ? 4 : 2.5, seed: 50 + fi, stroke: active ? '#dc5c83' : C.line });
      he(ctx, label, RIGHT - 45, y + 11, { size: 30, w: 700, color: C.muted, align: 'right' });
      if (val) he(ctx, val, RIGHT - 300, y + 12, { size: 34, w: 800, align: 'right', maxW: SAFE.w - 330, dir: /[\u0590-\u05FF]/.test(val) ? 'rtl' : 'ltr' });
      if (active && Math.floor(t * 4) % 2 === 0) { const x = RIGHT - 300 - (val ? Math.min(measure(ctx, val, 34, 800), SAFE.w - 330) : 0) - 8; ctx.fillStyle = C.ink; ctx.fillRect(x - 3, y - 18, 4, 38); }
    });
  }

  // ================= 3. CUSTOMISE =================
  const CHIPS = ['🎨 צבעים', '🔤 פונט', '🖼️ תמונה', '🌙 רקע'];
  function shotCustom(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const cur = latest(S.variants, t);
    const prevKey = (() => { const k = cur ? S.variants.indexOf(cur) : -1; return k <= 0 ? 'inv-type8' : 'inv-' + S.variants[k - 1].img; })();
    const key = cur ? 'inv-' + cur.img : 'inv-type8';
    const cx = W / 2, cy = 820, w = 540, h = w * 1350 / 1080;
    if (cur && t < cur.t + 0.3) {
      const u = ease.outCubic(clamp((t - cur.t) / 0.3));
      inv(ctx, prevKey, cx, cy, w);
      // the new look sweeps in as a circle from the tapped chip side
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Math.hypot(w, h) * 0.6 * u, 0, Math.PI * 2); ctx.clip(); inv(ctx, key, cx, cy, w, { shadow: 0 }); ctx.restore();
    } else inv(ctx, key, cx, cy, w, { scale: 1 + 0.02 * (cur ? pulse(t, cur.t + 0.3, 8) : 0) });
    // the control chips (right to left)
    CHIPS.forEach((c, i) => {
      const on = cur && cur.chip === i;
      const x = RIGHT - 105 - i * 223;
      ctx.save(); ctx.translate(x, 1300); const s = on ? 1 + 0.08 * pulse(t, cur.t, 10) : 1; ctx.scale(s, s);
      card(ctx, -100, -38, 200, 76, { fill: on ? '#9254c8' : '#fff', r: 38, seed: 70 + i, shadow: 5, lw: 3.5 });
      he(ctx, c, 0, 12, { size: 32, w: 800, color: on ? '#fff' : C.ink });
      ctx.restore();
      if (on) UI.tap(ctx, x, 1300, t, cur.t, { color: 'rgba(146,84,200,0.85)', size: 90 });
    });
    if (cur) popAt(ctx, t, cur.t + 0.05, W / 2, 1420, (c) => he(c, cur.label, 0, 0, { size: 38, w: 700, color: C.muted }), { dur: 0.2, over: 1.6 });
  }

  // ================= 4. SHARE =================
  function chatScreen(ctx, w, h, t) {
    ctx.fillStyle = '#efe7de'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1f6f5c'; ctx.fillRect(0, 0, w, 140);
    he(ctx, 'הורים כיתה א׳2 🎈', w - 30, 104, { size: 24, w: 800, color: '#fff', align: 'right' });
    he(ctx, '28 משתתפים', w - 30, 128, { size: 15, w: 500, color: 'rgba(255,255,255,0.8)', align: 'right' });
    let y = 170;
    for (const c of S.chat) {
      const p = UI.pop(t, c.t, 0.28, 2);
      const me = c.who === 'me';
      let bh;
      if (c.kind === 'image') bh = 300; else if (me) bh = 74; else bh = 66;
      if (p > 0) {
        const bw = c.kind === 'image' ? 236 : me ? 270 : 250;
        const x = me ? 16 : w - 16 - bw; // RTL chat: my messages sit on the left
        ctx.save(); ctx.translate(me ? x : x + bw, y); ctx.scale(p, p); ctx.translate(me ? -x : -(x + bw), -y);
        ctx.fillStyle = me ? '#d9fdd3' : '#ffffff'; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 12); ctx.fill();
        if (c.kind === 'image') { const k = 'inv-type8', im = IMG[k]; if (im) { ctx.save(); ctx.beginPath(); ctx.roundRect(x + 6, y + 6, bw - 12, bh - 12, 9); ctx.clip(); ctx.drawImage(im, x + 6, y + 6, bw - 12, (bw - 12) * im.height / im.width); ctx.restore(); } }
        else if (me) { const [a, b] = c.text.split('\n'); he(ctx, a, x + bw - 14, y + 30, { size: 18, w: 600, align: 'right' }); he(ctx, b, x + bw - 14, y + 58, { size: 16, w: 500, color: '#1c6fb0', align: 'right', dir: 'ltr' }); }
        else { he(ctx, c.name, x + bw - 12, y + 24, { size: 14, w: 800, color: ['#c2185b', '#1565c0', '#6a1b9a'][c.i % 3], align: 'right' }); he(ctx, c.text, x + bw - 12, y + 52, { size: 19, w: 600, align: 'right' }); }
        ctx.restore();
      }
      y += bh + 12;
    }
  }
  function shotShare(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    UI.phone(ctx, W / 2, 1000, 1040, chatScreen, t, { rot: -0.02 });
  }

  // ================= 5. MONTAGE =================
  function shotMontage(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const cur = latest(S.montage, t);
    const k = cur ? cur.i : -1;
    // the previous card stays under the new one, tilted
    if (k >= 1) inv(ctx, 'inv-' + S.montage[k - 1].id, W / 2 - 30, 830, 500, { rot: k % 2 ? 0.07 : -0.07, alpha: 0.9 });
    if (cur) {
      const u = ease.outBack(clamp((t - cur.t) / 0.32), 1.4);
      const x = lerp(-500, W / 2, u), rot = lerp(-0.5, k % 2 ? -0.03 : 0.03, clamp(u));
      inv(ctx, 'inv-' + cur.id, x, 820 - (t > cur.t + 0.3 ? hop(t, 8) : 0), 520, { rot });
      popAt(ctx, t, cur.t + 0.08, W / 2, 1405, (c) => pill(c, 0, 0, cur.name, { size: 46, w: 900, bg: C.yellow, seed: 90 + k }), { dur: 0.22, over: 1.8 });
    } else inv(ctx, 'inv-type8', W / 2, 820, 520);
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#ff7691'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
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
    he(ctx, 'הזמנה ליום הולדת, מוכנה בדקה', W / 2, 1000, { size: 50, w: 700, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, '12 עיצובים, הכול בחינם', { size: 50, w: 900, bg: C.yellow, seed: 120 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1240, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 121 }));
    he(ctx, 'לוואטסאפ, להדפסה ועם אישור הגעה', W / 2, 1375, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25) });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotStyles }, { t0: T(4), fn: shotFill }, { t0: T(6), fn: shotCustom },
    { t0: T(8), fn: shotShare }, { t0: T(10), fn: shotMontage }, { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  const IMG_KEYS = ['balloons', 'space', 'dino', 'princess', 'football', 'gaming', 'scrapbook', 'ribbon', 'retro', 'disco', 'ocean', 'elegant', 'type0', 'type1', 'type2', 'type3', 'type4', 'type5', 'type6', 'type7', 'type8', 'var0', 'var1', 'var2', 'var3'];
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/birthday-girl.png');
      IMG.logo = await L('img/logo.svg');
      for (const k of IMG_KEYS) IMG['inv-' + k] = await L('img/inv-' + k + '.png');
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
