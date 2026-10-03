/* ============================================================
   Daily Cello · analysis + exercise generator for any piece
   buildPiece(parsed, profile) -> { ...piece, spots, exercises }
   Uses: fingerNotes / fingerAbc (fingering.js)
   ============================================================ */
const GEN = (() => {
  const T = (en, de, pt) => ({ en, de, pt });
  const PC_SHARP = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];
  const PC_FLAT = [['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0]];
  const KEYS = { // name -> [tonic pc, minor?, fifths]
    C: [0, 0, 0], G: [7, 0, 1], D: [2, 0, 2], A: [9, 0, 3], E: [4, 0, 4], B: [11, 0, 5], 'F#': [6, 0, 6], F: [5, 0, -1], Bb: [10, 0, -2], Eb: [3, 0, -3], Ab: [8, 0, -4], Db: [1, 0, -5],
    Am: [9, 1, 0], Em: [4, 1, 1], Bm: [11, 1, 2], 'F#m': [6, 1, 3], 'C#m': [1, 1, 4], 'G#m': [8, 1, 5], Dm: [2, 1, -1], Gm: [7, 1, -2], Cm: [0, 1, -3], Fm: [5, 1, -4], Bbm: [10, 1, -5], Ebm: [3, 1, -6]
  };
  const MAJ = [0, 2, 4, 5, 7, 9, 11], HARM = [0, 2, 3, 5, 7, 8, 11], MELU = [0, 2, 3, 5, 7, 9, 11], NAT = [0, 2, 3, 5, 7, 8, 10];
  const KEY_NAMES = {
    C: T('C major', 'C-Dur', 'Dó maior'), G: T('G major', 'G-Dur', 'Sol maior'), D: T('D major', 'D-Dur', 'Ré maior'), A: T('A major', 'A-Dur', 'Lá maior'), E: T('E major', 'E-Dur', 'Mi maior'), B: T('B major', 'H-Dur', 'Si maior'), 'F#': T('F♯ major', 'Fis-Dur', 'Fá♯ maior'),
    F: T('F major', 'F-Dur', 'Fá maior'), Bb: T('B♭ major', 'B-Dur', 'Si♭ maior'), Eb: T('E♭ major', 'Es-Dur', 'Mi♭ maior'), Ab: T('A♭ major', 'As-Dur', 'Lá♭ maior'), Db: T('D♭ major', 'Des-Dur', 'Ré♭ maior'),
    Am: T('A minor', 'a-Moll', 'Lá menor'), Em: T('E minor', 'e-Moll', 'Mi menor'), Bm: T('B minor', 'h-Moll', 'Si menor'), 'F#m': T('F♯ minor', 'fis-Moll', 'Fá♯ menor'), 'C#m': T('C♯ minor', 'cis-Moll', 'Dó♯ menor'), 'G#m': T('G♯ minor', 'gis-Moll', 'Sol♯ menor'),
    Dm: T('D minor', 'd-Moll', 'Ré menor'), Gm: T('G minor', 'g-Moll', 'Sol menor'), Cm: T('C minor', 'c-Moll', 'Dó menor'), Fm: T('F minor', 'f-Moll', 'Fá menor'), Bbm: T('B♭ minor', 'b-Moll', 'Si♭ menor'), Ebm: T('E♭ minor', 'es-Moll', 'Mi♭ menor')
  };
  const keyLabel = k => KEY_NAMES[k] || T(k, k, k);

  /* ---------- spelling + ABC writing ---------- */
  function spell(midi, keyName) {
    const k = KEYS[keyName] || KEYS.C;
    const tbl = k[2] < 0 ? PC_FLAT : PC_SHARP;
    const pc = ((midi % 12) + 12) % 12;
    // prefer the key's own spelling: leading tone in minor is a sharp
    const [letter, alter] = tbl[pc];
    const octave = Math.floor((midi - alter) / 12) - 1 + (letter === 'B' && alter === 1 ? 0 : 0);
    return { step: letter, alter, octave: Math.floor((midi - STEP_PC[letter] - alter) / 12) - 1 };
  }
  const STEP_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function abcName(n, state, keyAcc) {
    const id = n.step + n.octave;
    const cur = state[id] != null ? state[id] : (keyAcc[n.step] || 0);
    let acc = '';
    if (n.alter !== cur) { acc = n.alter === 1 ? '^' : n.alter === -1 ? '_' : n.alter === 2 ? '^^' : n.alter === -2 ? '__' : '='; state[id] = n.alter; }
    let s = n.octave >= 5 ? n.step.toLowerCase() : n.step;
    if (n.octave >= 6) s += "'".repeat(n.octave - 5);
    if (n.octave <= 3) s += ','.repeat(4 - n.octave);
    return acc + s;
  }
  function lenStr(q) { // quarters -> L:1/16 units
    const u = q * 4; const r = Math.round(u * 1000) / 1000;
    if (Math.abs(r - Math.round(r)) < 1e-6) return Math.round(r) === 1 ? '' : String(Math.round(r));
    for (const d of [2, 4, 3]) if (Math.abs(r * d - Math.round(r * d)) < 1e-6) return Math.round(r * d) + '/' + d;
    return String(Math.max(1, Math.round(r)));
  }
  const STAFF = { bass: [43, 57], tenor: [50, 64], treble: [64, 77] }; // bottom/top line (G2–A3, D3–E4, E4–F5)
  function clefFor(midis, profile) {
    const reads = (profile && profile.clefs) || ['bass', 'tenor'];
    let best = 'bass', bs = Infinity;
    ['bass', 'tenor', 'treble'].filter(c => reads.includes(c) || c === 'bass').forEach(c => {
      const [lo, hi] = STAFF[c];
      const cost = midis.reduce((a, m) => a + (m < lo - 3 ? (lo - m) / 2 : m > hi + 3 ? (m - hi) / 2 : 0), 0) + (c === 'bass' ? 0 : c === 'tenor' ? 0.5 : 1.5) * midis.length * 0.05;
      if (cost < bs) { bs = cost; best = c; }
    });
    return best;
  }
  /* items: [{midi | step/alter/octave, q (quarters), rest?, tie?, slurStart?, slurEnd?, pre?, grace?:[note], label?}] */
  function makeAbc(items, o) {
    const keyName = o.key || 'C';
    const keyAcc = keyAccidentals(keyName);
    const meter = o.meter || 'none';
    const barQ = o.barQ || null;
    const pitched = items.filter(x => !x.rest && (x.midi != null || x.step));
    const midis = pitched.map(x => x.midi != null ? x.midi : (x.octave + 1) * 12 + STEP_PC[x.step] + x.alter);
    const clef = o.clef || clefFor(midis, o.profile);
    let body = '', state = {}, acc = 0;
    const reads = (o.profile && o.profile.clefs) || ['bass', 'tenor'];
    const wide = !o.clef && midis.length && (Math.max(...midis) - Math.min(...midis) > 17) && reads.includes('tenor');
    let curClef = wide ? (midis[0] >= 60 ? 'tenor' : 'bass') : clef;
    let pi = 0;
    o._lastS = undefined;
    items.forEach((x, i) => {
      let tok = '';
      if (wide && !x.rest && !x.space) {
        const m = midis[pi++];
        if (curClef === 'bass' && m >= 62) { tok += '[K:clef=tenor] '; curClef = 'tenor'; }
        else if (curClef === 'tenor' && m <= 52) { tok += '[K:clef=bass] '; curClef = 'bass'; }
      }
      if (x.slurStart) tok += '(';
      if (x.label) tok += '"^' + x.label + '"';
      if (x.below) tok += '"_' + x.below + '"';
      if (x.pre) tok += x.pre;
      if (x.f && o.fing !== false && x.f.f !== '?' && !/![0-4]!|!thumb!/.test(x.pre || '')) {
        tok += x.f.f === 'T' ? '!thumb!' : '!' + x.f.f + '!';
        if (x.f.s !== o._lastS) { tok += '"_' + CELLO.roman[x.f.s] + '"'; }
        o._lastS = x.f.s;
      }
      if (x.grace && x.grace.length) tok += '{' + x.grace.map(g => abcName(g.step ? g : spell(g.midi, keyName), state, keyAcc)).join('') + '}';
      if (x.rest) tok += 'z' + lenStr(x.q);
      else if (x.space) tok += 'x' + lenStr(x.q);
      else {
        const n = x.step ? x : spell(x.midi, keyName);
        tok += abcName(n, state, keyAcc) + lenStr(x.q);
      }
      if (x.tie) tok += '-';
      if (x.slurEnd) tok += ')';
      body += tok + ' ';
      acc += x.q;
      if (x.bar || (barQ && Math.abs(acc - barQ) < 1e-6)) { body += '| '; acc = 0; state = {}; }
    });
    body = body.trim();
    if (!/\|$/.test(body)) body += ' |';
    body = body.replace(/\|$/, '|]');
    return `X:1\nM:${meter}\nL:1/16\nK:${keyName} clef=${wide ? (midis[0] >= 60 ? 'tenor' : 'bass') : clef}\n${body}`;
  }

  /* ---------- key detection ---------- */
  function scaleSet(name, wide) { const k = KEYS[name]; const base = k[1] ? (wide ? HARM.concat(MELU) : HARM) : MAJ; return new Set(base.map(x => (x + k[0]) % 12)); }
  function bestKey(pcs, exclude) {
    let best = null, bs = -1;
    Object.keys(KEYS).forEach(k => {
      if (exclude && exclude.includes(k)) return;
      const set = scaleSet(k, true);
      const score = pcs.reduce((a, pc) => a + (set.has(pc) ? 1 : -1.5), 0);
      if (score > bs) { bs = score; best = k; }
    });
    return { key: best, score: bs };
  }

  /* ---------- analysis ---------- */
  function melodyOf(parsed) {
    const out = [];
    parsed.notes.forEach(n => {
      if (n.grace || n.chord) return;
      if (n.rest) { out.push({ rest: true, q: n.dur, t: n.t, measure: n.measure }); return; }
      const prev = out[out.length - 1];
      if (n.tieStop && prev && !prev.rest && prev.midi === n.midi) { prev.q += n.dur; prev.tieLen = (prev.tieLen || 1) + 1; return; }
      out.push({ midi: n.midi, step: n.step, alter: n.alter, octave: n.octave, q: n.dur, t: n.t, measure: n.measure, finger: n.finger, slurStart: n.slurStart, slurEnd: n.slurStop, dyn: n.dyn });
    });
    return out;
  }

  function analyse(parsed, profile) {
    const mel = melodyOf(parsed);
    const notes = mel.filter(n => !n.rest);
    const opt = fingerOpts(profile);
    const fing = fingerNotes(notes.map(n => ({ midi: n.midi, len: n.q / 4, finger: n.finger })), opt);
    notes.forEach((n, i) => { n.f = fing[i]; });
    const tempo = parsed.tempo || 72;
    const secQ = 60 / tempo;
    const home = parsed.key.name;
    const homeSet = scaleSet(home);
    const M = {};
    parsed.measures.forEach(m => { M[m.n] = { n: m.n, notes: [], shifts: [], fast: 0, leaps: [], chrom: [], longs: [], cross: 0, high: 0, hair: 0 }; });
    notes.forEach((n, i) => {
      const m = M[n.measure]; if (!m) return;
      m.notes.push(n);
      const p = notes[i - 1];
      if (n.q * secQ < 0.3 || (n.q <= 0.5 && n.q * secQ < 0.7)) m.fast++;
      if (!homeSet.has(n.midi % 12)) m.chrom.push(n);
      if (n.q * secQ >= 2.6) m.longs.push(n);
      if (n.f && n.f.b != null && n.f.b >= 10) m.high++;
      if (p && n.f && p.f) {
        if (n.f.s !== p.f.s) m.cross += (n.q * secQ < 0.35 ? 1 : 0.3);
        if (n.f.b != null && p.f.hand != null && n.f.b !== p.f.hand) m.shifts.push({ from: p, to: n, dist: n.f.b - p.f.hand });
        if (Math.abs(n.midi - p.midi) >= 8) m.leaps.push({ from: p, to: n });
      }
      if (n.dyn) m.hair++;
    });
    // signature for repeated measures
    Object.values(M).forEach(m => { m.sig = m.notes.map(n => n.midi + ':' + n.q).join(','); });
    const scores = {
      run: m => m.fast >= 4 ? m.fast + m.shifts.length * 1.5 : 0,
      shift: m => m.shifts.reduce((a, s) => a + 1 + Math.abs(s.dist) * 0.35, 0) * (m.fast ? 1.4 : 1),
      leap: m => m.leaps.length * 1.5,
      chrom: m => m.chrom.length >= 2 ? m.chrom.length : 0,
      long: m => m.longs.reduce((a, n) => a + n.q * secQ / 2.6, 0),
      cross: m => m.cross >= 3 ? m.cross : 0,
      high: m => m.high * 1.2
    };
    const used = new Set(), spots = [];
    const order = ['run', 'shift', 'chrom', 'long', 'leap', 'cross', 'high'];
    const thresh = { run: 4, shift: 2.4, chrom: 2, long: 1.5, leap: 3, cross: 3, high: 2 };
    for (let round = 0; round < 2; round++) {
      order.forEach(type => {
        let best = null, bs = 0;
        Object.values(M).forEach(m => { if (used.has(m.n)) return; const sc = scores[type](m); if (sc > bs) { bs = sc; best = m; } });
        if (!best || bs < thresh[type] * (round ? 1.4 : 1)) return;
        const bars = [best.n];
        // extend to the next bar when it continues the difficulty
        const nx = M[best.n + 1]; if (nx && !used.has(nx.n) && scores[type](nx) >= thresh[type] * 0.8 && type !== 'long') bars.push(nx.n);
        const twins = Object.values(M).filter(m => m.n !== best.n && m.sig && m.sig === best.sig).map(m => m.n);
        bars.concat(twins).forEach(b => used.add(b));
        spots.push({ type, bars, also: twins, score: bs });
      });
    }
    spots.sort((a, b) => a.bars[0] - b.bars[0]);
    // modulation: best key of the chromatic measures
    const chromPcs = Object.values(M).filter(m => m.chrom.length >= 2).flatMap(m => m.notes.map(n => n.midi % 12));
    let second = null;
    if (chromPcs.length >= 6) { const bk = bestKey(chromPcs, [home]); if (bk.score > chromPcs.length * 0.4) second = bk.key; }
    const range = [Math.min(...notes.map(n => n.midi)), Math.max(...notes.map(n => n.midi))];
    const maxHand = Math.max(0, ...notes.map(n => (n.f && n.f.b) || 0));
    return { mel, notes, measures: M, spots, second, range, maxHand, tempo };
  }
  function fingerOpts(profile) {
    const lv = (profile && profile.positions) || 'neck';
    return { maxNeck: lv === 'first' ? 2 : lv === 'fourth' ? 7 : 11, thumb: lv === 'thumb', openCost: lv === 'first' ? 0.2 : 1.2 };
  }

  /* ---------- exercise builders ---------- */
  const SPOT_NAMES = {
    run: T('Fast passage', 'Schnelle Stelle', 'Passagem rápida'), shift: T('Shifts', 'Lagenwechsel', 'Mudanças de posição'),
    leap: T('Big leaps', 'Große Sprünge', 'Saltos grandes'), chrom: T('Accidentals', 'Vorzeichen', 'Acidentes'),
    long: T('Long notes', 'Lange Töne', 'Notas longas'), cross: T('String crossings', 'Saitenwechsel', 'Mudanças de corda'),
    high: T('High position', 'Hohe Lage', 'Posição aguda')
  };
  const SPOT_WHAT = {
    run: T('Many quick notes in a row. Even rhythm and clear fingers.', 'Viele schnelle Töne hintereinander. Gleichmäßiger Rhythmus, klare Finger.', 'Muitas notas rápidas seguidas. Ritmo igual e dedos claros.'),
    shift: T('The hand changes position several times. Calm arm, sure arrivals.', 'Die Hand wechselt mehrmals die Lage. Ruhiger Arm, sichere Ankunft.', 'A mão muda de posição várias vezes. Braço calmo, chegadas seguras.'),
    leap: T('Large jumps between notes. Hear the target before you play it.', 'Große Sprünge zwischen Tönen. Den Zielton hören, bevor du ihn spielst.', 'Saltos grandes entre notas. Ouve o alvo antes de o tocar.'),
    chrom: T('Notes outside the key. Each accidental is a new colour to tune.', 'Töne außerhalb der Tonart. Jedes Vorzeichen ist eine neue Farbe.', 'Notas fora da tonalidade. Cada acidente é uma nova cor a afinar.'),
    long: T('Long notes that must stay alive to the end.', 'Lange Töne, die bis zum Ende leben müssen.', 'Notas longas que têm de viver até ao fim.'),
    cross: T('Fast changes between strings. The bow arm leads.', 'Schnelle Wechsel zwischen den Saiten. Der Bogenarm führt.', 'Mudanças rápidas entre cordas. O braço do arco conduz.'),
    high: T('High on the string, maybe thumb position. Find a landmark.', 'Hoch auf der Saite, vielleicht Daumenlage. Finde einen Wegweiser.', 'No agudo da corda, talvez posição de polegar. Encontra um marco.')
  };
  const barsTxt = s => s.bars.concat(s.also).sort((a, b) => a - b);
  const passageItems = (A, bars) => {
    const out = [];
    bars.forEach(b => {
      const notes = A.mel.filter(n => n.measure === b);
      notes.forEach((n, i) => out.push(Object.assign({}, n, { bar: i === notes.length - 1, pre: n.dyn && /^(pp|p|mp|mf|f|ff)$/.test(n.dyn) ? '!' + n.dyn + '!' : '' })));
    });
    return out;
  };
  const N = (n, extra) => Object.assign({ step: n.step, alter: n.alter, octave: n.octave, midi: n.midi, f: n.f }, extra);
  function ex(id, phase, min, tags, title, why, steps, checks, music, tools, spot) {
    return { id, phase, min, prio: 2, tags, title, why, steps, checks, music, tools: tools || {}, spot: spot || null, generated: true };
  }

  function buildExercises(parsed, A, profile) {
    const key = parsed.key.name, meterStr = `${parsed.time.beats}/${parsed.time.beatType}`;
    const barQ = parsed.time.beats * 4 / parsed.time.beatType;
    const tempo = A.tempo;
    const exs = [];
    const fo = fingerOpts(profile);
    const fa = abc => fingerAbc(abc, Object.assign({}, fo, { openCost: 0.15 }));
    const kl = keyLabel(key);
    // ---- scales
    const ton = KEYS[key] ? KEYS[key][0] : 0, minor = KEYS[key] && KEYS[key][1];
    let low = 36 + ((ton - 0 + 12) % 12); // tonic in the C-string octave
    if (low < 36) low += 12;
    const octs = (profile && profile.positions === 'first') ? 1 : 2;
    const degsUp = minor ? MELU : MAJ, degsDown = minor ? NAT : MAJ;
    const scaleUp = [], scaleDown = [];
    for (let o = 0; o < octs; o++) degsUp.forEach(d => scaleUp.push(low + 12 * o + d));
    scaleUp.push(low + 12 * octs);
    for (let o = octs - 1; o >= 0; o--) degsDown.slice().reverse().forEach(d => scaleDown.push(low + 12 * o + d));
    const group = parsed.time.beats % 3 === 0 ? 3 : 4;
    const scaleItems = scaleUp.concat(scaleDown).map((m, i, arr) => ({ midi: m, q: 1, slurStart: i % group === 0 && i < arr.length - 1, slurEnd: i % group === group - 1 || i === arr.length - 2, bar: (i + 1) % (group * 2) === 0 }));
    scaleItems[scaleItems.length - 1].q = 2; scaleItems[scaleItems.length - 1].slurEnd = false;
    exs.push(ex('g-scale', 'scales', 4, ['intonation', 'bow', 'tone'], T(`${kl.en}, ${octs} octave${octs > 1 ? 's' : ''}`, `${kl.de}, ${octs} Oktave${octs > 1 ? 'n' : ''}`, `${kl.pt}, ${octs} oitava${octs > 1 ? 's' : ''}`),
      T(`The home key of the piece. ${group} notes per bow, like the slurs you will play.`, `Die Grundtonart des Stücks. ${group} Töne pro Bogen.`, `A tonalidade da peça. ${group} notas por arco.`),
      [T('Drone on the tonic. Slowly, listening to every half step.', 'Bordun auf dem Grundton. Langsam, auf jeden Halbton hören.', 'Bordão na tónica. Devagar, a ouvir cada meio-tom.'), T(`${group} notes per bow, equal parts of the bow.`, `${group} Töne pro Bogen, gleiche Bogenteile.`, `${group} notas por arco, partes iguais do arco.`), T('Last round: crescendo up, diminuendo down.', 'Letzte Runde: Crescendo aufwärts, Diminuendo abwärts.', 'Última volta: crescendo a subir, diminuendo a descer.')],
      [T('Leading tone close to the tonic', 'Leitton nah am Grundton', 'Sensível perto da tónica'), T('Even notes per bow', 'Gleichmäßige Töne pro Bogen', 'Notas iguais por arco'), T('Shifts silent', 'Lagenwechsel lautlos', 'Mudanças silenciosas')],
      [{ label: T('scale · fingering suggested', 'Tonleiter · Fingersatz-Vorschlag', 'escala · dedilhação sugerida'), abc: fa(makeAbc(scaleItems, { key, meter: 'none', profile })) }],
      { metro: { bpm: 60, target: 84, step: 4, beats: group, sub: 1 }, drone: { notes: [midiName(low), midiName(low + 7)] } }));
    // arpeggio
    const triad = minor ? [0, 3, 7] : [0, 4, 7];
    const arp = []; for (let o = 0; o < octs; o++) triad.forEach(d => arp.push(low + 12 * o + d)); arp.push(low + 12 * octs);
    const arpAll = arp.concat(arp.slice(0, -1).reverse());
    exs.push(ex('g-arp', 'scales', 3, ['intonation', 'shift'], T(`${kl.en} arpeggio`, `${kl.de}-Dreiklang`, `Arpejo de ${kl.pt}`),
      T('Chord notes are the landmarks of the melody. Know where they are and every phrase gets easier.', 'Akkordtöne sind die Wegweiser der Melodie.', 'As notas do acorde são os marcos da melodia.'),
      [T('Slurs of three, very slowly.', 'Dreierbindungen, sehr langsam.', 'Ligaduras de três, muito devagar.'), T('Stop on the top note and check it with the tuner.', 'Auf dem höchsten Ton anhalten und mit dem Stimmgerät prüfen.', 'Para na nota de cima e verifica com o afinador.')],
      [T('Every note in tune', 'Jeder Ton sauber', 'Todas as notas afinadas'), T('Hand frame stays the same', 'Handrahmen bleibt gleich', 'A moldura da mão mantém-se')],
      [{ label: T('arpeggio', 'Dreiklang', 'arpejo'), abc: fa(makeAbc(arpAll.map((m, i, a) => ({ midi: m, q: i === a.length - 1 ? 2 : 1, slurStart: i % 3 === 0 && i < a.length - 1, slurEnd: i % 3 === 2, bar: (i + 1) % 6 === 0 })), { key, meter: 'none', profile })) }],
      { metro: { bpm: 56, target: 76, step: 4, beats: 3, sub: 1 }, drone: { notes: [midiName(low), midiName(low + 7)] }, tuner: { targets: arp.slice(-3).map(midiName) } }));
    if (A.second) {
      const k2 = A.second, kl2 = keyLabel(k2), t2 = KEYS[k2][0];
      let lo2 = 36 + t2; const up2 = [], dn2 = [];
      const deg2 = KEYS[k2][1] ? MELU : MAJ, dd2 = KEYS[k2][1] ? NAT : MAJ;
      for (let o = 0; o < octs; o++) deg2.forEach(d => up2.push(lo2 + 12 * o + d)); up2.push(lo2 + 12 * octs);
      for (let o = octs - 1; o >= 0; o--) dd2.slice().reverse().forEach(d => dn2.push(lo2 + 12 * o + d));
      const it2 = up2.concat(dn2).map((m, i, arr) => ({ midi: m, q: 1, bar: (i + 1) % 8 === 0 })); it2[it2.length - 1].q = 2;
      exs.push(ex('g-scale2', 'scales', 3, ['intonation', 'left'], T(`${kl2.en}: the second key`, `${kl2.de}: die zweite Tonart`, `${kl2.pt}: a segunda tonalidade`),
        T('The piece visits this key. Its scale is already hidden in the accidentals.', 'Das Stück besucht diese Tonart. Ihre Tonleiter steckt in den Vorzeichen.', 'A peça visita esta tonalidade. A escala está escondida nos acidentes.'),
        [T('Drone on the new tonic. Hear the colour change.', 'Bordun auf dem neuen Grundton. Höre den Farbwechsel.', 'Bordão na nova tónica. Ouve a mudança de cor.')],
        [T('Accidentals in tune', 'Vorzeichen sauber', 'Acidentes afinados'), T('You hear the new colour', 'Du hörst die neue Farbe', 'Ouves a nova cor')],
        [{ label: T('scale', 'Tonleiter', 'escala'), abc: fa(makeAbc(it2, { key: k2, meter: 'none', profile })) }],
        { metro: { bpm: 56, target: 76, step: 4, beats: 4, sub: 1 }, drone: { notes: [midiName(lo2), midiName(lo2 + 7)] } }));
    }
    // ---- spots
    const spotsOut = [];
    A.spots.forEach((s, si) => {
      const sid = 'g' + si + '-' + s.type;
      const bars = s.bars;
      const allBars = barsTxt(s);
      const spot = { id: sid, bars: allBars, color: (si % 8) + 1, name: SPOT_NAMES[s.type], what: SPOT_WHAT[s.type], type: s.type };
      spotsOut.push(spot);
      const asWritten = { label: T(`bar${bars.length > 1 ? 's' : ''} ${bars.join('–')}, as written`, `Takt ${bars.join('–')}, wie notiert`, `c. ${bars.join('–')}, como escrito`), abc: makeAbc(passageItems(A, bars), { key, meter: meterStr, profile }) };
      const pTempo = Math.round(tempo);
      const slow = Math.max(36, Math.round(pTempo * 0.55));
      const pnotes = A.notes.filter(n => bars.includes(n.measure));
      if (s.type === 'run' || s.type === 'cross') {
        const steps = { label: T('one note per beat · use these fingers', 'ein Ton pro Schlag · mit diesen Fingern', 'uma nota por tempo · com estes dedos'), abc: makeAbc(pnotes.map((n, i) => N(n, { q: 1, bar: (i + 1) % 4 === 0 })), { key, meter: 'none', profile }) };
        const dotted = { label: T('long – short', 'lang – kurz', 'longa – curta'), abc: makeAbc(pnotes.map((n, i) => N(n, { q: i % 2 ? 0.25 : 0.75, bar: (i + 1) % 8 === 0 })), { key, meter: 'none', profile }) };
        const rev = { label: T('short – long', 'kurz – lang', 'curta – longa'), abc: makeAbc(pnotes.map((n, i) => N(n, { q: i % 2 ? 0.75 : 0.25, bar: (i + 1) % 8 === 0 })), { key, meter: 'none', profile }) };
        const music = [steps, dotted, rev, asWritten];
        if (s.type === 'cross') {
          const open = { label: T('open strings only · same rhythm', 'nur leere Saiten · gleicher Rhythmus', 'só cordas soltas · mesmo ritmo'), abc: makeAbc(pnotes.map((n, i) => ({ midi: n.f ? CELLO.open[n.f.s] : n.midi, q: n.q, bar: false })), { key: 'C', meter: 'none', clef: 'bass', profile }) };
          music.splice(0, 3, open, steps);
        }
        exs.push(ex(sid + '-a', 'spots', 5, s.type === 'run' ? ['rhythm', 'left', 'shift'] : ['bow'], s.type === 'run' ? T('Slow motion and rhythms', 'Zeitlupe und Rhythmen', 'Câmara lenta e ritmos') : T('Open strings first', 'Zuerst leere Saiten', 'Primeiro cordas soltas'),
          s.type === 'run' ? T('Rhythm variations make each note once long, once short. Afterwards the even notes feel easy.', 'Rhythmusvarianten machen jeden Ton einmal lang, einmal kurz. Danach sind gleichmäßige Töne leicht.', 'Variações rítmicas tornam cada nota longa e curta. Depois as notas iguais ficam fáceis.') : T('Play only the bow part first: the string pattern on open strings. Then add the left hand.', 'Zuerst nur den Bogen: das Saitenmuster auf leeren Saiten. Dann die linke Hand dazu.', 'Primeiro só o arco: o padrão de cordas em cordas soltas. Depois junta a mão esquerda.'),
          s.type === 'run' ? [T('a: one note per beat. Feel every finger and every shift.', 'a: ein Ton pro Schlag. Jeden Finger und Wechsel spüren.', 'a: uma nota por tempo. Sente cada dedo e cada mudança.'), T('b and c: dotted rhythms. On long notes, prepare the next finger.', 'b und c: punktiert. Auf langen Tönen den nächsten Finger vorbereiten.', 'b e c: pontuado. Nas notas longas, prepara o dedo seguinte.'), T('d: as written. Raise the tempo step by step.', 'd: wie notiert. Tempo schrittweise steigern.', 'd: como escrito. Sobe o andamento passo a passo.')]
            : [T('a: open strings in the same rhythm. Arm level changes early and round.', 'a: leere Saiten im gleichen Rhythmus. Armebene früh und rund wechseln.', 'a: cordas soltas no mesmo ritmo. Muda o nível do braço cedo e redondo.'), T('b: slowly with the fingers.', 'b: langsam mit Fingern.', 'b: devagar com os dedos.'), T('c: as written.', 'c: wie notiert.', 'c: como escrito.')],
          [T('Even rhythm', 'Gleichmäßiger Rhythmus', 'Ritmo igual'), T('Shifts on time', 'Wechsel rechtzeitig', 'Mudanças a tempo'), T('Clean at the goal tempo', 'Sauber im Zieltempo', 'Limpo no andamento final')],
          music, { metro: { bpm: slow, target: pTempo, step: 4, beats: parsed.time.beats, sub: 2 } }, sid));
      }
      if (s.type === 'shift' || s.type === 'run') {
        const shifts = A.notes.slice(1).map((n, i) => ({ a: A.notes[i], b: n })).filter(p => bars.includes(p.b.measure) && p.b.f && p.a.f && p.b.f.b != null && p.a.f.hand != null && p.b.f.b !== p.a.f.hand).slice(0, 4);
        if (shifts.length) {
          const items = [];
          shifts.forEach((p, k) => {
            const fa0 = p.a.f, fb = p.b.f;
            let guide = null;
            if (fa0.s === fb.s && typeof fa0.f === 'number' && fa0.f > 0 && fb.ft !== 'thumb' && fa0.ft !== 'thumb') guide = CELLO.open[fb.s] + fb.b + FRAMES.closed[fa0.f];
            if (guide === p.b.midi || guide === p.a.midi) guide = null;
            items.push(N(p.a, { q: 2 }));
            items.push(N(p.b, { q: 2, grace: guide ? [{ midi: guide }] : null, bar: true }));
          });
          exs.push(ex(sid + '-g', 'spots', 4, ['shift', 'left', 'intonation'], T('Guide notes for the shifts', 'Leittöne für die Lagenwechsel', 'Notas-guia para as mudanças'),
            T('The small note is the finger you slide on. Hearing it teaches the arm the distance. Later the slide disappears.', 'Die kleine Note ist der Finger, auf dem du gleitest. Sie lehrt den Arm die Distanz. Später verschwindet das Gleiten.', 'A nota pequena é o dedo em que deslizas. Ensina a distância ao braço. Depois o deslize desaparece.'),
            [T('Play the first note. Slide on the same finger to the small note, softly audible.', 'Spiele den ersten Ton. Gleite auf demselben Finger zur kleinen Note, leise hörbar.', 'Toca a primeira nota. Desliza no mesmo dedo até à nota pequena, suavemente audível.'), T('Then put the new finger down for the arrival note.', 'Dann den neuen Finger für den Zielton aufsetzen.', 'Depois pousa o dedo novo para a nota de chegada.'), T('The arm moves; the thumb travels with the hand.', 'Der Arm bewegt sich; der Daumen reist mit der Hand.', 'O braço move-se; o polegar viaja com a mão.'), T('Each round lighter, until the slide is invisible.', 'Jede Runde leichter, bis das Gleiten unsichtbar ist.', 'Cada volta mais leve, até o deslize ficar invisível.')],
            [T('Small note heard, softly', 'Kleine Note leise hörbar', 'Nota pequena ouvida, suave'), T('Arm moves before the new note', 'Arm bewegt sich vor dem neuen Ton', 'O braço move-se antes da nova nota'), T('Arrival in tune', 'Ankunft sauber', 'Chegada afinada')],
            [{ label: T('the shifts of this passage', 'die Lagenwechsel dieser Stelle', 'as mudanças desta passagem'), abc: makeAbc(items, { key, meter: 'none', profile }) }, asWritten],
            { metro: { bpm: slow, target: pTempo, step: 2, beats: parsed.time.beats, sub: 1 }, tuner: { targets: shifts.map(p => midiName(p.b.midi)) } }, sid));
        }
      }
      if (s.type === 'leap') {
        const lp = A.notes.slice(1).map((n, i) => ({ a: A.notes[i], b: n })).filter(p => bars.includes(p.b.measure) && Math.abs(p.b.midi - p.a.midi) >= 8).slice(0, 4);
        const items = []; lp.forEach(p => { items.push(N(p.a, { q: 2 })); items.push(N(p.b, { q: 2, bar: true })); });
        exs.push(ex(sid + '-l', 'spots', 3, ['shift', 'intonation'], T('Hear the leap first', 'Den Sprung zuerst hören', 'Ouvir o salto primeiro'),
          T('A leap is safe when the ear knows the target. Sing it, then play it.', 'Ein Sprung ist sicher, wenn das Ohr das Ziel kennt. Erst singen, dann spielen.', 'Um salto é seguro quando o ouvido conhece o alvo. Canta e depois toca.'),
          [T('Press "Play target" and sing the arrival note.', 'Drücke „Zielton" und singe den Zielton.', 'Carrega em "Ouvir alvo" e canta a nota de chegada.'), T('Play both notes long, slowly sliding between them.', 'Beide Töne lang spielen, langsam dazwischen gleiten.', 'Toca as duas notas longas, a deslizar devagar entre elas.'), T('Then a quick, light jump. Land softly.', 'Dann ein schneller, leichter Sprung. Weich landen.', 'Depois um salto rápido e leve. Aterra suavemente.')],
          [T('Target sung first', 'Ziel zuerst gesungen', 'Alvo cantado primeiro'), T('Soft landing', 'Weiche Landung', 'Aterragem suave'), T('Arrival green', 'Ankunft grün', 'Chegada verde')],
          [{ label: T('the leaps', 'die Sprünge', 'os saltos'), abc: makeAbc(items, { key, meter: 'none', profile }) }, asWritten], { tuner: { targets: lp.map(p => midiName(p.b.midi)) } }, sid));
      }
      if (s.type === 'chrom') {
        const accs = pnotes.filter(n => !scaleSet(key).has(n.midi % 12));
        const pairs = []; accs.slice(0, 4).forEach(n => { const nb = pnotes[pnotes.indexOf(n) + 1]; pairs.push(N(n, { q: 2 })); if (nb) pairs.push(N(nb, { q: 2, bar: true })); else pairs[pairs.length - 1].bar = true; });
        const tonic = A.second ? KEYS[A.second][0] : ton;
        exs.push(ex(sid + '-c', 'spots', 4, ['intonation', 'left'], T('Accidentals in tune', 'Vorzeichen sauber', 'Acidentes afinados'),
          T('Each accidental leans somewhere: a sharp usually pulls up, a flat pulls down. Tune it against a drone.', 'Jedes Vorzeichen strebt irgendwohin: Kreuz meist nach oben, B nach unten. Gegen einen Bordun stimmen.', 'Cada acidente inclina-se: um sustenido puxa para cima, um bemol para baixo. Afina contra um bordão.'),
          [T('a: each accidental and the note after it, long, with the drone.', 'a: jedes Vorzeichen und der Ton danach, lang, mit Bordun.', 'a: cada acidente e a nota seguinte, longas, com bordão.'), T('b: the passage slowly. Fingers touch on half steps.', 'b: die Stelle langsam. Finger berühren sich bei Halbtönen.', 'b: a passagem devagar. Os dedos tocam-se nos meios-tons.')],
          [T('Every accidental green', 'Jedes Vorzeichen grün', 'Cada acidente verde'), T('Half steps small', 'Halbtöne klein', 'Meios-tons pequenos')],
          [{ label: T('accidentals and where they lead', 'Vorzeichen und wohin sie führen', 'acidentes e para onde levam'), abc: makeAbc(pairs, { key, meter: 'none', profile }) }, asWritten],
          { drone: { notes: [midiName(36 + tonic + (tonic < 7 ? 12 : 0)), midiName(43 + tonic + (tonic < 7 ? 12 : 0))] }, tuner: { targets: accs.slice(0, 6).map(n => midiName(n.midi)) } }, sid));
      }
      if (s.type === 'long') {
        const ln = A.measures[bars[0]].longs[0] || pnotes[0];
        const secs = Math.round(ln.q * 60 / tempo);
        const str = ln.f ? ln.f.s : 0;
        exs.push(ex(sid + '-t', 'spots', 4, ['bow', 'tone', 'vibrato'], T('Keep the long note alive', 'Den langen Ton lebendig halten', 'Manter viva a nota longa'),
          T(`This note lasts about ${secs} seconds. Plan the bow, start slowly, and keep the vibrato going to the very end.`, `Dieser Ton dauert etwa ${secs} Sekunden. Bogen planen, langsam beginnen, Vibrato bis zum Ende.`, `Esta nota dura cerca de ${secs} segundos. Planeia o arco, começa devagar e mantém o vibrato até ao fim.`),
          [T('a: the open string for the whole timer, same sound to the end.', 'a: die leere Saite über die ganze Zeit, gleicher Klang bis zum Ende.', 'a: a corda solta durante todo o tempo, o mesmo som até ao fim.'), T('b: the note itself, with vibrato pulses: 2, then 3, then 4 per beat.', 'b: der Ton selbst, mit Vibrato-Pulsen: 2, dann 3, dann 4 pro Schlag.', 'b: a própria nota, com pulsações de vibrato: 2, 3 e 4 por tempo.'), T('c: in the passage.', 'c: in der Stelle.', 'c: na passagem.')],
          [T('Bow lasts to the end', 'Bogen reicht bis zum Ende', 'O arco chega ao fim'), T('Vibrato from start to end', 'Vibrato von Anfang bis Ende', 'Vibrato do início ao fim'), T('Note green while vibrating', 'Ton grün beim Vibrieren', 'Nota verde a vibrar')],
          [{ label: T('open string, one bow', 'leere Saite, ein Bogen', 'corda solta, um arco'), abc: makeAbc([{ midi: CELLO.open[str], q: Math.min(8, ln.q), pre: '!0!' }], { key: 'C', meter: 'none', clef: 'bass', profile }) },
           { label: T('vibrato pulses', 'Vibrato-Pulse', 'pulsações de vibrato'), abc: makeAbc([2, 3, 4].map(k => N(ln, { q: 4, label: k + '×', bar: true })), { key, meter: 'none', profile }) }, asWritten],
          { timer: { sec: Math.max(4, secs) }, tuner: { targets: [midiName(ln.midi)] } }, sid));
      }
      if (s.type === 'high') {
        const hi = pnotes.reduce((a, n) => n.midi > a.midi ? n : a, pnotes[0]);
        const str = hi.f ? hi.f.s : 0, harm = CELLO.open[str] + 12;
        exs.push(ex(sid + '-h', 'spots', 3, ['shift', 'intonation'], T('The harmonic landmark', 'Der Flageolett-Wegweiser', 'O harmónico como marco'),
          T('Halfway up the string is the octave harmonic. It is always in the same place, so it is a perfect landmark for high notes.', 'In der Mitte der Saite liegt das Oktav-Flageolett. Es ist immer am gleichen Ort: ein perfekter Wegweiser.', 'A meio da corda está o harmónico de oitava. Está sempre no mesmo sítio: um marco perfeito.'),
          [T('a: open string, then the harmonic (touch lightly).', 'a: leere Saite, dann das Flageolett (leicht berühren).', 'a: corda solta, depois o harmónico (toca levemente).'), T('b: from the harmonic to the high note. Press now.', 'b: vom Flageolett zum hohen Ton. Jetzt drücken.', 'b: do harmónico para a nota aguda. Agora pressiona.'), T('c: the passage.', 'c: die Stelle.', 'c: a passagem.')],
          [T('Harmonic rings clear', 'Flageolett klingt klar', 'Harmónico soa claro'), T('High note green', 'Hoher Ton grün', 'Nota aguda verde')],
          [{ label: T('landmark', 'Wegweiser', 'marco'), abc: makeAbc([{ midi: CELLO.open[str], q: 2, pre: '!0!"_' + CELLO.roman[str] + '"' }, { midi: harm, q: 2, pre: '!open!', label: 'harm.', bar: true }], { key: 'C', meter: 'none', profile }) },
           { label: T('to the high note', 'zum hohen Ton', 'até à nota aguda'), abc: makeAbc([{ midi: harm, q: 2, pre: '!open!"_' + CELLO.roman[str] + '"', label: 'harm.' }, N(hi, { q: 2, bar: true })], { key, meter: 'none', profile, fing: true }) }, asWritten],
          { tuner: { targets: [midiName(harm), midiName(hi.midi)] } }, sid));
      }
    });
    // ---- music & creativity
    const firstBars = A.mel.filter(n => n.measure <= 2 && !n.rest);
    const motif = firstBars.slice(0, Math.min(6, firstBars.length));
    if (motif.length >= 3) {
      const items = [];
      for (let k = 0; k < 3; k++) {
        motif.forEach((n, i) => items.push(N(n, { q: Math.min(2, n.q), label: i === 0 ? (k ? '' : 'motif') : '' })));
        items[items.length - 1].bar = true;
        items.push({ rest: true, q: Math.min(8, motif.reduce((a, n) => a + Math.min(2, n.q), 0)), label: 'your answer', bar: true });
      }
      exs.push(ex('g-echo', 'music', 3, ['creative', 'musical'], T('Motif and echo', 'Motiv und Echo', 'Motivo e eco'),
        T('Answer the opening motif with your own. Change one thing: direction, rhythm or register. This is how composers vary a theme.', 'Beantworte das Anfangsmotiv mit deinem eigenen. Ändere eine Sache: Richtung, Rhythmus oder Lage.', 'Responde ao motivo inicial com o teu. Muda uma coisa: direção, ritmo ou registo.'),
        [T('Play the motif, then improvise an answer in the empty bar.', 'Spiele das Motiv, dann improvisiere eine Antwort im leeren Takt.', 'Toca o motivo e improvisa uma resposta no compasso vazio.'), T('Write the answer you liked best in your notes.', 'Schreib die beste Antwort in deine Notizen.', 'Escreve a resposta de que mais gostaste nas notas.')],
        [T('Each answer changes one thing', 'Jede Antwort ändert eine Sache', 'Cada resposta muda uma coisa'), T('Each answer ends on a long note', 'Jede Antwort endet lang', 'Cada resposta acaba longa'), T('One answer written down', 'Eine Antwort notiert', 'Uma resposta escrita')],
        [{ label: T('motif · your answer', 'Motiv · deine Antwort', 'motivo · a tua resposta'), abc: makeAbc(items, { key, meter: 'none', profile }), perLine: 2 }], { fing: true }));
      let inv = motif.map(n => ({ midi: motif[0].midi - (n.midi - motif[0].midi), q: Math.min(2, n.q) }));
      const top = Math.max(...motif.map(n => n.midi)); while (Math.max(...inv.map(x => x.midi)) > top + 2) inv = inv.map(x => ({ midi: x.midi - 12, q: x.q }));
      exs.push(ex('g-var', 'music', 3, ['creative', 'rhythm'], T('The opening, three ways', 'Der Anfang, dreimal anders', 'O início, de três maneiras'),
        T('Varying a phrase makes you choose bow, rhythm and character on purpose. When you go back to the original it sounds like a decision.', 'Eine Phrase zu variieren lässt dich Bogen, Rhythmus und Charakter bewusst wählen.', 'Variar uma frase obriga-te a escolher arco, ritmo e carácter.'),
        [T('Play a, b, c, then invent your own d.', 'Spiele a, b, c, dann erfinde dein d.', 'Toca a, b, c e inventa o teu d.'), T('Finish with a again.', 'Zum Schluss wieder a.', 'Termina com a outra vez.')],
        [T('Each version clearly different', 'Jede Version deutlich anders', 'Cada versão bem diferente'), T('Your own version', 'Deine eigene Version', 'A tua versão')],
        [{ label: T('original', 'Original', 'original'), abc: makeAbc(motif.map(n => N(n, { q: Math.min(2, n.q) })), { key, meter: 'none', profile }) },
         { label: T('dotted', 'punktiert', 'pontuado'), abc: makeAbc(motif.map((n, i) => N(n, { q: i % 2 ? 0.5 : 1.5 })), { key, meter: 'none', profile }) },
         { label: T('upside down', 'umgekehrt', 'ao contrário'), abc: fa(makeAbc(inv, { key, meter: 'none', profile })) }], { fing: true }));
    }
    exs.push(ex('g-sing', 'music', 3, ['musical'], T('Sing it, then play it', 'Singen, dann spielen', 'Cantar e depois tocar'),
      T('If you can sing a phrase without breaks, you can play it without breaks.', 'Wenn du eine Phrase ohne Unterbrechung singen kannst, kannst du sie so spielen.', 'Se consegues cantar uma frase sem quebras, consegues tocá-la sem quebras.'),
      [T('Listen to the first phrase, then sing it.', 'Höre die erste Phrase und singe sie.', 'Ouve a primeira frase e canta-a.'), T('Breathe in the rests.', 'In den Pausen atmen.', 'Respira nas pausas.'), T('Play it with the same breathing in the bow.', 'Spiele sie mit demselben Atem im Bogen.', 'Toca-a com a mesma respiração no arco.')],
      [T('Sang without breaks', 'Ohne Unterbrechung gesungen', 'Cantei sem quebras'), T('Same breath in the bow', 'Gleicher Atem im Bogen', 'A mesma respiração no arco')],
      [{ label: T('first phrase', 'erste Phrase', 'primeira frase'), abc: makeAbc(passageItems(A, firstPhraseBars(A)), { key, meter: meterStr, profile }) }], {}));
    exs.push(ex('g-run', 'music', 5, ['musical'], T('Play-through', 'Durchspielen', 'Tocar do início ao fim'),
      T('Put everything back together. Choose a tempo you can play beautifully.', 'Alles wieder zusammensetzen. Wähle ein Tempo, in dem du schön spielst.', 'Junta tudo. Escolhe um andamento em que toques bonito.'),
      [T('Do not stop for mistakes. Keep the line going.', 'Bei Fehlern nicht anhalten. Die Linie weiterführen.', 'Não pares nos erros. Mantém a linha.')],
      [T('Did not stop', 'Nicht angehalten', 'Não parei'), T('The line kept going', 'Die Linie lief weiter', 'A linha continuou')],
      [], { play: { from: 1, to: parsed.measures.length, guide: true, water: false } }));
    exs.push(ex('g-reflect', 'music', 1, ['musical'], T('What went well today?', 'Was lief heute gut?', 'O que correu bem hoje?'),
      T('One minute of reflection makes tomorrow start in the right place.', 'Eine Minute Nachdenken lässt morgen am richtigen Ort beginnen.', 'Um minuto de reflexão faz amanhã começar no sítio certo.'),
      [T('One thing that sounded good.', 'Eine Sache, die gut klang.', 'Uma coisa que soou bem.'), T('One goal for tomorrow.', 'Ein Ziel für morgen.', 'Um objetivo para amanhã.')],
      [T('One good thing written', 'Eine gute Sache notiert', 'Uma coisa boa escrita'), T('One goal for tomorrow', 'Ein Ziel für morgen', 'Um objetivo para amanhã')], [], { note: true }));
    exs.find(e => e.id === 'g-reflect').last = true;
    exs.find(e => e.id === 'g-reflect').always = true;
    exs.find(e => e.id === 'g-run').always = true;
    exs.find(e => e.id === 'g-scale').always = true;
    return { exercises: exs, spots: spotsOut };
  }
  function firstPhraseBars(A) { const nums = Object.keys(A.measures).map(Number).filter(b => A.measures[b].notes.length); return nums.slice(0, 4); }
  function midiName(m) { const n = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; return n[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }

  function buildPiece(parsed, profile) {
    const A = analyse(parsed, profile);
    const { exercises, spots } = buildExercises(parsed, A, profile);
    const sections = [];
    const n = parsed.measures.length, size = n <= 16 ? 4 : n <= 40 ? 8 : 16;
    for (let b = 1; b <= n; b += size) sections.push({ id: 's' + b, bars: [b, Math.min(n, b + size - 1)], name: T(`Bars ${b}–${Math.min(n, b + size - 1)}`, `Takte ${b}–${Math.min(n, b + size - 1)}`, `Compassos ${b}–${Math.min(n, b + size - 1)}`) });
    return {
      id: 'p' + Date.now().toString(36), title: { en: parsed.title, de: parsed.title, pt: parsed.title }, composer: parsed.composer || '',
      key: keyLabel(parsed.key.name), keyName: parsed.key.name, time: `${parsed.time.beats}/${parsed.time.beatType}`, tempo: Math.round(A.tempo), tempoMark: parsed.tempoWord || '',
      bars: n, abc: parsed.abc, sections, spots, exercises, second: A.second, range: A.range, generated: true
    };
  }
  return { buildPiece, analyse, makeAbc, spell, keyLabel, KEYS, midiName };
})();
if (typeof module !== 'undefined') module.exports = GEN;
