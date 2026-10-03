/* ============================================================
   Daily Cello · app
   ============================================================ */
const LANGS = ['en', 'de', 'pt'];
const S = { lang: 'en', view: 'home', profile: null, prog: null, pieces: [], piece: null, len: 30, focus: 'balanced', agenda: [], session: null, disposers: [], spotSel: null };
const t = (k, vars) => { const e = UI[k]; let s = e ? (e[LANGS.indexOf(S.lang)] || e[0]) : k; if (vars) for (const v in vars) s = s.split('{' + v + '}').join(vars[v]); return s; };
const tt = o => o ? (typeof o === 'string' ? o : (o[S.lang] || o.en || '')) : '';
const $ = (sel, el = document) => el.querySelector(sel);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k]; if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(c)); });
  return el;
};
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const daysSince = d => d ? Math.round((Date.parse(today()) - Date.parse(d)) / 864e5) : null;
function toast(msg, ms = 2200) { const el = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(el); setTimeout(() => el.remove(), ms); }
function nativeLog(type, text, extra) { try { window.webkit.messageHandlers.native.postMessage(Object.assign({ type, text }, extra || {})); } catch (e) { } }

/* ======================= STORAGE ======================= */
const DB = {
  get(k, d) { try { const v = localStorage.getItem('dc.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('dc.' + k, JSON.stringify(v)); return true; } catch (e) { toast('Storage is full'); return false; } }
};
const DEFAULT_PROG = () => ({ settings: { a4: 442, tol: 10, hold: 1.5, drone: 'cello', theme: 'light', fing: 'all', paBpm: 46, len: null, focus: null }, ex: {}, sessions: [], notes: {}, fing: {} });
function loadProfile(id) {
  S.profiles = DB.get('profiles', []);
  S.profile = S.profiles.find(p => p.id === id) || S.profiles[0] || null;
  if (!S.profile) return false;
  DB.set('active', S.profile.id);
  const pr = DB.get('prog.' + S.profile.id, null);
  S.prog = Object.assign(DEFAULT_PROG(), pr || {});
  S.prog.settings = Object.assign(DEFAULT_PROG().settings, (pr && pr.settings) || {});
  S.lang = S.profile.lang || S.lang;
  S.len = S.prog.settings.len || S.profile.len || 30;
  S.focus = S.prog.settings.focus || focusFromImprove(S.profile.improve);
  return true;
}
function saveProg() { if (S.profile) DB.set('prog.' + S.profile.id, S.prog); }
function saveProfiles() { DB.set('profiles', S.profiles); }
function focusFromImprove(list) {
  list = list || [];
  if (list.includes('creative') || list.includes('musical')) return list.length === 1 ? 'music' : 'balanced';
  if (list.every(x => ['intonation', 'shift', 'vibrato'].includes(x)) && list.length) return 'left';
  if (list.every(x => ['bow'].includes(x)) && list.length) return 'bow';
  return 'balanced';
}
function exState(id) { const k = S.piece.id + ':' + id; return S.prog.ex[k] || (S.prog.ex[k] = { n: 0, last: null, r: [], bpm: null, best: null }); }
function exStateRO(id) { return S.prog.ex[S.piece.id + ':' + id]; }

/* ======================= PIECES ======================= */
function loadPieces() {
  const imported = DB.get('pieces', []);
  S.pieces = [swanPiece()].concat(imported);
  const cur = DB.get('piece.' + (S.profile ? S.profile.id : ''), 'swan');
  S.piece = S.pieces.find(p => p.id === cur) || S.pieces[0];
}
function setPiece(id) { S.piece = S.pieces.find(p => p.id === id) || S.pieces[0]; if (S.profile) DB.set('piece.' + S.profile.id, S.piece.id); S.agenda = []; }
function savePieces() { DB.set('pieces', S.pieces.filter(p => !p.builtin).map(p => { const c = Object.assign({}, p); delete c.tempoShape; return c; })); }
function pieceExercises(p) { return p.builtin ? p.exercises : genericWarmups().concat(p.exercises); }
const phaseName = ph => tt(PHASES[ph]);
const PHASE_ORDER = ['warmup', 'scales', 'spots', 'studies', 'music'];
const PHOTOS = { warmup: 'img/cello_detail.jpg', scales: 'img/cello_a.jpg', spots: 'img/fholes.jpg', studies: 'img/walensee.jpg', music: 'img/swan.jpg' };

/* ======================= SESSION BUILDER ======================= */
const SHARES = {
  balanced: { warmup: .22, scales: .14, spots: .34, studies: .10, music: .20 },
  left: { warmup: .20, scales: .20, spots: .38, studies: .12, music: .10 },
  bow: { warmup: .30, scales: .10, spots: .30, studies: .12, music: .18 },
  music: { warmup: .18, scales: .08, spots: .24, studies: .10, music: .40 }
};
const FOCUS_TAGS = { balanced: [], left: ['left', 'intonation', 'shift', 'vibrato'], bow: ['bow', 'tone'], music: ['musical', 'creative'] };
function exScore(e, focus) {
  const st = exStateRO(e.id); let s = e.prio || 1;
  if (FOCUS_TAGS[focus].some(g => e.tags.includes(g))) s += 2;
  const imp = (S.profile && S.profile.improve) || [];
  if (e.tags.some(g => imp.includes(g === 'tone' ? 'bow' : g === 'left' ? 'intonation' : g))) s += 1.2;
  if (!st || !st.n) s += 1.3;
  else { const last = (st.r || []).slice(-1)[0]; s += last === 'hard' ? 2.5 : last === 'ok' ? 1 : last === 'easy' ? -1.5 : .6; s += Math.min(3, (daysSince(st.last) || 0) * .5); }
  if (S.profile && S.profile.age === 'child' && e.tags.includes('creative')) s += 1;
  return s + Math.random() * .9;
}
function buildAgenda(len, focus) {
  const list = pieceExercises(S.piece);
  const byId = Object.fromEntries(list.map(e => [e.id, e]));
  const share = SHARES[focus], pick = [], used = new Set();
  const add = e => { if (e && !used.has(e.id)) { pick.push(e); used.add(e.id); } };
  add(byId['w-tune']);
  if (len >= 20) { add(byId['w-airbow']); add(list.find(e => e.phase === 'scales' && e.always) || byId['sc-g']); }
  if (len >= 30) { const st = list.filter(e => e.phase === 'studies').map(e => ({ e, s: exScore(e, focus) })).sort((a, b) => b.s - a.s)[0]; if (st) add(st.e); }
  const tail = list.filter(e => e.phase === 'music' && (e.last || (e.always && len >= 30)));
  const reserved = tail.reduce((a, e) => a + e.min, 0);
  let left = len - pick.reduce((a, e) => a + e.min, 0) - reserved;
  PHASE_ORDER.forEach(p => {
    const already = pick.filter(e => e.phase === p).reduce((a, e) => a + e.min, 0) + (p === 'music' ? reserved : 0);
    let budget = Math.min(Math.max(0, Math.round(len * share[p]) - already), left);
    const cands = list.filter(e => e.phase === p && !used.has(e.id) && !e.always && !e.last).map(e => ({ e, s: exScore(e, focus) }));
    const pen = {};
    while (budget > 0 && cands.length) {
      cands.forEach(c => c.adj = c.s - (c.e.spot ? (pen[c.e.spot] || 0) : 0));
      cands.sort((a, b) => b.adj - a.adj);
      const i = cands.findIndex(c => c.e.min <= budget + 1 && c.e.min <= left);
      if (i < 0) break;
      const c = cands.splice(i, 1)[0]; add(c.e); budget -= c.e.min; left -= c.e.min;
      if (c.e.spot) pen[c.e.spot] = (pen[c.e.spot] || 0) + 1.6;
    }
  });
  const extra = list.filter(e => e.phase === 'spots' && !used.has(e.id)).map(e => ({ e, s: exScore(e, focus) })).sort((a, b) => b.s - a.s);
  for (const c of extra) { if (left <= 1) break; if (c.e.min <= left) { add(c.e); left -= c.e.min; } }
  tail.forEach(add);
  return orderAgenda(pick);
}
function orderAgenda(list) {
  const po = Object.fromEntries(PHASE_ORDER.map((p, i) => [p, i]));
  const all = pieceExercises(S.piece);
  const idx = id => all.findIndex(e => e.id === id);
  const spotBar = e => { const sp = e.spot && S.piece.spots.find(s => s.id === e.spot); return sp ? sp.bars[0] : 0; };
  const isTail = e => e.phase === 'music' && (e.last || e.id === 'mu-run' || e.id === 'g-run');
  const main = list.filter(e => !isTail(e)).sort((a, b) => (po[a.phase] - po[b.phase]) || (a.phase === 'spots' ? spotBar(a) - spotBar(b) : 0) || (idx(a.id) - idx(b.id)));
  const tl = list.filter(isTail).sort((a, b) => (a.last ? 1 : 0) - (b.last ? 1 : 0));
  return main.concat(tl);
}
function spotAgenda(spotId) {
  const list = pieceExercises(S.piece);
  const ex = list.filter(e => e.spot === spotId);
  const tune = list.find(e => e.id === 'w-tune'), refl = list.find(e => e.last);
  return [tune].concat(ex, [refl]).filter(Boolean);
}
function spotScore(spotId) {
  const ids = pieceExercises(S.piece).filter(e => e.spot === spotId).map(e => e.id);
  const rs = ids.flatMap(id => ((exStateRO(id) || {}).r || []).slice(-3));
  if (!rs.length) return null;
  const v = { hard: 0, ok: .55, easy: 1 }; return rs.reduce((a, r) => a + v[r], 0) / rs.length;
}

/* ======================= SHELL ======================= */
function applyTheme() { document.documentElement.setAttribute('data-theme', S.prog && S.prog.settings.theme === 'dark' ? 'dark' : 'light'); document.documentElement.lang = S.lang; }
function renderShell() {
  const nav = $('#nav'); nav.innerHTML = '';
  [['home', 'nav_today'], ['library', 'nav_library'], ['piece', 'nav_piece'], ['progress', 'nav_progress']].forEach(([v, k]) =>
    nav.append(h('button', { 'aria-current': S.view === v ? 'page' : null, onclick: () => go(v) }, t(k))));
  $('#brand-sub').textContent = t('brand_sub');
  const who = $('#who'); who.innerHTML = '';
  if (S.profile) who.append(h('button', { class: 'avatar', title: t('switch_profile'), onclick: openProfiles }, (S.profile.name || '?').trim().slice(0, 1).toUpperCase()));
  $('#btn-settings').title = t('settings'); $('#btn-settings').setAttribute('aria-label', t('settings'));
}
function go(v) { stopAll(); S.view = v; render(); }
function render() {
  applyTheme(); renderShell();
  document.querySelectorAll('.view').forEach(el => el.hidden = el.id !== 'v-' + S.view);
  ({ home: renderHome, library: renderLibrary, piece: renderPiece, progress: renderProgress })[S.view]();
}

/* ======================= HOME ======================= */
function greeting() { const hr = new Date().getHours(); return t(hr < 12 ? 'hello_m' : hr < 18 ? 'hello_a' : 'hello_e'); }
function renderHome() {
  const v = $('#v-home'); v.innerHTML = '';
  if (!S.agenda.length) S.agenda = buildAgenda(S.len, S.focus);
  const p = S.piece;
  const total = S.agenda.reduce((a, e) => a + e.min, 0);
  const chapters = PHASE_ORDER.map(ph => ({ ph, items: S.agenda.filter(e => e.phase === ph) })).filter(c => c.items.length);
  const photo = h('div', { class: 'cover-photo', style: `background-image:url(${p.photo || 'img/walensee.jpg'})` },
    h('div', { class: 'cover-band' }, h('div', { class: 'cap light' }, t('todays_piece')), h('div', { class: 'cover-title' }, tt(p.title)), h('div', { class: 'cover-comp' }, p.composer)));
  const right = h('div', { class: 'cover-right' },
    h('div', { class: 'cap' }, greeting() + (S.profile && S.profile.name ? ', ' + S.profile.name : '')),
    h('h1', { class: 'disp' }, t('todays_practice')),
    h('div', { class: 'facts' }, fact(t('key'), tt(p.key)), fact(t('time'), p.time), fact(t('tempo'), (p.tempoMark ? p.tempoMark + ' ' : '') + '♩≈' + p.tempo), fact(t('bars'), p.bars),
      h('button', { class: 'linkbtn', onclick: () => go('library') }, t('change_piece') + ' →')),
    h('ol', { class: 'chapters' }, chapters.map((c, i) => h('li', {},
      h('span', { class: 'chno' }, String(i + 1).padStart(2, '0')),
      h('span', {}, h('b', {}, phaseName(c.ph)), h('small', {}, c.items.map(e => tt(e.title)).join(' · '))),
      h('span', { class: 'cap' }, c.items.reduce((a, e) => a + e.min, 0) + ' ' + t('min'))))),
    h('div', { class: 'choose' },
      h('div', {}, h('span', { class: 'cap' }, t('length')), h('div', { class: 'chips' }, [15, 20, 30, 45, 60, 90].map(n => h('button', { class: 'chip', 'aria-pressed': S.len === n ? 'true' : 'false', onclick: () => { S.len = n; S.prog.settings.len = n; saveProg(); S.agenda = buildAgenda(n, S.focus); renderHome(); } }, n)))),
      h('div', {}, h('span', { class: 'cap' }, t('focus')), h('div', { class: 'chips' }, ['balanced', 'left', 'bow', 'music'].map(f => h('button', { class: 'chip', 'aria-pressed': S.focus === f ? 'true' : 'false', onclick: () => { S.focus = f; S.prog.settings.focus = f; saveProg(); S.agenda = buildAgenda(S.len, f); renderHome(); } }, t('f_' + f)))))),
    h('div', { class: 'startrow' },
      h('button', { class: 'btn primary big', onclick: () => startSession(S.agenda) }, t('begin') + ' →'),
      h('button', { class: 'btn ghost', onclick: () => { S.agenda = buildAgenda(S.len, S.focus); renderHome(); } }, '↻ ' + t('new_mix')),
      h('span', { class: 'cap' }, S.agenda.length + ' ' + t('exercises') + ' · ' + total + ' ' + t('min'))));
  v.append(h('div', { class: 'cover' }, photo, right));
}
function fact(k, val) { return h('div', { class: 'fact' }, h('span', { class: 'cap' }, k), h('b', {}, String(val))); }

/* ======================= ABC RENDER ======================= */
const fingCache = new Map();
function displayAbc(abc, ex, li) {
  let out = abc;
  const prof = S.profile || {};
  if (ex && !ex.generated && !/^%nofing/m.test(abc)) {
    const key = abc + '|' + (prof.positions || '');
    if (!fingCache.has(key)) {
      const lv = prof.positions || 'neck';
      fingCache.set(key, fingerAbc(abc, { maxNeck: lv === 'first' ? 2 : lv === 'fourth' ? 7 : 11, thumb: lv === 'thumb' || (ex.id || '').startsWith('sp-') }));
    }
    out = fingCache.get(key);
  }
  if (ex) out = applyFingerOverrides(out, ex.id + '#' + li);
  if (S.prog && S.prog.settings.fing === 'off') out = out.replace(/!(?:[0-4]|thumb)!/g, '').replace(/"_(?:I|II|III|IV)"/g, '');
  if (prof.clefs && !prof.clefs.includes('tenor')) out = out.replace(/clef=tenor/g, 'clef=bass');
  return out;
}
function applyFingerOverrides(abc, key) {
  const ov = S.prog && S.prog.fing[S.piece.id + ':' + key];
  if (!ov) return abc;
  const notes = readAbc(abc).notes.filter(n => !n.grace && !n.tied);
  const edits = Object.keys(ov).map(Number).filter(i => notes[i]).sort((a, b) => notes[b].start - notes[a].start);
  let out = abc;
  edits.forEach(i => {
    const n = notes[i];
    // the decoration region before this note
    let st = n.start;
    while (st > 0 && /[!"\w#^_=.()\s,'\-]/.test(out[st - 1]) && out[st - 1] !== '|' && !/[A-Ga-gz]/.test(out[st - 1])) st--;
    const region = out.slice(st, n.start).replace(/!(?:[0-4]|thumb)!/g, '');
    const f = ov[i];
    const add = f === '' ? '' : (f === 'T' ? '!thumb!' : '!' + f + '!');
    out = out.slice(0, st) + region + add + out.slice(n.start);
  });
  return out;
}
function renderAbc(el, abc, opt = {}) {
  if (!window.ABCJS || !el) { if (el) el.textContent = abc; return null; }
  const narrow = window.innerWidth < 700;
  const body = abc.split('\n').filter(l => !/^[A-Za-z]:|^%/.test(l)).join(' ');
  const bars = Math.max(1, (body.match(/\|/g) || []).length);
  let notes = 0; try { notes = readAbc(abc).notes.filter(n => !n.grace).length; } catch (e) { }
  const perBar = notes / bars;
  const per = opt.perLine || Math.max(1, Math.min(4, Math.round((narrow ? 6 : 9) / Math.max(1, perBar))));
  const params = { add_classes: true, responsive: 'resize', staffwidth: opt.staffwidth || (narrow ? 330 : 540), paddingleft: 2, paddingright: 2, paddingtop: 6, paddingbottom: 2, foregroundColor: 'currentColor', format: { annotationfont: 'Lato 12' } };
  if (opt.wrap || notes > (narrow ? 6 : 9) || bars > per) params.wrap = { minSpacing: 1.5, maxSpacing: 2.6, preferredMeasuresPerLine: per };
  if (opt.click) params.clickListener = opt.click;
  try { return ABCJS.renderAbc(el, abc, params)[0]; } catch (e) { el.textContent = abc; return null; }
}
function musicLine(m, i, total, qpmFn, ex) {
  const host = h('div', { class: 'abc-host' });
  const btn = h('button', { class: 'btn small' }, '▶ ' + t('listen'));
  const box = h('div', { class: 'mline' },
    h('div', { class: 'lab', 'aria-hidden': 'true' }, total > 1 ? 'abcdefgh'[i] : '♪'),
    h('div', { class: 'mbody' }, h('div', { class: 'cap2' }, h('span', {}, tt(m.label)), btn), host));
  let vo = null, playing = null, timing = null, shown = '';
  const draw = () => {
    shown = displayAbc(m.abc, ex, i);
    host.innerHTML = '';
    vo = renderAbc(host, shown, { perLine: m.perLine, click: (abcelem, tuneNumber, classes, analysis, drag, mouseEvent) => onNoteClick(abcelem, shown, ex, i, draw, mouseEvent) });
  };
  requestAnimationFrame(draw);
  const clear = () => host.querySelectorAll('.hl').forEach(n => n.classList.remove('hl'));
  const stop = () => { if (playing) { const p = playing; playing = null; p.stop(); } if (timing) { timing.stop(); timing = null; } clear(); btn.textContent = '▶ ' + t('listen'); };
  btn.onclick = () => {
    if (playing) return stop();
    if (!vo) return;
    AU.ensure();
    const qpm = qpmFn ? qpmFn() : 60;
    const ev = abcEvents(vo); if (!ev.length) return;
    playing = playEvents(ev, qpm, () => { playing = null; if (timing) { timing.stop(); timing = null; } clear(); btn.textContent = '▶ ' + t('listen'); });
    try { timing = new ABCJS.TimingCallbacks(vo, { qpm, eventCallback: evn => { clear(); if (!evn) return; (evn.elements || []).forEach(arr => arr.forEach(n => n.classList && n.classList.add('hl'))); } }); setTimeout(() => timing && timing.start(), 120); } catch (e) { }
    btn.textContent = '■ ' + t('stop');
  };
  S.disposers.push(stop);
  return box;
}
/* fingering editor */
function onNoteClick(abcelem, shown, ex, li, redraw, mouseEvent) {
  if (!S.session || !S.session.fingerEdit || !ex) return;
  const notes = readAbc(shown).notes.filter(n => !n.grace && !n.tied);
  const ord = notes.findIndex(n => n.start >= abcelem.startChar && n.start < abcelem.endChar);
  if (ord < 0) return;
  document.querySelectorAll('.fpal').forEach(x => x.remove());
  const ev = mouseEvent || window.event || {};
  const x = (ev.clientX || window.innerWidth / 2), y = (ev.clientY || window.innerHeight / 2);
  const key = S.piece.id + ':' + ex.id + '#' + li;
  const pick = f => { const ov = S.prog.fing[key] || (S.prog.fing[key] = {}); ov[ord] = f; saveProg(); pal.remove(); redraw(); toast(t('finger_saved'), 1200); };
  const pal = h('div', { class: 'fpal', style: `left:${Math.min(window.innerWidth - 260, Math.max(10, x - 120))}px;top:${Math.max(10, y - 74)}px` },
    ['0', '1', '2', '3', '4', 'T'].map(f => h('button', { onclick: () => pick(f) }, f)),
    h('button', { class: 'x', onclick: () => pick(''), title: t('remove') }, '×'));
  document.body.append(pal);
  setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!pal.contains(e.target)) { pal.remove(); document.removeEventListener('pointerdown', off); } }), 0);
}

/* ======================= TOOLS ======================= */
function toolCard(title, body, extra) { return h('section', { class: 'tool' }, h('div', { class: 'tool-h' }, h('h3', {}, title), extra || null), body); }
function metronomeTool(cfg, exId) {
  const m = new Metronome();
  const st = exId ? exState(exId) : null;
  const dirDown = cfg.dir === 'down';
  let bpm = cfg.bpm;
  if (st && st.bpm) bpm = dirDown ? Math.min(cfg.bpm, st.bpm + cfg.step) : Math.max(cfg.bpm, st.bpm - (cfg.step || 0));
  m.bpm = bpm; m.beats = cfg.beats || 4; m.sub = cfg.sub || 1;
  let round = 1;
  const bpmEl = h('div', { class: 'bpm' }, String(bpm), h('small', {}, '♩ / min'));
  const beatsEl = h('div', { class: 'beats', 'aria-hidden': 'true' });
  const drawBeats = () => { beatsEl.innerHTML = ''; for (let i = 0; i < m.beats; i++) beatsEl.append(h('i', { class: i === 0 || (m.beats === 6 && i === 3) ? 'acc' : '' })); };
  drawBeats();
  m.onBeat = b => { [...beatsEl.children].forEach((c, i) => c.classList.toggle('on', i === b)); };
  const card = toolCard(t('metronome'), null);
  const setBpm = v => { bpm = Math.max(30, Math.min(208, v)); m.bpm = bpm; bpmEl.firstChild.textContent = String(bpm); if (card._chip) card._chip(); if (exId) { const s = exState(exId); s.bpm = bpm; s.best = dirDown ? (s.best ? Math.min(s.best, bpm) : bpm) : Math.max(s.best || 0, bpm); saveProg(); } };
  const play = h('button', { class: 'btn primary' }, '▶ ' + t('start'));
  play.onclick = () => { if (m.running) { m.stop(); play.textContent = '▶ ' + t('start'); [...beatsEl.children].forEach(c => c.classList.remove('on')); } else { m.start(); play.textContent = '■ ' + t('stop'); } if (card._chip) card._chip(); };
  const roundEl = h('span', { class: 'num' }, t('round') + ' ' + round);
  const body = h('div', {},
    h('div', { class: 'metro' }, bpmEl, h('div', {}, beatsEl, h('div', { class: 'ctrls' },
      h('button', { class: 'btn small', onclick: () => setBpm(bpm - 4) }, '−4'), h('button', { class: 'btn small', onclick: () => setBpm(bpm - 1) }, '−1'),
      h('button', { class: 'btn small', onclick: () => setBpm(bpm + 1) }, '+1'), h('button', { class: 'btn small', onclick: () => setBpm(bpm + 4) }, '+4'), play))),
    cfg.step ? h('div', { class: 'ramp' },
      h('button', { class: 'btn small', onclick: () => { round++; roundEl.textContent = t('round') + ' ' + round; setBpm(bpm + (dirDown ? -cfg.step : cfg.step)); } }, (dirDown ? t('slower') : t('faster')) + ' ' + (dirDown ? '−' : '+') + cfg.step),
      roundEl, h('span', { class: 'muted' }, '· ' + t('goal') + ' ♩' + cfg.target), st && st.bpm ? h('span', { class: 'muted' }, '· ' + t('last_time') + ' ♩' + st.bpm) : null) : null,
    h('div', { class: 'ramp' }, h('span', { class: 'muted' }, t('clicks') + ':'),
      h('div', { class: 'chips' }, [1, 2, 3, 4].map(n => h('button', { class: 'chip sm', 'aria-pressed': m.sub === n ? 'true' : 'false', onclick: e => { m.sub = n; [...e.target.parentNode.children].forEach(c => c.setAttribute('aria-pressed', c === e.target ? 'true' : 'false')); } }, String(n)))),
      h('select', { 'aria-label': t('beats'), onchange: e => { m.beats = +e.target.value; drawBeats(); } }, [2, 3, 4, 6].map(n => h('option', { value: n, selected: m.beats === n ? true : null }, n + ' / ' + (n === 6 ? '4 (6/4)' : '4'))))));
  card.append(body);
  S.disposers.push(() => m.stop());
  card._getBpm = () => bpm; card._running = () => m.running;
  card._label = () => String(bpm);
  return card;
}
function droneTool(cfg) {
  const d = new Drone(); d.vol = .6;
  const sets = [cfg.notes].concat(cfg.alt ? [cfg.alt] : []);
  let cur = 0;
  const label = ns => ns.map(n => noteLabel(n, S.lang)).join(' + ');
  const card = toolCard(t('drone'), null);
  const btn = h('button', { class: 'btn primary' }, '▶ ' + label(sets[0]));
  const startCur = () => { d.start(sets[cur].map(parseNote)); btn.textContent = '■ ' + label(sets[cur]); };
  card._toggle = () => { if (d.on) { d.stop(); btn.textContent = '▶ ' + label(sets[cur]); } else startCur(); if (card._chip) card._chip(); };
  btn.onclick = card._toggle;
  const alt = cfg.alt ? h('button', { class: 'btn small', onclick: () => { cur = 1 - cur; alt.textContent = t('switch_to') + ' ' + label(sets[1 - cur]); if (d.on) startCur(); else btn.textContent = '▶ ' + label(sets[cur]); } }, t('switch_to') + ' ' + label(sets[1])) : null;
  const vol = h('input', { type: 'range', min: 0, max: 1, step: .05, value: d.vol, 'aria-label': t('volume'), oninput: e => d.setVol(+e.target.value) });
  card.append(h('div', { class: 'stack' }, h('div', { class: 'ctrls' }, btn, alt), h('label', { class: 'field' }, t('volume'), vol)));
  S.disposers.push(() => d.stop(true));
  card._running = () => d.on; card._label = () => label(sets[cur]);
  return card;
}
function inFrame() { try { return window.self !== window.top; } catch (e) { return true; } }
function tunerTool(cfg) {
  const free = !cfg || !cfg.targets;
  const targets = free ? [] : cfg.targets.slice();
  let idx = 0, held = 0, lastT = 0, okSet = new Set(), listening = false, smooth = null, lastGood = 0, doneAll = false;
  const tol = () => S.prog.settings.tol, hold = () => S.prog.settings.hold;
  const tgEls = targets.map(n => h('span', {}, noteLabel(n, S.lang)));
  const R = 48, C = 2 * Math.PI * R, ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 112 112'); svg.setAttribute('class', 'ring');
  svg.innerHTML = `<circle cx="56" cy="56" r="${R}" fill="none" stroke="var(--sand)" stroke-width="8"/><circle class="arc" cx="56" cy="56" r="${R}" fill="none" stroke="var(--ok)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 56 56)"/><text x="56" y="67" text-anchor="middle" fill="currentColor" font-family="DM Serif Display, Georgia, serif" font-size="32">–</text>`;
  const arc = svg.querySelector('.arc'), noteTxt = svg.querySelector('text');
  const mark = h('div', { class: 'mark' }), zone = h('div', { class: 'zone' });
  const centsEl = h('div', { class: 'cents' }, '');
  const msg = h('div', { class: 'tuner-msg' }, free ? '' : t('hold_hint', { s: hold() }));
  const w = tol(); zone.style.left = (50 - w) + '%'; zone.style.width = (2 * w) + '%';
  const drawTargets = () => tgEls.forEach((el, i) => { el.className = okSet.has(i) ? 'ok' : (i === idx && !doneAll ? 'now' : ''); });
  const showTarget = () => { if (!free && !doneAll) noteTxt.textContent = noteLabel(targets[idx], S.lang).replace(/-?\d$/, ''); drawTargets(); };
  showTarget();
  const micBtn = h('button', { class: 'btn primary' }, '🎙 ' + t('start_mic'));
  const refBtn = free ? null : h('button', { class: 'btn' }, '♪ ' + t('play_target'));
  const againBtn = free ? null : h('button', { class: 'btn small', hidden: true }, '↺ ' + t('again'));
  if (refBtn) refBtn.onclick = () => { AU.ensure(); playRef(parseNote(targets[doneAll ? 0 : idx])); };
  if (againBtn) againBtn.onclick = () => { idx = 0; okSet.clear(); doneAll = false; held = 0; againBtn.hidden = true; msg.textContent = t('hold_hint', { s: hold() }); showTarget(); };
  const card = toolCard(free ? t('tuner') : t('tuner'), null);
  const onPitch = r => {
    const now = performance.now(), dt = lastT ? Math.min(100, now - lastT) / 1000 : 0; lastT = now;
    if (!r || r.clarity < .82) {
      if (now - lastGood > 250) { held = 0; arc.style.strokeDashoffset = C; mark.classList.remove('ok'); }
      if (now - lastGood > 600) { smooth = null; centsEl.textContent = t('play_note'); }
      return;
    }
    lastGood = now;
    const target = (free || doneAll) ? nearestMidi(r.f) : parseNote(targets[idx]);
    let c = centsFrom(r.f, target);
    if (!free && !doneAll && Math.abs(c) > 150) { smooth = null; held = 0; arc.style.strokeDashoffset = C; mark.style.left = (c > 0 ? 98 : 2) + '%'; mark.classList.remove('ok'); centsEl.textContent = t('wrong_note', { n: midiLabel(nearestMidi(r.f), S.lang), t: noteLabel(targets[idx], S.lang) }); return; }
    smooth = smooth == null ? c : smooth + (c - smooth) * .18; c = smooth;
    if (free || doneAll) noteTxt.textContent = midiLabel(target, S.lang).replace(/-?\d$/, '');
    mark.style.left = Math.max(2, Math.min(98, 50 + c)) + '%';
    centsEl.textContent = (c > 0 ? '+' : '') + c.toFixed(0) + ' ' + t('cents') + (free || doneAll ? ' · ' + midiLabel(target, S.lang) : '');
    const inZone = Math.abs(c) <= tol();
    mark.classList.toggle('ok', inZone);
    if (free || doneAll) { arc.style.strokeDashoffset = inZone ? 0 : C; return; }
    held = inZone ? held + dt : Math.max(0, held - dt * 2);
    arc.style.strokeDashoffset = C * (1 - Math.min(1, held / hold()));
    if (held >= hold()) {
      okSet.add(idx); chime(); held = 0; smooth = null;
      if (idx < targets.length - 1) { idx++; setTimeout(showTarget, 350); drawTargets(); }
      else { doneAll = true; drawTargets(); noteTxt.textContent = '✓'; msg.textContent = t('all_green'); againBtn.hidden = false; }
      if (card._chip) card._chip();
    }
  };
  const stopMic = () => { Pitch.listeners.delete(onPitch); if (!Pitch.listeners.size) Pitch.stop(); listening = false; micBtn.textContent = '🎙 ' + t('start_mic'); if (card._chip) card._chip(); };
  micBtn.onclick = async () => {
    if (listening) { stopMic(); return; }
    try { await Pitch.start(); Pitch.listeners.add(onPitch); listening = true; micBtn.textContent = '■ ' + t('stop_mic'); }
    catch (e) { msg.textContent = e && e.code === 'denied' ? t('mic_denied') : t('mic_blocked'); msg.classList.add('warn'); }
    if (card._chip) card._chip();
  };
  S.disposers.push(stopMic);
  card.append(h('div', { class: 'tuner' },
    free ? null : h('div', { class: 'targets' }, tgEls),
    h('div', { class: 'dial' }, svg, h('div', {}, h('div', { class: 'needle' }, h('div', { class: 'scale' }), zone, mark), centsEl)),
    h('div', { class: 'ctrls' }, micBtn, refBtn, againBtn), msg, h('div', { class: 'tiny' }, t('headphones'))));
  card._running = () => listening; card._label = () => free ? t('tuner') : (doneAll ? '✓ ' : '') + noteLabel(targets[Math.min(idx, targets.length - 1)], S.lang);
  return card;
}
function timerTool(cfg) {
  let left = cfg.sec, run = null, over = false;
  const fmt = s => { const a = Math.abs(s); return (s < 0 ? '+' : '') + Math.floor(a / 60) + ':' + String(Math.floor(a % 60)).padStart(2, '0'); };
  const tEl = h('div', { class: 't' }, fmt(left));
  const card = toolCard(t('timer') + ' · ' + cfg.sec + ' s', null);
  const btn = h('button', { class: 'btn primary' }, '▶ ' + t('start'));
  const tick = () => { left -= .1; if (left <= 0 && !over) { over = true; AU.ensure(); chime(); tEl.classList.add('ok'); } tEl.textContent = fmt(left > 0 ? Math.ceil(left) : Math.floor(left)); };
  btn.onclick = () => { if (run) { clearInterval(run); run = null; btn.textContent = '▶ ' + t('start'); } else { AU.ensure(); run = setInterval(tick, 100); btn.textContent = '■ ' + t('pause'); } if (card._chip) card._chip(); };
  const rst = h('button', { class: 'btn small', onclick: () => { clearInterval(run); run = null; left = cfg.sec; over = false; tEl.classList.remove('ok'); tEl.textContent = fmt(left); btn.textContent = '▶ ' + t('start'); if (card._chip) card._chip(); } }, '↺ ' + t('reset'));
  card.append(h('div', { class: 'timer' }, tEl, btn, rst));
  S.disposers.push(() => clearInterval(run));
  card._running = () => !!run; card._label = () => cfg.sec + ' s';
  return card;
}
let MELODY = {};
function ensureMelody(piece) {
  if (MELODY[piece.id]) return;
  const tmp = h('div', { style: 'position:absolute;left:-9999px;width:800px' }); document.body.append(tmp);
  const vo = renderAbc(tmp, piece.abc, { staffwidth: 700 });
  MELODY[piece.id] = vo ? abcEvents(vo) : [];
  tmp.remove();
}
function playTool(cfg, key, onBar) {
  const st = S.prog.settings;
  const p = S.piece;
  let bpm = Math.min(p.tempo * 1.2, st.paBpm && p.harmony ? st.paBpm : p.tempo);
  const ids = 'pa-' + key;
  const guideCb = h('input', { type: 'checkbox', checked: cfg.guide ? true : null, id: ids + 'g' });
  const waterCb = p.harmony ? h('input', { type: 'checkbox', checked: cfg.water !== false ? true : null, id: ids + 'w' }) : null;
  const loopCb = h('input', { type: 'checkbox', checked: cfg.loop ? true : null, id: ids + 'l' });
  const bar = h('div', { class: 'pa-bar' }, h('i'));
  const where = h('span', { class: 'num muted' }, t('bars_ab', { a: cfg.from, b: cfg.to }));
  const bpmLbl = h('span', { class: 'num' }, '♩ ' + Math.round(bpm));
  const range = h('input', { type: 'range', min: Math.round(p.tempo * 0.5), max: Math.round(p.tempo * 1.2), step: 1, value: Math.round(bpm), 'aria-label': t('tempo'), oninput: e => { bpm = +e.target.value; bpmLbl.textContent = '♩ ' + bpm; if (p.harmony) { st.paBpm = bpm; saveProg(); } } });
  const card = toolCard(t('play') + ' · ' + t('bars_ab', { a: cfg.from, b: cfg.to }), null);
  const btn = h('button', { class: 'btn primary' }, '▶ ' + t('play'));
  const stop = () => { PlayAlong.stop(); btn.textContent = '▶ ' + t('play'); bar.firstChild.style.width = '0'; if (onBar) onBar(null); if (card._chip) card._chip(); };
  btn.onclick = () => {
    if (PlayAlong.running) return stop();
    ensureMelody(p);
    PlayAlong.prepare(MELODY[p.id], { bars: p.bars, barEighths: p.barEighths || barEighthsOf(p.time), harmony: p.harmony, tempoShape: p.tempoShape });
    PlayAlong.start({ from: cfg.from, to: cfg.to, bpm, guide: guideCb.checked, water: waterCb ? waterCb.checked : false, loop: loopCb.checked,
      onBar: (b, frac) => { bar.firstChild.style.width = Math.max(0, Math.min(1, frac)) * 100 + '%'; where.textContent = t('bar_n', { n: Math.max(cfg.from, Math.min(cfg.to, b)) }) + ' / ' + cfg.to; if (onBar) onBar(b); },
      onEnd: () => stop() });
    btn.textContent = '■ ' + t('stop'); if (card._chip) card._chip();
  };
  S.disposers.push(() => { if (PlayAlong.running) PlayAlong.stop(); });
  card.append(h('div', {}, h('div', { class: 'ctrls' }, btn, where), bar,
    h('div', { class: 'ramp' }, h('label', { class: 'toggle', for: guideCb.id }, guideCb, t('guide')), waterCb ? h('label', { class: 'toggle', for: waterCb.id }, waterCb, t('water')) : null, h('label', { class: 'toggle', for: loopCb.id }, loopCb, t('loop'))),
    h('div', { class: 'ramp' }, h('span', {}, t('tempo')), h('div', { style: 'flex:1;min-width:140px' }, range), bpmLbl)));
  card._running = () => PlayAlong.running; card._label = () => t('play');
  return card;
}
function barEighthsOf(time) { const [b, u] = String(time || '4/4').split('/').map(Number); return Math.round(b * 8 / (u || 4)); }
function notesTool(key, reflect) {
  const ta = h('textarea', { id: 'notes-' + key.replace(/\W/g, ''), placeholder: reflect ? t('reflect_ph') : t('notes_ph') });
  const k = S.piece.id + ':' + key;
  ta.value = S.prog.notes[k] || '';
  let tm = null;
  ta.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { S.prog.notes[k] = ta.value; saveProg(); }, 500); });
  S.disposers.push(() => { if (ta.value !== (S.prog.notes[k] || '')) { S.prog.notes[k] = ta.value; saveProg(); } });
  const card = toolCard(t('notes'), ta);
  card._label = () => t('notes');
  return card;
}

