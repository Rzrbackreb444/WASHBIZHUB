import { lazy, Suspense, useState, useEffect } from "react";
import { useLocation } from "wouter";

const AIChatWidget = lazy(() => import("@/components/AIChatWidget").then(m => ({ default: m.AIChatWidget })));

export function DeferredAIChatWidget() {
  const [location] = useLocation();
  const [shouldLoad, setShouldLoad] = useState(false);

  // Only show the floating chat widget on the Service Guy AI page
  const isServiceGuyPage = location === "/service-guy-ai";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isServiceGuyPage) return;

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
  }, [isServiceGuyPage]);

  // Don't render on any page except the Service Guy AI page
  if (!isServiceGuyPage || !shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <AIChatWidget />
    </Suspense>
  );
}
