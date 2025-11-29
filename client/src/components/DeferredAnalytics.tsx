import { useEffect, useState } from "react";
import { GoogleAnalytics, FacebookPixel } from "./Analytics";

declare global {
  interface Window {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  }
}

export default function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      const id = window.requestIdleCallback(() => setShouldLoad(true), { timeout: 3000 });
      return () => {
        if (window.cancelIdleCallback) {
          window.cancelIdleCallback(id);
        }
      };
    } else {
      const timer = setTimeout(() => setShouldLoad(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      <GoogleAnalytics />
      <FacebookPixel />
    </>
  );
}
