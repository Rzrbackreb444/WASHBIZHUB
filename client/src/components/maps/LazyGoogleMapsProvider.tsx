import { lazy, Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

const APIProviderInner = lazy(() =>
  import("@vis.gl/react-google-maps").then((m) => ({ default: m.APIProvider }))
);

interface LazyGoogleMapsProviderProps {
  children: ReactNode;
}

export function LazyGoogleMapsProvider({ children }: LazyGoogleMapsProviderProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <APIProviderInner apiKey={apiKey}>{children}</APIProviderInner>
    </Suspense>
  );
}