/* ======================= SESSION ======================= */
function startSession(items) {
  items = items.filter(Boolean);
  if (!items.length) return;
  stopAll(); AU.ensure();
  // chapter openers between phases
  const pages = [];
  let lastPh = null, ch = 0;
  items.forEach(e => { if (e.phase !== lastPh) { ch++; pages.push({ chapter: true, phase: e.phase, no: ch, items: items.filter(x => x.phase === e.phase) }); lastPh = e.phase; } pages.push(e); });
  S.session = { items, pages, idx: 0, t0: Date.now(), ratings: {}, seen: new Set(), pageT: Date.now(), dir: 1, ticks: {}, fingerEdit: false };
  $('#session').hidden = false;
  requestWake();
  renderSession();
}
function endSession(save) {
  const ss = S.session; if (!ss) return;
  stopAll();
  if (save && ss.seen.size) {
    const mins = Math.max(1, Math.round((Date.now() - ss.t0) / 60000));
    S.prog.sessions.push({ d: today(), piece: S.piece.id, min: mins, items: [...ss.seen], r: ss.ratings });
    S.prog.sessions = S.prog.sessions.slice(-200);
    saveProg();
  }
  S.session = null; $('#session').hidden = true; releaseWake();
  S.agenda = buildAgenda(S.len, S.focus); render();
}
function stopAll() { S.disposers.splice(0).forEach(fn => { try { fn(); } catch (e) { } }); if (typeof PlayAlong !== 'undefined' && PlayAlong.running) PlayAlong.stop(); document.querySelectorAll('.fpal').forEach(x => x.remove()); }
function markDone(id) { const st = exState(id); st.n = (st.n || 0) + 1; st.last = today(); saveProg(); }
function leavePage() {
  const ss = S.session; if (!ss) return;
  const e = ss.pages[ss.idx];
  if (e && !e.chapter && !ss.seen.has(e.id) && (Date.now() - ss.pageT > 15000 || ss.ratings[e.id])) { ss.seen.add(e.id); markDone(e.id); }
}
function turn(d) {
  const ss = S.session; if (!ss) return;
  leavePage(); stopAll();
  const ni = ss.idx + d; if (ni < 0) return;
  ss.idx = Math.min(ss.pages.length, ni); ss.dir = d; ss.pageT = Date.now(); ss.fingerEdit = false;
  renderSession();
}
function renderSession() {
  const ss = S.session, root = $('#session'); root.innerHTML = '';
  const n = ss.pages.length;
  const exPages = ss.pages.filter(p => !p.chapter);
  const cur = ss.pages[ss.idx];
  const exIdx = cur && !cur.chapter ? exPages.indexOf(cur) : -1;
  const doneCount = ss.pages.slice(0, ss.idx).filter(p => !p.chapter).length;
  const top = h('div', { class: 's-top' },
    h('button', { class: 'iconbtn', onclick: () => endSession(true), 'aria-label': t('close') }, '✕'),
    h('span', { class: 'cap' }, tt(S.piece.title)),
    h('div', { class: 's-progress', 'aria-hidden': 'true' }, exPages.map((e, i) => h('i', { class: i < doneCount ? 'done' : (i === exIdx ? 'now' : '') }))),
    h('span', { class: 'num muted' }, exIdx >= 0 ? (exIdx + 1) + ' / ' + exPages.length : ''),
    h('span', { class: 's-clock num', id: 's-clock' }));
  const body = h('div', { class: 's-body' });
  let foot;
  if (ss.idx >= n) {
    const mins = Math.max(1, Math.round((Date.now() - ss.t0) / 60000));
    body.append(h('div', { class: 'spread done page-anim' },
      h('div', { class: 'leaf photo', style: 'background-image:url(img/walensee.jpg)' }),
      h('div', { class: 'leaf text center' }, h('div', { class: 'cap' }, tt(S.piece.title)), h('h2', { class: 'disp huge' }, t('done_title')), h('p', { class: 'lead' }, t('done_body', { n: ss.seen.size, m: mins })),
        h('button', { class: 'btn primary big', onclick: () => endSession(true) }, t('back_home')))));
    foot = h('div', { class: 's-foot' }, h('button', { class: 'btn', onclick: () => turn(-1) }, '← ' + t('back')), h('span', { class: 'grow' }), h('button', { class: 'btn primary', onclick: () => endSession(true) }, t('finish')));
  } else if (cur.chapter) {
    body.append(chapterPage(cur, ss.dir));
    foot = h('div', { class: 's-foot' }, h('button', { class: 'btn', onclick: () => turn(-1), disabled: ss.idx === 0 ? true : null }, '← ' + t('back')), h('span', { class: 'grow' }), h('button', { class: 'btn primary', onclick: () => turn(1) }, t('continue') + ' →'));
  } else {
    const page = exercisePage(cur, ss.dir);
    body.append(page.el);
    const r = ss.ratings[cur.id];
    const rateBtn = (k, lbl) => h('button', { class: 'chip', 'data-r': k, 'aria-pressed': r === k ? 'true' : 'false', onclick: ev => { ss.ratings[cur.id] = k; const st = exState(cur.id); st.r = (st.r || []).concat(k).slice(-8); st.last = today(); saveProg(); if (!ss.seen.has(cur.id)) { ss.seen.add(cur.id); markDone(cur.id); } ev.target.parentNode.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.r === k ? 'true' : 'false')); } }, lbl);
    foot = h('div', { class: 's-foot' },
      h('button', { class: 'btn', onclick: () => turn(-1) }, '←'),
      h('div', { class: 'toolchips' }, page.chips),
      h('div', { class: 'rate' }, h('span', { class: 'lbl' }, t('how_go')), rateBtn('hard', t('hard')), rateBtn('ok', t('okay')), rateBtn('easy', t('easy'))),
      h('button', { class: 'btn primary', onclick: () => turn(1) }, (ss.idx === n - 1 ? t('finish') : t('next')) + ' →'));
    body.append(page.panels);
  }
  root.append(top, body, foot);
  tickClock();
}
function tickClock() {
  clearInterval(tickClock._t);
  const upd = () => { const el = $('#s-clock'); if (!el || !S.session) return clearInterval(tickClock._t); const s = Math.floor((Date.now() - S.session.t0) / 1000); const plan = S.session.items.reduce((a, e) => a + e.min, 0); el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + ' / ' + plan + ':00'; };
  upd(); tickClock._t = setInterval(upd, 1000);
}
function chapterPage(c, dir) {
  return h('div', { class: 'spread chapter page-anim ph-' + c.phase + (dir < 0 ? ' back' : '') },
    h('div', { class: 'leaf text' },
      h('div', { class: 'cap' }, tt(S.piece.title)),
      h('div', { class: 'chapter-mid' },
        h('div', { class: 'cap ink' }, t('chapter')),
        h('div', { class: 'bignum' }, String(c.no).padStart(2, '0')),
        h('h2', { class: 'disp huge' }, phaseName(c.phase)),
        h('ol', { class: 'chap-list' }, c.items.map(e => h('li', {}, h('span', {}, tt(e.title)), h('span', { class: 'cap' }, e.min + ' ' + t('min')))))),
      h('div', { class: 'rule-line' }, h('i'), h('span', { class: 'cap' }, c.items.reduce((a, e) => a + e.min, 0) + ' ' + t('min') + ' · ' + c.items.length + ' ' + t('exercises')))),
    h('div', { class: 'leaf photo', style: `background-image:url(${PHOTOS[c.phase]})` }));
}
function exercisePage(e, dir) {
  const ss = S.session;
  const spot = e.spot ? (S.piece.spots || []).find(s => s.id === e.spot) : null;
  const T = e.tools || {};
  if (!ss.ticks[e.id]) ss.ticks[e.id] = new Set();
  const ticked = ss.ticks[e.id];
  // tools
  const cards = [];
  const metro = T.metro ? metronomeTool(T.metro, e.id) : null;
  if (T.tuner) cards.push(['tuner', tunerTool(T.tuner)]);
  if (metro) cards.push(['metro', metro]);
  if (T.drone) cards.push(['drone', droneTool(T.drone)]);
  if (T.timer) cards.push(['timer', timerTool(T.timer)]);
  if (T.play) cards.push(['play', playTool(T.play, e.id)]);
  const music = e.music || (e.abc ? [{ abc: e.abc }] : []);
  const qpm = () => metro ? metro._getBpm() : (T.metro ? T.metro.bpm : 60);
  const reflect = !!T.note;
  const notesCard = (T.fing || (!reflect && music.length)) ? notesTool(e.spot || e.id) : null;
  // left page
  const left = h('div', { class: 'leaf text' },
    h('div', { class: 'cap ph' }, phaseName(e.phase) + ' · ' + e.min + ' ' + t('min')),
    h('h2', { class: 'disp title' }, tt(e.title)),
    spot ? h('div', { class: 'spotline' }, h('span', { class: 'spotdot', style: '--c:var(--s' + spot.color + ')' }), h('b', {}, tt(spot.name)), h('span', { class: 'muted' }, ' · ' + t('bars') + ' ' + spot.bars.join(', '))) : null,
    h('div', { class: 'howbox' },
      h('div', { class: 'cap ink' }, t('how')),
      h('p', { class: 'why' }, tt(e.why)),
      h('ol', {}, e.steps.map(st => h('li', {}, tt(st))))),
    e.checks && e.checks.length ? h('div', { class: 'checkbox' }, h('div', { class: 'cap ink' }, t('check')),
      h('ul', { class: 'ticks' }, e.checks.map((c, i) => h('li', {}, h('button', { 'aria-pressed': ticked.has(i) ? 'true' : 'false', onclick: ev => { const b = ev.currentTarget; if (ticked.has(i)) ticked.delete(i); else ticked.add(i); b.setAttribute('aria-pressed', ticked.has(i) ? 'true' : 'false'); } }, h('span', {}, tt(c))))))) : null,
    e.link ? h('a', { class: 'linkbtn', href: e.link.url, target: '_blank', rel: 'noopener' }, tt(e.link.label) + ' ↗') : null,
    e.source ? h('div', { class: 'tiny' }, t('based_on') + ': ' + e.source) : null);
  // right page
  const right = h('div', { class: 'leaf music' });
  let primary = null;
  if (music.length) {
    music.forEach((m, i) => right.append(musicLine(m, i, music.length, qpm, e)));
    right.append(h('div', { class: 'tiny right' }, t('suggested')));
  } else if (reflect) {
    right.append(h('div', { class: 'reflect' }, notesTool('reflect-' + today(), true)));
  } else {
    primary = cards.find(c => c[0] === 'tuner') || cards.find(c => c[0] === 'play') || cards.find(c => c[0] === 'timer') || cards.find(c => c[0] === 'metro');
    if (primary) { right.append(h('div', { class: 'primary-tool' }, primary[1])); }
  }
  const el = h('div', { class: 'spread page-anim ph-' + e.phase + (dir < 0 ? ' back' : '') }, left, right);
  // tool chips + floating panels
  const panels = h('div', { class: 'panels' });
  const chips = [];
  let open = null;
  const closeAll = () => { panels.querySelectorAll('.panel').forEach(p => p.hidden = true); chips.forEach(c => c.classList.remove('open')); open = null; };
  const addChip = (kind, card, icon) => {
    if (primary && primary[1] === card) return;
    const panel = h('div', { class: 'panel', hidden: true }, card);
    panels.append(panel);
    const chip = h('button', { class: 'tchip' });
    const upd = () => { chip.innerHTML = ''; chip.append(h('span', { class: 'ic' }, icon), h('span', {}, card._label ? card._label() : kind)); chip.classList.toggle('on', !!(card._running && card._running())); };
    card._chip = upd; upd();
    chip.onclick = () => { if (open === panel) { closeAll(); return; } closeAll(); panel.hidden = false; chip.classList.add('open'); open = panel; };
    chips.push(chip);
  };
  const icons = { metro: '♩', tuner: '◎', drone: '∿', timer: '◷', play: '▶' };
  cards.forEach(([k, c]) => addChip(k, c, icons[k]));
  if (notesCard) addChip('notes', notesCard, '✎');
  if (music.length) {
    const fchip = h('button', { class: 'tchip' + (ss.fingerEdit ? ' on' : '') }, h('span', { class: 'ic' }, '¹²'), h('span', {}, t('fingers')));
    fchip.onclick = () => { ss.fingerEdit = !ss.fingerEdit; fchip.classList.toggle('on', ss.fingerEdit); right.classList.toggle('editing', ss.fingerEdit); if (ss.fingerEdit) toast(t('finger_edit_hint')); };
    chips.push(fchip);
  }
  panels.addEventListener('pointerdown', ev => ev.stopPropagation());
  return { el, chips, panels };
}

