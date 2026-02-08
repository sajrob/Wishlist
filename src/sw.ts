/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { createHandlerBoundToURL } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

// Offline fallback
const handler = createHandlerBoundToURL('/offline.html');
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

// Caching strategies
registerRoute(
    /^https:\/\/fonts\.googleapis\.com\/.*/i,
    new CacheFirst({
        cacheName: 'google-fonts-cache',
        plugins: [
            new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        ],
    })
);

registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    new CacheFirst({
        cacheName: 'images-cache',
        plugins: [
            new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
    })
);

registerRoute(
    /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }),
        ],
    })
);

// PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const notification = data.notification;

        const options = {
            body: notification.body,
            icon: notification.icon || '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            data: notification.data,
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'View' },
                { action: 'close', title: 'Dismiss' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(notification.title, options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window open with this URL
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

// BACKGROUND SYNC
self.addEventListener('sync', (event: any) => {
    if (event.tag === 'sync-pending-actions') {
        event.waitUntil(syncActions());
    }
});

async function syncActions() {
    const allClients = await self.clients.matchAll();
    allClients.forEach(client => {
        client.postMessage({ type: 'PROCESS_SYNC_QUEUE' });
    });
}

