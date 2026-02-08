/**
 * Entry point for the React application.
 * Renders the root App component and initializes global styles and analytics.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient, persister } from './lib/queryClient';
import './index.css';
import App from './App';

import { processSyncQueue } from './lib/syncQueue';

// Listen for sync messages from the Service Worker
if ('serviceWorker' in navigator) {
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


