/* ============================================================
   Daily Cello · pieces: the built-in Swan, generic warm-ups,
   ABC -> parsed piece (for Claude-read scores and pasted ABC)
   ============================================================ */
const GENERIC_WHY = {
  'w-airbow': L3('A loose, balanced bow hand makes long, connected strokes and invisible bow changes possible.', 'Eine lockere, ausbalancierte Bogenhand macht lange, verbundene Striche und unhörbare Bogenwechsel möglich.', 'Uma mão de arco solta e equilibrada torna possíveis arcos longos e mudanças invisíveis.'),
  'w-open': L3('A good sound starts with long bows that sound the same at the frog, the middle and the tip.', 'Ein guter Klang beginnt mit langen Bögen, die am Frosch, in der Mitte und an der Spitze gleich klingen.', 'Um bom som começa com arcos longos iguais no talão, no meio e na ponta.'),
  'w-messa': L3('Every phrase grows and fades. You control volume with bow speed, weight and sounding point.', 'Jede Phrase wächst und vergeht. Lautstärke steuerst du mit Bogengeschwindigkeit, Gewicht und Kontaktstelle.', 'Cada frase cresce e diminui. Controlas o volume com velocidade, peso e ponto de contacto.'),
  'w-vibrato': L3('A vibrato that starts at once and lasts to the end keeps every long note alive.', 'Ein Vibrato, das sofort beginnt und bis zum Ende trägt, hält jeden langen Ton lebendig.', 'Um vibrato que começa logo e dura até ao fim mantém viva cada nota longa.'),
  'w-shift': L3('A relaxed arm and a known distance make every shift calm and sure.', 'Ein lockerer Arm und eine bekannte Distanz machen jeden Lagenwechsel ruhig und sicher.', 'Braço solto e distância conhecida tornam cada mudança calma e segura.'),
  'bc-lanes': L3('Near the fingerboard the sound is soft and veiled, near the bridge strong and bright. Music moves between these lanes.', 'Nahe am Griffbrett klingt es weich, am Steg stark und hell. Musik wechselt zwischen diesen Spuren.', 'Perto da escala o som é suave; perto do cavalete é forte e brilhante. A música move-se entre estas pistas.'),
  'bc-change': L3('Nobody should hear where the bow turns. The fingers soften the change like a brush; the arm keeps moving.', 'Niemand soll hören, wo der Bogen wendet. Die Finger federn den Wechsel ab; der Arm bleibt in Bewegung.', 'Ninguém deve ouvir onde o arco muda. Os dedos amortecem a mudança; o braço continua.')
};
const GENERIC_WARMUPS = ['w-tune', 'w-airbow', 'w-open', 'w-messa', 'bc-lanes', 'bc-speed', 'bc-change', 'w-vibrato', 'w-shift', 'sh-ladder'];
function genericWarmups() {
  return GENERIC_WARMUPS.map(id => {
    const e = EXERCISES.find(x => x.id === id); if (!e) return null;
    const c = Object.assign({}, e); if (GENERIC_WHY[id]) c.why = GENERIC_WHY[id];
    c.spot = null; return c;
  }).filter(Boolean);
}

function swanPiece() {
  return {
    id: 'swan', builtin: true, title: PIECE.title, composer: PIECE.composer, from: PIECE.from, original: PIECE.original,
    key: PIECE.key, keyName: 'G', time: PIECE.time, tempo: PIECE.tempo, tempoMark: PIECE.tempoMark, bars: PIECE.bars,
    abc: PIECE.abc, sections: PIECE.sections, spots: SPOTS, exercises: EXERCISES, harmony: true, barEighths: 12, photo: 'img/swan.jpg',
    tempoShape: (bar, s) => bar === 25 ? (s < 6 ? 1 + 0.45 * (s / 6) : 1.65) : (bar === 27 && s >= 4 ? 1.15 + 0.08 * (s - 4) : 1)
  };
}

/* ABC (from Claude or pasted) -> the same structure the MusicXML reader gives */
function abcToParsed(abc, fileName) {
  const head = k => { const m = new RegExp('^' + k + ':(.*)$', 'm').exec(abc); return m ? m[1].trim() : ''; };
  const r = readAbc(abc);
  const [beats, beatType] = (head('M') || '4/4').split('/').map(Number);
  const kn = (head('K') || 'C').replace(/clef=\S+/, '').trim() || 'C';
  const minor = /m$/.test(kn);
  const q = /=(\d+)/.exec(head('Q') || '');
  const notes = [], measures = [];
  let maxBar = 0;
  r.events.forEach(e => {
    maxBar = Math.max(maxBar, e.bar);
    if (e.rest) { notes.push({ measure: e.bar + 1, t: e.t * 4, dur: e.len * 4, rest: true }); return; }
    if (e.grace) { notes.push({ measure: e.bar + 1, grace: true, midi: e.midi, step: e.letter, alter: e.alter, octave: e.oct }); return; }
    notes.push({ measure: e.bar + 1, t: e.t * 4, dur: e.len * 4, midi: e.midi, step: e.letter, alter: e.alter, octave: e.oct, tieStop: e.tied, tieStart: e.tieStart, slurStart: e.slurStart, slurStop: e.slurEnd, finger: e.finger, chord: e.chord, dyn: (e.decos || []).find(d => /^(pp|p|mp|mf|f|ff)$/.test(d)) });
  });
  for (let b = 0; b <= maxBar; b++) if (notes.some(n => n.measure === b + 1)) measures.push({ n: b + 1 });
  // renumber measures so that empty trailing bars disappear
  const keyFifths = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, Dm: -1, Gm: -2, Cm: -3, Fm: -4 };
  return {
    title: head('T') || (fileName || 'Untitled').replace(/\.\w+$/, ''), composer: head('C'),
    key: { fifths: keyFifths[kn] || 0, mode: minor ? 'minor' : 'major', name: kn },
    time: { beats: beats || 4, beatType: beatType || 4 }, tempo: q ? +q[1] : 72, tempoWord: '',
    notes, measures, clef: (/clef=(\w+)/.exec(head('K')) || [0, 'bass'])[1], abc, source: 'abc'
  };
}
