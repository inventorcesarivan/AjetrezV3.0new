self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
// Optional: pass-through fetch keeps it simple
self.addEventListener('fetch', () => {});