// Mirrors the site fix pushed with this video (number ranges wrapped in ⁦…⁩ in hanukkahEscape.js and
// HanukkahEscapeRoom.jsx) until the deploy is live: wrap every "5–6" style range in an LTR isolate.
module.exports = (p) => p.evaluate(() => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const re = /(^|[^\d\u2066])(\d+\u2013\d+)(?![\d\u2069])/g;
  for (let n; (n = w.nextNode());) if (re.test(n.nodeValue)) { re.lastIndex = 0; n.nodeValue = n.nodeValue.replace(re, '$1\u2066$2\u2069'); }
});
