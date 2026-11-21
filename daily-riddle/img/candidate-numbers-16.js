// Draws numbers-16.svg: 88 96 101 / 111 181 ? with hand-made stroke digits that are exactly
// symmetric under a 180° turn (1 = a straight bar, 0 = an ellipse, 8 = two equal circles, 9 = 6 turned).
// Usage: node daily-riddle/img/numbers-16.js
const fs = require('fs');
const path = require('path');

const W = 900, H = 700, INK = '#14162d', SW = 11;
const DW = 40, DH = 84, PITCH = 54; // digit box and spacing
const CW = 190, CH = 190, R = 26, GAP = 64;

function digit(d) {
  const h = DH / 2, w = DW / 2;
  if (d === '0') return `<ellipse cx="0" cy="0" rx="${w}" ry="${h}"/>`;
  if (d === '1') return `<line x1="0" y1="${-h}" x2="0" y2="${h}"/>`;
  if (d === '8') { const r = h / 2; return `<circle cx="0" cy="${-r}" r="${r}"/><circle cx="0" cy="${r}" r="${r}"/>`; }
  if (d === '6') {
    const r = w, cy = h - r;
    return `<circle cx="0" cy="${cy}" r="${r}"/><path d="M ${-r} ${cy} C ${-r} ${-h * 0.45}, ${-w * 0.35} ${-h}, ${w * 0.75} ${-h}"/>`;
  }
  if (d === '9') return `<g transform="rotate(180)">${digit('6')}</g>`;
  throw new Error('digit ' + d);
}
function number(s, cx, cy) {
  const x0 = cx - ((s.length - 1) * PITCH) / 2;
  return [...s].map((d, i) => `<g transform="translate(${x0 + i * PITCH} ${cy})">${digit(d)}</g>`).join('');
}
function cardAt(cx, cy, fill) {
  return `<rect x="${cx - CW / 2 + 7}" y="${cy - CH / 2 + 9}" width="${CW}" height="${CH}" rx="${R}" fill="${INK}"/>` +
    `<rect x="${cx - CW / 2}" y="${cy - CH / 2}" width="${CW}" height="${CH}" rx="${R}" fill="${fill}" stroke="${INK}" stroke-width="5"/>`;
}
function qMark(cx, cy) {
  // a drawn "?" (no font): a hook and a dot
  return `<g transform="translate(${cx} ${cy})"><path d="M -26 -30 C -26 -62, 26 -62, 26 -30 C 26 -8, 0 -6, 0 16"/>` +
    `<circle cx="0" cy="46" r="8" fill="${INK}" stroke="none"/></g>`;
}

const rows = [{ y: 215, items: ['88', '96', '101'] }, { y: 485, items: ['111', '181', '?'] }];
let body = '';
for (const row of rows) {
  const n = row.items.length, total = n * CW + (n - 1) * GAP, x0 = W / 2 - total / 2 + CW / 2;
  row.items.forEach((s, i) => {
    const cx = x0 + i * (CW + GAP);
    body += cardAt(cx, row.y, s === '?' ? '#ffd23f' : '#ffffff');
    body += s === '?' ? qMark(cx, row.y) : number(s, cx, row.y);
    // a small reading-order arrow in the gap after each card (left to right), and from the end of row 1 down
    // to the start of row 2 (turned 180°, the arrows still follow the same order)
    if (i < n - 1) { const ax = cx + CW / 2 + GAP / 2 + 6; body += `<path d="M ${ax - 12} ${row.y - 15} L ${ax + 3} ${row.y} L ${ax - 12} ${row.y + 15}" stroke-width="7" stroke="#8a8fa8"/>`; }
  });
}
{
  const top = rows[0], bot = rows[1], xr = W / 2 + (3 * CW + 2 * GAP) / 2 - CW / 2, xl = W / 2 - (3 * CW + 2 * GAP) / 2 + CW / 2;
  const y1 = top.y + CH / 2 + 22, y2 = bot.y - CH / 2 - 22;
  body += `<path d="M ${xr} ${y1} C ${xr} ${(y1 + y2) / 2}, ${xl} ${(y1 + y2) / 2}, ${xl} ${y2 - 4}" stroke-width="6" stroke="#8a8fa8" stroke-dasharray="2 16"/>` +
    `<path d="M ${xl - 13} ${y2 - 16} L ${xl} ${y2} L ${xl + 13} ${y2 - 16}" stroke-width="7" stroke="#8a8fa8"/>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
  `<rect width="${W}" height="${H}" fill="#ffffff"/>` +
  `<g fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>\n`;
fs.writeFileSync(path.join(__dirname, 'numbers-16.svg'), svg);
console.log('wrote numbers-16.svg');
