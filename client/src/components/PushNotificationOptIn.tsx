import { useState, useEffect } from "react";
import { Bell, BellRing, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const NOTIFICATION_KEY = "washbizhub_notification_prefs";

interface NotificationPrefs {
  enabled: boolean;
  newListings: boolean;
  priceDrops: boolean;
  subscribedAt?: string;
  email?: string;
}

function getNotificationPrefs(): NotificationPrefs | null {
  try {
    const stored = localStorage.getItem(NOTIFICATION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveNotificationPrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(prefs));
}

export function PushNotificationOptIn() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const prefs = getNotificationPrefs();
    if (prefs?.enabled) {
      setIsSubscribed(true);
    } else {
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem("notification_banner_dismissed");
        if (!dismissed) {
          setShowBanner(true);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support push notifications. Try Chrome or Firefox.",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        const prefs: NotificationPrefs = {
          enabled: true,
          newListings: true,
          priceDrops: true,
          subscribedAt: new Date().toISOString()
        };
        saveNotificationPrefs(prefs);
        setIsSubscribed(true);
        setShowBanner(false);
        setIsVisible(false);
        
        new Notification("WashBizHub Notifications Enabled", {
          body: "You'll now receive alerts for new listings and price drops!",
          icon: "/favicon.ico"
        });
        
        toast({
          title: "Notifications Enabled!",
          description: "You'll receive alerts for new listings and price drops."
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Enable notifications in your browser settings to receive alerts.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Notification error:", error);
      toast({
        title: "Something went wrong",
        description: "Unable to enable notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("notification_banner_dismissed", "true");
  };

  if (isSubscribed) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="relative"
        onClick={() => setIsVisible(!isVisible)}
        data-testid="button-notification-subscribed"
      >
        <BellRing className="w-5 h-5 text-primary" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
      </Button>
    );
  }

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5" data-testid="notification-banner">
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm">Get Listing Alerts</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 shrink-0"
                      onClick={handleDismissBanner}
                      data-testid="button-dismiss-banner"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Be the first to know when new laundromats hit the market.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSubscribe}
                      className="flex-1"
                      data-testid="button-enable-notifications"
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Enable Alerts
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDismissBanner}
                      data-testid="button-maybe-later"
                    >
                      Later
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsVisible(!isVisible)}
        className="relative"
        data-testid="button-notification-bell"
      >
        <Bell className="w-5 h-5" />
      </Button>

      {isVisible && !isSubscribed && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50" data-testid="notification-dropdown">
          <Card className="shadow-lg border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-primary" />
                <p className="font-semibold">Listing Alerts</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant notifications when new laundromats are listed or prices drop.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>New listings in your area</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Price drop alerts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Exclusive deals & opportunities</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSubscribe}
                data-testid="button-subscribe-notifications"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export function NotificationBell() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const prefs = getNotificationPrefs();
    setIsSubscribed(!!prefs?.enabled);
  }, []);

  if (isSubscribed) {
    return (
      <Badge variant="outline" className="gap-1 text-xs bg-green-500/10 text-green-600 border-green-500/30">
        <BellRing className="w-3 h-3" />
        Alerts On
      </Badge>
    );
  }

  return null;
}
