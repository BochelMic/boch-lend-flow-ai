import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Deployment trigger comment

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length > 0) {
        for (let registration of registrations) {
          await registration.unregister();
          console.log('SW agressivamente desregistrado.');
        }

        // Também apagar caches
        const cacheKeys = await caches.keys();
        for (let key of cacheKeys) {
          await caches.delete(key);
        }

        // Fazer reload forçado apenas uma vez por sessão
        if (!sessionStorage.getItem('sw_purged')) {
          sessionStorage.setItem('sw_purged', 'true');
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Erro ao desregistrar SW:', err);
    }
  });
}
