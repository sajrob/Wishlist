/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { createHandlerBoundToURL } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

declare let self: ServiceWorkerGlobalScope;

console.log("Service Worker version: 2026.02.08.v4");

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

// Offline fallback - use a safer approach that doesn't require precaching
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: "navigation-cache",
  }),
  {
    allowlist: [/^(?!\/__)/], // Allow all except Vite internals
  },
);
registerRoute(navigationRoute);

// Caching strategies
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: "google-fonts-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
);

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

registerRoute(
  /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  }),
);

// NOTIFICATION QUEUE - Store notifications received while app is offline
const NOTIFICATION_QUEUE_STORE = "notification-queue";

interface QueuedNotification {
  id: string;
  title: string;
  options: NotificationOptions;
  timestamp: number;
}

async function getNotificationQueue(): Promise<QueuedNotification[]> {
  const db = await openDB();
  const tx = db.transaction(NOTIFICATION_QUEUE_STORE, "readonly");
  const store = tx.objectStore(NOTIFICATION_QUEUE_STORE);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addToNotificationQueue(
  notification: QueuedNotification,
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(NOTIFICATION_QUEUE_STORE, "readwrite");
  const store = tx.objectStore(NOTIFICATION_QUEUE_STORE);
  return new Promise((resolve, reject) => {
    const request = store.add(notification);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clearNotificationQueue(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(NOTIFICATION_QUEUE_STORE, "readwrite");
  const store = tx.objectStore(NOTIFICATION_QUEUE_STORE);
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("me-list-notifications", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(NOTIFICATION_QUEUE_STORE)) {
        db.createObjectStore(NOTIFICATION_QUEUE_STORE, { keyPath: "id" });
      }
    };
  });
}

async function displayQueuedNotifications(): Promise<void> {
  const queue = await getNotificationQueue();
  if (queue.length === 0) return;

  console.log(`[Push] Displaying ${queue.length} queued notifications`);

  for (const notification of queue) {
    await self.registration.showNotification(
      notification.title,
      notification.options,
    );
  }

  await clearNotificationQueue();
}

// PUSH NOTIFICATIONS
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const notification = data.notification;

    const options = {
      body: notification.body,
      icon: notification.icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      data: notification.data,
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: "View" },
        { action: "close", title: "Dismiss" },
      ],
    };

    event.waitUntil(
      self.registration
        .showNotification(notification.title, options)
        .then(() => {
          console.log(`[Push] Notification displayed: ${notification.title}`);
        })
        .catch((err) => {
          console.error("[Push] Error displaying notification:", err);
          // Queue it if display fails (likely offline)
          addToNotificationQueue({
            id: `${Date.now()}-${Math.random()}`,
            title: notification.title,
            options: options,
            timestamp: Date.now(),
          });
        }),
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = event.notification.data?.url || "/";
  const notificationData = event.notification.data;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window open with similar path
        for (const client of windowClients) {
          const clientUrl = new URL(client.url);
          const pathMatch =
            clientUrl.pathname === urlToOpen ||
            clientUrl.pathname.startsWith(urlToOpen);

          if (pathMatch && "focus" in client) {
            // App is already open on this path, just focus it
            client.focus();
            // Send message to update if needed
            if (notificationData?.notification_id) {
              client.postMessage({
                type: "NOTIFICATION_CLICKED",
                notification_id: notificationData.notification_id,
                notification_type: notificationData.type,
              });
            }
            return;
          }
        }

        // App not open on this path, open window with navigation
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen).then((client) => {
            if (client && notificationData?.notification_id) {
              // Send message once window is ready
              setTimeout(() => {
                client?.postMessage({
                  type: "NOTIFICATION_CLICKED",
                  notification_id: notificationData.notification_id,
                  notification_type: notificationData.type,
                  url: urlToOpen,
                });
              }, 1000);
            }
          });
        }
      }),
  );
});

// BACKGROUND SYNC
self.addEventListener("sync", (event: any) => {
  if (event.tag === "sync-pending-actions") {
    event.waitUntil(syncActions());
  }
  if (event.tag === "display-queued-notifications") {
    event.waitUntil(displayQueuedNotifications());
  }
});

async function syncActions() {
  const allClients = await self.clients.matchAll();
  allClients.forEach((client) => {
    client.postMessage({ type: "PROCESS_SYNC_QUEUE" });
  });
}

// Check for queued notifications when service worker activates
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activated");
  event.waitUntil(
    displayQueuedNotifications().catch((err) => {
      console.error(
        "[SW] Error displaying queued notifications on activate:",
        err,
      );
    }),
  );
});

// Periodically check and display queued notifications every 30 seconds
setInterval(() => {
  displayQueuedNotifications().catch((err) => {
    console.error("[SW] Error in notification queue check:", err);
  });
}, 30000);
