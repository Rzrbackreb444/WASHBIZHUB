import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
  onlineMessage?: string;
  offlineMessage?: string;
  position?: "top" | "bottom";
  autoHideDelay?: number;
}

export function OfflineIndicator({
  className,
  showWhenOnline = true,
  onlineMessage = "You're back online",
  offlineMessage = "You're offline. Some features may be unavailable.",
  position = "top",
  autoHideDelay = 3000,
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline && showWhenOnline) {
        setShowOnlineMessage(true);
        setTimeout(() => {
          setShowOnlineMessage(false);
        }, autoHideDelay);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowOnlineMessage(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline, showWhenOnline, autoHideDelay]);

  const showBanner = !isOnline || showOnlineMessage;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: position === "top" ? -48 : 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === "top" ? -48 : 48 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "fixed left-0 right-0 z-[100] flex items-center justify-center px-4 py-2.5",
            position === "top" ? "top-0" : "bottom-0",
            isOnline
              ? "bg-emerald-600 dark:bg-emerald-700"
              : "bg-[#1e3a5f]",
            className
          )}
          role="status"
          aria-live="polite"
          data-testid="offline-indicator"
        >
          <div
            className="flex items-center gap-2.5 text-white text-sm font-medium"
            data-testid={
              isOnline ? "offline-indicator-online" : "offline-indicator-offline"
            }
          >
            {isOnline ? (
              <>
                <Wifi
                  className="h-4 w-4 flex-shrink-0"
                  data-testid="offline-indicator-wifi-icon"
                />
                <span>{onlineMessage}</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <WifiOff
                    className="h-4 w-4 flex-shrink-0"
                    data-testid="offline-indicator-wifi-off-icon"
                  />
                </motion.div>
                <span>{offlineMessage}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

export type { OfflineIndicatorProps, UseOnlineStatusReturn };
