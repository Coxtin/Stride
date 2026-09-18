const CACHE_NAME = 'stride-cache-v1';

// Lista exactă cu fișierele aplicației tale care formează interfața
const urlsToCache = [
  './',
  './index.html',
  './main.css',
  './app.js',
  './stride-icon-192.png',
  './stride-icon-512.png'
];

// FAZA 1: Când instalezi aplicația, descarcă și bagă în "seif" (Cache) toate fișierele de mai sus
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Fișierele au fost salvate în cache pentru modul offline!');
        return cache.addAll(urlsToCache);
      })
  );
});

// FAZA 2: Când deschizi aplicația, interceptează orice cerere către aceste fișiere
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Dacă fișierul există în Cache, dă-l direct de acolo (super rapid, merge offline)
        if (response) {
          return response;
        }
        // Dacă nu e în Cache (de ex. faci fetch la API-ul GitHub), mergi pe internet normal
        return fetch(event.request);
      })
  );
});