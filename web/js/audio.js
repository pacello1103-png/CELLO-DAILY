/* ============================================================
   CANTABILE · audio engine
   Metronome, drone, cello & piano voices, play-along, pitch detection.
   ============================================================ */
const AU = {
  ctx: null, out: null, a4: 442, droneTimbre: 'cello',
  ensure() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      this.ctx = new C({ latencyHint: 'interactive' });
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 3;
      this.out = this.ctx.createGain(); this.out.gain.value = 0.9;
      this.out.connect(comp); comp.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  now() { return this.ensure().currentTime; },
  freq(m) { return this.a4 * Math.pow(2, (m - 69) / 12); }
};

/* ---------- note names ---------- */
const NOTE_NAMES = {
  en: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'],
  de: ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'Ais', 'H'],
  pt: ['Dó', 'Dó♯', 'Ré', 'Ré♯', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Lá♯', 'Si']
};
function parseNote(s) { // 'F#4', 'Bb2', 'C2'
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) return 60;
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
  return (parseInt(m[3], 10) + 1) * 12 + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
function noteLabel(s, lang) { // spelled label from a note string
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) return s;
  const L = m[1], acc = m[2], oct = m[3];
  if (lang === 'de') {
    let n = L === 'B' ? 'H' : L;
    if (acc === '#') n = (L === 'B' ? 'His' : L + 'is');
    if (acc === 'b') n = (L === 'B' ? 'B' : L === 'E' ? 'Es' : L === 'A' ? 'As' : L + 'es');
    return n + oct;
  }
  if (lang === 'pt') {
    const p = { C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' }[L];
    return p + (acc === '#' ? '♯' : acc === 'b' ? '♭' : '') + oct;
  }
  return L + (acc === '#' ? '♯' : acc === 'b' ? '♭' : '') + oct;
}
function midiLabel(m, lang) { const n = NOTE_NAMES[lang] || NOTE_NAMES.en; return n[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }

/* ---------- voices ---------- */
function celloVoice(t, midi, dur, vel = 0.22, dest) {
  const ctx = AU.ensure(); dest = dest || AU.out;
  const f = AU.freq(midi);
  const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
  o1.type = 'sawtooth'; o2.type = 'sawtooth';
  o1.frequency.value = f; o2.frequency.value = f * 1.0035;
  const lfo = ctx.createOscillator(), lg = ctx.createGain();
  lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.0045, t + Math.min(0.45, dur * 0.5));
  lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(3600, f * 7); lp.Q.value = 0.8;
  const body = ctx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 260; body.gain.value = 5; body.Q.value = 1;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vel, t + 0.09);
  g.gain.setValueAtTime(vel, t + Math.max(0.1, dur - 0.05));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.22);
  o1.connect(lp); o2.connect(lp); lp.connect(body); body.connect(g); g.connect(dest);
  const end = t + dur + 0.3;
  [o1, o2, lfo].forEach(o => { o.start(t); o.stop(end); });
  return { stop: (when) => { try { g.gain.cancelScheduledValues(when); g.gain.setTargetAtTime(0.0001, when, 0.05); [o1, o2, lfo].forEach(o => o.stop(when + 0.3)); } catch (e) {} } };
}
function pianoVoice(t, midi, dur, vel = 0.06, dest) {
  const ctx = AU.ensure(); dest = dest || AU.out;
  const f = AU.freq(midi);
  const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
  o1.type = 'triangle'; o2.type = 'sine';
  o1.frequency.value = f; o2.frequency.value = f * 2;
  const g2 = ctx.createGain(); g2.gain.value = 0.25;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vel, t + 0.006);
  const decay = Math.min(2.4, Math.max(0.6, dur + 0.8));
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(dest);
  o1.start(t); o2.start(t); o1.stop(t + decay + 0.05); o2.stop(t + decay + 0.05);
}
function clickVoice(t, level) {
  const ctx = AU.ensure();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = level >= 2 ? 1760 : level >= 1 ? 1320 : 880;
  const v = level >= 2 ? 0.5 : level >= 1 ? 0.34 : 0.16;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g); g.connect(AU.out); o.start(t); o.stop(t + 0.06);
}
function chime() {
  const ctx = AU.ensure(), t = ctx.currentTime + 0.01;
  [[1318.5, 0], [1975.5, 0.08]].forEach(([f, d]) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + d); g.gain.linearRampToValueAtTime(0.12, t + d + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.6);
    o.connect(g); g.connect(AU.out); o.start(t + d); o.stop(t + d + 0.65);
  });
}

