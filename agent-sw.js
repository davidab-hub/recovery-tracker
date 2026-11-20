// Bounce app service worker: lets phones install the app and opens it fast.
// Bike data is never cached here - it always comes live from the server.
const CACHE = 'bounce-app-v3';
const SHELL = ['app.html', 'app.webmanifest', 'agent.html', 'followup.html', 'logo.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // Supabase, maps etc. go straight to the network
  // Network first, and always ask GitHub for the newest version; fall back to the saved copy when offline
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request)));
});

// ---------- 5:30 PM "0-1 day bikes to call" alerts (web push) ----------
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'Bounce Recovery', {
      body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'followup', renotify: true,
      requireInteraction: true, silent: false, vibrate: [400, 150, 400, 150, 800], data: { url: d.url || 'followup.html' } }),
    // a page that is already open plays a beep and reloads the list
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => cs.forEach(c => c.postMessage({ type: 'followup' })))]));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || 'followup.html', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const open = cs.find(c => c.url.split('#')[0] === url); if (open) return open.focus();
    return self.clients.openWindow(url);
  }));
});
