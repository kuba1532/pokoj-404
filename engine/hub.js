/* Teczka Śledcza · hub: lista gier, stan zapisów i kluczy, wpisanie klucza z przepustki, instalacja PWA */
(() => {
  const $ = (q, el = document) => el.querySelector(q);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  $('#hub').classList.add('on');
  document.title = 'Teczka Śledcza · escape roomy';
  const LV = window.LEVELS || {};
  const TS = window.TS || { has: () => true, titleOf: (x) => x };
  const fmt = (s) => { const neg = s < 0; s = Math.abs(s); return (neg ? '−' : '') + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const saved = (g) => { try { return JSON.parse(localStorage.getItem(`esc.${g.id}.v1`) || (g.legacyKey ? localStorage.getItem(g.legacyKey) : null)); } catch { return null; } };
  const open = (g) => !g.locked || TS.has(g.id);
  const status = (g) => {
    if (!open(g)) return `<span class="st lock">zamknięta</span>`;
    const s = saved(g); if (!s || !s.startAt) return g.locked ? `<span class="st done">odblokowana</span>` : '';
    const L = LV[s.level] || LV.normal || { name: '', time: 0 };
    if (s.ended) return `<span class="st done">${s.ended === 'win' ? 'ukończona' : 'zakończona'}${L.name ? ' · ' + L.name : ''}</span>`;
    const rem = (g.minutes + (L.time || 0)) * 60 - Math.floor((Date.now() - s.startAt) / 1000) - (s.penalty || 0) * 60;
    return rem > 0 ? `<span class="st live">w trakcie · ${fmt(rem)}</span>` : `<span class="st live">po czasie</span>`;
  };
  const art = {
    neon: '<div class="mini neon"><span>HOTEL</span><b>404</b></div>',
    snow: '<div class="mini snow"><span>ODRA</span><b>7</b></div>',
    beam: '<div class="mini beam"><span>KINO</span><b>TĘCZA</b></div>',
  };
  const stars = (d) => `<span class="stars" title="trudność ${d}/5">${'★'.repeat(d)}<i>${'★'.repeat(5 - d)}</i></span>`;

  function render() {
    $('#gameList').innerHTML = window.GAMES.map(g => `
      <a class="game theme-${g.theme} ${open(g) ? '' : 'is-locked'}" href="./?g=${g.id}">
        <div class="art">${art[g.theme] || ''}</div>
        <div class="info">
          <div class="eyebrow">${g.no} · ${g.eyebrow}</div>
          <h2>${g.title} ${status(g)}${g.start && !saved(g) && open(g) ? '<span class="st start">zacznijcie tutaj</span>' : ''}</h2>
          <p>${g.sub}</p>
          <div class="fmt"><b>${g.format || ''}</b> ${g.mech || ''}</div>
          <div class="meta">${stars(g.difficulty)} · ⏱ ${g.minutes} min · 👥 ${g.players}${!open(g) && g.demo ? ' · <b class="demo-tag">darmowe demo</b>' : ''}</div>
        </div>
      </a>`).join('');
    const locked = window.GAMES.filter((g) => !open(g));
    const demo = locked.find((g) => g.demo);
    const box = $('#hubKey');
    if (!box) return;
    if (!locked.length) { box.innerHTML = '<p class="small muted">Wszystkie gry na tym telefonie są odblokowane.</p>'; return; }
    box.innerHTML = `<div class="eyebrow">Masz przepustkę?</div><p class="small">Wpisz klucz z przepustki PDF albo otwórz link, który w niej jest. Wystarczy raz na tym telefonie.</p><div id="hubKeyForm"></div>
      ${demo ? `<p class="small">Nie masz jeszcze klucza? <a href="./?g=${demo.id}&amp;demo=1">Zagraj w darmowe demo „${esc(demo.title)}” →</a></p>` : ''}`;
    if (TS.keyForm) $('#hubKeyForm').appendChild(TS.keyForm(() => setTimeout(render, 900)));
  }
  render();

  /* wynik linku z przepustki (#k=…) */
  const F = window.TS_FLASH, fl = $('#hubFlash');
  if (F && fl) {
    const r = F.result;
    fl.innerHTML = r ? `<div class="flash ok"><b>Przepustka przyjęta.</b> Otwarte: ${Object.keys(r.g).map((g) => esc(TS.titleOf(g))).join(', ')}. Dobrej zabawy.</div>`
      : `<div class="flash bad"><b>Link z przepustki nie zadziałał.</b> ${F.error ? 'Sprawdź internet i otwórz go jeszcze raz.' : 'Wpisz klucz ręcznie poniżej.'}</div>`;
  }

  const lv = $('#hubLevels');
  if (lv && LV.normal) lv.innerHTML = Object.values(LV).map(L => `<div class="hl ${L.id}"><b>${L.name}</b><span>${L.tag} · ${L.time > 0 ? '+' : ''}${L.time || '±0'} min</span></div>`).join('');
  let deferred; window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; $('#hubInstall').style.display = ''; });
  $('#hubInstall').addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#hubInstall').style.display = 'none'; });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