/* ---------- metronome ---------- */
class Metronome {
  constructor() { this.bpm = 60; this.beats = 4; this.sub = 1; this.running = false; this.onBeat = null; this._t = null; }
  start() {
    AU.ensure(); this.running = true; this.tick = 0; this.next = AU.ctx.currentTime + 0.08;
    clearInterval(this._t); this._t = setInterval(() => this._sched(), 25); this._sched();
  }
  _sched() {
    const ctx = AU.ctx; if (!ctx || !this.running) return;
    while (this.next < ctx.currentTime + 0.12) {
      const s = this.tick % this.sub, beat = Math.floor(this.tick / this.sub) % this.beats;
      let lvl = 0;
      if (s === 0) lvl = beat === 0 ? 2 : (this.beats === 6 && beat === 3) ? 1.5 : 1;
      clickVoice(this.next, lvl);
      if (s === 0 && this.onBeat) { const d = (this.next - ctx.currentTime) * 1000, b = beat; setTimeout(() => this.running && this.onBeat && this.onBeat(b), Math.max(0, d)); }
      this.next += 60 / this.bpm / this.sub; this.tick++;
    }
  }
  stop() { this.running = false; clearInterval(this._t); this._t = null; }
}

/* ---------- drone ---------- */
class Drone {
  constructor() { this.nodes = []; this.on = false; this.vol = 0.5; }
  start(midis) {
    this.stop(true); const ctx = AU.ensure(); const t = ctx.currentTime;
    this.master = ctx.createGain(); this.master.gain.setValueAtTime(0.0001, t);
    this.master.gain.linearRampToValueAtTime(0.16 * this.vol, t + 0.6); this.master.connect(AU.out);
    midis.forEach((m, i) => {
      const f = AU.freq(m);
      if (AU.droneTimbre === 'organ') {
        [[1, 1], [2, .32], [3, .14], [4, .06]].forEach(([h, a]) => {
          const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * h; g.gain.value = a * (i ? .75 : 1);
          o.connect(g); g.connect(this.master); o.start(t); this.nodes.push(o);
        });
      } else {
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(1400, f * 5); lp.Q.value = .6; lp.connect(this.master);
        [0, 0.004].forEach(dt => {
          const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f * (1 + dt); g.gain.value = 0.35 * (i ? .7 : 1);
          o.connect(g); g.connect(lp); o.start(t); this.nodes.push(o);
        });
        const s = ctx.createOscillator(), sg = ctx.createGain(); s.type = 'sine'; s.frequency.value = f; sg.gain.value = .4; s.connect(sg); sg.connect(this.master); s.start(t); this.nodes.push(s);
      }
    });
    this.on = true;
  }
  setVol(v) { this.vol = v; if (this.master) this.master.gain.setTargetAtTime(0.16 * v, AU.ctx.currentTime, 0.1); }
  stop(quick) {
    if (!this.master) { this.on = false; return; }
    const ctx = AU.ctx, t = ctx.currentTime, m = this.master, nodes = this.nodes;
    m.gain.cancelScheduledValues(t); m.gain.setTargetAtTime(0.0001, t, quick ? 0.02 : 0.15);
    setTimeout(() => { nodes.forEach(o => { try { o.stop(); } catch (e) {} }); try { m.disconnect(); } catch (e) {} }, quick ? 120 : 700);
    this.nodes = []; this.master = null; this.on = false;
  }
}

/* ---------- reference tone ---------- */
function playRef(midi, dur = 1.6) { const t = AU.now() + 0.03; return celloVoice(t, midi, dur, 0.26); }

/* ---------- abc → events (uses abcjs) ---------- */
function abcEvents(visualObj) {
  try {
    const a = visualObj.setUpAudio({});
    const ev = [];
    a.tracks.forEach(tr => tr.forEach(e => { if (e.cmd === 'note' && e.pitch != null) ev.push({ midi: e.pitch, start: e.start, dur: e.duration }); }));
    ev.sort((x, y) => x.start - y.start);
    return ev; // start/dur in whole notes
  } catch (e) { return []; }
}
function playEvents(ev, qpm, onDone) {
  const t0 = AU.now() + 0.12, wn = 240 / qpm; // seconds per whole note
  const voices = ev.map(e => celloVoice(t0 + e.start * wn, e.midi, Math.max(0.12, e.dur * wn - 0.02), 0.22));
  const total = ev.length ? (ev[ev.length - 1].start + ev[ev.length - 1].dur) * wn : 0;
  const timer = setTimeout(() => onDone && onDone(), total * 1000 + 400);
  return { stop() { clearTimeout(timer); const t = AU.now(); voices.forEach(v => v.stop(t)); onDone && onDone(); }, t0, total };
}

