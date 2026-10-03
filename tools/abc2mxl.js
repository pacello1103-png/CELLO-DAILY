#!/usr/bin/env node
/* Convert a cello ABC transcription to MusicXML (.musicxml) for Daily Cello.
   usage: node tools/abc2mxl.js in.abc out.musicxml
   (then tools/pack-mxl.py zips it to .mxl) */
const fs = require('fs');
const path = require('path');
const F = require(path.join(__dirname, '../web/js/fingering.js'));

const STEP_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const KEY_FIFTHS = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7,
  Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6, Dm: -1, Gm: -2, Cm: -3, Fm: -4, Bbm: -5, Ebm: -6 };
const CLEF = { bass: ['F', 4], tenor: ['C', 4], alto: ['C', 3], treble: ['G', 2] };
const DYN = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff', 'sfz', 'fp'];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function header(abc, k) { const m = new RegExp('^' + k + ':(.*)$', 'm').exec(abc); return m ? m[1].trim() : ''; }

function convert(abc) {
  const r = F.readAbc(abc);
  const title = header(abc, 'T') || 'Untitled', composer = header(abc, 'C');
  const [beats, beatType] = (header(abc, 'M') || '4/4').split('/').map(Number);
  const kRaw = header(abc, 'K'); const keyName = kRaw.replace(/clef=\S+/, '').trim() || 'C';
  const fifths = KEY_FIFTHS[keyName] != null ? KEY_FIFTHS[keyName] : 0;
  const mode = /m$/.test(keyName) ? 'minor' : 'major';
  const q = /1\/4=(\d+)/.exec(header(abc, 'Q') || ''); const tempo = q ? +q[1] : null;
  const DIV = 24;
  const dur = len => Math.round(len * 4 * DIV);
  function typeOf(len) {
    const table = [[1, 'whole', 0], [0.75, 'half', 1], [0.5, 'half', 0], [0.375, 'quarter', 1], [0.25, 'quarter', 0], [0.1875, 'eighth', 1], [0.125, 'eighth', 0], [0.09375, '16th', 1], [0.0625, '16th', 0], [0.03125, '32nd', 0], [1.5, 'whole', 1]];
    for (const [l, t, d] of table) if (Math.abs(l - len) < 1e-6) return { type: t, dots: d, tuplet: false };
    for (const [l, t, d] of table) if (Math.abs(l * 2 / 3 - len) < 1e-6) return { type: t, dots: d, tuplet: true };
    return { type: 'quarter', dots: 0, tuplet: false };
  }
  const evs = r.events.filter(e => !e.chord || !e.midi);
  const bars = {};
  evs.forEach(e => { (bars[e.bar] = bars[e.bar] || []).push(e); });
  const barKeys = Object.keys(bars).map(Number).sort((a, b) => a - b);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work><work-title>${esc(title)}</work-title></work>
  <identification>${composer ? `<creator type="composer">${esc(composer)}</creator>` : ''}<encoding><software>Daily Cello</software></encoding></identification>
  <part-list><score-part id="P1"><part-name>Violoncello</part-name></score-part></part-list>
  <part id="P1">
`;
  let curClef = null, wedgeOpen = null, tupletCount = 0;
  barKeys.forEach((bk, mi) => {
    xml += `    <measure number="${mi + 1}">\n`;
    const first = bars[bk][0];
    if (mi === 0) {
      const c = CLEF[first.clef] || CLEF.bass; curClef = first.clef;
      xml += `      <attributes><divisions>${DIV}</divisions><key><fifths>${fifths}</fifths><mode>${mode}</mode></key><time><beats>${beats}</beats><beat-type>${beatType}</beat-type></time><clef><sign>${c[0]}</sign><line>${c[1]}</line></clef></attributes>\n`;
      if (tempo) xml += `      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>\n`;
    }
    bars[bk].forEach(e => {
      if (e.clef !== curClef) { const c = CLEF[e.clef] || CLEF.bass; xml += `      <attributes><clef><sign>${c[0]}</sign><line>${c[1]}</line></clef></attributes>\n`; curClef = e.clef; }
      const decos = e.decos || [];
      if (decos.some(d => /^(crescendo|diminuendo)\)$/.test(d) || d === '<)' || d === '>)') && wedgeOpen) { xml += `      <direction placement="below"><direction-type><wedge type="stop"/></direction-type></direction>\n`; wedgeOpen = null; }
      decos.filter(d => DYN.includes(d)).forEach(d => { xml += `      <direction placement="below"><direction-type><dynamics><${d}/></dynamics></direction-type></direction>\n`; });
      decos.forEach(d => {
        if (d === 'crescendo(' || d === '<(') { xml += `      <direction placement="below"><direction-type><wedge type="crescendo"/></direction-type></direction>\n`; wedgeOpen = 1; }
        if (d === 'diminuendo(' || d === '>(') { xml += `      <direction placement="below"><direction-type><wedge type="diminuendo"/></direction-type></direction>\n`; wedgeOpen = 1; }
      });
      (e.ann || []).forEach(a => { const pl = a[0] === '_' ? 'below' : 'above'; const s = a.replace(/^[_^<>@]/, ''); if (s) xml += `      <direction placement="${pl}"><direction-type><words>${esc(s)}</words></direction-type></direction>\n`; });
      if (e.invisible) { xml += `      <forward><duration>${dur(e.len)}</duration></forward>\n`; return; }
      const ty = typeOf(e.len);
      let n = '      <note>';
      if (e.grace) n += '<grace slash="yes"/>';
      if (e.rest) n += '<rest/>';
      else {
        n += `<pitch><step>${e.letter}</step>${e.alter ? `<alter>${e.alter}</alter>` : ''}<octave>${e.oct}</octave></pitch>`;
      }
      if (!e.grace) n += `<duration>${dur(e.len)}</duration>`;
      if (e.tieStart) n += '<tie type="start"/>';
      if (e.tied) n += '<tie type="stop"/>';
      n += `<voice>1</voice><type>${ty.type}</type>` + '<dot/>'.repeat(ty.dots);
      if (!e.rest && e.alter != null) {
        // print an accidental only when it differs from the key or was written explicitly
      }
      if (ty.tuplet) n += '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>';
      const nots = [];
      if (e.tieStart) nots.push('<tied type="start"/>');
      if (e.tied) nots.push('<tied type="stop"/>');
      for (let k = 0; k < (e.slurStart || 0); k++) nots.push('<slur type="start" number="1"/>');
      for (let k = 0; k < (e.slurEnd || 0); k++) nots.push('<slur type="stop" number="1"/>');
      if (ty.tuplet) { if (tupletCount % 3 === 0) nots.push('<tuplet type="start"/>'); if (tupletCount % 3 === 2) nots.push('<tuplet type="stop"/>'); tupletCount++; }
      const arts = [];
      if (decos.includes('accent') || decos.includes('>')) arts.push('<accent/>');
      if (decos.includes('marcato')) arts.push('<strong-accent/>');
      if (decos.includes('staccato')) arts.push('<staccato/>');
      if (decos.includes('tenuto')) arts.push('<tenuto/>');
      if (arts.length) nots.push('<articulations>' + arts.join('') + '</articulations>');
      const tech = [];
      if (e.finger != null) tech.push(`<fingering>${e.finger}</fingering>`);
      if (decos.includes('upbow')) tech.push('<up-bow/>');
      if (decos.includes('downbow')) tech.push('<down-bow/>');
      if (decos.includes('thumb')) tech.push('<thumb-position/>');
      if (tech.length) nots.push('<technical>' + tech.join('') + '</technical>');
      if (decos.includes('fermata')) nots.push('<fermata type="upright"/>');
      if (nots.length) n += '<notations>' + nots.join('') + '</notations>';
      n += '</note>\n';
      xml += n;
    });
    if (mi === barKeys.length - 1) xml += '      <barline location="right"><bar-style>light-heavy</bar-style></barline>\n';
    xml += '    </measure>\n';
  });
  xml += '  </part>\n</score-partwise>\n';
  return xml;
}

if (require.main === module) {
  const [, , inp, out] = process.argv;
  const abc = fs.readFileSync(inp, 'utf8');
  fs.writeFileSync(out, convert(abc));
  console.log('wrote', out);
}
module.exports = { convert };
