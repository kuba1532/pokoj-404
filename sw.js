/* Teczka Śledcza · service worker: najpierw sieć, potem cache (offline działa, aktualizacje wchodzą od razu). V i FILES ustawia gry/build.js. */
const V = 'teczka-esc-42cab585dd';
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./engine/styles.css", "./engine/engine.js", "./engine/hub.js", "./engine/loader.js", "./games/registry.js", "./games/keys.json", "./games/pokoj-404/pack.json", "./games/przedzial-7/pack.json", "./games/ostatni-seans/pack.json", "./games/pokoj-404/demo.js"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(V).then(c => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
