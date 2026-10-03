/* ============================================================
   Daily Cello · MusicXML (.mxl / .musicxml) reader
   unzipMxl(arrayBuffer) -> xml text
   parseMusicXML(xmlText) -> piece { title, composer, key, time, tempo, notes[], measures, abc }
   ============================================================ */
const MX = (() => {
  const FIFTHS_MAJ = { '-7': 'Cb', '-6': 'Gb', '-5': 'Db', '-4': 'Ab', '-3': 'Eb', '-2': 'Bb', '-1': 'F', '0': 'C', '1': 'G', '2': 'D', '3': 'A', '4': 'E', '5': 'B', '6': 'F#', '7': 'C#' };
  const FIFTHS_MIN = { '-7': 'Abm', '-6': 'Ebm', '-5': 'Bbm', '-4': 'Fm', '-3': 'Cm', '-2': 'Gm', '-1': 'Dm', '0': 'Am', '1': 'Em', '2': 'Bm', '3': 'F#m', '4': 'C#m', '5': 'G#m', '6': 'D#m', '7': 'A#m' };
  const STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const TEMPO_WORDS = [[/grave/i, 40], [/largo/i, 46], [/lento/i, 50], [/adagio/i, 56], [/andantino/i, 72], [/andante/i, 66], [/moderato/i, 92], [/allegretto/i, 104], [/allegro/i, 126], [/vivace/i, 150], [/presto/i, 170]];

  /* ---------- zip (.mxl) ---------- */
  async function inflateRaw(u8) {
    if (typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw');
      const stream = new Blob([u8]).stream().pipeThrough(ds);
      return new Uint8Array(await new Response(stream).arrayBuffer());
    }
    if (typeof require !== 'undefined') return new Uint8Array(require('zlib').inflateRawSync(Buffer.from(u8)));
    throw new Error('This device cannot unzip .mxl files');
  }
  async function unzip(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf instanceof ArrayBuffer ? buf : u8.buffer);
    // find end of central directory
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('Not a zip file');
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const files = {};
    const dec = new TextDecoder();
    for (let k = 0; k < count; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
      const lnlen = dv.getUint16(off + 26, true), lelen = dv.getUint16(off + 28, true);
      const data = u8.subarray(off + 30 + lnlen + lelen, off + 30 + lnlen + lelen + csize);
      files[name] = { method, data };
      p += 46 + nlen + elen + clen;
    }
    return files;
  }
  async function unzipMxl(buf) {
    const files = await unzip(buf);
    const dec = new TextDecoder();
    const get = async n => { const f = files[n]; if (!f) return null; return dec.decode(f.method === 0 ? f.data : await inflateRaw(f.data)); };
    let rootName = null;
    const cont = await get('META-INF/container.xml');
    if (cont) { const m = /full-path="([^"]+)"/.exec(cont); if (m) rootName = m[1]; }
    if (!rootName) rootName = Object.keys(files).find(n => /\.(musicxml|xml)$/i.test(n) && !/^META-INF/.test(n));
    const xml = await get(rootName);
    if (!xml) throw new Error('No score inside the .mxl file');
    return xml;
  }

  /* ---------- XML helpers ---------- */
  function parseXml(text) {
    if (typeof DOMParser !== 'undefined') return new DOMParser().parseFromString(text, 'application/xml');
    const { DOMParser: P } = require('@xmldom/xmldom'); return new P().parseFromString(text, 'application/xml');
  }
  const kids = (el, tag) => el ? Array.from(el.childNodes || []).filter(n => n.nodeType === 1 && (!tag || n.nodeName === tag)) : [];
  const kid = (el, tag) => kids(el, tag)[0] || null;
  const txt = (el, tag) => { const k = tag ? kid(el, tag) : el; return k ? (k.textContent || '').trim() : ''; };
  const all = (el, tag) => el ? Array.from(el.getElementsByTagName(tag)) : [];

  /* ---------- parse ---------- */
  function parseMusicXML(text, opts = {}) {
    const doc = parseXml(text);
    const root = doc.documentElement;
    if (!root || !/score-partwise/.test(root.nodeName)) {
      if (root && /score-timewise/.test(root.nodeName)) throw new Error('Timewise MusicXML is not supported yet. Export as "partwise" (normal) MusicXML.');
      throw new Error('This file is not MusicXML.');
    }
    const title = txt(kid(root, 'work'), 'work-title') || txt(root, 'movement-title') || (opts.fileName || 'Untitled').replace(/\.(mxl|musicxml|xml)$/i, '');
    let composer = '';
    all(root, 'creator').forEach(c => { if ((c.getAttribute('type') || '') === 'composer') composer = (c.textContent || '').trim(); });
    // choose the cello part
    const scoreParts = all(kid(root, 'part-list'), 'score-part');
    let partId = null;
    scoreParts.forEach(sp => { const n = (txt(sp, 'part-name') + ' ' + txt(sp, 'part-abbreviation') + ' ' + all(sp, 'instrument-name').map(x => x.textContent).join(' ')).toLowerCase(); if (!partId && /(cello|violoncel|vc\.?\b|vlc)/.test(n)) partId = sp.getAttribute('id'); });
    const parts = kids(root, 'part');
    let part = parts.find(p => p.getAttribute('id') === partId);
    if (!part) {
      // the part with the lowest average pitch among single-staff parts, else the first
      part = parts[0];
    }
    const piece = { title, composer, key: null, time: null, tempo: null, tempoWord: '', notes: [], measures: [], clef: 'bass', source: 'musicxml' };
    let divisions = 1, t = 0, fifths = 0, mode = 'major', curClef = 'bass';
    let pendingDyn = null, pendingWedge = [], pendingWords = '', wedgeType = 'crescendo', pendingPlace = 'above';
    kids(part, 'measure').forEach((m, mi) => {
      const mnum = m.getAttribute('number') || String(mi + 1);
      const meas = { n: mi + 1, label: mnum, start: t, clef: null, key: null, time: null };
      kids(m).forEach(el => {
        const tag = el.nodeName;
        if (tag === 'attributes') {
          const d = txt(el, 'divisions'); if (d) divisions = +d;
          const k = kid(el, 'key'); if (k) { fifths = +txt(k, 'fifths') || 0; mode = txt(k, 'mode') || 'major'; meas.key = { fifths, mode }; if (!piece.key) piece.key = { fifths, mode }; }
          const ti = kid(el, 'time'); if (ti) { meas.time = { beats: +txt(ti, 'beats') || 4, beatType: +txt(ti, 'beat-type') || 4 }; if (!piece.time) piece.time = meas.time; }
          kids(el, 'clef').forEach(c => { if ((c.getAttribute('number') || '1') !== '1') return; const sign = txt(c, 'sign'), line = +txt(c, 'line'); const oct = +txt(c, 'clef-octave-change') || 0; const cl = sign === 'F' ? 'bass' : sign === 'C' ? (line === 3 ? 'alto' : 'tenor') : sign === 'G' ? (oct === -1 ? 'treble-8' : 'treble') : 'bass'; if (cl !== curClef || mi === 0) { meas.clef = cl; curClef = cl; } if (mi === 0) piece.clef = cl; });
        } else if (tag === 'direction') {
          const snd = all(el, 'sound')[0]; if (snd && snd.getAttribute('tempo') && !piece.tempo) piece.tempo = Math.round(+snd.getAttribute('tempo'));
          const pm = all(el, 'per-minute')[0]; if (pm && !piece.tempo) piece.tempo = Math.round(+pm.textContent);
          all(el, 'dynamics').forEach(d => { const k = kids(d)[0]; if (k) pendingDyn = k.nodeName; });
          all(el, 'wedge').forEach(w => { const ty = w.getAttribute('type'); if (ty === 'stop') pendingWedge.push(wedgeType + ')'); if (ty === 'crescendo' || ty === 'diminuendo') { wedgeType = ty; pendingWedge.push(ty + '('); } });
          all(el, 'words').forEach(w => { const s = (w.textContent || '').trim(); if (s) { pendingWords = s; pendingPlace = el.getAttribute('placement') || 'above'; if (!piece.tempoWord && TEMPO_WORDS.some(([re]) => re.test(s))) piece.tempoWord = s; } });
        } else if (tag === 'backup') {
          t -= (+txt(el, 'duration') || 0) / divisions; if (t < meas.start) t = meas.start;
        } else if (tag === 'forward') {
          const v = txt(el, 'voice'); if (!v || v === '1') t += (+txt(el, 'duration') || 0) / divisions;
        } else if (tag === 'note') {
          const voice = txt(el, 'voice') || '1', staff = txt(el, 'staff') || '1';
          const isChord = !!kid(el, 'chord'), isGrace = !!kid(el, 'grace');
          const dur = (+txt(el, 'duration') || 0) / divisions;
          if (voice !== '1' || staff !== '1') { return; }
          const p = kid(el, 'pitch');
          const note = { measure: mi + 1, t: isChord ? (piece.notes.length ? piece.notes[piece.notes.length - 1].t : t) : t, dur, rest: !!kid(el, 'rest'), grace: isGrace, chord: isChord, type: txt(el, 'type'), dots: kids(el, 'dot').length };
          if (p) { note.step = txt(p, 'step'); note.alter = +txt(p, 'alter') || 0; note.octave = +txt(p, 'octave'); note.midi = (note.octave + 1) * 12 + STEPS[note.step] + note.alter; }
          const tm = kid(el, 'time-modification'); if (tm) note.tuplet = { actual: +txt(tm, 'actual-notes'), normal: +txt(tm, 'normal-notes') };
          kids(el, 'tie').forEach(ti => { if (ti.getAttribute('type') === 'start') note.tieStart = true; if (ti.getAttribute('type') === 'stop') note.tieStop = true; });
          const nots = kid(el, 'notations');
          if (nots) {
            all(nots, 'slur').forEach(s => { if (s.getAttribute('type') === 'start') note.slurStart = (note.slurStart || 0) + 1; if (s.getAttribute('type') === 'stop') note.slurStop = (note.slurStop || 0) + 1; });
            all(nots, 'tuplet').forEach(s => { if (s.getAttribute('type') === 'start') note.tupletStart = true; });
            all(nots, 'fingering').forEach(f => { const v = (f.textContent || '').trim(); if (/^[0-4]$/.test(v)) note.finger = +v; });
            all(nots, 'thumb-position').forEach(() => { note.finger = 'T'; });
            if (all(nots, 'fermata').length) note.fermata = true;
            if (all(nots, 'accent').length) note.accent = true;
            if (all(nots, 'staccato').length) note.staccato = true;
            if (all(nots, 'tenuto').length) note.tenuto = true;
            if (all(nots, 'up-bow').length) note.bow = 'up';
            if (all(nots, 'down-bow').length) note.bow = 'down';
            if (all(nots, 'harmonic').length) note.harmonic = true;
            all(nots, 'dynamics').forEach(d => { const k = kids(d)[0]; if (k) pendingDyn = k.nodeName; });
          }
          if (!isChord && !isGrace) {
            if (pendingDyn) { note.dyn = pendingDyn; pendingDyn = null; }
            if (pendingWedge.length) { note.wedges = pendingWedge; pendingWedge = []; }
            if (pendingWords) { note.words = pendingWords; note.wordsPlace = pendingPlace; pendingWords = ''; }
          }
          piece.notes.push(note);
          if (!isChord && !isGrace) t += dur;
        }
      });
      meas.end = t;
      piece.measures.push(meas);
    });
    if (!piece.key) piece.key = { fifths: 0, mode: 'major' };
    if (!piece.time) piece.time = { beats: 4, beatType: 4 };
    piece.key.name = (piece.key.mode === 'minor' ? FIFTHS_MIN : FIFTHS_MAJ)[String(piece.key.fifths)] || 'C';
    if (!piece.tempo) { const w = TEMPO_WORDS.find(([re]) => re.test(piece.tempoWord)); piece.tempo = w ? w[1] : 72; }
    // tempo in quarter notes for compound meters
    piece.abc = toAbc(piece);
    return piece;
  }

  /* ---------- notes -> ABC ---------- */
  function abcPitch(n, state, keyAcc) {
    const letter = n.step, oct = n.octave;
    const id = letter + oct;
    const current = state[id] != null ? state[id] : (keyAcc[letter] || 0);
    let acc = '';
    if (n.alter !== current) { acc = n.alter === 1 ? '^' : n.alter === 2 ? '^^' : n.alter === -1 ? '_' : n.alter === -2 ? '__' : '='; state[id] = n.alter; }
    let s = oct >= 5 ? letter.toLowerCase() : letter;
    if (oct >= 6) s += "'".repeat(oct - 5);
    if (oct <= 3) s += ','.repeat(4 - oct);
    return acc + s;
  }
  function fracStr(x) { // duration in units of L (1/16) -> abc length suffix
    const r = Math.round(x * 1000) / 1000;
    if (Math.abs(r - Math.round(r)) < 1e-6) { const n = Math.round(r); return n === 1 ? '' : String(n); }
    for (const d of [2, 4, 8, 3, 6]) { const nn = r * d; if (Math.abs(nn - Math.round(nn)) < 1e-6) return Math.round(nn) + '/' + d; }
    return String(Math.max(1, Math.round(r)));
  }
  const ABC_CLEF = { bass: 'bass', tenor: 'tenor', alto: 'alto', treble: 'treble', 'treble-8': 'treble' };
  function toAbc(piece) {
    let keyAcc = typeof keyAccidentals === 'function' ? keyAccidentals(piece.key.name) : {};
    let curKeyName = piece.key.name, curTime = piece.time.beats + '/' + piece.time.beatType;
    const L = 1 / 16; // whole-note fraction
    const unit = q => q / 4 / L;   // quarters -> L units
    const head = `X:1\nT:${piece.title}\n${piece.composer ? 'C:' + piece.composer + '\n' : ''}M:${piece.time.beats}/${piece.time.beatType}\nL:1/16\nQ:1/4=${piece.tempo}\nK:${piece.key.name} clef=${ABC_CLEF[piece.clef] || 'bass'}\n`;
    let body = '', curClef = piece.clef;
    const byMeasure = {};
    piece.notes.forEach(n => { (byMeasure[n.measure] = byMeasure[n.measure] || []).push(n); });
    piece.measures.forEach((m, i) => {
      let bar = '';
      if (m.time && i > 0) { const ts = m.time.beats + '/' + m.time.beatType; if (ts !== curTime) { bar += `[M:${ts}]`; curTime = ts; } }
      if (m.key && i > 0) {
        const kn = (m.key.mode === 'minor' ? FIFTHS_MIN : FIFTHS_MAJ)[String(m.key.fifths)] || 'C';
        if (kn !== curKeyName) { curKeyName = kn; keyAcc = typeof keyAccidentals === 'function' ? keyAccidentals(kn) : {}; bar += `[K:${kn}${m.clef && m.clef !== curClef ? ' clef=' + ABC_CLEF[m.clef] : ''}]`; if (m.clef) curClef = m.clef; }
      }
      if (m.clef && m.clef !== curClef && i > 0) { bar += `[K:clef=${ABC_CLEF[m.clef]}]`; curClef = m.clef; }
      const state = {};
      const ns = byMeasure[m.n] || [];
      let j = 0;
      while (j < ns.length) {
        const n = ns[j];
        // group chord notes
        const group = [n]; while (ns[j + group.length] && ns[j + group.length].chord) group.push(ns[j + group.length]);
        j += group.length;
        let pre = '';
        if (n.tupletStart && n.tuplet) pre += '(' + n.tuplet.actual + ':' + n.tuplet.normal + ':' + n.tuplet.actual;
        if (n.dyn && /^(ppp|pp|p|mp|mf|f|ff|fff|sfz|fp)$/.test(n.dyn)) pre += '!' + n.dyn + '!';
        (n.wedges || []).forEach(w => { pre += '!' + w + '!'; });
        if (n.words && n.words.length < 24) pre += '"' + (n.wordsPlace === 'below' ? '_' : '^') + n.words.replace(/"/g, '') + '"';
        if (n.fermata) pre += '!fermata!';
        if (n.accent) pre += '!accent!';
        if (n.staccato) pre += '.';
        if (n.tenuto) pre += '!tenuto!';
        if (n.bow === 'up') pre += '!upbow!'; if (n.bow === 'down') pre += '!downbow!';
        if (n.finger != null) pre += n.finger === 'T' ? '!thumb!' : '!' + n.finger + '!';
        if (n.slurStart) pre += '('.repeat(n.slurStart);
        let len = n.dur;
        if (n.tuplet && n.tuplet.actual) len = n.dur * n.tuplet.actual / n.tuplet.normal;
        if (n.grace) { bar += '{' + abcPitch(n, state, keyAcc) + '}'; continue; }
        let core;
        if (n.rest) core = 'z';
        else if (group.length > 1) core = '[' + group.map(g => abcPitch(g, state, keyAcc)).join('') + ']';
        else core = abcPitch(n, state, keyAcc);
        core += fracStr(unit(len));
        if (n.tieStart) core += '-';
        bar += pre + core + (n.slurStop ? ')'.repeat(n.slurStop) : '') + ' ';
      }
      body += bar.trim() + (i === piece.measures.length - 1 ? ' |]' : ' |') + ((i + 1) % 4 === 0 ? '\n' : ' ');
    });
    return head + body.trim() + '\n';
  }

  return { unzipMxl, parseMusicXML, toAbc };
})();
if (typeof module !== 'undefined') module.exports = MX;
