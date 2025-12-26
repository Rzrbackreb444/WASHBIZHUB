import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, MapPin, Zap, Shield, Award } from "lucide-react";

const CITIES = [
  "Dallas, TX", "Phoenix, AZ", "Atlanta, GA", "Chicago, IL", "Miami, FL",
  "Los Angeles, CA", "Denver, CO", "Seattle, WA", "Austin, TX", "Nashville, TN",
  "Charlotte, NC", "San Diego, CA", "Portland, OR", "Tampa, FL", "Columbus, OH"
];

const FIRST_NAMES = [
  "Mike", "Sarah", "James", "Lisa", "David", "Jennifer", "Robert", "Emily",
  "Michael", "Amanda", "Chris", "Jessica", "Brian", "Ashley", "Kevin", "Nicole"
];

const ACTIONS = [
  "just analyzed a location",
  "started their free trial",
  "ran a CLEANBI score",
  "downloaded the buyer's guide",
  "scheduled a consultation"
];

function generateNotification() {
  const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const minutesAgo = Math.floor(Math.random() * 15) + 1;
  return { name, city, action, minutesAgo };
}

interface LiveActivityNotificationProps {
  enabled?: boolean;
  interval?: number;
  position?: "bottom-left" | "bottom-right";
}

export function LiveActivityNotification({ 
  enabled = true, 
  interval = 45000,
  position = "bottom-left"
}: LiveActivityNotificationProps) {
  const [notification, setNotification] = useState<ReturnType<typeof generateNotification> | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const showNotification = () => {
      setNotification(generateNotification());
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    };

    const initialDelay = setTimeout(showNotification, 8000);
    const timer = setInterval(showNotification, interval);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(timer);
    };
  }, [enabled, interval]);

  const positionClasses = position === "bottom-left" 
    ? "left-4" 
    : "right-4";

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-20 ${positionClasses} z-40 max-w-xs`}
          data-testid="live-activity-notification"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {notification.name} from {notification.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.action}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {notification.minutesAgo} min ago
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface UrgencyBadgeProps {
  type: "spots" | "time" | "popular";
  value?: number;
  className?: string;
}

export function UrgencyBadge({ type, value, className = "" }: UrgencyBadgeProps) {
  const configs = {
    spots: {
      icon: Users,
      text: `Only ${value || 3} Pro spots left this month`,
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-300",
      borderColor: "border-amber-200 dark:border-amber-800"
    },
    time: {
      icon: Clock,
      text: "Limited time offer",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
      textColor: "text-rose-700 dark:text-rose-300",
      borderColor: "border-rose-200 dark:border-rose-800"
    },
    popular: {
      icon: TrendingUp,
      text: "Most popular choice",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      textColor: "text-emerald-700 dark:text-emerald-300",
      borderColor: "border-emerald-200 dark:border-emerald-800"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
      data-testid={`urgency-badge-${type}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{config.text}</span>
    </div>
  );
}

interface SocialProofCounterProps {
  metric: "users" | "analyses" | "savings" | "rating";
  animated?: boolean;
  className?: string;
}

export function SocialProofCounter({ metric, animated = true, className = "" }: SocialProofCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const configs = {
    users: {
      icon: Users,
      value: 2847,
      label: "Laundromat Owners",
      suffix: "+",
      color: "text-blue-600 dark:text-blue-400"
    },
    analyses: {
      icon: MapPin,
      value: 15420,
      label: "Locations Analyzed",
      suffix: "+",
      color: "text-emerald-600 dark:text-emerald-400"
    },
    savings: {
      icon: Shield,
      value: 47,
      label: "Million Saved",
      prefix: "$",
      suffix: "M+",
      color: "text-[#C8A661]"
    },
    rating: {
      icon: Award,
      value: 4.9,
      label: "Average Rating",
      suffix: "/5",
      color: "text-amber-500"
    }
  };

  const config = configs[metric];
  const Icon = config.icon;

  useEffect(() => {
    if (!animated) {
      setDisplayValue(config.value);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = config.value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= config.value) {
        setDisplayValue(config.value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [animated, config.value]);

  const formattedValue = metric === "rating" 
    ? displayValue.toFixed(1) 
    : displayValue.toLocaleString();

  return (
    <div className={`text-center ${className}`} data-testid={`social-proof-${metric}`}>
      <div className={`flex items-center justify-center gap-2 ${config.color}`}>
        <Icon className="w-5 h-5" />
        <span className="text-2xl md:text-3xl font-bold">
          {"prefix" in config && config.prefix}
          {formattedValue}
          {config.suffix}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{config.label}</p>
    </div>
  );
}

export function SocialProofBar({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-muted/30 border-y border-border/50 py-6 ${className}`} data-testid="social-proof-bar">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <SocialProofCounter metric="users" />
          <SocialProofCounter metric="analyses" />
          <SocialProofCounter metric="savings" />
          <SocialProofCounter metric="rating" />
        </div>
      </div>
    </div>
  );
}

interface TrustBadgesProps {
  variant?: "horizontal" | "grid";
  className?: string;
}

export function TrustBadges({ variant = "horizontal", className = "" }: TrustBadgesProps) {
  const badges = [
    { icon: Shield, text: "Bank-Level Security", color: "text-emerald-600 dark:text-emerald-400" },
    { icon: Award, text: "Industry Leader Since 2024", color: "text-[#C8A661]" },
    { icon: Users, text: "Trusted by 2,800+ Owners", color: "text-blue-600 dark:text-blue-400" },
  ];

  const containerClass = variant === "horizontal" 
    ? "flex flex-wrap items-center justify-center gap-4 md:gap-6"
    : "grid grid-cols-1 sm:grid-cols-3 gap-4";

  return (
    <div className={`${containerClass} ${className}`} data-testid="trust-badges">
      {badges.map((badge, index) => (
        <div 
          key={index} 
          className="flex items-center gap-2 text-sm"
        >
          <badge.icon className={`w-4 h-4 ${badge.color}`} />
          <span className="text-muted-foreground">{badge.text}</span>
        </div>
      ))}
    </div>
  );
}

export function RecentActivityFeed({ limit = 5, className = "" }: { limit?: number; className?: string }) {
  const [activities, setActivities] = useState<ReturnType<typeof generateNotification>[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: limit }, () => generateNotification());
    setActivities(initial);
  }, [limit]);

  return (
    <div className={`space-y-3 ${className}`} data-testid="recent-activity-feed">
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Recent Activity
      </h4>
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 text-sm py-2 border-b border-border/30 last:border-0"
          >
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                {activity.name[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-foreground">{activity.name}</span>
              <span className="text-muted-foreground"> {activity.action}</span>
            </div>
            <span className="text-xs text-muted-foreground/70 flex-shrink-0">
              {activity.minutesAgo}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LimitedOfferBanner({ 
  message = "Special Offer: Get 20% off Pro with code LAUNCH20",
  endDate,
  className = "" 
}: { 
  message?: string;
  endDate?: Date;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endDate) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Offer expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div 
      className={`bg-gradient-to-r from-[#C8A661]/20 to-[#C8A661]/10 border border-[#C8A661]/30 rounded-lg p-3 ${className}`}
      data-testid="limited-offer-banner"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <Badge variant="secondary" className="bg-[#C8A661] text-white">
          Limited Time
        </Badge>
        <span className="text-foreground font-medium">{message}</span>
        {timeLeft && (
          <span className="text-[#C8A661] font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {timeLeft}
          </span>
        )}
      </div>
    </div>
  );
}
