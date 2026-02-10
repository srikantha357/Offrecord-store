const CACHE_NAME = 'offrecord-cache-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/shop.html',
  '/cart.html',
  '/about.html',
  '/contact.html',
  '/account.html',
  '/success.html',
  '/styles.css',
  '/script.js',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((res) => res || fetch(event.request)));
});
