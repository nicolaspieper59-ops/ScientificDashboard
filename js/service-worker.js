const CACHE_NAME = 'cockpit-cosmique-v1';
const FILES_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/cosmique.js',
  'js/capteurs.js',
  'js/ephemerides.js',
  'js/rituel.js',
  'js/partition.js',
  'js/performance.js',
  'sons/note-C.mp3',
  'sons/note-D.mp3',
  'sons/note-E.mp3',
  'sons/note-F.mp3',
  'sons/note-G.mp3',
  'sons/note-A.mp3',
  'sons/note-B.mp3',
  'sons/respiration.mp3',
  'sons/souterrain.mp3',
  'sons/lune.mp3',
  'sons/maree.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
