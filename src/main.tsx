import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { router } from '@/app/router';
import { initLogging, installNavigationCapture, reactRootErrorOptions } from '@/shared/logging';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container element not found in index.html');
}

// Desktop activity log: on before the first render so nothing from startup is
// missed. A no-op in the browser.
if (initLogging()) {
  installNavigationCapture(router);
}

createRoot(container, reactRootErrorOptions).render(
  <StrictMode>
    <App />
  </StrictMode>
);
