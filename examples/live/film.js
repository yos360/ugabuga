// THE FILM (9:16) — BUGA LIVE: the live class quiz. Its own look from live-quiz.css: navy stage, purple
// B! orb, red/blue/gold/green answers with ▲◆●■. Light scenes use the live home background.
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




  const L = { navy: '#111633', purple: '#6338e6', cyan: '#28d8e6', pink: '#ff4f91', yellow: '#ffd84c', bg: '#f7f8ff' };
  const ANS = [['#d9385d', '▲'], ['#2777df', '◆'], ['#e79b13', '●'], ['#258a55', '■']];
  function stage(ctx) {
    ctx.drawImage(Studio.cache('stage', (x) => {
      x.fillStyle = L.navy; x.fillRect(0, 0, W, H);
      for (const [cx, cy, r, c] of [[150, 220, 520, 'rgba(99,56,230,0.35)'], [950, 1500, 600, 'rgba(255,79,145,0.22)'], [900, 300, 380, 'rgba(40,216,230,0.16)']]) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    }, { variants: 1 }), 0, 0, W, H);
  }
  function lightBg(ctx) {
    ctx.drawImage(Studio.cache('light', (x) => {
      x.fillStyle = L.bg; x.fillRect(0, 0, W, H);
      for (const [cx, cy, r, c] of [[130, 100, 480, 'rgba(217,250,255,1)'], [980, 170, 480, 'rgba(238,229,255,1)']]) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(247,248,255,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    }, { variants: 1 }), 0, 0, W, H);
  }
  function orb(ctx, cx, cy, s) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.09);
    ctx.fillStyle = 'rgba(99,56,230,0.35)'; ctx.beginPath(); ctx.roundRect(-s / 2 + 6, -s / 2 + 18, s, s, s * 0.34); ctx.fill();
    const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, L.purple); g.addColorStop(1, '#8b5cff');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.34); ctx.fill();
    he(ctx, 'B!', 0, s * 0.17, { size: s * 0.48, w: 700, color: '#fff', dir: 'ltr', fam: 'Fredoka' });
    ctx.restore();
  }
  function gradText(ctx, s, x, y, size, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.font = fontOf(size, 900); ctx.direction = 'rtl'; ctx.textAlign = 'center';
    const w = ctx.measureText(s).width, g = ctx.createLinearGradient(x + w / 2, 0, x - w / 2, 0);
    g.addColorStop(0, '#a98bff'); g.addColorStop(0.5, '#c58bff'); g.addColorStop(1, '#ff6fa8');
    ctx.fillStyle = g; ctx.fillText(s, x, y); ctx.restore();
  }
  // step header; dark=true on the navy stage
  function header(ctx, t, f, dark) {
    popAt(ctx, t, f.t, RIGHT - 52, 318, (c) => {
      c.fillStyle = dark ? 'rgba(0,0,0,0.5)' : C.ink; c.beginPath(); c.arc(5, 7, 52, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 52, 0, Math.PI * 2); c.fill();
      he(c, String(f.n), 0, 22, { size: 64, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, RIGHT - 126 + dx, 345, { size: 72, w: 900, align: 'right', alpha: a, maxW: SAFE.w - 130, color: dark ? '#fff' : L.navy });
    he(ctx, f.sub, RIGHT, 428, { size: 38, w: 500, color: dark ? '#b9bde0' : C.muted, align: 'right', alpha: UI.fadeIn(t, f.t + 0.2, 0.25), maxW: SAFE.w });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) { const x1 = RIGHT - 126, len = Math.min(measure(ctx, f.title, 72, 900), SAFE.w - 130) * u; G.line(ctx, [[x1, 366], [x1 - len, 370]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 }); }
  }
  function softCard(ctx, x, y, w, h, { fill = '#fff', r = 24, shadow = 'rgba(46,52,80,0.12)', stroke = '#e2e4f4' } = {}) {
    ctx.fillStyle = shadow; ctx.beginPath(); ctx.roundRect(x, y + 8, w, h, r); ctx.fill();
    ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; ctx.stroke(); }
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    stage(ctx);
    popAt(ctx, t, ev.orb, W / 2, 470, (c) => orb(c, 0, 0, 230), { dur: 0.4, over: 2 });
    const tp = UI.pop(t, ev.title, 0.35, 1.8);
    if (tp > 0) { ctx.save(); ctx.translate(W / 2, 760); ctx.scale(tp, tp); gradText(ctx, 'בוגה לייב', 0, 0, 200); ctx.restore(); }
    he(ctx, 'חידון לכל הכיתה:', W / 2, 880, { size: 54, w: 800, color: '#fff', alpha: UI.fadeIn(t, ev.sub, 0.2) });
    he(ctx, 'אתם על המסך, כולם עונים מהטלפון', W / 2, 950, { size: 50, w: 700, color: '#d8dbff', alpha: UI.fadeIn(t, ev.sub + BEAT / 2, 0.2), maxW: SAFE.w });
    S.pills.forEach((p) => popAt(ctx, t, p.t, W / 2, 1050 + p.i * 95, (c) => pill(c, 0, 0, p.s, { size: 36, w: 800, bg: '#fff', seed: 5 + p.i, shadow: 0 }), { rot: [-0.03, 0.03, -0.02][p.i] }));
    const gp = ease.outBack(clamp((t - T(1, 2)) / 0.45), 1.5);
    if (gp > 0) { img(ctx, IMG.boy, 170, 1530 + (1 - gp) * 420 - hop(t, 12), 330, { rot: -0.04 }); img(ctx, IMG.girl, 900, 1530 + (1 - gp) * 420 - hop(t + 0.1, 12), 330, { rot: 0.04 }); }
  }

  // ================= 1. TOPIC + LEVEL =================
  function shotTopic(ctx, t) {
    lightBg(ctx); header(ctx, t, S.steps[0]);
    const tapped = t >= ev.tapTopic;
    S.topics.forEach((tp) => {
      const col = tp.i % 2, row = Math.floor(tp.i / 2);
      const cx = col ? 290 : 730, cy = 560 + row * 140;
      const sel = tapped && tp.i === 3;
      popAt(ctx, t, tp.t, cx, cy, (c) => {
        const s = sel ? 1 + 0.06 * pulse(t, ev.tapTopic, 9) : 1; c.scale(s, s);
        softCard(c, -210, -58, 420, 116, { fill: sel ? tp.color : '#fff', stroke: sel ? tp.color : '#e2e4f4' });
        c.fillStyle = sel ? 'rgba(255,255,255,0.22)' : tp.color + '22'; c.beginPath(); c.roundRect(110, -40, 80, 80, 20); c.fill();
        he(c, tp.icon, 150, 20, { size: 48, w: 400 });
        he(c, tp.label, 90, 15, { size: 40, w: 800, align: 'right', color: sel ? '#fff' : L.navy, maxW: 280 });
      });
      if (tp.i === 3) UI.tap(ctx, cx, cy, t, ev.tapTopic, { color: 'rgba(23,111,189,0.9)', size: 140 });
    });
    he(ctx, 'באיזו רמה?', RIGHT, 1160, { size: 44, w: 900, align: 'right', color: L.navy, alpha: UI.fadeIn(t, S.levels[0].t - 0.1, 0.2) });
    S.levels.forEach((lv) => {
      const sel = t >= ev.tapLevel && lv.i === 1, x = RIGHT - 140 - lv.i * 300;
      popAt(ctx, t, lv.t, x, 1250, (c) => {
        softCard(c, -135, -48, 270, 96, { fill: sel ? L.purple : '#fff', r: 48, stroke: sel ? L.purple : '#e2e4f4' });
        he(c, lv.icon + ' ' + lv.label, 0, 14, { size: 40, w: 800, color: sel ? '#fff' : L.navy });
      });
      if (lv.i === 1) UI.tap(ctx, x, 1250, t, ev.tapLevel, { color: 'rgba(99,56,230,0.9)', size: 110 });
    });
    const bp = UI.pop(t, ev.openRoom - 0.25, 0.3, 2);
    if (bp > 0) { const s = bp * (t >= ev.openRoom ? 1 - 0.07 * pulse(t, ev.openRoom, 10) : 1); ctx.save(); ctx.translate(W / 2, 1405); ctx.scale(s, s); softCard(ctx, -290, -50, 580, 100, { fill: L.pink, r: 50, stroke: null }); he(ctx, '🚀 פתיחת חדר המשחק', 0, 16, { size: 44, w: 900, color: '#fff' }); ctx.restore(); }
  }

  // ================= 2. ROOM =================
  function qr(ctx, cx, cy, s) {
    const n = 25, k = s / n;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(cx - s / 2 - 22, cy - s / 2 - 22, s + 44, s + 44, 22); ctx.fill();
    ctx.fillStyle = L.navy;
    const finder = (fx, fy) => { ctx.fillRect(cx - s / 2 + fx * k, cy - s / 2 + fy * k, 7 * k, 7 * k); ctx.fillStyle = '#fff'; ctx.fillRect(cx - s / 2 + (fx + 1) * k, cy - s / 2 + (fy + 1) * k, 5 * k, 5 * k); ctx.fillStyle = L.navy; ctx.fillRect(cx - s / 2 + (fx + 2) * k, cy - s / 2 + (fy + 2) * k, 3 * k, 3 * k); };
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue;
      if (U.hash(x * 31 + y * 17 + 5) > 0.52) ctx.fillRect(cx - s / 2 + x * k, cy - s / 2 + y * k, k + 0.5, k + 0.5);
    }
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  }
  function shotRoom(ctx, t) {
    stage(ctx); header(ctx, t, S.steps[1], true);
    const a = UI.fadeIn(t, T(4, 0.25), 0.25);
    ctx.save(); ctx.globalAlpha = a;
    he(ctx, 'קוד משחק', 760, 560, { size: 36, w: 700, color: '#b9bde0' });
    he(ctx, S.CODE, 760, 670, { size: 100, w: 700, color: L.yellow, dir: 'ltr', fam: 'Fredoka' });
    he(ctx, 'המשתתפים נכנסים מהטלפון', 760, 740, { size: 32, w: 600, color: '#d8dbff' });
    ctx.restore();
    const qp = UI.pop(t, T(4, 0.5), 0.35, 1.8);
    if (qp > 0) { ctx.save(); ctx.translate(280, 650); ctx.scale(qp, qp); qr(ctx, 0, 0, 250); ctx.restore(); }
    const n = S.players.filter((p) => t >= p.t).length;
    const np = n ? pulse(t, S.players[n - 1].t, 10) : 0;
    ctx.save(); ctx.translate(RIGHT, 880); he(ctx, 'משתתפים בחדר', 0, 0, { size: 44, w: 900, align: 'right', color: '#fff' }); ctx.restore();
    ctx.save(); ctx.translate(SAFE.x + 70, 865); ctx.scale(1 + 0.12 * np, 1 + 0.12 * np); ctx.fillStyle = L.pink; ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill(); he(ctx, String(n), 0, 18, { size: 50, w: 900, color: '#fff', dir: 'ltr' }); ctx.restore();
    S.players.forEach((p) => {
      const col = p.i % 3, row = Math.floor(p.i / 3);
      const x = RIGHT - 140 - col * 300, y = 1000 + row * 118;
      popAt(ctx, t, p.t, x, y, (c) => { c.fillStyle = 'rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(-135, -45, 270, 90, 45); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 2; c.stroke(); c.fillStyle = ['#d9385d', '#2777df', '#e79b13', '#258a55'][p.i % 4]; c.beginPath(); c.arc(95, 0, 26, 0, Math.PI * 2); c.fill(); he(c, p.name[0], 95, 12, { size: 30, w: 900, color: '#fff' }); he(c, p.name, 50, 13, { size: 38, w: 700, color: '#fff', align: 'right' }); });
    });
  }

  // ================= 3. QUESTION =================
  function shotQuestion(ctx, t) {
    stage(ctx); header(ctx, t, S.steps[2], true);
    const Q = S.Q, rev = t >= ev.reveal;
    he(ctx, 'שאלה 3 מתוך 10', RIGHT, 530, { size: 36, w: 700, color: '#b9bde0', align: 'right' });
    // the timer
    const ticks = S.timerTicks.filter((x) => t >= x).length, secs = rev ? 0 : Math.max(0, Q.seconds - ticks * 3);
    const tp = pulse(t, S.timerTicks[Math.max(0, ticks - 1)] || 0, 10);
    ctx.save(); ctx.translate(SAFE.x + 70, 515); ctx.scale(1 + 0.1 * (ticks ? tp : 0), 1 + 0.1 * (ticks ? tp : 0));
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = secs <= 8 ? L.pink : L.cyan; ctx.beginPath(); ctx.arc(0, 0, 56, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (secs / Q.seconds)); ctx.stroke();
    he(ctx, String(secs), 0, 20, { size: 54, w: 900, color: '#fff', dir: 'ltr' }); ctx.restore();
    popAt(ctx, t, S.qIn, W / 2, 680, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-SAFE.w / 2, -85, SAFE.w, 170, 28); c.fill(); he(c, Q.text, 0, 20, { size: 54, w: 900, color: L.navy, maxW: SAFE.w - 60 }); }, { dur: 0.3, over: 1.6 });
    Q.answers.forEach((ans, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = col ? 285 : 735, y = 900 + row * 215;
      const ok = i === Q.correct;
      popAt(ctx, t, S.ansIn[i], x, y, (c) => {
        const s = rev && ok ? 1 + 0.07 * pulse(t, ev.reveal, 8) : 1; c.scale(s, s);
        c.globalAlpha = rev && !ok ? 0.28 : 1;
        c.fillStyle = ANS[i][0]; c.beginPath(); c.roundRect(-212, -95, 424, 190, 26); c.fill();
        if (rev && ok) { c.strokeStyle = '#fff'; c.lineWidth = 8; c.stroke(); }
        he(c, ANS[i][1], 160, 22, { size: 64, w: 900, color: '#fff', dir: 'ltr' });
        he(c, ans, 110, 18, { size: 50, w: 900, color: '#fff', align: 'right', maxW: 290 });
        if (rev && ok) checkMark(c, -160, -50, 34, clamp((t - ev.reveal) / 0.3), '#fff');
      }, { dur: 0.25, over: 2 });
    });
    if (rev) {
      popAt(ctx, t, ev.reveal + 0.1, W / 2, 1360, (c) => pill(c, 0, 0, '✓ התשובה הנכונה: שבתאי', { size: 44, w: 900, bg: '#258a55', fg: '#fff', seed: 50, shadow: 0 }));
    } else if (t >= S.timerTicks[0]) {
      he(ctx, `ענו ${S.answeredAt(t)} מתוך ${S.TOTAL_PLAYERS}`, W / 2, 1375, { size: 44, w: 800, color: '#d8dbff' });
    }
  }

  // ================= 4. LEADERBOARD =================
  function shotBoard(ctx, t) {
    stage(ctx); header(ctx, t, S.steps[3], true);
    const sw = clamp((t - ev.swap) / 0.55), e = sw < 0.5 ? 4 * sw * sw * sw : 1 - Math.pow(-2 * sw + 2, 3) / 2;
    const names = S.board0.map((r) => r[0]);
    names.forEach((name, i0) => {
      const i1 = S.board1.findIndex((r) => r[0] === name);
      const s0 = S.board0[i0][1], s1 = S.board1[i1][1];
      const pos = lerp(i0, i1, e), score = Math.round(lerp(s0, s1, e));
      const y = 560 + pos * 150;
      const a = UI.fadeIn(t, S.rowsIn[i0], 0.15), dx = (1 - ease.outCubic(clamp((t - S.rowsIn[i0]) / 0.3))) * -120;
      if (a <= 0) return;
      const rank = Math.round(pos) + 1, top = rank === 1;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, 0);
      ctx.fillStyle = top ? 'rgba(255,216,76,0.18)' : 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(SAFE.x, y - 60, SAFE.w, 120, 24); ctx.fill();
      if (top) { ctx.strokeStyle = L.yellow; ctx.lineWidth = 4; ctx.stroke(); }
      ctx.fillStyle = top ? L.yellow : 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(RIGHT - 55, y, 38, 0, Math.PI * 2); ctx.fill();
      he(ctx, String(rank), RIGHT - 55, y + 15, { size: 42, w: 900, color: top ? L.navy : '#fff', dir: 'ltr' });
      he(ctx, (top ? '👑 ' : '') + name, RIGHT - 115, y + 16, { size: 48, w: 800, color: '#fff', align: 'right' });
      he(ctx, score.toLocaleString('he-IL'), SAFE.x + 40, y + 16, { size: 48, w: 900, color: top ? L.yellow : '#d8dbff', align: 'left', dir: 'ltr' });
      // a little arrow on the climbers
      if (sw > 0 && i1 < i0) he(ctx, '⬆', SAFE.x + 230, y + 14, { size: 40, w: 900, color: '#3ddc84', alpha: clamp(sw * 3) * (1 - clamp((t - ev.swap - 1.2) / 0.3)), dir: 'ltr' });
      ctx.restore();
    });
    popAt(ctx, t, ev.swap + 0.5, W / 2, 1365, (c) => pill(c, 0, 0, 'מיה עקפה וטסה למקום הראשון!', { size: 42, w: 900, bg: L.yellow, seed: 60, shadow: 0 }), { rot: -0.02 });
  }

  // ================= 5. PODIUM =================
  function shotPodium(ctx, t) {
    lightBg(ctx); header(ctx, t, S.steps[4]);
    const base = 1180;
    S.podium.forEach((p) => {
      const x = [255, 795, 525][p.i], h = [210, 300, 400][p.i], col = ['#e79b13', '#2777df', '#6338e6'][p.i];
      const u = ease.outBack(clamp((t - p.t) / 0.4), 1.3);
      if (u <= 0) return;
      const hh = h * clamp(u);
      softCard(ctx, x - 125, base - hh, 250, hh, { fill: col, r: 18, stroke: null });
      he(ctx, String(p.place), x, base - hh + 110, { size: 110, w: 900, color: 'rgba(255,255,255,0.9)', dir: 'ltr', fam: 'Fredoka' });
      popAt(ctx, t, p.t + 0.12, x, base - hh - 105, (c) => { he(c, p.place === 1 ? '🏆' : p.place === 2 ? '🥈' : '🥉', 0, -60, { size: 70, w: 400 }); he(c, p.name, 0, 10, { size: 50, w: 900, color: L.navy }); he(c, p.score.toLocaleString('he-IL'), 0, 60, { size: 34, w: 700, color: C.muted, dir: 'ltr' }); }, { dur: 0.25 });
    });
    confetti(ctx, t, ev.winner, 525, 650, { n: 90, seed: 4, spread: 1000 });
    S.extras.forEach((x) => popAt(ctx, t, x.t, W / 2, 1290 + x.i * 105, (c) => { softCard(c, -SAFE.w / 2 + 20, -42, SAFE.w - 40, 84, { r: 42 }); he(c, x.e + ' ' + x.s, 0, 13, { size: 36, w: 800, color: L.navy, maxW: SAFE.w - 80 }); }));
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    stage(ctx);
    popAt(ctx, t, ev.logo, W / 2, 540, (c) => orb(c, 0, 0, 260), { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    gradText(ctx, 'בוגה לייב', W / 2, 860 + (1 - wp) * 24, 170, wp);
    const Ls = S.endLines;
    he(ctx, 'חידון חי לכיתה, למשפחה ולמסיבה', W / 2, 960, { size: 50, w: 700, color: '#fff', alpha: UI.fadeIn(t, Ls[0].t, 0.25) });
    popAt(ctx, t, Ls[1].t, W / 2, 1070, (c) => pill(c, 0, 0, 'בחינם, בלי חשבון', { size: 50, w: 900, bg: L.yellow, seed: 120, shadow: 0 }), { rot: -0.03 });
    popAt(ctx, t, Ls[2].t, W / 2, 1205, (c) => pill(c, 0, 0, 'ugabuga.co.il/live', { size: 58, w: 600, bg: L.pink, fg: '#fff', padX: 46, dir: 'ltr', fam: 'Fredoka', seed: 121, shadow: 0 }));
    he(ctx, 'עד 100 משתתפים · 8 נושאים · 3 רמות', W / 2, 1335, { size: 40, w: 700, color: '#b9bde0', alpha: UI.fadeIn(t, Ls[3].t, 0.25) });
    confetti(ctx, t, ev.logo, W / 2, 560, { n: 70, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotTopic }, { t0: T(4), fn: shotRoom }, { t0: T(6), fn: shotQuestion },
    { t0: T(8), fn: shotBoard }, { t0: T(10), fn: shotPodium }, { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const Ld = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await Ld('img/home-schoolgirl.png');
      IMG.boy = await Ld('img/home-detective-boy.png');
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        const e = 1 - Math.pow(1 - u, 4);
        ctx.save(); ctx.translate(e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((e - 1) * W, 0); sec.fn(ctx, t); ctx.restore();
        const f = S.steps[i - 1] || { color: L.pink };
        ctx.fillStyle = f.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.12, vignette: 0.1, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