/* swipe / keys / pedal */
document.addEventListener('keydown', ev => {
  if (!S.session) return;
  const tg = (ev.target.tagName || '').toLowerCase();
  if (tg === 'textarea' || tg === 'input' || tg === 'select') return;
  if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); turn(1); }
  if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); turn(-1); }
  if (ev.key === 'Escape') endSession(true);
});
let touch0 = null;
document.addEventListener('touchstart', ev => { if (!S.session) return; const tg = (ev.target.tagName || '').toLowerCase(); if (tg === 'input' || tg === 'textarea' || ev.target.closest('.panel,.abc-host,.fpal')) { touch0 = null; return; } const p = ev.touches[0]; touch0 = { x: p.clientX, y: p.clientY, t: Date.now() }; }, { passive: true });
document.addEventListener('touchend', ev => { if (!S.session || !touch0) return; const p = ev.changedTouches[0], dx = p.clientX - touch0.x, dy = p.clientY - touch0.y; if (Math.abs(dx) > 90 && Math.abs(dy) < 60 && Date.now() - touch0.t < 700) turn(dx < 0 ? 1 : -1); touch0 = null; }, { passive: true });
let wake = null;
async function requestWake() { try { wake = await navigator.wakeLock.request('screen'); } catch (e) { wake = null; } }
function releaseWake() { try { wake && wake.release(); } catch (e) { } wake = null; }

