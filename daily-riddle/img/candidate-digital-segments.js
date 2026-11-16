// Seven-segment equations drawing: left-hand digits are digital-clock digits, results are plain numbers.
const fs = require('fs');
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 8: 'abcdefg' };
const rows = [['4', '4', '8'], ['1', '1', '4'], ['2', '1', '7'], ['0', '1', '8'], ['8', '8', '?']];
const W = 900, DW = 58, DH = 104, T = 12, RG = 40, TOP = 80;
const H = TOP * 2 + rows.length * DH + (rows.length - 1) * RG;
const ON = '#ff2a2a';
const hseg = (x, y, l) => { const h = T / 2; return `${x},${y} ${x + h},${y - h} ${x + l - h},${y - h} ${x + l},${y} ${x + l - h},${y + h} ${x + h},${y + h}`; };
const vseg = (x, y, l) => { const h = T / 2; return `${x},${y} ${x - h},${y + h} ${x - h},${y + l - h} ${x},${y + l} ${x + h},${y + l - h} ${x + h},${y + h}`; };
function digit(d, x, y) {
  const g = 2, half = DH / 2, segs = {
    a: hseg(x + g, y, DW - 2 * g), g: hseg(x + g, y + half, DW - 2 * g), d: hseg(x + g, y + DH, DW - 2 * g),
    f: vseg(x, y + g, half - 2 * g), b: vseg(x + DW, y + g, half - 2 * g), e: vseg(x, y + half + g, half - 2 * g), c: vseg(x + DW, y + half + g, half - 2 * g),
  };
  return [...SEG[d]].map((k) => `<polygon points="${segs[k]}" fill="${ON}" filter="url(#glow)"/>`).join('');
}
const txt = (s, x, y, size, fill) => `<text x="${x}" y="${y + DH / 2}" font-family="Arial, sans-serif" font-size="${size}" font-weight="700" fill="${fill}" text-anchor="middle" dominant-baseline="central">${s}</text>`;
const GAP = 34, SYM = 56;
let body = '';
rows.forEach(([a, b, r], i) => {
  const total = DW + GAP + SYM + GAP + DW + GAP + SYM + GAP + 110;
  let x = (W - total) / 2; const y = TOP + i * (DH + RG);
  body += digit(a, x, y); x += DW + GAP;
  body += txt('+', x + SYM / 2, y, 74, '#f4f4f4'); x += SYM + GAP;
  body += digit(b, x, y); x += DW + GAP;
  body += txt('=', x + SYM / 2, y, 74, '#f4f4f4'); x += SYM + GAP;
  body += txt(r, x + 55, y, r === '?' ? 116 : 104, r === '?' ? '#ffd23f' : '#f4f4f4');
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="${W}" height="${H}" fill="#fffaf0"/><rect x="40" y="30" width="${W - 80}" height="${H - 60}" rx="38" fill="#111" stroke="#3b3b3b" stroke-width="10"/>${body}</svg>`;
fs.writeFileSync(process.argv[2], svg); console.log('ok', H);
