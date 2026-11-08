// THE FILM (9:16) — "מה השתנה בתמונה התחתונה?": the online game מצאו את ההבדלים in the site own look. Pure function of t.
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

  // ---------- the game pictures (real levels from src/arcade/logic/spotDiff.js, embedded in score.js) ----------
  // marks: [{x, y, r, color, p}] in panel units (x 0–100, y 0–70)
  function panel(ctx, data, which, x, y, w, marks = []) {
    const k = w / data.W, h = data.H * k;
    G.rrect(ctx, x, y, w, h, 16, { fill: '#fff', lw: 4, seed: 61, stroke: C.ink });
    const items = which === 'base' ? data.base : data.changed;
    ctx.save(); ctx.beginPath(); ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 14); ctx.clip();
    items.forEach((it) => {
      ctx.save(); ctx.translate(x + it.x * k, y + it.y * k); if (it.r) ctx.rotate(it.r * Math.PI / 180);
      ctx.font = `${Math.round(it.s * k)}px "Noto Color Emoji", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000';
      ctx.fillText(it.e, 0, 0); ctx.restore();
    });
    ctx.restore();
    marks.forEach((mk) => {
      const p = clamp(mk.p === undefined ? 1 : mk.p); if (p <= 0) return;
      ctx.save(); ctx.strokeStyle = mk.color || '#e11d48'; ctx.lineWidth = 6; ctx.beginPath();
      ctx.arc(x + mk.x * k, y + mk.y * k, mk.r * k * (1.6 - 0.6 * ease.outCubic(p)), 0, Math.PI * 2 * Math.max(0.01, ease.outCubic(p))); ctx.stroke(); ctx.restore();
    });
    return h;
  }
  const L1 = S.LEVELS[1], L4 = S.LEVELS[4];
  const PW = 560, PH = PW * 0.7; // panel size in the steps

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 260, (c) => pill(c, 0, 0, '🔍 מצאו את ההבדלים', { size: 52, w: 900, bg: C.purple, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 440, (c) => he(c, 'מה השתנה', 0, 0, { size: 170, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q2, W / 2, 595, (c) => he(c, 'בתמונה התחתונה?', 0, 0, { size: 120, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    const hw = 600, hh = hw * 0.7, hx = 940 - hw;
    S.hookOpts.slice(0, 2).forEach((o) => {
      const y = 670 + o.i * (hh + 30);
      popAt(ctx, t, o.t, hx + hw / 2, y + hh / 2, (c) => { c.translate(-hw / 2, -hh / 2 - 0); card(c, 0, 0, hw, hh, { seed: 20 + o.i, shadow: 10, r: 18 }); panel(c, L1, o.i ? 'changed' : 'base', 0, 0, hw); }, { rot: [-0.012, 0.012][o.i], dur: 0.3, over: 1.5 });
    });
    const bp = S.hookOpts[2];
    popAt(ctx, t, bp.t, 170, 800, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(7, 9, 118, 0, Math.PI * 2); c.fill();
      c.fillStyle = C.yellow; c.beginPath(); c.arc(0, 0, 118, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 5; c.stroke();
      he(c, '3', 0, 30, { size: 150, w: 900, color: C.red, dir: 'ltr' });
      he(c, 'הבדלים', 0, 78, { size: 44, w: 900 });
    }, { rot: -0.08, dur: 0.35, over: 2 });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(600, 1625); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'כמה מצאתם? 🤔', { size: 58, w: 900, bg: C.yellow, padX: 40 });
      ctx.restore();
    }
    mascot(ctx, 150, 1330 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 270, t, ev.q2);
  }

  // ================= 1. 18 LEVELS =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    popAt(ctx, t, T(2, 0.1), W / 2, 850, (c) => {
      card(c, -400, -330, 800, 640, { seed: 31, shadow: 14, r: 30 });
      he(c, '🔍 מצאו את ההבדלים', 340, -245, { size: 52, w: 900, align: 'right', maxW: 600 });
    }, { dur: 0.35, over: 1.5, rot: 0.01 });
    const open = t >= S.ev.pick;
    for (let r = 0; r < 3; r++) {
      const it = S.AUD[r];
      for (let c = 0; c < 6; c++) {
        const lv = r * 6 + c + 1, x = 860 - c * 128, y = 700 + r * 170;
        popAt(ctx, t, it.t + c * 0.05, x - 400 + 400 + 0, y, (cc) => {
          const ok = lv === 1;
          G.rrect(cc, -52, -58, 104, 116, 22, { fill: ok ? (open ? C.green : C.yellow) : '#f1f3f8', lw: ok ? 4 : 3, seed: 100 + lv, stroke: ok ? C.ink : C.line });
          he(cc, ok ? S.THEME_ICONS[0] : '🔒', 0, -4, { size: 42, w: 600, dir: 'ltr' });
          he(cc, String(lv), 0, 40, { size: 38, w: 900, color: ok && open ? '#fff' : (ok ? C.ink : C.muted), dir: 'ltr' });
        }, { dur: 0.22, over: 1.5 });
      }
    }
    UI.tap(ctx, 860, 720, t, S.ev.pick, { color: 'rgba(35,135,77,0.8)', size: 130 });
    popAt(ctx, t, T(3, 0.2), W / 2, 1295, (c) => pill(c, 0, 0, '⁦3–7⁩ הבדלים בכל שלב', { size: 52, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(3, 3), W / 2, 1430, (c) => pill(c, 0, 0, 'חיות, חלל, ים, יום הולדת ועוד', { size: 46, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 2. TAP WHAT CHANGED =================
  function hud(ctx, t, found, total, y) {
    const items = [['שלב', '4'], ['🔎', `${found}/${total}`], ['⏱️', '21'], ['❌', '0']];
    items.forEach(([a, b], i) => {
      const x = 880 - i * 190;
      G.rrect(ctx, x - 80, y - 36, 160, 72, 36, { fill: '#fff', lw: 3, seed: 130 + i, stroke: C.ink });
      he(ctx, `${a} ${b}`, x, y + 14, { size: 38, w: 800, dir: 'ltr', maxW: 140 });
    });
  }
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const found = t >= S.ev.topic ? 1 : 0, fp = clamp((t - S.ev.topic) / 0.4);
    hud(ctx, t, found, 4, 520);
    const D = L4.diffs;
    const marks = found ? [{ ...D[0], p: fp }] : [];
    S.TOPICS.forEach((o) => {
      const y = 600 + o.i * (PH + 36);
      popAt(ctx, t, o.t, W / 2, y + PH / 2, (c) => { c.translate(-PW / 2, -PH / 2); card(c, 0, 0, PW, PH, { seed: 50 + o.i, shadow: 10, r: 18 }); panel(c, L4, o.i ? 'changed' : 'base', 0, 0, PW, marks); }, { rot: [0.006, -0.006][o.i], dur: 0.3, over: 1.4 });
    });
    const D0 = D[0], k = PW / 100;
    UI.tap(ctx, W / 2 - PW / 2 + D0.x * k, 600 + PH + 36 + D0.y * k, t, S.ev.topic, { color: 'rgba(207,47,86,0.8)', size: 130 });
    he(ctx, found ? 'נשארו עוד 3 הבדלים' : 'נשארו עוד 4 הבדלים', W / 2, 1490, { size: 46, w: 800, color: C.muted, alpha: UI.fadeIn(t, T(4, 2), 0.25) });
    popAt(ctx, t, T(5, 1.8), W / 2, 1590, (c) => pill(c, 0, 0, 'ההבדל מסומן בשתי התמונות', { size: 46, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 3. FOUR KINDS =================
  const KINDS = [
    { label: 'חסר פריט', color: '#ffe1e6', draw: (c, p) => { he(c, '🦁', -90, 18, { size: 76, dir: 'ltr' }); he(c, '→', 0, 14, { size: 46, w: 900, color: C.muted, dir: 'ltr' }); c.strokeStyle = C.muted; c.setLineDash([8, 8]); c.lineWidth = 3; c.beginPath(); c.arc(90, 0, 36, 0, 7); c.stroke(); c.setLineDash([]); } },
    { label: 'פריט אחר', color: '#dbe9ff', draw: (c) => { he(c, '🐸', -90, 18, { size: 76, dir: 'ltr' }); he(c, '→', 0, 14, { size: 46, w: 900, color: C.muted, dir: 'ltr' }); he(c, '🐢', 90, 18, { size: 76, dir: 'ltr' }); } },
    { label: 'פריט בגודל אחר', color: '#efe4ff', draw: (c) => { he(c, '🐘', -90, 28, { size: 84, dir: 'ltr' }); he(c, '→', 0, 14, { size: 46, w: 900, color: C.muted, dir: 'ltr' }); he(c, '🐘', 90, 18, { size: 46, dir: 'ltr' }); } },
    { label: 'פריט נוסף', color: '#dff3e5', draw: (c) => { c.strokeStyle = C.muted; c.setLineDash([8, 8]); c.lineWidth = 3; c.beginPath(); c.arc(-90, 0, 36, 0, 7); c.stroke(); c.setLineDash([]); he(c, '→', 0, 14, { size: 46, w: 900, color: C.muted, dir: 'ltr' }); he(c, '🦋', 90, 18, { size: 76, dir: 'ltr' }); } },
  ];
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    S.MODES.forEach((o) => {
      const col = o.i % 2, row = Math.floor(o.i / 2), cx = 740 - col * 440 + (col ? 0 : 0), cy = 700 + row * 360, kd = KINDS[o.i];
      popAt(ctx, t, o.t, cx - (col ? 0 : 0), cy, (c) => {
        card(c, -205, -155, 410, 310, { fill: kd.color, seed: 140 + o.i, shadow: 10, r: 30 });
        he(c, kd.label, 0, -80, { size: 46, w: 900, maxW: 370 });
        c.save(); c.translate(0, 55); kd.draw(c); c.restore();
      }, { rot: [0.012, -0.012, -0.01, 0.01][o.i], dur: 0.3, over: 1.6 });
    });
    popAt(ctx, t, T(7, 0.2), W / 2, 1330, (c) => pill(c, 0, 0, 'עוברים שורה אחרי שורה', { size: 52, w: 900, bg: C.lilac, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(7, 3), W / 2, 1460, (c) => pill(c, 0, 0, 'ומשווים כל פריט לפריט שמולו', { size: 46, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 4. HINT =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const D = L4.diffs, tm = Math.round(lerp(7, 10, clamp((t - T(8, 0)) / (BEAT * 1.0)))), hintOn = t >= S.ev.ans;
    const items = [['שלב', '4'], ['🔎', '1/4'], ['⏱️', String(t >= S.ev.go ? 10 : tm)], ['❌', '0']];
    items.forEach(([a, b], i) => {
      const x = 880 - i * 190; G.rrect(ctx, x - 80, 484, 160, 72, 36, { fill: '#fff', lw: 3, seed: 130 + i, stroke: C.ink }); he(ctx, `${a} ${b}`, x, 534, { size: 38, w: 800, dir: 'ltr', maxW: 140 });
    });
    const bulbOn = t >= T(8, 0.9);
    const bp = UI.pop(t, T(8, 0.9), 0.25, 1.8);
    G.rrect(ctx, 80, 484, 84, 72, 36, { fill: bulbOn ? C.yellow : '#eceff5', lw: 3, seed: 160, stroke: bulbOn ? C.ink : C.line });
    he(ctx, '💡', 122, 535, { size: 40, dir: 'ltr', alpha: bulbOn ? 1 : 0.4 });
    const found = [D[0]], hp = clamp((t - S.ev.ans) / 0.4);
    const marks = [{ ...found[0], p: 1 }];
    if (hintOn) marks.push({ ...D[2], r: D[2].r * 1.8, color: '#f59e0b', p: hp });
    popAt(ctx, t, T(8, 0.1), W / 2, 600 + PH / 2, (c) => { c.translate(-PW / 2, -PH / 2); card(c, 0, 0, PW, PH, { seed: 50, shadow: 10, r: 18 }); panel(c, L4, 'base', 0, 0, PW, marks); }, { rot: 0.006, dur: 0.3, over: 1.4 });
    popAt(ctx, t, T(8, 0.2), W / 2, 600 + PH + 36 + PH / 2, (c) => { c.translate(-PW / 2, -PH / 2); card(c, 0, 0, PW, PH, { seed: 51, shadow: 10, r: 18 }); panel(c, L4, 'changed', 0, 0, PW, marks); }, { rot: -0.006, dur: 0.3, over: 1.4 });
    UI.tap(ctx, 122, 520, t, S.ev.go, { color: 'rgba(224,138,0,0.8)', size: 130 });
    he(ctx, hintOn ? '💡 יש הבדל בתוך העיגול הכתום' : 'נשארו עוד 3 הבדלים', W / 2, 1490, { size: 46, w: 800, color: hintOn ? C.orange : C.muted });
    popAt(ctx, t, T(9, 0.7), W / 2, 1590, (c) => pill(c, 0, 0, 'ההבדל הבא מסומן בכתום', { size: 46, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, T(9, 2), W / 2, 1690, (c) => pill(c, 0, 0, 'ללא לחץ, בקצב של הילד', { size: 42, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 5. STARS =================
  function star(ctx, cx, cy, r, fill) {
    ctx.save(); ctx.translate(cx, cy); ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
  }
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const SI = S.sheetItems;
    popAt(ctx, t, SI[0].t, W / 2, 900, (c) => {
      card(c, -400, -330, 800, 660, { seed: 91, shadow: 14, r: 34 });
      he(c, '🎉 מצאתם את כל ההבדלים!', 0, -210, { size: 56, w: 900, maxW: 740 });
      he(c, '⁦32⁩ שניות, בלי טעויות.', 0, 150, { size: 46, w: 600, color: C.muted, maxW: 740 });
      G.rrect(c, 20, 195, 340, 90, 45, { fill: C.blue, lw: 4, seed: 92, stroke: C.ink });
      he(c, '▶ לשלב 5', 190, 255, { size: 44, w: 900, color: '#fff' });
      G.rrect(c, -360, 195, 360, 90, 45, { fill: '#fff', lw: 4, seed: 93, stroke: C.ink });
      he(c, '📱 אתגרו חבר', -180, 255, { size: 44, w: 900, maxW: 330 });
    }, { dur: 0.35, over: 1.4, rot: 0.008 });
    for (let i = 0; i < 3; i++) {
      const it = SI[i + 1];
      popAt(ctx, t, it.t, 540 + (1 - i) * 220, 790, (c) => star(c, 0, 0, 100, '#ffc83d'), { dur: 0.3, over: 2.4, rot: [-0.1, 0.05, 0.1][i] });
    }
    UI.tap(ctx, 540 + 190 - 0, 1160, t, S.ev.printBtn, { color: 'rgba(35,135,77,0.8)', size: 130 });
    popAt(ctx, t, T(10, 3), W / 2, 1370, (c) => pill(c, 0, 0, '3 כוכבים: מהר, בלי רמזים', { size: 48, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1490, (c) => pill(c, 0, 0, 'אפשר גם להדפיס, עם פתרון', { size: 46, w: 900, bg: C.lilac, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1610, (c) => pill(c, 0, 0, '🖨️ דפי הדפסה לפי נושא', { size: 48, w: 900, bg: C.red, fg: '#fff', seed: 68, maxW: SAFE.w }), { rot: -0.025 });
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
    he(ctx, 'מצאו את ההבדלים: משחק לכל המשפחה', W / 2, 1000, { size: 54, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בדף משחקים אונליין: מצאו את ההבדלים', W / 2, 1350, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
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
