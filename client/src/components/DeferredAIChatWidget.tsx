import { lazy, Suspense, useState, useEffect } from "react";

const AIChatWidget = lazy(() => import("@/components/AIChatWidget").then(m => ({ default: m.AIChatWidget })));

export function DeferredAIChatWidget() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadWidget = () => {
      setShouldLoad(true);
    };

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(loadWidget, { timeout: 4000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const timer = setTimeout(loadWidget, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <AIChatWidget />
    </Suspense>
  );
}
