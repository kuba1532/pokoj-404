/* Teczka Śledcza · ładowanie gier za bramką dostępu.
   Klucz z przepustki (wpisany albo z linku #k=…) odblokowuje klucze treści z games/keys.json (PBKDF2 + AES-GCM),
   które zostają w pamięci telefonu. Gra przychodzi jako zaszyfrowana paczka games/<id>/pack.json i odszyfrowuje się tutaj.
   Bez klucza: ekran „sprawa zamknięta” z demo (jeśli gra je ma) i linkiem do sklepu. */
(() => {
  const $ = (q, el = document) => el.querySelector(q);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const STORE = 'esc.keys.v1';
  const te = new TextEncoder(), td = new TextDecoder();
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const norm = (p) => String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const SHOP = window.SHOP || { url: '', items: {} };
  let mem = null;

  function stored() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(STORE)); } catch (e) { /* tryb prywatny */ }
    return (mem = mem && mem.games ? mem : { games: {}, products: [] });
  }
  function store(s) { mem = s; try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) { /* klucz zostaje tylko do zamknięcia karty */ } }
  const canCrypt = () => !!(window.crypto && crypto.subtle);

  /* klucz z przepustki → klucze treści gier; zwraca { p: produkt, t: tytuł, g: { gra: klucz } } albo null */
  async function redeem(pass) {
    const p = norm(pass);
    if (p.length < 12) return null;
    if (!canCrypt()) throw new Error('crypto');
    const K = await (await fetch('games/keys.json')).json();
    const base = await crypto.subtle.importKey('raw', te.encode(p), 'PBKDF2', false, ['deriveKey']);
    const kek = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(K.salt), iterations: K.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    for (const e of K.entries) {
      let r = null;
      try { r = JSON.parse(td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(e.iv) }, kek, unb64(e.ct)))); } catch (er) { continue; }
      const s = stored(); Object.assign(s.games, r.g); if (!s.products.includes(r.p)) s.products.push(r.p); store(s);
      return r;
    }
    return null;
  }
  async function decryptGame(id) {
    const k = stored().games[id]; if (!k) return null;
    const P = await (await fetch(`games/${id}/pack.json`)).json();
    const key = await crypto.subtle.importKey('raw', unb64(k), 'AES-GCM', false, ['decrypt']);
    return td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(P.iv) }, key, unb64(P.ct)));
  }
  const has = (id) => !!stored().games[id];
  const titleOf = (id) => ((window.GAMES || []).find((g) => g.id === id) || {}).title || id;

  /* co kupić, żeby dostać grę: sama gra i najtańszy pakiet, który ją zawiera */
  function offers(gameId) {
    const items = Object.entries(SHOP.items || {});
    const single = items.find(([, it]) => it.games.length === 1 && it.games[0] === gameId);
    const pack = items.filter(([, it]) => it.games.length > 1 && it.games.includes(gameId)).sort((a, b) => a[1].cena - b[1].cena)[0];
    return [single, pack].filter(Boolean).map(([, it]) => it);
  }
  function buyHtml(gameId) {
    const list = offers(gameId);
    if (!SHOP.url) return `<p class="small muted">Sprzedaż pełnych wersji rusza wkrótce. Po zakupie dostaniesz e-mailem przepustkę z kluczem.</p>`;
    return list.map((it, i) => `<a class="btn ${i ? 'ghost' : 'primary'} big" href="${esc(SHOP.url + '/' + it.path)}">${i ? esc(it.tytul) + ' · ' + it.cena + ' zł' : 'Kup pełną wersję · ' + it.cena + ' zł'}</a>`).join('');
  }
  /* okno „to jest w pełnej wersji” dla demo */
  function paywall(msg, gameId, end) {
    return `<div class="paper gate-pay"><div class="docno">${end ? 'Koniec wersji demo' : 'Wersja demo'}</div>
      <h2>${end ? 'Na tym demo się kończy' : 'Zamknięte w wersji demo'}</h2><p>${msg}</p>
      <div class="gate-btns">${buyHtml(gameId)}<a class="btn ghost big" href="./?g=${esc(gameId)}">Mam klucz z przepustki</a></div>
      <p class="small muted">Pełna gra zaczyna się od nowa, ale kod do walizki już znacie.</p></div>`;
  }

  /* formularz klucza (hub i ekran „sprawa zamknięta”) */
  function keyForm(onOk, wanted) {
    const f = document.createElement('form');
    f.className = 'keyform';
    f.innerHTML = `<label for="kf-${wanted || 'hub'}">Klucz z przepustki</label>
      <div class="kf-row"><input id="kf-${wanted || 'hub'}" name="k" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX" inputmode="text" maxlength="24" required>
      <button class="btn primary" type="submit">Otwórz</button></div><p class="kf-msg" role="status"></p>`;
    const input = $('input', f), msg = $('.kf-msg', f), btn = $('button', f);
    input.addEventListener('input', () => {
      const raw = norm(input.value).slice(0, 16), grouped = raw.match(/.{1,4}/g);
      input.value = grouped ? grouped.join('-') : '';
    });
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); btn.disabled = true; msg.className = 'kf-msg'; msg.textContent = 'Sprawdzam klucz…';
      try {
        const r = await redeem(input.value);
        if (!r) { msg.className = 'kf-msg bad'; msg.textContent = 'Ten klucz nie pasuje. Sprawdź, czy przepisałeś go dokładnie z przepustki.'; }
        else if (wanted && !r.g[wanted]) { msg.className = 'kf-msg bad'; msg.textContent = `Klucz działa, ale otwiera: ${Object.keys(r.g).map(titleOf).join(', ')}. Ta sprawa wymaga innej przepustki.`; }
        else { msg.className = 'kf-msg ok'; msg.textContent = 'Otwarte: ' + Object.keys(r.g).map(titleOf).join(', ') + '.'; onOk(r); }
      } catch (er) {
        msg.className = 'kf-msg bad';
        msg.textContent = er && er.message === 'crypto' ? 'Ta przeglądarka nie obsługuje szyfrowania. Otwórz grę w Safari albo Chrome.' : 'Nie udało się sprawdzić klucza. Sprawdź internet i spróbuj jeszcze raz.';
      }
      btn.disabled = false;
    });
    return f;
  }

  window.TS = { redeem, has, stored, norm, paywall, keyForm, offers, buyHtml, titleOf };

  /* ---------- router ---------- */
  const q = new URLSearchParams(location.search), gid = q.get('g');
  const M = (window.GAMES || []).find((x) => x.id === gid);
  const addScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load ' + src)); document.body.appendChild(s); });
  const addCode = (code) => { const s = document.createElement('script'); s.textContent = code; document.body.appendChild(s); };

  function gate(G) {
    const el = $('#gate'); el.classList.add('on');
    document.body.classList.add('theme-' + (G.theme || 'neon'));
    document.title = G.title + ' · Teczka Śledcza';
    el.innerHTML = `<a class="back" href="./">← Wszystkie gry</a><div class="gate-in">
      <div class="eyebrow">${esc(G.no)} · ${esc(G.eyebrow)}</div><h1>${esc(G.title)}</h1><p class="sub">${esc(G.sub)}</p>
      <div class="paper gate-paper"><span class="gate-stamp">Sprawa zamknięta</span>
        <p>Pełną grę otwiera klucz z przepustki, którą dostajesz e-mailem po zakupie. Wystarczy wpisać go raz na tym telefonie.</p>
        <div id="gateForm"></div>
        ${G.demo ? `<a class="btn primary big" href="./?g=${esc(G.id)}&amp;demo=1">Zagraj w demo: pierwszy zamek za darmo</a>` : ''}
        <div class="gate-btns">${buyHtml(G.id).replace(/btn primary/g, G.demo ? 'btn ghost' : 'btn primary')}</div>
      </div></div>`;
    $('#gateForm').appendChild(keyForm(() => setTimeout(() => location.reload(), 700), G.id));
  }
  function fail(e) {
    const el = $('#gate'); el.classList.add('on');
    el.innerHTML = `<a class="back" href="./">← Wszystkie gry</a><div class="gate-in"><h1>Nie udało się otworzyć gry</h1>
      <p class="sub">${navigator.onLine === false ? 'Brak internetu, a gra nie zdążyła się jeszcze zapisać w telefonie. Połącz się raz i spróbuj ponownie.' : 'Spróbuj odświeżyć stronę. Jeśli to nie pomoże, wpisz klucz z przepustki jeszcze raz.'}</p>
      <p><a class="btn primary" href="">Odśwież</a></p></div>`;
    console.error(e);
  }

  async function start() {
    /* link z przepustki: …/#k=XXXX-XXXX-XXXX-XXXX */
    const m = location.hash.match(/k=([A-Za-z0-9-]+)/);
    if (m) {
      history.replaceState(null, '', location.pathname + location.search);
      try { window.TS_FLASH = { result: await redeem(m[1]) }; } catch (e) { window.TS_FLASH = { error: true }; }
    }
    if (!M) return addScript('engine/hub.js');
    const dev = q.has('src') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    try {
      if (dev) { await addScript(`../../gry/${gid}/content.js`); await addScript(`../../gry/${gid}/scenes.js`); }
      else if (q.has('demo') && M.demo) await addScript(`games/${gid}/demo.js`);
      else if (!M.locked) { await addScript(`games/${gid}/content.js`); await addScript(`games/${gid}/scenes.js`); }
      else if (has(gid) && canCrypt()) addCode(await decryptGame(gid));
      else return gate(M);
      await addScript('engine/engine.js');
    } catch (e) { fail(e); }
  }
  start();
})();
