/**
 * Entry point for the React application.
 * Renders the root App component and initializes global styles and analytics.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
console.log('App version: 2026.02.08.v3');

import { Analytics } from '@vercel/analytics/react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient, persister } from './lib/queryClient';
import './index.css';
import App from './App';

import { processSyncQueue } from './lib/syncQueue';
import { registerSW } from 'virtual:pwa-register';

// Listen for sync messages from the Service Worker
if ('serviceWorker' in navigator) {
  // Register Service Worker using vite-plugin-pwa
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log('New content available, please refresh.');
    },
    onOfflineReady() {
      console.log('App ready to work offline.');
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    }
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'PROCESS_SYNC_QUEUE') {
      processSyncQueue();
    }
  });

  // Also process queue on startup if online
  window.addEventListener('load', () => {
    if (navigator.onLine) {
      processSyncQueue();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
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