/* ---------- play-along (melody + "the water") ---------- */
const PlayAlong = {
  melody: null, slots: null, cum: null,
  prepare(melodyEvents, piece) {
    // positions in eighth notes; piece gives bars, eighths per bar, optional harmony and tempo shape
    this.piece = piece;
    this.E = piece.barEighths || 12;
    this.melody = melodyEvents.map(e => ({ midi: e.midi, pos: e.start * 8, len: e.dur * 8 }));
    const N = piece.bars * this.E; this.slots = new Float64Array(N);
    for (let i = 0; i < N; i++) this.slots[i] = piece.tempoShape ? piece.tempoShape(Math.floor(i / this.E) + 1, i % this.E) : 1;
    this.cum = new Float64Array(N + 1);
    for (let i = 0; i < N; i++) this.cum[i + 1] = this.cum[i] + this.slots[i];
  },
  // position in eighths → "eighth-units" of time (multiply by sec per eighth)
  u(pos) { const i = Math.max(0, Math.min(this.slots.length - 1, Math.floor(pos))); return this.cum[i] + (pos - i) * this.slots[i]; },
  water(from, to) {
    const ev = [];
    if (typeof HARMONY === 'undefined' || !this.piece || !this.piece.harmony) return ev;
    for (let b = from; b <= to; b++) {
      for (let h = 0; h < 2; h++) {
        const name = HARMONY[b - 1][h], v = VOICINGS[name]; if (!v) continue;
        const base = (b - 1) * 12 + h * 6;
        if (name === 'end') { v.lh.forEach(m => ev.push({ midi: m, pos: base, len: 6, vel: .08, p: 1 })); v.rh.forEach(m => ev.push({ midi: m, pos: base, len: 6, vel: .05, p: 1 })); continue; }
        if (name === 'rest') continue;
        for (let j = 0; j < 6; j++) ev.push({ midi: v.lh[j], pos: base + j, len: 1.2, vel: j === 0 ? .085 : .06, p: 1 });
        for (let k = 0; k < 12; k++) ev.push({ midi: v.rh[k % 4], pos: base + k * 0.5, len: .7, vel: k % 4 === 0 ? .05 : .038, p: 1 });
      }
    }
    return ev;
  },
  start(opts) {
    // opts: {from,to,bpm,guide,water,loop,onBar,onEnd}
    this.stop(); AU.ensure(); if (!this.melody) return;
    const o = this.opts = Object.assign({ from: 1, to: this.piece.bars, bpm: 50 }, opts);
    const a = (o.from - 1) * this.E, b = o.to * this.E;
    let ev = [];
    if (o.guide) ev = ev.concat(this.melody.filter(e => e.pos >= a && e.pos < b).map(e => ({ midi: e.midi, pos: e.pos, len: Math.min(e.len, b - e.pos), cello: true })));
    if (o.water) ev = ev.concat(this.water(o.from, o.to));
    ev.sort((x, y) => x.pos - y.pos);
    this.ev = ev; this.a = a; this.b = b;
    const spe = 30 / o.bpm; // seconds per eighth
    this.spe = spe;
    const countIn = (o.from > 1 || !o.water) ? 3 : 0; // dotted-half count-in
    this.t0 = AU.ctx.currentTime + 0.15 + countIn * 2 * spe - this.u(a) * spe;
    for (let i = 0; i < countIn; i++) clickVoice(AU.ctx.currentTime + 0.15 + i * 2 * spe, i === 0 ? 2 : 1);
    this.i = 0; this.voices = []; this.running = true;
    this._t = setInterval(() => this._sched(), 30); this._sched();
    const tick = () => {
      if (!this.running) return;
      const pos = this.posAt(AU.ctx.currentTime);
      if (o.onBar) o.onBar(Math.floor(pos / this.E) + 1, (pos - a) / (b - a));
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  },
  posAt(t) { // invert time → eighth position
    const u = (t - this.t0) / this.spe; if (u <= this.cum[0]) return 0;
    let lo = 0, hi = this.cum.length - 1;
    while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (this.cum[mid] <= u) lo = mid; else hi = mid; }
    return lo + (u - this.cum[lo]) / this.slots[lo];
  },
  _sched() {
    const ctx = AU.ctx, spe = this.spe;
    while (this.i < this.ev.length) {
      const e = this.ev[this.i], t = this.t0 + this.u(e.pos) * spe;
      if (t > ctx.currentTime + 0.25) break;
      const dur = (this.u(e.pos + e.len) - this.u(e.pos)) * spe;
      if (t > ctx.currentTime - 0.02) {
        if (e.cello) this.voices.push(celloVoice(t, e.midi, Math.max(0.1, dur - 0.03), 0.2));
        else pianoVoice(t, e.midi, dur, e.vel);
      }
      this.i++;
    }
    const endT = this.t0 + this.u(this.b) * spe;
    if (this.i >= this.ev.length && ctx.currentTime > endT + 0.4) {
      if (this.opts.loop) { this.t0 = endT + 0.0 - this.u(this.a) * spe; this.i = 0; }
      else { const cb = this.opts.onEnd; this.stop(); cb && cb(); }
    }
  },
  stop() {
    if (!this.running) return;
    this.running = false; clearInterval(this._t); cancelAnimationFrame(this._raf);
    const t = AU.ctx.currentTime; (this.voices || []).forEach(v => v.stop(t)); this.voices = [];
    // piano notes are short and decay on their own; mute the bus briefly to cut them
    AU.out.gain.cancelScheduledValues(t); AU.out.gain.setValueAtTime(AU.out.gain.value, t);
    AU.out.gain.linearRampToValueAtTime(0.0001, t + 0.05); AU.out.gain.linearRampToValueAtTime(0.9, t + 0.6);
  }
};

