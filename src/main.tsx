/**
 * Entry point for the React application.
 * Renders the root App component and initializes global styles and analytics.
 */
/// <reference types="vite-plugin-pwa/client" />
import React from "react";
import ReactDOM from "react-dom/client";
console.log("App version: 2026.02.08.v3");

import { Analytics } from "@vercel/analytics/react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient, persister } from "./lib/queryClient";
import "./index.css";
import App from "./App";

import { processSyncQueue } from "./lib/syncQueue";
import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

// Listen for sync messages from the Service Worker
if ("serviceWorker" in navigator) {
  // Register Service Worker using vite-plugin-pwa
  console.log("[SW] Starting service worker registration...");

  const updateSW = registerSW({
    onNeedRefresh() {
      console.log("[SW] New content available, please refresh.");
      toast("A new version is available", {
        description: "Click below to refresh the page.",
        action: {
          label: "Refresh",
          onClick: () => updateSW(true),
        },
        duration: Infinity,
      });
    },
    onOfflineReady() {
      console.log("[SW] App ready to work offline.");
    },
    onRegistered(registration) {
      console.log(
        "[SW] ✅ Service Worker registered successfully:",
        registration.scope,
      );
      // Manually check if we have a registration
      if (registration && registration.active) {
        console.log("[SW] Service Worker is ACTIVE");
      }
    },
    onRegisterError(error) {
      console.error("[SW] ❌ Service Worker registration error:", error);
    },
  });

  // Fallback: manually check registration after a delay
  setTimeout(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log(
          "[SW] ✅ Manual check found registration:",
          registration.scope,
        );
      } else {
        console.warn("[SW] ⚠️ No service worker registration found after 3s");
      }
    } catch (error) {
      console.error("[SW] ❌ Error checking registration:", error);
    }
  }, 3000);

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "PROCESS_SYNC_QUEUE") {
      processSyncQueue();
    }
  });

  // Also process queue on startup if online
  window.addEventListener("load", () => {
    if (navigator.onLine) {
      processSyncQueue();
    }
  });
} else {
  console.warn("[SW] Service workers are not supported in this browser");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
    <Analytics />
  </React.StrictMode>,
);
