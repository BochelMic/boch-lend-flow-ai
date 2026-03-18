import './lib/compatibility-polyfill.ts'
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

// Basic Service Worker cleanup is now handled by the generic reset mechanism in ErrorBoundary
// if users experience "white screens", they can use the "Full Reset" button.
// Standard registration is handled in index.html for faster boot.
