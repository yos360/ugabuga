// THE FILM (16:9 tutorial) — "מקלדת עברית אונליין": the site's keyboard card on the left, the step
// header (badge, title, subtitle) and a tip on the right. Site look: paper + dot grid, ink-outlined cards
// with an offset shadow, Heebo; real characters only (no caveman). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff', key: '#f6f7fb', wa: '#25d366' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // layout: demo card on the left, the step panel on the right (RTL: it is read first)
  const DX = 70, DY = 70, DW = 1190, DH = 940;
  const PX0 = 1320, PX1 = 1862, PW = PX1 - PX0, PC = (PX0 + PX1) / 2;

  // ---------- text ----------
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", "Segoe UI Emoji", sans-serif`;
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
  function wrap(ctx, str, size, w, weight = 500, max = 3) {
    const words = str.split(' '), lines = []; let cur = '';
    for (const wd of words) { const tryS = cur ? cur + ' ' + wd : wd; if (measure(ctx, tryS, size, weight) > w && cur) { lines.push(cur); cur = wd; } else cur = tryS; }
    if (cur) lines.push(cur); return lines.slice(0, max);
  }
  function card(ctx, x, y, w, h, { fill = C.card, r = 30, seed = 1, shadow = 12, lw = 4.5, stroke = C.ink, shadowColor = C.ink } = {}) {
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
  const mix = (hex, k) => { // hex colour mixed with white, k = share of the colour
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return `rgb(${Math.round(255 + (r - 255) * k)},${Math.round(255 + (g - 255) * k)},${Math.round(255 + (b - 255) * k)})`;
  };

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

  // ---------- the step panel (right): badge + title + subtitle, then a tip card and a character ----------
  function header(ctx, t, f) {
    popAt(ctx, t, f.t, PX1 - 54, 150, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 54, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 54, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, 23, { size: 66, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, PX1 - 130 + dx, 176, { size: 70, w: 900, align: 'right', alpha: a, maxW: PW - 130 });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = PX1 - 130, len = Math.min(measure(ctx, f.title, 70, 900), PW - 130) * u;
      G.line(ctx, [[x1, 200], [x1 - len, 204]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
    const sa = UI.fadeIn(t, f.t + 0.2, 0.25);
    wrap(ctx, f.sub, 40, PW, 500).forEach((ln, k) => he(ctx, ln, PX1, 290 + k * 54, { size: 40, w: 500, color: C.muted, align: 'right', alpha: sa }));
  }
  // a tip card in the right panel, under the subtitle
  function tip(ctx, t, t0, title, note, { y = 520, color = C.yellow, seed = 300 } = {}) {
    popAt(ctx, t, t0, PC, y, (c) => {
      const lines = note ? wrap(c, note, 32, PW - 70, 500, 3) : [];
      const h = 96 + lines.length * 42;
      card(c, -PW / 2, -48, PW, h, { fill: color, r: 26, seed, shadow: 8, lw: 3.5 });
      he(c, title, PW / 2 - 34, 14, { size: 42, w: 900, align: 'right', maxW: PW - 68 });
      lines.forEach((ln, k) => he(c, ln, PW / 2 - 34, 64 + k * 42, { size: 32, w: 500, color: C.ink, align: 'right' }));
    }, { rot: -0.015 });
  }
  function character(ctx, t, t0, im, { h = 300, rot = 0.03, flip = false } = {}) {
    const p = ease.outBack(clamp((t - t0) / 0.45), 1.5);
    if (p > 0) img(ctx, im, PC + 60, 1060 + (1 - p) * 400 - hop(t, 10), h, { rot, flip });
  }

  // ---------- the site's keyboard card ----------
  const KB = { x: DX + 34, w: DW - 68, y: DY + 330, kh: 74, gap: 9 };
  // key rects, laid out like the page: flex-grow by MOD width, dir=ltr
  const keyRects = (() => {
    const out = {};
    S.KEYS.forEach((row, r) => {
      const units = row.reduce((s, [code]) => s + (S.MOD[code] ? S.MOD[code][1] : 1), 0);
      const free = KB.w - (row.length - 1) * KB.gap;
      let x = KB.x;
      row.forEach(([code, ch]) => {
        const kw = free * (S.MOD[code] ? S.MOD[code][1] : 1) / units;
        out[code] = { x, y: KB.y + r * (KB.kh + KB.gap), w: kw, h: KB.kh, ch, mod: S.MOD[code] };
        x += kw + KB.gap;
      });
    });
    return out;
  })();
  const LATIN = (code) => (/^Key[A-Z]$/.test(code) ? code.slice(3) : null);
  const keyCenter = (code) => { const k = keyRects[code]; return [k.x + k.w / 2, k.y + k.h / 2]; };

  function keyboard(ctx, t, { lit = null, litT = -9, fingers = 0 } = {}) {
    for (const code in keyRects) {
      const k = keyRects[code];
      const on = lit === code && t - litT < 0.35;
      const f = S.FINGER_OF[code] || (code === 'ShiftRight' ? 'RP' : null);
      let fill = k.mod ? '#eceef5' : C.key;
      if (fingers > 0 && f) fill = mix(S.FINGERS[f].color, (on ? 1 : 0.55) * fingers);
      else if (on) fill = '#cfe0ff';
      const press = on ? 1 - 0.06 * pulse(t, litT, 10) : 1;
      ctx.save(); ctx.translate(k.x + k.w / 2, k.y + k.h / 2); ctx.scale(press, press);
      ctx.fillStyle = on ? C.ink : '#c9cfdf'; ctx.beginPath(); ctx.roundRect(-k.w / 2, -k.h / 2 + 4, k.w, k.h, 12); ctx.fill();
      ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(-k.w / 2, -k.h / 2, k.w, k.h, 12); ctx.fill();
      ctx.strokeStyle = on ? C.ink : '#b9c0d4'; ctx.lineWidth = on ? 3.5 : 2; ctx.stroke();
      if (k.mod) {
        const s = k.mod[0];
        he(ctx, s, 0, 10, { size: 26, w: 700, color: C.ink, dir: /[א-ת]/.test(s) ? 'rtl' : 'ltr', maxW: k.w - 14 });
      } else {
        const lat = LATIN(code);
        he(ctx, k.ch, lat ? 6 : 0, lat ? 6 : 12, { size: 34, w: 800, dir: 'ltr' });
        if (lat) he(ctx, lat, -k.w / 2 + 16, k.h / 2 - 9, { size: 19, w: 700, color: C.muted, dir: 'ltr' });
      }
      if (code === 'KeyF' || code === 'KeyJ') { ctx.fillStyle = C.ink; ctx.fillRect(-8, k.h / 2 - 9, 16, 3); }
      ctx.restore();
    }
  }
  // the toolbar: the language switch (radio) + the page's buttons, right to left
  const TOOLS = ['🖐️ צבעי אצבעות', '😀 אימוג׳ים', '🎵 מוזיקה', 'א-', 'א+'];
  function toolbarRects(ctx) {
    const y = DY + 34, h = 62, out = {};
    let x = DX + DW - 34;
    const segW = [['עברית', 'he'], ['English', 'en']].map(([s]) => measure(ctx, s, 30, 800) + 44);
    out.he = { x: x - segW[0], y, w: segW[0], h }; x -= segW[0];
    out.en = { x: x - segW[1], y, w: segW[1], h }; x -= segW[1] + 18;
    TOOLS.forEach((s, i) => { const w = measure(ctx, s, 28, 700) + 40; out['tool' + i] = { x: x - w, y, w, h, s }; x -= w + 12; });
    return out;
  }
  function toolbar(ctx, t, { langOn = true, toolOn = {} } = {}) {
    const R = toolbarRects(ctx);
    // segmented control
    G.rrect(ctx, R.en.x, R.en.y, R.en.w + R.he.w, R.he.h, 31, { fill: '#fff', lw: 3, seed: 401, stroke: C.ink });
    if (langOn) G.rrect(ctx, R.he.x + 4, R.he.y + 4, R.he.w - 8, R.he.h - 8, 27, { fill: C.blue, lw: 0, seed: 402, stroke: C.blue });
    he(ctx, 'עברית', R.he.x + R.he.w / 2, R.he.y + 42, { size: 30, w: 800, color: langOn ? '#fff' : C.ink });
    he(ctx, 'English', R.en.x + R.en.w / 2, R.en.y + 42, { size: 30, w: 800, dir: 'ltr' });
    TOOLS.forEach((s, i) => {
      const r = R['tool' + i], on = toolOn[i];
      G.rrect(ctx, r.x, r.y, r.w, r.h, 18, { fill: on ? '#fff4bb' : '#fff', lw: on ? 4 : 2.5, seed: 410 + i, stroke: on ? C.ink : C.line });
      he(ctx, s, r.x + r.w / 2, r.y + 41, { size: 28, w: 700 });
    });
    return R;
  }
  const NIQ_RE = /[֑-ׇ]/g;
  function textarea(ctx, t, text, { meta = true, hint = null, placeholder = false } = {}) {
    const x = DX + 34, y = DY + 120, w = DW - 68, h = 150;
    G.rrect(ctx, x, y, w, h, 16, { fill: '#fbfcff', lw: 3, seed: 420, stroke: '#b9c0d4' });
    if (placeholder && !text) he(ctx, 'מקלידים כאן… גם אם המחשב באנגלית, יוצאת עברית', x + w - 28, y + 62, { size: 32, w: 400, color: '#9aa0b8', align: 'right' });
    else he(ctx, text, x + w - 28, y + 78, { size: 60, w: 700, align: 'right', maxW: w - 60 });
    // the caret, left of the text
    if (Math.floor(t * 2.2) % 2 === 0) {
      const tw = text ? Math.min(measure(ctx, text, 60, 700), w - 60) : 0;
      ctx.fillStyle = C.ink; ctx.fillRect(x + w - 34 - tw, y + 26, 4, 66);
    }
    if (!meta) return;
    const t2 = text.trim(), words = t2 ? t2.split(/\s+/).length : 0, chars = [...text.replace(NIQ_RE, '')].length;
    he(ctx, `${words} מילים · ${chars} תווים`, x + w, y + h + 40, { size: 28, w: 500, color: C.muted, align: 'right' });
    if (hint) {
      const s = `„${hint.ch}” מקלידים ב${S.FINGERS[hint.finger].name}`;
      const sw = measure(ctx, s, 30, 700);
      const hx = x + w - 300;
      ctx.fillStyle = S.FINGERS[hint.finger].color; ctx.beginPath(); ctx.arc(hx - 4, y + h + 30, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
      he(ctx, s, hx - 28, y + h + 40, { size: 30, w: 700, align: 'right' });
      return sw;
    }
  }
  function siteCard(ctx) { card(ctx, DX, DY, DW, DH, { seed: 400, r: 30 }); }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const X = 1240;
    he(ctx, 'המחשב באנגלית…', X, 250, { size: 84, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2) });
    popAt(ctx, t, ev.q2, X, 410, (c) => he(c, 'איך כותבים עברית?', 0, 0, { size: 132, w: 900, color: C.red }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 590, (c) => pill(c, 0, 0, 'מקלדת עברית אונליין ⌨️', { size: 76, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 12 }), { rot: -0.02, dur: 0.35 });
    // key caps: the English key and the Hebrew letter it types
    [['A', 'ש'], ['K', 'ל'], ['U', 'ו'], ['O', 'ם']].forEach(([lat, heb], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 270 - i * 180;
      popAt(ctx, t, t0, x, 790, (c) => {
        const flip = clamp((t - t0 - 0.35) / 0.2);
        c.fillStyle = C.ink; c.beginPath(); c.roundRect(-70 + 6, -70 + 8, 140, 140, 22); c.fill();
        c.fillStyle = flip > 0.5 ? '#e3f6ea' : '#fff'; c.beginPath(); c.roundRect(-70, -70, 140, 140, 22); c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
        c.save(); c.scale(1, Math.abs(1 - 2 * flip) || 0.01);
        if (flip < 0.5) he(c, lat, 0, 30, { size: 84, w: 800, dir: 'ltr', fam: 'Fredoka' });
        else he(c, heb, 0, 30, { size: 88, w: 900, color: C.green });
        c.restore();
      }, { rot: [-0.04, 0.03, -0.02, 0.04][i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(X, 960); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחינם, בלי להתקין כלום', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    const bp = ease.outBack(clamp((t - ev.q1 - 0.1) / 0.5), 1.5);
    if (bp > 0) img(ctx, IMG.mascot, 380, 1050 + (1 - bp) * 600 - hop(t, 14), 720, { rot: -0.03 });
  }

  // ================= 1. TYPING =================
  function lastOf(list, t) { let r = null; for (const p of list) if (t >= p.t) r = p; return r; }
  function shotType(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    siteCard(ctx);
    const R = toolbar(ctx, t, { langOn: t >= T(2, 0.75) });
    UI.tap(ctx, R.he.x + R.he.w / 2, R.he.y + 31, t, T(2, 0.75), { color: 'rgba(34,107,215,0.8)', size: 100 });
    const typed = S.presses.filter((p) => t >= p.t).map((p) => p.ch).join('');
    textarea(ctx, t, typed, { placeholder: true });
    const lp = lastOf(S.presses, t);
    keyboard(ctx, t, { lit: lp && lp.code, litT: lp ? lp.t : -9 });
    // the English key pressed on the real keyboard → the Hebrew letter it writes
    if (lp && lp.code !== 'Space' && t - lp.t < 0.5) {
      const [kx, ky] = keyCenter(lp.code);
      popAt(ctx, t, lp.t, kx, ky - 92, (c) => pill(c, 0, 0, `${lp.code.slice(3)} ← ${lp.ch}`, { size: 34, w: 800, bg: '#fff', padX: 20, shadow: 5, dir: 'ltr', seed: 430 + lp.i }), { dur: 0.2 });
    }
    // the bottom strip of the card
    he(ctx, '⌨️ מקלידים במקלדת של המחשב, או לוחצים על המקשים בעכבר', DX + DW / 2, DY + DH - 60, { size: 32, w: 600, color: C.muted, alpha: UI.fadeIn(t, T(3, 3), 0.3) });
    tip(ctx, t, ev.hint, 'A כותב ש׳ · T כותב א׳', 'כל מקש כותב את האות שמודפסת עליו במקלדת ישראלית. מתאים גם למחשבים בחו״ל', { seed: 301 });
    character(ctx, t, T(2, 1), IMG.boy, { h: 290 });
  }

  // ================= 2. NIQQUD =================
  function chipRects() {
    const out = [], cols = 8, gap = 10, w = (KB.w - (cols - 1) * gap) / cols, h = 70, y0 = DY + 770;
    S.NIQQUD.forEach((n, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      out.push({ x: KB.x + KB.w - (c + 1) * w - c * gap, y: y0 + r * (h + 10), w, h, n });
    });
    return out;
  }
  function shotNiqqud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    siteCard(ctx);
    toolbar(ctx, t);
    const text = S.niqSeq.filter((s) => t >= s.t).map((s) => s.add).join('');
    textarea(ctx, t, text);
    const lk = lastOf(S.niqSeq.filter((s) => s.kind === 'key'), t);
    keyboard(ctx, t, { lit: lk && lk.code, litT: lk ? lk.t : -9 });
    const chips = chipRects();
    he(ctx, 'ניקוד:', KB.x + KB.w, chips[0].y - 14, { size: 26, w: 900, align: 'right', color: C.muted });
    const lc = lastOf(S.niqSeq.filter((s) => s.kind === 'chip'), t);
    chips.forEach((r, i) => {
      const on = lc && lc.chip === i && t - lc.t < 0.6;
      const press = on ? 1 - 0.08 * pulse(t, lc.t, 10) : 1;
      ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(press, press);
      G.rrect(ctx, -r.w / 2, -r.h / 2, r.w, r.h, 14, { fill: on ? '#ffe3ea' : '#fff', lw: on ? 4 : 2.5, seed: 440 + i, stroke: on ? C.red : C.line });
      he(ctx, r.n.glyph, 0, 4, { size: 36, w: 700 });
      he(ctx, r.n.name, 0, 28, { size: 17, w: 600, color: C.muted, maxW: r.w - 10 });
      ctx.restore();
    });
    S.niqSeq.forEach((s) => {
      if (s.kind === 'chip') { const r = chips[s.chip]; UI.tap(ctx, r.x + r.w / 2, r.y + r.h / 2, t, s.t, { color: 'rgba(207,47,86,0.8)', size: 100 }); }
      else { const [kx, ky] = keyCenter(s.code); UI.tap(ctx, kx, ky, t, s.t, { color: 'rgba(34,107,215,0.7)', size: 90 }); }
    });
    tip(ctx, t, T(6, 2), 'וּ  וֹ  בלחיצה אחת', 'שורוק וחולם מלא, שי״ן ושׂי״ן, דגש וחטפים', { seed: 302, color: C.blush });
    popAt(ctx, t, ev.remove, PC, 790, (c) => pill(c, 0, 0, 'הסרת ניקוד ← בלחיצה', { size: 38, w: 800, bg: '#fff', seed: 303 }), { rot: 0.02 });
    character(ctx, t, T(5, 1), IMG.girl, { h: 230 });
  }

  // ================= 3. SYMBOLS + EMOJI =================
  function shotSymbols(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    siteCard(ctx);
    const emojiOn = t >= ev.emojiBtn;
    const R = toolbar(ctx, t, { toolOn: { 1: emojiOn } });
    let text = 'מזל טוב';
    if (t >= S.symTaps[0].t) text += S.symTaps[0].add;
    if (t >= ev.cake) text += '🎂';
    textarea(ctx, t, text);
    keyboard(ctx, t);
    // symbols row under the keyboard
    const n = S.SYMBOLS.length, gap = 8, sw = (KB.w - 110 - (n - 1) * gap) / n, sy = DY + 800;
    he(ctx, 'סימנים:', KB.x + KB.w, sy + 44, { size: 26, w: 900, align: 'right', color: C.muted });
    const tap = S.symTaps[0];
    S.SYMBOLS.forEach((s, i) => {
      const x = KB.x + KB.w - 110 - (i + 1) * sw - i * gap;
      const on = i === tap.sym && t >= tap.t && t - tap.t < 0.6;
      const glow = (i === 1 || i === 2 || i === 4) && t >= T(8, 0.5) && t < T(8, 1.75); // ₪ ״ ־
      G.rrect(ctx, x, sy, sw, 66, 14, { fill: on ? '#ffe3ea' : glow ? '#fff4bb' : '#fff', lw: on || glow ? 3.5 : 2.5, seed: 460 + i, stroke: on ? C.red : glow ? C.ink : C.line });
      he(ctx, s, x + sw / 2, sy + 46, { size: 34, w: 700, dir: /[א-ת]/.test(s) ? 'rtl' : 'ltr' });
      if (i === tap.sym) UI.tap(ctx, x + sw / 2, sy + 33, t, tap.t, { color: 'rgba(207,47,86,0.8)', size: 100 });
    });
    UI.tap(ctx, R.tool1.x + R.tool1.w / 2, R.tool1.y + 31, t, ev.emojiBtn, { color: 'rgba(138,79,216,0.8)', size: 100 });
    // the emoji panel (EmojiPicker) opens over the keyboard
    const ep = ease.outBack(clamp((t - ev.emojiBtn - 0.1) / 0.35), 1.3);
    if (ep > 0) {
      const px = KB.x + 40, py = KB.y - 20, pw = KB.w - 80, ph = 400;
      ctx.save(); ctx.translate(px + pw / 2, py); ctx.scale(ep, ep); ctx.translate(-(px + pw / 2), -py);
      card(ctx, px, py, pw, ph, { seed: 470, r: 24, shadow: 10, lw: 4 });
      // search box: the placeholder, then "יום הולדת" typed
      G.rrect(ctx, px + 24, py + 24, pw - 48, 70, 35, { fill: '#fbfcff', lw: 3, seed: 471, stroke: '#b9c0d4' });
      const k = Math.floor(clamp((t - ev.search) / (BEAT * 1.5)) * S.SEARCH.length);
      if (t < ev.search) he(ctx, '🔎 חיפוש בעברית: לב, חתול, יום הולדת, מזל טוב…', px + pw - 50, py + 70, { size: 30, w: 400, color: '#9aa0b8', align: 'right' });
      else he(ctx, '🔎 ' + S.SEARCH.slice(0, Math.max(1, k)), px + pw - 50, py + 72, { size: 36, w: 700, align: 'right' });
      // the category tabs, dimmed while searching
      S.EMOJI_TABS.forEach((e, i) => he(ctx, e, px + pw - 70 - i * 92, py + 160, { size: 44, w: 400, alpha: t >= ev.search ? 0.35 : 1 }));
      // results
      if (k >= S.SEARCH.length - 1) {
        S.FOUND.forEach(([e], i) => {
          const bx = px + pw - 150 - i * 140, by = py + 210;
          const on = i === 1 && t >= ev.cake && t - ev.cake < 0.6;
          popAt(ctx, t, ev.search + BEAT * 1.5 + i * 0.12, bx + 55, by + 55, (c) => {
            G.rrect(c, -55, -55, 110, 110, 18, { fill: on ? '#f4edff' : '#fff', lw: on ? 4 : 2.5, seed: 480 + i, stroke: on ? C.purple : C.line });
            he(c, e, 0, 24, { size: 66, w: 400 });
          });
          if (i === 1) UI.tap(ctx, bx + 55, by + 55, t, ev.cake, { color: 'rgba(138,79,216,0.8)', size: 120 });
        });
      }
      ctx.restore();
    }
    tip(ctx, t, T(8, 1), '₪  ״  ׳  ־', 'שקל, גרשיים וגרש אמיתיים ומקף עברי — סימנים שאין במקלדת רגילה', { seed: 304 });
    popAt(ctx, t, ev.cake + 0.2, PC, 800, (c) => pill(c, 0, 0, 'חיפוש אימוג׳ים בעברית 🎂', { size: 32, w: 800, bg: C.lilac, seed: 305 }), { rot: 0.02 });
    character(ctx, t, T(8, 1), IMG.bday, { h: 220 });
  }

  // ================= 4. FINGER COLOURS =================
  function shotFingers(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    siteCard(ctx);
    const on = t >= ev.fingersOn;
    const R = toolbar(ctx, t, { toolOn: { 0: on } });
    UI.tap(ctx, R.tool0.x + R.tool0.w / 2, R.tool0.y + 31, t, ev.fingersOn, { color: 'rgba(35,135,77,0.8)', size: 100 });
    const lp = lastOf(S.fingerPresses, t);
    const text = S.fingerPresses.filter((p) => t >= p.t).map((p) => (p.code === 'Space' ? ' ' : p.ch)).join('');
    textarea(ctx, t, text, { hint: lp ? { ch: lp.ch, finger: lp.finger } : null });
    keyboard(ctx, t, { lit: lp && lp.code, litT: lp ? lp.t : -9, fingers: ease.outCubic(clamp((t - ev.fingersOn) / 0.5)) });
    S.fingerPresses.forEach((p) => { const [kx, ky] = keyCenter(p.code); UI.tap(ctx, kx, ky, t, p.t, { color: 'rgba(20,22,45,0.6)', size: 90 }); });
    // the finger legend under the keyboard (typingData FINGERS)
    const legend = ['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP'];
    const la = UI.fadeIn(t, ev.fingersOn + 0.3, 0.3);
    legend.forEach((f, i) => {
      const lw = KB.w / 8, x = KB.x + KB.w - (i + 1) * lw + lw / 2, y = DY + 810; // the page reads right to left; left hand on the left
      const xx = KB.x + (i + 0.5) * lw;
      ctx.save(); ctx.globalAlpha = la;
      ctx.fillStyle = S.FINGERS[f].color; ctx.beginPath(); ctx.roundRect(xx - lw / 2 + 6, y, lw - 12, 58, 14); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      he(ctx, S.FINGERS[f].name, xx, y + 38, { size: 22, w: 700, alpha: la, maxW: lw - 20 });
      void x;
    });
    tip(ctx, t, ev.course, '⌨️ הקלדה עיוורת בעברית', '25 שיעורים משורת הבית ועד משפטים שלמים — באותם צבעים', { seed: 306, color: '#e3f6ea' });
    character(ctx, t, T(11, 1), IMG.printer, { h: 230 });
  }

  // ================= 5. COPY + SEND =================
  function actionRects(ctx) {
    const y = DY + 800, h = 72, gap = 14, out = [];
    let x = KB.x + KB.w;
    S.ACTIONS.forEach((s, i) => { const w = measure(ctx, s, 30, 800) + 52; out.push({ x: x - w, y, w, h, s, i }); x -= w + gap; });
    return out;
  }
  function shotSend(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    siteCard(ctx);
    toolbar(ctx, t);
    const text = 'מזל טוב ❤️🎂';
    textarea(ctx, t, text);
    keyboard(ctx, t);
    actionRects(ctx).forEach((r) => {
      const copied = r.i === 0 && t >= ev.copy && t < ev.copy + 1.8; // the page shows "✔ הועתק!" for 1.8s
      const isWa = r.i === 1, waOn = isWa && t >= ev.wa && t - ev.wa < 0.6;
      const primary = r.i === 0;
      const press = (r.i === 0 && t >= ev.copy) ? 1 - 0.07 * pulse(t, ev.copy, 10) : waOn ? 1 - 0.07 * pulse(t, ev.wa, 10) : 1;
      ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(press, press);
      G.rrect(ctx, -r.w / 2, -r.h / 2, r.w, r.h, 20, { fill: primary ? (copied ? C.green : C.blue) : isWa ? '#e3f9ea' : '#fff', lw: 3.5, seed: 500 + r.i, stroke: C.ink });
      he(ctx, copied ? '✔ הועתק!' : r.s, 0, 11, { size: 30, w: 800, color: primary ? '#fff' : C.ink });
      ctx.restore();
    });
    const A = actionRects(ctx);
    UI.tap(ctx, A[0].x + A[0].w / 2, A[0].y + 36, t, ev.copy, { color: 'rgba(34,107,215,0.8)', size: 110 });
    UI.tap(ctx, A[1].x + A[1].w / 2, A[1].y + 36, t, ev.wa, { color: 'rgba(37,211,102,0.85)', size: 110 });
    he(ctx, '🔁 כתבתי בשפה הלא נכונה', KB.x + KB.w, DY + 915, { size: 28, w: 700, color: C.blue, align: 'right', alpha: UI.fadeIn(t, T(14, 1), 0.3) });
    // the message lands in a WhatsApp chat bubble
    popAt(ctx, t, ev.wa + 0.25, DX + 330, DY + 400, (c) => {
      card(c, -250, -80, 500, 160, { fill: '#dcf8c6', r: 26, seed: 510, shadow: 9, lw: 3.5 });
      he(c, 'מזל טוב ❤️🎂', 210, 6, { size: 50, w: 700, align: 'right' });
      he(c, 'נשלח ✓✓', -220, 56, { size: 22, w: 600, color: C.muted, align: 'left' });
    }, { rot: -0.03 });
    tip(ctx, t, ev.saved, '🔒 נשמר רק אצלכם', 'הטקסט נשמר בדפדפן שלכם ולא נשלח לשום מקום. „ניקוי” מוחק אותו', { seed: 307, color: '#e8f4ff' });
    character(ctx, t, T(14, 1), IMG.mascot, { h: 260, rot: -0.03 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    const LX = 1460;
    ctx.save(); ctx.translate(LX, 360); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 1100, Math.sin(a0) * 1100); ctx.lineTo(Math.cos(a1) * 1100, Math.sin(a1) * 1100); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, LX, 360, (c) => {
      const s = 300;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 76); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 76); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 76); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', LX, 660 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines, X = 690;
    he(ctx, 'מקלדת עברית אונליין', X, 230, { size: 74, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/tools/keyboard', { size: 54, w: 600, bg: C.blue, fg: '#fff', padX: 44, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו ⌨️', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '✍️ במה הייתם משתמשים? כתבו בתגובות', X, 800, { size: 46, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25) });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotType },
    { t0: T(5), fn: shotNiqqud },
    { t0: T(8), fn: shotSymbols },
    { t0: T(11), fn: shotFingers },
    { t0: T(14), fn: shotSend },
    { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.bday = await L('img/birthday-girl.png');
      IMG.printer = await L('img/home-printer.png');
      IMG.mascot = await L('img/mascot.png');
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
