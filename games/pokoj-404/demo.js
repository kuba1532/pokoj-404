/* Teczka Śledcza · POKÓJ 404: wersja demo (generuje gry/build.js, nie edytować) */
window.GAME = (() => {
  const letterSum = (s) => [...s.toUpperCase()].reduce((a, c) => a + (c.charCodeAt(0) - 64), 0);
  const digitSum = (s) => [...s].reduce((a, c) => a + +c, 0);
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9+-]/g, '');
  const cardOk = (card, ans) => card.ok.includes(norm(ans));
  return {"id": "pokoj-404-demo", "legacyKey": "pokoj404.v1", "TOTAL_MIN": 60, "TITLE": {"art": "<div class=\"neon-sign\"><span>HOTEL</span><span class=\"small\">CENTRALNY</span></div><div class=\"roomno\">404</div>", "eyebrow": "Teczka Śledcza · escape room 01", "h1": "POKÓJ 404", "sub": "Hotel „Centralny”, Łódź. Zimna sprawa z 1998 roku.<br>Pięć zamków. {MIN} minut. Jedno nagranie.", "fine": "2–6 graczy przy jednym telefonie · trudność 3/5 · klasyczny escape room · wiek 14+<br>Wszystkie osoby i zdarzenia są fikcyjne.<br><b>Wersja demo:</b> pierwsza scena i pierwszy zamek za darmo."}, "BRIEF": {"docno": "Odprawa · przed wejściem", "h2": "Czwarte piętro, koniec korytarza", "text": "Karolina Wenta, autorka podcastu o zimnych sprawach, zameldowała się w pokoju 404 hotelu „Centralny” w Łodzi, żeby zamknąć śledztwo w sprawie zaginięcia recepcjonistki Ewy Lis z czerwca 1998 roku. Od wczoraj nie odbiera telefonu. Jesteście jej ekipą. Recepcja dała wam klucz, bo o 12:00 pokój ma być sprzątnięty.", "enter": "Wchodzimy", "rules": ["<b>Timer</b> rusza, gdy wejdziecie. Macie {MIN} minut realnego czasu.", "<b>Zamki</b> mają warunki w notesie Karoliny. Zły kod, który pasuje do warunku: <b>+{PEN} min</b> (sejf +{PEN2}).", "<b>Podpowiedzi</b> kosztują +{HINT} min, chyba że zapłacicie rozwiązaną <b>kartą zagadki</b>.", "Dotykajcie <b>świecących punktów</b>. Wszystko, co znajdziecie, ląduje w zakładce „Teczka”.", "Przyda się kartka i ołówek. Na grafiku i planie możecie też zaznaczać palcem."]}, "START_TOAST": "Rozejrzyjcie się. Dotykajcie świecących punktów. Timer już leci.", "START_SCENE": "room", "SCENES": [{"id": "room", "label": "Pokój", "icon": "🚪", "name": "Pokój 404", "requires": undefined}], "ACTIONS": {"letter": {"doc": "list", "label": "List Karoliny"}, "cards": {"custom": "paywall", "label": ""}, "nokia": {"doc": "nokia", "label": "Karteczka z walizki i stara Nokia"}, "lock1": {"lock": 1}, "lock4": {"custom": "paywall", "label": ""}, "lock5": {"custom": "paywall", "label": ""}, "goBasement": {"custom": "paywall", "label": ""}}, "LOCKS": [{"id": 1, "key": "walizka", "name": "Walizka Karoliny", "place": "pokój 404", "kind": "digits", "len": 3, "cond": "3 cyfry · suma cyfr 10", "check": (c) => /^\d{3}$/.test(c) && digitSum(c) === 10, "answer": "334", "penalty": 5, "onOpen": {"custom": "demoEnd"}, "found": "Grafik nocny z 1998 i dorobiony klucz do piwnicy."}], "HINTS": {"1": ["Na Nokii 3310 literę pisało się kilkoma naciśnięciami jednego klawisza: A raz, B dwa razy, C trzy. Karolina nie zapisała numerów klawiszy.", "L to trzecia litera na klawiszu 5 → 3. I to trzecia na 4 → 3. S to czwarta na 7 → 4. Kod 334."]}, "CARDS": [], "cardOk": () => false, "DOCS": {"list": {"title": "List Karoliny", "sub": "na biurku, pod laptopem", "html": "<p class=\"hand\">Jeśli to czytacie, nie odebrałam telefonu. Wiem, kto zabrał Ewę Lis w czerwcu 1998. Dowód jest w sejfie, nagranie z wczoraj. Kodu nie zapisałam nigdzie wprost, bo ktoś z hotelu był w tym pokoju, kiedy mnie nie było: walizka przestawiona, laptop otwarty. Zostawiłam wam drogę. Pięć zamków, każdy prowadzi do następnego, a to, co znajdziecie po drodze, przyda się jeszcze raz. Zacznijcie od walizki. Nie pytajcie recepcji o nic. O 12:00 przychodzi „sprzątanie”.<br><br>— K.</p>"}, "nokia": {"title": "Walizka · karteczka", "sub": "przyklejona do walizki", "html": "\n      <p class=\"hand\">Walizka: JEJ nazwisko, wystukane jak SMS na mojej starej Nokii. Jedna cyfra na literę. Tak zapisywałam wszystkie kody w 2004 i nikt nigdy nie zgadł, bo każdy patrzył tylko na numery klawiszy.</p>\n      <p class=\"small muted\">W kieszeni walizki stary telefon z klawiaturą. Ekran nie działa, klawisze tak. Napis na obudowie: Nokia 3310.</p>\n      <div class=\"keypad\"><div><b>1</b><span>&nbsp;</span></div><div><b>2</b><span>ABC</span></div><div><b>3</b><span>DEF</span></div><div><b>4</b><span>GHI</span></div><div><b>5</b><span>JKL</span></div><div><b>6</b><span>MNO</span></div><div><b>7</b><span>PQRS</span></div><div><b>8</b><span>TUV</span></div><div><b>9</b><span>WXYZ</span></div><div><b>*</b><span>&nbsp;</span></div><div><b>0</b><span>␣</span></div><div><b>#</b><span>&nbsp;</span></div></div>"}}, "DOC_ORDER": ["list", "nokia"], "NOTES": {"title": "Notes zamków Karoliny", "short": "Notes", "intro": "Każdy zamek ma warunek. Warunek mówi, czy wasz kod w ogóle pasuje do zamka; nie mówi, czy jest właściwy. Zły kod, który pasuje do warunku: +{PEN} minut (sejf: +{PEN2}).", "empty": "Jeszcze nic nie znaleźliście. Dotykajcie świecących punktów w pokoju."}, "HINTS_TITLE": "Koperta P · podpowiedzi", "CARDS_TITLE": "Na stole · karty zagadek", "TIMEOUT": {"docno": "12:00", "h2": "Czas minął", "text": "Ktoś puka. „Sprzątanie.” Możecie oddać pokój albo grać dalej na własną odpowiedzialność: wynik nie będzie się liczył, ale sejf nadal czeka.", "keep": "Gramy dalej", "give": "Oddajemy pokój"}, "END": {"docno": "Demo", "h2": "Koniec wersji demo", "loseDocno": "Demo", "loseH2": "Koniec wersji demo", "loseTranscript": "", "win": ""}, "RATING_TEXT": {"lose": ["Nagranie przepadło", "Spróbujcie z inną ekipą."], "ace": ["Detektywi", "Następna: „Przedział 7”."], "ok": ["Zdążyliście", "Rój siedzi."]}, "TRANSCRIPT": "", "SOLUTIONS": [], "SOLUTIONS_NOTE": "", "custom": { paywall: (api, A) => api.openModal(window.TS.paywall(A && A.label ? A.label + ': ta część sprawy jest w pełnej wersji.' : 'Ta część sprawy jest w pełnej wersji.', "pokoj-404"), 'doc'),
    demoEnd: (api, L) => api.openModal(window.TS.paywall('<b>Walizka otwarta.</b> ' + (L.found || '') + ' Dalej czekają kolejne lokacje, zamki i nagranie, które wyjaśnia wszystko.', "pokoj-404", true), 'doc') }, "theme": "neon", "DEMO": true};
})();
/* Pokój 404 · sceny SVG (wektorowe ilustracje w stylu noir) */
window.GAME.scenes = (() => {
  const hs = (id, x, y, r, label) => `<g class="hs" data-act="${id}" transform="translate(${x} ${y})"><circle class="ring" r="${r}"/><circle class="dot" r="${Math.max(6, r * .35)}"/><title>${label}</title></g>`;

  const defs = `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2822"/><stop offset="1" stop-color="#17150f"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2e21"/><stop offset="1" stop-color="#201911"/></linearGradient>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a2b"/><stop offset="1" stop-color="#15304a"/></linearGradient>
    <radialGradient id="lamp"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset=".5" stop-color="#f0a64a" stop-opacity=".25"/><stop offset="1" stop-color="#f0a64a" stop-opacity="0"/></radialGradient>
    <radialGradient id="neonglow"><stop offset="0" stop-color="#5ff2e6" stop-opacity=".55"/><stop offset="1" stop-color="#5ff2e6" stop-opacity="0"/></radialGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d6168"/><stop offset=".5" stop-color="#8a8f97"/><stop offset="1" stop-color="#4b4f55"/></linearGradient>
    <linearGradient id="metal2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d7178"/><stop offset="1" stop-color="#3b3e44"/></linearGradient>
    <linearGradient id="corrfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2f2c"/><stop offset="1" stop-color="#141513"/></linearGradient>
    <linearGradient id="corrwall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f332f"/><stop offset="1" stop-color="#1b1e1b"/></linearGradient>
    <linearGradient id="corrwallR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#2f332f"/><stop offset="1" stop-color="#1b1e1b"/></linearGradient>
    <radialGradient id="fluo"><stop offset="0" stop-color="#e8fff2" stop-opacity=".5"/><stop offset="1" stop-color="#e8fff2" stop-opacity="0"/></radialGradient>
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4a4c"/><stop offset="1" stop-color="#1e2627"/></linearGradient>
    <linearGradient id="sheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8e2d4"/><stop offset="1" stop-color="#a39c8c"/></linearGradient>
    <pattern id="planks" width="390" height="26" patternUnits="userSpaceOnUse"><rect width="390" height="26" fill="none"/><line x1="0" y1="25" x2="390" y2="25" stroke="#0e0b07" stroke-opacity=".6"/></pattern>
    <filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>`;

  /* ---------------- POKÓJ 404 ---------------- */
  const room = (s) => `
  <svg viewBox="0 0 390 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="scene-svg">${defs}
    <rect width="390" height="700" fill="url(#wall)"/>
    <!-- tapeta: pasy -->
    ${Array.from({length: 13}, (_, i) => `<rect x="${i * 30}" y="0" width="14" height="380" fill="#000" opacity=".06"/>`).join('')}
    <rect x="0" y="380" width="390" height="320" fill="url(#floor)"/>
    <rect x="0" y="380" width="390" height="320" fill="url(#planks)"/>
    <rect x="0" y="372" width="390" height="10" fill="#120f0a"/>
    <!-- dywan -->
    <ellipse cx="200" cy="560" rx="160" ry="56" fill="#4a2a2a" opacity=".8"/>
    <ellipse cx="200" cy="560" rx="128" ry="40" fill="none" stroke="#7a4a3a" stroke-width="2" opacity=".6"/>

    <!-- okno z neonem -->
    <g>
      <rect x="236" y="52" width="134" height="200" fill="#0a0906"/>
      <rect x="244" y="60" width="118" height="184" fill="url(#night)"/>
      <!-- kamienica za oknem -->
      <rect x="250" y="120" width="106" height="124" fill="#0d1622"/>
      ${[[262,135],[292,135],[322,135],[262,170],[322,170],[292,205]].map(([x,y]) => `<rect x="${x}" y="${y}" width="14" height="18" fill="#f3d58a" opacity="${.15 + Math.random() * .35}"/>`).join('')}
      <!-- neon -->
      <circle cx="303" cy="96" r="60" fill="url(#neonglow)" class="neon"/>
      <text x="303" y="104" text-anchor="middle" font-family="Helvetica, Arial" font-weight="700" font-size="26" letter-spacing="4" fill="#7ffaf0" class="neon neon-txt">HOTEL</text>
      <rect x="300" y="60" width="4" height="184" fill="#1a140c"/>
      <rect x="244" y="150" width="118" height="4" fill="#1a140c"/>
      <!-- deszcz -->
      <g class="rain" opacity=".35">${Array.from({length: 14}, (_, i) => `<line x1="${248 + i * 8}" y1="${62 + (i % 3) * 40}" x2="${246 + i * 8}" y2="${80 + (i % 3) * 40}" stroke="#bfe9ff" stroke-width="1"/>`).join('')}</g>
      <!-- zasłony -->
      <path d="M226 44 q14 100 0 216 h22 q-12 -108 4 -216z" fill="#4a1f1c"/>
      <path d="M380 44 q-14 100 0 216 h-22 q12 -108 -4 -216z" fill="#4a1f1c"/>
      <rect x="222" y="40" width="162" height="8" fill="#2a1a12"/>
    </g>

    <!-- szafa z sejfem -->
    <g>
      <rect x="8" y="80" width="112" height="300" fill="#2a1d14"/>
      <rect x="14" y="86" width="100" height="288" fill="#3b2a1d"/>
      <rect x="14" y="86" width="50" height="288" fill="#33241a"/>
      <!-- lewe drzwi uchylone -->
      <path d="M14 86 l48 14 v262 l-48 12z" fill="#4a3625"/>
      <circle cx="56" cy="236" r="3" fill="#c9a24a"/>
      <!-- wnętrze z sejfem -->
      <rect x="66" y="92" width="46" height="282" fill="#120d08"/>
      <g id="safe" class="${s.opened[5] ? 'open' : ''}">
        <rect x="70" y="250" width="40" height="40" rx="3" fill="url(#metal2)" stroke="#111" stroke-width="1.5"/>
        <circle cx="90" cy="270" r="8" fill="#2a2d31" stroke="#9aa0a8" stroke-width="2"/>
        <rect x="88.5" y="263" width="3" height="7" fill="#d8dde3"/>
        ${s.opened[5] ? '<rect x="70" y="250" width="40" height="40" rx="3" fill="#1b140b"/><rect x="78" y="262" width="24" height="16" rx="2" fill="#d9d2c0"/><rect x="82" y="266" width="16" height="3" fill="#333"/>' : ''}
      </g>
      <!-- wieszaki -->
      ${[76, 88, 100].map(x => `<path d="M${x} 100 v8 q-6 6 0 12 q6 -6 0 -12" stroke="#8a7a60" fill="none"/>`).join('')}
    </g>

    <!-- półka z teczką -->
    <g>
      <rect x="130" y="128" width="90" height="6" fill="#2a1d14"/>
      <rect x="134" y="134" width="6" height="10" fill="#1a120b"/><rect x="210" y="134" width="6" height="10" fill="#1a120b"/>
      <g id="folder" class="${s.opened[4] ? 'open' : ''}">
        <rect x="150" y="98" width="52" height="30" rx="2" fill="#8c6a3a" transform="rotate(-6 176 113)"/>
        <rect x="150" y="98" width="52" height="30" rx="2" fill="#a67c43" transform="rotate(-6 176 113) translate(0 -4)"/>
        <rect x="186" y="104" width="12" height="10" rx="1.5" fill="#333a44" stroke="#9aa0a8" transform="rotate(-6 176 113)"/>
        ${s.opened[4] ? '' : '<text x="192" y="111.5" font-size="5" fill="#dfe3e8" text-anchor="middle" transform="rotate(-6 176 113)">A·B·C·D</text>'}
      </g>
    </g>

    <!-- łóżko -->
    <g>
      <rect x="18" y="330" width="150" height="20" fill="#2a1d14"/>
      <rect x="22" y="346" width="142" height="60" fill="#6a2b2b"/>
      <path d="M22 346 h142 v18 q-71 10 -142 0z" fill="#8a3838"/>
      <rect x="30" y="334" width="52" height="16" rx="4" fill="#d9d2c0"/>
      <rect x="22" y="404" width="8" height="24" fill="#1a120b"/><rect x="156" y="404" width="8" height="24" fill="#1a120b"/>
    </g>

    <!-- biurko -->
    <g>
      <rect x="150" y="318" width="190" height="10" fill="#4a3320"/>
      <rect x="150" y="328" width="190" height="6" fill="#2d1e12"/>
      <rect x="156" y="334" width="10" height="90" fill="#2d1e12"/><rect x="324" y="334" width="10" height="90" fill="#2d1e12"/>
      <rect x="296" y="334" width="38" height="50" fill="#3a2817"/><circle cx="315" cy="358" r="2" fill="#c9a24a"/>
      <!-- lampa -->
      <circle cx="190" cy="270" r="110" fill="url(#lamp)" class="lampglow"/>
      <rect x="186" y="272" width="6" height="46" fill="#3b3b3b"/>
      <path d="M160 272 h60 l-10 -26 h-40z" fill="#c27a2b"/>
      <ellipse cx="190" cy="318" rx="18" ry="4" fill="#2b2b2b"/>
      <!-- laptop -->
      <rect x="212" y="276" width="70" height="44" rx="2" fill="#262a2f" transform="skewX(-6)"/>
      <rect x="216" y="280" width="62" height="36" fill="#1d3f55" transform="skewX(-6)" class="screen"/>
      <rect x="232" y="286" width="30" height="3" fill="#8fd3ff" opacity=".6" transform="skewX(-6)"/><rect x="232" y="294" width="40" height="3" fill="#8fd3ff" opacity=".4" transform="skewX(-6)"/>
      <rect x="210" y="318" width="80" height="4" fill="#33383e"/>
      <!-- list -->
      <g id="letter"><rect x="246" y="298" width="46" height="26" fill="#efe7d4" transform="rotate(8 269 311)"/><line x1="252" y1="306" x2="286" y2="310" stroke="#8a8070" stroke-width="1"/><line x1="252" y1="312" x2="282" y2="316" stroke="#8a8070" stroke-width="1"/></g>
      <!-- karty -->
      <g id="cards"><rect x="300" y="296" width="30" height="22" fill="#e9dcc0" transform="rotate(-10 315 307)"/><rect x="302" y="294" width="30" height="22" fill="#f3eee2" transform="rotate(-4 317 305)"/><text x="317" y="309" font-size="7" text-anchor="middle" fill="#7a5a30" font-family="Georgia" font-style="italic">zagadki</text></g>
      <!-- nokia -->
      <g id="nokia"><rect x="166" y="300" width="16" height="30" rx="4" fill="#2c3a6b" transform="rotate(-20 174 315)"/><rect x="169" y="304" width="10" height="8" fill="#9bb37a" transform="rotate(-20 174 315)"/></g>
    </g>

    <!-- walizka na stojaku -->
    <g id="suitcase" class="${s.opened[1] ? 'open' : ''}">
      <line x1="60" y1="470" x2="60" y2="530" stroke="#1a120b" stroke-width="4"/><line x1="170" y1="470" x2="170" y2="530" stroke="#1a120b" stroke-width="4"/>
      <line x1="48" y1="530" x2="72" y2="530" stroke="#1a120b" stroke-width="4"/><line x1="158" y1="530" x2="182" y2="530" stroke="#1a120b" stroke-width="4"/>
      <rect x="52" y="420" width="126" height="52" rx="6" fill="#5a3a24" stroke="#2a1a0e" stroke-width="2"/>
      <rect x="52" y="420" width="126" height="52" rx="6" fill="none" stroke="#7a5a3a" stroke-width="1" stroke-dasharray="3 3"/>
      <rect x="100" y="410" width="30" height="12" rx="4" fill="#3a2614"/>
      <!-- zamek szyfrowy -->
      <rect x="92" y="438" width="46" height="16" rx="2" fill="#2a2d31"/>
      ${[0,1,2].map(i => `<rect x="${96 + i * 14}" y="441" width="10" height="10" fill="#dfe3e8"/><text x="${101 + i * 14}" y="449" font-size="8" text-anchor="middle" font-family="Courier New" fill="#1d1a16">${s.opened[1] ? '334'[i] : '•'}</text>`).join('')}
      ${s.opened[1] ? '<path d="M52 420 h126 l-10 -40 h-106z" fill="#4a2e1a" stroke="#2a1a0e" stroke-width="2"/><rect x="62" y="400" width="106" height="20" fill="#2a1a0e"/><rect x="70" y="404" width="60" height="12" fill="#e9dcc0" transform="rotate(-3 100 410)"/>' : ''}
      <!-- karteczka -->
      <rect x="140" y="426" width="22" height="18" fill="#f5e27a" transform="rotate(6 151 435)"/>
    </g>

    <!-- drzwi na korytarz -->
    <g id="door" transform="translate(-14 0)">
      <rect x="334" y="250" width="56" height="140" fill="#2a1d14"/>
      <rect x="340" y="256" width="48" height="134" fill="#3f2d1d"/>
      <rect x="346" y="262" width="36" height="52" fill="#352515"/><rect x="346" y="322" width="36" height="60" fill="#352515"/>
      <circle cx="346" cy="330" r="3" fill="#c9a24a"/>
      <rect x="342" y="236" width="44" height="12" fill="#1d6b3a"/><text x="364" y="245" font-size="7" text-anchor="middle" fill="#dff6e6" font-family="Helvetica, Arial" letter-spacing="1">WYJŚCIE</text>
      <text x="364" y="272" font-size="9" text-anchor="middle" fill="#c9a24a" font-family="Helvetica, Arial" font-weight="700">404</text>
    </g>

    <!-- kurz -->
    <g class="dust">${Array.from({length: 18}, (_, i) => `<circle cx="${40 + (i * 37) % 320}" cy="${120 + (i * 53) % 300}" r="${1 + (i % 3) * .5}" fill="#f3e2b8" opacity=".35" style="animation-delay:${-(i * 1.3)}s"/>`).join('')}</g>

    <!-- hotspoty -->
    ${hs('letter', 269, 311, 22, 'List Karoliny')}
    ${hs('cards', 317, 305, 20, 'Karty zagadek')}
    ${hs('nokia', 174, 315, 16, 'Stara Nokia')}
    ${hs('lock1', 115, 446, 30, 'Walizka · zamek 1')}
    ${hs('lock4', 176, 112, 26, 'Teczka · zamek 4')}
    ${hs('lock5', 90, 270, 24, 'Sejf · zamek 5')}
    ${hs('goBasement', 364, 330, 30, 'Drzwi na korytarz')}
  </svg>`;

  /* ---------------- PIWNICA · KORYTARZ TECHNICZNY ---------------- */
  return { room };

})();
