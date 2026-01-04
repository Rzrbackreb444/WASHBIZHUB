import { useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Google Analytics 4
export function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      console.warn('Google Analytics: VITE_GA_MEASUREMENT_ID not configured');
      return;
    }

    // Check if already loaded
    if (typeof window.gtag === 'function') {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      send_page_view: true
    });

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    console.log('Google Analytics initialized:', GA_MEASUREMENT_ID);
  }, [GA_MEASUREMENT_ID]);

  return null;
}

// Facebook Pixel
export function FacebookPixel() {
  const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;
  
  useEffect(() => {
    if (!FB_PIXEL_ID) {
      return;
    }

    // Check if already loaded
    if ((window as any).fbq) {
      return;
    }

    // Facebook Pixel initialization script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${FB_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    console.log('Facebook Pixel initialized:', FB_PIXEL_ID);
  }, [FB_PIXEL_ID]);

  return null;
}

// Track page views
export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    // Google Analytics pageview
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', measurementId, {
        page_path: location,
      });
    }

    // Facebook Pixel pageview (only if configured and initialized)
    const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID;
    if (fbPixelId && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [location]);
}

// Track conversions
export function trackConversion(eventName: string, data?: Record<string, any>) {
  // Google Analytics event
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, data);
  }

  // Facebook Pixel event (only if configured)
  const fbPixelId = import.meta.env.VITE_FB_PIXEL_ID;
  if (fbPixelId && typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, data);
  }
}

// E-commerce tracking helpers
export const trackProductView = (product: { asin: string; title: string; price?: number; category?: string }) => {
  trackConversion('view_item', {
    items: [{
      item_id: product.asin,
      item_name: product.title,
      price: product.price,
      item_category: product.category,
    }]
  });
};

export const trackAddToCart = (product: { asin: string; title: string; price?: number; quantity?: number }) => {
  trackConversion('add_to_cart', {
    value: product.price,
    currency: 'USD',
    items: [{
      item_id: product.asin,
      item_name: product.title,
      price: product.price,
      quantity: product.quantity || 1,
    }]
  });
};

export const trackPurchase = (orderId: string, value: number, items: any[]) => {
  trackConversion('purchase', {
    transaction_id: orderId,
    value: value,
    currency: 'USD',
    items: items
  });
};

export const trackLeadCapture = (source: string) => {
  trackConversion('generate_lead', {
    lead_source: source
  });
};
