import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/Focus-Flow/sw.js', { scope: '/Focus-Flow/', updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch((err) => console.warn('Service worker registration failed', err));
  });
}
