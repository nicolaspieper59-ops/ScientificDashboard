const CACHE_NAME = 'cockpit-cosmique-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index.json',
  '/manifest.json',
  '/js/index.js',
  '/js/cycle.js',
  '/js/capteurs.js',
  '/js/solaire.js',
  '/js/lunaire.js',
  '/js/rituel.js',
  '/js/partition.js',
  '/js/performance.js',
  '/js/souterrainTotal.js',
  '/js/réveil.js',
  '/js/sync.js',
  '/js/constellation.js',
  '/js/chorégraphie.js',
  '/js/loader.js',
  '/js/cosmique.js',
  '/js/indicateur.js',
  '/audio/lever.mp3',
  '/audio/zenith.mp3',
  '/audio/coucher.mp3',
  '/audio/nouvelleLune.mp3',
  '/audio/pleineLune.mp3',
  '/audio/souterrain.mp3',
  '/audio/respiration.mp3'
];

// 📦 Installation
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// 🔁 Activation
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

// 🌐 Interception
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(res => res || fetch(evt.request))
  );
});
    
