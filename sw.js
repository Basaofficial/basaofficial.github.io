/* bashlab service worker – sajt radi i offline. Samo za glavnu stranicu (ne dira igre/fit/armory). */
const V = 'bashlab-v12';
const CORE = ['./', 'index.html', 'assets/site.css?v=5', 'assets/site.js?v=8', 'assets/projects.js?v=10', 'manifest.webmanifest',
  'assets/icons/icon-192.png', 'assets/shots/armory-1.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  const own = u.origin === location.origin;
  // podaplikacije, APK i statistika idu uvijek na mrežu
  if (own && /^\/(igre|fit|bashtalk|armory|ne-ljuti-se|bash-electro|metar|zvucnik)\//.test(u.pathname)) return;
  if (/\.apk$/i.test(u.pathname) || u.hostname.endsWith('goatcounter.com') || u.hostname === 'gc.zgo.at' || u.hostname === 'api.github.com') return;
  // stranica: prvo mreža (svježe), pa keš ako si offline
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(k => k.put('./', c)); return res; }).catch(() => caches.match('./')));
    return;
  }
  // slike, css, js, fontovi: keš pa osvježi u pozadini
  if (own || /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(V).then(k => k.put(r, c)); } return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
