/* ============================================================
   Daily Cello · ABC reader + cello fingering engine
   - readAbc(abc): notes with midi, char positions, durations
   - fingerNotes(notes, opts): Viterbi over (string, hand frame)
   - fingerAbc(abc, opts): returns abc with finger numbers (and
     string numerals when the string changes) added to every note
     that has no fingering yet. Author fingerings are kept and
     used as constraints.
   ============================================================ */
const CELLO = {
  open: [57, 50, 43, 36],          // A, D, G, C  (index 0 = string I)
  roman: ['I', 'II', 'III', 'IV'],
  names: { en: ['A', 'D', 'G', 'C'], de: ['A', 'D', 'G', 'C'], pt: ['Lá', 'Ré', 'Sol', 'Dó'] }
};

const KEY_SIGS = { // number of sharps (+) / flats (-)
  'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7, 'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5, 'Gb': -6, 'Cb': -7,
  'Am': 0, 'Em': 1, 'Bm': 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6, 'A#m': 7, 'Dm': -1, 'Gm': -2, 'Cm': -3, 'Fm': -4, 'Bbm': -5, 'Ebm': -6, 'Abm': -7
};
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
function keyAccidentals(key) {
  const k = (key || 'C').trim().split(/\s+/)[0].replace(/min$|minor$/i, 'm').replace(/maj$|major$/i, '');
  const n = KEY_SIGS[k] != null ? KEY_SIGS[k] : 0;
  const acc = {};
  if (n > 0) SHARP_ORDER.slice(0, n).forEach(l => acc[l] = 1);
  if (n < 0) SHARP_ORDER.slice().reverse().slice(0, -n).forEach(l => acc[l] = -1);
  return acc;
}
const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/* ---- read ABC (subset used by the app) ---- */
function readAbc(abc) {
  const lines = abc.split('\n');
  let pos = 0, L = 1 / 8, keyAcc = {}, bodyStart = -1;
  const notes = [];
  // headers
  for (const ln of lines) {
    const m = /^([A-Za-z]):(.*)$/.exec(ln);
    if (m && bodyStart < 0) {
      if (m[1] === 'L') { const f = m[2].trim().split('/'); L = (+f[0]) / (+f[1] || 1); }
      if (m[1] === 'K') keyAcc = keyAccidentals(m[2].replace(/clef=\S+/, '').trim() || 'C');
      pos += ln.length + 1; continue;
    }
    if (bodyStart < 0) bodyStart = pos;
    pos += ln.length + 1;
  }
  if (bodyStart < 0) return { notes, L };
  const s = abc;
  let i = bodyStart, barAcc = {}, t = 0, inGrace = false, inChord = false, chordFirst = false, tuplet = null, bar = 0, clef = (/clef=(\w+)/.exec(abc) || [0, 'bass'])[1], slurOpen = 0;
  const events = [], barlines = {};
  const kHead = (/^K:(.*)$/m.exec(abc) || [0, 'C'])[1].replace(/clef=\S+/, '').trim() || 'C';
  const mHead = (/^M:(.*)$/m.exec(abc) || [0, '4/4'])[1].trim();
  let keyName = kHead, meter = mHead, pendingVolta = null, chordEv = null;
  const compound = () => { const f = meter.split('/').map(Number); return f[1] === 8 && f[0] % 3 === 0 && f[0] > 3; };
  let pendingDeco = [], pendingFinger = null, decoStart = -1, pendingAnn = [], tieFrom = null;
  while (i < s.length) {
    const c = s[i];
    if (c === '%') { while (i < s.length && s[i] !== '\n') i++; continue; }
    if (c === '\n') { i++; continue; }
    if (c === '!') { const j = s.indexOf('!', i + 1); if (j < 0) break; const d = s.slice(i + 1, j); if (/^[0-5]$/.test(d)) pendingFinger = +d; pendingDeco.push(d); i = j + 1; continue; }
    if (c === '"') { const j = s.indexOf('"', i + 1); if (j < 0) break; pendingAnn.push(s.slice(i + 1, j)); i = j + 1; continue; }
    if (c === '[' && /^\[\d/.test(s.slice(i))) { const m = /^\[(\d)/.exec(s.slice(i)); pendingVolta = +m[1]; (barlines[bar] = barlines[bar] || {}).volta = pendingVolta; i += m[0].length; continue; }
    if (c === '[') {
      const m = /^\[([A-Za-z]):([^\]]*)\]/.exec(s.slice(i));
      if (m) {
        if (m[1] === 'K') { const k = m[2].replace(/clef=\S+/, '').trim(); if (k) { keyAcc = keyAccidentals(k); keyName = k; barAcc = {}; } const c2 = /clef=(\w+)/.exec(m[2]); if (c2) clef = c2[1]; }
        if (m[1] === 'M') meter = m[2].trim();
        i += m[0].length; continue;
      }
      if (s[i + 1] === '|') { i++; continue; }
      inChord = true; chordFirst = true; i++; continue;
    }
    if (c === ']') {
      inChord = false;
      const m = /^\](\d*)(\/*)(\d*)(-?)/.exec(s.slice(i));
      if (chordEv && (m[1] || m[2])) {
        let f = m[1] ? +m[1] : 1; if (m[2]) f = f / (m[3] ? +m[3] : Math.pow(2, m[2].length));
        const d = chordEv.len * (f - 1); chordEv.len *= f; t += d;
      }
      if (chordEv && m[4]) { chordEv.tieStart = true; if (!chordEv.grace) tieFrom = chordEv.midi; }
      chordEv = null;
      i += m[0].length; continue;
    }
    if (c === '{') { inGrace = true; i++; continue; }
    if (c === '}') { inGrace = false; i++; continue; }
    if (c === '|' || c === ':') {
      const m = /^(:*\|+\]?:*|:+)/.exec(s.slice(i)); const tok = m[0];
      barAcc = {};
      if (tok.includes('|')) {
        const b = barlines[bar] = barlines[bar] || {};
        b.end = tok.replace(/:+$/, '') || '|';
        if (/^:/.test(tok)) b.repeatEnd = true;
        bar++;
        if (/:$/.test(tok)) (barlines[bar] = barlines[bar] || {}).repeatStart = true;
      } else if (tok.length >= 2) { // '::'
        (barlines[bar] = barlines[bar] || {}).repeatEnd = true; bar++; (barlines[bar] = barlines[bar] || {}).repeatStart = true;
      }
      i += tok.length; continue;
    }
    if (c === '(') {
      const m = /^\((\d+)(?::(\d*))?(?::(\d*))?/.exec(s.slice(i));
      if (m) {
        const p = +m[1];
        const q = m[2] ? +m[2] : ({ 2: 3, 3: 2, 4: 3, 6: 2, 8: 3 }[p] || (compound() ? 3 : 2));
        const r = m[3] ? +m[3] : p;
        tuplet = { p, q, left: r, r }; i += m[0].length;
      } else { slurOpen++; i++; }
      continue;
    }
    if (c === ')') { const last = events[events.length - 1]; if (last) last.slurEnd = (last.slurEnd || 0) + 1; i++; continue; }
    if (c === '.') { pendingDeco.push('staccato'); i++; continue; }
    const m = /^(\^\^|__|\^|_|=)?([A-Ga-gzx])([,']*)(\d*)(\/*)(\d*)/.exec(s.slice(i));
    if (m) {
      const start = i;
      const [all, acc, letter, octs, num, slashes, den] = m;
      let dur = (num ? +num : 1);
      if (slashes) dur = dur / (den ? +den : Math.pow(2, slashes.length));
      let len = dur * L, tup = null;
      if (tuplet && !inGrace && (!inChord || chordFirst)) { len = len * tuplet.q / tuplet.p; tup = { p: tuplet.p, q: tuplet.q, i: tuplet.r - tuplet.left, r: tuplet.r }; if (--tuplet.left <= 0) tuplet = null; }
      else if (tuplet && inChord && chordEv) { len = chordEv.len; }
      if (letter !== 'z' && letter !== 'x') {
        const up = letter.toUpperCase();
        let oct = letter === up ? 4 : 5;
        for (const o of octs) oct += o === ',' ? -1 : 1;
        let a;
        if (acc) { a = { '^': 1, '^^': 2, '_': -1, '__': -2, '=': 0 }[acc]; barAcc[up + oct] = a; }
        else if (barAcc[up + oct] != null) a = barAcc[up + oct];
        else a = keyAcc[up] || 0;
        const midi = (oct + 1) * 12 + STEP[up] + a;
        if (!inChord || chordFirst) {
          const tied = !inGrace && tieFrom === midi;
          const ev = { midi, start, decoStart, t, len, grace: inGrace, finger: pendingFinger, ann: pendingAnn.slice(), chord: inChord, tied, letter: up, oct, alter: a, decos: pendingDeco.slice(), bar, clef, slurStart: slurOpen, tieStart: s[i + all.length] === '-', key: keyName, meter, tup, explicitAcc: !!acc };
          slurOpen = 0;
          notes.push(ev); events.push(ev);
          if (inChord) { chordEv = ev; ev.chordNotes = []; }
          if (!inGrace) tieFrom = s[i + all.length] === '-' ? midi : null;
        } else if (chordEv) {
          chordEv.chordNotes.push({ midi, letter: up, oct, alter: a, explicitAcc: !!acc });
        }
      }
      if (letter === 'z' || letter === 'x') { tieFrom = null; if (!inGrace) events.push({ rest: true, t, len, bar, clef, decos: pendingDeco.slice(), ann: pendingAnn.slice(), invisible: letter === 'x', key: keyName, meter, tup, slurStart: 0 }); }
      if (!inGrace && (!inChord || chordFirst)) t += len;
      chordFirst = false;
      if (!inChord || letter === 'z') { pendingDeco = []; pendingFinger = null; pendingAnn = []; }
      else { pendingDeco = []; pendingFinger = null; pendingAnn = []; }
      i += all.length;
      continue;
    }
    i++;
  }
  return { notes, events, L, bodyStart, bars: bar, barlines };
}

/* ---- the fingering engine ---- */
const FRAMES = {
  closed: [0, 0, 1, 2, 3],          // finger -> semitones above the 1st finger
  ext:    [0, 0, 2, 3, 4],          // forward extension (1–2 a whole tone)
  thumb:  [0, 2, 3, 4, -1]          // index 0 = thumb at base; 1,2,3 above; no 4th
};
function candidates(midi, opt) {
  const out = [];
  CELLO.open.forEach((o, s) => {
    const off = midi - o;
    if (off < 0) return;
    if (off === 0) { out.push({ s, b: null, ft: 'open', f: 0 }); return; }
    for (const ft of ['closed', 'ext']) {
      for (let f = 1; f <= 4; f++) {
        const b = off - FRAMES[ft][f];
        if (b < 1 || b > opt.maxNeck) continue;
        if (ft === 'ext' && b > 7) continue;
        if (f === 4 && b > 9) continue;
        out.push({ s, b, ft, f });
      }
    }
    if ((opt.thumb || opt._force) && s <= 1) {
      for (let f = 0; f <= 3; f++) {
        const b = off - FRAMES.thumb[f];
        if (b < 11 || b > 26) continue;
        out.push({ s, b, ft: 'thumb', f: f === 0 ? 'T' : f });
      }
    }
  });
  return out;
}
function fingerNotes(notes, opt = {}) {
  opt = Object.assign({ maxNeck: 11, thumb: false, openCost: 1.2, legato: true }, opt);
  const seq = notes.filter(n => !n.grace && !n.tied);
  if (!seq.length) return [];
  let prev = null; // array of {c, cost, back}
  const layers = [];
  seq.forEach((n, i) => {
    let cs = candidates(n.midi, opt);
    if (!cs.length) cs = candidates(n.midi, Object.assign({}, opt, { _force: true, maxNeck: 12 }));
    if (n.finger != null) { const fc = cs.filter(c => c.f === n.finger || (n.finger === 0 && c.f === 0)); if (fc.length) cs = fc; }
    if (!cs.length) cs = [{ s: 0, b: null, ft: 'open', f: '?' }];
    const layer = cs.map(c => {
      let local = 0;
      if (c.ft === 'open') local += opt.openCost * (n.len >= 0.25 ? 1.6 : 1);
      if (c.ft === 'ext') local += 1.4;
      if (c.ft === 'thumb') local += 2.5;
      if (c.b) local += 0.12 * c.b;
      if (c.f === 4 && c.b >= 9) local += 2;
      if (c.s === 3 && c.b > 7) local += 1.5;          // high on C string
      if (c.s === 2 && c.b > 9) local += 1;
      if (!prev) return { c, cost: local, back: -1 };
      let best = Infinity, bi = -1;
      const p = seq[i - 1];
      prev.forEach((pp, j) => {
        const a = pp.c;
        let tr = 0;
        const fast = p.len < 1 / 8 + 1e-6;
        // hand position before/after (open strings keep the previous hand)
        const ha = a.b != null ? a.b : pp.hand;
        const hb = c.b != null ? c.b : ha;
        if (c.b != null && ha != null && c.b !== ha) {
          const d = Math.abs(c.b - ha);
          tr += (2.6 + 0.45 * d) * (fast ? 1.8 : 1);
          if (a.f === c.f && a.f !== 0) tr -= 0.6;            // same-finger shift: easy to guide
          if (c.ft === 'thumb' || a.ft === 'thumb') tr += 1;
        }
        if (c.b != null && ha == null) tr += 0.3;
        if (a.ft !== c.ft && a.ft !== 'open' && c.ft !== 'open' && c.b === ha) tr += 0.4;
        const ds = Math.abs(c.s - a.s);
        tr += ds === 0 ? 0 : ds === 1 ? 0.4 : 1.6 * ds;
        if (a.f === c.f && a.f !== 0 && a.s !== c.s && c.b === ha && fast) tr += 0.8;
        if (a.f === c.f && a.f !== 0 && a.s === c.s && p.midi !== n.midi && c.b === ha) tr += 4;
        if (a.ft === 'ext' && c.ft === 'closed' && c.b === ha && a.s === c.s) tr += 0.3;  // same finger across strings in fast notes
        const tot = pp.cost + tr;
        if (tot < best) { best = tot; bi = j; }
      });
      const hand = c.b != null ? c.b : (prev[bi].c.b != null ? prev[bi].c.b : prev[bi].hand);
      return { c, cost: best + local, back: bi, hand };
    });
    layer.forEach(x => { if (x.hand === undefined) x.hand = x.c.b; });
    layers.push(layer); prev = layer;
  });
  let bi = 0; prev.forEach((x, j) => { if (x.cost < prev[bi].cost) bi = j; });
  const res = new Array(seq.length);
  for (let i = layers.length - 1; i >= 0; i--) { const x = layers[i][bi]; res[i] = Object.assign({}, x.c, { hand: x.hand }); bi = x.back; }
  return res;
}

/* position names, e.g. hand b=7 on any string = "4th position" */
const POS_NAMES = { 1: '½', 2: '1', 3: '2', 4: '2½', 5: '3', 6: '3½', 7: '4', 8: '5', 9: '6' };
function posName(b) { return b >= 10 ? 'thumb' : (POS_NAMES[b] || String(b)); }

function fingerAbc(abc, opt = {}) {
  const r = readAbc(abc);
  const notes = r.notes;
  if (!notes.length) return abc;
  const fing = fingerNotes(notes, opt);
  const main = notes.filter(n => !n.grace && !n.tied);
  const ins = [];
  let lastS = -1, lastHand = null;
  main.forEach((n, i) => {
    const f = fing[i]; if (!f) return;
    n.fing = f;
    let add = '';
    if (n.finger == null && f.f !== '?' && opt.fingers !== false) add += f.f === 'T' ? '!thumb!' : '!' + f.f + '!';
    const showString = opt.strings !== false && (f.s !== lastS);
    if (showString && !n.ann.some(a => /^_/.test(a))) add += '"_' + CELLO.roman[f.s] + '"';
    lastS = f.s;
    if (add) ins.push({ at: n.start, txt: add });
  });
  // grace notes: give them the finger of the note they lead from (guide note)
  ins.sort((a, b) => b.at - a.at);
  let out = abc;
  ins.forEach(x => { out = out.slice(0, x.at) + x.txt + out.slice(x.at); });
  return out;
}
function shiftsOf(notes, fing) {
  const out = [];
  for (let i = 1; i < fing.length; i++) {
    const a = fing[i - 1], b = fing[i];
    if (a && b && b.b != null && a.hand != null && b.b !== a.hand) out.push({ i, from: notes[i - 1], to: notes[i], fa: a, fb: b, dist: b.b - a.hand });
  }
  return out;
}

if (typeof module !== 'undefined') module.exports = { readAbc, fingerNotes, fingerAbc, keyAccidentals, CELLO, posName, shiftsOf };
