/* Rejestr gier: kolejność na liście w hubie. Każda gra ma folder games/<id>/ z content.js i scenes.js.
   minutes/difficulty to wartości bazowe (poziom „Detektyw”); poziomy trudności niżej modyfikują czas i kary. */
window.LEVELS = {
  easy:   { id: 'easy',   name: 'Aplikant', tag: 'łatwy',    time: +15, hintCost: 5,  freeFirstHint: true,  penMult: .5, cardTries: 3, strictFormat: false, pulse: true,
            desc: 'Więcej czasu, pierwsza podpowiedź do każdego zamka za darmo, kary o połowę mniejsze. Dla pierwszej ekipy i młodszych graczy.' },
  normal: { id: 'normal', name: 'Detektyw', tag: 'normalny', time: 0,   hintCost: 5,  freeFirstHint: false, penMult: 1,  cardTries: 3, strictFormat: false, pulse: true,
            desc: 'Tak, jak gra została zaprojektowana: zły kod pasujący do warunku kosztuje czas, podpowiedź +5 min albo karta zagadki.' },
  hard:   { id: 'hard',   name: 'Komisarz', tag: 'trudny',   time: -15, hintCost: 10, freeFirstHint: false, penMult: 1.5, cardTries: 2, strictFormat: true, pulse: false,
            desc: 'Mniej czasu, podpowiedź +10 min, każdy zły kod kosztuje (także niepasujący do warunku), punkty w scenach nie pulsują, a zamki bez klawiatury pomocniczej.' },
};
/* locked: gra za bramką (zaszyfrowana paczka, klucz z przepustki); demo: ma darmowe demo pierwszej sceny */
window.SHOP = {"url":"","items":{"pokoj-404":{"path":"pokoj-404.html","cena":29,"tytul":"Pokój 404","games":["pokoj-404"]},"przedzial-7":{"path":"przedzial-7.html","cena":29,"tytul":"Przedział 7","games":["przedzial-7"]},"ostatni-seans":{"path":"ostatni-seans.html","cena":29,"tytul":"Ostatni seans","games":["ostatni-seans"]},"pakiet-trylogia":{"path":"pakiet-trylogia.html","cena":69,"tytul":"Trylogia escape roomów","games":["pokoj-404","przedzial-7","ostatni-seans"]},"pakiet-komplet":{"path":"pakiet-komplet.html","cena":99,"tytul":"Komplet śledczego","games":["pokoj-404","przedzial-7","ostatni-seans"]}}}; /* generuje gry/build.js z katalogu sklepu */
window.GAMES = [
  { id: 'pokoj-404', no: '01', title: 'Pokój 404', eyebrow: 'Hotel „Centralny”, Łódź · 1998',
    sub: 'Autorka podcastu o zimnych sprawach zniknęła z pokoju 404. Zostawiła pięć zamków i jedno nagranie.',
    format: 'Klasyczny escape room', mech: 'Zamki szyfrowe, lustro, stara Nokia. Każdy kod wynika wprost z jednego dokumentu. Dobre na pierwszy raz.',
    minutes: 60, difficulty: 3, players: '2–6', theme: 'neon', legacyKey: 'pokoj404.v1', start: true, locked: true, demo: true },
  { id: 'przedzial-7', no: '02', title: 'Przedział 7', eyebrow: 'Pospieszny „Odra” · grudzień 1989',
    sub: 'Kurier z gotówką wsiadł do wagonu sypialnego we Wrocławiu. Do Szczecina nie dojechał. Stary konduktor wie dlaczego.',
    format: 'Zmysły i mechanika', mech: 'Pokrętła zamiast klawiatury, klucz telegraficzny do wystukania Morse’a, rozkład jazdy, dziurkacze. Włączcie dźwięk.',
    minutes: 75, difficulty: 4, players: '2–6', theme: 'snow', locked: true },
  { id: 'ostatni-seans', no: '03', title: 'Ostatni seans', eyebrow: 'Kino „Tęcza”, Zalesie · 1987',
    sub: 'Kierownik kina spadł ze schodów do kabiny projekcyjnej w trakcie czwartego aktu. Jutro kino idzie do rozbiórki.',
    format: 'Śledztwo dedukcyjne', mech: 'Plan sali do zaznaczania, liczenie kontrolek i złotówek, zeznania do porównania. Na końcu akt oskarżenia: kto, dlaczego, jaki dowód.',
    minutes: 90, difficulty: 5, players: '2–6', theme: 'beam', locked: true },
];
