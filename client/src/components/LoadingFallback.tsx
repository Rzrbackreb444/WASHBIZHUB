import { Loader2 } from "lucide-react";

export function LoadingFallback() {
  return (
    <div 
      className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      data-testid="loading-fallback"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-accent animate-spin" />
          <Loader2 className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-white/70 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function FullPageLoadingFallback() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      data-testid="fullpage-loading-fallback"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-accent animate-spin" />
          <Loader2 className="w-10 h-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-white/80 text-base font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingFallback;