/* ======================= LIBRARY & IMPORT ======================= */
function renderLibrary() {
  const v = $('#v-library'); v.innerHTML = '';
  const input = h('input', { type: 'file', accept: '.mxl,.musicxml,.xml,.abc,.txt,.pdf,image/*', hidden: true, onchange: async e => { const f = e.target.files[0]; if (f) await importFile(f.name, await f.arrayBuffer(), f.type); e.target.value = ''; } });
  const grid = h('div', { class: 'shelf' });
  S.pieces.forEach(p => {
    let armed = false;
    const del = p.builtin ? null : h('button', { class: 'linkbtn danger', onclick: ev => { ev.stopPropagation(); if (!armed) { armed = true; ev.target.textContent = t('sure'); return; } S.pieces = S.pieces.filter(x => x.id !== p.id); savePieces(); if (S.piece.id === p.id) setPiece('swan'); renderLibrary(); } }, t('delete_piece'));
    grid.append(h('div', { class: 'book' + (S.piece.id === p.id ? ' current' : ''), onclick: () => { setPiece(p.id); go('home'); } },
      h('div', { class: 'spine' }),
      h('div', { class: 'bk' }, h('div', { class: 'cap light' }, p.builtin ? t('built_in') : (p.keyName ? tt(p.key) : '')), h('div', { class: 'bk-title' }, tt(p.title)), h('div', { class: 'bk-comp' }, p.composer || ''),
        h('div', { class: 'bk-meta' }, p.bars + ' ' + t('bars') + ' · ' + pieceExercises(p).length + ' ' + t('exercises'))),
      h('div', { class: 'bk-actions' }, h('button', { class: 'linkbtn', onclick: ev => { ev.stopPropagation(); setPiece(p.id); go('piece'); } }, t('open_piece')), del)));
  });
  grid.append(h('button', { class: 'book add', onclick: () => input.click() }, h('div', { class: 'plus' }, '+'), h('div', { class: 'bk-title' }, t('add_piece')), h('p', {}, t('add_hint'))));
  v.append(h('div', { class: 'pagehead' }, h('h1', { class: 'disp' }, t('library_h'))), grid, input);
}
async function importFile(name, buf, mime) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const busy = h('div', { class: 'busy' }, h('div', { class: 'spinner' }), t('importing'));
  document.body.append(busy);
  try {
    let parsed;
    if (ext === 'mxl') parsed = MX.parseMusicXML(await MX.unzipMxl(buf), { fileName: name });
    else if (ext === 'musicxml' || ext === 'xml') parsed = MX.parseMusicXML(new TextDecoder().decode(buf), { fileName: name });
    else if (ext === 'abc' || ext === 'txt') parsed = abcToParsed(new TextDecoder().decode(buf), name);
    else if (ext === 'pdf' || /^image\//.test(mime || '') || ['jpg', 'jpeg', 'png', 'heic'].includes(ext)) {
      const key = S.prog.settings.apiKey;
      if (!key) { busy.remove(); infoDialog(t('add_piece'), t('pdf_needs')); return; }
      const abc = await readWithClaude(buf, ext === 'pdf' ? 'application/pdf' : (mime || 'image/jpeg'), key);
      parsed = abcToParsed(abc, name);
    } else throw new Error('.' + ext);
    if (!parsed.notes.some(n => !n.rest)) throw new Error('no notes found');
    const piece = GEN.buildPiece(parsed, S.profile);
    piece.photo = ['img/fholes.jpg', 'img/cello_a.jpg', 'img/cello_detail.jpg', 'img/walensee.jpg'][S.pieces.length % 4];
    piece.barEighths = barEighthsOf(piece.time);
    S.pieces.push(piece); savePieces(); setPiece(piece.id);
    busy.remove();
    toast(t('imported', { t: tt(piece.title), n: pieceExercises(piece).length }), 3500);
    go('piece');
  } catch (err) {
    busy.remove();
    infoDialog(t('add_piece'), t('import_fail', { e: (err && err.message) || String(err) }));
  }
}
window.DC_onNativeFile = async (rel, name) => {
  try { const r = await fetch(rel); const buf = await r.arrayBuffer(); await importFile(name, buf, r.headers.get('content-type')); }
  catch (e) { toast(t('import_fail', { e: e.message })); }
};
const CLAUDE_PROMPT = `Transcribe the CELLO part of this score into ABC notation for a practice app.
Rules:
- Output only ABC inside one \`\`\`abc code block, nothing else.
- Headers: X:1, T:<title>, C:<composer>, M:<time>, L:1/8, Q:1/4=<tempo or a typical tempo>, K:<key> clef=<bass|tenor|treble as printed at the start>.
- Only the cello melody (ignore piano). One bar per |, finish with |]. Change clef inline with [K:clef=tenor] etc. when the printed clef changes.
- Write accidentals exactly as needed in ABC (accidentals last until the bar line). Ties with -, slurs with ( ). Triplets as (3.
- Keep printed dynamics as !p! !mf! etc., hairpins as !crescendo(! !crescendo)! !diminuendo(! !diminuendo)!, fermata !fermata!, printed fingerings as !1! !2! etc.
- Rests as z. Check that every bar adds up to the time signature.`;
async function readWithClaude(buf, mime, key) {
  const b64 = btoa(Array.from(new Uint8Array(buf), c => String.fromCharCode(c)).join(''));
  const block = mime === 'application/pdf' ? { type: 'document', source: { type: 'base64', media_type: mime, data: b64 } } : { type: 'image', source: { type: 'base64', media_type: mime === 'image/heic' ? 'image/jpeg' : mime, data: b64 } };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: S.prog.settings.model || 'claude-sonnet-5-5', max_tokens: 12000, messages: [{ role: 'user', content: [block, { type: 'text', text: CLAUDE_PROMPT }] }] })
  });
  const j = await res.json();
  if (!res.ok) throw new Error((j.error && j.error.message) || res.status);
  const text = (j.content || []).map(c => c.text || '').join('\n');
  const m = /```(?:abc)?\s*([\s\S]*?)```/.exec(text);
  return (m ? m[1] : text).trim();
}
function infoDialog(title, text) {
  const m = h('div', { class: 'modal', onclick: e => { if (e.target === m) m.remove(); } },
    h('div', { class: 'sheet' }, h('h2', { class: 'disp' }, title), h('p', {}, text), h('div', { class: 'right' }, h('button', { class: 'btn primary', onclick: () => m.remove() }, t('done')))));
  document.body.append(m);
}