/* ---------- pitch detection (YIN) ---------- */
const Pitch = {
  stream: null, an: null, buf: null, running: false, listeners: new Set(),
  available() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); },
  async start() {
    if (this.running) return true;
    AU.ensure();
    if (!this.available()) throw { code: 'unavailable' };
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) { throw { code: (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) ? 'denied' : 'unavailable', e }; }
    const src = AU.ctx.createMediaStreamSource(this.stream);
    this.an = AU.ctx.createAnalyser(); this.an.fftSize = 4096; src.connect(this.an); this.src = src;
    this.buf = new Float32Array(this.an.fftSize);
    this.running = true; this._loop();
    return true;
  },
  stop() {
    this.running = false; cancelAnimationFrame(this._raf);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    try { this.src && this.src.disconnect(); } catch (e) {}
    this.stream = null; this.an = null;
  },
  _loop() {
    if (!this.running) return;
    this._frame = (this._frame || 0) + 1;
    if (this._frame % 2 === 0) {
      this.an.getFloatTimeDomainData(this.buf);
      const r = yin(this.buf, AU.ctx.sampleRate);
      this.listeners.forEach(fn => fn(r));
    }
    this._raf = requestAnimationFrame(() => this._loop());
  }
};
function yin(buf, sr) {
  const W = 2048, maxTau = Math.min(Math.floor(sr / 58), buf.length - W - 1), minTau = Math.floor(sr / 1250);
  let rms = 0; for (let i = 0; i < W; i++) rms += buf[i] * buf[i]; rms = Math.sqrt(rms / W);
  if (rms < 0.006) return null;
  const d = yin._d && yin._d.length === maxTau + 1 ? yin._d : (yin._d = new Float32Array(maxTau + 1));
  for (let tau = 1; tau <= maxTau; tau++) { let s = 0; for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x; } d[tau] = s; }
  d[0] = 1; let run = 0;
  for (let tau = 1; tau <= maxTau; tau++) { run += d[tau]; d[tau] = run ? d[tau] * tau / run : 1; }
  let tau = -1;
  for (let t = minTau; t <= maxTau; t++) { if (d[t] < 0.13) { while (t + 1 <= maxTau && d[t + 1] < d[t]) t++; tau = t; break; } }
  if (tau < 0) return null;
  const x0 = d[tau - 1], x1 = d[tau], x2 = tau + 1 <= maxTau ? d[tau + 1] : x1;
  const den = x0 - 2 * x1 + x2; const better = den ? tau + (x0 - x2) / (2 * den) : tau;
  return { f: sr / better, clarity: 1 - x1, rms };
}
function centsFrom(f, midi) { return 1200 * Math.log2(f / AU.freq(midi)); }
function nearestMidi(f) { return Math.round(69 + 12 * Math.log2(f / AU.a4)); }
