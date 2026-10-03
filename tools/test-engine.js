// Engine tests: run with `node tools/test-engine.js` (also in CI)
const path = require('path'), fs = require('fs');
const W = p => path.join(__dirname, '../web/js', p);
const Fg = require(W('fingering.js'));
Object.assign(global, Fg, { FRAMES: { closed: [0, 0, 1, 2, 3], ext: [0, 0, 2, 3, 4], thumb: [0, 2, 3, 4, -1] } });
const MX = require(W('musicxml.js'));
const GEN = require(W('generator.js'));
let fails = 0, checks = 0;
const ok = (c, msg) => { checks++; if (!c) { fails++; console.log('FAIL', msg); } };
(async () => {
  // fingering
  const r = Fg.readAbc('X:1\nL:1/8\nK:G clef=tenor\n^A,4- A,B, |(c2 A2 =F2) (D2 E2 F2)|');
  ok(r.notes[1].midi === 58 && r.notes[1].tied, 'tied A# keeps the sharp');
  ok(r.notes[r.notes.length - 1].midi === 65, 'F natural lasts to the end of the bar');
  const f = Fg.fingerNotes(Fg.readAbc('X:1\nL:1/8\nK:G clef=tenor\nG2 F2 B,2').notes, {});
  ok(f[0].f === 4 && f[1].f === 3 && f[2].f === 3 && f[2].s === 1, 'Swan bar 2: 4 3 3 across the fifth');
  // musicxml
  const buf = fs.readFileSync(path.join(__dirname, '../web/pieces/The-Swan.mxl'));
  const xml = await MX.unzipMxl(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
  const p = MX.parseMusicXML(xml, { fileName: 'The-Swan.mxl' });
  ok(p.measures.length === 28, '28 bars');
  ok(p.key.name === 'G' && p.clef === 'tenor' && p.tempo === 54, 'key, clef, tempo');
  // generator
  const piece = GEN.buildPiece(p, { positions: 'thumb', clefs: ['bass', 'tenor'] });
  ok(piece.exercises.length >= 8, 'exercises generated: ' + piece.exercises.length);
  ok(piece.spots.length >= 3, 'spots found: ' + piece.spots.map(s => s.type + ' ' + s.bars.join(',')).join(' | '));
  ok(piece.second === 'Bm' || piece.second === 'F#m' || piece.second === 'D', 'second key ' + piece.second);
  piece.exercises.forEach(e => (e.music || []).forEach(m => ok(/\nK:/.test(m.abc) && !/undefined|NaN/.test(m.abc), 'abc ok in ' + e.id + ': ' + m.abc.slice(-80))));
  if (process.argv.includes('-v')) { console.log(piece.spots); piece.exercises.forEach(e => { console.log('##', e.id, e.title.en); (e.music || []).forEach(m => console.log(m.abc.split('\n').slice(3).join(' '))); }); }
  console.log(`ENGINE ${checks} checks, ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
