
  event.respondWith(caches.match(event.request).then((res) => res || fetch(event.request)));
});
