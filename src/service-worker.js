const cacheName = 'myna-offline-__PWA_BUILD_ID__';
const offlineUrl = new URL('offline.html', self.registration.scope).href;

self.addEventListener('install', event => {
    event.waitUntil(caches.open(cacheName).then(cache => cache.add(offlineUrl)));
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name.startsWith('myna-offline-') && name !== cacheName).map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener('message', event => {
    if (event.data === 'ACTIVATE_UPDATE') self.skipWaiting();
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    const scope = new URL(self.registration.scope);
    if (request.method !== 'GET' || request.mode !== 'navigate' || url.origin !== scope.origin ||
        (url.pathname !== scope.pathname && url.pathname !== `${scope.pathname}index.html`)) return;
    event.respondWith((async () => {
        try {
            return await fetch(request);
        } catch (error) {
            const cached = await caches.match(offlineUrl, { cacheName });
            if (cached) return cached;
            throw error;
        }
    })());
});