/* ======================= PIECE VIEW ======================= */
function renderPiece() {
  stopAll();
  const v = $('#v-piece'); v.innerHTML = '';
  const p = S.piece;
  const score = h('div', { class: 'score', id: 'fullscore' });
  const spots = p.spots || [];
  const side = h('div', { class: 'piece-side' });
  if (S.spotSel && spots.find(s => s.id === S.spotSel)) {
    const s = spots.find(x => x.id === S.spotSel);
    const exs = pieceExercises(p).filter(e => e.spot === s.id);
    side.append(h('button', { class: 'linkbtn', onclick: () => { S.spotSel = null; renderPiece(); } }, '← ' + t('spots_h')),
      h('div', { class: 'spotline' }, h('span', { class: 'spotdot', style: '--c:var(--s' + s.color + ')' }), h('span', { class: 'muted' }, t('bars') + ' ' + s.bars.join(', '))),
      h('h2', { class: 'disp' }, tt(s.name)), h('p', {}, tt(s.what)),
      h('ul', { class: 'exlist' }, exs.map(e => h('li', {}, h('span', {}, tt(e.title)), h('button', { class: 'btn small', onclick: () => startSession([e]) }, t('practise'))))),
      h('button', { class: 'btn primary', onclick: () => startSession(spotAgenda(s.id)) }, t('practise_spot')));
  } else {
    side.append(h('div', { class: 'cap' }, p.composer), h('h2', { class: 'disp' }, tt(p.title)),
      h('div', { class: 'cap ink', style: 'margin-top:14px' }, t('spots_h')),
      h('ul', { class: 'spotlist' }, spots.map(s => { const sc = spotScore(s.id); return h('li', { onclick: () => { S.spotSel = s.id; renderPiece(); } },
        h('span', { class: 'spotdot', style: '--c:var(--s' + s.color + ')' }), h('span', {}, h('b', {}, tt(s.name)), h('small', {}, t('bars') + ' ' + s.bars.join(', ') + (sc == null ? ' · ' + t('not_yet') : ''))),
        h('span', { class: 'meter' }, h('i', { style: 'width:' + (sc == null ? 0 : Math.max(8, sc * 100)) + '%' }))); })));
    side.append(playTool({ from: 1, to: p.bars, guide: true, water: true }, 'piece', b => highlightBar(score, b)));
    if (p.builtin) side.append(h('div', { class: 'tiny' }, t('credits')));
  }
  v.append(h('div', { class: 'piece' }, h('div', { class: 'piece-score' }, score), side));
  requestAnimationFrame(() => {
    const shown = (S.profile && S.profile.clefs && !S.profile.clefs.includes('tenor')) ? p.abc.replace(/clef=tenor/g, 'clef=bass') : p.abc;
    renderAbc(score, '%%barnumbers 1\n' + shown, { wrap: true, perLine: 4, staffwidth: 820, click: (el, tn, classes) => { const m = /abcjs-mm(\d+)/.exec(classes || ''); if (!m) return; const bar = +m[1] + 1; const s = spots.find(sp => sp.bars.includes(bar)); if (s) { S.spotSel = s.id; renderPiece(); } } });
    spots.forEach(s => { if (S.spotSel && S.spotSel !== s.id) return; s.bars.forEach(b => score.querySelectorAll('.abcjs-note.abcjs-mm' + (b - 1) + ', .abcjs-beam-elem.abcjs-mm' + (b - 1)).forEach(n => { n.style.fill = 'var(--s' + s.color + ')'; n.style.color = 'var(--s' + s.color + ')'; })); });
  });
}
function highlightBar(score, b) { score.querySelectorAll('.hl').forEach(n => n.classList.remove('hl')); if (b) score.querySelectorAll('.abcjs-note.abcjs-mm' + (b - 1)).forEach(n => n.classList.add('hl')); }

