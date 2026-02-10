const CACHE_NAME = "offrecord-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/shop.html",
  "/cart.html",
  "/contact.html",
  "/account.html",
  "/styles.css",
  "/script.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((res) => res || fetch(event.request)));
});
