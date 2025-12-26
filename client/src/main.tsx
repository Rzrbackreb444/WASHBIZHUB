import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initWebVitals } from "./lib/webVitals";

console.log('[WashBizHub] Main.tsx loading...');

try {
  initWebVitals();
  console.log('[WashBizHub] WebVitals initialized');
} catch (e) {
  console.error('[WashBizHub] WebVitals init error:', e);
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

console.log('[WashBizHub] About to mount React app...');
const rootElement = document.getElementById("root");
console.log('[WashBizHub] Root element:', rootElement);

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    console.log('[WashBizHub] Root created, rendering App...');
    root.render(<App />);
    console.log('[WashBizHub] App rendered');
  } catch (e) {
    console.error('[WashBizHub] React mount error:', e);
    rootElement.innerHTML = `<div style="color: white; padding: 20px;">React Mount Error: ${e}</div>`;
  }
} else {
  console.error('[WashBizHub] Root element not found!');
}
