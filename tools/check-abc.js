#!/usr/bin/env node
// Checks every bar of an ABC transcription adds up to the meter. usage: node tools/check-abc.js file.abc
const fs = require('fs'), path = require('path');
const F = require(path.join(__dirname, '../web/js/fingering.js'));
const abc = fs.readFileSync(process.argv[2], 'utf8');
const r = F.readAbc(abc);
const sums = {}, meters = {};
r.events.forEach(e => { if (e.grace) return; sums[e.bar] = (sums[e.bar] || 0) + e.len; meters[e.bar] = e.meter; });
let bad = 0; const bars = Object.keys(sums).map(Number).sort((a, b) => a - b);
bars.forEach((b, idx) => {
  const [n, d] = meters[b].split('/').map(Number); const want = n / d;
  if (Math.abs(sums[b] - want) > 1e-6) {
    // allow pickup in first bar
    if (idx === 0 && sums[b] < want) return;
    bad++; console.log('bar', idx + 1, '(abc bar ' + b + ')', 'has', +(sums[b] * 16).toFixed(3), 'sixteenths, wants', want * 16);
  }
});
const notes = r.notes.filter(n => !n.grace).length;
console.log(bars.length, 'bars,', notes, 'notes,', bad, 'bad bars');
