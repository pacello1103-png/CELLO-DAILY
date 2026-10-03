#!/usr/bin/env node
/* Convert a cello ABC transcription to MusicXML (.musicxml) for Daily Cello.
   usage: node tools/abc2mxl.js in.abc out.musicxml
   (then tools/pack-mxl.py zips it to .mxl)
   Handles: clefs, key and meter changes, tempo, dynamics, hairpins, words,
   ties, slurs, any tuplet (p:q:r), double stops, articulations, fingering,
   fermata, repeats, first/second endings, double and final barlines. */
const fs = require('fs');
const path = require('path');
const F = require(path.join(__dirname, '../web/js/fingering.js'));

const KEY_FIFTHS = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7,
  Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6, Dm: -1, Gm: -2, Cm: -3, Fm: -4, Bbm: -5, Ebm: -6 };
const CLEF = { bass: ['F', 4], tenor: ['C', 4], alto: ['C', 3], treble: ['G', 2] };
const DYN = ['pppp', 'ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff', 'ffff', 'sf', 'sfp', 'sfpp', 'fp', 'rf', 'rfz', 'sfz', 'sffz', 'fz', 'pf', 'sfzp'];
const OTHER_DYN = ['ffz'];
const ACC = { '1': 'sharp', '-1': 'flat', '0': 'natural', '2': 'double-sharp', '-2': 'flat-flat' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function header(abc, k) { const m = new RegExp('^' + k + ':(.*)$', 'm').exec(abc); return m ? m[1].trim() : ''; }
const keyOf = k => { const name = (k || 'C').replace(/clef=\S+/, '').trim() || 'C'; return { fifths: KEY_FIFTHS[name] != null ? KEY_FIFTHS[name] : 0, mode: /m$/.test(name) ? 'minor' : 'major', name }; };

function convert(abc) {
  const r = F.readAbc(abc);
  const title = header(abc, 'T') || 'Untitled', composer = header(abc, 'C');
  const q = /1\/4=(\d+)/.exec(header(abc, 'Q') || ''); const tempo = q ? +q[1] : null;
  const DIV = 48; // divisions per quarter: allows triplets and sextuplets of 16ths
  const dur = len => Math.round(len * 4 * DIV);
  const TYPES = [[1, 'whole'], [0.5, 'half'], [0.25, 'quarter'], [0.125, 'eighth'], [0.0625, '16th'], [0.03125, '32nd'], [0.015625, '64th']];
  function typeOf(written) {
    for (const [l, t] of TYPES) {
      if (Math.abs(l - written) < 1e-6) return { type: t, dots: 0 };
      if (Math.abs(l * 1.5 - written) < 1e-6) return { type: t, dots: 1 };
      if (Math.abs(l * 1.75 - written) < 1e-6) return { type: t, dots: 2 };
    }
    if (Math.abs(written - 1.5) < 1e-6) return { type: 'whole', dots: 1 };
    return { type: 'quarter', dots: 0 };
  }
  const pitchXml = (n) => `<pitch><step>${n.letter}</step>${n.alter ? `<alter>${n.alter}</alter>` : ''}<octave>${n.oct}</octave></pitch>`;
  const evs = r.events;
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
  let curClef = null, curKey = null, curMeter = null, wedgeOpen = null, openVolta = null;
  const BL = r.barlines || {};
  barKeys.forEach((bk, mi) => {
    xml += `    <measure number="${mi + 1}">\n`;
    const info = BL[bk] || {};
    // left barline: repeat start / ending start
    if (info.repeatStart || info.volta) {
      xml += '      <barline location="left">';
      if (info.volta) { xml += `<ending number="${info.volta}" type="start">${info.volta}.</ending>`; openVolta = info.volta; }
      if (info.repeatStart) xml += '<repeat direction="forward"/>';
      xml += '</barline>\n';
    }
    const first = bars[bk][0];
    const attrs = [];
    if (mi === 0) attrs.push(`<divisions>${DIV}</divisions>`);
    if (first.key !== curKey) { const k = keyOf(first.key); attrs.push(`<key><fifths>${k.fifths}</fifths><mode>${k.mode}</mode></key>`); curKey = first.key; }
    if (first.meter !== curMeter) { const [b, t] = first.meter.split('/'); attrs.push(`<time><beats>${b}</beats><beat-type>${t}</beat-type></time>`); curMeter = first.meter; }
    if (first.clef !== curClef) { const c = CLEF[first.clef] || CLEF.bass; attrs.push(`<clef><sign>${c[0]}</sign><line>${c[1]}</line></clef>`); curClef = first.clef; }
    if (attrs.length) xml += `      <attributes>${attrs.join('')}</attributes>\n`;
    if (mi === 0 && tempo) xml += `      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>\n`;
    // beams: group beamable notes (eighth or shorter) by beat
    const [mb, mt] = (first.meter || '4/4').split('/').map(Number);
    const beat = (mt === 8 && mb % 3 === 0 && mb > 3) ? 3 / 8 : 1 / mt;
    const t0 = bars[bk][0].t;
    const beamable = e => !e.rest && !e.grace && (e.tup ? e.len * e.tup.p / e.tup.q : e.len) <= 0.125 + 1e-9;
    const short = e => (e.tup ? e.len * e.tup.p / e.tup.q : e.len) <= 0.0625 + 1e-9;
    const groups = []; let g = null;
    bars[bk].forEach(e => {
      const bi = Math.floor((e.t - t0) / beat + 1e-6);
      if (beamable(e) && g && g.beat === bi) g.list.push(e);
      else { g = beamable(e) ? { beat: bi, list: [e] } : null; if (g) groups.push(g); }
    });
    groups.forEach(gr => {
      if (gr.list.length < 2) return;
      gr.list.forEach((e, k) => {
        const b1 = k === 0 ? 'begin' : k === gr.list.length - 1 ? 'end' : 'continue';
        e.beams = [`<beam number="1">${b1}</beam>`];
        if (short(e)) {
          const prev = gr.list[k - 1], next = gr.list[k + 1];
          const ps = prev && short(prev), ns = next && short(next);
          const b2 = ps && ns ? 'continue' : ps ? 'end' : ns ? 'begin' : (k === 0 ? 'forward hook' : 'backward hook');
          e.beams.push(`<beam number="2">${b2}</beam>`);
        }
      });
    });
    bars[bk].forEach(e => {
      if (e.clef !== curClef) { const c = CLEF[e.clef] || CLEF.bass; xml += `      <attributes><clef><sign>${c[0]}</sign><line>${c[1]}</line></clef></attributes>\n`; curClef = e.clef; }
      if (e.key !== curKey) { const k = keyOf(e.key); xml += `      <attributes><key><fifths>${k.fifths}</fifths><mode>${k.mode}</mode></key></attributes>\n`; curKey = e.key; }
      const decos = e.decos || [];
      if (decos.some(d => /^(crescendo|diminuendo)\)$/.test(d) || d === '<)' || d === '>)') && wedgeOpen) { xml += `      <direction placement="below"><direction-type><wedge type="stop"/></direction-type></direction>\n`; wedgeOpen = null; }
      decos.filter(d => DYN.includes(d)).forEach(d => { xml += `      <direction placement="below"><direction-type><dynamics><${d}/></dynamics></direction-type></direction>\n`; });
      decos.filter(d => OTHER_DYN.includes(d)).forEach(d => { xml += `      <direction placement="below"><direction-type><dynamics><other-dynamics>${d}</other-dynamics></dynamics></direction-type></direction>\n`; });
      decos.forEach(d => {
        if (d === 'crescendo(' || d === '<(') { xml += `      <direction placement="below"><direction-type><wedge type="crescendo"/></direction-type></direction>\n`; wedgeOpen = 1; }
        if (d === 'diminuendo(' || d === '>(') { xml += `      <direction placement="below"><direction-type><wedge type="diminuendo"/></direction-type></direction>\n`; wedgeOpen = 1; }
      });
      (e.ann || []).forEach(a => { const pl = a[0] === '_' ? 'below' : 'above'; const s = a.replace(/^[_^<>@]/, ''); if (s) xml += `      <direction placement="${pl}"><direction-type><words>${esc(s)}</words></direction-type></direction>\n`; });
      if (e.invisible) { xml += `      <forward><duration>${dur(e.len)}</duration></forward>\n`; return; }
      const written = e.tup ? e.len * e.tup.p / e.tup.q : e.len;
      const ty = typeOf(written);
      const tm = e.tup ? `<time-modification><actual-notes>${e.tup.p}</actual-notes><normal-notes>${e.tup.q}</normal-notes></time-modification>` : '';
      const one = (n, isChord, main) => {
        let x = '      <note>';
        if (e.grace) x += '<grace slash="yes"/>';
        if (isChord) x += '<chord/>';
        if (e.rest) x += '<rest/>'; else x += pitchXml(n);
        if (!e.grace) x += `<duration>${dur(e.len)}</duration>`;
        if (e.tieStart) x += '<tie type="start"/>';
        if (e.tied) x += '<tie type="stop"/>';
        x += `<voice>1</voice><type>${ty.type}</type>` + '<dot/>'.repeat(ty.dots);
        if (!e.rest && n.explicitAcc) x += `<accidental>${ACC[String(n.alter)]}</accidental>`;
        x += tm;
        if (!isChord && e.beams) x += e.beams.join('');
        const nots = [];
        if (e.tieStart) nots.push('<tied type="start"/>');
        if (e.tied) nots.push('<tied type="stop"/>');
        if (main) {
          for (let k = 0; k < (e.slurStart || 0); k++) nots.push('<slur type="start" number="1"/>');
          for (let k = 0; k < (e.slurEnd || 0); k++) nots.push('<slur type="stop" number="1"/>');
          if (e.tup && e.tup.i === 0) nots.push(`<tuplet type="start" bracket="${e.tup.p === 3 ? 'no' : 'no'}"/>`);
          if (e.tup && e.tup.i === e.tup.r - 1) nots.push('<tuplet type="stop"/>');
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
        }
        if (nots.length) x += '<notations>' + nots.join('') + '</notations>';
        return x + '</note>\n';
      };
      xml += one(e, false, true);
      (e.chordNotes || []).forEach(cn => { xml += one(cn, true, false); });
    });
    // right barline
    const isLast = mi === barKeys.length - 1;
    const nextInfo = BL[barKeys[mi + 1]] || {};
    const style = info.end === '||' ? 'light-light' : (info.end === '|]' || isLast) ? 'light-heavy' : info.repeatEnd ? 'light-heavy' : null;
    const closeVolta = openVolta && (info.repeatEnd || info.end === '||' || info.end === '|]' || isLast || nextInfo.volta);
    if (style || info.repeatEnd || closeVolta) {
      xml += '      <barline location="right">';
      if (style) xml += `<bar-style>${style}</bar-style>`;
      if (closeVolta) { xml += `<ending number="${openVolta}" type="${info.repeatEnd ? 'stop' : 'discontinue'}"/>`; openVolta = null; }
      if (info.repeatEnd) xml += '<repeat direction="backward"/>';
      xml += '</barline>\n';
    }
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
