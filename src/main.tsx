import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container element not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