/* ======================= PROGRESS ======================= */
function renderProgress() {
  const v = $('#v-progress'); v.innerHTML = '';
  const ss = S.prog.sessions;
  const mins = ss.reduce((a, s) => a + (s.min || 0), 0);
  const days = new Set(ss.map(s => s.d));
  let streak = 0; { const d = new Date(); if (!days.has(today())) d.setDate(d.getDate() - 1); while (days.has(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'))) { streak++; d.setDate(d.getDate() - 1); } }
  const wk = ss.filter(s => daysSince(s.d) <= 6).reduce((a, s) => a + (s.min || 0), 0);
  const notes = Object.keys(S.prog.notes).filter(k => (S.prog.notes[k] || '').trim());
  v.append(h('div', { class: 'journey' },
    h('div', { class: 'jl' },
      h('div', { class: 'cap' }, S.profile ? S.profile.name : ''), h('h1', { class: 'disp' }, t('progress_h')),
      h('div', { class: 'stats' }, [[ss.length, 'st_sessions'], [mins, 'st_minutes'], [streak, 'st_streak'], [wk, 'st_week']].map(([n, k]) => h('div', {}, h('div', { class: 'bignum sm' }, String(n)), h('span', { class: 'cap' }, t(k))))),
      h('div', { class: 'cap ink' }, tt(S.piece.title) + ' · ' + t('spots_h')),
      h('ul', { class: 'spotlist plain' }, (S.piece.spots || []).map(s => { const sc = spotScore(s.id); return h('li', {}, h('span', { class: 'spotdot', style: '--c:var(--s' + s.color + ')' }), h('span', {}, h('b', {}, tt(s.name)), h('small', {}, sc == null ? t('not_yet') : Math.round(sc * 100) + '%')), h('span', { class: 'meter wide' }, h('i', { style: 'width:' + (sc == null ? 0 : Math.max(6, sc * 100)) + '%' }))); }))),
    h('div', { class: 'jr' },
      h('div', { class: 'cap ink' }, t('history')),
      ss.length ? h('ul', { class: 'hist' }, ss.slice().reverse().slice(0, 14).map(s => { const pc = S.pieces.find(p => p.id === s.piece); return h('li', {}, h('span', { class: 'num' }, s.d), h('span', {}, pc ? tt(pc.title) : ''), h('span', { class: 'dots' }, Object.values(s.r || {}).map(r => h('i', { class: r }))), h('span', { class: 'num muted' }, s.min + ' ' + t('min'))); })) : h('p', { class: 'muted' }, t('no_hist')),
      notes.length ? h('div', {}, h('div', { class: 'cap ink', style: 'margin-top:18px' }, t('your_notes')), notes.slice(-6).reverse().map(k => h('p', { class: 'note' }, S.prog.notes[k]))) : null)));
}

/* ======================= SETTINGS & PROFILES ======================= */
function openSettings() {
  const st = S.prog.settings;
  const close = () => { m.remove(); render(); };
  const sel = (opts, val, on) => h('select', { onchange: e => on(e.target.value) }, opts.map(([v, l]) => h('option', { value: v, selected: String(v) === String(val) ? true : null }, l)));
  let armed = false;
  const resetBtn = h('button', { class: 'linkbtn danger' }, t('reset_prog'));
  resetBtn.onclick = () => { if (!armed) { armed = true; resetBtn.textContent = t('sure'); return; } const keep = Object.assign({}, S.prog.settings); S.prog = DEFAULT_PROG(); S.prog.settings = keep; saveProg(); toast(t('deleted')); close(); };
  const keyIn = h('input', { type: 'password', value: st.apiKey || '', placeholder: 'sk-ant-…', autocomplete: 'off', onchange: e => { st.apiKey = e.target.value.trim(); saveProg(); } });
  const m = h('div', { class: 'modal', onclick: e => { if (e.target === m) close(); } },
    h('div', { class: 'sheet' },
      h('h2', { class: 'disp' }, t('settings')),
      h('div', { class: 'two' },
        h('label', { class: 'field' }, t('set_lang'), sel([['en', 'English'], ['de', 'Deutsch'], ['pt', 'Português']], S.lang, v => { S.lang = v; S.profile.lang = v; saveProfiles(); close(); openSettings(); })),
        h('label', { class: 'field' }, t('set_theme'), sel([['light', t('th_light')], ['dark', t('th_dark')]], st.theme, v => { st.theme = v; saveProg(); applyTheme(); }))),
      h('div', { class: 'two' },
        h('label', { class: 'field' }, t('set_a4'), sel([436, 438, 440, 441, 442, 443, 444, 445].map(n => [n, n + ' Hz']), st.a4, v => { st.a4 = +v; AU.a4 = +v; saveProg(); })),
        h('label', { class: 'field' }, t('set_drone'), sel([['cello', t('tone_cello')], ['organ', t('tone_organ')]], st.drone, v => { st.drone = v; AU.droneTimbre = v; saveProg(); }))),
      h('div', { class: 'two' },
        h('label', { class: 'field' }, t('set_tol'), sel([[5, '±5 cents'], [10, '±10 cents'], [15, '±15 cents']], st.tol, v => { st.tol = +v; saveProg(); })),
        h('label', { class: 'field' }, t('set_hold'), sel([[1, '1.0 s'], [1.5, '1.5 s'], [2, '2.0 s']], st.hold, v => { st.hold = +v; saveProg(); }))),
      h('label', { class: 'field' }, t('set_fing'), sel([['all', t('fing_all')], ['off', t('fing_off')]], st.fing, v => { st.fing = v; saveProg(); })),
      h('label', { class: 'field' }, t('set_key'), keyIn, h('span', { class: 'tiny' }, t('key_hint'))),
      h('div', { class: 'cap ink', style: 'margin-top:6px' }, t('profile_h') + ' · ' + (S.profile.name || '')),
      h('div', { class: 'ctrls' }, h('button', { class: 'btn', onclick: () => { m.remove(); startOnboarding(S.profile); } }, t('edit_answers')), h('button', { class: 'btn', onclick: () => { m.remove(); startOnboarding(null, true); } }, '+ ' + t('add_student'))),
      h('div', { class: 'row-between' }, resetBtn, h('button', { class: 'btn primary', onclick: close }, t('done')))));
  document.body.append(m);
}
function openProfiles() {
  const m = h('div', { class: 'modal', onclick: e => { if (e.target === m) m.remove(); } },
    h('div', { class: 'sheet' }, h('h2', { class: 'disp' }, t('switch_profile')),
      h('div', { class: 'profiles' }, S.profiles.map(p => h('button', { class: 'prof' + (p.id === S.profile.id ? ' on' : ''), onclick: () => { m.remove(); loadProfile(p.id); loadPieces(); S.agenda = []; S.view = 'home'; render(); } }, h('span', { class: 'avatar' }, (p.name || '?').slice(0, 1).toUpperCase()), h('span', {}, p.name || '—'))),
        h('button', { class: 'prof add', onclick: () => { m.remove(); startOnboarding(null, true); } }, h('span', { class: 'avatar' }, '+'), h('span', {}, t('add_student'))))));
  document.body.append(m);
}

/* ======================= ONBOARDING ======================= */
function startOnboarding(existing, asStudent) {
  const ans = Object.assign({ name: '', role: asStudent ? 'student' : 'student', age: 'adult', years: 'y1', positions: 'fourth', clefs: ['bass'], improve: [], len: 30, lang: S.lang }, existing || {});
  const steps = [
    { k: 'name', photo: 'img/cello_a.jpg', title: asStudent ? t('student_name') : t('ob_name'), type: 'text' },
    asStudent ? null : { k: 'role', photo: 'img/cello_detail.jpg', title: t('ob_role'), opts: [['student', t('r_student')], ['teacher', t('r_teacher')], ['both', t('r_both')]] },
    { k: 'age', photo: 'img/walensee.jpg', title: t('ob_age'), opts: [['child', t('a_child')], ['teen', t('a_teen')], ['adult', t('a_adult')]] },
    { k: 'years', photo: 'img/fholes.jpg', title: t('ob_years'), opts: [['y0', t('y0')], ['y1', t('y1')], ['y3', t('y3')], ['y6', t('y6')], ['pro', t('ypro')]] },
    { k: 'positions', photo: 'img/cello_detail.jpg', title: t('ob_pos'), opts: [['first', t('p_first')], ['fourth', t('p_fourth')], ['neck', t('p_neck')], ['thumb', t('p_thumb')]] },
    { k: 'clefs', photo: 'img/cello_a.jpg', title: t('ob_clefs'), multi: true, opts: [['bass', t('c_bass')], ['tenor', t('c_tenor')], ['treble', t('c_treble')]] },
    { k: 'improve', photo: 'img/swan.jpg', title: t('ob_improve'), multi: true, opts: [['intonation', t('i_intonation')], ['shift', t('i_shift')], ['bow', t('i_bow')], ['vibrato', t('i_vibrato')], ['rhythm', t('i_rhythm')], ['musical', t('i_musical')], ['creative', t('i_creative')]] },
    { k: 'len', photo: 'img/walensee.jpg', title: t('ob_time'), opts: [[15, '15 ' + t('min')], [20, '20 ' + t('min')], [30, '30 ' + t('min')], [45, '45 ' + t('min')], [60, '60 ' + t('min')], [90, '90 ' + t('min')]] },
    { k: 'ready', photo: 'img/swan.jpg' }
  ].filter(Boolean);
  let i = 0;
  const root = $('#onboard'); root.hidden = false;
  const finish = () => {
    if (!ans.clefs.length) ans.clefs = ['bass'];
    S.profiles = DB.get('profiles', []);
    if (existing) { Object.assign(existing, ans); const ix = S.profiles.findIndex(p => p.id === existing.id); if (ix >= 0) S.profiles[ix] = existing; }
    else { ans.id = 'u' + Date.now().toString(36); ans.created = today(); S.profiles.push(ans); }
    saveProfiles();
    root.hidden = true; root.innerHTML = '';
    loadProfile(existing ? existing.id : ans.id); loadPieces(); fingCache.clear();
    S.agenda = []; S.view = 'home'; render();
  };
  const draw = (dir = 1) => {
    const st = steps[i]; root.innerHTML = '';
    const right = h('div', { class: 'leaf text ob' });
    right.append(h('div', { class: 'ob-dots' }, steps.map((_, j) => h('i', { class: j < i ? 'done' : j === i ? 'now' : '' }))));
    if (i === 0) {
      right.append(h('div', { class: 'cap' }, 'Daily Cello'), h('h1', { class: 'disp huge' }, t('ob_welcome')), h('p', { class: 'lead' }, t('ob_welcome_sub')),
        h('div', { class: 'chips' }, LANGS.map(l => h('button', { class: 'chip', 'aria-pressed': S.lang === l ? 'true' : 'false', onclick: () => { S.lang = l; ans.lang = l; document.documentElement.lang = l; draw(); } }, { en: 'English', de: 'Deutsch', pt: 'Português' }[l]))));
    }
    if (st.k === 'ready') {
      right.append(h('h1', { class: 'disp huge' }, t('ob_ready', { n: ans.name || '' })), h('p', { class: 'lead' }, t('ob_ready_sub')));
    } else {
      right.append(h('h2', { class: 'disp q' }, st.title));
      if (st.type === 'text') {
        const inp = h('input', { type: 'text', class: 'big-input', value: ans.name, autocomplete: 'given-name', oninput: e => { ans.name = e.target.value; } });
        right.append(inp); setTimeout(() => { try { inp.focus(); } catch (e) { } }, 300);
      } else {
        if (st.multi) right.append(h('div', { class: 'tiny' }, t('choose_many')));
        right.append(h('div', { class: 'options' }, st.opts.map(([v, l]) => {
          const on = st.multi ? ans[st.k].includes(v) : String(ans[st.k]) === String(v);
          return h('button', { class: 'opt', 'aria-pressed': on ? 'true' : 'false', onclick: () => {
            if (st.multi) { const a = ans[st.k]; const ix = a.indexOf(v); if (ix >= 0) a.splice(ix, 1); else a.push(v); draw(); }
            else { ans[st.k] = v; if (st.k === 'role' && v === 'teacher') ans.positions = 'thumb'; i++; draw(1); }
          } }, l);
        })));
      }
    }
    right.append(h('div', { class: 'row-between ob-nav' },
      i > 0 ? h('button', { class: 'btn', onclick: () => { i--; draw(-1); } }, '← ' + t('back')) : h('span'),
      st.k === 'ready' ? h('button', { class: 'btn primary big', onclick: finish }, t('ob_start') + ' →') : h('button', { class: 'btn primary', onclick: () => { i++; draw(1); } }, t('next') + ' →')));
    root.append(h('div', { class: 'spread onboard page-anim' + (dir < 0 ? ' back' : '') }, h('div', { class: 'leaf photo', style: `background-image:url(${st.photo})` }), right));
  };
  draw();
}

/* ======================= SELF-TEST (simulator) ======================= */
async function selfTest() {
  const out = []; let fails = 0, checks = 0;
  const ok = (c, m) => { checks++; if (!c) { fails++; out.push('FAIL ' + m); } };
  const log = s => nativeLog('selftest', s);
  try {
    ok(typeof ABCJS !== 'undefined', 'abcjs loaded');
    const r = await fetch('pieces/The-Swan.mxl'); ok(r.ok, 'bundled score served');
    const parsed = MX.parseMusicXML(await MX.unzipMxl(await r.arrayBuffer()), { fileName: 'The-Swan.mxl' });
    ok(parsed.measures.length === 28, 'swan bars');
    const piece = GEN.buildPiece(parsed, { positions: 'thumb', clefs: ['bass', 'tenor'] });
    ok(piece.exercises.length > 8, 'generated exercises');
    // render a full session of the built-in piece
    S.agenda = buildAgenda(30, 'balanced');
    ok(S.agenda.length >= 6, 'agenda');
    startSession(S.agenda);
    for (let k = 0; k < S.session.pages.length; k++) { await new Promise(res => setTimeout(res, 120)); ok(!!document.querySelector('#session .spread'), 'page ' + k); turn(1); }
    await new Promise(res => setTimeout(res, 200));
    ok(!!document.querySelector('#session .done'), 'done page');
    endSession(false);
    // imported piece flow
    S.pieces.push(Object.assign(piece, { barEighths: 12 })); setPiece(piece.id);
    startSession(buildAgenda(20, 'left'));
    let drawn = false;
    for (let k = 0; k < S.session.pages.length && !drawn; k++) {
      await new Promise(res => setTimeout(res, 150));
      drawn = document.querySelectorAll('#session svg').length > 0;
      if (!drawn) turn(1);
    }
    ok(drawn, 'notation drawn for imported piece');
    endSession(false);
    S.pieces = S.pieces.filter(p => p.id !== piece.id); setPiece('swan');
  } catch (e) { fails++; out.push('ERROR ' + (e && e.stack || e)); }
  out.forEach(log);
  log(`SELFTEST DONE ${fails} failed (${checks} checks)`);
  nativeLog('selftest', '', { done: true });
  console.log(out.join('\n'), `SELFTEST DONE ${fails} failed (${checks} checks)`);
  window.SELFTEST_RESULT = { fails, checks, out };
}

/* ======================= BOOT ======================= */
function boot() {
  const nl = (navigator.language || 'en').slice(0, 2);
  S.lang = LANGS.includes(nl) ? nl : 'en';
  $('#btn-settings').onclick = () => S.profile && openSettings();
  const active = DB.get('active', null);
  const isTest = window.DC_SELFTEST || /selftest=1/.test(location.search);
  if (isTest && !DB.get('profiles', []).length) DB.set('profiles', [{ id: 'test', name: 'Test', role: 'student', positions: 'thumb', clefs: ['bass', 'tenor'], improve: [], len: 30, lang: 'en' }]);
  if (!loadProfile(active)) { applyTheme(); startOnboarding(null); return; }
  AU.a4 = S.prog.settings.a4; AU.droneTimbre = S.prog.settings.drone;
  loadPieces(); render();
  if (isTest) setTimeout(selfTest, 600);
}
boot();
