// THE FILM (9:16) — UGABUGA for teachers. The site's own look: warm paper, a dot grid, ink-outlined
// cards with an offset "sketch" shadow, Heebo type, and the site's real characters.
// Every frame is a pure function of t; text, faces and logos stay inside G.SAFE.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, BAR, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940: Hebrew lines start here

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', pink: '#ff7691', line: '#dde2ed' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // ---------- Hebrew text (Chrome's own RTL shaping, in the site's font) ----------
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
  // an ink-outlined card with the site's offset shadow
  function card(ctx, x, y, w, h, { fill = '#ffffff', r = 34, seed = 1, shadow = 12, lw = 4.5 } = {}) {
    if (shadow) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(x + shadow * 0.8, y + shadow, w, h, r); ctx.fill(); }
    G.rrect(ctx, x, y, w, h, r, { fill, lw, seed, stroke: C.ink, amp: 1 });
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
  // deterministic confetti burst
  function confetti(ctx, t, t0, cx, cy, { n = 60, spread = 900, seed = 1 } = {}) {
    const a = t - t0;
    if (a < 0 || a > 2.2) return;
    const cols = [C.red, C.blue, C.green, C.yellow, C.purple, C.cyan, C.orange];
    for (let i = 0; i < n; i++) {
      const r = (k) => U.hash(seed * 1000 + i * 7 + k);
      const ang = -Math.PI / 2 + (r(1) - 0.5) * 2.6, sp = spread * (0.45 + r(2) * 0.6);
      const x = cx + Math.cos(ang) * sp * a, y = cy + Math.sin(ang) * sp * a + 900 * a * a;
      ctx.save(); ctx.globalAlpha = clamp(1.6 - a); ctx.translate(x, y); ctx.rotate(a * (4 + r(3) * 8)); ctx.scale(1, Math.abs(Math.cos(a * 7 + i)));
      ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-11, -6, 22, 12); ctx.restore();
    }
  }

  // ---------- background: the site's paper with a dot grid ----------
  function bg(ctx) {
    ctx.drawImage(Studio.cache('bg', (x) => {
      x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.09)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the feature header: number badge + title + subtitle (right-aligned, RTL) ----------
  function header(ctx, t, f) {
    const p = UI.pop(t, f.t, 0.32, 2);
    popAt(ctx, t, f.t, RIGHT - 52, 318, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 52, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 52, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, 22, { size: 64, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, RIGHT - 126 + dx, 345, { size: 72, w: 900, align: 'right', alpha: a, maxW: SAFE.w - 130 });
    const a2 = UI.fadeIn(t, f.t + 0.2, 0.25);
    he(ctx, f.sub, RIGHT, 428, { size: 40, w: 500, color: C.muted, align: 'right', alpha: a2, maxW: SAFE.w });
    // underline scribble in the feature colour
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = RIGHT - 126, len = Math.min(measure(ctx, f.title, 72, 900), SAFE.w - 130) * u;
      G.line(ctx, [[x1, 366], [x1 - len, 370]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    bg(ctx);
    popAt(ctx, t, ev.hook1, W / 2, 540, (c) => he(c, 'מורים', 0, 0, { size: 190, w: 900 }), { rot: -0.03 });
    popAt(ctx, t, ev.hook1 + BEAT / 2, W / 2, 730, (c) => {
      he(c, 'ומורות?', 0, 0, { size: 190, w: 900, color: C.red });
    }, { rot: 0.02 });
    // the second line
    const a = UI.fadeIn(t, ev.hook2, 0.2), dy = (1 - ease.outCubic(UI.fadeIn(t, ev.hook2, 0.35))) * 40;
    he(ctx, '5 דברים שעוגה בוגה', W / 2, 890 + dy, { size: 74, w: 800, alpha: a });
    he(ctx, 'עושה בשבילכם', W / 2, 985 + dy, { size: 74, w: 800, alpha: UI.fadeIn(t, ev.hook2 + BEAT / 2, 0.2) });
    // the stamp
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(640, 1180); ctx.rotate(-0.08); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'והכול בחינם!', { size: 62, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    // the detective boy pops up from the bottom-left with his magnifier and bobs on the beat
    if (t >= ev.buga) {
      const j = clamp((t - ev.buga) / 0.45), arc = Math.sin(Math.PI * j) * 200;
      const x = lerp(-200, 235, ease.outCubic(j)), bottom = 1540 - arc * (j < 1 ? 1 : 0) - (j >= 1 ? hop(t, 22) : 0);
      img(ctx, IMG.boy, x, bottom, 480, { rot: lerp(-0.4, -0.04, j) });
    }
  }

  // ================= 1. QUIZ =================
  function shotQuiz(ctx, t) {
    bg(ctx); header(ctx, t, S.features[0]);
    const X = 90, Y = 500, Wc = 840, Hc = 960;
    card(ctx, X, Y, Wc, Hc, { seed: 11 });
    if (t < T(3)) {
      he(ctx, 'שאלה 3 מתוך 10', RIGHT - 60, Y + 90, { size: 38, w: 600, color: C.muted, align: 'right' });
      // progress bar
      ctx.fillStyle = C.line; ctx.beginPath(); ctx.roundRect(X + 50, Y + 120, Wc - 100, 16, 8); ctx.fill();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(X + Wc - 50 - (Wc - 100) * 0.3, Y + 120, (Wc - 100) * 0.3, 16, 8); ctx.fill();
      he(ctx, '7 × 8 = ?', W / 2, Y + 300, { size: 130, w: 900, dir: 'ltr' });
      for (const q of S.quizAns) {
        const col = q.i % 2, row = Math.floor(q.i / 2);
        const cx = X + Wc - 50 - 175 - col * 390, cy = Y + 480 + row * 200; // first answer on the right
        const tapped = t >= ev.tapQuiz;
        const press = tapped && q.ok ? 1 - 0.07 * pulse(t, ev.tapQuiz, 10) : 1;
        popAt(ctx, t, q.t, cx, cy, (c) => {
          c.scale(press, press);
          const fill = tapped ? (q.ok ? '#d9f5e3' : '#f4f5f8') : '#eef4ff';
          card(c, -175, -80, 350, 160, { fill, r: 28, seed: 20 + q.i, shadow: q.ok && tapped ? 9 : 7 });
          he(c, q.a, 0, 26, { size: 82, w: 900, dir: 'ltr', color: tapped && !q.ok ? '#b4b8c8' : C.ink });
          if (q.ok && tapped) checkMark(c, 120, -38, 34, clamp((t - ev.tapQuiz) / 0.3));
        });
        if (q.ok) UI.tap(ctx, cx, cy, t, ev.tapQuiz, { color: 'rgba(35,135,77,0.9)', size: 140 });
      }
      const ok = UI.pop(t, ev.tapQuiz + 0.12, 0.3, 2);
      if (ok > 0) { ctx.save(); ctx.translate(W / 2, Y + Hc - 70); ctx.scale(ok, ok); he(ctx, 'נכון! 🎉', 0, 0, { size: 64, w: 900, color: C.green }); ctx.restore(); }
    } else {
      he(ctx, 'הציונים של הכיתה', RIGHT - 60, Y + 110, { size: 56, w: 900, align: 'right' });
      he(ctx, 'נבדק אוטומטית', RIGHT - 60, Y + 170, { size: 36, w: 500, color: C.muted, align: 'right' });
      for (const s of S.scores) {
        const y = Y + 290 + s.i * 160;
        const a = UI.fadeIn(t, s.t, 0.12), dx = (1 - ease.outCubic(clamp((t - s.t) / 0.3))) * -60;
        if (a <= 0) continue;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, 0);
        G.rrect(ctx, X + 40, y - 62, Wc - 80, 124, 26, { fill: '#f6f8fc', lw: 3, seed: 30 + s.i, stroke: C.line });
        checkMark(ctx, RIGHT - 90, y, 30, clamp((t - s.t) / 0.25));
        he(ctx, s.name, RIGHT - 145, y + 20, { size: 56, w: 700, align: 'right' });
        ctx.restore();
        popAt(ctx, t, s.t + 0.05, X + 150, y, (c) => pill(c, 0, 0, String(s.s), { size: 52, w: 900, bg: s.s === 100 ? C.green : C.blue, fg: '#fff', dir: 'ltr', shadow: 5 }));
      }
    }
  }

  // ================= 2. HOMEWORK =================
  const HW_ICON = ['🔢', '📖', '✏️', '🎮'];
  const HW_COL = ['#eef4ff', '#fff1f4', '#fff8de', '#f2ecff'];
  function shotHW(ctx, t) {
    bg(ctx); header(ctx, t, S.features[1]);
    const X = 90, Y = 500, Wc = 840, Hc = 960;
    card(ctx, X, Y, Wc, Hc, { seed: 41 });
    if (t < T(5)) {
      he(ctx, 'שיעורי בית לשבוע', RIGHT - 60, Y + 105, { size: 58, w: 900, align: 'right' });
      pill(ctx, X + 140, Y + 86, 'כיתה ב׳2', { size: 34, bg: C.yellow, shadow: 4, seed: 42 });
      for (const k of S.hwTasks) {
        const y = Y + 230 + k.i * 145;
        const p = UI.pop(t, k.t, 0.3, 2);
        if (p <= 0) continue;
        ctx.save(); ctx.translate(W / 2, y); ctx.scale(lerp(0.85, 1, clamp(p)), p); ctx.translate(-W / 2, -y);
        G.rrect(ctx, X + 40, y - 58, Wc - 80, 116, 24, { fill: HW_COL[k.i], lw: 3.5, seed: 50 + k.i, stroke: C.ink });
        he(ctx, HW_ICON[k.i], RIGHT - 105, y + 22, { size: 58, w: 400 });
        he(ctx, k.txt, RIGHT - 160, y + 17, { size: 46, w: 700, align: 'right' });
        ctx.restore();
      }
      // "send to class" button
      const bp = UI.fadeIn(t, T(4, 3), 0.2);
      if (bp > 0) {
        const press = t >= ev.send ? 1 - 0.08 * pulse(t, ev.send, 10) : 1;
        ctx.save(); ctx.globalAlpha = bp; ctx.translate(W / 2, Y + Hc - 110); ctx.scale(press, press);
        pill(ctx, 0, 0, t >= ev.send ? 'נשלח לכיתה ✓' : 'שליחת קישור לכיתה', { size: 50, w: 900, bg: t >= ev.send ? C.green : C.red, fg: '#fff', padX: 60, seed: 44 });
        ctx.restore();
        UI.tap(ctx, W / 2 + 120, Y + Hc - 110, t, ev.send, { color: 'rgba(20,22,45,0.7)', size: 120 });
      }
    } else {
      he(ctx, 'מי כבר סיים?', RIGHT - 60, Y + 110, { size: 62, w: 900, align: 'right' });
      he(ctx, 'הילדים נכנסים בקישור, בלי הרשמה', RIGHT - 60, Y + 172, { size: 36, w: 500, color: C.muted, align: 'right' });
      for (const k of S.kids) {
        const col = k.i % 2, row = Math.floor(k.i / 2);
        const cx = X + Wc - 40 - 185 - col * 390, cy = Y + 320 + row * 165;
        const done = clamp((t - k.t) / 0.25);
        G.rrect(ctx, cx - 185, cy - 62, 370, 124, 26, { fill: done > 0 ? '#e3f6ea' : '#f6f8fc', lw: 3, seed: 60 + k.i, stroke: done > 0 ? C.green : C.line });
        he(ctx, k.name, cx + 135, cy + 18, { size: 50, w: 700, align: 'right' });
        if (done > 0) checkMark(ctx, cx - 115, cy, 34, done);
        else { ctx.strokeStyle = '#c7ccda'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx - 115, cy, 30, 0, Math.PI * 2); ctx.stroke(); }
      }
      const n = S.kids.filter((k) => t >= k.t).length;
      const np = n ? pulse(t, S.kids[n - 1].t, 9) : 0;
      ctx.save(); ctx.translate(W / 2, Y + Hc - 100); ctx.scale(1 + 0.08 * np, 1 + 0.08 * np);
      he(ctx, `${n} מתוך 6 סיימו`, 0, 0, { size: 60, w: 900, color: n === 6 ? C.green : C.ink });
      ctx.restore();
    }
  }

  // ================= 3. WHEEL + TEAMS =================
  const WHEEL_COL = [C.blue, C.red, C.green, '#f2b705', C.purple, C.cyan, C.orange, C.pink];
  function shotWheel(ctx, t) {
    bg(ctx); header(ctx, t, S.features[2]);
    const cx = W / 2, cy = 890, R = 300;
    const rot = S.wheelRot(t);
    // shadow + slices
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + 10, cy + 13, R, 0, Math.PI * 2); ctx.fill();
    S.wheelNames.forEach((name, i) => {
      const a0 = rot + i * S.SL - Math.PI / 2 - S.SL / 2;
      ctx.fillStyle = WHEEL_COL[i]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a0 + S.SL); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
      const mid = a0 + S.SL / 2, left = Math.cos(mid) < 0; // keep every name upright
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(left ? mid + Math.PI : mid);
      if (left) he(ctx, name, -(R - 34), 15, { size: 42, w: 800, color: '#fff', align: 'left', dir: 'rtl' });
      else he(ctx, name, R - 34, 15, { size: 42, w: 800, color: '#fff', align: 'right', dir: 'rtl' });
      ctx.restore();
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    // winner glow on the landed slice
    const won = t >= ev.land;
    if (won) {
      const a0 = rot + 2 * S.SL - Math.PI / 2 - S.SL / 2;
      ctx.save(); ctx.globalAlpha = 0.35 + 0.35 * Math.abs(Math.sin((t - ev.land) * 7)); ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a0 + S.SL); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // hub
    const hubR = won ? lerp(58, 150, ease.outBack(clamp((t - ev.land) / 0.3), 2)) : 58;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, hubR, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.stroke();
    if (won) he(ctx, 'מיה!', cx, cy + 30, { size: 84 * clamp((hubR - 58) / 92), w: 900, color: C.green });
    else he(ctx, '🎡', cx, cy + 20, { size: 56, w: 400 });
    // pointer at the top: flaps on every tick
    let flap = 0;
    for (const tk of S.wheelTicks) if (t >= tk && t < tk + 0.12) flap = 1 - (t - tk) / 0.12;
    ctx.save(); ctx.translate(cx, cy - R - 18); ctx.rotate(-0.35 * flap);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(-40, -44); ctx.lineTo(40, -44); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.moveTo(-30, -38); ctx.lineTo(30, -38); ctx.lineTo(0, 18); ctx.closePath(); ctx.fill();
    ctx.restore();
    confetti(ctx, t, ev.land, cx, cy - 60, { n: 70, seed: 3 });
    // teams
    S.teams.forEach((tm) => {
      const x = RIGHT - 20 - 130 - tm.i * 280, y = 1355; // first team on the right
      popAt(ctx, t, tm.t, x, y, (c) => {
        card(c, -130, -125, 260, 250, { fill: '#fff', r: 26, seed: 70 + tm.i, shadow: 8 });
        c.fillStyle = [C.blue, C.red, C.green][tm.i]; c.beginPath(); c.roundRect(-130 + 3, -125 + 3, 254, 62, [24, 24, 0, 0]); c.fill();
        he(c, `קבוצה ${tm.i + 1}`, 0, -80, { size: 40, w: 900, color: '#fff' });
        tm.names.forEach((nm, j) => he(c, nm, 0, -12 + j * 50, { size: 38, w: 600 }));
      }, { rot: (tm.i - 1) * 0.03 });
    });
  }

  // ================= 4. PRINT =================
  function pageArt(ctx, kind, w, h, t) {
    ctx.save();
    ctx.strokeStyle = '#9aa3b5'; ctx.lineWidth = 3;
    if (kind === 'letter') {
      ctx.setLineDash([10, 9]); ctx.lineWidth = 6; ctx.strokeStyle = C.blue;
      ctx.font = fontOf(150, 800); ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.strokeText('א', 0, 20);
      ctx.setLineDash([]);
      he(ctx, 'א', 52, -70, { size: 46, w: 900, color: C.red });
      for (let i = 0; i < 2; i++) { ctx.strokeStyle = '#c3cbe0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w / 2 + 22, 70 + i * 40); ctx.lineTo(w / 2 - 22, 70 + i * 40); ctx.stroke(); }
    } else if (kind === 'math') {
      ['7 + 5 = __', '9 − 3 = __', '4 + 8 = __', '6 + 6 = __'].forEach((s, i) => he(ctx, s, 0, -60 + i * 52, { size: 36, w: 700, dir: 'ltr' }));
    } else if (kind === 'clock') {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -10, 72, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; he(ctx, String(i), Math.cos(a) * 54, -10 + Math.sin(a) * 54 + 8, { size: 20, w: 700, dir: 'ltr' }); }
      ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -58); ctx.stroke();
      ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(34, 8); ctx.stroke();
      he(ctx, 'מה השעה?', 0, 100, { size: 30, w: 700 });
    } else if (kind === 'abc') {
      ctx.setLineDash([9, 8]); ctx.lineWidth = 5; ctx.strokeStyle = C.green;
      ctx.font = fontOf(110, 800, 'Fredoka'); ctx.textAlign = 'center'; ctx.direction = 'ltr'; ctx.strokeText('Aa', 0, 10);
      ctx.setLineDash([]);
      for (let i = 0; i < 2; i++) { ctx.strokeStyle = '#c3cbe0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w / 2 + 22, 60 + i * 40); ctx.lineTo(w / 2 - 22, 60 + i * 40); ctx.stroke(); }
    }
    ctx.restore();
  }
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.features[3]);
    const px = W / 2, pb = 1500, ph = 470;
    const PW = 210, PH = 290;
    const slots = [[810, 710, 0.06], [600, 690, -0.04], [390, 710, 0.05], [180, 690, -0.06]]; // right to left
    // the printer bobs on each page
    let push = 0; for (const p of S.pages) push = Math.max(push, pulse(t, p.t, 9));
    // pages behind the printer while they come out of its top
    for (const p of S.pages) {
      const a = t - p.t;
      if (a < -BEAT * 0.5) continue;
      const [sx, sy, sr] = slots[p.i];
      const outY = pb - ph + 70; // top slot of the printer
      let x, y, r, s;
      if (a < 0) { const u = (a + BEAT * 0.5) / (BEAT * 0.5); x = px; y = outY + 120 - u * 120; r = 0; s = 0.75; } // rises out of the slot
      else { const u = ease.outBack(clamp(a / 0.42), 1.4); x = lerp(px, sx, u); y = lerp(outY, sy, u) - Math.sin(Math.PI * clamp(a / 0.42)) * 140; r = lerp(0, sr, u); s = lerp(0.75, 1, clamp(u)); }
      const fan = t >= S.printFan ? hop(t + p.i * 0.06, 16) : 0;
      ctx.save(); ctx.translate(x, y - fan); ctx.rotate(r); ctx.scale(s, s);
      card(ctx, -PW / 2, -PH / 2, PW, PH, { fill: '#fff', r: 10, seed: 80 + p.i, shadow: 7, lw: 3.5 });
      pageArt(ctx, p.kind, PW, PH, t);
      ctx.restore();
      if (a < 0) { /* drawn under the printer */ }
    }
    img(ctx, IMG.printer, px, pb + push * 6, ph * (1 - 0.03 * push));
    // labels pop on the fan bar
    S.pages.forEach((p, i) => {
      const [sx, sy] = slots[i];
      popAt(ctx, t, S.printFan + i * BEAT * 0.25, sx, sy + PH / 2 + 34, (c) => pill(c, 0, 0, p.label, { size: 34, w: 800, bg: [C.yellow, '#dff0ff', '#e6f7ec', '#f2ecff'][i], shadow: 4, seed: 90 + i, dir: p.kind === 'abc' ? 'ltr' : 'rtl', fam: p.kind === 'abc' ? 'Fredoka' : 'Heebo' }));
    });
    popAt(ctx, t, T(9, 2), W / 2, 1000, (c) => pill(c, 0, 0, 'בלי לחפש, בלי לצלם', { size: 46, w: 900, bg: '#fff', shadow: 7, seed: 95 }), { rot: -0.03 });
  }

  // ================= 5. GAMES =================
  const GRADE_COL = [C.red, C.blue, C.green, '#f2b705', C.purple, C.cyan, C.orange];
  function shotGames(ctx, t) {
    bg(ctx); header(ctx, t, S.features[4]);
    S.grades.forEach((g) => {
      const row = g.i < 4 ? 0 : 1, k = row ? g.i - 4 : g.i, n = row ? 3 : 4;
      const x = W / 2 + ((n - 1) / 2 - k) * 200, y = 570 + row * 185; // right to left
      const b = t >= T(11) ? hop(t + g.i * 0.05, 10) : 0;
      popAt(ctx, t, g.t, x, y - b, (c) => {
        c.fillStyle = C.ink; c.beginPath(); c.arc(6, 8, 78, 0, Math.PI * 2); c.fill();
        c.fillStyle = GRADE_COL[g.i]; c.beginPath(); c.arc(0, 0, 78, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
        he(c, g.g, 0, 24, { size: 66, w: 900, color: '#fff' });
      });
    });
    // characters
    const gp = ease.outBack(clamp((t - T(10, 3)) / 0.45), 1.6), bp = ease.outBack(clamp((t - T(11, 0)) / 0.45), 1.6);
    if (gp > 0) img(ctx, IMG.girl, 175, 1500 + (1 - gp) * 500 - (t > T(11) ? hop(t, 12) : 0), 520);
    if (bp > 0) img(ctx, IMG.boy, 880, 1500 + (1 - bp) * 500 - (t > T(11, 1) ? hop(t + 0.1, 12) : 0), 470);
    S.gameCards.forEach((c, i) => {
      popAt(ctx, t, c.t, W / 2, 990 + i * 150, (cc) => {
        card(cc, -175, -58, 350, 116, { fill: ['#fff1f4', '#eef4ff', '#fff8de'][i], r: 26, seed: 100 + i, shadow: 7 });
        he(cc, c.g, 0, 18, { size: 46, w: 800 });
      }, { rot: [0.03, -0.02, 0.025][i] });
    });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    bg(ctx);
    const g = ctx.createRadialGradient(W / 2, 640, 40, W / 2, 640, 620);
    g.addColorStop(0, 'rgba(255,227,170,0.75)'); g.addColorStop(1, 'rgba(255,227,170,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // rays behind the logo
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.18 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#ff7691'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, W / 2, 600, (c) => {
      const s = 330;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 80); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 935 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'כלים למורים ולמורות, במקום אחד', W / 2, 1030, { size: 48, w: 600, color: C.muted, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, W / 2, 1130, (c) => pill(c, 0, 0, 'הכול בחינם', { size: 52, w: 900, bg: C.yellow, seed: 120 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1268, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 121 }));
    he(ctx, 'שמרו את הסרטון לשיעור הבא 📌', W / 2, 1405, { size: 42, w: 700, alpha: UI.fadeIn(t, L[3].t, 0.25) });
    confetti(ctx, t, ev.logo, W / 2, 620, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotQuiz },
    { t0: T(4), fn: shotHW },
    { t0: T(6), fn: shotWheel },
    { t0: T(8), fn: shotPrint },
    { t0: T(10), fn: shotGames },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.printer = await L('img/home-printer.png');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.logo = await L('img/logo.svg');
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        // RTL: the old scene leaves to the right, the new one arrives from the left
        const e = 1 - Math.pow(1 - u, 4); // fast start: the cut reads on the downbeat
        ctx.save(); ctx.translate(e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((e - 1) * W, 0); sec.fn(ctx, t); ctx.restore();
        // a bold colour bar rides the seam
        const f = S.features[i - 1] || { color: C.red };
        ctx.fillStyle = f.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
