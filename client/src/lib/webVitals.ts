import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

const VITALS_ENDPOINT = '/api/seo/vitals';

function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
    url: window.location.href,
    connection: (navigator as any).connection?.effectiveType,
  };

  const jsonString = JSON.stringify(body);
  const blob = new Blob([jsonString], { type: 'application/json' });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(VITALS_ENDPOINT, blob);
  } else {
    fetch(VITALS_ENDPOINT, {
      method: 'POST',
      body: jsonString,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  }
}

export function initWebVitals() {
  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onFID(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (e) {
    console.warn('Web Vitals initialization failed:', e);
  }
}
