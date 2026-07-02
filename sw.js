var CACHE = 'lena-v2';
var URLS = ['index.html', 'manifest.json', 'css/styles.css',
  'js/config.js', 'js/auth.js', 'js/database.js', 'js/ui.js', 'js/screens.js', 'js/pdf.js', 'js/dashboard.js', 'js/app.js'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(URLS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) { return r || fetch(e.request).catch(function() { return null; }); })
  );
});
