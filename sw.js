// --- Firebase Cloud Messaging: handles push notifications that arrive while the app is closed ---
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAF-9YVymxHLztkG4dx1m35HpUx8UscdbE",
  authDomain: "jaldirewind.firebaseapp.com",
  projectId: "jaldirewind",
  storageBucket: "jaldirewind.firebasestorage.app",
  messagingSenderId: "237565993267",
  appId: "1:237565993267:web:597677255f7e577d5cde46"
});

const messaging = firebase.messaging();

// Backend sends data-only messages, so we show the notification ourselves (no duplicates)
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'JaldiRewind', {
    body: d.body || 'You have something waiting.',
    icon: './icon-192.png',
    data: { url: d.url || './' }
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for(const c of list){ if('focus' in c) return c.focus(); }
      return clients.openWindow(url);
    })
  );
});

// --- Offline caching (unchanged from before) ---
const CACHE_NAME = 'jaldirewind-v8';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
