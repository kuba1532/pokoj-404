/* Teczka Śledcza · silnik escape roomów (wspólny dla wszystkich gier; treść gry w window.GAME) */
(() => {
  const G = window.GAME;
  if (!G || !G.scenes) { document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">Brak danych gry. <a href="./">Wróć do listy gier</a>.</p>'; return; }
  const S = G.scenes;
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const KEY = `esc.${G.id}.v1`;
  if (G.legacyKey) { try { if (!localStorage.getItem(KEY) && localStorage.getItem(G.legacyKey)) { localStorage.setItem(KEY, localStorage.getItem(G.legacyKey)); localStorage.removeItem(G.legacyKey); } } catch {} }

  /* ---------- motyw i poziomy trudności ---------- */
  const META = (window.GAMES || []).find(x => x.id === G.id) || {};
  const THEME = G.theme || META.theme || 'neon';
  document.body.classList.add('theme-' + THEME);
  const LEVELS = window.LEVELS || { normal: { id: 'normal', name: 'Detektyw', tag: 'normalny', time: 0, hintCost: 5, freeFirstHint: false, penMult: 1, cardTries: 3, strictFormat: false, pulse: true, desc: '' } };
  const LEVEL_ORDER = Object.keys(LEVELS);
  const LV = () => LEVELS[st.level] || LEVELS.normal;
  const totalMinFor = (lvl) => Math.max(30, G.TOTAL_MIN + ((LEVELS[lvl] || LEVELS.normal).time || 0));
  const totalMin = () => totalMinFor(st.level);
  const pen = (base) => Math.max(1, Math.round(base * LV().penMult));
  // tokeny w tekstach gry: {MIN} czas, {PEN} kara za zły kod, {PEN2} kara za ostatni zamek, {HINT} koszt podpowiedzi
  const T = (s) => String(s == null ? '' : s).replace(/\{MIN\}/g, totalMin()).replace(/\{PEN2\}/g, pen(10)).replace(/\{PEN\}/g, pen(5)).replace(/\{HINT\}/g, LV().hintCost);

  const fresh = () => ({
    phase: 'title', level: G.DEFAULT_LEVEL || 'normal', startAt: null, endAt: null, penalty: 0, ended: null, locksmith: false, timeOutShown: false,
    opened: {}, codes: {}, wrong: {}, docs: [], hints: {}, paidHints: 0, cards: {}, scene: G.START_SCENE,
    marks: { grid: {}, edges: {}, tog: {} }, mirror: false, seen: {}, memo: '', flags: {}, accuse: {}, accused: false, accuseTries: 0,
  });
  let st = load();
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.phase ? Object.assign(fresh(), s) : fresh(); } catch { return fresh(); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} }

  /* ---------- dźwięki (WebAudio, bez plików) ---------- */
  let actx;
  const PITCH = G.PITCH || { neon: 1, snow: .82, beam: 1.15 }[THEME] || 1;
  const ctx = () => (actx = actx || new (window.AudioContext || window.webkitAudioContext)());
  function beep(f = 600, d = .06, type = 'square', g = .04) {
    try { const c = ctx(); const o = c.createOscillator(), v = c.createGain(); o.type = type; o.frequency.value = f * PITCH; v.gain.value = g; o.connect(v); v.connect(c.destination); o.start(); v.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d); o.stop(c.currentTime + d); } catch {}
  }
  let toneNode;
  function toneStart(f = 720, type = 'sine', g = .06) { toneStop(); try { const c = ctx(); const o = c.createOscillator(), v = c.createGain(); o.type = type; o.frequency.value = f; v.gain.value = g; o.connect(v); v.connect(c.destination); o.start(); toneNode = { o, v }; } catch {} }
  function toneStop() { if (!toneNode) return; try { const { o, v } = toneNode; v.gain.setTargetAtTime(.0001, ctx().currentTime, .01); o.stop(ctx().currentTime + .05); } catch {} toneNode = null; }
  const sfx = { click: () => beep(700, .04), err: () => { beep(160, .18, 'sawtooth', .05); }, ok: () => { beep(660, .08, 'triangle', .05); setTimeout(() => beep(880, .12, 'triangle', .05), 90); setTimeout(() => beep(1320, .18, 'triangle', .05), 200); }, paper: () => beep(300, .03, 'sine', .02), tick: () => beep(1800, .02, 'square', .02) };

  /* ---------- czas ---------- */
  const now = () => Date.now();
  function elapsedSec() { if (!st.startAt) return 0; return Math.floor(((st.endAt || now()) - st.startAt) / 1000); }
  function remainingSec() { return totalMin() * 60 - elapsedSec() - st.penalty * 60; }
  const fmt = (s) => { const neg = s < 0; s = Math.abs(s); return (neg ? '−' : '') + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  function tick() {
    if (st.phase !== 'play') return;
    const r = remainingSec();
    const t = $('#timer'); t.textContent = fmt(r); t.classList.toggle('warn', r <= 300 && r > 0); t.classList.toggle('over', r <= 0);
    if (r <= 0 && !st.timeOutShown && !st.ended) { st.timeOutShown = true; save(); showTimeOut(); }
  }
  setInterval(tick, 500);

  function addPenalty(min, why) {
    st.penalty += min; save();
    const el = document.createElement('div'); el.className = 'pen'; el.textContent = `+${min} min · ${why}`; $('#app').appendChild(el); setTimeout(() => el.remove(), 2200);
    $('#penalty').textContent = st.penalty ? `kary: +${st.penalty} min` : '';
    tick();
  }

  /* ---------- toasty i modale ---------- */
  function toast(msg, ms = 2600) { const el = $('#toast'); el.innerHTML = msg; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), ms); }
  function openModal(html, cls = '') { const m = $('#modal'); m.className = 'modal on ' + cls; $('#modalBody').innerHTML = html; m.scrollTop = 0; $('#modalBody').scrollTop = 0; sfx.paper(); return m; }
  function closeModal() { toneStop(); $('#modal').classList.remove('on'); if (G.onModalClose) G.onModalClose(); }
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

  /* ---------- ekrany ---------- */
  function buildStatic() {
    document.title = G.TITLE.h1.replace(/<[^>]+>/g, '');
    $('#titleArt').innerHTML = G.TITLE.art || '';
    $('#titleEyebrow').innerHTML = G.TITLE.eyebrow || 'Teczka Śledcza · escape room';
    $('#titleH1').innerHTML = G.TITLE.h1;
    $('#titleFine').innerHTML = T(G.TITLE.fine || '');
    $('#briefDocno').textContent = G.BRIEF.docno || 'Odprawa';
    $('#briefH2').innerHTML = G.BRIEF.h2 || '';
    $('#briefText').innerHTML = T(G.BRIEF.text || '');
    $('#btnEnter').textContent = G.BRIEF.enter || 'Wchodzimy';
    const nav = $('#nav'); nav.style.gridTemplateColumns = `repeat(${G.SCENES.length + 3}, 1fr)`;
    nav.innerHTML = G.SCENES.map(s => `<button data-scene="${s.id}"><i>${s.icon}</i>${s.label}</button>`).join('') +
      `<button id="navDocs"><i>📁</i>${G.NAV_DOCS || 'Teczka'}</button><button id="navCards"><i>🂠</i>Karty</button><button id="navHints"><i>💡</i>Pomoc</button>`;
    $$('#nav button[data-scene]').forEach(b => b.addEventListener('click', () => {
      const sc = G.SCENES.find(s => s.id === b.dataset.scene);
      if (sc.requires && !st.opened[sc.requires]) return toast(sc.lockedMsg || 'Jeszcze tam nie wejdziecie.');
      go(sc.id);
    }));
    $('#navDocs').addEventListener('click', showDocs);
    $('#navCards').addEventListener('click', G.DEMO ? () => G.custom.paywall(api, { label: 'Karty zagadek' }) : showCards);
    $('#navHints').addEventListener('click', showHints);
    renderDynamicText();
  }
  // teksty zależne od poziomu (czas, kary): tytuł, odprawa, wybór poziomu
  function renderDynamicText() {
    $('#titleSub').innerHTML = T(G.TITLE.sub || '');
    $('#briefRules').innerHTML = (G.BRIEF.rules || []).map(r => `<li>${T(r)}</li>`).join('');
    $('#timer').textContent = fmt(totalMin() * 60);
    const lp = $('#levelPick');
    if (lp) {
      const locked = !!st.startAt; // poziom wybiera się przed startem
      lp.innerHTML = `<div class="docno">Poziom trudności${locked ? ' · ustalony na start' : ''}</div>
        <div class="levels">${LEVEL_ORDER.map(k => { const L = LEVELS[k]; return `<button class="lvl ${k} ${st.level === k ? 'on' : ''}" data-lvl="${k}" ${locked ? 'disabled' : ''}><i>${L.tag}</i><b>${L.name}</b><span>${totalMinFor(k)} min</span></button>`; }).join('')}</div>
        <p class="lvl-desc">${LV().desc || ''}</p>`;
      $$('[data-lvl]', lp).forEach(b => b.addEventListener('click', () => { if (locked) return; st.level = b.dataset.lvl; save(); sfx.click(); renderDynamicText(); }));
    }
    $('#btnContinue').textContent = st.startAt ? `Kontynuuj · ${LV().name}` : 'Kontynuuj';
    document.body.classList.toggle('nopulse', !LV().pulse);
  }
  function render() {
    $('#title').classList.toggle('on', st.phase === 'title');
    $('#brief').classList.toggle('on', st.phase === 'brief');
    $('#app').classList.toggle('on', st.phase === 'play');
    if (st.phase === 'title') { $('#btnContinue').style.display = st.startAt ? '' : 'none'; renderDynamicText(); }
    if (st.phase === 'brief') renderDynamicText();
    if (st.phase === 'play') { renderScene(); renderNav(); $('#penalty').textContent = st.penalty ? `kary: +${st.penalty} min` : ''; renderTokens(); tick(); }
  }
  function tokens() { return Object.values(st.cards).filter(c => c.solved && !c.spent).length; }
  function renderTokens() { const n = tokens(); $('#tokens').textContent = n ? `🂠 ${n}` : ''; }

  function sceneFlags() { return { opened: st.opened, docs: st.docs, flags: st.flags, has: (d) => st.docs.includes(d), level: st.level }; }
  function renderScene() {
    const host = $('#scene');
    if (!S[st.scene]) st.scene = G.START_SCENE;
    host.innerHTML = S[st.scene](sceneFlags());
    $('#sceneName').textContent = (G.SCENES.find(s => s.id === st.scene) || {}).name || '';
    host.classList.remove('fade'); void host.offsetWidth; host.classList.add('fade');
    $$('.hs', host).forEach(h => h.addEventListener('click', () => act(h.dataset.act)));
  }
  function renderNav() {
    G.SCENES.forEach(s => { const b = $(`#nav button[data-scene="${s.id}"]`); b.classList.toggle('locked', !!(s.requires && !st.opened[s.requires])); b.classList.toggle('active', s.id === st.scene); });
    const hasNew = Object.keys(st.seen).filter(k => st.docs.includes(k)).length < st.docs.length; $('#navDocs').classList.toggle('badge', hasNew);
  }
  function go(scene) { if (scene === st.scene) return; st.scene = scene; save(); sfx.click(); renderScene(); renderNav(); }

  /* ---------- API dla treści gry (akcje specjalne) ---------- */
  const api = { $, $$, get st() { return st; }, save, beep, toneStart, toneStop, sfx, toast, openModal, closeModal, showDoc, foundDoc, addPenalty, renderScene, go, fmt, elapsedSec, remainingSec, level: () => LV(), pen, T };

  /* ---------- akcje hotspotów ---------- */
  function act(a) {
    sfx.click();
    const A = G.ACTIONS[a];
    if (!A) return;
    if (A.lock) { const L = G.LOCKS.find(l => l.id === A.lock); if (st.opened[L.id]) return afterOpen(L, true); return showLock(L.id); }
    if (A.go) { if (A.requires && !st.opened[A.requires]) return toast(A.lockedMsg || 'Zamknięte.', 3400); return go(A.go); }
    if (A.cards) return showCards();
    if (A.hints) return showHints();
    if (A.ending) return showEnding();
    if (A.docIf) { return st.docs.includes(A.docIf) ? showDoc(A.docIf, !!A.mirror) : toast(A.elseMsg || 'Nic tu nie ma.'); }
    if (A.doc) { if (A.requires && !st.opened[A.requires]) return toast(A.lockedMsg || 'Zamknięte.', 3400); if (A.requiresDoc && !st.docs.includes(A.requiresDoc)) return toast(A.elseMsg || 'Jeszcze nie.'); return foundDoc(A.doc, A.label); }
    if (A.custom) return G.custom[A.custom](api, A);
    if (A.toast) return toast(A.toast, A.ms || 3000);
  }
  function afterOpen(L, revisit) {
    const o = L.onOpen || {};
    if (o.doc) return showDoc(o.doc);
    if (o.go) return go(o.go);
    if (o.accuse) return st.accused ? showEnding() : showAccuse();
    if (o.finish) return showEnding();
    if (o.custom) return G.custom[o.custom](api, L);
    if (revisit) toast(L.found || 'Otwarte.');
  }
  function foundDoc(id, label) {
    if (!st.docs.includes(id)) { st.docs.push(id); save(); toast(`Znaleziono: <b>${label || G.DOCS[id].title}</b>`); renderNav(); renderScene(); }
    showDoc(id);
  }

  /* ---------- dokumenty ---------- */
  function showDoc(id, mirrorNow = false) {
    const d = G.DOCS[id]; if (!d) return;
    st.seen[id] = 1; save(); renderNav();
    openModal(`<div class="paper ${d.cls || ''}"><div class="docno">${d.sub || ''}</div><h2>${d.title}</h2>${T(d.html)}</div>`, 'doc');
    bindWidgets($('#modalBody'), mirrorNow);
  }
  function bindWidgets(body, mirrorNow) {
    // siatka: zaznaczanie ołówkiem ✓ / ✗
    const setMark = (td, v) => { if (!td.classList.contains('seat')) td.textContent = ['', '✓', '✗'][v]; td.classList.remove('m0', 'm1', 'm2'); td.classList.add('m' + v); };
    $$('.mark', body).forEach(td => {
      const k = td.dataset.cell; setMark(td, st.marks.grid[k] || 0);
      td.addEventListener('click', () => { st.marks.grid[k] = ((st.marks.grid[k] || 0) + 1) % 3; save(); setMark(td, st.marks.grid[k]); sfx.paper(); });
    });
    // plan: przekreślanie linii
    $$('[data-edge]', body).forEach(g => {
      const k = g.dataset.edge; const line = $('.c', g); if (st.marks.edges[k]) line.classList.add('x');
      g.addEventListener('click', () => { st.marks.edges[k] = !st.marks.edges[k]; save(); line.classList.toggle('x', st.marks.edges[k]); sfx.paper(); });
    });
    // przełączniki (np. zakreślanie wiersza tabeli)
    $$('[data-tog]', body).forEach(el => {
      const k = el.dataset.tog; el.classList.toggle('tog-on', !!st.marks.tog[k]);
      el.addEventListener('click', () => { st.marks.tog[k] = !st.marks.tog[k]; save(); el.classList.toggle('tog-on', st.marks.tog[k]); sfx.paper(); });
    });
    // lustro
    const mb = $('#mirrorBtn', body), mir = $('#mirror', body);
    if (mb && mir) {
      const setM = (on) => { mir.classList.toggle('flipped', on); mb.textContent = on ? '↩ Odłóż lustro' : '🪞 Przyłóż do lustra'; };
      setM(mirrorNow || st.mirror);
      mb.addEventListener('click', () => { st.mirror = !mir.classList.contains('flipped'); save(); setM(st.mirror); sfx.paper(); });
    }
    // notatnik
    const memo = $('textarea.memo', body);
    if (memo) { memo.value = st.memo || ''; memo.addEventListener('input', () => { st.memo = memo.value; save(); }); }
    // akcje specjalne wewnątrz dokumentów
    $$('[data-custom]', body).forEach(b => b.addEventListener('click', () => G.custom[b.dataset.custom](api, b.dataset)));
    $$('[data-doc]', body).forEach(b => b.addEventListener('click', () => showDoc(b.dataset.doc)));
  }
  function showDocs() {
    const order = G.DOC_ORDER || Object.keys(G.DOCS);
    const items = order.filter(id => st.docs.includes(id)).map(id => `<button class="row" data-doc="${id}">${st.seen[id] ? '' : '<span class="new">nowe</span>'}<b>${G.DOCS[id].title}</b><span>${G.DOCS[id].sub || ''}</span></button>`).join('');
    const notes = `<div class="paper"><div class="docno">${G.NOTES.title} · poziom ${LV().name}</div>
      <p class="small muted">${T(G.NOTES.intro)}</p>
      ${G.LOCKS.map(l => `<div class="lock ${st.opened[l.id] ? 'done' : ''}"><div><b>Zamek ${l.id} · ${l.name}</b><br><span class="chk">${l.cond}</span></div><div class="code">${st.codes[l.id] || ''}</div></div>`).join('')}
      <div class="docno" style="margin-top:14px">Dokumenty</div>
      ${items || `<p class="muted small">${G.NOTES.empty || 'Jeszcze nic nie znaleźliście. Dotykajcie świecących punktów.'}</p>`}
      <div class="docno" style="margin-top:14px">Wasze notatki</div>
      <textarea class="memo" rows="4" placeholder="Zapiski ekipy: godziny, imiona, liczby…"></textarea>
      </div>`;
    openModal(notes, 'doc');
    bindWidgets($('#modalBody'));
  }

  /* ---------- zamki ---------- */
  const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
  const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
  let input = '';
  function showLock(id) {
    const L = G.LOCKS.find(l => l.id === id); input = '';
    const kind = L.kind || 'digits';
    const head = `<div class="docno">Zamek ${L.id} · ${L.place}</div><h2>${L.name}</h2><p class="cond">${G.NOTES.short || 'Notes'}: <b>${L.cond}</b></p>`;
    const msg = `<div class="msg" id="lockMsg">${st.wrong[id] ? `Nieudane próby: ${st.wrong[id]}` : '&nbsp;'}</div>`;
    const tryBtn = `<button class="btn primary big" id="tryLock">${L.openLabel || 'Otwórz'}</button>`;

    if (kind === 'wheels') {
      // pokrętła jak w walizce: każda cyfra osobnym bębnem
      input = (st.wheelPos && st.wheelPos[id]) || '0'.repeat(L.len);
      openModal(`<div class="lockui wheelslock">${head}
        <div class="wheelset" id="wheelset">${Array.from({ length: L.len }, (_, i) => `<div class="wcol"><button data-w="${i}" data-d="1" aria-label="w górę">▲</button><div class="wdrum" data-i="${i}"><span></span><b></b><span></span></div><button data-w="${i}" data-d="-1" aria-label="w dół">▼</button></div>`).join('')}</div>
        <p class="small lockhelp">Kręćcie bębenkami, potem spróbujcie otworzyć.</p>
        ${msg}${tryBtn}</div>`, 'lockm');
      const draw = () => $$('.wdrum').forEach(d => { const i = +d.dataset.i, v = +input[i]; d.children[0].textContent = (v + 9) % 10; d.children[1].textContent = v; d.children[2].textContent = (v + 1) % 10; });
      draw();
      const spin = (i, dir) => { const v = (+input[i] + dir + 10) % 10; input = input.slice(0, i) + v + input.slice(i + 1); st.wheelPos = st.wheelPos || {}; st.wheelPos[id] = input; save(); sfx.tick(); draw(); };
      $$('[data-w]').forEach(b => b.addEventListener('click', () => spin(+b.dataset.w, +b.dataset.d)));
      // przeciąganie palcem po bębnie
      $$('.wdrum').forEach(d => { let y0 = null; d.addEventListener('pointerdown', e => { y0 = e.clientY; d.setPointerCapture(e.pointerId); }); d.addEventListener('pointermove', e => { if (y0 == null) return; const dy = e.clientY - y0; if (Math.abs(dy) > 22) { spin(+d.dataset.i, dy < 0 ? 1 : -1); y0 = e.clientY; } }); d.addEventListener('pointerup', () => { y0 = null; }); d.addEventListener('pointercancel', () => { y0 = null; }); });
      $('#tryLock').addEventListener('click', () => tryLock(L));
      return;
    }

    if (kind === 'morse') {
      // klucz telegraficzny: krótkie naciśnięcie = kropka, długie = kreska, pauza kończy literę
      const allowKeys = L.fallback !== false && !LV().strictFormat;
      openModal(`<div class="lockui morselock">${head}
        <div class="wheels" id="wheels">${Array.from({ length: L.len }, () => '<div class="wheel"><span>&nbsp;</span></div>').join('')}</div>
        <div class="mbuf" id="mbuf">&nbsp;</div>
        <div class="mrow"><button class="mkey" id="mkey">KLUCZ</button><div class="mside"><button class="btn ghost small" id="mbs">⌫ litera</button>${allowKeys ? '<button class="btn ghost small" id="mkb">klawiatura</button>' : ''}</div></div>
        <p class="small lockhelp">Krótko = kropka, długo = kreska. Puśćcie klucz na chwilę, a litera sama się wpisze.</p>
        ${msg}${tryBtn}</div>`, 'lockm');
      const wheels = $$('#wheels .wheel span'), buf = $('#mbuf'), key = $('#mkey');
      const draw = () => wheels.forEach((w, i) => { w.textContent = input[i] || ' '; w.parentElement.classList.toggle('filled', !!input[i]); });
      let sym = '', downAt = 0, timer = null;
      const flush = () => { if (!sym) return; const ch = MORSE_REV[sym] || '?'; if (ch !== '?' && input.length < L.len) input += ch; else if (ch === '?') { buf.textContent = sym.replace(/\./g, '·').replace(/-/g, '−') + ' = ?'; sfx.err(); sym = ''; draw(); setTimeout(() => { if (!sym) buf.innerHTML = '&nbsp;'; }, 900); return; } sym = ''; buf.innerHTML = '&nbsp;'; draw(); sfx.paper(); };
      const down = (e) => { e.preventDefault(); if (input.length >= L.len) return; clearTimeout(timer); downAt = performance.now(); key.classList.add('down'); toneStart(720, 'sine', .07); };
      const up = (e) => { if (!downAt) return; e.preventDefault(); const dur = performance.now() - downAt; downAt = 0; key.classList.remove('down'); toneStop(); sym += dur < 230 ? '.' : '-'; buf.textContent = sym.replace(/\./g, '·').replace(/-/g, '−'); clearTimeout(timer); timer = setTimeout(flush, 700); };
      key.addEventListener('pointerdown', down); key.addEventListener('pointerup', up); key.addEventListener('pointerleave', up); key.addEventListener('pointercancel', up);
      key.addEventListener('contextmenu', e => e.preventDefault());
      $('#mbs').addEventListener('click', () => { sym = ''; buf.innerHTML = '&nbsp;'; input = input.slice(0, -1); sfx.click(); draw(); });
      if (allowKeys) $('#mkb').addEventListener('click', () => { toneStop(); showLock.keypad(L); });
      $('#tryLock').addEventListener('click', () => tryLock(L));
      return;
    }
    showLock.keypad(L);
  }
  showLock.keypad = (L) => {
    const kind = L.kind === 'letters' || L.kind === 'morse' ? 'letters' : 'digits';
    const keys = (L.keys || (kind === 'digits' ? '1234567890' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')).split('');
    openModal(`<div class="lockui">
      <div class="docno">Zamek ${L.id} · ${L.place}</div><h2>${L.name}</h2>
      <p class="cond">${G.NOTES.short || 'Notes'}: <b>${L.cond}</b></p>
      <div class="wheels" id="wheels">${Array.from({ length: L.len }, () => '<div class="wheel"><span>&nbsp;</span></div>').join('')}</div>
      <div class="msg" id="lockMsg">${st.wrong[L.id] ? `Nieudane próby: ${st.wrong[L.id]}` : '&nbsp;'}</div>
      <div class="keys ${kind}">${keys.map(k => `<button data-k="${k}">${k}</button>`).join('')}<button data-k="⌫" class="bs">⌫</button></div>
      <button class="btn primary big" id="tryLock">${L.openLabel || 'Otwórz'}</button>
    </div>`, 'lockm');
    const wheels = $$('#wheels .wheel span');
    const draw = () => wheels.forEach((w, i) => { w.textContent = input[i] || ' '; w.parentElement.classList.toggle('filled', !!input[i]); });
    draw();
    $$('.keys button').forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; if (k === '⌫') input = input.slice(0, -1); else if (input.length < L.len) input += k; sfx.click(); draw(); }));
    $('#tryLock').addEventListener('click', () => tryLock(L));
  };
  function tryLock(L) {
    const ui = $('.lockui'), msg = $('#lockMsg');
    const isWheels = ui.classList.contains('wheelslock');
    const clearWheels = () => { if (isWheels) return; input = ''; $$('#wheels .wheel span').forEach(w => { w.textContent = ' '; w.parentElement.classList.remove('filled'); }); };
    const shake = () => { ui.classList.remove('shake'); void ui.offsetWidth; ui.classList.add('shake'); sfx.err(); };
    const P = pen(L.penalty);
    if (input.length < L.len) { msg.textContent = `Kod ma ${L.len} znaki.`; shake(); return; }
    if (!L.check(input)) {
      if (LV().strictFormat) { st.wrong[L.id] = (st.wrong[L.id] || 0) + 1; save(); addPenalty(P, 'zły kod'); msg.innerHTML = `Kod <b>${input}</b> nie pasuje nawet do warunku: <b>${L.cond}</b>. Na tym poziomie każdy zły kod kosztuje.`; }
      else msg.innerHTML = `Kod <b>${input}</b> nie pasuje do zamka. Warunek: <b>${L.cond}</b>. Bez kary.`;
      shake(); clearWheels(); return;
    }
    if (input !== L.answer) {
      st.wrong[L.id] = (st.wrong[L.id] || 0) + 1; if (L.locksmith) st.locksmith = true; save();
      addPenalty(P, L.penaltyWhy || 'zamek nie puścił');
      msg.innerHTML = L.failMsg || 'Zamek nie puścił. Kod pasował do warunku, ale był inny. Spróbujcie jeszcze raz.';
      shake(); clearWheels();
      return;
    }
    ui.classList.add('unlocked'); sfx.ok(); toneStop();
    st.opened[L.id] = true; st.codes[L.id] = input; save();
    setTimeout(() => {
      closeModal(); renderScene(); renderNav();
      const o = L.onOpen || {};
      if (o.doc) { if (!st.docs.includes(o.doc)) st.docs.push(o.doc); save(); renderNav(); toast(`<b>Otwarte.</b> ${L.found || ''}`, 3200); setTimeout(() => showDoc(o.doc), 900); }
      else if (o.go) { toast(`<b>Otwarte.</b> ${L.found || ''}`, 2600); setTimeout(() => go(o.go), 900); }
      else if (o.accuse) { toast(`<b>Otwarte.</b> ${L.found || ''}`, 2600); setTimeout(showAccuse, 1000); }
      else if (o.finish) { finish(); }
      else if (o.custom) { G.custom[o.custom](api, L); }
      else toast(`<b>Otwarte.</b> ${L.found || ''}`, 3000);
    }, 900);
  }

  /* ---------- akt oskarżenia (finał dedukcyjny) ---------- */
  function showAccuse() {
    const A = G.ACCUSE; if (!A) return finish();
    const fields = A.fields.map(f => `<h4>${f.label}</h4><div class="opts">${f.options.map(o => `<button class="opt ${st.accuse[f.id] === o ? 'on' : ''}" data-f="${f.id}" data-o="${o.replace(/"/g, '&quot;')}">${o}</button>`).join('')}</div>`).join('');
    openModal(`<div class="paper accuse"><div class="docno">${A.docno || 'Akt oskarżenia'}</div><h2>${A.h2 || 'Akt oskarżenia'}</h2>
      <p>${T(A.intro || '')}</p>${fields}
      <div class="msg2" id="accMsg">${st.accuseTries ? `Odrzucone akty: ${st.accuseTries}` : '&nbsp;'}</div>
      <button class="btn primary big" id="accSend">${A.send || 'Składamy akt oskarżenia'}</button></div>`, 'doc');
    $$('.opt').forEach(b => b.addEventListener('click', () => { st.accuse[b.dataset.f] = b.dataset.o; save(); sfx.click(); $$(`.opt[data-f="${b.dataset.f}"]`).forEach(x => x.classList.toggle('on', x === b)); }));
    $('#accSend').addEventListener('click', () => {
      const m = $('#accMsg');
      if (A.fields.some(f => !st.accuse[f.id])) { m.textContent = 'Zaznaczcie odpowiedź w każdym punkcie.'; sfx.err(); return; }
      const good = A.fields.filter(f => st.accuse[f.id] === f.answer).length;
      if (good === A.fields.length) { st.accused = true; save(); sfx.ok(); toast(`<b>${A.okMsg || 'Akt przyjęty.'}</b>`, 2600); setTimeout(finish, 900); return; }
      st.accuseTries++; save(); addPenalty(pen(A.penalty || 5), 'akt odrzucony'); sfx.err();
      m.innerHTML = (A.wrongMsg || 'Prokurator odrzuca akt: coś się nie zgadza z dowodami.') + (LV().strictFormat ? '' : ` <span class="muted">Zgadza się ${good} z ${A.fields.length} punktów.</span>`);
    });
  }

  /* ---------- podpowiedzi ---------- */
  function showHints() {
    const n = tokens(), cost = LV().hintCost;
    const list = G.LOCKS.filter(l => !st.opened[l.id]).map(l => {
      const used0 = st.hints[l.id + '-0'], used1 = st.hints[l.id + '-1'];
      const price = (lvl) => (lvl === 0 && LV().freeFirstHint) ? 'gratis' : n ? 'zapłać kartą' : `+${cost} min`;
      const btn = (lvl, used, enabled) => used ? `<div class="hint on">${G.HINTS[l.id][lvl]}</div>` : enabled ? `<button class="btn ghost" data-h="${l.id}-${lvl}">Odsłoń poziom ${lvl + 1} · ${price(lvl)}</button>` : `<div class="hint off">Poziom 2 po poziomie 1</div>`;
      return `<div class="hintlock"><b>Zamek ${l.id} · ${l.name}</b>${btn(0, used0, true)}${btn(1, used1, !!used0)}</div>`;
    }).join('');
    openModal(`<div class="paper"><div class="docno">${G.HINTS_TITLE || 'Podpowiedzi'} · poziom ${LV().name}</div><h2>Podpowiedzi</h2>
      <p class="small muted">Dwa poziomy dla każdego zamka. Podpowiedź kosztuje <b>+${cost} minut</b>, chyba że zapłacicie rozwiązaną kartą zagadki.${LV().freeFirstHint ? ' Na tym poziomie <b>pierwsza podpowiedź do każdego zamka jest za darmo</b>.' : ''} Macie kart do wykorzystania: <b>${n}</b>.</p>
      ${list || '<p>Wszystkie zamki otwarte.</p>'}</div>`, 'doc');
    $$('[data-h]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.h, free = k.endsWith('-0') && LV().freeFirstHint;
      if (free) toast('Pierwsza podpowiedź gratis.');
      else if (tokens()) { const c = Object.values(st.cards).find(c => c.solved && !c.spent); c.spent = true; toast('Zapłacone kartą zagadki.'); renderTokens(); }
      else { st.paidHints++; addPenalty(cost, 'podpowiedź'); }
      st.hints[k] = true; save(); showHints();
    }));
  }

  /* ---------- karty zagadek ---------- */
  function showCards() {
    const MAX = LV().cardTries;
    const rows = G.CARDS.map(c => {
      const s = st.cards[c.id] || { tries: 0 };
      let foot;
      if (s.solved) foot = `<div class="ok">✓ Rozwiązana${s.spent ? ' · wykorzystana na podpowiedź' : ' · warta jedną podpowiedź'}</div>`;
      else if (s.tries >= MAX) foot = `<div class="bad">Karta spalona (${MAX} błędne odpowiedzi).</div>`;
      else foot = `<div class="ans"><input type="text" inputmode="${c.mode || (c.hint === 'imię' || c.hint === 'słowo' ? 'text' : 'numeric')}" placeholder="${c.hint}" data-card="${c.id}"><button class="btn small" data-chk="${c.id}">Sprawdź</button></div><div class="small muted">${s.tries ? `Błędne próby: ${s.tries}/${MAX}` : (MAX === 3 ? 'Trzy próby.' : `${MAX} próby.`)}</div>`;
      return `<div class="card ${s.solved ? 'solved' : ''}"><h4>Karta ${c.id} · ${c.title}</h4><p>${c.q}</p>${foot}</div>`;
    }).join('');
    openModal(`<div class="paper"><div class="docno">${G.CARDS_TITLE || 'Karty zagadek'}</div><h2>Karty zagadek</h2><p class="small muted">Karty nie są potrzebne do otwarcia zamków; są walutą. Każda rozwiązana karta daje jedną darmową podpowiedź.</p><div class="cards">${rows}</div></div>`, 'doc');
    $$('[data-chk]').forEach(b => b.addEventListener('click', () => {
      const id = +b.dataset.chk, card = G.CARDS.find(c => c.id === id), inp = $(`[data-card="${id}"]`); const v = inp.value.trim(); if (!v) return;
      st.cards[id] = st.cards[id] || { tries: 0 };
      if (G.cardOk(card, v)) { st.cards[id].solved = true; sfx.ok(); toast('<b>Dobrze.</b> Karta warta jedną podpowiedź.'); }
      else { st.cards[id].tries++; sfx.err(); toast('Nie. ' + (MAX - st.cards[id].tries > 0 ? `Zostały próby: ${MAX - st.cards[id].tries}.` : 'Karta spalona.')); }
      save(); renderTokens(); showCards();
    }));
  }

  /* ---------- koniec ---------- */
  function finish() {
    if (!st.endAt) { st.endAt = now(); const r = remainingSec(); st.ended = r > 0 ? 'win' : 'late'; save(); }
    showEnding();
  }
  function showTimeOut() {
    const T0 = G.TIMEOUT;
    openModal(`<div class="paper dark"><div class="docno">${T0.docno}</div><h2>${T0.h2}</h2><p>${T0.text}</p>
      <button class="btn primary" id="keepPlaying">${T0.keep || 'Gramy dalej'}</button> <button class="btn ghost" id="giveUp">${T0.give || 'Poddajemy się'}</button></div>`);
    $('#keepPlaying').addEventListener('click', () => { closeModal(); toast('Gracie po czasie. Wynik nie będzie liczony.'); });
    $('#giveUp').addEventListener('click', () => { st.endAt = now(); st.ended = 'lose'; save(); showEnding(); });
  }
  function rating() {
    const used = elapsedSec() + st.penalty * 60, total = totalMin();
    const R = G.RATING_TEXT || {};
    const lose = R.lose || ['Przegrana', 'Spróbujcie z inną ekipą.'];
    if (st.ended === 'lose' || st.ended === 'late') return lose;
    if (typeof G.RATING === 'function') return G.RATING({ used, paidHints: st.paidHints, locksmith: st.locksmith, ended: st.ended, total, level: st.level });
    if (used <= (total - 25) * 60 && !st.paidHints && !st.locksmith) { const ace = R.ace || ['Detektywi', '']; return st.level === 'hard' ? [R.aceHardName || 'Komisarze', ace[1]] : ace; }
    if (used <= total * 60) return R.ok || ['Zdążyliście', ''];
    return lose;
  }
  function showEnding() {
    const E = G.END, win = st.ended === 'win', lose = st.ended === 'lose';
    const [r1, r2] = rating();
    const used = elapsedSec() + st.penalty * 60;
    const hintsUsed = Object.keys(st.hints).length;
    const transcript = lose ? `<p class="typew muted">${E.loseTranscript}</p>` : `<div id="typew" class="typew"></div>`;
    openModal(`<div class="paper dark end">
      <div class="docno">${lose ? E.loseDocno : E.docno}</div>
      <h2>${lose ? E.loseH2 : E.h2}</h2>
      ${transcript}
      <div class="box"><h3>Zakończenie</h3><p>${win ? E.win : E.lose}</p></div>
      <table class="score"><tr><th>Poziom</th><td>${LV().name} · ${totalMin()} min</td></tr><tr><th>Czas gry</th><td>${fmt(elapsedSec())}</td></tr><tr><th>Kary</th><td>+${st.penalty} min</td></tr><tr><th>Wynik</th><td><b>${fmt(used)}</b></td></tr><tr><th>Podpowiedzi</th><td>${hintsUsed} (za czas: ${st.paidHints})</td></tr>${G.ACCUSE ? `<tr><th>Akt oskarżenia</th><td>${st.accuseTries ? `przyjęty za ${st.accuseTries + 1}. razem` : 'przyjęty od razu'}</td></tr>` : ''}${st.locksmith && E.locksmithRow ? `<tr><th>${E.locksmithRow[0]}</th><td>${E.locksmithRow[1]}</td></tr>` : ''}</table>
      <div class="verdict"><b>${r1}.</b> ${r2}</div>
      <div class="row2"><button class="btn ghost" id="showSol">Rozwiązania</button><button class="btn primary" id="restart">Zagraj od nowa</button></div>
      <p class="small muted" style="margin-top:12px;text-align:center"><a href="./" class="lnk">Inne gry Teczki Śledczej →</a></p>
    </div>`, 'doc');
    $('#showSol').addEventListener('click', showSolutions);
    $('#restart').addEventListener('click', () => { if (confirm('Zacząć od nowa? Postęp zostanie skasowany.')) { const lvl = st.level; st = fresh(); st.level = lvl; save(); closeModal(); render(); } });
    const tw = $('#typew');
    if (tw) typewrite(tw, G.TRANSCRIPT);
  }
  function typewrite(el, paras) {
    let p = 0, i = 0; const ps = paras.map(() => { const e = document.createElement('p'); el.appendChild(e); return e; });
    const step = () => { if (p >= paras.length) return; const txt = paras[p]; ps[p].textContent = txt.slice(0, ++i); if (i % 3 === 0) beep(1200 + Math.random() * 200, .01, 'square', .008); if (i >= txt.length) { p++; i = 0; setTimeout(step, 500); } else setTimeout(step, 14); };
    step();
    el.addEventListener('click', () => { ps.forEach((e, k) => e.textContent = paras[k]); p = paras.length; }, { once: true });
  }
  function showSolutions() {
    const acc = G.ACCUSE ? `<p><b>Akt oskarżenia.</b> ${G.ACCUSE.fields.map(f => `${f.label} ${f.answer}`).join(' · ')}</p>` : '';
    openModal(`<div class="paper"><div class="docno">Dla prowadzącego lub po grze</div><h2>Rozwiązania</h2>
      <table>${G.SOLUTIONS.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td class="mono">${b}</td></tr><tr><td colspan="2" class="small">${c}</td></tr>`).join('')}</table>
      ${G.SOLUTIONS_NOTE || ''}${acc}
      <p><b>Karty zagadek.</b> ${G.CARDS.map(c => `${c.id}: ${c.answerText || c.ok[0]}`).join('. ')}.</p>
      <button class="btn ghost" id="backEnd">← Wróć</button></div>`, 'doc');
    $('#backEnd').addEventListener('click', showEnding);
  }

  /* ---------- start ---------- */
  buildStatic();
  $('#btnNew').addEventListener('click', () => { if (st.startAt && !confirm('Jest zapisana gra. Zacząć od nowa?')) return; const lvl = st.level; st = fresh(); st.level = lvl; st.phase = 'brief'; save(); render(); });
  $('#btnContinue').addEventListener('click', () => { st.phase = st.startAt ? 'play' : 'brief'; save(); render(); });
  $('#btnEnter').addEventListener('click', () => { st.phase = 'play'; st.startAt = st.startAt || now(); save(); render(); setTimeout(() => toast(G.START_TOAST || 'Rozejrzyjcie się. Dotykajcie świecących punktów. Timer już leci.', 3600), 400); });
  $('#timerTop').addEventListener('click', () => { if (st.phase === 'play' && confirm('Wrócić do ekranu tytułowego? Timer leci dalej.')) { st.phase = 'title'; save(); render(); } });

  /* ---------- PWA ---------- */
  let deferred; window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; $('#btnInstall').style.display = ''; });
  $('#btnInstall').addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#btnInstall').style.display = 'none'; });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});

  render();
})();
